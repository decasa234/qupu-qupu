import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER, BLACK_COUNT, WHITE_COUNT } from './P21G1Q10Illustration'

export type CheckerPhase = 'show' | 'black' | 'white' | 'pair' | 'result'

export interface CheckerStep {
  phase: CheckerPhase
  markColor: 'black' | 'white' | null
  pairUp: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CheckerStoryboard {
  blackCount: number
  whiteCount: number
  answer: number
  answerLetter: string
  steps: CheckerStep[]
  finalIndex: number
}

export function buildP21G1Q10Steps(lang: Lang): CheckerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CheckerStep[] = [
    {
      phase: 'show',
      markColor: null,
      pairUp: false,
      hold: 1700,
      result: false,
      caption: t(
        "Don't count one by one — pair each black with a white.",
        'Jangan hitung satu-satu — pasangkan tiap hitam dengan satu putih.',
      ),
    },
    {
      phase: 'black',
      markColor: 'black',
      pairUp: false,
      hold: 1900,
      result: false,
      caption: t(`Black squares: ${BLACK_COUNT}.`, `Kotak hitam: ${BLACK_COUNT}.`),
    },
    {
      phase: 'white',
      markColor: 'white',
      pairUp: false,
      hold: 1900,
      result: false,
      caption: t(`White squares: ${WHITE_COUNT}.`, `Kotak putih: ${WHITE_COUNT}.`),
    },
    {
      phase: 'pair',
      markColor: null,
      pairUp: true,
      hold: 2100,
      result: false,
      caption: t(
        `Pair ${WHITE_COUNT} black with ${WHITE_COUNT} white — one black is left over.`,
        `Pasangkan ${WHITE_COUNT} hitam dengan ${WHITE_COUNT} putih — sisa satu hitam.`,
      ),
    },
    {
      phase: 'result',
      markColor: null,
      pairUp: true,
      hold: 0,
      result: true,
      caption: t(
        `${BLACK_COUNT} − ${WHITE_COUNT} = ${ANSWER} more black — answer B.`,
        `${BLACK_COUNT} − ${WHITE_COUNT} = ${ANSWER} lebih banyak hitam — jawaban B.`,
      ),
    },
  ]

  return {
    blackCount: BLACK_COUNT,
    whiteCount: WHITE_COUNT,
    answer: ANSWER,
    answerLetter: 'B',
    steps,
    finalIndex: steps.length - 1,
  }
}
