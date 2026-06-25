import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { CaptionItem, CaptionSettings, WordItem } from './types';

let ff: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ff?.loaded) return ff;
  ff = new FFmpeg();
  const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ff.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  return ff;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
}

function pad2(n: number) { return String(Math.floor(n)).padStart(2,'0'); }
function toAss(s: number) {
  return `${pad2(s/3600)}:${pad2((s%3600)/60)}:${pad2(s%60)}.${String(Math.round((s-Math.floor(s))*100)).padStart(2,'0')}`;
}
function hexToAssColor(h: string) {
  const r=h.slice(1,3),g=h.slice(3,5),b=h.slice(5,7);
  return `&H00${b}${g}${r}`;
}

function escapeAssText(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\r?\n/g, '\\N');
}

function isRtlLanguage(language: CaptionSettings['language']) {
  return language === 'Urdu' || language === 'Arabic';
}

function captionFontName(language: CaptionSettings['language']) {
  if (language === 'English') return 'Arial';
  if (language === 'Urdu' || language === 'Arabic') return 'Tahoma';
  return 'Nirmala UI';
}

function shapeCaptionText(text: string, settings: CaptionSettings) {
  const safe = escapeAssText(text);
  return isRtlLanguage(settings.language) ? `\u202B${safe}\u202C` : safe;
}

function speechBoundCaptionEvents(caps: CaptionItem[], offset: number): CaptionItem[] {
  const shifted: CaptionItem[] = [];
  for (const cap of caps) {
    const validWords = (cap.words || [])
      .filter(w => String(w.text || '').trim() && Number.isFinite(w.start) && Number.isFinite(w.end) && w.end > w.start)
      .sort((a, b) => a.start - b.start);

    if (!validWords.length) {
      shifted.push({ ...cap, start: cap.start + offset, end: cap.end + offset });
      continue;
    }

    let group: WordItem[] = [];
    const flush = () => {
      if (!group.length) return;
      const words = group.map(w => ({
        ...w,
        start: w.start + offset,
        end: Math.min(w.end, w.start + 1.5) + offset,
      }));
      shifted.push({
        start: words[0].start,
        end: words[words.length - 1].end,
        text: words.map(w => w.text).join(' '),
        words,
      });
      group = [];
    };

    for (const word of validWords) {
      const previous = group[group.length - 1];
      if (previous && word.start - previous.end > 0.2) flush();
      group.push(word);
    }
    flush();
  }
  return shifted;
}

