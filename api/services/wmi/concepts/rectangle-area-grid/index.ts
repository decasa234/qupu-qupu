import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  w: z.number().int().min(2).max(10),
  h: z.number().int().min(2).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'rectangle-area-grid',
  name_en: 'Area of a rectangle on a grid',
  name_id: 'Luas persegi panjang pada kisi',
  grades: [2, 3] as const,
  description_id: 'Hitung jumlah persegi satuan (luas) pada sebuah kisi.',
} as const

export function area(p: Params): number {
  return p.w * p.h
}

export function generate(rng: Rng): Params {
  return { w: rng.int(3, 9), h: rng.int(2, 8) }
}

export function render(params: Params) {
  return {
    body_en: `The grid below is drawn with 1 cm squares. How many small squares are there in total (the area, in square cm)?`,
    body_id: `Kisi di bawah ini terdiri dari persegi berukuran 1 cm. Ada berapa persegi kecil seluruhnya (luasnya, dalam cm persegi)?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(area(params)),
    hint_en: 'Count the squares in one row, then multiply by the number of rows.',
    hint_id: 'Hitung persegi dalam satu baris, lalu kalikan dengan banyak baris.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
