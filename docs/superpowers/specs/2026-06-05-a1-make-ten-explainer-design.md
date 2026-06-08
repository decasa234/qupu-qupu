# A1 — Make-ten animated explainer (`single-digit-addition`)

**Date:** 2026-06-05
**Branch:** `feat/wmi-concept-taxonomy`
**Status:** Design — approved, pending written-spec review

## Problem

Concept **A1** (`single-digit-addition`) was flagged `needs_changes` in the admin
proofreading panel with the note:

> *"add animation on this, brainstorm first to child thinking like olympiad"*

Today A1 is pure text: `render()` emits `What is {a} + {b}?` and a one-line hint
(*"Count up from the larger number."*). It has **no illustration and no explainer**
— it is one of the concepts with nothing in either frontend registry.

The ask is not decoration. *"Thinking like olympiad"* means the animation should
teach a **flexible mental-math strategy**, not rote finger-counting. For
single-digit addition the canonical foundation is **make-ten / bridging through a
ten**: decompose one addend so the pair completes a ten, then add the leftover.
This is the strategy strong young competitors internalize and the one that
replaces counting-on.

## Decisions (locked with the user)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Strategy | **Make-ten (bridging through a ten-frame)** | Foundational "olympiad seed" mental-math move; replaces the rote count-on the current hint teaches. |
| 2 | Placement | **Post-answer explainer only** (with Replay) | Matches the 3 existing explainers; a make-ten animation computes the sum, so showing it pre-answer would spoil it. |
| 3 | Generator | **Unchanged** — explainer adapts | `generate()` stays `a,b ∈ 1–9`; no difficulty shift, no churn to `single-digit-addition/index.test.ts`. The explainer branches on the sum. |
| 4 | Technique | **framer-motion DOM** (ten-frame as SVG/divs) | The teaching punch is bridge-chips *sliding* in to fill the ten; framer-motion gives that motion declaratively, renders accessible DOM, and respects `prefers-reduced-motion`. `framer-motion` is already a dependency and `WmiExplainer` already wraps content in `motion.div`. |
| 5 | Caption language | **Bilingual, follows the drill's current language** (`en`/`id`) | Audience is Indonesian grade 1–2; captions track the same `questionLang` toggle the question uses. |

## Architecture

### Files

| File | Change |
|---|---|
| `src/components/wmi/concepts/explainers/SingleDigitAdditionExplainer.tsx` | **New.** The animated explainer. |
| `src/components/wmi/concepts/explainers/makeTenSteps.ts` | **New.** Pure storyboard/decomposition builder (`buildMakeTenSteps`) — unit-testable, no DOM. |
| `src/components/wmi/concepts/explainers/makeTenSteps.test.ts` | **New.** Vitest unit test for the pure builder. |
| `src/components/wmi/concepts/explainers/registry.ts` | Register `'single-digit-addition'`. |
| `src/components/wmi/concepts/explainers/registry.ts` (`ExplainerProps`) | Add **optional** `lang?: 'en' \| 'id'` (default `'en'`). |
| `src/components/wmi/WmiExplainer.tsx` | Accept `lang` prop, forward to the explainer. |
| `src/pages/WmiKonsepDrill.tsx` | Pass `lang={questionLang}` to `<WmiExplainer>`. |

The new `lang` prop is **optional** so `CountObjectsExplainer`,
`ShapePerimeterSquareExplainer`, and `StorySumExplainer` keep compiling and
behaving exactly as today.

### Interface

```ts
// explainers/registry.ts
export interface ExplainerProps {
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'   // NEW — defaults to 'en'
}
```

```tsx
// WmiExplainer.tsx — new prop, forwarded
<WmiExplainer slug={...} params={...} correctAnswer={...} lang={questionLang} />
```

### Data flow

`WmiKonsepDrill` already owns `questionLang` state (the EN/ID toggle on
`WmiQuestionView`). It already renders `<WmiExplainer slug params correctAnswer>`
post-answer. We thread `questionLang` one level down. No backend, no API, no DB,
no generator changes.

## The storyboard

The decomposition is computed by a pure helper so the rendering stays thin and
the logic is testable:

```ts
// makeTenSteps.ts
const a = clamp(p.a, 1, 9), b = clamp(p.b, 1, 9)
const big = Math.max(a, b), small = Math.min(a, b)   // larger goes in first
const sum = a + b
const completesTen = Math.max(0, 10 - big)           // chips needed to fill the ten
const bridge = Math.min(small, completesTen)          // small portion that completes the ten
const leftover = Math.max(0, sum - 10)               // > 0 only when bridging (clamped: non-bridging = 0)
const bridges = sum > 10                              // true → play the split + leftover steps
```

`buildMakeTenSteps(a, b, lang)` returns an ordered `Step[]`; each step carries the
ten-frame fill state (count + color per cell), optional loose chips, an optional
number-bond split, a short bilingual caption, and a `result` flag.

Larger addend fills first — this quietly honors commutativity / count-on-from-
larger and guarantees `completesTen ≤ small` exactly when `sum > 10`.

### Case A — bridging (`sum > 10`), e.g. `8 + 5`

