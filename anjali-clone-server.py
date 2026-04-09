import json
import os
import shutil
import subprocess
import tempfile
import threading
import traceback
import warnings
from collections import OrderedDict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

warnings.filterwarnings(
    "ignore",
    message=r".*LoRACompatibleLinear.*deprecated.*",
    category=FutureWarning,
)
warnings.filterwarnings(
    "ignore",
    message=r".*pkg_resources is deprecated as an API.*",
    category=UserWarning,
)
warnings.simplefilter("ignore", FutureWarning)
warnings.simplefilter("ignore", UserWarning)

import torch
import torchaudio as ta
from chatterbox.tts_turbo import ChatterboxTurboTTS


PROJECT_ROOT = Path(__file__).resolve().parent
PORT = 8426
REFERENCE_MP3 = PROJECT_ROOT / "voice-reference-anjali.mp3"
REFERENCE_WAV = PROJECT_ROOT / "voice-reference-anjali.wav"
BUNDLED_MP3 = PROJECT_ROOT / "voice-preview-anjali.mp3"
DESKTOP_MP3 = Path.home() / "Desktop" / "voice_preview_anjali - warm, cheerful and clear.mp3"
NARRATION_CACHE_LIMIT = 24


def ensure_reference_mp3():
    if REFERENCE_MP3.exists():
        return REFERENCE_MP3

    if DESKTOP_MP3.exists():
        shutil.copy2(DESKTOP_MP3, REFERENCE_MP3)
        return REFERENCE_MP3

    if BUNDLED_MP3.exists():
        shutil.copy2(BUNDLED_MP3, REFERENCE_MP3)
        return REFERENCE_MP3

    raise FileNotFoundError("Anjali reference MP3 was not found.")


def ensure_reference_wav():
    source_mp3 = ensure_reference_mp3()
    if REFERENCE_WAV.exists() and REFERENCE_WAV.stat().st_mtime >= source_mp3.stat().st_mtime:
        return REFERENCE_WAV

    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(source_mp3),
        "-ac",
        "1",
        "-ar",
        "24000",
        str(REFERENCE_WAV)
    ]
    completed = subprocess.run(command, capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or "ffmpeg failed while preparing the Anjali reference clip.")
    return REFERENCE_WAV


class AnjaliCloneEngine:
    def __init__(self):
        self.lock = threading.Lock()
        self.model = None
        self.model_error = ""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.cache = OrderedDict()
        self.target_profile = {
            "voiceId": "anjali",
            "gender": "female",
            "locale": "en-IN",
            "accent": "indian",
            "style": "clear-child-friendly",
        }

    def get_health(self):
        reference_exists = REFERENCE_WAV.exists() or REFERENCE_MP3.exists() or DESKTOP_MP3.exists() or BUNDLED_MP3.exists()
        return {
            "ok": True,
            "voice": "anjali",
            "profile": self.target_profile,
            "device": self.device,
            "modelLoaded": self.model is not None,
            "cacheEntries": len(self.cache),
            "referenceReady": reference_exists,
            "referenceFile": str(REFERENCE_WAV if REFERENCE_WAV.exists() else REFERENCE_MP3 if REFERENCE_MP3.exists() else DESKTOP_MP3 if DESKTOP_MP3.exists() else BUNDLED_MP3),
            "error": self.model_error
        }

    def preload(self):
        try:
            self._ensure_model_loaded()
        except Exception as exc:
            self.model_error = str(exc)
            print("Anjali preload failed:", exc, flush=True)

    def _ensure_model_loaded(self):
        if self.model is not None:
            return self.model

        with self.lock:
            if self.model is not None:
                return self.model

            ensure_reference_wav()
            torch.set_num_threads(max(1, (os.cpu_count() or 4) // 2))
            self.model = ChatterboxTurboTTS.from_pretrained(device=self.device)
            self.model_error = ""
            print(f"Anjali clone model loaded on {self.device}.", flush=True)
            return self.model

    def _make_cache_key(self, text):
        return str(text or "").strip()

    def _get_cached_audio(self, text):
        cache_key = self._make_cache_key(text)
        if not cache_key:
            return None

        with self.lock:
            cached = self.cache.get(cache_key)
            if cached is None:
                return None
            self.cache.move_to_end(cache_key)
            return cached

    def _store_cached_audio(self, text, wav_bytes):
        cache_key = self._make_cache_key(text)
        if not cache_key or not wav_bytes:
            return

        with self.lock:
            self.cache[cache_key] = wav_bytes
            self.cache.move_to_end(cache_key)
            while len(self.cache) > NARRATION_CACHE_LIMIT:
                self.cache.popitem(last=False)

    def synthesize(self, text):
        safe_text = str(text or "").strip()
        if not safe_text:
            raise ValueError("Text is required.")

        cached_bytes = self._get_cached_audio(safe_text)
        if cached_bytes is not None:
            return cached_bytes

        model = self._ensure_model_loaded()
        with self.lock:
            wav = model.generate(safe_text, audio_prompt_path=str(REFERENCE_WAV))
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = Path(temp_file.name)

            try:
                ta.save(str(temp_path), wav, self.model.sr)
                wav_bytes = temp_path.read_bytes()
            finally:
                temp_path.unlink(missing_ok=True)

        self._store_cached_audio(safe_text, wav_bytes)
        return wav_bytes


ENGINE = AnjaliCloneEngine()


class Handler(BaseHTTPRequestHandler):
    server_version = "AnjaliCloneServer/1.0"
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

        self._send_json({"error": "Route not found."}, status_code=404)

    def do_POST(self):
        if not self.path.startswith("/api/narrate"):
            self._send_json({"error": "Route not found."}, status_code=404)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0") or "0")
            raw_body = self.rfile.read(content_length) if content_length else b"{}"
            payload = json.loads(raw_body.decode("utf-8"))
            text = payload.get("text", "")
            profile = payload.get("voiceProfile")
            if isinstance(profile, dict):
                ENGINE.target_profile = {
                    "voiceId": str(profile.get("voiceId", "anjali") or "anjali"),
                    "gender": str(profile.get("gender", "female") or "female"),
                    "locale": str(profile.get("locale", "en-IN") or "en-IN"),
                    "accent": str(profile.get("accent", "indian") or "indian"),
                    "style": str(profile.get("style", "clear-child-friendly") or "clear-child-friendly"),
                }
            wav_bytes = ENGINE.synthesize(text)
            if not self._send_headers(status_code=200, content_type="audio/wav", content_length=len(wav_bytes)):
                return
            self._safe_write(wav_bytes)
        except self.CLIENT_DISCONNECT_ERRORS:
            return
        except Exception as exc:
            ENGINE.model_error = str(exc)
            error_payload = {
                "error": str(exc),
                "traceback": traceback.format_exc(limit=3)
            }
            try:
                self._send_json(error_payload, status_code=500)
            except self.CLIENT_DISCONNECT_ERRORS:
                return


def main():
    print(f"Anjali clone server listening on http://127.0.0.1:{PORT}", flush=True)
    threading.Thread(target=ENGINE.preload, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
