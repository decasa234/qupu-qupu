import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  mode: z.enum(['distance', 'time']),
  rate: z.number().int().min(2).max(90),
  t: z.number().int().min(1).max(12),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'distance-rate-time',
  name_en: 'Distance, rate, and time',
  name_id: 'Jarak, kecepatan, dan waktu',
  grades: [2, 3] as const,
  description_id: 'Hitung jarak atau waktu dari kecepatan tetap.',
} as const

export function answerValue(p: Params): number {
  return p.mode === 'distance' ? p.rate * p.t : p.t
}

export function generate(rng: Rng): Params {
  return { mode: rng.pick(['distance', 'time'] as const), rate: rng.int(20, 80), t: rng.int(2, 9) }
}

export function render(params: Params) {
  if (params.mode === 'distance') {
    return {
      body_en: `A car travels ${params.rate} km each hour. How far does it travel in ${params.t} hours?`,
      body_id: `Sebuah mobil menempuh ${params.rate} km setiap jam. Berapa jarak yang ditempuh dalam ${params.t} jam?`,
      answer_type: 'fill_in' as const,
      choices_en: null,
      choices_id: null,
      answer: String(params.rate * params.t),
      hint_en: 'Distance = speed × time.',
      hint_id: 'Jarak = kecepatan × waktu.',
    }
  }
  const distance = params.rate * params.t
  return {
    body_en: `A car travels ${params.rate} km each hour. How many hours does it take to travel ${distance} km?`,
    body_id: `Sebuah mobil menempuh ${params.rate} km setiap jam. Berapa jam waktu yang dibutuhkan untuk menempuh ${distance} km?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.t),
    hint_en: 'Time = distance ÷ speed.',
    hint_id: 'Waktu = jarak ÷ kecepatan.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
