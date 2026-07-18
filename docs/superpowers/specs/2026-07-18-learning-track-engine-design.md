# Learning Track Engine — Design

**Date:** 2026-07-18
**Status:** Approved design, pending implementation plan
**Scope:** Sub-project 1 of the learning-track rework: the parameterized track *engine*. The grade 1–2 WMI curriculum mapping (decomposing exam problems into atomic concepts) is sub-project 2 and gets its own spec once this engine exists.

## Goal

Rework the WMI garden into a parameterized, sequential learning-track system: a child walks a hierarchical path (A→B→C) where exam problems decompose into the atomic concepts needed to solve them; tracks are configurable per mode (WMI now, basic math later); per-concept difficulty climbs like a game until true proficiency; themes (forest → ocean, zoo) are swappable packs; and every track passes a rigorous quality review before a child sees it. Quality over quantity throughout.

## Decisions (with alternatives considered)

| Decision | Chosen | Rejected alternatives |
|---|---|---|
| Build order | Engine first, pressure-checked against sample WMI problems | Curriculum content first; both in one spec |
| Hierarchy shape | Linear spine of units + synthesis gates with explicit `requires` lists | Strict chain; full prerequisite DAG |
| Concept ladder | Fixed Duolingo-style ladder: 5 levels + gold, identical rule everywhere | Per-concept ladder length; fully configurable rules |
| Curriculum home | Code registry (TypeScript), PR-reviewed, CI-validated | DB + admin editor; hybrid |
| Rollout | Build beside current garden, cut over per track when reviewed | Replace in place; clean-slate reset |
| Lesson shape | Interleaved: ~70% focus concept + ~30% labeled recall | Pure focus lessons; dedicated review nodes |
| Recall selection | Staleness-first (least-recently-practiced mastered concepts) | Random sampling |
| Pass rule | At most 1 miss on focus questions | Percentage threshold (noisy at n≈6) |
| Gate unlock bar | All `requires` at level ≥ 4 (tree) | Gold on all (overwhelm risk) |
| Gold decay | None — recall stream handles retention | Khan-style mastery decay |

## Domain model

New browser-safe registry `api/services/wmi/tracks/` (same import conventions as the olympiad registry).

- **Mode**: `wmi`, later `basic-math`. Groups tracks; the app's mode switcher keys off it.
- **Track**: one per (mode, grade), e.g. `wmi-grade-1`:

```ts
{
  id: 'wmi-grade-1', mode: 'wmi', grade: 1,
  status: 'draft' | 'review' | 'published',
  theme: 'forest',                        // theme pack key
  units: [{
    key: 'bilangan-1',                    // spine chapter, walked in order
    nameId: string, icon: string, color: string,
    nodes: [
      { kind: 'concept', slug: 'count-objects-to-10' },
      // …
      { kind: 'gate',                     // synthesis boss = a real WMI problem
        problemRef: 'WMI-21F1A-Q7',       // resolves to an existing past-paper question
        requires: ['count-objects-to-10', /* …the ~10 decomposed concepts */] },
    ],
  }],
}
```

- Gates may `require` concepts from any earlier point in the spine (many-to-one decomposition). The child-visible experience stays a single path.
- **Startup/CI validator** asserts: every concept slug exists and has 5 non-empty level definitions; every `requires` entry appears earlier in the spine; every `problemRef` resolves; every theme key exists. A broken curriculum fails CI, never a child.

## Concept ladder & progress

- Every concept has exactly **5 levels + gold** (levels 1–5; clearing L5 = gold = proficient). Stored progress is `level` 0–5: 0 = untouched, n = levels cleared, 5 = gold. Theme packs therefore define **6 stage visuals** (0–5); the forest pack extends today's five (egg → seedling → leaf → tree → gold forest) with one intermediate tree stage.
- The concept's generator registry entry gains `levels: [L1..L5]` — five param sets scaling the same skill (e.g. L1 numbers ≤ 10 → L5 multi-step). This is the only per-concept authoring surface; rules are global.
- **Progress is per (child, concept), shared across tracks**: new `level SMALLINT` (0–5) column on `wmi_concept_progress`. Mastery is knowledge the child owns (knowledge-component model) — a concept reused by a future basic-math track carries its level. Spine unlock state is always *computed* from concept levels + gate clears, never stored.

