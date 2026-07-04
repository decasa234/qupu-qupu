import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCommonFactorBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  a: z.number().int().min(2).max(18),
  b: z.number().int().min(2).max(18),
  c: z.number().int().min(2).max(12),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'common-factor-shortcut',
  name_en: 'Factor out the common number',
  name_id: 'Keluarkan faktor yang sama',
  grades: [3] as const,
  description_id: 'a×c + b×c = (a+b)×c — kelompokkan faktor yang sama agar mudah dihitung.',
} as const

// a×c + b×c = (a+b)×c
export function result(p: Params): number {
  return (p.a + p.b) * p.c
}

export function generate(rng: Rng): Params {
  let a = rng.int(2, 18)
  let b = rng.int(2, 18)
  // Prefer a "round" a+b (divisible by 10) so the shortcut is satisfying, and
  // keep a !== b so the two term highlights ("a × c" / "b × c") stay distinct.
  // Bounded resample — accept whatever we have if we never land on a round sum.
  for (let attempt = 0; attempt < 20 && ((a + b) % 10 !== 0 || a === b); attempt++) {
    a = rng.int(2, 18)
    b = rng.int(2, 18)
  }
  if (a === b) b = a === 18 ? 17 : b + 1 // final guard: never equal
  const c = rng.int(2, 12)
  return { a, b, c }
}

export function render(params: Params) {
  const { a, b, c } = params
  const sum = a + b
  const answer = result(params)

  const body_en = `${a} × ${c} + ${b} × ${c} = ?`
  const body_id = body_en

  const hint_steps_en = [
    `Both terms share the same factor ×${c}.`,
    `Add ${a} + ${b} = ${sum}.`,
    `${sum} × ${c} = ${answer}.`,
  ]
  const hint_steps_id = [
    `Kedua suku memiliki faktor yang sama ×${c}.`,
    `Jumlahkan ${a} + ${b} = ${sum}.`,
    `${sum} × ${c} = ${answer}.`,
  ]

  return {
    body_en,
    body_id,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: `Group the shared factor: ${a} × ${c} + ${b} × ${c} = (${a} + ${b}) × ${c}.`,
    hint_id: `Kelompokkan faktor yang sama: ${a} × ${c} + ${b} × ${c} = (${a} + ${b}) × ${c}.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildCommonFactorBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
