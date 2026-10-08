'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { createCaptionEraser, runCaptionWorker, validateVideoResult } = require('../caption-eraser.cjs');

const metadata = () => ({ streams: [
  { codec_type: 'video', codec_name: 'h264', width: 640, height: 360, avg_frame_rate: '25/1', duration: '4' },
  { codec_type: 'audio', codec_name: 'aac', duration: '4' },
], format: { duration: '4' } });

test('worker handles split JSON messages and delivers genuine progress', async () => {
  const progress = [];
  const child = new EventEmitter();
  child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.kill = () => {};
  const pending = runCaptionWorker('python', [], data => progress.push(data), { spawnProcess: () => child, idleTimeoutMs: 1000 });
  child.stdout.write('{"type":"pro');
  child.stdout.write('gress","pct":23,"phase":"Detecting"}\n');
  child.stdout.write('{"type":"result","ok":true,"changed":false}');
  child.emit('close', 0);
  assert.equal((await pending).changed, false);
  assert.equal(progress[0].pct, 23);
});

test('worker errors never become successful erasures', async () => {
  const child = new EventEmitter();
  child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.kill = () => {};
  const pending = runCaptionWorker('python', [], () => {}, { spawnProcess: () => child, idleTimeoutMs: 1000 });
  child.stdout.write('{"type":"result","ok":false,"error":"OCR unavailable"}\n');
  child.emit('close', 1);
  await assert.rejects(pending, /OCR unavailable/);
});

test('validation preserves displayed size, duration, every audio track, and removes subtitles', () => {
  const original = metadata();
  const output = metadata();
  assert.doesNotThrow(() => validateVideoResult(original, output));
  output.format.duration = '4.8';
  assert.throws(() => validateVideoResult(original, output), /duration/);
  output.format.duration = '4'; output.streams.pop();
  assert.throws(() => validateVideoResult(original, output), /audio/);
  output.streams.push({ codec_type: 'audio' }, { codec_type: 'subtitle' });
  assert.throws(() => validateVideoResult(original, output), /subtitle/);
  output.streams.pop(); output.streams[0].width = 1280;
  assert.throws(() => validateVideoResult(original, output), /dimensions/);
  const anamorphic = metadata();
  anamorphic.streams[0].sample_aspect_ratio = '16:15';
  assert.throws(() => validateVideoResult(anamorphic, metadata()), /aspect ratio/);
  assert.doesNotThrow(() => validateVideoResult(anamorphic, structuredClone(anamorphic)));
});

test('rotation validation accepts both normalized frames and unchanged remux orientation', () => {
  const original = metadata();
  original.streams[0].side_data_list = [{ rotation: 90 }];
  assert.doesNotThrow(() => validateVideoResult(original, structuredClone(original)));
  const normalized = metadata();
  normalized.streams[0].width = 360; normalized.streams[0].height = 640;
  assert.doesNotThrow(() => validateVideoResult(original, normalized));
});

async function fixture(t, { changed = false, subtitle = false, fail = false, codec = 'h264', conflictingOutput = false } = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'caption-eraser-test-'));
  t.after(async () => {
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('caption-eraser-test-'));
    await fs.rm(directory, { recursive: true, force: true });
  });
  await fs.mkdir(path.join(directory, 'scripts'));
  await fs.writeFile(path.join(directory, 'caption-eraser-worker.py'), '# fixture');
  await fs.writeFile(path.join(directory, 'scripts', 'caption-eraser-ocr.ps1'), '# fixture');
  const source = path.join(directory, 'original.mp4');
  const output = path.join(directory, 'clean.mp4');
  await fs.writeFile(source, 'source-unchanged');
  const calls = [], progress = [];
  const original = metadata();
  original.streams[0].codec_name = codec;
  if (subtitle) original.streams.push({ codec_type: 'subtitle' });
  let allocations = 0;
  const erase = createCaptionEraser({ root: directory, tempPath: directory, resolvePython: async () => 'fixture-python',
    getFFmpeg: () => 'ffmpeg', allocateOutput: () => { allocations++; return conflictingOutput ? source : output; },
    execute: async (executable, args) => {
      calls.push({ executable, args });
      if (executable === 'ffprobe') return JSON.stringify(args.at(-1) === source ? original : metadata());
      await fs.writeFile(output, 'clean-video'); return '';
    },
    runWorker: async (_python, args, report) => {
      report({ type: 'progress', pct: 40, phase: 'Detecting captions' });
      if (fail) throw new Error('Detection failed');
      if (changed) await fs.writeFile(args[args.indexOf('--output')+1], 'silent-clean-video');
      return { ok: true, changed, noCaptionsDetected: !changed, detectedRegions: changed ? [{x:10,y:240,w:200,h:30}] : [] };
    },
  });
  return { erase, source, output, calls, progress, allocations: () => allocations };
}

