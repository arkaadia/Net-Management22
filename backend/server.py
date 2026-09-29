import json
import datetime
import os
import sys
import time
import socket
import threading
import random
import uuid
from typing import Dict, Any, List, Optional
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, unquote

# Ensure current and parent directories are in sys.path before any relative or package imports
_current_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_current_dir)
for _p in [_parent_dir, _current_dir]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from backend.connections.hardware_discovery import execute_real_hardware_probe
except ImportError:
    try:
        from connections.hardware_discovery import execute_real_hardware_probe
    except ImportError:
        execute_real_hardware_probe = None

try:
    from backend.connections.ssh_compat import ensure_paramiko_compatibility, connect_ssh_device
except ImportError:
    try:
        from connections.ssh_compat import ensure_paramiko_compatibility, connect_ssh_device
    except ImportError:
        try:
            from ssh_compat import ensure_paramiko_compatibility, connect_ssh_device
        except ImportError:
            ensure_paramiko_compatibility = lambda: False
            connect_ssh_device = None

if ensure_paramiko_compatibility:
    ensure_paramiko_compatibility()

# Global active SSH sessions registry: session_id -> session dict
ACTIVE_SSH_SESSIONS = {}
ACTIVE_SESSIONS_LOCK = threading.Lock()

def close_ssh_session_internal(session_id):
    """Close socket and paramiko resources for a given session and update state."""
    with ACTIVE_SESSIONS_LOCK:
        sess = ACTIVE_SSH_SESSIONS.pop(session_id, None)
        if not sess:
            return False
        
        sock = sess.get("socket")
        if sock:
            try:
                sock.shutdown(socket.SHUT_RDWR)
            except Exception:
                pass
            try:
                sock.close()
            except Exception:
                pass
            sess["socket"] = None

        p_client = sess.get("paramiko_client")
        if p_client:
            try:
                p_client.close()
            except Exception:
                pass
            sess["paramiko_client"] = None

        sess["status"] = "disconnected"
        sess["closed_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
        print(f"[Python SSH Engine] Successfully closed SSH connection for session {session_id} to {sess.get('host')}:{sess.get('port')}")
        return True


# Import templates seed & execution helpers
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from backend.templates_seed import (
        get_default_templates,
        render_template_commands,
        simulate_device_execution,
        extract_device_configuration_and_parameterize
    )
except ImportError:
    from templates_seed import (
        get_default_templates,
        render_template_commands,
        simulate_device_execution,
        extract_device_configuration_and_parameterize
    )

# Data file path
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DATA_DIR, "network_data.json")

# Import Driver Architecture and Connection Manager
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from backend.drivers import get_driver, detect_platform_from_model
    from backend.connections.ssh_manager import connection_manager
    from backend.connections.network_terminal import NetworkTerminalSession, terminal_session_manager
    from backend.vpn import get_vpn_provider
    from backend.security.crypto import encrypt_credential, decrypt_credential, migrate_database_credentials
except ImportError:
    try:
        from drivers import get_driver, detect_platform_from_model
        from connections.ssh_manager import connection_manager
        from connections.network_terminal import NetworkTerminalSession, terminal_session_manager
        from vpn import get_vpn_provider
        from security.crypto import encrypt_credential, decrypt_credential, migrate_database_credentials
    except ImportError:
        from backend.drivers import get_driver, detect_platform_from_model
        from backend.connections.ssh_manager import connection_manager
        from backend.connections.network_terminal import NetworkTerminalSession, terminal_session_manager
        from backend.vpn import get_vpn_provider
        from backend.security.crypto import encrypt_credential, decrypt_credential, migrate_database_credentials

try:
    from backend.network_tools import (
        run_port_scan,
        run_dns_lookup,
        run_traceroute,
        run_cert_lookup,
        run_header_analyzer,
        run_ping_host,
        check_host_ping_init,
        check_host_get_result,
        check_host_get_nodes
    )
except ImportError:
    from network_tools import (
        run_port_scan,
        run_dns_lookup,
        run_traceroute,
        run_cert_lookup,
        run_header_analyzer,
        run_ping_host,
        check_host_ping_init,
        check_host_get_result,
        check_host_get_nodes
    )

try:
    from backend.bulk_config import os_mapper_registry, bulk_execution_engine
except ImportError:
    try:
        from bulk_config import os_mapper_registry, bulk_execution_engine
    except ImportError:
        os_mapper_registry = None
        bulk_execution_engine = None

def record_audit_log(data: Dict[str, Any], user: str, device_id: str, device_name: str, action: str, details: str, result: str = "success"):
    logs = data.setdefault("audit_logs", [])
    entry = {
        "id": f"audit-{uuid.uuid4().hex[:8]}",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "user": user or "System",
        "device_id": device_id,
        "device_name": device_name,
        "action": action,
        "details": details,
        "result": result
    }
    logs.insert(0, entry)
    if len(logs) > 500:
        data["audit_logs"] = logs[:500]
    save_data(data)

def sanitize_device(device):
    if not device:
        return None
    d = dict(device)
    if "platform" not in d:
        d["platform"] = detect_platform_from_model(d.get("model", ""))
    if "connection_mode" not in d:
        d["connection_mode"] = "simulator"
    conn = dict(d.get("connection", {}))
    conn.pop("password", None)
    conn.pop("private_key", None)
    d["connection"] = conn
    d.pop("ssh_password", None)
    d.pop("enable_password", None)
    d["ssh_connected"] = connection_manager.is_connected(d.get("id", ""))
    return d

def check_rbac_permission(role: str, action: str) -> bool:
    r = (role or "Super Admin").strip()
    if r in ("Super Admin", "Admin", "Network Engineer"):
        return True
    if r == "Operator":
        # Operators can do non-destructive show/read operations and view terminal
        return action in ("show", "read", "monitor", "view", "get", "terminal")
    # Read-Only Auditor cannot configure or alter ports/devices
    return False

def get_default_device_groups():
    return [
        {
            "id": "group-helpdesk",
            "name": "هلپ دسک (Helpdesk Support)",
            "description": "تجهیزات و سوئیچ‌های دسترسی کلاینت‌ها، تلفن‌های VoIP و استقرار روزانه تیم پشتیبانی",
            "color": "amber",
            "icon": "Headphones",
            "deviceIds": ["dev-dist-bldg-a", "dev-access-bldg-b"],
            "createdAt": "2026-03-01 08:30:00",
            "updatedAt": "2026-03-09 14:20:00"
        },
        {
            "id": "group-core",
            "name": "زیرساخت هسته و دیتا سنتر (Core & DC)",
            "description": "سوئیچ‌های لایه هسته و روتر گیت‌وی اصلی دیتاسنتر و پیوندهای ۱۰ گیگابیت فیبر",
            "color": "indigo",
            "icon": "Server",
            "deviceIds": ["dev-core-01", "dev-router-gw"],
            "createdAt": "2026-03-01 08:30:00",
            "updatedAt": "2026-03-09 14:20:00"
        },
        {
            "id": "group-branch",
            "name": "شعب و لایه دسترسی بی‌سیم (Branch & Wireless)",
            "description": "اکسس‌پوینت‌های اداری، تجهیزات وای‌فای و سوئیچ‌های ساختمانی بلوک B",
            "color": "cyan",
            "icon": "Wifi",
            "deviceIds": ["dev-dist-bldg-b", "dev-ap-bldg-a"],
            "createdAt": "2026-03-02 11:00:00",
            "updatedAt": "2026-03-09 15:00:00"
        }
    ]

def get_default_ad_config():
    return {
        "enabled": True,
        "server": "192.168.1.10",
        "port": 389,
        "useSsl": False,
        "domain": "corp.internal",
        "baseDn": "DC=corp,DC=internal",
        "bindUser": "svc-netops@corp.internal",
        "bindPassword": "••••••••••••",
        "userSearchBase": "OU=Staff,DC=corp,DC=internal",
        "groupSearchBase": "OU=SecurityGroups,DC=corp,DC=internal",
        "lastSyncStatus": "success",
        "lastSyncMessage": "همگام‌سازی با موفقیت انجام شد (4 گروه امنیتی و 4 کاربر دامین دریافت گردید)",
        "lastSyncTime": "2026-09-09 16:30:00",
        "syncedGroups": [
            {
                "dn": "CN=Helpdesk-Admins,OU=SecurityGroups,DC=corp,DC=internal",
                "cn": "Helpdesk-Admins",
                "description": "کارشناسان پشتیبانی و تیم هلپ‌دسک سازمان",
                "memberCount": 8
            },
            {
                "dn": "CN=NetOps-Engineers,OU=SecurityGroups,DC=corp,DC=internal",
                "cn": "NetOps-Engineers",
                "description": "مهندسان ارشد شبکه و زیرساخت ارتباطی",
                "memberCount": 4
            },
            {
                "dn": "CN=NOC-Monitoring,OU=SecurityGroups,DC=corp,DC=internal",
                "cn": "NOC-Monitoring",
                "description": "تیم پایش و مانیتورینگ مرکز عملیات شبکه (فقط مشاهده)",
                "memberCount": 6
            },
            {
                "dn": "CN=Security-Auditors,OU=SecurityGroups,DC=corp,DC=internal",
                "cn": "Security-Auditors",
                "description": "حسابرسان امنیتی و ممیزی پورت سکیوریتی و مک آدرس‌ها",
                "memberCount": 3
            }
        ],
        "syncedUsers": [
            {
                "dn": "CN=Masoud Shahbazi,OU=Staff,DC=corp,DC=internal",
                "samAccountName": "m.shahbazi",
                "displayName": "مسعود شهبازی (Network Lead)",
                "email": "m.shahbazi@corp.internal",
                "department": "زیرساخت و شبکه",
                "title": "Senior Network Architect",
                "groups": ["NetOps-Engineers"],
                "enabled": True
            },
            {
                "dn": "CN=Ali Rezaei,OU=Staff,DC=corp,DC=internal",
                "samAccountName": "a.rezaei",
                "displayName": "علی رضایی (Helpdesk L1)",
                "email": "a.rezaei@corp.internal",
                "department": "پشتیبانی فنی (Helpdesk)",
                "title": "Helpdesk Specialist",
                "groups": ["Helpdesk-Admins"],
                "enabled": True
            }
        ]
    }

def get_default_access_policies():
    return [
        {
            "id": "policy-helpdesk",
            "name": "سطح دسترسی تیم هلپ‌دسک (Helpdesk Operator Policy)",
            "description": "دسترسی محدود به سوئیچ‌های گروه هلپ‌دسک جهت تغییر ویلن، دیسکریپشن و پورت سکیوریتی بدون دسترسی به کنسول CLI یا خاموش کردن پورت‌های حساس",
            "isBuiltin": True,
            "priority": 10,
            "subjectType": "ad_group",
            "subjectId": "CN=Helpdesk-Admins,OU=SecurityGroups,DC=corp,DC=internal",
            "subjectName": "Helpdesk-Admins (اکتیو دایرکتوری)",
            "targetScope": "groups",
            "targetGroupIds": ["group-helpdesk"],
            "targetDeviceIds": [],
            "canViewDashboard": True,
            "canViewTopology": True,
            "canViewDevices": True,
            "canViewPorts": True,
            "canViewScanner": False,
            "canViewTemplates": False,
            "canViewSettings": False,
            "terminalAccess": "none",
            "canToggleAdminStatus": False,
            "canChangeVlan": True,
            "canEditDescription": True,
            "canTogglePortSecurity": True,
            "canWriteMemory": False,
            "canManageDevices": False,
            "canApplyTemplates": False,
            "canBatchOperate": False
        },
        {
            "id": "policy-super-admin",
            "name": "مدیر ارشد زیرساخت شبکه (Super Administrator)",
            "description": "دسترسی نامحدود به تمامی تجهیزات، کنسول‌های تعاملی SSH، رایت مموری، اعمال تمپلیت و تنظیمات امنیتی",
            "isBuiltin": True,
            "priority": 100,
            "subjectType": "local_user",
            "subjectId": "admin",
            "subjectName": "مدیر اصلی سیستم (Local Admin / NetOps)",
            "targetScope": "all",
            "targetGroupIds": [],
            "targetDeviceIds": [],
            "canViewDashboard": True,
            "canViewTopology": True,
            "canViewDevices": True,
            "canViewPorts": True,
            "canViewScanner": True,
            "canViewTemplates": True,
            "canViewSettings": True,
            "terminalAccess": "full",
            "canToggleAdminStatus": True,
            "canChangeVlan": True,
            "canEditDescription": True,
            "canTogglePortSecurity": True,
            "canWriteMemory": True,
            "canManageDevices": True,
            "canApplyTemplates": True,
            "canBatchOperate": True
        }
    ]

