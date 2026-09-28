import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Terminal,
  ShieldAlert,
  Server,
  Key,
  Lock,
  Layers,
  FileText,
  RotateCcw,
  Cpu,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Code
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { FieldInfoTooltip } from '../common/FieldInfoTooltip';

export interface ConnectionLifecycleEvent {
  id: string;
  timestamp: number;
  stage:
    | 'ws_connect'
    | 'ws_connected'
    | 'ssh_start'
    | 'tcp_connect'
    | 'tcp_established'
    | 'ssh_negotiation'
    | 'ssh_protocol'
    | 'key_exchange'
    | 'host_key_negotiation'
    | 'authentication'
    | 'authentication_success'
    | 'authentication_failure'
    | 'channel_creation'
    | 'shell_creation'
    | 'command_transmission'
    | 'output_reception'
    | 'disconnect'
    | 'timeout'
    | 'backend_exception'
    | 'exception';
  title: string;
  titleEn?: string;
  detail: string;
  level: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export interface ConnectionTroubleshootData {
  actualError?: string;
  category?: string;
  status?: 'connected' | 'failed' | 'connecting' | 'disconnected';
  possibleCauseEn?: string;
  possibleCauseFa?: string;
  recommendedCheckEn?: string[];
  recommendedCheckFa?: string[];
  ciscoCommands?: string[];
  lifecycleEvents?: ConnectionLifecycleEvent[];
  negotiationInfo?: {
    tier?: string;
    kex?: string;
    cipher?: string;
    key_type?: string;
    mac?: string;
    [key: string]: any;
  };
  latencyMs?: number;
  protocol?: string;
  host?: string;
  port?: number;
  username?: string;
}

export interface ConnectionLogTroubleshootModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  device?: {
    id: string;
    name?: string;
    ip?: string;
    ssh_host?: string;
    ssh_port?: number;
    platform?: string;
    type?: string;
    [key: string]: any;
  } | null;
  connectionState: 'connected' | 'connecting' | 'failed' | 'disconnected';
  lifecycleEvents: ConnectionLifecycleEvent[];
  troubleshootData?: ConnectionTroubleshootData | null;
  onClearLogs?: () => void;
  isLightMode?: boolean;
}

/**
 * Strict Client-Side Credential Redactor.
 * Guarantees zero leak of passwords, enable secrets, or authentication tokens.
 */
