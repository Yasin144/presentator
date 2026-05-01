"""
Quick voice comparison — generates a sample WAV for each Indian English voice
so you can listen and pick the best one.
"""
import asyncio, edge_tts, subprocess, os, tempfile

SAMPLE = (
    "Welcome to today's lesson! Let's explore some amazing concepts together. "
    "Clever means smart or quick to think. Cunning means tricky, trying to fool others."
)

VOICES = [
    ("en-IN-NeerjaExpressiveNeural", "Female - Expressive (CURRENT)"),
    ("en-IN-NeerjaNeural",           "Female - Standard"),
    ("en-IN-PrabhatNeural",          "Male   - Standard"),
    # Top non-Indian but clear English voices
    ("en-GB-SoniaNeural",            "British Female - Very clear"),
    ("en-US-AriaNeural",             "US Female - Expressive"),
    ("en-AU-NatashaNeural",          "Australian Female - Clear"),
]

async def synth(text, voice, rate="-12%"):
    comm = edge_tts.Communicate(text, voice=voice, rate=rate)
    chunks = []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    return b"".join(chunks)

def mp3_to_wav(mp3_bytes, out_path):
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(mp3_bytes)
        tmp = f.name
    subprocess.run(["ffmpeg", "-y", "-i", tmp, "-ac", "1", "-ar", "24000",
                    "-sample_fmt", "s16", out_path], capture_output=True)
    os.unlink(tmp)

async def main():
    out_dir = r"d:\presentator\voice_samples"
    os.makedirs(out_dir, exist_ok=True)
    print(f"\nGenerating samples in: {out_dir}\n")
    for voice, label in VOICES:
        print(f"  Generating: {label} ({voice}) ...")
        try:
            mp3 = await synth(SAMPLE, voice)
            safe_name = voice.replace("-", "_").replace(".", "_")
            wav_path = os.path.join(out_dir, f"{safe_name}.wav")
            mp3_to_wav(mp3, wav_path)
            print(f"    -> {wav_path}")
        except Exception as e:
            print(f"    ERROR: {e}")
    print("\nDone! Open the voice_samples folder and listen to each file.")

asyncio.run(main())
