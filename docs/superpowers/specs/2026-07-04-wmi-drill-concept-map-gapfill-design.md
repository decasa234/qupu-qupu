# WMI drill concept map + gap-fill practice concepts

**Date:** 2026-07-04
**Status:** approved (design)

## Problem

The 72 parameterized practice concepts (`api/services/wmi/concepts/`) already
randomize numbers per attempt (`generate(rng)`) and already carry a
`difficulty: 1–5` tag (`taxonomy.ts`). But the 42 WMI drill papers
(`db/seed/wmi/papers/`, 1050 questions, 350 per grade for G1/G2/G3) have **zero**
links to those concepts — each question carries a bespoke one-off
`breakdown.strategy.name_en` (1030 distinct strings). So:

1. There is no map from drills → concepts (can't drill-by-concept, can't see coverage).
2. We don't know which drill question-types have no practice concept.
3. Easy/Medium/Hard is not surfaced (the 1–5 tag exists but isn't bucketed).

## Goal

- **Map** every drill question to a concept type.
- **Build** parameterized practice concepts for recurring uncovered types.
- **Bucket** all concepts Easy/Medium/Hard from the existing difficulty tag.

## Non-goals (skipped)

- Rebuilding any of the 72 existing concepts.
- Per-instance difficulty scaling (each generate() emitting E/M/H instances).
- Concepts for uncovered types appearing in fewer than 3 drill questions
  (noted in the report, not built).

## Phase 1 — Map the drills

Fan out **read-only** subagents (parallel, batched by paper — e.g. one per
year, ~6 papers each) to classify every drill question. Each subagent receives:

- the label set: 72 concept slugs + their `meta` (name_en, name_id,
  description, strand, topic, difficulty) from `registry.ts` + `taxonomy.ts`.
- a batch of paper JSONs (question `body_en`, `answer_type`, `breakdown`).

Each question → one of:
- `conceptSlug` — best-matching existing concept, or
- `UNCOVERED` + a short proposed concept-type label (kebab-case) + rationale.

**Merge** into a coverage report (`docs/reference/wmi-drill-concept-map.md`):
- concept-usage histogram (which of the 72 the drills exercise, how often),
- **gap list**: `UNCOVERED` clusters grouped by proposed type, count, example
  question refs (`<year>-<round>-g<grade> #<n>`), and a suggested
  strand/topic/difficulty for each.

**Persist the map:** write the chosen slug into
`breakdown.strategy.conceptSlug` for each question in the 42 seed JSONs (field
already exists in `types.ts` `BreakdownStrategy`, empty today). `UNCOVERED`
questions get the slug of the new concept built in Phase 2 (or left null if the
cluster is below threshold).

**Checkpoint:** present the coverage report + ranked gap list to the user for
review before any concept is built.

## Phase 2 — Fill the gaps

For each uncovered cluster with **≥3 drill questions**, author a new concept
following the `budget-selection` reference and the `qupu-math-problem-creation`
skill:

- `api/services/wmi/concepts/<slug>/index.ts` — zod `paramsSchema`,
  `meta` (slug/name_en/name_id/grades/description_id), `generate(rng)`,
  `render(params)` returning `Rendered` (bilingual body, hint_steps, breakdown).
- `<slug>/breakdown.ts` — `buildBreakdown(params)`.
- `<slug>/index.test.ts` — one runnable check (answer correctness across a few
  seeds; matches existing concept test style).
- register in `registry.ts` (import + `CONCEPTS` entry).
- tag in `taxonomy.ts` `CONCEPT_TAGS` (strand/topic/difficulty/isOlympiad) and
  add a new `SHORT_ID_BY_SLUG` code (next free number in the letter series —
  never renumber existing).

Problems parameterize the *type*; they must not reproduce the drill's exact
numbers. Grades from the drill questions the cluster came from (G1/G2/G3).

## Phase 3 — Easy / Medium / Hard

Add to `taxonomy.ts`:

```ts
export type DifficultyBand = 'easy' | 'medium' | 'hard'
export function difficultyBand(d: 1|2|3|4|5): DifficultyBand {
  return d <= 2 ? 'easy' : d === 3 ? 'medium' : 'hard'
}
```

Surface the band where concepts are listed to learners (garden/curriculum) —
minimal wiring, reuses the existing per-concept `difficulty`. No new columns, no
per-attempt tiering.

## Verification

- Per new concept: `tsx` SSR smoke + the `index.test.ts` self-check
  (answer matches across seeds). Follow the figure brief rule: **do NOT** run
  full-project `tsc`/`lint`/`build` per-agent; run ONE sequential
  `node --max-old-space-size=4096 ./node_modules/.bin/tsc --noEmit` at the end.
- Map: a script asserts every drill question now has a `conceptSlug` that is
  either a real registry slug or explicitly null (below-threshold), and no slug
  is a typo (all resolve in `CONCEPTS`).

## Rollout notes (from project memory)

- Concepts are served from stored `wmi_concept_instances`; after adding
  concepts, run `regen-stale-instances.ts` (prod pending) — see
  `[[project_wmi_concept_instances]]`.
- Seed JSON changes need a prod re-import — see
  `[[project_wmi_paper_review_2026-07]]`.
