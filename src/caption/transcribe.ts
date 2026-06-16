import { CaptionItem, Language, LANG_CODE, CODE_TO_NAME } from './types';

interface HFChunk { text: string; timestamp: [number, number] }
interface HFResponse {
  text?: string;
  chunks?: HFChunk[];
  error?: string;
  estimated_time?: number;
}

// ── Quick API health check (exported for test button) ─────────────────────
export async function testHFToken(token: string): Promise<string> {
  try {
    const resp = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      { method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: '', parameters: { task: 'transcribe' } }),
      }
    );
    if (resp.status === 401) return '❌ Invalid token (401)';
    if (resp.status === 429) return '⚠️ Rate limited (429)';
    if (resp.status === 503) return '⏳ Model loading (503) — wait 30s and retry';
    if (resp.status === 400) return '✅ Token valid — model reachable (400 bad input is normal for empty)';
    if (resp.status === 200) return '✅ Token valid — model ready';
    const body = await resp.text().catch(() => '');
    return `⚠️ Status ${resp.status}: ${body.slice(0, 80)}`;
  } catch (e: any) {
    return `❌ Network error: ${e.message}`;
  }
}

// ── Group word-chunks into caption segments ───────────────────────────────
function groupIntoSentences(chunks: HFChunk[], maxWords = 4): CaptionItem[] {
  const caps: CaptionItem[] = [];
  for (let i = 0; i < chunks.length; i += maxWords) {
    const sl = chunks.slice(i, i + maxWords).filter(c => c.text?.trim());
    if (!sl.length) continue;
    const start = sl[0].timestamp[0] ?? 0;
    const end   = sl[sl.length - 1].timestamp[1] ?? start + 1;
    caps.push({
      start, end,
      text:  sl.map(c => c.text.trim()).join(' '),
      words: sl.map(c => ({
        text:  c.text.trim(),
        start: c.timestamp[0] ?? start,
        end:   c.timestamp[1] ?? (c.timestamp[0] ?? start) + 0.3,
      })),
    });
  }
  return caps.filter(c => c.text.length > 0);
}

// ── Plain-text → evenly spaced captions (no timestamps) ──────────────────
function buildFromText(text: string, maxWords: number): CaptionItem[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const caps: CaptionItem[] = [];
  const avgDur = 0.5;
  for (let i = 0; i < words.length; i += maxWords) {
    const sl    = words.slice(i, i + maxWords);
    const start = i * avgDur;
    const end   = (i + sl.length) * avgDur;
    caps.push({
      start, end, text: sl.join(' '),
      words: sl.map((t, j) => ({ text: t, start: start + j * avgDur, end: start + (j + 1) * avgDur })),
    });
  }
  return caps;
}

// ── Unicode script → BCP-47 language code ────────────────────────────────
function inferLangFromScript(text: string): string | null {
  const c: Record<string, number> = {};
  for (const ch of text) {
    const p = ch.codePointAt(0) ?? 0;
    if (p >= 0x0C00 && p <= 0x0C7F) c.te = (c.te||0)+1;  // Telugu
    if (p >= 0x0900 && p <= 0x097F) c.hi = (c.hi||0)+1;  // Hindi
    if (p >= 0x0B80 && p <= 0x0BFF) c.ta = (c.ta||0)+1;  // Tamil
    if (p >= 0x0600 && p <= 0x06FF) c.ar = (c.ar||0)+1;  // Arabic/Urdu
    if (p >= 0x0041 && p <= 0x007A) c.en = (c.en||0)+1;  // Latin
  }
  if (!Object.keys(c).length) return null;
  const best = Object.entries(c).sort((a,b)=>b[1]-a[1])[0];
  return best[1] > 3 ? best[0] : null;
}

