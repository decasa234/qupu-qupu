import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildMoreOrLessByKBreakdown } from './breakdown.js'

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
  grades: [1] as const,
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
  const { x, k, dir } = params
  const ans = result(params)
  const word = dir === 'more' ? 'more than' : 'less than'
  const wordId = dir === 'more' ? 'lebih dari' : 'kurang dari'
  const op = dir === 'more' ? '+' : '−'
  return {
    body_en: `A number is ${k} ${word} ${x}. Find: What is that number?`,
    body_id: `Suatu bilangan adalah ${k} ${wordId} ${x}. Cari: Bilangan apakah itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(ans),
    hint_en: dir === 'more'
      ? `When a number is k more than another, add k to that number.`
      : `When a number is k less than another, subtract k from that number.`,
    hint_id: dir === 'more'
      ? `Jika suatu bilangan adalah k lebih dari bilangan lain, tambahkan k pada bilangan itu.`
      : `Jika suatu bilangan adalah k kurang dari bilangan lain, kurangkan k dari bilangan itu.`,
    hint_steps_en: [
      `"${k} ${word} ${x}" means ${x} ${op} ${k}.`,
      `${x} ${op} ${k} = ${ans}.`,
    ],
    hint_steps_id: [
      `"${k} ${wordId} ${x}" artinya ${x} ${op} ${k}.`,
      `${x} ${op} ${k} = ${ans}.`,
    ],
    breakdown: buildMoreOrLessByKBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
