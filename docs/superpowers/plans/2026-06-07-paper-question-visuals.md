# Per-Paper-Question Custom Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give a specific WMI paper question a hand-built illustration (replacing its OCR scan) and a post-answer counting animation, delivered first for WMI-19F1 Q1 (candies, 22+22+4=48), via a reusable per-question registry.

**Architecture:** Add a stable `code` (`WMI-19F1-Q1`) to question DTOs; a frontend registry maps a code to `{ Illustration, Explainer }`; `WmiQuestionView` (the one component every surface uses) swaps the figure for the registry illustration and plays the explainer post-answer via a generalized `WmiExplainer` host. The candy visuals are built in the existing framer-motion + `useBeatControl` explainer framework.

**Tech Stack:** Express + `pg` (ESM, `.js`-suffixed relative imports under `api/`), React + Vite + Tailwind + framer-motion, `vitest`. Spec: `docs/superpowers/specs/2026-06-07-paper-question-visuals-design.md`.

---

## Context the implementer must know

- **`npm run check`** = `tsc --noEmit` (covers `src` + `api`). **`npm run test`** = `vitest run` (include `api/**/*.test.ts`, `src/**/*.test.ts`). **`npm run lint`** = `eslint .` (3 pre-existing `react-refresh` warnings in admin files are OK; introduce no new ones).
- **`api/` ESM:** relative imports use a `.js` suffix even for `.ts`. **`src/` imports** have NO extension (Vite).
- **DB / network commands** (the dev-DB smoke in Task 2) need **`dangerouslyDisableSandbox: true`** (LAN Postgres in `DATABASE_URL`). The dev DB has the seeded 2019 papers (WMI-19F1 = 2019 Grade 1 Final).
- **Frontend `paperCode`** already exists: `src/lib/wmiPaperCode.ts` → `WMI-19F1` format (`WMI-[YY][F|P][grade]`). The server util must match it.
- **`ExplainerProps`** (`src/components/wmi/concepts/explainers/registry.ts`): `{ params: unknown; correctAnswer: string; lang?: 'en'|'id'; step?; playing?; onStepCount?; onStepChange?; onPlayEnd? }`.
- **`useBeatControl(finalIndex, { ...props, holds })`** drives the current beat for a carousel-hosted explainer (`src/components/wmi/concepts/explainers/useBeatControl.ts`).
- **`Lang`** type: `import type { Lang } from '../concepts/explainers/makeTenSteps'` (= `'en' | 'id'`).
- Do NOT push until the final task; commit locally per task. Touch only the files listed in each task (a parallel session shares the tree).

## File structure

| File | Responsibility |
|---|---|
| `api/services/wmi/paperCode.ts` (+`.test.ts`) | Server `paperCode` / `questionCode` (matches frontend format) |
| `api/services/wmi/papers.ts` | Add `code` to `WmiQuestionDto`; populate in `listWmiQuestionsForPaper` + `getWmiDrillQuestion` |
| `api/services/wmi/paperReviews.ts` | Add `code` to `AdminPaperQuestion`; populate in `listAdminPaperQuestions` |
| `src/types/wmi.ts` | `code?: string` on `WmiQuestion` |
| `src/lib/wmiAdminApi.ts` | `code?: string` on `AdminPaperQuestion` |
| `src/components/wmi/WmiExplainer.tsx` | Accept an explainer component directly (optional prop) |
| `src/components/wmi/paperQuestions/candyVisual.tsx` | Shared candy SVG primitive + row layout |
| `src/components/wmi/paperQuestions/CandyRowsIllustration.tsx` | Static 22/22/4 illustration |
| `src/components/wmi/paperQuestions/candyCountSteps.ts` (+`.test.ts`) | Counting storyboard |
| `src/components/wmi/paperQuestions/CandyCountExplainer.tsx` | Animated counting explainer |
| `src/components/wmi/paperQuestions/registry.ts` | code → `{ Illustration, Explainer }` lookup |
| `src/components/wmi/WmiQuestionView.tsx` | Swap figure for illustration; play explainer post-answer |

