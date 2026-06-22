// Step storyboard for SEAMO-16-A-Q20 explainer.
// Strategy: add all three equations → 2(□+◆+⊙) = 128 → total = 64 → ⊙ = 64−36 = 28.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CIRCLE_VALUE, SUM_ALL, TRIPLE_SUM, SQUARE_DIAMOND_SUM } from './PairSums16A20Illustration'

export type PS20Phase = 'show' | 'sumAll' | 'halfSum' | 'subtract' | 'result'

export interface PS20Step {
  phase: PS20Phase
  highlightRow: number | null
  showAnswer: boolean
  dimFirst: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PS20Storyboard {
  steps: PS20Step[]
  finalIndex: number
  circleValue: number
}

export function buildPairSums16A20Steps(lang: Lang): PS20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PS20Step[] = [
    {
      phase: 'show',
      highlightRow: null,
      showAnswer: false,
      dimFirst: false,
      hold: 1700,
      result: false,
      caption: t(
        'Three pair-sum equations given. We need the value of the yellow circle.',
        'Tiga persamaan jumlah pasangan diberikan. Kita perlu nilai lingkaran kuning.',
      ),
    },
    {
      phase: 'sumAll',
      highlightRow: null,
      showAnswer: false,
      dimFirst: false,
      hold: 2200,
      result: false,
      caption: t(
        `Add ALL three: 36 + 40 + 52 = ${SUM_ALL}. Each symbol appears exactly twice.`,
        `Jumlahkan semua: 36 + 40 + 52 = ${SUM_ALL}. Setiap simbol muncul tepat dua kali.`,
      ),
    },
    {
      phase: 'halfSum',
      highlightRow: null,
      showAnswer: false,
      dimFirst: false,
      hold: 2000,
      result: false,
      caption: t(
        `So 2×(□ + ◆ + ⊙) = ${SUM_ALL}, giving □ + ◆ + ⊙ = ${TRIPLE_SUM}.`,
        `Jadi 2×(□ + ◆ + ⊙) = ${SUM_ALL}, sehingga □ + ◆ + ⊙ = ${TRIPLE_SUM}.`,
      ),
    },
    {
      phase: 'subtract',
      highlightRow: 0,
      showAnswer: false,
      dimFirst: false,
      hold: 2000,
      result: false,
      caption: t(
        `The first equation says □ + ◆ = ${SQUARE_DIAMOND_SUM}. Subtract it: ⊙ = ${TRIPLE_SUM} − ${SQUARE_DIAMOND_SUM}.`,
        `Persamaan pertama: □ + ◆ = ${SQUARE_DIAMOND_SUM}. Kurangkan: ⊙ = ${TRIPLE_SUM} − ${SQUARE_DIAMOND_SUM}.`,
      ),
    },
    {
      phase: 'result',
      highlightRow: null,
      showAnswer: true,
      dimFirst: true,
      hold: 0,
      result: true,
      caption: t(
        `⊙ = ${TRIPLE_SUM} − ${SQUARE_DIAMOND_SUM} = ${CIRCLE_VALUE}. Answer: D.`,
        `⊙ = ${TRIPLE_SUM} − ${SQUARE_DIAMOND_SUM} = ${CIRCLE_VALUE}. Jawaban: D.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    circleValue: CIRCLE_VALUE,
  }
}
