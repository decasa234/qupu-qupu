# WMI Problem-Authoring Agents + Workflow — Design

**Date:** 2026-06-08
**Status:** Approved (pending spec review)

## Goal

Formalize the recurring "adapt a WMI past-paper question into the app's rich
format" task into a reusable, four-role content-production pipeline: a
**question-designer** that produces an authored structured breakdown, feeding
three downstream builders — **illustrator**, **step-explainer**, **animator**.
Package the roles as both reusable subagent definitions (`.claude/agents/`) and a
Workflow script that chains them. The designer's breakdown is **both** rendered
to learners (a richer "Q" panel, replacing today's heuristic parser) and the
shared brief the three builders bind to, so the figure, steps, and animation can
never disagree.

## Context — what already exists

The per-question custom-visual mechanism is in place; the four roles map onto
real slots:

- **Illustrator slot** — `src/components/wmi/paperQuestions/registry.ts` maps a
  stable question `code` (e.g. `WMI-19F1A-Q1`) → `{ Illustration, Explainer }`.
  The `Illustration` is a hand-built SVG (bordered `role="img"` div + aria-label)
  that replaces the OCR scan. 18 built so far (14 G1 + 4 G2).
- **Animator slot** — the registry `Explainer`: a framer-motion + `useBeatControl`
  storyboard (`build*Steps(...args, lang)` → `{steps, finalIndex}`) + a component
  using `ExplainerProps`. Plays after the answer is revealed.
- **Step-explainer slot** — `hint_steps_en/id` JSONB on `wmi_questions`
  (migration 0032), rendered by `WmiSteps` after answering.
- **Question-designer slot** — *partly* exists as the "Q" breakdown
  (`WmiBreakdownView` + `WmiBreakdownToggle`), but it is **auto-derived** by a
  heuristic parser `segmentSections(text, lang)` (`src/lib/wmiBreakdown.ts`) that
  guesses section labels (start / mystery / add / clue / find / extra…) from cue
  words. Shallow, not authored. This design replaces that guesswork with an
  authored decomposition while keeping the parser as a fallback.

The stable `code` is `paperCode(paper) + '-Q' + number`; `paperCode` =
`WMI-[YY][F|P][grade][A|B]` (e.g. `WMI-19F1A`). `WmiQuestionView.tsx` is the
single render point used by member drill/exam/exam-review and admin Drill.

## The artifact — one authored `breakdown` per question

Stored as a single `breakdown` JSONB column on `wmi_questions` (mirrors the
`hint_steps` rollout). One object: bilingual sub-fields where it is prose,
language-neutral where it is data.

```jsonc
{
  // ── Learner-facing (shown in the "Q" panel), bilingual ──
  "facts_en":      ["3 rows of stars", "each row has 22 (last has 4)"],
  "facts_id":      ["3 baris bintang", "tiap baris isi 22 (baris akhir 4)"],
  "conditions_en": ["count every row, then add them up"],
  "conditions_id": ["hitung tiap baris, lalu jumlahkan"],
  "question_en":   "How many stars in all?",
  "question_id":   "Ada berapa bintang semuanya?",
  "extra_en":      null,            // only when the question has a real distractor
  "extra_id":      null,

  // ── Machine brief (drives the 3 downstream agents; mostly not shown) ──
  "needsVisual": true,              // routing flag set by the designer
  "quantities":  [ {"label":"rows","value":[22,22,4]}, {"label":"total","value":48} ],
  "strategy":    { "conceptSlug":"skip-count-or-add",
                   "name_en":"Add the rows", "name_id":"Jumlahkan baris" },
  "trap":        { "wrong":"44",
                   "why_en":"forgetting the short last row of 4",
                   "why_id":"lupa baris terakhir berisi 4" },
  "answer":      { "form":"number", "unit":null, "value":"48",
                   "distractors":[ {"choice":"44","why_en":"...","why_id":"..."} ] },
  "vocab":       ["row", "sum"]     // optional glossary chips
}
```

Field rules:

- `extra_en/id` are `null` unless the question genuinely contains a distractor.
- `needsVisual` is the workflow router: `true` for counting/spatial questions,
  `false` for pure number/word questions (which then get designer +
  step-explainer only).
- `quantities` is the **anti-drift glue**: illustrator, step-explainer, and
  animator all bind to the same numbers.
- `strategy.conceptSlug` is a soft link to the WMI Concept taxonomy
  (`docs/wmi-concepts/`); it is a hint, not a foreign key, and may be a
  descriptive slug when no concept matches.
- `answer.distractors` is populated only for multiple-choice questions.
- `vocab` is optional; entries are glossary slugs the UI can render as chips
  (`WmiGlossaryTerm` already exists).

## The four agents (`.claude/agents/*.md`)

Each definition bakes in exactly the codebase conventions its role needs, so a
fresh dispatch produces house-style output without re-deriving it.

| Agent | Reads | Produces | Baked-in conventions |
|---|---|---|---|
| **question-designer** (first) | raw past-paper question body + answer + figure scan (`db/seed/wmi/figures/*.jpg`) | the whole `breakdown` object + a clean reworded `body_en/id` stem | the breakdown schema above; bilingual seed-JSON shape; the `needsVisual` heuristic; grade-1–3 register |
| **illustrator** | `facts` + `conditions` + `quantities` + the figure scan | `<Thing>Illustration.tsx` (default export, SVG in bordered `role="img"` div + aria-label) **and a shared visual primitive** (co-exported positions/shape helpers) | the `starVisual.tsx`/`<Thing>Illustration.tsx` file pattern; SVG-only, Font Awesome (no emoji); the accepted `react-refresh/only-export-components` warning |
| **step-explainer** | `quantities` + `strategy` + `answer` | `hint_steps_en/id` (3–5 grade-appropriate steps that walk to the answer) | the `hint_steps` JSONB array shape; arithmetic must reconcile with `quantities`/`answer` |
| **animator** | `quantities` + `strategy` + the illustrator's **shared primitive** | `<thing>Steps.ts` (`build*Steps(...args, lang)` → `{steps, finalIndex}`) + `<Thing>Explainer.tsx` (`ExplainerProps`, `useMemo` + `useBeatControl`) | the explainer framework; imports the illustrator's primitive so figure and animation are visually identical |

The illustrator builds the **shared primitive** so the animator can import it —
this is exactly today's `starVisual.tsx` pattern (exports `starPositions` + `Star`,
consumed by both `StarRowsIllustration` and `StarCountExplainer`), and it keeps
the figure and its animation pixel-consistent.

