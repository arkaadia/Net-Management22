import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Terminal,
  Cpu,
  Shield,
  Layers,
  Zap,
  Activity,
  User,
  Hash,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Server,
  Network,
  Clock,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { SshV2TestFetchResult } from '../../services/api';

export interface SshV2TestResultCardProps {
  result: SshV2TestFetchResult;
  isLightMode: boolean;
  isEn: boolean;
  onOpenTerminal: () => void;
}

export const SshV2TestResultCard: React.FC<SshV2TestResultCardProps> = ({
  result,
  isLightMode,
  isEn,
  onOpenTerminal,
}) => {
  const [showCommandsLog, setShowCommandsLog] = useState(false);
  const [showRawOutput, setShowRawOutput] = useState(false);

  const isSuccess = result.success && result.connected;
  const negotiation = result.negotiation || result.ssh_negotiation;

  const cryptoSummary = [
    negotiation?.cipher ? `Cipher: ${negotiation.cipher}` : null,
    negotiation?.kex ? `KEX: ${negotiation.kex}` : null,
    negotiation?.key_type ? `HostKey: ${negotiation.key_type}` : null,
    negotiation?.mac ? `MAC: ${negotiation.mac}` : null,
  ].filter(Boolean).join(' | ');

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isSuccess
          ? isLightMode
            ? 'bg-slate-50/90 border-emerald-300 shadow-xs'
            : 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : isLightMode
          ? 'bg-rose-50/80 border-rose-300'
          : 'bg-rose-950/30 border-rose-500/40'
      }`}
    >
      {/* 1. Header Bar: Connection Status & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          {isSuccess ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isSuccess
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                }`}
              >
                {isSuccess
                  ? isEn
                    ? 'SSH-2 Authenticated'
                    : 'احراز هویت SSH-2 موفق'
                  : isEn
                  ? 'SSH-2 Connection Failed'
                  : 'خطای اتصال SSH-2'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {result.ip}:{result.port || 22}
              </span>
              {result.latency_ms !== undefined && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {result.latency_ms} ms
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {isEn ? result.message_en || result.message : result.message_fa || result.message}
            </p>
          </div>
        </div>

        {/* Action: Open Interactive SSH Terminal */}
        {isSuccess && (
          <button
            type="button"
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isEn ? 'Open Interactive SSH Terminal' : 'باز کردن ترمینال تعاملی SSH'}</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </button>
        )}
      </div>

      {/* 2. Failure Diagnostics & Actionable Troubleshooting Recommendations */}
      {!isSuccess && (
        <div className="my-3 space-y-2.5">
          {/* Root Cause Box */}
          <div
            className={`p-3 rounded-lg border text-xs ${
              isLightMode
                ? 'bg-rose-100/70 border-rose-300 text-rose-900'
                : 'bg-rose-950/60 border-rose-700/60 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-[11px] uppercase tracking-wide block mb-0.5">
                  {isEn ? 'Diagnosed Cause of Failure:' : 'علت اصلی عدم برقراری ارتباط:'}
                </span>
                <p className="font-semibold text-xs leading-relaxed">
                  {result.diagnostic?.cause
                    ? isEn
                      ? result.diagnostic.cause_en || result.diagnostic.cause
                      : result.diagnostic.cause_fa || result.diagnostic.cause
                    : result.error || result.message}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Steps Box */}
          {((result.diagnostic?.solution_steps && result.diagnostic.solution_steps.length > 0) ||
            (result.troubleshooting && result.troubleshooting.length > 0)) && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                isLightMode
                  ? 'bg-amber-50/80 border-amber-300/80 text-amber-950'
                  : 'bg-amber-950/40 border-amber-600/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-[11px] text-amber-700 dark:text-amber-400">
                <Shield className="w-4 h-4" />
                <span>{isEn ? 'Recommended Actionable Steps to Resolve:' : 'دستورالعمل‌های حل مشکل و برقراری موفق ارتباط:'}</span>
              </div>
              <ul className="space-y-1.5 pl-4 rtl:pl-0 rtl:pr-4 list-disc text-[11px] leading-relaxed">
                {(result.diagnostic
                  ? isEn
                    ? result.diagnostic.solution_steps_en || result.diagnostic.solution_steps
                    : result.diagnostic.solution_steps_fa || result.diagnostic.solution_steps
                  : result.troubleshooting || []
                ).map((step, sIdx) => (
                  <li key={sIdx} className="font-medium">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Structured Telemetry Badges (Only on Success) */}
      {isSuccess && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-3 text-xs">
          {/* Box 1: SSH Protocol & Crypto */}
          <div
            className={`p-2.5 rounded-lg border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-[11px]">{isEn ? 'SSH Protocol' : 'پروتکل SSH'}</span>
            </div>
            <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {result.ssh_protocol || 'SSH-2.0'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate" title={cryptoSummary || result.banner}>
              {cryptoSummary || result.remote_version || result.banner || 'Paramiko 2.x Engine'}
            </div>
          </div>

          {/* Box 2: Authenticated User & CLI Prompt */}
          <div
            className={`p-2.5 rounded-lg border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-[11px]">{isEn ? 'Auth User / Prompt' : 'کاربر / پرامپت'}</span>
            </div>
            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
              {result.authenticated_user || 'admin'}
            </div>
            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 truncate" title={result.device_prompt || result.device_hostname}>
              {result.device_prompt || result.device_hostname || (isEn ? 'Shell active' : 'شل فعال')}
            </div>
          </div>

          {/* Box 3: Detected Vendor & Hardware Model */}
          <div
            className={`p-2.5 rounded-lg border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
              <Server className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-semibold text-[11px]">{isEn ? 'Vendor & Model' : 'سازنده و مدل'}</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
              {result.vendor || (isEn ? 'Unknown' : 'نامشخص')}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate" title={result.model || ''}>
              {result.model || (isEn ? 'Model not reported' : 'مدل گزارش نشده')}
            </div>
          </div>

          {/* Box 4: Firmware / Version & Interfaces */}
          <div
            className={`p-2.5 rounded-lg border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-[11px]">{isEn ? 'OS Version / Ports' : 'نسخه سیستم‌عامل / پورت'}</span>
            </div>
            <div className="font-mono text-slate-900 dark:text-slate-100 truncate font-semibold">
              {result.version || result.firmware || (isEn ? 'Not reported' : 'گزارش نشده')}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isEn ? 'Discovered Ports' : 'پورت‌های شناسایی شده'}:{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{result.total_ports || (result.ports ? result.ports.length : 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed System Information Attributes (When available) */}
      {isSuccess && (
        <div
          className={`rounded-lg p-2.5 text-xs mb-2 border ${
            isLightMode ? 'bg-white/60 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              {isEn ? 'Live System Telemetry Details' : 'مشخصات تله‌متری زنده تجهیز'}
            </span>
            {result.system_info?.uptime && (
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.system_info.uptime}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">{isEn ? 'Hostname' : 'نام تجهیز'}</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate block">
                {result.device_hostname || result.hostname || (isEn ? 'Not set' : 'تعریف نشده')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">{isEn ? 'Serial Number' : 'شماره سریال'}</span>
              <span className="text-slate-800 dark:text-slate-200 truncate block">
                {result.serial_number || (isEn ? 'Not available' : 'موجود نیست')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">{isEn ? 'Base MAC' : 'مک آدرس اصلی'}</span>
              <span className="text-slate-800 dark:text-slate-200 truncate block">
                {result.mac || (isEn ? 'Not available' : 'موجود نیست')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">{isEn ? 'Power Supply / Watts' : 'منبع تغذیه / توان'}</span>
              <span className="text-slate-800 dark:text-slate-200 truncate block">
                {result.power?.power_supplies
                  ? `${result.power.power_supplies} PSU (${result.power.power_watts || 120}W)`
                  : (isEn ? 'Standard' : 'استاندارد')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Real Command Execution Audit & Errors */}
      {result.commands_executed && result.commands_executed.length > 0 && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setShowCommandsLog((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isEn
                  ? `Executed Commands Audit (${result.commands_executed.length})`
                  : `بررسی دستورات اجرا شده (${result.commands_executed.length})`}
              </span>
              {result.command_errors && result.command_errors.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30">
                  {result.command_errors.length} {isEn ? 'unsupported/errors' : 'خطا/پشتیبانی‌نشده'}
                </span>
              )}
            </span>
            {showCommandsLog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCommandsLog && (
            <div
              className={`mt-1.5 p-2 rounded-lg border space-y-1.5 text-xs font-mono ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              {result.commands_executed.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border ${
                    item.status === 'success'
                      ? isLightMode
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-emerald-950/20 border-emerald-900/40'
                      : isLightMode
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-rose-950/30 border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">$ {item.command}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  {item.error && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{item.error}</span>
                    </div>
                  )}

                  {item.output_preview && (
                    <pre className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap font-mono">
                      {item.output_preview}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raw Output Toggle */}
      {result.raw_output && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setShowRawOutput((prev) => !prev)}
            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>{showRawOutput ? (isEn ? 'Hide Raw CLI Buffer' : 'بستن خروجی خام CLI') : (isEn ? 'View Raw CLI Buffer' : 'مشاهده خروجی خام CLI')}</span>
          </button>
          {showRawOutput && (
            <pre
              className={`mt-1 p-2 rounded-lg text-[10px] font-mono max-h-48 overflow-y-auto border whitespace-pre-wrap ${
                isLightMode ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              {result.raw_output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
