import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z.object({
  d: z.number().int().min(2).max(12),
  options: z.array(z.number().int().min(10).max(99)).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'divisibility-multiple-property',
  name_en: 'Find the multiple',
  name_id: 'Cari kelipatan',
  grades: [2, 3] as const,
  description_id: 'Pilih bilangan yang merupakan kelipatan dari angka tertentu.',
} as const

export function generate(rng: Rng): Params {
  const d = rng.pick([3, 4, 5, 6, 9] as const)
  // keep the multiple a 2-digit number (>= 10, <= 99) to fit the schema bounds
  const correct = d * rng.int(Math.max(2, Math.ceil(10 / d)), Math.floor(99 / d))
  const used = new Set<number>([correct])
  const options: number[] = []
  let guard = 0
  while (options.length < 3 && guard++ < 300) {
    const n = rng.int(10, 99)
    if (used.has(n) || n % d === 0) continue
    used.add(n)
    options.push(n)
  }
  return { d, options: rng.shuffle([correct, ...options]) }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: String(params.options[i]) }))
  const correctIdx = params.options.findIndex((n) => n % params.d === 0)
  return {
    body_en: `Which number is a multiple of ${params.d}?`,
    body_id: `Bilangan manakah yang merupakan kelipatan ${params.d}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: `A multiple of ${params.d} can be divided by ${params.d} with no remainder.`,
    hint_id: `Kelipatan ${params.d} habis dibagi ${params.d} tanpa sisa.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
