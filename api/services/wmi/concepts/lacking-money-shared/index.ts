import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  nameA: z.string().min(1),
  nameB: z.string().min(1),
  lackA: z.number().int().min(1).max(15),
  lackB: z.number().int().min(1).max(15),
})
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Jessica', 'Cindy', 'Maya', 'Budi', 'Ann', 'Tono'] as const

export const meta = {
  slug: 'lacking-money-shared',
  name_en: 'Each is short some money; together just enough',
  name_id: 'Masing-masing kurang uang; bersama pas',
  grades: [2, 3] as const,
  description_id: 'Dua orang sama-sama kurang uang; bersama pas untuk satu barang.',
} as const

export function generate(rng: Rng): Params {
  const [nameA, nameB] = rng.shuffle(NAMES).slice(0, 2)
  return { nameA, nameB, lackA: rng.int(2, 12), lackB: rng.int(2, 12) }
}

export function render(params: Params) {
  // cake price = lackA + lackB; A's money = price - lackA = lackB.
  const answer = params.lackB
  return {
    body_en: `${params.nameA} and ${params.nameB} want to buy the same cake. ${params.nameA} is short ${params.lackA} dollars, and ${params.nameB} is short ${params.lackB} dollars. If they put their money together it is exactly enough for one cake. How much money does ${params.nameA} have?`,
    body_id: `${params.nameA} dan ${params.nameB} ingin membeli kue yang sama. ${params.nameA} kurang ${params.lackA} dolar, dan ${params.nameB} kurang ${params.lackB} dolar. Jika uang mereka digabung, pas untuk satu kue. Berapa uang yang dimiliki ${params.nameA}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Together they are short (lackA + lackB), which equals one cake — so that is the price.',
    hint_id: 'Bersama mereka kurang (kurangA + kurangB), yang sama dengan satu kue — jadi itulah harganya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
