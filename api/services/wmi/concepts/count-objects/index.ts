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
  grades: [1] as const,
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
    body_en: `The figure shows a group of ${KIND_EN[params.kind]}. Find: How many ${KIND_EN[params.kind]} are there in all?`,
    body_id: `Gambar menunjukkan sekumpulan ${params.kind}. Cari: Ada berapa ${params.kind} seluruhnya?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en: `Count the ${KIND_EN[params.kind]} carefully — try counting them in small groups.`,
    hint_id: `Hitung ${params.kind} dengan teliti — coba hitung dalam kelompok kecil.`,
    hint_steps_en: [
      `Point to each ${KIND_EN[params.kind].slice(0, -1)} and count aloud: 1, 2, 3, …`,
      `Group them in twos or threes to avoid losing your place.`,
      `Add the groups together. The total is ${n}.`,
    ],
    hint_steps_id: [
      `Tunjuk setiap ${params.kind} dan hitung keras-keras: 1, 2, 3, …`,
      `Kelompokkan dua atau tiga sekaligus agar tidak terlewat.`,
      `Jumlahkan semua kelompok. Totalnya adalah ${n}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
