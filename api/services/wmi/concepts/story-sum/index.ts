import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildStorySumBreakdown } from './breakdown.js'

const paramsSchema = z
  .object({
    start: z.number().int().min(5).max(12),
    distractor: z.number().int().min(1).max(5),
    giveMorning: z.number().int().min(1).max(4),
    giveLunch: z.number().int().min(1).max(5),
    name: z.string().min(1),
    fruit_en: z.string().min(1),
    fruit_id: z.string().min(1),
    distractor_en: z.string().min(1),
    distractor_id: z.string().min(1),
  })
  .refine((v) => v.start > v.giveMorning + v.giveLunch, {
    message: 'start must be greater than total given away',
  })
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Sari', 'Budi', 'Ani', 'Tono'] as const
const ITEMS = [
  { fruit_en: 'oranges', fruit_id: 'jeruk', distractor_en: 'apples', distractor_id: 'apel' },
  { fruit_en: 'apples', fruit_id: 'apel', distractor_en: 'mangoes', distractor_id: 'mangga' },
  { fruit_en: 'mangoes', fruit_id: 'mangga', distractor_en: 'oranges', distractor_id: 'jeruk' },
] as const

export const meta = {
  slug: 'story-sum',
  name_en: 'Story word problem',
  name_id: 'Soal cerita',
  grades: [1, 2] as const,
  description_id: 'Soal cerita panjang dengan bagian-bagian berwarna dan pengalih perhatian.',
} as const

export function generate(rng: Rng): Params {
  const start = rng.int(6, 12)
  const giveMorning = rng.int(1, Math.min(4, start - 3))
  const giveLunch = rng.int(1, Math.min(5, start - giveMorning - 1))
  const item = rng.pick(ITEMS)
  return {
    start,
    distractor: rng.int(1, 5),
    giveMorning,
    giveLunch,
    name: rng.pick(NAMES),
    ...item,
  }
}

export function render(params: Params) {
  const {
    start,
    distractor,
    giveMorning,
    giveLunch,
    name,
    fruit_en,
    fruit_id,
    distractor_en,
    distractor_id,
  } = params
  const afterMorning = start - giveMorning
  const answer = afterMorning - giveLunch
  return {
    body_en:
      `${name} has ${start} ${fruit_en} in a basket. ` +
      `On the table there are also ${distractor} ${distractor_en}, but those are not in the basket. ` +
      `In the morning ${name} gives ${giveMorning} ${fruit_en} to a sibling, and at lunch gives ${giveLunch} more ${fruit_en} to a friend. ` +
      `Find: How many ${fruit_en} are left in the basket?`,
    body_id:
      `${name} punya ${start} ${fruit_id} di dalam keranjang. ` +
      `Di atas meja ada ${distractor} ${distractor_id}, tetapi ${distractor_id} itu tidak berada di keranjang. ` +
      `Pagi hari ${name} memberi ${giveMorning} ${fruit_id} kepada adiknya, dan saat makan siang memberi ${giveLunch} ${fruit_id} lagi kepada temannya. ` +
      `Cari: Berapa ${fruit_id} yang tersisa di keranjang?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: `Focus only on the ${fruit_en} inside the basket — the ${distractor_en} on the table are a distraction.`,
    hint_id: `Perhatikan hanya ${fruit_id} yang ada di dalam keranjang — ${distractor_id} di meja adalah pengecoh.`,
    hint_steps_en: [
      `${name} starts with ${start} ${fruit_en} in the basket. The ${distractor} ${distractor_en} on the table are not counted.`,
      `Morning: ${name} gives away ${giveMorning} ${fruit_en}, so ${start} − ${giveMorning} = ${afterMorning} remain.`,
      `Lunch: ${name} gives away ${giveLunch} more, so ${afterMorning} − ${giveLunch} = ${answer} remain.`,
      `Answer: ${answer} ${fruit_en} are left in the basket.`,
    ],
    hint_steps_id: [
      `${name} mulai dengan ${start} ${fruit_id} di keranjang. ${distractor} ${distractor_id} di meja tidak dihitung.`,
      `Pagi: ${name} memberi ${giveMorning} ${fruit_id}, sehingga ${start} − ${giveMorning} = ${afterMorning} tersisa.`,
      `Makan siang: ${name} memberi ${giveLunch} lagi, sehingga ${afterMorning} − ${giveLunch} = ${answer} tersisa.`,
      `Jawaban: ${answer} ${fruit_id} tersisa di dalam keranjang.`,
    ],
    breakdown: buildStorySumBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
