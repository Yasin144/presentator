let captionWorker = null;
let transcriber = null; // Keeping as a placeholder for any lingering references

function bootCaptionStudio() {
  if (window.__presentatorCaptionStudioBooted) return;
  window.__presentatorCaptionStudioBooted = true;
  try {
    const videoInput = document.getElementById('captionVideoInput');
    const videoContainer = document.getElementById('captionVideoContainer');
    const sourceVideo = document.getElementById('captionSourceVideo');
    const renderCanvas = document.getElementById('captionRenderCanvas');
    const statusText = document.getElementById('captionStatusText');
    const actionBtn = document.getElementById('captionActionBtn');
    const exportBtn = document.getElementById('captionExportBtn');
    const progressBlock = document.getElementById('captionProgress');
    
    // Controls
    const playPauseBtn = document.getElementById('captionPlayPauseBtn');
    const seekSlider = document.getElementById('captionSeekSlider');
    const timeDisplay = document.getElementById('captionTimeDisplay');
    const videoControls = document.getElementById('captionVideoControls');
    
    // Editor UI
    const editorPanel = document.getElementById('captionEditorPanel');
    const captionList = document.getElementById('captionList');
    const resetBtn = document.getElementById('captionResetBtn');
    
    // Style Selector & Layout & Advanced Control
    const styleSelect = document.getElementById('captionStyleSelect');
    const sizeSlider = document.getElementById('captionSizeSlider');
    const gapSlider = document.getElementById('captionGapSlider');
    const widthSlider = document.getElementById('captionWidthSlider');
    const translateCheck = document.getElementById('captionTranslateCheck');
    const fontSelect = document.getElementById('captionFontSelect');
    const strokeSlider = document.getElementById('captionStrokeSlider');
    const colorPicker = document.getElementById('captionColorPicker');
    const syncSlider = document.getElementById('captionSyncSlider');
    
    // Elite Powers DOM
    const emojiCheck = document.getElementById('captionEmojiCheck');
    const karaokeCheck = document.getElementById('captionKaraokeCheck');
    const filterSelect = document.getElementById('captionFilterSelect');

    const brollCheck = document.getElementById('captionBrollCheck');
    const sfxCheck = document.getElementById('captionSfxCheck');
    const bgMusicInput = document.getElementById('bgMusicInput');
    const bgMusicAudio = document.getElementById('bgMusicAudio');
    const viralShortBtn = document.getElementById('captionViralShortBtn');

    const progressCheck = document.getElementById('captionProgressBarCheck');
    const watermarkInput = document.getElementById('captionWatermarkInput');
    const watermarkCheck = document.getElementById('captionWatermarkCheck');
    const bgMusicCheck = document.getElementById('captionBgMusicCheck');
    let sharedWatermarkImage = null;

    if (watermarkInput) {
        watermarkInput.addEventListener('change', (e) => {
            if(e.target.files[0]) {
                sharedWatermarkImage = new Image();
                sharedWatermarkImage.src = URL.createObjectURL(e.target.files[0]);
            }
        });
    }

    if (bgMusicInput) {
        bgMusicInput.addEventListener('change', (e) => {
            if(e.target.files[0]) {
                bgMusicAudio.src = URL.createObjectURL(e.target.files[0]);
                bgMusicAudio.volume = 0.5;
                bgMusicAudio.play().catch(e => console.log("Audio play deferred", e));
            }
        });
    }

    const sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
    const sfxDest = sfxCtx.createMediaStreamDestination();
    let lastSfxWordIndex = -1;

    function playSfx(type) {
        if (!sfxCheck || !sfxCheck.checked) return;
        const osc = sfxCtx.createOscillator();
        const gain = sfxCtx.createGain();
        osc.connect(gain);
        gain.connect(sfxCtx.destination);
        gain.connect(sfxDest);
        if (type === 'pop') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(800, sfxCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, sfxCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.5, sfxCtx.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.01, sfxCtx.currentTime + 0.1);
            osc.start(); osc.stop(sfxCtx.currentTime + 0.1);
        } else if (type === 'whoosh') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(100, sfxCtx.currentTime);
            gain.gain.setValueAtTime(0.3, sfxCtx.currentTime); 
            gain.gain.linearRampToValueAtTime(0.01, sfxCtx.currentTime + 0.4);
            osc.start(); osc.stop(sfxCtx.currentTime + 0.4);
        }
    }

    const brollUrls = {
        'space': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&q=80',
        'money': 'https://images.unsplash.com/photo-1580519542036-ed474161b51a?w=1280&q=80',
        'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80',
        'tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&q=80',
        'car': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1280&q=80',
        'animal': 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1280&q=80',
        'city': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1280&q=80',
        'water': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1280&q=80',
        'school': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1280&q=80'
    };
    const loadedBroll = {};
    for (const [k, url] of Object.entries(brollUrls)) {
        const img = new Image(); img.crossOrigin = "anonymous"; img.src = url; loadedBroll[k] = img;
    }
    const brollKeywords = {
        'space': 'space', 'moon': 'space', 'stars': 'space', 'galaxy': 'space', 'earth': 'space',
        'money': 'money', 'cash': 'money', 'dollar': 'money', 'buy': 'money', 'rich': 'money', 'wealth': 'money',
        'nature': 'nature', 'tree': 'nature', 'forest': 'nature', 'sun': 'nature', 'world': 'nature', 'flower': 'nature', 'mountain': 'nature', 'rain': 'water', 'ocean': 'water', 'sea': 'water', 'river': 'water',
        'tech': 'tech', 'computer': 'tech', 'code': 'tech', 'app': 'tech', 'robot': 'tech', 'ai': 'tech', 'phone': 'tech',
        'car': 'car', 'drive': 'car', 'fast': 'car', 'ride': 'car', 'speed': 'car', 'vehicle': 'car',
        'animal': 'animal', 'dog': 'animal', 'cat': 'animal', 'cow': 'animal', 'bird': 'animal', 'fish': 'animal', 'lion': 'animal', 'tiger': 'animal',
        'city': 'city', 'town': 'city', 'building': 'city', 'street': 'city', 'urban': 'city',
        'school': 'school', 'learn': 'school', 'study': 'school', 'student': 'school', 'book': 'school', 'read': 'school', 'write': 'school'
    };
    let lastBrollText = ""; let lastBrollResult = null;
    function getBrollForText(text) {
        if (!brollCheck || !brollCheck.checked || !text) return null;
        if (lastBrollText === text) return lastBrollResult;
        lastBrollText = text; lastBrollResult = null;
        const cleanWords = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
        for (let w of cleanWords) { if (brollKeywords[w]) { lastBrollResult = loadedBroll[brollKeywords[w]]; break; } }
        return lastBrollResult;
    }

    const emojiDict = {
        // Finance / Tech / Science
        'money': '💰', 'dollar': '💵', 'cash': '💲', 'buy': '🛍️', 'rich': '🤑', 'sell': '📈', 'business': '🏢',
        'rocket': '🚀', 'space': '🌌', 'sky': '☁️', 'moon': '🌕', 'star': '⭐', 'magic': '✨', 'sparkle': '✨', 'planet': '🪐',
        'computer': '💻', 'tech': '🤖', 'robot': '🤖', 'app': '📱', 'phone': '📱', 'internet': '🌐', 'code': '💻', 'ai': '🧠',

        // Emotions / Reactions
        'happy': '😊', 'smile': '😃', 'love': '❤️', 'heart': '💖', 'good': '👍', 'like': '👍', 'awesome': '😎', 'cool': '😎',
        'sad': '😢', 'cry': '😭', 'tear': '💧', 'bad': '👎', 'angry': '😠', 'mad': '😡', 'scared': '😱', 'shock': '😲',
        'laugh': '😂', 'funny': '🤣', 'lol': '😆', 'joke': '🤡', 'silly': '🤪', 'fun': '🥳',
        'fire': '🔥', 'hot': '🥵', 'burn': '🔥', 'lit': '🔥', 'boom': '💥', 'explosion': '💣', 'crash': '💥',

        // Time / Thinking
        'time': '⏳', 'clock': '🕰️', 'wait': '⌛', 'fast': '⚡', 'slow': '🐢', 'today': '📅', 'tomorrow': '📆', 'now': '⏱️',
        'idea': '💡', 'brain': '🧠', 'mind': '🧠', 'think': '🤔', 'question': '❓', 'why': '🤷', 'how': '🤷', 'know': '🧠', 'smart': '🤓',
        'yes': '✅', 'no': '❌', 'stop': '🛑', 'go': '🚦', 'danger': '⚠️', 'warning': '⚠️',

        // Nursery Rhymes / Stories / Animals
        'dog': '🐶', 'cat': '🐱', 'cow': '🐮', 'sheep': '🐑', 'pig': '🐷', 'horse': '🐴', 'bird': '🐦', 'fish': '🐟', 'animal': '🐾', 'mouse': '🐭', 'lion': '🦁', 'tiger': '🐯', 'bear': '🐻', 'monkey': '🐵', 'duck': '🦆', 'frog': '🐸', 'bug': '🐛', 'spider': '🕷️',
        'baby': '👶', 'boy': '👦', 'girl': '👧', 'man': '👨', 'woman': '👩', 'king': '👑', 'queen': '👑', 'princess': '👸', 'knight': '🤺', 'dragon': '🐉', 'monster': '👹', 'ghost': '👻',
        'house': '🏠', 'home': '🏡', 'castle': '🏰', 'village': '🏘️', 'bed': '🛌', 'sleep': '😴', 'dream': '💭',
        
        // Nature / Elements
        'sun': '☀️', 'day': '🌞', 'light': '☀️', 'morning': '🌅', 'night': '🌙', 'evening': '🌇',
        'tree': '🌳', 'forest': '🌲', 'flower': '🌸', 'rose': '🌹', 'leaf': '🍃', 'plant': '🌿', 'nature': '🏞️',
        'water': '💧', 'rain': '🌧️', 'snow': '❄️', 'cold': '🥶', 'ocean': '🌊', 'sea': '🌊', 'wind': '💨', 'storm': '⛈️',

        // General Speaking / Vlog / Education
        'video': '📹', 'channel': '📺', 'subscribe': '🔔', 'welcome': '👋', 'hello': '👋', 'hi': '👋', 'bye': '👋', 'friends': '👥', 'people': '👥',
        'learn': '📚', 'study': '📖', 'book': '📕', 'school': '🏫', 'teacher': '👩‍🏫', 'student': '🎒', 'math': '➕', 'science': '🔬', 'history': '📜', 'art': '🎨',
        'music': '🎵', 'song': '🎵', 'dance': '💃', 'play': '▶️', 'game': '🎮', 'sport': '⚽', 'ball': '🏀', 'run': '🏃', 'walk': '🚶',

        // Objects / Food
        'world': '🌍', 'earth': '🌍', 'global': '🌐', 'map': '🗺️', 'car': '🚗', 'bus': '🚌', 'train': '🚂', 'boat': '⛵', 'plane': '✈️',
        'food': '🍔', 'eat': '🍽️', 'hungry': '🤤', 'apple': '🍎', 'banana': '🍌', 'pizza': '🍕', 'cake': '🎂', 'cookie': '🍪', 'water': '💧', 'drink': '🥤', 'coffee': '☕',
        'gift': '🎁', 'box': '📦', 'tool': '🧰', 'hammer': '🔨', 'sword': '⚔️', 'shield': '🛡️'
    };

    let lastEmojiText = ""; let lastEmojiResult = null;
    function getEmojiForText(text) {
        if (!text) return null;
        if (lastEmojiText === text) return lastEmojiResult;
        lastEmojiText = text; lastEmojiResult = null;
        const cleanWords = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
        for (let w of cleanWords) {
            if (emojiDict[w]) { lastEmojiResult = emojiDict[w]; break; }
        }
        return lastEmojiResult;
    }

    let captionPosX = 0.5;
    let captionPosY = 0.85;
    let isDraggingCaption = false;

    renderCanvas.addEventListener('pointerdown', () => { isDraggingCaption = true; });
    renderCanvas.addEventListener('pointermove', (e) => {
        if (!isDraggingCaption) return;
        const rect = renderCanvas.getBoundingClientRect();
        captionPosX = (e.clientX - rect.left) / rect.width;
        captionPosY = (e.clientY - rect.top) / rect.height;
        // Force a redraw just in case paused
        if (sourceVideo.paused && hasDrawnFirstFrame) {
            const ctx = renderCanvas.getContext('2d');
            ctx.drawImage(sourceVideo, 0, 0, renderCanvas.width, renderCanvas.height);
            const time = sourceVideo.currentTime;
            const currentChunk = generatedCaptions.find(c => time >= c.timestamp[0] && time <= c.timestamp[1]);
            if (currentChunk && currentChunk.text) {
                const baseFontSize = renderCanvas.height * 0.08;
                const sizeMult = (sizeSlider ? parseInt(sizeSlider.value) : 80) / 100;
                const fontSize = Math.floor(baseFontSize * sizeMult);
                const gapMult = (gapSlider ? parseInt(gapSlider.value) : 120) / 100;
                const lineHeight = fontSize * gapMult;
                const maxWBase = renderCanvas.width;
                const widthMult = (widthSlider ? parseInt(widthSlider.value) : 85) / 100;
                const maxWidth = maxWBase * widthMult;
                ctx.font = `900 ${fontSize}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                drawWrappedText(ctx, currentChunk.text.trim(), renderCanvas.width * captionPosX, renderCanvas.height * captionPosY, maxWidth, lineHeight, time - currentChunk.timestamp[0], styleSelect.value);
            }
        }
    });
    renderCanvas.addEventListener('pointerup', () => isDraggingCaption = false);
    renderCanvas.addEventListener('pointerleave', () => isDraggingCaption = false);

    let videoUrl = null;
    let activeFile = null;
    let audioDataArray = null;
    let generatedCaptions = [];
    let isExtractingText = false;
    let isRecording = false;
    let transcriber = null;
    let hasDrawnFirstFrame = false;
    let previewFrameHandle = null;
    let previewFrameMode = null;

    function formatTime(seconds) {
        if(isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updatePlayPauseLabel() {
        playPauseBtn.textContent = sourceVideo.paused ? '▶️ Play' : '⏸️ Pause';
    }

    function clearPreviewFrameHandle() {
        if (previewFrameHandle === null) return;
        if (previewFrameMode === 'raf') {
            cancelAnimationFrame(previewFrameHandle);
        } else if (previewFrameMode === 'rvfc' && typeof sourceVideo.cancelVideoFrameCallback === 'function') {
            sourceVideo.cancelVideoFrameCallback(previewFrameHandle);
        }
        previewFrameHandle = null;
        previewFrameMode = null;
    }

    function renderPreviewNow(timeOverride = sourceVideo.currentTime) {
        const ctx = renderCanvas.getContext('2d');
        renderCaptionFrame(ctx, renderCanvas.width, renderCanvas.height, timeOverride, { isPreviewSurface: true });
    }

    function schedulePreviewFrame() {
        if (previewFrameHandle !== null || sourceVideo.paused || sourceVideo.ended) return;
        if (typeof sourceVideo.requestVideoFrameCallback === 'function') {
            previewFrameMode = 'rvfc';
            previewFrameHandle = sourceVideo.requestVideoFrameCallback(() => {
                previewFrameHandle = null;
                previewFrameMode = null;
                renderPreviewNow(sourceVideo.currentTime);
                schedulePreviewFrame();
            });
        } else {
            previewFrameMode = 'raf';
            previewFrameHandle = requestAnimationFrame(() => {
                previewFrameHandle = null;
                previewFrameMode = null;
                renderPreviewNow(sourceVideo.currentTime);
                schedulePreviewFrame();
            });
        }
    }

    sourceVideo.addEventListener('timeupdate', () => {
        if (!seekSlider.isDragging) seekSlider.value = sourceVideo.currentTime;
        seekSlider.max = sourceVideo.duration || 100;
        timeDisplay.textContent = `${formatTime(sourceVideo.currentTime)} / ${formatTime(sourceVideo.duration)}`;
        
        if (isRecording && sourceVideo.duration) {
            let pct = Math.floor((sourceVideo.currentTime / sourceVideo.duration) * 100);
            statusText.innerHTML = `🎬 Rendering High-Quality Video... ${pct}%`;
        }
    });

    seekSlider.addEventListener('mousedown', () => seekSlider.isDragging = true);
    seekSlider.addEventListener('mouseup', () => seekSlider.isDragging = false);
    seekSlider.addEventListener('input', () => {
        sourceVideo.currentTime = seekSlider.value;
        if (sourceVideo.paused) renderPreviewNow(sourceVideo.currentTime);
    });

    playPauseBtn.addEventListener('click', () => {
        if (sourceVideo.paused) {
            sourceVideo.play();
        } else {
            sourceVideo.pause();
        }
    });
    
    resetBtn.addEventListener('click', () => {
        sourceVideo.pause(); sourceVideo.src = ''; generatedCaptions = []; hasDrawnFirstFrame = false;
        videoContainer.classList.add('hidden');
        actionBtn.disabled = true; actionBtn.classList.remove('hidden');
        exportBtn.classList.add('hidden'); editorPanel.classList.add('hidden');
        resetBtn.classList.add('hidden'); progressBlock.classList.add('hidden');
        videoInput.value = '';
    });

    videoInput.addEventListener('click', (e) => { e.target.value = null; });
    
    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        activeFile = file;
        videoUrl = URL.createObjectURL(file);
        
        videoContainer.classList.remove('hidden');
        actionBtn.disabled = false;
        resetBtn.classList.remove('hidden');
        actionBtn.textContent = 'Generate Captions';

        sourceVideo.addEventListener('loadedmetadata', () => {
            let vw = sourceVideo.videoWidth;
            let vh = sourceVideo.videoHeight;
            
            // Fallback for audio-only uploads or parsed metadata failures
            if (!vw || !vh || vw === 0 || vh === 0) {
                vw = 1920;
                vh = 1080;
            }

            const MAX_DIM = 1920; // Ensure 1080p limit
            let maxDim = Math.max(vw, vh);
            
            // Only scale down if it exceeds maximum thresholds, NEVER artificially force scale UP.
            // Hardware decoding lag is primarily triggered by forcing low-res sources to upscale manually through HTML5 canvas
            if (maxDim > MAX_DIM && vh > 0) {
                const scale = MAX_DIM / maxDim;
                vw = vw * scale;
                vh = vh * scale;
            }
            renderCanvas.width = Math.floor(vw); 
            renderCanvas.height = Math.floor(vh);
        }, { once: true });
        
        sourceVideo.addEventListener('loadeddata', () => {
            if(!hasDrawnFirstFrame) {
                const ctx = renderCanvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                
                const filter = filterSelect ? filterSelect.value : 'none';
                if (filter === 'darken') ctx.filter = 'brightness(50%)';
                else if (filter === 'blur') ctx.filter = 'blur(10px)';
                else if (filter === 'grayscale') ctx.filter = 'grayscale(100%)';
                else if (filter === 'sepia') ctx.filter = 'sepia(100%)';
                else if (filter === 'invert') ctx.filter = 'invert(100%) hue-rotate(180deg)';
                else ctx.filter = 'none';

                renderPreviewNow(0);
                hasDrawnFirstFrame = true;
            }
        });
        
        sourceVideo.src = videoUrl;

        progressBlock.classList.remove('hidden');
        statusText.innerHTML = "Video loaded. Ready.";
    });

    async function extractAudio(fileToProcess) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const isElectron = window && window.process && window.process.type;
        
        statusText.innerHTML = "Fetching audio data...";
        const arrayBuffer = await fileToProcess.arrayBuffer();
        statusText.innerHTML = "Decoding audio data locally...";
        
        let audioBuffer;
        try {
            if (isElectron) {
                const fs = require('fs');
                const path = require('path');
                const os = require('os');
                const { execSync } = require('child_process');
                
                const tempVid = path.join(os.tmpdir(), "presentator_temp_" + Date.now() + ".mp4");
                const tempWav = path.join(os.tmpdir(), "presentator_wav_" + Date.now() + ".wav");
                
                fs.writeFileSync(tempVid, Buffer.from(arrayBuffer));
                execSync(`ffmpeg -y -i "${tempVid}" -ac 1 -ar 16000 "${tempWav}"`, { stdio: 'ignore' });
                
                const wavData = fs.readFileSync(tempWav);
                const toArrayBuffer = new Uint8Array(wavData).buffer;
                audioBuffer = await audioContext.decodeAudioData(toArrayBuffer);
                
                try { fs.unlinkSync(tempVid); fs.unlinkSync(tempWav); } catch(e){}
            } else {
                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            }
        } catch(e) {
            console.error("Advanced offline decode bypassed, falling back:", e);
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        }
        
        return {
            buffer: audioBuffer.getChannelData(0),
            duration: audioBuffer.duration
        };
    }
    
    function populateEditor() {
        captionList.innerHTML = '';
        generatedCaptions.forEach((chunk, i) => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; gap: 8px; margin-bottom: 8px; align-items: stretch;";
            div.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:4px; font-family: monospace; background: rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.05); padding: 6px; border-radius: 4px; font-size: 0.75rem; align-items: center; justify-content:center;">
                    <div style="font-size: 0.85rem; font-weight: bold; white-space: nowrap; margin-bottom: 2px;">${formatTime(chunk.timestamp[0])}</div>
                    <div style="display:flex; gap:2px; align-items:center;">
                        <input type="number" step="0.1" title="Start Time (sec)" class="chunk-time-input" data-type="start" data-index="${i}" value="${Number(chunk.timestamp[0]).toFixed(1)}" style="width:50px; text-align:center; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:white; padding:2px; border-radius:2px;">
                        <span style="color:rgba(255,255,255,0.4);">-</span>
                        <input type="number" step="0.1" title="End Time (sec)" class="chunk-time-input" data-type="end" data-index="${i}" value="${Number(chunk.timestamp[1]).toFixed(1)}" style="width:50px; text-align:center; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:white; padding:2px; border-radius:2px;">
                    </div>
                </div>
                <input type="text" class="chunk-editor" style="flex-grow: 1; background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; font-family: inherit; font-size: 0.95rem; color: inherit;" value="${chunk.text.replace(/"/g, '&quot;')}" data-index="${i}">
                <input type="color" class="chunk-color-picker" data-index="${i}" title="Speaker Color Override" style="height:auto; min-height:40px; cursor:pointer; background:none; border:none; padding:0;" value="${chunk.colorOverride || '#fde047'}">
                <button class="chunk-remove-btn" title="Remove row" style="background:rgba(255,0,0,0.2); border:1px solid rgba(255,0,0,0.4); color:white; padding:0 8px; border-radius:4px; cursor:pointer;" data-index="${i}">✖</button>
            `;
            captionList.appendChild(div);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'primary-btn';
        addBtn.style.cssText = 'width: 100%; margin-top: 10px; padding: 10px; border-radius: 4px; border: 1px dashed rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); color: white; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 6px;';
        addBtn.innerHTML = '<span>➕</span><span>Add Caption Row</span>';
        addBtn.onclick = () => {
            const lastChunk = generatedCaptions[generatedCaptions.length - 1];
            let start = lastChunk ? parseFloat(lastChunk.timestamp[1]) : 0;
            let end = start + 2.0;
            generatedCaptions.push({ text: "New Caption", timestamp: [start, end], colorOverride: '#fde047' });
            populateEditor();
        };
        captionList.appendChild(addBtn);

        document.querySelectorAll('#captionList .chunk-editor').forEach(input => {
            input.addEventListener('input', (e) => generatedCaptions[parseInt(e.target.dataset.index)].text = e.target.value);
        });
        document.querySelectorAll('#captionList .chunk-color-picker').forEach(input => {
            input.addEventListener('input', (e) => generatedCaptions[parseInt(e.target.dataset.index)].colorOverride = e.target.value);
        });
        document.querySelectorAll('#captionList .chunk-time-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const type = e.target.dataset.type;
                const val = parseFloat(e.target.value) || 0;
                if (type === 'start') generatedCaptions[index].timestamp[0] = val;
                else generatedCaptions[index].timestamp[1] = val;
            });
        });
        document.querySelectorAll('#captionList .chunk-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                generatedCaptions.splice(index, 1);
                populateEditor();
            });
        });
    }

    actionBtn.addEventListener('click', async () => {
        if (isExtractingText) return;
        isExtractingText = true; actionBtn.disabled = true;
        
        try {
            const pBar = document.getElementById('captionProgressBarValue');
            if (pBar) pBar.style.width = "5%";
            statusText.innerHTML = "⏳ Step 1: Extracting raw audio data (Please wait...)";
            audioDataArray = await extractAudio(activeFile);
            
            if (pBar) pBar.style.width = "15%";
            if (!captionWorker) {
                statusText.innerHTML = "⏳ Step 2: Initializing AI Engine...";
                
                const workerString = `
                let pipeline, env;
                let transcriber = null;

                function extractSafeData(data) {
                    if (!data) return null;
                    try { return JSON.parse(JSON.stringify(data)); } catch(e) {
                        return { status: data.status, name: data.name, file: data.file, progress: data.progress, timestamp: data.timestamp ? [data.timestamp[0], data.timestamp[1]] : null, text: data.text || "" };
                    }
                }

                self.onmessage = async (e) => {
                    if (e.data.type === 'init') {
                        try {
                            if (!pipeline) {
                                const transformers = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.1');
                                pipeline = transformers.pipeline; env = transformers.env;
                                env.allowLocalModels = true; 
                                env.allowRemoteModels = false;
                                env.localModelPath = e.data.modelPath || 'http://127.0.0.1:5173/AI_Models/';
                                env.useBrowserCache = true;
                            }
                            if (!transcriber) {
                                // Downgraded to 'tiny.en' (quantized ~40MB) for extreme speed improvements on standard CPUs!
                                transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
                                    quantized: true, // enforce lightweight float representations
                                    progress_callback: data => self.postMessage({ type: 'progress', data: extractSafeData(data) })
                                });
                            }
                            self.postMessage({ type: 'init_done' });
                        } catch (err) {
                            self.postMessage({ type: 'error', error: err.message });
                        }
                    } else if (e.data.type === 'transcribe') {
                        try {
                            const { audioDataArray, options, duration } = e.data;
                            const result = await transcriber(audioDataArray, {
                                ...options, chunk_callback: (chunk) => self.postMessage({ type: 'chunk_progress', chunk: extractSafeData(chunk), duration })
                            });
                            self.postMessage({ type: 'result', result: extractSafeData(result) });
                        } catch (err) {
                            self.postMessage({ type: 'error', error: err.message });
                        }
                    }
                };
                `;
                
                const blob = new Blob([workerString], { type: 'application/javascript' });
                captionWorker = new Worker(URL.createObjectURL(blob));
                
                await new Promise((resolve, reject) => {
                    captionWorker.onerror = (e) => reject(new Error("Worker failed to load (Check path): " + (e.message || "Unknown error")));
                    captionWorker.onmessage = (e) => {
                        if (e.data.type === 'init_done') resolve();
                        else if (e.data.type === 'progress') {
                            if (e.data.data.status === 'downloading') {
                                let dllPct = Math.round(e.data.data.progress || 0);
                                statusText.innerHTML = `⏳ Downloading AI model: ${dllPct}%`;
                                if (pBar) pBar.style.width = (15 + (dllPct * 0.15)) + "%"; // Scales up to ~30%
                            }
                            else if (e.data.data.status === 'ready') statusText.innerHTML = "⏳ AI engine initialized. Starting transcription...";
                        } else if (e.data.type === 'error') reject(new Error(e.data.error || "Model initialization failed"));
                    };
                    captionWorker.postMessage({ type: 'init', modelPath: `${window.location.origin}/AI_Models/` });
                });
            }
            if (pBar) pBar.style.width = "30%";

            let transcribeOptions = { 
                chunk_length_s: 30, 
                stride_length_s: 5, 
                return_timestamps: 'word'
            };
            
            if (translateCheck && translateCheck.checked) {
                transcribeOptions.task = 'translate';
                statusText.innerHTML = "Auto-Translating any detected language directly to English...";
            }

            const result = await new Promise((resolve, reject) => {
                captionWorker.onerror = (e) => reject(new Error("Worker runtime crash: " + (e.message || "Unknown error")));
                captionWorker.onmessage = (e) => {
                    if (e.data.type === 'chunk_progress') {
                        if (e.data.duration && e.data.chunk && e.data.chunk.timestamp && e.data.chunk.timestamp[1] !== null) {
                            let pct = Math.min(Math.round((e.data.chunk.timestamp[1] / e.data.duration) * 100), 100);
                            statusText.innerHTML = `Transcribing Audio to Text... ${pct}%`;
                            const pBar = document.getElementById('captionProgressBarValue');
                            if(pBar) pBar.style.width = pct + "%";
                        }
                    } else if (e.data.type === 'result') {
                        const pBar = document.getElementById('captionProgressBarValue');
                        if(pBar) pBar.style.width = "100%";
                        resolve(e.data.result);
                    }
                    else if (e.data.type === 'error') reject(new Error(e.data.error || "Transcription failed"));
                };
                captionWorker.postMessage({ 
                    type: 'transcribe', 
                    audioDataArray: audioDataArray.buffer, 
                    options: transcribeOptions,
                    duration: audioDataArray.duration || sourceVideo.duration || 60
                });
            });

            let rawChunks = result.chunks || [];
            let cleanCaptions = [];
            
            // Reconstruct semantic sentences with perfect word-level internal timestamps
            let currentSentence = null;
            rawChunks.forEach(c => {
                let strippedText = c.text.replace(/\[.*?\]|\(.*?\)|♪|♫/g, '').trim();
                if (strippedText.length === 0) return;
                
                let wordTimestamp = Array.isArray(c.timestamp) ? c.timestamp : [0, 0];
                if (wordTimestamp[0] === null) wordTimestamp[0] = currentSentence ? currentSentence.timestamp[1] : 0;
                if (wordTimestamp[1] === null) wordTimestamp[1] = wordTimestamp[0] + 0.5;

                if (!currentSentence) {
                    currentSentence = { text: strippedText, timestamp: [...wordTimestamp], words: [{ text: strippedText, timestamp: [...wordTimestamp] }] };
                } else {
                    currentSentence.text += ' ' + strippedText;
                    currentSentence.timestamp[1] = wordTimestamp[1];
                    currentSentence.words.push({ text: strippedText, timestamp: [...wordTimestamp] });
                }
                
                const isPunctuation = /[.!?]$/.test(strippedText);
                if (isPunctuation || currentSentence.words.length >= 12 || (wordTimestamp[1] - wordTimestamp[0] > 1.5)) {
                    cleanCaptions.push(currentSentence);
                    currentSentence = null;
                }
            });
            if (currentSentence) cleanCaptions.push(currentSentence);

            generatedCaptions = cleanCaptions;
            
            // Gapless closure algorithm: guarantee no caption disappears randomly
            for (let i = 0; i < generatedCaptions.length; i++) {
                 if (i < generatedCaptions.length - 1) {
                      const current = generatedCaptions[i];
                      const next = generatedCaptions[i + 1];
                      // Extend current chunk seamlessly to the precise start of the next chunk
                      if (current.timestamp[1] < next.timestamp[0]) {
                          current.timestamp[1] = next.timestamp[0];
                      }
                 } else {
                      // Final chunk rides out the duration
                      generatedCaptions[i].timestamp[1] = sourceVideo.duration || generatedCaptions[i].timestamp[1] + 5;
                 }
            }
            
            if(generatedCaptions.length === 0 && result.text) {
                let strippedText = result.text.replace(/\[.*?\]|\(.*?\)|♪|♫/g, '').trim();
                if (strippedText.length > 0) generatedCaptions = [{text: strippedText, timestamp: [0, sourceVideo.duration]}];
            }
            
            editorPanel.classList.remove('hidden'); populateEditor();
            statusText.innerHTML = "✅ Captions Generated successfully!";
            actionBtn.classList.add('hidden'); exportBtn.classList.remove('hidden');
            
            sourceVideo.pause();
            sourceVideo.currentTime = 0;
            clearPreviewFrameHandle();
            renderPreviewNow(0);
            updatePlayPauseLabel();

        } catch (error) { 
            statusText.innerHTML = "❌ Error: " + (error.message || "Unknown execution crash");
            alert("CAPTION PIPELINE CRASH: " + (error.message || "Worker failed."));
        } finally { isExtractingText = false; actionBtn.disabled = false; }
    });
    
    function drawWrappedText(ctx, fullText, x, y, maxWidth, lineHeight, elapsedTime, styleType, activeWordIndex = -1, targetEmoji = null, fontSize = 50, colorOverride = null) {
        let text = fullText;


        let lines = [];
        if (!window._textWrapCache) window._textWrapCache = {};
        const fontStr = ctx.font;
        const cacheKey = `${text}_${maxWidth}_${fontStr}`;
        if (window._textWrapCache[cacheKey]) {
            lines = window._textWrapCache[cacheKey];
        } else {
            const words = text.trim().split(/\s+/); let line = '';
            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && n > 0) { lines.push(line); line = words[n] + ' '; } 
                else line = testLine;
            }
            lines.push(line);
            window._textWrapCache[cacheKey] = lines;
        }

        ctx.save();
        ctx.translate(x, y);

        const globalColor = colorOverride || (colorPicker ? colorPicker.value : '#fde047');
        const strokeScale = strokeSlider ? parseInt(strokeSlider.value) / 100 : 0.8;
        const baseStrokeWidth = Math.max(0, Math.floor(lineHeight * 0.15 * strokeScale));

        let currentY = -(lines.length * lineHeight) / 2 + lineHeight / 2;
        
        // Draw floating Emoji Reaction on top of caption block if requested
        if (targetEmoji) {
            ctx.save();
            // Pop bounce animation based on time
            const emojiScale = elapsedTime < 0.2 ? 0.5 + (Math.sin(elapsedTime / 0.2 * Math.PI / 2) * 0.7) : 1.2;
            ctx.scale(emojiScale, emojiScale);
            ctx.font = `900 ${fontSize * 1.5}px sans-serif`;
            ctx.fillText(targetEmoji, 0, - (lines.length * lineHeight)/2 - Math.max(30, fontSize));
            ctx.restore();
        }

        const renderLine = (txt, yPos, wordCursorStart, drawShadowFx) => {
            if (activeWordIndex === -1 || styleType === 'typewriter' || styleType === 'glitch') {
                if (drawShadowFx) drawShadowFx();
                if (baseStrokeWidth > 0 && styleType !== 'glitch' && styleType !== 'retro') ctx.strokeText(txt, 0, yPos);
                ctx.fillText(txt, 0, yPos);
                return txt.trim().split(/\s+/).length;
            } else {
                if (!window._wordWidthCache) window._wordWidthCache = {};
                const fontKey = ctx.font;
                const getW = (textFrag) => {
                     const key = textFrag + "_" + fontKey;
                     if (!window._wordWidthCache[key]) window._wordWidthCache[key] = ctx.measureText(textFrag).width;
                     return window._wordWidthCache[key];
                };

                if (drawShadowFx) drawShadowFx(); // Compute massive canvas shader setup ONCE outside word loops!
                const wds = txt.trim().split(/\s+/);
                let cx = -getW(txt) / 2;
                const spaceW = getW(' ');

                for(let w = 0; w < wds.length; w++) {
                    const bw = getW(wds[w]);
                    const isFocus = (wordCursorStart + w === activeWordIndex);
                    const ogAlpha = ctx.globalAlpha;
                    const ogFill = ctx.fillStyle;
                    
                    if (!isFocus) { ctx.globalAlpha = ogAlpha * 0.3; ctx.fillStyle = '#ffffff'; }
                    
                    if (baseStrokeWidth > 0 && styleType !== 'glitch' && styleType !== 'retro') ctx.strokeText(wds[w], cx + bw/2, yPos);
                    ctx.fillText(wds[w], cx + bw/2, yPos);
                    
                    if (!isFocus) { ctx.globalAlpha = ogAlpha; ctx.fillStyle = ogFill; }
                    cx += bw + spaceW;
                }
                return wds.length;
            }
        };

        let wordCursor = 0;

        if (styleType === 'tiktok') {
            let scale = 1.0;
            if (elapsedTime < 0.15) scale = 0.5 + (Math.sin((elapsedTime / 0.15) * Math.PI / 2) * 0.6); 
            else if (elapsedTime < 0.25) scale = 1.1 - ((elapsedTime - 0.15) / 0.1) * 0.1;
            ctx.scale(scale, scale);
            
            ctx.lineWidth = baseStrokeWidth; ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000'; ctx.fillStyle = globalColor; 
            
            for(let i = 0; i < lines.length; i++) {
                wordCursor += renderLine(lines[i].trim(), currentY, wordCursor, () => {
                    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
                });
                currentY += lineHeight;
            }
        } 
        else if (styleType === 'classic') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            let maxLineWidth = 0;
            lines.forEach(l => { const w = ctx.measureText(l).width; if(w > maxLineWidth) maxLineWidth = w; });
            ctx.fillRect( -maxLineWidth/2 - 20, -(lines.length * lineHeight)/2 - 10, maxLineWidth + 40, lines.length * lineHeight + 20);
            
            ctx.fillStyle = globalColor;
            for(let i = 0; i < lines.length; i++) {
                wordCursor += renderLine(lines[i].trim(), currentY, wordCursor, () => { ctx.shadowColor='transparent'; });
                currentY += lineHeight;
            }
        }
        else if (styleType === 'cinematic') {
            if (elapsedTime < 0.4) ctx.globalAlpha = elapsedTime / 0.4;
            else ctx.globalAlpha = 1.0;
            
            ctx.fillStyle = globalColor;
            for(let i = 0; i < lines.length; i++) {
                wordCursor += renderLine(lines[i].trim(), currentY, wordCursor, () => {
                     ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 15; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
                });
                currentY += lineHeight;
            }
        }
        else if (styleType === 'neon') {
            if (elapsedTime < 0.1) ctx.globalAlpha = elapsedTime / 0.1;
            ctx.fillStyle = '#ffffff';
            for(let i = 0; i < lines.length; i++) {
                if (activeWordIndex === -1) {
                    ctx.shadowColor = globalColor; ctx.shadowBlur = 25;
                    ctx.fillText(lines[i].trim(), 0, currentY); ctx.fillText(lines[i].trim(), 0, currentY);
                } else {
                    wordCursor += renderLine(lines[i].trim(), currentY, wordCursor, () => {
                        ctx.shadowColor = globalColor; ctx.shadowBlur = 25;
                    });
                }
                currentY += lineHeight;
            }
        }
        else if (styleType === 'glitch') {
            ctx.lineWidth = baseStrokeWidth; ctx.lineJoin = 'round'; ctx.strokeStyle = '#000000';
            
            let xr = 0, yr = 0, xb = 0, yb = 0;
            if (elapsedTime < 0.3 || Math.random() > 0.95) {
                xr = (Math.random() - 0.5) * 15; yr = (Math.random() - 0.5) * 15;
                xb = (Math.random() - 0.5) * 15; yb = (Math.random() - 0.5) * 15;
            }
            
            for(let i = 0; i < lines.length; i++) {
                const txt = lines[i].trim();
                ctx.fillStyle = '#ff003c'; ctx.fillText(txt, xr, currentY + yr);
                ctx.fillStyle = '#00f0ff'; ctx.fillText(txt, xb, currentY + yb);
                
                ctx.fillStyle = globalColor;
                if(baseStrokeWidth > 0) ctx.strokeText(txt, 0, currentY);
                ctx.fillText(txt, 0, currentY);
                currentY += lineHeight;
            }
        }
        else if (styleType === 'vaporwave') {
            ctx.lineWidth = baseStrokeWidth; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2b00ff';
            ctx.fillStyle = globalColor;
            
            const tilt = Math.sin(elapsedTime * 2) * 0.05;
            ctx.rotate(tilt);
            
            for(let i = 0; i < lines.length; i++) {
                wordCursor += renderLine(lines[i].trim(), currentY, wordCursor, () => {
                   ctx.shadowColor = '#ff00c8'; ctx.shadowBlur = 15; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4; 
                });
                currentY += lineHeight;
            }
        }
        else if (styleType === 'retro') {
            const floatY = Math.floor(Math.sin(elapsedTime * 6)) * 8;
            ctx.translate(0, floatY);
            ctx.lineWidth = baseStrokeWidth; ctx.lineJoin = 'miter'; ctx.miterLimit = 2;
            ctx.strokeStyle = '#000'; ctx.fillStyle = globalColor;
            
            for(let i = 0; i < lines.length; i++) {
                if(baseStrokeWidth > 0) {
                    ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 6;
                    ctx.strokeText(lines[i].trim(), 0, currentY);
                    ctx.shadowColor = 'transparent';
                }
                wordCursor += renderLine(lines[i].trim(), currentY, wordCursor, () => {
                    ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 5;
                });
                currentY += lineHeight;
            }
        }
        else if (styleType === 'typewriter') {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            // Box width must comfortably fit the largest cached line statically!
            let maxLineWidth = 0;
            lines.forEach(l => { const w = ctx.measureText(l.trim()).width; if(w > maxLineWidth) maxLineWidth = w; });
            maxLineWidth = Math.min(maxLineWidth, maxWidth);
            ctx.fillRect( -maxLineWidth/2 - 20, -(lines.length * lineHeight)/2 - 10, maxLineWidth + 40, lines.length * lineHeight + 20);
            
            ctx.fillStyle = globalColor;
            let charsAllowed = Math.floor(elapsedTime * 25);
            
            for(let i = 0; i < lines.length; i++) {
                let txt = lines[i].trim();
                let txtToDraw = txt;
                if (charsAllowed <= 0) break;
                if (charsAllowed < txt.length) txtToDraw = txt.slice(0, charsAllowed);
                
                ctx.fillText(txtToDraw, 0, currentY);
                charsAllowed -= txt.length + 1; // Accommodate the implicitly consumed line-wrap space
                currentY += lineHeight;
            }
        }

        ctx.restore();
    }

    function renderCaptionFrame(ctx, targetWidth, targetHeight, time, options = {}) {
      const isPreviewSurface = options.isPreviewSurface !== false;
      if (!ctx) return;
      if (!ctx.imageSmoothingEnabled) ctx.imageSmoothingEnabled = true;

      try {
        const filter = filterSelect ? filterSelect.value : 'none';
        let targetFilter = 'none';
        if (filter === 'darken') targetFilter = 'brightness(50%)';
        else if (filter === 'blur') targetFilter = 'blur(10px)';
        else if (filter === 'grayscale') targetFilter = 'grayscale(100%)';
        else if (filter === 'sepia') targetFilter = 'sepia(100%)';
        else if (filter === 'invert') targetFilter = 'invert(100%) hue-rotate(180deg)';

        if (ctx.filter !== targetFilter) ctx.filter = targetFilter;

        if (sourceVideo.readyState >= 2) { // HAVE_CURRENT_DATA
            try {
                ctx.drawImage(sourceVideo, 0, 0, targetWidth, targetHeight);
            } catch(ev) {}
        }
        
        if (ctx.filter !== 'none') ctx.filter = 'none';
        
        const offset = syncSlider ? parseInt(syncSlider.value) / 1000 : 0;
        const adjustedTime = time - offset;
        
        // Use backward array search to guarantee that if two chunks overlap due to trailing silence or gap optimizations,
        // the newly started sequential chunk immediately claims the screen render, preventing display masks!
        let currentChunk = null;
        for (let i = generatedCaptions.length - 1; i >= 0; i--) {
            if (adjustedTime >= generatedCaptions[i].timestamp[0] && adjustedTime <= generatedCaptions[i].timestamp[1]) {
                currentChunk = generatedCaptions[i];
                break;
            }
        }
        
        if (currentChunk && currentChunk.text) {
             let useMusic = bgMusicAudio && !bgMusicAudio.paused;
             if (bgMusicCheck && !bgMusicCheck.checked) useMusic = false;
             if (useMusic) bgMusicAudio.volume = 0.1; // Ducking active
             
             const brollImage = getBrollForText(currentChunk.text);
             if (brollImage && brollImage.complete && brollImage.width > 0 && brollImage.height > 0) {
                 ctx.save();
                 ctx.globalAlpha = 0.8;
                 const wr = targetWidth / brollImage.width; const hr = targetHeight / brollImage.height;
                 const scale = Math.max(wr, hr);
                 const ix = (targetWidth / 2) - (brollImage.width / 2) * scale;
                 const iy = (targetHeight / 2) - (brollImage.height / 2) * scale;
                 ctx.drawImage(brollImage, ix, iy, brollImage.width * scale, brollImage.height * scale);
                 ctx.restore();
             }

            const baseFontSize = targetHeight * 0.08;
            const sizeMult = (sizeSlider ? parseInt(sizeSlider.value) : 80) / 100;
            const fontSize = Math.floor(baseFontSize * sizeMult);
            
            const gapMult = (gapSlider ? parseInt(gapSlider.value) : 120) / 100;
            const lineHeight = fontSize * gapMult;

            const maxWBase = targetWidth;
            const widthMult = (widthSlider ? parseInt(widthSlider.value) : 85) / 100;
            const maxWidth = maxWBase * widthMult;
            
             let activeWordIndex = -1;
             const isKaraoke = karaokeCheck && karaokeCheck.checked;
             if (isKaraoke) {
                  const rawWords = currentChunk.text.trim().split(/\s+/);
                  const totalWords = rawWords.length;
                  
                  if (currentChunk.words && currentChunk.words.length === totalWords) {
                       let foundIdx = currentChunk.words.findIndex(w => adjustedTime <= (w.timestamp[1] !== null ? w.timestamp[1] : w.timestamp[0] + 0.2));
                       activeWordIndex = foundIdx !== -1 ? foundIdx : totalWords - 1;
                  } else {
                       const chunkDuration = currentChunk.timestamp[1] - currentChunk.timestamp[0];
                       const elapsedTime = adjustedTime - currentChunk.timestamp[0];
                       const timePerWord = chunkDuration / Math.max(1, totalWords);
                       if (timePerWord <= 0 || isNaN(timePerWord)) activeWordIndex = 0;
                       else activeWordIndex = Math.floor(elapsedTime / timePerWord);
                  }
                  
                  if (activeWordIndex >= totalWords) activeWordIndex = totalWords - 1;
                  if (activeWordIndex < 0 || isNaN(activeWordIndex)) activeWordIndex = 0;
                  
                  if (activeWordIndex !== -1 && activeWordIndex !== lastSfxWordIndex) {
                       const wordObj = currentChunk.text.trim().split(' ')[activeWordIndex];
                       if (wordObj) {
                           const word = wordObj.toLowerCase().replace(/[^a-z0-9]/g, '');
                           if (['boom','bang','pow','crash','smash'].includes(word)) playSfx('pop');
                           else if (['fast','whoosh','zoom','fly','run','speed'].includes(word)) playSfx('whoosh');
                           else if (['money','cash','buy','dollar','rich','wealth'].includes(word)) playSfx('pop');
                           else if (Math.random() > 0.85) playSfx('pop');
                       }
                       lastSfxWordIndex = activeWordIndex;
                  }
             } else {
                  lastSfxWordIndex = -1;
             }

            let targetEmoji = null;
            const useEmoji = emojiCheck && emojiCheck.checked;
            if (useEmoji) targetEmoji = getEmojiForText(currentChunk.text);

            const fontFamily = fontSelect ? fontSelect.value : 'Nunito, sans-serif';
            ctx.font = `900 ${fontSize}px ${fontFamily}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            
            drawWrappedText(ctx, currentChunk.text.trim(), targetWidth * captionPosX, targetHeight * captionPosY, maxWidth, lineHeight, adjustedTime - currentChunk.timestamp[0], styleSelect.value, activeWordIndex, targetEmoji, fontSize, currentChunk.colorOverride);
          } else {
            let useMusic = bgMusicAudio && !bgMusicAudio.paused;
            if (bgMusicCheck && !bgMusicCheck.checked) useMusic = false;
            if (useMusic) bgMusicAudio.volume = 0.5; // Ducking inactive
            lastSfxWordIndex = -1;
        }

        if (sharedWatermarkImage && sharedWatermarkImage.complete && (!watermarkCheck || watermarkCheck.checked)) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            const wmWidth = targetWidth * 0.15;
            const wmHeight = (wmWidth / sharedWatermarkImage.width) * sharedWatermarkImage.height;
            ctx.drawImage(sharedWatermarkImage, targetWidth - wmWidth - 40, 40, wmWidth, wmHeight);
            ctx.restore();
        }

        if (progressCheck && progressCheck.checked) {
            const duration = sourceVideo.duration || 1;
            const progress = time / duration;
            const globalColor = colorPicker ? colorPicker.value : '#fde047';
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 8;
            ctx.fillStyle = globalColor;
            const barHeight = 15;
            ctx.fillRect(0, targetHeight - barHeight, targetWidth * progress, barHeight);
            ctx.restore();
        }
      } catch (err) {
         // Silently catch exceptions so the loop survives rendering failures
      }
    }

    sourceVideo.addEventListener('loadedmetadata', () => {
        const ctx = renderCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
    });

    sourceVideo.addEventListener('play', () => {
        updatePlayPauseLabel();
        schedulePreviewFrame();
    });
    sourceVideo.addEventListener('pause', () => {
        clearPreviewFrameHandle();
        updatePlayPauseLabel();
        renderPreviewNow(sourceVideo.currentTime);
    });
    sourceVideo.addEventListener('ended', () => {
        clearPreviewFrameHandle();
        updatePlayPauseLabel();
        if (!isRecording) renderPreviewNow(sourceVideo.currentTime);
    });

    exportBtn.addEventListener('click', () => {
        if(isRecording) return;
        isRecording = true; exportBtn.textContent = 'Rendering High-Quality Video...'; exportBtn.disabled = true;
        statusText.innerHTML = "Processing original video with burned captions (please do not switch tabs)...";
        sourceVideo.pause(); sourceVideo.currentTime = 0;
        sourceVideo.playbackRate = 1.0; 

        const exportWidth = sourceVideo.videoWidth || renderCanvas.width;
        const exportHeight = sourceVideo.videoHeight || renderCanvas.height;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = exportWidth;
        exportCanvas.height = exportHeight;
        const exportCtx = exportCanvas.getContext('2d', { alpha: false });

        let exportFps = 30;
        try {
            const probeStream = typeof sourceVideo.captureStream === 'function' ? sourceVideo.captureStream() : null;
            const probeTrack = probeStream && probeStream.getVideoTracks ? probeStream.getVideoTracks()[0] : null;
            const probeFps = probeTrack && probeTrack.getSettings ? probeTrack.getSettings().frameRate : null;
            if (probeFps && Number.isFinite(probeFps)) exportFps = Math.max(24, Math.min(60, Math.round(probeFps)));
            if (probeTrack) probeTrack.stop();
            if (probeStream) probeStream.getTracks().forEach(track => track.stop());
        } catch (e) {}

        let exportLoopStopped = false;
        const exportIntervalMs = Math.max(16, Math.round(1000 / exportFps));
        let exportLoopTimer = null;
        const runExportLoop = () => {
            if (exportLoopStopped) return;
            renderCaptionFrame(exportCtx, exportWidth, exportHeight, sourceVideo.currentTime, { isPreviewSurface: false });
        };
        renderCaptionFrame(exportCtx, exportWidth, exportHeight, 0, { isPreviewSurface: false });
        const stream = exportCanvas.captureStream(exportFps);
        const sourceCapture = typeof sourceVideo.captureStream === 'function' ? sourceVideo.captureStream() : null;
        const sourceAudioTracks = sourceCapture && sourceCapture.getAudioTracks ? sourceCapture.getAudioTracks() : [];
        const exportAudioTrack = sourceAudioTracks[0] || null;
        if (exportAudioTrack) stream.addTrack(exportAudioTrack);

        // Maximize absolute bitrate for crispy text rendering!
        let options = { mimeType: 'video/webm; codecs=vp9' };
        let ext = 'webm';
        if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.4d4028, mp4a.40.2"')) {
            options = { mimeType: 'video/mp4; codecs="avc1.4d4028, mp4a.40.2"' }; // Forces AAC audio!
            ext = 'mp4';
        } else if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.4d4028"')) {
            options = { mimeType: 'video/mp4; codecs="avc1.4d4028"' };
            ext = 'mp4';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4' };
            ext = 'mp4';
        } else if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm; codecs=vp8' };
        }
        
        // Target 12 Mbps for a balance of small file size and good visual quality
        options.videoBitsPerSecond = 12000000; 

        const recorder = new MediaRecorder(stream, options);
        const recordedChunks = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        recorder.onstop = () => {
            exportLoopStopped = true;
            if (exportLoopTimer) clearInterval(exportLoopTimer);
            const blob = new Blob(recordedChunks, { type: options.mimeType.split(';')[0] });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `captioned_video.${ext}`; a.click(); URL.revokeObjectURL(url);
            isRecording = false; exportBtn.textContent = 'Export Result'; exportBtn.disabled = false;
            statusText.innerHTML = "✅ Export completed!";
            sourceVideo.pause();
            sourceVideo.currentTime = 0;
            renderPreviewNow(0);
            updatePlayPauseLabel();
            stream.getTracks().forEach(track => track.stop());
            if (sourceCapture) {
                try { sourceCapture.getTracks().forEach(track => track.stop()); } catch (e) {}
            }
        };
        recorder.start();
        runExportLoop();
        exportLoopTimer = setInterval(runExportLoop, exportIntervalMs);
        sourceVideo.play();
        const onEnd = () => {
            if (!isRecording) return;
            exportLoopStopped = true;
            renderCaptionFrame(exportCtx, exportWidth, exportHeight, sourceVideo.duration || sourceVideo.currentTime, { isPreviewSurface: false });
            if (exportLoopTimer) clearInterval(exportLoopTimer);
            recorder.requestData();
            setTimeout(() => {
                if (isRecording) recorder.stop();
            }, 80);
        };
        sourceVideo.addEventListener('ended', onEnd, { once: true });
    });

    const stageCaptionBtn = document.getElementById('stageCaptionExportBtn');
    if (stageCaptionBtn) {
        stageCaptionBtn.addEventListener('click', () => {
            alert("To auto-caption your presentation, use the 'Export Video' button directly above this to save your lesson to an MP4 video first.\n\nThen, I will redirect you to the 'AI Video Captioning' studio. Drop your exported MP4 video in there to perfectly burn the offline TikTok-style styles into it!");
            const stagePanel = document.getElementById('stagePanel');
            const inputPanel = document.getElementById('inputPanel');
            if (stagePanel) stagePanel.classList.add('hidden');
            if (inputPanel) inputPanel.classList.remove('hidden');

            const captionSection = document.getElementById('aiCaptionSection');
            if (captionSection) {
                captionSection.open = true;
                captionSection.scrollIntoView({behavior: "smooth", block: "start"});
            }
        });
    }

    if (viralShortBtn) {
        viralShortBtn.addEventListener('click', () => {
            if(isRecording || generatedCaptions.length === 0) return;
            // Find most dense 15s window
            let bestStart = 0; let bestEnd = 15; let maxWords = 0;
            for(let i=0; i<Math.max(1, sourceVideo.duration - 15); i+=5) {
                const w = i, e = i+15;
                const score = generatedCaptions.filter(c => c.timestamp[0] >= w && c.timestamp[1] <= e).reduce((acc, c) => acc + c.text.split(' ').length, 0);
                if (score > maxWords) { maxWords = score; bestStart = w; bestEnd = e; }
            }
            
            isRecording = true; viralShortBtn.textContent = 'Recording 15s...'; viralShortBtn.disabled = true;
            statusText.innerHTML = "Slicing Viral 15s Short Region...";
            sourceVideo.pause(); sourceVideo.currentTime = bestStart;
            sourceVideo.playbackRate = 1.0;
            
            const stream = renderCanvas.captureStream(30); // Using 30 to stay perfectly synced
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const destination = audioCtx.createMediaStreamDestination();
            if (!window.__aiAudioSourceMerged) window.__aiAudioSourceMerged = audioCtx.createMediaElementSource(sourceVideo);
            window.__aiAudioSourceMerged.connect(destination); window.__aiAudioSourceMerged.connect(audioCtx.destination);
            if (destination.stream.getAudioTracks().length > 0) stream.addTrack(destination.stream.getAudioTracks()[0]);
            if (sfxDest.stream.getAudioTracks().length > 0) stream.addTrack(sfxDest.stream.getAudioTracks()[0]);
            if (bgMusicAudio && !bgMusicAudio.paused) {
                 if (!window.__aiBgMusicMerged) window.__aiBgMusicMerged = audioCtx.createMediaElementSource(bgMusicAudio);
                 window.__aiBgMusicMerged.connect(destination);
            }

            let options = {};
            let ext = 'webm';
            if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.4d4028, mp4a.40.2"')) {
                options = { mimeType: 'video/mp4; codecs="avc1.4d4028, mp4a.40.2"' };
                ext = 'mp4';
            } else if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.4d4028"')) {
                options = { mimeType: 'video/mp4; codecs="avc1.4d4028"' };
                ext = 'mp4';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                options = { mimeType: 'video/mp4' };
                ext = 'mp4';
            } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
                options = { mimeType: 'video/webm; codecs=vp9' };
            } else {
                options = { mimeType: 'video/webm; codecs=vp8' };
            }
            
            // Target 12 Mbps for a balance of small file size and good visual quality
            options.videoBitsPerSecond = 12000000;
            
            const recorder = new MediaRecorder(stream, options);
            const recordedChunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
            recorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: options.mimeType.split(';')[0] });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `viral_short_clip.${ext}`; a.click(); URL.revokeObjectURL(url);
                isRecording = false; viralShortBtn.textContent = '✂️ Export 15s Viral Short'; viralShortBtn.disabled = false;
                statusText.innerHTML = "✅ Viral Short Export completed!";
                sourceVideo.pause(); playPauseBtn.textContent = '▶️ Play';
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start(); sourceVideo.play(); playPauseBtn.textContent = '⏸️ Pause';
            
            const checkEnd = setInterval(() => {
                if (sourceVideo.currentTime >= bestEnd) {
                    clearInterval(checkEnd);
                    if (isRecording) recorder.stop();
                }
            }, 100);
        });
        
        // Show viral button if video is long enough
        sourceVideo.addEventListener('loadedmetadata', () => {
            if (sourceVideo.duration > 15 && viralShortBtn) viralShortBtn.classList.remove('hidden');
            else if (viralShortBtn) viralShortBtn.classList.add('hidden');
        });
    }

  } catch (err) {
      window.__presentatorCaptionStudioBooted = false;
      setTimeout(() => {
          const st = document.getElementById('captionStatusText');
          if (st) {
              st.innerHTML = `<span style='color:red'>FATAL UI CRASH: ${err.message}</span>`;
              if (st.parentElement) st.parentElement.classList.remove('hidden');
          }
          alert("Caption Studio failed to load: " + err.message);
      }, 500);
      console.error(err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootCaptionStudio, { once: true });
} else {
  bootCaptionStudio();
}
