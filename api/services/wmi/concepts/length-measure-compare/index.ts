import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildLengthMeasureCompareBreakdown } from './breakdown.js'

// ---------------------------------------------------------------------------
// Grade-1 measuring: read a length off a picture, then measure or compare.
//
// Three media:
//   ruler         — the object is aligned at 0, so the right-hand number IS the
//                   length (still deduced as end − 0).
//   offset-ruler  — the SIGNATURE WMI twist: the object does not start at 0, so
//                   the child must subtract (end − start). Reading the right-hand
//                   number straight off the ruler is the trap.
//   unit-chain    — length measured with repeated unit squares (petak satuan)
//                   laid end to end, sharing edges, with no gaps.
//
// Everything is whole numbers, never negative, and never above 20 units.
// ---------------------------------------------------------------------------

const OBJECT_KEYS = ['pensil', 'pita', 'ranting', 'sedotan', 'krayon', 'tali'] as const
export type ObjectKey = (typeof OBJECT_KEYS)[number]

export const OBJECTS: Record<
  ObjectKey,
  { id: string; en: string; artId: string; artEn: string }
> = {
  pensil: { id: 'pensil', en: 'pencil', artId: 'Sebuah', artEn: 'A' },
  pita: { id: 'pita', en: 'ribbon', artId: 'Sehelai', artEn: 'A' },
  ranting: { id: 'ranting', en: 'twig', artId: 'Sebatang', artEn: 'A' },
  sedotan: { id: 'sedotan', en: 'straw', artId: 'Sebuah', artEn: 'A' },
  krayon: { id: 'krayon', en: 'crayon', artId: 'Sebuah', artEn: 'A' },
  tali: { id: 'tali', en: 'string', artId: 'Seutas', artEn: 'A' },
}

const UNIT_WORDS = {
  cm: { shortId: 'cm', shortEn: 'cm', longId: 'penggaris', longEn: 'a ruler' },
  petak: { shortId: 'petak', shortEn: 'squares', longId: 'petak satuan', longEn: 'unit squares' },
} as const

const COUNT_ID = ['nol', 'Satu', 'Dua', 'Tiga', 'Empat'] as const
const COUNT_EN = ['zero', 'One', 'Two', 'Three', 'Four'] as const
export const LABELS = ['A', 'B', 'C', 'D'] as const

// Ordinals used by `nth-longest`. Only 2nd and 3rd are ever asked — a Grade-1
// child can hold "second longest" in their head, "fifth longest" they cannot.
const ORDINAL_ID: Record<number, string> = { 2: 'kedua', 3: 'ketiga' }
const ORDINAL_EN: Record<number, string> = { 2: 'second', 3: 'third' }

const MINUS = '−' // proper minus sign, matches the other WMI concepts

const itemSchema = z.object({
  name: z.enum(['pensil', 'pita', 'ranting', 'sedotan', 'krayon', 'tali']),
  start: z.number().int().min(0).max(20),
  length: z.number().int().min(1).max(20),
})

const baseParamsSchema = z.object({
  medium: z.enum(['ruler', 'offset-ruler', 'unit-chain']),
  unitLabel: z.enum(['cm', 'petak']),
  ask: z.enum([
    'measure-one',
    'longest',
    'difference',
    // Added later, all mined from real WMI Grade-1 papers. The figure and the
    // arithmetic are unchanged — only the question on top of them moves.
    'nth-longest', // 2019-final-g1 #4  "which is the second longest?"
    'order-all', // 2022-semifinal-g1 #7  "order them longest to shortest"
    'sum-two', // 2025-semifinal-g1 #6  "the sum of the two lengths"
    'relative-from-known', // 2024-semifinal-g1 #14  "the longest is 15 cm, find the shortest"
  ]),
  // Rulers: the biggest number printed on the ruler. Unit chains: the longest
  // chain (used only for laying out the figure).
  rulerMax: z.number().int().min(1).max(20),
  items: z.array(itemSchema).min(1).max(4),
  focusA: z.number().int().min(0).max(3),
  focusB: z.number().int().min(0).max(3),
  // `nth-longest` only: which rank the question asks for. Optional so the rows
  // already stored for the three original asks keep parsing untouched.
  nth: z.number().int().min(2).max(3).optional(),
})

