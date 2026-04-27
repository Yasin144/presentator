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
  plugins: [
    react(),
    {
      name: 'serve-root-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
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
