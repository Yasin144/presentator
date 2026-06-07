@echo off
setlocal
set "APP_DIR=%~dp0"
set "APP_DIR=%APP_DIR:~0,-1%"
set "PYTHON=%APP_DIR%\.edge-tts-venv\Scripts\python.exe"
set "SERVER=%APP_DIR%\anjali-chatterbox-server.py"

title Voice Presentator — Starting...
cd /d "%APP_DIR%"

REM ── Kill only Electron (never kill the Python voice server) ──────────────
powershell -NoProfile -Command "Get-Process -Name 'electron' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1
ping 127.0.0.1 -n 2 >nul

REM ── Node / Electron dependencies ─────────────────────────────────────────
if not exist "%APP_DIR%\node_modules\electron\dist\electron.exe" (
  echo Installing Electron dependencies...
  call npm install --cache "%APP_DIR%\.npm-cache"
  if errorlevel 1 ( echo Failed to install Node dependencies. & pause & exit /b 1 )
)

REM ── Python venv ───────────────────────────────────────────────────────────
if not exist "%PYTHON%" (
  echo Creating Edge TTS Python environment...
  py -3 -m venv "%APP_DIR%\.edge-tts-venv" 2>nul || python -m venv "%APP_DIR%\.edge-tts-venv"
  if errorlevel 1 ( echo Failed to create Python environment. & pause & exit /b 1 )
)

REM ── Install edge_tts if missing ───────────────────────────────────────────
"%PYTHON%" -c "import edge_tts" >nul 2>&1
if errorlevel 1 (
  echo Installing edge_tts...
  "%PYTHON%" -m pip install edge_tts --quiet >nul 2>&1
)

REM ── Check if voice server is already running on port 8426 ─────────────────
REM Reuse only this C-drive app's own voice server. If another Presentator
REM install is holding 8426, stop it so C:\pattanpresentator stays isolated.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$root='%APP_DIR%'; Get-NetTCPConnection -LocalPort 8426 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { $proc = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $_) -ErrorAction SilentlyContinue; if ($proc -and $proc.CommandLine -notlike ('*' + $root + '*')) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }" >nul 2>&1
powershell -NoProfile -Command "try { $r = Invoke-RestMethod 'http://127.0.0.1:8426/health' -TimeoutSec 3; exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  echo Voice server already running and warm - reusing it.
  goto :launch_electron
)

REM ── Start voice server as DETACHED background process ────────────────────
REM It runs independently - Electron never kills it.
echo Starting Edge TTS voice server in background...
start "Edge TTS Server" /min "%PYTHON%" "%SERVER%"

REM ── Give server a moment to begin loading before Electron opens ───────────
ping 127.0.0.1 -n 4 >nul

:launch_electron
REM ── Launch Electron detached — CMD exits immediately ─────────────────────
echo Launching Voice Presentator...
start "" "%APP_DIR%\node_modules\electron\dist\electron.exe" "%APP_DIR%"

endlocal
