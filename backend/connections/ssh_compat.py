"""
ssh_compat.py - Bulletproof Adaptive Two-Tier SSH Negotiation Engine
Optimized for high-speed modern infrastructure and legacy enterprise hardware:
- Tier 1: Modern Fast Path (Zero latency penalty for modern Cisco IOS-XE, Nexus, MikroTik, Linux OpenSSH)
- Tier 2: Adaptive Legacy Fallback (Automatic negotiation for older Cisco Catalyst 2960/3560/3750, IOS 12/15)

Guarantees:
- Fully adaptive and automatic (zero manual configuration required)
- Tier 1 offers complete modern algorithms as top priority (Curve25519, ECDH, SHA-2 DH, CTR/GCM, Ed25519/RSA-SHA2)
- Tier 2 activates automatically ONLY when the remote device rejects modern algorithms during handshake
- NEVER raises "unknown cipher" (strictly inspects transport._cipher_info at runtime before assigning)
- Captures and logs exact negotiated algorithms (KEX, Cipher, Host Key, MAC)
- Shared universally across NetworkTerminal, SSHManager, HardwareDiscovery, BulkConfig, and Server Probe
"""

import socket
import time
import logging
from typing import Tuple, Optional, Any, List, Dict

logger = logging.getLogger("ssh_compat")

# ==============================================================================
# Tier 1: Modern Fast Path (Modern High-Security Algorithms)
# Default for all modern Cisco IOS-XE, Nexus, MikroTik RouterOS v7, Linux, etc.
# ==============================================================================
TIER1_MODERN_KEX = (
    'curve25519-sha256',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
    'ecdh-sha2-nistp384',
    'ecdh-sha2-nistp521',
    'diffie-hellman-group16-sha512',
    'diffie-hellman-group18-sha512',
    'diffie-hellman-group14-sha256',
)

TIER1_MODERN_KEYS = (
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ecdsa-sha2-nistp521',
    'rsa-sha2-512',
    'rsa-sha2-256',
    'ssh-rsa',
)

TIER1_MODERN_CIPHERS = (
    'aes128-gcm@openssh.com',
    'aes256-gcm@openssh.com',
    'aes128-ctr',
    'aes192-ctr',
    'aes256-ctr',
)

TIER1_MODERN_MACS = (
    'hmac-sha2-256-etm@openssh.com',
    'hmac-sha2-512-etm@openssh.com',
    'hmac-sha2-256',
    'hmac-sha2-512',
    'hmac-sha1',
)

# ==============================================================================
# Tier 2: Adaptive Legacy Fallback (Cisco Catalyst 2960/3560/3750, IOS 12/15)
# Activated ONLY if the peer rejects modern algorithms or drops handshake
# ==============================================================================
TIER2_LEGACY_KEX = (
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group1-sha1',
    'diffie-hellman-group-exchange-sha1',
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group14-sha256',
    'diffie-hellman-group16-sha512',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
)

TIER2_LEGACY_KEYS = (
    'ssh-rsa',
    'ssh-dss',
    'rsa-sha2-256',
    'rsa-sha2-512',
)

TIER2_LEGACY_CIPHERS = (
    'aes128-cbc',
    '3des-cbc',
    'aes256-cbc',
    'aes192-cbc',
    'aes128-ctr',
    'aes256-ctr',
)

TIER2_LEGACY_MACS = (
    'hmac-sha1',
    'hmac-sha1-96',
    'hmac-md5',
    'hmac-md5-96',
    'hmac-sha2-256',
)

# ==============================================================================
# Cisco Catalyst 2960 / Catalyst IOS Adaptive Cryptographic Suite
# Cisco Catalyst 2960/3560 switches natively expect SSHv2 with DH Group 14/1 SHA1,
# classic ssh-rsa host keys, and aes128-cbc / 3des-cbc ciphers.
# Sending modern elliptic curves (curve25519) first causes older IOS 12/15 to reset TCP sessions.
# ==============================================================================
CISCO_2960_KEX = (
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group1-sha1',
    'diffie-hellman-group-exchange-sha1',
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group14-sha256',
    'diffie-hellman-group16-sha512',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
)

CISCO_2960_KEYS = (
    'ssh-rsa',
    'rsa-sha2-256',
    'rsa-sha2-512',
    'ssh-dss',
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
)

CISCO_2960_CIPHERS = (
    'aes128-cbc',
    '3des-cbc',
    'aes256-cbc',
    'aes192-cbc',
    'aes128-ctr',
    'aes192-ctr',
    'aes256-ctr',
)

CISCO_2960_MACS = (
    'hmac-sha1',
    'hmac-sha1-96',
    'hmac-sha2-256',
    'hmac-sha2-512',
    'hmac-md5',
    'hmac-md5-96',
)

# ==============================================================================
# Proven NetTop Reference Cryptographic Suite (Cisco / MikroTik / Network HW)
# Ensures Paramiko 2 supports SSHv2 with all modern and legacy KEX algorithms,
# ciphers, host key types, and MACs used by Cisco IOS, Catalyst 2960/3560, and Nexus.
# ==============================================================================
RECOMMENDED_KEX: Tuple[str, ...] = (
    # Modern secure curves (RFC 8731 & OpenSSH)
    'curve25519-sha256',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
    'ecdh-sha2-nistp384',
    'ecdh-sha2-nistp521',
    # Modern Diffie-Hellman (SHA-256 / SHA-512)
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group14-sha256',
    'diffie-hellman-group16-sha512',
    # Legacy Cisco / Catalyst / IOS 12 & 15 / MikroTik RouterOS algorithms (SHA-1)
    'diffie-hellman-group-exchange-sha1',
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group1-sha1'
)

RECOMMENDED_CIPHERS: Tuple[str, ...] = (
    'aes128-ctr',
    'aes192-ctr',
    'aes256-ctr',
    'aes128-cbc',
    'aes192-cbc',
    'aes256-cbc',
    '3des-cbc'
)

RECOMMENDED_KEYS: Tuple[str, ...] = (
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ecdsa-sha2-nistp521',
    'rsa-sha2-512',
    'rsa-sha2-256',
    'ssh-rsa',
    'ssh-dss'
)

RECOMMENDED_MACS: Tuple[str, ...] = (
    'hmac-sha2-256',
    'hmac-sha2-512',
    'hmac-sha1',
    'hmac-sha1-96',
    'hmac-md5',
    'hmac-md5-96',
    'hmac-sha2-256-etm@openssh.com',
    'hmac-sha2-512-etm@openssh.com'
)

_PATCHED = False


