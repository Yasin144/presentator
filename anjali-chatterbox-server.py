import asyncio
import io
import json
import os
import struct
import threading
import traceback
import wave
from collections import OrderedDict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# ── Edge TTS — free Microsoft Azure Neural voices, no API key needed ──────────
import edge_tts

PROJECT_ROOT = Path(__file__).resolve().parent
PORT = 8426
NARRATION_CACHE_LIMIT = 48

# Best Indian English female voices (in preference order)
# NeerjaExpressiveNeural — warm, enthusiastic, very natural Indian English
# NeerjaNeural           — slightly more formal, also excellent
VOICE_NAME     = "en-IN-NeerjaExpressiveNeural"
VOICE_FALLBACK = "en-IN-NeerjaNeural"

# Prosody tuning — matches the energetic Info-Kids educational style
VOICE_RATE   = "+0%"    # default speed — clearest pronunciation
VOICE_PITCH  = "+0Hz"   # natural pitch
VOICE_VOLUME = "+0%"    # natural volume

for proxy_key in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"):
    os.environ.pop(proxy_key, None)


class AnjaliEdgeEngine:
    def __init__(self):
        self.lock = threading.Lock()
        self.cache = OrderedDict()
        self.voice  = VOICE_NAME
        self.rate   = VOICE_RATE
        self.pitch  = VOICE_PITCH
        self.volume = VOICE_VOLUME
        self.target_profile = {
            "voiceId":  "anjali",
            "gender":   "female",
            "locale":   "en-IN",
            "accent":   "indian",
            "style":    "expressive-educator",
            "engine":   "edge-tts",
            "voice":    VOICE_NAME,
        }
        # These mirror the old Chatterbox generate_options shape so the
        # health endpoint / UI still gets a valid JSON object.
        self.generate_options = {
            "voice":    VOICE_NAME,
            "rate":     VOICE_RATE,
            "pitch":    VOICE_PITCH,
            "volume":   VOICE_VOLUME,
        }

    # ── Health ────────────────────────────────────────────────────────────────
    def get_health(self):
        return {
            "ok":              True,
            "voice":           "anjali",
            "engine":          "edge-tts",
            "profile":         self.target_profile,
            "generationOptions": self.generate_options,
            "device":          "cloud",
            "modelLoaded":     True,   # Edge TTS needs no local model
            "cacheEntries":    len(self.cache),
            "referenceReady":  True,
            "referenceFile":   VOICE_NAME,
            "sampleRate":      24000,
            "error":           "",
        }

    # ── Cache ─────────────────────────────────────────────────────────────────
    def _cache_key(self, text):
        return f"{self.voice}|{self.rate}|{self.pitch}|{self.volume}||{text.strip()}"

    def _get_cached(self, text):
        key = self._cache_key(text)
        with self.lock:
            entry = self.cache.get(key)
            if entry is not None:
                self.cache.move_to_end(key)
            return entry

    def _store_cached(self, text, wav_bytes):
        key = self._cache_key(text)
        with self.lock:
            self.cache[key] = wav_bytes
            self.cache.move_to_end(key)
            while len(self.cache) > NARRATION_CACHE_LIMIT:
                self.cache.popitem(last=False)

    # ── Audio conversion ──────────────────────────────────────────────────────
    @staticmethod
    def _mp3_bytes_to_wav(mp3_bytes: bytes, target_sr: int = 24000) -> bytes:
        """Convert MP3 bytes → 24 kHz mono PCM WAV using ffmpeg subprocess."""
        import subprocess, tempfile, os
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_in:
            tmp_in.write(mp3_bytes)
            tmp_in_path = tmp_in.name
        tmp_out_path = tmp_in_path.replace(".mp3", ".wav")
        try:
            subprocess.run(
                [
                    "ffmpeg", "-y",
                    "-i",  tmp_in_path,
                    "-ac", "1",
                    "-ar", str(target_sr),
                    "-sample_fmt", "s16",
                    # Plain clean conversion — no filters.
                    # Edge TTS ~175ms leading silence is handled by the text-sync
                    # warmup in startNarrationLoop, not by audio processing.

                    tmp_out_path,
                ],
                capture_output=True, check=True,
            )
            with open(tmp_out_path, "rb") as f:
                return f.read()
        finally:
            for p in (tmp_in_path, tmp_out_path):
                try:
                    os.unlink(p)
                except OSError:
                    pass


    # ── Core synthesis ────────────────────────────────────────────────────────
    @staticmethod
    def _clean_text_for_tts(text: str) -> str:
        """
        Strip every symbol or artefact that Edge TTS would read out loud.
        Handles markdown, bullet points, math symbols, legacy prosody tokens.
        """
        import re
        t = str(text or "").strip()

        # ── Legacy Chatterbox prosody tokens ──
        t = re.sub(r'\bPause\.\s*', '', t, flags=re.IGNORECASE)
        t = re.sub(r'\bPause\b', '', t, flags=re.IGNORECASE)

        # ── Markdown headings (## Heading → Heading) ──
        t = re.sub(r'^#{1,6}\s+', '', t, flags=re.MULTILINE)

        # ── Bold / italic markers (** __ * _ ~~) ──
        t = re.sub(r'[*_~]{1,3}', '', t)

        # ── Bullet / list markers at line start ──
        t = re.sub(r'^\s*[\u2022\u2023\u25E6\u2043\u2219\-\*\+]\s+', '', t, flags=re.MULTILINE)

        # ── Numbered list markers (1. 2. a. etc.) ──
        t = re.sub(r'^\s*\d+[.)]\s+', '', t, flags=re.MULTILINE)
        t = re.sub(r'^\s*[a-zA-Z][.)]\s+', '', t, flags=re.MULTILINE)

        # ── Horizontal rules (--- === ___) ──
        t = re.sub(r'^[-=_]{3,}\s*$', '', t, flags=re.MULTILINE)

        # ── Backticks / code markers ──
        t = re.sub(r'`{1,3}[^`]*`{1,3}', '', t)   # inline/block code → remove
        t = re.sub(r'`', '', t)

        # ── Pipe / table markers ──
        t = re.sub(r'\|', ' ', t)

        # ── Angle brackets used as arrows or tags ──
        t = re.sub(r'<[^>]+>', '', t)   # strip HTML-like tags
        t = re.sub(r'[<>]', '', t)

        # ── Remaining symbols Edge TTS might vocalize ──
        # Keep: . , ! ? : ; ' " ( ) — these help natural prosody
        # Remove: @ # $ % ^ & + = [ ] { } \ / ~ `
        t = re.sub(r'[@#$%^&+=\[\]{}\\/~]', ' ', t)

        # ── Collapse multiple punctuation ──
        t = re.sub(r'([.!?])\s*\1+', r'\1', t)   # ... → .
        t = re.sub(r',\s*,+', ',', t)

        # ── Collapse whitespace ──
        t = re.sub(r'[ \t]+', ' ', t)
        t = re.sub(r'\n{3,}', '\n\n', t)
        t = t.strip()

        return t


    def synthesize(self, text: str) -> bytes:
        safe_text = self._clean_text_for_tts(text)
        if not safe_text:
            raise ValueError("Text is required.")

        cached = self._get_cached(safe_text)
        if cached is not None:
            return cached

        # Run async edge-tts in a fresh event loop (server is threaded)
        mp3_bytes = asyncio.run(self._edge_synthesize(safe_text))
        wav_bytes  = self._mp3_bytes_to_wav(mp3_bytes)
        self._store_cached(safe_text, wav_bytes)
        return wav_bytes

    async def _edge_synthesize(self, text: str) -> bytes:
        """Call Edge TTS and return raw MP3 bytes."""
        communicate = edge_tts.Communicate(
            text,
            voice=self.voice,
            rate=self.rate,
            pitch=self.pitch,
            volume=self.volume,
        )
        chunks = []
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                chunks.append(chunk["data"])

        if not chunks:
            # Fallback to secondary voice
            communicate = edge_tts.Communicate(
                text,
                voice=VOICE_FALLBACK,
                rate=self.rate,
                pitch=self.pitch,
                volume=self.volume,
            )
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    chunks.append(chunk["data"])

        if not chunks:
            raise RuntimeError("Edge TTS returned no audio data.")

        return b"".join(chunks)


