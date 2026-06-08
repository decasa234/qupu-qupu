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
export function solvePlaceValue(params: Params) {
  const tensDigit = Math.floor(params.n / 10)
  const ones = params.n % 10
  const correct = tensDigit * 10
  const distractors = [tensDigit, ones, params.n - correct + 1].filter(
    (v) => v !== correct && v > 0,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  const answerLabel = labels[values.indexOf(correct)]
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
