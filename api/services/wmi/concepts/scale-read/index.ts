import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildScaleReadBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  max: z.number().int().min(20).max(100),
  value: z.number().int().min(1).max(99),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'scale-read',
  name_en: 'Read the scale',
  name_id: 'Membaca skala',
  grades: [1, 2, 3] as const,
  description_id: 'Baca nilai yang ditunjuk pada sebuah skala bernomor.',
} as const

export function generate(rng: Rng): Params {
  const max = rng.pick([20, 50] as const)
  // The scale has 10 divisions, numbered every other one (= max/5). Land on an
  // ODD division — exactly halfway between two numbered marks — so it matches
  // the question's grid (never on a numbered mark, never between ticks).
  const value = (max / 10) * rng.pick([1, 3, 5, 7, 9] as const)
  return { max, value }
}

export function render(params: Params) {
  return {
    body_en: 'What value is the arrow pointing to on the scale?',
    body_id: 'Nilai berapa yang ditunjuk panah pada skala ini?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.value),
    hint_en: 'The arrow sits on a half-mark, exactly halfway between two numbered marks.',
    hint_id: 'Panah berada pada garis tengah, tepat di antara dua angka.',
    breakdown: buildScaleReadBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
