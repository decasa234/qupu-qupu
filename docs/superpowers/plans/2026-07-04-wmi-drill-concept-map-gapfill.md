# WMI Drill Concept Map + Gap-Fill Practice Concepts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Map all 1050 WMI drill questions to concept types, build parameterized practice concepts for uncovered types (≥3 drill questions), and surface Easy/Medium/Hard bands.

**Architecture:** Phase 1 fans out read-only classifier subagents to label every drill question against the 72 existing concepts, merges into a coverage report, and writes `breakdown.strategy.conceptSlug` into the 42 seed JSONs. Phase 2 authors one new concept per uncovered cluster using a fixed template (registry + taxonomy + curriculum registration). Phase 3 adds a `difficultyBand()` helper and surfaces it. Phase 2 is data-dependent on Phase 1's gap list — its task count is fixed at the Phase-1 checkpoint.

**Tech Stack:** TypeScript (ESM, `.js` import extensions in `api/`), Zod, Vitest, `tsx` for scripts, mulberry32 seeded RNG.

## Global Constraints

- `api/` imports use `.js` extensions even for `.ts` files. Keep that convention.
- New concept files follow the `budget-selection` reference exactly:
  `index.ts` (zod `paramsSchema` + `meta` + `generate(rng)` + `render`),
  `breakdown.ts` (`buildXBreakdown(params): Breakdown`), `index.test.ts`.
- A registered concept MUST appear in ALL of: `registry.ts` `CONCEPTS`,
  `taxonomy.ts` `CONCEPT_TAGS` + `SHORT_ID_BY_SLUG` (unique code), and
  `curriculum.ts` `CURRICULUM` (valid `subjectKey`, difficulty 1–3, unique
  `sortOrder` within subject, tags all in `TAGS`). Four vitest suites enforce this.
- `SHORT_ID_BY_SLUG` codes are FROZEN — never renumber; new concepts take the
  next free number in their letter series (A/N/W/P/L/C/G/M/D).
- Bilingual everywhere prose appears: `_en` and `_id`. `breakdown.highlights`
  `phrase_*` MUST be a substring of the rendered `body_*`.
- Do NOT run full-project `tsc`/`lint`/`build` inside parallel agents — OOM risk.
  Run ONE sequential `node --max-old-space-size=4096 ./node_modules/.bin/tsc --noEmit` at the end.
- Grades are 1–3 only. No grade 0.

---

## Task 1: Concept label-set + batch manifest for classifiers

**Files:**
- Create: `scripts/wmi/emit-concept-labelset.ts`
- Output (gitignored scratch): `docs/reference/_concept-labelset.md`

**Interfaces:**
- Produces: `docs/reference/_concept-labelset.md` — a markdown table of all 72
  concepts (`slug`, `name_en`, `description`, `strand`, `topic`, `difficulty`)
  used verbatim as the classifier label set in Task 2.

- [ ] **Step 1: Write the emitter script**

```ts
// scripts/wmi/emit-concept-labelset.ts
import { writeFileSync } from 'node:fs'
import { ALL_SLUGS, getConcept } from '../../api/services/wmi/concepts/registry.js'
import { CONCEPT_TAGS } from '../../api/services/wmi/concepts/taxonomy.js'

const rows = ALL_SLUGS.map((slug) => {
  const c = getConcept(slug)!
  const t = CONCEPT_TAGS[slug]
  const desc = (c.meta.description_id ?? c.meta.name_en).replace(/\|/g, '/')
  return `| ${slug} | ${c.meta.name_en} | ${desc} | ${t.strand}/${t.topic} | ${t.difficulty} |`
})
const md = [
  '# Concept label set (classifier reference)',
  '',
  '| slug | name | description | strand/topic | difficulty |',
  '| --- | --- | --- | --- | --- |',
  ...rows,
  '',
].join('\n')
writeFileSync('docs/reference/_concept-labelset.md', md)
console.log(`wrote ${rows.length} concept labels`)
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/wmi/emit-concept-labelset.ts`
Expected: `wrote 72 concept labels` and the file exists.

