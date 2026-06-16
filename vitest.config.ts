import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import os from 'os'
import path from 'path'

// Backend-first test setup. The coin and gamification tests run against
// Node + Postgres, so `node` is the default environment. A frontend
// component test can opt into jsdom per-file with `// @vitest-environment`.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts', 'src/**/*.test.ts', 'db/**/*.test.ts'],
    setupFiles: ['./api/__tests__/setup.ts'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    // Node 25+ has a built-in localStorage accessed via --localstorage-file.
    // Without a valid path the global localStorage object has no methods,
    // breaking zustand persist in jsdom test workers.
    execArgv: [
      `--localstorage-file=${path.join(os.tmpdir(), 'vitest-localStorage.json')}`,
    ],
  },
})
