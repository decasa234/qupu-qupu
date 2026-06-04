import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    x: z.number().int().min(1).max(200),
    k: z.number().int().min(1).max(50),
    dir: z.enum(['more', 'less']),
  })
  .refine((v) => v.dir === 'more' || v.x - v.k >= 0, { message: 'result must be non-negative' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'more-or-less-by-k',
  name_en: 'A number more or less than another by k',
  name_id: 'Bilangan yang lebih atau kurang sebanyak k',
  grades: [1, 2] as const,
  description_id: 'Cari bilangan yang lebih atau kurang sekian dari sebuah bilangan.',
} as const

export function result(p: Params): number {
  return p.dir === 'more' ? p.x + p.k : p.x - p.k
}

export function generate(rng: Rng): Params {
  const x = rng.int(10, 150)
  const dir = rng.pick(['more', 'less'] as const)
  const k = dir === 'more' ? rng.int(1, 50) : rng.int(1, Math.min(50, x))
  return { x, k, dir }
}

export function render(params: Params) {
  const word = params.dir === 'more' ? 'more than' : 'less than'
  const wordId = params.dir === 'more' ? 'lebih dari' : 'kurang dari'
  return {
    body_en: `What number is ${params.k} ${word} ${params.x}?`,
    body_id: `Bilangan berapakah yang ${params.k} ${wordId} ${params.x}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(result(params)),
    hint_en: params.dir === 'more' ? 'Add the two numbers.' : 'Subtract to go lower.',
    hint_id: params.dir === 'more' ? 'Jumlahkan kedua bilangan.' : 'Kurangkan untuk menjadi lebih kecil.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
