import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import InputPanel from './components/InputPanel';
import StagePanel from './components/StagePanel';
import ErrorCheckerApp from './components/ErrorChecker/ErrorCheckerApp';
import PresentationApp from './components/Presentation/PresentationApp';
const CaptionBurner = lazy(() => import('./caption/CaptionBurner'));

const LS_KEY   = 'pp-input-style-v1';
const DEFAULTS = { lineHeight: 2.1, fontSize: 0.98, letterSpacing: 0.01 };

class CaptionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[CaptionBurner] React view crashed:', error, info);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    const message = String(this.state.error?.message || this.state.error || 'Unknown caption error');
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050814', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <div style={{ width: 'min(560px, 92vw)', border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(127,29,29,0.18)', borderRadius: 18, padding: 22, boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Caption Burner stopped</div>
          <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800 }}>The video screen hit an error, but the app is still alive.</div>
          <pre style={{ marginTop: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#fecaca', background: 'rgba(0,0,0,0.28)', borderRadius: 10, padding: 12, fontSize: 12 }}>{message}</pre>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => this.setState({ error: null })} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Try Again</button>
            <button onClick={this.props.onClose} style={{ padding: '9px 14px', borderRadius: 10, border: 0, background: '#6366f1', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Back to Main App</button>
          </div>
        </div>
      </div>
    );
  }
}

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
  const [panelOpen, setPanelOpen]       = useState(false);
  const [captionOpen, setCaptionOpen]   = useState(false);
  const [captionResetKey, setCaptionResetKey] = useState(0);
  const [style, setStyle]               = useState(loadStyle);
  const [currentModule, setCurrentModule] = useState('presentator'); // 'presentator' | 'errorChecker' | 'presentation'
  const [hideHeader, setHideHeader]     = useState(false);

  useEffect(() => {
    const handleStateChange = (e) => {
      setHideHeader(!!e.detail.isPresenting);
    };
    window.addEventListener('presentation-state-change', handleStateChange);
    return () => window.removeEventListener('presentation-state-change', handleStateChange);
  }, []);

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
    // Cache-buster: change this version string any time a legacy JS file changes
    const _CB = '?v=20260708-caption-alert-preview-match-progress';
    const scriptSources = [
      "../logo-data.js" + _CB,
      "../script.js" + _CB,
      "../caption-script.js" + _CB,
      "app://voice/vendor/three.min.js",
      "app://voice/vendor/GLTFLoader.js",
      "../3d-engine.js" + _CB,
      "../dubbing-studio.js" + _CB,
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
      {/* ── Top Navigation Bar (Hidden when Caption Burner is full-screen or presenting) ── */}
      {!captionOpen && !hideHeader && (
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#090d16',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          height: '50px',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#f97316', letterSpacing: '0.5px', fontFamily: "system-ui" }}>🎤 PATTAN PRESENTATOR</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setCurrentModule('presentator')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: currentModule === 'presentator' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                color: currentModule === 'presentator' ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: currentModule === 'presentator' ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
                fontFamily: "system-ui"
              }}
            >Voice Presentator</button>
            <button
              onClick={() => setCurrentModule('errorChecker')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: currentModule === 'errorChecker' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                color: currentModule === 'errorChecker' ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: currentModule === 'errorChecker' ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
                fontFamily: "system-ui"
              }}
            >Error Checker</button>
            <button
              onClick={() => setCurrentModule('presentation')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: currentModule === 'presentation' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                color: currentModule === 'presentation' ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: currentModule === 'presentation' ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
                fontFamily: "system-ui"
              }}
            >Presentation</button>
          </div>
          <div style={{ width: '130px' }}></div> {/* Spacer to keep tabs centered */}
        </header>
      )}

      {/* Container with top margin to account for header height */}
      <div style={{ height: '100%' }}>
        {/* ── Full-screen Caption Burner ── */}
        <div style={{ display: captionOpen ? 'block' : 'none', height: '100%' }}>
          <CaptionErrorBoundary
            resetKey={captionResetKey}
            onClose={() => {
              setCaptionOpen(false);
              setCaptionResetKey(k => k + 1);
            }}
          >
            <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0e0e0e',color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>Loading…</div>}>
              <CaptionBurner onClose={() => setCaptionOpen(false)} />
            </Suspense>
          </CaptionErrorBoundary>
        </div>

        {/* ── Normal Presentator UI ── */}
        <div style={{ display: (captionOpen || currentModule !== 'presentator') ? 'none' : 'block', height: '100%', paddingTop: !captionOpen ? '50px' : 0, paddingBottom: '140px', boxSizing: 'border-box', overflowY: 'auto', overflowX: 'hidden' }}>
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
                    if (typeof window.ppSetCanvasLineSpacing === 'function') window.ppSetCanvasLineSpacing(v);
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
                    if (typeof window.ppSetCanvasLetterSpacing === 'function') window.ppSetCanvasLetterSpacing(v);
                    update('letterSpacing', v);
                  }}
                  style={{ width:'100%', accentColor:'#6366f1', cursor:'pointer', height:'5px' }} />
              </div>

              <button onClick={() => {
                reset();
                if (typeof window.ppSetFontScale === 'function') window.ppSetFontScale(1);
                if (typeof window.ppSetCanvasLineSpacing === 'function') window.ppSetCanvasLineSpacing(2.1);
                if (typeof window.ppSetCanvasLetterSpacing === 'function') window.ppSetCanvasLetterSpacing(0.01);
              }} style={{
                padding:'8px', borderRadius:'8px',
                border:'1px solid rgba(255,255,255,0.12)',
                background:'rgba(255,255,255,0.04)',
                color:'rgba(255,255,255,0.5)', fontSize:'0.82rem',
                cursor:'pointer', width:'100%', letterSpacing:'0.03em',
              }}>↺ Reset to Default</button>
            </div>
          )}

          {/* ── Caption Burner FAB ── */}
          <button
            onClick={() => setCaptionOpen(true)}
            title="Caption Burner (Hugging Face Whisper)"
            style={{
              position:'fixed', bottom:'88px', right:'24px', zIndex:9000,
              width:'52px', height:'52px', borderRadius:'50%',
              background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              border:'none', color:'#fff', fontSize:'1.4rem', cursor:'pointer',
              boxShadow:'0 6px 24px rgba(59,130,246,0.5)',
              display: captionOpen ? 'none' : 'flex',
              alignItems:'center', justifyContent:'center',
            }}
          >🎬</button>
        </div>

        {/* ── Error Checker UI ── */}
        <div style={{ display: (!captionOpen && currentModule === 'errorChecker') ? 'block' : 'none', height: '100%', paddingTop: '50px', boxSizing: 'border-box' }}>
          <ErrorCheckerApp />
        </div>

        {/* ── Presentation UI ── */}
        <div style={{ display: (!captionOpen && currentModule === 'presentation') ? 'block' : 'none', height: '100%', paddingTop: (!captionOpen && !hideHeader) ? '50px' : 0, boxSizing: 'border-box' }}>
          <PresentationApp />
        </div>
      </div>
    </>
  );

}

export default App;
