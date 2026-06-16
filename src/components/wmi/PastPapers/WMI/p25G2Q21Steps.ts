// Storyboard for the WMI-25P2A-Q21 butterfly-pentagon explainer.
//
// White-tile count per picture grows by the SAME step (+3):
//   Picture 1 -> 4,  Picture 2 -> 7,  Picture 3 -> 10,  ...
//   rule: white(n) = 3n + 1   =>  Picture 9 = 3*9 + 1 = 28  (answer D)
//
// The explainer grows the drawn pattern 1 -> 2 -> 3 flowers while the caption
// tracks the white count, then jumps to the rule and plugs in n = 9.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const Q21_TARGET_PICTURE = 9
export const Q21_WHITE = (n: number) => 3 * n + 1
export const Q21_ANSWER = Q21_WHITE(Q21_TARGET_PICTURE) // 28

export interface Q21Step {
  /** How many flowers to draw (1..3) for this beat. */
  flowers: number
  caption: string
  hold: number
  result: boolean
}

export interface Q21Storyboard {
  answer: number
  steps: Q21Step[]
  finalIndex: number
}

export function buildP25G2Q21Steps(lang: Lang): Q21Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const w1 = Q21_WHITE(1) // 4
  const w2 = Q21_WHITE(2) // 7
  const w3 = Q21_WHITE(3) // 10

  const steps: Q21Step[] = [
    {
      flowers: 1,
      hold: 1900,
      result: false,
      caption: t(`Picture 1: one green flower has ${w1} white tiles around it.`, `Gambar 1: satu bunga hijau dikelilingi ${w1} ubin putih.`),
    },
    {
      flowers: 2,
      hold: 2000,
      result: false,
      caption: t(`Picture 2: ${w1} + 3 = ${w2} white tiles.`, `Gambar 2: ${w1} + 3 = ${w2} ubin putih.`),
    },
    {
      flowers: 3,
      hold: 2100,
      result: false,
      caption: t(`Picture 3: ${w2} + 3 = ${w3} white tiles. Each picture adds 3.`, `Gambar 3: ${w2} + 3 = ${w3} ubin putih. Tiap gambar menambah 3.`),
    },
    {
      flowers: 3,
      hold: 2200,
      result: false,
      caption: t(`Steps of 3 from a start of 1 means white(n) = 3 x n + 1.`, `Langkah 3 dari awal 1 berarti putih(n) = 3 x n + 1.`),
    },
    {
      flowers: 3,
      hold: 0,
      result: true,
      caption: t(
        `Picture 9: 3 x 9 + 1 = 27 + 1 = ${Q21_ANSWER} white tiles. Answer D.`,
        `Gambar 9: 3 x 9 + 1 = 27 + 1 = ${Q21_ANSWER} ubin putih. Jawaban D.`,
      ),
    },
  ]

  return { answer: Q21_ANSWER, steps, finalIndex: steps.length - 1 }
}
