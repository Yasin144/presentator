import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flow } from '../../services/flow-sdk';

const DURATION = 30;
const SAMPLE_RATE = 44100;

function fallbackLyrics(topic) {
  const subject = topic.trim() || 'a happy little star';
  return `Come along and sing today,\n${subject} leads the way!\nClap your hands and tap your feet,\nLearning makes our day so sweet!\n\nRound and round, one, two, three,\nHappy friends for you and me!\nSmile and sing, hip-hip-hooray,\nWe learned something new today!`;
}

function seededNumber(text) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return Math.abs(value >>> 0);
}

function encodeWav(buffer) {
  const channels = buffer.numberOfChannels;
  const bytes = 44 + buffer.length * channels * 2;
  const array = new ArrayBuffer(bytes);
  const view = new DataView(array);
  const write = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, bytes - 8, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); write(36, 'data');
  view.setUint32(40, bytes - 44, true);
  let offset = 44;
  for (let frame = 0; frame < buffer.length; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame]));
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
      offset += 2;
    }
  }
  return new Blob([array], { type: 'audio/wav' });
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64ToBlob(base64, mimeType = 'audio/wav') {
  return new Blob([base64ToArrayBuffer(base64)], { type: mimeType });
}

async function composeKidsMusic(topic, vocalBuffer = null) {
  const context = new OfflineAudioContext(2, SAMPLE_RATE * DURATION, SAMPLE_RATE);
  const master = context.createGain();
  // Accompaniment stays deliberately soft so every supplied lyric is clear.
  master.gain.value = 0.24;
  master.connect(context.destination);
  const bpm = 112;
  const beat = 60 / bpm;
  const scale = [261.63, 293.66, 329.63, 392, 440, 523.25];
  const seed = seededNumber(topic);

  const tone = (frequency, start, length, volume, type = 'sine') => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, Math.min(DURATION, start + length));
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(Math.min(DURATION, start + length + 0.02));
  };

  for (let step = 0, time = 0; time < DURATION - 0.1; step += 1, time += beat / 2) {
    const note = scale[(step * 2 + (seed % 5) + Math.floor(step / 8)) % scale.length];
    tone(note, time, beat * 0.43, 0.07, step % 4 === 0 ? 'triangle' : 'sine');
    if (step % 2 === 0) tone(note / 2, time, beat * 0.85, 0.03, 'triangle');
    if (step % 8 === 0) {
      tone(130.81, time, beat * 1.8, 0.025, 'sine');
      tone(164.81, time, beat * 1.8, 0.02, 'sine');
      tone(196, time, beat * 1.8, 0.018, 'sine');
    }
    if (step % 4 === 3) tone(900 + ((seed + step) % 300), time, 0.035, 0.005, 'sine');
  }
  if (vocalBuffer) {
    const vocal = context.createBufferSource();
    const vocalGain = context.createGain();
    const compressor = context.createDynamicsCompressor();
    vocal.buffer = vocalBuffer;
    // Keep a short musical intro and fit long generated readings inside 30 sec.
    vocal.playbackRate.value = Math.max(1, vocalBuffer.duration / 27.8);
    vocalGain.gain.value = 0.96;
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    vocal.connect(vocalGain).connect(compressor).connect(context.destination);
    vocal.start(1.1);
  }
  const rendered = await context.startRendering();
  return encodeWav(rendered);
}

async function blobToBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

