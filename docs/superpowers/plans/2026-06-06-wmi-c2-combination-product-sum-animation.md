# WMI C2 Combination Product Sum Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an animated explainer for C2, `combination-product-sum`, that teaches sum-pair search and product checking.

**Architecture:** Keep math/story generation in a small pure builder, render the animation in one React component, and wire it through the existing explainer registry. The backend concept generator stays unchanged because it already exposes `{ x, y }` and the correct answer.

**Tech Stack:** React 18, Framer Motion, Vitest, existing `useBeatControl` explainer timing.

---

## File Structure

- Create `src/components/wmi/concepts/explainers/combinationProductSteps.ts`: pure step builder for C2 beats, candidate rows, labels, and final answer.
- Create `src/components/wmi/concepts/explainers/combinationProductSteps.test.ts`: tests step math and bilingual captions.
- Create `src/components/wmi/concepts/explainers/CombinationProductSumExplainer.tsx`: visual grid animation.
- Modify `src/components/wmi/concepts/explainers/registry.ts`: import and register `combination-product-sum`.

## Task 1: Step Builder

**Files:**
- Create: `src/components/wmi/concepts/explainers/combinationProductSteps.ts`
- Test: `src/components/wmi/concepts/explainers/combinationProductSteps.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from 'vitest'
import { buildCombinationProductSteps } from './combinationProductSteps'

describe('buildCombinationProductSteps', () => {
  test('candidate rows keep the target sum and final match has the target product', () => {
    const story = buildCombinationProductSteps(4, 9, 'en')

    expect(story.sum).toBe(13)
    expect(story.product).toBe(36)
    expect(story.answer).toBe(9)
    expect(story.rows.map((r) => [r.a, r.b, r.product])).toEqual([
      [1, 12, 12],
      [2, 11, 22],
      [3, 10, 30],
      [4, 9, 36],
    ])
    expect(story.rows.every((r) => r.a + r.b === story.sum)).toBe(true)
    expect(story.rows.at(-1)?.matches).toBe(true)
    expect(story.steps.at(-1)?.phase).toBe('result')
  })

  test('Indonesian captions explain the same sum-pair strategy', () => {
    const story = buildCombinationProductSteps(3, 8, 'id')

    expect(story.steps[0].caption).toContain('jumlah')
    expect(story.steps.at(-1)?.caption).toContain('bilangan yang lebih besar')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/wmi/concepts/explainers/combinationProductSteps.test.ts`

Expected: FAIL because `combinationProductSteps.ts` does not exist.

- [ ] **Step 3: Implement the step builder**

```ts
export type CombinationPhase = 'facts' | 'pairs' | 'check' | 'match' | 'result'

export interface CombinationRow {
  a: number
  b: number
  product: number
  matches: boolean
}

export interface CombinationStep {
  phase: CombinationPhase
  caption: string
  visibleRows: number
  checkedRows: number
  hold: number
  result?: boolean
}

export interface CombinationStory {
  x: number
  y: number
  sum: number
  product: number
  answer: number
  rows: CombinationRow[]
  steps: CombinationStep[]
  finalIndex: number
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

export function buildCombinationProductSteps(xRaw: unknown, yRaw: unknown, lang: 'en' | 'id' = 'en'): CombinationStory {
  const x = clampInt(xRaw, 2, 1, 12)
  const y = Math.max(x + 1, clampInt(yRaw, x + 1, 2, 24))
  const sum = x + y
  const product = x * y
  const rows: CombinationRow[] = Array.from({ length: x }, (_, i) => {
    const a = i + 1
    const b = sum - a
    return { a, b, product: a * b, matches: a === x && b === y }
  })

  const text = {
    facts:
      lang === 'id'
        ? `Kita tahu jumlahnya ${sum} dan hasil kalinya ${product}.`
        : `We know the sum is ${sum} and the product is ${product}.`,
    pairs:
      lang === 'id'
        ? `Buat pasangan bilangan yang jumlahnya selalu ${sum}.`
        : `List number pairs that always add to ${sum}.`,
    check:
      lang === 'id'
        ? `Kalikan tiap pasangan dan cari hasil kali ${product}.`
        : `Multiply each pair and look for product ${product}.`,
    match:
      lang === 'id'
        ? `${x} × ${y} = ${product}, jadi pasangan yang cocok adalah (${x}, ${y}).`
        : `${x} × ${y} = ${product}, so the matching pair is (${x}, ${y}).`,
    result:
      lang === 'id'
        ? `Bilangan yang lebih besar adalah ${y}.`
        : `The larger number is ${y}.`,
  }

  const steps: CombinationStep[] = [
    { phase: 'facts', caption: text.facts, visibleRows: 0, checkedRows: 0, hold: 1000 },
    { phase: 'pairs', caption: text.pairs, visibleRows: rows.length, checkedRows: 0, hold: 1200 },
    { phase: 'check', caption: text.check, visibleRows: rows.length, checkedRows: Math.max(0, rows.length - 1), hold: 1500 },
    { phase: 'match', caption: text.match, visibleRows: rows.length, checkedRows: rows.length, hold: 1300 },
    { phase: 'result', caption: text.result, visibleRows: rows.length, checkedRows: rows.length, hold: 0, result: true },
  ]

  return { x, y, sum, product, answer: y, rows, steps, finalIndex: steps.length - 1 }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/wmi/concepts/explainers/combinationProductSteps.test.ts`

