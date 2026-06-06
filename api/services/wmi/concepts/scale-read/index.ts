import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  max: z.number().int().min(20).max(100),
  value: z.number().int().min(1).max(99),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'scale-read',
  name_en: 'Read the scale',
  name_id: 'Membaca skala',
  grades: [2, 3] as const,
  description_id: 'Baca nilai yang ditunjuk pada sebuah skala bernomor.',
} as const

export function generate(rng: Rng): Params {
  const max = rng.pick([20, 50] as const)
  // Land exactly on a half-mark (a ×5 tick, never a numbered ×10 mark):
  // 5, 15, 25, … — read straight off the mark, never in between.
  const k = rng.int(0, Math.floor((max - 5) / 10))
  const value = 5 + k * 10
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
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
