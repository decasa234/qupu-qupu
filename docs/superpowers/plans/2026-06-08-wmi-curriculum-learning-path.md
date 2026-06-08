# WMI Curriculum & Learning-Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the flat WMI concept grid into a themed, gated "garden" learning path per grade, with a per-concept comprehension model that grows with practice and accuracy.

**Architecture:** Concepts get theme + difficulty + order metadata (central `curriculum.ts`, applied at bootstrap). A new pure comprehension module computes a monotonic tier (Belum dimulai → Baru belajar → Berlatih → Mahir → Dikuasai) from attempts/correct/recent results; a materialized `wmi_concept_progress` row per (child, concept) is upserted on each concept attempt. A `GET /me/wmi/garden` endpoint assembles chapters (themes) for a grade with growth, unlock state, and the single "next" concept. The hub is rebuilt into garden chapters + secondary actions; a Tes Bab test-out flow unlocks chapters early; the broken Drill card is removed.

**Tech Stack:** Express + Postgres (`pg`), React 18 + Vite + Tailwind + React Router, Joi validation, Vitest for unit tests. Member WMI surfaces use the existing app-shell tokens in `src/pages/WmiHub.tsx` (`max-w-[460px]`, `rounded-[1.5rem]`, solid bottom shadows `0_5px_0_0_#FFD3B1`, `ring-2 ring-[#FFE3CC]`, `bg-[#FFF8F0]`, Baloo 2 via `font-display`) — **match these, not the generic peach `5px 6px` drop**.

**Reference mockup (pixel target):** the approved hi-fi screen, archived at `docs/superpowers/specs/2026-06-08-wmi-curriculum-learning-path-design.md` (built during brainstorming).

**Decisions locked in spec:** 5 chapters (Bilangan & Operasi, Bentuk & Ruang, Pola & Logika, Pengukuran & Data, Soal Cerita & Uang); Grade 0 kept; multi-grade concept appears in each tagged grade; chapter-gated (next opens at mean comprehension ≥ 70%) + Tes Bab test-out (>70%); comprehension monotonic (never wilts), top tiers gated by accuracy; `Mahir` = proficient line (consumed later by the EXP slice).

**Conventions to honor:** imports inside `api/` use `.js` extensions on `.ts` files. Use `query`/`queryOne`/`withTransaction` from `api/db.ts`, never the pool directly. Routes stay thin (Joi validate → service). Concept tests are colocated `index.test.ts`.

**Definitions used throughout:**
- Tier ints: `0 Belum dimulai, 1 Baru belajar, 2 Berlatih, 3 Mahir, 4 Dikuasai`. `PROFICIENT_TIER = 3`.
- Tier gates: t1 = attempted (≥1 attempt); t2 = ≥3 correct; t3 = ≥6 correct AND ≥5 of last 7 correct; t4 = ≥10 correct AND (last 4 in a row correct OR ≥6 of last 7).
- `comprehension_pct`: 0; t1 band 10→35 by correct/3; t2→t3 band 35→70 (capped 65 until t3 gate met); t3→t4 band 70→100 (capped 92 until t4 gate met).
- Chapter **bar %** = mean `comprehension_pct` of its concepts. Chapter **"X/N tumbuh"** = count at tier ≥ Mahir. **Unlock** next chapter: mean `comprehension_pct` ≥ 70 OR a passed Tes Bab row exists.

---

## File Structure

**Backend (create):**
- `api/services/wmi/concepts/curriculum.ts` — `THEMES` + per-slug `{themeKey, difficulty, sortOrder}` map (editorial artifact).
- `api/services/wmi/concepts/curriculum.test.ts` — coverage: every slug mapped, every theme valid.
- `api/services/wmi/concepts/comprehension.ts` — pure tier/percent model.
- `api/services/wmi/concepts/comprehension.test.ts` — unit tests for the model.
- `api/services/wmi/concepts/conceptProgress.ts` — `upsertConceptProgress()` (write) + row type.
- `api/services/wmi/concepts/garden.ts` — `getGarden()` read assembler.
- `api/services/wmi/concepts/chapterTest.ts` — Tes Bab start/submit + unlock/seed.

**Backend (modify):**
- `db/migrations/0033_wmi_curriculum.sql` — DDL (new tables + columns).
- `db/schema.sql` — fold in the same DDL.
- `api/services/wmi/concepts/bootstrap.ts` — upsert themes + concept metadata from `curriculum.ts`.
- `api/services/wmi/attempts.ts` — fetch `concept_slug`; call `upsertConceptProgress` in the concept branch.
- `api/routes/wmi-member.ts` — add `GET /garden`, `POST /chapter-test/start`, `POST /chapter-test/submit`.

**Frontend (create):**
- `src/components/wmi/plantStages.ts` — tier → icon/colors/label map.
- `src/components/wmi/ConceptPlant.tsx` — single plant tile.
- `src/components/wmi/ChapterGarden.tsx` — one chapter card.
- `src/pages/WmiChapterTest.tsx` — Tes Bab flow page.

**Frontend (modify):**
- `src/types/wmi.ts` — garden + chapter-test types.
- `src/lib/wmiApi.ts` — `fetchGarden`, `startChapterTest`, `submitChapterTest`.
- `src/pages/WmiHub.tsx` — rebuild into garden chapters + secondary actions; remove Drill card (+ fetchPapers).
- `src/App.tsx` — route for `WmiChapterTest`.
- `src/components/wmi/ConceptCatalog.tsx` — removed from hub (kept only if referenced elsewhere; otherwise delete).

---

## Task 1: Schema — new tables & columns

**Files:**
- Create: `db/migrations/0033_wmi_curriculum.sql`
- Modify: `db/schema.sql` (add the same statements near the other `wmi_*` tables)

- [ ] **Step 1: Write the migration**

Create `db/migrations/0033_wmi_curriculum.sql`:

```sql
-- 0033_wmi_curriculum.sql — themed curriculum, per-concept comprehension, chapter tests

-- 1. Theme lookup (the 5 chapters)
CREATE TABLE IF NOT EXISTS wmi_themes (
  theme_key   TEXT PRIMARY KEY,
  name_id     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  color_hex   TEXT NOT NULL,
  icon_key    TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0
);

-- 2. Concept curriculum metadata
ALTER TABLE wmi_concepts
  ADD COLUMN IF NOT EXISTS theme_key  TEXT REFERENCES wmi_themes(theme_key),
  ADD COLUMN IF NOT EXISTS difficulty SMALLINT CHECK (difficulty IS NULL OR difficulty BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- 3. Materialized per-child per-concept comprehension
CREATE TABLE IF NOT EXISTS wmi_concept_progress (
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  concept_slug      TEXT NOT NULL REFERENCES wmi_concepts(slug) ON DELETE CASCADE,
  attempts          INT  NOT NULL DEFAULT 0,
  correct           INT  NOT NULL DEFAULT 0,
  current_streak    INT  NOT NULL DEFAULT 0,
  recent            JSONB NOT NULL DEFAULT '[]'::jsonb,  -- last <=10 booleans, oldest->newest
  best_tier         SMALLINT NOT NULL DEFAULT 0,         -- high-water 0..4
  comprehension_pct SMALLINT NOT NULL DEFAULT 0,         -- high-water 0..100
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (child_id, concept_slug)
);

-- 4. Tes Bab (chapter test-out) results
CREATE TABLE IF NOT EXISTS wmi_chapter_tests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  grade       SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 3),
  theme_key   TEXT NOT NULL REFERENCES wmi_themes(theme_key),
  score_pct   SMALLINT NOT NULL,
  passed      BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wmi_chapter_tests_pass_idx
  ON wmi_chapter_tests (child_id, grade, theme_key) WHERE passed;
```

