import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildPerfectSquareSearchBreakdown } from './breakdown.js'

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
  const { n } = params
  const answer = nextSquareAbove(n)
  const answerRoot = Math.floor(Math.sqrt(n)) + 1
  const prevRoot = answerRoot - 1

  return {
    body_en: `Find: What is the smallest [[perfect-square|perfect square]] greater than ${n}?`,
    body_id: `Cari: Berapakah [[perfect-square|bilangan kuadrat sempurna]] terkecil yang lebih besar dari ${n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: `List perfect squares in order and stop at the first one that exceeds ${n}.`,
    hint_id: `Urutkan bilangan kuadrat sempurna dan berhenti di yang pertama melebihi ${n}.`,
    hint_steps_en: [
      `A [[perfect-square|perfect square]] is n × n: 1, 4, 9, 16, 25, …`,
      `${prevRoot} × ${prevRoot} = ${prevRoot * prevRoot}, which is ≤ ${n}.`,
      `${answerRoot} × ${answerRoot} = ${answer}, which is > ${n}.`,
      `So the smallest perfect square greater than ${n} is ${answer}.`,
    ],
    hint_steps_id: [
      `[[perfect-square|Bilangan kuadrat sempurna]] adalah n × n: 1, 4, 9, 16, 25, …`,
      `${prevRoot} × ${prevRoot} = ${prevRoot * prevRoot}, nilainya ≤ ${n}.`,
      `${answerRoot} × ${answerRoot} = ${answer}, nilainya > ${n}.`,
      `Jadi bilangan kuadrat sempurna terkecil yang lebih besar dari ${n} adalah ${answer}.`,
    ],
    breakdown: buildPerfectSquareSearchBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
