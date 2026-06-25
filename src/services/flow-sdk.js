export const Flow = {
  generate: {
    async text(content, options) {
      if (window && window.electronAPI) {
        const result = await window.electronAPI.generateText({
          content,
          systemInstruction: options?.systemInstruction,
          thinkingLevel: options?.thinkingLevel
        });
        
        if (result.error) {
          throw new Error(result.error);
        }
        return { text: result.text };
      } else {
        throw new Error("electronAPI is not available in window context. Check if preload.js is loaded.");
      }
    }
  },
  async download(options) {
    if (window && window.electronAPI && typeof window.electronAPI.saveToDownloads === 'function') {
      try {
        await window.electronAPI.saveToDownloads(options.filename, options.base64);
        if (typeof window.electronAPI.showNotification === 'function') {
          window.electronAPI.showNotification('Download Complete', `Saved ${options.filename} to Downloads folder.`);
        }
      } catch (err) {
        console.error('Native download failed, falling back to browser download:', err);
        this._fallbackDownload(options);
      }
    } else {
      this._fallbackDownload(options);
    }
  },
  _fallbackDownload(options) {
    const link = document.createElement('a');
    link.href = `data:${options.mimeType};base64,${options.base64}`;
    link.download = options.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
