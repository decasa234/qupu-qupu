// IKMC-19-PE-Q14 — storyboard for the painted-surface animation.
//
// The question: five 4-cube shapes must be painted. Which has the smallest
// painted area? Answer: B (the 2×2 block).
//
// Key insight:
//   - 4 cubes alone = 4 × 6 = 24 total faces.
//   - Each glued joint hides 2 faces (one from each cube).
//   - More joints → more hidden faces → less to paint.
//
//   Joins & painted area per shape:
//     A (1×4 row):  3 joints → 24 − 6 = 18 painted
//     B (2×2 block):4 joints → 24 − 8 = 16 painted  ← smallest
//     C (L-shape):  3 joints → 18 painted
//     D (T-shape):  3 joints → 18 painted
//     E (staircase):3 joints → 18 painted
//
// Teaching walk, one idea per beat:
//   0. intro    — each shape uses 4 cubes; 4 × 6 = 24 faces total.
//   1. joins    — gluing hides 2 faces per joint; more joints = less painting.
//   2. shapeA   — A has 3 joints → 24 − 6 = 18 painted.
//   3. shapeB   — B has 4 joints → 24 − 8 = 16 painted (fewest!).
//   4. shapesCDE— C, D, E each have 3 joints → 18 painted.
//   5. result   — B paints the least → answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CubePhaseId =
  | 'intro'
  | 'joins'
  | 'shapeA'
  | 'shapeB'
  | 'shapesCDE'
  | 'result'

export interface CubeShapeBeat {
  /** Which animation phase this beat belongs to. */
  phase: CubePhaseId
  /**
   * Which shape letter is currently highlighted in the animation ('A'…'E' or null
   * for non-shape beats).
   */
  activeShape: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Number of joints shown for the active shape (or null). */
  joints: number | null
  /** Painted face count shown for the active shape (or null). */
  painted: number | null
  /** Whether this is the answer shape (B). */
  isAnswer: boolean
  /** Equation or tally string shown below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CubeShapeStoryboard {
  steps: CubeShapeBeat[]
  finalIndex: number
}

export function buildCubeShapes14Steps(lang: Lang): CubeShapeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeShapeBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeShape: null,
      joints: null,
      painted: null,
      isAnswer: false,
      equation: '4 × 6 = 24',
      hold: 2400,
      result: false,
      caption: t(
        'Each shape uses 4 cubes. Every cube has 6 faces → 4 × 6 = 24 faces in total.',
        'Setiap bentuk memakai 4 kubus. Setiap kubus punya 6 sisi → 4 × 6 = 24 sisi total.',
      ),
    },

    // Beat 1 — key idea: joints hide faces
    {
      phase: 'joins',
      activeShape: null,
      joints: null,
      painted: null,
      isAnswer: false,
      equation: '−2 per joint',
      hold: 2400,
      result: false,
      caption: t(
        'When two cubes are glued, 2 faces are hidden and don\'t need painting. More joints → less to paint!',
        'Saat dua kubus direkatkan, 2 sisi tersembunyi dan tidak perlu dicat. Lebih banyak sambungan → lebih sedikit dicat!',
      ),
    },

    // Beat 2 — shape A
    {
      phase: 'shapeA',
      activeShape: 'A',
      joints: 3,
      painted: 18,
      isAnswer: false,
      equation: '24 − 3×2 = 18',
      hold: 2200,
      result: false,
      caption: t(
        'A (row of 4): 3 joints, hides 6 faces → 18 faces to paint.',
        'A (barisan 4): 3 sambungan, sembunyikan 6 sisi → 18 sisi dicat.',
      ),
    },

    // Beat 3 — shape B (the answer)
    {
      phase: 'shapeB',
      activeShape: 'B',
      joints: 4,
      painted: 16,
      isAnswer: true,
      equation: '24 − 4×2 = 16',
      hold: 2200,
      result: false,
      caption: t(
        'B (2×2 block): 4 joints, hides 8 faces → only 16 faces to paint — the fewest!',
        'B (blok 2×2): 4 sambungan, sembunyikan 8 sisi → hanya 16 sisi dicat — paling sedikit!',
      ),
    },

    // Beat 4 — shapes C, D, E
    {
      phase: 'shapesCDE',
      activeShape: null,
      joints: 3,
      painted: 18,
      isAnswer: false,
      equation: '24 − 3×2 = 18',
      hold: 2200,
      result: false,
      caption: t(
        'C (L-shape), D (T-shape), E (staircase): each has 3 joints → 18 faces to paint.',
        'C (bentuk L), D (bentuk T), E (tangga): masing-masing 3 sambungan → 18 sisi dicat.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      activeShape: 'B',
      joints: 4,
      painted: 16,
      isAnswer: true,
      equation: '16 < 18 → B',
      hold: 0,
      result: true,
      caption: t(
        'The 2×2 block (B) has the most hidden faces and the smallest painted area — answer B.',
        'Blok 2×2 (B) punya sisi tersembunyi terbanyak dan luas dicat terkecil — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
