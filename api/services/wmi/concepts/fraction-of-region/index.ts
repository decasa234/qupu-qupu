import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    parts: z.number().int().min(2).max(8),
    shaded: z.number().int().min(1).max(7),
  })
  .refine((v) => v.shaded < v.parts, { message: 'shaded must be fewer than total parts' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'fraction-of-region',
  name_en: 'Parts of a whole',
  name_id: 'Bagian dari keseluruhan',
  grades: [1, 2] as const,
  description_id: 'Hitung berapa bagian yang TIDAK diarsir pada bangun yang dibagi sama besar.',
} as const

export function unshaded(p: Params): number {
  return p.parts - p.shaded
}

export function generate(rng: Rng): Params {
  const parts = rng.int(3, 8)
  const shaded = rng.int(1, parts - 1)
  return { parts, shaded }
}

export function render(params: Params) {
  return {
    body_en: `The bar is divided into ${params.parts} equal parts. How many parts are NOT shaded?`,
    body_id: `Batang ini dibagi menjadi ${params.parts} bagian sama besar. Berapa bagian yang TIDAK diarsir?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(unshaded(params)),
    hint_en: `Count the empty parts, or take ${params.parts} minus the shaded parts.`,
    hint_id: `Hitung bagian yang kosong, atau ${params.parts} dikurangi bagian yang diarsir.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
