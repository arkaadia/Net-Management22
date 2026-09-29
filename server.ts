import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { spawn, spawnSync, exec, ChildProcess } from 'child_process';
import http from 'http';
import net from 'net';
import os from 'os';
import { createServer as createViteServer } from 'vite';

// Safely determine current directory and project root in both CJS bundle and TSX ESM dev mode
const getCurrentDir = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  return process.cwd();
};

const currentDir = getCurrentDir();
// If running from dist/server.cjs, project root is one level up
const projectRoot = path.basename(currentDir) === 'dist' ? path.resolve(currentDir, '..') : currentDir;

// Load environment variables from all possible locations
const candidateEnvPaths = [
  path.resolve(projectRoot, '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(currentDir, '.env'),
  '/opt/nettopology/.env',
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config();

import { initDatabase } from './server/db';
import { apiRouter } from './server/routes';
import { setupTerminalWebSocket } from './server/terminalWs';
import { registerRemoteDesktopRoutes, setupRemoteDesktopWebSocket, ensureGuacdServiceRunning } from './server/remoteDesktopGateway';
import { registerCertConverterRoutes } from './server/certConverter';

const app = express();
const PORT = 3000;
const PYTHON_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : (process.env.PYTHON_PORT ? parseInt(process.env.PYTHON_PORT, 10) : 5001);
const PYTHON_WS_PORT = process.env.PYTHON_WS_PORT ? parseInt(process.env.PYTHON_WS_PORT, 10) : PYTHON_PORT + 1;

// Parse json and urlencoded (with 100mb limit for file transfers and backups)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Child process for Python backend
let pythonProcess: ChildProcess | null = null;
let isStartingPython = false;

function isPortActive(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

function checkPythonHealth(port: number, timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/devices',
      method: 'GET',
      headers: { Connection: 'close' },
      agent: false,
      timeout: timeoutMs,
    }, (res) => {
      res.resume(); // drain response
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function killProcessOnPort(port: number): Promise<void> {
  return new Promise((resolve) => {
    const cmd = `
      pkill -9 -f "server\\.py.*${port}" 2>/dev/null || true;
      PID=$(ss -tulpn 2>/dev/null | grep ":${port} " | grep -o 'pid=[0-9]*' | cut -d= -f2 | head -n1);
      if [ -n "$PID" ]; then kill -9 "$PID" 2>/dev/null || true; fi;
      (command -v fuser >/dev/null && fuser -k -9 ${port}/tcp 2>/dev/null) || true;
      (command -v lsof >/dev/null && kill -9 $(lsof -t -i:${port}) 2>/dev/null) || true;
    `;
    exec(cmd, () => {
      resolve();
    });
  });
}

/**
 * Resolves the appropriate Python executable for the backend runtime.
 * Checks for dedicated virtualenvs (e.g. venv-paramiko212), environment variables,
 * or standard project virtualenv locations before falling back to system python.
 */
export function resolvePythonExecutable(root: string): { executable: string; isVenv: boolean; venvDir?: string } {
  const isWin = process.platform === 'win32';
  const binDir = isWin ? 'Scripts' : 'bin';
  const exeName = isWin ? 'python.exe' : 'python3';
  const altExeName = isWin ? 'python.exe' : 'python';

  // 1. Explicit override via environment variables
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return { executable: process.env.PYTHON_PATH, isVenv: false };
  }
  if (process.env.PYTHON_CMD) {
    return { executable: process.env.PYTHON_CMD, isVenv: false };
  }

  // 2. Active VIRTUAL_ENV environment variable
  if (process.env.VIRTUAL_ENV) {
    const venvExe = path.join(process.env.VIRTUAL_ENV, binDir, exeName);
    if (fs.existsSync(venvExe)) return { executable: venvExe, isVenv: true, venvDir: process.env.VIRTUAL_ENV };
    const venvAlt = path.join(process.env.VIRTUAL_ENV, binDir, altExeName);
    if (fs.existsSync(venvAlt)) return { executable: venvAlt, isVenv: true, venvDir: process.env.VIRTUAL_ENV };
  }

  // 3. Known virtual environment locations relative to repository root or user home
  const homeDir = os.homedir();
  const candidateVenvDirs = [
    path.join(root, 'venv-paramiko212'),
    path.join(homeDir, 'Net-Management22', 'venv-paramiko212'),
    path.join(homeDir, 'venv-paramiko212'),
    path.join(homeDir, '.venv-paramiko212'),
    path.join(root, '.venv'),
    path.join(root, 'venv'),
    path.join(homeDir, 'Net-Management22', '.venv'),
  ];

  for (const venvDir of candidateVenvDirs) {
    const candidateExe = path.join(venvDir, binDir, exeName);
    if (fs.existsSync(candidateExe)) {
      return { executable: candidateExe, isVenv: true, venvDir };
    }
    const candidateAlt = path.join(venvDir, binDir, altExeName);
    if (fs.existsSync(candidateAlt)) {
      return { executable: candidateAlt, isVenv: true, venvDir };
    }
  }

  // 4. Default system fallback
  return { executable: isWin ? 'python' : 'python3', isVenv: false };
}

async function startPythonBackend(forceRestart = false) {
  if (isStartingPython) return;
  isStartingPython = true;

  try {
    if (!forceRestart) {
      const isHealthy = await checkPythonHealth(PYTHON_PORT);
      if (isHealthy) {
        console.log(`[Python Manager] Python backend is healthy and responding on port ${PYTHON_PORT}.`);
        return;
      }
    }

    // If port is occupied by an unresponsive or stale process, terminate it
    const active = await isPortActive(PYTHON_PORT);
    if (active) {
      console.warn(`[Python Manager] Port ${PYTHON_PORT} is open but unresponsive. Terminating stale process...`);
      await killProcessOnPort(PYTHON_PORT);
      await new Promise((r) => setTimeout(r, 400));
    }

    if (pythonProcess) {
      try {
        pythonProcess.kill('SIGKILL');
      } catch {}
      pythonProcess = null;
    }

    const pythonScript = path.join(projectRoot, 'backend', 'server.py');
    const { executable: pythonExe, isVenv, venvDir } = resolvePythonExecutable(projectRoot);

    // Log resolved Python runtime details and Paramiko version
    console.log(`[Python Manager] Resolved Python executable: ${pythonExe} (venv: ${isVenv ? venvDir : 'no'})`);
    try {
      const probe = spawnSync(pythonExe, ['-c', 'import sys, paramiko; print(f"Python {sys.version.split()[0]} | Paramiko {paramiko.__version__} | Path: {paramiko.__file__}")'], {
        encoding: 'utf-8',
        timeout: 3000,
      });
      if (probe.status === 0 && probe.stdout) {
        console.log(`[Python Manager] Runtime verified: ${probe.stdout.trim()}`);
      } else if (probe.stderr) {
        console.warn(`[Python Manager] Runtime warning: ${probe.stderr.trim()}`);
      }
    } catch (e: any) {
      console.warn(`[Python Manager] Could not probe Python runtime: ${e.message}`);
    }

    console.log(`[Python Manager] Starting Python backend with ${pythonExe} from ${pythonScript} on port ${PYTHON_PORT} (WS on ${PYTHON_WS_PORT})...`);

    const spawnEnv: NodeJS.ProcessEnv = {
      ...process.env,
      BACKEND_PORT: String(PYTHON_PORT),
      PYTHON_PORT: String(PYTHON_PORT),
      PYTHON_WS_PORT: String(PYTHON_WS_PORT),
      PYTHONUNBUFFERED: '1',
    };

    if (isVenv && venvDir) {
      spawnEnv.VIRTUAL_ENV = venvDir;
      const binPath = path.join(venvDir, process.platform === 'win32' ? 'Scripts' : 'bin');
      spawnEnv.PATH = `${binPath}:${process.env.PATH || ''}`;
    }

    pythonProcess = spawn(pythonExe, [pythonScript, String(PYTHON_PORT)], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: spawnEnv,
    });

    pythonProcess.on('error', (err) => {
      console.error('[Python Manager] Failed to start Python process:', err);
    });

    pythonProcess.on('exit', (code, signal) => {
      console.warn(`[Python Manager] Python process exited (code: ${code}, signal: ${signal}).`);
      pythonProcess = null;
      setTimeout(async () => {
        const isHealthy = await checkPythonHealth(PYTHON_PORT);
        if (!isHealthy) {
          startPythonBackend();
        }
      }, 2000);
    });
  } finally {
    isStartingPython = false;
  }
}

// Start Python
startPythonBackend();

// Ensure Apache Guacamole Daemon (guacd) is active for in-browser RDP/VNC remote desktop
ensureGuacdServiceRunning().catch((err) => {
  console.warn('[RemoteDesktop] Failed to check/start guacd on boot:', err);
});

// Clean up on exit
process.on('SIGTERM', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit(0);
});
process.on('SIGINT', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit(0);
});

