import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
REFERENCE_VOICE = ROOT / "voice-reference-sc3.wav"
SINGING_PYTHON = ROOT / ".singing-venv" / "Scripts" / "python.exe"


def run(command, label):
    print(f"[sc3 singing] {label}", flush=True)
    completed = subprocess.run(command, cwd=str(ROOT), text=True)
    if completed.returncode != 0:
        raise RuntimeError(f"{label} failed with exit code {completed.returncode}.")


def convert_to_wav(input_path, output_path):
    run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(input_path),
        "-ar", "44100",
        "-ac", "2",
        str(output_path),
    ], "Preparing song audio")


def find_demucs_stems(stems_dir, track_name):
    model_root = stems_dir / "htdemucs"
    candidates = [
        model_root / track_name,
        model_root / Path(track_name).stem,
    ]
    for candidate in candidates:
        vocals = candidate / "vocals.wav"
        no_vocals = candidate / "no_vocals.wav"
        if vocals.exists() and no_vocals.exists():
            return vocals, no_vocals
    raise FileNotFoundError("Demucs did not create vocals.wav and no_vocals.wav.")


def main():
    parser = argparse.ArgumentParser(description="Separate a song, convert its vocal tone to sc3, and mix it back.")
    parser.add_argument("--input", required=True, help="Input song path")
    parser.add_argument("--lyrics", default="", help="Optional lyrics file path; kept for UI compatibility")
    parser.add_argument("--model-dir", default="", help="Singing model directory")
    parser.add_argument("--output", required=True, help="Output MP3 path")
    parser.add_argument("--device", default="cpu", help="Device for OpenVoice/Demucs")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    device = args.device or "cpu"

    if not input_path.exists():
        raise FileNotFoundError(f"Input song not found: {input_path}")
    if not SINGING_PYTHON.exists():
        raise FileNotFoundError(f"Singing venv not installed: {SINGING_PYTHON}")
    if not REFERENCE_VOICE.exists():
        raise FileNotFoundError(f"sc3 reference voice not found: {REFERENCE_VOICE}")

    with tempfile.TemporaryDirectory(prefix="sc3-sing-pipeline-") as tmp:
        work = Path(tmp)
        prepared_song = work / "song.wav"
        stems_dir = work / "stems"
        converted_vocal = work / "sc3-vocal.wav"
        mixed_wav = work / "mixed.wav"

        convert_to_wav(input_path, prepared_song)

        run([
            str(SINGING_PYTHON), "-m", "demucs",
            "--two-stems", "vocals",
            "-n", "htdemucs",
            "-d", device,
            "-j", "1",
            "-o", str(stems_dir),
            str(prepared_song),
        ], "Separating original vocal and music")

        vocals, no_vocals = find_demucs_stems(stems_dir, prepared_song.stem)

        run([
            str(SINGING_PYTHON), "-m", "openvoice_cli", "single",
            "-i", str(vocals),
            "-r", str(REFERENCE_VOICE),
            "-o", str(converted_vocal),
            "-d", device,
        ], "Converting singer vocal tone to sc3")

        run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(no_vocals),
            "-i", str(converted_vocal),
            "-filter_complex",
            "[0:a]volume=0.98[music];[1:a]volume=1.10[vocal];[music][vocal]amix=inputs=2:duration=longest:dropout_transition=0,alimiter=limit=0.97",
            "-ar", "44100",
            "-ac", "2",
            str(mixed_wav),
        ], "Mixing sc3 singing vocal with music")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(mixed_wav),
            "-codec:a", "libmp3lame",
            "-b:a", "192k",
            str(output_path),
        ], "Writing MP3 output")

    if not output_path.exists() or output_path.stat().st_size <= 0:
        raise RuntimeError("The sc3 singing model did not create an output MP3.")

    print(f"[sc3 singing] Ready: {output_path}", flush=True)


if __name__ == "__main__":
    main()
