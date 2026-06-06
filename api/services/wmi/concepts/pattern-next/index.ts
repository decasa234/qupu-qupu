import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  start: z.number().int().min(1).max(9),
  step: z.number().int().min(1).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'pattern-next',
  name_en: 'Next in pattern',
  name_id: 'Pola berikutnya',
  grades: [1, 2] as const,
  description_id: 'Tebak angka berikutnya dalam sebuah pola.',
} as const

export function generate(rng: Rng): Params {
  return { start: rng.int(1, 9), step: rng.int(1, 3) }
}

export function render(params: Params) {
  const seq = [0, 1, 2].map((i) => params.start + i * params.step)
  const correct = params.start + 3 * params.step
  // Distractors: correct ± 1, correct + step+1
  const distractors = [correct - 1, correct + 1, correct + params.step + 1].filter(
    (v) => v !== correct && v > 0,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const answerLabel = labels[values.indexOf(correct)]
  const seqText = seq.join(', ')

  return {
    body_en: `${seqText}, ?\n\nFind: What number comes next in the sequence?`,
    body_id: `${seqText}, ?\n\nCari: Angka berapa yang muncul berikutnya dalam barisan ini?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: `Find the rule by looking at the difference between each pair of consecutive terms.`,
    hint_id: `Temukan aturannya dengan melihat selisih antara setiap dua suku yang berurutan.`,
    hint_steps_en: [
      `The sequence starts at ${params.start}.`,
      `Each term increases by ${params.step}: ${seq[0]} → ${seq[1]} → ${seq[2]}.`,
      `Add ${params.step} to the last term: ${seq[2]} + ${params.step} = ${correct}.`,
    ],
    hint_steps_id: [
      `Barisan dimulai dari ${params.start}.`,
      `Setiap suku bertambah ${params.step}: ${seq[0]} → ${seq[1]} → ${seq[2]}.`,
      `Tambahkan ${params.step} ke suku terakhir: ${seq[2]} + ${params.step} = ${correct}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
