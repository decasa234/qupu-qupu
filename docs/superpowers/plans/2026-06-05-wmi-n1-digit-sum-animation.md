# N1 digit-sum animation Implementation Plan (rev. 2 — matches A1 / framer-motion over DOM)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a concrete-dots explainer for concept N1 (`digit-sum`) that teaches what a digit is, built in the SAME style as the existing A1 `make-ten` explainer (framer-motion over DOM/Tailwind).

**Architecture:** Mirror `SingleDigitAdditionExplainer` + `makeTenSteps`: a pure `buildDigitSumSteps(n, lang)` storyboard module (unit-tested) returns ordered `steps[]` (each a full visual state + bilingual caption) and `finalIndex`; a self-contained Tailwind/`motion` component advances the step index on an interval, honors `useReducedMotion`, and uses `LayoutGroup` + `layoutId` so the digit dots slide from their per-tile groups into one merged group. Registered by slug → appears in the proofreading Animation tab automatically.

**Tech Stack:** React 18, framer-motion (already installed), Tailwind, vitest, TypeScript.

**Reference files to imitate (read them):**
- `src/components/wmi/concepts/explainers/makeTenSteps.ts`
- `src/components/wmi/concepts/explainers/SingleDigitAdditionExplainer.tsx`
- `src/components/wmi/concepts/explainers/registry.ts`

> **Note:** an earlier rev of this plan created `digitSumModel.ts` + `digitSumModel.test.ts` (an SVG-oriented model, committed in `ae6ad10`). Task 1 below **replaces** those with the storyboard module.

---

### Task 1: Storyboard module (replaces the old SVG model)

**Files:**
- Delete: `src/components/wmi/concepts/explainers/digitSumModel.ts`, `src/components/wmi/concepts/explainers/digitSumModel.test.ts`
- Create: `src/components/wmi/concepts/explainers/digitSumSteps.ts`
- Test: `src/components/wmi/concepts/explainers/digitSumSteps.test.ts`

- [ ] **Step 1: Remove the superseded SVG model**

```bash
git rm src/components/wmi/concepts/explainers/digitSumModel.ts src/components/wmi/concepts/explainers/digitSumModel.test.ts
```

- [ ] **Step 2: Write the failing test** — create `digitSumSteps.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { buildDigitSumSteps } from './digitSumSteps'

describe('buildDigitSumSteps', () => {
  test('derives the two digits and their sum', () => {
    const sb = buildDigitSumSteps(47, 'en')
    expect([sb.tens, sb.ones, sb.sum]).toEqual([4, 7, 11])
  })

  test('storyboard runs number -> tiles -> dots -> merge -> result', () => {
    const sb = buildDigitSumSteps(47, 'en')
    expect(sb.steps[0].showNumber).toBe(true)
    expect(sb.steps[1].showTiles).toBe(true)
    expect(sb.steps[2].showDots).toBe(true)
    expect(sb.steps[3].merged).toBe(true)
    const last = sb.steps[sb.finalIndex]
    expect(last.showResult).toBe(true)
    expect(last.result).toBe(true)
    expect(last.caption).toContain('11')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switches the caption text', () => {
    expect(buildDigitSumSteps(40, 'id').steps[0].caption).toContain('Ini bilangan 40')
    expect(buildDigitSumSteps(40, 'en').steps[0].caption).toContain('the number 40')
  })

  test('clamps out-of-range numbers to 10..99 and a zero ones-digit still sums', () => {
    expect(buildDigitSumSteps(7, 'en').n).toBe(10)
    expect(buildDigitSumSteps(150, 'en').n).toBe(99)
    expect(buildDigitSumSteps(40, 'en').sum).toBe(4)
  })
})
```

- [ ] **Step 3: Run test to verify it fails** — `npx vitest run src/components/wmi/concepts/explainers/digitSumSteps.test.ts` → FAIL (module not found).

- [ ] **Step 4: Write the implementation** — create `digitSumSteps.ts`:

