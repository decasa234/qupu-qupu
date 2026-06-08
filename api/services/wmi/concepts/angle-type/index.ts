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
  const cat = categoryIndex(params.degrees)
  const catEN = CATS[cat].en
  const catID = CATS[cat].id

  return {
    body_en: 'Find: What [[angle-type|type]] of angle is shown in the figure?',
    body_id: 'Cari: Apa [[angle-type|jenis]] sudut yang ditunjukkan pada gambar?',
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: labels[cat],
    hint_en: 'Compare the angle to a square corner — that square corner is exactly 90°.',
    hint_id: 'Bandingkan sudut itu dengan pojok persegi — pojok persegi tepat 90°.',
    hint_steps_en: [
      'Look at the angle in the figure and imagine a square corner (90°) next to it.',
      params.degrees < 90
        ? 'The angle opens less than a square corner, so it is smaller than 90°.'
        : params.degrees === 90
          ? 'The angle matches a square corner exactly — it is 90°.'
          : 'The angle opens more than a square corner, so it is larger than 90°.',
      params.degrees < 90
        ? 'An angle smaller than 90° is called acute.'
        : params.degrees === 90
          ? 'An angle of exactly 90° is called a right angle.'
          : 'An angle larger than 90° (but less than 180°) is called obtuse.',
      `The angle shown is ${catEN}.`,
    ],
    hint_steps_id: [
      'Perhatikan sudut pada gambar, lalu bayangkan pojok persegi (90°) di sebelahnya.',
      params.degrees < 90
        ? 'Sudut itu terbuka lebih sempit dari pojok persegi, jadi ukurannya kurang dari 90°.'
        : params.degrees === 90
          ? 'Sudut itu persis sama dengan pojok persegi — ukurannya tepat 90°.'
          : 'Sudut itu terbuka lebih lebar dari pojok persegi, jadi ukurannya lebih dari 90°.',
      params.degrees < 90
        ? 'Sudut yang lebih kecil dari 90° disebut sudut lancip.'
        : params.degrees === 90
          ? 'Sudut yang tepat 90° disebut sudut siku-siku.'
          : 'Sudut yang lebih besar dari 90° (tetapi kurang dari 180°) disebut sudut tumpul.',
      `Sudut yang ditunjukkan adalah sudut ${catID}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
