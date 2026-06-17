# Raise Concept Difficulty (In-Place) + Grade-Gate Trivial Concepts — Design Spec (Sub-project C)

**Date:** 2026-06-17
**Branch:** `feat/wmi-concept-taxonomy`
**Status:** Approved structure; pending spec review before planning.
**Parent decomposition:** `docs/superpowers/specs/2026-06-16-math-olympiad-concept-taxonomy-design.md` §12 (sub-project C). Builds on the A tags (`difficulty`, `isOlympiad`).

## 1. Context

The 73 concept generators (`api/services/wmi/concepts/<slug>/index.ts`) each
expose `generate(rng): Params` and `render(params): Rendered`. Key facts that
shape this work:

- **`generate()` takes no difficulty/grade input** — difficulty is baked into
  the random-draw ranges/modes inside each generator. `meta.grades` only
  declares which grades a concept is appropriate for.
- **Instances are cached** in `wmi_concept_instances` (bootstrap seeds 20 per
  concept; the serve path also generates-and-persists on demand). Serving picks
  the least-served, non-culled instance for the concept.
- **Instances are `ON DELETE CASCADE`** from `wmi_attempts.concept_instance_id`
  and `wmi_concept_votes` — deleting an instance erases learner attempt/vote
  history. So difficulty changes must **add** instances, not delete.
- **The serve path is grade-aware:** the random "next concept" pick filters
  `WHERE enabled = TRUE AND $grade = ANY(grades)`. But the concept
  **catalog/progress** (`getConceptProgress`) lists all enabled concepts
  regardless of grade.
- **bootstrap upserts `grades`** (`ON CONFLICT (slug) DO UPDATE SET grades =
  EXCLUDED.grades`), so changing a concept's `meta.grades` propagates on the
  next bootstrap run.
- `wmi_concepts.enabled` exists; `param_overrides` exists but is unwired.

Content edits to generators MUST follow the **`qupu-math-problem-creation`**
skill (the four-role method); W7 `budget-selection` is the reference.

## 2. Goal

A **first, reviewable increment** that makes the practice pool meaningfully more
olympiad-grade, via two levers prioritized by the A tags:

1. **In-place hardening** of a prioritized batch of generators so their
   instances are harder and more olympiad-flavored.
2. **Grade-gating** the trivial (difficulty-1, non-olympiad) concepts so older
   kids stop being served them, while the youngest keep their fluency on-ramps.

### Non-goals
- A difficulty-dimension architecture (threading a `level` through
  generate/engine/serving). Deferred to a possible future C-phase.
- Hardening the remaining ~33 olympiad concepts (future increments).
- Learner-facing difficulty selection.
- Deleting/replacing cached instances (would cascade-delete history).
- The rebrand (sub-project B) and the taxonomy (sub-project A).

## 3. Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Mechanism | In-place hardening of `generate()` ranges + grade-gating; no difficulty-dimension architecture. |
| Harden batch | The "underpowered olympiad" mismatches (isOlympiad=true, difficulty 2) + a few flagship olympiad concepts — 7 total. |
| Prune | Grade-gate (narrow `meta.grades`), do **not** disable/delete. |
| Catalog | Add a grade filter to the catalog/progress so gating is effective there too. |
| Instances | Regenerate by **adding** harder instances (re-bootstrap); never delete. |

## 4. Hardening set (7 concepts)

Edit each generator's `generate()` (ranges/modes) so instances skew harder and
more olympiad-flavored, staying grade-appropriate. Exact numeric ranges are
authored during implementation per the `qupu-math-problem-creation` skill; this
spec fixes the **intent and guardrails** per concept.

| Concept | Tag (A) | Hardening intent | Target diff |
|---|---|---|--:|
| `pattern-next` | AP-NPAT, 2 | add two-operation / second-difference patterns (not only constant step); larger values | 3 |
| `visual-pattern-next` | AP-VPAT, 2 | longer cycles + two-attribute (shape+colour) patterns | 3 |
| `odd-even-reasoning` | NT-PAR, 2 | emphasize the sum-of-odds − sum-of-evens mode; more numbers; larger range | 3 |
| `position-in-line` | LR-DED, 2 | two-sided counting (front *and* back); "people between"; reversal twist; larger n | 3 |
| `custom-operation` | AP-FUNC, 4 | ensure non-linear rules inferred from 2 examples; optional nested application | 4 |
| `divisibility-multiple-property` | NT-DIV, 3 | multi-divisor ("divisible by both"), "smallest such number", larger make-divisible | 4 |
| `combination-product-sum` | CO-ARR, 5 | keep top tier; ensure genuine systematic enumeration, not guessable | 5 |

**Guardrails (all 7):**
- Stay within the concept's grade band; do not make a G0/G1-served concept
  inappropriately hard for the youngest grade it serves.
- `render(params)` must remain correct for both existing and new params.
- Preserve the `Rendered` contract (answer/choices/hints/breakdown) and the
  no-unused-params lint rule.
- Where a concept's realized difficulty rises a tier, bump its `difficulty` in
  `api/services/wmi/concepts/taxonomy.ts` to match (one-line per concept; e.g.
  pattern-next 2→3). `isOlympiad` is unchanged.