```ts
export type Lang = 'en' | 'id'

export interface DigitSumStep {
  showNumber: boolean
  showTiles: boolean
  showDots: boolean
  merged: boolean
  showResult: boolean
  caption: string
  result: boolean
}

export interface DigitSumStoryboard {
  n: number
  tens: number
  ones: number
  sum: number
  steps: DigitSumStep[]
  /** Index of the last step (the result beat). */
  finalIndex: number
}

function clampTwoDigit(n: number): number {
  if (!Number.isFinite(n)) return 10
  return Math.max(10, Math.min(99, Math.round(n)))
}

export function buildDigitSumSteps(nRaw: number, lang: Lang): DigitSumStoryboard {
  const n = clampTwoDigit(nRaw)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const sum = tens + ones
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DigitSumStep[] = [
    {
      showNumber: true, showTiles: false, showDots: false, merged: false, showResult: false,
      caption: t(`This is the number ${n}.`, `Ini bilangan ${n}.`), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: false, merged: false, showResult: false,
      caption: t(`It has 2 digits: ${tens} and ${ones}.`, `Ada 2 angka: ${tens} dan ${ones}.`), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: true, merged: false, showResult: false,
      caption: t(
        `The digit ${tens} means ${tens}. The digit ${ones} means ${ones}.`,
        `Angka ${tens} berarti ${tens}. Angka ${ones} berarti ${ones}.`,
      ), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: true, merged: true, showResult: false,
      caption: t(`Add the digits: ${tens} + ${ones}.`, `Jumlahkan angkanya: ${tens} + ${ones}.`), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: true, merged: true, showResult: true,
      caption: t(`The sum of the digits is ${sum}.`, `Jumlah angkanya ${sum}.`), result: true,
    },
  ]

  return { n, tens, ones, sum, steps, finalIndex: steps.length - 1 }
}
```

- [ ] **Step 5: Run test to verify it passes** — `npx vitest run src/components/wmi/concepts/explainers/digitSumSteps.test.ts` → PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add -A src/components/wmi/concepts/explainers/
git commit -m "feat(wmi): digit-sum storyboard module (replaces SVG model)"
```

---

### Task 2: DigitSumExplainer component (DOM, mirrors A1)

**Files:**
- Create: `src/components/wmi/concepts/explainers/DigitSumExplainer.tsx`

Imitate `SingleDigitAdditionExplainer.tsx`: same imports, color constants, `STEP_MS` interval, `useReducedMotion` → `finalIndex`, `LayoutGroup` wrapper, and the styled caption box (blue for steps, green for the result beat).

- [ ] **Step 1: Write the component**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDigitSumSteps } from './digitSumSteps'

interface DigitSumParams {
  n: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const STEP_MS = 1200

// A single counting dot. layoutId lets the dot slide from its per-tile group
// into the merged group (magic-move); initial={false} so it slides, not pops.
function Dot({ color, layoutId }: { color: string; layoutId: string }) {
  return (
    <motion.span
      layout
      layoutId={layoutId}
      initial={false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="block h-5 w-5 rounded-full"
      style={{ background: color }}
    />
  )
}

// A rounded digit tile; a zero digit renders as a dashed empty outline.
function Tile({ digit, color }: { digit: number; color: string }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex h-14 w-14 items-center justify-center rounded-xl border-[3px] bg-white font-display text-3xl font-extrabold"
      style={{ borderColor: color, color, borderStyle: digit === 0 ? 'dashed' : 'solid' }}
    >
      {digit}
    </motion.div>
  )
}

export default function DigitSumExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as DigitSumParams
  const story = useMemo(() => buildDigitSumSteps(p.n, lang), [p.n, lang])
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) {
      setIndex(story.finalIndex)
      return
    }
    setIndex(0)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      if (i > story.finalIndex) {
        window.clearInterval(id)
        return
      }
      setIndex(i)
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [story, reduce])

  const step = story.steps[index] ?? story.steps[story.finalIndex]
  const { tens, ones, sum, n } = story

  // Blue (tens) dots then orange (ones) dots; stable layoutIds across the merge.
  const blueDots = Array.from({ length: tens }, (_, i) => <Dot key={`b${i}`} color={BLUE} layoutId={`d-b-${i}`} />)
  const orangeDots = Array.from({ length: ones }, (_, j) => <Dot key={`o${j}`} color={ORANGE} layoutId={`d-o-${j}`} />)

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: pisahkan bilangan menjadi angka-angkanya, lalu jumlahkan.'
      : 'Strategy: split the number into its digits, then add them.'

  return (
    <LayoutGroup>
      <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
        <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
          {/* the whole number */}
          {step.showNumber && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-6xl font-extrabold"
              style={{ color: '#341857' }}
            >
              {n}
            </motion.div>
          )}

          {/* digit tiles (+ between them until they merge) */}
          {step.showTiles && (
            <div className="flex items-center gap-4">
              <Tile digit={tens} color={BLUE} />
              {!step.merged && <span className="font-display text-2xl font-extrabold text-qupu-muted">+</span>}
              <Tile digit={ones} color={ORANGE} />
            </div>
          )}

          {/* dots: two groups under the tiles, or one merged grid */}
          {step.showDots && !step.merged && (
            <div className="flex items-start gap-10">
              <div className="grid w-16 grid-cols-3 justify-items-center gap-1">{blueDots}</div>
              <div className="grid w-16 grid-cols-3 justify-items-center gap-1">{orangeDots}</div>
            </div>
          )}
          {step.showDots && step.merged && (
            <div className="flex max-w-[260px] flex-wrap justify-center gap-1.5">
              {blueDots}
              {orangeDots}
            </div>
          )}

          {/* number sentence on the result beat */}
          {step.showResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-xl font-extrabold"
            >
              <span style={{ color: BLUE }}>{tens}</span>
              <span className="text-qupu-muted"> + </span>
              <span style={{ color: ORANGE }}>{ones}</span>
              <span className="text-qupu-muted"> = </span>
              <span style={{ color: '#10B981' }}>{sum}</span>
            </motion.div>
          )}

          {/* caption */}
          <div
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              step.result
                ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
            }
          >
            {step.caption}
          </div>
        </div>
      </div>
    </LayoutGroup>
  )
}
```