- [ ] **Step 2: Fold the same DDL into `db/schema.sql`**

Add the four statements above (without the `ALTER` — instead add `theme_key`, `difficulty`, `sort_order` directly to the `CREATE TABLE wmi_concepts` block) next to the existing `wmi_concepts` / `wmi_concept_instances` definitions so fresh installs match.

- [ ] **Step 3: Apply locally and verify**

Run: `psql "$DATABASE_URL" -f db/migrations/0033_wmi_curriculum.sql`
Expected: `CREATE TABLE` / `ALTER TABLE` / `CREATE INDEX` with no error. Re-running is a no-op (`IF NOT EXISTS`).

- [ ] **Step 4: Commit**

```bash
git add db/migrations/0033_wmi_curriculum.sql db/schema.sql
git commit -m "feat(wmi): schema for themed curriculum, concept comprehension, chapter tests"
```

---

## Task 2: Curriculum map (themes + per-concept assignment)

**Files:**
- Create: `api/services/wmi/concepts/curriculum.ts`
- Test: `api/services/wmi/concepts/curriculum.test.ts`

- [ ] **Step 1: Write the coverage test first**

Create `api/services/wmi/concepts/curriculum.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ALL_SLUGS } from './registry.js'
import { THEMES, CURRICULUM } from './curriculum.js'

describe('wmi curriculum', () => {
  it('maps every concept slug', () => {
    const missing = ALL_SLUGS.filter((s) => !CURRICULUM[s])
    expect(missing).toEqual([])
  })
  it('uses only defined themes and valid difficulty', () => {
    const keys = new Set(THEMES.map((t) => t.themeKey))
    for (const slug of ALL_SLUGS) {
      const c = CURRICULUM[slug]
      expect(keys.has(c.themeKey)).toBe(true)
      expect(c.difficulty).toBeGreaterThanOrEqual(1)
      expect(c.difficulty).toBeLessThanOrEqual(3)
    }
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run api/services/wmi/concepts/curriculum.test.ts`
Expected: FAIL — `Cannot find module './curriculum.js'`.

- [ ] **Step 3: Write `curriculum.ts` with THEMES + the full map**

Create `api/services/wmi/concepts/curriculum.ts`. Define `THEMES` and a `CURRICULUM` record keyed by every slug in `ALL_SLUGS`. Theme palette uses the QUPU brand tokens.

```ts
import type { ConceptSlug } from './registry.js'

export interface ThemeDef {
  themeKey: string
  name_id: string
  name_en: string
  color_hex: string
  icon_key: string // Font Awesome name, e.g. 'calculator'
  sort_order: number
}

export const THEMES: ThemeDef[] = [
  { themeKey: 'bilangan',   name_id: 'Bilangan & Operasi', name_en: 'Numbers & Operations', color_hex: '#30598A', icon_key: 'calculator',   sort_order: 1 },
  { themeKey: 'bentuk',     name_id: 'Bentuk & Ruang',     name_en: 'Shapes & Space',       color_hex: '#f0853a', icon_key: 'shapes',       sort_order: 2 },
  { themeKey: 'logika',     name_id: 'Pola & Logika',      name_en: 'Patterns & Logic',     color_hex: '#7C5CBF', icon_key: 'puzzle-piece', sort_order: 3 },
  { themeKey: 'pengukuran', name_id: 'Pengukuran & Data',  name_en: 'Measurement & Data',   color_hex: '#2E8B6B', icon_key: 'gauge-high',   sort_order: 4 },
  { themeKey: 'soalcerita', name_id: 'Soal Cerita & Uang', name_en: 'Word Problems & Money', color_hex: '#E0a000', icon_key: 'coins',        sort_order: 5 },
]

export interface ConceptCurriculum {
  themeKey: string
  difficulty: 1 | 2 | 3
  sortOrder: number // order within (grade, theme); lower = earlier/easier
}

// Editorial: theme + difficulty (1 easiest .. 3 hardest) + intra-theme order.
// Difficulty seeded from each concept's number ranges + grade, then hand-tuned.
export const CURRICULUM: Record<ConceptSlug, ConceptCurriculum> = {
  // ---- Bilangan & Operasi ----
  'count-objects':                 { themeKey: 'bilangan', difficulty: 1, sortOrder: 10 },
  'single-digit-addition':         { themeKey: 'bilangan', difficulty: 1, sortOrder: 20 },
  'single-digit-subtraction':      { themeKey: 'bilangan', difficulty: 1, sortOrder: 30 },
  'missing-addend':                { themeKey: 'bilangan', difficulty: 2, sortOrder: 40 },
  'place-value':                   { themeKey: 'bilangan', difficulty: 2, sortOrder: 50 },
  // ... (continue for ALL remaining slugs — see Step 4)
} as Record<ConceptSlug, ConceptCurriculum>
```

- [ ] **Step 4: Fill in every remaining slug**

Add one `CURRICULUM` entry per slug in `ALL_SLUGS` (full list in `registry.ts`). Suggested theme buckets (assign each to exactly one):
  - **bilangan:** count-objects, single-digit-addition, single-digit-subtraction, missing-addend, place-value, multiplication-small, digit-sum, compare-order-numbers, arithmetic-expression-eval, which-expression-equals, reverse-arithmetic-puzzle, find-number-by-digit-sum, custom-operation, alternating-chain-eval, mistaken-digit-correction, build-number-from-digit-clues, more-or-less-by-k, digit-frequency, operator-fill, number-pyramid, arrange-digits-to-form-number, range-count-evaluate, sum-partition-split, make-groups-leftover, number-line-jumps
  - **bentuk:** shape-perimeter-square, shape-perimeter-rectangle, rectangle-area-grid, perimeter-area-composed, count-polygon-sides, symmetry-count, angle-type, block-count-3d, dice-opposite-faces, dice-net-fold, same-figure-identify, count-shapes-in-figure, count-rectangles-grid, grid-path-steps, maze-path-shortest, fraction-of-region, equivalent-fraction-fill
  - **logika:** pattern-next, visual-pattern-next, odd-even-reasoning, divisibility-multiple-property, position-in-line, assignment-cycle, which-might-be, truth-order-clues, perfect-square-search, product-of-consecutive, combination-product-sum, direction-orientation, shape-transformation-rule
  - **pengukuran:** clock-time-after, clock-read-time, unit-conversion, weight-balance-word, scale-read, bar-chart-compare, tally-marks-count, venn-set-membership
  - **soalcerita:** story-sum, legs-items-rate, money-shopping-change, distance-rate-time, lacking-money-shared, budget-selection, money-coins-total, rope-wraps-ratio, net-progress-cycles, table-lookup-combine

Set `difficulty` per the grade signal in each concept's `meta.grades` (grade-1-only → 1, grade-2 → 2, grade-3 → 3; multi-grade → lower bound) and order `sortOrder` easy→hard within each theme in steps of 10.

- [ ] **Step 5: Run the test to confirm it passes**

Run: `npx vitest run api/services/wmi/concepts/curriculum.test.ts`
Expected: PASS (both cases green; `missing` is empty).

- [ ] **Step 6: Typecheck & commit**

Run: `npm run check`
Expected: no errors.

```bash
git add api/services/wmi/concepts/curriculum.ts api/services/wmi/concepts/curriculum.test.ts
git commit -m "feat(wmi): curriculum map — themes + per-concept difficulty/order"
```

---

## Task 3: Bootstrap writes theme + concept metadata

**Files:**
- Modify: `api/services/wmi/concepts/bootstrap.ts`

- [ ] **Step 1: Add a theme upsert and extend the concept upsert**

