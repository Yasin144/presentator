import { CaptionItem, Language, LANG_CODE, CODE_TO_NAME } from './types';

interface HFChunk { text: string; timestamp: [number, number] }
interface HFResponse {
  text?: string;
  chunks?: HFChunk[];
  error?: string;
  estimated_time?: number;
}

// ── Group chunks → caption segments ──────────────────────────────────────
function groupIntoSentences(chunks: HFChunk[], maxWords = 4): CaptionItem[] {
  const caps: CaptionItem[] = [];
  for (let i = 0; i < chunks.length; i += maxWords) {
    const sl = chunks.slice(i, i + maxWords);
    if (!sl.length) continue;
    const start = sl[0].timestamp[0] ?? 0;
    const end   = sl[sl.length - 1].timestamp[1] ?? start + 1;
    caps.push({
      start, end,
      text:  sl.map(c => c.text.trim()).filter(Boolean).join(' '),
      words: sl.map(c => ({
        text:  c.text.trim(),
        start: c.timestamp[0] ?? start,
        end:   c.timestamp[1] ?? (c.timestamp[0] ?? start) + 0.3,
      })),
    });
  }
  return caps.filter(c => c.text.length > 0);
}

// ── Fallback: build captions from plain text when no chunks ───────────────
function buildFromText(text: string, maxWords: number): CaptionItem[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const avgDur = 0.5; // assume 0.5s per word
  const caps: CaptionItem[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    const slice = words.slice(i, i + maxWords);
    const start = i * avgDur;
    const end   = (i + slice.length) * avgDur;
    caps.push({
      start, end,
      text: slice.join(' '),
      words: slice.map((t, j) => ({
        text: t, start: start + j * avgDur, end: start + (j + 1) * avgDur,
      })),
    });
  }
  return caps;
}

// ── Infer language from Unicode script blocks ─────────────────────────────
function inferLangFromScript(text: string): string | null {
  const c: Record<string, number> = {};
  for (const ch of text) {
    const p = ch.codePointAt(0) ?? 0;
    if (p >= 0x0C00 && p <= 0x0C7F) c.te  = (c.te  || 0) + 1;
    if (p >= 0x0900 && p <= 0x097F) c.hi  = (c.hi  || 0) + 1;
    if (p >= 0x0B80 && p <= 0x0BFF) c.ta  = (c.ta  || 0) + 1;
    if (p >= 0x0600 && p <= 0x06FF) c.ar  = (c.ar  || 0) + 1;
    if (p >= 0x0041 && p <= 0x007A) c.en  = (c.en  || 0) + 1;
  }
  if (!Object.keys(c).length) return null;
  const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 3 ? best[0] : null;
}

// ── Extract 16 kHz mono WAV ───────────────────────────────────────────────
async function extractAudioAsWav(file: File): Promise<Blob> {
  const ab      = await file.arrayBuffer();
  const ctx     = new AudioContext({ sampleRate: 16000 });
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(ab);
  } catch {
    // Fallback: try OfflineAudioContext for some formats
    throw new Error('Could not decode audio — try converting to MP4 first');
  }
  await ctx.close();

  const mono = new Float32Array(decoded.length);
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const ch = decoded.getChannelData(c);
    for (let i = 0; i < decoded.length; i++) mono[i] += ch[i] / decoded.numberOfChannels;
  }

  const wavBuf = new ArrayBuffer(44 + mono.length * 2);
  const view   = new DataView(wavBuf);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  ws(0,'RIFF'); view.setUint32(4, 36 + mono.length * 2, true);
  ws(8,'WAVE'); ws(12,'fmt ');
  view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
  view.setUint32(24,16000,true); view.setUint32(28,32000,true);
  view.setUint16(32,2,true); view.setUint16(34,16,true); ws(36,'data');
  view.setUint32(40, mono.length * 2, true);
  const s16 = new Int16Array(wavBuf, 44);
  for (let i = 0; i < mono.length; i++) s16[i] = Math.max(-32768, Math.min(32767, mono[i] * 32768));
  return new Blob([wavBuf], { type: 'audio/wav' });
}

// ── Blob → base64 ────────────────────────────────────────────────────────
async function toB64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res((r.result as string).split(',')[1]);
    r.onerror   = rej;
    r.readAsDataURL(blob);
  });
}

