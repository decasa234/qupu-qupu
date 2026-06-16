# Fundamentals Course — Design

**Goal:** A brand-agnostic, beginner-facing course that teaches the meta-skills of
competition math — reading a question, math vocabulary, breaking a problem down,
scoring/penalty strategy, smart guessing, time & checking — as an ordered set of
**modules → lessons**, each lesson built from typed **content blocks**. Lessons are
admin-authored through a structured block editor and stored as JSONB; a single block
renderer drives both the member view and the editor preview.

**Why it's separate from concepts/papers:** Concepts are parameterized question
generators; past papers are static exam questions. Neither teaches *how to take the
test*. Fundamentals is explanatory lesson content, a new third content type that sits
above any single brand (the scoring lesson is the only brand-specific part, and it is
data-driven from the brand registry).

---

## Decisions (locked during brainstorming)

1. **Content model:** ordered lessons (a course), not more practice questions.
2. **Placement:** brand-agnostic, at the `/latihan` level (sibling of the WMI course).
3. **Authoring:** admin-CRUD block editor writing JSONB; the block renderer + data model
   land first so lessons can be seeded directly and previewed without the editor.
4. **Editor richness:** structured forms per block type (plain bilingual text + paragraph
   breaks, no rich-text dependency). Vocabulary is a dedicated glossary-cards block, not
   inline links.
5. **Block palette (v1):** `prose`, `tip`, `check`, `worked` (embed an existing animated
   explainer), `glossary` (cards from `wmi_glossary_terms`), `image`, `scoring`
   (brand-aware table **+ interactive calculator**, reads the brand registry).
6. **Progression:** linear unlock — a lesson opens once all earlier lessons in the course
   are complete. Progress is per child.

---

## Architecture

```
Brand registry (api/services/wmi/olympiads/registry.ts)
  + scoring: BrandScoring per brand  ──────────────┐  (pure data, bundles to client)
                                                    │
Block schema (api/services/fundamentals/blocks.ts)  │  zod discriminated union,
  one zod schema per block type  ───────┐           │  imported by BOTH server + client
                                        ▼           ▼
DB: fundamentals_modules / _lessons / _progress   FundamentalsBlocks/* renderer
  (lessons.blocks JSONB = ordered blocks)            (one component per block type)
        │                                              │            │
   member service ── /api/me/fundamentals/*       member lesson   admin editor
   admin service  ── /api/admin/fundamentals/*    page            preview (same renderer)
```

The block schema module is pure TypeScript + zod (no pg/node/react), so the client
bundles it for the editor and renderer exactly as it already does with the brand
registry (`src/pages/admin/AdminWmiDrill.tsx` imports the registry directly).

---

## Data model (migration `0037_fundamentals_course.sql`; mirrored into `db/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS fundamentals_modules (
  slug        TEXT PRIMARY KEY,
  title_en    TEXT NOT NULL,
  title_id    TEXT NOT NULL,
  summary_en  TEXT,
  summary_id  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fundamentals_lessons (
  slug         TEXT PRIMARY KEY,
  module_slug  TEXT NOT NULL REFERENCES fundamentals_modules(slug) ON DELETE CASCADE,
  brand        TEXT,                      -- NULL = universal; forward-compat per-brand
  title_en     TEXT NOT NULL,
  title_id     TEXT NOT NULL,
  summary_en   TEXT,
  summary_id   TEXT,
  est_minutes  SMALLINT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  blocks       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fundamentals_lessons_module
  ON fundamentals_lessons(module_slug, sort_order);

CREATE TABLE IF NOT EXISTS fundamentals_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_slug   TEXT NOT NULL REFERENCES fundamentals_lessons(slug) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_correct SMALLINT NOT NULL DEFAULT 0,
  check_total   SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT fundamentals_progress_child_lesson_unique UNIQUE (child_id, lesson_slug)
);
CREATE INDEX IF NOT EXISTS idx_fundamentals_progress_child
  ON fundamentals_progress(child_id);
