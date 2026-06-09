import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildTruthOrderCluesBreakdown } from './breakdown.js'

const NAMES = ['Amy', 'Ben', 'Cody', 'Dina', 'Evan'] as const

const paramsSchema = z.object({
  order: z.array(z.enum(NAMES)).length(5),
  // A permutation of [0,1,2,3] giving the (scrambled) order the clues are shown in.
  clueOrder: z.array(z.number().int().min(0).max(3)).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'truth-order-clues',
  name_en: 'Order from clues',
  name_id: 'Urutan dari petunjuk',
  grades: [2, 3] as const,
  description_id: 'Sambungkan petunjuk posisi yang teracak untuk menentukan siapa yang pertama.',
} as const

export function answer(p: Params): string {
  return p.order[0]
}

// The consecutive "X is before Y" clues, presented in the scrambled clueOrder.
export function shownClues(p: Params): [string, string][] {
  const consecutive = p.order.slice(0, -1).map((name, i) => [name, p.order[i + 1]] as [string, string])
  return p.clueOrder.map((i) => consecutive[i])
}

export function generate(rng: Rng): Params {
  const order = rng.shuffle([...NAMES])
  let clueOrder = rng.shuffle([0, 1, 2, 3])
  // Never present the clues already in chain order — that would give it away.
  for (let g = 0; g < 12 && clueOrder.every((v, i) => v === i); g++) {
    clueOrder = rng.shuffle([0, 1, 2, 3])
  }
  return { order, clueOrder }
}

export function render(p: Params) {
  const clues = shownClues(p)
  const cluesEn = clues.map(([a, b]) => `${a} is before ${b}.`).join(' ')
  const cluesId = clues.map(([a, b]) => `${a} berada sebelum ${b}.`).join(' ')
  const first = answer(p)
  const chain = p.order.join(' → ')

  return {
    body_en: `${cluesEn}\nFind: Who is first?`,
    body_id: `${cluesId}\nCari: Siapa yang pertama?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: first,
    hint_en: 'Link the clues end to end into one line, then read who is at the front.',
    hint_id: 'Sambungkan petunjuk menjadi satu barisan, lalu lihat siapa yang paling depan.',
    hint_steps_en: [
      `Join the clues into one line: ${chain}.`,
      `${first} is at the front, so ${first} is first.`,
    ],
    hint_steps_id: [
      `Sambungkan petunjuk menjadi satu barisan: ${chain}.`,
      `${first} paling depan, jadi ${first} yang pertama.`,
    ],
    breakdown: buildTruthOrderCluesBreakdown(p),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
