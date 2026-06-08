import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildUnitConversionBreakdown } from './breakdown.js'

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
  const ans = answerValue(params)
  const bigPart = params.big * u.factor
  return {
    body_en: `Remember that 1 ${u.bigEn} = ${u.factor} ${u.smallEn}.\n\nFind: How many ${u.smallEn} are in ${params.big} ${u.bigEn} and ${params.small} ${u.smallEn}?`,
    body_id: `Ingat bahwa 1 ${u.bigId} = ${u.factor} ${u.smallId}.\n\nCari: Berapa ${u.smallId} dalam ${params.big} ${u.bigId} dan ${params.small} ${u.smallId}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(ans),
    hint_en: `To convert, remember 1 ${u.bigEn} = ${u.factor} ${u.smallEn} — multiply the bigger unit by ${u.factor}, then add the leftover ${u.smallEn}.`,
    hint_id: `Untuk mengonversi, ingat 1 ${u.bigId} = ${u.factor} ${u.smallId} — kalikan satuan besar dengan ${u.factor}, lalu tambahkan sisa ${u.smallId}-nya.`,
    hint_steps_en: [
      `Convert the ${u.bigEn}: ${params.big} × ${u.factor} = ${bigPart} ${u.smallEn}`,
      `Add the extra ${u.smallEn}: ${bigPart} + ${params.small} = ${ans} ${u.smallEn}`,
      `Answer: ${ans} ${u.smallEn}`,
    ],
    hint_steps_id: [
      `Ubah ${u.bigId}: ${params.big} × ${u.factor} = ${bigPart} ${u.smallId}`,
      `Tambahkan sisa ${u.smallId}: ${bigPart} + ${params.small} = ${ans} ${u.smallId}`,
      `Jawaban: ${ans} ${u.smallId}`,
    ],
    breakdown: buildUnitConversionBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
