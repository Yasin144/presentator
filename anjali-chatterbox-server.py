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
import edge_tts.communicate as edge_tts_communicate
import edge_tts.voices as edge_tts_voices
import ssl

# Some Windows Python installs do not trust the Microsoft speech endpoint chain
# even when certifi is present. This keeps the local Edge TTS server usable.
EDGE_TTS_SSL_CONTEXT = ssl._create_unverified_context()
edge_tts_communicate._SSL_CTX = EDGE_TTS_SSL_CONTEXT
edge_tts_voices._SSL_CTX = EDGE_TTS_SSL_CONTEXT

PROJECT_ROOT = Path(__file__).resolve().parent
PORT = 8426
NARRATION_CACHE_LIMIT = 48
COMMA_PAUSE_MS = 500

# Best Indian English female voices (in preference order)
# NeerjaExpressiveNeural — warm, enthusiastic, very natural Indian English
# NeerjaNeural           — slightly more formal, also excellent
VOICE_NAME     = "en-IN-NeerjaExpressiveNeural"
VOICE_FALLBACK = "en-IN-NeerjaNeural"
FALLBACK_EDGE_VOICES = [
    {"ShortName": "en-IN-NeerjaExpressiveNeural", "FriendlyName": "Microsoft Neerja Expressive - English (India)", "Gender": "Female", "Locale": "en-IN"},
    {"ShortName": "en-IN-NeerjaNeural", "FriendlyName": "Microsoft Neerja - English (India)", "Gender": "Female", "Locale": "en-IN"},
    {"ShortName": "en-IN-PrabhatNeural", "FriendlyName": "Microsoft Prabhat - English (India)", "Gender": "Male", "Locale": "en-IN"},
    {"ShortName": "en-US-JennyNeural", "FriendlyName": "Microsoft Jenny - English (United States)", "Gender": "Female", "Locale": "en-US"},
    {"ShortName": "en-GB-SoniaNeural", "FriendlyName": "Microsoft Sonia - English (United Kingdom)", "Gender": "Female", "Locale": "en-GB"},
]