function normalizeCaptionTimeline(caps: CaptionItem[], offset: number): CaptionItem[] {
  const sorted = speechBoundCaptionEvents(caps, offset)
    .filter(c => c && String(c.text || '').trim() && Number.isFinite(c.start) && Number.isFinite(c.end))
    .map(c => ({
      ...c,
      start: Math.max(0, c.start),
      end: Math.max(Math.max(0, c.start) + 0.05, c.end),
      words: c.words?.map(w => ({
        ...w,
        start: Math.max(0, w.start),
        end: Math.max(Math.max(0, w.start) + 0.01, w.end),
      })),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const out: CaptionItem[] = [];
  for (const current of sorted) {
    const previous = out[out.length - 1];
    if (previous && current.start < previous.end) {
      // Whisper chunks overlap by design. End the previous event immediately
      // before the next one so libass can never render two caption rows.
      previous.end = Math.max(previous.start, current.start - 0.01);
      if (previous.words?.length) {
        previous.words = previous.words
          .filter(w => w.start < previous.end)
          .map(w => ({
            ...w,
            start: Math.max(previous.start, w.start),
            end: Math.min(previous.end, Math.max(w.start + 0.01, w.end)),
          }))
          .filter(w => w.end > w.start);
      }
      if (previous.end - previous.start < 0.05) out.pop();
    }
    out.push(current);
  }
  return out;
}

function buildAss(caps: CaptionItem[], s: CaptionSettings): string {
  const timelineCaps = normalizeCaptionTimeline(caps, s.offset || 0);
  // Auto-detect font based on actual text content to prevent missing glyphs (tofu boxes)
  // if the user's language dropdown doesn't match the actual script being rendered.
  const allText = timelineCaps.map(c => c.text).join(' ');
  let fontName = 'Arial';
  
  let hasIndic = false, hasArabic = false;
  for (const ch of allText) {
    const p = ch.codePointAt(0) ?? 0;
    if ((p >= 0x0900 && p <= 0x0D7F)) hasIndic = true; // Indic scripts (Hindi, Telugu, Tamil, etc)
    if ((p >= 0x0600 && p <= 0x06FF)) hasArabic = true; // Arabic/Urdu
  }
  
  if (hasIndic) fontName = 'Nirmala UI';
  else if (hasArabic) fontName = 'Tahoma';
  else if (['Telugu', 'Hindi', 'Tamil'].includes(s.language)) fontName = 'Nirmala UI';
  else if (['Urdu', 'Arabic'].includes(s.language)) fontName = 'Tahoma';

  const fs = Math.round(720 * (s.fontSize / 720));
  
  // Swap primary and secondary colors for standard karaoke behavior:
  // - SecondaryColour (sec) is the inactive/unhighlighted color (normal text, e.g. White).
  // - PrimaryColour (pri) is the active/highlighted color (highlighted text, e.g. Yellow).
  const pri = hexToAssColor(s.style === 'white-yellow' ? '#facc15' : (s.highlightColor || '#facc15'));
  const sec = hexToAssColor(s.style === 'white-yellow'
    ? '#ffffff'
    : s.fontColor==='White'?'#ffffff':s.fontColor==='Yellow'?'#facc15':s.fontColor==='Cyan'?'#22d3ee':'#000000');

  const align = s.position==='top' ? 8 : 2;
  const encoding = 1;

  // Map BorderStyle, Outline, Shadow based on s.style
  let borderStyle = 1; // 1 = outline, 3 = box
  let outline = 2;
  let shadow = 0;

  if (s.style === 'pill') {
    borderStyle = 3;
    outline = 0;
  } else if (s.style === 'minimal' || s.style === 'white-yellow') {
    borderStyle = 1;
    outline = 0;
  } else {
    // 'outline'
    borderStyle = 1;
    outline = 2;
  }

  // Map BackColour based on s.bgColor
  let backColor = '&H80000000'; // Default 50% opacity black
  if (s.bgColor === 'Black (70%)') {
    backColor = '&H4D000000'; // 70% opacity black
  } else if (s.bgColor === 'White (20%)') {
    backColor = '&HCCffffff'; // 20% opacity white
  } else if (s.bgColor === 'Black') {
    backColor = '&H00000000'; // 100% opaque black
  } else if (s.bgColor === 'Transparent') {
    backColor = '&HFF000000'; // 100% transparent
  }

  // Outline color: solid black for outline style, otherwise transparent
  const outColor = s.style === 'outline' ? '&H00000000' : '&HFF000000';

  const header = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,${fontName},${fs},${pri},${sec},${outColor},${backColor},-1,0,0,0,100,100,0,0,${borderStyle},${outline},${shadow},${align},10,10,60,${encoding}\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text`;

  const lines = timelineCaps.flatMap(c => {
    const words: WordItem[] = c.words?.length ? c.words : c.text.trim().split(/\s+/).map((t,i,a)=>({
      text:t, start:c.start+(i/a.length)*(c.end-c.start), end:c.start+((i+1)/a.length)*(c.end-c.start)
    }));
    if (s.style === 'white-yellow') {
      const x = Math.round(1920 * Math.max(0, Math.min(100, s.xPos)) / 100);
      const y = Math.round(1080 * Math.max(0, Math.min(100, s.yPos)) / 100);
      return words
        .filter(w => w.end > w.start)
        .map((word, activeIndex) => {
          const styledText = words.map((token, tokenIndex) => {
            const color = tokenIndex === activeIndex ? pri : sec;
            return `{\\1c${color}}${escapeAssText(token.text)}`;
          }).join(' ');
          const text = isRtlLanguage(s.language) || hasArabic
            ? `\u202B${styledText}\u202C`
            : styledText;
          return `Dialogue: 0,${toAss(word.start)},${toAss(word.end)},Default,,0,0,0,,{\\an5\\pos(${x},${y})}${text}`;
        });
    }
    let kar = '';
    let currentTime = c.start;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const gap = w.start - currentTime;
      if (gap > 0.01) {
        kar += `{\\k${Math.round(gap * 100)}}`;
      }
      const dur = w.end - w.start;
      kar += `{\\k${Math.max(1, Math.round(dur * 100))}}${shapeCaptionText(w.text, s)} `;
      currentTime = w.end;
    }
    return [`Dialogue: 0,${toAss(c.start)},${toAss(c.end)},Default,,0,0,0,,${kar.trim()}`];
  });
  return [header,...lines].join('\n');
}

export async function burnCaptions(
  file: File, caps: CaptionItem[], settings: CaptionSettings,
  onProgress: (p: number) => void,
  signal?: AbortSignal,
): Promise<{ blob?: Blob; outputPath?: string; outputFileName?: string }> {
  throwIfAborted(signal);

  const assContent = buildAss(caps, settings);
  
  // Try the ultra-fast native FFmpeg IPC route first
  const api = (window as any).electron;
  if (api?.invoke && (file as any).path) {
    onProgress(5);
    try {
      const result = await api.invoke('fast-burn-ass', {
        videoPath: (file as any).path,
        assContent,
      });
      if (result.ok) {
        onProgress(100);
        return { outputPath: result.outputPath, outputFileName: result.fileName };
      }
      throw new Error(result.error || 'Native burn failed');
    } catch (err: any) {
      console.warn('[burnCaptions] Native fast-burn failed, falling back to WASM:', err);
    }
  }

  // Fallback to WASM FFmpeg
  const engine = await getFFmpeg();
  const onAbort = () => {
    try { engine.terminate(); } catch {}
    ff = null;
  };
  signal?.addEventListener('abort', onAbort, { once: true });
  engine.on('progress', ({progress}) => {
    throwIfAborted(signal);
    onProgress(Math.round(progress*100));
  });

  async function writeFont(fileName: string, paths: string[]) {
    let fontBuf: ArrayBuffer | null = null;
    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          fontBuf = await res.arrayBuffer();
          break;
        }
      } catch {}
    }
    if (fontBuf) {
      await engine.writeFile(fileName, new Uint8Array(fontBuf));
    }
  }

  // Load fonts used by caption scripts:
  // Arial: English/Latin, Nirmala UI: Hindi/Telugu/Tamil, Tahoma: Urdu/Arabic.
  try {
    await writeFont('Nirmala.ttc', ['/src/assets/Nirmala.ttc', '/Nirmala.ttc', 'Nirmala.ttc']);
  } catch (err) {
    console.error('[burnCaptions] Failed to load Nirmala.ttc:', err);
  }

  try {
    await writeFont('arial.ttf', ['/src/assets/arial.ttf', '/arial.ttf', 'arial.ttf']);
  } catch (err) {
    console.error('[burnCaptions] Failed to load arial.ttf:', err);
  }

  try {
    await writeFont('tahoma.ttf', ['/src/assets/tahoma.ttf', '/tahoma.ttf', 'tahoma.ttf']);
  } catch (err) {
    console.error('[burnCaptions] Failed to load tahoma.ttf:', err);
  }

  try {
    throwIfAborted(signal);
    await engine.writeFile('input.mp4', await fetchFile(file));
    throwIfAborted(signal);
    await engine.writeFile('caps.ass', assContent);
    throwIfAborted(signal);
    await engine.exec([
      '-i', 'input.mp4',
      '-vf', 'ass=caps.ass:fontsdir=.',
      '-c:a', 'copy',
      '-preset', 'ultrafast',
      '-y', 'out.mp4'
    ]);
    throwIfAborted(signal);
    const data = await engine.readFile('out.mp4');
    if (!data || (data as any).length <= 0) {
      throw new Error('FFmpeg produced an empty video. Please try re-burning this file.');
    }
    return { blob: new Blob([data], { type:'video/mp4' }) };
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}
