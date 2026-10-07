'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'caption-script.js'), 'utf8');
const functions = new Map();
traverse(parser.parse(script), { FunctionDeclaration(p) {
  functions.set(p.node.id.name, script.slice(p.node.start, p.node.end));
} });
const names = ['getCaptionFontFamily', 'getCaptionWordTimeline', 'getCaptionWordEnd',
  'getCaptionActiveWordIndex', 'getVisibleCaptionText', 'getWrappedCaptionLines', 'drawWrappedText',
  'getCaptionEmojiBitmap', 'addCaptionEmojiOverlay', 'buildPreviewMatchedExport',
  'stripIgnoredIntroCaption', 'removeIgnoredIntroCaptions', 'toAssTimestamp',
  'escapeAssCaptionText', 'hexToAss', 'getAssStyleConfig', 'buildPreviewMatchedAss'];
const production = names.map(name => { assert.ok(functions.has(name), name); return functions.get(name); }).join('\n');
function harness(overrides = {}) {
  const context = {
    CAPTION_WORD_LIMIT: 8, CAPTION_BOTTOM_OFFSET_PX: 80, SHORT_CAPTION_GAP_SECONDS: .75,
    sourceVideo: { videoWidth: 1920, videoHeight: 1080, duration: 10 }, renderCanvas: {},
    sizeSlider: { value: 50 }, styleSelect: { value: 'white-yellow' }, colorPicker: { value: '#fde047' },
    strokeSlider: { value: 0 }, captionPosX: .5, captionPosY: .9, gapSlider: { value: 120 },
    widthSlider: { value: 85 }, fontSelect: { value: 'Nunito, sans-serif' }, boldCheck: { checked: true },
    heightSlider: { value: 100 }, karaokeCheck: { checked: true }, emojiCheck: { checked: false },
    progressCheck: { checked: false }, getCaptionSyncOffsetSeconds: () => 0,
    document: { createElement: () => ({ getContext: () => null }) },
    generatedCaptions: [{ text: 'Hello world', timestamp: [0, 2], words: [
      { text: 'Hello', timestamp: [0, .5] }, { text: 'world', timestamp: [1, 2] },
    ] }], ...overrides,
  };
  return vm.runInNewContext(production + '\n({ buildPreviewMatchedAss, getCaptionActiveWordIndex, getVisibleCaptionText, getCaptionWordTimeline, getCaptionWordEnd })', context);
}
const lines = ass => ass.split('\n').filter(line => line.startsWith('Dialogue:'));
test('export preserves the preview font, em size, yellow and dark outline', () => {
  const ass = harness().buildPreviewMatchedAss();
  const style = ass.split('\n').find(line => line.startsWith('Style: Preview,')).slice(7).split(',');
  assert.equal(style[1], 'Nunito Black');
  assert.equal(Number(style[2]), 50 * 1.377);
  assert.equal(style[3].toUpperCase(), '&H0047E0FD&');
  assert.equal(style[5].toUpperCase(), '&H00201810&');
  assert.equal(Number(style[12]), 100);
  assert.equal(Number(style[15]), 1);
  assert.equal(Number(style[16]), 3.75);
  assert.equal(Number(style[17]), 0);
});
test('karaoke off produces all-white text and respects the regular font', () => {
  const ass = harness({ karaokeCheck: { checked: false }, boldCheck: { checked: false } }).buildPreviewMatchedAss();
  assert.match(ass, /Style: Preview,Nunito,68\.85,/);
  for (const line of lines(ass)) {
    assert.doesNotMatch(line, /47e0FD/i);
    assert.match(line, /1c&H00FFFFFF/);
  }
});
test('preview and export use the same eight-word group after an edited long caption', () => {
  const text = 'one two three four five six seven eight nine ten';
  const cap = { text, timestamp: [0, 10] };
  const h = harness({ generatedCaptions: [cap] });
  const output = lines(h.buildPreviewMatchedAss());
  assert.equal(h.getVisibleCaptionText(text, 8), 'nine ten');
  assert.match(output[8], /nine.*ten/);
  assert.doesNotMatch(output[8], /one|eight/);
});
test('long speech gaps disappear at the same moment in preview and export', () => {
  const cap = { text: 'Hello world', timestamp: [0, 5], words: [
    { text: 'Hello', timestamp: [0, .5] }, { text: 'world', timestamp: [3, 5] },
  ] };
  const h = harness({ generatedCaptions: [cap] });
  assert.equal(h.getCaptionActiveWordIndex(cap, 1), 0);
  assert.equal(h.getCaptionActiveWordIndex(cap, 1.25), -1);
  assert.equal(h.getCaptionActiveWordIndex(cap, 3), 1);
  assert.match(lines(h.buildPreviewMatchedAss())[0], /0:00:00\.00,0:00:01\.25/);
});
test('a short final-word hold is identical in preview and export', () => {
  const cap = { text: 'Hello', timestamp: [0, 3], words: [{ text: 'Hello', timestamp: [0, 1] }] };
  const h = harness({ generatedCaptions: [cap] });
  assert.equal(h.getCaptionActiveWordIndex(cap, 1.5), 0);
  assert.equal(h.getCaptionActiveWordIndex(cap, 1.75), -1);
  assert.match(lines(h.buildPreviewMatchedAss())[0], /0:00:00\.00,0:00:01\.75/);
});
test('caption-specific edited colors survive export', () => {
  const ass = harness({ styleSelect: { value: 'classic' }, generatedCaptions: [
    { text: 'Hello', timestamp: [0, 1], colorOverride: '#22d3ee' },
  ] }).buildPreviewMatchedAss();
  assert.match(lines(ass)[0], /1c&H00eed322/i);
});
test('4K preview uses source-pixel size and position on the reduced canvas', () => {
  const calls = [], scales = [];
  const noop = () => {};
  const ctx = { save: noop, restore: noop, drawImage: noop, imageSmoothingEnabled: true,
    scale: (...args) => scales.push(args), measureText: text => ({ width: text.length * 20 }) };
  const context = {
    CAPTION_WORD_LIMIT: 8, SHORT_CAPTION_GAP_SECONDS: .75, window: {},
    sourceVideo: { videoWidth: 3840, videoHeight: 2160, readyState: 2 }, filterSelect: { value: 'none' },
    syncSlider: { value: 0 }, generatedCaptions: [{ text: 'Hello', timestamp: [0, 2] }],
    bgMusicAudio: null, bgMusicCheck: null, getBrollForText: () => null, sizeSlider: { value: 50 },
    gapSlider: { value: 120 }, heightSlider: { value: 100 }, widthSlider: { value: 85 },
    karaokeCheck: { checked: false }, lastSfxWordIndex: -1, emojiCheck: { checked: false },
    fontSelect: { value: 'Arial' }, boldCheck: { checked: true }, captionPosX: .5, captionPosY: .9,
    styleSelect: { value: 'white-yellow' }, sharedWatermarkImage: null, progressCheck: { checked: false },
    drawWrappedText: (...args) => calls.push(args),
  };
  const code = ['getCaptionFontFamily', 'getCaptionWordTimeline', 'getCaptionWordEnd',
    'getCaptionActiveWordIndex', 'getVisibleCaptionText', 'getWrappedCaptionLines', 'renderCaptionFrame'].map(name => functions.get(name)).join('\n');
  vm.runInNewContext(code + '\nrenderCaptionFrame', context)(ctx, 1920, 1080, .5);
  assert.deepEqual(scales, [[.5, .5]]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2], 1920);
  assert.equal(calls[0][3], 1944);
  assert.equal(calls[0][10], 50);
});
test('export wrapping uses the same gap and height controls without stretching glyphs', () => {
  const measureCtx = { measureText: text => ({ width: text.length * 30 }) };
  const ass = harness({ widthSlider: { value: 10 }, gapSlider: { value: 160 }, heightSlider: { value: 125 },
    document: { createElement: () => ({ getContext: () => measureCtx }) } }).buildPreviewMatchedAss();
  const output = lines(ass);
  assert.match(output[0], /pos\(960,922\)/);
  assert.match(output[1], /pos\(960,1022\)/);
  assert.match(ass, /,100,100,0,0,1,3\.75,0,5,/);
});
test('overlapping captions cannot double up in the exported video', () => {
  const ass = harness({ generatedCaptions: [
    { text: 'First', timestamp: [0, 3] }, { text: 'Second', timestamp: [1, 2] },
  ] }).buildPreviewMatchedAss();
  assert.match(lines(ass)[0], /0:00:00\.00,0:00:01\.00/);
});
test('both native exports await the offline font before building ASS', () => {
  assert.match(functions.get('exportActiveCaptionVideoForQueue'), /await ensureCaptionFontReady\(\);\s*const result = await window\.electronAPI\.burnCaptions/);
  assert.match(script, /await ensureCaptionFontReady\(\);\s*nativeExportObserved/);
  const main = fs.readFileSync(path.join(root, 'main.cjs'), 'utf8');
  assert.match(main, /path\.join\(ROOT, 'public', 'caption-fonts'\)/);
  for (const name of ['Nunito-Regular.ttf', 'Nunito-Black.ttf', 'OFL.txt']) {
    assert.ok(fs.statSync(path.join(root, 'public', 'caption-fonts', name)).size > 1000);
  }
});