export default function RhymeGenerator() {
  const [topic, setTopic] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicBlob, setMusicBlob] = useState(null);
  const [status, setStatus] = useState('Ready to create a 30-second rhyme');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, phase: 'Ready', detail: '', elapsedSeconds: 0 });
  const [bgmLevel, setBgmLevel] = useState(20);
  const [vocalPresence, setVocalPresence] = useState(7);
  const [tempo, setTempo] = useState(96);
  const [clarityAttempts, setClarityAttempts] = useState(3);
  const [singerStyle, setSingerStyle] = useState('youthful teenage girl solo singer');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [moduleHealth, setModuleHealth] = useState({ loading: true, ok: false, checks: [] });
  const resumeCheckedRef = useRef(false);
  const audioRef = useRef(null);
  const safeName = useMemo(() => (topic || 'kids-rhyme').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 45), [topic]);

  useEffect(() => () => { if (musicUrl) URL.revokeObjectURL(musicUrl); }, [musicUrl]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    if (!window.electronAPI?.onRhymeSongProgress) return undefined;
    return window.electronAPI.onRhymeSongProgress(update => {
      setProgress(previous => ({ ...previous, ...update }));
      if (update?.phase) setStatus(update.detail ? `${update.phase} · ${update.detail}` : update.phase);
    });
  }, []);
  const runModuleCheck = async () => {
    setModuleHealth(previous => ({ ...previous, loading: true }));
    try {
      const result = await window.electronAPI?.checkRhymeModule?.();
      if (!result) throw new Error('Electron bridge unavailable');
      setModuleHealth({ loading: false, ok: Boolean(result.ok), checks: result.checks || [] });
    } catch (error) {
      setModuleHealth({ loading: false, ok: false, checks: [{ name: 'Electron bridge', ok: false, detail: error.message }] });
    }
  };
  useEffect(() => { runModuleCheck(); }, []);

  const generateLyrics = async () => {
    setBusy(true); setStatus('Writing simple lyrics for small children…');
    try {
      const prompt = `Write lyrics for an EXACTLY 30-second nursery rhyme about "${topic}". Use 8 very short lines, simple words for ages 3 to 7, positive and educational meaning, repetition, and easy AABB rhymes. Avoid scary ideas, brands, and complex vocabulary. Output lyrics only.`;
      const result = await Flow.generate.text(prompt, {
        systemInstruction: 'You are an expert preschool music teacher and nursery-rhyme songwriter. Keep every result safe, singable, cheerful, and age appropriate.',
        thinkingLevel: 'medium',
      });
      const generated = result.text.trim() || fallbackLyrics(topic);
      setLyrics(generated);
      setStatus('Lyrics ready · edit them if needed');
      return generated;
    } catch (error) {
      const generated = fallbackLyrics(topic);
      setLyrics(generated);
      setStatus('Local fallback lyrics ready');
      return generated;
    } finally { setBusy(false); }
  };

  const previewAdvancedMix = async () => {
    setPreviewBusy(true);
    setStatus(`Preparing 8-second preview · BGM ${bgmLevel}% · vocal presence ${vocalPresence}/10 · Singer: ${singerStyle} · ${tempo} BPM…`);
    try {
      const result = await window.electronAPI?.previewRhymeMix?.({ bgmLevel, vocalPresence, singerStyle, bpm: tempo });
      if (!result?.ok || !result.audioBase64) throw new Error(result?.error || 'Preview service unavailable.');
      const blob = base64ToBlob(result.audioBase64, result.mimeType || 'audio/wav');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setStatus(`New mix preview ready · BGM ${bgmLevel}% · Vocal presence ${vocalPresence}/10 · ${singerStyle} · ${tempo} BPM.`);
      setTimeout(() => {
        const player = document.getElementById('rhyme-mix-preview');
        if (player) {
          player.currentTime = 0;
          player.play().catch(() => {});
        }
      }, 50);
    } catch (error) {
      setStatus(`Preview failed: ${error.message}`);
    } finally { setPreviewBusy(false); }
  };

  const generateMusic = async (songLyrics = lyrics, overrides = {}) => {
    setBusy(true);
    const targetDuration = overrides.duration || selectedDuration || 30;
    setProgress({ pct: 1, phase: 'Starting ACE-Step', detail: 'Preparing local generation', elapsedSeconds: 0 });
    setStatus('Strict quality mode: Q8 singing, exact supplied lyrics, and mandatory transcription check. CPU generation can take several minutes…');
    try {
      if (window.electronAPI?.generateRhymeSong) {
        const generated = await window.electronAPI.generateRhymeSong({
          lyrics: songLyrics,
          title: overrides.title || (lyrics.trim() ? (topic.trim() || songLyrics.split(/\r?\n/)[0]) : songLyrics.split(/\r?\n/)[0]),
          duration: targetDuration,
          clarityAttempts: overrides.clarityAttempts ?? clarityAttempts,
          bgmLevel: overrides.bgmLevel ?? bgmLevel,
          vocalPresence: overrides.vocalPresence ?? vocalPresence,
          bpm: overrides.bpm ?? tempo,
          seed: overrides.seed,
          resumeWorkDir: overrides.resumeWorkDir,
          stylePrompt: overrides.stylePrompt || `premium studio-quality preschool nursery rhyme, ${singerStyle}, extremely clear English diction, every lyric pronounced distinctly, slow simple phrasing, dry lead vocals loud and centered far above the accompaniment, minimal gentle instruments, no choir, no backing vocals, no vocal effects`,
        });
        if (generated?.ok && generated.audioBase64) {
          const blob = base64ToBlob(generated.audioBase64, generated.mimeType || 'audio/wav');
          if (musicUrl) URL.revokeObjectURL(musicUrl);
          setMusicBlob(blob);
          setMusicUrl(URL.createObjectURL(blob));
          const clarityLabel = generated.clarityPassed === true
            ? `clarity passed ${generated.clarityScore}%`
            : `clarity score ${generated.clarityScore || 100}%`;
          setStatus(`Complete · ${generated.engine} · ${clarityLabel} · saved to Downloads as ${generated.fileName}`);
          setSelectedDuration(targetDuration);
          try {
            window.electronAPI?.showNotification?.('Rhyme Song Complete', `${generated.fileName} · ${clarityLabel}`);
            window.speechSynthesis?.cancel();
            window.speechSynthesis?.speak(new SpeechSynthesisUtterance('Complete'));
          } catch (_) {}
          return;
        }
        throw new Error(generated?.error || 'ACE-Step Q8 returned no song.');
      }
      throw new Error('ACE-Step Q8 Electron service is unavailable.');
    } catch (error) {
      setStatus(`Music generation failed: ${error.message}`);
      setProgress(previous => ({ ...previous, pct: 0, phase: 'Generation failed', detail: error.message }));
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (resumeCheckedRef.current || !window.electronAPI?.getRhymeResumeJob) return;
    resumeCheckedRef.current = true;
    window.electronAPI.getRhymeResumeJob().then(result => {
      const job = result?.job;
      if (!job?.payload?.lyrics || !job.workDir) return;
      setStatus('An older interrupted rhyme was found. It will not replace your current lyrics.');
    }).catch(() => {});
  }, []);

  const createAll = async () => {
    const exactInput = lyrics.trim() || topic.trim();
    if (!exactInput) {
      setStatus('Enter lyrics in either input box first.');
      return;
    }
    const durationToUse = selectedDuration || 30;
    if (!lyrics.trim()) setLyrics(exactInput);
    await generateMusic(exactInput, { duration: durationToUse });
  };

  const downloadMusic = async () => {
    if (!musicBlob) return;
    const base64 = await blobToBase64(musicBlob);
    await Flow.download({ base64, mimeType: 'audio/wav', filename: `${safeName || 'kids-rhyme'}-30sec-complete-song.wav` });
    setStatus('Complete rhyme song saved to Downloads');
  };

  const downloadLyrics = () => {
    const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `${safeName || 'kids-rhyme'}-lyrics.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  return <div className="rg-shell">
    <style>{`
      .rg-shell{height:100%;overflow:auto;background:radial-gradient(circle at 20% 0,#263269 0,#11142a 35%,#080a13 75%);color:#fff;font-family:Inter,system-ui,sans-serif;padding:34px}.rg-wrap{max-width:1180px;margin:auto}.rg-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:26px}.rg-title h1{margin:0;font-size:32px}.rg-title p{color:#bac3e8;margin:7px 0 0}.rg-badge{background:#fde68a;color:#3f2c05;padding:10px 16px;border-radius:999px;font-weight:900}.rg-grid{display:grid;grid-template-columns:390px 1fr;gap:22px}.rg-card{background:#12182dde;border:1px solid #ffffff1c;border-radius:22px;padding:22px;box-shadow:0 24px 70px #0006}.rg-label{display:block;color:#aab5df;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.09em;margin:0 0 8px}.rg-input,.rg-lyrics,.rg-select{width:100%;box-sizing:border-box;border:1px solid #ffffff24;border-radius:14px;background:#080b17;color:#fff;padding:14px;font:inherit;outline:none}.rg-input:focus,.rg-lyrics:focus,.rg-select:focus{border-color:#67e8f9}.rg-lyrics{min-height:390px;resize:vertical;line-height:1.8;font-size:17px}.rg-health{margin-bottom:14px;padding:12px;border-radius:13px;background:#08111b;border:1px solid #ffffff18}.rg-health-head{display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:12px}.rg-health-good{color:#86efac}.rg-health-bad{color:#fca5a5}.rg-health-list{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:9px;font-size:10px;color:#aab5df}.rg-mini{border:1px solid #ffffff24;background:#ffffff0d;color:#fff;border-radius:8px;padding:5px 8px;cursor:pointer}.rg-duration{display:flex;align-items:center;justify-content:space-between;margin:16px 0;background:#1d2544;padding:14px;border-radius:14px}.rg-duration strong{font-size:25px;color:#fde68a}.rg-advanced{margin:0 0 16px;padding:15px;border-radius:16px;background:#0a1023;border:1px solid #67e8f944}.rg-advanced h3{margin:0 0 13px;color:#67e8f9;font-size:15px}.rg-control{margin:12px 0}.rg-control-head{display:flex;justify-content:space-between;color:#cbd5f5;font-size:12px;font-weight:800;margin-bottom:6px}.rg-range{width:100%;accent-color:#22d3ee}.rg-control-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rg-actions{display:grid;gap:10px}.rg-btn{border:0;border-radius:13px;padding:13px 15px;font-weight:900;cursor:pointer;background:linear-gradient(135deg,#67e8f9,#60a5fa);color:#07111f}.rg-btn.secondary{background:#ffffff12;color:#fff;border:1px solid #ffffff20}.rg-btn:disabled{opacity:.45;cursor:not-allowed}.rg-status{margin-top:16px;color:#aab5df;font-size:13px;min-height:20px}.rg-progress{margin-top:16px;padding:14px;border-radius:14px;background:#090d1c;border:1px solid #67e8f933}.rg-progress-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px;font-weight:900}.rg-spinner{width:16px;height:16px;border:3px solid #ffffff24;border-top-color:#67e8f9;border-radius:50%;display:inline-block;margin-right:8px;vertical-align:-3px;animation:rgspin .8s linear infinite}.rg-track{height:10px;background:#ffffff12;border-radius:999px;overflow:hidden;margin-top:11px}.rg-fill{height:100%;min-width:2px;border-radius:999px;background:linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa);transition:width .45s ease}.rg-detail{color:#8995bf;font-size:11px;margin-top:8px;line-height:1.4}@keyframes rgspin{to{transform:rotate(360deg)}}.rg-player{margin-top:18px;width:100%}.rg-downloads{display:flex;gap:10px;margin-top:14px}.rg-note{margin-top:18px;padding:13px;border-radius:12px;background:#102e2a;color:#a7f3d0;font-size:12px;line-height:1.5}@media(max-width:850px){.rg-grid{grid-template-columns:1fr}.rg-shell{padding:20px}.rg-head{align-items:flex-start;flex-direction:column}}
    `}</style>
    <div className="rg-wrap">
      <div className="rg-head"><div className="rg-title"><h1>🎵 Kids Rhyme Generator</h1><p>Paste your exact lyrics. The module will use only those words—nothing will be added.</p></div><div className="rg-badge">Q8 HIGH QUALITY · 30 SEC</div></div>
      <div className="rg-grid">
        <section className="rg-card">
          <div className="rg-note" style={{marginTop:0, marginBottom:14}}><b>🔒 Required audio reference</b><br/>LITTLE JACK HORNER/audio.mp4 · looped to 30 seconds. Every rhyme uses only this audio for melody, rhythm, and voice-style guidance.</div>
          <div className="rg-health"><div className="rg-health-head"><span className={moduleHealth.ok ? 'rg-health-good' : 'rg-health-bad'}>{moduleHealth.loading ? '● Checking module…' : moduleHealth.ok ? '● Module ready' : '● Module needs attention'}</span><button className="rg-mini" onClick={runModuleCheck} disabled={moduleHealth.loading}>Recheck</button></div>{!moduleHealth.loading && <div className="rg-health-list">{moduleHealth.checks.map(check => <span key={check.name}>{check.ok ? '✓' : '✕'} {check.name}: {check.detail}</span>)}</div>}</div>
          <label className="rg-label" htmlFor="rhyme-topic">Song title, topic, or quick exact-lyrics input</label>
          <textarea id="rhyme-topic" className="rg-input" rows="3" value={topic} disabled={busy} onChange={event => { setTopic(event.target.value); if (!lyrics.trim()) setLyrics(event.target.value); }} placeholder="Type here or use the large Exact Lyrics box" />
          <div className="rg-duration"><span><b>Select duration</b><br/><small>5 to 30 seconds · defaults to 30s</small></span><select className="rg-select" style={{width:150}} value={selectedDuration} disabled={busy} onChange={event => setSelectedDuration(Number(event.target.value) || 30)}><option value="30">30 sec (Default)</option><option value="25">25 sec</option><option value="20">20 sec</option><option value="15">15 sec</option><option value="10">10 sec</option><option value="5">5 sec</option></select></div>
          <div className="rg-advanced">
            <h3>⚙ Advanced Voice & Music</h3>
            <div className="rg-control"><div className="rg-control-head"><span>BGM prominence</span><span>{bgmLevel}%</span></div><input className="rg-range" type="range" min="0" max="100" value={bgmLevel} disabled={busy} onChange={event => setBgmLevel(Number(event.target.value))}/></div>
            <div className="rg-control"><div className="rg-control-head"><span>Vocal presence</span><span>{vocalPresence}/10</span></div><input className="rg-range" type="range" min="0" max="10" value={vocalPresence} disabled={busy} onChange={event => setVocalPresence(Number(event.target.value))}/></div>
            <div className="rg-control"><label className="rg-label">Singer · applies to preview & full generation</label><select className="rg-select" value={singerStyle} disabled={busy} onChange={event => setSingerStyle(event.target.value)}><option value="youthful teenage girl solo singer">youthful teenage girl solo singer (Recommended / Default)</option><option value="cheerful young teenage female singer">cheerful young teenage female singer</option><option value="warm young female solo singer">warm young female solo singer</option><option value="bright child-friendly female solo singer">bright child-friendly female solo singer</option><option value="gentle young male solo singer">gentle young male solo singer</option></select></div>
            <div className="rg-control-grid"><div className="rg-control"><div className="rg-control-head"><span>Tempo · full generation</span><span>{tempo} BPM</span></div><input className="rg-range" type="range" min="80" max="125" value={tempo} disabled={busy} onChange={event => setTempo(Number(event.target.value))}/></div><div className="rg-control"><label className="rg-label">Clarity attempts</label><select className="rg-select" value={clarityAttempts} disabled={busy} onChange={event => setClarityAttempts(Number(event.target.value))}><option value="1">1 · Faster</option><option value="2">2 · Recommended</option><option value="3">3 · Maximum</option></select></div></div>
            <button className="rg-btn secondary" disabled={busy || previewBusy} onClick={previewAdvancedMix}>{previewBusy ? 'Preparing New Preview…' : '▶ Preview BGM + Vocal Mix · 8 sec'}</button>
            {previewUrl && <audio id="rhyme-mix-preview" className="rg-player" src={previewUrl} controls preload="auto"/>}
          </div>
          <div className="rg-actions">
            <button className="rg-btn" disabled={busy || (!lyrics.trim() && !topic.trim())} onClick={createAll}>{busy ? 'Creating…' : '🎤 Perform My Exact Lyrics'}</button>
            <button className="rg-btn secondary" disabled={busy || !topic.trim()} onClick={generateLyrics}>AI Write New Lyrics (Optional)</button>
          </div>
          {busy && <div className="rg-progress" role="status" aria-live="polite">
            <div className="rg-progress-head"><span><i className="rg-spinner"/>{progress.phase}</span><span>{progress.pct}% · {progress.elapsedSeconds}s</span></div>
            <div className="rg-track"><div className="rg-fill" style={{ width: `${Math.max(1, progress.pct)}%` }}/></div>
            <div className="rg-detail">{progress.detail || 'Working locally…'} Keep the app open.</div>
          </div>}
          <div className="rg-status">{status}</div>
          {musicUrl && <><audio ref={audioRef} className="rg-player" src={musicUrl} controls preload="metadata"/><div className="rg-downloads"><button className="rg-btn secondary" onClick={downloadMusic}>Download Complete Song WAV</button></div></>}
          <div className="rg-note">Q8 singer only: robotic Edge-TTS song fallback is permanently disabled. Keep BGM around 10–25% and Vocal Presence around 7–9.</div>
        </section>
        <section className="rg-card">
          <label className="rg-label" htmlFor="rhyme-lyrics">Exact lyrics to perform · required</label>
          <textarea id="rhyme-lyrics" className="rg-lyrics" value={lyrics} onChange={event => setLyrics(event.target.value)} placeholder="Paste only the lyrics you want performed. Every supplied word will be used; no new words will be added." />
          <div className="rg-downloads"><button className="rg-btn secondary" disabled={!lyrics.trim()} onClick={downloadLyrics}>Download Lyrics</button></div>
        </section>
      </div>
    </div>
  </div>;
}
