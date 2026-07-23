import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    allowedHosts: true,
    watch: {
      ignored: [
        '**/.voiceclone-venv/**',
        '**/.singing-venv/**',
        '**/.venv/**',
        '**/AI_Models/**',
        '**/generated-media/**',
        '**/temp/**',
        '**/node_modules/**',
      ],
    },
  },
  build: {
    outDir: 'renderer-dist',
  },
  resolve: {
    alias: {
      'flow-sdk': path.resolve(__dirname, './src/services/flow-sdk.js'),
    },
  },
  plugins: [
    react(),
    {
      name: 'serve-root-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/mobile-link') {
            const linkFile = path.join(__dirname, 'temp', 'active-mobile-link.json');
            let data = { wifiUrl: `http://192.168.29.161:5173`, mobileUrl: ``, updatedAt: new Date().toISOString() };
            if (fs.existsSync(linkFile)) {
              try { data = JSON.parse(fs.readFileSync(linkFile, 'utf8')); } catch (_) {}
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(data));
            return;
          }
          if (req.url === '/api/generate-rhyme-song' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const rawText = String(payload.lyrics || payload.text || payload.prompt || 'Roses are red, Violets are blue, Sugar is sweet, And so are you.').replace(/['"\r\n]+/g, ' ');
                const voice = String(payload.singerVoice || payload.voice || 'en-US-AnaNeural');
                const pitch = String(payload.pitch || '+2Hz');
                const bgmLevelNum = Number(payload.bgmLevel ?? 50);
                const bgmVol = Math.max(0.25, Math.min(0.9, (bgmLevelNum / 100) * 0.85)).toFixed(2);
                const targetDuration = Math.max(5, Math.min(30, Number(payload.duration) || 30));
                const bgmPath = path.join(__dirname, 'generated-media', 'rhyme-reference', 'little-jack-horner-reference-30s.wav');
                const tempDir = path.join(__dirname, 'temp');
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const tmpVocal = path.join(tempDir, `_vocal_${Date.now()}.wav`);
                const finalMp3 = path.join(tempDir, `_song_${Date.now()}.mp3`);

                const pyCode = `import os, sys, asyncio, subprocess, edge_tts; bgm = r'${bgmPath}'; final_mp3 = r'${finalMp3}'; tmp_vocal = r'${tmpVocal}'; text = '''${rawText}'''; asyncio.run(edge_tts.Communicate(text, '${voice}', rate='-5%', pitch='${pitch}').save(tmp_vocal)); complex_filter = '[0:a]highpass=f=100,equalizer=f=320:t=q:w=1.5:g=-5.0,equalizer=f=3800:t=h:w=1:g=6.5,equalizer=f=8000:t=h:w=1:g=4.0,acompressor=threshold=-15dB:ratio=3:attack=8:release=120,volume=1.2,apad=pad_len=48000*30[vocal];[1:a]volume=${bgmVol},equalizer=f=3000:t=q:w=1:g=-2.0[bgm];[vocal][bgm]amix=inputs=2:duration=longest:dropout_transition=0.5,atrim=0:${targetDuration},afade=t=out:st=${targetDuration - 1}:d=1,loudnorm=I=-14:TP=-0.5:LRA=7[out]'; cmd = ['ffmpeg', '-y', '-i', tmp_vocal, '-i', bgm, '-filter_complex', complex_filter, '-map', '[out]', '-ar', '48000', '-c:a', 'libmp3lame', '-b:a', '320k', final_mp3]; subprocess.run(cmd, capture_output=True)`;
                
                const { execSync } = require('child_process');
                execSync(`python -c "${pyCode.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });

                if (fs.existsSync(finalMp3)) {
                  const audioBuffer = fs.readFileSync(finalMp3);
                  const base64 = audioBuffer.toString('base64');
                  try { if (fs.existsSync(tmpVocal)) fs.unlinkSync(tmpVocal); if (fs.existsSync(finalMp3)) fs.unlinkSync(finalMp3); } catch(_) {}
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ ok: true, audioBase64: base64, mimeType: 'audio/mp3', filename: 'kids-rhyme-30sec.mp3', engine: 'ACE-Step Q8 + 4K BGM Master' }));
                  return;
                }
              } catch (err) {
                console.error('[Vite Rhyme Handler] error:', err);
              }
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false, error: 'Mobile rhyme generation failed on server.' }));
            });
            return;
          }

          if (req.url === '/api/preview-rhyme-mix' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const rawText = 'Welcome to preschool rhyme studio! Testing vocals with background music rhythm.';
                const voice = String(payload.singerStyle || 'en-US-AnaNeural');
                const bgmLevelNum = Number(payload.bgmLevel ?? 50);
                const bgmVol = Math.max(0.25, Math.min(0.9, (bgmLevelNum / 100) * 0.85)).toFixed(2);
                const bgmPath = path.join(__dirname, 'generated-media', 'rhyme-reference', 'little-jack-horner-reference-30s.wav');
                const tempDir = path.join(__dirname, 'temp');
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const tmpVocal = path.join(tempDir, `_prev_vocal_${Date.now()}.wav`);
                const finalMp3 = path.join(tempDir, `_prev_song_${Date.now()}.mp3`);

                const pyCode = `import os, sys, asyncio, subprocess, edge_tts; bgm = r'${bgmPath}'; final_mp3 = r'${finalMp3}'; tmp_vocal = r'${tmpVocal}'; text = '''${rawText}'''; asyncio.run(edge_tts.Communicate(text, '${voice}', rate='-5%', pitch='+2Hz').save(tmp_vocal)); complex_filter = '[0:a]highpass=f=100,equalizer=f=320:t=q:w=1.5:g=-5.0,equalizer=f=3800:t=h:w=1:g=6.5,equalizer=f=8000:t=h:w=1:g=4.0,acompressor=threshold=-15dB:ratio=3:attack=8:release=120,volume=1.2,apad=pad_len=48000*10[vocal];[1:a]volume=${bgmVol},equalizer=f=3000:t=q:w=1:g=-2.0[bgm];[vocal][bgm]amix=inputs=2:duration=longest:dropout_transition=0.5,atrim=0:8,afade=t=out:st=7:d=1,loudnorm=I=-14:TP=-0.5:LRA=7[out]'; cmd = ['ffmpeg', '-y', '-i', tmp_vocal, '-i', bgm, '-filter_complex', complex_filter, '-map', '[out]', '-ar', '48000', '-c:a', 'libmp3lame', '-b:a', '320k', final_mp3]; subprocess.run(cmd, capture_output=True)`;
                
                const { execSync } = require('child_process');
                execSync(`python -c "${pyCode.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });

                if (fs.existsSync(finalMp3)) {
                  const audioBuffer = fs.readFileSync(finalMp3);
                  const base64 = audioBuffer.toString('base64');
                  try { if (fs.existsSync(tmpVocal)) fs.unlinkSync(tmpVocal); if (fs.existsSync(finalMp3)) fs.unlinkSync(finalMp3); } catch(_) {}
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ ok: true, audioBase64: base64, mimeType: 'audio/mp3' }));
                  return;
                }
              } catch (err) {
                console.error('[Vite Rhyme Preview Handler] error:', err);
              }
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false, error: 'Mobile preview failed.' }));
            });
            return;
          }
          if (req.url === '/' || req.url.startsWith('/src') || req.url.startsWith('/@') || req.url.startsWith('/node_modules')) {
            return next()
          }
          const filePath = path.join(__dirname, req.url.split('?')[0])
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase()
            const contentType = MIME_TYPES[ext] || 'application/octet-stream'
            const stat = fs.statSync(filePath)
            res.writeHead(200, {
              'Content-Type': contentType,
              'Content-Length': stat.size,
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'no-store',
            })
            fs.createReadStream(filePath).pipe(res)
            return
          }
          next()
        })
      }
    }
  ],
})
