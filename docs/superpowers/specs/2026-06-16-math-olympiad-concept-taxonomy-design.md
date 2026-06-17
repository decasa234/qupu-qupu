# Math Olympiad Concept Taxonomy — Design Spec

**Date:** 2026-06-16
**Branch:** `feat/wmi-concept-taxonomy`
**Status:** Approved structure; pending spec review before planning.

## 1. Context

The WMI concept system (`api/services/wmi/concepts/`) holds **73 parameterized
question-generator concepts** for grades 0–3. Today they are organized by a
**school-curriculum taxonomy** of 9 domains (Arithmetic, Number Sense, Word
Problems, Patterns, Logic, Counting, Geometry, Measurement, Data), defined
**in-code** in `preview.ts` (`DOMAIN_LABEL`, `DOMAIN_ORDER`, `DOMAIN_BY_SLUG`,
`SHORT_ID_BY_SLUG`) and documented in `docs/wmi-concepts/taxonomy.md`.

This taxonomy is currently **admin-only** — it drives the proofreading page
(`/admin/wmi/concepts`, `AdminWmiConcepts.tsx`) via `listConceptsForPreview()`.
The `wmi_concepts` DB table does **not** store domain/short-id; the taxonomy is
purely in-code.

The product is now multi-brand (WMI + SASMO past papers). The drill concepts
themselves are brand-agnostic competition-math practice.

## 2. Goal

Reframe the concept taxonomy from school-curriculum domains into a
**math-olympiad taxonomy**: a two-level **strand → topic** structure using
recognizable competition-math strand names, plus two per-concept tags —
**`difficulty` (1–5)** and **`isOlympiad` (boolean)** — that will later let
drills target genuine olympiad practice.

This is **sub-project A** of a larger 3-part effort (see §11). It is the
foundation the others build on.

### Non-goals (explicitly out of scope here)

- **Rebrand** of the user-facing "WMI" label → "Math Olympiad" (sub-project B).
- **Raising the actual generated-problem difficulty** / pruning trivial
  generators (sub-project C).
- **DB persistence** of the taxonomy and any **learner-facing** strand/difficulty
  navigator or drill-targeting (a deferred later phase). The data model is
  *shaped* so these are clean to add, but no DB columns, no learner UI, and no
  drill-targeting logic ship in sub-project A.

## 3. Decisions (and why)

These were settled during brainstorming:

| Decision | Choice | Rationale |
|---|---|---|
| Audience now | **Admin-only, built to surface later** | Lowest scope now; the single-source-of-truth module is shaped so a future migration + navigator can read it without rework. |
| Taxonomy shape | **Two-level: strand → topic** | Keeps the granularity of the 917-line taxonomy doc while presenting an olympiad face; best base for a future strand→topic drill navigator. |
| Strand set | **6 strands** (balanced) | Olympiad-canonical names while keeping Arithmetic visible for the youngest grades — grade-0 addition does not get filed under "Algebra". |
| Tag model | **`difficulty` 1–5 + `isOlympiad` flag** | Fine sort key for ranking + a simple gate for "genuine olympiad" filtering. A legend (§7) compensates for numbers needing explanation. |
| Short codes | **Freeze existing codes as opaque stable IDs** | Legacy codes (`A1`=make-ten …) are referenced in explainer/animation code and skill docs; memory rule: never renumber. Codes decouple from the new strand and remain admin recall shorthand. |
| `WORD` domain | **Dissolved** | Word problems are applications; each moves to the strand of its underlying method. |
| Measurement / Data | **Folded** (MEA → Geometry & Measurement; DAT → Logic & Reasoning) | Neither is a canonical olympiad strand at this level; folding keeps the strand list tight. |

## 4. Strand model (6 strands)

Two-letter strand codes, deliberately distinct from the legacy single-letter
concept short-codes so the two namespaces never collide.

| Code | Strand EN | Strand ID |
|---|---|---|
| `AR` | Arithmetic & Computation | Aritmetika & Komputasi |
| `NT` | Number Theory | Teori Bilangan |
| `AP` | Algebra & Patterns | Aljabar & Pola |
| `CO` | Combinatorics & Counting | Kombinatorika & Pencacahan |
| `GE` | Geometry & Measurement | Geometri & Pengukuran |
| `LR` | Logic & Reasoning | Logika & Penalaran |

Display order: `AR, NT, AP, CO, GE, LR`.

## 5. Topic model (26 topics)

Each topic belongs to exactly one strand. Topic codes are `STRAND-SHORT`.

