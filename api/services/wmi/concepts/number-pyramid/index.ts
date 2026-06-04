import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(1).max(20),
  b: z.number().int().min(1).max(20),
  c: z.number().int().min(1).max(20),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'number-pyramid',
  name_en: 'Number pyramid',
  name_id: 'Piramida bilangan',
  grades: [2, 3] as const,
  description_id: 'Setiap blok adalah jumlah dua blok di bawahnya; cari puncaknya.',
} as const

// top = (a+b) + (b+c)
export function topNumber(p: Params): number {
  return p.a + 2 * p.b + p.c
}

export function generate(rng: Rng): Params {
  return { a: rng.int(1, 18), b: rng.int(1, 18), c: rng.int(1, 18) }
}

export function render(params: Params) {
  return {
    body_en: `In a number pyramid the bottom row is ${params.a}, ${params.b}, ${params.c}. Each block above is the sum of the two blocks directly below it. What number is at the top?`,
    body_id: `Dalam piramida bilangan, baris paling bawah adalah ${params.a}, ${params.b}, ${params.c}. Setiap blok di atas adalah jumlah dua blok tepat di bawahnya. Bilangan berapa yang ada di puncak?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(topNumber(params)),
    hint_en: `Middle row: ${params.a + params.b} and ${params.b + params.c}; add them for the top.`,
    hint_id: `Baris tengah: ${params.a + params.b} dan ${params.b + params.c}; jumlahkan untuk puncak.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
