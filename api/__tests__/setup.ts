// api/__tests__/setup.ts
//
// Vitest global setup. The gamification integration tests run only when
// TEST_DATABASE_URL is set, and must NEVER touch the dev/prod database.
//
// api/db.ts builds its pool from DATABASE_URL at import time. Point that
// at the test database HERE — setup files run before any test file's
// imports, so api/db.ts then connects to the test DB. With no
// TEST_DATABASE_URL the integration suites skip themselves.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}