```

Ordering of lessons within a course is the flattened `(module.sort_order, lesson.sort_order)`
sequence; linear unlock walks that sequence.

---

## Block schema (`api/services/fundamentals/blocks.ts`)

Every block carries a stable `id` (for React keys + editor reorder) and a `type`
discriminant. Text fields are plain strings; `\n` becomes a paragraph break in the
renderer. `_en/_id` pairs are bilingual.

| type | fields |
|---|---|
| `prose` | `id`, `title_en?`, `title_id?`, `body_en`, `body_id` |
| `tip` | `id`, `variant: 'tip'\|'warning'`, `title_en?`, `title_id?`, `body_en`, `body_id` |
| `check` | `id`, `prompt_en`, `prompt_id`, `choices_en: string[≥2]`, `choices_id: string[≥2]`, `answer_index: int`, `explain_en?`, `explain_id?` |
| `worked` | `id`, `source: 'paper'`, `code: string` (a registered question code, e.g. `WMI-20F1A-Q1`), `caption_en?`, `caption_id?` |
| `glossary` | `id`, `term_slugs: string[≥1]`, `intro_en?`, `intro_id?` |
| `image` | `id`, `src: string`, `alt_en`, `alt_id`, `caption_en?`, `caption_id?` |
| `scoring` | `id`, `brands?: string[]` (default: all registry brands), `intro_en?`, `intro_id?` |

Exports: `lessonBlockSchema` (zod discriminated union), `lessonBlocksSchema`
(`z.array(...)`), `type LessonBlock`, and `BLOCK_TYPES` (the list, for the editor's
"add block" menu). `check.answer_index` is validated `< choices length` via `superRefine`.
`worked.source` is `'paper'` only in v1 (concept embeds need params; deferred). The
server validates `req.body.blocks` with `lessonBlocksSchema.safeParse`; the client uses
the same module for the editor forms + render dispatch.

---

## Brand scoring (`api/services/wmi/olympiads/registry.ts`)

Extend `Brand` with:

```ts
export interface ScoringSection {
  key: string; labelEn: string; labelId: string
  pointsPerCorrect: number; penaltyPerWrong: number; pointsPerBlank: number
}
export interface BrandScoring {
  startingPoints: number
  sections: ScoringSection[]   // ≥1
  notesEn?: string; notesId?: string
}
// Brand gains: scoring: BrandScoring
```

Seed values are **documented assumptions to confirm against each brand's official
rulebook** (a code comment marks them `VERIFY`; they live in the registry, the single
source of truth, and are corrected in code):

- **WMI** — `startingPoints: 0`, one section (all questions) `+? correct / 0 wrong / 0 blank`,
  note: "WMI does not deduct for wrong answers — never leave a blank."
- **SASMO** — `startingPoints: 0`, Section A (MCQ) `+2 / −1 / 0`, Section B (fill-in) `+4 / 0 / 0`,
  note: "A wrong multiple-choice answer costs a point — guess only after eliminating options."

The `scoring` block reads this via `getBrand`/`listBrands` **client-side** (no endpoint).
Calculator math per brand:
`score = startingPoints + Σ_sections (correct·ppc + wrong·penalty + blank·ppb)`.

---

## API surface

**Member** (`api/routes/fundamentals-member.ts` → mounted `/api/me/fundamentals`,
`authenticateToken`, every call takes `childId` and runs `assertChildOwnership`):
- `GET /outline?childId=` → modules (published) with their published lessons, each lesson
  annotated `{ completed, locked }` (linear unlock) + course-level `{ completed, total }`.
- `GET /lessons/:slug?childId=` → the lesson (blocks) + this child's progress; 404 if the
  lesson is draft or not found; `423`-style `{ locked:true }` payload if earlier lessons
  are incomplete (the page redirects to the outline).
- `POST /progress` `{ childId, lesson_slug, check_correct?, check_total? }` → upsert
  completion (idempotent; `GREATEST` keeps the best check score). Returns updated outline
  counts.

**Admin** (`api/routes/fundamentals-admin.ts` → mounted `/api/admin/fundamentals`,
`router.use(authenticateToken, requireAdmin)`):
- `GET /modules` (+ lessons, all statuses) · `POST /modules` · `PATCH /modules/:slug` · `DELETE /modules/:slug`
- `GET /lessons/:slug` · `POST /lessons` · `PATCH /lessons/:slug` (title/summary/sort/status/**blocks**) · `DELETE /lessons/:slug`
- Block payloads validated with `lessonBlocksSchema`.

Glossary terms for the editor's glossary-block picker reuse the existing
`GET /api/public/wmi/glossary`.

Services: `api/services/fundamentals/lessons.ts` (admin CRUD + member reads) and
`api/services/fundamentals/progress.ts` (upsert + outline annotation). SQL via the
shared `query`/`queryOne`/`withTransaction` helpers.

---

## Member UX (`src/`)

- **Hub card:** add a second course card to `LatihanHub.tsx` — "Dasar Olimpiade"
  (Fundamentals), linking to `/latihan/fundamental`, showing lessons-completed progress.
- **Outline page** `src/pages/FundamentalsHub.tsx` at `/latihan/fundamental`: modules with
  their lessons as a checklist (✓ done / ▶ next / 🔒 locked).
- **Lesson page** `src/pages/FundamentalsLesson.tsx` at `/latihan/fundamental/:slug`:
  renders blocks via `FundamentalsBlocks/BlockRenderer.tsx`; inline `check` blocks tally
  correct/total; footer "Selesai → lanjut" posts progress and routes to the next lesson.
- Both wrapped in the existing `AppShell` + `ProtectedRoute`; both use `activeChildId`.
- API client: `src/lib/fundamentalsApi.ts` (mirrors `wmiApi.ts`'s `unwrap` pattern).
- Types: `src/types/fundamentals.ts`.

`BlockRenderer` dispatches on `block.type` to one component per type under
`src/components/fundamentals/blocks/`. `worked` reuses the existing explainer player by
the registered code; `glossary` fetches/【caches】terms; `scoring` renders the registry-driven
table + calculator. SSR-safe (deterministic, no `Date.now`/`Math.random` at module load).

---

## Admin UX (`src/`)

- Nav: add a top-level **Fundamentals** leaf to `AdminLayout.tsx` (`/admin/fundamentals`).
- **List/CRUD page** `src/pages/admin/AdminFundamentals.tsx`: modules + lessons tree,
  create/rename/reorder/publish/delete, link into the editor.
- **Lesson editor** `src/pages/admin/AdminFundamentalsLesson.tsx`: an ordered list of block
  cards; each card is a **structured form for its type**; add (type menu from `BLOCK_TYPES`),
  remove, reorder ↑↓; a **live preview** pane rendering the working blocks through the same
  `BlockRenderer`; Save `PATCH`es the lesson.
- Admin API client: `src/lib/fundamentalsAdminApi.ts` (mirrors `wmiAdminApi.ts`).
- Routes registered in `App.tsx` under the existing `/admin` `AdminRoute` block.

---

## Seed (`db/seed/fundamentals/`)

A `db/seed/fundamentals/lessons.ts` loader (idempotent upsert, mirroring
`db/seed/wmi/load.ts`) + JSON content for the v1 curriculum, wired into the seed entry so
`npm run seed:*` populates it. v1 curriculum (modules → lessons):

1. **Memahami Soal** — *How to read a math question* · *Math words you must know* (glossary)
2. **Strategi Menyelesaikan** — *Breaking a problem down* (worked) · *Smart guessing & elimination*
3. **Strategi Ujian** — *Scoring & penalties* (scoring calculator) · *Time & checking*

At least the first lesson of each module is authored with real bilingual content at build
time so the feature is demonstrably working end-to-end before the editor is used.

---

## Testing (vitest; no DB in unit tests)

- `blocks.test.ts` — each block type round-trips through the schema; bad shapes rejected
  (e.g. `check.answer_index` out of range; unknown `type`).
- `scoring.test.ts` — the calculator function computes WMI (no penalty) vs SASMO (penalty)
  correctly, including `startingPoints` and multi-section sums.
- `unlock.test.ts` — linear-unlock annotation: first lesson open, later locked until prior
  complete; all complete → all open.
- SSR smoke: render `BlockRenderer` over a sample lesson (all block types) to a string.
- Gates: `npm run check`, `npm run lint` (0 errors), `npm run wmi:validate` unaffected.

---

## Phasing

- **P1 — foundation + member experience:** migration + schema, `blocks.ts` + tests,
  member service/routes, types + API client, `BlockRenderer` with `prose`/`tip`/`check`,
  hub card + outline + lesson pages + routes, seed one real lesson. End state: a member can
  read and complete a lesson.
- **P2 — interactive blocks:** brand `scoring` config + `scoring.test.ts`; `scoring`,
  `glossary`, `image`, `worked` renderers; finish seeding the curriculum's authored lessons.
- **P3 — admin authoring:** admin service/routes, list/CRUD page, block editor with live
  preview, admin nav + routes + API client.
- **P4 (optional polish):** award XP on first lesson completion via the existing
  gamification service.

Each phase ends green on `check` + `lint` and is committed.
