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
echo  Launching native desktop application...
echo.

cd /d "d:\presentator"

REM Kill any leftover node/electron processes from previous session
powershell -Command "Get-Process -Name 'Pattan Presentator','electron' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

REM Launch Electron — it will start Vite + all servers internally
npm.cmd start

endlocal
