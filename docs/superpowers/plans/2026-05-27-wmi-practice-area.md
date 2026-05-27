# WMI Practice Area Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the kid-driven WMI past-paper practice surface defined in `docs/superpowers/specs/2026-05-27-wmi-practice-area-design.md` — drill + exam + bilingual spoiler + math glossary, all members-only, in child-profile context, with no badge/quest wiring in v1.

_Progress 2026-05-27: Implemented Tasks 1-20 in code and verified with `npm run check` plus `npm run build`. DB/manual smoke steps remain pending because this workspace has no `DATABASE_URL` and `psql` is not installed on PATH; `npm run seed:wmi` currently stops at `DATABASE_URL is required`._

**Architecture:** New migration `0018_wmi_practice.sql` adds five tables (`wmi_papers`, `wmi_questions`, `wmi_glossary_terms`, `wmi_exam_sessions`, `wmi_attempts`). Two new Express routers — `wmi-public.ts` (`/api/public/wmi/*` for glossary + figures) and `wmi-member.ts` (`/api/me/wmi/*` for papers + drill + attempts + sessions, every endpoint taking explicit `childId`). Frontend adds five pages under `/latihan/wmi/*`, a `wmiStore` zustand slice that caches the glossary, a pure markup parser for `[[slug]]` glossary tags, and a shared `WmiQuestionView` used by drill/exam/review. Seed content lives in `db/seed/wmi/` and is upserted via a new `npm run seed:wmi` script.

**Tech Stack:** Express + pg (ESM with `.js` import suffixes), React 18 + Vite + Tailwind + React Router 7, Joi for server validation, zustand + axios on the client, Postgres via the existing `pg.Pool`. No new dependencies.

**Test note:** This repo has no test runner (per `CLAUDE.md`). The TDD pattern adapts to: write the change, run `npm run check` and confirm it passes, hit the affected route manually (curl for API, browser for UI), then commit. Each task ends with these verification steps. Mirrors the convention in `docs/superpowers/plans/2026-04-28-dashboard-report-and-trophy-wall.md`.

---

## File Map

**New files (`db/`)**
- `db/migrations/0018_wmi_practice.sql` — five tables + indexes
- `db/seed/wmi/README.md` — content authoring guide + analytics SQL snippets
- `db/seed/wmi/glossary.json` — seed glossary
- `db/seed/wmi/papers/2024-grade-1-final.json` — sample paper
- `db/seed/wmi/load.ts` — Node upsert script
- `db/seed/wmi/figures/` — figure assets folder

**New files (`api/`)**
- `api/lib/childOwnership.ts` — extracted `assertChildOwnership` helper (Task 1)
- `api/services/wmi/glossary.ts`
- `api/services/wmi/papers.ts`
- `api/services/wmi/sessions.ts`
- `api/services/wmi/attempts.ts`
- `api/routes/wmi-public.ts`
- `api/routes/wmi-member.ts`

**New files (`src/`)**
- `src/types/wmi.ts`
- `src/lib/wmiMarkup.ts`
- `src/lib/wmiApi.ts`
- `src/store/wmiStore.ts`
- `src/components/wmi/WmiQuestionView.tsx`
- `src/components/wmi/WmiGlossaryTerm.tsx`
- `src/components/wmi/WmiGlossaryPopover.tsx`
- `src/components/wmi/WmiTranslationSpoiler.tsx`
- `src/components/wmi/WmiAnswerChoice.tsx`
- `src/components/wmi/WmiFigure.tsx`
- `src/components/wmi/WmiFeedbackPanel.tsx`
- `src/components/wmi/WmiExamTimer.tsx`
- `src/components/wmi/WmiExamProgressBar.tsx`
- `src/components/wmi/WmiExamReviewItem.tsx`
- `src/components/wmi/WmiGradeChips.tsx`
- `src/components/wmi/WmiPaperCard.tsx`
- `src/pages/WmiHub.tsx`
- `src/pages/WmiDrill.tsx`
- `src/pages/WmiPaperDetail.tsx`
- `src/pages/WmiExam.tsx`
- `src/pages/WmiExamReview.tsx`

**Modified**
- `api/services/member.ts` — replace the private `assertChildOwnership` body with a re-export from `api/lib/childOwnership.ts`
- `api/app.ts` — mount `/api/public/wmi` and `/api/me/wmi`
- `db/schema.sql` — append the five new tables (mirror migration)
- `package.json` — add `"seed:wmi": "tsx db/seed/wmi/load.ts"`
- `src/App.tsx` — register 5 WMI routes
- `src/components/Navbar.tsx` — add "Latihan" link

---

## Task 1: Extract `assertChildOwnership` into a shared module

**Why:** WMI services need to verify the parent owns the supplied `childId`, exactly like `member.ts` does. Currently `assertChildOwnership` is private inside `api/services/member.ts:36-50`. Extracting once now keeps the WMI services from duplicating the pattern.

**Files:**
- Create: `api/lib/childOwnership.ts`
- Modify: `api/services/member.ts:36-50` (replace private function with re-export)

- [ ] **Step 1: Create the shared module**

Create `api/lib/childOwnership.ts`:

```ts
import type { PoolClient } from 'pg'
import { queryOne } from '../db.js'

/**
 * Throws "Child not found" if the supplied childId is not owned by the
 * supplied parentUserId. Routes that fail this should map the error to a
 * 403 (or 404, matching the existing /api/me/* pattern in member.ts).
 */
export async function assertChildOwnership(
  executor: PoolClient,
  parentUserId: string,
  childId: string,
): Promise<void> {
  const owned = await queryOne<{ id: string }>(
    'SELECT id FROM children WHERE id = $1 AND parent_user_id = $2',
    [childId, parentUserId],
    executor,
  )

  if (!owned) {
    throw new Error('Child not found')
  }
}
```

- [ ] **Step 2: Replace `member.ts`'s private copy with a re-export**

Two edits in `api/services/member.ts`:

1. **Add the import at the top of the file**, next to the other imports:

```ts
import { assertChildOwnership } from '../lib/childOwnership.js'
```

2. **Delete the entire private function definition** (`async function assertChildOwnership(...) { ... }` block, around lines 36-50). Do not leave a stub. The imported binding now satisfies every existing call site since they already use the same `(client, userId, childId)` signature.

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS — no type errors. (If you see "assertChildOwnership is not defined", you missed deleting the private body.)

- [ ] **Step 4: Smoke test an existing endpoint**

Start the dev server (`npm run dev`), then with any logged-in session pull progress for a known child:

```bash
curl -s "http://localhost:3001/api/me/progress?childId=<known-child-id>" \
  -H "Authorization: Bearer <token>" | head -c 200
```

Expected: a JSON `{"success":true,"data":{...}}` body. (If ownership check now throws unexpectedly, the re-export is wrong.)

- [ ] **Step 5: Commit**

```bash
git add api/lib/childOwnership.ts api/services/member.ts
git commit -m "refactor(api): extract assertChildOwnership for WMI reuse"
```

---

## Task 2: Migration `0018_wmi_practice.sql` + mirror into `db/schema.sql`

**Files:**
- Create: `db/migrations/0018_wmi_practice.sql`
- Modify: `db/schema.sql` (append the same table definitions at the end)

- [ ] **Step 1: Write the migration**

Create `db/migrations/0018_wmi_practice.sql`:

```sql
-- WMI Practice Area (v1).
--
-- Adds five tables for the bilingual WMI past-paper practice surface:
--   wmi_papers          : (year, grade, round) catalog
--   wmi_questions       : per-question content (EN + ID + answer key + figure)
--   wmi_glossary_terms  : math vocabulary referenced via [[slug]] markup
--   wmi_exam_sessions   : per-paper attempt (timed) for exam mode
--   wmi_attempts        : per-question submission (drill or exam)
--
-- No badge/quest/streak integration in v1 (intentional). Schema designed so
-- a v2 wmi_badge_rules table can attach without breaking changes.
-- See docs/superpowers/specs/2026-05-27-wmi-practice-area-design.md.

BEGIN;

CREATE TABLE IF NOT EXISTS wmi_papers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year                     SMALLINT NOT NULL CHECK (year BETWEEN 2019 AND 2099),
  grade                    SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 3),
  round                    TEXT NOT NULL CHECK (round IN ('semifinal','final')),
  title                    TEXT NOT NULL,
  source_url               TEXT,
  recommended_duration_min SMALLINT NOT NULL DEFAULT 60,
  question_count           SMALLINT NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_papers_year_grade_round_unique UNIQUE (year, grade, round)
);

CREATE TABLE IF NOT EXISTS wmi_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id    UUID NOT NULL REFERENCES wmi_papers(id) ON DELETE CASCADE,
  number      SMALLINT NOT NULL,
  body_en     TEXT NOT NULL,
  body_id     TEXT NOT NULL,
  answer_type TEXT NOT NULL CHECK (answer_type IN ('multiple_choice','fill_in')),
  choices_en  JSONB,
  choices_id  JSONB,
  answer      TEXT NOT NULL,
  figure_url  TEXT,
  hint_en     TEXT,
  hint_id     TEXT,
  difficulty  SMALLINT CHECK (difficulty IS NULL OR difficulty BETWEEN 1 AND 3),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_questions_paper_number_unique UNIQUE (paper_id, number)
);

CREATE TABLE IF NOT EXISTS wmi_glossary_terms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  term_en       TEXT NOT NULL,
  term_id       TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  definition_id TEXT NOT NULL,
  example_en    TEXT,
  example_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wmi_exam_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  paper_id        UUID NOT NULL REFERENCES wmi_papers(id),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  duration_ms     INTEGER,
  correct_count   SMALLINT,
  total_questions SMALLINT NOT NULL,
  abandoned       BOOLEAN NOT NULL DEFAULT FALSE
);

-- wmi_attempts: one row per *submitted* answer. No row = unanswered/skipped.
-- Editing-in-place a wmi_questions row is NOT in scope for v1. Existing
-- attempts retain their original is_correct.
CREATE TABLE IF NOT EXISTS wmi_attempts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id                UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  question_id             UUID NOT NULL REFERENCES wmi_questions(id) ON DELETE CASCADE,
  mode                    TEXT NOT NULL CHECK (mode IN ('drill','exam')),
  session_id              UUID REFERENCES wmi_exam_sessions(id) ON DELETE CASCADE,
  selected_answer         TEXT NOT NULL,
  is_correct              BOOLEAN NOT NULL,
  time_taken_ms           INTEGER,
  revealed_id_translation BOOLEAN NOT NULL DEFAULT FALSE,
  looked_up_terms         TEXT[] NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wmi_attempts_child_question
  ON wmi_attempts(child_id, question_id);
CREATE INDEX IF NOT EXISTS idx_wmi_attempts_session
  ON wmi_attempts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wmi_questions_paper_number
  ON wmi_questions(paper_id, number);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_wmi_attempts_exam_per_question
  ON wmi_attempts(session_id, question_id)
  WHERE mode = 'exam' AND session_id IS NOT NULL;

COMMIT;
```

- [ ] **Step 2: Mirror into `db/schema.sql`**

Append the same five `CREATE TABLE IF NOT EXISTS` blocks and four `CREATE INDEX IF NOT EXISTS` statements to the end of `db/schema.sql` (without the `BEGIN;`/`COMMIT;` wrapper — `schema.sql` is one big script). Keep them in the same order. This preserves the convention that a fresh install via `db/schema.sql` matches a migrated DB.

- [ ] **Step 3: Apply the migration to your local DB**

```bash
psql "$DATABASE_URL" -f db/migrations/0018_wmi_practice.sql
```

Expected: `BEGIN`, five `CREATE TABLE`, four `CREATE INDEX`, `COMMIT`. No errors.

- [ ] **Step 4: Verify**

