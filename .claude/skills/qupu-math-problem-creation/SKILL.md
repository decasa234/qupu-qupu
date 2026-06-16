---
name: qupu-math-problem-creation
description: Use when authoring or upgrading a QUPU WMI math problem or concept — building or improving its color-coded clickable breakdown, in-card illustration, step-by-step hints, post-answer animation, or trap note. Triggers on requests like "adapt this question", "add an illustration/animation/breakdown for concept X", "make a WMI problem", or working in api/services/wmi/concepts or src/components/wmi. To convert a whole past-paper end-to-end (import + enrich a full paper), use wmi-paper-conversion.
---

# QUPU Math Problem Creation

## Overview

A QUPU math problem is authored by **four roles that all bind to the same `params`** (the anti-drift glue — figure, steps, animation, and breakdown can never disagree):

1. **question-designer** → the authored `breakdown` (color-coded clickable highlights over the real problem text + a machine brief) and a clean, short stem.
2. **illustrator** → an SVG figure that sits *inside the problem card*.
3. **step-explainer** → short `hint_steps` (3 lines).
4. **animator** → the post-answer animation (storyboard + explainer component).

Run the designer first; it sets `needsVisual` and the brief the others read. Skip illustrator/animator for pure number/word problems (`needsVisual: false`).

## Orchestration — dispatch the roles to global agents

Each role is persisted as a global subagent (in `~/.claude/agents/`). Dispatch them with the Agent tool — they launch fresh with no conversation context, so **put the brief in the prompt**: the concept `slug` or paper `code`, the `params` shape + a concrete sample, the target file paths, and (for roles 2–4) the question-designer's returned brief (`quantities` / `strategy` / `answer` / `needsVisual`).

| Role | `subagent_type` | Returns / writes |
|---|---|---|
| 1. question-designer | `qupu-question-designer` | returns the `breakdown` (code or seed JSON) + clean stem + brief |
| 2. illustrator | `qupu-illustrator` | writes its own `index.tsx` / `*Illustration.tsx`; reports registry line |
| 3. step-explainer | `qupu-step-explainer` | returns `hint_steps_en` / `hint_steps_id` |
| 4. animator | `qupu-animator` | writes its own `*Steps.ts` + `*Explainer.tsx`; reports registry line |

**Sequencing:**
1. Run **`qupu-question-designer` alone first** and read its `needsVisual` + brief.
2. Then dispatch the rest **in one parallel batch** (one message, multiple Agent calls): `qupu-step-explainer` always; `qupu-illustrator` + `qupu-animator` only if `needsVisual` (they write *separate new files*, so they never conflict).
3. **The controller does all shared-file wiring serially** after the agents return — write `breakdown.ts` + wire `render()` (or drop `breakdown`/`hint_steps` into seed JSON), and add the registry lines the illustrator/animator reported (`concepts/registry.ts`, `concepts/explainers/registry.ts`, or `PastPapers/WMI/registry.ts`). This is why roles 1 & 3 return data instead of editing.
4. Run the Verification suite below.

