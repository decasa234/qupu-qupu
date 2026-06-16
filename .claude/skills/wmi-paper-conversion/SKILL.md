---
name: wmi-paper-conversion
description: Use when converting a WMI past-paper into web-ready questions — importing text/answers/figures from an OCR'd full.md, then authoring the breakdown, step-by-step, SVG illustration, and animated explainer for a whole paper. Triggers on "convert this WMI paper", "import WMI 20xx grade N", "make these past-paper questions web-ready", or working across db/seed/wmi/papers and src/components/wmi/PastPapers/WMI. Golden references: WMI-20F1A (clean full Grade-1 import) and WMI-21F1A (the same, hardened through full user review). For a single question or concept (not a whole paper), use qupu-math-problem-creation instead.
---

# WMI Paper Conversion

## Overview

Convert one WMI past-paper from an OCR'd markdown source into web-ready questions.
A guided, checkpointed pipeline: ingest → import → triage → enrich → wire → verify
→ review. Per-question craft is delegated to the **qupu-math-problem-creation**
skill; this skill is the paper-level orchestration around it. The skill's four
roles are persisted as global agents — `qupu-question-designer`, `qupu-illustrator`,
`qupu-step-explainer`, `qupu-animator` — that you dispatch with the Agent tool (or
as `Workflow` `agentType`s); see Phase 3.

**Golden references = WMI-20F1A and WMI-21F1A.** Both are complete Grade-1 finals
taken end to end; copy them, don't re-derive.
- **WMI-20F1A** — `db/seed/wmi/papers/2020-final-g1.json`, components `*20*.tsx`
  (one file per component). The clean full-paper import: every routine→hard pattern
  in one paper — make-ten arithmetic, measurement, clock, thermometer, calendar,
  spinner probability, group-counting, repeating patterns, tangram, arrow-path,
  matchsticks, rolling paint, a KenKen logic grid (solver-first), and a 3-scale
  balance.
- **WMI-21F1A** — `db/seed/wmi/papers/2021-final-g1.json`, components
  `*21*Illustrations.tsx` + `*Explainers21G1.tsx`. The same paper hardened through a
  full round of the user's visual review. It is the reference for the **house style**
  below and for the spatial puzzles: seesaw, balloons, number-chain, isometric cube,
  shape-equation cross, hanging mobile.

### House style (learned from review — apply to EVERY paper)

1. **SVG, never raster.** Redraw every printed stem figure as a registry
   `Illustration`; `figure_url` stays only as a fallback. A question whose figure is
   still a `.jpg` on screen is NOT done. (`WmiQuestionView` renders the registry
   `Illustration` over `figure_url` when both exist.)
2. **Basic glyphs only.** Use plain geometric shapes and single-codepoint emoji
   (● ▲ ■ ★, ⭐ 🔵 🟢). NEVER multi-codepoint / "complex" emoji (❤️, animals, VS16 or
   skin-tone sequences) — they render differently inside SVG `<text>` than in HTML, so
   the question stem and the figure silently drift apart. For symbol-substitution
   puzzles (shapes standing for numbers) use ONE monochrome outline set — ☆ ○ △ □ —
   and the IDENTICAL glyph string in body, illustration, explainer, and steps.
3. **Image-only stem when the figure carries the data.** Strip verbal enumeration the
   figure already shows; never leak indices, values, or answer-bearing inner lines
   into the static figure.
4. **The static figure shows only the problem, never the answer.** The explainer
   reveals the answer beat by beat.

## What already exists (do NOT rebuild)

- **Data model + rendering:** `breakdown` JSONB + `hint_steps_en/id` on
  `wmi_questions`; `src/components/wmi/WmiQuestionView.tsx` renders the "Q"
  breakdown, steps, trap note, illustration, and post-answer explainer. No
  schema/render work is needed.
- **Import procedure + tooling:** `db/seed/wmi/README.md`,
  `api/services/wmi/paperImport/` (`answerKey.ts`, `figures.ts`, `validate.ts`,
  `types.ts`), `paperCode()` (`src/lib/wmiPaperCode.ts`), `db/seed/wmi/load.ts`.