- [ ] **Step 3: Commit**

```bash
git add scripts/wmi/emit-concept-labelset.ts docs/reference/_concept-labelset.md
git commit -m "chore(wmi): emit concept label set for drill classification"
```

---

## Task 2: Classify all drill questions (parallel subagents)

**Files:**
- Create: classifier output JSONs in the session scratchpad, one per batch:
  `<scratchpad>/wmi-map/<year>.json`

**Interfaces:**
- Consumes: `docs/reference/_concept-labelset.md` (Task 1); the 42 paper JSONs.
- Produces: per-batch JSON arrays of
  `{ file, number, grade, round, slug: string | "UNCOVERED", proposedType?: string, confidence: 0..1 }`.

- [ ] **Step 1: Dispatch one `general-purpose` (or `Explore`) subagent per year (7 batches: 2019–2025)**

Each subagent prompt MUST include:
- the full contents of `docs/reference/_concept-labelset.md`,
- the list of that year's 6 paper files under `db/seed/wmi/papers/`,
- instructions: for EACH question, read `body_en` + `breakdown`; assign the
  single best-matching `slug` from the label set, or `"UNCOVERED"` if no concept
  fits; when `UNCOVERED`, add a short kebab-case `proposedType` naming the
  missing concept and a 1-line rationale; set `confidence` 0–1.
- output: write a JSON array to `<scratchpad>/wmi-map/<year>.json`. Return only
  a one-line summary (counts). Do NOT edit any source files.

Run subagents concurrently (single message, multiple Agent calls).

- [ ] **Step 2: Verify each batch file parses and covers all questions**

Run: for each year, assert the JSON length equals that year's question count
(6 papers × ~25 = ~150). A quick node check:

```bash
node -e 'const fs=require("fs");const d="<scratchpad>/wmi-map";let n=0;for(const f of fs.readdirSync(d)){const a=JSON.parse(fs.readFileSync(d+"/"+f));n+=a.length;console.log(f,a.length)}console.log("total",n)'
```
Expected: `total 1050` (±0). Re-dispatch any short batch.

- [ ] **Step 3: Commit the raw classification (copy into repo for auditability)**

```bash
mkdir -p docs/reference/wmi-map-raw && cp <scratchpad>/wmi-map/*.json docs/reference/wmi-map-raw/
git add docs/reference/wmi-map-raw
git commit -m "chore(wmi): raw drill-question concept classification"
```

---

## Task 3: Merge into coverage report + gap list  *(CHECKPOINT)*

**Files:**
- Create: `scripts/wmi/merge-concept-map.ts`
- Create: `docs/reference/wmi-drill-concept-map.md`

**Interfaces:**
- Consumes: `docs/reference/wmi-map-raw/*.json`, `registry.ts` `ALL_SLUGS`.
- Produces: `wmi-drill-concept-map.md` with (a) a concept-usage histogram, and
  (b) a gap list of `UNCOVERED` clusters grouped by `proposedType` with counts,
  example refs, and suggested strand/topic/difficulty.

- [ ] **Step 1: Write the merge script**