In `bootstrap.ts`, import the curriculum and add `upsertThemes`, then extend `upsertConcepts` to write `theme_key`, `difficulty`, `sort_order`. Call `upsertThemes()` before `upsertConcepts()` in `doBootstrap`.

```ts
import { CURRICULUM, THEMES } from './curriculum.js'
```

```ts
async function upsertThemes(): Promise<void> {
  await withTransaction(async (client) => {
    for (const t of THEMES) {
      await client.query(
        `INSERT INTO wmi_themes (theme_key, name_id, name_en, color_hex, icon_key, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (theme_key) DO UPDATE SET
           name_id = EXCLUDED.name_id, name_en = EXCLUDED.name_en,
           color_hex = EXCLUDED.color_hex, icon_key = EXCLUDED.icon_key,
           sort_order = EXCLUDED.sort_order`,
        [t.themeKey, t.name_id, t.name_en, t.color_hex, t.icon_key, t.sort_order],
      )
    }
  })
}
```

In `upsertConcepts`, change the INSERT to include the curriculum columns:

```ts
const cur = CURRICULUM[slug as keyof typeof CURRICULUM]
await client.query(
  `INSERT INTO wmi_concepts (slug, name_en, name_id, description_id, grades, theme_key, difficulty, sort_order)
   VALUES ($1,$2,$3,$4,$5::SMALLINT[],$6,$7,$8)
   ON CONFLICT (slug) DO UPDATE SET
     name_en = EXCLUDED.name_en, name_id = EXCLUDED.name_id,
     description_id = EXCLUDED.description_id, grades = EXCLUDED.grades,
     theme_key = EXCLUDED.theme_key, difficulty = EXCLUDED.difficulty,
     sort_order = EXCLUDED.sort_order, updated_at = NOW()`,
  [c.meta.slug, c.meta.name_en, c.meta.name_id, c.meta.description_id ?? null,
   c.meta.grades as readonly number[], cur.themeKey, cur.difficulty, cur.sortOrder],
)
```

Update `doBootstrap()`:

```ts
async function doBootstrap(): Promise<void> {
  await upsertThemes()
  await upsertConcepts()
  for (const slug of ALL_SLUGS) {
    await seedConcept(slug, CONCEPTS[slug] as ConceptLogic<unknown>)
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Run the server once to bootstrap, then verify rows**

Run: `npm run server:dev` (let it boot, then Ctrl-C), then
`psql "$DATABASE_URL" -c "SELECT count(*) FROM wmi_themes; SELECT count(*) FROM wmi_concepts WHERE theme_key IS NOT NULL;"`
Expected: 5 themes; concept count = total concepts (all have a theme).

- [ ] **Step 4: Commit**

```bash
git add api/services/wmi/concepts/bootstrap.ts
git commit -m "feat(wmi): bootstrap seeds themes and concept curriculum metadata"
```

---

## Task 4: Comprehension model (pure)

**Files:**
- Create: `api/services/wmi/concepts/comprehension.ts`
- Test: `api/services/wmi/concepts/comprehension.test.ts`

- [ ] **Step 1: Write the tests first**

Create `api/services/wmi/concepts/comprehension.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeComprehension, PROFICIENT_TIER } from './comprehension.js'

const rep = (n: number, v: boolean) => Array.from({ length: n }, () => v)

