# WMI Concept Generator (v2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the WMI Concept Generator at `/latihan/wmi/konsep` per `docs/superpowers/specs/2026-05-27-wmi-concept-generator-design.md` — 8 starter concepts, ratio cull, optional 👍/👎 voting, lazy-bootstrapped instance pool, gamification-neutral.

**Architecture:** Backend concept logic (`api/services/wmi/concepts/<slug>/index.ts`) is pure TS — no React, no DB. Frontend illustrations (`src/components/wmi/concepts/<slug>.tsx`) are separate React modules keyed by the same slug. A module-level lazy promise bootstraps the pool on first request. New tables `wmi_concepts`, `wmi_concept_instances` (with GENERATED `is_culled` column), `wmi_concept_votes`. `wmi_attempts` from v1 gains a nullable `concept_instance_id` column. Past-paper drill, exam, glossary, ID-translation spoiler — all untouched.

**Tech Stack:** Express + pg + Joi + zod (already in deps) + bcrypt; React 18 + Vite + Tailwind + React Router 7; vitest for tests (added in master's recent merge); zustand + axios on the client; Postgres 14+ (GENERATED column requires 12+).

**Branch:** `feat/wmi-concept-generator` (already created off `feat/wmi-practice-area`).

**Execution note:** Per `AGENTS.md`, run every shell command in this plan through `rtk` (for example, `rtk npm run check`, `rtk git status`, `rtk npx vitest run ...`).

**Migration filename:** `0021_wmi_concepts.sql`. If master has advanced by land-time and 0021 collides, renumber to the next free slot. The SQL is renumber-agnostic; only the filename changes.

---

## Task 1: DB migration + schema mirror

**Files:**
- Create: `db/migrations/0021_wmi_concepts.sql`
- Modify: `db/schema.sql` (append v2 section after v1 WMI block)

- [ ] **Step 1: Create the migration file**

Create `db/migrations/0021_wmi_concepts.sql` with this exact content:

```sql
-- WMI Concept Generator (v2).
-- Hybrid schema: new concept tables; reuse wmi_attempts with nullable concept_instance_id.

BEGIN;

CREATE TABLE IF NOT EXISTS wmi_concepts (
  slug              TEXT PRIMARY KEY,
  name_en           TEXT NOT NULL,
  name_id           TEXT NOT NULL,
  description_id    TEXT,
  grades            SMALLINT[] NOT NULL,
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  param_overrides   JSONB,
  total_served      INT NOT NULL DEFAULT 0,
  total_upvotes     INT NOT NULL DEFAULT 0,
  total_downvotes   INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concepts_grades_valid CHECK (
    grades <@ ARRAY[0,1,2,3]::SMALLINT[] AND array_length(grades, 1) > 0
  )
);

CREATE TABLE IF NOT EXISTS wmi_concept_instances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_slug    TEXT NOT NULL REFERENCES wmi_concepts(slug) ON DELETE CASCADE,
  params          JSONB NOT NULL,
  body_en         TEXT NOT NULL,
  body_id         TEXT NOT NULL,
  answer_type     TEXT NOT NULL CHECK (answer_type IN ('multiple_choice','fill_in')),
  choices_en      JSONB,
  choices_id      JSONB,
  answer          TEXT NOT NULL,
  hint_en         TEXT,
  hint_id         TEXT,
  served_count    INT NOT NULL DEFAULT 0,
  upvotes         INT NOT NULL DEFAULT 0,
  downvotes       INT NOT NULL DEFAULT 0,
  is_culled       BOOLEAN GENERATED ALWAYS AS (
    (upvotes + downvotes) >= 5
    AND downvotes::numeric / NULLIF(upvotes + downvotes, 0) > 0.5
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concept_instances_params_unique UNIQUE (concept_slug, params)
);

CREATE INDEX IF NOT EXISTS idx_wmi_concept_instances_serve
  ON wmi_concept_instances (concept_slug, is_culled, served_count)
  WHERE is_culled = FALSE;

CREATE TABLE IF NOT EXISTS wmi_concept_votes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  concept_instance_id UUID NOT NULL REFERENCES wmi_concept_instances(id) ON DELETE CASCADE,
  vote                SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  voted_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concept_votes_kid_instance_unique UNIQUE (child_id, concept_instance_id)
);

CREATE INDEX IF NOT EXISTS idx_wmi_concept_votes_instance
  ON wmi_concept_votes (concept_instance_id);

ALTER TABLE wmi_attempts ALTER COLUMN question_id DROP NOT NULL;

ALTER TABLE wmi_attempts
  ADD COLUMN IF NOT EXISTS concept_instance_id UUID REFERENCES wmi_concept_instances(id) ON DELETE CASCADE;

ALTER TABLE wmi_attempts DROP CONSTRAINT IF EXISTS wmi_attempts_mode_check;
ALTER TABLE wmi_attempts ADD CONSTRAINT wmi_attempts_mode_check
  CHECK (mode IN ('drill','exam','concept'));

ALTER TABLE wmi_attempts DROP CONSTRAINT IF EXISTS wmi_attempts_exactly_one_target;
ALTER TABLE wmi_attempts ADD CONSTRAINT wmi_attempts_exactly_one_target
  CHECK (
    (question_id IS NOT NULL AND concept_instance_id IS NULL)
    OR (question_id IS NULL AND concept_instance_id IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_wmi_attempts_concept_instance
  ON wmi_attempts (concept_instance_id)
  WHERE concept_instance_id IS NOT NULL;

COMMIT;
```

- [ ] **Step 2: Mirror the migration in `db/schema.sql`**

Append everything above (between `BEGIN;` and `COMMIT;`, without those wrappers) to the end of `db/schema.sql` under a banner:

```sql
-- ─────────────────────────────────────────────────────────────────────
-- WMI Concept Generator (migration 0021)
-- ─────────────────────────────────────────────────────────────────────
```

Place the banner after v1's WMI block. The `ALTER TABLE wmi_attempts` statements still apply because schema.sql is read on fresh installs; the CHECK constraints replace whatever's there.

- [ ] **Step 3: Apply migration to dev DB**

Run:
```powershell
rtk npx tsx -e "import('dotenv/config').then(async () => { const { readFileSync } = await import('node:fs'); const { Pool } = await import('pg'); const sql = readFileSync('db/migrations/0021_wmi_concepts.sql', 'utf8'); const p = new Pool({ connectionString: process.env.DATABASE_URL }); try { await p.query(sql); console.log('OK'); } finally { await p.end(); } })"
```

Expected output: `OK`.

- [ ] **Step 4: Verify tables exist**

Run:
```powershell
rtk npx tsx -e "import('dotenv/config').then(async () => { const { Pool } = await import('pg'); const p = new Pool({ connectionString: process.env.DATABASE_URL }); try { const r = await p.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'wmi_concept%' ORDER BY table_name\"); console.log(r.rows.map(x => x.table_name).join(', ')); } finally { await p.end(); } })"
```

Expected: `wmi_concept_instances, wmi_concept_votes, wmi_concepts`.

- [ ] **Step 5: Verify ALTER on wmi_attempts**

Run:
```powershell
rtk npx tsx -e "import('dotenv/config').then(async () => { const { Pool } = await import('pg'); const p = new Pool({ connectionString: process.env.DATABASE_URL }); try { const r = await p.query(\"SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='wmi_attempts' AND column_name IN ('question_id','concept_instance_id') ORDER BY column_name\"); console.log(JSON.stringify(r.rows)); } finally { await p.end(); } })"
```

Expected: `[{"column_name":"concept_instance_id","is_nullable":"YES"},{"column_name":"question_id","is_nullable":"YES"}]`.

- [ ] **Step 6: Commit**

```bash
rtk git add db/migrations/0021_wmi_concepts.sql db/schema.sql
rtk git commit -m "feat(wmi): add concept generator schema (migration 0021)"
```

---

## Task 2: Backend types + RNG

**Files:**
- Create: `api/services/wmi/concepts/types.ts`
- Create: `api/services/wmi/concepts/rng.ts`
- Create: `api/services/wmi/concepts/rng.test.ts`

- [ ] **Step 1: Write the types module**

Create `api/services/wmi/concepts/types.ts`:

```typescript
import type { ZodType } from 'zod'

export interface Rng {
  int(minInclusive: number, maxInclusive: number): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
}

export type WmiChoice = { label: string; text: string }

export interface Rendered {
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  answer: string
  hint_en: string | null
  hint_id: string | null
}

export interface ConceptMeta {
  slug: string
  name_en: string
  name_id: string
  grades: readonly number[]
  description_id?: string
}

export interface ConceptLogic<P> {
  meta: ConceptMeta
  paramsSchema: ZodType<P>
  generate(rng: Rng): P
  render(params: P): Rendered
}
```

- [ ] **Step 2: Write the RNG test (fails initially)**

Create `api/services/wmi/concepts/rng.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from './rng.js'

describe('mulberry32', () => {
  test('same seed produces identical sequence', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      expect(a.int(1, 1_000_000)).toBe(b.int(1, 1_000_000))
    }
  })

  test('int respects inclusive bounds', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = r.int(3, 8)
      expect(v).toBeGreaterThanOrEqual(3)
      expect(v).toBeLessThanOrEqual(8)
    }
  })

  test('pick returns an element from the input array', () => {
    const r = mulberry32(99)
    const items = ['a', 'b', 'c', 'd']
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(r.pick(items))
    }
  })

  test('shuffle returns a permutation (same length, same multiset)', () => {
    const r = mulberry32(1)
    const items = [1, 2, 3, 4, 5]
    const shuffled = r.shuffle(items)
    expect(shuffled.length).toBe(items.length)
    expect([...shuffled].sort()).toEqual([...items].sort())
  })

  test('shuffle does not mutate the input', () => {
    const r = mulberry32(2)
    const items = [1, 2, 3, 4, 5]
    const ref = [...items]
    r.shuffle(items)
    expect(items).toEqual(ref)
  })
})
```

- [ ] **Step 3: Run test to confirm failure**

```powershell
rtk npx vitest run api/services/wmi/concepts/rng.test.ts
```

Expected: `Cannot find module './rng.js'` or similar.

- [ ] **Step 4: Implement RNG**

Create `api/services/wmi/concepts/rng.ts`:

```typescript
import type { Rng } from './types.js'

// Public-domain mulberry32; tiny, deterministic, sufficient for question generation.
function mulberry32Raw(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function mulberry32(seed: number): Rng {
  const next = mulberry32Raw(seed)

  function int(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive < minInclusive) {
      throw new Error('rng.int: max < min')
    }
    const span = maxInclusive - minInclusive + 1
    return minInclusive + Math.floor(next() * span)
  }

  function pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('rng.pick: empty array')
    return items[int(0, items.length - 1)]
  }

  function shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  return { int, pick, shuffle }
}
```

- [ ] **Step 5: Run test to confirm pass**

```powershell
rtk npx vitest run api/services/wmi/concepts/rng.test.ts
```

Expected: `5 passed`.

- [ ] **Step 6: Typecheck and commit**

```powershell
rtk npm run check
```

Expected: clean.

```bash
rtk git add api/services/wmi/concepts/types.ts api/services/wmi/concepts/rng.ts api/services/wmi/concepts/rng.test.ts
rtk git commit -m "feat(wmi): concept types + seedable RNG (mulberry32)"
```

---

## Task 3: First concept — count-objects (reference)

This task establishes the per-concept pattern. Subsequent concept tasks will follow exactly this shape with smaller commits.

**Files:**
- Create: `api/services/wmi/concepts/count-objects/index.ts`
- Create: `api/services/wmi/concepts/count-objects/index.test.ts`

- [ ] **Step 1: Write the test first**

Create `api/services/wmi/concepts/count-objects/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('count-objects', () => {
  test('determinism: same seed → same params', () => {
    expect(concept.generate(mulberry32(42))).toEqual(concept.generate(mulberry32(42)))
  })

  test('100 seeds produce schema-valid params + correct answers', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const params = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(params)).not.toThrow()
      const rendered = concept.render(params)
      expect(rendered.answer).toBe(String(params.n))
    }
  })

  test('MC: choices contain the answer label, all four labels distinct', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = concept.render(concept.generate(mulberry32(seed)))
      expect(r.answer_type).toBe('multiple_choice')
      const labels = (r.choices_en ?? []).map((c) => c.label)
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
    }
  })

  test('grades include 0', () => {
    expect(concept.meta.grades).toContain(0)
  })
})
```

- [ ] **Step 2: Run test, confirm failure**

```powershell
rtk npx vitest run api/services/wmi/concepts/count-objects/index.test.ts
```

Expected: missing module error.

- [ ] **Step 3: Implement the concept**

Create `api/services/wmi/concepts/count-objects/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  n: z.number().int().min(2).max(9),
  kind: z.enum(['apel', 'bola', 'bintang', 'kucing']),
})
export type Params = z.infer<typeof paramsSchema>

const KIND_EN: Record<Params['kind'], string> = {
  apel: 'apples',
  bola: 'balls',
  bintang: 'stars',
  kucing: 'cats',
}

export const meta = {
  slug: 'count-objects',
  name_en: 'Counting objects',
  name_id: 'Menghitung benda',
  grades: [0] as const,
  description_id: 'Hitung benda yang muncul di gambar.',
} as const

export function generate(rng: Rng): Params {
  return {
    n: rng.int(2, 9),
    kind: rng.pick(['apel', 'bola', 'bintang', 'kucing'] as const),
  }
}

export function render(params: Params) {
  const n = params.n
  // Distractors: n-1, n+1, n+2 (clipped to >=1, distinct)
  const distractors = [n - 1, n + 1, n + 2].filter((v) => v >= 1 && v !== n)
  const labels = ['A', 'B', 'C', 'D'] as const
  const valuePool = [n, ...distractors].slice(0, 4)
  // Ensure 4 entries: if clipping removed a distractor, top up with n+3
  while (valuePool.length < 4) valuePool.push(valuePool[valuePool.length - 1] + 1)
  const choicesEN = labels.map((label, i) => ({ label, text: String(valuePool[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(valuePool[i]) }))
  const answerLabel = labels[valuePool.indexOf(n)]

  return {
    body_en: `How many ${KIND_EN[params.kind]} do you see?`,
    body_id: `Ada berapa ${params.kind} yang kamu lihat?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'Count one at a time, point at each object.',
    hint_id: 'Hitung satu per satu, tunjuk tiap benda.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test, confirm pass**

```powershell
rtk npx vitest run api/services/wmi/concepts/count-objects/index.test.ts
```

Expected: `4 passed`.

- [ ] **Step 5: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
rtk git add api/services/wmi/concepts/count-objects/
rtk git commit -m "feat(wmi): concept count-objects (Grade 0, MC + illustration)"
```

---

## Task 4: Concept single-digit-addition

**Files:**
- Create: `api/services/wmi/concepts/single-digit-addition/index.ts`
- Create: `api/services/wmi/concepts/single-digit-addition/index.test.ts`

- [ ] **Step 1: Write the test**

Create `api/services/wmi/concepts/single-digit-addition/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('single-digit-addition', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: params valid + answer = a + b', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.a + p.b))
    }
  })

  test('grades include 1 and 2', () => {
    expect(concept.meta.grades).toContain(1)
    expect(concept.meta.grades).toContain(2)
  })
})
```

- [ ] **Step 2: Run test (fails)**

```powershell
rtk npx vitest run api/services/wmi/concepts/single-digit-addition/
```

- [ ] **Step 3: Implement**

Create `api/services/wmi/concepts/single-digit-addition/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(1).max(9),
  b: z.number().int().min(1).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'single-digit-addition',
  name_en: 'Single-digit addition',
  name_id: 'Penjumlahan satu angka',
  grades: [1, 2] as const,
  description_id: 'Latihan menambah dua angka satuan.',
} as const

