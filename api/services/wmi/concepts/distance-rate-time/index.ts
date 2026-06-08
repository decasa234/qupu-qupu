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
    const dist = params.rate * params.t
    return {
      body_en: `A car moves at a constant [[speed|speed]] of ${params.rate} km/h.\nFind: How far does it travel in ${params.t} hours?`,
      body_id: `Sebuah mobil bergerak dengan [[speed|kecepatan]] tetap ${params.rate} km/jam.\nCari: Berapa jarak yang ditempuh dalam ${params.t} jam?`,
      answer_type: 'fill_in' as const,
      choices_en: null,
      choices_id: null,
      answer: String(dist),
      hint_en: 'Apply the [[distance-formula|distance formula]]: distance = speed × time.',
      hint_id: 'Gunakan [[distance-formula|rumus jarak]]: jarak = kecepatan × waktu.',
      hint_steps_en: [
        `Write the formula: distance = speed × time`,
        `Substitute: distance = ${params.rate} × ${params.t}`,
        `Answer: distance = ${dist} km`,
      ],
      hint_steps_id: [
        `Tulis rumus: jarak = kecepatan × waktu`,
        `Substitusi: jarak = ${params.rate} × ${params.t}`,
        `Jawaban: jarak = ${dist} km`,
      ],
    }
  }
  const distance = params.rate * params.t
  return {
    body_en: `A car moves at a constant [[speed|speed]] of ${params.rate} km/h and covers ${distance} km.\nFind: How many hours does the trip take?`,
    body_id: `Sebuah mobil bergerak dengan [[speed|kecepatan]] tetap ${params.rate} km/jam dan menempuh jarak ${distance} km.\nCari: Berapa jam waktu yang dibutuhkan untuk perjalanan itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.t),
    hint_en: 'Rearrange the [[distance-formula|distance formula]]: time = distance ÷ speed.',
    hint_id: 'Ubah [[distance-formula|rumus jarak]]: waktu = jarak ÷ kecepatan.',
    hint_steps_en: [
      `Start with: distance = speed × time`,
      `Rearrange: time = distance ÷ speed`,
      `Substitute: time = ${distance} ÷ ${params.rate}`,
      `Answer: time = ${params.t} hours`,
    ],
    hint_steps_id: [
      `Mulai dari: jarak = kecepatan × waktu`,
      `Ubah: waktu = jarak ÷ kecepatan`,
      `Substitusi: waktu = ${distance} ÷ ${params.rate}`,
      `Jawaban: waktu = ${params.t} jam`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
