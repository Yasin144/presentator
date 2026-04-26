# Yasin Presentator

Windows-first classroom presentation and export app for the current `D:\presentator` workflow.

This repository is meant to preserve the working state of:

- the Vite app on `http://127.0.0.1:5173/`
- the local speech server
- the local transcription server
- the local video export server
- the Yasin desktop launcher flow

## What is included

- React/Vite app source
- export server logic
- intro video flow
- launcher files:
  - `Start.cmd`
  - `Yasin Presentator.cmd`
  - `Launch-Presentator.cmd`
- desktop shortcut recreation script:
  - `Create-Desktop-Shortcut.ps1`

## Prerequisites

- Windows 10 or 11
- PowerShell
- Node.js and npm
- FFmpeg available on the machine

Optional but recommended for the full local voice-clone flow:

- Python
- a local `.voiceclone-venv` prepared for `anjali-chatterbox-server.py`

The launchers are defensive:

- if the voice-clone venv is missing, the app still starts
- the launcher skips the Anjali clone server instead of failing the whole startup

## Install

```powershell
cd <your-clone-path>\presentator
npm install
```

## Run the app

Use either launcher:

```powershell
.\Start.cmd
```

or

```powershell
.\Yasin Presentator.cmd
```

Both use the same shared startup path and open:

```text
http://127.0.0.1:5173/
```

## Recreate the desktop shortcut

After cloning, create the same desktop launcher with:

```powershell
powershell -ExecutionPolicy Bypass -File .\Create-Desktop-Shortcut.ps1
```

That creates:

```text
Yasin Presentator.lnk
```

on the current Windows desktop, pointing to the repo launcher.

## Notes

- `node_modules`, `dist`, temp export folders, and local virtual environments are intentionally excluded from git.
- Large generated media and local scratch outputs are also excluded.
- The repository is intended to capture the working app code and launch flow, not every machine-local cache or generated artifact.
