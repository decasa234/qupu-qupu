import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildDigitSumBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  n: z.number().int().min(10).max(99),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'digit-sum',
  name_en: 'Sum of digits',
  name_id: 'Jumlah angka',
  grades: [1, 2] as const,
  description_id: 'Jumlahkan setiap angka dalam suatu bilangan.',
} as const

export function generate(rng: Rng): Params {
  return { n: rng.int(10, 99) }
}

export function render(params: Params) {
  const tens = Math.floor(params.n / 10)
  const ones = params.n % 10
  const sum = tens + ones
  return {
    body_en: `The number ${params.n} has two digits. Find: What is the sum of its [[digit|digits]]?`,
    body_id: `Bilangan ${params.n} memiliki dua angka. Cari: Berapa jumlah [[digit|angka-angka]] bilangan itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(sum),
    hint_en: `Split ${params.n} into its tens digit and ones digit, then add them together.`,
    hint_id: `Pisahkan ${params.n} menjadi angka puluhan dan angka satuannya, lalu jumlahkan keduanya.`,
    hint_steps_en: [
      `The tens digit of ${params.n} is ${tens}; the ones digit is ${ones}.`,
      `Add the digits: ${tens} + ${ones} = ${sum}.`,
    ],
    hint_steps_id: [
      `Angka puluhan dari ${params.n} adalah ${tens}; angka satuannya adalah ${ones}.`,
      `Jumlahkan: ${tens} + ${ones} = ${sum}.`,
    ],
    breakdown: buildDigitSumBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
