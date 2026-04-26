import React, { useEffect } from 'react';
import InputPanel from './components/InputPanel';
import StagePanel from './components/StagePanel';

function App() {
  useEffect(() => {
    const scriptSources = [
      "/logo-data.js",
      "/script.js",
      "/caption-script.js",
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js",
      "/3d-engine.js",
      "/dubbing-studio.js",
    ];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-presentator-src="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true") {
            resolve();
            return;
          }

          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.dataset.presentatorSrc = src;
        script.addEventListener("load", () => {
          script.dataset.loaded = "true";
          resolve();
        }, { once: true });
        script.addEventListener("error", reject, { once: true });
        document.body.appendChild(script);
      });

    if (!window.__presentatorLegacyBootPromise) {
      window.__presentatorLegacyBootPromise = (async () => {
        for (const src of scriptSources) {
          await loadScript(src);
        }
      })().catch((error) => {
        window.__presentatorLegacyBootPromise = null;
        throw error;
      });
    }

    window.__presentatorLegacyBootPromise.catch((error) => {
      console.error("Failed to load legacy engine scripts:", error);
    });
  }, []);

  return (
    <>
      <main className="app-shell">
        <InputPanel />
        <StagePanel />
      </main>

      {/* Floating Global Elements from legacy index.html */}
      <div id="taskPercentIndicator" className="control-indicator playback-percent-indicator app-task-percent-indicator hidden" aria-live="polite">0%</div>
      <img id="stageLogoImage" className="hidden" alt="Info kids logo" />
      
      <div id="floatingColorPalette" style={{ display: "none", position: "fixed", zIndex: 10000, background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", width: "154px", flexWrap: "wrap", gap: "6px", pointerEvents: "auto" }}>
          <div className="color-swatch" data-color="#ffffff" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#ffffff", cursor: "pointer", border: "1px solid #444" }} title="White"></div>
          <div className="color-swatch" data-color="#000000" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#000000", cursor: "pointer", border: "1px solid #444" }} title="Black"></div>
          <div className="color-swatch" data-color="#173e58" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#173e58", cursor: "pointer", border: "1px solid #444" }} title="Deep Blue"></div>
          <div className="color-swatch" data-color="#0d7ea9" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0d7ea9", cursor: "pointer", border: "1px solid #444" }} title="Sky Blue"></div>
          <div className="color-swatch" data-color="#16a34a" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#16a34a", cursor: "pointer", border: "1px solid #444" }} title="Bright Green"></div>
          <div className="color-swatch" data-color="#dc2626" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#dc2626", cursor: "pointer", border: "1px solid #444" }} title="Red"></div>
          <div className="color-swatch" data-color="#facc15" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#facc15", cursor: "pointer", border: "1px solid #444" }} title="Yellow"></div>
          <div className="color-swatch" data-color="#7a1f1f" style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#7a1f1f", cursor: "pointer", border: "1px solid #444" }} title="Maroon"></div>
      </div>
    </>
  );
}

export default App;
