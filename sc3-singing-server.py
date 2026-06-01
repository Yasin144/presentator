import base64
import json
import os
import subprocess
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PORT = 8431
ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "AI_Models" / "sc3-singing"
CONFIG_PATH = MODEL_DIR / "singing-model.json"


def _json_response(handler, status, payload):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    handler.send_header("Connection", "close")
    handler.end_headers()
    handler.wfile.write(body)


def _read_request_json(handler):
    length = int(handler.headers.get("Content-Length", "0") or "0")
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


def _model_status():
    if not CONFIG_PATH.exists():
        return {
            "ok": True,
            "server": "sc3-singing",
            "port": PORT,
            "modelReady": False,
            "mode": "not-installed",
            "modelDir": str(MODEL_DIR),
            "message": "Separate sc3 singing model is not installed yet. Existing sc3 narration is untouched.",
        }

    try:
        config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        return {
            "ok": True,
            "server": "sc3-singing",
            "port": PORT,
            "modelReady": False,
            "mode": "config-error",
            "modelDir": str(MODEL_DIR),
            "message": f"Could not read singing-model.json: {exc}",
        }

    command = config.get("command")
    if not isinstance(command, list) or not command:
        return {
            "ok": True,
            "server": "sc3-singing",
            "port": PORT,
            "modelReady": False,
            "mode": "config-error",
            "modelDir": str(MODEL_DIR),
            "message": "singing-model.json must contain a command array.",
        }

    return {
        "ok": True,
        "server": "sc3-singing",
        "port": PORT,
        "modelReady": True,
        "mode": "external-command",
        "modelDir": str(MODEL_DIR),
        "message": "Separate sc3 singing model is ready.",
    }


def _run_external_model(payload):
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    command = config["command"]
    timeout_seconds = int(config.get("timeoutSeconds", 1800))
    env = os.environ.copy()
    env.update({str(k): str(v) for k, v in dict(config.get("env") or {}).items()})

    with tempfile.TemporaryDirectory(prefix="sc3-singing-") as temp_dir:
        temp_path = Path(temp_dir)
        song_path = temp_path / "song.mp3"
        output_path = temp_path / "sc3-singing-output.mp3"
        lyrics_path = temp_path / "lyrics.txt"

        song_base64 = str(payload.get("songBase64") or "")
        if not song_base64:
            raise ValueError("songBase64 is required.")
        song_path.write_bytes(base64.b64decode(song_base64))
        lyrics_path.write_text(str(payload.get("lyrics") or ""), encoding="utf-8")

        replacements = {
            "{song}": str(song_path),
            "{lyrics}": str(lyrics_path),
            "{output}": str(output_path),
            "{modelDir}": str(MODEL_DIR),
        }
        resolved_command = []
        for part in command:
            value = str(part)
            for key, replacement in replacements.items():
                value = value.replace(key, replacement)
            resolved_command.append(value)

        completed = subprocess.run(
            resolved_command,
            cwd=str(config.get("cwd") or MODEL_DIR),
            env=env,
            timeout=timeout_seconds,
            capture_output=True,
            text=True,
            check=False,
        )

        if completed.returncode != 0:
            raise RuntimeError((completed.stderr or completed.stdout or "Singing model command failed.").strip())

        if not output_path.exists() or output_path.stat().st_size <= 0:
            raise RuntimeError("Singing model did not create an output MP3.")

        return {
            "ok": True,
            "contentType": "audio/mpeg",
            "audioBase64": base64.b64encode(output_path.read_bytes()).decode("ascii"),
            "fileName": str(payload.get("outputFileName") or "sc3-singing-model.mp3"),
        }


class Handler(BaseHTTPRequestHandler):
    server_version = "Sc3SingingServer/1.0"

    def log_message(self, fmt, *args):
        print("[sc3-singing]", fmt % args, flush=True)

    def do_OPTIONS(self):
        _json_response(self, 200, {"ok": True})

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/health":
            _json_response(self, 200, _model_status())
            return
        _json_response(self, 404, {"ok": False, "error": "Not found."})

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path != "/api/convert-song":
            _json_response(self, 404, {"ok": False, "error": "Not found."})
            return

        status = _model_status()
        if not status.get("modelReady"):
            _json_response(self, 503, {
                "ok": False,
                "error": status.get("message") or "sc3 singing model is not ready.",
                "status": status,
            })
            return

        try:
            payload = _read_request_json(self)
            _json_response(self, 200, _run_external_model(payload))
        except Exception as exc:
            _json_response(self, 500, {"ok": False, "error": str(exc)})


if __name__ == "__main__":
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print(f"sc3 singing server listening on http://127.0.0.1:{PORT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
