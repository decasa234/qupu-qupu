# A1 Make-ten Animated Explainer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give concept A1 (`single-digit-addition`) a post-answer animated explainer that teaches the make-ten / bridging-through-a-ten mental-math strategy.

**Architecture:** A pure, unit-tested storyboard builder (`makeTenSteps.ts`) turns `{a, b}` into an ordered list of ten-frame states + bilingual captions. A thin framer-motion component (`SingleDigitAdditionExplainer.tsx`) plays those steps, with bridge chips sliding (shared-layout FLIP) from a loose pile into the ten-frame. The explainer is registered by slug and rendered by the existing `WmiExplainer`, which gains an optional `lang` prop threaded from the drill's language toggle. No backend, no generator, no DB changes.

**Tech Stack:** React 18, TypeScript, framer-motion ^12, Vitest, Tailwind (qupu brand tokens).

**Spec:** `docs/superpowers/specs/2026-06-05-a1-make-ten-explainer-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `src/components/wmi/concepts/explainers/makeTenSteps.ts` | **New.** Pure storyboard builder + types. No React, no DOM. |
| `src/components/wmi/concepts/explainers/makeTenSteps.test.ts` | **New.** Vitest unit tests for the builder. |
| `src/components/wmi/concepts/explainers/SingleDigitAdditionExplainer.tsx` | **New.** framer-motion component that plays the storyboard. |
| `src/components/wmi/concepts/explainers/registry.ts` | **Modify.** Add optional `lang?` to `ExplainerProps`; register the new explainer. |
| `src/components/wmi/WmiExplainer.tsx` | **Modify.** Accept `lang?` and forward it to the explainer. |
| `src/pages/WmiKonsepDrill.tsx` | **Modify.** Pass `lang={questionLang}` to `<WmiExplainer>`. |

---

## Task 1: Pure storyboard builder (`makeTenSteps.ts`)

**Files:**
- Test: `src/components/wmi/concepts/explainers/makeTenSteps.test.ts`
- Create: `src/components/wmi/concepts/explainers/makeTenSteps.ts`

- [ ] **Step 1: Write the failing test**

Create `src/components/wmi/concepts/explainers/makeTenSteps.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { buildMakeTenSteps } from './makeTenSteps'

const PAIRS: Array<[number, number]> = [
  [8, 5], [7, 6], [9, 9], [6, 4], [3, 4], [1, 1], [5, 8], [9, 1], [2, 7],
]

