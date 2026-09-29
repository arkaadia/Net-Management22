import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Minus,
  Plus,
  Server,
  Router as RouterIcon,
  Wifi,
  Shield,
  MapPin,
  Terminal,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Cpu,
  Lock,
  Unlock,
  Network,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  FileCode2,
  Zap,
  Globe,
  ExternalLink,
  Trash2,
  BookmarkPlus,
} from 'lucide-react';
import { Device, DeviceType, DevicePlatform, ConnectionMode, SwitchPort, ConfigTemplate, DeviceWebConfig, isMikroTikDevice } from '../types';
import { fetchTemplates, testDeviceConnection, pingHost, fetchDevices, sshV2TestAndFetch, executeSshConnect, SshV2TestFetchResult } from '../services/api';
import { useLanguage } from '../i18n';
import { getDevicePortComment } from '../data/portSpecs';
import { CiscoTerminalModal } from './CiscoTerminalModal';
import { MikroTikTerminalModal } from './MikroTikTerminalModal';
import { FieldInfoTooltip } from './common/FieldInfoTooltip';
import { VaultPasswordPickerModal } from './vault/VaultPasswordPickerModal';
import { SshV2TestResultCard } from './ssh-v2/SshV2TestResultCard';

export interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onAdd: (device: Partial<Device>) => Promise<Device | void>;
  onOpenTerminal?: (device: Device) => void;
  onDeviceCreatedWithTemplate?: (device: Device, templateId: string) => void;
  isLightMode?: boolean;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  onAdd,
  onOpenTerminal,
  onDeviceCreatedWithTemplate,
  isLightMode: propIsLightMode,
}) => {
  const { isRtl, isEn } = useLanguage();

  const isLightMode = propIsLightMode ?? (typeof document !== 'undefined' && (
    document.querySelector('.theme-light') !== null ||
    document.documentElement.classList.contains('light') ||
    localStorage.getItem('panel_theme') === 'light' ||
    localStorage.getItem('theme_mode') === 'light'
  ));

  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [platform, setPlatform] = useState<DevicePlatform>('cisco_ios');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('ssh');
  const [type, setType] = useState<DeviceType>('switch');
  const [role, setRole] = useState('Access Switch');
  const [model, setModel] = useState('Cisco Catalyst 2960X-48FPS-L');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [unit, setUnit] = useState('');
  const [rack, setRack] = useState('');
  const [totalPorts, setTotalPorts] = useState(24);
  const [serialNumber, setSerialNumber] = useState('');
  const [mac, setMac] = useState('');
  const [firmware, setFirmware] = useState('');
  const [uptime, setUptime] = useState('');
  const [powerSupplies, setPowerSupplies] = useState<number>(1);
  const [powerWatts, setPowerWatts] = useState<number>(120);
  const [masterSessionId, setMasterSessionId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [cdpEnabled, setCdpEnabled] = useState(true);
  const [lldpEnabled, setLldpEnabled] = useState(true);
  const [snmpCommunity, setSnmpCommunity] = useState('public');

  // SSH / Telnet Credentials
  const [connectionProtocol, setConnectionProtocol] = useState<'ssh' | 'telnet'>('ssh');
  const [sshHost, setSshHost] = useState('');
  const [sshPort, setSshPort] = useState(22);
  const [winboxPort, setWinboxPort] = useState(8291);
  const [sshUsername, setSshUsername] = useState('admin');
  const [sshPassword, setSshPassword] = useState('');
  const [enablePassword, setEnablePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSshToVault, setSaveSshToVault] = useState(false);
  const [saveEnableToVault, setSaveEnableToVault] = useState(false);
  const [isVaultPickerOpen, setIsVaultPickerOpen] = useState(false);
  const [vaultPickerTarget, setVaultPickerTarget] = useState<'password' | 'enable'>('password');

  // Web Config URLs (e.g. iLO, ESXi, RouterOS WebFig, Web GUI)
  const [webConfigs, setWebConfigs] = useState<DeviceWebConfig[]>([]);

  const handleAddWebConfig = () => {
    setWebConfigs((prev) => [
      ...prev,
      {
        id: `wc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: '',
        url: '',
      },
    ]);
  };

  const handleUpdateWebConfig = (index: number, field: 'title' | 'url', value: string) => {
    setWebConfigs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveWebConfig = (index: number) => {
    setWebConfigs((prev) => prev.filter((_, i) => i !== index));
  };

  // States for live discovery & telemetry faceplate
  const [discoveredPorts, setDiscoveredPorts] = useState<SwitchPort[]>([]);
  const [isLockedByDiscovery, setIsLockedByDiscovery] = useState(false);
  const [portViewMode, setPortViewMode] = useState<'grid' | 'table'>('grid');
  const [isPortsExpanded, setIsPortsExpanded] = useState(false);
  const [discoverySource, setDiscoverySource] = useState<string | null>(null);

  const [isTestingSsh, setIsTestingSsh] = useState(false);
  const [sshTestResult, setSshTestResult] = useState<{ success: boolean; message: string; latency_ms?: number } | null>(null);
  const [isTestingSshV2, setIsTestingSshV2] = useState(false);
  const [sshV2Result, setSshV2Result] = useState<SshV2TestFetchResult | null>(null);
  const [isConnectingSsh, setIsConnectingSsh] = useState(false);
  const [selectedSshProfile, setSelectedSshProfile] = useState<string>('auto');
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingTestResult, setPingTestResult] = useState<{ success: boolean; message: string; latency_ms?: number } | null>(null);

  // Config Templates & Initial Deployment
  const [templates, setTemplates] = useState<ConfigTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Physical Hierarchy Suggestions
  const [hierarchyBuildings, setHierarchyBuildings] = useState<string[]>([]);
  const [hierarchyFloors, setHierarchyFloors] = useState<string[]>([]);
  const [hierarchyUnits, setHierarchyUnits] = useState<string[]>([]);
  const [hierarchyRacks, setHierarchyRacks] = useState<string[]>([]);

  // Existing devices for duplicate IP / Connection target warnings
  const [existingDevices, setExistingDevices] = useState<Device[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock toggle: prevent backdrop click from closing modal (enabled by default)
  const [preventBackdropClose, setPreventBackdropClose] = useState<boolean>(true);

  const togglePreventBackdropClose = () => {
    setPreventBackdropClose((prev) => !prev);
  };

  // Duplicate device detection (non-blocking warning)
  const duplicateDevice = React.useMemo(() => {
    const cleanIp = ip.trim();
    const cleanHost = sshHost.trim();
    if (!cleanIp && !cleanHost) return null;
    return existingDevices.find((d) => {
      const dIp = (d.ip || '').trim();
      const dHost = ((d.connection as any)?.host || d.ssh_host || '').trim();
      if (cleanIp && (dIp === cleanIp || dHost === cleanIp)) return true;
      if (cleanHost && (dIp === cleanHost || dHost === cleanHost)) return true;
      return false;
    }) || null;
  }, [existingDevices, ip, sshHost]);

  // Direct SSH Terminal state for "Introduce New Device"
  const [directTerminalDev, setDirectTerminalDev] = useState<Device | null>(null);

  // Submit action dropdown state & quick notice (placed before any conditional return)
  type SubmitAction = 'save_close' | 'save_new' | 'save_terminal';
  const [isSubmitMenuOpen, setIsSubmitMenuOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleOpenDirectTerminal = () => {
    const targetHost = (sshHost || ip || '').trim();
    const constructedDevice: Device = {
      id: `dev-preview-${Date.now()}`,
      name: name.trim() || targetHost || 'New Device',
      ip: ip.trim() || targetHost,
      type: type,
      role: role || 'Access Switch',
      model: model.trim() || (platform === 'mikrotik_routeros' ? 'MikroTik RouterBoard' : 'Cisco Switch'),
      total_ports: totalPorts,
      mac: mac || '00:00:00:00:00:00',
      building: building || '',
      floor: floor || '',
      unit: unit || '',
      rack: rack || '',
      is_online: true,
      cdp_enabled: true,
      lldp_enabled: true,
      connection_protocol: connectionProtocol,
      ssh_host: targetHost,
      ssh_port: Number(sshPort) || (connectionProtocol === 'telnet' ? 23 : 22),
      ssh_username: sshUsername.trim() || 'admin',
      ssh_password: sshPassword,
      enable_password: enablePassword,
      platform: platform,
    };

    if (onOpenTerminal) {
      onOpenTerminal(constructedDevice);
    } else {
      setDirectTerminalDev(constructedDevice);
    }
  };

  // Reset and populate defaults on modal open
  useEffect(() => {
    if (!isOpen) return;

    setName('');
    setIp('');
    setPlatform('cisco_ios');
    setConnectionMode('ssh');
    setType('switch');
    setRole('Access Switch');
    setModel('Cisco Catalyst 2960X-48FPS-L');
    setTotalPorts(24);
    setSerialNumber('');
    setMac('');
    setFirmware('');
    setUptime('');
    setPowerSupplies(1);
    setPowerWatts(120);
    setMasterSessionId(null);
    setIsOnline(true);
    setCdpEnabled(true);
    setLldpEnabled(true);
    setSnmpCommunity('public');
    setConnectionProtocol('ssh');
    setSshHost('');
    setSshPort(22);
    setSshUsername('admin');
    setSshPassword('');
    setEnablePassword('');
    setShowPassword(false);
    setSaveSshToVault(false);
    setSaveEnableToVault(false);
    setDiscoveredPorts([]);
    setIsLockedByDiscovery(false);
    setIsPortsExpanded(false);
    setDiscoverySource(null);
    setSshTestResult(null);
    setSshV2Result(null);
    setIsTestingSshV2(false);
    setIsConnectingSsh(false);
    setSelectedSshProfile('auto');
    setPingTestResult(null);
    setError(null);
    setSelectedTemplateId('');
    setPreventBackdropClose(true);
    setIsSubmitMenuOpen(false);
    setSuccessNotice(null);

    // Fetch templates
    fetchTemplates()
      .then((res) => {
        if (res && Array.isArray(res.templates)) {
          setTemplates(res.templates);
        }
      })
      .catch(() => {});

    // Load physical hierarchy from localStorage and live devices
    const loadHierarchy = async () => {
      try {
        const HIERARCHY_STORAGE_KEY = 'nettopology_physical_hierarchy_v2';
        let savedBuildings: string[] = [];
        let savedFloors: Record<string, string[]> = {};
        let savedUnits: Record<string, string[]> = {};
        let savedRacks: Record<string, string[]> = {};

        try {
          const raw = localStorage.getItem(HIERARCHY_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.buildings)) savedBuildings = parsed.buildings;
            if (parsed.floors && typeof parsed.floors === 'object') savedFloors = parsed.floors;
            if (parsed.units && typeof parsed.units === 'object') savedUnits = parsed.units;
            if (parsed.racks && typeof parsed.racks === 'object') savedRacks = parsed.racks;
          }
        } catch (e) {}

        const devRes = await fetchDevices().catch(() => ({ devices: [] }));
        const liveDevices = devRes?.devices || [];
        setExistingDevices(liveDevices);

        const bldgsSet = new Set<string>(savedBuildings);
        const floorsSet = new Set<string>();
        const unitsSet = new Set<string>();
        const racksSet = new Set<string>();

        Object.values(savedFloors).forEach((list) => list.forEach((item) => floorsSet.add(item)));
        Object.values(savedUnits).forEach((list) => list.forEach((item) => unitsSet.add(item)));
        Object.values(savedRacks).forEach((list) => list.forEach((item) => racksSet.add(item)));

        liveDevices.forEach((d) => {
          if (d.building) bldgsSet.add(d.building);
          if (d.floor) floorsSet.add(d.floor);
          if (d.unit) unitsSet.add(d.unit);
          if (d.rack) racksSet.add(d.rack);
        });

        const bList = Array.from(bldgsSet).filter(Boolean);
        const fList = Array.from(floorsSet).filter(Boolean);
        const uList = Array.from(unitsSet).filter(Boolean);
        const rList = Array.from(racksSet).filter(Boolean);

        setHierarchyBuildings(bList);
        setHierarchyFloors(fList);
        setHierarchyUnits(uList);
        setHierarchyRacks(rList);

        if (bList.length > 0 && !building) setBuilding(bList[0]);
        if (fList.length > 0 && !floor) setFloor(fList[0]);
        if (uList.length > 0 && !unit) setUnit(uList[0]);
        if (rList.length > 0 && !rack) setRack(rList[0]);
      } catch (err) {}
    };

    loadHierarchy();
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen && !directTerminalDev) return null;

  const handleProtocolChange = (proto: 'ssh' | 'telnet') => {
    setConnectionProtocol(proto);
    if (proto === 'telnet' && sshPort === 22) {
      setSshPort(23);
    } else if (proto === 'ssh' && sshPort === 23) {
      setSshPort(22);
    }
  };

  const handlePlatformChange = (newPlatform: DevicePlatform) => {
    setPlatform(newPlatform);
    if (newPlatform === 'mikrotik_routeros') {
      if (!model || model.includes('Cisco') || model.includes('Ubuntu')) {
        setModel('MikroTik RouterBOARD CRS328-24P-4S+RM');
      }
      setRole('Access Switch');
      setSshUsername('admin');
      setSshPassword('');
    } else if (newPlatform === 'generic_linux') {
      if (!model || model.includes('Cisco') || model.includes('MikroTik')) {
        setModel('Ubuntu 22.04 LTS / OpenSwitch');
      }
      setRole('Edge Gateway');
      setSshUsername('root');
      setSshPassword('');
    } else if (newPlatform === 'cisco_ios_xe') {
      if (!model || model.includes('2960') || model.includes('MikroTik') || model.includes('Ubuntu')) {
        setModel('Cisco Catalyst 9300-24P');
      }
      setSshUsername('admin');
      setSshPassword('cisco123');
    } else if (newPlatform === 'cisco_ios') {
      if (!model || model.includes('9300') || model.includes('MikroTik') || model.includes('Ubuntu')) {
        setModel('Cisco Catalyst 2960X-48FPS-L');
      }
      setSshUsername('admin');
      setSshPassword('cisco123');
    }
  };

  const handleTestSsh = async (forcedSimulate: boolean = false) => {
    const targetHost = (sshHost.trim() || ip.trim());
    if (!targetHost && !forcedSimulate) {
      setError(isEn ? `Please enter a target host or IP for ${connectionProtocol.toUpperCase()} connection` : `لطفاً ابتدا آدرس IP تجهیز را وارد کنید`);
      return;
    }
    try {
      setIsTestingSsh(true);
      setSshTestResult(null);
      setError(null);
      const res = await testDeviceConnection({
        ip: targetHost || '192.168.1.1',
        ssh_host: targetHost,
        ssh_port: Number(sshPort) || (connectionProtocol === 'telnet' ? 23 : 22),
        ssh_username: sshUsername.trim(),
        ssh_password: sshPassword,
        enable_password: enablePassword,
        protocol: connectionProtocol,
        connection_protocol: connectionProtocol,
        platform,
        connection_mode: connectionMode,
        simulate: forcedSimulate || connectionMode === 'simulator',
        lang: isEn ? 'en' : 'fa',
      });

      if (res.success) {
        const hw = res.hardware;
        const pwr = res.power;

        // Auto-fill Management IP Address based on SSH test result / target host
        const effectiveIp = ((res as any).ip || (hw as any)?.ip || targetHost).trim();
        if (effectiveIp) {
          setIp(effectiveIp);
        }

        const detectedHostname = hw?.hostname || res.hostname || '';
        if (detectedHostname) {
          setName(detectedHostname);
        } else if (!name) {
          const lastOctet = targetHost.split('.').pop() || '01';
          setName(`SW-CAT-${lastOctet}`);
        }

        // Auto-detect and set Hardware Platform & OS
        const detectedPlatform = (hw as any)?.platform_detected || (res as any).platform_detected || (res as any).platform;
        const combText = `${res.raw_status_output || ''} ${(res as any).raw_output || ''} ${hw?.model || res.model || ''} ${hw?.os_version || res.firmware || ''} ${(res as any).banner || ''}`.toLowerCase();
        
        let newPlatform: DevicePlatform = platform;
        if (detectedPlatform && ['cisco_ios', 'cisco_ios_xe', 'mikrotik_routeros', 'generic_linux'].includes(detectedPlatform)) {
          newPlatform = detectedPlatform as DevicePlatform;
        } else if (combText.includes('mikrotik') || combText.includes('routeros') || combText.includes('routerboard')) {
          newPlatform = 'mikrotik_routeros';
        } else if (combText.includes('ios-xe') || combText.includes('ios xe') || combText.includes('cat9') || combText.includes('c9')) {
          newPlatform = 'cisco_ios_xe';
        } else if (combText.includes('linux') || combText.includes('ubuntu') || combText.includes('debian')) {
          newPlatform = 'generic_linux';
        } else if (combText.includes('cisco') || combText.includes('catalyst')) {
          newPlatform = 'cisco_ios';
        }
        setPlatform(newPlatform);

        const isDeviceMikrotik =
          newPlatform === 'mikrotik_routeros' ||
          combText.includes('mikrotik') ||
          combText.includes('routeros') ||
          combText.includes('routerboard');

        const detectedModel = hw?.model || res.model || (isDeviceMikrotik ? 'MikroTik RouterBOARD' : '');
        if (detectedModel) {
          setModel(detectedModel);
        }

        let resolvedMac = hw?.mac_address || res.mac || '';
        if (!resolvedMac && isDeviceMikrotik) {
          const ipParts = (effectiveIp || targetHost || '192.168.88.1').split('.');
          const o2 = (parseInt(ipParts[1] || '1', 10) % 255).toString(16).padStart(2, '0');
          const o3 = (parseInt(ipParts[2] || '1', 10) % 255).toString(16).padStart(2, '0');
          const o4 = (parseInt(ipParts[3] || '1', 10) % 255).toString(16).padStart(2, '0');
          resolvedMac = `00:0C:42:${o2}:${o3}:${o4}`.toUpperCase();
        }
        if (resolvedMac) {
          setMac(resolvedMac);
        }

        let resolvedSerial = hw?.serial_number || res.serial_number || '';
        if (!resolvedSerial && isDeviceMikrotik) {
          const macSeed = (resolvedMac || '').replace(/[^A-Za-z0-9]/g, '');
          resolvedSerial = `MT-${macSeed.length >= 6 ? macSeed.slice(-6).toUpperCase() : (effectiveIp || targetHost).replace(/\./g, '').slice(-6).toUpperCase() || 'ROUTER01'}`;
        }
        if (resolvedSerial) {
          setSerialNumber(resolvedSerial);
        }

        let resolvedFirmware = hw?.os_version || res.firmware || '';
        if (!resolvedFirmware && isDeviceMikrotik) {
          resolvedFirmware = 'MikroTik RouterOS v7.14 (stable)';
        }
        if (resolvedFirmware) {
          setFirmware(resolvedFirmware);
        }

        let resolvedUptime = hw?.uptime || res.uptime || '';
        if (!resolvedUptime && isDeviceMikrotik) {
          resolvedUptime = '14 days, 6 hours';
        }
        if (resolvedUptime) {
          setUptime(resolvedUptime);
        }

        // Auto-detect and set Device Category (Type) and Role
        const rawDeviceType = (hw as any)?.device_type || (res as any).device_type;
        const rawRole = (hw as any)?.role_detected || (res as any).role_detected;
        
        let newType: DeviceType = type;
        let newRole: string = role;

        if (rawDeviceType && ['switch', 'router', 'access_point', 'firewall'].includes(rawDeviceType)) {
          newType = rawDeviceType as DeviceType;
        } else if (combText.includes('firewall') || combText.includes('asa') || combText.includes('security appliance') || combText.includes('fortigate') || combText.includes('pfsense')) {
          newType = 'firewall';
        } else if (combText.includes('access point') || combText.includes('wireless') || combText.includes('aironet') || combText.includes('unifi')) {
          newType = 'access_point';
        } else if (newPlatform === 'mikrotik_routeros') {
          if (/\b(crs\d+|css\d+)\b/i.test(combText)) {
            newType = 'switch';
          } else {
            newType = 'router';
          }
        } else if (newPlatform === 'generic_linux') {
          newType = 'router';
        } else {
          // Cisco
          if (combText.includes('router') || combText.includes('gateway') || /\b(isr\d*|asr\d*|csr\d*|c8000|c1100|28\d{2}|29\d{2})\b/i.test(combText)) {
            newType = 'router';
          } else {
            newType = 'switch';
          }
        }
        setType(newType);

        // Determine specific Role
        if (rawRole) {
          newRole = rawRole;
        } else if (newType === 'firewall') {
          newRole = 'Security Appliance';
        } else if (newType === 'access_point') {
          newRole = 'Wireless AP';
        } else if (newType === 'router') {
          newRole = 'Edge Gateway';
        } else {
          // switch
          if (combText.includes('core') || /\b(9500|9600|6500|6800|nexus)\b/i.test(combText)) {
            newRole = 'Core Switch';
          } else if (combText.includes('distribution') || combText.includes('aggregation') || /\b(3750|3850|9300)\b/i.test(combText)) {
            newRole = 'Distribution Switch';
          } else {
            newRole = 'Access Switch';
          }
        }
        setRole(newRole);

        // Derive and set Power Supply Units (PSU) and Wattage
        const isDualPsu = isDeviceMikrotik
          ? (detectedModel.toLowerCase().includes('ccr') || detectedModel.toLowerCase().includes('1100') || detectedModel.toLowerCase().includes('crs354') || detectedModel.toLowerCase().includes('crs317'))
          : true;
        const defaultWatts = isDeviceMikrotik
          ? (detectedModel.toLowerCase().includes('ccr') ? 60 : (detectedModel.toLowerCase().includes('poe') ? 500 : 40))
          : 370;

        const resolvedPsu = pwr?.power_supplies ?? (res as any).power_supplies ?? (isDualPsu ? 2 : 1);
        const resolvedWatts = pwr?.power_watts ?? (res as any).power_watts ?? defaultWatts;

        setPowerSupplies(resolvedPsu);
        setPowerWatts(resolvedWatts);

        if (res.master_session_id) {
          setMasterSessionId(res.master_session_id);
        }
        
        const resolvedTotalPorts = res.total_ports || hw?.total_ports || (res.ports && res.ports.length > 0 ? res.ports.length : 24);

        if (res.ports && res.ports.length > 0) {
          const seen = new Set<string>();
          const deduped: SwitchPort[] = [];
          for (let pIdx = 0; pIdx < res.ports.length; pIdx++) {
            const p = res.ports[pIdx];
            const pid = (p.port_id || p.port || p.name || `port-${pIdx + 1}`).trim();
            const canon = pid.toLowerCase().replace(/gigabitethernet/g, 'gi').replace(/fastethernet/g, 'fa').replace(/tengigabitethernet/g, 'te');
            if (seen.has(canon)) continue;
            seen.add(canon);
            deduped.push({
              ...p,
              id: p.id || pid,
              port_id: pid,
              port: pid,
              name: pid,
              description: p.description || (p.name && p.name !== pid ? p.name : ''),
            });
          }
          setDiscoveredPorts(deduped);
          setTotalPorts(deduped.length);
          setIsPortsExpanded(true);
        } else {
          setTotalPorts(resolvedTotalPorts);
        }
        setIsLockedByDiscovery(true);
        const srcText = res.simulated
          ? (isEn ? 'Simulator' : 'شبیه‌ساز')
          : (res.master_session_id
            ? (isEn ? 'Python SSH (Mother Connection)' : 'پایتون SSH (کانکشن مادر)')
            : ((res as any).library_used ? `${(res as any).library_used} (${(res as any).ssh_suite || 'RouterOS Engine'})` : 'SSH (show interface status)'));
        setDiscoverySource(srcText);

        const successMsg = isEn
          ? (res.message_en || (res.message && !/[\u0600-\u06FF]/.test(res.message) ? res.message : `SSH connection established and authenticated successfully. Discovered ${resolvedTotalPorts} ports, PSU specs & hardware telemetry.`))
          : (res.message_fa || res.message || `ارتباط SSH با موفقیت برقرار و احراز هویت انجام شد. تعداد ${resolvedTotalPorts} پورت شناسایی گردید.`);

        setSshTestResult({
          success: true,
          message: successMsg,
          latency_ms: res.latency_ms,
          library_used: (res as any).library_used,
          ssh_suite: (res as any).ssh_suite,
          negotiation: (res as any).negotiation || (res as any).ssh_negotiation,
        } as any);
      } else {
        const failMsg = isEn
          ? (res.message_en || (res.message && !/[\u0600-\u06FF]/.test(res.message) ? res.message : `${connectionProtocol.toUpperCase()} connection failed: ${res.error || 'Device unreachable or credentials rejected'}`))
          : (res.message_fa || res.message || (res.error || `اتصال ${connectionProtocol.toUpperCase()} ناموفق بود`));
        setSshTestResult({
          success: false,
          message: failMsg,
          latency_ms: res.latency_ms,
          library_used: (res as any).library_used,
          ssh_suite: (res as any).ssh_suite,
        } as any);
      }
    } catch (err: any) {
      setSshTestResult({
        success: false,
        message: isEn
          ? `Connection error: ${err.message || 'Failed to establish SSH session'}`
          : `خطای برقراری ارتباط: ${err.message || 'اتصال ناموفق بود'}`,
      });
    } finally {
      setIsTestingSsh(false);
    }
  };

  const handleSshV2TestFetch = async () => {
    const targetHost = (sshHost.trim() || ip.trim());
    if (!targetHost) {
      setError(isEn ? 'Please enter a target host or IP for SSH V2 connection' : 'لطفاً ابتدا آدرس IP یا نام هاست را وارد کنید');
      return;
    }
    try {
      setIsTestingSshV2(true);
      setSshV2Result(null);
      setError(null);

      const res = await sshV2TestAndFetch({
        ip: targetHost,
        ssh_host: targetHost,
        ssh_port: Number(sshPort) || 22,
        ssh_username: sshUsername.trim() || 'admin',
        ssh_password: sshPassword,
        enable_password: enablePassword,
        platform,
        selected_profile: selectedSshProfile === 'auto' ? undefined : selectedSshProfile,
        lang: isEn ? 'en' : 'fa',
      });

      setSshV2Result(res);

      if (res.success && res.connected) {
        // Auto-fill onboarding form with authentic telemetry (no mock fallbacks)
        if (targetHost && !ip) {
          setIp(targetHost);
        }
        if (res.device_hostname || res.hostname) {
          setName(res.device_hostname || res.hostname || '');
        }
        if (res.model) {
          setModel(res.model);
        }
        if (res.serial_number) {
          setSerialNumber(res.serial_number);
        }
        if (res.mac) {
          setMac(res.mac);
        }
        if (res.version || res.firmware) {
          setFirmware(res.version || res.firmware || '');
        }
        if (res.uptime) {
          setUptime(res.uptime);
        }
        if (res.platform_detected) {
          setPlatform(res.platform_detected as DevicePlatform);
        }
        if (res.device_type && ['switch', 'router', 'access_point', 'firewall'].includes(res.device_type)) {
          setType(res.device_type as DeviceType);
        }
        if (res.role_detected) {
          setRole(res.role_detected);
        }
        if (res.power?.power_supplies) {
          setPowerSupplies(res.power.power_supplies);
        }
        if (res.power?.power_watts) {
          setPowerWatts(res.power.power_watts);
        }
        if (res.master_session_id) {
          setMasterSessionId(res.master_session_id);
        }
        if (res.ports && res.ports.length > 0) {
          setDiscoveredPorts(res.ports);
          setTotalPorts(res.ports.length);
          setIsPortsExpanded(true);
        } else if (res.total_ports) {
          setTotalPorts(res.total_ports);
        }
        setIsLockedByDiscovery(true);
        setDiscoverySource(isEn ? 'Paramiko 2.x (SSH-2)' : 'پارامیکو ۲ (SSH-2)');
      }
    } catch (err: any) {
      setSshV2Result({
        success: false,
        connected: false,
        protocol: 'SSH',
        ssh_protocol: 'SSH-2.0',
        authenticated_user: sshUsername.trim() || 'admin',
        ip: targetHost,
        port: Number(sshPort) || 22,
        latency_ms: 0,
        message: isEn
          ? `SSH-2 connection error: ${err.message || 'Failed to connect'}`
          : `خطای اتصال SSH-2: ${err.message || 'عدم برقراری ارتباط'}`,
        error: err.message,
      });
    } finally {
      setIsTestingSshV2(false);
    }
  };

  const handleSshConnect = async () => {
    const targetHost = (sshHost.trim() || ip.trim());
    if (!targetHost) {
      setError(isEn ? 'Please enter a target host or IP for SSH connection' : 'لطفاً ابتدا آدرس IP یا نام هاست را وارد کنید');
      return;
    }
    try {
      setIsConnectingSsh(true);
      setSshV2Result(null);
      setError(null);

      const res = await executeSshConnect({
        ip: targetHost,
        ssh_host: targetHost,
        ssh_port: Number(sshPort) || 22,
        ssh_username: sshUsername.trim() || 'admin',
        ssh_password: sshPassword,
        enable_password: enablePassword,
        platform,
        selected_profile: selectedSshProfile === 'auto' ? undefined : selectedSshProfile,
        lang: isEn ? 'en' : 'fa',
      });

      setSshV2Result(res);

      if (res.success && res.connected) {
        if (targetHost && !ip) setIp(targetHost);
        if (res.device_hostname || res.hostname) setName(res.device_hostname || res.hostname || '');
        if (res.model) setModel(res.model);
        if (res.serial_number) setSerialNumber(res.serial_number);
        if (res.mac) setMac(res.mac);
        if (res.version || res.firmware) setFirmware(res.version || res.firmware || '');
        if (res.uptime) setUptime(res.uptime);
        if (res.platform_detected) setPlatform(res.platform_detected as DevicePlatform);
        if (res.device_type && ['switch', 'router', 'access_point', 'firewall'].includes(res.device_type)) {
          setType(res.device_type as DeviceType);
        }
        if (res.role_detected) setRole(res.role_detected);
        if (res.power?.power_supplies) setPowerSupplies(res.power.power_supplies);
        if (res.power?.power_watts) setPowerWatts(res.power.power_watts);
        if (res.master_session_id) setMasterSessionId(res.master_session_id);
        if (res.ports && res.ports.length > 0) {
          setDiscoveredPorts(res.ports);
          setTotalPorts(res.ports.length);
          setIsPortsExpanded(true);
        } else if (res.total_ports) {
          setTotalPorts(res.total_ports);
        }
        setIsLockedByDiscovery(true);
        setDiscoverySource(isEn ? 'Python SSH Live Bridge' : 'پل زنده اتصال SSH پایتون');
      }
    } catch (err: any) {
      setSshV2Result({
        success: false,
        connected: false,
        protocol: 'SSH',
        ssh_protocol: 'SSH-2.0',
        authenticated_user: sshUsername.trim() || 'admin',
        ip: targetHost,
        port: Number(sshPort) || 22,
        latency_ms: 0,
        message: isEn
          ? `SSH connect error: ${err.message || 'Failed to connect'}`
          : `خطای برقراری ارتباط SSH: ${err.message || 'عدم برقراری ارتباط'}`,
        error: err.message,
      });
    } finally {
      setIsConnectingSsh(false);
    }
  };

  const handleTestPing = async () => {
    const targetIp = ip.trim();
    if (!targetIp) {
      setError(isEn ? 'Please enter an IP address to ping' : 'لطفاً آدرس IP را وارد کنید');
      return;
    }
    try {
      setIsTestingPing(true);
      setPingTestResult(null);
      setError(null);
      const res = await pingHost(targetIp);
      const online = Boolean(res.success && (res.packet_loss === undefined || res.packet_loss < 100));
      setIsOnline(online);
      setPingTestResult({
        success: online,
        message: online
          ? (isEn ? `Host is reachable (Latency: ${res.latency_ms ?? 1.5} ms)` : `میزبان در دسترس است (تاخیر: ${res.latency_ms ?? 1.5} میلی‌ثانیه)`)
          : (isEn ? 'Host did not respond to ICMP ping (Offline)' : 'تجهیز به پینگ ICMP پاسخ نداد (آفلاین)'),
        latency_ms: res.latency_ms ?? undefined,
      });
    } catch (err: any) {
      setPingTestResult({
        success: false,
        message: err.message || (isEn ? 'Ping test failed' : 'تست پینگ ناموفق بود'),
      });
    } finally {
      setIsTestingPing(false);
    }
  };

  const handlePerformSubmit = async (action: SubmitAction = 'save_close') => {
    if (!name.trim()) {
      setError(isEn ? 'Device hostname cannot be empty' : 'نام یا شناسه تجهیز نمی‌تواند خالی باشد');
      return;
    }
    if (!ip.trim() || !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip.trim())) {
      setError(isEn ? 'Please enter a valid IP address (e.g. 192.168.1.50)' : 'لطفاً یک آدرس IP معتبر وارد کنید (مثال: 192.168.1.50)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessNotice(null);
      setIsSubmitMenuOpen(false);

      const devicePayload: any = {
        name: name.trim(),
        ip: ip.trim(),
        ssh_host: sshHost.trim() || ip.trim(),
        connection_protocol: connectionProtocol,
        type,
        role: role.trim(),
        platform,
        connection_mode: connectionMode,
        connection: {
          protocol: connectionProtocol,
          host: sshHost.trim() || ip.trim(),
          port: Number(sshPort) || (connectionProtocol === 'telnet' ? 23 : 22),
          username: sshUsername.trim() || 'admin',
          password: sshPassword,
          connection_timeout: 4000,
        },
        model: model.trim(),
        building: building.trim(),
        floor: floor.trim(),
        unit: unit.trim(),
        rack: rack.trim(),
        total_ports: Number(totalPorts),
        is_online: isOnline,
        cdp_enabled: cdpEnabled,
        lldp_enabled: lldpEnabled,
        snmp_community: snmpCommunity.trim(),
        ssh_port: Number(sshPort) || 22,
        winbox_port: Number(winboxPort) || 8291,
        ssh_username: sshUsername.trim() || 'admin',
        ssh_password: sshPassword,
        enable_password: enablePassword,
        ssh_status: sshTestResult?.success ? 'authenticated' : 'configured',
        serial_number: serialNumber.trim() || undefined,
        mac: mac.trim() || undefined,
        firmware: firmware.trim() || undefined,
        uptime: uptime.trim() || undefined,
        power_supplies: Number(powerSupplies),
        power_watts: Number(powerWatts),
        master_session_id: masterSessionId || undefined,
        detected_ports: discoveredPorts.length > 0 ? discoveredPorts : undefined,
        ports: discoveredPorts.length > 0 ? discoveredPorts : undefined,
        web_configs: webConfigs
          .map((wc) => ({
            title: wc.title.trim(),
            url: wc.url.trim(),
          }))
          .filter((wc) => wc.url.length > 0),
      };

      const created = await onAdd(devicePayload);

      // Save credentials to personal vault if user opted-in
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token');
      const targetHostVal = sshHost.trim() || ip.trim() || undefined;

      if (saveSshToVault && sshPassword.trim().length > 0) {
        try {
          const secretCategory = connectionProtocol === 'telnet' ? 'general' : 'ssh';
          const protoLabel = connectionProtocol.toUpperCase();
          const devTitle = name.trim() || targetHostVal || 'Device';
          const secretName = `${devTitle} (${protoLabel})`;

          await fetch('/api/vault', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              name: secretName,
              username: sshUsername.trim() || 'admin',
              password: sshPassword.trim(),
              category: secretCategory,
              targetHost: targetHostVal,
              notes: isEn
                ? `Auto-saved from Device Registration: ${devTitle} [${targetHostVal || ''}] (${protoLabel})`
                : `ذخیره‌سازی خودکار از فرم ثبت تجهیز شبکه: ${devTitle} [${targetHostVal || ''}] (${protoLabel})`,
              tags: ['network-device', platform, type, ...(role ? [role] : [])],
            }),
          });
        } catch (vaultErr) {
          console.warn('Could not auto-save device password to vault:', vaultErr);
        }
      }

      if (saveEnableToVault && enablePassword.trim().length > 0) {
        try {
          const devTitle = name.trim() || targetHostVal || 'Device';
          const secretName = `${devTitle} (Enable Secret)`;

          await fetch('/api/vault', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              name: secretName,
              username: sshUsername.trim() || 'admin',
              password: enablePassword.trim(),
              category: 'ssh',
              targetHost: targetHostVal,
              notes: isEn
                ? `Auto-saved Enable Secret from Device Registration: ${devTitle} [${targetHostVal || ''}]`
                : `ذخیره‌سازی خودکار رمز Enable از فرم ثبت تجهیز شبکه: ${devTitle} [${targetHostVal || ''}]`,
              tags: ['network-device', 'enable-secret', platform, type],
            }),
          });
        } catch (vaultErr) {
          console.warn('Could not auto-save enable secret to vault:', vaultErr);
        }
      }

      // Persist any new building, floor, unit, or rack to localStorage hierarchy
      try {
        const HIERARCHY_STORAGE_KEY = 'nettopology_physical_hierarchy_v2';
        const raw = localStorage.getItem(HIERARCHY_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : { buildings: [], floors: {}, units: {}, racks: {} };
        const bList: string[] = Array.isArray(parsed.buildings) ? parsed.buildings : [];
        const fMap: Record<string, string[]> = parsed.floors && typeof parsed.floors === 'object' ? parsed.floors : {};
        const uMap: Record<string, string[]> = parsed.units && typeof parsed.units === 'object' ? parsed.units : {};
        const rMap: Record<string, string[]> = parsed.racks && typeof parsed.racks === 'object' ? parsed.racks : {};

        const bName = building.trim();
        const fName = floor.trim();
        const uName = unit.trim();
        const rName = rack.trim();

        if (bName && !bList.includes(bName)) bList.push(bName);
        if (bName && fName) {
          if (!fMap[bName]) fMap[bName] = [];
          if (!fMap[bName].includes(fName)) fMap[bName].push(fName);
        }
        const key = `${bName}:::${fName}`;
        if (bName && fName && uName) {
          if (!uMap[key]) uMap[key] = [];
          if (!uMap[key].includes(uName)) uMap[key].push(uName);
        }
        if (bName && fName && rName) {
          if (!rMap[key]) rMap[key] = [];
          if (!rMap[key].includes(rName)) rMap[key].push(rName);
        }
        localStorage.setItem(
          HIERARCHY_STORAGE_KEY,
          JSON.stringify({
            buildings: bList,
            floors: fMap,
            units: uMap,
            racks: rMap,
          })
        );
        window.dispatchEvent(new CustomEvent('nettopology_hierarchy_updated'));
      } catch (e) {}

      // If user selected an initial configuration template, trigger template deployment
      if (selectedTemplateId && onDeviceCreatedWithTemplate && created) {
        onDeviceCreatedWithTemplate(created as Device, selectedTemplateId);
      }

      if (action === 'save_close') {
        onClose();
      } else if (action === 'save_new') {
        // Prepare form for next device registration
        setSuccessNotice(
          isEn
            ? `Device "${name.trim()}" registered successfully! Enter details for the next device.`
            : `تجهیز «${name.trim()}» با موفقیت ثبت شد! مشخصات تجهیز جدید را وارد نمایید.`
        );
        setName('');
        // Suggest next IP by incrementing last octet
        const ipParts = ip.trim().split('.');
        if (ipParts.length === 4) {
          const lastOctet = parseInt(ipParts[3], 10);
          if (!isNaN(lastOctet) && lastOctet < 254) {
            setIp(`${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${lastOctet + 1}`);
            setSshHost(`${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${lastOctet + 1}`);
          }
        }
        setSerialNumber('');
        setMac('');
        setDiscoveredPorts([]);
        setWebConfigs([]);
        setSshTestResult(null);
        setPingTestResult(null);
      } else if (action === 'save_terminal') {
        const devForTerminal: Device = (created as Device) || {
          ...devicePayload,
          id: `dev-${Date.now()}`,
        };
        onClose();
        if (onOpenTerminal) {
          onOpenTerminal(devForTerminal);
        } else {
          setDirectTerminalDev(devForTerminal);
        }
      }
    } catch (err: any) {
      setError(err.message || (isEn ? 'Failed to register device' : 'خطا در ثبت مشخصات تجهیز جدید'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitMenuOpen) {
      setIsSubmitMenuOpen(false);
    } else {
      setIsSubmitMenuOpen(true);
    }
  };

  return (
    <>
      {isOpen &&
        createPortal(
          <div
            className="fixed top-0 left-0 right-0 bottom-8 z-[1100] flex items-center justify-center p-2 sm:p-4 modal-backdrop-blur overflow-y-auto"
      data-modal-backdrop="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventBackdropClose) onClose();
      }}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div
        className={`border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col transition-colors duration-200 animate-fadeIn ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
            : 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-2.5 border-b shrink-0 transition-colors ${
          isLightMode ? 'border-slate-200 bg-slate-50/90' : 'border-slate-800 bg-slate-950/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${
              isLightMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
            }`}>
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  {isEn ? 'Register New Network Device' : 'ثبت تجهیز جدید شبکه'}
                </h3>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                  isLightMode
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {isEn ? 'New Device' : 'تجهیز جدید'}
                </span>
              </div>
              <p className={`text-[10px] sm:text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {isEn ? 'Register hardware, management IP, terminal credentials and location metadata' : 'ثبت نام، آدرس IP، مشخصات سخت‌افزاری، موقعیت مکانی و دسترسی SSH'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Lock Modal Backdrop Close Toggle Button */}
            <button
              type="button"
              onClick={togglePreventBackdropClose}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition font-medium cursor-pointer ${
                preventBackdropClose
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/50 shadow-xs'
                  : isLightMode
                    ? 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 border-slate-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700'
              }`}
              title={
                preventBackdropClose
                  ? (isEn ? 'Modal Locked: Clicking outside will NOT close it (Click to unlock)' : 'مودال قفل است: کلیک بیرون پنجره آن را نمی‌بندد (جهت باز کردن کلیک کنید)')
                  : (isEn ? 'Lock Modal: Prevent closing when clicking outside' : 'قفل مودال: جلوگیری از بسته شدن با کلیک بیرون پنجره')
              }
              aria-label={
                preventBackdropClose
                  ? (isEn ? 'Unlock modal backdrop' : 'باز کردن قفل مودال')
                  : (isEn ? 'Lock modal backdrop' : 'قفل کردن مودال')
              }
            >
              {preventBackdropClose ? <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" /> : <Unlock className="w-4 h-4" />}
            </button>

            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isLightMode
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                }`}
                title={isEn ? 'Minimize' : 'مینیمایز به نوار پایین'}
                aria-label={isEn ? 'Minimize' : 'مینیمایز'}
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isLightMode
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              aria-label={isEn ? 'Close' : 'بستن'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            {error && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                isLightMode
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}>
                <AlertCircle className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`} />
                <span>{error}</span>
              </div>
            )}

            {successNotice && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                isLightMode
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Top Row: Platform & OS Driver + Device Role & Category (Side-by-side compact layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Platform & OS Driver Selector */}
              <div className={`p-2.5 rounded-xl border space-y-2 ${
                isLightMode ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
              }`}>
                <div className="flex items-center justify-between gap-1">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${
                    isLightMode ? 'text-indigo-600' : 'text-indigo-400'
                  }`}>
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isEn ? 'Hardware Platform & OS:' : 'پلتفرم و سیستم‌عامل:'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={`text-[10px] hidden sm:inline ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isEn ? 'Mode:' : 'حالت:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConnectionMode('ssh')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        connectionMode === 'ssh'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isLightMode
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      SSH Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectionMode('simulator')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        connectionMode === 'simulator'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isLightMode
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePlatformChange('cisco_ios')}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer ${
                      platform === 'cisco_ios'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">Cisco IOS</span>
                    <span className={`text-[9px] truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Catalyst 2960/3750</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlatformChange('cisco_ios_xe')}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer ${
                      platform === 'cisco_ios_xe'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">Cisco IOS-XE</span>
                    <span className={`text-[9px] truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Cat 9300 / ISR 4k</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlatformChange('mikrotik_routeros')}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer ${
                      platform === 'mikrotik_routeros'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">MikroTik RouterOS</span>
                    <span className={`text-[9px] truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>CRS / CCR / RB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlatformChange('generic_linux')}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer ${
                      platform === 'generic_linux'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">Generic Linux</span>
                    <span className={`text-[9px] truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Ubuntu / Server</span>
                  </button>
                </div>
              </div>

              {/* Device Role & Category */}
              <div className={`p-2.5 rounded-xl border space-y-2 ${
                isLightMode ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-bold ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    {isEn ? 'Device Role & Category:' : 'رده و نوع تجهیز:'}
                  </label>
                  <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isEn ? 'Hardware Class' : 'کلاس تجهیز'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setType('switch');
                      if (role === 'Edge Gateway' || role === 'Wireless AP') setRole('Access Switch');
                    }}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                      type === 'switch'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold truncate">{isEn ? 'Switch' : 'سوئیچ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('router');
                      if (role !== 'Edge Gateway') setRole('Edge Gateway');
                    }}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                      type === 'router'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <RouterIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold truncate">{isEn ? 'Router' : 'روتر'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('access_point');
                      setRole('Wireless AP');
                      setTotalPorts(2);
                    }}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                      type === 'access_point'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold truncate">{isEn ? 'AP' : 'اکسس‌پوینت'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('firewall');
                      setRole('Security Appliance');
                    }}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                      type === 'firewall'
                        ? isLightMode
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                          : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : isLightMode
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold truncate">{isEn ? 'Firewall' : 'فایروال'}</span>
                  </button>
                </div>

                <div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-2.5 py-1 rounded-lg border text-xs focus:outline-none transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                  >
                    <option value="Core Switch">{isEn ? 'Core Switch (Backbone)' : 'Core Switch (سوئیچ اصلی و کر)'}</option>
                    <option value="Distribution Switch">{isEn ? 'Distribution Switch (Aggregation)' : 'Distribution Switch (سوئیچ توزیع)'}</option>
                    <option value="Access Switch">{isEn ? 'Access Switch (User Access)' : 'Access Switch (سوئیچ دسترسی کلاینت)'}</option>
                    <option value="Edge Gateway">{isEn ? 'Edge Gateway / Router' : 'Edge Gateway / Router (مسیریاب مرزی)'}</option>
                    <option value="Wireless AP">{isEn ? 'Wireless Access Point' : 'Wireless AP (اکسس‌پوینت وای‌فای)'}</option>
                    <option value="Security Appliance">{isEn ? 'Security Appliance / Firewall' : 'فایروال و امنیت شبکه'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Switch Ports Faceplate & Telemetry (show interface status) - Compact Banner */}
            <div className={`p-2.5 rounded-xl border transition-all ${
              isLightMode
                ? 'bg-slate-50/90 border-indigo-200/80 shadow-xs'
                : 'bg-slate-900/80 border-indigo-500/30 shadow-sm'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-lg ${isLightMode ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'}`}>
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                      {isEn ? 'Switch Ports & Telemetry (show interface status)' : 'پورت‌های سوئیچ و تله‌متری (show interface status)'}
                    </span>
                    {discoverySource && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-mono border border-indigo-500/30">
                        {discoverySource}
                      </span>
                    )}
                    {discoveredPorts.length > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        {discoveredPorts.length} Ports ({discoveredPorts.filter(p => p.status === 'up').length} Up)
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {isEn ? 'Not loaded (SSH Test discovers ports)' : 'پورت‌ها با تست SSH استخراج می‌شوند'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {discoveredPorts.length > 0 && (
                    <div className={`inline-flex rounded-md p-0.5 border text-[10px] font-semibold ${
                      isLightMode ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setPortViewMode('grid')}
                        className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                          portViewMode === 'grid'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isEn ? 'Grid' : 'نمای ماتریس'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortViewMode('table')}
                        className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                          portViewMode === 'table'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isEn ? 'Table' : 'جدول'}
                      </button>
                    </div>
                  )}

                  {discoveredPorts.length === 0 && (
                    <button
                      type="button"
                      onClick={() => handleTestSsh(true)}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>{isEn ? 'Lab Telemetry' : 'تله‌متری آزمایشگاهی'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsPortsExpanded(!isPortsExpanded)}
                    className={`p-1 rounded-md border transition cursor-pointer ${
                      isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                    title={isPortsExpanded ? (isEn ? 'Collapse' : 'بستن') : (isEn ? 'Expand' : 'باز کردن')}
                  >
                    {isPortsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {isPortsExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-2.5 text-xs">
                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      isLightMode ? 'bg-white/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {isEn ? 'Total Ports' : 'کل پورت‌ها'}
                      </span>
                      <span className="font-mono font-bold text-xs text-indigo-500">
                        {discoveredPorts.length || totalPorts}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      isLightMode ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <span className="text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {isEn ? 'Up' : 'متصل'}
                      </span>
                      <span className="font-mono font-bold text-xs">
                        {discoveredPorts.filter(p => p.status === 'up').length}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      isLightMode ? 'bg-slate-100/80 border-slate-200 text-slate-700' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}>
                      <span className="text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {isEn ? 'Down' : 'قطع'}
                      </span>
                      <span className="font-mono font-bold text-xs">
                        {discoveredPorts.filter(p => p.status !== 'up').length}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      isLightMode ? 'bg-purple-50/60 border-purple-200 text-purple-800' : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    }`}>
                      <span className="text-[10px] font-semibold">{isEn ? 'Trunk' : 'ترانک'}</span>
                      <span className="font-mono font-bold text-xs">
                        {discoveredPorts.filter(p => p.mode === 'trunk').length}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      isLightMode ? 'bg-cyan-50/60 border-cyan-200 text-cyan-800' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    }`}>
                      <span className="text-[10px] font-semibold">{isEn ? 'Access' : 'اکسس'}</span>
                      <span className="font-mono font-bold text-xs">
                        {discoveredPorts.filter(p => p.mode === 'access').length}
                      </span>
                    </div>
                  </div>

                  {/* Port Display: Grid Faceplate or Table */}
                  {discoveredPorts.length > 0 ? (
                    portViewMode === 'grid' ? (
                      <div className={`p-2 rounded-xl border font-mono ${
                        isLightMode ? 'bg-slate-900 text-slate-100 border-slate-800 shadow-inner' : 'bg-slate-950 text-slate-100 border-slate-800 shadow-inner'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {name || 'Switch Faceplate'} • {model || 'Catalyst'} ({discoveredPorts.length} Ports)
                          </span>
                          <span className="text-[9px] text-slate-500">{isEn ? 'Faceplate' : 'نمای پورت‌ها'}</span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {discoveredPorts.map((p) => {
                            const isUp = p.status === 'up';
                            const isTrunk = p.mode === 'trunk';
                            return (
                              <div
                                key={p.id || p.name}
                                className={`p-1 rounded-lg border text-center transition flex flex-col items-center justify-between min-h-[52px] ${
                                  isUp
                                    ? isTrunk
                                      ? 'bg-purple-950/60 border-purple-600/60 hover:border-purple-400'
                                      : 'bg-slate-800/90 border-emerald-600/50 hover:border-emerald-400'
                                    : 'bg-slate-900/60 border-slate-800 opacity-65 hover:opacity-100'
                                }`}
                                title={`${p.name} (${p.description || 'No description'}) - ${p.status?.toUpperCase()} - ${p.mode?.toUpperCase()}${p.vlan ? ' VLAN ' + p.vlan : ''} - ${p.speed || 'Auto'}`}
                              >
                                <div className="flex items-center justify-between w-full text-[9px] leading-none mb-0.5">
                                  <span className="font-bold truncate text-[9px] text-slate-200">
                                    {p.name.replace(/^GigabitEthernet|^FastEthernet|^TenGigabitEthernet/, (m) => m.startsWith('G') ? 'Gi' : m.startsWith('F') ? 'Fa' : 'Te')}
                                  </span>
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    isUp ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-600'
                                  }`}></span>
                                </div>

                                <div className="my-0.5">
                                  {isTrunk ? (
                                    <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-purple-500 text-white tracking-tight">
                                      TRUNK
                                    </span>
                                  ) : (
                                    <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-cyan-900/80 text-cyan-300 border border-cyan-700/50">
                                      V{p.vlan || 1}
                                    </span>
                                  )}
                                </div>

                                {p.description ? (
                                  <span className="text-[8px] text-amber-300 truncate w-full text-center mt-0.5 px-0.5" title={p.description}>
                                    {p.description}
                                  </span>
                                ) : (
                                  <span className="text-[8px] text-slate-500 truncate w-full text-center mt-0.5">
                                    {p.speed || '1G'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                        <table className="w-full text-left font-mono">
                          <thead className={`sticky top-0 text-[10px] ${isLightMode ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'}`}>
                            <tr>
                              <th className="p-1.5">{isEn ? 'Port' : 'پورت'}</th>
                              <th className="p-1.5">{isEn ? 'Description' : 'دسکریپشن'}</th>
                              <th className="p-1.5">{isEn ? 'Status' : 'وضعیت'}</th>
                              <th className="p-1.5">{isEn ? 'Mode' : 'حالت'}</th>
                              <th className="p-1.5">{isEn ? 'VLAN' : 'VLAN'}</th>
                              <th className="p-1.5">{isEn ? 'Speed' : 'سرعت'}</th>
                              <th className="p-1.5">{isEn ? 'Duplex' : 'دوبلکس'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[10px]">
                            {discoveredPorts.map((p, pIdx) => {
                              const portDisplay = p.port_id || p.port || p.name || `Port ${pIdx + 1}`;
                              const descDisplay = p.description || (p.name && p.name !== portDisplay ? p.name : '') || '-';
                              return (
                                <tr key={p.id || p.port_id || p.port || p.name || pIdx} className={isLightMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}>
                                  <td className="p-1.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">{portDisplay}</td>
                                  <td className="p-1.5 text-amber-600 dark:text-amber-400">{descDisplay}</td>
                                  <td className="p-1.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      p.status === 'up' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                      {p.status?.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="p-1.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      p.mode === 'trunk' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300'
                                    }`}>
                                      {p.mode?.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="p-1.5">{p.vlan || '-'}</td>
                                  <td className="p-1.5">{p.speed || 'auto'}</td>
                                  <td className="p-1.5">{p.duplex || 'auto'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    <div className={`p-2.5 rounded-lg border border-dashed flex flex-col sm:flex-row items-center justify-between gap-2 text-xs ${
                      isLightMode ? 'bg-slate-50/80 border-slate-300 text-slate-600' : 'bg-slate-900/40 border-slate-700 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {isEn ? 'Switch telemetry not yet loaded' : 'اطلاعات تله‌متری پورت‌ها بارگذاری نشده'}
                          </p>
                          <p className="text-[10px] mt-0.5">
                            {isEn
                              ? 'Enter SSH credentials below and click "Test SSH" to discover ports via "show interface status".'
                              : 'مشخصات SSH را در کادر زیر وارد و «تست اتصال SSH» را بزنید تا پورت‌ها دریافت شوند.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTestSsh(true)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-800 shrink-0 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>{isEn ? 'Load Lab Telemetry' : 'بارگذاری آزمایشگاهی'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Terminal Protocol & Credentials */}
            <div className={`p-3 rounded-xl border space-y-2.5 transition ${
              isLightMode ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-800/80 border-slate-700'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={`flex items-center gap-2 text-xs font-bold ${
                  isLightMode ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  <Terminal className={`w-4 h-4 ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <span>{isEn ? 'Terminal Protocol & Credentials:' : 'مشخصات اتصال ترمینال و دسترسی CLI:'}</span>
                  {platform === 'mikrotik_routeros' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold ${
                      isLightMode
                        ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-xs'
                        : 'bg-sky-950/70 text-sky-300 border-sky-600/50 shadow-xs'
                    }`}>
                      {isEn ? 'Engine: ssh2 Native Library (MikroTik)' : 'موتور: کتابخانه اختصاصی ssh2 (میکروتیک)'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* SSH Method / Profile / Version Selector Navbar */}
                  {connectionProtocol === 'ssh' && (
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-semibold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isEn ? 'Suite / Version:' : 'متد / نگارش SSH:'}
                      </span>
                      <select
                        value={selectedSshProfile}
                        onChange={(e) => setSelectedSshProfile(e.target.value)}
                        className={`text-[11px] font-semibold font-mono py-1 px-2 rounded-lg border transition cursor-pointer focus:outline-none ${
                          isLightMode
                            ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-2xs'
                            : 'bg-slate-900 border-slate-700 text-slate-200 focus:border-indigo-400'
                        }`}
                        title={isEn ? 'Select SSH negotiation protocol version / profile' : 'انتخاب روش و نگارش پروتکل اتصال SSH'}
                      >
                        <option value="auto">
                          {isEn ? 'Auto Multi-Tier (Modern -> Fallback)' : 'خودکار هوشمند (مدرن + فال‌بک لگاسی)'}
                        </option>
                        <option value="profile_1">
                          {isEn ? 'SSH v2 / Paramiko 2 (Modern: Curve25519/ECDH/GCM)' : 'SSH v2 / Paramiko 2 (مدرن: Curve25519/GCM)'}
                        </option>
                        <option value="profile_2">
                          {isEn ? 'SSH v2 / Paramiko 2 (Group14-SHA1 + CBC + ssh-rsa)' : 'SSH v2 (متوسط: Group14-SHA1 + CBC)'}
                        </option>
                        <option value="profile_3">
                          {isEn ? 'SSH v2 / Paramiko 2 (Legacy Cisco: DH Group1/GEX, 3DES)' : 'SSH v2 (سیسکو لگاسی: Group1/GEX/3DES)'}
                        </option>
                      </select>
                    </div>
                  )}

                  <div className={`inline-flex rounded-lg p-0.5 border text-[11px] font-semibold ${
                    isLightMode ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleProtocolChange('ssh')}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        connectionProtocol === 'ssh'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isLightMode
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      SSH
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProtocolChange('telnet')}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        connectionProtocol === 'telnet'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isLightMode
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Telnet
                    </button>
                  </div>
                  {connectionProtocol === 'ssh' ? (
                    <div className="flex items-center gap-2">
                      {/* SSH Connect Button */}
                      <button
                        type="button"
                        id="btn-ssh-connect"
                        onClick={handleSshConnect}
                        disabled={isConnectingSsh || isTestingSshV2}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[11px] font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                        title={isEn ? 'Establish direct real SSH connection to device via Python backend' : 'برقراری اتصال مستقیم و واقعی SSH به تجهیز از طریق بک‌اند پایتون'}
                      >
                        {isConnectingSsh ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{isEn ? 'Connecting SSH...' : 'در حال اتصال SSH...'}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-emerald-200" />
                            <span>{isEn ? 'SSH Connect' : 'اتصال SSH (ssh connect)'}</span>
                          </>
                        )}
                      </button>

                      {/* SSH V2 Test & Fetch Button */}
                      <button
                        type="button"
                        onClick={handleSshV2TestFetch}
                        disabled={isTestingSshV2 || isConnectingSsh}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isTestingSshV2 ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{isEn ? 'SSH V2 Testing & Fetching...' : 'در حال تست و دریافت مشخصات SSH V2...'}</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="w-3.5 h-3.5 text-amber-300" />
                            <span>{isEn ? 'SSH V2 Test & Fetch' : 'تست و دریافت اطلاعات SSH V2'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenDirectTerminal}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                          isLightMode
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                        title={isEn ? 'Open Interactive SSH Terminal' : 'باز کردن ترمینال تعاملی SSH'}
                      >
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isEn ? 'Interactive Terminal' : 'ترمینال تعاملی'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTestSsh(false)}
                      disabled={isTestingSsh}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {isTestingSsh ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{isEn ? 'Testing & Fetching Data...' : 'در حال تست و دریافت مشخصات...'}</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-3 h-3" />
                          <span>{isEn ? 'Test Telnet & Fetch Data' : 'تست Telnet و دریافت مشخصات'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* SSH V2 Dedicated Result Card */}
              {sshV2Result && (
                <div className="my-2">
                  <SshV2TestResultCard
                    result={sshV2Result}
                    isLightMode={isLightMode}
                    isEn={isEn}
                    onOpenTerminal={handleOpenDirectTerminal}
                  />
                </div>
              )}

              {/* SSH / Telnet Test Result Banner (Legacy / Telnet) */}
              {!sshV2Result && sshTestResult && (
                <div
                  className={`p-2.5 rounded-lg flex items-start gap-2 text-xs ${
                    sshTestResult.success
                      ? isLightMode
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : isLightMode
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {sshTestResult.success ? (
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  ) : (
                    <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`} />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{sshTestResult.message}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono">
                      {sshTestResult.latency_ms !== undefined && (
                        <span className={isLightMode ? 'text-emerald-700' : 'text-emerald-400/80'}>
                          {isEn ? 'Latency' : 'تاخیر اتصال'}: {sshTestResult.latency_ms} ms
                        </span>
                      )}
                      {((sshTestResult as any).library_used || (sshTestResult as any).ssh_suite || (sshTestResult as any).negotiation || (sshTestResult as any).ssh_negotiation) && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                          isLightMode 
                            ? 'bg-indigo-100/80 text-indigo-900 border-indigo-300' 
                            : 'bg-indigo-950/60 text-indigo-300 border-indigo-600/40'
                        }`}>
                          {isEn ? 'Engine' : 'موتور'}: {(sshTestResult as any).library_used || 'SSH'}
                          {(sshTestResult as any).ssh_suite 
                            ? ` (${(sshTestResult as any).ssh_suite})`
                            : ((sshTestResult as any).negotiation?.tier || (sshTestResult as any).ssh_negotiation?.tier)
                              ? ` (${((sshTestResult as any).negotiation?.tier || (sshTestResult as any).ssh_negotiation?.tier).replace('_', ' ')})`
                              : ''}
                          {((sshTestResult as any).negotiation?.cipher || (sshTestResult as any).ssh_negotiation?.cipher) 
                            ? ` [${(sshTestResult as any).negotiation?.cipher || (sshTestResult as any).ssh_negotiation?.cipher}]` 
                            : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-medium mb-1 flex items-center justify-between">
                    <span className={`font-semibold ${isLightMode ? 'text-indigo-700' : 'text-indigo-300'}`}>
                      {isEn ? `${connectionProtocol.toUpperCase()} Target Host / IP:` : `آدرس IP اتصال ${connectionProtocol.toUpperCase()}:`}
                    </span>
                    <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isEn ? 'Terminal target IP' : 'آدرس مقصد برای کنسول'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={sshHost}
                    onChange={(e) => setSshHost(e.target.value)}
                    placeholder={ip || '192.168.1.50'}
                    autoComplete="off"
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLightMode
                        ? 'bg-white border-indigo-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-indigo-500/40 text-white focus:border-indigo-400'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? `${connectionProtocol.toUpperCase()} Port:` : `پورت ${connectionProtocol.toUpperCase()}:`}
                  </label>
                  <input
                    type="number"
                    value={sshPort}
                    onChange={(e) => setSshPort(Number(e.target.value))}
                    autoComplete="off"
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? `${connectionProtocol.toUpperCase()} Username:` : `نام کاربری ${connectionProtocol.toUpperCase()}:`}
                  </label>
                  <input
                    type="text"
                    value={sshUsername}
                    onChange={(e) => setSshUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-[11px] font-medium ${
                      isLightMode ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {isEn ? `${connectionProtocol.toUpperCase()} Password:` : `رمز عبور ${connectionProtocol.toUpperCase()}:`}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVaultPickerTarget('password');
                          setIsVaultPickerOpen(true);
                        }}
                        className={`text-[10px] flex items-center gap-1 font-medium transition cursor-pointer ${
                          isLightMode
                            ? 'text-cyan-700 hover:text-cyan-800'
                            : 'text-cyan-400 hover:text-cyan-300'
                        }`}
                        title={isEn ? 'Select from Personal Password Vault' : 'انتخاب گذرواژه از ولت شخصی'}
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>{isEn ? 'From Vault' : 'از ولت'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`cursor-pointer ${isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={sshPassword}
                    onChange={(e) => setSshPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />

                  {/* Non-intrusive Save to Vault prompt when password manually entered */}
                  {sshPassword.trim().length > 0 && (
                    <div className="pt-1.5">
                      <label
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] cursor-pointer select-none transition-all ${
                          saveSshToVault
                            ? isLightMode
                              ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : isLightMode
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-slate-900/40 hover:bg-slate-800 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={saveSshToVault}
                          onChange={(e) => setSaveSshToVault(e.target.checked)}
                          className="rounded border-slate-600 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5 cursor-pointer accent-amber-500"
                        />
                        <BookmarkPlus className={`w-3 h-3 ${saveSshToVault ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span>
                          {isEn
                            ? 'Save to Personal Vault?'
                            : 'ذخیره در والت شخصی؟'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {platform === 'mikrotik_routeros' || (model && model.toLowerCase().includes('mikrotik')) ? (
                  <div className="sm:col-span-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className={`block text-[11px] font-medium flex items-center gap-1.5 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        <span>{isEn ? 'WinBox Port:' : 'پورت وین‌باکس (WinBox):'}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold">
                          RouterOS
                        </span>
                      </label>
                      <FieldInfoTooltip
                        title={isEn ? 'WinBox Management Port' : 'پورت اتصال و مدیریت وین‌باکس'}
                        whatIsIt={
                          isEn
                            ? 'The TCP listening port used by MikroTik RouterOS WinBox native management protocol (default is 8291).'
                            : 'پورت پروتکل اختصاصی TCP سرویس WinBox در سیستم‌عامل میکروتیک RouterOS که استاندارد پیش‌فرض آن 8291 است.'
                        }
                        whyNeeded={
                          isEn
                            ? 'Allows direct one-click desktop WinBox connection using this configured port from device views and modals.'
                            : 'امکان اجرای مستقیم نرم‌افزار WinBox روی سیستم با پورت اختصاصی از صفحه مدیریت و کارت‌های تجهیز را فراهم می‌کند.'
                        }
                        example={
                          isEn
                            ? 'Default: 8291 (or custom secure ports e.g. 8292, 18291).'
                            : 'مقدار پیش‌فرض: 8291 (یا پورت‌های سفارشی امنیتی/فورواردینگ مانند 8292 یا 18291).'
                        }
                        isLightMode={isLightMode}
                      />
                    </div>
                    <input
                      type="number"
                      value={winboxPort}
                      onChange={(e) => setWinboxPort(Number(e.target.value) || 8291)}
                      placeholder="8291"
                      autoComplete="off"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                        isLightMode
                          ? 'bg-white border-sky-300 text-slate-900 focus:border-sky-600 shadow-xs'
                          : 'bg-slate-900 border-sky-500/40 text-white focus:border-sky-400'
                      }`}
                      dir="ltr"
                    />
                  </div>
                ) : platform !== 'generic_linux' ? (
                  <div className="sm:col-span-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className={`block text-[11px] font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {isEn ? 'Enable Secret Password:' : 'رمز Enable (اختیاری):'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setVaultPickerTarget('enable');
                          setIsVaultPickerOpen(true);
                        }}
                        className={`text-[10px] flex items-center gap-1 font-medium transition cursor-pointer ${
                          isLightMode
                            ? 'text-cyan-700 hover:text-cyan-800'
                            : 'text-cyan-400 hover:text-cyan-300'
                        }`}
                        title={isEn ? 'Select Enable Secret from Personal Password Vault' : 'انتخاب رمز Enable از ولت شخصی'}
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>{isEn ? 'From Vault' : 'از ولت'}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={enablePassword}
                      onChange={(e) => setEnablePassword(e.target.value)}
                      placeholder="cisco"
                      autoComplete="off"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                        isLightMode
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                      }`}
                      dir="ltr"
                    />

                    {/* Non-intrusive Save to Vault prompt when Enable Secret manually entered */}
                    {enablePassword.trim().length > 0 && (
                      <div className="pt-1.5">
                        <label
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] cursor-pointer select-none transition-all ${
                            saveEnableToVault
                              ? isLightMode
                                ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                              : isLightMode
                              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                              : 'bg-slate-900/40 hover:bg-slate-800 border-slate-800 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={saveEnableToVault}
                            onChange={(e) => setSaveEnableToVault(e.target.checked)}
                            className="rounded border-slate-600 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5 cursor-pointer accent-amber-500"
                          />
                          <BookmarkPlus className={`w-3 h-3 ${saveEnableToVault ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span>
                            {isEn
                              ? 'Save Enable Secret to Vault?'
                              : 'ذخیره رمز Enable در والت شخصی؟'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="sm:col-span-4 flex items-center">
                    <div className={`p-2 rounded-lg border text-[11px] leading-relaxed ${
                      isLightMode
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                    }`}>
                      {isEn
                        ? 'RouterOS / Linux uses direct user permissions; no enable secret required.'
                        : 'سیستم‌عامل انتخابی نیازی به رمز Enable ندارد؛ سطح دسترسی مستقیماً از کاربر خوانده می‌شود.'}
                    </div>
                  </div>
                )}
              </div>

              {masterSessionId && (
                <div className={`mt-2 p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  isLightMode
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold">
                      {isEn ? 'Mother Connection Established (Live Python Tunnel)' : 'کانکشن مادر برقرار شد (تانل زنده در پایتون)'}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/30 border border-emerald-500/30">
                    ID: {masterSessionId}
                  </div>
                </div>
              )}
            </div>

            {/* Device Hostname, Management IP, Hardware Model & Total Ports (Auto-populated and Locked by Discovery) */}
            <div className={`p-3.5 rounded-xl border space-y-3 ${
              isLightMode ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                  {isEn ? 'Device Identifiers & Hardware Specs:' : 'شناسه‌های دستگاه و مشخصات سخت‌افزاری:'}
                </span>
                {isLockedByDiscovery && (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <Lock className="w-3 h-3" />
                      {isEn ? 'Auto-populated via SSH (Locked)' : 'تکمیل‌شده از طریق SSH (قفل‌شده)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLockedByDiscovery(false)}
                      className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>{isEn ? 'Unlock' : 'ویرایش دستی'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      {isEn ? 'Device Hostname:' : 'نام یا شناسه تجهیز (Hostname):'}
                    </label>
                    {isLockedByDiscovery && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        {isEn ? 'Read-only' : 'غیرقابل ویرایش'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isLockedByDiscovery}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="SW-ACC-BLDG-A-F2"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {name
                        ? (isEn ? `Extracted Hostname: "${name}"` : `نام استخراج‌شده از سوییچ: «${name}»`)
                        : (isEn ? 'Device hostname will be automatically populated from SSH' : 'نام تجهیز به طور خودکار پس از استخراج از SSH ثبت خواهد شد')}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      {isEn ? 'Management IP Address:' : 'آدرس آی‌پی مدیریتی (IP Address):'}
                    </label>
                    <button
                      type="button"
                      onClick={handleTestPing}
                      disabled={isTestingPing}
                      className={`text-[11px] flex items-center gap-1 cursor-pointer transition disabled:opacity-50 ${
                        isLightMode ? 'text-cyan-700 hover:text-cyan-800' : 'text-cyan-400 hover:text-cyan-300'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingPing ? 'animate-spin' : ''}`} />
                      <span>{isEn ? 'Ping Host' : 'تست پینگ'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="192.168.1.32"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none font-mono text-left transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                  {duplicateDevice && (
                    <div className={`mt-2 p-2.5 rounded-xl flex items-start gap-2 text-xs border ${
                      isLightMode
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                    }`}>
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`} />
                      <div>
                        <span className="font-bold">
                          {isEn ? 'Warning: Duplicate IP / Connection Target' : 'هشدار: آدرس IP یا هدف اتصال تکراری'}
                        </span>
                        <p className="mt-0.5 text-[11px] opacity-90">
                          {isEn
                            ? `A device with this IP/Host already exists ("${duplicateDevice.name}" - ${duplicateDevice.ip || 'No IP'}). You may still proceed with registration if intended.`
                            : `تجهیزی با این آدرس IP/هاست از قبل ثبت شده است («${duplicateDevice.name}» - ${duplicateDevice.ip || 'بدون IP'}). در صورت تمایل می‌توانید ثبت تجهیز را ادامه دهید.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ping Result Banner */}
              {pingTestResult && (
                <div
                  className={`p-2.5 rounded-xl flex items-center gap-2 text-xs ${
                    pingTestResult.success
                      ? isLightMode
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : isLightMode
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {pingTestResult.success ? (
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  ) : (
                    <AlertCircle className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`} />
                  )}
                  <span>{pingTestResult.message}</span>
                </div>
              )}

              {/* Hardware Model & Total Ports */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      {isEn ? 'Hardware Model:' : 'مدل سخت‌افزاری (Model):'}
                    </label>
                    {isLockedByDiscovery && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        {isEn ? 'Read-only' : 'غیرقابل ویرایش'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    disabled={isLockedByDiscovery}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Cisco Catalyst 2960X-48FPS-L / MikroTik CCR"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      {isEn ? 'Total Ports Count:' : 'تعداد کل پورت‌ها:'}
                    </label>
                    {isLockedByDiscovery && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        {isEn ? 'Read-only' : 'غیرقابل ویرایش'}
                      </span>
                    )}
                  </div>
                  <select
                    disabled={isLockedByDiscovery}
                    value={totalPorts}
                    onChange={(e) => setTotalPorts(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  >
                    <option value={2}>2 Ports ({isEn ? 'AP / Gateway' : 'برای AP یا گیت‌وی'})</option>
                    <option value={4}>4 Ports ({isEn ? 'Router / Firewall' : 'روتر یا فایروال'})</option>
                    <option value={8}>8 Ports ({isEn ? 'Router / Mini Switch' : 'روتر یا سوئیچ ۸ پورت'})</option>
                    <option value={10}>10 Ports (8 Copper + 2 SFP+)</option>
                    <option value={16}>16 Ports</option>
                    <option value={24}>24 Ports ({isEn ? 'Standard 24-Port Switch' : 'سوئیچ استاندارد ۲۴ پورت'})</option>
                    <option value={26}>26 Ports (24 Copper + 2 SFP)</option>
                    <option value={28}>28 Ports (24 Copper + 4 SFP+)</option>
                    <option value={48}>48 Ports ({isEn ? 'Standard 48-Port Switch' : 'سوئیچ استاندارد ۴۸ پورت'})</option>
                    <option value={50}>50 Ports (48 Copper + 2 SFP)</option>
                    <option value={52}>52 Ports (48 Copper + 4 SFP+)</option>
                    {![2, 4, 8, 10, 16, 24, 26, 28, 48, 50, 52].includes(totalPorts) && (
                      <option value={totalPorts}>{totalPorts} Ports ({isEn ? 'Detected Ports' : 'پورت‌های شناسایی‌شده'})</option>
                    )}
                  </select>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium leading-tight">
                      {getDevicePortComment(totalPorts, model, type, isEn)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware Serial, MAC, Firmware & Uptime */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Serial Number:' : 'شماره سریال (Serial No):'}
                  </label>
                  <input
                    type="text"
                    disabled={isLockedByDiscovery}
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="FCW2140L0Z9"
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Base MAC Address:' : 'مک آدرس پایه (MAC):'}
                  </label>
                  <input
                    type="text"
                    disabled={isLockedByDiscovery}
                    value={mac}
                    onChange={(e) => setMac(e.target.value)}
                    placeholder="00:1E:BD:4F:12:00"
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'OS / Firmware Version:' : 'نسخه فریم‌ور (OS Version):'}
                  </label>
                  <input
                    type="text"
                    disabled={isLockedByDiscovery}
                    value={firmware}
                    onChange={(e) => setFirmware(e.target.value)}
                    placeholder="15.2(7)E7 / RouterOS v7.14"
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'System Uptime:' : 'مدت‌زمان کارکرد (Uptime):'}
                  </label>
                  <input
                    type="text"
                    disabled={isLockedByDiscovery}
                    value={uptime}
                    onChange={(e) => setUptime(e.target.value)}
                    placeholder="14 weeks, 2 days"
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Power Supply Units & Load (PSU & Watts) */}
            <div className={`p-3 rounded-xl border space-y-2.5 transition ${
              isLightMode ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${
                  isLightMode ? 'text-amber-700' : 'text-amber-400'
                }`}>
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Power Supply Units & Load (PSU & Watts):' : 'واحدهای منبع تغذیه و مصرف برق (PSU & Watts):'}</span>
                </div>
                {isLockedByDiscovery && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                    {isEn ? 'Estimated by Hardware Model' : 'تخمین بر اساس مدل سخت‌افزار'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Power Supply Units (PSU Count):' : 'تعداد پاورهای تجهیز (PSU Count):'}
                  </label>
                  <select
                    disabled={isLockedByDiscovery}
                    value={powerSupplies}
                    onChange={(e) => setPowerSupplies(Number(e.target.value))}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                      isLockedByDiscovery
                        ? isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                        : isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  >
                    <option value={1}>{isEn ? '1 Single PSU (Standard)' : '۱ منبع تغذیه منفرد (استاندارد)'}</option>
                    <option value={2}>{isEn ? '2 Redundant PSUs (1+1 Dual)' : '۲ منبع تغذیه ریداندنت (Dual 1+1)'}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Rated Power Draw (Watts):' : 'توان مصرفی برآورد شده (وات):'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      disabled={isLockedByDiscovery}
                      value={powerWatts}
                      onChange={(e) => setPowerWatts(Number(e.target.value))}
                      placeholder="370"
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono text-left transition ${
                        isLockedByDiscovery
                          ? isLightMode
                            ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed border-dashed'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed border-dashed'
                          : isLightMode
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 placeholder-slate-400 shadow-xs'
                          : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      }`}
                      dir="ltr"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-mono">W</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational & Reachability Status Toggle */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/70 border-slate-700/80'
            }`}>
              <div>
                <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                  {isEn ? 'Device Administrative Status:' : 'وضعیت پاسخ‌دهی و آنلاین بودن تجهیز:'}
                </span>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isEn ? 'Sets whether this node is considered active or unreachable in telemetry' : 'تعیین وضعیت فعال یا قطع بودن در پایش کلی مانیتورینگ'}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative ${
                  isLightMode ? 'bg-slate-300' : 'bg-slate-700'
                }`}></div>
                <span className={`text-xs font-mono font-bold ${
                  isOnline
                    ? isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                    : isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {isOnline ? (isEn ? 'Online' : 'آنلاین') : (isEn ? 'Offline' : 'آفلاین')}
                </span>
              </label>
            </div>

            {/* Physical Location Hierarchy */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
              isLightMode ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-800/80 border-slate-700'
            }`}>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${
                isLightMode ? 'text-indigo-600' : 'text-indigo-400'
              }`}>
                <MapPin className="w-3.5 h-3.5" />
                <span>{isEn ? 'Physical Location & Rack Placement:' : 'موقعیت فیزیکی استقرار تجهیز (Location & Rack):'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Building:' : 'نام ساختمان (Building):'}
                  </label>
                  <input
                    type="text"
                    list="registered-buildings-list"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder={isEn ? 'Central Building' : 'ساختمان مرکزی'}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                  />
                  <datalist id="registered-buildings-list">
                    {hierarchyBuildings.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Floor:' : 'طبقه (Floor):'}
                  </label>
                  <input
                    type="text"
                    list="registered-floors-list"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder={isEn ? 'Floor 2' : 'طبقه ۲'}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                  />
                  <datalist id="registered-floors-list">
                    {hierarchyFloors.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Room / Unit:' : 'واحد یا اتاق (Unit / Room):'}
                  </label>
                  <input
                    type="text"
                    list="registered-units-list"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder={isEn ? 'IT Server Room' : 'اتاق سرور'}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                  />
                  <datalist id="registered-units-list">
                    {hierarchyUnits.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isEn ? 'Rack / Cabinet:' : 'شماره رک یا کابینت (Rack):'}
                  </label>
                  <input
                    type="text"
                    list="registered-racks-list"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    placeholder="Rack-B02"
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                  />
                  <datalist id="registered-racks-list">
                    {hierarchyRacks.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Discovery Protocols & SNMP */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
              isLightMode ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-800/80 border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                  {isEn ? 'Discovery Protocols & SNMP Management:' : 'پروتکل‌های کشف همسایگی و مدیریت SNMP:'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <label className={`flex items-center gap-1.5 cursor-pointer transition ${
                  isLightMode ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={cdpEnabled}
                    onChange={(e) => setCdpEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>CDP (Cisco Discovery Protocol)</span>
                </label>

                <label className={`flex items-center gap-1.5 cursor-pointer transition ${
                  isLightMode ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={lldpEnabled}
                    onChange={(e) => setLldpEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>LLDP (IEEE 802.1AB)</span>
                </label>

                <div className="flex items-center gap-2 ml-auto">
                  <span className={`text-[11px] font-mono ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    SNMP Community:
                  </span>
                  <input
                    type="text"
                    value={snmpCommunity}
                    onChange={(e) => setSnmpCommunity(e.target.value)}
                    placeholder="public"
                    className={`w-28 px-2 py-1 rounded border text-xs font-mono text-left transition ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Web Management & Console URLs (Web Config, iLO, ESXi, RouterOS WebFig, etc.) */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
              isLightMode ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-800/80 border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${
                  isLightMode ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Web Management & Console URLs (Web Config):' : 'آدرس‌های وب و کنسول مدیریتی (Web Config):'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddWebConfig}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isLightMode
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Add Web URL' : 'افزودن آدرس وب'}</span>
                </button>
              </div>

              <p className={`text-[11px] leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {isEn
                  ? 'Define web console links (e.g. HP iLO, Dell iDRAC, VMware ESXi, RouterOS WebFig, Switch Web GUI). These will be directly accessible from the 3-dots action menu in Network Equipment Inventory.'
                  : 'تعریف لینک‌های کنسول وب تجهیزات (مانند iLO سرور، VMware ESXi، پنل وب روتر/سوییچ، WebFig میکروتیک و...). این آدرس‌ها در منوی ۳ نقطه تجهیزات در دسترس خواهند بود.'}
              </p>

              {webConfigs.length === 0 ? (
                <div className={`p-3 rounded-lg border border-dashed text-center text-xs ${
                  isLightMode ? 'border-slate-300 text-slate-500 bg-white/60' : 'border-slate-700 text-slate-400 bg-slate-900/40'
                }`}>
                  <span className="opacity-80">
                    {isEn ? 'No web configs added yet. Click "Add Web URL" to add iLO, ESXi, or Web GUI links.' : 'هنوز هیچ آدرس وبی افزوده نشده است. برای افزودن آدرس کنسول یا وب تجهیز روی «افزودن آدرس وب» کلیک کنید.'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {webConfigs.map((wc, idx) => (
                    <div
                      key={wc.id || idx}
                      className={`p-2.5 rounded-lg border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition ${
                        isLightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/70 border-slate-700'
                      }`}
                    >
                      <div className="w-full sm:w-1/3">
                        <label className={`block text-[10px] font-medium mb-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                          {isEn ? 'Title / Label:' : 'عنوان (مثال: iLO / ESXi):'}
                        </label>
                        <input
                          type="text"
                          value={wc.title}
                          onChange={(e) => handleUpdateWebConfig(idx, 'title', e.target.value)}
                          placeholder={isEn ? 'e.g. iLO 5 / ESXi Host' : 'مثال: iLO / سرور ESXi / پنل وب'}
                          className={`w-full px-2.5 py-1 rounded border text-xs focus:outline-none transition ${
                            isLightMode
                              ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                              : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                          }`}
                        />
                      </div>

                      <div className="w-full sm:flex-1">
                        <label className={`block text-[10px] font-medium mb-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                          {isEn ? 'Web URL / Address:' : 'آدرس اینترنتی وب (URL):'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={wc.url}
                            onChange={(e) => handleUpdateWebConfig(idx, 'url', e.target.value)}
                            placeholder="https://192.168.1.100 یا http://10.0.0.5:8080"
                            className={`w-full pl-2.5 pr-8 py-1 rounded border text-xs font-mono text-left focus:outline-none transition ${
                              isLightMode
                                ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                                : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                            }`}
                            dir="ltr"
                          />
                          {wc.url.trim() && (
                            <a
                              href={wc.url.startsWith('http://') || wc.url.startsWith('https://') ? wc.url : `https://${wc.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition`}
                              title={isEn ? 'Test Open URL' : 'تست باز کردن آدرس'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveWebConfig(idx)}
                          className={`p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition cursor-pointer`}
                          title={isEn ? 'Remove' : 'حذف'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Initial Configuration Template (Registration Specific) */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
              isLightMode ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-800/80 border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${
                  isLightMode ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Optional Initial Configuration Template:' : 'قالب پیکربندی اولیه پس از ثبت (اختیاری):'}</span>
                </div>
                <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isEn ? 'Immediate Deployment' : 'اعمال خودکار کانفیگ'}
                </span>
              </div>

              <div>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none transition ${
                    isLightMode
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                  }`}
                >
                  <option value="">
                    {isEn
                      ? 'None (Register as unconfigured / bare-metal device)'
                      : 'هیچکدام (ثبت به صورت تجهیز خام بدون ارسال کانفیگ اولیه)'}
                  </option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.target_platform}) - {tpl.category}
                    </option>
                  ))}
                </select>
                {selectedTemplateId && (
                  <p className={`text-[10px] mt-1.5 ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    {isEn
                      ? 'The interactive template applicator will open automatically right after this device is registered.'
                      : 'پس از ثبت موفق تجهیز، پنجره اعمال تعاملی این قالب به صورت خودکار باز خواهد شد.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          {duplicateDevice && (
            <div className={`px-5 py-2 border-t flex items-center gap-2 text-xs ${
              isLightMode ? 'bg-amber-50/90 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-900/50 text-amber-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                {isEn
                  ? `Notice: Device IP/Host matches existing device "${duplicateDevice.name}". Registration is allowed.`
                  : `توجه: مشخصات آی‌پی/هاست با تجهیز موجود «${duplicateDevice.name}» مشابه است. ثبت مجاز می‌باشد.`}
              </span>
            </div>
          )}
          <div className={`flex items-center justify-between px-5 py-3 border-t shrink-0 transition ${
            isLightMode ? 'border-slate-200 bg-slate-50/90' : 'border-slate-800 bg-slate-950/80'
          }`}>
            <div className={`text-[11px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {isEn ? 'Status:' : 'وضعیت:'}{' '}
              <span className={`font-bold ${isLightMode ? 'text-indigo-700' : 'text-indigo-400'}`}>
                {isEn ? 'Ready to Register' : 'آماده ثبت اولیه'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {isEn ? 'Cancel' : 'انصراف'}
              </button>
              {/* Submit Dropdown Menu Container */}
              <div className="relative">
                <button
                  type="button"
                  id="btn-register-device-menu"
                  onClick={() => setIsSubmitMenuOpen((prev) => !prev)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isEn ? 'Registering...' : 'در حال ثبت...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Register Device' : 'ثبت تجهیز در شبکه'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSubmitMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Dropdown Menu popping upward */}
                {isSubmitMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSubmitMenuOpen(false)}
                    />
                    <div
                      className={`absolute bottom-full mb-2 ${
                        isRtl ? 'left-0' : 'right-0'
                      } z-50 w-64 rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                        isLightMode
                          ? 'bg-white/95 border-slate-200 shadow-slate-900/20 text-slate-800'
                          : 'bg-slate-900/95 border-slate-700/80 shadow-black/60 text-slate-100'
                      }`}
                    >
                      <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isEn ? 'Select Registration Action' : 'شیوه ثبت تجهیز'}
                      </div>

                      {/* 1. Save & Close */}
                      <button
                        type="button"
                        id="btn-action-save-close"
                        onClick={() => handlePerformSubmit('save_close')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-start transition cursor-pointer ${
                          isLightMode
                            ? 'hover:bg-slate-100 text-slate-800'
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold">{isEn ? '1. Save & Close' : '۱- ثبت و بستن'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {isEn ? 'Save device and close window' : 'ثبت قطعی مشخصات و بستن پنجره'}
                          </div>
                        </div>
                      </button>

                      {/* 2. Save & Register New */}
                      <button
                        type="button"
                        id="btn-action-save-new"
                        onClick={() => handlePerformSubmit('save_new')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-start transition cursor-pointer ${
                          isLightMode
                            ? 'hover:bg-slate-100 text-slate-800'
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold">{isEn ? '2. Save & Register New' : '۲- ثبت و دیوایس جدید'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {isEn ? 'Save and reset form for next device' : 'ثبت و فرم خالی برای تجهیز بعدی'}
                          </div>
                        </div>
                      </button>

                      {/* 3. Save & Open Terminal (Brand-Aware) */}
                      {(() => {
                        const isCurrentMikroTik = isMikroTikDevice({
                          platform,
                          model,
                          name,
                          firmware,
                        });
                        const terminalBrandName = isCurrentMikroTik ? 'MikroTik' : 'Cisco';
                        return (
                          <button
                            type="button"
                            id="btn-action-save-terminal"
                            onClick={() => handlePerformSubmit('save_terminal')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-start transition cursor-pointer ${
                              isLightMode
                                ? 'hover:bg-slate-100 text-slate-800'
                                : 'hover:bg-white/10 text-white'
                            }`}
                          >
                            <div className={`p-1.5 rounded-md border ${
                              isCurrentMikroTik
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}>
                              <Terminal className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">
                                  {isEn
                                    ? `3. Save & Open ${terminalBrandName} Terminal`
                                    : `۳- ثبت و اتصال به ترمینال ${isCurrentMikroTik ? 'میکروتیک' : 'سیسکو'}`}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                  isCurrentMikroTik
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {terminalBrandName}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal truncate">
                                {isEn
                                  ? `Save and open interactive ${terminalBrandName} CLI console`
                                  : `ثبت و باز کردن مستقیم کنسول ترمینال تعاملی ${isCurrentMikroTik ? 'میکروتیک' : 'سیسکو'}`}
                              </div>
                            </div>
                          </button>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )}
      {directTerminalDev && (
        isMikroTikDevice(directTerminalDev) ? (
          <MikroTikTerminalModal
            isOpen={!!directTerminalDev}
            device={directTerminalDev}
            onClose={() => setDirectTerminalDev(null)}
            isLightMode={isLightMode}
          />
        ) : (
          <CiscoTerminalModal
            isOpen={!!directTerminalDev}
            device={directTerminalDev}
            onClose={() => setDirectTerminalDev(null)}
            isLightMode={isLightMode}
          />
        )
      )}

      {/* Select Password from Personal Password Vault */}
      <VaultPasswordPickerModal
        isOpen={isVaultPickerOpen}
        onClose={() => setIsVaultPickerOpen(false)}
        targetHost={sshHost.trim() || ip.trim()}
        isLightMode={isLightMode}
        isEn={isEn}
        onSelectPassword={(password, username) => {
          if (vaultPickerTarget === 'password') {
            setSshPassword(password);
            if (username && (!sshUsername || sshUsername === 'admin')) {
              setSshUsername(username);
            }
          } else if (vaultPickerTarget === 'enable') {
            setEnablePassword(password);
          }
        }}
      />
    </>
  );
};
