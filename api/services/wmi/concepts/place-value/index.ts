import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildPlaceValueBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  n: z.number().int().min(10).max(99),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'place-value',
  name_en: 'Place value (tens)',
  name_id: 'Nilai tempat (puluhan)',
  grades: [2, 3] as const,
  description_id: 'Cari nilai angka di tempat puluhan.',
} as const

export function generate(rng: Rng): Params {
  return { n: rng.int(10, 99) }
}

// Shared solver so render() and the authored breakdown bind to the same numbers
// (the anti-drift glue). `correct` is the VALUE of the tens digit (digit × 10);
// `tensDigit` is the digit itself — the tempting wrong answer.
//
// Builds exactly 3 DISTINCT distractors (none equal to `correct`, all > 0) so
// the four options never collide — the old [tensDigit, ones, n−correct+1] set
// could repeat (e.g. n=11 → tensDigit === ones, or n=10 → 1,1). The correct
// answer is placed at a slot that varies with n, so it isn't always option A.
export function solvePlaceValue(params: Params) {
  const tensDigit = Math.floor(params.n / 10)
  const ones = params.n % 10
  const correct = tensDigit * 10

  const distractors: number[] = []
  const add = (v: number) => {
    if (v > 0 && v !== correct && !distractors.includes(v) && distractors.length < 3) {
      distractors.push(v)
    }
  }
  add(tensDigit) // the digit itself (value-vs-digit trap)
  add(ones) // the ones digit
  add(ones * 10) // value of the ones digit (place confusion)
  add(params.n) // the whole number
  // Guaranteed top-up with distinct tens neighbours if the above collided.
  for (let d = 1; distractors.length < 3; d++) {
    add(correct + d * 10)
    add(correct - d * 10)
  }

  const labels = ['A', 'B', 'C', 'D'] as const
  const slot = params.n % 4
  const values = [...distractors]
  values.splice(slot, 0, correct) // correct at a per-n slot, distractors around it
  const answerLabel = labels[slot]
  return { tensDigit, ones, correct, labels, values, answerLabel }
}

export function render(params: Params) {
  const { tensDigit, ones, correct, labels, values, answerLabel } = solvePlaceValue(params)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))

  return {
    body_en: `The number ${params.n} has two digits. Find: What is the value of the tens digit?`,
    body_id: `Bilangan ${params.n} memiliki dua angka. Cari: Berapa nilai angka di tempat puluhan?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: `Think about which digit sits in the tens place, then multiply it by 10 to find its value.`,
    hint_id: `Perhatikan angka yang berada di tempat puluhan, lalu kalikan dengan 10 untuk menemukan nilainya.`,
    hint_steps_en: [
      `Write out the place of each digit: ${params.n} = ${tensDigit} tens and ${ones} ones.`,
      `The tens digit is ${tensDigit}.`,
      `Value of the tens digit = ${tensDigit} × 10 = ${correct}.`,
    ],
    hint_steps_id: [
      `Tuliskan nilai tempat setiap angka: ${params.n} = ${tensDigit} puluhan dan ${ones} satuan.`,
      `Angka di tempat puluhan adalah ${tensDigit}.`,
      `Nilai angka puluhan = ${tensDigit} × 10 = ${correct}.`,
    ],
    breakdown: buildPlaceValueBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
