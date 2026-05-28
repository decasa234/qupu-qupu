# WMI Konsep Explainer & Question Breakdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline animated `<canvas>` explainer (shown below a question after submit) and a heuristic "break down the question" toggle (clause-split + color/size-emphasized words) to the WMI concept drill page.

**Architecture:** Frontend-only. Two independent subsystems layered onto `src/pages/WmiKonsepDrill.tsx`. (A) An explainer registry mirroring the existing illustration registry (`getExplainer(slug)`) with two starter canvas components. (B) A pure `wmiBreakdown.ts` heuristic utility (TDD with vitest) plus a view + toggle wired into `WmiQuestionView`. No backend, DB, or API changes — explainers derive everything from data already on the client (`params` from the question, `correct_answer` from the attempt result), and breakdown operates on text already present.

**Tech Stack:** React 18 + TypeScript + Tailwind, Vite, Vitest (`node` env), framer-motion v12 (already a dependency), HTML `<canvas>` 2D + `requestAnimationFrame`.

**Key facts confirmed against the codebase:**
- `WmiAttemptResult.correct_answer` is the choice **label** (e.g. `"A"`), NOT the numeric value (see `api/services/wmi/attempts.ts:160`). Both starter concepts are `multiple_choice`, so explainers compute the displayed number from `params` (`count-objects` → `params.n`; `shape-perimeter-square` → `params.side * 4`). The `correctAnswer` prop is kept in the contract for generality but unused by the two starters.
- Vitest `include` already covers `src/**/*.test.ts` with `environment: 'node'` (`vitest.config.ts`). `wmiBreakdown.ts` is pure (only imports `parseWmiMarkup`), so it needs no jsdom.
- `parseWmiMarkup(input)` (`src/lib/wmiMarkup.ts`) returns segments `{type:'text',text}` or `{type:'term',slug,text}`. `[[perimeter]]` → `{type:'term',slug:'perimeter',text:'perimeter'}`; `[[perimeter|keliling]]` → `{type:'term',slug:'perimeter',text:'keliling'}`.
- Tailwind tokens that exist: `qupu-brand-blue`, `qupu-brand-orange`, `qupu-purple`, `qupu-peach`, `qupu-shell`, `qupu-muted`. (`qupu-cream-dark` is referenced elsewhere but is NOT defined — do not introduce it in new code.)
- No commits are pushed during implementation; the user runs `/ship` at the end. Every `git commit` step below is local only.

---

## File Structure

**New files:**
- `src/lib/wmiBreakdown.ts` — pure `breakdownQuestion(text, lang)` heuristic.
- `src/lib/wmiBreakdown.test.ts` — vitest unit tests for the above.
- `src/components/wmi/WmiBreakdownView.tsx` — renders clause/token array with color+size emphasis.
- `src/components/wmi/WmiBreakdownToggle.tsx` — the "Pecah soal" button.
- `src/components/wmi/concepts/explainers/registry.ts` — `ExplainerProps` + `getExplainer(slug)`.
- `src/components/wmi/concepts/explainers/CountObjectsExplainer.tsx` — canvas: objects appear one-by-one with a tally.
- `src/components/wmi/concepts/explainers/ShapePerimeterSquareExplainer.tsx` — canvas: sides highlight sequentially with a running sum.
- `src/components/wmi/WmiExplainer.tsx` — wrapper: looks up explainer, animates open inline.

**Modified files:**
- `src/components/wmi/WmiQuestionView.tsx` — add breakdown view-mode props; render `WmiBreakdownView` + toggle.
- `src/pages/WmiKonsepDrill.tsx` — hold breakdown toggle state; mount `WmiExplainer` after submit.

**Unchanged:** all of `api/`, `db/`, the illustration registry, gamification, exam/drill flows.

---

## Subsystem B — Question Breakdown (Tasks 1–4)

Built first because the core logic is pure and TDD-able, and it is independent of the explainer.

### Task 1: Pure breakdown utility `wmiBreakdown.ts` (TDD)

**Files:**
- Create: `src/lib/wmiBreakdown.ts`
- Test: `src/lib/wmiBreakdown.test.ts`

The function splits a question into clauses on punctuation (`. , ? ! ; :`), tokenizes each clause into words (punctuation is consumed as a clause-break signal and not emitted), and classifies each word token. Glossary spans from `[[slug|text]]` markup are preserved as single tokens with their slug.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/wmiBreakdown.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { breakdownQuestion } from './wmiBreakdown'

