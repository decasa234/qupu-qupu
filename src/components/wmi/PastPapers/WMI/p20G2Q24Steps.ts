import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Four dice; each die has top + bottom = 7, so all eight top+bottom faces total
// 4 × 7 = 28. The four UP faces total 7 (the visible stack-top is 1; the three
// covered tops between dice total 6). So the four DOWN faces = 28 − 7 = 21.
export const Q24_DICE = 4
export const Q24_PAIR_SUM = 7
export const Q24_TOTAL = Q24_DICE * Q24_PAIR_SUM // 28
export const Q24_UP_TOTAL = 7 // 1 (visible top) + 6 (three covered tops)
export const Q24_DOWN_TOTAL = Q24_TOTAL - Q24_UP_TOTAL // 21 (answer A)

export type Q24Phase = 'show' | 'rule' | 'up' | 'subtract' | 'result'

export interface Q24Step {
  phase: Q24Phase
  markTopUp: boolean
  upTotal: number | null
  downTotal: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q24Storyboard {
  total: number
  upTotal: number
  answer: number
  steps: Q24Step[]
  finalIndex: number
}

export function buildP20G2Q24Steps(lang: Lang): Q24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q24Step[] = [
    {
      phase: 'show',
      markTopUp: false,
      upTotal: null,
      downTotal: null,
      hold: 1700,
      result: false,
      caption: t(
        'Each die has top + bottom = 7. Every face points either up or down.',
        'Tiap dadu: sisi atas + sisi bawah = 7. Setiap sisi menghadap ke atas atau ke bawah.',
      ),
    },
    {
      phase: 'rule',
      markTopUp: false,
      upTotal: null,
      downTotal: null,
      hold: 1900,
      result: false,
      caption: t(
        `4 dice × 7 = ${Q24_TOTAL}: that is all the up faces plus all the down faces together.`,
        `4 dadu × 7 = ${Q24_TOTAL}: itu semua sisi atas ditambah semua sisi bawah.`,
      ),
    },
    {
      phase: 'up',
      markTopUp: true,
      upTotal: Q24_UP_TOTAL,
      downTotal: null,
      hold: 2100,
      result: false,
      caption: t(
        `The four UP faces: the visible top is 1, the three hidden tops add 6 → up total = ${Q24_UP_TOTAL}.`,
        `Empat sisi ATAS: yang terlihat 1, tiga sisi atas tersembunyi menambah 6 → jumlah atas = ${Q24_UP_TOTAL}.`,
      ),
    },
    {
      phase: 'subtract',
      markTopUp: true,
      upTotal: Q24_UP_TOTAL,
      downTotal: null,
      hold: 2000,
      result: false,
      caption: t(
        `Down faces = ${Q24_TOTAL} − ${Q24_UP_TOTAL}.`,
        `Sisi bawah = ${Q24_TOTAL} − ${Q24_UP_TOTAL}.`,
      ),
    },
    {
      phase: 'result',
      markTopUp: true,
      upTotal: Q24_UP_TOTAL,
      downTotal: Q24_DOWN_TOTAL,
      hold: 0,
      result: true,
      caption: t(
        `${Q24_TOTAL} − ${Q24_UP_TOTAL} = ${Q24_DOWN_TOTAL} — answer A.`,
        `${Q24_TOTAL} − ${Q24_UP_TOTAL} = ${Q24_DOWN_TOTAL} — jawaban A.`,
      ),
    },
  ]

  return {
    total: Q24_TOTAL,
    upTotal: Q24_UP_TOTAL,
    answer: Q24_DOWN_TOTAL,
    steps,
    finalIndex: steps.length - 1,
  }
}
