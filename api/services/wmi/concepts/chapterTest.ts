import type { PoolClient } from 'pg'
import { pool, query, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { wibDateString } from '../../../lib/wib.js'
import { isCorrectAnswer } from '../answerMatch.js'
import { emitEvent } from '../../gamification/events.js'
import { appendLedger } from '../../gamification/ledger.js'
import { ensureProfile, updateProfileWithDelta } from '../../gamification/profileUpdater.js'
import { updateStreakForActivity } from '../../gamification/streakUpdater.js'
import { ensureTodaysQuests } from '../../gamification/questGenerator.js'
import {
  evaluateForEvent,
  type QuestProgressResult,
} from '../../gamification/questEvaluator.js'
import { evaluateAchievements } from '../../gamification/achievementEvaluator.js'

const TEST_SIZE = 6
const PASS_PCT = 70
const SEED_TIER = 2          // Berlatih head-start on pass
const SEED_PCT = 35

// Tes Bab pass reward — granted once per (child, chapter). The ledger
// source is the FIRST passed wmi_chapter_tests row for the pair, so both
// HTTP retries and repeat passes of the same chapter hit the UNIQUE
// (child_id, reward_type, source_type, source_id) key and no-op.
const CHAPTER_TEST_XP = 30
const CHAPTER_TEST_COINS = 50

export interface ChapterTestQuestion {
  concept_instance_id: string
  concept_slug: string
  body_id: string
  body_en: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_id: unknown
  choices_en: unknown
}

export async function startChapterTest(
  parentUserId: string, childId: string, subjectKey: string,
): Promise<{ questions: ChapterTestQuestion[] }> {
  const client = await pool.connect()
  try { await assertChildOwnership(client, parentUserId, childId) } finally { client.release() }
  const questions = await query<ChapterTestQuestion>(
    `SELECT DISTINCT ON (i.concept_slug)
            i.id AS concept_instance_id, i.concept_slug, i.body_id, i.body_en,
            i.answer_type, i.choices_id, i.choices_en
     FROM wmi_concept_instances i
     JOIN wmi_concepts c ON c.slug = i.concept_slug
     WHERE c.subject_key = $1 AND c.enabled = TRUE AND i.is_culled = FALSE
     ORDER BY i.concept_slug, random()
     LIMIT 100`,
    [subjectKey],
  )
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, TEST_SIZE)
  return { questions: shuffled }
}

export interface ChapterTestResult {
  passed: boolean
  score_pct: number
  correct: number
  total: number
  xp_earned: number
  coins_earned: number
}

