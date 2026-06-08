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
    body_en: `Two whole numbers have a sum of ${sum} and a product of ${product}.\nFind: What is the larger of the two numbers?`,
    body_id: `Dua bilangan bulat memiliki jumlah ${sum} dan hasil kali ${product}.\nCari: Berapakah bilangan yang lebih besar dari keduanya?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.y),
    hint_en: `Think about pairs of whole numbers that add up to ${sum}, then check which pair also multiplies to ${product}.`,
    hint_id: `Pikirkan pasangan bilangan bulat yang jumlahnya ${sum}, lalu periksa pasangan mana yang hasil kalinya juga ${product}.`,
    hint_steps_en: [
      `The two numbers add to ${sum}, so list pairs that sum to ${sum}: (1, ${sum - 1}), (2, ${sum - 2}), … up to (${params.x}, ${params.y}).`,
      `Multiply each pair and stop when you reach ${product}: ${params.x} × ${params.y} = ${product}. ✓`,
      `The two numbers are ${params.x} and ${params.y}. The larger number is ${params.y}.`,
    ],
    hint_steps_id: [
      `Kedua bilangan berjumlah ${sum}, jadi buat pasangan yang totalnya ${sum}: (1, ${sum - 1}), (2, ${sum - 2}), … sampai (${params.x}, ${params.y}).`,
      `Kalikan setiap pasangan sampai hasilnya ${product}: ${params.x} × ${params.y} = ${product}. ✓`,
      `Kedua bilangan adalah ${params.x} dan ${params.y}. Bilangan yang lebih besar adalah ${params.y}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
