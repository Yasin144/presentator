import React, { useRef, useEffect, useState } from "react";
import { useStore } from "../store/useStore";

function StagePanel() {
  const canvasRef = useRef(null);
  const actionLocks = useStore((state) => state.actionLocks);
  const [isExporting, setIsExporting] = useState(false);

  // Poll export status every 500 ms
  useEffect(() => {
    const id = setInterval(() => {
      setIsExporting(typeof window.ppIsExporting === 'function' ? window.ppIsExporting() : false);
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#173e58';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  return (
    <section className="panel panel-stage hidden" id="stagePanel">
      <div className="stage-actions">
        <details className="stage-toolbar-group stage-toolbar-primary stage-toolbar-card">
          <summary className="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p className="stage-toolbar-label">Playback</p>
              <p className="stage-toolbar-meta">Open, play, stop, and add slide images</p>
            </div>
            <span className="stage-toolbar-badge">PLAY</span>
          </summary>
          <div className="stage-toolbar-body">
            <div className="stage-toolbar-buttons stage-toolbar-buttons-compact">
              <button id="editBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Back to input"
                title="Back to input"><span aria-hidden="true">&larr;</span></button>
              <button id="playBtn" className="primary-btn stage-icon-btn stage-icon-btn-primary" type="button"
                aria-label="Play slide" title="Play slide"><span aria-hidden="true">&#9654;</span></button>
              <span id="playbackPercentIndicator" className="control-indicator playback-percent-indicator"
                title="Playback progress" aria-live="polite">0%</span>
              <button id="pauseStageBtn" className="ghost-btn stage-icon-btn hidden" type="button" disabled
                aria-label="Pause" title="Pause"><span aria-hidden="true">&#10074;&#10074;</span></button>
              <button id="stopStageBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Stop"
                title="Stop"><span aria-hidden="true">&#9632;</span></button>
              <button id="stageImageUploadBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Upload images"
                title="Upload images"><span aria-hidden="true">IMG</span></button>
              <button id="stageVideoUploadBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Upload video"
                title="Upload video"><span aria-hidden="true">VID</span></button>
            </div>
            <div className="stage-playback-controls">
              <label className="stage-speed-field stage-speed-field-inline" htmlFor="stagePlaybackSpeedSelect">
                <span className="style-label">Screen Speed</span>
                <select id="stagePlaybackSpeedSelect" className="theme-select text-style-select stage-speed-select"
                  aria-label="Choose screen playback speed" defaultValue="1">
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="0.85">0.85x</option>
                  <option value="0.9">0.9x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                  <option value="2.5">2.5x</option>
                </select>
              </label>
              <p className="stage-speed-copy">Slows narration only. Anjali pitch stays natural.</p>
            </div>
            <div className="stage-media-tools" aria-label="Stage media tools">
              <button id="stageImageCutoutBtn" className="ghost-btn stage-icon-btn" type="button" disabled
                aria-label="Remove image background" title="Remove image background"><span
                  aria-hidden="true">IMG-</span></button>
              <button id="stageImageRestoreBtn" className="ghost-btn stage-icon-btn" type="button" disabled
                aria-label="Restore image" title="Restore image"><span aria-hidden="true">IMG+</span></button>
              <button id="stageVideoCutoutBtn" className="ghost-btn stage-icon-btn" type="button" disabled
                aria-label="Remove video background" title="Remove video background"><span
                  aria-hidden="true">VID-</span></button>
              <button id="stageVideoRestoreBtn" className="ghost-btn stage-icon-btn" type="button" disabled
                aria-label="Restore video" title="Restore video"><span aria-hidden="true">VID+</span></button>
            </div>
          </div>
        </details>

        <details className="stage-toolbar-group stage-toolbar-card">
          <summary className="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p className="stage-toolbar-label">Pages</p>
              <p className="stage-toolbar-meta">Move through the full presentation</p>
            </div>
            <span className="stage-toolbar-badge">NAV</span>
          </summary>
          <div className="stage-toolbar-body">
            <div className="stage-page-actions" aria-label="Stage page navigation">
              <button id="prevPageBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Previous page"
                title="Previous page"><span aria-hidden="true">&#8249;</span></button>
              <span id="pageIndicator" className="page-indicator">Page 1 / 1</span>
              <button id="nextPageBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Next page"
                title="Next page"><span aria-hidden="true">&#8250;</span></button>
            </div>
          </div>
        </details>

        <details className="stage-toolbar-group stage-toolbar-card">
          <summary className="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p className="stage-toolbar-label">Intro &amp; Poster</p>
              <p className="stage-toolbar-meta">Optional: intro clip and/or poster image before the lesson</p>
            </div>
            <span className="stage-toolbar-badge">INT</span>
          </summary>
          <div className="stage-toolbar-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} htmlFor="introClipEnabled">
                <input id="introClipEnabled" type="checkbox" style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "0.75rem", color: "#fff", fontWeight: "600" }}>Play Intro Clip (optional)</span>
              </label>
              <p id="introClipStatus" className="stage-toolbar-meta" style={{ margin: 0 }}>
                Unchecked — intro will be skipped. The lesson starts directly.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "8px", marginTop: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <button id="introPosterUploadBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Upload poster image" title="Upload poster image (shown before lesson, no intro needed)">
                    <span aria-hidden="true">POST</span>
                  </button>
                  <input id="introPosterInput" type="file" accept="image/*" hidden />
                  <span style={{ fontSize: "0.75rem", color: "#ccc", fontWeight: "500" }}>Add Poster (optional, independent of intro)</span>
                </div>
                <p id="introPosterStatus" className="stage-toolbar-meta" style={{ margin: "6px 0 0 0" }}>
                  No poster selected. Upload an image to show it full-screen before the lesson.
                </p>
              </div>
            </div>
          </div>
        </details>

        
        <details className="stage-toolbar-group stage-toolbar-card">
          <summary className="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p className="stage-toolbar-label">Visuals</p>
              <p className="stage-toolbar-meta">Toggle Anjali avatar and InfoKids logo</p>
            </div>
            <span className="stage-toolbar-badge">VIS</span>
          </summary>
          <div className="stage-toolbar-body">
            <div style={{"display": "flex", "flexDirection": "column", "gap": "8px", "padding": "4px 8px"}}>
              <label style={{"display": "flex", "alignItems": "center", "gap": "8px", "cursor": "pointer"}}>
                <input type="checkbox" id="avatarEnableCheck" defaultChecked style={{"width": "16px", "height": "16px"}} />
                <span style={{"fontSize": "0.75rem", "color": "#fff", "fontWeight": "600"}}>Show Anjali Avatar</span>
              </label>
              <label style={{"display": "flex", "alignItems": "center", "gap": "8px", "cursor": "pointer"}}>
                <input type="checkbox" id="logoEnableCheck" defaultChecked style={{"width": "16px", "height": "16px"}} />
                <span style={{"fontSize": "0.75rem", "color": "#fff", "fontWeight": "600"}}>Show InfoKids Logo</span>
              </label>
              <label style={{"display": "flex", "flexDirection": "column", "gap": "4px", "marginTop": "10px"}}>
                <span style={{"fontSize": "0.75rem", "color": "#fff", "fontWeight": "600"}}>Anjali Video Speed</span>
                <input type="range" id="avatarSpeedRange" min="0.5" max="4.0" step="0.1" defaultValue="2.5" style={{"width": "100%"}} />
                <span id="avatarSpeedLabel" style={{"fontSize": "0.75rem", "color": "#fff", "fontWeight": "600", "alignSelf": "flex-end"}}>2.5x</span>
              </label>
            </div>
              <div style={{"marginTop": "12px", "borderTop": "1px solid rgba(255,255,255,0.1)", "paddingTop": "8px"}}>
                <p style={{"fontSize": "0.75rem", "color": "#fff", "marginBottom": "8px"}}>Lip-Sync Calibration</p>
                <label style={{"display": "flex", "alignItems": "center", "gap": "8px", "cursor": "pointer", "marginBottom": "6px"}}>
                  <input type="checkbox" id="showJawDebugCheck" />
                  <span style={{"fontSize": "0.75rem", "fontWeight": "600", "color": "#5cb85c"}}>Show Target Guide</span>
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "4px", "marginBottom": "6px"}}>
                  <span style={{"fontSize": "0.75rem", "color": "#fff"}}>Mouth X (%)</span>
                  <input type="range" id="avatarJawXRange" min="0" max="100" step="0.5" defaultValue="28.5" />
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "4px", "marginBottom": "6px"}}>
                  <span style={{"fontSize": "0.75rem", "color": "#fff"}}>Mouth Y (%)</span>
                  <input type="range" id="avatarJawYRange" min="0" max="100" step="0.2" defaultValue="16.5" />
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "4px", "marginBottom": "6px"}}>
                  <span style={{"fontSize": "0.75rem", "color": "#fff"}}>Mouth Width (%)</span>
                  <input type="range" id="avatarJawWidthRange" min="0" max="15" step="0.2" defaultValue="4.5" />
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
                  <span style={{"fontSize": "0.75rem", "color": "#fff"}}>Mouth Height (%)</span>
                  <input type="range" id="avatarJawHeightRange" min="0" max="30" step="0.2" defaultValue="3.0" />
                </label>
              </div>
          </div>
        </details>
