import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    x: z.number().int().min(2).max(11),
    y: z.number().int().min(3).max(12),
  })
  .refine((v) => v.y > v.x, { message: 'y must be the larger number' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'combination-product-sum',
  name_en: 'Two numbers from their sum and product',
  name_id: 'Dua bilangan dari jumlah dan hasil kalinya',
  grades: [3] as const,
  description_id: 'Cari dua bilangan jika diketahui jumlah dan hasil kalinya.',
} as const

export function generate(rng: Rng): Params {
  const x = rng.int(2, 9)
  const y = rng.int(x + 1, 12)
  return { x, y }
}

export function render(params: Params) {
  const sum = params.x + params.y
  const product = params.x * params.y
  return {
    body_en: `Two whole numbers have a sum of ${sum} and a product of ${product}. What is the larger of the two numbers?`,
    body_id: `Dua bilangan bulat memiliki jumlah ${sum} dan hasil kali ${product}. Berapakah bilangan yang lebih besar dari keduanya?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.y),
    hint_en: 'Look for two numbers that add to the sum and multiply to the product.',
    hint_id: 'Cari dua bilangan yang jumlahnya sesuai dan hasil kalinya sesuai.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
