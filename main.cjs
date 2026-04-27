'use strict';

const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');
const http = require('http');
const os   = require('os');

// ─── Memory & GPU flags (set BEFORE app.ready) ───────────────────────────────
app.commandLine.appendSwitch('js-flags',
  '--max-old-space-size=8192 --expose-gc --turbo-fast-api-calls'
);
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('disable-renderer-backgrounding');   // keeps render thread alive (no throttle)
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

const ROOT = __dirname;
const IS_DEV = !app.isPackaged;
const VITE_URL = 'http://127.0.0.1:5173';

// ─── Track all child processes so we can kill them on exit ───────────────────
const childProcs = [];

function spawnBg(label, cmd, args, opts = {}) {
  console.log(`[PP] Starting ${label}...`);
  const proc = spawn(cmd, args, {
    cwd: ROOT,
    detached: false,
    stdio: 'ignore',
    shell: false,
    windowsHide: true,
    ...opts
  });
  proc._label = label;
  proc.on('error', (e) => console.error(`[PP] ${label} error:`, e.message));
  proc.on('exit',  (c) => console.log(`[PP] ${label} exited (code ${c})`));
  childProcs.push(proc);
  return proc;
}

// ─── Spawn all backend servers ────────────────────────────────────────────────
function startServers() {
  const ps = process.env.SYSTEMROOT
    ? path.join(process.env.SYSTEMROOT, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
    : 'powershell';

  // 1. Voice server (port 8424)
  spawnBg('VoiceServer', ps, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'speech-server.ps1')
  ]);

  // 2. Transcription server (port 8428)
  spawnBg('TranscriptionServer', ps, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'transcribe-server.ps1')
  ]);

  // 3. Video Export / FFmpeg server (port 8430)
  spawnBg('FFmpegServer', ps, [
    '-ExecutionPolicy', 'Bypass',
    '-File', path.join(ROOT, 'video-export-server.ps1')
  ]);

  // 4. Anjali AI voice clone server (port 8426)
  const anjaliPython = path.join(ROOT, '.voiceclone-venv', 'Scripts', 'python.exe');
  if (fs.existsSync(anjaliPython)) {
    spawnBg('AnjaliAI', anjaliPython, [
      path.join(ROOT, 'anjali-chatterbox-server.py')
    ], {
      env: {
        ...process.env,
        PYTHONWARNINGS: 'ignore',
        COQUI_TOS_AGREED: '1'
      }
    });
  } else {
    console.warn('[PP] Anjali AI venv not found — skipping.');
  }

  // 5. Vite dev server (port 5173) — only in dev mode
  if (IS_DEV) {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    spawnBg('ViteDevServer', npm, ['run', 'dev'], {
      cwd: ROOT,
      shell: true,
      stdio: 'ignore'
    });
  }
}

// ─── Wait for Vite to be ready before opening window ─────────────────────────
function waitForVite(url, retries = 40, delayMs = 500) {
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

// ─── Kill all child processes ─────────────────────────────────────────────────
function killAll() {
  for (const proc of childProcs) {
    try {
      if (!proc.killed) {
        proc.kill('SIGTERM');
        try { console.log(`[PP] Killed ${proc._label}`); } catch(_) {}
      }
    } catch(e) { /* ignore */ }
  }
}

// Guard all console output against EPIPE (broken pipe on shutdown)
['log','warn','error'].forEach(method => {
  const orig = console[method].bind(console);
  console[method] = (...args) => { try { orig(...args); } catch(_) {} };
});

// ─── Create the main window ───────────────────────────────────────────────────
async function createWindow() {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    minWidth: 1100,
    minHeight: 700,
    title: 'Pattan Presentator',
    icon: path.join(ROOT, 'pattan-presentator.ico'),
    backgroundColor: '#0f172a',
    show: false,                    // show after content loads
    autoHideMenuBar: true,
    webPreferences: {
      preload:            path.join(ROOT, 'preload.cjs'),
      nodeIntegration:    false,    // secure
      contextIsolation:   true,     // secure
      webSecurity:        false,    // allow blob:// and local file reads
      backgroundThrottling: false,  // CRITICAL: never throttle the render thread
      v8CacheOptions:    'code',    // cache compiled JS for faster reload
      enableBlinkFeatures: 'OffscreenCanvas', // enable OffscreenCanvas in renderer
      // Give renderer extra memory headroom
      additionalArguments: ['--js-flags=--max-old-space-size=6144']
    }
  });

  // Remove default menu completely
  Menu.setApplicationMenu(null);

  // Show splash title bar while loading
  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
    win.setTitle('Pattan Presentator — AI Teaching Studio');
  });

  // Handle new windows / external links in system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load the Vite app
  if (IS_DEV) {
    await waitForVite(VITE_URL).catch(() => console.warn('[PP] Vite timeout — loading anyway'));
    win.loadURL(VITE_URL);
    // Open DevTools detached so it doesn't steal memory from main window
    // win.webContents.openDevTools({ mode: 'detach' });
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
    return result; // { canceled, filePath }
  });

  // ── IPC: Write file natively (for video export bypass) ───────────────────
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

  // ── IPC: Get system info ──────────────────────────────────────────────────
  ipcMain.handle('get-system-info', () => ({
    totalRam:  Math.round(os.totalmem()  / 1024 / 1024 / 1024 * 10) / 10,
    freeRam:   Math.round(os.freemem()   / 1024 / 1024 / 1024 * 10) / 10,
    cpus:      os.cpus().length,
    platform:  process.platform,
    appVersion: app.getVersion()
  }));

  win.on('closed', () => killAll());
  return win;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  console.log('[PP] Electron ready — starting servers...');
  startServers();

  // Small pause so servers can bind their ports before we show the window
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

app.on('before-quit', killAll);

// ─── Crash guard: restart window on renderer crash ───────────────────────────
app.on('render-process-gone', async (event, wc, details) => {
  console.error('[PP] Renderer crashed:', details.reason);
  if (['crashed', 'oom'].includes(details.reason)) {
    console.log('[PP] Restarting window...');
    await createWindow();
  }
});