// ── Extract 16 kHz mono WAV from video ───────────────────────────────────
async function extractAudioAsWav(file: File): Promise<Blob> {
  const ab  = await file.arrayBuffer();
  const ctx = new AudioContext({ sampleRate: 16000 });
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(ab);
  } catch {
    throw new Error(`Audio decode failed — try re-saving the video as MP4`);
  }
  await ctx.close();

  const mono = new Float32Array(decoded.length);
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const ch = decoded.getChannelData(c);
    for (let i = 0; i < decoded.length; i++) mono[i] += ch[i] / decoded.numberOfChannels;
  }

  const wavBuf = new ArrayBuffer(44 + mono.length * 2);
  const v = new DataView(wavBuf);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };
  ws(0,'RIFF'); v.setUint32(4, 36+mono.length*2, true); ws(8,'WAVE'); ws(12,'fmt ');
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,16000,true); v.setUint32(28,32000,true);
  v.setUint16(32,2,true); v.setUint16(34,16,true); ws(36,'data');
  v.setUint32(40, mono.length*2, true);
  const s16 = new Int16Array(wavBuf, 44);
  for (let i = 0; i < mono.length; i++) s16[i] = Math.max(-32768, Math.min(32767, mono[i]*32768));
  return new Blob([wavBuf], { type: 'audio/wav' });
}

async function toB64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res((r.result as string).split(',')[1]);
    r.onerror   = rej;
    r.readAsDataURL(blob);
  });
}

// ── Call Whisper with fallback timestamp strategy ─────────────────────────
// Strategy 1: return_timestamps='word'  (best — karaoke highlights)
// Strategy 2: return_timestamps=true    (segment level — if word fails/empty)
// Strategy 3: return_timestamps=false   (plain text only — last resort)
async function callWhisper(
  chunk: Blob,
  token: string,
  langCode?: string,
  timestampMode: 'word' | 'segment' | 'none' = 'word',
  retryCount = 0,
): Promise<HFResponse> {
  const b64 = await toB64(chunk);

  const parameters: Record<string, unknown> = { task: 'transcribe' };
  if (langCode) parameters.language = langCode;
  if (timestampMode === 'word')    parameters.return_timestamps = 'word';
  if (timestampMode === 'segment') parameters.return_timestamps = true;
  // 'none' → no return_timestamps param (plain text)

  const resp = await fetch(
    'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ inputs: b64, parameters }),
    },
  );

  if (resp.status === 503) {
    const j = await resp.json().catch(() => ({} as HFResponse));
    const wait = Math.ceil((j.estimated_time ?? 20) + 5) * 1000;
    if (retryCount < 5) {
      await new Promise(r => setTimeout(r, wait));
      return callWhisper(chunk, token, langCode, timestampMode, retryCount + 1);
    }
    throw new Error('Model loading — please wait 1 min and retry');
  }
  if (resp.status === 429) throw new Error('Rate limited — wait a moment and retry');
  if (resp.status === 401) throw new Error('Invalid API token — check your Hugging Face token');
  if (!resp.ok) throw new Error(`HF API Error ${resp.status}: ${(await resp.text()).slice(0,120)}`);

  const json = await resp.json() as HFResponse;
  if (json.error) {
    if (retryCount < 2) {
      await new Promise(r => setTimeout(r, 3000));
      return callWhisper(chunk, token, langCode, timestampMode, retryCount + 1);
    }
    throw new Error(`Whisper error: ${json.error}`);
  }

  return json;
}

// ── Transcribe one audio chunk with fallback strategy ─────────────────────
async function transcribeChunk(
  chunk: Blob, token: string, langCode: string | undefined, timeOffset: number, maxWords: number,
): Promise<CaptionItem[]> {
  console.log(`[CB] transcribeChunk offset=${timeOffset.toFixed(1)}s size=${chunk.size} lang=${langCode}`);

  // Try 1: word-level timestamps
  let result = await callWhisper(chunk, token, langCode, 'word');
  console.log('[CB] word result: chunks=', result.chunks?.length ?? 0, 'text=', result.text?.slice(0,60));
  if (result.chunks && result.chunks.length > 0) {
    const shifted = result.chunks.map(c => ({
      text: c.text,
      timestamp: [
        (c.timestamp[0] ?? 0) + timeOffset,
        ((c.timestamp[1] ?? (c.timestamp[0] ?? 0) + 0.3)) + timeOffset,
      ] as [number, number],
    }));
    return groupIntoSentences(shifted, maxWords);
  }

  // Try 2: segment-level timestamps
  result = await callWhisper(chunk, token, langCode, 'segment');
  console.log('[CB] segment result: chunks=', result.chunks?.length ?? 0, 'text=', result.text?.slice(0,60));
  if (result.chunks && result.chunks.length > 0) {
    const shifted = result.chunks.map(c => ({
      text: c.text,
      timestamp: [
        (c.timestamp[0] ?? 0) + timeOffset,
        ((c.timestamp[1] ?? (c.timestamp[0] ?? 0) + 2)) + timeOffset,
      ] as [number, number],
    }));
    return groupIntoSentences(shifted, maxWords);
  }

  // Try 3: no timestamps — plain text
  result = await callWhisper(chunk, token, langCode, 'none');
  console.log('[CB] none result: text=', result.text?.slice(0,60));
  const txt = result.text?.trim() ?? '';
  if (txt) {
    return buildFromText(txt, maxWords).map(cap => ({
      ...cap, start: cap.start + timeOffset, end: cap.end + timeOffset,
      words: cap.words?.map(w => ({ ...w, start: w.start + timeOffset, end: w.end + timeOffset })),
    }));
  }

  console.warn('[CB] All 3 modes returned empty for this chunk');
  return [];
}

