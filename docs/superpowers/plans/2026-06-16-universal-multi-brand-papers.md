# Universal Multi-Brand Past-Papers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the past-papers subsystem host multiple olympiad brands (WMI + SASMO + future) via a config-driven brand registry and queryable brand/level columns, then import SASMO G2 2019 as the proof brand — without changing any existing WMI code or saved data.

**Architecture:** A pure-data brand registry (`api/services/wmi/olympiads/registry.ts`) is the single source of truth for each brand's prefix, ordered rounds, ordered levels, and code format. The `paperCode`/`questionCode` generators (client + server) delegate to it; WMI's config reproduces today's strings byte-for-byte. An additive migration adds `brand` + generalized `level_code`/`level_sort` (+ indexes) to `wmi_papers`, keeping `grade` as a WMI member-flow bridge. The seed loader/validator/types gain a brand axis. The admin selector gets brand tabs + a filter bar. Member-facing flows stay WMI-only.

**Tech Stack:** TypeScript, React 18 + Vite, Express, Postgres (`pg`), Vitest (`npm test` → `vitest run`), tsx seed scripts.

---

## Conventions for every task

- Run a single test file: `npx vitest run <path>` (e.g. `npx vitest run api/services/wmi/paperCode.test.ts`).
- Typecheck: `npm run check`. Lint: `npm run lint` (target **0 errors**; pre-existing `react-refresh`/`exhaustive-deps` warnings are acceptable).
- `api/` imports use `.js` extensions on relative paths even for `.ts` files — keep that convention.
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

## File structure (created / modified)

| File | Responsibility |
|---|---|
| `api/services/wmi/olympiads/registry.ts` | **NEW** — pure-data brand registry (types + WMI + SASMO) + `generatePaperCode`/`generateQuestionCode`. No `pg`/node/react imports so client + server + seed can all consume it. |
| `api/services/wmi/olympiads/registry.test.ts` | **NEW** — unit tests for the registry + generators. |
| `api/services/wmi/paperCode.ts` | Modify — delegate to the registry; keep `PaperCodeInput` back-compatible (`grade` → `level`, default `brand:'wmi'`). |
| `src/lib/wmiPaperCode.ts` | Modify — same delegation, imports the shared registry. |
| `src/lib/wmiPaperCode.test.ts`, `api/services/wmi/paperCode.test.ts` | Modify — keep WMI cases, add SASMO cases. |
| `db/migrations/0035_papers_multi_brand.sql` | **NEW** — additive migration. |
| `db/schema.sql` | Modify — fresh-install shape matches post-migration. |
| `api/services/wmi/papers.ts` | Modify — scope member queries to `brand='wmi'`; thread brand/level into `questionCode`. |
| `api/services/wmi/paperReviews.ts` | Modify — admin list + question SELECTs return brand/level; pass them to `questionCode`. |
| `api/services/wmi/paperImport/types.ts` | Modify — `PaperFile` gains `brand`+`level`, `round`→`string`, `variant` optional. |
| `api/services/wmi/paperImport/validate.ts` + `validate.test.ts` | Modify — registry-validate brand/round/level. |
| `db/seed/wmi/load.ts` | Modify — scan `db/seed/<brand>/papers`, write new columns. |
| `db/seed/sasmo/papers/2019-contest-g2.json` | **NEW** — SASMO G2 2019, 25 Q, EN + ID, answers, figures. |
| `src/lib/wmiAdminApi.ts` | Modify — `AdminPaperSummary` gains brand/level fields. |
| `src/pages/admin/AdminWmiDrill.tsx` | Modify — brand tabs + filter bar + group by level. |

**Deliberately deferred to a follow-on plan** (see end): SASMO four-role visual authoring (breakdown, hint_steps, SVG illustrations, animated explainers) and the brand-aware *visual* registry dispatch. Raw SASMO questions render via the existing `WmiFigure` `figure_url` fallback, so `WmiQuestionView` needs **no change** in this plan.

---

## Phase 1 — Brand registry + code generator

### Task 1: Create the brand registry module

**Files:**
- Create: `api/services/wmi/olympiads/registry.ts`
- Test: `api/services/wmi/olympiads/registry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// api/services/wmi/olympiads/registry.test.ts
import { describe, test, expect } from 'vitest'
import { getBrand, generatePaperCode, generateQuestionCode } from './registry.js'

describe('olympiad registry', () => {
  test('WMI reproduces legacy codes', () => {
    expect(generatePaperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(generatePaperCode({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' })).toBe('WMI-20P3B')
    expect(generateQuestionCode({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 7)).toBe('WMI-19F1A-Q7')
  })

  test('SASMO single-round segmented code', () => {
    expect(generatePaperCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' })).toBe('SASMO-19-G2')
    expect(generateQuestionCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' }, 16)).toBe('SASMO-19-G2-Q16')
  })

  test('registry exposes brand metadata', () => {
    expect(getBrand('wmi').prefix).toBe('WMI')
    expect(getBrand('sasmo').rounds).toHaveLength(1)
    expect(getBrand('sasmo').levels.find((l) => l.key === 'g2')?.labelEn).toBe('Primary 2')
  })

  test('unknown brand / round / level throw', () => {
    expect(() => getBrand('nope')).toThrow()
    expect(() => generatePaperCode({ brand: 'sasmo', year: 2019, round: 'final', level: 'g2' })).toThrow()
    expect(() => generatePaperCode({ brand: 'wmi', year: 2019, round: 'final', level: 'g9', variant: 'A' })).toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run api/services/wmi/olympiads/registry.test.ts`