```bash
psql "$DATABASE_URL" -c "\d wmi_attempts"
psql "$DATABASE_URL" -c "\d wmi_papers"
```

Expected: both tables listed with the columns + indexes from the migration. The partial unique index `uniq_wmi_attempts_exam_per_question` should appear under "Indexes" with predicate `(mode = 'exam'::text) AND (session_id IS NOT NULL)`.

- [ ] **Step 5: Commit**

```bash
git add db/migrations/0018_wmi_practice.sql db/schema.sql
git commit -m "feat(db): add WMI practice tables (migration 0018)"
```

---

## Task 3: Seed-loader infrastructure (`db/seed/wmi/load.ts` + `npm run seed:wmi` + README skeleton)

**Files:**
- Create: `db/seed/wmi/load.ts`
- Create: `db/seed/wmi/README.md`
- Create: `db/seed/wmi/figures/.gitkeep`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Add the npm script**

In `package.json`, add to `"scripts"`:

```json
"seed:wmi": "tsx db/seed/wmi/load.ts"
```

Place it alphabetically (after `preview`, before `server:dev`). `tsx` is already in devDependencies.

- [ ] **Step 2: Write `db/seed/wmi/README.md`**

```markdown
# WMI Seed Content

Hand-authored past-paper JSON + glossary that `npm run seed:wmi` upserts into
the WMI tables. No admin UI in v1 — adding a paper means dropping a JSON file
here and re-running the script.

## Files

- `glossary.json` — array of `{ slug, term_en, term_id, definition_en, definition_id, example_en?, example_id? }`.
- `papers/<year>-grade-<n>-<round>.json` — one file per paper.
- `figures/` — PNG/JPG figures referenced from `figure_url` in question JSON.

## Paper file shape

```json
{
  "year": 2024,
  "grade": 1,
  "round": "final",
  "title": "WMI 2024 Grade 1 Final",
  "source_url": "https://example.com/wmi-2024-grade-1-final.pdf",
  "recommended_duration_min": 60,
  "questions": [
    {
      "number": 1,
      "body_en": "Find the [[perimeter]] of the square.",
      "body_id": "Cari [[perimeter|keliling]] dari persegi.",
      "answer_type": "multiple_choice",
      "choices_en": [{"label":"A","text":"4"},{"label":"B","text":"8"},{"label":"C","text":"12"},{"label":"D","text":"16"}],
      "choices_id": [{"label":"A","text":"4"},{"label":"B","text":"8"},{"label":"C","text":"12"},{"label":"D","text":"16"}],
      "answer": "D",
      "figure_url": "/api/public/wmi/figures/2024-g1-q1.png",
      "hint_en": "Add up all four sides.",
      "hint_id": "Jumlahkan keempat sisi."
    }
  ]
}
```

## Markup

`[[slug]]` or `[[slug|display]]` inside any `body_*`, `choices_*`, or `hint_*`
string. Every slug must exist in `glossary.json` or the seed fails fast with
the offending file + slug.

## Adding a paper

1. Drop the JSON in `papers/`.
2. Drop any new figures in `figures/`.
3. Add any new `[[slug]]`s to `glossary.json`.
4. Run `npm run seed:wmi`.

The script upserts on `(year, grade, round)` for papers and `(paper_id, number)`
for questions, so re-runs are safe and idempotent.

## Prod seeding

Manual, same convention as `db/schema.sql` and migrations:

```bash
DATABASE_URL=…production… npm run seed:wmi
```

Not wired into Vercel build. CI-driven seed is out of v1 scope.

## Analytics snippets (v1 consumer for the `looked_up_terms` / `revealed_id_translation` columns)

Most-tapped glossary terms across all attempts:

```sql
SELECT slug, COUNT(*) AS taps
FROM wmi_attempts CROSS JOIN LATERAL unnest(looked_up_terms) AS slug
GROUP BY slug ORDER BY taps DESC LIMIT 20;
```

Translation-reveal rate per question:

```sql
SELECT q.paper_id, q.number,
  SUM(CASE WHEN a.revealed_id_translation THEN 1 ELSE 0 END)::numeric / COUNT(*) AS reveal_rate
FROM wmi_attempts a JOIN wmi_questions q ON q.id = a.question_id
GROUP BY q.paper_id, q.number ORDER BY reveal_rate DESC;
```
```

- [ ] **Step 3: Write `db/seed/wmi/load.ts`**

