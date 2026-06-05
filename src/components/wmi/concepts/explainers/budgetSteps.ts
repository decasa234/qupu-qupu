import type { Lang } from './makeTenSteps'

export interface BudgetCheck {
  price: number
  affordable: boolean
}

export interface BudgetStoryboard {
  prices: number[]
  budget: number
  checks: BudgetCheck[]
  answer: number
  winnerIndex: number
  ruleEn: string
  ruleId: string
  steps: { checked: number; result: boolean; caption: string }[]
  finalIndex: number
}

export function buildBudgetSteps(prices: number[], budget: number, lang: Lang): BudgetStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ruleEn = `Cross out prices above ${budget}, then pick the largest left.`
  const ruleId = `Coret harga di atas ${budget}, lalu pilih yang terbesar.`

  const checks: BudgetCheck[] = prices.map((price) => ({
    price,
    affordable: price <= budget,
  }))

  const affordablePrices = prices.filter((p) => p <= budget)
  const answer = Math.max(...affordablePrices)
  const winnerIndex = prices.indexOf(answer)

  const steps: { checked: number; result: boolean; caption: string }[] = []

  // Beat 0: intro / rule
  steps.push({ checked: 0, result: false, caption: t(ruleEn, ruleId) })

  // Beats 1..4: reveal each price check
  for (let i = 0; i < 4; i++) {
    const c = checks[i]
    const mark = c.affordable ? '✓' : '✗'
    const captionEn = c.affordable
      ? `${c.price} ≤ ${budget} ${mark}`
      : `${c.price} > ${budget} ${mark}`
    const captionId = c.affordable
      ? `${c.price} ≤ ${budget} ${mark}`
      : `${c.price} > ${budget} ${mark}`
    steps.push({
      checked: i + 1,
      result: false,
      caption: t(captionEn, captionId),
    })
  }

  // Beat 5: result
  steps.push({
    checked: 4,
    result: true,
    caption: t(
      `${answer} is the most expensive you can afford.`,
      `${answer} adalah termahal yang terjangkau.`,
    ),
  })

  return {
    prices,
    budget,
    checks,
    answer,
    winnerIndex,
    ruleEn,
    ruleId,
    steps,
    finalIndex: steps.length - 1,
  }
}
