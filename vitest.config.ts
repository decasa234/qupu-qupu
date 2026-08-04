import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Backend-first test setup. The coin and gamification tests run against
// Node + Postgres, so `node` is the default environment. A frontend
// component test can opt into jsdom per-file with `// @vitest-environment`.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    // The concept suites prove their generators exhaustively — brute-forcing
    // every Latin-square completion, every polyomino placement, every digit
    // assignment. That is the point of them, and several legitimately run past
    // vitest's 5s default once the whole suite is loaded at once. Raised here
    // rather than sprinkling per-test timeouts across a dozen files.
    testTimeout: 30_000,
    include: ['api/**/*.test.ts', 'src/**/*.test.ts', 'db/**/*.test.ts'],
    setupFiles: ['./api/__tests__/setup.ts'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    // Node 25+ ships a built-in Web Storage that shadows jsdom's localStorage
    // with a method-less object (breaking zustand persist in jsdom tests).
    // --no-webstorage disables it so jsdom's own implementation takes over —
    // hermetic per worker, no shared file. Harmless for node-env workers.
    execArgv: ['--no-webstorage'],
  },
})
