import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(2).max(9),
  b: z.number().int().min(1).max(8),
}).refine((v) => v.a > v.b, { message: 'a must be > b' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'single-digit-subtraction',
  name_en: 'Single-digit subtraction',
  name_id: 'Pengurangan satu angka',
  grades: [1, 2] as const,
  description_id: 'Latihan mengurangi dua angka satuan.',
} as const

export function generate(rng: Rng): Params {
  const a = rng.int(2, 9)
  const b = rng.int(1, a - 1)
  return { a, b }
}

export function render(params: Params) {
  return {
    body_en: `What is ${params.a} − ${params.b}?`,
    body_id: `Berapa ${params.a} − ${params.b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.a - params.b),
    hint_en: 'Count down from the larger number.',
    hint_id: 'Hitung mundur dari angka yang lebih besar.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
