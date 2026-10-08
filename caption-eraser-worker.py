"""Local OCR-guided removal of burned-in captions.

CLI emits JSON lines. Final result is {type:'result', ok, changed,
noCaptionsDetected, detectedRegions, framesProcessed, ...}. With no confirmed
caption track no output is created. Never guesses a fixed bottom rectangle.

Windows OCR samples determine screen-aligned text tracks. Pixel masks include
glyph outlines and shadows, and clean matching nearby frames supply background
when available. Remaining holes use OpenCV Telea inpainting. This is a local
reconstruction, not a promise to recover scenery hidden in every frame.
"""
import argparse
import bisect
from collections import OrderedDict
import difflib
import hashlib
import json
import math
import os
from pathlib import Path
import re
import struct
import subprocess
import sys
import tempfile
import threading

try:
    import cv2
    import numpy as np
except ImportError as exc:
    print(json.dumps({"type": "result", "ok": False,
                      "error": "Local caption removal requires Python with OpenCV and NumPy: " + str(exc)}), flush=True)
    sys.exit(1)


def emit(kind, **values):
    print(json.dumps(dict(type=kind, **values), ensure_ascii=True), flush=True)


def run(command, **kwargs):
    # Do not inherit application PYTHONPATH or use a command shell.
    if os.name == "nt":
        kwargs.setdefault("creationflags", subprocess.CREATE_NO_WINDOW)
    return subprocess.run(command, check=True, **kwargs)


def probe_video(filename, ffprobe):
    result = run([ffprobe, "-v", "error", "-select_streams", "v:0",
                  "-show_entries", "stream=width,height,avg_frame_rate,r_frame_rate,time_base,duration,nb_frames,start_time:stream_side_data=rotation:format=duration,start_time",
                  "-of", "json", filename], capture_output=True, text=True, encoding="utf-8")
    data = json.loads(result.stdout)
    if not data.get("streams"):
        raise ValueError("The selected file has no video stream.")
    video = data["streams"][0]
    video["encodedWidth"], video["encodedHeight"] = video["width"], video["height"]
    rotation = 0
    for side_data in video.get("side_data_list", []):
        if "rotation" in side_data:
            rotation = float(side_data["rotation"])
    if abs(rotation / 90 - round(rotation / 90)) > 0.001:
        raise ValueError("Local caption erasing supports video rotation in 90 degree steps.")
    if round(rotation / 90) % 2:
        video["width"], video["height"] = video["height"], video["width"]
    video["rotation"] = rotation
    video["sourceContainerStartTime"] = float(data.get("format", {}).get("start_time") or 0)
    video["duration"] = float(video.get("duration") or data.get("format", {}).get("duration") or 0)
    fps_text = video.get("avg_frame_rate") or video.get("r_frame_rate") or "25/1"
    numerator, denominator = [float(n) for n in fps_text.split("/")]
    video["fps"] = numerator / denominator if denominator and numerator else 25.0
    frames = run([ffprobe, "-v", "error", "-select_streams", "v:0", "-show_frames",
                  "-show_entries", "frame=best_effort_timestamp_time,duration_time,pkt_duration_time",
                  "-of", "json", filename], capture_output=True, text=True, encoding="utf-8")
    records = json.loads(frames.stdout).get("frames", [])
    times = []
    durations = []
    for frame in records:
        timestamp = frame.get("best_effort_timestamp_time")
        times.append(float(timestamp) if timestamp is not None else (times[-1] + 1 / video["fps"] if times else 0))
        durations.append(float(frame.get("duration_time") or frame.get("pkt_duration_time") or 0))
    if not times:
        raise ValueError("The video has no decodable frames.")
    offset = times[0]
    video["sourceVideoStartTime"] = offset
    times = [max(0, value - offset) for value in times]
    for index in range(len(times) - 1):
        durations[index] = max(0.000001, times[index + 1] - times[index])
    if durations[-1] <= 0:
        durations[-1] = durations[-2] if len(durations) > 1 else 1 / video["fps"]
    video["times"] = times
    video["durations"] = durations
    video["frameCount"] = len(times)
    video["videoDuration"] = times[-1] + durations[-1]
    return video


