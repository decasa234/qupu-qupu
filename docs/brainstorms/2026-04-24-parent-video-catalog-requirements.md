# Parent Video Catalog & Multi-Child Progress — Requirements

**Date:** 2026-04-24
**Status:** Draft (open questions at bottom)
**Scope:** Standard (new page + schema change for child profiles)

## Problem

Parents watch QUPU quiz videos on YouTube with their kids. After each video they want to log which badge tier the kid earned so progress and badges persist. Today:

- Home (`src/pages/Home.tsx`) only shows 5 hardcoded videos from `src/data/qupuVideos.ts` — no browsing, no search.
- Video detail + score submission already works (`src/pages/VideoDetail.tsx`, `api/services/member.ts`) but is discoverable only via direct slug URL.
- Scores and badges attach to the parent's user row. Families with more than one kid have no way to separate progress.

## Goals

1. Give parents a dedicated browsing page listing all published videos from the DB, with search that matches title, description, or a pasted YouTube URL.
2. Support multiple children per parent account so each kid owns their own score history and badge wall.
3. Reuse existing correct-answers → badge-tier flow — no change to scoring semantics.

## Non-goals

- No change to how a badge tier is determined (still correct-answers count matched against `video_badge_rules`).
- No tier picker UI, no "paste YouTube link to jump" as a separate flow — unified into search.
- No pulling live data from YouTube API. DB is source of truth.
- No sharing / social features for the copy-link case (out of scope — search covers the link input case).
- No per-child customization beyond name + age group in v1.

## Users

- **Parent** — regular authenticated user, default `role`. Owns 1+ child profiles. Browses catalog, picks active child, inputs scores on child's behalf.
- **Admin** — unchanged. Manages videos via `/admin/videos`.

## User stories

1. As a parent, I open `/videos`, see every published video, and scroll/search to find the one my kid just watched on YouTube.
2. As a parent who has the YouTube link open in another tab, I paste the URL into the search bar and the matching video comes up.
3. As a parent with two kids, I switch the active child in the navbar before entering a score; the score and badge attach to that child only.
4. As a parent, my dashboard and badges pages show data for the active child, with a switcher to see the other child.
5. As a new parent just after signup, I'm prompted to create my first child profile before I can submit a score.

## Functional requirements

### Video catalog page (`/videos`)

- New route `src/pages/Videos.tsx`, linked from Navbar.
- Home's "Video Terbaru" section and the new catalog both read from DB via `/api/public/videos`. Retire `QUPU_VIDEOS` from runtime use; migrate its contents into a seed so existing video IDs persist.
- Grid of video cards (reuse `src/components/VideoCard.tsx`). Each card links to `/videos/:slug`.
- Sticky search input at the top. On input:
  - Plain text → matches title and description (current behavior preserved).
  - A pasted URL (contains `youtube.com` or `youtu.be`) → extract video ID with existing `extractYouTubeVideoId` (`api/lib/youtube.ts`), match against `videos.youtube_video_id`.
  - Backend `listPublicVideos` (`api/services/videos.ts:191`) extends the search branch to also `OR` against `youtube_video_id ILIKE` and `youtube_url ILIKE`, plus a direct equality branch when the client pre-extracts an ID.
- Optional subject filter chips using `/api/public/meta` subjects (lightweight add — OK to defer).
- Empty state when search returns nothing.

### Multi-child profiles

Schema (new migration under `db/`):

- `children` table: `id uuid pk`, `parent_user_id uuid fk users(id) on delete cascade`, `name text not null`, `age_group_id uuid fk age_groups(id) null`, `avatar_color text null`, `created_at timestamptz`, `updated_at timestamptz`. Index on `parent_user_id`.
- `score_attempts`: add `child_id uuid fk children(id) on delete cascade`. Backfill not needed (no production data). Drop old `user_id` column OR keep for admin audit — decide during planning.
- `user_badge_unlocks`: rename conceptually to `child_badge_unlocks`, swap `user_id` for `child_id`, keep unique `(child_id, video_id)`.

API:

- `GET /api/me/children` — list parent's children.
- `POST /api/me/children` — create child `{ name, ageGroupId?, avatarColor? }`.
- `PATCH /api/me/children/:id` — edit.
- `DELETE /api/me/children/:id` — soft delete or hard — TBD planning.
- `POST /api/me/video-scores` — add required `childId` field to request body; validate child belongs to authenticated parent.
- `GET /api/me/progress` and `GET /api/me/badges` — accept `?childId=` query; default to active child on client.

Client:

- Extend `src/store/authStore.ts` with `activeChildId` persisted in localStorage.
- Navbar (`src/components/Navbar.tsx`) shows active child name + switcher dropdown; "Add child" opens a small modal.
- `VideoDetail.tsx` form requires active child; if none, inline prompt "Tambah profil anak dulu" that opens the modal.
- `Dashboard.tsx` and `Badges.tsx` read for the active child only. Switcher at top reuses the navbar control.
- Post-registration flow: after successful register, redirect to a "Create first child" step before `/dashboard`.

### Naming / copy

- Update auth screens and navbar copy to use "akun orang tua" / "orang tua" where appropriate. No schema rename of `users.role`.

## Success criteria

- A logged-out visitor on `/videos` can browse and search the full published catalog.
- Parent can paste a YouTube watch URL into search and find the matching DB video in one result.
- Parent with two child profiles sees distinct score history and badges for each child, with no cross-contamination.
- Score submission is rejected when no active child is selected or the `childId` does not belong to the parent.
- Existing `/videos/:slug` detail page continues to work; only change is a `childId` in the score payload.

## Open questions (resolve in planning)

1. Migration strategy — since there's no production data, do we drop the old `user_id` columns on `score_attempts` / `user_badge_unlocks` outright, or keep nullable for admin reporting?
2. Child deletion — cascade scores + badges, or soft-delete to preserve history?
3. Subject filter on `/videos` — ship in v1 or defer?
4. Does Home page's "Video Terbaru" section need a "View all" link pointing to `/videos`, or is the existing external YouTube link kept?
5. For paste-link search: if a pasted YouTube URL matches no DB video, show an empty state or a "this video isn't in the catalog yet" affordance?
6. How are admin-created videos assigned to ages across child profiles — show all videos regardless of child age, or filter by child's `age_group_id` with an "unlock all" toggle?

## Out of scope

- Parental controls beyond profile switching.
- Child-authored content, avatars beyond a color swatch.
- YouTube Data API integration.
- Per-child notifications or reminders.
- Public profile sharing.
