import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  start: z.number().int().min(0).max(10),
  step: z.number().int().min(2).max(6),
  jumps: z.number().int().min(2).max(6),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'number-line-jumps',
  name_en: 'Jumps on a number line',
  name_id: 'Lompatan pada garis bilangan',
  grades: [1, 2] as const,
  description_id: 'Tentukan bilangan tempat berhenti setelah beberapa lompatan sama besar.',
} as const

export function landing(p: Params): number {
  return p.start + p.step * p.jumps
}

export function generate(rng: Rng): Params {
  return { start: rng.int(0, 8), step: rng.int(2, 5), jumps: rng.int(2, 5) }
}

export function render(params: Params) {
  return {
    body_en: `A frog starts at ${params.start} on the number line and makes ${params.jumps} equal jumps of ${params.step} to the right. What number does it land on?`,
    body_id: `Seekor katak mulai di ${params.start} pada garis bilangan dan melompat ${params.jumps} kali sebesar ${params.step} ke kanan. Di bilangan berapa ia berhenti?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(landing(params)),
    hint_en: 'Each jump adds the same amount. Add the step that many times to the start.',
    hint_id: 'Setiap lompatan menambah jumlah yang sama. Tambahkan langkah itu sebanyak lompatan ke titik awal.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
