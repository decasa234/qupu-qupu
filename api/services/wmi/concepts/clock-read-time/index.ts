import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z.object({
  hour: z.number().int().min(1).max(12),
  minute: z.number().int().min(0).max(59),
  options: z.array(z.string()).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'clock-read-time',
  name_en: 'Read the clock',
  name_id: 'Membaca jam',
  grades: [1, 2, 3] as const,
  description_id: 'Baca jam analog dan pilih waktu yang ditunjukkan.',
} as const

export function fmt(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, '0')}`
}

export function generate(rng: Rng): Params {
  const hour = rng.int(1, 12)
  const minute = rng.pick([0, 15, 30, 45] as const)
  const correct = fmt(hour, minute)
  const pool = new Set<string>()
  for (const dh of [1, 2, 10, 11]) pool.add(fmt(((hour - 1 + dh) % 12) + 1, minute))
  for (const q of [0, 15, 30, 45]) if (q !== minute) pool.add(fmt(hour, q))
  pool.delete(correct)
  const distractors = rng.shuffle([...pool]).slice(0, 3)
  return { hour, minute, options: rng.shuffle([correct, ...distractors]) }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: params.options[i] }))
  const correct = fmt(params.hour, params.minute)
  const minuteWord_en = params.minute === 0 ? 'exactly on the hour' : `at ${params.minute} minutes past`
  const hourWord_id = params.hour.toString()
  const minuteWord_id =
    params.minute === 0
      ? 'tepat'
      : `${params.minute} menit`
  return {
    body_en: `The clock above shows a time.\n\nFind: What time does the [[analog-clock|analog clock]] show?`,
    body_id: `Jam di atas menunjukkan suatu waktu.\n\nCari: Pukul berapa yang ditunjukkan [[analog-clock|jam analog]] tersebut?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[params.options.indexOf(correct)],
    hint_en: `Look at the two hands separately: the short hand tells you the hour, and the long hand tells you the minutes.`,
    hint_id: `Perhatikan kedua jarum secara terpisah: jarum pendek menunjukkan jam, dan jarum panjang menunjukkan menit.`,
    hint_steps_en: [
      `Look at the short (hour) hand — it points to ${params.hour}, so the hour is ${params.hour}.`,
      `Look at the long (minute) hand — it points to the ${minuteWord_en}, so the minutes are ${params.minute === 0 ? '00' : params.minute}.`,
      `Combine them: the time shown is ${correct}.`,
    ],
    hint_steps_id: [
      `Perhatikan jarum pendek (jam) — jarum ini menunjuk ke angka ${hourWord_id}, jadi jamnya adalah ${hourWord_id}.`,
      `Perhatikan jarum panjang (menit) — jarum ini menunjukkan ${minuteWord_id}, jadi menitnya adalah ${params.minute === 0 ? '00' : params.minute}.`,
      `Gabungkan keduanya: waktu yang ditunjukkan adalah pukul ${correct}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