describe('computeComprehension', () => {
  it('is Belum dimulai with no attempts', () => {
    expect(computeComprehension({ attempts: 0, correct: 0, recent: [] }).tier).toBe(0)
  })
  it('is Baru belajar once attempted, even if wrong', () => {
    expect(computeComprehension({ attempts: 1, correct: 0, recent: [false] }).tier).toBe(1)
  })
  it('reaches Berlatih at 3 correct', () => {
    expect(computeComprehension({ attempts: 3, correct: 3, recent: rep(3, true) }).tier).toBe(2)
  })
  it('needs accuracy for Mahir: 6 correct but poor recent stays below 3', () => {
    const recent = [...rep(5, false), true, true] // only 2 of last 7
    const r = computeComprehension({ attempts: 12, correct: 6, recent })
    expect(r.tier).toBeLessThan(3)
    expect(r.pct).toBeLessThanOrEqual(65)
  })
  it('reaches Mahir at 6 correct with strong recent', () => {
    const r = computeComprehension({ attempts: 8, correct: 6, recent: rep(7, true) })
    expect(r.tier).toBe(PROFICIENT_TIER)
  })
  it('reaches Dikuasai at 10 correct with a 4-streak', () => {
    const r = computeComprehension({ attempts: 12, correct: 10, recent: rep(7, true) })
    expect(r.tier).toBe(4)
    expect(r.pct).toBe(100)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `npx vitest run api/services/wmi/concepts/comprehension.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `comprehension.ts`**

```ts
// Pure per-concept comprehension model. No DB access.
export type ComprehensionTier = 0 | 1 | 2 | 3 | 4
export const PROFICIENT_TIER: ComprehensionTier = 3
export const TIER_KEY = ['belum', 'baru', 'berlatih', 'mahir', 'dikuasai'] as const

export interface AttemptSignal {
  attempts: number
  correct: number
  recent: boolean[] // oldest -> newest
}

const C_BERLATIH = 3
const C_MAHIR = 6
const C_DIKUASAI = 10
const WINDOW = 7
const MAHIR_RECENT = 5     // >=5 of last 7
const DIKUASAI_STREAK = 4  // last 4 in a row
const DIKUASAI_RECENT = 6  // or >=6 of last 7

function recentCorrect(recent: boolean[]): number {
  return recent.slice(-WINDOW).filter(Boolean).length
}
export function trailingStreak(recent: boolean[]): number {
  let s = 0
  for (let i = recent.length - 1; i >= 0 && recent[i]; i--) s++
  return s
}

function rawTier(sig: AttemptSignal): ComprehensionTier {
  if (sig.attempts <= 0) return 0
  const rc = recentCorrect(sig.recent)
  const streak = trailingStreak(sig.recent)
  if (sig.correct >= C_DIKUASAI && (streak >= DIKUASAI_STREAK || rc >= DIKUASAI_RECENT)) return 4
  if (sig.correct >= C_MAHIR && rc >= MAHIR_RECENT) return 3
  if (sig.correct >= C_BERLATIH) return 2
  return 1
}

function pctFor(sig: AttemptSignal, tier: ComprehensionTier): number {
  const c = sig.correct
  if (tier === 0) return 0
  if (tier === 4) return 100
  if (tier === 3) {
    // 70 -> 100 over correct 6..10, capped 92 until Dikuasai gate (tier would be 4)
    const p = 70 + Math.min(1, Math.max(0, (c - C_MAHIR) / (C_DIKUASAI - C_MAHIR))) * 30
    return Math.round(Math.min(92, p))
  }
  if (tier === 2) {
    // 35 -> 70 over correct 3..6, capped 65 until Mahir gate (tier would be 3)
    const p = 35 + Math.min(1, Math.max(0, (c - C_BERLATIH) / (C_MAHIR - C_BERLATIH))) * 35
    return Math.round(Math.min(65, p))
  }
  // tier 1: 10 -> 35 over correct 0..3
  return Math.round(10 + Math.min(1, c / C_BERLATIH) * 25)
}

export interface Comprehension {
  tier: ComprehensionTier
  pct: number // 0..100
  streak: number
}

export function computeComprehension(sig: AttemptSignal): Comprehension {
  const tier = rawTier(sig)
  return { tier, pct: pctFor(sig, tier), streak: trailingStreak(sig.recent) }
}
```

- [ ] **Step 4: Run tests to confirm pass**

Run: `npx vitest run api/services/wmi/concepts/comprehension.test.ts`
Expected: PASS (all 6).

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/concepts/comprehension.ts api/services/wmi/concepts/comprehension.test.ts
git commit -m "feat(wmi): pure per-concept comprehension model with tests"
```

---

## Task 5: Persist comprehension on each concept attempt

**Files:**
- Create: `api/services/wmi/concepts/conceptProgress.ts`
- Modify: `api/services/wmi/attempts.ts`

- [ ] **Step 1: Write the upsert helper**

Create `api/services/wmi/concepts/conceptProgress.ts`:

```ts
import type { PoolClient } from 'pg'
import { computeComprehension } from './comprehension.js'

const RECENT_KEEP = 10

interface ProgressRow {
  attempts: number
  correct: number
  recent: boolean[]
  best_tier: number
  comprehension_pct: number
}

// Upserts the materialized per-(child, concept) comprehension. Monotonic:
// best_tier and comprehension_pct never decrease. Runs inside the caller's tx.
export async function upsertConceptProgress(
  client: PoolClient,
  childId: string,
  conceptSlug: string,
  isCorrect: boolean,
): Promise<void> {
  const existing = await client.query<ProgressRow>(
    `SELECT attempts, correct, recent, best_tier, comprehension_pct
     FROM wmi_concept_progress WHERE child_id = $1 AND concept_slug = $2 FOR UPDATE`,
    [childId, conceptSlug],
  )
  const prev: ProgressRow = existing.rows[0] ?? {
    attempts: 0, correct: 0, recent: [], best_tier: 0, comprehension_pct: 0,
  }
  const recent = [...(prev.recent ?? []), isCorrect].slice(-RECENT_KEEP)
  const attempts = prev.attempts + 1
  const correct = prev.correct + (isCorrect ? 1 : 0)
  const c = computeComprehension({ attempts, correct, recent })
  const bestTier = Math.max(prev.best_tier, c.tier)
  const bestPct = Math.max(prev.comprehension_pct, c.pct)

  await client.query(
    `INSERT INTO wmi_concept_progress
       (child_id, concept_slug, attempts, correct, current_streak, recent, best_tier, comprehension_pct, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,NOW())
     ON CONFLICT (child_id, concept_slug) DO UPDATE SET
       attempts = EXCLUDED.attempts, correct = EXCLUDED.correct,
       current_streak = EXCLUDED.current_streak, recent = EXCLUDED.recent,
       best_tier = GREATEST(wmi_concept_progress.best_tier, EXCLUDED.best_tier),
       comprehension_pct = GREATEST(wmi_concept_progress.comprehension_pct, EXCLUDED.comprehension_pct),
       updated_at = NOW()`,
    [childId, conceptSlug, attempts, correct, c.streak, JSON.stringify(recent), bestTier, bestPct],
  )
}
```

- [ ] **Step 2: Fetch `concept_slug` in the attempt service**

In `api/services/wmi/attempts.ts`, the concept branch SELECT (around line 65) currently fetches only answer + hints. Add `concept_slug` and capture it:

```ts
let conceptSlug: string | null = null
// ... inside `if (input.mode === 'concept')`:
const inst = await queryOne<{
  concept_slug: string
  answer: string
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
}>(
  'SELECT concept_slug, answer, hint_en, hint_id, hint_steps_en, hint_steps_id FROM wmi_concept_instances WHERE id = $1',
  [input.conceptInstanceId],
  client,
)
if (!inst) throw new Error('Question not found')
conceptSlug = inst.concept_slug
answer = inst.answer
// (hints unchanged)
```

- [ ] **Step 3: Call the upsert in the concept reward block**

Import at top: `import { upsertConceptProgress } from './concepts/conceptProgress.js'`.
In the `if (input.mode === 'concept')` gamification block (around line 178), add the progress upsert before/with the reward (same transaction):

```ts
if (input.mode === 'concept') {
  await upsertConceptProgress(client, input.childId, conceptSlug as string, correct)
  gamification = await awardConceptReward(client, {
    childId: input.childId,
    conceptInstanceId: input.conceptInstanceId as string,
    isCorrect: correct,
  })
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 5: Manual verify the write**

Start `npm run dev`, answer a few concept questions for a child, then:
`psql "$DATABASE_URL" -c "SELECT concept_slug, attempts, correct, best_tier, comprehension_pct FROM wmi_concept_progress ORDER BY updated_at DESC LIMIT 5;"`
Expected: rows reflecting your answers; `best_tier`/`comprehension_pct` climb and never drop on a subsequent wrong answer.

- [ ] **Step 6: Commit**

```bash
git add api/services/wmi/concepts/conceptProgress.ts api/services/wmi/attempts.ts
git commit -m "feat(wmi): materialize per-concept comprehension on each attempt"
```

---

## Task 6: Garden read endpoint

**Files:**
- Create: `api/services/wmi/concepts/garden.ts`
- Modify: `api/routes/wmi-member.ts`

- [ ] **Step 1: Implement `getGarden`**

Create `api/services/wmi/concepts/garden.ts`:

```ts
import { pool, query } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { ensureBootstrapped } from './bootstrap.js'
import { PROFICIENT_TIER } from './comprehension.js'

const UNLOCK_PCT = 70

export interface GardenConcept {
  slug: string
  nameId: string
  nameEn: string
  difficulty: number
  tier: number
  pct: number
}
export interface GardenChapter {
  themeKey: string
  nameId: string
  nameEn: string
  colorHex: string
  iconKey: string
  concepts: GardenConcept[]
  meanPct: number
  grownCount: number   // tier >= Mahir
  total: number
  unlocked: boolean
  testedOut: boolean
}
export interface Garden {
  grade: number
  chapters: GardenChapter[]
  nextConceptSlug: string | null
}

interface Row {
  theme_key: string; name_id: string; name_en: string; color_hex: string; icon_key: string
  theme_sort: number; slug: string; c_name_id: string; c_name_en: string
  difficulty: number | null; sort_order: number; best_tier: number | null; pct: number | null
}

export async function getGarden(parentUserId: string, childId: string, grade: number): Promise<Garden> {
  await ensureBootstrapped()
  const client = await pool.connect()
  try { await assertChildOwnership(client, parentUserId, childId) } finally { client.release() }

  const rows = await query<Row>(
    `SELECT t.theme_key, t.name_id, t.name_en, t.color_hex, t.icon_key, t.sort_order AS theme_sort,
            c.slug, c.name_id AS c_name_id, c.name_en AS c_name_en, c.difficulty, c.sort_order,
            p.best_tier, p.comprehension_pct AS pct
     FROM wmi_concepts c
     JOIN wmi_themes t ON t.theme_key = c.theme_key
     LEFT JOIN wmi_concept_progress p ON p.concept_slug = c.slug AND p.child_id = $1
     WHERE c.enabled = TRUE AND $2 = ANY(c.grades)
     ORDER BY t.sort_order, c.difficulty NULLS LAST, c.sort_order, c.name_id`,
    [childId, grade],
  )

  const passed = await query<{ theme_key: string }>(
    `SELECT DISTINCT theme_key FROM wmi_chapter_tests WHERE child_id = $1 AND grade = $2 AND passed`,
    [childId, grade],
  )
  const testedOut = new Set(passed.map((r) => r.theme_key))

  // group by theme, preserving order
  const byTheme = new Map<string, GardenChapter>()
  for (const r of rows) {
    let ch = byTheme.get(r.theme_key)
    if (!ch) {
      ch = { themeKey: r.theme_key, nameId: r.name_id, nameEn: r.name_en, colorHex: r.color_hex,
        iconKey: r.icon_key, concepts: [], meanPct: 0, grownCount: 0, total: 0,
        unlocked: false, testedOut: testedOut.has(r.theme_key) }
      byTheme.set(r.theme_key, ch)
    }
    const tier = r.best_tier ?? 0
    const pct = r.pct ?? 0
    ch.concepts.push({ slug: r.slug, nameId: r.c_name_id, nameEn: r.c_name_en,
      difficulty: r.difficulty ?? 1, tier, pct })
  }

  const chapters = [...byTheme.values()]
  for (const ch of chapters) {
    ch.total = ch.concepts.length
    ch.grownCount = ch.concepts.filter((c) => c.tier >= PROFICIENT_TIER).length
    ch.meanPct = ch.total ? Math.round(ch.concepts.reduce((s, c) => s + c.pct, 0) / ch.total) : 0
  }

  // unlock: first chapter open; later opens if prev meanPct >= 70 OR tested out
  chapters.forEach((ch, i) => {
    ch.unlocked = i === 0 || ch.testedOut || (chapters[i - 1]?.meanPct ?? 0) >= UNLOCK_PCT
  })

  // next: first not-grown concept in the lowest unlocked, not-fully-grown chapter
  let nextConceptSlug: string | null = null
  for (const ch of chapters) {
    if (!ch.unlocked) continue
    const next = ch.concepts.find((c) => c.tier < PROFICIENT_TIER)
    if (next) { nextConceptSlug = next.slug; break }
  }

  return { grade, chapters, nextConceptSlug }
}
```

- [ ] **Step 2: Add the route**

In `api/routes/wmi-member.ts`, import `getGarden` and add a handler reusing `papersQuerySchema` (childId + grade):

```ts
import { getGarden } from '../services/wmi/concepts/garden.js'
// ...
router.get('/garden', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = papersQuerySchema.validate(req.query)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const garden = await getGarden(req.user.id, value.childId, value.grade)
    res.json({ success: true, data: garden })
  } catch (error) {
    console.error('WMI garden error:', error)
    sendError(res, error, 'Unable to load garden')
  }
})
```

- [ ] **Step 3: Typecheck & smoke test the endpoint**

Run: `npm run check` (expected: clean).
Start `npm run dev`; with a valid token + childId:
`curl -s "http://localhost:3001/api/me/wmi/garden?childId=<UUID>&grade=1" -H "Authorization: Bearer <TOKEN>" | jq '.data.chapters[0]'`
Expected: a chapter object with `concepts[]`, `meanPct`, `grownCount`, `unlocked`, plus a top-level `nextConceptSlug`.

- [ ] **Step 4: Commit**

```bash
git add api/services/wmi/concepts/garden.ts api/routes/wmi-member.ts
git commit -m "feat(wmi): GET /me/wmi/garden — chapters, growth, unlock, next concept"
```

---

## Task 7: Tes Bab (chapter test-out) backend

**Files:**
- Create: `api/services/wmi/concepts/chapterTest.ts`
- Modify: `api/routes/wmi-member.ts`

- [ ] **Step 1: Implement start + submit**

Create `api/services/wmi/concepts/chapterTest.ts`:

```ts
import type { PoolClient } from 'pg'
import { pool, query, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { isCorrectAnswer } from '../answerMatch.js'

const TEST_SIZE = 6
const PASS_PCT = 70
const SEED_TIER = 2          // Berlatih head-start on pass
const SEED_PCT = 35

export interface ChapterTestQuestion {
  concept_instance_id: string
  concept_slug: string
  body_id: string
  body_en: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_id: unknown
  choices_en: unknown
}

export async function startChapterTest(
  parentUserId: string, childId: string, grade: number, themeKey: string,
): Promise<{ questions: ChapterTestQuestion[] }> {
  const client = await pool.connect()
  try { await assertChildOwnership(client, parentUserId, childId) } finally { client.release() }
  // one random instance per concept in (grade, theme), up to TEST_SIZE concepts
  const questions = await query<ChapterTestQuestion>(
    `SELECT DISTINCT ON (i.concept_slug)
            i.id AS concept_instance_id, i.concept_slug, i.body_id, i.body_en,
            i.answer_type, i.choices_id, i.choices_en
     FROM wmi_concept_instances i
     JOIN wmi_concepts c ON c.slug = i.concept_slug
     WHERE c.theme_key = $1 AND $2 = ANY(c.grades) AND c.enabled = TRUE AND i.is_culled = FALSE
     ORDER BY i.concept_slug, random()
     LIMIT 100`,
    [themeKey, grade],
  )
  // shuffle and cap at TEST_SIZE
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, TEST_SIZE)
  return { questions: shuffled }
}

export async function submitChapterTest(
  parentUserId: string, childId: string, grade: number, themeKey: string,
  answers: { concept_instance_id: string; selected_answer: string }[],
): Promise<{ passed: boolean; score_pct: number; correct: number; total: number }> {
  return withTransaction(async (client: PoolClient) => {
    await assertChildOwnership(client, parentUserId, childId)
    if (answers.length === 0) throw new Error('No answers submitted')

    const ids = answers.map((a) => a.concept_instance_id)
    const rows = await client.query<{ id: string; answer: string }>(
      'SELECT id, answer FROM wmi_concept_instances WHERE id = ANY($1::uuid[])', [ids],
    )
    const answerById = new Map(rows.rows.map((r) => [r.id, r.answer]))
    let correct = 0
    for (const a of answers) {
      const truth = answerById.get(a.concept_instance_id)
      if (truth && isCorrectAnswer(truth, a.selected_answer)) correct++
    }
    const total = answers.length
    const scorePct = Math.round((correct / total) * 100)
    const passed = scorePct >= PASS_PCT

    await client.query(
      `INSERT INTO wmi_chapter_tests (child_id, grade, theme_key, score_pct, passed)
       VALUES ($1,$2,$3,$4,$5)`,
      [childId, grade, themeKey, scorePct, passed],
    )

    if (passed) {
      // seed each concept in (grade, theme) to a Berlatih head-start (monotonic)
      await client.query(
        `INSERT INTO wmi_concept_progress (child_id, concept_slug, best_tier, comprehension_pct, updated_at)
         SELECT $1, c.slug, $3, $4, NOW() FROM wmi_concepts c
         WHERE c.theme_key = $2 AND $5 = ANY(c.grades) AND c.enabled = TRUE
         ON CONFLICT (child_id, concept_slug) DO UPDATE SET
           best_tier = GREATEST(wmi_concept_progress.best_tier, EXCLUDED.best_tier),
           comprehension_pct = GREATEST(wmi_concept_progress.comprehension_pct, EXCLUDED.comprehension_pct),
           updated_at = NOW()`,
        [childId, themeKey, SEED_TIER, SEED_PCT, grade],
      )
    }
    return { passed, score_pct: scorePct, correct, total }
  })
}
```

- [ ] **Step 2: Add routes**

In `api/routes/wmi-member.ts` add schemas + handlers:

```ts
import { startChapterTest, submitChapterTest } from '../services/wmi/concepts/chapterTest.js'

const chapterTestStartSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  grade: Joi.number().integer().min(0).max(3).required(),
  theme_key: Joi.string().pattern(/^[a-z]+$/).required(),
})
const chapterTestSubmitSchema = chapterTestStartSchema.keys({
  answers: Joi.array().items(Joi.object({
    concept_instance_id: Joi.string().uuid().required(),
    selected_answer: Joi.string().trim().min(1).max(200).required(),
  })).min(1).required(),
})

