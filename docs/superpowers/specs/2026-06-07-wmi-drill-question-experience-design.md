# WMI Drill Question Experience (Concept-parity) — Design

**Date:** 2026-06-07
**Status:** Approved (pending spec review)

## Goal

Make a WMI Drill (mock-exam) question match the WMI Concept review experience —
a toggleable **"Q" breakdown** and a post-answer **step-by-step** — and polish the
first illustrated question (WMI-19F1 Q1): switch the candy illustration to **stars**
(spaced + tilted) and reword the question to fit.

## Context

- WMI-19F1 Q1 already has a custom illustration + counting animation (the candy
  components in `src/components/wmi/paperQuestions/`, wired via the per-question
  registry into `WmiQuestionView`).
- WMI Concept review (`AdminWmiConcepts`) shows, per question: a **"Q" breakdown
  toggle** (`WmiBreakdownToggle` → `WmiBreakdownView`, controlled by the host) and a
  **step-by-step** list (the concept's `hint_steps_en/id`, rendered by a local
  `Steps` component). Paper questions today have `hint_en/hint_id` but **no
  `hint_steps`**, and no host wires the breakdown toggle for them.
- WMI Drill is a **mock exam**, not a secrecy-bound live competition: the breakdown
  may be toggled at any time; steps appear only after the answer is revealed.

## Decisions (locked with user)

1. **Object = stars** (clean shape; tilt/rotation reads well), wider spacing, slight
   per-item tilt. Still 22 / 22 / 4 = 48.
2. **Step-by-step via a real `hint_steps` field** on paper questions (mirrors
   concepts — "same as WMI Concept but real questions"), not derived from the
   animation.
3. **Surface: member + admin**, all through `WmiQuestionView`.
4. **"Q" breakdown:** toggleable anytime. **Steps:** only when `revealed`.

## Components

### 1. Stars illustration + animation (rename candy → star)

Rename and reshape the existing visual files (keep their structure):
- `candyVisual.tsx` → `starVisual.tsx`: a `Star` SVG primitive (5-point star) replacing
  `Candy`; increase the horizontal gap so items don't touch; give each item a small
  deterministic tilt (rotation by index, e.g. `(-12..12)°`). Keep `STAR_ROWS=[22,22,4]`,
  `STAR_TOTAL=48`, `starPositions()`, `VIEW_W/H`.
- `CandyRowsIllustration.tsx` → `StarRowsIllustration.tsx`; `CandyCountExplainer.tsx`
  → `StarCountExplainer.tsx`; `candyCountSteps.ts(+test)` → `starCountSteps.ts(+test)`
  (captions say "stars"/"bintang").
- `src/components/wmi/paperQuestions/registry.ts`: point `WMI-19F1-Q1` at the renamed
  star components.

### 2. Reword the question

`db/seed/wmi/papers/2019-final-g1.json` Q1: `body_en` → `"How many stars are there?"`,
`body_id` → `"Ada berapa banyak bintang?"`. (The illustration replaces the figure via
the registry; `figure_url` may stay as-is.) Add `hint_steps` (below). Reseed.

### 3. `hint_steps` on paper questions

- **Migration** `db/migrations/0032_wmi_question_hint_steps.sql` (+ `db/schema.sql`):
  `ALTER TABLE wmi_questions ADD COLUMN hint_steps_en JSONB, ADD COLUMN hint_steps_id JSONB;`
  (nullable arrays of strings, mirroring how `choices_*` are stored as JSONB).
- **Loader** `db/seed/wmi/load.ts`: `PaperQuestion` gains
  `hint_steps_en?: string[]; hint_steps_id?: string[]`; the `wmi_questions` insert
  writes them (`JSON.stringify(...) ?? null`).
- **Q1 content** (in the seed JSON):
  `hint_steps_en: ["The stars are in rows of 22, 22, and 4.", "22 + 22 = 44.", "44 + 4 = 48.", "So there are 48 stars."]` and the Indonesian equivalent.
- **DTOs:** `WmiQuestionDto` (papers.ts) and `AdminPaperQuestion` (paperReviews.ts)
  gain `hint_steps_en: string[] | null; hint_steps_id: string[] | null`; the member
  reads (`listWmiQuestionsForPaper`, `getWmiDrillQuestion`) and admin read
  (`listAdminPaperQuestions`) SELECT the two columns.
- **Frontend types:** `WmiQuestion` (`src/types/wmi.ts`) and `AdminPaperQuestion`
  (`src/lib/wmiAdminApi.ts`) gain `hint_steps_en?: string[] | null; hint_steps_id?: ...`.

### 4. Render: breakdown toggle + step-by-step in `WmiQuestionView`

One integration point so member + admin both get it:

- **"Q" breakdown — self-managed when uncontrolled.** Today the toggle shows only
  when the host passes `onToggleBreakdown` (the concept page does, controlled). Change
  `WmiQuestionView` so that when `onToggleBreakdown` is **not** provided it manages an
  internal `breakdownActive` state and **always renders the toggle**. The concept
  page's controlled usage is unchanged. Result: the "Q" toggle appears for paper
  questions everywhere (drill, exam, review, admin Drill) with no host edits, and is
  toggleable anytime.
- **Step-by-step — post-answer.** New `src/components/wmi/WmiSteps.tsx`: a numbered
  list styled like the concept `Steps`. In `WmiQuestionView`, when `revealed` and the
  question has `hint_steps_{lang}`, render `<WmiSteps steps={...} />` in the
  post-answer area (alongside the existing animation block). Hidden until revealed.

## Data flow

```
wmi_questions(+hint_steps) → DTOs(hint_steps_en/id) → WmiQuestion(.hint_steps_*)
   → WmiQuestionView
        ├─ "Q" toggle (self-managed) → WmiBreakdownView    [anytime]
        ├─ figure → StarRowsIllustration (registry)         [WMI-19F1-Q1]
        └─ revealed: WmiSteps(hint_steps) + StarCountExplainer animation
```

## Testing

- Migration apply + verify the two columns exist.
- Loader/DTO smoke: WMI-19F1 Q1 returns `body_en` "How many stars are there?" and a
  non-empty `hint_steps_en` of 4 items, with `code` `WMI-19F1-Q1`.
- `starCountSteps` storyboard test (running totals 22/44/48, captions say "stars").
- SSR smoke: `StarRowsIllustration` + `StarCountExplainer` render; `WmiSteps` renders a
  numbered list.
- `WmiQuestionView`: the "Q" toggle renders when uncontrolled; steps render only when
  `revealed` and `hint_steps` present.
- `npm run check` / `lint` / `test`.
- Manual: WMI-19F1 in admin Drill + member exam-review — stars (spaced/tilted), "Q"
  toggles the breakdown anytime, steps appear after answering.

## Scope / out of scope

- **In:** stars visual + reword + the `hint_steps` mechanism + the breakdown/steps
  render, for paper questions generally (Q1 authored).
- **Out:** authoring `hint_steps` for other questions (field is ready); breakdown
  during a hypothetical timed live exam (this is a mock exam); changing the
  member exam answer-reveal timing.
