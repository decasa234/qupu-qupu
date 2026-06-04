import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z.object({
  degrees: z.number().int().min(10).max(170),
})
export type Params = z.infer<typeof paramsSchema>

const CATS = [
  { en: 'Acute', id: 'Lancip' },
  { en: 'Right', id: 'Siku-siku' },
  { en: 'Obtuse', id: 'Tumpul' },
] as const

export const meta = {
  slug: 'angle-type',
  name_en: 'Type of angle',
  name_id: 'Jenis sudut',
  grades: [2, 3] as const,
  description_id: 'Kenali jenis sudut: lancip, siku-siku, atau tumpul.',
} as const

export function categoryIndex(degrees: number): number {
  if (degrees < 90) return 0 // acute
  if (degrees === 90) return 1 // right
  return 2 // obtuse
}

export function generate(rng: Rng): Params {
  const cat = rng.int(0, 2)
  const degrees = cat === 0 ? rng.int(20, 80) : cat === 1 ? 90 : rng.int(100, 160)
  return { degrees }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C'] as const
  const choicesEN: WmiChoice[] = labels.map((label, i) => ({ label, text: CATS[i].en }))
  const choicesID: WmiChoice[] = labels.map((label, i) => ({ label, text: CATS[i].id }))
  return {
    body_en: 'What kind of angle is shown?',
    body_id: 'Sudut jenis apa yang ditunjukkan?',
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: labels[categoryIndex(params.degrees)],
    hint_en: 'A right angle is a square corner (90°); smaller is acute, larger is obtuse.',
    hint_id: 'Sudut siku-siku seperti pojok persegi (90°); lebih kecil itu lancip, lebih besar itu tumpul.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
