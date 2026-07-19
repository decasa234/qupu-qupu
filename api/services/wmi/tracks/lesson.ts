// Lesson assembly (build) + one-miss commit (Task 7). NOT browser-safe (owns
// SQL, unlike registry.ts/ladder.ts/lessonMix.ts).
import { pool, query, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { wibDateString } from '../../../lib/wib.js'
import { deterministicUuid } from '../../../lib/deterministicUuid.js'
import { getTrack, conceptSlugsInSpineOrder } from './registry.js'
import {
  FOCUS_COUNT,
  RECALL_COUNT,
  GOLD_LEVEL,
  LESSON_PASS_XP,
  LESSON_PASS_COINS,
  effectiveLevel,
  passesFocus,
} from './ladder.js'
import { pickRecall, buildRecallCandidates, type RecallCandidate } from './lessonMix.js'
import {
  applyAnswers,
  lockConceptProgress,
  upsertConceptProgressRows,
  EMPTY_PROGRESS,
} from '../concepts/conceptProgress.js'
import { isCorrectAnswer } from '../answerMatch.js'
import { emitEvent } from '../../gamification/events.js'
import { appendLedger } from '../../gamification/ledger.js'
import { ensureProfile, updateProfileWithDelta } from '../../gamification/profileUpdater.js'
import { updateStreakForActivity } from '../../gamification/streakUpdater.js'
import { ensureTodaysQuests } from '../../gamification/questGenerator.js'
import { evaluateForEvent } from '../../gamification/questEvaluator.js'
import { evaluateAchievements } from '../../gamification/achievementEvaluator.js'

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
): Promise<{ lessonId: string; questions: LessonQuestion[] }> {
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

  const questions = [
    ...focusRows.map((r) => toQuestion(r, false)),
    ...recallRows.map((r) => toQuestion(r, true)),
  ]

  // One-shot session record (Task 3): commitLesson binds to this row so a
  // lesson can only be committed once and only with the instances actually
  // served here — kills replay grinding and instanceId substitution.
  const lessonRow = await queryOne<{ id: string }>(
    `INSERT INTO wmi_track_lessons (child_id, track_id, focus_slug, focus_level, instance_ids)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [childId, trackId, focusSlug, focusLevel, questions.map((q) => q.instanceId)],
  )

  return { lessonId: lessonRow!.id, questions }
}

export async function commitLesson(
  parentUserId: string,
  childId: string,
  trackId: string,
  focusSlug: string,
  lessonId: string,
  answers: Array<{ instanceId: string; selectedAnswer: string; recall: boolean }>,
): Promise<{
  focusCorrect: number
  passed: boolean
  levelBefore: number
  levelAfter: number
  xpEarned: number
  coinsEarned: number
}> {
  requireTrackAndFocus(trackId, focusSlug)

  return withTransaction(async (tx) => {
    await assertChildOwnership(tx, parentUserId, childId)

    // One-shot binding: this lesson must have been built by buildLesson for
    // this exact (child, track), never committed before, and the submitted
    // answers must be exactly (a subset of, no repeats) the instances it
    // actually served — otherwise a client could replay a lesson or swap in
    // easier instanceIds it never saw.
    const lessonRow = await queryOne<{
      focus_slug: string
      focus_level: number
      instance_ids: string[]
      committed_at: string | Date | null
    }>(
      `SELECT focus_slug, focus_level, instance_ids, committed_at
       FROM wmi_track_lessons
       WHERE id = $1 AND child_id = $2 AND track_id = $3
       FOR UPDATE`,
      [lessonId, childId, trackId],
      tx,
    )
    if (!lessonRow || lessonRow.focus_slug !== focusSlug) {
      throw new Error('Lesson not found')
    }
    if (lessonRow.committed_at) {
      throw new Error('Lesson already committed')
    }

    const submittedIds = answers.map((a) => a.instanceId)
    const storedIds = new Set(lessonRow.instance_ids)
    const hasDuplicates = new Set(submittedIds).size !== submittedIds.length
    const hasUnknownInstance = submittedIds.some((id) => !storedIds.has(id))
    // Exact-set enforcement: submitting a duplicate-free subset of known
    // instanceIds used to pass (only hasDuplicates/hasUnknownInstance were
    // checked) — a client could silently drop answers it didn't like and
    // shrink the focus denominator on future multi-concept tracks. The
    // served set size is fixed by buildLesson, so any count mismatch is
    // also a mismatch.
    const hasWrongCount = submittedIds.length !== lessonRow.instance_ids.length
    if (hasDuplicates || hasUnknownInstance || hasWrongCount) {
      throw new Error('Lesson answers mismatch')
    }

    await query(`UPDATE wmi_track_lessons SET committed_at = NOW() WHERE id = $1`, [lessonId], tx)

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

    // Frontier binding (review fix — stale-lesson level grinding): a commit
    // only bumps the level when the lesson being committed was BUILT for the
    // child's current frontier (lessonRow.focus_level === levelBefore + 1).
    // Without this, levelAfter was derived purely from the fresh progress
    // read, ignoring the stored lesson's focus_level entirely — a client
    // could build 5 lessons back-to-back while still at level 0 (buildLesson
    // stamps every one of them focus_level = 1), then commit them one after
    // another: each commit's fresh levelBefore read had already advanced
    // from the PRIOR commit, so passing all 5 walked levels 0→1→2→3→4→5 and
    // fired 5 separate reward grants off nothing but level-1 material. Binding
    // the bump to lessonRow.focus_level === levelBefore + 1 means only a
    // lesson built exactly at the current frontier can advance it; every
    // other stale lesson in the batch now finds focus_level <= levelBefore
    // and no-ops. Gold (L5) replays stay a no-op too: focus_level is pinned
    // at GOLD_LEVEL while levelBefore is already GOLD_LEVEL, so
    // GOLD_LEVEL !== GOLD_LEVEL + 1 and no bump fires. Since the reward
    // block below still gates on levelAfter > levelBefore, stale/replay
    // commits pay out nothing either.
    const levelAfter =
      passed && lessonRow.focus_level === levelBefore + 1
        ? Math.min(GOLD_LEVEL, lessonRow.focus_level)
        : levelBefore
    await query(
      `UPDATE wmi_concept_progress SET level = $3 WHERE child_id = $1 AND concept_slug = $2`,
      [childId, focusSlug, levelAfter],
      tx,
    )

    let xpEarned = 0
    let coinsEarned = 0

    // Streak parity (review fix): EVERY passed commit is real practice —
    // ensureProfile + advancing the streak + stamping today's activity date
    // must run whether or not this particular commit crosses a new level
    // (stale lessons the frontier binding above declined to bump, and gold/
    // L5 replays, still count as a session played). Only the reward-bearing
    // steps — ledger, event, quests, achievements, and the XP/coin portion
    // of the profile delta — stay gated on a GENUINE level-up, matching the
    // existing reward-parity rule. Ordering mirrors chapterTest.ts's
    // gamification block: ensureProfile, then advance the streak (reads the
    // OLD last_activity_date to compute the gap), THEN updateProfileWithDelta
    // stamps last_activity_date = today — that stamp must run even at a 0/0
    // delta, or tomorrow's streak-gap check would see a stale date despite
    // the streak counter already having advanced today.
    if (passed) {
      const today = wibDateString(new Date())
      await ensureProfile(tx, childId)
      const streak = await updateStreakForActivity(tx, childId, today)

      // Reward parity (Plan 3): only a GENUINELY new level fires the grant —
      // replays of an already-cleared level and gold (L5) replays leave
      // levelAfter === levelBefore and grant nothing.
      if (levelAfter > levelBefore) {
        // Deterministic per-(child, concept, level) source id: a level is
        // monotonic and can only be cleared once, so this branch can only
        // legitimately fire once per level anyway — the ledger UNIQUE key is
        // defense-in-depth against any recompute/replay.
        const sourceId = deterministicUuid(`track-lesson:${childId}:${focusSlug}:L${levelAfter}`)
        const led = await appendLedger(tx, {
          childId,
          rewardType: 'TRACK_LESSON_XP',
          sourceType: 'wmi_track_lesson',
          sourceId,
          xpDelta: LESSON_PASS_XP,
          coinDelta: LESSON_PASS_COINS,
          metadata: { trackId, focusSlug, levelAfter },
        })
        if (led.appended) {
          xpEarned = led.xpDelta
          coinsEarned = led.coinDelta
        }

        await emitEvent(tx, {
          childId,
          eventType: 'TRACK_LESSON_LEVEL_UP',
          sourceType: 'wmi_track_lesson',
          sourceId,
          eventDate: today,
          metadata: { trackId, focusSlug, levelAfter },
        })
        await ensureTodaysQuests(tx, childId, today)
        await evaluateForEvent(tx, today, {
          childId,
          eventType: 'TRACK_LESSON_LEVEL_UP',
          eventSourceType: 'wmi_track_lesson',
          eventSourceId: sourceId,
          currentStreakDays: streak.currentStreakDays,
        })

        const newAchievements = await evaluateAchievements(tx, childId, streak)
        for (const ach of newAchievements) {
          xpEarned += ach.xpAwarded
        }
      }

      // Always run the profile delta on a passed commit — even at 0/0 (no
      // level-up this time) it stamps last_activity_date so tomorrow's
      // streak gap stays correct.
      await updateProfileWithDelta(tx, {
        childId,
        xpDelta: xpEarned,
        coinDelta: coinsEarned,
        activityDate: today,
      })
    }

    return {
      focusCorrect: focusResults.filter(Boolean).length,
      passed,
      levelBefore,
      levelAfter,
      xpEarned,
      coinsEarned,
    }
  })
}
