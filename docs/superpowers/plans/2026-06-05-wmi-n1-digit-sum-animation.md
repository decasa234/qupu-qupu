# N1 digit-sum animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a concrete-dots framer-motion SVG explainer for concept N1 (`digit-sum`) that teaches what a digit is, and establish the reusable framer-motion-over-SVG explainer pattern.

**Architecture:** A pure model module computes the digit breakdown and dot-grid coordinates (unit-tested). Small presentational framer-motion SVG parts (`Tile`, `MotionDot`, `MotionAppear`, `Caption`) render the scene. `DigitSumExplainer` drives a 5-beat timeline with `setTimeout`, honoring `useReducedMotion`, and is registered by slug so the existing `WmiExplainer` Animation tab picks it up automatically.

**Tech Stack:** React 18, framer-motion (already installed), SVG, vitest, TypeScript.

---

## File structure

- Create `src/components/wmi/concepts/explainers/digitSumModel.ts` — pure logic: digit split + dot-grid positions.
- Create `src/components/wmi/concepts/explainers/digitSumModel.test.ts` — unit tests for the pure logic.
- Create `src/components/wmi/concepts/explainers/shared.tsx` — reusable framer-motion SVG parts (`MotionAppear`, `Tile`, `MotionDot`, `Caption`).
- Create `src/components/wmi/concepts/explainers/DigitSumExplainer.tsx` — the explainer component.
- Modify `src/components/wmi/concepts/explainers/registry.ts` — register `digit-sum`.

All coordinates assume a `viewBox="0 0 440 280"` SVG. Pixel values are starting points; nudge while watching the Animation tab.

---

### Task 1: Pure model (digit split + dot grid)

**Files:**
- Create: `src/components/wmi/concepts/explainers/digitSumModel.ts`
- Test: `src/components/wmi/concepts/explainers/digitSumModel.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/wmi/concepts/explainers/digitSumModel.test.ts
import { describe, test, expect } from 'vitest'
import { digitSumModel, dotGridPositions } from './digitSumModel'

describe('digitSumModel', () => {
  test('splits a two-digit number into digits and sums their face values', () => {
    expect(digitSumModel(47)).toEqual({ n: 47, tens: 4, ones: 7, sum: 11 })
    expect(digitSumModel(40)).toEqual({ n: 40, tens: 4, ones: 0, sum: 4 })
    expect(digitSumModel(10)).toEqual({ n: 10, tens: 1, ones: 0, sum: 1 })
    expect(digitSumModel(99)).toEqual({ n: 99, tens: 9, ones: 9, sum: 18 })
  })

  test('dotGridPositions lays out k dots in rows of 5', () => {
    expect(dotGridPositions(0, 0, 0)).toEqual([])
    const six = dotGridPositions(6, 10, 20, 5, 22)
    expect(six).toHaveLength(6)
    expect(six[0]).toEqual({ x: 10, y: 20 })
    expect(six[4]).toEqual({ x: 10 + 4 * 22, y: 20 }) // last of row 1
    expect(six[5]).toEqual({ x: 10, y: 20 + 22 }) // wraps to row 2
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/wmi/concepts/explainers/digitSumModel.test.ts`
Expected: FAIL — cannot find module `./digitSumModel`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/wmi/concepts/explainers/digitSumModel.ts
export interface DigitDot {
  x: number
  y: number
}

export interface DigitSumModel {
  n: number
  tens: number
  ones: number
  sum: number
}

export function digitSumModel(n: number): DigitSumModel {
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return { n, tens, ones, sum: tens + ones }
}

// Lay out k dots left-to-right in rows of `perRow`, starting at (ox, oy).
export function dotGridPositions(
  k: number,
  ox: number,
  oy: number,
  perRow = 5,
  gap = 22,
): DigitDot[] {
  const dots: DigitDot[] = []
  for (let i = 0; i < k; i++) {
    const col = i % perRow
    const row = Math.floor(i / perRow)
    dots.push({ x: ox + col * gap, y: oy + row * gap })
  }
  return dots
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/wmi/concepts/explainers/digitSumModel.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/concepts/explainers/digitSumModel.ts src/components/wmi/concepts/explainers/digitSumModel.test.ts
git commit -m "feat(wmi): digit-sum explainer model (digit split + dot grid)"
```

---

### Task 2: Shared framer-motion SVG parts

**Files:**
- Create: `src/components/wmi/concepts/explainers/shared.tsx`

These are presentational (no unit test — verified visually in Task 4). They are the reusable pattern future explainers copy.

- [ ] **Step 1: Write the parts**

```tsx
// src/components/wmi/concepts/explainers/shared.tsx
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { DigitDot } from './digitSumModel'

// Fade/scale a group in or out based on `show`.
export function MotionAppear({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8 }}
      transition={{ duration: 0.35 }}
      style={{ transformOrigin: 'center' }}
    >
      {children}
    </motion.g>
  )
}

