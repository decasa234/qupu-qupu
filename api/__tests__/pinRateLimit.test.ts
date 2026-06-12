// api/__tests__/pinRateLimit.test.ts
//
// POST /api/users/me/pin — the password ("Lupa PIN") branch must be
// rate-limited exactly like the current_pin branch (PIN_VERIFY_LIMIT:
// 10/min, Postgres-backed), otherwise an authenticated session could
// brute-force the account password through this endpoint.
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).

import { describe, test, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import bcrypt from 'bcrypt'
import { signToken } from '../lib/jwt.js'
import { pool, query, queryOne } from '../db.js'
import app from '../app.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

afterAll(async () => {
  if (RUN) await pool.end()
})

describe.skipIf(!RUN)('POST /users/me/pin password branch rate limit', () => {
  let userId: string
  let token: string

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const email = `pin-rl-${tag}@example.com`
    // Low bcrypt cost: test-only hashes, keeps 10 compares fast.
    const [passwordHash, pinHash] = await Promise.all([
      bcrypt.hash('correct-horse', 4),
      bcrypt.hash('1234', 4),
    ])
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role, password_hash, parent_pin_hash)
       VALUES ($1, $2, 'parent', $3, $4) RETURNING id`,
      [email, `Pin RL ${tag}`, passwordHash, pinHash],
    )
    userId = user!.id
    token = signToken({ id: userId, email, role: 'parent' }, { expiresIn: '7d' })
  })

  afterEach(async () => {
    await query(`DELETE FROM request_rate_limits WHERE limit_key = $1`, [`user:${userId}`])
    await query(`DELETE FROM users WHERE id = $1`, [userId])
  })

  test('11th rapid password attempt is rejected with 429', async () => {
    // Attempts 1-10 consume the window (wrong password → 400, never 429).
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/users/me/pin')
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '5678', password: 'wrong-password' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Kata sandi salah.')
    }

    // 11th attempt: rate-limited BEFORE bcrypt — even the correct password
    // must bounce.
    const blocked = await request(app)
      .post('/api/users/me/pin')
      .set('Authorization', `Bearer ${token}`)
      .send({ pin: '5678', password: 'correct-horse' })
    expect(blocked.status).toBe(429)
    expect(blocked.headers['retry-after']).toBeDefined()
    expect(blocked.body).toEqual({
      success: false,
      error: 'Terlalu banyak percobaan. Coba lagi nanti.',
    })
  })
})