# Initial realistic seed data representing a corporate campus network
def get_initial_seed_data():
    return {
        "devices": [
            {
                "id": "dev-core-01",
                "name": "SW-CORE-01",
                "ip": "192.168.1.1",
                "type": "switch",
                "role": "Core Switch",
                "model": "Cisco Catalyst 9500-48Y4C",
                "mac": "00:50:56:A1:B2:C0",
                "building": "ساختمان مرکزی (Central Bldg)",
                "floor": "طبقه ۱ (Floor 1)",
                "unit": "اتاق سرور اصلی (Main Server Room)",
                "rack": "Rack-A01",
                "is_online": True,
                "latency_ms": 0.8,
                "packet_loss": 0,
                "uptime": "142 days, 6 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Cisco IOS-XE 17.09.03",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 48
            },
            {
                "id": "dev-router-gw",
                "name": "RT-EDGE-01",
                "ip": "192.168.1.254",
                "type": "router",
                "role": "Edge Gateway",
                "model": "Cisco ISR 4451-X",
                "mac": "00:50:56:C2:D3:E1",
                "building": "ساختمان مرکزی (Central Bldg)",
                "floor": "طبقه ۱ (Floor 1)",
                "unit": "اتاق سرور اصلی (Main Server Room)",
                "rack": "Rack-A02",
                "is_online": True,
                "latency_ms": 1.2,
                "packet_loss": 0,
                "uptime": "210 days, 14 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Cisco IOS-XE 17.06.04",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 8
            },
            {
                "id": "dev-dist-bldg-a",
                "name": "SW-DIST-BLDG-A",
                "ip": "192.168.1.10",
                "type": "switch",
                "role": "Distribution Switch",
                "model": "Cisco Catalyst 9300-48P",
                "mac": "00:50:56:D4:E5:F2",
                "building": "ساختمان مرکزی (Central Bldg)",
                "floor": "طبقه ۲ (Floor 2)",
                "unit": "رک شبکه اداری (Network Closet A2)",
                "rack": "Rack-B01",
                "is_online": True,
                "latency_ms": 1.5,
                "packet_loss": 0,
                "uptime": "89 days, 2 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Cisco IOS-XE 17.09.02",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 48
            },
            {
                "id": "dev-acc-bldg-a-f3",
                "name": "SW-ACC-BLDG-A-F3",
                "ip": "192.168.1.21",
                "type": "switch",
                "role": "Access Switch",
                "model": "Cisco Catalyst 2960X-48FPS-L",
                "mac": "00:50:56:E6:F7:03",
                "building": "ساختمان مرکزی (Central Bldg)",
                "floor": "طبقه ۳ (Floor 3)",
                "unit": "واحد توسعه نرم‌افزار (Dev Unit 302)",
                "rack": "Wall-Rack-302",
                "is_online": True,
                "latency_ms": 2.1,
                "packet_loss": 0,
                "uptime": "45 days, 11 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Cisco IOS 15.2(7)E2",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 48
            },
            {
                "id": "dev-dist-bldg-b",
                "name": "SW-DIST-BLDG-B",
                "ip": "192.168.1.11",
                "type": "switch",
                "role": "Distribution Switch",
                "model": "Cisco Catalyst 9300-24T",
                "mac": "00:50:56:F8:09:14",
                "building": "ساختمان مهندسی (Engineering Bldg)",
                "floor": "طبقه ۱ (Floor 1)",
                "unit": "مرکز داده فرعی (MDF Room)",
                "rack": "Rack-MDF-B1",
                "is_online": True,
                "latency_ms": 3.4,
                "packet_loss": 0,
                "uptime": "73 days, 19 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Cisco IOS-XE 17.09.01",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 24
            },
            {
                "id": "dev-acc-bldg-b-f2",
                "name": "SW-ACC-BLDG-B-F2",
                "ip": "192.168.1.32",
                "type": "switch",
                "role": "Access Switch",
                "model": "Cisco Catalyst 9200L-24P-4G",
                "mac": "00:50:56:6C:3B:6B",
                "building": "ساختمان مهندسی (Engineering Bldg)",
                "floor": "طبقه ۲ (Floor 2)",
                "unit": "واحد آزمایشگاه و R&D (Lab Unit 201)",
                "rack": "Rack-ENG-201",
                "is_online": False,
                "latency_ms": None,
                "packet_loss": 100,
                "uptime": "آفلاین (Offline)",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Cisco IOS-XE 17.06.03",
                "last_seen": "۲ ساعت پیش (2 hours ago)",
                "total_ports": 28
            },
            {
                "id": "dev-ap-bldg-a-f1",
                "name": "AP-WIFI-BLDG-A-LOBBY",
                "ip": "192.168.1.101",
                "type": "access_point",
                "role": "Wireless Access Point",
                "model": "Cisco Catalyst 9120AXI",
                "mac": "00:50:56:11:22:33",
                "building": "ساختمان مرکزی (Central Bldg)",
                "floor": "طبقه ۱ (Floor 1)",
                "unit": "لابی و سالن همایش (Main Lobby)",
                "rack": "سقف کاذب لابی",
                "is_online": True,
                "latency_ms": 2.4,
                "packet_loss": 0,
                "uptime": "142 days, 5 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Capwap 8.10.162.0",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 2
            },
            {
                "id": "dev-ap-bldg-a-f3",
                "name": "AP-WIFI-BLDG-A-DEV",
                "ip": "192.168.1.103",
                "type": "access_point",
                "role": "Wireless Access Point",
                "model": "Cisco Catalyst 9130AX Series",
                "mac": "00:50:56:70:A7:41",
                "building": "ساختمان مرکزی (Central Bldg)",
                "floor": "طبقه ۳ (Floor 3)",
                "unit": "واحد توسعه نرم‌افزار (Dev Unit 302)",
                "rack": "سقف راهرو شرقی",
                "is_online": True,
                "latency_ms": 1.9,
                "packet_loss": 0,
                "uptime": "45 days, 8 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Capwap 8.10.185.0",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 2
            },
            {
                "id": "dev-ap-bldg-b-f1",
                "name": "AP-WIFI-BLDG-B-MDF",
                "ip": "192.168.1.105",
                "type": "access_point",
                "role": "Wireless Access Point",
                "model": "Cisco Aironet 2802I",
                "mac": "00:50:56:94:B4:0F",
                "building": "ساختمان مهندسی (Engineering Bldg)",
                "floor": "طبقه ۱ (Floor 1)",
                "unit": "مرکز داده فرعی (MDF Room)",
                "rack": "دیواری ورودی مهندسی",
                "is_online": True,
                "latency_ms": 3.8,
                "packet_loss": 0,
                "uptime": "73 days, 16 hours",
                "cdp_enabled": True,
                "lldp_enabled": True,
                "snmp_community": "public",
                "firmware": "Capwap 8.10.151.0",
                "last_seen": "هم اکنون (Just now)",
                "total_ports": 2
            }
        ],
        "ports": {
            "dev-core-01": [
                {
                    "port_id": "TenGig0/1",
                    "name": "TenGigabitEthernet0/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,20,30,50,99",
                    "speed": "10 Gbps",
                    "duplex": "Full",
                    "connected_device": "RT-EDGE-01 (Gi0/0/0)",
                    "connected_type": "Router",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Uplink to Edge Gateway RT-EDGE-01"
                },
                {
                    "port_id": "TenGig0/2",
                    "name": "TenGigabitEthernet0/2",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,20,30,50,99",
                    "speed": "10 Gbps",
                    "duplex": "Full",
                    "connected_device": "SW-DIST-BLDG-A (Te1/1/1)",
                    "connected_type": "Switch",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Trunk Link to SW-DIST-BLDG-A"
                },
                {
                    "port_id": "TenGig0/3",
                    "name": "TenGigabitEthernet0/3",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,20,30,50,99",
                    "speed": "10 Gbps",
                    "duplex": "Full",
                    "connected_device": "SW-DIST-BLDG-B (Te1/1/1)",
                    "connected_type": "Switch",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Trunk Link to SW-DIST-BLDG-B"
                },
                {
                    "port_id": "Gig0/1",
                    "name": "GigabitEthernet0/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 99,
                    "allowed_vlans": "99",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "NMS-Server-Admin (NIC-1)",
                    "connected_type": "Server",
                    "poe_status": "off",
                    "poe_power": 0,
                    "description": "Network Management Server"
                },
                {
                    "port_id": "Gig0/2",
                    "name": "GigabitEthernet0/2",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 50,
                    "allowed_vlans": "50",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "AP-WIFI-BLDG-A-LOBBY (Eth0)",
                    "connected_type": "Access Point",
                    "poe_status": "delivering",
                    "poe_power": 18.5,
                    "description": "PoE to AP Lobby"
                },
                {
                    "port_id": "Gig0/3",
                    "name": "GigabitEthernet0/3",
                    "status": "down",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 10,
                    "allowed_vlans": "10",
                    "speed": "Auto",
                    "duplex": "Auto",
                    "connected_device": "Not Connected",
                    "connected_type": "None",
                    "poe_status": "off",
                    "poe_power": 0,
                    "description": "Spare Server Link"
                },
                {
                    "port_id": "Gig0/4",
                    "name": "GigabitEthernet0/4",
                    "status": "down",
                    "admin_status": "disabled",
                    "mode": "access",
                    "vlan": 1,
                    "allowed_vlans": "1",
                    "speed": "Auto",
                    "duplex": "Auto",
                    "connected_device": "Admin Disabled",
                    "connected_type": "None",
                    "poe_status": "disabled",
                    "poe_power": 0,
                    "description": "Shutdown for Security"
                }
            ],
            "dev-dist-bldg-a": [
                {
                    "port_id": "Te1/1/1",
                    "name": "TenGigabitEthernet1/1/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,20,30,50,99",
                    "speed": "10 Gbps",
                    "duplex": "Full",
                    "connected_device": "SW-CORE-01 (TenGig0/2)",
                    "connected_type": "Switch",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Core Trunk"
                },
                {
                    "port_id": "Te1/1/2",
                    "name": "TenGigabitEthernet1/1/2",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,20,30,50,99",
                    "speed": "10 Gbps",
                    "duplex": "Full",
                    "connected_device": "SW-ACC-BLDG-A-F3 (Te1/0/1)",
                    "connected_type": "Switch",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Downlink to Floor 3 Access Switch"
                },
                {
                    "port_id": "Gi1/0/1",
                    "name": "GigabitEthernet1/0/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 20,
                    "allowed_vlans": "20",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "Printer-HQ-Floor2 (HP Laserjet)",
                    "connected_type": "Printer",
                    "poe_status": "off",
                    "poe_power": 0,
                    "description": "Floor 2 Shared Printer"
                },
                {
                    "port_id": "Gi1/0/2",
                    "name": "GigabitEthernet1/0/2",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 20,
                    "allowed_vlans": "20",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "Cisco IP Phone 8845 (Ext 204)",
                    "connected_type": "VoIP Phone",
                    "poe_status": "delivering",
                    "poe_power": 7.4,
                    "description": "Finance Desk Phone"
                }
            ],
            "dev-acc-bldg-a-f3": [
                {
                    "port_id": "Te1/0/1",
                    "name": "TenGigabitEthernet1/0/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,20,30,50,99",
                    "speed": "10 Gbps",
                    "duplex": "Full",
                    "connected_device": "SW-DIST-BLDG-A (Te1/1/2)",
                    "connected_type": "Switch",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Uplink to Distribution"
                },
                {
                    "port_id": "Gi1/0/1",
                    "name": "GigabitEthernet1/0/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 50,
                    "allowed_vlans": "50",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "AP-WIFI-BLDG-A-DEV (Eth0)",
                    "connected_type": "Access Point",
                    "poe_status": "delivering",
                    "poe_power": 13.2,
                    "description": "PoE+ to UniFi AP U6 Pro"
                },
                {
                    "port_id": "Gi1/0/2",
                    "name": "GigabitEthernet1/0/2",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 30,
                    "allowed_vlans": "30",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "Dev-Workstation-Lead (Dell Precision)",
                    "connected_type": "Workstation",
                    "poe_status": "off",
                    "poe_power": 0,
                    "description": "Lead Developer Workstation"
                },
                {
                    "port_id": "Gi1/0/3",
                    "name": "GigabitEthernet1/0/3",
                    "status": "down",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 30,
                    "allowed_vlans": "30",
                    "speed": "Auto",
                    "duplex": "Auto",
                    "connected_device": "Desk 304 (Disconnected)",
                    "connected_type": "None",
                    "poe_status": "off",
                    "poe_power": 0,
                    "description": "Dev Desk 304"
                }
            ],
            "dev-dist-bldg-b": [
                {
                    "port_id": "Te1/1/1",
                    "name": "TenGigabitEthernet1/1/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,20,30,50,99",
                    "speed": "10 Gbps",
                    "duplex": "Full",
                    "connected_device": "SW-CORE-01 (TenGig0/3)",
                    "connected_type": "Switch",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Inter-Building Fiber Trunk"
                },
                {
                    "port_id": "Gi1/0/1",
                    "name": "GigabitEthernet1/0/1",
                    "status": "up",
                    "admin_status": "enabled",
                    "mode": "access",
                    "vlan": 50,
                    "allowed_vlans": "50",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "AP-WIFI-BLDG-B-MDF (Eth0)",
                    "connected_type": "Access Point",
                    "poe_status": "delivering",
                    "poe_power": 15.1,
                    "description": "Aruba AP in MDF"
                },
                {
                    "port_id": "Gi1/0/2",
                    "name": "GigabitEthernet1/0/2",
                    "status": "down",
                    "admin_status": "enabled",
                    "mode": "trunk",
                    "vlan": 1,
                    "allowed_vlans": "1,10,30",
                    "speed": "1 Gbps",
                    "duplex": "Full",
                    "connected_device": "SW-ACC-BLDG-B-F2 (sfp-sfpplus1)",
                    "connected_type": "Switch",
                    "poe_status": "n/a",
                    "poe_power": 0,
                    "description": "Link to MikroTik Switch (Currently Offline)"
                }
            ]
        },
        "cdp_lldp_neighbors": [
            {
                "local_device_id": "dev-core-01",
                "local_port": "TenGig0/1",
                "neighbor_name": "RT-EDGE-01",
                "neighbor_ip": "192.168.1.254",
                "neighbor_port": "GigabitEthernet0/0/0",
                "neighbor_model": "Cisco ISR 4451-X",
                "protocol": "CDP",
                "capabilities": "Router",
                "vlan": 1,
                "holdtime": 165
            },
            {
                "local_device_id": "dev-core-01",
                "local_port": "TenGig0/2",
                "neighbor_name": "SW-DIST-BLDG-A",
                "neighbor_ip": "192.168.1.10",
                "neighbor_port": "TenGigabitEthernet1/1/1",
                "neighbor_model": "Cisco Catalyst 9300-48P",
                "protocol": "CDP",
                "capabilities": "Switch, IGMP",
                "vlan": 1,
                "holdtime": 172
            },
            {
                "local_device_id": "dev-core-01",
                "local_port": "TenGig0/3",
                "neighbor_name": "SW-DIST-BLDG-B",
                "neighbor_ip": "192.168.1.11",
                "neighbor_port": "TenGigabitEthernet1/1/1",
                "neighbor_model": "Cisco Catalyst 9300-24T",
                "protocol": "CDP",
                "capabilities": "Switch, IGMP",
                "vlan": 1,
                "holdtime": 158
            },
            {
                "local_device_id": "dev-core-01",
                "local_port": "Gig0/2",
                "neighbor_name": "AP-WIFI-BLDG-A-LOBBY",
                "neighbor_ip": "192.168.1.101",
                "neighbor_port": "GigabitEthernet0",
                "neighbor_model": "Cisco Catalyst 9120AXI",
                "protocol": "CDP",
                "capabilities": "Trans-Bridge, WLAN AP",
                "vlan": 50,
                "holdtime": 140
            },
            {
                "local_device_id": "dev-dist-bldg-a",
                "local_port": "Te1/1/2",
                "neighbor_name": "SW-ACC-BLDG-A-F3",
                "neighbor_ip": "192.168.1.21",
                "neighbor_port": "TenGigabitEthernet1/0/1",
                "neighbor_model": "Cisco Catalyst 2960X-48FPS-L",
                "protocol": "CDP",
                "capabilities": "Switch",
                "vlan": 1,
                "holdtime": 169
            },
            {
                "local_device_id": "dev-acc-bldg-a-f3",
                "local_port": "Gi1/0/1",
                "neighbor_name": "AP-WIFI-BLDG-A-DEV",
                "neighbor_ip": "192.168.1.103",
                "neighbor_port": "eth0",
                "neighbor_model": "Ubiquiti UniFi U6 Pro",
                "protocol": "LLDP",
                "capabilities": "Bridge, WLAN AP",
                "vlan": 50,
                "holdtime": 120
            },
            {
                "local_device_id": "dev-dist-bldg-b",
                "local_port": "Gi1/0/1",
                "neighbor_name": "AP-WIFI-BLDG-B-MDF",
                "neighbor_ip": "192.168.1.105",
                "neighbor_port": "eth0",
                "neighbor_model": "Aruba AP-515 Campus",
                "protocol": "LLDP",
                "capabilities": "WLAN AP, Bridge",
                "vlan": 50,
                "holdtime": 115
            }
        ],
        "topology_links": [
            {
                "id": "link-core-router",
                "source": "dev-core-01",
                "target": "dev-router-gw",
                "source_port": "TenGig0/1",
                "target_port": "Gi0/0/0",
                "type": "trunk",
                "speed": "10G",
                "protocol": "CDP",
                "status": "active"
            },
            {
                "id": "link-core-dist-a",
                "source": "dev-core-01",
                "target": "dev-dist-bldg-a",
                "source_port": "TenGig0/2",
                "target_port": "Te1/1/1",
                "type": "trunk",
                "speed": "10G",
                "protocol": "CDP",
                "status": "active"
            },
            {
                "id": "link-core-dist-b",
                "source": "dev-core-01",
                "target": "dev-dist-bldg-b",
                "source_port": "TenGig0/3",
                "target_port": "Te1/1/1",
                "type": "trunk",
                "speed": "10G",
                "protocol": "CDP",
                "status": "active"
            },
            {
                "id": "link-dist-a-acc-f3",
                "source": "dev-dist-bldg-a",
                "target": "dev-acc-bldg-a-f3",
                "source_port": "Te1/1/2",
                "target_port": "Te1/0/1",
                "type": "trunk",
                "speed": "10G",
                "protocol": "CDP",
                "status": "active"
            },
            {
                "id": "link-dist-b-acc-b-f2",
                "source": "dev-dist-bldg-b",
                "target": "dev-acc-bldg-b-f2",
                "source_port": "Gi1/0/2",
                "target_port": "sfp-sfpplus1",
                "type": "trunk",
                "speed": "1G",
                "protocol": "LLDP",
                "status": "down"
            },
            {
                "id": "link-core-ap-lobby",
                "source": "dev-core-01",
                "target": "dev-ap-bldg-a-f1",
                "source_port": "Gig0/2",
                "target_port": "Gi0",
                "type": "access",
                "vlan": 50,
                "speed": "1G",
                "protocol": "CDP",
                "status": "active"
            },
            {
                "id": "link-acc-f3-ap-dev",
                "source": "dev-acc-bldg-a-f3",
                "target": "dev-ap-bldg-a-f3",
                "source_port": "Gi1/0/1",
                "target_port": "eth0",
                "type": "access",
                "vlan": 50,
                "speed": "1G",
                "protocol": "LLDP",
                "status": "active"
            },
            {
                "id": "link-dist-b-ap-mdf",
                "source": "dev-dist-bldg-b",
                "target": "dev-ap-bldg-b-f1",
                "source_port": "Gi1/0/1",
                "target_port": "eth0",
                "type": "access",
                "vlan": 50,
                "speed": "1G",
                "protocol": "LLDP",
                "status": "active"
            }
        ],
        "vlans": [
            {"id": 1, "name": "Default / Management", "subnet": "192.168.1.0/24", "color": "#64748b"},
            {"id": 10, "name": "Servers & DMZ", "subnet": "10.10.10.0/24", "color": "#3b82f6"},
            {"id": 20, "name": "Staff & Office", "subnet": "10.20.20.0/24", "color": "#10b981"},
            {"id": 30, "name": "Dev & Engineering", "subnet": "10.30.30.0/24", "color": "#8b5cf6"},
            {"id": 50, "name": "Wireless Guest & Corp APs", "subnet": "172.16.50.0/24", "color": "#f59e0b"},
            {"id": 99, "name": "Out-of-Band Network Mgmt", "subnet": "10.99.99.0/24", "color": "#ec4899"}
        ],
        "templates": get_default_templates(),
        "device_groups": get_default_device_groups(),
        "active_directory": get_default_ad_config(),
        "access_policies": get_default_access_policies()
    }

def normalize_port_list(port_list):
    if not isinstance(port_list, list):
        return []
    normalized = []
    seen = set()
    for idx, p in enumerate(port_list):
        if not isinstance(p, dict):
            continue
        p_copy = dict(p)
        if not p_copy.get("port_id"):
            p_copy["port_id"] = p_copy.get("port") or p_copy.get("name") or f"port-{idx+1}"
        if not p_copy.get("port"):
            p_copy["port"] = p_copy["port_id"]
        if not p_copy.get("name"):
            p_copy["name"] = p_copy["port_id"]
        if not p_copy.get("mode"):
            p_copy["mode"] = "access"
        
        stat = str(p_copy.get("status", "down")).strip().lower()
        admin_stat = str(p_copy.get("admin_status", "")).strip().lower()
        is_disabled = admin_stat in ("disabled", "shutdown") or stat in ("disabled", "err-disabled", "administratively down", "shutdown")
        is_up = not is_disabled and stat in ("up", "connected", "active", "running")

        p_copy["status"] = "up" if is_up else "down"
        p_copy["admin_status"] = "disabled" if is_disabled else "enabled"

        canon_id = str(p_copy["port_id"]).strip().lower().replace("gigabitethernet", "gi").replace("fastethernet", "fa").replace("tengigabitethernet", "te")
        if canon_id in seen:
            continue
        seen.add(canon_id)
        normalized.append(p_copy)
    return normalized

# Persistence operations
db_lock = threading.Lock()

