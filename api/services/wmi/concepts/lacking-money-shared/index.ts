import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildLackingMoneySharedBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  nameA: z.string().min(1),
  nameB: z.string().min(1),
  lackA: z.number().int().min(1).max(15),
  lackB: z.number().int().min(1).max(15),
})
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Jessica', 'Cindy', 'Maya', 'Budi', 'Ann', 'Tono'] as const

export const meta = {
  slug: 'lacking-money-shared',
  name_en: 'Each is short some money; together just enough',
  name_id: 'Masing-masing kurang uang; bersama pas',
  grades: [1, 2, 3] as const,
  description_id: 'Dua orang sama-sama kurang uang; bersama pas untuk satu barang.',
} as const

export function generate(rng: Rng): Params {
  const [nameA, nameB] = rng.shuffle(NAMES).slice(0, 2)
  return { nameA, nameB, lackA: rng.int(2, 12), lackB: rng.int(2, 12) }
}

export function render(params: Params) {
  // cake price = lackA + lackB; A's money = price - lackA = lackB.
  const price = params.lackA + params.lackB
  const answer = params.lackB
  return {
    body_en: `${params.nameA} and ${params.nameB} each want to buy the same cake, but neither has enough money alone. ${params.nameA} is $${params.lackA} short, and ${params.nameB} is $${params.lackB} short. When they combine their money it is exactly enough to buy one cake. Find: How much money does ${params.nameA} have?`,
    body_id: `${params.nameA} dan ${params.nameB} masing-masing ingin membeli kue yang sama, tetapi keduanya tidak punya cukup uang. ${params.nameA} kurang Rp${params.lackA}, dan ${params.nameB} kurang Rp${params.lackB}. Ketika uang mereka digabungkan, tepat cukup untuk membeli satu kue. Cari: Berapa uang yang dimiliki ${params.nameA}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: `Try working out the price of the cake first — think about what their combined shortfall tells you.`,
    hint_id: `Coba cari harga kuenya terlebih dahulu — pikirkan apa yang diungkapkan total kekurangan mereka berdua.`,
    hint_steps_en: [
      `The two shortfalls together equal exactly one cake price, so price = $${params.lackA} + $${params.lackB} = $${price}.`,
      `${params.nameA} is $${params.lackA} short of that price, so ${params.nameA}'s money = $${price} − $${params.lackA} = $${answer}.`,
    ],
    hint_steps_id: [
      `Kekurangan keduanya bersama-sama tepat sama dengan harga satu kue, jadi harga kue = Rp${params.lackA} + Rp${params.lackB} = Rp${price}.`,
      `${params.nameA} kurang Rp${params.lackA} dari harga itu, sehingga uang ${params.nameA} = Rp${price} − Rp${params.lackA} = Rp${answer}.`,
    ],
    breakdown: buildLackingMoneySharedBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