def ensure_paramiko_compatibility() -> bool:
    """
    Globally patches Paramiko Transport defaults and hooks _parse_kex_init
    to support all SSH Version 2 Key Exchange algorithms, ciphers, and key types
    needed for Cisco switches, preventing 'no acceptable kex algorithm' errors.
    Proven implementation ported from NetTop reference.
    """
    global _PATCHED
    if _PATCHED:
        return True

    try:
        import paramiko
        import paramiko.transport
        from paramiko.kex_curve25519 import KexCurve25519
        from paramiko.kex_group1 import KexGroup1
        from paramiko.kex_group14 import KexGroup14, KexGroup14SHA256
        from paramiko.kex_gex import KexGex, KexGexSHA256
        from paramiko.kex_ecdh_nist import KexNistp256, KexNistp384, KexNistp521

        # 1. Register KEX engines into Transport._kex_info (standard OpenSSH names & legacy Cisco DH)
        if hasattr(paramiko.Transport, '_kex_info'):
            paramiko.Transport._kex_info['curve25519-sha256'] = KexCurve25519
            paramiko.Transport._kex_info['curve25519-sha256@libssh.org'] = KexCurve25519
            paramiko.Transport._kex_info['diffie-hellman-group-exchange-sha1'] = KexGex
            paramiko.Transport._kex_info['diffie-hellman-group-exchange-sha256'] = KexGexSHA256
            paramiko.Transport._kex_info['diffie-hellman-group14-sha1'] = KexGroup14
            paramiko.Transport._kex_info['diffie-hellman-group14-sha256'] = KexGroup14SHA256
            paramiko.Transport._kex_info['diffie-hellman-group1-sha1'] = KexGroup1
            paramiko.Transport._kex_info['ecdh-sha2-nistp256'] = KexNistp256
            paramiko.Transport._kex_info['ecdh-sha2-nistp384'] = KexNistp384
            paramiko.Transport._kex_info['ecdh-sha2-nistp521'] = KexNistp521

        # 2. Set class-level preferred algorithms
        valid_kex = tuple(k for k in RECOMMENDED_KEX if k in getattr(paramiko.Transport, '_kex_info', {}))
        paramiko.Transport._preferred_kex = valid_kex

        if hasattr(paramiko.Transport, '_cipher_info'):
            valid_ciphers = tuple(c for c in RECOMMENDED_CIPHERS if c in paramiko.Transport._cipher_info)
            paramiko.Transport._preferred_ciphers = valid_ciphers

        valid_keys = tuple(k for k in RECOMMENDED_KEYS if hasattr(paramiko.Transport, '_preferred_keys') and k in paramiko.Transport._preferred_keys)
        if valid_keys:
            paramiko.Transport._preferred_keys = valid_keys

        if hasattr(paramiko.Transport, '_mac_info'):
            valid_macs = tuple(m for m in RECOMMENDED_MACS if m in paramiko.Transport._mac_info)
            paramiko.Transport._preferred_macs = valid_macs

        # 3. Patch Transport.__init__ so any transport instance automatically receives full security options
        orig_init = paramiko.Transport.__init__
        if not getattr(paramiko.Transport, '_netmgmt_init_patched', False):
            def patched_init(self, *args, **kwargs):
                orig_init(self, *args, **kwargs)
                try:
                    self._preferred_kex = valid_kex
                    if hasattr(self, '_cipher_info'):
                        self._preferred_ciphers = valid_ciphers
                    if hasattr(self, '_preferred_keys') and valid_keys:
                        self._preferred_keys = valid_keys
                    if hasattr(self, '_mac_info'):
                        self._preferred_macs = valid_macs
                except Exception:
                    pass
            paramiko.Transport.__init__ = patched_init
            paramiko.Transport._netmgmt_init_patched = True

        # 4. Adaptive KEX negotiation hook:
        # If the remote peer offers algorithms that Paramiko might otherwise reject,
        # dynamically resolve and register the engine so connection never fails with
        # 'Incompatible ssh peer (no acceptable kex algorithm)'
        orig_parse_kex_init = paramiko.Transport._parse_kex_init
        if not getattr(paramiko.Transport, '_netmgmt_kex_instrumented', False):
            def adaptive_parse_kex_init(self, m):
                try:
                    res = orig_parse_kex_init(self, m)
                    # Record agreed KEX engine
                    try:
                        if hasattr(self, 'kex_engine') and self.kex_engine:
                            for name, cls in getattr(self, '_kex_info', {}).items():
                                if isinstance(self.kex_engine, cls):
                                    self._agreed_kex = name
                                    break
                    except Exception:
                        pass
                    return res
                except paramiko.ssh_exception.IncompatiblePeer as e:
                    err_str = str(e).lower()
                    if "kex" in err_str and hasattr(self, 'remote_kex_init') and self.remote_kex_init:
                        try:
                            # Re-parse remote message
                            msg_copy = paramiko.message.Message(self.remote_kex_init)
                            server_kex = []
                            if hasattr(self, '_really_parse_kex_init'):
                                parsed = self._really_parse_kex_init(msg_copy, ignore_first_byte=True)
                                server_kex = parsed.get("kex_algo_list", [])
                            else:
                                try:
                                    msg_copy.get_bytes(16)  # skip cookie
                                    server_kex = msg_copy.get_list()
                                except Exception:
                                    server_kex = []

                            # Find any match in RECOMMENDED_KEX or dynamically map
                            chosen_kex = None
                            for s_kex in server_kex:
                                if s_kex in getattr(paramiko.Transport, '_kex_info', {}):
                                    chosen_kex = s_kex
                                    break
                                elif 'curve25519' in s_kex:
                                    paramiko.Transport._kex_info[s_kex] = KexCurve25519
                                    chosen_kex = s_kex
                                    break
                                elif 'group14' in s_kex:
                                    paramiko.Transport._kex_info[s_kex] = KexGroup14
                                    chosen_kex = s_kex
                                    break
                                elif 'group1' in s_kex:
                                    paramiko.Transport._kex_info[s_kex] = KexGroup1
                                    chosen_kex = s_kex
                                    break
                                elif 'exchange' in s_kex or 'gex' in s_kex:
                                    paramiko.Transport._kex_info[s_kex] = KexGex
                                    chosen_kex = s_kex
                                    break

                            if chosen_kex:
                                self._preferred_kex = (chosen_kex,) + tuple(self._preferred_kex or ())
                                msg_retry = paramiko.message.Message(self.remote_kex_init)
                                if msg_retry.asbytes().startswith(bytes([paramiko.common.cMSG_KEXINIT[0]])):
                                    msg_retry.get_byte()
                                res = orig_parse_kex_init(self, msg_retry)
                                self._agreed_kex = chosen_kex
                                return res
                        except Exception as inner_e:
                            logger.warning(f"[Paramiko Adaptive KEX] Failed recovery: {inner_e}")
                    raise e

            paramiko.Transport._parse_kex_init = adaptive_parse_kex_init
            paramiko.Transport._netmgmt_kex_instrumented = True

        _PATCHED = True
        logger.info("[Paramiko Patch] Successfully enabled adaptive SSH v2 KEX & Cipher algorithms for Cisco switches.")
        return True
    except Exception as e:
        logger.warning(f"Could not patch paramiko defaults: {e}")
        return False


def configure_paramiko_security():
    """Alias for ensure_paramiko_compatibility matching NetTop naming."""
    return ensure_paramiko_compatibility()


class CiscoCompatibleTransport:
    """
    Transport factory that instantiates paramiko.Transport and explicitly
    sets security options to accept all Cisco SSH Version 2 KEX algorithms and ciphers.
    Ported directly from proven NetTop implementation.
    """
    def __new__(cls, *args, **kwargs):
        import paramiko
        ensure_paramiko_compatibility()
        transport = paramiko.Transport(*args, **kwargs)
        try:
            sec = transport.get_security_options()
            valid_kex = list(k for k in RECOMMENDED_KEX if k in getattr(paramiko.Transport, '_kex_info', {}))
            if valid_kex:
                sec.kex = valid_kex
            if hasattr(paramiko.Transport, '_cipher_info'):
                valid_ciphers = list(c for c in RECOMMENDED_CIPHERS if c in paramiko.Transport._cipher_info)
                if valid_ciphers:
                    sec.ciphers = valid_ciphers
            if hasattr(paramiko.Transport, '_preferred_keys'):
                valid_keys = list(k for k in RECOMMENDED_KEYS if k in paramiko.Transport._preferred_keys)
                if valid_keys:
                    sec.key_types = valid_keys
        except Exception as e:
            logger.debug(f"[CiscoCompatibleTransport] Error setting security options: {e}")
        return transport


