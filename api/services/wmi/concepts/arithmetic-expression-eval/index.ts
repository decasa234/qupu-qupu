import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildArithmeticExpressionEvalBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  mode: z.enum(['sum-list', 'product-plus', 'product-diff']),
  a: z.number().int().min(1).max(99),
  b: z.number().int().min(1).max(99),
  c: z.number().int().min(1).max(99),
  d: z.number().int().min(1).max(99),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'arithmetic-expression-eval',
  name_en: 'Evaluate an arithmetic expression',
  name_id: 'Hitung nilai ekspresi aritmetika',
  grades: [2, 3] as const,
  description_id: 'Hitung nilai sebuah ekspresi (jumlah panjang atau selisih dua hasil kali).',
} as const

export function generate(rng: Rng): Params {
  const mode = rng.pick(['sum-list', 'product-plus', 'product-diff'] as const)
  if (mode === 'sum-list') {
    return { mode, a: rng.int(11, 49), b: rng.int(11, 49), c: rng.int(11, 49), d: rng.int(11, 49) }
  }
  if (mode === 'product-plus') {
    return { mode, a: rng.int(2, 9), b: rng.int(2, 9), c: rng.int(5, 40), d: 1 }
  }
  // product-diff: keep the first product the larger one so the result is non-negative
  let a = rng.int(3, 9)
  let b = rng.int(3, 9)
  let c = rng.int(2, 9)
  let d = rng.int(2, 9)
  if (a * b < c * d) {
    ;[a, c] = [c, a]
    ;[b, d] = [d, b]
  }
  return { mode, a, b, c, d }
}

/** Evaluate the expression these params describe (precedence-correct). */
export function evaluate(p: Params): number {
  if (p.mode === 'sum-list') return p.a + p.b + p.c + p.d
  if (p.mode === 'product-plus') return p.a * p.b + p.c
  return p.a * p.b - p.c * p.d
}

function expr(p: Params, times: string): string {
  if (p.mode === 'sum-list') return `${p.a} + ${p.b} + ${p.c} + ${p.d}`
  if (p.mode === 'product-plus') return `${p.a} ${times} ${p.b} + ${p.c}`
  return `${p.a} ${times} ${p.b} − ${p.c} ${times} ${p.d}`
}

export function render(params: Params) {
  const p = params
  const answer = evaluate(p)
  let hint_steps_en: string[]
  let hint_steps_id: string[]
  if (p.mode === 'sum-list') {
    const s1 = p.a + p.b
    const s2 = p.c + p.d
    hint_steps_en = [
      `Group into easy pairs: (${p.a} + ${p.b}) + (${p.c} + ${p.d}).`,
      `${p.a} + ${p.b} = ${s1} and ${p.c} + ${p.d} = ${s2}.`,
      `${s1} + ${s2} = ${answer}.`,
    ]
    hint_steps_id = [
      `Kelompokkan menjadi pasangan mudah: (${p.a} + ${p.b}) + (${p.c} + ${p.d}).`,
      `${p.a} + ${p.b} = ${s1} dan ${p.c} + ${p.d} = ${s2}.`,
      `${s1} + ${s2} = ${answer}.`,
    ]
  } else if (p.mode === 'product-plus') {
    const prod = p.a * p.b
    hint_steps_en = [`Do the product first: ${p.a} × ${p.b} = ${prod}.`, `Then add: ${prod} + ${p.c} = ${answer}.`]
    hint_steps_id = [`Kerjakan perkalian dulu: ${p.a} × ${p.b} = ${prod}.`, `Lalu tambah: ${prod} + ${p.c} = ${answer}.`]
  } else {
    const p1 = p.a * p.b
    const p2 = p.c * p.d
    hint_steps_en = [
      `Do both products first: ${p.a} × ${p.b} = ${p1} and ${p.c} × ${p.d} = ${p2}.`,
      `Then subtract: ${p1} − ${p2} = ${answer}.`,
    ]
    hint_steps_id = [
      `Kerjakan kedua perkalian dulu: ${p.a} × ${p.b} = ${p1} dan ${p.c} × ${p.d} = ${p2}.`,
      `Lalu kurangi: ${p1} − ${p2} = ${answer}.`,
    ]
  }
  return {
    body_en: `Find: Compute ${expr(params, '×')}.`,
    body_id: `Cari: Hitunglah ${expr(params, '×')}.`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: p.mode === 'sum-list' ? 'Group the numbers into easy pairs.' : 'Do the multiplication first, then add or subtract.',
    hint_id: p.mode === 'sum-list' ? 'Kelompokkan bilangan menjadi pasangan yang mudah.' : 'Kerjakan perkalian dahulu, lalu tambah atau kurang.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildArithmeticExpressionEvalBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