| Strand | Topic code | Topic EN | Topic ID |
|---|---|---|---|
| AR | `AR-OPS`   | Basic Operations          | Operasi Dasar |
| AR | `AR-CALC`  | Multi-step Calculation    | Perhitungan Bertahap |
| AR | `AR-INV`   | Inverse & Missing Values  | Operasi Balik & Nilai Hilang |
| AR | `AR-STORY` | Error Correction & Story  | Koreksi Kesalahan & Soal Cerita |
| NT | `NT-PV`    | Place Value & Digit-build | Nilai Tempat & Menyusun Angka |
| NT | `NT-DIG`   | Digits & Digit Sums       | Angka & Jumlah Angka |
| NT | `NT-DIV`   | Divisibility & Multiples  | Keterbagian & Kelipatan |
| NT | `NT-PAR`   | Parity & Special Numbers  | Paritas & Bilangan Istimewa |
| NT | `NT-CMP`   | Compare & Order           | Membandingkan & Mengurutkan |
| NT | `NT-FRAC`  | Fractions                 | Pecahan |
| AP | `AP-NPAT`  | Number Patterns           | Pola Bilangan |
| AP | `AP-VPAT`  | Visual Patterns           | Pola Visual |
| AP | `AP-FUNC`  | Function & Equation Rules | Aturan Fungsi & Persamaan |
| AP | `AP-RATE`  | Rate & Proportion         | Laju & Perbandingan |
| CO | `CO-OBJ`   | Counting Objects          | Mencacah Objek |
| CO | `CO-FIG`   | Counting Figures          | Mencacah Bangun |
| CO | `CO-ARR`   | Arrangements & Grouping   | Penyusunan & Pengelompokan |
| GE | `GE-AREA`  | Perimeter & Area          | Keliling & Luas |
| GE | `GE-SHAPE` | Shape Properties          | Sifat Bangun |
| GE | `GE-3D`    | Spatial & 3D              | Spasial & 3D |
| GE | `GE-PATH`  | Paths & Grids             | Lintasan & Kisi |
| GE | `GE-MEAS`  | Measurement               | Pengukuran |
| LR | `LR-DED`   | Deductive Clues           | Petunjuk Deduktif |
| LR | `LR-CON`   | Constraints & Possibility | Batasan & Kemungkinan |
| LR | `LR-SET`   | Sets & Data               | Himpunan & Data |
| LR | `LR-BAL`   | Balance & Optimization    | Keseimbangan & Optimasi |

## 6. Full per-concept assignment (73 concepts)

`difficulty` 1–5 (legend §7); `isOlympiad` per criteria §8. `short_id` is the
**frozen legacy code** (kept as a stable ID, no longer encodes the strand).

### AR — Arithmetic & Computation

| slug | short_id | topic | diff | olympiad |
|---|---|---|--:|:--:|
| single-digit-addition       | A1 | AR-OPS   | 1 | no |
| single-digit-subtraction    | A2 | AR-OPS   | 1 | no |
| multiplication-small        | A3 | AR-OPS   | 2 | no |
| arithmetic-expression-eval  | A4 | AR-CALC  | 2 | no |
| alternating-chain-eval      | A7 | AR-CALC  | 2 | no |
| which-expression-equals     | A5 | AR-CALC  | 2 | no |
| missing-addend              | A9 | AR-INV   | 2 | no |
| reverse-arithmetic-puzzle   | N4 | AR-INV   | 3 | yes |
| more-or-less-by-k           | N7 | AR-INV   | 1 | no |
| mistaken-digit-correction   | A8 | AR-STORY | 4 | yes |
| story-sum                   | W1 | AR-STORY | 2 | no |
| money-shopping-change       | W2 | AR-STORY | 2 | no |

### NT — Number Theory

| slug | short_id | topic | diff | olympiad |
|---|---|---|--:|:--:|
| place-value                   | N2  | NT-PV   | 2 | no |
| build-number-from-digit-clues | N6  | NT-PV   | 3 | yes |
| arrange-digits-to-form-number | N14 | NT-PV   | 3 | yes |
| digit-sum                     | N1  | NT-DIG  | 3 | yes |
| digit-frequency               | N9  | NT-DIG  | 3 | yes |
| find-number-by-digit-sum      | N5  | NT-DIG  | 3 | yes |
| divisibility-multiple-property| N8  | NT-DIV  | 3 | yes |
| product-of-consecutive        | N12 | NT-DIV  | 4 | yes |
| odd-even-reasoning            | N10 | NT-PAR  | 2 | yes |
| perfect-square-search         | N11 | NT-PAR  | 4 | yes |
| compare-order-numbers         | N3  | NT-CMP  | 1 | no |
| fraction-of-region            | N13 | NT-FRAC | 2 | no |
| equivalent-fraction-fill      | N15 | NT-FRAC | 3 | yes |

### AP — Algebra & Patterns