export async function submitChapterTest(
  parentUserId: string, childId: string, subjectKey: string,
  answers: { concept_instance_id: string; selected_answer: string }[],
): Promise<ChapterTestResult> {
  return withTransaction(async (client: PoolClient) => {
    await assertChildOwnership(client, parentUserId, childId)
    if (answers.length === 0) throw new Error('No answers submitted')

    // Eligible concepts for this chapter — the server decides the denominator,
    // so a client cannot inflate the score by submitting fewer answers.
    const eligible = await client.query<{ slug: string }>(
      `SELECT slug FROM wmi_concepts
       WHERE subject_key = $1 AND enabled = TRUE`,
      [subjectKey],
    )
    const eligibleSlugs = new Set(eligible.rows.map((r) => r.slug))
    const expectedCount = Math.min(TEST_SIZE, eligibleSlugs.size)
    if (expectedCount === 0) throw new Error('No concepts available for this chapter')

    // Pull canonical answers + concept_slug for the submitted instances.
    const ids = answers.map((a) => a.concept_instance_id)
    const rows = await client.query<{ id: string; answer: string; concept_slug: string }>(
      'SELECT id, answer, concept_slug FROM wmi_concept_instances WHERE id = ANY($1::uuid[])',
      [ids],
    )
    const metaById = new Map(rows.rows.map((r) => [r.id, r]))

    // Credit at most one correct answer per ELIGIBLE concept (ignore off-subject
    // instances and duplicate submissions of the same concept).
    const creditedConcepts = new Set<string>()
    for (const a of answers) {
      const meta = metaById.get(a.concept_instance_id)
      if (!meta) continue
      if (!eligibleSlugs.has(meta.concept_slug)) continue
      if (creditedConcepts.has(meta.concept_slug)) continue
      if (isCorrectAnswer(meta.answer, a.selected_answer)) creditedConcepts.add(meta.concept_slug)
    }

    const correct = creditedConcepts.size
    const total = expectedCount
    const scorePct = Math.round((correct / total) * 100)
    const passed = scorePct >= PASS_PCT

    const testRow = await queryOne<{ id: string }>(
      `INSERT INTO wmi_chapter_tests (child_id, subject_key, score_pct, passed)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [childId, subjectKey, scorePct, passed],
      client,
    )
    if (!testRow) throw new Error('Failed to record chapter test')

    let xpEarned = 0
    let coinsEarned = 0

    if (passed) {
      await client.query(
        `INSERT INTO wmi_concept_progress (child_id, concept_slug, best_tier, comprehension_pct, updated_at)
         SELECT $1, c.slug, $3, $4, NOW() FROM wmi_concepts c
         WHERE c.subject_key = $2 AND c.enabled = TRUE
         ON CONFLICT (child_id, concept_slug) DO UPDATE SET
           best_tier = GREATEST(wmi_concept_progress.best_tier, EXCLUDED.best_tier),
           comprehension_pct = GREATEST(wmi_concept_progress.comprehension_pct, EXCLUDED.comprehension_pct),
           updated_at = NOW()`,
        [childId, subjectKey, SEED_TIER, SEED_PCT],
      )

      // ── Gamification (same transaction; mirrors gamification/concept.ts) ──
      const today = wibDateString(new Date())
      await ensureProfile(client, childId)
      // Passing a Tes Bab counts as today's learning activity; the streak
      // must advance BEFORE updateProfileWithDelta stamps last_activity_date.
      const streak = await updateStreakForActivity(client, childId, today)

      // Ledger grant keyed to the FIRST passed test row for this
      // (child, chapter). On the first pass that is the row inserted above
      // (visible inside this transaction); on any later pass or retry the
      // same id resolves again and the ledger UNIQUE makes it a no-op.
      const firstPass = await queryOne<{ id: string }>(
        `SELECT id FROM wmi_chapter_tests
           WHERE child_id = $1 AND subject_key = $2 AND passed
           ORDER BY created_at ASC, id ASC
           LIMIT 1`,
        [childId, subjectKey],
        client,
      )
      const led = await appendLedger(client, {
        childId,
        rewardType: 'CHAPTER_TEST_XP',
        sourceType: 'wmi_chapter_test',
        sourceId: firstPass?.id ?? testRow.id,
        xpDelta: CHAPTER_TEST_XP,
        coinDelta: CHAPTER_TEST_COINS,
        metadata: { subjectKey, scorePct },
      })
      if (led.appended) {
        xpEarned = led.xpDelta
        coinsEarned = led.coinDelta
      }

      // Event + evaluators, exactly like the video/konsep paths.
      await emitEvent(client, {
        childId,
        eventType: 'CHAPTER_TEST_PASSED',
        sourceType: 'wmi_chapter_test',
        sourceId: testRow.id,
        eventDate: today,
        metadata: { subjectKey, scorePct },
      })
      await ensureTodaysQuests(client, childId, today)
      const questResults = await evaluateForEvent(client, today, {
        childId,
        eventType: 'CHAPTER_TEST_PASSED',
        eventSourceType: 'wmi_chapter_test',
        eventSourceId: testRow.id,
        currentStreakDays: streak.currentStreakDays,
      })
      const completedById = new Map<string, QuestProgressResult>()
      for (const q of questResults) {
        if (q.justCompleted && !completedById.has(q.questId)) {
          completedById.set(q.questId, q)
        }
      }
      for (const q of completedById.values()) {
        xpEarned += q.xpAwarded
        coinsEarned += q.coinsAwarded
      }

      const newAchievements = await evaluateAchievements(client, childId, streak)
      for (const ach of newAchievements) {
        xpEarned += ach.xpAwarded
      }

      // Always run the profile delta — even at 0/0 it stamps
      // last_activity_date = today so tomorrow's streak gap is correct.
      await updateProfileWithDelta(client, {
        childId,
        xpDelta: xpEarned,
        coinDelta: coinsEarned,
        activityDate: today,
      })
    }
    return {
      passed,
      score_pct: scorePct,
      correct,
      total,
      xp_earned: xpEarned,
      coins_earned: coinsEarned,
    }
  })
}
