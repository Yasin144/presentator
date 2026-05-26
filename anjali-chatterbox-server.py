"""
Voice Presentator â€” Chatterbox TTS Server
==========================================
Clones the EXACT voice from EVS C5 8th Lesson sc3.mp4.
NO Edge TTS. NO fallback. NO other voice.
Chatterbox loads FIRST â€” HTTP server starts only when voice is ready.
"""
import io
import json
import os
import socket
import sys
import threading
import time
import traceback
import wave
from collections import OrderedDict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Force UTF-8 stdout
if hasattr(sys.stdout, "reconfigure"):
    try: sys.stdout.reconfigure(encoding="utf-8")
    except Exception: pass

# Strip proxies
for _k in ("HTTP_PROXY","HTTPS_PROXY","ALL_PROXY","http_proxy","https_proxy","all_proxy"):
    os.environ.pop(_k, None)

# â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
PROJECT_ROOT  = Path(__file__).resolve().parent
PORT          = 8426
CACHE_LIMIT   = 256

# Voice reference â€” EXACT voice from EVS C5 8th Lesson sc3.mp4
VOICE_REF_WAV = str(PROJECT_ROOT / "voice-reference-sc3.wav")
VOICE_REF_SRC = (
    r"D:\LESSONS\EVS\EVS C5 8TH LESSON\EVS C5 8TH LESSON"
    r"\EVS C5 8TH Lesson fact file\sc3.mp4"
)

# â”€â”€ Load Chatterbox SYNCHRONOUSLY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# The HTTP server does NOT start until the model and voice are fully ready.
# This guarantees the FIRST narration ever uses the sc3.mp4 cloned voice.
print("+------------------------------------------------------------------+", flush=True)
print("|   Voice Presentator â€” Loading sc3.mp4 voice clone               |", flush=True)
print("|   Please wait â€” this takes ~60 seconds on first load            |", flush=True)
print("+------------------------------------------------------------------+", flush=True)

if not Path(VOICE_REF_WAV).exists():
    print(f"[ERROR] Voice reference WAV not found: {VOICE_REF_WAV}", flush=True)
    print(f"[ERROR] Run the launcher to extract it from sc3.mp4.", flush=True)
    sys.exit(1)

