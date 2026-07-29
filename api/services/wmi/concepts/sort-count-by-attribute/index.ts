import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildSortCountByAttributeBreakdown } from './breakdown.js'

// The most common grade-1 WMI figure task: a jumbled picture of objects that
// differ along ONE attribute. The child sorts them into groups, counts each
// group, then answers a question about the counts. Everything countable lives in
// the illustration — the stem only names the sorting rule and the question.

export const ATTRIBUTES = ['shape', 'colour', 'fruit'] as const
export type Attribute = (typeof ATTRIBUTES)[number]

export const LAYOUTS = ['scatter', 'grid', 'rows'] as const
export type Layout = (typeof LAYOUTS)[number]

export const ASKS = ['count-one', 'most', 'difference', 'how-many-kinds'] as const
export type Ask = (typeof ASKS)[number]

/** The biggest pile a grade-1 child can still count reliably. */
export const MAX_TOTAL = 30

export interface CategoryDef {
  key: string
  /** Indonesian name used inside the question, e.g. "lingkaran", "balon merah". */
  label_id: string
  label_en: string
  plural_en: string
}

export const CATEGORY_POOLS: Record<Attribute, readonly CategoryDef[]> = {
  shape: [
    { key: 'circle', label_id: 'lingkaran', label_en: 'circle', plural_en: 'circles' },
    { key: 'triangle', label_id: 'segitiga', label_en: 'triangle', plural_en: 'triangles' },
    { key: 'square', label_id: 'persegi', label_en: 'square', plural_en: 'squares' },
    { key: 'star', label_id: 'bintang', label_en: 'star', plural_en: 'stars' },
  ],
  colour: [
    { key: 'red', label_id: 'balon merah', label_en: 'red balloon', plural_en: 'red balloons' },
    { key: 'blue', label_id: 'balon biru', label_en: 'blue balloon', plural_en: 'blue balloons' },
    { key: 'orange', label_id: 'balon oranye', label_en: 'orange balloon', plural_en: 'orange balloons' },
    { key: 'green', label_id: 'balon hijau', label_en: 'green balloon', plural_en: 'green balloons' },
    { key: 'yellow', label_id: 'balon kuning', label_en: 'yellow balloon', plural_en: 'yellow balloons' },
  ],
  fruit: [
    { key: 'apple', label_id: 'apel', label_en: 'apple', plural_en: 'apples' },
    { key: 'banana', label_id: 'pisang', label_en: 'banana', plural_en: 'bananas' },
    { key: 'orange', label_id: 'jeruk', label_en: 'orange', plural_en: 'oranges' },
    { key: 'grape', label_id: 'anggur', label_en: 'grape', plural_en: 'grapes' },
  ],
}

interface Scene {
  /** Capitalised Indonesian plural that opens the second sentence. */
  plural_id: string
  plural_en: string
  most_id: string
  most_en: string
  kinds_id: string
  kinds_en: string
}

export const SCENES: Record<Attribute, Scene> = {
  shape: {
    plural_id: 'Bentuk-bentuk',
    plural_en: 'shapes',
    most_id: 'Bentuk apa yang paling banyak?',
    most_en: 'Which shape is there the most of?',
    kinds_id: 'Ada berapa jenis bentuk yang berbeda?',
    kinds_en: 'How many different kinds of shape are there?',
  },
  colour: {
    plural_id: 'Balon-balon',
    plural_en: 'balloons',
    most_id: 'Balon warna apa yang paling banyak?',
    most_en: 'Which balloon colour is there the most of?',
    kinds_id: 'Ada berapa warna balon yang berbeda?',
    kinds_en: 'How many different balloon colours are there?',
  },
  fruit: {
    plural_id: 'Buah-buah',
    plural_en: 'fruits',
    most_id: 'Buah apa yang paling banyak?',
    most_en: 'Which fruit is there the most of?',
    kinds_id: 'Ada berapa jenis buah yang berbeda?',
    kinds_en: 'How many different kinds of fruit are there?',
  },
}

