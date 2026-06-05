@echo off
setlocal

set "REPO_URL=https://github.com/Yasin144/presentator.git"
set "APP_DIR=C:\PATTANPRESENTATOR"

title Clone and Launch Pattan Presentator

echo.
echo  Pattan Presentator clone/update launcher
echo.

if exist "%APP_DIR%\.git" (
  echo  Existing app found. Updating from GitHub...
  cd /d "%APP_DIR%"
  git pull --rebase --autostash origin main
  if errorlevel 1 (
    echo  Git update failed. The existing app was not overwritten.
    pause
    exit /b 1
  )
) else (
  if exist "%APP_DIR%" (
    echo  Folder exists but is not a Git clone:
    echo  %APP_DIR%
    echo.
    echo  Rename or move that folder first, then run this shortcut again.
    pause
    exit /b 1
  )

  echo  Cloning app from GitHub...
  git clone "%REPO_URL%" "%APP_DIR%"
  if errorlevel 1 (
    echo  Git clone failed. Check internet/Git installation and try again.
    pause
    exit /b 1
  )
)

echo.
echo  Launching Pattan Presentator...
call "%APP_DIR%\Pattan-Presentator.cmd"

endlocal
