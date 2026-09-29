"""
SSH Connection Manager & Device Session Registry
Provides thread-safe session pooling, connection lifecycle management,
lazy connection instantiation, and session reuse per device.
"""
import time
import socket
import threading
import uuid
import re
from typing import Dict, Any, Optional
from backend.drivers import get_driver
try:
    from backend.security.crypto import decrypt_credential
except ImportError:
    try:
        from security.crypto import decrypt_credential
    except ImportError:
        def decrypt_credential(v): return v or ""

class DeviceSession:
    def __init__(self, device_id: str, host: str, port: int, username: str, platform: str, mode: str = "ssh"):
        self.session_id = f"sess-{uuid.uuid4().hex[:8]}"
        self.device_id = device_id
        self.host = host
        self.port = port
        self.username = username
        self.platform = platform
        self.mode = mode  # 'ssh' or 'simulator'
        self.connected_at = time.time()
        self.last_activity = time.time()
        self.paramiko_client = None
        self.shell_channel = None
        self.banner = ""
        self.latency_ms = 0.0
        self.is_real = False
        self.status = "connected"
        self.error_message = ""

    def is_alive(self, timeout_seconds: int = 600) -> bool:
        if self.status != "connected":
            return False
        if time.time() - self.last_activity > timeout_seconds:
            return False
        if self.mode == "simulator":
            return True
        if self.paramiko_client:
            try:
                transport = self.paramiko_client.get_transport()
                return transport is not None and transport.is_active()
            except Exception:
                return False
        return False

    def close(self):
        self.status = "closed"
        if self.shell_channel:
            try:
                self.shell_channel.close()
            except Exception:
                pass
            self.shell_channel = None
        if self.paramiko_client:
            try:
                self.paramiko_client.close()
            except Exception:
                pass
            self.paramiko_client = None

class SSHConnectionManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SSHConnectionManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        self.sessions: Dict[str, DeviceSession] = {}
        self.sessions_lock = threading.Lock()
        self._initialized = True
        print("[SSHConnectionManager] Initialized. Ready for on-demand lazy connections.")

    def get_session(self, device_id: str) -> Optional[DeviceSession]:
        with self.sessions_lock:
            sess = self.sessions.get(device_id)
            if sess and sess.is_alive():
                return sess
            elif sess:
                sess.close()
                del self.sessions[device_id]
            return None

    def is_connected(self, device_id: str) -> bool:
        sess = self.get_session(device_id)
        return sess is not None and sess.status == "connected"

    def get_or_create_session(self, device: Dict[str, Any], force_reconnect: bool = False, require_real: bool = False) -> DeviceSession:
        device_id = device.get("id", "")
        with self.sessions_lock:
            existing = self.sessions.get(device_id)
            if existing and existing.is_alive() and not force_reconnect:
                if require_real and not existing.is_real:
                    # Stored session is not real, need reconnect
                    pass
                else:
                    existing.last_activity = time.time()
                    return existing
            if existing:
                existing.close()
                self.sessions.pop(device_id, None)

        # Connection details
        conn = device.get("connection", {})
        host = conn.get("host") or device.get("ssh_host") or device.get("ip", "")
        port = int(conn.get("port") or device.get("ssh_port") or 22)
        username = conn.get("username") or device.get("ssh_username") or "admin"
        password = decrypt_credential(conn.get("password") or device.get("ssh_password") or "")
        platform = device.get("platform", "cisco_ios_xe")
        conn_mode = device.get("connection_mode", "ssh")

        session = DeviceSession(device_id, host, port, username, platform, mode=conn_mode)

        if conn_mode == "simulator" and not require_real:
            session.is_real = False
            session.latency_ms = 1.5
            session.banner = f"Simulated OS ({platform}) for {host}:{port}"
            with self.sessions_lock:
                self.sessions[device_id] = session
            return session

        # Real SSH Attempt via Paramiko
        start_t = time.time()
        connected = False
        banner = ""
        p_client = None
        err_msg = ""

        try:
            import paramiko
            try:
                from .ssh_compat import connect_ssh_device, ensure_paramiko_compatibility
            except ImportError:
                try:
                    from connections.ssh_compat import connect_ssh_device, ensure_paramiko_compatibility
                except ImportError:
                    from ssh_compat import connect_ssh_device, ensure_paramiko_compatibility

            ensure_paramiko_compatibility()

            p_client = paramiko.SSHClient()
            p_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            connected, err = connect_ssh_device(
                p_client,
                hostname=host,
                port=port,
                username=username,
                password=password,
                timeout=15.0,
                banner_timeout=30.0,
                auth_timeout=30.0,
                platform=platform
            )
            if not connected:
                err_msg = str(err or "SSH Connection Failed")

            if connected:
                transport = p_client.get_transport()
                banner = transport.get_banner() if transport else f"SSH-2.0-Device ({platform})"
                if isinstance(banner, bytes):
                    banner = banner.decode('utf-8', errors='ignore')
        except Exception as err:
            connected = False
            err_msg = str(err)
            if p_client:
                try:
                    p_client.close()
                except Exception:
                    pass
                p_client = None

        session.latency_ms = round((time.time() - start_t) * 1000, 1)

        if connected and p_client:
            session.is_real = True
            session.paramiko_client = p_client
            session.banner = banner or f"SSH-2.0 / {platform} connected"
            session.status = "connected"
            session.error_message = ""
        else:
            clean_err = err_msg or "Connection timed out or host unreachable"
            session.is_real = False
            session.error_message = f"SSH error for {host}:{port} ({clean_err})"
            if require_real or conn_mode == "ssh":
                session.status = "failed"
            else:
                # Fallback to emulator only if not strictly requiring real
                session.banner = f"Fallback session for {host}:{port} ({platform})"
                session.status = "connected"

        with self.sessions_lock:
            self.sessions[device_id] = session

        return session

    def execute_command(self, device: Dict[str, Any], command: str, require_real: bool = False) -> Dict[str, Any]:
        device_id = device.get("id", "")
        session = self.get_or_create_session(device, require_real=require_real)
        session.last_activity = time.time()
        start_t = time.time()

        if require_real or device.get("connection_mode") != "simulator":
            if session.status != "connected" or not session.is_real or not session.paramiko_client:
                return {
                    "success": False,
                    "output": session.error_message or f"SSH session to {session.host}:{session.port} is not connected.",
                    "error": session.error_message or f"SSH session to {session.host}:{session.port} is not connected.",
                    "isReal": True,
                    "durationMs": session.latency_ms
                }

        if session.is_real and session.paramiko_client:
            try:
                is_cisco = "cisco" in session.platform.lower()
                if is_cisco:
                    # Cisco switches require an interactive shell channel and terminal length 0
                    if not session.shell_channel or session.shell_channel.closed:
                        chan = session.paramiko_client.invoke_shell()
                        chan.settimeout(0.1)
                        time.sleep(0.3)
                        while chan.recv_ready():
                            chan.recv(4096)
                        chan.send("terminal length 0\r\n".encode("utf-8"))
                        time.sleep(0.2)
                        while chan.recv_ready():
                            chan.recv(4096)
                        session.shell_channel = chan
                    else:
                        chan = session.shell_channel

                    cmd_lower = command.strip().lower()
                    # If privileged mode is required for show run/start/config, elevate with enable if secret exists
                    if (cmd_lower.startswith("show run") or cmd_lower.startswith("sh run") or 
                        cmd_lower.startswith("show start") or cmd_lower.startswith("sh start") or
                        cmd_lower.startswith("conf")):
                        enable_secret = decrypt_credential(
                            device.get("enable_password") or 
                            (device.get("connection", {}) or {}).get("enable_password") or ""
                        )
                        try:
                            chan.send("enable\r\n".encode("utf-8"))
                            time.sleep(0.15)
                            buf = ""
                            while chan.recv_ready():
                                buf += chan.recv(4096).decode("utf-8", errors="replace")
                            if "Password:" in buf or "password:" in buf:
                                chan.send(f"{enable_secret}\r\n".encode("utf-8"))
                                time.sleep(0.2)
                                while chan.recv_ready():
                                    chan.recv(4096)
                            chan.send("terminal length 0\r\n".encode("utf-8"))
                            time.sleep(0.1)
                            while chan.recv_ready():
                                chan.recv(4096)
                        except Exception as e:
                            print(f"[SSHManager] Elevation attempt note: {e}")

                    # Send the exact command to hardware
                    chan.send((command + "\r\n").encode("utf-8"))
                    time.sleep(0.15)
                    output_parts = []
                    start_read = time.time()
                    while time.time() - start_read < 8.0:
                        if chan.recv_ready():
                            chunk = chan.recv(8192)
                            if chunk:
                                output_parts.append(chunk.decode("utf-8", errors="replace"))
                                text_so_far = "".join(output_parts)
                                if "--More--" in text_so_far or "-- More --" in text_so_far:
                                    try:
                                        chan.send(" ")
                                    except Exception:
                                        pass
                                if re.search(r'[\r\n][A-Za-z0-9_\.\-]+(?:\([^\)]+\))?[#>]', text_so_far):
                                    time.sleep(0.05)
                                    while chan.recv_ready():
                                        output_parts.append(chan.recv(4096).decode("utf-8", errors="replace"))
                                    break
                        else:
                            time.sleep(0.05)

                    raw_res = "".join(output_parts)
                    clean_res = re.sub(r'[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]', '', raw_res)
                    duration = round((time.time() - start_t) * 1000, 1)
                    return {
                        "success": True,
                        "output": clean_res.strip(),
                        "isReal": True,
                        "durationMs": duration,
                        "exitCode": 0
                    }
                else:
                    stdin, stdout, stderr = session.paramiko_client.exec_command(command, timeout=8)
                    out = stdout.read().decode('utf-8', errors='ignore')
                    err = stderr.read().decode('utf-8', errors='ignore')
                    duration = round((time.time() - start_t) * 1000, 1)
                    full_out = out if not err else (f"{out}\n{err}" if out else err)
                    return {
                        "success": True,
                        "output": full_out,
                        "isReal": True,
                        "durationMs": duration,
                        "exitCode": stdout.channel.recv_exit_status() if stdout.channel else 0
                    }
            except Exception as e:
                # If command execution failed on connection, mark session for reconnect
                session.close()
                with self.sessions_lock:
                    self.sessions.pop(device_id, None)
                return {
                    "success": False,
                    "output": f"SSH Execution Error: {str(e)}",
                    "isReal": True,
                    "durationMs": round((time.time() - start_t) * 1000, 1)
                }

        # Emulated execution via platform SimulatorDriver
        driver = get_driver(device.get("platform", "cisco_ios_xe"), connection_mode="simulator")
        sim_res = driver.execute_simulated_command(device, [], command)
        sim_res["isReal"] = False
        sim_res["durationMs"] = round((time.time() - start_t) * 1000, 1)
        return sim_res

    def close_session(self, device_id: str) -> bool:
        with self.sessions_lock:
            sess = self.sessions.pop(device_id, None)
            if sess:
                sess.close()
                return True
        return False

    def close_all(self):
        with self.sessions_lock:
            for s in self.sessions.values():
                s.close()
            self.sessions.clear()

# Global Singleton
connection_manager = SSHConnectionManager()
