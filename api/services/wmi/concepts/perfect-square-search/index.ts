import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  n: z.number().int().min(10).max(400),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'perfect-square-search',
  name_en: 'Smallest perfect square above n',
  name_id: 'Bilangan kuadrat terkecil di atas n',
  grades: [3] as const,
  description_id: 'Cari bilangan kuadrat sempurna terkecil yang lebih besar dari n.',
} as const

export function nextSquareAbove(n: number): number {
  const root = Math.floor(Math.sqrt(n)) + 1
  return root * root
}

export function generate(rng: Rng): Params {
  return { n: rng.int(20, 300) }
}

export function render(params: Params) {
  return {
    body_en: `What is the smallest perfect square that is greater than ${params.n}?`,
    body_id: `Berapakah bilangan kuadrat sempurna terkecil yang lebih besar dari ${params.n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(nextSquareAbove(params.n)),
    hint_en: 'A perfect square is a number times itself (1, 4, 9, 16, 25, …). Find the first one past n.',
    hint_id: 'Bilangan kuadrat adalah bilangan dikali dirinya (1, 4, 9, 16, 25, …). Cari yang pertama melewati n.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