describe('breakdownQuestion', () => {
  test('returns no clauses for empty input', () => {
    expect(breakdownQuestion('', 'en')).toEqual([])
  })

  test('a single sentence is one clause', () => {
    const clauses = breakdownQuestion('How many apples do you see?', 'en')
    expect(clauses).toHaveLength(1)
  })

  test('classifies digit tokens as number', () => {
    const clauses = breakdownQuestion('What is 3 plus 4?', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: '3', category: 'number' })
    expect(tokens).toContainEqual({ text: '4', category: 'number' })
  })

  test('classifies English number-words as number', () => {
    const clauses = breakdownQuestion('Add two and three', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'two', category: 'number' })
    expect(tokens).toContainEqual({ text: 'three', category: 'number' })
  })

  test('classifies English question-words', () => {
    const clauses = breakdownQuestion('How many apples do you see?', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'How', category: 'question-word' })
    expect(tokens).toContainEqual({ text: 'many', category: 'question-word' })
  })

  test('classifies Indonesian question-words', () => {
    const clauses = breakdownQuestion('Ada berapa apel yang kamu lihat?', 'id')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'berapa', category: 'question-word' })
    expect(tokens).toContainEqual({ text: 'yang', category: 'question-word' })
  })

  test('classifies Indonesian number-words as number', () => {
    const clauses = breakdownQuestion('Tambah dua dan tiga', 'id')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'dua', category: 'number' })
    expect(tokens).toContainEqual({ text: 'tiga', category: 'number' })
  })

  test('preserves glossary spans with slug (no display text)', () => {
    const clauses = breakdownQuestion(
      'What is the [[perimeter]] of a square with side 3?',
      'en',
    )
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'perimeter', category: 'glossary', slug: 'perimeter' })
    expect(tokens).toContainEqual({ text: '3', category: 'number' })
  })

  test('preserves glossary spans with custom display text (id)', () => {
    const clauses = breakdownQuestion(
      'Berapa [[perimeter|keliling]] dari persegi dengan sisi 3?',
      'id',
    )
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'keliling', category: 'glossary', slug: 'perimeter' })
  })

  test('splits multiple sentences into multiple clauses', () => {
    const clauses = breakdownQuestion('Count the dots. How many are there?', 'en')
    expect(clauses).toHaveLength(2)
    expect(clauses[0].tokens.map((t) => t.text)).toEqual(['Count', 'the', 'dots'])
  })

  test('splits on commas too', () => {
    const clauses = breakdownQuestion('First add, then subtract', 'en')
    expect(clauses).toHaveLength(2)
  })

  test('plain words fall through to plain category', () => {
    const clauses = breakdownQuestion('apples do you see', 'en')
    const tokens = clauses.flatMap((c) => c.tokens)
    expect(tokens).toContainEqual({ text: 'apples', category: 'plain' })
    expect(tokens).toContainEqual({ text: 'do', category: 'plain' })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/wmiBreakdown.test.ts`
Expected: FAIL — `Failed to resolve import "./wmiBreakdown"` (file does not exist yet).

- [ ] **Step 3: Implement `wmiBreakdown.ts`**

Create `src/lib/wmiBreakdown.ts`:

```ts
import { parseWmiMarkup } from './wmiMarkup'

export type BreakdownCategory = 'number' | 'question-word' | 'glossary' | 'plain'

export interface BreakdownToken {
  text: string
  category: BreakdownCategory
  slug?: string
}

export interface BreakdownClause {
  tokens: BreakdownToken[]
}

const NUMBER_WORDS_EN = new Set([
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty',
])
const QUESTION_WORDS_EN = new Set(['how', 'many', 'which', 'what'])

const NUMBER_WORDS_ID = new Set([
  'nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan',
  'sembilan', 'sepuluh',
])
const QUESTION_WORDS_ID = new Set(['berapa', 'mana', 'apa', 'yang'])

// Matches either a word (letters/digits, Unicode-aware) or a single punctuation
// mark. Punctuation marks act as clause boundaries and are not emitted as tokens.
const TOKEN_RE = /[\p{L}\p{N}]+|[.,?!;:]/gu
const PUNCT_RE = /^[.,?!;:]$/

function classify(word: string, lang: 'en' | 'id'): BreakdownCategory {
  if (/^\d+$/.test(word)) return 'number'
  const lower = word.toLowerCase()
  if (lang === 'en') {
    if (NUMBER_WORDS_EN.has(lower)) return 'number'
    if (QUESTION_WORDS_EN.has(lower)) return 'question-word'
  } else {
    if (NUMBER_WORDS_ID.has(lower)) return 'number'
    if (QUESTION_WORDS_ID.has(lower)) return 'question-word'
  }
  return 'plain'
}

export function breakdownQuestion(text: string, lang: 'en' | 'id'): BreakdownClause[] {
  const clauses: BreakdownClause[] = []
  let current: BreakdownToken[] = []

  const flush = () => {
    if (current.length > 0) {
      clauses.push({ tokens: current })
      current = []
    }
  }

  for (const segment of parseWmiMarkup(text)) {
    if (segment.type === 'term') {
      current.push({ text: segment.text, category: 'glossary', slug: segment.slug })
      continue
    }
    for (const match of segment.text.matchAll(TOKEN_RE)) {
      const raw = match[0]
      if (PUNCT_RE.test(raw)) {
        flush()
        continue
      }
      current.push({ text: raw, category: classify(raw, lang) })
    }
  }

  flush()
  return clauses
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/wmiBreakdown.test.ts`
Expected: PASS — all 12 tests green.

- [ ] **Step 5: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/wmiBreakdown.ts src/lib/wmiBreakdown.test.ts
git commit -m "feat(wmi): add heuristic question breakdown utility"
```

---

### Task 2: Breakdown view component `WmiBreakdownView.tsx`

**Files:**
- Create: `src/components/wmi/WmiBreakdownView.tsx`

Renders the clause array: one clause per line; each token styled by category with both color and font-size emphasis. Glossary tokens reuse `WmiGlossaryTerm` so they keep their lookup popover and report lookups.

- [ ] **Step 1: Implement the component**

Create `src/components/wmi/WmiBreakdownView.tsx`:

```tsx
import { breakdownQuestion } from '../../lib/wmiBreakdown'
import type { BreakdownCategory } from '../../lib/wmiBreakdown'
import WmiGlossaryTerm from './WmiGlossaryTerm'

const TOKEN_STYLE: Record<BreakdownCategory, string> = {
  number: 'text-2xl font-extrabold text-qupu-brand-orange',
  'question-word': 'text-xl font-bold text-qupu-purple',
  glossary: '',
  plain: 'text-gray-900',
}

interface Props {
  text: string
  lang: 'en' | 'id'
  onLookup: (slug: string) => void
}

export default function WmiBreakdownView({ text, lang, onLookup }: Props) {
  const clauses = breakdownQuestion(text, lang)
  return (
    <div className="space-y-1">
      {clauses.map((clause, clauseIndex) => (
        <div key={clauseIndex} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {clause.tokens.map((token, tokenIndex) =>
            token.category === 'glossary' && token.slug ? (
              <WmiGlossaryTerm key={tokenIndex} slug={token.slug} onLookup={onLookup}>
                {token.text}
              </WmiGlossaryTerm>
            ) : (
              <span key={tokenIndex} className={TOKEN_STYLE[token.category]}>
                {token.text}
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/WmiBreakdownView.tsx
git commit -m "feat(wmi): add breakdown view with color and size emphasis"
```

---

### Task 3: Breakdown toggle button `WmiBreakdownToggle.tsx`

**Files:**
- Create: `src/components/wmi/WmiBreakdownToggle.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/wmi/WmiBreakdownToggle.tsx`:

```tsx
interface Props {
  active: boolean
  onToggle: () => void
}

export default function WmiBreakdownToggle({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-2 rounded-lg border-2 border-qupu-brand-blue px-3 py-1 text-sm font-bold text-qupu-brand-blue"
    >
      {active ? 'Soal utuh' : 'Pecah soal'}
    </button>
  )
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/WmiBreakdownToggle.tsx
git commit -m "feat(wmi): add question breakdown toggle button"
```

---

### Task 4: Wire breakdown into `WmiQuestionView`

**Files:**
- Modify: `src/components/wmi/WmiQuestionView.tsx`

Add two optional props. When `breakdownActive` is true, render `WmiBreakdownView` instead of the plain `MarkupText` for the English body, and for the Indonesian body inside the translation spoiler (so it follows "whichever language is shown"). Place the toggle button directly under the English body.

- [ ] **Step 1: Add imports**

In `src/components/wmi/WmiQuestionView.tsx`, add after the existing component imports (after line 7, the `WmiTranslationSpoiler` import):

```tsx
import WmiBreakdownView from './WmiBreakdownView'
import WmiBreakdownToggle from './WmiBreakdownToggle'
```

- [ ] **Step 2: Extend the Props interface**

Replace the `Props` interface (lines 9–20) with:

```tsx
interface Props {
  question: WmiQuestion
  selectedChoice?: string | null
  fillValue?: string
  highlight?: { correct: string | null; wrongPicked: string | null }
  disabled?: boolean
  revealed?: boolean
  breakdownActive?: boolean
  onToggleBreakdown?: () => void
  onPickChoice: (label: string) => void
  onSubmitFillIn: (answer: string) => void
  onLookupTerm: (slug: string) => void
  onRevealTranslation: () => void
}
```

- [ ] **Step 3: Destructure the new props**

Replace the destructuring in the function signature (lines 38–49) with:

```tsx
export default function WmiQuestionView({
  question,
  selectedChoice = null,
  fillValue = '',
  highlight,
  disabled,
  revealed = false,
  breakdownActive = false,
  onToggleBreakdown,
  onPickChoice,
  onSubmitFillIn,
  onLookupTerm,
  onRevealTranslation,
}: Props) {
```

- [ ] **Step 4: Render breakdown + toggle for the English body**

Replace the English body block (lines 56–59):

```tsx
      <div className="text-sm font-bold text-qupu-muted">Soal {question.number}</div>
      <div className="mt-2 text-lg font-semibold text-gray-900">
        <MarkupText text={question.body_en} onLookup={onLookupTerm} />
      </div>
```

with:

```tsx
      <div className="text-sm font-bold text-qupu-muted">Soal {question.number}</div>
      <div className="mt-2 text-lg font-semibold text-gray-900">
        {breakdownActive ? (
          <WmiBreakdownView text={question.body_en} lang="en" onLookup={onLookupTerm} />
        ) : (
          <MarkupText text={question.body_en} onLookup={onLookupTerm} />
        )}
      </div>
      {onToggleBreakdown && (
        <WmiBreakdownToggle active={breakdownActive} onToggle={onToggleBreakdown} />
      )}
```

- [ ] **Step 5: Render breakdown for the Indonesian body inside the spoiler**

Replace the Indonesian body block (lines 103–106):

```tsx
      <WmiTranslationSpoiler revealed={revealed} onReveal={onRevealTranslation}>
        <div className="font-semibold">
          <MarkupText text={question.body_id} onLookup={onLookupTerm} />
        </div>
```

with:

```tsx
      <WmiTranslationSpoiler revealed={revealed} onReveal={onRevealTranslation}>
        <div className="font-semibold">
          {breakdownActive ? (
            <WmiBreakdownView text={question.body_id} lang="id" onLookup={onLookupTerm} />
          ) : (
            <MarkupText text={question.body_id} onLookup={onLookupTerm} />
          )}
        </div>
```

- [ ] **Step 6: Wire toggle state into the drill page**

In `src/pages/WmiKonsepDrill.tsx`:

(a) Add a breakdown state next to the other `useState` calls (after the `revealed` state on line 18, `const [revealed, setRevealed] = useState(false)`):

```tsx
  const [breakdown, setBreakdown] = useState(false)
```

(b) Reset it inside `loadNext`, alongside the other resets (after `setRevealed(false)` on line 27):

```tsx
    setBreakdown(false)
```

(c) Pass the new props on the `<WmiQuestionView ... />` element (it currently spans lines 103–117). Add these two props (e.g. right after `revealed={revealed}` on line 112):

```tsx
        breakdownActive={breakdown}
        onToggleBreakdown={() => setBreakdown((value) => !value)}
```

- [ ] **Step 7: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 8: Manual browser smoke test (breakdown)**

Run: `npm run dev`, sign in, open `/latihan/wmi/konsep`.
Expected: a "Pecah soal" button appears under the question. Clicking it splits the sentence onto separate lines with numbers larger/orange and question-words (How/many, berapa/yang) purple. Glossary terms (e.g. "perimeter"/"keliling") remain clickable. Revealing the Indonesian translation and toggling breakdown highlights the Indonesian text too. Button label flips to "Soal utuh".

- [ ] **Step 9: Commit**

```bash
git add src/components/wmi/WmiQuestionView.tsx src/pages/WmiKonsepDrill.tsx
git commit -m "feat(wmi): wire question breakdown toggle into konsep drill"
```

---

## Subsystem A — Inline Explainer (Tasks 5–8)

### Task 5: Explainer registry + `ExplainerProps`

**Files:**
- Create: `src/components/wmi/concepts/explainers/registry.ts`

Mirrors `src/components/wmi/concepts/registry.ts` (the illustration registry). Defines the explainer contract and a `getExplainer(slug)` lookup. The two starter components are imported here; they are created in Tasks 6–7. Implement this registry AFTER Tasks 6–7's files exist, OR create stub components first — to keep tasks self-contained, this task creates the registry referencing the two components, so do Tasks 6 and 7 before running typecheck in this task. (Ordering note: complete 6 and 7, then 5. Steps below assume 6 and 7 are done.)

- [ ] **Step 1: Implement the registry**

Create `src/components/wmi/concepts/explainers/registry.ts`:

```ts
import type { ComponentType } from 'react'
import CountObjectsExplainer from './CountObjectsExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
}

export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {
  'count-objects': CountObjectsExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors (requires Tasks 6 and 7 complete).

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/concepts/explainers/registry.ts
git commit -m "feat(wmi): add explainer registry and contract"
```

> **Note on task order:** The `ExplainerProps` type lives in `registry.ts`, and Tasks 6–7 import it from there. Create `registry.ts` as the very first step of Task 6 (so the type exists), then fill in the two components, then return to Task 5's commit. Concretely: do Task 6 Step 0 (below) first.

---

### Task 6: `CountObjectsExplainer` canvas

**Files:**
- Create: `src/components/wmi/concepts/explainers/registry.ts` (Step 0, type only — full version committed in Task 5)
- Create: `src/components/wmi/concepts/explainers/CountObjectsExplainer.tsx`

Concept params shape (from `api/services/wmi/concepts/count-objects/index.ts`): `{ n: number (2–9), kind: 'apel'|'bola'|'bintang'|'kucing', offset: number }`. The answer count equals `params.n`. Objects appear one-by-one on the canvas while a tally counts up to `n`.

- [ ] **Step 0: Create the registry file with the type (unblocks the import)**

Create `src/components/wmi/concepts/explainers/registry.ts` with the `ExplainerProps` type and an empty map for now (Task 5 replaces the map body with the two imports):

```ts
import type { ComponentType } from 'react'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
}

export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
```

- [ ] **Step 1: Implement the explainer**

Create `src/components/wmi/concepts/explainers/CountObjectsExplainer.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import type { ExplainerProps } from './registry'

interface CountObjectsParams {
  n: number
  kind: string
}

const KIND_COLOR: Record<string, string> = {
  apel: '#F97316',
  bola: '#2563EB',
  bintang: '#ffdd55',
  kucing: '#7C3AED',
}

export default function CountObjectsExplainer({ params }: ExplainerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const p = params as CountObjectsParams
    const n = Math.max(1, Math.min(9, p.n))
    const color = KIND_COLOR[p.kind] ?? '#F97316'
    const start = performance.now()
    const interval = 500
    const cols = 5
    const cell = 56
    const radius = 18
    let raf = 0

    const draw = (now: number) => {
      const revealed = Math.min(n, Math.floor((now - start) / interval) + 1)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < revealed; i++) {
        const cx = (i % cols) * cell + cell / 2 + 8
        const cy = Math.floor(i / cols) * cell + cell / 2 + 8
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
      ctx.fillStyle = '#30598A'
      ctx.font = 'bold 28px Nunito, sans-serif'
      ctx.fillText(String(revealed), 8, canvas.height - 12)
      if (revealed < n) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [params])

  return <canvas ref={canvasRef} width={320} height={180} className="mx-auto block" />
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/concepts/explainers/registry.ts src/components/wmi/concepts/explainers/CountObjectsExplainer.tsx
git commit -m "feat(wmi): add count-objects canvas explainer"
```

---

### Task 7: `ShapePerimeterSquareExplainer` canvas

**Files:**
- Create: `src/components/wmi/concepts/explainers/ShapePerimeterSquareExplainer.tsx`

Concept params shape (from `api/services/wmi/concepts/shape-perimeter-square/index.ts`): `{ side: number (2–9) }`. The perimeter equals `params.side * 4`. Each of the four sides highlights in sequence while a running product `side × k` builds up to the answer.

- [ ] **Step 1: Implement the explainer**

Create `src/components/wmi/concepts/explainers/ShapePerimeterSquareExplainer.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import type { ExplainerProps } from './registry'

interface ShapePerimeterSquareParams {
  side: number
}

export default function ShapePerimeterSquareExplainer({ params }: ExplainerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const p = params as ShapePerimeterSquareParams
    const side = Math.max(1, p.side)
    const start = performance.now()
    const interval = 800
    const x = 60
    const y = 30
    const len = 120
    let raf = 0

    const corners: Array<[number, number]> = [
      [x, y],
      [x + len, y],
      [x + len, y + len],
      [x, y + len],
    ]
    const edges: Array<[[number, number], [number, number]]> = [
      [corners[0], corners[1]],
      [corners[1], corners[2]],
      [corners[2], corners[3]],
      [corners[3], corners[0]],
    ]

    const draw = (now: number) => {
      const highlighted = Math.min(4, Math.floor((now - start) / interval) + 1)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = '#CBD5E1'
      ctx.lineWidth = 4
      ctx.strokeRect(x, y, len, len)

      ctx.strokeStyle = '#F97316'
      ctx.lineWidth = 6
      for (let i = 0; i < highlighted; i++) {
        const [[ax, ay], [bx, by]] = edges[i]
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }

      ctx.fillStyle = '#30598A'
      ctx.font = 'bold 22px Nunito, sans-serif'
      ctx.fillText(`${side} x ${highlighted} = ${side * highlighted}`, x, y + len + 36)

      if (highlighted < 4) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [params])

  return <canvas ref={canvasRef} width={300} height={220} className="mx-auto block" />
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/concepts/explainers/ShapePerimeterSquareExplainer.tsx
git commit -m "feat(wmi): add shape-perimeter-square canvas explainer"
```

- [ ] **Step 4: Complete Task 5 (register both explainers)**

Now replace the empty `EXPLAINERS` map in `registry.ts` (created in Task 6 Step 0) with the full version that imports both components — this is exactly the code in Task 5 Step 1. Then run Task 5 Steps 2–3 (typecheck/lint + commit).

---

### Task 8: `WmiExplainer` wrapper + inline mount after submit

**Files:**
- Create: `src/components/wmi/WmiExplainer.tsx`
- Modify: `src/pages/WmiKonsepDrill.tsx`

The wrapper looks up the explainer by slug, returns `null` when none is registered (graceful fallback), and animates open with framer-motion (already a dependency). It mounts in the drill page only after `feedback` is set, positioned below the question and above the existing feedback panel.

- [ ] **Step 1: Implement the wrapper**

Create `src/components/wmi/WmiExplainer.tsx`:

```tsx
import { motion } from 'framer-motion'
import { getExplainer } from './concepts/explainers/registry'

interface Props {
  slug: string
  params: unknown
  correctAnswer: string
}

export default function WmiExplainer({ slug, params, correctAnswer }: Props) {
  const Explainer = getExplainer(slug)
  if (!Explainer) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-4 overflow-hidden rounded-xl border-2 border-qupu-peach bg-qupu-shell p-4"
    >
      <div className="mb-2 text-sm font-bold text-qupu-brand-blue">Penjelasan</div>
      <Explainer params={params} correctAnswer={correctAnswer} />
    </motion.div>
  )
}
```

- [ ] **Step 2: Mount it in the drill page**

In `src/pages/WmiKonsepDrill.tsx`:

(a) Add the import next to the other component imports (after `import WmiVoteButtons from '../components/wmi/WmiVoteButtons'`, line 4):

```tsx
import WmiExplainer from '../components/wmi/WmiExplainer'
```

(b) In the post-submit block (currently lines 118–129, the `{feedback && ( <> ... </> )}` fragment), add `WmiExplainer` as the FIRST child of the fragment so it renders directly below the question and above the feedback panel:

```tsx
      {feedback && (
        <>
          <WmiExplainer
            slug={question.concept_slug}
            params={question.params}
            correctAnswer={feedback.correct_answer}
          />
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
```

(`question.concept_slug` and `question.params` already exist on `WmiConceptQuestion` — see `src/types/wmi.ts:97–108`; `feedback.correct_answer` is on `WmiAttemptResult`.)

- [ ] **Step 3: Typecheck and lint**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual browser smoke test (explainer)**

Run: `npm run dev`, open `/latihan/wmi/konsep`, answer a `count-objects` (Grade 0) question.
Expected: after submitting, a "Penjelasan" panel slides open below the question; dots appear one-by-one with a tally counting up. For a `shape-perimeter-square` (Grade 2–3) question, the four sides highlight in sequence with `side × k = …` building to the perimeter. Clicking "Lanjut"/next clears the explainer and loads a fresh question (no leftover animation). A concept with no registered explainer (e.g. `digit-sum`) shows just the normal feedback panel, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/wmi/WmiExplainer.tsx src/pages/WmiKonsepDrill.tsx
git commit -m "feat(wmi): mount inline animated explainer after concept submit"
```

---

## Final Verification

### Task 9: Full gate

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — `wmiBreakdown` tests green; existing integration suites skip (no `TEST_DATABASE_URL`).

- [ ] **Step 2: Typecheck and lint the whole project**

Run: `npm run check && npm run lint`
Expected: no errors.

- [ ] **Step 3: Full manual walkthrough**

Run: `npm run dev`, open `/latihan/wmi/konsep`. Confirm end-to-end:
- Break down a long question → phrases on separate lines, numbers large/orange, question-words purple, glossary terms still clickable.
- Reveal Indonesian → toggle breakdown → Indonesian text broken down too.
- Submit an answer → explainer animates open inline below the question (no page reload/jump), feedback panel and vote buttons below it.
- Next question → explainer + breakdown reset cleanly.

- [ ] **Step 4: Stop here**

Do NOT push. The user runs `/ship` to land the branch.

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Inline reveal, no reload (spec rev #1) → Task 8 (mounts after `feedback`, framer-motion slide-in; SPA already, no navigation). ✓
- Animated `<canvas>` explainer, per concept-type, parameterized (rev #2) → Tasks 5–7 (registry + 2 canvas components driven by `params`). ✓
- Graceful fallback when no explainer (spec edge case) → Task 5/8 (`getExplainer` returns `null`, wrapper renders nothing). ✓
- Canvas loop cleanup on unmount (spec edge case) → Tasks 6–7 (`cancelAnimationFrame` in `useEffect` cleanup). ✓
- Breakdown button, clause split, color+size emphasis (rev #3) → Tasks 1–4. ✓
- Heuristic source, zero authoring (spec) → Task 1 (`classify` + number/question-word sets). ✓
- Language-aware, whichever shown (spec) → Task 4 (en body always; id body in spoiler). ✓
- Glossary-span preservation (spec edge case) → Task 1 test + impl (term segments → glossary tokens). ✓
- Vitest coverage for the pure util; components manual-smoke (spec testing) → Task 1 (12 tests), Tasks 4/8 manual steps, Task 9 gate. ✓
- No backend/DB/API changes (spec) → all tasks are `src/` only. ✓

**Placeholder scan:** No TBD/TODO; every code step contains full code; commands have expected output. ✓

**Type consistency:** `ExplainerProps { params: unknown; correctAnswer: string }` defined in `registry.ts` and imported identically by both explainers and used by `WmiExplainer` (which passes `slug`, `params`, `correctAnswer`). `BreakdownCategory`/`BreakdownToken`/`BreakdownClause` defined in `wmiBreakdown.ts`, consumed by `WmiBreakdownView`. `breakdownQuestion(text, lang)` signature consistent across test, util, and view. `WmiQuestionView` new props (`breakdownActive`, `onToggleBreakdown`) match what `WmiKonsepDrill` passes. ✓

**Ordering caveat documented:** `registry.ts` holds the shared `ExplainerProps` type, so Task 6 Step 0 creates it (type + empty map) before the components import it; Task 7 Step 4 fills the map and completes Task 5's commit. ✓