## Orchestration — the Workflow pipeline

```
Stage 1 · Design   question-designer(raw question + figure scan)
                   → breakdown object + reworded stem + needsVisual
                                      │
        ┌──────────────────────── needsVisual? ────────────────────────┐
        │ yes                                                           │ no
Stage 2 · Build (parallel)                                      (skip visuals)
   ├ illustrator(brief)     → <Thing>Illustration.tsx + primitive
   └ step-explainer(brief)  → hint_steps_en/id                  step-explainer only
Stage 3 · Animate
   └ animator(brief + primitive) → <thing>Steps.ts + <Thing>Explainer.tsx
```

The designer's `needsVisual` flag self-routes the pipeline. For a batch, the
workflow runs this per question (a `pipeline()` over the question list), with the
designer stage gating the build stages.

### Who writes what (no parallel file conflicts)

- **New files** (each unique → no collision): the **illustrator** and **animator**
  write their own `.tsx`/`.ts` files directly (they have file tools) and return
  the component name + import path.
- **Shared files** (`registry.ts`, the one seed JSON): `question-designer` and
  `step-explainer` **return structured data only**. After the workflow returns,
  the **controller** (the main session) serially applies the shared-file edits —
  add the `registry.ts` entry, merge `breakdown` + `hint_steps` + reworded stem
  into the paper's seed JSON — then reseeds. Serializing shared-file edits in the
  controller avoids the parallel-write conflict that worktree isolation would
  otherwise be needed for.

