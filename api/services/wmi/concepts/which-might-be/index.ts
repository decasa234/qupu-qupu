import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildWhichMightBeBreakdown } from './breakdown.js'

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
  const answerLabel = labels[correctIdx]
  const answerVal = params.options[correctIdx]
  const ds = (n: number) => `${Math.floor(n / 10)} + ${n % 10} = ${Math.floor(n / 10) + (n % 10)}`

  // Build hint steps: check each option in A–D order, mark pass/fail per clue
  const stepLines_en: string[] = []
  const stepLines_id: string[] = []
  for (let i = 0; i < 4; i++) {
    const n = params.options[i]
    const lbl = labels[i]
    const isOdd = n % 2 === 1
    const inRange = n > params.lo && n < params.hi
    const digitOk = Math.floor(n / 10) + (n % 10) === params.k
    if (isOdd && inRange && digitOk) {
      stepLines_en.push(
        `${lbl}. ${n}: odd ✓, between ${params.lo} and ${params.hi} ✓, digit sum ${ds(n)} ✓ — fits all three clues.`
      )
      stepLines_id.push(
        `${lbl}. ${n}: ganjil ✓, antara ${params.lo} dan ${params.hi} ✓, jumlah digit ${ds(n)} ✓ — memenuhi semua petunjuk.`
      )
    } else {
      const fails_en: string[] = []
      const fails_id: string[] = []
      if (!isOdd) { fails_en.push('not odd'); fails_id.push('bukan ganjil') }
      if (!inRange) { fails_en.push(`not between ${params.lo} and ${params.hi}`); fails_id.push(`tidak antara ${params.lo} dan ${params.hi}`) }
      if (!digitOk) { fails_en.push(`digit sum ${ds(n)} ≠ ${params.k}`); fails_id.push(`jumlah digit ${ds(n)} ≠ ${params.k}`) }
      stepLines_en.push(`${lbl}. ${n}: ${fails_en.join(', ')} ✗`)
      stepLines_id.push(`${lbl}. ${n}: ${fails_id.join(', ')} ✗`)
    }
  }
  stepLines_en.push(`Answer: ${answerLabel} (${answerVal}) is the only number that satisfies all three clues.`)
  stepLines_id.push(`Jawaban: ${answerLabel} (${answerVal}) adalah satu-satunya bilangan yang memenuhi semua petunjuk.`)

  return {
    body_en: [
      `Clue: A mystery number is odd, greater than ${params.lo} and less than ${params.hi}, and the sum of its digits equals ${params.k}.`,
      `Find: Which of the following could be the mystery number?`,
    ].join('\n'),
    body_id: [
      `Petunjuk: Sebuah bilangan misterius adalah bilangan ganjil, lebih dari ${params.lo} dan kurang dari ${params.hi}, dan jumlah digitnya sama dengan ${params.k}.`,
      `Cari: Manakah bilangan berikut yang mungkin merupakan bilangan misterius tersebut?`,
    ].join('\n'),
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: answerLabel,
    hint_en: `Try each option in turn — check whether it is odd, falls strictly between ${params.lo} and ${params.hi}, and has a digit sum of ${params.k}.`,
    hint_id: `Coba setiap pilihan satu per satu — periksa apakah bilangannya ganjil, terletak ketat di antara ${params.lo} dan ${params.hi}, dan jumlah digitnya ${params.k}.`,
    hint_steps_en: stepLines_en,
    hint_steps_id: stepLines_id,
    breakdown: buildWhichMightBeBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
