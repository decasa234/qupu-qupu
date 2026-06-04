import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  k: z.number().int().min(3).max(20),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'product-of-consecutive',
  name_en: 'Consecutive numbers from their product',
  name_id: 'Bilangan berurutan dari hasil kalinya',
  grades: [3] as const,
  description_id: 'Cari dua bilangan berurutan jika diketahui hasil kalinya.',
} as const

export function generate(rng: Rng): Params {
  return { k: rng.int(4, 18) }
}

export function render(params: Params) {
  const product = params.k * (params.k + 1)
  return {
    body_en: `Two consecutive whole numbers have a product of ${product}. What is the larger of the two numbers?`,
    body_id: `Dua bilangan bulat berurutan memiliki hasil kali ${product}. Berapakah bilangan yang lebih besar dari keduanya?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.k + 1),
    hint_en: 'Consecutive numbers are one apart, like 7 and 8. Their product is close to a square.',
    hint_id: 'Bilangan berurutan berselisih satu, seperti 7 dan 8. Hasil kalinya dekat dengan kuadrat.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