## Game loop

- **Lesson** (tap a concept node): 8 questions — 6 focus-concept questions at its current level + 2 **recall** questions from concepts mastered earlier in the spine, served at levels the child already cleared (both counts are named constants, tunable). Recall picks are **staleness-first** (least-recently-practiced first — one ORDER BY on the existing last-practiced timestamp; full SRS is a future upgrade). Each recall question is visibly labeled with a "recall" chip in the UI so the kid knows it's a memory check, not new material.
- **Level-up**: judged only on the focus-concept questions — **at most 1 miss** advances the level (kid-explainable; ≈ Bloom's mastery bar). Clearing L5 turns the node gold.
- **Gate node**: unlocks when all its `requires` reach level ≥ 4; playing it serves the referenced real WMI problem(s); passing stamps the gate cleared (per child).
- **Unit unlock**: units open in spine order; a unit opens when the previous unit's gate is cleared.

## Content pipeline

- `wmi_concept_instances` gains a `level` column; regen tooling fills all five pools per concept; the validator refuses concepts with missing/empty level pools (kills the stale-instance failure mode).
- New **lesson assembly** service builds sessions server-side (focus + recall mix, recall flags in the payload).
- Curriculum derivation (sub-project 2): per grade-1/2 WMI paper problem, decompose into atomic concepts — reusing the existing ~100-generator pool where it fits, authoring new micro-generators via the existing math-problem-creation skill where it doesn't — and register the problem as the gate requiring them.

## Theme packs

Theme registry (`forest`, later `ocean`, `zoo`): the 6 ladder-stage visuals (icon/colors/rim per level — today's `PLANT_STAGES` becomes the forest pack), trail palette, and copy tokens ("Kebun" → "Samudra"). Tracks reference a theme by key; trail/node/sheet components read stage art from the active track's theme instead of importing `plantStages` directly. Pure visual swap — no per-theme rule changes.

## Quality gate & rollout

- Track `status` drives visibility: `draft` (invisible) → `review` (admins only) → `published` (children).
- Publishing requires: CI validator green + human curriculum review against a checklist committed next to the registry (per-level pedagogy sane, gate decompositions complete, no overwhelm).
- **Coexistence & cutover**: the current garden keeps serving children untouched while the engine is built. Cutover is per track: when `wmi-grade-1` publishes, `/belajar` serves the new engine for grade-1 children; other grades stay on the current garden until their track publishes.
- **Migration**: one-time mapping for concept slugs the new curriculum reuses, chosen to preserve unlock semantics — the old system treated tier ≥ 3 ("Mahir") as grown/gate-ready, and the new gate bar is level ≥ 4, so: tier 0→level 0, 1→1, 2→2, **3→4** (Mahir stays gate-ready), **4→5** (mastered stays gold). Level 3 is simply skipped for migrated progress. New concepts start at 0. No child loses their garden.

## Testing

- Pure unit tests: registry validator, unlock computation, lesson assembly (focus/recall mix, staleness ordering, one-miss rule).
- Postgres integration suites (existing `TEST_DATABASE_URL` pattern) for progress writes and migration mapping.

## Out of scope / future

- Grade 1–2 curriculum content itself (sub-project 2, own spec).
- Basic-math mode content.
- Unit test-out / jump-ahead (Duolingo-style) — migration mapping removes the immediate need.
- Full spaced-repetition scheduling (staleness-first is the v1 approximation).
- Dedicated review nodes on the spine (add if data shows retention rot).
- Gold decay (deliberately rejected for kids; recall stream handles rot).
- DB-level per-concept kill switches (today's `enabled` flag remains usable).
