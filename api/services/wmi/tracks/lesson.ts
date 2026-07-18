// Lesson assembly (build) + one-miss commit (Task 7). NOT browser-safe (owns
// SQL, unlike registry.ts/ladder.ts/lessonMix.ts).
import { pool, query, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { getTrack, conceptSlugsInSpineOrder } from './registry.js'
import { FOCUS_COUNT, RECALL_COUNT, GOLD_LEVEL, effectiveLevel, passesFocus } from './ladder.js'
import { pickRecall, buildRecallCandidates, type RecallCandidate } from './lessonMix.js'
import {
  applyAnswers,
  lockConceptProgress,
  upsertConceptProgressRows,
  EMPTY_PROGRESS,
} from '../concepts/conceptProgress.js'
import { isCorrectAnswer } from '../answerMatch.js'

export interface LessonQuestion {
  instanceId: string
  conceptSlug: string
  level: number
  recall: boolean
  bodyId: string
  bodyEn: string
  answerType: string
  choicesId: unknown
  choicesEn: unknown
}

interface InstanceRow {
  id: string
  concept_slug: string
  level: number
  body_id: string
  body_en: string
  answer_type: string
  choices_id: unknown
  choices_en: unknown
}

interface ProgressRow {
  concept_slug: string
  level: number | null
  best_tier: number
  // pg returns a Date for TIMESTAMPTZ columns (not a string) — buildRecallCandidates
  // coerces via `new Date(value)`, which accepts both.
  updated_at: string | Date
}

// Shared guard for both endpoints: the track must exist and focusSlug must
// be one of its spine concepts. Throws the plain sentinels publicError.ts
// maps to their historical status codes (see api/lib/publicError.ts).
function requireTrackAndFocus(trackId: string, focusSlug: string): { spine: string[]; focusIdx: number } {
  const track = getTrack(trackId)
  if (!track) throw new Error('Track not found')
  const spine = conceptSlugsInSpineOrder(track)
  const focusIdx = spine.indexOf(focusSlug)
  if (focusIdx === -1) throw new Error('Concept not in track')
  return { spine, focusIdx }
}

const INSTANCE_SELECT = `id, concept_slug, level, body_id, body_en, answer_type, choices_id, choices_en`

function toQuestion(row: InstanceRow, recall: boolean): LessonQuestion {
  return {
    instanceId: row.id,
    conceptSlug: row.concept_slug,
    level: row.level,
    recall,
    bodyId: row.body_id,
    bodyEn: row.body_en,
    answerType: row.answer_type,
    choicesId: row.choices_id,
    choicesEn: row.choices_en,
  }
}

export async function buildLesson(
  parentUserId: string,
  childId: string,
  trackId: string,
  focusSlug: string,
): Promise<{ questions: LessonQuestion[] }> {
  const { spine, focusIdx } = requireTrackAndFocus(trackId, focusSlug)

  const client = await pool.connect()
  try {
    await assertChildOwnership(client, parentUserId, childId)
  } finally {
    client.release()
  }

  const progress = await query<ProgressRow>(
    `SELECT concept_slug, level, best_tier, updated_at FROM wmi_concept_progress WHERE child_id = $1`,
    [childId],
  )
  const bySlug = new Map(progress.map((p) => [p.concept_slug, p]))

  // The level being PLAYED is the next uncleared level: stored `level` is
  // the highest level already passed (NULL/0 = none yet), so we serve
  // level+1 — capped at GOLD_LEVEL so a maxed-out concept replays L5 forever
  // instead of requesting a level that will never exist.
  const focusProgress = bySlug.get(focusSlug)
  const focusLevel = Math.min(
    GOLD_LEVEL,
    Math.max(1, effectiveLevel(focusProgress?.level ?? null, focusProgress?.best_tier ?? 0) + 1),
  )

  const focusRows = await query<InstanceRow>(
    `SELECT ${INSTANCE_SELECT}
     FROM wmi_concept_instances WHERE concept_slug = $1 AND level = $2
     ORDER BY random() LIMIT $3`,
    [focusSlug, focusLevel, FOCUS_COUNT],
  )
  if (focusRows.length < FOCUS_COUNT) {
    console.error(
      `instance pool too small for ${focusSlug} L${focusLevel}: have ${focusRows.length}, need ${FOCUS_COUNT}`,
    )
    throw new Error('Instance pool too small')
  }

  // Recall candidates: spine concepts strictly BEFORE the focus concept that
  // the child has cleared at least level 1 of, ranked staleness-first
  // (pickRecall, see lessonMix.ts) so the longest-untouched concept surfaces.
  // Candidate construction itself lives in lessonMix.ts (pure, unit-tested)
  // since the only registered track has one concept and never exercises it
  // here.
  const candidates: RecallCandidate[] = buildRecallCandidates(spine, focusIdx, bySlug)
  const recallPicks = pickRecall(candidates, RECALL_COUNT)
  const recallRows: InstanceRow[] = []
  for (const pick of recallPicks) {
    // Recall is served at a level the child has already CLEARED, not the
    // frontier level — pick.level already satisfies level >= 1 by the
    // candidates filter above.
    const level = Math.max(1, Math.min(GOLD_LEVEL, pick.level))
    const rows = await query<InstanceRow>(
      `SELECT ${INSTANCE_SELECT}
       FROM wmi_concept_instances WHERE concept_slug = $1 AND level = $2
       ORDER BY random() LIMIT 1`,
      [pick.slug, level],
    )
    if (rows[0]) recallRows.push(rows[0])
  }

  return {
    questions: [...focusRows.map((r) => toQuestion(r, false)), ...recallRows.map((r) => toQuestion(r, true))],
  }
}

export async function commitLesson(
  parentUserId: string,
  childId: string,
  trackId: string,
  focusSlug: string,
  answers: Array<{ instanceId: string; selectedAnswer: string; recall: boolean }>,
): Promise<{ focusCorrect: number; passed: boolean; levelBefore: number; levelAfter: number }> {
  requireTrackAndFocus(trackId, focusSlug)

  return withTransaction(async (tx) => {
    await assertChildOwnership(tx, parentUserId, childId)

    const ids = answers.map((a) => a.instanceId)
    const rows = await query<{ id: string; concept_slug: string; answer: string }>(
      `SELECT id, concept_slug, answer FROM wmi_concept_instances WHERE id = ANY($1)`,
      [ids],
      tx,
    )
    const byId = new Map(rows.map((r) => [r.id, r]))
    const graded = answers.map((a) => {
      const inst = byId.get(a.instanceId)
      if (!inst) throw new Error('Unknown instance')
      return { ...a, conceptSlug: inst.concept_slug, correct: isCorrectAnswer(inst.answer, a.selectedAnswer) }
    })

    // Focus judgment (one-miss): count answers whose CONCEPT is the focus
    // concept, not the client-reported `recall` flag. buildLesson never
    // serves a focus-slug question as recall (recall candidates are always
    // spine concepts strictly before the focus concept), so filtering by
    // concept slug is both sufficient and immune to a client mislabeling
    // `recall: true` on a focus-slug miss to dodge the one-miss count.
    const focusResults = graded.filter((g) => g.conceptSlug === focusSlug).map((g) => g.correct)
    const passed = passesFocus(focusResults)

    // lockConceptProgress's row shape doesn't include `level` (see
    // conceptProgress.ts) — read + row-lock it here, inside the same
    // transaction, before any writes.
    const focusLevelRows = await query<{ level: number | null; best_tier: number }>(
      `SELECT level, best_tier FROM wmi_concept_progress WHERE child_id = $1 AND concept_slug = $2 FOR UPDATE`,
      [childId, focusSlug],
      tx,
    )
    const levelBefore = effectiveLevel(focusLevelRows[0]?.level ?? null, focusLevelRows[0]?.best_tier ?? 0)

    // Fold every answer (focus + recall) into legacy progress so tiers/
    // recency stay truthful during coexistence, then bump `level` on a pass.
    const touched = [...new Set(graded.map((g) => g.conceptSlug))]
    const locked = await lockConceptProgress(tx, childId, touched)
    const upserts = touched.map((slug) => {
      const prev = locked.get(slug) ?? EMPTY_PROGRESS
      const results = graded.filter((g) => g.conceptSlug === slug).map((g) => g.correct)
      return { conceptSlug: slug, next: applyAnswers(prev, results) }
    })
    await upsertConceptProgressRows(tx, childId, upserts)

    const levelAfter = passed ? Math.min(GOLD_LEVEL, levelBefore + 1) : levelBefore
    await query(
      `UPDATE wmi_concept_progress SET level = $3 WHERE child_id = $1 AND concept_slug = $2`,
      [childId, focusSlug, levelAfter],
      tx,
    )

    return { focusCorrect: focusResults.filter(Boolean).length, passed, levelBefore, levelAfter }
  })
}