## Persistence + rendering (mirrors the `hint_steps` rollout)

- **Migration** `db/migrations/00NN_wmi_question_breakdown.sql` (+ `db/schema.sql`):
  `ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS breakdown JSONB;` (nullable).
- **Loader** `db/seed/wmi/load.ts`: `PaperQuestion` gains `breakdown?: object`; the
  `wmi_questions` insert writes `JSON.stringify(breakdown) ?? null`.
- **DTOs**: `WmiQuestionDto` (`papers.ts`) and `AdminPaperQuestion`
  (`paperReviews.ts`) gain `breakdown: Breakdown | null`; all four SELECTs that
  build question rows (the two in `papers.ts`, the drill fallback, and
  `paperReviews.ts`) select `q.breakdown`.
- **Frontend types**: `WmiQuestion` (`src/types/wmi.ts`) and `AdminPaperQuestion`
  (`src/lib/wmiAdminApi.ts`) gain `breakdown?: Breakdown | null`. A shared
  `Breakdown` type is declared once (e.g. `src/types/wmi.ts`) and imported by both.
- **`WmiBreakdownView` v2**: when `question.breakdown` is present, render the
  authored **Facts / Conditions / Question / Extra** sections, reusing the existing
  section tab/tint/icon styling (`SECTION_STYLE`/`SECTION_ICON`/`SECTION_WORD`).
  When it is absent, fall back to today's heuristic `segmentSections(text, lang)`
  — concepts and un-authored questions are unchanged. `WmiQuestionView` already
  self-manages the "Q" toggle.
- **Trap note**: in `WmiQuestionView`, when `revealed` and `breakdown.trap` is
  present, render a small "Watch out" / "Hati-hati" note next to `WmiSteps`
  (new lightweight component, qupu-* tokens, Font Awesome warning icon).

## Verification

- **Per-question gates** (controller, after each question/batch): `npm run check`
  (`tsc --noEmit`), `npm run lint`, SSR smoke (the new `Illustration` + `Explainer`
  render to `<svg>` in en+id), reseed smoke (the question's `breakdown` is present
  and well-formed), plus **the user's visual review per batch** at
  `/admin/wmi-drill`.
- **Unit tests**: `WmiBreakdownView` renders authored sections when `breakdown`
  present and falls back to the parser when absent; the loader round-trips
  `breakdown`; agent-produced storyboards keep their existing `build*Steps` tests.
- DB-backed tests stay gated by `TEST_DATABASE_URL` (`describe.skipIf(!RUN)`).

## Scope / out of scope

- **In:** the 4 agent definitions; the Workflow script chaining them; the
  `breakdown` column + loader/DTO/types; `WmiBreakdownView` v2 + the trap note;
  proving the pipeline end-to-end on **one fresh batch** (a not-yet-done paper,
  e.g. completing WMI-19F2/G2) so the authored "Q" breakdown is exercised live.
- **Out (deferred):** backfilling authored `breakdown` onto the 18 already-built
  G1/G2 visual questions (they still get the heuristic breakdown today);
  auto-running the workflow across all papers unattended; changing the member
  exam answer-reveal timing or the concept-side breakdown.

## Data flow

```
raw question + figure scan
   → question-designer → breakdown{...} + reworded stem + needsVisual
        ├─ illustrator   → <Thing>Illustration.tsx + primitive   (writes files)
        ├─ step-explainer → hint_steps_en/id                       (returns data)
        └─ animator      → <thing>Steps.ts + <Thing>Explainer.tsx (writes files, imports primitive)
   → controller wires: registry.ts entry + seed JSON merge (breakdown + hint_steps + stem) + reseed
   → wmi_questions(breakdown, hint_steps) → DTOs → WmiQuestion
        → WmiQuestionView
             ├─ "Q" toggle → WmiBreakdownView v2 (authored sections, parser fallback)  [anytime]
             ├─ figure → registry Illustration                                          [if registered]
             └─ revealed: WmiSteps(hint_steps) + trap note + registry Explainer animation
```