test('no detected captions leaves source and editor source path unchanged without a saved fake success', async t => {
  const f = await fixture(t);
  const result = await f.erase({ filePath: f.source }, data => f.progress.push(data));
  assert.deepEqual(result, { ok: true, changed: false, noCaptionsDetected: true, detectedRegions: [], removedSubtitleTracks: 0 });
  assert.equal(f.allocations(), 0);
  assert.equal(f.calls.filter(c => c.executable === 'ffmpeg').length, 0);
  assert.equal(await fs.readFile(f.source,'utf8'),'source-unchanged');
  assert.equal(f.progress.at(-1).pct,100);
});

test('detected text cleanup maps original audio and adopts only a validated separate output', async t => {
  const f = await fixture(t, { changed: true });
  const result = await f.erase({ filePath: f.source, jobId: 'job-test' }, data => f.progress.push(data));
  assert.equal(result.ok, true); assert.equal(result.changed, true);
  assert.equal(result.outputPath, f.output); assert.equal(result.fileName,'clean.mp4');
  const args = f.calls.find(c => c.executable === 'ffmpeg').args;
  assert.ok(args.includes('1:a?')); assert.ok(args.includes('-sn'));
  assert.equal(args[args.indexOf('-c:a')+1],'copy');
  assert.equal(await fs.readFile(f.source,'utf8'),'source-unchanged');
  assert.ok(f.progress.every(p=>p.jobId==='job-test' && p.filePath===f.source));
});

test('soft subtitle removal copies clean original video rather than blurring a guessed region', async t => {
  const f = await fixture(t, { subtitle: true });
  const result = await f.erase({ filePath: f.source });
  assert.equal(result.removedSubtitleTracks,1);
  assert.equal(result.cleanupMethod,'subtitle-track-removal');
  const args = f.calls.find(c=>c.executable==='ffmpeg').args;
  assert.equal(args[args.indexOf('-c:v')+1],'copy');
  assert.ok(args.includes('0:a?')); assert.ok(args.includes('-sn'));
});

test('failed detection preserves the source and reports failure without output', async t => {
  const f = await fixture(t, { fail: true });
  const result = await f.erase({ filePath: f.source });
  assert.equal(result.ok,false); assert.match(result.error,/Detection failed/);
  assert.equal(result.outputPath,undefined); assert.equal(f.allocations(),0);
  assert.equal(await fs.readFile(f.source,'utf8'),'source-unchanged');
});

test('conflicting output rejection never deletes the input video', async t => {
  const f = await fixture(t, { changed: true, conflictingOutput: true });
  const result = await f.erase({ filePath: f.source });
  assert.equal(result.ok,false); assert.match(result.error,/separate/);
  assert.equal(await fs.readFile(f.source,'utf8'),'source-unchanged');
});

test('subtitle-only VP8 is encoded into a supported MP4 video codec', async t => {
  const f = await fixture(t, { subtitle: true, codec: 'vp8' });
  const result = await f.erase({ filePath: f.source });
  assert.equal(result.ok,true);
  const args = f.calls.find(c=>c.executable==='ffmpeg').args;
  assert.equal(args[args.indexOf('-c:v')+1],'libx264');
  assert.ok(args.includes('passthrough'));
});
