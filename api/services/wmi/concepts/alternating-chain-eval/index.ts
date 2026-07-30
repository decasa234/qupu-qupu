import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildAlternatingChainEvalBreakdown } from './breakdown.js'

const stepSchema = z.object({ op: z.enum(['+', '-']), n: z.number().int().min(1).max(99) })
const paramsSchema = z.object({
  start: z.number().int().min(1).max(99),
  steps: z.array(stepSchema).min(2).max(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'alternating-chain-eval',
  name_en: 'Evaluate an add/subtract chain',
  name_id: 'Hitung rantai tambah-kurang',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung serangkaian penjumlahan dan pengurangan dari kiri ke kanan.',
} as const

export function evaluate(p: Params): number {
  let total = p.start
  for (const s of p.steps) total = s.op === '+' ? total + s.n : total - s.n
  return total
}

export function generate(rng: Rng): Params {
  const start = rng.int(20, 50)
  const count = rng.int(3, 4)
  const steps: { op: '+' | '-'; n: number }[] = []
  let running = start
  for (let i = 0; i < count; i++) {
    let op = rng.pick(['+', '-'] as const)
    if (op === '-' && running < 1) op = '+'
    if (op === '-') {
      // keep every partial total >= 0, and each term within the schema bound
      const n = rng.int(1, Math.min(running, 99))
      running -= n
      steps.push({ op, n })
    } else {
      const n = rng.int(1, 30)
      running += n
      steps.push({ op, n })
    }
  }
  return { start, steps }
}

export function render(params: Params) {
  const expr =
    `${params.start} ` + params.steps.map((s) => `${s.op === '+' ? '+' : '−'} ${s.n}`).join(' ')
  const stepsEn: string[] = [`Start at ${params.start}.`]
  const stepsId: string[] = [`Mulai dari ${params.start}.`]
  let running = params.start
  for (const s of params.steps) {
    const prev = running
    const sym = s.op === '+' ? '+' : '−'
    running = s.op === '+' ? running + s.n : running - s.n
    stepsEn.push(`${prev} ${sym} ${s.n} = ${running}.`)
    stepsId.push(`${prev} ${sym} ${s.n} = ${running}.`)
  }
  return {
    body_en: `Find: Compute ${expr}.`,
    body_id: `Cari: Hitunglah ${expr}.`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(evaluate(params)),
    hint_en: 'Keep a running total, working from left to right one step at a time.',
    hint_id: 'Jaga jumlah berjalan, kerjakan dari kiri ke kanan satu langkah demi satu.',
    hint_steps_en: stepsEn,
    hint_steps_id: stepsId,
    breakdown: buildAlternatingChainEvalBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
