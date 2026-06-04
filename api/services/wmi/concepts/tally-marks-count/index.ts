import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  n: z.number().int().min(3).max(34),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'tally-marks-count',
  name_en: 'Read tally marks',
  name_id: 'Membaca turus',
  grades: [1, 2] as const,
  description_id: 'Hitung turus (tally) dan tentukan bilangannya.',
} as const

export function generate(rng: Rng): Params {
  return { n: rng.int(7, 29) }
}

export function render(params: Params) {
  return {
    body_en: 'Count the tally marks. What number do they show?',
    body_id: 'Hitung turusnya. Bilangan berapa yang ditunjukkan?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.n),
    hint_en: 'Each group with a slash through it is 5. Count the groups, then the extra marks.',
    hint_id: 'Tiap kelompok yang dicoret adalah 5. Hitung kelompoknya, lalu turus sisanya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
