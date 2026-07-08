"""
whisper-transcribe-caption.py  —  Transcribes ANY video audio as captions
Works on: speech videos, animation, music, background noise, any content.
Strategy:
  1. VAD ON — silent/non-speech regions never become invented captions
  2. tiny model first (fast), small model if result is garbage
  3. Returns real word-level timestamps for perfect caption sync
"""
import sys, json, os, re, subprocess, tempfile
from collections import Counter

if len(sys.argv) < 2:
    print(json.dumps({"error": "No file path provided", "text": "", "words": [], "segments": []}))
    sys.exit(1)

audio_path = sys.argv[1]
lang_hint  = sys.argv[2] if len(sys.argv) > 2 else None  # None = auto-detect language

if not os.path.exists(audio_path):
    print(json.dumps({"error": f"File not found: {audio_path}", "text": "", "words": [], "segments": []}))
    sys.exit(1)

os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["TF_CPP_MIN_LOG_LEVEL"]   = "3"
os.environ["TOKENIZERS_PARALLELISM"] = "false"


def preprocess(input_wav: str) -> str:
    """Normalize audio loudness — helps Whisper pick up quiet speech."""
    tmp = tempfile.NamedTemporaryFile(suffix="_cap_norm.wav", delete=False)
    tmp.close()
    try:
        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", input_wav,
            "-af", "loudnorm,highpass=f=40",
            "-ac", "1", "-ar", "16000", "-sample_fmt", "s16",
            tmp.name,
        ], check=True, capture_output=True)
        return tmp.name
    except Exception:
        return input_wav  # fall back to original


def trim_for_detection(input_wav: str, seconds: int = 30) -> str:
    """Create a short temp clip for fast language detection."""
    tmp = tempfile.NamedTemporaryFile(suffix="_cap_detect.wav", delete=False)
    tmp.close()
    try:
        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", input_wav,
            "-t", str(seconds),
            "-ac", "1", "-ar", "16000", "-sample_fmt", "s16",
            tmp.name,
        ], check=True, capture_output=True)
        return tmp.name
    except Exception:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass
        return input_wav


def is_repetition_loop(text: str) -> bool:
    """Detect Whisper hallucination loops (same phrase repeated 5+ times)."""
    if not text or len(text.strip()) < 3:
        return False
    words = text.split()
    if len(words) < 6:
        return False
    top_count = Counter(words).most_common(1)[0][1]
    return top_count / len(words) > 0.6


def clean(text: str) -> str:
    text = re.sub(r'\[.*?\]|\(.*?\)', '', text)   # remove [music] (noise) tags
    text = re.sub(r'([.\-_])\1{3,}', '', text)    # remove ........ patterns
    return re.sub(r'\s+', ' ', text).strip()


def run_whisper_with_model(m, audio_path: str, lang: str):
    """Run faster-whisper with speech and confidence filtering using a preloaded model."""
    segs, info = m.transcribe(
        audio_path,
        language=lang,
        beam_size=5,
        best_of=5,
        temperature=[0.0, 0.2, 0.4, 0.6],         # multiple temps to avoid loops
        no_speech_threshold=0.6,
        compression_ratio_threshold=2.4,
        condition_on_previous_text=False,           # prevent runaway loops
        word_timestamps=True,                      # real word-level timestamps
        vad_filter=True,
        vad_parameters={
            "min_silence_duration_ms": 450,
            "speech_pad_ms": 180,
        },
    )

    parts, seg_list, word_list = [], [], []
    for s in segs:
        if info.duration > 0:
            pct = min(99, int((s.end / info.duration) * 100))
            print(f"PROGRESS:{pct}", flush=True)

        t = clean(s.text)
        if not t:
            continue
        if getattr(s, "no_speech_prob", 0.0) > 0.60:
            continue
        if getattr(s, "avg_logprob", 0.0) < -1.0:
            continue
        if is_repetition_loop(t):
            continue
        parts.append(t)
        seg_list.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": t})
        if hasattr(s, "words") and s.words:
            for w in s.words:
                wt = w.word.strip()
                if wt:
                    word_list.append({
                        "start": round(w.start, 2),
                        "end":   round(w.end, 2),
                        "word":  wt
                    })

    full = clean(" ".join(parts))
    return full, info.language, seg_list, word_list


def run_whisper(model_size: str, audio_path: str, lang: str):
    """Run faster-whisper with speech and confidence filtering."""
    from faster_whisper import WhisperModel
    m = WhisperModel(model_size, device="cpu", compute_type="int8")
    return run_whisper_with_model(m, audio_path, lang)


# ── Pre-process audio ─────────────────────────────────────────────────────────
norm_path = preprocess(audio_path)

try:
    if lang_hint is None or lang_hint == "auto":
        from faster_whisper import WhisperModel
        print("[Whisper] Loading 'small' model for language detection...", flush=True)
        m = WhisperModel("small", device="cpu", compute_type="int8")
        # Faster-whisper does not support a duration= argument in all versions,
        # so detect language on a real short audio clip instead.
        detect_path = trim_for_detection(norm_path, 30)
        try:
            _, info = m.transcribe(detect_path, beam_size=1)
        finally:
            if detect_path != norm_path:
                try:
                    os.unlink(detect_path)
                except Exception:
                    pass
        detected_lang = info.language
        print(f"[Whisper] Detected language: {detected_lang} (prob: {info.language_probability:.2f})", flush=True)
        
        lang_hint = detected_lang
        if lang_hint in {"te", "hi", "ta", "ur", "ar"}:
            print(f"[Whisper] Keeping 'small' model for transcription in {lang_hint}...", flush=True)
            text, lang, segs, words = run_whisper_with_model(m, norm_path, lang_hint)
        else:
            print(f"[Whisper] Switching to 'tiny' model for transcription in {lang_hint}...", flush=True)
            del m
            import gc
            gc.collect()
            text, lang, segs, words = run_whisper("tiny", norm_path, lang_hint)
    else:
        primary_model = "small" if lang_hint in {"te", "hi", "ta", "ur", "ar"} else "tiny"
        fallback_model = "tiny" if primary_model == "small" else "small"
        
        # Pass 1: use primary model (small for Indian languages, tiny for English)
        text, lang, segs, words = run_whisper(primary_model, norm_path, lang_hint)
        
        # Pass 2: if it failed/empty, try fallback model
        if is_repetition_loop(text) or len(text.strip()) < 3:
            try:
                text2, lang2, segs2, words2 = run_whisper(fallback_model, norm_path, lang_hint)
                if not is_repetition_loop(text2) and len(text2.strip()) >= 3:
                    text, lang, segs, words = text2, lang2, segs2, words2
            except Exception:
                pass

    # Return result — even empty text is valid (video has no recognisable speech)
    print(json.dumps({
        "text":     text,
        "language": lang,
        "segments": segs,
        "words":    words,
        "noSpeech": len(text.strip()) == 0
    }))

except Exception as err:
    print(json.dumps({
        "error":    str(err),
        "text":     "",
        "language": "en",
        "segments": [],
        "words":    [],
        "noSpeech": True
    }))
    sys.exit(1)

finally:
    if norm_path != audio_path:
        try:
            os.unlink(norm_path)
        except Exception:
            pass