<details className="stage-toolbar-group stage-toolbar-card">
          <summary className="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p className="stage-toolbar-label">Media</p>
              <p className="stage-toolbar-meta">Manage uploaded images and videos from the presentation screen</p>
            </div>
            <span className="stage-toolbar-badge">MEDIA</span>
          </summary>
          <div className="stage-toolbar-body">
            <div className="stage-media-manager">
              <div className="stage-media-actions">
                <button id="stageAutoTeachBtn" className="flat-btn" type="button" title="Analyze image with local Vision AI"
                  style={{"marginRight": "8px"}}>✨ Auto-Teach</button>
                <button id="stageAutoBRollBtn" className="flat-btn" type="button"
                  title="Automatically fetch cinematic B-Roll based on the lesson script" style={{"marginRight": "8px"}}>🎬
                  Auto B-Roll</button>
                <button id="stageRemoveImageBtn" className="ghost-btn stage-icon-btn" type="button"
                  aria-label="Remove selected image" title="Remove selected image"><span
                    aria-hidden="true">IMGX</span></button>
                <button id="stageClearImagesBtn" className="ghost-btn stage-icon-btn" type="button"
                  aria-label="Remove all images" title="Remove all images"><span aria-hidden="true">ALL</span></button>
                <button id="stageRemoveVideoBtn" className="ghost-btn stage-icon-btn" type="button"
                  aria-label="Remove active video" title="Remove active video"><span
                    aria-hidden="true">VIDX</span></button>
              </div>
              <p id="stageMediaStatus" className="stage-toolbar-meta">Select an image or video on the screen, then manage it
                here.</p>
            </div>
          </div>
        </details>

        <details id="stageViewCard" className="stage-toolbar-group stage-toolbar-card">
          <summary className="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p className="stage-toolbar-label">Zoom And Font</p>
              <p className="stage-toolbar-meta">Use Zoom +, Zoom -, Font +, and Font - on the presentation screen</p>
            </div>
            <span className="stage-toolbar-badge">VIEW</span>
          </summary>
          <div className="stage-toolbar-body">
            <div className="stage-view-actions" aria-label="Stage zoom and font controls">
              <button id="zoomOutBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Zoom out"
                title="Zoom out"><span aria-hidden="true">Z-</span></button>
              <span id="zoomValue" className="control-indicator">100%</span>
              <button id="zoomInBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Zoom in"
                title="Zoom in"><span aria-hidden="true">Z+</span></button>
              <button id="fontDecreaseBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Decrease font"
                title="Decrease font"><span aria-hidden="true">F-</span></button>
              <span id="fontValue" className="control-indicator">100%</span>
              <button id="fontIncreaseBtn" className="ghost-btn stage-icon-btn" type="button" aria-label="Increase font"
                title="Increase font"><span aria-hidden="true">F+</span></button>
            </div>
          </div>
        </details>


        <details className="stage-toolbar-group stage-toolbar-export stage-toolbar-card">
          <summary className="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p className="stage-toolbar-label">Export And Format</p>
              <p className="stage-toolbar-meta">Export the video and keep the slide styled correctly</p>
            </div>
            <span className="stage-toolbar-badge">SAVE</span>
          </summary>
          <div className="stage-toolbar-body">
            <div className="stage-toolbar-buttons stage-toolbar-buttons-stack">
              <button id="downloadBtn" className="accent-btn stage-download-btn" type="button">&#8681; Export Video</button>
              <button id="stageCaptionExportBtn" className="primary-btn stage-download-btn" type="button"
                style={{"background": "#facc15", "color": "#000", "border": "none", "marginTop": "4px"}}>✨ Captions & Export Video</button>
              <button id="downloadPdfContextBtn" className="primary-btn stage-download-btn hidden" type="button">&#8681;
                Export PDF Context</button>

              {/* Stop Export — visible only while exporting */}
              {isExporting && (
                <button
                  type="button"
                  onClick={() => typeof window.ppStopExport === 'function' && window.ppStopExport()}
                  style={{
                    marginTop: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    letterSpacing: '0.03em',
                    boxShadow: '0 0 14px rgba(239,68,68,0.55)',
                  }}
                  aria-label="Stop export">
                  ⬛ Stop Export
                </button>
              )}
              <div className="stage-style-actions" aria-label="Quick stage text style">
                <button id="stageBoldBtn" className="ghost-btn toggle-btn stage-icon-btn" type="button" aria-pressed="false"
                  aria-label="Bold" title="Bold"><span aria-hidden="true">B</span></button>
                <button id="stageItalicBtn" className="ghost-btn toggle-btn stage-icon-btn" type="button"
                  aria-pressed="false" aria-label="Italic" title="Italic"><span aria-hidden="true">I</span></button>
                <button id="stageUnderlineBtn" className="ghost-btn toggle-btn stage-icon-btn" type="button"
                  aria-pressed="false" aria-label="Underline" title="Underline"><span
                    aria-hidden="true">U</span></button>
              </div>
            </div>
          </div>
        </details>
      </div>

      <div id="stageTimelineCard" className="stage-timeline-card hidden">
        <div className="stage-toolbar-head">
          <div>
            <p className="stage-toolbar-label">Timeline</p>
            <p id="stageTimelineMeta" className="stage-toolbar-meta">Timeline controls appear when a PDF presentation is on
              screen.</p>
          </div>
          <span id="stageModeBadge" className="stage-toolbar-badge">LESSON</span>
        </div>
        <div className="stage-timeline-row">
          <button id="seekBackwardBtn" className="ghost-btn" type="button" disabled>Back 5s</button>
          <span id="stageCurrentTime" className="control-indicator">00:00</span>
          <input id="stageTimelineInput" className="stage-timeline-input" type="range" min="0" max="0" defaultValue="0" step="100"
            disabled aria-label="PDF presentation timeline" />
          <span id="stageDuration" className="control-indicator">00:00</span>
          <button id="seekForwardBtn" className="ghost-btn" type="button" disabled>Forward 5s</button>
          <label className="stage-speed-field" htmlFor="playbackSpeedSelect">
            <span className="style-label">Speed</span>
            <select id="playbackSpeedSelect" className="theme-select text-style-select stage-speed-select"
              aria-label="Choose playback speed" defaultValue="1">
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="0.85">0.85x</option>
              <option value="0.9">0.9x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
              <option value="2.5">2.5x</option>
            </select>
          </label>
        </div>
      </div>

      <div className="stage-frame">
            <canvas ref={canvasRef} id="previewCanvas" width="1280" height="720" aria-label="Anjali Teacher preview" />
      </div>

      <p className="note" id="statusText">
        Enter English content and play the narration. Export Video saves the animated teaching scene as an `.mp4` file.
      </p>
      <p className="note note-soft">
        Long lessons are split into clean pages automatically. Longer input still takes longer to download because the
        export follows the full narration and typing time for every page.
      </p>
    </section>
  );
}

export default StagePanel;
