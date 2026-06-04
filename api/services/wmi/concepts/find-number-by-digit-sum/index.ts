import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z.object({
  k: z.number().int().min(4).max(15),
  options: z.array(z.number().int().min(10).max(99)).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'find-number-by-digit-sum',
  name_en: 'Find the number with a given digit sum',
  name_id: 'Cari bilangan dengan jumlah digit tertentu',
  grades: [2, 3] as const,
  description_id: 'Pilih bilangan dua angka yang jumlah digitnya sama dengan nilai yang diminta.',
} as const

export function digitSum(n: number): number {
  return Math.floor(n / 10) + (n % 10)
}

function numberWithDigitSum(rng: Rng, k: number): number {
  const tMin = Math.max(1, k - 9)
  const tMax = Math.min(9, k)
  const t = rng.int(tMin, tMax)
  return t * 10 + (k - t)
}

export function generate(rng: Rng): Params {
  const k = rng.int(4, 15)
  const correct = numberWithDigitSum(rng, k)
  const used = new Set<number>([correct])
  const distractors: number[] = []
  let guard = 0
  while (distractors.length < 3 && guard++ < 200) {
    const n = rng.int(10, 99)
    if (used.has(n) || digitSum(n) === k) continue
    used.add(n)
    distractors.push(n)
  }
  return { k, options: rng.shuffle([correct, ...distractors]) }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: String(params.options[i]) }))
  const correctIdx = params.options.findIndex((n) => digitSum(n) === params.k)
  return {
    body_en: `Which number has digits that add up to ${params.k}?`,
    body_id: `Bilangan manakah yang jumlah digitnya ${params.k}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: 'Add the tens digit and the ones digit of each number.',
    hint_id: 'Jumlahkan angka puluhan dan angka satuan dari setiap bilangan.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
