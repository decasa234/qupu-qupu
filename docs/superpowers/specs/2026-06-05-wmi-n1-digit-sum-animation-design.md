# WMI N1 (digit-sum) animation + animation-framework standard — design

Date: 2026-06-05
Status: approved (design); ready for implementation plan

## Problem

Concept **N1 = `digit-sum`** (`api/services/wmi/concepts/digit-sum/`) asks for the
sum of the digits of a two-digit number `n` (10–99): answer = `tens + ones`
(e.g. 47 → 4 + 7 = 11). It has no explainer animation. We want one that makes a
young learner (grades 1–2) understand **what a digit is** and why we add the two
of them.

Separately, QUPU concept "animations" are currently inconsistent, and we want to
**standardize all future animations on one framework**.

## Current state (from exploration)

- `framer-motion` (^12.26.2) is already a dependency, used for UI transitions in
  `WmiExplainer`, `Reveal`, `Videos` — not for the teaching animations themselves.
- An explainer system already exists: `src/components/wmi/concepts/explainers/`
  with a `registry.ts` (`getExplainer(slug)`), surfaced in the proofreading
  **Animation tab** by `src/components/wmi/WmiExplainer.tsx` (which provides the
  panel chrome + a Replay button that remounts the explainer via `key`).
- The 3 existing explainers (`CountObjects`, `StorySum`, `ShapePerimeterSquare`)
  are hand-rolled **imperative Canvas 2D + rAF/setTimeout "beats"**.
- The 23 question illustrations (e.g. `block-count-3d.tsx`) are already
  **declarative React SVG**.

## Decision 1 — framework standard: framer-motion over SVG

All future concept animations use **framer-motion animating SVG/DOM**.

Rationale: already installed (no new dependency); reuses the existing SVG
illustration style; declarative (easier to author and review one concept at a
time); vector-crisp and accessible. Canvas only wins for hundreds of particles /
pixel effects, which concept animations don't need.

- New explainers are framer-motion SVG components.
- The 3 existing canvas explainers may be migrated later (out of scope here).
- This is recorded so future explainers follow the same approach.

## Decision 2 — N1 animation: concrete dots

Represent each digit as both a **symbol** (a tile) and a **quantity** (dots), then
merge the dots to make the addition concrete.

**Pedagogy guardrail:** digit-sum adds **face values** (4 + 7), NOT place values
(40 + 7). The animation deliberately avoids any tens-rod / place-value framing —
that belongs to N2 (`place-value`) and would mislead a learner on N1.

### Storyboard (example `n = 47`, sum = 11)

A single SVG (~440×260) with a bottom caption bar, played as a timed sequence;
Replay is provided by the existing `WmiExplainer` wrapper.

1. Big **47** appears, centered. — "This is the number 47." / "Ini bilangan 47."
2. The 4 and 7 separate into two rounded **digit tiles** (blue **4**, orange **7**).
   — "It has 2 digits: 4 and 7." / "Ada 2 angka: 4 dan 7."
3. Under each tile, dots pop in (staggered): **4 blue dots**, **7 orange dots**.
   — "The digit 4 means 4. The digit 7 means 7." / "Angka 4 berarti 4. Angka 7 berarti 7."
4. A **+** lights up; all dots glide to the center into one tidy grid while a
   counter ticks **1→11**. — "Add the digits: 4 + 7." / "Jumlahkan angkanya: 4 + 7."
5. **= 11** snaps in (green highlight); counter rests on 11.
   — "The sum of the digits is 11." / "Jumlah angkanya 11."

### Edge cases

- **Ones (or tens) digit = 0** (e.g. 40 → 4+0=4): the zero tile shows an empty
  **dashed outline** = "0 means none"; merge + counter still produce the right sum.
- **Max case `99`** = 18 dots: merged dots lay out in **rows of 5** so they stay
  countable. Tens digit is always 1–9 (n ≥ 10); ones digit 0–9.

## Architecture

- **New file:** `src/components/wmi/concepts/explainers/DigitSumExplainer.tsx`.
  - Props: existing `ExplainerProps` = `{ params: unknown; correctAnswer: string }`;
    internally treat `params` as `{ n: number }`.
  - Derives `tens = ⌊n/10⌋`, `ones = n%10`, `sum = tens + ones` (mirrors the
    concept's `render`).
  - Renders one `<svg>`; animates tiles, dots, `+`, and `= sum` via a
    framer-motion `useAnimate` timeline (staggered dot entrance, glide-to-center,
    counter tick). Colors use existing QUPU tokens (brand-blue / brand-orange /
    green for the result).
  - **Reduced motion:** `useReducedMotion()` → snap directly to the final state
    (all dots + "= sum") with no motion.
- **Register** the component for slug `digit-sum` in
  `src/components/wmi/concepts/explainers/registry.ts`. This auto-lights the
  "Animation" chip for N1 and renders it in the Animation tab — no other wiring.
- **Two small shared helpers** to seed the reusable pattern (kept minimal — YAGNI):
  - `Caption` — the bottom caption bar (EN/ID line).
  - `DotGrid` — lays out `k` dots in rows of 5 at a given origin/color.
  These become the reference pattern the next framer-motion SVG explainer copies.

## Out of scope

- Migrating the 3 existing canvas explainers to framer-motion (future cleanup).
- Place-value teaching (that is N2 `place-value`).
- Any change to the `digit-sum` generator/params or the question itself.

## Verification

- It is a visual component: primary check is the proofreading **Animation tab**
  for N1 across several `n` (including a `*0` case and `99`).
- **SSR smoke render**: `renderToStaticMarkup(<DigitSumExplainer …/>)` mounts
  without throwing for a range of seeds/`n`.
- Reuses the concept's own `tens/ones/sum` arithmetic (no new math to test).
- `npm run check`, `npm run lint`, `npm run build` stay green.
