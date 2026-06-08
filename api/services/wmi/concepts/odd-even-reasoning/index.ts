import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const pairSchema = z.object({ x: z.number().int().min(1).max(40), y: z.number().int().min(1).max(40) })
const paramsSchema = z.object({ options: z.array(pairSchema).length(4) })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'odd-even-reasoning',
  name_en: 'Which sum is odd',
  name_id: 'Penjumlahan mana yang ganjil',
  grades: [2, 3] as const,
  description_id: 'Pilih penjumlahan yang hasilnya ganjil.',
} as const

const oddIn = (rng: Rng, lo: number, hi: number) => {
  const v = rng.int(lo, hi)
  return v % 2 === 0 ? v + 1 : v
}
const evenIn = (rng: Rng, lo: number, hi: number) => {
  const v = rng.int(lo, hi)
  return v % 2 === 0 ? v : v + 1
}

export function generate(rng: Rng): Params {
  // exactly one pair has an odd sum (different parity); the other three are even.
  const odd = { x: oddIn(rng, 1, 39), y: evenIn(rng, 2, 40) }
  const evens: { x: number; y: number }[] = []
  for (let i = 0; i < 3; i++) {
    if (rng.int(0, 1) === 0) evens.push({ x: oddIn(rng, 1, 39), y: oddIn(rng, 1, 39) })
    else evens.push({ x: evenIn(rng, 2, 40), y: evenIn(rng, 2, 40) })
  }
  return { options: rng.shuffle([odd, ...evens]) }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices: WmiChoice[] = labels.map((label, i) => ({
    label,
    text: `${params.options[i].x} + ${params.options[i].y}`,
  }))
  const correctIdx = params.options.findIndex((p) => (p.x + p.y) % 2 === 1)
  const { x, y } = params.options[correctIdx]
  const parityOf = (n: number) => (n % 2 === 1 ? 'odd' : 'even')
  const paritasDari = (n: number) => (n % 2 === 1 ? 'ganjil' : 'genap')
  return {
    body_en: `Four addition expressions are shown below. Find: Which expression gives an odd answer?`,
    body_id: `Empat ekspresi penjumlahan ditampilkan di bawah ini. Cari: Ekspresi mana yang hasilnya ganjil?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: `Check the parity of each addend — a sum is odd only when one addend is odd and the other is even.`,
    hint_id: `Periksa paritas setiap suku — hasil penjumlahan ganjil hanya jika satu suku ganjil dan satu suku genap.`,
    hint_steps_en: [
      `Rule: odd + even = odd; odd + odd = even; even + even = even.`,
      `Check each option by looking at whether each addend ends in an odd or even digit.`,
      `Option ${labels[correctIdx]}: ${x} is ${parityOf(x)} and ${y} is ${parityOf(y)}, so ${x} + ${y} is odd.`,
      `The other three options each have two addends of the same parity, giving an even sum.`,
    ],
    hint_steps_id: [
      `Aturan: ganjil + genap = ganjil; ganjil + ganjil = genap; genap + genap = genap.`,
      `Periksa setiap pilihan dengan melihat apakah setiap suku berakhir dengan angka ganjil atau genap.`,
      `Pilihan ${labels[correctIdx]}: ${x} bersifat ${paritasDari(x)} dan ${y} bersifat ${paritasDari(y)}, sehingga ${x} + ${y} hasilnya ganjil.`,
      `Ketiga pilihan lainnya memiliki dua suku dengan paritas yang sama, sehingga hasilnya genap.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