```ts
// scripts/wmi/merge-concept-map.ts
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { ALL_SLUGS } from '../../api/services/wmi/concepts/registry.js'

const valid = new Set<string>(ALL_SLUGS)
type Row = { file: string; number: number; grade: number; round: string; slug: string; proposedType?: string; confidence: number }
const rows: Row[] = []
for (const f of readdirSync('docs/reference/wmi-map-raw')) {
  rows.push(...JSON.parse(readFileSync(`docs/reference/wmi-map-raw/${f}`, 'utf8')))
}

const bad = rows.filter((r) => r.slug !== 'UNCOVERED' && !valid.has(r.slug))
if (bad.length) { console.error('typo slugs:', [...new Set(bad.map((b) => b.slug))]); process.exit(1) }

const hist = new Map<string, number>()
for (const r of rows) if (r.slug !== 'UNCOVERED') hist.set(r.slug, (hist.get(r.slug) ?? 0) + 1)

const gaps = new Map<string, Row[]>()
for (const r of rows) if (r.slug === 'UNCOVERED') {
  const k = r.proposedType ?? 'unlabeled'
  ;(gaps.get(k) ?? gaps.set(k, []).get(k)!).push(r)
}

const ref = (r: Row) => `${r.file.replace('.json', '')} #${r.number}`
const histLines = [...hist.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `| ${s} | ${n} |`)
const gapLines = [...gaps.entries()].sort((a, b) => b[1].length - a[1].length)
  .map(([k, rs]) => `| ${k} | ${rs.length} | ${rs.slice(0, 4).map(ref).join(', ')} |`)