// Extra guarantees the NEW asks need for the puzzle to be fair. Deliberately
// scoped so it can never reject a stored `measure-one` / `longest` /
// `difference` row.
const paramsSchema = baseParamsSchema.superRefine((p, ctx) => {
  const needsDistinct =
    p.ask === 'nth-longest' || p.ask === 'order-all' || p.ask === 'relative-from-known'
  if (needsDistinct) {
    const lengths = p.items.map((it) => it.length)
    if (new Set(lengths).size !== lengths.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: `${p.ask} needs every length to be different so the ranking is unambiguous`,
      })
    }
  }
  if (p.ask === 'nth-longest') {
    if (p.nth === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nth'], message: 'nth-longest needs nth' })
    } else if (p.nth >= p.items.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nth'],
        message: 'nth must be smaller than the number of items',
      })
    }
  }
  if (p.ask === 'order-all' && p.items.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['items'],
      message: 'order-all needs at least 3 items',
    })
  }
  if (p.ask === 'sum-two' && p.items.length !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['items'],
      message: 'sum-two needs exactly 2 items',
    })
  }
  if (p.ask === 'relative-from-known' && p.items.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['items'],
      message: 'relative-from-known needs at least 2 items',
    })
  }
})
export type Params = z.infer<typeof baseParamsSchema>

export const meta = {
  slug: 'length-measure-compare',
  name_en: 'Measure and compare lengths',
  name_id: 'Ukur dan bandingkan panjang',
  grades: [1] as const,
  description_id:
    'Baca panjang benda dari gambar penggaris atau satuan berulang, lalu ukur atau bandingkan. Kalau benda tidak mulai dari 0, kurangi!',
} as const

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

/** The printed maximum: always past the farthest right end, never above 14. */
function rulerMaxFor(rng: Rng, items: { start: number; length: number }[]): number {
  const maxEnd = items.reduce((m, it) => Math.max(m, it.start + it.length), 1)
  return Math.min(14, maxEnd + rng.int(1, 2))
}

/** `count` different lengths, biggest first — a strict ranking, never a tie. */
function distinctLengths(rng: Rng, count: number): number[] {
  return rng
    .shuffle([3, 4, 5, 6, 7, 8])
    .slice(0, count)
    .sort((a, b) => b - a)
}

