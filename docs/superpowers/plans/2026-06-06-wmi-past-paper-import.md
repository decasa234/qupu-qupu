# WMI Past-Paper Import Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the real WMI past papers on disk into the app's existing paper format so students practice real exams, delivered as one validated vertical slice (2019 Final, grades 0–3, Paper A).

**Architecture:** A build-time converter turns each `wmiPastPaper/<set>/full.md` (+ images + answer key) into the existing `PaperFile` JSON contract that `db/seed/wmi/load.ts` already ingests. The deterministic parts (answer-key parsing, figure naming, validation) are pure TypeScript modules under `api/services/wmi/paperImport/` (typechecked + unit-tested via vitest); the question/translation extraction is authored JSON guided by a rubric and gated by the validator. A small schema migration adds a Paper A/B `variant` column. No runtime LLM and no new runtime dependency.

**Tech Stack:** TypeScript (ESM, `"type":"module"`), Postgres via `pg`, `tsx` for seed scripts, `vitest` for tests, React + Vite frontend. Spec: `docs/superpowers/specs/2026-06-06-wmi-past-paper-import-design.md`.

---

## Context the implementer must know

- **`npm run check`** = `tsc --noEmit`; tsconfig includes only `src` and `api` (NOT `db`). So the pure import logic lives under `api/services/wmi/paperImport/` to be typechecked. The seed CLIs under `db/seed/wmi/` run via `tsx` and are intentionally thin (not typechecked).
- **`npm run test`** = `vitest run`; vitest `include` is `['api/**/*.test.ts', 'src/**/*.test.ts']`. Put test files under `api/**` so they run.
- **`api/` ESM convention:** relative imports use a `.js` suffix even for `.ts` files (e.g. `import { x } from './types.js'`). Keep that convention in the new `paperImport/` modules.
- **Loader contract** (`db/seed/wmi/load.ts`): reads `db/seed/wmi/papers/*.json` as `PaperFile`, upserts `wmi_papers` (currently `ON CONFLICT (year, grade, round)`) and `wmi_questions`. Validates that any `[[slug]]` markup in bodies/choices/hints exists in `glossary.json` — **so extracted text must be plain (no `[[ ]]` markup).**
- **Figures** are served by `GET /api/public/wmi/figures/:filename` from `db/seed/wmi/figures/`. `figure_url` is `/api/public/wmi/figures/<name>`.
- **Run a seed/CLI:** `npm run seed:wmi` (= `tsx db/seed/wmi/load.ts`). New CLIs follow the same `tsx <path>` pattern.
- **DB writes** target the LAN Postgres in `DATABASE_URL` (`.env`). Apply migrations with the node snippet shown in Task 1.

## File structure

| File | Responsibility |
|---|---|
| `db/migrations/0030_wmi_paper_variant.sql` | Add `variant` column + new unique constraint |
| `db/schema.sql` (wmi_papers block) | Mirror migration for fresh installs |
| `api/services/wmi/paperImport/types.ts` | Shared `PaperFile`/`PaperQuestion` types (incl. `variant`) |
| `api/services/wmi/paperImport/answerKey.ts` (+`.test.ts`) | Parse answer-key HTML tables → answers |
| `api/services/wmi/paperImport/figures.ts` (+`.test.ts`) | Stable figure filename |
| `api/services/wmi/paperImport/validate.ts` (+`.test.ts`) | Validate a `PaperFile` |
| `db/seed/wmi/validate-papers.ts` | CLI: validate all `papers/*.json` against `figures/` |
| `db/seed/wmi/load.ts` | Thread `variant` into insert + conflict key |
| `api/services/wmi/papers.ts` | Thread `variant` into `WmiPaperRow` + SELECTs |
| `src/types/wmi.ts` | `variant` on `WmiPaperSummary` |
| `src/components/wmi/WmiPaperCard.tsx` | Show "Paper A/B" |
| `db/seed/wmi/README.md` | Extraction rubric + worked example |
| `db/seed/wmi/papers/2019-final-g{0..3}-a.json` | The 4 slice papers (content) |
| `db/seed/wmi/figures/2019-final-g*-a-q*.<ext>` | Copied slice figures (content) |

---

### Task 1: Schema migration — `variant` column on `wmi_papers`

