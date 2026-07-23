'use strict';

const os = require('os');
const { spawn, execSync } = require('child_process');

try {
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM cloudflared.exe /T', { stdio: 'ignore' });
  }
} catch (_) {}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIp();
const localUrl = `http://${localIp}:5173`;

console.log('\n======================================================');
console.log('📱 PRESENTATOR MOBILE INTEGRATION STARTED');
console.log('======================================================');
console.log(`🏠 Wi-Fi Network URL (At Home): ${localUrl}`);
console.log('🌐 Starting Secure Encrypted Cloudflare Tunnel (For 4G/5G)...');
console.log('------------------------------------------------------\n');

// 1. Start Vite Server on 0.0.0.0
const vite = spawn('npx.cmd', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  stdio: 'inherit',
  shell: true,
});

// 2. Start Cloudflare Tunnel
const tunnel = spawn('npx.cmd', ['-y', 'cloudflared', 'tunnel', '--url', 'http://localhost:5173'], {
  shell: true,
});

const fs = require('fs');
const path = require('path');

const saveMobileInfo = (mobileUrl) => {
  const data = {
    wifiUrl: localUrl,
    mobileUrl: mobileUrl,
    updatedAt: new Date().toISOString()
  };
  try {
    const tempDir = path.join(__dirname, '..', 'temp');
    const pubDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'active-mobile-link.json'), JSON.stringify(data, null, 2));
    fs.writeFileSync(path.join(pubDir, 'mobile-link.json'), JSON.stringify(data, null, 2));
  } catch (_) {}
};

tunnel.stderr.on('data', data => {
  const text = data.toString();
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (match) {
    saveMobileInfo(match[0]);
    console.log(`\n🔒 YOUR SECURE ENCRYPTED MOBILE LINK (4G/5G Anywhere):`);
    console.log(`👉 ${match[0]}`);
    console.log(`(Open this link in Chrome/Safari on your phone!)\n`);
  }
});

process.on('SIGINT', () => {
  vite.kill();
  tunnel.kill();
  process.exit();
});