def save_png(path, frame):
    # imwrite cannot reliably open Unicode paths with some Windows OpenCV builds.
    ok, encoded = cv2.imencode(".png", frame, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    if not ok:
        raise ValueError("Could not save a sampled frame for local OCR.")
    Path(path).write_bytes(encoded.tobytes())


def load_png(path):
    return cv2.imdecode(np.frombuffer(Path(path).read_bytes(), dtype=np.uint8), cv2.IMREAD_COLOR)


def sampling_indices(video, interval):
    timestamps = list(np.arange(0, video["videoDuration"], interval))
    if timestamps[-1] < video["times"][-1] - 0.05:
        timestamps.append(video["times"][-1])
    indices = [min(bisect.bisect_left(video["times"], timestamp), len(video["times"]) - 1) for timestamp in timestamps]
    return list(dict.fromkeys(indices))


def file_hash(filename):
    digest = hashlib.sha256()
    with open(filename, "rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_sample_binding(filename, video, directory, interval, samples):
    binding = dict(version=1, sourceSha256=file_hash(filename), sampleInterval=interval,
                   width=video["width"], height=video["height"], sourceFrames=video["frameCount"],
                   sourceTimesSha256=hashlib.sha256(json.dumps(video["times"], separators=(",", ":")).encode()).hexdigest(),
                   frames=[dict(index=sample["index"], frameIndex=sample["frameIndex"],
                                source=Path(sample["source"]).name, sourceSha256=file_hash(sample["source"]),
                                ocr=Path(sample["path"]).name, ocrSha256=file_hash(sample["path"])) for sample in samples])
    (Path(directory) / "sample-binding.json").write_text(json.dumps(binding), encoding="utf-8")


def reuse_samples(filename, video, cached_directory, directory, interval):
    cache = Path(cached_directory).resolve()
    sources = sorted(cache.glob("source-*.png"))
    indices = sampling_indices(video, interval)
    if len(sources) != len(indices):
        raise ValueError("Cached caption samples do not match this video's sampling times.")
    binding_path = cache / "sample-binding.json"
    if not binding_path.is_file():
        raise ValueError("This legacy caption sample cache has no source binding. Sample the video again before reusing it.")
    binding = json.loads(binding_path.read_text(encoding="utf-8"))
    times_hash = hashlib.sha256(json.dumps(video["times"], separators=(",", ":")).encode()).hexdigest()
    if (binding.get("version") != 1 or binding.get("sourceSha256") != file_hash(filename) or
            binding.get("sampleInterval") != interval or binding.get("width") != video["width"] or
            binding.get("height") != video["height"] or binding.get("sourceFrames") != video["frameCount"] or
            binding.get("sourceTimesSha256") != times_hash or len(binding.get("frames", [])) != len(indices)):
        raise ValueError("Cached caption samples do not belong to this source video and timing configuration.")
    for position, record in enumerate(binding["frames"]):
        source_name, ocr_name = "source-%06d.png" % position, "ocr-%06d.png" % position
        if (record.get("index") != position or record.get("frameIndex") != indices[position] or
                record.get("source") != source_name or record.get("ocr") != ocr_name or
                record.get("sourceSha256") != file_hash(cache / source_name) or
                record.get("ocrSha256") != file_hash(cache / ocr_name)):
            raise ValueError("A cached caption frame was changed or replaced; sample the original video again.")
    capture = cv2.VideoCapture(filename)
    capture.set(cv2.CAP_PROP_ORIENTATION_AUTO, 1)
    try:
        # Check identity as well as dimensions; a cache from another video must
        # never supply reconstructed background pixels for this input.
        for position in sorted({0, len(indices) // 2, len(indices) - 1}):
            capture.set(cv2.CAP_PROP_POS_FRAMES, indices[position])
            ok, current = capture.read()
            cached = load_png(sources[position])
            if not ok or cached is None or not np.array_equal(current, cached):
                raise ValueError("Cached caption samples belong to a different source video.")
    finally:
        capture.release()
    samples = []
    width, height = video["width"], video["height"]
    scale = min(1.0, 1600 / max(width, height))
    for position, frame_index in enumerate(indices):
        source = cache / ("source-%06d.png" % position)
        ocr_path = cache / ("ocr-%06d.png" % position)
        if source != sources[position] or not ocr_path.is_file():
            raise ValueError("The caption sample cache is incomplete.")
        smaller = load_png(ocr_path)
        if smaller is None or smaller.shape[:2] != (round(height * scale), round(width * scale)):
            raise ValueError("A cached OCR frame has invalid dimensions.")
        crop_y = round(smaller.shape[0] * 0.76)
        crop_path = Path(directory) / ("ocr-lower-%06d.png" % position)
        save_png(crop_path, smaller[crop_y:])
        samples.append(dict(index=position, frameIndex=frame_index, time=video["times"][frame_index],
                            path=str(ocr_path), lowerPath=str(crop_path), lowerOffset=crop_y,
                            source=str(source), scale=scale))
    emit("progress", phase="sampling", pct=20, message="Reusing verified video frames for caption detection")
    return samples


def sample_frames(filename, video, directory, interval=0.25):
    capture = cv2.VideoCapture(filename)
    if not capture.isOpened():
        raise ValueError("OpenCV could not open the video for caption detection.")
    capture.set(cv2.CAP_PROP_ORIENTATION_AUTO, 1)
    width, height = video["width"], video["height"]
    scale = min(1.0, 1600 / max(width, height))
    samples = []
    frame_indices = sampling_indices(video, interval)
    last_index = -1
    cursor = 0
    try:
        for frame_index in frame_indices:
            timestamp = video["times"][frame_index]
            if frame_index == last_index:
                continue
            # Decode forward once. Repeated random seeks re-decode long GOPs
            # and made a short lesson take minutes merely to sample frames.
            while cursor < frame_index:
                if not capture.grab():
                    raise ValueError("Could not advance to sampled video frame %d." % frame_index)
                cursor += 1
            ok, frame = capture.read()
            cursor += 1
            if not ok:
                raise ValueError("Could not read sampled video frame %d." % frame_index)
            if frame.shape[:2] != (height, width):
                raise ValueError("The video decoder returned unexpected frame dimensions.")
            index = len(samples)
            original = str(Path(directory) / ("source-%06d.png" % index))
            ocr_path = str(Path(directory) / ("ocr-%06d.png" % index))
            save_png(original, frame)
            smaller = cv2.resize(frame, (round(width * scale), round(height * scale)), interpolation=cv2.INTER_AREA) if scale < 1 else frame
            save_png(ocr_path, smaller)
            # Dense scene labels can make Windows OCR skip outlined subtitles.
            # A second view isolates the lower portion for recognition only;
            # removal still uses proved text/glyph masks, never this rectangle.
            crop_y = round(smaller.shape[0] * 0.76)
            crop_path = str(Path(directory) / ("ocr-lower-%06d.png" % index))
            save_png(crop_path, smaller[crop_y:])
            samples.append(dict(index=index, frameIndex=frame_index, time=video["times"][frame_index],
                                path=ocr_path, lowerPath=crop_path, lowerOffset=crop_y,
                                source=original, scale=scale))
            last_index = frame_index
            if index % 5 == 0:
                emit("progress", phase="sampling", pct=round(20 * timestamp / max(video["videoDuration"], 0.1), 1),
                     message="Sampling video frames for local caption detection")
    finally:
        capture.release()
    write_sample_binding(filename, video, directory, interval, samples)
    return samples


def recognize_samples(samples, directory, script):
    manifest = str(Path(directory) / "ocr-manifest.json")
    views = []
    for sample in samples:
        views.append(dict(index=len(views), path=sample["path"], sample=sample["index"], offset=0))
        if sample.get("lowerPath"):
            views.append(dict(index=len(views), path=sample["lowerPath"], sample=sample["index"], offset=sample["lowerOffset"]))
    Path(manifest).write_text(json.dumps({"frames": [{"index": view["index"], "path": view["path"]} for view in views]}), encoding="utf-8")
    powershell = str(Path(os.environ.get("SystemRoot", "C:\\Windows")) / "System32" / "WindowsPowerShell" / "v1.0" / "powershell.exe")
    command = [powershell, "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
               "-File", str(script), "-ManifestPath", manifest]
    options = dict(stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
    if os.name == "nt":
        options["creationflags"] = subprocess.CREATE_NO_WINDOW
    proc = subprocess.Popen(command, **options)
    stderr = []
    drain = threading.Thread(target=lambda: stderr.append(proc.stderr.read()), daemon=True)
    drain.start()
    results = {}
    failure = None
    for raw in proc.stdout:
        try:
            result = json.loads(raw.lstrip("\ufeff").strip())
        except ValueError:
            continue
        if result.get("type") == "error":
            failure = result.get("error", "Windows OCR failed.")
        elif result.get("type") == "frame" and result.get("ok"):
            results[result["index"]] = result.get("lines", [])
            emit("progress", phase="detecting", pct=round(20 + 30 * len(results) / max(1, len(views)), 1),
                 message="Recognizing existing captions with Windows OCR")
    code = proc.wait()
    drain.join()
    proc.stdout.close()
    proc.stderr.close()
    if code or failure or len(results) != len(views):
        raise ValueError(failure or ("Windows OCR did not process all sampled frames. " + "".join(stderr)[-700:]))
    for sample in samples:
        sample["lines"] = []
    for view in views:
        sample = samples[view["sample"]]
        for line in results[view["index"]]:
            for word in line.get("words", []):
                word["y"] += view["offset"]
            # OCR the same line twice at most once. Keep materially different
            # boxes if a focused view found text the full frame omitted.
            words = line.get("words", [])
            if not words:
                continue
            y = min(word["y"] for word in words)
            if any(normalized_text(previous.get("text", "")) == normalized_text(line.get("text", "")) and
                   abs(min(word["y"] for word in previous["words"]) - y) < max(word["h"] for word in words) * 0.4
                   for previous in sample["lines"]):
                continue
            sample["lines"].append(line)
    return samples


def normalized_text(text):
    return re.sub(r"[^\w]+", "", text, flags=re.UNICODE).casefold()


def line_detection(line, sample, width, height):
    words = []
    for word in line.get("words", []):
        if not isinstance(word.get("text"), str) or not word["text"].strip():
            continue
        try:
            box = [float(word[key]) / sample["scale"] for key in ("x", "y", "w", "h")]
        except (KeyError, ValueError, TypeError):
            continue
        if not all(math.isfinite(value) for value in box) or box[2] <= 0 or box[3] <= 0:
            continue
        words.append(dict(text=word["text"], box=box))
    if not words:
        return None
    left = min(word["box"][0] for word in words)
    top = min(word["box"][1] for word in words)
    right = max(word["box"][0] + word["box"][2] for word in words)
    bottom = max(word["box"][1] + word["box"][3] for word in words)
    box_width, box_height = right - left, bottom - top
    centre = (left + right) / 2 / width
    text = line.get("text") or " ".join(word["text"] for word in words)
    # Short corner logos, tiny scenery labels, and very large slide titles are
    # not captions. Centre text elsewhere requires a changing temporal track.
    if len(normalized_text(text)) < 4 or not 0.15 < centre < 0.85:
        return None
    if not 0.009 * height <= box_height <= 0.15 * height or box_width < 0.055 * width:
        return None
    if left < 0 or top < 0 or right > width or bottom > height:
        return None
    return dict(sample=sample["index"], time=sample["time"], text=text, words=words,
                box=[left, top, box_width, box_height], centre=centre)


def outlined_letters(frame, detection, stop_at=None):
    score = 0
    for word in detection["words"]:
        wx, wy, ww, wh = word["box"]
        pad = 4
        x1, y1 = max(0, math.floor(wx) - pad), max(0, math.floor(wy) - pad)
        x2, y2 = min(frame.shape[1], math.ceil(wx + ww) + pad), min(frame.shape[0], math.ceil(wy + wh) + pad)
        roi = frame[y1:y2, x1:x2]
        if not roi.size:
            continue
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        fill = ((gray > 180) & (hsv[:, :, 1] < 110)) | ((hsv[:, :, 1] > 110) & (hsv[:, :, 2] > 145))
        count, labels, stats, _ = cv2.connectedComponentsWithStats(fill.astype(np.uint8), 8)
        for label in range(1, count):
            x, y, w, h, area = stats[label]
            if not (max(4, wh * 0.20) <= h <= wh * 1.35 and w <= wh * 1.7 and area >= 8):
                continue
            component = (labels == label).astype(np.uint8)
            ring = (cv2.dilate(component, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))) > 0) & (component == 0)
            if np.any(ring) and float(np.mean(gray[ring] < 90)) >= 0.45:
                contrast = float(np.median(gray[component > 0])) - float(np.percentile(gray[ring], 25))
                score += int(contrast >= 70)
                if stop_at is not None and score >= stop_at:
                    return score
    return score


def merge_caption_parts(detections, frame, width, height):
    for detection in detections:
        detection["outlinedLetters"] = outlined_letters(frame, detection) if detection["box"][1] > height * 0.60 else 0
    merged = []
    for detection in detections:
        x, y, w, h = detection["box"]
        partner = next((previous for previous in merged if detection["outlinedLetters"] >= 2 and previous["outlinedLetters"] >= 2 and
                        abs((y + h / 2) - (previous["box"][1] + previous["box"][3] / 2)) < max(h, previous["box"][3]) * 0.30 and
                        max(x, previous["box"][0]) - min(x + w, previous["box"][0] + previous["box"][2]) < width * 0.30), None)
        if partner is None:
            merged.append(detection)
            continue
        words = sorted(partner["words"] + detection["words"], key=lambda word: word["box"][0])
        unique = []
        for word in words:
            if not any(abs(word["box"][0] - known["box"][0]) < word["box"][3] * 0.25 and
                       normalized_text(word["text"]) == normalized_text(known["text"]) for known in unique):
                unique.append(word)
        left, top = min(word["box"][0] for word in unique), min(word["box"][1] for word in unique)
        right = max(word["box"][0] + word["box"][2] for word in unique)
        bottom = max(word["box"][1] + word["box"][3] for word in unique)
        partner.update(words=unique, text=" ".join(word["text"] for word in unique),
                       box=[left, top, right - left, bottom - top], centre=(left + right) / 2 / width,
                       outlinedLetters=partner["outlinedLetters"] + detection["outlinedLetters"])
    return merged


def select_caption_tracks(samples, width, height, interval=0.5):
    tracks = []
    for sample in samples:
        if sample["index"] % 50 == 0:
            emit("progress", phase="analyzing", pct=50,
                 message="Checking caption tracks (%d/%d frames)" % (sample["index"] + 1, len(samples)))
        candidates = [line_detection(line, sample, width, height) for line in sample.get("lines", [])]
        candidates = [detection for detection in candidates if detection is not None]
        if candidates:
            candidates = merge_caption_parts(candidates, load_png(sample["source"]), width, height)
        for detection in candidates:
            x, y, w, h = detection["box"]
            word_heights = [word["box"][3] for word in detection["words"]]
            word_height = float(np.median(word_heights))
            # Physical signs can share the previous caption's height. Require
            # each observation to qualify before it can extend a caption track.
            if y > height * 0.60 and detection["outlinedLetters"] < 2 and len(detection["words"]) < 3:
                continue
            if y <= height * 0.60 and len(detection["words"]) >= 2:
                bottoms = [word["box"][1] + word["box"][3] for word in detection["words"]]
                if max(bottoms) - min(bottoms) > word_height * 0.50:
                    continue
            matches = []
            for track in tracks:
                previous = track["detections"][-1]
                # Scenery labels at a similar height minutes apart must not
                # become a single "changing caption" track.
                if detection["time"] - previous["time"] > max(2.0, interval * 4):
                    continue
                px, py, pw, ph = previous["box"]
                if any(item["sample"] == detection["sample"] for item in track["detections"][-4:]):
                    continue
                if abs((y + h / 2) - (py + ph / 2)) <= max(h, ph) * 0.65 and 0.55 <= h / ph <= 1.85:
                    if abs(detection["centre"] - previous["centre"]) <= 0.25:
                        matches.append((abs(y - py), track))
            if matches:
                min(matches, key=lambda pair: pair[0])[1]["detections"].append(detection)
            else:
                tracks.append(dict(detections=[detection]))
    accepted = []
    for track in tracks:
        detections = track["detections"]
        single = len(detections) == 1
        ys = [item["box"][1] + item["box"][3] / 2 for item in detections]
        heights = [item["box"][3] for item in detections]
        median_height = float(np.median(heights))
        font_height = float(np.median([word["box"][3] for item in detections for word in item["words"]]))
        # Captions stay attached to the screen; moving physical signs do not.
        if float(np.std(ys)) > median_height * 0.35:
            continue
        anchors = [[item["box"][0], item["box"][0] + item["box"][2],
                    item["box"][0] + item["box"][2] / 2] for item in detections]
        anchors = np.asarray(anchors)
        anchor_mad = np.median(np.abs(anchors - np.median(anchors, axis=0)), axis=0)
        if float(np.min(anchor_mad)) > max(5.0, median_height * 0.30):
            # Different centered sentences need not have the same width or
            # center after partial OCR. Test the stable content groups instead.
            groups = []
            for item in detections:
                value = normalized_text(item["text"])
                group = next((group for group in groups if difflib.SequenceMatcher(
                    None, value, normalized_text(group[0]["text"])).ratio() >= 0.78), None)
                if group is None:
                    groups.append([item])
                else:
                    group.append(item)
            stable = 0
            for group in groups:
                if len(group) < 2:
                    continue
                points = np.asarray([[item["box"][0], item["box"][0] + item["box"][2],
                                      item["box"][0] + item["box"][2] / 2] for item in group])
                mad = np.median(np.abs(points - np.median(points, axis=0)), axis=0)
                if float(np.min(mad)) <= max(5.0, font_height * 0.30):
                    stable += len(group)
            if stable < len(detections) * 0.60:
                continue
        strings = []
        for item in detections:
            value = normalized_text(item["text"])
            # Minor OCR spelling jitter is not changing caption content. This
            # keeps a static artistic story heading attached to the scene.
            if not any(difflib.SequenceMatcher(None, value, known).ratio() >= 0.78 for known in strings):
                strings.append(value)
        lower = float(np.median(ys)) > height * 0.60
        centred = float(np.median([abs(item["centre"] - 0.5) for item in detections])) <= 0.23
        substantial = float(np.median([item["box"][2] for item in detections])) >= width * 0.14
        if len(strings) < 2 and not (lower and centred and substantial):
            continue
        if single and not (lower and centred and substantial and detections[0].get("outlinedLetters", 0) >= 2 and
                           len(normalized_text(detections[0]["text"])) >= 8 and len(detections[0]["words"]) >= 2):
            continue
        # A persistent small watermark that OCR jitters on should not qualify.
        if not substantial and not any(len(item["words"]) >= 2 for item in detections):
            continue
        padding = max(4, round(font_height * 0.28))
        x1 = max(0, math.floor(min(item["box"][0] for item in detections)) - padding)
        y1 = max(0, math.floor(min(item["box"][1] for item in detections)) - padding)
        x2 = min(width, math.ceil(max(item["box"][0] + item["box"][2] for item in detections)) + padding)
        y2 = min(height, math.ceil(max(item["box"][1] + item["box"][3] for item in detections)) + padding)
        track.update(box=[x1, y1, x2 - x1, y2 - y1], height=font_height,
                     times=[item["time"] for item in detections], padding=padding,
                     outlined=float(np.median([item["outlinedLetters"] for item in detections])) >= 2,
                     captionSamples={item["sample"] for item in detections})
        accepted.append(track)
    return accepted


def glyph_seed(roi, mode, height, width_factor=1.6):
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (max(3, round(height * 0.45) | 1),) * 2)
    if mode == "light":
        residual = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)
        selected = (gray > 165) & (residual > 22) & (hsv[:, :, 1] < 120)
    elif mode == "dark":
        residual = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)
        selected = (gray < 90) & (residual > 22)
    else:
        hue = float(mode)
        hue_delta = np.minimum(np.abs(hsv[:, :, 0].astype(float) - hue), 180 - np.abs(hsv[:, :, 0].astype(float) - hue))
        selected = (hue_delta < 12) & (hsv[:, :, 1] > 65) & (hsv[:, :, 2] > 125)
    raw = selected.astype(np.uint8) * 255
    count, labels, stats, _ = cv2.connectedComponentsWithStats(raw, 8)
    accepted = np.flatnonzero((stats[:, 3] >= max(2, height * 0.07)) &
                              (stats[:, 3] <= height * 1.45) & (stats[:, 2] >= 1) &
                              (stats[:, 2] <= height * width_factor) & (stats[:, 4] >= 2))
    accepted = accepted[accepted != 0]
    mask = np.zeros_like(raw)
    if len(accepted) <= 8:
        for label in accepted:
            mask[labels == label] = 255
        return mask
    lookup = np.zeros(count, np.uint8)
    lookup[accepted] = 255
    return lookup[labels]


