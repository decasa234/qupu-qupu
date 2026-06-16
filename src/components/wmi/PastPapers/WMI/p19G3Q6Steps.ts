// Storyboard for the WMI-19P3A-Q6 explainer (trapezoid perimeter).
//
// Idea per beat:
//   1. Perimeter = the total of all four sides going around.
//   2. Add the three known sides: 29 + 26 + 26 = 81.
//   3. Subtract from the perimeter: 104 − 81 = 23.
//   4. Result: "?" = 23 — answer C.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q6_TOP, Q6_LEFT, Q6_RIGHT, Q6_PERIMETER, Q6_BOTTOM, type Q6Side } from './P19G3Q6Illustration'

export type Q6Phase = 'show' | 'known' | 'subtract' | 'result'

export interface Q6Step {
  phase: Q6Phase
  highlight: Q6Side | null
  /** Reveal the bottom value on the figure. */
  showBottom: boolean
  /** Running equation line beneath the figure (or null). */
  equation: string | null
  caption: string
  hold: number
  result: boolean
}

export interface Q6Storyboard {
  knownSum: number
  answer: number
  steps: Q6Step[]
  finalIndex: number
}

export function buildP19G3Q6Steps(lang: Lang): Q6Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const knownSum = Q6_TOP + Q6_LEFT + Q6_RIGHT // 81
  const answer = Q6_BOTTOM // 23

  const steps: Q6Step[] = [
    {
      phase: 'show',
      highlight: null,
      showBottom: false,
      equation: null,
      hold: 1700,
      result: false,
      caption: t(
        'The perimeter is the total of all four sides going around.',
        'Keliling adalah jumlah keempat sisi mengelilingi bangun.',
      ),
    },
    {
      phase: 'known',
      highlight: 'top',
      showBottom: false,
      equation: `${Q6_TOP} + ${Q6_LEFT} + ${Q6_RIGHT} = ${knownSum}`,
      hold: 2100,
      result: false,
      caption: t(
        `Add the three known sides: ${Q6_TOP} + ${Q6_LEFT} + ${Q6_RIGHT} = ${knownSum}.`,
        `Jumlahkan tiga sisi yang diketahui: ${Q6_TOP} + ${Q6_LEFT} + ${Q6_RIGHT} = ${knownSum}.`,
      ),
    },
    {
      phase: 'subtract',
      highlight: 'bottom',
      showBottom: false,
      equation: `${Q6_PERIMETER} − ${knownSum} = ${answer}`,
      hold: 2100,
      result: false,
      caption: t(
        `The "?" is what is left: ${Q6_PERIMETER} − ${knownSum} = ${answer}.`,
        `"?" adalah sisanya: ${Q6_PERIMETER} − ${knownSum} = ${answer}.`,
      ),
    },
    {
      phase: 'result',
      highlight: 'bottom',
      showBottom: true,
      equation: `${Q6_PERIMETER} − ${knownSum} = ${answer}`,
      hold: 0,
      result: true,
      caption: t(`So "?" = ${answer} — answer C.`, `Jadi "?" = ${answer} — jawaban C.`),
    },
  ]

  return { knownSum, answer, steps, finalIndex: steps.length - 1 }
}
