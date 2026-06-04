'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

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

  // Check if running inside Electron
  isElectron: true,
  platform: process.platform,
});

