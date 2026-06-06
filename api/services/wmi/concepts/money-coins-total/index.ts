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
  // Build group-by-denomination data for hint steps
  const counts: Record<number, number> = {}
  for (const v of params.coins) {
    counts[v] = (counts[v] ?? 0) + 1
  }
  // Sort denominations descending (25, 10, 5, 1)
  const denoms = ([25, 10, 5, 1] as const).filter((d) => counts[d])

  // Step 1 — group summary e.g. "Group: 25 (×2), 10 (×1), 5 (×3), 1 (×1)."
  const groupSummary_en = denoms.map((d) => `${d}¢ ×${counts[d]}`).join(', ')
  const groupSummary_id = denoms.map((d) => `${d} sen ×${counts[d]}`).join(', ')

  // Step 2 — per-group products e.g. "Multiply each group: 25×2=50, 10×1=10, 5×3=15, 1×1=1."
  const products_en = denoms.map((d) => `${d}×${counts[d]}=${d * counts[d]!}`).join(', ')
  const products_id = denoms.map((d) => `${d}×${counts[d]}=${d * counts[d]!}`).join(', ')

  // Step 3 — addition sentence e.g. "Add the subtotals: 50 + 10 + 15 + 1 = 76."
  const subtotals = denoms.map((d) => d * counts[d]!)
  const additionStr = subtotals.join(' + ')
  const answerNum = total(params)

  return {
    body_en: `Find: What is the total value of the coins shown, in cents?`,
    body_id: `Cari: Berapa nilai total koin yang ditampilkan, dalam sen?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answerNum),
    hint_en:
      'Group coins of the same value together, multiply each group (count × value) to get a subtotal, then add all the subtotals.',
    hint_id:
      'Kelompokkan koin yang bernilai sama, kalikan setiap kelompok (jumlah × nilai) untuk mendapat subtotal, lalu jumlahkan semua subtotal.',
    hint_steps_en: [
      `Group by denomination: ${groupSummary_en}.`,
      `Multiply each group: ${products_en}.`,
      `Add the subtotals: ${additionStr} = ${answerNum}.`,
    ],
    hint_steps_id: [
      `Kelompokkan berdasarkan nilai: ${groupSummary_id}.`,
      `Kalikan setiap kelompok: ${products_id}.`,
      `Jumlahkan subtotal: ${additionStr} = ${answerNum}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
