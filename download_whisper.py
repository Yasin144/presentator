import os
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

repo = "https://huggingface.co/Xenova/whisper-tiny.en/resolve/main/"
files = [
    "config.json",
    "generation_config.json",
    "special_tokens_map.json",
    "tokenizer_config.json",
    "tokenizer.json",
    "vocab.json",
    "preprocessor_config.json",
    "onnx/decoder_model_merged_quantized.onnx",
    "onnx/encoder_model_quantized.onnx"
]

base_dir = r"d:\presentator\AI_Models\Xenova\whisper-tiny.en"

# transformers.js expects the onnx files to sometimes be located inside an onnx folder, or flat. By default it checks the root, then the onnx folder.
for f in files:
    url = repo + f
    if "/" in f:
        local_dir = os.path.join(base_dir, os.path.dirname(f))
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(base_dir, f)
    else:
        local_path = os.path.join(base_dir, f)
    
    if not os.path.exists(local_path):
        print(f"Downloading {f}...")
        try:
            urllib.request.urlretrieve(url, local_path)
            print("Downloaded.")
        except Exception as e:
            print(f"Failed to download {f}: {e}")
            if os.path.exists(local_path):
                os.remove(local_path)
    else:
        print(f"{f} already exists.")

print("Done downloading Whisper-Tiny.en offline models!")
