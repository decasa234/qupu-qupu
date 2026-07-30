import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildNumberPyramidBreakdown } from './breakdown.js'

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
  grades: [1, 2, 3] as const,
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
  const mid1 = params.a + params.b
  const mid2 = params.b + params.c
  const top = topNumber(params)
  return {
    body_en: `A number pyramid has three rows. The bottom row shows three blocks: ${params.a}, ${params.b}, ${params.c}. Each block is the sum of the two blocks directly below it.\nFind: What number is at the top of the pyramid?`,
    body_id: `Sebuah piramida bilangan memiliki tiga baris. Baris paling bawah menunjukkan tiga blok: ${params.a}, ${params.b}, ${params.c}. Setiap blok adalah jumlah dua blok tepat di bawahnya.\nCari: Bilangan berapa yang ada di puncak piramida?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(top),
    hint_en: `Fill in the middle row first — each block is the sum of its two neighbours below — then add those two to reach the top.`,
    hint_id: `Isi baris tengah terlebih dahulu — setiap blok adalah jumlah dua blok di bawahnya — lalu jumlahkan keduanya untuk mendapatkan puncak.`,
    hint_steps_en: [
      `Left block of the middle row: ${params.a} + ${params.b} = ${mid1}.`,
      `Right block of the middle row: ${params.b} + ${params.c} = ${mid2}.`,
      `Top block: ${mid1} + ${mid2} = ${top}.`,
    ],
    hint_steps_id: [
      `Blok kiri baris tengah: ${params.a} + ${params.b} = ${mid1}.`,
      `Blok kanan baris tengah: ${params.b} + ${params.c} = ${mid2}.`,
      `Blok puncak: ${mid1} + ${mid2} = ${top}.`,
    ],
    breakdown: buildNumberPyramidBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
