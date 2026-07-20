"""
whisper-transcribe.py  —  Fast Whisper transcription for Voice Presentator
Strategy:
  1. Pre-process audio: isolate vocals from background music (ffmpeg)
  2. tiny model with anti-hallucination settings
  3. If result is empty/garbage → small model fallback
Anti-hallucination: condition_on_previous_text=False prevents "Mae'n i'n" loops on music.
"""
import sys, json, os, re, subprocess, tempfile

if len(sys.argv) < 2:
    print(json.dumps({"error": "No file path provided"}))
    sys.exit(1)

audio_path = sys.argv[1]
lang_hint  = sys.argv[2] if len(sys.argv) > 2 else "en"   # default English
if lang_hint == "auto":
    lang_hint = None

if not os.path.exists(audio_path):
    print(json.dumps({"error": f"File not found: {audio_path}"}))
    sys.exit(1)

# Silence logs
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["TF_CPP_MIN_LOG_LEVEL"]   = "3"
os.environ["TOKENIZERS_PARALLELISM"] = "false"


def _vocal_isolate(input_wav: str) -> str:
    """
    Use ffmpeg to separate speech from background music.
    Applies:
      - highpass filter (removes bass music)
      - Voice-range bandpass (200-4000 Hz)
      - Noise reduction
      - Loudness normalization
    Returns path to cleaned WAV (temp file).
    """
    tmp = tempfile.NamedTemporaryFile(suffix="_vocal.wav", delete=False)
    tmp.close()
    try:
        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", input_wav,
            "-af", (
                "highpass=f=80,"            # only remove deep bass rumble
                "afftdn=nf=-12,"            # light denoise
                "loudnorm"                  # normalize
            ),
            "-ac", "1", "-ar", "16000", "-sample_fmt", "s16",
            tmp.name,
        ], check=True, capture_output=True)
        return tmp.name
    except Exception:
        return input_wav   # fall back to original on failure


def _is_garbage(text: str) -> bool:
    """Detect hallucination loops or nonsense output."""
    if not text or len(text.strip()) < 3:
        return True

    words = [w.lower() for w in text.split()]
    
    # Check for consecutive word repetitions, e.g., "word word word" or "the the the"
    for i in range(len(words) - 2):
        if words[i] == words[i+1] and words[i] == words[i+2]:
            return True

    # Check for single word repetition
    if len(words) >= 3:
        from collections import Counter
        top_word, top_count = Counter(words).most_common(1)[0]
        if top_count / len(words) > 0.65:
            return True

    # Welsh hallucination marker
    if text.strip().startswith("Mae'n") or "i'n i'n i'n" in text:
        return True
    return False


def clean_hallucination(text):
    """Remove Whisper hallucination patterns."""
    text = re.sub(r'(\b\w\b[\s\-]){4,}', '', text)
    text = re.sub(r'([.\-_])\1{3,}', '', text)
    # Remove Welsh hallucination
    text = re.sub(r"(Mae'n\s*i'n\s*)+", '', text)
    return text.strip()


def run_faster_whisper(model_size, audio_path, lang):
    from faster_whisper import WhisperModel
    m = WhisperModel(model_size, device="cpu", compute_type="int8")
    segs, info = m.transcribe(
        audio_path,
        language=lang,
        beam_size=5,
        best_of=5,
        temperature=[0.0, 0.2, 0.4],       # try multiple temps to avoid loops
        no_speech_threshold=0.3,            # lower = include more speech segments
        compression_ratio_threshold=2.0,   # tighter — catches hallucination sooner
        condition_on_previous_text=False,   # ← KEY FIX: prevents hallucination loops
        word_timestamps=True,               # word-level timestamps for caption sync
        vad_filter=False,                   # OFF — VAD kills speech+music mixes
    )
    parts, seg_list, word_list = [], [], []
    for s in segs:
        t = s.text.strip()
        if t:
            parts.append(t)
            seg_list.append({
                "start": round(s.start, 2),
                "end":   round(s.end, 2),
                "text":  t
            })
            # Collect word-level timestamps
            if hasattr(s, "words") and s.words:
                for w in s.words:
                    word_list.append({
                        "start": round(w.start, 2),
                        "end":   round(w.end,   2),
                        "word":  w.word.strip()
                    })
    full = clean_hallucination(" ".join(parts))
    return full, info.language, seg_list, word_list


# ── Step 1: Isolate vocals ────────────────────────────────────────────────────
vocal_path = _vocal_isolate(audio_path)

try:
    # Pass 1: tiny model
    text, lang, segs, words = run_faster_whisper("tiny", vocal_path, lang_hint)

    # Pass 2: garbage check → try small model
    if _is_garbage(text):
        try:
            text2, lang2, segs2, words2 = run_faster_whisper("small", vocal_path, lang_hint)
            if not _is_garbage(text2):
                text, lang, segs, words = text2, lang2, segs2, words2
        except Exception:
            pass

    # Final garbage check — return empty rather than hallucination
    if _is_garbage(text):
        text, segs, words = "", [], []

    print(json.dumps({
        "text":     text,
        "language": lang,
        "segments": segs,
        "words":    words        # ← new: word-level timestamps for precise sync
    }))

except Exception as fw_err:
    try:
        import whisper
        m = whisper.load_model("tiny")
        r = m.transcribe(
            vocal_path,
            language=lang_hint,
            fp16=False,
            condition_on_previous_text=False,   # same fix for vanilla whisper
            no_speech_threshold=0.45,
        )
        print(json.dumps({
            "text":     r["text"].strip(),
            "language": r.get("language", "?"),
            "segments": [],
            "words":    []
        }))
    except Exception as e:
        print(json.dumps({"error": str(e), "detail": str(fw_err)}))
        sys.exit(1)
finally:
    # Clean up temp vocal file
    if vocal_path != audio_path:
        try:
            os.unlink(vocal_path)
        except Exception:
            pass
