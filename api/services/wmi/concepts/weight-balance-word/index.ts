import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildWeightBalanceWordBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  bottles: z.number().int().min(2).max(8),
  perBottle: z.number().int().min(20).max(500),
  sugar: z.number().int().min(20).max(500),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'weight-balance-word',
  name_en: 'Find one item’s weight from a total',
  name_id: 'Cari berat satu benda dari total',
  grades: [2, 3] as const,
  description_id: 'Cari berat satu botol dari berat total dan berat gula.',
} as const

export function generate(rng: Rng): Params {
  return { bottles: rng.int(2, 6), perBottle: rng.int(50, 400), sugar: rng.int(50, 300) }
}

export function render(params: Params) {
  const total = params.sugar + params.bottles * params.perBottle
  const remaining = total - params.sugar
  return {
    body_en: `A bag of sugar and ${params.bottles} identical [[bottle|bottles]] of milk are placed on a [[balance-scale|balance scale]]. Together they weigh ${total} g in total. The bag of sugar alone weighs ${params.sugar} g.\nFind: How many grams does one bottle of milk weigh?`,
    body_id: `Sekantong gula dan ${params.bottles} [[bottle|botol]] susu yang identik diletakkan di atas [[balance-scale|timbangan]]. Bersama-sama beratnya ${total} g. Kantong gula saja beratnya ${params.sugar} g.\nCari: Berapa gram berat satu botol susu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.perBottle),
    hint_en: `Remove the sugar's weight from the total first — what remains belongs equally to each bottle.`,
    hint_id: 'Kurangi berat gula dari total terlebih dahulu — sisanya terbagi rata ke setiap botol.',
    hint_steps_en: [
      `Total weight of everything: ${total} g`,
      `Remove the sugar: ${total} − ${params.sugar} = ${remaining} g for the bottles`,
      `Divide equally among ${params.bottles} bottles: ${remaining} ÷ ${params.bottles} = ${params.perBottle} g`,
      `One bottle of milk weighs ${params.perBottle} g.`,
    ],
    hint_steps_id: [
      `Berat total semua benda: ${total} g`,
      `Kurangi berat gula: ${total} − ${params.sugar} = ${remaining} g untuk semua botol`,
      `Bagi rata ke ${params.bottles} botol: ${remaining} ÷ ${params.bottles} = ${params.perBottle} g`,
      `Satu botol susu beratnya ${params.perBottle} g.`,
    ],
    breakdown: buildWeightBalanceWordBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