| slug | short_id | topic | diff | olympiad |
|---|---|---|--:|:--:|
| pattern-next            | P1  | AP-NPAT | 2 | yes |
| number-pyramid          | P2  | AP-NPAT | 3 | yes |
| number-line-jumps       | P3  | AP-NPAT | 2 | no |
| visual-pattern-next     | P4  | AP-VPAT | 2 | yes |
| shape-transformation-rule | P5 | AP-VPAT | 3 | yes |
| custom-operation        | A6  | AP-FUNC | 4 | yes |
| operator-fill           | L3  | AP-FUNC | 3 | yes |
| legs-items-rate         | W3  | AP-RATE | 3 | yes |
| distance-rate-time      | W4  | AP-RATE | 4 | yes |
| rope-wraps-ratio        | W10 | AP-RATE | 3 | yes |
| net-progress-cycles     | W9  | AP-RATE | 4 | yes |

### CO — Combinatorics & Counting

| slug | short_id | topic | diff | olympiad |
|---|---|---|--:|:--:|
| count-objects           | C1 | CO-OBJ | 1 | no |
| tally-marks-count       | D2 | CO-OBJ | 1 | no |
| count-shapes-in-figure  | C3 | CO-FIG | 4 | yes |
| count-rectangles-grid   | C4 | CO-FIG | 4 | yes |
| count-polygon-sides     | G8 | CO-FIG | 1 | no |
| combination-product-sum | C2 | CO-ARR | 5 | yes |
| make-groups-leftover    | C5 | CO-ARR | 2 | no |
| sum-partition-split     | L6 | CO-ARR | 3 | yes |

### GE — Geometry & Measurement

| slug | short_id | topic | diff | olympiad |
|---|---|---|--:|:--:|
| shape-perimeter-square    | G1  | GE-AREA  | 2 | no |
| shape-perimeter-rectangle | G4  | GE-AREA  | 2 | no |
| rectangle-area-grid       | G5  | GE-AREA  | 2 | no |
| perimeter-area-composed   | G6  | GE-AREA  | 3 | yes |
| angle-type                | G10 | GE-SHAPE | 1 | no |
| symmetry-count            | G9  | GE-SHAPE | 2 | no |
| same-figure-identify      | G12 | GE-SHAPE | 2 | no |
| block-count-3d            | G7  | GE-3D    | 3 | yes |
| dice-opposite-faces       | G2  | GE-3D    | 3 | yes |
| dice-net-fold             | G13 | GE-3D    | 3 | yes |
| direction-orientation     | G3  | GE-3D    | 2 | no |
| grid-path-steps           | G11 | GE-PATH  | 2 | no |
| maze-path-shortest        | G14 | GE-PATH  | 3 | yes |
| clock-read-time           | M3  | GE-MEAS  | 1 | no |
| clock-time-after          | M1  | GE-MEAS  | 2 | no |
| unit-conversion           | M2  | GE-MEAS  | 2 | no |
| scale-read                | M4  | GE-MEAS  | 2 | no |

### LR — Logic & Reasoning

| slug | short_id | topic | diff | olympiad |
|---|---|---|--:|:--:|
| truth-order-clues    | L8 | LR-DED | 4 | yes |
| position-in-line     | L1 | LR-DED | 2 | yes |
| assignment-cycle     | L2 | LR-DED | 3 | yes |
| which-might-be       | L4 | LR-CON | 3 | yes |
| range-count-evaluate | L5 | LR-CON | 3 | yes |
| venn-set-membership  | L7 | LR-SET | 3 | yes |
| bar-chart-compare    | D1 | LR-SET | 1 | no |
| table-lookup-combine | D3 | LR-SET | 2 | no |
| weight-balance-word  | W5 | LR-BAL | 3 | yes |
| budget-selection     | W7 | LR-BAL | 3 | yes |
| lacking-money-shared | W6 | LR-BAL | 3 | yes |
| money-coins-total    | W8 | LR-BAL | 2 | no |

**Distribution:** AR 12 · NT 13 · AP 11 · CO 8 · GE 17 · LR 12 = **73**.
**Olympiad-flagged:** 40 of 73.

## 7. `difficulty` legend (1–5)

| Level | Meaning | Example |
|--:|---|---|
| 1 | Foundational fluency; single step; youngest grades (G0) | single-digit-addition |
| 2 | Routine; one idea; G1–G2 | place-value, story-sum |
| 3 | Multi-step or needs a named strategy; G2–G3 | budget-selection, divisibility-multiple-property |
| 4 | Needs insight / combining ideas; contest-level | custom-operation, product-of-consecutive |
| 5 | Olympiad-hard: non-obvious insight + multiple constraints | combination-product-sum |

This legend is documented in `taxonomy.ts` and surfaced on the proofreading page
as a tooltip/legend so the numbers are not opaque.

## 8. `isOlympiad` criteria

`true` when the concept rewards genuine competition thinking — pattern-finding,
invariants, parity arguments, systematic enumeration, working backward, or
clever number facts — rather than rote skill or plain reading. Foundational
fluency (`single-digit-addition`) and pure read-off tasks (`clock-read-time`,
`bar-chart-compare`) are `false`.