```ts
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SEED_DIR = __dirname
const GLOSSARY_PATH = path.join(SEED_DIR, 'glossary.json')
const PAPERS_DIR = path.join(SEED_DIR, 'papers')

interface GlossaryTerm {
  slug: string
  term_en: string
  term_id: string
  definition_en: string
  definition_id: string
  example_en?: string
  example_id?: string
}

interface PaperQuestion {
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

interface PaperFile {
  year: number
  grade: number
  round: 'semifinal' | 'final'
  title: string
  source_url?: string
  recommended_duration_min: number
  questions: PaperQuestion[]
}

const MARKUP_RE = /\[\[([a-z0-9-]+)(?:\|[^\]]*)?\]\]/g

function collectSlugs(text: string, out: Set<string>): void {
  for (const m of text.matchAll(MARKUP_RE)) out.add(m[1])
}

function collectQuestionSlugs(q: PaperQuestion, out: Set<string>): void {
  collectSlugs(q.body_en, out)
  collectSlugs(q.body_id, out)
  for (const c of q.choices_en ?? []) collectSlugs(c.text, out)
  for (const c of q.choices_id ?? []) collectSlugs(c.text, out)
  if (q.hint_en) collectSlugs(q.hint_en, out)
  if (q.hint_id) collectSlugs(q.hint_id, out)
}

async function loadJson<T>(p: string): Promise<T> {
  const raw = await fs.readFile(p, 'utf8')
  return JSON.parse(raw) as T
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }

  const glossary = await loadJson<GlossaryTerm[]>(GLOSSARY_PATH)
  const glossarySlugs = new Set(glossary.map((g) => g.slug))

  const paperFiles = (await fs.readdir(PAPERS_DIR))
    .filter((f) => f.endsWith('.json'))
    .sort()

  // Validate every [[slug]] referenced exists in glossary BEFORE any DB write.
  for (const f of paperFiles) {
    const paper = await loadJson<PaperFile>(path.join(PAPERS_DIR, f))
    for (const q of paper.questions) {
      const referenced = new Set<string>()
      collectQuestionSlugs(q, referenced)
      for (const s of referenced) {
        if (!glossarySlugs.has(s)) {
          throw new Error(
            `Unknown glossary slug "${s}" referenced in ${f} question #${q.number}. Add it to glossary.json first.`,
          )
        }
      }
    }
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Upsert glossary.
    for (const g of glossary) {
      await client.query(
        `
          INSERT INTO wmi_glossary_terms
            (slug, term_en, term_id, definition_en, definition_id, example_en, example_id, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (slug) DO UPDATE SET
            term_en       = EXCLUDED.term_en,
            term_id       = EXCLUDED.term_id,
            definition_en = EXCLUDED.definition_en,
            definition_id = EXCLUDED.definition_id,
            example_en    = EXCLUDED.example_en,
            example_id    = EXCLUDED.example_id,
            updated_at    = NOW();
        `,
        [g.slug, g.term_en, g.term_id, g.definition_en, g.definition_id, g.example_en ?? null, g.example_id ?? null],
      )
    }

    // Upsert papers + questions.
    for (const f of paperFiles) {
      const paper = await loadJson<PaperFile>(path.join(PAPERS_DIR, f))

      const paperRow = await client.query<{ id: string }>(
        `
          INSERT INTO wmi_papers
            (year, grade, round, title, source_url, recommended_duration_min, question_count, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (year, grade, round) DO UPDATE SET
            title                    = EXCLUDED.title,
            source_url               = EXCLUDED.source_url,
            recommended_duration_min = EXCLUDED.recommended_duration_min,
            question_count           = EXCLUDED.question_count,
            updated_at               = NOW()
          RETURNING id;
        `,
        [
          paper.year,
          paper.grade,
          paper.round,
          paper.title,
          paper.source_url ?? null,
          paper.recommended_duration_min,
          paper.questions.length,
        ],
      )
      const paperId = paperRow.rows[0].id

      for (const q of paper.questions) {
        await client.query(
          `
            INSERT INTO wmi_questions
              (paper_id, number, body_en, body_id, answer_type,
               choices_en, choices_id, answer, figure_url,
               hint_en, hint_id, difficulty, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (paper_id, number) DO UPDATE SET
              body_en     = EXCLUDED.body_en,
              body_id     = EXCLUDED.body_id,
              answer_type = EXCLUDED.answer_type,
              choices_en  = EXCLUDED.choices_en,
              choices_id  = EXCLUDED.choices_id,
              answer      = EXCLUDED.answer,
              figure_url  = EXCLUDED.figure_url,
              hint_en     = EXCLUDED.hint_en,
              hint_id     = EXCLUDED.hint_id,
              difficulty  = EXCLUDED.difficulty,
              updated_at  = NOW();
          `,
          [
            paperId,
            q.number,
            q.body_en,
            q.body_id,
            q.answer_type,
            q.choices_en ? JSON.stringify(q.choices_en) : null,
            q.choices_id ? JSON.stringify(q.choices_id) : null,
            q.answer,
            q.figure_url ?? null,
            q.hint_en ?? null,
            q.hint_id ?? null,
            q.difficulty ?? null,
          ],
        )
      }

      console.log(`Seeded ${paper.title} (${paper.questions.length} questions)`)
    }

    await client.query('COMMIT')
    console.log(`Done. ${glossary.length} glossary terms, ${paperFiles.length} papers.`)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => {
  console.error('seed:wmi failed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
```

- [ ] **Step 4: Create the figures directory placeholder**

```bash
mkdir -p db/seed/wmi/figures && touch db/seed/wmi/figures/.gitkeep
```

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add db/seed/wmi/README.md db/seed/wmi/load.ts db/seed/wmi/figures/.gitkeep package.json
git commit -m "feat(seed): add seed:wmi loader script and authoring README"
```

---

## Task 4: Seed one glossary + one sample paper

This task provides the minimum content needed to develop and smoke-test the rest. Add more papers later.

**Files:**
- Create: `db/seed/wmi/glossary.json`
- Create: `db/seed/wmi/papers/2024-grade-1-final.json`
- Create: `db/seed/wmi/figures/2024-g1-q1.png` (any small placeholder PNG)

- [ ] **Step 1: Write `db/seed/wmi/glossary.json`**

```json
[
  {
    "slug": "perimeter",
    "term_en": "perimeter",
    "term_id": "keliling",
    "definition_en": "The total length around the outside of a shape.",
    "definition_id": "Total panjang di sekeliling bentuk.",
    "example_en": "A square with side 3 has perimeter 12.",
    "example_id": "Persegi dengan sisi 3 memiliki keliling 12."
  },
  {
    "slug": "digit",
    "term_en": "digit",
    "term_id": "angka",
    "definition_en": "One of the symbols 0–9 used to write numbers.",
    "definition_id": "Salah satu simbol 0–9 yang dipakai untuk menulis bilangan.",
    "example_en": "The number 42 has two digits.",
    "example_id": "Bilangan 42 memiliki dua angka."
  },
  {
    "slug": "sum",
    "term_en": "sum",
    "term_id": "jumlah",
    "definition_en": "The result of adding numbers together.",
    "definition_id": "Hasil dari menjumlahkan beberapa bilangan.",
    "example_en": "The sum of 2 and 3 is 5.",
    "example_id": "Jumlah dari 2 dan 3 adalah 5."
  }
]
```

- [ ] **Step 2: Write `db/seed/wmi/papers/2024-grade-1-final.json`**

```json
{
  "year": 2024,
  "grade": 1,
  "round": "final",
  "title": "WMI 2024 Grade 1 Final (sample)",
  "recommended_duration_min": 60,
  "questions": [
    {
      "number": 1,
      "body_en": "Find the [[perimeter]] of a square with side 4.",
      "body_id": "Cari [[perimeter|keliling]] dari persegi dengan sisi 4.",
      "answer_type": "multiple_choice",
      "choices_en": [
        {"label":"A","text":"4"},
        {"label":"B","text":"8"},
        {"label":"C","text":"12"},
        {"label":"D","text":"16"}
      ],
      "choices_id": [
        {"label":"A","text":"4"},
        {"label":"B","text":"8"},
        {"label":"C","text":"12"},
        {"label":"D","text":"16"}
      ],
      "answer": "D",
      "figure_url": "/api/public/wmi/figures/2024-g1-q1.png",
      "hint_en": "Add up all four sides.",
      "hint_id": "Jumlahkan keempat sisi."
    },
    {
      "number": 2,
      "body_en": "What is the [[sum]] of the [[digit|digits]] of the number 47?",
      "body_id": "Berapa [[sum|jumlah]] dari [[digit|angka-angka]] pada bilangan 47?",
      "answer_type": "fill_in",
      "answer": "11",
      "hint_en": "Add the two digits.",
      "hint_id": "Jumlahkan kedua angka."
    }
  ]
}
```

- [ ] **Step 3: Drop a placeholder figure**

Any tiny PNG works; the renderer just needs the path to resolve. On Windows PowerShell:

```powershell
New-Item -ItemType File db/seed/wmi/figures/2024-g1-q1.png
```

(Replace later with a real cropped figure.)

- [ ] **Step 4: Run the seed loader**

```bash
npm run seed:wmi
```

Expected stdout: `Seeded WMI 2024 Grade 1 Final (sample) (2 questions)` and `Done. 3 glossary terms, 1 papers.`

- [ ] **Step 5: Verify in the DB**

```bash
psql "$DATABASE_URL" -c "SELECT slug, term_id FROM wmi_glossary_terms ORDER BY slug;"
psql "$DATABASE_URL" -c "SELECT year, grade, round, question_count FROM wmi_papers;"
psql "$DATABASE_URL" -c "SELECT number, answer_type, answer FROM wmi_questions ORDER BY number;"
```

Expected: three glossary rows; one paper row with `question_count = 2`; two question rows.

- [ ] **Step 6: Re-run to confirm idempotency**

```bash
npm run seed:wmi
```

Expected: same stdout, no errors, row counts unchanged in the DB.

- [ ] **Step 7: Commit**

```bash
git add db/seed/wmi/glossary.json db/seed/wmi/papers/2024-grade-1-final.json db/seed/wmi/figures/2024-g1-q1.png
git commit -m "feat(seed): add sample WMI 2024 Grade 1 Final + glossary"
```

---

## Task 5: API service `wmi/glossary.ts`

**Files:**
- Create: `api/services/wmi/glossary.ts`

- [ ] **Step 1: Write the service**

```ts
import { query } from '../../db.js'

export interface WmiGlossaryTerm {
  slug: string
  term_en: string
  term_id: string
  definition_en: string
  definition_id: string
  example_en: string | null
  example_id: string | null
}

export async function listGlossary(): Promise<WmiGlossaryTerm[]> {
  return query<WmiGlossaryTerm>(
    `
      SELECT slug, term_en, term_id, definition_en, definition_id, example_en, example_id
      FROM wmi_glossary_terms
      ORDER BY slug ASC
    `,
    [],
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add api/services/wmi/glossary.ts
git commit -m "feat(api): add WMI glossary service"
```

---

## Task 6: API service `wmi/papers.ts`

**Files:**
- Create: `api/services/wmi/papers.ts`

- [ ] **Step 1: Write the service**

```ts
import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'

export interface WmiPaperSummary {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  title: string
  question_count: number
  recommended_duration_min: number
  attempts: number
  best_score: number | null
}

export interface WmiQuestionDto {
  id: string
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: Array<{ label: string; text: string }> | null
  choices_id: Array<{ label: string; text: string }> | null
  figure_url: string | null
  hint_en: string | null
  hint_id: string | null
  // answer is intentionally omitted from any client-facing response
}

export interface WmiPaperDetail {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  title: string
  recommended_duration_min: number
  questions: WmiQuestionDto[]
}

export async function listPapersForChild(
  parentUserId: string,
  childId: string,
  grade: number,
): Promise<WmiPaperSummary[]> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    return query<WmiPaperSummary>(
      `
        WITH session_agg AS (
          SELECT paper_id,
                 COUNT(*) FILTER (WHERE completed_at IS NOT NULL)            AS attempts,
                 MAX(correct_count::numeric * 100 / NULLIF(total_questions, 0)) AS best_score
          FROM wmi_exam_sessions
          WHERE child_id = $1
          GROUP BY paper_id
        )
        SELECT
          p.id,
          p.year,
          p.grade,
          p.round,
          p.title,
          p.question_count,
          p.recommended_duration_min,
          COALESCE(sa.attempts, 0)::int AS attempts,
          sa.best_score
        FROM wmi_papers p
        LEFT JOIN session_agg sa ON sa.paper_id = p.id
        WHERE p.grade = $2
        ORDER BY p.year DESC, p.round DESC
      `,
      [childId, grade],
      client,
    )
  })
}

export async function getPaperWithQuestions(
  parentUserId: string,
  childId: string,
  paperId: string,
): Promise<WmiPaperDetail | null> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const paper = await queryOne<{
      id: string
      year: number
      grade: number
      round: 'semifinal' | 'final'
      title: string
      recommended_duration_min: number
    }>(
      `
        SELECT id, year, grade, round, title, recommended_duration_min
        FROM wmi_papers WHERE id = $1
      `,
      [paperId],
      client,
    )
    if (!paper) return null

    const questions = await query<WmiQuestionDto>(
      `
        SELECT id, number, body_en, body_id, answer_type,
               choices_en, choices_id, figure_url, hint_en, hint_id
        FROM wmi_questions WHERE paper_id = $1 ORDER BY number ASC
      `,
      [paperId],
      client,
    )

    return { ...paper, questions }
  })
}

export async function getRandomDrillQuestion(
  parentUserId: string,
  childId: string,
  grade: number,
): Promise<WmiQuestionDto | null> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    // Exclude questions seen in the child's last 20 drill attempts.
    return queryOne<WmiQuestionDto>(
      `
        WITH recent AS (
          SELECT question_id
          FROM wmi_attempts
          WHERE child_id = $1 AND mode = 'drill'
          ORDER BY created_at DESC
          LIMIT 20
        )
        SELECT q.id, q.number, q.body_en, q.body_id, q.answer_type,
               q.choices_en, q.choices_id, q.figure_url, q.hint_en, q.hint_id
        FROM wmi_questions q
        JOIN wmi_papers p ON p.id = q.paper_id
        WHERE p.grade = $2
          AND q.id NOT IN (SELECT question_id FROM recent)
        ORDER BY random()
        LIMIT 1
      `,
      [childId, grade],
      client,
    ).then(async (row) => {
      if (row) return row
      // Fallback: fully random when the exclude set exhausts the pool.
      return queryOne<WmiQuestionDto>(
        `
          SELECT q.id, q.number, q.body_en, q.body_id, q.answer_type,
                 q.choices_en, q.choices_id, q.figure_url, q.hint_en, q.hint_id
          FROM wmi_questions q
          JOIN wmi_papers p ON p.id = q.paper_id
          WHERE p.grade = $1
          ORDER BY random()
          LIMIT 1
        `,
        [grade],
        client,
      )
    })
  })
}

export async function getQuestionAnswer(
  client: PoolClient,
  questionId: string,
): Promise<{ answer: string; hint_en: string | null; hint_id: string | null } | null> {
  return queryOne<{ answer: string; hint_en: string | null; hint_id: string | null }>(
    `SELECT answer, hint_en, hint_id FROM wmi_questions WHERE id = $1`,
    [questionId],
    client,
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add api/services/wmi/papers.ts
git commit -m "feat(api): add WMI papers service (list, detail, drill)"
```

---

## Task 7: API service `wmi/sessions.ts`

**Files:**
- Create: `api/services/wmi/sessions.ts`

- [ ] **Step 1: Write the service**

```ts
import { query, queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { getPaperWithQuestions, type WmiPaperDetail } from './papers.js'

export interface WmiExamSession {
  id: string
  child_id: string
  paper_id: string
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  correct_count: number | null
  total_questions: number
  abandoned: boolean
}

export interface ExamSessionSnapshot {
  session: WmiExamSession
  paper: WmiPaperDetail
  submittedAttempts: Array<{
    question_id: string
    selected_answer: string
    is_correct: boolean
    revealed_id_translation: boolean
    looked_up_terms: string[]
  }>
}

export async function startExamSession(
  parentUserId: string,
  childId: string,
  paperId: string,
): Promise<ExamSessionSnapshot> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const paper = await queryOne<{ id: string; question_count: number }>(
      `SELECT id, question_count FROM wmi_papers WHERE id = $1`,
      [paperId],
      client,
    )
    if (!paper) throw new Error('Paper not found')

    const session = await queryOne<WmiExamSession>(
      `
        INSERT INTO wmi_exam_sessions (child_id, paper_id, total_questions)
        VALUES ($1, $2, $3)
        RETURNING id, child_id, paper_id, started_at, completed_at, duration_ms, correct_count, total_questions, abandoned
      `,
      [childId, paperId, paper.question_count],
      client,
    )
    if (!session) throw new Error('Failed to start session')

    const full = await getPaperWithQuestions(parentUserId, childId, paperId)
    if (!full) throw new Error('Paper not found')

    return { session, paper: full, submittedAttempts: [] }
  })
}

export async function getExamSessionSnapshot(
  parentUserId: string,
  childId: string,
  sessionId: string,
): Promise<ExamSessionSnapshot | null> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const session = await queryOne<WmiExamSession>(
      `
        SELECT id, child_id, paper_id, started_at, completed_at, duration_ms,
               correct_count, total_questions, abandoned
        FROM wmi_exam_sessions
        WHERE id = $1
      `,
      [sessionId],
      client,
    )
    if (!session) return null
    if (session.child_id !== childId) throw new Error('Session not owned')

    const paper = await getPaperWithQuestions(parentUserId, childId, session.paper_id)
    if (!paper) return null

    const submittedAttempts = await query<{
      question_id: string
      selected_answer: string
      is_correct: boolean
      revealed_id_translation: boolean
      looked_up_terms: string[]
    }>(
      `
        SELECT question_id, selected_answer, is_correct,
               revealed_id_translation, looked_up_terms
        FROM wmi_attempts
        WHERE session_id = $1
      `,
      [sessionId],
      client,
    )

    return { session, paper, submittedAttempts }
  })
}

export async function completeExamSession(
  parentUserId: string,
  childId: string,
  sessionId: string,
): Promise<WmiExamSession> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const existing = await queryOne<WmiExamSession>(
      `
        SELECT id, child_id, paper_id, started_at, completed_at, duration_ms,
               correct_count, total_questions, abandoned
        FROM wmi_exam_sessions
        WHERE id = $1
      `,
      [sessionId],
      client,
    )
    if (!existing) throw new Error('Session not found')
    if (existing.child_id !== childId) throw new Error('Session not owned')
    if (existing.completed_at) return existing // idempotent

    const tally = await queryOne<{ correct: string }>(
      `
        SELECT COUNT(*) AS correct
        FROM wmi_attempts
        WHERE session_id = $1 AND is_correct = true
      `,
      [sessionId],
      client,
    )
    const correctCount = parseInt(tally?.correct ?? '0', 10)

    const updated = await queryOne<WmiExamSession>(
      `
        UPDATE wmi_exam_sessions
        SET completed_at  = NOW(),
            duration_ms   = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
            correct_count = $2
        WHERE id = $1
        RETURNING id, child_id, paper_id, started_at, completed_at, duration_ms,
                  correct_count, total_questions, abandoned
      `,
      [sessionId, correctCount],
      client,
    )
    if (!updated) throw new Error('Update failed')
    return updated
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add api/services/wmi/sessions.ts
git commit -m "feat(api): add WMI exam sessions service"
```

---

## Task 8: API service `wmi/attempts.ts`

**Files:**
- Create: `api/services/wmi/attempts.ts`

- [ ] **Step 1: Write the service**

```ts
import { queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { getQuestionAnswer } from './papers.js'

export interface SubmitAttemptInput {
  parentUserId: string
  childId: string
  questionId: string
  mode: 'drill' | 'exam'
  sessionId?: string | null
  selectedAnswer: string
  timeTakenMs?: number | null
  revealedIdTranslation?: boolean
  lookedUpTerms?: string[]
}

export interface SubmitAttemptResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
}

export async function submitAttempt(input: SubmitAttemptInput): Promise<SubmitAttemptResult> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, input.parentUserId, input.childId)

    const q = await getQuestionAnswer(client, input.questionId)
    if (!q) throw new Error('Question not found')

    const isCorrect = compareAnswers(input.selectedAnswer, q.answer)

    if (input.mode === 'exam') {
      if (!input.sessionId) throw new Error('exam mode requires sessionId')

      // Ownership check on the session: it must belong to this child.
      const session = await queryOne<{ child_id: string; completed_at: string | null }>(
        `SELECT child_id, completed_at FROM wmi_exam_sessions WHERE id = $1`,
        [input.sessionId],
        client,
      )
      if (!session) throw new Error('Session not found')
      if (session.child_id !== input.childId) throw new Error('Session not owned')
      if (session.completed_at) throw new Error('Session already completed')

      // Upsert against the partial unique index on (session_id, question_id) WHERE mode='exam'.
      // The ON CONFLICT predicate must match the partial index predicate exactly.
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, question_id, mode, session_id, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, 'exam', $3, $4, $5, $6, $7, $8)
          ON CONFLICT (session_id, question_id)
            WHERE mode = 'exam' AND session_id IS NOT NULL
          DO UPDATE SET
            selected_answer         = EXCLUDED.selected_answer,
            is_correct              = EXCLUDED.is_correct,
            time_taken_ms           = EXCLUDED.time_taken_ms,
            revealed_id_translation = EXCLUDED.revealed_id_translation,
            looked_up_terms         = EXCLUDED.looked_up_terms,
            created_at              = NOW();
        `,
        [
          input.childId,
          input.questionId,
          input.sessionId,
          input.selectedAnswer,
          isCorrect,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          input.lookedUpTerms ?? [],
        ],
      )
    } else {
      // Drill: plain INSERT, no upsert (partial index doesn't cover drill rows).
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, question_id, mode, session_id, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, 'drill', NULL, $3, $4, $5, $6, $7)
        `,
        [
          input.childId,
          input.questionId,
          input.selectedAnswer,
          isCorrect,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          input.lookedUpTerms ?? [],
        ],
      )
    }

    return {
      is_correct: isCorrect,
      correct_answer: q.answer,
      hint_en: q.hint_en,
      hint_id: q.hint_id,
    }
  })
}

/**
 * Multiple-choice answers compare case-insensitively as letters; fill-in
 * answers compare with trimmed whitespace (and case-insensitive — most
 * WMI Grade 0–3 fill-ins are numeric or single words).
 */
function compareAnswers(submitted: string, expected: string): boolean {
  return submitted.trim().toLowerCase() === expected.trim().toLowerCase()
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add api/services/wmi/attempts.ts
git commit -m "feat(api): add WMI attempt submission service"
```

