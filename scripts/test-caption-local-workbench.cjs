'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'caption-script.js'), 'utf8');
const first = source.indexOf('// Canonical, copy-only boundary');
const last = source.indexOf('// Terminal notifications', first);
assert.ok(first >= 0 && last > first, 'Local caption bridge helpers must remain independently testable');
const names = ['captionLocalCanonicalCue', 'captionLocalLegacyCue', 'captionLocalValidateCues',
  'captionLocalReconcileText', 'captionLocalEditedQueueItem', 'createCaptionLocalWorkbenchBridge'];
const helpers = vm.runInNewContext(source.slice(first, last) + `\n({${names.join(',')}})`, {});
const plain = value => JSON.parse(JSON.stringify(value));
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const legacyCue = (overrides = {}) => ({
  text: 'జింగిల్\nHello', timestamp: [1, 4], colorOverride: '#12AbEf',
  words: [{ text: 'జింగిల్', timestamp: [1, 1.8] }, { text: 'Hello', timestamp: [2.1, 3.7] }],
  ...overrides,
});
const canonicalCue = (overrides = {}) => ({
  start: 1, end: 4, text: 'జింగిల్\nHello', colorOverride: '#12AbEf',
  words: [{ text: 'జింగిల్', start: 1, end: 1.8 }, { text: 'Hello', start: 2.1, end: 3.7 }],
  ...overrides,
});

function harness(options = {}) {
  const state = {
    itemId: 'local-song:0', videoName: 'song.mp4', hasVideo: true, duration: 10,
    disabled: false, captions: [legacyCue()], timingSource: 'word', warnings: ['Existing warning'],
    previewSpeed: 1, loop: false, ...options,
  };
  const calls = { apply: [], publish: [], seek: [], speed: [], loop: 0, notice: [] };
  const bridge = helpers.createCaptionLocalWorkbenchBridge({
    readState: () => state,
    apply(captions, metadata) {
      calls.apply.push({ captions, metadata });
      state.captions = captions;
      state.timingSource = metadata.timingSource;
      state.warnings = metadata.warnings;
    },
    publish(snapshot) { calls.publish.push(snapshot); },
    seek(time) { calls.seek.push(time); },
    setPreviewSpeed(speed) { calls.speed.push(speed); state.previewSpeed = speed; },
    toggleCaptionLoop() { calls.loop++; state.loop = !state.loop; return state.loop; },
    notice(message) { calls.notice.push(message); },
  });
  return { state, calls, bridge };
}

test('legacy/canonical conversion preserves multiline Unicode, exact word timing and valid cue color', () => {
  const original = freeze(legacyCue());
  const before = JSON.stringify(original);
  const canonical = helpers.captionLocalCanonicalCue(original);
  assert.deepEqual(plain(canonical), canonicalCue());
  assert.deepEqual(plain(helpers.captionLocalLegacyCue(canonical)), plain(original));
  canonical.words[0].start = 9;
  canonical.text = 'Different';
  assert.equal(JSON.stringify(original), before);
  const canonicalSource = freeze(canonicalCue());
  const back = helpers.captionLocalLegacyCue(canonicalSource);
  back.words[0].timestamp[0] = 9;
  assert.equal(canonicalSource.words[0].start, 1);
});

test('boundary converters ignore unsupported or unsafe cue colors', () => {
  for (const colorOverride of ['red', '#fff', '#112233" autofocus onfocus="alert(1)', {}, 42]) {
    assert.equal(helpers.captionLocalCanonicalCue(legacyCue({ colorOverride })).colorOverride, undefined);
    assert.equal(helpers.captionLocalLegacyCue(canonicalCue({ colorOverride })).colorOverride, undefined);
  }
});

test('validation accepts proper canonical and legacy bounds and returns owned copies', () => {
  const original = freeze([legacyCue()]);
  const accepted = helpers.captionLocalValidateCues(original, 10);
  assert.deepEqual(plain(accepted), [canonicalCue()]);
  assert.notEqual(accepted, original);
  assert.notEqual(accepted[0].words[0], original[0].words[0]);
  assert.deepEqual(plain(helpers.captionLocalValidateCues([canonicalCue()], 10)), [canonicalCue()]);
  assert.deepEqual(plain(helpers.captionLocalValidateCues([], 10)), []);
});

