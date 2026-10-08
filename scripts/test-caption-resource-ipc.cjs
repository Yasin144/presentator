'use strict';

// Exercise the actual Electron IPC callbacks without booting Electron, a voice
// server, FFmpeg or Whisper. Audio files and child processes live only in memory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const { test } = require('node:test');
const acorn = require('acorn');
const { prepareCaptionVoiceMemory } = require('../caption-resource-policy.cjs');

const source = fs.readFileSync(path.join(__dirname, '..', 'main.cjs'), 'utf8');
// CommonJS is wrapped in a function by Node and may return at the top level.
const parsed = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true });
const callbacks = new Map();
(function visit(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression'
      && node.callee.object.name === 'ipcMain' && node.callee.property.name === 'handle') {
    const [channel, callback] = node.arguments;
    if (['transcribe-video', 'cancel-transcribe-video'].includes(channel?.value)) {
      assert.equal(callback.type, 'ArrowFunctionExpression');
      callbacks.set(channel.value, source.slice(callback.start, callback.end));
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') visit(value);
  }
})(parsed);
assert.equal(callbacks.size, 2, 'Both real transcription IPC callbacks must exist.');

const GiB = 1024 ** 3;
const recognized = {
  text: 'Jingle bells', language: 'en',
  segments: [{ start: 0.2, end: 1.1, text: 'Jingle bells' }],
  words: [{ word: 'Jingle', start: 0.2, end: 0.6 }, { word: 'bells', start: 0.65, end: 1.1 }],
};
const plain = value => JSON.parse(JSON.stringify(value));

function fixture(options = {}) {
  const root = path.resolve('caption-ipc-memory-fixture');
  const videoPath = path.join(root, 'song.mp4');
  const ffmpegPath = path.join(root, 'ffmpeg.exe');
  const files = new Map([[videoPath, Buffer.from('mock video')]]);
  const timers = new Set();
  const calls = { spawn: [], fetch: [], pause: [], decisions: [], fallback: [], progress: [], kills: [], reads: [], removed: [], resumes: 0 };
  let available = options.freeBytes ?? 6 * GiB;
  let cancel;
  const context = vm.createContext({
    Buffer, path, AbortController, AbortSignal,
    process: { env: {} }, ROOT: root, SINGING_ENV: {},
    PRESENTATOR_LOCAL_MODEL: 'fixture-planner', PRESENTATOR_FAST_MODEL: 'fixture-fast', OLLAMA_PORT: 11434,
    activeCaptionTranscribeProcess: null, activeCaptionSongController: null,
    activeCaptionTranscribeCancelRequested: false,
    prepareCaptionVoiceMemory,
    os: { freemem: () => available },
    ensureCaptionWorkDir: (...parts) => path.join(root, 'caption-work', ...parts),
    fs: {
      existsSync: name => files.has(name) || name === ffmpegPath || name === path.join(root, '.voiceclone-venv', 'Scripts', 'python.exe') || name === path.join(root, 'whisper-transcribe-caption.py'),
      statSync: name => { assert.ok(files.has(name)); return { size: files.get(name).length }; },
      readFileSync: name => { calls.reads.push(name); assert.ok(files.has(name), 'Only in-memory fixture audio can be read.'); return files.get(name); },
      unlinkSync: name => { calls.removed.push(name); files.delete(name); },
    },
    require: name => {
      if (name === 'child_process') return { execSync: () => ffmpegPath + '\n' };
      if (name === './caption-audio-preprocess.cjs') return { prepareCaptionAudio: async ({ outputDirectory }) => {
        const inside = path.join(outputDirectory, 'focused.wav');
        const outside = path.join(root, 'unrelated.wav');
        files.set(inside, Buffer.from('focused WAV'));
        files.set(outside, Buffer.from('unrelated WAV'));
        return { audioPath: inside, cleanupFiles: [inside, outside], warnings: ['Fixture vocal focus warning'] };
      } };
      throw new Error('Unexpected dependency in isolated IPC test: ' + name);
    },
    console: {
      log: (...args) => { if (args[0] === '[Caption] Voice memory policy:') calls.decisions.push(plain(args[1])); },
      warn() {}, error() {},
    },
    setTimeout: (fn, ms) => { const timer = setTimeout(fn, ms); timers.add(timer); return timer; },
    clearTimeout: timer => { timers.delete(timer); clearTimeout(timer); },
    fetch: async (url, init) => {
      calls.fetch.push({ url, init });
      if (url === 'http://127.0.0.1:8426/api/narrate/progress') {
        if (options.progressFails) throw new Error('Fixture voice service unavailable');
        return { ok: true, json: async () => ({ active: options.voiceActive ?? false }) };
      }
      assert.ok(url === 'http://127.0.0.1:8432/api/unload' || url === 'http://127.0.0.1:11434/api/generate', 'Unexpected HTTP request: ' + url);
      return { ok: true };
    },
    pauseManagedServersForImage: async keys => {
      calls.pause.push(plain(keys));
      available = options.afterPauseBytes ?? 6 * GiB;
      if (options.cancelDuringPause) await cancel();
      return async () => { calls.resumes++; };
    },
    postJsonForBufferWithRecovery: async (...args) => {
      calls.fallback.push(plain(args));
      if (options.fallbackFails) throw new Error('Fixture fallback unavailable');
      return { statusCode: 200, buffer: Buffer.from(JSON.stringify(recognized)) };
    },
    killProcessTree: proc => {
      calls.kills.push(proc.pid);
      if (!proc.finished) setImmediate(() => { proc.finished = true; proc.emit('exit', 1); });
    },
    spawn: (command, args, spawnOptions) => {
      const proc = new EventEmitter();
      proc.stdout = new EventEmitter(); proc.stderr = new EventEmitter();
      proc.pid = 100 + calls.spawn.length; proc.finished = false;
      const extraction = args.includes('-vn');
      calls.spawn.push({ command, args: plain(args), options: plain(spawnOptions), extraction });
      setImmediate(async () => {
        if (extraction) {
          files.set(args.at(-1), Buffer.from('RIFF fixture WAV'));
          proc.finished = true; proc.emit('exit', 0);
        } else if (options.cancelDuringWhisper) {
          await cancel();
        } else if (options.whisperExitCode !== undefined) {
          if (!options.whisperEmpty) proc.stdout.emit('data', Buffer.from(JSON.stringify(recognized) + '\n'));
          proc.stderr.emit('data', Buffer.from('Fixture process failure'));
          proc.finished = true; proc.emit('exit', options.whisperExitCode);
        } else if (options.whisperFails) {
          proc.stdout.emit('data', Buffer.from(JSON.stringify({ error: 'Fixture ASR failed' }) + '\n'));
          proc.finished = true; proc.emit('exit', 1);
        } else {
          proc.stdout.emit('data', Buffer.from('PROGRESS:40\n' + JSON.stringify(recognized) + '\n'));
          proc.finished = true; proc.emit('exit', 0);
        }
      });
      return proc;
    },
  });
  cancel = vm.runInContext('(' + callbacks.get('cancel-transcribe-video') + ')', context);
  const transcribe = vm.runInContext('(' + callbacks.get('transcribe-video') + ')', context);
  return {
    calls, context, root, files,
    run: async overrides => {
      const result = await transcribe({ sender: { send: (channel, value) => calls.progress.push({ channel, value }) } },
        { videoPath, languageHint: 'en', contentMode: 'speech', ...overrides });
      assert.equal(context.activeCaptionTranscribeProcess, null, 'IPC must release its active process reference.');
      assert.equal(context.activeCaptionSongController, null, 'IPC must release its abort controller.');
      assert.equal(context.activeCaptionTranscribeCancelRequested, false, 'Cancellation must not leak into the next request.');
      assert.equal(timers.size, 0, 'Whisper watchdog must be cleared on every terminal path.');
      return plain(result);
    },
  };
}