ENGINE = AnjaliEdgeEngine()


class Handler(BaseHTTPRequestHandler):
    server_version = "AnjaliEdgeServer/2.0"
    CLIENT_DISCONNECT_ERRORS = (BrokenPipeError, ConnectionAbortedError, ConnectionResetError)

    def log_message(self, format, *args):
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args), flush=True)

    def _send_headers(self, status_code=200, content_type="application/json; charset=utf-8", content_length=0):
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if content_type:
            self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(content_length))
        try:
            self.end_headers()
        except self.CLIENT_DISCONNECT_ERRORS:
            return False
        return True

    def _safe_write(self, payload):
        try:
            self.wfile.write(payload)
        except self.CLIENT_DISCONNECT_ERRORS:
            return False
        return True

    def _send_json(self, payload, status_code=200):
        body = json.dumps(payload).encode("utf-8")
        if not self._send_headers(status_code=status_code, content_type="application/json; charset=utf-8", content_length=len(body)):
            return False
        return self._safe_write(body)

    def do_OPTIONS(self):
        self._send_headers(status_code=204, content_type="", content_length=0)

    def do_GET(self):
        if self.path.startswith("/health") or self.path == "/":
            self._send_json(ENGINE.get_health())
            return

        if self.path.startswith("/api/proxy/tts"):
            from urllib.parse import urlparse, parse_qs
            import urllib.request
            try:
                qs = parse_qs(urlparse(self.path).query)
                tl = qs.get("tl", ["en"])[0]
                q  = qs.get("q",  [""])[0]
                url = f"https://translate.googleapis.com/translate_tts?ie=UTF-8&tl={tl}&client=tw-ob&q={urllib.parse.quote(q)}"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req) as resp:
                    data = resp.read()
                    if not self._send_headers(status_code=200, content_type="audio/mpeg", content_length=len(data)):
                        return
                    self._safe_write(data)
            except Exception as e:
                self._send_json({"error": str(e)}, status_code=500)
            return

        self._send_json({"error": "Route not found."}, status_code=404)

    def do_POST(self):
        # Vision analyze stub (kept for compatibility)
        if self.path == "/api/vision/analyze":
            try:
                content_length = int(self.headers.get("Content-Length", "0") or "0")
                raw_body = self.rfile.read(content_length) if content_length else b"{}"
                data = json.loads(raw_body.decode("utf-8"))
                import re
                prompt_text = data.get("prompt", "")
                match = re.search(r'Analyze this mathematical concept or equation: "([^"]+)"', prompt_text)
                if match:
                    equation = match.group(1).strip()
                    eq_match = re.search(r"(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)", equation)
                    if eq_match:
                        n1, n2, n3 = eq_match.groups()
                        resp = f"Let's learn how to add! We start with {n1}. Adding {n2} more gives us {n3}. Maths is wonderful!\n{n1} + {n2} = {n3}"
                    else:
                        resp = f"Let's explore this concept: {equation}"
                else:
                    resp = "Great visual exercise! Let's keep learning."
                self._send_json({"text": resp})
            except Exception as e:
                self._send_json({"error": str(e)}, status_code=500)
            return

        # Preload stub — Edge TTS needs no preloading
        if self.path == "/api/preload":
            self._send_json({"ok": True, "message": "Edge TTS needs no preload — ready instantly."})
            return

        if not self.path.startswith("/api/narrate"):
            self._send_json({"error": "Route not found."}, status_code=404)
            return

        # ── Main narration endpoint ───────────────────────────────────────────
        try:
            content_length = int(self.headers.get("Content-Length", "0") or "0")
            raw_body = self.rfile.read(content_length) if content_length else b"{}"
            payload  = json.loads(raw_body.decode("utf-8"))
            text     = payload.get("text", "")

            # Allow caller to override prosody
            gen_opts = payload.get("generationOptions") or {}
            if isinstance(gen_opts, dict):
                if gen_opts.get("rate"):
                    ENGINE.rate = str(gen_opts["rate"])
                if gen_opts.get("pitch"):
                    ENGINE.pitch = str(gen_opts["pitch"])
                if gen_opts.get("volume"):
                    ENGINE.volume = str(gen_opts["volume"])
                if gen_opts.get("voice"):
                    ENGINE.voice = str(gen_opts["voice"])

            wav_bytes = ENGINE.synthesize(text)
            if not self._send_headers(status_code=200, content_type="audio/wav", content_length=len(wav_bytes)):
                return
            self._safe_write(wav_bytes)

        except self.CLIENT_DISCONNECT_ERRORS:
            return
        except Exception as exc:
            error_payload = {
                "error":     str(exc),
                "traceback": traceback.format_exc(limit=3),
            }
            try:
                self._send_json(error_payload, status_code=500)
            except self.CLIENT_DISCONNECT_ERRORS:
                return


def main():
    print(f"Anjali Edge TTS server listening on http://127.0.0.1:{PORT}", flush=True)
    print(f"Voice: {VOICE_NAME}  |  Rate: {VOICE_RATE}  |  Engine: Microsoft Azure Neural (free)", flush=True)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
