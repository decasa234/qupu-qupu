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
  return {
    body_en: 'Which of these has an odd answer?',
    body_id: 'Penjumlahan manakah yang hasilnya ganjil?',
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: 'A sum is odd only when one number is odd and the other is even.',
    hint_id: 'Jumlah bersifat ganjil hanya jika satu bilangan ganjil dan yang lain genap.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
