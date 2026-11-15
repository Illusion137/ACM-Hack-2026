import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'

// for serving avatars and course images in local env
const static_dirs: Record<string, string> = {
  '/avatars': path.resolve(__dirname, 'server/uploads'),
  '/course-images': path.resolve(__dirname, 'server/assets'),
}
const avatars: Plugin = {
  name: 'avatars',
  configureServer(server) {
    for (const [prefix, dir] of Object.entries(static_dirs)) {
      server.middlewares.use(prefix, (req, res, next) => {
        const file = path.join(dir, path.basename(decodeURIComponent(req.url ?? '')))
        if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile()) return next()
        fs.createReadStream(file).on('error', next).pipe(res)
      })
    }
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), avatars],
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})
