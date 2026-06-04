@echo off
setlocal EnableDelayedExpansion

set "APP_DIR=%~dp0"
set "APP_DIR=%APP_DIR:~0,-1%"
set "PYTHON_VENV=%APP_DIR%\.voiceclone-venv\Scripts\python.exe"
set "SINGING_PYTHON=%APP_DIR%\.singing-venv\Scripts\python.exe"
set "ELECTRON=%APP_DIR%\node_modules\electron\dist\electron.exe"

title Voice Presentator
cd /d "%APP_DIR%"

REM ---- Install Electron if missing ----
if not exist "%ELECTRON%" (
  echo Installing Node dependencies...
  call npm install --cache "%APP_DIR%\.npm-cache"
  if errorlevel 1 ( echo Failed to install. & pause & exit /b 1 )
)

REM ---- Start heavy Python servers (only if not already running) ----
powershell -NoProfile -Command "try{Invoke-RestMethod 'http://127.0.0.1:8426/health' -TimeoutSec 2|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 (
  if exist "%PYTHON_VENV%" (
    start "Voice Clone" /min "%PYTHON_VENV%" -u "%APP_DIR%\anjali-chatterbox-server.py"
  )
)

powershell -NoProfile -Command "try{Invoke-RestMethod 'http://127.0.0.1:8431/health' -TimeoutSec 2|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 (
  if exist "%SINGING_PYTHON%" (
    start "SC3 Singing" /min "%SINGING_PYTHON%" -u "%APP_DIR%\sc3-singing-server.py"
  ) else if exist "%PYTHON_VENV%" (
    start "SC3 Singing" /min "%PYTHON_VENV%" -u "%APP_DIR%\sc3-singing-server.py"
  )
)

REM ---- Self-healing Electron restart loop ----
REM Electron is launched WITH /wait so we know when it exits.
REM Exit code 0 = user closed intentionally -> stop loop.
REM Any other code = crash -> restart automatically.

set RESTART_COUNT=0
:LAUNCH
set /a RESTART_COUNT+=1

if %RESTART_COUNT% GTR 1 (
  echo [Voice Presentator] Restart attempt %RESTART_COUNT% - waiting 2 seconds...
  timeout /t 2 /nobreak >nul
)

REM Kill any stale Electron before launching fresh
powershell -NoProfile -Command "Get-Process -Name electron -EA SilentlyContinue | Stop-Process -Force -EA SilentlyContinue" >nul 2>&1
timeout /t 1 /nobreak >nul

REM Launch with /wait - CMD blocks here until Electron exits
start /wait "" "%ELECTRON%" "%APP_DIR%"
set EXIT_CODE=%ERRORLEVEL%

REM Exit code 0 = user closed app normally -> done
if %EXIT_CODE% EQU 0 (
  echo [Voice Presentator] App closed normally.
  exit /b 0
)

REM Exit codes 1-5 are also sometimes normal Electron shutdowns
if %EXIT_CODE% LEQ 5 (
  echo [Voice Presentator] App exited (code %EXIT_CODE%) - restarting...
  goto LAUNCH
)

REM Unknown exit code - still restart but log it
echo [Voice Presentator] Unexpected exit code %EXIT_CODE% - restarting...
goto LAUNCH
