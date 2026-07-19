// Lesson build + one-miss commit (Task 7). Runs only against
// TEST_DATABASE_URL (see api/__tests__/setup.ts).
//
// The pilot track (wmi-grade-1) has exactly ONE concept, so the recall path
// can never produce candidates from the real registered track (recall
// candidates are spine concepts strictly BEFORE the focus concept). Recall
// selection itself is covered by the pure api/services/wmi/tracks/lessonMix.test.ts
// suite; this file sticks to the focus flow, per the track-engine task brief.
import { describe, expect, it, beforeAll, afterAll, afterEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne } from '../db.js'
import { buildLesson, commitLesson } from '../services/wmi/tracks/lesson.js'
import { LESSON_PASS_XP, LESSON_PASS_COINS } from '../services/wmi/tracks/ladder.js'
import { ensureLevelPools } from '../services/wmi/concepts/levelPools.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../services/wmi/concepts/bootstrap.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

const TRACK_ID = 'wmi-grade-1'
const CONCEPT_SLUG = 'single-digit-addition'
const WRONG_ANSWER = '__definitely_wrong__'

;(runIntegration ? describe : describe.skip)('lesson build + commit', () => {
  const createdUserIds: string[] = []

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped() // seeds wmi_concepts, incl. single-digit-addition
    await ensureLevelPools([CONCEPT_SLUG], 8) // fills levels 1..5 with 8 instances each
  }, 60_000)

  afterEach(async () => {
    if (createdUserIds.length) {
      // users -> children -> wmi_concept_progress cascade.
      await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [createdUserIds])
      createdUserIds.length = 0
    }
  })

  afterAll(async () => {
    await pool.end()
  })

  async function createChild(): Promise<{ parentUserId: string; childId: string }> {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`track-lesson-${tag}@example.test`, `Track Lesson Test ${tag}`],
    )
    createdUserIds.push(user!.id)
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [user!.id, `Child ${tag}`],
    )
    // Pre-unlock every seeded achievement (e.g. 'first_concept_mahir' fires
    // the moment ANY concept crosses Mahir, which a fresh child's first 6/6
    // focus run does via the legacy best_tier fold) so evaluateAchievements
    // never has anything new to grant here — isolates the lesson-specific
    // reward amounts this suite asserts from the achievement system's own
    // (separately tested) XP grants.
    await query(
      `INSERT INTO child_achievements (child_id, achievement_template_id)
         SELECT $1, id FROM achievement_templates
         ON CONFLICT DO NOTHING`,
      [child!.id],
    )
    return { parentUserId: user!.id, childId: child!.id }
  }

  async function answersFor(
    questions: Awaited<ReturnType<typeof buildLesson>>['questions'],
    wrongCount = 0,
  ): Promise<Array<{ instanceId: string; selectedAnswer: string; recall: boolean }>> {
    const ids = questions.map((q) => q.instanceId)
    const rows = await query<{ id: string; answer: string }>(
      `SELECT id, answer FROM wmi_concept_instances WHERE id = ANY($1)`,
      [ids],
    )
    const answerById = new Map(rows.map((r) => [r.id, r.answer]))
    return questions.map((q, i) => ({
      instanceId: q.instanceId,
      selectedAnswer: i < wrongCount ? WRONG_ANSWER : answerById.get(q.instanceId)!,
      recall: q.recall,
    }))
  }

  it('builds 6 focus questions at level 1 with no recall (pilot track has one concept)', async () => {
    const { parentUserId, childId } = await createChild()
    const lesson = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    expect(typeof lesson.lessonId).toBe('string')
    expect(lesson.questions).toHaveLength(6)
    for (const q of lesson.questions) {
      expect(q.conceptSlug).toBe(CONCEPT_SLUG)
      expect(q.level).toBe(1)
      expect(q.recall).toBe(false)
    }
  })

  it('one-miss pass levels up; a second miss on the retry keeps the level', async () => {
    const { parentUserId, childId } = await createChild()

    const lesson1 = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    expect(lesson1.questions).toHaveLength(6)

    const beforeFirstCommit = Date.now()
    const result1 = await commitLesson(
      parentUserId,
      childId,
      TRACK_ID,
      CONCEPT_SLUG,
      lesson1.lessonId,
      await answersFor(lesson1.questions, 0),
    )
    expect(result1).toMatchObject({
      focusCorrect: 6,
      passed: true,
      levelBefore: 0,
      levelAfter: 1,
      xpEarned: LESSON_PASS_XP,
      coinsEarned: LESSON_PASS_COINS,
    })

    const ledgerRows1 = await query<{ xp_delta: number; coin_delta: number }>(
      `SELECT xp_delta, coin_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'TRACK_LESSON_XP' AND source_type = 'wmi_track_lesson'`,
      [childId],
    )
    expect(ledgerRows1).toHaveLength(1)
    expect(ledgerRows1[0]).toMatchObject({ xp_delta: LESSON_PASS_XP, coin_delta: LESSON_PASS_COINS })

    const progressRow1 = await queryOne<{ level: number; updated_at: string }>(
      `SELECT level, updated_at FROM wmi_concept_progress WHERE child_id = $1 AND concept_slug = $2`,
      [childId, CONCEPT_SLUG],
    )
    expect(progressRow1?.level).toBe(1)
    expect(Date.parse(progressRow1!.updated_at)).toBeGreaterThanOrEqual(beforeFirstCommit - 1000)

    // Next lesson is served at the newly-cleared-plus-one level.
    const lesson2 = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    expect(lesson2.questions).toHaveLength(6)
    for (const q of lesson2.questions) expect(q.level).toBe(2)

    const result2 = await commitLesson(
      parentUserId,
      childId,
      TRACK_ID,
      CONCEPT_SLUG,
      lesson2.lessonId,
      await answersFor(lesson2.questions, 2), // 2 wrong -> fails the one-miss bar
    )
    expect(result2).toMatchObject({
      focusCorrect: 4,
      passed: false,
      levelBefore: 1,
      levelAfter: 1,
      xpEarned: 0,
      coinsEarned: 0,
    })

    const progressRow2 = await queryOne<{ level: number }>(
      `SELECT level FROM wmi_concept_progress WHERE child_id = $1 AND concept_slug = $2`,
      [childId, CONCEPT_SLUG],
    )
    expect(progressRow2?.level).toBe(1)

    // A failed commit never grants — no ledger row at all for this child.
    const ledgerRowsAfterFail = await query(
      `SELECT 1 FROM reward_ledger WHERE child_id = $1 AND reward_type = 'TRACK_LESSON_XP'`,
      [childId],
    )
    expect(ledgerRowsAfterFail).toHaveLength(1) // only the L1 pass from result1 above
  })

  it('grants nothing on a gold (L5) replay pass', async () => {
    const { parentUserId, childId } = await createChild()
    // Seed progress directly at gold so this pass can't level up further.
    await query(
      `INSERT INTO wmi_concept_progress (child_id, concept_slug, level, best_tier)
       VALUES ($1, $2, 5, 4)`,
      [childId, CONCEPT_SLUG],
    )

    const lesson = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    for (const q of lesson.questions) expect(q.level).toBe(5)

    const result = await commitLesson(
      parentUserId,
      childId,
      TRACK_ID,
      CONCEPT_SLUG,
      lesson.lessonId,
      await answersFor(lesson.questions, 0),
    )
    expect(result).toMatchObject({
      passed: true,
      levelBefore: 5,
      levelAfter: 5,
      xpEarned: 0,
      coinsEarned: 0,
    })

    const ledgerRows = await query(
      `SELECT 1 FROM reward_ledger WHERE child_id = $1 AND reward_type = 'TRACK_LESSON_XP'`,
      [childId],
    )
    expect(ledgerRows).toHaveLength(0)
  })

  it('grants XP/coins once per (child, concept, level) — a replayed level-up no-ops on the ledger', async () => {
    const { parentUserId, childId } = await createChild()

    const lesson1 = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    const result1 = await commitLesson(
      parentUserId,
      childId,
      TRACK_ID,
      CONCEPT_SLUG,
      lesson1.lessonId,
      await answersFor(lesson1.questions, 0),
    )
    expect(result1).toMatchObject({
      passed: true,
      levelBefore: 0,
      levelAfter: 1,
      xpEarned: LESSON_PASS_XP,
      coinsEarned: LESSON_PASS_COINS,
    })

    // Reset progress back down to simulate replaying the SAME level (level
    // is monotonic in the real API, so this can't happen through
    // buildLesson/commitLesson alone — this reset stands in for whatever
    // future path could re-trigger the same levelAfter, e.g. an admin
    // reset tool). The deterministic ledger source id must still make the
    // second grant a no-op even though passed && levelAfter > levelBefore
    // is true again.
    await query(
      `UPDATE wmi_concept_progress SET level = 0 WHERE child_id = $1 AND concept_slug = $2`,
      [childId, CONCEPT_SLUG],
    )

    const lesson2 = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    const result2 = await commitLesson(
      parentUserId,
      childId,
      TRACK_ID,
      CONCEPT_SLUG,
      lesson2.lessonId,
      await answersFor(lesson2.questions, 0),
    )
    expect(result2).toMatchObject({ passed: true, levelBefore: 0, levelAfter: 1, xpEarned: 0, coinsEarned: 0 })

    const ledgerRows = await query<{ xp_delta: number; coin_delta: number }>(
      `SELECT xp_delta, coin_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'TRACK_LESSON_XP' AND source_type = 'wmi_track_lesson'`,
      [childId],
    )
    expect(ledgerRows).toHaveLength(1) // still just the one row from result1
    expect(ledgerRows[0]).toMatchObject({ xp_delta: LESSON_PASS_XP, coin_delta: LESSON_PASS_COINS })
  })

  it('rejects an unknown track id', async () => {
    const { parentUserId, childId } = await createChild()
    await expect(buildLesson(parentUserId, childId, 'nonexistent-track', CONCEPT_SLUG)).rejects.toThrow(
      'Track not found',
    )
    await expect(
      commitLesson(parentUserId, childId, 'nonexistent-track', CONCEPT_SLUG, randomUUID(), []),
    ).rejects.toThrow('Track not found')
  })

  it('rejects a concept not in the track', async () => {
    const { parentUserId, childId } = await createChild()
    await expect(
      buildLesson(parentUserId, childId, TRACK_ID, 'not-a-real-concept'),
    ).rejects.toThrow('Concept not in track')
    await expect(
      commitLesson(parentUserId, childId, TRACK_ID, 'not-a-real-concept', randomUUID(), []),
    ).rejects.toThrow('Concept not in track')
  })

  it('rejects a child the caller does not own', async () => {
    const { childId } = await createChild()
    const otherParent = await createChild()
    await expect(
      buildLesson(otherParent.parentUserId, childId, TRACK_ID, CONCEPT_SLUG),
    ).rejects.toThrow('Child not found')
  })

  it('rejects commit with a lessonId that does not exist', async () => {
    const { parentUserId, childId } = await createChild()
    const lesson = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    await expect(
      commitLesson(
        parentUserId,
        childId,
        TRACK_ID,
        CONCEPT_SLUG,
        randomUUID(),
        await answersFor(lesson.questions, 0),
      ),
    ).rejects.toThrow('Lesson not found')
  })

  it('rejects a second commit of the same lesson', async () => {
    const { parentUserId, childId } = await createChild()
    const lesson = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)
    const answers = await answersFor(lesson.questions, 0)

    await commitLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG, lesson.lessonId, answers)

    await expect(
      commitLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG, lesson.lessonId, answers),
    ).rejects.toThrow('Lesson already committed')
  })

  it('rejects commit with an instanceId that was not served by this lesson', async () => {
    const { parentUserId, childId } = await createChild()
    const lesson = await buildLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG)

    // Substitute a fabricated instanceId the lesson never served — provably
    // not in the stored instance_ids regardless of what buildLesson picked.
    const answers = await answersFor(lesson.questions, 0)
    const foreignAnswers = [
      { instanceId: randomUUID(), selectedAnswer: answers[0].selectedAnswer, recall: false },
      ...answers.slice(1),
    ]

    await expect(
      commitLesson(parentUserId, childId, TRACK_ID, CONCEPT_SLUG, lesson.lessonId, foreignAnswers),
    ).rejects.toThrow('Lesson answers mismatch')
  })
})
