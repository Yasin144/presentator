import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Sidebar } from './Sidebar';
import { ReaderStage } from './ReaderStage';
import { PlaybackBar } from './PlaybackBar';

const PRESENTATION_EXPORT_TAIL_PAD_MS = 2500;
const INTRO_VIDEO_SRC = '/default-intro-optimized.mp4';
const INFO_KIDS_LOGO_SRC = '/info-kids-logo.png';

// WAV Encoder helper to convert concatenated AudioBuffer to standard WAV bytes
function bufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let offset = 0;
  let pos = 0;

  const writeString = (s) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(pos + i, s.charCodeAt(i));
    }
    pos += s.length;
  };

  writeString('RIFF');
  view.setUint32(pos, length - 8, true); pos += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(pos, 16, true); pos += 4;
  view.setUint16(pos, 1, true); pos += 2;
  view.setUint16(pos, numOfChan, true); pos += 2;
  view.setUint32(pos, buffer.sampleRate, true); pos += 4;
  view.setUint32(pos, buffer.sampleRate * 2 * numOfChan, true); pos += 4;
  view.setUint16(pos, numOfChan * 2, true); pos += 2;
  view.setUint16(pos, 16, true); pos += 2;
  writeString('data');
  view.setUint32(pos, length - pos - 4, true); pos += 4;

  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return bufferArr;
}

function base64ToUint8Array(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function getAudioDurationMsFromBytes(bytes) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  try {
    const decoded = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
    if (Number.isFinite(decoded.duration) && decoded.duration > 0) {
      return Math.round(decoded.duration * 1000);
    }
  } finally {
    if (typeof audioCtx.close === 'function') {
      audioCtx.close().catch(() => {});
    }
  }

  return 0;
}

function getFiniteMediaDurationMs(audio) {
  const duration = Number(audio?.duration);
  return Number.isFinite(duration) && duration > 0 ? Math.round(duration * 1000) : 0;
}

function getBlobVideoDurationMs(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement('video');
    let settled = false;

    const finish = (durationMs = 0) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
      resolve(durationMs);
    };

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Number(video.duration);
      finish(Number.isFinite(duration) && duration > 0 ? Math.round(duration * 1000) : 0);
    };
    video.onerror = () => finish(0);
    setTimeout(() => finish(0), 5000);
    video.src = url;
  });
}

function createObjectUrlAudio(base64, mimeType) {
  const bytes = base64ToUint8Array(base64);
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  const audio = new Audio(url);
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true });
  audio.addEventListener('error', () => URL.revokeObjectURL(url), { once: true });
  return { audio, url };
}

async function narrateEdgeTimedCompat(payload) {
  const api = window.electronAPI;
  if (!api) throw new Error('Electron narration bridge is unavailable.');
  if (typeof api.narrateEdgeTtsTimed === 'function') {
    try {
      const result = await api.narrateEdgeTtsTimed(payload);
      if (result?.ok) return { ...result, wordTimings: Array.isArray(result.wordTimings) ? result.wordTimings : [] };
      if (result?.error && !/no handler registered/i.test(String(result.error))) return result;
    } catch (error) {
      if (!/no handler registered/i.test(String(error?.message || error))) throw error;
    }
  }
  if (typeof api.narrateEdgeTts !== 'function') throw new Error('Edge TTS narration is unavailable.');
  const result = await api.narrateEdgeTts(payload);
  return { ...result, wordTimings: Array.isArray(result?.wordTimings) ? result.wordTimings : [] };
}

function waitForAudioReady(audio, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let intervalId = null;
    let timeoutId = null;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', checkReady);
      audio.removeEventListener('canplay', checkReady);
      audio.removeEventListener('canplaythrough', checkReady);
      audio.removeEventListener('error', handleError);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };

    function checkReady() {
      if (audio.readyState >= 2) {
        cleanup();
        resolve();
      }
    }

    function handleError() {
      cleanup();
      reject(new Error(audio.error?.message || 'Audio file failed to load for recording. Please verify the speech configuration.'));
    }

    audio.addEventListener('loadedmetadata', checkReady);
    audio.addEventListener('canplay', checkReady);
    audio.addEventListener('canplaythrough', checkReady);
    audio.addEventListener('error', handleError);
    intervalId = setInterval(checkReady, 100);
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Audio loading timed out (15s limit). The narration server may be slow.'));
    }, timeoutMs);

    audio.load();
    checkReady();
  });
}

