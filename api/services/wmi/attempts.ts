import { queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { wibDateString } from '../../lib/wib.js'
import { awardConceptReward, type ConceptRewardResult } from '../gamification/concept.js'
import { emitEvent } from '../gamification/events.js'
import { ensureTodaysQuests } from '../gamification/questGenerator.js'
import { evaluateForEvent } from '../gamification/questEvaluator.js'
import { getWmiQuestionAnswer } from './papers.js'
import { isCorrectAnswer } from './answerMatch.js'
import { upsertConceptProgress } from './concepts/conceptProgress.js'

export interface WmiAttemptInput {
  childId: string
  questionId?: string
  conceptInstanceId?: string
  mode: 'drill' | 'exam' | 'concept'
  sessionId?: string | null
  selectedAnswer: string
  timeTakenMs?: number | null
  revealedIdTranslation?: boolean
  lookedUpTerms?: string[]
}

export interface WmiSubmittedAttempt {
  question_id: string
  selected_answer: string
  is_correct: boolean
  revealed_id_translation: boolean
  looked_up_terms: string[]
}

export interface WmiAttemptResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
  // Present only for concept attempts — XP/coins/streak granted for this answer.
  gamification?: ConceptRewardResult
}

export async function submitWmiAttempt(
  parentUserId: string,
  input: WmiAttemptInput,
): Promise<WmiAttemptResult> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, input.childId)

    let answer: string
    let hint_en: string | null
    let hint_id: string | null
    let hint_steps_en: string[] | null
    let hint_steps_id: string[] | null
    let conceptSlug: string | null = null

    if (input.mode === 'concept') {
      if (!input.conceptInstanceId) {
        throw new Error('conceptInstanceId is required for concept attempts')
      }
      if (input.questionId) {
        throw new Error('questionId must not be set when mode is concept')
      }
      const inst = await queryOne<{
        answer: string
        hint_en: string | null
        hint_id: string | null
        hint_steps_en: string[] | null
        hint_steps_id: string[] | null
        concept_slug: string
      }>(
        'SELECT answer, hint_en, hint_id, hint_steps_en, hint_steps_id, concept_slug FROM wmi_concept_instances WHERE id = $1',
        [input.conceptInstanceId],
        client,
      )
      if (!inst) throw new Error('Question not found')
      answer = inst.answer
      hint_en = inst.hint_en
      hint_id = inst.hint_id
      hint_steps_en = inst.hint_steps_en
      hint_steps_id = inst.hint_steps_id
      conceptSlug = inst.concept_slug
    } else {
      if (!input.questionId) {
        throw new Error('questionId is required for drill/exam attempts')
      }
      if (input.conceptInstanceId) {
        throw new Error('conceptInstanceId must not be set when mode is drill/exam')
      }
      const question = await getWmiQuestionAnswer(input.questionId, client)
      if (!question) throw new Error('Question not found')
      answer = question.answer
      hint_en = question.hint_en
      hint_id = question.hint_id
      hint_steps_en = null
      hint_steps_id = null

      if (input.mode === 'exam') {
        if (!input.sessionId) throw new Error('sessionId is required for exam attempts')
        const session = await queryOne<{ id: string; child_id: string; completed_at: string | null }>(
          'SELECT id, child_id, completed_at FROM wmi_exam_sessions WHERE id = $1',
          [input.sessionId],
          client,
        )
        if (!session || session.child_id !== input.childId) {
          throw new Error('Sesi ujian ini milik profil anak yang lain')
        }
        if (session.completed_at) throw new Error('Exam session already completed')
      }
    }

    const correct = isCorrectAnswer(answer, input.selectedAnswer)
    const terms = input.lookedUpTerms ?? []
    let conceptAttemptId: string | null = null

    if (input.mode === 'exam') {
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, question_id, mode, session_id, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (session_id, question_id)
          WHERE mode = 'exam' AND session_id IS NOT NULL
          DO UPDATE SET
            selected_answer = EXCLUDED.selected_answer,
            is_correct = EXCLUDED.is_correct,
            time_taken_ms = EXCLUDED.time_taken_ms,
            revealed_id_translation = EXCLUDED.revealed_id_translation,
            looked_up_terms = EXCLUDED.looked_up_terms,
            created_at = NOW()
        `,
        [
          input.childId,
          input.questionId,
          input.mode,
          input.sessionId,
          input.selectedAnswer,
          correct,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          terms,
        ],
      )
    } else if (input.mode === 'concept') {
      // RETURNING id: the attempt row anchors this answer's gamification
      // event below (its id becomes the event's source_id).
      const attemptRow = await client.query<{ id: string }>(
        `
          INSERT INTO wmi_attempts
            (child_id, concept_instance_id, mode, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, 'concept', $3, $4, $5, $6, $7)
          RETURNING id
        `,
        [
          input.childId,
          input.conceptInstanceId,
          input.selectedAnswer,
          correct,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          terms,
        ],
      )
      conceptAttemptId = attemptRow.rows[0]?.id ?? null
    } else {
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, question_id, mode, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, 'drill', $3, $4, $5, $6, $7)
        `,
        [
          input.childId,
          input.questionId,
          input.selectedAnswer,
          correct,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          terms,
        ],
      )
    }

    // Concept (konsep) attempts feed the gamification economy: streak on any
    // answer, XP + coins on a correct one. Runs in this same transaction so a
    // failed grant rolls back the attempt insert too.
    let gamification: ConceptRewardResult | undefined
    if (input.mode === 'concept') {
      // The upsert reports the tier before/after this answer: the base XP is
      // priced at the PRE-answer tier, and a rise grants the one-time
      // tier-up bonus inside awardConceptReward (ledger-idempotent).
      const tierChange = await upsertConceptProgress(
        client,
        input.childId,
        conceptSlug as string,
        correct,
      )
      gamification = await awardConceptReward(client, {
        childId: input.childId,
        conceptInstanceId: input.conceptInstanceId as string,
        isCorrect: correct,
        conceptSlug: conceptSlug as string,
        tierBefore: tierChange.prevTier,
        tierAfter: tierChange.newTier,
      })

      // Latihan Campur quest wire: ANY graded drill answer progresses the
      // konsep daily quests (e.g. konsep_answers_10 — "Jawab N soal"),
      // mirroring the session commit, which counts every graded answer in its
      // KONSEP_QUESTION_ANSWERED emission. XP/coins stay correct-only (that's
      // awardConceptReward's job above). Idempotent on the attempt row
      // inserted above (each POST creates a fresh row — same accepted
      // trade-off as the session path: no request-level dedupe, but the
      // per-instance reward ledger keeps XP/coins bounded). Quests only —
      // achievements are NOT evaluated per drill answer (too hot a path);
      // they catch up on the next session commit or chapter-test pass.
      // Completion pays NOTHING here (P2.2 claim ritual): the evaluator only
      // stamps completed_at; the reward grants on POST /me/quests/:id/claim.
      if (conceptAttemptId) {
        const today = wibDateString(new Date())
        await emitEvent(client, {
          childId: input.childId,
          eventType: 'KONSEP_QUESTION_ANSWERED',
          sourceType: 'wmi_attempt',
          sourceId: conceptAttemptId,
          eventDate: today,
          metadata: { conceptSlug, mode: 'drill', count: 1 },
        })
        // Quest slots must exist before they can progress.
        await ensureTodaysQuests(client, input.childId, today)
        await evaluateForEvent(client, today, {
          childId: input.childId,
          eventType: 'KONSEP_QUESTION_ANSWERED',
          eventSourceType: 'wmi_attempt',
          eventSourceId: conceptAttemptId,
          currentStreakDays: gamification.streak.current,
          incrementBy: 1,
        })
      }
    }

    return {
      is_correct: correct,
      correct_answer: answer,
      hint_en,
      hint_id,
      hint_steps_en,
      hint_steps_id,
      gamification,
    }
  })
}