# Prosody tuning — matches the energetic Info-Kids educational style
VOICE_RATE   = "-14%"   # slightly slower — clearer, more teacher-like pacing
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
        return f"{self.voice}|{self.rate}|{self.pitch}|{self.volume}|comma={COMMA_PAUSE_MS}||{text.strip()}"

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
    def _mp3_bytes_to_wav(mp3_bytes: bytes, target_sr: int = 24000,
                          leading_pad_ms: int = 60) -> bytes:
        """
        Convert MP3 bytes → 24 kHz mono PCM WAV using ffmpeg subprocess.

        leading_pad_ms: milliseconds of silence prepended to every WAV segment.
        After a comma/colon/slash pause the audio decoder needs a few ms to
        'wake up' before the next word starts.  Without this pad the very first
        phoneme of the word after a pause gets clipped (e.g. 'smart' → 'mart').
        60 ms is below the threshold of perception but enough to prevent clipping.
        """
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
                    "-af", f"adelay={leading_pad_ms}:all=1,aresample={target_sr}",
                    "-ac", "1",
                    "-ar", str(target_sr),
                    "-sample_fmt", "s16",
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

        # ── Common lesson symbols before generic symbol cleanup ──
        t = re.sub(r'\s*&\s*', ' and ', t)
        t = re.sub(r'\s*@\s*', ' at ', t)
        t = re.sub(r'(?<=\d)\s*%\b', ' percent', t)
        t = re.sub(r'\bvs\.?\b', 'versus', t, flags=re.IGNORECASE)
        t = re.sub(r'\betc\.?\b', 'etcetera', t, flags=re.IGNORECASE)

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
        # NOTE: / and standalone - are handled BEFORE cleaning in synthesize()
        t = re.sub(r'[@#$%^&+=\[\]{}\\/~]', ' ', t)

        # ── Collapse multiple punctuation ──
        t = re.sub(r'([.!?])\s*\1+', r'\1', t)   # ... → .
        t = re.sub(r',\s*,+', ',', t)

        # ── Collapse whitespace ──
        t = re.sub(r'[ \t]+', ' ', t)
        t = re.sub(r'\n{3,}', '\n\n', t)
        t = t.strip()

        return t


    # ── Silence / WAV helpers ─────────────────────────────────────────────────
    @staticmethod
    def _make_silence_wav(duration_s: float, sample_rate: int = 24000) -> bytes:
        """Return a silent mono 16-bit PCM WAV of the given duration."""
        n_frames = int(duration_s * sample_rate)
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)          # 16-bit
            wf.setframerate(sample_rate)
            wf.writeframes(b"\x00\x00" * n_frames)
        return buf.getvalue()

    @staticmethod
    def _add_wav_leading_silence(wav_bytes: bytes, leading_pad_ms: int = 60) -> bytes:
        if not wav_bytes or leading_pad_ms <= 0:
            return wav_bytes
        with wave.open(io.BytesIO(wav_bytes), "rb") as reader:
            params = reader.getparams()
            frames = reader.readframes(reader.getnframes())
        silence_frames = max(1, int(params.framerate * leading_pad_ms / 1000))
        silence = b"\x00" * silence_frames * params.nchannels * params.sampwidth
        buf = io.BytesIO()
        with wave.open(buf, "wb") as writer:
            writer.setparams(params)
            writer.writeframes(silence + frames)
        return buf.getvalue()

    @staticmethod
    def _insert_wav_silence_at_ms(wav_bytes: bytes, insert_points_ms: list, pause_ms: int = COMMA_PAUSE_MS) -> bytes:
        if not wav_bytes or not insert_points_ms or pause_ms <= 0:
            return wav_bytes

        with wave.open(io.BytesIO(wav_bytes), "rb") as reader:
            params = reader.getparams()
            frames = reader.readframes(reader.getnframes())

        bytes_per_frame = params.nchannels * params.sampwidth
        total_frames = len(frames) // bytes_per_frame
        silence_frames = max(1, int(params.framerate * pause_ms / 1000))
        silence = b"\x00" * silence_frames * bytes_per_frame
        fade_frames = max(1, int(params.framerate * 0.012))
        frame_indexes = sorted({
            max(0, min(total_frames, int(round((float(ms) / 1000.0) * params.framerate))))
            for ms in insert_points_ms
        })

        def fade_pcm16(segment: bytes, *, fade_in: bool = False, fade_out: bool = False) -> bytes:
            if not segment or params.sampwidth != 2:
                return segment
            data = bytearray(segment)
            frame_count = len(data) // bytes_per_frame
            if frame_count <= 1:
                return bytes(data)

            for frame in range(frame_count):
                gain = 1.0
                if fade_in:
                    gain = min(gain, frame / max(1, frame_count - 1))
                if fade_out:
                    gain = min(gain, (frame_count - 1 - frame) / max(1, frame_count - 1))
                if gain >= 0.999:
                    continue
                for channel in range(params.nchannels):
                    offset = (frame * bytes_per_frame) + (channel * params.sampwidth)
                    sample = int.from_bytes(data[offset:offset + 2], "little", signed=True)
                    faded = max(-32768, min(32767, int(sample * gain)))
                    data[offset:offset + 2] = int(faded).to_bytes(2, "little", signed=True)
            return bytes(data)

        def append_segment(output_bytes: bytearray, segment: bytes, *, fade_in: bool = False, fade_out: bool = False) -> None:
            if not segment:
                return
            if params.sampwidth != 2:
                output_bytes.extend(segment)
                return

            frame_count = len(segment) // bytes_per_frame
            effective_fade_frames = min(fade_frames, max(1, frame_count // 2))
            fade_bytes = effective_fade_frames * bytes_per_frame
            head = segment[:fade_bytes] if fade_in else b""
            tail = segment[-fade_bytes:] if fade_out else b""
            middle_start = fade_bytes if fade_in else 0
            middle_end = len(segment) - fade_bytes if fade_out else len(segment)

            if head:
                output_bytes.extend(fade_pcm16(head, fade_in=True))
            if middle_end > middle_start:
                output_bytes.extend(segment[middle_start:middle_end])
            if tail:
                output_bytes.extend(fade_pcm16(tail, fade_out=True))

        output = bytearray()
        last_frame = 0
        fade_in_next = False
        for frame_index in frame_indexes:
            if frame_index < last_frame:
                continue
            append_segment(
                output,
                frames[last_frame * bytes_per_frame:frame_index * bytes_per_frame],
                fade_in=fade_in_next,
                fade_out=True,
            )
            output.extend(silence)
            fade_in_next = True
            last_frame = frame_index
        append_segment(output, frames[last_frame * bytes_per_frame:], fade_in=fade_in_next)

        buf = io.BytesIO()
        with wave.open(buf, "wb") as writer:
            writer.setparams(params)
            writer.writeframes(bytes(output))
        return buf.getvalue()

    @staticmethod
    def _windows_sapi_to_wav(text: str, leading_pad_ms: int = 60) -> bytes:
        """Legacy offline Windows voice fallback. Disabled for app narration."""
        import subprocess, tempfile, os

        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False, mode="w", encoding="utf-8") as tmp_text:
            tmp_text.write(text or "")
            tmp_text_path = tmp_text.name
        tmp_out_path = tmp_text_path.replace(".txt", ".wav")
        ps_script = f"""
Add-Type -AssemblyName System.Speech
$text = Get-Content -LiteralPath '{tmp_text_path}' -Raw
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() |
  ForEach-Object {{ $_.VoiceInfo }} |
  Where-Object {{ $_.Gender -eq 'Female' -and $_.Culture.Name -like 'en*' }} |
  Select-Object -First 1
if ($voice) {{ $synth.SelectVoice($voice.Name) }}
$synth.Rate = -1
$synth.Volume = 100
$synth.SetOutputToWaveFile('{tmp_out_path}')
$synth.Speak($text)
$synth.Dispose()
"""
        try:
            subprocess.run(
                ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script],
                capture_output=True,
                text=True,
                check=True,
            )
            with open(tmp_out_path, "rb") as handle:
                wav = handle.read()
            return AnjaliEdgeEngine._add_wav_leading_silence(wav, leading_pad_ms)
        finally:
            for path in (tmp_text_path, tmp_out_path):
                try:
                    os.unlink(path)
                except OSError:
                    pass

    @staticmethod
    def _concat_wavs(wavs: list) -> bytes:
        """Concatenate a list of mono WAV byte-strings (same sample rate)."""
        if not wavs:
            raise ValueError("No WAV chunks to concatenate.")
        buf = io.BytesIO()
        all_frames = b""
        params = None
        for w in wavs:
            with wave.open(io.BytesIO(w)) as wf:
                if params is None:
                    params = wf.getparams()
                all_frames += wf.readframes(wf.getnframes())
        with wave.open(buf, "wb") as wout:
            wout.setparams(params)
            wout.writeframes(all_frames)
        return buf.getvalue()

    @staticmethod
    def _get_comma_pause_insert_points_ms(text: str, boundaries: list, leading_pad_ms: int = 0) -> list:
        """Map commas in text to the clean gap before the following Edge TTS word."""
        import re

        safe_text = str(text or "").strip()
        if not safe_text or not boundaries:
            return []

        tokens = re.findall(r"[A-Za-z0-9']+|,+", safe_text)
        word_index = 0
        insert_points = []

        for token in tokens:
            if re.fullmatch(r",+", token):
                if 0 <= word_index < len(boundaries):
                    boundary = boundaries[word_index]
                    insert_ms = (float(boundary.get("offset", 0)) / 10000.0) + leading_pad_ms
                    insert_points.append(insert_ms)
                else:
                    previous_word_index = word_index - 1
                    if 0 <= previous_word_index < len(boundaries):
                        boundary = boundaries[previous_word_index]
                        insert_ms = (
                            (float(boundary.get("offset", 0)) + float(boundary.get("duration", 0))) / 10000.0
                        ) + leading_pad_ms
                        insert_points.append(insert_ms)
                continue

            word_index += 1

        return insert_points

    # ── Core synthesis ────────────────────────────────────────────────────────
    def synthesize(self, text: str) -> bytes:
        """
        Synthesize the full text as ONE Edge TTS request.

        Previously the text was split at commas/colons/slashes and each
        segment was synthesized separately then stitched with WAV silence.
        That approach caused onset clipping on every word that followed a
        pause boundary — the audio decoder had no time to 'wake up' after
        the gap.

        Now the full text is sent to Edge TTS in a single call.  Edge TTS
        naturally pauses at commas, colons, sentence boundaries etc., and
        the resulting WAV is one continuous audio file with no seams.
        Result: zero inter-segment clipping, smooth clean narration.

        For short KV terms (≤3 words, e.g. "clever", "cunning") a larger
        leading pad (160 ms) is used because the browser audio element takes
        longer to initialise for very short clips played after an inter-entry
        gap.  Longer texts (definitions, sentences) keep the 60 ms default.
        """
        import re

        # ── Cache check ────────────────────────────────────────────────────────
        cache_key = self._clean_text_for_tts(text)
        if not cache_key:
            raise ValueError("Text is required.")
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        # ── Decide leading pad based on text length ────────────────────────────
        # Short segments (KV terms like "clever", "cunning") played after an
        # inter-entry gap need more buffer time for the audio decoder to wake up.
        word_count = len(cache_key.split())
        pad_ms = 220 if word_count <= 3 else 100

        # ── Edge TTS synthesis with explicit 0.5s comma pauses ────────────────
        cleaned_text = cache_key   # already cleaned above
        try:
            tts_text = re.sub(r"\s*,+\s*", " ", cleaned_text).strip()
            mp3, boundaries = self._run_async(self._edge_synthesize_with_boundaries(tts_text))
            wav = self._mp3_bytes_to_wav(mp3, leading_pad_ms=pad_ms)
            comma_insert_points_ms = self._get_comma_pause_insert_points_ms(cleaned_text, boundaries, pad_ms)
            if comma_insert_points_ms:
                wav = self._insert_wav_silence_at_ms(wav, comma_insert_points_ms, COMMA_PAUSE_MS)
        except Exception as err:
            print(f"[Anjali] Synthesis failed ({err!r}): {cleaned_text[:80]!r}", flush=True)
            raise RuntimeError("Edge TTS synthesis failed. Windows/browser voice fallback is disabled.") from err

        self._store_cached(cache_key, wav)
        return wav


    # ── Persistent async event loop (thread-safe) ─────────────────────────────
    # asyncio.run() creates a NEW event loop per call — this causes
    # "This event loop is already running" errors inside ThreadingHTTPServer.
    # Instead we spin up ONE background loop and submit coroutines to it.
    _loop: "asyncio.AbstractEventLoop | None" = None
    _loop_lock = threading.Lock()

    @classmethod
    def _get_loop(cls) -> "asyncio.AbstractEventLoop":
        with cls._loop_lock:
            if cls._loop is None or not cls._loop.is_running():
                import concurrent.futures
                ready = concurrent.futures.Future()
                def _run():
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    cls._loop = loop
                    ready.set_result(True)
                    loop.run_forever()
                t = threading.Thread(target=_run, daemon=True, name="AnjaliAsyncLoop")
                t.start()
                ready.result(timeout=5)   # wait until loop is running
            return cls._loop

    def _run_async(self, coro) -> bytes:
        """Submit a coroutine to the persistent background event loop and wait."""
        import concurrent.futures
        future = asyncio.run_coroutine_threadsafe(coro, self._get_loop())
        return future.result(timeout=60)   # 60 s hard timeout per TTS call

    async def _edge_synthesize(self, text: str) -> bytes:
        """Call Edge TTS and return raw MP3 bytes (plain text, no SSML)."""
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

    async def _edge_synthesize_with_boundaries(self, text: str):
        """Call Edge TTS and return raw MP3 bytes with word boundary timings."""
        communicate = edge_tts.Communicate(
            text,
            voice=self.voice,
            rate=self.rate,
            pitch=self.pitch,
            volume=self.volume,
            boundary="WordBoundary",
        )
        chunks = []
        boundaries = []
        try:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    chunks.append(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    boundaries.append(chunk)
        except Exception:
            if self.voice == VOICE_FALLBACK:
                raise
            communicate = edge_tts.Communicate(
                text,
                voice=VOICE_FALLBACK,
                rate=self.rate,
                pitch=self.pitch,
                volume=self.volume,
                boundary="WordBoundary",
            )
            chunks = []
            boundaries = []
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    chunks.append(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    boundaries.append(chunk)

        if not chunks:
            raise RuntimeError("Edge TTS returned no audio data.")

        return b"".join(chunks), boundaries


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

        # ── /voices — list all available English Edge TTS voices ─────────────
        if self.path.startswith("/voices"):
            try:
                all_voices = FALLBACK_EDGE_VOICES
                english = [
                    {
                        "shortName":   v["ShortName"],
                        "friendlyName": v["FriendlyName"],
                        "gender":      v["Gender"],
                        "locale":      v["Locale"],
                        "current":     v["ShortName"] == ENGINE.voice,
                    }
                    for v in all_voices
                    if v["Locale"].startswith("en-")
                ]
                # Sort: current locale first, then alphabetically
                current_locale = ENGINE.voice.rsplit("-", 2)[0] + "-" + ENGINE.voice.split("-")[1]
                english.sort(key=lambda v: (0 if v["locale"] == current_locale else 1, v["locale"], v["shortName"]))
                self._send_json({"ok": True, "voices": english, "active": ENGINE.voice})
            except Exception as e:
                self._send_json({"error": str(e)}, status_code=500)
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

        # ── /set-voice — change the active voice and flush the cache ─────────
        if self.path == "/set-voice":
            try:
                content_length = int(self.headers.get("Content-Length", "0") or "0")
                raw_body = self.rfile.read(content_length) if content_length else b"{}"
                data = json.loads(raw_body.decode("utf-8"))
                new_voice = str(data.get("voice", "")).strip()
                valid_fallback_voice_ids = {voice["ShortName"] for voice in FALLBACK_EDGE_VOICES}
                if (
                    not new_voice
                    or new_voice.lower() in {"tts server offline", "offline", "default"}
                    or not new_voice.startswith("en-")
                ):
                    new_voice = VOICE_NAME
                if new_voice not in valid_fallback_voice_ids and not new_voice.startswith("en-"):
                    self._send_json({"error": "voice is required"}, status_code=400)
                    return
                ENGINE.voice = new_voice
                # Clear cache so next requests use the new voice
                with ENGINE.lock:
                    ENGINE.cache.clear()
                print(f"[Anjali] Voice changed to: {new_voice}", flush=True)
                self._send_json({"ok": True, "voice": new_voice})
            except Exception as e:
                self._send_json({"error": str(e)}, status_code=500)
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
