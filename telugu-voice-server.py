"""
Telugu Voice TTS Server  —  telugu-voice-server.py
===================================================
Uses the EXACT SAME ENGINE as SC3 (Chatterbox TTS).
Voice is cloned from: C:\\Users\\patan\\Desktop\\telugh referance voice.mp4

How it works:
  1. Extract 30-45s of clean audio from the reference MP4 (once, at startup)
  2. Load Chatterbox TTS (same model as SC3)
  3. Transliterate Telugu → phonetic English (so Chatterbox pronounces it correctly)
  4. Generate speech with audio_prompt_path = reference WAV
     → Output = Chatterbox naturalness + EXACT voice of the Telugu reference person

PORT : 8433
VENV : D:\\voice\\.voiceclone-venv  (same venv as anjali-chatterbox-server.py)
API  : POST /api/narrate  { "text": "..." }
       GET  /health
       GET  /api/narrate/progress
"""

import io
import json
import os
import re
import socket
import subprocess
import sys
import tempfile
import threading
import time
import traceback
import wave
from collections import OrderedDict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# ── Force UTF-8 stdout ───────────────────────────────────────────────────────
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Strip proxy env vars ─────────────────────────────────────────────────────
for _k in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"):
    os.environ.pop(_k, None)

# ── HuggingFace cache — same location as SC3 ─────────────────────────────────
_HF_CACHE = r"D:\AppData\hf-cache\huggingface"
os.environ["HF_HOME"]               = _HF_CACHE
os.environ["HUGGINGFACE_HUB_CACHE"] = _HF_CACHE + r"\hub"
os.environ["HF_HUB_CACHE"]          = _HF_CACHE + r"\hub"
os.environ["TRANSFORMERS_CACHE"]    = _HF_CACHE + r"\hub"
os.environ["HF_HUB_OFFLINE"]        = "1"
os.environ["TRANSFORMERS_OFFLINE"]  = "1"

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────
PROJECT_ROOT  = Path(__file__).resolve().parent
PORT          = 8433
CACHE_LIMIT   = 256

# Reference video — user's Telugu speaker
REFERENCE_MP4 = Path(r"C:\Users\patan\Desktop\telugh referance voice.mp4")
REFERENCE_WAV = PROJECT_ROOT / "voice-reference-telugu.wav"

# Disk cache
DISK_CACHE_DIR       = PROJECT_ROOT / "tts-cache-telugu"
DISK_CACHE_MAX_BYTES = 512 * 1024 * 1024   # 512 MB
DISK_CACHE_DIR.mkdir(exist_ok=True)

print("+------------------------------------------------------------+", flush=True)
print("|  Telugu Voice TTS Server  —  Chatterbox (same as SC3)     |", flush=True)
print("|  Reference: telugh referance voice.mp4                     |", flush=True)
print("|  Loading... please wait                                     |", flush=True)
print("+------------------------------------------------------------+", flush=True)