export function generate(rng: Rng): Params {
  return { a: rng.int(1, 9), b: rng.int(1, 9) }
}

export function render(params: Params) {
  return {
    body_en: `What is ${params.a} + ${params.b}?`,
    body_id: `Berapa ${params.a} + ${params.b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.a + params.b),
    hint_en: 'Count up from the larger number.',
    hint_id: 'Hitung naik dari angka yang lebih besar.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test (passes)**

```powershell
rtk npx vitest run api/services/wmi/concepts/single-digit-addition/
```

Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
rtk git add api/services/wmi/concepts/single-digit-addition/
rtk git commit -m "feat(wmi): concept single-digit-addition (Grade 1-2, fill-in)"
```

---

## Task 5: Concept single-digit-subtraction

**Files:**
- Create: `api/services/wmi/concepts/single-digit-subtraction/index.ts`
- Create: `api/services/wmi/concepts/single-digit-subtraction/index.test.ts`

- [ ] **Step 1: Write the test**

Create `api/services/wmi/concepts/single-digit-subtraction/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('single-digit-subtraction', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('100 seeds: a > b, answer = a - b, answer >= 1', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.a).toBeGreaterThan(p.b)
      const r = concept.render(p)
      expect(Number(r.answer)).toBeGreaterThanOrEqual(1)
      expect(r.answer).toBe(String(p.a - p.b))
    }
  })
})
```

- [ ] **Step 2: Run test (fails)**

```powershell
rtk npx vitest run api/services/wmi/concepts/single-digit-subtraction/
```

- [ ] **Step 3: Implement**

Create `api/services/wmi/concepts/single-digit-subtraction/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(2).max(9),
  b: z.number().int().min(1).max(8),
}).refine((v) => v.a > v.b, { message: 'a must be > b' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'single-digit-subtraction',
  name_en: 'Single-digit subtraction',
  name_id: 'Pengurangan satu angka',
  grades: [1, 2] as const,
  description_id: 'Latihan mengurangi dua angka satuan.',
} as const

export function generate(rng: Rng): Params {
  const a = rng.int(2, 9)
  const b = rng.int(1, a - 1)
  return { a, b }
}

export function render(params: Params) {
  return {
    body_en: `What is ${params.a} − ${params.b}?`,
    body_id: `Berapa ${params.a} − ${params.b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.a - params.b),
    hint_en: 'Count down from the larger number.',
    hint_id: 'Hitung mundur dari angka yang lebih besar.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test (passes)**

```powershell
rtk npx vitest run api/services/wmi/concepts/single-digit-subtraction/
```

Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
rtk git add api/services/wmi/concepts/single-digit-subtraction/
rtk git commit -m "feat(wmi): concept single-digit-subtraction (Grade 1-2, fill-in)"
```

---

## Task 6: Concept pattern-next

**Files:**
- Create: `api/services/wmi/concepts/pattern-next/index.ts`
- Create: `api/services/wmi/concepts/pattern-next/index.test.ts`

- [ ] **Step 1: Write the test**

Create `api/services/wmi/concepts/pattern-next/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('pattern-next', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(3))).toEqual(concept.generate(mulberry32(3)))
  })

  test('100 seeds: sequence is arithmetic, answer label is in choices', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const expected = p.start + 3 * p.step
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const labels = (r.choices_en ?? []).map((c) => c.label)
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(answerChoice?.text).toBe(String(expected))
    }
  })
})
```

- [ ] **Step 2: Run test (fails)**

```powershell
rtk npx vitest run api/services/wmi/concepts/pattern-next/
```

- [ ] **Step 3: Implement**

Create `api/services/wmi/concepts/pattern-next/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  start: z.number().int().min(1).max(9),
  step: z.number().int().min(1).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'pattern-next',
  name_en: 'Next in pattern',
  name_id: 'Pola berikutnya',
  grades: [1, 2] as const,
  description_id: 'Tebak angka berikutnya dalam sebuah pola.',
} as const