const voiceChecks = calls => calls.fetch.filter(({ url }) => url.endsWith('/api/narrate/progress'));
const whisperRuns = calls => calls.spawn.filter(({ extraction }) => !extraction);

test('real IPC keeps SC3 loaded with enough RAM and returns recognized word times', async () => {
  const f = fixture({ voiceActive: true });
  const result = await f.run({ transcriptionHints: 'Jingle bells' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.words, recognized.words);
  assert.deepEqual(result.segments, recognized.segments);
  assert.equal(result.text, recognized.text);
  assert.equal(whisperRuns(f.calls).length, 1);
  assert.deepEqual(whisperRuns(f.calls)[0].args.slice(2), ['en', 'song.mp4', 'speech', 'Jingle bells']);
  assert.equal(f.calls.pause.length, 0);
  assert.equal(f.calls.resumes, 0);
  assert.equal(voiceChecks(f.calls).length, 0);
  assert.equal(f.calls.fallback.length, 0);
  assert.ok(f.calls.decisions.some(({ decision, reason }) => decision === 'keep-loaded' && reason === 'enough-memory'));
  assert.deepEqual(f.calls.progress.map(({ value }) => value), [3, 40, 100]);
});

test('low RAM and active narration blocks real IPC before ASR or HTTP fallback', async () => {
  const f = fixture({ freeBytes: GiB, voiceActive: true });
  const result = await f.run();
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CAPTION_RESOURCE_BUSY', 'Renderer must distinguish a resource refusal from an ASR error.');
  assert.match(result.error, /SC3 is generating narration.*not enough free memory/);
  assert.equal(voiceChecks(f.calls).length, 1);
  assert.equal(whisperRuns(f.calls).length, 0);
  assert.equal(f.calls.fallback.length, 0);
  assert.equal(f.calls.pause.length, 0);
  assert.equal(f.calls.resumes, 0);
});

test('failed SC3 status check fails safely without starting ASR or fallback', async () => {
  const f = fixture({ freeBytes: GiB, progressFails: true });
  const result = await f.run();
  assert.equal(result.ok, false);
  assert.match(result.error, /could not check whether SC3 is busy/);
  assert.equal(whisperRuns(f.calls).length, 0);
  assert.equal(f.calls.fallback.length, 0);
  assert.equal(f.calls.pause.length, 0);
});

test('idle low-memory SC3 pauses only the voice server and resumes once after success', async () => {
  const f = fixture({ freeBytes: GiB });
  const result = await f.run();
  assert.equal(result.ok, true);
  assert.deepEqual(result.words, recognized.words);
  assert.deepEqual(f.calls.pause, [['AnjaliAI']]);
  assert.equal(f.calls.resumes, 1);
  assert.equal(whisperRuns(f.calls).length, 1);
  assert.equal(f.calls.fallback.length, 0);
});

test('still-low RAM after idle pause resumes once and prevents ASR or fallback', async () => {
  const f = fixture({ freeBytes: GiB, afterPauseBytes: 2 * GiB });
  const result = await f.run();
  assert.equal(result.ok, false);
  assert.match(result.error, /still not enough free memory/);
  assert.deepEqual(f.calls.pause, [['AnjaliAI']]);
  assert.equal(f.calls.resumes, 1);
  assert.equal(whisperRuns(f.calls).length, 0);
  assert.equal(f.calls.fallback.length, 0);
});

test('real cancellation IPC during idle pause restores SC3 once without ASR or fallback', async () => {
  const f = fixture({ freeBytes: GiB, cancelDuringPause: true });
  const result = await f.run();
  assert.equal(result.ok, false);
  assert.equal(result.cancelled, true);
  assert.match(result.error, /cancelled/i);
  assert.equal(f.calls.resumes, 1);
  assert.equal(whisperRuns(f.calls).length, 0);
  assert.equal(f.calls.fallback.length, 0);
});

test('real cancellation IPC kills ASR, restores idle SC3 once and never uses fallback', async () => {
  const f = fixture({ freeBytes: GiB, cancelDuringWhisper: true });
  const result = await f.run();
  assert.equal(result.ok, false);
  assert.equal(result.cancelled, true);
  assert.equal(f.calls.resumes, 1);
  assert.equal(f.calls.kills.length, 1);
  assert.equal(whisperRuns(f.calls).length, 1);
  assert.equal(f.calls.fallback.length, 0);
});

test('song ASR failure restores SC3 once, skips HTTP fallback and cleans only owned enhanced audio', async () => {
  const f = fixture({ freeBytes: GiB, whisperFails: true });
  const result = await f.run({ contentMode: 'song', audioMode: 'vocal-focus' });
  assert.equal(result.ok, false);
  assert.match(result.error, /Local song transcription failed: Whisper: Fixture ASR failed/);
  assert.equal(f.calls.resumes, 1);
  assert.equal(f.calls.fallback.length, 0);
  assert.deepEqual(f.calls.removed, [path.join(f.root, 'caption-work', 'vocal-focus', 'focused.wav')]);
  assert.ok(f.files.has(path.join(f.root, 'unrelated.wav')));
});

test('speech ASR failure uses existing HTTP recovery and restores SC3 once', async () => {
  const f = fixture({ freeBytes: GiB, whisperFails: true });
  const result = await f.run();
  assert.equal(result.ok, true);
  assert.deepEqual(result.words, recognized.words);
  assert.equal(f.calls.resumes, 1);
  assert.equal(f.calls.fallback.length, 1);
  assert.deepEqual(f.calls.fallback[0].slice(0, 2), [8428, '/api/transcribe']);
  assert.equal(f.calls.fallback[0][2].wordTimestamps, true);
  assert.equal(Buffer.from(f.calls.fallback[0][2].audioBase64, 'base64').toString(), 'RIFF fixture WAV');
});

test('ASR plus HTTP recovery failure returns the original error and restores SC3 once', async () => {
  const f = fixture({ freeBytes: GiB, whisperFails: true, fallbackFails: true });
  const result = await f.run();
  assert.equal(result.ok, false);
  assert.equal(result.error, 'Whisper: Fixture ASR failed');
  assert.equal(f.calls.resumes, 1);
  assert.equal(f.calls.fallback.length, 1);
});

test('nonzero ASR exit cannot become success even when stdout contains recognized words', async () => {
  const f = fixture({ freeBytes: GiB, whisperExitCode: 1 });
  const result = await f.run({ contentMode: 'song' });
  assert.equal(result.ok, false);
  assert.match(result.error, /Whisper exited with code 1/);
  assert.equal(f.calls.resumes, 1);
  assert.equal(f.calls.fallback.length, 0);
});

test('empty ASR stdout cannot become an empty successful caption result', async () => {
  const f = fixture({ freeBytes: GiB, whisperExitCode: 0, whisperEmpty: true });
  const result = await f.run({ contentMode: 'song' });
  assert.equal(result.ok, false);
  assert.match(result.error, /Whisper parse failed/);
  assert.equal(f.calls.resumes, 1);
  assert.equal(f.calls.fallback.length, 0);
});