```
1. ten-frame fills with 8 blue chips (row 5 / row 3); 2 empty cells glow
        EN "start with the bigger number: 8"   ID "mulai dari yang besar: 8"
2. the 5 appears as orange chips beside the frame
        EN "add 5"                              ID "tambah 5"
3. number bond splits 5 → 2 + 3
        EN "5 = 2 + 3"                          ID "5 = 2 + 3"
4. 2 orange chips SLIDE into the empty cells → frame full (10)
        EN "2 completes the ten → 10"           ID "2 melengkapi sepuluh → 10"
5. 3 orange chips remain below
        EN "3 left over"                        ID "sisa 3"
6. result: 10 + 3 = 13  (answer highlighted)
        EN "10 + 3 = 13"                        ID "10 + 3 = 13"
```

### Case B — non-bridging (`sum < 10`), e.g. `3 + 4`

```
1. fill 4 blue chips                            EN "start with 4"  ID "mulai dari 4"
2. 3 orange chips slide in (frame still has room)
                                                EN "add 3"         ID "tambah 3"
3. result: still under ten → 7
        EN "still room in the ten → 7"          ID "masih muat dalam sepuluh → 7"
```

No split step; `leftover` is unused; `completesTen` may exceed `small`, so only
`small` chips slide in and the frame stays partly empty.

### Case C — perfect ten (`sum === 10`), e.g. `6 + 4`

Same as Case A but `bridge === small` and `leftover === 0`: the frame fills
*exactly*, no loose chips, no split needed.

```
EN "they make exactly ten → 10"   ID "pas sepuluh → 10"
```

This is the bridging branch with `leftover === 0`, so it falls out of the same
code path (the split/leftover steps are skipped when `leftover === 0`).

## Animation & motion spec

- **Cadence:** ~900 ms per step (matches `StorySumExplainer`), auto-plays on
  mount via a `setTimeout` chain advancing a `step` index; timers cleared on
  unmount.
- **Replay:** handled by the existing `WmiExplainer` Replay button, which bumps
  `replayKey` and remounts the explainer → `step` resets to 0. No new control.
- **Sliding chips:** the bridge chips animate from their "beside the frame"
  position into the empty ten-frame cells using framer-motion (`animate` /
  `layout`), with a spring/ease that reads as "snapping into place."
- **Number bond:** the `5 = 2 + 3` split pops in (scale/opacity) on its step.

## Ten-frame & brand spec

- **Ten-frame:** standard 5×2 grid (top row of 5, bottom row of 5), rounded
  cells, qupu-peach/muted outline, white cell background — consistent with the
  grid look in `rectangle-area-grid` / the illustration preview.
- **Colors:** first addend chips `#2f6df0` (qupu-brand-blue); second addend /
  bridge chips `#F97316` (qupu-brand-orange); filled-ten highlight green
  `#10B981` on completion (same success green as StorySum's result state);
  answer text qupu-brand-blue. Font Nunito, matching siblings.
- **Footprint:** ~`max-w-[440px]`, block-centered, like the other explainers,
  fitting the 440px drill column.

## Accessibility

- `useReducedMotion()` → when reduced motion is preferred, render the **final
  frame** statically (full ten-frame + leftover chips + `10 + n = sum`), skipping
  the timed sequence. (A genuine improvement over the canvas explainers, which
  ignore this.)
- Root element gets an `aria-label` describing the strategy in the active
  language (e.g. *"Cara berpikir: jadikan sepuluh dulu, lalu tambah sisanya."*).
- Captions are real text nodes (DOM, not canvas pixels), so they are selectable
  and screen-reader visible.

## Testing / verification

1. **Unit (automated):** `makeTenSteps.test.ts` — for representative pairs across
   all three cases (e.g. `8+5`, `7+6`, `9+9`, `6+4`, `3+4`, `1+1`, plus
   commutative pairs `5+8` vs `8+5`):
   - last step's stated total equals `a + b`;
   - `completesTen + leftover` invariants hold;
   - bridging steps present iff `sum > 10`; split step present iff `sum > 10`;
   - larger addend always fills first.
2. **Typecheck:** `npm run check`.
3. **Manual:** admin proofreading page (`/admin/wmi/concepts`) renders A1 with the
   new explainer across reseeded samples; the drill (`/latihan/wmi` → konsep,
   grade 1–2) plays it post-answer, Replay restarts it, and the EN/ID toggle
   flips captions. Spot-check a bridging, a non-bridging, and a perfect-ten seed.
4. **Review flow:** once verified, clear A1 from `needs_changes` in the
   proofreading panel.

## Out of scope (YAGNI)

- No change to `generate()` / A1's difficulty or its existing test.
- No pre-answer illustration for A1.
- No make-ten reuse for A2 (`single-digit-subtraction`) or other arithmetic
  concepts yet — the pure `makeTenSteps` helper is written so a future
  subtraction/"break-ten" explainer *could* reuse the ten-frame rendering, but
  that is a separate task.
- No backfill of `lang` into the existing three explainers (their captions stay
  as-is; the prop is optional).
