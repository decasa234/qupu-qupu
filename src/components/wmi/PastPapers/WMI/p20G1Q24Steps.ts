import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q24_ANSWER, Q24_DICE, Q24_PAIR_SUM, Q24_TOP_TOTAL } from './P20G1Q24Illustration'

export type Q24Phase = 'show' | 'rule' | 'tops' | 'subtract' | 'result'

export interface Q24Step {
  phase: Q24Phase
  caption: string
  hold: number
  result: boolean
}

export interface Q24Storyboard {
  answer: number
  steps: Q24Step[]
  finalIndex: number
}

export function buildP20G1Q24Steps(lang: Lang): Q24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const allPairs = Q24_DICE * Q24_PAIR_SUM // 28

  const steps: Q24Step[] = [
    {
      phase: 'show',
      hold: 1700,
      result: false,
      caption: t(
        'The 4 hidden faces all point down — one under each die.',
        '4 sisi tersembunyi semua menghadap ke bawah — satu di tiap dadu.',
      ),
    },
    {
      phase: 'rule',
      hold: 2100,
      result: false,
      caption: t(
        `On every die, the up face and the down face are opposite, so they add to ${Q24_PAIR_SUM}.`,
        `Pada setiap dadu, sisi atas dan sisi bawah berhadapan, jadi jumlahnya ${Q24_PAIR_SUM}.`,
      ),
    },
    {
      phase: 'tops',
      hold: 2200,
      result: false,
      caption: t(
        `4 dice → up + down totals 4 × ${Q24_PAIR_SUM} = ${allPairs}. The 4 up faces add to ${Q24_TOP_TOTAL}.`,
        `4 dadu → atas + bawah = 4 × ${Q24_PAIR_SUM} = ${allPairs}. Keempat sisi atas berjumlah ${Q24_TOP_TOTAL}.`,
      ),
    },
    {
      phase: 'subtract',
      hold: 2100,
      result: false,
      caption: t(
        `Down faces = ${allPairs} − (up faces) = ${allPairs} − ${Q24_TOP_TOTAL}.`,
        `Sisi bawah = ${allPairs} − (sisi atas) = ${allPairs} − ${Q24_TOP_TOTAL}.`,
      ),
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        `${allPairs} − ${Q24_TOP_TOTAL} = ${Q24_ANSWER}. The 4 down faces add to ${Q24_ANSWER} — answer A.`,
        `${allPairs} − ${Q24_TOP_TOTAL} = ${Q24_ANSWER}. Keempat sisi bawah berjumlah ${Q24_ANSWER} — jawaban A.`,
      ),
    },
  ]

  return { answer: Q24_ANSWER, steps, finalIndex: steps.length - 1 }
}