router.post('/chapter-test/start', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = chapterTestStartSchema.validate(req.body)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const out = await startChapterTest(req.user.id, value.childId, value.grade, value.theme_key)
    res.json({ success: true, data: out })
  } catch (error) { console.error('WMI chapter-test start error:', error); sendError(res, error, 'Unable to start test') }
})

router.post('/chapter-test/submit', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = chapterTestSubmitSchema.validate(req.body)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const out = await submitChapterTest(req.user.id, value.childId, value.grade, value.theme_key, value.answers)
    res.status(201).json({ success: true, data: out })
  } catch (error) { console.error('WMI chapter-test submit error:', error); sendError(res, error, 'Unable to submit test') }
})
```

- [ ] **Step 3: Typecheck & smoke test**

Run: `npm run check` (expected clean). Then `curl` `/chapter-test/start` with a locked theme and confirm it returns up to 6 questions; submit answers and confirm `{passed, score_pct}` and that a passing submit makes that chapter `unlocked: true` on the next `GET /garden`.

- [ ] **Step 4: Commit**

```bash
git add api/services/wmi/concepts/chapterTest.ts api/routes/wmi-member.ts
git commit -m "feat(wmi): Tes Bab chapter test-out — start, submit, unlock + seed"
```

---

## Task 8: Frontend types & API client

**Files:**
- Modify: `src/types/wmi.ts`, `src/lib/wmiApi.ts`

- [ ] **Step 1: Add types**

Append to `src/types/wmi.ts`:

```ts
export type WmiComprehensionTier = 0 | 1 | 2 | 3 | 4