const paramsSchema = z.object({
  attribute: z.enum(ATTRIBUTES),
  categories: z.array(z.string().min(1)).min(3).max(4),
  counts: z.array(z.number().int().min(3).max(12)).min(3).max(4),
  layout: z.enum(LAYOUTS),
  ask: z.enum(ASKS),
  /** [target] for count-one, [bigger, smaller] for difference, [] otherwise. */
  askIndices: z.array(z.number().int().min(0).max(3)).max(2),
  /** Drives the deterministic jitter/mixing of the figure only. */
  seed: z.number().int().min(0).max(999),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'sort-count-by-attribute',
  name_en: 'Sort and count by attribute',
  name_id: 'Kelompokkan lalu hitung',
  grades: [1] as const,
  description_id: 'Kelompokkan benda menurut satu ciri, hitung tiap kelompok, lalu jawab pertanyaannya.',
} as const

const LABELS = ['A', 'B', 'C', 'D'] as const

// --- derived values ---------------------------------------------------------
// One place computes every string and number, so render() and the breakdown can
// never drift apart (highlight phrases MUST stay substrings of the body).

export interface Derived {
  scene: Scene
  cats: CategoryDef[]
  counts: number[]
  total: number
  kinds: number
  winner: number
  runnerUp: number
  q_id: string
  q_en: string
  body_id: string
  body_en: string
  answer: string
  answer_type: 'fill_in' | 'multiple_choice'
  choices_id: WmiChoice[] | null
  choices_en: WmiChoice[] | null
  factPhrase_id: string
  factPhrase_en: string
  rulePhrase_id: string
  rulePhrase_en: string
}

export function derive(params: Params): Derived {
  const scene = SCENES[params.attribute]
  const pool = CATEGORY_POOLS[params.attribute]
  const cats = params.categories.map((key) => pool.find((c) => c.key === key) ?? pool[0])
  const counts = params.counts
  const total = counts.reduce((a, b) => a + b, 0)
  const kinds = cats.length

  const order = counts.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v || a.i - b.i)
  const winner = order[0].i
  const runnerUp = order[1].i

  const factPhrase_id = `${scene.plural_id} itu tercampur menjadi satu`
  const factPhrase_en = `${scene.plural_en} are all mixed together`
  const rulePhrase_id = 'Kelompokkan yang sama, lalu hitung tiap kelompok'
  const rulePhrase_en = 'Sort the same ones together, then count each group'

  let q_id: string
  let q_en: string
  let answer: string
  let answer_type: 'fill_in' | 'multiple_choice' = 'fill_in'
  let choices_id: WmiChoice[] | null = null
  let choices_en: WmiChoice[] | null = null

  if (params.ask === 'count-one') {
    const t = params.askIndices[0] ?? 0
    q_id = `Berapa banyak ${cats[t].label_id}?`
    q_en = `How many ${cats[t].plural_en} are there?`
    answer = String(counts[t])
  } else if (params.ask === 'most') {
    q_id = scene.most_id
    q_en = scene.most_en
    answer_type = 'multiple_choice'
    choices_id = cats.map((c, i) => ({ label: LABELS[i], text: c.label_id }))
    choices_en = cats.map((c, i) => ({ label: LABELS[i], text: c.label_en }))
    answer = LABELS[winner]
  } else if (params.ask === 'difference') {
    const a = params.askIndices[0] ?? 0
    const b = params.askIndices[1] ?? 1
    q_id = `Berapa lebih banyak ${cats[a].label_id} daripada ${cats[b].label_id}?`
    q_en = `How many more ${cats[a].plural_en} are there than ${cats[b].plural_en}?`
    answer = String(counts[a] - counts[b])
  } else {
    q_id = scene.kinds_id
    q_en = scene.kinds_en
    answer = String(kinds)
  }

  const body_id = `Perhatikan gambar di atas. ${factPhrase_id}.\n\n${rulePhrase_id}.\n\nCari: ${q_id}`
  const body_en = `Look at the picture above. The ${factPhrase_en}.\n\n${rulePhrase_en}.\n\nFind: ${q_en}`

  return {
    scene,
    cats,
    counts,
    total,
    kinds,
    winner,
    runnerUp,
    q_id,
    q_en,
    body_id,
    body_en,
    answer,
    answer_type,
    choices_id,
    choices_en,
    factPhrase_id,
    factPhrase_en,
    rulePhrase_id,
    rulePhrase_en,
  }
}

// --- generation -------------------------------------------------------------

/** Each group 3..12, whole pile never above MAX_TOTAL. */
function drawCounts(rng: Rng, k: number): number[] {
  const out: number[] = []
  let remaining = MAX_TOTAL
  for (let i = 0; i < k; i++) {
    const slotsLeft = k - i - 1
    const maxHere = Math.min(12, remaining - slotsLeft * 3)
    const c = rng.int(3, Math.max(3, maxHere))
    out.push(c)
    remaining -= c
  }
  return out
}

/** "Which is most" only works when exactly one group is the biggest. */
function ensureStrictMax(counts: number[], rng: Rng): number[] {
  const max = Math.max(...counts)
  const tied = counts.map((v, i) => ({ v, i })).filter((x) => x.v === max).map((x) => x.i)
  if (tied.length === 1) return counts
  const out = [...counts]
  const total = out.reduce((a, b) => a + b, 0)
  const winner = rng.pick(tied)
  if (max < 12 && total < MAX_TOTAL) {
    out[winner] = max + 1
    return out
  }
  // max is at the ceiling (or the pile is full) — trim the other tied groups
  // instead. They are >= 4 here, so they never fall under the minimum of 3.
  for (const i of tied) if (i !== winner) out[i] = Math.max(3, out[i] - 1)
  return out
}