# ─────────────────────────────────────────────────────────────────────────────
# TRANSLITERATION  (Telugu → Phonetic English for Chatterbox)
# Same proven maps as anjali-chatterbox-server.py
# ─────────────────────────────────────────────────────────────────────────────
_TELU_VOWELS = {
    'అ': 'u',  'ఆ': 'aa', 'ఇ': 'i',  'ఈ': 'ee',
    'ఉ': 'u',  'ఊ': 'oo', 'ఋ': 'ri', 'ఎ': 'e',
    'ఏ': 'ay', 'ఐ': 'ai', 'ఒ': 'o',  'ఓ': 'oh',
    'ఔ': 'ow', 'అం': 'am','అః': 'ah','ఓం': 'om',
}
_TELU_CONSONANTS = {
    'క': 'k',  'ఖ': 'kh',  'గ': 'g',   'ఘ': 'gh',  'ఙ': 'ng',
    'చ': 'ch', 'ఛ': 'chh', 'జ': 'j',   'ఝ': 'jh',  'ఞ': 'ny',
    'ట': 't',  'ఠ': 'th',  'డ': 'd',   'ఢ': 'dh',  'ణ': 'n',
    'త': 't',  'థ': 'th',  'ద': 'd',   'ధ': 'dh',  'న': 'n',
    'ప': 'p',  'ఫ': 'f',   'బ': 'b',   'భ': 'bh',  'మ': 'm',
    'య': 'y',  'ర': 'r',   'ల': 'l',   'వ': 'v',   'ళ': 'll', 'ఱ': 'r',
    'శ': 'sh', 'ష': 'sh',  'స': 's',   'హ': 'h',
    'క్ష': 'ksh', 'జ్ఞ': 'gn', 'శ్ర': 'shr',
}
_TELU_MATRAS = {
    'ా': 'aa', 'ి': 'i',  'ీ': 'ee',
    'ు': 'u',  'ూ': 'oo', 'ృ': 'ri',
    'ె': 'e',  'ే': 'ay', 'ై': 'ai',
    'ొ': 'o',  'ో': 'oh', 'ౌ': 'ow',
    'ం': 'm',  'ః': 'h',  'ఁ': 'm',
    '్': None,
}
_TELU_DIGITS = {'౦':'0','౧':'1','౨':'2','౩':'3','౪':'4','౫':'5','౬':'6','౭':'7','౮':'8','౯':'9'}


def _transliterate_telugu(text: str) -> str:
    result = []
    chars  = list(text)
    i, n   = 0, len(chars)
    while i < n:
        c      = chars[i]
        triple = ''.join(chars[i:i+3])
        double = ''.join(chars[i:i+2])
        phoneme, match_len = None, 0

        if triple in _TELU_CONSONANTS: phoneme, match_len = _TELU_CONSONANTS[triple], 3
        elif double in _TELU_CONSONANTS: phoneme, match_len = _TELU_CONSONANTS[double], 2
        elif c in _TELU_CONSONANTS:    phoneme, match_len = _TELU_CONSONANTS[c], 1

        if phoneme is not None:
            i += match_len
            if i < n and chars[i] in _TELU_MATRAS:
                mv = _TELU_MATRAS[chars[i]]; i += 1
                result.append(phoneme if mv is None else phoneme + mv)
            else:
                at_end = (i >= n) or (chars[i] in ' .,!?;:')
                result.append(phoneme if at_end else phoneme + 'u')
            continue

        if c in _TELU_VOWELS:  result.append(_TELU_VOWELS[c]);  i += 1; continue
        if c in _TELU_MATRAS:
            mv = _TELU_MATRAS[c]
            if mv: result.append(mv)
            i += 1; continue
        if c in _TELU_DIGITS: result.append(_TELU_DIGITS[c]); i += 1; continue
        result.append(c); i += 1

    phonetic = ''.join(result)
    phonetic = re.sub(r'([bcdfghjklmnpqrstvwxyz])\1{2,}', r'\1\1', phonetic)
    phonetic = re.sub(r'([aeiou])\1{2,}', r'\1\1', phonetic)
    phonetic = phonetic.replace('uu', 'oo')
    phonetic = re.sub(r'\s+', ' ', phonetic).strip()
    return phonetic


def _is_telugu(text: str) -> bool:
    return any('\u0c00' <= c <= '\u0c7f' for c in text)


def _clean(text: str) -> str:
    t = str(text or '').strip()
    t = re.sub(r'\s*&\s*', ' and ', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'^#{1,6}\s+', '', t, flags=re.M)
    t = re.sub(r'[*_~`]{1,3}', '', t)
    t = re.sub(r'^\s*[\u2022\-\*\+]\s+', '', t, flags=re.M)
    t = re.sub(r'[ \t]+', ' ', t)
    t = t.strip()
    if _is_telugu(t):
        t = _transliterate_telugu(t)
        print(f"[TeluguVoice] Transliterated → {t[:80]!r}", flush=True)
    return t


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1:  Extract reference audio from Telugu reference MP4
# ─────────────────────────────────────────────────────────────────────────────

