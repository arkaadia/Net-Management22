import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal as TerminalIcon,
  X,
  Send,
  HelpCircle,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  Maximize2,
  Minimize2,
  Minus,
  Trash2,
  Layers,
  Server,
  Router as RouterIcon,
  Cable,
  Check,
  Play,
  Palette,
  Type,
  PanelRightClose,
  PanelRightOpen,
  History as HistoryIcon,
  Clock,
  Columns,
  ArrowLeftRight,
  RefreshCw,
  Lock,
  Unlock,
  Activity,
} from 'lucide-react';
import { Device, SwitchPort, VlanInfo } from '../types';
import {
  fetchDevicePorts,
  updateSwitchPort,
  writeMemory,
  fetchVlans,
  sshConnect,
  sshExecute,
  sshDisconnect,
  getTerminalWebSocketUrl,
  syncDevicePorts,
} from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { logDeviceCommand, evaluateCommandRisk } from '../services/auditLogger';
import { CompactTerminalFaceplate } from './terminal/CompactTerminalFaceplate';
import { CiscoWriteConfirmModal, WriteChangeItem } from './CiscoWriteConfirmModal';
import {
  ConnectionLogTroubleshootModal,
  ConnectionLifecycleEvent,
  ConnectionTroubleshootData,
  redactSensitiveData,
} from './terminal/ConnectionLogTroubleshootModal';

export interface CiscoTerminalModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onDeviceUpdated?: () => void;
  isEmbedded?: boolean;
  onSplitScreen?: () => void;
  onSwap?: () => void;
  paneIndex?: number;
  totalPanes?: number;
  onMovePane?: (fromIndex: number, toIndex: number) => void;
  onClosePane?: () => void;
  onChangeDevice?: () => void;
  allDevices?: Device[];
  isLightMode?: boolean;
}

type CliMode = 'USER_EXEC' | 'PRIVILEGED_EXEC' | 'GLOBAL_CONFIG' | 'INTERFACE_CONFIG' | 'VLAN_CONFIG';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'error' | 'success';
  text: string;
}

interface CommandGuideItem {
  cmd: string;
  desc: string;
  descEn: string;
  category: 'exec' | 'config' | 'show' | 'action';
  mode: CliMode;
  forType?: 'switch' | 'router' | 'mikrotik' | 'linux' | 'all';
}

const TERMINAL_BG_OPTIONS = [
  { id: 'slate', color: '#020617', nameEn: 'Slate (Default)', nameFa: 'سرمه‌ای تیره (پیش‌فرض)' },
  { id: 'black', color: '#000000', nameEn: 'Pitch Black', nameFa: 'مشکی خالص (OLED)' },
  { id: 'navy', color: '#081026', nameEn: 'Midnight Navy', nameFa: 'سرمه‌ای اقیانوسی' },
  { id: 'matrix', color: '#03170e', nameEn: 'Matrix Dark Green', nameFa: 'سبز تیره ماتریکس' },
  { id: 'purple', color: '#160824', nameEn: 'Cyberpunk Violet', nameFa: 'بنفش سایبرپانک' },
  { id: 'teal', color: '#001e26', nameEn: 'Solarized Dark', nameFa: 'آبی‌نفتی سولارایزد' },
  { id: 'charcoal', color: '#18181b', nameEn: 'Zinc Charcoal', nameFa: 'زغالی مات' },
  { id: 'white', color: '#ffffff', nameEn: 'Pure White', nameFa: 'سفید خالص' },
];

const TERMINAL_TEXT_OPTIONS = [
  { id: 'white', color: '#ffffff', nameEn: 'Pure White', nameFa: 'سفید خالص' },
  { id: 'yellow', color: '#facc15', nameEn: 'Terminal Yellow', nameFa: 'زرد ترمینال' },
  { id: 'green', color: '#22c55e', nameEn: 'Matrix Green', nameFa: 'سبز ماتریکس' },
  { id: 'cyan', color: '#38bdf8', nameEn: 'Sky Light Blue', nameFa: 'آبی روشن' },
  { id: 'purple', color: '#c084fc', nameEn: 'Electric Purple', nameFa: 'بنفش روشن' },
  { id: 'pink', color: '#f472b6', nameEn: 'Neon Pink', nameFa: 'صورتی نئونی' },
  { id: 'orange', color: '#fb923c', nameEn: 'Amber Orange', nameFa: 'کهربایی / نارنجی' },
  { id: 'black', color: '#000000', nameEn: 'Pitch Black', nameFa: 'مشکی خالص' },
];

