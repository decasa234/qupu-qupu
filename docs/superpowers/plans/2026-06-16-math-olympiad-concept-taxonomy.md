# Math Olympiad Concept Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-organize the 73 WMI concept generators from school-curriculum domains into a two-level math-olympiad **strand → topic** taxonomy, and tag each concept with `difficulty` (1–5) and `isOlympiad`, surfaced on the admin proofreading page (admin-only, future-surfaceable).

**Architecture:** A single new in-code source of truth, `api/services/wmi/concepts/taxonomy.ts`, holds the strands, topics, per-concept tags, and the (frozen) legacy short-codes. `preview.ts` reads from it and exposes the new fields on `ConceptSummary`; the admin React page groups by strand → topic and shows difficulty/olympiad badges + filters. No DB columns, no learner UI, no route changes — the route already spreads the summary verbatim.

**Tech Stack:** TypeScript, Node/Express (`api/`), React 18 + Vite + Tailwind (`src/`), Vitest, Zod. ESM-style `.js` import specifiers inside `api/` (resolved by tsx/Vercel) — keep that convention.

**Spec:** `docs/superpowers/specs/2026-06-16-math-olympiad-concept-taxonomy-design.md`

---

## File structure

| File | Responsibility | Action |
|---|---|---|
| `api/services/wmi/concepts/taxonomy.ts` | Single source of truth: `STRANDS`, `TOPICS`, `STRAND_ORDER`, `CONCEPT_TAGS`, frozen `SHORT_ID_BY_SLUG`, label helpers. | Create (Task 1) |
| `api/services/wmi/concepts/taxonomy.test.ts` | Invariants: every concept tagged, topics belong to strands, difficulty in range, short-ids cover the registry + unique. | Create (Task 1) |
| `api/services/wmi/concepts/preview.ts` | `ConceptSummary` shape + `listConceptsForPreview()` now read from `taxonomy.ts`; old `DOMAIN_*`/`SHORT_ID_BY_SLUG` removed. | Modify (Task 2) |
| `api/services/wmi/concepts/preview.test.ts` | Output-shape assertions for `listConceptsForPreview()`. | Create (Task 2) |
| `src/lib/wmiAdminApi.ts` | `AdminConceptSummary` type matches the new server shape. | Modify (Task 3) |
| `src/pages/admin/AdminWmiConcepts.tsx` | Two-level strand → topic grouping + per-row difficulty/olympiad markers (Task 3); filter controls + header badges (Task 4). | Modify (Tasks 3, 4) |
| `docs/wmi-concepts/taxonomy.md` | Human reference: add the olympiad strand/topic/tag section; mark the old domain table as source-mining context. | Modify (Task 5) |

Tasks 2 and 3 are a pair (the HTTP shape changes in Task 2 and the client reads it in Task 3); land them back-to-back.

---

## Task 1: Taxonomy module + invariant test

**Files:**
- Create: `api/services/wmi/concepts/taxonomy.ts`
- Test: `api/services/wmi/concepts/taxonomy.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/services/wmi/concepts/taxonomy.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { ALL_SLUGS } from './registry.js'
import {
  CONCEPT_TAGS,
  SHORT_ID_BY_SLUG,
  STRANDS,
  STRAND_ORDER,
  TOPICS,
  topicsForStrand,
} from './taxonomy.js'

const TOPIC_CODES = new Set(TOPICS.map((t) => t.code))
const STRAND_CODES = new Set(STRANDS.map((s) => s.code))

describe('concept taxonomy', () => {
  test('every registered concept has tags', () => {
    for (const slug of ALL_SLUGS) {
      expect(CONCEPT_TAGS[slug], `missing tags for ${slug}`).toBeDefined()
    }
  })

  test('no stale tag entries — every tag key is a real slug', () => {
    const slugs = new Set<string>(ALL_SLUGS)
    for (const slug of Object.keys(CONCEPT_TAGS)) {
      expect(slugs.has(slug), `stale tag entry: ${slug}`).toBe(true)
    }
  })

  test('every concept tag is internally valid', () => {
    for (const [slug, tag] of Object.entries(CONCEPT_TAGS)) {
      expect(STRAND_CODES.has(tag.strand), `${slug}: bad strand ${tag.strand}`).toBe(true)
      expect(TOPIC_CODES.has(tag.topic), `${slug}: bad topic ${tag.topic}`).toBe(true)
      const topic = TOPICS.find((t) => t.code === tag.topic)!
      expect(topic.strand, `${slug}: topic ${tag.topic} not in strand ${tag.strand}`).toBe(tag.strand)
      expect(tag.difficulty).toBeGreaterThanOrEqual(1)
      expect(tag.difficulty).toBeLessThanOrEqual(5)
    }
  })

  test('every registered concept has a frozen short id', () => {
    for (const slug of ALL_SLUGS) {
      expect(SHORT_ID_BY_SLUG[slug], `missing short_id for ${slug}`).toBeTruthy()
    }
  })

  test('short ids are unique', () => {
    const seen = new Map<string, string>()
    for (const [slug, code] of Object.entries(SHORT_ID_BY_SLUG)) {
      expect(seen.has(code), `duplicate short id ${code}`).toBe(false)
      seen.set(code, slug)
    }
  })

  test('strands match STRAND_ORDER and every strand has topics', () => {
    expect(STRANDS.map((s) => s.code)).toEqual([...STRAND_ORDER])
    for (const code of STRAND_ORDER) {
      expect(topicsForStrand(code).length, `strand ${code} has no topics`).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run api/services/wmi/concepts/taxonomy.test.ts`
Expected: FAIL — cannot resolve `./taxonomy.js` (module does not exist yet).

