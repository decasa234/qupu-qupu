import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildShapePerimeterRectangleBreakdown } from './breakdown.js'

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
  const p = perimeter(params)
  return {
    body_en: `The rectangle below is ${params.w} cm wide and ${params.h} cm tall. Find: What is the [[perimeter]] of the rectangle, in cm?`,
    body_id: `Persegi panjang di bawah ini lebarnya ${params.w} cm dan tingginya ${params.h} cm. Cari: Berapa [[perimeter|keliling]] persegi panjang tersebut, dalam cm?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(p),
    hint_en: 'Trace all the way around the shape and add every side you cross.',
    hint_id: 'Bayangkan kamu berjalan mengelilingi seluruh sisi bentuk itu, lalu jumlahkan semuanya.',
    hint_steps_en: [
      `A rectangle has two lengths and two widths: ${params.w} cm, ${params.h} cm, ${params.w} cm, ${params.h} cm.`,
      `Add them: ${params.w} + ${params.h} + ${params.w} + ${params.h} = 2 × (${params.w} + ${params.h}).`,
      `2 × ${params.w + params.h} = ${p} cm.`,
    ],
    hint_steps_id: [
      `Persegi panjang punya dua pasang sisi: ${params.w} cm, ${params.h} cm, ${params.w} cm, ${params.h} cm.`,
      `Jumlahkan semuanya: ${params.w} + ${params.h} + ${params.w} + ${params.h} = 2 × (${params.w} + ${params.h}).`,
      `2 × ${params.w + params.h} = ${p} cm.`,
    ],
    breakdown: buildShapePerimeterRectangleBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
