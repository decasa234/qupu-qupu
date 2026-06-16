# Reusable Explainer Pool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn WMI illustration+explainer pairs into a reusable pool — an auto-generated, ID'd, described catalog the next AI reads first, plus genuinely parameterized templates for high-recurrence shapes (pick `templateId` + pass `params`, no new component).

**Architecture:** Extend the existing `build-visual-index.ts` generator to emit a pool catalog from co-located `meta` blocks (header-comment fallback for the ~1000 existing components). Add a `TEMPLATES` registry of parameterized illustration+explainer pairs; bind a paper question to one via a seed-JSON `visual: { templateId, params }` field that flows seed → DB (new `visual` JSONB column, mirroring `breakdown`) → API → `WmiQuestion` → `WmiQuestionView`. Fully backward compatible: questions without `visual` use the existing per-code `VISUALS` path unchanged.

**Tech Stack:** TypeScript, React 18 (SVG components), Zod (param schemas, already used by concepts), Postgres (`pg`), tsx (scripts), vitest (tests). Source spec: `docs/superpowers/specs/2026-06-16-reusable-explainer-pool-design.md`.

**Branch note:** `feat/wmi-concept-taxonomy` has concurrent activity. In every commit step, **stage only the listed files** — never `git add -A`.

**Phases are independently shippable:** Phase 1 (catalog) ships alone with zero behavior change; Phase 2 (plumbing) ships before any template exists; Phases 3-5 build on them.

---

## Phase 1 — Pool catalog generator (zero behavior change)

### Task 1: Define the shared `PoolMeta` type + helper

**Files:**
- Create: `src/components/wmi/paperQuestions/poolMeta.ts`
- Test: `src/components/wmi/paperQuestions/poolMeta.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// poolMeta.test.ts
import { describe, test, expect } from 'vitest'
import { validatePoolMeta } from './poolMeta'

describe('validatePoolMeta', () => {
  test('accepts a complete bespoke meta', () => {
    const errs = validatePoolMeta({
      id: 'cube-layer-count', title: 'Cube layer count',
      summary: 'Counts cubes layer by layer.', useWhen: 'How many cubes in a pile.',
      tags: ['counting', '3d'], grades: [1, 2, 3], status: 'bespoke',
    })
    expect(errs).toEqual([])
  })
  test('flags missing id and bad status', () => {
    const errs = validatePoolMeta({ title: 'x', summary: 'y', useWhen: 'z', tags: [], grades: [1], status: 'nope' } as never)
    expect(errs.some((e) => e.includes('id'))).toBe(true)
    expect(errs.some((e) => e.includes('status'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/wmi/paperQuestions/poolMeta.test.ts`
Expected: FAIL — `validatePoolMeta` not found.

- [ ] **Step 3: Write the implementation**

```ts
// poolMeta.ts
import type { z } from 'zod'

/** Co-located catalog metadata for a poolable illustration+explainer pair. */
export interface PoolMeta {
  /** Stable, shape-named kebab id (NOT a paper code). e.g. "cube-layer-count". */
  id: string
  title: string
  /** One line the AI scans. */
  summary: string
  /** The problem shape this solves — the match signal. */
  useWhen: string
  tags: string[]
  grades: number[]
  status: 'template' | 'bespoke'
  /** Templates only: Zod schema for the params a reuse must pass. */
  paramsSchema?: z.ZodTypeAny
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function validatePoolMeta(m: Partial<PoolMeta>): string[] {
  const errs: string[] = []
  if (!m.id || !KEBAB.test(m.id)) errs.push('id must be a kebab-case string')
  if (!m.title?.trim()) errs.push('title required')
  if (!m.summary?.trim()) errs.push('summary required')
  if (!m.useWhen?.trim()) errs.push('useWhen required')
  if (!Array.isArray(m.tags)) errs.push('tags must be an array')
  if (!Array.isArray(m.grades) || m.grades.length === 0) errs.push('grades must be a non-empty array')
  if (m.status !== 'template' && m.status !== 'bespoke') errs.push('status must be "template" | "bespoke"')
  if (m.status === 'template' && !m.paramsSchema) errs.push('templates must declare paramsSchema')
  return errs
}

/** Identity helper for type-checked co-located meta in component files. */
export function definePoolMeta<T extends PoolMeta>(m: T): T {
  return m
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/wmi/paperQuestions/poolMeta.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/paperQuestions/poolMeta.ts src/components/wmi/paperQuestions/poolMeta.test.ts
git commit -m "feat(wmi): PoolMeta type + validator for explainer pool catalog"
```

