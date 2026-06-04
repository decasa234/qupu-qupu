import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z.object({
  lo: z.number().int().min(1).max(99),
  hi: z.number().int().min(2).max(120),
  k: z.number().int().min(1).max(18),
  options: z.array(z.number().int().min(10).max(99)).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'which-might-be',
  name_en: 'Which number fits all the clues',
  name_id: 'Bilangan mana yang memenuhi semua petunjuk',
  grades: [2, 3] as const,
  description_id: 'Pilih bilangan yang memenuhi semua syarat (ganjil, dalam rentang, jumlah digit).',
} as const

function satisfies(n: number, p: { lo: number; hi: number; k: number }): boolean {
  return n % 2 === 1 && n > p.lo && n < p.hi && Math.floor(n / 10) + (n % 10) === p.k
}

export function generate(rng: Rng): Params {
  const tens = rng.int(1, 8)
  const units = rng.pick([1, 3, 5, 7, 9] as const) // odd
  const target = 10 * tens + units
  const k = tens + units
  const lo = target - rng.int(2, 9)
  const hi = target + rng.int(2, 9)
  const used = new Set<number>([target])
  const distractors: number[] = []
  let guard = 0
  while (distractors.length < 3 && guard++ < 400) {
    const n = rng.int(10, 99)
    if (used.has(n) || satisfies(n, { lo, hi, k })) continue
    used.add(n)
    distractors.push(n)
  }
  return { lo, hi, k, options: rng.shuffle([target, ...distractors]) }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: String(params.options[i]) }))
  const correctIdx = params.options.findIndex((n) => satisfies(n, params))
  return {
    body_en: `A lucky number is an odd number between ${params.lo} and ${params.hi}, and the sum of its digits is ${params.k}. Which number below might it be?`,
    body_id: `Sebuah bilangan keberuntungan adalah bilangan ganjil antara ${params.lo} dan ${params.hi}, dan jumlah digitnya ${params.k}. Bilangan manakah di bawah ini yang mungkin?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: 'Check each option against all three clues: odd, in range, and digit sum.',
    hint_id: 'Periksa tiap pilihan terhadap ketiga petunjuk: ganjil, dalam rentang, dan jumlah digit.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
