'use strict';

const { app, BrowserWindow, Menu, ipcMain, dialog, shell, globalShortcut } = require('electron');
const { spawn }  = require('child_process');
const path       = require('path');
const fs         = require('fs');
const http       = require('http');
const os         = require('os');

// ─── Memory & GPU flags (set BEFORE app.ready) ────────────────────────────────
app.commandLine.appendSwitch('js-flags',
  '--max-old-space-size=8192 --expose-gc --turbo-fast-api-calls'
);
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

const ROOT    = __dirname;
const IS_DEV  = !app.isPackaged;
const VITE_URL = 'http://127.0.0.1:5173';

// Guard all console output against EPIPE on shutdown
['log','warn','error'].forEach(method => {
  const orig = console[method].bind(console);
  console[method] = (...args) => { try { orig(...args); } catch(_) {} };
});

// ─── Server registry ──────────────────────────────────────────────────────────
// Each entry holds the live child process + restart metadata.
const servers = {};   // key → { proc, restartCount, lastRestartAt, stopped }
let   isQuitting = false;

// ─── Spawn a managed server process ──────────────────────────────────────────
// Options:
//   maxRestarts   – max restarts within restartWindowSec before giving up (default 8)
//   restartWindowSec – rolling window in seconds                          (default 120)
//   restartDelayMs   – base delay before first restart                    (default 3000)
//   healthPort       – TCP port to health-ping (optional)
//   healthPath       – HTTP path to ping                                  (default '/')
function spawnManaged(key, cmd, args, opts = {}) {
  const {
    maxRestarts      = 8,
    restartWindowSec = 120,
    restartDelayMs   = 3000,
    env              = {},
    cwd              = ROOT,
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
    // On Windows, .cmd and .bat files need shell:true to execute —
    // without it Node.js throws EINVAL.
    const needsShell = /\.(cmd|bat)$/i.test(cmd);
    const proc = spawn(cmd, args, {
      cwd,
      detached: false,
      stdio:    'ignore',
      shell:    needsShell,
      windowsHide: true,
      env: { ...process.env, ...env },
    });

    entry.proc = proc;

    proc.on('error', (e) => {
      console.error(`[PP] ${key} spawn error:`, e.message);
    });

    proc.on('exit', (code, signal) => {
      if (isQuitting || entry.stopped) return;
      console.warn(`[PP] ${key} exited (code=${code} signal=${signal}) — scheduling restart`);
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
      console.error(`[PP] ${key} hit max restarts (${maxRestarts}) in ${restartWindowSec}s — giving up.`);
      return;
    }

    // Exponential back-off: 3s, 6s, 12s … capped at 30s
    const delay = Math.min(restartDelayMs * Math.pow(2, entry.restartCount), 30000);
    entry.restartCount++;
    entry.lastRestartAt = now;

    console.log(`[PP] ${key} restart #${entry.restartCount} in ${delay}ms…`);
    setTimeout(() => {
      if (!isQuitting && !entry.stopped) doSpawn();
    }, delay);
  }

  doSpawn();
  return entry;
}

// ─── Kill a managed server (no restart) ──────────────────────────────────────
function killServer(key) {
  const entry = servers[key];
  if (!entry) return;
  entry.stopped = true;
  if (entry.proc && !entry.proc.killed) {
    try { entry.proc.kill('SIGTERM'); } catch(_) {}
  }
}

// ─── Force-restart a managed server ──────────────────────────────────────────
function restartServer(key) {
  const entry = servers[key];
  if (!entry) return;
  entry.stopped = false;
  entry.restartCount = 0;
  if (entry.proc && !entry.proc.killed) {
    try { entry.proc.kill('SIGTERM'); } catch(_) {}
    // The 'exit' event will trigger a new spawn via scheduleRestart
  }
}

// ─── Kill ALL servers on app exit ─────────────────────────────────────────────
function killAll() {
  isQuitting = true;
  for (const key of Object.keys(servers)) {
    killServer(key);
  }
}

// ─── Ping a TCP port to check health ─────────────────────────────────────────
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

// ─── Anjali health-check watchdog ────────────────────────────────────────────
// Pings port 8426 every 20 seconds. If unreachable, kills the process so
// the auto-restart watchdog in spawnManaged fires immediately.
let anjaliHealthTimer = null;

function startAnjaliWatchdog() {
  if (anjaliHealthTimer) clearInterval(anjaliHealthTimer);
  anjaliHealthTimer = setInterval(async () => {
    if (isQuitting) return;
    const alive = await pingPort(8426);
    if (!alive) {
      console.warn('[PP] Anjali health-check FAILED — forcing restart...');
      const entry = servers['AnjaliAI'];
      if (entry) {
        entry.stopped  = false;      // allow restart
        entry.restartCount = 0;      // reset back-off
        if (entry.proc && !entry.proc.killed) {
          try { entry.proc.kill('SIGTERM'); } catch(_) {}
          // 'exit' handler fires → scheduleRestart() → doSpawn()
        } else {
          // Process already gone — call doSpawn directly through a hack:
          // trigger scheduleRestart with 0 back-off
          entry.lastRestartAt = 0;
          entry.restartCount  = 0;
          // Re-launch by simulating an exit event
          setTimeout(() => startAnjaliServer(), 1000);
        }
      }
      // Tell the renderer so it can show a status message
      BrowserWindow.getAllWindows().forEach(w => {
        w.webContents.send('server-status', {
          server: 'anjali',
          status: 'restarting',
          message: 'Anjali AI server went offline — restarting automatically…'
        });
      });
    } else {
      // Optionally notify renderer that Anjali is alive (throttled)
      // BrowserWindow.getAllWindows().forEach(w => {
      //   w.webContents.send('server-status', { server: 'anjali', status: 'ok' });
      // });
    }
  }, 20000); // every 20 seconds
}

// ─── Start individual servers ─────────────────────────────────────────────────
const PS = process.env.SYSTEMROOT
  ? path.join(process.env.SYSTEMROOT, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  : 'powershell';
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const ANJALI_PYTHON = path.join(ROOT, '.voiceclone-venv', 'Scripts', 'python.exe');

function startAnjaliServer() {
  if (!fs.existsSync(ANJALI_PYTHON)) {
    console.warn('[PP] Anjali AI venv not found — skipping.');
    return;
  }
  spawnManaged('AnjaliAI', ANJALI_PYTHON, [
    path.join(ROOT, 'anjali-chatterbox-server.py')
  ], {
    maxRestarts:      10,
    restartWindowSec: 180,
    restartDelayMs:   4000,
    env: {
      PYTHONWARNINGS: 'ignore',
      COQUI_TOS_AGREED: '1',
    }
  });
}

function startServers() {
  // 1. Voice server (port 8424)
  spawnManaged('VoiceServer', PS, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'speech-server.ps1')
  ], { restartDelayMs: 2000 });

  // 2. Transcription server (port 8428)
  spawnManaged('TranscriptionServer', PS, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'transcribe-server.ps1')
  ], { restartDelayMs: 2000 });

  // 3. Video Export / FFmpeg server (port 8430)
  spawnManaged('FFmpegServer', PS, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'video-export-server.ps1')
  ], { restartDelayMs: 2000 });

  // 4. Anjali AI voice clone server (port 8426) — with aggressive watchdog
  startAnjaliServer();

  // 5. Vite dev server (port 5173) — dev mode only
  if (IS_DEV) {
    spawnManaged('ViteDevServer', NPM, ['run', 'dev'], {
      cwd:   ROOT,
      restartDelayMs: 3000,
    });
  }

  // Start health watchdog after 45s (give Anjali time to load the model)
  setTimeout(startAnjaliWatchdog, 45000);
}

