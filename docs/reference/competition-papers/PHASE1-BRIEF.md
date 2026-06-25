# Phase 1 brief — breakdown + step-by-step + template animations (WMI standard)

Author the DATA LAYER for EVERY question of ONE already-imported paper, to the WMI house
standard. **NO bespoke SVG components in this phase** (figures are Phase 2). Worktree:
`/Users/vics/Development/Project/qupu-website/.claude/worktrees/claude-mythos-optimization`.

## Target (edit in place)
The paper's seed JSON (controller gives the path). Each question already has `body_en/id`,
`choices_en/id`, `answer`, `answer_type`. For EACH question ADD: a `breakdown` object +
`hint_steps_en` + `hint_steps_id`, and a `visual` template binding where one genuinely
fits. **NEVER modify the existing `answer`, `body_en/id`, `choices_en/id`, or `answer_type`
fields** — only ADD `breakdown`, `hint_steps_en/id`, and `visual`. The top-level `answer`
stays a plain string/letter; the answer OBJECT (`{form,value}`) goes ONLY inside
`breakdown.answer`, never at the top level.

## Gold-standard references (copy the shape exactly)
- `db/seed/wmi/papers/2025-final-g1.json` (WMI-251FA) — the breakdown standard (Q1 toucan).
- `db/seed/ikmc/papers/2019-contest-preecolier.json` — a completed non-WMI paper: breakdown
  + hint_steps + many `try-and-eliminate` `visual` bindings.

## `breakdown` per question
- `needsVisual`: `true` if the question relies on a figure / spatial reasoning / counting
  objects; `false` for pure arithmetic / word problems.
- `highlights`: 2–3, each `{category, phrase_en, phrase_id, note_en, note_id}`.
  **`category` ∈ `fact` | `condition` | `question` | `object` ONLY — NEVER `clue`/`trap`.**
  `object`=a thing/landmark; `question`=the ask; `fact`=a given number/value;
  `condition`=a constraint/rule. `phrase_en` MUST be an EXACT substring of `body_en`
  (`phrase_id` of `body_id`) — verbatim, no paraphrase.
- `quantities[]`: `{label_en, label_id, value}` deriving the answer step by step.
- `strategy{name_en, name_id}`; `trap{wrong, why_en, why_id}` or `null`;
  `answer{form, unit, value}` — `form:"choice"` + letter for MCQ; `form:"value"` + the value
  for `fill_in`.

## `hint_steps_en` / `hint_steps_id`
3–5 short steps that DEDUCE the answer (givens → arithmetic → result). Natural Indonesian.

## `visual` template bindings (only where they FIT — read the template's params)
Templates in `src/components/wmi/PastPapers/WMI/templates/`:
- `try-and-eliminate` — non-figure arithmetic/logic (check candidates / chain facts).
  **REQUIRED params — ALL of these eight are required (copy this exact shape from
  `db/seed/ikmc/papers/2019-contest-preecolier.json`):**
  ```json
  "params": {
    "intro_en": "<one-line strategy>", "intro_id": "<id>",
    "items": [ { "text_en": "A: …check… ✓/✗", "text_id": "…", "ok": false }, … one per choice; ok:true for the correct one … ],
    "final_en": "<one-line conclusion naming the answer>", "final_id": "<id>",
    "aria_en": "<short screen-reader summary>", "aria_id": "<id>"
  }
  ```
  Do NOT omit `final_*` or `aria_*`. Do NOT invent `{question, candidates, hint}` — both FAIL validation.
- `count-one-by-one` — count discrete objects. `clock-face` — clock times.
  `hundreds-chart` — 1–100 number charts.
Add `"visual": {templateId, params}` — the binding key is **`templateId`** (NOT `template`)
— to questions that clearly fit (most non-figure arithmetic/logic questions → `try-and-eliminate`). Copy the param shape from the IKMC /
SASMO references. Do NOT force figure questions — they get bespoke SVG in Phase 2.

## Answer gate
Independently verify each answer against the `answer` already in the file (the official
key). If yours disagrees, do NOT change it — FLAG that question number.

## Verify
Valid JSON; every `category` ∈ {fact,condition,question,object}; every phrase an exact
substring; `cd <worktree> && npm run wmi:validate 2>&1 | grep -iE '<file>|All papers valid|✗'`
→ ✓ for this file.

## Report (≤12 lines)
N/N questions done + validate ✓; highlight category counts; how many `visual` bindings (+
which template); any answer mismatch flagged.
