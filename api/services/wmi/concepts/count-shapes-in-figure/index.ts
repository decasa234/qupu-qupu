import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  segments: z.number().int().min(2).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'count-shapes-in-figure',
  name_en: 'Count the triangles',
  name_id: 'Hitung segitiga',
  grades: [2, 3] as const,
  description_id: 'Hitung banyak segitiga dalam gambar kipas dari puncak ke alas.',
} as const

// A fan: apex joined to (segments+1) points along the base. Every pair of rays
// makes one triangle, so the total is C(segments+1, 2).
export function triangleCount(p: Params): number {
  const points = p.segments + 1
  return (points * (points - 1)) / 2
}

export function generate(rng: Rng): Params {
  return { segments: rng.int(2, 5) }
}

export function render(params: Params) {
  return {
    body_en: 'How many triangles are in this figure?',
    body_id: 'Ada berapa segitiga dalam gambar ini?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(triangleCount(params)),
    hint_en: 'Count the small triangles, then the bigger ones made by joining them.',
    hint_id: 'Hitung segitiga kecil, lalu yang lebih besar dari gabungannya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
