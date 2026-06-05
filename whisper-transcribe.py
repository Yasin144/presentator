"""
whisper-transcribe.py  —  One-shot Whisper transcription for Voice Presentator
Usage: python whisper-transcribe.py <wav_or_audio_path>
Outputs JSON: {"text": "...", "language": "en", "segments": [...]}
Uses faster-whisper (tiny model) for speed. Falls back to openai-whisper if needed.
"""
import sys, json, os

if len(sys.argv) < 2:
    print(json.dumps({"error": "No file path provided"}))
    sys.exit(1)

audio_path = sys.argv[1]
if not os.path.exists(audio_path):
    print(json.dumps({"error": f"File not found: {audio_path}"}))
    sys.exit(1)

# Suppress verbose logs
os.environ.setdefault("TRANSFORMERS_VERBOSITY", "error")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")

try:
    # Try faster-whisper first (faster, less RAM)
    from faster_whisper import WhisperModel
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, language="en", beam_size=3, word_timestamps=False)
    text_parts = []
    seg_list = []
    for seg in segments:
        text_parts.append(seg.text.strip())
        seg_list.append({"start": round(seg.start, 2), "end": round(seg.end, 2), "text": seg.text.strip()})
    full_text = " ".join(text_parts).strip()
    print(json.dumps({"text": full_text, "language": info.language, "segments": seg_list}))

except Exception as fw_err:
    try:
        # Fallback to openai-whisper
        import whisper
        model = whisper.load_model("tiny")
        result = model.transcribe(audio_path, language="en", fp16=False)
        print(json.dumps({"text": result["text"].strip(), "language": "en", "segments": []}))
    except Exception as e:
        print(json.dumps({"error": str(e), "faster_whisper_error": str(fw_err)}))
        sys.exit(1)