# Automatically ensure compatibility on import
ensure_paramiko_compatibility()


def apply_security_options_safely(
    transport: Any,
    kex_candidates: Optional[Tuple[str, ...]] = None,
    key_candidates: Optional[Tuple[str, ...]] = None,
    cipher_candidates: Optional[Tuple[str, ...]] = None,
    mac_candidates: Optional[Tuple[str, ...]] = None
) -> None:
    """
    Safely applies security options to a live paramiko.Transport instance.
    Every candidate is strictly filtered against the transport's actual internal
    dictionaries (_cipher_info, _kex_info, _key_info, _mac_info).
    This completely eliminates 'unknown cipher' or 'unknown algorithm' ValueErrors.
    """
    try:
        sec = transport.get_security_options()
    except Exception:
        return

    # 1. Safely apply KEX
    if kex_candidates:
        valid_kex_dict = getattr(transport, '_kex_info', None)
        if valid_kex_dict and isinstance(valid_kex_dict, dict):
            filtered = tuple(k for k in kex_candidates if k in valid_kex_dict)
        else:
            filtered = tuple(k for k in kex_candidates if k in (sec.kex or ()))
        if filtered:
            try:
                sec.kex = filtered
            except Exception:
                pass

    # 2. Safely apply Host Keys
    if key_candidates:
        valid_key_dict = getattr(transport, '_key_info', None)
        if valid_key_dict and isinstance(valid_key_dict, dict):
            filtered = tuple(k for k in key_candidates if k in valid_key_dict)
        else:
            filtered = tuple(k for k in key_candidates if k in (sec.key_types or ()))
        if filtered:
            try:
                sec.key_types = filtered
            except Exception:
                pass

    # 3. Safely apply Ciphers (CRITICAL: only assign what strictly exists in transport._cipher_info)
    if cipher_candidates:
        valid_cipher_dict = getattr(transport, '_cipher_info', None)
        if valid_cipher_dict and isinstance(valid_cipher_dict, dict):
            filtered = tuple(c for c in cipher_candidates if c in valid_cipher_dict)
        else:
            filtered = tuple(c for c in cipher_candidates if c in (sec.ciphers or ()))
        if filtered:
            try:
                sec.ciphers = filtered
            except Exception:
                pass

    # 4. Safely apply MACs
    if mac_candidates:
        valid_mac_dict = getattr(transport, '_mac_info', None)
        if valid_mac_dict and isinstance(valid_mac_dict, dict):
            filtered = tuple(m for m in mac_candidates if m in valid_mac_dict)
        else:
            filtered = tuple(m for m in mac_candidates if m in (sec.digests or ()))
        if filtered:
            try:
                sec.digests = filtered
            except Exception:
                pass


def is_handshake_or_algo_mismatch(exc: Exception) -> bool:
    """
    Determines if an SSH connection failure was caused by algorithm incompatibility,
    KEX failure, or connection reset during key exchange (e.g. Cisco Catalyst 2960
    dropping packets when elliptic curve KEX is offered), rather than wrong password
    or network unreachability.
    """
    try:
        import paramiko
        if isinstance(exc, (paramiko.AuthenticationException, paramiko.BadAuthenticationType)):
            return False
    except ImportError:
        pass

    msg = str(exc).lower()

    # Definitive authentication rejections should NOT trigger legacy retry
    if any(auth_word in msg for auth_word in ["bad authentication", "denied", "userauth", "password refused"]):
        return False

    # Host unreachability or connection refused should NOT trigger legacy retry
    if any(net_word in msg for net_word in ["connection refused", "network is unreachable", "no route to host"]):
        return False

    # Indications of algorithm or handshake mismatch
    algo_indicators = [
        "kex",
        "incompatible",
        "no acceptable",
        "no matching",
        "cipher",
        "key exchange",
        "algorithm",
        "unknown cipher",
        "peer closed",
        "banner",
        "eof",
        "reset by peer",
        "closed by remote",
        "packet",
        "session closed",
    ]
    return any(ind in msg for ind in algo_indicators)


def authenticate_transport(transport: Any, username: str, password: str) -> Tuple[bool, Optional[str]]:
    """
    Authenticates an active transport using password authentication,
    falling back to keyboard-interactive (AAA / TACACS+ / RADIUS) if needed.
    """
    import paramiko
    auth_ok = False
    err_msg = None

    try:
        transport.auth_password(username=username, password=password)
        auth_ok = transport.is_authenticated()
    except (paramiko.BadAuthenticationType, paramiko.AuthenticationException) as e:
        err_msg = str(e)
        # Fallback to keyboard-interactive prompt
        def interactive_handler(title, instructions, prompt_list):
            return [password for _ in prompt_list]
        try:
            transport.auth_interactive(username=username, handler=interactive_handler)
            auth_ok = transport.is_authenticated()
            if auth_ok:
                err_msg = None
        except Exception as e_int:
            auth_ok = False
            err_msg = str(e_int)
    except Exception as e_other:
        auth_ok = False
        err_msg = str(e_other)

    return auth_ok, err_msg


def extract_negotiation_info(transport: Any, tier_name: str) -> Dict[str, Any]:
    """
    Inspects a connected transport and extracts the exact negotiated parameters.
    """
    kex_name = getattr(transport, '_agreed_kex', None)
    if not kex_name and hasattr(transport, 'kex_engine') and transport.kex_engine:
        kex_name = transport.kex_engine.__class__.__name__

    server_key_type = None
    try:
        remote_key = transport.get_remote_server_key()
        if remote_key:
            server_key_type = remote_key.get_name()
    except Exception:
        pass

    return {
        "tier": tier_name,
        "kex": kex_name or "negotiated",
        "cipher": getattr(transport, 'remote_cipher', None),
        "local_cipher": getattr(transport, 'local_cipher', None),
        "key_type": server_key_type,
        "mac": getattr(transport, 'remote_mac', None),
    }


# ==============================================================================
# MikroTik RouterOS Multi-Tier Adaptive SSH Protocol Suites
#
# Tier 1: Modern Fast Path (RouterOS v7+ & Modern ROSSSH / OpenSSH)
# High-version modern cryptographic suites: Ed25519, ECDSA, RSA-SHA2-512/256,
# Curve25519, ECDH-SHA2, Chacha20-Poly1305, AES-GCM, AES-CTR, SHA2-ETM MACs.
#
# Tier 2: Transitional ROSSSH Suite (RouterOS v6.4x with RFC 8332 Workaround)
# Excludes RSA-SHA2-256/512 pubkey extensions to prevent ROSSSH signature rejection,
# prioritizing Ed25519, ECDSA, and classic ssh-rsa with CTR/GCM ciphers.
#
# Tier 3: Legacy Hardware Fallback (Older RouterOS v6.x, v5.x, RB750/RB450/legacy boards)
# Uses DH Group 14/1 SHA1, Group-Exchange, classic ssh-rsa, ssh-dss, and CBC/3DES ciphers.
# ==============================================================================

