@echo off
setlocal
set "APP_DIR=%~dp0"
set "APP_DIR=%APP_DIR:~0,-1%"

title Pattan Presentator

cls
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║          PATTAN PRESENTATOR                  ║
echo  ║    Native Desktop App  ^|  AI Studio          ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  Cleaning up old processes...
echo.

cd /d "%APP_DIR%"

REM Kill any leftover Electron / Node processes from a previous session
powershell -NoProfile -Command "Get-Process -Name 'electron' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

REM Kill any processes holding our server ports
powershell -NoProfile -Command "@(5173,8424,8426,8428,8430) | ForEach-Object { $p=$_; netstat -ano | Select-String "":${p}\s"" | ForEach-Object { $id=($_ -replace '.*\s+(\d+)\s*$','$1').Trim(); if($id -match '^\d+$'){try{Stop-Process -Id ([int]$id) -Force -EA SilentlyContinue}catch{}} } }" >nul 2>&1

timeout /t 2 /nobreak >nul

if not exist "%APP_DIR%\node_modules\electron\dist\electron.exe" (
  echo  Installing Electron app dependencies...
  call npm install --cache "%APP_DIR%\.npm-cache"
  if errorlevel 1 (
    echo  Failed to install Node dependencies.
    pause
    exit /b 1
  )
)

if not exist "%APP_DIR%\.voiceclone-venv\Scripts\python.exe" (
  echo  Creating local voice Python environment...
  py -3 -m venv "%APP_DIR%\.voiceclone-venv" 2>nul || python -m venv "%APP_DIR%\.voiceclone-venv"
  if errorlevel 1 (
    echo  Failed to create Python voice environment.
    pause
    exit /b 1
  )
)

echo  Checking voice dependencies...
"%APP_DIR%\.voiceclone-venv\Scripts\python.exe" -c "import edge_tts" >nul 2>&1
if errorlevel 1 (
  "%APP_DIR%\.voiceclone-venv\Scripts\python.exe" -m pip install --upgrade pip
  "%APP_DIR%\.voiceclone-venv\Scripts\python.exe" -m pip install -r "%APP_DIR%\requirements-voice.txt"
  if errorlevel 1 (
    echo  Failed to install voice dependencies.
    pause
    exit /b 1
  )
)

echo  Launching Pattan Presentator...
echo  (All helper servers start automatically in the Electron app)
echo.

REM Launch Electron using local node_modules
"%APP_DIR%\node_modules\electron\dist\electron.exe" "%APP_DIR%"

endlocal