**Files:**
- Create: `db/migrations/0030_wmi_paper_variant.sql`
- Modify: `db/schema.sql` (the `CREATE TABLE IF NOT EXISTS wmi_papers (...)` block)

- [ ] **Step 1: Write the migration**

Create `db/migrations/0030_wmi_paper_variant.sql`:

```sql
BEGIN;

ALTER TABLE wmi_papers
  ADD COLUMN IF NOT EXISTS variant TEXT NOT NULL DEFAULT 'A' CHECK (variant IN ('A','B'));

ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_year_grade_round_unique;
ALTER TABLE wmi_papers
  ADD CONSTRAINT wmi_papers_year_grade_round_variant_unique UNIQUE (year, grade, round, variant);

COMMIT;
```

> If a parallel branch already added a `0030_*` migration, rename this to the next free number.

- [ ] **Step 2: Mirror in `db/schema.sql`**

In `db/schema.sql`, change the `wmi_papers` table so it includes the column and the new constraint name. The block becomes:

```sql
CREATE TABLE IF NOT EXISTS wmi_papers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year                     SMALLINT NOT NULL CHECK (year BETWEEN 2019 AND 2099),
  grade                    SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 3),
  round                    TEXT NOT NULL CHECK (round IN ('semifinal','final')),
  variant                  TEXT NOT NULL DEFAULT 'A' CHECK (variant IN ('A','B')),
  title                    TEXT NOT NULL,
  source_url               TEXT,
  recommended_duration_min SMALLINT NOT NULL DEFAULT 60,
  question_count           SMALLINT NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_papers_year_grade_round_variant_unique UNIQUE (year, grade, round, variant)
);
```

- [ ] **Step 3: Apply the migration to the dev DB**

Run (uses `DATABASE_URL` from `.env`):

```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const fs=await import('node:fs');const pg=(await import('pg')).default;const sql=fs.readFileSync('db/migrations/0030_wmi_paper_variant.sql','utf8');const p=new pg.Pool({connectionString:process.env.DATABASE_URL});await p.query(sql);console.log('applied');await p.end()})"
```

Expected: prints `applied`.

- [ ] **Step 4: Verify the column + constraint exist**

```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const pg=(await import('pg')).default;const p=new pg.Pool({connectionString:process.env.DATABASE_URL});const c=await p.query(\"SELECT column_name FROM information_schema.columns WHERE table_name='wmi_papers' AND column_name='variant'\");const k=await p.query(\"SELECT conname FROM pg_constraint WHERE conname='wmi_papers_year_grade_round_variant_unique'\");console.log('col',c.rowCount,'constraint',k.rowCount);await p.end()})"
```

Expected: `col 1 constraint 1`.

- [ ] **Step 5: Commit**

```bash
git add db/migrations/0030_wmi_paper_variant.sql db/schema.sql
git commit -m "feat(wmi): add Paper A/B variant column to wmi_papers"
```

---

### Task 2: Shared paper types + thread `variant` through loader, service, frontend

**Files:**
- Create: `api/services/wmi/paperImport/types.ts`
- Modify: `db/seed/wmi/load.ts` (the `PaperFile` interface + the `wmi_papers` insert)
- Modify: `api/services/wmi/papers.ts` (`WmiPaperRow` + the two SELECTs)
- Modify: `src/types/wmi.ts` (`WmiPaperSummary`)
- Modify: `src/components/wmi/WmiPaperCard.tsx` (display)

- [ ] **Step 1: Create the shared types**

Create `api/services/wmi/paperImport/types.ts`:

```ts
export interface PaperQuestion {
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en?: Array<{ label: string; text: string }>
  choices_id?: Array<{ label: string; text: string }>
  answer: string
  figure_url?: string
  hint_en?: string
  hint_id?: string
  difficulty?: number
}

export interface PaperFile {
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  source_url?: string
  recommended_duration_min: number
  questions: PaperQuestion[]
}
```

- [ ] **Step 2: Thread `variant` through the loader**

In `db/seed/wmi/load.ts`, add `variant` to the local `PaperFile` interface:

```ts
interface PaperFile {
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  source_url?: string
  recommended_duration_min: number
  questions: PaperQuestion[]
}
```