def _extract_reference_wav(mp4: Path, wav: Path) -> bool:
    if not mp4.exists():
        print(f"[TeluguVoice] ERROR: Reference MP4 not found: {mp4}", flush=True)
        return False
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", str(mp4)],
            capture_output=True, text=True
        )
        duration = 0.0
        for s in json.loads(probe.stdout or "{}").get("streams", []):
            try: duration = max(duration, float(s.get("duration", 0)))
            except: pass

        start = max(0.0, (duration / 2) - 20.0) if duration > 40 else 0.0
        dur   = min(40.0, duration) if duration > 0 else 40.0

        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(mp4),
            "-ss", str(start), "-t", str(dur),
            "-vn", "-ac", "1", "-ar", "24000", "-sample_fmt", "s16",
            "-af", "loudnorm",
            str(wav),
        ], check=True)
        print(f"[TeluguVoice] ✔ Reference WAV → {wav.name} "
              f"({wav.stat().st_size // 1024} KB, 24kHz mono)", flush=True)
        return True
    except Exception as e:
        print(f"[TeluguVoice] ERROR extracting WAV: {e}", flush=True)
        traceback.print_exc()
        return False


if REFERENCE_WAV.exists() and REFERENCE_WAV.stat().st_size > 20_000:
    print(f"[TeluguVoice] Reference WAV already cached "
          f"({REFERENCE_WAV.stat().st_size // 1024} KB).", flush=True)
else:
    print(f"[TeluguVoice] Extracting voice from: {REFERENCE_MP4.name}", flush=True)
    if not _extract_reference_wav(REFERENCE_MP4, REFERENCE_WAV):
        print("[TeluguVoice] FATAL: No reference WAV. Exiting.", flush=True)
        sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2:  Load Chatterbox TTS  (SAME as SC3 — no other engine)
