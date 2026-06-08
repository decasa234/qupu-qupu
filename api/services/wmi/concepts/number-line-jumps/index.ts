import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  start: z.number().int().min(0).max(10),
  step: z.number().int().min(2).max(6),
  jumps: z.number().int().min(2).max(6),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'number-line-jumps',
  name_en: 'Jumps on a number line',
  name_id: 'Lompatan pada garis bilangan',
  grades: [1, 2] as const,
  description_id: 'Tentukan bilangan tempat berhenti setelah beberapa lompatan sama besar.',
} as const

export function landing(p: Params): number {
  return p.start + p.step * p.jumps
}

export function generate(rng: Rng): Params {
  return { start: rng.int(0, 8), step: rng.int(2, 5), jumps: rng.int(2, 5) }
}

export function render(params: Params) {
  const { start, step, jumps } = params
  const ans = landing(params)
  const total = step * jumps
  return {
    body_en: `The number line shows a frog starting at ${start}. It makes ${jumps} equal jumps of ${step} to the right. Find: Where does the frog land?`,
    body_id: `Garis bilangan menunjukkan seekor katak mulai di ${start}. Katak melompat ${jumps} kali, setiap lompatan sejauh ${step} ke kanan. Cari: Di bilangan berapa katak berhenti?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(ans),
    hint_en: 'Count all the jumps as one total distance, then add it to the starting number.',
    hint_id: 'Hitung semua lompatan sebagai satu jarak total, lalu tambahkan ke bilangan awal.',
    hint_steps_en: [
      `Each jump moves ${step} to the right.`,
      `${jumps} jumps of ${step} gives a total distance of ${jumps} × ${step} = ${total}.`,
      `Add the total distance to the start: ${start} + ${total} = ${ans}.`,
    ],
    hint_steps_id: [
      `Setiap lompatan bergerak ${step} ke kanan.`,
      `${jumps} lompatan sebesar ${step} menghasilkan jarak total ${jumps} × ${step} = ${total}.`,
      `Tambahkan jarak total ke bilangan awal: ${start} + ${total} = ${ans}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
