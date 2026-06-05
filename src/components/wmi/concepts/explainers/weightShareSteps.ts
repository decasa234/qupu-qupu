import type { Lang } from './makeTenSteps'

export type WeightSharePhase = 'total' | 'subtract' | 'share' | 'result'

export interface WeightShareStep {
  phase: WeightSharePhase
  caption: string
  result: boolean
}

export interface WeightShareStoryboard {
  bottles: number
  perBottle: number
  sugar: number
  total: number
  bottlesTotal: number
  answer: number
  steps: WeightShareStep[]
  finalIndex: number
}

export function buildWeightShareSteps(
  bottles: number,
  perBottle: number,
  sugar: number,
  lang: Lang,
): WeightShareStoryboard {
  const total = sugar + bottles * perBottle
  const bottlesTotal = bottles * perBottle
  const answer = perBottle

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: WeightShareStep[] = [
    {
      phase: 'total',
      caption: t(
        `A bag of sugar + ${bottles} bottles weigh ${total} g. Sugar is ${sugar} g.`,
        `Sekantong gula + ${bottles} botol = ${total} g. Gula ${sugar} g.`,
      ),
      result: false,
    },
    {
      phase: 'subtract',
      caption: t(
        `Take away the sugar: ${total} − ${sugar} = ${bottlesTotal} g for the bottles.`,
        `Kurangi gula: ${total} − ${sugar} = ${bottlesTotal} g untuk botol.`,
      ),
      result: false,
    },
    {
      phase: 'share',
      caption: t(
        `Share among ${bottles} bottles: ${bottlesTotal} ÷ ${bottles}.`,
        `Bagi ke ${bottles} botol: ${bottlesTotal} ÷ ${bottles}.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `One bottle weighs ${perBottle} g.`,
        `Satu botol beratnya ${perBottle} g.`,
      ),
      result: true,
    },
  ]

  return { bottles, perBottle, sugar, total, bottlesTotal, answer, steps, finalIndex: steps.length - 1 }
}
