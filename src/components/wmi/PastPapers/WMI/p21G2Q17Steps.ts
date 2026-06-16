import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type Q17Phase = 'show' | 'scale1' | 'scale2' | 'scale3' | 'chain' | 'result'

export interface Q17Step {
  phase: Q17Phase
  /** Which balance to spotlight (0,1,2) or -1 for none / all. */
  highlight: number
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  answerLabel: string
  steps: Q17Step[]
  finalIndex: number
}

export function buildP21G2Q17Steps(lang: Lang, answerLabel: string): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q17Step[] = [
    {
      phase: 'show',
      highlight: -1,
      hold: 1700,
      result: false,
      caption: t(
        'On each balance the heavier side tips DOWN. Read one at a time.',
        'Pada setiap timbangan sisi yang lebih berat turun. Baca satu per satu.',
      ),
    },
    {
      phase: 'scale1',
      highlight: 0,
      hold: 2100,
      result: false,
      caption: t(
        'Balance 1: peach + banana beats banana + banana, so peach > banana.',
        'Timbangan 1: persik + pisang mengalahkan pisang + pisang, jadi persik > pisang.',
      ),
    },
    {
      phase: 'scale3',
      highlight: 2,
      hold: 2100,
      result: false,
      caption: t(
        'Balance 3: peach beats two strawberries, so peach > strawberry too.',
        'Timbangan 3: persik mengalahkan dua stroberi, jadi persik > stroberi juga.',
      ),
    },
    {
      phase: 'scale2',
      highlight: 1,
      hold: 2300,
      result: false,
      caption: t(
        'Balance 2: pineapple alone beats peach + banana, so pineapple > peach.',
        'Timbangan 2: nanas sendiri mengalahkan persik + pisang, jadi nanas > persik.',
      ),
    },
    {
      phase: 'chain',
      highlight: -1,
      hold: 2200,
      result: false,
      caption: t(
        'Chain it: pineapple > peach > banana, and peach > strawberry.',
        'Rantai: nanas > persik > pisang, dan persik > stroberi.',
      ),
    },
    {
      phase: 'result',
      highlight: 1,
      hold: 0,
      result: true,
      caption: t(
        `Nothing outweighs the pineapple — it is the heaviest. Answer ${answerLabel}.`,
        `Tidak ada yang lebih berat dari nanas — itulah yang paling berat. Jawaban ${answerLabel}.`,
      ),
    },
  ]

  return { answerLabel, steps, finalIndex: steps.length - 1 }
}