const uncovered = rows.filter((r) => r.slug === 'UNCOVERED').length
const md = [
  '# WMI drill concept map',
  '',
  `Total questions: ${rows.length}. Covered: ${rows.length - uncovered}. Uncovered: ${uncovered}.`,
  `Concepts exercised: ${hist.size} / ${ALL_SLUGS.length}.`,
  '',
  '## Concept usage',
  '| slug | drill questions |', '| --- | --- |', ...histLines, '',
  '## Gap list (uncovered clusters, build if ≥3)',
  '| proposed type | count | examples |', '| --- | --- | --- |', ...gapLines, '',
].join('\n')
writeFileSync('docs/reference/wmi-drill-concept-map.md', md)
console.log(`report written. uncovered clusters: ${gaps.size}, buildable (>=3): ${[...gaps.values()].filter((v) => v.length >= 3).length}`)
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/wmi/merge-concept-map.ts`
Expected: report written; prints buildable-cluster count. Exits non-zero if any
subagent emitted a typo slug (fix the raw JSON and re-run).

- [ ] **Step 3: Commit and STOP for user review**

```bash
git add scripts/wmi/merge-concept-map.ts docs/reference/wmi-drill-concept-map.md
git commit -m "feat(wmi): drill concept coverage report + gap list"
```

**CHECKPOINT — present `wmi-drill-concept-map.md` to the user.** The gap list's
`≥3` clusters become the concrete Phase-2 concept tasks (one Task-5 instance
each). User trims/approves the list before any concept is authored.

---

## Task 4: Write conceptSlug into the 42 seed JSONs (covered questions)

**Files:**
- Create: `scripts/wmi/write-concept-slugs.ts`
- Modify: all 42 `db/seed/wmi/papers/*.json` (`breakdown.strategy.conceptSlug`)

**Interfaces:**
- Consumes: `docs/reference/wmi-map-raw/*.json`, `registry.ts` `ALL_SLUGS`.
- Produces: each covered question's `breakdown.strategy.conceptSlug` set to a
  real slug; `UNCOVERED` questions left untouched (null) until their concept is
  built in Phase 2.

- [ ] **Step 1: Write the writer script**

```ts
// scripts/wmi/write-concept-slugs.ts
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { ALL_SLUGS } from '../../api/services/wmi/concepts/registry.js'

const valid = new Set<string>(ALL_SLUGS)
const map = new Map<string, string>() // `${file}#${number}` -> slug
for (const f of readdirSync('docs/reference/wmi-map-raw')) {
  for (const r of JSON.parse(readFileSync(`docs/reference/wmi-map-raw/${f}`, 'utf8'))) {
    if (r.slug !== 'UNCOVERED' && valid.has(r.slug)) map.set(`${r.file}#${r.number}`, r.slug)
  }
}

const dir = 'db/seed/wmi/papers'
let touched = 0
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const path = `${dir}/${file}`
  const doc = JSON.parse(readFileSync(path, 'utf8'))
  for (const q of doc.questions ?? []) {
    const slug = map.get(`${file}#${q.number}`)
    if (!slug) continue
    q.breakdown ??= {}
    q.breakdown.strategy ??= { name_en: '', name_id: '' }
    q.breakdown.strategy.conceptSlug = slug
    touched++
  }
  writeFileSync(path, JSON.stringify(doc, null, 1) + '\n')
}
console.log(`set conceptSlug on ${touched} questions`)
```

- [ ] **Step 2: Run and verify formatting is stable**

Run: `npx tsx scripts/wmi/write-concept-slugs.ts && git diff --stat db/seed/wmi/papers | tail -1`
Expected: prints count; diff shows only `conceptSlug` additions (JSON indent
matches existing 1-space — confirm `git diff` shows no whitespace churn on a
sample file: `git diff db/seed/wmi/papers/2020-final-g1.json | head -30`).

- [ ] **Step 3: Commit**

```bash
git add db/seed/wmi/papers scripts/wmi/write-concept-slugs.ts
git commit -m "feat(wmi): link drill questions to practice concepts (conceptSlug)"
```

---

## Task 5 (TEMPLATE — instantiate once per approved ≥3 gap cluster)

Worked example below builds `average-of-numbers` (mean of a small list, G3,
difficulty 2). For a real gap, swap: slug, params, math, bodies, breakdown,
strand/topic/difficulty, short-id, subjectKey/sortOrder/tags. Every instance
follows these exact 8 steps.

**Files (per concept):**
- Create: `api/services/wmi/concepts/<slug>/index.ts`
- Create: `api/services/wmi/concepts/<slug>/breakdown.ts`
- Create: `api/services/wmi/concepts/<slug>/index.test.ts`
- Modify: `api/services/wmi/concepts/registry.ts` (import + `CONCEPTS` entry)
- Modify: `api/services/wmi/concepts/taxonomy.ts` (`CONCEPT_TAGS` + `SHORT_ID_BY_SLUG`)
- Modify: `api/services/wmi/concepts/curriculum.ts` (`CURRICULUM` entry)

**Interfaces:**
- Consumes: `ConceptLogic<P>`, `Rng`, `Breakdown` from `../types.js`; `mulberry32` from `../rng.js`.
- Produces: `default` export `ConceptLogic<Params>`; registered under `<slug>`.

- [ ] **Step 1: Write the failing test** (`<slug>/index.test.ts`)

```ts
import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { mean } from './index.js'

describe('average-of-numbers', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })
  test('100 seeds: answer equals the exact integer mean', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const sum = p.values.reduce((a, b) => a + b, 0)
      expect(sum % p.values.length).toBe(0) // generator guarantees a whole-number mean
      const r = concept.render(p)
      expect(r.answer).toBe(String(mean(p)))
      expect(r.answer).toBe(String(sum / p.values.length))
      expect(r.breakdown!.highlights.every((h) => r.body_en.includes(h.phrase_en))).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run api/services/wmi/concepts/average-of-numbers`
Expected: FAIL — `Cannot find module './index.js'`.

- [ ] **Step 3: Write `<slug>/index.ts`**

```ts
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildAverageBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  values: z.array(z.number().int().min(2).max(60)).min(3).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'average-of-numbers',
  name_en: 'Average of a list of numbers',
  name_id: 'Rata-rata sekumpulan bilangan',
  grades: [3] as const,
  description_id: 'Jumlahkan semua bilangan lalu bagi dengan banyaknya bilangan.',
} as const

export function mean(p: Params): number {
  return p.values.reduce((a, b) => a + b, 0) / p.values.length
}

export function generate(rng: Rng): Params {
  const n = rng.int(3, 5)
  // pick a whole-number mean, then n values summing to n*mean
  const target = rng.int(5, 40)
  const values: number[] = []
  let remaining = target * n
  for (let i = 0; i < n - 1; i++) {
    const lo = Math.max(2, remaining - 60 * (n - 1 - i))
    const hi = Math.min(60, remaining - 2 * (n - 1 - i))
    const v = rng.int(lo, hi)
    values.push(v)
    remaining -= v
  }
  values.push(remaining) // guaranteed 2..60 by the bounds above
  return { values: rng.shuffle(values) }
}

export function render(params: Params) {
  const list = params.values.join(', ')
  const sum = params.values.reduce((a, b) => a + b, 0)
  const answer = mean(params)
  const hint_steps_en = [
    `Add them all: ${params.values.join(' + ')} = ${sum}.`,
    `Divide by how many there are: ${sum} ÷ ${params.values.length} = ${answer}.`,
  ]
  const hint_steps_id = [
    `Jumlahkan semua: ${params.values.join(' + ')} = ${sum}.`,
    `Bagi dengan banyaknya: ${sum} ÷ ${params.values.length} = ${answer}.`,
  ]
  return {
    body_en: `Find the average of these numbers: ${list}.\n\nFind: What is their average?`,
    body_id: `Cari rata-rata dari bilangan berikut: ${list}.\n\nCari: Berapa rata-ratanya?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Add all the numbers, then divide by how many numbers there are.',
    hint_id: 'Jumlahkan semua bilangan, lalu bagi dengan banyaknya bilangan.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildAverageBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

- [ ] **Step 4: Write `<slug>/breakdown.ts`**

```ts
import type { Breakdown, BreakdownHighlight } from '../types.js'
import { mean, type Params } from './index.js'

export function buildAverageBreakdown(params: Params): Breakdown {
  const sum = params.values.reduce((a, b) => a + b, 0)
  const answer = mean(params)
  const highlights: BreakdownHighlight[] = [
    ...params.values.map((v) => ({
      category: 'fact' as const,
      phrase_en: String(v),
      phrase_id: String(v),
      note_en: `One of the numbers: ${v}.`,
      note_id: `Salah satu bilangannya: ${v}.`,
    })),
    {
      category: 'question',
      phrase_en: 'their average',
      phrase_id: 'rata-ratanya',
      note_en: 'The average = total ÷ how many numbers.',
      note_id: 'Rata-rata = total ÷ banyaknya bilangan.',
    },
  ]
  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Numbers', label_id: 'Bilangan', value: params.values.join(', ') },
      { label_en: 'Sum', label_id: 'Jumlah', value: String(sum) },
      { label_en: 'Count', label_id: 'Banyaknya', value: String(params.values.length) },
      { label_en: 'Average', label_id: 'Rata-rata', value: String(answer) },
    ],
    strategy: { conceptSlug: 'average-of-numbers', name_en: 'Sum then divide by the count', name_id: 'Jumlahkan lalu bagi banyaknya' },
    trap: null,
    answer: { form: 'number', unit: null, value: String(answer) },
    vocab: [],
  }
}
```

- [ ] **Step 5: Register — `registry.ts`, `taxonomy.ts`, `curriculum.ts`**

`registry.ts`: add `import averageOfNumbers from './average-of-numbers/index.js'`
and `'average-of-numbers': averageOfNumbers,` in `CONCEPTS`.

`taxonomy.ts`: in `CONCEPT_TAGS` add
`'average-of-numbers': { strand: 'AR', topic: 'AR-CALC', difficulty: 2, isOlympiad: false },`
and in `SHORT_ID_BY_SLUG` add the next free A-code, e.g. `'average-of-numbers': 'A10',`
(check the file for the current max in that letter series first — never reuse).

`curriculum.ts`: in `CURRICULUM` add
`'average-of-numbers': { subjectKey: 'g3-cerita-multi', difficulty: 2, sortOrder: <next free in subject>, tags: ['arithmetic'] },`
(pick a `sortOrder` not already used in that subject; tags must be existing `TAGS` keys).

- [ ] **Step 6: Run the concept test + the registration guards**

Run: `npx vitest run api/services/wmi/concepts/average-of-numbers api/services/wmi/concepts/taxonomy.test.ts api/services/wmi/concepts/curriculum.test.ts`
Expected: PASS (concept correctness + every-concept-tagged/curriculumed guards).

- [ ] **Step 7: Backfill conceptSlug on this concept's drill questions**

Edit `docs/reference/wmi-map-raw/*.json`: for rows whose `proposedType` matches
this cluster, set `slug` to the new slug and remove `UNCOVERED`. Re-run
`npx tsx scripts/wmi/write-concept-slugs.ts` to push the slug into the seed JSONs.

- [ ] **Step 8: Commit**

```bash
git add api/services/wmi/concepts/average-of-numbers api/services/wmi/concepts/registry.ts \
  api/services/wmi/concepts/taxonomy.ts api/services/wmi/concepts/curriculum.ts \
  docs/reference/wmi-map-raw db/seed/wmi/papers
git commit -m "feat(wmi): add average-of-numbers practice concept + link drills"
```

---

## Task 6: Easy/Medium/Hard band helper

**Files:**
- Modify: `api/services/wmi/concepts/taxonomy.ts`
- Modify: `api/services/wmi/concepts/taxonomy.test.ts`

**Interfaces:**
- Produces: `type DifficultyBand = 'easy' | 'medium' | 'hard'` and
  `difficultyBand(d: 1|2|3|4|5): DifficultyBand`.

- [ ] **Step 1: Write the failing test** (append to `taxonomy.test.ts`)

```ts
import { difficultyBand } from './taxonomy.js'

describe('difficultyBand', () => {
  test('collapses 1-5 into easy/medium/hard', () => {
    expect([1, 2, 3, 4, 5].map((d) => difficultyBand(d as 1 | 2 | 3 | 4 | 5)))
      .toEqual(['easy', 'easy', 'medium', 'hard', 'hard'])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run api/services/wmi/concepts/taxonomy.test.ts`
Expected: FAIL — `difficultyBand is not a function`.

- [ ] **Step 3: Add the helper** (in `taxonomy.ts`, after `ConceptTags`)

```ts
export type DifficultyBand = 'easy' | 'medium' | 'hard'
// Contest difficulty (1-5) collapsed to the learner-facing E/M/H facet.
// Distinct from curriculum.ts's within-subject 1-3 ordering.
export function difficultyBand(d: 1 | 2 | 3 | 4 | 5): DifficultyBand {
  return d <= 2 ? 'easy' : d === 3 ? 'medium' : 'hard'
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run api/services/wmi/concepts/taxonomy.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/concepts/taxonomy.ts api/services/wmi/concepts/taxonomy.test.ts
git commit -m "feat(wmi): difficultyBand helper (easy/medium/hard from difficulty 1-5)"
```

---

## Task 7: Surface the band in the concept listing

**Files:**
- Modify: `api/services/wmi/concepts/preview.ts` (concept listing consumed by garden)
- Test: `api/services/wmi/concepts/preview.test.ts`

**Interfaces:**
- Consumes: `difficultyBand`, `CONCEPT_TAGS` (Task 6).
- Produces: each listed concept carries a `band: DifficultyBand` field.

- [ ] **Step 1: Read `preview.ts` to find the concept-list shape**

Run: `sed -n '1,120p' api/services/wmi/concepts/preview.ts`
Identify the object built per concept in the listing function.

- [ ] **Step 2: Write the failing test** (append to `preview.test.ts`)

```ts
test('each listed concept exposes an easy/medium/hard band', () => {
  const list = /* call the listing fn used by the garden, e.g. */ buildConceptPreviews()
  expect(list.length).toBeGreaterThan(0)
  for (const c of list) expect(['easy', 'medium', 'hard']).toContain(c.band)
})
```

Match the actual exported function name found in Step 1 (replace
`buildConceptPreviews`); import it and `difficultyBand` at the top of the test.

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run api/services/wmi/concepts/preview.test.ts`
Expected: FAIL — `band` undefined.