## 9. Architecture / files

### New module — single source of truth

`api/services/wmi/concepts/taxonomy.ts`:

```ts
export type StrandCode = 'AR' | 'NT' | 'AP' | 'CO' | 'GE' | 'LR'

export interface Strand { code: StrandCode; label_en: string; label_id: string }
export interface Topic  { code: string; strand: StrandCode; label_en: string; label_id: string }

export const STRANDS: Strand[]              // ordered AR..LR
export const TOPICS: Topic[]                // 24 topics, each tied to a strand
export const STRAND_ORDER: StrandCode[]

export interface ConceptTags {
  strand: StrandCode
  topic: string            // a TOPICS code; must belong to `strand`
  difficulty: 1 | 2 | 3 | 4 | 5
  isOlympiad: boolean
}
export const CONCEPT_TAGS: Record<string, ConceptTags>   // keyed by concept slug

// Legacy, frozen — kept for stable recall codes, no longer encodes strand.
export const SHORT_ID_BY_SLUG: Record<string, string>

// helpers
export function topicsForStrand(code: StrandCode): Topic[]
export function strandLabel(code: StrandCode, lang: 'en' | 'id'): string
export function topicLabel(code: string, lang: 'en' | 'id'): string
```

The `DOMAIN_LABEL`/`DOMAIN_ORDER`/`DOMAIN_BY_SLUG` constants move out of
`preview.ts` and are **replaced** by the above. `SHORT_ID_BY_SLUG` moves here
verbatim.

### Edits

- `api/services/wmi/concepts/preview.ts`
  - `ConceptSummary` gains: `strand`, `strand_label`, `topic`, `topic_label`,
    `difficulty`, `isOlympiad` (keeps existing `short_id`, `grades`,
    `priority`, names). Remove `domain`/`domain_label`.
  - `listConceptsForPreview()` reads from `CONCEPT_TAGS`; sort by
    `STRAND_ORDER` → topic order within strand → `short_id` number.
- `src/lib/wmiAdminApi.ts` + `src/pages/admin/AdminWmiConcepts.tsx`
  - Replace `domain_label` grouping with strand → topic grouping.
  - Show each concept's difficulty (1–5) and an "Olympiad" badge when
    `isOlympiad`.
  - Add filter controls: by strand, by difficulty, by olympiad-only.
  - Keep the existing search and review-verdict behavior.
- `src/lib/wmiAdminApi.ts` — update the `AdminConceptSummary` type (this is
  where the concept-summary type actually lives) to match the new
  `ConceptSummary` shape.
- `docs/wmi-concepts/taxonomy.md` — re-section under the 6 strands → topics;
  add `strand`, `topic`, `difficulty`, `isOlympiad` to each archetype entry.
  Touch `coverage-matrix.md` and `seed-taxonomy.md` headers where they
  reference the old 9-domain names.

## 10. Validation

A unit test in `api/services/wmi/concepts/` (mirroring the existing
`new-g1-g2-concepts.test.ts` style) asserting:

1. Every slug in `ALL_SLUGS` (the registry) has an entry in `CONCEPT_TAGS`.
2. Every `CONCEPT_TAGS` key is a real registry slug (no stale entries).
3. Each `topic` exists in `TOPICS` **and** its `strand` matches the topic's
   declared strand.
4. `difficulty` ∈ {1,2,3,4,5}.
5. Every registry slug still has a `SHORT_ID_BY_SLUG` entry (codes unbroken).

This guards against a concept being added later without taxonomy tags.

## 11. Future-surface readiness (no work now)

`taxonomy.ts` is the single source of truth and is shaped so a later phase can:
- add `strand`, `topic`, `difficulty`, `is_olympiad` columns to `wmi_concepts`
  via migration and have `bootstrap.ts` seed them from `CONCEPT_TAGS`;
- expose them through the member/public concept API;
- build a learner-facing strand → topic → difficulty navigator and
  drill-targeting (e.g. "olympiad-core, difficulty ≥ 3").

None of that ships in sub-project A.

## 12. Relationship to the larger effort

This spec is **sub-project A** of three:

- **A (this spec)** — Olympiad taxonomy: strands, topics, difficulty + olympiad
  tags. Foundation.
- **B** — Rebrand user-facing "WMI" → "Math Olympiad" copy (titles/nav/glossary
  only; code identifiers stay `wmi`). Separate spec.
- **C** — Raise actual generated-problem difficulty / prune trivial generators,
  prioritized by this spec's tags. Separate spec; iterative.

## 13. Open questions

None blocking. Difficulty/`isOlympiad` values in §6 are the author's
first-pass judgment and are the main thing to sanity-check during review; they
are cheap to adjust (single-source map) and a future "raise difficulty" pass
(sub-project C) may shift some.
