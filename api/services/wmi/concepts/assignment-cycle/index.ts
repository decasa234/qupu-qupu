import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildAssignmentCycleBreakdown } from './breakdown.js'

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

const paramsSchema = z.object({
  cycle: z.number().int().min(3).max(5),
  n: z.number().int().min(6).max(60),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'assignment-cycle',
  name_en: 'Repeating count-off pattern',
  name_id: 'Pola hitung berulang',
  grades: [1, 2, 3] as const,
  description_id: 'Temukan label ke-n dalam pola yang berulang.',
} as const

export function labelAt(p: Params): string {
  return LABELS[(p.n - 1) % p.cycle]
}

export function generate(rng: Rng): Params {
  const cycle = rng.int(3, 5)
  const n = rng.int(6, 50)
  return { cycle, n }
}

export function render(params: Params) {
  const { cycle, n } = params
  const seq = LABELS.slice(0, cycle).join(', ')
  const seqFull = `${seq}, ${seq}, …`

  // Kid-friendly walkthrough: skip-count the full trips around the circle, then
  // count the leftover students one at a time. No remainders / 0-based shifting.
  const answer = labelAt(params) // e.g. "C"
  const fullTrips = Math.floor(n / cycle)
  const leftover = n - fullTrips * cycle
  const lastFull = fullTrips * cycle
  const lastLetter = LABELS[cycle - 1]

  const mult: number[] = []
  for (let k = 1; k <= fullTrips; k++) mult.push(k * cycle)
  const multiplesStr = fullTrips <= 5 ? mult.join(', ') : `${cycle}, ${2 * cycle}, ${3 * cycle}, …, ${lastFull}`

  const countOn = (arrow: string) => {
    const parts: string[] = []
    for (let i = 1; i <= leftover; i++) parts.push(`${lastFull + i}${arrow}${LABELS[i - 1]}`)
    return parts.join(', ')
  }

  const hint_steps_en =
    leftover === 0
      ? [
          `The letters ${seq} repeat every ${cycle} students.`,
          `Skip-count the full trips: ${multiplesStr}.`,
          `Student ${n} finishes a full trip exactly, on the last letter ${answer}.`,
        ]
      : [
          `The letters ${seq} repeat every ${cycle} students.`,
          `Skip-count the full trips: ${multiplesStr}. Student ${lastFull} lands on ${lastLetter}.`,
          `Count on the leftover: ${countOn(' → ')}. So student ${n} calls out ${answer}.`,
        ]

  const hint_steps_id =
    leftover === 0
      ? [
          `Huruf ${seq} berulang setiap ${cycle} siswa.`,
          `Hitung lompat putaran penuh: ${multiplesStr}.`,
          `Siswa ke-${n} tepat menyelesaikan satu putaran, pada huruf terakhir ${answer}.`,
        ]
      : [
          `Huruf ${seq} berulang setiap ${cycle} siswa.`,
          `Hitung lompat putaran penuh: ${multiplesStr}. Siswa ke-${lastFull} berhenti di ${lastLetter}.`,
          `Lanjut hitung sisanya: ${countOn(' → ')}. Jadi siswa ke-${n} menyebutkan ${answer}.`,
        ]

  return {
    body_en: `${params.cycle} students sit in a circle and call out letters in order: ${seqFull} The sequence repeats from the beginning once all ${cycle} have spoken.\n\nFind: What letter does student number ${n} call out?`,
    body_id: `Sebanyak ${cycle} siswa duduk melingkar dan menyebutkan huruf secara berurutan: ${seqFull} Urutan dimulai dari awal setelah semua ${cycle} siswa selesai berbicara.\n\nCari: Huruf apa yang disebutkan oleh siswa nomor ${n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: labelAt(params),
    hint_en: `The letters repeat every ${cycle} students. Skip-count the full trips around the circle, then count the few leftover students one at a time.`,
    hint_id: `Huruf berulang setiap ${cycle} siswa. Hitung lompat putaran penuh mengelilingi lingkaran, lalu hitung sedikit sisa siswa satu per satu.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildAssignmentCycleBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