Expected: PASS.

## Task 2: Visual Explainer and Registry

**Files:**
- Create: `src/components/wmi/concepts/explainers/CombinationProductSumExplainer.tsx`
- Modify: `src/components/wmi/concepts/explainers/registry.ts`

- [ ] **Step 1: Create the React explainer component**

```tsx
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCombinationProductSteps, type CombinationRow } from './combinationProductSteps'
import { useBeatControl } from './useBeatControl'

interface CombinationParams {
  x: number
  y: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const MUTED = '#94A3B8'

function Row({ row, shown, checked }: { row: CombinationRow; shown: boolean; checked: boolean }) {
  const matched = checked && row.matches
  const missed = checked && !row.matches
  return (
    <motion.div
      className="grid grid-cols-[72px_72px_76px] items-center gap-2 rounded-xl border-2 px-3 py-2 font-display text-sm font-black tabular-nums"
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: shown ? (missed ? 0.45 : 1) : 0, scale: shown ? 1 : 0.94, y: shown ? 0 : 8 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      style={{
        borderColor: matched ? GREEN : shown ? '#C7D2FE' : '#E5E7EB',
        background: matched ? '#D1FAE5' : '#fff',
        color: matched ? '#065F46' : missed ? MUTED : '#30598A',
      }}
    >
      <span>{row.a} + {row.b}</span>
      <span>= {row.a + row.b}</span>
      <motion.span
        className="rounded-lg px-2 py-1 text-center"
        initial={false}
        animate={{ backgroundColor: checked ? (matched ? GREEN : '#F1F5F9') : '#FFF7ED', color: checked && matched ? '#fff' : ORANGE }}
      >
        {checked ? row.product : `${row.a} × ${row.b}`}
      </motion.span>
    </motion.div>
  )
}

export default function CombinationProductSumExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as CombinationParams
  const story = useMemo(() => buildCombinationProductSteps(p?.x, p?.y, lang), [p?.x, p?.y, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: daftar pasangan dengan jumlah yang sama, lalu cek hasil kalinya.'
      : 'Strategy: list pairs with the same sum, then check their products.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3 font-display text-base font-black tabular-nums">
          <div className="rounded-xl bg-blue-50 px-4 py-2" style={{ color: BLUE }}>sum = {story.sum}</div>
          <div className="rounded-xl bg-orange-50 px-4 py-2" style={{ color: ORANGE }}>product = {story.product}</div>
        </div>
        <div className="flex w-full flex-col gap-2">
          {story.rows.map((row, i) => (
            <Row key={`${row.a}-${row.b}`} row={row} shown={i < beat.visibleRows} checked={i < beat.checkedRows} />
          ))}
        </div>
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

- [ ] **Step 2: Register the explainer**

Modify `src/components/wmi/concepts/explainers/registry.ts`:

```ts
import CombinationProductSumExplainer from './CombinationProductSumExplainer'
```

Add to `EXPLAINERS`:

```ts
'combination-product-sum': CombinationProductSumExplainer,
```

- [ ] **Step 3: Run validation**

Run:

```bash
npx vitest run src/components/wmi/concepts/explainers/combinationProductSteps.test.ts
npm run check
npm run lint
```

Expected: all pass.

## Self-Review

- Spec coverage: step builder covers sum/product math, component covers animated grid, registry exposes C2.
- Placeholder scan: no deferred code or unresolved tasks.
- Type consistency: builder exports `CombinationRow`, component imports it, registry uses the slug `combination-product-sum`.
