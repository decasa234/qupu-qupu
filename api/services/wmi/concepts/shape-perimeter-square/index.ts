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
    body_en: `Find: What is the [[perimeter]] of the square shown in the figure, if each side is ${params.side} cm?`,
    body_id: `Cari: Berapa [[perimeter|keliling]] persegi pada gambar, jika setiap sisinya ${params.side} cm?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'Trace all the way around the square — a square has four equal sides, so add the same length four times.',
    hint_id: 'Telusuri seluruh sisi persegi — persegi memiliki empat sisi sama panjang, jadi tambahkan panjang yang sama sebanyak empat kali.',
    hint_steps_en: [
      `The [[perimeter]] is the total distance around the outside of the shape.`,
      `A square has 4 equal sides, and each side measures ${params.side} cm, so: ${params.side} + ${params.side} + ${params.side} + ${params.side} = 4 × ${params.side}.`,
      `4 × ${params.side} = ${correct} cm.`,
    ],
    hint_steps_id: [
      `[[perimeter|Keliling]] adalah jarak total mengelilingi bagian luar bangun.`,
      `Persegi punya 4 sisi sama panjang, dan tiap sisi ${params.side} cm, maka: ${params.side} + ${params.side} + ${params.side} + ${params.side} = 4 × ${params.side}.`,
      `4 × ${params.side} = ${correct} cm.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
