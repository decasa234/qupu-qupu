import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildVennSetMembershipBreakdown } from './breakdown.js'

const numList = z.array(z.number().int().min(1).max(20))
const paramsSchema = z.object({
  aOnly: numList.min(1).max(3),
  both: numList.min(1).max(2),
  bOnly: numList.min(1).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'venn-set-membership',
  name_en: 'Numbers in a Venn diagram',
  name_id: 'Bilangan dalam diagram Venn',
  grades: [1, 2, 3] as const,
  description_id: 'Jumlahkan bilangan yang berada di dalam A tetapi di luar B.',
} as const

export function answerSum(p: Params): number {
  return p.aOnly.reduce((s, n) => s + n, 0)
}

export function generate(rng: Rng): Params {
  const pool = rng.shuffle(Array.from({ length: 20 }, (_, i) => i + 1))
  const nA = rng.int(2, 3)
  const nBoth = rng.int(1, 2)
  const nB = rng.int(2, 3)
  return {
    aOnly: pool.slice(0, nA),
    both: pool.slice(nA, nA + nBoth),
    bOnly: pool.slice(nA + nBoth, nA + nBoth + nB),
  }
}

export function render(params: Params) {
  const aOnlyList = params.aOnly.join(', ')
  const bothList = params.both.join(', ')
  const bOnlyList = params.bOnly.join(', ')
  const aOnlySum = answerSum(params)

  // Build a running addition string, e.g. "4 + 7 + 14"
  const addStr = params.aOnly.join(' + ')

  return {
    body_en: `A Venn diagram shows two overlapping circles, A and B. Circle A only (not in B) contains: ${aOnlyList}. The overlap (in both A and B) contains: ${bothList}. Circle B only (not in A) contains: ${bOnlyList}.\n\nFind: What is the sum of all numbers that belong to circle A but NOT to circle B?`,
    body_id: `Sebuah diagram Venn menunjukkan dua lingkaran yang saling bertumpang tindih, A dan B. Lingkaran A saja (tidak di B) berisi: ${aOnlyList}. Irisan (di A dan B) berisi: ${bothList}. Lingkaran B saja (tidak di A) berisi: ${bOnlyList}.\n\nCari: Berapa jumlah semua bilangan yang termasuk lingkaran A tetapi TIDAK termasuk lingkaran B?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(aOnlySum),
    hint_en: 'Focus only on the region of A that does not overlap B — the numbers shared with B do not count.',
    hint_id: 'Fokus hanya pada bagian A yang tidak bertumpang tindih dengan B — bilangan yang dimiliki bersama B tidak dihitung.',
    hint_steps_en: [
      `The numbers in A only (not shared with B) are: ${aOnlyList}.`,
      `The overlap numbers (${bothList}) belong to both circles, so they are NOT counted.`,
      `Add the A-only numbers: ${addStr} = ${aOnlySum}.`,
    ],
    hint_steps_id: [
      `Bilangan di bagian A saja (tidak di irisan) adalah: ${aOnlyList}.`,
      `Bilangan irisan (${bothList}) dimiliki oleh kedua lingkaran, jadi TIDAK dihitung.`,
      `Jumlahkan bilangan bagian A saja: ${addStr} = ${aOnlySum}.`,
    ],
    breakdown: buildVennSetMembershipBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
