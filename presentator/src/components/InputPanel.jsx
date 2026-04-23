import React, { useState } from "react";
import { useStore } from "../store/useStore";

function InputPanel() {
  const actionLocks = useStore((state) => state.actionLocks);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  return (
    <section className="panel panel-input" id="inputPanel">
      <div className="panel-head">
        <div className="panel-copy">
          <p className="eyebrow">Maths Teacher</p>
          <h1>Presentator Workspace</h1>
          <p className="subcopy">
            A premium, dynamic environment. Type your lesson once. The maths output, narration, and presentation update
            automatically with a beautiful, organized workflow.
          </p>
        </div>

        <div className="theme-card hero-stage-card">
          <div className="hero-stage-topbar">
            <p className="hero-stage-note">Classroom board style</p>
            <div className="hero-stage-actions">
              <button id="resetInputsBtn" className="primary-btn reset-btn ghost-btn" type="button">Reset</button>
              <button id="showScreenBtn" className="primary-btn input-show-screen-btn hero-show-screen-btn"
                type="button">Show Screen</button>
              <label className="theme-toggle theme-toggle-standalone" htmlFor="themeToggle" title="Toggle day and dark theme">
                <input id="themeToggle" className="theme-toggle-input" type="checkbox" aria-label="Toggle dark mode" />
                <span className="theme-toggle-track">
                  <span className="theme-toggle-thumb"></span>
                </span>
              </label>
            </div>
          </div>
          <strong id="themeModeLabel" className="theme-value theme-value-hidden">Day Theme</strong>
          <select id="themeSelect" className="theme-select hidden" aria-label="Choose theme">
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
      </div>

      <section className="workflow-surface" aria-label="Lesson workflow">
        <div className="workflow-story">
          <p className="workflow-eyebrow">Workflow</p>
          <h2 className="workflow-title">Build the lesson once, then open the screen when everything feels ready.</h2>
          <p className="workflow-copy">
            Keep your current working logic safe. This layout simply organizes the flow into a clearer order:
            write the lesson, optionally pick a screen template, add support tools only when needed, then show
            the presentation.
          </p>
        </div>
        <div className="workflow-lane" role="list" aria-label="Workflow steps">
          <button className="workflow-step" type="button" data-workflow-target="lessonContentSection">
            <span className="workflow-step-index">01</span>
            <span className="workflow-step-copy">
              <strong>Lesson Input</strong>
              <span>Write, translate, and style the maths content.</span>
            </span>
          </button>
          <button className="workflow-step" type="button" data-workflow-target="templateWorkflowSection">
            <span className="workflow-step-index">02</span>
            <span className="workflow-step-copy">
              <strong>Template</strong>
              <span>Optional. Keep Classic or switch the stage look.</span>
            </span>
          </button>
          <button className="workflow-step" type="button" data-workflow-target="mediaSection">
            <span className="workflow-step-index">03</span>
            <span className="workflow-step-copy">
              <strong>Media And Voice</strong>
              <span>Add intro, images, and Anjali narration only if needed.</span>
            </span>
          </button>
          <button className="workflow-step workflow-step-show" type="button" data-workflow-target="showScreenBtn">
            <span className="workflow-step-index">04</span>
            <span className="workflow-step-copy">
              <strong>Show Screen</strong>
              <span>Open the presentation when the lesson is ready to present.</span>
            </span>
          </button>
        </div>
      </section>

      <details className="section-card template-section-card" id="templateWorkflowSection" open>
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">TPL</span>
            <span className="summary-copy">
              <span className="section-title">Presentation Template</span>
              <span className="section-meta">Optional. The Classic stage stays as the default until you choose another
                template.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="template-section-shell">
            <div className="template-section-copy">
              <p className="upload-copy">
                Pick a screen look before you open the presentation. If you do nothing, the current Classic blue
                teaching board remains active and all existing workflows continue exactly as they do now.
              </p>
              <p className="upload-copy" id="presentationTemplateStatus">Classic stage is active by default.</p>
            </div>
            <div className="template-gallery" role="radiogroup" aria-label="Presentation template choices">
              <label className="template-card" htmlFor="presentationTemplateClassic">
                <input id="presentationTemplateClassic" className="template-radio" type="radio" name="presentationTemplate"
                  value="classic" defaultChecked onChange={(e) => setActiveTemplate(e.target.value)} />
                <span className="template-card-preview template-card-preview-classic" aria-hidden="true">
                  <span className="template-preview-classic-rings"></span>
                  <span className="template-preview-classic-card"></span>
                </span>
                <span className="template-card-body">
                  <span className="template-card-title-row">
                    <strong>Classic Stage</strong>
                    <span className="template-chip">Default</span>
                  </span>
                  <span className="template-card-copy">Keep the current blue classroom board with the familiar layout and
                    working behavior.</span>
                </span>
              </label>

              <label className="template-card" htmlFor="presentationTemplateOutcomes">
                <input id="presentationTemplateOutcomes" className="template-radio" type="radio" name="presentationTemplate"
                  value="learning-outcomes" onChange={(e) => setActiveTemplate(e.target.value)} />
                <span className="template-card-preview template-card-preview-outcomes" aria-hidden="true">
                  <span className="template-preview-outcomes-header">LEARNING OUTCOMES</span>
                  <span className="template-preview-outcomes-logo">Info kids</span>
                </span>
                <span className="template-card-body">
                  <span className="template-card-title-row">
                    <strong>Learning Outcomes</strong>
                    <span className="template-chip template-chip-optional">Optional</span>
                  </span>
                  <span className="template-card-copy">Use a cleaner classroom poster look with a white title strip and soft
                    teaching board body.</span>
                </span>
              </label>
            </div>
            <div className="outcomes-title-row">
              <label className="field-label" htmlFor="outcomesTitleInput">Learning Outcomes Template Title</label>
              <p className="upload-copy">Type a custom title to show at the top of the Learning Outcomes screen. Leave blank
                to use the default <strong>LEARNING OUTCOMES</strong> heading.</p>
              <div className="toolbar toolbar-compact">
                <input id="outcomesTitleInput" className="text-field-input outcomes-title-input" type="text" maxlength="72"
                  placeholder="e.g. LEARNING OUTCOMES" disabled />
                <button id="saveOutcomesTitleBtn" className="primary-btn" type="button" disabled>Save Title</button>
              </div>
              <p className="upload-copy" id="outcomesTitleStatus">Switch to Learning Outcomes if you want to save a custom
                title for that template.</p>
            </div>

          </div>
        </div>
      </details>

      <details className="section-card" id="lessonContentSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">TXT</span>
            <span className="summary-copy">
              <span className="section-title">Maths Lesson Content</span>
              <span className="section-meta">Write the maths text that will appear on the teaching slide.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="tool-card maths-translator-card">
            <div className="tool-card-head">
              <span className="module-icon">TRN</span>
              <p className="tool-card-title">Maths Translator</p>
            </div>
            <p className="upload-copy">Paste normal text here. The app converts it into pure maths notation and sends the
              translated result to the lesson box automatically.</p>
            <label className="field-label" htmlFor="mathsSourceInput">Source Input</label>
            <textarea id="mathsSourceInput" className="lesson-input maths-source-input" placeholder="Example:
what is two plus three
find the product of six and four
ten divided by two
three is less than nine"></textarea>
            <div className="toolbar toolbar-compact">
              <button id="translateMathsBtn" className="primary-btn" type="button">Translate To Pure Maths</button>
              <button id="pureEnglishTranslateBtn" className="primary-btn" type="button" style={{"background": "#5c2d91"}}>Translate To Pure English</button>
              <button id="clearMathsSourceBtn" className="ghost-btn" type="button">Clear Source</button>
            </div>
            <label className="toggle-check" htmlFor="mathsAutoTranslateToggle">
              <input id="mathsAutoTranslateToggle" type="checkbox" defaultChecked />
              <span>Auto translate source into the lesson box</span>
            </label>
            <div id="mathsTranslateProgress" className="progress-indicator maths-translate-progress hidden" role="status"
              aria-live="polite">
              <div className="progress-track">
                <span id="mathsTranslateProgressBar" className="progress-fill maths-translate-progress-fill"></span>
              </div>
              <p id="mathsTranslateProgressLabel" className="upload-copy">Translating into pure maths...</p>
            </div>
            <label className="field-label" htmlFor="mathsTranslationPreview">Pure Maths Translation</label>
            <pre id="mathsTranslationPreview"
              className="maths-translation-preview">Pure maths translation will appear here.</pre>
            <p className="upload-copy" id="mathsTranslatorStatus">Maths translator is ready. Paste plain text and the lesson
              box will receive the translated maths version.</p>
          </div>
          <div className="tool-card">
            <div className="tool-card-head">
              <span className="module-icon">TAB</span>
              <p className="tool-card-title">Place Value Table Builder</p>
            </div>
            <p className="upload-copy">Enter a number, choose the table layout, and the lesson box will be filled with a
              ready place value chart. Supports up to 10 digits.</p>
            <div className="display-style-grid">
              <label className="style-field" htmlFor="placeValueNumberInput">
                <span className="style-label">Number</span>
                <input id="placeValueNumberInput" className="text-field-input" type="text" inputmode="numeric"
                  maxlength="14" placeholder="Enter a number" />
              </label>
              <label className="style-field" htmlFor="placeValueSystemSelect">
                <span className="style-label">Table Layout</span>
                <select id="placeValueSystemSelect" className="theme-select text-style-select"
                  aria-label="Choose place value table layout">
                  <option value="indian">Indian (lakhs, crores)</option>
                  <option value="international">International (thousands, millions)</option>
                </select>
              </label>
            </div>
            <div className="toolbar toolbar-compact">
              <button id="applyPlaceValueTableBtn" className="primary-btn" type="button">Create Table Layout</button>
              <button id="showPlaceValueTableBtn" className="accent-btn" type="button">Create And Show Screen</button>
            </div>
            <p className="upload-copy" id="placeValueToolStatus">Use this builder when you want to present place value
              charts quickly without typing the full layout by hand.</p>
          </div>
          <div className="input-module-head" style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
            <label className="field-label" htmlFor="lessonInput">Translated Maths Lesson</label>
            <button id="autoExplainBtn" className="accent-btn" type="button" style={{"padding": "2px 8px", "fontSize": "12px"}}>Auto
              Explain</button>
          </div>
          <textarea id="lessonInput" className="lesson-input" placeholder="Type or paste your lesson here"></textarea>
          <div className="display-style-card">
            <p className="field-label">Display Text Style</p>
            <p className="upload-copy">Choose how the lesson text should look on the blue screen before you open it.</p>
            <div className="display-style-grid">
              <label className="style-field" htmlFor="textColorSelect">
                <span className="style-label">Text Color</span>
                <select id="textColorSelect" className="theme-select text-style-select" aria-label="Choose text color">
                  <option value="#ffffff" selected>White</option>
                  <option value="#000000">Black</option>
                  <option value="#173e58">Deep Blue</option>
                  <option value="#10243a">Dark Navy</option>
                  <option value="#0d7ea9">Sky Blue</option>
                  <option value="#2563eb">Blue</option>
                  <option value="#1f5a24">Green</option>
                  <option value="#16a34a">Bright Green</option>
                  <option value="#dc2626">Red</option>
                  <option value="#facc15">Yellow</option>
                  <option value="#7a1f1f">Maroon</option>
                </select>
              </label>
              <div className="style-actions" aria-label="Text style options">
                <button id="boldToggleBtn" className="ghost-btn toggle-btn" type="button" aria-pressed="false">Bold</button>
                <button id="italicToggleBtn" className="ghost-btn toggle-btn" type="button"
                  aria-pressed="false">Italic</button>
                <button id="underlineToggleBtn" className="ghost-btn toggle-btn" type="button"
                  aria-pressed="false">Underline</button>
              </div>
            </div>
            <div className="style-actions case-actions" aria-label="Text case options">
              <button id="caseOriginalBtn" className="ghost-btn toggle-btn" type="button" aria-pressed="true">AA</button>
              <button id="caseLowerBtn" className="ghost-btn toggle-btn" type="button" aria-pressed="false">tt</button>
              <button id="caseTitleBtn" className="ghost-btn toggle-btn" type="button" aria-pressed="false">Tt</button>
              <button id="caseUpperBtn" className="ghost-btn toggle-btn" type="button" aria-pressed="false">TT</button>
            </div>
            <p className="upload-copy">Tip: if selecting text is difficult, start a line with `#` to show that line as a
              bold underlined heading.</p>
          </div>
          <div id="selectionStyleCard" className="display-style-card">
            <p className="field-label">Selected Text Style</p>
            <p className="upload-copy">Selected words: <strong id="selectedKeywordLabel">None</strong></p>
            <div className="display-style-grid">
              <label className="style-field" htmlFor="selectedTextColorSelect">
                <span className="style-label">Selected Text Color</span>
                <select id="selectedTextColorSelect" className="theme-select text-style-select"
                  aria-label="Choose selected text color">
                  <option value="#ffffff" selected>White</option>
                  <option value="#000000">Black</option>
                  <option value="#173e58">Deep Blue</option>
                  <option value="#10243a">Dark Navy</option>
                  <option value="#0d7ea9">Sky Blue</option>
                  <option value="#2563eb">Blue</option>
                  <option value="#1f5a24">Green</option>
                  <option value="#16a34a">Bright Green</option>
                  <option value="#dc2626">Red</option>
                  <option value="#facc15">Yellow</option>
                  <option value="#7a1f1f">Maroon</option>
                </select>
              </label>
              <div className="style-actions" aria-label="Selected text style options">
                <button id="selectedBoldToggleBtn" className="ghost-btn toggle-btn" type="button"
                  aria-pressed="false">Bold</button>
                <button id="selectedItalicToggleBtn" className="ghost-btn toggle-btn" type="button"
                  aria-pressed="false">Italic</button>
                <button id="selectedUnderlineToggleBtn" className="ghost-btn toggle-btn" type="button"
                  aria-pressed="false">Underline</button>
              </div>
            </div>
            <div className="toolbar toolbar-compact">
              <button id="applySelectedStyleBtn" className="primary-btn" type="button">Apply To Selected Text</button>
              <button id="clearSelectedStyleBtn" className="ghost-btn" type="button">Clear Selected Style</button>
            </div>
            <p className="upload-copy" id="selectionStyleStatus">Select a word or phrase in the lesson text to give it its
              own look on the slide.</p>
          </div>
        </div>
      </details>

      <details className="section-card" id="pdfSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">PDF</span>
            <span className="summary-copy">
              <span className="section-title">Upload PDF</span>
              <span className="section-meta">Extract text from a PDF, fit it to the slide automatically, and present
                it.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="pdf-upload-grid">
            <div className="upload-block pdf-upload-block">
              <label className="field-label" htmlFor="pdfInput">PDF File</label>
              <p className="upload-copy">Upload a PDF and the app will read the text from each page, place it in the lesson
                box, and keep the presentation layout responsive for longer documents.</p>
              <input id="pdfInput" className="image-input" type="file" accept="application/pdf,.pdf" />
              <div className="toolbar toolbar-compact">
                <button id="pdfShowBtn" className="primary-btn" type="button" disabled>Show Screen</button>
                <button id="pdfPresentBtn" className="accent-btn" type="button" disabled>Read And Present Context</button>
                <button id="clearPdfBtn" className="ghost-btn" type="button" disabled>Clear PDF</button>
              </div>
              <div id="pdfProgress" className="progress-indicator hidden" role="progressbar" aria-live="polite"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div className="progress-track">
                  <span id="pdfProgressBar" className="progress-fill"></span>
                </div>
                <p id="pdfProgressLabel" className="upload-copy">0% complete</p>
              </div>
              <p className="upload-copy" id="pdfStatus">No PDF selected.</p>
              <p className="upload-copy" id="pdfPageSelectionSummary">Select a PDF to choose which pages should appear on
                the screen.</p>
            </div>

            <div className="tool-card pdf-preview-card">
              <div className="tool-card-head">
                <span className="module-icon">TXT</span>
                <p className="tool-card-title">Extracted PDF Content</p>
              </div>
              <p className="upload-copy" id="pdfMeta">Upload a PDF to preview the extracted text before showing it on the
                slide.</p>
              <div id="pdfPreviewList" className="pdf-preview-list hidden" aria-live="polite"></div>
            </div>
          </div>

          <div className="tool-card pdf-pages-card">
            <div className="tool-card-head pdf-pages-head">
              <div className="pdf-pages-head-copy">
                <span className="module-icon">PGS</span>
                <p className="tool-card-title">PDF Page Picker</p>
              </div>
              <div className="pdf-page-bulk-actions" aria-label="PDF page bulk selection controls">
                <button id="pdfSelectAllBtn" className="ghost-btn pdf-page-bulk-btn" type="button" disabled
                  title="Select all PDF pages" aria-label="Select all PDF pages">&#10003; All</button>
                <button id="pdfClearSelectionBtn" className="ghost-btn pdf-page-bulk-btn" type="button" disabled
                  title="Deselect all PDF pages" aria-label="Deselect all PDF pages">&#10005; All</button>
              </div>
            </div>
            <p className="upload-copy">Rendered page thumbnails keep the PDF layout exactly as it appears in the file. Tick
              only the pages you want to present.</p>
            <div id="pdfPageList" className="pdf-page-list hidden" aria-live="polite"></div>
          </div>
        </div>
      </details>

      <details className="section-card" hidden>
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">GEN</span>
            <span className="summary-copy">
              <span className="section-title">Scene Generator</span>
              <span className="section-meta">Describe the scene, optionally add images or music, and let the app prepare the
                best matching look.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="scene-generator-grid">
            <div className="tool-card scene-generator-card">
              <div className="tool-card-head">
                <span className="module-icon">AI</span>
                <p className="tool-card-title">Prompt To Scene Setup</p>
              </div>
              <p className="upload-copy">Write the scene idea here. The app will choose a fitting background VFX style,
                music mood, and export setup for the learning slide.</p>
              <label className="style-field" htmlFor="scenePromptInput">
                <span className="style-label">Scene Prompt</span>
                <textarea id="scenePromptInput" className="lesson-input scene-prompt-input" placeholder="Example:
Ocean lesson with calm bubbles, bright school style, soft background music.
Space topic with stars, dreamy motion, and a magical learning feel."></textarea>
              </label>
              <div className="scene-options-grid">
                <label className="style-field" htmlFor="sceneVfxSelect">
                  <span className="style-label">Background VFX</span>
                  <select id="sceneVfxSelect" className="theme-select text-style-select"
                    aria-label="Choose scene background effect">
                    <option value="auto">Auto</option>
                    <option value="sparkles">Sparkles</option>
                    <option value="bubbles">Bubbles</option>
                    <option value="waves">Waves</option>
                    <option value="rays">Rays</option>
                    <option value="confetti">Confetti</option>
                    <option value="grid">Grid</option>
                  </select>
                </label>
                <label className="style-field" htmlFor="sceneMusicModeSelect">
                  <span className="style-label">Background Music</span>
                  <select id="sceneMusicModeSelect" className="theme-select text-style-select"
                    aria-label="Choose scene music mode">
                    <option value="auto">Auto Generate</option>
                    <option value="upload">Use Uploaded Music</option>
                    <option value="off">No Music</option>
                  </select>
                </label>
                <label className="style-field" htmlFor="exportQualitySelect">
                  <span className="style-label">Export Quality</span>
                  <select id="exportQualitySelect" className="theme-select text-style-select"
                    aria-label="Choose export quality">
                    <option value="hd">HD</option>
                    <option value="2k" selected>2K</option>
                    <option value="4k">4K</option>
                  </select>
                </label>
              </div>
              <div className="scene-upload-grid">
                <div className="upload-block">
                  <label className="field-label" htmlFor="sceneImageInput">Optional Scene Images</label>
                  <p className="upload-copy">Upload images here if you want them added to the slide gallery automatically
                    when you generate the scene.</p>
                  <input id="sceneImageInput" className="image-input" type="file" accept="image/*" multiple />
                  <div id="sceneImagePreviewList" className="image-preview-list hidden" aria-live="polite"></div>
                </div>
                <div className="upload-block">
                  <label className="field-label" htmlFor="sceneMusicInput">Optional Background Music</label>
                  <p className="upload-copy">Upload your own music, or leave this empty and the app can generate a matching
                    background loop from the prompt.</p>
                  <input id="sceneMusicInput" className="image-input" type="file" accept="audio/*" />
                  <audio id="sceneMusicPreview" className="audio-preview hidden" controls preload="metadata"></audio>
                  <p className="upload-copy" id="sceneMusicStatus">No background music selected.</p>
                </div>
              </div>
              <div className="toolbar toolbar-compact">
                <button id="generateSceneBtn" className="primary-btn" type="button">Generate Scene</button>
                <button id="generateSceneShowBtn" className="accent-btn" type="button">Generate And Show</button>
                <button id="clearSceneBtn" className="ghost-btn" type="button">Clear Scene Setup</button>
              </div>
              <div id="sceneGenerationProgress" className="progress-indicator hidden" role="progressbar" aria-live="polite"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div className="progress-track">
                  <span id="sceneGenerationProgressBar" className="progress-fill"></span>
                </div>
                <p id="sceneGenerationProgressLabel" className="upload-copy">0% complete</p>
              </div>
              <p className="upload-copy" id="sceneGeneratorStatus">Describe the scene and click Generate Scene. The preview
                on the right will update first.</p>
            </div>

            <div className="tool-card scene-preview-card">
              <div className="tool-card-head">
                <span className="module-icon">VFX</span>
                <p className="tool-card-title">Scene Preview</p>
              </div>
              <div id="scenePreviewStage" className="scene-preview-stage" data-vfx="sparkles">
                <div className="scene-preview-glow"></div>
                <p id="scenePreviewLabel" className="scene-preview-label">Bright classroom style with gentle sparkles.</p>
              </div>
              <div className="scene-preview-chip-row">
                <span id="sceneThemeChip" className="scene-preview-chip">Theme: Classroom</span>
                <span id="sceneVfxChip" className="scene-preview-chip">VFX: Sparkles</span>
                <span id="sceneMusicChip" className="scene-preview-chip">Music: Bright</span>
                <span id="sceneExportChip" className="scene-preview-chip">Export: HD</span>
              </div>
              <img id="scenePreviewImage" className="scene-preview-image hidden" alt="Scene preview image" />
              <p id="scenePreviewHint" className="upload-copy">This preview shows the style that will be applied to the blue
                screen before you open the slide.</p>
            </div>
          </div>
        </div>
      </details>

      <details className="section-card" id="serverControlsSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">SVC</span>
            <span className="summary-copy">
              <span className="section-title">Server Controls</span>
              <span className="section-meta">Start and check the local narration, Anjali clone, transcription, and export
                helpers.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="upload-block server-block">
            <div className="toolbar toolbar-compact">
              <button id="startServersBtn" className="primary-btn" type="button">Start Servers</button>
              <button id="copyStartAllBtn" className="primary-btn" type="button">Copy Start Command</button>
              <button id="checkServersBtn" className="ghost-btn" type="button">Check Servers</button>
            </div>
            <div className="server-status-grid">
              <p className="upload-copy" id="serverControlsStatus">Use Start Servers to launch the local helpers for
                narration, transcription, and video export.</p>
              <p className="upload-copy" id="narrationHealthStatus">Narration server: checking...</p>
              <p className="upload-copy" id="anjaliCloneHealthStatus">Anjali clone server: checking...</p>
              <p className="upload-copy" id="transcribeHealthStatus">Transcription server: checking...</p>
              <p className="upload-copy" id="videoExportHealthStatus">Video export server: checking...</p>
            </div>
          </div>
        </div>
      </details>

      <details className="section-card" id="speechToolsSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">MIC</span>
            <span className="summary-copy">
              <span className="section-title">Text And Speech Tools</span>
              <span className="section-meta">These tools help you fill the lesson text and check the voice before showing
                the screen.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="tool-grid">
            <div className="tool-card">
              <div className="tool-card-head">
                <span className="module-icon">MIC</span>
                <p className="tool-card-title">1. Fill the lesson text by speaking</p>
              </div>
              <p className="upload-copy">Use this when you want to speak instead of typing.</p>
              <div className="toolbar toolbar-compact">
                <button id="dictateBtn" className="primary-btn" type="button">Start Dictation</button>
                <button id="stopDictateBtn" className="ghost-btn" type="button" disabled>Stop Dictation</button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-card-head">
                <span className="module-icon">VOX</span>
                <p className="tool-card-title">2. Hear the lesson before showing the slide</p>
              </div>
              <p className="upload-copy">Click Read Text to hear the latest output in Anjali voice.</p>
              <div className="toolbar toolbar-compact">
                <button id="previewTextBtn" className="ghost-btn" type="button">Read Text</button>
                <button id="stopPreviewBtn" className="ghost-btn" type="button" disabled>Stop Reading</button>
              </div>
              <div id="previewVoiceChooser" className="voice-choice hidden" aria-live="polite">
                <p className="upload-copy">Anjali voice is used for reading.</p>
                <div className="toolbar toolbar-compact">
                  <button id="previewAnjaliBtn" className="ghost-btn" type="button">Anjali Voice</button>
                </div>
              </div>
              <label className="style-field" htmlFor="slideVoiceSelect">
                <span className="style-label">Saved Slide Voice</span>
                <select id="slideVoiceSelect" className="theme-select text-style-select"
                  aria-label="Choose saved slide voice">
                  <option value="anjali" selected>Anjali Narration</option>
                </select>
              </label>
              <p className="upload-copy">Play Slide and Export Video use Anjali automatically.</p>
            </div>
          </div>

          <div className="tool-card maths-helper-card">
            <div className="tool-card-head">
              <span className="module-icon">MTH</span>
              <p className="tool-card-title">Maths Teacher Starter</p>
            </div>
            <p className="upload-copy">Load ready-made maths lessons, practise clear pronunciation, and keep Anjali's warm
              sample voice inside the project.</p>
            <div className="maths-chip-row" aria-label="Maths topics">
              <span className="maths-chip">Numbers</span>
              <span className="maths-chip">Operations</span>
              <span className="maths-chip">Tables</span>
              <span className="maths-chip">Sums</span>
              <span className="maths-chip">Shapes</span>
              <span className="maths-chip">Pronunciation</span>
            </div>
            <div className="toolbar toolbar-compact maths-helper-actions">
              <button id="loadMathsNumbersBtn" className="primary-btn" type="button">Load Numbers Lesson</button>
              <button id="loadMathsOperationsBtn" className="ghost-btn" type="button">Load Operations Lesson</button>
              <button id="loadMathsTablesBtn" className="ghost-btn" type="button">Load Tables 2 To 10</button>
              <button id="loadMathsSumsBtn" className="ghost-btn" type="button">Load Mixed Sums</button>
              <button id="loadMathsPronunciationBtn" className="ghost-btn" type="button">Load Pronunciation
                Practice</button>
            </div>
            <p className="field-label">Quick Table Boxes</p>
            <p className="upload-copy">Tap a box to load a clean multiplication table directly into the maths lesson area.
            </p>
            <div className="maths-box-layout" aria-label="Quick multiplication tables">
              <button id="loadTable2Btn" className="maths-box-btn" type="button">
                <span className="maths-box-title">Table Of 2</span>
                <span className="maths-box-copy">2 x 1 to 2 x 10</span>
              </button>
              <button id="loadTable3Btn" className="maths-box-btn" type="button">
                <span className="maths-box-title">Table Of 3</span>
                <span className="maths-box-copy">3 x 1 to 3 x 10</span>
              </button>
              <button id="loadTable4Btn" className="maths-box-btn" type="button">
                <span className="maths-box-title">Table Of 4</span>
                <span className="maths-box-copy">4 x 1 to 4 x 10</span>
              </button>
              <button id="loadTable5Btn" className="maths-box-btn" type="button">
                <span className="maths-box-title">Table Of 5</span>
                <span className="maths-box-copy">5 x 1 to 5 x 10</span>
              </button>
              <button id="loadTable10Btn" className="maths-box-btn" type="button">
                <span className="maths-box-title">Table Of 10</span>
                <span className="maths-box-copy">10 x 1 to 10 x 10</span>
              </button>
              <button id="loadTableComboBtn" className="maths-box-btn maths-box-btn-accent" type="button">
                <span className="maths-box-title">Tables 2 To 10</span>
                <span className="maths-box-copy">Full classroom table practice</span>
              </button>
            </div>
            <label className="field-label" htmlFor="anjaliSampleAudio">Anjali voice sample</label>
            <p className="upload-copy">This bundled MP3 is available as a reference sample. Generated narration uses the
              Anjali voice flow.</p>
            <audio id="anjaliSampleAudio" className="audio-preview" controls preload="metadata"></audio>
            <div className="toolbar toolbar-compact">
              <button id="useAnjaliSampleBtn" className="ghost-btn" type="button">Try Sample As Narration</button>
            </div>
            <p className="upload-copy" id="mathsHelperStatus">Maths practice is ready. Load starter lessons, boxed tables,
              mixed sums, listen to the sample, or use the sample as short narration.</p>
          </div>

          <div className="tool-status-card">
            <div className="tool-card-head">
              <span className="module-icon">STAT</span>
              <p className="tool-card-title">Current Tool Status</p>
            </div>
            <p className="upload-copy" id="speechToolsStatus">Type normally, or use speech to text to fill the content box.
            </p>
          </div>
        </div>
      </details>

      <details className="section-card" id="audioToTextSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">AUD</span>
            <span className="summary-copy">
              <span className="section-title">Upload Audio To Text</span>
              <span className="section-meta">Choose an audio file, submit it, and watch the transcription progress.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="upload-block">
            <label className="field-label" htmlFor="transcribeAudioInput">Audio File</label>
            <p className="upload-copy">Upload an `mp3`, `wav`, or another audio file and the app will turn that speech into
              text in the content box.</p>
            <input id="transcribeAudioInput" className="image-input" type="file" accept="audio/*" />
            <div className="toolbar toolbar-compact">
              <button id="submitTranscribeBtn" className="primary-btn" type="button" disabled>Submit Audio</button>
            </div>
            <div id="transcribeProgress" className="progress-indicator hidden" role="progressbar" aria-live="polite"
              aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <div className="progress-track">
                <span id="transcribeProgressBar" className="progress-fill"></span>
              </div>
              <p id="transcribeProgressLabel" className="upload-copy">0% complete</p>
            </div>
            <p className="upload-copy" id="transcribeStatus">No audio uploaded for transcription.</p>
          </div>
        </div>
      </details>

      <details className="section-card" id="aiCaptionSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">CAP</span>
            <span className="summary-copy">
              <span className="section-title">AI Video Captioning (Local)</span>
              <span className="section-meta">Automatically generate and burn animated captions onto a video directly in your
                browser.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="upload-block">
            <label className="field-label" htmlFor="captionVideoInput">Source Video</label>
            <p className="upload-copy">Upload an `mp4` or `webm`. The AI will extract the audio and generate TikTok-style
              dynamic captions completely offline.</p>
            <input id="captionVideoInput" className="image-input" type="file" accept="video/*"  />

            <div className="toolbar toolbar-compact">
              <button id="captionActionBtn" className="primary-btn" type="button" disabled>Generate Captions (Upload Source First)</button>
              <button id="captionExportBtn" className="accent-btn hidden" type="button">Export Result</button>
              <button id="captionViralShortBtn" className="primary-btn hidden" type="button" style={{"background": "#f90"}}>✂️
                Export 15s Viral Short</button>
              <button id="captionResetBtn" className="ghost-btn hidden" type="button">Clear Video</button>
            </div>


            <div className="display-style-card"
              style={{"marginTop": "1rem", "padding": "12px", "borderRadius": "8px", "background": "rgba(0,0,0,0.1)"}}>
              <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginBottom": "8px"}}>
                <label className="field-label" style={{"margin": "0"}}>Advanced Caption Engine Theme</label>
              </div>

              <div
                style={{"marginBottom": "12px", "background": "rgba(255,255,255,0.05)", "padding": "8px", "borderRadius": "4px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
                  <input type="checkbox" id="captionTranslateCheck" style={{"width": "18px", "height": "18px"}} />
                  <label htmlFor="captionTranslateCheck"
                    style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer", "flexGrow": "1"}}>🌍 Auto-Translate Audio To
                    English</label>
                  <p className="upload-copy" style={{"margin": "0"}}>(Checks Before Generation)</p>
                </div>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
                  <input type="checkbox" id="captionEmojiCheck" style={{"width": "18px", "height": "18px"}} defaultChecked />
                  <label htmlFor="captionEmojiCheck"
                    style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer", "flexGrow": "1"}}>🪄 Inject Smart
                    Pop-Emojis</label>
                  <p className="upload-copy" style={{"margin": "0"}}>(Dynamic Reaction SVGs)</p>
                </div>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
                  <input type="checkbox" id="captionKaraokeCheck" style={{"width": "18px", "height": "18px"}} defaultChecked />
                  <label htmlFor="captionKaraokeCheck"
                    style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer", "flexGrow": "1"}}>🎤 TikTok Karaoke
                    Highlight</label>
                  <p className="upload-copy" style={{"margin": "0"}}>(Auto-Sync Word Colors)</p>
                </div>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
                  <input type="checkbox" id="captionBrollCheck" style={{"width": "18px", "height": "18px"}} />
                  <label htmlFor="captionBrollCheck"
                    style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer", "flexGrow": "1"}}>🎬 Auto B-Roll
                    Interstitials</label>
                  <p className="upload-copy" style={{"margin": "0"}}>(Flash Stock Photos on matched words)</p>
                </div>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
                  <input type="checkbox" id="captionSfxCheck" style={{"width": "18px", "height": "18px"}} />
                  <label htmlFor="captionSfxCheck" style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer", "flexGrow": "1"}}>🔊
                    Reactive Sound Effects</label>
                  <p className="upload-copy" style={{"margin": "0"}}>(Triggers Whoosh/Pop SFX randomly on focus)</p>
                </div>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
                  <input type="checkbox" id="captionProgressBarCheck" style={{"width": "18px", "height": "18px"}} defaultChecked />
                  <label htmlFor="captionProgressBarCheck"
                    style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer", "flexGrow": "1"}}>⏱️ Viewer Retention Progress
                    Bar</label>
                  <p className="upload-copy" style={{"margin": "0"}}>(Draws playhead filling screen bottom)</p>
                </div>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "marginTop": "4px"}}>
                  <input type="checkbox" id="captionBgMusicCheck" style={{"width": "18px", "height": "18px"}} defaultChecked />
                  <label htmlFor="bgMusicInput" style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer"}}>🎵 Smart Audio
                    Ducking Track:</label>
                  <input type="file" id="bgMusicInput" accept="audio/*" style={{"fontSize": "0.8rem", "color": "#ccc"}} />
                  <audio id="bgMusicAudio" loop crossorigin="anonymous"></audio>
                </div>
                <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "marginTop": "4px"}}>
                  <input type="checkbox" id="captionWatermarkCheck" style={{"width": "18px", "height": "18px"}} defaultChecked />
                  <label htmlFor="captionWatermarkInput" style={{"fontWeight": "bold", "color": "#fff", "cursor": "pointer"}}>🛡️ Brand
                    Watermark Overlay (PNG):</label>
                  <input type="file" id="captionWatermarkInput" accept="image/png, image/jpeg"
                    style={{"fontSize": "0.8rem", "color": "#ccc"}} />
                </div>
              </div>

              <div style={{"display": "flex", "gap": "10px", "marginBottom": "12px"}}>
                <div style={{"flex": "1"}}>
                  <span className="style-label" style={{"color": "#aaa"}}>Visual Master Theme</span>
                  <select id="captionStyleSelect" className="theme-select text-style-select" style={{"marginTop": "4px"}}>
                    <option value="tiktok" selected>Viral Pop (Bold & Shadow)</option>
                    <option value="classic">Classic TV (White & Black Box)</option>
                    <option value="cinematic">Cinematic Fade (Clean White)</option>
                    <option value="neon">Cyberpunk Neon (Intense Glow)</option>
                    <option value="glitch">Digital Glitch (RGB Tremor)</option>
                    <option value="typewriter">Typewriter (Sequential Reveal)</option>
                    <option value="vaporwave">Vaporwave (Trailing Pink/Blue)</option>
                    <option value="retro">Arcade Retro (Blocky & Snappy)</option>
                  </select>
                </div>
                <div style={{"flex": "1"}}>
                  <span className="style-label" style={{"color": "#aaa"}}>Background Video Filter</span>
                  <select id="captionFilterSelect" className="theme-select text-style-select" style={{"marginTop": "4px"}}>
                    <option value="none" selected>None (Raw Input)</option>
                    <option value="darken">Darken 50% (Makes Text Pop)</option>
                    <option value="blur">Heavy Depth Blur</option>
                    <option value="grayscale">Black & White Grayscale</option>
                    <option value="sepia">Vintage Sepia Tone</option>
                    <option value="invert">Inverted Nightmare Mode</option>
                  </select>
                </div>
                <div style={{"flex": "1"}}>
                  <span className="style-label" style={{"color": "#aaa"}}>Font Typography</span>
                  <select id="captionFontSelect" className="theme-select text-style-select" style={{"marginTop": "4px"}}>
                    <option value="Nunito, sans-serif" selected>Modern (Nunito)</option>
                    <option value="Impact, sans-serif">Bold Heavy (Impact)</option>
                    <option value="'Courier New', monospace">Mechanical (Courier)</option>
                    <option value="'Comic Sans MS', cursive">Playful (Comic)</option>
                    <option value="Georgia, serif">Elegant (Georgia)</option>
                  </select>
                </div>
              </div>

              <div className="display-style-grid"
                style={{"gap": "8px", "marginBottom": "12px", "display": "grid", "gridTemplateColumns": "1fr 1fr"}}>
                <label className="style-field">
                  <span className="style-label">Engine Text Size Scale</span>
                  <input type="range" id="captionSizeSlider" min="30" max="150" value="80" />
                </label>
                <label className="style-field">
                  <span className="style-label">Line Spacing Gap</span>
                  <input type="range" id="captionGapSlider" min="80" max="200" value="120" />
                </label>
                <label className="style-field">
                  <span className="style-label">Max Width Bound</span>
                  <input type="range" id="captionWidthSlider" min="30" max="95" value="85" />
                </label>
                <label className="style-field">
                  <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
                    <span className="style-label" style={{"color": "#ffcc00", "fontWeight": "bold"}}>Sync Offset</span>
                    <span id="captionSyncNum"
                      style={{"color": "#ffcc00", "fontSize": "0.8rem", "fontFamily": "monospace"}}>0.0s</span>
                  </div>
                  <input type="range" id="captionSyncSlider" min="-15000" max="15000" step="100" value="0"
                     />
                </label>
                <label className="style-field">
                  <span className="style-label">Stroke Thickness</span>
                  <input type="range" id="captionStrokeSlider" min="0" max="100" value="80" />
                </label>
              </div>

              <div style={{"display": "flex", "gap": "10px", "alignItems": "center"}}>
                <span className="style-label" style={{"color": "#aaa"}}>Extracted Text Color:</span>
                <input type="color" id="captionColorPicker" value="#fde047"
                  style={{"border": "none", "cursor": "pointer", "background": "none", "height": "30px", "width": "40px"}} />
                <p className="upload-copy" style={{"margin": "0", "marginLeft": "auto"}}><strong>Position:</strong> Click & drag
                  video to move captions!</p>
              </div>
            </div>

            <div id="captionProgress" className="progress-indicator hidden" role="status" style={{"marginTop": "1rem", "width": "100%"}}>
              <p id="captionStatusText" className="upload-copy" style={{"marginBottom": "8px"}}>Ready.</p>
              <div style={{"height": "8px", "width": "100%", "background": "var(--surface-soft)", "borderRadius": "4px", "overflow": "hidden"}}>
                  <div id="captionProgressBarValue" style={{"height": "100%", "width": "0%", "background": "var(--accent-a)", "transition": "width 0.3s ease"}}></div>
              </div>
            </div>

            <div id="captionVideoContainer" className="hidden"
              style={{"marginTop": "1.5rem", "borderRadius": "8px", "overflow": "hidden", "background": "#000", "position": "relative"}}>
              <canvas id="captionRenderCanvas" style={{"width": "100%", "height": "auto", "display": "block"}}></canvas>

              <div className="toolbar toolbar-compact" id="captionVideoControls"
                style={{"background": "rgba(0,0,0,0.6)", "padding": "8px", "display": "flex", "alignItems": "center", "justifyContent": "space-between"}}>
                <button id="captionPlayPauseBtn" className="ghost-btn" type="button"
                  style={{"color": "white", "borderColor": "rgba(255,255,255,0.2)"}}>⏸️ Pause</button>
                <input type="range" id="captionSeekSlider" style={{"flexGrow": "1", "margin": "0 1rem"}} min="0" max="100"
                  value="0" />
                <span id="captionTimeDisplay" style={{"color": "#ddd", "fontFamily": "monospace", "fontSize": "0.9rem"}}>00:00 /
                  00:00</span>
              </div>
              <video id="captionSourceVideo" hidden playsinline crossorigin="anonymous"></video>
            </div>
          </div>

          <div id="captionEditorPanel" className="tool-card hidden" style={{"marginTop": "1rem"}}>
            <div className="tool-card-head">
              <span className="module-icon">EDT</span>
              <p className="tool-card-title">Edit Auto-Captions</p>
            </div>
            <p className="upload-copy">If the AI missed a word, correct it below and it will instantly update on the video.
            </p>
            <div id="captionList" style={{"maxHeight": "250px", "overflowY": "auto", "paddingRight": "8px"}}></div>
          </div>
        </div>
      </details>

      <details className="section-card" id="mediaSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">IMG</span>
            <span className="summary-copy">
              <span className="section-title">Optional Media</span>
              <span className="section-meta">Upload images, turn on the default intro clip, and manage multiple stage videos
                for the blue screen.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="upload-block">
            <label className="field-label" htmlFor="introClipEnabled">Default Intro Clip</label>
            <p className="upload-copy">The provided intro clip can play first on the screen before the lesson starts. Leave
              it on by default, or turn it off when you want the lesson to begin immediately.</p>
            <label className="toggle-check" htmlFor="introClipEnabled">
              <input id="introClipEnabled" type="checkbox" />
              <span>Play the default intro clip before the lesson</span>
            </label>
            <p id="introClipStatus" className="upload-copy">The default intro clip is ready.</p>
          </div>

          <div className="upload-block">
            <label className="field-label">Pro Capabilities (Automated Cinematic Overlays)</label>
            <p className="upload-copy">Enable or disable the advanced dynamic rendering features applied to your exported
              videos.</p>
            <label className="toggle-check" htmlFor="proCaptionsEnabled">
              <input id="proCaptionsEnabled" type="checkbox" defaultChecked />
              <span>Enable TikTok-Style Animated Captions</span>
            </label>
            <label className="toggle-check" htmlFor="proAnimationsEnabled">
              <input id="proAnimationsEnabled" type="checkbox" defaultChecked />
              <span>Enable Auto-Math & Interactive Screen Scanning Animations</span>
            </label>
            <label className="toggle-check" htmlFor="proQuizEnabled">
              <input id="proQuizEnabled" type="checkbox" defaultChecked />
              <span>Enable Auto-Quiz Popups</span>
            </label>
            <label className="toggle-check" htmlFor="proDuckingEnabled">
              <input id="proDuckingEnabled" type="checkbox" defaultChecked />
              <span>Enable Audio Ducking (Lower music volume when Anjali speaks)</span>
            </label>
          </div>

          <div className="media-upload-grid">
            <div className="upload-block">
              <label className="field-label" htmlFor="imageInput">Upload Multiple Images</label>
              <p className="upload-copy">Upload up to 12 images. Each image card on this input screen includes `Remove BG`,
                `Restore`, and `Show Here` actions so you can prepare it before presenting.</p>
              <input id="imageInput" className="image-input" type="file" accept="image/*" multiple />
              <p id="imageCutoutStatus" className="upload-copy">Smart cutout is ready for new image uploads.</p>
              <div id="imagePreviewList" className="image-preview-list hidden" aria-live="polite"></div>
            </div>
            <div className="upload-block">
              <label className="field-label" htmlFor="videoInput">Upload Stage Videos</label>
              <p className="upload-copy">Upload multiple videos for the blue screen. Each video card on this input screen
                includes `Remove BG`, `Restore`, and `Show On Screen` actions. Video exports automatically upscale to at
                least 2K while a stage video is active.</p>
              <input id="videoInput" className="image-input" type="file" accept="video/*" multiple />
              <div className="toolbar toolbar-compact">
                <button id="clearVideoBtn" className="ghost-btn" type="button">Clear Videos</button>
              </div>
              <video id="videoPreview" className="audio-preview hidden" controls preload="metadata" muted
                playsinline></video>
              <div id="videoPreviewList" className="image-preview-list hidden" aria-live="polite"></div>
              <p id="videoStatus" className="upload-copy">No stage video selected.</p>
            </div>
          </div>

          <div className="upload-block cutout-controls-card">
            <label className="field-label" htmlFor="cutoutToleranceInput">Smart Cutout Match</label>
            <p className="upload-copy">Tune background removal for both images and videos so the edges sit better on the
              blue screen. Lower values protect subjects more. Higher values remove more background.</p>
            <div className="cutout-control-grid">
              <label className="cutout-control" htmlFor="cutoutToleranceInput">
                <span className="cutout-control-head">
                  <span>Tolerance</span>
                  <strong id="cutoutToleranceValue">66</strong>
                </span>
                <input id="cutoutToleranceInput" type="range" min="20" max="110" step="1" value="66" />
                <small>How aggressively the remover follows the background color.</small>
              </label>
              <label className="cutout-control" htmlFor="cutoutFeatherInput">
                <span className="cutout-control-head">
                  <span>Feather</span>
                  <strong id="cutoutFeatherValue">22</strong>
                </span>
                <input id="cutoutFeatherInput" type="range" min="4" max="48" step="1" value="22" />
                <small>Softens the edge after removing the background.</small>
              </label>
              <label className="cutout-control" htmlFor="cutoutSpillInput">
                <span className="cutout-control-head">
                  <span>Spill Cleanup</span>
                  <strong id="cutoutSpillValue">35</strong>
                </span>
                <input id="cutoutSpillInput" type="range" min="0" max="100" step="1" value="35" />
                <small>Pulls green spill away from the subject edge.</small>
              </label>
              <label className="cutout-control" htmlFor="cutoutScreenBlendInput">
                <span className="cutout-control-head">
                  <span>Screen Match</span>
                  <strong id="cutoutScreenBlendValue">28</strong>
                </span>
                <input id="cutoutScreenBlendInput" type="range" min="0" max="100" step="1" value="28" />
                <small>Adds a soft blue-screen blend so the media matches the stage better.</small>
              </label>
            </div>
            <p id="cutoutControlsStatus" className="upload-copy">These controls apply to both image and video background
              removal.</p>
          </div>
        </div>
      </details>

      <details className="section-card" id="narrationSection">
        <summary className="section-summary">
          <span className="summary-head">
            <span className="section-icon">REC</span>
            <span className="summary-copy">
              <span className="section-title">Narration Audio</span>
              <span className="section-meta">Upload, record, or generate Anjali narration.</span>
            </span>
          </span>
        </summary>
        <div className="section-content">
          <div className="upload-block">
            <label className="field-label" htmlFor="audioInput">Optional narration audio</label>
            <p className="upload-copy">You can skip this. Upload audio or record narration here if you want the downloaded
              video to include sound.</p>
            <input id="audioInput" className="image-input" type="file" accept="audio/*" />
            <div className="toolbar toolbar-compact">
              <button id="recordBtn" className="primary-btn" type="button">Record Narration</button>
              <button id="stopRecordBtn" className="ghost-btn" type="button" disabled>Stop Recording</button>
              <button id="clearAudioBtn" className="ghost-btn" type="button">Clear Audio</button>
            </div>
            <audio id="audioPreview" className="audio-preview hidden" controls preload="metadata"></audio>
            <p className="upload-copy" id="audioStatus">No narration audio selected.</p>
            <div className="toolbar toolbar-compact">
              <button id="loadAnjaliNarrationBtn" className="primary-btn" type="button">Generate Anjali Narration</button>
              <button id="downloadAnjaliBtn" className="ghost-btn" type="button">Download Anjali Narration</button>
            </div>
            <div id="narrationLiveIndicator" className="progress-indicator narration-live-indicator hidden" role="status"
              aria-live="polite">
              <div className="progress-track">
                <span id="narrationLiveProgressFill" className="progress-fill narration-live-progress-fill"></span>
              </div>
              <p className="upload-copy narration-live-progress-label" id="narrationLiveProgressLabel">Anjali narration is
                preparing...</p>
            </div>
            <p className="upload-copy" id="narrationGenStatus">Enter text, then generate Anjali narration directly into the
              app or download the Anjali narration file.</p>
          </div>
        </div>
      </details>

    </section>
  );
}

export default InputPanel;