Expected: FAIL — `Cannot find module './registry.js'`.

- [ ] **Step 3: Write the registry**

```ts
// api/services/wmi/olympiads/registry.ts
// Pure-data brand registry: NO pg/node/react imports, so client + server + seed
// can all import it. Single source of truth for brand identity + code format.

export interface Round { key: string; code: string; labelEn: string; labelId: string; sort: number }
export interface Level { key: string; code: string; labelEn: string; labelId: string; sort: number; grade?: number }
export interface Brand {
  slug: string
  prefix: string
  nameEn: string
  nameId: string
  rounds: Round[]
  levels: Level[]
  variants?: string[]
  defaultDurationMin: number
  formatCode(parts: { yy: string; round: Round; level: Level; variant?: string }): string
}

export interface PaperCodeInput {
  brand?: string          // default 'wmi'
  year: number
  round: string           // brand round key ('final'|'semifinal'|'contest'|...)
  grade?: number          // legacy WMI input; mapped to level 'g'+grade
  level?: string          // brand level key; preferred
  variant?: string        // default 'A'
}

const WMI: Brand = {
  slug: 'wmi',
  prefix: 'WMI',
  nameEn: 'WMI',
  nameId: 'WMI',
  rounds: [
    { key: 'semifinal', code: 'P', labelEn: 'Semifinal', labelId: 'Semifinal', sort: 0 },
    { key: 'final', code: 'F', labelEn: 'Final', labelId: 'Final', sort: 1 },
  ],
  levels: [0, 1, 2, 3].map((g) => ({
    key: `g${g}`, code: String(g), labelEn: `Grade ${g}`, labelId: `Kelas ${g}`, sort: g, grade: g,
  })),
  variants: ['A', 'B'],
  defaultDurationMin: 60,
  // Compact, no separators: WMI-19F1A
  formatCode: ({ yy, round, level, variant }) => `WMI-${yy}${round.code}${level.code}${variant ?? 'A'}`,
}

const SASMO: Brand = {
  slug: 'sasmo',
  prefix: 'SASMO',
  nameEn: 'SASMO',
  nameId: 'SASMO',
  rounds: [{ key: 'contest', code: '', labelEn: 'Contest', labelId: 'Kontes', sort: 0 }],
  levels: [
    { key: 'g2', code: 'G2', labelEn: 'Primary 2', labelId: 'Primary 2 (Kelas 2)', sort: 2, grade: 2 },
    { key: 'g3', code: 'G3', labelEn: 'Primary 3', labelId: 'Primary 3 (Kelas 3)', sort: 3, grade: 3 },
    { key: 'g4', code: 'G4', labelEn: 'Primary 4', labelId: 'Primary 4 (Kelas 4)', sort: 4, grade: 4 },
    { key: 'g5', code: 'G5', labelEn: 'Primary 5', labelId: 'Primary 5 (Kelas 5)', sort: 5, grade: 5 },
    { key: 'g6', code: 'G6', labelEn: 'Primary 6', labelId: 'Primary 6 (Kelas 6)', sort: 6, grade: 6 },
    { key: 's1', code: 'S1', labelEn: 'Secondary 1', labelId: 'Secondary 1', sort: 7 },
    { key: 's2', code: 'S2', labelEn: 'Secondary 2', labelId: 'Secondary 2', sort: 8 },
    { key: 's3', code: 'S3', labelEn: 'Secondary 3', labelId: 'Secondary 3', sort: 9 },
    { key: 's4', code: 'S4', labelEn: 'Secondary 4', labelId: 'Secondary 4', sort: 10 },
  ],
  // No variant; segmented: SASMO-19-G2
  defaultDurationMin: 90,
  formatCode: ({ yy, level }) => `SASMO-${yy}-${level.code}`,
}

const BRANDS: Record<string, Brand> = { wmi: WMI, sasmo: SASMO }

export function getBrand(slug: string): Brand {
  const b = BRANDS[slug]
  if (!b) throw new Error(`Unknown olympiad brand "${slug}"`)
  return b
}

export function listBrands(): Brand[] {
  return Object.values(BRANDS)
}

export function generatePaperCode(input: PaperCodeInput): string {
  const brand = getBrand(input.brand ?? 'wmi')
  const round = brand.rounds.find((r) => r.key === input.round)
  if (!round) throw new Error(`Brand "${brand.slug}" has no round "${input.round}"`)
  const levelKey = input.level ?? (input.grade != null ? `g${input.grade}` : undefined)
  const level = brand.levels.find((l) => l.key === levelKey)
  if (!level) throw new Error(`Brand "${brand.slug}" has no level "${levelKey}"`)
  const yy = String(input.year).slice(-2)
  return brand.formatCode({ yy, round, level, variant: input.variant })
}

export function generateQuestionCode(input: PaperCodeInput, n: number): string {
  return `${generatePaperCode(input)}-Q${n}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run api/services/wmi/olympiads/registry.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/olympiads/registry.ts api/services/wmi/olympiads/registry.test.ts
