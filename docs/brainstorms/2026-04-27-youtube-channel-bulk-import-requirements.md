---
date: 2026-04-27
topic: youtube-channel-bulk-import
---

# YouTube Channel Bulk Import Picker

## Problem Frame

Adding a video to the QUPU catalog today requires an admin to copy each YouTube URL by hand from the channel and paste it into the AdminVideos form one video at a time. The single-video metadata fetcher in `api/services/youtubeImport.ts` helps with one URL at a time but offers no way to see "what's already on the channel that I haven't imported yet", forcing manual reconciliation against the channel page. As the QUPU back-catalog grows, this becomes the slowest part of catalog seeding and creates real risk of missed or duplicated videos.

## Requirements

**Channel listing**
- R1. The admin app has a new picker view that lists every video on the QUPU YouTube channel (`@qupuid`), paged, in oldest-first publish order.
- R2. The channel identity is configured server-side (not entered by the admin per visit) and the listing is sourced from the channel's uploads playlist so every public upload is reachable from a single source. The new listing and bulk-create endpoints mount under `/api/admin/` and inherit the existing `authenticateToken + requireAdmin` middleware chain.
- R3. Each row in the picker shows at minimum the YouTube thumbnail, title, publish date, and a status indicator showing whether the video is already in the QUPU catalog.

**Already-imported handling**
- R4. A video is considered "already in catalog" if any row in `videos` matches its YouTube video ID, **regardless of `is_published` status** — drafts count as "in catalog". Already-imported videos remain visible in the picker but their selection control is disabled and they display an "In catalog" badge. Uniqueness is also enforced at the DB layer via a UNIQUE index on `videos.youtube_video_id` (see Dependencies / Assumptions) so concurrent admin sessions and double-submits cannot produce silent duplicates.

**Multi-select draft import**
- R5. Admins can multi-select un-imported rows in the picker and trigger a single "Import N as drafts" action that creates one catalog entry per selected video in one server round-trip. The action is best-effort: the server returns a per-row response shape `{ youtube_video_id, status, error? }`, and the picker re-renders only the failed rows so the admin can retry without losing successful imports. A unique-violation on `youtube_video_id` is reported as `status: "already_imported"` rather than as an error.
- R6. Drafts are created with `is_published = false` and YouTube-derived metadata only (title, description, thumbnail, `youtube_url`, `youtube_video_id`). QUPU-specific fields (`subject_id`, `age_group_id`, `number_of_questions`, badge family, badge rules) persist as `NULL` (or empty for badge rules) and are filled in later by the admin via the existing AdminVideos editor. YouTube-origin strings are sanitized at the service layer before DB write — title and description are HTML-stripped and length-capped to the schema's VARCHAR limits; the thumbnail URL is validated as `https://`-only. The slug for a draft is `slugify(title)`; on collision with any existing row, the bulk-insert service appends `-{youtube_video_id}` as a deterministic disambiguator.
- R7. The validation split lives inside `normalizeVideoInput` itself: the function receives the target `is_published` value and conditionally short-circuits the `subject_id`/`age_group_id`/`number_of_questions`/badge-family/badge-rule checks when `false`. Transitioning a video to `is_published = true` re-runs the full validation; if any required field is missing, the publish attempt is rejected with a structured error indicating which fields are incomplete, and the admin stays on the editor with the relevant fields surfaced. A database CHECK constraint backs the same invariant in case the application path is bypassed (see Dependencies / Assumptions).

**Catalog visibility**
- R8. The public catalog endpoints (`/api/public/videos*`) continue to surface only `is_published = true` rows — drafts created by bulk import are invisible to members until an admin completes and publishes them.
- R9. The admin catalog list visibly distinguishes draft rows from published rows so the admin can see and resume incomplete imports.

## Success Criteria

- An admin can go from "I have N new YouTube videos on the channel" to "I have N drafts queued in the admin catalog" in a single multi-select action, without leaving the admin app.
- Drafts created via bulk import are surfaced clearly enough in the admin catalog (and, when stale past a reasonable age, visible as a stalled-drafts signal) that draft-to-publish completion is tractable — success is measured by published videos reaching members, not just drafts being queued.
- Re-opening the picker after some imports clearly shows which channel videos are already in the catalog and prevents accidental duplicate imports — both in the same session and across concurrent admin sessions.
- Public-facing pages never show drafts, and the existing "every published video has 3 valid badge rules" guarantee still holds for every video where `is_published = true`.

## Scope Boundaries

- Out: Auto-sync / scheduled polling of the channel for new uploads. The picker is admin-triggered each time.
- Out: Updating already-imported videos when their YouTube metadata (title, thumbnail, etc.) changes upstream.
- Out: Importing playlists other than the channel's uploads playlist.
- Out: Multi-channel support — only `@qupuid` is in scope for v1.
- Out: Handling videos that were public when imported but later became private/unlisted/deleted on YouTube.
- Out: Re-importing a video that already exists in the catalog. "Already exists" covers both drafts (`is_published = false`) and published rows — the picker disables selection for any YouTube ID present in `videos` regardless of publish state.
- Out: A single-click "open the prefilled create form" alternative flow — multi-select drafts is the only entry point from the picker in v1.

## Key Decisions

