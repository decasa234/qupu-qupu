import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildMultiplicationSmallBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  a: z.number().int().min(2).max(5),
  b: z.number().int().min(2).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'multiplication-small',
  name_en: 'Small multiplication',
  name_id: 'Perkalian kecil',
  grades: [3] as const,
  description_id: 'Latihan tabel perkalian 2 sampai 5.',
} as const

export function generate(rng: Rng): Params {
  return { a: rng.int(2, 5), b: rng.int(2, 5) }
}

export function render(params: Params) {
  const { a, b } = params
  const product = a * b
  const seq = Array.from({ length: a }, (_, i) => (i + 1) * b).join(', ')
  return {
    body_en: `Find: What is ${a} × ${b}?`,
    body_id: `Cari: Berapa ${a} × ${b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(product),
    hint_en: `Think of ${a} equal groups of ${b}, then skip-count.`,
    hint_id: `Bayangkan ${a} kelompok berisi ${b}, lalu hitung lompat.`,
    hint_steps_en: [
      `${a} × ${b} means ${a} groups of ${b}.`,
      `Skip-count by ${b}: ${seq}.`,
      `So ${a} × ${b} = ${product}.`,
    ],
    hint_steps_id: [
      `${a} × ${b} berarti ${a} kelompok berisi ${b}.`,
      `Hitung lompat ${b}: ${seq}.`,
      `Jadi ${a} × ${b} = ${product}.`,
    ],
    breakdown: buildMultiplicationSmallBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
