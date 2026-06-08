# Per-Paper-Question Custom Visuals — Design

**Date:** 2026-06-07
**Status:** Approved (pending spec review)

## Goal

Let a specific WMI **paper question** carry a hand-built **illustration** (replacing
its OCR-scan figure) and a **counting animation** (a post-answer teaching aid),
delivered first for **WMI-19F1 Q1** — the candy-counting question (3 rows: 22, 22,
4 → 48). The mechanism is reusable for any future paper question.

## Context

- Paper questions currently render only a static `figure_url` image via
  `src/components/wmi/WmiFigure.tsx`. There is no React illustration/animation hook
  for them (concept illustrations/animations are keyed by concept *slug*, which
  papers don't have).
- `src/components/wmi/WmiQuestionView.tsx` is the single component that renders a
  question (stem + `<WmiFigure src={question.figure_url} />` at ~line 104 + choices +
  a `revealed`/breakdown area). It is used by the member drill (`WmiDrill`), exam
  (`WmiExam`), exam review (`WmiExamReview`), the konsep flow, and the admin Drill
  preview (`AdminWmiDrill`). Integrating here reaches every surface at once.
- Concept animations render through `src/components/wmi/WmiExplainer.tsx` (a carousel
  host with play/pause/dots) using the explainer components in
  `src/components/wmi/concepts/explainers/`. We reuse that host.
- A frontend `paperCode` util already exists (`src/lib/wmiPaperCode.ts`,
  `WMI-19F1` format). WMI-19F1 = 2019 Grade 1 Final.

## Decisions (locked with user)

1. **Surface:** member-facing **and** admin — all via `WmiQuestionView`.
2. **Figure:** the custom illustration **replaces** the OCR scan wherever a custom
   component exists (the scan stays on disk as source of truth).
3. **Animation:** counts **by rows** — row 1 (22), row 2 (running 44), row 3 (48),
   then `22 + 22 + 4 = 48`.

## Components

### 1. Stable question `code`

Every question DTO gains a stable `code` of the form `paperCode(paper) + '-Q' +
number` → `WMI-19F1-Q1`. This is the registry key, reachable identically on member
and admin sides.

- New server util `api/services/wmi/paperCode.ts`: `paperCode({year, round, grade})`
  (→ `WMI-19F1`) and `questionCode(paper, number)` (→ `WMI-19F1-Q1`). Mirrors the
  frontend `src/lib/wmiPaperCode.ts` format (both unit-tested against the same
  examples to prevent drift).
- Populate `code` in the question reads, joining `wmi_papers` for `year/round/grade`:
  - `api/services/wmi/papers.ts` → `listWmiQuestionsForPaper` (used by exam detail) and
    `getWmiDrillQuestion` (already joins the paper; add `year`, `round`).
  - `api/services/wmi/paperReviews.ts` → `listAdminPaperQuestions`.
  Each maps `code = questionCode({year, round, grade}, number)`; the joined paper
  columns are used only to compute `code`, not returned as separate fields.
- Types: add `code?: string` to `WmiQuestion` (`src/types/wmi.ts`) and to
  `AdminPaperQuestion` (`api/services/wmi/paperReviews.ts` + `src/lib/wmiAdminApi.ts`).
  Optional so synthetic concept questions (which set no code) are unaffected.

### 2. Per-question visual registry

`src/components/wmi/paperQuestions/registry.ts`:

```ts
type QuestionVisual = {
  Illustration?: ComponentType<{ params?: unknown }>
  Explainer?: ComponentType<ExplainerProps>
}
const VISUALS: Record<string, QuestionVisual> = { 'WMI-19F1-Q1': { Illustration: CandyRowsIllustration, Explainer: CandyCountExplainer } }
export function getQuestionIllustration(code?: string): ... // null when absent
export function getQuestionExplainer(code?: string): ...
```

### 3. `WmiQuestionView` integration (single point)

- Replace the figure block: `const Illu = getQuestionIllustration(question.code)` →
  render `<Illu />` instead of `<WmiFigure src={question.figure_url} />` when present;
  otherwise unchanged.
- In the `revealed` area: `const Exp = getQuestionExplainer(question.code)` → when
  `revealed && Exp`, render the animation in the `WmiExplainer` carousel host. The
  candy explainer is self-contained (knows 22/22/4/48), so it ignores `params` and
  doesn't need the answer.
- **`WmiExplainer` generalization:** it currently takes a `slug` and looks up
  `getExplainer(slug)`. Add an optional `explainer?: ComponentType<ExplainerProps>`
  prop; when provided, render it directly (skipping the slug lookup) — the carousel
  play/pause/dots/beat-control logic is unchanged and shared. `slug` becomes optional
  when `explainer` is given. WmiQuestionView passes the candy explainer via this prop.
- No `code` (concepts/synthetic, or any non-registered question) → existing behavior
  exactly. No other call sites change.

### 4. Candy components (`src/components/wmi/paperQuestions/`)

- `CandyRowsIllustration.tsx` — clean SVG: three rows of wrapped-candy icons (22, 22,
  4 = 48), sized to the question area; decorative (`aria-hidden`) with an
  `aria-label` on the wrapper ("48 candies in rows of 22, 22, and 4").
- `candyCountSteps.ts` (+ `.test.ts`) — storyboard builder (bilingual, `Lang`):
  beats = show rows → count row 1 (22) → row 2 (running 44) → row 3 (48) → result
  `22 + 22 + 4 = 48`. Test asserts the running totals and final 48.
- `CandyCountExplainer.tsx` — framer-motion + `useBeatControl` over the storyboard;
  highlights the active row and shows the running total / final equation. Implements
  `ExplainerProps` (ignoring `params`).

## Data flow

```
wmi_questions (+ joined wmi_papers fields) → service maps code=questionCode(...)
   → question DTO { ..., code }  → WmiQuestionView
        ├─ getQuestionIllustration(code) → CandyRowsIllustration (replaces figure)
        └─ revealed: getQuestionExplainer(code) → WmiExplainer(CandyCountExplainer)
```

## Testing

- `api/services/wmi/paperCode.test.ts` — `paperCode`/`questionCode` format, asserting
  `WMI-19F1` / `WMI-19F1-Q1`, and that it matches the frontend util's examples.
- `candyCountSteps.test.ts` — row counts, running totals (22, 44, 48), final equation.
- Registry lookup returns the candy components for `WMI-19F1-Q1` and `null` otherwise.
- `npm run check` / `npm run lint`; an SSR smoke rendering `CandyCountExplainer` at
  every beat (en/id) and `CandyRowsIllustration`.
- Manual: open the WMI-19F1 paper in the member exam and the admin Drill page — the
  candy illustration replaces the scan; after answering, the counting animation plays.
- Regression: a normal concept explainer still renders via `WmiExplainer` by `slug`
  (the new `explainer` prop is additive/optional).

## Scope / out of scope

- **In:** the mechanism (code + registry + WmiQuestionView hook) and the single
  candy question's illustration + animation.
- **Out:** illustrations/animations for other questions (registry is ready for them);
  any change to how `figure_url` is stored; editing question content.