---

### Task 1: Server `paperCode` / `questionCode` util

**Files:**
- Create: `api/services/wmi/paperCode.test.ts`
- Create: `api/services/wmi/paperCode.ts`

- [ ] **Step 1: Write the failing test**

Create `api/services/wmi/paperCode.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { paperCode, questionCode } from './paperCode.js'

describe('paperCode / questionCode', () => {
  test('paperCode formats WMI-[YY][F|P][grade] (matches the frontend util)', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1 })).toBe('WMI-19F1')
    expect(paperCode({ year: 2020, round: 'semifinal', grade: 3 })).toBe('WMI-20P3')
    expect(paperCode({ year: 2025, round: 'final', grade: 0 })).toBe('WMI-25F0')
  })

  test('questionCode appends -Q<number>', () => {
    expect(questionCode({ year: 2019, round: 'final', grade: 1 }, 1)).toBe('WMI-19F1-Q1')
    expect(questionCode({ year: 2019, round: 'final', grade: 1 }, 16)).toBe('WMI-19F1-Q16')
  })
})
```

- [ ] **Step 2: Run — verify it fails**

Run: `npx vitest run api/services/wmi/paperCode.test.ts`
Expected: FAIL (cannot resolve `./paperCode.js`).

- [ ] **Step 3: Implement**

Create `api/services/wmi/paperCode.ts`:

```ts
export type PaperCodeInput = {
  year: number
  round: 'semifinal' | 'final'
  grade: number
}

// Short human-readable code: WMI-[YY][F|P][grade]. Mirrors the frontend util in
// src/lib/wmiPaperCode.ts — keep the two formats in sync.
export function paperCode({ year, round, grade }: PaperCodeInput): string {
  const yy = String(year).slice(-2)
  const r = round === 'final' ? 'F' : 'P'
  return `WMI-${yy}${r}${grade}`
}

// Stable per-question code, e.g. WMI-19F1-Q1.
export function questionCode(paper: PaperCodeInput, number: number): string {
  return `${paperCode(paper)}-Q${number}`
}
```

- [ ] **Step 4: Run — verify it passes**

Run: `npx vitest run api/services/wmi/paperCode.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/paperCode.ts api/services/wmi/paperCode.test.ts
git commit -m "feat(wmi): server paperCode/questionCode util"
```
End every commit body in this plan with:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 2: Populate `code` on question DTOs (backend)

**Files:**
- Modify: `api/services/wmi/papers.ts`
- Modify: `api/services/wmi/paperReviews.ts`

- [ ] **Step 1: Add `code` to `WmiQuestionDto` + import the util**

In `api/services/wmi/papers.ts`, add the import at the top:
```ts
import { questionCode } from './paperCode.js'
```
Add `code` to the `WmiQuestionDto` interface (after `difficulty`). **Optional** — the
SQL rows don't select a `code` column; the service mapping sets it. Optional also
keeps synthetic concept questions valid:
```ts
  difficulty: number | null
  code?: string
```

- [ ] **Step 2: Populate `code` in `listWmiQuestionsForPaper`**

Replace the `listWmiQuestionsForPaper` body so the query joins the paper and the mapping computes `code`:

```ts
export async function listWmiQuestionsForPaper(
  paperId: string,
  executor?: DbExecutor,
): Promise<WmiQuestionDto[]> {
  const rows = await query<WmiQuestionDto & { year: number; round: 'semifinal' | 'final'; grade: number }>(
    `
      SELECT q.id, q.paper_id, q.number, q.body_en, q.body_id, q.answer_type, q.choices_en, q.choices_id,
             q.figure_url, q.hint_en, q.hint_id, q.difficulty,
             p.year, p.round, p.grade
      FROM wmi_questions q
      JOIN wmi_papers p ON p.id = q.paper_id
      WHERE q.paper_id = $1
      ORDER BY q.number ASC
    `,
    [paperId],
    executor,
  )
  return rows.map(({ year, round, grade, ...q }) => ({
    ...normalizeQuestion(q),
    code: questionCode({ year, round, grade }, q.number),
  }))
}
```
(Destructuring `year/round/grade` out keeps `q` a clean `WmiQuestionDto` — its
optional `code` is `undefined` at the row level — so the paper columns never leak.
`normalizeQuestion(q)` returns the normalized DTO and the explicit `code:` property
overrides the `undefined`. Because `code` is optional, the query row type compiles
even though the SQL selects no `code` column.)

