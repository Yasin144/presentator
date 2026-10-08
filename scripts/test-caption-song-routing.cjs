'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/caption/transcribe.ts'), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
const legacy = fs.readFileSync(require('node:path').join(__dirname, '../caption-script.js'), 'utf8');

test('Gemini song selection reaches IPC, preserves repeated lyrics and estimated timing metadata', async () => {
  let request;
  const context = {
    LANG_CODE: { English: 'en' }, CODE_TO_NAME: { en: 'English' }, DOMException,
    window: { electronAPI: { getPathForFile: () => 'song.mp4', transcribeVideo: async opts => {
      request = opts;
      return { ok: true, language: 'en', contentMode: 'song', timingSource: 'estimated', warnings: ['Review timing'], text: 'Jingle jingle jingle', words: [0,1,2].map(start => ({word:'Jingle',start,end:start + 0.8})) };
    } } },
  };
  const run = vm.runInNewContext(stripTypeScriptTypes(source) + '\ntranscribeWithHuggingFace', context);
  const result = await run({}, 'English', '', 8, () => {}, 'gemini', undefined, 'song');
  assert.equal(request.engine, 'gemini');
  assert.equal(request.contentMode, 'song');
  assert.equal(result.captions.map(c=>c.text).join(' '), 'Jingle Jingle Jingle');
  assert.equal(result.timingSource, 'estimated');
  assert.equal(result.warnings[0], 'Review timing');
});

test('both legacy song modes select song filtering and the intended engine', () => {
  const helpers = legacy.slice(legacy.indexOf('function getCaptionTranscriptionOptions()'), legacy.indexOf('function spokenPhraseStart('));
  for (const [selected, mode, engine] of [['song-gemini','song','gemini'],['song','song','local'],['speech','speech','local']]) {
    const result = vm.runInNewContext(helpers + '\n({options:getCaptionTranscriptionOptions(),song:isSongCaptionMode()})', {document:{getElementById:()=>({value:selected})}});
    assert.equal(result.options.contentMode,mode);
    assert.equal(result.options.engine,engine);
    assert.equal(result.song,mode === 'song');
  }
});