export interface WmiGardenConcept {
  slug: string
  nameId: string
  nameEn: string
  difficulty: number
  tier: WmiComprehensionTier
  pct: number
}
export interface WmiGardenChapter {
  themeKey: string
  nameId: string
  nameEn: string
  colorHex: string
  iconKey: string
  concepts: WmiGardenConcept[]
  meanPct: number
  grownCount: number
  total: number
  unlocked: boolean
  testedOut: boolean
}
export interface WmiGarden {
  grade: WmiGrade
  chapters: WmiGardenChapter[]
  nextConceptSlug: string | null
}

export interface WmiChapterTestQuestion {
  concept_instance_id: string
  concept_slug: string
  body_id: string
  body_en: string
  answer_type: WmiAnswerType
  choices_id: WmiChoice[] | null
  choices_en: WmiChoice[] | null
}
export interface WmiChapterTestResult {
  passed: boolean
  score_pct: number
  correct: number
  total: number
}
```

- [ ] **Step 2: Add API functions**

Append to `src/lib/wmiApi.ts`:

```ts
import type {
  WmiGarden, WmiChapterTestQuestion, WmiChapterTestResult,
} from '../types/wmi'

export async function fetchGarden(childId: string, grade: WmiGrade): Promise<WmiGarden> {
  const response = await api.get('/me/wmi/garden', { params: { childId, grade } })
  return unwrap<WmiGarden>(response)
}

export async function startChapterTest(
  childId: string, grade: WmiGrade, themeKey: string,
): Promise<{ questions: WmiChapterTestQuestion[] }> {
  const response = await api.post('/me/wmi/chapter-test/start', { childId, grade, theme_key: themeKey })
  return unwrap<{ questions: WmiChapterTestQuestion[] }>(response)
}

export async function submitChapterTest(
  childId: string, grade: WmiGrade, themeKey: string,
  answers: { concept_instance_id: string; selected_answer: string }[],
): Promise<WmiChapterTestResult> {
  const response = await api.post('/me/wmi/chapter-test/submit', { childId, grade, theme_key: themeKey, answers })
  return unwrap<WmiChapterTestResult>(response)
}
```

(Merge the new `import type` names into the existing type-import block at the top rather than duplicating it.)

- [ ] **Step 3: Typecheck & commit**

Run: `npm run check` (expected clean).

```bash
git add src/types/wmi.ts src/lib/wmiApi.ts
git commit -m "feat(wmi): garden + chapter-test types and API client"
```

---

## Task 9: Plant stage tokens + ConceptPlant component

**Files:**
- Create: `src/components/wmi/plantStages.ts`, `src/components/wmi/ConceptPlant.tsx`

- [ ] **Step 1: Stage token map**

Create `src/components/wmi/plantStages.ts`:

```ts
import type { WmiComprehensionTier } from '../../types/wmi'

export interface PlantStage {
  icon: string        // Font Awesome class suffix
  bg: string          // tile background (inline style hex)
  fg: string          // icon color
  labelId: string
  dashed?: boolean
  crown?: boolean
}

export const PLANT_STAGES: Record<WmiComprehensionTier, PlantStage> = {
  0: { icon: 'fa-circle-dashed', bg: '#FFF9F4', fg: '#C2C8D2', labelId: 'Belum dimulai', dashed: true },
  1: { icon: 'fa-seedling',      bg: '#E4F3D6', fg: '#5A8A2E', labelId: 'Baru belajar' },
  2: { icon: 'fa-leaf',          bg: '#BCE39A', fg: '#3F7A18', labelId: 'Berlatih' },
  3: { icon: 'fa-tree',          bg: '#58A700', fg: '#FFFFFF', labelId: 'Mahir' },
  4: { icon: 'fa-tree',          bg: '#ffdd55', fg: '#30598A', labelId: 'Dikuasai', crown: true },
}
```

- [ ] **Step 2: ConceptPlant component**

Create `src/components/wmi/ConceptPlant.tsx`. Matches the mockup plant tile (60px rounded icon, name below, orange ring + LANJUT pill when `isNext`):

```tsx
import { PLANT_STAGES } from './plantStages'
import type { WmiGardenConcept } from '../../types/wmi'

interface Props {
  concept: WmiGardenConcept
  isNext: boolean
  disabled?: boolean
  onClick: (slug: string) => void
}

export default function ConceptPlant({ concept, isNext, disabled, onClick }: Props) {
  const stage = PLANT_STAGES[concept.tier]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(concept.slug)}
      className="flex w-16 flex-shrink-0 flex-col items-center text-center disabled:opacity-60"
    >
      <span
        className={`flex h-[60px] w-[60px] items-center justify-center rounded-[18px] border-2 text-[25px] ${
          isNext ? 'border-[3px] border-qupu-brand-orange ring-4 ring-qupu-brand-orange/25' : 'border-black/10'
        } ${stage.dashed ? 'border-dashed' : ''}`}
        style={{ background: stage.bg, color: stage.fg }}
      >
        <i className={`fa-solid ${stage.icon}`} aria-hidden="true" />
        {stage.crown && (
          <i className="fa-solid fa-crown absolute -mt-9 ml-9 text-[13px] text-qupu-orange" aria-hidden="true" />
        )}
      </span>
      <span className="mt-1.5 text-[9.5px] font-bold leading-tight text-[#3A4A63]">{concept.nameId}</span>
      {isNext && (
        <span className="mt-1 rounded-full bg-qupu-brand-orange px-2 py-0.5 font-display text-[9px] font-extrabold text-white">
          LANJUT
        </span>
      )}
    </button>
  )
}
```

- [ ] **Step 3: Typecheck & commit**

Run: `npm run check` (expected clean).

```bash
git add src/components/wmi/plantStages.ts src/components/wmi/ConceptPlant.tsx
git commit -m "feat(wmi): ConceptPlant tile + plant stage tokens"
```

---

## Task 10: ChapterGarden component

**Files:**
- Create: `src/components/wmi/ChapterGarden.tsx`

- [ ] **Step 1: Build the chapter card (open + locked states)**

Create `src/components/wmi/ChapterGarden.tsx`:

```tsx
import ConceptPlant from './ConceptPlant'
import type { WmiGardenChapter } from '../../types/wmi'

interface Props {
  chapter: WmiGardenChapter
  index: number
  nextConceptSlug: string | null
  onConceptClick: (slug: string) => void
  onStartTest: (themeKey: string) => void
}

