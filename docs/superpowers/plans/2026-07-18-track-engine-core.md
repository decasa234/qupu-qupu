# Track Engine Core (Plan 1 of 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the backend learning-track engine from the approved spec (`docs/superpowers/specs/2026-07-18-learning-track-engine-design.md`): track registry + validator, 5-level ladder semantics, leveled instance pools, lesson assembly with labeled recall, synthesis gates, and a track-state endpoint — with a one-concept pilot track in `draft`.

**Architecture:** A browser-safe code registry (`api/services/wmi/tracks/`) describes tracks (mode/grade/units/nodes/theme/status); pure modules implement ladder + validator logic; thin services own SQL for progress (`level` column), leveled instances, lessons, and gate clears; routes in `api/routes/wmi-member.ts` expose track state, lessons, and gates. The existing garden is untouched (spec: build beside, cut over in Plan 3).

**Tech Stack:** TypeScript ESM (`.js` import specifiers), Express + Joi at routes, pg via `api/db.ts` helpers, zod for generator params, vitest.

## Global Constraints

- Imports inside `api/` use `.js` extensions even for `.ts` files (house ESM convention).
- `api/services/wmi/tracks/` MUST stay browser-safe: no `pg`, no `api/db.ts`, no Node-only imports (the frontend will import it in Plan 2, like `api/services/wmi/olympiads/registry.ts`).
- Routes stay thin: Joi validation + delegation; SQL lives in services (CLAUDE.md rule).
- Pure test suites always run; Postgres suites follow the existing pattern — skip unless `TEST_DATABASE_URL` is set (see `api/__tests__/` for the idiom).
- Do NOT modify existing garden/session behavior (`garden.ts`, `session.ts`, `engine.ts`) — coexistence is a spec requirement.
- Spec constants (verbatim): 5 levels + gold (`level` 0–5, 5 = gold); lesson = 6 focus + 2 recall; pass = at most 1 miss on focus questions; gate bar = all `requires` at level ≥ 4; tier→level mapping 0→0, 1→1, 2→2, 3→4, 4→5.
- XP/coin/quest reward integration for lessons is OUT of this plan (parity required before cutover — Plan 3). Lesson commit updates concept progress + level only.
- Typecheck with `npm run check`; run only the touched vitest files per task (`npx vitest run <file>`), full suite at the end.

---

### Task 1: Track registry — types, pilot track, index

**Files:**
- Create: `api/services/wmi/tracks/types.ts`
- Create: `api/services/wmi/tracks/wmi-grade-1.ts`
- Create: `api/services/wmi/tracks/registry.ts`
- Test: `api/services/wmi/tracks/registry.test.ts`

**Interfaces:**
- Consumes: `ConceptSlug` from `../concepts/registry.js` (existing).
- Produces: `TrackDef`, `TrackUnit`, `TrackNode`, `ConceptNode`, `GateNode`, `TrackStatus`, `ThemeKey` (types.ts); `TRACKS: readonly TrackDef[]`, `getTrack(id: string): TrackDef | undefined`, `conceptSlugsInSpineOrder(track: TrackDef): string[]` (registry.ts). Later tasks import these exact names.

- [ ] **Step 1: Write the failing test**

```ts
// api/services/wmi/tracks/registry.test.ts
import { describe, expect, it } from 'vitest'
import { TRACKS, getTrack, conceptSlugsInSpineOrder } from './registry.js'

describe('track registry', () => {
  it('registers the pilot track as draft', () => {
    const track = getTrack('wmi-grade-1')
    expect(track).toBeDefined()
    expect(track!.mode).toBe('wmi')
    expect(track!.grade).toBe(1)
    expect(track!.status).toBe('draft')
    expect(track!.theme).toBe('forest')
    expect(track!.units.length).toBeGreaterThan(0)
  })

  it('lists concept slugs in spine order, concepts before their gate', () => {
    const track = getTrack('wmi-grade-1')!
    const slugs = conceptSlugsInSpineOrder(track)
    expect(slugs).toEqual(['single-digit-addition'])
    const gate = track.units[0].nodes.find((n) => n.kind === 'gate')
    expect(gate).toBeDefined()
  })

  it('getTrack returns undefined for unknown ids', () => {
    expect(getTrack('nope')).toBeUndefined()
  })

  it('every registered track id is unique', () => {
    const ids = TRACKS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run api/services/wmi/tracks/registry.test.ts`
Expected: FAIL — cannot resolve `./registry.js`.

- [ ] **Step 3: Write the implementation**

```ts
// api/services/wmi/tracks/types.ts
//
// Learning-track registry types. BROWSER-SAFE: no pg / Node imports — the
// frontend imports this module directly (like olympiads/registry.ts).
// Spec: docs/superpowers/specs/2026-07-18-learning-track-engine-design.md

export type TrackMode = 'wmi' // 'basic-math' arrives with its first track
export type TrackStatus = 'draft' | 'review' | 'published'
export type ThemeKey = 'forest' // 'ocean' | 'zoo' arrive with their packs (Plan 2)

export interface ConceptNode {
  kind: 'concept'
  slug: string
}

// Synthesis boss: a real WMI past-paper problem, unlocked when every
// `requires` concept reaches GATE_BAR_LEVEL (see tracks/ladder.ts).
export interface GateNode {
  kind: 'gate'
  /** Stable per-track key — gate clears are stored against it. */
  key: string
  /** Past-paper reference: `${paperCode}#${questionNumber}`, e.g. 'WMI-21F1A#7'. */
  problemRef: string
  /** Concept slugs (from anywhere EARLIER in the spine) this problem decomposes into. */
  requires: readonly string[]
}

export type TrackNode = ConceptNode | GateNode

export interface TrackUnit {
  key: string
  nameId: string
  nameEn: string
  colorHex: string
  /** Font Awesome 6 free icon name, without the `fa-` prefix (house style). */
  iconKey: string
  nodes: readonly TrackNode[]
}

export interface TrackDef {
  id: string
  mode: TrackMode
  grade: 1 | 2 | 3
  status: TrackStatus
  theme: ThemeKey
  nameId: string
  nameEn: string
  units: readonly TrackUnit[]
}
```

```ts
// api/services/wmi/tracks/wmi-grade-1.ts
//
// PILOT track — engine vertical slice only. Real grade-1 curriculum content
// (WMI problem decomposition into atomic concepts) is sub-project 2 and will
// replace/extend these units. Stays `draft`: invisible to children.
import type { TrackDef } from './types.js'