MIKROTIK_TIER1_MODERN_KEX = (
    'curve25519-sha256',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
    'ecdh-sha2-nistp384',
    'ecdh-sha2-nistp521',
    'diffie-hellman-group16-sha512',
    'diffie-hellman-group18-sha512',
    'diffie-hellman-group14-sha256',
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group1-sha1',
)

MIKROTIK_TIER1_MODERN_KEYS = (
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ecdsa-sha2-nistp521',
    'rsa-sha2-512',
    'rsa-sha2-256',
    'ssh-rsa',
    'ssh-dss',
)

MIKROTIK_TIER1_MODERN_CIPHERS = (
    'chacha20-poly1305@openssh.com',
    'aes256-gcm@openssh.com',
    'aes128-gcm@openssh.com',
    'aes256-ctr',
    'aes192-ctr',
    'aes128-ctr',
    'aes256-cbc',
    'aes128-cbc',
)

MIKROTIK_TIER1_MODERN_MACS = (
    'hmac-sha2-256-etm@openssh.com',
    'hmac-sha2-512-etm@openssh.com',
    'hmac-sha2-256',
    'hmac-sha2-512',
    'hmac-sha1',
)

MIKROTIK_TIER2_COMPAT_KEX = (
    'curve25519-sha256',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
    'ecdh-sha2-nistp384',
    'diffie-hellman-group14-sha256',
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group-exchange-sha1',
    'diffie-hellman-group1-sha1',
)

MIKROTIK_TIER2_COMPAT_KEYS = (
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ssh-rsa',
    'ssh-dss',
)

MIKROTIK_TIER2_COMPAT_CIPHERS = (
    'aes128-ctr',
    'aes192-ctr',
    'aes256-ctr',
    'aes128-gcm@openssh.com',
    'aes256-gcm@openssh.com',
    'aes128-cbc',
    'aes256-cbc',
    '3des-cbc',
)

MIKROTIK_TIER2_COMPAT_MACS = (
    'hmac-sha2-256',
    'hmac-sha2-512',
    'hmac-sha1',
    'hmac-sha1-96',
    'hmac-md5',
)

MIKROTIK_TIER3_LEGACY_KEX = (
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group1-sha1',
    'diffie-hellman-group-exchange-sha1',
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group14-sha256',
)

MIKROTIK_TIER3_LEGACY_KEYS = (
    'ssh-rsa',
    'ssh-dss',
)

MIKROTIK_TIER3_LEGACY_CIPHERS = (
    'aes128-cbc',
    '3des-cbc',
    'aes256-cbc',
    'aes192-cbc',
    'aes128-ctr',
    'aes256-ctr',
)

MIKROTIK_TIER3_LEGACY_MACS = (
    'hmac-sha1',
    'hmac-sha1-96',
    'hmac-md5',
    'hmac-md5-96',
    'hmac-sha2-256',
)

# Retain backward-compatible references
MIKROTIK_KEX = MIKROTIK_TIER1_MODERN_KEX
MIKROTIK_KEYS = MIKROTIK_TIER1_MODERN_KEYS
MIKROTIK_CIPHERS = MIKROTIK_TIER1_MODERN_CIPHERS
MIKROTIK_MACS = MIKROTIK_TIER1_MODERN_MACS


def _authenticate_mikrotik_transport(
    transport: Any,
    username: str,
    password: str = "",
    timeout: float = 6.0
) -> Tuple[bool, Optional[str]]:
    """
    Helper to authenticate MikroTik transport handling password and keyboard-interactive cleanly,
    and auth_none only if password is truly empty.
    """
    user_to_try = username or "admin"
    auth_err = None

    # 1. If password is provided, attempt standard password authentication
    if password:
        try:
            transport.auth_password(username=user_to_try, password=password)
            if transport.is_authenticated():
                return True, None
        except Exception as e_pwd:
            auth_err = str(e_pwd)

        # 2. If password authentication failed, try keyboard-interactive prompt with the password
        if not transport.is_authenticated():
            try:
                def interactive_handler(title, instructions, prompt_list):
                    return [password for _ in prompt_list]
                transport.auth_interactive(username=user_to_try, handler=interactive_handler)
                if transport.is_authenticated():
                    return True, None
            except Exception as e_int:
                auth_err = auth_err or str(e_int)

        # 3. Try trimmed password if there were leading/trailing spaces
        if not transport.is_authenticated() and password.strip() != password:
            try:
                transport.auth_password(username=user_to_try, password=password.strip())
                if transport.is_authenticated():
                    return True, None
            except Exception as e_trim:
                auth_err = str(e_trim)

    # 4. If password is empty or None, try auth_none
    else:
        try:
            transport.auth_none(user_to_try)
            if transport.is_authenticated():
                return True, None
        except Exception as e_none:
            auth_err = str(e_none)

        try:
            transport.auth_password(username=user_to_try, password="")
            if transport.is_authenticated():
                return True, None
        except Exception as e_empty:
            auth_err = auth_err or str(e_empty)

    return False, auth_err or f"Authentication failed for user '{user_to_try}'"


