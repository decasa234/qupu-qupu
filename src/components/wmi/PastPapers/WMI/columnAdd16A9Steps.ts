// Beat steps for SEAMO-16-A-Q9: 2 + 22 + 222 + 2222 + 22222 = 24 690.
// Strategy: add step by step (2→24→246→2468→24690); also highlight the
// column-carry insight so kids see WHY each column digit comes out right.

import { ANSWER_STR } from './ColumnAdd16A9Illustration'

export type ColumnAddPhase = 'show' | 'step1' | 'step2' | 'step3' | 'step4' | 'result'

export interface ColumnAddStep {
  phase: ColumnAddPhase
  revealedCount: number
  showAnswer: boolean
  highlightCol: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ColumnAddStoryboard {
  steps: ColumnAddStep[]
  finalIndex: number
}

export function buildColumnAdd16A9Steps(lang: 'en' | 'id'): ColumnAddStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ColumnAddStep[] = [
    {
      phase: 'show',
      revealedCount: 5,
      showAnswer: false,
      highlightCol: null,
      hold: 1600,
      result: false,
      caption: t(
        'Five addends, each made only of the digit 2. Let\'s add step by step.',
        'Lima bilangan penjumlah, masing-masing hanya dari angka 2. Mari kita tambahkan langkah demi langkah.',
      ),
    },
    {
      phase: 'step1',
      revealedCount: 5,
      showAnswer: false,
      highlightCol: null,
      hold: 1800,
      result: false,
      caption: t('2 + 22 = 24', '2 + 22 = 24'),
    },
    {
      phase: 'step2',
      revealedCount: 5,
      showAnswer: false,
      highlightCol: null,
      hold: 1800,
      result: false,
      caption: t('24 + 222 = 246', '24 + 222 = 246'),
    },
    {
      phase: 'step3',
      revealedCount: 5,
      showAnswer: false,
      highlightCol: null,
      hold: 1800,
      result: false,
      caption: t('246 + 2 222 = 2 468', '246 + 2 222 = 2 468'),
    },
    {
      phase: 'step4',
      revealedCount: 5,
      showAnswer: false,
      highlightCol: null,
      hold: 1800,
      result: false,
      caption: t('2 468 + 22 222 = 24 690', '2 468 + 22 222 = 24 690'),
    },
    {
      phase: 'result',
      revealedCount: 5,
      showAnswer: true,
      highlightCol: null,
      hold: 0,
      result: true,
      caption: t(
        `Sum = ${ANSWER_STR} — answer B.`,
        `Jumlah = ${ANSWER_STR} — jawaban B.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
