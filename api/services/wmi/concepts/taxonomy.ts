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
  /**
   * LEARNING PATH, not a difficulty restatement — the two are independent axes.
   *   false = Fondasi   — taught by the school curriculum (Merdeka / Common
   *                       Core). The child must master it; levelling up means
   *                       fluency. e.g. `pattern-next` is d3 but IS school
   *                       material (Merdeka's Aljabar "pola" element).
   *   true  = Olimpiade — non-routine reasoning school never teaches:
   *                       deduction, systematic counting, spatial reasoning,
   *                       puzzles, working backwards. e.g. `grid-path-steps`
   *                       is only d2 but is NOT curriculum content.
   * Ask "is there a question like this in a school textbook?", never "is this
   * hard?". Corrected 2026-07 — the flag previously tracked difficulty (every
   * true was d>=3, every false d<=3), which made it useless as a path split.
   */
  isOlympiad: boolean
}

// Contest difficulty (1-5) collapsed to the learner-facing Easy/Medium/Hard
// facet. Distinct from curriculum.ts's within-subject 1-3 ordering: this answers
// "how hard is this concept as a contest problem", not "what order in its subject".
export type DifficultyBand = 'easy' | 'medium' | 'hard'
export function difficultyBand(d: 1 | 2 | 3 | 4 | 5): DifficultyBand {
  return d <= 2 ? 'easy' : d === 3 ? 'medium' : 'hard'
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
  'arrange-digits-to-form-number': { strand: 'NT', topic: 'NT-PV', difficulty: 3, isOlympiad: false },
  'digit-sum': { strand: 'NT', topic: 'NT-DIG', difficulty: 3, isOlympiad: false },
  'digit-frequency': { strand: 'NT', topic: 'NT-DIG', difficulty: 3, isOlympiad: true },
  'find-number-by-digit-sum': { strand: 'NT', topic: 'NT-DIG', difficulty: 3, isOlympiad: true },
  'divisibility-multiple-property': { strand: 'NT', topic: 'NT-DIV', difficulty: 4, isOlympiad: true },
  'product-of-consecutive': { strand: 'NT', topic: 'NT-DIV', difficulty: 4, isOlympiad: true },
  'odd-even-reasoning': { strand: 'NT', topic: 'NT-PAR', difficulty: 3, isOlympiad: false },
  'perfect-square-search': { strand: 'NT', topic: 'NT-PAR', difficulty: 4, isOlympiad: true },
  'compare-order-numbers': { strand: 'NT', topic: 'NT-CMP', difficulty: 1, isOlympiad: false },
  'fraction-of-region': { strand: 'NT', topic: 'NT-FRAC', difficulty: 2, isOlympiad: false },
  'equivalent-fraction-fill': { strand: 'NT', topic: 'NT-FRAC', difficulty: 3, isOlympiad: false },

  // AP — Algebra & Patterns
  'pattern-next': { strand: 'AP', topic: 'AP-NPAT', difficulty: 3, isOlympiad: false },
  'number-pyramid': { strand: 'AP', topic: 'AP-NPAT', difficulty: 3, isOlympiad: true },
  'number-line-jumps': { strand: 'AP', topic: 'AP-NPAT', difficulty: 2, isOlympiad: false },
  'visual-pattern-next': { strand: 'AP', topic: 'AP-VPAT', difficulty: 3, isOlympiad: false },
  'shape-transformation-rule': { strand: 'AP', topic: 'AP-VPAT', difficulty: 3, isOlympiad: false },
  'custom-operation': { strand: 'AP', topic: 'AP-FUNC', difficulty: 4, isOlympiad: true },
  'operator-fill': { strand: 'AP', topic: 'AP-FUNC', difficulty: 3, isOlympiad: true },
  'legs-items-rate': { strand: 'AP', topic: 'AP-RATE', difficulty: 3, isOlympiad: true },
  'distance-rate-time': { strand: 'AP', topic: 'AP-RATE', difficulty: 4, isOlympiad: true },
  'rope-wraps-ratio': { strand: 'AP', topic: 'AP-RATE', difficulty: 3, isOlympiad: true },
  'net-progress-cycles': { strand: 'AP', topic: 'AP-RATE', difficulty: 4, isOlympiad: true },

  // CO — Combinatorics & Counting
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
  'block-count-3d': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: false },
  'dice-opposite-faces': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: true },
  'dice-net-fold': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: true },
  'direction-orientation': { strand: 'GE', topic: 'GE-3D', difficulty: 2, isOlympiad: false },
  'grid-path-steps': { strand: 'GE', topic: 'GE-PATH', difficulty: 2, isOlympiad: true },
  'maze-path-shortest': { strand: 'GE', topic: 'GE-PATH', difficulty: 3, isOlympiad: true },
  'clock-read-time': { strand: 'GE', topic: 'GE-MEAS', difficulty: 1, isOlympiad: false },
  'clock-time-after': { strand: 'GE', topic: 'GE-MEAS', difficulty: 2, isOlympiad: false },
  'unit-conversion': { strand: 'GE', topic: 'GE-MEAS', difficulty: 2, isOlympiad: false },
  'scale-read': { strand: 'GE', topic: 'GE-MEAS', difficulty: 2, isOlympiad: false },

  // LR — Logic & Reasoning
  'truth-order-clues': { strand: 'LR', topic: 'LR-DED', difficulty: 4, isOlympiad: true },
  'position-in-line': { strand: 'LR', topic: 'LR-DED', difficulty: 3, isOlympiad: false },
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

  // Gap-fill concepts derived from the WMI drill concept map (2026-07).
  'solve-symbol-equations': { strand: 'AP', topic: 'AP-FUNC', difficulty: 3, isOlympiad: false },
  'rank-computed-expressions': { strand: 'AR', topic: 'AR-CALC', difficulty: 3, isOlympiad: false },
  'calendar-day-reasoning': { strand: 'GE', topic: 'GE-MEAS', difficulty: 3, isOlympiad: false },
  'painted-cube-faces-count': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: true },
  'cryptarithmetic-addition': { strand: 'NT', topic: 'NT-DIG', difficulty: 4, isOlympiad: true },
  'consecutive-integer-sum': { strand: 'AP', topic: 'AP-NPAT', difficulty: 4, isOlympiad: true },
  'common-factor-shortcut': { strand: 'AR', topic: 'AR-CALC', difficulty: 2, isOlympiad: true },
  'container-capacity-allocation': { strand: 'CO', topic: 'CO-ARR', difficulty: 3, isOlympiad: false },

  // Mined from 350 real WMI grade-1 questions (2019-2025).
  'sort-count-by-attribute': { strand: 'CO', topic: 'CO-OBJ', difficulty: 2, isOlympiad: false },
  'count-many-objects': { strand: 'CO', topic: 'CO-OBJ', difficulty: 1, isOlympiad: false },
  'number-figure-rule': { strand: 'AP', topic: 'AP-NPAT', difficulty: 3, isOlympiad: true },
  'sequence-repair': { strand: 'AP', topic: 'AP-NPAT', difficulty: 3, isOlympiad: true },
  'length-measure-compare': { strand: 'GE', topic: 'GE-MEAS', difficulty: 2, isOlympiad: false },
  'balance-substitution': { strand: 'LR', topic: 'LR-BAL', difficulty: 2, isOlympiad: true },
  'count-two-digit-numbers': { strand: 'NT', topic: 'NT-DIG', difficulty: 3, isOlympiad: true },
  'transfer-to-equalize': { strand: 'AR', topic: 'AR-STORY', difficulty: 3, isOlympiad: true },
  // Mined from the 1050-question WMI corpus (grades 1-3), July 2026.
  'book-sheet-pages': { strand: 'NT', topic: 'NT-PV', difficulty: 3, isOlympiad: true },
  'comparison-chain-solve': { strand: 'AR', topic: 'AR-STORY', difficulty: 3, isOlympiad: false },
  'count-numbers-from-digits': { strand: 'CO', topic: 'CO-ARR', difficulty: 3, isOlympiad: true },
  'delete-digits-extremise': { strand: 'NT', topic: 'NT-PV', difficulty: 4, isOlympiad: true },
  'digits-into-equation-fill': { strand: 'AP', topic: 'AP-FUNC', difficulty: 4, isOlympiad: true },
  'min-adjacent-swaps': { strand: 'CO', topic: 'CO-ARR', difficulty: 3, isOlympiad: true },
  'ordinal-position-read': { strand: 'CO', topic: 'CO-OBJ', difficulty: 2, isOlympiad: false },
  'subset-sum-target': { strand: 'CO', topic: 'CO-ARR', difficulty: 3, isOlympiad: true },
  // Wave 2 of the corpus mining: the families that needed a figure primitive.
  'compare-fractions': { strand: 'NT', topic: 'NT-FRAC', difficulty: 2, isOlympiad: false },
  'cryptarithmetic-multiplication': { strand: 'NT', topic: 'NT-DIG', difficulty: 4, isOlympiad: true },
  'growing-figure-nth-term': { strand: 'AP', topic: 'AP-VPAT', difficulty: 4, isOlympiad: true },
  'latin-square-cage': { strand: 'LR', topic: 'LR-CON', difficulty: 4, isOlympiad: true },
  'map-route-distance': { strand: 'GE', topic: 'GE-PATH', difficulty: 3, isOlympiad: true },
  'mastermind-code-deduce': { strand: 'LR', topic: 'LR-DED', difficulty: 4, isOlympiad: true },
  'odd-one-out': { strand: 'LR', topic: 'LR-DED', difficulty: 3, isOlympiad: true },
  'path-sum-optimize': { strand: 'GE', topic: 'GE-PATH', difficulty: 4, isOlympiad: true },
  'pieces-fill-region': { strand: 'GE', topic: 'GE-SHAPE', difficulty: 3, isOlympiad: true },
  'row-column-sum-grid': { strand: 'AP', topic: 'AP-FUNC', difficulty: 3, isOlympiad: true },
  'tile-fill-count': { strand: 'GE', topic: 'GE-AREA', difficulty: 2, isOlympiad: false },
  'views-of-solid': { strand: 'GE', topic: 'GE-3D', difficulty: 3, isOlympiad: true },
  'visit-all-cells-path': { strand: 'GE', topic: 'GE-PATH', difficulty: 4, isOlympiad: true },
  // Wave 3: the area-and-measurement families, two of which needed new primitives.
  'compose-shape-perimeter': { strand: 'GE', topic: 'GE-AREA', difficulty: 3, isOlympiad: false },
  'grid-shaded-area-count': { strand: 'GE', topic: 'GE-AREA', difficulty: 3, isOlympiad: false },
  'interval-fencepost-count': { strand: 'GE', topic: 'GE-MEAS', difficulty: 3, isOlympiad: true },
  'iterated-rule-far-term': { strand: 'AP', topic: 'AP-NPAT', difficulty: 4, isOlympiad: true },
  'rectangle-area-decompose': { strand: 'GE', topic: 'GE-AREA', difficulty: 4, isOlympiad: true },
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
  'rank-computed-expressions': 'A10',
  'common-factor-shortcut': 'A11',
  'cryptarithmetic-addition': 'N16',
  'consecutive-integer-sum': 'P6',
  'solve-symbol-equations': 'L9',
  'container-capacity-allocation': 'C6',
  'painted-cube-faces-count': 'G15',
  'calendar-day-reasoning': 'M5',
  'sort-count-by-attribute': 'D4',
  'count-many-objects': 'C7',
  'number-figure-rule': 'P7',
  'sequence-repair': 'P8',
  'length-measure-compare': 'M6',
  'balance-substitution': 'L10',
  'count-two-digit-numbers': 'N17',
  'transfer-to-equalize': 'W11',
  'subset-sum-target': 'C8',
  'ordinal-position-read': 'C9',
  'count-numbers-from-digits': 'C10',
  'min-adjacent-swaps': 'C11',
  'delete-digits-extremise': 'N18',
  'book-sheet-pages': 'N19',
  'digits-into-equation-fill': 'P9',
  'comparison-chain-solve': 'W12',
  // Wave 2. Assigned centrally: four separate agents each proposed 'G16' for
  // their own concept, every one of them correctly reading G15 as the highest
  // in use. None could see the others, so the numbering is settled here.
  'pieces-fill-region': 'G16',
  'views-of-solid': 'G17',
  'map-route-distance': 'G18',
  'visit-all-cells-path': 'G19',
  'path-sum-optimize': 'G20',
  'tile-fill-count': 'G21',
  'row-column-sum-grid': 'P10',
  'growing-figure-nth-term': 'P11',
  'latin-square-cage': 'L11',
  'odd-one-out': 'L12',
  'mastermind-code-deduce': 'L13',
  'cryptarithmetic-multiplication': 'N20',
  'compare-fractions': 'N21',
  // Wave 3.
  'grid-shaded-area-count': 'G22',
  'compose-shape-perimeter': 'G23',
  'rectangle-area-decompose': 'G24',
  'interval-fencepost-count': 'M7',
  'iterated-rule-far-term': 'P12',
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
