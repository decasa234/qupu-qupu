// IKMC-20-PE-Q11 — storyboard for the cube-count animation.
//
// "Five shapes are made by glueing cubes together face to face.
//  Which shape uses the most cubes?"  Answer: E (green, 6 cubes).
//
// Cube counts per shape:
//   A (yellow, staircase): 4 cubes
//   B (orange, plus/cross): 5 cubes
//   C (pink, S-pentomino): 5 cubes
//   D (purple, Z-pentomino): 5 cubes
//   E (green, L-tower): 6 cubes  ← most!
//
// Teaching walk, one idea per beat:
//   0. intro     — count the cubes in each shape; some may be hidden.
//   1. shapeA    — A (staircase): 4 cubes.
//   2. shapeB    — B (plus): 5 cubes.
//   3. shapesCDE — C (S-shape): 5 cubes; D (Z-shape): 5 cubes.
//   4. shapeE    — E (L-tower): 6 cubes — the most!
//   5. result    — E uses the most cubes → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Opts11PhaseId =
  | 'intro'
  | 'shapeA'
  | 'shapeB'
  | 'shapeCD'
  | 'shapeE'
  | 'result'

export interface Opts11Beat {
  /** Which animation phase this beat belongs to. */
  phase: Opts11PhaseId
  /** Shape label(s) highlighted this beat, or empty set for intro. */
  activeShapes: ReadonlyArray<'A' | 'B' | 'C' | 'D' | 'E'>
  /** Cube count shown for the primary highlighted shape (null for intro). */
  count: number | null
  /** Whether all highlighted shapes are being eliminated (not the answer). */
  eliminated: boolean
  /** Whether this is the final-answer beat. */
  result: boolean
  /** Equation chip text; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
}

export interface Opts11Storyboard {
  steps: Opts11Beat[]
  finalIndex: number
}

export function buildOpts11PESteps(lang: Lang): Opts11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Opts11Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeShapes: [],
      count: null,
      eliminated: false,
      result: false,
      equation: '',
      hold: 2200,
      caption: t(
        'Count all the cubes in each shape — including any hidden behind the visible faces!',
        'Hitung semua kubus di setiap bentuk — termasuk yang tersembunyi di belakang sisi yang terlihat!',
      ),
    },

    // Beat 1 — shape A
    {
      phase: 'shapeA',
      activeShapes: ['A'],
      count: 4,
      eliminated: true,
      result: false,
      equation: 'A = 4',
      hold: 2000,
      caption: t(
        'Shape A (yellow staircase): 4 cubes. Keep going — can we find more?',
        'Bentuk A (tangga kuning): 4 kubus. Lanjutkan — bisakah kita menemukan lebih banyak?',
      ),
    },

    // Beat 2 — shape B
    {
      phase: 'shapeB',
      activeShapes: ['B'],
      count: 5,
      eliminated: true,
      result: false,
      equation: 'B = 5',
      hold: 2000,
      caption: t(
        'Shape B (orange plus): 5 cubes arranged in a cross. More than A!',
        'Bentuk B (salib oranye): 5 kubus tersusun silang. Lebih banyak dari A!',
      ),
    },

    // Beat 3 — shapes C and D
    {
      phase: 'shapeCD',
      activeShapes: ['C', 'D'],
      count: 5,
      eliminated: true,
      result: false,
      equation: 'C = 5, D = 5',
      hold: 2200,
      caption: t(
        'Shapes C (pink S) and D (purple Z): both have 5 cubes — same as B.',
        'Bentuk C (S merah muda) dan D (Z ungu): keduanya punya 5 kubus — sama seperti B.',
      ),
    },

    // Beat 4 — shape E (the answer)
    {
      phase: 'shapeE',
      activeShapes: ['E'],
      count: 6,
      eliminated: false,
      result: false,
      equation: 'E = 6',
      hold: 2200,
      caption: t(
        'Shape E (green L-tower): 4 in the base row + 2 stacked on the left = 6 cubes!',
        'Bentuk E (menara L hijau): 4 di baris dasar + 2 di atas kiri = 6 kubus!',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      activeShapes: ['E'],
      count: 6,
      eliminated: false,
      result: true,
      equation: '6 > 5 > 4 → E',
      hold: 0,
      caption: t(
        'Shape E uses 6 cubes — the most of all five shapes. Answer: E.',
        'Bentuk E menggunakan 6 kubus — terbanyak dari kelima bentuk. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
