import { queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { getWmiQuestionAnswer } from './papers.js'

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
}

function isCorrectAnswer(expected: string, selected: string): boolean {
  return expected.trim().toLowerCase() === selected.trim().toLowerCase()
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

    if (input.mode === 'concept') {
      if (!input.conceptInstanceId) {
        throw new Error('conceptInstanceId is required for concept attempts')
      }
      if (input.questionId) {
        throw new Error('questionId must not be set when mode is concept')
      }
      const inst = await queryOne<{ answer: string; hint_en: string | null; hint_id: string | null }>(
        'SELECT answer, hint_en, hint_id FROM wmi_concept_instances WHERE id = $1',
        [input.conceptInstanceId],
        client,
      )
      if (!inst) throw new Error('Question not found')
      answer = inst.answer
      hint_en = inst.hint_en
      hint_id = inst.hint_id
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
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, concept_instance_id, mode, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, 'concept', $3, $4, $5, $6, $7)
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

    return { is_correct: correct, correct_answer: answer, hint_en, hint_id }
  })
}
