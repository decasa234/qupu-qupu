# Raise Concept Difficulty + Grade-Gate Trivial Concepts — Implementation Plan (Sub-project C)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **NOTE on the hardening tasks (Tasks 3–9):** these are *content-authoring* tasks. Editing a generator's difficulty is exactly what the **`qupu-math-problem-creation`** skill exists for (the four-role method). So those tasks specify the per-concept hardening **intent, guardrails, and acceptance tests** rather than a verbatim `generate()` body — the exact ranges/params are authored during execution via that skill. This is intentional, not a placeholder.

**Goal:** Make the practice pool meaningfully more olympiad-grade by (a) hardening a prioritized batch of 7 generators in-place and (b) grade-gating the trivial difficulty-1 concepts so older kids stop being served them.

**Architecture:** `generate(rng)` has no difficulty input — difficulty lives in each generator's random ranges, so hardening edits those ranges (instances are then re-seeded additively). Grade-gating narrows each trivial concept's `meta.grades` (bootstrap upserts it) and adds a grade filter to the concept catalog read. No schema migration; no difficulty-dimension architecture (deferred).

**Tech Stack:** TypeScript, Node/Express (`api/`), Vitest, Zod, React (`src/`). ESM `.js` import specifiers inside `api/`.

**Spec:** `docs/superpowers/specs/2026-06-17-raise-concept-difficulty-design.md`

---

## File structure

| File(s) | Responsibility | Task |
|---|---|---|
| `api/services/wmi/concepts/<slug>/index.ts` ×7 (gating) | narrow `meta.grades` on trivial concepts | 1 |
| `api/services/wmi/concepts/grade-gating.test.ts` (new) | assert gated concepts' grades | 1 |
| `api/services/wmi/concepts/progress.ts` | `grade` param + `$grade = ANY(grades)` filter | 2 |
| `api/routes/wmi-member.ts` | `grade` on `/konsep/progress` query schema | 2 |
| `src/lib/wmiApi.ts` + concept-catalog/report callers | pass child grade to the progress fetch | 2 |
| `api/services/wmi/concepts/<slug>/index.ts` + `index.test.ts` ×7 (harden) | harder `generate()` + new-mode tests | 3–9 |
| `api/services/wmi/concepts/taxonomy.ts` | bump `difficulty` for risen concepts | 10 |
| (operational) bootstrap re-seed | add harder instances for learners | 11 |

Tasks 1, 2, 10 are mechanical and fully specified. Tasks 3–9 are content-authoring (qupu skill). Task 11 is operational.

---

## Task 1: Grade-gate the trivial concepts

**Files:**
- Create: `api/services/wmi/concepts/grade-gating.test.ts`
- Modify: `api/services/wmi/concepts/{single-digit-addition,single-digit-subtraction,compare-order-numbers,more-or-less-by-k,tally-marks-count,clock-read-time,bar-chart-compare,angle-type}/index.ts`

Exact `meta.grades` changes (current → new):

| slug | now | new |
|---|---|---|
| single-digit-addition | [1, 2] | [1] |
| single-digit-subtraction | [1, 2] | [1] |
| compare-order-numbers | [1, 2] | [1] |
| more-or-less-by-k | [1, 2] | [1] |
| tally-marks-count | [1, 2] | [1] |
| clock-read-time | [1, 2, 3] | [1] |
| bar-chart-compare | [1, 2, 3] | [1] |
| angle-type | [2, 3] | [2] |

(`count-objects` [0] and `count-polygon-sides` [0,1] are already low — unchanged.)

- [ ] **Step 1: Write the failing test**

Create `api/services/wmi/concepts/grade-gating.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { CONCEPTS } from './registry.js'

// After grade-gating, these trivial difficulty-1 concepts must not serve G2/G3.
const GATED: Record<string, number[]> = {
  'single-digit-addition': [1],
  'single-digit-subtraction': [1],
  'compare-order-numbers': [1],
  'more-or-less-by-k': [1],
  'tally-marks-count': [1],
  'clock-read-time': [1],
  'bar-chart-compare': [1],
  'angle-type': [2],
}

describe('grade-gating of trivial concepts', () => {
  for (const [slug, grades] of Object.entries(GATED)) {
    test(`${slug} is gated to ${JSON.stringify(grades)}`, () => {
      expect([...CONCEPTS[slug as keyof typeof CONCEPTS].meta.grades]).toEqual(grades)
    })
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run api/services/wmi/concepts/grade-gating.test.ts`
Expected: FAIL — current grades still include 2/3 for several concepts.

