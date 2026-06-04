import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    cost: z.number().int().min(5).max(95),
    pay: z.number().int().min(6).max(150),
    name: z.string().min(1),
    item_en: z.string().min(1),
    item_id: z.string().min(1),
  })
  .refine((v) => v.pay > v.cost, { message: 'pay must exceed cost' })
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Sari', 'Budi', 'Ani', 'Tono', 'Maya'] as const
const ITEMS = [
  { item_en: 'book', item_id: 'buku' },
  { item_en: 'toy', item_id: 'mainan' },
  { item_en: 'cake', item_id: 'kue' },
  { item_en: 'pencil', item_id: 'pensil' },
  { item_en: 'ball', item_id: 'bola' },
] as const

export const meta = {
  slug: 'money-shopping-change',
  name_en: 'Shopping change',
  name_id: 'Kembalian belanja',
  grades: [2, 3] as const,
  description_id: 'Hitung uang kembalian setelah membeli sebuah barang.',
} as const

export function generate(rng: Rng): Params {
  const cost = rng.int(5, 95)
  const pay = cost + rng.int(2, 40)
  const item = rng.pick(ITEMS)
  return { cost, pay, name: rng.pick(NAMES), ...item }
}

export function render(params: Params) {
  const change = params.pay - params.cost
  return {
    body_en: `${params.name} buys a ${params.item_en} that costs ${params.cost} dollars and pays with ${params.pay} dollars. How much change does ${params.name} get?`,
    body_id: `${params.name} membeli sebuah ${params.item_id} seharga ${params.cost} dolar dan membayar dengan ${params.pay} dolar. Berapa kembalian yang ${params.name} terima?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(change),
    hint_en: 'Change is the money paid minus the price.',
    hint_id: 'Kembalian adalah uang yang dibayar dikurangi harga.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
