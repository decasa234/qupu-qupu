import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type DiamondHKPhase = 'show' | 'diamond1' | 'diamond2' | 'solve' | 'result'

export interface DiamondHKStep {
  phase: DiamondHKPhase
  highlightIndex: number   // -1=none, 0/1/2
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface DiamondHKStoryboard {
  steps: DiamondHKStep[]
  finalIndex: number
}

// Problem constants — bound to seed quantities for HKIMO-23-P3SF-Q1
const D1_TOP = 9,  D1_LEFT = 12, D1_RIGHT = 3,  D1_BOTTOM = 4
const D2_TOP = 63, D2_LEFT = 27, D2_RIGHT = 7,  D2_BOTTOM = 3
const D3_TOP = 40,               D3_RIGHT = 12, D3_BOTTOM = 9
export const ANSWER = 30

export function buildDiamondPatternHK23P3SFQ1Steps(lang: Lang): DiamondHKStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiamondHKStep[] = [
    {
      phase: 'show',
      highlightIndex: -1,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Three diamonds — each has four numbers at top, left, right, bottom. Find the hidden rule.',
        'Tiga berlian — masing-masing punya empat angka: atas, kiri, kanan, bawah. Temukan aturan tersembunyi.',
      ),
    },
    {
      phase: 'diamond1',
      highlightIndex: 0,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Diamond 1: top × bottom = ${D1_TOP} × ${D1_BOTTOM} = ${D1_TOP * D1_BOTTOM}; left × right = ${D1_LEFT} × ${D1_RIGHT} = ${D1_LEFT * D1_RIGHT}. They match!`,
        `Berlian 1: atas × bawah = ${D1_TOP} × ${D1_BOTTOM} = ${D1_TOP * D1_BOTTOM}; kiri × kanan = ${D1_LEFT} × ${D1_RIGHT} = ${D1_LEFT * D1_RIGHT}. Sama!`,
      ),
    },
    {
      phase: 'diamond2',
      highlightIndex: 1,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Diamond 2: top × bottom = ${D2_TOP} × ${D2_BOTTOM} = ${D2_TOP * D2_BOTTOM}; left × right = ${D2_LEFT} × ${D2_RIGHT} = ${D2_LEFT * D2_RIGHT} ✓ — rule confirmed!`,
        `Berlian 2: atas × bawah = ${D2_TOP} × ${D2_BOTTOM} = ${D2_TOP * D2_BOTTOM}; kiri × kanan = ${D2_LEFT} × ${D2_RIGHT} = ${D2_LEFT * D2_RIGHT} ✓ — aturan terkonfirmasi!`,
      ),
    },
    {
      phase: 'solve',
      highlightIndex: 2,
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        `Diamond 3: ? × ${D3_RIGHT} = ${D3_TOP} × ${D3_BOTTOM} = ${D3_TOP * D3_BOTTOM};  ? = ${D3_TOP * D3_BOTTOM} ÷ ${D3_RIGHT} = ${ANSWER}.`,
        `Berlian 3: ? × ${D3_RIGHT} = ${D3_TOP} × ${D3_BOTTOM} = ${D3_TOP * D3_BOTTOM};  ? = ${D3_TOP * D3_BOTTOM} ÷ ${D3_RIGHT} = ${ANSWER}.`,
      ),
    },
    {
      phase: 'result',
      highlightIndex: 2,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Answer: ${ANSWER}. Check: ${D3_TOP} × ${D3_BOTTOM} = ${D3_TOP * D3_BOTTOM} = ${ANSWER} × ${D3_RIGHT} = ${ANSWER * D3_RIGHT} ✓`,
        `Jawaban: ${ANSWER}. Cek: ${D3_TOP} × ${D3_BOTTOM} = ${D3_TOP * D3_BOTTOM} = ${ANSWER} × ${D3_RIGHT} = ${ANSWER * D3_RIGHT} ✓`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
