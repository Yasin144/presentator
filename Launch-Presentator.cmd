@echo off
setlocal

title Pattan Presentator - Starting...
cd /d "%~dp0"

cls
echo.
echo  ================================================
echo    PATTAN PRESENTATOR  ^|  Native Desktop App
echo  ================================================
echo.
echo  Stopping old processes...

powershell -NoProfile -Command "@(5173,8424,8426,8428,8430) | ForEach-Object { $p=$_; netstat -ano | Select-String "":${p}\s"" | ForEach-Object { $id=($_ -replace '.*\s+(\d+)\s*$','$1').Trim(); if($id -match '^\d+$'){try{Stop-Process -Id ([int]$id) -Force -EA SilentlyContinue}catch{}} } }" >nul 2>&1
timeout /t 2 /nobreak >nul

echo  Launching Electron (all servers start automatically)...
echo.

npm.cmd start

endlocal