---

### Task 2: Pure pool-assembly module (testable core of the generator)

**Files:**
- Create: `db/seed/wmi/poolCatalog.ts`
- Test: `db/seed/wmi/poolCatalog.test.ts`

Factor the catalog assembly into a pure function so it can be unit-tested without touching the filesystem. It takes per-component records and returns the two output strings.

- [ ] **Step 1: Write the failing test**

```ts
// poolCatalog.test.ts
import { describe, test, expect } from 'vitest'
import { buildPoolOutputs, type PoolEntry } from './poolCatalog'

const entries: PoolEntry[] = [
  { id: 'cube-layer-count', file: 'CubeLayerCountTemplate', title: 'Cube layer count',
    summary: 'Counts cubes layer by layer.', useWhen: 'How many cubes in a pile.',
    tags: ['counting', '3d'], grades: [1, 2, 3], status: 'template',
    paramsExample: '{ "layers": [8,7,4] }', usedBy: ['WMI-19P1A-Q4'] },
  { id: 'apple-add19-p1', file: 'AppleAdd19P1Illustration', title: 'Apple make-a-ten',
    summary: 'Two apple boxes, make a ten then add.', useWhen: 'Add two one-digit groups.',
    tags: ['arithmetic'], grades: [1], status: 'bespoke', usedBy: ['WMI-19P1A-Q8'] },
]

describe('buildPoolOutputs', () => {
  test('templates render rich, bespoke render one-liners grouped by tag', () => {
    const { md, json } = buildPoolOutputs(entries)
    expect(md).toContain('## Templates')
    expect(md).toContain('cube-layer-count')
    expect(md).toContain('"layers"') // example shown for templates
    expect(md).toContain('## Bespoke (copy-adapt)')
    expect(md).toContain('apple-add19-p1')
    const parsed = JSON.parse(json)
    expect(parsed.find((e: PoolEntry) => e.id === 'cube-layer-count').status).toBe('template')
    expect(parsed).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run db/seed/wmi/poolCatalog.test.ts`
Expected: FAIL — `buildPoolOutputs` not found.

- [ ] **Step 3: Write the implementation**

```ts
// poolCatalog.ts
export interface PoolEntry {
  id: string
  file: string
  title: string
  summary: string
  useWhen: string
  tags: string[]
  grades: number[]
  status: 'template' | 'bespoke'
  paramsExample?: string
  usedBy: string[]
}

export function buildPoolOutputs(entries: PoolEntry[]): { md: string; json: string } {
  const templates = entries.filter((e) => e.status === 'template').sort((a, b) => a.id.localeCompare(b.id))
  const bespoke = entries.filter((e) => e.status === 'bespoke')

  const lines: string[] = [
    '# Explainer pool catalog',
    '',
    '<!-- GENERATED by `npm run wmi:index` — do not edit by hand. -->',
    '',
    'Read this FIRST when converting a paper question that needs a visual.',
    'Prefer a TEMPLATE (true reuse: set `visual.templateId` + `params`, no new file).',
    'Otherwise copy-adapt the closest bespoke entry. Build new only if nothing fits',
    '(and give the new pair a `meta` block so it lands here).',
    '',
    '## Templates',
    '',
  ]
  for (const t of templates) {
    lines.push(`### \`${t.id}\` — ${t.title}`)
    lines.push(`- file: \`${t.file}\`  · grades ${t.grades.join(',')} · tags: ${t.tags.join(', ')}`)
    lines.push(`- summary: ${t.summary}`)
    lines.push(`- use when: ${t.useWhen}`)
    if (t.paramsExample) lines.push('- params example: `' + t.paramsExample + '`')
    if (t.usedBy.length) lines.push(`- used by: ${t.usedBy.join(', ')}`)
    lines.push('')
  }

  lines.push('## Bespoke (copy-adapt)', '')
  const byTag = new Map<string, PoolEntry[]>()
  for (const e of bespoke) {
    const tag = e.tags[0] ?? 'untagged'
    if (!byTag.has(tag)) byTag.set(tag, [])
    byTag.get(tag)!.push(e)
  }
  for (const tag of [...byTag.keys()].sort()) {
    lines.push(`**${tag}**  `)
    for (const e of byTag.get(tag)!.sort((a, b) => a.id.localeCompare(b.id))) {
      lines.push(`- \`${e.id}\` (${e.file}) — ${e.summary} _[${e.usedBy.join(', ')}]_`)
    }
    lines.push('')
  }

  return { md: lines.join('\n'), json: JSON.stringify(entries, null, 2) }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run db/seed/wmi/poolCatalog.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add db/seed/wmi/poolCatalog.ts db/seed/wmi/poolCatalog.test.ts
