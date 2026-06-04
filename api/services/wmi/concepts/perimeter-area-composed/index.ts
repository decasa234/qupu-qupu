import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    W: z.number().int().min(3).max(8),
    H: z.number().int().min(3).max(7),
    cw: z.number().int().min(1).max(7),
    ch: z.number().int().min(1).max(6),
  })
  .refine((v) => v.cw < v.W && v.ch < v.H, { message: 'notch must be smaller than the rectangle' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'perimeter-area-composed',
  name_en: 'Area of an L-shape',
  name_id: 'Luas bangun bentuk L',
  grades: [2, 3] as const,
  description_id: 'Hitung luas bangun gabungan (persegi panjang dengan sudut dipotong).',
} as const

export function area(p: Params): number {
  return p.W * p.H - p.cw * p.ch
}

export function generate(rng: Rng): Params {
  const W = rng.int(4, 8)
  const H = rng.int(3, 6)
  const cw = rng.int(1, W - 1)
  const ch = rng.int(1, H - 1)
  return { W, H, cw, ch }
}

export function render(params: Params) {
  return {
    body_en: `The shape below is made of 1 cm squares (a rectangle with a corner cut out). What is its area, in square cm?`,
    body_id: `Bangun di bawah ini terdiri dari persegi 1 cm (persegi panjang dengan satu sudut dipotong). Berapa luasnya, dalam cm persegi?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(area(params)),
    hint_en: 'Find the area of the full rectangle, then subtract the cut-out corner.',
    hint_id: 'Cari luas persegi panjang penuh, lalu kurangi sudut yang dipotong.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