def connect_mikrotik_ssh(
    client: Any,
    hostname: str,
    port: int = 22,
    username: str = "admin",
    password: str = "",
    timeout: float = 6.0,
    banner_timeout: float = 6.0,
    auth_timeout: float = 6.0,
    on_fallback_log: Optional[Any] = None
) -> Tuple[bool, Optional[str]]:
    """
    High-performance multi-tier adaptive SSH connection engine for MikroTik RouterOS.
    
    Checks highest modern versions of SSH first (Tier 1: RouterOS v7+ & modern OpenSSH/ROSSSH),
    then automatically falls back to transitional ROSSSH (Tier 2) and legacy firmware (Tier 3),
    ensuring both newest and oldest MikroTik devices connect with 100% real telemetry:

    - Tier 1 (Modern Fast Path - RouterOS v7+):
      Uses modern high-security suites: Curve25519, ECDH, DH16/18, Ed25519, RSA-SHA2-512/256,
      Chacha20-Poly1305, AES-GCM, and AES-CTR.
    - Tier 2 (Transitional ROSSSH Engine - RouterOS v6.4x):
      Bypasses ROSSSH RFC 8332 bug (where server-sig-algs rsa-sha2 causes signature errors),
      restricting to ssh-ed25519, ecdsa, and classic ssh-rsa.
    - Tier 3 (Legacy Hardware Fallback - Older RouterOS v6/v5, RB750/RB450):
      Falls back to legacy DH Group 14/1, Group Exchange, classic ssh-rsa, ssh-dss, and CBC/3DES ciphers.
    """
    ensure_paramiko_compatibility()
    import paramiko
    import inspect

    last_error = None
    user_to_try = username or "admin"

    # ==========================================================================
    # Tier 0: Direct High-Level Paramiko Connection (look_for_keys=False, allow_agent=False)
    # Native Paramiko SSHClient auto-negotiation handles both password and PAM interactive
    # ==========================================================================
    try:
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=hostname,
            port=port,
            username=user_to_try,
            password=password if password is not None else "",
            look_for_keys=False,
            allow_agent=False,
            timeout=timeout,
            banner_timeout=banner_timeout,
            auth_timeout=auth_timeout
        )
        t0 = client.get_transport()
        if t0 and t0.is_authenticated():
            client._negotiation_info = extract_negotiation_info(t0, "mikrotik_tier0_native")
            logger.info(
                f"[MikroTik SSH Tier 0 Native] Connected successfully to {hostname}:{port} | "
                f"KEX: {client._negotiation_info.get('kex')} | "
                f"Cipher: {client._negotiation_info.get('cipher')} | "
                f"Key: {client._negotiation_info.get('key_type')}"
            )
            return True, None
    except paramiko.AuthenticationException as e_auth:
        last_error = f"Authentication failed for user '{user_to_try}'"
        logger.debug(f"[MikroTik SSH Tier 0] Auth failed: {e_auth}")
    except Exception as e_t0:
        last_error = str(e_t0)
        logger.debug(f"[MikroTik SSH Tier 0] Native connect notice: {e_t0}. Proceeding to tiered security suites...")

    # ==========================================================================
    # Tier 1: Modern Fast Path (RouterOS v7+, CHR, newer CCR/CRS)
    # Uses the highest modern cryptographic algorithms without disabling any modern pubkeys.
    # ==========================================================================
    sock1 = None
    transport1 = None
    try:
        sock1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock1.settimeout(timeout)
        sock1.connect((hostname, port))

        transport1 = paramiko.Transport(sock1)
        apply_security_options_safely(
            transport1,
            kex_candidates=MIKROTIK_TIER1_MODERN_KEX,
            key_candidates=MIKROTIK_TIER1_MODERN_KEYS,
            cipher_candidates=MIKROTIK_TIER1_MODERN_CIPHERS,
            mac_candidates=MIKROTIK_TIER1_MODERN_MACS
        )
        transport1.start_client(timeout=banner_timeout)

        auth_ok, auth_err = _authenticate_mikrotik_transport(transport1, user_to_try, password, auth_timeout)
        if auth_ok:
            client._transport = transport1
            client._negotiation_info = extract_negotiation_info(transport1, "mikrotik_tier1_modern")
            logger.info(
                f"[MikroTik SSH Tier 1 Modern] Connected successfully to {hostname}:{port} | "
                f"KEX: {client._negotiation_info.get('kex')} | "
                f"Cipher: {client._negotiation_info.get('cipher')} | "
                f"Key: {client._negotiation_info.get('key_type')}"
            )
            return True, None
        else:
            last_error = auth_err
            logger.debug(f"[MikroTik SSH Tier 1] Auth failed: {auth_err}. Attempting Tier 2 compatibility...")
    except Exception as e_tier1:
        last_error = str(e_tier1).strip()
        logger.debug(f"[MikroTik SSH Tier 1 Modern] Handshake/auth failed: {e_tier1}. Falling back to Tier 2...")
    finally:
        if not getattr(client, '_transport', None) or client._transport is not transport1:
            if transport1:
                try:
                    transport1.close()
                except Exception:
                    pass
            if sock1:
                try:
                    sock1.close()
                except Exception:
                    pass

    # ==========================================================================
    # Tier 2: Transitional ROSSSH Engine (RouterOS v6.4x RFC 8332 Workaround)
    # Uses ssh-ed25519, ecdsa, and classic ssh-rsa (omits rsa-sha2-256/512 pubkeys)
    # ==========================================================================
    if on_fallback_log and callable(on_fallback_log):
        on_fallback_log(f"Switching to MikroTik Tier 2 (Transitional ROSSSH) on {hostname}:{port}")

    sock2 = None
    transport2 = None
    try:
        sock2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock2.settimeout(timeout)
        sock2.connect((hostname, port))

        transport2 = paramiko.Transport(sock2)
        apply_security_options_safely(
            transport2,
            kex_candidates=MIKROTIK_TIER2_COMPAT_KEX,
            key_candidates=MIKROTIK_TIER2_COMPAT_KEYS,
            cipher_candidates=MIKROTIK_TIER2_COMPAT_CIPHERS,
            mac_candidates=MIKROTIK_TIER2_COMPAT_MACS
        )
        transport2.start_client(timeout=banner_timeout)

        auth_ok, auth_err = _authenticate_mikrotik_transport(transport2, user_to_try, password, auth_timeout)
        if auth_ok:
            client._transport = transport2
            client._negotiation_info = extract_negotiation_info(transport2, "mikrotik_tier2_compat")
            logger.info(
                f"[MikroTik SSH Tier 2 Compat] Connected successfully to {hostname}:{port} | "
                f"KEX: {client._negotiation_info.get('kex')} | "
                f"Cipher: {client._negotiation_info.get('cipher')} | "
                f"Key: {client._negotiation_info.get('key_type')}"
            )
            return True, None
        else:
            last_error = auth_err
            logger.debug(f"[MikroTik SSH Tier 2] Auth failed: {auth_err}. Attempting Tier 3 legacy...")
    except Exception as e_tier2:
        last_error = str(e_tier2).strip()
        logger.debug(f"[MikroTik SSH Tier 2 Compat] Handshake/auth failed: {e_tier2}. Falling back to Tier 3...")
    finally:
        if not getattr(client, '_transport', None) or client._transport is not transport2:
            if transport2:
                try:
                    transport2.close()
                except Exception:
                    pass
            if sock2:
                try:
                    sock2.close()
                except Exception:
                    pass

    # ==========================================================================
    # Tier 3: Legacy MikroTik Hardware Fallback (Older RouterOS v6.x, v5.x, RB750/RB450)
    # Uses legacy DH Group 14/1, Group-Exchange, ssh-rsa, ssh-dss, and CBC/3DES ciphers.
    # ==========================================================================
    if on_fallback_log and callable(on_fallback_log):
        on_fallback_log(f"Switching to MikroTik Tier 3 (Legacy Firmware Fallback) on {hostname}:{port}")

    sock3 = None
    transport3 = None
    try:
        sock3 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock3.settimeout(timeout)
        sock3.connect((hostname, port))

        transport3 = paramiko.Transport(sock3)
        apply_security_options_safely(
            transport3,
            kex_candidates=MIKROTIK_TIER3_LEGACY_KEX,
            key_candidates=MIKROTIK_TIER3_LEGACY_KEYS,
            cipher_candidates=MIKROTIK_TIER3_LEGACY_CIPHERS,
            mac_candidates=MIKROTIK_TIER3_LEGACY_MACS
        )
        transport3.start_client(timeout=banner_timeout)

        auth_ok, auth_err = _authenticate_mikrotik_transport(transport3, user_to_try, password, auth_timeout)
        if auth_ok:
            client._transport = transport3
            client._negotiation_info = extract_negotiation_info(transport3, "mikrotik_tier3_legacy")
            logger.info(
                f"[MikroTik SSH Tier 3 Legacy] Connected successfully to {hostname}:{port} | "
                f"KEX: {client._negotiation_info.get('kex')} | "
                f"Cipher: {client._negotiation_info.get('cipher')} | "
                f"Key: {client._negotiation_info.get('key_type')}"
            )
            return True, None
        else:
            last_error = auth_err
    except Exception as e_tier3:
        last_error = str(e_tier3).strip()
        logger.debug(f"[MikroTik SSH Tier 3 Legacy] Handshake/auth failed: {e_tier3}")
    finally:
        if not getattr(client, '_transport', None) or client._transport is not transport3:
            if transport3:
                try:
                    transport3.close()
                except Exception:
                    pass
            if sock3:
                try:
                    sock3.close()
                except Exception:
                    pass

    return False, last_error or f"MikroTik SSH connection failed for user '{user_to_try}' on {hostname}:{port}"


