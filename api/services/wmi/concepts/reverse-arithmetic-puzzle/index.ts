import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  d: z.number().int().min(2).max(3),
  r: z.number().int().min(1).max(899),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'reverse-arithmetic-puzzle',
  name_en: 'Work backward through arithmetic clues',
  name_id: 'Teka-teki aritmetika terbalik',
  grades: [2, 3] as const,
  description_id: 'Cari sebuah bilangan dari petunjuk terbalik, lalu jumlahkan digitnya.',
} as const

function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((s, c) => s + Number(c), 0)
}

export function generate(rng: Rng): Params {
  const d = rng.pick([2, 3] as const)
  const r = d === 2 ? rng.int(6, 89) : rng.int(20, 799)
  return { d, r }
}

export function render(params: Params) {
  const base = params.d === 2 ? 10 : 100
  const number = base + params.r
  const answer = digitSum(number)
  const wordEN = params.d === 2 ? 'two' : 'three'
  const wordID = params.d === 2 ? 'dua' : 'tiga'
  return {
    body_en: `Subtract the smallest ${wordEN}-digit number from a number, and the result is ${params.r}. Find the sum of the digits of the number.`,
    body_id: `Kurangkan bilangan ${wordID} angka terkecil dari sebuah bilangan, dan hasilnya adalah ${params.r}. Tentukan jumlah digit dari bilangan tersebut.`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: `The smallest ${wordEN}-digit number is ${base}. Add it back to ${params.r} to get the number, then add its digits.`,
    hint_id: `Bilangan ${wordID} angka terkecil adalah ${base}. Tambahkan kembali ke ${params.r} untuk mendapat bilangannya, lalu jumlahkan digitnya.`,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
