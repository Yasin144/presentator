"""
whisper-transcribe-caption.py  —  Caption-specific Whisper transcription
Key differences from whisper-transcribe.py:
  - VAD filter ON  → filters background music / non-speech segments
  - Higher no_speech_threshold → stricter, only real speech
  - Stricter hallucination detection
  - Returns words[], segments[] with real timestamps for caption sync
"""
import sys, json, os, re, subprocess, tempfile

if len(sys.argv) < 2:
    print(json.dumps({"error": "No file path provided"}))
    sys.exit(1)

audio_path = sys.argv[1]
lang_hint  = sys.argv[2] if len(sys.argv) > 2 else "en"

if not os.path.exists(audio_path):
    print(json.dumps({"error": f"File not found: {audio_path}"}))
    sys.exit(1)

os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["TF_CPP_MIN_LOG_LEVEL"]   = "3"
os.environ["TOKENIZERS_PARALLELISM"] = "false"


def _preprocess_audio(input_wav: str) -> str:
    """
    Pre-process audio for speech extraction:
    - Highpass filter to remove bass music
    - Bandpass to keep voice range (80-8000 Hz)
    - Loudness normalization
    """
    tmp = tempfile.NamedTemporaryFile(suffix="_cap.wav", delete=False)
    tmp.close()
    try:
        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", input_wav,
            "-af", (
                "highpass=f=80,"
                "lowpass=f=8000,"
                "afftdn=nf=-20,"
                "loudnorm"
            ),
            "-ac", "1", "-ar", "16000", "-sample_fmt", "s16",
            tmp.name,
        ], check=True, capture_output=True)
        return tmp.name
    except Exception:
        return input_wav


def _is_garbage(text: str) -> bool:
    """Detect hallucination: repetition loops, Welsh patterns, music-only output."""
    if not text or len(text.strip()) < 3:
        return True
    words = text.split()
    if len(words) > 4:
        from collections import Counter
        most_common = Counter(words).most_common(1)[0][1]
        if most_common / len(words) > 0.5:
            return True
    # Common Whisper hallucinations on music
    hallucinations = [
        "Mae'n", "i'n i'n", "Thank you for watching",
        "Subscribe", "like and subscribe", "music",
        "www.", ".com", "subtitles by", "♪", "♫"
    ]
    for h in hallucinations:
        if h.lower() in text.lower():
            return True
    # Very short meaningless output
    if len(words) <= 2 and len(text.strip()) < 10:
        return True
    return False


def clean_text(text: str) -> str:
    text = re.sub(r'([.\-_])\1{3,}', '', text)
    text = re.sub(r"(Mae'n\s*i'n\s*)+", '', text)
    text = re.sub(r'\[.*?\]|\(.*?\)|♪|♫', '', text)
    return text.strip()


def run_whisper(model_size: str, audio_path: str, lang: str, use_vad: bool = True):
    from faster_whisper import WhisperModel
    m = WhisperModel(model_size, device="cpu", compute_type="int8")
    segs, info = m.transcribe(
        audio_path,
        language=lang,
        beam_size=5,
        best_of=5,
        temperature=[0.0, 0.2, 0.4],
        no_speech_threshold=0.6,          # strict — ignore music/noise
        compression_ratio_threshold=1.8,  # tight hallucination guard
        condition_on_previous_text=False,  # prevent repetition loops
        word_timestamps=True,             # real word-level sync
        vad_filter=use_vad,               # ON for caption mode — removes music
        vad_parameters=dict(
            min_silence_duration_ms=500,
            speech_pad_ms=200,
            threshold=0.5,                # only process clear speech segments
        ) if use_vad else None,
    )
    parts, seg_list, word_list = [], [], []
    for s in segs:
        t = s.text.strip()
        if t and not _is_garbage(t):
            parts.append(t)
            seg_list.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": t})
            if hasattr(s, "words") and s.words:
                for w in s.words:
                    wt = w.word.strip()
                    if wt:
                        word_list.append({"start": round(w.start, 2), "end": round(w.end, 2), "word": wt})
    full = clean_text(" ".join(parts))
    return full, info.language, seg_list, word_list


# ── Step 1: pre-process audio ─────────────────────────────────────────────────
clean_path = _preprocess_audio(audio_path)

try:
    # Pass 1: tiny model with VAD
    text, lang, segs, words = run_whisper("tiny", clean_path, lang_hint, use_vad=True)

    # Pass 2: if garbage, try small model
    if _is_garbage(text):
        try:
            text2, lang2, segs2, words2 = run_whisper("small", clean_path, lang_hint, use_vad=True)
            if not _is_garbage(text2):
                text, lang, segs, words = text2, lang2, segs2, words2
        except Exception:
            pass

    # Final: still garbage → no speech
    if _is_garbage(text):
        text, segs, words = "", [], []

    print(json.dumps({
        "text":     text,
        "language": lang,
        "segments": segs,
        "words":    words,
        "noSpeech": len(text.strip()) == 0
    }))

except Exception as err:
    print(json.dumps({"error": str(err), "text": "", "segments": [], "words": [], "noSpeech": True}))
    sys.exit(1)

finally:
    if clean_path != audio_path:
        try:
            os.unlink(clean_path)
        except Exception:
            pass