def _emit_event_safe(on_event: Optional[Any], stage: str, title: str, detail: str, level: str = "info", meta: Optional[Dict[str, Any]] = None):
    """Safely notifies connection lifecycle listeners without throwing exceptions."""
    if on_event and callable(on_event):
        try:
            on_event(stage, title, detail, level, meta)
        except Exception as e:
            logger.debug(f"[ssh_compat] Event callback error: {e}")


# ==============================================================================
# 3-Profile Negotiation Architecture & Fallback Chain
#
# Profile 1: Modern Defaults (Curve25519, ECDH-SHA2, AES-CTR/GCM, Ed25519/RSA-SHA2)
# Profile 2: Modern + Group14-SHA1 + CBC ciphers + ssh-rsa
# Profile 3: Full Legacy Cisco (Group14, Group-Exchange, Group1, all CBC, 3DES, HMAC-SHA1, ssh-rsa)
# ==============================================================================

PROFILE_1_KEX: Tuple[str, ...] = (
    'curve25519-sha256',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
    'ecdh-sha2-nistp384',
    'ecdh-sha2-nistp521',
    'diffie-hellman-group16-sha512',
    'diffie-hellman-group18-sha512',
    'diffie-hellman-group14-sha256',
)

PROFILE_1_CIPHERS: Tuple[str, ...] = (
    'aes128-ctr',
    'aes192-ctr',
    'aes256-ctr',
    'aes128-gcm@openssh.com',
    'aes256-gcm@openssh.com',
    'chacha20-poly1305@openssh.com',
)

PROFILE_1_MACS: Tuple[str, ...] = (
    'hmac-sha2-256-etm@openssh.com',
    'hmac-sha2-512-etm@openssh.com',
    'hmac-sha2-256',
    'hmac-sha2-512',
)

PROFILE_1_KEYS: Tuple[str, ...] = (
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ecdsa-sha2-nistp521',
    'rsa-sha2-512',
    'rsa-sha2-256',
)

PROFILE_2_KEX: Tuple[str, ...] = (
    'diffie-hellman-group14-sha1',
) + PROFILE_1_KEX

PROFILE_2_CIPHERS: Tuple[str, ...] = (
    'aes128-ctr',
    'aes192-ctr',
    'aes256-ctr',
    'aes128-cbc',
    'aes192-cbc',
    'aes256-cbc',
)

PROFILE_2_MACS: Tuple[str, ...] = (
    'hmac-sha2-256',
    'hmac-sha1',
    'hmac-sha1-96',
    'hmac-md5',
)

PROFILE_2_KEYS: Tuple[str, ...] = (
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'rsa-sha2-512',
    'rsa-sha2-256',
    'ssh-rsa',
)

PROFILE_3_KEX: Tuple[str, ...] = (
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group-exchange-sha1',
    'diffie-hellman-group1-sha1',
    'diffie-hellman-group-exchange-sha256',
    'diffie-hellman-group14-sha256',
    'curve25519-sha256',
    'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256',
)

PROFILE_3_CIPHERS: Tuple[str, ...] = (
    'aes128-ctr',
    'aes192-ctr',
    'aes256-ctr',
    'aes128-cbc',
    'aes192-cbc',
    'aes256-cbc',
    '3des-cbc',
)

PROFILE_3_MACS: Tuple[str, ...] = (
    'hmac-sha2-256',
    'hmac-sha1',
    'hmac-sha1-96',
    'hmac-md5',
)

PROFILE_3_KEYS: Tuple[str, ...] = (
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'rsa-sha2-512',
    'rsa-sha2-256',
    'ssh-rsa',
)

PROFILES_CONFIG: Dict[str, Dict[str, Any]] = {
    "profile_1": {
        "id": "profile_1",
        "name": "profile 1 (modern defaults)",
        "label": "Profile 1 (Modern Defaults)",
        "kex": PROFILE_1_KEX,
        "ciphers": PROFILE_1_CIPHERS,
        "macs": PROFILE_1_MACS,
        "keys": PROFILE_1_KEYS,
        "tier": "tier1_modern",
    },
    "profile_2": {
        "id": "profile_2",
        "name": "profile 2 (modern + group14-sha1 + CBC + ssh-rsa)",
        "label": "Profile 2 (Modern + Group14-SHA1 + CBC + ssh-rsa)",
        "kex": PROFILE_2_KEX,
        "ciphers": PROFILE_2_CIPHERS,
        "macs": PROFILE_2_MACS,
        "keys": PROFILE_2_KEYS,
        "tier": "tier2_intermediate",
    },
    "profile_3": {
        "id": "profile_3",
        "name": "profile 3 (full legacy Cisco)",
        "label": "Profile 3 (Full Legacy Cisco: DH Group 14/GEX/1, CBC, 3DES, ssh-rsa)",
        "kex": PROFILE_3_KEX,
        "ciphers": PROFILE_3_CIPHERS,
        "macs": PROFILE_3_MACS,
        "keys": PROFILE_3_KEYS,
        "tier": "tier3_legacy_cisco",
    },
}

_PROFILE_ORDER: List[str] = ["profile_1", "profile_2", "profile_3"]

# In-memory per-host profile cache so subsequent sessions go straight to the working profile
_HOST_PROFILE_CACHE: Dict[str, str] = {}


def _filter_algorithms_for_transport(
    transport: Any,
    kex_candidates: Tuple[str, ...],
    cipher_candidates: Tuple[str, ...],
    mac_candidates: Tuple[str, ...],
    key_candidates: Tuple[str, ...]
) -> Tuple[Tuple[str, ...], Tuple[str, ...], Tuple[str, ...], Tuple[str, ...]]:
    """
    Safely filters candidates against paramiko.Transport's registered tables
    (_kex_info, _cipher_info, _mac_info, _key_info) so an unsupported name
    never causes a KeyError or exception.
    """
    import paramiko

    # 1. KEX filtering
    kex_table = getattr(transport, '_kex_info', None) or getattr(paramiko.Transport, '_kex_info', {})
    if isinstance(kex_table, dict) and kex_table:
        filtered_kex = tuple(k for k in kex_candidates if k in kex_table)
    else:
        existing = getattr(transport, '_preferred_kex', None) or getattr(paramiko.Transport, '_preferred_kex', ())
        filtered_kex = tuple(k for k in kex_candidates if k in existing)

    # 2. Cipher filtering
    cipher_table = getattr(transport, '_cipher_info', None) or getattr(paramiko.Transport, '_cipher_info', {})
    if isinstance(cipher_table, dict) and cipher_table:
        filtered_ciphers = tuple(c for c in cipher_candidates if c in cipher_table)
    else:
        existing = getattr(transport, '_preferred_ciphers', None) or getattr(paramiko.Transport, '_preferred_ciphers', ())
        filtered_ciphers = tuple(c for c in cipher_candidates if c in existing)

    # 3. MAC filtering
    mac_table = getattr(transport, '_mac_info', None) or getattr(paramiko.Transport, '_mac_info', {})
    if isinstance(mac_table, dict) and mac_table:
        filtered_macs = tuple(m for m in mac_candidates if m in mac_table)
    else:
        existing = getattr(transport, '_preferred_macs', None) or getattr(paramiko.Transport, '_preferred_macs', ())
        filtered_macs = tuple(m for m in mac_candidates if m in existing)

    # 4. Key filtering
    key_table = getattr(transport, '_key_info', None) or getattr(paramiko.Transport, '_key_info', {})
    if isinstance(key_table, dict) and key_table:
        filtered_keys = tuple(k for k in key_candidates if k in key_table)
    else:
        existing = getattr(transport, '_preferred_keys', None) or getattr(paramiko.Transport, '_preferred_keys', ())
        filtered_keys = tuple(k for k in key_candidates if k in existing)

    return filtered_kex, filtered_ciphers, filtered_macs, filtered_keys


