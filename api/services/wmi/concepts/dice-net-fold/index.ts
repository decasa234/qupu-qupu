import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

type Cell = [number, number]
const cell = z.tuple([z.number().int(), z.number().int()])
const paramsSchema = z.object({
  nets: z.array(z.array(cell)).length(4),
  validIndex: z.number().int().min(0).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'dice-net-fold',
  name_en: 'Which net folds into a cube',
  name_id: 'Jaring-jaring mana yang membentuk kubus',
  grades: [2, 3] as const,
  description_id: 'Pilih jaring-jaring yang dapat dilipat menjadi sebuah kubus.',
} as const

// 1-4-1 nets (a row of four + one square above + one below) always fold to a
// cube, regardless of which columns the tabs sit on.
const VALID: Cell[][] = [
  [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [2, 2]],
  [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [3, 2]],
  [[0, 1], [1, 1], [2, 1], [3, 1], [2, 0], [0, 2]],
]
// Each invalid net either is 1×6 / 2×3 or contains a 2×2 block — none fold.
const INVALID: Cell[][] = [
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], // 2×3 rectangle
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], // 1×6 line
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]], // 2×2 block + tail
  [[0, 1], [1, 0], [1, 1], [2, 1], [1, 2], [2, 2]], // contains a 2×2 block
]

export function generate(rng: Rng): Params {
  const valid = rng.pick(VALID)
  const invalid = rng.shuffle(INVALID).slice(0, 3)
  const all = [valid, ...invalid]
  const order = rng.shuffle([0, 1, 2, 3])
  const nets = order.map((i) => all[i])
  const validIndex = order.indexOf(0)
  return { nets, validIndex }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices = labels.map((label) => ({ label, text: label }))
  return {
    body_en: 'Which of these nets (A, B, C, or D) can be folded into a cube?',
    body_id: 'Jaring-jaring manakah (A, B, C, atau D) yang dapat dilipat menjadi sebuah kubus?',
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[params.validIndex],
    hint_en: 'A cube net has 6 squares with no 2×2 block, and folds without overlap.',
    hint_id: 'Jaring kubus punya 6 persegi tanpa blok 2×2, dan terlipat tanpa bertumpuk.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
