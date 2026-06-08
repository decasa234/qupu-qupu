import type { PoolClient } from 'pg'
import { pool, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { isCorrectAnswer } from '../answerMatch.js'
import { upsertConceptProgress } from './conceptProgress.js'
import { awardConceptReward } from '../../gamification/concept.js'

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

      await client.query(
        `INSERT INTO wmi_attempts
           (child_id, concept_instance_id, mode, selected_answer, is_correct,
            time_taken_ms, revealed_id_translation, looked_up_terms)
         VALUES ($1, $2, 'concept', $3, $4, $5, $6, $7)`,
        [childId, a.conceptInstanceId, a.selectedAnswer, isC, null, false, []],
      )

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
    }
  })
}