// ─── Free all server ports before launch ──────────────────────────────────────
// Kills any stale process (leftover python, old Electron, etc.) that is already
// holding one of our server ports. Without this, launching a second time while
// a previous python process is still alive causes ALL servers to fail with
// "port already in use" → the "Anjali voice server unavailable" error.
function freeServerPorts() {
  return new Promise((resolve) => {
    const ports = [5173, 8424, 8426, 8428, 8430];
    const psCmd = `
      $ports = ${JSON.stringify(ports)} -join ','
      @(${ports.join(',')}) | ForEach-Object {
        $p = $_
        $lines = netstat -ano | Select-String ":\${p}\\s"
        foreach ($line in $lines) {
          $id = ($line -replace '.*\\s+(\\d+)\\s*$', '$1').Trim()
          if ($id -match '^\\d+$' -and [int]$id -ne 0 -and [int]$id -ne $PID) {
            try { Stop-Process -Id ([int]$id) -Force -ErrorAction SilentlyContinue } catch {}
          }
        }
      }
    `.replace(/\n/g, ' ');
    const child = spawn(PS, ['-NoProfile', '-Command', psCmd], {
      detached: false, stdio: 'ignore', windowsHide: true,
    });
    child.on('exit', () => resolve());
    child.on('error', () => resolve());  // don't block on error
    // Hard timeout: give it 5s max then proceed
    setTimeout(resolve, 5000);
  });
}


