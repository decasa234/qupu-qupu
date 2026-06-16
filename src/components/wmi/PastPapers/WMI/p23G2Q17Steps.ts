import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CIRCLE_ONLY, CIRCLE_ONLY_DIGITS } from './P23G2Q17Illustration'

export type VennPhase = 'show' | 'region' | 'list' | 'count' | 'result'

export interface VennStep {
  phase: VennPhase
  highlightCircleOnly: boolean
  dimOthers: boolean
  caption: string
  hold: number
  result: boolean
}

export interface VennStoryboard {
  circleOnly: string[]
  digits: number
  answer: string
  steps: VennStep[]
  finalIndex: number
}

export function buildP23G2Q17Steps(lang: Lang): VennStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const list = CIRCLE_ONLY // ['25','6','13','7']
  const perDigit = list.map((v) => `${v}→${v.length}`).join(', ')

  const steps: VennStep[] = [
    {
      phase: 'show',
      highlightCircleOnly: false,
      dimOthers: false,
      hold: 1700,
      result: false,
      caption: t(
        'We want numbers OUTSIDE the square but INSIDE the circle.',
        'Kita cari angka DI LUAR persegi tetapi DI DALAM lingkaran.',
      ),
    },
    {
      phase: 'region',
      highlightCircleOnly: true,
      dimOthers: true,
      hold: 2000,
      result: false,
      caption: t(
        'That is the part of the circle that does not overlap the square.',
        'Yaitu bagian lingkaran yang tidak bertindih dengan persegi.',
      ),
    },
    {
      phase: 'list',
      highlightCircleOnly: true,
      dimOthers: true,
      hold: 2100,
      result: false,
      caption: t(
        `Those numbers are ${list.join(', ')} — that is ${list.length} numbers.`,
        `Angkanya adalah ${list.join(', ')} — yaitu ${list.length} angka.`,
      ),
    },
    {
      phase: 'count',
      highlightCircleOnly: true,
      dimOthers: true,
      hold: 2300,
      result: false,
      caption: t(
        `But count DIGITS, not numbers: ${perDigit}.`,
        `Tapi hitung ANGKA (digit), bukan bilangan: ${perDigit}.`,
      ),
    },
    {
      phase: 'result',
      highlightCircleOnly: true,
      dimOthers: true,
      hold: 0,
      result: true,
      caption: t(
        `2 + 1 + 2 + 1 = ${CIRCLE_ONLY_DIGITS} digits — answer B.`,
        `2 + 1 + 2 + 1 = ${CIRCLE_ONLY_DIGITS} digit — jawaban B.`,
      ),
    },
  ]

  return {
    circleOnly: list,
    digits: CIRCLE_ONLY_DIGITS,
    answer: 'B',
    steps,
    finalIndex: steps.length - 1,
  }
}
