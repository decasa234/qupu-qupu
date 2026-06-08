import type { Lang } from './makeTenSteps'

export type ProductConsecutivePhase = 'intro' | 'near' | 'pair' | 'verify' | 'result'

export interface ProductConsecutiveStep {
  phase: ProductConsecutivePhase
  caption: string
  result: boolean
}

export interface ProductConsecutiveStoryboard {
  k: number
  smaller: number
  larger: number
  product: number
  answer: number
  steps: ProductConsecutiveStep[]
  finalIndex: number
}

export function buildProductConsecutiveSteps(k: number, lang: Lang): ProductConsecutiveStoryboard {
  const smaller = k
  const larger = k + 1
  const product = k * (k + 1)
  const answer = k + 1

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ProductConsecutiveStep[] = [
    {
      phase: 'intro',
      caption: t(
        `Two consecutive numbers multiply to ${product}.`,
        `Dua bilangan berurutan dikalikan menghasilkan ${product}.`,
      ),
      result: false,
    },
    {
      phase: 'near',
      caption: t(
        `Consecutive numbers are one apart, so √${product} is between them.`,
        `Bilangan berurutan selisih satu, jadi √${product} ada di antaranya.`,
      ),
      result: false,
    },
    {
      phase: 'pair',
      caption: t(`They are ${smaller} and ${larger}.`, `Bilangannya ${smaller} dan ${larger}.`),
      result: false,
    },
    {
      phase: 'verify',
      caption: t(
        `Check: ${smaller} × ${larger} = ${product}.`,
        `Periksa: ${smaller} × ${larger} = ${product}.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `The larger number is ${larger}.`,
        `Bilangan yang lebih besar adalah ${larger}.`,
      ),
      result: true,
    },
  ]

  return { k, smaller, larger, product, answer, steps, finalIndex: steps.length - 1 }
}