def _apply_profile_to_transport(transport: Any, profile_dict: Dict[str, Any]) -> None:
    """
    Sets preferred algorithms explicitly on the Transport instance (per-instance, not global)
    BEFORE calling transport.start_client().
    """
    kex_filtered, ciphers_filtered, macs_filtered, keys_filtered = _filter_algorithms_for_transport(
        transport,
        profile_dict["kex"],
        profile_dict["ciphers"],
        profile_dict["macs"],
        profile_dict["keys"]
    )

    # Explicit per-instance preferred algorithm assignment
    transport._preferred_kex = kex_filtered
    transport._preferred_ciphers = ciphers_filtered
    transport._preferred_macs = macs_filtered
    transport._preferred_keys = keys_filtered

    # Also update SecurityOptions object if available
    try:
        sec = transport.get_security_options()
        if kex_filtered:
            sec.kex = list(kex_filtered)
        if ciphers_filtered:
            sec.ciphers = list(ciphers_filtered)
        if macs_filtered:
            sec.digests = list(macs_filtered)
        if keys_filtered:
            sec.key_types = list(keys_filtered)
    except Exception:
        pass


def _authenticate_transport_robust(
    transport: Any,
    username: str,
    password: str,
    auth_timeout: float = 30.0
) -> Tuple[bool, Optional[str]]:
    """
    Authenticates using transport.auth_password(); if that fails tries auth_interactive
    with keyboard-interactive prompt handler answering with password.
    Equivalent to look_for_keys=False and allow_agent=False.
    """
    import paramiko
    auth_ok = False
    err_msg = None

    # Step 1: standard password auth
    try:
        transport.auth_password(username=username, password=password)
        auth_ok = transport.is_authenticated()
        if auth_ok:
            return True, None
    except (paramiko.BadAuthenticationType, paramiko.AuthenticationException) as e:
        err_msg = str(e)
    except Exception as e:
        err_msg = str(e)

    # Step 2: keyboard-interactive fallback (e.g. AAA/TACACS+/RADIUS on Cisco switches)
    try:
        def interactive_handler(title, instructions, prompt_list):
            return [password for _ in prompt_list]

        transport.auth_interactive(username=username, handler=interactive_handler)
        auth_ok = transport.is_authenticated()
        if auth_ok:
            return True, None
    except Exception as e_int:
        err_msg = str(e_int) or err_msg

    return auth_ok, err_msg


def _attempt_ssh_profile(
    hostname: str,
    port: int,
    username: str,
    password: str,
    profile_dict: Dict[str, Any],
    timeout: float = 15.0,
    banner_timeout: float = 30.0,
    auth_timeout: float = 30.0,
    on_event: Optional[Any] = None
) -> Tuple[bool, Optional[Any], Optional[str], str]:
    """
    Attempts to establish an SSH connection with a fresh socket and Transport
    using the specified profile algorithms.
    Returns: (success, transport, error_classification, stage_failed)
    """
    import paramiko
    sock = None
    transport = None
    stage = "tcp_connect"

    try:
        stage = "tcp_connect"
        _emit_event_safe(on_event, "tcp_connect", "TCP Connection Initiated", f"Opening TCP stream to {hostname}:{port} [{profile_dict['name']}]", "info")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((hostname, port))
        _emit_event_safe(on_event, "tcp_established", "TCP Connection Established", f"TCP connection established with {hostname}:{port}", "success")

        stage = "kex_negotiation"
        _emit_event_safe(on_event, "ssh_negotiation", "SSH Negotiation Started", f"Configuring Transport with {profile_dict['name']}", "info")
        transport = paramiko.Transport(sock)

        # Set algorithms explicitly on the Transport instance BEFORE calling start_client()
        _apply_profile_to_transport(transport, profile_dict)

        transport.start_client(timeout=banner_timeout)
        _emit_event_safe(on_event, "key_exchange", "Key Exchange Negotiation", f"KEX agreed on {profile_dict['name']}", "info")

        stage = "authentication"
        _emit_event_safe(on_event, "authentication", "Authentication Attempt", f"Authenticating user '{username}'", "info")
        auth_ok, auth_err = _authenticate_transport_robust(transport, username=username, password=password, auth_timeout=auth_timeout)

        if auth_ok:
            _emit_event_safe(on_event, "authentication_success", "Authentication Successful", f"User '{username}' authenticated successfully", "success")
            return True, transport, None, "success"
        else:
            return False, transport, f"kex ok but auth failed: {auth_err or 'credentials rejected'}", "authentication"

    except Exception as exc:
        err_str = str(exc).strip()
        if stage == "tcp_connect":
            if "timed out" in err_str.lower() or "timeout" in err_str.lower():
                classified = f"connection timeout on {hostname}:{port} (socket timeout {timeout}s)"
            elif "refused" in err_str.lower():
                classified = f"connection refused on {hostname}:{port}"
            else:
                classified = f"TCP network error: {err_str}"
        elif stage == "kex_negotiation":
            if "incompatible" in err_str.lower() or "no acceptable" in err_str.lower() or "kex" in err_str.lower() or "cipher" in err_str.lower():
                classified = f"kex/cipher negotiation failed: {err_str}"
            elif "timed out" in err_str.lower() or "timeout" in err_str.lower():
                classified = f"kex handshake timed out after {banner_timeout}s"
            elif any(w in err_str.lower() for w in ["closed", "reset", "eof"]):
                classified = f"peer closed connection during negotiation: {err_str}"
            else:
                classified = f"SSH negotiation error: {err_str}"
        elif stage == "authentication":
            classified = f"kex ok but auth failed: {err_str}"
        else:
            classified = err_str

        # Cleanup failed transport and socket
        if transport:
            try:
                transport.close()
            except Exception:
                pass
        if sock:
            try:
                sock.close()
            except Exception:
                pass

        return False, None, classified, stage


def connect_cisco_2960_ssh(
    client: Any,
    hostname: str,
    port: int = 22,
    username: str = "",
    password: str = "",
    timeout: float = 15.0,
    banner_timeout: float = 30.0,
    auth_timeout: float = 30.0,
    on_fallback_log: Optional[Any] = None,
    on_event: Optional[Any] = None
) -> Tuple[bool, Optional[str]]:
    """
    Dedicated entry point for Cisco Catalyst 2960, 3560, and legacy IOS devices.
    Delegates directly to the unified multi-profile fallback engine with Cisco platform tag.
    """
    return connect_ssh_device(
        client=client,
        hostname=hostname,
        port=port,
        username=username,
        password=password,
        timeout=timeout,
        banner_timeout=banner_timeout,
        auth_timeout=auth_timeout,
        on_fallback_log=on_fallback_log,
        platform="cisco_ios",
        on_event=on_event
    )