- [ ] **Step 3: Populate `code` in `getWmiDrillQuestion`**

Both SELECTs in `getWmiDrillQuestion` already `JOIN wmi_papers p`. Add `p.year, p.round, p.grade` to each SELECT list (alongside the existing `q.*` columns), type each `queryOne` row as `WmiQuestionDto & { year: number; round: 'semifinal' | 'final'; grade: number }`, and change the two `return normalizeQuestion(question)` sites to:
```ts
    const { year, round, grade, ...q } = question
    return { ...normalizeQuestion(q), code: questionCode({ year, round, grade }, q.number) }
```
Apply to both the "recent-excluded" query result and the fallback query result (whichever is non-null). Keep the existing `if (!question) throw ...` logic; do the destructure only on the final non-null `question`.

- [ ] **Step 4: Add `code` to admin questions**

In `api/services/wmi/paperReviews.ts`:
- Add the import: `import { questionCode } from './paperCode.js'`
- Add `code?: string` to the `AdminPaperQuestion` type (after `difficulty`) — optional, set by the mapping below.
- Replace `listAdminPaperQuestions` so it joins the paper and maps `code`:
```ts
export async function listAdminPaperQuestions(paperId: string): Promise<AdminPaperQuestion[]> {
  const rows = await query<AdminPaperQuestion & { year: number; round: 'semifinal' | 'final'; grade: number }>(
    `SELECT q.id, q.paper_id, q.number, q.body_en, q.body_id, q.answer_type, q.choices_en, q.choices_id,
            q.answer, q.figure_url, q.hint_en, q.hint_id, q.difficulty,
            p.year, p.round, p.grade
     FROM wmi_questions q
     JOIN wmi_papers p ON p.id = q.paper_id
     WHERE q.paper_id = $1
     ORDER BY q.number ASC`,
    [paperId],
  )
  return rows.map(({ year, round, grade, ...q }) => ({
    ...q,
    code: questionCode({ year, round, grade }, q.number),
  }))
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 6: Dev-DB smoke** (Bash, `dangerouslyDisableSandbox: true`)

```bash
npx tsx -e "Promise.resolve().then(async()=>{const pr=await import('./api/services/wmi/paperReviews.ts');const ps=await pr.listPapersForAdmin();const p=ps.find(x=>x.year===2019&&x.grade===1);const qs=await pr.listAdminPaperQuestions(p.id);console.log('q1.code',qs[0].code);process.exit(0)})"
```
Expected: prints `q1.code WMI-19F1-Q1`.

- [ ] **Step 7: Commit**

```bash
git add api/services/wmi/papers.ts api/services/wmi/paperReviews.ts
git commit -m "feat(wmi): add stable per-question code to question DTOs"
```

---

### Task 3: Frontend types carry `code`

**Files:**
- Modify: `src/types/wmi.ts`
- Modify: `src/lib/wmiAdminApi.ts`

- [ ] **Step 1: Add `code` to `WmiQuestion`**

In `src/types/wmi.ts`, add to the `WmiQuestion` interface (after `difficulty`):
```ts
  difficulty: number | null
  code?: string
```
(Optional — synthetic concept questions don't set it.)

- [ ] **Step 2: Add `code` to `AdminPaperQuestion`**

In `src/lib/wmiAdminApi.ts`, add to the `AdminPaperQuestion` interface (after `difficulty`):
```ts
  difficulty: number | null
  code?: string
