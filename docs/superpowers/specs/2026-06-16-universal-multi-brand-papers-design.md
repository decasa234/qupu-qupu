# Universal multi-brand past-papers — design

- **Date:** 2026-06-16
- **Status:** Approved-pending-review (brainstorming output)
- **Branch:** `feat/wmi-concept-taxonomy`
- **Author:** pairing session (decasa234 + Claude)

## 1. Problem & goal

The past-papers subsystem is hard-wired to a single brand (WMI). We want it to host
**multiple math-olympiad brands** (WMI, SASMO, and more later), each with its own
**stage/round structure** and **level system**, while keeping the existing WMI content
working byte-for-byte.

Concretely, "WMI" is baked into four layers:

1. **Code util** — `paperCode()` emits `WMI-{YY}{F|P}{grade}{variant}`, duplicated in
   `src/lib/wmiPaperCode.ts` (client) and `api/services/wmi/paperCode.ts` (server); `round`
   is fixed to `'semifinal' | 'final'`.
2. **DB** (`wmi_papers`) — no brand column; `CHECK (round IN ('semifinal','final'))`,
   `grade BETWEEN 0 AND 3`, `year BETWEEN 2019 AND 2099`. Child tables (`wmi_questions`,
   `wmi_paper_reviews`, `wmi_exam_sessions`, `wmi_attempts`) FK to it.
3. **Seed** — `db/seed/wmi/papers/{year}-{round}-g{grade}.json`, upserted on
   `(year, grade, round, variant)`; `PaperFile` type fixes `round`/`variant`/`grade`.
4. **Registry** — `VISUALS` keyed by ~1,376 strings like `'WMI-19P1A-Q1'`.
5. **Components** — already relocated to `src/components/wmi/PastPapers/WMI/` (commits
   `21864c6`, `f3ca43e`), establishing `PastPapers/<BRAND>/` as the per-brand component root.

**A second goal beyond hosting:** the brand / level / round / year dimensions must be
**first-class, indexed, queryable columns**, so a future teacher/admin role can scope a
child's drillable set (e.g. "WMI g1–g2, SASMO Primary 2 only").

## 2. Scope

**In scope (this project):**

- A brand-config **registry** as the single source of truth.
- A config-driven **code generator** (WMI output unchanged).
- An additive **DB migration** adding brand + generalized level + queryable indexes.
- A generalized **import pipeline** (seed layout, loader, validator, types).
- A refreshed **admin drill selector** (brand tabs + filter bar).
- Importing **SASMO G2 2019** end-to-end as the proof brand, **fully converted**
  (translated to Indonesian + breakdown + hint_steps + SVG illustrations + animated
  explainers for all 25 questions), reusing pooled explainer templates where they fit.

**Out of scope (designed-for, not built):**

- Member-facing practice area generalization — public drill/exam stay **WMI-only** and
  untouched. (One defensive tweak: scope the three member queries to `brand = 'wmi'`.)
- Per-child **entitlements** table + teacher role (the indexed columns make this a cheap
  follow-up).
- Runtime admin **brand-CRUD UI** (brands are code-defined in the registry for now).
- Per-section **scoring / negative marking** (SASMO has it; member scoring is WMI-only).

## 3. Invariants

- **Existing WMI codes never change.** `WMI-19P1A-Q1` etc. stay byte-for-byte identical;
  the ~1,376 registry keys and all saved data are untouched. WMI becomes one *configured*
  brand whose generator output happens to match today's strings.
- **Physical names stay.** Tables remain `wmi_papers`/`wmi_questions`/…; folders remain
  `api/services/wmi/`, `src/components/wmi/`. Brand identity lives in **data + indexed
  columns**, not in table names. (Renaming was considered and rejected: large churn/risk
  for cosmetic gain; the queryability goal is satisfied by columns regardless.)

## 4. Brand-config registry (source of truth)

A framework-agnostic module — pure data + pure functions, **no React, no `pg`, no node** —
so the client, the API runtime, and the seed scripts can all consume the same definitions.

```ts
interface Round { key: string; code: string; labelEn: string; labelId: string; sort: number }
interface Level { key: string; code: string; labelEn: string; labelId: string; sort: number; grade?: number }
interface Brand {
  slug: string                 // 'wmi', 'sasmo'  (DB brand column)
  prefix: string               // 'WMI', 'SASMO'  (code prefix)
  nameEn: string; nameId: string
  rounds: Round[]              // ordered funnel; may be a single entry
  levels: Level[]              // ordered; `grade` optional (WMI member-flow bridge)
  variants?: string[]          // ['A','B'] for WMI; omitted for single-paper brands
  defaultDurationMin: number
  formatCode(p: { year: number; round: string; level: string; variant?: string }): string
}
```

**WMI** (reproduces existing codes exactly):

