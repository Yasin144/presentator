"""
translate-server.py
====================
Offline-capable translation server for Voice Presentator Caption Studio.
Uses deep-translator (Google Translate) to translate caption text.

API:
  POST /api/translate  { text, target, source? }  → { translated, target }
  POST /api/translate/batch  { texts:[], target, source? }  → { results:[] }
  GET  /health  → { status }

Ports: 8434
"""

import sys, json, re, os, time
from http.server import HTTPServer, BaseHTTPRequestHandler

if hasattr(sys.stdout, "reconfigure"):
    try: sys.stdout.reconfigure(encoding="utf-8")
    except: pass

PORT = 8434

# ── Language code mapping ─────────────────────────────────────────────────────
LANG_CODES = {
    "en": "en", "english": "en",
    "hi": "hi", "hindi": "hi", "hin": "hi",
    "te": "te", "telugu": "te", "tel": "te",
    "auto": "auto"
}
LANG_LABELS = {"en": "English", "hi": "हिंदी", "te": "తెలుగు"}

def normalize_lang(lang):
    return LANG_CODES.get(str(lang or "en").lower().strip(), "en")


# ── Translation cache (avoids re-translating the same text) ──────────────────
_cache = {}

def translate_text(text, target, source="auto"):
    text = str(text or "").strip()
    if not text:
        return ""
    target = normalize_lang(target)
    source = normalize_lang(source) if source and source != "auto" else "auto"
    cache_key = f"{source}→{target}:{text[:120]}"
    if cache_key in _cache:
        return _cache[cache_key]
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source=source, target=target)
        result = translator.translate(text) or text
        _cache[cache_key] = result
        return result
    except Exception as e:
        print(f"[Translate] Error: {e}", flush=True)
        return text   # Return original on failure


def translate_batch(texts, target, source="auto"):
    """Translate a list of texts, chunk by 5000 chars max."""
    return [translate_text(t, target, source) for t in texts]


# ── HTTP Handler ──────────────────────────────────────────────────────────────

class TranslateHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[{time.strftime('%H:%M:%S')}] {fmt % args}", flush=True)

    def _send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path.rstrip("/") == "/health":
            self._send_json({"status": "ok", "port": PORT,
                             "supported": list(LANG_LABELS.keys())})
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length).decode("utf-8")
        try:
            payload = json.loads(body)
        except Exception:
            self._send_json({"error": "Invalid JSON"}, 400)
            return

        path = self.path.rstrip("/")

        if path == "/api/translate":
            text   = str(payload.get("text", "")).strip()
            target = str(payload.get("target", "en"))
            source = str(payload.get("source", "auto"))
            if not text:
                self._send_json({"error": "text required"}, 400)
                return
            result = translate_text(text, target, source)
            self._send_json({"translated": result, "target": normalize_lang(target)})

        elif path == "/api/translate/batch":
            texts  = [str(t) for t in payload.get("texts", [])]
            target = str(payload.get("target", "en"))
            source = str(payload.get("source", "auto"))
            if not texts:
                self._send_json({"error": "texts array required"}, 400)
                return
            results = translate_batch(texts, target, source)
            self._send_json({"results": results, "target": normalize_lang(target)})

        else:
            self._send_json({"error": "Unknown endpoint"}, 404)


# ── Start ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55, flush=True)
    print("  Caption Translation Server", flush=True)
    print(f"  Port  : {PORT}", flush=True)
    print("  Langs : English | हिंदी | తెలుగు", flush=True)
    print("  Engine: Google Translate (deep-translator)", flush=True)
    print("=" * 55, flush=True)

    # Verify deep-translator
    try:
        from deep_translator import GoogleTranslator
        test = GoogleTranslator(source="en", target="hi").translate("hello")
        print(f"[OK] deep-translator works: 'hello' → '{test}'", flush=True)
    except Exception as e:
        print(f"[WARN] deep-translator test failed: {e}", flush=True)
        print("       Install with: pip install deep-translator", flush=True)

    server = HTTPServer(("127.0.0.1", PORT), TranslateHandler)
    print(f"\n[Ready] Listening on http://127.0.0.1:{PORT}/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Stopped]", flush=True)
