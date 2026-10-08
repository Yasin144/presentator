'use strict';
// Isolated headless UI QA: the real InputPanel, React editor and legacy caption
// controller, with a small local video and mocked transcription/cancellation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
let fixture;
let fixtureDirectory;
const passed = [];
let server;
let browser;

async function main() {
  const browserPath = [puppeteer.executablePath(),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(candidate => fs.existsSync(candidate));
  if (!browserPath) { console.log(JSON.stringify({ skipped: true, reason: 'No installed Chromium browser is available.' })); return; }
  const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8', windowsHide: true });
  if (ffmpegCheck.error || ffmpegCheck.status !== 0) { console.log(JSON.stringify({ skipped: true, reason: 'FFmpeg is unavailable on PATH.' })); return; }
  fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'caption-local-qa-'));
  fixture = path.join(fixtureDirectory, 'caption-advanced-qa.mp4');
  const generated = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i',
    'color=c=0x123456:s=320x180:r=15', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono',
    '-t', '5', '-c:v', 'libx264', '-preset', 'ultrafast', '-threads', '1', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-movflags', '+faststart', '-y', fixture], { encoding: 'utf8', windowsHide: true });
  if (generated.error || generated.status !== 0) throw new Error(`Could not generate the synthetic QA video: ${generated.error?.message || generated.stderr}`);
  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  const entryId = '\0caption-local-qa-entry';
  const inputPath = path.join(root, 'src/components/InputPanel.jsx').replace(/\\/g, '/');
  const bundle = await build({
    configFile: false, root, logLevel: 'error',
    plugins: [react(), {
      name: 'caption-local-qa-entry',
      resolveId(id) { if (id === 'caption-local-qa-entry') return entryId; },
      load(id) {
        if (id === entryId) return `import React from 'react'; import {createRoot} from 'react-dom/client'; import InputPanel from ${JSON.stringify(inputPath)}; createRoot(document.getElementById('root')).render(React.createElement(InputPanel));`;
      },
    }],
    build: { write: false, minify: false, cssCodeSplit: false, rolldownOptions: {
      input: 'caption-local-qa-entry', output: { format: 'iife', name: 'CaptionLocalQA' },
    } },
  });
  const output = (Array.isArray(bundle) ? bundle[0] : bundle).output;
  const js = output.find(item => item.type === 'chunk').code;
  const css = output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => item.source).join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{background:#020617;color:#e2e8f0;font:14px sans-serif;margin:20px}#inputPanel{max-width:1000px;margin:auto}#inputPanel>:not(#aiCaptionSection){display:none}.hidden{display:none!important}input,button,select,textarea{font:inherit}details>summary{cursor:pointer}canvas{max-height:240px;object-fit:contain}${css}</style></head><body><div id="root"></div><script src="/qa-entry.js"></script></body></html>`;
  server = http.createServer((request, response) => {
    const route = new URL(request.url, 'http://127.0.0.1').pathname;
    let content;
    let type;
    if (route === '/') { content = html; type = 'text/html'; }
    else if (route === '/qa-entry.js') { content = js; type = 'application/javascript'; }
    else if (route === '/caption-script.js') {
      // Expose the real ASS builder only inside this isolated QA page. Calling
      // it inspects export text sizing without starting an export or notifying.
      content = fs.readFileSync(path.join(root, 'caption-script.js'), 'utf8').replace(
        'window.captionLocalWorkbenchAPI = localWorkbenchBridge;',
        'window.captionLocalWorkbenchAPI = localWorkbenchBridge; window.__qaBuildPreviewAss = () => buildPreviewMatchedAss([]);');
      type = 'application/javascript';
    }
    else if (/^\/caption-fonts\/Nunito-(Regular|Black)\.ttf$/.test(route)) {
      const fontPath = path.join(root, 'public', route.slice(1));
      if (fs.existsSync(fontPath)) { content = fs.readFileSync(fontPath); type = 'font/ttf'; }
    }
    if (content === undefined) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'Content-Type': type }); response.end(content);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.dismiss());
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.startsWith(origin + '/') || url.startsWith('blob:') || url.startsWith('data:')) request.continue();
    else request.abort();
  });
  await page.evaluateOnNewDocument(fixturePath => {
    window.__qaNotifications = 0;
    window.__qaASRCalls = 0;
    window.electronAPI = {
      getPathForFile: () => fixturePath,
      onTranscribeProgress() {},
      transcribeVideo: () => {
        window.__qaASRCalls += 1;
        return new Promise(resolve => { window.__qaResolveTranscription = resolve; });
      },
      cancelTranscribeVideo: async () => {
        window.__qaResolveTranscription?.({ ok: false, cancelled: true });
        return { ok: true };
      },
      showNotification() { window.__qaNotifications += 1; },
      reportWhatsAppJob() { window.__qaNotifications += 1; },
    };
    if (window.speechSynthesis) window.speechSynthesis.speak = () => {};
  }, fixture);
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#captionVideoInput');
  await page.addScriptTag({ url: origin + '/caption-script.js' });
  await page.waitForFunction(() => !!window.captionLocalWorkbenchAPI);
  const videoInput = await page.$('#captionVideoInput');
  await videoInput.uploadFile(fixture);
  await page.waitForFunction(() => {
    const state = window.captionLocalWorkbenchAPI?.getState();
    return state?.hasVideo && state.duration > 4;
  });
  await page.waitForSelector('.local-caption-workbench .cw-panel');
  assert.equal(await page.$eval('.cw-badge', element => element.textContent), 'No captions yet');
  passed.push('Advanced tools available before transcription');

  await page.evaluate(() => {
    document.querySelector('.cw-panel').open = true;
    document.querySelectorAll('.cw-section').forEach(element => { element.open = true; });
  });
  const clickText = async text => {
    const found = await page.evaluate(label => {
      const button = [...document.querySelectorAll('.local-caption-workbench button')].find(element => element.textContent.trim() === label);
      if (!button) return 'missing';
      if (button.disabled) return 'disabled';
      button.click(); return 'clicked';
    }, text);
    assert.equal(found, 'clicked', `${text} must be clickable`);
  };
  const state = () => page.evaluate(() => window.captionLocalWorkbenchAPI.getState());
  const setText = async (selector, text) => {
    await page.$eval(selector, (element, value) => {
      const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, text);
  };

  // Import through the real file input, preserving Unicode and multiple lines.
  const srt = '1\n00:00:00,500 --> 00:00:02,000\nJingle bells\nజింగిల్\n\n2\n00:00:02,000 --> 00:00:04,500\nJingle bells again\n';
  await page.$eval('[aria-label="Import subtitle file"]', (input, text) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([text], 'qa-lyrics.srt', { type: 'text/plain' }));
    input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  }, srt);
  await page.waitForFunction(() => [...document.querySelectorAll('.local-caption-workbench button')].some(button => button.textContent === 'Apply import'));
  await clickText('Apply import');
  await page.waitForFunction(() => window.captionLocalWorkbenchAPI.getState().captions.length === 2);
  const imported = await state();
  assert.equal(imported.captions[0].text, 'Jingle bells\nజింగిల్');
  assert.equal(imported.timingSource, 'estimated');
  assert.equal(await page.$eval('#captionList .chunk-editor', element => element.value), 'Jingle bells\nజింగిల్');
  assert.ok(await page.$eval('#captionQueueList', element => element.textContent.includes('transcribed')));
  passed.push('SRT import updates the legacy editor and queue, preserving multiline Unicode');

  // Notice-only events must not erase history or timing metadata.
  await page.evaluate(() => {
    window.captionLocalWorkbenchAPI.notice('QA notice');
    window.captionLocalWorkbenchAPI.publish();
  });
  await clickText('Undo');
  await page.waitForFunction(() => window.captionLocalWorkbenchAPI.getState().captions.length === 0);
  assert.equal((await state()).timingSource, undefined);
  await clickText('Redo');
  await page.waitForFunction(() => window.captionLocalWorkbenchAPI.getState().captions.length === 2);
  assert.equal((await state()).timingSource, 'estimated');
  assert.deepEqual((await state()).warnings, imported.warnings);
  passed.push('Undo/redo restore captions and timing metadata after a notice event');

  const stale = await page.evaluate(() => {
    const api = window.captionLocalWorkbenchAPI;
    try { api.applyCaptions('previous-video', api.getState().captions); return ''; }
    catch (error) { return error.message; }
  });
  assert.match(stale, /selected video changed/);
  await setText('[aria-label="Shift all captions seconds"]', '0.1');
  await page.evaluate(() => {
    window.__qaOriginalApply = window.captionLocalWorkbenchAPI.applyCaptions;
    window.captionLocalWorkbenchAPI.applyCaptions = () => { throw new Error('QA rejected stale caption edit'); };
  });
  await clickText('Apply shift');
  await page.waitForFunction(() => document.querySelector('.cw-notice')?.textContent.includes('QA rejected stale caption edit'));
  assert.deepEqual((await state()).captions, imported.captions);
  await page.evaluate(() => { window.captionLocalWorkbenchAPI.applyCaptions = window.__qaOriginalApply; });
  await clickText('Undo');
  await page.waitForFunction(() => window.captionLocalWorkbenchAPI.getState().captions.length === 0);
  await clickText('Redo');
  await page.waitForFunction(() => window.captionLocalWorkbenchAPI.getState().captions.length === 2);
  passed.push('Stale-target rejection leaves captions and undo/redo history intact');

  const lyrics = 'Jingle bells jingle bells\nJingle bells jingle bells';
  await setText('[aria-label="Exact song lyrics"]', lyrics);
  await clickText('Preview lyric fit');
  await page.waitForSelector('[aria-label="Lyric timing review warnings"]');
  assert.ok(await page.$eval('[aria-label="Lyric timing review warnings"]', element => /Repeated lyrics|estimated|estimates/.test(element.textContent)));
  assert.deepEqual((await state()).captions, imported.captions, 'Preview must not alter captions');
  await clickText('Apply exact lyrics');
  await page.waitForFunction(() => window.captionLocalWorkbenchAPI.getState().captions.reduce((count, cue) => count + (cue.words?.length || 0), 0) === 8);
  const fitted = await state();
  assert.equal(fitted.captions.map(cue => cue.text).join(' '), lyrics.replace(/\n/g, ' '));
  assert.equal(fitted.timingSource, 'estimated');
  for (const cue of fitted.captions) {
    let previousEnd = cue.start;
    for (const word of cue.words) {
      assert.ok(word.start >= previousEnd && word.end > word.start && word.end <= cue.end);
      previousEnd = word.end;
    }
  }
  passed.push('Exact lyrics preserve repeated chorus and apply valid, disclosed estimated word timing');

  await page.select('[aria-label="Local caption review speed"]', '0.5');
  await page.waitForFunction(() => document.getElementById('captionSourceVideo').playbackRate === .5);
  assert.equal((await state()).previewSpeed, .5);
  await page.$eval('#captionSyncSlider', slider => { slider.value = '200'; slider.dispatchEvent(new Event('input', { bubbles: true })); });
  await clickText('Go to caption');
  await page.waitForFunction(() => document.getElementById('captionSourceVideo').currentTime > .65);
  const seek = await page.evaluate(() => ({ currentTime: document.getElementById('captionSourceVideo').currentTime, start: window.captionLocalWorkbenchAPI.getState().captions[0].start }));
  assert.ok(Math.abs(seek.currentTime - seek.start - .2) < .05);
  await clickText('Loop current caption');
  await page.waitForFunction(() => window.captionLocalWorkbenchAPI.getState().looping);
  await page.evaluate(() => {
    const video = document.getElementById('captionSourceVideo');
    video.currentTime = window.captionLocalWorkbenchAPI.getState().captions[0].end + .2;
    video.dispatchEvent(new Event('timeupdate'));
  });
  await page.waitForFunction(() => document.getElementById('captionSourceVideo').currentTime < window.captionLocalWorkbenchAPI.getState().captions[0].start + .4);
  await clickText('Stop caption loop');
  assert.equal((await state()).looping, false);
  passed.push('Review speed, cue looping and seeking honor the sync offset');

  // Measure actual Canvas text and the actual ASS builder, without decoding a
  // costly 4K clip. The real metadata/reload path reads these video dimensions.
  await page.evaluate(() => {
    window.__qaTextDraws = [];
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
      if (this.canvas.id === 'captionRenderCanvas' && /Font|check/.test(String(text))) {
        const transform = this.getTransform();
        const fontPixels = Number(this.font.match(/([\d.]+)px/)?.[1]);
        window.__qaTextDraws.push({ text, fontPixels, effectivePixels: fontPixels * Math.hypot(transform.c, transform.d) });
      }
      return originalFillText.call(this, text, ...args);
    };
    document.getElementById('captionSyncSlider').value = '0';
    document.getElementById('captionSizeSlider').value = '50';
  });
  for (const dimensions of [{ width: 3840, height: 2160 }, { width: 2160, height: 3840 }]) {
    const reload = await page.evaluate(size => {
      const video = document.getElementById('captionSourceVideo');
      Object.defineProperty(video, 'videoWidth', { configurable: true, get: () => size.width });
      Object.defineProperty(video, 'videoHeight', { configurable: true, get: () => size.height });
      const reloadButton = document.querySelector('#captionQueueList button');
      reloadButton.click();
      return { disabled: reloadButton.disabled, busy: window.captionLocalWorkbenchAPI.getState().disabled };
    }, dimensions);
    assert.equal(reload.disabled, false, `Queue reload must unlock after cancellation (busy=${reload.busy})`);
    await page.waitForFunction(size => {
      const video = document.getElementById('captionSourceVideo');
      const canvas = document.getElementById('captionRenderCanvas');
      return video.readyState >= 2 && canvas.width === size.width / 2 && canvas.height === size.height / 2;
    }, {}, dimensions);
    const measurement = await page.evaluate(() => {
      const api = window.captionLocalWorkbenchAPI;
      const current = api.getState();
      api.applyCaptions(current.itemId, [{ start: .5, end: 4.5, text: 'Font check', words: [
        { text: 'Font', start: .5, end: 1.2 }, { text: 'check', start: 1.2, end: 4.5 },
      ] }], { timingSource: 'word', warnings: [] });
      window.__qaTextDraws = [];
      api.seek(current.itemId, .8);
      return { draws: window.__qaTextDraws, slider: document.getElementById('captionSizeSlider').value, ass: window.__qaBuildPreviewAss() };
    });
    assert.equal(measurement.slider, '50', '4K video loading must preserve the selected size');
    assert.ok(measurement.draws.length, 'The real preview must render the known caption');
    for (const draw of measurement.draws) {
      assert.equal(draw.fontPixels, 100, '4K source text must scale to 100px');
      assert.equal(draw.effectivePixels, 50, 'Capped preview must retain the original 50px appearance');
    }
    assert.ok(measurement.ass.includes(`PlayResX: ${dimensions.width}`));
    assert.ok(measurement.ass.includes(`PlayResY: ${dimensions.height}`));
    const assSize = Number(measurement.ass.match(/^Style: Preview,[^,]+,([\d.]+)/m)?.[1]);
    assert.ok(Math.abs(assSize - 137.7) < .001, 'ASS must carry 100px source size with Nunito metric correction');
  }
  assert.equal(await page.evaluate(() => window.__qaNotifications), 0);
  passed.push('4K landscape and portrait preserve 50px preview appearance, 100px source captions and the selected slider in Canvas/ASS');
  // Real transcription busy guards, with a deferred mock instead of a native worker.
  await page.select('#captionContentMode', 'song');
  await page.evaluate(() => {
    const action = document.getElementById('captionActionBtn');
    action.classList.remove('hidden'); action.click();
  });
  await page.waitForFunction(() => window.__qaASRCalls === 1 && window.captionLocalWorkbenchAPI.getState().disabled);
  assert.ok(await page.$eval('[aria-label="Import subtitle file"]', element => element.disabled));
  assert.ok(await page.$eval('[aria-label="Local caption review speed"]', element => element.disabled));
  assert.ok(await page.$eval('#captionList', element => [...element.querySelectorAll('input,button,textarea')].every(control => control.disabled)));
  const rejection = await page.evaluate(() => {
    const api = window.captionLocalWorkbenchAPI;
    const snapshot = api.getState();
    try { api.applyCaptions(snapshot.itemId, snapshot.captions); return ''; }
    catch (error) { return error.message; }
  });
  assert.match(rejection, /Wait for caption/);
  await page.evaluate(() => document.getElementById('captionCancelBtn').click());
  await page.waitForFunction(() => !window.captionLocalWorkbenchAPI.getState().disabled);
  assert.equal(await page.$eval('#captionQueueList button', element => element.disabled), false, 'Queue reload must unlock after cancellation');
  const priorVideoUrl = await page.$eval('#captionSourceVideo', element => element.src);
  await page.$eval('#captionQueueList button', element => element.click());
  await page.waitForFunction(previous => {
    const video = document.getElementById('captionSourceVideo');
    return video.src !== previous && video.readyState >= 2;
  }, {}, priorVideoUrl);
  assert.equal((await state()).captions[0].text, 'Font check', 'Reload must retain the edited queue captions');
  assert.equal(await page.evaluate(() => window.__qaNotifications), 0);
  passed.push('Busy controls reject edits; cancellation unlocks queue reload, retains edits and sends no notifications');

  assert.deepEqual(errors, [], 'No page-level JavaScript errors');
  console.log(JSON.stringify({ passed: passed.length, checks: passed }, null, 2));
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; })
  .finally(async () => {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    if (fixtureDirectory) {
      const absolute = path.resolve(fixtureDirectory);
      const temporaryRoot = path.resolve(os.tmpdir()) + path.sep;
      if (!absolute.startsWith(temporaryRoot) || !path.basename(absolute).startsWith('caption-local-qa-')) {
        throw new Error('Refusing to remove a QA fixture directory outside the temporary workspace.');
      }
      fs.rmSync(absolute, { recursive: true, force: true });
    }
  });