Then change the `wmi_papers` upsert query + params (the `INSERT INTO wmi_papers` block) to:

```ts
      const paperRow = await client.query<{ id: string }>(
        `
          INSERT INTO wmi_papers
            (year, grade, round, variant, title, source_url, recommended_duration_min, question_count, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (year, grade, round, variant) DO UPDATE SET
            title = EXCLUDED.title,
            source_url = EXCLUDED.source_url,
            recommended_duration_min = EXCLUDED.recommended_duration_min,
            question_count = EXCLUDED.question_count,
            updated_at = NOW()
          RETURNING id
        `,
        [
          paper.year,
          paper.grade,
          paper.round,
          paper.variant,
          paper.title,
          paper.source_url ?? null,
          paper.recommended_duration_min,
          paper.questions.length,
        ],
      )
```

- [ ] **Step 3: Thread `variant` through the service**

In `api/services/wmi/papers.ts`:

Add `variant` to `WmiPaperRow`:

```ts
export interface WmiPaperRow {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  source_url: string | null
  recommended_duration_min: number
  question_count: number
}
```

In `listWmiPapers`, add `p.variant` to the SELECT column list and `p.variant ASC` to the ORDER BY:

```ts
        SELECT p.id, p.year, p.grade, p.round, p.variant, p.title, p.source_url,
               p.recommended_duration_min, p.question_count,
```
```ts
        ORDER BY p.year DESC, p.round ASC, p.variant ASC
```

In `getWmiPaperDetail`, add `variant` to the SELECT:

```ts
        SELECT id, year, grade, round, variant, title, source_url, recommended_duration_min, question_count
        FROM wmi_papers
        WHERE id = $1
```

- [ ] **Step 4: Thread `variant` through the frontend types + card**

In `src/types/wmi.ts`, add `variant` to `WmiPaperSummary`:

```ts
export interface WmiPaperSummary {
  id: string
  year: number
  grade: WmiGrade
  round: WmiRound
  variant: 'A' | 'B'
  title: string
  source_url: string | null
  recommended_duration_min: number
  question_count: number
  best_score: number | string | null
}
```

(`WmiPaperDetail extends Omit<WmiPaperSummary, 'best_score'>` so it inherits `variant`.)

In `src/components/wmi/WmiPaperCard.tsx`, show the variant in the heading:

```tsx
        <strong>
          {paper.year} {paper.round === 'final' ? 'Final' : 'Semifinal'} · Paper {paper.variant}
        </strong>
```

- [ ] **Step 5: Confirm the API client passes `variant` through**

Open `src/lib/wmiApi.ts`. If `fetchPapers` returns the API rows directly (e.g. `return res.data.data.papers`), no change is needed. If it maps fields explicitly into objects, add `variant: row.variant` to the mapping.

- [ ] **Step 6: Typecheck**

Run: `npm run check`
Expected: `tsc --noEmit` exits 0 (no errors).

- [ ] **Step 7: Commit**

```bash
git add api/services/wmi/paperImport/types.ts db/seed/wmi/load.ts api/services/wmi/papers.ts src/types/wmi.ts src/components/wmi/WmiPaperCard.tsx src/lib/wmiApi.ts
git commit -m "feat(wmi): thread paper variant through loader, service, and UI"
```

---

### Task 3: Answer-key parser (TDD)

**Files:**
- Create: `api/services/wmi/paperImport/answerKey.test.ts`
- Create: `api/services/wmi/paperImport/answerKey.ts`

- [ ] **Step 1: Write the failing test**

Create `api/services/wmi/paperImport/answerKey.test.ts` (markdown is the real 2019 G1 Final answer key):

```ts
import { describe, test, expect } from 'vitest'
import { parseAnswerKey } from './answerKey.js'

const MD = `Logical Reasoning /數 學 思 維 能 力

<table><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td>B</td><td>B</td><td>D</td><td>A</td><td>C</td></tr></table>

<table><tr><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr><tr><td>C</td><td>D</td><td>B</td><td>B</td><td>C</td></tr></table>

<table><tr><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td></tr><tr><td>C</td><td>C</td><td>A</td><td>D</td><td>C</td></tr></table>

Applications /數 學 應 用 能 力

<table><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td>240</td><td>15</td><td>13</td><td>33</td><td>23</td></tr></table>

<table><tr><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr><tr><td>6</td><td>20</td><td>527</td><td>2134</td><td>2211</td></tr></table>`

describe('parseAnswerKey', () => {
  test('parses both sections into number→answer maps', () => {
    const key = parseAnswerKey(MD)
    expect(Object.keys(key.reasoning)).toHaveLength(15)
    expect(Object.keys(key.applications)).toHaveLength(10)
    expect(key.reasoning[1]).toBe('B')
    expect(key.reasoning[15]).toBe('C')
    expect(key.applications[1]).toBe('240')
    expect(key.applications[10]).toBe('2211')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run api/services/wmi/paperImport/answerKey.test.ts`
Expected: FAIL — cannot resolve `./answerKey.js`.

- [ ] **Step 3: Implement**

Create `api/services/wmi/paperImport/answerKey.ts`:

```ts
export interface AnswerKey {
  reasoning: Record<number, string>
  applications: Record<number, string>
}

function cells(row: string): string[] {
  return [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => m[1].trim())
}

function parseSection(section: string): Record<number, string> {
  const out: Record<number, string> = {}
  for (const [, inner] of section.matchAll(/<table>([\s\S]*?)<\/table>/g)) {
    const rows = [...inner.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1])
    if (rows.length < 2) continue
    const nums = cells(rows[0])
    const ans = cells(rows[1])
    for (let i = 0; i < nums.length; i++) {
      const n = Number(nums[i])
      if (Number.isInteger(n) && ans[i] !== undefined && ans[i] !== '') out[n] = ans[i]
    }
  }
  return out
}

// Answer keys have a "Logical Reasoning" section (A–D) and an "Applications"
// section (numeric), each a set of two-row HTML tables (numbers, then answers).
export function parseAnswerKey(md: string): AnswerKey {
  const appIdx = md.search(/Applications/i)
  const reasoningPart = appIdx >= 0 ? md.slice(0, appIdx) : md
  const applicationsPart = appIdx >= 0 ? md.slice(appIdx) : ''
  return {
    reasoning: parseSection(reasoningPart),
    applications: parseSection(applicationsPart),
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run api/services/wmi/paperImport/answerKey.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/paperImport/answerKey.ts api/services/wmi/paperImport/answerKey.test.ts
git commit -m "feat(wmi): answer-key table parser for past-paper import"
```

---

### Task 4: Figure filename helper (TDD)

**Files:**
- Create: `api/services/wmi/paperImport/figures.test.ts`
- Create: `api/services/wmi/paperImport/figures.ts`

- [ ] **Step 1: Write the failing test**

Create `api/services/wmi/paperImport/figures.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { figureName } from './figures.js'

describe('figureName', () => {
  test('builds a stable lowercase name from paper meta + question number', () => {
    expect(figureName({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 3, 'jpg')).toBe('2019-final-g1-a-q3.jpg')
    expect(figureName({ year: 2019, round: 'final', grade: 0, variant: 'A' }, 12, '.PNG')).toBe('2019-final-g0-a-q12.png')
    expect(figureName({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' }, 7, 'jpeg')).toBe('2020-semifinal-g3-b-q7.jpeg')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run api/services/wmi/paperImport/figures.test.ts`
Expected: FAIL — cannot resolve `./figures.js`.

- [ ] **Step 3: Implement**

Create `api/services/wmi/paperImport/figures.ts`:

```ts
export interface PaperMeta {
  year: number
  round: 'semifinal' | 'final'
  grade: number
  variant: 'A' | 'B'
}

// Deterministic, collision-free figure filename for a paper question.
export function figureName(meta: PaperMeta, questionNumber: number, ext: string): string {
  const e = ext.replace(/^\./, '').toLowerCase()
  return `${meta.year}-${meta.round}-g${meta.grade}-${meta.variant.toLowerCase()}-q${questionNumber}.${e}`
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run api/services/wmi/paperImport/figures.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/paperImport/figures.ts api/services/wmi/paperImport/figures.test.ts
git commit -m "feat(wmi): stable figure naming for past-paper import"
```

---

### Task 5: Paper validator (TDD)

**Files:**
- Create: `api/services/wmi/paperImport/validate.test.ts`
- Create: `api/services/wmi/paperImport/validate.ts`

- [ ] **Step 1: Write the failing test**

Create `api/services/wmi/paperImport/validate.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { validatePaper } from './validate.js'
import type { PaperFile } from './types.js'

function mc(number: number, answer: string, figure?: string): PaperFile['questions'][number] {
  return {
    number,
    body_en: `Q${number} en`,
    body_id: `Q${number} id`,
    answer_type: 'multiple_choice',
    choices_en: ['A', 'B', 'C', 'D'].map((l) => ({ label: l, text: `${l}t` })),
    choices_id: ['A', 'B', 'C', 'D'].map((l) => ({ label: l, text: `${l}t` })),
    answer,
    ...(figure ? { figure_url: `/api/public/wmi/figures/${figure}` } : {}),
  }
}

const goodPaper: PaperFile = {
  year: 2019, grade: 1, round: 'final', variant: 'A',
  title: 'WMI 2019 Grade 1 Final — Paper A', recommended_duration_min: 60,
  questions: [
    mc(1, 'B', '2019-final-g1-a-q1.jpg'),
    mc(2, 'D'),
    { number: 3, body_en: 'x', body_id: 'y', answer_type: 'fill_in', answer: '240' },
  ],
}

describe('validatePaper', () => {
  test('a well-formed paper has no problems', () => {
    expect(validatePaper(goodPaper, new Set(['2019-final-g1-a-q1.jpg']))).toEqual([])
  })

  test('flags bad choices, bad answer, missing figure, empty fill-in, and numbering gaps', () => {
    const bad: PaperFile = {
      ...goodPaper,
      questions: [
        { ...mc(1, 'E'), choices_en: [{ label: 'A', text: 'a' }] }, // 1 choice, answer not A-D
        mc(3, 'B', 'missing.jpg'), // numbering gap (no #2), figure absent
        { number: 4, body_en: 'x', body_id: 'y', answer_type: 'fill_in', answer: '' }, // empty fill-in
      ],
    }
    const problems = validatePaper(bad, new Set())
    expect(problems.join('\n')).toMatch(/numbering not contiguous/)
    expect(problems.join('\n')).toMatch(/Q1: .*choices_en/)
    expect(problems.join('\n')).toMatch(/Q1: answer "E" must be A-D/)
    expect(problems.join('\n')).toMatch(/Q3: figure_url file "missing.jpg" not found/)
    expect(problems.join('\n')).toMatch(/Q4: fill_in needs a non-empty answer/)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run api/services/wmi/paperImport/validate.test.ts`
Expected: FAIL — cannot resolve `./validate.js`.

- [ ] **Step 3: Implement**

Create `api/services/wmi/paperImport/validate.ts`:

```ts
import type { PaperFile } from './types.js'

// Returns a list of human-readable problems; empty means the paper is valid.
export function validatePaper(paper: PaperFile, presentFigures: Set<string>): string[] {
  const problems: string[] = []
  const tag = (n: number, msg: string) => `Q${n}: ${msg}`

  const numbers = paper.questions.map((q) => q.number)
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] !== i + 1) {
      problems.push(`numbering not contiguous at position ${i + 1} (found ${numbers[i]}, expected ${i + 1})`)
      break
    }
  }
  if (new Set(numbers).size !== numbers.length) problems.push('duplicate question numbers')

  const okChoices = (c?: Array<{ label: string; text: string }>): boolean =>
    Array.isArray(c) && c.length === 4 && c.every((x, i) => x.label === 'ABCD'[i] && Boolean(x.text?.trim()))

  for (const q of paper.questions) {
    if (!q.body_en?.trim()) problems.push(tag(q.number, 'empty body_en'))
    if (!q.body_id?.trim()) problems.push(tag(q.number, 'empty body_id'))

    if (q.answer_type === 'multiple_choice') {
      if (!okChoices(q.choices_en)) problems.push(tag(q.number, 'multiple_choice needs 4 choices_en labelled A,B,C,D'))
      if (!okChoices(q.choices_id)) problems.push(tag(q.number, 'multiple_choice needs 4 choices_id labelled A,B,C,D'))
      if (!/^[ABCD]$/.test(q.answer)) problems.push(tag(q.number, `answer "${q.answer}" must be A-D`))
    } else if (q.answer_type === 'fill_in') {
      if (!q.answer?.trim()) problems.push(tag(q.number, 'fill_in needs a non-empty answer'))
    } else {
      problems.push(tag(q.number, `unknown answer_type "${q.answer_type as string}"`))
    }

    if (q.figure_url) {
      const base = q.figure_url.split('/').pop() ?? ''
      if (!presentFigures.has(base)) problems.push(tag(q.number, `figure_url file "${base}" not found in figures/`))
    }
  }

  return problems
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run api/services/wmi/paperImport/validate.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run check` (expected: exits 0).

```bash
git add api/services/wmi/paperImport/validate.ts api/services/wmi/paperImport/validate.test.ts
git commit -m "feat(wmi): paper validator for past-paper import"
```

---

### Task 6: Validation CLI + npm script

**Files:**
- Create: `db/seed/wmi/validate-papers.ts`
- Modify: `package.json` (add a script)

- [ ] **Step 1: Create the CLI**

Create `db/seed/wmi/validate-papers.ts`:

```ts
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePaper } from '../../../api/services/wmi/paperImport/validate.js'
import type { PaperFile } from '../../../api/services/wmi/paperImport/types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAPERS = path.join(__dirname, 'papers')
const FIGURES = path.join(__dirname, 'figures')

const figures = new Set((await fs.readdir(FIGURES)).filter((f) => !f.startsWith('.')))
const files = (await fs.readdir(PAPERS)).filter((f) => f.endsWith('.json')).sort()

let problemCount = 0
for (const file of files) {
  const paper = JSON.parse(await fs.readFile(path.join(PAPERS, file), 'utf8')) as PaperFile
  const problems = validatePaper(paper, figures)
  if (problems.length === 0) {
    console.log(`✓ ${file} (${paper.questions.length} questions)`)
  } else {
    problemCount += problems.length
    console.log(`✗ ${file}`)
    for (const p of problems) console.log(`    - ${p}`)
  }
}

if (problemCount > 0) {
  console.error(`\n${problemCount} problem(s) found.`)
  process.exit(1)
}
console.log('\nAll papers valid.')
```

- [ ] **Step 2: Add the npm script**

In `package.json` `scripts`, add (next to `seed:wmi`):

```json
    "wmi:validate": "tsx db/seed/wmi/validate-papers.ts",
```

- [ ] **Step 3: Run it against the existing sample**

Run: `npm run wmi:validate`
Expected: prints `✓ 2024-grade-1-final.json (2 questions)` and `All papers valid.` (the existing sample's figure `2024-g1-q1.png` is present in `figures/`). Exit 0.

- [ ] **Step 4: Commit**

```bash
git add db/seed/wmi/validate-papers.ts package.json
git commit -m "feat(wmi): wmi:validate CLI gates paper JSON before seeding"
```

---

### Task 7: Extraction rubric (docs)

**Files:**
- Modify: `db/seed/wmi/README.md` (append a section)

- [ ] **Step 1: Append the import rubric**

Append to `db/seed/wmi/README.md`:

````markdown
## Importing real past papers (`wmiPastPaper/`)

Each source set is a folder pair: `<Year> WMI <Round> G0N Paper <A|B>/` (questions)
and `<Year> WMI <Round> G0N Answer Key/` (answers). Each folder has `full.md`
(markdown, bilingual English + Chinese), `images/` (figures), and JSON metadata.

Produce one `papers/<year>-<round>-g<grade>-<variant>.json` per paper.

**Procedure per paper:**

1. **Answers.** Run the answer-key parser on the answer-key `full.md` to get the
   number→answer maps (Reasoning A–D; Applications numeric):

   ```bash
   node --input-type=module -e "import('node:fs').then(async fs=>{const {parseAnswerKey}=await import('./api/services/wmi/paperImport/answerKey.ts');console.log(JSON.stringify(parseAnswerKey(fs.readFileSync(process.argv[1],'utf8')),null,1))})" "wmiPastPaper/2019 WMI Final G01 Answer Key/full.md"
   ```
   (If `.ts` import fails in plain node, run the same via `tsx`.)

2. **Questions.** Read the paper `full.md`. It has two sections: **Logical
   Reasoning** (multiple-choice, numbered 1–15) and **Applications** (fill-in,
   numbered 1–10). For each question emit a `PaperQuestion`:
   - **Renumber continuously:** Reasoning → `number` 1–15 (`answer_type:
     "multiple_choice"`); Applications → `number` 16–25 (`answer_type: "fill_in"`).
   - `body_en` = the English stem, cleaned of OCR noise. **Drop the duplicated
     Chinese lines.** **Plain text only — no `[[ ]]` glossary markup.**
   - `body_id` = a natural Indonesian translation of the stem.
   - For MC, `choices_en` = the `(A)`–`(D)` options as `{label,text}`;
     `choices_id` = translated options (numbers/symbols stay the same).
   - `answer` = from step 1 (`"B"` for MC at that number; the numeric string for
     fill-in). The count of answers must equal the count of questions.
   - **Figure:** if the question shows `![](images/<hash>.<ext>)`, set
     `figure_url` to `/api/public/wmi/figures/` + `figureName(meta, number, ext)`
     and copy the image (step 3). Use the `<details>natural_image</details>`
     alt-text only to understand the figure, never as body text.
   - Omit `hint_en`/`hint_id`/`difficulty` (past papers have none).

3. **Figures.** For each figure, copy it to `figures/` under its stable name:

   ```bash
   node --input-type=module -e "import('node:fs').then(fs=>fs.copyFileSync(process.argv[1],process.argv[2]))" "wmiPastPaper/2019 WMI Final G01 Paper A/images/<hash>.jpg" "db/seed/wmi/figures/2019-final-g1-a-q1.jpg"
   ```

4. **Paper header:** `year`, `grade` (G00→0…G03→3), `round` (Prelim→`semifinal`,
   Final→`final`), `variant` (`A`/`B`), `recommended_duration_min` (from the paper
   if stated, else 60), `title` = `WMI <year> Grade <grade> <Round> — Paper <variant>`.

5. **Validate:** `npm run wmi:validate` until the paper reports `✓`.

### Worked example (2019 Final G1 Paper A, question 1)

Source `full.md`:
```
1) Count. How many h ’s are there?
![](images/53947e6a...jpg)
(A) 44  (B) 48  (C) 52  (D) 54
```
Answer key: Reasoning #1 = `B`. Emitted JSON:
```json
{
  "number": 1,
  "body_en": "Count. How many h's are there?",
  "body_id": "Hitunglah. Ada berapa banyak huruf h?",
  "answer_type": "multiple_choice",
  "choices_en": [
    { "label": "A", "text": "44" }, { "label": "B", "text": "48" },
    { "label": "C", "text": "52" }, { "label": "D", "text": "54" }
  ],
  "choices_id": [
    { "label": "A", "text": "44" }, { "label": "B", "text": "48" },
    { "label": "C", "text": "52" }, { "label": "D", "text": "54" }
  ],
  "answer": "B",
  "figure_url": "/api/public/wmi/figures/2019-final-g1-a-q1.jpg"
}
```
(and the image is copied to `db/seed/wmi/figures/2019-final-g1-a-q1.jpg`.)
````

- [ ] **Step 2: Commit**

```bash
git add db/seed/wmi/README.md
git commit -m "docs(wmi): past-paper extraction rubric + worked example"
```

---

### Task 8: Generate the 4 slice papers (content)

**Files:**
- Create: `db/seed/wmi/papers/2019-final-g0-a.json`
- Create: `db/seed/wmi/papers/2019-final-g1-a.json`
- Create: `db/seed/wmi/papers/2019-final-g2-a.json`
- Create: `db/seed/wmi/papers/2019-final-g3-a.json`
- Create: figures under `db/seed/wmi/figures/2019-final-g{0..3}-a-q*.<ext>`

Source folders: `wmiPastPaper/2019 WMI Final G0{0..3} Paper A/` + `... G0{0..3} Answer Key/`.

> Do this one paper at a time. Each paper is an independent unit; a fresh
> subagent can own one paper. Follow the rubric in `db/seed/wmi/README.md`
> exactly. This is content authoring (extraction + translation), gated by the
> validator — not throwaway code.

- [ ] **Step 1: Parse the four answer keys**

For each grade 0–3, run the answer-key parser command from the rubric on
`wmiPastPaper/2019 WMI Final G0N Answer Key/full.md` and keep the maps.

- [ ] **Step 2: Author `2019-final-g1-a.json`** (start with G1 — its format is in the worked example)

Read `wmiPastPaper/2019 WMI Final G01 Paper A/full.md`, produce the full
`PaperFile` per the rubric (continuous numbering 1–25, EN + ID, choices, answers
from step 1), and copy its figures into `db/seed/wmi/figures/`.

- [ ] **Step 3: Validate G1**

Run: `npm run wmi:validate`
Expected: `✓ 2019-final-g1-a.json (… questions)` and no problems for that file.
Fix the JSON until it reports `✓`.

- [ ] **Step 4: Author + validate G0, G2, G3**

Repeat Steps 2–3 for grades 0, 2, 3 (`2019-final-g0-a.json`, `2019-final-g2-a.json`,
`2019-final-g3-a.json`), copying each paper's figures. Note: lower grades may have
fewer than 25 questions — that's fine; the validator only requires contiguous
numbering and per-question integrity. After all four: `npm run wmi:validate`
reports `✓` for all and `All papers valid.`

- [ ] **Step 5: Commit**

```bash
git add db/seed/wmi/papers/2019-final-g0-a.json db/seed/wmi/papers/2019-final-g1-a.json db/seed/wmi/papers/2019-final-g2-a.json db/seed/wmi/papers/2019-final-g3-a.json db/seed/wmi/figures/
git commit -m "feat(wmi): import 2019 Final Paper A, grades 0-3 (slice)"
```

---

### Task 9: Load + verify in the app

**Files:** none (verification + final load).

- [ ] **Step 1: Seed the papers**

Run: `npm run seed:wmi`
Expected: prints `Seeded WMI 2019 Grade N Final — Paper A (… questions)` for each
of the four papers (plus the existing 2024 sample) and `Done.`

- [ ] **Step 2: Verify rows in the DB**

```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const pg=(await import('pg')).default;const p=new pg.Pool({connectionString:process.env.DATABASE_URL});const r=await p.query(\"SELECT year,grade,round,variant,question_count FROM wmi_papers WHERE year=2019 ORDER BY grade\");console.log(r.rows);await p.end()})"
```
Expected: 4 rows (grades 0–3, round `final`, variant `A`) with non-zero
`question_count`.

- [ ] **Step 3: Spot-check in the running app**

Run `npm run dev`. Sign in (admin: `shops@decasa.co.id`), pick a child profile,
go to `/latihan/wmi/papers`. Switch the grade chips across 0–3 and confirm:
- the 2019 Final · Paper A card appears per grade;
- opening one shows questions with their figures, A–D choices, and Indonesian
  toggling where applicable;
- a few answers match the source answer key.

- [ ] **Step 4: Final typecheck + lint + full test run**

Run: `npm run check` (exit 0), `npm run lint` (no new errors), `npm run test`
(the three new `paperImport` test files pass).

- [ ] **Step 5: Commit any fixups + push**

```bash
git add -A
git commit -m "chore(wmi): verify 2019 Final Paper A slice loads and renders"
git push
```

---

## Follow-on (out of scope for this plan)

Batch the remaining sets (2019–2025, Prelim + Final, all grades, Paper A + B)
using the same rubric + `wmi:validate` gate, one year/round at a time. No code
changes expected — only new `papers/*.json` + figures. Optionally add a
`section` column later if the UI wants "Logical Reasoning / Applications" headers.

## Self-review notes

- **Spec coverage:** schema migration + variant threading (Task 1–2), LLM-assisted
  extraction to the existing contract (Task 7–8), Indonesian translation (rubric),
  deterministic answer-key parse (Task 3), figure copy/serve (Task 4 + rubric),
  validation gate (Task 5–6), vertical slice 2019 Final G0–G3 Paper A (Task 8),
  load + app verify (Task 9). All spec sections map to a task.
- **Continuous numbering** (Reasoning 1–15, Applications 16–25) is enforced by the
  validator's contiguity check and documented in the rubric.
- **Round mapping** Prelim→semifinal / Final→final is in the rubric; the slice is
  all `final`.
