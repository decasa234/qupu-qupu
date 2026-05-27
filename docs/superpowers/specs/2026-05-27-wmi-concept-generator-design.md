# WMI Concept Generator — v2 Design

**Date:** 2026-05-27
**Status:** Approved (brainstorm)
**Author:** Vico (with Claude)
**Prior art:** [`2026-05-27-wmi-practice-area-design.md`](./2026-05-27-wmi-practice-area-design.md) (v1 — past-paper practice, PR #3)
**Branch:** `feat/wmi-concept-generator`

## Context

v1 shipped a past-paper practice area: drill + exam + bilingual glossary spoiler, members-only, in child-profile context. Five tables (`wmi_papers`, `wmi_questions`, `wmi_glossary_terms`, `wmi_exam_sessions`, `wmi_attempts`), five frontend routes under `/latihan/wmi/*`, hand-authored seed papers.

v1 deliberately scoped to "practice past papers only". The original brainstorm captured a bigger vision: kids practice the **core concepts** behind WMI questions, not just memorize specific past papers. Concepts get procedurally generated instances so the practice well never runs dry. Kids 👍/👎 questions so bad variants get culled and good ones stay in rotation. The catalog grows over time as concepts are authored.

v2 builds that surface. Past-paper drill stays at `/latihan/wmi` unchanged. Concept practice gets its own surface at `/latihan/wmi/konsep` with one button: tap → get a question from a random concept enabled for the kid's grade → answer → optionally vote → next.

## Goals

- Kids practice the underlying math concepts, not just past-paper questions, so the pool of valid practice is effectively infinite within each concept.
- Each concept is hand-authored as a TypeScript module: a generator (random params), a render function (bilingual question text + answer), and an optional React illustration component.
- Generated question instances persist in the database. Per-instance 👍/👎 votes accumulate; bad instances auto-cull at a defined threshold; good ones stay in rotation.
- The concept catalog ships small (8 starter concepts spanning Grade 0-3, both answer types, including one with an illustration) and grows via future PRs.
- Past-paper drill, exam, glossary, ID translation spoiler, and child-switch behavior from v1 stay completely unchanged.

## Non-goals (v2)

- Admin UI for concept editing (concepts evolve via PRs; the `wmi_concepts.enabled` boolean is the kill switch).
- Adaptive difficulty / skill estimation / spaced repetition.
- Concept-level cull (auto-disabling concepts whose population-level upvote rate craters). Per-instance cull is enough for the v2 catalog size.
- Exam-style concept sessions ("10 concept questions, timed"). Drill UX only.
- Gamification wiring — concept attempts award nothing (matches past-paper drill behavior). Will wire in v3 if engagement is strong.
- Concept prerequisites / dependency tree.
- Translation spoiler for concept questions (text is short enough to render bilingually inline).
- Inline figures inside question body.
- Multi-figure questions (the schema holds one illustration component per concept; the component can render multiple sub-figures internally if needed).
- Per-kid concept preferences (down-vote at the instance level is the only signal).

## Architecture

Three layers running on top of v1's WMI infrastructure:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Frontend                                                                 │
│ /latihan/wmi/konsep                                                      │
│ ├── WmiKonsepHub (single "Latihan Konsep" button — entry point)          │
│ ├── WmiKonsepDrill (drill page)                                          │
│ │   ├── WmiQuestionView (reused from v1)                                 │
│ │   ├── Illustration component (looked up from concept registry by slug) │
│ │   └── WmiVoteButtons (👍 / 👎 in feedback panel after answering)       │
│ ├── src/components/wmi/concepts/registry.ts   (slug → Illustration)      │
│ ├── src/components/wmi/concepts/<slug>.tsx    (one Illustration / slug)  │
│ └── src/components/wmi/figures/ (Square, DotArray, … shared primitives)  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ /api/me/wmi/konsep/*
┌──────────────────────────────────▼──────────────────────────────────────┐
│ Backend                                                                  │
│ api/services/wmi/concepts/                                               │
│ ├── engine.ts        (pick, generate, persist, serve, cull, vote)        │
│ ├── registry.ts      (slug → ConceptLogic, backend-only)                 │
│ ├── rng.ts           (seedable mulberry32 PRNG)                          │
│ ├── types.ts         (ConceptLogic<Params>, Rng interface)               │
│ ├── bootstrap.ts     (idempotent registry ↔ DB reconcile)                │
│ └── <slug>/index.ts  (one per concept: meta, generate, render,           │
│                       paramsSchema — NO React)                           │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│ DB (Approach B — hybrid)                                                 │
│ NEW: wmi_concepts                                                        │
│      wmi_concept_instances (with GENERATED is_culled column)             │
│      wmi_concept_votes                                                   │
│ ALTER: wmi_attempts (add nullable concept_instance_id, allow             │
│         mode='concept', CHECK exactly one of question_id /               │
│         concept_instance_id is set)                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

**Concept logic** lives in `api/services/wmi/concepts/<slug>/index.ts` and exposes pure TS: `meta`, `paramsSchema`, `generate(rng)`, `render(params)`. No React, no DB calls. The backend imports these.

**Concept illustration** lives in `src/components/wmi/concepts/<slug>.tsx` and exports an `Illustration({ params })` React component. The frontend's illustration registry maps slug → component. Backend never imports `.tsx`.

The two halves connect via the **slug** — both registries are keyed by the same string. Adding a concept means: write the backend logic file, add a registry entry; write the frontend `.tsx` (if illustration needed), add a frontend registry entry. If the frontend forgets a registry entry, that concept renders as text-only (graceful — see error handling #15).

**Engine** owns all runtime logic: which concept to pick for this kid right now, whether to serve a persisted instance or generate a fresh one, how to upsert votes, how to keep `is_culled` in sync.

**DB tables** hold runtime tunables (`wmi_concepts`), persisted question instances (`wmi_concept_instances`), and per-(kid, instance) votes (`wmi_concept_votes`). The v1 `wmi_attempts` table gains one nullable column so concept attempts and past-paper attempts live in the same row stream — unified per-child analytics, single attempt-logging path.

## Tech stack

Same as v1: Express + pg (ESM with `.js` import suffixes), React 18 + Vite + Tailwind + React Router 7, Joi for server validation, zustand + axios on the client, Postgres via the existing `pg.Pool`. One new dev dependency: `zod` for `paramsSchema` validation at generate time (zod is already in the codebase per `package.json`). No other new dependencies.

## Concept module contract

A concept is split across two files keyed by slug:

### Backend logic — `api/services/wmi/concepts/<slug>/index.ts`

```typescript
// api/services/wmi/concepts/single-digit-addition/index.ts
import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(1).max(9),
  b: z.number().int().min(1).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'single-digit-addition',
  name_en: 'Single-digit addition',
  name_id: 'Penjumlahan satu angka',
  grades: [1, 2] as const,
  description_id: 'Latihan menambah dua angka satuan.',
} as const

export function generate(rng: Rng): Params {
  return { a: rng.int(1, 9), b: rng.int(1, 9) }
}

export function render(params: Params) {
  return {
    body_en: `What is ${params.a} + ${params.b}?`,
    body_id: `Berapa ${params.a} + ${params.b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.a + params.b),
    hint_en: 'Count up from the larger number.',
    hint_id: 'Hitung naik dari angka yang lebih besar.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
```

### Frontend illustration — `src/components/wmi/concepts/single-digit-addition.tsx`

Optional. Only needed if the concept renders an illustration. If omitted, the question renders text-only.

```tsx
// src/components/wmi/concepts/single-digit-addition.tsx
import DotArray from '../figures/DotArray'
import type { Params } from '../../../../api/services/wmi/concepts/single-digit-addition'

export default function Illustration({ params }: { params: Params }) {
  return <DotArray totalDots={params.a + params.b} grouping={[params.a, params.b]} />
}
```

The frontend imports the `Params` type from the backend module (types only, stripped at compile time — no runtime import of backend code).

**Key properties:**

- **`Rng`** is a seedable PRNG (`mulberry32`, ~5 lines). Tests pass a fixed seed → deterministic params.
- **`paramsSchema`** validates generator output before persistence. Garbage params can't be stored.
- **`render(params)` is pure** — same params always produce the same text + answer.
- **Rendered strings are persisted**, not re-computed at read time. Reason: cheaper read path + frozen content if `render()` logic changes in a future deploy.
- **`Illustration`** is a React component, imported **only by the frontend** registry. The backend never imports `.tsx` files — it stores `concept_slug` + `params` and the frontend looks up the component.
- **Glossary markup** (`[[slug]]`, `[[slug|label]]`) is supported in any text field — v1's `WmiQuestionView` already handles it.

The backend registry imports every backend logic module:

```typescript
// api/services/wmi/concepts/registry.ts
import singleDigitAddition from './single-digit-addition/index.js'
import singleDigitSubtraction from './single-digit-subtraction/index.js'
// …

export const CONCEPTS = {
  'single-digit-addition': singleDigitAddition,
  'single-digit-subtraction': singleDigitSubtraction,
  // …
} as const

export type ConceptSlug = keyof typeof CONCEPTS
```

The frontend registry imports every illustration component (optional per concept):

```typescript
// src/components/wmi/concepts/registry.ts
import type { ComponentType } from 'react'
import SingleDigitAdditionIllustration from './single-digit-addition'
import CountObjectsIllustration from './count-objects'
import ShapePerimeterSquareIllustration from './shape-perimeter-square'
// …concepts without illustrations are simply absent from this map

export const ILLUSTRATIONS: Record<string, ComponentType<{ params: unknown }>> = {
  'single-digit-addition': SingleDigitAdditionIllustration,
  'count-objects': CountObjectsIllustration,
  'shape-perimeter-square': ShapePerimeterSquareIllustration,
}
```

`WmiKonsepDrill` looks up `ILLUSTRATIONS[concept_slug]` and renders it if present.

## Database schema

The migration number is whatever comes after master's current head at land-time (currently planned as `0021_wmi_concepts.sql`).

```sql
BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- WMI Concept Generator (v2)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wmi_concepts (
  slug              TEXT PRIMARY KEY,                       -- matches registry key
  name_en           TEXT NOT NULL,
  name_id           TEXT NOT NULL,
  description_id    TEXT,
  grades            SMALLINT[] NOT NULL,
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  param_overrides   JSONB,
  total_served      INT NOT NULL DEFAULT 0,
  total_upvotes     INT NOT NULL DEFAULT 0,
  total_downvotes   INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concepts_grades_valid CHECK (
    grades <@ ARRAY[0,1,2,3]::SMALLINT[] AND array_length(grades, 1) > 0
  )
);

CREATE TABLE IF NOT EXISTS wmi_concept_instances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_slug    TEXT NOT NULL REFERENCES wmi_concepts(slug) ON DELETE CASCADE,
  params          JSONB NOT NULL,
  body_en         TEXT NOT NULL,
  body_id         TEXT NOT NULL,
  answer_type     TEXT NOT NULL CHECK (answer_type IN ('multiple_choice','fill_in')),
  choices_en      JSONB,
  choices_id      JSONB,
  answer          TEXT NOT NULL,
  hint_en         TEXT,
  hint_id         TEXT,
  served_count    INT NOT NULL DEFAULT 0,
  upvotes         INT NOT NULL DEFAULT 0,
  downvotes       INT NOT NULL DEFAULT 0,
  is_culled       BOOLEAN GENERATED ALWAYS AS (
    (upvotes + downvotes) >= 5
    AND downvotes::numeric / NULLIF(upvotes + downvotes, 0) > 0.5
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concept_instances_params_unique UNIQUE (concept_slug, params)
);

CREATE INDEX idx_wmi_concept_instances_serve
  ON wmi_concept_instances (concept_slug, is_culled, served_count)
  WHERE is_culled = FALSE;

CREATE TABLE IF NOT EXISTS wmi_concept_votes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  concept_instance_id UUID NOT NULL REFERENCES wmi_concept_instances(id) ON DELETE CASCADE,
  vote                SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  voted_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concept_votes_kid_instance_unique UNIQUE (child_id, concept_instance_id)
);

CREATE INDEX idx_wmi_concept_votes_instance ON wmi_concept_votes (concept_instance_id);

-- ─── ALTER wmi_attempts to participate in concept attempts ───

ALTER TABLE wmi_attempts ALTER COLUMN question_id DROP NOT NULL;

ALTER TABLE wmi_attempts
  ADD COLUMN concept_instance_id UUID REFERENCES wmi_concept_instances(id) ON DELETE CASCADE;

ALTER TABLE wmi_attempts DROP CONSTRAINT IF EXISTS wmi_attempts_mode_check;
ALTER TABLE wmi_attempts ADD CONSTRAINT wmi_attempts_mode_check
  CHECK (mode IN ('drill','exam','concept'));

ALTER TABLE wmi_attempts ADD CONSTRAINT wmi_attempts_exactly_one_target
  CHECK (
    (question_id IS NOT NULL AND concept_instance_id IS NULL)
    OR (question_id IS NULL AND concept_instance_id IS NOT NULL)
  );

CREATE INDEX idx_wmi_attempts_concept_instance
  ON wmi_attempts (concept_instance_id)
  WHERE concept_instance_id IS NOT NULL;

COMMIT;
```

`db/schema.sql` mirrors this section after the v1 WMI block.

**Key schema points:**

1. `(concept_slug, params)` UNIQUE — generator can re-roll the same `{a:3, b:7}` and we won't double-persist. `ON CONFLICT (concept_slug, params) DO NOTHING` returns no row; generator retries with new seed.
2. `is_culled` is a GENERATED column — Postgres computes it on every row update. The cull formula lives in one place (the SQL definition) and changes only via migration. Application code never derives `is_culled`.
3. Vote upserts use `ON CONFLICT (child_id, concept_instance_id) DO UPDATE SET vote = EXCLUDED.vote, voted_at = NOW()`. Kids can flip 👍↔👎.
4. After a vote upsert, the engine recomputes `upvotes`/`downvotes` from `wmi_concept_votes` and writes back to the instance in the same transaction.
5. `wmi_attempts` retains its purpose — one row per answer event, points at either a past-paper question OR a concept instance via mutually-exclusive nullable FKs.

## API surface

Two new endpoints on the existing `wmi-member` router (auth + child-ownership pattern identical to v1):

### `GET /api/me/wmi/konsep/next?childId=<uuid>`

Returns the next question for this kid.

**Response:**
```json
{
  "success": true,
  "data": {
    "concept_instance_id": "uuid",
    "concept_slug": "single-digit-addition",
    "params": { "a": 3, "b": 7 },
    "body_en": "What is 3 + 7?",
    "body_id": "Berapa 3 + 7?",
    "answer_type": "fill_in",
    "choices_en": null,
    "choices_id": null,
    "hint_en": "Count up from the larger number.",
    "hint_id": "Hitung naik dari angka yang lebih besar."
  }
}
```

Never returns `answer`, `upvotes`, `downvotes`, or `is_culled`. Mirrors v1's drill-side answer-hiding pattern.

**Errors:**
- `400` — missing/invalid `childId`
- `401` — unauthenticated
- `403` — child not owned by authenticated parent
- `404` — no enabled concepts for the kid's grade (body: `konsep belum tersedia untuk kelas <N>`)

### `POST /api/me/wmi/attempts` (existing endpoint, expanded)

The existing `attemptSchema` gains:
- `mode` enum now includes `'concept'`
- `concept_instance_id: Joi.string().uuid()` — required when `mode === 'concept'`, forbidden otherwise (use `Joi.when`)
- `question_id` — required when `mode ∈ {'drill', 'exam'}`, forbidden when `mode === 'concept'`

Service branches on `mode === 'concept'`:
- Look up the answer from `wmi_concept_instances` instead of `wmi_questions`
- Insert into `wmi_attempts` with `concept_instance_id` set and `question_id = NULL`
- No exam-session linkage (concept practice has no session model)

### `POST /api/me/wmi/konsep/vote`

```json
{ "childId": "uuid", "concept_instance_id": "uuid", "vote": 1 }
```

`vote` is `1` (👍) or `-1` (👎). Same ownership check as `next`. Upsert into `wmi_concept_votes`, recompute denormalized counters, return `{ upvotes, downvotes }` (does not leak `is_culled` to the client).

## Data flow

### Bootstrap (idempotent, runs at startup or first concept request)

```
for each slug in CONCEPTS:
  INSERT INTO wmi_concepts (slug, name_en, name_id, description_id, grades, ...)
  ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_id = EXCLUDED.name_id,
    description_id = EXCLUDED.description_id,
    grades = EXCLUDED.grades,
    updated_at = NOW()
  -- enabled and param_overrides are NOT overwritten — admin DB edits win

for each slug in CONCEPTS:
  for seed in 1..20:
    params = generate(mulberry32(seed))
    if paramsSchema.parse(params) succeeds:
      rendered = render(params)
      INSERT into wmi_concept_instances
        (concept_slug, params, body_en, body_id, answer_type,
         choices_en, choices_id, answer, hint_en, hint_id)
        VALUES (slug, params, rendered.body_en, ...)
        ON CONFLICT (concept_slug, params) DO NOTHING
```

Bootstrap is **idempotent by construction** — the `(concept_slug, params)` UNIQUE on `wmi_concept_instances` makes re-running with the same 20 deterministic seeds a no-op. On the first deploy, 20 rows land per concept. On every subsequent deploy, those same 20 rows already exist and the inserts no-op. Adding a new concept on a later deploy seeds its 20 rows then.

No `seeded_at` or `bootstrapped_at` tracking column is needed — the schema constraint is the source of truth.

**Bootstrap dispatch:** Vercel serverless functions don't have a `listen()` startup — each function instance handles requests on demand and Fluid Compute reuses instances across requests but still requires a first-request init. The engine uses a **module-level promise latch**:

```ts
// api/services/wmi/concepts/bootstrap.ts
let bootstrapPromise: Promise<void> | null = null
export function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) bootstrapPromise = doBootstrap()
  return bootstrapPromise
}
```

The first call to `GET /api/me/wmi/konsep/next` awaits `ensureBootstrapped()` before doing anything. Subsequent calls on the same Node process resolve immediately. On a cold start (new function instance), bootstrap runs once and adds ~200–500ms latency to the first request; warm starts incur zero overhead. The local dev server (via `npm run dev`) hits the same code path on its first request, so dev and prod behavior match exactly.

If bootstrap throws (e.g., DB unreachable), the promise rejects and subsequent calls retry from a fresh `null`. The engine logs the failure but doesn't crash the function — the request returns 503 `konsep belum siap, coba lagi` and the next request retries the bootstrap.

### Per-request: kid taps "Latihan Konsep"

```
GET /api/me/wmi/konsep/next?childId=<uuid>
  │
  ├─ assertChildOwnership(parent, childId)
  ├─ kidGrade = children.grade  (fallback to 0 if NULL)
  │
  ├─ Pick concept:
  │   SELECT slug FROM wmi_concepts
  │   WHERE enabled = TRUE AND kidGrade = ANY(grades)
  │   ORDER BY random() LIMIT 1
  │   → if none, return 404
  │
  ├─ Pick instance for that concept:
  │   SELECT i.*
  │   FROM wmi_concept_instances i
  │   LEFT JOIN wmi_attempts a
  │     ON a.concept_instance_id = i.id AND a.child_id = $childId
  │   WHERE i.concept_slug = $slug
  │     AND i.is_culled = FALSE
  │     AND a.id IS NULL                       -- kid hasn't attempted yet
  │   ORDER BY i.served_count ASC, random()
  │   LIMIT 1
  │
  ├─ If no instance found (kid has seen all unculled for this concept):
  │   call generator with a fresh seed
  │   INSERT into wmi_concept_instances ON CONFLICT DO NOTHING
  │   retry up to 5 times with new seeds on collision
  │   if all 5 collide: fall back to kid's oldest-attempted instance for this concept
  │     (graceful re-encounter, never returns 5xx)
  │
  ├─ UPDATE wmi_concept_instances SET served_count = served_count + 1 WHERE id = $id
  ├─ UPDATE wmi_concepts          SET total_served  = total_served + 1 WHERE slug = $slug
  │
  └─ Return { concept_instance_id, concept_slug, params, body_*, choices_*, hint_*, answer_type }
```

### Kid answers

```
POST /api/me/wmi/attempts { childId, mode: 'concept', concept_instance_id, selected_answer, time_taken_ms? }
  │
  ├─ assertChildOwnership(parent, childId)
  ├─ Load answer from wmi_concept_instances WHERE id = $concept_instance_id
  ├─ Compute is_correct = (lower(trim(selected)) == lower(trim(stored_answer)))
  └─ INSERT into wmi_attempts (child_id, concept_instance_id, mode='concept', selected_answer, is_correct, time_taken_ms)
     question_id is NULL; CHECK constraint enforces exactly-one-target.

Returns { is_correct, correct_answer, hint_en, hint_id }.
```

### Kid votes

```
POST /api/me/wmi/konsep/vote { childId, concept_instance_id, vote: 1 | -1 }
  │
  ├─ assertChildOwnership(parent, childId)
  │
  ├─ withTransaction:
  │   old_vote = SELECT vote FROM wmi_concept_votes WHERE child_id = $1 AND concept_instance_id = $2
  │
  │   INSERT INTO wmi_concept_votes (child_id, concept_instance_id, vote)
  │   VALUES ($1, $2, $3)
  │   ON CONFLICT (child_id, concept_instance_id)
  │   DO UPDATE SET vote = EXCLUDED.vote, voted_at = NOW();
  │
  │   UPDATE wmi_concept_instances
  │     SET upvotes   = (SELECT count(*) FROM wmi_concept_votes WHERE concept_instance_id = $2 AND vote =  1),
  │         downvotes = (SELECT count(*) FROM wmi_concept_votes WHERE concept_instance_id = $2 AND vote = -1)
  │     WHERE id = $2;
  │
  │   UPDATE wmi_concepts
  │     SET total_upvotes   = total_upvotes   + (new_up_delta),
  │         total_downvotes = total_downvotes + (new_down_delta)
  │     WHERE slug = $concept_slug;
  │
  └─ Return { upvotes, downvotes }  -- does NOT leak is_culled
```

### Frontend never sees

- Vote totals before the kid votes (avoids bandwagon effect).
- The correct answer in the `next` payload.
- `is_culled` on any payload.

## Error handling

| # | Failure mode | Detection | Response |
|---|---|---|---|
| 1 | Generator throws | try/catch around `generate(rng)` | Log `{concept_slug, seed, error}`; retry with new seed; if 2nd fails, re-roll concept selection (max 3 concept rolls before returning 503) |
| 2 | `paramsSchema.parse` rejects generator output | Schema validation right after generate | Same as #1 |
| 3 | Generator produces dupe params 5× in a row | `ON CONFLICT DO NOTHING` returns no row | Serve the kid's oldest-attempted instance for this concept. Log `{concept_slug, pool_exhausted: true}` |
| 4 | No concepts enabled for kid's grade | "Pick concept" returns empty | 404 `konsep belum tersedia untuk kelas <N>`. Frontend shows empty state with link to past-paper drill |
| 5 | `children.grade` is NULL | Read returns null | Fall back to grade 0 (mirrors v1) |
| 6 | Invalid `concept_instance_id` on attempt POST | FK lookup returns null | 404 `Question not found` (mirrors v1's `Question not found` path) |
| 7 | Vote arrives for an instance the kid has never been served | `concept_instance_id` exists | Accept it. No logical reason to bind votes to a flow that served them |
| 8 | Concept declares `grades: [99]` or empty | Migration CHECK | INSERT fails loudly. Engine never sees invalid grades at runtime |
| 9 | Generated answer disagrees with MC options | Self-check during render | Concept-author bug — surfaces in per-concept tests, not production |
| 10 | Race: two simultaneous `next` requests serve the same instance | `served_count` UPDATE non-atomic across reads | Acceptable — both kids see the same question, both get logged, counter goes up by 2. No corruption. Switch to `SELECT … FOR UPDATE SKIP LOCKED` only if it becomes a real problem |
| 11 | Race: kid double-votes rapidly | UNIQUE `(child_id, instance_id)` + ON CONFLICT DO UPDATE | Latest tap wins. Counter recompute is in the same txn so no torn state |
| 12 | Race: vote arrives during cull-threshold transition | GENERATED column `is_culled` recomputes in the same row update | Inherently consistent — Postgres computes from the same `upvotes`/`downvotes` being written |
| 13 | Concept module's `render()` logic changes between deploys | Stored `body_*` strings are frozen at persistence time | Old instances keep their old text. To re-render: `DELETE FROM wmi_concept_instances WHERE concept_slug = '…'`, let bootstrap re-seed |
| 14 | Kid logs out / switches child mid-flow | v1 child-switch already handles | The next `next` request re-resolves `childId` cleanly |
| 15 | Partial deploy: API returns a slug the frontend's illustration registry doesn't know | Frontend lookup returns undefined | Render question without illustration (text-only). Log warning. Avoids hard crash during rolling deploys |
| 16 | Stale registry: DB has a slug with no matching TS module | Engine references `wmi_concepts` then `CONCEPTS[slug]` | If `CONCEPTS[slug]` is undefined when serving, skip those instances and re-roll concept. DB row stays for audit (or admin sets `enabled=false`) |
| 17 | Concept uses non-seeded RNG (e.g., `Math.random()` instead of the passed `Rng`) | Determinism test fails | Caught by per-concept test; never reaches prod |

## Operational visibility

No admin UI in v2. Three documented SQL snippets cover ops needs (README in `db/seed/wmi/` updated):

```sql
-- Concepts ranked by serve volume
SELECT slug, total_served, total_upvotes, total_downvotes,
       round(total_upvotes::numeric / NULLIF(total_upvotes + total_downvotes, 0), 2) AS up_rate
FROM wmi_concepts ORDER BY total_served DESC;

-- Culled instance count per concept (find concepts whose generator is too noisy)
SELECT concept_slug, count(*) AS culled
FROM wmi_concept_instances WHERE is_culled
GROUP BY concept_slug ORDER BY culled DESC;

-- Worst-rated instances still active (manual review candidates)
SELECT concept_slug, params, body_id, upvotes, downvotes
FROM wmi_concept_instances
WHERE NOT is_culled AND (upvotes + downvotes) >= 3
ORDER BY downvotes::numeric / NULLIF(upvotes + downvotes, 0) DESC LIMIT 20;
```

To disable a concept:
```sql
UPDATE wmi_concepts SET enabled = FALSE WHERE slug = '<slug>';
```

To purge a concept's instances and force re-seed on next deploy:
```sql
DELETE FROM wmi_concept_instances WHERE concept_slug = '<slug>';
```

## Testing strategy

Master shipped vitest infrastructure (`vitest.config.ts`, `api/__tests__/setup.ts`, fixtures helpers). v2 ships with tests.

### Per-concept (one file per concept)

`api/services/wmi/concepts/<slug>/index.test.ts` covers determinism, param-schema validity over 100 seeds, answer correctness over 100 seeds, and MC-option-label consistency. ~30 lines per concept, all checks deterministic, no DB.

### Engine (one file)

`api/services/wmi/concepts/engine.test.ts` exercises the runtime with the test-DB harness from `api/__tests__/setup.ts`:

- Serves unculled instances when available
- Prefers lower `served_count`
- Skips instances the kid has already attempted
- Generates fresh when kid exhausts pool
- Falls back to oldest-attempted on 5× generator dupe collision
- Returns 404 when no concept matches the kid's grade
- Vote upsert flips counters; vote crossing threshold flips `is_culled`

### HTTP integration (one file)

`api/__tests__/wmi/konsep.test.ts` covers auth/ownership errors, payload shape (no `answer` leak), mode-discriminated `wmi_attempts` insert, vote endpoint upsert semantics.

### Out of test scope (manual verification)

- Illustration component rendering — eyeball during `/qa`.
- Frontend integration — manual smoke through the drill flow.
- Performance — no pool will hit scale before /ship.

## Starter concept catalog

Eight concepts, spanning all four grades and both answer types.

| # | Slug | Grades | Answer | Illustration | Question shape |
|---|---|---|---|---|---|
| 1 | `count-objects` | 0 | MC | `<DotArray>` | "Ada berapa apel?" with N icons. Choices: N−1, N, N+1, N+2 |
| 2 | `single-digit-addition` | 1, 2 | fill-in | none | "Berapa A + B?" A,B ∈ [1,9] |
| 3 | `single-digit-subtraction` | 1, 2 | fill-in | none | "Berapa A − B?" A ∈ [2,9], B ∈ [1, A−1] |
| 4 | `pattern-next` | 1, 2 | MC | none | "2, 4, 6, ?" — arithmetic sequences, common difference ∈ [1,3], length 4 |
| 5 | `digit-sum` | 1, 2 | fill-in | none | "Berapa jumlah angka dari N?" N ∈ [10, 99] (mirrors v1 seeded paper Q2) |
| 6 | `shape-perimeter-square` | 2, 3 | MC | `<Square>` | "Keliling persegi dengan sisi N?" N ∈ [2,9] (mirrors v1 seeded paper Q1) |
| 7 | `place-value` | 2, 3 | MC | none | "Berapa nilai angka di tempat puluhan dari N?" N ∈ [10,99] |
| 8 | `multiplication-small` | 3 | fill-in | none | "Berapa A × B?" A,B ∈ [2,5] |

This catalog gives:
- Both answer types (4 fill-in, 4 MC) — exercises both rendering paths
- Grade-0 entry (#1) — visual counting, minimal reading required
- Grade-3 graduation (#8) — small multiplication tables
- Two reusable illustration primitives (`<DotArray>`, `<Square>`)
- Continuity with v1 past papers — #5 and #6 parallel the seeded `2024-grade-1-final.json` questions, so kids feel concept practice is "more of the same kind of thing"

## File plan

### Backend new files

```
api/services/wmi/concepts/
├── types.ts                              -- ConceptLogic<P>, Rng interface
├── rng.ts                                -- mulberry32 + helpers (int, pick, shuffle)
├── registry.ts                           -- CONCEPTS map (one import per concept)
├── bootstrap.ts                          -- idempotent registry ↔ DB reconcile + 20-instance seed
├── engine.ts                             -- pick concept, serve/generate instance, vote handlers
├── engine.test.ts                        -- engine tests (test-DB)
├── count-objects/index.ts                -- concept logic (no React)
├── count-objects/index.test.ts           -- per-concept tests
├── single-digit-addition/index.ts
├── single-digit-addition/index.test.ts
├── single-digit-subtraction/index.ts
├── single-digit-subtraction/index.test.ts
├── pattern-next/index.ts
├── pattern-next/index.test.ts
├── digit-sum/index.ts
├── digit-sum/index.test.ts
├── shape-perimeter-square/index.ts
├── shape-perimeter-square/index.test.ts
├── place-value/index.ts
├── place-value/index.test.ts
├── multiplication-small/index.ts
└── multiplication-small/index.test.ts

api/__tests__/wmi/konsep.test.ts          -- HTTP integration tests

db/migrations/0021_wmi_concepts.sql       -- migration (number TBD at land time)
```

### Backend modified files

```
api/routes/wmi-member.ts                  -- new endpoints, expanded attemptSchema
api/services/wmi/attempts.ts              -- branch on mode === 'concept'
db/schema.sql                             -- mirror migration
```

### Frontend new files

```
src/pages/WmiKonsepHub.tsx                          -- single "Latihan Konsep" button
src/pages/WmiKonsepDrill.tsx                        -- drill page; reuses WmiQuestionView
src/components/wmi/WmiVoteButtons.tsx               -- 👍 / 👎 in feedback panel

src/components/wmi/concepts/
├── registry.ts                                     -- slug → Illustration component (frontend)
├── count-objects.tsx                               -- Illustration for count-objects
├── single-digit-addition.tsx                       -- Illustration (optional; this one omits)
└── shape-perimeter-square.tsx                      -- Illustration for shape-perimeter-square
  (concepts without illustrations have no file here — frontend renders text-only)

src/components/wmi/figures/
├── Square.tsx                                      -- shared primitive
└── DotArray.tsx                                    -- shared primitive
```

### Frontend modified files

```
src/pages/WmiHub.tsx                      -- add "Latihan Konsep" card
src/App.tsx                               -- add /latihan/wmi/konsep routes
src/lib/wmiApi.ts                         -- fetchConceptNext, submitConceptVote, expanded submitAttempt
src/types/wmi.ts                          -- new types for concept payload
```

### Unchanged from v1

- `api/services/wmi/papers.ts`, `sessions.ts`, `glossary.ts`
- `api/routes/wmi-public.ts`
- `api/lib/childOwnership.ts`
- `db/seed/wmi/*` (past-paper seed content)
- All past-paper frontend pages and components
- `api/app.ts` (router already mounted)

## Sub-decisions summary

| Question | Decision |
|---|---|
| Where do generated questions surface? | New dedicated page `/latihan/wmi/konsep`. Past-paper drill at `/latihan/wmi` unchanged. |
| How are concepts authored? | TS modules + DB tunables (registry imports modules; `wmi_concepts` row holds `enabled`, `grades`, `param_overrides`, counters) |
| When are instances generated? | Pre-seed 20 per concept on first deploy; lazy refill when kid exhausts unculled pool for a concept |
| What's the kid's flow? | One button "Latihan Konsep" → system picks random concept enabled for kid's grade → next question |
| Catalog size for v2? | 8 starter concepts |
| Cull rule? | `is_culled` = (total_votes ≥ 5 AND downvotes/total > 0.5), enforced as GENERATED column |
| Gamification? | Neutral for v2 (no coin/streak/quest contribution), same as past-paper drill. Will wire in v3. |
| Schema shape? | Approach B — new concept tables, reuse `wmi_attempts` with nullable `concept_instance_id` |
| Where does vote UI appear? | Inside the feedback panel after the kid answers, optional (kid can skip vote and continue) |
| Can kids re-vote? | Yes — `ON CONFLICT (child_id, concept_instance_id) DO UPDATE` flips the vote |
| Generator dupe handling? | Retry up to 5 times with new seed; fallback to kid's oldest-attempted instance |
| Stale registry handling? | Skip and re-roll if `CONCEPTS[slug]` is undefined; DB row stays for audit |

## Strategic risks

1. **Authoring effort doesn't scale.** Each concept takes ~1-2 hours to design, write, illustrate, and test. 8 concepts is fine for v2; reaching parity with WMI past-paper coverage (~50+ concepts) is a multi-week effort. Mitigated by: shipping the engine first so the catalog can grow incrementally without re-engineering.

2. **Kids don't actually vote.** Grade 0-3 kids may ignore the 👍/👎 buttons, leaving the cull rule unused. Mitigated by: voting is optional, drill works without it; even with low vote rates, the worst questions still get downvotes from frustrated kids; can revisit UX placement in v3.

3. **Generator quality varies.** A poorly-designed concept (e.g., generates "0 + 0" too often) produces boring instances. Mitigated by: 100-seed test in each concept's test file catches statistical anomalies; per-instance cull catches what tests miss.

4. **GENERATED column semantics differ across Postgres versions.** Requires Postgres 12+. Vercel-managed Postgres is 14+; safe.

5. **No admin UI** means killing a broken concept requires running raw SQL. Mitigated by: the kill-switch is one UPDATE statement; it's documented in the seed README. If pain becomes real, add a minimal admin page in v3.

## Acceptance criteria

- [ ] `db/migrations/0021_wmi_concepts.sql` (or next available number) applies cleanly and mirrors `db/schema.sql`
- [ ] Engine bootstrap on deploy: each concept in registry has a row in `wmi_concepts` and 20 instances in `wmi_concept_instances`
- [ ] `GET /api/me/wmi/konsep/next?childId=…` returns a fresh question for the kid's grade
- [ ] `POST /api/me/wmi/attempts { mode: 'concept', concept_instance_id, … }` logs an attempt and returns feedback
- [ ] `POST /api/me/wmi/konsep/vote` upserts a vote and updates counters; crossing 5 votes with ≥50% downvotes flips `is_culled`
- [ ] All 8 starter concepts have passing per-concept tests (determinism, 100-seed validity, MC consistency)
- [ ] Engine tests cover pool serving, exhaustion fallback, vote semantics
- [ ] HTTP integration tests cover ownership, error paths, payload shape
- [ ] `WmiKonsepDrill` renders questions, accepts answers, surfaces vote UI, advances on "Lanjut"
- [ ] `npm run check`, `npm run lint`, `npm test` all pass
- [ ] Manual smoke: open `/latihan/wmi/konsep` on each grade, walk through 10 questions, vote on a few, observe instance variety
