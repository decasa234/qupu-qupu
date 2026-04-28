# Score Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the `/videos/:slug` score panel once a child has an attempt; allow parents to edit the saved score with badge re-computation (downgrade allowed); track edits as `is_correction` rows in `score_attempts`.

**Architecture:** Add `is_correction` column on `score_attempts` and rename `user_badge_unlocks.best_correct_answers` → `correct_answers` so the unlock row reflects the current canonical score (no more `GREATEST`). Add a tiny `GET /me/video-scores` endpoint for the detail page to detect "already done" without fetching all progress. Update VideoDetail to render a locked summary that toggles into an edit form pre-filled with the current score. Dedupe `RecentAttemptsCompact` by video so corrections don't double-fill the timeline.

**Tech Stack:** Postgres + node-postgres (server), Express + Joi (routes), React + zustand + axios (client). No test runner configured — verification is `npm run check`, `npm run lint`, and manual smoke.

---

## File Map

**Modified:**
- `db/migrations/0011_score_corrections.sql` (new)
- `db/schema.sql` — sync changes for greenfield installs
- `api/services/member.ts` — rewrite `submitVideoScore`; rename column references; add `getMemberVideoScore`
- `api/routes/member.ts` — add `GET /video-scores`
- `src/types/index.ts` — extend `ScoreAttemptResult`; add `VideoScoreState`
- `src/pages/VideoDetail.tsx` — fetch existing state, locked summary, edit mode
- `src/components/dashboard/RecentAttemptsCompact.tsx` — dedupe by `videoSlug`

No deletes. No new components.

---

## Task 1: Migration + schema sync

**Files:**
- Create: `db/migrations/0011_score_corrections.sql`
- Modify: `db/schema.sql:90-109` (the `score_attempts` and `user_badge_unlocks` blocks)

- [ ] **Step 1: Write the migration**

```sql
-- db/migrations/0011_score_corrections.sql
BEGIN;

ALTER TABLE score_attempts
  ADD COLUMN IF NOT EXISTS is_correction BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE user_badge_unlocks
  RENAME COLUMN best_correct_answers TO correct_answers;

COMMIT;
```

- [ ] **Step 2: Sync `db/schema.sql`**

In the `score_attempts` block (currently lines 90-98), add `is_correction`:

```sql
CREATE TABLE IF NOT EXISTS score_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  score_percentage NUMERIC(5,2) NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
  is_correction BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

In the `user_badge_unlocks` block (currently lines 100-109), rename `best_correct_answers` → `correct_answers`:

```sql
CREATE TABLE IF NOT EXISTS user_badge_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  badge_count INTEGER NOT NULL DEFAULT 0 CHECK (badge_count >= 0),
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, video_id)
);
```

- [ ] **Step 3: Apply the migration manually against your dev DB**

```bash
psql "$DATABASE_URL" -f db/migrations/0011_score_corrections.sql
```

Expected: `BEGIN`, `ALTER TABLE`, `ALTER TABLE`, `COMMIT`.

Verify:

```bash
psql "$DATABASE_URL" -c "\d score_attempts" | grep is_correction
psql "$DATABASE_URL" -c "\d user_badge_unlocks" | grep correct_answers
```

Expected: `is_correction` column present; `correct_answers` (not `best_correct_answers`) in the unlock table.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/0011_score_corrections.sql db/schema.sql
git commit -m "feat(db): score_attempts.is_correction + rename best_correct_answers"
```

---

## Task 2: Rewrite `submitVideoScore` (overwrite-on-edit, audit)

**Files:**
- Modify: `api/services/member.ts:37-172` (the `submitVideoScore` function)

- [ ] **Step 1: Replace the function body**

Open `api/services/member.ts`. Replace the existing `submitVideoScore` (from `export async function submitVideoScore(input: {` down to its closing `}` around line 172) with:

```ts
export async function submitVideoScore(input: {
  userId: string
  childId: string
  videoId: string
  correctAnswers: number
}) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, input.userId, input.childId)

    const video = await queryOne<{
      id: string
      title: string
      number_of_questions: number
      subject_id: string
      subject_name: string
      subject_slug: string
      subject_color_hex: string
    }>(
      `
        SELECT
          v.id,
          v.title,
          v.number_of_questions,
          s.id AS subject_id,
          s.name AS subject_name,
          s.slug AS subject_slug,
          s.color_hex AS subject_color_hex
        FROM videos v
        JOIN subjects s ON s.id = v.subject_id
        WHERE v.id = $1 AND v.is_published = TRUE
      `,
      [input.videoId],
      client,
    )

    if (!video) {
      throw new Error('Video not found')
    }

    if (input.correctAnswers < 0 || input.correctAnswers > video.number_of_questions) {
      throw new Error(`Correct answers must be between 0 and ${video.number_of_questions}`)
    }

    const existingUnlock = await queryOne<{
      id: string
      badge_count: number
      correct_answers: number
    }>(
      `
        SELECT id, badge_count, correct_answers
        FROM user_badge_unlocks
        WHERE child_id = $1 AND video_id = $2
      `,
      [input.childId, input.videoId],
      client,
    )

    const isCorrection = existingUnlock !== null

    const scorePercentage = Number(
      ((input.correctAnswers / video.number_of_questions) * 100).toFixed(2),
    )

    const attempt = await queryOne<{
      id: string
      created_at: string
    }>(
      `
        INSERT INTO score_attempts
          (child_id, video_id, correct_answers, total_questions, score_percentage, is_correction)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
      `,
      [
        input.childId,
        input.videoId,
        input.correctAnswers,
        video.number_of_questions,
        scorePercentage,
        isCorrection,
      ],
      client,
    )

    const matchedRange = await queryOne<{
      id: string
      badge_count: number
    }>(
      `
        SELECT id, badge_count
        FROM video_badge_rules
        WHERE video_id = $1
          AND $2 >= min_correct
          AND (max_correct IS NULL OR $2 <= max_correct)
        ORDER BY badge_count DESC
        LIMIT 1
      `,
      [input.videoId, input.correctAnswers],
      client,
    )

    const earnedBadgeCount = matchedRange?.badge_count ?? 0
    const previousBadgeCount = existingUnlock?.badge_count ?? 0
    const previousCorrectAnswers = existingUnlock?.correct_answers ?? null

    await client.query(
      `
        INSERT INTO user_badge_unlocks
          (child_id, video_id, badge_count, correct_answers, unlocked_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (child_id, video_id)
        DO UPDATE SET
          badge_count = EXCLUDED.badge_count,
          correct_answers = EXCLUDED.correct_answers,
          updated_at = NOW()
      `,
      [input.childId, input.videoId, earnedBadgeCount, input.correctAnswers],
    )

    return {
      attempt: {
        id: attempt?.id ?? '',
        correctAnswers: input.correctAnswers,
        totalQuestions: video.number_of_questions,
        scorePercentage,
        createdAt: attempt?.created_at ?? new Date().toISOString(),
      },
      earnedBadgeCount,
      finalBadgeCount: earnedBadgeCount,
      previousBadgeCount,
      previousCorrectAnswers,
      isCorrection,
      isUpgrade: earnedBadgeCount > previousBadgeCount,
      subject: {
        id: video.subject_id,
        name: video.subject_name,
        slug: video.subject_slug,
        colorHex: video.subject_color_hex,
      },
    }
  })
}
```

Notes:
- The unlock upsert no longer uses `GREATEST` — both `badge_count` and `correct_answers` are overwritten with the new values, which is the new semantic.
- `isUpgrade` may now be `false` even on a correction (e.g. edit lowered the score → badge dropped). The frontend uses `isCorrection` + delta direction for copy.
- `finalBadgeCount` is kept equal to `earnedBadgeCount` for client back-compat (current frontend reads it).

- [ ] **Step 2: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add api/services/member.ts
git commit -m "feat(api): submitVideoScore overwrites unlock + flags corrections"
```

---

## Task 3: Update `getMemberProgress` reads

**Files:**
- Modify: `api/services/member.ts` — `getMemberProgress`'s `videoProgress` CTE and the `getMemberBadges` SELECT

- [ ] **Step 1: Switch `best_attempts` to "latest" semantic**

In `getMemberProgress`, the `videoProgress` query uses a `WITH best_attempts AS (...)` CTE that picks `DISTINCT ON (sa.video_id)` ordered by `score_percentage DESC`. Change the ordering so the latest attempt wins:

Find this block in `getMemberProgress`:

```sql
WITH best_attempts AS (
  SELECT DISTINCT ON (sa.video_id)
    sa.video_id,
    sa.score_percentage AS best_score,
    sa.correct_answers AS best_correct_answers,
    sa.created_at AS latest_attempt_at
  FROM score_attempts sa
  WHERE sa.child_id = $1
  ORDER BY sa.video_id, sa.score_percentage DESC, sa.correct_answers DESC, sa.created_at DESC
)
```

Replace the inner ORDER BY with `created_at DESC` so the latest row per video is selected:

```sql
WITH best_attempts AS (
  SELECT DISTINCT ON (sa.video_id)
    sa.video_id,
    sa.score_percentage AS best_score,
    sa.correct_answers AS best_correct_answers,
    sa.created_at AS latest_attempt_at
  FROM score_attempts sa
  WHERE sa.child_id = $1
  ORDER BY sa.video_id, sa.created_at DESC
)
```

The aliases `best_score` / `best_correct_answers` stay (renaming would touch many call sites). Internally they now mean "current" — leave a one-line comment on the CTE so a future reader is not misled:

```sql
-- best_attempts: latest score_attempts row per video for this child.
-- Aliased as "best_*" for back-compat with the existing read-mapping.
WITH best_attempts AS (
```

- [ ] **Step 2: Update `getMemberBadges` column reference**

In `getMemberBadges`, the inner query reads `ubu.badge_count`. It does **not** reference `best_correct_answers`. The mapping in the result builder also does not reference that column. Confirm:

```bash
grep -n "best_correct_answers" api/services/member.ts
```

Expected: zero matches. (If any remain, replace `best_correct_answers` with `correct_answers`.)

- [ ] **Step 3: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add api/services/member.ts
git commit -m "fix(api): videoProgress reads latest attempt per video"
```

---

## Task 4: Add `getMemberVideoScore` service + `GET /me/video-scores` route

**Files:**
- Modify: `api/services/member.ts` — append a new exported function
- Modify: `api/routes/member.ts` — add a route + Joi schema

- [ ] **Step 1: Add `getMemberVideoScore`**

Append to `api/services/member.ts` after `getMemberBadges`:

```ts
export async function getMemberVideoScore(
  parentUserId: string,
  childId: string,
  videoId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const row = await queryOne<{
      correct_answers: number
      badge_count: number
      total_questions: number
      score_percentage: number
      latest_attempt_at: string
    }>(
      `
        SELECT
          ubu.correct_answers,
          ubu.badge_count,
          v.number_of_questions AS total_questions,
          ROUND((ubu.correct_answers::NUMERIC / v.number_of_questions) * 100, 2) AS score_percentage,
          ubu.updated_at AS latest_attempt_at
        FROM user_badge_unlocks ubu
        JOIN videos v ON v.id = ubu.video_id
        WHERE ubu.child_id = $1 AND ubu.video_id = $2
      `,
      [childId, videoId],
      client,
    )

    if (!row) return null

    return {
      correctAnswers: row.correct_answers,
      totalQuestions: row.total_questions,
      badgeCount: row.badge_count,
      scorePercentage: Number(row.score_percentage),
      latestAttemptAt: row.latest_attempt_at,
    }
  })
}
```

Note: `score_percentage` is recomputed from `correct_answers / total_questions` instead of joined from `score_attempts`, because the latest-attempt row for a corrected score might differ in created_at from the canonical unlock. The unlock's `correct_answers` is source of truth.

- [ ] **Step 2: Add the route**

Open `api/routes/member.ts`. Add this Joi schema near the others:

```ts
const videoScoreLookupSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  videoId: Joi.string().uuid().required(),
}).unknown(true)
```

Add `getMemberVideoScore` to the import from `../services/member.js`:

```ts
import {
  getMemberBadges,
  getMemberProgress,
  getMemberVideoScore,
  submitVideoScore,
} from '../services/member.js'
```

Insert this route handler before `export default router`:

```ts
router.get(
  '/video-scores',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = videoScoreLookupSchema.validate(req.query)

      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }

      const data = await getMemberVideoScore(req.user.id, value.childId, value.videoId)
      res.json({ success: true, data })
    } catch (lookupError: unknown) {
      console.error('Get video score error:', lookupError)
      res.status(400).json({
        success: false,
        error: lookupError instanceof Error ? lookupError.message : 'Unable to load score',
      })
    }
  },
)
```

- [ ] **Step 3: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 4: Smoke the endpoint**

In another terminal with the dev server running (`npm run dev`):

```bash
curl -sS -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/me/video-scores?childId=<CHILD_UUID>&videoId=<VIDEO_UUID>" | jq .
```

Expected: `{ "success": true, "data": null }` for an unattempted video; populated object for an attempted one.

- [ ] **Step 5: Commit**

```bash
git add api/services/member.ts api/routes/member.ts
git commit -m "feat(api): GET /me/video-scores for VideoDetail lookup"
```

---

## Task 5: Update types

**Files:**
- Modify: `src/types/index.ts:85-103` (`ScoreAttemptResult`); add a new interface

- [ ] **Step 1: Extend `ScoreAttemptResult`**

Replace the existing `ScoreAttemptResult` interface with:

```ts
export interface ScoreAttemptResult {
  attempt: {
    id: string
    correctAnswers: number
    totalQuestions: number
    scorePercentage: number
    createdAt: string
  }
  earnedBadgeCount: number
  finalBadgeCount: number
  previousBadgeCount: number
  previousCorrectAnswers: number | null
  isUpgrade: boolean
  isCorrection: boolean
  subject: {
    id: string
    name: string
    slug: string
    colorHex: string
  }
}
```

- [ ] **Step 2: Add `VideoScoreState`**

Anywhere in the file (suggest after `ScoreAttemptResult`):

```ts
export interface VideoScoreState {
  correctAnswers: number
  totalQuestions: number
  badgeCount: number
  scorePercentage: number
  latestAttemptAt: string
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): ScoreAttemptResult correction fields + VideoScoreState"
```

---

## Task 6: VideoDetail — fetch existing state + locked summary

**Files:**
- Modify: `src/pages/VideoDetail.tsx`

- [ ] **Step 1: Add state for "existing score" + "edit mode"**

Below the existing `useState` declarations (around line 31), add:

```tsx
const [existingScore, setExistingScore] = useState<VideoScoreState | null>(null)
const [editing, setEditing] = useState(false)
```

Update the import block to include the new type:

```tsx
import type { ScoreAttemptResult, VideoDetail, VideoScoreState } from '../types'
```

- [ ] **Step 2: Fetch existing score on auth + child + video resolution**

Add a new effect after the existing video-load effect (around line 55):

```tsx
useEffect(() => {
  if (!isAuthenticated || !activeChildId || !video) {
    setExistingScore(null)
    return
  }

  let cancelled = false

  async function lookup() {
    try {
      const response = await api.get('/me/video-scores', {
        params: { childId: activeChildId, videoId: video!.id },
      })
      if (!cancelled) {
        const data = response.data?.data as VideoScoreState | null
        setExistingScore(data)
        if (data) setScore(data.correctAnswers)
      }
    } catch (lookupError) {
      console.error('Failed to look up existing score:', lookupError)
      if (!cancelled) setExistingScore(null)
    }
  }

  void lookup()

  return () => {
    cancelled = true
  }
}, [isAuthenticated, activeChildId, video])
```

Pre-filling `score` with `data.correctAnswers` makes the slider land on the correct value when the parent enters edit mode.

- [ ] **Step 3: After a successful submit, refresh `existingScore`**

In `submitScore`, on success (right after `setResult(...)`), update `existingScore` so the next "Ubah" round shows the new value. Locate this line:

```tsx
setResult(response.data.data)
clearPendingScore()
```

Replace with:

```tsx
const submitted = response.data.data as ScoreAttemptResult
setResult(submitted)
clearPendingScore()
setExistingScore({
  correctAnswers: submitted.attempt.correctAnswers,
  totalQuestions: submitted.attempt.totalQuestions,
  badgeCount: submitted.earnedBadgeCount,
  scorePercentage: submitted.attempt.scorePercentage,
  latestAttemptAt: submitted.attempt.createdAt,
})
setEditing(false)
```

- [ ] **Step 4: Render the locked summary when not editing and not in fresh-result mode**

Find the score panel block, currently:

```tsx
{!result && (
  <form onSubmit={handleSubmit} ...>
    ...
  </form>
)}
```

Change the condition so the form only shows for fresh entry OR when the parent has clicked "Ubah skor":

```tsx
{!result && (existingScore === null || editing) && (
  <form onSubmit={handleSubmit} ...>
    ...
  </form>
)}

{!result && existingScore !== null && !editing && (
  <div className="space-y-4">
    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
      Sudah selesai
    </div>
    <div className="font-display text-5xl font-extrabold leading-none text-qupu-brand-blue">
      {existingScore.correctAnswers}
      <span className="text-2xl text-qupu-muted">/{existingScore.totalQuestions}</span>
    </div>
    <div className="text-xs font-semibold text-qupu-muted">
      {existingScore.scorePercentage}% benar · {existingScore.badgeCount}× badge {video.subject.name}
    </div>
    {existingScore.badgeCount > 0 && (
      <div className="flex items-center -space-x-2">
        {Array.from({ length: Math.min(existingScore.badgeCount, 5) }).map((_, idx) => (
          <BadgeCurve key={idx} color={video.subject.colorHex} size={36} />
        ))}
        {existingScore.badgeCount > 5 && (
          <span className="ml-1 inline-flex h-9 items-center rounded-full bg-white px-2 font-display text-xs font-extrabold text-qupu-brand-blue shadow-sm">
            +{existingScore.badgeCount - 5}
          </span>
        )}
      </div>
    )}
    <button
      type="button"
      onClick={() => {
        setEditing(true)
        setSubmitError('')
      }}
      className="inline-flex items-center gap-2 text-sm font-bold text-qupu-brand-orange underline-offset-4 hover:underline"
    >
      <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
      Ubah skor
    </button>
  </div>
)}
```

- [ ] **Step 5: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/VideoDetail.tsx
git commit -m "feat(video): locked score summary with Ubah skor toggle"
```

---

## Task 7: VideoDetail — edit-mode label + correction copy

**Files:**
- Modify: `src/pages/VideoDetail.tsx`

- [ ] **Step 1: Submit button label**

Find the submit button:

```tsx
{saving ? 'Menyimpan...' : `Simpan skor ${score}/${video.numberOfQuestions}`}
```

Replace with:

```tsx
{saving
  ? 'Menyimpan...'
  : editing
    ? `Update skor ${score}/${video.numberOfQuestions}`
    : `Simpan skor ${score}/${video.numberOfQuestions}`}
```

- [ ] **Step 2: Add a hint above the slider when editing**

Find the slider's leading paragraph:

```tsx
<p className="mt-2 text-xs text-qupu-muted">
  Geser untuk masukkan jumlah jawaban benar (0 – {video.numberOfQuestions}).
</p>
```

Add a sibling note below it that only shows in edit mode:

```tsx
<p className="mt-2 text-xs text-qupu-muted">
  Geser untuk masukkan jumlah jawaban benar (0 – {video.numberOfQuestions}).
</p>
{editing && (
  <p className="mt-1 text-[11px] font-semibold text-qupu-brand-orange">
    Mengubah skor yang sudah tersimpan.
  </p>
)}
```

- [ ] **Step 3: Update the result-card copy to use `isCorrection`**

Find the result card block, specifically this line:

```tsx
<div className="text-sm font-semibold text-qupu-brand-blue">
  {result.isUpgrade
    ? `Naik dari ${result.previousBadgeCount} badge — kerja bagus!`
    : `Sudah pernah dapat ${result.previousBadgeCount} badge dari video ini.`}
</div>
```

Replace with:

```tsx
<div className="text-sm font-semibold text-qupu-brand-blue">
  {!result.isCorrection
    ? `Yes! ${result.earnedBadgeCount}× badge baru.`
    : result.earnedBadgeCount > result.previousBadgeCount
      ? `Skor naik. ${result.previousBadgeCount}× → ${result.earnedBadgeCount}× badge!`
      : result.earnedBadgeCount < result.previousBadgeCount
        ? `Skor di-koreksi. ${result.previousBadgeCount}× → ${result.earnedBadgeCount}× badge.`
        : `Skor di-update: ${result.attempt.correctAnswers}/${result.attempt.totalQuestions} benar.`}
</div>
```

- [ ] **Step 4: Replace the "Coba skor lain" button**

The current button under the result card resets state for a fresh attempt — semantically wrong now. Find it:

```tsx
<button
  type="button"
  onClick={() => {
    setResult(null)
    setScore(0)
  }}
  className="..."
>
  <i className="fa-solid fa-rotate-left text-sm" aria-hidden="true" />
  Coba skor lain
</button>
```

Replace with:

```tsx
<button
  type="button"
  onClick={() => {
    setResult(null)
    setEditing(true)
    setScore(existingScore?.correctAnswers ?? 0)
  }}
  className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-orange transition-colors hover:bg-qupu-brand-orange hover:text-white"
>
  <i className="fa-solid fa-pen-to-square text-sm" aria-hidden="true" />
  Ubah skor
</button>
```

- [ ] **Step 5: Typecheck + lint**

```bash
npm run check
npm run lint
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/VideoDetail.tsx
git commit -m "feat(video): edit-mode label + correction-aware result copy"
```

---

## Task 8: RecentAttemptsCompact dedupe by video

**Files:**
- Modify: `src/components/dashboard/RecentAttemptsCompact.tsx`

- [ ] **Step 1: Dedupe before slicing**

Find:

```tsx
{attempts.slice(0, 5).map((attempt) => (
```

Replace with a derived list that keeps the latest row per `videoSlug`. Add right above the JSX `return`:

```tsx
const dedupedAttempts: RecentAttempt[] = []
const seen = new Set<string>()
for (const attempt of attempts) {
  if (seen.has(attempt.videoSlug)) continue
  seen.add(attempt.videoSlug)
  dedupedAttempts.push(attempt)
  if (dedupedAttempts.length >= 5) break
}
```

(The server already orders by `created_at DESC`, so the first occurrence per slug is the latest.)

Then change the JSX to iterate `dedupedAttempts`:

```tsx
{dedupedAttempts.map((attempt) => (
```

And change the empty-state guard from `attempts.length === 0` → keep using `attempts.length === 0` (correct: zero raw rows means truly empty).

- [ ] **Step 2: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/RecentAttemptsCompact.tsx
git commit -m "fix(dashboard): dedupe recent attempts by video slug"
```

---

## Task 9: Manual smoke + final review

- [ ] **Step 1: Run dev**

```bash
npm run dev
```

- [ ] **Step 2: Smoke flow A — fresh attempt**

1. Log in as a parent with at least one child profile, no attempts on a target video.
2. Navigate to `/videos/<slug>` for that video.
3. Confirm the slider is shown with default 0.
4. Slide to a passing score, click "Simpan skor X/N". Result card shows.
5. Reload `/videos/<slug>`. Confirm the locked summary is shown with that score and badge count.

- [ ] **Step 3: Smoke flow B — correction (downgrade)**

1. From the locked summary, click "Ubah skor". Slider should appear pre-filled with the saved correctAnswers.
2. Slide to a **lower** value that lands in a lower badge tier. Click "Update skor X/N".
3. Result card should read "Skor di-koreksi. {prev}× → {new}× badge." Reload — locked summary now shows the lower score + badge.
4. Open `/dashboard`. Recent attempts should show this video **once** (not twice).
5. Open `/badges`. The subject's earned count should reflect the new badge count.

- [ ] **Step 4: Smoke flow C — correction (upgrade)**

1. From the lowered state, click "Ubah skor" again. Set a higher value. Click "Update".
2. Result reads "Skor naik. {prev}× → {new}× badge!".

- [ ] **Step 5: Smoke flow D — no-op edit**

1. Click "Ubah skor", do not change the slider, click "Update".
2. Result reads "Skor di-update: {correct}/{total} benar."

- [ ] **Step 6: Smoke flow E — guards**

1. Logged out → confirm submit triggers AuthModal as before.
2. Authenticated, no active child → confirm ChildNamePrompt opens.

- [ ] **Step 7: Final lint pass**

```bash
npm run lint
```

Expected: no issues.

- [ ] **Step 8: No commit** — this task is verification only.

---

## Self-Review Notes

**Spec coverage:**
- Data model (`is_correction`, rename column, no GREATEST) → Task 1, Task 2.
- Backend overwrite-on-edit + audit → Task 2.
- Latest-wins for read paths → Task 3.
- "Already done" detection → Task 4 (endpoint), Task 6 (consumer).
- Locked summary + "Ubah skor" reveal → Task 6.
- Edit-mode label + correction copy → Task 7.
- Recent-attempts dedupe → Task 8.
- Toast / feedback variants → Task 7 Step 3.
- Migration + greenfield schema sync → Task 1.

**Type consistency check:**
- `ScoreAttemptResult` (Task 5) is consumed by VideoDetail's `submitScore` and result card (Tasks 6, 7). Field names match.
- `VideoScoreState` (Task 5) is shaped to match the route response in Task 4.
- `RecentAttempt` is unchanged (Task 8 only filters; no new fields needed).

**Outstanding concerns:**
- The CTE alias `best_*` is left in place to keep blast radius small. A follow-up rename to `latest_*` would be a pure rename PR with no behavior change.
- `finalBadgeCount` in the API response duplicates `earnedBadgeCount` in the new world. Kept for client back-compat. A future cleanup task can drop it from both ends together.