test('validation rejects nonnumeric, negative, nonfinite, collapsed and out-of-video cue ranges', () => {
  for (const cue of [
    canonicalCue({ start: '1' }), canonicalCue({ start: null }), canonicalCue({ start: false }),
    canonicalCue({ start: NaN }), canonicalCue({ end: Infinity }), canonicalCue({ start: -1 }),
    canonicalCue({ end: 1 }), canonicalCue({ end: 11 }), canonicalCue({ end: 10.0005 }),
    canonicalCue({ text: ' ' }), legacyCue({ timestamp: ['1', 4] }), legacyCue({ timestamp: [null, 4] }),
  ]) assert.throws(() => helpers.captionLocalValidateCues([cue], 10), `Must reject ${JSON.stringify(cue)}`);
  assert.throws(() => helpers.captionLocalValidateCues({ captions: [] }, 10));
});

test('validation rejects words outside exact bounds, nonnumeric times, collapse, overlap and malformed words', () => {
  for (const words of [
    [{ text: 'Hello', start: .9995, end: 2 }], [{ text: 'Hello', start: 2, end: 4.0005 }],
    [{ text: 'Hello', start: 2, end: 2 }], [{ text: 'Hello', start: NaN, end: 3 }],
    [{ text: 'Hello', start: '1', end: 2 }], [{ text: 'Hello', start: null, end: 2 }],
    [{ text: 'Hello', start: 1, end: 2.1005 }, { text: 'world', start: 2.1, end: 3 }],
    [{ text: 'Hello', start: 2.1, end: 3 }, { text: 'world', start: 1, end: 2 }],
    [{ text: '', start: 1, end: 2 }], [{ text: {}, start: 1, end: 2 }], [null], 'invalid', {},
  ]) assert.throws(() => helpers.captionLocalValidateCues([canonicalCue({ words })], 10), `Must reject ${JSON.stringify(words)}`);
});

test('same-count text edits keep owned word timings while changed counts clear stale words', () => {
  const original = freeze(legacyCue());
  const before = JSON.stringify(original);
  const edited = helpers.captionLocalReconcileText(original, 'నమస్తే\nBells!');
  assert.equal(edited.estimated, false);
  assert.equal(edited.cue.text, 'నమస్తే\nBells!');
  assert.deepEqual(plain(edited.cue.words), [{ text: 'నమస్తే', timestamp: [1, 1.8] }, { text: 'Bells!', timestamp: [2.1, 3.7] }]);
  assert.equal(edited.cue.colorOverride, '#12AbEf');
  assert.notEqual(edited.cue.words[0].timestamp, original.words[0].timestamp);
  const longer = helpers.captionLocalReconcileText(original, 'నమస్తే three new words');
  assert.equal(longer.estimated, true);
  assert.equal(longer.cue.words, undefined);
  assert.equal(longer.cue.colorOverride, '#12AbEf');
  const noWordTimes = helpers.captionLocalReconcileText(legacyCue({ words: undefined }), 'Two words');
  assert.equal(noWordTimes.estimated, true);
  assert.equal(noWordTimes.cue.words, undefined);
  assert.equal(JSON.stringify(original), before);
});

test('edited queue snapshots own caption/metadata data and invalidate every previous exported result', () => {
  const file = { name: 'song.mp4', path: 'D:/song.mp4' };
  const original = freeze({ file, captions: [legacyCue()], status: 'exported', progress: 100,
    timingSource: 'word', warnings: ['Before'], outputPath: 'D:/old.mp4', outputFileName: 'old.mp4', outputUrl: 'file:///old.mp4' });
  const captions = freeze([canonicalCue({ text: 'Edited\ntext' })]);
  const metadata = freeze({ timingSource: 'estimated', warnings: ['After'] });
  const edited = helpers.captionLocalEditedQueueItem(original, captions, metadata);
  assert.equal(edited.file, file);
  assert.equal(edited.status, 'transcribed');
  assert.equal(edited.progress, 0);
  assert.equal(edited.outputPath, undefined);
  assert.equal(edited.outputFileName, undefined);
  assert.equal(edited.outputUrl, undefined);
  assert.equal(edited.timingSource, 'estimated');
  assert.deepEqual(plain(edited.warnings), ['After']);
  assert.equal(edited.captions[0].text, 'Edited\ntext');
  assert.notEqual(edited.captions[0].words[0], captions[0].words[0]);
  assert.notEqual(edited.warnings, metadata.warnings);
  assert.equal(original.outputPath, 'D:/old.mp4');
  assert.equal(original.captions[0].text, 'జింగిల్\nHello');
});

test('bridge getState and published snapshots are copies, not shared legacy caption/metadata objects', () => {
  const h = harness();
  const before = JSON.stringify(h.state);
  const snapshot = h.bridge.getState();
  snapshot.captions[0].words[0].start = 8;
  snapshot.captions[0].text = 'Changed';
  snapshot.warnings.push('Changed');
  assert.equal(JSON.stringify(h.state), before);
  const published = h.bridge.publish();
  assert.equal(h.calls.publish.length, 1);
  published.captions[0].words[0].text = 'Changed again';
  assert.equal(JSON.stringify(h.state), before);
});

