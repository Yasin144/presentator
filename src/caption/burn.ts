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

function pad2(n: number) { return String(Math.floor(n)).padStart(2,'0'); }
function toAss(s: number) {
  return `${pad2(s/3600)}:${pad2((s%3600)/60)}:${pad2(s%60)}.${String(Math.round((s-Math.floor(s))*100)).padStart(2,'0')}`;
}
function hexToAssColor(h: string) {
  const r=h.slice(1,3),g=h.slice(3,5),b=h.slice(5,7);
  return `&H00${b}${g}${r}`;
}

function buildAss(caps: CaptionItem[], s: CaptionSettings): string {
  const fs = Math.round(720 * (s.fontSize / 720));
  const pri = hexToAssColor(
    s.fontColor==='White'?'#ffffff':s.fontColor==='Yellow'?'#facc15':s.fontColor==='Cyan'?'#22d3ee':'#000000'
  );
  const sec = hexToAssColor(s.highlightColor || '#facc15');
  const align = s.position==='top' ? 8 : 2;
  const header = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,Arial,${fs},${pri},${sec},&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,0,${align},10,10,60,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text`;
  const lines = caps.map(c => {
    const words: WordItem[] = c.words?.length ? c.words : c.text.trim().split(/\s+/).map((t,i,a)=>({
      text:t, start:c.start+(i/a.length)*(c.end-c.start), end:c.start+((i+1)/a.length)*(c.end-c.start)
    }));
    const kar = words.map(w=>`{\\kf${Math.max(1,Math.round((w.end-w.start)*100))}}${w.text} `).join('');
    return `Dialogue: 0,${toAss(c.start)},${toAss(c.end)},Default,,0,0,0,,${kar.trim()}`;
  });
  return [header,...lines].join('\n');
}

export async function burnCaptions(
  file: File, caps: CaptionItem[], settings: CaptionSettings,
  onProgress: (p: number) => void,
): Promise<Blob> {
  const engine = await getFFmpeg();
  engine.on('progress', ({progress}) => onProgress(Math.round(progress*100)));
  await engine.writeFile('input.mp4', await fetchFile(file));
  await engine.writeFile('caps.ass', buildAss(caps, settings));
  await engine.exec(['-i','input.mp4','-vf','ass=caps.ass','-c:a','copy','-preset','ultrafast','-y','out.mp4']);
  const data = await engine.readFile('out.mp4');
  return new Blob([data], { type:'video/mp4' });
}