def choose_styles(tracks, samples):
    for track in tracks:
        scores = {}
        votes = {}
        indices = sorted(set(range(min(4, len(track["detections"])))) | set(np.linspace(0, len(track["detections"]) - 1, min(8, len(track["detections"]))).round().astype(int)))
        for index in indices:
            detection = track["detections"][index]
            frame = load_png(samples[detection["sample"]]["source"])
            for word in detection["words"]:
                x, y, w, h = [round(value) for value in word["box"]]
                roi = frame[y:y + h, x:x + w]
                if roi.size == 0:
                    continue
                hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
                gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                saturated = hsv[(hsv[:, :, 1] > 65) & (hsv[:, :, 2] > 140), 0]
                modes = ["light", "dark"]
                if len(saturated) >= roi.shape[0] * roi.shape[1] * 0.05:
                    bins = np.bincount((saturated // 10).astype(int), minlength=18)
                    # A pastel karaoke word may be less saturated than the
                    # scenery around it. Let glyph structure choose among the
                    # common hues instead of always taking the background hue.
                    modes += [str(int(index) * 10 + 5) for index in np.argsort(bins)[-3:]
                              if bins[index] >= roi.shape[0] * roi.shape[1] * 0.05]
                word_scores = {}
                for mode in modes:
                    seed = glyph_seed(roi, mode, track["height"])
                    fraction = float(np.count_nonzero(seed)) / max(1, roi.shape[0] * roi.shape[1])
                    # Filled letter strokes normally occupy 5–45% of an OCR word.
                    if 0.04 <= fraction <= 0.55:
                        count, labels, stats, _ = cv2.connectedComponentsWithStats(seed, 8)
                        letter_components = 0
                        for label in range(1, count):
                            sx, sy, sw, sh, _ = stats[label]
                            if sh < h * 0.30:
                                continue
                            if mode not in ("light", "dark"):
                                left, right = max(0, sx - 3), min(roi.shape[1], sx + sw + 3)
                                upper, lower_y = max(0, sy - 3), min(roi.shape[0], sy + sh + 3)
                                component = (labels[upper:lower_y, left:right] == label).astype(np.uint8)
                                ring = (cv2.dilate(component, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))) > 0) & (component == 0)
                                local_gray = gray[upper:lower_y, left:right]
                                if not np.any(ring) or np.mean(local_gray[ring] < 90) < 0.40:
                                    continue
                                if np.median(local_gray[component > 0]) - np.percentile(local_gray[ring], 25) < 70:
                                    continue
                            letter_components += 1
                        if not letter_components:
                            continue
                        score = fraction * letter_components
                        scores[mode] = scores.get(mode, 0) + score
                        word_scores[mode] = score
                if word_scores:
                    winner = max(word_scores, key=word_scores.get)
                    votes[winner] = votes.get(winner, 0) + 1
        if not scores:
            track["modes"] = []
        else:
            # Karaoke captions alternate white and yellow words. Keep each
            # foreground colour that wins an OCR word, instead of only the most
            # common line colour. Dark outlines stay covered by the glyph halo.
            bright = [mode for mode in scores if mode != "dark" and votes.get(mode, 0) > 0]
            bright_votes = sum(votes.get(mode, 0) for mode in bright)
            if bright and bright_votes >= votes.get("dark", 0):
                best = max(scores[mode] for mode in bright)
                track["modes"] = [mode for mode in bright if scores[mode] >= best * 0.04]
            else:
                track["modes"] = [max(scores, key=scores.get)]
    return [track for track in tracks if track.get("modes")]


