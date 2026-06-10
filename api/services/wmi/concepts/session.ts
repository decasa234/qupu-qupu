import type { PoolClient } from 'pg'
import { pool, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { wibDateString } from '../../../lib/wib.js'
import { isCorrectAnswer } from '../answerMatch.js'
import { upsertConceptProgress } from './conceptProgress.js'
import { awardConceptReward } from '../../gamification/concept.js'
import { emitEvent, type EventType } from '../../gamification/events.js'
import { ensureTodaysQuests } from '../../gamification/questGenerator.js'
import {
  evaluateForEvent,
  type QuestProgressResult,
} from '../../gamification/questEvaluator.js'
import { evaluateAchievements } from '../../gamification/achievementEvaluator.js'
import { readStreakState } from '../../gamification/streakUpdater.js'
import { updateProfileWithDelta } from '../../gamification/profileUpdater.js'

export const SESSION_SIZE = 20

export interface GradeResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
}

// Grade a single answer for live feedback. NO writes, NO XP, NO comprehension.
export async function gradeConceptAnswer(
  parentUserId: string,
  childId: string,
  conceptInstanceId: string,
  selectedAnswer: string,
): Promise<GradeResult> {
  const client = await pool.connect()
  try {
    await assertChildOwnership(client, parentUserId, childId)
  } finally {
    client.release()
  }
  const inst = await queryOne<{
    answer: string
    hint_en: string | null
    hint_id: string | null
    hint_steps_en: string[] | null
    hint_steps_id: string[] | null
  }>(
    'SELECT answer, hint_en, hint_id, hint_steps_en, hint_steps_id FROM wmi_concept_instances WHERE id = $1',
    [conceptInstanceId],
  )
  if (!inst) throw new Error('Question not found')
  return {
    is_correct: isCorrectAnswer(inst.answer, selectedAnswer),
    correct_answer: inst.answer,
    hint_en: inst.hint_en,
    hint_id: inst.hint_id,
    hint_steps_en: inst.hint_steps_en,
    hint_steps_id: inst.hint_steps_id,
  }
}

export interface ConceptGrown {
  slug: string
  nameId: string
  fromTier: number
  toTier: number
}

export interface CompletedQuest {
  id: string
  code: string
  title: string
  xpAwarded: number
  coinsAwarded: number
}

export interface UnlockedAchievement {
  id: string
  code: string
  title: string
  iconKey: string | null
  xpAwarded: number
}

export interface SessionResult {
  correct: number
  total: number
  xpEarned: number
  coinsEarned: number
  conceptsGrown: ConceptGrown[]
  level: number
  tierName: string
  coinBalance: number
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
  completedQuests: CompletedQuest[]
  unlockedAchievements: UnlockedAchievement[]
}