- **Browse + import picker, not auto-sync or one-off script**: gives the admin explicit control over what enters the catalog and visibility into channel-vs-catalog drift.
- **Multi-select → bulk drafts, not single-pick prefilled form**: scales to back-catalog seeding; drafts let the admin batch the QUPU-metadata work afterward instead of finishing every video inline.
- **Channel handle in env var (`YOUTUBE_CHANNEL_HANDLE`, default `@qupuid`)**: matches the existing `YOUTUBE_API_KEY` pattern, supports staging or rebrand without a code change, and resolves the contradiction between R2's "configured server-side" and a literal source-code constant.
- **Already-imported = show + disable** (over hide-entirely or allow-re-import): preserves the full channel-vs-catalog picture every visit while preventing duplicates.
- **Drafts via nullable QUPU-fields + publish-time CHECK**: ship a migration making `videos.subject_id`, `videos.age_group_id`, and `videos.number_of_questions` nullable with a CHECK that requires them when `is_published = true`. Keeps the "draft = `is_published = false`" semantic clean and avoids fake sentinel rows in `subjects`/`age_groups`. The existing public-catalog query already filters on `is_published`, so the public surface needs no further change beyond the migration.

## Dependencies / Assumptions

- `YOUTUBE_API_KEY` is already configured server-side and used by the single-video importer at `api/services/youtubeImport.ts`. The bulk listing reuses the same key.
- `YOUTUBE_CHANNEL_HANDLE` is a new server env var (default `@qupuid`); documented in `.env.example` alongside `YOUTUBE_API_KEY` and validated at startup as non-empty.
- Schema migrations land as part of this work:
  - Make `videos.subject_id`, `videos.age_group_id`, and `videos.number_of_questions` nullable, and add a CHECK constraint that requires them whenever `is_published = true`.
  - Add a UNIQUE index on `videos.youtube_video_id` to enforce dedupe at the DB layer. A pre-flight verification confirms no existing rows have NULL or duplicate values before the index migration runs.
- The new `/api/admin/` listing and bulk-create endpoints inherit the existing `authenticateToken + requireAdmin` middleware — the same gate the rest of `/api/admin/*` uses.
- The listing endpoint caches channel playlist pages server-side (e.g., 5–10 minute TTL) and applies a per-admin rate limit on the listing call. Combined, these bound YouTube API quota consumption regardless of admin browsing behavior and limit the blast radius of a compromised admin session burning quota in a tight loop.
- The bulk-insert service sanitizes YouTube-origin strings before DB write — HTML-strip title and description, length-cap to schema VARCHAR limits, and require `https://` on thumbnail URLs — so a maliciously named YouTube video cannot inject markup into the admin UI when drafts are later edited.
- The QUPU YouTube channel exposes its uploads via the standard YouTube Data API v3 uploads playlist (true for any normal public channel).
- YouTube Data API v3 daily quota (10,000 units/day default) is not a constraint at expected catalog sizes: one full channel listing costs roughly 1 unit per 50 videos for `playlistItems.list`, plus an additional 1 unit per 50 videos for `videos.list` if richer per-video snippet data is needed for the picker UI.
- An "Incomplete drafts" surface inside the admin catalog list is part of the value of this feature, not a separate feature — admins must be able to find and finish drafts they created.

## Outstanding Questions

### Resolve Before Planning

(none — the round-1 doc review resolved the schema conflict, validation split, dedupe strategy, transactionality response shape, channel-identity contradiction, and security gaps. Remaining items are surface/UX and shadow-path technical details that planning is the right venue for; see the next section.)

### Deferred to Planning

See `## Deferred / Open Questions → From 2026-04-27 review` below — the round-1 review consolidated all technical-detail deferrals into a single section.

## Deferred / Open Questions

### From 2026-04-27 review

- [Affects R1] Picker placement in the admin UI: dedicated route (e.g. `/admin/videos/import`), tab/panel inside `/admin/videos`, or a full-screen modal launched from AdminVideos. Each cascades into different changes to `App.tsx`, `AdminLayout`, and the admin sidebar — pick before any frontend implementation begins.
- [Affects R5] Multi-select interaction model: per-row checkbox column placement (left of thumbnail recommended), sticky action bar that appears on first selection with the running "N selected — Import as drafts" count, whether "select all on this page" is supported, and what happens to the selection state when the admin pages forward.
- [Affects R1] Pagination strategy and oldest-first ordering: `playlistItems.list` returns 50/page newest-first by default. Decide whether the picker (a) loads one API page at a time (fast first paint, oldest-first only within the visible page), (b) buffers all pages then sorts client-side (slower first paint, true oldest-first across the channel), or (c) reverses cursor semantics another way. Also: do selections persist when paging forward, or are they scoped to the current page?
- [Affects R9] Draft visual distinction in the admin catalog: per-row status badge (e.g., "DRAFT" / "Belum dipublikasikan"), a "Drafts" filter chip in the list header, a sectioned layout, or some combination. Minimum unambiguous treatment: row badge plus a top-of-list filter chip.
- [Affects R3, R4] Imported-status check placement: server-side (the listing endpoint joins against `videos.youtube_video_id` and annotates each row before returning) versus client-side (frontend fetches the YouTube list and the imported-IDs list separately and merges). Server-side is the recommended path — single round-trip, no stale state visible during concurrent-admin work.
- [Affects R1, R2] Listing endpoint shadow paths: how the picker handles items whose follow-up `videos.list` indicates `privacyStatus=private` or `404` (skip vs. show with disabled state and reason), what the UI shows on `403 quotaExceeded` or a network failure mid-pagination, and whether partial pages are surfaced or the whole listing fails.
- [Affects R1] Empty-state copy when every channel video is already in the catalog (e.g., "Semua video di channel sudah ada di katalog" with a link back to the admin video list).
- [Affects R2] `@qupuid` → channel ID → uploads playlist ID resolution: resolve once at first request and cache in process memory for the server lifetime, or skip resolution entirely by reading the playlist ID from a second env var (`YOUTUBE_UPLOADS_PLAYLIST_ID`). The channel ID rarely changes; pick the simpler approach.

## Next Steps

-> `/ce-plan` for structured implementation planning.