def corner_protection(samples, width, height):
    groups = []
    for sample in samples:
        for line in sample.get("lines", []):
            words = line.get("words", [])
            if not words:
                continue
            scale = sample["scale"]
            x1 = min(word["x"] for word in words) / scale
            y1 = min(word["y"] for word in words) / scale
            x2 = max(word["x"] + word["w"] for word in words) / scale
            y2 = max(word["y"] + word["h"] for word in words) / scale
            centre = (x1 + x2) / 2 / width
            if not (centre < 0.15 or centre > 0.85) or y1 < height * 0.75 or x2 - x1 < width * 0.06:
                continue
            group = next((entry for entry in groups if entry["side"] == (centre > 0.5) and
                          abs(entry["y"] - (y1 + y2) / 2) < max(y2 - y1, entry["h"]) * 0.8), None)
            if group is None:
                group = dict(side=centre > 0.5, y=(y1 + y2) / 2, h=y2 - y1, boxes=[], samples=set())
                groups.append(group)
            group["boxes"].append([x1, y1, x2, y2])
            group["samples"].add(sample["index"])
    protected = []
    measured_badges = []
    for group in groups:
        if len(group["samples"]) < max(3, len(samples) * 0.20):
            continue
        boxes = np.asarray(group["boxes"])
        x1, y1, x2, y2 = np.median(boxes, axis=0)
        pad = max(3, round(group["h"] * 0.25))
        region = [max(0, round(x1) - pad), max(0, round(y1) - pad), min(width, round(x2) + pad), min(height, round(y2) + pad)]
        # When the OCR belongs to an edge-attached pale logo badge, protect
        # the actual whole badge. Its measured boundary leaves a stray caption
        # letter just above it removable without touching brand artwork.
        for index in sorted(group["samples"])[:8]:
            frame = load_png(samples[index]["source"])
            top = max(0, round(y1 - group["h"] * 1.5))
            hsv = cv2.cvtColor(frame[top:], cv2.COLOR_BGR2HSV)
            pale = ((hsv[:, :, 1] < 90) & (hsv[:, :, 2] > 180)).astype(np.uint8)
            count, labels, stats, _ = cv2.connectedComponentsWithStats(pale, 8)
            overlap = labels[max(0, round(y1) - top):min(labels.shape[0], round(y2) - top), max(0, round(x1)):min(width, round(x2))]
            if not overlap.size:
                continue
            candidates = np.bincount(overlap.ravel(), minlength=count)
            for label in np.argsort(candidates)[::-1]:
                if label == 0 or candidates[label] < overlap.size * 0.10:
                    continue
                x, y, w, h, _ = stats[label]
                edge = x + w >= width - 1 if group["side"] else x == 0
                if edge and w <= width * 0.40 and h <= height * 0.20:
                    region = [int(x), int(y + top), int(x + w), int(y + top + h)]
                    measured_badges.append(region)
                    break
            if region[2] >= width - 1 or region[0] == 0:
                break
        protected.append(region)
    # Focused OCR can include a surviving caption letter in the same line as
    # a logo. Prefer the measured badge boundary over that oversized OCR line.
    return [region for region in protected if region in measured_badges or not any(
        max(0, min(region[2], badge[2]) - max(region[0], badge[0])) > (region[2] - region[0]) * 0.6
        for badge in measured_badges)]


