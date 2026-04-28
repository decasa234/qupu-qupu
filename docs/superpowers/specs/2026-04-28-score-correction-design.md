# Score Correction & "Already Done" Lock — Design

**Date:** 2026-04-28
**Status:** Approved (brainstorming complete)
**Goal:** Once a child has an attempt for a video, parents can no longer "do it again" — but they can edit the recorded score. Edits recompute the badge from the new score (downgrade allowed) and are tracked as corrections in the audit log.

---

## Context

Currently, `submitVideoScore` (`api/services/member.ts`) accepts repeated POSTs and uses `GREATEST(...)` to ensure badges only ever upgrade. The score-input UI on `/videos/:slug` gives no feedback that the child has already completed the video, so a parent might keep nudging the slider, or worse, accidentally re-enter a wrong score and over-credit the child.

This spec replaces the "many attempts, only upgrade" model with "single canonical score per (child, video), edits allowed, badge follows the latest score."

---

## Core decisions

| Decision | Choice |
|---|---|
| When parent edits down (e.g. 50/60 → 30/60) | **Recompute badge from new score** — downgrade allowed. The latest entry is source of truth. |
| UI for "already done" state | **Slider hidden** by default. Show summary card. "Ubah skor" link reveals the slider. |
| Audit trail | **Insert-per-edit** in `score_attempts`. New `is_correction BOOLEAN` flag distinguishes corrections from the first attempt. |

---

## Data model

### Migration `db/migrations/00XX_score_corrections.sql`

```sql
ALTER TABLE score_attempts
  ADD COLUMN is_correction BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE user_badge_unlocks
  RENAME COLUMN best_correct_answers TO correct_answers;
```

- `db/schema.sql` updated to match (greenfield installs include both changes).
- No data backfill: existing `best_correct_answers` values are interpreted as the "current" score going forward. Lossy only for children who already submitted multiple times under the old flow — acceptable since the latest GREATEST value is still a valid current score.
- `score_attempts.is_correction` defaults `FALSE` — existing rows are correctly interpreted as first attempts.

### Semantic shift

`user_badge_unlocks` is no longer a "best ever" cache; it's the canonical current score for `(child_id, video_id)`. The unique index on `(child_id, video_id)` is kept. Reads are unchanged.

---

## API

### `POST /me/scores` (extended)

**Request:** `{ childId, videoId, correctAnswers }` (unchanged shape).

**Logic:**
1. Look up existing `user_badge_unlocks` for `(child, video)` — call this `existing`.
2. Insert into `score_attempts` with `is_correction = (existing IS NOT NULL)`.
3. Compute `matchedRange` from `video_badge_rules` for the new `correctAnswers`.
4. Upsert `user_badge_unlocks`:
   - `correct_answers = $newCorrect` (overwrite, no `GREATEST`)
   - `badge_count = matchedRange.badge_count` (overwrite, no `GREATEST`)
   - `updated_at = NOW()`

**Response (extended):**
```json
{
  "attempt": { "id", "correctAnswers", "totalQuestions", "scorePercentage", "createdAt" },
  "earnedBadgeCount": <new badge count>,
  "previousBadgeCount": <int, 0 if first attempt>,
  "previousCorrectAnswers": <int|null, null if first attempt>,
  "finalBadgeCount": <new badge count>,
  "isCorrection": <bool>,
  "isUpgrade": <new > previous>,
  "subject": { ... }
}
```

`finalBadgeCount === earnedBadgeCount` always — kept in the response for client-side back-compat.

### Read paths affected

- `getMemberProgress` — `videoProgress` `WITH best_attempts` CTE: change ordering from `score_percentage DESC` to `created_at DESC` so the "current" score reflects the latest correction.
- `recentAttempts` — keep raw timeline as today, but the dashboard's `RecentAttemptsCompact` (4 rows) **dedupes by `video_slug`, keeping the latest row** so an edited entry doesn't double-fill the list.
- `getMemberBadges` — read from `user_badge_unlocks` as today; values now reflect latest, not best.

---

## UI

### `src/pages/VideoDetail.tsx` — score panel

**State source:** Read existing `(activeChild, video)` row from `/me/progress` `videoProgress` (already fetched on dashboard / catalog refreshes), or refetch on mount. No new endpoint.

**Two render branches:**

**A) No existing attempt (fresh):** unchanged from today.
```
INPUT SKOR
Skor {child.name}
[slider 0..total]
[Akan dapat: N badge {subject}]
[Simpan skor 0/N]
```

**B) Existing attempt (already done):**
```
INPUT SKOR · Sudah selesai
{correct}/{total} benar · {badgeCount}× badge {subject}
↳ Ubah skor   <- text link, reveals slider on click
```

When the link is clicked, the slider appears pre-filled with `correct`, badge preview shows the projected badge count for the slider's value, and the submit button reads **"Update skor"** (instead of "Simpan skor"). A small subtitle below the slider reads "Mengubah skor yang sudah tersimpan." so the parent knows this is a correction.

### Toast / feedback after submit

| Case | Message |
|---|---|
| First attempt (`!isCorrection`) | "Berhasil! {child} dapat {earned}× badge." (current copy) |
| Correction, same badge | "Skor di-update: {correct}/{total} benar." |
| Correction, badge upgraded (`earned > previous`) | "Skor naik. {previous}× → {earned}× badge!" |
| Correction, badge downgraded (`earned < previous`) | "Skor di-koreksi. {previous}× → {earned}× badge." |

### `RecentAttemptsCompact` (dashboard)

Apply dedupe-by-video-slug client-side after fetch. Cheap; the array is already capped at ~6 items server-side. Keep server response as-is to avoid breaking other consumers.

### Rapor / `/report`

No copy change required. The "video breakdown" already shows per-video best score & badge — those values now reflect the latest correction, which is the intended semantic.

### No-active-child / not-authenticated

Unchanged. The score panel still routes to the existing AuthCard / child-switcher prompt.

---

## Out of scope

- Per-edit admin audit UI for `is_correction` rows. Column is added for future use; no admin view in this iteration.
- Allowing the **child** (as opposed to parent) to retake a video. Out of scope; the system has no child-account model.
- "Reset to fresh attempt" affordance (delete the unlock and let the parent re-enter from zero). Not requested; correction flow covers it.
- Server-side rate limiting on score corrections. The existing endpoint already requires authenticated parent + ownership of the child, which is sufficient.

---

## Risk register

1. **Mid-flight users with multiple `score_attempts` rows for the same video** — after migration, the dashboard's `WITH best_attempts ORDER BY created_at DESC` will pick the **latest** attempt, not the highest. This is the new desired semantic. No data loss; just a behavior shift on read for these legacy rows. Acceptable.
2. **Schema rename of `best_correct_answers`** — any external consumer outside this repo would break. Confirm none exist (Vercel deploy + this codebase only).
3. **`finalBadgeCount` semantic in API response** — kept equal to `earnedBadgeCount` to avoid a typed-client breakage. Future cleanup can remove the duplicate field.

---

## Acceptance

- Parent on `/videos/:slug` for a child who already completed sees the locked summary, not the slider.
- Clicking "Ubah skor" reveals the slider pre-filled with the current correct count.
- Submitting a lower score downgrades the badge in `/dashboard`, `/badges`, `/report` after the next read.
- A correction inserts a `score_attempts` row with `is_correction = TRUE`.
- The dashboard's recent-attempts list shows the corrected entry once, not twice.
- Toast copy varies based on first-attempt vs correction (same / up / down).
