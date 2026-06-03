# WMI Past-Paper Concept Taxonomy — Design

**Date:** 2026-06-03
**Status:** Draft (brainstorm) — awaiting user review
**Author:** Vico (with Claude)
**Prior art:** [`2026-05-27-wmi-concept-generator-design.md`](./2026-05-27-wmi-concept-generator-design.md) (the generator system this taxonomy feeds)

## Context

`wmiPastPaper/` holds World Mathematics Invitational (WMI) past papers spanning **2019–2025**. The corpus is organized as **56 natural units** = `{year} × {Prelim | Final} × {Grade 00–03}`. Each unit has:

- **Paper A** — multiple-choice section (~15 problems, choose A–E).
- **Paper B** — fill-in section (~10 problems, exact numeric answers).
- **One Answer folder** — holds both keys (letters for Paper A, numbers for Paper B).

112 question papers ÷ 56 answer keys = exactly 2 papers per key. Total ≈ **1,400 questions**.

Each paper ships a `full.md` (OCR'd question text, MC choices, LaTeX-ish math, and `<details>` blocks describing each embedded diagram) plus per-paper JSON and an `images/` directory. **`full.md` is the canonical source for question text.**

The repo already contains a **concept generator system** (migrations `0022_wmi_concepts` / `0023_wmi_concept_hint_steps`, 9 hand-authored concepts). In that system a *concept* is a TypeScript module — `meta`, `paramsSchema` (zod), `generate(rng)`, `render(params)` — that procedurally produces infinite bilingual parameterized question instances. This taxonomy exists to **discover the full set of concepts the past papers imply**, so the generator catalog can grow from 9 toward full WMI coverage.

## Goals

- Read every WMI past-paper question (2019–2025, both rounds, Grades 00–03, Papers A + B) and **group each one under a concept**.
- Produce a **concept taxonomy document**: the catalog of concepts, each with enough detail to later be authored as a `generate`/`render` module.
- A concept here = a **question archetype**: a recurring problem shape whose numbers/entities can be swapped while the solution method stays fixed. Archetypes are the unit that becomes a parameterized generator.
- Bilingual output: every archetype name and every example instance is given in **English and Indonesian** (matching the app's `name_en`/`name_id` convention).
- Account for *every* question — visual/diagram-dependent ones too — but **tag-and-defer** the visual ones (classify them, flag `illustration_needed`, prioritize text-parameterizable archetypes for generation).

## Non-goals

- Authoring the actual TypeScript generator modules. The taxonomy is the backlog; module authoring is downstream work, one concept at a time.
- Extracting a fully normalized, validated machine dataset as the headline deliverable. A supporting `questions.json` is produced as an auditable intermediate, but the deliverable is the human-readable catalog + question index.
- OCR correction / re-derivation of answers. Answers are joined from the provided answer keys as-is; questions whose key is ambiguous are flagged, not fixed.
- Designing illustration components for visual archetypes (only noting *what* each would need to render).
- Difficulty modeling / adaptive sequencing. Points-per-problem are recorded as a raw signal only.

## Definitions and granularity rule

**One archetype = one solution method × one parameter family.**

- "Single-digit addition" and "two-digit addition with carry" are **different** archetypes (different generators, different param ranges).
- A reverse-arithmetic puzzle ("subtract the smallest 2-digit number from a number; the result is the largest 1-digit even number; find the digit sum") is its **own** archetype — not filed under "subtraction."
- A multi-step word problem is one archetype keyed by its *narrative shape + solution path*, not split across the skills it touches.

When two past-paper questions share solution method and parameter family but differ only in surface numbers/entities, they map to the **same** archetype (this is the common case — WMI recycles archetypes across years and grades).

## Domain taxonomy (seed — refined in Phase 0)

Top-level buckets used to organize archetypes. Provisional; Phase 0 confirms/renames against real data:

1. **Arithmetic & Operations** — add/subtract/multiply/divide, multi-step computation, order of operations.
2. **Number Sense & Place Value** — digits, comparing/ordering, odd/even, building numbers from digit clues, rounding.
3. **Word Problems** — money, age, distribution/sharing, before/after.
4. **Patterns & Sequences** — number/shape sequences, "what comes next," repeating patterns.
5. **Logic & Reasoning** — sets/Venn, true-false statements, conditions ("which cannot be"), deduction.
6. **Counting & Combinatorics** — enumeration, "how many ways," systematic counting.
7. **Geometry & Spatial** — shapes, perimeter/area, nets/folding (cubes/dice), rotation & views, symmetry.
8. **Measurement** — length, time/clocks, money units, weight.
9. **Data & Classification** — reading tables/diagrams, sorting/classifying, odd-one-out.

## Record schemas

### Per-question record (working data — one per question, stored in `questions.json`)

| Field | Meaning |
|---|---|
| `id` | Stable citation, e.g. `2024-FIN-G01-A-Q5` (`{year}-{PRE\|FIN}-G{NN}-{A\|B}-Q{n}`) |
| `year`, `round`, `grade`, `paper`, `qnum` | Provenance |
| `body` | Question text (from `full.md`) |
| `choices` | MC options A–E (Paper A) or `null` (Paper B) |
| `answer` | Joined from the answer key (letter for A, number for B) |
| `answer_type` | `multiple_choice` \| `fill_in` |
| `points` | Per-problem points (raw difficulty signal) |
| `image_dependent` | `true` if the question can't be solved from text alone |
| `image_role` | Short note on what the diagram contributes (when `image_dependent`) |
| `archetype_slug` | Assigned concept |
| `domain` | Top-level bucket |

### Archetype record (the catalog entry in `taxonomy.md`)

- `slug` — kebab-case, registry-style (continuous with existing concept slugs).
- `name_en` / `name_id` — bilingual archetype name.
- `domain` — top-level bucket.
- `grades` — grade range observed across the corpus.
- `answer_type(s)` — MC, fill-in, or both.
- `solution_method` — the fixed reasoning path.
- `parameterization` — params + ranges/constraints + entity sets (mirrors the intent of a zod `paramsSchema`); explicitly names what varies and what stays fixed.
- `illustration_needed` — boolean + a note on what an illustration would render.
- `example_en` / `example_id` — one fully rendered bilingual instance.
- `source_questions` — every question `id` that maps here, with a count.
- `status` — `existing` (one of the 9 already-built concepts) or `new`.

## Pipeline

### Phase 0 — Seed vocabulary (done inline, by the main agent)

Read a representative sample (~8 papers spanning grades, years, and both rounds). Output: the confirmed domain list, an initial archetype vocabulary with slugs, and a frozen record schema. This controlled vocabulary anchors Phase 1 so 56 independent agents don't drift into 56 private label sets. **User reviews the seed vocabulary before the fan-out.**

### Phase 1 — Extract + classify (parallel, 56 units)

One agent per `(year, round, grade)` unit. Each agent:

1. Reads Paper A `full.md`, Paper B `full.md`, and the Answer `full.md`.
2. Extracts every question into a per-question record; joins the answer from the key by question number.
3. Flags `image_dependent` and notes `image_role` from the `<details>` diagram descriptions.
4. Classifies each question into an existing archetype from the seed vocabulary; proposes a **new** archetype only when nothing fits (with a slug, name, and rationale).
5. Returns structured records (schema above).

### Phase 2 — Synthesize (done inline, by the main agent)

Merge ~1,400 records. Canonicalize archetype labels — collapse near-duplicate slugs different agents proposed for the same shape; split any archetype that conflates two solution methods. Then write the three output artifacts.

### Orchestration

The Phase-1 fan-out is **56-way**. The choice between a **Workflow** (deterministic, resumable; ~60 agents; ~1M+ tokens) and **Agent-tool batches** (more hands-on, pausable) is deferred until after Phase 0, when the real data's messiness is visible.

## Output artifacts (`docs/wmi-concepts/`)

- **`taxonomy.md`** — the master catalog: domains → archetypes, each a full archetype record. **Headline deliverable.**
- **`question-index.md`** — every question `id` → its archetype (literal "group every question to concept"); satisfies completeness auditing.
- **`coverage-matrix.md`** — archetype × grade frequency table, so the highest-value generators to build next are obvious.
- **`questions.json`** — raw per-question records (auditable intermediate; not the headline).

## Relationship to the existing generator system

The 9 existing concepts (`count-objects`, `single-digit-addition`, `single-digit-subtraction`, `pattern-next`, `digit-sum`, `shape-perimeter-square`, `place-value`, `multiplication-small`, `story-sum`) are seeded into the taxonomy as `status: existing`. Each new archetype's `parameterization` block is written to map cleanly onto a future `paramsSchema` + `generate` + `render`, so authoring a module from a catalog entry is mechanical. `illustration_needed` archetypes correspond to the system's optional frontend illustration components.

## Edge cases and risks

- **Answer-key join failures** (key missing a number, OCR garble): flag the record `answer: null` with a note; never guess.
- **Multi-concept questions:** assign the *primary* archetype (the dominant solution step); note secondary skills in the archetype's `solution_method` prose rather than double-filing.
- **Paper A vs Paper B duplication:** A (MC) and B (fill-in) are distinct problem sets; both are extracted fully. The same archetype can appear in both with different `answer_type`.
- **Label drift across 56 agents:** mitigated by the Phase-0 seed vocabulary + the Phase-2 canonicalization pass.
- **Grade 00 visual-heavy papers:** expect a high `image_dependent` rate; these are tagged and deferred, not dropped.
- **OCR noise in `full.md`:** archetype classification is robust to surface noise (it keys on structure); exact numbers are taken from the answer key where they matter.

## Acceptance criteria

- [ ] Phase 0 seed vocabulary (domains + archetype slugs + frozen schema) reviewed and approved.
- [ ] Every one of the ~1,400 questions appears in `question-index.md` with an assigned archetype (100% coverage; unclassifiable ones explicitly bucketed as `misc-unclassified` with a reason).
- [ ] `taxonomy.md` lists each archetype with a complete record, including bilingual name + bilingual example instance and a parameterization block.
- [ ] `coverage-matrix.md` shows archetype × grade frequencies.
- [ ] The 9 existing concepts are present and marked `status: existing`.
- [ ] `questions.json` validates against the per-question schema.