def residual_tracks(samples, tracks, width, height, protected, minimum_observations=2):
    lower = [track for track in tracks if track["box"][1] > height * 0.60]
    if not lower:
        assign_recovery_exclusions(tracks)
        return []
    font_height = float(np.median([track["height"] for track in lower]))
    top = max(0, min(track["box"][1] for track in lower))
    bottom = min(height, max(track["box"][1] + track["box"][3] for track in lower))
    proved_modes = {mode for track in lower for mode in track["modes"] if mode != "dark"}
    fragments = []
    for sample in samples:
        if sample["index"] % 50 == 0:
            emit("progress", phase="analyzing", pct=50,
                 message="Checking remaining caption letters (%d/%d frames)" % (sample["index"] + 1, len(samples)))
        if sample["time"] < min(track["times"][0] for track in lower) - 3.0:
            continue
        frame = load_png(sample["source"])
        roi = frame[top:bottom]
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        covered_mask = np.zeros((height, width), np.uint8)
        for track in lower:
            if any(item["sample"] == sample["index"] for item in track["detections"]):
                tx, ty, tw, th = track["box"]
                covered_mask[ty:ty + th, tx:tx + tw] |= track_mask(frame, track, sample["time"])
        # Discover single outlined glyphs left by an earlier eraser. They are
        # linked to a caption baseline already proved by OCR, never a guessed
        # bottom strip. New colours need stronger outline evidence than proved
        # foreground colours (e.g. a remaining yellow karaoke stroke).
        modes = sorted(proved_modes)
        saturated = hsv[(hsv[:, :, 1] > 170) & (hsv[:, :, 2] > 170), 0]
        if saturated.size:
            bins = np.bincount((saturated // 10).astype(int), minlength=18)
            modes += [str(index * 10 + 5) for index in np.argsort(bins)[-4:] if bins[index] >= 8 and str(index * 10 + 5) not in proved_modes]
        observations = []
        for mode in modes:
            if mode == "light":
                selected = (gray > 190) & (hsv[:, :, 1] < 100)
            else:
                hue = float(mode)
                delta = np.minimum(np.abs(hsv[:, :, 0].astype(float) - hue), 180 - np.abs(hsv[:, :, 0].astype(float) - hue))
                known = mode in proved_modes
                selected = (delta < 12) & (hsv[:, :, 1] > (110 if known else 170)) & (hsv[:, :, 2] > (140 if known else 170))
            # A terminal letter may touch a pale logo panel. Split the protected
            # panel off before connected components so that letter stays visible.
            for px1, py1, px2, py2 in protected:
                upper, lower_y = max(0, py1 - top), min(roi.shape[0], py2 - top)
                if upper < lower_y:
                    selected[upper:lower_y, px1:px2] = False
            count, labels, stats, _ = cv2.connectedComponentsWithStats(selected.astype(np.uint8), 8)
            for label in range(1, count):
                x, y, w, h, area = [int(value) for value in stats[label]]
                minimum_height = font_height * (0.30 if mode == "light" else 0.35)
                if not (max(8, minimum_height) <= h <= font_height * 1.40 and
                        w <= max(h * 2.0, font_height * 1.6) and area >= 8):
                    continue
                cx, cy = x + w / 2, y + top + h / 2
                if any(px1 <= cx <= px2 and py1 <= cy <= py2 for px1, py1, px2, py2 in protected):
                    continue
                # An OCR word box alone is not proof of pixel coverage: colour
                # changes and letters clipped by a logo can escape its seed.
                component_pixels = labels[y:y + h, x:x + w] == label
                if np.mean(covered_mask[y + top:y + top + h, x:x + w][component_pixels] > 0) >= 0.95:
                    continue
                pad = 3
                left, right = max(0, x - pad), min(width, x + w + pad)
                upper, lower_y = max(0, y - pad), min(roi.shape[0], y + h + pad)
                component = (labels[upper:lower_y, left:right] == label).astype(np.uint8)
                ring = (cv2.dilate(component, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))) > 0) & (component == 0)
                region_gray = gray[upper:lower_y, left:right]
                if not np.any(ring):
                    continue
                dark_fraction = float(np.mean(region_gray[ring] < 90))
                contrast = float(np.median(region_gray[component > 0])) - float(np.percentile(region_gray[ring], 25))
                relaxed = mode != "light" and mode in proved_modes
                required_dark = 0.65 if mode == "light" else (0.20 if relaxed else 0.40)
                required_contrast = 140 if mode == "light" else (70 if relaxed else 80)
                if dark_fraction < required_dark or contrast < required_contrast:
                    continue
                if any(abs(cx - previous["box"][0] - previous["box"][2] / 2) < w * 0.5 and
                       abs(cy - previous["box"][1] - previous["box"][3] / 2) < h * 0.5 for previous in observations):
                    continue
                detection = dict(sample=sample["index"], time=sample["time"], text="outlined caption fragment",
                                 words=[dict(text="fragment", box=[x, y + top, w, h])], box=[x, y + top, w, h])
                observations.append(detection)
                match = next((track for track in fragments if track["modes"] == [mode] and
                              sample["time"] - track["detections"][-1]["time"] <= 1.0 and
                              not any(item["sample"] == sample["index"] for item in track["detections"]) and
                              abs(cx - track["cx"]) < max(w, track["w"], font_height * 0.4) and
                              abs(cy - track["cy"]) < font_height * 0.4), None)
                if match is None:
                    match = dict(modes=[mode], cx=cx, cy=cy, w=w, detections=[])
                    fragments.append(match)
                if not any(item["sample"] == sample["index"] for item in match["detections"]):
                    match["detections"].append(detection)
    result = []
    for fragment in fragments:
        detections = fragment["detections"]
        if len(detections) < minimum_observations:
            linked = any(item["sample"] == detection["sample"] and
                         track["box"][0] <= detection["box"][0] + detection["box"][2] / 2 <= track["box"][0] + track["box"][2] and
                         any(abs(detection["box"][1] + detection["box"][3] / 2 - wy - wh / 2) <= wh * 0.60
                             for wx, wy, ww, wh in (word["box"] for word in item["words"]))
                         for track in lower for item in track["detections"] for detection in detections)
            if not linked:
                continue
        xs = [item["box"][0] + item["box"][2] / 2 for item in detections]
        ys = [item["box"][1] + item["box"][3] / 2 for item in detections]
        if float(np.std(xs)) > max(2.0, font_height * 0.06) or float(np.std(ys)) > max(2.0, font_height * 0.06):
            continue
        pad = max(4, round(font_height * 0.28))
        left = max(0, min(item["box"][0] for item in detections) - pad)
        upper = max(0, min(item["box"][1] for item in detections) - pad)
        right = min(width, max(item["box"][0] + item["box"][2] for item in detections) + pad)
        lower_y = min(height, max(item["box"][1] + item["box"][3] for item in detections) + pad)
        fragment.update(box=[left, upper, right - left, lower_y - upper], height=font_height, padding=pad,
                        times=[item["time"] for item in detections], fragment=True, protected=protected)
        result.append(fragment)
    assign_recovery_exclusions(tracks + result)
    return result