- [ ] **Step 3: Create the taxonomy module**

Create `api/services/wmi/concepts/taxonomy.ts`:

```ts
// Math Olympiad concept taxonomy — single source of truth.
//
// A two-level strand -> topic structure plus per-concept `difficulty` (1-5)
// and `isOlympiad` tags. Admin-only today (drives the /admin/wmi/concepts
// proofreading page and the docs); shaped so a future migration can persist
// these onto `wmi_concepts` and a learner navigator can read them.
//
// `SHORT_ID_BY_SLUG` is the FROZEN legacy recall code per concept (referenced
// by explainer/animation code and skill docs) — never renumber an existing
// entry; new concepts get the next free number in their letter series. The
// code no longer encodes the strand; it is just stable admin shorthand.
//
// See docs/superpowers/specs/2026-06-16-math-olympiad-concept-taxonomy-design.md

export type StrandCode = 'AR' | 'NT' | 'AP' | 'CO' | 'GE' | 'LR'

export interface Strand {
  code: StrandCode
  label_en: string
  label_id: string
}

export interface Topic {
  code: string
  strand: StrandCode
  label_en: string
  label_id: string
}

export interface ConceptTags {
  strand: StrandCode
  topic: string // a TOPICS code; must belong to `strand`
  difficulty: 1 | 2 | 3 | 4 | 5
  isOlympiad: boolean
}

export const STRAND_ORDER: readonly StrandCode[] = ['AR', 'NT', 'AP', 'CO', 'GE', 'LR']

export const STRANDS: readonly Strand[] = [
  { code: 'AR', label_en: 'Arithmetic & Computation', label_id: 'Aritmetika & Komputasi' },
  { code: 'NT', label_en: 'Number Theory', label_id: 'Teori Bilangan' },
  { code: 'AP', label_en: 'Algebra & Patterns', label_id: 'Aljabar & Pola' },
  { code: 'CO', label_en: 'Combinatorics & Counting', label_id: 'Kombinatorika & Pencacahan' },
  { code: 'GE', label_en: 'Geometry & Measurement', label_id: 'Geometri & Pengukuran' },
  { code: 'LR', label_en: 'Logic & Reasoning', label_id: 'Logika & Penalaran' },
]

export const TOPICS: readonly Topic[] = [
  { code: 'AR-OPS', strand: 'AR', label_en: 'Basic Operations', label_id: 'Operasi Dasar' },
  { code: 'AR-CALC', strand: 'AR', label_en: 'Multi-step Calculation', label_id: 'Perhitungan Bertahap' },
  { code: 'AR-INV', strand: 'AR', label_en: 'Inverse & Missing Values', label_id: 'Operasi Balik & Nilai Hilang' },
  { code: 'AR-STORY', strand: 'AR', label_en: 'Error Correction & Story', label_id: 'Koreksi Kesalahan & Soal Cerita' },
  { code: 'NT-PV', strand: 'NT', label_en: 'Place Value & Digit-build', label_id: 'Nilai Tempat & Menyusun Angka' },
  { code: 'NT-DIG', strand: 'NT', label_en: 'Digits & Digit Sums', label_id: 'Angka & Jumlah Angka' },
  { code: 'NT-DIV', strand: 'NT', label_en: 'Divisibility & Multiples', label_id: 'Keterbagian & Kelipatan' },
  { code: 'NT-PAR', strand: 'NT', label_en: 'Parity & Special Numbers', label_id: 'Paritas & Bilangan Istimewa' },
  { code: 'NT-CMP', strand: 'NT', label_en: 'Compare & Order', label_id: 'Membandingkan & Mengurutkan' },
  { code: 'NT-FRAC', strand: 'NT', label_en: 'Fractions', label_id: 'Pecahan' },
  { code: 'AP-NPAT', strand: 'AP', label_en: 'Number Patterns', label_id: 'Pola Bilangan' },
  { code: 'AP-VPAT', strand: 'AP', label_en: 'Visual Patterns', label_id: 'Pola Visual' },
  { code: 'AP-FUNC', strand: 'AP', label_en: 'Function & Equation Rules', label_id: 'Aturan Fungsi & Persamaan' },
  { code: 'AP-RATE', strand: 'AP', label_en: 'Rate & Proportion', label_id: 'Laju & Perbandingan' },
  { code: 'CO-OBJ', strand: 'CO', label_en: 'Counting Objects', label_id: 'Mencacah Objek' },
  { code: 'CO-FIG', strand: 'CO', label_en: 'Counting Figures', label_id: 'Mencacah Bangun' },
  { code: 'CO-ARR', strand: 'CO', label_en: 'Arrangements & Grouping', label_id: 'Penyusunan & Pengelompokan' },
  { code: 'GE-AREA', strand: 'GE', label_en: 'Perimeter & Area', label_id: 'Keliling & Luas' },
  { code: 'GE-SHAPE', strand: 'GE', label_en: 'Shape Properties', label_id: 'Sifat Bangun' },
  { code: 'GE-3D', strand: 'GE', label_en: 'Spatial & 3D', label_id: 'Spasial & 3D' },
  { code: 'GE-PATH', strand: 'GE', label_en: 'Paths & Grids', label_id: 'Lintasan & Kisi' },
  { code: 'GE-MEAS', strand: 'GE', label_en: 'Measurement', label_id: 'Pengukuran' },
  { code: 'LR-DED', strand: 'LR', label_en: 'Deductive Clues', label_id: 'Petunjuk Deduktif' },
  { code: 'LR-CON', strand: 'LR', label_en: 'Constraints & Possibility', label_id: 'Batasan & Kemungkinan' },
  { code: 'LR-SET', strand: 'LR', label_en: 'Sets & Data', label_id: 'Himpunan & Data' },
  { code: 'LR-BAL', strand: 'LR', label_en: 'Balance & Optimization', label_id: 'Keseimbangan & Optimasi' },
]

// Per-concept tags. Keyed by registry slug. difficulty legend: 1 foundational
// fluency · 2 routine · 3 multi-step/strategy · 4 insight/contest · 5 olympiad-hard.
export const CONCEPT_TAGS: Record<string, ConceptTags> = {
  // AR — Arithmetic & Computation
  'single-digit-addition': { strand: 'AR', topic: 'AR-OPS', difficulty: 1, isOlympiad: false },
  'single-digit-subtraction': { strand: 'AR', topic: 'AR-OPS', difficulty: 1, isOlympiad: false },
  'multiplication-small': { strand: 'AR', topic: 'AR-OPS', difficulty: 2, isOlympiad: false },
  'arithmetic-expression-eval': { strand: 'AR', topic: 'AR-CALC', difficulty: 2, isOlympiad: false },
  'alternating-chain-eval': { strand: 'AR', topic: 'AR-CALC', difficulty: 2, isOlympiad: false },
  'which-expression-equals': { strand: 'AR', topic: 'AR-CALC', difficulty: 2, isOlympiad: false },
  'missing-addend': { strand: 'AR', topic: 'AR-INV', difficulty: 2, isOlympiad: false },
  'reverse-arithmetic-puzzle': { strand: 'AR', topic: 'AR-INV', difficulty: 3, isOlympiad: true },
  'more-or-less-by-k': { strand: 'AR', topic: 'AR-INV', difficulty: 1, isOlympiad: false },
  'mistaken-digit-correction': { strand: 'AR', topic: 'AR-STORY', difficulty: 4, isOlympiad: true },
  'story-sum': { strand: 'AR', topic: 'AR-STORY', difficulty: 2, isOlympiad: false },
  'money-shopping-change': { strand: 'AR', topic: 'AR-STORY', difficulty: 2, isOlympiad: false },

  // NT — Number Theory
  'place-value': { strand: 'NT', topic: 'NT-PV', difficulty: 2, isOlympiad: false },
  'build-number-from-digit-clues': { strand: 'NT', topic: 'NT-PV', difficulty: 3, isOlympiad: true },
  'arrange-digits-to-form-number': { strand: 'NT', topic: 'NT-PV', difficulty: 3, isOlympiad: true },
  'digit-sum': { strand: 'NT', topic: 'NT-DIG', difficulty: 3, isOlympiad: true },
  'digit-frequency': { strand: 'NT', topic: 'NT-DIG', difficulty: 3, isOlympiad: true },
  'find-number-by-digit-sum': { strand: 'NT', topic: 'NT-DIG', difficulty: 3, isOlympiad: true },
  'divisibility-multiple-property': { strand: 'NT', topic: 'NT-DIV', difficulty: 3, isOlympiad: true },
  'product-of-consecutive': { strand: 'NT', topic: 'NT-DIV', difficulty: 4, isOlympiad: true },
  'odd-even-reasoning': { strand: 'NT', topic: 'NT-PAR', difficulty: 2, isOlympiad: true },
  'perfect-square-search': { strand: 'NT', topic: 'NT-PAR', difficulty: 4, isOlympiad: true },
  'compare-order-numbers': { strand: 'NT', topic: 'NT-CMP', difficulty: 1, isOlympiad: false },
  'fraction-of-region': { strand: 'NT', topic: 'NT-FRAC', difficulty: 2, isOlympiad: false },
  'equivalent-fraction-fill': { strand: 'NT', topic: 'NT-FRAC', difficulty: 3, isOlympiad: true },

  // AP — Algebra & Patterns
  'pattern-next': { strand: 'AP', topic: 'AP-NPAT', difficulty: 2, isOlympiad: true },
  'number-pyramid': { strand: 'AP', topic: 'AP-NPAT', difficulty: 3, isOlympiad: true },
  'number-line-jumps': { strand: 'AP', topic: 'AP-NPAT', difficulty: 2, isOlympiad: false },
  'visual-pattern-next': { strand: 'AP', topic: 'AP-VPAT', difficulty: 2, isOlympiad: true },
  'shape-transformation-rule': { strand: 'AP', topic: 'AP-VPAT', difficulty: 3, isOlympiad: true },
  'custom-operation': { strand: 'AP', topic: 'AP-FUNC', difficulty: 4, isOlympiad: true },
  'operator-fill': { strand: 'AP', topic: 'AP-FUNC', difficulty: 3, isOlympiad: true },
  'legs-items-rate': { strand: 'AP', topic: 'AP-RATE', difficulty: 3, isOlympiad: true },
  'distance-rate-time': { strand: 'AP', topic: 'AP-RATE', difficulty: 4, isOlympiad: true },
  'rope-wraps-ratio': { strand: 'AP', topic: 'AP-RATE', difficulty: 3, isOlympiad: true },
  'net-progress-cycles': { strand: 'AP', topic: 'AP-RATE', difficulty: 4, isOlympiad: true },

  // CO — Combinatorics & Counting
  'count-objects': { strand: 'CO', topic: 'CO-OBJ', difficulty: 1, isOlympiad: false },
  'tally-marks-count': { strand: 'CO', topic: 'CO-OBJ', difficulty: 1, isOlympiad: false },
  'count-shapes-in-figure': { strand: 'CO', topic: 'CO-FIG', difficulty: 4, isOlympiad: true },
  'count-rectangles-grid': { strand: 'CO', topic: 'CO-FIG', difficulty: 4, isOlympiad: true },
  'count-polygon-sides': { strand: 'CO', topic: 'CO-FIG', difficulty: 1, isOlympiad: false },
  'combination-product-sum': { strand: 'CO', topic: 'CO-ARR', difficulty: 5, isOlympiad: true },
  'make-groups-leftover': { strand: 'CO', topic: 'CO-ARR', difficulty: 2, isOlympiad: false },
  'sum-partition-split': { strand: 'CO', topic: 'CO-ARR', difficulty: 3, isOlympiad: true },

  // GE — Geometry & Measurement
  'shape-perimeter-square': { strand: 'GE', topic: 'GE-AREA', difficulty: 2, isOlympiad: false },
  'shape-perimeter-rectangle': { strand: 'GE', topic: 'GE-AREA', difficulty: 2, isOlympiad: false },
  'rectangle-area-grid': { strand: 'GE', topic: 'GE-AREA', difficulty: 2, isOlympiad: false },
  'perimeter-area-composed': { strand: 'GE', topic: 'GE-AREA', difficulty: 3, isOlympiad: true },
  'angle-type': { strand: 'GE', topic: 'GE-SHAPE', difficulty: 1, isOlympiad: false },
  'symmetry-count': { strand: 'GE', topic: 'GE-SHAPE', difficulty: 2, isOlympiad: false },
  'same-figure-identify': { strand: 'GE', topic: 'GE-SHAPE', difficulty: 2, isOlympiad: false },
  'block-count-3d': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: true },
  'dice-opposite-faces': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: true },
  'dice-net-fold': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: true },
  'direction-orientation': { strand: 'GE', topic: 'GE-3D', difficulty: 2, isOlympiad: false },
  'grid-path-steps': { strand: 'GE', topic: 'GE-PATH', difficulty: 2, isOlympiad: false },
  'maze-path-shortest': { strand: 'GE', topic: 'GE-PATH', difficulty: 3, isOlympiad: true },
  'clock-read-time': { strand: 'GE', topic: 'GE-MEAS', difficulty: 1, isOlympiad: false },
  'clock-time-after': { strand: 'GE', topic: 'GE-MEAS', difficulty: 2, isOlympiad: false },
  'unit-conversion': { strand: 'GE', topic: 'GE-MEAS', difficulty: 2, isOlympiad: false },
  'scale-read': { strand: 'GE', topic: 'GE-MEAS', difficulty: 2, isOlympiad: false },

  // LR — Logic & Reasoning
  'truth-order-clues': { strand: 'LR', topic: 'LR-DED', difficulty: 4, isOlympiad: true },
  'position-in-line': { strand: 'LR', topic: 'LR-DED', difficulty: 2, isOlympiad: true },
  'assignment-cycle': { strand: 'LR', topic: 'LR-DED', difficulty: 3, isOlympiad: true },
  'which-might-be': { strand: 'LR', topic: 'LR-CON', difficulty: 3, isOlympiad: true },
  'range-count-evaluate': { strand: 'LR', topic: 'LR-CON', difficulty: 3, isOlympiad: true },
  'venn-set-membership': { strand: 'LR', topic: 'LR-SET', difficulty: 3, isOlympiad: true },
  'bar-chart-compare': { strand: 'LR', topic: 'LR-SET', difficulty: 1, isOlympiad: false },
  'table-lookup-combine': { strand: 'LR', topic: 'LR-SET', difficulty: 2, isOlympiad: false },
  'weight-balance-word': { strand: 'LR', topic: 'LR-BAL', difficulty: 3, isOlympiad: true },
  'budget-selection': { strand: 'LR', topic: 'LR-BAL', difficulty: 3, isOlympiad: true },
  'lacking-money-shared': { strand: 'LR', topic: 'LR-BAL', difficulty: 3, isOlympiad: true },
  'money-coins-total': { strand: 'LR', topic: 'LR-BAL', difficulty: 2, isOlympiad: false },
}

// Frozen legacy recall codes (domain letter + index). Do not renumber.
export const SHORT_ID_BY_SLUG: Record<string, string> = {
  'single-digit-addition': 'A1',
  'single-digit-subtraction': 'A2',
  'multiplication-small': 'A3',
  'arithmetic-expression-eval': 'A4',
  'which-expression-equals': 'A5',
  'custom-operation': 'A6',
  'alternating-chain-eval': 'A7',
  'mistaken-digit-correction': 'A8',
  'missing-addend': 'A9',
  'digit-sum': 'N1',
  'place-value': 'N2',
  'compare-order-numbers': 'N3',
  'reverse-arithmetic-puzzle': 'N4',
  'find-number-by-digit-sum': 'N5',
  'build-number-from-digit-clues': 'N6',
  'more-or-less-by-k': 'N7',
  'divisibility-multiple-property': 'N8',
  'digit-frequency': 'N9',
  'odd-even-reasoning': 'N10',
  'perfect-square-search': 'N11',
  'product-of-consecutive': 'N12',
  'fraction-of-region': 'N13',
  'arrange-digits-to-form-number': 'N14',
  'equivalent-fraction-fill': 'N15',
  'story-sum': 'W1',
  'money-shopping-change': 'W2',
  'legs-items-rate': 'W3',
  'distance-rate-time': 'W4',
  'weight-balance-word': 'W5',
  'lacking-money-shared': 'W6',
  'budget-selection': 'W7',
  'money-coins-total': 'W8',
  'net-progress-cycles': 'W9',
  'rope-wraps-ratio': 'W10',
  'pattern-next': 'P1',
  'number-pyramid': 'P2',
  'number-line-jumps': 'P3',
  'visual-pattern-next': 'P4',
  'shape-transformation-rule': 'P5',
  'position-in-line': 'L1',
  'assignment-cycle': 'L2',
  'operator-fill': 'L3',
  'which-might-be': 'L4',
  'range-count-evaluate': 'L5',
  'sum-partition-split': 'L6',
  'venn-set-membership': 'L7',
  'truth-order-clues': 'L8',
  'count-objects': 'C1',
  'combination-product-sum': 'C2',
  'count-shapes-in-figure': 'C3',
  'count-rectangles-grid': 'C4',
  'make-groups-leftover': 'C5',
  'shape-perimeter-square': 'G1',
  'dice-opposite-faces': 'G2',
  'direction-orientation': 'G3',
  'shape-perimeter-rectangle': 'G4',
  'rectangle-area-grid': 'G5',
  'perimeter-area-composed': 'G6',
  'block-count-3d': 'G7',
  'count-polygon-sides': 'G8',
  'symmetry-count': 'G9',
  'angle-type': 'G10',
  'grid-path-steps': 'G11',
  'same-figure-identify': 'G12',
  'dice-net-fold': 'G13',
  'maze-path-shortest': 'G14',
  'clock-time-after': 'M1',
  'unit-conversion': 'M2',
  'clock-read-time': 'M3',
  'scale-read': 'M4',
  'bar-chart-compare': 'D1',
  'tally-marks-count': 'D2',
  'table-lookup-combine': 'D3',
}

const STRAND_BY_CODE = new Map(STRANDS.map((s) => [s.code, s]))
const TOPIC_BY_CODE = new Map(TOPICS.map((t) => [t.code, t]))

export function topicsForStrand(code: StrandCode): Topic[] {
  return TOPICS.filter((t) => t.strand === code)
}

export function strandLabel(code: StrandCode, lang: 'en' | 'id'): string {
  const s = STRAND_BY_CODE.get(code)
  return s ? (lang === 'id' ? s.label_id : s.label_en) : code
}

export function topicLabel(code: string, lang: 'en' | 'id'): string {
  const t = TOPIC_BY_CODE.get(code)
  return t ? (lang === 'id' ? t.label_id : t.label_en) : code
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run api/services/wmi/concepts/taxonomy.test.ts`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/concepts/taxonomy.ts api/services/wmi/concepts/taxonomy.test.ts
git commit -m "feat(wmi): olympiad concept taxonomy — strands, topics, tags (source of truth)"
```

---

## Task 2: Rewire `preview.ts` to the taxonomy

**Files:**
- Modify: `api/services/wmi/concepts/preview.ts`
- Test: `api/services/wmi/concepts/preview.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/services/wmi/concepts/preview.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { listConceptsForPreview } from './preview.js'
import { STRAND_ORDER } from './taxonomy.js'