## 5. Grade-gating (trivial concepts)

For the difficulty-1, non-olympiad concepts, narrow `meta.grades` to drop G2/G3
(keep G0–G1) for those that currently extend upward:

- Candidates (current `meta.grades` from code): `single-digit-addition` [1,2],
  `single-digit-subtraction` [1,2], `compare-order-numbers` [1,2],
  `more-or-less-by-k` [1,2], `tally-marks-count` [1,2] → all cap to **[1]**;
  `clock-read-time` [1,2,3], `bar-chart-compare` [1,2,3] → cap to **[1]**;
  `angle-type` [2,3] → cap to **[2]** (no lower grade to fall to); `count-objects`
  [0] and `count-polygon-sides` [0,1] → already low, **unchanged**.
- Rule: drop G3, and drop G2 where the task is pure fluency, keeping G0/G1
  on-ramps. (Note: the A taxonomy doc said single-digit-add/sub were "G0"; the
  code says [1,2] — the code is authoritative.)
- Propagation: `meta.grades` is upserted into `wmi_concepts.grades` on the next
  bootstrap run (no migration needed).

**Catalog effectiveness:** thread the child's grade into the progress read.
There is **no `children.grade` column** — grade is a client-supplied value
throughout (the serve endpoint `/konsep/next` already takes a required `grade`
query param). So: add a `grade` query param to `/konsep/progress` (mirroring
`/konsep/next`), change `getConceptProgress(parentUserId, childId, grade)` to
filter `AND $grade = ANY(c.grades)`, and have the frontend progress-fetch caller
pass the child's grade (the same value it passes to the serve endpoint). This
makes the catalog grade-appropriate generally (a younger child no longer sees
concepts above their grade), matching the already-grade-aware serve.

## 6. Instance regeneration (non-destructive)

After hardening, the cached pool for the 7 changed concepts still contains the
old easy instances. Do **not** delete them (cascade would erase attempt/vote
history). Instead:

- Re-run the concept bootstrap seeder. Because the hardened `generate()` now
  yields different (harder) params for seeds 1–20, new instance rows are
  **added** (the `(concept_slug, params)` unique constraint just no-ops the
  unchanged ones). The same run upserts the narrowed `grades` from §5.
- Serving prefers the least-served instance (`idx … (concept_slug, is_culled,
  served_count)`), so the new harder instances (served_count 0) surface first.
- The plan identifies the exact bootstrap invocation (the existing
  `bootstrap.ts` routine) and how it is run against the target DB.

## 7. Architecture / files

- `api/services/wmi/concepts/<slug>/index.ts` ×7 — harden `generate()` (and
  `render`/schema only as needed to support new modes).
- `api/services/wmi/concepts/<slug>/index.test.ts` ×7 — extend for new
  params/modes; fix any `generate()`-bounds assertions.
- `api/services/wmi/concepts/<slug>/index.ts` ×≤8 — narrow `meta.grades`
  (grade-gating).
- `api/services/wmi/concepts/taxonomy.ts` — bump `difficulty` for concepts whose
  tier rose (§4).
- `api/services/wmi/concepts/progress.ts` — add a `grade` param + the
  `$grade = ANY(c.grades)` filter (§5); update/extend `progress`-related tests.
- `api/routes/wmi-member.ts` — add required `grade` to the `/konsep/progress`
  query schema and pass it to `getConceptProgress`.
- frontend progress-fetch caller (`src/lib/wmiApi.ts` + the concept
  catalog/report callers) — pass the child's grade (the same value already used
  for the serve request).
- Operational: re-run bootstrap (§6).

No schema migration. The `/konsep/progress` route gains one query param
(`grade`), mirroring `/konsep/next`; the frontend caller passes the grade it
already has. The admin proofreading page samples generators **live**
(`sampleConcept`), so hardening (§4) is verifiable there immediately — the
re-seed (§6) only affects what learners are served.

## 8. Verification

- `npx vitest run` for the changed concepts' tests + any progress test → pass.
- `npm run check` (tsc) → exit 0; `npm run lint` → no new errors (incl. the
  no-unused-params rule).
- Re-run bootstrap; confirm new instances added for the 7 concepts
  (`_instanceCountsForTesting` grows) and none deleted.
- Admin proofreading page (`/admin/wmi/concepts`): visually spot-check the 7
  hardened concepts across several seeds — harder + correct answers + valid
  breakdown/steps; confirm the grade-gated concepts show the narrowed grades.
- Optional manual: a G3 child's concept catalog no longer lists the gated
  trivial concepts; auto-serve to G3 no longer returns them.

## 9. Out of scope (future C-phases)
- Difficulty-dimension architecture (level param + per-learner targeting).
- Hardening the remaining olympiad concepts.
- Culling/retiring old easy instances (relies on natural served-count surfacing
  + existing downvote culling for now).

## 10. Open questions

None blocking. Exact per-concept numeric ranges (§4) and exact capped grade
arrays (§5) are authored during implementation following the
`qupu-math-problem-creation` skill — intent and guardrails are fixed here.
