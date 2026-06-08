import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildProductOfConsecutiveBreakdown } from './breakdown.js'

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
  const n = params.k
  const product = n * (n + 1)
  const sqrtFloor = Math.floor(Math.sqrt(product))
  return {
    body_en: `Two consecutive whole numbers have a product of ${product}. Find: What is the larger of the two numbers?`,
    body_id: `Dua bilangan bulat berurutan memiliki hasil kali ${product}. Cari: Bilangan yang lebih besar dari keduanya?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(n + 1),
    hint_en: `The product of two consecutive numbers is just above a perfect square — try the whole number nearest to √${product}.`,
    hint_id: `Hasil kali dua bilangan berurutan selalu sedikit di atas kuadrat sempurna — coba bilangan bulat terdekat dari √${product}.`,
    hint_steps_en: [
      `Consecutive numbers differ by 1, so call them n and n + 1; their product is n × (n + 1) = ${product}.`,
      `Estimate: √${product} ≈ ${sqrtFloor}, so try n = ${sqrtFloor}.`,
      `Check: ${sqrtFloor} × ${sqrtFloor + 1} = ${sqrtFloor * (sqrtFloor + 1)}.`,
      `${sqrtFloor * (sqrtFloor + 1) === product ? `That equals ${product}, so the two numbers are ${sqrtFloor} and ${sqrtFloor + 1}; the larger is ${sqrtFloor + 1}.` : `Adjust: try n = ${n}; ${n} × ${n + 1} = ${product} ✓. The larger number is ${n + 1}.`}`,
    ],
    hint_steps_id: [
      `Bilangan berurutan berselisih 1, sebut saja n dan n + 1; hasil kalinya n × (n + 1) = ${product}.`,
      `Perkiraan: √${product} ≈ ${sqrtFloor}, coba n = ${sqrtFloor}.`,
      `Periksa: ${sqrtFloor} × ${sqrtFloor + 1} = ${sqrtFloor * (sqrtFloor + 1)}.`,
      `${sqrtFloor * (sqrtFloor + 1) === product ? `Hasilnya ${product}, jadi kedua bilangannya adalah ${sqrtFloor} dan ${sqrtFloor + 1}; yang lebih besar adalah ${sqrtFloor + 1}.` : `Sesuaikan: coba n = ${n}; ${n} × ${n + 1} = ${product} ✓. Bilangan yang lebih besar adalah ${n + 1}.`}`,
    ],
    breakdown: buildProductOfConsecutiveBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
