'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const source = fs.readFileSync(path.join(__dirname, '..', 'caption-script.js'), 'utf8');
const functions = new Map();
traverse(parser.parse(source), { FunctionDeclaration(p) {
  functions.set(p.node.id.name, source.slice(p.node.start, p.node.end));
} });
const fn = name => { assert.ok(functions.has(name), name); return functions.get(name); };
const plain = value => JSON.parse(JSON.stringify(value));

function timingHarness() {
  const context = { CAPTION_WORD_LIMIT: 8, SHORT_CAPTION_GAP_SECONDS: .75 };
  vm.createContext(context);
  vm.runInContext(['normalizeNurseryCaptionText', 'buildSpeechBoundedCaptionChunks', 'buildCaptionChunksFromTranscription'].map(fn).join('\n'), context);
  return context;
}

test('actual backwards Fox timing cannot replace Tiger or be silently sorted', () => {
  const words = [
    { word: 'Tiger.', start: 38.60, end: 38.94 },
    { word: 'Fox.', start: 38.48, end: 40.46 },
  ];
  const original = plain(words);
  assert.throws(() => timingHarness().buildSpeechBoundedCaptionChunks(words), error =>
    error.captionTimingFailure === true && /timestamps conflict at word 2/.test(error.message));
  assert.deepEqual(words, original, 'Validation must not reorder or edit the recognized transcript');
});

test('a forward start that overlaps a previous word is rejected instead of covering it', () => {
  assert.throws(() => timingHarness().buildSpeechBoundedCaptionChunks([
    { word: 'Tiger', start: 38.60, end: 38.94 },
    { word: 'Fox', start: 38.80, end: 40.46 },
  ]), error => error.captionTimingFailure === true);
});

test('nonnumeric, missing, negative, collapsed and nonfinite word times cannot become captions', () => {
  const h = timingHarness();
  for (const [start, end] of [[null, 1], ['0', 1], [false, 1], [undefined, 1], [-1, 1], [1, 1], [2, 1], [NaN, 1], [0, Infinity]]) {
    assert.throws(() => h.buildSpeechBoundedCaptionChunks([{ word: 'spoken', start, end }]),
      error => error.captionTimingFailure === true, `${start}/${end}`);
  }
});

test('repaired words retain recognition order and exact Tiger/Fox speech bounds', () => {
  const words = [
    { word: 'Tiger.', start: 38.60, end: 38.94 },
    { word: 'Fox.', start: 40.48, end: 40.96 },
  ];
  assert.deepEqual(plain(timingHarness().buildSpeechBoundedCaptionChunks(words)), [
    { text: 'Tiger.', timestamp: [38.60, 38.94], words: [{ text: 'Tiger.', timestamp: [38.60, 38.94] }] },
    { text: 'Fox.', timestamp: [40.48, 40.96], words: [{ text: 'Fox.', timestamp: [40.48, 40.96] }] },
  ]);
});

test('very short valid words keep their exact end rather than extending across the next cue', () => {
  const result = timingHarness().buildSpeechBoundedCaptionChunks([
    { text: 'A.', timestamp: [1, 1.01] }, { text: 'B.', timestamp: [1.02, 1.03] },
  ]);
  assert.deepEqual(plain(result.map(cue => cue.timestamp)), [[1, 1.01], [1.02, 1.03]]);
  assert.deepEqual(plain(result.map(cue => cue.words[0].timestamp)), [[1, 1.01], [1.02, 1.03]]);
});

test('invalid ASR word timing never silently switches to supplied broad segments', () => {
  assert.throws(() => timingHarness().buildCaptionChunksFromTranscription({
    words: [{ word: 'Tiger', start: 38.6, end: 38.94 }, { word: 'Fox', start: 38.48, end: 40.46 }],
    segments: [{ text: 'Tiger Fox', start: 30, end: 45 }], text: 'Tiger Fox',
  }, 60), error => error.captionTimingFailure === true);
  const single = fn('transcribeActiveCaptionVideo');
  assert.match(single, /generatedCaptions = buildSpeechBoundedCaptionChunks\(words2\)/,
    'Transcription of separately picked narration must use the same timestamp guard');
  for (const variable of ['groqFirstErr', 'groqErr', 'svrErr']) {
    assert.match(single, new RegExp(`if \\(${variable}\\.captionTranslationFailure \\|\\| ${variable}\\.captionTimingFailure`),
      `${variable} must retain the timing error instead of starting another engine`);
  }
});

function timingDiagnostic() {
  return vm.runInNewContext('(' + fn('explainCaptionTimingFailure') + ')');
}

test('unsupported backend diagnostic retains the timing cause and requests reopen without a source path or key', async () => {
  const requests = [];
  const error = new Error('Speech timestamps conflict at word 20. Generate captions again; the previous captions are preserved.'); error.captionTimingFailure = true;
  const explained = await timingDiagnostic()(error, { engine: 'groq', contentMode: 'speech', apiKey: 'private-test-key' }, {
    async transcribeVideo(request) { requests.push(request); return { ok: false, error: 'No video path provided.' }; },
  });
  assert.deepEqual(plain(requests), [{ engine: 'groq', contentMode: 'speech', capabilityProbe: true }]);
  assert.equal(explained.cause, error);
  assert.equal(explained.captionTimingFailure, true);
  assert.equal(explained.captionBackendRestartSuggested, true);
  assert.match(explained.message, /^Speech timestamps conflict at word 20\./);
  assert.match(explained.message, /Close and reopen the app to activate the Groq timing fix/);
  assert.match(explained.message, /Your previous captions are preserved\./);
  assert.doesNotMatch(explained.message, /Generate captions again/);
});

