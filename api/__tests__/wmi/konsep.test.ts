import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { pool, queryOne } from '../../db.js'
import app from '../../app.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../../services/wmi/concepts/bootstrap.js'

import request from 'supertest'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('WMI konsep HTTP', () => {
  let parentUserId: string
  let childId: string
  let token: string

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`konsep-http-${tag}@example.com`, `HTTP Test ${tag}`],
    )
    parentUserId = user!.id
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Kid ${tag}`],
    )
    childId = child!.id
    token = jwt.sign({ id: parentUserId, email: `konsep-http-${tag}@example.com`, role: 'parent' }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  })

  afterAll(async () => {
    await pool.end()
  })

  test('GET /konsep/next requires auth', async () => {
    const res = await request(app).get('/api/me/wmi/konsep/next').query({ childId })
    expect(res.status).toBe(401)
  })

  test('GET /konsep/next requires childId', async () => {
    const res = await request(app)
      .get('/api/me/wmi/konsep/next')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })

  test('GET /konsep/next returns a question without leaking answer', async () => {
    const res = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId, grade: 1 })
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.question.concept_instance_id).toBeTruthy()
    expect(res.body.data.question.answer).toBeUndefined()
  })

  test('POST /attempts mode=concept records an attempt', async () => {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId, grade: 1 })
      .set('Authorization', `Bearer ${token}`)
    const instanceId = next.body.data.question.concept_instance_id
    const res = await request(app)
      .post('/api/me/wmi/attempts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        mode: 'concept',
        concept_instance_id: instanceId,
        selected_answer: '0',
      })
    expect(res.status).toBe(201)
    expect(typeof res.body.data.is_correct).toBe('boolean')
    expect(typeof res.body.data.correct_answer).toBe('string')

    const row = await queryOne<{ concept_instance_id: string; question_id: string | null }>(
      `SELECT concept_instance_id, question_id FROM wmi_attempts WHERE child_id = $1`,
      [childId],
    )
    expect(row?.concept_instance_id).toBe(instanceId)
    expect(row?.question_id).toBeNull()
  })

  test('POST /attempts rejects question_id when mode=concept', async () => {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId, grade: 1 })
      .set('Authorization', `Bearer ${token}`)
    const instanceId = next.body.data.question.concept_instance_id
    const res = await request(app)
      .post('/api/me/wmi/attempts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        mode: 'concept',
        question_id: randomUUID(),
        concept_instance_id: instanceId,
        selected_answer: '0',
      })
    expect(res.status).toBe(400)
  })

  test('POST /konsep/vote upserts and returns counts', async () => {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId, grade: 1 })
      .set('Authorization', `Bearer ${token}`)
    const instanceId = next.body.data.question.concept_instance_id
    const res = await request(app)
      .post('/api/me/wmi/konsep/vote')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, concept_instance_id: instanceId, vote: 1 })
    expect(res.status).toBe(200)
    expect(res.body.data.upvotes).toBeGreaterThanOrEqual(1)
  })

  test('POST /konsep/vote rejects invalid vote value', async () => {
    const res = await request(app)
      .post('/api/me/wmi/konsep/vote')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, concept_instance_id: randomUUID(), vote: 0 })
    expect(res.status).toBe(400)
  })

  test('GET /konsep/next rejects out-of-range grade', async () => {
    const res = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId, grade: 99 })
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })
})
