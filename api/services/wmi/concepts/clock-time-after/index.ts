import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  hour: z.number().int().min(1).max(12),
  minute: z.number().int().min(0).max(59),
  addHour: z.number().int().min(1).max(5),
  addMin: z.number().int().min(1).max(59),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'clock-time-after',
  name_en: 'Time after hours and minutes',
  name_id: 'Waktu setelah jam dan menit',
  grades: [2, 3] as const,
  description_id: 'Tentukan waktu yang ditunjuk setelah beberapa jam dan menit berlalu.',
} as const

export function fmtTime(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, '0')}`
}

export function resultTime(p: Params): { hour: number; minute: number } {
  const start = (p.hour % 12) * 60 + p.minute
  const total = (start + p.addHour * 60 + p.addMin) % 720 // 12 hours = 720 minutes
  const h12 = Math.floor(total / 60)
  return { hour: h12 === 0 ? 12 : h12, minute: total % 60 }
}

export function generate(rng: Rng): Params {
  const hour = rng.int(1, 12)
  const minute = rng.pick([0, 15, 30, 45] as const)
  const addHour = rng.int(1, 5)
  const addMin = rng.pick([15, 30, 45] as const)
  return { hour, minute, addHour, addMin }
}

export function render(params: Params) {
  const r = resultTime(params)
  const hWord = params.addHour === 1 ? 'hour' : 'hours'
  return {
    body_en: `A clock shows ${fmtTime(params.hour, params.minute)}. What time will it show ${params.addHour} ${hWord} and ${params.addMin} minutes later? (Answer like 3:15.)`,
    body_id: `Sebuah jam menunjukkan ${fmtTime(params.hour, params.minute)}. Pukul berapa ${params.addHour} jam dan ${params.addMin} menit kemudian? (Jawab seperti 3:15.)`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: fmtTime(r.hour, r.minute),
    hint_en: 'Add the minutes first (carry into the next hour if you pass 60), then add the hours; past 12 keep counting from 1.',
    hint_id: 'Tambahkan menitnya dulu (jika melewati 60, naik satu jam), lalu tambahkan jamnya; jika melewati 12 hitung lagi dari 1.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
