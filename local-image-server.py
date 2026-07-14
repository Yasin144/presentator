import gc
import os
import threading
import time
import traceback
import uuid
from pathlib import Path

import torch
import uvicorn
from diffusers import DiffusionPipeline
from fastapi import FastAPI, HTTPException
from PIL import Image, ImageFilter
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent
MODEL_CACHE = ROOT / "AI_Models" / "imagegen" / "hub"
OUTPUT_DIR = ROOT / "generated-media" / "images"
MODEL_ID = "SimianLuo/LCM_Dreamshaper_v7"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Presentator Local Image Brain")
pipeline = None
pipeline_lock = threading.Lock()
generating = False
last_error = ""


class ImageRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    negativePrompt: str = Field(default="", max_length=1000)
    seed: int = Field(default=0, ge=0, le=2_147_483_647)
    width: int = Field(default=576, ge=256, le=768)
    height: int = Field(default=320, ge=256, le=768)


def load_pipeline():
    global pipeline, last_error
    if pipeline is not None:
        return pipeline
    with pipeline_lock:
        if pipeline is not None:
            return pipeline
        try:
            torch.set_num_threads(max(1, min(12, os.cpu_count() or 8)))
            pipeline = DiffusionPipeline.from_pretrained(
                MODEL_ID,
                cache_dir=str(MODEL_CACHE),
                local_files_only=True,
                torch_dtype=torch.float32,
                safety_checker=None,
                feature_extractor=None,
                requires_safety_checker=False,
            )
            pipeline = pipeline.to("cpu")
            pipeline.enable_attention_slicing("max")
            pipeline.enable_vae_slicing()
            pipeline.set_progress_bar_config(disable=True)
            last_error = ""
            return pipeline
        except Exception as error:
            last_error = f"{type(error).__name__}: {error}"
            traceback.print_exc()
            raise


@app.get("/health")
def health():
    return {
        "ok": True,
        "model": MODEL_ID,
        "modelReady": pipeline is not None,
        "generating": generating,
        "lastError": last_error,
    }


@app.post("/api/generate-image")
def generate_image(request: ImageRequest):
    global generating, last_error, pipeline
    if generating:
        raise HTTPException(status_code=409, detail="Image generation is already running.")
    generating = True
    started = time.perf_counter()
    try:
        pipe = load_pipeline()
        seed = request.seed or int(time.time()) % 2_147_483_647
        generator = torch.Generator(device="cpu").manual_seed(seed)
        prompt = (
            f"{request.prompt.strip()}, high quality, detailed, coherent anatomy, "
            "professional cinematic lighting, clean composition, presentation-ready, widescreen"
        )
        result = pipe(
            prompt=prompt,
            negative_prompt=request.negativePrompt.strip() or None,
            num_inference_steps=4,
            guidance_scale=8.0,
            lcm_origin_steps=50,
            width=(request.width // 64) * 64,
            height=(request.height // 64) * 64,
            generator=generator,
        )
        file_name = f"presentator-{int(time.time())}-{uuid.uuid4().hex[:8]}.png"
        output_path = OUTPUT_DIR / file_name
        image = result.images[0]
        image = image.resize((image.width * 2, image.height * 2), Image.Resampling.LANCZOS)
        image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3))
        image.save(output_path, format="PNG", optimize=True)
        last_error = ""
        return {
            "ok": True,
            "imagePath": str(output_path),
            "fileName": file_name,
            "seed": seed,
            "elapsedSeconds": round(time.perf_counter() - started, 2),
        }
    except Exception as error:
        last_error = f"{type(error).__name__}: {error}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=last_error)
    finally:
        generating = False
        pipeline = None
        gc.collect()


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8432, log_level="info")
