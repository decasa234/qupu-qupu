import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  hour: z.number().int().min(1).max(12),
  add: z.number().int().min(1).max(11),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'clock-time-after',
  name_en: 'Time after a whole-hour interval',
  name_id: 'Waktu setelah selang jam bulat',
  grades: [1, 2, 3] as const,
  description_id: 'Tentukan jam yang ditunjuk setelah beberapa jam berlalu.',
} as const

export function generate(rng: Rng): Params {
  return { hour: rng.int(1, 12), add: rng.int(1, 11) }
}

export function render(params: Params) {
  const result = ((params.hour - 1 + params.add) % 12) + 1
  const hourWord = params.add === 1 ? 'hour' : 'hours'
  return {
    body_en: `A clock shows ${params.hour} o'clock. What hour will it show ${params.add} ${hourWord} later? (Answer 1–12.)`,
    body_id: `Sebuah jam menunjukkan pukul ${params.hour}. Pukul berapa ${params.add} jam kemudian? (Jawab 1–12.)`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(result),
    hint_en: 'Add the hours, and if you pass 12 keep counting from 1.',
    hint_id: 'Tambahkan jamnya; jika melewati angka 12, lanjutkan menghitung dari 1.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