- rounds: `semifinal→P`, `final→F`
- levels: `g0..g3 → '0'..'3'` (`grade` = 0..3, bridges the member flow)
- variants: `['A','B']`
- `formatCode` (compact, no separators): `WMI-{YY}{roundCode}{levelCode}{variant}` → `WMI-19P1A`

**SASMO** (grounded in the real SASMO G2 2019 paper):

- rounds: **single** — `[{ key: 'contest', code: '', labelEn: 'Contest', labelId: 'Kontes', sort: 0 }]`
- levels: `Primary 2..6` + `Secondary 1..4`; G2 → `{ key:'g2', code:'G2', labelEn:'Primary 2', labelId:'Primary 2 (Kelas 2)', sort: 2 }`
- variants: none (single paper with mixed sections)
- `formatCode` (segmented): `SASMO-{YY}-{levelCode}` → `SASMO-19-G2`; questions `SASMO-19-G2-Q{n}`

`P` = prelim for WMI and (later) provinsi for OSN — collisions are impossible because codes
are namespaced by `prefix`; only within-brand uniqueness matters.

**Implementation note (location / Vercel):** the registry must be importable at API
*runtime* (the code generator runs per request) as well as client + seed. The seed scripts
already import from `src/` (see `build-visual-index.ts` importing
`src/.../PastPapers/WMI/templates/registry.js`), so client + seed sharing is proven. The
open risk is whether Vercel's separate API build traces an import that reaches into `src/`.
**Plan decision:** prefer a single canonical module (recommended `src/lib/olympiads/`); if
the Vercel API trace doesn't pick it up, fall back to the **existing duplicate-and-sync
pattern** already used for `paperCode` (canonical data in one file, a thin server mirror).
Resolve during planning by checking the API bundle.

## 5. Identity / code generator

`paperCode()` / `questionCode()` (both the client `src/lib/wmiPaperCode.ts` and server
`api/services/wmi/paperCode.ts` copies) delegate to the registry: look up brand → map
`round`→code, `level`→code → assemble via the brand's `formatCode`. WMI's config reproduces
today's strings, so there is **zero registry-key churn**. Signature gains `brand` + `level`:

```ts
paperCode({ brand, year, round, level, variant })   // -> 'WMI-19P1A' | 'SASMO-19-G2'
questionCode(paper, n)                               // -> `${paperCode}-Q${n}`
```

Backward-compat shim: existing call-sites that pass `{ year, round, grade, variant }` map to
`brand: 'wmi'`, `level: 'g'+grade` until updated.

## 6. Data model — one additive migration (`db/migrations/0035_papers_multi_brand.sql`)

`ALTER TABLE wmi_papers`:

- `+ brand TEXT NOT NULL DEFAULT 'wmi'` — backfills existing rows.
- `+ level_code TEXT`, `+ level_sort SMALLINT` — universal level. Backfill WMI:
  `level_code = 'g'||grade`, `level_sort = grade`. Then set `NOT NULL`.
- `grade` → **nullable**, CHECK relaxed/dropped (kept as the WMI member-flow bridge; SASMO
  rows leave it null).
- Drop `CHECK (round IN (...))` and `CHECK (variant IN (...))`; `round` now holds
  brand-defined round keys, `variant` defaults `'A'` and may be unused. Validation moves to
  **import time** against the registry.
- Widen `year` lower bound (older papers exist), e.g. `BETWEEN 1990 AND 2099`.
- Swap unique constraint → `UNIQUE (brand, year, level_code, round, variant)`.
- **Indexes** powering the selector filters *and* future entitlements:
  `(brand)`, `(brand, level_code)`, `(brand, round)`, `(year)`.

Child tables are **untouched** (they key off `paper_id`).

`db/schema.sql` (fresh-install path) updated to match the post-migration shape.

**Designed-for, not built** — future `olympiad_entitlements(child_id, brand, level_code, …)`
that a teacher/admin role populates to restrict a child's drillable set. The indexed
dimension columns above are exactly what make that cheap later.

## 7. Import pipeline

- **Seed layout** grows a brand axis: `db/seed/<brand>/papers/<file>.json`. Existing
  `db/seed/wmi/papers/...` stays. SASMO → `db/seed/sasmo/papers/2019-contest-g2.json`.
- **Types** (`api/services/wmi/paperImport/types.ts`): `PaperFile` gains `brand: string` and
  `level: string` (level key); `round` widens from the 2-value union to `string`; `variant`
  optional. `PaperQuestion` is unchanged — `answer_type` already covers SASMO's Section A
  (`multiple_choice`) and Section B (`fill_in`).
- **Loader** (`db/seed/wmi/load.ts`, or a generalized `db/seed/load.ts`): scan each brand
  dir, validate `round`/`level`/`variant` against the registry, compute the code, upsert with
  the new columns (`brand`, `level_code`, `level_sort`, nullable `grade`).