export function generate(rng: Rng): Params {
  return { start: rng.int(1, 9), step: rng.int(1, 3) }
}

export function render(params: Params) {
  const seq = [0, 1, 2].map((i) => params.start + i * params.step)
  const correct = params.start + 3 * params.step
  // Distractors: correct ± 1, correct + step+1
  const distractors = [correct - 1, correct + 1, correct + params.step + 1].filter(
    (v) => v !== correct && v > 0,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const answerLabel = labels[values.indexOf(correct)]
  const seqText = seq.join(', ')

  return {
    body_en: `What number comes next? ${seqText}, ?`,
    body_id: `Berapa angka berikutnya? ${seqText}, ?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'Look at the difference between consecutive numbers.',
    hint_id: 'Lihat selisih antara angka yang berurutan.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test (passes)**

```powershell
rtk npx vitest run api/services/wmi/concepts/pattern-next/
```

Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
rtk git add api/services/wmi/concepts/pattern-next/
rtk git commit -m "feat(wmi): concept pattern-next (Grade 1-2, MC)"
```

---

## Task 7: Concept digit-sum

**Files:**
- Create: `api/services/wmi/concepts/digit-sum/index.ts`
- Create: `api/services/wmi/concepts/digit-sum/index.test.ts`

- [ ] **Step 1: Write the test**

Create `api/services/wmi/concepts/digit-sum/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('digit-sum', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(5))).toEqual(concept.generate(mulberry32(5)))
  })

  test('100 seeds: n in [10,99], answer is sum of digits', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.n).toBeGreaterThanOrEqual(10)
      expect(p.n).toBeLessThanOrEqual(99)
      const r = concept.render(p)
      const expected = Math.floor(p.n / 10) + (p.n % 10)
      expect(r.answer).toBe(String(expected))
    }
  })
})
```

- [ ] **Step 2: Run test (fails)**

- [ ] **Step 3: Implement**

Create `api/services/wmi/concepts/digit-sum/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  n: z.number().int().min(10).max(99),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'digit-sum',
  name_en: 'Sum of digits',
  name_id: 'Jumlah angka',
  grades: [1, 2] as const,
  description_id: 'Jumlahkan setiap angka dalam suatu bilangan.',
} as const

export function generate(rng: Rng): Params {
  return { n: rng.int(10, 99) }
}

export function render(params: Params) {
  const tens = Math.floor(params.n / 10)
  const ones = params.n % 10
  const sum = tens + ones
  return {
    body_en: `What is the sum of the [[digit|digits]] of ${params.n}?`,
    body_id: `Berapa [[sum|jumlah]] dari [[digit|angka-angka]] pada bilangan ${params.n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(sum),
    hint_en: 'Add the two digits.',
    hint_id: 'Jumlahkan kedua angka.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test (passes)**

```powershell
rtk npx vitest run api/services/wmi/concepts/digit-sum/
```

- [ ] **Step 5: Commit**

```bash
rtk git add api/services/wmi/concepts/digit-sum/
rtk git commit -m "feat(wmi): concept digit-sum (Grade 1-2, fill-in)"
```

---

## Task 8: Concept shape-perimeter-square

**Files:**
- Create: `api/services/wmi/concepts/shape-perimeter-square/index.ts`
- Create: `api/services/wmi/concepts/shape-perimeter-square/index.test.ts`

- [ ] **Step 1: Write the test**

Create `api/services/wmi/concepts/shape-perimeter-square/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('shape-perimeter-square', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(13))).toEqual(concept.generate(mulberry32(13)))
  })

  test('100 seeds: side in [2,9], answer is 4*side, MC valid', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.side).toBeGreaterThanOrEqual(2)
      expect(p.side).toBeLessThanOrEqual(9)
      const r = concept.render(p)
      const labels = (r.choices_en ?? []).map((c) => c.label)
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(answerChoice?.text).toBe(String(p.side * 4))
    }
  })
})
```

- [ ] **Step 2: Run test (fails)**

- [ ] **Step 3: Implement**

Create `api/services/wmi/concepts/shape-perimeter-square/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  side: z.number().int().min(2).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'shape-perimeter-square',
  name_en: 'Perimeter of a square',
  name_id: 'Keliling persegi',
  grades: [2, 3] as const,
  description_id: 'Hitung keliling persegi dari panjang sisinya.',
} as const

export function generate(rng: Rng): Params {
  return { side: rng.int(2, 9) }
}

export function render(params: Params) {
  const correct = params.side * 4
  const distractors = [correct - 1, correct + 1, params.side * 2].filter(
    (v) => v > 0 && v !== correct,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 2)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const answerLabel = labels[values.indexOf(correct)]

  return {
    body_en: `What is the [[perimeter]] of a square with side ${params.side}?`,
    body_id: `Berapa [[perimeter|keliling]] dari persegi dengan sisi ${params.side}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'Add up all four sides.',
    hint_id: 'Jumlahkan keempat sisi.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test (passes)**

```powershell
rtk npx vitest run api/services/wmi/concepts/shape-perimeter-square/
```

- [ ] **Step 5: Commit**

```bash
rtk git add api/services/wmi/concepts/shape-perimeter-square/
rtk git commit -m "feat(wmi): concept shape-perimeter-square (Grade 2-3, MC + illustration)"
```

---

## Task 9: Concept place-value

**Files:**
- Create: `api/services/wmi/concepts/place-value/index.ts`
- Create: `api/services/wmi/concepts/place-value/index.test.ts`

- [ ] **Step 1: Write the test**

Create `api/services/wmi/concepts/place-value/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('place-value', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(17))).toEqual(concept.generate(mulberry32(17)))
  })

  test('100 seeds: n in [10,99], answer = tens digit * 10', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const tens = Math.floor(p.n / 10) * 10
      const r = concept.render(p)
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(answerChoice?.text).toBe(String(tens))
    }
  })
})
```

- [ ] **Step 2: Run test (fails)**

- [ ] **Step 3: Implement**

Create `api/services/wmi/concepts/place-value/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  n: z.number().int().min(10).max(99),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'place-value',
  name_en: 'Place value (tens)',
  name_id: 'Nilai tempat (puluhan)',
  grades: [2, 3] as const,
  description_id: 'Cari nilai angka di tempat puluhan.',
} as const

export function generate(rng: Rng): Params {
  return { n: rng.int(10, 99) }
}

export function render(params: Params) {
  const tensDigit = Math.floor(params.n / 10)
  const ones = params.n % 10
  const correct = tensDigit * 10
  const distractors = [tensDigit, ones, params.n - correct + 1].filter(
    (v) => v !== correct && v > 0,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const answerLabel = labels[values.indexOf(correct)]

  return {
    body_en: `In the number ${params.n}, what is the value of the tens digit?`,
    body_id: `Pada bilangan ${params.n}, berapa nilai angka di tempat puluhan?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'The tens digit is the one on the left in a two-digit number.',
    hint_id: 'Angka puluhan adalah angka di kiri pada bilangan dua angka.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test (passes)**

```powershell
rtk npx vitest run api/services/wmi/concepts/place-value/
```

- [ ] **Step 5: Commit**

```bash
rtk git add api/services/wmi/concepts/place-value/
rtk git commit -m "feat(wmi): concept place-value (Grade 2-3, MC)"
```

---

## Task 10: Concept multiplication-small

**Files:**
- Create: `api/services/wmi/concepts/multiplication-small/index.ts`
- Create: `api/services/wmi/concepts/multiplication-small/index.test.ts`

- [ ] **Step 1: Write the test**

Create `api/services/wmi/concepts/multiplication-small/index.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('multiplication-small', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(19))).toEqual(concept.generate(mulberry32(19)))
  })

  test('100 seeds: a,b in [2,5], answer = a*b', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.a).toBeGreaterThanOrEqual(2)
      expect(p.a).toBeLessThanOrEqual(5)
      expect(p.b).toBeGreaterThanOrEqual(2)
      expect(p.b).toBeLessThanOrEqual(5)
      const r = concept.render(p)
      expect(r.answer).toBe(String(p.a * p.b))
    }
  })
})
```

- [ ] **Step 2: Run test (fails)**

- [ ] **Step 3: Implement**

Create `api/services/wmi/concepts/multiplication-small/index.ts`:

```typescript
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(2).max(5),
  b: z.number().int().min(2).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'multiplication-small',
  name_en: 'Small multiplication',
  name_id: 'Perkalian kecil',
  grades: [3] as const,
  description_id: 'Latihan tabel perkalian 2 sampai 5.',
} as const

export function generate(rng: Rng): Params {
  return { a: rng.int(2, 5), b: rng.int(2, 5) }
}

export function render(params: Params) {
  return {
    body_en: `What is ${params.a} × ${params.b}?`,
    body_id: `Berapa ${params.a} × ${params.b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.a * params.b),
    hint_en: 'Add the first number to itself that many times.',
    hint_id: 'Tambahkan angka pertama sebanyak angka kedua.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Run test (passes)**

```powershell
rtk npx vitest run api/services/wmi/concepts/multiplication-small/
```

- [ ] **Step 5: Run all concept tests together**

```powershell
rtk npx vitest run api/services/wmi/concepts/
```

Expected: 8 concept test files passing (`count-objects`, `single-digit-addition`, `single-digit-subtraction`, `pattern-next`, `digit-sum`, `shape-perimeter-square`, `place-value`, `multiplication-small`), plus `rng.test.ts` = 9 files total.

- [ ] **Step 6: Commit**

```bash
rtk git add api/services/wmi/concepts/multiplication-small/
rtk git commit -m "feat(wmi): concept multiplication-small (Grade 3, fill-in)"
```

---

## Task 11: Concept registry

**Files:**
- Create: `api/services/wmi/concepts/registry.ts`

- [ ] **Step 1: Write the registry**

Create `api/services/wmi/concepts/registry.ts`:

```typescript
import countObjects from './count-objects/index.js'
import singleDigitAddition from './single-digit-addition/index.js'
import singleDigitSubtraction from './single-digit-subtraction/index.js'
import patternNext from './pattern-next/index.js'
import digitSum from './digit-sum/index.js'
import shapePerimeterSquare from './shape-perimeter-square/index.js'
import placeValue from './place-value/index.js'
import multiplicationSmall from './multiplication-small/index.js'
import type { ConceptLogic } from './types.js'

export const CONCEPTS = {
  'count-objects': countObjects,
  'single-digit-addition': singleDigitAddition,
  'single-digit-subtraction': singleDigitSubtraction,
  'pattern-next': patternNext,
  'digit-sum': digitSum,
  'shape-perimeter-square': shapePerimeterSquare,
  'place-value': placeValue,
  'multiplication-small': multiplicationSmall,
} as const

export type ConceptSlug = keyof typeof CONCEPTS

export function getConcept(slug: string): ConceptLogic<unknown> | undefined {
  return (CONCEPTS as Record<string, ConceptLogic<unknown>>)[slug]
}

export const ALL_SLUGS = Object.keys(CONCEPTS) as ConceptSlug[]
```

- [ ] **Step 2: Typecheck**

```powershell
rtk npm run check
```

Expected: clean. All 8 concept modules resolve.

- [ ] **Step 3: Commit**

```bash
rtk git add api/services/wmi/concepts/registry.ts
rtk git commit -m "feat(wmi): concept registry (8 starter concepts)"
```

---

## Task 12: Bootstrap (lazy promise + seed)

**Files:**
- Create: `api/services/wmi/concepts/bootstrap.ts`

- [ ] **Step 1: Implement bootstrap**

Create `api/services/wmi/concepts/bootstrap.ts`:

```typescript
import { query, queryOne, withTransaction } from '../../../db.js'
import { ALL_SLUGS, CONCEPTS } from './registry.js'
import { mulberry32 } from './rng.js'
import type { ConceptLogic } from './types.js'

const SEED_COUNT = 20

let bootstrapPromise: Promise<void> | null = null

export function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = doBootstrap().catch((err) => {
      // Reset on failure so the next request retries from scratch.
      bootstrapPromise = null
      throw err
    })
  }
  return bootstrapPromise
}

async function doBootstrap(): Promise<void> {
  await upsertConcepts()
  for (const slug of ALL_SLUGS) {
    await seedConcept(slug, CONCEPTS[slug] as ConceptLogic<unknown>)
  }
}

async function upsertConcepts(): Promise<void> {
  await withTransaction(async (client) => {
    for (const slug of ALL_SLUGS) {
      const c = CONCEPTS[slug]
      await client.query(
        `
        INSERT INTO wmi_concepts (slug, name_en, name_id, description_id, grades)
        VALUES ($1, $2, $3, $4, $5::SMALLINT[])
        ON CONFLICT (slug) DO UPDATE SET
          name_en = EXCLUDED.name_en,
          name_id = EXCLUDED.name_id,
          description_id = EXCLUDED.description_id,
          grades = EXCLUDED.grades,
          updated_at = NOW()
        `,
        [
          c.meta.slug,
          c.meta.name_en,
          c.meta.name_id,
          c.meta.description_id ?? null,
          c.meta.grades as readonly number[],
        ],
      )
    }
  })
}

async function seedConcept(slug: string, concept: ConceptLogic<unknown>): Promise<void> {
  for (let seed = 1; seed <= SEED_COUNT; seed++) {
    try {
      const params = concept.generate(mulberry32(seed))
      concept.paramsSchema.parse(params)
      const r = concept.render(params)
      await query(
        `
        INSERT INTO wmi_concept_instances
          (concept_slug, params, body_en, body_id, answer_type,
           choices_en, choices_id, answer, hint_en, hint_id)
        VALUES ($1, $2::jsonb, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
        ON CONFLICT (concept_slug, params) DO NOTHING
        `,
        [
          slug,
          JSON.stringify(params),
          r.body_en,
          r.body_id,
          r.answer_type,
          r.choices_en ? JSON.stringify(r.choices_en) : null,
          r.choices_id ? JSON.stringify(r.choices_id) : null,
          r.answer,
          r.hint_en,
          r.hint_id,
        ],
      )
    } catch (err) {
      console.error(`bootstrap seed failed for ${slug} seed=${seed}:`, err)
      // Continue — one bad seed doesn't block the rest of the concept's pool
    }
  }
}

// Test-only: reset the latch between integration tests
export function _resetBootstrapForTesting(): void {
  bootstrapPromise = null
}

// Test-only: count instances per concept
export async function _instanceCountsForTesting(): Promise<Record<string, number>> {
  const rows = await query<{ slug: string; n: string }>(
    `SELECT concept_slug AS slug, count(*)::text AS n
     FROM wmi_concept_instances GROUP BY concept_slug`,
  )
  return Object.fromEntries(rows.map((r) => [r.slug, Number(r.n)]))
}

// Used by tests; not exported in product code paths but harmless.
void queryOne
```

- [ ] **Step 2: Smoke-test bootstrap against local dev DB**

```powershell
rtk npx tsx -e "import('./api/services/wmi/concepts/bootstrap.js').then(async (m) => { await m.ensureBootstrapped(); const c = await m._instanceCountsForTesting(); console.log(c); }).catch((e) => { console.error(e); process.exit(1); })"
```

Expected output: an object with all 8 slug keys and counts of 20 each (or less if some seed indices produce dupes, but should be 18-20 each).

- [ ] **Step 3: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
rtk git add api/services/wmi/concepts/bootstrap.ts
rtk git commit -m "feat(wmi): lazy bootstrap (upsert concepts + seed 20/concept)"
```

---

## Task 13: Engine — concept and instance pickers

**Files:**
- Create: `api/services/wmi/concepts/engine.ts`

- [ ] **Step 1: Implement engine read paths**

Create `api/services/wmi/concepts/engine.ts`:

```typescript
import { query, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { CONCEPTS, getConcept } from './registry.js'
import { mulberry32 } from './rng.js'
import { ensureBootstrapped } from './bootstrap.js'
import type { ConceptLogic } from './types.js'

export interface ConceptQuestion {
  concept_instance_id: string
  concept_slug: string
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: unknown
  choices_id: unknown
  hint_en: string | null
  hint_id: string | null
}

const MAX_DUPE_RETRIES = 5

export async function getNextConceptQuestion(
  parentUserId: string,
  childId: string,
): Promise<ConceptQuestion> {
  await ensureBootstrapped()

  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const kidRow = await queryOne<{ grade: number | null }>(
      'SELECT grade FROM children WHERE id = $1',
      [childId],
      client,
    )
    const grade = kidRow?.grade ?? 0

    const conceptRow = await queryOne<{ slug: string }>(
      `
      SELECT slug FROM wmi_concepts
      WHERE enabled = TRUE AND $1::SMALLINT = ANY(grades)
      ORDER BY random()
      LIMIT 1
      `,
      [grade],
      client,
    )
    if (!conceptRow) {
      throw new Error(`konsep belum tersedia untuk kelas ${grade}`)
    }
    const conceptSlug = conceptRow.slug

    const instance =
      (await pickExistingInstance(client, conceptSlug, childId)) ??
      (await generateAndPersist(client, conceptSlug)) ??
      (await fallbackOldestAttempted(client, conceptSlug, childId))

    if (!instance) {
      throw new Error(`tidak bisa membuat soal untuk konsep ${conceptSlug}`)
    }

    await client.query(
      'UPDATE wmi_concept_instances SET served_count = served_count + 1 WHERE id = $1',
      [instance.id],
    )
    await client.query(
      'UPDATE wmi_concepts SET total_served = total_served + 1 WHERE slug = $1',
      [conceptSlug],
    )

    return {
      concept_instance_id: instance.id,
      concept_slug: conceptSlug,
      params: instance.params,
      body_en: instance.body_en,
      body_id: instance.body_id,
      answer_type: instance.answer_type,
      choices_en: instance.choices_en,
      choices_id: instance.choices_id,
      hint_en: instance.hint_en,
      hint_id: instance.hint_id,
    }
  })
}

interface InstanceRow {
  id: string
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: unknown
  choices_id: unknown
  hint_en: string | null
  hint_id: string | null
}

async function pickExistingInstance(
  client: import('pg').PoolClient,
  conceptSlug: string,
  childId: string,
): Promise<InstanceRow | null> {
  return queryOne<InstanceRow>(
    `
    SELECT i.id, i.params, i.body_en, i.body_id, i.answer_type,
           i.choices_en, i.choices_id, i.hint_en, i.hint_id
    FROM wmi_concept_instances i
    LEFT JOIN wmi_attempts a
      ON a.concept_instance_id = i.id AND a.child_id = $2
    WHERE i.concept_slug = $1
      AND i.is_culled = FALSE
      AND a.id IS NULL
    ORDER BY i.served_count ASC, random()
    LIMIT 1
    `,
    [conceptSlug, childId],
    client,
  )
}

async function generateAndPersist(
  client: import('pg').PoolClient,
  conceptSlug: string,
): Promise<InstanceRow | null> {
  const concept = getConcept(conceptSlug) as ConceptLogic<unknown> | undefined
  if (!concept) return null

  for (let i = 0; i < MAX_DUPE_RETRIES; i++) {
    const seed = Math.floor(Math.random() * 2_000_000_000)
    let params: unknown
    try {
      params = concept.generate(mulberry32(seed))
      concept.paramsSchema.parse(params)
    } catch (err) {
      console.error(`generator failed for ${conceptSlug} seed=${seed}:`, err)
      continue
    }
    const r = concept.render(params)
    const row = await queryOne<InstanceRow>(
      `
      INSERT INTO wmi_concept_instances
        (concept_slug, params, body_en, body_id, answer_type,
         choices_en, choices_id, answer, hint_en, hint_id)
      VALUES ($1, $2::jsonb, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
      ON CONFLICT (concept_slug, params) DO NOTHING
      RETURNING id, params, body_en, body_id, answer_type,
                choices_en, choices_id, hint_en, hint_id
      `,
      [
        conceptSlug,
        JSON.stringify(params),
        r.body_en,
        r.body_id,
        r.answer_type,
        r.choices_en ? JSON.stringify(r.choices_en) : null,
        r.choices_id ? JSON.stringify(r.choices_id) : null,
        r.answer,
        r.hint_en,
        r.hint_id,
      ],
      client,
    )
    if (row) return row
  }
  return null
}

async function fallbackOldestAttempted(
  client: import('pg').PoolClient,
  conceptSlug: string,
  childId: string,
): Promise<InstanceRow | null> {
  return queryOne<InstanceRow>(
    `
    SELECT i.id, i.params, i.body_en, i.body_id, i.answer_type,
           i.choices_en, i.choices_id, i.hint_en, i.hint_id
    FROM wmi_concept_instances i
    JOIN wmi_attempts a
      ON a.concept_instance_id = i.id AND a.child_id = $2
    WHERE i.concept_slug = $1 AND i.is_culled = FALSE
    ORDER BY a.created_at ASC
    LIMIT 1
    `,
    [conceptSlug, childId],
    client,
  )
}

void CONCEPTS // keep the import alive for tree-shake awareness
```

- [ ] **Step 2: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
rtk git add api/services/wmi/concepts/engine.ts
rtk git commit -m "feat(wmi): concept engine — pick concept + serve/generate instance"
```

---

## Task 14: Engine — vote handling

**Files:**
- Modify: `api/services/wmi/concepts/engine.ts` (append vote handler)

- [ ] **Step 1: Append the vote handler**

Append to `api/services/wmi/concepts/engine.ts`:

```typescript
export async function submitConceptVote(
  parentUserId: string,
  childId: string,
  conceptInstanceId: string,
  vote: 1 | -1,
): Promise<{ upvotes: number; downvotes: number }> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const instance = await queryOne<{ concept_slug: string }>(
      'SELECT concept_slug FROM wmi_concept_instances WHERE id = $1',
      [conceptInstanceId],
      client,
    )
    if (!instance) throw new Error('Question not found')

    const previous = await queryOne<{ vote: number }>(
      `SELECT vote FROM wmi_concept_votes
       WHERE child_id = $1 AND concept_instance_id = $2`,
      [childId, conceptInstanceId],
      client,
    )
    const previousVote = previous?.vote ?? null

    await client.query(
      `
      INSERT INTO wmi_concept_votes (child_id, concept_instance_id, vote)
      VALUES ($1, $2, $3)
      ON CONFLICT (child_id, concept_instance_id)
      DO UPDATE SET vote = EXCLUDED.vote, voted_at = NOW()
      `,
      [childId, conceptInstanceId, vote],
    )

    const counts = await queryOne<{ upvotes: string; downvotes: string }>(
      `
      UPDATE wmi_concept_instances
      SET upvotes   = (SELECT count(*) FROM wmi_concept_votes
                       WHERE concept_instance_id = $1 AND vote = 1),
          downvotes = (SELECT count(*) FROM wmi_concept_votes
                       WHERE concept_instance_id = $1 AND vote = -1)
      WHERE id = $1
      RETURNING upvotes::text, downvotes::text
      `,
      [conceptInstanceId],
      client,
    )
    if (!counts) throw new Error('Question not found')

    // Adjust aggregate counters on wmi_concepts
    let upDelta = 0
    let downDelta = 0
    if (previousVote === null) {
      if (vote === 1) upDelta = 1
      else downDelta = 1
    } else if (previousVote === 1 && vote === -1) {
      upDelta = -1
      downDelta = 1
    } else if (previousVote === -1 && vote === 1) {
      upDelta = 1
      downDelta = -1
    }
    if (upDelta !== 0 || downDelta !== 0) {
      await client.query(
        `
        UPDATE wmi_concepts
        SET total_upvotes   = total_upvotes   + $2,
            total_downvotes = total_downvotes + $3
        WHERE slug = $1
        `,
        [instance.concept_slug, upDelta, downDelta],
      )
    }

    return { upvotes: Number(counts.upvotes), downvotes: Number(counts.downvotes) }
  })
}
```

- [ ] **Step 2: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
rtk git add api/services/wmi/concepts/engine.ts
rtk git commit -m "feat(wmi): concept engine — vote upsert + counter sync"
```

---

## Task 15: Engine integration tests

**Files:**
- Create: `api/services/wmi/concepts/engine.test.ts`

- [ ] **Step 1: Write the engine test**

Create `api/services/wmi/concepts/engine.test.ts`:

```typescript
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne, withTransaction } from '../../../db.js'
import { ensureBootstrapped, _resetBootstrapForTesting } from './bootstrap.js'
import { getNextConceptQuestion, submitConceptVote } from './engine.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('wmi concept engine', () => {
  let parentUserId: string
  let childId: string

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`engine-test-${tag}@example.com`, `Engine Test ${tag}`],
    )
    parentUserId = user!.id
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name, grade) VALUES ($1, $2, $3) RETURNING id`,
      [parentUserId, `Kid ${tag}`, 1],
    )
    childId = child!.id
  })

  afterAll(async () => {
    await pool.end()
  })

  test('serves an unculled instance for kid grade', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId)
    expect(q.concept_instance_id).toBeTruthy()
    expect(q.body_id).toBeTruthy()
    expect(q.answer_type === 'multiple_choice' || q.answer_type === 'fill_in').toBe(true)
  })

  test('does not return an answer field', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId) as Record<string, unknown>
    expect(q.answer).toBeUndefined()
  })

  test('throws when no concept for kid grade', async () => {
    await query(`UPDATE children SET grade = 99 WHERE id = $1`, [childId])
    await expect(getNextConceptQuestion(parentUserId, childId)).rejects.toThrow(
      /konsep belum tersedia/,
    )
  })

  test('vote upserts and recomputes counts', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId)
    const a = await submitConceptVote(parentUserId, childId, q.concept_instance_id, 1)
    expect(a.upvotes).toBeGreaterThanOrEqual(1)
    const b = await submitConceptVote(parentUserId, childId, q.concept_instance_id, -1)
    expect(b.downvotes).toBeGreaterThanOrEqual(1)
    expect(b.upvotes).toBe(a.upvotes - 1)
  })

  test('vote rejects unknown instance', async () => {
    await expect(
      submitConceptVote(parentUserId, childId, randomUUID(), 1),
    ).rejects.toThrow(/Question not found/)
  })

  test('vote rejects on child_id ownership mismatch', async () => {
    const otherUser = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`other-${randomUUID().slice(0,6)}@example.com`, 'Other'],
    )
    const q = await getNextConceptQuestion(parentUserId, childId)
    await expect(
      submitConceptVote(otherUser!.id, childId, q.concept_instance_id, 1),
    ).rejects.toThrow(/Child not found/)
  })

  test('crossing 5 votes with 3 downvotes flips is_culled', async () => {
    const q = await getNextConceptQuestion(parentUserId, childId)
    // Seed 5 votes total directly to test is_culled trigger
    for (let i = 0; i < 5; i++) {
      const tag = randomUUID().slice(0, 8)
      const u = await queryOne<{ id: string }>(
        `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
        [`v${i}-${tag}@example.com`, `V${i}`],
      )
      const c = await queryOne<{ id: string }>(
        `INSERT INTO children (parent_user_id, name, grade) VALUES ($1, $2, 1) RETURNING id`,
        [u!.id, `Kid V${i}`],
      )
      // 3 downvotes + 2 upvotes → cull
      const vote = i < 3 ? -1 : 1
      await submitConceptVote(u!.id, c!.id, q.concept_instance_id, vote)
    }
    const row = await queryOne<{ is_culled: boolean }>(
      'SELECT is_culled FROM wmi_concept_instances WHERE id = $1',
      [q.concept_instance_id],
    )
    expect(row?.is_culled).toBe(true)
  })
})
```

- [ ] **Step 2: Run engine tests (skipped without TEST_DATABASE_URL)**

```powershell
rtk npx vitest run api/services/wmi/concepts/engine.test.ts
```

Expected without `TEST_DATABASE_URL`: `7 skipped`.
With `TEST_DATABASE_URL` set: `7 passed`.

- [ ] **Step 3: Commit**

```bash
rtk git add api/services/wmi/concepts/engine.test.ts
rtk git commit -m "test(wmi): concept engine integration tests"
```

---

## Task 16: Expand attempts service to handle concept mode

**Files:**
- Modify: `api/services/wmi/attempts.ts`

- [ ] **Step 1: Branch the attempt submission on mode**

Open `api/services/wmi/attempts.ts`. Replace the `WmiAttemptInput` interface and `submitWmiAttempt` function with this expanded version (keep all other exports/imports unchanged):

```typescript
export interface WmiAttemptInput {
  childId: string
  questionId?: string
  conceptInstanceId?: string
  mode: 'drill' | 'exam' | 'concept'
  sessionId?: string | null
  selectedAnswer: string
  timeTakenMs?: number | null
  revealedIdTranslation?: boolean
  lookedUpTerms?: string[]
}

