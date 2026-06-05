import type { Lang } from './makeTenSteps'

export type LackingSharePhase = 'setup' | 'price' | 'solve' | 'result'

export interface LackingShareStep {
  phase: LackingSharePhase
  caption: string
  result: boolean
}

export interface LackingShareStoryboard {
  nameA: string
  nameB: string
  lackA: number
  lackB: number
  /** Total cake price = lackA + lackB */
  price: number
  /** How much A has = price − lackA = lackB */
  answer: number
  steps: LackingShareStep[]
  finalIndex: number
}

export function buildLackingShareSteps(
  nameA: string,
  nameB: string,
  lackA: number,
  lackB: number,
  lang: Lang,
): LackingShareStoryboard {
  const price = lackA + lackB
  const answer = lackB

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LackingShareStep[] = [
    {
      phase: 'setup',
      caption: t(
        `${nameA} is short ${lackA}, ${nameB} is short ${lackB}. Together = exactly one cake.`,
        `${nameA} kurang ${lackA}, ${nameB} kurang ${lackB}. Bersama = pas satu kue.`,
      ),
      result: false,
    },
    {
      phase: 'price',
      caption: t(
        `Their two shortfalls make the price: ${lackA} + ${lackB} = ${price}.`,
        `Kedua kekurangan = harga: ${lackA} + ${lackB} = ${price}.`,
      ),
      result: false,
    },
    {
      phase: 'solve',
      caption: t(
        `${nameA} is short ${lackA}, so ${nameA} has ${price} − ${lackA} = ${lackB}.`,
        `${nameA} kurang ${lackA}, jadi ${nameA} punya ${price} − ${lackA} = ${lackB}.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`${nameA} has ${lackB}.`, `${nameA} punya ${lackB}.`),
      result: true,
    },
  ]

  return { nameA, nameB, lackA, lackB, price, answer, steps, finalIndex: steps.length - 1 }
}
