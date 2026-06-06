import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const KINDS = [
  'equilateral-triangle',
  'isosceles-triangle',
  'rectangle',
  'square',
  'regular-pentagon',
  'regular-hexagon',
] as const

const LINES: Record<(typeof KINDS)[number], number> = {
  'equilateral-triangle': 3,
  'isosceles-triangle': 1,
  rectangle: 2,
  square: 4,
  'regular-pentagon': 5,
  'regular-hexagon': 6,
}

const paramsSchema = z.object({ kind: z.enum(KINDS) })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'symmetry-count',
  name_en: 'Lines of symmetry',
  name_id: 'Garis simetri',
  grades: [2, 3] as const,
  description_id: 'Hitung banyak garis simetri pada sebuah bangun.',
} as const

export function linesOfSymmetry(p: Params): number {
  return LINES[p.kind]
}

export function generate(rng: Rng): Params {
  return { kind: rng.pick(KINDS) }
}

const SHAPE_LABEL_EN: Record<(typeof KINDS)[number], string> = {
  'equilateral-triangle': 'equilateral triangle',
  'isosceles-triangle': 'isosceles triangle',
  rectangle: 'rectangle',
  square: 'square',
  'regular-pentagon': 'regular pentagon',
  'regular-hexagon': 'regular hexagon',
}

const SHAPE_LABEL_ID: Record<(typeof KINDS)[number], string> = {
  'equilateral-triangle': 'segitiga sama sisi',
  'isosceles-triangle': 'segitiga sama kaki',
  rectangle: 'persegi panjang',
  square: 'persegi',
  'regular-pentagon': 'segi lima beraturan',
  'regular-hexagon': 'segi enam beraturan',
}

const STEPS_EN: Record<(typeof KINDS)[number], string[]> = {
  'equilateral-triangle': [
    'A line of symmetry folds the shape so both halves match perfectly. Try to find every fold line.',
    'An equilateral triangle has 3 equal sides. Each line of symmetry runs from one vertex straight down to the midpoint of the opposite side.',
    'There are 3 such lines, so the answer is 3.',
  ],
  'isosceles-triangle': [
    'A line of symmetry folds the shape so both halves match perfectly. Try to find every fold line.',
    'An isosceles triangle has exactly 2 equal sides. Only one fold line works: the line from the apex (top vertex) straight down to the midpoint of the base.',
    'There is 1 line of symmetry, so the answer is 1.',
  ],
  rectangle: [
    'A line of symmetry folds the shape so both halves match perfectly. Try to find every fold line.',
    'A rectangle has 2 pairs of equal sides. You can fold it in half along the midpoint of the long sides, or along the midpoint of the short sides — but not corner to corner.',
    'There are 2 lines of symmetry, so the answer is 2.',
  ],
  square: [
    'A line of symmetry folds the shape so both halves match perfectly. Try to find every fold line.',
    'A square has 4 equal sides and 4 right angles. You can fold it along the midpoint of opposite sides (2 ways) and along both diagonals (2 ways).',
    'There are 4 lines of symmetry, so the answer is 4.',
  ],
  'regular-pentagon': [
    'A line of symmetry folds the shape so both halves match perfectly. Try to find every fold line.',
    'A regular pentagon has 5 equal sides and 5 equal angles. Each line of symmetry runs from one vertex to the midpoint of the opposite side.',
    'There are 5 such lines, so the answer is 5.',
  ],
  'regular-hexagon': [
    'A line of symmetry folds the shape so both halves match perfectly. Try to find every fold line.',
    'A regular hexagon has 6 equal sides. Three lines connect opposite vertices, and three lines connect midpoints of opposite sides.',
    'There are 6 lines of symmetry, so the answer is 6.',
  ],
}

const STEPS_ID: Record<(typeof KINDS)[number], string[]> = {
  'equilateral-triangle': [
    'Garis simetri melipat bangun sehingga kedua bagian cocok sempurna. Coba temukan setiap garis lipatnya.',
    'Segitiga sama sisi memiliki 3 sisi yang sama panjang. Setiap garis simetri berjalan dari satu sudut lurus menuju titik tengah sisi di hadapannya.',
    'Ada 3 garis seperti itu, jadi jawabannya adalah 3.',
  ],
  'isosceles-triangle': [
    'Garis simetri melipat bangun sehingga kedua bagian cocok sempurna. Coba temukan setiap garis lipatnya.',
    'Segitiga sama kaki memiliki tepat 2 sisi yang sama panjang. Hanya satu garis lipat yang berhasil: garis dari puncak (sudut atas) lurus ke titik tengah alas.',
    'Ada 1 garis simetri, jadi jawabannya adalah 1.',
  ],
  rectangle: [
    'Garis simetri melipat bangun sehingga kedua bagian cocok sempurna. Coba temukan setiap garis lipatnya.',
    'Persegi panjang memiliki 2 pasang sisi yang sama panjang. Kamu bisa melipatnya melalui titik tengah sisi panjang, atau melalui titik tengah sisi pendek — tetapi tidak dari sudut ke sudut.',
    'Ada 2 garis simetri, jadi jawabannya adalah 2.',
  ],
  square: [
    'Garis simetri melipat bangun sehingga kedua bagian cocok sempurna. Coba temukan setiap garis lipatnya.',
    'Persegi memiliki 4 sisi sama panjang dan 4 sudut siku-siku. Kamu bisa melipatnya melalui titik tengah sisi-sisi yang berhadapan (2 cara) dan melalui kedua diagonalnya (2 cara).',
    'Ada 4 garis simetri, jadi jawabannya adalah 4.',
  ],
  'regular-pentagon': [
    'Garis simetri melipat bangun sehingga kedua bagian cocok sempurna. Coba temukan setiap garis lipatnya.',
    'Segi lima beraturan memiliki 5 sisi dan 5 sudut yang sama besar. Setiap garis simetri berjalan dari satu sudut menuju titik tengah sisi di hadapannya.',
    'Ada 5 garis seperti itu, jadi jawabannya adalah 5.',
  ],
  'regular-hexagon': [
    'Garis simetri melipat bangun sehingga kedua bagian cocok sempurna. Coba temukan setiap garis lipatnya.',
    'Segi enam beraturan memiliki 6 sisi yang sama panjang. Tiga garis menghubungkan sudut-sudut yang berhadapan, dan tiga garis menghubungkan titik tengah sisi-sisi yang berhadapan.',
    'Ada 6 garis simetri, jadi jawabannya adalah 6.',
  ],
}

export function render(params: Params) {
  const count = linesOfSymmetry(params)
  const shapeEn = SHAPE_LABEL_EN[params.kind]
  const shapeId = SHAPE_LABEL_ID[params.kind]
  return {
    body_en: `Look at the figure showing a ${shapeEn}. Find: How many lines of symmetry does this shape have?`,
    body_id: `Perhatikan gambar yang menunjukkan sebuah ${shapeId}. Cari: Ada berapa garis simetri pada bangun ini?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(count),
    hint_en: 'A line of symmetry folds the shape onto itself so both halves match exactly.',
    hint_id: 'Garis simetri melipat bangun sehingga kedua bagiannya saling menutupi dengan tepat.',
    hint_steps_en: STEPS_EN[params.kind],
    hint_steps_id: STEPS_ID[params.kind],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
