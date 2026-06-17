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
        // target is the API origin; the '/api' prefix is part of the request
        // path, so it must NOT be repeated here (else paths double to /api/api).
        target: 'https://api.qupu.id',
        changeOrigin: true,
        // Frontend code imports browser-safe shared modules from api/ (e.g.
        // api/services/wmi/olympiads/registry.ts). In dev Vite serves those
        // modules over HTTP under /api/..., where this proxy would otherwise
        // swallow them and 404 against the real API — hanging the whole app.
        // Let Vite serve source-module requests locally instead of proxying.
        bypass(req) {
          if (req.url && /\.(?:tsx?|jsx?|mjs|cjs)(?:\?|$)/.test(req.url)) {
            return req.url
          }
        },
      },
    },
    // Also covers `vite preview` (preview.allowedHosts defaults to this).
    // qupu.id = production; qupu.klair.id = the admin-only deploy's tunnel.
    allowedHosts: ['qupu.id', 'qupu.klair.id']
  },
})
