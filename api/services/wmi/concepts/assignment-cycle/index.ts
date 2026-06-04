import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

const paramsSchema = z.object({
  cycle: z.number().int().min(3).max(5),
  n: z.number().int().min(6).max(60),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'assignment-cycle',
  name_en: 'Repeating count-off pattern',
  name_id: 'Pola hitung berulang',
  grades: [2, 3] as const,
  description_id: 'Temukan label ke-n dalam pola yang berulang.',
} as const

export function labelAt(p: Params): string {
  return LABELS[(p.n - 1) % p.cycle]
}

export function generate(rng: Rng): Params {
  const cycle = rng.int(3, 5)
  const n = rng.int(6, 50)
  return { cycle, n }
}

export function render(params: Params) {
  const seq = LABELS.slice(0, params.cycle).join(', ')
  return {
    body_en: `Children count off in a repeating pattern ${seq}, ${seq}, … Which letter does child number ${params.n} say?`,
    body_id: `Anak-anak berhitung dengan pola berulang ${seq}, ${seq}, … Huruf apa yang diucapkan anak nomor ${params.n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: labelAt(params),
    hint_en: `The pattern repeats every ${params.cycle}. Find the remainder of ${params.n} divided by ${params.cycle}.`,
    hint_id: `Pola berulang setiap ${params.cycle}. Cari sisa pembagian ${params.n} dengan ${params.cycle}.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
