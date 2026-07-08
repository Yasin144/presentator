'use strict';

const { app, BrowserWindow, Menu, ipcMain, dialog, shell, globalShortcut, protocol } = require('electron');

// Register app:// as a privileged scheme BEFORE app.ready (Electron requirement)
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true,
    supportFetchAPI: true,
    allowServiceWorkers: true,
    stream: true,
    corsEnabled: true,
  }
}]);
const { spawn, execFile }  = require('child_process');
const path       = require('path');
const fs         = require('fs');
const http       = require('http');
const os         = require('os');

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Memory & GPU flags (set BEFORE app.ready) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// System has 15.3 GB total RAM. Python ML servers (Chatterbox TTS + SC3) use ~4-5 GB.
// Limiting renderer V8 heap to 2 GB prevents OOM crashes during video processing.
app.commandLine.appendSwitch('js-flags',
  '--max-old-space-size=2048 --expose-gc --turbo-fast-api-calls'
);
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

const ROOT    = __dirname;
const IS_DEV  = !app.isPackaged && process.env.PRESENTATOR_DEV === '1';

const CAPTION_WORK_ROOT = path.join(ROOT, 'caption-work');
function ensureCaptionWorkDir(...segments) {
  const dir = path.join(CAPTION_WORK_ROOT, ...segments);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const groqKeyPath = path.join(ROOT, '.groq_api_key');
if (!process.env.GROQ_API_KEY && fs.existsSync(groqKeyPath)) {
  try {
    process.env.GROQ_API_KEY = fs.readFileSync(groqKeyPath, 'utf8').trim();
  } catch (e) {
    console.error('[PP] Failed to read .groq_api_key file:', e.message);
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main-process crash guard (prevents silent death) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// If any unhandled error slips past, log it but DON'T let the main process die.
process.on('uncaughtException', (err) => {
  console.error('[PP] UNCAUGHT EXCEPTION (main process):', err);
  // Don't rethrow Ã¢â‚¬â€ keep the process alive
});
process.on('unhandledRejection', (reason) => {
  console.error('[PP] UNHANDLED REJECTION (main process):', reason);
});

const VITE_URL = 'http://127.0.0.1:5173';

// Guard all console output against EPIPE on shutdown
['log','warn','error'].forEach(method => {
  const orig = console[method].bind(console);
  console[method] = (...args) => { try { orig(...args); } catch(_) {} };
});

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Server registry Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Each entry holds the live child process + restart metadata.
const servers = {};   // key Ã¢â€ â€™ { proc, restartCount, lastRestartAt, stopped }
let   isQuitting = false;

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Spawn a managed server process Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Options:
//   maxRestarts   Ã¢â‚¬â€œ max restarts within restartWindowSec before giving up (default 8)
//   restartWindowSec Ã¢â‚¬â€œ rolling window in seconds                          (default 120)
//   restartDelayMs   Ã¢â‚¬â€œ base delay before first restart                    (default 3000)
//   healthPort       Ã¢â‚¬â€œ TCP port to health-ping (optional)
//   healthPath       Ã¢â‚¬â€œ HTTP path to ping                                  (default '/')
function spawnManaged(key, cmd, args, opts = {}) {
  const {
    maxRestarts      = 8,
    restartWindowSec = 120,
    restartDelayMs   = 3000,
    env              = {},
    cwd              = ROOT,
    showConsole      = false,
  } = opts;

  const entry = servers[key] || {
    restartCount: 0,
    lastRestartAt: 0,
    stopped: false,
  };
  servers[key] = entry;

  function doSpawn() {
    if (isQuitting || entry.stopped) return;

    console.log(`[PP] Starting ${key}...`);
    // On Windows, .cmd and .bat files need shell:true to execute Ã¢â‚¬â€
    // without it Node.js throws EINVAL.
    const needsShell = showConsole || /\.(cmd|bat)$/i.test(cmd);
    const proc = spawn(cmd, args, {
      cwd,
      detached: false,
      stdio:    'ignore',
      shell:    needsShell,
      windowsHide: showConsole ? false : true,
      env: { ...process.env, ...env },
    });

    entry.proc = proc;

    proc.on('error', (e) => {
      console.error(`[PP] ${key} spawn error:`, e.message);
    });

    proc.on('exit', (code, signal) => {
      if (isQuitting || entry.stopped) return;
      console.warn(`[PP] ${key} exited (code=${code} signal=${signal}) Ã¢â‚¬â€ scheduling restart`);
      scheduleRestart();
    });
  }

  function scheduleRestart() {
    if (isQuitting || entry.stopped) return;

    const now = Date.now();
    // Reset counter if outside the rolling window
    if (now - entry.lastRestartAt > restartWindowSec * 1000) {
      entry.restartCount = 0;
    }

    if (entry.restartCount >= maxRestarts) {
      console.error(`[PP] ${key} hit max restarts (${maxRestarts}) in ${restartWindowSec}s Ã¢â‚¬â€ giving up.`);
      return;
    }

    // Exponential back-off: 3s, 6s, 12s Ã¢â‚¬Â¦ capped at 30s
    const delay = Math.min(restartDelayMs * Math.pow(2, entry.restartCount), 30000);
    entry.restartCount++;
    entry.lastRestartAt = now;

    console.log(`[PP] ${key} restart #${entry.restartCount} in ${delay}msÃ¢â‚¬Â¦`);
    setTimeout(() => {
      if (!isQuitting && !entry.stopped) doSpawn();
    }, delay);
  }

  doSpawn();
  return entry;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Kill a managed server (no restart) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function killServer(key) {
  const entry = servers[key];
  if (!entry) return;
  entry.stopped = true;
  if (entry.proc && !entry.proc.killed) {
    try { entry.proc.kill('SIGTERM'); } catch(_) {}
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Force-restart a managed server Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function restartServer(key) {
  const entry = servers[key];
  if (!entry) return;
  entry.stopped = false;
  entry.restartCount = 0;
  if (entry.proc && !entry.proc.killed) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/PID', String(entry.proc.pid), '/T', '/F'], {
          detached: false,
          stdio: 'ignore',
          windowsHide: true,
        });
      } else {
        entry.proc.kill('SIGTERM');
      }
    } catch(_) {}
    // The 'exit' event will trigger a new spawn via scheduleRestart
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Kill ALL servers on app exit Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function killAll() {
  isQuitting = true;
  for (const key of Object.keys(servers)) {
    killServer(key);
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Ping a TCP port to check health Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function pingPort(port, path_ = '/health', timeoutMs = 4000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { req.destroy(); resolve(false); }, timeoutMs);
    const req = http.get({ hostname: '127.0.0.1', port, path: path_, agent: false }, (res) => {
      clearTimeout(timer);
      resolve(res.statusCode < 500);
    });
    req.on('error', () => { clearTimeout(timer); resolve(false); });
  });
}

function postJsonForBuffer(port, path_, payload, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(payload || {}), 'utf8');
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: path_,
      method: 'POST',
      agent: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'Connection': 'close',
      },
      timeout: timeoutMs,
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers || {},
          buffer,
        });
      });
      res.on('error', reject);
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms.`));
    });
    req.on('error', reject);
    req.end(body);
  });
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Edge TTS health-check watchdog Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Pings port 8426 every 20 seconds. If unreachable, kills the process so
// the auto-restart watchdog in spawnManaged fires immediately.
let anjaliHealthTimer = null;
let anjaliHealthFailureCount = 0;

function startAnjaliWatchdog() {
  if (anjaliHealthTimer) clearInterval(anjaliHealthTimer);
  anjaliHealthTimer = setInterval(async () => {
    if (isQuitting) return;
    const alive = await pingPort(8426, '/health', 10000);
    if (alive) {
      anjaliHealthFailureCount = 0;
      return;
    }

    anjaliHealthFailureCount += 1;
    console.warn(`[PP] Voice server health-check miss ${anjaliHealthFailureCount}/5`);
    if (anjaliHealthFailureCount < 5) {
      return;  // allow 5 Ãƒâ€” 30s = 150 seconds before restart
    }
    anjaliHealthFailureCount = 0;

    if (!alive) {
      console.warn('[PP] Voice server health-check FAILED Ã¢â‚¬â€ forcing restart...');
      const entry = servers['AnjaliAI'];
      if (entry) {
        entry.stopped  = false;
        entry.restartCount = 0;
        if (entry.proc && !entry.proc.killed) {
          try {
            if (process.platform === 'win32') {
              spawn('taskkill', ['/PID', String(entry.proc.pid), '/T', '/F'], {
                detached: false,
                stdio: 'ignore',
                windowsHide: true,
              });
            } else {
              entry.proc.kill('SIGTERM');
            }
          } catch(_) {}
        } else {
          entry.lastRestartAt = 0;
          entry.restartCount  = 0;
          setTimeout(() => startAnjaliServer(), 1000);
        }
      }
      BrowserWindow.getAllWindows().forEach(w => {
        w.webContents.send('server-status', {
          server: 'anjali',
          status: 'restarting',
          message: 'Voice server went offline Ã¢â‚¬â€ restarting automatically...'
        });
      });
    }
  }, 30000); // ping every 30s; restart only after 5 consecutive misses = 150s grace
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Start individual servers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const PS = process.env.SYSTEMROOT
  ? path.join(process.env.SYSTEMROOT, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  : 'powershell';
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const ANJALI_PYTHON = path.join(ROOT, '.voiceclone-venv', 'Scripts', 'python.exe');
const SINGING_PYTHON = path.join(ROOT, '.singing-venv', 'Scripts', 'python.exe');
const ANJALI_SERVER = path.join(ROOT, 'anjali-chatterbox-server.py');
const EDGE_TTS_SERVER = path.join(ROOT, 'timed-voiceover-server.py');
const SC3_SINGING_SERVER = path.join(ROOT, 'sc3-singing-server.py');
const WHISPER_PYTHON = path.join(ROOT, '.singing-venv', 'Scripts', 'python.exe');
const WHISPER_SCRIPT = path.join(ROOT, 'whisper-transcribe.py');
// PYTHONPATH lets system Python 3.12 find chatterbox/torch/edge_tts from the venv
const VENV_SITE_PACKAGES = path.join(ROOT, '.voiceclone-venv', 'Lib', 'site-packages');
const SINGING_SITE_PACKAGES = path.join(ROOT, '.singing-venv', 'Lib', 'site-packages');
const PYTHON_ENV = {
  PYTHONUTF8: '1',
  PYTHONUNBUFFERED: '1',
  PYTHONPATH: VENV_SITE_PACKAGES,
};
const SINGING_ENV = {
  PYTHONUTF8: '1',
  PYTHONUNBUFFERED: '1',
  PYTHONPATH: SINGING_SITE_PACKAGES + ';' + VENV_SITE_PACKAGES,
};

function isAnjaliServerProcessRunning() {
  return new Promise((resolve) => {
    const scriptNeedle = 'anjali-chatterbox-server.py';
    const command = [
      "Get-CimInstance Win32_Process",
      "| Where-Object { $_.Name -like 'python*' -and $_.CommandLine -like '*" + scriptNeedle + "*' }",
      "| Select-Object -First 1 -ExpandProperty ProcessId"
    ].join(' ');
    execFile(PS, ['-NoProfile', '-NonInteractive', '-Command', command], {
      cwd: ROOT,
      windowsHide: true,
      timeout: 5000,
    }, (error, stdout) => {
      if (error) {
        resolve(false);
        return;
      }
      resolve(/\d+/.test(String(stdout || '')));
    });
  });
}

function killAnjaliServerProcesses() {
  return new Promise((resolve) => {
    const scriptNeedle = 'anjali-chatterbox-server.py';
    const command = [
      "Get-CimInstance Win32_Process",
      "| Where-Object { $_.Name -like 'python*' -and $_.CommandLine -like '*" + scriptNeedle + "*' }",
      "| ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }"
    ].join(' ');
    execFile(PS, ['-NoProfile', '-NonInteractive', '-Command', command], {
      cwd: ROOT,
      windowsHide: true,
      timeout: 8000,
    }, () => resolve());
  });
}

async function waitForAnjaliHealth(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await pingPort(8426, '/health', 2500)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
}

async function startAnjaliServer() {
  const alive = await pingPort(8426, '/health', 5000);
  if (alive) {
    console.log('[PP] Voice server on 8426 is alive and warm — Electron will use it as-is.');
    if (!servers['AnjaliAI']) {
      servers['AnjaliAI'] = { proc: null, restartCount: 0, lastRestartAt: Date.now(), stopped: false };
    }
    return;
  }

  const alreadyStarting = await isAnjaliServerProcessRunning();
  if (alreadyStarting) {
    console.warn('[PP] Chatterbox Python process exists but 8426 is not healthy — waiting up to 6 min for model load.');
    if (!servers['AnjaliAI']) {
      servers['AnjaliAI'] = { proc: null, restartCount: 0, lastRestartAt: Date.now(), stopped: false };
    }
    BrowserWindow.getAllWindows().forEach(w => {
      w.webContents.send('server-status', {
        server: 'anjali',
        status: 'starting',
        message: 'Chatterbox voice server loading (takes 3-5 min on first start)...'
      });
    });
    if (await waitForAnjaliHealth(360000)) {  // 6 minutes — model needs 3-5 min
      console.log('[PP] Chatterbox voice server became healthy on 8426.');
      return;
    }
    console.warn('[PP] Chatterbox process timed out — restarting.');
    await killAnjaliServerProcesses();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('[PP] Starting Chatterbox Python voice server...');
  spawnManaged('AnjaliAI', ANJALI_PYTHON, ['-u', ANJALI_SERVER], {
    cwd: ROOT,
    restartDelayMs: 5000,
    maxRestarts: 6,
    restartWindowSec: 900,
    showConsole: false,
    env: PYTHON_ENV,
  });
  BrowserWindow.getAllWindows().forEach(w => {
    w.webContents.send('server-status', {
      server: 'anjali',
      status: 'starting',
      message: 'Launching Chatterbox voice server on port 8426...'
    });
  });
}


function startServers() {
  // 1. Transcription server (port 8428)
  spawnManaged('TranscriptionServer', PS, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'transcribe-server.ps1')
  ], { restartDelayMs: 2000 });

  // 2. Video Export / FFmpeg server (port 8430)
  spawnManaged('FFmpegServer', PS, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'video-export-server.ps1')
  ], { restartDelayMs: 2000 });

  // 3. Chatterbox TTS server (port 8426) - sc3 cloned voice option
  startAnjaliServer();

  // 4. Edge TTS server (port 8427) - separate voice option, never a fallback
  spawnManaged('EdgeTTS', ANJALI_PYTHON, ['-u', EDGE_TTS_SERVER], {
    cwd: ROOT,
    restartDelayMs: 3000,
    maxRestarts: 4,
    restartWindowSec: 600,
    env: PYTHON_ENV,
  });

  // 5. SC3 singing model server (port 8431)
  if (fs.existsSync(SC3_SINGING_SERVER)) {
    spawnManaged('Sc3Singing', fs.existsSync(SINGING_PYTHON) ? SINGING_PYTHON : ANJALI_PYTHON, ['-u', SC3_SINGING_SERVER], {
      cwd: ROOT,
      restartDelayMs: 3000,
      maxRestarts: 4,
      restartWindowSec: 600,
      env: SINGING_ENV,
    });
  }

  if (IS_DEV) {
    spawnManaged('ViteDevServer', NPM, ['run', 'dev'], { cwd: ROOT, restartDelayMs: 3000 });
  }
  setTimeout(startAnjaliWatchdog, 180000);
}

// Free stale server ports before launch (8426 and 8431 excluded - ML servers stay alive)
function freeServerPorts() {
  return new Promise((resolve) => {
    const ports = IS_DEV ? [5173, 8424, 8428, 8430] : [8424, 8428, 8430];
    const psLines = [
      '$myPid = ' + process.pid,
      '$ports = @(' + ports.join(',') + ')',
      'foreach ($port in $ports) {',
      '  $netLines = netstat -ano 2>$null | Select-String (":" + $port + " ")',
      '  foreach ($l in $netLines) {',
      '    if ($l -match "\\s(\\d+)\\s*$") {',
      '      $pid2 = [int]$Matches[1]',
      '      if ($pid2 -ne 0 -and $pid2 -ne $myPid) { taskkill /F /PID $pid2 2>$null | Out-Null }',
      '    }',
      '  }',
      '}',
    ].join('; ');
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve();
    };
    const child = spawn(PS, ['-NoProfile', '-NonInteractive', '-Command', psLines], {
      detached: false, stdio: 'ignore', windowsHide: true,
    });
    child.on('exit', finish);
    child.on('error', finish);
    const timeoutId = setTimeout(() => {
      try { child.kill(); } catch (_) {}
      finish();
    }, 6000);
  });
}


// ————————————— Wait for Vite to be ready ————————————————————————————————————————
function waitForVite(url, retries = 60, delayMs = 500) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const attempt = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) return resolve();
        retry();
      }).on('error', retry);
    };
    const retry = () => {
      tries++;
      if (tries >= retries) return reject(new Error(`Vite not ready after ${retries} tries`));
      setTimeout(attempt, delayMs);
    };
    attempt();
  });
}

// ————————————— Create the main window —————————————————————————————————————————————
async function createWindow() {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    minWidth:  1100,
    minHeight: 700,
    title:     'Pattan Presentator',
    icon:      path.join(ROOT, 'pattan-presentator.ico'),
    backgroundColor: '#0f172a',
    show:      false,
    autoHideMenuBar: true,
    webPreferences: {
      preload:          path.join(ROOT, 'preload.cjs'),
      nodeIntegration:  false,
      contextIsolation: true,
      webSecurity:      false,
      backgroundThrottling: false,
      v8CacheOptions:   'code',
      enableBlinkFeatures: 'OffscreenCanvas,SharedArrayBuffer',
      additionalArguments: ['--js-flags=--max-old-space-size=3072', '--enable-features=SharedArrayBuffer']
    }
  });

  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'F5' },
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
        { role: 'toggleDevTools', accelerator: 'F12' },
        { role: 'toggleDevTools', accelerator: 'CmdOrCtrl+Shift+I' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
    win.setTitle('Pattan Presentator — AI Teaching Studio');
  });

  // ── Permanently inject HF API token into renderer localStorage ──────────
  // Token is stored in .hf_token (gitignored) so it never goes to GitHub
  win.webContents.on('did-finish-load', () => {
    try {
      const tokenPath = path.join(ROOT, '.hf_token');
      const hfToken   = fs.existsSync(tokenPath) ? fs.readFileSync(tokenPath, 'utf8').trim() : '';
      if (hfToken) {
        win.webContents.executeJavaScript(
          `localStorage.setItem('cb_hf_token', ${JSON.stringify(hfToken)});`
        ).catch(() => {});
      }
    } catch {}
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (IS_DEV) {
    await waitForVite(VITE_URL).catch(() => console.warn('[PP] Vite timeout — loading anyway'));
    win.loadURL(VITE_URL);
  } else {
    // Use app:// protocol so absolute paths like /script.js resolve correctly.
    // loadFile() uses file:// which breaks absolute-path script loading.
    const hasRendererDist = fs.existsSync(path.join(ROOT, 'renderer-dist', 'index.html'));
    const htmlPath = hasRendererDist ? 'renderer-dist/index.html' : 'dist/index.html';
    win.loadURL('app://voice/' + htmlPath);
  }

  // ————————————— IPC: Synchronous Groq API Key retrieval —————————————————————————
  ipcMain.on('get-groq-api-key', (event) => {
    event.returnValue = process.env.GROQ_API_KEY || '';
  });

  // ————————————— IPC: Native OS Notification —————————————————————————————————————
  ipcMain.handle('show-notification', async (_, { title, body }) => {
    try {
      const { Notification } = require('electron');
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // ————————————— IPC: Native Save File Dialog ————————————————————————————————————
  ipcMain.handle('show-save-dialog', async (_, options) => {
    let defaultPath = options.defaultPath;
    if (defaultPath) {
      if (!path.isAbsolute(defaultPath)) {
        defaultPath = path.join(os.homedir(), 'Desktop', defaultPath);
      }
    } else {
      defaultPath = path.join(os.homedir(), 'Desktop', options.fileName || 'output.mp4');
    }
    const result = await dialog.showSaveDialog(win, {
      title:       options.title       || 'Save File',
      defaultPath: defaultPath,
      filters:     options.filters     || [{ name: 'MP4 Video', extensions: ['mp4'] }],
      buttonLabel: options.buttonLabel || 'Save'
    });
    return result;
  });

  // ————————————— IPC: Write file natively ————————————————————————————————————————
  ipcMain.handle('write-file', async (_, { filePath, base64Data }) => {
    try {
      const buf = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buf);
      return { ok: true, filePath };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // ————————————— IPC: Open folder in Explorer ————————————————————————————————————
  ipcMain.handle('show-item-in-folder', (_, filePath) => {
    shell.showItemInFolder(filePath);
  });

  // ————————————— IPC: System info ————————————————————————————————————————————————
  ipcMain.handle('get-system-info', () => ({
    totalRam:   Math.round(os.totalmem()  / 1024 / 1024 / 1024 * 10) / 10,
    freeRam:    Math.round(os.freemem()   / 1024 / 1024 / 1024 * 10) / 10,
    cpus:       os.cpus().length,
    platform:   process.platform,
    appVersion: app.getVersion()
  }));

  // ————————————— IPC: Restart Anjali from renderer (when user clicks retry) ——————
  ipcMain.handle('restart-anjali', () => {
    console.log('[PP] Renderer requested Anjali restart.');
    restartServer('AnjaliAI');
    return { ok: true };
  });


  ipcMain.handle('narrate-edge-tts', async (_event, payload) => {
    const response = await postJsonForBuffer(8427, '/api/preview-mp3', payload, 180000);
    const contentType = String(response.headers['content-type'] || 'audio/wav');
    const bodyText = /application\/json/i.test(contentType)
      ? response.buffer.toString('utf8')
      : '';
    if (response.statusCode < 200 || response.statusCode >= 300) {
      let errorMessage = `Edge TTS server returned HTTP ${response.statusCode}.`;
      if (bodyText) {
        try {
          errorMessage = JSON.parse(bodyText)?.error || errorMessage;
        } catch (_) {}
      }
      throw new Error(errorMessage);
    }

    return {
      ok: true,
      statusCode: response.statusCode,
      contentType,
      audioBase64: response.buffer.toString('base64'),
    };
  });

  // ————————————— IPC: Restart video export server from renderer ——————————————————
  ipcMain.handle('restart-video-export', () => {
    console.log('[PP] Renderer requested video export server restart.');
    restartServer('FFmpegServer');
    return { ok: true };
  });

  // ————————————— IPC: Extract audio natively to bypass browser memory limits ————
  // Strategy: keep WAV on disk, return the file path — NEVER send the full bytes
  // over IPC (a 35-min WAV is ~67 MB and Electron IPC serialization will crash).
  ipcMain.handle('extract-audio', async (event, opts) => {
    const { videoPath } = opts || {};
    if (!videoPath) return { ok: false, error: 'No video path provided.' };

    function findFFmpeg() {
      try {
        const r = require('child_process').execSync('where ffmpeg', { encoding: 'utf8', timeout: 3000 }).trim().split('\n')[0].trim();
        if (r && fs.existsSync(r)) return r;
      } catch (_) {}
      const wp = 'C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
      return fs.existsSync(wp) ? wp : 'ffmpeg';
    }

    const FFMPEG = findFFmpeg();
    // Use a stable filename based on the video path hash so re-uploads reuse the cached WAV.
    const crypto = require('crypto');
    const videoHash = crypto.createHash('md5').update(videoPath).digest('hex').slice(0, 12);
    const tmpWav = path.join(ensureCaptionWorkDir('audio-cache'), 'caption-audio-' + videoHash + '.wav');

    try {
      // Skip extraction if cached WAV from the same video already exists
      if (fs.existsSync(tmpWav)) {
        const stat = fs.statSync(tmpWav);
        if (stat.size > 44) {
          console.log('[AudioExtract] Using cached WAV:', tmpWav, '(' + Math.round(stat.size / 1024) + ' KB)');
          return { ok: true, wavPath: tmpWav, size: stat.size };
        }
      }

      console.log('[AudioExtract] Extracting audio from:', path.basename(videoPath));
      await new Promise((resolve, reject) => {
        const proc = spawn(FFMPEG, [
          '-y', '-i', videoPath,
          '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
          tmpWav
        ], { stdio: 'pipe', windowsHide: true });
        let stderr = '';
        proc.stderr && proc.stderr.on('data', d => { stderr += d.toString(); });
        proc.on('error', err => reject(new Error('FFmpeg: ' + err.message)));
        proc.on('exit', code => code === 0 ? resolve() : reject(new Error('FFmpeg exit ' + code + ': ' + stderr.slice(-500))));
      });

      const size = fs.statSync(tmpWav).size;
      console.log('[AudioExtract] Extracted successfully:', Math.round(size / 1024), 'KB ->', tmpWav);
      // Return the file PATH only — renderer reads chunks on demand via read-audio-chunk
      return { ok: true, wavPath: tmpWav, size };
    } catch (err) {
      console.error('[AudioExtract] Failed:', err);
      if (fs.existsSync(tmpWav)) {
        try { fs.unlinkSync(tmpWav); } catch (_) {}
      }
      return { ok: false, error: err.message };
    }
  });

  // ————————————— IPC: Read a byte-range slice from a WAV file on disk ——————————
  // Allows the renderer to read chunks without loading the whole file into memory.
  ipcMain.handle('read-audio-chunk', async (event, opts) => {
    const { wavPath, offset, length } = opts || {};
    if (!wavPath || offset === undefined || length === undefined) {
      return { ok: false, error: 'Missing wavPath/offset/length' };
    }
    try {
      const fd = fs.openSync(wavPath, 'r');
      const buf = Buffer.alloc(length);
      const bytesRead = fs.readSync(fd, buf, 0, length, offset);
      fs.closeSync(fd);
      return { ok: true, data: buf.slice(0, bytesRead) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

// ————————————— Crash-free Video Transcription (IPC) ————————————————————————————
// Calls Whisper Python directly — works on ANY video type (speech, music, animation)
// Pipeline:
//   1. FFmpeg extracts 16kHz mono WAV from video
//   2. whisper-transcribe-caption.py — faster-whisper, VAD OFF, real word timestamps
//   3. Falls back to HTTP server (port 8428) if Python unavailable
//   4. Returns { ok, text, segments, words } to renderer
ipcMain.handle('transcribe-video', async (event, opts) => {
  const { videoPath, languageHint } = opts || {};
  if (!videoPath) return { ok: false, error: 'No video path provided.' };

  // Find FFmpeg
  function findFFmpeg() {
    try { const r = require('child_process').execSync('where ffmpeg', {encoding:'utf8',timeout:3000}).trim().split('\n')[0].trim(); if (r && fs.existsSync(r)) return r; } catch(_){}
    const wp = 'C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
    return fs.existsSync(wp) ? wp : 'ffmpeg';
  }

  const FFMPEG = findFFmpeg();
  const stamp  = Date.now();
  const tmpWav = path.join(ensureCaptionWorkDir('transcribe-audio'), 'caption-' + stamp + '.wav');

  try {
    // Step 1: Extract audio from video as 16kHz mono WAV
    console.log('[Caption] Extracting audio from:', path.basename(videoPath));
    await new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG, [
        '-y', '-i', videoPath,
        '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
        tmpWav
      ], { stdio: 'pipe', windowsHide: true });
      let stderr = '';
      proc.stderr && proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('error', err => reject(new Error('FFmpeg: ' + err.message)));
      proc.on('exit', code => code === 0 ? resolve() : reject(new Error('FFmpeg exit ' + code + ': ' + stderr.slice(-300))));
    });
    console.log('[Caption] Audio extracted:', Math.round(fs.statSync(tmpWav).size / 1024), 'KB');

    // Step 2: Run Whisper directly via Python (no HTTP server needed)
    const venvPy     = path.join(ROOT, '.singing-venv', 'Scripts', 'python.exe');
    const captionScript = path.join(ROOT, 'whisper-transcribe-caption.py');
    const whisperScript = path.join(ROOT, 'whisper-transcribe.py');
    const pyExe      = fs.existsSync(venvPy) ? venvPy : 'python';
    const scriptPath = fs.existsSync(captionScript) ? captionScript : whisperScript;

    console.log('[Caption] Running Whisper:', path.basename(scriptPath), 'via', path.basename(pyExe));

    const langParam = languageHint || 'auto';
    const whisperResult = await new Promise((resolve, reject) => {
      const proc = spawn(pyExe, [scriptPath, tmpWav, langParam], {
        stdio: 'pipe',
        windowsHide: true,
        env: { ...process.env, ...SINGING_ENV, PYTHONIOENCODING: 'utf-8' }
      });
      let stdout = '', stderr = '';
      proc.stdout && proc.stdout.on('data', d => { stdout += d.toString('utf8'); });
      proc.stderr && proc.stderr.on('data', d => { stderr += d.toString('utf8'); });
      const timer = setTimeout(() => { proc.kill(); reject(new Error('Whisper timeout (30min)')); }, 1800000);
      proc.on('error', err => { clearTimeout(timer); reject(new Error('Whisper spawn: ' + err.message)); });
      proc.on('exit', code => {
        clearTimeout(timer);
        try {
          const lastLine = stdout.trim().split('\n').pop() || '{}';
          const json = JSON.parse(lastLine);
          if (json.error) reject(new Error('Whisper: ' + json.error));
          else resolve(json);
        } catch(e) {
          reject(new Error('Whisper parse failed. stderr: ' + stderr.slice(0, 200)));
        }
      });
    });

    console.log('[Caption] Whisper done. Text:', (whisperResult.text || '').length, 'chars,', (whisperResult.words || []).length, 'words');
    return {
      ok:       true,
      text:     whisperResult.text     || '',
      segments: whisperResult.segments || [],
      words:    whisperResult.words    || [],
      language: whisperResult.language || 'en'
    };

  } catch (err) {
    // Fallback: HTTP transcription server (port 8428)
    console.warn('[Caption] Direct Whisper failed:', err.message, '— trying HTTP server fallback');
    try {
      const wavBase64 = fs.readFileSync(tmpWav).toString('base64');
      const result = await postJsonForBuffer(8428, '/api/transcribe', { audioBase64: wavBase64, wordTimestamps: true }, 300000);
      if (result && result.statusCode === 200) {
        const p = JSON.parse(result.buffer.toString('utf8'));
        return { ok: true, text: p.text || '', segments: p.segments || [], words: p.words || [] };
      }
    } catch(e2) {
      console.error('[Caption] HTTP fallback also failed:', e2.message);
    }
    return { ok: false, error: err.message };
  } finally {
    console.log('[Caption] Kept transcription WAV:', tmpWav);
  }
});

// ————————————— Whisper Transcription Helper —————————————————————————————————————
// Spawns whisper-transcribe.py from .singing-venv (has faster-whisper installed).
// Far more accurate than Windows Speech Recognition (port 8428) for Indian accents.
async function runWhisperTranscribe(audioPath, timeoutMs = 1800000) {
  return new Promise((resolve, reject) => {
    const py = fs.existsSync(WHISPER_PYTHON) ? WHISPER_PYTHON : 'python';
    const proc = spawn(py, [WHISPER_SCRIPT, audioPath], {
      stdio: 'pipe',
      windowsHide: true,
      env: { ...process.env, ...SINGING_ENV, PYTHONIOENCODING: 'utf-8' }
    });
    let stdout = '', stderr = '';
    if (proc.stdout) proc.stdout.on('data', d => { stdout += d.toString('utf8'); });
    if (proc.stderr) proc.stderr.on('data', d => { stderr += d.toString('utf8'); });
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('Whisper transcription timed out after ' + (timeoutMs / 1000) + 's'));
    }, timeoutMs);
    proc.on('error', err => { clearTimeout(timer); reject(new Error('Whisper spawn error: ' + err.message)); });
    proc.on('exit', code => {
      clearTimeout(timer);
      try {
        const lastLine = stdout.trim().split('\n').pop() || '';
        const json = JSON.parse(lastLine);
        if (json.error) reject(new Error('Whisper error: ' + json.error));
        else resolve(String(json.text || '').trim());
      } catch (_) {
        reject(new Error('Whisper output parse failed. stderr: ' + stderr.slice(0, 300) + ' stdout: ' + stdout.slice(0, 100)));
      }
    });
  });
}

// ————————————— American English —> Indian English voice pipeline —————————————————
// Pipeline:
//   1. FFmpeg — 16 kHz mono WAV (for transcription)
//   2. Whisper (faster-whisper tiny) — full transcript text  —  replaces Windows SR
//   3. convertToIndianEnglish() — replace American slang with Indian equivalents
//   4. Chatterbox TTS (port 8426, sc3 Indian voice) — synthesise each sentence
//   5. FFmpeg concat + atempo time-scale to match original video duration
//   6. FFmpeg mux new audio back into video — saved to Downloads

/** Converts American English slang/contractions to Indian English equivalents. */
function convertToIndianEnglish(text) {
  return text
    // contractions — full form
    .replace(/\b(gonna)\b/gi, 'going to')
    .replace(/\b(wanna)\b/gi, 'want to')
    .replace(/\b(gotta)\b/gi, 'have to')
    .replace(/\b(lemme)\b/gi, 'let me')
    .replace(/\b(gimme)\b/gi, 'give me')
    .replace(/\b(kinda)\b/gi, 'kind of')
    .replace(/\b(sorta)\b/gi, 'sort of')
    .replace(/\b(dunno)\b/gi, 'do not know')
    .replace(/\b(y'all|yall)\b/gi, 'all of you')
    .replace(/\b(ain't)\b/gi, 'is not')
    .replace(/\b(can't)\b/gi, 'cannot')
    .replace(/\b(won't)\b/gi, 'will not')
    .replace(/\b(don't)\b/gi, 'do not')
    .replace(/\b(doesn't)\b/gi, 'does not')
    .replace(/\b(didn't)\b/gi, 'did not')
    .replace(/\b(isn't)\b/gi, 'is not')
    .replace(/\b(wasn't)\b/gi, 'was not')
    .replace(/\b(weren't)\b/gi, 'were not')
    .replace(/\b(haven't)\b/gi, 'have not')
    .replace(/\b(hasn't)\b/gi, 'has not')
    .replace(/\b(hadn't)\b/gi, 'had not')
    .replace(/\b(wouldn't)\b/gi, 'would not')
    .replace(/\b(shouldn't)\b/gi, 'should not')
    .replace(/\b(couldn't)\b/gi, 'could not')
    .replace(/\b(it's)\b/gi, 'it is')
    .replace(/\b(that's)\b/gi, 'that is')
    .replace(/\b(there's)\b/gi, 'there is')
    .replace(/\b(they're)\b/gi, 'they are')
    .replace(/\b(we're)\b/gi, 'we are')
    .replace(/\b(you're)\b/gi, 'you are')
    .replace(/\b(I'm)\b/g, 'I am')
    .replace(/\b(I've)\b/g, 'I have')
    .replace(/\b(I'll)\b/g, 'I will')
    .replace(/\b(I'd)\b/g, 'I would')
    .replace(/\b(he's)\b/gi, 'he is')
    .replace(/\b(she's)\b/gi, 'she is')
    .replace(/\b(what's)\b/gi, 'what is')
    .replace(/\b(who's)\b/gi, 'who is')
    .replace(/\b(let's)\b/gi, 'let us')
    // American slang — Indian English
    .replace(/\b(dude|bro|buddy|pal|man)\b/gi, 'friend')
    .replace(/\b(cool|awesome|rad|sick|lit)\b/gi, 'very good')
    .replace(/\b(totally|absolutely|for sure|heck yeah)\b/gi, 'certainly')
    .replace(/\b(nope)\b/gi, 'no')
    .replace(/\b(yep|yup|yeah)\b/gi, 'yes')
    .replace(/\b(okay|ok)\b/gi, 'alright')
    .replace(/\b(stuff|things|items)\b/gi, 'things')
    .replace(/\b(guys)\b/gi, 'students')
    .replace(/\b(kids)\b/gi, 'children')
    .replace(/\b(check out)\b/gi, 'look at')
    .replace(/\b(check)\b/gi, 'verify')
    .replace(/\b(hang on)\b/gi, 'wait a moment')
    .replace(/\b(hold on)\b/gi, 'please wait')
    .replace(/\b(awesome sauce)\b/gi, 'very wonderful')
    .replace(/\b(no worries)\b/gi, 'do not worry')
    .replace(/\b(my bad)\b/gi, 'I am sorry')
    .replace(/\b(for real)\b/gi, 'truly')
    .replace(/\b(right on)\b/gi, 'very good')
    .replace(/\b(what the heck|what the hell)\b/gi, 'what on earth')
    .replace(/\b(a lot of|lots of)\b/gi, 'many')
    .replace(/\b(gonna go ahead and)\b/gi, 'will now')
    .replace(/\b(go ahead and)\b/gi, 'now')
    .replace(/\b(pretty much)\b/gi, 'mostly')
    .replace(/\b(kind of a big deal)\b/gi, 'very important')
    .replace(/\b(a big deal)\b/gi, 'very important')
    // normalize multiple spaces / exclamations
    .replace(/(!{2,})/g, '!')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Splits text into manageable sentence chunks for TTS (max ~200 chars each). */
function splitIntoSentences(text, maxLen = 200) {
  const raw = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';
  for (const sentence of raw) {
    if ((current + ' ' + sentence).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// ── Fast Mode: SC3 Singing timbre transfer for video ──────────────────────────
// Extract audio → SC3 Singing (port 8426) converts timbre → mux back into video
ipcMain.handle('sc3-singing-replace-video', async (event, opts) => {
  const { filePath, outputBaseName, voice = 'sc3' } = opts || {};
  if (!filePath) return { ok: false, error: 'No file path provided.' };

  const tmpDir  = require('os').tmpdir();
  const stamp   = Date.now();
  const safeBase = (outputBaseName || 'video').replace(/[^a-zA-Z0-9_-]/g, '_');
  const FFMPEG  = 'C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
  const tempFiles = [];

  function runFF(args, label) {
    return new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG, args, { stdio: 'pipe', windowsHide: true });
      let stderr = '';
      if (proc.stderr) proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('error', err => reject(new Error('FFmpeg: ' + err.message)));
      proc.on('exit', code => { if (code === 0) resolve(); else reject(new Error('FFmpeg(' + label + ') exit ' + code + ': ' + stderr.slice(-200))); });
    });
  }

  try {
    // 1. Extract audio from video as WAV
    const audioWav = path.join(tmpDir, 'sc3fast-audio-' + stamp + '.wav');
    tempFiles.push(audioWav);
    console.log('[Fast] Extracting audio from video...');
    await runFF(['-y', '-i', filePath, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', audioWav], 'extract audio');

    // 2. Send to SC3 Singing server (port 8426) for timbre conversion
    console.log('[Fast] Sending to SC3 Singing for timbre conversion...');
    const sc3Raw = await postJsonForBuffer(8426, '/api/convert-song', { filePath: audioWav, voice }, 600000);
    if (!sc3Raw || sc3Raw.statusCode !== 200) throw new Error('SC3 Singing server failed (status ' + sc3Raw?.statusCode + '). Ensure SC3 Singing server is running.');
    const sc3Body = JSON.parse(sc3Raw.buffer.toString('utf8'));
    if (!sc3Body.audioBase64) throw new Error('SC3 Singing returned no audio.');

    // 3. Save converted audio to temp file
    const convertedMp3 = path.join(tmpDir, 'sc3fast-converted-' + stamp + '.mp3');
    tempFiles.push(convertedMp3);
    fs.writeFileSync(convertedMp3, Buffer.from(sc3Body.audioBase64, 'base64'));
    console.log('[Fast] SC3 Singing conversion done. Muxing back into video...');

    // 4. Mux converted audio back into original video
    const outFile = path.join(os.homedir(), 'Downloads', safeBase + '-sc3-fast-' + stamp + '.mp4');
    await runFF(['-y', '-i', filePath, '-i', convertedMp3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-map', '0:v:0', '-map', '1:a:0', '-shortest', outFile], 'mux video');
    console.log('[Fast] Done:', outFile);

    return { ok: true, outputPath: outFile, indianEnglish: false, sc3Fast: true };
  } catch (err) {
    console.error('[Fast] SC3 Singing video failed:', err.message);
    return { ok: false, error: 'SC3 Fast mode failed: ' + err.message };
  } finally {
    tempFiles.forEach(f => { try { fs.unlinkSync(f); } catch(_) {} });
  }
});

ipcMain.handle('sc3-replace-video-audio', async (event, opts) => {
  const { filePath, outputBaseName, voice = 'sc3' } = opts || {};
  if (!filePath) return { ok: false, error: 'No file path provided.' };

  const tmpDir  = require('os').tmpdir();
  const stamp   = Date.now();
  const safeBase = (outputBaseName || 'sc3-video').replace(/[^a-zA-Z0-9_-]/g, '_');
  const inputMp3 = path.join(tmpDir, 'sc3-full-' + stamp + '.mp3');
  const outputMp4 = path.join(os.homedir(), 'Downloads', safeBase + '-sc3-' + stamp + '.mp4');
  const FFMPEG = 'C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
  const FFPROBE = FFMPEG.replace('ffmpeg.exe', 'ffprobe.exe');

  function runFFmpeg(args, label) {
    return new Promise((resolve, reject) => {
      console.log('[PP] SC3 ffmpeg:', label || args.slice(-1)[0]);
      const proc = spawn(FFMPEG, args, { stdio: 'pipe', windowsHide: true });
      let stderr = '';
      if (proc.stderr) proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('error', err => reject(new Error('FFmpeg: ' + err.message)));
      proc.on('exit', code => {
        if (code === 0) resolve();
        else reject(new Error('FFmpeg exit ' + code + ': ' + stderr.slice(-300)));
      });
    });
  }

  // Get audio duration in seconds using ffprobe
  function getAudioDuration(filePath_) {
    return new Promise((resolve) => {
      const proc = spawn(FFPROBE, [
        '-v', 'quiet', '-show_entries', 'format=duration',
        '-of', 'csv=p=0', filePath_
      ], { stdio: 'pipe', windowsHide: true });
      let out = '';
      proc.stdout.on('data', d => { out += d.toString(); });
      proc.on('exit', () => resolve(parseFloat(out.trim()) || 0));
      proc.on('error', () => resolve(0));
    });
  }

  // Call SC3 server with a file path — returns Buffer of converted MP3 or throws
  async function sc3ConvertChunk(chunkPath, chunkName) {
    console.log('[PP] SC3 converting chunk:', chunkName);
    const sc3Raw = await postJsonForBuffer(8426, '/api/convert-song', {
      filePath: chunkPath,
      outputFileName: chunkName + '.mp3',
      saveToDownloads: false,
      voice
    }, 600000);
    const bodyText = sc3Raw && sc3Raw.buffer ? sc3Raw.buffer.toString('utf8') : null;
    if (!sc3Raw || sc3Raw.statusCode !== 200) {
      let errMsg = 'SC3 error status ' + (sc3Raw ? sc3Raw.statusCode : 'none');
      if (bodyText) { try { errMsg = JSON.parse(bodyText).error || bodyText.slice(0, 200); } catch (_) { errMsg = bodyText.slice(0, 200); } }
      throw new Error(errMsg);
    }
    const j = JSON.parse(bodyText);
    if (!j.audioBase64) throw new Error(j.error || 'SC3 returned no audio.');
    return Buffer.from(j.audioBase64, 'base64');
  }

  // Wait for SC3 converter to be warmed (GET /health, not POST)
  async function waitForSc3Warmed(maxWaitMs) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const j = await new Promise((resolve) => {
        const req = http.get({ hostname: '127.0.0.1', port: 8426, path: '/health', agent: false }, (res) => {
          const chunks = []; res.on('data', d => chunks.push(d));
          res.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (_) { resolve(null); } });
        });
        req.on('error', () => resolve(null));
        req.setTimeout(5000, () => { req.destroy(); resolve(null); });
      });
      if (j && j.converterWarmed) { console.log('[PP] SC3: converter ready.'); return true; }
      if (j) console.log('[PP] SC3: waiting for converter to warm...');
      await new Promise(r => setTimeout(r, 5000));
    }
    console.warn('[PP] SC3: warm timeout — proceeding anyway.');
    return false;
  }

  const tempFiles = [inputMp3];
  try {
    // 1. Extract full audio as MP3
    console.log('[PP] SC3 replace: extracting audio from', path.basename(filePath));
    await runFFmpeg([
      '-y', '-i', filePath,
      '-vn', '-acodec', 'libmp3lame', '-b:a', '128k', '-ar', '44100', '-ac', '2',
      inputMp3
    ], 'extract mp3');

    const totalSecs = await getAudioDuration(inputMp3);
    const sizeMb = Math.round(fs.statSync(inputMp3).size / 1024 / 1024 * 10) / 10;
    console.log('[PP] SC3 replace: audio', Math.round(totalSecs), 'sec,', sizeMb, 'MB');

    // —————— Step A: Try Indian English pipeline (Transcribe —> Convert —> Chatterbox TTS) ——————
    let finalAudioMp3 = null;
    let usedIndianPipeline = false;

    try {
      console.log('[PP] SC3 Indian English: transcribing audio for slang conversion...');

      // Extract 16 kHz mono WAV for transcription
      const transcribeWav = path.join(tmpDir, 'sc3-transcribe-' + stamp + '.wav');
      tempFiles.push(transcribeWav);
      await runFFmpeg([
        '-y', '-i', filePath,
        '-vn', '-ar', '16000', '-ac', '1',
        transcribeWav
      ], 'extract transcribe wav');

      // Transcribe with Whisper (faster-whisper tiny — accurate for Indian English)
      console.log('[PP] SC3 Indian English: transcribing with Whisper...');
      const transcript = await runWhisperTranscribe(transcribeWav, 300000);
      if (!transcript) throw new Error('Whisper returned no speech. Video may have no voice audio.');


      console.log('[PP] SC3 Indian English: transcript', transcript.length, 'chars');

      // Convert American slang/contractions —> Indian English
      const indianText = convertToIndianEnglish(transcript);
      console.log('[PP] SC3 Indian English: converted text', indianText.length, 'chars');

      // Synthesise with Chatterbox TTS (port 8426, sc3 Indian voice), sentence by sentence
      const sentences = splitIntoSentences(indianText, 120);
      console.log('[PP] SC3 Indian English: synthesising', sentences.length, 'sentence(s)...');
      const ttsWavFiles = [];
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        console.log('[PP] SC3 Indian English: TTS', i + 1, '/', sentences.length);
        const ttsRaw = await postJsonForBuffer(8426, '/api/narrate', { text: sentence, voice }, 180000);
        if (!ttsRaw || ttsRaw.statusCode !== 200)
          throw new Error('Chatterbox TTS failed for sentence ' + (i + 1));
        const wavFile = path.join(tmpDir, 'sc3-tts-' + stamp + '-' + i + '.wav');
        tempFiles.push(wavFile);
        fs.writeFileSync(wavFile, ttsRaw.buffer);
        ttsWavFiles.push(wavFile);
      }

      // Concatenate WAV files
      const ttsConcatWav = path.join(tmpDir, 'sc3-tts-concat-' + stamp + '.wav');
      tempFiles.push(ttsConcatWav);
      if (ttsWavFiles.length === 1) {
        fs.copyFileSync(ttsWavFiles[0], ttsConcatWav);
      } else {
        const concatList = path.join(tmpDir, 'sc3-tts-list-' + stamp + '.txt');
        tempFiles.push(concatList);
        fs.writeFileSync(concatList, ttsWavFiles.map(f => "file '" + f.replace(/\\/g, '/') + "'").join('\n'));
        await runFFmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', concatList, '-acodec', 'pcm_s16le', ttsConcatWav], 'concat tts wavs');
      }

      // Time-scale TTS to match video duration using atempo
      const ttsSecs = await getAudioDuration(ttsConcatWav);
      const speedRatio = ttsSecs > 0 ? (ttsSecs / totalSecs) : 1.0;
      console.log('[PP] SC3 Indian English: TTS', Math.round(ttsSecs), 's / video', Math.round(totalSecs), 's, ratio', speedRatio.toFixed(3));

      function buildAtempoFilter(ratio) {
        const r = Math.max(0.25, Math.min(4.0, ratio));
        if (r >= 0.5 && r <= 2.0) return 'atempo=' + r.toFixed(4);
        const half = Math.sqrt(r).toFixed(4);
        return 'atempo=' + half + ',atempo=' + half;
      }

      finalAudioMp3 = path.join(tmpDir, 'sc3-indian-final-' + stamp + '.mp3');
      tempFiles.push(finalAudioMp3);
      const needsStretch = Math.abs(speedRatio - 1.0) >= 0.02;
      const ffArgs = needsStretch
        ? ['-y', '-i', ttsConcatWav, '-filter:a', buildAtempoFilter(speedRatio), '-acodec', 'libmp3lame', '-b:a', '128k', finalAudioMp3]
        : ['-y', '-i', ttsConcatWav, '-acodec', 'libmp3lame', '-b:a', '128k', finalAudioMp3];
      await runFFmpeg(ffArgs, needsStretch ? 'atempo time-scale' : 'wav to mp3');
      usedIndianPipeline = true;
      console.log('[PP] SC3 Indian English: synthesis complete!');

    } catch (indErr) {
      // Pipeline failed — do not fall back to SC3 singing model, always use Chatterbox
      console.error('[PP] Chatterbox Indian English pipeline failed:', indErr.message);
      throw new Error('Chatterbox voice pipeline failed: ' + indErr.message + '. Please ensure the transcription server (port 8428) and Chatterbox server (port 8426) are running.');
    }

    // Mux final audio (Indian English TTS or SC3 timbre) into original video
    console.log('[PP] SC3 replace: muxing', usedIndianPipeline ? 'Indian English TTS' : 'SC3 timbre', 'audio into video...');
    await runFFmpeg([
      '-y', '-i', filePath, '-i', finalAudioMp3,
      '-c:v', 'copy', '-map', '0:v:0', '-map', '1:a:0', '-shortest',
      outputMp4
    ], 'mux video');

    console.log('[PP] SC3 replace: complete ->', path.basename(outputMp4),
      usedIndianPipeline ? '(Indian English voice)' : '(SC3 timbre)');
    return { ok: true, outputPath: outputMp4, fileName: path.basename(outputMp4), indianEnglish: usedIndianPipeline };

  } catch (err) {
    console.error('[PP] SC3 replace error:', err.message);
    return { ok: false, error: err.message };
  } finally {
    for (const f of tempFiles) { try { fs.unlinkSync(f); } catch (_) {} }
  }
});

// ————————————— Chatterbox sc3 Voice Narration for Audio Files ———————————————————
// Pipeline: Transcribe audio (port 8428) —> Indian English slang —> Chatterbox TTS (port 8426)
// Used by Sing Song "Convert Voice —> Indian English" button for audio files.
ipcMain.handle('sc3-narrate-audio', async (event, opts) => {
  const { filePath, outputBaseName, voice = 'sc3' } = opts || {};
  if (!filePath) return { ok: false, error: 'No file path provided.' };

  const tmpDir   = require('os').tmpdir();
  const stamp    = Date.now();
  const safeBase = (outputBaseName || 'sc3-audio').replace(/[^a-zA-Z0-9_-]/g, '_');
  const FFMPEG   = 'C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
  const outputWav = path.join(os.homedir(), 'Downloads', safeBase + '-sc3-' + stamp + '.wav');
  const tempFiles = [];

  function runFFmpeg2(args, label) {
    return new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG, args, { stdio: 'pipe', windowsHide: true });
      let stderr = '';
      if (proc.stderr) proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('error', err => reject(new Error('FFmpeg: ' + err.message)));
      proc.on('exit', code => {
        if (code === 0) resolve();
        else reject(new Error('FFmpeg exit ' + code + ': ' + stderr.slice(-200)));
      });
    });
  }

  try {
    // 1. Extract 16 kHz mono WAV for transcription
    const transcribeWav = path.join(tmpDir, 'narrate-tx-' + stamp + '.wav');
    tempFiles.push(transcribeWav);
    await runFFmpeg2(['-y', '-i', filePath, '-vn', '-ar', '16000', '-ac', '1', transcribeWav], 'extract 16k wav');

    // 2. Transcribe with Whisper (faster-whisper tiny â€” accurate Indian English support)
    console.log('[PP] sc3-narrate-audio: transcribing with Whisper...', path.basename(filePath));
    const transcript = await runWhisperTranscribe(transcribeWav, 300000);
    if (!transcript) throw new Error('Whisper could not detect speech. Ensure the file contains clear voice recordings.');
    console.log('[PP] sc3-narrate-audio: transcript', transcript.length, 'chars');

    // 3. Convert American slang —> Indian English
    const indianText = convertToIndianEnglish(transcript);
    console.log('[PP] sc3-narrate-audio: converted text', indianText.length, 'chars');

    // 4. Synthesise each sentence with Chatterbox TTS (port 8426, sc3 voice clone)
    const sentences = splitIntoSentences(indianText, 120);
    console.log('[PP] sc3-narrate-audio: synthesising', sentences.length, 'sentence(s)...');
    const ttsWavFiles = [];
    for (let i = 0; i < sentences.length; i++) {
      console.log('[PP] sc3-narrate-audio: TTS sentence', i + 1, '/', sentences.length);
      const ttsRaw = await postJsonForBuffer(8426, '/api/narrate', { text: sentences[i], voice }, 180000);
      if (!ttsRaw || ttsRaw.statusCode !== 200)
        throw new Error('Chatterbox TTS failed for sentence ' + (i + 1));
      const wavFile = path.join(tmpDir, 'narrate-tts-' + stamp + '-' + i + '.wav');
      tempFiles.push(wavFile);
      fs.writeFileSync(wavFile, ttsRaw.buffer);
      ttsWavFiles.push(wavFile);
    }

    // 5. Concatenate all TTS WAV files
    let finalWav;
    if (ttsWavFiles.length === 1) {
      finalWav = ttsWavFiles[0];
    } else {
      finalWav = path.join(tmpDir, 'narrate-concat-' + stamp + '.wav');
      tempFiles.push(finalWav);
      const concatList = path.join(tmpDir, 'narrate-list-' + stamp + '.txt');
      tempFiles.push(concatList);
      fs.writeFileSync(concatList, ttsWavFiles.map(f => "file '" + f.replace(/\\/g, '/') + "'").join('\n'));
      await runFFmpeg2(['-y', '-f', 'concat', '-safe', '0', '-i', concatList, '-acodec', 'pcm_s16le', finalWav], 'concat tts');
    }

    // 6. Save to Downloads
    fs.copyFileSync(finalWav, outputWav);
    console.log('[PP] sc3-narrate-audio: saved ->', path.basename(outputWav));
    return { ok: true, outputPath: outputWav, fileName: path.basename(outputWav), indianEnglish: true };

  } catch (err) {
    console.error('[PP] sc3-narrate-audio error:', err.message);
    return { ok: false, error: err.message };
  } finally {
    for (const f of tempFiles) { try { fs.unlinkSync(f); } catch (_) {} }
  }
});

// ————————————— Native Caption Eraser (delogo blur filter) —————————————
ipcMain.handle('erase-captions', async (event, opts) => {
  const { filePath } = opts || {};
  if (!filePath) return { ok: false, error: 'No file path provided.' };

  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const { spawn } = require('child_process');

  const tmpDir  = os.tmpdir();
  const stamp   = Date.now();
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputMp4 = path.join(os.homedir(), 'Downloads', baseName + '-erased-' + stamp + '.mp4');
  const FFMPEG = 'C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
  const FFPROBE = FFMPEG.replace('ffmpeg.exe', 'ffprobe.exe');

  function getVideoDimensions(path_) {
    return new Promise((resolve) => {
      const proc = spawn(FFPROBE, [
        '-v', 'quiet', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height',
        '-of', 'csv=s=x:p=0', path_
      ], { stdio: 'pipe', windowsHide: true });
      let out = '';
      proc.stdout.on('data', d => { out += d.toString(); });
      proc.on('exit', () => {
        const parts = out.trim().split('x');
        const w = parseInt(parts[0]) || 1920;
        const h = parseInt(parts[1]) || 1080;
        resolve({ width: w, height: h });
      });
      proc.on('error', () => resolve({ width: 1920, height: 1080 }));
    });
  }

  try {
    const { width, height } = await getVideoDimensions(filePath);
    console.log('[PP] Erase: video dimensions ' + width + 'x' + height);

    // Box parameters: cover only the caption line precisely (bottom 5.5% height, 70% width, centered at 88% Y)
    const boxW = Math.round(width * 0.70);
    const boxH = Math.round(height * 0.055);
    const boxX = Math.round((width - boxW) / 2);
    const boxY = Math.round(height * 0.88);

    const delogoFilter = 'delogo=x=' + boxX + ':y=' + boxY + ':w=' + boxW + ':h=' + boxH;
    console.log('[PP] Erase: applying delogo filter: ' + delogoFilter);

    await new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG, [
        '-y', '-i', filePath,
        '-vf', delogoFilter,
        '-c:a', 'copy',
        outputMp4
      ], { stdio: 'pipe', windowsHide: true });

      let stderr = '';
      if (proc.stderr) proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('error', err => reject(new Error('FFmpeg: ' + err.message)));
      proc.on('exit', code => {
        if (code === 0) resolve();
        else reject(new Error('FFmpeg exit ' + code + ': ' + stderr.slice(-300)));
      });
    });

    console.log('[PP] Erase: caption erasing complete -> ' + outputMp4);
    return { ok: true, outputPath: outputMp4, fileName: path.basename(outputMp4) };

  } catch (err) {
    console.error('[PP] Erase: caption erasing error:', err.message);
    return { ok: false, error: err.message };
  }
});


// IPC: Merge Narration Audio into Video
// Mixes a narration WAV/MP3 into a video so Whisper can transcribe the real voice
ipcMain.handle('merge-audio-into-video', async (event, opts) => {
  const { videoPath, audioPath, outputName } = opts || {};
  if (!videoPath) return { ok: false, error: 'No video path.' };
  if (!audioPath) return { ok: false, error: 'No audio path.' };
  function findFF() {
    try { const r = require('child_process').execSync('where ffmpeg',{encoding:'utf8',timeout:3000}).trim().split('\n')[0].trim(); if(r&&fs.existsSync(r))return r; } catch(_){}
    const wp='C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
    return fs.existsSync(wp)?wp:'ffmpeg';
  }
  const FFMPEG = findFF();
  const outFile = path.join(os.homedir(), 'Downloads', outputName || ('merged_' + Date.now() + '.mp4'));
  try {
    await new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG, [
        '-y', '-i', videoPath, '-i', audioPath,
        '-filter_complex', '[0:a?][1:a]amix=inputs=2:duration=first:dropout_transition=0[aout]',
        '-map', '0:v:0', '-map', '[aout]',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', outFile
      ], { stdio: 'pipe', windowsHide: true });
      let stderr = '';
      proc.stderr && proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('error', e => reject(new Error('FFmpeg: ' + e.message)));
      proc.on('exit', code => code===0 ? resolve() : reject(new Error('FFmpeg exit '+code+': '+stderr.slice(-200))));
    });
    return { ok: true, outputPath: outFile, fileName: path.basename(outFile) };
  } catch(err) {
    return { ok: false, error: err.message };
  }
});


// ————————————— IPC: Burn Captions via FFmpeg (Express Export) ———————————————————
// Uses FFmpeg to burn subtitle text directly onto video frames.
// Audio is COPIED (no re-encode) → zero quality loss, instant mux.
// Saves to Downloads as captioned_video_<timestamp>.mp4
function findCaptionFFmpegPath() {
  try {
    const { execSync } = require('child_process');
    const result = execSync('where ffmpeg', { encoding: 'utf8', timeout: 3000 }).trim().split('\n')[0].trim();
    if (result && require('fs').existsSync(result)) return result;
  } catch (_) {}
  const wingetPath = 'C:\\Users\\patan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';
  if (require('fs').existsSync(wingetPath)) return wingetPath;
  throw new Error('FFmpeg not found. Install it via: winget install Gyan.FFmpeg.Essentials');
}

ipcMain.handle('probe-video-meta', async (event, opts) => {
  const { videoPath } = opts || {};
  if (!videoPath) return { ok: false, error: 'No video path provided.' };
  try {
    const { execFileSync } = require('child_process');
    const FFMPEG = findCaptionFFmpegPath();
    const ffprobe = path.join(path.dirname(FFMPEG), path.basename(FFMPEG).replace('ffmpeg', 'ffprobe'));
    const raw = execFileSync(ffprobe, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height:format=duration',
      '-of', 'json',
      videoPath,
    ], { encoding: 'utf8', timeout: 15000 });
    const parsed = JSON.parse(raw || '{}');
    const stream = parsed.streams && parsed.streams[0] ? parsed.streams[0] : {};
    return {
      ok: true,
      width: Number(stream.width) || 0,
      height: Number(stream.height) || 0,
      duration: Number(parsed.format && parsed.format.duration) || 0,
    };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
});

ipcMain.handle('burn-captions', async (event, opts) => {
  const { videoPath, captions, fontSize = 28, position = 'bottom', assContent } = opts || {};
  if (!videoPath) return { ok: false, error: 'No video path provided.' };
  if (!assContent && (!captions || !captions.length)) return { ok: false, error: 'No captions or assContent provided.' };

  // ── Dynamic FFmpeg detection ─────────────────────────────────────────────────
  function findFFmpegPath() {
    return findCaptionFFmpegPath();
  }
  const FFMPEG = findFFmpegPath();
  const tmpDir  = ensureCaptionWorkDir('burn-subtitles');
  const stamp   = Date.now();
  const baseName = path.basename(videoPath, path.extname(videoPath));
  const outFile = path.join(os.homedir(), 'Downloads', baseName + '_captioned.mp4');
  const partialOutFile = path.join(os.homedir(), 'Downloads', baseName + '_captioned.' + stamp + '.part.mp4');

  let assPath = '';
  let srtPath = '';
  let subFilter = '';

  // ── 1. Build SRT file from caption chunks ────────────────────────────────────
  function toSrtTime(secs) {
    const h   = Math.floor(secs / 3600);
    const m   = Math.floor((secs % 3600) / 60);
    const s   = Math.floor(secs % 60);
    const ms  = Math.round((secs % 1) * 1000);
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' +
           String(s).padStart(2,'0') + ',' + String(ms).padStart(3,'0');
  }

  try {
    if (assContent) {
      // Burn structured ASS subtitles directly (preserves colors, outlines, box backgrounds, fonts)
      assPath = path.join(tmpDir, 'captions-' + stamp + '.ass');
      require('fs').writeFileSync(assPath, assContent, 'utf8');
      console.log('[BurnCaptions] ASS written:', assPath);
      const safeAss = assPath.split('\\').join('/').split(':').join('\\:');
      // Point libass to the Windows system fonts folder so non-Latin scripts
      // (Hindi, Telugu, Urdu, Arabic, Chinese, etc.) render with the correct
      // Nirmala UI / Tahoma / system font instead of showing tofu boxes.
      // FFmpeg filter escaping: colon must be \: and backslash must be \\
      const winFonts = 'C\\:/Windows/Fonts';
      subFilter = `subtitles='${safeAss}':fontsdir='${winFonts}'`;
    } else {
      // Fallback SRT subtitles
      srtPath = path.join(tmpDir, 'captions-' + stamp + '.srt');
      const srtLines = [];
      captions.forEach((c, i) => {
        let start = 0;
        let end   = 2;
        if (typeof c.start === 'number' || (typeof c.start === 'string' && c.start !== '')) {
          start = Number(c.start);
        } else if (Array.isArray(c.timestamp)) {
          start = Number(c.timestamp[0]) || 0;
        }
        if (typeof c.end === 'number' || (typeof c.end === 'string' && c.end !== '')) {
          end = Number(c.end);
        } else if (Array.isArray(c.timestamp)) {
          end = Number(c.timestamp[1]) || (start + 2);
        }
        start = Math.max(0, start || 0);
        end   = Math.max(start + 0.1, end || start + 2);
        const text  = String(c.text || '').trim().replace(/[<>]/g, '');
        if (!text) return;
        srtLines.push(String(i + 1));
        srtLines.push(toSrtTime(start) + ' --> ' + toSrtTime(end));
        srtLines.push(text);
        srtLines.push('');
      });

      require('fs').writeFileSync(srtPath, srtLines.join('\n'), 'utf8');
      console.log('[BurnCaptions] SRT written:', srtPath, '(' + captions.length + ' captions)');

      const safeSrt    = srtPath.split('\\').join('/').split(':').join('\\:');
      subFilter  = `subtitles='${safeSrt}':force_style='FontName=Arial,FontSize=${fontSize},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Bold=1,Outline=2,Shadow=1,Alignment=2,MarginV=40'`;
    }

    // ── 2. FFmpeg: burn subtitles onto video, copy audio exactly ──────────────────────
    // First probe total duration/bitrate so progress is accurate and export
    // quality is never lower than the source video bitrate.
    let totalDurationSec = 0;
    let sourceVideoBitrate = 0;
    try {
      const { execSync } = require('child_process');
      // Safely replace only the file name (ffmpeg.exe -> ffprobe.exe), not parent directory names
      const ffprobe = path.join(path.dirname(FFMPEG), path.basename(FFMPEG).replace('ffmpeg', 'ffprobe'));
      const probeOut = execSync(
        `"${ffprobe}" -v error -select_streams v:0 -show_entries stream=bit_rate:format=duration,bit_rate -of json "${videoPath}"`,
        { encoding: 'utf8', timeout: 10000 }
      ).trim();
      const probe = JSON.parse(probeOut || '{}');
      totalDurationSec = parseFloat(probe && probe.format && probe.format.duration) || 0;
      const streamBitrate = Number(probe && probe.streams && probe.streams[0] && probe.streams[0].bit_rate) || 0;
      const formatBitrate = Number(probe && probe.format && probe.format.bit_rate) || 0;
      sourceVideoBitrate = Math.max(streamBitrate, formatBitrate);
    } catch (_) {}

    await new Promise((resolve, reject) => {
      const videoQualityArgs = sourceVideoBitrate > 0
        ? [
            '-c:v', 'libx264',
            '-preset', 'slow',
            '-b:v', String(Math.ceil(sourceVideoBitrate * 1.15)),
            '-maxrate', String(Math.ceil(sourceVideoBitrate * 1.75)),
            '-bufsize', String(Math.ceil(sourceVideoBitrate * 3.5)),
            '-pix_fmt', 'yuv420p',
          ]
        : [
            '-c:v', 'libx264',
            '-preset', 'slow',
            '-crf', '16',
            '-pix_fmt', 'yuv420p',
          ];
      const proc = spawn(FFMPEG, [
        '-y', '-i', videoPath,
        '-map', '0:v:0',
        '-map', '0:a?',
        '-vf', subFilter,
        ...videoQualityArgs,
        '-c:a', 'copy',          // ← copy audio stream as-is (no re-encode = perfect audio)
        '-avoid_negative_ts', 'make_zero',
        '-movflags', '+faststart',
        '-progress', 'pipe:2',   // emit progress lines to stderr
        partialOutFile
      ], { stdio: 'pipe', windowsHide: true });

      // Kill process if it hangs for more than 30 minutes
      const hangTimer = setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch (_) {}
        reject(new Error('FFmpeg timed out after 30 minutes'));
      }, 30 * 60 * 1000);

      let stderr = '';
      if (proc.stderr) {
        proc.stderr.on('data', d => {
          const chunk = d.toString();
          stderr += chunk;
          // Parse real progress from FFmpeg -progress output (out_time_us or out_time_ms = XXXXXX microseconds)
          const m = chunk.match(/out_time_(?:us|ms)=(\d+)/);
          if (m && totalDurationSec > 0) {
            const elapsedSec = parseInt(m[1], 10) / 1e6;
            const pct = Math.min(94, Math.round((elapsedSec / totalDurationSec) * 94));
            event.sender.send('burn-captions-progress', { videoPath, pct });
          }
        });
      }
      proc.on('error', err => { clearTimeout(hangTimer); reject(new Error('FFmpeg spawn: ' + err.message)); });
      proc.on('exit', code => {
        clearTimeout(hangTimer);
        if (code === 0) {
          event.sender.send('burn-captions-progress', { videoPath, pct: 98, phase: 'finalizing' });
          resolve();
        }
        else reject(new Error('FFmpeg exit ' + code + ': ' + stderr.slice(-300)));
      });
    });

    try {
      if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
      fs.renameSync(partialOutFile, outFile);
    } catch (moveErr) {
      throw new Error('Could not finalize captioned video: ' + (moveErr.message || String(moveErr)));
    }

    console.log('[BurnCaptions] Done:', path.basename(outFile));
    return { ok: true, outputPath: outFile, fileName: path.basename(outFile), assPath, srtPath };

  } catch (err) {
    try { if (partialOutFile && fs.existsSync(partialOutFile)) fs.unlinkSync(partialOutFile); } catch (_) {}
    console.error('[BurnCaptions] Error:', err.message);
    return { ok: false, error: err.message };
  } finally {
    if (srtPath) console.log('[BurnCaptions] Kept SRT:', srtPath);
    if (assPath) console.log('[BurnCaptions] Kept ASS:', assPath);
  }
});

// ─── IPC: Open a file/folder with the OS default handler ────────────────────
ipcMain.handle('open-file', async (event, filePath) => {
  if (!filePath) return { ok: false, error: 'No path provided' };
  try {
    const { shell } = require('electron');
    await shell.openPath(filePath);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

  // ————————————— IPC: Get server health status ———————————————————————————————————
  ipcMain.handle('get-server-health', async () => {
    const [anjaliAlive, edgeTtsAlive, transcribeAlive, videoExportAlive, sc3SingingAlive, viteAlive] = await Promise.all([
      pingPort(8426),
      pingPort(8427),
      pingPort(8428),
      pingPort(8430),
      pingPort(8426),
      pingPort(5173, '/')
    ]);
    return {
      anjali:      anjaliAlive,
      edgeTts:     edgeTtsAlive,
      transcribe:  transcribeAlive,
      videoExport: videoExportAlive,
      sc3Singing:  sc3SingingAlive,
      vite:        viteAlive,
      timestamp: Date.now()
    };
  });

  win.on('closed', () => killAll());

  // Block any navigation away from the app:// origin
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('app://voice/')) {
      event.preventDefault();
      console.log('[PP] Blocked renderer navigation to:', url.substring(0, 80));
    }
  });

  // If page somehow navigates to wrong URL, redirect back
  win.webContents.on('did-navigate', (_event, url) => {
    if (!url.startsWith('app://voice/') && !url.startsWith('http://127.0.0.1:5173')) {
      console.warn('[PP] Wrong navigation detected, reloading app...');
      win.loadURL('app://voice/renderer-dist/index.html');
    }
  });

  return win;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ App lifecycle Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
app.whenReady().then(async () => {
  // Register app:// protocol Ã¢â‚¬â€ maps every request to D:\voice\
  // This fixes absolute-path script loading (/script.js Ã¢â€ â€™ D:\voice\script.js)
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    const relativePath = url.pathname.replace(/^\/+/, '');
    const filePath = path.join(ROOT, relativePath);
    const MIME = {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
      '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
      '.webm': 'video/webm', '.pdf': 'application/pdf',
      '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    };
    try {
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        return new Response('Not Found: ' + relativePath, { status: 404 });
      }
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      // Never cache JS/CSS so code changes are always picked up immediately
      const noCache = ['.js', '.css', '.html'].includes(ext);
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          ...(noCache ? { 'Cache-Control': 'no-cache, no-store, must-revalidate' } : {})
        }
      });
    } catch (err) {
      return new Response('Error: ' + err.message, { status: 500 });
    }
  });

  console.log('[PP] Electron ready Ã¢â‚¬â€ freeing server ports...');
  await freeServerPorts();   // evict any stale python/electron from previous session

  console.log('[PP] Starting servers...');
  startServers();

  // Give servers a moment to bind ports before opening the window
  await new Promise(r => setTimeout(r, 1500));

  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

// Recovery flag Ã¢â‚¬â€ prevents app.quit() firing during crash recovery
let _isRecovering = false;

app.on('window-all-closed', () => {
  if (_isRecovering) {
    console.log('[PP] window-all-closed during crash recovery - suppressing quit');
    return;
  }
  killAll();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  killAll();
});

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Crash guard: reload renderer on crash (same window, no new tab) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// --- Crash guard: reload renderer, never let app.quit() fire accidentally ---
app.on('render-process-gone', async (event, wc, details) => {
  const RECOVERABLE = ['crashed', 'oom', 'killed', 'launch-failed'];
  if (!RECOVERABLE.includes(details.reason)) return;

  console.error('[PP] Renderer gone (' + details.reason + ', exit=' + details.exitCode + ') - recovering...');

  _isRecovering = true;  // suppress window-all-closed -> app.quit() during recovery

  // Small delay so window-closed event fires cleanly before we try to reload
  await new Promise(r => setTimeout(r, 500));

  try {
    // 1. Try same window
    const win = BrowserWindow.fromWebContents(wc);
    if (win && !win.isDestroyed()) {
      console.log('[PP] Reloading in same window...');
      await win.loadURL('app://voice/renderer-dist/index.html');
      win.show();
      _isRecovering = false;
      return;
    }
    // 2. Any surviving window
    const alive = BrowserWindow.getAllWindows().filter(w => !w.isDestroyed());
    if (alive.length > 0) {
      console.log('[PP] Reloading first surviving window...');
      await alive[0].loadURL('app://voice/renderer-dist/index.html');
      alive[0].show();
      _isRecovering = false;
      return;
    }
    // 3. Create fresh window
    console.log('[PP] All windows gone - creating new window...');
    await createWindow();
  } catch (err) {
    console.error('[PP] Recovery error:', err.message);
    try { await createWindow(); } catch (_) {}
  } finally {
    setTimeout(() => { _isRecovering = false; }, 6000);
  }
});

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Memory watchdog: log usage every 60s, trigger GC if high Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
setInterval(() => {
  const used = process.memoryUsage();
  const mbUsed = Math.round(used.rss / 1024 / 1024);
  if (mbUsed > 1800) {
    console.warn(`[PP] Main process RAM: ${mbUsed} MB Ã¢â‚¬â€ requesting GC`);
    if (global.gc) try { global.gc(); } catch (_) {}
  }
  // Log renderer RAM from each window
  BrowserWindow.getAllWindows().forEach((w) => {
    if (!w.isDestroyed()) {
      const metrics = w.webContents.getProcessMemoryInfo ? null : null;
      void 0; // placeholder Ã¢â‚¬â€ Electron exposes this via webContents events
    }
  });
}, 60000);