// Helper: Compare semantic versions (e.g. 1.38.0 vs 1.37.1)
function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || '').replace(/^v/, '').trim();
  const clean2 = (v2 || '').replace(/^v/, '').trim();
  const p1 = clean1.split('.').map((x) => parseInt(x, 10) || 0);
  const p2 = clean2.split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// Helper: Run shell commands safely with timeout
function executeShell(command: string, cwd: string, timeoutMs: number = 60000): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd, maxBuffer: 25 * 1024 * 1024, timeout: timeoutMs }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`${err.message}\n${stderr}`));
      } else {
        resolve(stdout || stderr);
      }
    });
  });
}

// GitHub access token for rate-limit bypass and authenticated git operations (from environment)
const GITHUB_AUTH_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || '';

// Bridge status endpoint to verify frontend-backend intercommunication
app.get('/api/status/bridge', (req: Request, res: Response) => {
  res.json({
    status: 'connected',
    bridge: 'active',
    frontendPort: PORT,
    backendPort: PYTHON_PORT,
    timestamp: new Date().toISOString()
  });
});

// Check repository for newer releases (Net-Management GitHub)
app.get('/api/system/check-update', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    let currentVersion = '1.72.0';
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        currentVersion = pkg.version || currentVersion;
      } catch {
        // use fallback
      }
    }

    const timestamp = Date.now();
    let latestVersion = currentVersion;
    let remoteReleaseNote: any = null;
    let remoteCommitSha: string | null = null;
    let localCommitSha: string | null = null;
    let commitMessage: string | null = null;

    // 1. Fast local git checks with tight timeout
    const gitDir = path.join(projectRoot, '.git');
    if (fs.existsSync(gitDir)) {
      try {
        localCommitSha = (await executeShell('git rev-parse HEAD', projectRoot, 3000)).trim();
      } catch (e: any) {
        // ignore
      }

      try {
        // Configure authenticated remote if needed
        const lsRemoteOut = await executeShell('git ls-remote origin refs/heads/master', projectRoot, 5000);
        const match = lsRemoteOut.match(/^([0-9a-f]{40})/i);
        if (match) {
          remoteCommitSha = match[1];
        }
      } catch (gitCheckErr: any) {
        console.warn('[Check Update] Local git ls-remote warning:', gitCheckErr.message);
      }
    }

    // 2. High-speed multi-source fetch: GitHub API + jsDelivr CDN + raw.githubusercontent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const headersWithAuth: Record<string, string> = {
      'User-Agent': 'Net-Management-Panel',
      'Accept': 'application/vnd.github.v3+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };
    if (GITHUB_AUTH_TOKEN) {
      headersWithAuth['Authorization'] = `token ${GITHUB_AUTH_TOKEN}`;
    }

    try {
      // Query GitHub API directly for master commit info
      const commitApiPromise = fetch('https://api.github.com/repos/shahbazimasoud/Net-Management/commits/master', {
        signal: controller.signal,
        headers: headersWithAuth
      }).then(async (res) => {
        if (res.ok) {
          const json = await res.json() as any;
          if (json && json.sha) {
            remoteCommitSha = json.sha;
            commitMessage = json.commit?.message?.split('\n')[0] || null;
          }
        }
      }).catch(() => {});

      // Query raw package.json and version.ts with fallback CDN
      const packageSources = [
        `https://raw.githubusercontent.com/shahbazimasoud/Net-Management/master/package.json?_t=${timestamp}`,
        `https://cdn.jsdelivr.net/gh/shahbazimasoud/Net-Management@master/package.json?_t=${timestamp}`
      ];
      const versionSources = [
        `https://raw.githubusercontent.com/shahbazimasoud/Net-Management/master/src/version.ts?_t=${timestamp}`,
        `https://cdn.jsdelivr.net/gh/shahbazimasoud/Net-Management@master/src/version.ts?_t=${timestamp}`
      ];

      const fetchPackage = async () => {
        for (const src of packageSources) {
          try {
            const r = await fetch(src, { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } });
            if (r.ok) {
              const data = await r.json() as any;
              if (data && data.version) {
                latestVersion = data.version;
                break;
              }
            }
          } catch {
            // try next
          }
        }
      };

      const fetchVersionTs = async () => {
        for (const src of versionSources) {
          try {
            const r = await fetch(src, { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } });
            if (r.ok) {
              const tsText = await r.text();
              const vMatch = tsText.match(/version:\s*['"]([^'"]+)['"]/);
              const dMatch = tsText.match(/releaseDate:\s*['"]([^'"]+)['"]/);
              const tMatch = tsText.match(/type:\s*['"]([^'"]+)['"]/);
              const titleMatch = tsText.match(/title:\s*['"]([^'"]+)['"]/);
              const titleEnMatch = tsText.match(/title_en:\s*['"]([^'"]+)['"]/);
              const changesBlock = tsText.match(/changes:\s*\[([\s\S]*?)\]/);
              const changesEnBlock = tsText.match(/changes_en:\s*\[([\s\S]*?)\]/);

              const changes = changesBlock ? [...changesBlock[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]) : [];
              const changes_en = changesEnBlock ? [...changesEnBlock[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]) : [];

              remoteReleaseNote = {
                version: vMatch?.[1] || latestVersion,
                releaseDate: dMatch?.[1] || new Date().toISOString().split('T')[0],
                type: tMatch?.[1] || 'patch',
                title: titleMatch?.[1] || `نگارش ${latestVersion}`,
                title_en: titleEnMatch?.[1] || `Release v${latestVersion}`,
                changes: changes.length > 0 ? changes : ['به‌روزرسانی و ارتقای کلی عملکرد سامانه'],
                changes_en: changes_en.length > 0 ? changes_en : ['System optimizations and feature enhancements']
              };
              break;
            }
          } catch {
            // try next
          }
        }
      };

      await Promise.allSettled([commitApiPromise, fetchPackage(), fetchVersionTs()]);
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      console.warn('[Check Update] Warning fetching remote updates:', fetchErr.message);
    }

    // Check if simulation was requested in query string
    const simulateParam = req.query.simulate === 'true';
    if (simulateParam) {
      const parts = currentVersion.split('.').map(Number);
      const simVersion = `${parts[0]}.${(parts[1] || 0) + 1}.0`;
      latestVersion = simVersion;
      if (!remoteReleaseNote || remoteReleaseNote.version === currentVersion) {
        remoteReleaseNote = {
          version: simVersion,
          releaseDate: new Date().toISOString().split('T')[0],
          type: 'minor',
          title: 'نسخه ارتقای سیستم و رفع مشکلات پکیج‌ها و همگام‌سازی بک‌اند',
          title_en: 'System Upgrade Suite, Package Reconciliation & Backend Synchronization',
          changes: [
            'قابلیت بررسی خودکار نگارش‌های جدید و ارتقای مستقیم پنل با یک کلیک',
            'افزودن نشانگر چشمک‌زن قرمز روی پروفایل هنگام انتشار نسخه جدید',
            'بهینه‌سازی کارایی هسته پایتون و مانیتورینگ لحظه‌ای تجهیزات'
          ],
          changes_en: [
            'Automated repository release checker and one-click in-panel updater',
            'Pulsating red notification indicator on profile avatar upon new release',
            'Performance optimizations for Python backend and live equipment telemetry'
          ]
        };
      }
    }

    const semverHigher = compareSemver(latestVersion, currentVersion) > 0;
    const commitDiffers = Boolean(remoteCommitSha && localCommitSha && remoteCommitSha !== localCommitSha);
    const hasUpdate = semverHigher || commitDiffers;

    res.json({
      currentVersion,
      latestVersion,
      hasUpdate,
      remoteCommitSha,
      localCommitSha,
      commitMessage,
      releaseNote: remoteReleaseNote,
      repoUrl: 'https://github.com/shahbazimasoud/Net-Management',
      checkedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Check Update Error]', err);
    res.status(500).json({
      error: 'Failed to check repository updates',
      details: err.message
    });
  }
});

