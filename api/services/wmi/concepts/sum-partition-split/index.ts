import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  small: z.number().int().min(2).max(40),
  k: z.number().int().min(2).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'sum-partition-split',
  name_en: 'Share a total in a given ratio',
  name_id: 'Bagi total dengan rasio tertentu',
  grades: [3] as const,
  description_id: 'Bagi sebuah total menjadi dua bagian dengan rasio tertentu.',
} as const

export function generate(rng: Rng): Params {
  return { small: rng.int(3, 25), k: rng.int(2, 4) }
}

export function render(params: Params) {
  const total = (params.k + 1) * params.small
  return {
    body_en: `Two children share ${total} stickers. One child gets ${params.k} times as many as the other. How many stickers does the child with fewer get?`,
    body_id: `Dua anak berbagi ${total} stiker. Satu anak mendapat ${params.k} kali lipat dari yang lain. Berapa stiker yang diterima anak yang lebih sedikit?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.small),
    hint_en: `Think of the total as ${params.k + 1} equal parts; the smaller share is one part.`,
    hint_id: `Anggap total sebagai ${params.k + 1} bagian sama; bagian yang lebih kecil adalah satu bagian.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
