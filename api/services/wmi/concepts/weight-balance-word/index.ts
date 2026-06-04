import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  bottles: z.number().int().min(2).max(8),
  perBottle: z.number().int().min(20).max(500),
  sugar: z.number().int().min(20).max(500),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'weight-balance-word',
  name_en: 'Find one item’s weight from a total',
  name_id: 'Cari berat satu benda dari total',
  grades: [2, 3] as const,
  description_id: 'Cari berat satu botol dari berat total dan berat gula.',
} as const

export function generate(rng: Rng): Params {
  return { bottles: rng.int(2, 6), perBottle: rng.int(50, 400), sugar: rng.int(50, 300) }
}

export function render(params: Params) {
  const total = params.sugar + params.bottles * params.perBottle
  return {
    body_en: `A bag of sugar and ${params.bottles} bottles of milk weigh ${total} g in total. The sugar weighs ${params.sugar} g. How many grams does one bottle of milk weigh?`,
    body_id: `Sekantong gula dan ${params.bottles} botol susu memiliki berat total ${total} g. Gula itu beratnya ${params.sugar} g. Berapa gram berat satu botol susu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.perBottle),
    hint_en: 'Subtract the sugar first, then share what is left among the bottles.',
    hint_id: 'Kurangi berat gula dulu, lalu bagi sisanya ke semua botol.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
