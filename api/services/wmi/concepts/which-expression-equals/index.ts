import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildWhichExpressionEqualsBreakdown } from './breakdown.js'

const exprSchema = z.object({
  op: z.enum(['+', '-']),
  x: z.number().int().min(1).max(99),
  y: z.number().int().min(1).max(99),
})
export type Expr = z.infer<typeof exprSchema>

const paramsSchema = z.object({
  target: z.number().int().min(3).max(40),
  exprs: z.array(exprSchema).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'which-expression-equals',
  name_en: 'Which expression equals the target',
  name_id: 'Ekspresi mana yang sama dengan target',
  grades: [1, 2] as const,
  description_id: 'Pilih ekspresi yang hasilnya sama dengan bilangan target.',
} as const

export function evalExpr(e: Expr): number {
  return e.op === '+' ? e.x + e.y : e.x - e.y
}
export function exprText(e: Expr): string {
  return `${e.x} ${e.op === '+' ? '+' : '−'} ${e.y}`
}

function exprForValue(rng: Rng, v: number): Expr {
  if (v >= 2 && rng.int(0, 1) === 0) {
    const x = rng.int(1, v - 1)
    return { op: '+', x, y: v - x }
  }
  const y = rng.int(1, 9)
  return { op: '-', x: v + y, y }
}

export function generate(rng: Rng): Params {
  const target = rng.int(8, 30)
  const correct = exprForValue(rng, target)
  const used = new Set<number>([target])
  const distractors: Expr[] = []
  for (const off of rng.shuffle([1, -1, 2, -2, 3, 4, -3])) {
    if (distractors.length === 3) break
    const v = target + off
    if (v < 1 || used.has(v)) continue
    used.add(v)
    distractors.push(exprForValue(rng, v))
  }
  return { target, exprs: rng.shuffle([correct, ...distractors]) }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: exprText(params.exprs[i]) }))
  const correctIdx = params.exprs.findIndex((e) => evalExpr(e) === params.target)
  const correct = params.exprs[correctIdx]
  return {
    body_en: `Find: Which expression equals ${params.target}?`,
    body_id: `Cari: Ekspresi manakah yang hasilnya ${params.target}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: `Work out each option, then find the one that equals ${params.target}.`,
    hint_id: `Hitung setiap pilihan, lalu cari yang hasilnya ${params.target}.`,
    hint_steps_en: [
      'Work out each option, one at a time.',
      `${exprText(correct)} = ${params.target}.`,
      `So the answer is ${labels[correctIdx]}.`,
    ],
    hint_steps_id: [
      'Hitung setiap pilihan satu per satu.',
      `${exprText(correct)} = ${params.target}.`,
      `Jadi jawabannya ${labels[correctIdx]}.`,
    ],
    breakdown: buildWhichExpressionEqualsBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
