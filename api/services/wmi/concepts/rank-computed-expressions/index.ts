import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildRankBreakdown } from './breakdown.js'

const exprSchema = z.object({
  a: z.number().int().min(1).max(30),
  op: z.enum(['+', '-', '×']),
  b: z.number().int().min(1).max(12),
})
export type Expr = z.infer<typeof exprSchema>

const paramsSchema = z.object({
  exprs: z.array(exprSchema).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'rank-computed-expressions',
  name_en: 'Which expression is the largest?',
  name_id: 'Ekspresi mana yang paling besar?',
  grades: [1, 2] as const,
  description_id: 'Hitung setiap ekspresi, lalu bandingkan hasilnya.',
} as const

export function evalExpr(e: Expr): number {
  if (e.op === '+') return e.a + e.b
  if (e.op === '-') return e.a - e.b
  return e.a * e.b
}
export function exprText(e: Expr): string {
  return `${e.a} ${e.op} ${e.b}`
}

function genOneExpr(rng: Rng): Expr {
  const op = rng.pick(['+', '-', '×'] as const)
  if (op === '-') {
    // require a > b so the result stays positive
    const b = rng.int(1, 12)
    const a = rng.int(b + 1, 30)
    return { a, op, b }
  }
  if (op === '×') {
    // keep a <= 12 so products stay small
    const a = rng.int(1, 12)
    const b = rng.int(1, 12)
    return { a, op, b }
  }
  const a = rng.int(1, 30)
  const b = rng.int(1, 12)
  return { a, op, b }
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 200; attempt++) {
    const exprs = [genOneExpr(rng), genOneExpr(rng), genOneExpr(rng), genOneExpr(rng)]
    const values = exprs.map(evalExpr)
    if (new Set(values).size === values.length) {
      return { exprs }
    }
  }
  throw new Error('rank-computed-expressions: failed to generate distinct values')
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = params.exprs.map(evalExpr)
  const maxIdx = values.indexOf(Math.max(...values))
  const answerLabel = labels[maxIdx]

  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: exprText(params.exprs[i]) }))

  const hint_steps_en = [
    'Work out each expression, one at a time.',
    ...params.exprs.map((e, i) => `${labels[i]}) ${exprText(e)} = ${values[i]}`),
    `The largest value is ${values[maxIdx]}, so the answer is ${answerLabel}.`,
  ]
  const hint_steps_id = [
    'Hitung setiap ekspresi satu per satu.',
    ...params.exprs.map((e, i) => `${labels[i]}) ${exprText(e)} = ${values[i]}`),
    `Nilai terbesar adalah ${values[maxIdx]}, jadi jawabannya ${answerLabel}.`,
  ]

  return {
    body_en: `Work out each expression, then decide which one is the largest.\n\nFind: Which expression has the greatest value?`,
    body_id: `Hitung setiap ekspresi, lalu tentukan mana yang paling besar.\n\nCari: Ekspresi manakah yang nilainya paling besar?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: answerLabel,
    hint_en: 'Compute each expression, then compare the values to find the biggest one.',
    hint_id: 'Hitung setiap ekspresi, lalu bandingkan nilainya untuk menemukan yang terbesar.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildRankBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
