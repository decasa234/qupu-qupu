---
title: "feat: Parent accounts, multi-child profiles, and video catalog"
type: feat
status: active
date: 2026-04-24
origin: docs/brainstorms/2026-04-24-parent-video-catalog-requirements.md
---

# feat: Parent accounts, multi-child profiles, and video catalog

## Overview

Let parents create an account, add multiple child profiles, browse the full DB-backed video catalog with a single search bar that accepts title / description / YouTube URLs, and log each kid's quiz results against the correct child. Existing correct-answers → badge-tier flow is preserved; score ownership moves from `user_id` to `child_id`.

## Problem Frame

Today the Home page shows only 5 videos hardcoded in `src/data/qupuVideos.ts`. Quiz scoring works on `/videos/:slug` but attaches badges to the parent's `user_id`, so families with more than one kid cannot separate progress. There is no catalog page and no way to paste a YouTube link to find the matching DB video. See origin doc for full context.

## Requirements Trace

- **R1** — Dedicated catalog page lists all published videos with search. *(origin: Goal 1)*
- **R2** — Search bar matches title, description, and pasted YouTube URL/ID. *(origin: Functional requirements → Video catalog page)*
- **R3** — Parents have 1+ child profiles; scores and badges attach to the active child. *(origin: Goal 2, User stories 3–5)*
- **R4** — Correct-answers → badge-tier flow unchanged. *(origin: Goal 3, Non-goals)*
- **R5** — DB is single source of truth for videos; `QUPU_VIDEOS` retired from runtime. *(origin: decisions)*
- **R6** — Post-registration prompts parent to create first child before scoring. *(origin: User story 5)*

## Scope Boundaries

- No tier-picker UI; score input stays as correct-answers count.
- No YouTube Data API integration; DB remains source of truth.
- No social/sharing features beyond the search-by-URL use case.
- No per-child customization beyond `name` + `age_group_id` + optional `avatar_color`.
- No new admin flows; existing `/admin/videos` is untouched.

### Deferred to Separate Tasks