describe('listConceptsForPreview', () => {
  const list = listConceptsForPreview()

  test('exposes strand/topic/difficulty/isOlympiad for a foundational concept', () => {
    const add = list.find((c) => c.slug === 'single-digit-addition')!
    expect(add.strand).toBe('AR')
    expect(add.strand_label).toBe('Arithmetic & Computation')
    expect(add.topic).toBe('AR-OPS')
    expect(add.topic_label).toBe('Basic Operations')
    expect(add.difficulty).toBe(1)
    expect(add.isOlympiad).toBe(false)
    expect(add.short_id).toBe('A1')
  })

  test('flags a genuine olympiad concept', () => {
    const combo = list.find((c) => c.slug === 'combination-product-sum')!
    expect(combo.strand).toBe('CO')
    expect(combo.difficulty).toBe(5)
    expect(combo.isOlympiad).toBe(true)
  })

  test('is sorted by strand order', () => {
    const idx = (s: string) => STRAND_ORDER.indexOf(s as never)
    for (let i = 1; i < list.length; i++) {
      expect(idx(list[i].strand)).toBeGreaterThanOrEqual(idx(list[i - 1].strand))
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run api/services/wmi/concepts/preview.test.ts`
Expected: FAIL — `c.strand` etc. are `undefined` (preview.ts still emits `domain`/`domain_label`).

- [ ] **Step 3: Replace the taxonomy block at the top of `preview.ts`**

In `api/services/wmi/concepts/preview.ts`, replace everything from the import line through the end of the `SHORT_ID_BY_SLUG` constant — i.e. the block currently spanning the `import ... rng.js` / `registry.js` imports plus `DOMAIN_LABEL`, `DOMAIN_ORDER`, `DOMAIN_BY_SLUG`, and `SHORT_ID_BY_SLUG` (lines 4–177) — with:

```ts
import { mulberry32 } from './rng.js'
import { ALL_SLUGS, CONCEPTS, getConcept } from './registry.js'
import {
  CONCEPT_TAGS,
  SHORT_ID_BY_SLUG,
  STRAND_ORDER,
  TOPICS,
  strandLabel,
  topicLabel,
  type StrandCode,
} from './taxonomy.js'

const TOPIC_ORDER = new Map(TOPICS.map((t, i) => [t.code, i]))
```

Keep the existing `shortIdNum` helper and the `HIGH_PRIORITY` set exactly as they are (they sit just below the replaced block).

- [ ] **Step 4: Replace the `ConceptSummary` interface and `listConceptsForPreview`**

Replace the existing `ConceptSummary` interface and `listConceptsForPreview` function with:

```ts
export interface ConceptSummary {
  slug: string
  short_id: string
  name_en: string
  name_id: string
  description_id: string | null
  grades: number[]
  strand: StrandCode
  strand_label: string
  topic: string
  topic_label: string
  difficulty: number
  isOlympiad: boolean
  priority: 'high' | 'normal'
}

// Defensive only — the taxonomy.test.ts invariant guarantees every registered
// concept is tagged, so this fallback should never be hit at runtime.
const FALLBACK_TAG = { strand: 'AR' as StrandCode, topic: 'AR-OPS', difficulty: 3, isOlympiad: false }

export function listConceptsForPreview(): ConceptSummary[] {
  return ALL_SLUGS.map((slug) => {
    const c = CONCEPTS[slug]
    const tag = CONCEPT_TAGS[slug] ?? FALLBACK_TAG
    return {
      slug,
      short_id: SHORT_ID_BY_SLUG[slug] ?? '',
      name_en: c.meta.name_en,
      name_id: c.meta.name_id,
      description_id: c.meta.description_id ?? null,
      grades: [...c.meta.grades],
      strand: tag.strand,
      strand_label: strandLabel(tag.strand, 'en'),
      topic: tag.topic,
      topic_label: topicLabel(tag.topic, 'en'),
      difficulty: tag.difficulty,
      isOlympiad: tag.isOlympiad,
      priority: HIGH_PRIORITY.has(slug) ? ('high' as const) : ('normal' as const),
    }
  }).sort(
    (a, b) =>
      STRAND_ORDER.indexOf(a.strand) - STRAND_ORDER.indexOf(b.strand) ||
      (TOPIC_ORDER.get(a.topic) ?? 999) - (TOPIC_ORDER.get(b.topic) ?? 999) ||
      shortIdNum(a.short_id) - shortIdNum(b.short_id) ||
      a.name_en.localeCompare(b.name_en),
  )
}
```

Leave `ConceptSample` and `sampleConcept` (below) untouched.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run api/services/wmi/concepts/preview.test.ts`
Expected: PASS — all 3 tests green.

- [ ] **Step 6: Typecheck the whole project**

Run: `npm run check`
Expected: PASS (exit 0). The route handler in `api/routes/wmi-admin.ts` spreads the summary with `...c` and never names `domain`, so it still compiles. (The client still declares `domain_label` in its own interface — that is fixed in Task 3; it does not break this typecheck.)

- [ ] **Step 7: Commit**

```bash
git add api/services/wmi/concepts/preview.ts api/services/wmi/concepts/preview.test.ts
git commit -m "feat(wmi): preview emits strand/topic/difficulty/isOlympiad (drop domain)"
```

---

## Task 3: Frontend type + two-level strand→topic sidebar

**Files:**
- Modify: `src/lib/wmiAdminApi.ts:6-18`
- Modify: `src/pages/admin/AdminWmiConcepts.tsx`

- [ ] **Step 1: Update the `AdminConceptSummary` type**

In `src/lib/wmiAdminApi.ts`, replace the `AdminConceptSummary` interface (the `domain` + `domain_label` fields) with the new fields:

```ts
export interface AdminConceptSummary {
  slug: string
  short_id: string
  name_en: string
  name_id: string
  description_id: string | null
  grades: number[]
  strand: string
  strand_label: string
  topic: string
  topic_label: string
  difficulty: number
  isOlympiad: boolean
  status: ReviewStatus
  priority: 'high' | 'normal'
  wmi_refined: boolean
}
```

- [ ] **Step 2: Run typecheck to surface the breakages**

Run: `npm run check`
Expected: FAIL — errors in `src/pages/admin/AdminWmiConcepts.tsx` where `c.domain_label` is referenced (the search predicate and the `grouped` memo). This is the red state; the next steps fix it.

- [ ] **Step 3: Update the search predicate to use strand/topic labels**

In `src/pages/admin/AdminWmiConcepts.tsx`, inside the `filtered` `useMemo`, replace the line:

```ts
        c.domain_label.toLowerCase().includes(q)
```

with:

```ts
        c.strand_label.toLowerCase().includes(q) ||
        c.topic_label.toLowerCase().includes(q)
```

- [ ] **Step 4: Replace the `grouped` memo with a two-level strand→topic structure**

Replace the existing `grouped` `useMemo` (the one building `Map<string, AdminConceptSummary[]>` keyed by `domain_label`) with:

```ts
  // Two-level: strand label -> topic label -> concepts. `filtered` preserves
  // the server sort (strand order -> topic order -> short_id), so Map insertion
  // order reflects it.
  const grouped = useMemo(() => {
    const strands = new Map<string, Map<string, AdminConceptSummary[]>>()
    for (const c of filtered) {
      if (!strands.has(c.strand_label)) strands.set(c.strand_label, new Map())
      const topics = strands.get(c.strand_label)!
      if (!topics.has(c.topic_label)) topics.set(c.topic_label, [])
      topics.get(c.topic_label)!.push(c)
    }
    return [...strands.entries()].map(
      ([strand, topics]) => [strand, [...topics.entries()]] as const,
    )
  }, [filtered])
```

- [ ] **Step 5: Replace the sidebar render block (strand → topic → rows, with difficulty/olympiad markers)**

Replace the sidebar block that starts at `{grouped.length === 0 && ...}` and ends at the closing of the `{grouped.map(...)}` expression (the `No matches.` line through the `</div>))}` that closes the per-domain group) with:

```tsx
          {grouped.length === 0 && <div className="px-2 py-3 text-sm text-admin-faint">No matches.</div>}
          {grouped.map(([strand, topics]) => (
            <div key={strand} className="mb-3">
              <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-admin-faint">
                {strand}
              </div>
              {topics.map(([topic, items]) => (
                <div key={topic} className="mb-1">
                  <div className="px-2 pb-0.5 pt-1 text-[10px] font-semibold text-admin-muted">
                    {topic}
                  </div>
                  {items.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setActiveSlug(c.slug)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold transition-colors ${
                        c.slug === activeSlug
                          ? 'bg-qupu-brand-blue text-white'
                          : 'text-admin-ink hover:bg-admin-sunk'
                      }`}
                    >
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                          c.slug === activeSlug ? 'bg-white/20 text-white' : 'bg-admin-sunk text-admin-muted'
                        }`}
                      >
                        {c.short_id || '—'}
                      </span>
                      <span className="flex-1 truncate">{c.name_en}</span>
                      <span
                        className={`shrink-0 tabular-nums text-[10px] ${c.slug === activeSlug ? 'text-white/70' : 'text-admin-faint'}`}
                        title={`Difficulty ${c.difficulty}/5`}
                      >
                        d{c.difficulty}
                      </span>
                      {c.isOlympiad && (
                        <span
                          className={`shrink-0 text-[10px] leading-none ${c.slug === activeSlug ? 'text-yellow-200' : 'text-qupu-brand-orange'}`}
                          title="Olympiad-core"
                          aria-hidden="true"
                        >
                          ◆
                        </span>
                      )}
                      <span
                        className={`shrink-0 text-[10px] ${c.slug === activeSlug ? 'text-white/70' : 'text-admin-faint'}`}
                      >
                        G{c.grades.join('')}
                      </span>
                      {c.wmi_refined && (
                        <i
                          className={`fa-solid fa-star shrink-0 text-[10px] leading-none ${
                            c.slug === activeSlug ? 'text-yellow-200' : 'text-qupu-purple'
                          }`}
                          aria-hidden="true"
                          title="WMI Refined"
                        />
                      )}
                      <i
                        className={`fa-solid shrink-0 text-xs leading-none ${
                          c.status === 'approved'
                            ? 'fa-check text-emerald-500'
                            : c.status === 'needs_changes'
                              ? 'fa-triangle-exclamation text-amber-500'
                              : c.priority === 'high'
                                ? 'fa-flag text-red-600'
                                : 'fa-flag text-qupu-brand-orange'
                        }`}
                        aria-hidden="true"
                        title={
                          c.status === 'pending'
                            ? c.priority === 'high'
                              ? 'Needs review — urgent'
                              : 'Needs review'
                            : STATUS_META[c.status]?.label
                        }
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
```

- [ ] **Step 6: Run typecheck + lint**

Run: `npm run check`
Expected: PASS (exit 0).

Run: `npm run lint`
Expected: PASS (no new errors).

- [ ] **Step 7: Commit**

```bash
git add src/lib/wmiAdminApi.ts src/pages/admin/AdminWmiConcepts.tsx
git commit -m "feat(wmi): admin concepts grouped by strand -> topic with difficulty/olympiad markers"
```

---

## Task 4: Frontend filters + header badges

**Files:**
- Modify: `src/pages/admin/AdminWmiConcepts.tsx`

- [ ] **Step 1: Add filter state**

In `AdminWmiConcepts.tsx`, just below the existing `const [reviewFilter, setReviewFilter] = useState<...>('all')` line, add:

```ts
  const [strandFilter, setStrandFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [olympiadOnly, setOlympiadOnly] = useState(false)
```

- [ ] **Step 2: Extend the `filtered` memo with the new predicates**

Replace the whole `filtered` `useMemo` with this complete version (it keeps the review + search behavior from Task 3 and adds strand/difficulty/olympiad gating):

```ts
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return concepts.filter((c) => {
      if (reviewFilter === 'urgent') {
        if (!(c.priority === 'high' && c.status === 'pending')) return false
      } else if (reviewFilter !== 'all' && c.status !== reviewFilter) {
        return false
      }
      if (strandFilter !== 'all' && c.strand !== strandFilter) return false
      if (difficultyFilter !== 'all' && String(c.difficulty) !== difficultyFilter) return false
      if (olympiadOnly && !c.isOlympiad) return false
      if (!q) return true
      return (
        c.short_id.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q) ||
        c.name_id.toLowerCase().includes(q) ||
        c.strand_label.toLowerCase().includes(q) ||
        c.topic_label.toLowerCase().includes(q)
      )
    })
  }, [concepts, query, reviewFilter, strandFilter, difficultyFilter, olympiadOnly])
```

- [ ] **Step 3: Add the strand list for the filter dropdown**

Just below the `const noop = () => {}` line near the top of the file, add the strand option list (label + code), matching the server strand order:

```ts
const STRAND_OPTIONS: { code: string; label: string }[] = [
  { code: 'AR', label: 'Arithmetic & Computation' },
  { code: 'NT', label: 'Number Theory' },
  { code: 'AP', label: 'Algebra & Patterns' },
  { code: 'CO', label: 'Combinatorics & Counting' },
  { code: 'GE', label: 'Geometry & Measurement' },
  { code: 'LR', label: 'Logic & Reasoning' },
]
```

- [ ] **Step 4: Render the filter controls**

Immediately after the closing `</div>` of the existing review-filter chip row (the block guarded by `{concepts.length > 0 && (...)}`), add a second control row:

```tsx
      {concepts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            value={strandFilter}
            onChange={(e) => setStrandFilter(e.target.value)}
            className="rounded-full border border-admin-line bg-admin-card px-3 py-1 font-semibold text-admin-ink"
          >
            <option value="all">All strands</option>
            {STRAND_OPTIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="rounded-full border border-admin-line bg-admin-card px-3 py-1 font-semibold text-admin-ink"
          >
            <option value="all">Any difficulty</option>
            {['1', '2', '3', '4', '5'].map((d) => (
              <option key={d} value={d}>
                Difficulty {d}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOlympiadOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-colors ${
              olympiadOnly ? 'bg-qupu-brand-orange text-white' : 'bg-admin-sunk text-admin-muted hover:bg-admin-line'
            }`}
          >
            ◆ Olympiad only
          </button>
          <span className="text-admin-faint">· {filtered.length} shown</span>
        </div>
      )}
