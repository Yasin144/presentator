@echo off
title Launching Error Checker...
cd /d "%~dp0"

echo Stopping any active Electron instances...
taskkill /IM electron.exe /F >nul 2>&1

echo Launching Error Checker Standalone App...
set ELECTRON_ENABLE_LOGGING=1
start "" "D:\voice\node_modules\electron\dist\electron.exe" "C:\Users\patan\.gemini\antigravity\scratch\error-checker"

exit