test('real canvas and FFmpeg captions match size, placement and highlight', {
  skip: !process.env.CAPTION_RENDER_CHECK,
}, async () => {
  const puppeteer = require('puppeteer');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'caption-parity-'));
  const executablePath = [process.env.CAPTION_TEST_BROWSER, puppeteer.executablePath(),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(file => file && fs.existsSync(file));
  const browser = await puppeteer.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage();
    const fonts = ['Regular', 'Black'].map(name => fs.readFileSync(path.join(root, 'public', 'caption-fonts', `Nunito-${name}.ttf`)).toString('base64'));
    const fixture = await page.evaluate(async ({ production, fonts }) => {
      for (const [index, data] of fonts.entries()) {
        const face = new FontFace('Pattan Caption Nunito', `url(data:font/ttf;base64,${data})`, { weight: index ? '900' : '400' });
        document.fonts.add(await face.load());
      }
      const CAPTION_WORD_LIMIT = 8, CAPTION_BOTTOM_OFFSET_PX = 80, SHORT_CAPTION_GAP_SECONDS = .75;
      const sourceVideo = { videoWidth: 1920, videoHeight: 1080, duration: 2 }, renderCanvas = {};
      const sizeSlider = { value: 50 }, styleSelect = { value: 'white-yellow' }, colorPicker = { value: '#fde047' },
        strokeSlider = { value: 0 }, gapSlider = { value: 120 }, widthSlider = { value: 85 },
        fontSelect = { value: 'Nunito, sans-serif' }, boldCheck = { checked: true }, heightSlider = { value: 100 },
        karaokeCheck = { checked: true }, emojiCheck = { checked: false }, progressCheck = { checked: false };
      const captionPosX = .5, captionPosY = .5, getCaptionSyncOffsetSeconds = () => 0;
      const generatedCaptions = [{ text: 'A dove, who was sitting on the branch', timestamp: [0, 2] }];
      const api = eval(production + '\n({ buildPreviewMatchedAss, drawWrappedText, getCaptionFontFamily })');
      const canvas = document.createElement('canvas'); canvas.width = 1920; canvas.height = 1080;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#477788'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.font = `900 50px ${api.getCaptionFontFamily()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      api.drawWrappedText(ctx, generatedCaptions[0].text, 960, 540, 1920 * .85, 60, 0, 'white-yellow', 0, null, 50, null, true);
      return { ass: api.buildPreviewMatchedAss(), preview: canvas.toDataURL('image/png') };
    }, { production, fonts });
    const assPath = path.join(temp, 'fixture.ass'), framePath = path.join(temp, 'export.png');
    fs.writeFileSync(assPath, fixture.ass);
    const escaped = value => value.replace(/\\/g, '/').replace(/:/g, '\\:');
    const ffmpeg = execFileSync('where.exe', ['ffmpeg'], { encoding: 'utf8' }).trim().split(/\r?\n/)[0];
    execFileSync(ffmpeg, ['-v', 'info', '-f', 'lavfi', '-i', 'color=c=0x477788:s=1920x1080:r=25:d=1',
      '-vf', `subtitles='${escaped(assPath)}':fontsdir='${escaped(path.join(root, 'public', 'caption-fonts'))}'`,
      '-frames:v', '1', '-y', framePath], { timeout: 30000, stdio: 'pipe' });
    const exported = 'data:image/png;base64,' + fs.readFileSync(framePath).toString('base64');
    const bounds = await page.evaluate(async sources => {
      const results = [];
      for (const src of sources) {
        const bitmap = await createImageBitmap(await (await fetch(src)).blob());
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d'); ctx.drawImage(bitmap, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const boxes = { text: { left: Infinity, top: Infinity, right: 0, bottom: 0 }, yellow: { left: Infinity, top: Infinity, right: 0, bottom: 0 } };
        for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (data[i] < 200 || data[i + 1] < 180) continue;
          for (const key of data[i + 2] < 150 ? ['text', 'yellow'] : ['text']) {
            const b = boxes[key]; b.left = Math.min(b.left, x); b.top = Math.min(b.top, y);
            b.right = Math.max(b.right, x); b.bottom = Math.max(b.bottom, y);
          }
        }
        results.push(boxes);
      }
      return results;
    }, [fixture.preview, exported]);
    console.log('Canvas/FFmpeg bounds:', JSON.stringify(bounds));
    for (const kind of ['text', 'yellow']) for (const edge of ['left', 'top', 'right', 'bottom']) {
      assert.ok(Number.isFinite(bounds[0][kind][edge]) && Number.isFinite(bounds[1][kind][edge]));
      assert.ok(Math.abs(bounds[0][kind][edge] - bounds[1][kind][edge]) <= 4,
        `${kind} ${edge}: canvas=${bounds[0][kind][edge]}, FFmpeg=${bounds[1][kind][edge]}`);
    }
    fs.writeFileSync(path.join(root, 'temp', 'caption-parity-preview.png'), Buffer.from(fixture.preview.split(',')[1], 'base64'));
    fs.copyFileSync(framePath, path.join(root, 'temp', 'caption-parity-export.png'));
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
