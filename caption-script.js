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
        try {
            statusText.innerHTML = "Extracting audio with local FFmpeg server...";
            const mediaBase64 = arrayBufferToBase64(arrayBuffer);
            const response = await fetch('http://127.0.0.1:8430/api/extract-audio-wav', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mediaBase64,
                    inputFileName: fileToProcess.name || 'caption-video.mp4'
                })
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error((payload && payload.error) || 'FFmpeg audio extraction failed.');
            }
            const wavArrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(wavArrayBuffer.slice(0));
            return {
                buffer: audioBuffer.getChannelData(0),
                duration: audioBuffer.duration,
                wavBase64: arrayBufferToBase64(wavArrayBuffer)
            };
        } catch (serverError) {
            console.warn("Local FFmpeg audio extraction failed, trying browser decode:", serverError);
        }

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

    function arrayBufferToBase64(arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary);
    }

    function audioSamplesToWavBase64(samples, sampleRate = 16000) {
        const bytesPerSample = 2;
        const wavBuffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
        const view = new DataView(wavBuffer);
        let offset = 0;
        const writeString = (value) => {
            for (let i = 0; i < value.length; i += 1) {
                view.setUint8(offset, value.charCodeAt(i));
                offset += 1;
            }
        };
        writeString('RIFF');
        view.setUint32(offset, 36 + samples.length * bytesPerSample, true); offset += 4;
        writeString('WAVE');
        writeString('fmt ');
        view.setUint32(offset, 16, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint32(offset, sampleRate, true); offset += 4;
        view.setUint32(offset, sampleRate * bytesPerSample, true); offset += 4;
        view.setUint16(offset, bytesPerSample, true); offset += 2;
        view.setUint16(offset, 16, true); offset += 2;
        writeString('data');
        view.setUint32(offset, samples.length * bytesPerSample, true); offset += 4;
        for (let i = 0; i < samples.length; i += 1) {
            const value = Math.max(-1, Math.min(1, samples[i] || 0));
            view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
            offset += 2;
        }
        const bytes = new Uint8Array(wavBuffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary);
    }

    function buildLinearCaptionChunks(text, duration, options) {
        const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
        if (!words.length) return [];

        // ── Use ACTUAL narration duration so highlights match the voice ──────────
        // Priority order:
        //  1. state.narration.durationMs  (measured from the real audio blob)
        //  2. Caller-supplied override   (opts.narrationDurationSec)
        //  3. WPM-based estimate         (140 wpm for SC3/pattan)
        //  4. Caller-supplied videoDuration  (last resort – usually wrong)
        const opts = options || {};
        const WPM  = 140;  // SC3 / pattan TTS natural speaking rate
        const wpmEstimateSec = (words.length / WPM) * 60;

        let speechDurationSec = 0;
        if (window.state && window.state.narration && Number(window.state.narration.durationMs) > 500) {
            speechDurationSec = window.state.narration.durationMs / 1000;
        } else if (Number(opts.narrationDurationSec) > 0.5) {
            speechDurationSec = Number(opts.narrationDurationSec);
        } else {
            // Estimate from speech rate — far more accurate than video duration
            speechDurationSec = wpmEstimateSec;
        }

        // Never exceed the video duration, but also don't use video duration
        // as the primary timing reference (video may have long intro/outro)
        const videoDuration = Math.max(1, Number(duration) || 60);
        const safeDuration  = Math.min(speechDurationSec, videoDuration);

        const chunks = [];
        const chunkSize = 7;
        for (let i = 0; i < words.length; i += chunkSize) {
            const chunkWords = words.slice(i, i + chunkSize);
            const start = (i / words.length) * safeDuration;
            const end   = (Math.min(words.length, i + chunkWords.length) / words.length) * safeDuration;
            chunks.push({
                text:      chunkWords.join(' '),
                timestamp: [start, Math.max(start + 0.35, end)]
            });
        }
        return chunks;
    }

    async function transcribeWithLocalServer(extractedAudio) {
        const serverUrl = (window.state && window.state.transcribeServerUrl) || 'http://127.0.0.1:8428';
        const audioBase64 = extractedAudio.wavBase64 || audioSamplesToWavBase64(extractedAudio.buffer, 16000);
        const response = await fetch(`${serverUrl}/api/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: 'caption-audio.wav', audioBase64 })
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error((payload && payload.error) || 'Local transcription server failed.');
        }
        const payload = await response.json();
        const text = String((payload && payload.text) || '').trim();
        if (!text) {
            throw new Error('No speech was recognized from the video audio.');
        }

        // ── Use REAL word-level timestamps from Whisper ──────────────────────
        const words    = Array.isArray(payload.words)    ? payload.words    : [];
        const segments = Array.isArray(payload.segments) ? payload.segments : [];
        let chunks = [];

        if (words.length > 0) {
            // Build caption chunks from actual per-word timestamps (7 words each)
            const CHUNK_SIZE = 7;
            for (let i = 0; i < words.length; i += CHUNK_SIZE) {
                const slice = words.slice(i, i + CHUNK_SIZE);
                const chunkText = slice.map(w => w.word).join(' ').trim();
                if (!chunkText) continue;
                chunks.push({
                    text: chunkText,
                    timestamp: [slice[0].start, slice[slice.length - 1].end],
                    words: slice.map(w => ({ text: w.word, timestamp: [w.start, w.end] }))
                });
            }
        } else if (segments.length > 0) {
            // Fall back to segment-level timestamps
            chunks = segments
                .filter(s => s.text && s.text.trim())
                .map(s => ({
                    text: s.text.trim(),
                    timestamp: [s.start, s.end],
                    words: s.text.trim().split(/\s+/).map((w, i, arr) => ({
                        text: w,
                        timestamp: [
                            s.start + (i / arr.length) * (s.end - s.start),
                            s.start + ((i + 1) / arr.length) * (s.end - s.start)
                        ]
                    }))
                }));
        } else {
            // Last resort: linear spread using video duration (NOT narration duration)
            const vidDur = (sourceVideo && sourceVideo.duration) || extractedAudio.duration || 60;
            chunks = buildLinearCaptionChunks(text, vidDur, { narrationDurationSec: vidDur });
        }

        return { text, chunks };
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

    // ── Multi-language Caption Translator ───────────────────────────────────
    const TRANSLATE_SERVER = 'http://127.0.0.1:8434';

    async function translateCaptionsTo(targetLang) {
        if (!generatedCaptions || !generatedCaptions.length) {
            statusText.innerHTML = '⚠️ Generate or load captions first, then translate.';
            return;
        }
        const langLabel = { en: 'English', hi: 'हिंदी (Hindi)', te: 'తెలుగు (Telugu)' }[targetLang] || targetLang;
        statusText.innerHTML = `🌐 Translating ${generatedCaptions.length} captions to ${langLabel}...`;

        // Highlight active button
        ['En','Hi','Te'].forEach(l => {
            const b = document.getElementById('captionTranslate' + l + 'Btn');
            if (b) b.style.opacity = (l.toLowerCase() === targetLang) ? '1' : '0.5';
        });

        const pBar = document.getElementById('captionProgressBarValue');
        if (pBar) pBar.style.width = '10%';

        // Check server health first
        try {
            const health = await fetch(`${TRANSLATE_SERVER}/health`, { signal: AbortSignal.timeout(3000) });
            if (!health.ok) throw new Error('Server not ready');
        } catch (e) {
            statusText.innerHTML = `❌ Translation server not running. Please start <b>Translate-Server.cmd</b> in D:\\voice\\ then try again.`;
            return;
        }

        // Batch translate all caption texts
        const texts = generatedCaptions.map(c => c.text);
        try {
            const resp = await fetch(`${TRANSLATE_SERVER}/api/translate/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts, target: targetLang, source: 'auto' })
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const results = data.results || [];

            // Apply translations back into captions
            results.forEach((translated, i) => {
                if (generatedCaptions[i] && translated) {
                    generatedCaptions[i].text = translated;
                    // Rebuild word list for translated text (re-split by words)
                    if (generatedCaptions[i].words) {
                        const ts = generatedCaptions[i].timestamp;
                        const dur = ts[1] - ts[0];
                        const words = translated.split(/\s+/).filter(Boolean);
                        generatedCaptions[i].words = words.map((w, wi) => ({
                            text: w,
                            timestamp: [ts[0] + (wi / words.length) * dur,
                                        ts[0] + ((wi + 1) / words.length) * dur]
                        }));
                    }
                }
            });

            if (pBar) pBar.style.width = '100%';
            editorPanel.style.display = 'block';
            populateEditor();
            statusText.innerHTML = `✅ Translated ${results.length} captions to ${langLabel}. Edit if needed, then Export.`;
        } catch(e) {
            statusText.innerHTML = `❌ Translation failed: ${e.message}`;
            if (pBar) pBar.style.width = '0%';
        }
    }

    // Wire translation buttons
    const translateEnBtn = document.getElementById('captionTranslateEnBtn');
    const translateHiBtn = document.getElementById('captionTranslateHiBtn');
    const translateTeBtn = document.getElementById('captionTranslateTeBtn');
    if (translateEnBtn) translateEnBtn.addEventListener('click', () => translateCaptionsTo('en'));
    if (translateHiBtn) translateHiBtn.addEventListener('click', () => translateCaptionsTo('hi'));
    if (translateTeBtn) translateTeBtn.addEventListener('click', () => translateCaptionsTo('te'));

    // ── "Use Voice Text as Captions" button ─────────────────────────────────
    const voiceTextBtn = document.getElementById('captionUseVoiceTextBtn');
    if (voiceTextBtn) {
        voiceTextBtn.addEventListener('click', () => {
            // Read narration text from state (accumulated across all slides)
            const narText = (
                (window.state && Array.isArray(window.state.allNarrationTexts) && window.state.allNarrationTexts.length
                    ? window.state.allNarrationTexts.join(' ')
                    : window.state && window.state.lastNarrationText) ||
                localStorage.getItem('pp_last_narration_text') ||
                ''
            ).trim();
            const narVoice = (
                (window.state && window.state.lastNarrationVoice) ||
                localStorage.getItem('pp_last_narration_voice') ||
                'anjali'
            );

            if (!narText) {
                statusText.innerHTML = '⚠️ No voice narration found. Generate narration first, then open caption studio.';
                return;
            }

            const duration = sourceVideo ? (sourceVideo.duration || 60) : 60;
            // Use actual narration duration (state.narration.durationMs) if available
            // so chunk timestamps reflect real speech speed rather than video length.
            const chunks   = buildLinearCaptionChunks(narText, duration);


            if (!chunks.length) {
                statusText.innerHTML = '⚠️ Could not build captions from voice text.';
                return;
            }

            // Convert to caption format with word-level data
            generatedCaptions = chunks.map(c => {
                const words = c.text.split(/\s+/).filter(Boolean);
                const chunkDur = c.timestamp[1] - c.timestamp[0];
                return {
                    text: c.text,
                    timestamp: c.timestamp,
                    words: words.map((w, i) => ({
                        text: w,
                        timestamp: [
                            c.timestamp[0] + (i / words.length) * chunkDur,
                            c.timestamp[0] + ((i + 1) / words.length) * chunkDur
                        ]
                    }))
                };
            });

            const langLabel = {
                'anjali': 'English SC3', 'pattan': 'English Pattan',
                'hindi': 'Hindi', 'telugu': 'Telugu', 'edge': 'Edge TTS'
            }[narVoice] || narVoice;

            statusText.innerHTML = `✅ ${generatedCaptions.length} caption chunks built from ${langLabel} voice text (${narText.length} chars). Edit below if needed.`;

            editorPanel.style.display = 'block';
            const pBar = document.getElementById('captionProgressBarValue');
            if (pBar) pBar.style.width = '100%';
            populateEditor();
        });
    }