git commit -m "feat(wmi): pure pool-catalog assembly (md + json)"
```

---

### Task 3: Wire the generator into `build-visual-index.ts`

**Files:**
- Modify: `db/seed/wmi/build-visual-index.ts`
- Create (output): `src/components/wmi/paperQuestions/EXPLAINER_POOL.md`, `src/components/wmi/paperQuestions/pool.json`

The generator already builds `usages` (component → `{code, role}[]`) and `fileMeta(file)` (header desc + keywords). Add: for each illustration file, collect a `PoolEntry`. If the file's source contains `export const meta` (or a `*.tsx` default-exports an `ExplainerTemplate`), dynamically import it to read the real `meta`; otherwise synthesize a `bespoke` entry from `fileMeta()`.

- [ ] **Step 1: Add the pool collection + emit (after the existing `writeFileSync(OUT, …)` at line 121)**

Append to `build-visual-index.ts`:

```ts
// --- pool catalog (EXPLAINER_POOL.md + pool.json) ---
import { buildPoolOutputs, type PoolEntry } from './poolCatalog.ts'
import { pathToFileURL } from 'node:url'

const POOL_MD = join(DIR, 'EXPLAINER_POOL.md')
const POOL_JSON = join(DIR, 'pool.json')

const poolEntries: PoolEntry[] = []
for (const [file, { components }] of sorted) {
  // codes this file is used by (from any of its components)
  const usedBy = [...new Set([...components.values()].flat().map((u) => u.code))].sort()
  const illName = [...components.keys()].find((c) => /Illustration$/.test(c)) ?? [...components.keys()][0]
  const path = join(DIR, `${file}.tsx`)
  let entry: PoolEntry | null = null
  if (existsSync(path) && /export\s+const\s+meta\b|ExplainerTemplate/.test(readFileSync(path, 'utf8'))) {
    try {
      const mod = await import(pathToFileURL(path).href)
      const meta = mod.meta ?? mod.default?.meta
      if (meta?.id) {
        entry = {
          id: meta.id, file, title: meta.title, summary: meta.summary, useWhen: meta.useWhen,
          tags: meta.tags ?? [], grades: meta.grades ?? [], status: meta.status ?? 'bespoke',
          paramsExample: meta.paramsExample, usedBy,
        }
      }
    } catch (err) {
      console.warn(`pool: could not import meta from ${file}: ${(err as Error).message}`)
    }
  }
  if (!entry) {
    const { desc, keywords } = fileMeta(file)
    entry = {
      id: keywords.replace(/\s+/g, '-'), file, title: illName ?? file,
      summary: desc || '(no description)', useWhen: '', tags: keywords.split(/\s+/).filter(Boolean),
      grades: [], status: 'bespoke', usedBy,
    }
  }
  poolEntries.push(entry)
}

const { md, json } = buildPoolOutputs(poolEntries)
writeFileSync(POOL_MD, md, 'utf8')
writeFileSync(POOL_JSON, json, 'utf8')
console.log(`wrote ${POOL_MD} + ${POOL_JSON}: ${poolEntries.length} entries (${poolEntries.filter((e) => e.status === 'template').length} templates)`)
```

Note: the file's top-level code must run under `await` — `build-visual-index.ts` is already a top-level-await ESM module run via tsx, so `await import(...)` is allowed. Move the `import` statements to the top of the file with the others (tsx hoists, but keep style consistent).

- [ ] **Step 2: Run the generator**

Run: `npm run wmi:index`
Expected: prints the existing INDEX line AND `wrote .../EXPLAINER_POOL.md + .../pool.json: <N> entries (0 templates)`. Files exist.

- [ ] **Step 3: Sanity-check output**

Run: `head -40 src/components/wmi/paperQuestions/EXPLAINER_POOL.md`
Expected: `# Explainer pool catalog`, a `## Templates` section (empty for now), and `## Bespoke (copy-adapt)` with tag-grouped one-liners for existing components.

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: exit 0, no errors.

- [ ] **Step 5: Commit**

```bash
git add db/seed/wmi/build-visual-index.ts src/components/wmi/paperQuestions/EXPLAINER_POOL.md src/components/wmi/paperQuestions/pool.json
git commit -m "feat(wmi): emit EXPLAINER_POOL.md + pool.json from wmi:index"
```

---

## Phase 2 — Params plumbing (backward compatible, no templates yet)

### Task 4: DB column `visual` (mirror `breakdown`)

