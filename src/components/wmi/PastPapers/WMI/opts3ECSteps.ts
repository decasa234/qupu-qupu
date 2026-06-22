// IKMC-20-EC-Q3 — storyboard for the shading-grid animation.
//
// Problem: Tysger shades every cell in a 2×3 grid where the result equals 20.
//   Grid (row, col):
//     [0,0] 16+4=20  ✓  shade
//     [0,1] 19+1=20  ✓  shade
//     [0,2] 28−8=20  ✓  shade
//     [1,0] 2×10=20  ✓  shade
//     [1,1] 16−4=12  ✗  leave blank
//     [1,2] 7×3=21   ✗  leave blank
//   Shaded pattern → 4 cells (entire top row + bottom-left) = Shape A.
//
// Teaching walk, one idea per beat:
//   0. intro    — show the unsolved 2×3 grid; state the task.
//   1. row1-col1 — evaluate 16+4=20 → shade [0,0].
//   2. row1-col2 — evaluate 19+1=20 → shade [0,1].
//   3. row1-col3 — evaluate 28−8=20 → shade [0,2].
//   4. row2-col1 — evaluate 2×10=20 → shade [1,0].
//   5. row2-col2 — evaluate 16−4=12 → leave blank [1,1].
//   6. row2-col3 — evaluate 7×3=21  → leave blank [1,2].
//   7. result   — 4 cells shaded: entire top row + bottom-left = Shape A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'cell-00'
  | 'cell-01'
  | 'cell-02'
  | 'cell-10'
  | 'cell-11'
  | 'cell-12'
  | 'result'

export interface ShadeBeat {
  /** Which animation phase this beat belongs to. */
  phase: PhaseId
  /**
   * Shading state of each cell at this beat, row-major.
   * null = not yet evaluated (show plain empty).
   * false = evaluated as ≠20 (stays white).
   * true  = evaluated as =20 (shade).
   */
  cells: Array<Array<boolean | null>>
  /**
   * If set, draw an accent ring around this [row, col] to focus attention.
   * null = no ring.
   */
  focus: [number, number] | null
  /** Equation pill text ('' = hide). */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface ShadeStoryboard {
  steps: ShadeBeat[]
  finalIndex: number
}

/** Helper: clone a 2×3 cell matrix. */
function cloneGrid(g: Array<Array<boolean | null>>): Array<Array<boolean | null>> {
  return g.map((row) => [...row])
}

export function buildOpts3ECSteps(lang: Lang): ShadeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Start: all cells unevaluated
  const blank: Array<Array<boolean | null>> = [
    [null, null, null],
    [null, null, null],
  ]

  // Progressive grids built beat-by-beat
  const g0 = cloneGrid(blank)

  const g1 = cloneGrid(g0); g1[0][0] = true
  const g2 = cloneGrid(g1); g2[0][1] = true
  const g3 = cloneGrid(g2); g3[0][2] = true
  const g4 = cloneGrid(g3); g4[1][0] = true
  const g5 = cloneGrid(g4); g5[1][1] = false
  const g6 = cloneGrid(g5); g6[1][2] = false

  // Final grid (same as g6, fully evaluated)
  const gFinal = cloneGrid(g6)

  const steps: ShadeBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      cells: g0,
      focus: null,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Tysger shades every cell that equals 20. Let\'s check each one.',
        'Tysger mengarsir setiap kotak yang hasilnya 20. Mari kita periksa satu per satu.',
      ),
    },

    // Beat 1 — cell [0,0]: 16+4
    {
      phase: 'cell-00',
      cells: g1,
      focus: [0, 0],
      equation: '16 + 4 = 20 ✓',
      hold: 2200,
      result: false,
      caption: t(
        '16 + 4 = 20 — shade the top-left cell.',
        '16 + 4 = 20 — arsir kotak kiri atas.',
      ),
    },

    // Beat 2 — cell [0,1]: 19+1
    {
      phase: 'cell-01',
      cells: g2,
      focus: [0, 1],
      equation: '19 + 1 = 20 ✓',
      hold: 2200,
      result: false,
      caption: t(
        '19 + 1 = 20 — shade the top-middle cell.',
        '19 + 1 = 20 — arsir kotak tengah atas.',
      ),
    },

    // Beat 3 — cell [0,2]: 28−8
    {
      phase: 'cell-02',
      cells: g3,
      focus: [0, 2],
      equation: '28 − 8 = 20 ✓',
      hold: 2200,
      result: false,
      caption: t(
        '28 − 8 = 20 — shade the top-right cell.',
        '28 − 8 = 20 — arsir kotak kanan atas.',
      ),
    },

    // Beat 4 — cell [1,0]: 2×10
    {
      phase: 'cell-10',
      cells: g4,
      focus: [1, 0],
      equation: '2 × 10 = 20 ✓',
      hold: 2200,
      result: false,
      caption: t(
        '2 × 10 = 20 — shade the bottom-left cell.',
        '2 × 10 = 20 — arsir kotak kiri bawah.',
      ),
    },

    // Beat 5 — cell [1,1]: 16−4
    {
      phase: 'cell-11',
      cells: g5,
      focus: [1, 1],
      equation: '16 − 4 = 12 ✗',
      hold: 2200,
      result: false,
      caption: t(
        '16 − 4 = 12, not 20 — leave the bottom-middle cell blank.',
        '16 − 4 = 12, bukan 20 — biarkan kotak tengah bawah kosong.',
      ),
    },

    // Beat 6 — cell [1,2]: 7×3
    {
      phase: 'cell-12',
      cells: g6,
      focus: [1, 2],
      equation: '7 × 3 = 21 ✗',
      hold: 2200,
      result: false,
      caption: t(
        '7 × 3 = 21, not 20 — leave the bottom-right cell blank.',
        '7 × 3 = 21, bukan 20 — biarkan kotak kanan bawah kosong.',
      ),
    },

    // Beat 7 — result
    {
      phase: 'result',
      cells: gFinal,
      focus: null,
      equation: '4 cells = Shape A',
      hold: 0,
      result: true,
      caption: t(
        '4 cells are shaded: the entire top row plus the bottom-left cell. That shape is A.',
        '4 kotak diarsir: seluruh baris atas ditambah kotak kiri bawah. Bentuk itu adalah A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