const track: TrackDef = {
  id: 'wmi-grade-1',
  mode: 'wmi',
  grade: 1,
  status: 'draft',
  theme: 'forest',
  nameId: 'WMI Kelas 1',
  nameEn: 'WMI Grade 1',
  units: [
    {
      key: 'penjumlahan-dasar',
      nameId: 'Penjumlahan Dasar',
      nameEn: 'Basic Addition',
      colorHex: '#F0853A',
      iconKey: 'plus',
      nodes: [
        { kind: 'concept', slug: 'single-digit-addition' },
        {
          kind: 'gate',
          key: 'gate-penjumlahan-dasar',
          problemRef: 'WMI-21F1A#1',
          requires: ['single-digit-addition'],
        },
      ],
    },
  ],
}

export default track
```

```ts
// api/services/wmi/tracks/registry.ts
//
// All registered learning tracks. BROWSER-SAFE (see types.ts).
import type { TrackDef } from './types.js'
import wmiGrade1 from './wmi-grade-1.js'

export const TRACKS: readonly TrackDef[] = [wmiGrade1]

export function getTrack(id: string): TrackDef | undefined {
  return TRACKS.find((t) => t.id === id)
}

/** Concept slugs in the order a child meets them walking the spine. */
export function conceptSlugsInSpineOrder(track: TrackDef): string[] {
  const slugs: string[] = []
  for (const unit of track.units) {
    for (const node of unit.nodes) {
      if (node.kind === 'concept') slugs.push(node.slug)
    }
  }
  return slugs
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run api/services/wmi/tracks/registry.test.ts` → PASS. Then `npm run check` → clean.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/tracks/
git commit -m "feat(tracks): track registry types + draft pilot track"
```

---

### Task 2: Ladder semantics (pure)

**Files:**
- Create: `api/services/wmi/tracks/ladder.ts`
- Test: `api/services/wmi/tracks/ladder.test.ts`

**Interfaces:**
- Produces: `GOLD_LEVEL = 5`, `GATE_BAR_LEVEL = 4`, `FOCUS_COUNT = 6`, `RECALL_COUNT = 2`, `LESSON_SIZE = 8`, `mapTierToLevel(tier: number): number`, `passesFocus(focusResults: readonly boolean[]): boolean`, `effectiveLevel(level: number | null, bestTier: number): number`. Later tasks use these exact names.

- [ ] **Step 1: Write the failing test**

```ts
// api/services/wmi/tracks/ladder.test.ts
import { describe, expect, it } from 'vitest'
import {
  GOLD_LEVEL, GATE_BAR_LEVEL, FOCUS_COUNT, RECALL_COUNT, LESSON_SIZE,
  mapTierToLevel, passesFocus, effectiveLevel,
} from './ladder.js'

describe('ladder', () => {
  it('spec constants', () => {
    expect(GOLD_LEVEL).toBe(5)
    expect(GATE_BAR_LEVEL).toBe(4)
    expect(FOCUS_COUNT).toBe(6)
    expect(RECALL_COUNT).toBe(2)
    expect(LESSON_SIZE).toBe(8)
  })

  it('maps old tiers preserving unlock semantics (0,1,2,3→4,4→5)', () => {
    expect([0, 1, 2, 3, 4].map(mapTierToLevel)).toEqual([0, 1, 2, 4, 5])
  })

  it('clamps garbage tiers into 0..5', () => {
    expect(mapTierToLevel(-1)).toBe(0)
    expect(mapTierToLevel(9)).toBe(5)
  })

  it('one-miss pass rule on focus questions', () => {
    expect(passesFocus([true, true, true, true, true, true])).toBe(true)
    expect(passesFocus([true, false, true, true, true, true])).toBe(true)
    expect(passesFocus([false, false, true, true, true, true])).toBe(false)
    expect(passesFocus([])).toBe(false) // no evidence, no pass
  })

  it('effectiveLevel prefers the stored level, else derives from tier', () => {
    expect(effectiveLevel(3, 4)).toBe(3)
    expect(effectiveLevel(null, 3)).toBe(4)
    expect(effectiveLevel(null, 0)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run api/services/wmi/tracks/ladder.test.ts` → FAIL (module missing).

- [ ] **Step 3: Write the implementation**

```ts
// api/services/wmi/tracks/ladder.ts
//
// Pure ladder semantics (spec §Concept ladder / §Game loop). BROWSER-SAFE.
// One global rule everywhere — nothing here is per-track configurable.

export const GOLD_LEVEL = 5
export const GATE_BAR_LEVEL = 4
export const FOCUS_COUNT = 6
export const RECALL_COUNT = 2
export const LESSON_SIZE = FOCUS_COUNT + RECALL_COUNT

// Old-garden tier → ladder level, preserving unlock semantics: tier >= 3
// ("Mahir") counted as grown/gate-ready, so it lands ON the gate bar.
// 0→0, 1→1, 2→2, 3→4, 4→5. Level 3 is simply skipped for migrated progress.
export function mapTierToLevel(tier: number): number {
  const t = Math.max(0, Math.min(4, Math.trunc(tier)))
  return t >= 3 ? t + 1 : t
}

// Pass = at most 1 miss on the focus questions (never on recall questions).
// An empty result set is not a pass — no evidence, no level-up.
export function passesFocus(focusResults: readonly boolean[]): boolean {
  if (focusResults.length === 0) return false
  return focusResults.filter((r) => !r).length <= 1
}

// Stored `level` wins; a NULL level derives from the legacy tier at read
// time (the spec's migration mapping, applied lazily so coexistence never
// goes stale).
export function effectiveLevel(level: number | null, bestTier: number): number {
  return level ?? mapTierToLevel(bestTier)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run api/services/wmi/tracks/ladder.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/tracks/ladder.ts api/services/wmi/tracks/ladder.test.ts
git commit -m "feat(tracks): pure ladder semantics (5+gold, one-miss, tier mapping)"
```

---

### Task 3: Track validator (pure) + CI test over the real registry

**Files:**
- Create: `api/services/wmi/tracks/validate.ts`
- Test: `api/services/wmi/tracks/validate.test.ts`

**Interfaces:**
- Consumes: `TrackDef` (Task 1).
- Produces: `validateTrack(track: TrackDef, deps: ValidatorDeps): string[]` (empty array = valid) and `interface ValidatorDeps { conceptExists(slug: string): boolean; conceptHasLevels(slug: string): boolean; problemRefExists(ref: string): boolean }`. Deps are injected so the module stays pure/browser-safe; the CI test wires real deps.

- [ ] **Step 1: Write the failing test**

```ts
// api/services/wmi/tracks/validate.test.ts
import { describe, expect, it } from 'vitest'
import { validateTrack, type ValidatorDeps } from './validate.js'
import { TRACKS } from './registry.js'
import { getConcept } from '../concepts/registry.js'
import { hasLevelGeneration } from '../concepts/levels.js'
import type { TrackDef } from './types.js'

const okDeps: ValidatorDeps = {
  conceptExists: () => true,
  conceptHasLevels: () => true,
  problemRefExists: () => true,
}

const base: TrackDef = {
  id: 't', mode: 'wmi', grade: 1, status: 'draft', theme: 'forest',
  nameId: 'T', nameEn: 'T',
  units: [{
    key: 'u1', nameId: 'U', nameEn: 'U', colorHex: '#000000', iconKey: 'plus',
    nodes: [
      { kind: 'concept', slug: 'a' },
      { kind: 'gate', key: 'g1', problemRef: 'P#1', requires: ['a'] },
    ],
  }],
}

describe('validateTrack', () => {
  it('accepts a well-formed track', () => {
    expect(validateTrack(base, okDeps)).toEqual([])
  })

  it('rejects unknown concept slugs', () => {
    const errs = validateTrack(base, { ...okDeps, conceptExists: () => false })
    expect(errs.join(' ')).toMatch(/unknown concept/i)
  })

  it('rejects concepts without level generation', () => {
    const errs = validateTrack(base, { ...okDeps, conceptHasLevels: () => false })
    expect(errs.join(' ')).toMatch(/level/i)
  })

  it('rejects gate requires that do not appear earlier in the spine', () => {
    const bad: TrackDef = {
      ...base,
      units: [{
        ...base.units[0],
        nodes: [
          { kind: 'gate', key: 'g1', problemRef: 'P#1', requires: ['a'] },
          { kind: 'concept', slug: 'a' },
        ],
      }],
    }
    expect(validateTrack(bad, okDeps).join(' ')).toMatch(/earlier in the spine/i)
  })

  it('rejects unresolvable problemRefs and malformed refs', () => {
    expect(
      validateTrack(base, { ...okDeps, problemRefExists: () => false }).join(' '),
    ).toMatch(/problemRef/i)
    const malformed: TrackDef = {
      ...base,
      units: [{
        ...base.units[0],
        nodes: [
          { kind: 'concept', slug: 'a' },
          { kind: 'gate', key: 'g1', problemRef: 'no-hash', requires: ['a'] },
        ],
      }],
    }
    expect(validateTrack(malformed, okDeps).join(' ')).toMatch(/problemRef/i)
  })

  it('rejects duplicate gate keys and duplicate concept slugs', () => {
    const dup: TrackDef = {
      ...base,
      units: [{
        ...base.units[0],
        nodes: [
          { kind: 'concept', slug: 'a' },
          { kind: 'concept', slug: 'a' },
          { kind: 'gate', key: 'g1', problemRef: 'P#1', requires: ['a'] },
          { kind: 'gate', key: 'g1', problemRef: 'P#2', requires: ['a'] },
        ],
      }],
    }
    const errs = validateTrack(dup, okDeps)
    expect(errs.join(' ')).toMatch(/duplicate/i)
  })
})

// CI gate: every REGISTERED track must validate against the real registries.
// problemRef existence needs the DB, so statically we check format only —
// the Postgres suite (Task 6) covers live resolution.
describe('registered tracks are valid', () => {
  it('validates every track in TRACKS', () => {
    for (const track of TRACKS) {
      const errs = validateTrack(track, {
        conceptExists: (slug) => getConcept(slug) !== undefined,
        conceptHasLevels: (slug) => hasLevelGeneration(slug),
        problemRefExists: (ref) => /^[A-Z0-9-]+#\d+$/.test(ref),
      })
      expect(errs, `track ${track.id}`).toEqual([])
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run api/services/wmi/tracks/validate.test.ts` → FAIL (`validate.js` and `../concepts/levels.js` missing — Task 4 creates `levels.ts`; for now create it in Step 3 as part of this task's minimal surface).

- [ ] **Step 3: Write the implementation**

```ts
// api/services/wmi/concepts/levels.ts
//
// Per-level generation support. A concept opts into the 5-level ladder by
// registering a levelled generator here: level (1–5) → params within the
// concept's existing zod schema. Concepts NOT registered here cannot appear
// in a track (the validator refuses them). BROWSER-SAFE.
import type { Rng } from './types.js'
import { singleDigitAdditionLevels } from './single-digit-addition/levels.js'

export type LevelledGenerate = (rng: Rng, level: 1 | 2 | 3 | 4 | 5) => unknown

const LEVELLED: Record<string, LevelledGenerate> = {
  'single-digit-addition': singleDigitAdditionLevels,
}

export function hasLevelGeneration(slug: string): boolean {
  return slug in LEVELLED
}

export function getLevelGeneration(slug: string): LevelledGenerate | undefined {
  return LEVELLED[slug]
}
```

```ts
// api/services/wmi/concepts/single-digit-addition/levels.ts
//
// Level ladder for single-digit-addition. Same param schema ({a,b} ∈ 1..9);
// difficulty climbs by operand size and ten-bridging:
//   L1: both ≤ 4, no bridge (sum ≤ 8)     L2: both ≤ 6
//   L3: any operands, sum ≤ 10            L4: always bridges ten (sum ≥ 11)
//   L5: always bridges, both operands ≥ 5 (hardest single-digit facts)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function singleDigitAdditionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return { a: rng.int(1, 4), b: rng.int(1, 4) }
    case 2: return { a: rng.int(1, 6), b: rng.int(1, 6) }
    case 3: {
      const a = rng.int(1, 9)
      return { a, b: rng.int(1, Math.max(1, 10 - a)) }
    }
    case 4: {
      const a = rng.int(2, 9)
      return { a, b: rng.int(Math.max(1, 11 - a), 9) }
    }
    case 5: {
      const a = rng.int(5, 9)
      return { a, b: rng.int(Math.max(5, 11 - a), 9) }
    }
  }
}
```

Note: `single-digit-addition/index.ts` currently exports `Params` as a type — confirm the export exists (`export type Params = z.infer<typeof paramsSchema>` is already there; no change needed).

```ts
// api/services/wmi/tracks/validate.ts
//
// Pure curriculum validator (spec §Domain model). Deps are injected so this
// stays browser-safe; CI wires the real registries, the Postgres suite wires
// live problemRef resolution. Returns [] when valid.
import type { TrackDef } from './types.js'

export interface ValidatorDeps {
  conceptExists(slug: string): boolean
  conceptHasLevels(slug: string): boolean
  problemRefExists(ref: string): boolean
}

const PROBLEM_REF = /^[^#\s]+#\d+$/

export function validateTrack(track: TrackDef, deps: ValidatorDeps): string[] {
  const errors: string[] = []
  const seenConcepts = new Set<string>()
  const seenGateKeys = new Set<string>()

  for (const unit of track.units) {
    for (const node of unit.nodes) {
      if (node.kind === 'concept') {
        if (seenConcepts.has(node.slug)) {
          errors.push(`duplicate concept '${node.slug}' in track '${track.id}'`)
        }
        if (!deps.conceptExists(node.slug)) {
          errors.push(`unknown concept '${node.slug}' in track '${track.id}'`)
        } else if (!deps.conceptHasLevels(node.slug)) {
          errors.push(`concept '${node.slug}' has no level generation (5-level ladder required)`)
        }
        seenConcepts.add(node.slug)
      } else {
        if (seenGateKeys.has(node.key)) {
          errors.push(`duplicate gate key '${node.key}' in track '${track.id}'`)
        }
        seenGateKeys.add(node.key)
        if (!PROBLEM_REF.test(node.problemRef) || !deps.problemRefExists(node.problemRef)) {
          errors.push(`gate '${node.key}': unresolvable problemRef '${node.problemRef}'`)
        }
        for (const req of node.requires) {
          if (!seenConcepts.has(req)) {
            errors.push(
              `gate '${node.key}': requires '${req}' which does not appear earlier in the spine`,
            )
          }
        }
      }
    }
  }
  return errors
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run api/services/wmi/tracks/validate.test.ts` → PASS (the registered-tracks case passes because the pilot track's single concept is levelled). Then `npm run check`.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/tracks/validate.ts api/services/wmi/tracks/validate.test.ts api/services/wmi/concepts/levels.ts api/services/wmi/concepts/single-digit-addition/levels.ts
git commit -m "feat(tracks): curriculum validator + levelled generation for pilot concept"
```

---

### Task 4: DB migration — level columns + gate clears

**Files:**
- Create: `db/migrations/0051_track_engine.sql`
- Modify: `db/schema.sql` (append the same DDL so fresh installs match — house convention: fresh `schema.sql` already includes all migrations)

**Interfaces:**
- Produces: `wmi_concept_progress.level SMALLINT NULL` (NULL = derive via `effectiveLevel`); `wmi_concept_instances.level SMALLINT NOT NULL DEFAULT 0` (0 = legacy unleveled pool); table `wmi_gate_clears(child_id, track_id, gate_key, cleared_at)`.

- [ ] **Step 1: Write the migration**

```sql
-- db/migrations/0051_track_engine.sql
-- Track engine (Plan 1): ladder level on progress, leveled instance pools,
-- gate clears. Spec: docs/superpowers/specs/2026-07-18-learning-track-engine-design.md

-- Ladder level 0..5 (5 = gold). NULL = not yet touched by the new engine;
-- readers derive it from best_tier via the spec mapping (0,1,2,3→4,4→5).
ALTER TABLE wmi_concept_progress
  ADD COLUMN IF NOT EXISTS level SMALLINT
  CHECK (level IS NULL OR level BETWEEN 0 AND 5);

-- Instance pools per ladder level. 0 = legacy/unleveled pool (old garden).
ALTER TABLE wmi_concept_instances
  ADD COLUMN IF NOT EXISTS level SMALLINT NOT NULL DEFAULT 0
  CHECK (level BETWEEN 0 AND 5);

CREATE INDEX IF NOT EXISTS wmi_concept_instances_slug_level_idx
  ON wmi_concept_instances (concept_slug, level);

-- One row per (child, track, gate) — passing a synthesis gate is permanent.
CREATE TABLE IF NOT EXISTS wmi_gate_clears (
  child_id   UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  track_id   TEXT NOT NULL,
  gate_key   TEXT NOT NULL,
  cleared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (child_id, track_id, gate_key)
);
```

- [ ] **Step 2: Append identical DDL to `db/schema.sql`**

Add the same three statements at the end of `db/schema.sql` under a comment header `-- Track engine (migration 0051)` (follow the file's existing migration-comment style, e.g. the 0039 note near `wmi_concept_progress`).

- [ ] **Step 3: Verify SQL syntax against a disposable database**

If `TEST_DATABASE_URL` is set locally: `psql "$TEST_DATABASE_URL" -f db/migrations/0051_track_engine.sql` twice (second run must be a no-op thanks to IF NOT EXISTS). If not set, rely on the Task 6 Postgres suite in CI.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/0051_track_engine.sql db/schema.sql
git commit -m "feat(db): track engine columns (progress.level, instances.level) + wmi_gate_clears"
```

---

### Task 5: Leveled instance pools service

**Files:**
- Create: `api/services/wmi/concepts/levelPools.ts`
- Test: `api/__tests__/levelPools.test.ts` (Postgres suite — follows the existing skip-without-`TEST_DATABASE_URL` idiom; copy the setup/teardown shape from a neighboring `api/__tests__/*.test.ts`)

**Interfaces:**
- Consumes: `getConcept` (concepts registry), `getLevelGeneration` (Task 3), rng from `./rng.js` (existing — check its export: it provides the seeded `Rng` used by `bootstrap.ts`; reuse the same constructor), `query` from `../../../db.js`.
- Produces: `ensureLevelPools(slugs: string[], perLevel?: number): Promise<void>` — for each slug × level 1..5, tops the pool up to `perLevel` (default 20) instances in `wmi_concept_instances` with the `level` column set.

- [ ] **Step 1: Write the failing Postgres test**

```ts
// api/__tests__/levelPools.test.ts
// (Wrap with the repo's standard TEST_DATABASE_URL skip guard + schema
// bootstrap used by the neighboring suites.)
import { describe, expect, it } from 'vitest'
import { query } from '../db.js'
import { ensureLevelPools } from '../services/wmi/concepts/levelPools.js'

describe('ensureLevelPools', () => {
  it('fills 5 level pools for a levelled concept and is idempotent', async () => {
    await ensureLevelPools(['single-digit-addition'], 4)
    const rows = await query<{ level: number; n: string }>(
      `SELECT level, COUNT(*) AS n FROM wmi_concept_instances
       WHERE concept_slug = $1 AND level > 0 GROUP BY level ORDER BY level`,
      ['single-digit-addition'],
    )
    expect(rows.map((r) => r.level)).toEqual([1, 2, 3, 4, 5])
    for (const r of rows) expect(Number(r.n)).toBeGreaterThanOrEqual(4)

    await ensureLevelPools(['single-digit-addition'], 4) // idempotent top-up
    const again = await query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM wmi_concept_instances WHERE concept_slug = $1 AND level > 0`,
      ['single-digit-addition'],
    )
    expect(Number(again[0].n)).toBe(Number(rows.reduce((s, r) => s + Number(r.n), 0)))
  })

  it('rejects a concept without level generation', async () => {
    await expect(ensureLevelPools(['digit-sum'])).rejects.toThrow(/level generation/)
  })
})
```

- [ ] **Step 2: Run to verify it fails** (with `TEST_DATABASE_URL` set): `npx vitest run api/__tests__/levelPools.test.ts` → FAIL.

- [ ] **Step 3: Write the implementation**

```ts
// api/services/wmi/concepts/levelPools.ts
//
// Fills per-level instance pools for levelled concepts. Mirrors bootstrap's
// insert shape but stamps the `level` column. Deduplicates by exact params
// JSON per (slug, level) — small param spaces at low levels may cap below
// perLevel; that is fine (the pool is still non-empty and the lesson picker
// samples with replacement across sessions).
import { getConcept } from './registry.js'
import { getLevelGeneration } from './levels.js'
import { makeRng } from './rng.js' // confirm exact export name in rng.ts before implementing; adjust call sites to match
import { query } from '../../../db.js'

