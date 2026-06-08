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

  const startEN = DIRS[params.start]
  const startID = DIRS_ID[params.start]
  const fi = finalIndex(params)
  const answerEN = DIRS[fi]
  const answerID = DIRS_ID[fi]
  const { turns } = params

  // Build hint_steps: 2–3 plain-text steps tracing the clockwise turns.
  // Reduce turns mod 4 first; if the remainder is 0 the result is the start.
  const net = turns % 4
  let hint_steps_en: string[]
  let hint_steps_id: string[]

  if (turns > 4) {
    const fullCircles = Math.floor(turns / 4)
    if (net === 0) {
      hint_steps_en = [
        `${turns} turns is ${turns} ÷ 4 = ${fullCircles} full circles with 0 turns left over.`,
        `A full circle brings you back to where you started.`,
        `You end up facing ${answerEN}.`,
      ]
      hint_steps_id = [
        `${turns} putaran sama dengan ${turns} ÷ 4 = ${fullCircles} lingkaran penuh, sisa 0 putaran.`,
        `Satu lingkaran penuh kembali ke arah awal.`,
        `Kamu akhirnya menghadap ${answerID}.`,
      ]
    } else {
      const chainEN: string[] = []
      const chainID: string[] = []
      for (let i = 1; i <= net; i++) {
        chainEN.push(DIRS[(params.start + i) % 4])
        chainID.push(DIRS_ID[(params.start + i) % 4])
      }
      hint_steps_en = [
        `${turns} turns is ${fullCircles} full circle${fullCircles > 1 ? 's' : ''} plus ${net} extra turn${net > 1 ? 's' : ''}.`,
        `Starting from ${startEN}, ${net} clockwise turn${net > 1 ? 's' : ''}: ${startEN} → ${chainEN.join(' → ')}.`,
        `You end up facing ${answerEN}.`,
      ]
      hint_steps_id = [
        `${turns} putaran adalah ${fullCircles} lingkaran penuh ditambah ${net} putaran sisa.`,
        `Dari ${startID}, ${net} putaran searah jarum jam: ${startID} → ${chainID.join(' → ')}.`,
        `Kamu akhirnya menghadap ${answerID}.`,
      ]
    }
  } else {
    const chainEN: string[] = []
    const chainID: string[] = []
    for (let i = 1; i <= turns; i++) {
      chainEN.push(DIRS[(params.start + i) % 4])
      chainID.push(DIRS_ID[(params.start + i) % 4])
    }
    hint_steps_en = [
      `Start facing ${startEN} and count ${turns} clockwise turn${turns > 1 ? 's' : ''}: ${startEN} → ${chainEN.join(' → ')}.`,
      `Each turn moves one step in the order North → East → South → West → North.`,
      `You end up facing ${answerEN}.`,
    ]
    hint_steps_id = [
      `Mulai dari ${startID}, hitung ${turns} putaran searah jarum jam: ${startID} → ${chainID.join(' → ')}.`,
      `Setiap putaran maju satu langkah dalam urutan Utara → Timur → Selatan → Barat → Utara.`,
      `Kamu akhirnya menghadap ${answerID}.`,
    ]
  }

  return {
    body_en: `You are facing ${startEN}. You make ${turns} quarter-turn${turns > 1 ? 's' : ''} clockwise (each turn is 90°). Find: Which direction are you facing now?`,
    body_id: `Kamu menghadap ke ${startID}. Kamu berputar ${turns} kali seperempat putaran searah jarum jam (tiap putaran 90°). Cari: Sekarang kamu menghadap ke arah mana?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: LABELS[fi],
    hint_en: `Try stepping through the clockwise order one turn at a time — North, East, South, West — and count off each 90° turn from your starting direction.`,
    hint_id: `Coba ikuti urutan searah jarum jam satu putaran demi satu — Utara, Timur, Selatan, Barat — dan hitung setiap putaran 90° dari arah awalmu.`,
    hint_steps_en,
    hint_steps_id,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
