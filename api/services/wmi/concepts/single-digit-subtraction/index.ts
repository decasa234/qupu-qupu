import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildSingleDigitSubtractionBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  a: z.number().int().min(2).max(9),
  b: z.number().int().min(1).max(8),
}).refine((v) => v.a > v.b, { message: 'a must be > b' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'single-digit-subtraction',
  name_en: 'Single-digit subtraction',
  name_id: 'Pengurangan satu angka',
  grades: [1, 2] as const,
  description_id: 'Latihan mengurangi dua angka satuan.',
} as const

export function generate(rng: Rng): Params {
  const a = rng.int(2, 9)
  const b = rng.int(1, a - 1)
  return { a, b }
}

export function render(params: Params) {
  const { a, b } = params
  const left = a - b
  return {
    body_en: `Find: What is ${a} − ${b}?`,
    body_id: `Cari: Berapa ${a} − ${b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(left),
    hint_en: 'Start from the whole and take the part away.',
    hint_id: 'Mulai dari keseluruhan, lalu ambil sebagian.',
    hint_steps_en: [
      `Start with the whole: ${a}.`,
      `Take ${b} away: ${a} − ${b} = ${left}.`,
    ],
    hint_steps_id: [
      `Mulai dari keseluruhan: ${a}.`,
      `Ambil ${b}: ${a} − ${b} = ${left}.`,
    ],
    breakdown: buildSingleDigitSubtractionBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
