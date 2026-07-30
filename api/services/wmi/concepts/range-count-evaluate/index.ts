import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildRangeCountEvaluateBreakdown } from './breakdown.js'

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
  grades: [1, 2, 3] as const,
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
  const { lo, hi, exprs } = params

  // Format the list of expressions (e.g. "12 + 8,  30 − 5,  ...")
  const list = exprs.map((e) => `${e.x} ${e.op === '+' ? '+' : '−'} ${e.y}`).join(',  ')

  // Build hint steps
  // Step 1: evaluate each expression and show the result
  const evalLines = exprs
    .map((e, i) => {
      const v = evalExpr(e)
      return `(${i + 1}) ${e.x} ${e.op === '+' ? '+' : '−'} ${e.y} = ${v}`
    })
    .join(';  ')

  // Step 2: identify which values are in [lo, hi]
  const inRange = exprs
    .map((e, i) => ({ idx: i + 1, val: evalExpr(e) }))
    .filter(({ val }) => val >= lo && val <= hi)

  const count = inRange.length

  const inRangeStr =
    inRange.length === 0
      ? 'none'
      : inRange.map(({ idx, val }) => `(${idx}) = ${val}`).join(', ')

  const inRangeStrId =
    inRange.length === 0
      ? 'tidak ada'
      : inRange.map(({ idx, val }) => `(${idx}) = ${val}`).join(', ')

  const hint_steps_en = [
    `Evaluate each expression: ${evalLines}.`,
    `Identify which results fall in [${lo}, ${hi}]: ${inRangeStr}.`,
    `Count them: there ${count === 1 ? 'is' : 'are'} ${count} value${count === 1 ? '' : 's'} in the range.`,
  ]

  const hint_steps_id = [
    `Hitung setiap ekspresi: ${evalLines}.`,
    `Tentukan hasil yang berada di antara ${lo} dan ${hi}: ${inRangeStrId}.`,
    `Hitung jumlahnya: terdapat ${count} nilai${count === 1 ? '' : ''} yang masuk dalam rentang.`,
  ]

  return {
    body_en: `The ${exprs.length} expressions below each produce a whole-number result.\n\nFind: How many of the expressions below have a value between ${lo} and ${hi} (inclusive)?\n\n${list}`,
    body_id: `Sebanyak ${exprs.length} ekspresi di bawah ini masing-masing menghasilkan suatu bilangan bulat.\n\nCari: Berapa banyak ekspresi di bawah ini yang hasilnya bernilai antara ${lo} dan ${hi} (termasuk batas)?\n\n${list}`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(countInRange(params)),
    hint_en: 'Try evaluating each expression one at a time, then mark the ones whose result lands inside the given range.',
    hint_id: 'Coba hitung setiap ekspresi satu per satu, lalu tandai yang hasilnya masuk ke dalam rentang yang diberikan.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildRangeCountEvaluateBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