export async function submitWmiAttempt(
  parentUserId: string,
  input: WmiAttemptInput,
): Promise<WmiAttemptResult> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, input.childId)

    let answer: string
    let hint_en: string | null
    let hint_id: string | null

    if (input.mode === 'concept') {
      if (!input.conceptInstanceId) {
        throw new Error('conceptInstanceId is required for concept attempts')
      }
      if (input.questionId) {
        throw new Error('questionId must not be set when mode is concept')
      }
      const inst = await queryOne<{ answer: string; hint_en: string | null; hint_id: string | null }>(
        'SELECT answer, hint_en, hint_id FROM wmi_concept_instances WHERE id = $1',
        [input.conceptInstanceId],
        client,
      )
      if (!inst) throw new Error('Question not found')
      answer = inst.answer
      hint_en = inst.hint_en
      hint_id = inst.hint_id
    } else {
      if (!input.questionId) {
        throw new Error('questionId is required for drill/exam attempts')
      }
      if (input.conceptInstanceId) {
        throw new Error('conceptInstanceId must not be set when mode is drill/exam')
      }
      const question = await getWmiQuestionAnswer(input.questionId, client)
      if (!question) throw new Error('Question not found')
      answer = question.answer
      hint_en = question.hint_en
      hint_id = question.hint_id

      if (input.mode === 'exam') {
        if (!input.sessionId) throw new Error('sessionId is required for exam attempts')
        const session = await queryOne<{ id: string; child_id: string; completed_at: string | null }>(
          'SELECT id, child_id, completed_at FROM wmi_exam_sessions WHERE id = $1',
          [input.sessionId],
          client,
        )
        if (!session || session.child_id !== input.childId) {
          throw new Error('Sesi ujian ini milik profil anak yang lain')
        }
        if (session.completed_at) throw new Error('Exam session already completed')
      }
    }

    const correct = isCorrectAnswer(answer, input.selectedAnswer)
    const terms = input.lookedUpTerms ?? []

    if (input.mode === 'exam') {
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, question_id, mode, session_id, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (session_id, question_id)
          WHERE mode = 'exam' AND session_id IS NOT NULL
          DO UPDATE SET
            selected_answer = EXCLUDED.selected_answer,
            is_correct = EXCLUDED.is_correct,
            time_taken_ms = EXCLUDED.time_taken_ms,
            revealed_id_translation = EXCLUDED.revealed_id_translation,
            looked_up_terms = EXCLUDED.looked_up_terms,
            created_at = NOW()
        `,
        [
          input.childId,
          input.questionId,
          input.mode,
          input.sessionId,
          input.selectedAnswer,
          correct,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          terms,
        ],
      )
    } else if (input.mode === 'concept') {
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, concept_instance_id, mode, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, 'concept', $3, $4, $5, $6, $7)
        `,
        [
          input.childId,
          input.conceptInstanceId,
          input.selectedAnswer,
          correct,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          terms,
        ],
      )
    } else {
      await client.query(
        `
          INSERT INTO wmi_attempts
            (child_id, question_id, mode, selected_answer, is_correct,
             time_taken_ms, revealed_id_translation, looked_up_terms)
          VALUES ($1, $2, 'drill', $3, $4, $5, $6, $7)
        `,
        [
          input.childId,
          input.questionId,
          input.selectedAnswer,
          correct,
          input.timeTakenMs ?? null,
          input.revealedIdTranslation ?? false,
          terms,
        ],
      )
    }

    return { is_correct: correct, correct_answer: answer, hint_en, hint_id }
  })
}
```

- [ ] **Step 2: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
rtk git add api/services/wmi/attempts.ts
rtk git commit -m "feat(wmi): expand submitWmiAttempt to handle concept mode"
```

