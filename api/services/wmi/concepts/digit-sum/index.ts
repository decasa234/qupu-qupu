import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

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
    body_en: `What is the sum of the [[digit|digits]] of ${params.n}?`,
    body_id: `Berapa [[sum|jumlah]] dari [[digit|angka-angka]] pada bilangan ${params.n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(sum),
    hint_en: 'Add the two digits.',
    hint_id: 'Jumlahkan kedua angka.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