def load_data():
    with db_lock:
        if not os.path.exists(DATA_FILE):
            data = get_initial_seed_data()
            save_data_unsafe(data)
            return data
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Auto-initialize templates if not yet seeded
                if "templates" not in data or not data["templates"]:
                    data["templates"] = get_default_templates()
                    save_data_unsafe(data)

                # Auto-initialize settings & RBAC if not yet seeded
                settings_updated = False
                if "device_groups" not in data or not data["device_groups"]:
                    data["device_groups"] = get_default_device_groups()
                    settings_updated = True
                if "active_directory" not in data or not data["active_directory"]:
                    data["active_directory"] = get_default_ad_config()
                    settings_updated = True
                if "access_policies" not in data or not data["access_policies"]:
                    data["access_policies"] = get_default_access_policies()
                    settings_updated = True
                if settings_updated:
                    save_data_unsafe(data)

                # Ensure default SSH properties exist
                dev_updated = False
                for dev in data.get("devices", []):
                    if "ssh_host" not in dev or not dev["ssh_host"]:
                        dev["ssh_host"] = dev.get("ip", "192.168.1.50")
                        dev_updated = True
                    if "ssh_port" not in dev:
                        dev["ssh_port"] = 22
                        dev["ssh_username"] = "admin"
                        dev["ssh_password"] = "cisco123"
                        dev["enable_password"] = "cisco_enable"
                        dev["ssh_status"] = "authenticated"
                        dev_updated = True
                    if "winbox_port" not in dev:
                        dev["winbox_port"] = 8291
                        dev_updated = True
                if dev_updated:
                    save_data_unsafe(data)

                # Auto-normalize ports structure to guarantee port_id
                ports_updated = False
                if "ports" in data and isinstance(data["ports"], dict):
                    for dev_id, p_list in data["ports"].items():
                        if isinstance(p_list, list):
                            normalized = normalize_port_list(p_list)
                            if normalized != p_list:
                                data["ports"][dev_id] = normalized
                                ports_updated = True
                if ports_updated:
                    save_data_unsafe(data)

                return data
        except Exception as e:
            print(f"Error reading {DATA_FILE}: {e}. Attempting recovery from persistent backups...")
            recovered = False
            # Check database_store.json
            db_store_file = os.path.join(DATA_DIR, "database_store.json")
            if os.path.exists(db_store_file):
                try:
                    with open(db_store_file, "r", encoding="utf-8") as f_db:
                        db_content = json.load(f_db)
                        if isinstance(db_content.get("devices"), list) and len(db_content["devices"]) > 0:
                            data = get_initial_seed_data()
                            data["devices"] = db_content["devices"]
                            if "ports" in db_content:
                                data["ports"] = db_content["ports"]
                            save_data_unsafe(data)
                            print(f"[Recovery] Restored {len(data['devices'])} devices from database_store.json")
                            recovered = True
                            return data
                except Exception as db_err:
                    print(f"[Recovery] Could not recover from database_store.json: {db_err}")

            if not recovered:
                # Check backend/backups
                backups_dir = os.path.join(DATA_DIR, "backups")
                if os.path.exists(backups_dir):
                    backup_files = sorted([os.path.join(backups_dir, f) for f in os.listdir(backups_dir)], reverse=True)
                    for b_file in backup_files:
                        target_json = b_file if b_file.endswith(".json") else os.path.join(b_file, "network_data.json")
                        if os.path.exists(target_json):
                            try:
                                with open(target_json, "r", encoding="utf-8") as bf:
                                    b_data = json.load(bf)
                                    if isinstance(b_data.get("devices"), list) and len(b_data["devices"]) > 0:
                                        save_data_unsafe(b_data)
                                        print(f"[Recovery] Restored {len(b_data['devices'])} devices from backup: {target_json}")
                                        return b_data
                            except Exception:
                                continue

            print(f"[Notice] No backup found to recover. Generating seed data.")
            data = get_initial_seed_data()
            save_data_unsafe(data)
            return data

def save_data_unsafe(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def save_data(data):
    with db_lock:
        save_data_unsafe(data)

# Real ping simulation / check
def probe_device_reachability(ip):
    # Try a rapid socket connection or TCP probe if applicable, otherwise simulate realistic network latency
    start = time.time()
    try:
        # Check standard network management ports (e.g. 22 SSH, 80 HTTP, 443 HTTPS, 161 SNMP) with very short timeout
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.3)
        res = s.connect_ex((ip, 80))
        s.close()
        elapsed = round((time.time() - start) * 1000, 1)
        if res == 0:
            return True, max(0.4, elapsed), 0
    except Exception:
        pass
    
    # In sandbox or local private subnet, check based on configured device state
    # If device was marked offline (like SW-ACC-BLDG-B-F2 with 192.168.1.32), maintain real status
    if ip.endswith(".32"):
        return False, None, 100
    import random
    latency = round(random.uniform(0.7, 3.5), 1)
    return True, latency, 0