git commit -m "feat(olympiad): config-driven brand registry (WMI + SASMO) + code generators"
```

### Task 2: Delegate the server `paperCode` to the registry

**Files:**
- Modify: `api/services/wmi/paperCode.ts`
- Test: `api/services/wmi/paperCode.test.ts`

- [ ] **Step 1: Extend the test (keep WMI, add SASMO + back-compat)**

```ts
// api/services/wmi/paperCode.test.ts  — replace file contents
import { describe, test, expect } from 'vitest'
import { paperCode, questionCode } from './paperCode.js'

describe('paperCode', () => {
  test('legacy WMI shape is unchanged', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(paperCode({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' })).toBe('WMI-20P3B')
    expect(questionCode({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 1)).toBe('WMI-19F1A-Q1')
  })
  test('brand-aware SASMO shape', () => {
    expect(paperCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' })).toBe('SASMO-19-G2')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run api/services/wmi/paperCode.test.ts`
Expected: FAIL — `paperCode` does not accept `brand`/`level` (type error) or SASMO case throws.

- [ ] **Step 3: Rewrite `paperCode.ts` to delegate**

```ts
// api/services/wmi/paperCode.ts
import { generatePaperCode, generateQuestionCode, type PaperCodeInput } from './olympiads/registry.js'

export type { PaperCodeInput }

// Short human-readable code. Delegates to the brand registry; WMI output is
// byte-for-byte identical to the previous WMI-[YY][F|P][grade][A|B] format.
export function paperCode(input: PaperCodeInput): string {
  return generatePaperCode(input)
}

export function questionCode(input: PaperCodeInput, number: number): string {
  return generateQuestionCode(input, number)
}
```

- [ ] **Step 4: Run test + typecheck**

Run: `npx vitest run api/services/wmi/paperCode.test.ts && npm run check`
Expected: PASS; typecheck clean (call-sites passing `{year, round, grade, variant}` still compile because those fields are all present in `PaperCodeInput`).

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/paperCode.ts api/services/wmi/paperCode.test.ts
git commit -m "refactor(wmi): server paperCode delegates to brand registry"
```

### Task 3: Delegate the client `wmiPaperCode` to the registry

**Files:**
- Modify: `src/lib/wmiPaperCode.ts`
- Test: `src/lib/wmiPaperCode.test.ts`

- [ ] **Step 1: Extend the test**

```ts
// src/lib/wmiPaperCode.test.ts  — replace file contents
import { describe, test, expect } from 'vitest'
import { paperCode } from './wmiPaperCode'

describe('paperCode (client)', () => {
  test('formats WMI codes unchanged', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(paperCode({ year: 2025, round: 'final', grade: 2, variant: 'B' })).toBe('WMI-25F2B')
  })
  test('formats SASMO codes', () => {
    expect(paperCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' })).toBe('SASMO-19-G2')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/wmiPaperCode.test.ts`
Expected: FAIL — SASMO branch unsupported.

- [ ] **Step 3: Rewrite `src/lib/wmiPaperCode.ts` to delegate**

```ts
// src/lib/wmiPaperCode.ts
// Client paper-code generator. Delegates to the shared, pure-data brand registry
// (no pg/node imports there, so Vite bundles it cleanly into the client).
import { generatePaperCode, type PaperCodeInput } from '../../api/services/wmi/olympiads/registry'

export type { PaperCodeInput }

export function paperCode(input: PaperCodeInput): string {
  return generatePaperCode(input)
}
```

- [ ] **Step 4: Run test + build (verify Vite bundles the shared module)**

Run: `npx vitest run src/lib/wmiPaperCode.test.ts && npm run check && npm run build`
Expected: tests PASS; `tsc -b` + `vite build` succeed (proves the client can import the pure registry module). If `vite build` fails to resolve the cross-tree import, fall back: copy the brand data into `src/lib/olympiads/registry.ts` (identical content) and import that here, leaving the api copy canonical for server/seed — note the duplication in a comment and keep them in sync.

- [ ] **Step 5: Commit**

```bash
git add src/lib/wmiPaperCode.ts src/lib/wmiPaperCode.test.ts
git commit -m "refactor(wmi): client paperCode delegates to shared brand registry"
```

---

## Phase 2 — Data model

### Task 4: Additive migration + schema update

**Files:**
- Create: `db/migrations/0035_papers_multi_brand.sql`
- Modify: `db/schema.sql` (the `wmi_papers` block near line 480)

- [ ] **Step 1: Write the migration**

```sql
-- db/migrations/0035_papers_multi_brand.sql
-- Make wmi_papers multi-brand: add a queryable brand + a generalized level
-- (code+sort) alongside the legacy WMI `grade` column (kept for the member flow).
-- Relax round/variant/grade CHECKs (validation moves to import-time vs the brand
-- registry) and re-key the uniqueness on (brand, year, level_code, round, variant).
-- Indexes power the admin selector filters and future per-child entitlements.
-- Idempotent; safe to re-run.
BEGIN;

ALTER TABLE wmi_papers ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'wmi';
ALTER TABLE wmi_papers ADD COLUMN IF NOT EXISTS level_code TEXT;
ALTER TABLE wmi_papers ADD COLUMN IF NOT EXISTS level_sort SMALLINT;

-- Backfill WMI rows: level mirrors grade.
UPDATE wmi_papers SET level_code = 'g' || grade WHERE level_code IS NULL AND grade IS NOT NULL;
UPDATE wmi_papers SET level_sort = grade WHERE level_sort IS NULL AND grade IS NOT NULL;

ALTER TABLE wmi_papers ALTER COLUMN level_code SET NOT NULL;
ALTER TABLE wmi_papers ALTER COLUMN level_sort SET NOT NULL;

-- grade is now a WMI-only bridge: nullable, no range CHECK.
ALTER TABLE wmi_papers ALTER COLUMN grade DROP NOT NULL;
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_grade_check;

-- round/variant validated at import-time against the registry, not by CHECK.
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_round_check;
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_variant_check;

-- Widen the year lower bound (older papers exist).
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_year_check;
ALTER TABLE wmi_papers ADD CONSTRAINT wmi_papers_year_check CHECK (year BETWEEN 1990 AND 2099);

-- Re-key uniqueness to include brand + level_code.
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_year_grade_round_variant_unique;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wmi_papers_brand_year_level_round_variant_unique') THEN
    ALTER TABLE wmi_papers
      ADD CONSTRAINT wmi_papers_brand_year_level_round_variant_unique
      UNIQUE (brand, year, level_code, round, variant);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_wmi_papers_brand ON wmi_papers(brand);
CREATE INDEX IF NOT EXISTS idx_wmi_papers_brand_level ON wmi_papers(brand, level_code);
CREATE INDEX IF NOT EXISTS idx_wmi_papers_brand_round ON wmi_papers(brand, round);
CREATE INDEX IF NOT EXISTS idx_wmi_papers_year ON wmi_papers(year);

COMMIT;
```

- [ ] **Step 2: Update `db/schema.sql` to the post-migration shape**

In the `CREATE TABLE IF NOT EXISTS wmi_papers (...)` block: add `brand TEXT NOT NULL DEFAULT 'wmi'`, `level_code TEXT NOT NULL`, `level_sort SMALLINT NOT NULL`; change `grade SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 3)` → `grade SMALLINT`; change `round TEXT NOT NULL CHECK (round IN ('semifinal','final'))` → `round TEXT NOT NULL`; change `variant TEXT NOT NULL DEFAULT 'A' CHECK (variant IN ('A','B'))` → `variant TEXT NOT NULL DEFAULT 'A'`; change `year ... CHECK (year BETWEEN 2019 AND 2099)` → `CHECK (year BETWEEN 1990 AND 2099)`; replace the `wmi_papers_year_grade_round_variant_unique` constraint with `wmi_papers_brand_year_level_round_variant_unique UNIQUE (brand, year, level_code, round, variant)`. Add the four `CREATE INDEX` lines after the table.

- [ ] **Step 3: Apply the migration to the local DB**

Run: `psql "$DATABASE_URL" -f db/migrations/0035_papers_multi_brand.sql`
Expected: `BEGIN … COMMIT`, no errors. (If `psql` is unavailable, apply via your usual DB client.)

- [ ] **Step 4: Verify existing WMI rows backfilled**

Run: `psql "$DATABASE_URL" -c "SELECT brand, level_code, level_sort, grade FROM wmi_papers LIMIT 3;"`
Expected: `brand='wmi'`, `level_code='g'||grade`, `level_sort=grade` for existing rows.

- [ ] **Step 5: Commit**

```bash
git add db/migrations/0035_papers_multi_brand.sql db/schema.sql
git commit -m "feat(db): migration 0035 — brand + generalized level + indexes on wmi_papers"
```

### Task 5: Thread brand/level through services; scope member queries to WMI

**Files:**
- Modify: `api/services/wmi/papers.ts` (lines 71, 149, 166 — member queries; and the `questionCode(...)` calls)
- Modify: `api/services/wmi/paperReviews.ts` (admin list + question SELECTs)

- [ ] **Step 1: Scope the three member queries to `brand='wmi'`**

In `api/services/wmi/papers.ts`, in `listWmiPapers` (the `WHERE p.grade = $2` clause ~line 71) and both branches of `getWmiDrillQuestion` (~lines 149 and 166), add `AND p.brand = 'wmi'` to each `WHERE` clause. Example (listWmiPapers):

```sql
        FROM wmi_papers p
        LEFT JOIN wmi_exam_sessions s ON s.paper_id = p.id AND s.child_id = $1
        WHERE p.grade = $2 AND p.brand = 'wmi'
        GROUP BY p.id
```

- [ ] **Step 2: Select brand/level and pass them to `questionCode`**

In `api/services/wmi/papers.ts`, every SELECT that feeds `questionCode({ year, round, grade, variant }, n)` (in `listWmiQuestionsForPaper` and both `getWmiDrillQuestion` returns) — add `p.brand, p.level_code` to the SELECT list, and change the call to `questionCode({ brand, year, round, level: level_code }, n)`. Destructure `brand` and `level_code` alongside the existing `year, round, grade, variant`. (WMI rows still produce identical codes because the registry maps `round`+`level` back to the same `F/P`+digit.)

- [ ] **Step 3: Same for the admin SELECTs in `paperReviews.ts`**

In `listPapersForAdmin` add `p.brand, p.level_code, p.level_sort` to the SELECT and change the `ORDER BY` to `p.brand ASC, p.level_sort ASC, p.year DESC, p.round ASC, p.variant ASC`. In `listAdminPaperQuestions` add `p.brand, p.level_code` to the SELECT and change the `questionCode` call to `questionCode({ brand, year, round, level: level_code }, q.number)`.

- [ ] **Step 4: Typecheck + run the paper-service-adjacent tests**

Run: `npm run check && npx vitest run api/services/wmi/paperReviews.test.ts`
Expected: typecheck clean; `paperReviews` tests PASS. (Update the test's expected `code`/fields only if it asserts the new columns.)

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/papers.ts api/services/wmi/paperReviews.ts
git commit -m "feat(wmi): thread brand/level through paper services; scope member reads to WMI"
```

---

## Phase 3 — Import pipeline + SASMO import

### Task 6: Generalize the import types + validation

**Files:**
- Modify: `api/services/wmi/paperImport/types.ts`
- Modify: `api/services/wmi/paperImport/validate.ts`
- Test: `api/services/wmi/paperImport/validate.test.ts`

- [ ] **Step 1: Extend `validate.test.ts` for brand/round/level**

Add to `api/services/wmi/paperImport/validate.test.ts` a case asserting a SASMO paper validates and an unknown brand/level is rejected:

```ts
test('accepts a valid SASMO paper header', () => {
  const paper = { brand: 'sasmo', year: 2019, round: 'contest', level: 'g2', variant: 'A',
    title: 'SASMO 2019 Primary 2', recommended_duration_min: 90,
    questions: [{ number: 1, body_en: 'x', body_id: 'x', answer_type: 'fill_in', answer: '7' }] } as any
  expect(validatePaper(paper, new Set())).toEqual([])
})

test('rejects an unknown brand', () => {
  const paper = { brand: 'nope', year: 2019, round: 'contest', level: 'g2',
    title: 't', recommended_duration_min: 90,
    questions: [{ number: 1, body_en: 'x', body_id: 'x', answer_type: 'fill_in', answer: '7' }] } as any
  expect(validatePaper(paper, new Set())).toContain('unknown brand "nope"')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run api/services/wmi/paperImport/validate.test.ts`
Expected: FAIL — header fields not validated against the registry yet.

- [ ] **Step 3: Update the `PaperFile` type**

```ts
// api/services/wmi/paperImport/types.ts — replace PaperFile
export interface PaperFile {
  brand: string                 // brand slug; defaults handled at load time as 'wmi'
  year: number
  grade?: number                // legacy WMI; optional for other brands
  level: string                 // brand level key (e.g. 'g2')
  round: string                 // brand round key
  variant?: string              // default 'A'
  title: string
  source_url?: string
  recommended_duration_min: number
  questions: PaperQuestion[]
}
```

- [ ] **Step 4: Add registry validation to `validate.ts`**

At the top of `validatePaper`, after the `problems` array is created, validate the header against the registry:

```ts
import { getBrand } from '../olympiads/registry.js'
// ...inside validatePaper, before the numbering loop:
try {
  const brand = getBrand(paper.brand)
  if (!brand.rounds.some((r) => r.key === paper.round)) problems.push(`unknown round "${paper.round}" for brand "${paper.brand}"`)
  if (!brand.levels.some((l) => l.key === paper.level)) problems.push(`unknown level "${paper.level}" for brand "${paper.brand}"`)
  if (paper.variant && brand.variants && !brand.variants.includes(paper.variant)) {
    problems.push(`unknown variant "${paper.variant}" for brand "${paper.brand}"`)
  }
} catch {
  problems.push(`unknown brand "${paper.brand}"`)
}
```

- [ ] **Step 5: Run test + the existing WMI validation tests**

Run: `npx vitest run api/services/wmi/paperImport/validate.test.ts api/services/wmi/paperImport/validate.visual.test.ts && npm run check`
Expected: PASS. (Existing WMI paper fixtures must set `brand:'wmi'` and `level`; update fixtures minimally if a test constructs a `PaperFile` inline.)

- [ ] **Step 6: Commit**

```bash
git add api/services/wmi/paperImport/types.ts api/services/wmi/paperImport/validate.ts api/services/wmi/paperImport/validate.test.ts
git commit -m "feat(wmi): import types + validation gain brand/level (registry-checked)"
```

### Task 7: Generalize the seed loader to scan brand dirs

**Files:**
- Modify: `db/seed/wmi/load.ts`
- Modify: `db/seed/wmi/validate-papers.ts` (default brand/level for existing WMI files)

- [ ] **Step 1: Default WMI seed files to `brand:'wmi'` + derived `level`**

WMI seed JSONs currently lack `brand`/`level`. Rather than edit 42 files, normalize on read. In both `load.ts` and `validate-papers.ts`, after parsing each `PaperFile`, apply:

```ts
function withBrandDefaults(p: PaperFile): PaperFile {
  return {
    ...p,
    brand: p.brand ?? 'wmi',
    level: p.level ?? (p.grade != null ? `g${p.grade}` : p.level),
  }
}
```

Apply `withBrandDefaults(paper)` immediately after `loadJson<PaperFile>(...)` / `JSON.parse(...)`.

- [ ] **Step 2: Scan all brand dirs, not just `wmi`**

In `db/seed/wmi/load.ts`, change `PAPERS_DIR` discovery to walk every brand under `db/seed/<brand>/papers`:

```ts
const SEED_ROOT = path.join(__dirname, '..')          // db/seed
async function collectPaperFiles(): Promise<Array<{ fileName: string; brand: string; fullPath: string }>> {
  const out: Array<{ fileName: string; brand: string; fullPath: string }> = []
  for (const brand of await fs.readdir(SEED_ROOT, { withFileTypes: true })) {
    if (!brand.isDirectory()) continue
    const papersDir = path.join(SEED_ROOT, brand.name, 'papers')
    let entries: string[]
    try { entries = await fs.readdir(papersDir) } catch { continue }
    for (const f of entries.filter((f) => f.endsWith('.json')).sort()) {
      out.push({ fileName: `${brand.name}/${f}`, brand: brand.name, fullPath: path.join(papersDir, f) })
    }
  }
  return out
}
```

Use `withBrandDefaults` so each paper's `brand` is set (prefer the file's own `brand`, else the dir name). Keep WMI's `db/seed/wmi/papers/...` working unchanged.

- [ ] **Step 3: Write brand/level columns in the upsert**

In the `INSERT INTO wmi_papers` statement add the `brand, level_code, level_sort` columns and `ON CONFLICT (brand, year, level_code, round, variant)`; compute `level_sort` from the registry: `getBrand(paper.brand).levels.find(l => l.key === paper.level).sort`. Pass `paper.grade ?? null` for `grade`.

```ts
import { getBrand } from '../../../api/services/wmi/olympiads/registry.js'
// ...
const level = getBrand(paper.brand).levels.find((l) => l.key === paper.level)!
// INSERT columns: (brand, year, grade, level_code, level_sort, round, variant, title, source_url, recommended_duration_min, question_count, updated_at)
// ON CONFLICT (brand, year, level_code, round, variant) DO UPDATE ...
```

- [ ] **Step 4: Re-seed locally and verify WMI is unchanged + no SASMO yet**

Run: `npm run seed:wmi`
Expected: all existing WMI papers re-seed without error (`ON CONFLICT` updates rows). `psql "$DATABASE_URL" -c "SELECT DISTINCT brand FROM wmi_papers;"` → `wmi`.

- [ ] **Step 5: Commit**

```bash
git add db/seed/wmi/load.ts db/seed/wmi/validate-papers.ts
git commit -m "feat(seed): loader scans db/seed/<brand>/papers and writes brand/level"
```

### Task 8: Create + import the SASMO G2 2019 seed (text, choices, answers, translation, figures)

**Files:**
- Create: `db/seed/sasmo/papers/2019-contest-g2.json`
- Copy: SASMO figures into `db/seed/wmi/figures/` (the loader's figure dir) with stable names

> Source: `D:/claude/wmi/PastPapers/SASMO 2019/2019-SASMO-G2.pdf-…/full.md` + `images/`.
> Verified answer key: Q1 D, Q2 B, Q3 C, Q4 A, Q5 C, Q6 C, Q7 D, Q8 A, Q9 A, Q10 B,
> Q11 D, Q12 B, Q13 E, Q14 C, Q15 D, Q16 1920, Q17 42, Q18 6, Q19 26, Q20 12, Q21 9,
> Q22 68, Q23 76, Q24 8, Q25 1442. Section A (Q1–15) = `multiple_choice` (5 options A–E),
> Section B (Q16–25) = `fill_in`. Translate every `body_id`/`choices_id` to Indonesian.

- [ ] **Step 1: Copy the question figures into the figures dir**

Copy each referenced `images/*.jpg` used by a *question* (not the solution-only ones) into `db/seed/wmi/figures/` under a readable name, e.g. `sasmo-19-g2-q4-ruler.jpg`. Record the chosen filename for each question's `figure_url` as `figures/<name>`.

- [ ] **Step 2: Author the seed JSON — two worked examples + complete the rest**

Create `db/seed/sasmo/papers/2019-contest-g2.json`. Header + two representative questions (one MCQ, one fill-in) shown in full as the exact template; author Q2–Q15 (MCQ) and Q17–Q25 (fill-in) identically from `full.md`, translating each into Indonesian and copying choices/answers verbatim:

```json
{
  "brand": "sasmo",
  "year": 2019,
  "level": "g2",
  "round": "contest",
  "variant": "A",
  "title": "SASMO 2019 Primary 2 (Grade 2)",
  "source_url": null,
  "recommended_duration_min": 90,
  "questions": [
    {
      "number": 1,
      "body_en": "Calculate the sum: 9 + 11 + 8 + 12 + 7 + 13 + 6 + 14 + 5 + 14",
      "body_id": "Hitung jumlah berikut: 9 + 11 + 8 + 12 + 7 + 13 + 6 + 14 + 5 + 14",
      "answer_type": "multiple_choice",
      "choices_en": [
        { "label": "A", "text": "100" },
        { "label": "B", "text": "85" },
        { "label": "C", "text": "92" },
        { "label": "D", "text": "99" },
        { "label": "E", "text": "None of the above" }
      ],
      "choices_id": [
        { "label": "A", "text": "100" },
        { "label": "B", "text": "85" },
        { "label": "C", "text": "92" },
        { "label": "D", "text": "99" },
        { "label": "E", "text": "Bukan salah satu di atas" }
      ],
      "answer": "D"
    },
    {
      "number": 16,
      "body_en": "Use all the digits 2, 0, 1 and 9 to form a number closest to 1969.",
      "body_id": "Gunakan semua angka 2, 0, 1, dan 9 untuk membentuk bilangan yang paling dekat dengan 1969.",
      "answer_type": "fill_in",
      "answer": "1920"
    }
  ]
}
```

> Note on Q1 option D: the OCR dropped D's printed text but the worked solution computes 99 and keys (D); transcribe D as "99". For image-answer MCQs (Q5 clocks, Q6 snowflakes, Q7/Q12 shapes), follow the WMI convention: choice `text` is a short label and the figure carries the meaning (`figure_url`), to be wired to a visual in the follow-on authoring plan.

- [ ] **Step 3: Validate the SASMO paper**

Run: `npm run wmi:validate`
Expected: `✓ sasmo/2019-contest-g2.json (25 questions)` among the WMI lines; `All papers valid.` Fix any flagged figure/label issues until green.

- [ ] **Step 4: Seed and verify the brand is queryable**

Run: `npm run seed:wmi`
Then: `psql "$DATABASE_URL" -c "SELECT brand, level_code, round, year, question_count FROM wmi_papers WHERE brand='sasmo';"`
Expected: one row `sasmo | g2 | contest | 2019 | 25`.

- [ ] **Step 5: Commit**

```bash
git add db/seed/sasmo/papers/2019-contest-g2.json db/seed/wmi/figures/
git commit -m "feat(sasmo): import SASMO G2 2019 — 25 questions, EN+ID, answers, figures"
```

---

## Phase 4 — Admin selector (brand tabs + filter bar)

### Task 9: Surface brand/level in the admin papers API + client types

**Files:**
- Modify: `api/services/wmi/paperReviews.ts` (already returns brand/level after Task 5 step 3 — confirm `AdminPaperSummary` server type includes them)
- Modify: `src/lib/wmiAdminApi.ts` (`AdminPaperSummary`)

- [ ] **Step 1: Extend the client `AdminPaperSummary` type**

```ts
// src/lib/wmiAdminApi.ts — AdminPaperSummary
export interface AdminPaperSummary {
  id: string
  brand: string
  year: number
  grade: number | null
  level_code: string
  level_label: string
  round: string
  variant: string
  title: string
  question_count: number
  status: ReviewStatus
}
```

- [ ] **Step 2: Return `level_label` from the server**

In `paperReviews.ts` `listPapersForAdmin`, map `level_code` → `level_label` via the registry (`getBrand(p.brand).levels.find(l => l.key === p.level_code)?.labelId ?? p.level_code`). Add `brand, level_code, level_label, round, variant` to the returned objects. (Do this in TS after the query, or compute `level_label` in JS over the rows.)

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: clean. `paperCode(p)` call-sites in `AdminWmiDrill.tsx` will error until Task 10 — that's expected; proceed.

- [ ] **Step 4: Commit**

```bash
git add api/services/wmi/paperReviews.ts src/lib/wmiAdminApi.ts
git commit -m "feat(admin): papers list returns brand/level/round for the selector"
```

### Task 10: Brand tabs + filter bar in `AdminWmiDrill`

**Files:**
- Modify: `src/pages/admin/AdminWmiDrill.tsx`

- [ ] **Step 1: Derive brands + filter state**

Add state for the active brand and filters. Replace the `grouped` memo (which grouped by `grade`) with: (a) `brands` = distinct `p.brand` present, ordered by registry `listBrands()`; (b) `activeBrand`; (c) filter state `{ level, round, year, status }` (each nullable = "all"); (d) `search` string. Compute `visible = papers.filter(p => p.brand === activeBrand && matchesFilters(p))`, then group `visible` by `level_code` (ordered by `level_sort`/registry).

```tsx
import { listBrands, getBrand } from '../../../api/services/wmi/olympiads/registry'
// brands present, in registry order:
const brands = useMemo(() => {
  const present = new Set(papers.map((p) => p.brand))
  return listBrands().map((b) => b.slug).filter((s) => present.has(s))
}, [papers])
```

- [ ] **Step 2: Render brand tabs + filter bar above the list**

Replace the grade-grouped `<aside>` sidebar with: a horizontal brand-tab row (`brands.map(...)` → buttons; active = `activeBrand`), then a filter bar of `<select>`s for Level / Round / Year / Status plus a search `<input>`, then the paper list grouped by level (reuse the existing button row markup per paper, but use `paperCode(p)` and show `p.year`, `roundLabel`, `p.question_count`). `roundLabel` comes from `getBrand(p.brand).rounds.find(r => r.key === p.round)?.labelId ?? p.round`. Default `activeBrand` to `brands[0]` and `activePaperId` to the first visible paper when brand/filters change.

- [ ] **Step 3: Verify build + manual smoke**

Run: `npm run check && npm run lint`
Expected: typecheck clean; lint 0 errors. Then `npm run dev`, open `/admin/wmi-drill`: confirm a **WMI** tab and a **SASMO** tab; SASMO tab shows `SASMO-19-G2` (Primary 2) with 25 questions; clicking a SASMO question renders its body (EN/ID toggle) + the source figure via the `WmiFigure` fallback + the answer.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminWmiDrill.tsx
git commit -m "feat(admin): brand tabs + filter bar in the WMI drill selector"
```

---

## Self-review notes (author)

- **Spec coverage:** §4 registry → Task 1; §5 generator → Tasks 2–3; §6 migration/model → Tasks 4–5 (incl. member `brand='wmi'` scoping); §7 pipeline → Tasks 6–7; §10 SASMO import (text/answers/translation/figures) → Task 8; §9 selector → Tasks 9–10. **§8 component layer (brand-aware *visual* registry) and §10 full four-role authoring are intentionally deferred** — see below.
- **Deferred to a follow-on plan (per writing-plans scope-check):** the SASMO four-role visual treatment — `breakdown`, `hint_steps`, bespoke SVG illustrations, animated explainers, the `src/components/wmi/PastPapers/SASMO/registry.ts`, and brand-aware visual dispatch in `WmiQuestionView`. That is per-question creative work governed by the `wmi-paper-conversion` + `qupu-math-problem-creation` skills and should be its own plan once this pipeline lands. This plan delivers working, testable software: SASMO G2 2019 imported, translated, queryable, and browsable in the admin selector.
- **Type consistency:** `PaperCodeInput` (registry) is the one input shape used by client + server `paperCode`; `generatePaperCode/generateQuestionCode` names are stable across Tasks 1–3; `withBrandDefaults` is defined once and reused in Task 7; `level_code`/`level_sort`/`brand` column names match across migration, services, loader, and API types.
- **Open risk (Task 3 step 4):** if Vite can't bundle the cross-tree `api/.../registry` import into the client, use the documented `src/lib/olympiads/registry.ts` duplicate fallback.
