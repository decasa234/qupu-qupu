# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — run client (Vite on 5173) and API (nodemon/tsx on 3001) concurrently.
- `npm run client:dev` / `npm run server:dev` — run either side alone.
- `npm run build` — `tsc -b && vite build`. The API is not bundled; Vercel builds it separately.
- `npm run check` — typecheck only (`tsc --noEmit`). Use this for quick validation.
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- `npm test` — vitest. Pure unit suites always run; the Postgres integration suites (most of `api/__tests__/`) run only when `TEST_DATABASE_URL` points at a disposable test database and skip themselves otherwise (CI runs without one by design).
- Database bootstrap is manual: apply `db/schema.sql` then `db/seed.sql` against the Postgres instance in `DATABASE_URL`. For an existing DB, apply migrations in `db/migrations/` in numeric order. Fresh installs of `db/schema.sql` already include all migration changes. The `supabase/migrations` folder is legacy and not part of the current flow.

Required env (`.env`, see `.env.example`): `DATABASE_URL`, `JWT_SECRET`, `PORT`, `APP_ORIGIN`, `VITE_API_BASE_URL`. Optional but required for Google sign-in: `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client) — same Google Cloud Web OAuth client id. Required for password registration OTP email delivery: `RESEND_API_KEY` and `RESEND_FROM`. Required for the admin YouTube channel picker and single-video importer: `YOUTUBE_API_KEY`. Optional: `YOUTUBE_CHANNEL_HANDLE` (default `@qupuid`; must match `/^@[A-Za-z0-9_.-]{1,50}$/`) and `YOUTUBE_UPLOADS_PLAYLIST_ID` (skips the `channels.list` resolution call — recommended on Vercel serverless).

## Architecture

Single repo with two halves sharing one `tsconfig.json` (`include: ["src", "api"]`):

- **Frontend** (`src/`) — React 18 + Vite + Tailwind + React Router 7. Path alias `@/*` → `src/*` (via `vite-tsconfig-paths`). The client talks to the API via an absolute base URL: `src/lib/api.ts` uses `VITE_API_BASE_URL` (default `http://localhost:3001/api`), not relative `/api` paths. Vite's `server.proxy` (`vite.config.ts`) forwards any relative `/api/*` request to the production API (`https://api.qupu.id`) and **bypasses source-module requests** (`.ts`/`.tsx`/`.js`/`.mjs`/`.cjs`) so the frontend can import browser-safe shared modules from `api/` (e.g. `api/services/wmi/olympiads/registry.ts`) without the proxy swallowing them as 404s.
- **Backend** (`api/`) — Express app that runs two ways from the same `app.ts`:
  - `api/server.ts` is the local dev entry (nodemon → `tsx api/server.ts`).
  - `api/index.ts` is the Vercel serverless handler; `vercel.json` rewrites `/api/(.*)` to it.
  - Imports inside `api/` use `.js` extensions (ESM-style) even though the files are `.ts` — tsx/Vercel resolve these. Keep that convention when adding files.

### API surface (mounted in `api/app.ts`)

- `/api/auth` — `POST /register-init` + `POST /register-verify` + `POST /register-resend` (email-OTP gated registration via Resend), `POST /login` (only matches rows with `password_hash IS NOT NULL`), `POST /google` (no email-based linking — Google and password are separate identities, may share an email string). Access token expiry is role-aware: 12h hard cap for `admin`, 7d for everyone else. Admin sessions also have a 15-minute frontend idle-timeout via `src/hooks/useIdleLogout.ts`. Refresh token is 30d but plumbing is currently unused — frontend reuses the access token directly until it expires; refresh tokens carry `typ: 'refresh'` and are rejected by `authenticateToken`.
- `/api/users/me` — authenticated profile read/update.
- `/api/public` — unauthenticated meta + video list/detail for the catalog.
- `/api/me` — authenticated member endpoints: submit quiz score, progress, badges.
- `/api/admin` — admin-only video CRUD plus channel-import endpoints (`GET /youtube-channel/videos` lists every upload on the configured channel with cached `alreadyImported` + `available` annotations; `POST /youtube-channel/import` bulk-creates drafts from selected video IDs and returns per-row `{ status, error? }`). The whole router is gated by `authenticateToken` + `requireAdmin`. The listing endpoint also runs through a Postgres-backed sliding-window rate limiter (`api/lib/rateLimit.ts`, 30/min per admin) and a 10-minute Postgres cache (`youtube_channel_cache`) so quota stays bounded across all serverless instances.

Routes are thin: validate with Joi, delegate to `api/services/*`. Put SQL and business rules in services, not route handlers.

### Data access

`api/db.ts` exports a shared `pg.Pool` plus three helpers — always use these instead of calling the pool directly:
- `query<T>(sql, params, executor?)` — rows
- `queryOne<T>(sql, params, executor?)` — first row or null
- `withTransaction(cb)` — runs `cb(client)` inside BEGIN/COMMIT with ROLLBACK on throw

The `executor` parameter is how services thread a transaction client through helpers — pass the `PoolClient` from `withTransaction` so nested reads/writes share the transaction (see `services/videos.ts` `getAdminVideoById`).

### Auth

- `api/middleware/auth.ts` — `authenticateToken` populates `req.user: { id, email, role }`. `requireAdmin` must run after it.
- Client: `src/store/authStore.ts` (zustand + localStorage persist) holds user+token; `src/lib/api.ts` is an axios instance that attaches `Authorization: Bearer ...` and clears storage on 401/403. `src/App.tsx` defines `ProtectedRoute` and `AdminRoute` wrappers used in the route table.
- The token is persisted in two places (`auth_token` raw, plus inside `auth-storage`). The 401 interceptor clears both; preserve that when changing auth.

### Core domain (see `db/schema.sql`)

A **video** has YouTube fields (`youtube_url`, `youtube_video_id`, `slug`, `title`) plus QUPU-specific fields (`subject_id`, `age_group_id`, `number_of_questions`) and one or more `video_badge_rules` rows defining non-overlapping `[min_correct, max_correct]` ranges with a `badge_count` per range.

**Draft semantic**: `is_published = false` rows may have `subject_id`, `age_group_id`, and `number_of_questions` as NULL and zero `video_badge_rules` rows. The `videos_publish_required` CHECK constraint enforces all three are populated whenever `is_published = true`; `normalizeVideoInput` in `services/videos.ts` runs the full badge-range validation only on the publish branch. `youtube_video_id` is UNIQUE at the DB layer (`videos_youtube_video_id_unique`), so the bulk-import service catches `23505` and returns `status: "already_imported"` for duplicates.

`VIDEO_SELECT` uses LEFT JOINs on `subjects` and `age_groups` so draft rows are returned by `listAdminVideos` and `getAdminVideoById`. Public catalog reads filter `is_published = TRUE`, so the LEFT JOIN nulls never reach members at runtime — but `mapVideoCard` emits `subject: null` / `ageGroup: null` for any draft an admin loads.

When a user submits a score (`services/member.ts` `submitVideoScore`):
1. Insert a `score_attempts` row.
2. Find the matching `video_badge_rules` by correct-answer range (highest tier wins if overlap).
3. Upsert into `user_badge_unlocks` — **only upgrade**, never downgrade. `best_correct_answers` uses `GREATEST(...)`. `isUpgrade` is true only when an existing unlock got promoted.

`user_badge_unlocks` is unique per `(user_id, video_id)` — a user has at most one badge per video, representing their best tier reached. Dashboard/badges endpoints read from this table, not from raw score history.

### Frontend routes (`src/App.tsx`)

`/` (Home), `/videos/:slug`, `/login`, `/register`, `/dashboard` (protected), `/badges` (protected), `/admin/videos` (admin-only catalog + editor — has a "Draft / Diterbitkan / Semua" filter chip and an "Impor dari YouTube" button), `/admin/videos/import` (admin-only YouTube channel picker — multi-select rows then "Import N sebagai draft"). Unknown paths redirect to `/`.

## Authoring WMI math problems

Use the **`qupu-math-problem-creation`** skill (`.claude/skills/qupu-math-problem-creation/`) whenever adding or upgrading a WMI concept or paper question's breakdown, illustration, step-by-step, animation, or trap. It encodes the four-role method (question-designer → illustrator / step-explainer / animator, all binding to `params`) and the content rules; W7 (`budget-selection`) is the reference implementation.

**Question stem highlight — use the authored breakdown, not the auto one.** `WmiQuestionView` renders the stem breakdown two ways: `WmiAuthoredBreakdown` (the **refined, standard** renderer — animated, category-colored `fact`/`condition`/`question` from the authored `breakdown` JSON) when `question.breakdown` is present, else `WmiBreakdownView` (the **legacy auto/heuristic** "Cari/Tambah" tinted-box fallback). Always author a `breakdown` so the refined renderer is used; treat `WmiBreakdownView` as a deprecated last-resort fallback — do not design new surfaces around it. Any endpoint that serves concept-instance questions for play should SELECT and pass `breakdown` through (e.g. `api/services/wmi/tracks/lesson.ts`).

**Review fix-loop:** the admin flags granular per-part problems in the review UI (`wmi_review_issues`, migration `0036`). To work them, read open AI-actionable issues via `GET /api/admin/wmi/issues?status=open&ai_actionable=true&concept_slug=…` (concepts) or `&paper_id=…` (papers) — or paste the admin's "Copy issues for Claude" block. Resolve the source from the target + `part` (concept `slug` → illustration/explainer/generator registries; paper `question_id` → the `wmi_questions` row), apply the fix, then `PATCH /api/admin/wmi/issues/:id` to `in_progress` then `fixed` with a `fix_note`; the admin verifies.

## Olympiad past-paper drill figures (always consult the index first)

When **creating or upgrading any olympiad past-paper drill figure** (the multi-brand IKMC / SEAMO / SASMO / SIMOC / HKIMO / IOB / OSN / TIMO drill — a bespoke SVG illustration + animated explainer, plus a picture-option renderer when the A–E choices are pictures), you MUST consult the index first and **reuse — never regenerate geometry that already exists as a primitive or a proven component.** The index lives in `docs/reference/competition-papers/`:

- **`PRIMITIVE-INDEX.md` — IMPORT-FIRST (read before writing any SVG).** Eight importable, prop-driven primitives in `src/components/wmi/PastPapers/WMI/primitives/` (`IsoCubes`, `GridBoard`, `BalanceScale`, `MazeGrid`, `Polyomino`, `NumberLine`, `NodeGraph`, `glyphs`) plus a copy-adapt catalog (folds, weaves, clocks, rings, maps, cards, dice…) mapping each figure type to the proven component to copy. If a primitive fits, import it and pass data/props; else copy-adapt the catalog's named component; only write fresh SVG when nothing matches (and if it's a generic recurring type, add it to `primitives/` + the index).
- **`FIGURE-BUILD-BRIEF.md`** — the per-question build + verify contract (stem vs picture-options rules; NAMED `<Name>Option` export for picture choices; default export = the illustration; **no embedded `export const VISUALS` in component files** — return the registry lines as text). **Verify with a `tsx` SSR smoke ONLY — do NOT run `npm run check` / `lint` / `build`** (the full-project tsc OOMs when several agents run it in parallel); the orchestrator runs ONE sequential `node --max-old-space-size=4096 ./node_modules/.bin/tsc --noEmit` at commit time.
- **`PHASE1-BRIEF.md`** — the Phase-1 data layer (breakdown categories `fact|condition|question|object`, hint steps, try-and-eliminate animation params).
- **`<brand>-figure-map.json`** (e.g. `ikmc-figure-map.json`, `seamo-figure-map.json`) — the deterministic list of which questions actually have a figure, built by parsing OCR `![image]` refs → question numbers. Build only these; do NOT trust content-guessing scouts (they over-flag text problems as figures).
- **`src/components/wmi/PastPapers/WMI/registry.ts`** — the catalog of already-built figures: `VISUALS[code]` (illustration/explainer) and `CHOICE_RENDERERS[code]` (picture options), keyed by question code `<BRAND>-<YY>-<LEVEL>-Q<n>` (codes from the brand registry `api/services/wmi/olympiads/registry.ts`). Grep it before building so you never duplicate an existing figure.

Render priority is `TemplateIllustration > per-code Illustration (VISUALS) > ConceptIllustration > figure_url`. Progress + the resumable per-paper build loop are tracked in the `project_olympiad_drill_enrichment` agent memory.

## Documented Solutions

`docs/solutions/` — documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when implementing or debugging in documented areas.

## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).
