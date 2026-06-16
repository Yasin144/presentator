# 🎓 Claude Yasin Presentator

AI-powered educational video studio with Anjali avatar, typewriter animations, burned-in captions, and professional video export.

## 🚀 Quick Start (Clone & Run)

### Prerequisites
- **Node.js** (v18+) — [Download](https://nodejs.org/)
- **Python 3.10+** — [Download](https://python.org/) (for AI narration server)
- **FFmpeg** — [Download](https://ffmpeg.org/download.html) (for video export muxing)

### Step 1: Clone & Install
```bash
git clone https://github.com/Yasin144/claude-yasin-presentator.git
cd claude-yasin-presentator
npm install
```

### Step 2: Start the Dev Server
```bash
npm run dev
```
Opens at **http://127.0.0.1:5173/**

### Step 3: Start Backend Services (for full features)

**Video Export Server** (required for video export):
```powershell
powershell -ExecutionPolicy Bypass -File video-export-server.ps1
```

**Anjali Narration Server** (required for AI voice):
```bash
python anjali-chatterbox-server.py
```

### Step 4: (Optional) AI Transcription Server
For AI caption generation from video audio, start the transcription server at `http://127.0.0.1:8428`.

## 🖥️ Desktop App Shortcut
Double-click `Pattan-Presentator.cmd` to launch as a standalone Electron-like app.

## ✨ Features
- **Anjali Avatar** — AI teacher with lip-sync and draggable positioning
- **Typewriter Animations** — Butter-smooth text reveal synced to narration
- **AI Captions** — Transcribe video audio or generate from text, burned into export
- **Draggable Overlays** — Move avatar, logo, and captions anywhere on canvas
- **Video Export** — Canvas recording + FFmpeg audio mux for professional MP4 output
- **Poster System** — Intro & outro poster images with configurable duration
- **PDF Presentations** — Import PDFs as slide-based lessons
- **Multiple Templates** — Learning outcomes, glossary, and custom layouts
- **Auto B-Roll** — AI-powered cinematic footage suggestions
- **Background Music** — Optional music overlay in exports

## 📁 Project Structure
```
├── script.js              # Main app logic (canvas, export, captions)
├── caption-script.js      # Standalone caption engine
├── src/
│   ├── components/
│   │   ├── InputPanel.jsx # Input/editing UI
│   │   └── StagePanel.jsx # Stage/preview/export UI
│   └── index.css          # Styles
├── anjali-chatterbox-server.py  # AI narration TTS server
├── video-export-server.ps1      # FFmpeg mux server
├── main.cjs               # Electron main process
├── preload.cjs             # Electron preload
├── vite.config.js          # Vite build config
└── package.json            # Dependencies
```

## 🔧 Environment Notes
- Narration server defaults to `http://127.0.0.1:5555`
- Video export server defaults to `http://127.0.0.1:3456`
- Transcription server defaults to `http://127.0.0.1:8428`
- All processing is **local/offline** — no cloud APIs required
