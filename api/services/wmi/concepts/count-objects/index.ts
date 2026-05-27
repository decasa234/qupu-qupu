import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  n: z.number().int().min(2).max(9),
  kind: z.enum(['apel', 'bola', 'bintang', 'kucing']),
  offset: z.number().int().min(0).max(3),
})
export type Params = z.infer<typeof paramsSchema>

const KIND_EN: Record<Params['kind'], string> = {
  apel: 'apples',
  bola: 'balls',
  bintang: 'stars',
  kucing: 'cats',
}

export const meta = {
  slug: 'count-objects',
  name_en: 'Counting objects',
  name_id: 'Menghitung benda',
  grades: [0] as const,
  description_id: 'Hitung benda yang muncul di gambar.',
} as const

export function generate(rng: Rng): Params {
  return {
    n: rng.int(2, 9),
    kind: rng.pick(['apel', 'bola', 'bintang', 'kucing'] as const),
    offset: rng.int(0, 3),
  }
}

export function render(params: Params) {
  const n = params.n
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [n, n - 1, n + 1, n + 2]
  const valuePool = [...values.slice(params.offset), ...values.slice(0, params.offset)]
  const choicesEN = labels.map((label, i) => ({ label, text: String(valuePool[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(valuePool[i]) }))
  const answerLabel = labels[valuePool.indexOf(n)]

  return {
    body_en: `How many ${KIND_EN[params.kind]} do you see?`,
    body_id: `Ada berapa ${params.kind} yang kamu lihat?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: 'Count one at a time, point at each object.',
    hint_id: 'Hitung satu per satu, tunjuk tiap benda.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
