import React, { useCallback, useEffect, useRef } from 'react';

const mediaUrl = path => encodeURI(`file:///${String(path || '').replace(/\\/g, '/')}`).replace(/#/g, '%23').replace(/\?/g, '%3F');

function MixerTrack({ track, elements }) {
  const attach = useCallback(element => {
    if (element) elements.current.set(track.id, element);
    else { elements.current.get(track.id)?.pause(); elements.current.delete(track.id); }
  }, [elements, track.id]);
  return <audio ref={attach} src={mediaUrl(track.path)} preload="metadata" loop={Boolean(track.loop)} />;
}

// Every positioned track follows the same project clock. Seeking, rate
// changes and image scenes therefore keep the full mix synchronized.
export default function PreviewAudioMixer({ tracks = [], music, musicVolume = .18, time = 0, playing = false, muted = false, active = true, duration = 0 }) {
  const elements = useRef(new Map());
  const audio = [...tracks, ...(music?.path ? [{ id: '__background_music', path: music.path, start: 0, duration, trimStart: 0, speed: 1, volume: musicVolume, fadeOut: Math.min(2, duration / 3), loop: true }] : [])];
  useEffect(() => {
    for (const track of audio) {
      const element = elements.current.get(track.id);
      if (!element) continue;
      const start = Math.max(0, Number(track.start) || 0);
      const length = Math.max(0, Number(track.duration) || 0);
      const local = time - start;
      const audible = active && !muted && !track.muted && local >= 0 && local < length;
      const speed = Math.max(.25, Math.min(4, Number(track.speed) || 1));
      const fadeIn = Math.max(0, Number(track.fadeIn) || 0);
      const fadeOut = Math.max(0, Number(track.fadeOut) || 0);
      const gain = Math.max(0, Math.min(1, Number(track.volume ?? 1)))
        * (fadeIn ? Math.max(0, Math.min(1, local / fadeIn)) : 1)
        * (fadeOut ? Math.max(0, Math.min(1, (length - local) / fadeOut)) : 1);
      element.volume = audible ? gain : 0;
      element.playbackRate = speed;
      if (!audible || !playing) { element.pause(); continue; }
      let desired = Math.max(0, Number(track.trimStart) || 0) + Math.max(0, local) * speed;
      if (track.loop && Number.isFinite(element.duration) && element.duration > 0) desired %= element.duration;
      if (element.readyState >= 1 && Math.abs(element.currentTime - desired) > .12 * speed) {
        try { element.currentTime = desired; } catch (_) {}
      }
      if (element.paused) element.play().catch(() => {});
    }
    const ids = new Set(audio.map(track => track.id));
    for (const [id, element] of elements.current) if (!ids.has(id)) { element.pause(); elements.current.delete(id); }
  }, [tracks, music, musicVolume, time, playing, muted, active, duration]);
  useEffect(() => () => { for (const element of elements.current.values()) element.pause(); }, []);
  return <div className="mx-hidden" aria-hidden="true">{audio.map(track => <MixerTrack key={track.id} track={track} elements={elements} />)}</div>;
}
