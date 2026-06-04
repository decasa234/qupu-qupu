import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

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
  grades: [2, 3] as const,
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
  return {
    body_en: 'In the diagram, circle A and circle B overlap. Find the sum of the numbers that are inside A but NOT inside B.',
    body_id: 'Dalam diagram, lingkaran A dan lingkaran B saling tumpang tindih. Cari jumlah bilangan yang berada di dalam A tetapi TIDAK di dalam B.',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answerSum(params)),
    hint_en: 'Use only the numbers in the part of A that does not overlap B.',
    hint_id: 'Gunakan hanya bilangan di bagian A yang tidak bertumpang tindih dengan B.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