---

## Task 17: Route handler — GET /konsep/next, POST /konsep/vote, expanded attempts schema

**Files:**
- Modify: `api/routes/wmi-member.ts`

- [ ] **Step 1: Add imports and expand `attemptSchema`**

In `api/routes/wmi-member.ts`, add to imports near the top:

```typescript
import { getNextConceptQuestion, submitConceptVote } from '../services/wmi/concepts/engine.js'
```

Replace the existing `attemptSchema` definition with:

```typescript
const attemptSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  mode: Joi.string().valid('drill', 'exam', 'concept').required(),
  question_id: Joi.string()
    .uuid()
    .when('mode', {
      is: 'concept',
      then: Joi.forbidden(),
      otherwise: Joi.required(),
    }),
  concept_instance_id: Joi.string()
    .uuid()
    .when('mode', {
      is: 'concept',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  session_id: Joi.string()
    .uuid()
    .when('mode', {
      is: 'exam',
      then: Joi.required(),
      otherwise: Joi.allow(null).optional(),
    }),
  selected_answer: Joi.string().trim().min(1).max(200).required(),
  time_taken_ms: Joi.number().integer().min(0).allow(null).optional(),
  revealed_id_translation: Joi.boolean().optional(),
  looked_up_terms: Joi.array().items(Joi.string().pattern(/^[a-z0-9-]+$/)).default([]),
})
```