// ─── Wait for Vite to be ready ────────────────────────────────────────────────
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

// ─── Create the main window ───────────────────────────────────────────────────
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
      enableBlinkFeatures: 'OffscreenCanvas',
      additionalArguments: ['--js-flags=--max-old-space-size=6144']
    }
  });

  Menu.setApplicationMenu(null);

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
    win.setTitle('Pattan Presentator — AI Teaching Studio');

    // ── Refresh shortcuts: Ctrl+R and F5 ────────────────────────
    globalShortcut.register('CommandOrControl+R', () => {
      win.webContents.reload();
    });
    globalShortcut.register('F5', () => {
      win.webContents.reload();
    });
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (IS_DEV) {
    await waitForVite(VITE_URL).catch(() => console.warn('[PP] Vite timeout — loading anyway'));
    win.loadURL(VITE_URL);
  } else {
    win.loadFile(path.join(ROOT, 'dist', 'index.html'));
  }

  // ── IPC: Native Save File Dialog ──────────────────────────────────────────
  ipcMain.handle('show-save-dialog', async (_, options) => {
    const result = await dialog.showSaveDialog(win, {
      title:       options.title       || 'Save File',
      defaultPath: options.defaultPath || path.join(os.homedir(), 'Desktop', options.fileName || 'output.mp4'),
      filters:     options.filters     || [{ name: 'MP4 Video', extensions: ['mp4'] }],
      buttonLabel: options.buttonLabel || 'Save'
    });
    return result;
  });

  // ── IPC: Write file natively ───────────────────────────────────────────────
  ipcMain.handle('write-file', async (_, { filePath, base64Data }) => {
    try {
      const buf = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buf);
      return { ok: true, filePath };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // ── IPC: Open folder in Explorer ──────────────────────────────────────────
  ipcMain.handle('show-item-in-folder', (_, filePath) => {
    shell.showItemInFolder(filePath);
  });

  // ── IPC: System info ──────────────────────────────────────────────────────
  ipcMain.handle('get-system-info', () => ({
    totalRam:   Math.round(os.totalmem()  / 1024 / 1024 / 1024 * 10) / 10,
    freeRam:    Math.round(os.freemem()   / 1024 / 1024 / 1024 * 10) / 10,
    cpus:       os.cpus().length,
    platform:   process.platform,
    appVersion: app.getVersion()
  }));

  // ── IPC: Restart Anjali from renderer (when user clicks retry) ────────────
  ipcMain.handle('restart-anjali', () => {
    console.log('[PP] Renderer requested Anjali restart.');
    restartServer('AnjaliAI');
    return { ok: true };
  });

  // ── IPC: Get server health status ─────────────────────────────────────────
  ipcMain.handle('get-server-health', async () => {
    const anjaliAlive = await pingPort(8426);
    const viteAlive   = await pingPort(5173, '/');
    return {
      anjali: anjaliAlive,
      vite:   viteAlive,
      timestamp: Date.now()
    };
  });

  win.on('closed', () => killAll());
  return win;
}

// ─── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  console.log('[PP] Electron ready — freeing server ports...');
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

app.on('window-all-closed', () => {
  killAll();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  killAll();
});

// ─── Crash guard: restart renderer on crash ───────────────────────────────────
app.on('render-process-gone', async (event, wc, details) => {
  console.error('[PP] Renderer crashed:', details.reason);
  if (['crashed', 'oom'].includes(details.reason)) {
    console.log('[PP] Restarting window...');
    await createWindow();
  }
});
