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
  const jamWord = params.addHour === 1 ? 'jam' : 'jam'

  // Compute intermediate carry values for hint_steps
  const rawMin = params.minute + params.addMin
  const carryHour = rawMin >= 60 ? 1 : 0
  const resultMin = rawMin % 60
  const rawHour = params.hour + params.addHour + carryHour
  const wrappedHour = rawHour > 12 ? rawHour - 12 : rawHour

  // EN hint steps
  const minStep_en = carryHour === 1
    ? `Add the minutes: ${params.minute} + ${params.addMin} = ${rawMin}. That is more than 60, so carry 1 hour and keep ${rawMin} − 60 = ${resultMin} minutes.`
    : `Add the minutes: ${params.minute} + ${params.addMin} = ${resultMin}. No carry needed.`
  const hourStep_en = rawHour > 12
    ? `Add the hours: ${params.hour} + ${params.addHour}${carryHour ? ' + 1 carried' : ''} = ${rawHour}. Past 12, so ${rawHour} − 12 = ${wrappedHour}.`
    : `Add the hours: ${params.hour} + ${params.addHour}${carryHour ? ' + 1 carried' : ''} = ${wrappedHour}.`

  // ID hint steps
  const minStep_id = carryHour === 1
    ? `Tambahkan menitnya: ${params.minute} + ${params.addMin} = ${rawMin}. Lebih dari 60, jadi simpan 1 jam dan sisa menit = ${rawMin} − 60 = ${resultMin}.`
    : `Tambahkan menitnya: ${params.minute} + ${params.addMin} = ${resultMin}. Tidak perlu simpanan.`
  const hourStep_id = rawHour > 12
    ? `Tambahkan jamnya: ${params.hour} + ${params.addHour}${carryHour ? ' + 1 simpanan' : ''} = ${rawHour}. Melewati 12, jadi ${rawHour} − 12 = ${wrappedHour}.`
    : `Tambahkan jamnya: ${params.hour} + ${params.addHour}${carryHour ? ' + 1 simpanan' : ''} = ${wrappedHour}.`

  return {
    body_en: `A clock shows ${fmtTime(params.hour, params.minute)}. It is now ${params.addHour} ${hWord} and ${params.addMin} minutes later.\n\nFind: What time does the clock show now?`,
    body_id: `Sebuah jam menunjukkan ${fmtTime(params.hour, params.minute)}. Sekarang sudah ${params.addHour} ${jamWord} dan ${params.addMin} menit berlalu.\n\nCari: Pukul berapa jam itu sekarang?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: fmtTime(r.hour, r.minute),
    hint_en: 'Add the minutes first, carrying into the next hour when the total reaches 60; then add the hours, wrapping back to 1 after 12.',
    hint_id: 'Tambahkan menitnya lebih dulu; jika totalnya mencapai 60, naikan satu jam dan ambil sisanya; lalu tambahkan jamnya dan mulai dari 1 lagi setelah 12.',
    hint_steps_en: [
      minStep_en,
      hourStep_en,
      `The later time is ${fmtTime(r.hour, r.minute)}.`,
    ],
    hint_steps_id: [
      minStep_id,
      hourStep_id,
      `Waktu yang dicari adalah pukul ${fmtTime(r.hour, r.minute)}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
