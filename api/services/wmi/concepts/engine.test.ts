import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, queryOne, withTransaction } from '../../../db.js'
import { ensureBootstrapped, _resetBootstrapForTesting } from './bootstrap.js'
import { getNextConceptQuestion, submitConceptVote } from './engine.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('wmi concept engine', () => {
  let parentUserId: string
  let childId: string

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`engine-test-${tag}@example.com`, `Engine Test ${tag}`],
    )
    parentUserId = user!.id
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Kid ${tag}`],
    )
    childId = child!.id
  })

  afterAll(async () => {
    await pool.end()
  })

  test('serves an unculled instance for kid grade', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId, 1)
    expect(q.concept_instance_id).toBeTruthy()
    expect(q.body_id).toBeTruthy()
    expect(q.answer_type === 'multiple_choice' || q.answer_type === 'fill_in').toBe(true)
  })

  test('does not return an answer field', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId, 1) as unknown as Record<string, unknown>
    expect(q.answer).toBeUndefined()
  })

  test('throws when no concept for kid grade', async () => {
    await expect(getNextConceptQuestion(parentUserId, childId, 99)).rejects.toThrow(
      /konsep belum tersedia/,
    )
  })

  test('vote upserts and recomputes counts', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId, 1)
    const a = await submitConceptVote(parentUserId, childId, q.concept_instance_id, 1)
    expect(a.upvotes).toBeGreaterThanOrEqual(1)
    const b = await submitConceptVote(parentUserId, childId, q.concept_instance_id, -1)
    expect(b.downvotes).toBeGreaterThanOrEqual(1)
    expect(b.upvotes).toBe(a.upvotes - 1)
  })

  test('vote rejects unknown instance', async () => {
    await expect(
      submitConceptVote(parentUserId, childId, randomUUID(), 1),
    ).rejects.toThrow(/Question not found/)
  })

  test('vote rejects on child_id ownership mismatch', async () => {
    const otherUser = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`other-${randomUUID().slice(0,6)}@example.com`, 'Other'],
    )
    const q = await getNextConceptQuestion(parentUserId, childId, 1)
    await expect(
      submitConceptVote(otherUser!.id, childId, q.concept_instance_id, 1),
    ).rejects.toThrow(/Child not found/)
  })

  test('crossing 5 votes with 3 downvotes flips is_culled', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId, 1)
    // Seed 5 votes total directly to test is_culled trigger
    for (let i = 0; i < 5; i++) {
      const tag = randomUUID().slice(0, 8)
      const u = await queryOne<{ id: string }>(
        `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
        [`v${i}-${tag}@example.com`, `V${i}`],
      )
      const c = await queryOne<{ id: string }>(
        `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
        [u!.id, `Kid V${i}`],
      )
      // 3 downvotes + 2 upvotes → cull
      const vote = i < 3 ? -1 : 1
      await submitConceptVote(u!.id, c!.id, q.concept_instance_id, vote)
    }
    const row = await queryOne<{ is_culled: boolean }>(
      'SELECT is_culled FROM wmi_concept_instances WHERE id = $1',
      [q.concept_instance_id],
    )
    expect(row?.is_culled).toBe(true)
  })
})

void withTransaction