- **Validator** (`validate-papers.ts` + `paperImport/validate.ts`): assert `brand` exists in
  the registry and `round`/`level`/`variant` are registry-valid for that brand.
- **Figures**: same mechanism as WMI — copy source images into the figures dir and reference
  via `figure_url` (or a per-brand figures dir). Bespoke SVGs come in the authoring phase.

## 8. Component layer

Per-brand component root already exists: `src/components/wmi/PastPapers/<BRAND>/`. SASMO
components live in `src/components/wmi/PastPapers/SASMO/` with their **own `registry.ts`**
(`VISUALS` + `CHOICE_RENDERERS`), mirroring WMI's. `WmiQuestionView` resolves a question's
visual by code; it will consult the brand's registry (dispatch by brand prefix, or a merged
lookup). Pooled explainer **templates** (`PastPapers/WMI/templates/`, bound via
`question.visual.templateId`) are reused across brands where a SASMO question matches an
existing parameterized template.

## 9. Admin selector (`AdminWmiDrill.tsx` + list endpoint)

- The admin papers-list endpoint returns `brand, level_code, level_label, round, year,
  variant, code, status, question_count`.
- UI: **brand tabs** (ordered by registry, only brands with papers shown; `+ add` is an
  inert placeholder for now) → **filter bar** (Level / Round / Year / Status dropdowns +
  search) → paper list **grouped by level**. The right pane (question preview + review
  panel) is unchanged. Code chips use the new generator.

## 10. SASMO G2 2019 — conversion specifics

Source: `D:/claude/wmi/PastPapers/SASMO 2019/2019-SASMO-G2.pdf-…/` (MinerU bundle: `full.md`
+ `content_list.json` + `images/`). The bundle also contains **SASMO 2020 G2** (available
for a later import).

- **Paper**: `SASMO-19-G2`, 25 questions. Section A Q1–15 = 5-option MCQ (A–E, E frequently
  "None of the above") → `multiple_choice`. Section B Q16–25 = numeric fill-in → `fill_in`.
- **Answer key** (verified from the solutions section): Q1 D, Q2 B, Q3 C, Q4 A, Q5 C, Q6 C,
  Q7 D, Q8 A, Q9 A, Q10 B, Q11 D, Q12 B, Q13 E, Q14 C, Q15 D, Q16 1920, Q17 42, Q18 6,
  Q19 26, Q20 12, Q21 9, Q22 68, Q23 76, Q24 8, Q25 1442.
- **Translation**: full Indonesian translation of every body + choices (true `body_id` /
  `choices_id`, not a mirror), matching WMI content quality.
- **Full authoring** (use `qupu-math-problem-creation` four-role method): `breakdown` +
  `hint_steps` (en+id) + SVG illustrations + post-answer animated explainers for all 25,
  reusing pooled templates where they fit (clock, balance, cube-stack, picture-graph,
  cryptarithm, pattern, matchstick…).
- **Scoring** (A: +2/0/−1, B: +4/0) recorded in notes only; not modeled (member-out-of-scope).

## 11. Phasing

1. **Registry + code generator** — brand-config module; `paperCode`/`questionCode`
   config-driven; WMI output identical; unit tests (incl. SASMO code cases).
2. **Migration + model** — additive migration, backfill WMI, update `schema.sql`,
   papers-service reads/writes new columns; scope member queries to `brand='wmi'`.
3. **Import pipeline** — generalized seed layout, loader, validator, types; smoke-import
   SASMO G2 2019 as **raw** rows (questions + answers + translated text + figures), visible
   in the admin selector under the SASMO brand.
4. **Admin selector** — brand tabs + filter bar + grouped list.
5. **SASMO authoring** — full four-role treatment for all 25 (breakdown, hint_steps,
   illustrations, explainers); SASMO `registry.ts`; gates green; SSR smoke en+id.

Each phase is independently shippable; gates `npm run check`, `npm run lint` (0 errors),
`npm run wmi:validate` (extended), and SSR smoke must stay green throughout.

## 12. Risks & open items

- **Registry import on Vercel API** — §4 note; resolve in planning (single module vs
  duplicate-and-sync).
- **Brand-aware visual lookup** — `WmiQuestionView` must resolve visuals from the right
  brand registry without regressing WMI; decide dispatch (prefix-based vs merged map) in the
  plan.
- **`grade` dual-life** — `grade` (WMI member bridge) + `level_code`/`level_sort`
  (universal) coexist; keep WMI's two in sync at import time.
- **Translation effort** — full SASMO translation is real authoring load; Phase 5 is the
  largest. 2020 G2 deferred.
- **Concurrent pool workstream** — reusable-explainer-pool is actively editing
  `PastPapers/WMI/` (`templates/`, `poolCatalog`, `poolMeta`); coordinate to avoid conflicts.
