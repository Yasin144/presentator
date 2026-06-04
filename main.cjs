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

// ─── Memory & GPU flags (set BEFORE app.ready) ────────────────────────────────
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

// ─── Main-process crash guard (prevents silent death) ────────────────────────
// If any unhandled error slips past, log it but DON'T let the main process die.
process.on('uncaughtException', (err) => {
  console.error('[PP] UNCAUGHT EXCEPTION (main process):', err);
  // Don't rethrow — keep the process alive
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

// ─── Edge TTS health-check watchdog ──────────────────────────────────────────
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
      return;  // allow 5 × 30s = 150 seconds before restart
    }
    anjaliHealthFailureCount = 0;

    if (!alive) {
      console.warn('[PP] Voice server health-check FAILED — forcing restart...');
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
          message: 'Voice server went offline — restarting automatically...'
        });
      });
    }
  }, 30000); // ping every 30s; restart only after 5 consecutive misses = 150s grace
}

// ─── Start individual servers ─────────────────────────────────────────────────
const PS = process.env.SYSTEMROOT
  ? path.join(process.env.SYSTEMROOT, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  : 'powershell';
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const ANJALI_PYTHON = path.join(ROOT, '.voiceclone-venv', 'Scripts', 'python.exe');
const SINGING_PYTHON = path.join(ROOT, '.singing-venv', 'Scripts', 'python.exe');
const ANJALI_SERVER = path.join(ROOT, 'anjali-chatterbox-server.py');
const EDGE_TTS_SERVER = path.join(ROOT, 'timed-voiceover-server.py');
const SC3_SINGING_SERVER = path.join(ROOT, 'sc3-singing-server.py');

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
    await new Promise(resolve => setTimeout(resolve, 1500));
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
    console.warn('[PP] Chatterbox Python process exists but 8426 is not healthy — waiting briefly.');
    if (!servers['AnjaliAI']) {
      servers['AnjaliAI'] = { proc: null, restartCount: 0, lastRestartAt: Date.now(), stopped: false };
    }
    BrowserWindow.getAllWindows().forEach(w => {
      w.webContents.send('server-status', {
        server: 'anjali',
        status: 'starting',
        message: 'Chatterbox voice server is starting on port 8426...'
      });
    });
    if (await waitForAnjaliHealth(120000)) {
      console.log('[PP] Chatterbox voice server became healthy on 8426.');
      return;
    }
    console.warn('[PP] Stale Chatterbox process did not become healthy — restarting clone server.');
    await killAnjaliServerProcesses();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('[PP] Starting Chatterbox Python voice server...');
  spawnManaged('AnjaliAI', ANJALI_PYTHON, ['-u', ANJALI_SERVER], {
    cwd: ROOT,
    restartDelayMs: 5000,
    maxRestarts: 4,
    restartWindowSec: 600,
    env: {
      PYTHONUTF8: '1',
      PYTHONUNBUFFERED: '1',
    }
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
    env: {
      PYTHONUTF8: '1',
      PYTHONUNBUFFERED: '1',
    }
  });

  // 5. SC3 singing model server (port 8431)
  if (fs.existsSync(SC3_SINGING_SERVER)) {
    spawnManaged('Sc3Singing', fs.existsSync(SINGING_PYTHON) ? SINGING_PYTHON : ANJALI_PYTHON, ['-u', SC3_SINGING_SERVER], {
      cwd: ROOT,
      restartDelayMs: 3000,
      maxRestarts: 4,
      restartWindowSec: 600,
      env: { PYTHONUTF8: '1', PYTHONUNBUFFERED: '1' }
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
      additionalArguments: ['--js-flags=--max-old-space-size=3072']
    }
  });

  Menu.setApplicationMenu(null);

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
    win.setTitle('Pattan Presentator — AI Teaching Studio');

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

  // ── IPC: Restart video export server from renderer ───────────────────────
  ipcMain.handle('restart-video-export', () => {
    console.log('[PP] Renderer requested video export server restart.');
    restartServer('FFmpegServer');
    return { ok: true };
  });

// ─── SC3 Video Audio Replacement (crash-free, main-process only) ─────────────
// The renderer passes a file path (not file contents). The main process:
//   1. Uses FFmpeg to extract audio from the video
//   2. Sends the audio (WAV) to the SC3 singing server (port 8431)
//   3. Receives SC3-converted audio
//   4. Uses FFmpeg to mux the new audio back into the original video
//   5. Saves to user Downloads and returns the output path
// NO large file is ever loaded into renderer memory → zero OOM risk.
ipcMain.handle('sc3-replace-video-audio', async (event, opts) => {
  const { filePath, outputBaseName } = opts || {};
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
    const sc3Raw = await postJsonForBuffer(8431, '/api/convert-song', {
      filePath: chunkPath,
      outputFileName: chunkName + '.mp3',
      saveToDownloads: false
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
        const req = http.get({ hostname: '127.0.0.1', port: 8431, path: '/health', agent: false }, (res) => {
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

    // 2. Wait for SC3 model to be fully warmed
    await waitForSc3Warmed(120000);

    // 3. Split into 50-second chunks (prevents Python OOM on long audio)
    const CHUNK_SECS = 50;
    const numChunks = Math.ceil(totalSecs / CHUNK_SECS);
    console.log('[PP] SC3 replace: splitting into', numChunks, 'chunk(s) of', CHUNK_SECS, 's');

    const convertedChunks = [];

    for (let c = 0; c < numChunks; c++) {
      const chunkIn  = path.join(tmpDir, 'sc3-chunk-in-'  + stamp + '-' + c + '.mp3');
      const chunkOut = path.join(tmpDir, 'sc3-chunk-out-' + stamp + '-' + c + '.mp3');
      tempFiles.push(chunkIn, chunkOut);

      // Cut this chunk from the full MP3
      const startSec = c * CHUNK_SECS;
      await runFFmpeg([
        '-y', '-i', inputMp3,
        '-ss', String(startSec), '-t', String(CHUNK_SECS),
        '-acodec', 'copy',
        chunkIn
      ], 'cut chunk ' + c);

      // Convert chunk via SC3
      const sc3Mp3Buffer = await sc3ConvertChunk(chunkIn, safeBase + '-chunk' + c);
      fs.writeFileSync(chunkOut, sc3Mp3Buffer);
      convertedChunks.push(chunkOut);
      console.log('[PP] SC3 replace: chunk', c + 1, '/', numChunks, 'done.');
    }

    // 4. Concatenate all converted chunks
    let finalAudioMp3;
    if (convertedChunks.length === 1) {
      finalAudioMp3 = convertedChunks[0];
    } else {
      finalAudioMp3 = path.join(tmpDir, 'sc3-final-audio-' + stamp + '.mp3');
      tempFiles.push(finalAudioMp3);
      // Write FFmpeg concat list
      const listFile = path.join(tmpDir, 'sc3-concat-' + stamp + '.txt');
      tempFiles.push(listFile);
      fs.writeFileSync(listFile, convertedChunks.map(f => "file '" + f.replace(/'/g, "'\''") + "'").join('\n'));
      await runFFmpeg([
        '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
        '-acodec', 'libmp3lame', '-b:a', '128k',
        finalAudioMp3
      ], 'concatenate chunks');
    }

    // 5. Mux SC3 audio into original video
    console.log('[PP] SC3 replace: muxing sc3 audio into video...');
    await runFFmpeg([
      '-y',
      '-i', filePath,
      '-i', finalAudioMp3,
      '-c:v', 'copy',
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-shortest',
      outputMp4
    ], 'mux video');

    console.log('[PP] SC3 replace: complete ->', path.basename(outputMp4));
    return { ok: true, outputPath: outputMp4, fileName: path.basename(outputMp4) };

  } catch (err) {
    console.error('[PP] SC3 replace error:', err.message);
    return { ok: false, error: err.message };
  } finally {
    for (const f of tempFiles) { try { fs.unlinkSync(f); } catch (_) {} }
  }
});


  // ── IPC: Get server health status ─────────────────────────────────────────
  ipcMain.handle('get-server-health', async () => {
    const [anjaliAlive, edgeTtsAlive, transcribeAlive, videoExportAlive, sc3SingingAlive, viteAlive] = await Promise.all([
      pingPort(8426),
      pingPort(8427),
      pingPort(8428),
      pingPort(8430),
      pingPort(8431),
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

// ─── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Register app:// protocol — maps every request to D:\voice\
  // This fixes absolute-path script loading (/script.js → D:\voice\script.js)
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
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': MIME[ext] || 'application/octet-stream' }
      });
    } catch (err) {
      return new Response('Error: ' + err.message, { status: 500 });
    }
  });

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

// Recovery flag — prevents app.quit() firing during crash recovery
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

// ─── Crash guard: reload renderer on crash (same window, no new tab) ────────
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

// ─── Memory watchdog: log usage every 60s, trigger GC if high ────────────────
setInterval(() => {
  const used = process.memoryUsage();
  const mbUsed = Math.round(used.rss / 1024 / 1024);
  if (mbUsed > 1800) {
    console.warn(`[PP] Main process RAM: ${mbUsed} MB — requesting GC`);
    if (global.gc) try { global.gc(); } catch (_) {}
  }
  // Log renderer RAM from each window
  BrowserWindow.getAllWindows().forEach((w) => {
    if (!w.isDestroyed()) {
      const metrics = w.webContents.getProcessMemoryInfo ? null : null;
      void 0; // placeholder — Electron exposes this via webContents events
    }
  });
}, 60000);


