import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const KINDS = [
  'equilateral-triangle',
  'isosceles-triangle',
  'rectangle',
  'square',
  'regular-pentagon',
  'regular-hexagon',
] as const

const LINES: Record<(typeof KINDS)[number], number> = {
  'equilateral-triangle': 3,
  'isosceles-triangle': 1,
  rectangle: 2,
  square: 4,
  'regular-pentagon': 5,
  'regular-hexagon': 6,
}

const paramsSchema = z.object({ kind: z.enum(KINDS) })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'symmetry-count',
  name_en: 'Lines of symmetry',
  name_id: 'Garis simetri',
  grades: [2, 3] as const,
  description_id: 'Hitung banyak garis simetri pada sebuah bangun.',
} as const

export function linesOfSymmetry(p: Params): number {
  return LINES[p.kind]
}

export function generate(rng: Rng): Params {
  return { kind: rng.pick(KINDS) }
}

export function render(params: Params) {
  return {
    body_en: 'How many lines of symmetry does this shape have?',
    body_id: 'Berapa banyak garis simetri yang dimiliki bangun ini?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(linesOfSymmetry(params)),
    hint_en: 'A line of symmetry folds the shape so the two halves match exactly.',
    hint_id: 'Garis simetri melipat bangun sehingga kedua sisinya sama persis.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
