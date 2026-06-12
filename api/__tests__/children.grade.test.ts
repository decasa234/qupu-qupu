// api/__tests__/children.grade.test.ts
//
// children.grade (migration 0046) — school grade chosen at onboarding
// (0 = TK, 1-6 = SD Kelas 1-6). Nullable: omitted on create stays NULL.
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).

import { describe, test, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { signToken } from '../lib/jwt.js'
import { pool, query, queryOne } from '../db.js'
import app from '../app.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('children.grade (migration 0046)', () => {
  let parentUserId: string
  let token: string
  const createdUserIds: string[] = []

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const email = `child-grade-${tag}@example.com`
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [email, `Grade Test ${tag}`],
    )
    parentUserId = user!.id
    createdUserIds.push(parentUserId)
    token = signToken({ id: parentUserId, email, role: 'parent' }, { expiresIn: '7d' })
  })

  afterEach(async () => {
    // users → children cascade.
    await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [createdUserIds])
    createdUserIds.length = 0
  })

  afterAll(async () => {
    await pool.end()
  })

  test('stores and returns grade on create/update', async () => {
    const created = await request(app)
      .post('/api/me/children')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Adik', grade: 2 })
    expect(created.status).toBe(201)
    expect(created.body.data.child.grade).toBe(2)

    const updated = await request(app)
      .patch(`/api/me/children/${created.body.data.child.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ grade: 3 })
    expect(updated.status).toBe(200)
    expect(updated.body.data.child.grade).toBe(3)
  })

  test('grade defaults to null when omitted', async () => {
    const created = await request(app)
      .post('/api/me/children')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Kakak' })
    expect(created.status).toBe(201)
    expect(created.body.data.child.grade).toBeNull()
  })

  test('grade can be cleared back to null', async () => {
    const created = await request(app)
      .post('/api/me/children')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Adik', grade: 6 })
    expect(created.status).toBe(201)

    const updated = await request(app)
      .patch(`/api/me/children/${created.body.data.child.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ grade: null })
    expect(updated.status).toBe(200)
    expect(updated.body.data.child.grade).toBeNull()
  })

  test('rejects out-of-range grade', async () => {
    const tooHigh = await request(app)
      .post('/api/me/children')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X', grade: 9 })
    expect(tooHigh.status).toBe(400)

    const negative = await request(app)
      .post('/api/me/children')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X', grade: -1 })
    expect(negative.status).toBe(400)
  })
})
