// Storyboard for SEAMO-21-B-Q23 — post-answer explainer.
// "There are 1, 4 and 10 cubes in Figures 1, 2 and 3. How many altogether in Figs 1–5?"
// Answer: T(1)+T(2)+T(3)+T(4)+T(5) = 1+4+10+20+35 = 70.
//
// Each beat reveals one figure at a time and shows the running total.
// Beat 0: introduce the pattern (show Fig 1).
// Beat 1: show Fig 2 + explain T(n) formula.
// Beat 2: show Fig 3 + confirm T(3)=10.
// Beat 3: reveal Fig 4 = T(4) = 20 (not in original — student must extend).
// Beat 4: reveal Fig 5 = T(5) = 35.
// Beat 5: sum all five, land on 70.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TetraPhase = 'intro' | 'fig2' | 'fig3' | 'fig4' | 'fig5' | 'total'

export interface TetraCubes21B23Step {
  phase: TetraPhase
  /** How many figures are currently highlighted (1..5) */
  figureShown: number
  /** Running total so far */
  runningTotal: number
  /** Which figure index (0-based) is highlighted in gold */
  highlightIndex: number
  caption: string
  hold: number
  result: boolean
}

export interface TetraCubes21B23Storyboard {
  steps: TetraCubes21B23Step[]
  finalIndex: number
  answer: number
}

// Tetrahedral number T(n) = n(n+1)(n+2)/6
const TV = [0, 1, 4, 10, 20, 35]  // TV[n] = T(n), 1-indexed

export function buildTetraCubes21B23Steps(lang: Lang): TetraCubes21B23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TetraCubes21B23Step[] = []

  // Beat 0 — introduce pattern with Fig 1
  steps.push({
    phase: 'intro',
    figureShown: 1,
    runningTotal: 0,
    highlightIndex: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Each figure is a tetrahedral stack. Fig 1 has T(1) = 1 cube.',
      'Setiap gambar adalah tumpukan tetrahedral. Gambar 1 memiliki T(1) = 1 kubus.',
    ),
  })

  // Beat 1 — Fig 2
  steps.push({
    phase: 'fig2',
    figureShown: 2,
    runningTotal: TV[1],
    highlightIndex: 1,
    hold: 2400,
    result: false,
    caption: t(
      'Fig 2: T(2) = 2×3×4÷6 = 4 cubes. Running total: 1 + 4 = 5.',
      'Gambar 2: T(2) = 2×3×4÷6 = 4 kubus. Total sementara: 1 + 4 = 5.',
    ),
  })

  // Beat 2 — Fig 3
  steps.push({
    phase: 'fig3',
    figureShown: 3,
    runningTotal: TV[1] + TV[2],
    highlightIndex: 2,
    hold: 2400,
    result: false,
    caption: t(
      'Fig 3: T(3) = 3×4×5÷6 = 10 cubes. Running total: 5 + 10 = 15.',
      'Gambar 3: T(3) = 3×4×5÷6 = 10 kubus. Total sementara: 5 + 10 = 15.',
    ),
  })

  // Beat 3 — Fig 4 (extend the pattern)
  steps.push({
    phase: 'fig4',
    figureShown: 4,
    runningTotal: TV[1] + TV[2] + TV[3],
    highlightIndex: 3,
    hold: 2400,
    result: false,
    caption: t(
      'Fig 4: T(4) = 4×5×6÷6 = 20 cubes. Running total: 15 + 20 = 35.',
      'Gambar 4: T(4) = 4×5×6÷6 = 20 kubus. Total sementara: 15 + 20 = 35.',
    ),
  })

  // Beat 4 — Fig 5
  steps.push({
    phase: 'fig5',
    figureShown: 5,
    runningTotal: TV[1] + TV[2] + TV[3] + TV[4],
    highlightIndex: 4,
    hold: 2400,
    result: false,
    caption: t(
      'Fig 5: T(5) = 5×6×7÷6 = 35 cubes. Running total: 35 + 35 = 70.',
      'Gambar 5: T(5) = 5×6×7÷6 = 35 kubus. Total sementara: 35 + 35 = 70.',
    ),
  })

  // Beat 5 — grand total
  steps.push({
    phase: 'total',
    figureShown: 5,
    runningTotal: 70,
    highlightIndex: -1,
    hold: 0,
    result: true,
    caption: t(
      '1 + 4 + 10 + 20 + 35 = 70 cubes total.',
      '1 + 4 + 10 + 20 + 35 = 70 kubus seluruhnya.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 70 }
}