---

## Task 9: API route `wmi-public.ts` + mount in app

**Files:**
- Create: `api/routes/wmi-public.ts`
- Modify: `api/app.ts` (add one mount line + import)

- [ ] **Step 1: Write the public router**

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router, type Request, type Response } from 'express'
import express from 'express'
import { listGlossary } from '../services/wmi/glossary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Figures live in db/seed/wmi/figures/ — kept under db/ on purpose so the
// content authoring workflow is one folder (paper JSON + glossary + figures).
const FIGURES_DIR = path.join(__dirname, '..', '..', 'db', 'seed', 'wmi', 'figures')

const router = Router()

router.get('/glossary', async (_req: Request, res: Response): Promise<void> => {
  try {
    const terms = await listGlossary()
    res.json({ success: true, data: { terms } })
  } catch (error) {
    console.error('WMI glossary error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Strict allowlist on file extensions before falling through to express.static.
// Keeps the route from leaking unrelated files even if the figures dir grows.
const figureExtRe = /\.(png|jpe?g|webp|svg)$/i
router.get('/figures/:filename', (req, res, next) => {
  if (!figureExtRe.test(req.params.filename)) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }
  next()
}, express.static(FIGURES_DIR, { fallthrough: false }))

export default router
```

- [ ] **Step 2: Mount it in `api/app.ts`**

Add the import near the other route imports:

```ts
import wmiPublicRoutes from './routes/wmi-public.js'
```

Add the mount line right after the existing `/api/public` mount (~line 53):

```ts
app.use('/api/public/wmi', wmiPublicRoutes)
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Smoke test**

Start the dev server (`npm run dev`), then:

```bash
curl -s http://localhost:3001/api/public/wmi/glossary | head -c 400
curl -s -o /tmp/test.png -w "%{http_code}\n" http://localhost:3001/api/public/wmi/figures/2024-g1-q1.png
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/public/wmi/figures/secret.txt
```

Expected:
- Glossary returns JSON with the seeded `perimeter`/`digit`/`sum` terms.
- Figure request returns `200`.
- The `.txt` request returns `404` (allowlist works).

- [ ] **Step 5: Commit**

```bash
git add api/routes/wmi-public.ts api/app.ts
git commit -m "feat(api): add /api/public/wmi router for glossary + figures"
```

---

## Task 10: API route `wmi-member.ts` + mount in app

**Files:**
- Create: `api/routes/wmi-member.ts`
- Modify: `api/app.ts` (add one mount line + import)

- [ ] **Step 1: Write the member router**

```ts
import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import {
  listPapersForChild,
  getPaperWithQuestions,
  getRandomDrillQuestion,
} from '../services/wmi/papers.js'
import { submitAttempt } from '../services/wmi/attempts.js'
import {
  startExamSession,
  getExamSessionSnapshot,
  completeExamSession,
} from '../services/wmi/sessions.js'

const router = Router()

const childIdQuery = Joi.object({
  childId: Joi.string().uuid().required(),
  grade: Joi.number().integer().min(0).max(3).optional(),
}).unknown(true)

const childIdOnly = Joi.object({
  childId: Joi.string().uuid().required(),
}).unknown(true)

const attemptBody = Joi.object({
  childId: Joi.string().uuid().required(),
  question_id: Joi.string().uuid().required(),
  mode: Joi.string().valid('drill', 'exam').required(),
  session_id: Joi.string().uuid().optional(),
  selected_answer: Joi.string().min(1).max(200).required(),
  time_taken_ms: Joi.number().integer().min(0).optional(),
  revealed_id_translation: Joi.boolean().optional(),
  looked_up_terms: Joi.array().items(Joi.string().max(80)).optional(),
})

const startExamBody = Joi.object({
  childId: Joi.string().uuid().required(),
  paper_id: Joi.string().uuid().required(),
})

function sendError(res: Response, err: unknown, fallback: string): void {
  const msg = err instanceof Error ? err.message : fallback
  const status =
    msg === 'Child not found' || msg === 'Session not owned' ? 403 :
    msg === 'Paper not found' || msg === 'Question not found' || msg === 'Session not found' ? 404 :
    400
  res.status(status).json({ success: false, error: msg })
}

router.get('/papers', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuery.validate(req.query)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    if (value.grade === undefined) { res.status(400).json({ success: false, error: 'grade is required' }); return }
    const papers = await listPapersForChild(req.user.id, value.childId, value.grade)
    res.json({ success: true, data: { papers } })
  } catch (e) { sendError(res, e, 'Unable to load papers') }
})

router.get('/papers/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdOnly.validate(req.query)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const paper = await getPaperWithQuestions(req.user.id, value.childId, req.params.id)
    if (!paper) { res.status(404).json({ success: false, error: 'Paper not found' }); return }
    res.json({ success: true, data: paper })
  } catch (e) { sendError(res, e, 'Unable to load paper') }
})

router.get('/drill/next', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuery.validate(req.query)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    if (value.grade === undefined) { res.status(400).json({ success: false, error: 'grade is required' }); return }
    const question = await getRandomDrillQuestion(req.user.id, value.childId, value.grade)
    if (!question) { res.json({ success: true, data: { question: null } }); return }
    res.json({ success: true, data: { question } })
  } catch (e) { sendError(res, e, 'Unable to fetch drill question') }
})

router.post('/attempts', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = attemptBody.validate(req.body)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const result = await submitAttempt({
      parentUserId: req.user.id,
      childId: value.childId,
      questionId: value.question_id,
      mode: value.mode,
      sessionId: value.session_id ?? null,
      selectedAnswer: value.selected_answer,
      timeTakenMs: value.time_taken_ms ?? null,
      revealedIdTranslation: value.revealed_id_translation,
      lookedUpTerms: value.looked_up_terms,
    })
    res.status(201).json({ success: true, data: result })
  } catch (e) { sendError(res, e, 'Unable to submit attempt') }
})

router.post('/exam/sessions', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = startExamBody.validate(req.body)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const snapshot = await startExamSession(req.user.id, value.childId, value.paper_id)
    res.status(201).json({ success: true, data: snapshot })
  } catch (e) { sendError(res, e, 'Unable to start exam session') }
})

router.get('/exam/sessions/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdOnly.validate(req.query)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const snapshot = await getExamSessionSnapshot(req.user.id, value.childId, req.params.id)
    if (!snapshot) { res.status(404).json({ success: false, error: 'Session not found' }); return }
    res.json({ success: true, data: snapshot })
  } catch (e) { sendError(res, e, 'Unable to load session') }
})

router.patch('/exam/sessions/:id/complete', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdOnly.validate(req.body)
    if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
    const session = await completeExamSession(req.user.id, value.childId, req.params.id)
    res.json({ success: true, data: { session } })
  } catch (e) { sendError(res, e, 'Unable to complete session') }
})

export default router
```

- [ ] **Step 2: Mount it in `api/app.ts`**

Add the import:

```ts
import wmiMemberRoutes from './routes/wmi-member.js'
```

Mount it just before the existing `/api/me` mount (so `/api/me/wmi/*` is matched before the bare `/api/me/*` catch):

```ts
app.use('/api/me/wmi', wmiMemberRoutes)
app.use('/api/me', memberRoutes)  // existing line — keep as-is
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Smoke test**

With dev server running and a known parent JWT + child UUID:

```bash
TOKEN="<bearer-token>"
CHILD="<child-uuid>"

# List papers for grade 1
curl -s "http://localhost:3001/api/me/wmi/papers?childId=$CHILD&grade=1" \
  -H "Authorization: Bearer $TOKEN" | head -c 400

# Drill a question for grade 1
curl -s "http://localhost:3001/api/me/wmi/drill/next?childId=$CHILD&grade=1" \
  -H "Authorization: Bearer $TOKEN" | head -c 400

# Submit a drill attempt (use a real question_id from the previous response)
curl -s -X POST http://localhost:3001/api/me/wmi/attempts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"childId\":\"$CHILD\",\"question_id\":\"<qid>\",\"mode\":\"drill\",\"selected_answer\":\"D\"}"
```

Expected: each call returns `{"success":true,"data":...}`. The attempt submission returns `is_correct`, `correct_answer`, and the hints.

Also verify the DB:

```bash
psql "$DATABASE_URL" -c "SELECT id, mode, selected_answer, is_correct FROM wmi_attempts ORDER BY created_at DESC LIMIT 5;"
```

Expected: your drill row is there.

- [ ] **Step 5: Commit**

```bash
git add api/routes/wmi-member.ts api/app.ts
git commit -m "feat(api): add /api/me/wmi router (papers, drill, attempts, sessions)"
```

---

## Task 11: Frontend types `src/types/wmi.ts`

**Files:**
- Create: `src/types/wmi.ts`

- [ ] **Step 1: Write the types**

```ts
export interface WmiGlossaryTerm {
  slug: string
  term_en: string
  term_id: string
  definition_en: string
  definition_id: string
  example_en: string | null
  example_id: string | null
}

export interface WmiQuestionChoice {
  label: string
  text: string
}

export interface WmiQuestion {
  id: string
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiQuestionChoice[] | null
  choices_id: WmiQuestionChoice[] | null
  figure_url: string | null
  hint_en: string | null
  hint_id: string | null
}

export interface WmiPaperSummary {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  title: string
  question_count: number
  recommended_duration_min: number
  attempts: number
  best_score: number | null
}

export interface WmiPaperDetail {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  title: string
  recommended_duration_min: number
  questions: WmiQuestion[]
}

export interface WmiExamSession {
  id: string
  child_id: string
  paper_id: string
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  correct_count: number | null
  total_questions: number
  abandoned: boolean
}

export interface WmiSubmittedAttempt {
  question_id: string
  selected_answer: string
  is_correct: boolean
  revealed_id_translation: boolean
  looked_up_terms: string[]
}

export interface WmiExamSnapshot {
  session: WmiExamSession
  paper: WmiPaperDetail
  submittedAttempts: WmiSubmittedAttempt[]
}

export interface WmiAttemptInput {
  childId: string
  question_id: string
  mode: 'drill' | 'exam'
  session_id?: string
  selected_answer: string
  time_taken_ms?: number
  revealed_id_translation?: boolean
  looked_up_terms?: string[]
}

export interface WmiAttemptResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
}

export type WmiGrade = 0 | 1 | 2 | 3
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/types/wmi.ts
git commit -m "feat(types): add WMI client types"
```

---

## Task 12: Markup util `src/lib/wmiMarkup.ts`

**Files:**
- Create: `src/lib/wmiMarkup.ts`

- [ ] **Step 1: Write the parser**

```ts
export type WmiMarkupToken =
  | { type: 'text'; value: string }
  | { type: 'gloss'; slug: string; display: string }

const MARKUP_RE = /\[\[([a-z0-9-]+)(?:\|([^\]]*))?\]\]/g

/**
 * Parse a question body / choice / hint string into a flat array of tokens.
 * Pure function, no React, no DOM. Unknown slugs still produce a `gloss`
 * token — the renderer falls back to plain text if the store has no entry.
 *
 *   "Find the [[perimeter]] of [[a-square|the square]]."
 *
 * yields:
 *
 *   [
 *     { type: 'text',  value: 'Find the ' },
 *     { type: 'gloss', slug: 'perimeter',  display: 'perimeter' },
 *     { type: 'text',  value: ' of ' },
 *     { type: 'gloss', slug: 'a-square',   display: 'the square' },
 *     { type: 'text',  value: '.' },
 *   ]
 */
export function parseWmiMarkup(input: string): WmiMarkupToken[] {
  const tokens: WmiMarkupToken[] = []
  let lastIndex = 0
  for (const m of input.matchAll(MARKUP_RE)) {
    const start = m.index ?? 0
    if (start > lastIndex) {
      tokens.push({ type: 'text', value: input.slice(lastIndex, start) })
    }
    tokens.push({ type: 'gloss', slug: m[1], display: m[2] ?? m[1] })
    lastIndex = start + m[0].length
  }
  if (lastIndex < input.length) {
    tokens.push({ type: 'text', value: input.slice(lastIndex) })
  }
  return tokens
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/wmiMarkup.ts
git commit -m "feat(lib): add wmiMarkup parser for [[slug]] tokens"
```

---

## Task 13: API wrapper `src/lib/wmiApi.ts`

**Files:**
- Create: `src/lib/wmiApi.ts`

- [ ] **Step 1: Write the wrapper**

```ts
import api from './api'
import type {
  WmiGlossaryTerm,
  WmiPaperSummary,
  WmiPaperDetail,
  WmiQuestion,
  WmiAttemptInput,
  WmiAttemptResult,
  WmiExamSnapshot,
  WmiExamSession,
  WmiGrade,
} from '../types/wmi'

interface Envelope<T> {
  success: boolean
  data: T
  error?: string
}

function unwrap<T>(payload: Envelope<T>): T {
  if (!payload.success) throw new Error(payload.error ?? 'Request failed')
  return payload.data
}

export async function fetchGlossary(): Promise<WmiGlossaryTerm[]> {
  const res = await api.get<Envelope<{ terms: WmiGlossaryTerm[] }>>('/public/wmi/glossary')
  return unwrap(res.data).terms
}

export async function fetchPapers(childId: string, grade: WmiGrade): Promise<WmiPaperSummary[]> {
  const res = await api.get<Envelope<{ papers: WmiPaperSummary[] }>>(
    '/me/wmi/papers',
    { params: { childId, grade } },
  )
  return unwrap(res.data).papers
}

export async function fetchPaperDetail(childId: string, paperId: string): Promise<WmiPaperDetail> {
  const res = await api.get<Envelope<WmiPaperDetail>>(
    `/me/wmi/papers/${paperId}`,
    { params: { childId } },
  )
  return unwrap(res.data)
}

export async function fetchNextDrillQuestion(childId: string, grade: WmiGrade): Promise<WmiQuestion | null> {
  const res = await api.get<Envelope<{ question: WmiQuestion | null }>>(
    '/me/wmi/drill/next',
    { params: { childId, grade } },
  )
  return unwrap(res.data).question
}

export async function submitAttempt(input: WmiAttemptInput): Promise<WmiAttemptResult> {
  const res = await api.post<Envelope<WmiAttemptResult>>('/me/wmi/attempts', input)
  return unwrap(res.data)
}

export async function startExamSession(childId: string, paperId: string): Promise<WmiExamSnapshot> {
  const res = await api.post<Envelope<WmiExamSnapshot>>('/me/wmi/exam/sessions', {
    childId,
    paper_id: paperId,
  })
  return unwrap(res.data)
}

export async function fetchExamSession(childId: string, sessionId: string): Promise<WmiExamSnapshot> {
  const res = await api.get<Envelope<WmiExamSnapshot>>(
    `/me/wmi/exam/sessions/${sessionId}`,
    { params: { childId } },
  )
  return unwrap(res.data)
}

export async function completeExamSession(childId: string, sessionId: string): Promise<WmiExamSession> {
  const res = await api.patch<Envelope<{ session: WmiExamSession }>>(
    `/me/wmi/exam/sessions/${sessionId}/complete`,
    { childId },
  )
  return unwrap(res.data).session
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/wmiApi.ts
git commit -m "feat(lib): add typed WMI axios wrappers"
```

---

## Task 14: Store `src/store/wmiStore.ts`

**Files:**
- Create: `src/store/wmiStore.ts`

- [ ] **Step 1: Write the store**

```ts
import { create } from 'zustand'
import type { WmiGlossaryTerm, WmiGrade } from '../types/wmi'
import { fetchGlossary } from '../lib/wmiApi'

interface WmiState {
  glossary: Map<string, WmiGlossaryTerm>
  glossaryStatus: 'idle' | 'loading' | 'ready' | 'error'
  glossaryError: string | null
  selectedGrade: WmiGrade
  loadGlossary: () => Promise<void>
  setSelectedGrade: (grade: WmiGrade) => void
  getTerm: (slug: string) => WmiGlossaryTerm | undefined
}

export const useWmiStore = create<WmiState>((set, get) => ({
  glossary: new Map(),
  glossaryStatus: 'idle',
  glossaryError: null,
  selectedGrade: 0,

  loadGlossary: async () => {
    const status = get().glossaryStatus
    if (status === 'loading' || status === 'ready') return
    set({ glossaryStatus: 'loading', glossaryError: null })
    try {
      const terms = await fetchGlossary()
      const map = new Map<string, WmiGlossaryTerm>()
      for (const t of terms) map.set(t.slug, t)
      set({ glossary: map, glossaryStatus: 'ready' })
    } catch (e) {
      set({
        glossaryStatus: 'error',
        glossaryError: e instanceof Error ? e.message : 'Unknown error',
      })
    }
  },

  setSelectedGrade: (grade) => set({ selectedGrade: grade }),

  getTerm: (slug) => get().glossary.get(slug),
}))
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/store/wmiStore.ts
git commit -m "feat(store): add wmiStore (glossary cache + selected grade)"
```

---

## Task 15: Question-rendering components

Five small pure components plus the shared `WmiQuestionView` that composes them.

**Files:**
- Create: `src/components/wmi/WmiGlossaryPopover.tsx`
- Create: `src/components/wmi/WmiGlossaryTerm.tsx`
- Create: `src/components/wmi/WmiTranslationSpoiler.tsx`
- Create: `src/components/wmi/WmiAnswerChoice.tsx`
- Create: `src/components/wmi/WmiFigure.tsx`
- Create: `src/components/wmi/WmiQuestionView.tsx`

- [ ] **Step 1: `WmiGlossaryPopover.tsx`**

```tsx
import { useState } from 'react'
import type { WmiGlossaryTerm } from '../../types/wmi'

export default function WmiGlossaryPopover({ term, onClose }: { term: WmiGlossaryTerm; onClose: () => void }) {
  const [lang, setLang] = useState<'en' | 'id'>('en')
  const definition = lang === 'en' ? term.definition_en : term.definition_id
  const label = lang === 'en' ? term.term_en : term.term_id
  const example = lang === 'en' ? term.example_en : term.example_id

  return (
    <div
      className="absolute z-50 mt-1 w-64 rounded-lg border border-qupu-cream-dark bg-white p-3 text-sm shadow-lg"
      role="dialog"
    >
      <div className="flex items-center justify-between">
        <strong className="capitalize">{label}</strong>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang((l) => (l === 'en' ? 'id' : 'en'))}
            className="rounded bg-qupu-cream px-2 py-0.5 text-xs uppercase tracking-wide"
          >
            {lang === 'en' ? 'ID' : 'EN'}
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-500">
            ✕
          </button>
        </div>
      </div>
      <p className="mt-2 text-gray-700">{definition}</p>
      {example && <p className="mt-2 text-xs italic text-gray-500">{example}</p>}
    </div>
  )
}
```

- [ ] **Step 2: `WmiGlossaryTerm.tsx`**

```tsx
import { useState } from 'react'
import { useWmiStore } from '../../store/wmiStore'
import WmiGlossaryPopover from './WmiGlossaryPopover'

interface Props {
  slug: string
  display: string
  onLookup?: (slug: string) => void
}

export default function WmiGlossaryTerm({ slug, display, onLookup }: Props) {
  const term = useWmiStore((s) => s.getTerm(slug))
  const [open, setOpen] = useState(false)

  if (!term) {
    if (import.meta.env.DEV) {
      console.warn(`[wmi] Unknown glossary slug: ${slug}`)
    }
    return <span>{display}</span>
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v
            if (next) onLookup?.(slug)
            return next
          })
        }}
        className="cursor-help border-b border-dotted border-qupu-purple text-qupu-purple"
      >
        {display}
      </button>
      {open && <WmiGlossaryPopover term={term} onClose={() => setOpen(false)} />}
    </span>
  )
}
```

- [ ] **Step 3: `WmiTranslationSpoiler.tsx`**

```tsx
import { type ReactNode } from 'react'

