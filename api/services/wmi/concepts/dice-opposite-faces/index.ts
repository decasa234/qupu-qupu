import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    t: z.number().int().min(1).max(6),
    f: z.number().int().min(1).max(6),
    r: z.number().int().min(1).max(6),
  })
  .refine((v) => v.t + v.f !== 7 && v.f + v.r !== 7 && v.t + v.r !== 7, {
    message: 'visible faces cannot be an opposite pair',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'dice-opposite-faces',
  name_en: 'Hidden faces of a die',
  name_id: 'Sisi tersembunyi dadu',
  grades: [2, 3] as const,
  description_id: 'Sisi berlawanan dadu berjumlah 7; cari total sisi yang tersembunyi.',
} as const

export function hiddenSum(p: Params): number {
  return 21 - (p.t + p.f + p.r) // total of all faces is 21; hidden = 21 - visible
}

export function generate(rng: Rng): Params {
  // one face from each opposite pair guarantees three mutually-adjacent faces
  const a = rng.pick([1, 6] as const)
  const b = rng.pick([2, 5] as const)
  const c = rng.pick([3, 4] as const)
  const [t, f, r] = rng.shuffle([a, b, c])
  return { t, f, r }
}

export function render(params: Params) {
  return {
    body_en: `On a standard die, opposite faces add up to 7. You can see the top (${params.t}), the front (${params.f}), and the right (${params.r}). What is the total of the three hidden faces?`,
    body_id: `Pada dadu standar, sisi yang berlawanan berjumlah 7. Kamu dapat melihat sisi atas (${params.t}), depan (${params.f}), dan kanan (${params.r}). Berapa jumlah ketiga sisi yang tersembunyi?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(hiddenSum(params)),
    hint_en: 'All six faces total 1+2+3+4+5+6 = 21. Subtract the three you can see.',
    hint_id: 'Keenam sisi berjumlah 1+2+3+4+5+6 = 21. Kurangi tiga sisi yang terlihat.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
