import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    front: z.array(z.number().int().min(1).max(4)).min(2).max(3),
    back: z.array(z.number().int().min(1).max(4)).min(2).max(3),
  })
  .refine((v) => v.front.length === v.back.length, { message: 'front and back rows must match width' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'block-count-3d',
  name_en: 'Count the stacked blocks',
  name_id: 'Hitung balok yang ditumpuk',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung jumlah seluruh balok yang ditumpuk dalam dua baris (depan dan belakang).',
} as const

export function total(p: Params): number {
  return [...p.front, ...p.back].reduce((s, h) => s + h, 0)
}

export function generate(rng: Rng): Params {
  const width = rng.int(2, 3)
  const front = Array.from({ length: width }, () => rng.int(1, 3))
  const back = Array.from({ length: width }, () => rng.int(1, 3))
  return { front, back }
}

export function render(params: Params) {
  return {
    body_en: 'The blocks are stacked in two rows — a back row and a front row. How many blocks are there in total? (No hidden gaps.)',
    body_id: 'Balok-balok ditumpuk dalam dua baris — baris belakang dan baris depan. Ada berapa balok seluruhnya? (Tidak ada rongga tersembunyi.)',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total(params)),
    hint_en: 'Count the blocks in the front row and the back row, then add them.',
    hint_id: 'Hitung balok di baris depan dan baris belakang, lalu jumlahkan.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