// ── Call HF Whisper ───────────────────────────────────────────────────────
async function callWhisper(
  chunk: Blob, token: string, langCode?: string, retryCount = 0,
): Promise<HFResponse> {
  const b64 = await toB64(chunk);

  const parameters: Record<string, unknown> = { task: 'transcribe', return_timestamps: 'word' };
  if (langCode) parameters.language = langCode;

  const resp = await fetch(
    'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ inputs: b64, parameters }),
    },
  );

  // Model loading → wait and retry
  if (resp.status === 503) {
    const j = await resp.json().catch(() => ({} as HFResponse));
    const wait = Math.ceil(((j.estimated_time ?? 20)) + 5) * 1000;
    if (retryCount < 4) {
      await new Promise(r => setTimeout(r, wait));
      return callWhisper(chunk, token, langCode, retryCount + 1);
    }
    throw new Error('Model still loading after retries — please wait 1 min and try again');
  }

  // Rate limit
  if (resp.status === 429) throw new Error('Rate limited — wait a moment and retry');

  // Auth error
  if (resp.status === 401) throw new Error('Invalid API token — check your Hugging Face token');

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`HF API Error ${resp.status}: ${body.slice(0, 150)}`);
  }

  const json = await resp.json() as HFResponse & { detected_language?: string };
  if (json.error) {
    // Sometimes model returns error as field — retry once
    if (retryCount < 2) {
      await new Promise(r => setTimeout(r, 3000));
      return callWhisper(chunk, token, langCode, retryCount + 1);
    }
    throw new Error(`Whisper: ${json.error}`);
  }

  return json;
}

// ── Constants ─────────────────────────────────────────────────────────────
const SR = 16000, BPS = 2, HDR = 44;
const MAX_CHUNK_BYTES = 28 * SR * BPS + HDR;   // 28 seconds

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

  // Resolve language code
  let langCode: string | undefined;
  let displayLang = language as string;

  if (language !== 'Auto-Detect') {
    langCode = LANG_CODE[language];
  } else {
    // Probe first 10s to detect language
    onProgress('🔍 Detecting language…', 8);
    try {
      const probe  = audio.slice(0, Math.min(audio.size, 10 * SR * BPS + HDR), 'audio/wav');
      const result = await callWhisper(probe, hfToken, undefined);
      const sample = (result.chunks ?? []).slice(0, 8).map(c => c.text).join('');
      const inferred = inferLangFromScript(sample || result.text || '');
      if (inferred) {
        langCode    = inferred;
        displayLang = CODE_TO_NAME[inferred] ?? inferred.toUpperCase();
        onProgress(`🌐 Detected: ${displayLang}`, 10);
        await new Promise(r => setTimeout(r, 500));
      }
    } catch {
      // probe failed — continue without language lock
    }
  }

  const numChunks = Math.max(1, Math.ceil((audio.size - HDR) / (MAX_CHUNK_BYTES - HDR)));
  let all: CaptionItem[] = [];

  for (let i = 0; i < numChunks; i++) {
    const pct = 12 + Math.round((i / numChunks) * 82);
    onProgress(`${displayLang || 'Auto'} — part ${i + 1}/${numChunks}…`, pct);

    const byteStart  = i === 0 ? 0 : HDR + i * (MAX_CHUNK_BYTES - HDR);
    const chunk      = audio.slice(byteStart, byteStart + MAX_CHUNK_BYTES, 'audio/wav');
    const timeOffset = Math.max(0, byteStart - HDR) / (SR * BPS);

    let result: HFResponse;
    try {
      result = await callWhisper(chunk, hfToken, langCode);
    } catch (err: any) {
      // Non-fatal chunk failure — skip with warning
      console.warn(`[CaptionBurner] Chunk ${i + 1} failed:`, err.message);
      continue;
    }

    // If API returns chunks with word timestamps → use them
    if (result.chunks && result.chunks.length > 0) {
      const shifted = result.chunks.map(c => ({
        text:      c.text,
        timestamp: [
          (c.timestamp[0] ?? 0) + timeOffset,
          ((c.timestamp[1] ?? (c.timestamp[0] ?? 0) + 0.3)) + timeOffset,
        ] as [number, number],
      }));
      all = [...all, ...groupIntoSentences(shifted, maxWordsPerCaption)];

      // Lock language after first successful detection in auto mode
      if (!langCode && result.chunks.length > 0) {
        const sample  = result.chunks.slice(0, 6).map(c => c.text).join('');
        const inferred = inferLangFromScript(sample);
        if (inferred) { langCode = inferred; displayLang = CODE_TO_NAME[inferred] ?? inferred.toUpperCase(); }
      }
    } else if (result.text?.trim()) {
      // Fallback: plain text without timestamps
      const shifted = buildFromText(result.text, maxWordsPerCaption).map(cap => ({
        ...cap,
        start: cap.start + timeOffset,
        end:   cap.end + timeOffset,
        words: cap.words?.map(w => ({ ...w, start: w.start + timeOffset, end: w.end + timeOffset })),
      }));
      all = [...all, ...shifted];
    }
  }

  if (all.length === 0) throw new Error('No captions generated — video may have no speech');

  onProgress(`${displayLang || 'Done'} ✓`, 97);
  return { captions: all, detectedLang: displayLang };
}