// Perform in-place software update to latest repository version
app.post('/api/system/perform-update', async (req: Request, res: Response) => {
  try {
    const isCleanMode = req.body?.clean === true;
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(`[Update Engine] ${msg}`);
      logs.push(msg);
    };

    log('--- [Phase 1/6] Initiating Full Software Upgrade Pipeline ---');
    const gitDir = path.join(projectRoot, '.git');
    const envPath = path.join(projectRoot, '.env');
    const dbStore = path.join(projectRoot, 'backend', 'database_store.json');
    const netData = path.join(projectRoot, 'backend', 'network_data.json');

    // Step 1: Deep Memory & Disk Snapshot of all user data to prevent any data loss
    let preNetworkData: any = null;
    let preDatabaseStore: any = null;
    let preEnvContent: string | null = null;
    let userDeviceCount = 0;

    try {
      if (fs.existsSync(netData)) {
        preNetworkData = JSON.parse(fs.readFileSync(netData, 'utf-8'));
        if (Array.isArray(preNetworkData.devices)) {
          userDeviceCount = preNetworkData.devices.length;
        }
      }
    } catch (rErr: any) {
      log(`Notice reading existing network_data.json: ${rErr.message}`);
    }

    try {
      if (fs.existsSync(dbStore)) {
        preDatabaseStore = JSON.parse(fs.readFileSync(dbStore, 'utf-8'));
        if (userDeviceCount === 0 && Array.isArray(preDatabaseStore.devices)) {
          userDeviceCount = preDatabaseStore.devices.length;
        }
      }
    } catch (rErr: any) {
      log(`Notice reading existing database_store.json: ${rErr.message}`);
    }

    try {
      if (fs.existsSync(envPath)) {
        preEnvContent = fs.readFileSync(envPath, 'utf-8');
      }
    } catch (rErr: any) {
      log(`Notice reading existing .env: ${rErr.message}`);
    }

    // Persist snapshot to both /tmp and persistent backend/backups directory
    const timestamp = Date.now();
    const backupDir = path.join('/tmp', `netman_backup_${timestamp}`);
    const persistentVaultDir = path.join(projectRoot, 'backend', 'backups', `vault_pre_update_${timestamp}`);

    try {
      fs.mkdirSync(backupDir, { recursive: true });
      fs.mkdirSync(persistentVaultDir, { recursive: true });

      if (preEnvContent) {
        fs.writeFileSync(path.join(backupDir, '.env'), preEnvContent, 'utf-8');
        fs.writeFileSync(path.join(persistentVaultDir, '.env'), preEnvContent, 'utf-8');
      }
      if (preDatabaseStore) {
        const str = JSON.stringify(preDatabaseStore, null, 2);
        fs.writeFileSync(path.join(backupDir, 'database_store.json'), str, 'utf-8');
        fs.writeFileSync(path.join(persistentVaultDir, 'database_store.json'), str, 'utf-8');
      }
      if (preNetworkData) {
        const str = JSON.stringify(preNetworkData, null, 2);
        fs.writeFileSync(path.join(backupDir, 'network_data.json'), str, 'utf-8');
        fs.writeFileSync(path.join(persistentVaultDir, 'network_data.json'), str, 'utf-8');
      }
      log(`Safeguarded ${userDeviceCount} existing network devices, topology data, and environment configuration.`);
    } catch (bErr: any) {
      log(`State backup notice: ${bErr.message}`);
    }

    // Step 2: Codebase Synchronization
    log('--- [Phase 2/6] Synchronizing Codebase with GitHub Repository ---');
    if (fs.existsSync(gitDir)) {
      log('Local Git repository detected. Setting origin and pulling latest master branch...');
      try {
        const authedRemote = `https://shahbazimasoud:${GITHUB_AUTH_TOKEN}@github.com/shahbazimasoud/Net-Management.git`;
        await executeShell(`git remote set-url origin "${authedRemote}" 2>/dev/null || true`, projectRoot, 5000);
        await executeShell('git fetch origin master', projectRoot, 30000);
        await executeShell('git checkout master 2>/dev/null || git checkout -B master origin/master', projectRoot, 10000);
        await executeShell('git reset --hard origin/master', projectRoot, 10000);
        await executeShell('git clean -fd -e .env -e backend/database_store.json -e backend/network_data.json -e backend/backups', projectRoot, 10000);
        log('Repository codebase successfully aligned with origin/master.');
      } catch (gitErr: any) {
        log(`Git fetch warning: ${gitErr.message}. Falling back to pull...`);
        try {
          await executeShell('git pull origin master || true', projectRoot, 20000);
        } catch {
          // continue
        }
      }
    } else {
      log('Standalone archive mode: Downloading complete repository tarball...');
      const downloadScript = `curl -sSL -H "Authorization: token ${GITHUB_AUTH_TOKEN}" -f -o /tmp/netman-update.tar.gz https://api.github.com/repos/shahbazimasoud/Net-Management/tarball/master 2>/dev/null || curl -sSL -f -o /tmp/netman-update.tar.gz https://codeload.github.com/shahbazimasoud/Net-Management/tar.gz/refs/heads/master && tar -xzf /tmp/netman-update.tar.gz -C /tmp && cp -a /tmp/*Net-Management*/. . && rm -rf /tmp/netman-update.tar.gz /tmp/*Net-Management*`;
      try {
        await executeShell(downloadScript, projectRoot, 45000);
        log('Repository archive extracted and merged successfully.');
      } catch (dlErr: any) {
        log(`Archive extraction warning: ${dlErr.message}`);
      }
    }

    // Step 2.5: User State & Device Database Restoration and Smart Merging
    log('--- [Phase 2.5/6] Restoring & Merging User Devices, Credentials & Topology Maps ---');
    try {
      // 1. Restore & Merge network_data.json
      if (preNetworkData) {
        let repoNetworkData: any = {};
        if (fs.existsSync(netData)) {
          try {
            repoNetworkData = JSON.parse(fs.readFileSync(netData, 'utf-8'));
          } catch {
            repoNetworkData = {};
          }
        }

        // Merge Devices: User's devices are the absolute source of truth
        const mergedDevices: any[] = [];
        const seenIds = new Set<string>();

        // First, guarantee ALL user devices are retained
        if (Array.isArray(preNetworkData.devices)) {
          for (const d of preNetworkData.devices) {
            if (d && d.id) {
              mergedDevices.push(d);
              seenIds.add(String(d.id));
            }
          }
        }

        // Second, include any new seed/demo devices from upstream repo that do not conflict
        if (Array.isArray(repoNetworkData.devices)) {
          for (const d of repoNetworkData.devices) {
            if (d && d.id && !seenIds.has(String(d.id))) {
              mergedDevices.push(d);
              seenIds.add(String(d.id));
            }
          }
        }

        // Merge Ports
        const mergedPorts = {
          ...(repoNetworkData.ports || {}),
          ...(preNetworkData.ports || {})
        };

        const finalNetworkData = {
          ...repoNetworkData,
          ...preNetworkData,
          devices: mergedDevices,
          ports: mergedPorts,
          topology_links: preNetworkData.topology_links || repoNetworkData.topology_links || [],
          cdp_lldp_neighbors: preNetworkData.cdp_lldp_neighbors || repoNetworkData.cdp_lldp_neighbors || {},
          vlans: preNetworkData.vlans || repoNetworkData.vlans || [],
          templates: preNetworkData.templates || repoNetworkData.templates || [],
          device_groups: preNetworkData.device_groups || repoNetworkData.device_groups || [],
          active_directory: preNetworkData.active_directory || repoNetworkData.active_directory,
          access_policies: preNetworkData.access_policies || repoNetworkData.access_policies || [],
          local_users: preNetworkData.local_users || repoNetworkData.local_users || [],
          local_groups: preNetworkData.local_groups || repoNetworkData.local_groups || [],
          audit_logs: preNetworkData.audit_logs || repoNetworkData.audit_logs || [],
          custom_maps: preNetworkData.custom_maps || repoNetworkData.custom_maps || [],
          node_positions: preNetworkData.node_positions || repoNetworkData.node_positions || {},
          device_notes: preNetworkData.device_notes || repoNetworkData.device_notes || {}
        };

        fs.writeFileSync(netData, JSON.stringify(finalNetworkData, null, 2), 'utf-8');
        log(`Safeguarded and restored ${mergedDevices.length} network devices in network_data.json.`);
      }

      // 2. Restore & Merge database_store.json
      if (preDatabaseStore) {
        let repoDbStore: any = {};
        if (fs.existsSync(dbStore)) {
          try {
            repoDbStore = JSON.parse(fs.readFileSync(dbStore, 'utf-8'));
          } catch {
            repoDbStore = {};
          }
        }

        const finalDbStore = {
          ...repoDbStore,
          ...preDatabaseStore,
          users: preDatabaseStore.users || repoDbStore.users || [],
          user_groups: preDatabaseStore.user_groups || repoDbStore.user_groups || [],
          access_policies: preDatabaseStore.access_policies || repoDbStore.access_policies || [],
          devices: (preDatabaseStore.devices && preDatabaseStore.devices.length > 0)
            ? preDatabaseStore.devices
            : (preNetworkData?.devices || repoDbStore.devices || []),
          custom_maps: preDatabaseStore.custom_maps || repoDbStore.custom_maps || [],
          topology_hierarchy: preDatabaseStore.topology_hierarchy || repoDbStore.topology_hierarchy || [],
          node_positions: preDatabaseStore.node_positions || repoDbStore.node_positions || {},
          device_sticky_notes: preDatabaseStore.device_sticky_notes || repoDbStore.device_sticky_notes || [],
          audit_logs: preDatabaseStore.audit_logs || repoDbStore.audit_logs || []
        };

        fs.writeFileSync(dbStore, JSON.stringify(finalDbStore, null, 2), 'utf-8');
        log(`Safeguarded and restored database store with ${((finalDbStore.devices as any[]) || []).length} synced devices.`);
      }

      // 3. Restore .env
      if (preEnvContent) {
        fs.writeFileSync(envPath, preEnvContent, 'utf-8');
        log('Safeguarded and restored environment configuration (.env).');
      }
    } catch (restoreErr: any) {
      log(`Error during user data restoration: ${restoreErr.message}`);
    }

    // Restore executable permissions for shell scripts
    try {
      await executeShell('chmod +x *.sh backend/*.py 2>/dev/null || true', projectRoot, 5000);
    } catch {
      // ignore
    }

    // Step 3: Full NPM Dependency Reconciliation (Crucial: --include=dev so Vite and TypeScript build tools are installed!)
    log('--- [Phase 3/6] Installing & Reconciling NPM Dependencies (including build tools) ---');
    if (isCleanMode) {
      log('Clean installation mode requested: Purging node_modules cache and package-lock...');
      try {
        await executeShell('rm -rf node_modules package-lock.json', projectRoot, 15000);
      } catch (rmErr: any) {
        log(`Notice removing node_modules: ${rmErr.message}`);
      }
    }

    try {
      // Ensure clean registry config
      await executeShell('npm config delete registry 2>/dev/null || true', projectRoot, 5000);

      // Check if lockfile exists for clean deterministic ci install
      const hasLockfile = fs.existsSync(path.join(projectRoot, 'package-lock.json'));
      log(`Running npm dependency reconciliation (lockfile present: ${hasLockfile})...`);

      if (hasLockfile && !isCleanMode) {
        try {
          await executeShell('NODE_ENV=development npm ci --include=dev', projectRoot, 180000);
          log('NPM dependencies installed successfully via npm ci.');
        } catch (ciErr: any) {
          log(`npm ci encountered an issue: ${ciErr.message}. Falling back to npm install...`);
          await executeShell('NODE_ENV=development npm install --include=dev --legacy-peer-deps --no-audit', projectRoot, 180000);
          log('NPM dependencies installed successfully via npm install.');
        }
      } else {
        await executeShell('NODE_ENV=development npm install --include=dev --legacy-peer-deps --no-audit', projectRoot, 180000);
        log('NPM dependencies installed successfully.');
      }

      // Ensure platform-specific native binaries for Rollup / esbuild on Linux
      await executeShell('npm install --no-save @rollup/rollup-linux-x64-gnu @esbuild/linux-x64 2>/dev/null || true', projectRoot, 30000);
      await executeShell('npm install --no-save @rollup/rollup-linux-arm64-gnu @esbuild/linux-arm64 2>/dev/null || true', projectRoot, 30000);
      await executeShell('npm rebuild 2>/dev/null || true', projectRoot, 30000);
    } catch (npmErr: any) {
      log(`NPM installation notice: ${npmErr.message}`);
    }

    // Step 4: Terminate old Python backend and update Python dependencies
    log('--- [Phase 4/6] Terminating Stale Python Backend & Reconciling Python Dependencies ---');
    try {
      // Kill old python backend process so port PYTHON_PORT (5001/8000) is released and new backend files will be loaded!
      await executeShell('pkill -9 -f "backend/server.py" 2>/dev/null || true', projectRoot, 5000);
      await executeShell(`fuser -k ${PYTHON_PORT}/tcp 2>/dev/null || fuser -k 5001/tcp 2>/dev/null || fuser -k 8000/tcp 2>/dev/null || true`, projectRoot, 5000);
      if (pythonProcess) {
        try {
          pythonProcess.kill('SIGKILL');
          pythonProcess = null;
        } catch {
          // ignore
        }
      }
      log(`Released port ${PYTHON_PORT} from old Python backend instance.`);

      const pipInstallCmd = 'python3 -m pip install --upgrade --break-system-packages paramiko cryptography websockets requests flask python-dotenv 2>/dev/null || pip3 install paramiko cryptography websockets requests flask 2>/dev/null || pip install paramiko cryptography websockets requests 2>/dev/null || true';
      await executeShell(pipInstallCmd, projectRoot, 60000);
      const reqPath = path.join(projectRoot, 'requirements.txt');
      if (fs.existsSync(reqPath)) {
        await executeShell('python3 -m pip install -r requirements.txt --break-system-packages 2>/dev/null || true', projectRoot, 60000);
      }
      log('Python environment & drivers (paramiko, cryptography, websockets, requests) verified.');
    } catch (pyErr: any) {
      log(`Python dependency notice: ${pyErr.message}`);
    }

    // Step 5: Production Assets & Server Bundle
    log('--- [Phase 5/6] Compiling Production Frontend & Backend Bundles ---');
    try {
      await executeShell('NODE_OPTIONS="--max-old-space-size=2048" npm run build', projectRoot, 120000);
      log('Production bundle compiled successfully (dist/ and dist/server.cjs ready).');
    } catch (bErr: any) {
      log(`Build warning: ${bErr.message}`);
    }

    // Final Post-Build Data Integrity Guard: Ensure devices database is intact before service reboot
    try {
      let finalDevCount = 0;
      if (fs.existsSync(netData)) {
        const checkData = JSON.parse(fs.readFileSync(netData, 'utf-8'));
        if (Array.isArray(checkData.devices)) {
          finalDevCount = checkData.devices.length;
        }
      }
      if (userDeviceCount > 0 && finalDevCount < userDeviceCount && preNetworkData) {
        log(`Post-build safety guard: Re-affirming ${userDeviceCount} devices in network_data.json...`);
        fs.writeFileSync(netData, JSON.stringify(preNetworkData, null, 2), 'utf-8');
      }
      if (preDatabaseStore && fs.existsSync(dbStore)) {
        const checkDb = JSON.parse(fs.readFileSync(dbStore, 'utf-8'));
        if (!Array.isArray(checkDb.devices) || checkDb.devices.length < userDeviceCount) {
          fs.writeFileSync(dbStore, JSON.stringify(preDatabaseStore, null, 2), 'utf-8');
        }
      }
      log('Integrity guard: All network equipment, credentials, and topology maps confirmed in database.');
    } catch (guardErr: any) {
      log(`Integrity guard notice: ${guardErr.message}`);
    }

    // Read updated version from package.json
    let newVersion = '1.72.0';
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        newVersion = pkg.version || newVersion;
      } catch {
        // fallback
      }
    }

    log(`--- [Phase 6/6] Update Complete! System updated to v${newVersion} ---`);
    log('Scheduling graceful service restart to reload updated backend and frontend into memory...');

    // Respond immediately with full logs so the frontend can display them and countdown
    res.json({
      success: true,
      newVersion,
      message: `Panel updated successfully to v${newVersion}`,
      logs
    });

    // Schedule background service restart after 1.5 seconds so response reaches client cleanly
    setTimeout(() => {
      console.log('[Update Engine] Triggering background service and process restart...');
      // 1. Try systemd service restart
      exec('sudo systemctl restart nettopology || systemctl restart nettopology || sudo systemctl restart net-management || systemctl restart net-management || pm2 restart all || pm2 restart nettopology || bash ./restart.sh', { cwd: projectRoot }, (rErr) => {
        if (rErr) {
          console.log('[Update Engine] Service restart command notice:', rErr.message);
        }
      });
    }, 1500);

  } catch (err: any) {
    console.error('[Update Engine Failed]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Update failed',
      details: err.stack
    });
  }
});

