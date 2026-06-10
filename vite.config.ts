import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      // Dev proxy to the local API (api/server.ts on 3001) per CLAUDE.md.
      // Note: src/lib/api.ts uses an absolute baseURL, so this proxy only
      // matters for relative /api/... calls — but it must never point at
      // production.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    allowedHosts: ['qupu.id']
  },
})
