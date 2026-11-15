import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'

// for serving avatars in local env
const uploads_dir = path.resolve(__dirname, 'server/uploads')
const avatars: Plugin = {
  name: 'avatars',
  configureServer(server) {
    server.middlewares.use('/avatars', (req, res, next) => {
      const file = path.join(uploads_dir, path.basename(decodeURIComponent(req.url ?? '')))
      if (!fs.existsSync(file)) return next()
      fs.createReadStream(file).pipe(res)
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), avatars],
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})