def assign_recovery_exclusions(tracks):
    # A donor frame's OCR word is never clean background, even if its karaoke
    # colour is absent from this track's palette. Keep every overlapping proved
    # caption (including other lines and fragments) out of temporal recovery.
    observations = {}
    for source_track in tracks:
        pad = max(3, round(source_track["height"] * 0.28))
        for detection in source_track["detections"]:
            regions = observations.setdefault(str(detection["sample"]), [])
            for word in detection["words"]:
                wx, wy, ww, wh = word["box"]
                regions.append([math.floor(wx) - pad, math.floor(wy) - pad,
                                math.ceil(wx + ww) + pad, math.ceil(wy + wh) + pad])
    for track in tracks:
        x, y, w, h = track["box"]
        track["recoveryExclusions"] = {
            index: [box for box in boxes if box[0] < x + w and box[2] > x and box[1] < y + h and box[3] > y]
            for index, boxes in observations.items()}
        track["recoveryExclusions"] = {index: boxes for index, boxes in track["recoveryExclusions"].items() if boxes}


def track_mask(frame, track, timestamp=None):
    x, y, w, h = track["box"]
    if timestamp is not None and track.get("outlined") and not track.get("fragment"):
        # Expanding the first/last OCR timestamp is necessary for captions that
        # appear between samples. Bare scenery at either edge still needs actual
        # outlined letters before it can receive a mask.
        if timestamp < track["times"][0] or timestamp > track["times"][-1]:
            closest = min(track["detections"], key=lambda item: abs(item["time"] - timestamp))
            if outlined_letters(frame, closest, stop_at=2) < 2:
                return np.zeros((h, w), np.uint8)
    roi = frame[y:y + h, x:x + w]
    seed = np.zeros((h, w), np.uint8)
    for mode in track["modes"]:
        seed |= glyph_seed(roi, mode, track["height"], 3.0 if track.get("fragment") else 1.6)
    detections = track["detections"]
    if timestamp is not None:
        near = sorted(detections, key=lambda item: abs(item["time"] - timestamp))[:2]
        closest = abs(near[0]["time"] - timestamp)
        near = [item for item in near if abs(item["time"] - timestamp) <= closest + 0.52]
    else:
        near = detections
    word_area = np.zeros_like(seed)
    for detection in near:
        for word in detection["words"]:
            wx, wy, ww, wh = word["box"]
            pad = max(2, round(wh * 0.10))
            left, right = max(0, math.floor(wx - x) - pad), min(w, math.ceil(wx + ww - x) + pad)
            top, bottom = max(0, math.floor(wy - y) - pad), min(h, math.ceil(wy + wh - y) + pad)
            if left < right and top < bottom:
                word_area[top:bottom, left:right] = 255
    seed &= word_area
    # Reject isolated scene highlights; caption lines have several letter strokes.
    if np.count_nonzero(seed) < max(12, track["height"] * 0.6):
        return np.zeros((h, w), np.uint8)
    # OCR boxes cover the bright fill; an outline plus drop shadow can extend
    # 6–8 pixels beyond a 30px glyph. Cover that halo without filling the band.
    margin = max(3, round(track["height"] * 0.24))
    mask = cv2.dilate(seed, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (margin * 2 + 1,) * 2))
    for px1, py1, px2, py2 in track.get("protected", []):
        left, right = max(0, px1 - x), min(w, px2 - x)
        upper, lower = max(0, py1 - y), min(h, py2 - y)
        if left < right and upper < lower:
            mask[upper:lower, left:right] = 0
    return mask