- [ ] **Step 4: Add `band` to each listed concept**

In `preview.ts`, where each concept object is built, add:
`band: difficultyBand(CONCEPT_TAGS[slug].difficulty),`
Import `difficultyBand` and `CONCEPT_TAGS` from `./taxonomy.js`. Add `band` to
the listing item's TypeScript type. If a frontend type mirrors it
(`src/types/wmi.ts`), add the field there too.

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run api/services/wmi/concepts/preview.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add api/services/wmi/concepts/preview.ts api/services/wmi/concepts/preview.test.ts src/types/wmi.ts
git commit -m "feat(wmi): expose easy/medium/hard band on concept listing"
```

---

## Task 8: Full-suite validation + rollout notes

**Files:** none (verification only)

- [ ] **Step 1: Run the whole concepts vitest suite**

Run: `npx vitest run api/services/wmi/concepts`
Expected: PASS — including the 4 registration guards for every new concept.

- [ ] **Step 2: One sequential full typecheck**

Run: `node --max-old-space-size=4096 ./node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Assert every drill question's conceptSlug resolves**

```bash
node -e 'const fs=require("fs"),d="db/seed/wmi/papers";const slugs=new Set(Object.keys(require("./api/services/wmi/concepts/registry.ts").CONCEPTS||{}));let bad=0,set=0,tot=0;for(const f of fs.readdirSync(d).filter(f=>f.endsWith(".json"))){for(const q of (JSON.parse(fs.readFileSync(d+"/"+f)).questions||[])){tot++;const s=q.breakdown?.strategy?.conceptSlug;if(s){set++;}}}console.log("total",tot,"withSlug",set)' 2>/dev/null || echo "use tsx: npx tsx -e '...' importing ALL_SLUGS to validate slugs"
```
Preferred (typed): a short `npx tsx` snippet importing `ALL_SLUGS` from
`registry.js`, asserting every non-null `conceptSlug` is in `ALL_SLUGS`.
Expected: no unknown slugs; `withSlug` == covered count from Task 3's report.

