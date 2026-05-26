@echo off
setlocal
set "APP_DIR=%~dp0"
set "APP_DIR=%APP_DIR:~0,-1%"
set "PYTHON=%APP_DIR%\.voiceclone-venv\Scripts\python.exe"
set "SERVER=%APP_DIR%\anjali-chatterbox-server.py"

title Voice Presentator — Starting...
cd /d "%APP_DIR%"

REM ── Kill only Electron (never kill the Python voice server) ──────────────
powershell -NoProfile -Command "Get-Process -Name 'electron' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1
timeout /t 1 /nobreak >nul

REM ── Node / Electron dependencies ─────────────────────────────────────────
if not exist "%APP_DIR%\node_modules\electron\dist\electron.exe" (
  echo Installing Electron dependencies...
  call npm install --cache "%APP_DIR%\.npm-cache"
  if errorlevel 1 ( echo Failed to install Node dependencies. & pause & exit /b 1 )
)

REM ── Python venv ───────────────────────────────────────────────────────────
if not exist "%PYTHON%" (
  echo Creating Python voice environment...
  py -3 -m venv "%APP_DIR%\.voiceclone-venv" 2>nul || python -m venv "%APP_DIR%\.voiceclone-venv"
  if errorlevel 1 ( echo Failed to create Python environment. & pause & exit /b 1 )
)

REM ── Install edge_tts if missing ───────────────────────────────────────────
"%PYTHON%" -c "import edge_tts" >nul 2>&1
if errorlevel 1 (
  echo Installing edge_tts...
  "%PYTHON%" -m pip install edge_tts --quiet >nul 2>&1
)

REM ── Install Chatterbox TTS if missing ─────────────────────────────────────
"%PYTHON%" -c "import chatterbox" >nul 2>&1
if errorlevel 1 (
  echo Installing Chatterbox TTS - this may take a few minutes...
  "%PYTHON%" -m pip install chatterbox-tts resemble-perth peft --quiet
)

REM ── Extract voice reference from sc3.mp4 if missing ──────────────────────
if not exist "%APP_DIR%\voice-reference-sc3.wav" (
  set "SC3=D:\LESSONS\EVS\EVS C5 8TH LESSON\EVS C5 8TH LESSON\EVS C5 8TH Lesson fact file\sc3.mp4"
  if exist "%SC3%" (
    echo Extracting voice reference from sc3.mp4...
    ffmpeg -y -i "%SC3%" -vn -ac 1 -ar 22050 -sample_fmt s16 -af "loudnorm=I=-16:TP=-1.5:LRA=11" "%APP_DIR%\voice-reference-sc3.wav" >nul 2>&1
  )
)

REM ── Check if voice server is already running on port 8426 ─────────────────
powershell -NoProfile -Command "try { $r = Invoke-RestMethod 'http://127.0.0.1:8426/health' -TimeoutSec 3; exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  echo Voice server already running and warm - reusing it.
  goto :launch_electron
)

REM ── Start voice server as DETACHED background process ────────────────────
REM It runs independently - Electron never kills it.
echo Starting Chatterbox voice server in background...
echo (This takes ~60-90 seconds on first load - app will show progress)
start "Voice Server" /min "%PYTHON%" "%SERVER%"

REM ── Give server a moment to begin loading before Electron opens ───────────
timeout /t 3 /nobreak >nul

:launch_electron
REM ── Launch Electron detached — CMD exits immediately ─────────────────────
echo Launching Voice Presentator...
start "" "%APP_DIR%\node_modules\electron\dist\electron.exe" "%APP_DIR%"

endlocal
