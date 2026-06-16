# Fundamentals Course Implementation Plan

> **For agentic workers:** implement task-by-task. Steps use `- [ ]` tracking.

**Goal:** Ship the brand-agnostic Fundamentals course (modules → lessons → typed blocks),
admin-authored, member-consumed.

**Architecture:** New `fundamentals_*` tables (lessons hold ordered blocks JSONB); a pure
zod block schema shared by server + client; brand registry extended with scoring config; a
single `BlockRenderer` powering member view + admin editor preview.

**Tech Stack:** Express + Postgres (pg helpers), zod (blocks) / Joi (route params), React 18
+ Vite + Tailwind + React Router 7, vitest.

Spec: `docs/superpowers/specs/2026-06-17-fundamentals-course-design.md`.

---

## Phase 1 — Foundation + member experience

### Task 1.1 — DB migration + schema
- Create `db/migrations/0037_fundamentals_course.sql` (3 tables + indexes, per spec).
- Mirror identically into `db/schema.sql` (fresh installs include it).
- Apply via throwaway tsx+pg script (psql not on PATH); verify the 3 tables exist.

### Task 1.2 — Block schema + tests
- Create `api/services/fundamentals/blocks.ts`: zod schema per block type, discriminated
  union `lessonBlockSchema`, `lessonBlocksSchema`, `type LessonBlock`, `BLOCK_TYPES`.
- Create `api/services/fundamentals/blocks.test.ts`: valid round-trips + rejects
  (`answer_index` OOB, unknown type, empty choices). `npm test` green.

### Task 1.3 — Member service + progress
- `api/services/fundamentals/lessons.ts`: `getOutline(parentId, childId)`,
  `getLesson(parentId, childId, slug)` (ownership + lock check + draft 404).
- `api/services/fundamentals/progress.ts`: `markComplete(...)` upsert (unique child+lesson,
  GREATEST on check score), and the linear-unlock annotation helper.
- `unlock.test.ts` for the annotation helper.

### Task 1.4 — Member routes
- `api/routes/fundamentals-member.ts` (GET /outline, GET /lessons/:slug, POST /progress),
  Joi childId validation + `sendError` pattern from `wmi-member.ts`.
- Mount in `api/app.ts`: `app.use('/api/me/fundamentals', fundamentalsMemberRoutes)`
  (before `/api/me`).

### Task 1.5 — Frontend types + API client
- `src/types/fundamentals.ts` (Outline, LessonDetail, re-export `LessonBlock`).
- `src/lib/fundamentalsApi.ts` (`fetchOutline`, `fetchLesson`, `markLessonComplete`).

### Task 1.6 — BlockRenderer (prose/tip/check) + member pages
- `src/components/fundamentals/blocks/BlockRenderer.tsx` + `ProseBlock`, `TipBlock`,
  `CheckBlock` (paragraph-split, bilingual via lang).
- `src/pages/FundamentalsHub.tsx` (outline) + `src/pages/FundamentalsLesson.tsx`.
- Register routes in `src/App.tsx` (member block): `latihan/fundamental`,
  `latihan/fundamental/:slug`.
- Add the "Dasar Olimpiade" course card to `src/pages/LatihanHub.tsx`.

### Task 1.7 — Seed one real lesson
- `db/seed/fundamentals/lessons.ts` (idempotent upsert) + `lessons/` JSON; wire into seed
  entrypoint. Seed module 1 + lesson "How to read a math question" with prose/tip/check.
- Apply; manually verify outline + lesson render. Commit Phase 1.

## Phase 2 — Interactive blocks

### Task 2.1 — Brand scoring config + test
- Extend `Brand` in `api/services/wmi/olympiads/registry.ts` with `scoring` (+ exported
  `computeScore` helper); add WMI/SASMO values with `VERIFY` comment.
- `scoring.test.ts`: WMI (no penalty) vs SASMO (penalty + sections) sums.

### Task 2.2 — scoring / glossary / image / worked renderers
- `ScoringBlock.tsx` (registry-driven table + brand tabs + live calculator),
  `GlossaryBlock.tsx` (cards from `/public/wmi/glossary`), `ImageBlock.tsx`,
  `WorkedBlock.tsx` (reuse the existing explainer player by code; graceful fallback).
- Extend `BlockRenderer` dispatch. SSR smoke over a lesson using all block types.

### Task 2.3 — Finish curriculum seeds
- Author the remaining first-of-module lessons (vocabulary→glossary, breakdown→worked,
  scoring→scoring). Reseed. Commit Phase 2.

## Phase 3 — Admin authoring

### Task 3.1 — Admin service + routes
- Extend `lessons.ts` with admin CRUD (`listForAdmin`, module/lesson create/update/delete,
  blocks validated by `lessonBlocksSchema`).
- `api/routes/fundamentals-admin.ts`; mount `/api/admin/fundamentals`.

### Task 3.2 — Admin API client + list/CRUD page
- `src/lib/fundamentalsAdminApi.ts`; `src/pages/admin/AdminFundamentals.tsx` (modules +
  lessons tree, create/rename/reorder/publish/delete).

### Task 3.3 — Lesson block editor
- `src/pages/admin/AdminFundamentalsLesson.tsx`: per-type structured forms, add/remove/
  reorder, live preview via `BlockRenderer`, Save → PATCH.
- Admin nav leaf + `App.tsx` admin routes. Commit Phase 3.

## Phase 4 (optional) — gamification
- Award XP on first completion via the existing gamification service.

---

Verification each phase: `npm run check`, `npm run lint` (0 errors), `npm test`, SSR smoke.