```

- [ ] **Step 5: Add difficulty + olympiad chips to the active-concept header**

In the active-concept header chip row, after the existing `<Chip on={hasSteps} label="Step-by-step" />`, add:

```tsx
                <Chip on label={`Difficulty ${active.difficulty}/5`} />
                <Chip on={active.isOlympiad} label="Olympiad" />
```

- [ ] **Step 6: Run typecheck + lint**

Run: `npm run check`
Expected: PASS (exit 0).

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/AdminWmiConcepts.tsx
git commit -m "feat(wmi): strand/difficulty/olympiad filters + header badges on concept proofreading"
```

---

## Task 5: Documentation

**Files:**
- Modify: `docs/wmi-concepts/taxonomy.md`

- [ ] **Step 1: Add the olympiad strand taxonomy section near the top**

In `docs/wmi-concepts/taxonomy.md`, immediately after the intro paragraph (before the `## At a glance` heading), insert a new section. Copy the following four tables verbatim from the design spec `docs/superpowers/specs/2026-06-16-math-olympiad-concept-taxonomy-design.md`: the strand table (spec §4), the topic table (spec §5), the difficulty legend (spec §7), and the isOlympiad criteria (spec §8). Wrap them under:

```markdown
## Olympiad strand taxonomy (current)

The concepts are organized into a two-level **strand → topic** structure with
per-concept `difficulty` (1–5) and `isOlympiad` tags. The authoritative,
machine-readable source of truth is `api/services/wmi/concepts/taxonomy.ts`;
this section is the human reference. The full per-concept assignment is in the
design spec, §6.

<!-- paste spec §4 strand table here -->
<!-- paste spec §5 topic table here -->
<!-- paste spec §7 difficulty legend here -->
<!-- paste spec §8 isOlympiad criteria here -->
```

