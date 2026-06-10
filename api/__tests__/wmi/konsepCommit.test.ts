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
import { pool, query, queryOne } from '../../db.js'
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

  async function pickConcept() {
    const concept = await queryOne<{ slug: string; subject_key: string }>(
      `SELECT slug, subject_key FROM wmi_concepts
       WHERE subject_key IS NOT NULL AND enabled AND 1 = ANY(grades)
       ORDER BY slug LIMIT 1`,
      [],
    )
    expect(concept).toBeTruthy()
    return concept!
  }

  // /konsep/next never re-serves an instance the child has attempted, so a
  // follow-up call after a commit yields a FRESH instance of the concept.
  async function fetchInstance(forChildId: string, slug: string) {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId: forChildId, grade: 1, concept: slug })
      .set('Authorization', `Bearer ${token}`)
    expect(next.status).toBe(200)
    const id: string = next.body.data.question.concept_instance_id
    const row = await queryOne<{ answer: string }>(
      'SELECT answer FROM wmi_concept_instances WHERE id = $1',
      [id],
    )
    return { id, answer: row!.answer }
  }

  // A 20-answer payload reusing one real instance of a subject-linked
  // concept: the commit accepts repeated instances (the ledger dedupes), and
  // this keeps the fixture independent of generator randomness.
  async function buildSessionPayload(forChildId: string) {
    const concept = await pickConcept()
    const instance = await fetchInstance(forChildId, concept.slug)
    return {
      subjectKey: concept.subject_key,
      answers: Array.from({ length: 20 }, () => ({
        concept_instance_id: instance.id,
        selected_answer: '0',
      })),
    }
  }

  async function tierUpRows(forChildId: string) {
    const rows = await query<{ xp_delta: string; coin_delta: string }>(
      `SELECT xp_delta::text, coin_delta::text FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'CONCEPT_TIER_UP_XP'
       ORDER BY xp_delta::int`,
      [forChildId],
    )
    return rows.map((r) => [Number(r.xp_delta), Number(r.coin_delta)])
  }

  async function baseXpFor(forChildId: string, instanceId: string) {
    const row = await queryOne<{ xp_delta: string; coin_delta: string }>(
      `SELECT xp_delta::text, coin_delta::text FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'CONCEPT_COMPLETION_XP'
         AND source_type = 'concept_attempt' AND source_id = $2`,
      [forChildId, instanceId],
    )
    expect(row).toBeTruthy()
    return { xp: Number(row!.xp_delta), coins: Number(row!.coin_delta) }
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
    // Stored result verbatim, straight from the cache table — plus the
    // replay marker the FE uses to skip celebration analytics.
    expect(second.body.data).toEqual({ ...first.body.data, replayed: true })

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

  test('session path: mastery-scaled base XP + one-time tier-up bonuses (P2.1)', async () => {
    const concept = await pickConcept()
    const instanceA = await fetchInstance(childId, concept.slug)

    // 20 straight CORRECT answers on a fresh concept fold best_tier 0 → 4 in
    // one commit, crossing Berlatih, Mahir, and Dikuasai at once.
    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        subject_key: concept.subject_key,
        session_id: randomUUID(),
        answers: Array.from({ length: 20 }, () => ({
          concept_instance_id: instanceA.id,
          selected_answer: instanceA.answer,
        })),
      })
    expect(first.status).toBe(201)
    expect(first.body.data.correct).toBe(20)

    // Growth beat data: the grown entry carries the summed crossed bonuses.
    const grown = first.body.data.conceptsGrown.find(
      (g: { slug: string }) => g.slug === concept.slug,
    )
    expect(grown).toMatchObject({ fromTier: 0, toTier: 4, bonusXp: 65 })

    // Base XP priced at the PRE-session tier (0 → 5 XP), coins stay 1.
    expect(await baseXpFor(childId, instanceA.id)).toEqual({ xp: 5, coins: 1 })

    // Exactly the three spec bonuses: Berlatih +5, Mahir +20/+5, Dikuasai +40/+10.
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])

    // Second session on the SAME (now Dikuasai) concept with a FRESH
    // instance: base XP drops to the tier-4 rate (1 XP) and the tier-up
    // bonuses do NOT grant again — they are once-ever per (child, concept, tier).
    const instanceB = await fetchInstance(childId, concept.slug)
    expect(instanceB.id).not.toBe(instanceA.id)
    const second = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        subject_key: concept.subject_key,
        session_id: randomUUID(),
        answers: Array.from({ length: 20 }, () => ({
          concept_instance_id: instanceB.id,
          selected_answer: instanceB.answer,
        })),
      })
    expect(second.status).toBe(201)
    expect(second.body.data.conceptsGrown).toEqual([])
    expect(await baseXpFor(childId, instanceB.id)).toEqual({ xp: 1, coins: 1 })
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])
  })

  test('drill path: tier-up bonuses grant once and Dikuasai answers pay 1 XP (P2.1)', async () => {
    const concept = await pickConcept()
    const instance = await fetchInstance(childId, concept.slug)

    // 10 correct drill answers walk the concept 0 → 4 (tier 2 at the 3rd,
    // tier 3 at the 6th, tier 4 at the 10th). Base XP lands only once (the
    // per-instance ledger key dedupes repeats of the same instance); each
    // crossing's bonus surfaces on that answer's response exactly once.
    const tierUpsSeen: Array<{ toTier: number; bonusXp: number } | null> = []
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/me/wmi/attempts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          childId,
          mode: 'concept',
          concept_instance_id: instance.id,
          selected_answer: instance.answer,
        })
      expect(res.status).toBe(201)
      expect(res.body.data.is_correct).toBe(true)
      tierUpsSeen.push(res.body.data.gamification.tierUp ?? null)
    }
    expect(tierUpsSeen[2]).toMatchObject({ toTier: 2, bonusXp: 5 })
    expect(tierUpsSeen[5]).toMatchObject({ toTier: 3, bonusXp: 20 })
    expect(tierUpsSeen[9]).toMatchObject({ toTier: 4, bonusXp: 40 })
    expect(tierUpsSeen.filter(Boolean)).toHaveLength(3)

    expect(await baseXpFor(childId, instance.id)).toEqual({ xp: 5, coins: 1 })
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])

    // A fresh instance answered at Dikuasai pays the same 1-XP rate the
    // session path charges for tier 4 — the two paths price identically.
    const fresh = await fetchInstance(childId, concept.slug)
    expect(fresh.id).not.toBe(instance.id)
    const res = await request(app)
      .post('/api/me/wmi/attempts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        mode: 'concept',
        concept_instance_id: fresh.id,
        selected_answer: fresh.answer,
      })
    expect(res.status).toBe(201)
    expect(res.body.data.gamification.tierUp ?? null).toBeNull()
    expect(await baseXpFor(childId, fresh.id)).toEqual({ xp: 1, coins: 1 })
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])
  })
})