// A rounded digit tile. A zero digit renders as a dashed empty outline.
export function Tile({
  show,
  x,
  y,
  digit,
  color,
}: {
  show: boolean
  x: number
  y: number
  digit: number
  color: string
}) {
  const zero = digit === 0
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.4 }}>
      <rect
        x={x}
        y={y}
        width={60}
        height={60}
        rx={12}
        fill={zero ? 'transparent' : '#ffffff'}
        stroke={color}
        strokeWidth={3}
        strokeDasharray={zero ? '6 5' : undefined}
      />
      <text x={x + 30} y={y + 42} textAnchor="middle" fontSize={36} fontWeight={800} fill={color}>
        {digit}
      </text>
    </motion.g>
  )
}

// A single dot that animates toward `to` and fades with `show`.
export function MotionDot({ show, to, color }: { show: boolean; to: DigitDot; color: string }) {
  return (
    <motion.circle
      r={7}
      fill={color}
      initial={false}
      animate={{ cx: to.x, cy: to.y, opacity: show ? 1 : 0, scale: show ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    />
  )
}

// Bottom caption line (Indonesian copy).
export function Caption({ text }: { text: string }) {
  return (
    <text x={220} y={262} textAnchor="middle" fontSize={15} fontWeight={800} fill="#2f6df0">
      {text}
    </text>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/concepts/explainers/shared.tsx
git commit -m "feat(wmi): shared framer-motion SVG explainer parts"
```

---

### Task 3: DigitSumExplainer component

**Files:**
- Create: `src/components/wmi/concepts/explainers/DigitSumExplainer.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/wmi/concepts/explainers/DigitSumExplainer.tsx
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { digitSumModel, dotGridPositions } from './digitSumModel'
import { Caption, MotionAppear, MotionDot, Tile } from './shared'

const BLUE = '#2f6df0'
const ORANGE = '#ef7d3b'
const GREEN = '#10b981'

// ms each beat holds before advancing to the next (beats 1..4)
const HOLDS = [1100, 1400, 1500, 1700]

export default function DigitSumExplainer({ params }: ExplainerProps) {
  const { n, tens, ones, sum } = digitSumModel((params as { n: number }).n)
  const reduce = useReducedMotion() ?? false
  const [beat, setBeat] = useState(reduce ? 4 : 0)
  const [count, setCount] = useState(reduce ? sum : 0)

  // Advance beats on a timer (skip entirely when reduced motion).
  useEffect(() => {
    if (reduce) {
      setBeat(4)
      return
    }
    setBeat(0)
    const timers = HOLDS.map((_, i) => {
      const at = HOLDS.slice(0, i + 1).reduce((a, b) => a + b, 0)
      return window.setTimeout(() => setBeat(i + 1), at)
    })
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [reduce, n])

  // Count up once the dots merge (beat >= 3).
  useEffect(() => {
    if (reduce) {
      setCount(sum)
      return
    }
    if (beat < 3) {
      setCount(0)
      return
    }
    let c = 0
    const id = window.setInterval(() => {
      c += 1
      setCount(c)
      if (c >= sum) window.clearInterval(id)
    }, 110)
    return () => window.clearInterval(id)
  }, [beat, sum, reduce])

  const tensHome = dotGridPositions(tens, 142, 124, 5, 18)
  const onesHome = dotGridPositions(ones, 250, 124, 5, 18)
  const merged = dotGridPositions(sum, 150, 120, 5, 24)

  const capEn = [
    `This is the number ${n}.`,
    `It has 2 digits: ${tens} and ${ones}.`,
    `The digit ${tens} means ${tens}. The digit ${ones} means ${ones}.`,
    `Add the digits: ${tens} + ${ones}.`,
    `The sum of the digits is ${sum}.`,
  ]
  const capId = [
    `Ini bilangan ${n}.`,
    `Ada 2 angka: ${tens} dan ${ones}.`,
    `Angka ${tens} berarti ${tens}. Angka ${ones} berarti ${ones}.`,
    `Jumlahkan angkanya: ${tens} + ${ones}.`,
    `Jumlah angkanya ${sum}.`,
  ]
  const idx = Math.min(beat, 4)

  return (
    <svg viewBox="0 0 440 280" className="mx-auto block w-full max-w-[440px]" role="img" aria-label={capEn[idx]}>
      {/* beat 0: the whole number */}
      <MotionAppear show={beat === 0}>
        <text x={220} y={92} textAnchor="middle" fontSize={56} fontWeight={800} fill="#341857">
          {n}
        </text>
      </MotionAppear>

      {/* beat >= 1: the two digit tiles + plus sign */}
      <Tile show={beat >= 1} x={138} y={44} digit={tens} color={BLUE} />
      <Tile show={beat >= 1} x={242} y={44} digit={ones} color={ORANGE} />
      <MotionAppear show={beat >= 1 && beat < 4}>
        <text x={220} y={88} textAnchor="middle" fontSize={34} fontWeight={800} fill="#9aa3b2">
          +
        </text>
      </MotionAppear>

      {/* dots: appear under tiles at beat 2, glide to merged grid at beat >= 3 */}
      {tensHome.map((home, i) => (
        <MotionDot key={`t${i}`} show={beat >= 2} to={beat >= 3 ? merged[i] : home} color={BLUE} />
      ))}
      {onesHome.map((home, j) => (
        <MotionDot key={`o${j}`} show={beat >= 2} to={beat >= 3 ? merged[tens + j] : home} color={ORANGE} />
      ))}

      {/* running count + final result */}
      {beat >= 3 && (
        <text x={336} y={118} textAnchor="middle" fontSize={22} fontWeight={800} fill="#341857" className="tabular-nums">
          {count}
        </text>
      )}
      <MotionAppear show={beat >= 4}>
        <text x={336} y={152} textAnchor="middle" fontSize={26} fontWeight={800} fill={GREEN}>
          = {sum}
        </text>
      </MotionAppear>

      <Caption text={capId[idx]} />
    </svg>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/concepts/explainers/DigitSumExplainer.tsx
git commit -m "feat(wmi): N1 digit-sum concrete-dots explainer"
```

---

### Task 4: Register + verify

**Files:**
- Modify: `src/components/wmi/concepts/explainers/registry.ts`

- [ ] **Step 1: Register the explainer**

Edit `registry.ts` — add the import and the map entry:

```ts
import CountObjectsExplainer from './CountObjectsExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'
import StorySumExplainer from './StorySumExplainer'
import DigitSumExplainer from './DigitSumExplainer'
```

```ts
export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {
  'count-objects': CountObjectsExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'story-sum': StorySumExplainer,
  'digit-sum': DigitSumExplainer,
}
```

- [ ] **Step 2: Typecheck, lint, full tests, build**

Run: `npm run check && npm run lint && npm test && npm run build`
Expected: typecheck clean; lint clean (pre-existing react-refresh warning only); all tests pass (incl. the new `digitSumModel` tests); build succeeds.

- [ ] **Step 3: SSR smoke render (mounts without throwing)**

Create a throwaway script and run it:

```tsx
// _smoke.tsx
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement as h } from 'react'
import { digitSumModel } from './src/components/wmi/concepts/explainers/digitSumModel'
import DigitSumExplainer from './src/components/wmi/concepts/explainers/DigitSumExplainer'
for (const n of [47, 40, 10, 99]) {
  const { sum } = digitSumModel(n)
  const html = renderToStaticMarkup(h(DigitSumExplainer, { params: { n }, correctAnswer: String(sum) }))
  console.log(`n=${n} sum=${sum} svg=${html.startsWith('<svg')} len=${html.length}`)
}
```

Run: `npx tsx _smoke.tsx && rm -f _smoke.tsx`
Expected: four lines, each `svg=true` and `len` > 50. (If framer-motion throws under node SSR, remove the script and rely on the Animation-tab check below — the committed `digitSumModel` tests still cover the logic.)

- [ ] **Step 4: Manual Animation-tab check**

Run `npm run dev`, sign in as `shops@decasa.co.id`, open `/admin/wmi-concepts`, search `N1`. Confirm: the "Animation" chip is on; the sequence plays number → tiles → dots → merge+count → `= sum`; Replay works; check a `*0` case (e.g. 40 shows a dashed zero tile) and 99 (18 dots in rows of 5, in-frame). Nudge coordinates in `DigitSumExplainer.tsx` if anything clips.

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/concepts/explainers/registry.ts
git commit -m "feat(wmi): register N1 digit-sum explainer in Animation tab"
```

---

## Self-review

- **Spec coverage:** framework standard = framer-motion over SVG (Tasks 2–3 use framer-motion SVG; recorded in spec). Concrete-dots storyboard beats 1–5 (Task 3 beats 0–4). Zero-digit dashed tile (Task 2 `Tile`). 99 → rows of 5 (Task 1 `dotGridPositions`, perRow 5). Reduced motion (Task 3 `useReducedMotion`). Registry wiring → Animation tab (Task 4). Shared `Caption`/`DotGrid`-style helpers (Task 2). Verification (Task 4). All covered.
- **Placeholders:** none — every step has full code/commands.
- **Type consistency:** `digitSumModel`/`dotGridPositions`/`DigitDot` names match across Tasks 1–3; `ExplainerProps` imported from `./registry`; `EXPLAINERS` key `digit-sum` matches the concept slug.
