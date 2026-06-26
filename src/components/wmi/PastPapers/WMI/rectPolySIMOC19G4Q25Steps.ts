// Steps storyboard for SIMOC-19-G4-Q25 explainer.
//
// Problem: rectilinear 8-sided polygon, sides a–h assigned {1..8}, maximise area.
// Constraints: b = d+f+h, c = a+e-g.
// Area formula: Area = b(a-g) + g·h + d·e
// Optimal assignment: a=7, b=8, c=6, d=2, e=3, f=1, g=4, h=5 → Area = 50.

export type Lang = 'en' | 'id'

export type PhaseRectPoly = 'intro' | 'constraint_h' | 'constraint_v' | 'formula' | 'assign' | 'result'

export interface StepRectPoly {
  phase: PhaseRectPoly
  /** Highlight horizontal sides b, d, f, h */
  highlightH: boolean
  /** Highlight vertical sides a, c, e, g */
  highlightV: boolean
  /** Show 3-rectangle area decomposition overlay */
  showFormula: boolean
  /** Show optimal value assignments next to labels */
  showAssign: boolean
  caption: string
  hold: number
  result: boolean
}

export interface StoryboardRectPoly {
  steps: StepRectPoly[]
  finalIndex: number
  answer: number
}

export function buildRectPolySIMOC19G4Q25Steps(lang: Lang): StoryboardRectPoly {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: StepRectPoly[] = []

  // 0 – intro
  steps.push({
    phase: 'intro',
    highlightH: false, highlightV: false, showFormula: false, showAssign: false,
    hold: 2000, result: false,
    caption: t(
      'A rectilinear polygon — all angles 90°. Assign 1–8 to sides a–h to maximise area.',
      'Poligon persegi panjang — semua sudut 90°. Tetapkan 1–8 ke sisi a–h untuk memaksimalkan luas.',
    ),
  })

  // 1 – horizontal constraint
  steps.push({
    phase: 'constraint_h',
    highlightH: true, highlightV: false, showFormula: false, showAssign: false,
    hold: 2400, result: false,
    caption: t(
      'Horizontal balance: b = d + f + h.',
      'Keseimbangan horizontal: b = d + f + h.',
    ),
  })

  // 2 – vertical constraint
  steps.push({
    phase: 'constraint_v',
    highlightH: false, highlightV: true, showFormula: false, showAssign: false,
    hold: 2400, result: false,
    caption: t(
      'Vertical balance: a + e = c + g, so c = a + e − g.',
      'Keseimbangan vertikal: a + e = c + g, sehingga c = a + e − g.',
    ),
  })

  // 3 – area decomposition
  steps.push({
    phase: 'formula',
    highlightH: false, highlightV: false, showFormula: true, showAssign: false,
    hold: 2800, result: false,
    caption: t(
      'Split into 3 rectangles: Luas = b·(a−g) + g·h + d·e.',
      'Bagi menjadi 3 persegi panjang: Luas = b·(a−g) + g·h + d·e.',
    ),
  })

  // 4 – optimal assignment
  steps.push({
    phase: 'assign',
    highlightH: false, highlightV: false, showFormula: false, showAssign: true,
    hold: 2800, result: false,
    caption: t(
      'Best: a=7, b=8, c=6, d=2, e=3, f=1, g=4, h=5.',
      'Terbaik: a=7, b=8, c=6, d=2, e=3, f=1, g=4, h=5.',
    ),
  })

  // 5 – result
  steps.push({
    phase: 'result',
    highlightH: false, highlightV: false, showFormula: false, showAssign: true,
    hold: 0, result: true,
    caption: t(
      '8×(7−4) + 4×5 + 2×3 = 24 + 20 + 6 = 50.',
      '8×(7−4) + 4×5 + 2×3 = 24 + 20 + 6 = 50.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 50 }
}
