import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

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
  grades: [2, 3] as const,
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

  // Work out the hint steps from params
  const remainder = (n - 1) % cycle          // 0-based index into pattern
  const posInCycle = remainder + 1            // 1-based label position (matches LABELS index visually)
  const answer = labelAt(params)              // e.g. "C"

  return {
    body_en: `${params.cycle} students sit in a circle and call out letters in order: ${seqFull} The sequence repeats from the beginning once all ${cycle} have spoken.\n\nFind: What letter does student number ${n} call out?`,
    body_id: `Sebanyak ${cycle} siswa duduk melingkar dan menyebutkan huruf secara berurutan: ${seqFull} Urutan dimulai dari awal setelah semua ${cycle} siswa selesai berbicara.\n\nCari: Huruf apa yang disebutkan oleh siswa nomor ${n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: labelAt(params),
    hint_en: `Think about the cycle length: after every ${cycle} students the pattern starts over, so use the remainder when you divide the student's number by ${cycle}.`,
    hint_id: `Perhatikan panjang siklusnya: setiap ${cycle} siswa pola dimulai kembali, jadi gunakan sisa pembagian nomor siswa dengan ${cycle}.`,
    hint_steps_en: [
      `The pattern ${seq} repeats every ${cycle} students.`,
      `Shift to a 0-based position: ${n} − 1 = ${n - 1}.`,
      `Divide by the cycle length: ${n - 1} ÷ ${cycle} leaves remainder ${remainder}. (Remainder 0 means the last letter in the cycle, ${LABELS[cycle - 1]}.)`,
      `Count to position ${remainder + 1} in the pattern (${seq}): student ${n} calls out ${answer}.`,
    ],
    hint_steps_id: [
      `Pola ${seq} berulang setiap ${cycle} siswa.`,
      `Geser ke posisi berbasis 0: ${n} − 1 = ${n - 1}.`,
      `Bagi dengan panjang siklus: ${n - 1} ÷ ${cycle} menyisakan ${remainder}. (Sisa 0 berarti huruf terakhir dalam siklus, ${LABELS[cycle - 1]}.)`,
      `Hitung ke posisi ${posInCycle} dalam pola (${seq}): siswa ke-${n} menyebutkan huruf ${answer}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