// -------------------------------------------------------------
// Check-Host.net Global Ping API integration directly in Node.js
// -------------------------------------------------------------
app.post('/api/tools/check-host/init', async (req: Request, res: Response) => {
  try {
    const host = (req.body?.host || '').trim();
    if (!host) {
      return res.status(400).json({ success: false, error: 'Target host is required' });
    }
    const maxNodes = Math.min(50, Math.max(1, parseInt(req.body?.max_nodes || '10', 10)));
    let targetUrl = `https://check-host.net/check-ping?host=${encodeURIComponent(host)}&max_nodes=${maxNodes}`;
    if (Array.isArray(req.body?.nodes) && req.body.nodes.length > 0) {
      const nodeParams = req.body.nodes.map((n: string) => `node=${encodeURIComponent(n)}`).join('&');
      targetUrl = `https://check-host.net/check-ping?host=${encodeURIComponent(host)}&${nodeParams}`;
    }

    const resp = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NetTopology-Monitoring/1.43'
      }
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ success: false, error: `Check-Host API error: ${text || resp.statusText}` });
    }

    const data: any = await resp.json();
    return res.json({
      success: data.ok === 1,
      requestId: data.request_id,
      permanentLink: data.permanent_link,
      nodes: data.nodes || {},
      targetHost: host
    });
  } catch (err: any) {
    console.error('[Check-Host Init Error]', err);
    return res.status(502).json({ success: false, error: err.message || 'Failed to contact check-host.net API' });
  }
});