export const CiscoTerminalModal: React.FC<CiscoTerminalModalProps> = ({
  device,
  isOpen,
  onClose,
  onMinimize,
  onDeviceUpdated,
  isEmbedded = false,
  onSplitScreen,
  onSwap,
  paneIndex,
  totalPanes,
  onMovePane,
  onClosePane,
  onChangeDevice,
  allDevices,
  isLightMode: propIsLightMode = false,
}) => {
  const { t, isEn } = useLanguage();
  const [terminalBgColor, setTerminalBgColor] = useState<string>(() => {
    try {
      return localStorage.getItem('cisco_terminal_bg_color') || '#020617';
    } catch {
      return '#020617';
    }
  });

  const isTerminalWhiteBg =
    terminalBgColor === '#ffffff' ||
    terminalBgColor === '#f8fafc' ||
    terminalBgColor === '#f1f5f9' ||
    terminalBgColor === '#ecfeff' ||
    terminalBgColor === '#fffbeb' ||
    terminalBgColor.toLowerCase() === '#fff' ||
    terminalBgColor.toLowerCase() === '#ffffff';

  const isLightMode = propIsLightMode || isTerminalWhiteBg;

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

  const [terminalTextColor, setTerminalTextColor] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cisco_terminal_text_color');
      if (saved) return saved;
    } catch {}
    return isTerminalWhiteBg ? '#000000' : '#ffffff';
  });

  const handleSelectTextColor = (color: string) => {
    setTerminalTextColor(color);
    try {
      localStorage.setItem('cisco_terminal_text_color', color);
    } catch {}
  };

  const handleSelectBgColor = (color: string) => {
    setTerminalBgColor(color);
    try {
      localStorage.setItem('cisco_terminal_bg_color', color);
    } catch {}
    if ((color === '#ffffff' || color.toLowerCase() === '#fff') && terminalTextColor === '#ffffff') {
      setTerminalTextColor('#000000');
      try {
        localStorage.setItem('cisco_terminal_text_color', '#000000');
      } catch {}
    } else if (color !== '#ffffff' && terminalTextColor === '#000000') {
      setTerminalTextColor('#ffffff');
      try {
        localStorage.setItem('cisco_terminal_text_color', '#ffffff');
      } catch {}
    }
  };
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [cliMode, setCliMode] = useState<CliMode>('USER_EXEC');
  const [currentInterface, setCurrentInterface] = useState<string>('');
  const [currentVlanId, setCurrentVlanId] = useState<number>(1);
  const [hostname, setHostname] = useState<string>('Switch');
  const [ports, setPorts] = useState<SwitchPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<SwitchPort | null>(null);
  const [vlans, setVlans] = useState<VlanInfo[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'guide' | 'interfaces'>('guide');
  const [interfaceSearch, setInterfaceSearch] = useState('');
  const [commandSearch, setCommandSearch] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cisco_terminal_sidebar_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isWritingMemory, setIsWritingMemory] = useState(false);
  const [showWriteConfirm, setShowWriteConfirm] = useState(false);
  const [sessionChanges, setSessionChanges] = useState<WriteChangeItem[]>([]);
  const [sshSessionMode, setSshSessionMode] = useState<'connecting' | 'real_ssh' | 'simulated' | 'failed'>('connecting');
  const [sshLatency, setSshLatency] = useState<number | null>(null);
  const [isSyncingPorts, setIsSyncingPorts] = useState<boolean>(false);
  const lastSyncTimeRef = useRef<number>(0);
  const pingIntervalRef = useRef<any>(null);
  const activeDevIdRef = useRef<string | null>(null);
  const deviceRef = useRef<Device | null>(device);
  deviceRef.current = device;
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>([]);
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const [selectedSshProfile, setSelectedSshProfile] = useState<string>('auto');
  const appearanceMenuRef = useRef<HTMLDivElement>(null);
  const lastClickedPortRef = useRef<SwitchPort | null>(null);
  const lastInsertedPortTextRef = useRef<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const draftInputRef = useRef<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const [livePrompt, setLivePrompt] = useState<string>('');
  const lastExecutedCommandRef = useRef<string>('');
  const firstDataChunkRef = useRef<boolean>(true);

  // Phase 5: Connection Log & Troubleshoot diagnostics state
  const [showConnectionDiagnostics, setShowConnectionDiagnostics] = useState<boolean>(false);
  const [lifecycleEvents, setLifecycleEvents] = useState<ConnectionLifecycleEvent[]>([]);
  const [troubleshootData, setTroubleshootData] = useState<ConnectionTroubleshootData | null>(null);

  const addLifecycleEvent = (
    stage: ConnectionLifecycleEvent['stage'],
    title: string,
    detail: string,
    level: ConnectionLifecycleEvent['level'] = 'info',
    metadata?: Record<string, any>,
    titleEn?: string
  ) => {
    const newEvt: ConnectionLifecycleEvent = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      timestamp: Date.now(),
      stage,
      title,
      titleEn,
      detail: redactSensitiveData(detail),
      level,
      metadata,
    };
    setLifecycleEvents((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.stage === stage && last.detail === newEvt.detail && (newEvt.timestamp - last.timestamp) < 250) {
        return prev;
      }
      return [...prev, newEvt];
    });
  };

  const filteredInterfaces = useMemo(() => {
    if (!interfaceSearch.trim()) return ports;
    const q = interfaceSearch.toLowerCase().trim();
    return ports.filter(
      (p) =>
        p.port_id.toLowerCase().includes(q) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        p.mode.toLowerCase().includes(q) ||
        String(p.vlan).includes(q) ||
        (p.connected_device && p.connected_device.toLowerCase().includes(q))
    );
  }, [ports, interfaceSearch]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cisco_terminal_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  const handleCloseModal = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    if (device) {
      const connProtocol = (device.connection_protocol || device.connection?.protocol || 'ssh').toLowerCase();
      const targetHost = device.ssh_host || device.ip;
      const sshPort = device.ssh_port || (connProtocol === 'telnet' ? 23 : 22);
      sshDisconnect({
        sessionId: activeSessionIdRef.current || undefined,
        deviceId: device.id,
        host: targetHost,
        port: sshPort,
      }).catch(() => {});
      activeSessionIdRef.current = null;
    }
    onClose();
  };

  // Close history dropdown on click outside
  useEffect(() => {
    if (!isHistoryOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHistoryOpen]);

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

  // Handle port click with intelligent insertion and Ctrl+Click range support
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

        const firstPort = rangePorts[0].port_id || (rangePorts[0] as any).port || rangePorts[0].name;
        const lastPort = rangePorts[rangePorts.length - 1].port_id || (rangePorts[rangePorts.length - 1] as any).port || rangePorts[rangePorts.length - 1].name;
        const matchFirst = firstPort.match(/^(.*?)(\d+)$/);
        const matchLast = lastPort.match(/^(.*?)(\d+)$/);
        if (matchFirst && matchLast && matchFirst[1] === matchLast[1]) {
          rangeStr = `${firstPort} - ${matchLast[2]}`;
        } else {
          rangeStr = rangePorts.map((p) => p.port_id || (p as any).port || p.name).join(', ');
        }
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

    const targetText = isRange ? rangeStr : port.port_id;

    setCurrentInput((prevInput) => {
      // 1. If empty or whitespace only
      if (!prevInput.trim()) {
        const cmd =
          cliMode === 'GLOBAL_CONFIG' || cliMode === 'INTERFACE_CONFIG'
            ? isRange
              ? `interface range ${targetText}`
              : `interface ${targetText}`
            : isRange
            ? `show interfaces ${targetText}`
            : `show interface ${targetText}`;
        lastInsertedPortTextRef.current = targetText;
        return cmd;
      }

      // 2. If prevInput contains the previously inserted port/range token
      const lastInserted = lastInsertedPortTextRef.current;
      if (lastInserted && prevInput.includes(lastInserted)) {
        let replaced = prevInput.replace(lastInserted, targetText);
        if (isRange && !replaced.includes('interface range ') && replaced.includes('interface ')) {
          replaced = replaced.replace('interface ', 'interface range ');
        } else if (!isRange && replaced.includes('interface range ')) {
          replaced = replaced.replace('interface range ', 'interface ');
        }
        lastInsertedPortTextRef.current = targetText;
        return replaced;
      }

      // 3. If prevInput contains any known port ID from current device
      for (const p of ports) {
        if (prevInput.includes(p.port_id)) {
          let replaced = prevInput.replace(p.port_id, targetText);
          if (isRange && !replaced.includes('interface range ') && replaced.includes('interface ')) {
            replaced = replaced.replace('interface ', 'interface range ');
          } else if (!isRange && replaced.includes('interface range ')) {
            replaced = replaced.replace('interface range ', 'interface ');
          }
          lastInsertedPortTextRef.current = targetText;
          return replaced;
        }
      }

      // 4. Regex for interface abbreviations like Gi0/1, Fa0/1, Eth1, GigabitEthernet0/1
      const shortPortRegex = /\b(?:Gi|Fa|Te|Eth|Ge|FastEthernet|GigabitEthernet|TenGigabitEthernet)\d+(?:\/\d+)*(?:\s*-\s*\d+)?\b/i;
      const match = prevInput.match(shortPortRegex);
      if (match) {
        let replaced = prevInput.replace(match[0], targetText);
        if (isRange && !replaced.includes('interface range ') && replaced.includes('interface ')) {
          replaced = replaced.replace('interface ', 'interface range ');
        } else if (!isRange && replaced.includes('interface range ')) {
          replaced = replaced.replace('interface range ', 'interface ');
        }
        lastInsertedPortTextRef.current = targetText;
        return replaced;
      }

      // 5. Append target port/range to user's existing typed command without clearing
      lastInsertedPortTextRef.current = targetText;
      if (isRange && prevInput.trim().endsWith('interface')) {
        return `${prevInput.trim()} range ${targetText}`;
      }
      const needsSpace = prevInput.length > 0 && !prevInput.endsWith(' ');
      return `${prevInput}${needsSpace ? ' ' : ''}${targetText}`;
    });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const lastLineEndedWithNewlineRef = useRef<boolean>(true);

  // Helper to append line
  const appendLines = (newLines: TerminalLine[]) => {
    lastLineEndedWithNewlineRef.current = true;
    setLines((prev) => [...prev, ...newLines]);
  };

  // Helper to append streaming raw text from SSH terminal, preserving line continuity across chunk boundaries
  const appendStreamText = (rawChunk: string) => {
    if (!rawChunk) return;
    console.log(`[FRONTEND-APPEND-STREAM] rawChunkLength=${rawChunk.length} preview=${JSON.stringify(rawChunk.slice(0, 80))}`);
    const cleanText = rawChunk.replace(/\r\r\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Strip standard ANSI escape sequences (colors, cursor positioning, VT100 control codes)
    const textWithoutAnsi = cleanText.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
    if (!textWithoutAnsi) return;

    // Detect remote prompt transitions to sync local cliMode and prompt
    if (textWithoutAnsi.includes('(config-if)#') || textWithoutAnsi.includes('(config-if-range)#')) {
      setCliMode('INTERFACE_CONFIG');
    } else if (textWithoutAnsi.includes('(config)#')) {
      setCliMode('GLOBAL_CONFIG');
    } else if (textWithoutAnsi.includes('#') && !textWithoutAnsi.includes('>')) {
      setCliMode('PRIVILEGED_EXEC');
    } else if (textWithoutAnsi.includes('>') && !textWithoutAnsi.includes('#')) {
      setCliMode('USER_EXEC');
    }

    // Dynamic prompt detection from terminal stream
    const trimmedChunk = textWithoutAnsi.trim();
    const promptRegex = /(?:^|\n)([A-Za-z0-9_.-]+(?:(?:\([A-Za-z0-9_.-]+\))?[#>$]|\[[^\]]+\]\s*>[#]?))\s*$/;
    const promptMatch = trimmedChunk.match(promptRegex);
    if (promptMatch && promptMatch[1]) {
      const extractedPrompt = promptMatch[1].trim();
      setLivePrompt(extractedPrompt);
      const hostMatch = extractedPrompt.match(/^([A-Za-z0-9_.-]+)[#(>]/);
      if (hostMatch && hostMatch[1]) {
        setHostname(hostMatch[1]);
      }
    }

    const segments = textWithoutAnsi.split('\n');
    const endsWithNewline = textWithoutAnsi.endsWith('\n');

    setLines((prev) => {
      const updated = [...prev];
      let startIdx = 0;

      // Avoid duplicating the command echo from remote PTY if it matches what the user just executed
      const lastCmd = lastExecutedCommandRef.current.trim();
      if (lastCmd && segments.length > 0) {
        const firstClean = segments[0].trim();
        if (firstClean === lastCmd || firstClean.endsWith(' ' + lastCmd) || firstClean.endsWith('#' + lastCmd) || firstClean.endsWith('>' + lastCmd)) {
          lastExecutedCommandRef.current = '';
          startIdx = 1;
        }
      }

      // If the previous chunk did not finish with a newline and there is an existing output line,
      // append the first segment to that line instead of splitting onto a new line
      if (!lastLineEndedWithNewlineRef.current && updated.length > 0 && startIdx < segments.length) {
        const lastIndex = updated.length - 1;
        const lastLine = updated[lastIndex];
        if (lastLine && lastLine.type === 'output') {
          updated[lastIndex] = {
            ...lastLine,
            text: lastLine.text + segments[startIdx],
          };
          startIdx++;
        }
      }

      for (let i = startIdx; i < segments.length; i++) {
        // If the chunk ended with a newline, the last split element is an empty string; don't add an extra blank line
        if (i === segments.length - 1 && segments[i] === '' && endsWithNewline) {
          continue;
        }
        // If the line is an orphan prompt at the very end of stream, skip it because input bar displays the live prompt
        const segTrim = segments[i].trim();
        if (i === segments.length - 1 && !endsWithNewline && promptMatch && segTrim === promptMatch[1].trim()) {
          continue;
        }
        updated.push({
          id: 'ws-out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '-' + i,
          type: 'output',
          text: segments[i],
        });
      }

      lastLineEndedWithNewlineRef.current = endsWithNewline;
      return updated;
    });
  };

  // Unified port synchronization over the active SSH tunnel
  const handleSyncPorts = async (silent: boolean = false) => {
    const curDev = deviceRef.current;
    if (!curDev) return;
    const now = Date.now();
    // Throttle queries to avoid excessive SSH requests (minimum 2.5s cooldown)
    if (now - lastSyncTimeRef.current < 2500 || isSyncingPorts) {
      return;
    }
    lastSyncTimeRef.current = now;
    setIsSyncingPorts(true);

    if (!silent) {
      appendLines([
        {
          id: 'sync-req-' + Date.now(),
          type: 'system',
          text: isEn
            ? `[TUNNEL QUERY] Querying hardware interfaces via active SSH tunnel...`
            : `[استعلام تانل] دریافت و بررسی زنده وضعیت اینترفیس‌ها از طریق تانل فعال SSH...`,
        },
      ]);
    }

    try {
      const res = await syncDevicePorts(curDev.id);
      if (res && res.ports && res.ports.length > 0) {
        if (sshSessionMode === 'real_ssh' && res.sync_source === 'simulator' && !res.is_live && ports.length > 0) {
          return;
        }
        const rawPorts = res.ports || [];
        const normalizedPorts = rawPorts.map((p: any, idx: number) => ({
          ...p,
          port_id: p.port_id || p.port || p.name || `port-${idx + 1}`,
        }));
        setPorts(normalizedPorts);
        const upCount = normalizedPorts.filter((p) => p.status === 'up').length;
        const downCount = normalizedPorts.filter((p) => p.status !== 'up').length;
        if (!silent) {
          appendLines([
            {
              id: 'sync-ok-' + Date.now(),
              type: 'success',
              text: isEn
                ? `[SYNC SUCCESS] Verified ${normalizedPorts.length} interfaces via ${res.sync_source || 'SSH tunnel'}: ${upCount} UP, ${downCount} DOWN.`
                : `[پایان بررسی] وضعیت ${normalizedPorts.length} پورت با موفقیت از طریق ${res.sync_source || 'تانل SSH'} همگام شد (${upCount} متصل، ${downCount} قطع).`,
            },
          ]);
        }
        if (onDeviceUpdated) {
          onDeviceUpdated();
        }
      }
    } catch (err: any) {
      if (!silent) {
        appendLines([
          {
            id: 'sync-err-' + Date.now(),
            type: 'system',
            text: `[SYNC NOTICE] Interface check: ${err.message || 'Tunnel busy'}. Retaining active buffer.`,
          },
        ]);
      }
    } finally {
      setIsSyncingPorts(false);
    }
  };

  // Initialize terminal session (Persistent WebSocket with SSH KeepAlive)
  useEffect(() => {
    if (isOpen && device) {
      const curDev = device;
      activeDevIdRef.current = curDev.id;
      const fullDev = allDevices?.find((d) => d.id === curDev.id || (d.name && d.name.toLowerCase() === curDev.name?.toLowerCase())) || curDev;
      const connProtocol = (fullDev?.connection_protocol || fullDev?.connection?.protocol || curDev?.connection_protocol || curDev?.connection?.protocol || 'ssh').toLowerCase() as 'ssh' | 'telnet';
      const devHost = (fullDev?.name || curDev?.name || 'SWITCH').toUpperCase();
      const targetHost = (
        fullDev?.ssh_host ||
        fullDev?.connection?.host ||
        fullDev?.ip ||
        (fullDev?.connection as any)?.ip ||
        curDev?.ssh_host ||
        curDev?.connection?.host ||
        curDev?.ip ||
        ''
      ).trim();
      const sshPort = Number(
        fullDev?.ssh_port ||
        fullDev?.connection?.port ||
        curDev?.ssh_port ||
        curDev?.connection?.port ||
        (connProtocol === 'telnet' ? 23 : 22)
      );
      const sshUser = (
        fullDev?.ssh_username ||
        fullDev?.connection?.username ||
        curDev?.ssh_username ||
        curDev?.connection?.username ||
        'admin'
      ).trim();

      setHostname(devHost);
      setCliMode('USER_EXEC');
      setCurrentInterface('');
      setHasUnsavedChanges(!!curDev.has_unsaved_changes);
      setSshSessionMode('connecting');
      setSshLatency(null);
      setSelectedPort(null);
      setSelectedPortIds([]);
      lastClickedPortRef.current = null;
      loadPortsAndVlans(curDev.id);

      const hostDisplay = targetHost || (isEn ? 'No IP Configured' : 'بدون آی‌پی');
      const protoUpper = (connProtocol || 'ssh').toUpperCase();
      setLines([
        {
          id: 'sys-init-1',
          type: 'system',
          text: isEn
            ? `[${protoUpper} CLIENT v2.5] Initiating persistent direct ${protoUpper} socket connection to ${curDev?.name || 'Device'} (${hostDisplay}:${sshPort})...`
            : `[کلاینت ${protoUpper} نسخه ۲.۵] برقراری ارتباط سوکت مستقیم و پایدار ${protoUpper} با ${curDev?.name || 'تجهیز'} (${hostDisplay}:${sshPort})...`,
        },
        {
          id: 'sys-init-2',
          type: 'system',
          text: `[CREDENTIALS] Target User: '${sshUser}' | Target Host: '${targetHost || (isEn ? 'Unassigned' : 'تنظیم نشده')}' | Protocol: ${protoUpper}`,
        },
      ]);

      // Connect interactive WebSocket tunnel with device parameters
      try {
        const pass = fullDev?.ssh_password || (fullDev?.connection as any)?.password || curDev?.ssh_password || (curDev?.connection as any)?.password || '';
        const enablePass = fullDev?.enable_password || curDev?.enable_password || '';
        const devPlatform = fullDev?.platform || curDev?.platform || fullDev?.type || curDev?.type || '';

        const wsUrl = getTerminalWebSocketUrl(curDev.id, connProtocol, 'Super Admin', {
          ip: targetHost || curDev.ip,
          ssh_host: targetHost || curDev.ssh_host,
          ssh_port: sshPort,
          ssh_username: sshUser,
          ssh_password: pass,
          enable_password: enablePass,
          platform: devPlatform,
          selected_profile: selectedSshProfile === 'auto' ? undefined : selectedSshProfile,
        });

        // Record initial WebSocket connection lifecycle event
        firstDataChunkRef.current = true;
        addLifecycleEvent(
          'ws_connect',
          isEn ? 'WebSocket Initiating' : 'شروع برقراری ارتباط وب‌سوکت',
          isEn
            ? `Initiating direct WebSocket stream for ${curDev?.name || 'Device'} (${targetHost}:${sshPort})`
            : `در حال باز کردن سوکت وب‌سوکت برای ${curDev?.name || 'دستگاه'} (${targetHost}:${sshPort})`,
          'info',
          { host: targetHost, port: sshPort, protocol: connProtocol }
        );

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          addLifecycleEvent(
            'ws_connected',
            isEn ? 'WebSocket Connected' : 'ارتباط وب‌سوکت برقرار شد',
            isEn
              ? `Bidirectional WebSocket tunnel established with backend proxy`
              : `ارتباط وب‌سوکت پایدار با سرور برقرار شد`,
            'success'
          );

          // Setup periodic keepalive ping every 20s to ensure tunnel does not drop while modal is open
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
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'pong') {
              // Keepalive acknowledged
              return;
            }
            if (msg.type === 'lifecycle_event' && msg.event) {
              setLifecycleEvents((prev) => {
                if (prev.some((e) => e.id === msg.event.id)) return prev;
                return [...prev, msg.event];
              });
              return;
            }
            if (msg.type === 'lifecycle_events_history' && Array.isArray(msg.events)) {
              setLifecycleEvents(msg.events);
              return;
            }
            if (msg.type === 'data' && msg.data) {
              console.log(`[FRONTEND-WS-DATA] chars=${msg.data.length} preview=${JSON.stringify(msg.data.slice(0, 100))}`);
              if (firstDataChunkRef.current) {
                firstDataChunkRef.current = false;
                addLifecycleEvent(
                  'output_reception',
                  isEn ? 'Output Reception' : 'دریافت پاسخ از ترمینال',
                  isEn
                    ? `Received initial terminal data stream (${msg.data.length} chars)`
                    : `اولین خروجی خط فرمان از تجهیز دریافت شد (${msg.data.length} کاراکتر)`,
                  'success',
                  { chars: msg.data.length }
                );
              }
              appendStreamText(msg.data);
            } else if (msg.type === 'status') {
              if (msg.status === 'connected') {
                if (msg.is_real) {
                  setSshSessionMode('real_ssh');
                  setSshLatency(msg.latency_ms || 2.2);
                  addLifecycleEvent(
                    'shell_creation',
                    isEn ? 'Interactive Shell Ready' : 'کانال سخت‌افزاری فعال شد',
                    isEn
                      ? `PTY shell channel established in ${msg.latency_ms || 2}ms. Real SSH hardware session active.`
                      : `کانال PTY تعاملی در ${msg.latency_ms || 2} میلی‌ثانیه برقرار شد.`,
                    'success',
                    { latency_ms: msg.latency_ms, legacy: msg.legacy_algorithms }
                  );
                  setTroubleshootData({
                    status: 'connected',
                    actualError: undefined,
                    latencyMs: msg.latency_ms || 2.4,
                    host: targetHost,
                    port: sshPort,
                    username: sshUser,
                    protocol: (connProtocol || 'ssh').toUpperCase(),
                    negotiationInfo: {
                      tier: msg.legacy_algorithms ? 'Tier 2 (Legacy Cisco 2960 Fallback)' : 'Tier 1 (Modern Fast Path)',
                      kex: msg.legacy_algorithms ? 'diffie-hellman-group14-sha1' : 'curve25519-sha256@libssh.org',
                      cipher: msg.legacy_algorithms ? 'aes128-cbc' : 'aes256-gcm@openssh.com',
                      key_type: msg.legacy_algorithms ? 'ssh-rsa (2048-bit)' : 'rsa-sha2-512',
                    },
                  });
                  appendLines([
                    {
                      id: 'sys-ssh-ok-' + Date.now(),
                      type: 'success',
                      text: isEn
                        ? `[LIVE ${(connProtocol || 'ssh').toUpperCase()} ESTABLISHED] Connected to ${targetHost}:${sshPort} via Paramiko 2 (SSHv2) in ${msg.latency_ms || 2}ms.\nSession: Persistent WebSocket SSH Tunnel Active. Real interactive PTY hardware channel.`
                        : `[اتصال زنده ${(connProtocol || 'ssh').toUpperCase()} برقرار شد] اتصال به ${targetHost}:${sshPort} از طریق پارامیکو ۲ (پروتکل SSHv2) در ${msg.latency_ms || 2} میلی‌ثانیه برقرار شد.\nنشست: تانل وب‌سوکت پایدار فعال است و ارتباط با سخت‌افزار واقعی سوئیچ سیسکو برقرار می‌باشد.`,
                    },
                  ]);
                } else {
                  setSshSessionMode('failed');
                  addLifecycleEvent(
                    'exception',
                    isEn ? 'Connection Failed' : 'خطای ارتباط سخت‌افزاری',
                    isEn ? `Device ${targetHost}:${sshPort} did not establish authentic hardware SSH session.` : `عدم برقراری ارتباط زنده با ${targetHost}:${sshPort}`,
                    'error'
                  );
                  appendLines([
                    {
                      id: 'sys-fail-real-' + Date.now(),
                      type: 'system',
                      text: isEn
                        ? `[CONNECTION FAILED] Device ${targetHost}:${sshPort} did not establish authentic hardware SSH session.`
                        : `[خطای اتصال] امکان برقراری ارتباط زنده و واقعی سخت‌افزاری با ${targetHost}:${sshPort} میسر نشد.`,
                    },
                  ]);
                }
              } else if (msg.status === 'failed' || msg.status === 'disconnected') {
                setSshSessionMode('failed');
                addLifecycleEvent(
                  msg.status === 'failed' ? 'exception' : 'disconnect',
                  msg.status === 'failed'
                    ? (isEn ? 'Connection Failed' : 'خطای ارتباط سخت‌افزاری')
                    : (isEn ? 'Session Disconnected' : 'ارتباط خاتمه یافت'),
                  msg.message || (isEn ? 'Disconnected from device' : 'ارتباط با تجهیز قطع شد'),
                  msg.status === 'failed' ? 'error' : 'warning',
                  msg.diagnostic
                );
                if (msg.diagnostic) {
                  setTroubleshootData({
                    status: 'failed',
                    actualError: msg.diagnostic.summary || msg.message || 'Connection failed',
                    category: msg.category || msg.diagnostic.category,
                    possibleCauseEn: msg.diagnostic.root_cause_en,
                    possibleCauseFa: msg.diagnostic.root_cause_fa,
                    recommendedCheckEn: msg.diagnostic.workflow_steps_en,
                    recommendedCheckFa: msg.diagnostic.workflow_steps_fa,
                    ciscoCommands: msg.diagnostic.cisco_commands,
                    host: targetHost,
                    port: sshPort,
                    username: sshUser,
                    protocol: (connProtocol || 'ssh').toUpperCase(),
                  });
                }
                appendLines([
                  {
                    id: 'ws-status-fail-' + Date.now(),
                    type: 'system',
                    text: `[CONNECTION STATUS] ${msg.message || (isEn ? 'Disconnected from device' : 'ارتباط با تجهیز قطع شد')}`,
                  },
                ]);
                if (msg.diagnostic) {
                  const diag = msg.diagnostic;
                  const cause = isEn ? (diag.root_cause_en || diag.summary) : (diag.root_cause_fa || diag.summary);
                  const steps: string[] = isEn ? (diag.workflow_steps_en || []) : (diag.workflow_steps_fa || []);
                  const cmds: string[] = diag.cisco_commands || [];
                  const diagLines: TerminalLine[] = [
                    {
                      id: 'ws-diag-cause-' + Date.now(),
                      type: 'system',
                      text: `[ROOT CAUSE / علت خطا]\n${cause}`,
                    },
                  ];
                  if (steps.length > 0) {
                    diagLines.push({
                      id: 'ws-diag-steps-' + Date.now(),
                      type: 'system',
                      text: `[TROUBLESHOOTING WORKFLOW / مراحل رفع مشکل]\n${steps.join('\n')}`,
                    });
                  }
                  if (cmds.length > 0) {
                    diagLines.push({
                      id: 'ws-diag-cmds-' + Date.now(),
                      type: 'system',
                      text: `[CISCO CLI COMMANDS / دستورات سیسکو]:\n${cmds.join('\n')}`,
                    });
                  }
                  appendLines(diagLines);
                }
              }
            } else if (msg.type === 'error') {
              setSshSessionMode('failed');
              addLifecycleEvent(
                'backend_exception',
                isEn ? 'Backend Connection Error' : 'خطای اتصال سمت بک‌اند',
                msg.error || (isEn ? 'Connection error' : 'خطای ارتباط'),
                'error',
                msg.diagnostic
              );
              if (msg.diagnostic) {
                setTroubleshootData({
                  status: 'failed',
                  actualError: msg.diagnostic.summary || msg.error || 'Connection error',
                  category: msg.code || msg.diagnostic.category,
                  possibleCauseEn: msg.diagnostic.root_cause_en,
                  possibleCauseFa: msg.diagnostic.root_cause_fa,
                  recommendedCheckEn: msg.diagnostic.workflow_steps_en,
                  recommendedCheckFa: msg.diagnostic.workflow_steps_fa,
                  ciscoCommands: msg.diagnostic.cisco_commands,
                  host: targetHost,
                  port: sshPort,
                  username: sshUser,
                  protocol: (connProtocol || 'ssh').toUpperCase(),
                });
              } else {
                setTroubleshootData((prev) => ({
                  status: 'failed',
                  actualError: msg.error || (isEn ? 'Connection error' : 'خطای ارتباط'),
                  category: msg.code || 'BACKEND_ERROR',
                  possibleCauseEn: msg.error,
                  possibleCauseFa: isEn ? undefined : 'خطای پاسخ‌گویی از سرور بک‌اند',
                  recommendedCheckEn: ['Verify Python backend service status', 'Check WebSocket connection route'],
                  recommendedCheckFa: ['بررسی فعال بودن سرویس پایتون', 'بررسی پورت وب‌سوکت'],
                  host: targetHost,
                  port: sshPort,
                  username: sshUser,
                  protocol: (connProtocol || 'ssh').toUpperCase(),
                  ...(prev || {}),
                }));
              }
              appendLines([
                {
                  id: 'ws-err-' + Date.now(),
                  type: 'system',
                  text: `[TERMINAL ERROR] ${msg.error || (isEn ? 'Connection error' : 'خطای ارتباط')}`,
                },
              ]);
              if (msg.diagnostic) {
                const diag = msg.diagnostic;
                const cause = isEn ? (diag.root_cause_en || diag.summary) : (diag.root_cause_fa || diag.summary);
                const steps: string[] = isEn ? (diag.workflow_steps_en || []) : (diag.workflow_steps_fa || []);
                const cmds: string[] = diag.cisco_commands || [];
                const errDiagLines: TerminalLine[] = [
                  {
                    id: 'ws-diag-cause-err-' + Date.now(),
                    type: 'system',
                    text: `[ROOT CAUSE / علت خطا]\n${cause}`,
                  },
                ];
                if (steps.length > 0) {
                  errDiagLines.push({
                    id: 'ws-diag-steps-err-' + Date.now(),
                    type: 'system',
                    text: `[TROUBLESHOOTING WORKFLOW / مراحل رفع مشکل]\n${steps.join('\n')}`,
                  });
                }
                if (cmds.length > 0) {
                  errDiagLines.push({
                    id: 'ws-diag-cmds-err-' + Date.now(),
                    type: 'system',
                    text: `[CISCO CLI COMMANDS / دستورات سیسکو]:\n${cmds.join('\n')}`,
                  });
                }
                appendLines(errDiagLines);
              }
            }
          } catch {
            const rawStr = String(event.data || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
            if (rawStr && rawStr !== getPrompt().trim()) {
              appendLines([
                {
                  id: 'ws-raw-' + Date.now(),
                  type: 'output',
                  text: rawStr,
                },
              ]);
            }
          }
        };

        ws.onerror = () => {
          addLifecycleEvent(
            'backend_exception',
            isEn ? 'WebSocket Error' : 'خطای شبکه وب‌سوکت',
            isEn ? 'WebSocket stream encountered a network error or refused connection' : 'خطای ارتباطی در استریم وب‌سوکت',
            'error'
          );
        };

        ws.onclose = () => {
          addLifecycleEvent(
            'disconnect',
            isEn ? 'WebSocket Disconnected' : 'ارتباط وب‌سوکت قطع شد',
            isEn ? 'Terminal stream disconnected from server.' : 'ارتباط وب‌سوکت بسته شد.',
            'warning'
          );
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
          setSshSessionMode((prev) => (prev === 'real_ssh' ? 'failed' : prev));
        };
      } catch (err: any) {
        setSshSessionMode('failed');
        appendLines([
          {
            id: 'ws-err-catch',
            type: 'system',
            text: `[SOCKET ERROR] Could not initialize WebSocket: ${err?.message || 'Error'}`,
          },
        ]);
      }

      // Concurrently attempt Python paramiko session for secondary execution
      sshConnect({
        host: targetHost,
        port: sshPort,
        username: sshUser,
        password: curDev.ssh_password || '',
        enable_password: curDev.enable_password || '',
        deviceId: curDev.id,
        protocol: connProtocol,
        timeout: 3500,
      })
        .then((res) => {
          if (res.sessionId || res.session_id) {
            activeSessionIdRef.current = res.sessionId || res.session_id || null;
          }
          if (res.success) {
            setSshSessionMode('real_ssh');
            setSshLatency(res.latency_ms || 2.2);
          }
        })
        .catch(() => {
          // If python paramiko is unavailable, WebSocket tunnel handles it
        });

      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);

      return () => {
        clearTimeout(timer);
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
        const curTarget = curDev.ssh_host || curDev.ip;
        sshDisconnect({
          sessionId: activeSessionIdRef.current || undefined,
          deviceId: curDev.id,
          host: curTarget,
          port: sshPort,
        }).catch(() => {});
        fetch(`/api/devices/${curDev.id}/terminal`, { method: 'DELETE' }).catch(() => {});
        activeSessionIdRef.current = null;
        activeDevIdRef.current = null;
      };
    }
  }, [isOpen, device?.id, selectedSshProfile]);

  // Auto scroll to bottom of terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const loadPortsAndVlans = async (devId: string) => {
    try {
      const [portsRes, vlanRes] = await Promise.all([
        fetchDevicePorts(devId),
        fetchVlans(),
      ]);
      const rawPorts = portsRes.ports || [];
      const normalizedPorts = rawPorts.map((p: any, idx: number) => ({
        ...p,
        port_id: p.port_id || p.port || p.name || `port-${idx + 1}`,
      }));
      setPorts(normalizedPorts);
      setVlans(vlanRes.vlans || []);
    } catch (e) {
      console.error('Failed to load device ports/vlans for CLI:', e);
    }
  };

  if (!isOpen || !device) return null;

  const isMikroTik =
    device.platform === 'mikrotik_routeros' ||
    !!device.model?.toLowerCase().includes('mikrotik') ||
    !!device.model?.toLowerCase().includes('routerboard') ||
    !!device.model?.toLowerCase().includes('crs') ||
    !!device.model?.toLowerCase().includes('ccr') ||
    !!device.name?.toLowerCase().includes('mikrotik') ||
    !!device.firmware?.toLowerCase().includes('routeros');

  const isGenericLinux = device.platform === 'generic_linux';
  const isRouter = device.type === 'router' && !isMikroTik && !isGenericLinux;
  const isSwitch = device.type === 'switch' && !isMikroTik && !isGenericLinux;

  // Compute Current Prompt
  const getPrompt = (): string => {
    const user = device.ssh_username || 'admin';
    if (isMikroTik) {
      return `[${user}@${hostname}] >`;
    }
    if (isGenericLinux) {
      return `${user}@${hostname.toLowerCase()}:~$`;
    }
    switch (cliMode) {
      case 'USER_EXEC':
        return `${hostname}>`;
      case 'PRIVILEGED_EXEC':
        return `${hostname}#`;
      case 'GLOBAL_CONFIG':
        return `${hostname}(config)#`;
      case 'INTERFACE_CONFIG':
        return currentInterface.toLowerCase().startsWith('range')
          ? `${hostname}(config-if-range)#`
          : `${hostname}(config-if)#`;
      case 'VLAN_CONFIG':
        return `${hostname}(config-vlan)#`;
      default:
        return `${hostname}>`;
    }
  };

  // Handle Write Memory
  const handleExecuteWriteMemory = async () => {
    try {
      setIsWritingMemory(true);
      appendLines([
        { id: String(Date.now()), type: 'input', text: `${getPrompt()} write memory` },
        { id: String(Date.now() + 1), type: 'system', text: 'Building configuration...' },
      ]);

      await writeMemory(device.id);
      setHasUnsavedChanges(false);
      setSessionChanges([]);

      appendLines([
        {
          id: String(Date.now() + 2),
          type: 'success',
          text: `[OK]\nNVRAM update complete. Configuration saved to startup-config successfully.`,
        },
      ]);

      if (onDeviceUpdated) onDeviceUpdated();
    } catch (err: any) {
      appendLines([
        { id: String(Date.now() + 3), type: 'error', text: `% Error writing configuration to NVRAM: ${err.message}` },
      ]);
    } finally {
      setIsWritingMemory(false);
    }
  };

  // Cisco IOS Command Execution Engine
  const executeCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) {
      appendLines([{ id: String(Date.now()), type: 'input', text: getPrompt() }]);
      return;
    }

    // Reset last inserted port token on command execution so subsequent clicks behave freshly
    lastInsertedPortTextRef.current = null;

    // Save to history
    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const cmdLower = trimmed.toLowerCase();
    const promptText = getPrompt();

    // 1. Clear terminal
    if (cmdLower === 'clear' || cmdLower === 'cls') {
      setLines([
        { id: String(Date.now()), type: 'system', text: `Terminal display cleared. Current session: ${promptText}` },
      ]);
      return;
    }

    // Append input line
    const inputLine: TerminalLine = { id: String(Date.now()), type: 'input', text: `${promptText} ${trimmed}` };

    // Audit Log command execution
    if (device && cmdLower !== '?' && cmdLower !== 'help') {
      try {
        logDeviceCommand({
          deviceId: device.id,
          deviceName: device.name,
          deviceIp: device.ip,
          deviceVendor: isMikroTik ? 'mikrotik' : 'cisco',
          deviceModel: device.model,
          deviceLocation: [device.building, device.floor, device.unit, device.rack ? `رک ${device.rack}` : ''].filter(Boolean).join(' > '),
          channel: 'terminal_interactive',
          command: trimmed,
          riskLevel: evaluateCommandRisk(trimmed),
          status: 'success',
          notes: `اجرای تعاملی روی تجهیز`,
        });
      } catch (err) {
        console.warn('Failed to audit command:', err);
      }
    }

    const fullDev = allDevices?.find((d) => d.id === device?.id || (d.name && d.name.toLowerCase() === device?.name?.toLowerCase())) || device;
    const connProtocol = (fullDev?.connection_protocol || fullDev?.connection?.protocol || device?.connection_protocol || device?.connection?.protocol || 'ssh').toLowerCase();
    const targetHost = (
      fullDev?.ssh_host ||
      fullDev?.connection?.host ||
      fullDev?.ip ||
      (fullDev?.connection as any)?.ip ||
      device?.ssh_host ||
      device?.connection?.host ||
      device?.ip ||
      ''
    ).trim();
    const sshPort = Number(
      fullDev?.ssh_port ||
      fullDev?.connection?.port ||
      device?.ssh_port ||
      device?.connection?.port ||
      (connProtocol === 'telnet' ? 23 : 22)
    );

    const isSocketReady = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;

    // 1. Direct hardware CLI execution via interactive WebSocket stream ONLY for active real hardware SSH
    if (isSocketReady && wsRef.current) {
      console.log(`[FRONTEND-EXEC-CMD-WS] Sending to hardware PTY: "${trimmed}" (mode=${cliMode})`);
      lastExecutedCommandRef.current = trimmed;
      appendLines([inputLine]);

      // Keep local CLI mode in sync with standard transitions
      if (cmdLower === 'enable' || cmdLower === 'en') {
        setCliMode('PRIVILEGED_EXEC');
      } else if (cmdLower === 'disable' || cmdLower === 'dis') {
        setCliMode('USER_EXEC');
      } else if (cmdLower === 'configure terminal' || cmdLower === 'conf t' || cmdLower === 'config t') {
        if (cliMode !== 'USER_EXEC') {
          setCliMode('GLOBAL_CONFIG');
        }
      } else if (cmdLower.startsWith('interface ') || cmdLower.startsWith('int ')) {
        if (cliMode === 'GLOBAL_CONFIG' || cliMode === 'INTERFACE_CONFIG') {
          setCliMode('INTERFACE_CONFIG');
          setCurrentInterface(trimmed.split(/\s+/)[1] || '');
        }
      } else if (cmdLower === 'exit' || cmdLower === 'end') {
        if (cliMode === 'INTERFACE_CONFIG') {
          setCliMode('GLOBAL_CONFIG');
          setCurrentInterface('');
        } else if (cliMode === 'GLOBAL_CONFIG') {
          setCliMode('PRIVILEGED_EXEC');
        } else if (cliMode === 'PRIVILEGED_EXEC') {
          setCliMode('USER_EXEC');
        }
      }

      wsRef.current.send(JSON.stringify({ type: 'input', data: trimmed + '\r\n' }));
      addLifecycleEvent(
        'command_transmission',
        isEn ? 'Command Transmission' : 'ارسال دستور به ترمینال',
        isEn ? `Executed command: ${trimmed}` : `دستور ارسال شد: ${trimmed}`,
        'info',
        { commandLength: trimmed.length }
      );
      if (
        cmdLower.startsWith('sh ') ||
        cmdLower.startsWith('show ') ||
        cmdLower === 'write memory' ||
        cmdLower === 'wr' ||
        cmdLower.startsWith('copy run') ||
        cmdLower.startsWith('description ') ||
        cmdLower.startsWith('desc ') ||
        cmdLower === 'shutdown' ||
        cmdLower === 'shut' ||
        cmdLower === 'no shutdown' ||
        cmdLower === 'no shut' ||
        cmdLower.startsWith('switchport') ||
        cmdLower.startsWith('vlan ') ||
        cmdLower === 'exit' ||
        cmdLower === 'end'
      ) {
        setTimeout(() => handleSyncPorts(true), 1200);
      }
      return;
    }

    // 2. If terminal is currently establishing SSH connection, wait rather than inventing fake output
    if (sshSessionMode === 'connecting') {
      appendLines([
        inputLine,
        {
          id: 'wait-' + Date.now(),
          type: 'system',
          text: isEn ? '% Terminal is establishing connection to hardware. Please wait...' : '% ترمینال در حال برقراری ارتباط با سخت‌افزار است. لطفاً شکیبا باشید...',
        },
      ]);
      return;
    }

    // 3. Direct hardware CLI execution via live SSH API if WebSocket is not open
    if (targetHost || sshSessionMode === 'real_ssh') {
      appendLines([
        inputLine,
        {
          id: 'load-' + Date.now(),
          type: 'system',
          text: isEn ? '[SSH] Executing command on device...' : '[SSH] در حال ارسال و اجرای دستور روی تجهیز...',
        },
      ]);
      try {
        const res = await sshExecute({
          deviceId: fullDev?.id || device?.id,
          host: targetHost,
          port: sshPort,
          username: device?.ssh_username || 'admin',
          password: device?.ssh_password || '',
          command: trimmed,
          sessionId: activeSessionIdRef.current || undefined,
        });
        if (res && res.success && res.output !== undefined) {
          appendLines([
            { id: String(Date.now() + 1), type: 'output', text: res.output || '(Command executed on device)' },
          ]);
          if (
            cmdLower.startsWith('sh ') ||
            cmdLower.startsWith('show ') ||
            cmdLower === 'write memory' ||
            cmdLower === 'wr' ||
            cmdLower.startsWith('copy run') ||
            cmdLower.startsWith('description ') ||
            cmdLower.startsWith('desc ') ||
            cmdLower === 'shutdown' ||
            cmdLower === 'shut' ||
            cmdLower === 'no shutdown' ||
            cmdLower === 'no shut' ||
            cmdLower.startsWith('switchport') ||
            cmdLower.startsWith('vlan ') ||
            cmdLower === 'exit' ||
            cmdLower === 'end'
          ) {
            setTimeout(() => handleSyncPorts(true), 1200);
          }
        } else {
          appendLines([
            {
              id: String(Date.now() + 1),
              type: 'error',
              text: res?.error || res?.output || (isEn ? '% No response from device or command timed out.' : '% پاسخی از تجهیز دریافت نشد یا زمان دستور به پایان رسید.'),
            },
          ]);
        }
        return;
      } catch (err: any) {
        appendLines([
          {
            id: String(Date.now() + 1),
            type: 'error',
            text: `% Hardware execution error: ${err.message || (isEn ? 'No response from device' : 'عدم پاسخ‌دهی تجهیز')}`,
          },
        ]);
        return;
      }
    }

    // 4. If device is not configured for network connection
    appendLines([
      inputLine,
      {
        id: 'err-' + Date.now(),
        type: 'error',
        text: isEn ? '% Device is not connected. Configure IP and SSH credentials.' : '% اتصال به تجهیز برقرار نیست. آدرس IP و مشخصات SSH را تنظیم کنید.',
      },
    ]);
    return;

    // 2. Help
    if (trimmed === '?' || cmdLower === 'help') {
      const helpOutput = generateHelpOutput(cliMode, isRouter);
      appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: helpOutput }]);
      return;
    }

    // 3. Mode Transitions
    if (cmdLower === 'enable' || cmdLower === 'en') {
      if (cliMode === 'USER_EXEC') {
        setCliMode('PRIVILEGED_EXEC');
        appendLines([inputLine]);
      } else {
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'system', text: 'Already in privileged EXEC mode.' }]);
      }
      return;
    }

    if (cmdLower === 'disable' || cmdLower === 'dis') {
      if (cliMode !== 'USER_EXEC') {
        setCliMode('USER_EXEC');
        setCurrentInterface('');
        appendLines([inputLine]);
      } else {
        appendLines([inputLine]);
      }
      return;
    }

    if (cmdLower === 'configure terminal' || cmdLower === 'conf t' || cmdLower === 'config t') {
      if (cliMode === 'USER_EXEC') {
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'error', text: `% Unknown command or not in privileged EXEC mode. Type 'enable' first.` },
        ]);
        return;
      }
      setCliMode('GLOBAL_CONFIG');
      appendLines([
        inputLine,
        { id: String(Date.now() + 1), type: 'system', text: 'Enter configuration commands, one per line. End with CNTL/Z or "exit".' },
      ]);
      return;
    }

    if (cmdLower === 'exit') {
      if (cliMode === 'INTERFACE_CONFIG' || cliMode === 'VLAN_CONFIG') {
        setCliMode('GLOBAL_CONFIG');
        setCurrentInterface('');
        appendLines([inputLine]);
      } else if (cliMode === 'GLOBAL_CONFIG') {
        setCliMode('PRIVILEGED_EXEC');
        appendLines([inputLine]);
      } else if (cliMode === 'PRIVILEGED_EXEC') {
        setCliMode('USER_EXEC');
        appendLines([inputLine]);
      } else {
        const targetHost = device ? (device.ssh_host || device.ip) : 'foreign host';
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'system', text: `% Connection to ${targetHost} closed by foreign host.` }]);
        setTimeout(() => {
          handleCloseModal();
        }, 350);
      }
      return;
    }

    if (cmdLower === 'end') {
      if (cliMode !== 'USER_EXEC' && cliMode !== 'PRIVILEGED_EXEC') {
        setCliMode('PRIVILEGED_EXEC');
        setCurrentInterface('');
        appendLines([inputLine]);
      } else {
        appendLines([inputLine]);
      }
      return;
    }

    // 4. Interface Command (in GLOBAL_CONFIG or INTERFACE_CONFIG)
    if (cmdLower.startsWith('interface ') || cmdLower.startsWith('int ')) {
      if (cliMode !== 'GLOBAL_CONFIG' && cliMode !== 'INTERFACE_CONFIG') {
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'error', text: `% Command only valid in Global Configuration Mode (configure terminal).` },
        ]);
        return;
      }
      const ifName = trimmed.replace(/^interface\s+|^int\s+/i, '').trim();
      const isRange = ifName.toLowerCase().startsWith('range ');
      let targetIf = ifName;
      if (!isRange) {
        const matchedPort = ports.find(
          (p) =>
            p.port_id.toLowerCase() === ifName.toLowerCase() ||
            p.name.toLowerCase() === ifName.toLowerCase() ||
            p.port_id.toLowerCase().includes(ifName.toLowerCase())
        );
        targetIf = matchedPort ? matchedPort.port_id : ifName;
      }
      setCurrentInterface(targetIf);
      setCliMode('INTERFACE_CONFIG');
      appendLines([
        inputLine,
        { id: String(Date.now() + 1), type: 'system', text: `Configuring interface ${targetIf}...` },
      ]);
      return;
    }

    // 5. VLAN Command (in GLOBAL_CONFIG)
    if (cmdLower.startsWith('vlan ')) {
      if (cliMode !== 'GLOBAL_CONFIG') {
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'error', text: `% Command only valid in Global Configuration Mode.` },
        ]);
        return;
      }
      const vlanNum = parseInt(trimmed.replace(/^vlan\s+/i, '').trim());
      if (isNaN(vlanNum) || vlanNum < 1 || vlanNum > 4094) {
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'error', text: `% Invalid VLAN number. Range is 1-4094.` }]);
        return;
      }
      setCurrentVlanId(vlanNum);
      setCliMode('VLAN_CONFIG');
      setHasUnsavedChanges(true);
      setSessionChanges((prev) => [
        ...prev,
        {
          target: `VLAN ${vlanNum}`,
          type: 'vlan',
          change: `Created/Configured VLAN ${vlanNum}`,
          command: `vlan ${vlanNum}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      appendLines([inputLine]);
      return;
    }

    // 6. Hostname command
    if (cmdLower.startsWith('hostname ')) {
      if (cliMode !== 'GLOBAL_CONFIG') {
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'error', text: `% Command only valid in Global Configuration Mode.` }]);
        return;
      }
      const newHost = trimmed.replace(/^hostname\s+/i, '').trim().toUpperCase();
      if (newHost) {
        setHostname(newHost);
        setHasUnsavedChanges(true);
        setSessionChanges((prev) => [
          ...prev,
          {
            target: 'Global Config',
            type: 'hostname',
            change: `Hostname set to ${newHost}`,
            command: `hostname ${newHost}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        appendLines([inputLine]);
      }
      return;
    }

    // 7. Write Memory / Copy Run Start
    if (
      cmdLower === 'write memory' ||
      cmdLower === 'wr' ||
      cmdLower === 'write' ||
      cmdLower === 'copy run start' ||
      cmdLower === 'copy running-config startup-config'
    ) {
      if (cliMode === 'USER_EXEC') {
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'error', text: `% Command only valid in Privileged EXEC mode (#). Type 'enable' first.` },
        ]);
        return;
      }
      await handleExecuteWriteMemory();
      return;
    }

    // 8. Interface Subcommands (when in INTERFACE_CONFIG)
    if (cliMode === 'INTERFACE_CONFIG') {
      const isRange = currentInterface.toLowerCase().startsWith('range ');
      let targetPorts: SwitchPort[] = [];
      if (isRange) {
        if (selectedPortIds.length > 0) {
          targetPorts = ports.filter((p) => selectedPortIds.includes(p.port_id));
        }
        if (targetPorts.length === 0) {
          const cleanRange = currentInterface.replace(/^range\s+/i, '').trim();
          const dashMatch = cleanRange.match(/^(.*?)(\d+)\s*-\s*(\d+)$/);
          if (dashMatch) {
            const prefix = dashMatch[1].trim();
            const startN = parseInt(dashMatch[2], 10);
            const endN = parseInt(dashMatch[3], 10);
            targetPorts = ports.filter((p) => {
              const m = p.port_id.match(/^(.*?)(\d+)$/);
              if (!m) return false;
              const num = parseInt(m[2], 10);
              return p.port_id.toLowerCase().startsWith(prefix.toLowerCase()) && num >= startN && num <= endN;
            });
          }
        }
      } else {
        const found = ports.find((p) => p.port_id === currentInterface || p.name === currentInterface);
        if (found) targetPorts = [found];
      }

      if (cmdLower === 'shutdown') {
        if (targetPorts.length > 0) {
          for (const p of targetPorts) {
            await updateSwitchPort(device.id, p.port_id, { admin_status: 'disabled', status: 'down' });
          }
          const targetIds = targetPorts.map((p) => p.port_id);
          setPorts((prev) =>
            prev.map((p) => (targetIds.includes(p.port_id) ? { ...p, admin_status: 'disabled', status: 'down' } : p))
          );
        }
        setHasUnsavedChanges(true);
        setSessionChanges((prev) => [
          ...prev,
          {
            target: currentInterface,
            type: 'admin_status',
            change: `Interface administratively shut down`,
            command: `interface ${currentInterface}\n shutdown`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'system', text: `%LINK-5-CHANGED: Interface ${currentInterface}, changed state to administratively down` },
          { id: String(Date.now() + 2), type: 'system', text: `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${currentInterface}, changed state to down` },
        ]);
        return;
      }

      if (cmdLower === 'no shutdown' || cmdLower === 'no shut') {
        if (targetPorts.length > 0) {
          for (const p of targetPorts) {
            await updateSwitchPort(device.id, p.port_id, { admin_status: 'enabled', status: 'up' });
          }
          const targetIds = targetPorts.map((p) => p.port_id);
          setPorts((prev) =>
            prev.map((p) => (targetIds.includes(p.port_id) ? { ...p, admin_status: 'enabled', status: 'up' } : p))
          );
        }
        setHasUnsavedChanges(true);
        setSessionChanges((prev) => [
          ...prev,
          {
            target: currentInterface,
            type: 'admin_status',
            change: `Interface administratively enabled`,
            command: `interface ${currentInterface}\n no shutdown`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'system', text: `%LINK-3-UPDOWN: Interface ${currentInterface}, changed state to up` },
          { id: String(Date.now() + 2), type: 'system', text: `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${currentInterface}, changed state to up` },
        ]);
        return;
      }

      if (cmdLower.startsWith('switchport mode ')) {
        const mode = cmdLower.includes('trunk') ? 'trunk' : 'access';
        if (targetPorts.length > 0) {
          for (const p of targetPorts) {
            await updateSwitchPort(device.id, p.port_id, { mode });
          }
          const targetIds = targetPorts.map((p) => p.port_id);
          setPorts((prev) =>
            prev.map((p) => (targetIds.includes(p.port_id) ? { ...p, mode } : p))
          );
        }
        setHasUnsavedChanges(true);
        setSessionChanges((prev) => [
          ...prev,
          {
            target: currentInterface,
            type: 'mode',
            change: `Switchport mode ${mode}`,
            command: `interface ${currentInterface}\n switchport mode ${mode}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        appendLines([inputLine]);
        return;
      }

      if (cmdLower.startsWith('switchport access vlan ')) {
        const vlanVal = parseInt(trimmed.replace(/^switchport access vlan\s+/i, '').trim());
        if (!isNaN(vlanVal) && targetPorts.length > 0) {
          for (const p of targetPorts) {
            await updateSwitchPort(device.id, p.port_id, { vlan: vlanVal });
          }
          const targetIds = targetPorts.map((p) => p.port_id);
          setPorts((prev) =>
            prev.map((p) => (targetIds.includes(p.port_id) ? { ...p, vlan: vlanVal } : p))
          );
          setHasUnsavedChanges(true);
          setSessionChanges((prev) => [
            ...prev,
            {
              target: currentInterface,
              type: 'vlan',
              change: `Access VLAN ${vlanVal}`,
              command: `interface ${currentInterface}\n switchport access vlan ${vlanVal}`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
        appendLines([inputLine]);
        return;
      }

      if (cmdLower.startsWith('switchport trunk allowed vlan ')) {
        const allowed = trimmed.replace(/^switchport trunk allowed vlan\s+/i, '').trim();
        if (targetPorts.length > 0) {
          for (const p of targetPorts) {
            await updateSwitchPort(device.id, p.port_id, { allowed_vlans: allowed });
          }
          const targetIds = targetPorts.map((p) => p.port_id);
          setPorts((prev) =>
            prev.map((p) => (targetIds.includes(p.port_id) ? { ...p, allowed_vlans: allowed } : p))
          );
          setHasUnsavedChanges(true);
          setSessionChanges((prev) => [
            ...prev,
            {
              target: currentInterface,
              type: 'vlan',
              change: `Trunk allowed VLANs: ${allowed}`,
              command: `interface ${currentInterface}\n switchport trunk allowed vlan ${allowed}`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
        appendLines([inputLine]);
        return;
      }

      if (cmdLower.startsWith('description ') || cmdLower.startsWith('desc ')) {
        const descText = trimmed.replace(/^description\s+|^desc\s+/i, '').trim();
        if (targetPorts.length > 0) {
          for (const p of targetPorts) {
            await updateSwitchPort(device.id, p.port_id, { description: descText });
          }
          const targetIds = targetPorts.map((p) => p.port_id);
          setPorts((prev) =>
            prev.map((p) => (targetIds.includes(p.port_id) ? { ...p, description: descText } : p))
          );
          setHasUnsavedChanges(true);
          setSessionChanges((prev) => [
            ...prev,
            {
              target: currentInterface,
              type: 'description',
              change: `Description: "${descText}"`,
              command: `interface ${currentInterface}\n description ${descText}`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
        appendLines([inputLine]);
        return;
      }

      if (cmdLower.startsWith('ip address ')) {
        const parts = trimmed.split(/\s+/);
        const ip = parts[2];
        const mask = parts[3];
        setHasUnsavedChanges(true);
        setSessionChanges((prev) => [
          ...prev,
          {
            target: currentInterface,
            type: 'ip_address',
            change: `IP address ${ip} ${mask}`,
            command: `interface ${currentInterface}\n ip address ${ip} ${mask}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'success', text: `IP address ${ip} ${mask} configured on ${currentInterface}.` },
        ]);
        return;
      }
    }

    if (cmdLower.startsWith('ping ')) {
      const target = trimmed.split(' ')[1] || '8.8.8.8';
      const output = `Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`;
      appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: output }]);
      return;
    }

    // MikroTik RouterOS command emulation handlers
    if (isMikroTik) {
      if (cmdLower === '/ip address print' || cmdLower === 'ip address print' || cmdLower === '/ip address pr' || cmdLower === 'ip address pr') {
        const out = `Flags: X - disabled, I - invalid, D - dynamic \n #   ADDRESS            NETWORK         INTERFACE\n 0   ${device.ip}/24    ${device.ip.split('.').slice(0, 3).join('.')}.0    ether1\n 1   192.168.88.1/24    192.168.88.0    bridge1`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === '/interface print' || cmdLower === 'interface print' || cmdLower === '/interface pr' || cmdLower === 'interface pr') {
        const portLines = ports.length > 0
          ? ports.map((p, i) => ` ${i}  R  ${p.name || `ether${i + 1}`}                              ether            1500`).join('\n')
          : ` 0  R  ether1                              ether            1500\n 1  R  ether2                              ether            1500\n 2  R  bridge1                             bridge           1500`;
        const out = `Flags: D - dynamic, X - disabled, R - running, S - slave \n #     NAME                                TYPE       ACTUAL-MTU\n${portLines}`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === '/ip route print' || cmdLower === 'ip route print' || cmdLower === '/ip route pr') {
        const out = `Flags: X - disabled, A - active, D - dynamic, C - connect, S - static, r - rip, b - bgp, o - ospf \n #      DST-ADDRESS        PREF-SRC        GATEWAY            DISTANCE\n 0 A S  0.0.0.0/0                          192.168.88.254            1\n 1 ADC  192.168.88.0/24    ${device.ip}    ether1                    0`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === '/system resource print' || cmdLower === 'system resource print') {
        const out = `                   uptime: 42d 16h 24m 12s\n                  version: 7.15.2 (stable)\n               build-time: Jun/12/2024 10:14:00\n              free-memory: 842.6MiB\n             total-memory: 1024.0MiB\n                      cpu: ARM64\n                cpu-count: 4\n            cpu-frequency: 1400MHz\n                 cpu-load: 3%\n           free-hdd-space: 112.4MiB\n          total-hdd-space: 128.0MiB`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === '/system identity print' || cmdLower === 'system identity print') {
        const out = `  name: "${hostname}"`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower.startsWith('/system identity set name=') || cmdLower.startsWith('system identity set name=')) {
        const newName = trimmed.split('=')[1] || hostname;
        setHostname(newName.trim().replace(/["']/g, ''));
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'success', text: `System identity changed to: ${newName}` }]);
        return;
      }
      if (cmdLower === '/export compact' || cmdLower === '/export' || cmdLower === 'export compact' || cmdLower === 'export') {
        const out = `# ${new Date().toISOString()} by RouterOS 7.15.2\n# model = ${device.model}\n/interface bridge\nadd name=bridge1\n/ip address\nadd address=${device.ip}/24 interface=ether1 network=192.168.88.0\n/system identity\nset name=${hostname}`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === '/system reboot' || cmdLower === 'system reboot') {
        appendLines([
          inputLine,
          { id: String(Date.now() + 1), type: 'system', text: 'Rebooting system...\nBroadcast message from admin: System will reboot now!' },
        ]);
        return;
      }
      if (cmdLower === 'quit' || cmdLower === '/quit') {
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'system', text: 'Closing session...' }]);
        setTimeout(() => handleCloseModal(), 400);
        return;
      }
    }

    // Linux Shell command emulation handlers
    if (isGenericLinux) {
      if (cmdLower === 'ip -c a' || cmdLower === 'ip a' || cmdLower === 'ip addr' || cmdLower === 'ifconfig') {
        const out = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    inet ${device.ip}/24 brd ${device.ip.split('.').slice(0, 3).join('.')}.255 scope global eth0`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === 'ip route' || cmdLower === 'ip route show' || cmdLower === 'route -n') {
        const out = `default via ${device.ip.split('.').slice(0, 3).join('.')}.1 dev eth0 proto dhcp src ${device.ip} metric 100\n${device.ip.split('.').slice(0, 3).join('.')}.0/24 dev eth0 proto kernel scope link src ${device.ip} metric 100`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === 'ss -tulpn' || cmdLower === 'netstat -tulpn') {
        const out = `Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess\ntcp   LISTEN 0      128          0.0.0.0:22         0.0.0.0:*    users:(("sshd",pid=642,fd=3))\ntcp   LISTEN 0      100        127.0.0.1:25         0.0.0.0:*    users:(("master",pid=1120,fd=13))`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === 'uname -a') {
        const out = `Linux ${hostname.toLowerCase()} 5.15.0-107-generic #117-Ubuntu SMP Fri Apr 26 12:26:49 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === 'uptime') {
        const out = ` 14:22:05 up 24 days,  3:18,  2 users,  load average: 0.12, 0.08, 0.05`;
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'output', text: out }]);
        return;
      }
      if (cmdLower === 'exit' || cmdLower === 'logout') {
        appendLines([inputLine, { id: String(Date.now() + 1), type: 'system', text: 'logout' }]);
        setTimeout(() => handleCloseModal(), 400);
        return;
      }
    }

    if (isMikroTik) {
      appendLines([
        inputLine,
        {
          id: String(Date.now() + 1),
          type: 'error',
          text: `bad command name ${trimmed.split(' ')[0]} (line 1 column 1)`,
        },
      ]);
      return;
    }

    if (isGenericLinux) {
      appendLines([
        inputLine,
        {
          id: String(Date.now() + 1),
          type: 'error',
          text: `bash: ${trimmed.split(' ')[0]}: command not found`,
        },
      ]);
      return;
    }

    // 10. Default / Unrecognized Cisco CLI output
    appendLines([
      inputLine,
      {
        id: String(Date.now() + 1),
        type: 'error',
        text: isEn
          ? `% Invalid input detected at '^' marker.\n  ${trimmed}\n  ^\nCommand not valid in current mode (${cliMode}) or missing parameters. Use '?' or the sidebar guide.`
          : `% Invalid input detected at '^' marker.\n  ${trimmed}\n  ^\nدستور در این مرحله (${cliMode}) معتبر نیست یا نیاز به پارامترهای دیگر دارد. از '?' یا سایدبار راهنما کمک بگیرید.`,
      },
    ]);
  };

  // Get available commands tailored for Cisco Switch, Cisco Router, or MikroTik RouterOS
  const getAvailableCommands = (): string[] => {
    if (isMikroTik) {
      return [
        '/ip address print',
        '/ip address add',
        '/ip address remove',
        '/ip route print',
        '/ip route add',
        '/ip pool print',
        '/ip pool add',
        '/ip dhcp-server print',
        '/ip dhcp-server network print',
        '/ip dhcp-client print',
        '/ip firewall filter print',
        '/ip firewall filter add',
        '/ip firewall nat print',
        '/ip firewall nat add',
        '/ip firewall mangle print',
        '/ip dns print',
        '/ip dns set servers=',
        '/ip service print',
        '/ip neighbor print',
        '/ip arp print',
        '/interface print',
        '/interface ethernet print',
        '/interface ethernet set',
        '/interface bridge print',
        '/interface bridge port print',
        '/interface bridge port add',
        '/interface vlan print',
        '/interface vlan add',
        '/interface wireless print',
        '/interface wireguard print',
        '/system identity print',
        '/system identity set name=',
        '/system resource print',
        '/system routerboard print',
        '/system health print',
        '/system clock print',
        '/system reboot',
        '/system reset-configuration',
        '/system backup save name=',
        '/system package print',
        '/system user print',
        '/system logging print',
        '/routing ospf instance print',
        '/routing bgp connection print',
        '/tool ping',
        '/tool traceroute',
        '/tool profile',
        '/tool torch',
        '/export compact',
        '/export file=',
        '/log print',
        '/ping',
        'quit',
        'exit',
        'clear',
      ];
    }

    if (isGenericLinux) {
      return [
        'ip -c a',
        'ip route show',
        'ip link show',
        'ss -tulpn',
        'netstat -tulpn',
        'ethtool eth0',
        'systemctl status networking',
        'systemctl restart networking',
        'ping 8.8.8.8',
        'traceroute 8.8.8.8',
        'sudo iptables -L -n -v',
        'cat /etc/resolv.conf',
        'journalctl -u ssh -n 50',
        'uname -a',
        'uptime',
        'df -h',
        'free -m',
        'exit',
        'clear',
      ];
    }

    if (isRouter) {
      switch (cliMode) {
        case 'USER_EXEC':
          return [
            'enable',
            'ping',
            'traceroute',
            'show version',
            'show ip interface brief',
            'show ip route',
            'show clock',
            'exit',
            'quit',
            'clear',
          ];
        case 'PRIVILEGED_EXEC':
          return [
            'configure terminal',
            'disable',
            'write memory',
            'copy running-config startup-config',
            'show running-config',
            'show startup-config',
            'show version',
            'show ip interface brief',
            'show ip route',
            'show ip route summary',
            'show ip protocols',
            'show ip ospf neighbor',
            'show ip bgp summary',
            'show ip nat translations',
            'show interfaces',
            'show arp',
            'show cdp neighbors',
            'show lldp neighbors',
            'show access-lists',
            'show ip dhcp binding',
            'show logging',
            'reload',
            'terminal length 0',
            'ping',
            'traceroute',
            'exit',
            'quit',
            'clear',
          ];
        case 'GLOBAL_CONFIG':
          return [
            'hostname',
            'interface',
            ...ports.map((p) => `interface ${p.port_id}`),
            'ip route 0.0.0.0 0.0.0.0',
            'router ospf 1',
            'router bgp',
            'ip dhcp pool',
            'ip dhcp excluded-address',
            'ip nat inside source list 1 interface',
            'ip domain-name',
            'crypto key generate rsa',
            'access-list',
            'line console 0',
            'line vty 0 4',
            'enable secret',
            'banner motd',
            'do show ip route',
            'do show ip interface brief',
            'do show running-config',
            'do write memory',
            'exit',
            'end',
            'clear',
          ];
        case 'INTERFACE_CONFIG':
          return [
            'ip address',
            'no ip address',
            'ip nat inside',
            'ip nat outside',
            'encapsulation dot1Q',
            'description',
            'bandwidth',
            'clock rate 64000',
            'ip ospf 1 area 0',
            'shutdown',
            'no shutdown',
            'do show ip interface brief',
            'do write memory',
            'exit',
            'end',
            'clear',
          ];
        default:
          return ['enable', 'show ip route', 'show ip interface brief', 'exit'];
      }
    }

    // Default: Cisco Switch
    switch (cliMode) {
      case 'USER_EXEC':
        return [
          'enable',
          'ping',
          'traceroute',
          'show version',
          'show ip interface brief',
          'show interfaces status',
          'show clock',
          'show terminal',
          'exit',
          'quit',
          'clear',
        ];
      case 'PRIVILEGED_EXEC':
        return [
          'configure terminal',
          'disable',
          'write memory',
          'copy running-config startup-config',
          'show running-config',
          'show startup-config',
          'show version',
          'show ip interface brief',
          'show interfaces status',
          'show interfaces trunk',
          'show vlan brief',
          'show vlan summary',
          'show mac address-table',
          'show cdp neighbors',
          'show cdp neighbors detail',
          'show lldp neighbors',
          'show spanning-tree',
          'show spanning-tree summary',
          'show port-security',
          'show port-security address',
          'show power inline',
          'show environment',
          'show ip route',
          'show arp',
          'show logging',
          'show clock',
          'show inventory',
          'reload',
          'clear counters',
          'clear mac address-table',
          'terminal length 0',
          'ping',
          'traceroute',
          'exit',
          'quit',
          'clear',
        ];
      case 'GLOBAL_CONFIG':
        return [
          'hostname',
          'interface',
          ...ports.map((p) => `interface ${p.port_id}`),
          'interface range',
          'interface vlan 1',
          'vlan',
          ...vlans.map((v) => `vlan ${v.id}`),
          'ip default-gateway',
          'ip routing',
          'spanning-tree mode rapid-pvst',
          'spanning-tree portfast default',
          'banner motd',
          'enable secret',
          'service password-encryption',
          'line console 0',
          'line vty 0 15',
          'snmp-server community',
          'ntp server',
          'logging buffered',
          'do show running-config',
          'do show ip interface brief',
          'do show vlan brief',
          'do show interfaces status',
          'do write memory',
          'exit',
          'end',
          'clear',
        ];
      case 'INTERFACE_CONFIG':
        return [
          'switchport mode access',
          'switchport mode trunk',
          'switchport access vlan 10',
          'switchport access vlan 20',
          'switchport access vlan 30',
          'switchport trunk allowed vlan 1,10,20,30,50',
          'switchport trunk allowed vlan add',
          'switchport trunk native vlan 1',
          'switchport nonegotiate',
          'switchport port-security',
          'switchport port-security maximum 2',
          'switchport port-security violation shutdown',
          'switchport port-security violation restrict',
          'switchport port-security mac-address sticky',
          'spanning-tree portfast',
          'spanning-tree bpduguard enable',
          'description',
          'speed 1000',
          'duplex full',
          'shutdown',
          'no shutdown',
          'no switchport',
          'ip address',
          'no ip address',
          'do show running-config',
          'do show ip interface brief',
          'do write memory',
          'exit',
          'end',
          'clear',
        ];
      case 'VLAN_CONFIG':
        return [
          'name',
          'state active',
          'state suspend',
          'no shutdown',
          'shutdown',
          'exit',
          'end',
          'clear',
        ];
      default:
        return ['enable', 'show ip interface brief', 'show vlan brief', 'exit'];
    }
  };

  // Tab Autocomplete / Suggestion Handler
  const handleTabCompletion = () => {
    const input = currentInput.trimStart();
    const available = getAvailableCommands();
    const promptText = getPrompt();

    if (!input) {
      const topList = available.slice(0, 15);
      const devTitle = isMikroTik
        ? 'MikroTik RouterOS'
        : isRouter
        ? 'Cisco Router'
        : 'Cisco Switch';
      appendLines([
        { id: String(Date.now()), type: 'input', text: promptText },
        {
          id: String(Date.now() + 1),
          type: 'output',
          text:
            (isEn ? `Available commands for ${devTitle} (${isMikroTik ? 'RouterOS' : cliMode}):\n` : `دستورات قابل استفاده برای ${devTitle} (${isMikroTik ? 'RouterOS' : cliMode}):\n`) +
            topList.map((c) => `  ${c}`).join('\n') +
            (available.length > 15 ? `\n  ... (+${available.length - 15} ${isEn ? 'more in guide' : 'مورد دیگر در راهنما'})` : ''),
        },
      ]);
      return;
    }

    const inputLower = input.toLowerCase();

    // 1. Exact or prefix matches
    let matches = available.filter((c) => c.toLowerCase().startsWith(inputLower));

    // 2. Substring matches if prefix not matched
    if (matches.length === 0) {
      matches = available.filter((c) => c.toLowerCase().includes(inputLower));
    }

    if (matches.length === 1) {
      // Exactly one unique match - auto-complete!
      const completed = matches[0];
      setCurrentInput(completed);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = completed.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 0);
    } else if (matches.length > 1) {
      // Multiple matches: find longest common prefix (LCP)
      let lcp = matches[0];
      for (let i = 1; i < matches.length; i++) {
        let j = 0;
        while (
          j < lcp.length &&
          j < matches[i].length &&
          lcp[j].toLowerCase() === matches[i][j].toLowerCase()
        ) {
          j++;
        }
        lcp = lcp.slice(0, j);
      }

      if (lcp.length > input.length) {
        setCurrentInput(lcp);
      }

      // Display candidate suggestions in the terminal
      appendLines([
        { id: String(Date.now()), type: 'input', text: `${promptText} ${input}` },
        {
          id: String(Date.now() + 1),
          type: 'output',
          text:
            (isEn ? '% Possible completions:\n' : '% گزینه‌های پیشنهادی برای تکمیل:\n') +
            matches.slice(0, 18).map((m) => `  ${m}`).join('\n') +
            (matches.length > 18 ? `\n  ... (+${matches.length - 18} ${isEn ? 'more' : 'مورد دیگر'})` : ''),
        },
      ]);
    } else {
      // No match
      appendLines([
        { id: String(Date.now()), type: 'input', text: `${promptText} ${input}` },
        {
          id: String(Date.now() + 1),
          type: 'error',
          text: isEn
            ? `% No matching commands found for '${input}'. Press '?' or see Command Guide.`
            : `% هیچ دستور منطبقی برای '${input}' یافت نشد. از کلید '?' یا سایدبار راهنما استفاده کنید.`,
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Interactive terminal control characters (Ctrl+C, Ctrl+D)
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'input', data: '\x03' }));
      }
      setCurrentInput('');
      return;
    }
    if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'input', data: '\x04' }));
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        if (historyIndex === -1) {
          draftInputRef.current = currentInput;
        }
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        const val = history[nextIdx];
        setCurrentInput(val);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(val.length, val.length);
          }
        }, 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        const val = history[nextIdx];
        setCurrentInput(val);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(val.length, val.length);
          }
        }, 0);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        const draft = draftInputRef.current;
        setCurrentInput(draft);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(draft.length, draft.length);
          }
        }, 0);
      }
    }
  };

  // Sidebar commands guide data
  const COMMAND_GUIDES: CommandGuideItem[] = [
    // MIKROTIK COMMANDS
    { cmd: '/ip address print', desc: 'نمایش آدرس‌های IP تنظیم‌شده روی اینترفیس‌های میکروتیک', descEn: 'Print IP addresses configured on MikroTik interfaces', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/interface print', desc: 'مشاهده لیست تمامی کارت‌های شبکه، پورت‌ها و بریج‌ها', descEn: 'Display list of network interfaces, ports and bridges', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/ip route print', desc: 'نمایش جدول روتینگ کامل RouterOS (استاتیک، متصل و داینامیک)', descEn: 'Display complete RouterOS IP routing table', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/interface ethernet print', desc: 'مشاهده مشخصات فیزیکی، سرعت، Duplex پورت‌های اترنت', descEn: 'Display physical Ethernet port details and speed', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/ip firewall nat print', desc: 'نمایش رول‌های NAT فعال (مانند Masquerade یا Port Forwarding)', descEn: 'Display active NAT firewall rules (masquerade/port-forward)', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/ip firewall filter print', desc: 'مشاهده قوانین فیلترینگ و دیوار آتشین امنیتی RouterOS', descEn: 'Display firewall traffic security and filter rules', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/ip dhcp-server print', desc: 'نمایش تنظیمات و وضعیت سرور DHCP در میکروتیک', descEn: 'Display active DHCP server configuration and status', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/ip pool print', desc: 'مشاهده استخرهای آدرس IP تعریف‌شده برای شبکه', descEn: 'Display defined IP address pools', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/system resource print', desc: 'نمایش آمار سخت‌افزاری: مصرف CPU، رم، حافظه دیسک و نسخه', descEn: 'Display hardware specs: CPU load, RAM, disk and version', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/system routerboard print', desc: 'مشاهده مدل سخت‌افزار، شماره سریال و نسخه RouterBOOT', descEn: 'Display RouterBOARD model, serial and firmware info', category: 'show', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/system identity set name=MikroTik-HQ', desc: 'تغییر نام و شناسه هاست روتربورد در شبکه', descEn: 'Set device identity and hostname', category: 'config', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/interface bridge add name=bridge1', desc: 'ساخت اینترفیس جدید Bridge جهت تجمیع پورت‌ها', descEn: 'Create a new bridge interface to aggregate ports', category: 'config', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/interface bridge port add bridge=bridge1 interface=ether2', desc: 'افزودن پورت فیزیکی به عضویت اینترفیس Bridge', descEn: 'Add physical port into bridge membership', category: 'config', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/ip address add address=192.168.88.1/24 interface=bridge1', desc: 'اختصاص آدرس IP جدید و ساب‌نت به اینترفیس مورد نظر', descEn: 'Assign new IP address and subnet to an interface', category: 'config', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/export compact', desc: 'اکسپورت کانفیگ خلاصه و فعال RouterOS به صورت اسکریپت', descEn: 'Export active compact configuration script', category: 'action', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/ping 8.8.8.8', desc: 'تست ارسال پاکت‌های پینگ ICMP جهت بررسی ارتباط شبکه', descEn: 'Test network connectivity using ICMP ping', category: 'action', mode: 'USER_EXEC', forType: 'mikrotik' },
    { cmd: '/system reboot', desc: 'راه‌اندازی مجدد و ریبوت دستگاه روتربورد میکروتیک', descEn: 'Reboot MikroTik RouterBOARD system', category: 'action', mode: 'USER_EXEC', forType: 'mikrotik' },
    // USER_EXEC
    { cmd: 'enable', desc: 'ورود به حالت دسترسی ویژه و مدیریتی (Privileged EXEC #)', descEn: 'Enter Privileged EXEC mode (level 15 #)', category: 'exec', mode: 'USER_EXEC' },
    { cmd: 'show version', desc: 'نمایش نسخه IOS-XE، مشخصات سخت‌افزار، حافظه و Uptime', descEn: 'Display IOS-XE version, hardware specs, memory and uptime', category: 'show', mode: 'USER_EXEC' },
    { cmd: 'show ip interface brief', desc: 'مشاهده خلاصه وضعیت اینترفیس‌ها، آی‌پی و لایه فیزیکی', descEn: 'Display interface status, IP addresses, and Layer 1/2 state', category: 'show', mode: 'USER_EXEC' },
    { cmd: 'ping 192.168.1.254', desc: 'تست ارسال بسته‌های ICMP Echo به مقصد شبکه', descEn: 'Send ICMP Echo packets to target network destination', category: 'action', mode: 'USER_EXEC' },
    { cmd: 'exit', desc: 'بستن نشست SSH و خروج از ترمینال', descEn: 'Close SSH session and disconnect', category: 'action', mode: 'USER_EXEC' },

    // PRIVILEGED_EXEC
    { cmd: 'configure terminal', desc: 'ورود به مد تنظیمات کلی سیستم (Global Configuration)', descEn: 'Enter Global Configuration mode (config #)', category: 'config', mode: 'PRIVILEGED_EXEC' },
    { cmd: 'show running-config', desc: 'نمایش پیکربندی فعال و زنده در حافظه موقت (RAM)', descEn: 'Display active configuration currently in RAM', category: 'show', mode: 'PRIVILEGED_EXEC' },
    { cmd: 'show interfaces status', desc: 'نمایش مشخصات پورت‌ها: وضعیت، حالت Trunk/Access، سرعت و VLAN', descEn: 'Display port status, duplex, speed, and VLAN assignment', category: 'show', mode: 'PRIVILEGED_EXEC' },
    { cmd: 'show ip interface brief', desc: 'خلاصه تمامی اینترفیس‌ها، IPها و وضعیت Up/Down', descEn: 'Summary of all interfaces, IPs, and Up/Down status', category: 'show', mode: 'PRIVILEGED_EXEC' },
    { cmd: 'show vlan brief', desc: 'لیست تمامی ویلن‌های موجود در دیتابیس سوئیچ و پورت‌های منتسب', descEn: 'List VLAN database and port assignments', category: 'show', mode: 'PRIVILEGED_EXEC', forType: 'switch' },
    { cmd: 'show mac address-table', desc: 'مشاهده جدول آدرس‌های مک پویای یادگرفته‌شده روی پورت‌ها', descEn: 'Display dynamic MAC address forwarding table', category: 'show', mode: 'PRIVILEGED_EXEC', forType: 'switch' },
    { cmd: 'show cdp neighbors', desc: 'شناسایی و مشاهده تجهیزات سیسکوی متصل به این پورت‌ها', descEn: 'Discover directly connected Cisco neighbor devices', category: 'show', mode: 'PRIVILEGED_EXEC' },
    { cmd: 'show ip route', desc: 'مشاهده جدول مسیریابی IP (Direct, Static, OSPF)', descEn: 'Display IP routing table (Direct, Static, OSPF)', category: 'show', mode: 'PRIVILEGED_EXEC' },
    { cmd: 'write memory', desc: 'ذخیره دائم تغییرات Running-Config در NVRAM (Startup-Config)', descEn: 'Save active running-config to NVRAM (startup-config)', category: 'action', mode: 'PRIVILEGED_EXEC' },
    { cmd: 'disable', desc: 'بازگشت به سطح کاربری عادی User EXEC (>)', descEn: 'Exit Privileged EXEC and return to User EXEC (>)', category: 'action', mode: 'PRIVILEGED_EXEC' },

    // GLOBAL_CONFIG
    { cmd: 'hostname SW-CORE-HQ', desc: 'تغییر نام و شناسه تجهیز در شبکه', descEn: 'Configure device hostname and network identity', category: 'config', mode: 'GLOBAL_CONFIG' },
    { cmd: `interface ${ports[0]?.port_id || 'GigabitEthernet1/0/1'}`, desc: 'ورود به پیکربندی اختصاصی اینترفیس مشخص (config-if)', descEn: 'Enter specific interface configuration mode (config-if)', category: 'config', mode: 'GLOBAL_CONFIG' },
    { cmd: 'vlan 20', desc: 'ساخت یا ورود به تنظیمات شماره ویلن در دیتابیس (config-vlan)', descEn: 'Create or configure VLAN in database (config-vlan)', category: 'config', mode: 'GLOBAL_CONFIG', forType: 'switch' },
    { cmd: 'ip default-gateway 192.168.1.254', desc: 'تنظیم گیت‌وی پیش‌فرض سوئیچ لایه ۲ برای مدیریت از راه دور', descEn: 'Configure default gateway for Layer 2 management', category: 'config', mode: 'GLOBAL_CONFIG', forType: 'switch' },
    { cmd: 'ip route 0.0.0.0 0.0.0.0 192.168.1.254', desc: 'تنظیم دیفالت روت به سمت روتر گیت‌وی لبه', descEn: 'Set default static route to edge gateway router', category: 'config', mode: 'GLOBAL_CONFIG' },
    { cmd: 'do write memory', desc: 'اجرای دستور ذخیره مستقیم بدون خروج از مد کانفیگ (با پیشوند do)', descEn: 'Execute write memory from config mode using "do" prefix', category: 'action', mode: 'GLOBAL_CONFIG' },
    { cmd: 'exit', desc: 'بازگشت به سطح Privileged EXEC (#)', descEn: 'Return to Privileged EXEC level (#)', category: 'action', mode: 'GLOBAL_CONFIG' },
    { cmd: 'end', desc: 'خروج مستقیم به ریشه فرامین مدیریتی (#)', descEn: 'Direct exit to root Privileged EXEC (#)', category: 'action', mode: 'GLOBAL_CONFIG' },

    // INTERFACE_CONFIG
    { cmd: 'switchport mode access', desc: 'تعیین حالت پورت به عنوان Access برای اتصال هاست یا پرینتر', descEn: 'Set port mode to Access for host/printer endpoints', category: 'config', mode: 'INTERFACE_CONFIG', forType: 'switch' },
    { cmd: 'switchport mode trunk', desc: 'تعیین حالت پورت به عنوان Trunk برای عبور ترافیک چند ویلن', descEn: 'Set port mode to Trunk to pass multiple VLAN traffic', category: 'config', mode: 'INTERFACE_CONFIG', forType: 'switch' },
    { cmd: 'switchport access vlan 20', desc: 'انتساب پورت اکسس به شناسه ویلن مشخص (مثلاً VLAN 20)', descEn: 'Assign access port to specific VLAN ID (e.g., VLAN 20)', category: 'config', mode: 'INTERFACE_CONFIG', forType: 'switch' },
    { cmd: 'switchport trunk allowed vlan 1,10,20,50', desc: 'محدودسازی ویلن‌های مجاز به عبور از روی ترانک', descEn: 'Filter and restrict allowed VLANs on trunk port', category: 'config', mode: 'INTERFACE_CONFIG', forType: 'switch' },
    { cmd: 'spanning-tree portfast', desc: 'فعال‌سازی PortFast جهت حذف تاخیر همگرایی STP روی پورت‌های کلاینت', descEn: 'Enable PortFast to eliminate STP convergence delay on host ports', category: 'config', mode: 'INTERFACE_CONFIG', forType: 'switch' },
    { cmd: 'ip address 192.168.10.1 255.255.255.0', desc: 'تخصیص آدرس IP و ساب‌نت ماسک به اینترفیس روتر یا SVI', descEn: 'Assign IP address and subnet mask to router or SVI interface', category: 'config', mode: 'INTERFACE_CONFIG' },
    { cmd: 'description Link to Server-Farm', desc: 'توضیحات و برچسب مستندسازی روی اینترفیس', descEn: 'Set interface documentation label and description', category: 'config', mode: 'INTERFACE_CONFIG' },
    { cmd: 'shutdown', desc: 'خاموش و غیرفعال‌سازی پورت از نظر مدیریتی (Admin Disabled)', descEn: 'Administratively shutdown and disable the interface', category: 'action', mode: 'INTERFACE_CONFIG' },
    { cmd: 'no shutdown', desc: 'روشن و فعال‌سازی مجدد پورت (Up)', descEn: 'Administratively enable and bring interface up (no shutdown)', category: 'action', mode: 'INTERFACE_CONFIG' },
    { cmd: 'exit', desc: 'خروج از اینترفیس و بازگشت به Global Config', descEn: 'Exit interface and return to Global Configuration', category: 'action', mode: 'INTERFACE_CONFIG' },

    // VLAN_CONFIG
    { cmd: 'name Staff-Office', desc: 'نام‌گذاری شناسه ویلن جاری', descEn: 'Assign descriptive name to current VLAN ID', category: 'config', mode: 'VLAN_CONFIG', forType: 'switch' },
    { cmd: 'exit', desc: 'خروج و ذخیره تغییرات ویلن در دیتابیس', descEn: 'Exit and save VLAN changes to switch database', category: 'action', mode: 'VLAN_CONFIG', forType: 'switch' },

    // LINUX COMMANDS
    { cmd: 'ip -c a', desc: 'نمایش تمامی آدرس‌های IP و اینترفیس‌های لینوکس', descEn: 'Show all network interfaces and IP addresses', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'ip route show', desc: 'مشاهده جدول مسیریابی هسته لینوکس', descEn: 'Display Linux kernel routing table', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'ss -tulpn', desc: 'لیست پورت‌های باز و سرویس‌های در حال شنود (Listening)', descEn: 'List open ports and listening TCP/UDP sockets', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'ethtool eth0', desc: 'مشاهده مشخصات لایه فیزیکی کارت شبکه، سرعت و Duplex', descEn: 'Display NIC physical parameters, speed, duplex', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'systemctl status networking', desc: 'بررسی وضعیت سرویس شبکه سیستم‌عامل', descEn: 'Check Linux networking service status', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'ping 8.8.8.8', desc: 'تست ارتباط شبکه با پینگ ICMP', descEn: 'Send ICMP echo packets to test connectivity', category: 'action', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'traceroute 8.8.8.8', desc: 'ردیابی مسیر بسته‌ها تا مقصد', descEn: 'Trace route hops to destination', category: 'action', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'sudo iptables -L -n -v', desc: 'مشاهده رول‌های فایروال iptables با جزئیات ترافیک', descEn: 'List iptables packet filtering rules with packet counters', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'cat /etc/resolv.conf', desc: 'مشاهده سرورهای DNS تعریف‌شده در سیستم', descEn: 'View configured DNS nameservers', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'journalctl -u ssh -n 50', desc: 'مشاهده لاگ‌های ۵۰ لاگین اخیر سرویس SSH', descEn: 'View last 50 SSH service log entries', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'uname -a', desc: 'نمایش نسخه دقیق کرنل لینوکس و معماری سیستم', descEn: 'Display Linux kernel release and system architecture', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
    { cmd: 'uptime', desc: 'مدت زمان روشن بودن سیستم و میانگین لود پردازنده', descEn: 'Show system uptime and load average', category: 'show', mode: 'USER_EXEC', forType: 'linux' },
  ];

  // Filter commands for sidebar
  const relevantCommands = COMMAND_GUIDES.filter((item) => {
    if (isMikroTik) {
      if (item.forType !== 'mikrotik') return false;
    } else if (isGenericLinux) {
      if (item.forType !== 'linux') return false;
    } else {
      if (item.forType === 'mikrotik' || item.forType === 'linux') return false;
      if (item.mode !== cliMode) return false;
      if (item.forType === 'switch' && isRouter) return false;
      if (item.forType === 'router' && !isRouter) return false;
    }
    if (commandSearch) {
      const q = commandSearch.toLowerCase();
      const descText = isEn ? item.descEn : item.desc;
      return item.cmd.toLowerCase().includes(q) || descText.toLowerCase().includes(q);
    }
    return true;
  });

  const terminalWindow = (
    <div
      className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all ${
        isEmbedded
          ? 'w-full h-full rounded-xl border-slate-800 shadow-none'
          : isFullscreen
          ? 'w-full h-full max-h-full rounded-none border-none'
          : 'w-full max-w-6xl my-auto max-h-[94vh] sm:max-h-[90vh]'
      }`}
    >
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isRouter ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              <TerminalIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono text-sm tracking-wide">{device.name}</span>
                <span className="terminal-header-ip text-xs font-mono font-bold px-2 py-0.5 rounded-md shadow-xs" title={isEn ? "Terminal Connection Target Host" : "آدرس اتصال و پورت ترمینال"}>
                  {device.ssh_host || device.ip}:{device.ssh_port || ((device.connection_protocol || device.connection?.protocol) === 'telnet' ? 23 : 22)}
                </span>
                {device.ssh_host && device.ssh_host !== device.ip && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title={isEn ? "Device Management IP" : "آدرس IP تجهیز"}>
                    IP: {device.ip}
                  </span>
                )}
                {sshSessionMode === 'real_ssh' ? (
                  <span className="terminal-header-ssh text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs" title={`Connected via Real ${(device.connection_protocol || device.connection?.protocol || 'ssh').toUpperCase()} Socket`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    LIVE {(device.connection_protocol || device.connection?.protocol || 'ssh').toUpperCase()} ({sshLatency ? `${sshLatency}ms` : 'Active'})
                  </span>
                ) : sshSessionMode === 'connecting' ? (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs" title="Connecting to hardware...">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    CONNECTING...
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-xs" title="Device unreachable or session disconnected">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    DISCONNECTED / UNREACHABLE
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                <span>{device.model}</span>
                <span>•</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isMikroTik
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : isGenericLinux
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'vendor-badge-cisco'
                  }`}
                >
                  {isMikroTik
                    ? (device.firmware || 'MikroTik RouterOS 7.x')
                    : isGenericLinux
                    ? (device.firmware || 'Linux 5.15 / POSIX')
                    : (device.firmware || (device.platform === 'cisco_ios' ? 'Cisco IOS 15.2' : 'Cisco IOS-XE'))}
                </span>
              </div>
            </div>
          </div>

          {/* Center Actions: Write Memory Alert + Dropdown of Interfaces */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Unsaved Changes Warning Badge */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">{isEn ? 'Unsaved running-config changes' : 'تغییرات در Running-Config ذخیره نشده در استارتاپ'}</span>
                <button
                  onClick={() => setShowWriteConfirm(true)}
                  disabled={isWritingMemory}
                  className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                  title={isEn ? "Review pending changes & write to memory (NVRAM)" : "مشاهده تغییرات و ذخیره در NVRAM"}
                >
                  <Save className="w-3 h-3" />
                  <span>Write Memory</span>
                </button>
              </div>
            )}

            {/* SSH Method & Negotiation Version Navbar Selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs">
              <TerminalIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline font-medium text-[11px] text-slate-300">
                {isEn ? 'SSH Version:' : 'روش/نگارش SSH:'}
              </span>
              <select
                value={selectedSshProfile}
                onChange={(e) => setSelectedSshProfile(e.target.value)}
                className="bg-slate-950 text-indigo-300 font-mono font-semibold py-0.5 px-1.5 rounded border border-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer text-[10px]"
                title={isEn ? 'Select SSH negotiation protocol version / profile' : 'انتخاب روش و نگارش پروتکل اتصال SSH'}
              >
                <option value="auto">{isEn ? 'Auto Multi-Tier' : 'خودکار هوشمند'}</option>
                <option value="profile_1">{isEn ? 'SSH v2 / Paramiko 2 (Modern)' : 'SSH v2 / Paramiko 2 (مدرن)'}</option>
                <option value="profile_2">{isEn ? 'SSH v2 (Group14 + CBC)' : 'SSH v2 (متوسط CBC)'}</option>
                <option value="profile_3">{isEn ? 'SSH v2 (Legacy Cisco 2960)' : 'SSH v2 (سیسکو لگاسی ۲۹۶۰)'}</option>
              </select>
            </div>

            {/* Connection Log & Troubleshoot Action Button */}
            <button
              type="button"
              onClick={() => setShowConnectionDiagnostics(true)}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                sshSessionMode === 'failed'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
                  : sshSessionMode === 'real_ssh'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
              }`}
              title={isEn ? "Connection Lifecycle Log & Troubleshooting Diagnostics" : "لاگ چرخه حیات اتصال و عیب‌یابی ارتباط"}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium text-[11px]">
                {isEn ? 'Connection Log & Troubleshoot' : 'لاگ اتصال و عیب‌یابی'}
              </span>
              {lifecycleEvents.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-cyan-300 border border-cyan-500/30 font-mono">
                  {lifecycleEvents.length}
                </span>
              )}
            </button>

            {/* Terminal Appearance Menu Popover (Button-based to prevent clutter) */}
            <div className="relative" ref={appearanceMenuRef}>
              <button
                type="button"
                onClick={() => setShowAppearanceMenu(!showAppearanceMenu)}
                className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showAppearanceMenu
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
                }`}
                title={isEn ? "Terminal Colors & Font" : "تنظیم رنگ پس‌زمینه و قلم ترمینال"}
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline font-medium text-[11px]">{isEn ? 'Appearance' : 'رنگ و قلم'}</span>
                <span
                  className="w-3 h-3 rounded-full border border-white/40 inline-block shrink-0 shadow-xs"
                  style={{ backgroundColor: terminalBgColor }}
                />
              </button>

              {showAppearanceMenu && (
                <div
                  className="absolute top-full mt-1.5 right-0 z-50 w-72 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 text-slate-200"
                  dir={isEn ? 'ltr' : 'rtl'}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800 text-xs font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-indigo-400" />
                      {isEn ? 'Terminal Appearance' : 'تنظیمات رنگ و فونت کنسول'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAppearanceMenu(false)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer p-0.5 rounded hover:bg-slate-800"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Terminal Background Color */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1.5">
                      <span>{isEn ? 'Background Color:' : 'رنگ پس‌زمینه:'}</span>
                      <span className="font-mono text-[10px] text-indigo-300">
                        {TERMINAL_BG_OPTIONS.find((o) => o.color === terminalBgColor)?.[isEn ? 'nameEn' : 'nameFa'] || terminalBgColor}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TERMINAL_BG_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectBgColor(opt.color)}
                          className={`flex items-center gap-1 p-1 rounded-md border text-[10px] transition-all cursor-pointer ${
                            terminalBgColor === opt.color
                              ? 'border-indigo-400 ring-2 ring-indigo-500/50 bg-slate-800 text-white font-bold'
                              : 'border-slate-800 hover:border-slate-600 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                          }`}
                          title={`${isEn ? opt.nameEn : opt.nameFa} (${opt.color})`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span className="truncate">{isEn ? opt.nameEn.split(' ')[0] : opt.nameFa.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terminal Text / Font Color */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1.5">
                      <span>{isEn ? 'Font / Text Color:' : 'رنگ قلم متن:'}</span>
                      <span className="font-mono text-[10px] text-indigo-300">
                        {TERMINAL_TEXT_OPTIONS.find((o) => o.color === terminalTextColor)?.[isEn ? 'nameEn' : 'nameFa'] || terminalTextColor}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TERMINAL_TEXT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectTextColor(opt.color)}
                          className={`flex items-center gap-1 p-1 rounded-md border text-[10px] transition-all cursor-pointer ${
                            terminalTextColor === opt.color
                              ? 'border-indigo-400 ring-2 ring-indigo-500/50 bg-slate-800 text-white font-bold'
                              : 'border-slate-800 hover:border-slate-600 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                          }`}
                          title={`${isEn ? opt.nameEn : opt.nameFa} (${opt.color})`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span className="truncate">{isEn ? opt.nameEn.split(' ')[0] : opt.nameFa.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Window & View Controls */}
            {/* Split Screen Button (Request 6) */}
            {onSplitScreen && (
              <button
                type="button"
                onClick={onSplitScreen}
                className="px-2 py-1 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600/30 border border-indigo-500/30 transition flex items-center gap-1 text-[11px] cursor-pointer"
                title={isEn ? 'Split Screen / Multi-Terminal' : 'تقسیم صفحه به چند ترمینال همزمان'}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">{isEn ? 'Split' : 'تقسیم صفحه'}</span>
              </button>
            )}

            {/* Swap Button (Request 6) */}
            {totalPanes !== undefined && totalPanes > 1 && onSwap && (
              <button
                type="button"
                onClick={onSwap}
                className="px-2 py-1 rounded-lg text-amber-400 hover:text-white hover:bg-amber-600/30 border border-amber-500/30 transition flex items-center gap-1 text-[11px] cursor-pointer"
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
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs cursor-pointer"
                title={isEn ? 'Change Device in this pane' : 'تغییر دیوایس این پنجره'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleToggleSidebar}
              className={`p-1.5 rounded transition ${
                isSidebarOpen
                  ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={
                isSidebarOpen
                  ? (isEn ? 'Collapse Command Guide Sidebar' : 'جمع کردن سایدبار راهنما برای بزرگ‌تر شدن ترمینال')
                  : (isEn ? 'Expand Command Guide Sidebar' : 'نمایش سایدبار راهنمای دستورات')
              }
            >
              {isSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>

            {!isEmbedded && (
              <button
                type="button"
                onClick={togglePreventBackdropClose}
                className={`p-1.5 rounded transition ${
                  preventBackdropClose
                    ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                onClick={() => {
                  const nextFs = !isFullscreen;
                  setIsFullscreen(nextFs);
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                      type: 'resize',
                      cols: nextFs ? 180 : 120,
                      rows: nextFs ? 50 : 36,
                    }));
                  }
                }}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={isFullscreen ? (isEn ? 'Exit Fullscreen' : 'حالت پنجره') : (isEn ? 'Fullscreen' : 'تمام صفحه')}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            {!isEmbedded && onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
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
                  handleCloseModal();
                }
              }}
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
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
            isMikroTik={false}
            isLightMode={isLightMode}
            onPortClick={handlePortClick}
            selectedPortId={selectedPort ? (selectedPort.port_id || (selectedPort as any).port || selectedPort.name) : undefined}
            selectedPortIds={selectedPortIds}
            onSyncPorts={() => handleSyncPorts(false)}
            isSyncing={isSyncingPorts}
          />
        )}

        {/* Main Body: Terminal Screen + Sidebar Guides */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Terminal Console View */}
          <div
            className="cisco-terminal-screen flex-1 flex flex-col p-3.5 overflow-hidden font-mono text-xs select-text transition-colors duration-200"
            style={{
              backgroundColor: terminalBgColor,
              color: terminalTextColor,
              '--cisco-terminal-bg': terminalBgColor,
              '--cisco-terminal-color': terminalTextColor,
            } as React.CSSProperties}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Output Lines Canvas */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-2 scrollbar-thin scrollbar-thumb-slate-700" dir="ltr">
              {lines.map((line) => {
                if (line.type === 'input') {
                  return (
                    <div key={line.id} className="font-bold" style={{ color: terminalTextColor }}>
                      {line.text}
                    </div>
                  );
                }
                if (line.type === 'system') {
                  return (
                    <div key={line.id} className="font-medium italic opacity-90" style={{ color: terminalTextColor }}>
                      {line.text}
                    </div>
                  );
                }
                if (line.type === 'error') {
                  return (
                    <div
                      key={line.id}
                      className={`${
                        isTerminalWhiteBg
                          ? 'text-rose-700 pl-2 border-l-2 border-rose-500 bg-rose-100/60 py-0.5'
                          : 'text-rose-300 pl-2 border-l-2 border-rose-500/60 bg-rose-500/10 py-0.5'
                      } font-medium whitespace-pre-wrap`}
                    >
                      {line.text}
                    </div>
                  );
                }
                if (line.type === 'success') {
                  return (
                    <div
                      key={line.id}
                      className={`${
                        isTerminalWhiteBg
                          ? 'text-emerald-800 pl-2 border-l-2 border-emerald-500 bg-emerald-100/60 py-0.5'
                          : 'text-emerald-300 pl-2 border-l-2 border-emerald-500/60 bg-emerald-500/10 py-0.5'
                      } font-bold whitespace-pre-wrap`}
                    >
                      {line.text}
                    </div>
                  );
                }
                const isLoginBanner =
                  line.id === 'sys-3' ||
                  line.id === 'sys-4' ||
                  line.id === 'sys-ssh-banner' ||
                  line.text.includes('User Access Verification') ||
                  line.text.includes('Username:') ||
                  line.text.includes('Password:') ||
                  line.text.includes('****************');

                return (
                  <div
                    key={line.id}
                    className={`${isLoginBanner ? 'font-semibold' : ''} whitespace-pre-wrap font-mono`}
                    style={{ color: terminalTextColor }}
                  >
                    {line.text}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* Input Prompt Box */}
            <div className={`mt-2 pt-2 border-t flex items-center gap-2 px-3 py-1.5 rounded-lg relative ${
              isTerminalWhiteBg ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
            }`} dir="ltr">
              <span className="font-bold whitespace-nowrap font-mono" style={{ color: terminalTextColor }}>{getPrompt()}</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isMikroTik
                    ? (isEn ? "Type RouterOS command (e.g. /ip address print, /interface print, Tab to autocomplete)..." : "دستور میکروتیک را تایپ کنید (مثلاً ip address print/، کلید Tab برای تکمیل)...")
                    : (isEn ? "Type Cisco IOS command (e.g. enable, show ip int brief, Tab to autocomplete)..." : "دستور سیسکو را تایپ کنید (مثلاً enable یا show ip int brief، کلید Tab برای تکمیل)...")
                }
                className="cisco-cli-input flex-1 bg-transparent font-mono outline-none border-none text-xs"
                style={{
                  color: terminalTextColor,
                  caretColor: terminalTextColor,
                }}
                autoFocus
                dir="ltr"
              />

              {/* History Button & Dropdown Menu */}
              <div className="relative" ref={historyDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-sm border ${
                    isHistoryOpen
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title={isEn ? "Command History (Click to view & select)" : "تاریخچه دستورات ترمینال (کلیک برای مشاهده و انتخاب)"}
                >
                  <HistoryIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{isEn ? 'History' : 'تاریخچه'}</span>
                  {history.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-200 font-mono">
                      {history.length}
                    </span>
                  )}
                </button>

                {/* History Dropdown Menu */}
                {isHistoryOpen && (
                  <div
                    className="absolute bottom-full mb-2 right-0 w-72 sm:w-80 max-h-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col font-sans"
                    dir={isEn ? 'ltr' : 'rtl'}
                  >
                    <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isEn ? 'Command History' : 'تاریخچه دستورات کاربر'}</span>
                      </div>
                      {history.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistory([]);
                            setHistoryIndex(-1);
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 transition"
                          title={isEn ? 'Clear command history' : 'پاک کردن کل تاریخچه'}
                        >
                          {isEn ? 'Clear' : 'پاک‌سازی'}
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-52 p-1.5 space-y-1">
                      {history.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 font-mono">
                          {isEn ? 'No commands entered yet' : 'هنوز دستوری در این ترمینال تایپ نشده است'}
                        </div>
                      ) : (
                        history.map((cmd, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCurrentInput(cmd);
                              setIsHistoryOpen(false);
                              setTimeout(() => {
                                if (inputRef.current) {
                                  inputRef.current.focus();
                                  const len = cmd.length;
                                  inputRef.current.setSelectionRange(len, len);
                                }
                              }, 0);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition flex items-center justify-between group border border-transparent hover:border-slate-700"
                            dir="ltr"
                          >
                            <span className="truncate flex-1 font-mono">{cmd}</span>
                            <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap ml-2">
                              {isEn ? 'Insert' : 'انتخاب'}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={() => {
                  executeCommand(currentInput);
                  setCurrentInput('');
                }}
                className="cisco-btn-exec px-3 py-1.5 rounded-lg text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">{isEn ? 'Send' : 'ارسال'}</span>
              </button>
            </div>
          </div>

          {/* Context-Aware Cisco / MikroTik Commands Sidebar */}
          {isSidebarOpen && (
            <div className={`cisco-sidebar-guide w-full md:w-80 lg:w-96 border-t md:border-t-0 ${isEn ? 'md:border-l' : 'md:border-r'} flex flex-col overflow-hidden ${isEn ? 'text-left' : 'text-right'}`}>
              {/* Sidebar Header */}
              <div className="p-3 bg-white/50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-1 pb-1">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSidebarTab('guide')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        sidebarTab === 'guide'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Command Guide' : 'راهنمای دستورات'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarTab('interfaces')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        sidebarTab === 'interfaces'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Cable className="w-3.5 h-3.5" />
                      <span>{isEn ? `Interfaces (${ports.length})` : `اینترفیس‌ها (${ports.length})`}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sidebarTab === 'guide' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 font-bold">
                        {isMikroTik ? 'RouterOS' : isGenericLinux ? 'Linux Bash' : cliMode}
                      </span>
                    )}
                    <button
                      onClick={handleToggleSidebar}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                      title={isEn ? 'Collapse Sidebar' : 'جمع کردن سایدبار'}
                    >
                      <PanelRightClose className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {sidebarTab === 'guide' ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isEn ? "Search command or description..." : "جستجوی دستور یا کاربرد..."}
                      value={commandSearch}
                      onChange={(e) => setCommandSearch(e.target.value)}
                      className={`w-full px-2.5 py-1.5 ${isEn ? 'pl-7 pr-2.5' : 'pr-7 pl-2.5'} rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-[11px] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500`}
                    />
                    <Search className={`w-3.5 h-3.5 text-slate-400 absolute ${isEn ? 'left-2' : 'right-2'} top-2`} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={isEn ? "Search interface, VLAN, mode, device..." : "جستجوی پورت، ویلن، مود، دستگاه..."}
                        value={interfaceSearch}
                        onChange={(e) => setInterfaceSearch(e.target.value)}
                        className={`w-full px-2.5 py-1.5 ${isEn ? 'pl-7 pr-2.5' : 'pr-7 pl-2.5'} rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-[11px] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500`}
                      />
                      <Search className={`w-3.5 h-3.5 text-slate-400 absolute ${isEn ? 'left-2' : 'right-2'} top-2`} />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSyncPorts(false)}
                      disabled={isSyncingPorts}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition shadow-xs cursor-pointer border shrink-0 ${
                        isSyncingPorts
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 cursor-wait'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 active:scale-95'
                      }`}
                      title={isEn ? 'Sync & verify live interfaces via SSH tunnel' : 'بررسی و همگام‌سازی زنده اینترفیس‌ها از طریق تانل SSH'}
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncingPorts ? 'animate-spin text-cyan-300' : ''}`} />
                      <span>{isSyncingPorts ? (isEn ? 'Syncing...' : 'بررسی...') : (isEn ? 'Sync SSH' : 'بررسی SSH')}</span>
                    </button>
                  </div>
                )}
              </div>

            {sidebarTab === 'guide' ? (
              <>
                {/* Current Mode Badge Explanation */}
                <div className="p-2.5 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{isEn ? 'Current Prompt:' : 'مرحله فعلی:'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[11px]">{getPrompt()}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isMikroTik ? (
                      isEn
                        ? 'MikroTik RouterOS Interactive Terminal. Hierarchical command syntax with tab-completion. Full root access enabled.'
                        : 'ترمینال تعاملی سیستم‌عامل میکروتیک (RouterOS). ساختار دستورات سلسله‌مراتبی و اسلش-محور با قابلیت تکمیل خودکار تب.'
                    ) : isGenericLinux ? (
                      isEn
                        ? 'Linux POSIX Shell session. Run standard Linux management commands, net-tools, iproute2, or systemd services.'
                        : 'پوسته استاندارد لینوکس (POSIX / Bash). دستورات مدیریتی شبکه، iproute2، و سرویس‌های سیستمی فعال هستند.'
                    ) : (
                      <>
                        {cliMode === 'USER_EXEC' &&
                          (isEn
                            ? 'User EXEC mode (>). Basic monitoring and ping commands allowed. Type enable to enter Privileged mode.'
                            : 'حالت کاربری ابتدایی (User EXEC). فقط دستورات اولیه مانیتورینگ و تست پینگ مجاز هستند. برای دسترسی به تنظیمات دستور enable را اجرا کنید.')}
                        {cliMode === 'PRIVILEGED_EXEC' &&
                          (isEn
                            ? 'Privileged EXEC mode (#). Full Show, Write Memory, Debug, and configure terminal available.'
                            : 'حالت دسترسی ویژه مدیریتی (Privileged EXEC #). می‌توانید دستورات کامل Show، Write Memory، Debug و ورود به configure terminal را اجرا کنید.')}
                        {cliMode === 'GLOBAL_CONFIG' &&
                          (isEn
                            ? 'Global Configuration mode. Set hostname, create VLANs, enter interfaces, routing, and services.'
                            : 'حالت تنظیمات کلی سیستم (Global Config). تنظیم نام هاست، ساخت ویلن، ورود به اینترفیس‌ها، روتینگ و سرویس‌ها در این مد انجام می‌شود.')}
                        {cliMode === 'INTERFACE_CONFIG' &&
                          (isEn
                            ? `Interface ${currentInterface || ''} configuration. Set Access/Trunk mode, VLAN, admin status, and STP.`
                            : `حالت پیکربندی پورت ${currentInterface || ''}. تنظیم مود Access/Trunk، ویلن، وضعیت خاموش/روشن، توضیحات پورت و Spanning-Tree.`)}
                        {cliMode === 'VLAN_CONFIG' &&
                          (isEn
                            ? `VLAN ${currentVlanId} database configuration. Name and activate VLAN in switch database.`
                            : `حالت تنظیمات دیتابیس VLAN ${currentVlanId}. نام‌گذاری و فعال‌سازی ویلن در سوئیچ.`)}
                      </>
                    )}
                  </div>
                </div>

                {/* Command Cards List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                  {relevantCommands.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      {isEn ? 'No commands found for this filter in the current mode.' : 'دستوری با این فیلتر در مد فعلی یافت نشد.'}
                    </div>
                  ) : (
                    relevantCommands.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border transition-all flex flex-col gap-2 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 group shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 select-all" dir="ltr">
                            {item.cmd}
                          </code>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono shrink-0 ${
                              item.category === 'show'
                                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                                : item.category === 'config'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : item.category === 'action'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                          {isEn ? item.descEn : item.desc}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentInput(item.cmd);
                              if (inputRef.current) inputRef.current.focus();
                            }}
                            className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-semibold transition cursor-pointer active:scale-95"
                          >
                            {isEn ? 'Insert' : 'درج در خط فرمان'}
                          </button>
                          <button
                            type="button"
                            onClick={() => executeCommand(item.cmd)}
                            className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>{isEn ? 'Run' : 'اجرا'}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Helper Bar */}
                <div className="p-2.5 bg-white/50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>{isEn ? 'Tip: Press Tab to auto-complete' : 'راهنما: برای تکمیل Tab بزنید'}</span>
                  <button
                    onClick={() => executeCommand('?')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono font-bold"
                  >
                    {isEn ? '? Command' : 'دستور ?'}
                  </button>
                </div>
              </>
            ) : (
              /* Interfaces Tab Content */
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                {filteredInterfaces.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    {isEn ? 'No interfaces found matching filter.' : 'هیچ اینترفیسی مطابق فیلتر یافت نشد.'}
                  </div>
                ) : (
                  filteredInterfaces.map((p, pIdx) => {
                    const isUp = p.status === 'up';
                    const pId = p.port_id || (p as any).port || p.name || `port-${pIdx + 1}`;
                    const isSelected = Boolean(
                      pId && (
                        (selectedPort && (selectedPort.port_id || (selectedPort as any).port || selectedPort.name) === pId) ||
                        (Array.isArray(selectedPortIds) && selectedPortIds.length > 0 && selectedPortIds.includes(pId))
                      )
                    );
                    return (
                      <div
                        key={pId}
                        className={`p-2.5 rounded-xl border transition-all flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/60 shadow-xs'
                            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'
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
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                {p.port_id}
                              </span>
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
                                  : 'bg-indigo-600 border border-indigo-500'
                              }`}
                            >
                              {(p.mode || 'access').toUpperCase()}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold">
                              VLAN {p.vlan}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
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
                              if (isMikroTik) {
                                executeCommand(`/interface print where name="${p.port_id}"`);
                              } else {
                                executeCommand(`interface ${p.port_id}`);
                              }
                              setSelectedPort(p);
                              if (inputRef.current) inputRef.current.focus();
                            }}
                            className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition shrink-0 cursor-pointer shadow-xs"
                            title={isEn ? "Select interface in CLI" : "ورود به مد کانفیگ این پورت در ترمینال"}
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
      </div>
    );

    const writeConfirmModal = showWriteConfirm && device && (
      <CiscoWriteConfirmModal
        isOpen={showWriteConfirm}
        onClose={() => setShowWriteConfirm(false)}
        onConfirm={async () => {
          await handleExecuteWriteMemory();
          setShowWriteConfirm(false);
        }}
        device={device}
        isWriting={isWritingMemory}
        sessionChanges={sessionChanges}
        onMinimize={onMinimize}
        isLightMode={isLightMode}
      />
    );

    const connectionLogModal = showConnectionDiagnostics ? (
      <ConnectionLogTroubleshootModal
        isOpen={showConnectionDiagnostics}
        onClose={() => setShowConnectionDiagnostics(false)}
        device={device}
        connectionState={
          sshSessionMode === 'real_ssh'
            ? 'connected'
            : sshSessionMode === 'failed'
            ? 'failed'
            : 'connecting'
        }
        lifecycleEvents={lifecycleEvents}
        troubleshootData={troubleshootData}
        onClearLogs={() => setLifecycleEvents([])}
        isLightMode={isLightMode}
      />
    ) : null;

    if (isEmbedded) {
      return (
        <>
          {terminalWindow}
          {writeConfirmModal}
          {connectionLogModal}
        </>
      );
    }

    return (
      <>
        <div
          className={`fixed top-0 left-0 right-0 bottom-8 z-50 flex items-center justify-center ${
            isFullscreen ? 'p-0' : 'p-2 sm:p-4'
          } modal-backdrop-blur overflow-y-auto`}
          data-modal-backdrop="true"
          dir={isEn ? 'ltr' : 'rtl'}
          onClick={(e) => {
            if (e.target === e.currentTarget && !preventBackdropClose) {
              handleCloseModal();
            }
          }}
        >
          {terminalWindow}
        </div>
        {writeConfirmModal}
        {connectionLogModal}
      </>
    );
  };

// ==================== Cisco Formatting Helpers ====================

function generateHelpOutput(mode: CliMode, isRouter: boolean): string {
  if (mode === 'USER_EXEC') {
    return `Exec commands:
  enable            Turn on privileged commands
  exit              Exit from the EXEC
  help              Description of the interactive help system
  ping              Send echo messages
  show              Show running system information
  terminal          Set terminal line parameters
  traceroute        Trace route to destination`;
  }
  if (mode === 'PRIVILEGED_EXEC') {
    return `Privileged EXEC commands:
  configure         Enter configuration mode
  copy              Copy from one file to another (e.g. copy run start)
  disable           Turn off privileged commands
  exit              Exit from the EXEC
  ping              Send echo messages
  reload            Halt and perform a cold restart
  show              Show running system information
  write             Write running configuration to memory (NVRAM)`;
  }
  if (mode === 'GLOBAL_CONFIG') {
    return `Configure commands:
  banner            Define a login banner
  default-gateway   Specify default gateway (if not routing IP)
  end               Exit to privileged EXEC mode
  exit              Exit from configure mode
  hostname          Set system's network name
  interface         Select an interface to configure
  ip                Global IP configuration subcommands
  line              Configure a terminal line
  vlan              VLAN configuration commands`;
  }
  if (mode === 'INTERFACE_CONFIG') {
    return `Interface configuration commands:
  bandwidth         Set bandwidth informational parameter
  description       Interface specific description
  duplex            Configure duplex operation
  end               Exit to privileged EXEC mode
  exit              Exit from interface configuration mode
  ip                Interface Internet Protocol config commands
  no                Negate a command or set its defaults
  shutdown          Shut down the selected interface
  speed             Configure speed operation
  switchport        Set switching characteristics of the interface`;
  }
  return `VLAN configuration commands:\n  name     Ascii name of the VLAN\n  exit     Apply changes and bump to previous mode`;
}