- Subject filter chips on `/videos` page — may ship in a follow-up if search alone feels thin after internal testing. *(origin open question 3)*
- Age-based catalog filtering per child (show only videos matching child's `age_group_id`). *(origin open question 6 — deferred; v1 shows all)*

## Context & Research

### Relevant Code and Patterns

- `api/services/videos.ts` — `listPublicVideos` (line 191), `normalizeVideoInput`, `withTransaction` pattern, VIDEO_SELECT const, `syncVideoBadgeRules` reference for nested DELETE-then-INSERT inside a transaction.
- `api/services/member.ts` — `submitVideoScore` (line 12) and `getMemberProgress`/`getMemberBadges` — all queries key on `user_id`, must pivot to `child_id`.
- `api/middleware/auth.ts` — `authenticateToken` populates `req.user.id`; add a `requireOwnChild(childId)` helper pattern alongside it.
- `api/lib/youtube.ts` — `extractYouTubeVideoId` already covers `youtu.be`, `watch?v=`, `embed/`, `shorts/`, and raw 11-char IDs. Reuse on both client and server.
- `api/routes/member.ts` — current shape for thin router → service handoff; mirror for `/api/me/children`.
- `src/store/authStore.ts` — zustand persist under `auth-storage`; extend with `children` list and `activeChildId`. Keep existing `auth_token` side-store intact (referenced by `src/lib/api.ts` interceptor).
- `src/pages/VideoDetail.tsx` — existing score form (line 186-254); change submit payload to include `childId`; add inline prompt when no active child.
- `src/pages/Home.tsx` `VideosSection` — swap hardcoded source for `/api/public/videos` fetch.
- `src/components/VideoCard.tsx` — reuse for `/videos` grid.

### Institutional Learnings

- CLAUDE.md: imports inside `api/` use `.js` extensions on `.ts` files — keep that.
- CLAUDE.md: the project manually applies `db/schema.sql` + `db/seed.sql`; there is no migration tool. Schema changes are expressed by editing those two files and re-running. No production data — destructive changes are safe.
- CLAUDE.md: routes are thin; business rules live in `api/services/*`.

### External References

- None required. All patterns are local.

## Key Technical Decisions

- **Drop old `user_id` columns on `score_attempts` and `user_badge_unlocks`** rather than keeping them nullable. Rationale: no production data; parallel columns invite divergence in services and reporting. *(origin open question 1)*
- **Child delete = hard delete with cascade** on `score_attempts` and `user_badge_unlocks`. Rationale: simpler mental model, consistent with "no prod data" posture; revisit if parents in beta ask for restore. *(origin open question 2)*
- **Active child lives in zustand persist**, not a DB column. Rationale: it's a UI preference, not a business fact. Keeps server stateless.
- **Score endpoint validates `childId` ownership** inside `submitVideoScore` service via a JOIN that requires `children.parent_user_id = :userId`. Fail closed with a 403-equivalent error. Rationale: one service call, no second round-trip.
- **Search stays server-side** with extended `OR` clause covering `title`, `description`, `youtube_video_id`, and `youtube_url`. Client optionally pre-extracts video ID from a URL and sends it as-is — server's ILIKE on `youtube_video_id` handles both cases. Rationale: lets parents paste anything and get a hit.
- **Relax `users.age` CHECK** — change `CHECK (age >= 6 AND age <= 16)` to `CHECK (age IS NULL OR age BETWEEN 6 AND 120)` so a parent's age is valid and optional at registration. Rationale: current constraint was built assuming users are students; it blocks parent signup.
- **Registration sets `role = 'parent'`** by default (already valid in enum) and makes the `age` field optional on the register form for parents.
- **Home "Video Terbaru" and `/videos` both fetch `/api/public/videos`.** `QUPU_VIDEOS` is migrated into `db/seed.sql` with matching metadata and removed from runtime imports. Keep the file only as a migration reference comment, then delete in a follow-up cleanup.

## Open Questions

### Resolved During Planning

- Column drop vs nullable → **drop** (key decision).
- Child delete cascade vs soft → **cascade** (key decision).
- Parent `age` field → optional, expand CHECK (key decision).
- Catalog age-filter per child → defer to follow-up (scope boundary).

### Deferred to Implementation

- Exact copy for child switcher dropdown and onboarding modal (write once components exist).
- Whether avatar_color defaults should be deterministic from child name or randomly picked from a palette — decide during UI build.
- Empty-state design when a pasted YouTube URL matches no DB video (origin Q5) — confirm with a real miss during QA.

## Implementation Units

- [ ] **Unit 1: Schema pivot — children table, FK swap, age CHECK relax**

**Goal:** Make the DB represent children as first-class owners of scores and badges, and allow parents to register without failing the age CHECK.

**Requirements:** R3, R6

**Dependencies:** None.

**Files:**
- Modify: `db/schema.sql`
- Modify: `db/seed.sql`

**Approach:**
- Add `children` table: `id uuid pk default gen_random_uuid()`, `parent_user_id uuid not null references users(id) on delete cascade`, `name varchar(80) not null`, `age_group_id uuid references age_groups(id) on delete set null`, `avatar_color varchar(20)`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`. Index on `parent_user_id`.
- On `score_attempts`: drop `user_id` column and its FK; add `child_id uuid not null references children(id) on delete cascade`. Update `idx_score_attempts_user_created` → `idx_score_attempts_child_created` on `(child_id, created_at DESC)`.
- On `user_badge_unlocks`: same swap — drop `user_id`, add `child_id`, change the UNIQUE to `(child_id, video_id)`, and update `idx_user_badge_unlocks_user` to `idx_child_badge_unlocks_child`.
- Relax `users.age`: `age INTEGER NULL CHECK (age IS NULL OR age BETWEEN 6 AND 120)`.
- Update `db/seed.sql` to align with the new schema (no seeded children needed; existing seed data is video metadata). Remove any seed scores/unlocks that key on `user_id`.

**Patterns to follow:**
- Existing table style in `db/schema.sql` (UUID PKs, `NOT NULL DEFAULT NOW()` timestamps, named UNIQUEs and indexes).

**Test scenarios:**
- *Happy path:* Fresh `psql -f db/schema.sql` against an empty database applies without errors.
- *Happy path:* Subsequent `psql -f db/seed.sql` applies without errors and leaves `children` empty and `videos` populated.
- *Edge case:* A second run of `db/schema.sql` is a no-op (all `CREATE ... IF NOT EXISTS`). Since columns are being swapped, document in the plan that developers must drop their local DB or run a dev-reset before re-applying — there's no ALTER strategy for greenfield schema files.

**Verification:**
- `\d children`, `\d score_attempts`, `\d user_badge_unlocks` show the new columns, FKs, and indexes.
- `INSERT INTO users (..., age) VALUES (..., NULL)` succeeds for a parent row.

---

- [ ] **Unit 2: Migrate `QUPU_VIDEOS` hardcoded list into `db/seed.sql`**

**Goal:** Make DB the sole runtime source for video listings; preserve every existing video by migrating from `src/data/qupuVideos.ts`.

**Requirements:** R1, R5

**Dependencies:** Unit 1.

**Files:**
- Modify: `db/seed.sql`
- Reference (do not import at runtime after this unit): `src/data/qupuVideos.ts`

**Approach:**
- For each of the videos in `src/data/qupuVideos.ts` `QUPU_VIDEOS`, add a `videos` insert keyed by a generated slug (use `slugify(shortTitle)`). Map `category` → `subjects.slug` (may need new subject rows for any category not already seeded). Pick a reasonable `age_group_id`, `badge_family_id`, and `number_of_questions` per video — where the metadata is missing, use sensible defaults and mark videos as `is_published = TRUE`, `is_featured = FALSE` by default with the first five `is_featured = TRUE` to preserve Home's "Video Terbaru" behavior.
- Ensure each inserted video has 3 accompanying `video_badge_rules` rows covering the full range (required by `normalizeVideoInput` invariants — `api/services/videos.ts:339`).
- `QUPU_VIDEOS` stays in the file only long enough for cleanup in Unit 8; no frontend consumer from Unit 7+ reads it.

**Patterns to follow:**
- Existing `db/seed.sql` entries for `subjects`, `age_groups`, `badge_families`, `badge_tiers`, `videos`, and `video_badge_rules`.

**Test scenarios:**
- *Happy path:* After seed, `SELECT COUNT(*) FROM videos WHERE is_published = TRUE` ≥ number of `QUPU_VIDEOS` entries.
- *Happy path:* `GET /api/public/videos` (no filters) returns every migrated video.
- *Integration:* `GET /api/public/videos/:slug` for a migrated video returns embed URL and badge rules.
- *Edge case:* `GET /api/public/videos?search=<substring from a migrated title>` finds the matching row.

**Verification:**
- Home page in dev shows the same or richer lineup than before, loading from API rather than from the imported constant.

---

- [ ] **Unit 3: `/api/me/children` CRUD**

**Goal:** Let the authenticated parent list, create, edit, and delete their children.

**Requirements:** R3, R6

**Dependencies:** Unit 1.

**Files:**
- Create: `api/services/children.ts`
- Create: `api/routes/children.ts`
- Modify: `api/app.ts` (mount `/api/me/children` under the member router, or add a sibling router mount)
- Test: manual via curl for now (no test runner is configured per CLAUDE.md)

**Approach:**
- `listChildren(parentUserId)` — returns array of `{ id, name, ageGroupId, avatarColor, createdAt }`.
- `createChild(parentUserId, input)` — Joi validates `{ name (1-80), ageGroupId? (uuid), avatarColor? (string) }`; insert and return the row.
- `updateChild(parentUserId, childId, input)` — `UPDATE ... WHERE id = $1 AND parent_user_id = $2`; return null if not owned.
- `deleteChild(parentUserId, childId)` — `DELETE ... WHERE id = $1 AND parent_user_id = $2`; relies on schema cascade to drop scores and unlocks. Return `{ deleted: boolean }`.
- Route handlers: thin, reuse `authenticateToken`, shape as `res.json({ success, data })` matching existing member routes.

**Patterns to follow:**
- `api/routes/member.ts` route style.
- `api/services/videos.ts` for service-layer shape (Joi-less at the service boundary; validation in routes).
- Authorization-by-query pattern: always include `parent_user_id` in the WHERE clause rather than loading the row first and comparing in JS.

**Test scenarios:**
- *Happy path:* `POST /api/me/children { name: "Aira" }` returns the new child with `parentUserId` matching the caller.
- *Happy path:* `GET /api/me/children` returns only this parent's children.
- *Error path:* `PATCH /api/me/children/<other-parents-child>` returns 404 (authorization-by-query produces a null row).
- *Error path:* `POST` with empty name or `name` > 80 chars returns 400 from Joi.
- *Integration:* `DELETE` cascades — after deletion, `SELECT COUNT(*) FROM score_attempts WHERE child_id = ...` is 0.

**Verification:**
- Manual curl run-through: create, list, patch, delete round-trips cleanly with a valid JWT.

---

- [ ] **Unit 4: Pivot member endpoints to `child_id`**

**Goal:** Scores, progress, and badges all scope to the active child rather than the parent user.

**Requirements:** R3, R4

**Dependencies:** Units 1 & 3.

**Files:**
- Modify: `api/services/member.ts`
- Modify: `api/routes/member.ts`

**Approach:**
- `submitVideoScore({ userId, childId, videoId, correctAnswers })` — at the top, verify child ownership via `SELECT 1 FROM children WHERE id = $1 AND parent_user_id = $2` inside the same `withTransaction`; throw `Error('Child not found')` if missing. Swap every `user_id` reference to `child_id`. `existingUnlock` query becomes `WHERE child_id = $1 AND video_id = $2`. `upsertBadgeUnlock` ON CONFLICT clause becomes `(child_id, video_id)`.
- `getMemberProgress(userId, childId)` — verify child ownership once up front, then every subquery keyed on `sa.user_id = $1` becomes `sa.child_id = $childId`, same for `ubu`.
- `getMemberBadges(userId, childId)` — verify ownership, then `WHERE ubu.child_id = $1`.
- `api/routes/member.ts` — extend Joi `scoreSchema` with `childId: Joi.string().uuid().required()`; `/progress` and `/badges` accept `childId` as query param (required).

**Patterns to follow:**
- Existing transactional flow in `submitVideoScore`.
- Existing Joi error 400 branch.

**Test scenarios:**
- *Happy path:* Submit score for an owned `childId` — unlocks badge as today, returns `{ attempt, unlockedBadge, isUpgrade }`.
- *Happy path:* Two children on the same video at different scores produce two independent `user_badge_unlocks` rows (one per `child_id`).
- *Error path:* Submit score for a `childId` belonging to another parent — returns 400 with "Child not found".
- *Error path:* Submit score without `childId` — 400 from Joi.
- *Edge case:* Progress and Badges endpoints for a newly-created child return empty summary/arrays with zeroed counts.
- *Integration:* `isUpgrade = true` only when the *same child* previously had a lower tier on the same video.

**Verification:**
- Two local test children produce separate dashboard and badge data with no cross-leakage.

---

- [ ] **Unit 5: Extend public video search to match YouTube URL / ID**

**Goal:** Parent can paste a YouTube watch URL, share URL, or raw ID into the catalog search bar and find the matching video.

**Requirements:** R2

**Dependencies:** Unit 2 (seed data must be present for real search results).

**Files:**
- Modify: `api/services/videos.ts` (`listPublicVideos`)

**Approach:**
- Keep existing `search` param. Inside the `if (options.search)` branch, additionally check whether the search term contains `youtube.com` / `youtu.be` or matches `^[a-zA-Z0-9_-]{11}$`. When either is true, import `extractYouTubeVideoId` from `../lib/youtube.js` and use the extracted ID for an extra equality match.
- New clause shape:
  - If extracted ID: `(v.title ILIKE $1 OR v.description ILIKE $1 OR v.youtube_video_id = $2 OR v.youtube_url ILIKE $1)`.
  - Else: `(v.title ILIKE $1 OR v.description ILIKE $1 OR v.youtube_video_id ILIKE $1 OR v.youtube_url ILIKE $1)`.
- Leave `featured` and `subject` params untouched.

**Patterns to follow:**
- Existing condition/param threading inside `listPublicVideos` (`api/services/videos.ts:196`).

**Test scenarios:**
- *Happy path:* `?search=matematika` (title substring) returns the existing matches.
- *Happy path:* `?search=https://www.youtube.com/watch?v=AelKNOcUb18` returns only that video.
- *Happy path:* `?search=https://youtu.be/AelKNOcUb18` returns only that video.
- *Happy path:* `?search=AelKNOcUb18` (raw ID) returns only that video.
- *Edge case:* `?search=` (empty) is ignored and the full published list is returned.
- *Edge case:* `?search=notreallyanid1234567890` returns empty (length > 11 or invalid chars) without DB error.

**Verification:**
- Endpoint responds ≤100ms for a 30-video catalog under each scenario above.

---

- [ ] **Unit 6: Auth store, child switcher, and "add child" modal**

**Goal:** Client carries the active child across navigation; parent can add and switch children from the Navbar.

**Requirements:** R3

**Dependencies:** Unit 3 (children API must exist).

**Files:**
- Modify: `src/store/authStore.ts`
- Modify: `src/components/Navbar.tsx`
- Create: `src/components/ChildSwitcher.tsx`
- Create: `src/components/ChildModal.tsx`
- Modify: `src/types/index.ts` (add `Child` type, extend `AuthStore` fields)

**Approach:**
- `authStore` gains `children: Child[]`, `activeChildId: string | null`, and actions `setChildren`, `addChild`, `removeChild`, `setActiveChild`. Persist via existing zustand `persist`. Leave `auth_token` side-store alone.
- On login success (`src/pages/Login.tsx`) and on app mount when authenticated (add a `useEffect` in `Layout.tsx`), fetch `/api/me/children`. If response is empty, leave `activeChildId = null`. If non-empty and `activeChildId` is null or points to a deleted child, default to the first child.
- `ChildSwitcher` dropdown lives in the Navbar when authenticated. Shows active child's name + avatar_color swatch; clicking opens the menu with each child + a "Tambah anak" row that opens `ChildModal`.
- `ChildModal` = small form with name (required), age group (select from `/api/public/meta` `ageGroups`), avatar color (4-6 preset swatches). On save → `POST /api/me/children`, then `setActiveChild(newChild.id)`, then close.

**Patterns to follow:**
- Existing zustand persist shape in `src/store/authStore.ts`.
- Fetch via shared axios instance (`src/lib/api.ts`) — auth header + 401 interceptor already handled.

**Test scenarios:**
- *Happy path:* Logged-in parent with 2 children sees the switcher in Navbar; clicking a different child updates `activeChildId` in localStorage.
- *Happy path:* Adding a child via modal appears immediately in the dropdown and becomes active.
- *Edge case:* On logout, `children` and `activeChildId` are cleared.
- *Edge case:* If the backend returns 0 children (new parent), switcher shows "Tambah anak dulu" CTA only — no active child is auto-picked.
- *Integration:* 401 from `/api/me/children` triggers existing interceptor's localStorage clear and redirects to `/login`.

**Verification:**
- Switching child in Navbar causes Dashboard / Badges pages (Unit 8) to re-fetch and show the new child's data.

---

- [ ] **Unit 7: Post-register "create first child" onboarding + parent registration relax**

**Goal:** A newly-registered parent lands on a dedicated "add your first child" step before `/dashboard`; registration accepts parents without a student-age value.

**Requirements:** R6

**Dependencies:** Unit 6 (ChildModal exists), Unit 1 (age CHECK relaxed).

**Files:**
- Modify: `src/pages/Register.tsx`
- Create: `src/pages/OnboardingChild.tsx`
- Modify: `src/App.tsx` (add `onboarding/child` route, protected)
- Modify: `api/routes/auth.ts` (allow `age` to be null for `role='parent'`)
- Modify: `api/services/*` auth helpers if any (and Joi schema for register)

**Approach:**
- Register form removes the `age` requirement when role is parent; sends `role: 'parent'` explicitly. Current frontend Register page likely defaults to student — adapt copy to "Daftar sebagai orang tua" and drop the age field for the parent flow (or make it "umur anak pertama" and let Unit 6's modal handle it later).
- After successful register → log in → fetch `/api/me/children` → if empty, route to `/onboarding/child` instead of `/dashboard`.
- `OnboardingChild` page wraps `ChildModal` content inline (not a modal) with a headline and a "Lewati untuk sekarang" escape hatch that still routes to `/dashboard` without an active child — score submission will then surface the "no active child" prompt from VideoDetail (Unit 8).

**Patterns to follow:**
- Existing auth flow in `src/pages/Login.tsx` / `Register.tsx`.
- `ProtectedRoute` wrapper in `src/App.tsx`.

**Test scenarios:**
- *Happy path:* New parent registers (no age) → onboarding page appears → after adding child → lands on `/dashboard` with active child set.
- *Happy path:* Existing parent with ≥1 children who logs in never sees onboarding.
- *Error path:* Parent registration with age 5 is rejected by the Joi schema (lower bound still 6) with a clear message.
- *Edge case:* "Lewati" → land on dashboard with no active child; every protected action shows the inline prompt from VideoDetail.
- *Integration:* Backend rejects `role='parent'` with an age constraint mismatch returning 400 gracefully.

**Verification:**
- Full signup → onboarding → score submission flow runs end-to-end in dev.

---

- [ ] **Unit 8: `/videos` catalog page + Home video source swap + VideoDetail child hook-up**

**Goal:** Ship the browsing page, make Home read from the API, and wire the score form to the active child.

**Requirements:** R1, R2, R4, R5

**Dependencies:** Units 2, 4, 5, 6.

**Files:**
- Create: `src/pages/Videos.tsx`
- Modify: `src/pages/Home.tsx` (replace `QUPU_VIDEOS` import with `/api/public/videos` fetch; keep layout)
- Modify: `src/pages/VideoDetail.tsx` (include `activeChildId` in score POST; show prompt when null)
- Modify: `src/pages/Dashboard.tsx` (accept `activeChildId`; re-fetch when it changes)
- Modify: `src/pages/Badges.tsx` (same)
- Modify: `src/App.tsx` (add `/videos` route, public; keep dashboard/badges protected)
- Modify: `src/components/Navbar.tsx` (add "Video" link pointing to `/videos`)
- Delete (last step): `src/data/qupuVideos.ts` once nothing imports it. Also remove `src/components/VideoCard.tsx` references to that file if any.
- Optional: `src/lib/youtube.ts` — if not already present, add a client-side `extractYouTubeVideoId` mirror for pre-extraction in the search bar (skip if the server's fallback logic from Unit 5 is sufficient).

**Approach:**
- `Videos.tsx`: sticky search input (controlled state, debounced 250ms), renders `VideoCard` grid on top of `GET /api/public/videos?search=<term>`. Empty state with a hint for pasting YouTube links. On submit/enter, optionally pre-extract a video ID from the input if the URL regex matches — pass the raw term either way; the server (Unit 5) handles both.
- `Home.tsx` `VideosSection`: on mount fetch `/api/public/videos?featured=true` (falls back to top-5 by `sort_order` if fewer than 5 featured). Replace `QUPU_VIDEOS.slice(0, 5)` usage. Preserve existing visual layout.
- `VideoDetail.tsx` score form: read `activeChildId` from `useAuthStore`. If null and authenticated, replace the input form with "Pilih profil anak dulu" + CTA that opens the switcher / modal from Unit 6. If set, include `childId` in the POST body to `/me/video-scores`.
- `Dashboard.tsx` and `Badges.tsx`: pass `activeChildId` as `?childId=` and add a top-of-page child switcher (reuse `ChildSwitcher` component).
- After the swap verifies in dev, delete `src/data/qupuVideos.ts`. Ensure no other file imports it (grep `QUPU_VIDEOS`).

**Patterns to follow:**
- `src/pages/VideoDetail.tsx` data-load pattern with `useEffect` + `api.get`.
- Existing grid layout + `VideoCard` / `LandingVideoCard` styling so the catalog feels familiar.

**Test scenarios:**
- *Happy path:* `/videos` shows every seeded video in a paginated-or-scrollable grid.
- *Happy path:* Typing "matematika" narrows to title matches.
- *Happy path:* Pasting a YouTube URL of a seeded video opens a one-item result set; clicking navigates to `/videos/:slug`.
- *Happy path:* With an active child, submitting a score returns a badge and Dashboard reflects it for that child only.
- *Edge case:* Authenticated user with no active child on VideoDetail sees the "pilih profil anak" prompt, not the score form.
- *Edge case:* Search for a YouTube URL that isn't in the DB returns empty state with a copy hint (e.g. "Video belum ada di katalog QUPU").
- *Integration:* Switching active child in Navbar re-fetches Dashboard / Badges without a full reload.
- *Regression:* Home "Video Terbaru" section still renders 5 cards and links to the internal slug URLs, not external YouTube URLs (which was the old behavior for the hardcoded list).

**Verification:**
- Run `npm run dev` and walk through: register parent → onboarding child → `/videos` search & paste → open video → submit score → dashboard + badges reflect the active child → switch to a second child and repeat.

## System-Wide Impact

- **Interaction graph:** authStore now drives Navbar switcher, VideoDetail form, Dashboard, and Badges. A single `setActiveChild` call fans out to four surfaces via React re-render.
- **Error propagation:** Score service throws a plain `Error` today (routed to 400). Preserve that by throwing `Error('Child not found')` for ownership failures — the existing catch-all in `/api/me/video-scores` turns it into a 400 with the message.
- **State lifecycle risks:** If a child is deleted while selected, `activeChildId` becomes stale. Mitigation: after `removeChild`, if `activeChildId === removed.id`, set it to the next child (or null). Backend already cascades.
- **API surface parity:** `/api/me/video-scores`, `/api/me/progress`, `/api/me/badges` all gain a required `childId`. No legacy callers exist since there's no production deployment.
- **Integration coverage:** Cross-layer scenarios to verify live: (1) cascade deletion of a child clears dashboard rows, (2) parent-A cannot address parent-B's child via guessed UUIDs, (3) two children on the same video are independent (no accidental shared unlock row).
- **Unchanged invariants:** `/admin/videos` CRUD, `video_badge_rules` shape (still exactly 3 per video), correct-answers → tier logic, `users.role='admin'` gate on admin routes, JWT refresh/login mechanics.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Schema pivot without migration tooling means devs must wipe their local DB | Call this out in the plan intro; add a one-liner `scripts/reset-db.sh` (or document the two-line psql reset in CLAUDE.md follow-up) |
| `QUPU_VIDEOS` → DB seed migration loses metadata (subject colors, category enum) | Generate seed rows programmatically from the TS file once, inspect the diff against Home rendering before deleting the TS file |
| Parent registers without an age, but a `students` or analytics join downstream expects it | Codebase grep: only `/api/users/me` and member services read `age`; audit those during Unit 7 |
| Search ILIKE on `youtube_url` can be slow at scale | Acceptable at current size (dozens of rows); add a trigram index if/when the catalog grows past ~5k rows |
| Child switcher dropdown conflicts visually with existing Navbar layout | Build `ChildSwitcher` as a standalone component and demo it in Storybook-style manual page before wiring to Navbar |
| Parent forgets to pick a child and submits score against nothing | VideoDetail prompt blocks submission; `/api/me/video-scores` validates `childId` server-side as defense in depth |

## Documentation / Operational Notes

- Update `CLAUDE.md` under "Data access" and "Core domain" to reflect the child-keyed score model.
- Update `CLAUDE.md` "Frontend routes" to include `/videos` (public) and `/onboarding/child` (protected).
- Document the manual DB reset command (`psql "$DATABASE_URL" < db/schema.sql && psql "$DATABASE_URL" < db/seed.sql`) in `CLAUDE.md` Commands section.
- `.env.example` unchanged.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-24-parent-video-catalog-requirements.md](../brainstorms/2026-04-24-parent-video-catalog-requirements.md)
- Related code:
  - `api/services/videos.ts` (search extension)
  - `api/services/member.ts` (child_id pivot)
  - `api/lib/youtube.ts` (URL extraction)
  - `src/store/authStore.ts` (active child state)
  - `src/pages/VideoDetail.tsx` (score form)
  - `db/schema.sql` (schema pivot)
- Related PRs/issues: none (pre-release)
- External docs: none
