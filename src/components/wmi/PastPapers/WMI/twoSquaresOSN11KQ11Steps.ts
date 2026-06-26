// OSN-11-SD-KAB-Q11 — animation storyboard
//
// Problem: two squares joined (L-shape), combined area = 100 cm², integer sides.
// Answer: perimeter = 44 cm.
//
// Teaching walk:
//   0. intro   — show the shape; state "Luas = 100 cm²".
//   1. sides   — find integer sides: a² + b² = 100 → 6² + 8² = 100.
//   2. perimeter — show the formula: 4×8 + 4×6 − 2×6 = 44 cm.
//   3. result  — 44 cm (highlight answer).

export type Lang = 'en' | 'id'

export type TwoSqPhase = 'intro' | 'sides' | 'perimeter' | 'result'

export interface TwoSqBeat {
  phase: TwoSqPhase
  /** Show side-length labels (6 and 8) on the squares. */
  showLabels: boolean
  /** Highlight the shared interior edge that is subtracted. */
  showSharedEdge: boolean
  /** Equation line shown below the figure ('' = hide). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface TwoSqStoryboard {
  steps: TwoSqBeat[]
  finalIndex: number
}

export function buildTwoSquaresOSN11KQ11Steps(lang: Lang): TwoSqStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TwoSqBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showLabels: false,
      showSharedEdge: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Two squares are joined together. Their combined area is 100 cm² and each side is a whole number.',
        'Dua persegi digabungkan. Luas gabungannya 100 cm² dan setiap sisi berupa bilangan bulat.',
      ),
    },

    // Beat 1 — find the integer sides
    {
      phase: 'sides',
      showLabels: true,
      showSharedEdge: false,
      equation: '6² + 8² = 36 + 64 = 100',
      hold: 2200,
      result: false,
      caption: t(
        'Find two whole numbers whose squares sum to 100: 6² + 8² = 100. The squares have sides 6 cm and 8 cm.',
        'Cari dua bilangan bulat yang kuadratnya berjumlah 100: 6² + 8² = 100. Sisi-sisinya adalah 6 cm dan 8 cm.',
      ),
    },

    // Beat 2 — perimeter formula
    {
      phase: 'perimeter',
      showLabels: true,
      showSharedEdge: true,
      equation: '(4×8) + (4×6) − 2×6 = 32 + 24 − 12 = 44',
      hold: 2400,
      result: false,
      caption: t(
        'Add all sides of both squares, then subtract the 2 shared interior edges: (4×8) + (4×6) − 2×6 = 44 cm.',
        'Jumlahkan semua sisi kedua persegi, lalu kurangi 2 sisi dalam yang bersekutu: (4×8) + (4×6) − 2×6 = 44 cm.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      showLabels: true,
      showSharedEdge: false,
      equation: 'Keliling = 44 cm',
      hold: 0,
      result: true,
      caption: t(
        'The perimeter of the compound shape is 44 cm.',
        'Keliling bangun gabungan adalah 44 cm.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
