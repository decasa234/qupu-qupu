import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  prices: z.array(z.number().int().min(20).max(500)).length(4),
  budget: z.number().int().min(20).max(500),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'budget-selection',
  name_en: 'Most expensive option within a budget',
  name_id: 'Pilihan termahal dalam anggaran',
  grades: [2, 3] as const,
  description_id: 'Pilih barang termahal yang masih terjangkau dengan anggaran.',
} as const

export function bestAffordable(p: Params): number {
  return Math.max(...p.prices.filter((price) => price <= p.budget))
}

export function generate(rng: Rng): Params {
  const pool = rng.shuffle(Array.from({ length: 47 }, (_, i) => (i + 4) * 10)) // 40..500 step 10
  const prices = pool.slice(0, 4)
  const sorted = [...prices].sort((a, b) => a - b)
  const i = rng.int(0, 2) // ensure at least one affordable, at least one too dear
  const budget = sorted[i] + rng.int(0, sorted[i + 1] - sorted[i] - 1)
  return { prices, budget }
}

export function render(params: Params) {
  const list = params.prices.join(', ')
  const affordable = params.prices.filter((p) => p <= params.budget)
  const tooExpensive = params.prices.filter((p) => p > params.budget)
  const answer = bestAffordable(params)

  const affordableList = affordable.join(', ')
  const tooExpensiveList = tooExpensive.join(', ')

  const hint_steps_en = [
    `List all four prices: ${list}.`,
    `Cross out prices above the budget of ${params.budget}: ${tooExpensiveList}.`,
    `The remaining prices that fit the budget are: ${affordableList}.`,
    `The largest of these is ${answer}, so the answer is ${answer}.`,
  ]

  const hint_steps_id = [
    `Catat keempat harga: ${list}.`,
    `Coret harga yang melebihi anggaran ${params.budget}: ${tooExpensiveList}.`,
    `Harga yang masih terjangkau adalah: ${affordableList}.`,
    `Yang terbesar di antaranya adalah ${answer}, sehingga jawaban adalah ${answer}.`,
  ]

  return {
    body_en: `A ticket booth offers four seats at prices of ${list} dollars. You have a budget of ${params.budget} dollars.\n\nFind: What is the highest price you can pay for a ticket without exceeding your budget?`,
    body_id: `Sebuah loket tiket menawarkan empat kursi dengan harga ${list} dolar. Kamu memiliki anggaran sebesar ${params.budget} dolar.\n\nCari: Berapa harga tiket tertinggi yang dapat kamu beli tanpa melampaui anggaranmu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'First rule out every price that is too high, then find the greatest price among those that remain.',
    hint_id: 'Singkirkan terlebih dahulu harga yang terlalu mahal, lalu cari harga terbesar dari yang tersisa.',
    hint_steps_en,
    hint_steps_id,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
