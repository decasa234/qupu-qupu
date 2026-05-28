import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

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
  return {
    body_en: `What is ${params.a} × ${params.b}?`,
    body_id: `Berapa ${params.a} × ${params.b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.a * params.b),
    hint_en: 'Add the first number to itself that many times.',
    hint_id: 'Tambahkan angka pertama sebanyak angka kedua.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