def active_track(track, timestamp, interval):
    index = bisect.bisect_left(track["times"], timestamp)
    neighbors = track["times"][max(0, index - 1):index + 1]
    # The first/last visible frame may lie almost one sampling interval from
    # the OCR observation. Pixel-level glyph detection gates the expanded edge.
    return bool(neighbors) and min(abs(value - timestamp) for value in neighbors) <= interval + 0.02


class FrameCache:
    def __init__(self, samples, limit=20):
        self.samples, self.limit, self.frames = samples, limit, OrderedDict()

    def get(self, index):
        if index in self.frames:
            self.frames.move_to_end(index)
            return self.frames[index]
        frame = load_png(self.samples[index]["source"])
        self.frames[index] = frame
        if len(self.frames) > self.limit:
            self.frames.popitem(last=False)
        return frame


def restore_region(frame, track, mask, timestamp, samples, cache):
    x, y, w, h = track["box"]
    original = frame[y:y + h, x:x + w]
    region = original.copy()
    remaining = mask.copy()
    sample_times = [sample["time"] for sample in samples]
    position = bisect.bisect_left(sample_times, timestamp)
    # Nearby frames from both sides can reveal pixels hidden under an earlier or
    # later caption. Scene cuts/motion fail the surrounding-pixel match below.
    candidates = sorted(range(max(0, position - 8), min(len(samples), position + 8)),
                        key=lambda index: abs(samples[index]["time"] - timestamp))
    temporal_pixels = 0
    for index in candidates:
        if not np.any(remaining):
            break
        candidate = cache.get(index)
        candidate_region = candidate[y:y + h, x:x + w]
        candidate_mask = track_mask(candidate, track, samples[index]["time"])
        for left, upper, right, lower in track.get("recoveryExclusions", {}).get(str(samples[index]["index"]), []):
            left, right = max(0, left - x), min(w, right - x)
            upper, lower = max(0, upper - y), min(h, lower - y)
            if left < right and upper < lower:
                candidate_mask[upper:lower, left:right] = 255
        clear = (mask == 0) & (candidate_mask == 0)
        if np.count_nonzero(clear) < w * h * 0.25:
            continue
        difference = np.abs(original.astype(np.int16) - candidate_region.astype(np.int16)).mean(axis=2)
        # Require the visible background to agree. Never paste across a scene cut.
        if float(np.median(difference[clear])) > 5 or float(np.mean(difference[clear])) > 12:
            continue
        # Each recovered pixel also needs a matching local neighborhood, avoiding
        # copying a moving subject just because most of a backdrop is unchanged.
        local_error = cv2.blur(np.where(clear, difference, 0).astype(np.float32), (15, 15))
        usable = (remaining > 0) & (candidate_mask == 0) & (local_error < 4)
        region[usable] = candidate_region[usable]
        remaining[usable] = 0
        temporal_pixels += int(np.count_nonzero(usable))
    if np.any(remaining):
        fill_mask = remaining.copy()
        # Keep a protected logo out of the inpaint donors too. Otherwise its
        # pale panel can bleed into a removed terminal letter above the badge.
        for px1, py1, px2, py2 in track.get("protected", []):
            left, right = max(0, px1 - x), min(w, px2 - x)
            upper, lower = max(0, py1 - y), min(h, py2 - y)
            if left < right and upper < lower:
                fill_mask[upper:lower, left:right] = 255
        region = cv2.inpaint(region, fill_mask, max(3, round(track["height"] * 0.16)), cv2.INPAINT_TELEA)
    # Exact pixel preservation outside the glyph/shadow mask.
    original[mask > 0] = region[mask > 0]
    return temporal_pixels


def clean_frame(frame, tracks, timestamp, samples, cache, interval):
    # Select every mask from the immutable decoded frame before modifying any
    # pixels. Overlapping tracks cannot manufacture new seeds in an earlier fill.
    masks = [(track, track_mask(frame, track, timestamp)) for track in tracks
             if active_track(track, timestamp, interval)]
    masked_pixels = temporal_pixels = 0
    for track, mask in masks:
        count = int(np.count_nonzero(mask))
        if count:
            temporal_pixels += restore_region(frame, track, mask, timestamp, samples, cache)
            masked_pixels += count
    return masked_pixels, temporal_pixels


def ebml_size(length):
    for size in range(1, 9):
        if length < (1 << (size * 7)) - 1:
            return (length | (1 << (size * 7))).to_bytes(size, "big")
    raise ValueError("EBML element is too large.")


