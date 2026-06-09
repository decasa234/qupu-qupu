---
name: wmi-paper-conversion
description: Use when converting a WMI past-paper into web-ready questions — importing text/answers/figures from an OCR'd full.md, then authoring the breakdown, step-by-step, SVG illustration, and animated explainer for a whole paper. Triggers on "convert this WMI paper", "import WMI 20xx grade N", "make these past-paper questions web-ready", or working across db/seed/wmi/papers and src/components/wmi/paperQuestions. Golden reference: WMI-19F1A. For a single question or concept (not a whole paper), use qupu-math-problem-creation instead.
---

# WMI Paper Conversion

## Overview

Convert one WMI past-paper from an OCR'd markdown source into web-ready questions.
A guided, checkpointed pipeline: ingest → import → triage → enrich → wire → verify
→ review. Per-question craft is delegated to the **qupu-math-problem-creation**
skill; this skill is the paper-level orchestration around it.

**Golden reference = WMI-19F1A** — every phase points at the real files that prove
the pattern. Copy them; don't re-derive.

## What already exists (do NOT rebuild)

- **Data model + rendering:** `breakdown` JSONB + `hint_steps_en/id` on
  `wmi_questions`; `src/components/wmi/WmiQuestionView.tsx` renders the "Q"
  breakdown, steps, trap note, illustration, and post-answer explainer. No
  schema/render work is needed.
- **Import procedure + tooling:** `db/seed/wmi/README.md`,
  `api/services/wmi/paperImport/` (`answerKey.ts`, `figures.ts`, `validate.ts`,
  `types.ts`), `paperCode()` (`src/lib/wmiPaperCode.ts`), `db/seed/wmi/load.ts`.
- **Per-question craft:** the `qupu-math-problem-creation` skill.

## Inputs → outputs

- **Inputs:** a source set under `wmiPastPaper/` — `<… Paper A>/full.md` +
  `<… Paper B>/full.md` + `<… Answer Key>/full.md` + each folder's `images/`.
- **Outputs:** merged `db/seed/wmi/papers/<year>-<round>-g<grade>.json`; figures
  copied to `db/seed/wmi/figures/`; per-question `*Illustration.tsx` /
  `*Explainer.tsx` (+ `*Steps.ts`) in `src/components/wmi/paperQuestions/`
  registered in `registry.ts`; a reseeded DB.

## Pipeline

Create one task/todo per phase. Work in batches; stop for the user's visual review
after each batch (Phase 6).

### Phase 0 · Preflight
- Verify gstack: `test -d ~/.claude/skills/gstack/bin && echo OK`.
- Locate the three source folders (Paper A, Paper B, Answer Key) under
  `wmiPastPaper/`.
- Compute the **paper code** with `paperCode({year, round, grade, variant:'A'})`
  → e.g. `WMI-19F1A`. Each question's **registry key** is that plus `-Q<number>`
  (e.g. `WMI-19F1A-Q18`). The seed filename is `<year>-<round>-g<grade>.json` —
  match the existing files in `db/seed/wmi/papers/` (e.g. `2019-final-g1.json`).
- Confirm grade is **G1–G3**. **G0 is deferred** — its ①②③ 3-option format needs
  the validator relaxed first (see README "Deferred: Grade 0").

### Phase 1 · Import (text, answers, figures)
Follow `db/seed/wmi/README.md` → "Importing real past papers" exactly:
1. Parse the answer key with `parseAnswerKey` (`paperImport/answerKey.ts`) →
   number→answer maps.
2. Read both sections' `full.md` (Paper A and Paper B). Emit `PaperQuestion[]` (`paperImport/types.ts`):
   continuous renumber (Paper A multiple-choice `1..M`, Paper B fill-in `M+1..`);
   `body_en` cleaned of OCR noise with the **duplicated Chinese dropped**; plain
   text, no `[[ ]]` markup; `body_id` a natural Indonesian translation;
   `choices_en/id`; `answer` from step 1; `figure_url` =
   `/api/public/wmi/figures/` + `figureName(meta, number, ext)`
   (`paperImport/figures.ts`) when the question has `![](images/…)`.
