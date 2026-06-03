import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

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

export function render(params: Params) {
  const tensDigit = Math.floor(params.n / 10)
  const ones = params.n % 10
  const correct = tensDigit * 10
  const distractors = [tensDigit, ones, params.n - correct + 1].filter(
    (v) => v !== correct && v > 0,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const answerLabel = labels[values.indexOf(correct)]

  return {
    body_en: `In the number ${params.n}, what is the value of the tens digit?`,
    body_id: `Pada bilangan ${params.n}, berapa nilai angka di tempat puluhan?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'The tens digit is the one on the left in a two-digit number.',
    hint_id: 'Angka puluhan adalah angka di kiri pada bilangan dua angka.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
