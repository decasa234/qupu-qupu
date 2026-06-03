import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  side: z.number().int().min(2).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'shape-perimeter-square',
  name_en: 'Perimeter of a square',
  name_id: 'Keliling persegi',
  grades: [2, 3] as const,
  description_id: 'Hitung keliling persegi dari panjang sisinya.',
} as const

export function generate(rng: Rng): Params {
  return { side: rng.int(2, 9) }
}

export function render(params: Params) {
  const correct = params.side * 4
  const distractors = [correct - 1, correct + 1, params.side * 2].filter(
    (v) => v > 0 && v !== correct,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 2)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const answerLabel = labels[values.indexOf(correct)]

  return {
    body_en: `What is the [[perimeter]] of a square with side ${params.side}?`,
    body_id: `Berapa [[perimeter|keliling]] dari persegi dengan sisi ${params.side}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'Add up all four sides.',
    hint_id: 'Jumlahkan keempat sisi.',
    hint_steps_en: [
      'Perimeter means the distance around the outside.',
      `A square has 4 equal sides, and each side is ${params.side}.`,
      `${params.side} + ${params.side} + ${params.side} + ${params.side} = ${correct}.`,
    ],
    hint_steps_id: [
      'Keliling artinya jarak mengelilingi bagian luar bentuk.',
      `Persegi punya 4 sisi sama panjang, dan tiap sisi ${params.side}.`,
      `${params.side} + ${params.side} + ${params.side} + ${params.side} = ${correct}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
