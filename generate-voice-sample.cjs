/**
 * Voice sample generator — uses very short sentences for reliability
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Short sentences under 80 chars each — Chatterbox handles these reliably
const SENTENCES = [
  "Hello. This is the voice used in this application.",
  "I will teach all your lessons.",
  "This is the same voice for every export, video, and narration.",
  "Thank you."
];

function postJsonForBuffer(port, urlPath, payload, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(payload), 'utf8');
    const req = http.request(
      { hostname: '127.0.0.1', port, path: urlPath, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }, agent: false },
      (res) => {
        const chunks = [];
        res.on('data', d => chunks.push(d));
        res.on('end', () => resolve({ statusCode: res.statusCode, buffer: Buffer.concat(chunks) }));
      }
    );
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('timeout after ' + timeoutMs/1000 + 's')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const outFile = path.join(os.homedir(), 'Downloads', 'voice-sample-paragraph.wav');
  const tmpDir  = os.tmpdir();
  const wavFiles = [];

  console.log('Generating voice sample — sc3 voice (same as paragraph.mp4)...');

  for (let i = 0; i < SENTENCES.length; i++) {
    const s = SENTENCES[i];
    process.stdout.write(`  [${i+1}/${SENTENCES.length}] "${s}" ... `);
    try {
      const raw = await postJsonForBuffer(8426, '/api/narrate', { text: s }, 90000);
      if (!raw || raw.statusCode !== 200) { console.log('FAILED (status ' + (raw?.statusCode) + ')'); continue; }
      const wavPath = path.join(tmpDir, `vs-${i}-${Date.now()}.wav`);
      fs.writeFileSync(wavPath, raw.buffer);
      wavFiles.push(wavPath);
      console.log('OK (' + Math.round(raw.buffer.length/1024) + ' KB)');
    } catch(e) {
      console.log('ERROR: ' + e.message);
    }
  }

  if (!wavFiles.length) { console.error('No audio generated.'); process.exit(1); }

  // Concatenate WAVs
  if (wavFiles.length === 1) {
    fs.copyFileSync(wavFiles[0], outFile);
  } else {
    const bufs = wavFiles.map((f, i) => {
      const b = fs.readFileSync(f);
      return i === 0 ? b : b.slice(44);
    });
    const combined = Buffer.concat(bufs);
    combined.writeUInt32LE(combined.length - 8, 4);
    combined.writeUInt32LE(combined.length - 44, 40);
    fs.writeFileSync(outFile, combined);
  }

  const sizeKb = Math.round(fs.statSync(outFile).size / 1024);
  console.log('\n✅ Sample saved to Downloads:');
  console.log('   ' + outFile);
  console.log('   Size: ' + sizeKb + ' KB');
  console.log('   Voice: sc3 (same as paragraph.mp4 — same teacher)');

  wavFiles.forEach(f => { try { fs.unlinkSync(f); } catch(_) {} });
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
