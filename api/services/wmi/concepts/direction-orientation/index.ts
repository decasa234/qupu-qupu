import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const DIRS = ['North', 'East', 'South', 'West'] as const
const DIRS_ID = ['Utara', 'Timur', 'Selatan', 'Barat'] as const
const LABELS = ['A', 'B', 'C', 'D'] as const

const paramsSchema = z.object({
  start: z.number().int().min(0).max(3), // index into DIRS
  turns: z.number().int().min(1).max(7),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'direction-orientation',
  name_en: 'Direction after turning',
  name_id: 'Arah setelah berputar',
  grades: [2, 3] as const,
  description_id: 'Tentukan arah hadap setelah beberapa putaran seperempat searah jarum jam.',
} as const

export function finalIndex(p: Params): number {
  return (p.start + p.turns) % 4
}

export function generate(rng: Rng): Params {
  return { start: rng.int(0, 3), turns: rng.int(1, 7) }
}

export function render(params: Params) {
  // Options are the four compass directions in fixed order, so the answer
  // label is language-neutral (A–D) while each language shows its own words.
  const choicesEN: WmiChoice[] = LABELS.map((label, i) => ({ label, text: DIRS[i] }))
  const choicesID: WmiChoice[] = LABELS.map((label, i) => ({ label, text: DIRS_ID[i] }))
  return {
    body_en: `You are facing ${DIRS[params.start]}. You make ${params.turns} quarter-turn(s) clockwise (each turn is 90°). Which direction are you facing now?`,
    body_id: `Kamu menghadap ke ${DIRS_ID[params.start]}. Kamu berputar ${params.turns} kali seperempat putaran searah jarum jam (tiap putaran 90°). Sekarang kamu menghadap ke arah mana?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: LABELS[finalIndex(params)],
    hint_en: 'Clockwise order is North → East → South → West. Four turns bring you back.',
    hint_id: 'Urutan searah jarum jam: Utara → Timur → Selatan → Barat. Empat putaran kembali ke awal.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
