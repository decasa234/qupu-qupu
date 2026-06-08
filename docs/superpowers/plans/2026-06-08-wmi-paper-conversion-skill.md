# WMI Paper Conversion Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author a new `wmi-paper-conversion` skill (`.claude/skills/wmi-paper-conversion/`) that orchestrates converting a WMI past-paper from OCR'd markdown into web-ready questions end-to-end, using WMI-19F1A as the golden reference.

**Architecture:** Two authored markdown files — `SKILL.md` (the phase spine: ingest → import → triage → enrich → wire → verify → review, plus a golden-reference table and an optional inline Workflow fan-out) and `references/checklists.md` (four quality gates + verification commands). The skill reuses, never rebuilds, the existing import tooling (`paperImport/`, `paperCode`, `load.ts`), the live `breakdown`/`hint_steps` data model + `WmiQuestionView` rendering, and the per-question `qupu-math-problem-creation` skill.

**Tech Stack:** Markdown skill files (YAML frontmatter + body); verification via existing repo tooling (`npm run check` / `lint` / `wmi:validate` / `seed:wmi`, `tsx` SSR smoke). No application code or schema changes.

---

## Spec

Implements `docs/superpowers/specs/2026-06-08-wmi-paper-conversion-skill-design.md` (Approach A — lean orchestrator). Decisions: full end-to-end scope; entry point is OCR'd md (no OCR in skill); hybrid execution (guided loop + optional Workflow fan-out); "layout" = faithful reconstruction AND clean on-screen rendering.

## File Structure

- **Create** `.claude/skills/wmi-paper-conversion/SKILL.md` — orchestration spine, golden-reference table, optional Workflow snippet. One responsibility: tell the main agent how to drive a paper conversion.
- **Create** `.claude/skills/wmi-paper-conversion/references/checklists.md` — the four quality gates + the exact verification commands. One responsibility: the re-read-often detail kept out of SKILL.md so it stays scannable.

No other files change. Skills under `.claude/skills/` are auto-discovered; no registry edit is needed (mirrors `qupu-math-problem-creation`).

---

### Task 1: Author `SKILL.md`

**Files:**
- Create: `.claude/skills/wmi-paper-conversion/SKILL.md`

- [ ] **Step 1: Write the file with exactly this content**

````markdown
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
````

- [ ] **Step 2: Verify the frontmatter and every npm script the file names exist**

Run:
```bash
head -4 .claude/skills/wmi-paper-conversion/SKILL.md
node -e "const p=require('./package.json').scripts; for (const s of ['check','lint','seed:wmi','wmi:validate']) if(!p[s]) {console.error('MISSING script',s); process.exit(1)}; console.log('scripts OK')"
```
Expected: the frontmatter shows `name: wmi-paper-conversion` + a `description:` line, then `scripts OK`.

- [ ] **Step 3: Verify every golden-reference path resolves**

