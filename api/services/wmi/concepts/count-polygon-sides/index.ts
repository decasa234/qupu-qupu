import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  sides: z.number().int().min(3).max(8),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'count-polygon-sides',
  name_en: 'Count the sides of a shape',
  name_id: 'Hitung sisi sebuah bangun',
  grades: [0, 1] as const,
  description_id: 'Hitung banyak sisi sebuah bangun datar.',
} as const

export function generate(rng: Rng): Params {
  return { sides: rng.int(3, 8) }
}

export function render(params: Params) {
  return {
    body_en: 'How many sides does this shape have?',
    body_id: 'Berapa banyak sisi yang dimiliki bangun ini?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.sides),
    hint_en: 'A side is one straight edge. Count around the shape once.',
    hint_id: 'Sisi adalah satu tepi lurus. Hitung sekeliling bangun satu kali.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
