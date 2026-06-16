import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-25F1A-Q2 (2025 Grade 1 Final).
//
// A clothing store sells 4 products at the prices shown:
//   index 0 = hat   $11
//   index 1 = shoes $17
//   index 2 = bag   $20
//   index 3 = socks $9
// "The price difference between two of the kinds is $8. What is the price
//  difference between the OTHER two kinds?"   Answer: 9 (choice C).
//
// Method (one idea per beat — never jump to 9):
//   1. State the goal — read the four prices.
//   2. Find the $8 pair. Try the prices that are 8 apart: shoes $17 and socks $9
//      (litPair [1,3]).  17 - 9 = 8 ✓.
//   3. So the "OTHER two" are the leftovers: the hat $11 and the bag $20
//      (litPair [0,2]).
//   4. Their difference: 20 - 11 = 9.  Result lands on 9.
//
// Pure builder, deterministic, SSR-safe — no random, no dates.

export type ClothingPhase = 'goal' | 'eight' | 'other' | 'result'

export interface ClothingStep {
  phase: ClothingPhase
  /** 0-based product indices to highlight on the figure (the primitive's litPair). */
  lit: number[] | null
  /** The big number to call out this beat (the subtraction's result), or null. */
  value: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ClothingStoryboard {
  /** Final answer — the difference between the other two prices. */
  answer: number
  /** The two product names that differ by $8 and by the answer (for aria text). */
  eightPair: [number, number]
  otherPair: [number, number]
  steps: ClothingStep[]
  finalIndex: number
}

// Fixed question data — the four products, left → right.
const HAT = 0
const SHOES = 1
const BAG = 2
const SOCKS = 3
const PRICE = { [HAT]: 11, [SHOES]: 17, [BAG]: 20, [SOCKS]: 9 } as const

const NAME = (i: number, lang: Lang): string => {
  const en: Record<number, string> = { [HAT]: 'hat', [SHOES]: 'shoes', [BAG]: 'bag', [SOCKS]: 'socks' }
  const id: Record<number, string> = { [HAT]: 'topi', [SHOES]: 'sepatu', [BAG]: 'tas', [SOCKS]: 'kaus kaki' }
  return lang === 'id' ? id[i] : en[i]
}

export function buildClothingPricesSteps(lang: Lang): ClothingStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const eightDiff = PRICE[SHOES] - PRICE[SOCKS] // 17 - 9 = 8
  const answer = PRICE[BAG] - PRICE[HAT] // 20 - 11 = 9

  const steps: ClothingStep[] = [
    {
      phase: 'goal',
      lit: null,
      value: null,
      hold: 2000,
      result: false,
      caption: t(
        'Two prices are $8 apart. What is the difference between the OTHER two?',
        'Dua harga selisihnya $8. Berapa selisih DUA yang lain?',
      ),
    },
    {
      phase: 'eight',
      lit: [SHOES, SOCKS],
      value: eightDiff,
      hold: 2100,
      result: false,
      caption: t(
        `Find the $8 pair: ${NAME(SHOES, lang)} $${PRICE[SHOES]} and ${NAME(SOCKS, lang)} $${PRICE[SOCKS]} → ${PRICE[SHOES]} − ${PRICE[SOCKS]} = ${eightDiff}.`,
        `Cari pasangan $8: ${NAME(SHOES, lang)} $${PRICE[SHOES]} dan ${NAME(SOCKS, lang)} $${PRICE[SOCKS]} → ${PRICE[SHOES]} − ${PRICE[SOCKS]} = ${eightDiff}.`,
      ),
    },
    {
      phase: 'other',
      lit: [HAT, BAG],
      value: null,
      hold: 2000,
      result: false,
      caption: t(
        `The OTHER two are left: ${NAME(HAT, lang)} $${PRICE[HAT]} and ${NAME(BAG, lang)} $${PRICE[BAG]}.`,
        `Yang TERSISA dua lagi: ${NAME(HAT, lang)} $${PRICE[HAT]} dan ${NAME(BAG, lang)} $${PRICE[BAG]}.`,
      ),
    },
    {
      phase: 'result',
      lit: [HAT, BAG],
      value: answer,
      hold: 0,
      result: true,
      caption: t(
        `${PRICE[BAG]} − ${PRICE[HAT]} = ${answer}. The difference is ${answer}.`,
        `${PRICE[BAG]} − ${PRICE[HAT]} = ${answer}. Selisihnya ${answer}.`,
      ),
    },
  ]

  return {
    answer,
    eightPair: [SHOES, SOCKS],
    otherPair: [HAT, BAG],
    steps,
    finalIndex: steps.length - 1,
  }
}
