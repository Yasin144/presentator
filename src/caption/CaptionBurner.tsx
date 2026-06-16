import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import JSZip from 'jszip';
import {
  QueueItem, CaptionItem, CaptionSettings, WordItem, Language,
} from './types';
import { transcribeWithHuggingFace } from './transcribe';
import { burnCaptions } from './burn';

// ── helpers ───────────────────────────────────────────────────────────────
const uid    = () => Math.random().toString(36).slice(2, 10);
const sanify = (n: string) => n.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 28) || 'video';

function dlBlob(blob: Blob, name: string) {
  const u = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: u, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(u), 5000);
}

const SC: Record<string, string> = {
  White:'#fff', Yellow:'#facc15', Cyan:'#22d3ee', Black:'#000',
  'Black (70%)':'rgba(0,0,0,.7)', 'White (20%)':'rgba(255,255,255,.2)', Transparent:'transparent',
};
const sc = (t: string) => SC[t] ?? '#fff';
const fmt = (s: number) => `${Math.floor(s/60)}:${(s%60).toFixed(1).padStart(4,'0')}`;

// ── Atoms ─────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/30">{children}</p>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-1.5">{children}</div>;
}
function Select({ label, value, opts, onChange }: { label:string; value:string; opts:string[]; onChange:(v:string)=>void }) {
  return (
    <div className="flex flex-col gap-0.5 flex-1">
      <span className="text-[7px] uppercase tracking-widest text-white/30">{label}</span>
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg text-[10px] text-white px-2 py-1.5 outline-none focus:border-blue-500/50 cursor-pointer">
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Num({ label, value, min, max, step=1, suffix, onChange }:
  { label:string; value:number; min?:number; max?:number; step?:number; suffix?:string; onChange:(v:number)=>void }) {
  return (
    <div className="flex flex-col gap-0.5 flex-1">
      <span className="text-[7px] uppercase tracking-widest text-white/30">{label}</span>
      <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={e=>onChange(parseFloat(e.target.value)||0)}
          className="flex-1 bg-transparent text-[10px] text-white px-2 py-1.5 outline-none min-w-0" />
        {suffix && <span className="text-[8px] text-white/30 pr-2 flex items-center">{suffix}</span>}
      </div>
    </div>
  );
}
function Btn({ children, onClick, disabled, solid=false, className='' }:
  { children:React.ReactNode; onClick?:()=>void; disabled?:boolean; solid?:boolean; className?:string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
        solid ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
      } ${disabled?'opacity-30 pointer-events-none':''} ${className}`}>
      {children}
    </button>
  );
}
function Badge({ s }: { s:string }) {
  const m: Record<string,string> = {
    idle:'bg-white/8 text-white/35', transcribing:'bg-blue-500/20 text-blue-300',
    transcribed:'bg-violet-500/20 text-violet-300', exporting:'bg-amber-500/20 text-amber-300',
    completed:'bg-green-500/20 text-green-300', failed:'bg-red-500/20 text-red-400',
  };
  return <span className={`text-[7px] font-mono uppercase px-1.5 py-0.5 rounded-full ${m[s]??''}`}>{s}</span>;
}

// ── Main component ────────────────────────────────────────────────────────
interface Props { onClose: () => void }

export default function CaptionBurner({ onClose }: Props) {
  const HF_TOKEN = localStorage.getItem('cb_hf_token') || 'HF_TOKEN_LOCAL';

  const [queue, setQueue]         = useState<QueueItem[]>([]);
  const [activeId, setActiveId]   = useState<string|null>(null);
  const [videoUrl, setVideoUrl]   = useState<string|null>(null);
  const [curTime, setCurTime]     = useState(0);
  const [processing, setProc]     = useState(false);
  const [batchOn, setBatch]       = useState(false);
  const [isZipping, setZipping]   = useState(false);
  const [errorMsg, setError]      = useState<string|null>(null);

  const [S, setS] = useState<CaptionSettings>({
    fontSize:52, fontColor:'White', bgColor:'Black (70%)',
    style:'pill', position:'bottom', xPos:50, yPos:80,
    highlightColor:'#facc15', language:'Auto-Detect', offset:0, maxWordsPerCaption:4,
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const vidRef  = useRef<HTMLVideoElement>(null);
  const procRef = useRef(false);
  const rafRef  = useRef(0);

  // RAF preview sync
  useEffect(() => {
    const loop = () => {
      if (vidRef.current && !vidRef.current.paused) setCurTime(vidRef.current.currentTime);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Position presets
  useEffect(() => {
    if (S.position==='top')    setS(s=>({...s, yPos:14}));
    if (S.position==='bottom') setS(s=>({...s, yPos:82}));
  }, [S.position]);

  // Video URL
  useEffect(() => {
    const item = queue.find(i=>i.id===activeId);
    if (!item) { setVideoUrl(null); return; }
    const u = item.outputUrl ?? (item.video.file ? URL.createObjectURL(item.video.file) : null);
    setVideoUrl(u);
    return () => { if (u && !item.outputUrl) URL.revokeObjectURL(u); };
  }, [activeId, queue]);

  const upd = useCallback((id:string, p:Partial<QueueItem>) =>
    setQueue(q=>q.map(i=>i.id===id?{...i,...p}:i)),[]);

  const addFiles = (files:File[]) => {
    setError(null);
    setQueue(q=>[...q,...files.filter(f=>f.type.startsWith('video/')).map(f=>({
      id:uid(), video:{name:f.name,mimeType:f.type,file:f},
      status:'idle' as const, progress:0, message:'Ready', retryCount:0,
    }))]);
  };

  // Transcribe
  const transcribeItem = useCallback(async (item:QueueItem) => {
    setError(null);
    try {
      const { captions, detectedLang } = await transcribeWithHuggingFace(
        item.video.file!, S.language, HF_TOKEN, S.maxWordsPerCaption,
        (msg,pct)=>upd(item.id,{status:'transcribing',message:msg,progress:pct}),
      );
      upd(item.id,{status:'transcribed',captions,message:`Ready · ${detectedLang}`,detectedLang,progress:0});
    } catch(e:any) {
      const msg = String(e.message||'Unknown error');
      upd(item.id,{status:'failed',message:msg.slice(0,80)});
      setError(msg);
    }
  },[S.language, S.maxWordsPerCaption, HF_TOKEN, upd]);

  // Burn
  const burnItem = useCallback(async (item:QueueItem) => {
    if (!item.captions) return;
    setError(null);
    upd(item.id,{status:'exporting',message:'Burning captions…',progress:0});
    try {
      const blob = await burnCaptions(item.video.file!,item.captions,S,p=>upd(item.id,{progress:p}));
      upd(item.id,{status:'completed',message:'Done ✓',progress:100,outputUrl:URL.createObjectURL(blob)});
    } catch(e:any) {
      const msg = String(e.message||'Burn failed');
      upd(item.id,{status:'failed',message:msg.slice(0,80)});
      setError(msg);
    }
  },[S,upd]);

  // Batch
  useEffect(()=>{
    if(processing||procRef.current||!batchOn) return;
    const next=queue.find(i=>i.status==='transcribed')??queue.find(i=>i.status==='idle');
    if(!next){setBatch(false);return;}
    procRef.current=true; setProc(true);
    (next.status==='transcribed'?burnItem(next):transcribeItem(next))
      .finally(()=>{procRef.current=false;setProc(false);});
  },[queue,processing,batchOn,transcribeItem,burnItem]);

  const activeItem  = queue.find(i=>i.id===activeId);
  const activeCap   = useMemo(()=>{
    if(!activeItem?.captions) return null;
    const t=Math.max(0,curTime-S.offset);
    return activeItem.captions.find(c=>t>=c.start&&t<=c.end)??null;
  },[activeItem,curTime,S.offset]);

  const getWords=(cap:CaptionItem):WordItem[]=>{
    if(cap.words?.length) return cap.words;
    const ws=cap.text.trim().split(/\s+/);
    return ws.map((text,i)=>({text,start:cap.start+(i/ws.length)*(cap.end-cap.start),end:cap.start+((i+1)/ws.length)*(cap.end-cap.start)}));
  };

  const downloadZip=async()=>{
    const done=queue.filter(i=>i.status==='completed'&&i.outputUrl);
    if(!done.length) return;
    setZipping(true);
    try {
      const zip=new JSZip();
      await Promise.all(done.map(async i=>{
        zip.file(`${sanify(i.video.name)}_captioned.mp4`,await fetch(i.outputUrl!).then(r=>r.arrayBuffer()));
      }));
      dlBlob(await zip.generateAsync({type:'blob'}),`captions_${Date.now()}.zip`);
    } finally { setZipping(false); }
  };

  const completedCount = queue.filter(i=>i.status==='completed').length;
  const isAllDone      = queue.length>0&&queue.every(i=>i.status==='completed');

  return (
    <div className="flex h-screen w-screen bg-[#0e0e0e] text-white overflow-hidden">
      <input ref={fileRef} type="file" accept="video/*" multiple className="hidden"
        onChange={e=>{addFiles(Array.from(e.target.files??[]));e.currentTarget.value='';}} />

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside className="w-[300px] h-full border-r border-white/10 flex flex-col p-4 gap-5 bg-[#0e0e0e] shrink-0 overflow-y-auto z-20"
        style={{scrollbarWidth:'thin',scrollbarColor:'#595959 transparent'}}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-black shadow-lg shadow-blue-500/30">CC</div>
            <div>
              <p className="text-[12px] font-black tracking-tight">Caption Burner</p>
              <p className="text-[8px] text-white/30">Whisper · Auto-Detect · Burn</p>
            </div>
          </div>
          <button onClick={onClose} title="Back to Presentator"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-sm">✕</button>
        </div>

        {/* Token status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/8 border border-green-500/20">
          <span className="text-green-400 text-sm">🔑</span>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-green-300">API Token Active</p>
            <p className="text-[7px] text-green-400/60 font-mono truncate">hf_jveRDA…permanently saved</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-red-400 text-sm shrink-0">⚠</span>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-red-300">Error</p>
              <p className="text-[7px] text-red-400/70 leading-relaxed">{errorMsg}</p>
            </div>
            <button onClick={()=>setError(null)} className="text-red-400/50 hover:text-red-300 text-xs shrink-0">✕</button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <Label>Global Controls</Label>
          <Btn onClick={()=>fileRef.current?.click()} className="w-full justify-center">📁 Add Videos</Btn>
          <Btn solid={!batchOn} disabled={queue.length===0||isAllDone}
            onClick={()=>setBatch(b=>!b)} className="w-full justify-center">
            {batchOn ? '⏸ Pause Batch' : '▶ Start Auto-Sync Batch'}
          </Btn>
        </div>

        {/* Design */}
        <div className="flex flex-col gap-2.5">
          <Label>Design Options (Pre-Set)</Label>
          <Row>
            <Select label="Style" value={S.style} opts={['pill','outline','minimal']} onChange={v=>setS(s=>({...s,style:v as any}))} />
            <Select label="Position" value={S.position} opts={['bottom','top','custom']} onChange={v=>setS(s=>({...s,position:v as any}))} />
          </Row>
          <Row>
            <Num label="Y Pos %" value={S.yPos} min={0} max={100} onChange={v=>setS(s=>({...s,yPos:v,position:'custom'}))} />
            <Num label="Font Size" value={S.fontSize} min={10} max={180} onChange={v=>setS(s=>({...s,fontSize:v}))} />
          </Row>
          <Row>
            <Num label="Words/Seg" value={S.maxWordsPerCaption} min={1} max={12} onChange={v=>setS(s=>({...s,maxWordsPerCaption:v}))} />
            <Num label="Offset" value={S.offset} min={-5} max={5} step={0.05} suffix="s" onChange={v=>setS(s=>({...s,offset:v}))} />
          </Row>
          <Row>
            <Select label="Font" value={S.fontColor} opts={['White','Yellow','Cyan','Black']} onChange={v=>setS(s=>({...s,fontColor:v as any}))} />
            <Select label="Background" value={S.bgColor} opts={['Black (70%)','White (20%)','Black','Transparent']} onChange={v=>setS(s=>({...s,bgColor:v as any}))} />
          </Row>
          <Select label="Language" value={S.language} opts={['Auto-Detect','Telugu','English','Hindi','Tamil','Urdu','Arabic']} onChange={v=>setS(s=>({...s,language:v as Language}))} />
          <div className="flex items-center gap-2">
            <span className="text-[7px] text-white/30 uppercase tracking-widest">Highlight</span>
            <input type="color" value={S.highlightColor} onChange={e=>setS(s=>({...s,highlightColor:e.target.value}))}
              className="w-7 h-5 rounded cursor-pointer bg-transparent border-0" />
            <span className="text-[8px] font-mono text-white/30">{S.highlightColor}</span>
          </div>
        </div>

        {/* Queue */}
        <div className="flex flex-col gap-2 mt-auto min-h-0">
          <div className="flex items-center justify-between">
            <Label>Process Queue</Label>
            {completedCount>0 && (
              <button onClick={downloadZip} disabled={isZipping}
                className="text-[8px] text-blue-400 font-bold uppercase hover:text-blue-300 disabled:opacity-40 transition-colors">
                {isZipping?'Zipping…':'📦 Zip All'}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[280px]"
            style={{scrollbarWidth:'thin',scrollbarColor:'#444 transparent'}}>
            {queue.length===0 && <div className="text-[8px] text-white/15 text-center py-6">No videos yet — click Add Videos</div>}
            {queue.map(item=>(
              <div key={item.id} onClick={()=>setActiveId(item.id)}
                className={`flex flex-col gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  item.id===activeId?'bg-white/10 border-white/20':'bg-white/4 border-transparent hover:bg-white/8'}`}>
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold truncate">{item.video.name}</p>
                    {item.detectedLang && <p className="text-[7px] text-violet-400/70">🌐 {item.detectedLang}</p>}
                    <p className="text-[7px] text-white/30 truncate">{item.message}</p>
                  </div>
                  <Badge s={item.status} />
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      item.status==='completed'?'bg-green-500':item.status==='failed'?'bg-red-500':'bg-blue-500'}`}
                      style={{width:`${item.status==='completed'?100:item.progress}%`}} />
                  </div>
                  <span className="text-[7px] font-mono text-white/25 shrink-0">
                    {item.status==='completed'?'✓':`${item.progress}%`}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {item.status==='idle' && (
                    <button onClick={e=>{e.stopPropagation();if(!processing)transcribeItem(item);}}
                      className="flex-1 text-[8px] py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all">
                      🎤 Transcribe
                    </button>
                  )}
                  {item.status==='transcribed' && (
                    <button onClick={e=>{e.stopPropagation();if(!processing)burnItem(item);}}
                      className="flex-1 text-[8px] py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-all">
                      🔥 Burn Captions
                    </button>
                  )}
                  {item.status==='completed'&&item.outputUrl && (
                    <button onClick={e=>{e.stopPropagation();fetch(item.outputUrl!).then(r=>r.blob()).then(b=>dlBlob(b,`${sanify(item.video.name)}_captioned.mp4`));}}
                      className="flex-1 text-[8px] py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 transition-all">
                      ⬇ Download
                    </button>
                  )}
                  {item.status==='failed' && (
                    <button onClick={e=>{e.stopPropagation();upd(item.id,{status:'idle',message:'Ready',progress:0,retryCount:item.retryCount+1});}}
                      className="flex-1 text-[8px] py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all">
                      🔄 Retry
                    </button>
                  )}
                  <button onClick={e=>{e.stopPropagation();setQueue(q=>q.filter(x=>x.id!==item.id));if(activeId===item.id)setActiveId(null);}}
                    className="px-2 text-[8px] py-1 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/8 transition-all">🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ══ MAIN AREA ═════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-black relative">

        {/* Top bar */}
        <div className="h-10 px-5 border-b border-white/5 flex items-center justify-between bg-[#0e0e0e]/80 backdrop-blur-xl shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
            {activeId ? `Preview — ${activeItem?.video.name}` : 'Select a video to preview design'}
          </span>
          <div className="flex items-center gap-3">
            {processing && (
              <div className="flex items-center gap-1.5 text-[8px] text-blue-400">
                <div className="w-2.5 h-2.5 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                Processing…
              </div>
            )}
          </div>
        </div>

        {/* Video preview */}
        <div className="flex-1 flex items-center justify-center p-12 bg-black"
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{e.preventDefault();addFiles(Array.from(e.dataTransfer.files));}}>
          {videoUrl ? (
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/5 max-w-full max-h-full aspect-video bg-[#050505] flex items-center justify-center">
              <video ref={vidRef} src={videoUrl} controls
                className="max-h-[70vh] max-w-full rounded-2xl"
                onTimeUpdate={()=>setCurTime(vidRef.current?.currentTime??0)} />

              {/* Caption overlay (preview only, before burn) */}
              {activeCap && !activeItem?.outputUrl && (
                <div className="absolute pointer-events-none z-50"
                  style={{left:`${S.xPos}%`,top:`${S.yPos}%`,transform:'translate(-50%,-50%)'}}>
                  <div className="px-8 py-3 font-black flex items-center gap-2 backdrop-blur-sm border border-white/5"
                    style={{backgroundColor:sc(S.bgColor),fontSize:`${S.fontSize*0.7}px`,color:sc(S.fontColor),
                      borderRadius:S.style==='pill'?'9999px':'12px'}}>
                    {getWords(activeCap).map((w,i)=>{
                      const t=Math.max(0,curTime-S.offset);
                      const lit=t>=w.start&&t<=w.end;
                      return <span key={i} className="caption-word" style={{
                        color:lit?S.highlightColor:'inherit',
                        fontWeight:lit?900:700,
                        transform:lit?'scale(1.05)':'scale(1)',
                        display:'inline-block', transition:'all 0.15s ease-out',
                      }}>{w.text}</span>;
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 opacity-15 cursor-pointer select-none"
              onClick={()=>fileRef.current?.click()}>
              <span className="text-[80px]">🎬</span>
              <p className="text-xl font-light uppercase tracking-widest">Select a video to preview design</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="h-40 border-t border-white/5 bg-[#0e0e0e] flex items-center gap-4 px-8 overflow-x-auto shrink-0"
          style={{scrollbarWidth:'thin',scrollbarColor:'#595959 transparent'}}>
          {activeItem?.captions && activeItem.captions.length>0 ? (
            activeItem.captions.map((cap,i)=>{
              const t=Math.max(0,curTime-S.offset);
              const active=t>=cap.start&&t<=cap.end;
              return (
                <button key={i} onClick={()=>{if(vidRef.current)vidRef.current.currentTime=cap.start;}}
                  className={`min-w-[200px] h-24 p-3 rounded-xl border text-left transition-all shrink-0 flex flex-col justify-between ${
                    active?'bg-blue-500/10 border-blue-500/40':'bg-white/5 border-transparent hover:bg-white/8'}`}>
                  <p className="text-[11px] font-bold line-clamp-2 leading-tight">{cap.text}</p>
                  <span className="text-[9px] font-mono opacity-40">{fmt(cap.start)}</span>
                </button>
              );
            })
          ) : (
            <div className="w-full flex items-center justify-center opacity-10 uppercase text-[10px] tracking-widest">
              Captions will appear here after sync
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
