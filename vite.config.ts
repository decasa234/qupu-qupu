import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // react-joyride (and its react-floater dep) get pre-bundled by Vite's dep
  // optimizer; without forcing a single React instance this surfaces at runtime
  // as "Invalid hook call / dispatcher is null". Dedupe pins one React copy.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.qupu.id/api',
        changeOrigin: true,
      },
    },
    allowedHosts: ['qupu.id']
  },
})