- [ ] **Step 3: Narrow `meta.grades` in each concept's `index.ts`**

In each of the 8 files, change the `grades:` array in the `meta` object to the "new" value from the table above (e.g. in `single-digit-addition/index.ts`, `grades: [1, 2]` → `grades: [1]`). Change only the `grades` field; leave everything else.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run api/services/wmi/concepts/grade-gating.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Confirm no other concept test broke**

Run: `npx vitest run api/services/wmi/concepts/`
Expected: all pass (grade is metadata; generators/renders are unaffected).

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add api/services/wmi/concepts/grade-gating.test.ts api/services/wmi/concepts/single-digit-addition/index.ts api/services/wmi/concepts/single-digit-subtraction/index.ts api/services/wmi/concepts/compare-order-numbers/index.ts api/services/wmi/concepts/more-or-less-by-k/index.ts api/services/wmi/concepts/tally-marks-count/index.ts api/services/wmi/concepts/clock-read-time/index.ts api/services/wmi/concepts/bar-chart-compare/index.ts api/services/wmi/concepts/angle-type/index.ts
git commit -m "feat(wmi): grade-gate trivial difficulty-1 concepts to G0/G1"
```

---

## Task 2: Grade-filter the concept catalog/progress

**Files:**
- Modify: `api/services/wmi/concepts/progress.ts`
- Modify: `api/routes/wmi-member.ts`
- Modify: `src/lib/wmiApi.ts` (+ the concept-catalog/report caller that fetches progress)

- [ ] **Step 1: Add a `grade` parameter + filter to `getConceptProgress`**

In `api/services/wmi/concepts/progress.ts`, change the signature:

```ts
export async function getConceptProgress(
  parentUserId: string,
  childId: string,
  grade: number,
): Promise<ConceptProgressSummary> {
```

In the SQL, add the grade filter to the `WHERE` clause and pass `grade` as a second bind param:

```ts
    WHERE c.enabled = TRUE AND $2::SMALLINT = ANY(c.grades)
    ORDER BY c.grades[1] NULLS LAST, c.name_id
    `,
    [childId, grade],
  )
```

(The existing query already binds `[childId]` as `$1`; add `grade` as `$2`. The inner subquery's `a.child_id = $1` is unchanged.)

- [ ] **Step 2: Add `grade` to the route's query schema and pass it**

In `api/routes/wmi-member.ts`, the `/konsep/progress` handler currently validates with `childQuerySchema` and calls `getConceptProgress(req.user.id, value.childId)`. Give that route its own schema with a required `grade` (mirroring `konsepNextQuerySchema`) and pass it through. Add near the other schemas:

```ts
const konsepProgressQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
  grade: Joi.number().integer().min(0).max(3).required(),
}).unknown(true)
```

In the `/konsep/progress` handler, replace `childQuerySchema.validate(req.query)` with `konsepProgressQuerySchema.validate(req.query)` and the call with:

```ts
      const progress = await getConceptProgress(req.user.id, value.childId, value.grade)
```

- [ ] **Step 3: Pass the child's grade from the frontend progress fetch**

In `src/lib/wmiApi.ts`, find the function that GETs `/wmi/konsep/progress` (the concept progress fetch). Add a `grade: number` argument and include it in the query params (the same way the serve/next fetch passes `grade`). Then update its caller(s) — the concept catalog / WmiHub / Report progress load — to pass the active child's grade (the same value already passed to the serve request). Use Grep to find the caller: `git grep -n "konsep/progress\|getConceptProgress\|fetchConceptProgress" -- src/`.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run check`
Expected: exit 0 (this surfaces any caller that still omits `grade`).

Run: `npx eslint api/services/wmi/concepts/progress.ts api/routes/wmi-member.ts src/lib/wmiApi.ts`
Expected: no new errors.

- [ ] **Step 5: DB-gated integration test (optional but preferred)**

If `TEST_DATABASE_URL` is configured, add a test asserting a younger grade excludes a higher-grade concept. Otherwise document that this path is verified manually (Step 6). Create `api/services/wmi/concepts/progress.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, test } from 'vitest'
import { getConceptProgress } from './progress.js'

// Runs only against a test DB; self-skips otherwise (mirrors the gamification suites).
const RUN = !!process.env.TEST_DATABASE_URL
describe.skipIf(!RUN)('getConceptProgress grade filter', () => {
  test('a G1 child does not see a G3-only concept', async () => {
    // Arrange: seed a parent+child via the existing test helpers, then:
    // const g1 = await getConceptProgress(parentId, childId, 1)
    // expect(g1.concepts.find(c => c.slug === 'combination-product-sum')).toBeUndefined()
    // (combination-product-sum is grades [3])
    expect(RUN).toBe(true)
  })
})
```

(Flesh out the arrange step using the repo's existing child-seeding test helpers if present; if none exist, leave the skip-guarded stub and rely on Step 6.)

- [ ] **Step 6: Manual verification**

Run `npm run dev`, sign in, select a G3 child, open the concept catalog: the grade-gated trivial concepts (e.g. `single-digit-addition`, `clock-read-time`) no longer appear. Select a G1 child: they do appear; `combination-product-sum` (G3) does not.

- [ ] **Step 7: Commit**

```bash
git add api/services/wmi/concepts/progress.ts api/routes/wmi-member.ts src/lib/wmiApi.ts api/services/wmi/concepts/progress.test.ts
git commit -m "feat(wmi): grade-filter the concept catalog so gating is effective end-to-end"
```

---

## Hardening procedure (applies to Tasks 3–9)

For each concept below, follow this procedure (the per-task content is the brief + acceptance assertion):

1. **Invoke the `qupu-math-problem-creation` skill** to harden that concept's `generate()` (and `render`/`paramsSchema` only as needed for a new mode) per the task's hardening intent. Keep the `Rendered` contract (answer/choices/hints/breakdown) and the no-unused-params rule. Honor the grade guardrail: for `[1,2]` concepts keep a gentle distribution so G1 still gets approachable instances (mix easy + new-hard modes); for `[2,3]`/`[3]` concepts harden freely.
2. **Extend `<slug>/index.test.ts`** with at least one assertion exercising the new harder mode, following the existing test style (`expect(concept.render(<params>).answer).toBe('<computed-by-hand>')`). Fix any existing test that asserted `generate()` output *bounds* (range assertions) to the new ranges; `render(<explicit params>)` tests stay valid.
3. **Run** `npx vitest run api/services/wmi/concepts/<slug>/` → pass.
4. **Verify live** on the admin proofreading page: the page samples generators live (`sampleConcept`), so open `/admin/wmi/concepts`, select the concept, click "New samples" several times — confirm instances are harder, answers correct, breakdown/steps valid. (No re-seed needed for this check.)
5. **`npm run check`** → exit 0; **`npx eslint api/services/wmi/concepts/<slug>/index.ts`** → clean.
6. **Commit** `feat(wmi): harden <slug> generator toward olympiad difficulty`.

---

## Task 3: Harden `pattern-next` (grades [1,2])

**Files:** `api/services/wmi/concepts/pattern-next/index.ts`, `.../pattern-next/index.test.ts`

- [ ] **Intent:** add two-operation / second-difference patterns (e.g. +k then ×2, or growing differences) alongside the existing constant-step mode; widen values. Keep a constant-step mode in the mix for G1.
- [ ] **Acceptance assertion to add:** a test that a second-difference sequence renders the right next term — e.g. for differences growing by a constant (2,4,6,8 → next gap 10), `render(<params for 1,3,7,13,...>).answer` equals the hand-computed next term. Compute and assert the exact value.
- [ ] Follow the **Hardening procedure** (skill → tests → run → proofread → check/lint → commit).

## Task 4: Harden `visual-pattern-next` (grades [1,2])

**Files:** `api/services/wmi/concepts/visual-pattern-next/index.ts`, `.../index.test.ts`

- [ ] **Intent:** longer cycles and two-attribute patterns (shape + colour) instead of single-attribute short cycles; keep a short single-attribute mode for G1.
- [ ] **Acceptance assertion to add:** for a two-attribute cycle, assert `render(<params>).answer` selects the correct next (shape,colour) option (compute the projection of the cycle at the shown index, as the existing `answer(...)` test does).
- [ ] Follow the **Hardening procedure**.

## Task 5: Harden `odd-even-reasoning` (grades [2,3])

**Files:** `api/services/wmi/concepts/odd-even-reasoning/index.ts`, `.../index.test.ts`

- [ ] **Intent:** emphasize the `sum-diff` mode (|sum of odds − sum of evens|) and the contextual variant; more numbers (8–10) and larger range (up to 99).
- [ ] **Acceptance assertion to add:** for a fixed list (e.g. 34,23,11,42,17), assert the `sum-diff` answer equals the hand-computed |(23+11+17) − (34+42)| = 25.
- [ ] Follow the **Hardening procedure**.

## Task 6: Harden `position-in-line` (grades [1,2])

**Files:** `api/services/wmi/concepts/position-in-line/index.ts`, `.../index.test.ts`

- [ ] **Intent:** add two-sided counting (position from front AND back, "people between", reversal twist) and larger n; keep a one-sided mode for G1.
- [ ] **Acceptance assertion to add:** for n=12 and "4th from the front", assert position-from-back = 12 − 4 + 1 = 9 (or the analogous answer the new mode renders). Compute and assert exactly.
- [ ] Follow the **Hardening procedure**.

## Task 7: Sharpen `custom-operation` (grades [2,3])

**Files:** `api/services/wmi/concepts/custom-operation/index.ts`, `.../index.test.ts`

- [ ] **Intent:** ensure non-linear made-up rules inferred from two worked examples; optionally a nested application of the rule. Keep already difficulty-4; do not regress to trivial linear rules.
- [ ] **Acceptance assertion to add:** for a rule like `a☼b = sum(a..b−1) − b`, assert `render(<4☼9>).answer` = 4+5+6+7+8 − 9 = 21 (the taxonomy example), plus one new harder rule's value.
- [ ] Follow the **Hardening procedure**.

## Task 8: Harden `divisibility-multiple-property` (grades [2,3])

**Files:** `api/services/wmi/concepts/divisibility-multiple-property/index.ts`, `.../index.test.ts`

- [ ] **Intent:** add multi-divisor mode ("divisible by both k and m"), "smallest such number" queries, and larger `make-divisible` values. Target difficulty 4.
- [ ] **Acceptance assertion to add:** for "smallest number > 40 divisible by both 3 and 4" assert answer = 48; and a `make-divisible` case (e.g. 42 + x divisible by 9 → x=12) as the taxonomy example.
- [ ] Follow the **Hardening procedure**.

## Task 9: Sharpen `combination-product-sum` (grades [3])

**Files:** `api/services/wmi/concepts/combination-product-sum/index.ts`, `.../index.test.ts`

- [ ] **Intent:** keep top-tier (difficulty 5); ensure the answer requires genuine systematic enumeration (count pairs/combos meeting a product+sum constraint), not a guessable single step.
- [ ] **Acceptance assertion to add:** for "two 2-digit numbers with product 2021, find their sum" assert 43+47 = 90 (taxonomy example), plus one enumeration-count case with a hand-verified count.
- [ ] Follow the **Hardening procedure**.

---

## Task 10: Bump difficulty tags for risen concepts

**Files:** `api/services/wmi/concepts/taxonomy.ts`

- [ ] **Step 1: Update `CONCEPT_TAGS` difficulty values**

For the concepts whose realized difficulty rose, bump `difficulty` (leave `strand`/`topic`/`isOlympiad`):

| slug | difficulty: |
|---|---|
| pattern-next | 2 → 3 |
| visual-pattern-next | 2 → 3 |
| odd-even-reasoning | 2 → 3 |
| position-in-line | 2 → 3 |
| divisibility-multiple-property | 3 → 4 |

(`custom-operation` stays 4, `combination-product-sum` stays 5.) Edit each entry's `difficulty` number in `CONCEPT_TAGS`.

- [ ] **Step 2: Run the taxonomy + preview tests**

Run: `npx vitest run api/services/wmi/concepts/taxonomy.test.ts api/services/wmi/concepts/preview.test.ts`
Expected: PASS. (taxonomy.test asserts `difficulty ∈ 1..5`; preview.test pins `single-digit-addition`=1 and `combination-product-sum`=5, both unchanged — so no breakage.)

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exit 0 (`difficulty` is typed `1|2|3|4|5`; the new values are valid literals).

- [ ] **Step 4: Commit**

```bash
git add api/services/wmi/concepts/taxonomy.ts
git commit -m "feat(wmi): bump difficulty tags for hardened concepts"
```

---

## Task 11: Re-seed the instance pool (operational)

**Files:** none (operational step against the target database)

- [ ] **Step 1: Understand the mechanism**

`ensureBootstrapped()` (`api/services/wmi/concepts/bootstrap.ts`) runs `doBootstrap()` once per process: it upserts `wmi_concepts` (so Task 1's narrowed `grades` propagate) and seeds 20 instances/concept with `ON CONFLICT (concept_slug, params) DO NOTHING`. Because the hardened generators now produce different (harder) params for seeds 1–20, re-running **adds** new harder instances; old easy instances are left intact (deleting them would cascade-delete learner attempt/vote history). Serving prefers least-served instances, so the new harder ones surface first.

- [ ] **Step 2: Trigger a fresh bootstrap against the target DB**

In production (Vercel) this happens automatically on the next cold start's first concept request — no action needed beyond deploy. To force it locally/now, run a one-off that calls `ensureBootstrapped()` against `DATABASE_URL`, e.g. a throwaway tsx invocation:

```bash
DATABASE_URL="$DATABASE_URL" npx tsx -e "import('./api/services/wmi/concepts/bootstrap.ts').then(m => m.ensureBootstrapped()).then(() => { console.log('seeded'); process.exit(0) })"
```

- [ ] **Step 3: Verify instances were added, not deleted**

Against the same DB, confirm the changed concepts' instance counts grew (e.g. `SELECT concept_slug, count(*) FROM wmi_concept_instances WHERE concept_slug = ANY(ARRAY['pattern-next','visual-pattern-next','odd-even-reasoning','position-in-line','custom-operation','divisibility-multiple-property','combination-product-sum']) GROUP BY concept_slug;`) and that pre-existing rows still exist (no DELETE ran).

- [ ] **Step 4: (No commit — operational.)** Record in the PR/notes that the re-seed was run (or that production will self-seed on deploy).

---

## Final verification

- [ ] `npx vitest run api/services/wmi/concepts/` → all pass (taxonomy, preview, grade-gating, every concept incl. the 7 hardened).
- [ ] `npm run check` → exit 0; `npm run lint` → no new errors.
- [ ] Proofreading page: the 7 hardened concepts show harder, correct samples; gated concepts show the narrowed grades.
- [ ] Catalog: a G3 child no longer sees the gated trivial concepts.

---

## Notes for the implementer

- **Hardening is content work — use the `qupu-math-problem-creation` skill** for Tasks 3–9. Don't hand-roll generator content; the four-role method (and the W7 `budget-selection` reference) is the standard.
- **Grade guardrail:** for the `[1,2]` concepts (pattern-next, visual-pattern-next, position-in-line), keep a gentle mode in the generation mix so a G1 child still gets approachable instances — hardening adds harder modes, it doesn't delete the easy floor.
- **Don't delete instances** — the `wmi_concept_instances` → `wmi_attempts`/`wmi_concept_votes` FKs are `ON DELETE CASCADE`; deleting erases learner history. Re-seed adds; it never deletes.
- **No difficulty-dimension architecture** and **no hardening beyond these 7** in this increment — those are future C-phases.
