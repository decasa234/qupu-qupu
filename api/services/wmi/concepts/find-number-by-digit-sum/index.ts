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
  const correct = params.options[correctIdx]
  const t = Math.floor(correct / 10)
  const u = correct % 10

  return {
    body_en: `Each option is a two-digit number. Find: Which number has a digit sum equal to ${params.k}?`,
    body_id: `Setiap pilihan adalah bilangan dua angka. Cari: Bilangan manakah yang jumlah digitnya sama dengan ${params.k}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: `For each option, split it into its tens digit and ones digit, then add them — you are looking for a sum of ${params.k}.`,
    hint_id: `Untuk setiap pilihan, pisahkan angka puluhan dan angka satuannya, lalu jumlahkan — kamu mencari yang totalnya ${params.k}.`,
    hint_steps_en: [
      `The digit sum of a two-digit number is: tens digit + ones digit.`,
      `Check each option: add its tens digit and ones digit.`,
      `Only ${correct} gives ${t} + ${u} = ${params.k}.`,
      `So the answer is ${correct}.`,
    ],
    hint_steps_id: [
      `Jumlah digit suatu bilangan dua angka adalah: angka puluhan + angka satuan.`,
      `Periksa setiap pilihan: jumlahkan angka puluhan dan angka satuannya.`,
      `Hanya ${correct} yang menghasilkan ${t} + ${u} = ${params.k}.`,
      `Jadi jawabannya adalah ${correct}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