def element(identifier, payload):
    encoded_id = identifier.to_bytes((identifier.bit_length() + 7) // 8, "big")
    return encoded_id + ebml_size(len(payload)) + payload


def uint_element(identifier, value):
    return element(identifier, int(value).to_bytes(max(1, (int(value).bit_length() + 7) // 8), "big"))


def matroska_header(width, height, default_duration):
    # Timestamped raw BGR frames let FFmpeg retain the input's variable frame
    # timing. A rawvideo pipe with a guessed -r would change narration sync.
    ebml = element(0x1A45DFA3, uint_element(0x4286, 1) + uint_element(0x42F7, 1) +
                   uint_element(0x42F2, 4) + uint_element(0x42F3, 8) + element(0x4282, b"matroska") +
                   uint_element(0x4287, 4) + uint_element(0x4285, 2))
    segment = b"\x18\x53\x80\x67\x01\xff\xff\xff\xff\xff\xff\xff"
    info = element(0x1549A966, uint_element(0x2AD7B1, 1000) + element(0x4D80, b"CaptionEraser") + element(0x5741, b"CaptionEraser"))
    bitmap_header = struct.pack("<IiiHHIIiiII", 40, width, -height, 1, 24, 0, width * height * 3, 0, 0, 0, 0)
    video = element(0xE0, uint_element(0xB0, width) + uint_element(0xBA, height))
    track = element(0xAE, uint_element(0xD7, 1) + uint_element(0x73C5, 1) + uint_element(0x83, 1) +
                    element(0x86, b"V_MS/VFW/FOURCC") + element(0x63A2, bitmap_header) +
                    uint_element(0x23E383, round(default_duration * 1_000_000_000)) + video)
    return ebml + segment + info + element(0x1654AE6B, track)


def timestamped_frame(frame, timestamp, duration):
    block = element(0xA1, b"\x81\x00\x00\x00" + frame.tobytes())
    group = element(0xA0, block + uint_element(0x9B, max(1, round(duration * 1_000_000))))
    return element(0x1F43B675, uint_element(0xE7, round(timestamp * 1_000_000)) + group)


def read_exact(pipe, length):
    chunks = []
    remaining = length
    while remaining:
        chunk = pipe.read(remaining)
        if not chunk:
            if remaining == length:
                return None
            raise ValueError("The video decoder returned an incomplete frame.")
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def render_video(filename, output, video, tracks, samples, interval, ffmpeg):
    width, height = video["width"], video["height"]
    options = {"creationflags": subprocess.CREATE_NO_WINDOW} if os.name == "nt" else {}
    decoder = subprocess.Popen([ffmpeg, "-v", "error", "-i", filename,
                                "-map", "0:v:0", "-an", "-sn", "-dn", "-fps_mode", "passthrough",
                                "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:1"],
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE, **options)
    encoder = subprocess.Popen([ffmpeg, "-v", "error", "-y", "-f", "matroska", "-i", "pipe:0",
                                "-map", "0:v:0", "-an", "-c:v", "ffv1", "-level", "3", "-threads", "2",
                                "-fps_mode", "passthrough", "-enc_time_base", "demux", output],
                               stdin=subprocess.PIPE, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL, **options)
    errors = {"decode": [], "encode": []}
    drains = [threading.Thread(target=lambda: errors["decode"].append(decoder.stderr.read()), daemon=True),
              threading.Thread(target=lambda: errors["encode"].append(encoder.stderr.read()), daemon=True)]
    for drain in drains:
        drain.start()
    cache = FrameCache(samples)
    processed = changed_frames = masked_pixels = temporal_pixels = 0
    try:
        encoder.stdin.write(matroska_header(width, height, video["durations"][-1]))
        while True:
            raw = read_exact(decoder.stdout, width * height * 3)
            if raw is None:
                break
            if processed >= len(video["times"]):
                raise ValueError("The decoder produced more frames than the source timing records.")
            frame = np.frombuffer(raw, np.uint8).reshape(height, width, 3).copy()
            timestamp = video["times"][processed]
            selected, recovered = clean_frame(frame, tracks, timestamp, samples, cache, interval)
            masked_pixels += selected
            temporal_pixels += recovered
            changed_frames += int(selected > 0)
            encoder.stdin.write(timestamped_frame(frame, timestamp, video["durations"][processed]))
            processed += 1
            if processed % max(1, round(video["fps"])) == 0:
                emit("progress", phase="erasing", pct=round(50 + 49 * processed / video["frameCount"], 1),
                     framesProcessed=processed, message="Reconstructing backgrounds under detected captions")
        encoder.stdin.close()
        decoder_code = decoder.wait()
        encoder_code = encoder.wait()
        for drain in drains:
            drain.join()
        if decoder_code or encoder_code:
            raise ValueError((b"".join(errors["decode"] + errors["encode"])).decode("utf-8", "replace")[-1000:])
        if processed != video["frameCount"]:
            raise ValueError("Caption removal did not preserve the source video frame count.")
        return dict(framesProcessed=processed, changedFrames=changed_frames,
                    maskedPixels=masked_pixels, temporalRestoredPixels=temporal_pixels)
    except Exception:
        for proc in (decoder, encoder):
            if proc.poll() is None:
                proc.kill()
            proc.wait()
        if Path(output).exists():
            Path(output).unlink()
        raise
    finally:
        for pipe in (decoder.stdout, decoder.stderr, encoder.stdin, encoder.stderr):
            if pipe:
                pipe.close()


def erase(args):
    filename, output = str(Path(args.input).resolve()), str(Path(args.output).resolve())
    if not Path(filename).is_file() or filename == output:
        raise ValueError("Select an existing input video and a different output path.")
    if os.name != "nt":
        raise ValueError("Automatic local caption detection currently uses Windows OCR.")
    video = probe_video(filename, args.ffprobe)
    if video["width"] < 16 or video["height"] < 16:
        raise ValueError("The video dimensions are too small for caption detection.")
    directory = Path(args.work_dir) if args.work_dir else Path(tempfile.mkdtemp(prefix="caption-eraser-"))
    directory.mkdir(parents=True, exist_ok=True)
    # Keep all temporary sample files in a private child directory. Caller may
    # share its top-level work directory with input/output or other workers.
    with tempfile.TemporaryDirectory(prefix="detect-", dir=str(directory)) as detection_dir:
        if args.reuse_samples:
            samples = reuse_samples(filename, video, args.reuse_samples, detection_dir, args.sample_interval)
        else:
            samples = sample_frames(filename, video, detection_dir, args.sample_interval)
        recognize_samples(samples, detection_dir, args.ocr_script)
        tracks = select_caption_tracks(samples, video["width"], video["height"], args.sample_interval)
        tracks = choose_styles(tracks, samples)
        protected = corner_protection(samples, video["width"], video["height"])
        for track in tracks:
            track["protected"] = protected
        tracks += residual_tracks(samples, tracks, video["width"], video["height"], protected)
        analysis = dict(samples=[dict(index=sample["index"], time=sample["time"], scale=sample["scale"],
                                     lines=sample.get("lines", [])) for sample in samples],
                        tracks=[{key: value for key, value in track.items() if key != "captionSamples"} for track in tracks])
        analysis_path = directory / "caption-analysis.json"
        analysis_path.write_text(json.dumps(analysis, ensure_ascii=True), encoding="utf-8")
        metadata = dict(width=video["width"], height=video["height"], fps=video["fps"],
                        sourceFrames=video["frameCount"], sourceDuration=video["videoDuration"],
                        sourceVideoStartTime=video["sourceVideoStartTime"],
                        sourceContainerStartTime=video["sourceContainerStartTime"],
                        normalizedRotation=video["rotation"],
                        analysisPath=str(analysis_path), engine="Windows OCR + OpenCV", sampledFrames=len(samples))
        if not tracks:
            return dict(ok=True, changed=False, noCaptionsDetected=True, detectedRegions=[],
                        framesProcessed=0, **metadata)
        regions = [dict(x=track["box"][0], y=track["box"][1], width=track["box"][2], height=track["box"][3],
                        observations=len(track["detections"]), start=track["times"][0], end=track["times"][-1]) for track in tracks]
        if args.analysis_only:
            return dict(ok=True, changed=False, analysisOnly=True, noCaptionsDetected=False,
                        detectedRegions=regions, framesProcessed=0, **metadata)
        emit("progress", phase="erasing", pct=50, detectedRegions=regions,
             message="Detected caption positions; removing glyphs and their outlines")
        stats = render_video(filename, output, video, tracks, samples, args.sample_interval, args.ffmpeg)
        return dict(ok=True, changed=stats["changedFrames"] > 0, noCaptionsDetected=stats["changedFrames"] == 0,
                    outputPath=output, detectedRegions=regions, **stats, **metadata)


def main():
    parser = argparse.ArgumentParser(description="Detect and erase burned-in captions with local Windows OCR and OpenCV.")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--ffprobe", default="ffprobe")
    parser.add_argument("--ocr-script", default=str(Path(__file__).parent / "scripts" / "caption-eraser-ocr.ps1"))
    parser.add_argument("--work-dir")
    parser.add_argument("--sample-interval", type=float, default=0.25)
    parser.add_argument("--analysis-only", action="store_true", help="Write OCR/track diagnostics without rendering a video.")
    parser.add_argument("--reuse-samples", help="Reuse and verify source/ocr PNG samples from a prior invocation.")
    args = parser.parse_args()
    if not 0.1 <= args.sample_interval <= 2:
        parser.error("--sample-interval must be between 0.1 and 2 seconds")
    try:
        result = erase(args)
        emit("result", **result)
        return 0
    except Exception as exc:
        emit("result", ok=False, changed=False, error=str(exc))
        return 1


if __name__ == "__main__":
    sys.exit(main())