test('bridge refuses stale video requests and busy edits without mutations or publishes', () => {
  for (const options of [{}, { disabled: true }, { itemId: '' }]) {
    const h = harness(options);
    const before = JSON.stringify(h.state);
    const itemId = options.disabled ? h.state.itemId : 'other-video';
    assert.throws(() => h.bridge.applyCaptions(itemId, [canonicalCue()], { timingSource: 'estimated' }), /selected video changed|Wait/);
    assert.throws(() => h.bridge.seek(itemId, 2), /selected video changed|Wait/);
    assert.throws(() => h.bridge.toggleCaptionLoop(itemId), /selected video changed|Wait/);
    assert.equal(JSON.stringify(h.state), before);
    assert.equal(h.calls.apply.length, 0);
    assert.equal(h.calls.publish.length, 0);
    assert.equal(h.calls.seek.length, 0);
    assert.equal(h.calls.loop, 0);
  }
});

test('bridge validates every cue atomically before applying a replacement', () => {
  const h = harness();
  const before = JSON.stringify(h.state);
  assert.throws(() => h.bridge.applyCaptions(h.state.itemId, [canonicalCue(), canonicalCue({ start: 5, end: 5 })]));
  assert.equal(h.calls.apply.length, 0);
  assert.equal(h.calls.publish.length, 0);
  assert.equal(JSON.stringify(h.state), before);
});

test('bridge applies converted copies, keeps cue colors/multiline, and publishes the new state', () => {
  const h = harness();
  const input = [canonicalCue({ text: 'Edited\nlyrics' })];
  const metadata = { timingSource: 'estimated', warnings: ['Review timing'] };
  assert.equal(h.bridge.applyCaptions(h.state.itemId, input, metadata), true);
  assert.equal(h.calls.apply.length, 1);
  assert.equal(h.calls.publish.length, 1);
  assert.equal(h.state.captions[0].text, 'Edited\nlyrics');
  assert.equal(h.state.captions[0].colorOverride, '#12AbEf');
  assert.deepEqual(plain(h.state.captions[0].words[0].timestamp), [1, 1.8]);
  input[0].words[0].start = 9;
  metadata.warnings.push('Changed outside');
  assert.equal(h.state.captions[0].words[0].timestamp[0], 1);
  assert.deepEqual(plain(h.state.warnings), ['Review timing']);
});

test('bridge undo can explicitly restore undefined provenance and empty warnings; absent metadata preserves current values', () => {
  const h = harness();
  h.bridge.applyCaptions(h.state.itemId, [canonicalCue()], {});
  assert.equal(h.state.timingSource, 'word');
  assert.deepEqual(plain(h.state.warnings), ['Existing warning']);
  h.bridge.applyCaptions(h.state.itemId, [canonicalCue()], { timingSource: undefined, warnings: undefined });
  assert.equal(h.state.timingSource, undefined);
  assert.deepEqual(plain(h.state.warnings), []);
  assert.equal(h.calls.publish.at(-1).timingSource, undefined);
  assert.deepEqual(plain(h.calls.publish.at(-1).warnings), []);
});

test('preview bridge requires a usable video, respects busy state, and limits playback rates', () => {
  const h = harness();
  assert.equal(h.bridge.seek(h.state.itemId, 2), true);
  assert.deepEqual(h.calls.seek, [2]);
  assert.equal(h.bridge.seek(h.state.itemId, NaN), false);
  assert.equal(h.bridge.seek(h.state.itemId, Infinity), false);
  for (const speed of [0.5, 0.75, 1, 1.25, 1.5]) assert.equal(h.bridge.setPreviewSpeed(speed), true);
  for (const speed of [0, -1, 2, NaN, Infinity]) assert.equal(h.bridge.setPreviewSpeed(speed), false);
  assert.equal(h.bridge.toggleCaptionLoop(h.state.itemId), true);
  assert.equal(h.calls.loop, 1);
  h.state.disabled = true;
  assert.equal(h.bridge.setPreviewSpeed(1), false);
  h.state.disabled = false;
  h.state.hasVideo = false;
  assert.equal(h.bridge.seek(h.state.itemId, 3), false);
  assert.equal(h.bridge.toggleCaptionLoop(h.state.itemId), false);
  h.state.hasVideo = true;
  h.state.captions = [];
  assert.equal(h.bridge.toggleCaptionLoop(h.state.itemId), false);
});