interface Props {
  open: boolean
  onOpen: () => void
  children: ReactNode
}

export default function WmiTranslationSpoiler({ open, onOpen, children }: Props) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 inline-flex items-center gap-1 rounded-md bg-qupu-cream px-3 py-1.5 text-sm text-qupu-purple"
      >
        Lihat terjemahan Bahasa Indonesia ↓
      </button>
    )
  }
  return <div className="mt-3 rounded-md bg-qupu-cream/60 p-3 text-sm text-gray-800">{children}</div>
}
```

- [ ] **Step 4: `WmiAnswerChoice.tsx`**

```tsx
import type { ReactNode } from 'react'

interface Props {
  label: string
  state: 'idle' | 'selected' | 'correct' | 'wrong'
  onTap: () => void
  disabled?: boolean
  children: ReactNode
}

const STATE_STYLES: Record<Props['state'], string> = {
  idle: 'border-gray-200 bg-white hover:bg-qupu-cream/50',
  selected: 'border-qupu-purple bg-qupu-purple/10',
  correct: 'border-green-500 bg-green-50',
  wrong: 'border-red-400 bg-red-50',
}

export default function WmiAnswerChoice({ label, state, onTap, disabled, children }: Props) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition disabled:opacity-60 ${STATE_STYLES[state]}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-qupu-purple text-white">
        {label}
      </span>
      <span className="text-base">{children}</span>
    </button>
  )
}
```

- [ ] **Step 5: `WmiFigure.tsx`**

```tsx
import { useState } from 'react'