def connect_ssh_device(
    client: Any,
    hostname: str,
    port: int = 22,
    username: str = "",
    password: str = "",
    timeout: float = 15.0,
    banner_timeout: float = 30.0,
    auth_timeout: float = 30.0,
    on_fallback_log: Optional[Any] = None,
    platform: str = "",
    on_event: Optional[Any] = None,
    selected_profile: Optional[str] = None
) -> Tuple[bool, Optional[str]]:
    """
    Universal SSH connection engine used across device introduction, interface status sync,
    and terminal console.
    
    Implements an automatic fallback chain of profiles, tried in order until one succeeds,
    each with a fresh socket + Transport:
      a) Profile 1: Modern defaults
      b) Profile 2: Modern + group14-sha1 + CBC ciphers + ssh-rsa
      c) Profile 3: Full legacy Cisco (group1-sha1, group-exchange-sha1, all CBC, 3des-cbc, hmac-sha1, ssh-rsa)
    
    Remembers successful profile per device host in cache for instant subsequent connections.
    Distinguishes clearly between connection timeout, kex/cipher failure, and authentication failure.
    """
    ensure_paramiko_compatibility()

    plat_lower = str(platform or "").lower()

    # Route MikroTik RouterOS to dedicated ROSSSH engine if platform matches and not explicitly forcing a non-mikrotik profile
    if ("mikrotik" in plat_lower or "routeros" in plat_lower) and selected_profile not in ["profile_1", "profile_2", "profile_3"]:
        return connect_mikrotik_ssh(
            client,
            hostname=hostname,
            port=port,
            username=username,
            password=password,
            timeout=timeout,
            banner_timeout=banner_timeout,
            auth_timeout=auth_timeout,
            on_fallback_log=on_fallback_log
        )

    # Determine order of profiles to attempt:
    # If selected_profile is explicitly specified (e.g. 'profile_1', 'profile_2', 'profile_3'), prioritize or restrict to it!
    if selected_profile and selected_profile in PROFILES_CONFIG:
        ordered_keys = [selected_profile]
        logger.info(f"[SSH Profile Chain] Using user-selected profile '{selected_profile}' for {hostname}:{port}")
    else:
        ordered_keys = list(_PROFILE_ORDER)
        cached_profile = _HOST_PROFILE_CACHE.get(hostname)
        if cached_profile and cached_profile in ordered_keys:
            ordered_keys.remove(cached_profile)
            ordered_keys.insert(0, cached_profile)
            logger.info(f"[SSH Profile Chain] Using cached profile '{cached_profile}' for {hostname}:{port}")

    per_profile_errors: List[str] = []

    for profile_key in ordered_keys:
        profile_dict = PROFILES_CONFIG[profile_key]
        if on_fallback_log and callable(on_fallback_log):
            try:
                on_fallback_log(f"Attempting {profile_dict['name']} on {hostname}:{port}...")
            except Exception:
                pass

        logger.info(f"[SSH Profile Chain] Trying {profile_dict['name']} on {hostname}:{port} (timeout={timeout}s, banner_timeout={banner_timeout}s)")
        
        ok, transport, err_classified, stage_failed = _attempt_ssh_profile(
            hostname=hostname,
            port=port,
            username=username,
            password=password,
            profile_dict=profile_dict,
            timeout=timeout,
            banner_timeout=banner_timeout,
            auth_timeout=auth_timeout,
            on_event=on_event
        )

        if ok and transport:
            # Profile succeeded! Cache it for this host so next time it goes straight to it
            _HOST_PROFILE_CACHE[hostname] = profile_key
            logger.info(f"[SSH Profile Chain] SUCCESS on {hostname}:{port} with {profile_dict['name']}. Cached profile for future sessions.")
            client._transport = transport
            client._negotiation_info = extract_negotiation_info(transport, profile_dict["tier"])
            return True, None

        # Record genuine per-profile error
        err_msg = f"{profile_dict['name']}: {err_classified}"
        per_profile_errors.append(err_msg)
        logger.debug(f"[SSH Profile Chain] {err_msg}")

        # If TCP connection failed (host unreachable, port closed, timeout), don't retry other profiles
        if stage_failed == "tcp_connect":
            logger.warning(f"[SSH Profile Chain] TCP connection failed to {hostname}:{port} ({err_classified}). Aborting fallback chain.")
            return False, f"TCP connection failed to {hostname}:{port}: {err_classified}"

    # All profiles failed - return detailed per-profile error report
    all_err_summary = "; ".join(per_profile_errors)
    logger.error(f"[SSH Profile Chain] All profiles failed on {hostname}:{port}: {all_err_summary}")
    return False, all_err_summary


def open_adaptive_shell_channel(
    hostname: str,
    port: int = 22,
    username: str = "",
    password: str = "",
    cols: int = 200,
    rows: int = 50,
    term_name: str = "vt100",
    timeout: float = 15.0,
    on_status_msg: Optional[Any] = None,
    platform: str = "",
    on_event: Optional[Any] = None,
    selected_profile: Optional[str] = None
) -> Tuple[Optional[Any], Optional[Any], Optional[Any], Dict[str, Any], Optional[str]]:
    """
    Opens an interactive shell channel using the unified multi-profile SSH engine:
    Profile 1: Modern Fast Path (no legacy overhead)
    Profile 2: Intermediate (modern + group14-sha1 + CBC + ssh-rsa)
    Profile 3: Full Legacy Cisco (group14, group-exchange, group1, CBC, 3DES, HMAC-SHA1, ssh-rsa)
    MikroTik: Dedicated ROSSSH compatibility engine (RFC 8332 workaround)
    
    Allocates PTY vt100 (200x50), invokes interactive shell, and sends 'terminal length 0'
    so long outputs are not paged.
    
    Returns:
    (channel, transport, client, negotiation_info, error_message)
    """
    ensure_paramiko_compatibility()
    import paramiko

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    def fallback_cb(msg: str):
        if on_status_msg and callable(on_status_msg):
            on_status_msg(
                f"\r\n\x1b[33m[SSH Profile Chain]\x1b[0m {msg}\r\n"
            )

    connected, err = connect_ssh_device(
        client,
        hostname=hostname,
        port=port,
        username=username,
        password=password,
        timeout=timeout,
        banner_timeout=30.0,
        auth_timeout=30.0,
        on_fallback_log=fallback_cb,
        platform=platform,
        on_event=on_event,
        selected_profile=selected_profile
    )

    if not connected or not getattr(client, '_transport', None):
        return None, None, None, {}, err or "Connection failed"

    transport = client._transport
    info = getattr(client, '_negotiation_info', {})

    try:
        _emit_event_safe(on_event, "channel_creation", "Channel Creation", "Requesting interactive session channel from device", "info")
        channel = transport.open_session(timeout=timeout)
        effective_term = term_name or "vt100"
        channel.get_pty(term=effective_term, width=cols or 200, height=rows or 50)
        channel.invoke_shell()
        channel.settimeout(0.0)  # Non-blocking for async select / reader loops
        _emit_event_safe(
            on_event,
            "shell_creation",
            "Interactive Shell Created",
            f"Allocated PTY {effective_term} ({cols or 200}x{rows or 50}) and invoked interactive shell",
            "success",
            {"term": effective_term, "cols": cols or 200, "rows": rows or 50}
        )

        # After connecting, send "terminal length 0" so long outputs are not paged
        try:
            time.sleep(0.08)
            channel.send("terminal length 0\r\n")
        except Exception as e_cmd:
            logger.debug(f"[Shell] Initial 'terminal length 0' notice: {e_cmd}")

        return channel, transport, client, info, None
    except Exception as e:
        _emit_event_safe(on_event, "exception", "Shell Channel Exception", f"Failed to open interactive shell channel: {e}", "error")
        try:
            transport.close()
        except Exception:
            pass
        return None, None, None, info, f"Failed to open interactive shell channel: {e}"

