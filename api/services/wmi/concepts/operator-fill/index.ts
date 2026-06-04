import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const signTriple = z.array(z.enum(['+', '-'])).length(3)
const paramsSchema = z.object({
  nums: z.array(z.number().int().min(2).max(40)).length(4),
  target: z.number().int(),
  options: z.array(signTriple).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'operator-fill',
  name_en: 'Fill in + or − to make the equation true',
  name_id: 'Isi + atau − agar persamaan benar',
  grades: [2, 3] as const,
  description_id: 'Pilih tanda + atau − yang membuat persamaan benar.',
} as const

export function evalSigns(nums: number[], signs: ('+' | '-')[]): number {
  let total = nums[0]
  for (let i = 0; i < signs.length; i++) total = signs[i] === '+' ? total + nums[i + 1] : total - nums[i + 1]
  return total
}

const ALL_PATTERNS: ('+' | '-')[][] = (['+', '-'] as const).flatMap((a) =>
  (['+', '-'] as const).flatMap((b) => (['+', '-'] as const).map((c) => [a, b, c])),
)

export function generate(rng: Rng): Params {
  const nums = [rng.int(3, 25), rng.int(3, 25), rng.int(3, 25), rng.int(3, 25)]
  // pick a sign pattern whose result is non-negative (all-'+' always qualifies)
  const correct = rng.pick(ALL_PATTERNS.filter((p) => evalSigns(nums, p) >= 0))
  const target = evalSigns(nums, correct)
  const distractors = rng
    .shuffle(ALL_PATTERNS.filter((p) => evalSigns(nums, p) !== target))
    .slice(0, 3)
  return { nums, target, options: rng.shuffle([correct, ...distractors]) }
}

export function render(params: Params) {
  const [a, b, c, d] = params.nums
  const labels = ['A', 'B', 'C', 'D'] as const
  const fmt = (s: ('+' | '-')[]) => s.map((x) => (x === '+' ? '+' : '−')).join(', ')
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: fmt(params.options[i]) }))
  const correctIdx = params.options.findIndex((s) => evalSigns(params.nums, s) === params.target)
  return {
    body_en: `Fill in + or − in each box so the equation is true: ${a} □ ${b} □ ${c} □ ${d} = ${params.target}. What signs go in the boxes, from left to right?`,
    body_id: `Isi tanda + atau − pada setiap kotak agar persamaan benar: ${a} □ ${b} □ ${c} □ ${d} = ${params.target}. Tanda apa yang ada di dalam kotak, dari kiri ke kanan?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: 'Try each option left to right and see which one reaches the target.',
    hint_id: 'Coba tiap pilihan dari kiri ke kanan dan lihat mana yang mencapai targetnya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
