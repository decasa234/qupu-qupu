import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildContainerBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  total: z.number().int().min(20).max(200),
  capacity: z.number().int().min(3).max(20),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'container-capacity-allocation',
  name_en: 'How many containers are needed?',
  name_id: 'Berapa wadah yang diperlukan?',
  grades: [2, 3] as const,
  description_id: 'Bagi jumlah benda dengan kapasitas, lalu bulatkan ke atas karena sisa tetap perlu satu wadah.',
} as const

// The minimum number of containers needed to hold `total` items at `capacity`
// per container — the CEILING of total / capacity (contrast with
// make-groups-leftover, which asks for the FLOOR's remainder instead).
export function boxesNeeded(p: Params): number {
  return Math.ceil(p.total / p.capacity)
}

export function generate(rng: Rng): Params {
  let total: number
  let capacity: number
  do {
    capacity = rng.int(3, 20)
    total = rng.int(20, 200)
  } while (total % capacity === 0)
  return { total, capacity }
}

export function render(params: Params) {
  const { total, capacity } = params
  const answer = boxesNeeded(params)
  const floor = Math.floor(total / capacity)
  const remainder = total % capacity

  const hint_steps_en = [
    `${total} ÷ ${capacity} = ${floor} remainder ${remainder}.`,
    `The leftover ${remainder} still needs one more box, so ${floor} + 1 = ${answer}.`,
  ]
  const hint_steps_id = [
    `${total} ÷ ${capacity} = ${floor} sisa ${remainder}.`,
    `Sisa ${remainder} tetap butuh satu wadah lagi, jadi ${floor} + 1 = ${answer}.`,
  ]

  return {
    body_en: `There are ${total} eggs to pack. Each box holds ${capacity} eggs.\n\nFind: How many boxes are needed so that every egg is packed?`,
    body_id: `Ada ${total} telur yang akan dikemas. Setiap kotak memuat ${capacity} telur.\n\nCari: Berapa kotak yang diperlukan agar semua telur terkemas?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Divide the total by the capacity, then round up so the leftover items still get a box.',
    hint_id: 'Bagi jumlah total dengan kapasitas, lalu bulatkan ke atas agar sisa benda tetap punya wadah.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildContainerBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
