---
title: "feat: YouTube Channel Bulk Import Picker"
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-youtube-channel-bulk-import-requirements.md
---

# feat: YouTube Channel Bulk Import Picker

## Overview

Admins can browse the QUPU YouTube channel inside the admin app, multi-select videos that aren't already in the catalog, and create draft entries in one server round-trip. Drafts persist with `is_published = false` and YouTube-derived metadata only; QUPU-specific fields (`subject_id`, `age_group_id`, `number_of_questions`, badge ranges) are completed later via the existing AdminVideos editor before publishing. The change spans the database (four new migrations: nullable QUPU-fields + publish CHECK, UNIQUE index on `youtube_video_id`, channel-listing cache table, and per-admin rate-limit table), the validation/service layer (conditional split inside `normalizeVideoInput`), the admin video Joi schema, two new admin endpoints (channel listing + bulk import), one new admin page (the picker), and the existing admin catalog page (draft awareness).

## Problem Frame

Adding a video to the QUPU catalog today requires an admin to copy each YouTube URL by hand from the channel and paste it into the AdminVideos form one video at a time. The single-video metadata fetcher in `api/services/youtubeImport.ts` helps with one URL at a time but offers no way to see "what's already on the channel that I haven't imported yet". As the back-catalog grows, this becomes the slowest part of catalog seeding and risks duplicate or missed videos. (See origin: `docs/brainstorms/2026-04-27-youtube-channel-bulk-import-requirements.md`.)

## Requirements Trace

- R1. Picker view at `/admin/videos/import` lists every video on `@qupuid`, paged, oldest-first → Units 3, 5
- R2. Channel handle in env var; new endpoints under `requireAdmin` → Units 3, 4
- R3. Each row shows thumbnail, title, publish date, "in catalog" indicator → Units 3, 5
- R4. "Already in catalog" includes drafts and published; UNIQUE index enforces dedupe → Units 1, 3, 4
- R5. Multi-select → "Import N as drafts" → best-effort per-row response → Units 4, 5
- R6. Drafts have NULL QUPU-fields (subject, age group, number of questions) and zero badge ranges; YouTube strings sanitized; slug uses `-{youtube_video_id}` suffix on collision → Units 1, 2, 4
- R7. Validation split lives in `normalizeVideoInput` conditional on `is_published`; CHECK constraint backstops the invariant; publish re-runs full validation with structured error → Units 1, 2, 6
- R8. Public catalog endpoints continue filtering `is_published = true` (no change — verified at `api/services/videos.ts:178,238`) → no implementation unit
- R9. Admin catalog list distinguishes drafts via per-row badge + filter chip → Unit 6

## Scope Boundaries

- Out: auto-sync / scheduled polling of the channel
- Out: updating already-imported videos when YouTube metadata changes upstream
- Out: importing playlists other than the channel's uploads playlist
- Out: multi-channel support
- Out: handling videos that became private/unlisted/deleted on YouTube post-import
- Out: re-importing existing rows (drafts or published)
- Out: a single-click "open the prefilled create form" alternative entry point
- Out: cross-page selection persistence in the picker (selections scoped to current page in v1)
- Out: setting up a test runner — none configured in this repo (CLAUDE.md). Test scenarios are expressed as manual verification recipes.

## Context & Research

### Relevant Code and Patterns

