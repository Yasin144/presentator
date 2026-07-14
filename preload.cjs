'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

const burnProgressHandlers = new Map();

// ─── Expose a secure, limited API to the renderer via window.electronAPI ─────
contextBridge.exposeInMainWorld('electronAPI', {

  // Native save-file dialog
  showSaveDialog: (options) =>
    ipcRenderer.invoke('show-save-dialog', options),

  // Write a file natively (bypasses browser download API limitations)
  writeFile: (filePath, base64Data) =>
    ipcRenderer.invoke('write-file', { filePath, base64Data }),

  // Open the containing folder in Windows Explorer
  showItemInFolder: (filePath) =>
    ipcRenderer.invoke('show-item-in-folder', filePath),

  // Get system info (RAM, CPUs, platform)
  getSystemInfo: () =>
    ipcRenderer.invoke('get-system-info'),

  // Autonomous Presentator agent. Model credentials stay in the main process.
  presentatorAgentThink: (payload) =>
    ipcRenderer.invoke('presentator-agent-think', payload),

  presentatorAgentRestartServer: (serverName) =>
    ipcRenderer.invoke('presentator-agent-restart-server', serverName),

  presentatorAgentReadDiagnostics: () =>
    ipcRenderer.invoke('presentator-agent-read-diagnostics'),

  presentatorAgentLoadData: () =>
    ipcRenderer.invoke('presentator-agent-load-data'),

  presentatorAgentSaveData: (data) =>
    ipcRenderer.invoke('presentator-agent-save-data', data),

  presentatorAgentInspectCode: (request) =>
    ipcRenderer.invoke('presentator-agent-inspect-code', request),

  presentatorAgentApplyPatch: (request) =>
    ipcRenderer.invoke('presentator-agent-apply-patch', request),

  presentatorAgentRestartApp: () =>
    ipcRenderer.invoke('presentator-agent-restart-app'),

  presentatorAgentGenerateImage: (request) =>
    ipcRenderer.invoke('presentator-agent-generate-image', request),

  presentatorAgentCreateVideo: (request) =>
    ipcRenderer.invoke('presentator-agent-create-video', request),

  presentatorAgentImportReference: (request) =>
    ipcRenderer.invoke('presentator-agent-import-reference', request),

  // ── Server management ──────────────────────────────────────────────────────

  // Ask the main process to restart the Anjali AI server
  restartAnjali: () =>
    ipcRenderer.invoke('restart-anjali'),

  // Generate Edge TTS audio through Electron main. This avoids Chromium fetch
  // rejecting a valid local WAV response when Windows resets the socket close.
  narrateEdgeTts: (payload) =>
    ipcRenderer.invoke('narrate-edge-tts', payload),

  // Ask the main process to restart the video export / FFmpeg server
  restartVideoExport: () =>
    ipcRenderer.invoke('restart-video-export'),

  // Get live health status of all servers
  getServerHealth: () =>
    ipcRenderer.invoke('get-server-health'),

  // Listen for server-status push events from main process
  onServerStatus: (callback) => {
    ipcRenderer.on('server-status', (_, data) => callback(data));
  },

  // Remove server-status listener (cleanup)
  offServerStatus: (callback) => {
    ipcRenderer.removeListener('server-status', callback);
  },

  // ── SC3 crash-free video audio replacement ─────────────────────────────────
  // Gets the real on-disk path for a browser File object (Electron only).
  // Needed so the main process can read the file without loading it in renderer.
  getPathForFile: (file) => webUtils.getPathForFile(file),

  // Replace video audio with SC3 voice — all heavy work runs in main process:
  // FFmpeg extracts audio → SC3 server converts → FFmpeg muxes back into video.
  // Zero large files loaded into renderer memory. Crash-free.
  sc3ReplaceVideoAudio: (opts) =>
    ipcRenderer.invoke('sc3-replace-video-audio', opts),

  // Fast mode — SC3 Singing timbre transfer for video (no transcription, much faster)
  sc3SingingReplaceVideo: (opts) =>
    ipcRenderer.invoke('sc3-singing-replace-video', opts),

  // Transcribe video audio via main process (crash-free).
  // Main process extracts 16kHz mono WAV with FFmpeg and sends to transcription server.
  // Renderer never loads video bytes → no OOM crash on large videos.
  transcribeVideo: (opts) =>
    ipcRenderer.invoke('transcribe-video', opts),

  transcribeVideoGroq: (opts) =>
    ipcRenderer.invoke('transcribe-video-groq', opts),

  // Replace audio file vocal with Chatterbox sc3 voice (Transcribe → Indian English → TTS)
  sc3NarrateAudio: (opts) =>
    ipcRenderer.invoke('sc3-narrate-audio', opts),

  // Check if running inside Electron
  isElectron: true,
  platform: process.platform,

  // Synchronous Groq API key retrieval
  getGroqApiKey: () =>
    ipcRenderer.sendSync('get-groq-api-key'),

  // Fast caption export — burns subtitles into video using FFmpeg (no video playback)
  burnCaptions: (opts) =>
    ipcRenderer.invoke('burn-captions', opts),

  // Probe video dimensions/duration natively so caption export can match the
  // exact preview position and font scale without loading large videos in JS.
  probeVideoMeta: (opts) =>
    ipcRenderer.invoke('probe-video-meta', opts),

  // Extract 16kHz mono WAV audio natively using FFmpeg (returns on-disk path, NOT bytes)
  extractAudio: (opts) =>
    ipcRenderer.invoke('extract-audio', opts),

  // Read a byte-range slice from an on-disk WAV file (used to stream chunks without loading full file)
  readAudioChunk: (opts) =>
    ipcRenderer.invoke('read-audio-chunk', opts),

  // Merge narration audio into video (for animation/no-speech videos)
  mergeAudioIntoVideo: (opts) =>
    ipcRenderer.invoke('merge-audio-into-video', opts),

  // Desktop notification — alerts user when a task completes
  showNotification: (title, body, opts) =>
    ipcRenderer.invoke('show-notification', { title, body, ...opts }),

  // Open a file with the OS default handler (e.g. play a burned video in media player)
  openFile: (filePath) =>
    ipcRenderer.invoke('open-file', filePath),

  // Erase hardcoded captions from the bottom of the video using delogo filter
  eraseCaptions: (opts) =>
    ipcRenderer.invoke('erase-captions', opts),

  // Real-time FFmpeg burn progress (0-94) sent from main while burning captions
  onBurnProgress: (callback) => {
    const handler = (_, data) => callback(data);
    burnProgressHandlers.set(callback, handler);
    ipcRenderer.on('burn-captions-progress', handler);
  },

  offBurnProgress: (callback) => {
    const handler = burnProgressHandlers.get(callback);
    if (handler) {
      ipcRenderer.removeListener('burn-captions-progress', handler);
      burnProgressHandlers.delete(callback);
    }
  },

});