export function generate(rng: Rng): Params {
  // offset-ruler is the signature type, so it gets extra weight.
  let medium = rng.pick(['ruler', 'offset-ruler', 'offset-ruler', 'unit-chain'] as const)
  const ask = rng.pick([
    'measure-one',
    'measure-one',
    'longest',
    'difference',
    'nth-longest',
    'order-all',
    'sum-two',
    'relative-from-known',
  ] as const)
  // `relative-from-known` states one true length in words. That statement only
  // earns its place on the offset ruler, where it doubles as a worked example of
  // the rule the child then has to apply themselves (right end − left end).
  if (ask === 'relative-from-known') medium = 'offset-ruler'
  // Unit chains are always measured in unit squares (petak satuan).
  const unitLabel: Params['unitLabel'] = medium === 'unit-chain' ? 'petak' : 'cm'
  const keys = rng.shuffle(OBJECT_KEYS)

  if (ask === 'measure-one') {
    const name = keys[0]
    if (medium === 'unit-chain') {
      const length = rng.int(4, 10)
      return {
        medium,
        unitLabel,
        ask,
        rulerMax: length,
        items: [{ name, start: 0, length }],
        focusA: 0,
        focusB: 0,
      }
    }
    const start = medium === 'offset-ruler' ? rng.int(1, 4) : 0
    const length = medium === 'offset-ruler' ? rng.int(3, 8) : rng.int(3, 10)
    const end = start + length
    const rulerMax = Math.min(14, end + rng.int(1, 3))
    return {
      medium,
      unitLabel,
      ask,
      rulerMax,
      items: [{ name, start, length }],
      focusA: 0,
      focusB: 0,
    }
  }

  if (ask === 'longest') {
    const count = rng.int(2, 3)
    // Distinct lengths, biggest first — guarantees a single longest object.
    const lengths = rng
      .shuffle([3, 4, 5, 6, 7, 8])
      .slice(0, count)
      .sort((a, b) => b - a)

    if (medium === 'unit-chain') {
      const built = lengths.map((length, i) => ({ name: keys[i], start: 0, length }))
      return {
        medium,
        unitLabel,
        ask,
        rulerMax: lengths[0],
        items: rng.shuffle(built),
        focusA: 0,
        focusB: 0,
      }
    }

    if (medium === 'ruler') {
      const built = lengths.map((length, i) => ({ name: keys[i], start: 0, length }))
      const rulerMax = Math.min(14, lengths[0] + rng.int(1, 3))
      return { medium, unitLabel, ask, rulerMax, items: rng.shuffle(built), focusA: 0, focusB: 0 }
    }

    // offset-ruler — build the trap on purpose: the SECOND-longest object is
    // slid right far enough that it ends at the biggest number on the ruler,
    // even though the longest object is genuinely longer.
    const overshoot = rng.int(1, 2)
    const gap = lengths[0] - lengths[1] // >= 1, lengths are distinct
    const built = [
      { name: keys[0], start: 1, length: lengths[0] },
      { name: keys[1], start: 1 + gap + overshoot, length: lengths[1] },
    ]
    if (count === 3) built.push({ name: keys[2], start: rng.int(1, 3), length: lengths[2] })
    const maxEnd = built.reduce((m, it) => Math.max(m, it.start + it.length), 0)
    const rulerMax = Math.min(14, maxEnd + rng.int(1, 2))
    return { medium, unitLabel, ask, rulerMax, items: rng.shuffle(built), focusA: 0, focusB: 0 }
  }

  // --- nth-longest / order-all ---------------------------------------------
  // Both rank every object, so both need a strict ranking: all lengths different.
  if (ask === 'nth-longest' || ask === 'order-all') {
    const count = rng.int(3, 4)
    // nth must stay inside the ranking: with 3 bars only "second longest" is
    // askable, with 4 both "second" and "third" are.
    const nth = ask === 'nth-longest' ? (count === 3 ? 2 : rng.int(2, 3)) : undefined
    const lengths = distinctLengths(rng, count)
    // Starts scramble where the bars stop, so the child cannot rank them by
    // eyeballing the right-hand ends — exactly the habit this concept attacks.
    const built = lengths.map((length, i) => ({
      name: keys[i],
      start: medium === 'offset-ruler' ? rng.int(1, 3) : 0,
      length,
    }))
    const items = rng.shuffle(built)
    const rulerMax =
      medium === 'unit-chain' ? lengths[0] : rulerMaxFor(rng, items)
    return nth === undefined
      ? { medium, unitLabel, ask, rulerMax, items, focusA: 0, focusB: 0 }
      : { medium, unitLabel, ask, rulerMax, items, focusA: 0, focusB: 0, nth }
  }

  // --- sum-two --------------------------------------------------------------
  // Exactly two objects; the lengths may tie (nothing is being ranked).
  if (ask === 'sum-two') {
    const offset = medium === 'offset-ruler'
    const lengthA = medium === 'unit-chain' ? rng.int(3, 8) : rng.int(3, 7)
    const lengthB = medium === 'unit-chain' ? rng.int(3, 8) : rng.int(3, 7)
    // The first bar's right-end reading is the tempting wrong answer the
    // explainer calls out, so it must never land on the total: startA + lengthA
    // equals lengthA + lengthB exactly when startA equals lengthB.
    const startA = offset ? rng.pick([1, 2, 3].filter((s) => s !== lengthB)) : 0
    const startB = offset ? rng.int(1, 3) : 0
    const items = [
      { name: keys[0], start: startA, length: lengthA },
      { name: keys[1], start: startB, length: lengthB },
    ]
    const rulerMax =
      medium === 'unit-chain' ? Math.max(lengthA, lengthB) : rulerMaxFor(rng, items)
    return { medium, unitLabel, ask, rulerMax, items, focusA: 0, focusB: 1 }
  }

  // --- relative-from-known --------------------------------------------------
  // Three objects on an offset ruler. The body states the LONGEST one's length,
  // which is both the worked example of "right end − left end" and the proof the
  // rule is the one to use; the child applies it to the SHORTEST one. Distinct
  // lengths keep "the longest" and "the shortest" pointing at exactly one bar.
  if (ask === 'relative-from-known') {
    const lengths = distinctLengths(rng, 3)
    const built = lengths.map((length, i) => ({ name: keys[i], start: rng.int(1, 3), length }))
    const items = rng.shuffle(built)
    const rulerMax = rulerMaxFor(rng, items)
    let longestIndex = 0
    let shortestIndex = 0
    items.forEach((it, i) => {
      if (it.length > items[longestIndex].length) longestIndex = i
      if (it.length < items[shortestIndex].length) shortestIndex = i
    })
    return {
      medium,
      unitLabel,
      ask,
      rulerMax,
      items,
      focusA: longestIndex,
      focusB: shortestIndex,
    }
  }

  // ask === 'difference' — A is always the longer one.
  const lenB = medium === 'unit-chain' ? rng.int(3, 6) : rng.int(3, 5)
  let diff = rng.int(1, 4)
  let startA = 0
  let startB = 0
  if (medium === 'offset-ruler') {
    startA = rng.int(1, 4)
    // Keep enough room that a valid, DIFFERENT startB exists below startA + diff.
    if (startA + diff < 3) diff = 3 - startA
    const upper = Math.min(4, startA + diff - 1)
    const options: number[] = []
    for (let v = 1; v <= upper; v++) if (v !== startA) options.push(v)
    startB = rng.pick(options)
  }
  const lenA = lenB + diff
  const a = { name: keys[0], start: startA, length: lenA }
  const b = { name: keys[1], start: startB, length: lenB }
  const flip = rng.int(0, 1) === 1
  const items = flip ? [b, a] : [a, b]
  const maxEnd = Math.max(a.start + a.length, b.start + b.length)
  const rulerMax = medium === 'unit-chain' ? lenA : Math.min(14, maxEnd + rng.int(1, 2))
  return {
    medium,
    unitLabel,
    ask,
    rulerMax,
    items,
    focusA: flip ? 1 : 0,
    focusB: flip ? 0 : 1,
  }
}