- [ ] **Step 2: Pass the new field through to the service**

Replace the body of the existing `/attempts` POST handler. Find:

```typescript
const attempt = await submitWmiAttempt(req.user.id, {
  childId: value.childId,
  questionId: value.question_id,
  mode: value.mode,
  sessionId: value.session_id,
  selectedAnswer: value.selected_answer,
  timeTakenMs: value.time_taken_ms,
  revealedIdTranslation: value.revealed_id_translation,
  lookedUpTerms: value.looked_up_terms,
})
```

Replace with:

```typescript
const attempt = await submitWmiAttempt(req.user.id, {
  childId: value.childId,
  questionId: value.question_id,
  conceptInstanceId: value.concept_instance_id,
  mode: value.mode,
  sessionId: value.session_id,
  selectedAnswer: value.selected_answer,
  timeTakenMs: value.time_taken_ms,
  revealedIdTranslation: value.revealed_id_translation,
  lookedUpTerms: value.looked_up_terms,
})
```

- [ ] **Step 3: Add the konsep/next and konsep/vote routes**

Add these two route handlers near the bottom of `wmi-member.ts`, before the `export default router` line:

```typescript
const voteSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  concept_instance_id: Joi.string().uuid().required(),
  vote: Joi.number().integer().valid(1, -1).required(),
})

router.get(
  '/konsep/next',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = childQuerySchema.validate(req.query)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const question = await getNextConceptQuestion(req.user.id, value.childId)
      res.json({ success: true, data: { question } })
    } catch (error) {
      console.error('WMI konsep next error:', error)
      sendError(res, error, 'Unable to load concept question')
    }
  },
)

router.post(
  '/konsep/vote',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = voteSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const counts = await submitConceptVote(
        req.user.id,
        value.childId,
        value.concept_instance_id,
        value.vote,
      )
      res.json({ success: true, data: counts })
    } catch (error) {
      console.error('WMI konsep vote error:', error)
      sendError(res, error, 'Unable to save vote')
    }
  },
)
```

- [ ] **Step 4: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 5: Smoke the endpoint via the dev server**

Start the API: `npm run server:dev` (in another shell). Then:

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3001/api/me/wmi/konsep/next
```

Expected: `HTTP 401` (no auth).

Stop the server (Ctrl-C or kill the background task).

- [ ] **Step 6: Commit**

```bash
rtk git add api/routes/wmi-member.ts
rtk git commit -m "feat(wmi): konsep/next + konsep/vote endpoints + expanded attempt schema"
```

---

## Task 18: HTTP integration tests

**Files:**
- Create: `api/__tests__/wmi/konsep.test.ts`

- [ ] **Step 1: Write the HTTP tests**

Create `api/__tests__/wmi/konsep.test.ts`:

```typescript
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { pool, query, queryOne } from '../../db.js'
import app from '../../app.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../../services/wmi/concepts/bootstrap.js'

