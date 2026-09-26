import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

/**
 * Terminal WebSocket Gateway
 * Bridges interactive terminal WebSocket streams from the frontend directly
 * to the Python Paramiko SSH engine (running on ws://127.0.0.1:${pythonWsPort}).
 * Ensures 100% real Paramiko SSHv2 execution with zero fake or simulated data.
 */
export function setupTerminalWebSocket(
  server: http.Server,
  pythonPort: number,
  projectRoot: string,
  pythonWsPort: number = 5002
) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = req.url || '';
    if (
      url.startsWith('/ws/terminal') ||
      url.startsWith('/api/terminal/ws') ||
      url.startsWith('/ws/ssh') ||
      url.startsWith('/ssh')
    ) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  wss.on('connection', (clientWs: WebSocket, req: http.IncomingMessage) => {
    const hostHeader = req.headers.host || '127.0.0.1:3000';
    const parsedUrl = new URL(req.url || '', `http://${hostHeader}`);

    // Extract device_id from path /ws/ssh/:deviceId or query params
    let deviceId = '';
    const cleanPath = parsedUrl.pathname.replace(/^\/+/, '');
    const parts = cleanPath.split('/');
    if (parts.length >= 3 && parts[0] === 'ws' && parts[1] === 'ssh') {
      deviceId = parts[2];
    } else if (parts.length >= 2 && parts[0] === 'ssh') {
      deviceId = parts[1];
    }

    if (!deviceId) {
      deviceId = parsedUrl.searchParams.get('deviceId') || parsedUrl.searchParams.get('device_id') || '';
    }

    let rawHost = parsedUrl.searchParams.get('host') || parsedUrl.searchParams.get('ip') || '';
    let host = rawHost === 'undefined' || rawHost === 'null' ? '' : rawHost;
    let portStr = parsedUrl.searchParams.get('port') || '22';
    let port = parseInt(portStr === 'undefined' || portStr === 'null' ? '22' : portStr, 10) || 22;
    let rawUser = parsedUrl.searchParams.get('username') || parsedUrl.searchParams.get('user') || 'root';
    let username = rawUser === 'undefined' || rawUser === 'null' ? 'root' : rawUser;
    let rawPassword = parsedUrl.searchParams.get('password') || '';
    let password = rawPassword === 'undefined' || rawPassword === 'null' ? '' : rawPassword;
    let platform = parsedUrl.searchParams.get('platform') || '';

    // If host is not in query params or empty, look up in database_store.json
    if (!host && deviceId && deviceId !== 'undefined' && deviceId !== 'null') {
      try {
        const storePath = path.resolve(projectRoot, 'backend', 'database_store.json');
        if (fs.existsSync(storePath)) {
          const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
          const srv = (store.remote_servers || []).find(
            (s: any) => s.id === deviceId || s.name === deviceId || s.hostname === deviceId
          );
          if (srv) {
            host = srv.ip || srv.hostname || '';
            port = srv.ssh_port || 22;
            username = srv.ssh_username || 'root';
            platform = 'linux';
            if (!password && !srv.prompt_password_on_connect) {
              password = srv.ssh_password || '';
            }
          } else {
            const dev = (store.devices || []).find((d: any) => d.id === deviceId || d.name === deviceId);
            if (dev) {
              host = dev.ip || '';
              port = dev.connection?.port || dev.ssh_port || 22;
              username = dev.connection?.username || dev.ssh_username || 'admin';
              platform = dev.platform || dev.type || 'cisco_ios';
              if (!password) {
                password = dev.connection?.password || dev.ssh_password || '';
              }
            }
          }
        }
      } catch (err) {
        console.warn('[TerminalWs] Database store lookup warning:', err);
      }
    }

    // Construct target URL for Python backend WebSocket server
    const targetUrl = new URL(req.url || '', `http://127.0.0.1:${pythonWsPort}`);
    if (deviceId && !targetUrl.searchParams.get('deviceId') && !targetUrl.searchParams.get('device_id')) {
      targetUrl.searchParams.set('deviceId', deviceId);
    }
    if (host && !targetUrl.searchParams.get('host') && !targetUrl.searchParams.get('ip')) {
      targetUrl.searchParams.set('host', host);
    }
    if (port && !targetUrl.searchParams.get('port')) {
      targetUrl.searchParams.set('port', String(port));
    }
    if (username && !targetUrl.searchParams.get('username') && !targetUrl.searchParams.get('user')) {
      targetUrl.searchParams.set('username', username);
    }
    if (password && !targetUrl.searchParams.get('password')) {
      targetUrl.searchParams.set('password', password);
    }
    if (platform && !targetUrl.searchParams.get('platform')) {
      targetUrl.searchParams.set('platform', platform);
    }

    const pythonWsUrl = `ws://127.0.0.1:${pythonWsPort}${targetUrl.pathname}${targetUrl.search}`;
    console.log(`[TerminalWs] Proxying terminal WebSocket to Python Paramiko engine: ws://127.0.0.1:${pythonWsPort}${targetUrl.pathname} (Device: ${deviceId}, Target: ${host}:${port})`);

    // Connect directly to Python Paramiko WebSocket server
    let pythonWs: WebSocket | null = null;
    const messageQueue: Array<WebSocket.Data> = [];
    let isPythonWsOpen = false;

    try {
      pythonWs = new WebSocket(pythonWsUrl);
    } catch (wsInitErr: any) {
      console.error('[TerminalWs] Failed to create WebSocket to Python backend:', wsInitErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: `Failed to initialize Python SSH WebSocket client: ${wsInitErr.message}`,
          code: 'BACKEND_INIT_ERROR',
        }));
        clientWs.send(JSON.stringify({
          type: 'status',
          status: 'failed',
          message: 'Python backend WebSocket client initialization failed.',
        }));
      }
      return;
    }

    pythonWs.on('open', () => {
      isPythonWsOpen = true;
      while (messageQueue.length > 0) {
        const queued = messageQueue.shift();
        if (queued !== undefined && pythonWs?.readyState === WebSocket.OPEN) {
          pythonWs.send(queued);
        }
      }
    });

    pythonWs.on('message', (data: WebSocket.Data) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    });

    pythonWs.on('error', (err: Error) => {
      console.warn(`[TerminalWs] Python Paramiko WebSocket error on port ${pythonWsPort}:`, err.message);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: `Python Paramiko SSH Engine is unreachable on ws://127.0.0.1:${pythonWsPort}.`,
          code: 'PYTHON_BACKEND_UNAVAILABLE',
          diagnostic: {
            category: 'BACKEND_SERVICE_OFFLINE',
            host,
            port,
            username,
            root_cause_en: `The Python SSH backend daemon (server.py) is not responding on port ${pythonWsPort}.`,
            root_cause_fa: `سرویس بک‌اند پایتون (server.py) روی پورت ${pythonWsPort} پاسخگو نیست.`,
            workflow_steps_en: [
              'Verify python3 backend process is running: ps aux | grep server.py',
              `Check listening ports: ss -tulpn | grep ${pythonWsPort}`,
              'Restart backend service: ./restart.sh or python3 backend/server.py',
            ],
            workflow_steps_fa: [
              'بررسی فعال بودن پروسه پایتون: ps aux | grep server.py',
              `بررسی پورت فعال: ss -tulpn | grep ${pythonWsPort}`,
              'راه‌اندازی مجدد سرویس: ./restart.sh یا اجرای دستی python3 backend/server.py',
            ],
          },
        }));
        clientWs.send(JSON.stringify({
          type: 'status',
          status: 'failed',
          category: 'BACKEND_SERVICE_OFFLINE',
          message: `Python Paramiko SSH Engine unavailable on port ${pythonWsPort}.`,
        }));
        clientWs.send(JSON.stringify({
          type: 'data',
          data: `\r\n\x1b[1;31m[BACKEND CONNECTION ERROR]\x1b[0m Python Paramiko SSH engine is not responding on port ${pythonWsPort}.\r\n`,
        }));
      }
    });

    pythonWs.on('close', () => {
      if (clientWs.readyState === WebSocket.OPEN || clientWs.readyState === WebSocket.CONNECTING) {
        clientWs.close();
      }
    });

    clientWs.on('message', (data: WebSocket.Data) => {
      if (isPythonWsOpen && pythonWs?.readyState === WebSocket.OPEN) {
        pythonWs.send(data);
      } else if (pythonWs?.readyState === WebSocket.CONNECTING) {
        if (messageQueue.length < 200) {
          messageQueue.push(data);
        }
      }
    });

    clientWs.on('close', () => {
      if (pythonWs && (pythonWs.readyState === WebSocket.OPEN || pythonWs.readyState === WebSocket.CONNECTING)) {
        try {
          pythonWs.close();
        } catch {}
      }
    });
  });
}