export default function WmiFigure({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="mx-auto my-3 flex h-24 w-24 items-center justify-center rounded-md bg-qupu-cream text-2xl">
        🖼️
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="mx-auto my-3 max-w-[320px] rounded-md"
    />
  )
}
```

- [ ] **Step 6: `WmiQuestionView.tsx`**

```tsx
import { useMemo, useState, type ReactNode } from 'react'
import type { WmiQuestion, WmiQuestionChoice } from '../../types/wmi'
import { parseWmiMarkup } from '../../lib/wmiMarkup'
import WmiGlossaryTerm from './WmiGlossaryTerm'
import WmiTranslationSpoiler from './WmiTranslationSpoiler'
import WmiAnswerChoice from './WmiAnswerChoice'
import WmiFigure from './WmiFigure'

export interface WmiQuestionViewProps {
  question: WmiQuestion
  selectedChoice: string | null
  highlight: { correct: string | null; wrongPicked: string | null } | null
  onPickChoice: (label: string) => void
  onSubmitFillIn: (value: string) => void
  disabled?: boolean
  onLookupTerm: (slug: string) => void
  onRevealTranslation: () => void
  revealed: boolean
}

function renderWithMarkup(input: string, onLookupTerm: (slug: string) => void): ReactNode {
  const tokens = parseWmiMarkup(input)
  return tokens.map((t, i) =>
    t.type === 'text' ? (
      <span key={i}>{t.value}</span>
    ) : (
      <WmiGlossaryTerm key={i} slug={t.slug} display={t.display} onLookup={onLookupTerm} />
    ),
  )
}

