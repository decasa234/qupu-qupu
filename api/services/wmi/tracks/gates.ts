// Synthesis gate resolution + grading (Task 8). NOT browser-safe (owns SQL).
//
// Unlock/clear state is the single source of truth already computed by
// getTrackState (the unit-fold test-out rule) — this file never
// re-derives it, so there is exactly one place that decides "is this gate
// open". Here we only locate the gate node inside that state, resolve its
// past-paper problem, and grade a submitted answer.
import { query, queryOne, withTransaction } from '../../../db.js'
import { wibDateString } from '../../../lib/wib.js'
import { deterministicUuid } from '../../../lib/deterministicUuid.js'
import { getTrackState, type TrackNodeState } from './trackState.js'
import { paperCode as computePaperCode } from '../paperCode.js'
import { isCorrectAnswer } from '../answerMatch.js'
import { emitEvent } from '../../gamification/events.js'
import { appendLedger } from '../../gamification/ledger.js'
import { ensureProfile, updateProfileWithDelta } from '../../gamification/profileUpdater.js'
import { updateStreakForActivity } from '../../gamification/streakUpdater.js'
import { ensureTodaysQuests } from '../../gamification/questGenerator.js'
import { evaluateForEvent } from '../../gamification/questEvaluator.js'
import { evaluateAchievements } from '../../gamification/achievementEvaluator.js'

// Gate-clear reward — the SAME amount as a Tes Bab first pass. Mirrored
// (not imported) because chapterTest.ts's CHAPTER_TEST_XP/CHAPTER_TEST_COINS
// are module-private constants — keep these in lockstep if that reward ever
// changes (see api/services/wmi/concepts/chapterTest.ts).
export const GATE_CLEAR_XP = 30
export const GATE_CLEAR_COINS = 50

type GateNodeState = Extract<TrackNodeState, { kind: 'gate' }>

interface GateProblemRow {
  body_id: string
  body_en: string
  answer_type: string
  choices_id: unknown
  choices_en: unknown
  answer: string
}

async function findGateNode(
  parentUserId: string,
  childId: string,
  trackId: string,
  gateKey: string,
): Promise<GateNodeState> {
  const state = await getTrackState(parentUserId, childId, trackId)
  for (const unit of state.units) {
    for (const node of unit.nodes) {
      if (node.kind === 'gate' && node.key === gateKey) return node
    }
  }
  throw new Error('Gate not found')
}

// problemRef is '<paperCode>#<number>' (e.g. 'WMI-21F1A#1'). wmi_papers has
// no stored `code` column — the code is derived from (brand, year, round,
// level, variant), exactly like papers.ts/paperReviews.ts/claireMock.ts
// already do for question codes — so resolve candidates by question number
// (cheap: at most a handful of papers share a given number) and match the
// derived paper code in JS.
async function resolveGateProblem(problemRef: string): Promise<GateProblemRow | null> {
  const [targetCode, numberStr] = problemRef.split('#')
  const number = Number(numberStr)
  if (!targetCode || !Number.isInteger(number)) return null

  const rows = await query<
    GateProblemRow & {
      year: number
      round: string
      variant: string
      brand: string
      level_code: string
    }
  >(
    `
      SELECT q.body_id, q.body_en, q.answer_type, q.choices_id, q.choices_en, q.answer,
             p.year, p.round, p.variant, p.brand, p.level_code
      FROM wmi_questions q
      JOIN wmi_papers p ON p.id = q.paper_id
      WHERE q.number = $1
    `,
    [number],
  )

  const match = rows.find(
    (r) =>
      computePaperCode({
        brand: r.brand,
        year: r.year,
        round: r.round,
        level: r.level_code,
        variant: r.variant,
      }) === targetCode,
  )
  return match ?? null
}

