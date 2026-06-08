# WMI Paper Conversion Skill — Design

**Date:** 2026-06-08
**Status:** Approved (pending spec review)

## Goal

Package the recurring "turn a WMI past-paper into web-ready questions" task into a
single invokable skill, `wmi-paper-conversion`. The skill drives the whole
conversion of a paper end-to-end — ingest the OCR'd markdown, import
text/answers/figures, author the `breakdown`, step-by-step, SVG illustration, and
animated explainer per question, wire them in, and verify — using **WMI-19F1A as
the golden worked example**. It is the missing *paper-level* orchestration that
ties together pieces which already exist individually.

## Decisions (settled in brainstorming)

1. **Scope:** full end-to-end orchestrator (ingest → import → enrich → wire →
   verify), not just ingestion or just enrichment.
2. **Input:** the entry point is an **OCR'd `full.md`** source set (Paper A +
   Paper B + Answer Key + `images/`), like the existing `wmiPastPaper/` folders.
   The skill does **not** do OCR / PDF→md.
3. **Execution:** **hybrid** — a guided, checkpointed main loop, with an *optional*
   `Workflow` fan-out for the per-question enrichment of the visual questions
   (opt-in per run).
4. **"Mind the layout":** **both** faithful figure reconstruction (the SVG matches
   the source figure's shapes/counts/positions/values) **and** clean on-screen
   rendering (margins, no truncation/clipping, centered, sibling-consistent) — in
   addition to correct answers and quality steps.

## Context — what already exists (and what this skill does NOT rebuild)

- **Data model + rendering are live.** `wmi_questions` already has `breakdown`
  JSONB (`db/schema.sql:519`) and `hint_steps_en/id`. `WmiQuestionView.tsx`
  renders the "Q" breakdown, the steps, the trap note, the registry illustration,
  and the post-answer explainer animation. No schema or render work is needed.
- **Per-question craft skill.** `qupu-math-problem-creation` encodes the four-role
  method (question-designer → illustrator / step-explainer / animator) and the
  content rules for a **single** question. The new skill reuses it by link, not by
  copy.
- **Import procedure.** `db/seed/wmi/README.md` documents md → seed JSON (continuous
  renumber, drop Chinese, plain-text bodies, `body_id` translation, choices,
  `answer` from the key, `figure_url` + copy image). Backed by
  `api/services/wmi/paperImport/` (`answerKey.ts`, `figures.ts`, `validate.ts`,
  `types.ts`) and the stable code helper `paperCode()` (`WMI-[YY][F|P][grade][A|B]`,
  e.g. `WMI-19F1A`). Loaded by `db/seed/wmi/load.ts`; validated by
  `npm run wmi:validate`; seeded by `npm run seed:wmi`.
- **Golden reference is fully reproducible from md.** The WMI-19F1A source exists
  (`wmiPastPaper/2019 WMI Final G01 Paper A|B|Answer Key/full.md` + `images/`), its
  merged seed is `db/seed/wmi/papers/2019-final-g1.json`, and ~18 illustration /
  explainer component pairs live in `src/components/wmi/paperQuestions/`, wired in
  `registry.ts` by `code`.
- **What does NOT exist:** the four-role subagents + `Workflow` from the approved
  `2026-06-08-wmi-problem-authoring-agents` spec were never built as `.claude/agents/`
  files; authoring is currently manual per question. This skill provides the
  orchestration the main agent follows, and folds the fan-out in as an *optional
  inline* `Workflow` rather than standalone agent definitions.

## The skill

- **Name / location:** `wmi-paper-conversion` → `.claude/skills/wmi-paper-conversion/`.
- **Trigger (description):** use when converting a WMI past-paper into web-ready
  questions — importing text/answers/figures from an OCR'd md, then authoring
  breakdown, step-by-step, SVG illustration, and animated explainer for a whole
  paper. Golden reference = WMI-19F1A.
- **Inputs:** `… Paper A/full.md` + `… Paper B/full.md` + `… Answer Key/full.md`
  + `images/`.
- **Outputs:** a merged `db/seed/wmi/papers/<year>-<round>-g<grade>.json`; copied
  figures in `db/seed/wmi/figures/`; per-question component pairs in
  `paperQuestions/` + `registry.ts` entries; a reseeded DB.

## Pipeline (guided main loop; optional Workflow fan-out in Phase 3)

| Phase | What happens |
|---|---|
| **0 · Preflight** | Verify gstack; locate the Paper A + Paper B + Answer-Key folders; compute `paperCode` + the seed filename; confirm grade is in scope (G1–G3; **G0 deferred** — its ①②③ 3-option format needs the validator relaxed first, per the README). |
| **1 · Import** | Follow the README procedure: run the answer-key parser; read both section md; emit `PaperQuestion[]` (continuous renumber, MC then fill-in; drop the duplicated Chinese; plain-text bodies; translate `body_id`; choices; `answer` from the key; `figure_url` + copy image). Write the merged JSON; run `npm run wmi:validate` to ✓. **Answer-correctness gate:** independently solve each question and reconcile with the answer-key value; the answer count must equal the question count; surface any mismatch for a human decision before continuing. |
| **2 · Triage** | Set `breakdown.needsVisual` per question — counting/spatial/figure → `true`; pure number/word → `false`. This routes enrichment (visual questions get an illustration + explainer; all questions get a breakdown + steps). |
| **3 · Enrich** (per question, batchable) | **Designer** → the `breakdown` object (+ a reworded stem if the OCR stem is noisy). **Step-explainer** → `hint_steps_en/id`. **Illustrator** (needsVisual only) → a faithful `<Thing>Illustration.tsx` + a co-exported shared visual primitive. **Animator** (needsVisual only) → `<thing>Steps.ts` + `<Thing>Explainer.tsx` importing that primitive. All four bind to the breakdown's `quantities` (anti-drift). *Hybrid hook:* on explicit opt-in, dispatch a `Workflow` `pipeline()` over the visual questions to fan these out. |
| **4 · Wire** | Register `{ Illustration, Explainer }` by `code` in `registry.ts`; merge `breakdown` + `hint_steps` + reworded stem into the paper JSON; `npm run seed:wmi`. |
| **5 · Verify** | Run the four gates below + the verification commands. |
| **6 · Batch review** | The user reviews the batch at `/admin/wmi-drill`; iterate before the next batch. |

### Hybrid Workflow hook (Phase 3, opt-in)

When the user opts in to go faster, the enrichment of the **visual** questions runs
as an inline `Workflow` `pipeline()` over the question list. To avoid parallel
file conflicts: the **illustrator** and **animator** write their own unique
`.tsx`/`.ts` files and return component name + import path; the **designer** and
**step-explainer** return structured data only. After the workflow returns, the
**controller** (main session) serially applies the shared-file edits —
`registry.ts` entries and the seed-JSON merge — then reseeds. The guided main loop
still owns import, wiring, verification, and the per-batch user review. The
`Workflow` tool requires explicit user opt-in, consistent with its usage rules.

## Quality gates (`references/checklists.md`)

1. **Layout-QA (both dimensions).**
   - *Reconstruction:* the SVG reproduces the source figure's shapes/counts/
     positions/labels, and the numbers shown in the figure equal the question's
     `quantities`/`answer`. Where the OCR figure is ambiguous, the reconstruction
     must be the **unique** assignment consistent with the answer (cf. the
     `ShapeEquationIllustration` recovery note).
   - *On-screen:* the viewBox has headroom on all four sides — no arc/stroke bleeds
     past an edge (the lock-shackle-above-`y=0` clip in Q23); content is centered,
     not hugging a reserved-but-empty column (the Q18 left-shift); border/padding is
     consistent with sibling illustrations; it renders cleanly in **both** the
     question card and the explainer.
2. **Answer-correctness.** Independently solve; reconcile with the key; answer
   count equals question count; figure-dependent answers follow from the
   reconstructed figure. Mismatch → stop and surface.
3. **Step-quality.** 3–5 short grade-appropriate `hint_steps`; the arithmetic
   reconciles with `quantities` and lands the `answer` on the final line.
4. **Breakdown schema.** The field list + the hard rule that every `phrase_en/id`
   is an **exact substring of the display body** (after `stripSectionLabels` +
   glossary `[[slug|label]]` resolve), with the
   `parseWmiMarkup(stripSectionLabels(body)).map(s=>s.text).join('')` verification
   snippet; `trap` is `null` unless a genuine distractor exists.

## Skill file layout + golden-reference table

```
.claude/skills/wmi-paper-conversion/
├── SKILL.md                  # phase spine + golden-reference table + optional Workflow snippet
└── references/
    └── checklists.md         # the four gates + breakdown/seed schema + exact verification commands
```

`SKILL.md` stays scannable; the re-read-often material lives in `checklists.md`.
SKILL.md's golden-reference table points at the real WMI-19F1A files so the reader
copies a proven example:

| Need | Reference |
|---|---|
| Seed JSON shape (all fields) | `db/seed/wmi/papers/2019-final-g1.json` |
| Import procedure (md → JSON, figures, answer key) | `db/seed/wmi/README.md` + `paperImport/`, `paperCode.ts` |
| Per-question craft (4 roles, breakdown rules) | `qupu-math-problem-creation` skill |
| Illustration + primitive + explainer + steps | Q18 `ShapeEquationIllustration.tsx` / `ShapeEquationExplainer.tsx` / `shapeEquationSteps.ts` |
| Registry wiring | `paperQuestions/registry.ts` |
| Layout-fix lessons | Q18 (centering) + Q23 `LockCodeIllustration.tsx` (viewBox headroom) |

## Verification commands (inline — no bundled scripts)

The exact commands validated in practice:

- `npm run check` (`tsc --noEmit`).
- `npm run lint` — 0 errors; the `react-refresh/only-export-components` co-export
  warnings are expected/OK.
- SSR smoke — a temp `tsx` harness that renders the new `Illustration` + `Explainer`
  to `<svg>` in `en` and `id` (placed inside the project tree so `react-dom`
  resolves).
- `npm run seed:wmi` + a reseed smoke (the question's `breakdown`/`hint_steps` are
  present and well-formed).
- `npm run wmi:validate` to ✓.

DB-touching commands run with `dangerouslyDisableSandbox: true` (LAN Postgres).

## Scope / out of scope

- **In:** the `wmi-paper-conversion` skill (`SKILL.md` + `references/checklists.md`),
  authored to Approach A (lean orchestrator); the golden-reference table; the four
  quality gates; the optional inline `Workflow` snippet.
- **Out (deferred):** OCR / PDF→md ingestion; G0 papers (need the 3-option validator
  relaxation first); backfilling already-built papers; unattended auto-run across all
  papers; standalone `.claude/agents/` four-role definitions (the skill guides the
  main agent + optional inline `Workflow` instead); any change to the schema,
  loader, DTOs, or `WmiQuestionView` rendering (all already in place).
```
