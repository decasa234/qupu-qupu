import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Backend-first test setup. The coin and gamification tests run against
// Node + Postgres, so `node` is the default environment. A frontend
// component test can opt into jsdom per-file with `// @vitest-environment`.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts', 'src/**/*.test.ts'],
  },
})
