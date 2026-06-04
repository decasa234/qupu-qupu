import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const exprSchema = z.object({ op: z.enum(['+', '-']), x: z.number().int().min(1).max(99), y: z.number().int().min(1).max(99) })
const paramsSchema = z.object({
  lo: z.number().int().min(1).max(99),
  hi: z.number().int().min(2).max(160),
  exprs: z.array(exprSchema).min(4).max(6),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'range-count-evaluate',
  name_en: 'Count the results in a range',
  name_id: 'Hitung hasil yang berada dalam rentang',
  grades: [2, 3] as const,
  description_id: 'Hitung berapa banyak ekspresi yang hasilnya berada dalam rentang tertentu.',
} as const

function evalExpr(e: { op: '+' | '-'; x: number; y: number }): number {
  return e.op === '+' ? e.x + e.y : e.x - e.y
}

export function countInRange(p: Params): number {
  return p.exprs.filter((e) => {
    const v = evalExpr(e)
    return v >= p.lo && v <= p.hi
  }).length
}

export function generate(rng: Rng): Params {
  const lo = rng.int(20, 45)
  const hi = lo + rng.int(10, 30)
  const count = rng.int(5, 6)
  const exprs: { op: '+' | '-'; x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    if (rng.int(0, 1) === 0) {
      exprs.push({ op: '+', x: rng.int(5, 40), y: rng.int(5, 40) })
    } else {
      const x = rng.int(20, 90)
      exprs.push({ op: '-', x, y: rng.int(1, x) })
    }
  }
  return { lo, hi, exprs }
}

export function render(params: Params) {
  const list = params.exprs.map((e) => `${e.x} ${e.op === '+' ? '+' : '−'} ${e.y}`).join(',  ')
  return {
    body_en: `How many of these have a value between ${params.lo} and ${params.hi} (inclusive)?  ${list}`,
    body_id: `Berapa banyak dari berikut ini yang nilainya antara ${params.lo} dan ${params.hi} (termasuk batas)?  ${list}`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(countInRange(params)),
    hint_en: 'Work out each expression, then count how many land in the range.',
    hint_id: 'Hitung setiap ekspresi, lalu hitung berapa yang masuk dalam rentang.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