export async function getGate(
  parentUserId: string,
  childId: string,
  trackId: string,
  gateKey: string,
): Promise<{
  unlocked: boolean
  cleared: boolean
  question: {
    bodyId: string
    bodyEn: string
    answerType: string
    choicesId: unknown
    choicesEn: unknown
  } | null
}> {
  const node = await findGateNode(parentUserId, childId, trackId, gateKey)
  if (!node.unlocked) {
    // Locked: never leak the problem body, even the fact that it resolved.
    return { unlocked: false, cleared: node.cleared, question: null }
  }

  const problem = await resolveGateProblem(node.problemRef)
  if (!problem) throw new Error('Gate problem missing')

  return {
    unlocked: true,
    cleared: node.cleared,
    question: {
      bodyId: problem.body_id,
      bodyEn: problem.body_en,
      answerType: problem.answer_type,
      choicesId: problem.choices_id,
      choicesEn: problem.choices_en,
    },
  }
}

export async function submitGate(
  parentUserId: string,
  childId: string,
  trackId: string,
  gateKey: string,
  selectedAnswer: string,
): Promise<{ correct: boolean; cleared: boolean; xpEarned: number; coinsEarned: number }> {
  const node = await findGateNode(parentUserId, childId, trackId, gateKey)
  if (!node.unlocked) throw new Error('Gate locked')

  const problem = await resolveGateProblem(node.problemRef)
  if (!problem) throw new Error('Gate problem missing')

  const correct = isCorrectAnswer(problem.answer, selectedAnswer)
  let xpEarned = 0
  let coinsEarned = 0

  if (correct && !node.cleared) {
    // Child ownership was already asserted upstream by findGateNode (via
    // getTrackState), immediately before this transaction opens on the same
    // childId with no intervening user input in between — no need to
    // re-check it here (buildLesson follows the same single-check pattern).
    await withTransaction(async (tx) => {
      // RETURNING detects whether THIS call is the actual first clear (vs. a
      // race with another request that already inserted the row) — only the
      // request that truly inserts it grants the reward.
      const insert = await queryOne<{ gate_key: string }>(
        `INSERT INTO wmi_gate_clears (child_id, track_id, gate_key) VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING
         RETURNING gate_key`,
        [childId, trackId, gateKey],
        tx,
      )
      if (!insert) return // lost the race — another request already cleared it

      // ── Gamification (same transaction; mirrors chapterTest.ts's submit
      // path — same helpers, same order, same amounts as a Tes Bab pass) ──
      const today = wibDateString(new Date())
      await ensureProfile(tx, childId)
      const streak = await updateStreakForActivity(tx, childId, today)

      // Deterministic per-(child, track, gate) source id: wmi_gate_clears'
      // PK is (child_id, track_id, gate_key), so this branch can only ever
      // insert once — the ledger UNIQUE key is defense-in-depth.
      const sourceId = deterministicUuid(`track-gate:${childId}:${trackId}:${gateKey}`)
      const led = await appendLedger(tx, {
        childId,
        rewardType: 'TRACK_GATE_XP',
        sourceType: 'wmi_gate_clear',
        sourceId,
        xpDelta: GATE_CLEAR_XP,
        coinDelta: GATE_CLEAR_COINS,
        metadata: { trackId, gateKey },
      })
      if (led.appended) {
        xpEarned = led.xpDelta
        coinsEarned = led.coinDelta
      }

      await emitEvent(tx, {
        childId,
        eventType: 'TRACK_GATE_CLEARED',
        sourceType: 'wmi_gate_clear',
        sourceId,
        eventDate: today,
        metadata: { trackId, gateKey },
      })
      await ensureTodaysQuests(tx, childId, today)
      await evaluateForEvent(tx, today, {
        childId,
        eventType: 'TRACK_GATE_CLEARED',
        eventSourceType: 'wmi_gate_clear',
        eventSourceId: sourceId,
        currentStreakDays: streak.currentStreakDays,
      })

      const newAchievements = await evaluateAchievements(tx, childId, streak)
      for (const ach of newAchievements) {
        xpEarned += ach.xpAwarded
      }

      await updateProfileWithDelta(tx, {
        childId,
        xpDelta: xpEarned,
        coinDelta: coinsEarned,
        activityDate: today,
      })
    })
  }

  // Already-cleared stays cleared regardless of this submission's
  // correctness (idempotent re-submit never un-clears a gate).
  return { correct, cleared: correct || node.cleared, xpEarned, coinsEarned }
}