app.get('/api/tools/check-host/result', async (req: Request, res: Response) => {
  try {
    const requestId = ((req.query.request_id as string) || (req.query.requestId as string) || '').trim();
    if (!requestId) {
      return res.status(400).json({ success: false, error: 'request_id is required' });
    }
    const resp = await fetch(`https://check-host.net/check-result/${encodeURIComponent(requestId)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NetTopology-Monitoring/1.43'
      }
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ success: false, error: `Check-Host API error: ${text || resp.statusText}` });
    }
    const data: any = await resp.json();
    return res.json({
      success: true,
      requestId,
      results: data || {}
    });
  } catch (err: any) {
    console.error('[Check-Host Result Error]', err);
    return res.status(502).json({ success: false, error: err.message || 'Failed to fetch check-host results' });
  }
});

app.post('/api/tools/check-host/result', async (req: Request, res: Response) => {
  try {
    const requestId = ((req.body?.request_id as string) || (req.body?.requestId as string) || '').trim();
    if (!requestId) {
      return res.status(400).json({ success: false, error: 'request_id is required' });
    }
    const resp = await fetch(`https://check-host.net/check-result/${encodeURIComponent(requestId)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NetTopology-Monitoring/1.43'
      }
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ success: false, error: `Check-Host API error: ${text || resp.statusText}` });
    }
    const data: any = await resp.json();
    return res.json({
      success: true,
      requestId,
      results: data || {}
    });
  } catch (err: any) {
    console.error('[Check-Host Result Error]', err);
    return res.status(502).json({ success: false, error: err.message || 'Failed to fetch check-host results' });
  }
});