- `api/middleware/auth.ts` — `authenticateToken` + `requireAdmin`. Mounted on `/api/admin/*` at `api/routes/admin.ts:46`. New endpoints inherit this gate by living in the same router.
- `api/services/youtubeImport.ts` — single-video metadata fetch via `videos.list` using `YOUTUBE_API_KEY`. The new channel listing reuses the same key; the existing `fetchYouTubeMetadata` is reused inside the bulk-import service. Note: it returns `{ videoId, title, description, thumbnailUrl, publishedAt, channelTitle }` — no `youtubeUrl`; the bulk-import path constructs `https://www.youtube.com/watch?v=${videoId}` from the videoId.
- `api/services/videos.ts` — `normalizeVideoInput` (validation), `createVideo`, `updateVideo`, public-list filter (`v.is_published = TRUE` at lines 178 and 238). The validation split lives here. **Note:** `VIDEO_SELECT` (lines 80-83) currently uses `INNER JOIN subjects` and `INNER JOIN age_groups` — see "Surfaced by round-1 review" below; this needs to become `LEFT JOIN` for drafts to be visible to `listAdminVideos` and `getAdminVideoById`.
- `api/routes/admin.ts` — Joi `videoSchema` (lines 30–44) currently requires `subjectId`, `ageGroupId`, `numberOfQuestions`, `badgeRanges` regardless of `isPublished`. Schema relaxation is part of Unit 2.
- `api/db.ts` — `query`, `queryOne`, `withTransaction` helpers. `createVideo` runs in its own `withTransaction`; the bulk loop calls `createVideo` once per row sequentially with a per-row try/catch (each row gets its own transaction so a `23505` on one row doesn't poison the next).
- `db/schema.sql` — `videos` table; `subject_id`, `age_group_id`, `number_of_questions` NOT NULL today; `slug` NOT NULL UNIQUE; `youtube_video_id` NOT NULL with **no UNIQUE constraint**. `badge_family_id` was already dropped in `db/migrations/0002_badge_rework.sql`; the current model uses `video_badge_rules` directly on the video, with non-overlapping `(min_correct, max_correct, badge_count)` ranges.
- `db/migrations/` already contains `0001_oauth_support.sql` through `0006_email_otp_and_separate_providers.sql`; the next free ordinals are 0007 and 0008. Naming convention is `NNNN_description.sql`.
- `api/lib/youtube.ts` — exists; provides `extractYouTubeVideoId` and `buildYouTubeThumbnail`. Sanitization helpers added in Unit 2 extend this file.
- `src/pages/AdminVideos.tsx` — existing admin catalog editor. Draft awareness changes live here.
- `src/components/AdminLayout.tsx` — sidebar `NAV` array. v1 does NOT add a sidebar entry; the picker is reached via a button on AdminVideos.
- `src/App.tsx` — admin routes nested under `/admin` (lines 86–101). Adding `<Route path="videos/import" element={...} />` follows the existing pattern.
- `src/lib/api.ts` — axios instance with auth header; client calls flow through this.

### Institutional Learnings

- `docs/solutions/` is empty at planning time — no prior learnings to consult.

### External References

- YouTube Data API v3:
  - `channels.list?forHandle=@qupuid&part=contentDetails` — modern way to resolve a handle to channel ID and its uploads playlist ID without burning quota on `search.list`. **Pre-rollout verification recommended:** confirm `forHandle` returns a channel for `@qupuid` before deploy; if not, set `YOUTUBE_UPLOADS_PLAYLIST_ID` directly.
  - `playlistItems.list?playlistId=...&maxResults=50&part=contentDetails` — pages through uploads (returns video IDs).
  - `videos.list?id=...&part=snippet` — enriches each video ID with title/description/thumbnail. Already used by `fetchYouTubeMetadata`.

## Key Technical Decisions

- **Four migrations, separate files** — `0007_video_drafts.sql` (nullable QUPU-fields + publish-time CHECK), `0008_youtube_video_id_unique.sql` (UNIQUE index with pre-flight verification), `0009_youtube_channel_cache.sql` (Postgres-backed channel-listing cache table), `0010_request_rate_limits.sql` (Postgres-backed per-admin rate-limit table). Separate files keep each rollback discrete and follow the existing 0001–0006 convention.
- **Validation split inside `normalizeVideoInput`**, not a parallel `createDraftFromYouTube` service — the function receives the row's target `is_published` value and short-circuits QUPU-field/badge-range checks when `false`. Single validation surface; lower drift risk than two parallel paths. The contract is that `normalized.badgeRanges` is always an array (defaulting to `[]` in draft mode), so the unconditional `syncVideoBadgeRanges` call inside `createVideo` is a safe no-op for drafts.
- **Bulk-create response shape `{ youtube_video_id, status, error? }`** with `status ∈ { "created", "already_imported", "error" }`. Best-effort per row; per-row UNIQUE-violations land as `"already_imported"`, not as 5xx.
- **Buffer-and-sort pagination for oldest-first** — on first picker load the server fetches all `playlistItems.list` pages, enriches via `videos.list` (50 IDs per call), sorts oldest-first by `publishedAt`, and caches the full annotated list **in Postgres** (`youtube_channel_cache` table) for 10 minutes. Picker UI pages through the cached list 50 at a time. Cost is roughly 2 API units per 50 videos; the cache absorbs repeat visits.
- **Postgres-backed cache and rate limiter** — channel-listing payloads live in a `youtube_channel_cache` row with `(playlist_id, payload_jsonb, fetched_at, expires_at)`; per-admin rate limits live in `request_rate_limits` with `(user_id, route, window_started_at, count)`. Consistent across all serverless instances on Vercel; cache eviction after bulk-import is global; rate limit is honestly enforced per admin regardless of which container handled the request. Costs one extra DB read per listing call (negligible for an admin-only path) and resolves the round-1 doc review's "in-memory state breaks on serverless" concern.
- **Channel-ID resolution memoized in-process per request handler**, with `YOUTUBE_UPLOADS_PLAYLIST_ID` env var as the recommended production setting on Vercel (skips the `channels.list` round-trip on every cold start). Without the env var, the resolved playlist ID is cached in process memory; on serverless this means the resolution call may run once per cold container, which is acceptable given how rarely a channel ID changes.
- **Selections scoped to current page** in the picker (no cross-page selection state) — keeps the React state model simple. Admins import in batches per visible page.
- **Per-admin rate limiter on the listing endpoint** — 30 requests per minute, enforced via the `request_rate_limits` table. Combined with the Postgres cache (which absorbs repeat visits regardless of caller), bounds quota usage from a compromised admin session burning calls in a tight loop.
- **Stalled-drafts surfacing for v1 is "DRAFT badge + filter chip" only** — no draft-age column or count badge in v1. The DRAFT/PUBLISHED filter chip and per-row badge are sufficient for admins to see and resume incomplete imports; richer staleness affordances are deferred to a follow-up if admin usage shows they're needed.
- **Picker entry point is a button on AdminVideos**, not an `AdminLayout` sidebar entry. The picker is a sub-flow of "add a video", not its own top-level admin concept. No `AdminLayout.tsx` sidebar change.

## Open Questions

### Resolved During Planning

- **Picker placement**: dedicated route `/admin/videos/import`, no sidebar entry, entry from a button on AdminVideos.
- **Multi-select interaction model**: per-row left checkbox, sticky bottom action bar with selection count + "Import N as drafts" button. No "select all on this page" in v1. Selections scoped to current page.
- **Pagination + ordering**: server buffers all pages on first load and sorts oldest-first; picker UI pages through the cached list 50 at a time.
- **Draft visual distinction**: per-row badge ("DRAFT" / "PUBLISHED") plus an "All / Drafts / Published" filter chip in the AdminVideos list header.
- **Imported-status check placement**: server-side. The listing endpoint joins against `videos.youtube_video_id` and annotates each row.
- **Listing endpoint shadow paths**: items whose `videos.list` follow-up returns `privacyStatus=private` or 404 are surfaced with disabled selection and an "Unavailable on YouTube" note. `403 quotaExceeded` or network failure mid-pagination surfaces as a top-level error with Retry, not partial pages.
- **Empty picker state**: render the centered "Semua video di channel sudah ada di katalog" message + back-link only when the *full channel listing* contains zero un-imported, available rows — not per page. A page that has only imported rows but later pages have un-imported rows still shows the rows (disabled) so the admin can navigate forward.
- **Channel-ID resolution caching**: resolve at startup, cache for process lifetime; lazy fallback if startup fails; `YOUTUBE_UPLOADS_PLAYLIST_ID` env var bypasses resolution.

### Surfaced by round-1 review (folded into specific units; carried here for traceability)

These are real gaps the round-1 doc review surfaced. The architectural ones are now resolved (decisions captured in Key Technical Decisions); the remaining items live as explicit tasks inside specific implementation units below, listed here so the trail back to the review is visible:

- **`VIDEO_SELECT` INNER JOIN → LEFT JOIN** — folded into Unit 2 (`api/services/videos.ts` modifications). Without this, drafts with NULL FKs would be silently filtered out by `listAdminVideos`, `getAdminVideoById`, and `createVideo`'s post-INSERT fetch.
- **Frontend `Video`/`VideoCard` type relaxation** for nullable `subject`/`ageGroup`/`numberOfQuestions` — folded into Unit 2 (`src/types/index.ts`). Consumers must guard nulls; public-side consumers stay safe because they filter on `is_published = true`.
- **Slug-collision retry must use fresh `withTransaction`** — folded into Unit 2 (`slugifyForBulk` exposes both forms; service drives retry via second `createVideo` call) and Unit 4 (the retry path). Postgres aborts the original transaction on `23505`, so retry inside it would fail.
- **Bulk-import error messages mapped to fixed enum** — folded into Unit 4 (mapped errors: `youtube_not_found`, `quota_exceeded`, `slug_conflict`, `import_failed`). Avoids leaking DB constraint names or YouTube API key URLs to the client.
- **Thumbnail URL host allowlist + `YOUTUBE_CHANNEL_HANDLE` format validation** — folded into Unit 2 (`validateHttpsThumbnailUrl`) and Unit 3 (startup regex check + `encodeURIComponent`). Defense-in-depth against malicious YouTube metadata and env-tampering.
- **Unpublish path semantics** — Unit 6 disallows toggling `is_published` from `true` → `false` in v1, avoiding the destructive `syncVideoBadgeRanges` DELETE.

**Resolved by Postgres-backed cache + rate limiter (Unit 1b, Unit 3):**

- *Vercel serverless deployment breaks in-memory state* → cache and rate limiter now live in Postgres tables (`youtube_channel_cache`, `request_rate_limits`); state is consistent across all serverless instances.
- *Cross-instance cache invalidation* → eviction of a cache row in Postgres is global; bulk-import success after Unit 4 deletes the row, and every instance's next listing call sees the eviction immediately.
- *Stalled-drafts signal* → v1 ships DRAFT badge + filter chip only (Unit 6); richer staleness affordances are an explicit follow-up if admin usage shows they're needed.

### Deferred to Implementation (low-risk, implementer-time decisions)

- Exact in-process cache shape — a hand-rolled `Map<key, { value, expiresAt }>` is sufficient; `node-cache` only if it adds clear value.
- HTML-stripping library for sanitization — check `package.json` for `sanitize-html`; if absent, hand-rolled tag-strip is acceptable for this surface.
- Whether the AdminVideos editor splits into "draft mode" vs "publish mode" UI states or keeps one form with conditional client-side validation — the latter is the simpler shape; the implementer picks once they open the form against a draft row.
- Final styling/copy of the draft badge, filter chip, toast, and inline error pattern — match the existing AdminVideos design vocabulary (Tailwind tokens already in use).
- Existing toast/notification component in the codebase — match it; if none exists, bottom-center, 5-second auto-dismiss, success variant when no errors and warning variant when any row failed.
- Keyboard navigation / accessibility — native `<input type="checkbox">` is keyboard-accessible by default; sticky action bar count uses `aria-live="polite"`.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
┌──────────────────────┐         ┌───────────────────────────────┐
│ Admin (browser)      │         │ Express API (api/*)            │
│                      │         │                                │
│ /admin/videos        │         │ GET /admin/youtube-channel/    │
│   ↓ "Import from YT" │         │     videos?page=N              │
│ /admin/videos/import │ ──────► │   ├─ rate-limit per admin      │
│   ↓ multi-select     │         │   ├─ cached list (10min TTL)   │
│   ↓ Import N         │         │   └─ alreadyImported + avail.  │
│                      │         │                                │
│                      │         │ POST /admin/youtube-channel/   │
│                      │ ──────► │      import { videoIds: [..] } │
│                      │         │   for each id (best-effort,    │
│                      │ ◄────── │     fresh tx per row):         │
│   results[]          │         │     fetchMetadata→sanitize→    │
│                      │         │     slugify→createVideo→       │
│                      │         │     unique-violation→          │
│                      │         │       "already_imported"       │
└──────────────────────┘         └───────────────────────────────┘
                                                ↓
                                  ┌─────────────────────────┐
                                  │ Postgres (videos table) │
                                  │  • is_published flag    │
                                  │  • CHECK on publish     │
                                  │  • UNIQUE youtube_id    │
                                  └─────────────────────────┘
```

Validation flow inside `normalizeVideoInput`:

```
input → if input.isPublished === false:
          → skip subject/age/number_of_questions/badge-range checks
          → set badgeRanges = [] (never undefined)
          → continue with slug + youtube_url + title validation only
        else:
          → existing full validation (badge ranges ≥1, etc.)
        → return normalized row → INSERT/UPDATE
        ↓
        DB CHECK constraint: is_published=true ⇒ subject_id/age_group_id
        /number_of_questions NOT NULL (defense-in-depth if the
        application path is bypassed)
```

## Implementation Units

- [ ] **Unit 1: Schema migrations — nullable QUPU-fields + UNIQUE on `youtube_video_id`**

  **Goal:** Make the schema accept draft rows (`is_published = false` with NULL QUPU-fields) while preserving the publish-time invariant, and enforce dedupe on YouTube IDs at the DB layer.

  **Requirements:** R4, R6, R7

  **Dependencies:** None (must land before any code that creates drafts).

  **Files:**
  - Create: `db/migrations/0007_video_drafts.sql`
  - Create: `db/migrations/0008_youtube_video_id_unique.sql`
  - Modify: `db/schema.sql` (post-migration shape, so fresh installs apply it directly)

  **Approach:**
  - Migration `0007`: `ALTER TABLE videos ALTER COLUMN subject_id DROP NOT NULL;` (same for `age_group_id`, `number_of_questions`). Add `CONSTRAINT videos_publish_required CHECK (is_published = false OR (subject_id IS NOT NULL AND age_group_id IS NOT NULL AND number_of_questions IS NOT NULL AND number_of_questions > 0))`.
  - Migration `0008`: pre-flight verification — `SELECT COUNT(*) FROM videos WHERE youtube_video_id IS NULL OR youtube_video_id = ''` must return 0 *and* `SELECT youtube_video_id, COUNT(*) FROM videos GROUP BY youtube_video_id HAVING COUNT(*) > 1 LIMIT 1` must return zero rows; otherwise raise an exception with a clear message instructing manual backfill/dedupe. Then `CREATE UNIQUE INDEX videos_youtube_video_id_unique ON videos (youtube_video_id);`. Optionally also `ALTER TABLE videos ADD CONSTRAINT videos_slug_unique UNIQUE USING INDEX videos_slug_key;` (or equivalent) to give the slug constraint a deterministic name the bulk-import error handler can match on.
  - Update `db/schema.sql` so `subject_id`/`age_group_id`/`number_of_questions` are nullable, the CHECK constraint is declared inline, and the UNIQUE index is part of the canonical schema.

  **Patterns to follow:**
  - Existing migration naming: `db/migrations/0001_oauth_support.sql` through `0006_email_otp_and_separate_providers.sql`. Continue at 0007.
  - Existing CHECK constraint shape on `videos.number_of_questions > 0` (`db/schema.sql`).

  **Test scenarios:**
  - Happy path: apply `0007`; insert a row with `is_published=false` and NULL `subject_id`, NULL `age_group_id`, NULL `number_of_questions` → succeeds.
  - CHECK constraint: attempt `UPDATE videos SET is_published = true WHERE id = <draft-id>` while QUPU fields are NULL → fails the CHECK.
  - Existing rows survive: pre-existing rows (all fields populated, `is_published=true`) still satisfy the constraint after migration.
  - Unique violation: apply `0008`; attempt to insert two rows with the same `youtube_video_id` → second insert fails with unique-violation (Postgres SQLSTATE `23505`).
  - Pre-flight abort: insert a row with NULL `youtube_video_id` (in a test DB), run `0008` → migration aborts with "verify backfill" message before creating the index. Same for duplicate values.

  **Verification:**
  - Run `psql $DATABASE_URL -f db/migrations/0007_video_drafts.sql && psql $DATABASE_URL -f db/migrations/0008_youtube_video_id_unique.sql` against a copy of the production DB. Observe both apply cleanly and existing rows are untouched.
  - `\d videos` shows the new constraint and unique index.

- [ ] **Unit 1b: Cache + rate-limit infrastructure migrations**

  **Goal:** Add Postgres tables that back the channel-listing cache and per-admin rate limiter so both behave consistently across Vercel serverless instances.

  **Requirements:** R1, R2 (consistent cross-instance behavior is a non-functional requirement that R1's "paged" listing and R2's "configured server-side" identity assume implicitly; without it the cache is decorative and the rate limit is bypassable).

  **Dependencies:** None (migrations are standalone). Blocks Unit 3.

  **Files:**
  - Create: `db/migrations/0009_youtube_channel_cache.sql`
  - Create: `db/migrations/0010_request_rate_limits.sql`
  - Modify: `db/schema.sql` (add both tables to the canonical schema)

  **Approach:**
  - Migration `0009` — `CREATE TABLE youtube_channel_cache ( playlist_id VARCHAR(64) PRIMARY KEY, payload JSONB NOT NULL, fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL );` plus an index on `expires_at` for opportunistic cleanup. The `payload` field stores the full annotated channel listing (sorted oldest-first, with `alreadyImported` and `available` per row). Single-row table for v1 (one channel); the PK on `playlist_id` keeps it forward-compatible if multi-channel ever lands.
  - Migration `0010` — `CREATE TABLE request_rate_limits ( user_id UUID NOT NULL, route VARCHAR(64) NOT NULL, window_started_at TIMESTAMPTZ NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, route) );` plus a separate `created_at`/cleanup index if useful. Sliding-window counter per `(user_id, route)` pair; the rate-limit middleware uses an `INSERT … ON CONFLICT (user_id, route) DO UPDATE SET count = CASE WHEN window_started_at < NOW() - INTERVAL '1 minute' THEN 1 ELSE count + 1 END, window_started_at = CASE WHEN window_started_at < NOW() - INTERVAL '1 minute' THEN NOW() ELSE window_started_at END RETURNING count` UPSERT to atomically increment-or-reset.
  - Update `db/schema.sql` so both tables are part of the canonical fresh-install schema.

  **Patterns to follow:**
  - Existing JSONB usage in the codebase (check `package.json` and existing migrations — Postgres `JSONB` is already in use for analytics if any).
  - Migration naming convention `NNNN_description.sql`.

  **Test scenarios:**
  - Apply migration `0009`; insert a row with a multi-MB JSONB payload → succeeds; query by `playlist_id` returns the payload.
  - Cache expiry: insert with `expires_at = NOW() - INTERVAL '1 hour'`; a `SELECT WHERE expires_at > NOW()` returns no rows.
  - Apply migration `0010`; the UPSERT pattern atomically increments under concurrent calls; window resets correctly when `window_started_at` is older than 1 minute.
  - Existing rows on neither table (clean install): both tables initialize empty.

  **Verification:**
  - `psql $DATABASE_URL -f db/migrations/0009_youtube_channel_cache.sql && psql $DATABASE_URL -f db/migrations/0010_request_rate_limits.sql` applies cleanly.
  - `\d youtube_channel_cache` and `\d request_rate_limits` show the expected schema.

- [ ] **Unit 2: Service-layer validation split + sanitization helpers + Joi schema relaxation**

  **Goal:** Make `normalizeVideoInput` accept draft inputs, add string-sanitization helpers for YouTube-origin metadata, provide a slug-collision strategy for bulk insert, and relax the admin-route Joi schema so draft saves don't 400 at the route boundary.

  **Requirements:** R6, R7

  **Dependencies:** Unit 1 (schema must accept NULL QUPU-fields before the service path skips validation).

  **Files:**
  - Modify: `api/services/videos.ts` (`normalizeVideoInput`, `createVideo` plumbing; convert `VIDEO_SELECT` joins to LEFT JOIN; relax `mapVideoCard`/`mapVideoDetail` to handle null subject/age — see "Surfaced by round-1 review")
  - Modify: `api/lib/youtube.ts` (extend with `sanitizeYouTubeText`, `validateHttpsThumbnailUrl`)
  - Modify: `api/routes/admin.ts` (relax `videoSchema` so subjectId/ageGroupId/numberOfQuestions/badgeRanges are conditional on `isPublished`)
  - Modify: `src/types/index.ts` (relax `Video`/`VideoCard` so `subject`, `ageGroup`, and `numberOfQuestions` are nullable)

  **Approach:**
  - In `normalizeVideoInput`, branch on `input.isPublished`. When `false`, skip the badge-range validation, allow null `subjectId`/`ageGroupId`/`numberOfQuestions`, and skip the badge-rule normalization. Slug + `youtube_url` + `title` checks still run for both branches. **Always** set `normalized.badgeRanges = []` in draft mode (never leave it `undefined`) so the unconditional `syncVideoBadgeRanges(client, video.id, normalized.badgeRanges)` call inside `createVideo` runs as a safe no-op (DELETE existing, INSERT zero).
  - `sanitizeYouTubeText(text: string, maxLen: number): string` — strip HTML tags, collapse whitespace, length-cap. Hand-rolled is fine; if `package.json` already has `sanitize-html`, prefer it.
  - `validateHttpsThumbnailUrl(url: string): string` — throws if the URL is not `https://` *or* the host isn't on the YouTube CDN allowlist (`i.ytimg.com`, `img.youtube.com`). Caller falls back to `buildYouTubeThumbnail(id)` on throw.
  - `slugifyForBulk(title: string, youtubeVideoId: string): { base: string, withSuffix: string }` — returns both forms. The bulk-insert service tries `base` first via `createVideo`; on Postgres `23505` against the slug constraint, it calls `createVideo` *again* (fresh `withTransaction`) with `withSuffix`. The retry must be a fresh transaction — Postgres aborts the original on `23505`.
  - Convert the two `JOIN` clauses inside `VIDEO_SELECT` to `LEFT JOIN` so draft rows (NULL subject_id, NULL age_group_id) are returned by `listAdminVideos` and `getAdminVideoById`. Update `mapVideoCard` / `mapVideoDetail` to emit `subject: null` and `ageGroup: null` when the joined row is missing. The public list/detail queries continue filtering `is_published = TRUE`, so the publish-time CHECK guarantees they never see null FKs.
  - Update `src/types/index.ts` so `Video.subject` is `SubjectOption | null`, `Video.ageGroup` is `{ id, name } | null`, `Video.numberOfQuestions` is `number | null`. Audit consumers; admin pages must guard nulls; public pages are safe because the API filters them out.
  - Update `videoSchema` in `api/routes/admin.ts` using `Joi.when('isPublished', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) })` for `subjectId`, `ageGroupId`, `numberOfQuestions`. For `badgeRanges`, use `Joi.array().items(...).when('isPublished', { is: true, then: Joi.array().min(1).required(), otherwise: Joi.array().default([]) })`.

  **Patterns to follow:**
  - Existing `extractYouTubeVideoId` and `buildYouTubeThumbnail` in `api/lib/youtube.ts`.
  - Existing `slugify` usage at `api/services/videos.ts:301`.
  - Existing Joi schema patterns in `api/routes/admin.ts`.

  **Test scenarios:**
  - `normalizeVideoInput({ ..., isPublished: false, badgeRanges: [] })` → returns successfully (no throw).
  - `normalizeVideoInput({ ..., isPublished: true, badgeRanges: [] })` → throws "At least one badge range is required" (unchanged).
  - `normalizeVideoInput({ ..., isPublished: false, subjectId: null, ageGroupId: null, numberOfQuestions: null })` → returns successfully with `normalized.badgeRanges = []`.
  - `sanitizeYouTubeText('<script>alert(1)</script>Hello <b>world</b>', 200)` → `"Hello world"`.
  - `sanitizeYouTubeText('A'.repeat(500), 200)` → length 200.
  - `validateHttpsThumbnailUrl('http://i.ytimg.com/x.jpg')` → throws (scheme).
  - `validateHttpsThumbnailUrl('https://example.com/x.jpg')` → throws (host).
  - `validateHttpsThumbnailUrl('https://i.ytimg.com/vi/abc/maxres.jpg')` → returns the same URL.
  - Slug collision: existing row has `slug='math-lesson'`. Calling `createVideo` for a draft with `title='Math Lesson'`, `youtubeVideoId='dQw4w9WgXcQ'` → first call fails on slug `23505`, second call (fresh transaction) with `slug='math-lesson-dQw4w9WgXcQ'` succeeds.
  - `listAdminVideos` returns a freshly-created draft row (with NULL subject_id) — confirms the LEFT JOIN conversion landed.
  - `mapVideoCard` returns `subject: null` for a draft row without throwing.
  - `POST /admin/videos` with `isPublished: false` and no `subjectId` → 200/201 (Joi accepts).
  - `POST /admin/videos` with `isPublished: true` and no `subjectId` → 400 (Joi rejects).

  **Verification:**
  - In a Node REPL or scratch file, exercise `normalizeVideoInput` against both branches.
  - `curl POST /api/admin/videos` with a draft body succeeds.
  - Existing single-video create path (publish mode) still succeeds end-to-end via the existing AdminVideos UI — no regression.
  - `curl GET /api/admin/videos` returns drafts in the response.

- [ ] **Unit 3: Channel listing service + endpoint + env vars**

  **Goal:** Resolve the channel handle to its uploads playlist, fetch and cache the full channel listing oldest-first (in Postgres) with `alreadyImported` and `available` annotations, and expose it via a paginated admin endpoint with Postgres-backed rate limiting.

  **Requirements:** R1, R2, R3, R4

  **Dependencies:** Unit 1 (UNIQUE index allows the `alreadyImported` join to be reliable). Unit 1b (cache + rate-limit tables exist).

  **Files:**
  - Create: `api/services/youtubeChannel.ts` (resolver + Postgres-cached listing + annotation; exports `invalidateChannelListingCache(playlistId)`)
  - Create: `api/lib/rateLimit.ts` (Postgres-backed per-key sliding-window UPSERT helper)
  - Modify: `api/routes/admin.ts` (add `GET /youtube-channel/videos`)
  - Modify: `.env.example` (document `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_HANDLE`, optional `YOUTUBE_UPLOADS_PLAYLIST_ID`)
  - Modify: `api/app.ts` (validate `YOUTUBE_CHANNEL_HANDLE` format at app construction; channel-ID resolution is per-request-handler-cached, not pre-warmed at startup, since the Vercel handler has no startup hook)

  **Approach:**
  - `resolveUploadsPlaylistId()`: if `YOUTUBE_UPLOADS_PLAYLIST_ID` env var is set, return it (recommended on Vercel). Otherwise call `https://www.googleapis.com/youtube/v3/channels?forHandle=${encodeURIComponent(handle)}&part=contentDetails&key=${apiKey}` and read `items[0].contentDetails.relatedPlaylists.uploads`. Validate the handle at app construction against `/^@[A-Za-z0-9_.-]{1,50}$/` (reject empty or malformed). Memoize the resolved ID in process memory for the container's lifetime — on serverless this means at most one resolution call per cold container.
  - `listChannelVideosCached()`: keyed by uploads playlist ID. Read from Postgres via `SELECT payload FROM youtube_channel_cache WHERE playlist_id = $1 AND expires_at > NOW();`. If a row is returned, deserialize the JSONB `payload` and return immediately. On cache miss:
    1. Page through `playlistItems.list?playlistId=...&maxResults=50` until no `nextPageToken`. Collect all `contentDetails.videoId` + `contentDetails.videoPublishedAt`.
    2. Batch the IDs into groups of 50 and call `videos.list?id=...&part=snippet`.
    3. Sort by `publishedAt` ascending (oldest-first).
    4. Annotate: `SELECT youtube_video_id FROM videos WHERE youtube_video_id = ANY($1)` with all collected IDs; set `alreadyImported: ids.has(item.id)` per row; `available: true` for items returned by `videos.list`, `available: false` for IDs that came from `playlistItems.list` but had no follow-up `videos.list` row (deleted/private upstream).
    5. Persist via `INSERT INTO youtube_channel_cache (playlist_id, payload, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes') ON CONFLICT (playlist_id) DO UPDATE SET payload = EXCLUDED.payload, fetched_at = NOW(), expires_at = EXCLUDED.expires_at;`.
  - `GET /admin/youtube-channel/videos?page=N`: page-slice the cached list (50 per page), return `{ items: [{ id, title, publishedAt, thumbnailUrl, alreadyImported: boolean, available: boolean, unavailableReason?: string }, ...], page, pageCount, total }`. Apply the rate limiter before hitting the cache.
  - `api/lib/rateLimit.ts`: exposes `enforceRateLimit(userId, route, { max: 30, windowSeconds: 60 })` that runs the atomic `INSERT … ON CONFLICT … DO UPDATE … RETURNING count` UPSERT against `request_rate_limits`. If the returned `count > max`, return a `RateLimitError` (caller surfaces 429 with `Retry-After`). The UPSERT is naturally race-safe in Postgres without explicit locking. Mount as route-level middleware after the global `authenticateToken + requireAdmin` so `req.user.id` is always populated.
  - On any YouTube API error (403 quota, 5xx, network), the endpoint returns 502 with a sanitized message (`{ error: "youtube_unavailable" }` or `{ error: "quota_exceeded" }`) — never the raw `Error.message` which can include the API key URL.
  - Export `invalidateChannelListingCache(playlistId)` (a `DELETE FROM youtube_channel_cache WHERE playlist_id = $1`) for Unit 4 to call after a successful bulk-import.

  **Patterns to follow:**
  - Existing `fetchYouTubeMetadata` in `api/services/youtubeImport.ts` for API call shape (note: the existing code already `encodeURIComponent`s the API key — keep that pattern).
  - Existing admin route style at `api/routes/admin.ts:135` (`GET /youtube-import`).
  - Joi validation pattern at `api/routes/admin.ts:24–44`.

  **Test scenarios:**
  - Auth: `curl /api/admin/youtube-channel/videos` without token → 401. With non-admin token → 403.
  - Cache hit: first call populates cache; second call within 10 min returns immediately with no YouTube call (verify via log line).
  - Cache miss after TTL: 11 minutes later, repeat call re-fetches.
  - `alreadyImported` is `true` for any row in `videos` regardless of `is_published`.
  - Items are sorted ascending by `publishedAt`.
  - Rate limit: 31st call within 60 seconds returns 429 with `retryAfter`.
  - Resolver fallback: with `YOUTUBE_UPLOADS_PLAYLIST_ID` set, no `channels.list` call is made.
  - Resolver failure path: stub `channels.list` to return 503 → first listing call returns 502 with `{ error: "youtube_unavailable" }`; cached uploads-playlist-ID is not poisoned.
  - Private/deleted items: a video whose `videos.list` follow-up returns no row appears with `available: false`.
  - Page boundary: channel with 51 videos → page 1 has 50 items, page 2 has 1, `pageCount=2`.
  - Sanitized error: when YouTube API returns 403, the response body contains no `key=...` substring.
  - Pre-rollout: on first server boot with the production env, `forHandle=@qupuid` returns a valid channel ID (verify manually).

  **Verification:**
  - Run `npm run server:dev`, `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/admin/youtube-channel/videos?page=1 | jq` against the real `@qupuid` channel; verify items, ordering, and annotations.
  - Hit it 31 times in a tight loop; observe 429 on the 31st.

- [ ] **Unit 4: Bulk draft import service + endpoint**

  **Goal:** Accept up to 50 YouTube video IDs in one request, fetch metadata for each, sanitize, dedupe via UNIQUE constraint, insert as drafts with their own per-row transactions, and return per-row results.

  **Requirements:** R4, R5, R6

  **Dependencies:** Units 1, 2, 3 (UNIQUE index, validation split + sanitization helpers, channel listing cache for the picker UX). Unit 4 itself does not require Unit 3's listing — it can run independently — but the picker calls both.

  **Files:**
  - Create: `api/services/youtubeChannelImport.ts` (`bulkImportAsDrafts(youtubeVideoIds: string[]): Promise<ImportResult[]>`)
  - Modify: `api/routes/admin.ts` (add `POST /youtube-channel/import`)

  **Approach:**
  - Joi schema for request body: `{ youtubeVideoIds: Joi.array().items(Joi.string().min(11).max(20).regex(/^[A-Za-z0-9_-]+$/)).min(1).max(50).required() }`.
  - For each ID (in order, not parallel — keeps quota predictable):
    1. Call `fetchYouTubeMetadata(id)`.
    2. `sanitizeYouTubeText` on title and description; `validateHttpsThumbnailUrl` on the thumbnail (catch and fall back to `buildYouTubeThumbnail(id)` on validation failure).
    3. Build draft payload with `youtubeUrl: \`https://www.youtube.com/watch?v=${id}\`` (constructed because `fetchYouTubeMetadata` returns `videoId` only, and `normalizeVideoInput` calls `extractYouTubeVideoId(input.youtubeUrl)` which would otherwise throw): `{ title, description, thumbnailUrl, youtubeUrl, youtubeVideoId: id, slug: slugify(title), isPublished: false, isFeatured: false, sortOrder: 0, difficulty: 'medium', subjectId: null, ageGroupId: null, numberOfQuestions: null, badgeRanges: [] }`.
    4. Call `createVideo(payload)` — this opens its own `withTransaction` and runs the relaxed `normalizeVideoInput`. Catch errors per-row.
    5. On Postgres SQLSTATE `23505` against `videos_youtube_video_id_unique` → push `{ youtubeVideoId: id, status: 'already_imported' }`. On `23505` against the slug constraint → call `createVideo` again with `slug: slugify(title) + '-' + id` (fresh transaction). If the second call also fails, push `{ youtubeVideoId: id, status: 'error', error: 'slug_conflict' }`.
    6. On any other error → push `{ youtubeVideoId: id, status: 'error', error: <mapped enum> }`. Map raw errors to a fixed set: `youtube_not_found`, `youtube_unavailable`, `quota_exceeded`, `import_failed`. Log full error with a correlation ID server-side; never return raw `error.message` to the client.
    7. On success → push `{ youtubeVideoId: id, status: 'created', videoId: newVideo.id }`.
  - After the loop, call `invalidateChannelListingCache(playlistId)` from Unit 3 (a `DELETE FROM youtube_channel_cache WHERE playlist_id = $1`) on any structurally valid request — the eviction is global across all serverless instances since the cache lives in Postgres. The next listing request from any instance refetches from YouTube with fresh `alreadyImported` annotations.
  - Return `{ success: true, data: { results: [...] } }`. The endpoint returns 200 unless infrastructure failed entirely; per-row outcomes ride in the body.

  **Patterns to follow:**
  - Joi + try/catch shape from existing `POST /admin/videos` (`api/routes/admin.ts:58`).
  - Service-layer error throwing pattern in `api/services/videos.ts`.

  **Test scenarios:**
  - Happy: 3 fresh YouTube IDs → response has 3 `created` results; `videos` table has 3 new rows with `is_published=false`, NULL QUPU-fields, populated YouTube fields. After the call, the listing cache is evicted.
  - Mixed: `[fresh-A, already-imported-B, fresh-C]` → `[created, already_imported, created]`; 2 new rows in DB.
  - Concurrent overlap: two parallel POSTs containing the same fresh ID → exactly one `created` and one `already_imported`; DB has one row.
  - Invalid YouTube ID format: `ids: ['NOT_A_VALID_ID!!']` → 400 from Joi.
  - Valid format but YouTube returns 404: result for that ID is `{ status: 'error', error: 'youtube_not_found' }`; other IDs in the batch still process.
  - Slug collision: pre-seed `slug='math-lesson'`. Submit a draft for "Math Lesson" with id `abc123XYZ_` → row created with `slug='math-lesson-abc123XYZ_'` (fresh transaction on retry), status `created`.
  - Sanitization: stub `fetchYouTubeMetadata` to return `title: '<b>Hi</b>'` → DB title is `Hi`.
  - Thumbnail fallback: stub metadata to return `thumbnailUrl: 'http://example.com/x.jpg'` → DB row has the constructed `https://i.ytimg.com/vi/.../mqdefault.jpg`.
  - Cache invalidation: after a successful import, the next `GET /admin/youtube-channel/videos` reflects `alreadyImported=true` for the imported IDs (single-instance only — see "Surfaced by round-1 review" for the multi-instance caveat).
  - Body size cap: 51 IDs → 400 from Joi.
  - Sanitized error: stub a slug collision twice; result has `error: 'slug_conflict'` not the raw `duplicate key value violates...` string.

  **Verification:**
  - `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"youtubeVideoIds":["realIdA","realIdB"]}' http://localhost:3001/api/admin/youtube-channel/import | jq` returns the expected `results`.
  - `psql $DATABASE_URL -c "SELECT id, slug, is_published, subject_id, youtube_video_id FROM videos WHERE youtube_video_id IN ('realIdA','realIdB');"` shows the new draft rows.
  - Re-run the same curl → results show `already_imported` for both.

- [ ] **Unit 5: Frontend picker page**

  **Goal:** Provide an admin-only page that browses the channel listing, multi-selects un-imported videos, and triggers the bulk import with end-to-end UX (loading, empty, error, partial-failure states).

  **Requirements:** R1, R3, R4, R5

  **Dependencies:** Units 3, 4 (the endpoints the page consumes).

  **Files:**
  - Create: `src/pages/admin/AdminImportVideos.tsx`
  - Create: `src/components/admin/ImportVideoRow.tsx` (optional split)
  - Modify: `src/App.tsx` (add `<Route path="videos/import" element={<AdminImportVideosPage />} />` inside the admin block)
  - Modify: `src/types/index.ts` (add `ChannelVideoItem`, `ImportResult` types — the broader `Video`/`VideoCard` relaxation lives in Unit 2)

  **Approach:**
  - Route nested under the existing `/admin` block (line 86 of `App.tsx`).
  - Layout:
    - Header: page title "Impor dari YouTube" + "Kembali ke Videos" link (the back link is disabled while a bulk-import POST is in flight to avoid losing the result view).
    - Body: paged list (50 per page) of rows. Each row = checkbox (left, disabled if `alreadyImported || !available`) + thumbnail + title + publishDate + status pill ("In catalog" / "Unavailable on YouTube" / nothing).
    - Sticky bottom action bar (visible when ≥1 row selected): `{n} video dipilih` + `Import N as drafts` button + `Batal` link to clear selection.
    - Pagination controls: prev/next + `Halaman X dari Y`. Page-change handler explicitly resets `setSelectedIds(new Set())` before updating page index.
  - State: `selectedIds: Set<string>` (cleared on page change, scoped to current page).
  - Loading state on initial fetch (cold cache can take seconds): skeleton rows + label "Mengambil daftar video dari YouTube...". Client-side request timeout 45s; if exceeded, falls into the error state.
  - Error state: top-level alert with Retry button when the listing endpoint returns 4xx/5xx; rows do not render.
  - Empty state: rendered only when the *entire channel* has zero un-imported, available rows (server returns `pageCount === 1 && items.every(i => i.alreadyImported || !i.available)`). Centered illustration + "Semua video di channel sudah ada di katalog." + "Lihat katalog" link to `/admin/videos`.
  - Submit handler: `POST /admin/youtube-channel/import` with selected IDs. Action bar disables, button shows spinner. `aria-live="polite"` on the action bar count.
  - Result handling: parse `results[]`. Show a summary toast `Berhasil: N | Sudah ada: M | Gagal: K` (success variant if Gagal=0, warning variant otherwise). For each result, update the row inline:
    - `created` → row transitions to `alreadyImported=true` styling, checkbox disabled, deselected.
    - `already_imported` → row transitions to `alreadyImported=true`, deselected.
    - `error` → row keeps its checkbox state, shows an inline error chip with the mapped enum (`Gagal: youtube_not_found`, etc.).
  - After import, the action bar shows the count of *failed* rows still selected so the admin can retry the failed subset.

  **Patterns to follow:**
  - Axios usage and error shape from `src/lib/api.ts` and existing admin pages.
  - Tailwind tokens consistent with the rest of `src/pages/admin/*` and `AdminLayout`.
  - Loading/error/empty conventions used in `AdminAnalytics`/`AdminUsers`.

  **Test scenarios** *(manual UI verification — no test runner)*:
  - Happy path: navigate to `/admin/videos/import` → loading with label → list renders sorted oldest-first.
  - Multi-select: tick 3 rows → action bar shows "3 video dipilih" → click Import → toast "Berhasil: 3"; rows transition to "In catalog" disabled state, deselected.
  - Already-imported visibility: `alreadyImported=true` rows render disabled with "In catalog" badge from the start.
  - Unavailable items: `available=false` rows render disabled with "Unavailable on YouTube" note.
  - Mixed-result: select 3 rows where 1 is freshly imported by another session, 1 is fresh, 1 is invalid → toast `Berhasil: 1 | Sudah ada: 1 | Gagal: 1`; the invalid row shows inline `Gagal: youtube_not_found` chip and stays selected.
  - Pagination: 51 channel videos → page 2 has 1 row; selections from page 1 are cleared on navigation.
  - Empty state: every row in the entire channel is in catalog → empty state renders with link.
  - Network failure mid-import: action bar shows "Import gagal, coba lagi"; rows remain in pre-import state.
  - Top-level listing failure: stub the listing endpoint to 502 → page shows error state with Retry.
  - Auth: log out → visit `/admin/videos/import` → redirected to `/login`.

  **Verification:**
  - Walk through every test scenario in a real browser against `npm run dev`. Watch the Network tab for expected API calls and statuses.

- [ ] **Unit 6: Frontend AdminVideos draft awareness**

  **Goal:** Surface drafts vs published in the admin catalog, allow editing/saving drafts without QUPU-field validation, gate publishing behind full validation, and add an entry point to the picker.

  **Requirements:** R7, R9

  **Dependencies:** Units 1–4 (drafts must exist on the server side first). Unit 5 is parallel.

  **Files:**
  - Modify: `src/pages/AdminVideos.tsx` (list view + editor form)

  **Approach:**
  - **List view:**
    - Per-row badge ("DRAFT" / "PUBLISHED") rendered next to the title.
    - Filter chip in the page header: `Semua / Draft / Diterbitkan`. Client-side filter on the existing `videos` array.
    - "Impor dari YouTube" button next to the existing "Tambah video" button → links to `/admin/videos/import`.
  - **Editor:**
    - Loading a draft (`is_published=false`, NULL QUPU-fields) populates the form with empty subject/age/badge fields and the YouTube-derived data.
    - Save with `isPublished=false` (toggle off) → no client-side QUPU-field validation; server accepts because `normalizeVideoInput` is now conditional and `videoSchema` is relaxed.
    - Toggling `isPublished=true` → client-side validation runs: `subjectId`, `ageGroupId`, `numberOfQuestions > 0`, ≥1 `badgeRanges` non-overlapping. If any missing or invalid, surface inline field-level errors and do not submit.
    - If the server rejects publish despite client-side passing (defense-in-depth via the CHECK constraint), parse the structured error and surface a top-level toast.
  - **Unpublish path** (a "Surfaced by round-1 review" decision): for v1, prevent toggling `isPublished` from `true` → `false` in the editor (the toggle is read-only when the row was previously published). This avoids the destructive `syncVideoBadgeRanges` DELETE that would otherwise wipe an admin's badge rules. Document the choice; revisit if admins ask for soft-archive.
  - The existing publish-mode happy path is unchanged.

  **Patterns to follow:**
  - Existing form structure and Tailwind tokens in `src/pages/AdminVideos.tsx`.
  - Existing client-side validation pattern.

  **Test scenarios** *(manual UI verification — no test runner)*:
  - Mixed catalog: 5 published + 3 drafts → list renders with badges; filter `Draft` shows 3, `Diterbitkan` shows 5, `Semua` shows 8.
  - Open a draft row → editor opens with empty subject/age/badge fields and populated YouTube fields.
  - Save draft (isPublished=false) → success toast; row stays as DRAFT.
  - Save draft with isPublished=true and missing subject → inline "Subject required" error; submit blocked.
  - Save draft with all fields populated and isPublished=true → row transitions to PUBLISHED.
  - Existing published video edit → save succeeds (no regression).
  - Attempt to toggle a published video back to draft → toggle is disabled with a tooltip explaining the v1 constraint.
  - "Impor dari YouTube" button → navigates to `/admin/videos/import`.

  **Verification:**
  - Walk through above in browser. Confirm filter is client-side (no extra API call). Regression: edit a published row, change difficulty, save → still works.

## System-Wide Impact

- **Interaction graph:** New endpoints `GET /api/admin/youtube-channel/videos` and `POST /api/admin/youtube-channel/import` join the existing `/api/admin/*` router; both inherit `authenticateToken + requireAdmin`. The bulk-create service uses `createVideo` (per row, fresh `withTransaction` each); the listing endpoint adds an in-memory cache layer that's process-local. Migrations alter the shared `videos` table.
- **Error propagation:** Bulk-create returns `200` with a body of per-row results (mapped error enums, never raw exception strings) — only infrastructure failures propagate as 5xx. Listing endpoint surfaces YouTube API failures as `502` with sanitized messages, never partial pages.
- **State lifecycle risks:** New drafts join the `videos` table with `is_published=false`. `listAdminVideos` (after Unit 2's LEFT-JOIN conversion) returns them; the public list (`getPublishedVideos`) already filters `is_published=true` (`api/services/videos.ts:178,238`). Concurrent imports of the same YouTube ID resolve via DB-level UNIQUE to one `created` and one `already_imported`.
- **API surface parity:** The existing `POST /api/admin/videos` and `PUT /api/admin/videos/:id` Joi `videoSchema` is updated (Unit 2) to allow draft-mode bodies. The single-video YouTube import (`GET /admin/youtube-import`) is unchanged. The public catalog is unchanged.
- **Integration coverage:** Manual end-to-end recipe covers picker → bulk import → AdminVideos editor → publish (re-validation triggers) flow. UNIQUE constraint exercised via two parallel curl calls. `VIDEO_SELECT` LEFT-JOIN exercised by inserting a draft and confirming it appears in `listAdminVideos` and `getAdminVideoById`.
- **Unchanged invariants:** Public catalog endpoints, member endpoints, the existing single-video `POST /admin/videos` happy path with all fields populated, the score-submit pipeline, and the badge-rule guarantee for published videos all behave exactly as before. The "every published video has 3 valid badge rules" invariant survives via the publish-time CHECK + `normalizeVideoInput` re-enforcement on the publish transition.

## Risks & Dependencies

| Risk | Mitigation |
|---|---|
| Pre-existing `videos` rows missing or duplicating `youtube_video_id` block migration `0008`. | Migration `0008` includes pre-flight verification (NULL/empty AND duplicate checks); aborts cleanly with a clear "manual backfill/dedupe required" message before creating the index. |
| Channel-ID resolution at startup fails (network or quota during boot), preventing the listing endpoint from working. | Lazy fallback: if startup resolution fails, the first listing request triggers resolution. `YOUTUBE_UPLOADS_PLAYLIST_ID` env var bypasses resolution entirely as a manual escape hatch. |
| Buffer-and-sort fetches are slow on first load for very large channels. | 10-minute server-side cache absorbs repeat visits. If the channel grows past ~500 videos and first-load latency becomes painful, switch to per-page-only loading and accept per-page-only oldest-first. |
| Concurrent imports of the same YouTube ID create duplicates. | UNIQUE constraint rejects the second insert at the DB layer; bulk-create catches `23505` and returns `already_imported`. |
| YouTube-origin strings inject markup into the admin UI. | Service-layer sanitization (HTML-strip, length-cap, https + host-allowlist on thumbnail) before DB write; React's default JSX escaping is the second layer. |
| Compromised admin session burns daily quota by hammering the listing endpoint. | Per-admin Postgres-backed rate limiter (30/min, atomic UPSERT) + Postgres-backed channel listing cache (10-min TTL). Both are global across all serverless instances; the cache absorbs repeat visits regardless of which container handles the request. |
| Existing AdminVideos editor's Joi schema requires all QUPU-fields, which would break editing existing drafts. | Unit 2 relaxes both the service-layer validation and the route-layer Joi schema; Unit 6 updates the editor to allow saving drafts with empty fields. |
| `VIDEO_SELECT`'s INNER JOINs would silently filter out drafts, breaking `listAdminVideos`, `getAdminVideoById`, and consequently `createVideo`'s post-INSERT fetch. | Unit 2 converts both joins to LEFT JOIN and updates `mapVideoCard`/`mapVideoDetail` to handle null subject/age. Test scenarios explicitly verify drafts are returned. |
| `badge_family_id` references in earlier draft of this plan are stale — the column was removed in `0002_badge_rework.sql` and the current model uses `video_badge_rules` directly. | Plan corrected; all references to "badge family" / `badgeFamilyId` removed. The publish-time invariant is now expressed as "≥1 non-overlapping badge ranges with `badge_count`". |
| Slug retry inside the same transaction would fail (Postgres aborts the transaction on `23505`). | Slug retry calls `createVideo` a second time with a fresh `withTransaction`. Unit 2's `slugifyForBulk` returns both forms; the service layer drives the retry. |

## Documentation / Operational Notes

- `.env.example` updated to document `YOUTUBE_API_KEY` (already required for single-video import) and `YOUTUBE_CHANNEL_HANDLE` (default `@qupuid`); `YOUTUBE_UPLOADS_PLAYLIST_ID` documented as optional bypass for environments where `forHandle` resolution is brittle.
- `CLAUDE.md` updated to: (a) document the new admin endpoints, (b) note that `is_published=false` is the canonical "draft" state and which fields can be NULL on drafts, (c) update the migration-bootstrap instruction so existing DBs are guided to run all unapplied migrations in order (the prior wording referenced only `0001_oauth_support.sql` and is stale now that 0001–0008 exist), (d) note that `db/schema.sql` uses `CREATE TABLE IF NOT EXISTS` and is the canonical fresh-install path only — existing DBs must run the migration files.
- `db/schema.sql` updated to reflect the post-migration shape, but with a comment near the `videos` table noting that existing DBs must apply migrations 0007/0008 (re-running schema.sql alone is a no-op against an existing table).
- Manual rollout recipe:
  1. Apply migration `0007` (idempotent against fresh and existing DBs).
  2. Run pre-flight `SELECT COUNT(*) FROM videos WHERE youtube_video_id IS NULL OR youtube_video_id = '';` and the duplicate-detection query — both must return 0.
  3. Apply migration `0008`.
  4. **Verify the unique index exists** before deploying new code: `SELECT indexname FROM pg_indexes WHERE indexname = 'videos_youtube_video_id_unique';` must return one row. (Without this gate, race-condition handling in Unit 4 would silently allow duplicates.)
  5. Apply migrations `0009` (cache table) and `0010` (rate-limit table).
  6. Verify both tables exist: `\d youtube_channel_cache` and `\d request_rate_limits` show the expected schema.
  7. Deploy server with `YOUTUBE_CHANNEL_HANDLE` set (default `@qupuid`); on Vercel, also set `YOUTUBE_UPLOADS_PLAYLIST_ID` to skip channel-resolution calls on cold starts.
  8. Smoke test: hit `GET /api/admin/youtube-channel/videos?page=1` with an admin token; verify response shape (including `available` and `alreadyImported` per item). Repeat — second call should return faster (Postgres cache hit).
  9. Smoke test: bulk-import 1 fresh video via the picker; verify the draft appears in `/admin/videos` with the DRAFT badge, and the cache row is gone (`SELECT * FROM youtube_channel_cache;` returns 0 rows immediately after the import).
  10. Edit the draft, fill in QUPU-fields, publish; verify it appears on the public catalog.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-27-youtube-channel-bulk-import-requirements.md](../brainstorms/2026-04-27-youtube-channel-bulk-import-requirements.md)
- Auth middleware: `api/middleware/auth.ts`
- Existing single-video import: `api/services/youtubeImport.ts`, route at `api/routes/admin.ts:135`
- Validation pipeline: `api/services/videos.ts` `normalizeVideoInput`
- Schema: `db/schema.sql` (videos table)
- Migrations directory: `db/migrations/0001_oauth_support.sql` … `0006_email_otp_and_separate_providers.sql`; new migrations land at `0007_video_drafts.sql` and `0008_youtube_video_id_unique.sql`
- Admin UI shell: `src/components/AdminLayout.tsx`, `src/App.tsx`
- YouTube Data API v3: https://developers.google.com/youtube/v3/docs
