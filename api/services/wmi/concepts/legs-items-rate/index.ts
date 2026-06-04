import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

type Animal = { key: string; en: string; en1: string; id: string; legs: number; note: boolean }
const ANIMALS: readonly Animal[] = [
  { key: 'cat', en: 'cats', en1: 'cat', id: 'kucing', legs: 4, note: false },
  { key: 'dog', en: 'dogs', en1: 'dog', id: 'anjing', legs: 4, note: false },
  { key: 'cow', en: 'cows', en1: 'cow', id: 'sapi', legs: 4, note: false },
  { key: 'chicken', en: 'chickens', en1: 'chicken', id: 'ayam', legs: 2, note: false },
  { key: 'duck', en: 'ducks', en1: 'duck', id: 'bebek', legs: 2, note: false },
  { key: 'spider', en: 'spiders', en1: 'spider', id: 'laba-laba', legs: 8, note: true },
  { key: 'ant', en: 'ants', en1: 'ant', id: 'semut', legs: 6, note: true },
] as const
const KEYS = ANIMALS.map((a) => a.key)
const BY_KEY = Object.fromEntries(ANIMALS.map((a) => [a.key, a]))

const paramsSchema = z
  .object({
    kinds: z.array(z.enum(KEYS as [string, ...string[]])).length(3),
    counts: z.array(z.number().int().min(1).max(5)).length(3),
  })
  .refine((v) => new Set(v.kinds).size === 3, { message: 'animal kinds must be distinct' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'legs-items-rate',
  name_en: 'Total legs from a mix of animals',
  name_id: 'Jumlah kaki dari beberapa hewan',
  grades: [2, 3] as const,
  description_id: 'Hitung total kaki dari sejumlah hewan dengan jumlah kaki berbeda.',
} as const

export function generate(rng: Rng): Params {
  const kinds = rng.shuffle(KEYS).slice(0, 3)
  const counts = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)]
  return { kinds, counts }
}

export function render(params: Params) {
  const items = params.kinds.map((k, i) => ({ a: BY_KEY[k] as Animal, n: params.counts[i] }))
  const answer = items.reduce((sum, it) => sum + it.n * it.a.legs, 0)
  const listEN = items.map((it) => `${it.n} ${it.n === 1 ? it.a.en1 : it.a.en}`)
  const listID = items.map((it) => `${it.n} ekor ${it.a.id}`)
  const joinEN = listEN.slice(0, -1).join(', ') + ', and ' + listEN[listEN.length - 1]
  const joinID = listID.slice(0, -1).join(', ') + ', dan ' + listID[listID.length - 1]
  const notesEN = items
    .filter((it) => it.a.note)
    .map((it) => `${/^[aeiou]/i.test(it.a.en1) ? 'An' : 'A'} ${it.a.en1} has ${it.a.legs} legs.`)
    .join(' ')
  const notesID = items.filter((it) => it.a.note).map((it) => `Seekor ${it.a.id} memiliki ${it.a.legs} kaki.`).join(' ')

  return {
    body_en: `How many legs do ${joinEN} have in total?${notesEN ? ' (' + notesEN + ')' : ''}`,
    body_id: `Berapa jumlah kaki dari ${joinID} seluruhnya?${notesID ? ' (' + notesID + ')' : ''}`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Multiply each animal’s count by its number of legs, then add the totals.',
    hint_id: 'Kalikan jumlah tiap hewan dengan banyak kakinya, lalu jumlahkan semuanya.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
