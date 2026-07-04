import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildSymbolBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  s: z.number().int().min(2).max(9),
  c: z.number().int().min(2).max(12),
  n: z.number().int().min(2).max(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'solve-symbol-equations',
  name_en: 'Solve for the symbol values',
  name_id: 'Cari nilai lambang',
  grades: [1, 2, 3] as const,
  description_id:
    'Gunakan persamaan pertama untuk mencari satu lambang, lalu persamaan kedua untuk lambang lainnya.',
} as const

export function generate(rng: Rng): Params {
  const s = rng.int(2, 9)
  const c = rng.int(2, 12)
  const n = rng.int(2, 4)
  return { s, c, n }
}

export function render(params: Params) {
  const { s, c, n } = params
  const total1 = n * s
  const total2 = s + c
  const chain = Array.from({ length: n }, () => '★').join(' + ')

  const hint_steps_en = [
    `Find ★ = ${total1} ÷ ${n} = ${s}.`,
    `Then ● = ${total2} − ${s} = ${c}.`,
  ]
  const hint_steps_id = [
    `Cari ★ = ${total1} ÷ ${n} = ${s}.`,
    `Lalu ● = ${total2} − ${s} = ${c}.`,
  ]

  return {
    body_en: `${chain} = ${total1}   and   ★ + ● = ${total2}\n\nFind: What is the value of ●?`,
    body_id: `${chain} = ${total1}   dan   ★ + ● = ${total2}\n\nCari: Berapa nilai ●?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(c),
    hint_en: 'Use the first equation to find ★, then use the second equation to find ●.',
    hint_id: 'Gunakan persamaan pertama untuk mencari ★, lalu persamaan kedua untuk mencari ●.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildSymbolBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
