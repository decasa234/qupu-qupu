import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    w: z.number().int().min(2).max(15),
    h: z.number().int().min(2).max(15),
  })
  .refine((v) => v.w !== v.h, { message: 'width and height should differ (use shape-perimeter-square otherwise)' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'shape-perimeter-rectangle',
  name_en: 'Perimeter of a rectangle',
  name_id: 'Keliling persegi panjang',
  grades: [2, 3] as const,
  description_id: 'Hitung keliling persegi panjang dari panjang dan lebarnya.',
} as const

export function perimeter(p: Params): number {
  return 2 * (p.w + p.h)
}

export function generate(rng: Rng): Params {
  const w = rng.int(2, 15)
  let h = rng.int(2, 15)
  if (h === w) h = w >= 15 ? w - 1 : w + 1 // keep h in [2,15] and distinct from w
  return { w, h }
}

export function render(params: Params) {
  return {
    body_en: `The rectangle below is ${params.w} cm wide and ${params.h} cm tall. What is its perimeter, in cm?`,
    body_id: `Persegi panjang di bawah ini lebarnya ${params.w} cm dan tingginya ${params.h} cm. Berapa kelilingnya, dalam cm?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(perimeter(params)),
    hint_en: 'Perimeter is the distance all the way around: add all four sides.',
    hint_id: 'Keliling adalah jarak mengelilingi: jumlahkan keempat sisinya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
