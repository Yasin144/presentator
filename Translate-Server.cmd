@echo off
title Caption Translation Server (Port 8434)
cd /d D:\voice
echo Starting Caption Translation Server on port 8434...
echo Supports: English, Hindi (हिंदी), Telugu (తెలుగు)
echo.
D:\voice\.voiceclone-venv\Scripts\python.exe -u translate-server.py
pause