test('a supported diagnostic retains the original strict timing failure without a misleading reopen requirement', async () => {
  const error = new Error('Speech timestamps conflict.'); error.captionTimingFailure = true;
  const result = await timingDiagnostic()(error, { engine: 'groq', contentMode: 'speech' }, {
    async transcribeVideo(request) { assert.equal(request.capabilityProbe, true); return { ok: true, groqSpeechTimingRepairVersion: 1 }; },
  });
  assert.equal(result, error);
  assert.equal(result.captionBackendRestartSuggested, undefined);
});

test('valid results, ordinary errors, song and other engines never request a diagnostic probe', async () => {
  let requests = 0;
  const api = { async transcribeVideo() { requests++; throw new Error('No probe expected'); } };
  const timingError = new Error('Speech timestamps conflict.'); timingError.captionTimingFailure = true;
  for (const [error, options] of [
    [undefined, { engine: 'groq', contentMode: 'speech' }],
    [new Error('Groq provider failed'), { engine: 'groq', contentMode: 'speech' }],
    [timingError, { engine: 'groq', contentMode: 'song' }],
    [timingError, { engine: 'local', contentMode: 'speech' }],
    [timingError, { engine: 'gemini', contentMode: 'song' }],
  ]) assert.equal(await timingDiagnostic()(error, options, api), error);
  assert.equal(requests, 0);
});

test('a rejected or malformed diagnostic can never replace the original timing cause with its own failure', async () => {
  const error = new Error('Speech timestamps conflict at word 20.'); error.captionTimingFailure = true;
  for (const response of [undefined, { ok: false, groqSpeechTimingRepairVersion: 1 }, { ok: true, groqSpeechTimingRepairVersion: 0 },
    { ok: true, groqSpeechTimingRepairVersion: '1' }, { ok: true, groqSpeechTimingRepairVersion: Infinity }]) {
    const result = await timingDiagnostic()(error, { engine: 'groq', contentMode: 'speech' }, {
      async transcribeVideo() { if (!response) throw new Error('IPC diagnostic unavailable'); return response; },
    });
    assert.equal(result.cause, error);
    assert.match(result.message, /^Speech timestamps conflict at word 20\./);
    assert.doesNotMatch(result.message, /IPC diagnostic unavailable/);
    assert.equal(result.captionTimingFailure, true);
  }
});

function uploadHarness(busy = false) {
  const loads = [];
  const originalQueue = [{ file: { name: 'old.mp4' }, captions: [{ text: 'Previous edit', timestamp: [2, 3] }] }];
  const context = {
    captionLocalBusy: () => busy,
    captionVideoQueue: originalQueue, captionQueueIndex: 0,
    syncSlider: { value: '-2500', min: '-15000', max: '15000' }, syncValue: { textContent: 'Old offset' },
    sizeSlider: { value: '50' }, sizeValue: null, gapSlider: null, gapValue: null,
    widthSlider: null, widthValue: null, strokeSlider: null, strokeValue: null, heightSlider: null, heightValue: null,
    fontSelect: { value: 'Nunito, sans-serif' }, boldCheck: { checked: true },
    document: { getElementById: () => null },
    statusText: { innerHTML: '' }, actionBtn: { disabled: false, classList: { remove() {} } },
    loadQueuedCaptionVideo: index => loads.push(index), scrollCaptionStudioToWorkSection() {},
  };
  vm.createContext(context);
  vm.runInContext(['sliderPercent', 'updateCaptionStyleValueLabels', 'acceptCaptionVideoFiles'].map(fn).join('\n'), context);
  return { context, loads, originalQueue };
}

test('a fresh valid upload resets a stale negative sync offset and its numeric label only', () => {
  const h = uploadHarness();
  h.context.acceptCaptionVideoFiles([{ name: 'new.mp4', type: 'video/mp4' }]);
  assert.equal(h.context.syncSlider.value, '0');
  assert.equal(h.context.syncValue.textContent, '50% · 0.0s');
  assert.deepEqual(h.loads, [0]);
  assert.equal(h.context.captionVideoQueue[0].file.name, 'new.mp4');
  assert.equal(h.context.sizeSlider.value, '50');
  assert.equal(h.context.fontSelect.value, 'Nunito, sans-serif');
  assert.equal(h.context.boldCheck.checked, true);
  for (const name of ['loadQueuedCaptionVideo', 'transcribeActiveCaptionVideo', 'transcribeCaptionQueueFrom']) {
    assert.doesNotMatch(fn(name), /syncSlider\.value\s*=/, `${name} must preserve a current-video offset`);
  }
});

test('a rejected or busy upload preserves the current video and its intentional sync offset', () => {
  for (const busy of [false, true]) {
    const h = uploadHarness(busy);
    h.context.acceptCaptionVideoFiles([{ name: busy ? 'new.mp4' : 'notes.txt', type: busy ? 'video/mp4' : 'text/plain' }]);
    assert.equal(h.context.syncSlider.value, '-2500');
    assert.equal(h.context.syncValue.textContent, 'Old offset');
    assert.equal(h.context.captionVideoQueue, h.originalQueue);
    assert.deepEqual(h.loads, []);
  }
});
