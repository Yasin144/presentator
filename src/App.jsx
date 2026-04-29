import React, { useEffect, useState, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import StagePanel from './components/StagePanel';

const LS_KEY   = 'pp-input-style-v1';
const DEFAULTS = { lineHeight: 2.1, fontSize: 0.98, letterSpacing: 0.01 };

function loadStyle() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || DEFAULTS; }
  catch (_) { return DEFAULTS; }
}
function saveStyle(vals) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(vals)); } catch (_) {}
}
function applyToTextarea(vals) {
  const el = document.getElementById('lessonInput');
  if (!el) return;
  el.style.lineHeight    = String(vals.lineHeight);
  el.style.fontSize      = vals.fontSize + 'rem';
  el.style.letterSpacing = vals.letterSpacing + 'em';
}

function App() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [style, setStyle]         = useState(loadStyle);

  // Apply on every style change
  useEffect(() => { applyToTextarea(style); saveStyle(style); }, [style]);

  // Also apply after scripts finish loading (lessonInput may not exist yet)
  useEffect(() => {
    const t = setTimeout(() => applyToTextarea(style), 2000);
    return () => clearTimeout(t);
  }, []);

  const update = useCallback((key, val) => {
    setStyle(prev => ({ ...prev, [key]: val }));
  }, []);

  const reset = useCallback(() => { setStyle(DEFAULTS); }, []);

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
        // Apply styles once scripts have mounted the textarea
        applyToTextarea(style);
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
          {["#ffffff","#000000","#173e58","#0d7ea9","#16a34a","#dc2626","#facc15","#7a1f1f"].map(c => (
            <div key={c} className="color-swatch" data-color={c} style={{ width: "20px", height: "20px", borderRadius: "50%", background: c, cursor: "pointer", border: "1px solid #444" }} title={c}></div>
          ))}
      </div>

      {/* ══ Floating Input Style Module ══════════════════════════════════════ */}
      {/* ⚙ FAB button — always visible bottom-right */}
      <button
        onClick={() => setPanelOpen(o => !o)}
        title="Input Style Settings"
        style={{
          position:'fixed', bottom:'24px', right:'24px', zIndex:9000,
          width:'52px', height:'52px', borderRadius:'50%',
          background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
          border:'none', color:'#fff', fontSize:'1.4rem', cursor:'pointer',
          boxShadow: panelOpen ? '0 6px 32px rgba(99,102,241,0.8)' : '0 6px 24px rgba(99,102,241,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          transform: panelOpen ? 'rotate(45deg)' : 'none',
          transition:'transform 0.2s, box-shadow 0.2s',
        }}
      >⚙</button>

      {/* Floating settings panel */}
      {panelOpen && (
        <div style={{
          position:'fixed', bottom:'86px', right:'24px', zIndex:9001,
          width:'300px', padding:'20px 22px 16px',
          background:'#1a1f2e', borderRadius:'16px',
          border:'1px solid rgba(255,255,255,0.1)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.7)',
          fontFamily:"'Segoe UI',system-ui,sans-serif",
          display:'flex', flexDirection:'column', gap:'16px',
        }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:'0.95rem' }}>⚙ Input Style</span>
            <button onClick={() => setPanelOpen(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.45)', fontSize:'1.1rem', cursor:'pointer', padding:'0 4px' }}>✕</button>
          </div>

          {/* Line Spacing — textarea CSS only */}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.83rem' }}>↕ Line Spacing</span>
              <span style={{ color:'#a5b4fc', fontWeight:700, fontSize:'0.85rem' }}>{style.lineHeight}</span>
            </div>
            <input type="range" min={1.2} max={3.2} step={0.1} value={style.lineHeight}
              onChange={e => {
                const v = parseFloat(e.target.value);
                const el = document.getElementById('lessonInput');
                if (el) el.style.lineHeight = String(v);
                update('lineHeight', v);
              }}
              style={{ width:'100%', accentColor:'#6366f1', cursor:'pointer', height:'5px' }} />
          </div>

          {/* Font Size — textarea CSS + canvas fontScale */}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.83rem' }}>Aa Font Size</span>
              <span style={{ color:'#a5b4fc', fontWeight:700, fontSize:'0.85rem' }}>{style.fontSize}rem</span>
            </div>
            <input type="range" min={0.8} max={1.6} step={0.05} value={style.fontSize}
              onChange={e => {
                const v = parseFloat(e.target.value);
                // Update textarea CSS
                const el = document.getElementById('lessonInput');
                if (el) el.style.fontSize = v + 'rem';
                // Update canvas font scale instantly
                if (typeof window.ppSetFontScale === 'function') window.ppSetFontScale(v);
                update('fontSize', v);
              }}
              style={{ width:'100%', accentColor:'#6366f1', cursor:'pointer', height:'5px' }} />
          </div>

          {/* Letter Spacing — textarea CSS only */}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.83rem' }}>A→Z Letter Spacing</span>
              <span style={{ color:'#a5b4fc', fontWeight:700, fontSize:'0.85rem' }}>{Number(style.letterSpacing).toFixed(3)}em</span>
            </div>
            <input type="range" min={0} max={0.15} step={0.005} value={style.letterSpacing}
              onChange={e => {
                const v = parseFloat(e.target.value);
                const el = document.getElementById('lessonInput');
                if (el) el.style.letterSpacing = v + 'em';
                update('letterSpacing', v);
              }}
              style={{ width:'100%', accentColor:'#6366f1', cursor:'pointer', height:'5px' }} />
          </div>

          <button onClick={() => {
            reset();
            if (typeof window.ppSetFontScale === 'function') window.ppSetFontScale(1);
          }} style={{
            padding:'8px', borderRadius:'8px',
            border:'1px solid rgba(255,255,255,0.12)',
            background:'rgba(255,255,255,0.04)',
            color:'rgba(255,255,255,0.5)', fontSize:'0.82rem',
            cursor:'pointer', width:'100%', letterSpacing:'0.03em',
          }}>↺ Reset to Default</button>
        </div>
      )}
    </>
  );
}

export default App;
