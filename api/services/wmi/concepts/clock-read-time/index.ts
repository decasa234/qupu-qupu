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
  return {
    body_en: 'What time does the clock show?',
    body_id: 'Pukul berapa yang ditunjukkan jam ini?',
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[params.options.indexOf(correct)],
    hint_en: 'The short hand points to the hour; the long hand points to the minutes.',
    hint_id: 'Jarum pendek menunjuk jam; jarum panjang menunjuk menit.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
