import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildTallyMarksCountBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  n: z.number().int().min(3).max(34),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'tally-marks-count',
  name_en: 'Read tally marks',
  name_id: 'Membaca turus',
  grades: [1, 2] as const,
  description_id: 'Hitung turus (tally) dan tentukan bilangannya.',
} as const

export function generate(rng: Rng): Params {
  return { n: rng.int(7, 29) }
}

export function render(params: Params) {
  const { n } = params
  const fullGroups = Math.floor(n / 5)
  const leftover = n % 5

  // hint steps —  count-by-5s method
  const groupTotal = fullGroups * 5
  const hint_steps_en: string[] = []
  const hint_steps_id: string[] = []

  if (fullGroups > 0 && leftover > 0) {
    hint_steps_en.push(
      `Count the complete groups: ${fullGroups} group${fullGroups > 1 ? 's' : ''} of 5 = ${groupTotal}.`,
    )
    hint_steps_id.push(
      `Hitung kelompok utuh: ${fullGroups} kelompok × 5 = ${groupTotal}.`,
    )
    hint_steps_en.push(
      `Count the leftover marks: ${leftover} extra mark${leftover > 1 ? 's' : ''}.`,
    )
    hint_steps_id.push(
      `Hitung turus sisa: ${leftover} turus${leftover > 1 ? '' : ''} lebih.`,
    )
    hint_steps_en.push(`Add them: ${groupTotal} + ${leftover} = ${n}.`)
    hint_steps_id.push(`Jumlahkan: ${groupTotal} + ${leftover} = ${n}.`)
  } else if (fullGroups > 0 && leftover === 0) {
    hint_steps_en.push(
      `Count the complete groups: ${fullGroups} group${fullGroups > 1 ? 's' : ''} of 5 = ${groupTotal}.`,
    )
    hint_steps_id.push(
      `Hitung kelompok utuh: ${fullGroups} kelompok × 5 = ${groupTotal}.`,
    )
    hint_steps_en.push(`There are no leftover marks.`)
    hint_steps_id.push(`Tidak ada turus sisa.`)
    hint_steps_en.push(`The total is ${n}.`)
    hint_steps_id.push(`Jumlah seluruhnya adalah ${n}.`)
  } else {
    // n < 5: no full groups
    hint_steps_en.push(`There are no complete groups of 5.`)
    hint_steps_id.push(`Tidak ada kelompok utuh dengan 5 turus.`)
    hint_steps_en.push(`Count the marks one by one: ${n} mark${n > 1 ? 's' : ''}.`)
    hint_steps_id.push(`Hitung turus satu per satu: ${n} turus.`)
    hint_steps_en.push(`The total is ${n}.`)
    hint_steps_id.push(`Jumlah seluruhnya adalah ${n}.`)
  }

  return {
    body_en: `Tally marks are shown. Find: What number do the tally marks show?`,
    body_id: `Tanda turus ditampilkan. Cari: Bilangan berapa yang ditunjukkan oleh tanda turus itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(n),
    hint_en: `Each full group of tally marks — four vertical marks crossed by a diagonal — equals 5. Count the groups of 5, then add any leftover marks.`,
    hint_id: `Setiap kelompok turus utuh — empat turus tegak disilang satu garis miring — bernilai 5. Hitung kelompok yang bernilai 5, lalu tambahkan turus yang tersisa.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildTallyMarksCountBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