- [ ] **Step 2: Typecheck** — `npm run check` → no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/concepts/explainers/DigitSumExplainer.tsx
git commit -m "feat(wmi): N1 digit-sum concrete-dots explainer (DOM, mirrors A1)"
```

---

### Task 3: Register + verify

**Files:**
- Modify: `src/components/wmi/concepts/explainers/registry.ts`

- [ ] **Step 1: Register the explainer** — add the import alongside the others and the map entry (keep alphabetical-ish grouping consistent with the file):

```ts
import DigitSumExplainer from './DigitSumExplainer'
```

```ts
export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {
  'count-objects': CountObjectsExplainer,
  'digit-sum': DigitSumExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'single-digit-addition': SingleDigitAdditionExplainer,
  'story-sum': StorySumExplainer,
}
```

- [ ] **Step 2: Typecheck, lint, full tests, build** — `npm run check && npm run lint && npm test && npm run build`. Expected: typecheck clean; lint clean (a single pre-existing `react-refresh` warning is OK); all tests pass incl. the new `buildDigitSumSteps` tests; build succeeds.

- [ ] **Step 3: Manual Animation-tab check** — `npm run dev`, sign in as `shops@decasa.co.id`, open `/admin/wmi-concepts`, search `N1`. Confirm the "Animation" chip is on and the sequence plays: number → two digit tiles (with `+`) → dots under each tile → dots slide into one merged group → `4 + 7 = 11` + green result caption; Replay works. Check a `*0` case (e.g. 40 → orange tile dashed, no orange dots) and `99` (18 dots wrap tidily). The component reads `lang` from `ExplainerProps`; the tab default is fine.

- [ ] **Step 4: Commit**

```bash
git add src/components/wmi/concepts/explainers/registry.ts
git commit -m "feat(wmi): register N1 digit-sum explainer in Animation tab"
```

---

## Self-review

- **Spec coverage (amended):** standard = framer-motion over DOM matching A1 (Task 2 mirrors `SingleDigitAdditionExplainer`). Concrete-dots storyboard beats 1–5 (Task 1 `steps`). Zero-digit dashed tile (Task 2 `Tile`). 99 → dots wrap (Task 2 merged flex-wrap). Reduced motion (Task 2 `useReducedMotion` → `finalIndex`). `lang`-aware captions (Task 1 `t()`, Task 2 `lang` prop). Registry → Animation tab (Task 3). Old SVG model removed (Task 1 Step 1). All covered.
- **Placeholders:** none — full code/commands in every step.
- **Type consistency:** `buildDigitSumSteps`, `DigitSumStep`, `DigitSumStoryboard`, `finalIndex`, `steps` match across Tasks 1–2; `ExplainerProps` (with `lang?`) imported from `./registry`; `EXPLAINERS` key `digit-sum` matches the concept slug; color constants/`STEP_MS`/`LayoutGroup` usage mirror A1.