// ---------------------------------------------------------------------------
// derive — the single source of truth shared by render() and the breakdown, so
// every highlight phrase is literally built from the same string pieces as the
// body it must be a substring of.
// ---------------------------------------------------------------------------

export interface ItemInfo {
  key: ObjectKey
  nameId: string
  nameEn: string
  NameId: string
  NameEn: string
  artId: string
  artEn: string
  start: number
  end: number
  length: number
}

export interface Phrase {
  id: string
  en: string
}

export interface Derived {
  infos: ItemInfo[]
  unit: (typeof UNIT_WORDS)[keyof typeof UNIT_WORDS]
  a: ItemInfo
  b: ItemInfo
  longestIndex: number
  shortestIndex: number
  farthestEndIndex: number
  /** Item indices sorted longest → shortest (ties broken by position). */
  rankOrder: number[]
  /** Rank the question asks for; only meaningful when ask === 'nth-longest'. */
  nth: number
  answer: string
  answer_type: 'fill_in' | 'multiple_choice'
  choices_id: WmiChoice[] | null
  choices_en: WmiChoice[] | null
  body_id: string
  body_en: string
  object: Phrase
  question: Phrase
  setup: Phrase | null
  leftEnd: Phrase | null
  rightEnd: Phrase | null
  /** `relative-from-known` only: the sentence that hands over one true length. */
  stated: Phrase | null
}

/**
 * The wrong orders offered alongside the right one — each a plausible slip
 * (read it backwards, swap the top two, swap the bottom two), never a random
 * shuffle. Built from the correct order so they are always exactly as long.
 */
function orderDistractors(rank: number[]): number[][] {
  const swapped = (i: number, j: number) => {
    const copy = rank.slice()
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    return copy
  }
  const candidates = [rank.slice().reverse(), swapped(0, 1), swapped(rank.length - 2, rank.length - 1)]
  const seen = new Set([rank.join(',')])
  const out: number[][] = []
  for (const c of candidates) {
    const key = c.join(',')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(c)
  }
  return out
}

