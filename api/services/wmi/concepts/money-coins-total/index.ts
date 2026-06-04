import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const COIN_VALUES = [1, 5, 10, 25] as const
const paramsSchema = z.object({
  coins: z.array(z.number().int().min(1).max(25)).min(4).max(7),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'money-coins-total',
  name_en: 'Total value of coins',
  name_id: 'Nilai total koin',
  grades: [1, 2, 3] as const,
  description_id: 'Jumlahkan nilai koin-koin yang ditampilkan.',
} as const

export function total(p: Params): number {
  return p.coins.reduce((s, v) => s + v, 0)
}

export function generate(rng: Rng): Params {
  const count = rng.int(4, 7)
  const coins = Array.from({ length: count }, () => rng.pick(COIN_VALUES))
  return { coins }
}

export function render(params: Params) {
  return {
    body_en: 'What is the total value of these coins (in cents)?',
    body_id: 'Berapa nilai total koin-koin ini (dalam sen)?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total(params)),
    hint_en: 'Add up the number written on each coin.',
    hint_id: 'Jumlahkan angka yang tertulis pada setiap koin.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
