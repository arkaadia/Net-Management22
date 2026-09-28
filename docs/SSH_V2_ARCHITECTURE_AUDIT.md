# NET-MANAGEMENT22 — Phase 1: Repository Audit & Architecture Plan

## 1. Executive Summary & Audit Findings

This audit maps the current system architecture of **Net-Management22** to prepare for the dedicated **"SSH V2 Test & Fetch"** and **"Connection Log & Troubleshoot"** features according to the repository development rules (strict phased approach, real device interaction, zero mock data, SSH protocol version 2, Paramiko 2.x, bidirectional WebSocket).

---

## 2. Component Audit

### 2.1 "Introduce New Device" & Device Creation
- **File:** `src/components/AddDeviceModal.tsx`
  - Manages modal state for introducing new network devices (Switches, Routers, APs, Firewalls).
  - Collects target credentials: `ip`, `ssh_host`, `ssh_port` (default 22/23), `ssh_username`, `ssh_password`, `enable_password`, `platform` (`cisco_ios`, `cisco_ios_xe`, `mikrotik_routeros`, `generic_linux`), and `connection_protocol` (`ssh` / `telnet`).
  - Contains connection test handler (`handleTestSsh`) calling `testDeviceConnection(payload)` from `src/services/api.ts`.
  - Discovered telemetry is parsed directly to populate Management IP, Hostname, Platform, Port count, and PSU specs.
  - Houses the direct terminal launch bridge `handleOpenDirectTerminal()` which can open `CiscoTerminalModal`.

### 2.2 Device Credentials & Storage
- **File:** `backend/security/crypto.py` & `server/vaultCrypto.ts`
  - AES-256-GCM / PBKDF2 credential encryption for credentials at rest.
  - Stored in `backend/database_store.json` and optionally PostgreSQL (`server/db.ts`).
  - Terminal launcher decrypts or passes credentials on demand, never exposing them in plaintext logs.

### 2.3 Existing SSH Functionality & Conflict Identification
- **Node.js SSH engine:**
  - `server/sshDiscovery.ts` uses `ssh2` (npm package) for background server monitoring and specific Linux/MikroTik operations.
- **Python SSH engine (The Authoritative SSH v2 Engine):**
  - `backend/connections/ssh_compat.py`: Adaptive Two-Tier SSH Negotiation Engine specifically tuned for Cisco Catalyst (2960/3560/3750, IOS 12/15) as well as modern IOS-XE, Nexus, MikroTik, and Linux.
  - `backend/connections/network_terminal.py`: Interactive shell session manager using Paramiko, handling PTY shell channel, prompt detection, and Cisco `--More--` pagination.
  - `backend/connections/hardware_discovery.py`: Discovers hardware specifications via real CLI outputs (`show version`, `show inventory`, `show interface status`, `/system resource print`).
- **Conflict Resolution for "SSH V2 Test & Fetch":**
  - All "SSH V2 Test & Fetch" operations must flow strictly to the Python Paramiko engine, eliminating ambiguous fallback to Node.js `ssh2` for Cisco switches. Node.js `ssh2` will remain only for server monitoring / Linux storage subsystems.

### 2.4 WebSocket & Terminal Implementation
- **Architecture Pipeline:**
  ```
  Browser Terminal (src/components/CiscoTerminalModal.tsx)
          │
          │  Bidirectional WebSocket (/ws/ssh/:deviceId)
          ▼
  Node.js Express Proxy (server/terminalWs.ts)
          │
          │  Raw TCP WebSocket Proxy (ws://127.0.0.1:5002)
          ▼
  Python Backend (backend/server.py -> start_websocket_server)
          │
          │  Paramiko SSH Client (SSHClient.invoke_shell())
          ▼
  Real Network Device (Cisco Switch / Router / Firewall)
  ```
- **Terminal UI (`src/components/CiscoTerminalModal.tsx`):**
  - Full-featured interactive terminal with ANSI rendering, command history, tab completion, window controls, and keyboard navigation.

---

## 3. Integration Points for New Features

### 3.1 "SSH V2 Test & Fetch"
- **Location in UI:** `src/components/AddDeviceModal.tsx`
  - In the "Terminal Protocol & Credentials" section, currently titled `Test SSH & Fetch Data`.
  - Refined into an explicit **"SSH V2 Test & Fetch"** action button.
  - Connected via `POST /api/devices/test-connection` directly to `backend/connections/hardware_discovery.py` through the Python backend.
  - Displays real-time handshake results:
    - Negotiated SSH Protocol Version (`SSH-2.0`)
    - Key Exchange (KEX) algorithm
    - Cipher suite (e.g. `aes128-cbc`, `aes256-ctr`)
    - Server Host Key type
    - Real latency measurement
    - Discovered ports, model, and power supplies from real CLI commands.

### 3.2 "Connection Log & Troubleshoot" in Terminal UI
- **Location in UI:** `src/components/CiscoTerminalModal.tsx`
  - In the top header bar next to "Appearance" (`رنگ و قلم`) and "Write Memory" actions.
  - Dedicated button: **"Connection Log & Troubleshoot"** (`لاگ اتصال و عیب‌یابی`).
  - Opens an integrated diagnostic panel displaying:
    - **Step-by-step Connection Lifecycle Log:** Timestamps, WebSocket handshake, TCP socket, SSHv2 version exchange, KEX negotiation, Host key exchange, Authentication attempt, Channel acquisition, PTY allocation.
    - **Credential Redaction:** Passwords and keys masked as `***REDACTED***`.
    - **Triage Matrix:**
      - **FACTUAL ERROR:** Exact exception (e.g., `paramiko.ssh_exception.AuthenticationException`, `No matching key exchange`).
      - **POSSIBLE CAUSE:** Technical interpretation.
      - **RECOMMENDED CHECK:** Real Cisco CLI remediation commands (e.g. `crypto key generate rsa modulus 2048`, `ip ssh version 2`, `username <user> privilege 15 secret <pass>`).

---

## 4. Python & Paramiko Dependency Strategy

### 4.1 Dependency Audit:
- Previously `requirements.txt` allowed `paramiko>=3.4.0`.
- In Paramiko 3.x, legacy algorithms (such as `diffie-hellman-group1-sha1`, `ssh-rsa` SHA-1 signatures, and CBC ciphers) were deprecated or disabled by default, causing handshake rejections on widely deployed enterprise switches like Cisco Catalyst 2960.
- **Rule Requirement:** Paramiko 2.x (`paramiko==2.12.0`).

### 4.2 Pinned Configuration:
`requirements.txt` is updated to:
```text
paramiko==2.12.0
cryptography>=3.3,<41.0.0
websockets>=10.4
```
This guarantees strict SSH protocol version 2 compliance with full support for both modern (Tier 1) and enterprise legacy (Tier 2) algorithm suites without downgrade to SSHv1.

---

## 5. Phase-by-Phase Roadmap

- **Phase 1 (Current):** Repository Audit & Architecture Plan (Strictly documentation & pinned requirements).
- **Phase 2:** Backend Paramiko 2.x SSHv2 Engine & Diagnostic Logger (`backend/connections/ssh_compat.py`, `backend/connections/network_terminal.py`).
- **Phase 3:** Dedicated "SSH V2 Test & Fetch" Endpoint & Frontend Integration (`AddDeviceModal.tsx`).
- **Phase 4:** Live Interactive WebSocket Shell & "Connection Log & Troubleshoot" Panel in Terminal UI (`CiscoTerminalModal.tsx`).
- **Phase 5:** End-to-End Validation & Final Push.
