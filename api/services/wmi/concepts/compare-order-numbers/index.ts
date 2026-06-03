import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z
  .object({
    x: z.number().int().min(11).max(98),
    y: z.number().int().min(11).max(98),
    z: z.number().int().min(11).max(98),
  })
  .refine((v) => v.x !== v.y && v.y !== v.z && v.x !== v.z, {
    message: 'the three numbers must be distinct',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'compare-order-numbers',
  name_en: 'Compare and order numbers',
  name_id: 'Bandingkan dan urutkan bilangan',
  grades: [1, 2] as const,
  description_id: 'Pilih pernyataan urutan bilangan yang benar.',
} as const

export function generate(rng: Rng): Params {
  const pool = Array.from({ length: 88 }, (_, i) => i + 11)
  const [x, y, z] = rng.shuffle(pool).slice(0, 3)
  return { x, y, z }
}

export function render(params: Params) {
  const [hi, mid, lo] = [params.x, params.y, params.z].sort((a, b) => b - a)
  const correct = `${hi} > ${mid} > ${lo}`
  // Every other "p > q > r" chain over these three values is false.
  const distractors = [`${mid} > ${hi} > ${lo}`, `${hi} > ${lo} > ${mid}`, `${lo} > ${mid} > ${hi}`]
  const labels = ['A', 'B', 'C', 'D'] as const
  // Deterministic, params-dependent position so the answer is not always 'A'.
  const pos = (hi + mid + lo) % 4
  const texts: string[] = []
  let di = 0
  for (let i = 0; i < 4; i++) texts.push(i === pos ? correct : distractors[di++])
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: texts[i] }))

  return {
    body_en: 'Which statement is correct?',
    body_id: 'Pernyataan manakah yang benar?',
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[pos],
    hint_en: 'A “>” chain is true only when each number is bigger than the next. Order them largest to smallest.',
    hint_id: 'Rantai “>” benar hanya jika setiap bilangan lebih besar dari berikutnya. Urutkan dari terbesar ke terkecil.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
