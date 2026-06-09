import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildReverseArithmeticPuzzleBreakdown } from './breakdown.js'

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
    body_en: `Clue: A number minus the smallest ${wordEN}-digit number equals ${params.r}. Find: What is the sum of the digits of that number?`,
    body_id: `Petunjuk: Sebuah bilangan dikurangi bilangan ${wordID} angka terkecil hasilnya ${params.r}. Cari: Berapa jumlah digit bilangan tersebut?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: `Undo the subtraction — add the smallest ${wordEN}-digit number back to ${params.r} to find the mystery number, then add its digits.`,
    hint_id: `Balikkan pengurangannya — tambahkan bilangan ${wordID} angka terkecil ke ${params.r} untuk menemukan bilangannya, lalu jumlahkan digitnya.`,
    hint_steps_en: [
      `The smallest ${wordEN}-digit number is ${base}.`,
      `Work backward: ${params.r} + ${base} = ${number}.`,
      `Add the digits of ${number}: ${String(number).split('').join(' + ')} = ${answer}.`,
    ],
    hint_steps_id: [
      `Bilangan ${wordID} angka terkecil adalah ${base}.`,
      `Balik langkahnya: ${params.r} + ${base} = ${number}.`,
      `Jumlahkan digit ${number}: ${String(number).split('').join(' + ')} = ${answer}.`,
    ],
    breakdown: buildReverseArithmeticPuzzleBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