const DEFAULT_PER_LEVEL = 20
const LEVELS = [1, 2, 3, 4, 5] as const

export async function ensureLevelPools(slugs: string[], perLevel = DEFAULT_PER_LEVEL): Promise<void> {
  for (const slug of slugs) {
    const concept = getConcept(slug)
    const levelled = getLevelGeneration(slug)
    if (!concept || !levelled) {
      throw new Error(`concept '${slug}' has no level generation — cannot build pools`)
    }
    for (const level of LEVELS) {
      const existing = await query<{ params: unknown; n: string }>(
        `SELECT params, COUNT(*) OVER () AS n FROM wmi_concept_instances
         WHERE concept_slug = $1 AND level = $2`,
        [slug, level],
      )
      const have = existing.length
      const seenParams = new Set(existing.map((r) => JSON.stringify(r.params)))
      let attempts = 0
      let made = 0
      const rng = makeRng(`${slug}:L${level}:${have}`)
      while (have + made < perLevel && attempts < perLevel * 20) {
        attempts += 1
        const params = concept.paramsSchema.parse(levelled(rng, level))
        const key = JSON.stringify(params)
        if (seenParams.has(key)) continue
        seenParams.add(key)
        const r = concept.render(params)
        await query(
          `INSERT INTO wmi_concept_instances
             (concept_slug, params, body_en, body_id, answer_type,
              choices_en, choices_id, answer, hint_en, hint_id, level)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [slug, JSON.stringify(params), r.body_en, r.body_id, r.answer_type,
           r.choices_en ? JSON.stringify(r.choices_en) : null,
           r.choices_id ? JSON.stringify(r.choices_id) : null,
           r.answer, r.hint_en, r.hint_id, level],
        )
        made += 1
      }
    }
  }
}
```

Before finalizing: open `api/services/wmi/concepts/rng.ts` and `bootstrap.ts`; match the real rng constructor name and the real instance INSERT column list (bootstrap may insert additional columns such as hint_steps/breakdown — copy its exact column set and add `level`).

- [ ] **Step 4: Run to verify it passes**: `npx vitest run api/__tests__/levelPools.test.ts` → PASS (or SKIP without `TEST_DATABASE_URL`). `npm run check`.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/concepts/levelPools.ts api/__tests__/levelPools.test.ts
git commit -m "feat(tracks): per-level instance pools for levelled concepts"
```

---

### Task 6: Track state service + endpoint

**Files:**
- Create: `api/services/wmi/tracks/trackState.ts`
- Modify: `api/routes/wmi-member.ts` (add `GET /tracks/:trackId` — inspect how the file mounts existing garden/session routes and follow its auth + Joi + error idioms exactly)
- Test: `api/__tests__/trackState.test.ts` (Postgres suite)

**Interfaces:**
- Consumes: `getTrack`, `conceptSlugsInSpineOrder` (Task 1); `effectiveLevel`, `GATE_BAR_LEVEL`, `GOLD_LEVEL` (Task 2); `query` from db; `assertChildOwnership` from `api/lib/childOwnership.js` (same guard `garden.ts` uses).
- Produces:

```ts
export interface TrackNodeState =
  | { kind: 'concept'; slug: string; nameId: string; level: number; gold: boolean }
  | { kind: 'gate'; key: string; problemRef: string; requires: string[]; unlocked: boolean; cleared: boolean }
export interface TrackUnitState { key: string; nameId: string; colorHex: string; iconKey: string; unlocked: boolean; nodes: TrackNodeState[] }
export interface TrackState { trackId: string; theme: string; status: string; units: TrackUnitState[] }
export async function getTrackState(parentUserId: string, childId: string, trackId: string): Promise<TrackState>
```

- [ ] **Step 1: Write the failing Postgres test** — seed one child; insert `wmi_concept_progress` for `single-digit-addition` with `level = 4`; assert: concept node reports level 4; the unit's gate reports `unlocked: true, cleared: false`; after inserting a `wmi_gate_clears` row, `cleared: true`. Also assert tier-derivation: a second run with `level = NULL, best_tier = 3` reports level 4 (mapping). Use the neighboring suites' setup idiom.

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

```ts
// api/services/wmi/tracks/trackState.ts  (NOT browser-safe — owns SQL)
import { pool, query } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { getTrack } from './registry.js'
import { effectiveLevel, GATE_BAR_LEVEL, GOLD_LEVEL } from './ladder.js'
import { getConcept } from '../concepts/registry.js'

// (types exactly as in the Interfaces block above)

export async function getTrackState(parentUserId: string, childId: string, trackId: string) {
  const track = getTrack(trackId)
  if (!track) throw Object.assign(new Error('track not found'), { status: 404 })
  const client = await pool.connect()
  try { await assertChildOwnership(client, parentUserId, childId) } finally { client.release() }

  const progress = await query<{ concept_slug: string; level: number | null; best_tier: number }>(
    `SELECT concept_slug, level, best_tier FROM wmi_concept_progress WHERE child_id = $1`,
    [childId],
  )
  const levelBySlug = new Map(progress.map((p) => [p.concept_slug, effectiveLevel(p.level, p.best_tier)]))
  const clears = await query<{ gate_key: string }>(
    `SELECT gate_key FROM wmi_gate_clears WHERE child_id = $1 AND track_id = $2`,
    [childId, trackId],
  )
  const cleared = new Set(clears.map((c) => c.gate_key))

  let previousGateCleared = true // first unit is always open
  const units = track.units.map((unit) => {
    const unlocked = previousGateCleared
    const nodes = unit.nodes.map((node) => {
      if (node.kind === 'concept') {
        const level = levelBySlug.get(node.slug) ?? 0
        return {
          kind: 'concept' as const, slug: node.slug,
          nameId: getConcept(node.slug)?.meta.name_id ?? node.slug,
          level, gold: level >= GOLD_LEVEL,
        }
      }
      const gateUnlocked =
        unlocked && node.requires.every((slug) => (levelBySlug.get(slug) ?? 0) >= GATE_BAR_LEVEL)
      return {
        kind: 'gate' as const, key: node.key, problemRef: node.problemRef,
        requires: [...node.requires], unlocked: gateUnlocked, cleared: cleared.has(node.key),
      }
    })
    const unitGates = nodes.filter((n) => n.kind === 'gate')
    previousGateCleared = unitGates.length === 0 ? unlocked : unitGates.every((g) => g.cleared)
    return { key: unit.key, nameId: unit.nameId, colorHex: unit.colorHex, iconKey: unit.iconKey, unlocked, nodes }
  })

  return { trackId: track.id, theme: track.theme, status: track.status, units }
}
```

Route (in `wmi-member.ts`, following its existing handler idiom — Joi param validation, `req.user!.id`, `childId` query param, standard success envelope `{ success: true, data }`):

```ts
router.get('/tracks/:trackId', async (req, res, next) => {
  try {
    const { childId } = req.query as { childId?: string }
    if (!childId) return res.status(400).json({ success: false, error: 'childId is required' })
    const data = await getTrackState(req.user!.id, childId, req.params.trackId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})
```

(Adjust the error/validation shape to match the file's existing handlers exactly — copy a neighbor.)

- [ ] **Step 4: Run test → PASS; `npm run check`.**

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/tracks/trackState.ts api/routes/wmi-member.ts api/__tests__/trackState.test.ts
git commit -m "feat(tracks): per-child track state (levels, gate locks) + endpoint"
```

---

### Task 7: Lesson assembly + commit (one-miss rule, staleness-first recall)

**Files:**
- Create: `api/services/wmi/tracks/lesson.ts`
- Create: `api/services/wmi/tracks/lessonMix.ts` (pure mix/pick logic)
- Modify: `api/routes/wmi-member.ts` (add `POST /tracks/:trackId/lessons` and `POST /tracks/:trackId/lessons/commit`)
- Test: `api/services/wmi/tracks/lessonMix.test.ts` (pure), `api/__tests__/trackLesson.test.ts` (Postgres)

**Interfaces:**
- Consumes: ladder constants (Task 2), track registry (Task 1), `applyAnswers` + `lockConceptProgress` from `../concepts/conceptProgress.js` (existing), instances table with `level` (Task 4).
- Produces:

```ts
// lessonMix.ts (pure, BROWSER-SAFE)
export interface RecallCandidate { slug: string; level: number; lastPracticedMs: number }
export function pickRecall(candidates: RecallCandidate[], count: number): RecallCandidate[] // staleness-first (oldest lastPracticedMs), stable
// lesson.ts
export interface LessonQuestion { instanceId: string; conceptSlug: string; level: number; recall: boolean; bodyId: string; bodyEn: string; answerType: string; choicesId: unknown; choicesEn: unknown }
export async function buildLesson(parentUserId: string, childId: string, trackId: string, focusSlug: string): Promise<{ questions: LessonQuestion[] }>
export async function commitLesson(parentUserId: string, childId: string, trackId: string, focusSlug: string, answers: Array<{ instanceId: string; selectedAnswer: string; recall: boolean }>): Promise<{ focusCorrect: number; passed: boolean; levelBefore: number; levelAfter: number }>
```

- [ ] **Step 1: Pure test for the mix**

```ts
// api/services/wmi/tracks/lessonMix.test.ts
import { describe, expect, it } from 'vitest'
import { pickRecall } from './lessonMix.js'

describe('pickRecall', () => {
  it('picks the least-recently-practiced first', () => {
    const picked = pickRecall(
      [
        { slug: 'fresh', level: 3, lastPracticedMs: 3000 },
        { slug: 'stale', level: 2, lastPracticedMs: 1000 },
        { slug: 'mid', level: 4, lastPracticedMs: 2000 },
      ],
      2,
    )
    expect(picked.map((p) => p.slug)).toEqual(['stale', 'mid'])
  })
  it('returns fewer when the pool is small, empty when none', () => {
    expect(pickRecall([{ slug: 'a', level: 1, lastPracticedMs: 1 }], 2)).toHaveLength(1)
    expect(pickRecall([], 2)).toEqual([])
  })
})
```

- [ ] **Step 2: Run pure test → FAIL; implement `lessonMix.ts`:**

```ts
// api/services/wmi/tracks/lessonMix.ts — pure, BROWSER-SAFE
export interface RecallCandidate { slug: string; level: number; lastPracticedMs: number }

export function pickRecall(candidates: RecallCandidate[], count: number): RecallCandidate[] {
  return [...candidates]
    .sort((a, b) => a.lastPracticedMs - b.lastPracticedMs)
    .slice(0, Math.max(0, count))
}
```

Run pure test → PASS.

- [ ] **Step 3: Postgres test for build+commit** (`api/__tests__/trackLesson.test.ts`): seed child + level pools for `single-digit-addition` (call `ensureLevelPools(['single-digit-addition'], 8)`); build a lesson with focus `single-digit-addition` → expect 6 questions at the child's current level, all `recall: false` (no earlier mastered concepts in the pilot); commit with answers derived from stored instance answers — 6/6 correct → `passed: true`, `levelAfter = levelBefore + 1`; commit again with 2 wrong → `passed: false`, level unchanged; assert `wmi_concept_progress.level` and `updated_at` written. Recall path: insert a synthetic mastered progress row for a second slug present in a test-only track — cover `pickRecall` integration by asserting the query feeding it (recall candidates = spine concepts before focus with level ≥ 1) via the pure test + a service-level unit with a fake query if simpler; keep the Postgres assertions to the focus flow.

- [ ] **Step 4: Implement `lesson.ts`:**

```ts
// api/services/wmi/tracks/lesson.ts  (owns SQL)
import { pool, query, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { getTrack, conceptSlugsInSpineOrder } from './registry.js'
import { FOCUS_COUNT, RECALL_COUNT, GOLD_LEVEL, effectiveLevel, passesFocus } from './ladder.js'
import { pickRecall, type RecallCandidate } from './lessonMix.js'
import { applyAnswers, lockConceptProgress, EMPTY_PROGRESS } from '../concepts/conceptProgress.js'

export async function buildLesson(parentUserId: string, childId: string, trackId: string, focusSlug: string) {
  const track = getTrack(trackId)
  if (!track) throw Object.assign(new Error('track not found'), { status: 404 })
  const spine = conceptSlugsInSpineOrder(track)
  const focusIdx = spine.indexOf(focusSlug)
  if (focusIdx === -1) throw Object.assign(new Error('concept not in track'), { status: 400 })
  const client = await pool.connect()
  try { await assertChildOwnership(client, parentUserId, childId) } finally { client.release() }

  const progress = await query<{ concept_slug: string; level: number | null; best_tier: number; updated_at: string }>(
    `SELECT concept_slug, level, best_tier, updated_at FROM wmi_concept_progress WHERE child_id = $1`,
    [childId],
  )
  const bySlug = new Map(progress.map((p) => [p.concept_slug, p]))
  const focusProgress = bySlug.get(focusSlug)
  const focusLevel = Math.min(
    GOLD_LEVEL,
    Math.max(1, effectiveLevel(focusProgress?.level ?? null, focusProgress?.best_tier ?? 0) + 1),
  ) // the level being PLAYED: next uncleared, capped at 5 (gold replays L5)

  const focusRows = await query<InstanceRow>(
    `SELECT id, concept_slug, level, body_id, body_en, answer_type, choices_id, choices_en
     FROM wmi_concept_instances WHERE concept_slug = $1 AND level = $2
     ORDER BY random() LIMIT $3`,
    [focusSlug, focusLevel, FOCUS_COUNT],
  )
  if (focusRows.length < FOCUS_COUNT) {
    throw Object.assign(new Error(`instance pool too small for ${focusSlug} L${focusLevel}`), { status: 503 })
  }

  const candidates: RecallCandidate[] = spine.slice(0, focusIdx).flatMap((slug) => {
    const p = bySlug.get(slug)
    const level = effectiveLevel(p?.level ?? null, p?.best_tier ?? 0)
    return level >= 1
      ? [{ slug, level: Math.min(level, GOLD_LEVEL), lastPracticedMs: p ? Date.parse(p.updated_at) : 0 }]
      : []
  })
  const recallPicks = pickRecall(candidates, RECALL_COUNT)
  const recallRows: InstanceRow[] = []
  for (const pick of recallPicks) {
    const level = Math.max(1, Math.min(5, pick.level)) // serve at a CLEARED level
    const rows = await query<InstanceRow>(
      `SELECT id, concept_slug, level, body_id, body_en, answer_type, choices_id, choices_en
       FROM wmi_concept_instances WHERE concept_slug = $1 AND level = $2
       ORDER BY random() LIMIT 1`,
      [pick.slug, level],
    )
    if (rows[0]) recallRows.push(rows[0])
  }

  const toQuestion = (row: InstanceRow, recall: boolean) => ({
    instanceId: row.id, conceptSlug: row.concept_slug, level: row.level, recall,
    bodyId: row.body_id, bodyEn: row.body_en, answerType: row.answer_type,
    choicesId: row.choices_id, choicesEn: row.choices_en,
  })
  return { questions: [...focusRows.map((r) => toQuestion(r, false)), ...recallRows.map((r) => toQuestion(r, true))] }
}

interface InstanceRow {
  id: string; concept_slug: string; level: number; body_id: string; body_en: string
  answer_type: string; choices_id: unknown; choices_en: unknown
}

export async function commitLesson(
  parentUserId: string, childId: string, trackId: string, focusSlug: string,
  answers: Array<{ instanceId: string; selectedAnswer: string; recall: boolean }>,
) {
  const track = getTrack(trackId)
  if (!track) throw Object.assign(new Error('track not found'), { status: 404 })
  return withTransaction(async (tx) => {
    await assertChildOwnership(tx, parentUserId, childId)
    // Grade against stored instance answers (trim/case-insensitive equality —
    // reuse the matcher the konsep grader uses: check api/services/wmi/answerMatch.ts
    // and call the same function).
    const ids = answers.map((a) => a.instanceId)
    const rows = await query<{ id: string; concept_slug: string; answer: string }>(
      `SELECT id, concept_slug, answer FROM wmi_concept_instances WHERE id = ANY($1)`,
      [ids], tx,
    )
    const byId = new Map(rows.map((r) => [r.id, r]))
    const graded = answers.map((a) => {
      const inst = byId.get(a.instanceId)
      if (!inst) throw Object.assign(new Error('unknown instance'), { status: 400 })
      return { ...a, conceptSlug: inst.concept_slug, correct: matchesAnswer(inst.answer, a.selectedAnswer) }
    })

    // Focus judgment (one-miss) — only non-recall questions count.
    const focusResults = graded.filter((g) => !g.recall && g.conceptSlug === focusSlug).map((g) => g.correct)
    const passed = passesFocus(focusResults)

    // Fold every answer (focus + recall) into legacy progress so tiers/recency
    // stay truthful during coexistence; then bump `level` on a pass.
    const touched = [...new Set(graded.map((g) => g.conceptSlug))]
    const locked = await lockConceptProgress(tx, childId, touched)
    for (const slug of touched) {
      const prev = locked.get(slug) ?? EMPTY_PROGRESS
      const results = graded.filter((g) => g.conceptSlug === slug).map((g) => g.correct)
      const next = applyAnswers(prev, results)
      await query(
        `INSERT INTO wmi_concept_progress
           (child_id, concept_slug, attempts, correct, current_streak, recent, best_tier, comprehension_pct, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         ON CONFLICT (child_id, concept_slug) DO UPDATE SET
           attempts = EXCLUDED.attempts, correct = EXCLUDED.correct,
           current_streak = EXCLUDED.current_streak, recent = EXCLUDED.recent,
           best_tier = EXCLUDED.best_tier, comprehension_pct = EXCLUDED.comprehension_pct,
           updated_at = NOW()`,
        [childId, slug, next.attempts, next.correct, next.current_streak,
         JSON.stringify(next.recent), next.best_tier, next.comprehension_pct], tx,
      )
    }

    const prevRow = locked.get(focusSlug)
    const levelBefore = effectiveLevel(
      (prevRow as { level?: number | null } | undefined)?.level ?? null,
      prevRow?.best_tier ?? 0,
    )
    const levelAfter = passed ? Math.min(GOLD_LEVEL, levelBefore + 1) : levelBefore
    await query(
      `UPDATE wmi_concept_progress SET level = $3 WHERE child_id = $1 AND concept_slug = $2`,
      [childId, focusSlug, levelAfter], tx,
    )
    return { focusCorrect: focusResults.filter(Boolean).length, passed, levelBefore, levelAfter }
  })
}
```

Implementation notes for the engineer:
- `lockConceptProgress` signature/row shape: open `conceptProgress.ts` and match it exactly (it may not include `level` — if so, SELECT the focus row's `level` inside the transaction with `FOR UPDATE` alongside the lock call).
- `matchesAnswer`: import from `api/services/wmi/answerMatch.ts` (it exists — check its exported name and argument order; do NOT write a new matcher).
- The two routes are thin wrappers with Joi validation (`focusSlug` string required; `answers` array of `{instanceId: uuid, selectedAnswer: string, recall: boolean}` for commit), copying a neighbor handler's envelope.

- [ ] **Step 5: Run tests → PASS (`npx vitest run api/services/wmi/tracks/lessonMix.test.ts api/__tests__/trackLesson.test.ts`); `npm run check`; commit**

```bash
git add api/services/wmi/tracks/lesson.ts api/services/wmi/tracks/lessonMix.ts api/services/wmi/tracks/lessonMix.test.ts api/__tests__/trackLesson.test.ts api/routes/wmi-member.ts
git commit -m "feat(tracks): lesson assembly (6 focus + 2 staleness-first recall) + one-miss commit"
```

---

### Task 8: Gate service + endpoints

**Files:**
- Create: `api/services/wmi/tracks/gates.ts`
- Modify: `api/routes/wmi-member.ts` (add `GET /tracks/:trackId/gates/:gateKey` and `POST /tracks/:trackId/gates/:gateKey/submit`)
- Test: `api/__tests__/trackGates.test.ts` (Postgres)

**Interfaces:**
- Consumes: track registry, `GATE_BAR_LEVEL`, `effectiveLevel`, `matchesAnswer` (same as Task 7), `wmi_gate_clears` (Task 4). Gate `problemRef` format `'<paperCode>#<number>'` resolves against `wmi_papers`/`wmi_questions` (see `api/services/wmi/papers.ts` for the code column name — the papers table stores the paper's code; join on it and `q.number`).
- Produces:

```ts
export async function getGate(parentUserId: string, childId: string, trackId: string, gateKey: string):
  Promise<{ unlocked: boolean; cleared: boolean; question: { bodyId: string; bodyEn: string; answerType: string; choicesId: unknown; choicesEn: unknown } | null }>
export async function submitGate(parentUserId: string, childId: string, trackId: string, gateKey: string, selectedAnswer: string):
  Promise<{ correct: boolean; cleared: boolean }>
```

- [ ] **Step 1: Failing Postgres test** — seed a paper + question matching the pilot gate's `problemRef` (`WMI-21F1A#1`; if the disposable DB seeds papers already, reuse; otherwise insert a minimal `wmi_papers` + `wmi_questions` row). Child with `single-digit-addition` level 3 → `getGate` returns `unlocked: false, question: null`. Bump level to 4 → `unlocked: true` with the question body. `submitGate` with the wrong answer → `{ correct: false, cleared: false }` and no clear row; with the right answer → `{ correct: true, cleared: true }` and a `wmi_gate_clears` row; resubmitting stays cleared (idempotent upsert).

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `gates.ts`:** parse `problemRef` (`const [paperCode, numberStr] = ref.split('#')`), fetch the question by paper code + number, compute `unlocked` from `requires` levels exactly as `trackState.ts` does (extract that check into a small shared helper `gateUnlocked(requires, levelBySlug)` in `ladder.ts` if duplication itches — keep it pure), hide the question body while locked, grade with `matchesAnswer`, and on correct `INSERT INTO wmi_gate_clears ... ON CONFLICT DO NOTHING`. Routes: thin wrappers as before.

- [ ] **Step 4: Run → PASS; `npm run check`.**

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/tracks/gates.ts api/routes/wmi-member.ts api/__tests__/trackGates.test.ts
git commit -m "feat(tracks): synthesis gates (unlock at level>=4, clear on correct answer)"
```

---

### Task 9: Curriculum review checklist doc

**Files:**
- Create: `docs/reference/track-review-checklist.md`

- [ ] **Step 1: Write the checklist** (the human review gate the spec requires before a track's `status` may move to `published`):

```markdown
# Track Review Checklist

A track may move `draft → review → published` only when every box is checked
by a human reviewer on the PR that changes its `status`.

## Structure (CI enforces, reviewer spot-checks)
- [ ] `npm run check` and the track validator test pass (`validate.test.ts`).
- [ ] Every gate's `requires` list is the COMPLETE decomposition of its problem
      (a child mastering exactly those concepts can genuinely solve it).

## Per concept
- [ ] The 5 level param sets climb monotonically (L1 easiest → L5 hardest);
      no level is a difficulty plateau or regression.
- [ ] L1 is genuinely entry-level for the track's grade.
- [ ] L5 matches the difficulty the gate problem actually demands.
- [ ] Instance pools exist for all 5 levels (`ensureLevelPools` run against
      the target environment) and rendered questions read naturally in
      Indonesian at every level.

## Per unit
- [ ] Unit length: 2–6 concepts (spec: "concepts that take root without
      overwhelming the child").
- [ ] The gate problem is solvable using ONLY concepts from the spine so far.

## Rollout
- [ ] `status: 'review'` verified by an admin account end-to-end (lesson,
      recall labels, gate) before `published`.
- [ ] Tier→level migration behavior confirmed for reused slugs (spec mapping
      0,1,2,3→4,4→5).
```

- [ ] **Step 2: Commit**

```bash
git add docs/reference/track-review-checklist.md
git commit -m "docs: track curriculum review checklist (publish gate)"
```

---

### Task 10: Full-suite verification

- [ ] **Step 1:** `npm run check` → clean.
- [ ] **Step 2:** `npm test` → all pure suites pass (Postgres suites skip without `TEST_DATABASE_URL`; with it set, all pass).
- [ ] **Step 3:** `npm run lint` → no new issues in touched files.
- [ ] **Step 4:** Commit any straggler fixes:

```bash
git add -A && git commit -m "chore(tracks): plan-1 verification fixes"
```

---

## Self-Review (done at plan-writing time)

- **Spec coverage:** registry/units/gates → T1; validator → T3; ladder + constants + mapping → T2; `levels` per concept → T3/T5; DB columns + gate clears → T4; lesson (6+2, staleness-first, recall flags, one-miss) → T7; gates (bar ≥4, real problem, clear stamp) → T8; review checklist → T9. NOT in this plan (deliberate): theme pack visuals + frontend (Plan 2); review-status visibility, cutover, reward parity, migration execution (Plan 3) — `effectiveLevel` already encodes the mapping so Plan 3's "migration" is behavioral, not a data job.
- **Placeholders:** none — where a neighboring file's exact idiom matters (rng constructor, insert column list, `lockConceptProgress` row shape, `matchesAnswer` name, route envelope), the step names the exact file to open and what to copy, which is an action, not a gap.
- **Type consistency:** `effectiveLevel(level, bestTier)`, `passesFocus`, `GATE_BAR_LEVEL`, `GOLD_LEVEL`, `FOCUS_COUNT`, `RECALL_COUNT`, `pickRecall`, `getTrack`, `conceptSlugsInSpineOrder`, `hasLevelGeneration`, `getLevelGeneration`, `ensureLevelPools` are used with the same names and signatures across T2–T8.
```