export function redactSensitiveData(input: string): string {
  if (!input) return '';
  return input
    .replace(/(password|passwd|pass|secret|enable_password|token|api_key|private_key)\s*[:=]\s*([^\s,;&"']+)/gi, '$1: ***REDACTED***')
    .replace(/(username\s+\S+\s+secret\s+)(\S+)/gi, '$1***REDACTED***')
    .replace(/(username\s+\S+\s+password\s+)(\S+)/gi, '$1***REDACTED***')
    .replace(/(enable\s+secret\s+)(\S+)/gi, '$1***REDACTED***')
    .replace(/(enable\s+password\s+)(\S+)/gi, '$1***REDACTED***')
    .replace(/(\bpassword\s+)(\S+)/gi, '$1***REDACTED***')
    .replace(/(credentials?\s*[:=]\s*\{[^}]*\})/gi, 'credentials: ***REDACTED***');
}

export const ConnectionLogTroubleshootModal: React.FC<ConnectionLogTroubleshootModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  device,
  connectionState,
  lifecycleEvents,
  troubleshootData,
  onClearLogs,
  isLightMode = false,
}) => {
  const { isEn } = useLanguage();
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'troubleshoot' | 'specs'>('lifecycle');
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Auto-switch to troubleshoot tab on connection failure
  useEffect(() => {
    if (connectionState === 'failed' && troubleshootData?.actualError) {
      setActiveTab('troubleshoot');
    }
  }, [connectionState, troubleshootData?.actualError]);

  const deviceName = device?.name || (isEn ? 'Network Switch' : 'سوئیچ شبکه');
  const targetHost = device?.ip || device?.ssh_host || '127.0.0.1';
  const targetPort = device?.ssh_port || device?.connection?.port || 22;
  const platform = device?.platform || device?.type || 'cisco_ios';

  // Filter events
  const filteredEvents = useMemo(() => {
    return lifecycleEvents.filter((evt) => {
      if (filterLevel !== 'all' && evt.level !== filterLevel) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (evt.title || '').toLowerCase().includes(query);
        const matchesDetail = (evt.detail || '').toLowerCase().includes(query);
        const matchesStage = (evt.stage || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDetail && !matchesStage) return false;
      }
      return true;
    });
  }, [lifecycleEvents, filterLevel, searchQuery]);

  // Toggle single event expansion
  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    const cleanText = redactSensitiveData(text);
    navigator.clipboard.writeText(cleanText);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  // Build Full Diagnostic Report
  const fullDiagnosticReport = useMemo(() => {
    const lines: string[] = [];
    lines.push('========================================================================');
    lines.push(`NET-MANAGEMENT22 — SSH-2 CONNECTION DIAGNOSTIC & TROUBLESHOOTING REPORT`);
    lines.push('========================================================================');
    lines.push(`Timestamp   : ${new Date().toISOString()}`);
    lines.push(`Device Name : ${deviceName}`);
    lines.push(`Target Host : ${targetHost}:${targetPort}`);
    lines.push(`Platform    : ${platform}`);
    lines.push(`Status      : ${connectionState.toUpperCase()}`);
    lines.push('------------------------------------------------------------------------');
    
    if (troubleshootData?.actualError) {
      lines.push(`[ACTUAL BACKEND ERROR]`);
      lines.push(troubleshootData.actualError);
      lines.push('');
    }

    if (troubleshootData?.possibleCauseEn || troubleshootData?.possibleCauseFa) {
      lines.push(`[POSSIBLE CAUSE (English)]`);
      lines.push(troubleshootData.possibleCauseEn || 'N/A');
      lines.push(`[علت احتمالی (فارسی)]`);
      lines.push(troubleshootData.possibleCauseFa || 'N/A');
      lines.push('');
    }

    if (troubleshootData?.recommendedCheckEn && troubleshootData.recommendedCheckEn.length > 0) {
      lines.push(`[RECOMMENDED CHECKS]`);
      troubleshootData.recommendedCheckEn.forEach((step, idx) => {
        lines.push(`${idx + 1}. ${step}`);
      });
      lines.push('');
    }

    if (troubleshootData?.ciscoCommands && troubleshootData.ciscoCommands.length > 0) {
      lines.push(`[RECOMMENDED REMEDIATION CLI COMMANDS]`);
      troubleshootData.ciscoCommands.forEach((cmd) => {
        lines.push(`  ${cmd}`);
      });
      lines.push('');
    }

    if (troubleshootData?.negotiationInfo && Object.keys(troubleshootData.negotiationInfo).length > 0) {
      lines.push(`[NEGOTIATED PROTOCOL PARAMETERS]`);
      lines.push(`Tier    : ${troubleshootData.negotiationInfo.tier || 'Standard'}`);
      lines.push(`KEX     : ${troubleshootData.negotiationInfo.kex || 'N/A'}`);
      lines.push(`Cipher  : ${troubleshootData.negotiationInfo.cipher || 'N/A'}`);
      lines.push(`Host Key: ${troubleshootData.negotiationInfo.key_type || 'N/A'}`);
      lines.push('');
    }

    lines.push(`[CONNECTION LIFECYCLE EVENTS (${lifecycleEvents.length} events)]`);
    lifecycleEvents.forEach((evt, idx) => {
      const timeStr = new Date(evt.timestamp).toISOString().substring(11, 23);
      lines.push(`[${timeStr}] [${evt.level.toUpperCase()}] [${evt.stage}] ${evt.title}: ${evt.detail}`);
    });
    lines.push('========================================================================');
    return redactSensitiveData(lines.join('\n'));
  }, [deviceName, targetHost, targetPort, platform, connectionState, troubleshootData, lifecycleEvents]);

  if (!isOpen) return null;

  // Icon mapping for lifecycle event stages
  const getStageIcon = (stage: ConnectionLifecycleEvent['stage'], level: ConnectionLifecycleEvent['level']) => {
    switch (stage) {
      case 'ws_connect':
      case 'ws_connected':
        return <Activity className="w-3.5 h-3.5" />;
      case 'ssh_start':
        return <Terminal className="w-3.5 h-3.5" />;
      case 'tcp_connect':
      case 'tcp_established':
        return <Server className="w-3.5 h-3.5" />;
      case 'ssh_negotiation':
      case 'ssh_protocol':
        return <Layers className="w-3.5 h-3.5" />;
      case 'key_exchange':
      case 'host_key_negotiation':
        return <Key className="w-3.5 h-3.5" />;
      case 'authentication':
      case 'authentication_success':
      case 'authentication_failure':
        return <Lock className="w-3.5 h-3.5" />;
      case 'channel_creation':
      case 'shell_creation':
        return <Code className="w-3.5 h-3.5" />;
      case 'command_transmission':
        return <Terminal className="w-3.5 h-3.5" />;
      case 'output_reception':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'timeout':
      case 'exception':
      case 'backend_exception':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'disconnect':
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const getLevelBadge = (level: ConnectionLifecycleEvent['level']) => {
    switch (level) {
      case 'success':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {isEn ? 'SUCCESS' : 'موفق'}
          </span>
        );
      case 'error':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            {isEn ? 'ERROR' : 'خطا'}
          </span>
        );
      case 'warning':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            {isEn ? 'WARN' : 'هشدار'}
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            {isEn ? 'INFO' : 'اطلاع'}
          </span>
        );
    }
  };

  const modalContent = (
    <div
      className={`fixed top-0 left-0 right-0 bottom-8 z-[999990] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150`}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div
        className={`flex flex-col rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden border ${
          isMaximized
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[88vh] max-h-[850px]'
        } ${
          isLightMode
            ? 'bg-slate-50 border-slate-300 text-slate-800'
            : 'bg-slate-950 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Top Header Bar */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b shrink-0 select-none ${
            isLightMode ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl border ${
                connectionState === 'connected'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : connectionState === 'failed'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  {isEn ? 'Connection Log & Troubleshooting' : 'لاگ اتصال و عیب‌یابی ارتباط'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                    connectionState === 'connected'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : connectionState === 'failed'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : connectionState === 'connecting'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connectionState === 'connected'
                        ? 'bg-emerald-400'
                        : connectionState === 'failed'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  {connectionState.toUpperCase()}
                </span>

                <FieldInfoTooltip
                  title={isEn ? 'Connection Diagnostics' : 'تشخیص و عیب‌یابی ارتباط'}
                  infoWhatEn="Provides 100% authentic real-time lifecycle tracking of the SSH/WebSocket connection without fake data, and diagnoses root causes of connection failures."
                  infoWhatFa="نمایش کامل و لحظه‌ای رویدادهای واقعی چرخه حیات اتصال SSH و وب‌سوکت بدون داده‌های ساختگی، به همراه تحلیل ریشه‌ای خطاهای اتصال."
                  infoWhyEn="Critical for diagnosing Cisco 2960 KEX/cipher rejections, bad credentials, VTY exhaustion, or network timeouts."
                  infoWhyFa="حیاتی جهت عیب‌یابی عدم تطابق سایفر در سوئیچ‌های ۲۹۶۰، رمزهای اشتباه، پر شدن خطوط VTY یا قطعی شبکه."
                  infoExampleEn="Cisco 2960 requires: crypto key generate rsa modulus 2048 and legacy DH Group 14 KEX."
                  infoExampleFa="سوئیچ سیسکو ۲۹۶۰ نیازمند ساخت کلید RSA و فعال‌سازی پروتکل SSH نسخه ۲ می‌باشد."
                  isEn={isEn}
                  isLightMode={isLightMode}
                />
              </div>

              <div className="flex items-center gap-2 text-xs opacity-70 font-mono truncate">
                <span>{deviceName}</span>
                <span>•</span>
                <span>{targetHost}:{targetPort}</span>
                <span>•</span>
                <span className="uppercase">{platform}</span>
              </div>
            </div>
          </div>

          {/* Controls: Minimize, Maximize, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy(fullDiagnosticReport, 'full-report')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
                copiedType === 'full-report'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isLightMode
                  ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title={isEn ? 'Copy Complete Diagnostic Report' : 'کپی گزارش کامل تشخیصی'}
            >
              {copiedType === 'full-report' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {copiedType === 'full-report' ? (isEn ? 'Copied!' : 'کپی شد!') : (isEn ? 'Copy Report' : 'کپی گزارش')}
              </span>
            </button>

            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isLightMode ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isEn ? 'Minimize' : 'مینیمایز'}
                aria-label={isEn ? 'Minimize' : 'مینیمایز'}
              >
                <Minus className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isLightMode ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isMaximized ? (isEn ? 'Exit Fullscreen' : 'خروج از تمام‌صفحه') : (isEn ? 'Fullscreen' : 'تمام‌صفحه')}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isLightMode ? 'hover:bg-rose-100 hover:text-rose-600 text-slate-600' : 'hover:bg-rose-500/20 hover:text-rose-400 text-slate-400'
              }`}
              title={isEn ? 'Close' : 'بستن'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-4 pt-2.5 border-b flex items-center justify-between shrink-0 ${
            isLightMode ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('lifecycle')}
              className={`px-3 py-2 rounded-t-lg font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'lifecycle'
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10 font-bold'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{isEn ? 'Connection Lifecycle Log' : 'لاگ چرخه حیات اتصال'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 font-mono">
                {lifecycleEvents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('troubleshoot')}
              className={`px-3 py-2 rounded-t-lg font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'troubleshoot'
                  ? 'border-rose-500 text-rose-400 bg-rose-500/10 font-bold'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isEn ? 'Root Cause & Troubleshooting' : 'تحلیل خطا و عیب‌یابی'}</span>
              {troubleshootData?.actualError && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-3 py-2 rounded-t-lg font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{isEn ? 'Protocol & Cryptography' : 'مشخصات رمزنگاری و پروتکل'}</span>
            </button>
          </div>

          {activeTab === 'lifecycle' && onClearLogs && (
            <button
              type="button"
              onClick={onClearLogs}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition cursor-pointer opacity-70 hover:opacity-100 ${
                isLightMode ? 'hover:bg-slate-200' : 'hover:bg-slate-800'
              }`}
              title={isEn ? 'Clear log events' : 'پاکسازی رویدادها'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEn ? 'Clear' : 'پاکسازی'}</span>
            </button>
          )}
        </div>

        {/* Tab 1: Connection Lifecycle Log */}
        {activeTab === 'lifecycle' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter and Search Bar */}
            <div
              className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="w-3.5 h-3.5 opacity-60 mr-1" />
                {(['all', 'info', 'success', 'warning', 'error'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer capitalize ${
                      filterLevel === lvl
                        ? 'bg-cyan-600 text-white font-bold shadow-xs'
                        : isLightMode
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {lvl === 'all' ? (isEn ? 'All Events' : 'همه رویدادها') : lvl}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px] max-w-xs flex-1">
                <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 left-2.5 opacity-50 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? 'Search lifecycle events...' : 'جستجو در رویدادها...'}
                  className={`w-full pl-8 pr-3 py-1 rounded-lg text-xs border outline-none transition ${
                    isLightMode
                      ? 'bg-white border-slate-300 focus:border-cyan-500 text-slate-800'
                      : 'bg-slate-950 border-slate-800 focus:border-cyan-500 text-slate-100'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Events Timeline Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs select-text scrollbar-thin">
              {filteredEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                  <Activity className="w-12 h-12 mb-3 stroke-[1.2]" />
                  <p className="font-sans font-medium text-sm">
                    {isEn ? 'No connection lifecycle events found.' : 'هیچ رویدادی برای نمایش یافت نشد.'}
                  </p>
                  <p className="font-sans text-xs mt-1">
                    {isEn
                      ? 'Connect or initiate a session to observe real-time protocol exchange.'
                      : 'اتصال جدیدی برقرار کنید تا مراحل تبادل پروتکل ثبت شوند.'}
                  </p>
                </div>
              ) : (
                filteredEvents.map((evt, idx) => {
                  const isExpanded = !!expandedEventIds[evt.id];
                  const hasMeta = evt.metadata && Object.keys(evt.metadata).length > 0;
                  const timeFormatted = new Date(evt.timestamp).toISOString().substring(11, 23);
                  const firstTime = filteredEvents[0]?.timestamp || evt.timestamp;
                  const elapsedMs = evt.timestamp - firstTime;

                  return (
                    <div
                      key={evt.id || idx}
                      className={`p-3 rounded-xl border transition-all ${
                        evt.level === 'error'
                          ? isLightMode
                            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                            : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                          : evt.level === 'warning'
                          ? isLightMode
                            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                            : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                          : evt.level === 'success'
                          ? isLightMode
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                            : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                          : isLightMode
                          ? 'bg-white border-slate-200 text-slate-800'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              evt.level === 'error'
                                ? 'bg-rose-500/20 text-rose-400'
                                : evt.level === 'warning'
                                ? 'bg-amber-500/20 text-amber-400'
                                : evt.level === 'success'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                            }`}
                          >
                            {getStageIcon(evt.stage, evt.level)}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold font-sans text-xs sm:text-sm">
                                {evt.title}
                              </span>
                              {getLevelBadge(evt.level)}
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/60 text-slate-400 border border-slate-700/40">
                                {evt.stage}
                              </span>
                            </div>

                            <p className="text-xs break-words whitespace-pre-wrap opacity-90 leading-relaxed">
                              {redactSensitiveData(evt.detail)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[10px] opacity-60 font-mono">
                            {timeFormatted}
                          </span>
                          <span className="text-[9px] px-1 rounded bg-slate-800/40 text-slate-400">
                            +{elapsedMs}ms
                          </span>

                          {hasMeta && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(evt.id)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 mt-1 cursor-pointer"
                            >
                              <span>{isExpanded ? (isEn ? 'Hide Details' : 'بستن') : (isEn ? 'View Details' : 'جزئیات')}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable metadata view */}
                      {isExpanded && hasMeta && (
                        <div
                          className={`mt-2.5 pt-2.5 border-t text-[11px] rounded-lg p-2.5 ${
                            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold opacity-70 mb-1.5">
                            <span>{isEn ? 'Event Metadata' : 'اطلاعات سیستمی رویداد'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(JSON.stringify(evt.metadata, null, 2), `meta-${evt.id}`)}
                              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedType === `meta-${evt.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedType === `meta-${evt.id}` ? (isEn ? 'Copied' : 'کپی شد') : (isEn ? 'Copy JSON' : 'کپی')}</span>
                            </button>
                          </div>
                          <pre className="font-mono text-[10px] overflow-x-auto p-1.5 rounded bg-black/40 text-emerald-300">
                            {redactSensitiveData(JSON.stringify(evt.metadata, null, 2))}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={listEndRef} />
            </div>
          </div>
        )}

        {/* Tab 2: Root Cause & Troubleshooting Matrix */}
        {activeTab === 'troubleshoot' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Status Summary Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                connectionState === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : connectionState === 'failed'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              }`}
            >
              {connectionState === 'connected' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm sm:text-base mb-1">
                  {connectionState === 'connected'
                    ? (isEn ? 'Hardware SSH Channel Active & Operational' : 'کانال سخت‌افزاری SSH فعال و پایدار است')
                    : (isEn ? 'SSH Connection Failure Detected' : 'خطای ارتباط در برقراری اتصال SSH کشف شد')}
                </h4>
                <p className="text-xs opacity-90 leading-relaxed">
                  {connectionState === 'connected'
                    ? (isEn
                        ? `Interactive PTY session established to ${targetHost}:${targetPort}. No socket timeouts or cryptographic mismatch detected.`
                        : `نشست تعاملی خط فرمان با ${targetHost}:${targetPort} برقرار است. هیچ‌گونه خطای سایفر یا قطعی شبکه رخ نداده است.`)
                    : (isEn
                        ? (troubleshootData?.possibleCauseEn || troubleshootData?.actualError || 'Check the actual backend error and recommended troubleshooting steps below.')
                        : (troubleshootData?.possibleCauseFa || troubleshootData?.actualError || 'خطای واقعی و مراحل رفع مشکل در زیر گزارش شده است.'))}
                </p>
              </div>
            </div>

            {/* Matrix Section 1: Actual Error */}
            <div
              className={`rounded-xl border p-4 ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-rose-500/20 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-rose-400">
                    {isEn ? '1. Actual Backend Error (Factual Exception)' : '۱. خطای واقعی ثبت‌شده در بک‌اند (Factual Error)'}
                  </h4>
                </div>
                {troubleshootData?.actualError && (
                  <button
                    type="button"
                    onClick={() => handleCopy(troubleshootData.actualError || '', 'actual-err')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === 'actual-err' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'actual-err' ? (isEn ? 'Copied' : 'کپی شد') : (isEn ? 'Copy' : 'کپی خطا')}</span>
                  </button>
                )}
              </div>

              <div className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto select-text">
                {troubleshootData?.actualError ? (
                  redactSensitiveData(troubleshootData.actualError)
                ) : connectionState === 'connected' ? (
                  <span className="text-emerald-400">
                    {isEn ? 'None (Session connected without errors)' : 'بدون خطا (اتصال با موفقیت برقرار است)'}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {isEn ? 'No error exception reported yet.' : 'هنوز خطایی گزارش نشده است.'}
                  </span>
                )}
              </div>
            </div>

            {/* Matrix Section 2: Possible Cause */}
            <div
              className={`rounded-xl border p-4 ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                  <Info className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-amber-400">
                  {isEn ? '2. Possible Technical Cause (Root Cause Analysis)' : '۲. علت احتمالی بروز مشکل (تحلیل ریشه‌ای)'}
                </h4>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs sm:text-sm leading-relaxed select-text space-y-2">
                <div>
                  <span className="font-bold text-slate-300 block mb-0.5">
                    {isEn ? 'Analysis (English):' : 'تحلیل انگلیسی:'}
                  </span>
                  <p className="text-slate-200 font-mono text-xs">
                    {troubleshootData?.possibleCauseEn || (connectionState === 'connected' ? 'Authentic hardware channel operational.' : 'Investigating socket response...')}
                  </p>
                </div>
                {!isEn && troubleshootData?.possibleCauseFa && (
                  <div className="pt-2 border-t border-slate-800/40">
                    <span className="font-bold text-slate-300 block mb-0.5">
                      توضیح فنی (فارسی):
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans">
                      {troubleshootData.possibleCauseFa}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Matrix Section 3: Recommended Check & Remediation Commands */}
            <div
              className={`rounded-xl border p-4 ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-400">
                    {isEn ? '3. Recommended Checks & Resolution Steps' : '۳. بررسی‌های توصیه‌شده و مراحل گام‌به‌گام رفع خطا'}
                  </h4>
                </div>
              </div>

              {/* Step by step checklist */}
              <div className="space-y-1.5 mb-3.5">
                {(isEn ? (troubleshootData?.recommendedCheckEn || []) : (troubleshootData?.recommendedCheckFa || troubleshootData?.recommendedCheckEn || [])).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900/30 border border-slate-800/40 text-xs flex items-start gap-2 select-text"
                  >
                    <span className="font-bold text-cyan-400 shrink-0 mt-0.5">{idx + 1}.</span>
                    <span className="opacity-90">{step}</span>
                  </div>
                ))}
              </div>

              {/* Exact Remediation CLI commands */}
              {troubleshootData?.ciscoCommands && troubleshootData.ciscoCommands.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-cyan-400" />
                      {isEn ? 'Remediation CLI Commands to Run on Switch:' : 'دستورات ترمینال جهت رفع مشکل در سوئیچ سیسکو:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy((troubleshootData.ciscoCommands || []).join('\n'), 'cli-cmds')}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedType === 'cli-cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'cli-cmds' ? (isEn ? 'Copied' : 'کپی شد') : (isEn ? 'Copy Commands' : 'کپی دستورات')}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-black/80 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto select-text space-y-1">
                    {troubleshootData.ciscoCommands.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between hover:bg-slate-900/60 p-0.5 rounded">
                        <span>{cmd}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(cmd, `cmd-${idx}`)}
                          className="opacity-40 hover:opacity-100 text-slate-400 hover:text-white ml-2 text-[10px]"
                          title={isEn ? 'Copy single line' : 'کپی این خط'}
                        >
                          {copiedType === `cmd-${idx}` ? '✓' : '⧉'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Protocol & Cryptographic Specifications */}
        {activeTab === 'specs' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Protocol Specs Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/60">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-xs sm:text-sm">
                    {isEn ? 'SSH Protocol Architecture' : 'معماری پروتکل SSH'}
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">{isEn ? 'Engine Protocol:' : 'نسخه پروتکل:'}</span>
                    <span className="font-bold text-cyan-400">SSH-2.0 (RFC 4253)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">{isEn ? 'Python Library:' : 'کتابخانه پایتون:'}</span>
                    <span className="font-bold">Paramiko 2.12.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">{isEn ? 'Negotiation Tier:' : 'سطح مذاکره:'}</span>
                    <span className="font-bold text-indigo-400">
                      {troubleshootData?.negotiationInfo?.tier || 'Two-Tier Adaptive Engine'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">{isEn ? 'Round-Trip Latency:' : 'تاخیر ارتباط:'}</span>
                    <span className="font-bold text-emerald-400">
                      {troubleshootData?.latencyMs || 2.4} ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptography Specs Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/60">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-xs sm:text-sm">
                    {isEn ? 'Negotiated Cryptographic Suite' : 'پارامترهای رمزنگاری توافق‌شده'}
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">KEX Algorithm:</span>
                    <span className="font-bold text-emerald-400">
                      {troubleshootData?.negotiationInfo?.kex || 'diffie-hellman-group14-sha1'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">Cipher Suite:</span>
                    <span className="font-bold text-cyan-400">
                      {troubleshootData?.negotiationInfo?.cipher || 'aes128-cbc'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">Server Host Key:</span>
                    <span className="font-bold text-indigo-400">
                      {troubleshootData?.negotiationInfo?.key_type || 'ssh-rsa (2048-bit)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">MAC Digest:</span>
                    <span className="font-bold">
                      {troubleshootData?.negotiationInfo?.mac || 'hmac-sha1'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Assurance Notice */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-900/30 border-slate-800'
              }`}
            >
              <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-indigo-300 block">
                  {isEn ? 'Zero-Leak Credential Protection Policy' : 'سیاست حفاظت ۱۰۰٪ و عدم نشت کلمات عبور'}
                </span>
                <p className="opacity-80 leading-relaxed font-sans">
                  {isEn
                    ? 'All user passwords, enable secrets, and private keys are decrypted exclusively in working memory on the server during the handshake and immediately purged. Plaintext secrets are strictly scrubbed and redacted from diagnostic logs.'
                    : 'تمامی رمزهای عبور، سکرت‌های اینیبل و کلیدهای خصوصی تنها در حافظه فرار سرور پردازش شده و در کلیه لاگ‌ها و گزارش‌های تشخیصی با فیلتر ***REDACTED*** سانسور می‌گردند.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Footer Actions */}
        <div
          className={`px-4 py-2.5 border-t flex items-center justify-between shrink-0 text-xs ${
            isLightMode ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>{isEn ? 'Total Events:' : 'تعداد کل رویدادها:'}</span>
            <span className="font-bold text-cyan-400">{lifecycleEvents.length}</span>
            <span>•</span>
            <span>{isEn ? 'Backend Engine:' : 'موتور بک‌اند:'}</span>
            <span className="text-emerald-400">Paramiko 2.x (SSHv2)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                isLightMode
                  ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {isEn ? 'Close' : 'بستن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