(Replace each `<!-- paste ... -->` comment with the actual copied table/text from the spec — do not leave the comments in.)

- [ ] **Step 2: Relabel the legacy domain table**

Change the existing `## At a glance` section's domain breakdown table heading note so it reads as source-mining history, not the live taxonomy. Directly under the `| Domain | Questions | Archetypes |` table, add this line:

```markdown
> **Note:** the 9-domain grouping above reflects the original past-paper mining
> and the archetype catalog below. The live concept taxonomy is the 6 olympiad
> strands in *Olympiad strand taxonomy (current)* above; see
> `api/services/wmi/concepts/taxonomy.ts`.
```

- [ ] **Step 3: Add a pointer note to the companion docs**

The spec also calls for touching the two companion docs that name the old
9-domain grouping. Add this one-line note at the very top of **both**
`docs/wmi-concepts/coverage-matrix.md` and `docs/wmi-concepts/seed-taxonomy.md`
(immediately under their existing H1 title line):

```markdown
> The 9-domain grouping in this file reflects the original past-paper mining.
> The live concept taxonomy is the 6 olympiad strands — see
> `api/services/wmi/concepts/taxonomy.ts` and `taxonomy.md` › *Olympiad strand
> taxonomy (current)*.
```

Do not otherwise rewrite these files (their domain-keyed content stays as
historical mining reference).