export function derive(params: Params): Derived {
  const { medium, unitLabel, ask, items, focusA, focusB } = params
  const unit = UNIT_WORDS[unitLabel]

  const infos: ItemInfo[] = items.map((it) => {
    const o = OBJECTS[it.name]
    return {
      key: it.name,
      nameId: o.id,
      nameEn: o.en,
      NameId: cap(o.id),
      NameEn: cap(o.en),
      artId: o.artId,
      artEn: o.artEn,
      start: it.start,
      end: it.start + it.length,
      length: it.length,
    }
  })

  let longestIndex = 0
  let shortestIndex = 0
  let farthestEndIndex = 0
  infos.forEach((it, i) => {
    if (it.length > infos[longestIndex].length) longestIndex = i
    if (it.length < infos[shortestIndex].length) shortestIndex = i
    if (it.end > infos[farthestEndIndex].end) farthestEndIndex = i
  })
  // Longest → shortest. Position breaks a tie so the order is always defined,
  // but the generator never ships a tie for the asks that rank.
  const rankOrder = infos
    .map((_, i) => i)
    .sort((i, j) => infos[j].length - infos[i].length || i - j)
  const nth = Math.min(Math.max(params.nth ?? 2, 2), Math.max(infos.length - 1, 2))

  // `relative-from-known` names its two objects by superlative, not by position,
  // so the pair comes from the ranking rather than from focusA/focusB.
  const a =
    ask === 'relative-from-known' ? infos[longestIndex] : infos[Math.min(focusA, infos.length - 1)]
  const b =
    ask === 'relative-from-known' ? infos[shortestIndex] : infos[Math.min(focusB, infos.length - 1)]

  // --- subject of the opening sentence -------------------------------------
  let subjectId: string
  let subjectEn: string
  let isAreEn: string
  if (ask === 'measure-one') {
    subjectId = `${a.artId} ${a.nameId}`
    subjectEn = `${a.artEn} ${a.nameEn}`
    isAreEn = 'is'
  } else if (
    ask === 'longest' ||
    ask === 'nth-longest' ||
    ask === 'order-all' ||
    ask === 'relative-from-known'
  ) {
    subjectId = `${COUNT_ID[infos.length]} benda`
    subjectEn = `${COUNT_EN[infos.length]} objects`
    isAreEn = 'are'
  } else {
    subjectId = `${a.NameId} dan ${b.nameId}`
    subjectEn = `${a.artEn} ${a.nameEn} and ${b.artEn.toLowerCase()} ${b.nameEn}`
    isAreEn = 'are'
  }

  // --- sentence 1: how the measuring is set up -----------------------------
  let s1Id: string
  let s1En: string
  if (medium === 'ruler') {
    s1Id = `${subjectId} diukur dengan penggaris.`
    s1En = `${subjectEn} ${isAreEn} measured with a ruler.`
  } else if (medium === 'offset-ruler') {
    s1Id = `${subjectId} diletakkan di atas penggaris.`
    s1En = `${subjectEn} ${isAreEn} placed on a ruler.`
  } else {
    s1Id = `${subjectId} diukur memakai ${unit.longId} yang disusun rapat tanpa celah.`
    s1En = `${subjectEn} ${isAreEn} measured using ${unit.longEn} laid end to end with no gaps.`
  }

  // --- sentence 2: where the ends sit --------------------------------------
  let s2Id = ''
  let s2En = ''
  let setup: Phrase | null = null
  let leftEnd: Phrase | null = null
  let rightEnd: Phrase | null = null

  if (medium === 'ruler') {
    if (ask === 'measure-one') {
      setup = { id: 'Ujung kirinya tepat di angka 0', en: 'Its left end is exactly at 0' }
    } else {
      setup = { id: 'Semua ujung kiri ada di angka 0', en: 'All the left ends are at 0' }
    }
    s2Id = `${setup.id}.`
    s2En = `${setup.en}.`
  } else if (medium === 'offset-ruler') {
    if (ask === 'measure-one') {
      leftEnd = { id: `Ujung kirinya di angka ${a.start}`, en: `Its left end is at ${a.start}` }
      rightEnd = { id: `ujung kanannya di angka ${a.end}`, en: `its right end is at ${a.end}` }
      s2Id = `${leftEnd.id}, ${rightEnd.id}.`
      s2En = `${leftEnd.en} and ${rightEnd.en}.`
    } else {
      setup = { id: 'Ujung kirinya tidak di angka 0', en: 'Their left ends are not at 0' }
      s2Id = `${setup.id}.`
      s2En = `${setup.en}.`
    }
  } else {
    setup = { id: 'disusun rapat tanpa celah', en: 'laid end to end with no gaps' }
  }

  // --- sentence 3: the one length the child is TOLD ------------------------
  // Only `relative-from-known` has it — it is the single ask whose body carries
  // a number, and that number is the longest bar's true length.
  let stated: Phrase | null = null
  if (ask === 'relative-from-known') {
    stated = {
      id: `Benda terpanjang panjangnya ${a.length} ${unit.shortId}`,
      en: `The longest object is ${a.length} ${unit.shortEn} long`,
    }
  }

  // --- the question --------------------------------------------------------
  let question: Phrase
  if (ask === 'measure-one') {
    question = {
      id: `Berapa ${unit.shortId} panjang ${a.nameId} itu?`,
      en: `How many ${unit.shortEn} long is the ${a.nameEn}?`,
    }
  } else if (ask === 'longest') {
    question = { id: 'Benda mana yang paling panjang?', en: 'Which object is the longest?' }
  } else if (ask === 'nth-longest') {
    question = {
      id: `Benda mana yang terpanjang ${ORDINAL_ID[nth]}?`,
      en: `Which object is the ${ORDINAL_EN[nth]} longest?`,
    }
  } else if (ask === 'order-all') {
    question = {
      id: 'Bagaimana urutan bendanya dari yang terpanjang ke yang terpendek?',
      en: 'What is the order of the objects from the longest to the shortest?',
    }
  } else if (ask === 'sum-two') {
    question = {
      id: `Berapa ${unit.shortId} jumlah panjang ${a.nameId} dan ${b.nameId}?`,
      en: `What is the total length of the ${a.nameEn} and the ${b.nameEn} in ${unit.shortEn}?`,
    }
  } else if (ask === 'relative-from-known') {
    question = {
      id: `Berapa ${unit.shortId} panjang benda terpendek?`,
      en: `How many ${unit.shortEn} long is the shortest object?`,
    }
  } else {
    question = {
      id: `Berapa ${unit.shortId} ${a.nameId} lebih panjang daripada ${b.nameId}?`,
      en: `How many ${unit.shortEn} longer is the ${a.nameEn} than the ${b.nameEn}?`,
    }
  }

  const parts = (...bits: string[]) => bits.filter(Boolean).join(' ')
  const headId = parts(s1Id, s2Id, stated ? `${stated.id}.` : '')
  const headEn = parts(s1En, s2En, stated ? `${stated.en}.` : '')
  const body_id = `${headId}\n\nCari: ${question.id}`
  const body_en = `${headEn}\n\nFind: ${question.en}`

  // --- answer + choices ----------------------------------------------------
  let answer: string
  let answer_type: 'fill_in' | 'multiple_choice'
  let choices_id: WmiChoice[] | null = null
  let choices_en: WmiChoice[] | null = null
  if (ask === 'longest' || ask === 'nth-longest') {
    // Both name an object, and a typed object name is not gradable across the
    // two languages — so both are picked, labelled exactly like the figure.
    answer_type = 'multiple_choice'
    answer = LABELS[ask === 'longest' ? longestIndex : rankOrder[nth - 1]]
    choices_id = infos.map((it, i) => ({ label: LABELS[i], text: it.NameId }))
    choices_en = infos.map((it, i) => ({ label: LABELS[i], text: it.NameEn }))
  } else if (ask === 'order-all') {
    // An ORDERED list of words is not something `isCorrectAnswer` can grade —
    // it canonicalises unordered number sets, not sequences, and every join
    // format a child might type ("A B C", "A, B, C", "A-B-C") lands somewhere
    // different. So the orders are offered as choices instead of typed, and the
    // option text spells the objects out rather than reusing the figure letters
    // (an option badge "B" holding the text "B, D, A, C" reads as a riddle).
    answer_type = 'multiple_choice'
    const options: number[][] = new Array(4)
    // Deterministic slot for the right answer — pure from params, so derive()
    // stays a function of its input and never drifts between calls.
    const slotSeed = infos.reduce(
      (s, it, i) => s + it.length * (i + 3) + it.start * (i + 7),
      infos.length,
    )
    const correctSlot = slotSeed % 4
    options[correctSlot] = rankOrder
    const wrong = orderDistractors(rankOrder)
    let w = 0
    for (let slot = 0; slot < 4; slot++) if (slot !== correctSlot) options[slot] = wrong[w++]
    answer = LABELS[correctSlot]
    choices_id = options.map((order, i) => ({
      label: LABELS[i],
      text: order.map((k) => infos[k].NameId).join(', '),
    }))
    choices_en = options.map((order, i) => ({
      label: LABELS[i],
      text: order.map((k) => infos[k].NameEn).join(', '),
    }))
  } else if (ask === 'measure-one') {
    answer_type = 'fill_in'
    answer = String(a.length)
  } else if (ask === 'sum-two') {
    answer_type = 'fill_in'
    answer = String(a.length + b.length)
  } else if (ask === 'relative-from-known') {
    answer_type = 'fill_in'
    answer = String(b.length)
  } else {
    answer_type = 'fill_in'
    answer = String(a.length - b.length)
  }

  return {
    infos,
    unit,
    a,
    b,
    longestIndex,
    shortestIndex,
    farthestEndIndex,
    rankOrder,
    nth,
    answer,
    answer_type,
    choices_id,
    choices_en,
    body_id,
    body_en,
    object: { id: subjectId, en: subjectEn },
    question,
    setup,
    leftEnd,
    rightEnd,
    stated,
  }
}

