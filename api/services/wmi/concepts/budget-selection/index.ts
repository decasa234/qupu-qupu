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
  return {
    body_en: `Four tickets are sold at these prices: ${list} dollars. With a budget of ${params.budget} dollars, what is the price of the most expensive ticket you can afford?`,
    body_id: `Empat tiket dijual dengan harga: ${list} dolar. Dengan anggaran ${params.budget} dolar, berapa harga tiket termahal yang masih dapat kamu beli?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(bestAffordable(params)),
    hint_en: 'Ignore any price above your budget, then pick the largest of the rest.',
    hint_id: 'Abaikan harga di atas anggaran, lalu pilih yang terbesar dari sisanya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
