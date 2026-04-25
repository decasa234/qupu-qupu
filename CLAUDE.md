# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — run client (Vite on 5173) and API (nodemon/tsx on 3001) concurrently.
- `npm run client:dev` / `npm run server:dev` — run either side alone.
- `npm run build` — `tsc -b && vite build`. The API is not bundled; Vercel builds it separately.
- `npm run check` — typecheck only (`tsc --noEmit`). Use this for quick validation.
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- No test runner is configured.
- Database bootstrap is manual: apply `db/schema.sql` then `db/seed.sql` against the Postgres instance in `DATABASE_URL`. The `supabase/migrations` folder is legacy and not part of the current flow.

Required env (`.env`, see `.env.example`): `DATABASE_URL`, `JWT_SECRET`, `PORT`, `APP_ORIGIN`, `VITE_API_BASE_URL`.

## Architecture

Single repo with two halves sharing one `tsconfig.json` (`include: ["src", "api"]`):

- **Frontend** (`src/`) — React 18 + Vite + Tailwind + React Router 7. Path alias `@/*` → `src/*` (via `vite-tsconfig-paths`). In dev, Vite proxies `/api` → `http://localhost:3001` (`vite.config.ts`), so the client can always call relative `/api/...` URLs.
- **Backend** (`api/`) — Express app that runs two ways from the same `app.ts`:
  - `api/server.ts` is the local dev entry (nodemon → `tsx api/server.ts`).
  - `api/index.ts` is the Vercel serverless handler; `vercel.json` rewrites `/api/(.*)` to it.
  - Imports inside `api/` use `.js` extensions (ESM-style) even though the files are `.ts` — tsx/Vercel resolve these. Keep that convention when adding files.

### API surface (mounted in `api/app.ts`)

- `/api/auth` — register/login (bcrypt + JWT, 15m access + 7d refresh).
- `/api/users/me` — authenticated profile read/update.
- `/api/public` — unauthenticated meta + video list/detail for the catalog.
- `/api/me` — authenticated member endpoints: submit quiz score, progress, badges.
- `/api/admin` — admin-only video CRUD. The whole router is gated by `authenticateToken` + `requireAdmin`.
- `/api/meta` — legacy lookups (subjects/age-groups/badge-families); `/api/public/meta` is the preferred aggregate.

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

A **video** belongs to one `subject`, one `age_group`, and one `badge_family`. Each video has exactly **3 `video_badge_rules`**, one per tier (1/2/3) of its badge family, with non-overlapping `[min_correct, max_correct]` ranges over the question count. `normalizeVideoInput` in `services/videos.ts` enforces these invariants on create/update.

When a user submits a score (`services/member.ts` `submitVideoScore`):
1. Insert a `score_attempts` row.
2. Find the matching `video_badge_rules` by correct-answer range (highest tier wins if overlap).
3. Upsert into `user_badge_unlocks` — **only upgrade**, never downgrade. `best_correct_answers` uses `GREATEST(...)`. `isUpgrade` is true only when an existing unlock got promoted.

`user_badge_unlocks` is unique per `(user_id, video_id)` — a user has at most one badge per video, representing their best tier reached. Dashboard/badges endpoints read from this table, not from raw score history.

### Frontend routes (`src/App.tsx`)

`/` (Home), `/videos/:slug`, `/login`, `/register`, `/dashboard` (protected), `/badges` (protected), `/admin/videos` (admin-only). Unknown paths redirect to `/`.