**Files:**
- Create: `db/migrations/0034_wmi_question_visual.sql`
- Modify: `db/schema.sql:519` (add column after `breakdown JSONB,`)

- [ ] **Step 1: Write the migration**

```sql
-- db/migrations/0034_wmi_question_visual.sql
-- Reusable-explainer-pool binding: { "templateId": string, "params": object }
ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS visual JSONB;
```

- [ ] **Step 2: Add the column to schema.sql**

In `db/schema.sql`, immediately after the line `  breakdown   JSONB,` (line 519) add:

```sql
  visual      JSONB,
```

- [ ] **Step 3: Apply the migration**

Run: `psql "$DATABASE_URL" -f db/migrations/0034_wmi_question_visual.sql`
Expected: `ALTER TABLE`.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/0034_wmi_question_visual.sql db/schema.sql
git commit -m "feat(wmi): add visual JSONB column to wmi_questions"
```

---

### Task 5: Seed types + loader carry `visual`

**Files:**
- Modify: `api/services/wmi/paperImport/types.ts` (add field to `PaperQuestion`)
- Modify: `db/seed/wmi/load.ts:144,158,176`

- [ ] **Step 1: Add the field + shared type to `types.ts`**

In `api/services/wmi/paperImport/types.ts`, add above `PaperQuestion`:

```ts
export interface QuestionVisualBinding {
  templateId: string
  params: unknown
}
```

and add to the `PaperQuestion` interface (after `breakdown?: Breakdown`):

```ts
  visual?: QuestionVisualBinding
```

- [ ] **Step 2: Thread through the loader**

In `db/seed/wmi/load.ts`:
- Line 144 (INSERT column list) — add `visual` after `breakdown`:
  `... breakdown, visual, difficulty, updated_at)`
- Line 158 (ON CONFLICT SET) — add after the `breakdown = EXCLUDED.breakdown,` line:
  `visual = EXCLUDED.visual,`
- Add a new VALUES placeholder for `visual` in the correct position, and in the params array (after the `question.breakdown ? … : null,` at line 176) add:
  `question.visual ? JSON.stringify(question.visual) : null,`

(Read lines 140–180 first to get the exact `$N` placeholder numbering; insert `visual`'s placeholder in the same ordinal position as the column, and renumber the trailing placeholders — `difficulty`, `updated_at` — by one.)

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 4: Reseed to confirm the loader runs**

Run: `npm run seed:wmi`
Expected: `Done. … papers.` with no SQL error.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/paperImport/types.ts db/seed/wmi/load.ts
git commit -m "feat(wmi): seed loader carries question.visual binding"
```

---

### Task 6: API + frontend type return `visual`

**Files:**
- Modify: `api/services/wmi/papers.ts` (DTO type ~line 26; SELECTs at ~110, ~144, ~161; normalize/return)
- Modify: `api/services/wmi/paperReviews.ts` (admin paper-questions SELECT)
- Modify: `src/types/wmi.ts:78` (add field to `WmiQuestion`)

- [ ] **Step 1: Add the field to the API DTO + every SELECT**

In `api/services/wmi/papers.ts`:
- DTO interface (~line 26, where `breakdown: Breakdown | null` is): add
  `visual: { templateId: string; params: unknown } | null`
- In each of the three SELECT column lists (~110, ~144, ~161) that include `q.breakdown,`, add `q.visual,` immediately after.
- Wherever the row is mapped/returned to include `breakdown`, include `visual` the same way (grep the file for `breakdown` in the return/normalize object and mirror).

In `api/services/wmi/paperReviews.ts`: find the question SELECT that returns `breakdown` (grep `breakdown`) and add `visual` the same way, plus its DTO/return.

- [ ] **Step 2: Add the field to the frontend type**

In `src/types/wmi.ts`, after `breakdown?: Breakdown | null` (line 78) add:

```ts
  visual?: { templateId: string; params: unknown } | null
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add api/services/wmi/papers.ts api/services/wmi/paperReviews.ts src/types/wmi.ts
git commit -m "feat(wmi): API + WmiQuestion type return question.visual"
```

---

### Task 7: `TEMPLATES` registry + resolver

**Files:**
- Create: `src/components/wmi/paperQuestions/templates/registry.ts`
- Modify: `src/components/wmi/paperQuestions/registry.ts` (re-export `getTemplate`)

- [ ] **Step 1: Create the templates registry (empty to start)**

