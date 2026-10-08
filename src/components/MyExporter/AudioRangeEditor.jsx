import React, { useEffect, useState } from 'react';

export default function AudioRangeEditor({ track, selection, selecting, disabled, previewing, onChange, onSelect, onEdge, onPreview, onStop, onRemove, onReattach }) {
  const start = Number(track.start), end = start + Number(track.duration);
  const range = selection?.trackId === track.id ? selection : { start, end };
  const [draft, setDraft] = useState({ start: range.start.toFixed(3), end: range.end.toFixed(3) });
  const [dirty, setDirty] = useState({});
  useEffect(() => { setDraft({ start: range.start.toFixed(3), end: range.end.toFixed(3) }); setDirty({}); }, [track.id, range.start, range.end]);
  const valid = selection?.trackId === track.id && !selection.awaitingEnd && selection.end - selection.start >= .001 - 1e-10;
  const commit = edge => {
    if (!dirty[edge]) return;
    // The untouched edge may have sub-millisecond precision from source speed.
    if (draft[edge].trim()) onChange(edge === 'start' ? Number(draft.start) : range.start, edge === 'end' ? Number(draft.end) : range.end);
    setDraft({ start: range.start.toFixed(3), end: range.end.toFixed(3) });
    setDirty({});
  };
  return <section className="mx-audio-range-editor" aria-label="Audio range editor">
    <div className="mx-panel-title">Audio range</div>
    <p>Drag across the waveform, or click In then Out. Remove leaves a silent gap and keeps the video in sync.</p>
    <button className={selecting ? 'active' : ''} disabled={disabled} onClick={onSelect}>Select Audio Range</button>
    <div className="mx-audio-range-fields">
      {['start', 'end'].map(edge => <label key={edge}>{edge === 'start' ? 'In' : 'Out'} (timeline seconds)
        <input aria-label={`Audio range ${edge === 'start' ? 'in' : 'out'}`} type="number" min={start} max={end} step=".001" disabled={disabled} value={draft[edge]} onChange={event => { setDraft(current => ({ ...current, [edge]: event.target.value })); setDirty(current => ({ ...current, [edge]: true })); }} onBlur={() => commit(edge)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } }} />
        <button disabled={disabled} onClick={() => onEdge(edge)}>Set {edge === 'start' ? 'In' : 'Out'} at playhead</button>
      </label>)}
    </div>
    <output>{selection?.awaitingEnd ? 'In marked · choose Out' : valid ? `${(selection.end - selection.start).toFixed(3)} seconds selected` : 'Choose the audio to remove'}</output>
    <div className="mx-audio-range-actions">
      <button disabled={disabled || !valid} onClick={previewing ? onStop : onPreview}>{previewing ? 'Stop Selected Audio' : 'Preview Selected Audio'}</button>
      <button className="mx-danger" disabled={disabled || !valid} onClick={onRemove}>Remove Selected Audio</button>
    </div>
    {(track.originSceneId || track.detachedFromSceneId || track.reattachedToSceneId) && <button disabled={disabled} onClick={onReattach}>Reattach Audio to Video</button>}
  </section>;
}
