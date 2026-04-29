@echo off
setlocal

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

cd /d "d:\presentator"

REM Kill any leftover Electron / Node processes from a previous session
powershell -NoProfile -Command "Get-Process -Name 'Pattan Presentator','electron' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

REM Kill any processes that are holding our server ports (8424 speech, 8426 Anjali, 8428 transcription, 8430 export, 5173 Vite)
REM This prevents the "Anjali voice server unavailable" error caused by stale python processes from a previous session
powershell -NoProfile -Command "@(5173,8424,8426,8428,8430) | ForEach-Object { $p=$_; netstat -ano | Select-String "":${p}\s"" | ForEach-Object { $id=($_ -replace '.*\s+(\d+)\s*$','$1').Trim(); if($id -match '^\d+$'){try{Stop-Process -Id ([int]$id) -Force -EA SilentlyContinue}catch{}} } }" >nul 2>&1

REM Brief pause to let ports release before Electron binds them
timeout /t 3 /nobreak >nul

echo  Launching Pattan Presentator...
echo  (Anjali AI voice loads in 2-4 minutes on first start)
echo.

REM Launch Electron — it will start all servers (speech, Anjali, transcription, export) automatically
npm.cmd start

endlocal
