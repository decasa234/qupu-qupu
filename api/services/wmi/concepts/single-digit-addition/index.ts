import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildSingleDigitAdditionBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  a: z.number().int().min(1).max(9),
  b: z.number().int().min(1).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'single-digit-addition',
  name_en: 'Single-digit addition',
  name_id: 'Penjumlahan satu angka',
  grades: [1, 2] as const,
  description_id: 'Latihan menambah dua angka satuan.',
} as const

export function generate(rng: Rng): Params {
  return { a: rng.int(1, 9), b: rng.int(1, 9) }
}

export function render(params: Params) {
  const { a, b } = params
  const big = Math.max(a, b)
  const small = Math.min(a, b)
  const sum = a + b
  const bridges = sum > 10
  const need = 10 - big
  const rest = small - need
  return {
    body_en: `Find: What is ${a} + ${b}?`,
    body_id: `Cari: Berapa ${a} + ${b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(sum),
    hint_en: bridges ? 'Make a ten first, then add what is left.' : 'Count on from the bigger number.',
    hint_id: bridges ? 'Jadikan sepuluh dulu, lalu tambahkan sisanya.' : 'Hitung maju dari angka yang lebih besar.',
    hint_steps_en: bridges
      ? [
          `Start with the bigger number, ${big}.`,
          `Take ${need} from ${small} to make ten: ${big} + ${need} = 10.`,
          `Add what is left: 10 + ${rest} = ${sum}.`,
        ]
      : [`Start with the bigger number, ${big}.`, `Count on ${small}: ${big} + ${small} = ${sum}.`],
    hint_steps_id: bridges
      ? [
          `Mulai dari yang lebih besar, ${big}.`,
          `Ambil ${need} dari ${small} agar jadi sepuluh: ${big} + ${need} = 10.`,
          `Tambahkan sisanya: 10 + ${rest} = ${sum}.`,
        ]
      : [`Mulai dari yang lebih besar, ${big}.`, `Hitung maju ${small}: ${big} + ${small} = ${sum}.`],
    breakdown: buildSingleDigitAdditionBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
