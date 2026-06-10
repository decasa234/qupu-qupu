// Integration tests for the idempotent batched konsep commit (P1.5).
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).
//
// The contract under test:
//   - same session_id POSTed twice → second returns the STORED result
//     verbatim, with NO new attempts / events / progress / ledger rows;
//   - a different child replaying the same session_id is rejected (409)
//     without leaking the stored result.

import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { signToken } from '../../lib/jwt.js'
import { pool, queryOne } from '../../db.js'
import app from '../../app.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../../services/wmi/concepts/bootstrap.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('WMI konsep commit idempotency', () => {
  let parentUserId: string
  let childId: string
  let siblingId: string
  let token: string

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`konsep-commit-${tag}@example.com`, `Commit Test ${tag}`],
    )
    parentUserId = user!.id
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Kid ${tag}`],
    )
    childId = child!.id
    const sibling = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Sibling ${tag}`],
    )
    siblingId = sibling!.id
    token = signToken(
      { id: parentUserId, email: `konsep-commit-${tag}@example.com`, role: 'parent' },
      { expiresIn: '7d' },
    )
  })

  afterAll(async () => {
    await pool.end()
  })

  // A 20-answer payload reusing one real instance of a subject-linked
  // concept: the commit accepts repeated instances (the ledger dedupes), and
  // this keeps the fixture independent of generator randomness.
  async function buildSessionPayload(forChildId: string) {
    const concept = await queryOne<{ slug: string; subject_key: string }>(
      `SELECT slug, subject_key FROM wmi_concepts
       WHERE subject_key IS NOT NULL AND enabled AND 1 = ANY(grades)
       ORDER BY slug LIMIT 1`,
      [],
    )
    expect(concept).toBeTruthy()
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId: forChildId, grade: 1, concept: concept!.slug })
      .set('Authorization', `Bearer ${token}`)
    expect(next.status).toBe(200)
    const instanceId: string = next.body.data.question.concept_instance_id
    return {
      subjectKey: concept!.subject_key,
      answers: Array.from({ length: 20 }, () => ({
        concept_instance_id: instanceId,
        selected_answer: '0',
      })),
    }
  }

  async function counts(forChildId: string) {
    const row = await queryOne<{ attempts: string; events: string; ledger: string; progress_attempts: string | null }>(
      `SELECT
         (SELECT COUNT(*) FROM wmi_attempts WHERE child_id = $1)::text AS attempts,
         (SELECT COUNT(*) FROM gamification_events WHERE child_id = $1)::text AS events,
         (SELECT COUNT(*) FROM reward_ledger WHERE child_id = $1)::text AS ledger,
         (SELECT SUM(attempts) FROM wmi_concept_progress WHERE child_id = $1)::text AS progress_attempts`,
      [forChildId],
    )
    return {
      attempts: Number(row!.attempts),
      events: Number(row!.events),
      ledger: Number(row!.ledger),
      progressAttempts: Number(row!.progress_attempts ?? 0),
    }
  }

  test('commit requires session_id', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)
    const res = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, answers })
    expect(res.status).toBe(400)
  })

  test('replay with the same session_id returns the stored result and writes nothing', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)
    const sessionId = randomUUID()

    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: sessionId, answers })
    expect(first.status).toBe(201)
    expect(first.body.data.total).toBe(20)

    const after1 = await counts(childId)
    expect(after1.attempts).toBe(20)
    expect(after1.progressAttempts).toBe(20)

    const second = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: sessionId, answers })
    expect(second.status).toBe(201)
    // Byte-identical result, straight from the cache table.
    expect(second.body.data).toEqual(first.body.data)

    // NO new attempts / events / ledger rows / comprehension counts.
    expect(await counts(childId)).toEqual(after1)
  })

  test('a different child replaying the session_id is rejected without the result', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)
    const sessionId = randomUUID()

    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: sessionId, answers })
    expect(first.status).toBe(201)

    const siblingPayload = await buildSessionPayload(siblingId)
    const res = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId: siblingId,
        subject_key: siblingPayload.subjectKey,
        session_id: sessionId,
        answers: siblingPayload.answers,
      })
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
    expect(JSON.stringify(res.body)).not.toContain('xpEarned')

    // The sibling banked nothing.
    const siblingCounts = await counts(siblingId)
    expect(siblingCounts.attempts).toBe(0)
  })

  test('fresh session_ids commit independently and earn ledger rewards once per instance', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)

    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: randomUUID(), answers })
    expect(first.status).toBe(201)

    // Same instance, NEW session id: attempts append again (a real second
    // session), but the per-instance CONCEPT_COMPLETION_XP ledger key blocks
    // double XP for the same instance — xpEarned reflects only appended rows.
    const second = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: randomUUID(), answers })
    expect(second.status).toBe(201)

    const after = await counts(childId)
    expect(after.attempts).toBe(40)
    const conceptLedger = await queryOne<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'CONCEPT_COMPLETION_XP'`,
      [childId],
    )
    // One distinct instance in both sessions → at most one concept XP row.
    expect(Number(conceptLedger!.n)).toBeLessThanOrEqual(1)
  })
})