```

- [ ] **Step 3: Typecheck + commit**

Run: `npm run check` (exit 0).
```bash
git add src/types/wmi.ts src/lib/wmiAdminApi.ts
git commit -m "feat(wmi): question code on frontend types"
```

---

### Task 4: Generalize `WmiExplainer` to accept a component

**Files:**
- Modify: `src/components/wmi/WmiExplainer.tsx`

- [ ] **Step 1: Accept an explainer component directly**

Change the imports and `Props`/lookup so an explainer component can be passed in (used for paper-question explainers), falling back to slug lookup (used by concepts):

Replace:
```ts
import { getExplainer } from './concepts/explainers/registry'

interface Props {
  slug: string
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export default function WmiExplainer({ slug, params, correctAnswer, lang }: Props) {
  const Explainer = getExplainer(slug)
```
with:
```ts
import type { ComponentType } from 'react'
import { getExplainer } from './concepts/explainers/registry'
import type { ExplainerProps } from './concepts/explainers/registry'

interface Props {
  slug?: string
  explainer?: ComponentType<ExplainerProps>
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export default function WmiExplainer({ slug, explainer, params, correctAnswer, lang }: Props) {
  const Explainer = explainer ?? (slug ? getExplainer(slug) : null)
```
Everything else in the file (the `useState`s, carousel controls, the `<Explainer ... />` render) is unchanged.

- [ ] **Step 2: Typecheck + lint (regression check)**

Run: `npm run check` (exit 0) and `npm run lint` (no new errors). The existing concept call sites pass `slug=` and still resolve via `getExplainer`.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/WmiExplainer.tsx
git commit -m "feat(wmi): WmiExplainer can host an explainer component directly"
```

---

### Task 5: Candy visuals (illustration + storyboard + explainer)

**Files:**
- Create: `src/components/wmi/paperQuestions/candyVisual.tsx`
- Create: `src/components/wmi/paperQuestions/CandyRowsIllustration.tsx`
- Create: `src/components/wmi/paperQuestions/candyCountSteps.ts`
- Create: `src/components/wmi/paperQuestions/candyCountSteps.test.ts`
- Create: `src/components/wmi/paperQuestions/CandyCountExplainer.tsx`

- [ ] **Step 1: Shared candy primitive + layout**

Create `src/components/wmi/paperQuestions/candyVisual.tsx`:

```tsx
export const CANDY_ROWS = [22, 22, 4] as const
export const CANDY_TOTAL = CANDY_ROWS.reduce((s, n) => s + n, 0) // 48

const COLORS = ['#F97316', '#2f6df0', '#EC4899', '#10B981', '#A855F7']
const PAD_X = 22
const GAP = 20
const R = 7
const ROW_Y = [40, 84, 128]
export const VIEW_W = PAD_X * 2 + (Math.max(...CANDY_ROWS) - 1) * GAP + R * 2
export const VIEW_H = 168

export interface CandyPos {
  row: number
  cx: number
  cy: number
  color: string
}

export function candyPositions(rows: readonly number[] = CANDY_ROWS): CandyPos[] {
  const out: CandyPos[] = []
  let n = 0
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      out.push({ row, cx: PAD_X + R + i * GAP, cy: ROW_Y[row] ?? ROW_Y[ROW_Y.length - 1], color: COLORS[n % COLORS.length] })
      n++
    }
  })
  return out
}

// A small wrapped candy: oval body + two triangular wrapper ends.
export function Candy({ cx, cy, color, opacity = 1 }: { cx: number; cy: number; color: string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <polygon points={`${cx - R - 6},${cy - 5} ${cx - R - 6},${cy + 5} ${cx - R},${cy}`} fill={color} />
      <polygon points={`${cx + R + 6},${cy - 5} ${cx + R + 6},${cy + 5} ${cx + R},${cy}`} fill={color} />
      <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.78} fill={color} />
      <ellipse cx={cx - 2} cy={cy - 2} rx={2} ry={1.4} fill="#ffffff" opacity={0.6} />
    </g>
  )
}
```

- [ ] **Step 2: Static illustration**

Create `src/components/wmi/paperQuestions/CandyRowsIllustration.tsx`:

```tsx
import { Candy, candyPositions, CANDY_TOTAL, CANDY_ROWS, VIEW_W, VIEW_H } from './candyVisual'

export default function CandyRowsIllustration() {
  const positions = candyPositions()
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`${CANDY_TOTAL} candies in rows of ${CANDY_ROWS.join(', ')}`}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 460, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {positions.map((p, i) => (
          <Candy key={i} cx={p.cx} cy={p.cy} color={p.color} />
        ))}
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: Storyboard test (write first)**

Create `src/components/wmi/paperQuestions/candyCountSteps.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { buildCandyCountSteps } from './candyCountSteps'

describe('buildCandyCountSteps', () => {
  test('counts the rows with running totals 22, 44, 48 and ends at 48', () => {
    const sb = buildCandyCountSteps('en')
    expect(sb.rows).toEqual([22, 22, 4])
    expect(sb.total).toBe(48)
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'row', 'row', 'row', 'result'])
    expect(sb.steps.filter((s) => s.phase === 'row').map((s) => s.running)).toEqual([22, 44, 48])
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('22 + 22 + 4 = 48')
  })

  test('Indonesian captions', () => {
    const sb = buildCandyCountSteps('id')
    expect(sb.steps[0].caption.toLowerCase()).toContain('hitung')
  })
})
```

- [ ] **Step 4: Run — verify it fails**

Run: `npx vitest run src/components/wmi/paperQuestions/candyCountSteps.test.ts`
Expected: FAIL (cannot resolve `./candyCountSteps`).

- [ ] **Step 5: Implement the storyboard**

Create `src/components/wmi/paperQuestions/candyCountSteps.ts`:

```ts
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CANDY_ROWS, CANDY_TOTAL } from './candyVisual'

export type CandyPhase = 'show' | 'row' | 'result'

export interface CandyStep {
  phase: CandyPhase
  /** Row being counted this beat (null on show/result). */
  row: number | null
  /** Running total after this beat. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CandyStoryboard {
  rows: number[]
  total: number
  steps: CandyStep[]
  finalIndex: number
}

export function buildCandyCountSteps(lang: Lang): CandyStoryboard {
  const rows = [...CANDY_ROWS]
  const total = CANDY_TOTAL
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CandyStep[] = [
    { phase: 'show', row: null, running: 0, hold: 1500, result: false, caption: t('How many candies are there?', 'Ada berapa banyak permen? Hitung!') },
  ]
  let running = 0
  rows.forEach((count, i) => {
    running += count
    steps.push({
      phase: 'row',
      row: i,
      running,
      hold: 1700,
      result: false,
      caption: t(`Row ${i + 1}: ${count}. Total so far ${running}.`, `Baris ${i + 1}: ${count}. Sejauh ini ${running}.`),
    })
  })
  steps.push({
    phase: 'result',
    row: null,
    running: total,
    hold: 0,
    result: true,
    caption: t(`${rows.join(' + ')} = ${total} candies.`, `${rows.join(' + ')} = ${total} permen.`),
  })

  return { rows, total, steps, finalIndex: steps.length - 1 }
}
```

- [ ] **Step 6: Run — verify it passes**

Run: `npx vitest run src/components/wmi/paperQuestions/candyCountSteps.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Implement the animated explainer**

Create `src/components/wmi/paperQuestions/CandyCountExplainer.tsx`:

```tsx
import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Candy, candyPositions, VIEW_W, VIEW_H } from './candyVisual'
import { buildCandyCountSteps } from './candyCountSteps'

const GREEN = '#10B981'

export default function CandyCountExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCandyCountSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const positions = useMemo(() => candyPositions(), [])

  const ariaLabel =
    lang === 'id'
      ? `Hitung permen baris demi baris: ${story.rows.join(' + ')} = ${story.total}.`
      : `Count the candies row by row: ${story.rows.join(' + ')} = ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 460 }} aria-hidden="true">
          {positions.map((p, i) => {
            const dim = beat.row !== null && p.row !== beat.row
            const counted = beat.phase === 'result' || (beat.row !== null && p.row <= beat.row)
            return <Candy key={i} cx={p.cx} cy={p.cy} color={counted || beat.phase === 'show' ? p.color : '#cbd5e1'} opacity={dim ? 0.3 : 1} />
          })}
        </svg>

        {beat.running > 0 && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: beat.result ? GREEN : '#2f6df0' }}>
            {beat.phase === 'result' ? `${story.rows.join(' + ')} = ${story.total}` : beat.running}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: SSR smoke**

```bash
cat > _smoke_candy.tsx <<'EOF'
import { renderToString } from 'react-dom/server'
import { createElement as h } from 'react'
import CandyCountExplainer from './src/components/wmi/paperQuestions/CandyCountExplainer'
import CandyRowsIllustration from './src/components/wmi/paperQuestions/CandyRowsIllustration'
import { buildCandyCountSteps } from './src/components/wmi/paperQuestions/candyCountSteps'
const sb = buildCandyCountSteps('en')
for (let step = 0; step <= sb.finalIndex; step++)
  for (const lang of ['en','id'] as const) {
    const html = renderToString(h(CandyCountExplainer, { params: {}, correctAnswer: '48', lang, step, playing: false }))
    if (!html || html.length < 80) throw new Error(`empty explainer step ${step} ${lang}`)
  }
const ill = renderToString(h(CandyRowsIllustration, {}))
if (!ill.includes('<svg')) throw new Error('illustration did not render svg')
console.log('SMOKE OK — candy explainer all beats en/id; illustration renders')
EOF
npx tsx _smoke_candy.tsx 2>&1 | tail -3 && rm -f _smoke_candy.tsx
```
Expected: `SMOKE OK — candy explainer all beats en/id; illustration renders`.

- [ ] **Step 9: Typecheck + lint + commit**

Run: `npm run check` (exit 0), `npm run lint` (no new errors).
```bash
git add src/components/wmi/paperQuestions/candyVisual.tsx src/components/wmi/paperQuestions/CandyRowsIllustration.tsx src/components/wmi/paperQuestions/candyCountSteps.ts src/components/wmi/paperQuestions/candyCountSteps.test.ts src/components/wmi/paperQuestions/CandyCountExplainer.tsx
git commit -m "feat(wmi): candy counting illustration + animation (22+22+4=48)"
```

---

### Task 6: Registry + `WmiQuestionView` integration

**Files:**
- Create: `src/components/wmi/paperQuestions/registry.ts`
- Create: `src/components/wmi/paperQuestions/registry.test.ts`
- Modify: `src/components/wmi/WmiQuestionView.tsx`

- [ ] **Step 1: Registry test (write first)**

Create `src/components/wmi/paperQuestions/registry.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { getQuestionIllustration, getQuestionExplainer } from './registry'

describe('paper question visual registry', () => {
  test('returns candy components for WMI-19F1-Q1', () => {
    expect(getQuestionIllustration('WMI-19F1-Q1')).toBeTruthy()
    expect(getQuestionExplainer('WMI-19F1-Q1')).toBeTruthy()
  })
  test('returns null for unknown or missing codes', () => {
    expect(getQuestionIllustration('WMI-19F1-Q2')).toBeNull()
    expect(getQuestionExplainer(undefined)).toBeNull()
  })
})
```

- [ ] **Step 2: Run — verify it fails**

Run: `npx vitest run src/components/wmi/paperQuestions/registry.test.ts`
Expected: FAIL (cannot resolve `./registry`).

- [ ] **Step 3: Implement the registry**

Create `src/components/wmi/paperQuestions/registry.ts`:

```ts
import type { ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import CandyRowsIllustration from './CandyRowsIllustration'
import CandyCountExplainer from './CandyCountExplainer'

interface QuestionVisual {
  Illustration?: ComponentType
  Explainer?: ComponentType<ExplainerProps>
}

const VISUALS: Record<string, QuestionVisual> = {
  'WMI-19F1-Q1': { Illustration: CandyRowsIllustration, Explainer: CandyCountExplainer },
}

export function getQuestionIllustration(code?: string): ComponentType | null {
  return (code && VISUALS[code]?.Illustration) || null
}

export function getQuestionExplainer(code?: string): ComponentType<ExplainerProps> | null {
  return (code && VISUALS[code]?.Explainer) || null
}
```

- [ ] **Step 4: Run — verify it passes**

Run: `npx vitest run src/components/wmi/paperQuestions/registry.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire into `WmiQuestionView`**

In `src/components/wmi/WmiQuestionView.tsx`:

Add imports (with the other imports near the top):
```ts
import WmiExplainer from './WmiExplainer'
import { getQuestionIllustration, getQuestionExplainer } from './paperQuestions/registry'
```

Inside the component body (before the `return`), derive the custom visuals:
```ts
  const Illustration = getQuestionIllustration(question.code)
  const QuestionExplainer = getQuestionExplainer(question.code)
```

Replace the figure line:
```tsx
      <WmiFigure src={question.figure_url} />
```
with:
```tsx
      {Illustration ? <Illustration /> : <WmiFigure src={question.figure_url} />}
```

Add the post-answer animation just before the closing `</article>` (after the multiple_choice/fill_in block):
```tsx
      {revealed && QuestionExplainer && (
        <WmiExplainer explainer={QuestionExplainer} params={{}} correctAnswer="" lang={lang} />
      )}
```

- [ ] **Step 6: Typecheck + lint**

Run: `npm run check` (exit 0) and `npm run lint` (no new errors).

- [ ] **Step 7: Commit**

```bash
git add src/components/wmi/paperQuestions/registry.ts src/components/wmi/paperQuestions/registry.test.ts src/components/wmi/WmiQuestionView.tsx
git commit -m "feat(wmi): wire per-question visuals into WmiQuestionView (candy Q1)"
```

---

### Task 7: Verify end-to-end + push

**Files:** none (verification + push).

- [ ] **Step 1: Full gates**

Run: `npm run check` (exit 0), `npm run lint` (no new errors), `npm run test` (all pass; the new candy/registry/paperCode tests included). Report totals.

- [ ] **Step 2: Manual app spot-check**

Run `npm run dev`. As admin (`shops@decasa.co.id`), open `/admin/wmi-drill` → 2019 Grade 1 paper (`WMI-19F1`) → question 1: the **candy illustration** replaces the blurry scan. (The admin preview renders questions read-only/revealed, so the **counting animation** appears with its play/pause carousel.) Then check the member exam for the same paper: Q1 shows the illustration; after answering, the animation plays. Other questions/papers are unchanged (still show their scan figures, no animation).

- [ ] **Step 3: Commit any fixups + push**

```bash
git add -A
git commit -m "chore(wmi): verify per-question candy visuals end-to-end"   # only if fixups
git push
```
If `git push` is rejected (parallel session pushed), `git pull --rebase` then `git push`; report conflicts (do NOT force-push).

---

## Self-review notes

- **Spec coverage:** stable `code` (server util Task 1, DTOs Task 2, FE types Task 3); `WmiExplainer` generalization (Task 4); candy illustration + storyboard + explainer (Task 5); registry + single `WmiQuestionView` integration (Task 6); verify/push (Task 7). All spec sections map to a task.
- **Type consistency:** `questionCode(paper, number)` signature is identical in Tasks 1–2; `code` field added to `WmiQuestionDto`/`WmiQuestion`/`AdminPaperQuestion` consistently; `getQuestionIllustration`/`getQuestionExplainer(code?)` names match between registry (Task 6) and WmiQuestionView use; `ExplainerProps` import path (`../concepts/explainers/registry`) is consistent across candy explainer + registry.
- **No `code` → existing behavior:** WmiQuestionView only swaps the figure / plays an animation when the registry has an entry for `question.code`; concept/synthetic questions (no code) are unaffected; `WmiExplainer`'s `explainer` prop is additive.