# ─────────────────────────────────────────────────────────────────────────────
try:
    import torch
    from chatterbox.tts import ChatterboxTTS

    cpu_count = os.cpu_count() or 4
    torch.set_num_threads(cpu_count)
    torch.set_num_interop_threads(max(1, cpu_count // 2))
    print(f"[TeluguVoice] {cpu_count} CPU threads", flush=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[TeluguVoice] Loading Chatterbox on {device}...", flush=True)
    MODEL = ChatterboxTTS.from_pretrained(device=device)

    _orig_inf = MODEL.t3.inference
    def _capped(*args, **kwargs):
        kwargs['max_new_tokens'] = min(kwargs.get('max_new_tokens', 350), 350)
        return _orig_inf(*args, **kwargs)
    MODEL.t3.inference = _capped

    print(f"[TeluguVoice] Pre-computing Telugu voice embeddings...", flush=True)
    MODEL.prepare_conditionals(str(REFERENCE_WAV), exaggeration=0.45)

    SAMPLE_RATE = getattr(MODEL, "sr", 24000)
    print(f"[TeluguVoice] ✔ Ready! sr={SAMPLE_RATE}, device={device}", flush=True)

except Exception as e:
    print(f"[TeluguVoice] FATAL: Chatterbox load failed: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# AUDIO HELPERS  (identical to SC3)
# ─────────────────────────────────────────────────────────────────────────────

def _to_wav(tensor) -> bytes:
    audio = tensor.squeeze().cpu().float()
    pcm   = (audio.clamp(-1.0, 1.0).numpy() * 32767).astype("int16")
    buf   = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE); w.writeframes(pcm.tobytes())
    return buf.getvalue()


def _add_pad(wav: bytes, ms: int = 40) -> bytes:
    with wave.open(io.BytesIO(wav), "rb") as r:
        p = r.getparams(); f = r.readframes(r.getnframes())
    sil = b"\x00\x00" * max(1, int(p.framerate * ms / 1000)) * p.nchannels
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setparams(p); w.writeframes(sil + f)
    return buf.getvalue()


def _trim_silence(wav: bytes, threshold_db: float = -42.0, tail_ms: int = 80) -> bytes:
    import numpy as np
    with wave.open(io.BytesIO(wav), "rb") as r:
        p = r.getparams(); raw = r.readframes(r.getnframes())
    data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    if not data.size: return wav
    thr  = 10.0 ** (threshold_db / 20.0)
    loud = np.where(np.abs(data) > thr)[0]
    if not loud.size: return wav
    first   = max(0, loud[0]  - int(p.framerate * 0.02))
    last    = min(data.size, loud[-1] + int(p.framerate * tail_ms / 1000))
    trimmed = (data[first:last] * 32767).astype("int16")
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setparams(p); w.writeframes(trimmed.tobytes())
    return buf.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# DISK CACHE
# ─────────────────────────────────────────────────────────────────────────────
import hashlib

def _disk_key(text: str) -> str:
    return hashlib.sha256(("telugu_cb:" + text).encode("utf-8")).hexdigest()[:48]

def _disk_cache_get(text: str):
    p = DISK_CACHE_DIR / (_disk_key(text) + ".wav")
    return p.read_bytes() if (p.exists() and p.stat().st_size > 44) else None

def _disk_cache_set(text: str, wav: bytes):
    p = DISK_CACHE_DIR / (_disk_key(text) + ".wav")
    p.write_bytes(wav)
    files = sorted(DISK_CACHE_DIR.glob("*.wav"), key=lambda f: f.stat().st_mtime)
    total = sum(f.stat().st_size for f in files)
    while total > DISK_CACHE_MAX_BYTES and files:
        old = files.pop(0); total -= old.stat().st_size; old.unlink(missing_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# PROGRESS TRACKER
# ─────────────────────────────────────────────────────────────────────────────
_progress      = {"active": False, "stage": "idle", "pct": 0, "cached": False, "text": ""}
_progress_lock = threading.Lock()

def _set_progress(stage, pct, active=True, cached=False, text=""):
    with _progress_lock:
        _progress.update(active=active, stage=stage,
                         pct=int(max(0, min(100, pct))),
                         cached=cached, text=(text or "")[:80])

def _start_progress(text, s=20, e=81):
    stop = threading.Event()
    wc   = max(1, len(str(text).split()))
    secs = max(18.0, min(220.0, wc * 3.2))
    def _run():
        t0 = time.monotonic(); last = s
        while not stop.is_set():
            pct = min(e, s + int(((e - s) * (time.monotonic() - t0)) / secs))
            if pct > last:
                last = pct
                _set_progress(f"Generating speech... {pct}%", pct, text=text)
            stop.wait(0.25)
    threading.Thread(target=_run, daemon=True).start()
    return stop


# ─────────────────────────────────────────────────────────────────────────────
# SYNTHESIS ENGINE  (Chatterbox — same as SC3, different reference voice)
# ─────────────────────────────────────────────────────────────────────────────
_cache      = OrderedDict()
_cache_lock = threading.Lock()
_synth_lock = threading.Lock()


def synthesize(text: str) -> bytes:
    with _synth_lock:
        _set_progress("Cleaning text...", 5, text=text)
        clean = _clean(text)
        if not clean:
            raise ValueError("Empty text after cleaning.")

        with _cache_lock:
            if clean in _cache:
                _cache.move_to_end(clean)
                _set_progress("Done (RAM cache)", 100, active=False, cached=True, text=text)
                return _cache[clean]

        wav = _disk_cache_get(clean)
        if wav is not None:
            with _cache_lock:
                _cache[clean] = wav; _cache.move_to_end(clean)
                while len(_cache) > CACHE_LIMIT: _cache.popitem(last=False)
            _set_progress("Done (disk cache)", 100, active=False, cached=True, text=text)
            print(f"[TeluguVoice] Cache hit: {clean[:50]!r}", flush=True)
            return wav

        # ── Chatterbox generation — identical parameters to SC3 ──────────
        _set_progress("Preparing voice embeddings...", 15, text=text)
        _set_progress("Generating speech tokens...", 20, text=text)
        stop_progress = _start_progress(clean)
        try:
            wav_t = MODEL.generate(
                clean,
                audio_prompt_path=str(REFERENCE_WAV),   # ← Telugu reference voice
                exaggeration=0.3,
                cfg_weight=0.9,
                temperature=0.45,
                repetition_penalty=1.2,
            )
        finally:
            stop_progress.set()

        _set_progress("Encoding WAV...", 92, text=text)
        wav = _trim_silence(_add_pad(_to_wav(wav_t)))

        with _cache_lock:
            _cache[clean] = wav; _cache.move_to_end(clean)
            while len(_cache) > CACHE_LIMIT: _cache.popitem(last=False)
        _disk_cache_set(clean, wav)

        _set_progress("Done", 100, active=False, cached=False, text=text)
        print(f"[TeluguVoice] ✔ {len(wav)} bytes — {clean[:60]!r}", flush=True)
        return wav


# ─────────────────────────────────────────────────────────────────────────────
# HTTP SERVER  (same API as anjali-chatterbox-server.py)
# ─────────────────────────────────────────────────────────────────────────────
_DISC = (BrokenPipeError, ConnectionAbortedError, ConnectionResetError)


class Handler(BaseHTTPRequestHandler):
    server_version   = "TeluguVoiceServer/2.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        if "/progress" in self.path: return
        print(f"{self.address_string()} {fmt % args}", flush=True)

    def _headers(self, status=200, ctype="application/json; charset=utf-8", length=0):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if ctype: self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Connection", "close")
        try:
            self.end_headers(); return True
        except _DISC: return False

    def _write(self, data: bytes):
        try:
            self.wfile.write(data); self.wfile.flush()
            try: self.connection.shutdown(socket.SHUT_WR)
            except OSError: pass
            self.close_connection = True; return True
        except _DISC: return False

    def _json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        if self._headers(status, "application/json; charset=utf-8", len(body)):
            self._write(body)

    def _read_json(self):
        n = int(self.headers.get("Content-Length", "0") or "0")
        return json.loads((self.rfile.read(n) if n else b"{}").decode("utf-8"))

    def do_OPTIONS(self): self._headers(204, "", 0)

    def do_GET(self):
        if self.path.startswith("/health") or self.path == "/":
            self._json({
                "ok": True, "engine": "chatterbox-tts",
                "voice": "telugu-reference-cloned",
                "modelLoaded": True, "chatterboxReady": True,
                "referenceFile": str(REFERENCE_WAV),
                "referenceReady": REFERENCE_WAV.exists(),
                "referenceSource": str(REFERENCE_MP4),
                "sampleRate": SAMPLE_RATE, "device": device,
                "cacheEntries": len(_cache), "port": PORT, "error": "",
            }); return

        if "/progress" in self.path:
            with _progress_lock: snap = dict(_progress)
            self._json(snap); return

        self._json({"error": "Route not found."}, 404)

    def do_POST(self):
        if "/progress" in self.path:
            with _progress_lock: snap = dict(_progress)
            self._json(snap); return

        if self.path == "/api/preload":
            self._json({"ok": True, "message": "Telugu Chatterbox voice ready."}); return

        if not self.path.startswith("/api/narrate"):
            self._json({"error": "Route not found."}, 404); return

        try:
            payload   = self._read_json()
            text      = payload.get("text", "")
            wav_bytes = synthesize(text)
            if self._headers(200, "audio/wav", len(wav_bytes)):
                self._write(wav_bytes)
        except _DISC: return
        except Exception as exc:
            try: self._json({"error": str(exc), "traceback": traceback.format_exc(3)}, 500)
            except _DISC: pass


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n[TeluguVoice] Server ready on http://127.0.0.1:{PORT}", flush=True)
    print(f"[TeluguVoice] Engine: Chatterbox TTS (same as SC3)", flush=True)
    print(f"[TeluguVoice] Voice : {REFERENCE_MP4.name}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
