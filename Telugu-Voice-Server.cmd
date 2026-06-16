@echo off
title Telugu Voice TTS Server (Port 8433)
set "APP_DIR=D:\voice"
set "PYTHON=%APP_DIR%\.voiceclone-venv\Scripts\python.exe"

echo.
echo  +----------------------------------------------------------+
echo  ^|  Telugu Voice TTS Server  --  Port 8433                ^|
echo  ^|  Engine  : Chatterbox TTS  (SAME as SC3)               ^|
echo  ^|  Voice   : telugh referance voice.mp4  (EXACT clone)   ^|
echo  ^|  Quality : 100%% natural and realistic like SC3         ^|
echo  +----------------------------------------------------------+
echo.

if not exist "%PYTHON%" (
    echo [ERROR] voiceclone-venv not found at %APP_DIR%\.voiceclone-venv
    echo         Please run Voice-Presentator.cmd first to set up the environment.
    pause
    exit /b 1
)

cd /d "%APP_DIR%"
"%PYTHON%" -u "%APP_DIR%\telugu-voice-server.py"
pause
