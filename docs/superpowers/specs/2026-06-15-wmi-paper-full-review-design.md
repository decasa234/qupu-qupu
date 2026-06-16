# WMI Paper Full Review — Conventions

**Date:** 2026-06-15
**Goal:** Deep, gate-by-gate re-review of all 22 WMI paper seed files
(`db/seed/wmi/papers/*.json`), recording findings inline as a top-level `review`
field on each paper. Review-only — notes, not fixes.

## Scope

All 22 papers, every question (~550). Nothing is treated as pre-approved.
Each paper, once reviewed, is marked `status: "needs_changes"` — meaning
"not yet signed off; here are my notes." The human flips it to approved later.

## The `review` field (top-level, per paper)

```jsonc
"review": {
  "status": "needs_changes",     // every reviewed paper
  "reviewed_on": "2026-06-15",
  "summary": "1–2 line paper verdict",
  "findings": [
    { "q": 14, "severity": "blocker", "gate": "answer",
      "note": "What's wrong + the fix." }
  ]
}
```

- `severity` ∈ `blocker` | `warning` | `nit`
  - `blocker` — wrong answer, broken figure logic, missing required content.
  - `warning` — substring/parity break, weak/asserted steps, schema drift.
  - `nit` — polish (wording, glyph style, headroom).
- `gate` ∈ `answer` | `figure` | `breakdown` | `steps` | `bilingual` | `registry`.
- A clean paper still gets `status: "needs_changes"`, `findings: []`, and a
  summary saying it looks clean pending sign-off.

## Per-question rubric (the gates)

1. **answer** — independently solve; flag if my result ≠ key, or the answer is
   figure-dependent and the figure can't be verified.
2. **figure** — reconstruction matches the source; numbers in the figure equal
   `quantities`/`answer`; renders with headroom (Gate 1 of the conversion skill).
3. **breakdown** — every `highlights[].phrase_en/id` is an exact substring of the
   display body (`parseWmiMarkup(stripSectionLabels(body))`); `quantities`
   reconcile; `trap` is a genuine tempting wrong answer or `null`.
4. **steps** — `hint_steps_en/id` present, ~3–5 lines, deductive (not asserted),
   last line states the answer, both languages.
5. **bilingual** — body/choices en+id parity; `figure_url` file exists.
6. **registry** — component wired in `registry.ts` where a question references one.

Carry forward known blockers from memory: 2023-G3 Q12/Q14, 2022-G3 Q18.

## Safety

`validate-papers.ts` and `load.ts` both `JSON.parse(...) as PaperFile` and read
only named fields, so a top-level `review` key is ignored by validation, by
seeding, and never reaches the DB. `npm run check` does not type-check JSON.
After each paper, `npm run wmi:validate` must still pass.

## Execution

Deep, sequential, in-context, one paper at a time. Calibrate on the first paper
(`2019-final-g1.json`) and confirm depth/shape before continuing.