describe('buildMakeTenSteps', () => {
  test('every step conserves the total (blue + orange + loose === a + b)', () => {
    for (const [a, b] of PAIRS) {
      for (const s of buildMakeTenSteps(a, b, 'en').steps) {
        expect(s.blue + s.orange + s.loose).toBe(a + b)
      }
    }
  })

  test('ten-frame never overfills (blue + orange <= 10)', () => {
    for (const [a, b] of PAIRS) {
      for (const s of buildMakeTenSteps(a, b, 'en').steps) {
        expect(s.blue + s.orange).toBeLessThanOrEqual(10)
      }
    }
  })

  test('final step is flagged result and states the correct sum', () => {
    for (const [a, b] of PAIRS) {
      const story = buildMakeTenSteps(a, b, 'en')
      const last = story.steps[story.finalIndex]
      expect(last.result).toBe(true)
      expect(last.caption).toContain(String(a + b))
    }
  })

  test('bridges and shows a split iff the sum crosses ten', () => {
    for (const [a, b] of PAIRS) {
      const story = buildMakeTenSteps(a, b, 'en')
      const crosses = a + b > 10
      expect(story.bridges).toBe(crosses)
      expect(story.steps.some((s) => s.split !== null)).toBe(crosses)
    }
  })

  test('larger addend always fills the frame first', () => {
    for (const [a, b] of PAIRS) {
      expect(buildMakeTenSteps(a, b, 'en').steps[0].blue).toBe(Math.max(a, b))
    }
  })

  test('commutative: a+b and b+a produce identical storyboards', () => {
    expect(buildMakeTenSteps(8, 5, 'en')).toEqual(buildMakeTenSteps(5, 8, 'en'))
    expect(buildMakeTenSteps(3, 4, 'id')).toEqual(buildMakeTenSteps(4, 3, 'id'))
  })

  test('perfect ten fills exactly, no leftover, no split', () => {
    const story = buildMakeTenSteps(6, 4, 'en')
    expect(story.bridges).toBe(false)
    expect(story.leftover).toBe(0)
    const last = story.steps[story.finalIndex]
    expect(last.blue + last.orange).toBe(10)
    expect(last.loose).toBe(0)
  })

  test('language selects caption text', () => {
    expect(buildMakeTenSteps(8, 5, 'en').steps[0].caption).toContain('start')
    expect(buildMakeTenSteps(8, 5, 'id').steps[0].caption).toContain('mulai')
  })

  test('clamps out-of-range inputs into 1..9', () => {
    const story = buildMakeTenSteps(0, 99, 'en')
    expect(story.big).toBe(9)
    expect(story.small).toBe(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/wmi/concepts/explainers/makeTenSteps.test.ts`
Expected: FAIL — cannot resolve `./makeTenSteps` (module does not exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/components/wmi/concepts/explainers/makeTenSteps.ts`:

```ts
export type Lang = 'en' | 'id'

export interface MakeTenStep {
  /** First-addend chips currently sitting in the ten-frame (blue). */
  blue: number
  /** Bridge chips that have moved into the ten-frame (orange). */
  orange: number
  /** Second-addend chips not yet in the frame (shown in the loose pile). */
  loose: number
  /** Number-bond split of the second addend `[completes, leftover]`, when shown. */
  split: [number, number] | null
  /** Glow the empty cells (the "needs N more to fill the ten" beat). */
  highlightEmpty: boolean
  caption: string
  result: boolean
}

export interface MakeTenStoryboard {
  big: number
  small: number
  sum: number
  /** Chips needed to fill the ten once `big` is placed (10 - big). */
  completesTen: number
  /** Portion of `small` that completes the ten. */
  bridge: number
  /** Chips left after the ten is full (0 unless the sum crosses ten). */
  leftover: number
  /** True when the sum crosses ten and the bridge animation plays. */
  bridges: boolean
  steps: MakeTenStep[]
  finalIndex: number
}

function clamp(n: number): number {
  return Math.max(1, Math.min(9, Math.round(n)))
}

export function buildMakeTenSteps(aRaw: number, bRaw: number, lang: Lang): MakeTenStoryboard {
  const a = clamp(aRaw)
  const b = clamp(bRaw)
  const big = Math.max(a, b)
  const small = Math.min(a, b)
  const sum = a + b
  const completesTen = Math.max(0, 10 - big)
  const bridge = Math.min(small, completesTen)
  const leftover = Math.max(0, sum - 10)
  const bridges = sum > 10

  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: MakeTenStep[] = []

  // 1. The bigger number fills the frame first.
  steps.push({
    blue: big, orange: 0, loose: small, split: null, highlightEmpty: bridges,
    caption: t(`start with the bigger number: ${big}`, `mulai dari yang besar: ${big}`),
    result: false,
  })

  // 2. Introduce the second addend as loose chips.
  steps.push({
    blue: big, orange: 0, loose: small, split: null, highlightEmpty: bridges,
    caption: t(`add ${small}`, `tambah ${small}`),
    result: false,
  })

  if (bridges) {
    // 3. Split the second addend into "completes the ten" + "leftover".
    steps.push({
      blue: big, orange: 0, loose: small, split: [bridge, leftover], highlightEmpty: true,
      caption: t(`${small} = ${bridge} + ${leftover}`, `${small} = ${bridge} + ${leftover}`),
      result: false,
    })
    // 4. Slide the bridge chips in — the ten is now full.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: [bridge, leftover], highlightEmpty: false,
      caption: t(`${bridge} completes the ten → 10`, `${bridge} melengkapi sepuluh → 10`),
      result: false,
    })
    // 5. The leftover chips remain.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: null, highlightEmpty: false,
      caption: t(`${leftover} left over`, `sisa ${leftover}`),
      result: false,
    })
    // 6. Result: 10 + leftover = sum.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: null, highlightEmpty: false,
      caption: t(`10 + ${leftover} = ${sum}`, `10 + ${leftover} = ${sum}`),
      result: true,
    })
  } else if (sum === 10) {
    // Perfect ten: the two parts fill the frame exactly.
    steps.push({
      blue: big, orange: small, loose: 0, split: null, highlightEmpty: false,
      caption: t(`they make exactly ten → 10`, `pas sepuluh → 10`),
      result: true,
    })
  } else {
    // Under ten: combine in one frame, no bridge needed.
    steps.push({
      blue: big, orange: small, loose: 0, split: null, highlightEmpty: false,
      caption: t(`still room in the ten → ${sum}`, `masih muat dalam sepuluh → ${sum}`),
      result: true,
    })
  }

  return { big, small, sum, completesTen, bridge, leftover, bridges, steps, finalIndex: steps.length - 1 }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/wmi/concepts/explainers/makeTenSteps.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/concepts/explainers/makeTenSteps.ts src/components/wmi/concepts/explainers/makeTenSteps.test.ts
git commit -m "feat(wmi): make-ten storyboard builder for A1 explainer"
```

---

## Task 2: Thread `lang` through the explainer plumbing

This makes captions follow the drill's language toggle. The new prop is **optional** (defaults to `'en'`) so the three existing explainers are unaffected.

**Files:**
- Modify: `src/components/wmi/concepts/explainers/registry.ts`
- Modify: `src/components/wmi/WmiExplainer.tsx`
- Modify: `src/pages/WmiKonsepDrill.tsx`

- [ ] **Step 1: Add `lang?` to `ExplainerProps`**

In `src/components/wmi/concepts/explainers/registry.ts`, change the interface:

```ts
export interface ExplainerProps {
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}
```

- [ ] **Step 2: Forward `lang` from `WmiExplainer`**

In `src/components/wmi/WmiExplainer.tsx`, add `lang` to `Props` and pass it to the explainer:

```tsx
interface Props {
  slug: string
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export default function WmiExplainer({ slug, params, correctAnswer, lang }: Props) {
```

and update the rendered explainer line (near the bottom of the component):

```tsx
      <Explainer key={replayKey} params={params} correctAnswer={correctAnswer} lang={lang} />
```

- [ ] **Step 3: Pass the drill language into `WmiExplainer`**

In `src/pages/WmiKonsepDrill.tsx`, find the `<WmiExplainer ... />` usage (inside the `feedback &&` block) and add `lang={questionLang}`:

```tsx
              <WmiExplainer
                slug={question.concept_slug}
                params={question.params}
                correctAnswer={feedback.correct_answer}
                lang={questionLang}
              />
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: PASS — no type errors. (The other explainers compile because `lang` is optional.)

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/concepts/explainers/registry.ts src/components/wmi/WmiExplainer.tsx src/pages/WmiKonsepDrill.tsx
git commit -m "feat(wmi): thread question language into concept explainers"
```

---

## Task 3: The animated explainer component + registration

**Files:**
- Create: `src/components/wmi/concepts/explainers/SingleDigitAdditionExplainer.tsx`
- Modify: `src/components/wmi/concepts/explainers/registry.ts`

- [ ] **Step 1: Create the component**

Create `src/components/wmi/concepts/explainers/SingleDigitAdditionExplainer.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMakeTenSteps } from './makeTenSteps'

interface AddParams {
  a: number
  b: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const EMPTY_BORDER = '#E6DCC6'
const STEP_MS = 900

function Chip({ color, layoutId }: { color: string; layoutId?: string }) {
  return (
    <motion.span
      layout
      layoutId={layoutId}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="block h-6 w-6 rounded-full"
      style={{ background: color }}
    />
  )
}

export default function SingleDigitAdditionExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as AddParams
  const story = useMemo(() => buildMakeTenSteps(p.a, p.b, lang), [p.a, p.b, lang])
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

  // Ten-frame cells: blue chips, then orange (bridged) chips, then empty.
  // Orange cell chips share a layoutId with the loose pile chips so they
  // visibly slide from the pile into the frame when the bridge step fires.
  const cells = Array.from({ length: 10 }, (_, cellIndex) => {
    const isBlue = cellIndex < step.blue
    const orangeSlot = cellIndex - step.blue
    const isOrange = !isBlue && orangeSlot < step.orange
    const isEmpty = !isBlue && !isOrange
    return (
      <div
        key={cellIndex}
        className="flex h-9 w-9 items-center justify-center rounded-md border-2 bg-white"
        style={{ borderColor: isEmpty && step.highlightEmpty ? ORANGE : EMPTY_BORDER }}
      >
        {isBlue && <Chip color={BLUE} />}
        {isOrange && <Chip color={ORANGE} layoutId={`add-${orangeSlot}`} />}
      </div>
    )
  })

  // Loose pile: the second-addend chips not yet placed, indexed AFTER the
  // ones already in the frame so layoutIds stay unique across the swap.
  const loose = Array.from({ length: step.loose }, (_, k) => (
    <Chip key={k} color={ORANGE} layoutId={`add-${step.orange + k}`} />
  ))

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: jadikan sepuluh dulu, lalu tambah sisanya.'
      : 'Strategy: make a ten first, then add what is left.'

  return (
    <LayoutGroup>
      <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
        <div className="flex flex-col items-center gap-3">
          {/* Ten-frame */}
          <div className="grid grid-cols-5 gap-1.5">{cells}</div>

          {/* Number-bond split of the second addend */}
          {step.split && (
            <div className="flex items-center gap-2 font-display text-sm font-extrabold text-qupu-brand-blue">
              <span>{story.small}</span>
              <span className="text-qupu-muted">=</span>
              <span style={{ color: ORANGE }}>{step.split[0]}</span>
              <span className="text-qupu-muted">+</span>
              <span style={{ color: ORANGE }}>{step.split[1]}</span>
            </div>
          )}

          {/* Loose pile */}
          {step.loose > 0 && (
            <div className="flex min-h-[24px] items-center gap-1.5">{loose}</div>
          )}

          {/* Caption */}
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

- [ ] **Step 2: Register the explainer**

In `src/components/wmi/concepts/explainers/registry.ts`, add the import (top, with the other explainer imports):

```ts
import SingleDigitAdditionExplainer from './SingleDigitAdditionExplainer'
```

and add the map entry inside `EXPLAINERS`:

```ts
  'single-digit-addition': SingleDigitAdditionExplainer,
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS — no type errors.

- [ ] **Step 4: Lint the new/changed files**

Run: `npm run lint`
Expected: PASS — no new lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/concepts/explainers/SingleDigitAdditionExplainer.tsx src/components/wmi/concepts/explainers/registry.ts
git commit -m "feat(wmi): make-ten animated explainer for A1 (single-digit-addition)"
```

---

## Task 4: Manual verification & clear the review flag

No automated browser test infra exists for these canvas/motion explainers, so verify by eye, then clear A1's `needs_changes`.

- [ ] **Step 1: Run the app**

Run: `npm run dev`
Expected: client on 5173, API on 3001, no console errors.

- [ ] **Step 2: Verify on the proofreading page**

Sign in as admin and open `/admin/wmi-concepts`. Find **A1 — single-digit-addition** (Arithmetic group). Confirm:
- the explainer renders (ten-frame + caption) for sampled seeds;
- reseeding/regenerating produces bridging, non-bridging, and (if seeded) perfect-ten variants without errors.

- [ ] **Step 3: Verify in the drill**

Go to `/latihan/wmi`, pick a child profile, open **Konsep** for grade 1 or 2, and answer a `single-digit-addition` question. Confirm:
- after answering, the explainer auto-plays the steps;
- for a sum > 10, the bridge chips slide into the ten-frame and the `n = x + y` split shows;
- the **Replay** button restarts the animation;
- toggling the question language (EN/ID) flips the captions;
- (optional) with OS "reduce motion" on, the explainer shows the final frame immediately.

- [ ] **Step 4: Run the full test suite once**

Run: `npx vitest run`
Expected: PASS — including the new `makeTenSteps` tests and the untouched `single-digit-addition` concept tests.

- [ ] **Step 5: Clear the review flag**

In `/admin/wmi-concepts`, set A1 from `needs_changes` to `approved` (or `pending`) with a note that the make-ten explainer was added. (This writes to `wmi_concept_reviews`; no code change.)

---

## Self-review notes

- **Spec coverage:** strategy (make-ten) → Task 1 storyboard; placement (post-answer explainer) → Task 3 + existing `WmiExplainer`; generator unchanged → no task touches `single-digit-addition/index.ts`; technique (framer-motion DOM, sliding via shared `layoutId`) → Task 3; bilingual captions following language → Tasks 1–2; three cases (bridge / under-ten / perfect-ten) → Task 1 branches + tests; reduced-motion + aria → Task 3; verification → Task 4.
- **Type consistency:** `buildMakeTenSteps(a, b, lang)` returns `MakeTenStoryboard`; the component reads `story.steps`, `story.finalIndex`, `story.small`, and `step.{blue,orange,loose,split,highlightEmpty,caption,result}` — all defined in Task 1. `ExplainerProps.lang` (Task 2) is consumed by the component (Task 3) and forwarded by `WmiExplainer` (Task 2).
- **No placeholders:** every code step shows complete code; every run step shows the command and expected result.