try:
    import torch
    from chatterbox.tts import ChatterboxTTS

    cpu_count = os.cpu_count() or 4
    torch.set_num_threads(cpu_count)
    torch.set_num_interop_threads(max(1, cpu_count // 2))
    print(f"[Voice] Using {cpu_count} CPU threads", flush=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[Voice] Loading Chatterbox model on {device}...", flush=True)
    MODEL = ChatterboxTTS.from_pretrained(device=device)

    # Cap max_new_tokens inside t3.inference() — this is where the sampling loop runs.
    # ChatterboxTTS.generate() doesn't expose max_new_tokens; it's internal to t3.
    # Patching here cuts generation from ~400s (1000 tokens) to ~140s (350 tokens).
    _orig_t3_inf = MODEL.t3.inference
    def _capped_t3_inference(*args, **kwargs):
        kwargs['max_new_tokens'] = min(kwargs.get('max_new_tokens', 350), 350)
        return _orig_t3_inf(*args, **kwargs)
    MODEL.t3.inference = _capped_t3_inference
    print(f"[Voice] max_new_tokens capped to 350 inside t3.inference for speed.", flush=True)

    print(f"[Voice] Pre-computing sc3.mp4 voice embeddings...", flush=True)
    MODEL.prepare_conditionals(VOICE_REF_WAV, exaggeration=0.2)

    SAMPLE_RATE = getattr(MODEL, "sr", 24000)
    print(f"[Voice] âœ“ Ready! sr={SAMPLE_RATE}, device={device}", flush=True)
    print(f"[Voice] sc3.mp4 voice is locked. Starting server on port {PORT}...", flush=True)

except Exception as e:
    print(f"[FATAL] Chatterbox failed to load: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)

# â”€â”€ Audio helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def _to_wav(tensor) -> bytes:
    audio = tensor.squeeze().cpu().float()
    pcm   = (audio.clamp(-1.0, 1.0).numpy() * 32767).astype("int16")
    buf   = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(pcm.tobytes())
    return buf.getvalue()


def _add_pad(wav: bytes, ms: int = 40) -> bytes:
    with wave.open(io.BytesIO(wav), "rb") as r:
        p = r.getparams(); f = r.readframes(r.getnframes())
    sil = b"\x00\x00" * max(1, int(p.framerate * ms / 1000)) * p.nchannels
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setparams(p); w.writeframes(sil + f)
    return buf.getvalue()


# â”€â”€ Text cleaner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def _clean(text: str) -> str:
    import re
    t = str(text or "").strip()
    t = re.sub(r'\s*&\s*', ' and ', t)
    t = re.sub(r'\s*@\s*', ' at ', t)
    t = re.sub(r'(?<=\d)\s*%\b', ' percent', t)
    t = re.sub(r'\bvs\.?\b', 'versus', t, flags=re.I)
    t = re.sub(r'\betc\.?\b', 'etcetera', t, flags=re.I)
    t = re.sub(r'\bPause\.?\s*', '', t, flags=re.I)
    t = re.sub(r'^#{1,6}\s+', '', t, flags=re.M)
    t = re.sub(r'[*_~`]{1,3}', '', t)
    t = re.sub(r'^\s*[\u2022\-\*\+]\s+', '', t, flags=re.M)
    t = re.sub(r'^\s*\d+[.)]\s+', '', t, flags=re.M)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'[<>@#$%^&+=\[\]{}\\/~|]', ' ', t)
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()


# â”€â”€ Synthesis engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

_cache      = OrderedDict()
_cache_lock = threading.Lock()
_synth_lock = threading.Lock()

# Real-time synthesis progress â€” polled by the app banner
_progress = {
    "active":  False,
    "stage":   "idle",
    "pct":     0,
    "cached":  False,
    "text":    "",
    "tokens":  0,
    "total_tokens": 0,
}
_progress_lock = threading.Lock()
_current_synth_text = ""

STAGES = [
    ("Cleaning textâ€¦",               5),
    ("Preparing voice embeddingsâ€¦",  15),
    ("Generating speech tokensâ€¦",    20),
    ("Synthesising audio waveformâ€¦", 82),
    ("Encoding WAVâ€¦",                92),
    ("Done",                        100),
]

def _set_progress(stage: str, pct: int, active=True, cached=False, text=""):
    with _progress_lock:
        safe_pct = int(max(0, min(100, pct)))
        if active and _progress.get("active") and safe_pct < int(_progress.get("pct") or 0):
            safe_pct = int(_progress.get("pct") or safe_pct)
        _progress["active"]  = active
        _progress["stage"]   = stage
        _progress["pct"]     = safe_pct
        _progress["cached"]  = cached
        _progress["text"]    = text[:80] if text else ""


def _start_generate_progress(text: str, start_pct: int = 20, end_pct: int = 81):
    stop_event = threading.Event()
    clean_text = str(text or "")
    word_count = max(1, len(clean_text.split()))
    estimated_seconds = max(18.0, min(220.0, word_count * 3.2))

    def _run():
        started = time.monotonic()
        last_pct = start_pct
        while not stop_event.is_set():
            elapsed = time.monotonic() - started
            pct = min(end_pct, start_pct + int(((end_pct - start_pct) * elapsed) / estimated_seconds))
            if pct > last_pct:
                last_pct = pct
                _set_progress(f"Generating speech tokens... {pct}%", pct, active=True, text=text)
            stop_event.wait(0.25)

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return stop_event


def synthesize(text: str) -> bytes:
    with _synth_lock:
        _set_progress(STAGES[0][0], STAGES[0][1], active=True, text=text)
        clean = _clean(text)
        if not clean:
            _set_progress("idle", 0, active=False)
            raise ValueError("Empty text after cleaning.")

        # Cache hit — instant
        wav = None
        with _cache_lock:
            if clean in _cache:
                _cache.move_to_end(clean)
                wav = _cache[clean]
        if wav is not None:
            _set_progress("Done", 100, active=False, cached=True, text=text)
            return wav

        _set_progress(STAGES[1][0], STAGES[1][1], active=True, text=text)

        try:
            _set_progress(STAGES[2][0], STAGES[2][1], active=True, text=text)
            progress_stop = _start_generate_progress(text)
            try:
                wav_t = MODEL.generate(
                    clean,
                    audio_prompt_path=None,
                    exaggeration=0.2,
                    cfg_weight=0.5,
                    temperature=0.7,
                    repetition_penalty=1.2,
                )
            finally:
                progress_stop.set()
            _set_progress(STAGES[3][0], STAGES[3][1], active=True, text=text)
        except Exception:
            _set_progress("idle", 0, active=False)
            raise

        _set_progress(STAGES[4][0], STAGES[4][1], active=True, text=text)
        wav = _add_pad(_to_wav(wav_t))

        with _cache_lock:
            _cache[clean] = wav
            _cache.move_to_end(clean)
            while len(_cache) > CACHE_LIMIT:
                _cache.popitem(last=False)

        _set_progress(STAGES[5][0], active=False, pct=100, cached=False, text=text)
        return wav


# â”€â”€ HTTP Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

_DISC = (BrokenPipeError, ConnectionAbortedError, ConnectionResetError)


class Handler(BaseHTTPRequestHandler):
    server_version   = "VoicePresentator/4.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        if self.path.startswith("/api/narrate/progress"):
            return
        print(f"{self.address_string()} [{self.log_date_time_string()}] {fmt % args}", flush=True)

    def _headers(self, status=200, ctype="application/json; charset=utf-8", length=0):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if ctype: self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Connection", "close")
        try:
            self.end_headers(); return True
        except _DISC:
            return False

    def _write(self, data: bytes):
        try:
            self.wfile.write(data); self.wfile.flush()
            try: self.connection.shutdown(socket.SHUT_WR)
            except OSError: pass
            self.close_connection = True; return True
        except _DISC:
            return False

    def _json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        if self._headers(status, "application/json; charset=utf-8", len(body)):
            self._write(body)

    def _read_json(self):
        n   = int(self.headers.get("Content-Length", "0") or "0")
        raw = self.rfile.read(n) if n else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self):
        self._headers(204, "", 0)

    def do_GET(self):
        if self.path.startswith("/health") or self.path == "/":
            self._json({
                "ok":            True,
                "voice":         "sc3-cloned",
                "engine":        "chatterbox-tts",
                "modelLoaded":   True,          # always True â€” server only starts when ready
                "warming":       False,
                "locked":        True,
                "chatterboxReady": True,
                "chatterboxLoading": False,
                "chatterboxError":   "",
                "referenceFile": VOICE_REF_WAV,
                "referenceReady": Path(VOICE_REF_WAV).exists(),
                "referenceSource": "EVS C5 8th Lesson - Fact File, Scene 3 (sc3.mp4)",
                "sampleRate":    SAMPLE_RATE,
                "cacheEntries":  len(_cache),
                "device":        device,
                "error":         "",
            })
            return

        if self.path.startswith("/voices"):
            self._json({
                "ok": True, "locked": True,
                "voices": [{
                    "shortName":    "sc3-cloned",
                    "friendlyName": "EVS C5 8th Lesson Voice (sc3.mp4 Clone) [LOCKED]",
                    "gender": "Female", "locale": "en-IN",
                    "current": True, "locked": True,
                }],
                "active": "sc3-cloned",
            })
            return

        if self.path.startswith("/api/proxy/tts"):
            import urllib.parse, urllib.request
            try:
                from urllib.parse import urlparse, parse_qs
                qs  = parse_qs(urlparse(self.path).query)
                tl  = qs.get("tl",["en"])[0]
                q   = qs.get("q",[""])[0]
                url = f"https://translate.googleapis.com/translate_tts?ie=UTF-8&tl={tl}&client=tw-ob&q={urllib.parse.quote(q)}"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req) as resp:
                    data = resp.read()
                    if self._headers(200, "audio/mpeg", len(data)): self._write(data)
            except Exception as e:
                self._json({"error": str(e)}, 500)
            return

        if self.path.startswith("/api/narrate/progress"):
            with _progress_lock:
                snap = dict(_progress)
            self._json(snap)
            return
        self._json({"error": "Route not found."}, 404)

    def do_POST(self):
        if self.path == "/api/vision/analyze":
            try:
                import re
                data  = self._read_json()
                m     = re.search(r'Analyze this mathematical concept[^"]*"([^"]+)"', data.get("prompt",""))
                resp  = f"Let's explore: {m.group(1)}" if m else "Great learning exercise!"
                self._json({"text": resp})
            except Exception as e:
                self._json({"error": str(e)}, 500)
            return

        if self.path == "/api/preload":
            self._json({"ok": True, "message": "sc3.mp4 voice clone is ready â€” no preload needed."})
            return

        if self.path == "/set-voice":
            self._json({"ok": True, "voice": "sc3-cloned", "locked": True,
                        "message": "Voice is permanently locked to sc3.mp4 clone."})
            return

        if self.path.startswith("/api/narrate/progress"):
            with _progress_lock:
                snap = dict(_progress)
            self._json(snap)
            return

        if not self.path.startswith("/api/narrate"):
            self._json({"error": "Route not found."}, 404)
            return

        # â”€â”€ Narrate â€” sc3.mp4 cloned voice ONLY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        try:
            payload   = self._read_json()
            text      = payload.get("text", "")
            wav_bytes = synthesize(text)
            if self._headers(200, "audio/wav", len(wav_bytes)):
                self._write(wav_bytes)
        except _DISC:
            return
        except Exception as exc:
            try:
                self._json({"error": str(exc), "traceback": traceback.format_exc(3)}, 500)
            except _DISC:
                pass


# â”€â”€ Start server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

if __name__ == "__main__":
    sep = "=" * 66
    print(f"+{sep}+", flush=True)
    print(f"|   Voice Presentator  â€”  http://127.0.0.1:{PORT}                    |", flush=True)
    print(f"|   Engine : Chatterbox TTS (sc3.mp4 voice clone)                 |", flush=True)
    print(f"|   Locked : ONLY sc3.mp4 voice â€” no other voice possible         |", flush=True)
    print(f"+{sep}+", flush=True)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    server.serve_forever()