export function generate(rng: Rng): Params {
  const attribute = rng.pick(ATTRIBUTES)
  const pool = CATEGORY_POOLS[attribute]
  const k = rng.int(3, 4)
  const categories = rng.shuffle(pool.map((c) => c.key)).slice(0, k)
  const ask = rng.pick(ASKS)

  let counts = rng.shuffle(drawCounts(rng, k))
  let askIndices: number[] = []

  if (ask === 'most') {
    counts = ensureStrictMax(counts, rng)
  } else if (ask === 'difference') {
    counts = ensureStrictMax(counts, rng)
    const pairs: number[][] = []
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        if (i !== j && counts[i] > counts[j]) pairs.push([i, j])
      }
    }
    askIndices = rng.pick(pairs)
  } else if (ask === 'count-one') {
    askIndices = [rng.int(0, k - 1)]
  }

  return {
    attribute,
    categories,
    counts,
    layout: rng.pick(LAYOUTS),
    ask,
    askIndices,
    seed: rng.int(0, 999),
  }
}

// --- hint steps -------------------------------------------------------------

/** "2, 4, 6, then 7" — the skip-count a grade-1 child actually says out loud. */
function skipCount(n: number, lastWord: string): string {
  const parts: string[] = []
  for (let v = 2; v <= n; v += 2) parts.push(String(v))
  if (n % 2 === 0) return parts.join(', ')
  if (parts.length === 0) return String(n)
  return `${parts.join(', ')}, ${lastWord} ${n}`
}

function hintSteps(params: Params, d: Derived): { id: string[]; en: string[] } {
  if (params.ask === 'count-one') {
    const t = params.askIndices[0] ?? 0
    const cat = d.cats[t]
    const n = d.counts[t]
    return {
      id: [
        `Pisahkan dulu ${cat.label_id} dari benda yang lain.`,
        `Hitung dua-dua sambil menunjuk: ${skipCount(n, 'lalu')}.`,
        `Hitungan berhenti di ${n}, jadi ada ${n} ${cat.label_id}.`,
      ],
      en: [
        `First pick out only the ${cat.plural_en}.`,
        `Point and count them in twos: ${skipCount(n, 'then')}.`,
        `The count stops at ${n}, so there are ${n} ${cat.plural_en}.`,
      ],
    }
  }

  if (params.ask === 'most') {
    const listId = d.cats.map((c, i) => `${c.label_id} ${d.counts[i]}`).join(', ')
    const listEn = d.cats.map((c, i) => `${c.plural_en} ${d.counts[i]}`).join(', ')
    const sorted = [...d.counts].sort((a, b) => b - a).join(' > ')
    const max = d.counts[d.winner]
    return {
      id: [
        `Hitung tiap kelompok: ${listId}.`,
        `Bandingkan bilangannya: ${sorted}.`,
        `Yang terbesar ${max}, yaitu ${d.cats[d.winner].label_id}. Jawabannya ${d.answer}.`,
      ],
      en: [
        `Count each group: ${listEn}.`,
        `Compare the numbers: ${sorted}.`,
        `The biggest is ${max}, the ${d.cats[d.winner].plural_en}. So the answer is ${d.answer}.`,
      ],
    }
  }

  if (params.ask === 'difference') {
    const a = params.askIndices[0] ?? 0
    const b = params.askIndices[1] ?? 1
    const ca = d.counts[a]
    const cb = d.counts[b]
    return {
      id: [
        `Hitung ${d.cats[a].label_id}: ada ${ca}.`,
        `Hitung ${d.cats[b].label_id}: ada ${cb}.`,
        `"Lebih banyak" artinya kurangkan: ${ca} - ${cb} = ${ca - cb}.`,
      ],
      en: [
        `Count the ${d.cats[a].plural_en}: there are ${ca}.`,
        `Count the ${d.cats[b].plural_en}: there are ${cb}.`,
        `"How many more" means subtract: ${ca} - ${cb} = ${ca - cb}.`,
      ],
    }
  }

  return {
    id: [
      `Jangan hitung semua bendanya — hitung jenisnya.`,
      `Jenis yang muncul: ${d.cats.map((c) => c.label_id).join(', ')}.`,
      `Jenisnya ada ${d.kinds}, jadi jawabannya ${d.kinds}.`,
    ],
    en: [
      `Don't count every item — count the kinds.`,
      `The kinds you can see: ${d.cats.map((c) => c.plural_en).join(', ')}.`,
      `That is ${d.kinds} kinds, so the answer is ${d.kinds}.`,
    ],
  }
}

export function render(params: Params) {
  const d = derive(params)
  const steps = hintSteps(params, d)

  return {
    body_en: d.body_en,
    body_id: d.body_id,
    answer_type: d.answer_type,
    choices_en: d.choices_en,
    choices_id: d.choices_id,
    answer: d.answer,
    hint_en: 'Sort the items into groups first, then count each group one at a time.',
    hint_id: 'Kelompokkan dulu benda yang sama, baru hitung setiap kelompok satu per satu.',
    hint_steps_en: steps.en,
    hint_steps_id: steps.id,
    breakdown: buildSortCountByAttributeBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
