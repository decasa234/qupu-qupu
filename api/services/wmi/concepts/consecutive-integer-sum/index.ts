import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildConsecutiveSumBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  n: z.number().int().min(3).max(6),
  start: z.number().int().min(2).max(30),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'consecutive-integer-sum',
  name_en: 'Sum of consecutive numbers',
  name_id: 'Jumlah bilangan berurutan',
  grades: [3] as const,
  description_id: 'Jumlah n bilangan berurutan = n × bilangan tengah; pakai itu untuk mencari yang terkecil.',
} as const

// The sum of n consecutive whole numbers starting at `start`:
// start + (start+1) + ... + (start+n-1) = n*start + n*(n-1)/2.
export function sumOf(p: Params): number {
  return p.n * p.start + (p.n * (p.n - 1)) / 2
}

export function generate(rng: Rng): Params {
  const n = rng.int(3, 6)
  const start = rng.int(2, 30)
  return { n, start }
}

export function render(params: Params) {
  const { n, start } = params
  const sum = sumOf(params)
  const stepSum = (n * (n - 1)) / 2

  const hint_steps_en = [
    `Subtract 0 + 1 + ... + ${n - 1} = ${stepSum} from the sum: ${sum} − ${stepSum} = ${sum - stepSum}.`,
    `Divide by ${n} to get the smallest number: ${sum - stepSum} ÷ ${n} = ${start}.`,
  ]
  const hint_steps_id = [
    `Kurangi 0 + 1 + ... + ${n - 1} = ${stepSum} dari jumlah: ${sum} − ${stepSum} = ${sum - stepSum}.`,
    `Bagi dengan ${n} untuk mendapatkan bilangan terkecil: ${sum - stepSum} ÷ ${n} = ${start}.`,
  ]

  return {
    body_en: `The sum of ${n} consecutive whole numbers is ${sum}.\n\nFind: What is the smallest of these numbers?`,
    body_id: `Jumlah ${n} bilangan bulat berurutan adalah ${sum}.\n\nCari: Berapakah bilangan terkecil di antara bilangan-bilangan ini?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(start),
    hint_en: `Subtract the step-sum ${stepSum} (which is 0+1+...+${n - 1}) from the total, then divide by ${n}.`,
    hint_id: `Kurangi jumlah langkah ${stepSum} (yaitu 0+1+...+${n - 1}) dari total, lalu bagi dengan ${n}.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildConsecutiveSumBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