Run:
```bash
for f in \
  db/seed/wmi/papers/2019-final-g1.json \
  db/seed/wmi/README.md \
  api/services/wmi/paperImport/answerKey.ts \
  api/services/wmi/paperImport/figures.ts \
  api/services/wmi/paperImport/types.ts \
  src/lib/wmiPaperCode.ts \
  db/seed/wmi/load.ts \
  src/components/wmi/WmiQuestionView.tsx \
  src/components/wmi/paperQuestions/registry.ts \
  src/components/wmi/paperQuestions/ShapeEquationIllustration.tsx \
  src/components/wmi/paperQuestions/ShapeEquationExplainer.tsx \
  src/components/wmi/paperQuestions/shapeEquationSteps.ts \
  src/components/wmi/paperQuestions/LockCodeIllustration.tsx \
  .claude/skills/qupu-math-problem-creation/SKILL.md ; do
  test -f "$f" && echo "ok  $f" || { echo "MISSING $f"; exit 1; }
done
```
Expected: an `ok` line for every path, no `MISSING`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/wmi-paper-conversion/SKILL.md
git commit -m "feat(skill): add wmi-paper-conversion SKILL.md orchestration spine"
```

---

### Task 2: Author `references/checklists.md`

**Files:**
- Create: `.claude/skills/wmi-paper-conversion/references/checklists.md`

- [ ] **Step 1: Write the file with exactly this content**

````markdown
# WMI Paper Conversion — Quality Gates & Verification

Re-read during Phase 1 (the answer gate) and Phase 5 (all gates).

## Gate 1 · Layout-QA (both dimensions)

**Reconstruction — the figure matches the source:**
- The SVG reproduces the source figure's shapes, counts, positions, and labels.
- The numbers shown in the figure equal the question's `quantities` / `answer`.
- When the OCR figure is ambiguous, the reconstruction must be the **unique**
  assignment consistent with the answer (see the recovery note atop
  `src/components/wmi/paperQuestions/ShapeEquationIllustration.tsx`).

**On-screen — it renders cleanly:**
- The viewBox has headroom on all four sides — no arc/stroke bleeds past an edge.
  (Q23: the lock shackle arced to `y=-2`, above the viewBox top, and was clipped
  flat by `overflow-hidden`; fixed with a negative-min-y viewBox in
  `LockCodeIllustration.tsx`.)
- Content is centered, not hugging a reserved-but-empty column. (Q18: the equations
  hugged the left because the badge column only the explainer uses was reserved;
  fixed by centering the equation block when no badges show.)
- Border/padding is consistent with sibling illustrations
  (`my-4 … rounded-lg border-2 border-qupu-cream-dark bg-white p-2`).
- It renders cleanly in BOTH the question card and the explainer — they share the
  figure component.

## Gate 2 · Answer-correctness
- Independently solve each question; reconcile with the parsed answer-key value.
- The count of answers must equal the count of questions.
- Figure-dependent answers must follow from the reconstructed figure.
- Any mismatch → stop and surface to the user; do not guess.

## Gate 3 · Step-quality
- Aim for 3–5 short, grade-appropriate `hint_steps_en/id`.
- The arithmetic reconciles with `quantities`, and the final line states the
  `answer`.

## Gate 4 · Breakdown schema
Fields (type `Breakdown` in `api/services/wmi/concepts/types.ts`, mirrored to
`src/types/wmi.ts`; worked examples in `db/seed/wmi/papers/2019-final-g1.json`):
`needsVisual`, `highlights[{category, phrase_en, phrase_id, note_en, note_id}]`,
`quantities[{label_en, label_id, value}]`,
`strategy{name_en, name_id, conceptSlug?}`,
`trap{wrong, why_en, why_id} | null`, `answer{form, unit, value}`,
`vocab?: string[]` (optional glossary chips).

- `category` ∈ `fact` | `condition` | `question`.
- Every `phrase_en/id` is an **exact substring of the display body** — the text
  after `stripSectionLabels(body)` AND resolving glossary `[[slug|label]]`→`label`.
  Verify the display text with:
  ```
  parseWmiMarkup(stripSectionLabels(body)).map(s => s.text).join('')
  ```
  (helpers: `src/lib/wmiMarkup.ts` + `src/lib/wmiBreakdown.ts`).
- `trap` is `null` unless a genuine tempting wrong answer exists.
- For multiple-choice questions, `answer.form: 'choice'` and `answer.value` is the
  choice label (e.g. `"B"`).

## Verification commands
Run from the repo root. DB-touching commands use `dangerouslyDisableSandbox: true`
(LAN Postgres).

- **Typecheck:** `npm run check`
- **Lint:** `npm run lint` — 0 errors; `react-refresh/only-export-components`
  warnings are expected and OK.
- **SSR smoke** — render the new illustration + explainer to `<svg>` in en+id. Create
  `__smoke.tsx` at the repo root (so `react-dom` and the `@/` alias resolve) with the
  content below, run `npx tsx __smoke.tsx`, then delete it. Expected: four `true` lines
  (for an explainer-only question with no `Illustration`, drop the `Illustration` import
  and its two lines, and expect two).
  ```ts
  import { renderToStaticMarkup } from 'react-dom/server'
  import { createElement as h } from 'react'
  import Illustration from '@/components/wmi/paperQuestions/<Thing>Illustration'
  import Explainer from '@/components/wmi/paperQuestions/<Thing>Explainer'
  const p = { correctAnswer: '', params: {} } as any
  for (const lang of ['en', 'id'] as const) {
    console.log('illus', lang, renderToStaticMarkup(h(Illustration)).includes('<svg'))
    console.log('expl ', lang, renderToStaticMarkup(h(Explainer, { ...p, lang })).includes('<svg'))
  }
  ```
- **Reseed + smoke:** `npm run seed:wmi`, then confirm the question's
  `breakdown` / `hint_steps` are present and well-formed.
- **Paper validation:** `npm run wmi:validate` → ✓.
````

- [ ] **Step 2: Verify every source file/symbol the checklist names exists**

Run:
```bash
for f in \
  api/services/wmi/concepts/types.ts \
  src/types/wmi.ts \
  src/lib/wmiMarkup.ts \
  src/lib/wmiBreakdown.ts \
  src/components/wmi/paperQuestions/ShapeEquationIllustration.tsx \
  src/components/wmi/paperQuestions/LockCodeIllustration.tsx ; do
  test -f "$f" && echo "ok  $f" || { echo "MISSING $f"; exit 1; }