export default function WmiQuestionView(props: WmiQuestionViewProps) {
  const {
    question, selectedChoice, highlight, onPickChoice, onSubmitFillIn,
    disabled, onLookupTerm, onRevealTranslation, revealed,
  } = props

  const [fillInValue, setFillInValue] = useState('')

  const choiceState = useMemo(
    () =>
      (c: WmiQuestionChoice): 'idle' | 'selected' | 'correct' | 'wrong' => {
        if (highlight?.correct === c.label) return 'correct'
        if (highlight?.wrongPicked === c.label) return 'wrong'
        if (selectedChoice === c.label) return 'selected'
        return 'idle'
      },
    [highlight, selectedChoice],
  )

  return (
    <div>
      {question.figure_url && <WmiFigure src={question.figure_url} alt={`Question ${question.number}`} />}
      <div className="text-lg leading-relaxed text-gray-900">
        {renderWithMarkup(question.body_en, onLookupTerm)}
      </div>

      <WmiTranslationSpoiler open={revealed} onOpen={onRevealTranslation}>
        <div>{renderWithMarkup(question.body_id, onLookupTerm)}</div>
        {question.choices_id && (
          <ol className="mt-3 list-none space-y-1 text-sm">
            {question.choices_id.map((c) => (
              <li key={c.label}>
                <strong>{c.label}.</strong> {renderWithMarkup(c.text, onLookupTerm)}
              </li>
            ))}
          </ol>
        )}
      </WmiTranslationSpoiler>

      <div className="mt-5 space-y-2">
        {question.answer_type === 'multiple_choice' && question.choices_en ? (
          question.choices_en.map((c) => (
            <WmiAnswerChoice
              key={c.label}
              label={c.label}
              state={choiceState(c)}
              onTap={() => onPickChoice(c.label)}
              disabled={disabled}
            >
              {renderWithMarkup(c.text, onLookupTerm)}
            </WmiAnswerChoice>
          ))
        ) : (
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={fillInValue}
              onChange={(e) => setFillInValue(e.target.value)}
              disabled={disabled}
              className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2"
              placeholder="Ketik jawaban…"
            />
            <button
              type="button"
              onClick={() => onSubmitFillIn(fillInValue)}
              disabled={disabled || fillInValue.trim() === ''}
              className="rounded-lg bg-qupu-purple px-4 py-2 text-white disabled:opacity-50"
            >
              Periksa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Typecheck**

Run: `npm run check`
Expected: PASS. (If Tailwind classes like `qupu-purple` aren't defined yet, accept the runtime fallback — they're in the existing palette per other components.)

- [ ] **Step 8: Commit**

```bash
git add src/components/wmi/
git commit -m "feat(ui): add WMI question-rendering components"
```

---

## Task 16: Drill flow — `WmiDrill.tsx` + `WmiFeedbackPanel.tsx`

**Files:**
- Create: `src/components/wmi/WmiFeedbackPanel.tsx`
- Create: `src/pages/WmiDrill.tsx`

- [ ] **Step 1: `WmiFeedbackPanel.tsx`**

```tsx
import { useState } from 'react'

interface Props {
  isCorrect: boolean
  correctAnswer: string
  hintEn: string | null
  hintId: string | null
  onNext: () => void
}

export default function WmiFeedbackPanel({ isCorrect, correctAnswer, hintEn, hintId, onNext }: Props) {
  const [showId, setShowId] = useState(false)
  const tone = isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
  const headline = isCorrect ? 'Hebat!' : 'Belum tepat — coba lagi besok!'
  return (
    <div className={`mt-5 rounded-xl border-2 p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <strong>{headline}</strong>
        <button type="button" onClick={onNext} className="rounded-lg bg-qupu-purple px-4 py-2 text-white">
          Next →
        </button>
      </div>
      {!isCorrect && <p className="mt-2 text-sm">Jawaban benar: <strong>{correctAnswer}</strong></p>}
      {hintEn && <p className="mt-2 text-sm italic">{hintEn}</p>}
      {hintId && (
        <button
          type="button"
          onClick={() => setShowId((v) => !v)}
          className="mt-1 text-xs text-qupu-purple underline"
        >
          {showId ? 'Sembunyikan ID' : 'Lihat dalam Bahasa Indonesia'}
        </button>
      )}
      {hintId && showId && <p className="mt-1 text-sm italic">{hintId}</p>}
    </div>
  )
}
```

- [ ] **Step 2: `src/pages/WmiDrill.tsx`**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import { fetchNextDrillQuestion, submitAttempt } from '../lib/wmiApi'
import type { WmiAttemptResult, WmiGrade, WmiQuestion } from '../types/wmi'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiFeedbackPanel from '../components/wmi/WmiFeedbackPanel'

export default function WmiDrill() {
  const [params] = useSearchParams()
  const grade = (parseInt(params.get('grade') ?? '0', 10) as WmiGrade)
  const { activeChildId } = useAuthStore()
  const { loadGlossary, glossaryStatus } = useWmiStore()

  const [question, setQuestion] = useState<WmiQuestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiAttemptResult | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [lookedUp, setLookedUp] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)
  const askedAt = useRef<number>(Date.now())

  useEffect(() => { loadGlossary() }, [loadGlossary])

  const fetchNext = useCallback(async () => {
    if (!activeChildId) return
    setLoading(true)
    setError(null)
    setSelected(null)
    setFeedback(null)
    setRevealed(false)
    setLookedUp(new Set())
    try {
      const q = await fetchNextDrillQuestion(activeChildId, grade)
      setQuestion(q)
      askedAt.current = Date.now()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat soal')
    } finally {
      setLoading(false)
    }
  }, [activeChildId, grade])

  useEffect(() => { fetchNext() }, [fetchNext])

  const handleSubmit = useCallback(async (selectedAnswer: string) => {
    if (!activeChildId || !question || feedback) return
    setSelected(selectedAnswer)
    try {
      const result = await submitAttempt({
        childId: activeChildId,
        question_id: question.id,
        mode: 'drill',
        selected_answer: selectedAnswer,
        time_taken_ms: Date.now() - askedAt.current,
        revealed_id_translation: revealed,
        looked_up_terms: Array.from(lookedUp),
      })
      setFeedback(result)
      setStreak((s) => (result.is_correct ? s + 1 : 0))
    } catch (e) {
      setSelected(null)
      setError(e instanceof Error ? e.message : 'Gagal kirim — coba lagi')
    }
  }, [activeChildId, question, feedback, revealed, lookedUp])

  const highlight = useMemo(() => {
    if (!feedback || !question) return null
    return {
      correct: feedback.correct_answer,
      wrongPicked: feedback.is_correct ? null : selected,
    }
  }, [feedback, question, selected])

  if (!activeChildId) {
    return <div className="p-6 text-center">Pilih profil anak dulu di pojok kanan atas.</div>
  }
  if (glossaryStatus === 'error') {
    return <div className="p-6 text-center text-red-600">Glosarium gagal dimuat — coba muat ulang halaman.</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-qupu-cream px-3 py-1 text-sm">Grade {grade}</span>
        <Link to="/latihan/wmi" className="text-sm text-qupu-purple underline">Ganti grade</Link>
        <span className="text-sm">🔥 {streak}</span>
      </div>
      {error && <div className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="p-6 text-center text-gray-500">Memuat soal…</div>}
      {!loading && !question && (
        <div className="rounded-xl border-2 border-dashed border-qupu-cream-dark p-6 text-center">
          Belum ada soal untuk grade ini.
        </div>
      )}
      {question && (
        <>
          <WmiQuestionView
            question={question}
            selectedChoice={selected}
            highlight={highlight}
            onPickChoice={handleSubmit}
            onSubmitFillIn={handleSubmit}
            disabled={feedback !== null}
            onLookupTerm={(slug) => setLookedUp((prev) => new Set(prev).add(slug))}
            onRevealTranslation={() => setRevealed(true)}
            revealed={revealed}
          />
          {feedback && (
            <WmiFeedbackPanel
              isCorrect={feedback.is_correct}
              correctAnswer={feedback.correct_answer}
              hintEn={feedback.hint_en}
              hintId={feedback.hint_id}
              onNext={fetchNext}
            />
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/wmi/WmiFeedbackPanel.tsx src/pages/WmiDrill.tsx
git commit -m "feat(ui): add WMI drill flow"
```

---

## Task 17: Exam flow — `WmiExam.tsx` + timer + progress bar

**Files:**
- Create: `src/components/wmi/WmiExamTimer.tsx`
- Create: `src/components/wmi/WmiExamProgressBar.tsx`
- Create: `src/pages/WmiExam.tsx`

- [ ] **Step 1: `WmiExamTimer.tsx`**

```tsx
import { useEffect, useState } from 'react'

interface Props {
  deadline: number // epoch ms
  onExpire: () => void
}

function fmt(ms: number): string {
  if (ms < 0) ms = 0
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function WmiExamTimer({ deadline, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() => deadline - Date.now())

  useEffect(() => {
    const tick = () => {
      const r = deadline - Date.now()
      setRemaining(r)
      if (r <= 0) onExpire()
    }
    const id = window.setInterval(tick, 500)
    return () => window.clearInterval(id)
  }, [deadline, onExpire])

  const danger = remaining < 60_000
  return (
    <span className={`rounded-md px-3 py-1 font-mono text-sm ${danger ? 'bg-red-100 text-red-700' : 'bg-qupu-cream'}`}>
      ⏱ {fmt(remaining)}
    </span>
  )
}
```

- [ ] **Step 2: `WmiExamProgressBar.tsx`**

```tsx
interface Props {
  total: number
  currentIndex: number
  answeredIndices: Set<number>
  onJump: (index: number) => void
}

export default function WmiExamProgressBar({ total, currentIndex, answeredIndices, onJump }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: total }, (_, i) => {
        const answered = answeredIndices.has(i)
        const active = i === currentIndex
        const cls = active
          ? 'bg-qupu-purple text-white'
          : answered
            ? 'bg-green-200'
            : 'bg-gray-100'
        return (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            className={`h-7 w-7 rounded text-xs ${cls}`}
            aria-label={`Soal ${i + 1}`}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: `src/pages/WmiExam.tsx`**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import {
  completeExamSession,
  fetchExamSession,
  submitAttempt,
} from '../lib/wmiApi'
import type { WmiExamSnapshot } from '../types/wmi'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiExamTimer from '../components/wmi/WmiExamTimer'
import WmiExamProgressBar from '../components/wmi/WmiExamProgressBar'

export default function WmiExam() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const { loadGlossary } = useWmiStore()

  const [snapshot, setSnapshot] = useState<WmiExamSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  // Map question_id -> { selected_answer, revealed, lookedUp }
  const [draft, setDraft] = useState<Map<string, { selected: string; revealed: boolean; lookedUp: Set<string> }>>(new Map())
  const completingRef = useRef(false)

  useEffect(() => { loadGlossary() }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId || !sessionId) return
    fetchExamSession(activeChildId, sessionId)
      .then((snap) => {
        setSnapshot(snap)
        if (snap.session.completed_at) {
          navigate(`/latihan/wmi/exam/${sessionId}/review`, { replace: true })
          return
        }
        // Hydrate draft from already-submitted attempts.
        const next = new Map<string, { selected: string; revealed: boolean; lookedUp: Set<string> }>()
        for (const a of snap.submittedAttempts) {
          next.set(a.question_id, {
            selected: a.selected_answer,
            revealed: a.revealed_id_translation,
            lookedUp: new Set(a.looked_up_terms),
          })
        }
        setDraft(next)
      })
      .catch((e) => {
        if (e instanceof Error && e.message === 'Session not owned') {
          setError('Sesi ujian ini milik profil anak yang lain.')
        } else {
          setError(e instanceof Error ? e.message : 'Gagal memuat ujian')
        }
      })
  }, [activeChildId, sessionId, navigate])

  const handleComplete = useCallback(async () => {
    if (!activeChildId || !sessionId || completingRef.current) return
    completingRef.current = true
    try {
      await completeExamSession(activeChildId, sessionId)
      navigate(`/latihan/wmi/exam/${sessionId}/review`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyelesaikan ujian')
    } finally {
      completingRef.current = false
    }
  }, [activeChildId, sessionId, navigate])

  const handleSubmitChoice = useCallback(async (label: string) => {
    if (!snapshot || !activeChildId || !sessionId) return
    const q = snapshot.paper.questions[currentIndex]
    const prev = draft.get(q.id) ?? { selected: '', revealed: false, lookedUp: new Set<string>() }
    const nextDraftEntry = { ...prev, selected: label }
    setDraft((d) => new Map(d).set(q.id, nextDraftEntry))
    try {
      await submitAttempt({
        childId: activeChildId,
        question_id: q.id,
        mode: 'exam',
        session_id: sessionId,
        selected_answer: label,
        revealed_id_translation: nextDraftEntry.revealed,
        looked_up_terms: Array.from(nextDraftEntry.lookedUp),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan — coba lagi')
    }
  }, [snapshot, activeChildId, sessionId, currentIndex, draft])

  const deadline = useMemo(() => {
    if (!snapshot) return Date.now()
    return new Date(snapshot.session.started_at).getTime() +
      snapshot.paper.recommended_duration_min * 60_000
  }, [snapshot])

  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!snapshot) return <div className="p-6 text-center">Memuat ujian…</div>

  const total = snapshot.paper.questions.length
  const q = snapshot.paper.questions[currentIndex]
  const entry = draft.get(q.id)
  const answeredIndices = new Set(
    snapshot.paper.questions.map((qq, i) => draft.has(qq.id) ? i : -1).filter((i) => i >= 0),
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <strong className="truncate">{snapshot.paper.title}</strong>
        <WmiExamTimer deadline={deadline} onExpire={handleComplete} />
      </div>
      <div className="mb-3 text-sm text-gray-600">Soal {currentIndex + 1} dari {total}</div>
      <WmiExamProgressBar
        total={total}
        currentIndex={currentIndex}
        answeredIndices={answeredIndices}
        onJump={setCurrentIndex}
      />
      <div className="mt-5">
        <WmiQuestionView
          question={q}
          selectedChoice={entry?.selected ?? null}
          highlight={null}
          onPickChoice={handleSubmitChoice}
          onSubmitFillIn={handleSubmitChoice}
          onLookupTerm={(slug) => {
            const cur = draft.get(q.id) ?? { selected: '', revealed: false, lookedUp: new Set<string>() }
            const nextSet = new Set(cur.lookedUp); nextSet.add(slug)
            setDraft((d) => new Map(d).set(q.id, { ...cur, lookedUp: nextSet }))
          }}
          onRevealTranslation={() => {
            const cur = draft.get(q.id) ?? { selected: '', revealed: false, lookedUp: new Set<string>() }
            setDraft((d) => new Map(d).set(q.id, { ...cur, revealed: true }))
          }}
          revealed={entry?.revealed ?? false}
        />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-md bg-gray-100 px-4 py-2 disabled:opacity-50"
        >
          ← Sebelumnya
        </button>
        {currentIndex < total - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            className="rounded-md bg-qupu-purple px-4 py-2 text-white"
          >
            Lanjut →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="rounded-md bg-green-600 px-4 py-2 text-white"
          >
            Selesai
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/WmiExamTimer.tsx src/components/wmi/WmiExamProgressBar.tsx src/pages/WmiExam.tsx
git commit -m "feat(ui): add WMI exam flow with timer, progress, session resume"
```

---

## Task 18: Review flow — `WmiExamReview.tsx` + `WmiExamReviewItem.tsx`

**Files:**
- Create: `src/components/wmi/WmiExamReviewItem.tsx`
- Create: `src/pages/WmiExamReview.tsx`

- [ ] **Step 1: `WmiExamReviewItem.tsx`**

```tsx
import { useState } from 'react'
import type { WmiQuestion, WmiSubmittedAttempt } from '../../types/wmi'
import WmiQuestionView from './WmiQuestionView'

interface Props {
  question: WmiQuestion
  attempt: WmiSubmittedAttempt | undefined
}

export default function WmiExamReviewItem({ question, attempt }: Props) {
  const [open, setOpen] = useState(false)
  let icon = '–'
  let toneCls = 'text-gray-500'
  if (attempt) {
    icon = attempt.is_correct ? '✓' : '✗'
    toneCls = attempt.is_correct ? 'text-green-600' : 'text-red-600'
  }
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <span className="flex items-center gap-3">
          <span className={`text-lg ${toneCls}`}>{icon}</span>
          <strong>Soal {question.number}</strong>
        </span>
        <span className="text-sm text-gray-500">
          {attempt ? `Jawabanmu: ${attempt.selected_answer}` : 'Tidak dijawab'}
        </span>
      </button>
      {open && (
        <div className="mt-3">
          <WmiQuestionView
            question={question}
            selectedChoice={attempt?.selected_answer ?? null}
            highlight={{ correct: attempt?.is_correct ? attempt.selected_answer : null, wrongPicked: attempt && !attempt.is_correct ? attempt.selected_answer : null }}
            onPickChoice={() => {}}
            onSubmitFillIn={() => {}}
            disabled
            onLookupTerm={() => {}}
            onRevealTranslation={() => {}}
            revealed
          />
          {!attempt?.is_correct && question.hint_en && (
            <p className="mt-2 text-sm italic text-gray-600">{question.hint_en}</p>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: `src/pages/WmiExamReview.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { fetchExamSession, startExamSession } from '../lib/wmiApi'
import type { WmiExamSnapshot } from '../types/wmi'
import WmiExamReviewItem from '../components/wmi/WmiExamReviewItem'

export default function WmiExamReview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const [snapshot, setSnapshot] = useState<WmiExamSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeChildId || !sessionId) return
    fetchExamSession(activeChildId, sessionId)
      .then(setSnapshot)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat hasil'))
  }, [activeChildId, sessionId])

  const restartPaper = async () => {
    if (!activeChildId || !snapshot) return
    try {
      const snap = await startExamSession(activeChildId, snapshot.paper.id)
      navigate(`/latihan/wmi/exam/${snap.session.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memulai ulang')
    }
  }

  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!snapshot) return <div className="p-6 text-center">Memuat hasil…</div>
  const { session, paper, submittedAttempts } = snapshot
  const score = session.correct_count ?? 0
  const pct = paper.questions.length ? Math.round((score / paper.questions.length) * 100) : 0
  const attemptByQid = new Map(submittedAttempts.map((a) => [a.question_id, a]))

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 rounded-xl bg-qupu-cream/60 p-4 text-center">
        <div className="text-3xl font-bold">{score} / {paper.questions.length}</div>
        <div className="text-sm text-gray-600">{pct}% — {paper.title}</div>
      </header>
      <div className="space-y-3">
        {paper.questions.map((q) => (
          <WmiExamReviewItem key={q.id} question={q} attempt={attemptByQid.get(q.id)} />
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <Link to="/latihan/wmi" className="rounded-md bg-gray-100 px-4 py-2">Kembali ke Latihan</Link>
        <button type="button" onClick={restartPaper} className="rounded-md bg-qupu-purple px-4 py-2 text-white">
          Coba lagi
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/wmi/WmiExamReviewItem.tsx src/pages/WmiExamReview.tsx
git commit -m "feat(ui): add WMI exam review page"
```

---

## Task 19: Hub + Paper detail + supporting cards

**Files:**
- Create: `src/components/wmi/WmiGradeChips.tsx`
- Create: `src/components/wmi/WmiPaperCard.tsx`
- Create: `src/pages/WmiHub.tsx`
- Create: `src/pages/WmiPaperDetail.tsx`

- [ ] **Step 1: `WmiGradeChips.tsx`**

```tsx
import type { WmiGrade } from '../../types/wmi'

interface Props {
  selected: WmiGrade
  onSelect: (grade: WmiGrade) => void
}

const GRADES: WmiGrade[] = [0, 1, 2, 3]

export default function WmiGradeChips({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-2">
      {GRADES.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onSelect(g)}
          className={`rounded-full px-4 py-1.5 text-sm ${selected === g ? 'bg-qupu-purple text-white' : 'bg-qupu-cream'}`}
        >
          Grade {g}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: `WmiPaperCard.tsx`**

```tsx
import { Link } from 'react-router-dom'
import type { WmiPaperSummary } from '../../types/wmi'

export default function WmiPaperCard({ paper }: { paper: WmiPaperSummary }) {
  return (
    <Link
      to={`/latihan/wmi/papers/${paper.id}`}
      className="block rounded-xl border-2 border-qupu-cream-dark bg-white p-4 hover:bg-qupu-cream/30"
    >
      <div className="flex items-center justify-between">
        <strong>{paper.year} {paper.round === 'final' ? 'Final' : 'Semifinal'}</strong>
        <span className="text-xs text-gray-500">{paper.question_count} soal</span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {paper.best_score !== null
          ? `Nilai terbaik: ${Math.round(paper.best_score)}%`
          : 'Belum dicoba'}
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: `src/pages/WmiHub.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import { fetchPapers } from '../lib/wmiApi'
import type { WmiGrade, WmiPaperSummary } from '../types/wmi'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import WmiPaperCard from '../components/wmi/WmiPaperCard'

export default function WmiHub() {
  const { activeChildId } = useAuthStore()
  const { selectedGrade, setSelectedGrade, loadGlossary } = useWmiStore()
  const [papers, setPapers] = useState<WmiPaperSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadGlossary() }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId) return
    fetchPapers(activeChildId, selectedGrade)
      .then(setPapers)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat'))
  }, [activeChildId, selectedGrade])

  if (!activeChildId) return <div className="p-6 text-center">Pilih profil anak dulu.</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold">Latihan WMI</h1>
      <p className="text-sm text-gray-600">Pikirkan seperti juara olimpiade.</p>

      <div className="mt-4">
        <WmiGradeChips selected={selectedGrade} onSelect={(g: WmiGrade) => setSelectedGrade(g)} />
      </div>

      <Link
        to={`/latihan/wmi/drill?grade=${selectedGrade}`}
        className="mt-5 block rounded-xl bg-qupu-purple p-5 text-center text-lg text-white"
      >
        Mulai Drill →
      </Link>

      <h2 className="mt-6 text-lg font-semibold">Latihan Soal Ujian</h2>
      {error && <div className="mt-2 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {papers.length === 0 && !error && (
          <div className="rounded-xl border-2 border-dashed border-qupu-cream-dark p-6 text-center text-gray-500 sm:col-span-2">
            Belum ada soal untuk grade ini.
          </div>
        )}
        {papers.map((p) => <WmiPaperCard key={p.id} paper={p} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `src/pages/WmiPaperDetail.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { fetchPaperDetail, startExamSession } from '../lib/wmiApi'
import type { WmiPaperDetail as Detail } from '../types/wmi'

export default function WmiPaperDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const [paper, setPaper] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!activeChildId || !id) return
    fetchPaperDetail(activeChildId, id)
      .then(setPaper)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat'))
  }, [activeChildId, id])

  const startExam = async () => {
    if (!activeChildId || !paper) return
    setStarting(true)
    try {
      const snap = await startExamSession(activeChildId, paper.id)
      navigate(`/latihan/wmi/exam/${snap.session.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memulai')
      setStarting(false)
    }
  }

  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!paper) return <div className="p-6 text-center">Memuat…</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-center">
      <Link to="/latihan/wmi" className="text-sm text-qupu-purple underline">← Kembali</Link>
      <h1 className="mt-3 text-2xl font-bold">{paper.title}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {paper.questions.length} soal • {paper.recommended_duration_min} menit
      </p>
      <button
        type="button"
        onClick={startExam}
        disabled={starting}
        className="mt-6 rounded-xl bg-qupu-purple px-8 py-3 text-lg text-white disabled:opacity-50"
      >
        {starting ? 'Memulai…' : 'Mulai Ujian'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/wmi/WmiGradeChips.tsx src/components/wmi/WmiPaperCard.tsx src/pages/WmiHub.tsx src/pages/WmiPaperDetail.tsx
git commit -m "feat(ui): add WMI hub + paper detail screens"
```

---

## Task 20: Wire routes in `App.tsx` + add "Latihan" to Navbar

**Files:**
- Modify: `src/App.tsx` (5 new routes)
- Modify: `src/components/Navbar.tsx` (one new link)

- [ ] **Step 1: Add the 5 routes to `src/App.tsx`**

Add to the imports at the top of `src/App.tsx`:

```tsx
import WmiHubPage from './pages/WmiHub'
import WmiDrillPage from './pages/WmiDrill'
import WmiPaperDetailPage from './pages/WmiPaperDetail'
import WmiExamPage from './pages/WmiExam'
import WmiExamReviewPage from './pages/WmiExamReview'
```

Inside the `<Route path="/" element={<Layout />}>` block, after the `report` route (around line 108), add:

```tsx
<Route
  path="latihan/wmi"
  element={<ProtectedRoute><WmiHubPage /></ProtectedRoute>}
/>
<Route
  path="latihan/wmi/drill"
  element={<ProtectedRoute><WmiDrillPage /></ProtectedRoute>}
/>
<Route
  path="latihan/wmi/papers/:id"
  element={<ProtectedRoute><WmiPaperDetailPage /></ProtectedRoute>}
/>
<Route
  path="latihan/wmi/exam/:sessionId"
  element={<ProtectedRoute><WmiExamPage /></ProtectedRoute>}
/>
<Route
  path="latihan/wmi/exam/:sessionId/review"
  element={<ProtectedRoute><WmiExamReviewPage /></ProtectedRoute>}
/>
```

- [ ] **Step 2: Add the Navbar item**

Open `src/components/Navbar.tsx`. Find where existing authenticated nav links are rendered (search for the existing `to="/dashboard"` or `to="/report"` `<Link>`s). Add a new link in the same style, placed between Video and Rapor:

```tsx
<Link to="/latihan/wmi" className="...same classes as siblings...">
  Latihan
</Link>
```

(Match the exact className pattern of the surrounding link to preserve visual consistency. If the Navbar has both a desktop list and a mobile sheet, add the same link in both.)

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/Navbar.tsx
git commit -m "feat(ui): wire WMI routes and Navbar entry"
```

---

## Task 21: End-to-end manual smoke + final commit

**Goal:** Verify the full feature works in the browser as authenticated parent + active child, exactly matching the spec's §Verification section.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Confirm: Vite reports the client on `http://localhost:5173`, nodemon reports the API on `http://localhost:3001`.

- [ ] **Step 2: Log in as a known parent, activate a known child profile**

Use the ChildSwitcher in the existing UI. Navigate to `/latihan/wmi`.

- [ ] **Step 3: Hub smoke**

- Verify grade chips render (Grade 0/1/2/3); selecting each updates the paper list (only Grade 1 will show the seeded paper).
- Verify "Mulai Drill" button is present and routes to `/latihan/wmi/drill?grade=1`.
- Verify empty state shows for grades with no seeded papers.

- [ ] **Step 4: Drill smoke**

- Navigate to `/latihan/wmi/drill?grade=1`. Verify one question loads.
- For Q1 (multiple choice with `[[perimeter]]`): tap the underlined "perimeter" — popover opens with EN definition + ID toggle.
- Tap "Lihat terjemahan Bahasa Indonesia ↓" — Indonesian body + choices appear.
- Tap the correct choice (D for the seeded Q1) — green wash + mascot + "Hebat!" + "Next" CTA. Streak counter increments.
- Tap "Next" — new question loads (likely Q2 since pool is small; that's expected).
- Tap an incorrect choice on a question — red wash on the kid's choice + green on correct, "Belum tepat" panel, hint visible.
- Verify in the DB: `SELECT mode, selected_answer, is_correct, revealed_id_translation, looked_up_terms FROM wmi_attempts ORDER BY created_at DESC LIMIT 5;` — your taps are persisted, `looked_up_terms` includes `perimeter`.

- [ ] **Step 5: Exam smoke**

- Navigate to `/latihan/wmi` → tap the seeded paper card.
- On paper detail, tap "Mulai Ujian". You land on `/latihan/wmi/exam/<sessionId>` with the timer counting down from 60:00.
- Answer Q1 with one choice, advance to Q2, type a fill-in answer, advance back to Q1 and change the answer.
- Refresh the page — verify the page rehydrates with current selections, timer continues from `started_at + 60min - now()`.
- Tap "Selesai" — redirects to review.

- [ ] **Step 6: Review smoke**

- Verify the score badge and per-question correctness icons.
- Expand a question — figure + glossary + spoiler all render correctly inside the review item.
- Tap "Coba lagi" — starts a new session for the same paper. Tap "Kembali ke Latihan" — returns to hub.

- [ ] **Step 7: Cross-child & logout edges**

- Open an exam session as Child A. Switch ChildSwitcher to Child B. Refresh the exam URL — verify the "Sesi ujian ini milik profil anak yang lain" message.
- Log out mid-exam (token cleared). Verify no crash; the session row remains in the DB (`SELECT completed_at FROM wmi_exam_sessions ORDER BY started_at DESC LIMIT 1;` should still show `NULL`).

- [ ] **Step 8: Glossary analytics snippet sanity-check**

```bash
psql "$DATABASE_URL" -f - <<'SQL'
SELECT slug, COUNT(*) AS taps
FROM wmi_attempts CROSS JOIN LATERAL unnest(looked_up_terms) AS slug
GROUP BY slug ORDER BY taps DESC;
SQL
```

Expected: at least one `perimeter` row (from your drill smoke tap).

- [ ] **Step 9: Mobile viewport**

In Chrome devtools, set viewport to 375×667 (iPhone SE). Verify Drill and Exam both lay out cleanly: choice buttons stack vertically, timer + progress bar fit, no horizontal scroll.

- [ ] **Step 10: Mark plan complete**

Append a one-line note to the plan file's footer:

```bash
echo "" >> docs/superpowers/plans/2026-05-27-wmi-practice-area.md
echo "_Implementation complete: $(date +%Y-%m-%d)._" >> docs/superpowers/plans/2026-05-27-wmi-practice-area.md
git add docs/superpowers/plans/2026-05-27-wmi-practice-area.md
git commit -m "docs(plan): mark WMI practice area implementation complete"
```

- [ ] **Step 11: (Optional) Open a PR via the existing `/ship` workflow**

`/ship` per gstack conventions. Do not push without explicit user instruction.

---

## Self-review summary

- **Spec coverage:** all sections of `2026-05-27-wmi-practice-area-design.md` map to tasks here. The five new tables → Task 2; seed loader + content → Tasks 3–4; API surface → Tasks 5–10 (Task 1 extracts the shared ownership helper required by every WMI service); frontend foundation → Tasks 11–14; question rendering → Task 15; drill / exam / review flows → Tasks 16–18; hub + paper detail → Task 19; routing + nav → Task 20; verification → Task 21. The Strategic risks section is intentionally _not_ a task — it's a premise risk the team owns.
- **Placeholders:** none. Every code step shows complete code; every shell step shows the exact command and expected output.
- **Type consistency:** server `WmiPaperSummary`/`WmiQuestionDto` shapes match the client `WmiPaperSummary`/`WmiQuestion` types. `WmiAttemptInput` uses snake_case keys for `question_id`/`session_id`/`selected_answer` to match the server's Joi schema verbatim. The exam upsert SQL in Task 8 mirrors the partial unique index predicate from Task 2 exactly. The Express route handler error mapping in Task 10 throws the same string error messages that the service layer raises in Tasks 6–8.
