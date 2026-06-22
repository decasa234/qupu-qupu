// IKMC-20-EC-Q8 — "Casper uses some of 7 differently-sized pieces (widths 1–7)
// to fully cover a 1×16 strip without overlap, using as many different pieces
// as possible. How many pieces does he use?" (answer C = 5).
//
// METHOD (greedy + adjust):
//   Beat 1 — introduce the 7 pieces, state the goal (sum = 16, max count).
//   Beat 2 — try ALL 7 pieces: 1+2+3+4+5+6+7 = 28 > 16 ✗ too many.
//   Beat 3 — try 6 pieces: minimum sum = 1+2+3+4+5+6 = 21 > 16 ✗ still too much.
//   Beat 4 — try 5 pieces: replace size 5 with size 6 → 1+2+3+4+6 = 16 ✓ exact!
//   Beat 5 (result) — 5 pieces fit, answer C = 5.
//
// Pure builder: (lang) => storyboard. No Math.random / no Date — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const ANSWER = 'C'
export const ANSWER_VALUE = 5

// The chosen 5 pieces that sum to 16 (skip size 5, use sizes 1,2,3,4,6)
export const WINNING_SIZES = [1, 2, 3, 4, 6] as const

export interface PieceBeat {
  /** Which attempt number this is (1 = intro, 2 = try 7, 3 = try 6, 4 = try 5, 5 = result). */
  attempt: 1 | 2 | 3 | 4 | 5
  /** Sizes being trialled on this beat (empty on intro / result beats). */
  trialSizes: readonly number[]
  /** Sum of trialSizes (0 on intro / result beats). */
  trialSum: number
  /** true = sum === 16, false = sum > 16, null = not yet evaluated. */
  fits: boolean | null
  /** True on the final answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface Pieces8ECStoryboard {
  answer: string
  answerValue: number
  steps: PieceBeat[]
  finalIndex: number
}

export function buildPieces8ECSteps(lang: Lang): Pieces8ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PieceBeat[] = []

  // Beat 1 — intro
  steps.push({
    attempt: 1,
    trialSizes: [],
    trialSum: 0,
    fits: null,
    result: false,
    caption: t(
      'Casper has 7 pieces of sizes 1 to 7. He wants to cover a strip of length 16 using as many DIFFERENT pieces as possible.',
      'Casper punya 7 potongan berukuran 1 sampai 7. Ia ingin menutupi strip panjang 16 menggunakan POTONGAN BERBEDA sebanyak mungkin.',
    ),
    hold: 2800,
  })

  // Beat 2 — try all 7: 1+2+3+4+5+6+7 = 28
  const sum7 = 1 + 2 + 3 + 4 + 5 + 6 + 7
  steps.push({
    attempt: 2,
    trialSizes: [1, 2, 3, 4, 5, 6, 7],
    trialSum: sum7,
    fits: false,
    result: false,
    caption: t(
      `Try all 7 pieces: 1+2+3+4+5+6+7 = ${sum7}. That's ${sum7 - 16} too many for a length-16 strip. ✗`,
      `Coba 7 potongan: 1+2+3+4+5+6+7 = ${sum7}. Itu ${sum7 - 16} terlalu panjang untuk strip 16. ✗`,
    ),
    hold: 2400,
  })

  // Beat 3 — try 6: 1+2+3+4+5+6 = 21
  const sum6 = 1 + 2 + 3 + 4 + 5 + 6
  steps.push({
    attempt: 3,
    trialSizes: [1, 2, 3, 4, 5, 6],
    trialSum: sum6,
    fits: false,
    result: false,
    caption: t(
      `Try 6 pieces (drop 7): 1+2+3+4+5+6 = ${sum6}. Still ${sum6 - 16} over the limit. ✗`,
      `Coba 6 potongan (tanpa 7): 1+2+3+4+5+6 = ${sum6}. Masih ${sum6 - 16} terlalu panjang. ✗`,
    ),
    hold: 2400,
  })

  // Beat 4 — try 5: 1+2+3+4+6 = 16
  const sum5 = 1 + 2 + 3 + 4 + 6
  steps.push({
    attempt: 4,
    trialSizes: [1, 2, 3, 4, 6],
    trialSum: sum5,
    fits: true,
    result: false,
    caption: t(
      `Try 5 pieces (drop 5 and 7, keep 6): 1+2+3+4+6 = ${sum5}. Fits exactly! ✓`,
      `Coba 5 potongan (tanpa 5 dan 7, pakai 6): 1+2+3+4+6 = ${sum5}. Pas tepat! ✓`,
    ),
    hold: 2600,
  })

  // Beat 5 — result
  steps.push({
    attempt: 5,
    trialSizes: [],
    trialSum: 0,
    fits: null,
    result: true,
    caption: t(
      `5 different pieces (sizes 1, 2, 3, 4, 6) cover the 1×16 strip exactly. The answer is C = 5.`,
      `5 potongan berbeda (ukuran 1, 2, 3, 4, 6) menutupi tabel 1×16 dengan tepat. Jawabannya C = 5.`,
    ),
    hold: 0,
  })

  return {
    answer: ANSWER,
    answerValue: ANSWER_VALUE,
    steps,
    finalIndex: steps.length - 1,
  }
}