// ── Constants ─────────────────────────────────────────────────────────────
const SR = 16000, BPS = 2, HDR = 44;
const MAX_CHUNK_BYTES = 28 * SR * BPS + HDR; // ~28 s

// ── Public API ────────────────────────────────────────────────────────────
export async function transcribeWithHuggingFace(
  file:               File,
  language:           Language,
  hfToken:            string,
  maxWordsPerCaption: number,
  onProgress:         (msg: string, pct: number) => void,
): Promise<{ captions: CaptionItem[]; detectedLang: string }> {

  onProgress('Extracting audio…', 5);
  const audio = await extractAudioAsWav(file);

  // Resolve language
  let langCode: string | undefined;
  let displayLang = language as string;

  if (language !== 'Auto-Detect') {
    langCode    = LANG_CODE[language];
    displayLang = language;
  } else {
    // Probe first 10s for language detection
    onProgress('🔍 Detecting language…', 8);
    try {
      const probe  = audio.slice(0, Math.min(audio.size, 10 * SR * BPS + HDR), 'audio/wav');
      const result = await callWhisper(probe, hfToken, undefined, 'segment');
      const sample = (result.chunks ?? []).slice(0, 6).map(c => c.text).join('') + (result.text ?? '');
      const inferred = inferLangFromScript(sample);
      if (inferred) {
        langCode    = inferred;
        displayLang = CODE_TO_NAME[inferred] ?? inferred.toUpperCase();
        onProgress(`🌐 Detected: ${displayLang}`, 10);
        await new Promise(r => setTimeout(r, 500));
      }
    } catch { /* probe failed — continue without lang lock */ }
  }

  const numChunks = Math.max(1, Math.ceil((audio.size - HDR) / (MAX_CHUNK_BYTES - HDR)));
  let all: CaptionItem[] = [];
  let lastErr: string | null = null;

  for (let i = 0; i < numChunks; i++) {
    const pct = 12 + Math.round((i / numChunks) * 82);
    onProgress(`${displayLang || 'Auto'} — part ${i + 1}/${numChunks}…`, pct);

    const byteStart  = i === 0 ? 0 : HDR + i * (MAX_CHUNK_BYTES - HDR);
    const chunk      = audio.slice(byteStart, byteStart + MAX_CHUNK_BYTES, 'audio/wav');
    const timeOffset = Math.max(0, byteStart - HDR) / (SR * BPS);

    try {
      const caps = await transcribeChunk(chunk, hfToken, langCode, timeOffset, maxWordsPerCaption);
      if (caps.length > 0) all = [...all, ...caps];
    } catch (err: any) {
      lastErr = String(err.message || err);
      console.error(`[CaptionBurner] Chunk ${i+1} failed:`, lastErr);
      // If it's an auth or rate-limit error, stop immediately
      if (lastErr.includes('Invalid API token') || lastErr.includes('Rate limited')) throw new Error(lastErr);
    }
  }

  // If nothing was generated, throw with the real error (not generic "no speech")
  if (all.length === 0) {
    throw new Error(
      lastErr
        ? `Transcription failed: ${lastErr}`
        : 'No speech detected — ensure the video has clear audio and try again'
    );
  }

  onProgress(`${displayLang || 'Done'} ✓`, 97);
  return { captions: all, detectedLang: displayLang };
}