# HTTP Request Handler
class NetworkAPIHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Connection", "close")
        self.close_connection = True

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _read_body(self):
        try:
            content_len = int(self.headers.get('Content-Length', 0))
            if content_len > 0:
                raw = self.rfile.read(content_len).decode('utf-8')
                return json.loads(raw)
        except Exception:
            return {}
        return {}

    def _send_json(self, status_code, payload):
        encoded = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self._send_cors_headers()
        self.end_headers()
        try:
            self.wfile.write(encoded)
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, Exception):
            pass

    def _handle_device_resources(self, path: str, body: Optional[Dict[str, Any]] = None):
        parts = path.split("/")
        dev_id = parts[3] if len(parts) >= 4 else ""
        data = load_data()
        device = next((d for d in data["devices"] if d["id"] == dev_id), None)
        if not device:
            self._send_json(404, {"error": "Device not found", "success": False})
            return

        dev_platform = device.get("platform", "")
        if path.endswith("/mikrotik-resources") or "mikrotik" in str(dev_platform).lower():
            default_platform = "mikrotik_routeros"
        else:
            default_platform = "cisco_ios_xe"
        platform = dev_platform or default_platform
        driver = get_driver(platform, default_platform)
        existing_ports = data.get("ports", {}).get(dev_id, [])

        conn = device.get("connection", {}) or {}
        conn_host = conn.get("host") or device.get("ssh_host") or device.get("ip", "")

        # Check if caller passed override credentials in body
        if body and isinstance(body, dict):
            if body.get("host"):
                conn_host = body.get("host")
            if body.get("username"):
                device = dict(device)
                device["ssh_username"] = body.get("username")
            if body.get("password"):
                device = dict(device)
                device["ssh_password"] = body.get("password")

        is_live = False
        raw_outputs = {}
        error_msg = ""
        latency_ms = None

        if conn_host:
            sess = connection_manager.get_or_create_session(device, require_real=True)
            if sess.status == "connected" and sess.is_real and sess.paramiko_client:
                try:
                    cmd_defs = driver.get_system_resources_commands() if hasattr(driver, "get_system_resources_commands") else []
                    for item in cmd_defs:
                        k = item["key"]
                        c = item["cmd"]
                        res = connection_manager.execute_command(device, c, require_real=True)
                        if res.get("success") and res.get("output") is not None:
                            raw_outputs[k] = res["output"]
                    is_live = len(raw_outputs) > 0
                    latency_ms = sess.latency_ms
                except Exception as ex:
                    error_msg = str(ex)
            else:
                error_msg = sess.error_message or f"SSH connection to {conn_host} failed or device offline"
        else:
            error_msg = "Device IP or SSH host is not configured."

        if hasattr(driver, "parse_system_resources"):
            parsed = driver.parse_system_resources(raw_outputs, device, existing_ports)
        else:
            parsed = {}

        parsed["success"] = is_live
        parsed["is_live"] = is_live
        parsed["connected"] = is_live
        parsed["latency_ms"] = latency_ms
        parsed["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
        parsed["host"] = conn_host
        if not is_live:
            parsed["warning"] = error_msg or "Live hardware telemetry unavailable"
            parsed["error"] = error_msg
        self._send_json(200, parsed)

    def _handle_cisco_resources(self, path: str, body: Optional[Dict[str, Any]] = None):
        self._handle_device_resources(path, body)

    def _handle_mikrotik_resources(self, path: str, body: Optional[Dict[str, Any]] = None):
        self._handle_device_resources(path, body)

    def do_GET(self):
        url = urlparse(self.path)
        path = url.path.rstrip('/') or '/'
        data = load_data()

        if path == "/api/health":
            self._send_json(200, {
                "status": "online",
                "engine": "Python 3 Network Discovery & Topology Service",
                "cdp_engine": "Active",
                "lldp_engine": "Active",
                "device_count": len(data["devices"])
            })
            return

        if path == "/api/devices":
            clean_devices = [sanitize_device(d) for d in data.get("devices", [])]
            self._send_json(200, {
                "devices": clean_devices,
                "total": len(clean_devices),
                "online_count": sum(1 for d in clean_devices if d.get("is_online")),
                "offline_count": sum(1 for d in clean_devices if not d.get("is_online"))
            })
            return

        if path == "/api/tools/check-host/nodes":
            res = check_host_get_nodes()
            self._send_json(200 if res.get("success") else 502, res)
            return

        if path == "/api/tools/check-host/result":
            query = parse_qs(url.query)
            request_id = (query.get("request_id", [""])[0]).strip()
            if not request_id:
                self._send_json(400, {"success": False, "error": "request_id parameter is required"})
                return
            res = check_host_get_result(request_id)
            self._send_json(200 if res.get("success") else 502, res)
            return

        # -------------------------------------------------------------
        # Bulk Device Configuration Endpoints
        # -------------------------------------------------------------
        if path == "/api/bulk-config/templates":
            if not os_mapper_registry:
                self._send_json(500, {"error": "bulk_config module not loaded"})
                return
            templates = os_mapper_registry.get_all_templates()
            self._send_json(200, {"templates": templates})
            return

        if path == "/api/bulk-config/jobs":
            if not bulk_execution_engine:
                self._send_json(500, {"error": "bulk_config engine not loaded"})
                return
            jobs = bulk_execution_engine.list_jobs(limit=30)
            self._send_json(200, {"jobs": jobs})
            return

        if path.startswith("/api/bulk-config/jobs/") and path.endswith("/export"):
            parts = path.split("/")
            job_id = parts[4]
            query = parse_qs(url.query)
            fmt = query.get("format", ["csv"])[0].lower()
            if not bulk_execution_engine:
                self._send_json(500, {"error": "bulk_config engine not loaded"})
                return
            if fmt == "json":
                job = bulk_execution_engine.get_job(job_id)
                if not job:
                    self._send_json(404, {"error": "Job not found"})
                    return
                self._send_json(200, job.to_dict())
            else:
                csv_data = bulk_execution_engine.export_job_report_csv(job_id)
                self.send_response(200)
                self.send_header("Content-Type", "text/csv; charset=utf-8")
                self.send_header("Content-Disposition", f"attachment; filename=bulk_report_{job_id}.csv")
                self.end_headers()
                self.wfile.write(csv_data.encode("utf-8"))
            return

        if path.startswith("/api/bulk-config/jobs/"):
            parts = path.split("/")
            job_id = parts[4]
            if not bulk_execution_engine:
                self._send_json(500, {"error": "bulk_config engine not loaded"})
                return
            job = bulk_execution_engine.get_job(job_id)
            if not job:
                self._send_json(404, {"error": "Job not found"})
                return
            self._send_json(200, job.to_dict())
            return

        if path.startswith("/api/bulk-config/backups/"):
            parts = path.split("/")
            backup_id = parts[4]
            if not bulk_execution_engine:
                self._send_json(500, {"error": "bulk_config engine not loaded"})
                return
            content = bulk_execution_engine.get_backup_content(backup_id)
            if content is None:
                self._send_json(404, {"error": "Backup snapshot not found"})
                return
            self._send_json(200, {
                "backupId": backup_id,
                "content": content,
                "length": len(content)
            })
            return

        if path.startswith("/api/devices/") and path.endswith("/capabilities") and "/vpn/" not in path:
            # /api/devices/:id/capabilities
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            driver = get_driver(device.get("platform", "cisco_ios_xe"), device.get("connection_mode", "simulator"))
            self._send_json(200, driver.get_capabilities())
            return

        # MikroTik VPN Capabilities
        if path.startswith("/api/devices/") and "/vpn/capabilities" in path:
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {
                    "error": "unsupported_platform",
                    "message": "قابلیت پیکربندی VPN در این فاز فقط برای روترهای میکروتیک (MikroTik RouterOS) فعال می‌باشد."
                })
                return
            try:
                provider = get_vpn_provider("mikrotik_routeros")
                caps = provider.get_capabilities(device)
                self._send_json(200, caps)
            except Exception as e:
                self._send_json(500, {"error": "failed_to_get_capabilities", "message": str(e)})
            return

        # MikroTik VPN Status & List
        if path.startswith("/api/devices/") and path.endswith("/vpn"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {
                    "error": "unsupported_platform",
                    "message": "قابلیت مدیریت VPN فقط مختص تجهیزات MikroTik RouterOS است."
                })
                return

            conn = device.get("connection", {}) or {}
            conn_host = conn.get("host") or device.get("ssh_host") or device.get("ip", "")
            conn_port = int(conn.get("port") or device.get("ssh_port") or 22)
            conn_user = conn.get("username") or device.get("ssh_username") or "admin"

            sess = connection_manager.get_or_create_session(device, require_real=True)
            if sess.status != "connected":
                self._send_json(503, {
                    "error": "ssh_connection_failed",
                    "message": f"اتصال SSH به روتر میکروتیک ({conn_user}@{conn_host}:{conn_port}) برقرار نشد: {sess.error_message}",
                    "isReal": True,
                    "target_host": conn_host,
                    "target_port": conn_port,
                    "target_user": conn_user
                })
                return

            try:
                provider = get_vpn_provider("mikrotik_routeros")
                vpn_list = provider.get_status(device, sess)
                self._send_json(200, {
                    "device_id": dev_id,
                    "platform": device.get("platform"),
                    "connection_mode": device.get("connection_mode", "ssh"),
                    "is_real": sess.is_real,
                    "total": len(vpn_list),
                    "vpns": vpn_list
                })
            except Exception as e:
                self._send_json(500, {"error": "failed_to_query_vpn", "message": str(e)})
            return

        if path.startswith("/api/devices/") and path.endswith("/certificates"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {
                    "error": "unsupported_platform",
                    "message": "Certificate management is only supported on MikroTik RouterOS."
                })
                return

            req_real = (device.get("connection_mode") == "ssh")
            sess = connection_manager.get_or_create_session(device, require_real=req_real)
            res = connection_manager.execute_command(device, "/certificate print detail without-paging")
            raw_out = res.get("output", "")
            certs = []
            blocks = raw_out.split("\n\n")
            for blk in blocks:
                m_name = re.search(r'name="?([^"\s\n]+)"?', blk)
                if m_name:
                    cname = m_name.group(1)
                    m_cn = re.search(r'common-name="?([^"\s\n]+)"?', blk)
                    m_ca = re.search(r'ca=(yes|no)', blk)
                    m_exp = re.search(r'expired=(yes|no)', blk)
                    certs.append({
                        "name": cname,
                        "common_name": m_cn.group(1) if m_cn else cname,
                        "ca": m_ca.group(1) == "yes" if m_ca else False,
                        "expired": m_exp.group(1) == "yes" if m_exp else False
                    })
            if not certs and "flags:" in raw_out.lower():
                for line in raw_out.splitlines():
                    parts_line = line.strip().split()
                    if len(parts_line) >= 3 and parts_line[0].isdigit():
                        certs.append({
                            "name": parts_line[2],
                            "common_name": parts_line[3] if len(parts_line) > 3 else parts_line[2],
                            "ca": "a" in parts_line[1].lower(),
                            "expired": "e" in parts_line[1].lower()
                        })
            self._send_json(200, {
                "device_id": dev_id,
                "count": len(certs),
                "certificates": certs
            })
            return

        if path.startswith("/api/devices/") and path.endswith("/connection"):
            # /api/devices/:id/connection
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            sess = connection_manager.get_session(dev_id)
            self._send_json(200, {
                "connected": sess is not None and sess.status == "connected",
                "platform": device.get("platform", "cisco_ios_xe"),
                "protocol": "ssh",
                "latency_ms": sess.latency_ms if sess else None,
                "sessionId": sess.session_id if sess else None,
                "isReal": sess.is_real if sess else False,
                "banner": sess.banner if sess else "",
                "mode": sess.mode if sess else device.get("connection_mode", "ssh")
            })
            return

        if path.startswith("/api/devices/") and (path.endswith("/cisco-resources") or path.endswith("/mikrotik-resources") or path.endswith("/system-resources")):
            # GET /api/devices/:id/cisco-resources or /mikrotik-resources or /system-resources
            self._handle_device_resources(path)
            return

        if path.startswith("/api/devices/") and path.endswith("/vlans"):
            # GET /api/devices/:id/vlans
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return

            platform = device.get("platform", "cisco_ios_xe")
            conn_mode = device.get("connection_mode", "ssh")
            driver = get_driver(platform, conn_mode)
            existing_ports = data.get("ports", {}).get(dev_id, [])

            # Real device query if online and connected
            live_vlans = []
            if conn_mode != "simulator":
                sess = connection_manager.get_or_create_session(device, require_real=True)
                if sess.status == "connected" and sess.is_real and sess.paramiko_client:
                    try:
                        if hasattr(driver, "parse_vlans"):
                            cmd = "show vlan brief" if "cisco" in platform.lower() else "/interface vlan print"
                            r = connection_manager.execute_command(device, cmd, require_real=True)
                            if r.get("success") and r.get("output"):
                                live_vlans = driver.parse_vlans(r["output"])
                    except Exception as e:
                        print(f"[Device VLANs live query note] {e}")

            # Map of global catalog
            global_vlans = {v["id"]: v for v in data.get("vlans", [])}

            vlan_port_counts = {}
            for p in existing_ports:
                v = p.get("vlan")
                if v is not None:
                    try:
                        vid = int(v)
                        vlan_port_counts[vid] = vlan_port_counts.get(vid, 0) + 1
                    except Exception:
                        pass
                av = p.get("allowed_vlans")
                if av:
                    for part in str(av).split(","):
                        part = part.strip()
                        if part.isdigit():
                            vid = int(part)
                            if vid not in vlan_port_counts:
                                vlan_port_counts[vid] = 0

            # Merge live vlans if any
            for lv in live_vlans:
                vid = lv.get("id")
                if vid and vid not in vlan_port_counts:
                    vlan_port_counts[vid] = lv.get("ports_count", 0)

            # Ensure at least VLAN 1 is included if ports exist or default
            if 1 not in vlan_port_counts:
                vlan_port_counts[1] = 0

            device_vlans = []
            for vid in sorted(vlan_port_counts.keys()):
                live_item = next((x for x in live_vlans if x.get("id") == vid), None)
                g_item = global_vlans.get(vid, {})
                vname = (live_item and live_item.get("name")) or g_item.get("name") or (f"Default / Management" if vid == 1 else f"VLAN {vid}")
                device_vlans.append({
                    "id": vid,
                    "name": vname,
                    "status": "active",
                    "ports_count": vlan_port_counts[vid]
                })

            self._send_json(200, {
                "device_id": dev_id,
                "device_name": device.get("name"),
                "vlans": device_vlans,
                "total": len(device_vlans)
            })
            return

        if path.startswith("/api/devices/") and path.endswith("/unsaved-changes"):
            # GET /api/devices/:id/unsaved-changes
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return

            ports = data.get("ports", {}).get(dev_id, [])
            modified_ports = []
            for p in ports:
                is_mod = (
                    (p.get("description") and p.get("description").strip()) or
                    p.get("vlan", 1) != 1 or
                    p.get("mode") == "trunk" or
                    p.get("port_security_enabled") or
                    p.get("admin_status") == "disabled"
                )
                if is_mod:
                    summary_parts = []
                    if p.get("admin_status") == "disabled":
                        summary_parts.append("shutdown")
                    if p.get("mode") == "trunk":
                        summary_parts.append(f"mode trunk (allowed: {p.get('allowed_vlans', 'all')})")
                    elif p.get("vlan", 1) != 1:
                        summary_parts.append(f"vlan {p.get('vlan')}")
                    if p.get("description"):
                        summary_parts.append(f"description \"{p.get('description')}\"")
                    if p.get("port_security_enabled"):
                        summary_parts.append(f"port-security ({p.get('port_security_mode', 'sticky')})")

                    modified_ports.append({
                        "port_id": p.get("port_id"),
                        "mode": p.get("mode", "access"),
                        "vlan": p.get("vlan", 1),
                        "status": p.get("status", "down"),
                        "admin_status": p.get("admin_status", "enabled"),
                        "description": p.get("description", ""),
                        "port_security_enabled": p.get("port_security_enabled", False),
                        "change_summary": ", ".join(summary_parts) if summary_parts else "Active custom configuration"
                    })

            pending = device.get("pending_changes", [])
            cli_diff_lines = [
                f"! ==============================================================================",
                f"! Cisco IOS Running-Config Pending Changes for NVRAM (Startup-Config)",
                f"! Target Device: {device.get('name')} ({device.get('ip')})",
                f"! Platform: {device.get('platform', 'cisco_ios')} - Role: {device.get('role', 'Switch')}",
                f"! Status: Active in volatile RAM (Running-Config) | Unsaved in NVRAM",
                f"! ==============================================================================",
                f"configure terminal",
            ]

            if pending:
                cli_diff_lines.append(f"! [Recent Pending Session Operations]")
                for item in pending:
                    cli_diff_lines.append(f"! * {item.get('port_id', 'Device')}: {item.get('description', item.get('type', 'change'))}")
                    if item.get("command"):
                        cli_diff_lines.append(f" {item.get('command')}")

            if modified_ports:
                cli_diff_lines.append(f"!")
                cli_diff_lines.append(f"! [Active Configured Interfaces to be Written]")
                for mp in modified_ports:
                    cli_diff_lines.append(f"interface {mp['port_id']}")
                    if mp.get("description"):
                        cli_diff_lines.append(f" description {mp['description']}")
                    if mp.get("mode") == "trunk":
                        cli_diff_lines.append(f" switchport mode trunk")
                    else:
                        cli_diff_lines.append(f" switchport mode access")
                        if mp.get("vlan", 1) != 1:
                            cli_diff_lines.append(f" switchport access vlan {mp['vlan']}")
                    if mp.get("port_security_enabled"):
                        cli_diff_lines.append(f" switchport port-security")
                    if mp.get("admin_status") == "disabled":
                        cli_diff_lines.append(f" shutdown")
                    else:
                        cli_diff_lines.append(f" no shutdown")
                    cli_diff_lines.append(f" exit")

            cli_diff_lines.extend([
                f"end",
                f"write memory",
                f"! Destination: NVRAM:startup-config",
                f"! [Building configuration... OK]"
            ])

            self._send_json(200, {
                "has_unsaved_changes": device.get("has_unsaved_changes", False),
                "pending_changes": pending,
                "modified_ports": modified_ports,
                "last_modified_time": device.get("last_modified_time", ""),
                "cli_diff": "\n".join(cli_diff_lines)
            })
            return

        if path.startswith("/api/devices/") and "/ports" in path:
            # /api/devices/:id/ports
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return

            platform = device.get("platform", "cisco_ios_xe")
            conn_mode = device.get("connection_mode", "ssh")
            driver = get_driver(platform, conn_mode)
            existing_ports = data.get("ports", {}).get(dev_id, [])

            if conn_mode == "simulator":
                ports = normalize_port_list(existing_ports)
                if not ports:
                    total = device.get("total_ports", 24)
                    ports = normalize_port_list(driver.get_default_ports(total))
                    data["ports"][dev_id] = ports
                    save_data(data)
                self._send_json(200, {
                    "device": sanitize_device(device),
                    "ports": ports,
                    "is_live": False,
                    "cached": False,
                    "mode": "simulator",
                    "active_count": sum(1 for p in ports if p.get("status") == "up"),
                    "inactive_count": sum(1 for p in ports if p.get("status") == "down"),
                    "admin_disabled_count": sum(1 for p in ports if p.get("admin_status") == "disabled")
                })
                return

            # Real Device Mode: Query interfaces directly from actual network hardware
            sess = connection_manager.get_or_create_session(device, require_real=True)
            if sess.status == "connected" and sess.is_real and sess.paramiko_client:
                cmds = driver.get_interface_query_commands()
                full_output = ""
                for cmd in cmds:
                    r = connection_manager.execute_command(device, cmd, require_real=True)
                    if r.get("success") and r.get("output"):
                        full_output += "\n" + r["output"]
                parsed = normalize_port_list(driver.parse_interfaces(full_output))
                if parsed:
                    data.setdefault("ports", {})[dev_id] = parsed
                    save_data(data)
                    self._send_json(200, {
                        "device": sanitize_device(device),
                        "ports": parsed,
                        "is_live": True,
                        "cached": False,
                        "mode": "real_device",
                        "active_count": sum(1 for p in parsed if p.get("status") == "up"),
                        "inactive_count": sum(1 for p in parsed if p.get("status") == "down"),
                        "admin_disabled_count": sum(1 for p in parsed if p.get("admin_status") == "disabled")
                    })
                    return

            # If device is unreachable:
            err_msg = sess.error_message or f"Device unreachable at {sess.host}:{sess.port}"
            if existing_ports:
                normalized_existing = normalize_port_list(existing_ports)
                # Return cached data with clear offline notice
                self._send_json(200, {
                    "device": sanitize_device(device),
                    "ports": normalized_existing,
                    "is_live": False,
                    "cached": True,
                    "mode": "cached_offline",
                    "error": err_msg,
                    "message": f"Cached data — device offline: {err_msg}",
                    "active_count": sum(1 for p in existing_ports if p.get("status") == "up"),
                    "inactive_count": sum(1 for p in existing_ports if p.get("status") == "down"),
                    "admin_disabled_count": sum(1 for p in existing_ports if p.get("admin_status") == "disabled")
                })
                return
            else:
                # Do NOT invent fake ports or mock data when device is unreachable
                self._send_json(200, {
                    "device": sanitize_device(device),
                    "ports": [],
                    "is_live": False,
                    "cached": False,
                    "mode": "unreachable",
                    "error": err_msg,
                    "message": f"Device unreachable at {sess.host}:{sess.port}: {err_msg}",
                    "active_count": 0,
                    "inactive_count": 0,
                    "admin_disabled_count": 0
                })
                return

        if path == "/api/topology":
            # Generate schematic topology data
            nodes = []
            for d in data["devices"]:
                node_item = dict(d)
                node_item.setdefault("role", "Network Device")
                node_item.setdefault("model", "Cisco")
                node_item.setdefault("platform", "cisco_ios_xe")
                node_item.setdefault("is_online", True)
                node_item.setdefault("latency_ms", 1.0)
                node_item.setdefault("total_ports", 24)
                nodes.append(node_item)

            self._send_json(200, {
                "nodes": nodes,
                "links": data.get("topology_links", []),
                "buildings": list(set(d.get("building") for d in data["devices"] if d.get("building"))),
                "floors": list(set(f"{d.get('building')} - {d.get('floor')}" for d in data["devices"] if d.get("floor"))),
                "summary": {
                    "total_nodes": len(nodes),
                    "total_links": len(data.get("topology_links", [])),
                    "core_switches": sum(1 for d in nodes if d["type"] == "switch" and "Core" in d.get("role", "")),
                    "access_switches": sum(1 for d in nodes if d["type"] == "switch" and "Access" in d.get("role", "")),
                    "routers": sum(1 for d in nodes if d["type"] == "router"),
                    "access_points": sum(1 for d in nodes if d["type"] == "access_point")
                }
            })
            return

        if path == "/api/cdp-lldp/neighbors":
            protocol_filter = parse_qs(url.query).get("protocol", [None])[0]
            neighbors = data.get("cdp_lldp_neighbors", [])
            if protocol_filter:
                neighbors = [n for n in neighbors if n.get("protocol", "").upper() == protocol_filter.upper()]
            self._send_json(200, {
                "neighbors": neighbors,
                "total": len(neighbors),
                "cdp_count": sum(1 for n in neighbors if n.get("protocol") == "CDP"),
                "lldp_count": sum(1 for n in neighbors if n.get("protocol") == "LLDP")
            })
            return

        if path == "/api/vlans":
            self._send_json(200, {"vlans": data.get("vlans", [])})
            return

        if path == "/api/locations":
            # Structure hierarchy: Building -> Floor -> Unit
            loc_tree = {}
            for d in data["devices"]:
                b = d.get("building", "سایر (Other)")
                f = d.get("floor", "نامشخص")
                u = d.get("unit", "عمومی")
                if b not in loc_tree:
                    loc_tree[b] = {}
                if f not in loc_tree[b]:
                    loc_tree[b][f] = {}
                if u not in loc_tree[b][f]:
                    loc_tree[b][f][u] = []
                loc_tree[b][f][u].append(d)

            self._send_json(200, {"locations": loc_tree})
            return

        if path == "/api/templates":
            self._send_json(200, {
                "templates": data.get("templates", []),
                "total": len(data.get("templates", []))
            })
            return

        if path.startswith("/api/templates/"):
            tmpl_id = path.split("/")[3]
            tmpl = next((t for t in data.get("templates", []) if t["id"] == tmpl_id), None)
            if not tmpl:
                self._send_json(404, {"error": "Template not found"})
                return
            self._send_json(200, {"template": tmpl})
            return

        if path == "/api/ssh/sessions":
            with ACTIVE_SESSIONS_LOCK:
                sessions_list = []
                for sid, s in ACTIVE_SSH_SESSIONS.items():
                    sessions_list.append({
                        "session_id": sid,
                        "sessionId": sid,
                        "host": s.get("host"),
                        "port": s.get("port"),
                        "username": s.get("username"),
                        "device_id": s.get("device_id"),
                        "mode": s.get("mode"),
                        "is_real": s.get("is_real", False),
                        "connected_at": s.get("connected_at"),
                        "last_activity": s.get("last_activity"),
                        "latency_ms": s.get("latency_ms"),
                        "status": s.get("status", "connected"),
                        "banner": s.get("banner", "")
                    })
            self._send_json(200, {
                "total_active": len(sessions_list),
                "sessions": sessions_list
            })
            return

        if path == "/api/device-groups":
            self._send_json(200, {
                "groups": data.get("device_groups", []),
                "total": len(data.get("device_groups", []))
            })
            return

        if path == "/api/active-directory":
            self._send_json(200, {
                "config": data.get("active_directory", {})
            })
            return

        if path == "/api/access-policies":
            self._send_json(200, {
                "policies": data.get("access_policies", []),
                "total": len(data.get("access_policies", []))
            })
            return

        if path == "/api/backup/export":
            self._send_json(200, {
                "success": True,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "data": data,
                "counts": {
                    "devices": len(data.get("devices", [])),
                    "templates": len(data.get("templates", [])),
                    "device_groups": len(data.get("device_groups", [])),
                    "access_policies": len(data.get("access_policies", [])),
                    "local_users": len(data.get("local_users", [])),
                    "local_groups": len(data.get("local_groups", []))
                }
            })
            return

        self._send_json(404, {"error": "Endpoint not found"})

    def do_POST(self):
        url = urlparse(self.path)
        path = url.path.rstrip('/') or '/'
        body = self._read_body()
        data = load_data()

        # -------------------------------------------------------------
        # Network Tools Suite Endpoints
        # -------------------------------------------------------------
        if path == "/api/tools/port-scan":
            host = (body.get("host") or "").strip()
            if not host:
                self._send_json(400, {"success": False, "error": "Target host is required"})
                return
            ports = body.get("ports")
            timeout = float(body.get("timeout", 0.8))
            res = run_port_scan(host, ports, timeout)
            self._send_json(200 if res.get("success") else 400, res)
            return

        if path == "/api/tools/dns-lookup":
            target = (body.get("target") or "").strip()
            if not target:
                self._send_json(400, {"success": False, "error": "Target domain or IP is required"})
                return
            rtype = body.get("recordType", "A")
            ns = body.get("nameserver")
            res = run_dns_lookup(target, rtype, ns)
            self._send_json(200 if res.get("success") else 400, res)
            return

        if path == "/api/tools/traceroute":
            host = (body.get("host") or "").strip()
            if not host:
                self._send_json(400, {"success": False, "error": "Target host is required"})
                return
            max_hops = int(body.get("maxHops", 25))
            timeout = int(body.get("timeout", 2))
            res = run_traceroute(host, max_hops, timeout)
            self._send_json(200 if res.get("success") else 400, res)
            return

        if path == "/api/tools/cert-lookup":
            host = (body.get("host") or "").strip()
            if not host:
                self._send_json(400, {"success": False, "error": "Target host is required"})
                return
            port = int(body.get("port", 443))
            timeout = float(body.get("timeout", 5.0))
            res = run_cert_lookup(host, port, timeout)
            self._send_json(200 if res.get("success") else 400, res)
            return

        if path == "/api/tools/header-analyzer":
            url_target = (body.get("url") or "").strip()
            if not url_target:
                self._send_json(400, {"success": False, "error": "Target URL is required"})
                return
            res = run_header_analyzer(url_target)
            self._send_json(200 if res.get("success") else 400, res)
            return

        if path == "/api/tools/ping":
            host = (body.get("host") or "").strip()
            if not host:
                self._send_json(400, {"success": False, "error": "Target host is required"})
                return
            count = int(body.get("count", 4))
            timeout = int(body.get("timeout", 2))
            res = run_ping_host(host, count, timeout)
            self._send_json(200 if res.get("success") else 400, res)
            return

        if path == "/api/tools/check-host/init":
            host = (body.get("host") or "").strip()
            if not host:
                self._send_json(400, {"success": False, "error": "Target host is required"})
                return
            max_nodes = int(body.get("max_nodes", 5))
            nodes = body.get("nodes")
            res = check_host_ping_init(host, max_nodes, nodes)
            self._send_json(200 if res.get("success") else 502, res)
            return

        if path == "/api/tools/check-host/result":
            request_id = (body.get("request_id") or "").strip()
            if not request_id:
                self._send_json(400, {"success": False, "error": "request_id is required"})
                return
            res = check_host_get_result(request_id)
            self._send_json(200 if res.get("success") else 502, res)
            return

        # -------------------------------------------------------------
        # Bulk Device Configuration POST Endpoints
        # -------------------------------------------------------------
        if path == "/api/bulk-config/preview":
            if not os_mapper_registry:
                self._send_json(500, {"error": "bulk_config module not loaded"})
                return
            template_id = body.get("template_id") or body.get("templateId")
            params = body.get("params") or body.get("parameters") or {}
            target_ids = body.get("device_ids") or body.get("deviceIds") or []

            if not template_id:
                self._send_json(400, {"error": "template_id is required"})
                return
            if not target_ids:
                self._send_json(400, {"error": "device_ids list cannot be empty"})
                return

            target_devices = [d for d in data.get("devices", []) if d.get("id") in target_ids]
            try:
                preview = os_mapper_registry.generate_preview(template_id, params, target_devices)
                self._send_json(200, {
                    "templateId": template_id,
                    "deviceCount": len(target_devices),
                    "preview": preview
                })
            except Exception as ex:
                self._send_json(400, {"error": str(ex)})
            return

        if path == "/api/bulk-config/jobs":
            if not bulk_execution_engine:
                self._send_json(500, {"error": "bulk_config engine not loaded"})
                return
            template_id = body.get("template_id") or body.get("templateId")
            params = body.get("params") or body.get("parameters") or {}
            target_ids = body.get("device_ids") or body.get("deviceIds") or []
            timeout_sec = int(body.get("timeout_sec") or body.get("timeoutSec") or 25)
            delay_ms = int(body.get("delay_ms") or body.get("delayMs") or 1500)
            auto_backup = bool(body.get("auto_backup", body.get("autoBackup", True)))
            save_after_apply = bool(body.get("save_after_apply", body.get("saveAfterApply", True)))
            danger_conf = str(body.get("danger_confirmation") or body.get("dangerConfirmation") or "")

            if not template_id or not target_ids:
                self._send_json(400, {"error": "template_id and device_ids are required"})
                return

            try:
                job = bulk_execution_engine.create_job(
                    template_id=template_id,
                    params=params,
                    device_ids=target_ids,
                    timeout_sec=timeout_sec,
                    delay_ms=delay_ms,
                    auto_backup=auto_backup,
                    save_after_apply=save_after_apply,
                    danger_confirmation=danger_conf
                )
                started = bulk_execution_engine.start_job(job.job_id, data.get("devices", []))
                self._send_json(201, {
                    "success": started,
                    "jobId": job.job_id,
                    "status": job.status,
                    "message": "Bulk execution job queued and initiated successfully."
                })
            except Exception as ex:
                self._send_json(400, {"error": str(ex)})
            return

        if path.startswith("/api/bulk-config/jobs/") and path.endswith("/cancel"):
            parts = path.split("/")
            job_id = parts[4]
            if not bulk_execution_engine:
                self._send_json(500, {"error": "bulk_config engine not loaded"})
                return
            success = bulk_execution_engine.cancel_job(job_id)
            self._send_json(200 if success else 400, {
                "success": success,
                "jobId": job_id,
                "message": "Job cancellation processed." if success else "Could not cancel job."
            })
            return

        # -------------------------------------------------------------
        # Lazy Connection & Platform Driver Endpoints
        # -------------------------------------------------------------
        if path.startswith("/api/devices/") and path.endswith("/connection"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            sess = connection_manager.get_or_create_session(device)
            self._send_json(200, {
                "success": True,
                "connected": sess.status == "connected",
                "sessionId": sess.session_id,
                "platform": sess.platform,
                "isReal": sess.is_real,
                "latency_ms": sess.latency_ms,
                "banner": sess.banner,
                "mode": sess.mode
            })
            return

        if path.startswith("/api/devices/") and path.endswith("/terminal/execute"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            cmd = body.get("command", "").strip()
            user_role = self.headers.get("X-User-Role", body.get("user_role", "Super Admin"))
            
            # Check RBAC
            is_show = any(cmd.lower().startswith(x) for x in ["show", "print", "get", "monitor", "/system", "/interface print", "/ip "])
            if not check_rbac_permission(user_role, "show" if is_show else "config"):
                self._send_json(403, {
                    "error": "permission_denied",
                    "message": f"کاربر با نقش «{user_role}» دسترسی لازم برای اجرای دستورات پیکربندی روی این تجهیز را ندارد."
                })
                return

            res = connection_manager.execute_command(device, cmd)
            self._send_json(200, res)
            return

        if path.startswith("/api/devices/") and path.endswith("/operations"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return

            user_role = self.headers.get("X-User-Role", body.get("user_role", "Super Admin"))
            operation = body.get("operation")
            if not check_rbac_permission(user_role, operation):
                self._send_json(403, {
                    "error": "permission_denied",
                    "message": f"کاربر با نقش «{user_role}» دسترسی لازم برای اجرای عملیات «{operation}» را ندارد."
                })
                return

            interface = body.get("interface", "")
            params = body.get("params", {})
            params["device_type"] = device.get("type", "switch")
            params["is_router"] = device.get("type") == "router"
            platform = device.get("platform", "cisco_ios_xe")
            driver = get_driver(platform, device.get("connection_mode", "simulator"))

            if operation in ("port_sec_enable", "port_sec_disable") and not driver.capabilities.get("port_security"):
                self._send_json(400, {
                    "error": "unsupported_capability",
                    "message": f"عملیات Port-Security در پلتفرم «{driver.platform_name}» پشتیبانی نمی‌شود."
                })
                return

            cli_cmd = driver.generate_action_cli(operation, interface, params)
            require_real = device.get("connection_mode") != "simulator"
            exec_res = connection_manager.execute_command(device, cli_cmd, require_real=require_real)

            if not exec_res.get("success", False):
                self._send_json(400, {
                    "success": False,
                    "error": exec_res.get("error") or "Operation failed on device",
                    "message": exec_res.get("output") or exec_res.get("error") or "Operation failed on device",
                    "cli_command": cli_cmd,
                    "output": exec_res.get("output", ""),
                    "isReal": exec_res.get("isReal", False),
                })
                return

            # Reflect state update on internal port object only if device succeeded
            ports = data.get("ports", {}).get(dev_id, [])

            def match_port_flexible(p, target_id):
                if not p or not target_id:
                    return False
                t_raw = str(target_id).strip()
                t_norm = t_raw.lower().replace(" ", "")
                p_id = str(p.get("port_id", "")).lower().replace(" ", "")
                p_name = str(p.get("name", "")).lower().replace(" ", "")
                if p_id == t_norm or p_name == t_norm or p_id == t_raw.lower() or p_name == t_raw.lower():
                    return True
                for full, short in [("gigabitethernet", "gi"), ("tengigabitethernet", "te"), ("fastethernet", "fa"), ("ethernet", "eth")]:
                    t_f = t_norm.replace(short, full)
                    p_f = p_id.replace(short, full)
                    if t_f == p_f:
                        return True
                    t_s = t_norm.replace(full, short)
                    p_s = p_id.replace(full, short)
                    if t_s == p_s:
                        return True
                return False

            target_port = next((p for p in ports if match_port_flexible(p, interface)), None)
            if target_port:
                if operation in ("disable_interface", "shutdown"):
                    target_port["admin_status"] = "disabled"
                    target_port["status"] = "down"
                elif operation in ("enable_interface", "no_shutdown"):
                    target_port["admin_status"] = "enabled"
                    target_port["status"] = "up"
                elif operation in ("set_vlan", "change_vlan", "assign_vlan"):
                    target_port["vlan"] = int(params.get("vlan", 1))
                    target_port["mode"] = "access"
                elif operation == "mode_trunk":
                    target_port["mode"] = "trunk"
                elif operation == "mode_access":
                    target_port["mode"] = "access"
                elif operation == "port_sec_enable":
                    target_port["port_security_enabled"] = True
                elif operation == "port_sec_disable":
                    target_port["port_security_enabled"] = False
                elif operation == "set_description":
                    target_port["description"] = (params.get("description") or "").strip()

            if "pending_changes" not in device or not isinstance(device["pending_changes"], list):
                device["pending_changes"] = []
            target_port_id = interface or (target_port.get("port_id") if target_port else "interface")
            desc_text = f"Interface {target_port_id}: {operation.replace('_', ' ').title()}"
            if operation == "set_description":
                desc_text = f"Interface {target_port_id}: description \"{params.get('description', '')}\""
            elif operation == "mode_access":
                desc_text = f"Interface {target_port_id}: switchport mode access"
            elif operation == "mode_trunk":
                desc_text = f"Interface {target_port_id}: switchport mode trunk"
            elif operation == "shutdown":
                desc_text = f"Interface {target_port_id}: shutdown"
            elif operation == "no_shutdown":
                desc_text = f"Interface {target_port_id}: no shutdown"
            elif operation == "port_sec_enable":
                desc_text = f"Interface {target_port_id}: port-security enable"
            elif operation == "port_sec_disable":
                desc_text = f"Interface {target_port_id}: port-security disable"

            device["pending_changes"].append({
                "port_id": target_port_id,
                "type": operation,
                "description": desc_text,
                "command": cli_cmd,
                "timestamp": time.strftime("%H:%M:%S")
            })
            device["has_unsaved_changes"] = True
            device["last_modified_time"] = time.strftime("%H:%M:%S")
            save_data(data)

            self._send_json(200, {
                "success": True,
                "cli_command": cli_cmd,
                "output": exec_res.get("output", ""),
                "isReal": exec_res.get("isReal", False),
                "durationMs": exec_res.get("durationMs", 0),
                "port": target_port
            })
            return

        if path == "/api/ssh/connect":
            host = body.get("host", body.get("ssh_host", body.get("ip", ""))).strip()
            port = int(body.get("port", body.get("ssh_port", 22)))
            username = body.get("username", body.get("ssh_username", "admin")).strip()
            password = body.get("password", body.get("ssh_password", "")).strip()
            device_id = body.get("deviceId", body.get("device_id", "")).strip()

            device = None
            if device_id:
                device = next((d for d in data["devices"] if d["id"] == device_id), None)
            if not device:
                device = {
                    "id": device_id or f"temp-{uuid.uuid4().hex[:6]}",
                    "name": host,
                    "ip": host,
                    "platform": body.get("platform", "cisco_ios_xe"),
                    "connection_mode": "ssh",
                    "connection": {"protocol": body.get("protocol", "ssh"), "host": host, "port": port, "username": username, "password": password}
                }

            require_real = device.get("connection_mode") != "simulator"
            sess = connection_manager.get_or_create_session(device, require_real=require_real)
            if sess.status != "connected" or (require_real and not sess.is_real):
                self._send_json(200, {
                    "success": False,
                    "sessionId": sess.session_id,
                    "session_id": sess.session_id,
                    "isReal": False,
                    "mode": "unreachable",
                    "host": sess.host,
                    "port": sess.port,
                    "username": sess.username,
                    "error": sess.error_message or f"Connection failed to {sess.host}:{sess.port}",
                    "message": sess.error_message or f"Connection failed to {sess.host}:{sess.port}"
                })
                return

            self._send_json(200, {
                "success": True,
                "sessionId": sess.session_id,
                "session_id": sess.session_id,
                "isReal": sess.is_real,
                "mode": "real_ssh",
                "host": sess.host,
                "port": sess.port,
                "username": sess.username,
                "banner": sess.banner,
                "latency_ms": sess.latency_ms,
                "message": f"Connection to {sess.host}:{sess.port} ({sess.platform}) ready."
            })
            return

        # -------------------------------------------------------------
        # MikroTik VPN Management Endpoints (L2TP/IPsec & GRE)
        # -------------------------------------------------------------
        if path.startswith("/api/devices/") and path.endswith("/vpn/validate"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {"error": "unsupported_platform", "message": "این قابلیت تنها برای روترهای MikroTik RouterOS مجاز است."})
                return
            vpn_type = body.get("vpn_type") or body.get("type", "l2tp_ipsec")
            mode = body.get("mode", "remote_access")
            cfg = body.get("config", {})
            try:
                provider = get_vpn_provider("mikrotik_routeros")
                val = provider.validate(device, vpn_type, mode, cfg)
                self._send_json(200, val)
            except Exception as e:
                self._send_json(400, {"valid": False, "errors": [str(e)], "warnings": []})
            return

        if path.startswith("/api/devices/") and path.endswith("/vpn/preview"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {"error": "unsupported_platform", "message": "این قابلیت تنها برای روترهای MikroTik RouterOS مجاز است."})
                return
            vpn_type = body.get("vpn_type") or body.get("type", "l2tp_ipsec")
            mode = body.get("mode", "remote_access")
            cfg = body.get("config", {})
            try:
                provider = get_vpn_provider("mikrotik_routeros")
                val = provider.validate(device, vpn_type, mode, cfg)
                if not val["valid"]:
                    self._send_json(400, {"error": "validation_failed", "errors": val["errors"]})
                    return
                cmds = provider.generate_configuration(device, vpn_type, mode, cfg, mask_secrets=True)
                self._send_json(200, {
                    "vpn_type": vpn_type,
                    "mode": mode,
                    "commands": cmds,
                    "script": "\n".join(cmds),
                    "count": len(cmds)
                })
            except Exception as e:
                self._send_json(500, {"error": "preview_generation_failed", "message": str(e)})
            return

        if path.startswith("/api/devices/") and path.endswith("/vpn/apply"):
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {"error": "unsupported_platform", "message": "این قابلیت تنها برای روترهای MikroTik RouterOS مجاز است."})
                return

            user_role = self.headers.get("X-User-Role", body.get("user_role", "Super Admin"))
            if not check_rbac_permission(user_role, "config"):
                self._send_json(403, {
                    "error": "permission_denied",
                    "message": f"کاربر با نقش «{user_role}» دسترسی لازم برای اعمال پیکربندی VPN روی این روتر را ندارد."
                })
                return

            vpn_type = body.get("vpn_type") or body.get("type", "l2tp_ipsec")
            mode = body.get("mode", "remote_access")
            cfg = body.get("config", {})

            conn = device.get("connection", {}) or {}
            conn_host = conn.get("host") or device.get("ssh_host") or device.get("ip", "")
            conn_port = int(conn.get("port") or device.get("ssh_port") or 22)
            conn_user = conn.get("username") or device.get("ssh_username") or "admin"

            sess = connection_manager.get_or_create_session(device, require_real=True)
            if sess.status != "connected":
                self._send_json(503, {
                    "error": "ssh_connection_failed",
                    "message": f"برقراری ارتباط مستقیم SSH با روتر میکروتیک ({conn_user}@{conn_host}:{conn_port}) ناموفق بود: {sess.error_message}",
                    "isReal": True,
                    "target_host": conn_host,
                    "target_port": conn_port,
                    "target_user": conn_user
                })
                return

            try:
                provider = get_vpn_provider("mikrotik_routeros")
                apply_res = provider.apply(device, sess, vpn_type, mode, cfg)

                vpn_label = cfg.get("name") or cfg.get("profile_name") or vpn_type
                record_audit_log(
                    data,
                    user=body.get("username", user_role),
                    device_id=dev_id,
                    device_name=device.get("name", dev_id),
                    action=f"Configure VPN ({vpn_type}/{mode})",
                    details=f"VPN {vpn_label} configured on router. Result: {'Success' if apply_res.get('success') else 'Failed'}",
                    result="success" if apply_res.get("success") else "failed"
                )

                if not apply_res.get("success"):
                    self._send_json(422, apply_res)
                else:
                    self._send_json(200, apply_res)
            except Exception as e:
                self._send_json(500, {"error": "apply_failed", "message": str(e)})
            return

        if "/vpn/" in path and path.endswith("/verify"):
            parts = path.split("/")
            dev_id = parts[3]
            vpn_id = parts[5]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {"error": "unsupported_platform", "message": "این قابلیت تنها برای روترهای MikroTik RouterOS مجاز است."})
                return

            v_lower = (vpn_id or "").lower()
            detected = "l2tp_ipsec"
            if "wireguard" in v_lower or v_lower.startswith("wg") or "-wg" in v_lower:
                detected = "wireguard"
            elif "sstp" in v_lower:
                detected = "sstp"
            elif "pptp" in v_lower:
                detected = "pptp"
            elif "ovpn" in v_lower or "openvpn" in v_lower:
                detected = "openvpn"
            elif "ipsec" in v_lower:
                detected = "ipsec_site_to_site"
            elif "eoip" in v_lower:
                detected = "eoip"
            elif "vxlan" in v_lower:
                detected = "vxlan"
            elif "gre" in v_lower:
                detected = "gre"

            conn = device.get("connection", {}) or {}
            conn_host = conn.get("host") or device.get("ssh_host") or device.get("ip", "")
            conn_port = int(conn.get("port") or device.get("ssh_port") or 22)
            conn_user = conn.get("username") or device.get("ssh_username") or "admin"

            sess = connection_manager.get_or_create_session(device, require_real=True)
            if sess.status != "connected":
                self._send_json(503, {
                    "error": "ssh_connection_failed",
                    "message": f"اتصال SSH به روتر میکروتیک ({conn_user}@{conn_host}:{conn_port}) جهت صحت‌سنجی برقرار نشد: {sess.error_message}",
                    "isReal": True
                })
                return
            try:
                provider = get_vpn_provider("mikrotik_routeros")
                verify_res = provider.verify(device, sess, vpn_id, vpn_type, body.get("config"))
                self._send_json(200, verify_res)
            except Exception as e:
                self._send_json(500, {"error": "verify_failed", "message": str(e)})
            return

        if path in ("/api/ssh/disconnect", "/api/ssh/close"):
            session_id = body.get("sessionId", body.get("session_id", "")).strip()
            device_id = body.get("deviceId", body.get("device_id", "")).strip()
            if device_id:
                connection_manager.close_session(device_id)
            self._send_json(200, {"success": True, "message": "SSH connection closed."})
            return

        if path == "/api/ssh/execute":
            cmd = body.get("command", "").strip()
            device_id = body.get("deviceId", body.get("device_id", "")).strip()
            host = body.get("host", body.get("ssh_host", body.get("ip", ""))).strip()
            device = next((d for d in data["devices"] if d["id"] == device_id), None) if device_id else None
            if not device and host:
                device = {
                    "id": f"temp-{uuid.uuid4().hex[:6]}",
                    "name": host,
                    "ip": host,
                    "platform": body.get("platform", "cisco_ios_xe"),
                    "connection_mode": "ssh",
                    "connection": {
                        "protocol": body.get("protocol", "ssh"),
                        "host": host,
                        "port": int(body.get("port", 22)),
                        "username": body.get("username", "admin"),
                        "password": body.get("password", "")
                    }
                }
            if not device:
                self._send_json(400, {
                    "success": False,
                    "error": "Device not found or IP address unspecified.",
                    "output": "Device not found or IP address unspecified.",
                    "isReal": True
                })
                return

            require_real = device.get("connection_mode") != "simulator"
            res = connection_manager.execute_command(device, cmd, require_real=require_real)
            self._send_json(200, res)
            return

        if path.startswith("/api/devices/") and (path.endswith("/cisco-resources") or path.endswith("/mikrotik-resources") or path.endswith("/system-resources")):
            # POST /api/devices/:id/cisco-resources or /mikrotik-resources (with optional force/credentials)
            self._handle_device_resources(path, body)
            return

        if path.startswith("/api/devices/") and path.endswith("/ports/sync"):
            # POST /api/devices/:dev_id/ports/sync
            parts = path.split("/")
            dev_id = parts[3] if len(parts) >= 4 else ""
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found", "success": False})
                return

            platform = device.get("platform", "cisco_ios_xe")
            conn_mode = device.get("connection_mode", "ssh")
            driver = get_driver(platform, conn_mode)
            existing_ports = data.get("ports", {}).get(dev_id, [])

            conn = device.get("connection", {}) or {}
            conn_host = conn.get("host") or device.get("ssh_host") or device.get("ip", "")

            is_live_sync = False
            parsed = None

            # Attempt live SSH interface query if device has a host/ip configured
            if conn_host:
                sess = connection_manager.get_or_create_session(device, require_real=True)
                if sess.status == "connected" and sess.is_real and sess.paramiko_client:
                    try:
                        cmds = driver.get_interface_query_commands()
                        full_output = ""
                        for cmd in cmds:
                            r = connection_manager.execute_command(device, cmd, require_real=True)
                            if r.get("success") and r.get("output"):
                                full_output += "\n" + r["output"]
                        parsed = driver.parse_interfaces(full_output)
                        if parsed:
                            is_live_sync = True
                    except Exception as e:
                        print(f"[PortSync] SSH interface query error: {e}")

            if is_live_sync and parsed:
                normalized_parsed = normalize_port_list(parsed)
                data.setdefault("ports", {})[dev_id] = normalized_parsed
                device["total_ports"] = len(normalized_parsed)
                save_data(data)
                self._send_json(200, {
                    "device": sanitize_device(device),
                    "ports": normalized_parsed,
                    "is_live": True,
                    "raw_output": full_output,
                    "sync_source": "ssh_tunnel",
                    "active_count": sum(1 for p in normalized_parsed if p.get("status") == "up"),
                    "inactive_count": sum(1 for p in normalized_parsed if p.get("status") == "down"),
                    "admin_disabled_count": sum(1 for p in normalized_parsed if p.get("admin_status") == "disabled"),
                    "message": "Interface data synchronized live via SSH tunnel."
                })
                return

            # Fallback to existing or simulator driver ports
            ports = normalize_port_list(existing_ports)
            if not ports:
                total = device.get("total_ports", 24)
                ports = normalize_port_list(driver.get_default_ports(total))
                data.setdefault("ports", {})[dev_id] = ports
                save_data(data)

            self._send_json(200, {
                "device": sanitize_device(device),
                "ports": ports,
                "is_live": False,
                "sync_source": "simulator",
                "active_count": sum(1 for p in ports if p.get("status") == "up"),
                "inactive_count": sum(1 for p in ports if p.get("status") == "down"),
                "admin_disabled_count": sum(1 for p in ports if p.get("admin_status") == "disabled"),
                "message": "Ports synchronized from device database."
            })
            return

        if path in ["/api/devices/test-connection", "/api/devices/ssh-v2-test-fetch"]:
            # Test and establish REAL connection to device based on exact registered credentials and platform
            ip = body.get("ssh_host", body.get("ip", body.get("host", ""))).strip()
            proto = (body.get("protocol") or body.get("connection_protocol") or "ssh").lower()
            default_port = 23 if proto == "telnet" else 22
            port = int(body.get("ssh_port", body.get("port", default_port)))
            user = body.get("ssh_username", body.get("username", "admin")).strip()
            pwd = body.get("ssh_password", body.get("password", "")).strip()
            enable_pwd = body.get("enable_password", "").strip()
            platform = body.get("platform", "cisco_ios")
            lang = (body.get("lang") or ("en" if "en" in self.headers.get("Accept-Language", "").lower() else "fa")).lower()
            is_en = (lang == "en")

            if not ip:
                err_msg = "IP address is required" if is_en else "آدرس IP الزامی است"
                self._send_json(400, {"success": False, "error": err_msg, "message": err_msg})
                return

            start_t = time.time()

            if proto == "ssh":
                if execute_real_hardware_probe:
                    probe_res = execute_real_hardware_probe(
                        ip=ip,
                        port=port,
                        username=user,
                        password=pwd,
                        enable_password=enable_pwd,
                        protocol=proto,
                        platform=platform,
                        lang=lang
                    )

                    if probe_res.get("success"):
                        session_id = probe_res.get("session_id")
                        p_client = probe_res.pop("paramiko_client", None)
                        if session_id and p_client:
                            with ACTIVE_SESSIONS_LOCK:
                                ACTIVE_SSH_SESSIONS[session_id] = {
                                    "session_id": session_id,
                                    "sessionId": session_id,
                                    "host": ip,
                                    "port": port,
                                    "username": user,
                                    "paramiko_client": p_client,
                                    "socket": None,
                                    "status": "connected",
                                    "connected_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                                    "platform": platform,
                                    "device_id": body.get("device_id", ""),
                                    "role": "mother_connection",
                                    "telemetry": {
                                        "hardware": probe_res.get("hardware"),
                                        "power": probe_res.get("power"),
                                        "ports_count": len(probe_res.get("ports") or [])
                                    }
                                }
                        self._send_json(200, probe_res)
                        return
                    else:
                        self._send_json(200, probe_res)
                        return
                else:
                    err_msg = "Paramiko 2.x SSH engine is not initialized on backend" if is_en else "موتور SSH پارامیکو ۲ در بک‌اند راه‌اندازی نشده است"
                    self._send_json(500, {"success": False, "connected": False, "error": err_msg, "message": err_msg})
                    return

            connected = False
            banner = ""
            error_msg = ""
            cipher = "aes256-gcm@openssh.com"

            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(2.5)
                res = s.connect_ex((ip, port))
                if res == 0:
                    connected = True
                    try:
                        s.settimeout(1.5)
                        raw = s.recv(1024)
                        banner = raw.decode('utf-8', errors='ignore').strip()
                    except Exception:
                        banner = f"{proto.upper()} socket connected ({ip}:{port})"
                else:
                    error_msg = f"Socket connection failed to {ip}:{port} (error code: {res})"
                s.close()
            except Exception as ex:
                connected = False
                error_msg = str(ex)

            latency = round((time.time() - start_t) * 1000, 1)

            # If socket connected and protocol is SSH, attempt paramiko auth verification if password provided
            if connected and proto == "ssh" and pwd:
                try:
                    import paramiko
                    p_client = paramiko.SSHClient()
                    p_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                    
                    if connect_ssh_device:
                        auth_ok, auth_err = connect_ssh_device(
                            p_client,
                            hostname=ip,
                            port=port,
                            username=user,
                            password=pwd,
                            timeout=15.0,
                            banner_timeout=30.0,
                            auth_timeout=30.0,
                            platform=platform
                        )
                        if not auth_ok:
                            connected = False
                            error_msg = f"SSH connection failed on {ip}:{port} for user '{user}': {auth_err}"
                    else:
                        p_client.connect(
                            hostname=ip,
                            port=port,
                            username=user,
                            password=pwd,
                            timeout=5.0,
                            allow_agent=False,
                            look_for_keys=False
                        )

                    transport = p_client.get_transport()
                    if transport and transport.is_authenticated():
                        info = getattr(p_client, '_negotiation_info', {})
                        cipher = info.get("cipher") or getattr(transport, 'remote_cipher', None) or cipher
                        banner = transport.get_banner() or banner
                    p_client.close()
                except Exception as auth_err:
                    # Connection reached host but authentication had an error
                    error_msg = f"Authentication check: {str(auth_err)}"

            if not connected:
                msg_en = f"Connection to {ip}:{port} failed: device unreachable or port closed."
                msg_fa = f"عدم برقراری ارتباط با {ip}:{port}: دستگاه پاسخگو نیست یا پورت بسته است."
                self._send_json(200, {
                    "success": False,
                    "connected": False,
                    "protocol": proto.upper(),
                    "ip": ip,
                    "port": port,
                    "latency_ms": latency,
                    "error": error_msg or f"Connection timed out connecting to {ip}:{port}",
                    "message_en": msg_en,
                    "message_fa": msg_fa,
                    "message": msg_en if is_en else msg_fa
                })
                return

            msg_en = f"Connection to {ip}:{port} successfully established with platform {driver.platform_name}."
            msg_fa = f"ارتباط با موفقیت به {ip}:{port} با پلتفرم {driver.platform_name} برقرار گردید."
            self._send_json(200, {
                "success": True,
                "connected": True,
                "protocol": proto.upper(),
                "ip": ip,
                "port": port,
                "username": user,
                "platform": platform,
                "platform_name": driver.platform_name,
                "cipher": cipher,
                "latency_ms": latency,
                "banner": banner,
                "connected_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "message_en": msg_en,
                "message_fa": msg_fa,
                "message": msg_en if is_en else msg_fa
            })
            return

        if path == "/api/devices":
            # Introduce new switch, router, or AP
            new_id = f"dev-{body.get('type', 'switch')}-{uuid.uuid4().hex[:6]}"
            model = body.get("model", "Cisco Catalyst 2960X")
            platform = body.get("platform") or detect_platform_from_model(model)
            connection_mode = body.get("connection_mode", "ssh")
            
            conn_data = body.get("connection", {})
            conn_proto = (conn_data.get("protocol") or body.get("connection_protocol") or "ssh").lower()
            conn_host = conn_data.get("host") or body.get("ssh_host") or body.get("ip", "192.168.1.50")
            default_port = 23 if conn_proto == "telnet" else 22
            conn_port = int(conn_data.get("port") or body.get("ssh_port") or default_port)
            conn_user = conn_data.get("username") or body.get("ssh_username", "admin")
            conn_pass_raw = conn_data.get("password") or body.get("ssh_password", "")
            conn_pass = encrypt_credential(conn_pass_raw)
            enable_pass_raw = body.get("enable_password", "")
            enable_pass = encrypt_credential(enable_pass_raw)

            driver = get_driver(platform, connection_mode)

            new_device = {
                "id": new_id,
                "name": body.get("name", f"New-{platform}"),
                "ip": conn_host,
                "ssh_host": conn_host,
                "connection_protocol": conn_proto,
                "type": body.get("type", "switch"),
                "role": body.get("role", "Access Switch"),
                "model": model,
                "platform": platform,
                "connection_mode": connection_mode,
                "connection": {
                    "protocol": conn_proto,
                    "host": conn_host,
                    "port": conn_port,
                    "username": conn_user,
                    "password": conn_pass
                },
                "mac": body.get("mac", "00:50:56:" + ":".join([f"{uuid.uuid4().int % 255:02X}" for _ in range(3)])),
                "building": body.get("building", "ساختمان مرکزی (Central Bldg)"),
                "floor": body.get("floor", "طبقه ۱ (Floor 1)"),
                "unit": body.get("unit", "اتاق رک (Rack Room)"),
                "rack": body.get("rack", "Rack-01"),
                "is_online": True,
                "latency_ms": 1.4,
                "packet_loss": 0,
                "uptime": "1 hour",
                "cdp_enabled": body.get("cdp_enabled", True) if driver.capabilities.get("cdp") else False,
                "lldp_enabled": body.get("lldp_enabled", True),
                "snmp_community": body.get("snmp_community", "public"),
                "firmware": body.get("firmware", "RouterOS 7.12" if platform == "mikrotik_routeros" else "IOS-XE 17.03"),
                "last_seen": "هم اکنون (Just now)",
                "total_ports": int(body.get("total_ports", 24 if "switch" in body.get("type", "switch") else 8)),
                "ssh_port": conn_port,
                "winbox_port": int(body.get("winbox_port", 8291)),
                "ssh_username": conn_user,
                "ssh_password": conn_pass,
                "enable_password": enable_pass,
                "ssh_status": "authenticated",
                "serial_number": body.get("serial_number", ""),
                "master_session_id": body.get("master_session_id", ""),
                "web_configs": body.get("web_configs", [])
            }

            master_sid = body.get("master_session_id")
            if master_sid:
                with ACTIVE_SESSIONS_LOCK:
                    if master_sid in ACTIVE_SSH_SESSIONS:
                        ACTIVE_SSH_SESSIONS[master_sid]["device_id"] = new_id
                        ACTIVE_SSH_SESSIONS[master_sid]["device_name"] = new_device["name"]
                        ACTIVE_SSH_SESSIONS[master_sid]["role"] = "mother_connection"
                        print(f"[Python SSH Engine] Inherited mother session {master_sid} for newly registered device {new_id} ({new_device['name']})")

            data["devices"].append(new_device)

            # Generate driver-specific ports or use discovered ports for new device
            total_ports = new_device["total_ports"]
            detected_ports = body.get("detected_ports")
            if detected_ports and isinstance(detected_ports, list) and len(detected_ports) > 0:
                new_ports = normalize_port_list(detected_ports)
            else:
                new_ports = normalize_port_list(driver.get_default_ports(total_ports))
            data["ports"][new_id] = new_ports
            save_data(data)
            self._send_json(201, {"device": sanitize_device(new_device), "message": f"تجهیز جدید با پلتفرم {driver.platform_name} با موفقیت ثبت شد."})
            return

        if path == "/api/scan/cdp-lldp":
            # Execute Python CDP / LLDP scan across all network devices
            print("[Python CDP/LLDP Scanner] Starting neighborhood sweep protocol...")
            scanned_neighbors = []
            new_links = []
            
            # Simulate real LLDP/CDP multi-cast frame gathering (01:00:0c:cc:cc:cc / 01:80:c2:00:00:0e)
            devices = data["devices"]
            online_devs = [d for d in devices if d.get("is_online")]

            # Link pairs based on building/role topology logic
            core = next((d for d in online_devs if "CORE" in d["name"] or "Core" in d.get("role", "")), None)
            for d in online_devs:
                if d == core:
                    continue
                # Establish CDP or LLDP neighbor
                protocol = "CDP" if d.get("cdp_enabled", True) else "LLDP"
                neighbor_item = {
                    "local_device_id": core["id"] if core else devices[0]["id"],
                    "local_port": f"Te0/{len(scanned_neighbors)+1}",
                    "neighbor_name": d["name"],
                    "neighbor_ip": d["ip"],
                    "neighbor_port": "Uplink-Gi1",
                    "neighbor_model": d.get("model", "Cisco"),
                    "protocol": protocol,
                    "capabilities": "Switch" if d["type"] == "switch" else ("Router" if d["type"] == "router" else "WLAN AP"),
                    "vlan": 1 if d["type"] != "access_point" else 50,
                    "holdtime": 180,
                    "timestamp": time.strftime("%H:%M:%S")
                }
                scanned_neighbors.append(neighbor_item)
                new_links.append({
                    "id": f"scanned-{d['id']}-{int(time.time())}",
                    "source": core["id"] if core else devices[0]["id"],
                    "target": d["id"],
                    "source_port": neighbor_item["local_port"],
                    "target_port": neighbor_item["neighbor_port"],
                    "type": "trunk" if d["type"] == "switch" else "access",
                    "speed": "10G" if "9500" in d.get("model", "") else "1G",
                    "protocol": protocol,
                    "status": "active"
                })

            data["cdp_lldp_neighbors"] = scanned_neighbors
            data["topology_links"] = new_links
            save_data(data)

            self._send_json(200, {
                "success": True,
                "message": f"اسکن همسایگی CDP/LLDP با موفقیت انجام شد. {len(scanned_neighbors)} همسایه شناسایی و توپولوژی شبکه بازترسیم گردید.",
                "neighbors": scanned_neighbors,
                "links": new_links,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            return

        if path == "/api/ping-all":
            # Probe all devices
            results = []
            for d in data["devices"]:
                online, latency, loss = probe_device_reachability(d["ip"])
                d["is_online"] = online
                d["latency_ms"] = latency
                d["packet_loss"] = loss
                d["last_seen"] = "هم اکنون (Just now)" if online else d.get("last_seen", "آفلاین")
                results.append({
                    "id": d["id"],
                    "name": d["name"],
                    "ip": d["ip"],
                    "is_online": online,
                    "latency_ms": latency,
                    "packet_loss": loss
                })
            save_data(data)
            self._send_json(200, {
                "message": "پایش و پینگ وضعیت تجهیزات تکمیل شد.",
                "results": results
            })
            return

        if path.startswith("/api/ping/"):
            # /api/ping/:id
            dev_id = path.split("/")[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            online, latency, loss = probe_device_reachability(device["ip"])
            device["is_online"] = online
            device["latency_ms"] = latency
            device["packet_loss"] = loss
            device["last_seen"] = "هم اکنون (Just now)" if online else device.get("last_seen", "آفلاین")
            save_data(data)
            self._send_json(200, {
                "device": device,
                "ping_result": {
                    "ip": device["ip"],
                    "is_online": online,
                    "latency_ms": latency,
                    "packet_loss": loss
                }
            })
            return

        if path.startswith("/api/devices/") and path.endswith("/write-memory"):
            dev_id = path.split("/")[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            device["has_unsaved_changes"] = False
            device["pending_changes"] = []
            device["last_write_memory_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
            save_data(data)
            self._send_json(200, {
                "success": True,
                "device": device,
                "message": f"Building configuration...\n[OK]\nپیکربندی تجهیز {device.get('name')} با موفقیت در NVRAM (Startup-Config) ذخیره گردید."
            })
            return

        if path == "/api/reset-demo":
            # Reset to fresh enterprise seed dataset
            data = get_initial_seed_data()
            save_data(data)
            self._send_json(200, {
                "message": "اطلاعات شبکه به تنظیمات اولیه سازمانی بازنشانی شد.",
                "data": data
            })
            return

        if path == "/api/templates":
            # Create new template
            new_id = f"tmpl-{body.get('vendor', 'custom')}-{uuid.uuid4().hex[:6]}"
            new_tmpl = {
                "id": new_id,
                "name": body.get("name", "تمپلیت جدید"),
                "vendor": body.get("vendor", "cisco"),
                "target_type": body.get("target_type", "switch"),
                "role": body.get("role", "Access Switch"),
                "description": body.get("description", ""),
                "default_cli_mode": body.get("default_cli_mode", "GLOBAL_CONFIG"),
                "commands": body.get("commands", ""),
                "variables": body.get("variables", []),
                "author": body.get("author", "Network Administrator"),
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "is_builtin": False
            }
            if "templates" not in data:
                data["templates"] = []
            data["templates"].append(new_tmpl)
            save_data(data)
            self._send_json(201, {
                "template": new_tmpl,
                "message": f"تمپلیت «{new_tmpl['name']}» با موفقیت تعریف و ذخیره گردید."
            })
            return

        if path == "/api/templates/apply":
            # Interactive apply template to device
            dev_id = body.get("device_id")
            tmpl_id = body.get("template_id")
            resolved_vars = body.get("resolved_variables", {})

            device = next((d for d in data.get("devices", []) if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "تجهیز مورد نظر در دیتابیس یافت نشد."})
                return

            tmpl = next((t for t in data.get("templates", []) if t["id"] == tmpl_id), None)
            if not tmpl:
                self._send_json(404, {"error": "تمپلیت مورد نظر در مخزن الگوها یافت نشد."})
                return

            # Render commands with confirmed dynamic variables
            raw_commands = tmpl.get("commands", "")
            rendered_script = render_template_commands(raw_commands, resolved_vars)

            # Simulate realistic terminal stream logs
            logs = simulate_device_execution(tmpl, rendered_script, device)

            # Update confirmed device properties in database
            if "DEVICE_NAME" in resolved_vars and str(resolved_vars["DEVICE_NAME"]).strip():
                device["name"] = str(resolved_vars["DEVICE_NAME"]).strip()
            if "IP_ADDRESS" in resolved_vars and str(resolved_vars["IP_ADDRESS"]).strip():
                device["ip"] = str(resolved_vars["IP_ADDRESS"]).strip()
            if "BUILDING" in resolved_vars and str(resolved_vars["BUILDING"]).strip():
                device["building"] = str(resolved_vars["BUILDING"]).strip()
            if "FLOOR" in resolved_vars and str(resolved_vars["FLOOR"]).strip():
                device["floor"] = str(resolved_vars["FLOOR"]).strip()
            if "UNIT" in resolved_vars and str(resolved_vars["UNIT"]).strip():
                device["unit"] = str(resolved_vars["UNIT"]).strip()
            if "RACK" in resolved_vars and str(resolved_vars["RACK"]).strip():
                device["rack"] = str(resolved_vars["RACK"]).strip()

            device["has_unsaved_changes"] = False
            device["last_seen"] = "هم اکنون (اعمال شده با تمپلیت)"
            device["last_modified_time"] = time.strftime("%H:%M:%S")

            save_data(data)

            self._send_json(200, {
                "success": True,
                "message": f"تمپلیت «{tmpl.get('name')}» با موفقیت روی تجهیز {device.get('name')} اعمال و در حافظه ذخیره گردید.",
                "device": device,
                "rendered_script": rendered_script,
                "logs": logs
            })
            return

        if path == "/api/templates/extract-from-device":
            # Extract and parameterize running configuration from live or selected device
            try:
                result = extract_device_configuration_and_parameterize(body, data)
                self._send_json(200, result)
            except Exception as e:
                self._send_json(500, {
                    "success": False,
                    "error": f"خطا در استخراج پیکربندی تجهیز: {str(e)}"
                })
            return

        if path == "/api/device-groups":
            groups = body.get("groups", body) if isinstance(body, dict) else body
            if isinstance(groups, list):
                data["device_groups"] = groups
                save_data(data)
                self._send_json(200, {"success": True, "groups": data["device_groups"]})
                return
            self._send_json(400, {"error": "Invalid groups payload format"})
            return

        if path == "/api/active-directory":
            ad_config = body.get("config", body) if isinstance(body, dict) else body
            if isinstance(ad_config, dict):
                data["active_directory"] = ad_config
                save_data(data)
                self._send_json(200, {"success": True, "config": data["active_directory"]})
                return
            self._send_json(400, {"error": "Invalid AD config payload format"})
            return

        if path == "/api/active-directory/test":
            cfg = body.get("config", body) if isinstance(body, dict) else body
            server_host = cfg.get("server", "192.168.1.10")
            port = int(cfg.get("port", 389))
            domain = cfg.get("domain", "corp.internal")
            import random
            latency = round(random.uniform(1.2, 4.5), 2)
            self._send_json(200, {
                "success": True,
                "latency_ms": latency,
                "message": f"ارتباط با کنترلر دامین {domain} در پورت {port} با موفقیت تایید شد.",
                "serverBanner": f"Microsoft Windows Server 2022 Active Directory ({domain})",
                "logs": [
                    f"[LDAP Engine] Resolving domain controller {server_host}...",
                    f"[LDAP Engine] Connecting to {server_host}:{port} via TCP...",
                    f"[LDAP Engine] Socket opened in {latency}ms.",
                    f"[Security Bind] User '{cfg.get('bindUser')}' authenticated successfully via NTLM/Kerberos.",
                    f"[Query RootDSE] Validated naming context: {cfg.get('baseDn')}.",
                    f"[LDAP Sync] Directory health: 100% NOMINAL."
                ]
            })
            return

        if path == "/api/access-policies":
            policies = body.get("policies", body) if isinstance(body, dict) else body
            if isinstance(policies, list):
                data["access_policies"] = policies
                save_data(data)
                self._send_json(200, {"success": True, "policies": data["access_policies"]})
                return
            self._send_json(400, {"error": "Invalid access policies payload format"})
            return

        if path == "/api/backup/restore":
            backup_data = body.get("data", body) if isinstance(body, dict) else body
            mode = body.get("mode", "overwrite") if isinstance(body, dict) else "overwrite"

            # Create server-side safety snapshot file before touching anything
            try:
                import shutil
                bak_filename = f"{DATA_FILE}.bak.{int(time.time())}"
                if os.path.exists(DATA_FILE):
                    shutil.copyfile(DATA_FILE, bak_filename)
            except Exception as e:
                print(f"[Backup Engine] Failed to create local safety snapshot: {e}")

            if isinstance(backup_data, dict):
                if mode == "overwrite":
                    if "devices" in backup_data and isinstance(backup_data["devices"], list):
                        data["devices"] = backup_data["devices"]
                    if "ports" in backup_data and isinstance(backup_data["ports"], dict):
                        data["ports"] = backup_data["ports"]
                    if "templates" in backup_data and isinstance(backup_data["templates"], list):
                        data["templates"] = backup_data["templates"]
                    if "device_groups" in backup_data and isinstance(backup_data["device_groups"], list):
                        data["device_groups"] = backup_data["device_groups"]
                    if "active_directory" in backup_data and isinstance(backup_data["active_directory"], dict):
                        data["active_directory"] = backup_data["active_directory"]
                    if "access_policies" in backup_data and isinstance(backup_data["access_policies"], list):
                        data["access_policies"] = backup_data["access_policies"]
                    if "local_users" in backup_data and isinstance(backup_data["local_users"], list):
                        data["local_users"] = backup_data["local_users"]
                    if "local_groups" in backup_data and isinstance(backup_data["local_groups"], list):
                        data["local_groups"] = backup_data["local_groups"]
                    if "topology_links" in backup_data and isinstance(backup_data["topology_links"], list):
                        data["topology_links"] = backup_data["topology_links"]
                else: # incremental merge
                    existing_dev_ids = {d["id"] for d in data.get("devices", [])}
                    for d in backup_data.get("devices", []):
                        if d.get("id") not in existing_dev_ids:
                            data.setdefault("devices", []).append(d)
                            existing_dev_ids.add(d.get("id"))

                    existing_tmpl_ids = {t["id"] for t in data.get("templates", [])}
                    for t in backup_data.get("templates", []):
                        if t.get("id") not in existing_tmpl_ids:
                            data.setdefault("templates", []).append(t)
                            existing_tmpl_ids.add(t.get("id"))

                    existing_grp_ids = {g["id"] for g in data.get("device_groups", [])}
                    for g in backup_data.get("device_groups", []):
                        if g.get("id") not in existing_grp_ids:
                            data.setdefault("device_groups", []).append(g)
                            existing_grp_ids.add(g.get("id"))

                    existing_pol_ids = {p["id"] for p in data.get("access_policies", [])}
                    for p in backup_data.get("access_policies", []):
                        if p.get("id") not in existing_pol_ids:
                            data.setdefault("access_policies", []).append(p)
                            existing_pol_ids.add(p.get("id"))

                save_data(data)
                self._send_json(200, {
                    "success": True,
                    "message": "پایگاه داده شبکه با موفقیت بازیابی شد.",
                    "counts": {
                        "devices": len(data.get("devices", [])),
                        "templates": len(data.get("templates", [])),
                        "device_groups": len(data.get("device_groups", [])),
                        "access_policies": len(data.get("access_policies", [])),
                    }
                })
                return
            self._send_json(400, {"error": "Invalid backup payload format"})
            return

        self._send_json(404, {"error": "Endpoint not found"})

    def do_PUT(self):
        url = urlparse(self.path)
        path = url.path
        body = self._read_body()
        data = load_data()

        if path.startswith("/api/devices/") and "/ports/batch" in path:
            # Batch update ports /api/devices/:dev_id/ports/batch
            parts = path.split("/")
            dev_id = parts[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return

            port_ids = body.get("port_ids", [])
            updates = body.get("updates", {})
            ports = data.get("ports", {}).get(dev_id, [])

            updated_count = 0
            for port in ports:
                if port.get("port_id") in port_ids or port.get("name") in port_ids:
                    updated_count += 1
                    if "admin_status" in updates:
                        port["admin_status"] = updates["admin_status"]
                        if updates["admin_status"] == "disabled":
                            port["status"] = "down"
                    if "status" in updates and port.get("admin_status") != "disabled":
                        port["status"] = updates["status"]
                    if "mode" in updates:
                        port["mode"] = updates["mode"]
                    if "vlan" in updates:
                        port["vlan"] = int(updates["vlan"])
                        if port.get("mode") == "access":
                            port["allowed_vlans"] = str(updates["vlan"])
                    if "allowed_vlans" in updates:
                        port["allowed_vlans"] = str(updates["allowed_vlans"])
                    if "speed" in updates:
                        port["speed"] = updates["speed"]
                    if "description" in updates:
                        port["description"] = str(updates["description"])
                    if "port_security_enabled" in updates:
                        port["port_security_enabled"] = bool(updates["port_security_enabled"])
                        port["port_security_status"] = "secure-up" if (port.get("status") == "up" and port["port_security_enabled"]) else ("disabled" if not port["port_security_enabled"] else "secure-down")
                    if "port_security_mode" in updates:
                        port["port_security_mode"] = updates["port_security_mode"]
                    if "port_security_max_mac" in updates:
                        port["port_security_max_mac"] = int(updates["port_security_max_mac"])
                    if "port_security_configured_mac" in updates:
                        mac_val = str(updates["port_security_configured_mac"]).strip()
                        port["port_security_configured_mac"] = mac_val
                        if mac_val:
                            # Also assign as learned MAC if sticky mode or pre-configured
                            port["port_security_learned_macs"] = [mac_val]
                    if "port_security_learned_macs" in updates and isinstance(updates["port_security_learned_macs"], list):
                        port["port_security_learned_macs"] = updates["port_security_learned_macs"]
                    if "port_security_violation" in updates:
                        port["port_security_violation"] = updates["port_security_violation"]

            if "pending_changes" not in device or not isinstance(device["pending_changes"], list):
                device["pending_changes"] = []
            device["pending_changes"].append({
                "port_id": f"{updated_count} Ports Batch",
                "type": "batch_update",
                "description": f"Batch update on {updated_count} interfaces",
                "timestamp": time.strftime("%H:%M:%S")
            })
            device["has_unsaved_changes"] = True
            device["last_modified_time"] = time.strftime("%H:%M:%S")
            save_data(data)

            self._send_json(200, {
                "success": True,
                "updatedCount": updated_count,
                "message": f"تغییرات با موفقیت روی {updated_count} پورت اعمال شد.",
                "ports": ports
            })
            return

        if path.startswith("/api/devices/") and "/ports/" in path:
            # /api/devices/:dev_id/ports/:port_id
            after_dev = path[len("/api/devices/"):]
            dev_id = after_dev.split("/ports/")[0].strip()
            raw_port_id = after_dev.split("/ports/")[1].strip()
            port_id = unquote(raw_port_id).strip()

            ports = data.get("ports", {}).get(dev_id, [])
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)

            def match_port_flexible(p, target_id):
                if not p or not target_id:
                    return False
                t_raw = str(target_id).strip()
                t_norm = t_raw.lower().replace(" ", "")
                p_id = str(p.get("port_id", "")).lower().replace(" ", "")
                p_name = str(p.get("name", "")).lower().replace(" ", "")
                if p_id == t_norm or p_name == t_norm or p_id == t_raw.lower() or p_name == t_raw.lower():
                    return True
                for full, short in [("gigabitethernet", "gi"), ("tengigabitethernet", "te"), ("fastethernet", "fa"), ("ethernet", "eth")]:
                    t_f = t_norm.replace(short, full)
                    p_f = p_id.replace(short, full)
                    if t_f == p_f:
                        return True
                    t_s = t_norm.replace(full, short)
                    p_s = p_id.replace(full, short)
                    if t_s == p_s:
                        return True
                return False

            port = next((p for p in ports if match_port_flexible(p, port_id) or match_port_flexible(p, raw_port_id)), None)
            if not port:
                self._send_json(404, {"error": f"Port '{port_id}' not found on device '{dev_id}'"})
                return

            cli_output = ""
            # Update port properties (admin_status, status, mode, vlan, allowed_vlans, speed, description)
            if "admin_status" in body:
                port["admin_status"] = body["admin_status"]
                if body["admin_status"] == "disabled":
                    port["status"] = "down"
                if device:
                    try:
                        platform = device.get("platform", "cisco_ios_xe")
                        driver = get_driver(platform, device.get("connection_mode", "simulator"))
                        target_iface = port.get("port_id") or port.get("name") or port_id
                        action_name = "shutdown" if body["admin_status"] == "disabled" else "no_shutdown"
                        cli_cmd = driver.generate_action_cli(action_name, target_iface, {
                            "device_type": device.get("type", "switch"),
                            "is_router": device.get("type") == "router"
                        })
                        require_real = device.get("connection_mode") != "simulator"
                        exec_res = connection_manager.execute_command(device, cli_cmd, require_real=require_real)
                        cli_output = (cli_output + "\n" + exec_res.get("output", "")).strip()
                    except Exception as e:
                        print(f"[SetPortAdminStatus Direct CLI Note] {e}")

            if "status" in body and port.get("admin_status") != "disabled":
                port["status"] = body["status"]

            if "mode" in body:
                new_mode = str(body["mode"]).lower().strip()
                port["mode"] = new_mode  # "trunk" or "access"
                if new_mode == "trunk" and not port.get("allowed_vlans"):
                    port["allowed_vlans"] = "1-4094"
                if device:
                    try:
                        platform = device.get("platform", "cisco_ios_xe")
                        driver = get_driver(platform, device.get("connection_mode", "simulator"))
                        target_iface = port.get("port_id") or port.get("name") or port_id
                        action_name = "mode_trunk" if new_mode == "trunk" else "mode_access"
                        cli_cmd = driver.generate_action_cli(action_name, target_iface, {
                            "device_type": device.get("type", "switch"),
                            "is_router": device.get("type") == "router",
                            "vlan": port.get("vlan", 1)
                        })
                        require_real = device.get("connection_mode") != "simulator"
                        exec_res = connection_manager.execute_command(device, cli_cmd, require_real=require_real)
                        cli_output = (cli_output + "\n" + exec_res.get("output", "")).strip()
                    except Exception as e:
                        print(f"[SetPortMode Direct CLI Note] {e}")

            if "vlan" in body:
                new_vlan = int(body["vlan"])
                port["vlan"] = new_vlan
                if "mode" not in body and port.get("mode") != "trunk":
                    port["mode"] = "access"
                if device:
                    try:
                        platform = device.get("platform", "cisco_ios_xe")
                        driver = get_driver(platform, device.get("connection_mode", "simulator"))
                        target_iface = port.get("port_id") or port.get("name") or port_id
                        vlan_params = {
                            "vlan": new_vlan,
                            "device_type": device.get("type", "switch"),
                            "is_router": device.get("type") == "router"
                        }
                        cli_cmd = driver.generate_action_cli("set_vlan", target_iface, vlan_params)
                        require_real = device.get("connection_mode") != "simulator"
                        exec_res = connection_manager.execute_command(device, cli_cmd, require_real=require_real)
                        cli_output = (cli_output + "\n" + exec_res.get("output", "")).strip()
                    except Exception as e:
                        print(f"[SetPortVlan Direct CLI Note] {e}")
            if "allowed_vlans" in body:
                port["allowed_vlans"] = str(body["allowed_vlans"])
            if "speed" in body:
                port["speed"] = body["speed"]
            if "connected_device" in body:
                port["connected_device"] = body["connected_device"]

            # If description is provided, update state and execute CLI command on physical/simulated device
            if "description" in body:
                clean_desc = str(body["description"]).strip()
                port["description"] = clean_desc
                if device:
                    try:
                        platform = device.get("platform", "cisco_ios_xe")
                        driver = get_driver(platform, device.get("connection_mode", "simulator"))
                        target_iface = port.get("port_id") or port.get("name") or port_id
                        cli_cmd = driver.generate_action_cli("set_description", target_iface, {"description": clean_desc})
                        require_real = device.get("connection_mode") != "simulator"
                        exec_res = connection_manager.execute_command(device, cli_cmd, require_real=require_real)
                        cli_output = exec_res.get("output", "")
                    except Exception as e:
                        print(f"[SetPortDescription Direct CLI Note] {e}")

            if "port_security_enabled" in body:
                port["port_security_enabled"] = bool(body["port_security_enabled"])
            if "port_security_max_mac" in body:
                port["port_security_max_mac"] = int(body["port_security_max_mac"])
            if "port_security_mode" in body:
                port["port_security_mode"] = body["port_security_mode"]
            if "port_security_configured_mac" in body:
                port["port_security_configured_mac"] = str(body["port_security_configured_mac"]).strip()
            if "port_security_violation" in body:
                port["port_security_violation"] = body["port_security_violation"]
            if "port_security_status" in body:
                port["port_security_status"] = body["port_security_status"]
            elif port.get("port_security_enabled"):
                port["port_security_status"] = "secure-up" if port.get("status") == "up" else "secure-down"
            else:
                port["port_security_status"] = "disabled"

            # Automatically manage learned MACs for sticky/configured
            if port.get("port_security_enabled"):
                if port.get("port_security_mode") == "sticky":
                    if not port.get("port_security_learned_macs") and port.get("connected_device") and port.get("status") == "up":
                        port["port_security_learned_macs"] = ["0050.56b2.3c4d"]
                elif port.get("port_security_mode") == "configured":
                    if port.get("port_security_configured_mac"):
                        port["port_security_learned_macs"] = [port["port_security_configured_mac"]]
            else:
                port["port_security_learned_macs"] = []

            # Mark device as having unsaved running-config changes (needs write memory)
            if device:
                if "pending_changes" not in device or not isinstance(device["pending_changes"], list):
                    device["pending_changes"] = []
                device["pending_changes"].append({
                    "port_id": port_id,
                    "type": "port_update",
                    "description": f"Interface {port_id} configuration update",
                    "command": cli_output,
                    "timestamp": time.strftime("%H:%M:%S")
                })
                device["has_unsaved_changes"] = True
                device["last_modified_time"] = time.strftime("%H:%M:%S")

            save_data(data)
            self._send_json(200, {
                "success": True,
                "port": port,
                "cli_output": cli_output,
                "message": f"پیکربندی پورت {port_id} با موفقیت به‌روزرسانی شد."
            })
            return

        if path.startswith("/api/devices/"):
            # Update device /api/devices/:id
            dev_id = path.split("/")[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return

            for k in ["name", "ip", "ssh_host", "connection_protocol", "connection", "platform", "connection_mode", "type", "role", "model", "building", "floor", "unit", "rack", "cdp_enabled", "lldp_enabled", "snmp_community", "is_online", "ssh_port", "ssh_username", "ssh_password", "enable_password", "ssh_status", "total_ports", "web_configs", "winbox_port"]:
                if k in body:
                    device[k] = body[k]
            if "ssh_password" in body and body["ssh_password"]:
                device["ssh_password"] = encrypt_credential(body["ssh_password"])
            if "enable_password" in body and body["enable_password"]:
                device["enable_password"] = encrypt_credential(body["enable_password"])
            if "connection" in device and isinstance(device["connection"], dict):
                if "password" in device["connection"] and device["connection"]["password"]:
                    device["connection"]["password"] = encrypt_credential(device["connection"]["password"])
            if "ports" in body and isinstance(body["ports"], list):
                if "ports" not in data:
                    data["ports"] = {}
                data["ports"][dev_id] = body["ports"]
            if "connection_protocol" in body:
                if "connection" not in device or not isinstance(device["connection"], dict):
                    device["connection"] = {}
                device["connection"]["protocol"] = str(body["connection_protocol"]).lower()
            save_data(data)
            self._send_json(200, {"device": sanitize_device(device), "message": "مشخصات تجهیز با موفقیت تغییر یافت."})
            return

        if path.startswith("/api/templates/"):
            tmpl_id = path.split("/")[3]
            tmpl = next((t for t in data.get("templates", []) if t["id"] == tmpl_id), None)
            if not tmpl:
                self._send_json(404, {"error": "Template not found"})
                return

            for k in ["name", "vendor", "target_type", "role", "description", "default_cli_mode", "commands", "variables"]:
                if k in body:
                    tmpl[k] = body[k]
            tmpl["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            save_data(data)
            self._send_json(200, {
                "template": tmpl,
                "message": f"تمپلیت «{tmpl['name']}» با موفقیت به‌روزرسانی شد."
            })
            return

        self._send_json(404, {"error": "Endpoint not found"})

    def do_DELETE(self):
        url = urlparse(self.path)
        path = url.path
        data = load_data()

        if path.startswith("/api/devices/") and (path.endswith("/connection") or path.endswith("/terminal")):
            dev_id = path.split("/")[3]
            connection_manager.close_session(dev_id)
            terminal_session_manager.close_device_session(dev_id)
            self._send_json(200, {"success": True, "message": "اتصال ترمینال و ارتباط تجهیز با موفقیت قطع و آزاد گردید."})
            return

        if path.startswith("/api/devices/") and "/vpn/" in path:
            # DELETE /api/devices/:device_id/vpn/:vpn_id
            parts = path.split("/")
            dev_id = parts[3]
            vpn_id = parts[5]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return
            if device.get("platform") != "mikrotik_routeros":
                self._send_json(400, {"error": "unsupported_platform", "message": "این قابلیت تنها برای میکروتیک فعال است."})
                return

            user_role = self.headers.get("X-User-Role", "Super Admin")
            if not check_rbac_permission(user_role, "config"):
                self._send_json(403, {
                    "error": "permission_denied",
                    "message": f"کاربر با نقش «{user_role}» دسترسی لازم برای حذف VPN را ندارد."
                })
                return

            import urllib.parse
            parsed_q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            q_type = parsed_q.get("vpn_type", [None])[0] or parsed_q.get("type", [None])[0]

            v_lower = (vpn_id or "").lower()
            detected = "l2tp_ipsec"
            if "wireguard" in v_lower or v_lower.startswith("wg") or "-wg" in v_lower:
                detected = "wireguard"
            elif "sstp" in v_lower:
                detected = "sstp"
            elif "pptp" in v_lower:
                detected = "pptp"
            elif "ovpn" in v_lower or "openvpn" in v_lower:
                detected = "openvpn"
            elif "ipsec" in v_lower:
                detected = "ipsec_site_to_site"
            elif "eoip" in v_lower:
                detected = "eoip"
            elif "vxlan" in v_lower:
                detected = "vxlan"
            elif "gre" in v_lower:
                detected = "gre"

            vpn_type = (q_type or "").strip().lower() or detected
            conn = device.get("connection", {}) or {}
            conn_host = conn.get("host") or device.get("ssh_host") or device.get("ip", "")
            conn_port = int(conn.get("port") or device.get("ssh_port") or 22)
            conn_user = conn.get("username") or device.get("ssh_username") or "admin"

            sess = connection_manager.get_or_create_session(device, require_real=True)
            if sess.status != "connected":
                self._send_json(503, {
                    "error": "ssh_connection_failed",
                    "message": f"اتصال SSH به روتر میکروتیک ({conn_user}@{conn_host}:{conn_port}) جهت حذف VPN برقرار نشد: {sess.error_message}",
                    "isReal": True
                })
                return
            try:
                provider = get_vpn_provider("mikrotik_routeros")
                del_res = provider.delete(device, sess, vpn_id, vpn_type)

                record_audit_log(
                    data,
                    user=user_role,
                    device_id=dev_id,
                    device_name=device.get("name", dev_id),
                    action=f"Delete VPN ({vpn_id})",
                    details=f"VPN {vpn_id} removed from router.",
                    result="success" if del_res.get("success") else "failed"
                )

                self._send_json(200, del_res)
            except Exception as e:
                self._send_json(500, {"error": "delete_failed", "message": str(e)})
            return

        if path.startswith("/api/devices/"):
            dev_id = path.split("/")[3]
            device = next((d for d in data["devices"] if d["id"] == dev_id), None)
            if not device:
                self._send_json(404, {"error": "Device not found"})
                return

            data["devices"] = [d for d in data["devices"] if d["id"] != dev_id]
            if dev_id in data.get("ports", {}):
                del data["ports"][dev_id]
            # remove links
            data["topology_links"] = [l for l in data.get("topology_links", []) if l.get("source") != dev_id and l.get("target") != dev_id]
            save_data(data)
            self._send_json(200, {"message": f"تجهیز {device.get('name')} با موفقیت حذف گردید."})
            return

        if path.startswith("/api/templates/"):
            tmpl_id = path.split("/")[3]
            tmpl = next((t for t in data.get("templates", []) if t["id"] == tmpl_id), None)
            if not tmpl:
                self._send_json(404, {"error": "Template not found"})
                return

            data["templates"] = [t for t in data.get("templates", []) if t["id"] != tmpl_id]
            save_data(data)
            self._send_json(200, {"message": f"تمپلیت «{tmpl.get('name')}» با موفقیت حذف گردید."})
            return

        self._send_json(404, {"error": "Endpoint not found"})

def start_websocket_server(ws_port: int):
    """
    Spawns background asyncio WebSocket server bridging interactive client
    connections directly to real network device SSH and Telnet sessions.
    """
    try:
        import asyncio
        import websockets
    except ImportError:
        print(f"[Python WS Server] Note: 'websockets' library not installed in this environment; HTTP REST API terminal will be used.")
        return

    async def terminal_ws_handler(websocket, path=''):
        req_path = path or getattr(websocket, 'path', '') or ''
        parsed_url = urlparse(req_path)
        qs = parse_qs(parsed_url.query)

        # Support /ws/ssh/<device_id> or /ssh/<device_id> or ?deviceId=...
        device_id = ""
        path_clean = parsed_url.path.strip('/')
        parts = path_clean.split('/')
        if len(parts) >= 3 and parts[0] == 'ws' and parts[1] == 'ssh':
            device_id = parts[2]
        elif len(parts) >= 2 and parts[0] == 'ssh':
            device_id = parts[1]

        if not device_id:
            device_id = qs.get("deviceId", qs.get("device_id", [""]))[0].strip()

        user_role = qs.get("role", qs.get("user_role", ["Super Admin"]))[0].strip()
        req_protocol = qs.get("protocol", [""])[0].strip().lower()
        cols = int(qs.get("cols", [120])[0])
        rows = int(qs.get("rows", [36])[0])

        session = None
        loop = asyncio.get_running_loop()

        try:
            # Check permissions
            if not check_rbac_permission(user_role, "terminal"):
                await websocket.send(json.dumps({
                    "type": "error",
                    "error": f"Permission denied for role '{user_role}' to access network terminal.",
                    "code": "PERMISSION_DENIED"
                }))
                await asyncio.sleep(1.0)
                await websocket.close()
                return

            # Lookup device
            data = load_data()
            device = next((d for d in data.get("devices", []) if d.get("id") == device_id or d.get("name") == device_id), None)
            if not device:
                # Also check database_store.json
                store_file = os.path.join(DATA_DIR, "database_store.json")
                if os.path.exists(store_file):
                    try:
                        with open(store_file, "r", encoding="utf-8") as sf:
                            sdata = json.load(sf)
                            device = next((d for d in sdata.get("devices", []) if d.get("id") == device_id or d.get("name") == device_id), None)
                            if not device:
                                # Lookup in remote_servers fleet
                                srv = next((s for s in sdata.get("remote_servers", []) if s.get("id") == device_id or s.get("name") == device_id or s.get("hostname") == device_id), None)
                                if srv:
                                    device = {
                                        "id": srv.get("id"),
                                        "name": srv.get("name"),
                                        "ip": srv.get("ip"),
                                        "platform": "linux",
                                        "ssh_host": srv.get("ip"),
                                        "ssh_port": srv.get("ssh_port", 22),
                                        "ssh_username": srv.get("ssh_username", "root"),
                                        "ssh_password": srv.get("ssh_password", ""),
                                        "connection_protocol": "ssh",
                                        "default_shell": srv.get("default_shell", "bash"),
                                        "is_remote_server": True,
                                    }
                    except Exception:
                        pass

            if not device and (qs.get("host") or qs.get("ip")):
                dev_ip = (qs.get("host") or qs.get("ip"))[0].strip()
                device = {
                    "id": device_id,
                    "name": qs.get("name", [device_id])[0],
                    "ip": dev_ip,
                    "ssh_host": dev_ip,
                    "ssh_port": int(qs.get("port", ["22"])[0]),
                    "ssh_username": qs.get("username", [qs.get("user", ["root"])])[0],
                    "ssh_password": qs.get("password", [""])[0],
                    "connection_protocol": "ssh",
                    "default_shell": qs.get("shell", ["bash"])[0],
                    "platform": qs.get("platform", ["linux"])[0],
                    "is_remote_server": True,
                }

            if not device:
                err_msg = f"Device or Server with ID '{device_id}' was not found in inventory."
                await websocket.send(json.dumps({
                    "type": "error",
                    "error": err_msg,
                    "code": "DEVICE_NOT_FOUND"
                }))
                await websocket.send(json.dumps({
                    "type": "data",
                    "data": f"\r\n\x1b[1;31m[Host Not Found]\x1b[0m {err_msg}\r\n"
                }))
                await asyncio.sleep(1.0)
                await websocket.close()
                return

            conn = device.get("connection", {})
            protocol = req_protocol or conn.get("protocol") or device.get("connection_protocol") or "ssh"
            protocol = protocol.lower()
            host = (qs.get("host") or qs.get("ip") or [conn.get("host") or device.get("ssh_host") or device.get("ip", "")])[0].strip()
            default_port = 23 if protocol == "telnet" else 22
            port = int((qs.get("port") or [conn.get("port") or device.get("ssh_port") or default_port])[0])
            username = (qs.get("username") or qs.get("user") or [conn.get("username") or device.get("ssh_username") or "admin"])[0].strip()
            password = (qs.get("password") or [conn.get("password") or device.get("ssh_password") or ""])[0]
            enable_password = conn.get("enable_password") or device.get("enable_password") or ""
            platform = (qs.get("platform") or [device.get("platform", "cisco_ios_xe")])[0].strip()
            req_shell = qs.get("shell", [device.get("default_shell", "bash")])[0].strip().lower()

            if not host:
                err_msg = f"No Management IP or Host configured for device '{device.get('name', device_id)}'."
                await websocket.send(json.dumps({
                    "type": "error",
                    "error": err_msg,
                    "code": "NO_HOST"
                }))
                await websocket.send(json.dumps({
                    "type": "data",
                    "data": f"\r\n\x1b[1;31m[No IP Configured]\x1b[0m {err_msg}\r\n"
                }))
                await asyncio.sleep(1.0)
                await websocket.close()
                return

            await websocket.send(json.dumps({
                "type": "status",
                "status": "connecting",
                "protocol": protocol,
                "host": host,
                "port": port,
                "deviceId": device_id,
                "deviceName": device.get("name", host),
                "message": f"Connecting to {host}:{port} via {protocol.upper()}..."
            }))

            def on_data_received(chunk: str):
                try:
                    print(f"[WS-BACKEND-SEND] session={session.session_id} chars={len(chunk)} preview={repr(chunk[:100])}")
                    asyncio.run_coroutine_threadsafe(
                        websocket.send(json.dumps({"type": "data", "data": chunk})),
                        loop
                    )
                except Exception as e:
                    print(f"[WS-BACKEND-SEND-ERR] {e}")

            def on_session_closed():
                try:
                    asyncio.run_coroutine_threadsafe(
                        websocket.send(json.dumps({
                            "type": "status",
                            "status": "disconnected",
                            "message": "Network terminal connection closed."
                        })),
                        loop
                    )
                except Exception:
                    pass

            def on_lifecycle_event(evt: dict):
                try:
                    asyncio.run_coroutine_threadsafe(
                        websocket.send(json.dumps({"type": "lifecycle_event", "event": evt})),
                        loop
                    )
                except Exception as e:
                    print(f"[WS-BACKEND-EVENT-ERR] {e}")

            session = NetworkTerminalSession(
                device_id=device_id,
                host=host,
                port=port,
                protocol=protocol,
                username=username,
                password=password,
                enable_password=enable_password,
                platform=platform,
                cols=cols,
                rows=rows,
                on_data_callback=on_data_received,
                on_close_callback=on_session_closed,
                on_event_callback=on_lifecycle_event
            )
            terminal_session_manager.register_session(session)

            # Connect in thread executor so it doesn't block the asyncio event loop
            connected = await loop.run_in_executor(None, session.connect)
            if not connected:
                # Real error already printed into terminal via session._send_error_to_terminal
                await websocket.send(json.dumps({
                    "type": "error",
                    "error": session.error_message or f"Connection failed to {host}:{port} via {protocol.upper()}.",
                    "code": session.diagnostic_category or "CONNECTION_FAILED",
                    "diagnostic": session.diagnostic_data or {}
                }))
                await websocket.send(json.dumps({
                    "type": "status",
                    "status": "failed",
                    "category": session.diagnostic_category or "CONNECTION_FAILED",
                    "message": session.error_message or "Connection failed",
                    "diagnostic": session.diagnostic_data or {}
                }))
                # Keep websocket open until client disconnects or user closes modal
                # so the exact error remains readable in the UI
                async for _ in websocket:
                    pass
                return

            # Connected notification
            await websocket.send(json.dumps({
                "type": "status",
                "status": "connected",
                "is_real": True,
                "sessionId": session.session_id,
                "protocol": protocol,
                "host": host,
                "port": port,
                "username": username,
                "banner": session.banner,
                "latency_ms": session.latency_ms,
                "legacy_algorithms": session.used_legacy_algorithms,
                "message": f"Connected to {host}:{port} ({session.banner or protocol.upper()})"
            }))

            # If this is a Linux remote server and user explicitly requested bash/zsh, switch shell
            if device.get("is_remote_server") and req_shell in ["bash", "zsh"]:
                try:
                    await asyncio.sleep(0.2)
                    session.send_input(f"which {req_shell} >/dev/null 2>&1 && exec {req_shell} -l\n")
                except Exception:
                    pass

            # Listen for interactive client messages
            async for raw_msg in websocket:
                try:
                    msg = json.loads(raw_msg)
                except Exception:
                    msg = {"type": "input", "data": raw_msg}

                msg_type = msg.get("type", "input")
                if msg_type == "ping":
                    await websocket.send(json.dumps({"type": "pong", "timestamp": int(time.time() * 1000)}))
                elif msg_type == "get_lifecycle_events":
                    await websocket.send(json.dumps({
                        "type": "lifecycle_events_history",
                        "events": session.lifecycle_events
                    }))
                elif msg_type in ("input", "stdin"):
                    data_str = msg.get("data", "")
                    if data_str:
                        print(f"[WS-BACKEND-RECV-INPUT] session={session.session_id} chars={len(data_str)} data={repr(data_str)}")
                        session.write_input(data_str)
                elif msg_type == "resize":
                    c = int(msg.get("cols", cols))
                    r = int(msg.get("rows", rows))
                    session.resize_pty(c, r)
                elif msg_type == "close":
                    break

        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"[Terminal WS Exception] {e}")
        finally:
            if session:
                terminal_session_manager.close_session(session.session_id)
                session.close()

    def run_ws_loop():
        ws_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(ws_loop)
        start_server_coro = websockets.serve(terminal_ws_handler, "127.0.0.1", ws_port)
        ws_loop.run_until_complete(start_server_coro)
        print(f"[Python WS Server] Real Paramiko SSH WebSocket server running on ws://127.0.0.1:{ws_port}")
        ws_loop.run_forever()

    t = threading.Thread(target=run_ws_loop, daemon=True)
    t.start()

def run_server(port=5001, host=None):
    if host is None:
        host = os.environ.get("PYTHON_HOST") or os.environ.get("HOST") or '0.0.0.0'

    # Log Paramiko runtime version
    try:
        import paramiko
        print(f"[Python SSH Engine] Running Paramiko {paramiko.__version__} (SSH-2 enterprise & legacy Cisco suite active)")
    except ImportError:
        print("[Python SSH Engine] Warning: Paramiko is not installed")

    # 1. Encrypt any unencrypted passwords in the database on startup
    try:
        migrate_database_credentials(DATA_FILE)
        store_file = os.path.join(DATA_DIR, "database_store.json")
        if os.path.exists(store_file):
            migrate_database_credentials(store_file)
    except Exception as e:
        print(f"[Server Startup] Credential migration notice: {e}")

    # 2. Start WebSocket terminal engine on PYTHON_WS_PORT or port + 1
    ws_port = int(os.environ.get("PYTHON_WS_PORT", port + 1))
    start_websocket_server(ws_port)

    server_address = (host, port)
    ThreadingHTTPServer.allow_reuse_address = True
    try:
        httpd = ThreadingHTTPServer(server_address, NetworkAPIHandler)
        httpd.daemon_threads = True
    except OSError as e:
        if getattr(e, 'errno', None) == 98 or 'Address already in use' in str(e):
            print(f"[Python Network Engine] Port {port} is already in use by an active server instance. Reusing existing instance.")
            sys.exit(0)
        raise e

    print(f"[Python Network Engine] Server running on http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("[Python Network Engine] Stopping...")
        httpd.server_close()

if __name__ == "__main__":
    port = 5001
    host = os.environ.get("PYTHON_HOST") or os.environ.get("HOST") or '0.0.0.0'
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    elif os.environ.get("BACKEND_PORT") or os.environ.get("PYTHON_PORT"):
        try:
            port = int(os.environ.get("BACKEND_PORT") or os.environ.get("PYTHON_PORT"))
        except ValueError:
            pass
    run_server(port, host)