- [ ] **Step 4: Verify the doc changes**

Run: `grep -n "Olympiad strand taxonomy (current)" docs/wmi-concepts/taxonomy.md`
Expected: one match.

Run: `grep -c "paste spec" docs/wmi-concepts/taxonomy.md`
Expected: `0` (no leftover placeholder comments).

Manually skim the inserted section to confirm the four tables rendered correctly.

- [ ] **Step 5: Commit**

```bash
git add docs/wmi-concepts/taxonomy.md docs/wmi-concepts/coverage-matrix.md docs/wmi-concepts/seed-taxonomy.md
git commit -m "docs(wmi): document olympiad strand taxonomy; mark domain tables as legacy"
```

---

## Final verification

- [ ] **Run the concept test suite**

Run: `npx vitest run api/services/wmi/concepts/taxonomy.test.ts api/services/wmi/concepts/preview.test.ts`
Expected: PASS — all tests green.

- [ ] **Typecheck + lint the whole project**

Run: `npm run check`
Expected: PASS (exit 0).

Run: `npm run lint`
Expected: PASS.

- [ ] **Manual smoke (optional)**

Run: `npm run dev`, sign in as admin, open `/admin/wmi/concepts`. Confirm the sidebar is grouped strand → topic, each row shows `d{n}` and ◆ for olympiad concepts, the strand/difficulty/olympiad filters narrow the list, and the header shows Difficulty + Olympiad chips.

---

## Notes for the implementer

- **ESM import specifiers:** inside `api/`, import with `.js` extensions (e.g. `./taxonomy.js`) even though the file is `.ts`. This is the repo convention; tsx/Vercel resolve it.
- **Tasks 2 + 3 are a contract pair.** Task 2 changes the JSON the `/admin/wmi/concepts` endpoint returns (drops `domain_label`, adds the new fields); Task 3 updates the client to read it. Between the two commits the admin page's grouping is briefly stale at runtime — land them together.
- **No DB / no learner UI.** `wmi_concepts` is untouched; `taxonomy.ts` is the source a future migration would seed from.
- **Difficulty/isOlympiad values** are the spec's first-pass judgment; they live in one map and are cheap to adjust later (sub-project C may revise them).
```