// ---------------------------------------------------------------------------
// render
// ---------------------------------------------------------------------------

function hintSteps(params: Params, d: Derived): { id: string[]; en: string[] } {
  const { medium, ask } = params
  const u = d.unit
  const a = d.a
  const b = d.b

  if (ask === 'measure-one') {
    if (medium === 'unit-chain') {
      return {
        id: [
          `${cap(u.longId)} berjajar rapat dari ujung kiri sampai ujung kanan ${a.nameId}.`,
          `Hitung petaknya satu per satu: 1, 2, 3, ... sampai petak terakhir.`,
          `Hitungan terakhir ${a.length}, jadi panjangnya ${a.length} ${u.shortId}.`,
        ],
        en: [
          `The ${u.longEn} run from the left end of the ${a.nameEn} to its right end.`,
          `Count them one by one: 1, 2, 3, ... up to the last square.`,
          `The last count is ${a.length}, so the length is ${a.length} ${u.shortEn}.`,
        ],
      }
    }
    if (medium === 'offset-ruler') {
      return {
        id: [
          `Ujung kiri ${a.nameId} ada di angka ${a.start}, bukan di 0.`,
          `Ujung kanannya ada di angka ${a.end}.`,
          `Panjang = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortId}.`,
        ],
        en: [
          `The left end of the ${a.nameEn} is at ${a.start}, not at 0.`,
          `Its right end is at ${a.end}.`,
          `Length = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortEn}.`,
        ],
      }
    }
    return {
      id: [
        `Ujung kiri ${a.nameId} tepat di angka 0.`,
        `Ujung kanannya ada di angka ${a.end}.`,
        `Panjang = ${a.end} ${MINUS} 0 = ${a.length} ${u.shortId}.`,
      ],
      en: [
        `The left end of the ${a.nameEn} is exactly at 0.`,
        `Its right end is at ${a.end}.`,
        `Length = ${a.end} ${MINUS} 0 = ${a.length} ${u.shortEn}.`,
      ],
    }
  }

  if (ask === 'longest') {
    const win = d.infos[d.longestIndex]
    if (medium === 'unit-chain') {
      const listId = d.infos
        .map((it) => `${it.nameId} ${it.length} ${u.shortId}`)
        .join(', ')
      const listEn = d.infos
        .map((it) => `${it.nameEn} ${it.length} ${u.shortEn}`)
        .join(', ')
      return {
        id: [
          `Hitung ${u.longId} di bawah setiap benda.`,
          `${cap(listId)}.`,
          `${win.length} paling besar, jadi ${win.nameId} yang paling panjang.`,
        ],
        en: [
          `Count the ${u.longEn} under each object.`,
          `${cap(listEn)}.`,
          `${win.length} is the biggest, so the ${win.nameEn} is the longest.`,
        ],
      }
    }
    if (medium === 'offset-ruler') {
      const listId = d.infos
        .map((it) => `${it.nameId} ${it.end} ${MINUS} ${it.start} = ${it.length}`)
        .join(', ')
      const listEn = d.infos
        .map((it) => `${it.nameEn} ${it.end} ${MINUS} ${it.start} = ${it.length}`)
        .join(', ')
      return {
        id: [
          `Tidak ada yang mulai dari 0, jadi panjang = angka kanan ${MINUS} angka kiri.`,
          `${cap(listId)}.`,
          `${win.length} paling besar, jadi ${win.nameId} yang paling panjang.`,
        ],
        en: [
          `Nothing starts at 0, so length = right number ${MINUS} left number.`,
          `${cap(listEn)}.`,
          `${win.length} is the biggest, so the ${win.nameEn} is the longest.`,
        ],
      }
    }
    const listId = d.infos.map((it) => `${it.nameId} sampai ${it.end}`).join(', ')
    const listEn = d.infos.map((it) => `${it.nameEn} up to ${it.end}`).join(', ')
    return {
      id: [
        `Semua benda mulai di angka 0.`,
        `${cap(listId)}.`,
        `${win.end} paling besar, jadi ${win.nameId} yang paling panjang.`,
      ],
      en: [
        `Every object starts at 0.`,
        `${cap(listEn)}.`,
        `${win.end} is the biggest, so the ${win.nameEn} is the longest.`,
      ],
    }
  }

  // --- nth-longest / order-all ---------------------------------------------
  // Same two opening beats: state the measuring rule, then measure EVERY object.
  // The last beat lays the measurements out in order, and the answer falls out
  // of that list — it is never announced ahead of the ranking.
  if (ask === 'nth-longest' || ask === 'order-all') {
    const isChain = medium === 'unit-chain'
    const openId = isChain
      ? `Hitung ${u.longId} di bawah setiap benda.`
      : medium === 'offset-ruler'
        ? `Tidak ada yang mulai dari 0, jadi panjang = angka kanan ${MINUS} angka kiri.`
        : `Semua benda mulai di angka 0, jadi panjang = angka ujung kanan ${MINUS} 0.`
    const openEn = isChain
      ? `Count the ${u.longEn} under each object.`
      : medium === 'offset-ruler'
        ? `Nothing starts at 0, so length = right number ${MINUS} left number.`
        : `Every object starts at 0, so length = right-hand number ${MINUS} 0.`
    const listId = d.infos
      .map((it) =>
        isChain
          ? `${it.nameId} ${it.length} ${u.shortId}`
          : `${it.nameId} ${it.end} ${MINUS} ${it.start} = ${it.length}`,
      )
      .join(', ')
    const listEn = d.infos
      .map((it) =>
        isChain
          ? `${it.nameEn} ${it.length} ${u.shortEn}`
          : `${it.nameEn} ${it.end} ${MINUS} ${it.start} = ${it.length}`,
      )
      .join(', ')
    const ranked = d.rankOrder.map((i) => d.infos[i])
    const sorted = ranked.map((it) => it.length).join(', ')

    if (ask === 'order-all') {
      return {
        id: [
          openId,
          `${cap(listId)}.`,
          `Susun panjangnya dari besar ke kecil: ${sorted}. Jadi urutannya ${ranked
            .map((it) => it.nameId)
            .join(', ')}.`,
        ],
        en: [
          openEn,
          `${cap(listEn)}.`,
          `Line the lengths up from biggest to smallest: ${sorted}. So the order is ${ranked
            .map((it) => it.nameEn)
            .join(', ')}.`,
        ],
      }
    }

    const target = ranked[d.nth - 1]
    return {
      id: [
        openId,
        `${cap(listId)}.`,
        `Susun panjangnya dari besar ke kecil: ${sorted}. Yang ${ORDINAL_ID[d.nth]} adalah ${target.length}, yaitu ${target.nameId}.`,
      ],
      en: [
        openEn,
        `${cap(listEn)}.`,
        `Line the lengths up from biggest to smallest: ${sorted}. The ${ORDINAL_EN[d.nth]} one is ${target.length} — the ${target.nameEn}.`,
      ],
    }
  }

  // --- sum-two --------------------------------------------------------------
  if (ask === 'sum-two') {
    const total = a.length + b.length
    if (medium === 'unit-chain') {
      return {
        id: [
          `Hitung ${u.longId} di bawah ${a.nameId}: ${a.length}.`,
          `Hitung ${u.longId} di bawah ${b.nameId}: ${b.length}.`,
          `Gabungkan: ${a.length} + ${b.length} = ${total} ${u.shortId}.`,
        ],
        en: [
          `Count the ${u.longEn} under the ${a.nameEn}: ${a.length}.`,
          `Count the ${u.longEn} under the ${b.nameEn}: ${b.length}.`,
          `Put them together: ${a.length} + ${b.length} = ${total} ${u.shortEn}.`,
        ],
      }
    }
    return {
      id: [
        `Panjang ${a.nameId} = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortId}.`,
        `Panjang ${b.nameId} = ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortId}.`,
        `Gabungkan: ${a.length} + ${b.length} = ${total} ${u.shortId}.`,
      ],
      en: [
        `Length of the ${a.nameEn} = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortEn}.`,
        `Length of the ${b.nameEn} = ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortEn}.`,
        `Put them together: ${a.length} + ${b.length} = ${total} ${u.shortEn}.`,
      ],
    }
  }

  // --- relative-from-known --------------------------------------------------
  // `a` is the object whose length the question hands over (the longest), `b` is
  // the one being asked for (the shortest). Beat 1 checks the given number
  // against the picture, which is what proves the rule; beats 2-3 run the same
  // rule on the shortest bar, so the answer is produced, not announced.
  if (ask === 'relative-from-known') {
    return {
      id: [
        `Benda terpanjang adalah ${a.nameId}: dari angka ${a.start} sampai ${a.end}, dan ${a.end} ${MINUS} ${a.start} = ${a.length} — sama dengan ${a.length} ${u.shortId} yang ditulis di soal.`,
        `Benda terpendek adalah ${b.nameId}: ujung kirinya di angka ${b.start}, ujung kanannya di angka ${b.end}.`,
        `Pakai aturan yang sama: ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortId}.`,
      ],
      en: [
        `The longest object is the ${a.nameEn}: it runs from ${a.start} to ${a.end}, and ${a.end} ${MINUS} ${a.start} = ${a.length} — the same ${a.length} ${u.shortEn} the question gives.`,
        `The shortest object is the ${b.nameEn}: its left end is at ${b.start} and its right end is at ${b.end}.`,
        `Use the same rule: ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortEn}.`,
      ],
    }
  }

  // difference
  const diff = a.length - b.length
  if (medium === 'unit-chain') {
    return {
      id: [
        `Hitung ${u.longId} di bawah ${a.nameId}: ${a.length}.`,
        `Hitung ${u.longId} di bawah ${b.nameId}: ${b.length}.`,
        `Selisihnya: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortId}.`,
      ],
      en: [
        `Count the ${u.longEn} under the ${a.nameEn}: ${a.length}.`,
        `Count the ${u.longEn} under the ${b.nameEn}: ${b.length}.`,
        `Difference: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortEn}.`,
      ],
    }
  }
  return {
    id: [
      `Panjang ${a.nameId} = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortId}.`,
      `Panjang ${b.nameId} = ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortId}.`,
      `Selisihnya: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortId}.`,
    ],
    en: [
      `Length of the ${a.nameEn} = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortEn}.`,
      `Length of the ${b.nameEn} = ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortEn}.`,
      `Difference: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortEn}.`,
    ],
  }
}

export function render(params: Params) {
  const d = derive(params)
  const steps = hintSteps(params, d)

  const hint_id =
    params.medium === 'offset-ruler'
      ? `Panjang bukan angka di ujung kanan! Kurangi dulu: angka ujung kanan ${MINUS} angka ujung kiri.`
      : params.medium === 'unit-chain'
        ? `Hitung petak satuannya satu per satu, jangan sampai ada yang terlewat atau terhitung dua kali.`
        : `Bendanya mulai dari 0, jadi angka di ujung kanan itulah panjangnya.`
  const hint_en =
    params.medium === 'offset-ruler'
      ? `The length is not the right-hand number! Subtract first: right number ${MINUS} left number.`
      : params.medium === 'unit-chain'
        ? `Count the unit squares one by one — do not skip one or count one twice.`
        : `The object starts at 0, so the right-hand number is the length.`

  return {
    body_en: d.body_en,
    body_id: d.body_id,
    answer_type: d.answer_type,
    choices_en: d.choices_en,
    choices_id: d.choices_id,
    answer: d.answer,
    hint_en,
    hint_id,
    hint_steps_en: steps.en,
    hint_steps_id: steps.id,
    breakdown: buildLengthMeasureCompareBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
