import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const COIN_VALUES = [1, 5, 10, 25] as const
const DOLLAR = 100
const paramsSchema = z.object({
  coins: z.array(z.number().int().min(1).max(25)).min(4).max(7),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'money-coins-total',
  name_en: 'Cents needed to make a dollar',
  name_id: 'Sen untuk melengkapi satu dolar',
  grades: [2, 3] as const,
  description_id: 'Jumlahkan nilai koin, lalu cari berapa sen lagi untuk mencapai 100 sen.',
} as const

export function total(p: Params): number {
  return p.coins.reduce((s, v) => s + v, 0)
}

// How many more cents are needed to reach one dollar (100 cents).
export function neededForDollar(p: Params): number {
  return DOLLAR - total(p)
}

export function generate(rng: Rng): Params {
  // Keep the running total below a dollar (and not trivially small) so the
  // complement to 100 is a genuine second step, often not a multiple of 5.
  for (let attempt = 0; attempt < 60; attempt++) {
    const count = rng.int(4, 7)
    const coins = Array.from({ length: count }, () => rng.pick(COIN_VALUES))
    const sum = coins.reduce((s, v) => s + v, 0)
    if (sum >= 25 && sum <= 95) return { coins }
  }
  return { coins: [25, 10, 10, 5, 1] } // fallback, total 51
}

export function render(params: Params) {
  const counts: Record<number, number> = {}
  for (const v of params.coins) counts[v] = (counts[v] ?? 0) + 1
  const denoms = ([25, 10, 5, 1] as const).filter((d) => counts[d])

  const groupSummary_en = denoms.map((d) => `${d}¢ ×${counts[d]}`).join(', ')
  const groupSummary_id = denoms.map((d) => `${d} sen ×${counts[d]}`).join(', ')

  const subtotals = denoms.map((d) => d * counts[d]!)
  const additionStr = subtotals.join(' + ')
  const sum = total(params)
  const need = neededForDollar(params)

  return {
    body_en: `These coins are in your pocket.\n\nFind: How many more cents do you need to make one dollar (100 cents)?`,
    body_id: `Koin-koin ini ada di sakumu.\n\nCari: Berapa sen lagi yang kamu butuhkan untuk membuat satu dolar (100 sen)?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(need),
    hint_en:
      'First add up the coins you have, then subtract that total from 100 to see how many more cents reach a dollar.',
    hint_id:
      'Jumlahkan dulu koin yang kamu punya, lalu kurangi total itu dari 100 untuk melihat berapa sen lagi yang dibutuhkan.',
    hint_steps_en: [
      `Group by denomination: ${groupSummary_en}.`,
      `Add the subtotals: ${additionStr} = ${sum}.`,
      `Make a dollar: 100 − ${sum} = ${need}.`,
    ],
    hint_steps_id: [
      `Kelompokkan berdasarkan nilai: ${groupSummary_id}.`,
      `Jumlahkan subtotal: ${additionStr} = ${sum}.`,
      `Lengkapi satu dolar: 100 − ${sum} = ${need}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
