import type { Lang } from '../../concepts/explainers/makeTenSteps'

// IKMC-22-PE-Q4 (2022 Pre-Ecolier).
//
// "One sandwich and one juice together cost 12 euro.
//  One sandwich and two juices together cost 14 euro.
//  How much does one juice cost?"   Answer: 2 euro (choice B).
//
// Strategy — subtract-the-equations (one idea per beat; never jump to 2 upfront):
//   0. Setup  — show both orders.
//   1. Spot the difference — the 2nd order has ONE extra juice; the price went up.
//   2. Compute the extra juice cost: 14 − 12 = 2 euro.
//   3. Result — one juice costs 2 euro (answer B).
//
// Pure builder, deterministic, SSR-safe — no random, no dates.

export interface SandwichJuiceStep {
  phase: 'setup' | 'diff' | 'subtract' | 'result'
  /** Highlight the juice glyph(s) in the figure. */
  litJuice: boolean
  /** Big number call-out for the current beat, or null. */
  value: number | null
  caption: string
  hold: number
  result: boolean
}

export interface SandwichJuiceStoryboard {
  juicePrice: number
  steps: SandwichJuiceStep[]
  finalIndex: number
}

// Fixed question data (bound to breakdown.quantities).
const PRICE_1J = 12   // sandwich + 1 juice
const PRICE_2J = 14   // sandwich + 2 juices
const JUICE_PRICE = PRICE_2J - PRICE_1J   // 2 euro

export function buildSandwichJuiceSteps(lang: Lang): SandwichJuiceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SandwichJuiceStep[] = [
    {
      phase: 'setup',
      litJuice: false,
      value: null,
      hold: 2000,
      result: false,
      caption: t(
        `Order 1: sandwich + 1 juice = ${PRICE_1J} €. Order 2: sandwich + 2 juices = ${PRICE_2J} €.`,
        `Pesanan 1: sandwich + 1 jus = ${PRICE_1J} €. Pesanan 2: sandwich + 2 jus = ${PRICE_2J} €.`,
      ),
    },
    {
      phase: 'diff',
      litJuice: true,
      value: null,
      hold: 2200,
      result: false,
      caption: t(
        'Order 2 has one EXTRA juice — and costs more. How much more?',
        'Pesanan 2 punya satu jus TAMBAHAN — dan lebih mahal. Berapa lebih mahalnya?',
      ),
    },
    {
      phase: 'subtract',
      litJuice: true,
      value: JUICE_PRICE,
      hold: 2200,
      result: false,
      caption: t(
        `${PRICE_2J} − ${PRICE_1J} = ${JUICE_PRICE}. That extra juice costs ${JUICE_PRICE} euro.`,
        `${PRICE_2J} − ${PRICE_1J} = ${JUICE_PRICE}. Jus tambahan itu harganya ${JUICE_PRICE} euro.`,
      ),
    },
    {
      phase: 'result',
      litJuice: true,
      value: JUICE_PRICE,
      hold: 0,
      result: true,
      caption: t(
        `One juice costs ${JUICE_PRICE} euro — answer B.`,
        `Satu jus harganya ${JUICE_PRICE} euro — jawaban B.`,
      ),
    },
  ]

  return {
    juicePrice: JUICE_PRICE,
    steps,
    finalIndex: steps.length - 1,
  }
}