```ts
// templates/registry.ts
import type { ComponentType } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import type { PoolMeta } from '../poolMeta'

export interface ExplainerTemplate {
  meta: PoolMeta & { status: 'template' }
  Illustration: ComponentType<{ params: unknown }>
  Explainer: ComponentType<ExplainerProps>
}

// Templates register here as they are built (Phase 3).
const ALL: ExplainerTemplate[] = []

export const TEMPLATES: Record<string, ExplainerTemplate> = Object.fromEntries(
  ALL.map((t) => [t.meta.id, t]),
)

export function getTemplate(id: string): ExplainerTemplate | null {
  return TEMPLATES[id] ?? null
}

export function templateIds(): string[] {
  return Object.keys(TEMPLATES)
}
```

- [ ] **Step 2: Re-export from the main registry**

In `src/components/wmi/paperQuestions/registry.ts`, near the other exported getters (`getQuestionIllustration`, etc.), add:

```ts
export { getTemplate, templateIds } from './templates/registry'
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/wmi/paperQuestions/templates/registry.ts src/components/wmi/paperQuestions/registry.ts
git commit -m "feat(wmi): empty TEMPLATES registry + getTemplate resolver"
```

---

### Task 8: `WmiQuestionView` renders templates when `question.visual` is set

**Files:**
- Modify: `src/components/wmi/WmiQuestionView.tsx` (illustration render site; explainer render at line ~182-183; import `getTemplate`)

- [ ] **Step 1: Read the current render block**

Run: read `src/components/wmi/WmiQuestionView.tsx` lines 90–185 to locate (a) where `getQuestionIllustration(question.code)` is rendered and (b) the explainer render at line 182-183 (`<WmiExplainer explainer={QuestionExplainer} params={{}} correctAnswer="" lang={lang} />`).

- [ ] **Step 2: Add the import + resolve a template binding**

Add to the import on line 15:

```ts
import { getQuestionIllustration, getQuestionExplainer, getQuestionChoiceRenderer, getTemplate } from './paperQuestions/registry'
```

Near line 99 (`const QuestionExplainer = getQuestionExplainer(question.code)`), add:

```ts
const templateBinding = question.visual?.templateId ? getTemplate(question.visual.templateId) : null
const templateParams = question.visual?.params ?? {}
const ResolvedIllustration = templateBinding?.Illustration ?? null // template figure takes params
const ResolvedExplainer = templateBinding?.Explainer ?? getQuestionExplainer(question.code)
```

- [ ] **Step 3: Use the template figure (illustration site)**

