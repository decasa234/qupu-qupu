import type { Lang } from './makeTenSteps'

export interface BudgetStep {
  caption: string
  result: boolean
  /** The two ticket prices being tried this beat (null on the intro beat). */
  pair: [number, number] | null
  sum: number | null
  fits: boolean | null
  /** How long to hold this beat on screen, in ms (the winner lingers longest). */
  hold: number
}

export interface BudgetStoryboard {
  prices: number[]
  budget: number
  answer: number
  winner: [number, number]
  steps: BudgetStep[]
  finalIndex: number
}

// W7: buy two different tickets, spending the most you can within budget. The
// storyboard tries pair totals from the largest down, rejecting any over budget,
// until the first (and therefore biggest) pair that fits — the answer.
export function buildBudgetSteps(prices: number[], budget: number, lang: Lang): BudgetStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const pairs: { a: number; b: number; sum: number }[] = []
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      pairs.push({ a: prices[i], b: prices[j], sum: prices[i] + prices[j] })
    }
  }
  pairs.sort((x, y) => y.sum - x.sum) // largest total first

  let winnerIdx = pairs.findIndex((pr) => pr.sum <= budget)
  if (winnerIdx === -1) winnerIdx = pairs.length - 1 // defensive; generate guarantees one fits
  const winner = pairs[winnerIdx]
  const answer = winner.sum

  const steps: BudgetStep[] = [
    {
      caption: t(
        `Buy two tickets — find the biggest total that fits ${budget}.`,
        `Beli dua tiket — cari total terbesar yang muat dalam ${budget}.`,
      ),
      result: false,
      pair: null,
      sum: null,
      fits: null,
      hold: 2000,
    },
  ]

  for (let k = 0; k <= winnerIdx; k++) {
    const pr = pairs[k]
    const isWinner = k === winnerIdx
    const caption = isWinner
      ? t(`Best pair: ${pr.a} + ${pr.b} = ${pr.sum}.`, `Pasangan terbaik: ${pr.a} + ${pr.b} = ${pr.sum}.`)
      : t(`${pr.a} + ${pr.b} = ${pr.sum} > ${budget} ✗`, `${pr.a} + ${pr.b} = ${pr.sum} > ${budget} ✗`)
    // The winner is the last beat (holds = 0). Over-budget tries linger a touch
    // longer so the bust → meter overflow reads clearly.
    steps.push({ caption, result: isWinner, pair: [pr.a, pr.b], sum: pr.sum, fits: isWinner, hold: isWinner ? 0 : 2100 })
  }

  return {
    prices,
    budget,
    answer,
    winner: [winner.a, winner.b],
    steps,
    finalIndex: steps.length - 1,
  }
}