3. Copy each referenced figure into `db/seed/wmi/figures/` under its stable name.
4. Paper header: `year`, `grade`, `round` (Prelim→`semifinal`, Final→`final`),
   `variant:"A"`, `recommended_duration_min`, `title`.
5. Write the merged JSON; run `npm run wmi:validate` until ✓.

**Answer-correctness gate:** independently solve every question and reconcile with
the parsed answer; the answer count must equal the question count; surface any
mismatch to the user before continuing. See `references/checklists.md` § Gate 2.

### Phase 2 · Triage (needsVisual)
For each question set `breakdown.needsVisual`: counting/spatial/figure → `true`;
pure number/word → `false`. Visual questions get an illustration + explainer; every
question gets a breakdown + steps.

### Phase 3 · Enrich (per question; batchable)
Use the **qupu-math-problem-creation** skill for the craft of each role:
- **Designer** → the `breakdown` object (+ a reworded `body_en/id` stem if the OCR
  stem is noisy). Highlights must be exact substrings of the display body.
- **Step-explainer** → `hint_steps_en/id` (3–5 steps; arithmetic lands the answer).
- **Illustrator** (needsVisual only) → `<Thing>Illustration.tsx` + a co-exported
  shared visual primitive. Check Gate 1's *reconstruction* criteria now (figure
  matches the source); its *on-screen* criteria (viewBox headroom, centering, border
  consistency) are checked once rendered, in Phase 5. See `references/checklists.md`
  § Gate 1.
- **Animator** (needsVisual only) → `<thing>Steps.ts` + `<Thing>Explainer.tsx`
  importing the primitive.
All four bind to the breakdown's `quantities` (anti-drift glue).

**Optional Workflow fan-out (opt-in only).** When the user asks to go faster,
enrich the visual questions with an inline `Workflow` `pipeline()`:
- illustrator + animator write their own unique files and return component name +
  import path;
- designer + step-explainer return structured data only;
- after it returns, the controller (main session) serially applies the shared-file
  edits (`registry.ts`, the seed JSON), then reseeds.
The guided loop still owns import, wiring, verification, and review. Non-visual
questions (`needsVisual: false`) always stay in the guided loop regardless of opt-in
— they produce only `breakdown` + `hint_steps` (no files to parallelize). The
`Workflow` tool requires explicit user opt-in.

### Phase 4 · Wire
- Register `{ Illustration, Explainer }` by the **question** code in
  `src/components/wmi/paperQuestions/registry.ts` — the key is
  `paperCode + '-Q' + number` (e.g. `VISUALS['WMI-19F1A-Q18']`, **not** the bare
  paper code). Add the component imports + the `VISUALS[...]` entry.
- Merge each question's `breakdown` + `hint_steps_en/id` + any reworded `body_en/id`
  into the paper's seed JSON.
- `npm run seed:wmi`.

### Phase 5 · Verify
Run all four gates (Gate 1 Layout, Gate 2 Answer-correctness, Gate 3 Step-quality,
Gate 4 Breakdown schema) and the verification commands in `references/checklists.md`:
`npm run check`, `npm run lint` (0 errors), the SSR smoke, reseed smoke,
`npm run wmi:validate`.

### Phase 6 · Batch review
Ask the user to review the batch at `/admin/wmi-drill`. Iterate before the next
batch.

## Golden-reference table

| Need | Reference |
|---|---|
| Seed JSON shape (all fields) | `db/seed/wmi/papers/2019-final-g1.json` |
| Import procedure (md → JSON, figures, answer key) | `db/seed/wmi/README.md`, `api/services/wmi/paperImport/`, `src/lib/wmiPaperCode.ts` |
| Per-question craft (4 roles) | `qupu-math-problem-creation` skill |
| Illustration + primitive + explainer + steps | `src/components/wmi/paperQuestions/ShapeEquationIllustration.tsx`, `ShapeEquationExplainer.tsx`, `shapeEquationSteps.ts` (Q18) |
| Registry wiring | `src/components/wmi/paperQuestions/registry.ts` |
| Layout-fix lessons | Q18 centering; Q23 `src/components/wmi/paperQuestions/LockCodeIllustration.tsx` viewBox headroom |

## Gates & verification

See `references/checklists.md` for the four quality gates (layout, answer, steps,
breakdown schema) and the exact verification commands.
