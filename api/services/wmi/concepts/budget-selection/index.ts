import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildBudgetBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  prices: z.array(z.number().int().min(20).max(300)).length(4),
  budget: z.number().int().min(40).max(500),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'budget-selection',
  name_en: 'Most you can spend on two tickets',
  name_id: 'Belanja terbesar untuk dua tiket',
  grades: [2, 3] as const,
  description_id: 'Pilih dua tiket berbeda dengan total terbesar yang masih dalam anggaran.',
} as const

// The greatest total of two different tickets that does not exceed the budget.
export function bestTwo(p: Params): number {
  let best = 0
  for (let i = 0; i < p.prices.length; i++) {
    for (let j = i + 1; j < p.prices.length; j++) {
      const sum = p.prices[i] + p.prices[j]
      if (sum <= p.budget && sum > best) best = sum
    }
  }
  return best
}

export function generate(rng: Rng): Params {
  const pool = rng.shuffle(Array.from({ length: 23 }, (_, i) => (i + 3) * 10)) // 30..250 step 10
  const prices = pool.slice(0, 4)
  const sorted = [...prices].sort((a, b) => a - b)
  const minPair = sorted[0] + sorted[1]
  const maxPair = sorted[2] + sorted[3]
  // Budget covers at least the two cheapest, but never the two priciest, so the
  // solver has to compare pair totals instead of just grabbing the top two.
  const budget = minPair + rng.int(0, maxPair - minPair - 1)
  return { prices, budget }
}

export function render(params: Params) {
  const list = params.prices.join(', ')
  const answer = bestTwo(params)
  const desc = [...params.prices].sort((a, b) => b - a)
  const topPair = desc[0] + desc[1]

  const hint_steps_en = [
    `Buy 2 different tickets, stay within ${params.budget}.`,
    `Skip the 2 priciest — ${desc[0]} + ${desc[1]} = ${topPair} is too much.`,
    `Biggest pair that fits is ${answer}.`,
  ]
  const hint_steps_id = [
    `Beli 2 tiket berbeda, jangan lebih dari ${params.budget}.`,
    `Lewati 2 termahal — ${desc[0]} + ${desc[1]} = ${topPair} terlalu besar.`,
    `Pasangan terbesar yang muat: ${answer}.`,
  ]

  return {
    body_en: `A ticket booth offers four seats at prices of ${list} dollars. You have a budget of ${params.budget} dollars and you want to buy two different tickets.\n\nFind: What is the most you can spend on two tickets without exceeding your budget?`,
    body_id: `Sebuah loket tiket menawarkan empat kursi dengan harga ${list} dolar. Kamu memiliki anggaran ${params.budget} dolar dan ingin membeli dua tiket berbeda.\n\nCari: Berapa jumlah terbesar yang dapat kamu belanjakan untuk dua tiket tanpa melampaui anggaranmu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Pair the tickets starting from the two most expensive; take the biggest pair total that still fits the budget.',
    hint_id: 'Pasangkan tiket mulai dari dua termahal; ambil total pasangan terbesar yang masih dalam anggaran.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildBudgetBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