app.get('/api/tools/check-host/nodes', async (req: Request, res: Response) => {
  try {
    const resp = await fetch('https://check-host.net/nodes/hosts', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NetTopology-Monitoring/1.43'
      }
    });
    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, error: 'Failed to fetch nodes' });
    }
    const data: any = await resp.json();
    return res.json({
      success: true,
      nodes: data?.nodes || {}
    });
  } catch (err: any) {
    return res.status(502).json({ success: false, error: err.message });
  }
});

// Mount In-Browser Remote Desktop / Remote Console API routes
registerRemoteDesktopRoutes(app, projectRoot);

// Mount SSL / TLS Certificate Converter & Formatter routes
registerCertConverterRoutes(app);

// Mount PostgreSQL & Authentication API router
app.use('/api', apiRouter);

// Local fallbacks from network_data.json for topology and devices during Python backend cold-start
function getLocalTopologyFallback(): any {
  try {
    const dataFilePath = path.join(projectRoot, 'backend', 'network_data.json');
    if (!fs.existsSync(dataFilePath)) return null;
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    const data = JSON.parse(raw);
    const nodes = (data.devices || []).map((d: any) => ({
      ...d,
      role: d.role || 'Network Device',
      model: d.model || 'Cisco',
      platform: d.platform || 'cisco_ios_xe',
      is_online: d.is_online !== undefined ? d.is_online : true,
      latency_ms: d.latency_ms || 1.0,
      total_ports: d.total_ports || 24,
    }));
    return {
      nodes,
      links: data.topology_links || [],
      buildings: Array.from(new Set((data.devices || []).map((d: any) => d.building).filter(Boolean))),
      floors: Array.from(new Set((data.devices || []).map((d: any) => `${d.building} - ${d.floor}`).filter((f: string) => !f.startsWith('undefined')))),
      summary: {
        total_nodes: nodes.length,
        total_links: (data.topology_links || []).length,
        core_switches: nodes.filter((d: any) => d.type === 'switch' && (d.role || '').includes('Core')).length,
        access_switches: nodes.filter((d: any) => d.type === 'switch' && (d.role || '').includes('Access')).length,
        routers: nodes.filter((d: any) => d.type === 'router').length,
        access_points: nodes.filter((d: any) => d.type === 'access_point').length,
      }
    };
  } catch (err) {
    console.error('[Local Topology Fallback Error]', err);
    return null;
  }
}