﻿    actionBtn.addEventListener('click', async () => {
        if (isExtractingText) return;
        isExtractingText = true;
        actionBtn.disabled = true;

        // Clear old captions so wrong content never shows
        generatedCaptions = [];

        const pBar = document.getElementById('captionProgressBarValue');
        const captionProgress = document.getElementById('captionProgress');
        if (captionProgress) captionProgress.classList.remove('hidden');

        function finaliseCaptions() {
            for (let i = 0; i < generatedCaptions.length - 1; i++) {
                if (generatedCaptions[i].timestamp[1] < generatedCaptions[i+1].timestamp[0])
                    generatedCaptions[i].timestamp[1] = generatedCaptions[i+1].timestamp[0];
            }
            if (generatedCaptions.length > 0)
                generatedCaptions[generatedCaptions.length-1].timestamp[1] = sourceVideo.duration || generatedCaptions[generatedCaptions.length-1].timestamp[1] + 5;
            editorPanel.classList.remove('hidden');
            populateEditor();
            actionBtn.classList.add('hidden');
            exportBtn.classList.remove('hidden');
            sourceVideo.pause(); sourceVideo.currentTime = 0;
            clearPreviewFrameHandle(); renderPreviewNow(0); updatePlayPauseLabel();
        }

        function showManualCaptionInput() {
            const existing = document.getElementById('manualCaptionBox');
            if (existing) existing.remove();
            const dur = sourceVideo ? (sourceVideo.duration || 60) : 60;
            const box = document.createElement('div');
            box.id = 'manualCaptionBox';
            box.style.margin = '16px 0';
            box.style.padding = '18px';
            box.style.background = 'rgba(20,20,50,0.97)';
            box.style.border = '2px solid rgba(255,200,0,0.6)';
            box.style.borderRadius = '14px';
            const lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:13px;font-weight:800;color:#fde047;margin-bottom:10px';
            lbl.innerHTML = 'No speech found — type captions below (each line = one card):';
            const ta = document.createElement('textarea');
            ta.id = 'manualCaptionText';
            ta.placeholder = 'Welcome!\nLesson starts here.\nThank you.';
            ta.style.cssText = 'width:100%;min-height:120px;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;padding:12px;font-family:inherit;resize:vertical;display:block;margin-top:8px';
            const burnBtn = document.createElement('button');
            burnBtn.textContent = 'Burn Captions on Video';
            burnBtn.style.cssText = 'margin-top:10px;padding:11px 24px;border:none;border-radius:10px;background:linear-gradient(135deg,#e53935,#b71c1c);color:#fff;font-size:14px;font-weight:800;cursor:pointer';
            box.appendChild(lbl); box.appendChild(ta); box.appendChild(burnBtn);
            statusText.parentElement.insertBefore(box, statusText.nextSibling);
            burnBtn.onclick = () => {
                const rawText = (ta.value || '').trim();
                if (!rawText) { alert('Please type some caption text first.'); return; }
                const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
                const vidDur = sourceVideo ? (sourceVideo.duration || 60) : 60;
                generatedCaptions = lines.map((line, i) => {
                    const start = (i / lines.length) * vidDur;
                    const end = ((i + 1) / lines.length) * vidDur;
                    const wds = line.split(/\s+/);
                    return { text: line, timestamp: [start, end], words: wds.map((w, wi) => ({ text: w, timestamp: [start + (wi/wds.length)*(end-start), start + ((wi+1)/wds.length)*(end-start)] })) };
                });
                box.remove();
                statusText.innerHTML = generatedCaptions.length + ' captions ready';
                finaliseCaptions();
            };
        }

        try {
            // PATH 1: Electron IPC — FFmpeg extracts audio, Whisper returns real word timestamps
            const hasIpc = window.electronAPI && typeof window.electronAPI.transcribeVideo === 'function';
            const videoPath = activeFile
                ? ((window.electronAPI && typeof window.electronAPI.getPathForFile === 'function')
                    ? window.electronAPI.getPathForFile(activeFile)
                    : (activeFile.path || ''))
                : '';

            if (hasIpc && videoPath) {
                statusText.innerHTML = '\u23f3 Analysing video audio with Whisper AI (30\u201390s)...';
                if (pBar) pBar.style.width = '10%';
                const ipc = await window.electronAPI.transcribeVideo({ videoPath });

                if (ipc && ipc.ok) {
                    if (pBar) pBar.style.width = '100%';

                    // No speech/audio detected in this video
                    if (!ipc.text || ipc.text.trim().length < 3) {
                        isExtractingText = false;
                        actionBtn.disabled = false;
                        statusText.innerHTML = 'No speech detected in this video audio — type your caption text below:';
                        showManualCaptionInput();
                        return;
                    }

                    // Real speech found
                    const words    = Array.isArray(ipc.words)    ? ipc.words    : [];
                    const segments = Array.isArray(ipc.segments) ? ipc.segments : [];
                    if (words.length > 0) {
                        for (let i = 0; i < words.length; i += 7) {
                            const sl = words.slice(i, i+7);
                            const txt = sl.map(w => w.word).join(' ').trim();
                            if (txt) generatedCaptions.push({ text: txt, timestamp: [sl[0].start, sl[sl.length-1].end], words: sl.map(w => ({ text: w.word, timestamp: [w.start, w.end] })) });
                        }
                    } else if (segments.length > 0) {
                        generatedCaptions = segments.filter(s => s.text && s.text.trim()).map(s => ({
                            text: s.text.trim(), timestamp: [s.start, s.end],
                            words: s.text.trim().split(/\s+/).map((w,i,a) => ({ text: w, timestamp: [s.start+(i/a.length)*(s.end-s.start), s.start+((i+1)/a.length)*(s.end-s.start)] }))
                        }));
                    } else {
                        const dur = sourceVideo.duration || 60;
                        generatedCaptions = buildLinearCaptionChunks(ipc.text, dur, { narrationDurationSec: dur });
                    }
                    statusText.innerHTML = '\u2705 ' + generatedCaptions.length + ' captions from video audio (Whisper)';
                    finaliseCaptions(); return;
                }
                console.warn('[Caption] IPC failed:', ipc && ipc.error);
                statusText.innerHTML = '\u26a0\ufe0f IPC failed \u2014 trying HTTP server...';
            }

            // PATH 2: HTTP transcription server (port 8428)
            statusText.innerHTML = '⏳ Extracting audio from video...';
            if (pBar) pBar.style.width = '5%';
            audioDataArray = await extractAudio(activeFile);
            if (pBar) pBar.style.width = '15%';
            try {
                statusText.innerHTML = '⏳ Sending to Whisper server (port 8428)...';
                const svr = await transcribeWithLocalServer(audioDataArray);
                if (pBar) pBar.style.width = '100%';
                if (svr && svr.chunks && svr.chunks.length > 0) {
                    generatedCaptions = svr.chunks;
                    statusText.innerHTML = '✅ ' + generatedCaptions.length + ' captions from video audio';
                    finaliseCaptions(); return;
                }
            } catch (svrErr) {
                console.warn('[Caption] HTTP server failed:', svrErr.message);
                statusText.innerHTML = '⚠️ Server unavailable — using browser AI...';
            }

            // PATH 3: Browser Whisper worker (offline fallback)
            if (!captionWorker) {
                statusText.innerHTML = '⏳ Initializing browser AI engine...';
                const ws = `let p,e,t=null;function s(d){if(!d)return null;try{return JSON.parse(JSON.stringify(d));}catch(x){return{status:d.status,text:d.text||'',timestamp:d.timestamp||null};}}self.onmessage=async(ev)=>{if(ev.data.type==='init'){try{if(!p){const m=await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.1');p=m.pipeline;e=m.env;e.allowLocalModels=true;e.allowRemoteModels=false;e.localModelPath=ev.data.modelPath||'http://127.0.0.1:5173/AI_Models/';e.useBrowserCache=true;}if(!t){t=await p('automatic-speech-recognition','Xenova/whisper-tiny.en',{quantized:true,progress_callback:d=>self.postMessage({type:'progress',data:s(d)})});}self.postMessage({type:'init_done'});}catch(er){self.postMessage({type:'error',error:er.message});}}else if(ev.data.type==='transcribe'){try{const r=await t(ev.data.audioDataArray,{...ev.data.options,chunk_callback:c=>self.postMessage({type:'chunk_progress',chunk:s(c),duration:ev.data.duration})});self.postMessage({type:'result',result:s(r)});}catch(er){self.postMessage({type:'error',error:er.message});}}};`;
                const blob = new Blob([ws], { type: 'application/javascript' });
                captionWorker = new Worker(URL.createObjectURL(blob));
                await new Promise((res, rej) => {
                    captionWorker.onerror = ev => rej(new Error('Worker: ' + (ev.message || 'fail')));
                    captionWorker.onmessage = ev => {
                        if (ev.data.type === 'init_done') res();
                        else if (ev.data.type === 'progress' && ev.data.data && ev.data.data.status === 'downloading') {
                            const pct = Math.round(ev.data.data.progress || 0);
                            statusText.innerHTML = '⏳ Downloading AI model: ' + pct + '%';
                            if (pBar) pBar.style.width = (15 + pct * 0.15) + '%';
                        } else if (ev.data.type === 'error') rej(new Error(ev.data.error || 'init failed'));
                    };
                    captionWorker.postMessage({ type: 'init', modelPath: window.location.origin + '/AI_Models/' });
                });
            }
            if (pBar) pBar.style.width = '30%';
            const opts = { chunk_length_s: 30, stride_length_s: 5, return_timestamps: 'word' };
            const translateCheck = document.getElementById('captionTranslateCheck');
            if (translateCheck && translateCheck.checked) opts.task = 'translate';
            const workerResult = await new Promise((res, rej) => {
                captionWorker.onerror = ev => rej(new Error('Worker crash: ' + (ev.message || 'unknown')));
                captionWorker.onmessage = ev => {
                    if (ev.data.type === 'chunk_progress' && ev.data.chunk && ev.data.chunk.timestamp && ev.data.chunk.timestamp[1] !== null) {
                        const pct = Math.min(Math.round((ev.data.chunk.timestamp[1] / (ev.data.duration || 60)) * 100), 100);
                        statusText.innerHTML = 'Transcribing... ' + pct + '%';
                        if (pBar) pBar.style.width = pct + '%';
                    } else if (ev.data.type === 'result') { if (pBar) pBar.style.width = '100%'; res(ev.data.result); }
                    else if (ev.data.type === 'error') rej(new Error(ev.data.error || 'failed'));
                };
                captionWorker.postMessage({ type: 'transcribe', audioDataArray: audioDataArray.buffer, options: opts, duration: sourceVideo.duration || 60 });
            });
            let cur = null;
            (workerResult.chunks || []).forEach(c => {
                const txt = c.text.replace(/\[.*?\]|\(.*?\)|♪|♫/g,'').trim();
                if (!txt) return;
                let ts = Array.isArray(c.timestamp) ? c.timestamp : [0,0];
                if (ts[0]===null) ts[0]=cur?cur.timestamp[1]:0;
                if (ts[1]===null) ts[1]=ts[0]+0.5;
                if (!cur) { cur={text:txt,timestamp:[...ts],words:[{text:txt,timestamp:[...ts]}]}; }
                else { cur.text+=' '+txt; cur.timestamp[1]=ts[1]; cur.words.push({text:txt,timestamp:[...ts]}); }
                if (/[.!?]$/.test(txt)||cur.words.length>=12){generatedCaptions.push(cur);cur=null;}
            });
            if (cur) generatedCaptions.push(cur);
            if (generatedCaptions.length === 0 && workerResult.text) {
                const dur = sourceVideo.duration || 60;
                generatedCaptions = buildLinearCaptionChunks(workerResult.text.replace(/\[.*?\]|\(.*?\)|♪|♫/g,'').trim(), dur, { narrationDurationSec: dur });
            }
            statusText.innerHTML = '✅ ' + generatedCaptions.length + ' captions from video audio';
            finaliseCaptions();

        } catch (error) {
            statusText.innerHTML = '❌ ' + (error.message || 'Unknown error');
            console.error('[Caption]', error);
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
                       let foundIdx = currentChunk.words.findIndex(w => {
                           const start = Array.isArray(w.timestamp) ? Number(w.timestamp[0]) : NaN;
                           const rawEnd = Array.isArray(w.timestamp) ? Number(w.timestamp[1]) : NaN;
                           const end = Number.isFinite(rawEnd) ? rawEnd : (Number.isFinite(start) ? start + 0.2 : NaN);
                           return Number.isFinite(start) && Number.isFinite(end) && adjustedTime >= start && adjustedTime < end;
                       });
                       if (foundIdx === -1) {
                           foundIdx = currentChunk.words.findIndex(w => {
                               const start = Array.isArray(w.timestamp) ? Number(w.timestamp[0]) : NaN;
                               return Number.isFinite(start) && adjustedTime < start;
                           });
                       }
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

    function getCaptionSourcePath() {
        try {
            if (!activeFile) return "";
            if (window.electronAPI && typeof window.electronAPI.getPathForFile === 'function') {
                return window.electronAPI.getPathForFile(activeFile) || "";
            }
            return activeFile.path || "";
        } catch (error) {
            console.warn('[Caption Export] Could not read source file path:', error);
            return "";
        }
    }

    function getCaptionSyncOffsetSeconds() {
        const rawValue = syncSlider ? Number(syncSlider.value) : 0;
        return Number.isFinite(rawValue) ? rawValue / 1000 : 0;
    }

    function getValidatedCaptionBurnList() {
        const duration = Number(sourceVideo.duration) || 0;
        const syncOffset = getCaptionSyncOffsetSeconds();
        const sorted = (generatedCaptions || [])
            .map((caption) => {
                const timestamp = Array.isArray(caption.timestamp) ? caption.timestamp : [0, 0];
                const start = Math.max(0, Number(timestamp[0]) + syncOffset);
                const rawEnd = Number(timestamp[1]);
                const end = Math.max(start + 0.12, (Number.isFinite(rawEnd) ? rawEnd : timestamp[0] + 2) + syncOffset);
                return {
                    text: String(caption.text || '').replace(/\s+/g, ' ').trim(),
                    start,
                    end: duration > 0 ? Math.min(end, duration) : end
                };
            })
            .filter((caption) => caption.text && caption.end > caption.start)
            .sort((a, b) => a.start - b.start);

        for (let index = 0; index < sorted.length - 1; index += 1) {
            if (sorted[index].end > sorted[index + 1].start) {
                sorted[index].end = Math.max(sorted[index].start + 0.12, sorted[index + 1].start - 0.02);
            }
        }
        return sorted;
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

    exportBtn.addEventListener('click', async () => {
        if (isRecording) return;
        isRecording = true;
        exportBtn.textContent = '\u26a1 Express Export...';
        exportBtn.disabled = true;

        // -- FAST PATH: FFmpeg burn-in via IPC (instant - no video playback needed) --
        const _filePath = getCaptionSourcePath();
        const _hasIpc   = window.electronAPI && typeof window.electronAPI.burnCaptions === 'function';
        const _styleName = styleSelect ? styleSelect.value : 'default';
        const _needsAnimatedCanvas = (_styleName && _styleName !== 'classic')
            || (karaokeCheck && karaokeCheck.checked)
            || (emojiCheck && emojiCheck.checked)
            || (brollCheck && brollCheck.checked)
            || (progressCheck && progressCheck.checked);

        if (!_needsAnimatedCanvas && _filePath && _hasIpc && generatedCaptions && generatedCaptions.length > 0) {
            try {
                const captionsForBurn = getValidatedCaptionBurnList();
                if (!captionsForBurn.length) {
                    throw new Error('No valid caption timings are available for export.');
                }
                statusText.innerHTML = '\u26a1 Sync export: burning timestamp-locked captions with FFmpeg...';
                const _fontSize = Math.max(18, Math.round((Number(sizeSlider && sizeSlider.value) || 80) * 0.55));
                const _result = await window.electronAPI.burnCaptions({
                    videoPath: _filePath,
                    captions: captionsForBurn,
                    style: _styleName,
                    fontSize: _fontSize,
                    position: 'bottom'
                });
                if (_result && _result.ok) {
                    statusText.innerHTML = '\u2705 Synced caption export done! Saved to Downloads: <strong>' + (_result.fileName || 'captioned video') + '</strong>.';
                    exportBtn.textContent = 'Export Result';
                    exportBtn.disabled = false;
                    isRecording = false;
                    console.log('[Caption Export] FFmpeg express export done:', _result.outputPath);
                    if (window.electronAPI && typeof window.electronAPI.showItemInFolder === 'function' && _result.outputPath) {
                        window.electronAPI.showItemInFolder(_result.outputPath);
                    }
                    if (window.electronAPI && window.electronAPI.showNotification) {
                        window.electronAPI.showNotification('Caption Export', 'Synced caption export done!');
                    }
                    return;
                }
                throw new Error((_result && _result.error) || 'FFmpeg caption export failed.');
            } catch (_ffErr) {
                console.warn('[Caption Export] FFmpeg IPC failed, falling back to recorder:', _ffErr.message);
                statusText.innerHTML = '\u26a0\ufe0f FFmpeg synced export failed - using recorder fallback. ' + (_ffErr.message || '');
            }
        }

        // -- FALLBACK: MediaRecorder (all 3 bugs fixed) --

        // FIX 1: Silence to speakers (muted + volume=0)
        const _origMuted  = sourceVideo.muted;
        const _origVolume = sourceVideo.volume;
        sourceVideo.muted  = true;
        sourceVideo.volume = 0;
        sourceVideo.pause();
        sourceVideo.playbackRate = 1.0;

        // FIX 2: Wait for seeked BEFORE starting recorder (prevents 2-sec truncation bug)
        await new Promise(resolve => {
            if (Math.abs(sourceVideo.currentTime) < 0.05) { resolve(); return; }
            sourceVideo.addEventListener('seeked', resolve, { once: true });
            sourceVideo.currentTime = 0;
        });
        sourceVideo.currentTime = 0;
        await new Promise(r => setTimeout(r, 80));

        const _duration = sourceVideo.duration || 0;
        if (!_duration || !isFinite(_duration)) {
            statusText.innerHTML = '\u274c Cannot export: video duration unknown. Try reloading the video.';
            isRecording = false; exportBtn.textContent = 'Export Result'; exportBtn.disabled = false;
            sourceVideo.muted = _origMuted; sourceVideo.volume = _origVolume;
            return;
        }

        const _expW = sourceVideo.videoWidth  || renderCanvas.width;
        const _expH = sourceVideo.videoHeight || renderCanvas.height;
        const _expCanvas = document.createElement('canvas');
        _expCanvas.width = _expW; _expCanvas.height = _expH;
        const _expCtx = _expCanvas.getContext('2d', { alpha: false });
        const _expFps = 30;
        const _expMs  = Math.round(1000 / _expFps);

        renderCaptionFrame(_expCtx, _expW, _expH, 0, { isPreviewSurface: false });

        const _stream = _expCanvas.captureStream(_expFps);

        // FIX 3: AudioContext routes audio to recording ONLY (NOT to speakers)
        let _expAudioCtx = null;
        try {
            _expAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const _dest = _expAudioCtx.createMediaStreamDestination();
            const _src  = _expAudioCtx.createMediaElementSource(sourceVideo);
            _src.connect(_dest); // recording stream ONLY - no connect to _expAudioCtx.destination
            const _aTracks = _dest.stream.getAudioTracks();
            if (_aTracks.length > 0) _stream.addTrack(_aTracks[0]);
        } catch (_aErr) {
            console.warn('[Caption Export] AudioContext failed, exporting video-only:', _aErr.message);
        }

        let _opts = { mimeType: 'video/webm; codecs=vp9' };
        let _ext  = 'webm';
        if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.4d4028, mp4a.40.2"')) {
            _opts = { mimeType: 'video/mp4; codecs="avc1.4d4028, mp4a.40.2"' }; _ext = 'mp4';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            _opts = { mimeType: 'video/mp4' }; _ext = 'mp4';
        } else if (!MediaRecorder.isTypeSupported(_opts.mimeType)) {
            _opts = { mimeType: 'video/webm; codecs=vp8' };
        }
        _opts.videoBitsPerSecond = 12000000;

        const _rec    = new MediaRecorder(_stream, _opts);
        const _chunks = [];
        let   _expDone   = false;
        let   _loopTimer = null;
        let   _progTimer = null;
        let   _watchdog  = null;

        _rec.ondataavailable = e => { if (e.data.size > 0) _chunks.push(e.data); };

        const _finishExport = () => {
            if (_expDone) return;
            _expDone = true;
            if (_loopTimer) { clearInterval(_loopTimer); _loopTimer = null; }
            if (_progTimer) { clearInterval(_progTimer); _progTimer = null; }
            if (_watchdog)  { clearTimeout(_watchdog);  _watchdog  = null; }
            try { renderCaptionFrame(_expCtx, _expW, _expH, _duration, { isPreviewSurface: false }); } catch(e) {}
            _rec.requestData();
            setTimeout(() => { try { _rec.stop(); } catch(e) {} }, 200);
        };

        _rec.onstop = () => {
            if (_loopTimer) clearInterval(_loopTimer);
            if (_progTimer) clearInterval(_progTimer);
            if (_watchdog)  clearTimeout(_watchdog);

            const _blob = new Blob(_chunks, { type: _opts.mimeType.split(';')[0] });
            const _url  = URL.createObjectURL(_blob);
            const _a    = document.createElement('a');
            _a.href = _url; _a.download = 'captioned_video.' + _ext; _a.click();
            URL.revokeObjectURL(_url);

            isRecording = false;
            exportBtn.textContent = 'Export Result';
            exportBtn.disabled    = false;
            statusText.innerHTML  = '\u2705 Export complete! <strong>captioned_video.' + _ext + '</strong> saved to Downloads.';

            sourceVideo.pause(); sourceVideo.currentTime = 0;
            sourceVideo.muted = _origMuted; sourceVideo.volume = _origVolume;
            renderPreviewNow(0); updatePlayPauseLabel();
            _stream.getTracks().forEach(t => t.stop());
            if (_expAudioCtx) { try { _expAudioCtx.close(); } catch(e) {} }
            console.log('[Caption Export] Done. Duration:', _duration.toFixed(2) + 's, chunks:', _chunks.length);
            if (window.electronAPI && window.electronAPI.showNotification) {
                window.electronAPI.showNotification('Caption Export', 'Captioned video exported successfully!');
            }
        };

        const _runLoop = () => {
            if (_expDone) return;
            renderCaptionFrame(_expCtx, _expW, _expH, sourceVideo.currentTime, { isPreviewSurface: false });
        };

        // FIX 4: recorder.start(250) with timeslice - ensures data collected throughout (not just on stop)
        _rec.start(250);
        _loopTimer = setInterval(_runLoop, _expMs);
        _runLoop();

        // Real-time 0-100% progress indicator
        _progTimer = setInterval(() => {
            if (_expDone || !isRecording) return;
            const _ct  = sourceVideo.currentTime;
            const _pct = _duration > 0 ? Math.min(100, Math.round((_ct / _duration) * 100)) : 0;
            statusText.innerHTML = '\ud83c\udf9e\ufe0f Exporting captioned video: <strong>' + _pct + '%</strong>&nbsp;&nbsp;(' + _ct.toFixed(1) + 's / ' + _duration.toFixed(1) + 's) \u2014 please wait\u2026';
            exportBtn.textContent = '\u23f3 Exporting ' + _pct + '%';
        }, 500);

        // FIX 5: Safety watchdog - force stop if ended event never fires
        _watchdog = setTimeout(() => {
            console.warn('[Caption Export] Watchdog triggered at', _duration + 5, 's');
            _finishExport();
        }, (_duration + 5) * 1000);

        statusText.innerHTML = '\ud83c\udf9e\ufe0f Exporting captioned video: <strong>0%</strong>&nbsp;&nbsp;(0.0s / ' + _duration.toFixed(1) + 's) \u2014 please wait\u2026';

        try { await sourceVideo.play(); } catch(_pErr) {
            console.warn('[Caption Export] play() rejected:', _pErr);
        }

        // FIX 6: ended event stops recording at true video end
        sourceVideo.addEventListener('ended', () => {
            if (!isRecording) return;
            _finishExport();
        }, { once: true });
    });


    // stageCaptionExportBtn is handled by script.js — do not add a second listener here.


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