- **Per-question craft:** the `qupu-math-problem-creation` skill.
- **Token-saving tooling:** `npm run wmi:scan-figures -- "<dir>" …` (per-question
  figure inventory from a source folder's `full.md`) and `npm run wmi:index`
  (regenerates `INDEX.md` plus `EXPLAINER_POOL.md` + `pool.json` in
  `src/components/wmi/PastPapers/WMI/` — the reuse catalog: parameterized
  **templates** first, then every wired illustration/explainer/option renderer).

## Token budget (read once, apply everywhere)

1. **Scan before you read.** `wmi:scan-figures` replaces opening every scan image;
   only open images for questions it flags.
2. **Read the pool catalog before building.** Scanning `EXPLAINER_POOL.md`
   (templates first) costs ~50 tokens; a rebuilt component costs ~10–30k. Prefer a
   template (zero new code) → then copy-adapt the closest bespoke entry.
3. **Slice prompts per question.** Agents get their one question + one reference
   path, never the whole paper or multiple worked examples.
4. **Tier the models** (Phase 3 table) — `haiku`/`sonnet` for data-only and routine
   visual roles; inherit only for solver-first/hard questions.
5. **Batch the cheap stuff:** one SSR smoke file per batch, one registry edit pass
   per batch, one reseed per batch — never per question.
6. **Skip what triage skips.** `needsVisual: false` questions dispatch at most the
   designer + step-explainer (or are done inline) — no illustrator/animator.

## Inputs → outputs

- **Inputs:** a source set under `wmiPastPaper/` — `<… Paper A>/full.md` +
  `<… Paper B>/full.md` + `<… Answer Key>/full.md` + each folder's `images/`.
- **Outputs:** merged `db/seed/wmi/papers/<year>-<round>-g<grade>.json`; figures
  copied to `db/seed/wmi/figures/`; per-question `*Illustration.tsx` /
  `*Explainer.tsx` (+ `*Steps.ts`) in `src/components/wmi/PastPapers/WMI/`
  registered in `registry.ts`; a reseeded DB.

## Pipeline

Create one task/todo per phase. Work in batches; stop for the user's visual review
after each batch (Phase 6).

### Phase 0 · Preflight
- Verify gstack: `test -d ~/.claude/skills/gstack/bin && echo OK`.
- Locate the three source folders (Paper A, Paper B, Answer Key) under
  `wmiPastPaper/`.
- Compute the **paper code** with `paperCode({year, round, grade, variant:'A'})`
  → e.g. `WMI-20F1A`. Each question's **registry key** is that plus `-Q<number>`
  (e.g. `WMI-20F1A-Q24`). The seed filename is `<year>-<round>-g<grade>.json` —
  match the existing files in `db/seed/wmi/papers/` (e.g. `2020-final-g1.json`).
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
3. Run the figure pre-scan **before reading any scans yourself**:
   `npm run wmi:scan-figures -- "<Paper A dir>" "<Paper B dir>"` — per question it
   reports `stemImages` (real figures to copy/redraw), `optionImages` (the
   question likely needs a `CHOICE_RENDERERS` entry), and `textImageBlocks`
   (the "image" is typeset text, e.g. vertical arithmetic — transcribe it into
   the body instead of treating it as a figure). Use this as the figure
   inventory; only open the actual image files for questions the scan flags.
4. Copy each referenced figure into `db/seed/wmi/figures/` under its stable name.
5. Paper header: `year`, `grade`, `round` (Prelim→`semifinal`, Final→`final`),
   `variant:"A"`, `recommended_duration_min`, `title`.
6. Write the merged JSON; run `npm run wmi:validate` until ✓.

**Answer-correctness gate:** independently solve every question and reconcile with
the parsed answer; the answer count must equal the question count; surface any
mismatch to the user before continuing. See `references/checklists.md` § Gate 2.

### Phase 2 · Triage (needsVisual)
Start from the Phase-1 scan output — it is the cheap prior:
- `hasStemFigure: true` → `needsVisual: true` (a figure exists; redraw or reuse it).
- no images at all + pure number/word stem → `needsVisual: false`; do **not**
  dispatch illustrator/animator for these.
- `textImageBlocks` only → usually `needsVisual: false` (transcribe the text);
  promote to `true` only when the layout itself is the point (e.g. vertical
  arithmetic with a missing digit).
Override the prior in either direction for counting/spatial reasoning that has no
printed figure but needs one. Visual questions get an illustration + explainer;
every question gets a breakdown + steps.

### Phase 3 · Enrich (per question; batchable)
**Pool reuse pass — do this FIRST for every `needsVisual` question.** Read
`src/components/wmi/PastPapers/WMI/EXPLAINER_POOL.md` (regenerate with
`npm run wmi:index` if stale); it lists reusable **templates** (true zero-code
reuse) first, then bespoke pairs grouped by tag.
1. **Template match** (judge by its `useWhen`) → do NOT build a component. Add a
   binding to the question in the seed JSON:
   `"visual": { "templateId": "<id>", "params": { … } }`. `npm run wmi:validate`
   checks `params` against the template's schema, so a bad binding fails fast.
2. **Bespoke near-match** → copy-adapt the closest catalogued pair.
3. **No match** → build new, and have the new illustration export a `meta` block —
   `definePoolMeta({ id, title, summary, useWhen, tags, grades, status: 'bespoke' })`
   (import from `./poolMeta`) — so `npm run wmi:index` adds it to the catalog.

**Reuse before you build.** When copy-adapting (cases 2–3), search the catalog by
keyword (clock, balance, kenken, maze, calendar, …) instead of reading component
files. If the *same* problem
already exists in another paper/grade (same values, figure, and answer — e.g. a
G1 question reused for G2), point the registry at the existing
`Illustration`/`Explainer` instead of recreating them — the registry can map
several `code`s to one component pair (cf. `WMI-19F2A-Q9` reusing the G1
shape-equation figure, and `WMI-19F2A-Q25` reusing the G1 arrow grid). The same
applies to `CHOICE_RENDERERS` and shared primitives (clock faces, balance pans,
number cards) — import the existing primitive rather than redrawing it. Only
build new components when the puzzle genuinely differs (different cages, clues,
arrows, or numbers — a matching final answer alone is not enough).

**Deduce, don't assert.** Breakdowns, `hint_steps`, and explainer storyboards must
derive the answer from prior facts — a chain a kid can follow (givens →
eliminations → result). Captions like "working through the clues, X must be 4"
fail Gate 3; show the deduction, including the failed tries when the method is
elimination.

**Logic-grid puzzles: solver first.** For mathdoku/KenKen, skyscrapers, and
similar constraint grids, write a throwaway backtracking solver *before* any
component code (temp script, run with `npx tsx`, delete after). It must confirm
(a) your cage/clue reading of the scan yields a **unique** solution, (b) the
lettered cells reproduce the answer key, and (c) which cells the A/B/C/D
watermarks sit in — letter positions read off a scan are routinely one cell off,
and only the solved grid disambiguates them. Then hardcode the verified solution
in the illustration header with a proof comment, and re-verify it in the SSR
smoke (Latin rows/cols + every cage/clue + ABCD). Worked references:
`Mathdoku5G3Illustration.tsx`, `SkyscraperG3Illustration.tsx` (WMI-19F3A Q24/Q25).

**Pace for one idea per beat.** Enumerations (count the squares/triangles) reveal
**one object per beat** with a running counter — never a whole class at once.
Try-and-eliminate shows **one candidate per beat** (`102×9=918 ✓` gets its own
beat, as does each ✗). Every mark or step shows the concrete arithmetic that
creates it ("1+2 = 3", not "the small pairs"). Many short beats beat few dense
ones: the player (`WmiExplainer.tsx`) automatically switches from step-dots to a
range slider above 12 beats, so beat count is not a constraint. Pin invariant
rules (e.g. dice partners adding to 7) as a persistent legend above the board
instead of repeating them in captions. Worked references: `DotSquaresG3Explainer`
(29 squares, 31 beats), `MShapeLinesG3Explainer` (10 triangles one-by-one),
`DieSumsG3Explainer` (legend + concrete sums).

**Missing or wrong source figure.** When a question references a figure the OCR
set doesn't include, the registry `Illustration` becomes the figure (no
`figure_url`). If your independent solution disagrees with the key because the
body misdescribes the missing figure, stop and ask the user for the real figure
— do not fabricate one that forces the key (WMI-19F3A Q17: key said 10, "triangle
below" was actually an M shape; body reworded to "figure below").

Each role is persisted as a global agent — dispatch it with the Agent tool, or do
the role inline; either way the craft rules live in the
**qupu-math-problem-creation** skill. The agents default to the *concept* layout,
so when dispatching for a paper question put these paper specifics in the prompt:
the registry **`code`** key (e.g. `WMI-20F1A-Q24`), that `breakdown` + `hint_steps`
land in the **seed JSON** (not a concept `render()`), the target paths under
`src/components/wmi/PastPapers/WMI/`, the shared-primitive convention below, and any
Phase-3 rule that applies (reuse-before-build, solver-first, one-idea-per-beat).
- **Designer** (`qupu-question-designer`) → the `breakdown` object (+ a reworded
  `body_en/id` stem if the OCR stem is noisy). Highlights must be exact substrings
  of the display body.
- **Step-explainer** (`qupu-step-explainer`) → `hint_steps_en/id` (3–5 steps;
  arithmetic lands the answer).
- **Illustrator** (`qupu-illustrator`; needsVisual only) → `<Thing>Illustration.tsx`
  + a co-exported shared visual primitive. Check Gate 1's *reconstruction* criteria
  now (figure matches the source); its *on-screen* criteria (viewBox headroom,
  centering, border consistency) are checked once rendered, in Phase 5. See
  `references/checklists.md` § Gate 1.
- **Animator** (`qupu-animator`; needsVisual only) → `<thing>Steps.ts` +
  `<Thing>Explainer.tsx` importing the illustrator's primitive. Because of that
  import, when both roles run, the illustrator goes first (or pass the animator the
  primitive's name + path so it can bind to it).
All four bind to the breakdown's `quantities` (anti-drift glue).

**Model tiers (set the Agent `model` param by task complexity):**

| Tier | Questions | Roles → model |
|---|---|---|
| Routine | one-step arithmetic, read-the-clock, simple sequences | designer + step-explainer → `haiku`; illustrator + animator → `sonnet` |
| Standard | multi-step word problems, balances, patterns, calendars | all four roles → `sonnet` |
| Hard | logic grids (solver-first), dense geometry/enumeration, anything that failed review once | omit `model` (inherit the session model) |

Data-only roles (designer, step-explainer) never need more than `sonnet`. When a
question bounces in user review twice, redo it inline (main session) rather than
re-dispatching — the review context doesn't transfer cheaply.

**Minimal prompts.** Each agent gets ONLY its question's slice: the cleaned
`body_en/id`, choices, answer, figure path(s), the designer's `quantities`, and at
most ONE golden-reference file path. Never paste the whole `full.md`, the whole
seed JSON, or multiple reference components into an agent prompt — that is the
single biggest token sink in a 25-question paper.

**Optional Workflow fan-out (opt-in only).** When the user asks to go faster,
enrich the visual questions with an inline `Workflow` `pipeline()`, using the four
global agents as each stage's `agentType`:
- illustrator (`qupu-illustrator`) + animator (`qupu-animator`) write their own
  unique files and return component name + import path;
- designer (`qupu-question-designer`) + step-explainer (`qupu-step-explainer`)
  return structured data only;
- after it returns, the controller (main session) serially applies the shared-file
  edits (`registry.ts`, the seed JSON), then reseeds.
The guided loop still owns import, wiring, verification, and review. Non-visual
questions (`needsVisual: false`) always stay in the guided loop regardless of opt-in
— they produce only `breakdown` + `hint_steps` (no files to parallelize). The
`Workflow` tool requires explicit user opt-in.

### Phase 4 · Wire
- Register `{ Illustration, Explainer }` by the **question** code in
  `src/components/wmi/PastPapers/WMI/registry.ts` — the key is
  `paperCode + '-Q' + number` (e.g. `VISUALS['WMI-20F1A-Q24']`, **not** the bare
  paper code). Add the component imports + the `VISUALS[...]` entry.
- Merge each question's `breakdown` + `hint_steps_en/id` + any reworded `body_en/id`
  into the paper's seed JSON.
- `npm run seed:wmi`.
- `npm run wmi:index` — regenerate `INDEX.md` + `EXPLAINER_POOL.md` + `pool.json`
  so new components (and any new `meta` blocks) are findable for the next paper's
  reuse pass. Commit them with the batch.

### Phase 5 · Verify
Run all four gates (Gate 1 Layout, Gate 2 Answer-correctness, Gate 3 Step-quality,
Gate 4 Breakdown schema) and the verification commands in `references/checklists.md`:
`npm run check`, `npm run lint` (0 errors), the SSR smoke, reseed smoke,
`npm run wmi:validate`.

### Phase 6 · Batch review
Ask the user to review the batch at `/admin/wmi-drill`. Iterate before the next
batch.

## Golden-reference table

Primary references are WMI-20F1A / WMI-21F1A; the G3 rows cover patterns those two
Grade-1 papers don't contain (skyscrapers, dense enumeration, vertical multiply).

| Need | Reference |
|---|---|
| Whole-paper gold standard (all fields, all 25 Qs) | `db/seed/wmi/papers/2020-final-g1.json` (clean import) and `db/seed/wmi/papers/2021-final-g1.json` (review-hardened) |
| Import procedure (md → JSON, figures, answer key) | `db/seed/wmi/README.md`, `api/services/wmi/paperImport/`, `src/lib/wmiPaperCode.ts` |
| Per-question craft (4 roles) | `qupu-math-problem-creation` skill |
| Explainer-only question (`needsVisual:false`) | `MakeTenVisual20Explainer` (WMI-20F1A-Q1), `BalletCalendar20Explainer` (Q8) |
| One-file-per-component illustration + explainer | `CherryCount20Illustration.tsx` + `CherryCount20Explainer.tsx`; `Matchstick20*`, `Pyramid20*`, `SumGrid20*` |
| Image-option choices (`CHOICE_RENDERERS`) | `ShapeGridOption20`, `ClockOption20`, `SpinnerOption20`, `SeesawOption21` in `registry.ts` |
| Logic grid (solver-first) | `KenKen20Illustration.tsx` + `KenKen20Explainer.tsx` (G1 KenKen); `Mathdoku5G3*`, `SkyscraperG3*` for skyscrapers |
| Multi-constraint balance / elimination | `ThreeScales20Illustration.tsx` (3 scales); `Scales21Illustration` + `Seesaws21Explainer` (seesaws) |
| Rolling-paint mechanics | `PaintRoll20Illustration.tsx` + `paintRoll20Steps.ts` + `PaintRoll20Explainer.tsx` |
| Symbol-substitution puzzle (plain shapes) | `ShapeCross21Illustration` (`cards21G1Illustrations.tsx`) + `ShapeCross21G1Explainer`; `ChainDiagram21Illustration` (`puzzles21G1Illustrations.tsx`) + `Chains21Explainer` |
| Isometric cube count | `BigCube21Illustration` + `BigCube21Explainer` (`puzzles21G1Illustrations.tsx` / `puzzleExplainers21G1.tsx`) |
| Per-candidate try-and-eliminate beats | `LargestResult21G1Explainer` (WMI-21F1A-Q1); `VerticalMultG3Explainer.tsx` |
| One-object-per-beat enumeration with running counter | `DotSquaresG3Explainer.tsx`, `MShapeLinesG3Explainer.tsx` |
| Registry wiring (`VISUALS` + `CHOICE_RENDERERS`) | `src/components/wmi/PastPapers/WMI/registry.ts` |
| Layout-fix lessons + geometry gotchas (viewBox headroom, centering, SVG y-axis, isometric facing) | `references/checklists.md` § Gate 1; `LockCodeIllustration.tsx` viewBox headroom |

## Gates & verification

See `references/checklists.md` for the four quality gates (layout, answer, steps,
breakdown schema) and the exact verification commands.
