import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  heights: z.array(z.number().int().min(1).max(5)).min(3).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'block-count-3d',
  name_en: 'Count the stacked blocks',
  name_id: 'Hitung balok yang ditumpuk',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung jumlah seluruh balok yang ditumpuk dalam kolom.',
} as const

export function total(p: Params): number {
  return p.heights.reduce((s, h) => s + h, 0)
}

export function generate(rng: Rng): Params {
  const count = rng.int(3, 5)
  const heights = Array.from({ length: count }, () => rng.int(1, 5))
  return { heights }
}

export function render(params: Params) {
  return {
    body_en: 'The blocks are stacked in columns as shown. How many blocks are there in total?',
    body_id: 'Balok-balok ditumpuk dalam kolom seperti pada gambar. Ada berapa balok seluruhnya?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total(params)),
    hint_en: 'Count the blocks in each column, then add the columns together.',
    hint_id: 'Hitung balok di tiap kolom, lalu jumlahkan semua kolom.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