import request from 'supertest'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('WMI konsep HTTP', () => {
  let parentUserId: string
  let childId: string
  let token: string

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`konsep-http-${tag}@example.com`, `HTTP Test ${tag}`],
    )
    parentUserId = user!.id
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name, grade) VALUES ($1, $2, $3) RETURNING id`,
      [parentUserId, `Kid ${tag}`, 1],
    )
    childId = child!.id
    token = jwt.sign({ id: parentUserId, email: `konsep-http-${tag}@example.com`, role: 'parent' }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  })

  afterAll(async () => {
    await pool.end()
  })

  test('GET /konsep/next requires auth', async () => {
    const res = await request(app).get('/api/me/wmi/konsep/next').query({ childId })
    expect(res.status).toBe(401)
  })

  test('GET /konsep/next requires childId', async () => {
    const res = await request(app)
      .get('/api/me/wmi/konsep/next')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })

  test('GET /konsep/next returns a question without leaking answer', async () => {
    const res = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId })
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.question.concept_instance_id).toBeTruthy()
    expect(res.body.data.question.answer).toBeUndefined()
  })

  test('POST /attempts mode=concept records an attempt', async () => {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId })
      .set('Authorization', `Bearer ${token}`)
    const instanceId = next.body.data.question.concept_instance_id
    const res = await request(app)
      .post('/api/me/wmi/attempts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        mode: 'concept',
        concept_instance_id: instanceId,
        selected_answer: '0',
      })
    expect(res.status).toBe(201)
    expect(typeof res.body.data.is_correct).toBe('boolean')
    expect(typeof res.body.data.correct_answer).toBe('string')

    const row = await queryOne<{ concept_instance_id: string; question_id: string | null }>(
      `SELECT concept_instance_id, question_id FROM wmi_attempts WHERE child_id = $1`,
      [childId],
    )
    expect(row?.concept_instance_id).toBe(instanceId)
    expect(row?.question_id).toBeNull()
  })

  test('POST /attempts rejects question_id when mode=concept', async () => {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId })
      .set('Authorization', `Bearer ${token}`)
    const instanceId = next.body.data.question.concept_instance_id
    const res = await request(app)
      .post('/api/me/wmi/attempts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        mode: 'concept',
        question_id: randomUUID(),
        concept_instance_id: instanceId,
        selected_answer: '0',
      })
    expect(res.status).toBe(400)
  })

  test('POST /konsep/vote upserts and returns counts', async () => {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId })
      .set('Authorization', `Bearer ${token}`)
    const instanceId = next.body.data.question.concept_instance_id
    const res = await request(app)
      .post('/api/me/wmi/konsep/vote')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, concept_instance_id: instanceId, vote: 1 })
    expect(res.status).toBe(200)
    expect(res.body.data.upvotes).toBeGreaterThanOrEqual(1)
  })

  test('POST /konsep/vote rejects invalid vote value', async () => {
    const res = await request(app)
      .post('/api/me/wmi/konsep/vote')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, concept_instance_id: randomUUID(), vote: 0 })
    expect(res.status).toBe(400)
  })

  test('GET /konsep/next returns 404 when grade has no concepts', async () => {
    await query(`UPDATE children SET grade = 99 WHERE id = $1`, [childId])
    const res = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId })
      .set('Authorization', `Bearer ${token}`)
    // sendError maps 'konsep belum tersedia' -> 400 by default in v1. Verify what the
    // existing sendError mapping does for this message; if it maps to 400, accept 400.
    expect([400, 404]).toContain(res.status)
  })
})
```

- [ ] **Step 2: Install supertest if not already in deps**

```powershell
rtk npm i -D supertest @types/supertest
```

Expected: installs `supertest` + `@types/supertest`.

- [ ] **Step 3: Run the HTTP tests**

```powershell
rtk npx vitest run api/__tests__/wmi/konsep.test.ts
```

Expected without `TEST_DATABASE_URL`: tests skipped.
Expected with `TEST_DATABASE_URL`: all pass.

- [ ] **Step 4: Commit**

```bash
rtk git add api/__tests__/wmi/konsep.test.ts package.json package-lock.json
rtk git commit -m "test(wmi): konsep HTTP integration suite"
```

---

## Task 19: Frontend types + API helpers

**Files:**
- Modify: `src/types/wmi.ts`
- Modify: `src/lib/wmiApi.ts`

- [ ] **Step 1: Add concept types**

In `src/types/wmi.ts`, change the WMI mode union from:

```typescript
export type WmiMode = 'drill' | 'exam'
```

to:

```typescript
export type WmiMode = 'drill' | 'exam' | 'concept'
```

Append to `src/types/wmi.ts`:

```typescript
export interface WmiConceptQuestion {
  concept_instance_id: string
  concept_slug: string
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  hint_en: string | null
  hint_id: string | null
}

export interface WmiConceptVoteResult {
  upvotes: number
  downvotes: number
}

export interface WmiConceptAttemptInput {
  childId: string
  concept_instance_id: string
  mode: 'concept'
  selected_answer: string
  time_taken_ms?: number
  revealed_id_translation?: boolean
  looked_up_terms?: string[]
}
```

If `WmiChoice` isn't already exported in `src/types/wmi.ts`, leave it alone — it should already exist from v1.

- [ ] **Step 2: Add API wrapper helpers**

In `src/lib/wmiApi.ts`, add the new concept types to the existing `import type { ... } from '../types/wmi'` block:

```typescript
  WmiConceptAttemptInput,
  WmiConceptQuestion,
  WmiConceptVoteResult,
```

Then append these helpers to the end of `src/lib/wmiApi.ts`:

```typescript

export async function fetchConceptNext(childId: string): Promise<WmiConceptQuestion> {
  const response = await api.get('/me/wmi/konsep/next', { params: { childId } })
  return unwrap<{ question: WmiConceptQuestion }>(response).question
}

export async function submitConceptVote(
  childId: string,
  conceptInstanceId: string,
  vote: 1 | -1,
): Promise<WmiConceptVoteResult> {
  const response = await api.post('/me/wmi/konsep/vote', {
    childId,
    concept_instance_id: conceptInstanceId,
    vote,
  })
  return unwrap<WmiConceptVoteResult>(response)
}

export async function submitConceptAttempt(input: WmiConceptAttemptInput): Promise<WmiAttemptResult> {
  const response = await api.post('/me/wmi/attempts', input)
  return unwrap<WmiAttemptResult>(response)
}
```

- [ ] **Step 3: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
rtk git add src/types/wmi.ts src/lib/wmiApi.ts
rtk git commit -m "feat(wmi): frontend types + API helpers for concept generator"
```

---

## Task 20: Vote buttons component + figure primitives

**Files:**
- Create: `src/components/wmi/WmiVoteButtons.tsx`
- Create: `src/components/wmi/figures/Square.tsx`
- Create: `src/components/wmi/figures/DotArray.tsx`

- [ ] **Step 1: Vote buttons component**

Create `src/components/wmi/WmiVoteButtons.tsx`:

```tsx
import { useState } from 'react'

interface WmiVoteButtonsProps {
  onVote: (vote: 1 | -1) => Promise<void>
}

export default function WmiVoteButtons({ onVote }: WmiVoteButtonsProps) {
  const [picked, setPicked] = useState<1 | -1 | null>(null)
  const [busy, setBusy] = useState(false)

  async function pick(v: 1 | -1) {
    if (busy) return
    setBusy(true)
    try {
      await onVote(v)
      setPicked(v)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => pick(1)}
        disabled={busy}
        className={`rounded-full px-4 py-2 text-2xl ${picked === 1 ? 'bg-qupu-cream' : 'bg-gray-100'} disabled:opacity-50`}
        aria-label="Suka soal ini"
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => pick(-1)}
        disabled={busy}
        className={`rounded-full px-4 py-2 text-2xl ${picked === -1 ? 'bg-qupu-cream' : 'bg-gray-100'} disabled:opacity-50`}
        aria-label="Tidak suka soal ini"
      >
        👎
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Square primitive**

Create `src/components/wmi/figures/Square.tsx`:

```tsx
interface SquareProps {
  side: number
  unit?: string
}

export default function Square({ side, unit }: SquareProps) {
  const size = 120
  const stroke = 4
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${size + stroke} ${size + stroke}`} width="160" height="160" role="img" aria-label={`Persegi sisi ${side}`}>
        <rect
          x={stroke / 2}
          y={stroke / 2}
          width={size}
          height={size}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-qupu-brand-blue"
        />
        <text
          x={(size + stroke) / 2}
          y={(size + stroke) / 2 + 5}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          className="fill-qupu-brand-blue"
        >
          {side}{unit ? ` ${unit}` : ''}
        </text>
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: DotArray primitive**

Create `src/components/wmi/figures/DotArray.tsx`:

```tsx
interface DotArrayProps {
  totalDots: number
  grouping?: number[]
}

export default function DotArray({ totalDots, grouping }: DotArrayProps) {
  const rows = grouping ?? [totalDots]
  const dotSize = 24
  return (
    <div className="my-4 flex flex-col items-center gap-2 rounded-lg border-2 border-qupu-cream-dark bg-white p-4">
      {rows.map((count, rowIdx) => (
        <div key={rowIdx} className="flex gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              style={{ width: dotSize, height: dotSize }}
              className="rounded-full bg-qupu-brand-blue"
              aria-hidden
            />
          ))}
        </div>
      ))}
      <span className="sr-only">{totalDots} dots</span>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/wmi/WmiVoteButtons.tsx src/components/wmi/figures/
rtk git commit -m "feat(wmi): vote buttons + Square/DotArray figure primitives"
```

---

## Task 21: Frontend illustration registry + per-concept illustrations

**Files:**
- Create: `src/components/wmi/concepts/registry.ts`
- Create: `src/components/wmi/concepts/count-objects.tsx`
- Create: `src/components/wmi/concepts/shape-perimeter-square.tsx`

- [ ] **Step 1: Per-concept illustrations**

Create `src/components/wmi/concepts/count-objects.tsx`:

```tsx
import DotArray from '../figures/DotArray'

interface CountObjectsParams {
  n: number
  kind: string
}

export default function CountObjectsIllustration({ params }: { params: unknown }) {
  const p = params as CountObjectsParams
  return <DotArray totalDots={p.n} />
}
```

Create `src/components/wmi/concepts/shape-perimeter-square.tsx`:

```tsx
import Square from '../figures/Square'

interface ShapePerimeterSquareParams {
  side: number
}

export default function ShapePerimeterSquareIllustration({ params }: { params: unknown }) {
  const p = params as ShapePerimeterSquareParams
  return <Square side={p.side} />
}
```

