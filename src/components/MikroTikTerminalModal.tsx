import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  X,
  Send,
  HelpCircle,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Search,
  Maximize2,
  Minimize2,
  Minus,
  Trash2,
  Layers,
  Server,
  Play,
  Palette,
  Type,
  History as HistoryIcon,
  Clock,
  Cpu,
  Sparkles,
  Columns,
  ArrowLeftRight,
  RefreshCw,
  Lock,
  Unlock,
  Cable,
} from 'lucide-react';
import { Device, SwitchPort } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchDevicePorts, syncDevicePorts, sshConnect, sshExecute, sshDisconnect, getTerminalWebSocketUrl } from '../services/api';
import { CompactTerminalFaceplate } from './terminal/CompactTerminalFaceplate';
import { WinBoxLauncherModal } from './terminal/WinBoxLauncherModal';

export interface MikroTikTerminalModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onDeviceUpdated?: () => void;
  isLightMode?: boolean;
  isEmbedded?: boolean;
  onSplitScreen?: () => void;
  onSwap?: () => void;
  paneIndex?: number;
  totalPanes?: number;
  onMovePane?: (fromIndex: number, toIndex: number) => void;
  onClosePane?: () => void;
  onChangeDevice?: () => void;
  allDevices?: Device[];
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'error' | 'success';
  text: string;
}

const TERMINAL_BG_OPTIONS_DARK = [
  { id: 'slate', color: '#09131f', nameEn: 'RouterOS Slate', nameFa: 'سرمه‌ای روتر او اس' },
  { id: 'black', color: '#000000', nameEn: 'Pitch Black', nameFa: 'مشکی خالص (OLED)' },
  { id: 'navy', color: '#081026', nameEn: 'Midnight Navy', nameFa: 'سرمه‌ای اقیانوسی' },
  { id: 'teal', color: '#042f2e', nameEn: 'MikroTik Teal', nameFa: 'آبی‌نفتی میکروتیک' },
  { id: 'matrix', color: '#022c22', nameEn: 'Matrix Green', nameFa: 'سبز ماتریکس' },
  { id: 'charcoal', color: '#18181b', nameEn: 'Zinc Charcoal', nameFa: 'زغالی' },
];

const TERMINAL_BG_OPTIONS_LIGHT = [
  { id: 'winbox-silver', color: '#f1f5f9', nameEn: 'WinBox Silver', nameFa: 'نقره‌ای وین‌باکس' },
  { id: 'paper-white', color: '#ffffff', nameEn: 'Paper White', nameFa: 'سفید خالص' },
  { id: 'soft-sand', color: '#fafaf9', nameEn: 'Soft Sand', nameFa: 'کرمی ملایم' },
  { id: 'light-cyan', color: '#ecfeff', nameEn: 'MikroTik Light', nameFa: 'آبی فیروزه‌ای روشن' },
  { id: 'slate-dark', color: '#09131f', nameEn: 'RouterOS Slate (Dark)', nameFa: 'تیره روتر او اس' },
  { id: 'charcoal-dark', color: '#18181b', nameEn: 'Zinc Charcoal (Dark)', nameFa: 'زغالی تیره' },
];

