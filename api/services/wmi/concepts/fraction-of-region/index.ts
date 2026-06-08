import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildFractionOfRegionBreakdown } from './breakdown.js'

const paramsSchema = z
  .object({
    parts: z.number().int().min(2).max(8),
    shaded: z.number().int().min(1).max(7),
  })
  .refine((v) => v.shaded < v.parts, { message: 'shaded must be fewer than total parts' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'fraction-of-region',
  name_en: 'Parts of a whole',
  name_id: 'Bagian dari keseluruhan',
  grades: [1, 2] as const,
  description_id: 'Hitung berapa bagian yang TIDAK diarsir pada bangun yang dibagi sama besar.',
} as const

export function unshaded(p: Params): number {
  return p.parts - p.shaded
}

export function generate(rng: Rng): Params {
  const parts = rng.int(3, 8)
  const shaded = rng.int(1, parts - 1)
  return { parts, shaded }
}

export function render(params: Params) {
  const { parts, shaded } = params
  const notShaded = unshaded(params)
  return {
    body_en: `A shape is divided into ${parts} equal parts and ${shaded} part${shaded === 1 ? ' is' : 's are'} shaded. Find: How many parts are NOT shaded?`,
    body_id: `Sebuah bangun dibagi menjadi ${parts} bagian sama besar dan ${shaded} bagian diarsir. Cari: Berapa bagian yang TIDAK diarsir?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(notShaded),
    hint_en: `Subtract the shaded parts from the total: the unshaded count is what is left over.`,
    hint_id: `Kurangi bagian yang diarsir dari seluruh bagian: bagian yang tidak diarsir adalah sisanya.`,
    hint_steps_en: [
      `The shape has ${parts} equal parts in total.`,
      `${shaded} part${shaded === 1 ? ' is' : 's are'} shaded, so the rest are not shaded.`,
      `${parts} − ${shaded} = ${notShaded}.`,
      `There ${notShaded === 1 ? 'is' : 'are'} ${notShaded} part${notShaded === 1 ? '' : 's'} not shaded.`,
    ],
    hint_steps_id: [
      `Bangun tersebut memiliki ${parts} bagian sama besar.`,
      `${shaded} bagian diarsir, sehingga sisanya tidak diarsir.`,
      `${parts} − ${shaded} = ${notShaded}.`,
      `Ada ${notShaded} bagian yang tidak diarsir.`,
    ],
    breakdown: buildFractionOfRegionBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