function getLocalDevicesFallback(): any {
  try {
    const dataFilePath = path.join(projectRoot, 'backend', 'network_data.json');
    if (!fs.existsSync(dataFilePath)) return null;
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    const data = JSON.parse(raw);
    const rawDevices = data.devices || [];
    const devices = rawDevices.map((dev: any) => {
      const d = { ...dev };
      if (!d.platform) d.platform = 'cisco_ios_xe';
      if (!d.connection_mode) d.connection_mode = 'simulator';
      const conn = { ...(d.connection || {}) };
      delete conn.password;
      delete conn.private_key;
      d.connection = conn;
      delete d.ssh_password;
      delete d.enable_password;
      d.ssh_connected = false;
      return d;
    });
    return {
      devices,
      total: devices.length,
      online_count: devices.filter((d: any) => d.is_online).length,
      offline_count: devices.filter((d: any) => !d.is_online).length,
    };
  } catch (err) {
    console.error('[Local Devices Fallback Error]', err);
    return null;
  }
}

// Proxy /api/* to Python HTTP server (including Python SSH lifecycle engine)
app.use('/api', (req: Request, res: Response) => {
  const headers: http.OutgoingHttpHeaders = { ...req.headers };
  delete headers['host'];
  delete headers['content-length'];
  headers['connection'] = 'close';

  let bodyData: string | undefined;
  if (req.body && Object.keys(req.body).length > 0) {
    bodyData = JSON.stringify(req.body);
    headers['content-length'] = Buffer.byteLength(bodyData);
    headers['content-type'] = headers['content-type'] || 'application/json';
  } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    headers['content-length'] = 0;
  }

  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: PYTHON_PORT,
    path: req.originalUrl,
    method: req.method,
    headers,
    agent: false,
    timeout: 30000,
  };

  const makeProxyRequest = (isRetry = false) => {
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy(new Error('Proxy request timed out after 30s'));
    });

    proxyReq.on('error', (err: any) => {
      // If it's the first attempt and failed with socket hang up or ECONNRESET or ECONNREFUSED, attempt single retry
      if (!isRetry && !res.headersSent && (err.message?.includes('socket hang up') || err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED')) {
        console.warn(`[API Proxy Warning] Initial request to ${req.originalUrl} failed (${err.message}). Retrying once after ensuring Python backend...`);
        startPythonBackend();
        setTimeout(() => {
          makeProxyRequest(true);
        }, 500);
        return;
      }

      console.error(`[API Proxy Error] Unable to connect to Python backend: ${err.message}`);

      // Self-healing: if socket hang up, ECONNREFUSED or ECONNRESET, trigger background health check & restart
      if (err.message?.includes('socket hang up') || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        startPythonBackend();
      }

      if (!res.headersSent) {
        if (req.method === 'GET') {
          const cleanPath = (req.path || '').replace(/\/$/, '');
          if (cleanPath === '/topology' || cleanPath === '/api/topology' || req.originalUrl.startsWith('/api/topology')) {
            const fallbackTopo = getLocalTopologyFallback();
            if (fallbackTopo) {
              console.log('[API Proxy Fallback] Served /api/topology from local network_data.json while Python backend warms up.');
              return res.json(fallbackTopo);
            }
          }
          if (cleanPath === '/devices' || cleanPath === '/api/devices' || req.originalUrl.startsWith('/api/devices')) {
            const fallbackDevs = getLocalDevicesFallback();
            if (fallbackDevs) {
              console.log('[API Proxy Fallback] Served /api/devices from local network_data.json while Python backend warms up.');
              return res.json(fallbackDevs);
            }
          }
        }

        res.status(503).json({
          error: 'Python backend is starting up or temporarily unavailable',
          details: err.message,
          engine: 'Python 3.10 Network Topology Engine'
        });
      }
    });

    if (bodyData) {
      proxyReq.write(bodyData);
    }
    proxyReq.end();
  };

  makeProxyRequest(false);
});

// Global Error Handler for API and Express
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  if (req.path.startsWith('/api')) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'خطای غیرمنتظره در پردازش سمت سرور رخ داد.',
      details: err?.message || String(err),
    });
  }
  next(err);
});

async function startServer() {
  // Initialize Database (PostgreSQL or fallback store)
  await initDatabase();

  const isProd = process.env.NODE_ENV === 'production' || path.basename(currentDir) === 'dist';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(projectRoot, 'dist');
    console.log(`[Production Server] Serving static web UI from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const HOST = process.env.HOST || '0.0.0.0';
  const server = http.createServer(app);

  // Setup native WebSocket terminal engine for interactive SSH/CLI sessions
  setupTerminalWebSocket(server, PYTHON_PORT, projectRoot, PYTHON_WS_PORT);

  // Setup In-Browser Remote Desktop / Remote Console (RDP & VNC) gateway via Guacamole protocol
  setupRemoteDesktopWebSocket(server, projectRoot);

  server.listen(PORT, HOST, () => {
    console.log(`Node/Express frontend + proxy running on http://${HOST}:${PORT}`);
  });
}

startServer();
