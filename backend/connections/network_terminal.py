"""
Network Terminal Session Manager
Provides real, interactive SSH (via Paramiko) and Telnet shell sessions for network devices
streamed over WebSocket with strict session lifecycle management, credential decryption,
and automated fallback for legacy Cisco algorithms (diffie-hellman-group1-sha1, aes128-cbc, ssh-rsa).
"""
import os
import sys
import time
import socket
import select
import threading
import uuid
import re
from typing import Dict, Any, Optional, Callable, Tuple

# Ensure parent and backend directories are in sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_current_dir)
for p in [_backend_dir, _current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.security.crypto import decrypt_credential
except ImportError:
    try:
        from security.crypto import decrypt_credential
    except ImportError:
        def decrypt_credential(v): return v or ""

# Try importing paramiko
try:
    import paramiko
    HAS_PARAMIKO = True
    try:
        from .ssh_compat import ensure_paramiko_compatibility, open_adaptive_shell_channel
    except ImportError:
        try:
            from connections.ssh_compat import ensure_paramiko_compatibility, open_adaptive_shell_channel
        except ImportError:
            from ssh_compat import ensure_paramiko_compatibility, open_adaptive_shell_channel
    ensure_paramiko_compatibility()
except ImportError:
    HAS_PARAMIKO = False
    paramiko = None
    open_adaptive_shell_channel = None


def generate_cisco_diagnostic_report(
    error_exc: Optional[Exception],
    host: str,
    port: int,
    username: str,
    platform: str,
    used_legacy: bool = False
) -> Tuple[str, str, str, Dict[str, Any]]:
    """
    Generates a comprehensive diagnostic report and troubleshooting workflow for SSH failures,
    tailored specifically for Cisco Catalyst 2960 and enterprise network infrastructure.
    Returns: (ansi_terminal_output, summary_error_message, category_code, structured_diagnostic_dict)
    """
    err_str = str(error_exc) if error_exc else "Connection failed"
    err_lower = err_str.lower()

    paramiko_ver = getattr(paramiko, "__version__", "2.12.0") if HAS_PARAMIKO else "N/A"

    if (HAS_PARAMIKO and isinstance(error_exc, (paramiko.AuthenticationException, paramiko.BadAuthenticationType))) or \
       any(k in err_lower for k in ["auth", "denied", "password refused", "userauth"]):
        category = "AUTHENTICATION_FAILURE"
        summary = f"Authentication failed for user '{username}' on {host}:{port}"
        root_cause_en = f"Access denied for user '{username}' on {host}:{port}. The Cisco switch rejected the credentials or local user is missing required privilege 15."
        root_cause_fa = f"اعتبارسنجی ناموفق بود: سوئیچ سیسکو نام کاربری «{username}» یا رمز عبور را نپذیرفت یا کاربر سطح دسترسی ۱۵ ندارد."
        workflow_steps_en = [
            f"1. Connect to the switch via Console cable or management Telnet.",
            f"2. Enter privileged exec mode: enable",
            f"3. Verify/configure user with privilege 15: configure terminal -> username {username} privilege 15 secret <password>",
            f"4. Ensure local login on VTY lines: line vty 0 15 -> login local -> transport input ssh -> exit",
            f"5. If AAA TACACS+/RADIUS is active: aaa authentication login default local",
            f"6. Save running configuration: write memory",
            f"7. Update username/password in NetTopology Device Settings."
        ]
        workflow_steps_fa = [
            f"۱. اتصال به سوئیچ از طریق کابل کنسول یا تلنت مدیریتی.",
            f"۲. ورود به حالت Privileged Exec با دستور enable",
            f"۳. تعریف یا تصحیح کاربر با سطح دسترسی ۱۵: username {username} privilege 15 secret <رمز_عبور>",
            f"۴. فعال‌سازی لاگین محلی روی خطوط VTY: line vty 0 15 -> login local -> transport input ssh",
            f"۵. در صورت فعال بودن AAA: aaa authentication login default local",
            f"۶. ذخیره تنظیمات روی حافظه پایدار: write memory",
            f"۷. تصحیح و ثبت رمز عبور صحیح در تنظیمات دیوایس در پنل NetTopology."
        ]
        cisco_cmds = [
            "enable",
            "configure terminal",
            f"username {username} privilege 15 secret <your_password>",
            "line vty 0 15",
            " login local",
            " transport input ssh",
            " exit",
            "write memory"
        ]

    elif any(k in err_lower for k in ["kex", "cipher", "key exchange", "no acceptable", "no matching", "algorithm", "unknown cipher", "incompatible", "bad host key"]):
        category = "CIPHER_KEY_MISMATCH"
        summary = f"SSH Cipher / Algorithm negotiation issue with {host}:{port}"
        root_cause_en = f"Cryptographic cipher or Key Exchange mismatch with Cisco 2960. The switch requires compatible KEX (DH Group 1/14), Cipher (AES-CBC/3DES), and an active RSA key pair."
        root_cause_fa = f"عدم تطابق الگوریتم یا کلید سایفر: سوئیچ سیسکو ۲۹۶۰ فاقد کلید RSA تولیدشده است یا پروتکل SSHv2 فعال نگردیده است."
        workflow_steps_en = [
            "1. Verify current SSH status: show ip ssh",
            "2. Ensure domain name is configured: configure terminal -> ip domain-name company.local",
            "3. Generate 2048-bit RSA key pair: crypto key generate rsa modulus 2048",
            "4. Enforce SSH Version 2: ip ssh version 2",
            "5. Enable compatible legacy CBC ciphers if restricted: ip ssh server algorithm encryption aes128-cbc 3des-cbc aes256-cbc",
            "6. Save configuration: write memory"
        ]
        workflow_steps_fa = [
            "۱. بررسی وضعیت فعال بودن SSH روی سوئیچ: show ip ssh",
            "۲. تنظیم نام دامنه الزامی: ip domain-name company.local",
            "۳. تولید کلید رمزنگاری RSA با طول ۲۰۴۸ بیت: crypto key generate rsa modulus 2048",
            "۴. اجبار سوئیچ به استفاده از نسخه ۲: ip ssh version 2",
            "۵. فعال‌سازی سایفرهای سازگار CBC در صورت محدودیت: ip ssh server algorithm encryption aes128-cbc 3des-cbc aes256-cbc",
            "۶. ذخیره کانفیگ روی حافظه NVRAM: write memory"
        ]
        cisco_cmds = [
            "configure terminal",
            "ip domain-name local.net",
            "crypto key generate rsa modulus 2048",
            "ip ssh version 2",
            "ip ssh server algorithm encryption aes128-cbc 3des-cbc aes256-cbc",
            "write memory"
        ]

    elif any(k in err_lower for k in ["refused", "connection refused", "111"]):
        category = "CONNECTION_REFUSED"
        summary = f"Connection refused by {host}:{port}"
        root_cause_en = f"Connection refused by {host}:{port}. The device IP is reachable, but TCP port {port} is closed or SSH daemon is disabled on the switch."
        root_cause_fa = f"اتصال به پورت {port} رد شد (Connection Refused): آی‌پی سوئیچ در دسترس است اما سرویس SSH فعال نشده یا یک لیست دسترسی (ACL) مانع اتصال شده است."
        workflow_steps_en = [
            "1. Check if SSH daemon is enabled: show ip ssh (if disabled, configure hostname and crypto key).",
            "2. Enable SSHv2 transport on VTY lines: configure terminal -> line vty 0 15 -> transport input ssh",
            "3. Check for blocking Access Control Lists (ACL): show running-config | section line vty",
            "4. Verify permit rules for this management server: show access-lists",
            "5. Save running configuration: write memory"
        ]
        workflow_steps_fa = [
            "۱. بررسی فعال بودن سرویس SSH: show ip ssh",
            "۲. فعال‌سازی ورودی SSH روی خطوط VTY: line vty 0 15 -> transport input ssh",
            "۳. بررسی لیست‌های کنترل دسترسی (ACL): show running-config | section line vty",
            "۴. اطمینان از مجاز بودن آی‌پی سرور مدیریت در اکسس‌لیست مربوطه: show access-lists",
            "۵. ذخیره کانفیگ: write memory"
        ]
        cisco_cmds = [
            "configure terminal",
            "hostname SW2960",
            "ip domain-name local.net",
            "crypto key generate rsa modulus 1024",
            "ip ssh version 2",
            "line vty 0 15",
            " transport input ssh",
            " exit",
            "write memory"
        ]

    elif any(k in err_lower for k in ["timed out", "timeout", "unreachable", "no route"]):
        category = "TIMEOUT_UNREACHABLE"
        summary = f"Connection timed out connecting to {host}:{port}"
        root_cause_en = f"Network timeout connecting to {host}:{port}. Host did not respond within connection timeout or network path is unrouted/blocked."
        root_cause_fa = f"تایم‌اوت ارتباط شبکه: پاسخی از آی‌پی {host} دریافت نشد. احتمال قطعی فیزیکی، عدم روتینگ یا مسدود بودن توسط فایروال وجود دارد."
        workflow_steps_en = [
            "1. Verify switch physical link is up: show interfaces status",
            "2. Verify management VLAN interface (SVI): show ip interface brief (confirm VLAN 1 is UP/UP).",
            "3. Verify default gateway on the switch: show ip default-gateway",
            "4. Test ping from switch to management server: ping <server_ip>",
            "5. Verify no firewall or VLAN trunk drop exists between server and switch."
        ]
        workflow_steps_fa = [
            "۱. بررسی وضعیت فیزیکی پورت‌های آپ‌لینک: show interfaces status",
            "۲. بررسی وضعیت اینترفیس مدیریتی سوئیچ: show ip interface brief (تایید حالت UP/UP اینترفیس VLAN 1).",
            "۳. بررسی گیت‌وی پیش‌فرض: show ip default-gateway",
            "۴. تست پینگ از سوئیچ به سمت سرور مدیریت: ping <server_ip>",
            "۵. اطمینان از عدم مسدودسازی بسته‌ها در ترانک یا فایروال میانی."
        ]
        cisco_cmds = [
            "show ip interface brief",
            "show ip default-gateway",
            "show interfaces status"
        ]

    elif any(k in err_lower for k in ["reset by peer", "peer closed", "closed by remote", "eof", "banner"]):
        category = "SESSION_RESET_OR_VTY_EXHAUSTION"
        summary = f"SSH session closed or reset by peer {host}:{port}"
        root_cause_en = f"SSH session reset or dropped by Cisco 2960. All VTY lines (0-15) may be occupied by stale sessions, or maximum connection limit reached."
        root_cause_fa = f"اتصال توسط سوئیچ قطع شد (Reset/EOF): خطوط VTY سوئیچ تکمیل شده‌اند یا نشست‌های قدیمی باز مانده‌اند."
        workflow_steps_en = [
            "1. Check active user sessions on the switch: show users",
            "2. Disconnect stale hung sessions: clear line <line_number>",
            "3. Configure idle timeout on VTY lines: configure terminal -> line vty 0 15 -> exec-timeout 10 0",
            "4. Save configuration: write memory"
        ]
        workflow_steps_fa = [
            "۱. بررسی نشست‌های باز و فعال روی سوئیچ: show users",
            "۲. قطع و بستن نشست‌های معلق: clear line <شماره_خط>",
            "۳. تنظیم تایم‌اوت عدم فعالیت روی خطوط VTY: line vty 0 15 -> exec-timeout 10 0",
            "۴. ذخیره تغییرات: write memory"
        ]
        cisco_cmds = [
            "show users",
            "clear line <line_number>",
            "configure terminal",
            "line vty 0 15",
            " exec-timeout 10 0",
            " exit",
            "write memory"
        ]

    else:
        category = "SSH_GENERAL_ERROR"
        summary = f"SSH connection failed to {host}:{port}: {err_str}"
        root_cause_en = f"SSH connection error to {host}:{port}: {err_str}"
        root_cause_fa = f"خطای ارتباط SSH با {host}:{port}: {err_str}"
        workflow_steps_en = [
            "1. Verify switch IP and port: ping and telnet to port 22",
            "2. Verify switch configuration: show ip ssh",
            "3. Check switch logging buffer for errors: show logging"
        ]
        workflow_steps_fa = [
            "۱. بررسی پینگ و اتصال به پورت ۲۲ سوئیچ",
            "۲. بررسی وضعیت سرویس SSH: show ip ssh",
            "۳. مشاهده لاگ‌های خطای سوئیچ: show logging"
        ]
        cisco_cmds = [
            "show ip ssh",
            "show logging"
        ]

    sep = "=" * 78
    steps_txt = "\r\n".join(f"  \x1b[33m{step}\x1b[0m" for step in workflow_steps_en)
    steps_fa_txt = "\r\n".join(f"  \x1b[36m{step}\x1b[0m" for step in workflow_steps_fa)
    cmds_txt = "\r\n".join(f"    \x1b[1;32m{cmd}\x1b[0m" for cmd in cisco_cmds)

    ansi_output = (
        f"\r\n\x1b[1;31m{sep}\x1b[0m\r\n"
        f"\x1b[1;37;41m  SSH CONNECTION DIAGNOSTIC & TROUBLESHOOTING REPORT  \x1b[0m\r\n"
        f"\x1b[1;31m{sep}\x1b[0m\r\n"
        f"  \x1b[1mTarget Host\x1b[0m     : \x1b[36m{host}:{port}\x1b[0m\r\n"
        f"  \x1b[1mConfigured User\x1b[0m : \x1b[36m{username}\x1b[0m\r\n"
        f"  \x1b[1mPlatform\x1b[0m        : \x1b[36m{platform or 'cisco_catalyst_2960'}\x1b[0m\r\n"
        f"  \x1b[1mSSH Engine\x1b[0m      : \x1b[36mParamiko {paramiko_ver} (SSHv2 Protocol)\x1b[0m\r\n"
        f"  \x1b[1mError Category\x1b[0m  : \x1b[1;31m{category}\x1b[0m\r\n"
        f"\r\n\x1b[1;33m[ROOT CAUSE / علت خطا]:\x1b[0m\r\n"
        f"  \x1b[1;37m{root_cause_en}\x1b[0m\r\n"
        f"  \x1b[90m{root_cause_fa}\x1b[0m\r\n"
        f"\r\n\x1b[1;36m[CISCO 2960 RESOLUTION WORKFLOW (English)]:\x1b[0m\r\n"
        f"{steps_txt}\r\n"
        f"\r\n\x1b[1;36m[مراحل گام‌به‌گام رفع مشکل در سوئیچ سیسکو (فارسی)]:\x1b[0m\r\n"
        f"{steps_fa_txt}\r\n"
        f"\r\n\x1b[1;32m[EXACT CISCO IOS CLI COMMANDS TO RUN]:\x1b[0m\r\n"
        f"{cmds_txt}\r\n"
        f"\x1b[1;31m{sep}\x1b[0m\r\n\r\n"
    )

    diag_dict = {
        "category": category,
        "host": host,
        "port": port,
        "username": username,
        "platform": platform,
        "summary": summary,
        "root_cause_en": root_cause_en,
        "root_cause_fa": root_cause_fa,
        "workflow_steps_en": workflow_steps_en,
        "workflow_steps_fa": workflow_steps_fa,
        "cisco_commands": cisco_cmds,
        "paramiko_version": paramiko_ver,
    }

    return ansi_output, summary, category, diag_dict


class NetworkTerminalSession:
    """
    Manages an active, real interactive bidirectional session to a physical/virtual network device
    via either SSH (paramiko interactive shell PTY) or Telnet.
    Lifecycle: OPEN -> CONNECTING -> CONNECTED -> ACTIVE -> CLOSING -> CLOSED
    """
    def __init__(
        self,
        device_id: str,
        host: str,
        port: int,
        protocol: str = "ssh",
        username: str = "admin",
        password: str = "",
        enable_password: str = "",
        platform: str = "cisco_ios_xe",
        cols: int = 120,
        rows: int = 36,
        on_data_callback: Optional[Callable[[str], Any]] = None,
        on_close_callback: Optional[Callable[[], Any]] = None,
        on_status_callback: Optional[Callable[[Dict[str, Any]], Any]] = None,
        on_event_callback: Optional[Callable[[Dict[str, Any]], Any]] = None,
        selected_profile: Optional[str] = None,
    ):
        self.session_id = f"term-{uuid.uuid4().hex[:8]}"
        self.device_id = device_id
        self.host = host.strip() if host else "127.0.0.1"
        self.port = int(port) if port else (23 if protocol.lower() == "telnet" else 22)
        self.protocol = protocol.lower()  # 'ssh' or 'telnet'
        self.username = username.strip() if username else "admin"
        self.selected_profile = selected_profile
        
        # Transparently decrypt stored passwords if encrypted with Fernet
        self.password = decrypt_credential(password)
        self.enable_password = decrypt_credential(enable_password)
        
        self.platform = (platform or "cisco_ios_xe").lower()
        self.cols = max(20, min(500, int(cols)))
        self.rows = max(5, min(200, int(rows)))
        self.on_data_callback = on_data_callback
        self.on_close_callback = on_close_callback
        self.on_status_callback = on_status_callback
        self.on_event_callback = on_event_callback
        self.lifecycle_events = []

        self.status = "OPEN"  # OPEN, CONNECTING, CONNECTED, ACTIVE, FAILED, CLOSING, CLOSED
        self.created_at = time.time()
        self.connected_at: Optional[float] = None
        self.last_activity = time.time()
        self.latency_ms = 0.0
        self.banner = ""
        self.error_message = ""
        self.diagnostic_data: Dict[str, Any] = {}
        self.diagnostic_category = ""
        self.is_real = False
        self.used_legacy_algorithms = False

        # SSH resources
        self._paramiko_client = None
        self._paramiko_transport = None
        self._ssh_channel = None

        # Telnet resources
        self._raw_socket = None

        self._stop_event = threading.Event()
        self._reader_thread: Optional[threading.Thread] = None

    @property
    def is_cisco(self) -> bool:
        return "cisco" in self.platform or "catalyst" in self.platform or "ios" in self.platform

    @property
    def is_mikrotik(self) -> bool:
        return "mikrotik" in self.platform or "routeros" in self.platform

    def notify_status(self, status: str, **kwargs):
        """Sends structured status notification to callback."""
        self.status = status
        if self.on_status_callback:
            try:
                payload = {
                    "type": "status",
                    "status": status.lower(),
                    "session_id": self.session_id,
                    "device_id": self.device_id,
                    "host": self.host,
                    "port": self.port,
                    "username": self.username,
                    "protocol": self.protocol,
                    "platform": self.platform,
                    "is_real": self.is_real,
                    "legacy_algorithms": self.used_legacy_algorithms,
                    "latency_ms": self.latency_ms,
                    **kwargs
                }
                self.on_status_callback(payload)
            except Exception as e:
                print(f"[NetworkTerminal] Status callback error: {e}")

    def emit_event(
        self,
        stage: str,
        title: str,
        detail: str,
        level: str = "info",
        metadata: Optional[Dict[str, Any]] = None,
        title_en: Optional[str] = None
    ):
        """Dispatches structured connection lifecycle event and retains it in session history."""
        evt = {
            "id": f"evt-{uuid.uuid4().hex[:8]}",
            "timestamp": int(time.time() * 1000),
            "stage": stage,
            "title": title,
            "titleEn": title_en or title,
            "detail": detail,
            "level": level,
            "metadata": metadata or {}
        }
        self.lifecycle_events.append(evt)
        if self.on_event_callback:
            try:
                self.on_event_callback(evt)
            except Exception as e:
                print(f"[NetworkTerminal] Event callback error: {e}")

    def connect(self) -> bool:
        """Establishes real connection to the device. Returns True if connected, False on failure."""
        self.status = "CONNECTING"
        self.notify_status("connecting", message=f"Initiating real {self.protocol.upper()} connection to {self.host}:{self.port}...")
        self.emit_event(
            "ssh_start" if self.protocol != "telnet" else "ws_connect",
            f"{self.protocol.upper()} Connection Started",
            f"Initiating real {self.protocol.upper()} socket connection to {self.host}:{self.port} (user: {self.username})",
            "info",
            {"host": self.host, "port": self.port, "protocol": self.protocol, "platform": self.platform}
        )
        start_t = time.time()

        if self.protocol == "telnet":
            return self._connect_telnet(start_t)
        else:
            return self._connect_ssh(start_t)

    def _connect_ssh_transport(self, use_legacy: bool, timeout: float = 6.0) -> Tuple[Any, Any]:
        """
        Creates a raw socket and Paramiko Transport with optional legacy Cisco algorithm enablement.
        Returns (channel, transport).
        """
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((self.host, self.port))

        transport = paramiko.Transport(sock)
        sec = transport.get_security_options()

        if use_legacy:
            # Enable older Cisco 2960 / Catalyst legacy algorithms
            legacy_kex = (
                'diffie-hellman-group1-sha1',
                'diffie-hellman-group14-sha1',
                'diffie-hellman-group-exchange-sha1',
                'diffie-hellman-group-exchange-sha256',
            )
            sec.kex = legacy_kex + tuple(k for k in sec.kex if k not in legacy_kex)

            legacy_keys = ('ssh-rsa', 'ssh-dss')
            sec.key_types = legacy_keys + tuple(k for k in sec.key_types if k not in legacy_keys)

            legacy_ciphers = (
                'aes128-cbc',
                '3des-cbc',
                'aes192-cbc',
                'aes256-cbc',
                'aes128-ctr',
                'aes192-ctr',
                'aes256-ctr',
            )
            sec.ciphers = legacy_ciphers + tuple(c for c in sec.ciphers if c not in legacy_ciphers)

        transport.start_client(timeout=timeout)

        # Authenticate password with keyboard-interactive fallback
        auth_success = False
        try:
            transport.auth_password(username=self.username, password=self.password)
            auth_success = transport.is_authenticated()
        except paramiko.BadAuthenticationType:
            # Fallback to interactive authentication
            def interactive_handler(title, instructions, prompt_list):
                return [self.password for _ in prompt_list]
            try:
                transport.auth_interactive(username=self.username, handler=interactive_handler)
                auth_success = transport.is_authenticated()
            except Exception as e:
                raise paramiko.AuthenticationException(f"Interactive authentication failed: {e}")

        if not auth_success:
            raise paramiko.AuthenticationException(f"Invalid username or password for user '{self.username}'")

        # Open interactive shell channel
        channel = transport.open_session(timeout=timeout)
        
        # PTY terminal configuration
        # Cisco switches prefer xterm or vt100; MikroTik RouterOS prefers xterm or vt100
        term_name = "xterm-256color" if self.is_cisco else ("vt100" if self.is_mikrotik else "xterm")
        channel.get_pty(term=term_name, width=self.cols, height=self.rows)
        channel.invoke_shell()
        channel.settimeout(0.0)  # Non-blocking for select() loop

        return channel, transport

    def _connect_ssh_client(self, timeout: float = 6.0) -> Tuple[Any, Any, Any]:
        """
        Connects using standard paramiko.SSHClient with auto-add host key policy.
        Supports standard Linux servers, modern Cisco IOS-XE, and MikroTik RouterOS.
        Returns (channel, transport, client).
        """
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        client.connect(
            hostname=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            timeout=timeout,
            banner_timeout=timeout,
            auth_timeout=timeout,
            look_for_keys=False,
            allow_agent=False
        )

        transport = client.get_transport()
        if not transport or not transport.is_authenticated():
            raise paramiko.AuthenticationException(f"Authentication failed for user '{self.username}' on {self.host}:{self.port}")

        term_name = "xterm-256color" if self.is_cisco else ("vt100" if self.is_mikrotik else "xterm")
        channel = transport.open_session(timeout=timeout)
        channel.get_pty(term=term_name, width=self.cols, height=self.rows)
        channel.invoke_shell()
        channel.settimeout(0.05)

        return channel, transport, client

    def _connect_ssh(self, start_t: float) -> bool:
        """
        Executes real SSH connection using the unified Two-Tier Adaptive Negotiation Engine:
        - Tier 1: Modern Fast Path (no overhead for modern Cisco/MikroTik/Linux)
        - Tier 2: Adaptive Legacy Fallback (automatic negotiation for older Cisco 2960/Catalyst)
        Never falls back to fake/simulated data.
        """
        if not HAS_PARAMIKO or not open_adaptive_shell_channel:
            self.error_message = "Paramiko library is not installed on the system."
            self.status = "FAILED"
            self._send_error_to_terminal(self.error_message)
            self.notify_status("failed", error=self.error_message)
            return False

        term_name = "vt100" if (self.is_cisco or self.is_mikrotik) else "xterm"
        def handle_sub_event(stage, title, detail, level="info", meta=None):
            self.emit_event(stage, title, detail, level, meta)

        channel, transport, client, info, err = open_adaptive_shell_channel(
            hostname=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            cols=self.cols or 200,
            rows=self.rows or 50,
            term_name=term_name,
            timeout=15.0,
            on_status_msg=self.on_data_callback,
            platform=self.platform,
            on_event=handle_sub_event,
            selected_profile=self.selected_profile
        )

        first_error = None
        if channel and transport and client:
            self._paramiko_client = client
            self.used_legacy_algorithms = (info.get("tier") == "tier2_legacy_fallback")
        else:
            first_error = Exception(err or "SSH connection failed")

        if first_error or not channel or not transport:
            self.status = "FAILED"
            self.is_real = False
            self._cleanup_resources()

            ansi_report, summary, cat, diag_dict = generate_cisco_diagnostic_report(
                error_exc=first_error,
                host=self.host,
                port=self.port,
                username=self.username,
                platform=self.platform,
                used_legacy=self.used_legacy_algorithms
            )
            self.error_message = summary
            self.diagnostic_category = cat
            self.diagnostic_data = diag_dict

            # Emit accurate diagnostic lifecycle failure event
            err_lower = (self.error_message or "").lower()
            if "timed out" in err_lower or "timeout" in err_lower or "unreachable" in err_lower:
                self.emit_event("timeout", "Connection Timed Out", self.error_message, "error", diag_dict)
            elif "auth" in err_lower or "denied" in err_lower:
                self.emit_event("authentication_failure", "Authentication Failed", self.error_message, "error", diag_dict)
            elif "refused" in err_lower:
                self.emit_event("exception", "Connection Refused", self.error_message, "error", diag_dict)
            else:
                self.emit_event("exception", "SSH Connection Failed", self.error_message, "error", diag_dict)

            self._send_error_to_terminal(ansi_report)
            self.notify_status(
                "failed",
                error=self.error_message,
                category=self.diagnostic_category,
                diagnostic=self.diagnostic_data
            )
            return False

        # Connection successful!
        self.latency_ms = round((time.time() - start_t) * 1000, 1)
        self._ssh_channel = channel
        self._paramiko_transport = transport
        self.is_real = True
        self.connected_at = time.time()
        self.last_activity = time.time()
        self.status = "CONNECTED"

        self.emit_event(
            "shell_creation",
            "Interactive Shell Active",
            f"PTY {term_name} interactive channel ready in {self.latency_ms}ms ({'Legacy Cisco Suite' if self.used_legacy_algorithms else 'Modern Suite'})",
            "success",
            {"latency_ms": self.latency_ms, "legacy": self.used_legacy_algorithms, "tier": info.get("tier")}
        )

        # Read banner if present
        try:
            raw_banner = transport.get_banner()
            if raw_banner:
                self.banner = raw_banner.decode("utf-8", errors="ignore") if isinstance(raw_banner, bytes) else str(raw_banner)
        except Exception:
            self.banner = ""

        # Send greeting banner in terminal
        algo_tag = " [Legacy Cisco Algorithms Active]" if self.used_legacy_algorithms else " [Standard Modern Ciphers]"
        success_banner = (
            f"\r\n\x1b[1;32m[LIVE SSH ESTABLISHED]\x1b[0m Connected to {self.host}:{self.port} in {self.latency_ms}ms{algo_tag}\r\n"
            f"\x1b[90mSession ID: {self.session_id} | User: {self.username} | Platform: {self.platform}\x1b[0m\r\n\r\n"
        )
        self._send_error_to_terminal(success_banner)

        # Send initial terminal configuration commands to disable pagination on Cisco
        try:
            if self.is_cisco and self._ssh_channel:
                time.sleep(0.08)
                self._ssh_channel.send("terminal length 0\r\n".encode("utf-8"))
            elif self.is_mikrotik and self._ssh_channel:
                time.sleep(0.08)
                self._ssh_channel.send("/console/set terminal=vt100\r\n".encode("utf-8"))
        except Exception as e:
            print(f"[NetworkTerminal] Initial paging config send warning: {e}")

        # Start streaming reader thread
        self._reader_thread = threading.Thread(target=self._ssh_reader_loop, daemon=True)
        self._reader_thread.start()

        print(f"[NetworkTerminal] Live SSH session {self.session_id} established to {self.host}:{self.port} (user: {self.username}, legacy: {self.used_legacy_algorithms})")
        self.notify_status("connected", message=f"Connected to {self.host}:{self.port}")
        return True

    def _ssh_reader_loop(self):
        """Reads incoming bytes from the real SSH channel and triggers on_data_callback."""
        chan = self._ssh_channel
        if not chan:
            return

        chan.settimeout(0.05)
        first_data_chunk = True

        while not self._stop_event.is_set() and chan and not chan.closed:
            try:
                data = None
                if chan.recv_ready():
                    data = chan.recv(4096)
                else:
                    try:
                        data = chan.recv(4096)
                    except (socket.timeout, TimeoutError):
                        pass

                if data:
                    raw_len = len(data)
                    while chan.recv_ready():
                        extra = chan.recv(4096)
                        if not extra:
                            break
                        data += extra
                        raw_len += len(extra)
                    self.last_activity = time.time()
                    text = data.decode("utf-8", errors="replace")
                    print(f"[SSH-PTY-RAW-RECV] session={self.session_id} bytes={raw_len} preview={repr(text[:120])}")
                    if first_data_chunk:
                        first_data_chunk = False
                        self.emit_event(
                            "output_reception",
                            "Output Reception",
                            f"Received initial terminal response from device ({raw_len} bytes)",
                            "success",
                            {"bytes": raw_len}
                        )
                    if self.is_cisco and ("--More--" in text or "-- More --" in text):
                        try:
                            chan.send(" ")
                        except Exception:
                            pass
                    if self.on_data_callback:
                        self.on_data_callback(text)
                elif data == b'':
                    # Device closed the channel (EOF)
                    break

                if chan.recv_stderr_ready():
                    err_data = chan.recv_stderr(4096)
                    if err_data:
                        text = err_data.decode("utf-8", errors="replace")
                        if self.on_data_callback:
                            self.on_data_callback(text)

            except (socket.timeout, TimeoutError):
                continue
            except Exception as e:
                if self._stop_event.is_set() or not chan or chan.closed:
                    break
                time.sleep(0.01)

        # Connection ended
        self.close()

    def _connect_telnet(self, start_t: float) -> bool:
        """Connects via real interactive Telnet session."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(6.0)
            s.connect((self.host, self.port))
            s.settimeout(None)

            self.latency_ms = round((time.time() - start_t) * 1000, 1)
            self._raw_socket = s
            self.connected_at = time.time()
            self.last_activity = time.time()
            self.is_real = True
            self.status = "CONNECTED"

            self._send_error_to_terminal(
                f"\r\n\x1b[1;32m[LIVE TELNET ESTABLISHED]\x1b[0m Connected to {self.host}:{self.port} in {self.latency_ms}ms\r\n\r\n"
            )

            self._reader_thread = threading.Thread(target=self._telnet_reader_loop, daemon=True)
            self._reader_thread.start()

            print(f"[NetworkTerminal] Telnet session {self.session_id} connected to {self.host}:{self.port}")
            self.notify_status("connected", message=f"Telnet connected to {self.host}:{self.port}")
            return True

        except (socket.error, TimeoutError) as e:
            self.status = "FAILED"
            self.is_real = False
            self._cleanup_resources()
            err_str = str(e)
            if "refused" in err_str.lower():
                self.error_message = f"Connection refused by {self.host}:{self.port} on Telnet"
            elif "timed out" in err_str.lower() or "timeout" in err_str.lower():
                self.error_message = f"Connection timed out connecting to {self.host}:{self.port} on Telnet"
            elif "unreachable" in err_str.lower():
                self.error_message = f"Host unreachable: {self.host}:{self.port}"
            else:
                self.error_message = f"Telnet error: {err_str}"

            self._send_error_to_terminal(f"\r\n\x1b[1;31m[Telnet Error]\x1b[0m {self.error_message}\r\n")
            self.notify_status("failed", error=self.error_message)
            return False

    def _telnet_reader_loop(self):
        """Reads incoming bytes from Telnet socket with IAC option handling."""
        sock = self._raw_socket
        login_prompt_sent = False
        pass_prompt_sent = False

        while not self._stop_event.is_set() and sock:
            try:
                r, _, _ = select.select([sock], [], [], 0.05)
                if r:
                    data = sock.recv(4096)
                    if not data:
                        break
                    self.last_activity = time.time()

                    # Filter Telnet IAC commands (0xFF)
                    clean_bytes = bytearray()
                    i = 0
                    while i < len(data):
                        b = data[i]
                        if b == 255:  # IAC
                            if i + 1 < len(data):
                                cmd = data[i + 1]
                                if cmd in (251, 252, 253, 254):
                                    if i + 2 < len(data):
                                        opt = data[i + 2]
                                        try:
                                            if cmd == 253:  # DO -> respond WONT
                                                sock.sendall(bytes([255, 252, opt]))
                                            elif cmd == 251:  # WILL -> respond DO
                                                sock.sendall(bytes([255, 253, opt]))
                                        except Exception:
                                            pass
                                        i += 3
                                        continue
                                elif cmd == 250:  # SB subnegotiation
                                    se_idx = data.find(b'\xff\xf0', i + 2)
                                    if se_idx != -1:
                                        i = se_idx + 2
                                        continue
                                    else:
                                        i += 2
                                        continue
                                else:
                                    i += 2
                                    continue
                            else:
                                i += 1
                                continue
                        else:
                            clean_bytes.append(b)
                            i += 1

                    if clean_bytes:
                        text = clean_bytes.decode("utf-8", errors="replace")
                        if self.on_data_callback:
                            self.on_data_callback(text)

                        # Auto-send credentials if device asks for Login/Username and Password
                        if self.username and not login_prompt_sent and re.search(r'(?:username|login):\s*$', text, re.I):
                            time.sleep(0.1)
                            self.write_input(self.username + "\r\n")
                            login_prompt_sent = True
                        elif self.password and not pass_prompt_sent and re.search(r'password:\s*$', text, re.I):
                            time.sleep(0.1)
                            self.write_input(self.password + "\r\n")
                            pass_prompt_sent = True

            except Exception:
                break

        self.close()

    def send_input(self, data: str) -> bool:
        """Alias for write_input to support legacy callers."""
        return self.write_input(data)

    def write_input(self, data: str) -> bool:
        """Sends user keystrokes/commands directly to the device channel."""
        if self.status not in ("CONNECTED", "ACTIVE"):
            return False

        self.last_activity = time.time()
        self.status = "ACTIVE"

        try:
            encoded_bytes = data.encode("utf-8")
            print(f"[SSH-PTY-INPUT-RAW] session={self.session_id} protocol={self.protocol} bytes={len(encoded_bytes)} data={repr(data)}")
            if len(data) > 0:
                self.emit_event(
                    "command_transmission",
                    "Command Transmission",
                    f"Transmitted data ({len(data)} characters) to device shell",
                    "info",
                    {"chars": len(data)}
                )
            if self.protocol == "ssh" and self._ssh_channel and not self._ssh_channel.closed:
                self._ssh_channel.send(encoded_bytes)
                return True
            elif self.protocol == "telnet" and self._raw_socket:
                self._raw_socket.sendall(encoded_bytes)
                return True
        except Exception as e:
            print(f"[NetworkTerminal] Write error in session {self.session_id}: {e}")
            self.close()
            return False
        return False

    def resize_pty(self, cols: int, rows: int):
        """Resizes the terminal window PTY."""
        self.cols = max(20, min(500, cols))
        self.rows = max(5, min(200, rows))
        if self.protocol == "ssh" and self._ssh_channel and not self._ssh_channel.closed:
            try:
                self._ssh_channel.resize_pty(width=self.cols, height=self.rows)
            except Exception:
                pass

    def close(self):
        """Cleanly terminates the interactive session and releases all network sockets/threads."""
        if self.status in ("CLOSING", "CLOSED"):
            return

        self.status = "CLOSING"
        self._stop_event.set()
        self.emit_event(
            "disconnect",
            "Session Disconnected",
            f"Terminal session {self.session_id} disconnected for {self.host}:{self.port}",
            "warning"
        )
        self._cleanup_resources()
        self.status = "CLOSED"

        print(f"[NetworkTerminal] Session {self.session_id} cleanly closed for device {self.device_id}")
        self.notify_status("disconnected", message=f"Session closed for {self.host}:{self.port}")
        
        if self.on_close_callback:
            try:
                self.on_close_callback()
            except Exception:
                pass

    def _cleanup_resources(self):
        # Close SSH channel
        if self._ssh_channel:
            try:
                self._ssh_channel.close()
            except Exception:
                pass
            self._ssh_channel = None

        # Close Paramiko transport
        if self._paramiko_transport:
            try:
                self._paramiko_transport.close()
            except Exception:
                pass
            self._paramiko_transport = None

        # Close Paramiko client
        if self._paramiko_client:
            try:
                self._paramiko_client.close()
            except Exception:
                pass
            self._paramiko_client = None

        # Close Telnet socket
        if self._raw_socket:
            try:
                self._raw_socket.shutdown(socket.SHUT_RDWR)
            except Exception:
                pass
            try:
                self._raw_socket.close()
            except Exception:
                pass
            self._raw_socket = None

    def _send_error_to_terminal(self, text: str):
        if self.on_data_callback:
            try:
                self.on_data_callback(text)
            except Exception:
                pass


# -------------------------------------------------------------
# Global Active Interactive Terminal Sessions Registry
# -------------------------------------------------------------
class TerminalSessionManager:
    """Singleton registry for active real terminal sessions."""
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(TerminalSessionManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        self.active_sessions: Dict[str, NetworkTerminalSession] = {}
        self.device_to_session: Dict[str, str] = {}
        self.lock = threading.Lock()
        self._initialized = True
        print("[TerminalSessionManager] Initialized for interactive SSH/Telnet sessions.")

    def register_session(self, session: NetworkTerminalSession):
        with self.lock:
            # Terminate any existing session for the same device first
            old_sess_id = self.device_to_session.get(session.device_id)
            if old_sess_id and old_sess_id in self.active_sessions:
                old_sess = self.active_sessions.pop(old_sess_id, None)
                if old_sess:
                    old_sess.close()

            self.active_sessions[session.session_id] = session
            self.device_to_session[session.device_id] = session.session_id

    def get_session(self, session_id: str) -> Optional[NetworkTerminalSession]:
        with self.lock:
            return self.active_sessions.get(session_id)

    def get_session_by_device(self, device_id: str) -> Optional[NetworkTerminalSession]:
        with self.lock:
            sess_id = self.device_to_session.get(device_id)
            if sess_id:
                sess = self.active_sessions.get(sess_id)
                if sess and sess.status in ("CONNECTED", "ACTIVE"):
                    return sess
            return None

    def close_session(self, session_id: str):
        with self.lock:
            session = self.active_sessions.pop(session_id, None)
            if session:
                self.device_to_session.pop(session.device_id, None)
                session.close()

    def close_device_session(self, device_id: str):
        with self.lock:
            sess_id = self.device_to_session.pop(device_id, None)
            if sess_id:
                session = self.active_sessions.pop(sess_id, None)
                if session:
                    session.close()

    def cleanup_inactive(self, max_idle_seconds: int = 1800):
        """Periodic cleanup of inactive or disconnected sessions."""
        now = time.time()
        to_close = []
        with self.lock:
            for sid, sess in list(self.active_sessions.items()):
                if sess.status == "CLOSED" or (now - sess.last_activity > max_idle_seconds):
                    to_close.append(sid)

        for sid in to_close:
            self.close_session(sid)


terminal_session_manager = TerminalSessionManager()