export const MikroTikTerminalModal: React.FC<MikroTikTerminalModalProps> = ({
  device,
  isOpen,
  onClose,
  onMinimize,
  onDeviceUpdated,
  isLightMode = false,
  isEmbedded = false,
  onSplitScreen,
  onSwap,
  paneIndex,
  totalPanes,
  onMovePane,
  onClosePane,
  onChangeDevice,
  allDevices,
}) => {
  const { t, isEn } = useLanguage();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [bgChoice, setBgChoice] = useState(isLightMode ? 'winbox-silver' : 'slate');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [ports, setPorts] = useState<SwitchPort[]>([]);
  const [isWinBoxModalOpen, setIsWinBoxModalOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState<SwitchPort | null>(null);
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'guide' | 'interfaces'>('guide');
  const [interfaceSearch, setInterfaceSearch] = useState('');
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const appearanceMenuRef = useRef<HTMLDivElement>(null);
  const lastClickedPortRef = useRef<SwitchPort | null>(null);
  const lastInsertedPortTextRef = useRef<string | null>(null);

  // Real SSH / Telnet Session State
  const [sshSessionMode, setSshSessionMode] = useState<'connecting' | 'real_ssh' | 'simulated' | 'failed'>('connecting');
  const [sshLatency, setSshLatency] = useState<number | null>(null);
  const [isSyncingPorts, setIsSyncingPorts] = useState<boolean>(false);
  const lastSyncTimeRef = useRef<number>(0);
  const pingIntervalRef = useRef<any>(null);
  const deviceRef = useRef<Device | null>(device);
  deviceRef.current = device;
  const activeSessionIdRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [preventBackdropClose, setPreventBackdropClose] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nettop_terminal_lock_backdrop') === 'true';
    } catch {
      return false;
    }
  });

  const togglePreventBackdropClose = () => {
    setPreventBackdropClose((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nettop_terminal_lock_backdrop', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!device || !isOpen) return;
    setSelectedPort(null);
    setSelectedPortIds([]);
    lastClickedPortRef.current = null;
    fetchDevicePorts(device.id)
      .then((res) => {
        if (res && res.ports) {
          const rawPorts = res.ports || [];
          const normalizedPorts = rawPorts.map((p: any, idx: number) => ({
            ...p,
            port_id: p.port_id || p.port || p.name || `port-${idx + 1}`,
          }));
          setPorts(normalizedPorts);
        }
      })
      .catch((err) => console.warn('Failed to fetch ports for MikroTik terminal', err));
  }, [device?.id, isOpen]);

  const filteredPorts = React.useMemo(() => {
    if (!interfaceSearch.trim()) return ports;
    const q = interfaceSearch.toLowerCase();
    return ports.filter(
      (p) =>
        p.port_id.toLowerCase().includes(q) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.connected_device && p.connected_device.toLowerCase().includes(q)) ||
        String(p.vlan).includes(q) ||
        p.mode.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
    );
  }, [ports, interfaceSearch]);

  // Close appearance menu on click outside
  useEffect(() => {
    if (!showAppearanceMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (appearanceMenuRef.current && !appearanceMenuRef.current.contains(e.target as Node)) {
        setShowAppearanceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAppearanceMenu]);

  // Handle MikroTik port click with intelligent insertion and Ctrl+Click range support
  const handlePortClick = (port: SwitchPort, e: React.MouseEvent) => {
    const isRangeAction = (e.ctrlKey || e.metaKey || e.shiftKey) && lastClickedPortRef.current !== null;
    let newSelectedIds: string[] = [];
    let isRange = false;
    let rangeStr = '';

    const pId = port.port_id || (port as any).port || port.name;
    if (!pId) return;

    if (isRangeAction && lastClickedPortRef.current) {
      const lastId = lastClickedPortRef.current?.port_id || (lastClickedPortRef.current as any)?.port || lastClickedPortRef.current?.name;
      const idxA = ports.findIndex((p) => (p.port_id || (p as any).port || p.name) === lastId);
      const idxB = ports.findIndex((p) => (p.port_id || (p as any).port || p.name) === pId);
      if (idxA !== -1 && idxB !== -1) {
        const minIdx = Math.min(idxA, idxB);
        const maxIdx = Math.max(idxA, idxB);
        const rangePorts = ports.slice(minIdx, maxIdx + 1);
        newSelectedIds = rangePorts.map((p) => p.port_id || (p as any).port || p.name).filter(Boolean);
        isRange = true;
        rangeStr = newSelectedIds.join(',');
      } else {
        newSelectedIds = [pId];
        lastClickedPortRef.current = port;
      }
    } else {
      newSelectedIds = [pId];
      lastClickedPortRef.current = port;
    }

    setSelectedPort(port);
    setSelectedPortIds(newSelectedIds);

    const targetText = isRange ? rangeStr : pId;

    setInput((prevInput) => {
      // 1. If empty or whitespace only
      if (!prevInput.trim()) {
        lastInsertedPortTextRef.current = targetText;
        if (isRange) {
          return `/interface print where name in (${newSelectedIds.map((id) => `"${id}"`).join(',')})`;
        }
        return `/interface print where name="${port.port_id}"`;
      }

      // 2. If prevInput contains the previously inserted port/range token
      const lastInserted = lastInsertedPortTextRef.current;
      if (lastInserted && prevInput.includes(lastInserted)) {
        lastInsertedPortTextRef.current = targetText;
        return prevInput.replace(lastInserted, targetText);
      }

      // 3. If prevInput contains any known port ID from current device
      for (const p of ports) {
        if (prevInput.includes(p.port_id)) {
          lastInsertedPortTextRef.current = targetText;
          return prevInput.replace(p.port_id, targetText);
        }
      }

      // 4. Regex for interface tokens like ether1, sfp-sfpplus1
      const mtkRegex = /\b(?:ether\d+|sfp(?:-sfpplus)?\d+)\b/i;
      const match = prevInput.match(mtkRegex);
      if (match) {
        lastInsertedPortTextRef.current = targetText;
        return prevInput.replace(match[0], targetText);
      }

      // 5. Append target port/range to user's existing typed command without clearing
      lastInsertedPortTextRef.current = targetText;
      const needsSpace = prevInput.length > 0 && !prevInput.endsWith(' ');
      return `${prevInput}${needsSpace ? ' ' : ''}${targetText}`;
    });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const bgOptions = isLightMode ? TERMINAL_BG_OPTIONS_LIGHT : TERMINAL_BG_OPTIONS_DARK;
  const currentBgOpt = bgOptions.find((b) => b.id === bgChoice) || bgOptions[0];
  const currentBg = currentBgOpt.color;

  // Check if current terminal screen background is light
  const isScreenLight = ['#ffffff', '#f1f5f9', '#fafaf9', '#ecfeff'].includes(currentBg.toLowerCase());

  // Dynamic text colors based on screen luminance
  const screenTextColor = isScreenLight ? '#0f172a' : '#22d3ee';
  const screenSystemColor = isScreenLight ? 'text-sky-700' : 'text-cyan-400';
  const screenInputColor = isScreenLight ? 'text-emerald-700' : 'text-emerald-400';
  const screenPromptColor = isScreenLight ? 'text-sky-700 font-bold' : 'text-emerald-400 font-bold';
  const screenOutputColor = isScreenLight ? 'text-slate-800' : 'opacity-95';
  const screenErrorColor = isScreenLight ? 'text-rose-600' : 'text-rose-400';

  const identity = device?.name || 'MikroTik';
  const prompt = `[admin@${identity}] > `;

  const connProtocol = (device?.connection_protocol || device?.connection?.protocol || 'ssh').toLowerCase() as 'ssh' | 'telnet';
  const targetHost = (
    device?.ssh_host ||
    device?.ip ||
    (device?.connection as any)?.host ||
    (device?.connection as any)?.ip ||
    ''
  ).trim();
  const targetPort = Number(device?.ssh_port || (device?.connection as any)?.port || (connProtocol === 'telnet' ? 23 : 22));
  const sshUser = (device?.ssh_username || (device?.connection as any)?.username || 'admin').trim();

  const lastLineEndedWithNewlineRef = useRef<boolean>(true);

  // Helper to append streaming raw text from SSH terminal, preserving line continuity across chunk boundaries
  const appendStreamText = (rawChunk: string) => {
    if (!rawChunk) return;
    const cleanText = rawChunk.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Strip ANSI escape sequences (colors, cursor positioning, VT100 control codes)
    const textWithoutAnsi = cleanText.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    if (!textWithoutAnsi) return;

    const segments = textWithoutAnsi.split('\n');
    const endsWithNewline = textWithoutAnsi.endsWith('\n');

    setLines((prev) => {
      const updated = [...prev];
      let startIdx = 0;

      // If the previous chunk did not finish with a newline and there is an existing output line,
      // append the first segment to that line instead of splitting onto a new line
      if (!lastLineEndedWithNewlineRef.current && updated.length > 0) {
        const lastIndex = updated.length - 1;
        const lastLine = updated[lastIndex];
        if (lastLine && lastLine.type === 'output') {
          updated[lastIndex] = {
            ...lastLine,
            text: lastLine.text + segments[0],
          };
          startIdx = 1;
        }
      }

      for (let i = startIdx; i < segments.length; i++) {
        // If the chunk ended with a newline, the last split element is an empty string; don't add an extra blank line
        if (i === segments.length - 1 && segments[i] === '' && endsWithNewline) {
          continue;
        }
        updated.push({
          id: 'ws-out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          type: 'output',
          text: segments[i],
        });
      }

      lastLineEndedWithNewlineRef.current = endsWithNewline;
      return updated;
    });
  };

  // Unified port synchronization over the active SSH tunnel for MikroTik
  const handleSyncPorts = async (silent: boolean = false) => {
    const curDev = deviceRef.current;
    if (!curDev) return;
    const now = Date.now();
    if (now - lastSyncTimeRef.current < 2500 || isSyncingPorts) {
      return;
    }
    lastSyncTimeRef.current = now;
    setIsSyncingPorts(true);

    if (!silent) {
      setLines((prev) => [
        ...prev,
        {
          id: 'sync-req-' + Date.now(),
          type: 'system',
          text: isEn
            ? `[TUNNEL QUERY] Querying MikroTik interface list via active SSH tunnel (/interface print)...`
            : `[استعلام تانل] دریافت و بررسی زنده اینترفیس‌های میکروتیک از طریق تانل فعال SSH (/interface print)...`,
        },
      ]);
    }

    try {
      const res = await syncDevicePorts(curDev.id);
      if (res && res.ports && res.ports.length > 0) {
        const rawPorts = res.ports || [];
        const normalizedPorts = rawPorts.map((p: any, idx: number) => ({
          ...p,
          port_id: p.port_id || p.port || p.name || `port-${idx + 1}`,
        }));
        setPorts(normalizedPorts);
        const upCount = normalizedPorts.filter((p) => p.status === 'up').length;
        const downCount = normalizedPorts.filter((p) => p.status !== 'up').length;
        if (!silent) {
          setLines((prev) => [
            ...prev,
            {
              id: 'sync-ok-' + Date.now(),
              type: 'system',
              text: isEn
                ? `[SYNC SUCCESS] Verified ${normalizedPorts.length} interfaces via ${res.sync_source || 'SSH tunnel'}: ${upCount} UP, ${downCount} DOWN.`
                : `[پایان بررسی] وضعیت ${normalizedPorts.length} پورت از طریق ${res.sync_source || 'تانل SSH'} تایید شد (${upCount} متصل، ${downCount} قطع).`,
            },
          ]);
        }
        if (onDeviceUpdated) {
          onDeviceUpdated();
        }
      }
    } catch (err: any) {
      if (!silent) {
        setLines((prev) => [
          ...prev,
          {
            id: 'sync-err-' + Date.now(),
            type: 'error',
            text: `[SYNC NOTICE] Could not query live ports: ${err.message || 'Tunnel busy'}`,
          },
        ]);
      }
    } finally {
      setIsSyncingPorts(false);
    }
  };

  // Initialize terminal session (Persistent Real SSH / Telnet WebSocket)
  useEffect(() => {
    if (!device || !isOpen) return;

    const curDev = device;
    setSshSessionMode('connecting');
    setSshLatency(null);

    const banner: TerminalLine[] = [
      {
        id: '1',
        type: 'system',
        text: `  MMM      MMM       KKK                          TTTTTTTTTTT kkk\n  MMMM    MMMM       KKK                              TTT     kkk\n  MMM MMMM MMM  iii  KKK  kkk  rrr rrr    oooo   www  TTT     kkk  www\n  MMM  MM  MMM  iii  KKKKK     rrrr   r  oo  oo  www  TTT     kkk  www\n  MMM      MMM  iii  KKK kkk   rrr       oo  oo  www  TTT     kkk  www\n  MMM      MMM  iii  KKK  kkk  rrr        oooo    www TTT     kkk  www\n\n  MikroTik RouterOS 7.14 (c) 1999-2026       http://www.mikrotik.com/`
      },
      {
        id: '2',
        type: 'system',
        text: `Initiating persistent ${(connProtocol || 'ssh').toUpperCase()} connection to ${targetHost}:${targetPort} (${curDev.model || 'CCR2004'})...`
      }
    ];
    setLines(banner);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 150);

    let isSubscribed = true;

    // Connect to real hardware via interactive WebSocket streaming with keepalive
    try {
      const pass = curDev.ssh_password || (curDev.connection as any)?.password || '';
      const wsUrl = getTerminalWebSocketUrl(curDev.id, connProtocol, 'Super Admin', {
        ip: curDev.ip,
        ssh_host: curDev.ssh_host,
        ssh_port: curDev.ssh_port,
        ssh_username: curDev.ssh_username,
        ssh_password: pass,
        platform: curDev.platform || 'mikrotik_routeros',
      });
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            } catch {}
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'pong') {
            return;
          }
          if (msg.type === 'data' && msg.data) {
            appendStreamText(msg.data);
          } else if (msg.type === 'status') {
            if (msg.status === 'connected') {
              if (msg.is_real) {
                setSshSessionMode('real_ssh');
                setSshLatency(msg.latency_ms || 2.1);
                setLines((prev) => [
                  ...prev,
                  {
                    id: 'sys-mtk-live-' + Date.now(),
                    type: 'system',
                    text: isEn
                      ? `[REAL ${(connProtocol || 'ssh').toUpperCase()} ESTABLISHED] Connected to ${targetHost}:${targetPort} in ${msg.latency_ms || 2}ms.\nSession: Persistent WebSocket SSH Tunnel Active.`
                      : `[اتصال زنده ${(connProtocol || 'ssh').toUpperCase()} برقرار شد] اتصال به ${targetHost}:${targetPort} در ${msg.latency_ms || 2} میلی‌ثانیه برقرار شد.\nنشست: تانل پایدار سوکت فعال است.`,
                  },
                ]);
              } else {
                setSshSessionMode('simulated');
                setSshLatency(msg.latency_ms || 1.2);
                setLines((prev) => [
                  ...prev,
                  {
                    id: 'sys-mtk-sim-' + Date.now(),
                    type: 'system',
                    text: isEn
                      ? `[INTERACTIVE CLI READY] Connected to ${targetHost ? `${targetHost}:${targetPort} CLI Engine` : `${identity} Local Terminal Engine`}.\nSession: Interactive CLI Session Active.`
                      : `[ترمینال تعاملی آماده] اتصال به ${targetHost ? `موتور ${targetHost}:${targetPort}` : `موتور ترمینال محلی ${identity}`} برقرار شد.\nنشست: ترمینال تعاملی فعال است.`,
                  },
                ]);
              }
            } else if (msg.status === 'failed' || msg.status === 'disconnected') {
              setSshSessionMode('failed');
              setLines((prev) => [
                ...prev,
                {
                  id: 'ws-fail-' + Date.now(),
                  type: 'error',
                  text: `[CONNECTION STATUS] ${msg.message || (isEn ? 'Disconnected from device' : 'ارتباط با تجهیز قطع شد')}`,
                },
              ]);
            }
          } else if (msg.type === 'error') {
            setSshSessionMode('failed');
            setLines((prev) => [
              ...prev,
              {
                id: 'ws-err-' + Date.now(),
                type: 'error',
                text: `[TERMINAL ERROR] ${msg.error || (isEn ? 'Connection error' : 'خطای ارتباط')}`,
              },
            ]);
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        if (isSubscribed) {
          setSshSessionMode((prev) => (prev === 'real_ssh' ? 'failed' : prev));
        }
      };
    } catch {
      // ws not available
    }

    // Also connect to Python backend client
    sshConnect({
      host: targetHost,
      port: targetPort,
      username: sshUser,
      password: curDev.ssh_password || '',
      deviceId: curDev.id,
      protocol: connProtocol,
      timeout: 3500,
    }).then((res) => {
      if (!isSubscribed) return;
      if (res.sessionId || res.session_id) {
        activeSessionIdRef.current = res.sessionId || res.session_id || null;
      }
      if (res.success && res.isReal) {
        setSshSessionMode('real_ssh');
        setSshLatency(res.latency_ms || 2.5);
      }
    }).catch(() => {});

    return () => {
      isSubscribed = false;
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'close' }));
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      if (activeSessionIdRef.current) {
        sshDisconnect({
          sessionId: activeSessionIdRef.current,
          deviceId: curDev.id,
          host: targetHost,
          port: targetPort,
        }).catch(() => {});
        activeSessionIdRef.current = null;
      }
      fetch(`/api/devices/${curDev.id}/terminal`, { method: 'DELETE' }).catch(() => {});
    };
  }, [device?.id, isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  if (!isOpen || !device) return null;

  const handleSendCommand = async (cmdToRun?: string) => {
    const rawCmd = (cmdToRun !== undefined ? cmdToRun : input).trim();
    if (!rawCmd) return;

    const userLine: TerminalLine = {
      id: String(Date.now()),
      type: 'input',
      text: `${prompt}${rawCmd}`
    };

    setHistory((prev) => [rawCmd, ...prev.filter((c) => c !== rawCmd)].slice(0, 50));
    setHistoryIndex(-1);
    lastInsertedPortTextRef.current = null;

    // Clear command handled locally for terminal screen buffer
    const cmdLower = rawCmd.toLowerCase();
    if (cmdLower === 'clear' || cmdLower === '/clear') {
      setLines([]);
      setInput('');
      return;
    }

    const isSocketReady = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;

    // Direct hardware execution if connected to real device or simulator
    if (sshSessionMode !== 'real_ssh' && sshSessionMode !== 'simulated' && !isSocketReady) {
      const errorLine: TerminalLine = {
        id: String(Date.now() + 1),
        type: 'error',
        text: isEn
          ? `% Command rejected: Device is unreachable or terminal session is disconnected (${targetHost || 'unassigned'}:${targetPort}).`
          : `% دستور رد شد: ارتباط با روتر میکروتیک برقرار نیست یا نشست قطع است (${targetHost || 'بدون آی‌پی'}:${targetPort}).`,
      };
      setLines((prev) => [...prev, userLine, errorLine]);
      setInput('');
      return;
    }

    // Direct hardware execution on real MikroTik RouterOS
    if (isSocketReady && wsRef.current) {
      setLines((prev) => [...prev, userLine]);
      wsRef.current.send(JSON.stringify({ type: 'input', data: rawCmd + '\r\n' }));
      if (
        cmdLower.includes('interface') ||
        cmdLower.includes('/export') ||
        cmdLower.includes('ip address')
      ) {
        setTimeout(() => handleSyncPorts(true), 1200);
      }
      setInput('');
      return;
    }

    try {
      const res = await sshExecute({
        host: targetHost,
        port: targetPort,
        username: sshUser,
        password: device.ssh_password || '',
        command: rawCmd,
        sessionId: activeSessionIdRef.current || undefined,
      });

      if (res.success && res.output !== undefined) {
        const outputLine: TerminalLine = {
          id: String(Date.now() + 1),
          type: 'output',
          text: res.output || '(Command executed on MikroTik RouterOS)',
        };
        setLines((prev) => [...prev, userLine, outputLine]);
      } else {
        const errorLine: TerminalLine = {
          id: String(Date.now() + 1),
          type: 'error',
          text: `% Error executing command on MikroTik: ${res.error || 'Execution failed'}`,
        };
        setLines((prev) => [...prev, userLine, errorLine]);
      }
      setInput('');
      return;
    } catch (err: any) {
      const errorLine: TerminalLine = {
        id: String(Date.now() + 1),
        type: 'error',
        text: `% Hardware connection error: ${err.message}`,
      };
      setLines((prev) => [...prev, userLine, errorLine]);
      setInput('');
      return;
    }
  };

  const modalContent = (
    <div
      className={`relative w-full ${
        isEmbedded
          ? 'h-full rounded-xl border-cyan-500/30'
          : isFullScreen
          ? 'h-full max-h-full max-w-none rounded-none border-none'
          : 'max-w-5xl h-[85vh] rounded-2xl'
      } border flex flex-col overflow-hidden transition-all ${
        isLightMode
          ? 'bg-slate-100 border-cyan-500/40 shadow-2xl shadow-slate-500/20 text-slate-800'
          : 'bg-slate-950 border-cyan-500/40 shadow-2xl shadow-cyan-950/60 text-slate-100'
      }`}
    >
        {/* Terminal Window Titlebar */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-b select-none ${
            isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-2">
              <TerminalIcon className={`w-4 h-4 ${isLightMode ? 'text-cyan-600' : 'text-cyan-400'}`} />
              <span className={`text-xs font-mono font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                MikroTik RouterOS CLI — {device.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {targetHost}:{targetPort}
              </span>
              {sshSessionMode === 'real_ssh' ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE {(connProtocol || 'ssh').toUpperCase()} ({sshLatency ? `${sshLatency}ms` : 'Active'})
                </span>
              ) : sshSessionMode === 'connecting' ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Connecting {(connProtocol || 'ssh').toUpperCase()}...
                </span>
              ) : (
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs"
                  title="Device unreachable / Disconnected"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  DISCONNECTED
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Terminal Appearance Menu Popover (Button-based to prevent clutter) */}
            <div className="relative" ref={appearanceMenuRef}>
              <button
                type="button"
                onClick={() => setShowAppearanceMenu(!showAppearanceMenu)}
                className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showAppearanceMenu
                    ? isLightMode
                      ? 'bg-cyan-100 text-cyan-800 border-cyan-400 shadow-xs'
                      : 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                    : isLightMode
                    ? 'bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-950/90 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-900'
                }`}
                title={isEn ? "Terminal Theme & Colors" : "تنظیم تم و رنگ کنسول میکروتیک"}
              >
                <Palette className="w-3.5 h-3.5 text-cyan-500" />
                <span className="hidden sm:inline font-medium text-[11px]">{isEn ? 'Appearance' : 'رنگ و تم'}</span>
                <span
                  className="w-3 h-3 rounded-full border border-black/20 dark:border-white/40 inline-block shrink-0 shadow-xs"
                  style={{ backgroundColor: currentBg }}
                />
              </button>

              {showAppearanceMenu && (
                <div
                  className={`absolute top-full mt-1.5 right-0 z-50 w-72 p-3 rounded-xl backdrop-blur-md border shadow-2xl animate-in fade-in zoom-in-95 ${
                    isLightMode
                      ? 'bg-white/95 border-slate-200 text-slate-800'
                      : 'bg-slate-900/95 border-slate-700 text-slate-200'
                  }`}
                  dir={isEn ? 'ltr' : 'rtl'}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-cyan-500" />
                      {isEn ? 'RouterOS Terminal Theme' : 'تنظیمات پس‌زمینه و تم روتر او اس'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAppearanceMenu(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium mb-2">
                      <span>{isEn ? 'Color Scheme:' : 'طرح رنگ ترمینال:'}</span>
                      <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
                        {isEn ? currentBgOpt.nameEn : currentBgOpt.nameFa}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {bgOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBgChoice(opt.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                            bgChoice === opt.id
                              ? 'border-cyan-500 ring-2 ring-cyan-500/40 font-semibold ' +
                                (isLightMode ? 'bg-cyan-50 text-cyan-900' : 'bg-slate-800 text-white')
                              : isLightMode
                              ? 'border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-600 hover:text-slate-900'
                              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span className="truncate">{isEn ? opt.nameEn : opt.nameFa}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Split Screen Button (Request 6) */}
            {onSplitScreen && (
              <button
                type="button"
                onClick={onSplitScreen}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-300 hover:bg-cyan-100'
                    : 'bg-cyan-950/60 text-cyan-300 border-cyan-600/50 hover:bg-cyan-900/60'
                }`}
                title={isEn ? 'Split Screen / Multi-Terminal' : 'تقسیم صفحه به چند ترمینال همزمان'}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">{isEn ? 'Split' : 'تقسیم'}</span>
              </button>
            )}

            {/* Swap Button (Request 6) */}
            {totalPanes !== undefined && totalPanes > 1 && onSwap && (
              <button
                type="button"
                onClick={onSwap}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                    : 'bg-amber-950/60 text-amber-300 border-amber-600/50 hover:bg-amber-900/60'
                }`}
                title={isEn ? 'Swap Panes Left/Right' : 'جابجایی چپ و راست'}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">{isEn ? 'Swap' : 'جابجایی'}</span>
              </button>
            )}

            {/* Change Device Button (embedded mode) */}
            {isEmbedded && onChangeDevice && (
              <button
                type="button"
                onClick={onChangeDevice}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
                title={isEn ? 'Change Device in this pane' : 'تغییر دیوایس این پنجره'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                showGuide
                  ? isLightMode
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-300 shadow-xs'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                  : isLightMode
                  ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle Command Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Direct WinBox Application Launcher Button */}
            <button
              type="button"
              id="mikrotik-modal-winbox-btn"
              onClick={() => {
                const targetHost = (device?.ssh_host || device?.ip || '').trim();
                const username = (device?.ssh_username || 'admin').trim();
                const password = device?.ssh_password || '';
                const winboxPort = (device as any)?.winbox_port || 8291;
                if (targetHost) {
                  const uri = password
                    ? `winbox://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${targetHost}:${winboxPort}`
                    : `winbox://${encodeURIComponent(username)}@${targetHost}:${winboxPort}`;
                  try {
                    const a = document.createElement('a');
                    a.href = uri;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      if (document.body.contains(a)) document.body.removeChild(a);
                    }, 300);
                  } catch (e) {
                    console.warn('WinBox launch error:', e);
                  }
                }
                setIsWinBoxModalOpen(true);
              }}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isLightMode
                  ? 'bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white border-sky-300 hover:border-sky-500 shadow-xs'
                  : 'bg-sky-950/80 hover:bg-sky-600 text-sky-200 hover:text-white border-sky-600/50 hover:border-sky-400 shadow-xs'
              } active:scale-95`}
              title={
                isEn
                  ? `Launch WinBox on your PC for ${device?.name || device?.ip || 'MikroTik'}`
                  : `اجرای نرم‌افزار WinBox نصب شده روی سیستم شما برای ${device?.name || device?.ip || 'میکروتیک'}`
              }
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="4" fill="#0284c7" />
                <path d="M6 7h3l2 7 2-5 2 5 2-7h3l-3.5 11h-2.5l-2-5-2 5H9L6 7z" fill="white" />
              </svg>
              <span className="text-[11px] font-bold font-mono hidden sm:inline">WinBox</span>
            </button>

            {!isEmbedded && (
              <button
                type="button"
                onClick={togglePreventBackdropClose}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  preventBackdropClose
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                    : isLightMode
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
                title={
                  preventBackdropClose
                    ? (isEn ? 'Terminal Locked: Clicking outside will NOT close it (Click to unlock)' : 'ترمینال قفل است: کلیک بیرون پنجره آن را نمی‌بندد (جهت باز کردن کلیک کنید)')
                    : (isEn ? 'Lock Terminal: Prevent closing when clicking outside' : 'قفل ترمینال: جلوگیری از بسته شدن با کلیک بیرون پنجره')
                }
              >
                {preventBackdropClose ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
              </button>
            )}

            {!isEmbedded && (
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            {!isEmbedded && onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 text-slate-600 hover:text-cyan-600 border-slate-200 hover:bg-cyan-50 hover:border-cyan-300'
                    : 'bg-slate-800 text-slate-400 hover:text-cyan-300 border-slate-700 hover:border-cyan-500/50'
                }`}
                title={isEn ? 'Minimize to bottom dock' : 'مینیمایز به نوار پایین'}
                aria-label={isEn ? 'Minimize' : 'مینیمایز'}
              >
                <Minus className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                if (isEmbedded && onClosePane) {
                  onClosePane();
                } else {
                  onClose();
                }
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-slate-100 text-slate-600 hover:text-rose-600 border-slate-200 hover:bg-rose-50 hover:border-rose-300'
                  : 'bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-700 hover:border-rose-500/50'
              }`}
              title={isEmbedded ? (isEn ? 'Close Pane' : 'بستن این پنجره') : (isEn ? 'Close Terminal' : 'بستن ترمینال')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Graphic Port Faceplate Box (Half-size ports - Request 5) */}
        {ports && ports.length > 0 && (
          <CompactTerminalFaceplate
            device={device}
            ports={ports}
            isMikroTik={true}
            isLightMode={isLightMode}
            onPortClick={handlePortClick}
            selectedPortId={selectedPort ? (selectedPort.port_id || (selectedPort as any).port || selectedPort.name) : undefined}
            selectedPortIds={selectedPortIds}
            onSyncPorts={() => handleSyncPorts(false)}
            isSyncing={isSyncingPorts}
          />
        )}

        {/* Body (Screen + Guide Sidebar) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Terminal Screen */}
          <div
            className="flex-1 flex flex-col p-4 overflow-y-auto font-mono text-xs leading-relaxed transition-colors"
            style={{ backgroundColor: currentBg, color: screenTextColor }}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex-1 space-y-1.5 overflow-y-auto">
              {lines.map((l) => (
                <div key={l.id} className="whitespace-pre-wrap">
                  {l.type === 'system' && (
                    <span className={`${screenSystemColor} font-semibold opacity-95`}>{l.text}</span>
                  )}
                  {l.type === 'input' && (
                    <span className={`${screenInputColor} font-bold`}>{l.text}</span>
                  )}
                  {l.type === 'output' && (
                    <span className={`${screenOutputColor}`}>{l.text}</span>
                  )}
                  {l.type === 'error' && (
                    <span className={`${screenErrorColor} font-bold`}>{l.text}</span>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Input Prompt Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCommand();
              }}
              className={`mt-3 flex items-center gap-2 border-t pt-2 shrink-0 ${
                isScreenLight ? 'border-slate-300/80' : 'border-slate-800/80'
              }`}
            >
              <span className={`shrink-0 select-none ${screenPromptColor}`}>
                {prompt}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (history.length > 0 && historyIndex < history.length - 1) {
                      const next = historyIndex + 1;
                      setHistoryIndex(next);
                      setInput(history[next]);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (historyIndex > 0) {
                      const prev = historyIndex - 1;
                      setHistoryIndex(prev);
                      setInput(history[prev]);
                    } else if (historyIndex === 0) {
                      setHistoryIndex(-1);
                      setInput('');
                    }
                  }
                }}
                className={`flex-1 bg-transparent border-none outline-none font-mono text-xs focus:ring-0 ${
                  isScreenLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
                }`}
                placeholder={
                  isEn
                    ? "Type a RouterOS command (e.g. '/interface print')..."
                    : "دستور روتر او اس را وارد کنید (مانند '/interface print')..."
                }
                autoFocus
              />
              <button
                type="submit"
                className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs ${
                  isLightMode
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>{isEn ? 'Send' : 'ارسال'}</span>
              </button>
            </form>
          </div>

          {/* RouterOS Command Guide / Interfaces Sidebar */}
          {showGuide && (
            <div
              className={`w-80 sm:w-88 border-l flex flex-col overflow-hidden text-xs select-none ${
                isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'
              }`}
            >
              <div
                className={`p-2.5 border-b space-y-2 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300/60 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSidebarTab('guide')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        sidebarTab === 'guide'
                          ? isLightMode
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'bg-cyan-500 text-black shadow-xs'
                          : isLightMode
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Command Guide' : 'راهنمای دستورات'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarTab('interfaces')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        sidebarTab === 'interfaces'
                          ? isLightMode
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'bg-cyan-500 text-black shadow-xs'
                          : isLightMode
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Cable className="w-3.5 h-3.5" />
                      <span>{isEn ? `Interfaces (${ports.length})` : `اینترفیس‌ها (${ports.length})`}</span>
                    </button>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isLightMode ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold' : 'text-cyan-400 font-bold'
                    }`}
                  >
                    RouterOS
                  </span>
                </div>

                {sidebarTab === 'interfaces' && (
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={isEn ? "Search interface, VLAN, device..." : "جستجوی پورت، ویلن، دستگاه..."}
                        value={interfaceSearch}
                        onChange={(e) => setInterfaceSearch(e.target.value)}
                        className={`w-full px-2.5 py-1.5 ${isEn ? 'pl-7 pr-2.5' : 'pr-7 pl-2.5'} rounded-lg text-[11px] outline-none transition ${
                          isLightMode
                            ? 'bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500'
                            : 'bg-slate-800 border border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-400'
                        }`}
                      />
                      <Search className={`w-3.5 h-3.5 text-slate-400 absolute ${isEn ? 'left-2' : 'right-2'} top-2`} />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSyncPorts(false)}
                      disabled={isSyncingPorts}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition shadow-xs cursor-pointer border shrink-0 ${
                        isSyncingPorts
                          ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40 cursor-wait'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 active:scale-95'
                      }`}
                      title={isEn ? 'Sync & verify live interfaces via SSH tunnel' : 'بررسی و همگام‌سازی زنده اینترفیس‌ها از طریق تانل SSH'}
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncingPorts ? 'animate-spin text-cyan-200' : ''}`} />
                      <span>{isSyncingPorts ? (isEn ? 'Syncing...' : 'بررسی...') : (isEn ? 'Sync SSH' : 'بررسی SSH')}</span>
                    </button>
                  </div>
                )}
              </div>

              {sidebarTab === 'guide' ? (
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Interface Section */}
                <div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${
                      isLightMode ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    <Server className={`w-3.5 h-3.5 ${isLightMode ? 'text-cyan-600' : 'text-cyan-400'}`} />
                    <span>Interfaces & Ethernet</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { cmd: '/interface print', desc: 'List all interfaces' },
                      { cmd: '/interface ethernet print', desc: 'Ethernet port status & flags' },
                      { cmd: '/interface bridge print', desc: 'Bridge configuration' },
                      { cmd: '/interface bridge port print', desc: 'Bridge port membership' },
                    ].map((item) => (
                      <button
                        key={item.cmd}
                        onClick={() => handleSendCommand(item.cmd)}
                        className={`w-full text-left p-1.5 rounded group border transition-all font-mono text-[11px] flex flex-col cursor-pointer ${
                          isLightMode
                            ? 'hover:bg-cyan-50/80 hover:border-cyan-300 border-transparent text-slate-800'
                            : 'hover:bg-cyan-950/60 hover:text-cyan-300 border-transparent hover:border-cyan-500/30'
                        }`}
                      >
                        <span
                          className={`font-bold ${
                            isLightMode ? 'text-cyan-700 group-hover:text-cyan-900' : 'text-cyan-400 group-hover:text-cyan-200'
                          }`}
                        >
                          {item.cmd}
                        </span>
                        <span className={`text-[9.5px] font-sans ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* IP & Routing */}
                <div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${
                      isLightMode ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <span>IP & Routing</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { cmd: '/ip address print', desc: 'IP addresses assigned' },
                      { cmd: '/ip route print', desc: 'Routing table & gateways' },
                      { cmd: '/ip firewall print', desc: 'Firewall filter rules' },
                      { cmd: '/ip pool print', desc: 'DHCP pools' },
                    ].map((item) => (
                      <button
                        key={item.cmd}
                        onClick={() => handleSendCommand(item.cmd)}
                        className={`w-full text-left p-1.5 rounded group border transition-all font-mono text-[11px] flex flex-col cursor-pointer ${
                          isLightMode
                            ? 'hover:bg-emerald-50/80 hover:border-emerald-300 border-transparent text-slate-800'
                            : 'hover:bg-emerald-950/60 hover:text-emerald-300 border-transparent hover:border-emerald-500/30'
                        }`}
                      >
                        <span
                          className={`font-bold ${
                            isLightMode ? 'text-emerald-700 group-hover:text-emerald-900' : 'text-emerald-400 group-hover:text-emerald-200'
                          }`}
                        >
                          {item.cmd}
                        </span>
                        <span className={`text-[9.5px] font-sans ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Resources */}
                <div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${
                      isLightMode ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`} />
                    <span>System & Tools</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { cmd: '/system resource print', desc: 'CPU, RAM, Uptime' },
                      { cmd: '/system identity print', desc: 'Router hostname' },
                      { cmd: '/tool ping 8.8.8.8 count=4', desc: 'ICMP ping probe' },
                      { cmd: '/export hide-sensitive', desc: 'Full config dump' },
                    ].map((item) => (
                      <button
                        key={item.cmd}
                        onClick={() => handleSendCommand(item.cmd)}
                        className={`w-full text-left p-1.5 rounded group border transition-all font-mono text-[11px] flex flex-col cursor-pointer ${
                          isLightMode
                            ? 'hover:bg-purple-50/80 hover:border-purple-300 border-transparent text-slate-800'
                            : 'hover:bg-purple-950/60 hover:text-purple-300 border-transparent hover:border-purple-500/30'
                        }`}
                      >
                        <span
                          className={`font-bold ${
                            isLightMode ? 'text-purple-700 group-hover:text-purple-900' : 'text-purple-400 group-hover:text-purple-200'
                          }`}
                        >
                          {item.cmd}
                        </span>
                        <span className={`text-[9.5px] font-sans ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Interfaces Tab */
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {filteredPorts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    {isEn ? 'No interfaces found matching filter.' : 'هیچ اینترفیسی مطابق فیلتر یافت نشد.'}
                  </div>
                ) : (
                  filteredPorts.map((p) => {
                    const isUp = p.status === 'up';
                    const isSelected = selectedPort?.port_id === p.port_id;
                    return (
                      <div
                        key={p.port_id}
                        className={`p-2.5 rounded-xl border transition-all flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/60 shadow-xs'
                            : isLightMode
                            ? 'bg-slate-50/80 border-slate-200 hover:border-cyan-400'
                            : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isUp ? 'bg-emerald-400 shadow-xs shadow-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <div className="truncate">
                              <span className="font-mono font-bold text-xs">{p.port_id}</span>
                              {p.name && p.name !== p.port_id && (
                                <span className="text-[10px] text-slate-400 ml-1">({p.name})</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-mono shrink-0">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-white ${
                                (p.mode || 'access') === 'trunk'
                                  ? 'bg-purple-600 border border-purple-500'
                                  : 'bg-cyan-600 border border-cyan-500'
                              }`}
                            >
                              {(p.mode || 'access').toUpperCase()}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold border ${
                                isLightMode
                                  ? 'bg-white text-slate-700 border-slate-300'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              VLAN {p.vlan}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/80">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 min-w-0">
                            <Cable className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span className="truncate">
                              {p.connected_device && p.connected_device !== 'Disconnected'
                                ? p.connected_device
                                : (isEn ? 'Empty / Disconnected' : 'خالی / بدون اتصال')}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const cmd = `/interface print where name="${p.port_id}"`;
                              setInput(cmd);
                              handleSendCommand(cmd);
                              setSelectedPort(p);
                            }}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition shrink-0 cursor-pointer shadow-xs ${
                              isLightMode
                                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                            }`}
                            title={isEn ? "Select interface in CLI" : "مشاهده وضعیت این پورت در CLI"}
                          >
                            {isEn ? "Select in CLI" : "انتخاب در CLI"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
            </div>
          )}
        </div>

        {/* WinBox Launcher Modal */}
        {isWinBoxModalOpen && device && (
          <WinBoxLauncherModal
            device={device}
            isOpen={isWinBoxModalOpen}
            onClose={() => setIsWinBoxModalOpen(false)}
            isLightMode={isLightMode}
          />
        )}
      </div>
  );

  if (isEmbedded) {
    return modalContent;
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventBackdropClose) {
          onClose();
        }
      }}
      className={`fixed top-0 left-0 right-0 bottom-8 z-50 flex items-center justify-center ${
        isFullScreen ? 'p-0' : 'p-2 sm:p-4'
      } backdrop-blur-xs animate-in fade-in duration-200 ${
        isLightMode ? 'bg-slate-900/50' : 'bg-black/85'
      }`}
    >
      {modalContent}
    </div>
  );
};
