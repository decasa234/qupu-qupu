import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

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
      `Start: ${name} has ${start} ${fruit_en} in a basket. ` +
      `Extra: ${name}'s mother puts ${distractor} ${distractor_en} on the table, but not in the basket. ` +
      `Give: In the morning, ${name} gives ${giveMorning} ${fruit_en} to a sibling. ` +
      `Give: At lunch, ${name} gives ${giveLunch} ${fruit_en} to a friend. ` +
      `Find: How many ${fruit_en} are left in the basket?`,
    body_id:
      `Mulai: ${name} punya ${start} ${fruit_id} di dalam keranjang. ` +
      `Tambahan: Ibu ${name} menaruh ${distractor} ${distractor_id} di atas meja, tetapi tidak di keranjang. ` +
      `Beri: Pagi hari, ${name} memberi ${giveMorning} ${fruit_id} kepada adiknya. ` +
      `Beri: Saat makan siang, ${name} memberi ${giveLunch} ${fruit_id} kepada temannya. ` +
      `Cari: Berapa ${fruit_id} yang tersisa di keranjang?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Track only the fruit in the basket. Ignore the extra fruit on the table.',
    hint_id: 'Ikuti hanya buah di dalam keranjang. Abaikan buah tambahan di meja.',
    hint_steps_en: [
      `${name} starts with ${start} ${fruit_en} in the basket.`,
      `Careful: the ${distractor} ${distractor_en} are on the table, not in the basket. Do not count them.`,
      `In the morning ${name} gives ${giveMorning}: ${start} − ${giveMorning} = ${afterMorning}.`,
      `At lunch ${name} gives ${giveLunch} more: ${afterMorning} − ${giveLunch} = ${answer}.`,
      `So ${answer} ${fruit_en} are left in the basket.`,
    ],
    hint_steps_id: [
      `${name} mulai dengan ${start} ${fruit_id} di dalam keranjang.`,
      `Hati-hati: ${distractor} ${distractor_id} ada di meja, bukan di keranjang. Jangan ikut dihitung.`,
      `Pagi hari ${name} memberi ${giveMorning}: ${start} − ${giveMorning} = ${afterMorning}.`,
      `Saat makan siang ${name} memberi ${giveLunch} lagi: ${afterMorning} − ${giveLunch} = ${answer}.`,
      `Jadi tersisa ${answer} ${fruit_id} di dalam keranjang.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
