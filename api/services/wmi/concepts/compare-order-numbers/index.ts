import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildCompareOrderNumbersBreakdown } from './breakdown.js'

const paramsSchema = z
  .object({
    x: z.number().int().min(11).max(98),
    y: z.number().int().min(11).max(98),
    z: z.number().int().min(11).max(98),
  })
  .refine((v) => v.x !== v.y && v.y !== v.z && v.x !== v.z, {
    message: 'the three numbers must be distinct',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'compare-order-numbers',
  name_en: 'Compare and order numbers',
  name_id: 'Bandingkan dan urutkan bilangan',
  grades: [1, 2] as const,
  description_id: 'Pilih pernyataan urutan bilangan yang benar.',
} as const

export function generate(rng: Rng): Params {
  const pool = Array.from({ length: 88 }, (_, i) => i + 11)
  const [x, y, z] = rng.shuffle(pool).slice(0, 3)
  return { x, y, z }
}

export function render(params: Params) {
  const [hi, mid, lo] = [params.x, params.y, params.z].sort((a, b) => b - a)
  const correct = `${hi} > ${mid} > ${lo}`
  // Every other "p > q > r" chain over these three values is false.
  const distractors = [`${mid} > ${hi} > ${lo}`, `${hi} > ${lo} > ${mid}`, `${lo} > ${mid} > ${hi}`]
  const labels = ['A', 'B', 'C', 'D'] as const
  // Deterministic, params-dependent position so the answer is not always 'A'.
  const pos = (hi + mid + lo) % 4
  const texts: string[] = []
  let di = 0
  for (let i = 0; i < 4; i++) texts.push(i === pos ? correct : distractors[di++])
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: texts[i] }))

  // hint_steps: work through place-value comparison step by step
  const hiTens = Math.floor(hi / 10)
  const midTens = Math.floor(mid / 10)
  const loTens = Math.floor(lo / 10)

  let step1_en: string
  let step1_id: string
  if (hiTens === midTens && midTens === loTens) {
    // All share the same tens digit — compare ones
    step1_en = `All three numbers have the same tens digit (${hiTens}), so compare the ones digits: ${hi % 10}, ${mid % 10}, and ${lo % 10}.`
    step1_id = `Ketiga bilangan memiliki angka puluhan yang sama (${hiTens}), jadi bandingkan angka satuannya: ${hi % 10}, ${mid % 10}, dan ${lo % 10}.`
  } else {
    step1_en = `Look at the tens digits: ${hi} has ${hiTens} tens, ${mid} has ${midTens} tens, ${lo} has ${loTens} tens.`
    step1_id = `Perhatikan angka puluhannya: ${hi} punya ${hiTens} puluhan, ${mid} punya ${midTens} puluhan, ${lo} punya ${loTens} puluhan.`
  }

  // Step 2: establish the full ordering
  const step2_en = `Order largest to smallest: ${hi} > ${mid} > ${lo}.`
  const step2_id = `Urutan dari terbesar ke terkecil: ${hi} > ${mid} > ${lo}.`

  // Step 3: identify the correct choice
  const step3_en = `Only one chain matches this order — that is the correct statement.`
  const step3_id = `Hanya satu pilihan yang sesuai urutan ini — itulah pernyataan yang benar.`

  return {
    body_en: `Three numbers are shown in each statement below. Find: Which ordering statement is correct?`,
    body_id: `Tiga bilangan ditampilkan dalam setiap pernyataan berikut. Cari: Pernyataan urutan manakah yang benar?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[pos],
    hint_en: `Compare the tens digits first — the number with the larger tens digit is greater; if tens are equal, compare the ones digits.`,
    hint_id: `Bandingkan angka puluhan terlebih dahulu — bilangan dengan puluhan lebih besar bernilai lebih besar; jika puluhannya sama, bandingkan angka satuannya.`,
    hint_steps_en: [step1_en, step2_en, step3_en],
    hint_steps_id: [step1_id, step2_id, step3_id],
    breakdown: buildCompareOrderNumbersBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
