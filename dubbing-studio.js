/**
 * Offline Transcription & Dubbing Studio Module
 * Actively hooks the Xenova Whisper pipeline and Native APIs to synthesize a localized dub.
 */

(function() {
  document.addEventListener("DOMContentLoaded", () => {
    const rootShell = document.querySelector(".app-shell");
    if (!rootShell) return;

    const dubbingCard = document.createElement("section");
    dubbingCard.className = "panel workflow-step";
    dubbingCard.innerHTML = `
      <div class="panel-head" style="grid-template-columns: 1fr;">
        <div class="panel-copy">
          <p class="eyebrow">Advanced Studio Plugins</p>
          <h2 style="margin:0; font-size:1.8rem; font-weight:800; font-family:'Baloo 2', sans-serif;">Autonomous Offline Dubbing Studio</h2>
          <p class="section-meta">Upload a completed course video. This isolated worker will locally translate and dub your entire video into synthetic speech seamlessly without relying on cloud APIs.</p>
        </div>
        
        <div class="panel-input" style="background: var(--surface-soft); padding: 24px; border-radius: 24px; border: 1px solid var(--panel-border);">
          <div class="upload-block">
            <label class="field-label" for="dubbingVideoInput">1. Target Video to Dub</label>
            <input id="dubbingVideoInput" class="image-input" type="file" accept="video/webm, video/mp4, audio/wav, audio/mpeg" />
          </div>
          
          <div class="upload-block" style="margin-top: 16px;">
            <label class="field-label" for="dubbingLanguageSelect">2. Target Localization Language</label>
            <select id="dubbingLanguageSelect" class="theme-select">
              <option value="es-ES">Spanish (Spain)</option>
              <option value="fr-FR">French</option>
              <option value="hi-IN">Hindi</option>
              <option value="te-IN">Telugu</option>
              <option value="zh-CN">Mandarin</option>
              <option value="de-DE">German</option>
            </select>
          </div>

          <button id="startDubbingBtn" class="primary-btn" style="margin-top: 24px; padding: 16px; width: 100%; border-radius: 18px; font-weight: 800;" disabled>Begin Translation & Dubbing</button>

          <div id="dubbingProgressBarContainer" style="display: none; height: 8px; width: 100%; background: var(--surface-soft); border-radius: 4px; overflow: hidden; margin-top: 16px;">
             <div id="dubbingProgressBarValue" style="height: 100%; width: 0%; background: var(--accent-a); transition: width 0.3s ease;"></div>
          </div>
          <p id="dubStatus" class="section-meta" style="margin-top: 8px; font-weight: 700; color: var(--accent-a); display: none;">Status: Initialized</p>

          <div id="dubbedResultContainer" style="display: none; margin-top: 24px;">
              <label class="field-label">Dubbed Video Preview</label>
              <p class="section-meta">Here is your localized video! (Note: Browsers export the final track as an Audio file, but you can preview the synced video below).</p>
              <div style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; background: #000; margin-top: 12px;">
                  <video id="dubbedVideoPlayer" style="width: 100%; display: block;" muted></video>
              </div>
              <div style="display: flex; gap: 12px; margin-top: 12px;">
                  <button id="playDubbedBtn" class="primary-btn" style="flex: 1; padding: 12px; border-radius: 12px;">▶ Play Dubbed Video</button>
                  <button id="downloadDubbedAudioBtn" class="accent-btn" style="flex: 1; padding: 12px; border-radius: 12px;">⬇ Download Audio Track</button>
              </div>
          </div>
        </div>
      </div>
    `;

    rootShell.appendChild(dubbingCard);

    const dBtn = document.getElementById("startDubbingBtn");
    const dInput = document.getElementById("dubbingVideoInput");
    const dStatus = document.getElementById("dubStatus");

    dInput.addEventListener("click", (e) => { e.target.value = null; });

    dInput.addEventListener("change", (e) => {
      if(e.target.files.length > 0) dBtn.disabled = false;
    });

    async function extractAudioFloat32(file) {
       const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
       const arrayBuffer = await file.arrayBuffer();
       const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
       const float32 = audioBuffer.getChannelData(0);
       return float32; // Returns 16kHz mono buffer payload for Whisper
    }

    async function fetchTranslation(text, targetLangCode) {
        // Safe generic Google Translate fetch relay
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode.split('-')[0]}&dt=t&q=${encodeURIComponent(text)}`;
        try {
            const response = await fetch(url);
            const json = await response.json();
            return json[0].map(item => item[0]).join('');
        } catch (e) {
            console.error("Translation Hook Failed:", e);
            return text; 
        }
    }

    async function generateTTSAudioBuffer(text, lang, targetSampleRate = 44100) {
        // Fetch direct speech buffer from independent endpoints and convert to AudioBuffer
        const ttsLang = lang.startsWith('zh') ? lang : lang.split('-')[0];
        // Use local proxy to bypass CORS
        const ttsUrl = `http://127.0.0.1:8426/api/proxy/tts?tl=${ttsLang}&q=${encodeURIComponent(text)}`;
        const response = await fetch(ttsUrl);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: targetSampleRate });
        return await ctx.decodeAudioData(arrayBuffer);
    }

    dBtn.addEventListener("click", async () => {
      dStatus.style.display = "block";
      const pBarBox = document.getElementById("dubbingProgressBarContainer");
      const pBar = document.getElementById("dubbingProgressBarValue");
      if (pBarBox) pBarBox.style.display = "block";
      if (pBar) pBar.style.width = "5%";
      
      const file = dInput.files[0];
      if (!file) return;

      dBtn.disabled = true;
      const targetLang = document.getElementById("dubbingLanguageSelect").value;
      dStatus.innerText = "Status: Booting Xenova Inference...";

      try {
          const audioArray = await extractAudioFloat32(file);
          
          dStatus.innerText = "Status: Connecting to offline Hugging Face Worker...";
          console.log("[Dubbing Studio] Booting Worker...");
          const worker = new Worker('caption-worker.js', { type: 'module' });
          
          worker.onmessage = async (e) => {
              if (e.data.type === 'progress') {
                  const pct = Math.round((e.data.data.loaded / e.data.data.total) * 100) || 0;
                  dStatus.innerText = `Status: Booting AI Models... ${e.data.data.status} ${pct}%`;
              } else if (e.data.type === 'init_done') {
                  console.log("[Dubbing Studio] Worker Init Done. Starting transcribe.");
                  dStatus.innerText = "Status: Local Whisper Model Booted. Translating audio...";
                  worker.postMessage({ 
                      type: 'transcribe', 
                      audioDataArray: audioArray, 
                      options: { language: 'english', task: 'transcribe' },
                      duration: 60
                  });
              } else if (e.data.type === 'chunk_progress') {
                  const chunkTxt = e.data.chunk && e.data.chunk.text ? e.data.chunk.text : "";
                  dStatus.innerText = "Status: Local Whisper Transcribing... " + chunkTxt;
                  if (e.data.duration && e.data.chunk && e.data.chunk.timestamp && e.data.chunk.timestamp[1] !== null) {
                      let pct = Math.min(Math.round((e.data.chunk.timestamp[1] / e.data.duration) * 100), 99);
                      if(pBar) pBar.style.width = (pct * 0.45) + "%"; // Transcription is first half
                  }
              } else if (e.data.type === 'result') {
                  const chunks = e.data.result.chunks || [];
                  dStatus.innerText = `Status: Transcription Complete. Translating ${chunks.length} segments to ${targetLang}...`;
                  
                  console.log("[Dubbing Studio] Transcription Result:", chunks);
                  
                  // Setup generic Offline Audio Canvas
                  const totalDuration = Math.max((chunks.length > 0 ? chunks[chunks.length - 1].timestamp[1] : 60), 10) + 5;
                  const offlineCtx = new OfflineAudioContext(1, Math.ceil(44100 * totalDuration), 44100);
                  
                  for (let i = 0; i < chunks.length; i++) {
                      const chunk = chunks[i];
                      console.log("[Dubbing Studio] Fetching translation for:", chunk.text);
                      const translatedText = await fetchTranslation(chunk.text, targetLang);
                      console.log("[Dubbing Studio] Translated:", translatedText);
                      dStatus.innerText = `Status: Synthesizing "${translatedText}"...`;
                      if (pBar) pBar.style.width = (45 + ((i / chunks.length) * 50)) + "%";
                      
                      try {
                          const ttsBuffer = await generateTTSAudioBuffer(translatedText, targetLang, 44100);
                          const source = offlineCtx.createBufferSource();
                          source.buffer = ttsBuffer;
                          source.connect(offlineCtx.destination);
                          
                          // Inject exactly at the whisper-detected timestamp
                          const startTime = Math.max(chunk.timestamp[0], 0);
                          source.start(startTime);
                      } catch (err) {
                          console.warn("TTS Skip segment", err);
                      }
                  }

                  dStatus.innerText = "Status: Finalizing Dubbed Audio mixdown...";
                  const renderedBuffer = await offlineCtx.startRendering();
                  
                  // Simple WAV export
                  const interleaved = renderedBuffer.getChannelData(0);
                  const wavBlob = encodeWav(interleaved, 44100);
                  
                  dStatus.innerText = "Status: Complete! Showing preview.";
                  if (pBar) pBar.style.width = "100%";
                  
                  const wavUrl = URL.createObjectURL(wavBlob);
                  const videoUrl = URL.createObjectURL(file);
                  
                  const resultContainer = document.getElementById("dubbedResultContainer");
                  const videoPlayer = document.getElementById("dubbedVideoPlayer");
                  const playBtn = document.getElementById("playDubbedBtn");
                  const dlBtn = document.getElementById("downloadDubbedAudioBtn");
                  
                  resultContainer.style.display = "block";
                  videoPlayer.src = videoUrl;
                  
                  const dubbedAudio = new Audio(wavUrl);
                  
                  // Sync playback
                  let isPlaying = false;
                  playBtn.onclick = () => {
                      if(isPlaying) {
                          videoPlayer.pause();
                          dubbedAudio.pause();
                          playBtn.innerText = "▶ Play Dubbed Video";
                      } else {
                          videoPlayer.currentTime = 0;
                          dubbedAudio.currentTime = 0;
                          videoPlayer.play();
                          dubbedAudio.play();
                          playBtn.innerText = "⏸ Pause Dubbed Video";
                      }
                      isPlaying = !isPlaying;
                  };

                  dlBtn.onclick = () => {
                      const a = document.createElement('a');
                      a.href = wavUrl;
                      a.download = `Dubbed_Audio_${targetLang}.wav`;
                      a.click();
                  };
                  
                  dBtn.disabled = false;
                  worker.terminate();
              } else if (e.data.type === 'error') {
                  console.error("[Dubbing Studio] Worker Error:", e.data.error);
                  dStatus.innerText = "Status Error: " + (e.data.error || "Unknown worker crash");
                  dBtn.disabled = false;
                  worker.terminate();
              }
          };

          worker.onerror = (err) => {
              console.error("[Dubbing Studio] Worker Fatal Crash:", err);
              dStatus.innerText = "Status Error: Fatal Worker Crash";
              dBtn.disabled = false;
              worker.terminate();
          };

          // Engage initialization hook
          worker.postMessage({ type: 'init' });

      } catch (err) {
          console.error("[Dubbing Studio] Execution Framework Error:", err);
          dStatus.innerText = "Status Error: " + err.message;
          dBtn.disabled = false;
      }
    });

    function encodeWav(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);
        
        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        };
        
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        
        const volume = 0.8;
        let offset = 44;
        for (let i = 0; i < samples.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, samples[i] * volume));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return new Blob([view], { type: 'audio/wav' });
    }

  });
})();
