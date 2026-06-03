# WMI Konsep Explainer & Question Breakdown — Design

**Date:** 2026-05-28
**Branch:** feat/wmi-concept-generator (off feat/wmi-practice-area)
**Status:** Approved

## Goal

Add three learner-facing enhancements to the WMI concept drill page
(`/latihan/wmi/konsep`):

1. **Inline explainer** — after a kid submits an answer, an animated explanation
   expands open *below the question* with no navigation or reload.
2. **Animated explainer canvas** — the explanation is a per-concept-type animated
   HTML `<canvas>` ("explainer"), parameterized by the question's data.
3. **Question breakdown** — a dedicated button breaks a long question into
   phrases on separate lines and emphasizes important words with both color and
   font size.

All three are **frontend-only**. No backend, database, or API changes.

## Why frontend-only is sufficient

The explainer animates the *explanation* of an answer, so it only appears after
submit. At that point the client already holds everything it needs:

- `params` — from `WmiConceptQuestion` (the generated question's data).
- `correct_answer` — from `WmiAttemptResult` (returned by `POST /me/wmi/attempts`).

The question payload deliberately omits the answer (anti-cheat); the explainer
sidesteps this because it mounts only after the result arrives. Breakdown
operates purely on text already on the client. Therefore: no schema migration,
no new endpoint, no service changes.

## Architecture

Two independent subsystems, layered onto the existing `WmiKonsepDrill` page.
Each mirrors a pattern already in the codebase, so the boundaries are proven.

### Subsystem A — Inline Explainer (revisions #1 + #2)

**Registry pattern**, mirroring `src/components/wmi/concepts/registry.ts`
(the illustration registry):

- `src/components/wmi/concepts/explainers/registry.ts` exports
  `getExplainer(slug): ComponentType<ExplainerProps> | null`. Returns `null` when
  a concept-type has no explainer authored yet.
- Each explainer is a React component with this contract:

  ```ts
  interface ExplainerProps {
    params: unknown          // the question instance's params
    correctAnswer: string    // from WmiAttemptResult.correct_answer
  }
  ```

  It owns a `<canvas>` ref and runs a `requestAnimationFrame` draw loop, started
  in a `useEffect` on mount and cancelled in the cleanup (so navigating to the
  next question tears the loop down cleanly).

**Inline reveal** (revision #1): `WmiExplainer` is a wrapper component placed in
`WmiKonsepDrill` below the question. It mounts only when `feedback` is set
(i.e. after submit). The container animates open via a CSS `max-height` + opacity
transition so the explanation slides in rather than popping. If
`getExplainer(slug)` returns `null`, the wrapper renders nothing — the existing
`WmiFeedbackPanel` remains the fallback.

**Starter explainers** (2, to prove the pattern):

- `CountObjectsExplainer.tsx` (slug `count-objects`) — objects animate in
  one-by-one on the canvas while a running tally increments to the answer.
- `ShapePerimeterSquareExplainer.tsx` (slug `shape-perimeter-square`) — each
  side highlights in sequence while a running sum builds to the perimeter.

Other concept-types fall back gracefully (no explainer) until authored later.

### Subsystem B — Question Breakdown (revision #3)

**Pure annotation utility + presentation + toggle.** The "what's important"
information comes entirely from a **heuristic** — zero per-concept authoring.

- `src/lib/wmiBreakdown.ts` — pure function:

  ```ts
  type TokenCategory = 'number' | 'question-word' | 'glossary' | 'plain'

  interface BreakdownToken {
    text: string
    category: TokenCategory
    slug?: string            // present when category === 'glossary'
  }

  interface BreakdownClause {
    tokens: BreakdownToken[]
  }

  function breakdownQuestion(text: string, lang: 'en' | 'id'): BreakdownClause[]
  ```

  Two responsibilities, both heuristic:

  1. **Clause split** — break the sentence at natural boundaries: sentence
     terminators (`. ? !`), commas, and the question pivot
     (`how many` / `which` for `en`; `berapa` / `yang mana` for `id`). Each clause
     renders on its own line.
  2. **Token classify** — tag each word:
     - `number` — digits or number-words (`one..twenty` for en;
       `satu..sepuluh` etc. for id).
     - `question-word` — `how many`, `which`, `what` (en);
       `berapa`, `yang mana`, `apa` (id).
     - `glossary` — spans matched by the existing `[[slug|text]]` markup
       (reuse `parseWmiMarkup` from `src/lib/wmiMarkup.ts` so glossary terms keep
       their slug and lookup affordance).
     - `plain` — everything else.

  The function does no rendering and is fully unit-testable.

- `src/components/wmi/WmiBreakdownView.tsx` — renders the clause array: one clause
  per line; each token styled by category. Emphasis is **both color and font
  size** — `number` and `question-word` tokens get a larger font and a distinct
  color; `glossary` tokens keep their existing lookup styling; `plain` stays
  default. Color/size mapping lives in a small lookup in this component.

- `src/components/wmi/WmiBreakdownToggle.tsx` — a dedicated button
  ("Pecah soal") near the question. Toggles the question display between normal
  and broken-down. Available before *and* after submit (a kid can break the
  question down before answering).

**Language-aware**: breakdown applies to *whichever language is currently shown*.
`WmiQuestionView` already tracks whether the Indonesian translation is revealed;
the toggle passes the active language (`en` or `id`) into `breakdownQuestion`.

## Data flow

```
GET /me/wmi/konsep/next ──► WmiConceptQuestion { params, body_en, body_id, ... }
                                   │
        ┌──────────────────────────┴───────────────────────────┐
        ▼                                                        ▼
  WmiQuestionView ──(toggle)──► breakdownQuestion(body, lang)    │
        │                              ▼                         │
        │                       WmiBreakdownView (color+size)    │
        ▼                                                        │
  submit(answer) ──► POST /me/wmi/attempts ──► WmiAttemptResult  │
                                   │  { correct_answer, ... }    │
                                   ▼                             │
                          feedback state set ◄──────────────────┘
                                   │
                                   ▼
   WmiExplainer (mounts inline, animates open)
        │  getExplainer(slug)
        ▼
   <ConceptExplainer params correctAnswer />  ──► <canvas> rAF loop
```

## File structure

**New files:**

- `src/components/wmi/concepts/explainers/registry.ts` — `getExplainer(slug)`.
- `src/components/wmi/concepts/explainers/CountObjectsExplainer.tsx`
- `src/components/wmi/concepts/explainers/ShapePerimeterSquareExplainer.tsx`
- `src/components/wmi/WmiExplainer.tsx` — wrapper; looks up explainer, animates
  open inline below the question.
- `src/lib/wmiBreakdown.ts` — pure `breakdownQuestion(text, lang)`.
- `src/lib/wmiBreakdown.test.ts` — vitest unit tests.
- `src/components/wmi/WmiBreakdownView.tsx` — renders clauses, color+size emphasis.
- `src/components/wmi/WmiBreakdownToggle.tsx` — the "Pecah soal" button.

**Modified files (light):**

- `src/pages/WmiKonsepDrill.tsx` — mount `WmiExplainer` after submit; hold
  breakdown toggle state and pass it down.
- `src/components/wmi/WmiQuestionView.tsx` — accept a breakdown view-mode prop;
  render `WmiBreakdownView` (instead of the normal body) when toggled, for the
  active language.

**Unchanged:** all of `api/`, `db/`, the illustration registry, gamification,
exam/drill flows.

## Error handling & edge cases

- **No explainer for a slug** — `getExplainer` returns `null`; `WmiExplainer`
  renders nothing. The existing `WmiFeedbackPanel` is unaffected.
- **Canvas loop cleanup** — `requestAnimationFrame` handle cancelled on unmount;
  loading the next question unmounts the explainer.
- **Breakdown of a short question** — heuristic still works; a one-clause result
  just renders a single line. No special-casing.
- **Glossary spans inside a clause** — `parseWmiMarkup` runs first so
  `[[slug|text]]` tokens are preserved as `glossary` category with their slug
  intact; the clause splitter operates on the parsed segments, not raw text.
- **Unknown number-words / mixed language** — anything unmatched falls to
  `plain`; the feature degrades to "no emphasis" rather than breaking.

## Testing

- **`wmiBreakdown.ts`** is the primary test target (pure logic, where bugs hide):
  clause splitting at each boundary type, number detection (digits + words, both
  languages), question-word detection (both languages), glossary-span
  preservation, short-question and empty-input edge cases. Real vitest unit
  coverage in `wmiBreakdown.test.ts`.
- **Explainers & view components** — canvas animation and visual styling are not
  meaningfully unit-tested. Verified by **manual browser smoke test** on
  `/latihan/wmi/konsep` (submit a `count-objects` question → explainer animates;
  toggle breakdown → phrases split with color+size emphasis; reveal Indonesian →
  breakdown follows the language). This is called out as a manual step, not
  claimed as automated coverage.
- **Gate:** `npm run check` (typecheck) + `npm run lint` clean.

## Out of scope (YAGNI)

- No backend, DB, or API changes.
- No per-instance explainers (per concept-type only).
- No author-supplied breakdown annotations (heuristic only).
- Gamification untouched (gamification-neutral, consistent with v2).
- No explainers beyond the 2 starters; others fall back gracefully.

## Constraints honored

- Frontend `.tsx` only; no `.js`-suffix import changes needed (those are an
  `api/` convention).
- No commits pushed during implementation; user runs `/ship` at the end.
- Vitest available (master added it post-v1).