- [ ] **Step 4: Record rollout follow-ups (do NOT run against prod here)**

Add a line to project memory / PR description:
- Run `regen-stale-instances.ts` so `wmi_concept_instances` gains rows for the
  new concepts (see `project_wmi_concept_instances`).
- Seed JSON changes need a prod re-import (see `project_wmi_paper_review_2026-07`).
- New concepts sync to the `wmi_concepts` DB table via `bootstrap.ts`.

- [ ] **Step 5: Final commit (if any doc/notes changed)**

```bash
git add -A && git commit -m "chore(wmi): validation notes for concept map + gap-fill rollout"
```

---

## Self-Review

- **Spec coverage:** Phase 1 map → Tasks 1–4; checkpoint → Task 3; Phase 2
  gap-fill → Task 5 template (one instance per approved cluster); Phase 3 E/M/H
  → Tasks 6–7; verification + rollout → Task 8. All spec sections covered.
- **Data dependency:** Phase 2 concept identities are unknown until Task 3's
  checkpoint — represented as a fully-coded template, not placeholders.
- **Type consistency:** `conceptSlug` (`breakdown.strategy.conceptSlug`),
  `difficultyBand`/`DifficultyBand`, `band`, `mean`/`Params` used consistently
  across tasks. `SHORT_ID_BY_SLUG` uniqueness + curriculum `sortOrder`
  uniqueness flagged as per-instance checks in Task 5.
- **Registration guards:** all four vitest suites that enforce
  registry↔taxonomy↔curriculum consistency are run in Task 5 Step 6 and Task 8.
