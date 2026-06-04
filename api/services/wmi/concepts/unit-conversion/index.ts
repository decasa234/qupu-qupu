import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  mode: z.enum(['m-cm', 'kg-g', 'dollar-cent']),
  big: z.number().int().min(1).max(9),
  small: z.number().int().min(0).max(999),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'unit-conversion',
  name_en: 'Convert to the smaller unit',
  name_id: 'Konversi ke satuan yang lebih kecil',
  grades: [2, 3] as const,
  description_id: 'Ubah ukuran gabungan menjadi satu satuan yang lebih kecil.',
} as const

const UNITS = {
  'm-cm': { factor: 100, bigEn: 'm', smallEn: 'cm', bigId: 'm', smallId: 'cm' },
  'kg-g': { factor: 1000, bigEn: 'kg', smallEn: 'g', bigId: 'kg', smallId: 'g' },
  'dollar-cent': { factor: 100, bigEn: 'dollars', smallEn: 'cents', bigId: 'dolar', smallId: 'sen' },
} as const

export function answerValue(p: Params): number {
  return p.big * UNITS[p.mode].factor + p.small
}

export function generate(rng: Rng): Params {
  const mode = rng.pick(['m-cm', 'kg-g', 'dollar-cent'] as const)
  const maxSmall = UNITS[mode].factor - 1
  return { mode, big: rng.int(1, 9), small: rng.int(0, Math.min(maxSmall, mode === 'kg-g' ? 900 : 99)) }
}

export function render(params: Params) {
  const u = UNITS[params.mode]
  return {
    body_en: `How many ${u.smallEn} are there in ${params.big} ${u.bigEn} ${params.small} ${u.smallEn}?`,
    body_id: `Ada berapa ${u.smallId} dalam ${params.big} ${u.bigId} ${params.small} ${u.smallId}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answerValue(params)),
    hint_en: `1 ${u.bigEn} = ${u.factor} ${u.smallEn}.`,
    hint_id: `1 ${u.bigId} = ${u.factor} ${u.smallId}.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