async function uploadMuxFileInChunks(sessionId, target, blob, onProgress) {
  const chunkSize = 1024 * 1024;
  let uploaded = 0;

  for (let offset = 0; offset < blob.size; offset += chunkSize) {
    const chunk = blob.slice(offset, Math.min(offset + chunkSize, blob.size));
    const response = await fetch(
      `http://127.0.0.1:8430/api/mux-upload-chunk?sessionId=${encodeURIComponent(sessionId)}&target=${encodeURIComponent(target)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: await chunk.arrayBuffer()
      }
    );

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || `Mux upload failed for ${target}.`);
    }

    uploaded += chunk.size;
    onProgress?.(uploaded, blob.size);
  }
}

async function muxPresentationWithChunkUpload({ videoBlob, audioBlob, metadata, onProgress }) {
  const sessionResponse = await fetch('http://127.0.0.1:8430/api/mux-upload-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  });

  if (!sessionResponse.ok) {
    const result = await sessionResponse.json().catch(() => ({}));
    throw new Error(result.error || 'Could not start mux upload session.');
  }

  const session = await sessionResponse.json();
  if (!session.ok || !session.sessionId) {
    throw new Error(session.error || 'Mux upload session did not return a session id.');
  }

  await uploadMuxFileInChunks(session.sessionId, 'video-0', videoBlob, (done, total) => {
    onProgress?.(`Uploading video (${Math.round((done / total) * 100)}%)...`);
  });
  await uploadMuxFileInChunks(session.sessionId, 'audio', audioBlob, (done, total) => {
    onProgress?.(`Uploading audio (${Math.round((done / total) * 100)}%)...`);
  });

  const completeResponse = await fetch('http://127.0.0.1:8430/api/mux-upload-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: session.sessionId })
  });

  const result = await completeResponse.json().catch(() => ({}));
  if (!completeResponse.ok || !result.ok) {
    throw new Error(result.error || `Mux server returned HTTP ${completeResponse.status}`);
  }

  return result;
}

function waitForNextPaint() {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function waitForVideoReady(video, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (!video || video.readyState >= 2) {
      resolve();
      return;
    }

    let timeoutId = null;
    const cleanup = () => {
      video.removeEventListener('loadeddata', handleReady);
      video.removeEventListener('canplay', handleReady);
      video.removeEventListener('error', handleReady);
      clearTimeout(timeoutId);
    };
    const handleReady = () => {
      cleanup();
      resolve();
    };

    video.addEventListener('loadeddata', handleReady);
    video.addEventListener('canplay', handleReady);
    video.addEventListener('error', handleReady);
    timeoutId = setTimeout(handleReady, timeoutMs);
    video.load();
  });
}

function waitForImageReady(image, timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (!image || (image.complete && (image.naturalWidth || image.width))) {
      resolve();
      return;
    }

    let timeoutId = null;
    const cleanup = () => {
      image.removeEventListener('load', handleReady);
      image.removeEventListener('error', handleReady);
      clearTimeout(timeoutId);
    };
    const handleReady = () => {
      cleanup();
      resolve();
    };

    image.addEventListener('load', handleReady);
    image.addEventListener('error', handleReady);
    timeoutId = setTimeout(handleReady, timeoutMs);
  });
}

async function playIntroVideo(video) {
  if (!video) return false;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  await waitForVideoReady(video);
  try {
    video.currentTime = 0;
  } catch {
    // Some media backends reject seeking before metadata is fully settled.
  }
  try {
    await video.play();
    return true;
  } catch (error) {
    console.warn('[Presentation] Intro video could not start automatically.', error);
    return false;
  }
}

function drawElementRectOnCanvas(ctx, mediaElement, elementRect, stageRect, canvasWidth, canvasHeight) {
  const x = ((elementRect.left - stageRect.left) / stageRect.width) * canvasWidth;
  const y = ((elementRect.top - stageRect.top) / stageRect.height) * canvasHeight;
  const width = (elementRect.width / stageRect.width) * canvasWidth;
  const height = (elementRect.height / stageRect.height) * canvasHeight;
  ctx.drawImage(mediaElement, x, y, width, height);
}

function drawObjectCoverVideo(ctx, video, stageRect, canvasWidth, canvasHeight) {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

  const videoRatio = video.videoWidth / video.videoHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (videoRatio > canvasRatio) {
    sourceWidth = video.videoHeight * canvasRatio;
    sourceX = (video.videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = video.videoWidth / canvasRatio;
    sourceY = (video.videoHeight - sourceHeight) / 2;
  }

  const rect = video.getBoundingClientRect();
  const x = ((rect.left - stageRect.left) / stageRect.width) * canvasWidth;
  const y = ((rect.top - stageRect.top) / stageRect.height) * canvasHeight;
  const width = (rect.width / stageRect.width) * canvasWidth;
  const height = (rect.height / stageRect.height) * canvasHeight;

  ctx.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );
}

function getSupportedPresentationVideoMimeType() {
  const mimeTypes = [
    'video/webm;codecs=vp8',
    'video/webm;codecs=vp9',
    'video/webm'
  ];
  return mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
}

function createPresentationMediaRecorder(stream, videoBitsPerSecond = 12000000) {
  const safeBitrate = Math.min(Math.max(videoBitsPerSecond, 8000000), 20000000);
  const candidateMimeTypes = [
    getSupportedPresentationVideoMimeType(),
    'video/webm'
  ];

  let lastError = null;
  for (const mimeType of candidateMimeTypes.filter(Boolean)) {
    try {
      return new MediaRecorder(stream, { mimeType, videoBitsPerSecond: safeBitrate });
    } catch (error) {
      lastError = error;
      console.warn('[Presentation Export] MediaRecorder candidate failed:', mimeType, error);
    }
  }

  if (lastError) throw lastError;
  return new MediaRecorder(stream, { videoBitsPerSecond: safeBitrate });
}

async function stopPresentationMediaRecorder(recorder) {
  if (!recorder || recorder.state === 'inactive') return;

  try {
    if (typeof recorder.requestData === 'function') {
      recorder.requestData();
    }
  } catch (error) {
    console.warn('[Presentation Export] requestData before stop failed:', error);
  }

  await waitForNextPaint();
  await new Promise(resolve => setTimeout(resolve, 250));

  if (recorder.state !== 'inactive') {
    recorder.stop();
  }
}

async function captureStageToCanvas(stageElement, targetCanvas) {
  const rect = stageElement.getBoundingClientRect();
  const snapshot = await html2canvas(stageElement, {
    backgroundColor: null,
    logging: false,
    useCORS: true,
    allowTaint: true,
    width: Math.max(1, Math.round(rect.width)),
    height: Math.max(1, Math.round(rect.height)),
    windowWidth: Math.max(1, Math.round(rect.width)),
    windowHeight: Math.max(1, Math.round(rect.height)),
    scale: 1
  });

  const ctx = targetCanvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  ctx.drawImage(snapshot, 0, 0, targetCanvas.width, targetCanvas.height);

  const introVideo = stageElement.querySelector('[data-stage-intro-video="true"]');
  const logoImage = stageElement.querySelector('[data-info-kids-logo="true"]');
  drawObjectCoverVideo(ctx, introVideo, rect, targetCanvas.width, targetCanvas.height);
  if (logoImage?.complete && (logoImage.naturalWidth || logoImage.width)) {
    drawElementRectOnCanvas(
      ctx,
      logoImage,
      logoImage.getBoundingClientRect(),
      rect,
      targetCanvas.width,
      targetCanvas.height
    );
  }
}

async function createStageCanvasCapture({ stageElement, durationMs, onProgress }) {
  if (!stageElement) {
    throw new Error('Presentation stage was not ready for export capture.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  await captureStageToCanvas(stageElement, canvas);

  let stream = null;
  let usesManualFrameRequests = false;
  try {
    stream = canvas.captureStream(0);
    const manualTrack = stream.getVideoTracks().find(track => track.kind === 'video');
    if (manualTrack && typeof manualTrack.requestFrame === 'function') {
      usesManualFrameRequests = true;
    } else {
      stream.getTracks().forEach(track => track.stop());
      stream = canvas.captureStream(30);
    }
  } catch (error) {
    console.warn('[Presentation Export] manual canvas capture is not available; using timed capture.', error);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    stream = canvas.captureStream(30);
  }
  const [track] = stream.getVideoTracks();
  const startTime = performance.now();
  let stopped = false;

  const frameLoop = async () => {
    while (!stopped) {
      const elapsedMs = performance.now() - startTime;
      if (elapsedMs >= durationMs) break;

      await captureStageToCanvas(stageElement, canvas);
      if (usesManualFrameRequests && typeof track?.requestFrame === 'function') {
        track.requestFrame();
      }

      const pct = Math.min(100, Math.round((elapsedMs / durationMs) * 100));
      onProgress?.(pct, elapsedMs);
      await new Promise(resolve => setTimeout(resolve, 33));
    }

    if (!stopped) {
      await captureStageToCanvas(stageElement, canvas);
      if (usesManualFrameRequests && typeof track?.requestFrame === 'function') {
        track.requestFrame();
      }
      onProgress?.(100, durationMs);
    }
  };

  const loopPromise = frameLoop();
  return {
    stream,
    stop: () => {
      stopped = true;
      stream.getTracks().forEach(track => track.stop());
    },
    loopPromise
  };
}

export default function PresentationApp({ active = true }) {
  // --- Core State ---
  const [context, setContext] = useState('The screen was dark for a moment. Then, character by character, the words began to appear. It felt less like a computer program and more like someone was there, typing just for me. No gimmicks, no 3D tricks—just the raw, beautiful rhythm of a story being told in real-time.');
  const [isPresenting, setIsPresenting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [speechRate] = useState(0.9);
  
  // --- UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- Voice / Engine States ---
  const [engine, setEngine] = useState('edge'); // 'native', 'edge', or 'sc3'
  const [selectedEdgeVoice, setSelectedEdgeVoice] = useState('en-US-JennyNeural');
  const [selectedSc3Voice, setSelectedSc3Voice] = useState('sc3');
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  
  // --- Intro / Poster States ---
  const [playIntro, setPlayIntro] = useState(false);
  const [posterImage, setPosterImage] = useState(null);
  const [posterFileName, setPosterFileName] = useState('');
  const [posterDuration, setPosterDuration] = useState(3);
  const [playbackPhase, setPlaybackPhase] = useState('idle'); // 'idle' | 'intro' | 'poster' | 'narration'

  // --- Export State ---
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('0%');
  const [exportFileName, setExportFileName] = useState('presentation-video.mp4');

  // --- Theme State ---
  const [theme, setTheme] = useState({
    fontSize: 72,
    fontFamily: 'Inter',
    textColor: 'rgba(255,255,255,0.4)',
    accentColor: '#ffffff',
    boardBg: 'transparent',
    pageBg: '#0a0a0a',
    animationStyle: 'typewriter',
    animationSpeed: 1.2,
    backgroundType: 'none',
    textAlign: 'left',
    wordSpacing: 0.25,
    lineHeight: 1.3,
    rowGap: 0.4,
    horizontalPadding: 80,
    verticalPadding: 160,
    gradient: 'none',
  });

  // --- Refs ---
  const audioRef = useRef(null);
  const animationFrameId = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const stageRef = useRef(null);
  const stageCaptureRef = useRef(null);
  const edgeAudioBase64Ref = useRef('');
  // Stores exact word-level timestamps from Edge TTS WordBoundary events:
  // Array of { word: string, startMs: number, endMs: number }
  const edgeWordTimingsRef = useRef([]);
  const sc3AudioBase64Ref = useRef('');
  
  const introVideoRef = useRef(null);
  const introFallbackTimeoutRef = useRef(null);
  const posterTimeoutRef = useRef(null);
  const posterStartTimeRef = useRef(0);
  const posterRemainingTimeRef = useRef(0);
  const decodedIntroBufferRef = useRef(null);

  // Clear audio caches when text or voice configuration changes
  useEffect(() => {
    edgeAudioBase64Ref.current = '';
    edgeWordTimingsRef.current = [];
    sc3AudioBase64Ref.current = '';
  }, [context, selectedEdgeVoice, selectedSc3Voice, theme.animationSpeed]);

  useEffect(() => {
    const isShowingFull = isPresenting || isExporting;
    const event = new CustomEvent('presentation-state-change', {
      detail: { isPresenting: isShowingFull }
    });
    window.dispatchEvent(event);
  }, [isPresenting, isExporting]);

  // --- Voice State ---
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // --- Word Logic ---
  const wordData = useMemo(() => {
    const data = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(context)) !== null) {
      const prevEnd = data.length > 0 ? data[data.length - 1].index + data[data.length - 1].text.length : 0;
      const gap = context.substring(prevEnd, match.index);
      const startsNewLine = gap.includes('\n') || data.length === 0;

      data.push({ 
        text: match[0], 
        index: match.index, 
        startsNewLine 
      });
    }
    return data;
  }, [context]);

  useEffect(() => {
    if (!active) {
      if (window.speechSynthesis.onvoiceschanged) window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
      return undefined;
    }
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;
      
      const enVoices = allVoices.filter(v => v.lang.startsWith('en'));
      setAvailableVoices(enVoices.length > 0 ? enVoices : allVoices);
      
      if (!selectedVoice) {
        const preferred = enVoices.find(v => 
          ['samantha', 'victoria', 'jenny', 'karen', 'daniel'].some(k => v.name.toLowerCase().includes(k))
        );
        setSelectedVoice(preferred || enVoices[0] || allVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Global Styles Injection
    const id = 'magic-reader-styles-v5';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;900&family=Arvo:wght@400;700&family=Inter:wght@400;900&family=Space+Grotesk:wght@300;700&family=Syne:wght@400;800&family=JetBrains+Mono:wght@400;800&family=Playfair+Display:wght@400;700;900&display=swap';
      document.head.appendChild(link);

      const style = document.createElement('style');
      style.id = 'magic-global-css';
      style.textContent = `
        .magic-reader-body { margin: 0; padding: 0; width: 100%; height: 100%; background: #0a0a0a; overflow: hidden; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .dark-scrollbar { scrollbar-width: none; }
        .dark-scrollbar::-webkit-scrollbar { display: none; }
        
        @keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-cursor { animation: cursor-blink 0.6s infinite; }
        
        @keyframes mesh-drift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-mesh { background-size: 200% 200%; animation: mesh-drift 15s ease infinite; }

        @keyframes star-twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .animate-twinkle { animation: star-twinkle var(--duration, 3s) infinite ease-in-out; }

        @keyframes blob-move { 
          0% { transform: translate(0, 0) scale(1); } 
          33% { transform: translate(30px, -50px) scale(1.1); } 
          66% { transform: translate(-20px, 20px) scale(0.9); } 
          100% { transform: translate(0, 0) scale(1); } 
        }
        .animate-blob { animation: blob-move 10s infinite alternate ease-in-out; }

        @keyframes wave-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-waves { animation: wave-scroll 20s linear infinite; }
      `;
      document.head.appendChild(style);
    }

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
      clearTimeout(introFallbackTimeoutRef.current);
      clearTimeout(posterTimeoutRef.current);
    };
  }, [active, selectedVoice]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.dataset?.objectUrl) {
        URL.revokeObjectURL(audioRef.current.dataset.objectUrl);
      }
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.oncanplaythrough = null;
      audioRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      clearTimeout(animationFrameId.current);
      animationFrameId.current = null;
    }
    clearTimeout(introFallbackTimeoutRef.current);
    clearTimeout(posterTimeoutRef.current);
  }, []);

  // Concatenate multiple AudioBuffers (intro WAV, poster silence, narration) into a single WAV base64
  const getCombinedAudioBase64 = async (narrationBase64) => {
    if (!playIntro && (!posterImage || posterDuration <= 0)) {
      return narrationBase64;
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffers = [];

    // 1. Fetch and decode intro WAV audio
    if (playIntro) {
      try {
        const response = await fetch('/default-intro.wav');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuf = await response.arrayBuffer();
        const introBuffer = await audioCtx.decodeAudioData(arrayBuf);
        buffers.push(introBuffer);
        decodedIntroBufferRef.current = introBuffer;
      } catch (err) {
        console.error('Failed to load default-intro.wav, using silent fallback:', err);
        const silentIntro = audioCtx.createBuffer(1, audioCtx.sampleRate * 3.5, audioCtx.sampleRate);
        buffers.push(silentIntro);
        decodedIntroBufferRef.current = silentIntro;
      }
    } else {
      decodedIntroBufferRef.current = null;
    }

    // 2. Add poster silence
    if (posterImage && posterDuration > 0) {
      const silentPoster = audioCtx.createBuffer(
        1,
        audioCtx.sampleRate * Number(posterDuration),
        audioCtx.sampleRate
      );
      buffers.push(silentPoster);
    }

    // 3. Decode Edge TTS narration
    try {
      const audioBytes = base64ToUint8Array(narrationBase64);
      const arrayBuf = audioBytes.buffer;
      const narrationBuffer = await audioCtx.decodeAudioData(arrayBuf.slice(0));
      buffers.push(narrationBuffer);
    } catch (err) {
      console.error('Failed to decode narration audio:', err);
      throw new Error('Failed to parse narration audio.');
    }

    // 4. Concatenate
    const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
    const numberOfChannels = Math.max(...buffers.map(b => b.numberOfChannels));
    const sampleRate = buffers[0].sampleRate;
    const combinedBuffer = audioCtx.createBuffer(numberOfChannels, totalLength, sampleRate);

    let offset = 0;
    buffers.forEach((buffer) => {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        if (channel < buffer.numberOfChannels) {
          combinedBuffer.getChannelData(channel).set(
            buffer.getChannelData(channel),
            offset
          );
        }
      }
      offset += buffer.length;
    });

    const wavArrayBuf = bufferToWav(combinedBuffer);
    const uint8 = new Uint8Array(wavArrayBuf);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    await audioCtx.close().catch(() => {});
    return btoa(binary);
  };

  const handlePreviewVoice = useCallback(async () => {
    window.speechSynthesis.cancel();
    stopAudio();

    const previewText = "Hello! This is a preview of the selected narration voice.";

    if (engine === 'native') {
      const utterance = new SpeechSynthesisUtterance(previewText);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    } else if (engine === 'edge') {
      try {
        const result = await window.electronAPI.narrateEdgeTts({
          text: previewText,
          voice: selectedEdgeVoice,
          rate: '+0%'
        });
        if (!result.ok) {
          throw new Error(result.error || 'Voice preview generation failed.');
        }
        const { audio, url } = createObjectUrlAudio(result.audioBase64, 'audio/mpeg');
        audio.dataset.objectUrl = url;
        audioRef.current = audio;
        await audio.play();
      } catch (err) {
        console.error('Edge Voice Preview error:', err);
        setErrorModal({
          isOpen: true,
          title: 'Edge Voice Preview Error',
          message: err.message
        });
      }
    } else if (engine === 'sc3') {
      try {
        const result = await window.electronAPI.narrateSc3Tts({
          text: previewText,
          voice: selectedSc3Voice
        });
        if (!result.ok) {
          throw new Error(result.error || 'SC3 voice preview generation failed.');
        }
        const { audio, url } = createObjectUrlAudio(result.audioBase64, 'audio/wav');
        audio.dataset.objectUrl = url;
        audioRef.current = audio;
        await audio.play();
      } catch (err) {
        console.error('SC3 Voice Preview error:', err);
        setErrorModal({
          isOpen: true,
          title: 'SC3 Voice Preview Error',
          message: err.message
        });
      }
    }
  }, [engine, selectedVoice, selectedEdgeVoice, selectedSc3Voice, speechRate, stopAudio]);

  const triggerVoiceNarration = useCallback(async () => {
    setActiveWordIndex(0);

    if (engine === 'native') {
      const utterance = new SpeechSynthesisUtterance(context);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = speechRate;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIdx = event.charIndex;
          let matchedIdx = -1;
          for (let k = 0; k < wordData.length; k++) {
            if (wordData[k].index === charIdx) {
              matchedIdx = k;
              break;
            }
            if (wordData[k].index < charIdx && (k === wordData.length - 1 || wordData[k+1].index > charIdx)) {
              matchedIdx = k;
            }
          }
          if (matchedIdx !== -1) {
            setActiveWordIndex(matchedIdx);
          }
        }
      };

      utterance.onend = () => {
        setIsPresenting(false);
        setPlaybackPhase('idle');
        setActiveWordIndex(-1);
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis Error:', e);
        setIsPresenting(false);
        setPlaybackPhase('idle');
        setActiveWordIndex(-1);
        setErrorModal({
          isOpen: true,
          title: 'SpeechSynthesis Error',
          message: 'An error occurred during local SpeechSynthesis. Please try another voice.'
        });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      try {
        let audioBase64 = '';
        let audioType = 'audio/mpeg';

        if (engine === 'edge') {
          const pct = Math.round((theme.animationSpeed - 1.0) * 100);
          const rateStr = pct >= 0 ? `+${pct}%` : `${pct}%`;

          audioBase64 = edgeAudioBase64Ref.current;
          if (!audioBase64) {
            // Use the NEW timed endpoint to get audio + exact WordBoundary timestamps
            const result = await narrateEdgeTimedCompat({
              text: context,
              voice: selectedEdgeVoice,
              rate: rateStr
            });
            if (!result.ok) throw new Error(result.error || 'Edge TTS failed.');
            audioBase64 = result.audioBase64;
            edgeAudioBase64Ref.current = audioBase64;
            // Store the exact word timestamps — array of {word, startMs, endMs}
            edgeWordTimingsRef.current = result.wordTimings || [];
          }
          audioType = 'audio/mpeg';
        } else if (engine === 'sc3') {
          audioBase64 = sc3AudioBase64Ref.current;
          if (!audioBase64) {
            const result = await window.electronAPI.narrateSc3Tts({
              text: context,
              voice: selectedSc3Voice
            });
            if (!result.ok) throw new Error(result.error || 'SC3 TTS failed.');
            audioBase64 = result.audioBase64;
            sc3AudioBase64Ref.current = audioBase64;
          }
          audioType = 'audio/wav';
        }

        const { audio, url } = createObjectUrlAudio(audioBase64, audioType);
        audio.dataset.objectUrl = url;
        audioRef.current = audio;

        audio.oncanplaythrough = () => {
          audio.play().catch((playErr) => {
            console.error('Audio Playback Start Error:', playErr);
            setIsPresenting(false);
            setActiveWordIndex(-1);
            stopAudio();
            setErrorModal({
              isOpen: true,
              title: 'Audio Playback Error',
              message: playErr.message || 'Audio playback could not start.'
            });
          });

          // ── Build word-time lookup ─────────────────────────────────────────
          //
          // PRIORITY 1: Use exact Edge TTS WordBoundary timestamps (ms → s)
          // PRIORITY 2: Fall back to character-count proportional distribution
          //             for SC3 or if timings were not returned.
          //
          let wordRanges;
          const edgeTimings = edgeWordTimingsRef.current;

          if (edgeTimings.length > 0) {
            // Map each word in wordData to its EdgeTTS timing by position.
            // Edge TTS strips punctuation / markdown so we do a best-effort
            // alignment: strip the display word to bare text and compare.
            const strip = (s) => s.replace(/[^a-zA-Z0-9'\u0080-\uFFFF]/g, '').toLowerCase();
            let edgeIdx = 0;
            wordRanges = wordData.map((w) => {
              const bare = strip(w.text);
              // Scan forward in edgeTimings to find a match
              let matched = null;
              for (let e = edgeIdx; e < edgeTimings.length; e++) {
                if (strip(edgeTimings[e].word) === bare) {
                  matched = edgeTimings[e];
                  edgeIdx = e + 1;
                  break;
                }
              }
              if (matched) {
                return { start: matched.startMs / 1000, end: matched.endMs / 1000 };
              }
              // Fallback for unmatched word: use neighbor times
              const prev = edgeIdx > 0 ? edgeTimings[edgeIdx - 1].endMs / 1000 : 0;
              const next = edgeIdx < edgeTimings.length ? edgeTimings[edgeIdx].startMs / 1000 : audio.duration;
              return { start: prev, end: next };
            });
          } else {
            // Fallback: character-count proportional distribution
            const totalChars = wordData.reduce((acc, w) => acc + w.text.length, 0);
            let accumTime = 0;
            wordRanges = wordData.map((w) => {
              const wordDuration = (audio.duration * w.text.length) / totalChars;
              const start = accumTime;
              accumTime += wordDuration;
              return { start, end: accumTime };
            });
          }

          const updateHighlight = () => {
            if (!audioRef.current) return;
            const time = audioRef.current.currentTime;
            let activeIdx = -1;
            // Scan all ranges; prefer the one whose start is <= currentTime
            for (let i = wordRanges.length - 1; i >= 0; i--) {
              if (time >= wordRanges[i].start) {
                activeIdx = i;
                break;
              }
            }
            if (activeIdx !== -1) {
              setActiveWordIndex(activeIdx);
            }
            if (!audioRef.current.paused && !audioRef.current.ended) {
              animationFrameId.current = requestAnimationFrame(updateHighlight);
            }
          };

          animationFrameId.current = requestAnimationFrame(updateHighlight);
        };

        audio.onended = () => {
          setIsPresenting(false);
          setPlaybackPhase('idle');
          setActiveWordIndex(-1);
          stopAudio();
        };

        audio.onerror = (e) => {
          console.error('Audio Playback Error:', e);
          setIsPresenting(false);
          setActiveWordIndex(-1);
          stopAudio();
        };

      } catch (err) {
        console.error('Narration error:', err);
        setIsPresenting(false);
        setPlaybackPhase('idle');
        setActiveWordIndex(-1);
        setErrorModal({
          isOpen: true,
          title: engine === 'edge' ? 'Edge TTS Error' : 'SC3 TTS Error',
          message: err.message
        });
      }
    }
  }, [context, selectedVoice, speechRate, wordData, engine, selectedEdgeVoice, selectedSc3Voice, theme.animationSpeed, stopAudio]);

  const handlePresent = useCallback(async () => {
    window.speechSynthesis.cancel();
    stopAudio();
    clearTimeout(posterTimeoutRef.current);
    
    setIsPresenting(true);
    setIsPaused(false);
    setSidebarOpen(false);
    setActiveWordIndex(-1);

    const startNarration = () => {
      setPlaybackPhase('narration');
      triggerVoiceNarration();
    };

    const startPoster = () => {
      setPlaybackPhase('poster');
      posterStartTimeRef.current = Date.now();
      posterRemainingTimeRef.current = posterDuration * 1000;
      posterTimeoutRef.current = setTimeout(() => {
        startNarration();
      }, posterRemainingTimeRef.current);
    };

    if (playIntro) {
      setPlaybackPhase('intro');
    } else if (posterImage) {
      startPoster();
    } else {
      startNarration();
    }
  }, [playIntro, posterImage, posterDuration, triggerVoiceNarration, stopAudio]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    stopAudio();
    setIsPresenting(false);
    setIsPaused(false);
    setActiveWordIndex(-1);
    setPlaybackPhase('idle');
  }, [stopAudio]);

  const handlePause = useCallback(() => {
    if (playbackPhase === 'intro' && introVideoRef.current) {
      clearTimeout(introFallbackTimeoutRef.current);
      introVideoRef.current.pause();
      setIsPaused(true);
    } else if (playbackPhase === 'poster') {
      clearTimeout(posterTimeoutRef.current);
      const elapsed = Date.now() - posterStartTimeRef.current;
      posterRemainingTimeRef.current = Math.max(0, posterRemainingTimeRef.current - elapsed);
      setIsPaused(true);
    } else if (playbackPhase === 'narration') {
      if (engine === 'native') {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else if (audioRef.current) {
        audioRef.current.pause();
        setIsPaused(true);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      }
    }
  }, [engine, playbackPhase]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    if (playbackPhase === 'intro' && introVideoRef.current) {
      introVideoRef.current.play();
    } else if (playbackPhase === 'poster') {
      posterStartTimeRef.current = Date.now();
      posterTimeoutRef.current = setTimeout(() => {
        setPlaybackPhase('narration');
        triggerVoiceNarration();
      }, posterRemainingTimeRef.current);
    } else if (playbackPhase === 'narration') {
      if (engine === 'native') {
        window.speechSynthesis.resume();
      } else if (audioRef.current) {
        audioRef.current.play();

        // Build word ranges using exact timings if available, else fall back
        const strip = (s) => s.replace(/[^a-zA-Z0-9'\u0080-\uFFFF]/g, '').toLowerCase();
        const edgeTimings = edgeWordTimingsRef.current;
        let wordRanges;
        if (edgeTimings.length > 0) {
          let edgeIdx = 0;
          wordRanges = wordData.map((w) => {
            const bare = strip(w.text);
            let matched = null;
            for (let e = edgeIdx; e < edgeTimings.length; e++) {
              if (strip(edgeTimings[e].word) === bare) {
                matched = edgeTimings[e];
                edgeIdx = e + 1;
                break;
              }
            }
            if (matched) return { start: matched.startMs / 1000, end: matched.endMs / 1000 };
            const prev = edgeIdx > 0 ? edgeTimings[edgeIdx - 1].endMs / 1000 : 0;
            const next = edgeIdx < edgeTimings.length ? edgeTimings[edgeIdx].startMs / 1000 : audioRef.current.duration;
            return { start: prev, end: next };
          });
        } else {
          const totalChars = wordData.reduce((acc, w) => acc + w.text.length, 0);
          let accumTime = 0;
          wordRanges = wordData.map((w) => {
            const wordDuration = (audioRef.current.duration * w.text.length) / totalChars;
            const start = accumTime;
            accumTime += wordDuration;
            return { start, end: accumTime };
          });
        }

        const updateHighlight = () => {
          if (!audioRef.current) return;
          const time = audioRef.current.currentTime;
          let activeIdx = -1;
          for (let i = wordRanges.length - 1; i >= 0; i--) {
            if (time >= wordRanges[i].start) {
              activeIdx = i;
              break;
            }
          }
          if (activeIdx !== -1) {
            setActiveWordIndex(activeIdx);
          }
          if (!audioRef.current.paused && !audioRef.current.ended) {
            animationFrameId.current = requestAnimationFrame(updateHighlight);
          }
        };

        animationFrameId.current = requestAnimationFrame(updateHighlight);
      }
    }
  }, [engine, wordData, playbackPhase, triggerVoiceNarration]);

  const continueAfterIntro = useCallback(() => {
    if (posterImage) {
      setPlaybackPhase('poster');
      posterStartTimeRef.current = Date.now();
      posterRemainingTimeRef.current = posterDuration * 1000;
      posterTimeoutRef.current = setTimeout(() => {
        setPlaybackPhase('narration');
        triggerVoiceNarration();
      }, posterRemainingTimeRef.current);
    } else {
      setPlaybackPhase('narration');
      triggerVoiceNarration();
    }
  }, [posterImage, posterDuration, triggerVoiceNarration]);

  const handleIntroVideoEnded = useCallback(() => {
    if (isExporting) return;
    clearTimeout(introFallbackTimeoutRef.current);
    continueAfterIntro();
  }, [continueAfterIntro, isExporting]);

  useEffect(() => {
    if (!isPresenting || !playIntro || playbackPhase !== 'intro') return;

    let cancelled = false;
    clearTimeout(introFallbackTimeoutRef.current);

    const video = introVideoRef.current;
    playIntroVideo(video).then((didStart) => {
      if (cancelled || isExporting) return;
      const durationMs = Number.isFinite(video?.duration) && video.duration > 0
        ? Math.ceil(video.duration * 1000) + 250
        : 8000;
      introFallbackTimeoutRef.current = setTimeout(() => {
        if (!cancelled) continueAfterIntro();
      }, didStart ? durationMs : 8000);
    });

    return () => {
      cancelled = true;
      clearTimeout(introFallbackTimeoutRef.current);
    };
  }, [continueAfterIntro, isExporting, isPresenting, playIntro, playbackPhase]);

  const handleExportVideo = useCallback(async () => {
    if (!context || context.trim() === '') return;

    setIsExporting(true);
    setExportProgress('Generating TTS audio...');
    setIsPresenting(false);
    setIsPaused(false);

    try {
      let narrationBase64 = '';
      const pct = Math.round((theme.animationSpeed - 1.0) * 100);
      const rateStr = pct >= 0 ? `+${pct}%` : `${pct}%`;

      if (engine === 'edge') {
        let edgeBase64 = edgeAudioBase64Ref.current;
        if (!edgeBase64) {
          // Use the timed endpoint to also capture word timestamps for export sync
          const result = await narrateEdgeTimedCompat({
            text: context,
            voice: selectedEdgeVoice,
            rate: rateStr
          });
          if (!result.ok) {
            throw new Error(result.error || 'Failed to generate Edge TTS audio for export.');
          }
          edgeBase64 = result.audioBase64;
          edgeAudioBase64Ref.current = edgeBase64;
          // Also cache the word timings so the export animation loop can use them
          edgeWordTimingsRef.current = result.wordTimings || [];
        }
        narrationBase64 = edgeBase64;
      } else if (engine === 'sc3') {
        let sc3Base64 = sc3AudioBase64Ref.current;
        if (!sc3Base64) {
          const result = await window.electronAPI.narrateSc3Tts({
            text: context,
            voice: selectedSc3Voice
          });
          if (!result.ok) {
            throw new Error(result.error || 'Failed to generate SC3 TTS audio for export.');
          }
          sc3Base64 = result.audioBase64;
          sc3AudioBase64Ref.current = sc3Base64;
        }
        narrationBase64 = sc3Base64;
      } else {
        throw new Error('Exact video export is available for Edge TTS and SC3 voices only. Web Speech playback cannot be muxed exactly because the browser does not provide the generated audio file.');
      }

      setExportProgress('Building combined audio track...');
      const combinedBase64 = await getCombinedAudioBase64(narrationBase64);
      const combinedIsWav = engine === 'sc3' || playIntro || (posterImage && Number(posterDuration) > 0);
      const combinedAudioFileName = combinedIsWav ? 'narration.wav' : 'narration.mp3';
      const combinedAudioMimeType = combinedIsWav ? 'audio/wav' : 'audio/mpeg';

      const audioBytes = base64ToUint8Array(combinedBase64);
      const decodedDurationMs = await getAudioDurationMsFromBytes(audioBytes);
      if (!decodedDurationMs) {
        throw new Error('Could not determine narration duration for export.');
      }

      const audioBlob = new Blob([audioBytes], { type: combinedAudioMimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.dataset.objectUrl = audioUrl;
      audioRef.current = audio;

      setExportProgress('Preparing stage capture...');
      await waitForAudioReady(audio);

      if (playIntro) {
        setPlaybackPhase('intro');
      } else if (posterImage) {
        setPlaybackPhase('poster');
      } else {
        setPlaybackPhase('narration');
        setActiveWordIndex(0);
      }
      setIsPresenting(true);
      setSidebarOpen(false);
      setExportProgress('Recording (0%)...');
      await waitForNextPaint();
      if (playIntro) {
        await playIntroVideo(introVideoRef.current);
        await waitForNextPaint();
      }
      await waitForImageReady(stageRef.current?.querySelector('[data-info-kids-logo="true"]'));

      const exportCaptureDurationMs = decodedDurationMs + PRESENTATION_EXPORT_TAIL_PAD_MS;
      const stageCapture = await createStageCanvasCapture({
        stageElement: stageRef.current,
        durationMs: exportCaptureDurationMs
      });
      stageCaptureRef.current = stageCapture;
      const stream = stageCapture.stream;
      streamRef.current = stream;

      const chunks = [];
      const mediaRecorder = createPresentationMediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      let exportStopTimerId = null;
      let exportStartTimeMs = 0;
      let recordingStopped = false;

      const stopRecording = (reason = 'complete') => {
        if (recordingStopped) return;
        recordingStopped = true;
        clearTimeout(exportStopTimerId);
        console.log('[Presentation Export] stopping recorder:', reason);
        stopPresentationMediaRecorder(mediaRecorderRef.current).catch(error => {
          console.warn('[Presentation Export] graceful recorder stop failed; forcing stop.', error);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        });
      };

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          setExportProgress('Processing recorded video...');
          const webmBlob = new Blob(chunks, { type: 'video/webm' });
          const audioBlobForMux = new Blob([audioBytes], { type: combinedAudioMimeType });
          const recordedVideoDurationMs = await getBlobVideoDurationMs(webmBlob);
          const mediaDurationMs = getFiniteMediaDurationMs(audio);
          const targetDurationVal = decodedDurationMs || mediaDurationMs;
          if (recordedVideoDurationMs > 0 && recordedVideoDurationMs + PRESENTATION_EXPORT_TAIL_PAD_MS < targetDurationVal) {
            throw new Error(`Recorded stage video is only ${(recordedVideoDurationMs / 1000).toFixed(3)}s but narration is ${(targetDurationVal / 1000).toFixed(3)}s. Export stopped before muxing because the visual recorder ended early.`);
          }
          setExportProgress('Muxing video & audio via FFmpeg...');
          const result = await muxPresentationWithChunkUpload({
            videoBlob: webmBlob,
            audioBlob: audioBlobForMux,
            metadata: {
              videoFileName: 'recording.webm',
              audioFileName: combinedAudioFileName,
              videoSegmentCount: 1,
              saveToDefaultPath: true,
              outputFileName: exportFileName || 'presentation-video.mp4',
              targetDurationMs: targetDurationVal,
              recordedVideoDurationMs,
              holdLastFrameMs: PRESENTATION_EXPORT_TAIL_PAD_MS,
              strictVisualSync: true
            },
            onProgress: setExportProgress
          });

          if (result.ok) {
            setExportProgress('Export complete!');
            if (window.electronAPI.showNotification) {
              window.electronAPI.showNotification('Video Export Complete', `Saved "${result.fileName}" to your Downloads folder.`);
            }
            const viewInFolder = confirm(`Video exported successfully!\nSaved to: ${result.savedPath}\n\nWould you like to open the Downloads folder?`);
            if (viewInFolder && window.electronAPI.showItemInFolder) {
              window.electronAPI.showItemInFolder(result.savedPath);
            }
          } else {
            throw new Error(result.error || 'Failed to mux video and audio.');
          }
        } catch (muxErr) {
          console.error('Muxing/processing error:', muxErr);
          setErrorModal({
            isOpen: true,
            title: 'Muxing & Processing Error',
            message: muxErr.message
          });
        } finally {
          clearTimeout(exportStopTimerId);
          URL.revokeObjectURL(audioUrl);
          if (stageCaptureRef.current) {
            stageCaptureRef.current.stop();
            stageCaptureRef.current = null;
          }
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          setIsExporting(false);
          setIsPresenting(false);
          setSidebarOpen(true);
          setActiveWordIndex(-1);
          setPlaybackPhase('idle');
          stopAudio();
        }
      };

      audio.onended = () => {
        const elapsedMs = exportStartTimeMs ? (performance.now() - exportStartTimeMs) : decodedDurationMs;
        console.log('[Presentation Export] playback audio ended; keeping a short still-frame tail for recorder flush.', {
          elapsedMs,
          decodedDurationMs,
          tailPadMs: PRESENTATION_EXPORT_TAIL_PAD_MS
        });
      };

      audio.onerror = () => {
        console.warn('[Presentation Export] playback audio errored; continuing visual capture because mux uses the decoded WAV bytes.');
      };

      (async () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') return;

          exportStartTimeMs = performance.now();
          mediaRecorderRef.current.start(250);
          try {
            await audio.play();
          } catch (playErr) {
            console.warn('[Presentation Export] playback audio could not start; continuing visual capture from decoded duration.', playErr);
          }

          exportStopTimerId = setTimeout(() => {
            stopRecording('duration watchdog');
          }, exportCaptureDurationMs + 350);

          let localPhase = playIntro ? 'intro' : (posterImage ? 'poster' : 'narration');

          const updateHighlightAndProgress = () => {
            if (!audioRef.current || !exportStartTimeMs) return;
            const elapsedMs = Math.max(0, performance.now() - exportStartTimeMs);
            const dur = decodedDurationMs / 1000 || getFiniteMediaDurationMs(audioRef.current) / 1000 || 1;
            const time = Math.min(dur, elapsedMs / 1000);
            const pctVal = Math.min(100, Math.round((time / dur) * 100));
            setExportProgress(`Recording (${pctVal}%)...`);

            const introDurationSec = playIntro && decodedIntroBufferRef.current ? decodedIntroBufferRef.current.duration : 0;
            const posterDurationSec = posterImage ? Number(posterDuration) : 0;

            if (time < introDurationSec) {
              if (localPhase !== 'intro') {
                localPhase = 'intro';
                setPlaybackPhase('intro');
              }
            } else if (time < introDurationSec + posterDurationSec) {
              if (localPhase !== 'poster') {
                localPhase = 'poster';
                setPlaybackPhase('poster');
              }
            } else {
              if (localPhase !== 'narration') {
                localPhase = 'narration';
                setPlaybackPhase('narration');
                setActiveWordIndex(0);
              }

              const relativeTime = time - introDurationSec - posterDurationSec;

              // Use exact Edge TTS word timestamps when available
              const exportEdgeTimings = edgeWordTimingsRef.current;
              let activeIdx = -1;

              if (exportEdgeTimings.length > 0) {
                const strip = (s) => s.replace(/[^a-zA-Z0-9'\u0080-\uFFFF]/g, '').toLowerCase();
                // Build wordRanges only once per phrase (cache on first call)
                if (!updateHighlightAndProgress._rangesCache) {
                  let edgeIdx = 0;
                  updateHighlightAndProgress._rangesCache = wordData.map((w) => {
                    const bare = strip(w.text);
                    let matched = null;
                    for (let e = edgeIdx; e < exportEdgeTimings.length; e++) {
                      if (strip(exportEdgeTimings[e].word) === bare) {
                        matched = exportEdgeTimings[e];
                        edgeIdx = e + 1;
                        break;
                      }
                    }
                    if (matched) return { start: matched.startMs / 1000, end: matched.endMs / 1000 };
                    const prev = edgeIdx > 0 ? exportEdgeTimings[edgeIdx - 1].endMs / 1000 : 0;
                    const next = edgeIdx < exportEdgeTimings.length ? exportEdgeTimings[edgeIdx].startMs / 1000 : dur;
                    return { start: prev, end: next };
                  });
                }
                const wordRanges = updateHighlightAndProgress._rangesCache;
                for (let i = wordRanges.length - 1; i >= 0; i--) {
                  if (relativeTime >= wordRanges[i].start) {
                    activeIdx = i;
                    break;
                  }
                }
              } else {
                // Fallback: character-count proportional
                const narrationDuration = dur - introDurationSec - posterDurationSec;
                const totalChars = wordData.reduce((acc, w) => acc + w.text.length, 0);
                let accumTime = 0;
                const wordRanges = wordData.map((w) => {
                  const wordDuration = (narrationDuration * w.text.length) / totalChars;
                  const start = accumTime;
                  accumTime += wordDuration;
                  return { start, end: accumTime };
                });
                for (let i = wordRanges.length - 1; i >= 0; i--) {
                  if (relativeTime >= wordRanges[i].start) {
                    activeIdx = i;
                    break;
                  }
                }
              }

              if (activeIdx !== -1) {
                setActiveWordIndex(prev => {
                  if (prev !== activeIdx) return activeIdx;
                  return prev;
                });
              }
            }

            if (!recordingStopped && elapsedMs < decodedDurationMs) {
              animationFrameId.current = setTimeout(updateHighlightAndProgress, 33);
            }
          };
          animationFrameId.current = setTimeout(updateHighlightAndProgress, 33);
      })();

    } catch (err) {
      console.error('Export video failed:', err);
      setErrorModal({
        isOpen: true,
        title: 'Export Video Failed',
        message: err.message
      });
      setIsExporting(false);
      setIsPresenting(false);
      setSidebarOpen(true);
      setActiveWordIndex(-1);
      setPlaybackPhase('idle');
      stopAudio();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
      if (stageCaptureRef.current) {
        stageCaptureRef.current.stop();
        stageCaptureRef.current = null;
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, [context, selectedEdgeVoice, selectedSc3Voice, engine, theme, wordData, stopAudio, exportFileName, playIntro, posterImage, posterDuration, playbackPhase, isExporting]);

  const isRecording = isExporting && exportProgress.startsWith('Recording');

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-black magic-reader-body">
      
      {isExporting && !isRecording && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Exporting Video</h3>
              <p className="text-white/60 text-xs">{exportProgress}</p>
            </div>
          </div>
        </div>
      )}

      {!isPresenting && !isExporting && (
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-8 left-8 z-50 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[24px]">
            {sidebarOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
      )}

      <div 
        style={{ 
          width: sidebarOpen && !isPresenting ? '320px' : '0px',
          opacity: sidebarOpen && !isPresenting ? 1 : 0,
        }}
        className="h-full overflow-hidden transition-all duration-500 ease-in-out border-r border-white/5 bg-[#0e0e0e]"
      >
        <Sidebar 
          context={context}
          setContext={setContext}
          theme={theme}
          setTheme={setTheme}
          voices={availableVoices}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          disabled={isPresenting || isExporting}
          engine={engine}
          setEngine={setEngine}
          selectedEdgeVoice={selectedEdgeVoice}
          setSelectedEdgeVoice={setSelectedEdgeVoice}
          selectedSc3Voice={selectedSc3Voice}
          setSelectedSc3Voice={setSelectedSc3Voice}
          onExportVideo={handleExportVideo}
          isExporting={isExporting}
          exportProgress={exportProgress}
          exportFileName={exportFileName}
          setExportFileName={setExportFileName}
          onPreviewVoice={handlePreviewVoice}
          playIntro={playIntro}
          setPlayIntro={setPlayIntro}
          posterImage={posterImage}
          setPosterImage={setPosterImage}
          posterFileName={posterFileName}
          setPosterFileName={setPosterFileName}
          posterDuration={posterDuration}
          setPosterDuration={setPosterDuration}
          setPosterImage={setPosterImage}
          setPosterFileName={setPosterFileName}
        />
      </div>

      <main
        ref={stageRef}
        className={`flex-1 relative mt-0 flex flex-col overflow-hidden transition-all duration-1000 items-start justify-start`}
        style={{
          background: (theme.backgroundType === 'galaxy')
            ? (theme.gradient || 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 60%, #0d1b2a 100%)')
            : (theme.backgroundType === 'gradient')
            ? (theme.gradient && theme.gradient !== 'none' ? theme.gradient : theme.pageBg)
            : theme.pageBg,
        }}
      >
        {/* Render Presentation Word Stage when in narration phase */}
        {(playbackPhase === 'narration' || playbackPhase === 'idle') && (
          <ReaderStage 
            wordTokens={wordData}
            activeIndex={activeWordIndex}
            isPresenting={isPresenting}
            isPaused={isPaused}
            theme={theme}
          />
        )}

        {/* Render Intro Video Segment */}
        {isPresenting && playIntro && playbackPhase === 'intro' && (
          <video
            data-stage-intro-video="true"
            ref={introVideoRef}
            src={INTRO_VIDEO_SRC}
            className="absolute inset-0 w-full h-full object-cover z-30"
            muted={true}
            playsInline
            preload="auto"
            autoPlay
            onEnded={handleIntroVideoEnded}
            onError={() => {
              if (!isExporting) continueAfterIntro();
            }}
          />
        )}

        {/* Render Poster Image Segment */}
        {isPresenting && posterImage && playbackPhase === 'poster' && (
          <img
            src={posterImage}
            alt="Poster"
            className="absolute inset-0 w-full h-full object-cover z-30"
          />
        )}

        <img
          data-info-kids-logo="true"
          src={INFO_KIDS_LOGO_SRC}
          alt="Info kids logo"
          className="absolute pointer-events-none select-none"
          style={{
            right: '5.2%',
            bottom: '7.8%',
            width: 'clamp(150px, 11vw, 230px)',
            height: 'auto',
            zIndex: 70
          }}
        />

        {!isExporting && (
          <PlaybackBar 
            isPresenting={isPresenting}
            isPaused={isPaused}
            onPresent={handlePresent}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            canPlay={wordData.length > 0}
            accentColor={theme.accentColor}
          />
        )}
      </main>

      {/* Custom Error Dialog Modal */}
      {errorModal.isOpen && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="material-symbols-outlined text-[32px]">error</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                {errorModal.title || 'Playback & Export Error'}
              </h3>
            </div>
            
            <p className="text-white/70 text-xs leading-relaxed max-h-48 overflow-y-auto dark-scrollbar border border-white/5 bg-white/5 p-3 rounded-lg font-mono whitespace-pre-wrap">
              {errorModal.message}
            </p>
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setErrorModal({ isOpen: false, title: '', message: '' })}
                className="px-4 py-2 bg-white hover:bg-white/95 text-black font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.97]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