(You can still perform any role inline yourself instead of dispatching — the agents just package each role's rules so they run in parallel cleanly.)

## The canonical example — copy it

**W7 = `budget-selection`** is the reference implementation. Read these and mirror the structure for any new problem:

| Piece | File |
|---|---|
| Concept logic + `render()` returns `breakdown` | `api/services/wmi/concepts/budget-selection/index.ts` |
| Designer output `buildBudgetBreakdown(params)` | `api/services/wmi/concepts/budget-selection/breakdown.ts` |
| `Breakdown` type (backend) + mirror | `api/services/wmi/concepts/types.ts` ↔ `src/types/wmi.ts` |
| Sample threading (`breakdown` field) | `api/services/wmi/concepts/preview.ts` |
| Illustration (in-card, no box bg) | `src/components/wmi/concepts/budget-selection/index.tsx` → registered in `src/components/wmi/concepts/registry.ts` |
| Animation (storyboard + explainer) | `src/components/wmi/concepts/explainers/budgetSteps.ts` + `BudgetSelectionExplainer.tsx` → registered in `concepts/explainers/registry.ts` |
| Breakdown + trap renderers (shared, already built — DO NOT rebuild) | `src/components/wmi/WmiAuthoredBreakdown.tsx`, `WmiTrapNote.tsx`, wired in `WmiQuestionView.tsx` |
| Admin review surface | `src/pages/admin/AdminWmiConcepts.tsx` |

## The `breakdown` data model

```ts
type BreakdownCategory = 'fact' | 'condition' | 'question'   // extensible; renderer colours by category
interface BreakdownHighlight {
  category: BreakdownCategory
  phrase_en: string; phrase_id: string   // MUST be exact substrings of the DISPLAY body (see below)
  note_en: string;   note_id: string     // short kid note shown on click
}
interface Breakdown {
  needsVisual: boolean
  highlights: BreakdownHighlight[]                 // learner-facing: clickable color-coded spans over the text
  quantities: { label_en; label_id; value: string }[]   // machine brief — the numbers every role binds to
  strategy:  { conceptSlug?; name_en; name_id }
  trap: { wrong: string; why_en; why_id } | null   // ONLY when a genuine tempting wrong answer exists
  answer: { form: 'number'|'choice'|'unit'; unit: string|null; value: string }
  vocab?: string[]
}
```

Build it **parametrically** from `params` (like `hint_steps`), never hardcoded to one instance.

**Display body:** highlight phrases must match the text the kid *sees*, which is the body after `stripSectionLabels` AND resolving glossary `[[slug|label]]` → `label` (and `[[slug]]` → `slug`). So highlight `keliling`, not `[[perimeter|keliling]]`. Verify with: `parseWmiMarkup(stripSectionLabels(body)).map(s=>s.text).join('')`.

**Multiple-choice concepts:** `render().answer` is the choice **label** (e.g. `"A"`), not the number. Use `answer.form: 'choice'`, `answer.value = <label>`, so `answer.value === sample.answer`.

## Content rules (hard-won — follow them)

- **Kid-first & short.** Grade 2–3 voice. `hint_steps` = ~3 short lines that name the trap and land on the answer. Notes are one sentence.
- **Deduce, don't assert.** The breakdown, `hint_steps`, and explainer beats must form a logical chain: every value follows from facts already established (givens, eliminations, column arithmetic). Never present the right answer without showing where it came from — "balancing the digits gives 1589" is not an explanation. If the honest method is try-and-eliminate, show the failed candidates and why each fails.
- **Breakdown = the real problem text, not a restatement.** Highlight the words kids must focus on, color-coded by category: `fact` = blue, `condition` = yellow, `question` = purple. No tabs, no underline. The renderer fades the text in, then lights highlights one-by-one; clicking a span shows its note.
- **Trap is optional.** Most problems have none — set `trap: null`. Only add one for a real misconception (e.g. "grab the two priciest" busting a budget).
- **Illustration sits in the card**, no bordered/orange box — `className="my-4 flex justify-center"`, SVG only, qupu-* tokens, no emoji. Wrap in a `role="img"` div with an `aria-label`.
- **Determinism / SSR-safe:** components must be pure renders of `params` — no `Math.random`, no `Date`.
- **Conventions:** `api/` imports use the `.js` suffix even for `.ts`. Match house file patterns (`*Steps.ts` storyboard + `*Explainer.tsx` using `useBeatControl` + `ExplainerProps`).

## Wiring checklist

**Concept (runtime-generated, no DB):** `render(params)` returns `breakdown` → it flows through `preview.ts` → shows on the Q toggle automatically. Register the illustration in `concepts/registry.ts` and the explainer in `concepts/explainers/registry.ts`.

**Paper question (`PastPapers/WMI/`):** key everything by the stable `code` (`WMI-19F1A-Q1`). Register `{ Illustration, Explainer }` in `src/components/wmi/PastPapers/WMI/registry.ts`; author `breakdown` + `hint_steps` in the paper's seed JSON, then reseed. Same `Breakdown` shape.

**Parallel-safe split:** illustrator/animator write their *own new component files*; designer/step-explainer return data and the controller serially edits shared files (`registry.ts`, seed JSON) — avoids merge conflicts.

## Verification (run before claiming done)

```bash
npm run check          # tsc --noEmit
npm run lint           # 0 errors (react-refresh co-export warnings are OK)
npm run test
```
Plus smokes (use a temp `.ts`/`.tsx` + `npx tsx`, not inline `-e`):
- **Backend:** `sampleConcept('<slug>', 1, seed).breakdown` — every highlight `phrase_*` is a substring of the body; `answer.value === sample.answer`.
- **Frontend SSR:** the illustration + `WmiAuthoredBreakdown` + explainer render to `<svg>`/markup in `en` and `id`.
- DB ops need `dangerouslyDisableSandbox: true` (LAN Postgres).

Then have the user review at **Admin → WMI Concepts → \<concept\>** (or **WMI Drill** for papers).

## Review issue loop

The admin flags granular, per-part problems in **Admin → WMI Concepts / Drill / Review Queue** (stored in `wmi_review_issues`). To fix a batch:

1. Read open, AI-actionable issues: `GET /api/admin/wmi/issues?status=open&ai_actionable=true&concept_slug=<slug>` (concepts) or `&paper_id=<uuid>` (papers). Or paste the admin's **"Copy issues for Claude"** markdown block.
2. Resolve the source from the target + `part`: concept `slug` → `getIllustration` / `getExplainer` / generator registries; paper `question_id` → the `wmi_questions` row. Simple paper text (stem/answer/hint) the admin can quick-fix in-app; structured `breakdown` / `hint_steps` / `visual` come to you.
3. `PATCH /api/admin/wmi/issues/<id>` to `status: "in_progress"`, apply the fix, then `PATCH` to `status: "fixed"` with a short `fix_note`.
4. The admin re-reviews and marks it `verified`.

## Common mistakes

- Highlight phrase isn't an exact substring of the **display** body (forgot to resolve `[[glossary]]` markup, or matched a section label) → it silently won't highlight. Test across seeds against the display text.
- Forcing a trap on every problem → only add real ones.
- Rebuilding `WmiAuthoredBreakdown`/`WmiTrapNote`/`WmiQuestionView` → they're done; just feed them a `breakdown`.
- Illustration with a background box or emoji → clean SVG in the card.
- Restating the problem as abstract "Facts/Rules" cards → highlight the actual text instead.