export default function ChapterGarden({ chapter, index, nextConceptSlug, onConceptClick, onStartTest }: Props) {
  const locked = !chapter.unlocked
  return (
    <div
      className={`mb-4 rounded-[1.5rem] p-4 ${
        locked ? 'bg-[#FBF4E7] ring-2 ring-[#EFE2CC]' : 'bg-white shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] text-[17px] text-white"
          style={{ background: locked ? '#C3CAD6' : chapter.colorHex }}
        >
          <i className={`fa-solid ${locked ? 'fa-lock' : `fa-${chapter.iconKey}`}`} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className={`font-display text-base font-black leading-tight ${locked ? 'text-[#7C8597]' : 'text-qupu-brand-blue'}`}>
            {chapter.nameId}
          </div>
          <div className="text-[10.5px] font-bold text-qupu-muted">
            Bab {index + 1} · {locked ? `${chapter.total} konsep` : 'ketuk tanaman untuk berlatih'}
          </div>
        </div>
        <div className={`font-display text-sm font-black ${locked ? 'text-[#AAB2BF]' : 'text-[#58A700]'}`}>
          {chapter.grownCount}/{chapter.total}
        </div>
      </div>

      {!locked && (
        <>
          <div className="my-3 h-2 overflow-hidden rounded-full bg-[#F1E4CC]">
            <div className="h-full rounded-full bg-[#58A700]" style={{ width: `${chapter.meanPct}%` }} />
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chapter.concepts.map((c) => (
              <ConceptPlant key={c.slug} concept={c} isNext={c.slug === nextConceptSlug} onClick={onConceptClick} />
            ))}
          </div>
        </>
      )}

      {locked && (
        <>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[#8A8068]">
            <i className="fa-solid fa-circle-info" aria-hidden="true" />
            Tumbuhkan bab sebelumnya 70% — atau langsung:
          </div>
          <button
            type="button"
            onClick={() => onStartTest(chapter.themeKey)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-blue p-3 font-display text-[13px] font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[11px] text-qupu-brand-orange">
              <i className="fa-solid fa-bolt" aria-hidden="true" />
            </span>
            Tes Bab · lulus &gt;70% untuk buka
          </button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck & commit**

Run: `npm run check` (expected clean).

```bash
git add src/components/wmi/ChapterGarden.tsx
git commit -m "feat(wmi): ChapterGarden card — open + locked/test-out states"
```

---

## Task 11: Rebuild WmiHub (garden + secondary actions, remove Drill bug)

**Files:**
- Modify: `src/pages/WmiHub.tsx`

- [ ] **Step 1: Replace progress/papers state with garden state**

Rewrite `WmiHub.tsx`. Remove the `fetchPapers`/`papersLoading`/`drillAvailable` block and the `ConceptCatalog` usage. Fetch the garden per (child, grade); render banner + grade chips + chapters + secondary actions. Navigation: a plant → `/latihan/wmi/konsep?concept=<slug>`; Tes Bab → `/latihan/wmi/tes/<grade>/<themeKey>`.

```tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import ChapterGarden from '../components/wmi/ChapterGarden'
import { fetchGarden } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiGarden, WmiGrade } from '../types/wmi'

export default function WmiHub() {
  const { activeChildId } = useAuthStore()
  const { selectedGrade, setSelectedGrade, loadGlossary } = useWmiStore()
  const navigate = useNavigate()
  const [garden, setGarden] = useState<WmiGarden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadGlossary().catch(() => {}) }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId) { setGarden(null); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    fetchGarden(activeChildId, selectedGrade)
      .then((d) => !cancelled && setGarden(d))
      .catch(() => !cancelled && setGarden(null))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, selectedGrade])

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[460px] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  const grownTotal = garden?.chapters.reduce((s, c) => s + c.grownCount, 0) ?? 0
  const conceptTotal = garden?.chapters.reduce((s, c) => s + c.total, 0) ?? 0

  return (
    <div className="w-full max-w-[460px] self-center pb-6">
      {/* Back pill — unchanged from current file */}
      <div className="mb-3">
        <Link to="/latihan" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5">
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" /> Kembali
        </Link>
      </div>

      {/* Banner — keep existing markup, update subtitle copy */}
      <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-orange p-5 text-white shadow-[0_6px_0_0_#C46123]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/35" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-orange shadow-[inset_0_-4px_0_#FFD3B1]">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">Kursus</p>
            <h1 className="font-display text-2xl font-black leading-none">Latihan WMI</h1>
            <p className="mt-0.5 text-[11px] font-bold text-white/80">Tumbuhkan kebunmu, kuasai tiap konsep.</p>
          </div>
        </div>
      </section>

      {/* Grade selector — unchanged */}
      <div className="mt-4 rounded-[1.5rem] bg-[#FFF8F0] p-3 ring-2 ring-[#FFE3CC]">
        <p className="px-1 pb-2 text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">Pilih kelas</p>
        <WmiGradeChips selected={selectedGrade} onSelect={(g: WmiGrade) => setSelectedGrade(g)} />
      </div>

      {/* Garden */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-black text-qupu-brand-blue">Kebun Konsep</h2>
          {garden && (
            <span className="rounded-full bg-qupu-cream px-2.5 py-1 text-[11px] font-black text-qupu-brand-blue">
              {grownTotal}/{conceptTotal} tumbuh
            </span>
          )}
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-qupu-cream" />)}
            </div>
          ) : garden && garden.chapters.length > 0 ? (
            garden.chapters.map((ch, i) => (
              <ChapterGarden
                key={ch.themeKey}
                chapter={ch}
                index={i}
                nextConceptSlug={garden.nextConceptSlug}
                onConceptClick={(slug) => navigate(`/latihan/wmi/konsep?concept=${slug}`)}
                onStartTest={(themeKey) => navigate(`/latihan/wmi/tes/${selectedGrade}/${themeKey}`)}
              />
            ))
          ) : (
            <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
              Belum ada konsep untuk kelas ini.
            </p>
          )}
        </div>
      </div>

      {/* Secondary actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/latihan/wmi/konsep" className="flex flex-col gap-1 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5">
          <i className="fa-solid fa-shuffle text-xl text-qupu-orange" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight text-qupu-brand-blue">Latihan Campur</span>
          <span className="text-[11px] font-bold text-qupu-brand-blue/65">Soal acak semua konsep</span>
        </Link>
        <Link to="/latihan/wmi/ujian" className="flex flex-col gap-1 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5">
          <i className="fa-solid fa-file-pen text-xl text-qupu-brand-blue" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight text-qupu-brand-blue">Soal Ujian</span>
          <span className="text-[11px] font-bold text-qupu-brand-blue/65">Paper WMI asli per kelas</span>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Remove now-dead imports/usages**

Confirm `fetchPapers`, `fetchConceptProgress`, `ConceptCatalog`, `WmiPaperSummary`, `WmiConceptProgressSummary` are no longer referenced in this file. If `ConceptCatalog` is unused project-wide (`grep -rn "ConceptCatalog" src/`), delete `src/components/wmi/ConceptCatalog.tsx`; otherwise leave it.

- [ ] **Step 3: Typecheck & lint**

Run: `npm run check && npm run lint`
Expected: no errors (no unused imports).

- [ ] **Step 4: Visual verify**

Run `npm run dev`, open `/latihan/wmi` as a logged-in child. Confirm: chapters render as gardens, exactly one LANJUT plant, locked chapter shows the Tes Bab button, secondary actions present, **no stuck spinner**. Compare against the approved hi-fi mockup.

- [ ] **Step 5: Commit**

```bash
git add src/pages/WmiHub.tsx
git commit -m "feat(wmi): rebuild hub as garden chapters + secondary actions; remove broken Drill card"
```

---

## Task 12: Tes Bab page + route

**Files:**
- Create: `src/pages/WmiChapterTest.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build the test page**

Create `src/pages/WmiChapterTest.tsx`. Reuse `WmiQuestionView` (or `WmiAnswerChoice`) for rendering. Flow: load questions via `startChapterTest`; collect one answer per question (no per-question feedback — it's a test); on finish call `submitChapterTest`; show pass/fail result; on pass, link back to `/latihan/wmi`.

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { startChapterTest, submitChapterTest } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import type { WmiChapterTestQuestion, WmiChapterTestResult, WmiGrade } from '../types/wmi'

export default function WmiChapterTest() {
  const { grade, themeKey } = useParams()
  const g = Number(grade) as WmiGrade
  const { activeChildId } = useAuthStore()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<WmiChapterTestQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<WmiChapterTestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!activeChildId || !themeKey) return
    let cancelled = false
    setLoading(true)
    startChapterTest(activeChildId, g, themeKey)
      .then((d) => !cancelled && setQuestions(d.questions))
      .catch(() => !cancelled && setQuestions([]))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, themeKey, g])

  const current = questions[idx]
  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => answers[q.concept_instance_id]),
    [questions, answers],
  )

  async function finish() {
    if (!activeChildId || !themeKey) return
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({
        concept_instance_id: q.concept_instance_id,
        selected_answer: answers[q.concept_instance_id] ?? '',
      }))
      setResult(await submitChapterTest(activeChildId, g, themeKey, payload))
    } finally { setSubmitting(false) }
  }

  if (!activeChildId) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  if (loading) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Memuat tes…</div>

  if (result) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white ${result.passed ? 'bg-[#58A700]' : 'bg-rose-400'}`}>
          <i className={`fa-solid ${result.passed ? 'fa-check' : 'fa-rotate-right'}`} aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">
          {result.passed ? 'Bab terbuka!' : 'Belum lulus'}
        </h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">
          Skor {result.score_pct}% ({result.correct}/{result.total}). {result.passed ? 'Bab ini sekarang terbuka.' : 'Butuh >70%. Coba lagi atau tumbuhkan bab sebelumnya.'}
        </p>
        <Link to="/latihan/wmi" className="mt-6 inline-flex rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430]">
          Kembali ke Kebun
        </Link>
      </div>
    )
  }

  if (!current) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Tes belum tersedia untuk bab ini.</div>

  const pick = (val: string) => setAnswers((a) => ({ ...a, [current.concept_instance_id]: val }))

  return (
    <div className="mx-auto w-full max-w-[460px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => navigate('/latihan/wmi')} className="text-sm font-bold text-qupu-muted"><i className="fa-solid fa-xmark" /> Keluar</button>
        <span className="text-xs font-black text-qupu-brand-blue">Soal {idx + 1}/{questions.length}</span>
      </div>
      <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        <p className="font-display text-lg font-black text-qupu-brand-blue">{current.body_id}</p>
        <div className="mt-4 space-y-2">
          {current.answer_type === 'multiple_choice' && current.choices_id ? (
            current.choices_id.map((ch) => (
              <button key={ch.label} onClick={() => pick(ch.text)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-semibold ${answers[current.concept_instance_id] === ch.text ? 'border-qupu-brand-blue bg-qupu-sky/40' : 'border-qupu-cream-dark bg-white'}`}>
                <span className="font-black text-qupu-brand-blue">{ch.label}</span> {ch.text}
              </button>
            ))
          ) : (
            <input
              type="text" inputMode="numeric"
              value={answers[current.concept_instance_id] ?? ''}
              onChange={(e) => pick(e.target.value)}
              className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-4 py-3 font-semibold focus:border-qupu-brand-orange focus:outline-none"
              placeholder="Jawabanmu"
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        {idx > 0 && (
          <button onClick={() => setIdx((i) => i - 1)} className="flex-1 rounded-full bg-white py-3 font-display font-black text-qupu-brand-blue ring-2 ring-[#FFE3CC]">Sebelumnya</button>
        )}
        {idx < questions.length - 1 ? (
          <button onClick={() => setIdx((i) => i + 1)} disabled={!answers[current.concept_instance_id]}
            className="flex-1 rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] disabled:opacity-50">Lanjut</button>
        ) : (
          <button onClick={finish} disabled={!allAnswered || submitting}
            className="flex-1 rounded-full bg-[#58A700] py-3 font-display font-black text-white shadow-[0_3px_0_0_#3C7400] disabled:opacity-50">
            {submitting ? 'Memeriksa…' : 'Selesai'}
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add the route**

In `src/App.tsx`, import `WmiChapterTest` and add inside the protected member routes (near the other `/latihan/wmi/*` routes):

```tsx
<Route path="/latihan/wmi/tes/:grade/:themeKey" element={<ProtectedRoute><WmiChapterTest /></ProtectedRoute>} />
```

(Match the exact wrapper pattern used by the sibling `/latihan/wmi/*` routes in this file.)

- [ ] **Step 3: Typecheck, lint, visual verify**

Run: `npm run check && npm run lint` (expected clean). Then `npm run dev`: open a locked chapter, tap **Tes Bab**, answer 6, submit. A ≥70% score shows "Bab terbuka!" and the chapter is unlocked on return; a fail shows the retry message.

- [ ] **Step 4: Commit**

```bash
git add src/pages/WmiChapterTest.tsx src/App.tsx
git commit -m "feat(wmi): Tes Bab chapter test-out page + route"
```

---

## Task 13: End-to-end verification & cleanup

**Files:** none (verification) — small fixes as needed.

- [ ] **Step 1: Full typecheck, lint, unit tests, build**

Run: `npm run check && npm run lint && npm test && npm run build`
Expected: all green; new vitest suites (curriculum, comprehension) pass.

- [ ] **Step 2: Manual end-to-end (per spec success criteria)**

With `npm run dev` and a fresh child:
- Grade 1 shows ordered chapters; exactly one LANJUT.
- Concepts are visually distinct by theme color + growth stage.
- Answer a concept repeatedly: comprehension climbs; a wrong answer never drops the plant; reaching Mahir requires sustained accuracy.
- Chapter 2 unlocks after chapter 1 reaches mean ≥70%, OR pass its Tes Bab.
- Switch to Grade 0 (kept) and Grade 3 — chapters render; multi-grade concepts appear in each grade.
- No stuck spinner anywhere on the hub.

- [ ] **Step 3: Confirm Drill bug is gone**

The hub no longer calls `fetchPapers`; verify `grep -n "fetchPapers" src/pages/WmiHub.tsx` returns nothing and the page never shows "Memuat…" on load.

- [ ] **Step 4: Final commit (if any fixes)**

```bash
git add -A
git commit -m "chore(wmi): curriculum learning-path verification fixes"
```

---

## Self-Review (completed)

- **Spec coverage:** themes (T2/T3), difficulty/order (T2), garden UI (T9–T11), comprehension model incl. monotonic + accuracy gate + proficient line (T4/T5), grade 0 kept + multi-grade (T6 query `$grade = ANY(grades)`), chapter gating + Tes Bab (T6/T7/T12), secondary actions + Drill-bug removal (T11), schema (T1). ✔
- **Placeholder scan:** the only intentional "fill the rest" is T2 Step 4 (the 73-concept editorial map), gated by a coverage test that fails until complete. No vague error-handling placeholders. ✔
- **Type consistency:** `computeComprehension`/`PROFICIENT_TIER` (T4) used identically in T5; `getGarden` shape (T6) matches `WmiGarden`/`WmiGardenChapter` (T8) and `ChapterGarden` props (T10); `startChapterTest`/`submitChapterTest` signatures match across T7/T8/T12. ✔