- [ ] **Step 2: Registry**

Create `src/components/wmi/concepts/registry.ts`:

```typescript
import type { ComponentType } from 'react'
import CountObjects from './count-objects'
import ShapePerimeterSquare from './shape-perimeter-square'

export const ILLUSTRATIONS: Record<string, ComponentType<{ params: unknown }>> = {
  'count-objects': CountObjects,
  'shape-perimeter-square': ShapePerimeterSquare,
}

export function getIllustration(slug: string): ComponentType<{ params: unknown }> | null {
  return ILLUSTRATIONS[slug] ?? null
}
```

- [ ] **Step 3: Typecheck**

```powershell
rtk npm run check
```

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/wmi/concepts/
rtk git commit -m "feat(wmi): frontend illustration registry + 2 starter illustrations"
```

---

## Task 22: WmiKonsepDrill page

**Files:**
- Create: `src/pages/WmiKonsepDrill.tsx`

- [ ] **Step 1: Implement the drill page**

Create `src/pages/WmiKonsepDrill.tsx`:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import WmiFeedbackPanel from '../components/wmi/WmiFeedbackPanel'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiVoteButtons from '../components/wmi/WmiVoteButtons'
import { getIllustration } from '../components/wmi/concepts/registry'
import { fetchConceptNext, submitConceptAttempt, submitConceptVote } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiAttemptResult, WmiConceptQuestion, WmiQuestion } from '../types/wmi'

export default function WmiKonsepDrill() {
  const { activeChildId } = useAuthStore()
  const { loadGlossary } = useWmiStore()
  const [question, setQuestion] = useState<WmiConceptQuestion | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiAttemptResult | null>(null)
  const [lookedUpTerms, setLookedUpTerms] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const askedAt = useRef(Date.now())

  const loadNext = useCallback(async () => {
    if (!activeChildId) return
    setSelected(null)
    setFeedback(null)
    setLookedUpTerms([])
    setRevealed(false)
    setError(null)
    try {
      const q = await fetchConceptNext(activeChildId)
      setQuestion(q)
      askedAt.current = Date.now()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat soal')
    }
  }, [activeChildId])

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    loadNext()
  }, [loadNext])

  const submit = async (answer: string) => {
    if (!activeChildId || !question || feedback) return
    setSelected(answer)
    try {
      const saved = await submitConceptAttempt({
        childId: activeChildId,
        concept_instance_id: question.concept_instance_id,
        mode: 'concept',
        selected_answer: answer,
        time_taken_ms: Date.now() - askedAt.current,
        revealed_id_translation: revealed,
        looked_up_terms: lookedUpTerms,
      })
      setFeedback(saved)
    } catch (err) {
      setSelected(null)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan jawaban')
    }
  }

  const onVote = async (vote: 1 | -1) => {
    if (!activeChildId || !question) return
    await submitConceptVote(activeChildId, question.concept_instance_id, vote)
  }

  if (!activeChildId) return <div className="p-6 text-center">Pilih profil anak dulu.</div>
  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!question) return <div className="p-6 text-center">Memuat soal...</div>

  const Illustration = getIllustration(question.concept_slug)

  // Adapt the question to WmiQuestionView's expected props.
  const adapted: WmiQuestion = {
    id: question.concept_instance_id,
    paper_id: '',
    number: 0,
    body_en: question.body_en,
    body_id: question.body_id,
    answer_type: question.answer_type,
    choices_en: question.choices_en,
    choices_id: question.choices_id,
    figure_url: null,
    hint_en: question.hint_en,
    hint_id: question.hint_id,
    difficulty: null,
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-qupu-brand-blue">Latihan Konsep</h1>
      </div>
      {Illustration && (
        <div className="mb-2">
          <Illustration params={question.params} />
        </div>
      )}
      <WmiQuestionView
        question={adapted}
        selectedChoice={selected}
        highlight={
          feedback
            ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
            : undefined
        }
        disabled={Boolean(feedback)}
        revealed={revealed}
        onPickChoice={submit}
        onSubmitFillIn={submit}
        onLookupTerm={(slug) => setLookedUpTerms((terms) => Array.from(new Set([...terms, slug])))}
        onRevealTranslation={() => setRevealed(true)}
      />
      {feedback && (
        <>
          <WmiFeedbackPanel
            isCorrect={feedback.is_correct}
            correctAnswer={feedback.correct_answer}
            hintEn={feedback.hint_en}
            hintId={feedback.hint_id}
            onNext={loadNext}
          />
          <WmiVoteButtons onVote={onVote} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```powershell
rtk npm run check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
rtk git add src/pages/WmiKonsepDrill.tsx
rtk git commit -m "feat(wmi): WmiKonsepDrill page"
```

---

## Task 23: Wire route + Hub card

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/WmiHub.tsx`

- [ ] **Step 1: Add the route**

In `src/App.tsx`, find the AppShell member route group (the block that already contains `latihan/wmi`, `latihan/wmi/drill`, etc.). Append the konsep route alongside them:

```tsx
<Route path="latihan/wmi/konsep" element={<WmiKonsepDrill />} />
```

Add the import at the top:

```typescript
import WmiKonsepDrill from './pages/WmiKonsepDrill'
```

- [ ] **Step 2: Add the hub card**

In `src/pages/WmiHub.tsx`, after the existing paper list area, add a new "Latihan Konsep" link card:

```tsx
<Link
  to="/latihan/wmi/konsep"
  className="mt-4 block rounded-xl border-2 border-qupu-cream-dark bg-white p-5 text-center font-bold text-qupu-brand-blue hover:bg-qupu-cream"
>
  🧠 Latihan Konsep
  <p className="mt-1 text-sm font-normal text-gray-600">
    Soal latihan otomatis untuk anak Grade 0–3.
  </p>
</Link>
```

If `Link` from `react-router-dom` isn't already imported there, add `import { Link } from 'react-router-dom'` near the top. The hub layout in v1 may differ — place the card wherever it visually fits next to the paper list.

- [ ] **Step 3: Typecheck and lint**

```powershell
rtk npm run check
rtk npm run lint
```

Both expected clean.

- [ ] **Step 4: Commit**

```bash
rtk git add src/App.tsx src/pages/WmiHub.tsx
rtk git commit -m "feat(wmi): mount /latihan/wmi/konsep route + hub card"
```

---

## Task 24: End-to-end manual smoke

**Files:** none (verification only)

- [ ] **Step 1: Apply migration if not yet applied**

If you haven't run the migration on your dev DB (Task 1 did it; this is a re-verify):

```powershell
rtk npx tsx -e "import('dotenv/config').then(async () => { const { readFileSync } = await import('node:fs'); const { Pool } = await import('pg'); const sql = readFileSync('db/migrations/0021_wmi_concepts.sql', 'utf8'); const p = new Pool({ connectionString: process.env.DATABASE_URL }); try { await p.query(sql); console.log('OK'); } finally { await p.end(); } })"
```

- [ ] **Step 2: Start dev**

```powershell
rtk npm run dev
```

Wait for both servers (client on 5173, API on 3001).

- [ ] **Step 3: Open browser, sign in as a member, walk the flow**

Open http://localhost:5173/latihan/wmi. The new "🧠 Latihan Konsep" card should appear. Tap it.

Verify on `/latihan/wmi/konsep`:
- A question loads (text + sometimes a figure for `count-objects` or `shape-perimeter-square`).
- Tap an answer (or type in for fill-in). Feedback panel shows.
- 👍/👎 buttons appear. Tap one. No error.
- Tap "Lanjut". A new question loads (likely from a different concept — system uniformly randoms among concepts enabled for your grade).
- Repeat ~10 times. Observe variety across concepts.

- [ ] **Step 4: Check the DB**

```powershell
rtk npx tsx -e "import('dotenv/config').then(async () => { const { Pool } = await import('pg'); const p = new Pool({ connectionString: process.env.DATABASE_URL }); try { const c = await p.query('SELECT slug, total_served, total_upvotes, total_downvotes FROM wmi_concepts ORDER BY total_served DESC'); console.log(c.rows); const i = await p.query('SELECT count(*)::int AS n FROM wmi_concept_instances'); console.log('instances:', i.rows[0].n); const a = await p.query(\"SELECT count(*)::int AS n FROM wmi_attempts WHERE mode='concept'\"); console.log('concept attempts:', a.rows[0].n); } finally { await p.end(); } })"
```

Expected: `wmi_concepts` table has 8 rows with `total_served > 0` on the ones you practiced; `wmi_concept_instances` has ~160 rows (8 concepts × 20 seeded); `wmi_attempts` shows your concept attempts.

- [ ] **Step 5: Stop dev server**

Ctrl-C the `rtk npm run dev` process.

- [ ] **Step 6: Final verification**

```powershell
rtk npm run check
rtk npm run lint
rtk npm test
```

All three expected clean.

- [ ] **Step 7: Commit the verified state**

```bash
rtk git status
```

If clean (no edits): nothing to commit; the prior commits are the deliverable. If you made small fixes during smoke, commit them as `fix(wmi): smoke-test polish` and re-run check/lint/test.

---

## Out of scope (deliberate)

These were called out in the spec's "Non-goals" section. Do NOT implement in this PR:

- Admin UI for concept editing
- Adaptive difficulty / spaced repetition
- Exam-style concept sessions
- Gamification wiring (coins, streak, daily quest)
- Concept prerequisites
- Translation spoiler on concept questions
- Inline figures inside question body
- Multi-figure questions
- Per-kid concept hide preferences
- Analytics dashboard

If you find yourself reaching for one of these, stop and confirm with the user before adding scope.
