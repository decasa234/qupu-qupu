import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(1).max(9),
  b: z.number().int().min(1).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'single-digit-addition',
  name_en: 'Single-digit addition',
  name_id: 'Penjumlahan satu angka',
  grades: [1, 2] as const,
  description_id: 'Latihan menambah dua angka satuan.',
} as const

export function generate(rng: Rng): Params {
  return { a: rng.int(1, 9), b: rng.int(1, 9) }
}

export function render(params: Params) {
  return {
    body_en: `What is ${params.a} + ${params.b}?`,
    body_id: `Berapa ${params.a} + ${params.b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.a + params.b),
    hint_en: 'Count up from the larger number.',
    hint_id: 'Hitung naik dari angka yang lebih besar.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
