import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { mulberry32 } from '../rng.js'
import { buildCalendarBreakdown } from './breakdown.js'

export const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const

const paramsSchema = z.object({
  startDay: z.number().int().min(0).max(6),
  delta: z.number().int().min(1).max(60),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'calendar-day-reasoning',
  name_en: 'What day will it be?',
  name_id: 'Hari apa nanti?',
  grades: [1, 2, 3] as const,
  description_id: 'Gunakan sisa pembagian 7 untuk mencari hari dalam seminggu.',
} as const

// Index (0=Sunday..6=Saturday) of the day `delta` days after `startDay`.
export function dayIndex(p: Params): number {
  return (p.startDay + p.delta) % 7
}

export function generate(rng: Rng): Params {
  const startDay = rng.int(0, 6)
  let delta = rng.int(1, 60)
  while (delta % 7 === 0) {
    delta = rng.int(1, 60)
  }
  return { startDay, delta }
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const

// The 4 day choices (correct + 3 distractors) and the label of the correct one.
// Deterministic given only `params` (instances are stored and re-rendered), so
// the shuffle is seeded from the params themselves rather than a fresh Rng.
export function buildChoices(params: Params): {
  choices_en: WmiChoice[]
  choices_id: WmiChoice[]
  answerLabel: string
} {
  const correctIdx = dayIndex(params)
  const rng = mulberry32(params.startDay * 61 + params.delta)
  const otherIndices = [0, 1, 2, 3, 4, 5, 6].filter((i) => i !== correctIdx)
  const distractorIndices = rng.shuffle(otherIndices).slice(0, 3)
  const dayIndices = rng.shuffle([correctIdx, ...distractorIndices])

  const choices_en: WmiChoice[] = CHOICE_LABELS.map((label, i) => ({ label, text: DAYS_EN[dayIndices[i]] }))
  const choices_id: WmiChoice[] = CHOICE_LABELS.map((label, i) => ({ label, text: DAYS_ID[dayIndices[i]] }))
  const answerLabel = CHOICE_LABELS[dayIndices.indexOf(correctIdx)]

  return { choices_en, choices_id, answerLabel }
}

export function render(params: Params) {
  const correctIdx = dayIndex(params)
  const { choices_en, choices_id, answerLabel } = buildChoices(params)
  const remainder = params.delta % 7

  return {
    body_en: `Today is ${DAYS_EN[params.startDay]}. What day of the week will it be in ${params.delta} days?`,
    body_id: `Hari ini ${DAYS_ID[params.startDay]}. Hari apa dalam ${params.delta} hari lagi?`,
    answer_type: 'multiple_choice' as const,
    choices_en,
    choices_id,
    answer: answerLabel,
    hint_en: `Divide ${params.delta} by 7 and use the remainder to count forward from ${DAYS_EN[params.startDay]}.`,
    hint_id: `Bagi ${params.delta} dengan 7 lalu pakai sisanya untuk menghitung maju dari ${DAYS_ID[params.startDay]}.`,
    hint_steps_en: [
      `${params.delta} ÷ 7 leaves remainder ${remainder}.`,
      `Count ${remainder} days on from ${DAYS_EN[params.startDay]} → ${DAYS_EN[correctIdx]}.`,
    ],
    hint_steps_id: [
      `${params.delta} ÷ 7 bersisa ${remainder}.`,
      `Hitung maju ${remainder} hari dari ${DAYS_ID[params.startDay]} → ${DAYS_ID[correctIdx]}.`,
    ],
    breakdown: buildCalendarBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
