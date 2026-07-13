import { query, queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { listWmiQuestionsForPaper, type WmiPaperRow } from './papers.js'
import type { WmiSubmittedAttempt } from './attempts.js'

export interface WmiExamSessionRow {
  id: string
  child_id: string
  paper_id: string
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  correct_count: number | null
  total_questions: number
  abandoned: boolean
}

export async function startWmiExamSession(
  parentUserId: string,
  childId: string,
  paperId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    const paper = await queryOne<WmiPaperRow>(
      `
        SELECT id, year, grade, round, title, source_url, recommended_duration_min, question_count
        FROM wmi_papers
        WHERE id = $1
      `,
      [paperId],
      client,
    )
    if (!paper) throw new Error('Paper not found')

    // Starting fresh supersedes any resumable session for this child+paper —
    // mark it abandoned so the paper page stops offering "Lanjutkan Ujian"
    // for a run the child explicitly walked away from.
    await query(
      `
        UPDATE wmi_exam_sessions
        SET abandoned = TRUE
        WHERE child_id = $1 AND paper_id = $2
          AND completed_at IS NULL AND abandoned = FALSE
      `,
      [childId, paperId],
      client,
    )

    const session = await queryOne<WmiExamSessionRow>(
      `
        INSERT INTO wmi_exam_sessions (child_id, paper_id, total_questions)
        VALUES ($1, $2, $3)
        RETURNING id, child_id, paper_id, started_at, completed_at, duration_ms,
                  correct_count, total_questions, abandoned
      `,
      [childId, paper.id, paper.question_count],
      client,
    )
    if (!session) throw new Error('Unable to start exam')

    const questions = await listWmiQuestionsForPaper(paper.id, client)
    return { session, paper: { ...paper, questions }, submittedAttempts: [] }
  })
}

export async function getWmiExamSession(
  parentUserId: string,
  childId: string,
  sessionId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    const session = await queryOne<WmiExamSessionRow>(
      `
        SELECT id, child_id, paper_id, started_at, completed_at, duration_ms,
               correct_count, total_questions, abandoned
        FROM wmi_exam_sessions
        WHERE id = $1
      `,
      [sessionId],
      client,
    )
    if (!session || session.child_id !== childId) {
      throw new Error('Sesi ujian ini milik profil anak yang lain')
    }

    const paper = await queryOne<WmiPaperRow>(
      `
        SELECT id, year, grade, round, title, source_url, recommended_duration_min, question_count
        FROM wmi_papers
        WHERE id = $1
      `,
      [session.paper_id],
      client,
    )
    if (!paper) throw new Error('Paper not found')

    const [questions, submittedAttempts] = await Promise.all([
      listWmiQuestionsForPaper(paper.id, client),
      query<WmiSubmittedAttempt>(
        `
          SELECT question_id, selected_answer, is_correct, revealed_id_translation, looked_up_terms
          FROM wmi_attempts
          WHERE session_id = $1
          ORDER BY created_at ASC
        `,
        [session.id],
        client,
      ),
    ])

    return { session, paper: { ...paper, questions }, submittedAttempts }
  })
}

export async function completeWmiExamSession(
  parentUserId: string,
  childId: string,
  sessionId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    const session = await queryOne<WmiExamSessionRow>(
      `
        SELECT id, child_id, paper_id, started_at, completed_at, duration_ms,
               correct_count, total_questions, abandoned
        FROM wmi_exam_sessions
        WHERE id = $1
      `,
      [sessionId],
      client,
    )
    if (!session || session.child_id !== childId) {
      throw new Error('Sesi ujian ini milik profil anak yang lain')
    }

    const score = await queryOne<{ correct_count: string }>(
      `
        SELECT COUNT(*)::text AS correct_count
        FROM wmi_attempts
        WHERE session_id = $1 AND is_correct = TRUE
      `,
      [sessionId],
      client,
    )
    const correctCount = Number(score?.correct_count ?? 0)
    const completed = await queryOne<WmiExamSessionRow>(
      `
        UPDATE wmi_exam_sessions
        SET completed_at = COALESCE(completed_at, NOW()),
            -- Clamp before the ::integer cast: a session resumed after ~25
            -- days would otherwise overflow int4 and 500 on every completion.
            duration_ms = COALESCE(duration_ms, LEAST(GREATEST(0, (EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000)::bigint), 2147483647)::integer),
            correct_count = $2
        WHERE id = $1
        RETURNING id, child_id, paper_id, started_at, completed_at, duration_ms,
                  correct_count, total_questions, abandoned
      `,
      [sessionId, correctCount],
      client,
    )
    if (!completed) throw new Error('Unable to complete exam')
    return completed
  })
}
