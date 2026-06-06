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
  // Land 1–4 small ticks past a 5-mark, so the arrow is never on a numbered
  // (big) tick — you always have to count the small ticks.
  const base = rng.int(0, max / 5 - 1) * 5
  const value = base + rng.int(1, 4)
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
    hint_en: 'Find the numbered marks the arrow is between, jump to the nearest 5-mark, then count the small ticks.',
    hint_id: 'Cari angka di antara mana panah berada, loncat ke garis lima terdekat, lalu hitung garis-garis kecilnya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
