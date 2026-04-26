@echo off
setlocal

set "APP_NAME=%~1"
if "%APP_NAME%"=="" set "APP_NAME=Presentator Studio"

title %APP_NAME%
echo Starting %APP_NAME%...
echo.

cd /d "%~dp0"

echo [1/6] Cleaning up old background processes...
powershell -Command "Get-Process -Name node, powershell, python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match 'vite|speech-server|transcribe-server|video-export-server|anjali-chatterbox-server' } | Stop-Process -Force -ErrorAction SilentlyContinue"

echo [2/6] Starting Voice Server...
start "Speech Server" /min powershell -ExecutionPolicy Bypass -File "%~dp0speech-server.ps1"

echo [3/6] Starting Transcription Server...
start "Transcription Server" /min powershell -ExecutionPolicy Bypass -File "%~dp0transcribe-server.ps1"

echo [4/6] Starting Video Export Server...
start "Video Export Server" /min powershell -ExecutionPolicy Bypass -File "%~dp0video-export-server.ps1"

echo [5/6] Starting Anjali AI Voice Clone Server...
if not exist "%~dp0.voiceclone-venv\Scripts\python.exe" goto skipanjali
echo   - Anjali AI server is warming up in the background (takes 2-4 mins)...
start "Anjali AI Server" /min powershell -ExecutionPolicy Bypass -Command "$env:PYTHONWARNINGS='ignore'; $env:COQUI_TOS_AGREED='1'; & '%~dp0.voiceclone-venv\Scripts\python.exe' '%~dp0anjali-chatterbox-server.py'"
:skipanjali

echo [6/6] Starting React Application (Vite on 127.0.0.1:5173)...
start "Vite Dev Server" /min cmd.exe /c "npm.cmd run dev"

echo.
echo Waiting 5 seconds for the app server to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ==============================================
echo   %APP_NAME% IS RUNNING!
echo   Application: http://127.0.0.1:5173/
echo ==============================================
echo.
echo Opening browser...
start http://127.0.0.1:5173/

echo.
echo Press any key to close this terminal (Servers will keep running in the background)
pause >nul

endlocal