done
grep -q "stripSectionLabels" src/lib/wmiBreakdown.ts && echo "ok stripSectionLabels"
grep -q "parseWmiMarkup" src/lib/wmiMarkup.ts && echo "ok parseWmiMarkup"
```
Expected: an `ok` line for every path and both symbols, no `MISSING`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/wmi-paper-conversion/references/checklists.md
git commit -m "feat(skill): add wmi-paper-conversion quality-gate checklists"
```

---

### Task 3: Integrity sweep + documented-gate check

**Files:**
- Modify (only if the sweep finds a broken reference): `.claude/skills/wmi-paper-conversion/SKILL.md` and/or `.claude/skills/wmi-paper-conversion/references/checklists.md`

- [ ] **Step 1: Sweep every backtick'd repo path mentioned in the skill and assert it resolves**

The skill uses contextual path shorthands (e.g. `paperImport/answerKey.ts` lives under `api/services/wmi/`; `references/checklists.md` is relative to the skill dir), so resolve a token if it equals a tracked path OR if some tracked path ends with it. Use a script file — the RTK proxy mangles inline `npx tsx -e`.

Write `sweep.ts` and run `npx tsx sweep.ts`:
```ts
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n').map(s => s.trim()).filter(Boolean)
const trackedSet = new Set(tracked)
const files = [
  '.claude/skills/wmi-paper-conversion/SKILL.md',
  '.claude/skills/wmi-paper-conversion/references/checklists.md',
]
const re = /`([A-Za-z0-9_./-]+\.(?:ts|tsx|json|md|sql))`/g
let bad = 0
for (const f of files) {
  for (const m of readFileSync(f, 'utf8').matchAll(re)) {
    const p = m[1]
    if (!p.includes('/')) continue // bare filenames (e.g. full.md) — contextual, skip
    if (trackedSet.has(p) || tracked.some(t => t.endsWith('/' + p))) continue
    console.error('MISSING', p, 'in', f); bad++
  }
}
console.log(bad ? `FAIL ${bad} missing` : 'all referenced paths resolve')
process.exit(bad ? 1 : 0)
```
Expected: `all referenced paths resolve`. If any `MISSING` prints, fix that path in the skill file (use the real repo path) and re-run until it passes.

- [ ] **Step 2: Confirm the documented validation gate passes on the repo as-is**

Run:
```bash
npm run wmi:validate
```
Expected: every paper reports `✓` (proves the gate the skill tells users to run actually works in this repo).

- [ ] **Step 3: Commit any fixes**

If Step 1 required edits:
```bash
git add .claude/skills/wmi-paper-conversion/
git commit -m "fix(skill): correct broken path references in wmi-paper-conversion"
```
If no edits were needed, skip the commit.

---

## Self-Review

**1. Spec coverage:**
- Full end-to-end scope → SKILL.md Phases 0–6. ✓
- Entry point OCR'd md (no OCR) → Inputs section + Phase 1; OCR listed out-of-scope in spec, not introduced here. ✓
- Hybrid execution → Phase 3 "Optional Workflow fan-out (opt-in only)". ✓
- Layout = reconstruction + on-screen → checklists.md Gate 1 (both sub-sections). ✓
- Answer correctness → Phase 1 gate + Gate 2. ✓
- Step quality → Gate 3. ✓
- Breakdown schema rule (substring-of-display-body) → Gate 4. ✓
- Golden reference WMI-19F1A → golden-reference table + Q18/Q23 lessons. ✓
- Reuse, don't rebuild → "What already exists" section. ✓
- Lean structure (SKILL.md + one references file) → File Structure + Tasks 1–2. ✓
- Verification commands (the validated set) → checklists.md "Verification commands". ✓

**2. Placeholder scan:** `<Thing>` / `<code>` / `<year>-<round>-g<grade>` are intentional templates the skill user fills per paper, not plan placeholders. No "TBD"/"TODO"/"handle edge cases". ✓

**3. Type/name consistency:** referenced symbols and paths (`paperCode` in `src/lib/wmiPaperCode.ts`; `parseAnswerKey`/`figureName` in `paperImport/`; `PaperQuestion` in `paperImport/types.ts`; `Breakdown` in `concepts/types.ts`; `stripSectionLabels`/`parseWmiMarkup`) match the same names used in Tasks 1–2 and the verification sweeps. ✓