// Commit a finished session ATOMICALLY: only here do comprehension + XP bank.
export async function commitKonsepSession(
  parentUserId: string,
  childId: string,
  subjectKey: string,
  answers: { conceptInstanceId: string; selectedAnswer: string }[],
): Promise<SessionResult> {
  if (answers.length !== SESSION_SIZE) {
    throw new Error(`Expected ${SESSION_SIZE} answers, received ${answers.length}`)
  }
  return withTransaction(async (client: PoolClient) => {
    await assertChildOwnership(client, parentUserId, childId)

    let correct = 0
    let xpEarned = 0
    let coinsEarned = 0
    const grown = new Map<string, ConceptGrown>()
    let last: Awaited<ReturnType<typeof awardConceptReward>> | undefined
    let levelUp: SessionResult['levelUp'] = null
    let processedCount = 0
    let anchorAttemptId: string | null = null

    for (const a of answers) {
      const inst = await queryOne<{
        answer: string
        concept_slug: string
        name_id: string
        subject_key: string
      }>(
        `SELECT i.answer, i.concept_slug, c.name_id, c.subject_key
         FROM wmi_concept_instances i JOIN wmi_concepts c ON c.slug = i.concept_slug
         WHERE i.id = $1`,
        [a.conceptInstanceId],
        client,
      )
      // Defensive: ignore off-subject or unknown instances.
      if (!inst || inst.subject_key !== subjectKey) continue

      const isC = isCorrectAnswer(inst.answer, a.selectedAnswer)
      if (isC) correct++

      const before = await queryOne<{ best_tier: number }>(
        'SELECT best_tier FROM wmi_concept_progress WHERE child_id = $1 AND concept_slug = $2',
        [childId, inst.concept_slug],
        client,
      )
      const fromTier = before?.best_tier ?? 0

      const attemptRow = await client.query<{ id: string }>(
        `INSERT INTO wmi_attempts
           (child_id, concept_instance_id, mode, selected_answer, is_correct,
            time_taken_ms, revealed_id_translation, looked_up_terms)
         VALUES ($1, $2, 'concept', $3, $4, $5, $6, $7)
         RETURNING id`,
        [childId, a.conceptInstanceId, a.selectedAnswer, isC, null, false, []],
      )
      // First attempt row of this POST anchors the session's gamification
      // events (its id becomes their source_id). Note this is NOT replay
      // protection: a full re-POST inserts brand-new attempt rows, so
      // attempts and events run again — XP/coins stay bounded by the
      // per-instance reward ledger, but quest/streak counters inflate.
      // Request-level dedupe is deferred.
      if (!anchorAttemptId) anchorAttemptId = attemptRow.rows[0]?.id ?? null
      processedCount++

      await upsertConceptProgress(client, childId, inst.concept_slug, isC)
      const reward = await awardConceptReward(client, {
        childId,
        conceptInstanceId: a.conceptInstanceId,
        isCorrect: isC,
      })
      last = reward
      xpEarned += reward.xpEarned
      coinsEarned += reward.coinsEarned
      if (reward.levelUp) levelUp = reward.levelUp

      const after = await queryOne<{ best_tier: number }>(
        'SELECT best_tier FROM wmi_concept_progress WHERE child_id = $1 AND concept_slug = $2',
        [childId, inst.concept_slug],
        client,
      )
      const toTier = after?.best_tier ?? fromTier
      if (toTier > fromTier) {
        const existing = grown.get(inst.concept_slug)
        grown.set(inst.concept_slug, {
          slug: inst.concept_slug,
          nameId: inst.name_id,
          fromTier: existing?.fromTier ?? fromTier,
          toTier,
        })
      }
    }

    // ── Gamification loop (mirrors processScoreSubmission steps 2-6) ──
    // One session = one KONSEP_SESSION_COMPLETED event plus batch markers
    // for answered questions and grown concepts, each idempotent on the
    // first attempt row of the session. Quest evaluation + achievement
    // evaluation run on the SAME transaction client, so a failure rolls
    // the whole commit back.
    const completedQuests: CompletedQuest[] = []
    const unlockedAchievements: UnlockedAchievement[] = []

    if (anchorAttemptId) {
      // `let` narrowing doesn't survive into closures — pin the anchor.
      const sessionAnchorId = anchorAttemptId
      const today = wibDateString(new Date())
      const grownConcepts = [...grown.values()]

      // awardConceptReward already ran ensureProfile + the streak update
      // per answer; read the resulting streak state for the evaluators.
      const streak = await readStreakState(client, childId)

      // Quest slots must exist before they can progress (video path step 2).
      await ensureTodaysQuests(client, childId, today)

      const emitAndEvaluate = async (
        eventType: EventType,
        metadata: Record<string, unknown>,
        incrementBy: number,
      ): Promise<QuestProgressResult[]> => {
        await emitEvent(client, {
          childId,
          eventType,
          sourceType: 'wmi_session',
          sourceId: sessionAnchorId,
          eventDate: today,
          metadata,
        })
        return evaluateForEvent(client, today, {
          childId,
          eventType,
          eventSourceType: 'wmi_session',
          eventSourceId: sessionAnchorId,
          currentStreakDays: streak.currentStreakDays,
          incrementBy,
        })
      }

      const allQuestResults: QuestProgressResult[] = []
      allQuestResults.push(
        ...(await emitAndEvaluate(
          'KONSEP_SESSION_COMPLETED',
          {
            subjectKey,
            questionsAnswered: processedCount,
            correctCount: correct,
            conceptsGrownCount: grownConcepts.length,
          },
          1,
        )),
      )
      allQuestResults.push(
        ...(await emitAndEvaluate(
          'KONSEP_QUESTION_ANSWERED',
          { subjectKey, count: processedCount },
          processedCount,
        )),
      )
      if (grownConcepts.length > 0) {
        allQuestResults.push(
          ...(await emitAndEvaluate(
            'KONSEP_CONCEPT_GROWN',
            { subjectKey, count: grownConcepts.length, slugs: grownConcepts.map((g) => g.slug) },
            grownConcepts.length,
          )),
        )
      }

      // Quest completions append their own ledger rows inside the
      // evaluator (idempotent on the quest instance id); sum the awarded
      // XP/coins for one final profile delta. Dedupe by quest id — the
      // same quest can only complete once per window.
      let bonusXp = 0
      let bonusCoins = 0
      const completedById = new Map<string, QuestProgressResult>()
      for (const q of allQuestResults) {
        if (q.justCompleted && !completedById.has(q.questId)) {
          completedById.set(q.questId, q)
        }
      }
      for (const q of completedById.values()) {
        bonusXp += q.xpAwarded
        bonusCoins += q.coinsAwarded
        completedQuests.push({
          id: q.questId,
          code: q.code,
          title: q.title,
          xpAwarded: q.xpAwarded,
          coinsAwarded: q.coinsAwarded,
        })
      }

      // Achievements run last so the post-session state (progress rows,
      // events, streak) is fully applied before predicates are checked.
      const newAchievements = await evaluateAchievements(client, childId, streak)
      for (const ach of newAchievements) {
        bonusXp += ach.xpAwarded
        unlockedAchievements.push({
          id: ach.id,
          code: ach.code,
          title: ach.title,
          iconKey: ach.iconKey,
          xpAwarded: ach.xpAwarded,
        })
      }

      if (bonusXp > 0 || bonusCoins > 0) {
        const profile = await updateProfileWithDelta(client, {
          childId,
          xpDelta: bonusXp,
          coinDelta: bonusCoins,
          activityDate: today,
        })
        xpEarned += bonusXp
        coinsEarned += bonusCoins
        if (profile.levelUp) {
          levelUp = {
            previousLevel: profile.levelUp.previousLevel,
            currentLevel: profile.levelUp.currentLevel,
            tierName: profile.levelUp.tier.tierName,
          }
        }
        if (last) {
          last = {
            ...last,
            totalXp: profile.after.totalXp,
            coinBalance: profile.after.coinBalance,
            level: profile.after.currentLevel,
            tierName: profile.after.currentTierName,
          }
        }
      }
    }

    return {
      correct,
      total: SESSION_SIZE,
      xpEarned,
      coinsEarned,
      conceptsGrown: [...grown.values()],
      level: last?.level ?? 1,
      tierName: last?.tierName ?? '',
      coinBalance: last?.coinBalance ?? 0,
      levelUp,
      streak: last?.streak ?? { current: 0, longest: 0 },
      completedQuests,
      unlockedAchievements,
    }
  })
}
