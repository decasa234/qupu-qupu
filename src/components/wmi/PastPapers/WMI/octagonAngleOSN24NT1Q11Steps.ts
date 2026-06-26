// OSN-24-SD-NAS-TEORI1-Q11 — animation storyboard.
//
// Regular octagon; A=upper-left (v7, 135°), B=bottom (v4, 270°), C=right (v2, 0°).
// A and B are 3 vertices apart (counterclockwise).
// Arc AB not through C = 3 × 45° = 135°.
// By the inscribed-angle theorem: ∠ACB = arc/2 = 67.5°.
//
// Beats:
//   0  intro       — show octagon + triangle ACB + "?" at C.
//   1  arc         — highlight 3 edges A→v6→v5→B (the short path). Eqn: 3 × 45° = 135°.
//   2  inscribed   — show the inscribed-angle rule. Eqn: 135° ÷ 2.
//   3  result      — replace "?" with 67.5° in green.

export type Lang = 'en' | 'id'

export interface OctBeat {
  /** Show highlighted path A→v6→v5→B */
  showEdges: boolean
  /** Show the inscribed-angle formula below the figure */
  showFormula: boolean
  /** Replace "?" at C with the answer */
  showResult: boolean
  /** Text for the equation pill below the SVG */
  equation: string
  /** Explanation caption */
  caption: string
  /** Auto-hold in ms; 0 = final / manual */
  hold: number
}

export interface OctStoryboard {
  steps: OctBeat[]
  finalIndex: number
}

export function buildOctagonAngleSteps(lang: Lang): OctStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: OctBeat[] = [
    // Beat 0 — intro
    {
      showEdges: false,
      showFormula: false,
      showResult: false,
      equation: '',
      hold: 2000,
      caption: t(
        'A, B, and C are vertices of a regular octagon. What is angle ACB?',
        'A, B, dan C adalah titik sudut segi delapan beraturan. Berapa besar sudut ACB?',
      ),
    },

    // Beat 1 — count steps from A to B (short path, not through C)
    {
      showEdges: true,
      showFormula: false,
      showResult: false,
      equation: '3 × 45° = 135°',
      hold: 2400,
      caption: t(
        'From A to B (not through C) takes 3 edges. Each edge spans 360°÷8 = 45°. So arc AB = 3 × 45° = 135°.',
        'Dari A ke B (tidak melalui C) ada 3 sisi. Tiap sisi = 360°÷8 = 45°. Jadi busur AB = 3 × 45° = 135°.',
      ),
    },

    // Beat 2 — inscribed angle theorem
    {
      showEdges: true,
      showFormula: true,
      showResult: false,
      equation: '135° ÷ 2',
      hold: 2400,
      caption: t(
        'The inscribed angle theorem: an angle at a point on a circle equals half the arc it subtends. ∠ACB = 135° ÷ 2.',
        'Teorema sudut tali busur: sudut di titik pada lingkaran = setengah busur yang dihadapinya. ∠ACB = 135° ÷ 2.',
      ),
    },

    // Beat 3 — result
    {
      showEdges: true,
      showFormula: false,
      showResult: true,
      equation: '∠ACB = 67,5°',
      hold: 0,
      caption: t(
        '∠ACB = 135° ÷ 2 = 67.5°.',
        '∠ACB = 135° ÷ 2 = 67,5°.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
