import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  a: z.number().int().min(1).max(60),
  b: z.number().int().min(2).max(120),
  d: z.number().int().min(1).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'digit-frequency',
  name_en: 'How often a digit appears',
  name_id: 'Seberapa sering sebuah angka muncul',
  grades: [3] as const,
  description_id: 'Hitung berapa kali sebuah angka muncul saat menulis serangkaian bilangan.',
} as const

export function countDigit(a: number, b: number, d: number): number {
  const target = String(d)
  let count = 0
  for (let n = a; n <= b; n++) {
    for (const ch of String(n)) if (ch === target) count++
  }
  return count
}

export function generate(rng: Rng): Params {
  const a = rng.int(1, 20)
  const b = a + rng.int(15, 40)
  const d = rng.int(1, 9)
  return { a, b, d }
}

export function render(params: Params) {
  return {
    body_en: `When you write all the whole numbers from ${params.a} to ${params.b}, how many times does the digit ${params.d} appear?`,
    body_id: `Ketika kamu menulis semua bilangan bulat dari ${params.a} sampai ${params.b}, berapa kali angka ${params.d} muncul?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(countDigit(params.a, params.b, params.d)),
    hint_en: `Check the ones place and the tens place of each number for a ${params.d}.`,
    hint_id: `Periksa tempat satuan dan tempat puluhan tiap bilangan untuk angka ${params.d}.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
