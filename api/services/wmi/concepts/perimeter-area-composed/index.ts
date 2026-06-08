import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildPerimeterAreaComposedBreakdown } from './breakdown.js'

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
  const { W, H, cw, ch } = params
  const fullArea = W * H
  const cutArea = cw * ch
  const result = fullArea - cutArea
  return {
    body_en: `The shape below is made of 1 cm unit squares — a ${W} cm × ${H} cm rectangle with a ${cw} cm × ${ch} cm corner cut out.\nFind: What is the area of the shape, in cm²?`,
    body_id: `Bangun di bawah ini terdiri dari persegi satuan 1 cm — persegi panjang ${W} cm × ${H} cm dengan sudut ${cw} cm × ${ch} cm yang dipotong.\nCari: Berapa luas bangun tersebut, dalam cm²?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(area(params)),
    hint_en: `Split the L-shape into two rectangles (or think of the full rectangle minus the cut-out corner) to find the area.`,
    hint_id: `Bagi bangun L menjadi dua persegi panjang (atau bayangkan persegi panjang penuh dikurangi sudut yang dipotong) untuk menemukan luasnya.`,
    hint_steps_en: [
      `Full rectangle area: ${W} × ${H} = ${fullArea} cm²`,
      `Cut-out corner area: ${cw} × ${ch} = ${cutArea} cm²`,
      `L-shape area: ${fullArea} − ${cutArea} = ${result} cm²`,
    ],
    hint_steps_id: [
      `Luas persegi panjang penuh: ${W} × ${H} = ${fullArea} cm²`,
      `Luas sudut yang dipotong: ${cw} × ${ch} = ${cutArea} cm²`,
      `Luas bangun L: ${fullArea} − ${cutArea} = ${result} cm²`,
    ],
    breakdown: buildPerimeterAreaComposedBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