At the illustration render site: if `ResolvedIllustration` is set, render `<ResolvedIllustration params={templateParams} />` (it draws the static figure from params). Otherwise keep the existing `getQuestionIllustration(question.code)` path unchanged. (The template's illustration replaces the bespoke figure; `figure_url` fallback still applies when neither exists.)

- [ ] **Step 4: Use the template explainer with real params + answer (line ~183)**

Replace:
```tsx
<WmiExplainer explainer={QuestionExplainer} params={{}} correctAnswer="" lang={lang} />
```
with:
```tsx
<WmiExplainer explainer={ResolvedExplainer} params={templateParams} correctAnswer={question.answer} lang={lang} />
```

(Bespoke explainers ignore `params`/`correctAnswer`, so this is safe for every existing question; templates read them.)

- [ ] **Step 5: Typecheck + full SSR smoke (no regressions)**

Run: `npm run check`
Expected: exit 0.
Run the aggregate SSR smoke (same harness used for the prelims; recreate `_wmi_ssr_smoke.tsx` per the prior pattern or run `npm run wmi:validate` + manual render) — expected: every existing question still renders, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add src/components/wmi/WmiQuestionView.tsx
git commit -m "feat(wmi): WmiQuestionView renders template visual when question.visual is set"
```

---

### Task 9: Validate `visual` at seed/validate time

**Files:**
- Modify: `api/services/wmi/paperImport/validate.ts`

- [ ] **Step 1: Add template-binding validation to `validatePaper`**

In `validate.ts`, import the template registry and, inside the per-question loop, add:

```ts
import { getTemplate } from '../../../../src/components/wmi/paperQuestions/templates/registry.js'
// ... inside the for (const q of paper.questions) loop:
if (q.visual) {
  const t = getTemplate(q.visual.templateId)
  if (!t) problems.push(tag(q.number, `unknown visual.templateId "${q.visual.templateId}"`))
  else {
    const parsed = t.meta.paramsSchema.safeParse(q.visual.params)
    if (!parsed.success) problems.push(tag(q.number, `visual.params invalid for "${q.visual.templateId}": ${parsed.error.issues[0]?.message}`))
  }
}
```

(If importing the React template registry into the validator proves heavy under tsx, fall back to importing only a `templates/schemas.ts` that re-exports `{ id, paramsSchema }` with no React imports — create that thin module and point both the registry and validator at it. Decide during Task 10 once the first template exists.)

- [ ] **Step 2: Run validate (no questions use templates yet → no change)**

Run: `npm run wmi:validate`
Expected: `All papers valid.`

- [ ] **Step 3: Commit**

```bash
git add api/services/wmi/paperImport/validate.ts
git commit -m "feat(wmi): validate question.visual templateId + params at seed time"
```

---

## Phase 3 — Build the templates

### Task 10: Reference template — `count-one-by-one` (full pattern)

This is the **reference implementation**; later templates follow its structure exactly.

**Files:**
- Create: `src/components/wmi/paperQuestions/templates/CountOneByOneTemplate.tsx`
- Test: `src/components/wmi/paperQuestions/templates/CountOneByOneTemplate.test.ts`
- Modify: `templates/registry.ts` (register it)

- [ ] **Step 1: Write the template (illustration + explainer + meta, params-driven)**

```tsx
// CountOneByOneTemplate.tsx
import { z } from 'zod'
import { useBeatControl, type ExplainerProps } from '../../concepts/explainers/registry'
import { definePoolMeta } from '../poolMeta'

export const paramsSchema = z.object({
  /** Items to enumerate, in reveal order; each is an SVG path or simple shape token. */
  items: z.array(z.object({ x: z.number(), y: z.number(), shape: z.enum(['dot', 'triangle', 'square']) })).min(1),
  unitLabel_en: z.string().default('items'),
  unitLabel_id: z.string().default('benda'),
})
type Params = z.infer<typeof paramsSchema>

export const meta = definePoolMeta({
  id: 'count-one-by-one',
  title: 'Count objects one by one',
  summary: 'Reveals each object in turn with a running counter, landing on the total.',
  useWhen: 'Question asks "how many X" and the figure is a set of discrete objects to enumerate.',
  tags: ['counting', 'enumeration'],
  grades: [1, 2, 3],
  status: 'template' as const,
  paramsSchema,
} as const)

function shapeNode(s: Params['items'][number], lit: boolean) {
  const fill = lit ? '#F59E0B' : '#CBD5E1'
  if (s.shape === 'dot') return <circle cx={s.x} cy={s.y} r={10} fill={fill} />
  if (s.shape === 'square') return <rect x={s.x - 10} y={s.y - 10} width={20} height={20} fill={fill} />
  return <polygon points={`${s.x},${s.y - 12} ${s.x - 11},${s.y + 9} ${s.x + 11},${s.y + 9}`} fill={fill} />
}

export function CountOneByOneIllustration({ params }: { params: unknown }) {
  const p = paramsSchema.parse(params)
  return (
    <svg viewBox="0 0 320 220" width="100%" role="img" aria-label="objects to count">
      {p.items.map((it, i) => <g key={i}>{shapeNode(it, false)}</g>)}
    </svg>
  )
}

export function CountOneByOneExplainer(props: ExplainerProps) {
  const p = paramsSchema.parse(props.params)
  const beats = p.items.length
  const { beat } = useBeatControl({ ...props, beats })
  const shown = beat + 1
  return (
    <div>
      <svg viewBox="0 0 320 220" width="100%" role="img" aria-label={`counting ${shown}`}>
        {p.items.map((it, i) => <g key={i}>{shapeNode(it, i <= beat)}</g>)}
        <text x={160} y={210} textAnchor="middle" fontSize="18" fill="#0F172A">{shown}</text>
      </svg>
    </div>
  )
}

export default { meta, Illustration: CountOneByOneIllustration, Explainer: CountOneByOneExplainer }
```

(If `useBeatControl`'s real signature differs, open `src/components/wmi/concepts/explainers/registry.ts` and a working concept explainer e.g. `ClockReadTimeExplainer.tsx` and match the exact hook usage. The static figure shows all items grey; the explainer lights one per beat with a running count — house style.)

- [ ] **Step 2: Write the test (params validation + beat count)**

```ts
// CountOneByOneTemplate.test.ts
import { describe, test, expect } from 'vitest'
import { paramsSchema, meta } from './CountOneByOneTemplate'

describe('count-one-by-one template', () => {
  test('meta is a valid template', () => {
    expect(meta.id).toBe('count-one-by-one')
    expect(meta.status).toBe('template')
  })
  test('paramsSchema accepts a 3-item set and rejects empty', () => {
    expect(paramsSchema.safeParse({ items: [{ x: 1, y: 1, shape: 'dot' }] }).success).toBe(true)
    expect(paramsSchema.safeParse({ items: [] }).success).toBe(false)
  })
})
```

- [ ] **Step 3: Run the test (fails until file exists, then passes)**

Run: `npx vitest run src/components/wmi/paperQuestions/templates/CountOneByOneTemplate.test.ts`
Expected: PASS after Step 1.

- [ ] **Step 4: Register it**

In `templates/registry.ts`, import and add to `ALL`:

```ts
import CountOneByOne from './CountOneByOneTemplate'
const ALL: ExplainerTemplate[] = [CountOneByOne]
```

- [ ] **Step 5: SSR-render the template with sample params**

Create a throwaway `_wmi_tpl_smoke.tsx` (gitignored by `_wmi_*`) that imports `TEMPLATES`, and for each template renders its Illustration + Explainer with a sample params object (use `meta.paramsSchema` to hand-craft a minimal valid params). Run `npx tsx _wmi_tpl_smoke.tsx`; expected: renders without throwing. Delete the file.

- [ ] **Step 6: Typecheck + commit**

Run: `npm run check` → exit 0.

```bash
git add src/components/wmi/paperQuestions/templates/CountOneByOneTemplate.tsx src/components/wmi/paperQuestions/templates/CountOneByOneTemplate.test.ts src/components/wmi/paperQuestions/templates/registry.ts
git commit -m "feat(wmi): count-one-by-one explainer template (reference)"
```

---

### Task 11: Wrapper templates over existing concept explainers

Each wraps a concept explainer/illustration that is already params-driven, exposing it through the `ExplainerTemplate` shape with a `meta` block. Build one per sub-step, each: create `templates/<Name>Template.tsx` that imports the concept component, declares `paramsSchema` (copy the concept's Zod params from `api/services/wmi/concepts/<slug>/index.ts`), declares `meta`, default-exports `{ meta, Illustration, Explainer }`; register in `ALL`; add a vitest meta/params test; SSR-smoke; `npm run check`; commit `feat(wmi): <id> explainer template`.

Build these (id ← concept slug):
- [ ] `clock-read` ← `clock-read-time` (params `{ hour, minute, options }`)
- [ ] `cube-layer-count` ← `block-count-3d`
- [ ] `balance-weigh` ← `scale-read`
- [ ] `arrow-grid-path` ← `grid-path-steps`
- [ ] `count-shapes-in-figure` ← `count-shapes-in-figure`
- [ ] `maze-shortest-path` ← `maze-path-shortest`
- [ ] `chart-compare` ← `bar-chart-compare`
- [ ] `dice-net-fold` ← `dice-net-fold`
- [ ] `dice-opposite-faces` ← `dice-opposite-faces`
- [ ] `fraction-of-region` ← `fraction-of-region`
- [ ] `number-line-jumps` ← `number-line-jumps`

For each, confirm the concept's frontend explainer component name in `src/components/wmi/concepts/explainers/registry.ts` and reuse that component directly (do not re-implement the animation). If a concept has no static illustration suitable as a figure, point `Illustration` at the concept's illustration in `src/components/wmi/concepts/<slug>.tsx` (the `concepts/<slug>.tsx` files are the param-driven illustrations).

- [ ] **Final step: regenerate catalog + commit**

Run: `npm run wmi:index` (templates now appear under `## Templates`).
```bash
git add src/components/wmi/paperQuestions/templates src/components/wmi/paperQuestions/EXPLAINER_POOL.md src/components/wmi/paperQuestions/pool.json
git commit -m "feat(wmi): wrapper templates over concept explainers + regen pool"
```

---

### Task 12: New paper-shaped templates

Build, same structure as Task 10, one per sub-step:
- [ ] `balance-substitution` — params `{ givens: Array<{ left: ShapeQty[]; right: ShapeQty[] }>, ask: ShapeQty[] }` where `ShapeQty = { shape: 'hex'|'square'|'diamond'|'circle'; count: number }`. Figure: the given level balances + the asked quantity; explainer substitutes one relation per beat to the square-equivalent.
- [ ] `symbol-substitution` — params `{ equations: Array<{ lhs: Token[]; rhs: number }>, ask: Token[] }`, `Token = { symbol: '☆'|'○'|'△'|'□'; }`. Figure: the equations; explainer solves one symbol per beat.

Each: vitest meta/params test, SSR-smoke, `npm run check`, commit.

---

### Task 13: Formalize `try-and-eliminate` as a template

**Files:**
- Create: `src/components/wmi/paperQuestions/templates/TryEliminateTemplate.tsx`
- Modify: `templates/registry.ts`

- [ ] **Step 1:** Wrap the existing `makeTryCheckExplainer` factory (`paperQuestions/tryCheckExplainers.ts`). `paramsSchema` = `z.object({ intro_en, intro_id, items: z.array(z.object({ text, ok: z.boolean().nullable() })), final_en, final_id, aria_en, aria_id })`. `Explainer` builds the explainer from params via the factory; `Illustration` is a no-op/null figure (this is a non-figure deduction template). `meta.useWhen` = "Non-figure question solved by checking candidates one at a time (verify/eliminate)."

- [ ] **Step 2:** vitest meta/params test; register; `npm run check`; SSR-smoke; commit `feat(wmi): try-and-eliminate explainer template`.

- [ ] **Step 3: Prove one real reuse end-to-end.** Pick one simple non-figure question (e.g. a 2025 prelim arithmetic question), set its seed `visual = { templateId: 'try-and-eliminate', params: {…} }`, run `npm run wmi:validate` (must pass param validation), `npm run seed:wmi`, and load it at `/admin/wmi-drill` to confirm the templated explainer renders. Revert the seed edit if it was just a proof, OR keep it as the first real reuse. Commit if kept.

---

## Phase 4 — Update the conversion skill

### Task 14: Add the pool reuse pass to `wmi-paper-conversion`

**Files:**
- Modify: `.claude/skills/wmi-paper-conversion/SKILL.md`

- [ ] **Step 1:** In Phase 3 (Enrich), before "Reuse before you build", add a **Pool reuse pass**: "Read `src/components/wmi/paperQuestions/EXPLAINER_POOL.md` first. (1) If a **template** fits the question's shape, do NOT build a component — set the seed question's `visual: { templateId, params }` (validated by `wmi:validate`). (2) Else copy-adapt the closest **bespoke** entry. (3) Else build new — and the new illustration MUST include a `meta` block (`definePoolMeta`) so it lands in the catalog."

- [ ] **Step 2:** Update the four role-agent dispatch instructions: replace "grep INDEX.md" with "read EXPLAINER_POOL.md; prefer a template; new builds include a `meta` block."

- [ ] **Step 3:** Commit `docs(skill): wmi-paper-conversion pool reuse pass`.

---

## Phase 5 — Promotion report + determinism guard

### Task 15: Promotion-candidate report

**Files:**
- Create: `db/seed/wmi/poolCandidates.ts` (+ `poolCandidates.test.ts`)
- Modify: `package.json` (add `"wmi:pool-candidates": "tsx db/seed/wmi/poolCandidates.ts"`)

- [ ] **Step 1:** Write `clusterBespoke(entries: PoolEntry[]): Array<{ tag: string; count: number; ids: string[] }>` returning tags/keyword-clusters with ≥3 bespoke entries and no template, sorted by count desc. vitest test with a fixture of 4 bespoke sharing a tag → returns that cluster.
- [ ] **Step 2:** Script reads `pool.json`, prints the clusters ("promotion candidates"). Run `npm run wmi:pool-candidates`; expected: a ranked list.
- [ ] **Step 3:** `npm run check`; commit `feat(wmi): explainer-pool promotion-candidate report`.

### Task 16: Catalog determinism guard

**Files:**
- Modify: `package.json` (add `"wmi:pool:check": "npm run wmi:index && git diff --exit-code src/components/wmi/paperQuestions/EXPLAINER_POOL.md src/components/wmi/paperQuestions/pool.json src/components/wmi/paperQuestions/INDEX.md"`)

- [ ] **Step 1:** Add the script. Run `npm run wmi:pool:check`; expected: exit 0 (catalog already committed and up to date).
- [ ] **Step 2:** Commit `chore(wmi): wmi:pool:check determinism guard`.

---

## Self-review notes (resolved)

- Every spec section maps to a task: catalog→T1-3, meta model→T1, params data flow→T4-8, validation→T9, templates→T10-13, workflow→T14, testing→T1/2/10/15/16, rollout phases 1-5→task groups, scope guardrails→honored (no DB engine; bespoke stays bespoke; concept engine untouched, only wrapped).
- Type consistency: `PoolMeta`/`PoolEntry`/`ExplainerTemplate`/`QuestionVisualBinding` defined once and reused; `getTemplate` name consistent across T7/T8/T9.
- Open risk flagged inline (T9): importing the React template registry into the tsx validator — fallback to a no-React `templates/schemas.ts` if heavy.
