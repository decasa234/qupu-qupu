import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildSumPartitionSplitBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  small: z.number().int().min(2).max(40),
  k: z.number().int().min(2).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'sum-partition-split',
  name_en: 'Share a total in a given ratio',
  name_id: 'Bagi total dengan rasio tertentu',
  grades: [3] as const,
  description_id: 'Bagi sebuah total menjadi dua bagian dengan rasio tertentu.',
} as const

export function generate(rng: Rng): Params {
  return { small: rng.int(3, 25), k: rng.int(2, 4) }
}

export function render(params: Params) {
  const total = (params.k + 1) * params.small
  const parts = params.k + 1
  return {
    body_en: `Rina and Doni share ${total} stickers between them. Doni receives exactly ${params.k} times as many stickers as Rina.\n\nFind: How many stickers does Rina receive?`,
    body_id: `Rina dan Doni berbagi ${total} stiker di antara mereka. Doni menerima tepat ${params.k} kali lebih banyak stiker daripada Rina.\n\nCari: Berapa stiker yang diterima Rina?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.small),
    hint_en: `Write the two shares as 1 part and ${params.k} parts, then ask: if ${parts} equal parts make ${total}, what is one part?`,
    hint_id: `Tuliskan dua bagian sebagai 1 bagian dan ${params.k} bagian, lalu tanyakan: jika ${parts} bagian sama berjumlah ${total}, berapa satu bagian?`,
    hint_steps_en: [
      `Let Rina's share = 1 part. Then Doni's share = ${params.k} parts. Together: 1 + ${params.k} = ${parts} parts.`,
      `All ${parts} parts equal the total: ${parts} parts = ${total} stickers.`,
      `One part = ${total} ÷ ${parts} = ${params.small} stickers.`,
      `Rina receives ${params.small} stickers.`,
    ],
    hint_steps_id: [
      `Misalkan bagian Rina = 1 bagian. Maka bagian Doni = ${params.k} bagian. Totalnya: 1 + ${params.k} = ${parts} bagian.`,
      `Semua ${parts} bagian sama dengan total: ${parts} bagian = ${total} stiker.`,
      `Satu bagian = ${total} ÷ ${parts} = ${params.small} stiker.`,
      `Rina menerima ${params.small} stiker.`,
    ],
    breakdown: buildSumPartitionSplitBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
