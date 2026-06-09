import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildOperatorFillBreakdown } from './breakdown.js'

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
  const answerLabel = labels[correctIdx]
  const correct = params.options[correctIdx]

  // Build sign-step string: "a s1 b s2 c s3 d = result"
  const showExpr = (s: ('+' | '-')[]) => {
    const [s1, s2, s3] = s.map((x) => (x === '+' ? '+' : '−'))
    return `${a} ${s1} ${b} ${s2} ${c} ${s3} ${d}`
  }

  // hint_steps: check each option, mark hit vs miss, conclude
  const steps_en: string[] = []
  const steps_id: string[] = []
  const hitLabel = answerLabel

  for (let i = 0; i < 4; i++) {
    const lbl = labels[i]
    const s = params.options[i]
    const result = evalSigns(params.nums, s)
    const expr = showExpr(s)
    if (lbl === hitLabel) {
      steps_en.push(`Option ${lbl}: ${expr} = ${result} — this equals ${params.target}, so option ${lbl} works.`)
      steps_id.push(`Pilihan ${lbl}: ${expr} = ${result} — sama dengan ${params.target}, jadi pilihan ${lbl} benar.`)
    } else {
      steps_en.push(`Option ${lbl}: ${expr} = ${result}, not ${params.target}.`)
      steps_id.push(`Pilihan ${lbl}: ${expr} = ${result}, bukan ${params.target}.`)
    }
  }

  // Remove steps for wrong options that come AFTER the correct one (keep only up to and including the answer)
  const keepUpTo = correctIdx + 1
  const trimmed_en = steps_en.slice(0, keepUpTo)
  const trimmed_id = steps_id.slice(0, keepUpTo)

  // Always include at least the wrong options before it so there is context, then add a closing step
  const [s1, s2, s3] = correct.map((x) => (x === '+' ? '+' : '−'))
  trimmed_en.push(`The signs from left to right are ${s1}, ${s2}, ${s3}.`)
  trimmed_id.push(`Tanda dari kiri ke kanan adalah ${s1}, ${s2}, ${s3}.`)

  return {
    body_en: `${a} □ ${b} □ ${c} □ ${d} = ${params.target}\nFind: Which set of signs (+, −), placed left to right in the boxes, makes the equation true?`,
    body_id: `${a} □ ${b} □ ${c} □ ${d} = ${params.target}\nCari: Pilihan tanda (+, −) mana yang, ditempatkan dari kiri ke kanan, membuat persamaan benar?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: answerLabel,
    hint_en: 'Substitute each option\'s signs into the equation and check whether the result equals the target.',
    hint_id: 'Substitusikan tanda dari setiap pilihan ke dalam persamaan dan periksa apakah hasilnya sama dengan target.',
    hint_steps_en: trimmed_en,
    hint_steps_id: trimmed_id,
    breakdown: buildOperatorFillBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
