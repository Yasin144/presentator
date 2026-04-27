'use strict';

const { contextBridge, ipcRenderer } = require('electron');

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

  // Check if running inside Electron
  isElectron: true,
  platform: process.platform,
});
