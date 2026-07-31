import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildMinAdjacentSwapsBreakdown } from './breakdown.js'

// C8 `min-adjacent-swaps`. A row of numbered items must be sorted, but only two
// items STANDING NEXT TO EACH OTHER may ever trade places. The fewest swaps is
// exactly the INVERSION COUNT — the number of pairs (any two items, adjacent or
// not) sitting in the wrong order relative to each other.
//
// Why that is a theorem and not a guess:
//   • One adjacent swap reverses exactly ONE pair, so it changes the number of
//     wrong pairs by exactly 1. K wrong pairs therefore need at least K swaps.
//   • If the row is not sorted, some ADJACENT pair must be wrong (if every
//     neighbour pair were in order the whole row would be), and swapping it
//     removes exactly one wrong pair. So K swaps always suffice.
// Lower bound + achievability meet, so the answer is K, full stop. Never count
// the swaps of one particular sorting run: a clumsy run does more than K.

export const KINDS = ['cards', 'flags', 'animals'] as const
export type Kind = (typeof KINDS)[number]

export const ORDERS = ['asc', 'desc'] as const
export type Order = (typeof ORDERS)[number]

export const MIN_LEN = 4
export const MAX_LEN = 7
export const MIN_INVERSIONS = 3
export const MAX_INVERSIONS = 9

const paramsSchema = z
  .object({
    kind: z.enum(KINDS),
    order: z.enum(ORDERS),
    name: z.string().min(1),
    /** The row exactly as the child sees it, left to right. */
    values: z.array(z.number().int().min(1).max(99)).min(MIN_LEN).max(MAX_LEN),
  })
  .refine((v) => new Set(v.values).size === v.values.length, {
    message: 'the numbers in the row must all be different, or "in order" is ambiguous',
  })
  .refine((v) => inversionCount(v.values, v.order) >= MIN_INVERSIONS, {
    message: `the row must be at least ${MIN_INVERSIONS} swaps away from sorted`,
  })
  .refine((v) => inversionCount(v.values, v.order) <= MAX_INVERSIONS, {
    message: `the row must be at most ${MAX_INVERSIONS} swaps away from sorted`,
  })
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Budi', 'Siti', 'Ayu', 'Rian', 'Dewi', 'Tono', 'Nadia', 'Fajar'] as const

export interface KindLabels {
  /** Plural noun used in the swap rule sentence. */
  plural_en: string
  plural_id: string
}

export const KIND_LABELS: Record<Kind, KindLabels> = {
  cards: { plural_en: 'cards', plural_id: 'kartu' },
  flags: { plural_en: 'flags', plural_id: 'bendera' },
  animals: { plural_en: 'animals', plural_id: 'hewan' },
}

export const meta = {
  slug: 'min-adjacent-swaps',
  name_en: 'Fewest neighbour swaps to sort',
  name_id: 'Tukar tetangga paling sedikit',
  grades: [1, 2] as const,
  description_id:
    'Mengurutkan barisan dengan hanya menukar dua benda yang bersebelahan: jawabannya sama dengan banyaknya pasangan yang terbalik.',
} as const

/** True when `a` sitting to the LEFT of `b` is the wrong way round for `order`. */
export function isWrongPair(a: number, b: number, order: Order): boolean {
  return order === 'asc' ? a > b : a < b
}

/**
 * For each position, how many numbers to its RIGHT are on the wrong side of it.
 * Summing this is the inversion count; it is also exactly the tally a child can
 * do by hand, one card at a time, which is why the hint steps quote it.
 */
export function wrongPairsToRight(values: readonly number[], order: Order): number[] {
  return values.map((v, i) => {
    let n = 0
    for (let j = i + 1; j < values.length; j++) if (isWrongPair(v, values[j], order)) n++
    return n
  })
}

/** The answer: how many pairs (adjacent or not) sit in the wrong order. */
export function inversionCount(values: readonly number[], order: Order): number {
  return wrongPairsToRight(values, order).reduce((a, b) => a + b, 0)
}

/** Wrong pairs that happen to be standing side by side — the tempting undercount. */
export function neighbourWrongPairs(values: readonly number[], order: Order): number {
  let n = 0
  for (let i = 0; i + 1 < values.length; i++) if (isWrongPair(values[i], values[i + 1], order)) n++
  return n
}

/**
 * The first wrong pair that is NOT side by side, left-most first. Its existence
 * is exactly what makes the "only count neighbours" answer too small, so the
 * breakdown only offers that trap when this returns a pair.
 */
export function firstDistantWrongPair(
  values: readonly number[],
  order: Order,
): { i: number; j: number; a: number; b: number } | null {
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 2; j < values.length; j++) {
      if (isWrongPair(values[i], values[j], order)) {
        return { i, j, a: values[i], b: values[j] }
      }
    }
  }
  return null
}

/** The row the child is aiming for. */
export function targetRow(values: readonly number[], order: Order): number[] {
  return [...values].sort((a, b) => (order === 'asc' ? a - b : b - a))
}

export interface SwapMove {
  /** Left index of the neighbour pair that traded places. */
  at: number
  /** The two numbers that traded, in the order they stood before the swap. */
  left: number
  right: number
  /** The whole row AFTER this swap. */
  row: number[]
  /** Wrong pairs still left after this swap. */
  remaining: number
}

/**
 * One valid shortest run: repeatedly swap the LEFT-MOST neighbour pair that is
 * out of order. Swapping a wrong neighbour pair removes exactly one wrong pair
 * (it reverses that pair and touches no other), so this run is always exactly
 * `inversionCount` long — the plan can never disagree with the answer.
 */
export function adjacentSwapPlan(values: readonly number[], order: Order): SwapMove[] {
  const row = [...values]
  const moves: SwapMove[] = []
  // Bounded by the inversion count, which is bounded by 21 for a 7-long row.
  for (let guard = 0; guard <= (row.length * (row.length - 1)) / 2; guard++) {
    let at = -1
    for (let i = 0; i + 1 < row.length; i++) {
      if (isWrongPair(row[i], row[i + 1], order)) {
        at = i
        break
      }
    }
    if (at < 0) break
    const left = row[at]
    const right = row[at + 1]
    row[at] = right
    row[at + 1] = left
    moves.push({ at, left, right, row: [...row], remaining: inversionCount(row, order) })
  }
  return moves
}

/**
 * Build a permutation with an EXACT number of wrong pairs from a Lehmer code:
 * `code[i]` = how many still-unplaced numbers that belong before this one end up
 * to its right, so the code sums to the inversion count by construction. No
 * rejection sampling, so `generate` can never emit a row off the target range.
 */
export function lehmerCode(rng: Rng, length: number, inversions: number): number[] {
  const code: number[] = []
  let left = inversions
  for (let i = 0; i < length; i++) {
    const cap = length - 1 - i
    // Capacity still available AFTER this slot, so we never paint ourselves into
    // a corner where the remaining slots cannot absorb what is left.
    const capRest = ((length - 1 - i) * (length - 2 - i)) / 2
    const lo = Math.max(0, left - capRest)
    const hi = Math.min(cap, left)
    const c = rng.int(lo, hi)
    code.push(c)
    left -= c
  }
  return code
}

/** Decode a Lehmer code against the target-ordered row. */
export function decodeLehmer(code: readonly number[], target: readonly number[]): number[] {
  const pool = [...target]
  return code.map((c) => pool.splice(Math.min(c, pool.length - 1), 1)[0])
}

export function generate(rng: Rng): Params {
  const kind = rng.pick(KINDS)
  const order = rng.pick(ORDERS)
  const name = rng.pick(NAMES)
  const length = rng.int(MIN_LEN, MAX_LEN)

  // A row of exactly 1…n reads easiest; wider pools make the comparing real.
  const poolMax = rng.pick([length, length + 3, 20])
  const pool: number[] = []
  for (let v = 1; v <= poolMax; v++) pool.push(v)
  const chosen = rng.shuffle(pool).slice(0, length)

  const target = targetRow(chosen, order)
  // A 4-long row can only hold 6 wrong pairs, so cap the request by the row.
  const ceiling = Math.min(MAX_INVERSIONS, (length * (length - 1)) / 2)
  const inversions = rng.int(MIN_INVERSIONS, ceiling)
  const values = decodeLehmer(lehmerCode(rng, length, inversions), target)

  return { kind, order, name, values }
}

function intro(params: Params, rowText: string): { en: string; id: string } {
  const { kind, name, values } = params
  const n = values.length
  if (kind === 'flags') {
    return {
      en: `${name} lines up ${n} numbered flags in a row — ${rowText}.`,
      id: `${name} memasang ${n} bendera bernomor berjajar — ${rowText}.`,
    }
  }
  if (kind === 'animals') {
    return {
      en: `${name} lines up ${n} animals wearing number bibs — ${rowText}.`,
      id: `${name} membariskan ${n} hewan bernomor punggung — ${rowText}.`,
    }
  }
  return {
    en: `${name} lays ${n} number cards in a row — ${rowText}.`,
    id: `${name} menyusun ${n} kartu angka berjajar — ${rowText}.`,
  }
}

export interface Phrasing {
  rowText: string
  /** "trade two cards that are next to each other" — the swap rule, highlightable. */
  rule_en: string
  rule_id: string
  /** "from the smallest to the largest" — the goal, highlightable. */
  goal_en: string
  goal_id: string
  /** The closing question sentence, highlightable. */
  question_en: string
  question_id: string
  /** "are smaller than" / "lebih kecil" — how a pair is judged wrong. */
  compare_en: string
  compare_id: string
}

export function phrasing(params: Params): Phrasing {
  const { order, name, values, kind } = params
  const { plural_en, plural_id } = KIND_LABELS[kind]
  return {
    rowText: values.join(', '),
    rule_en: `trade two ${plural_en} that are next to each other`,
    rule_id: `menukar dua ${plural_id} yang bersebelahan`,
    goal_en: order === 'asc' ? 'from the smallest to the largest' : 'from the largest to the smallest',
    goal_id: order === 'asc' ? 'dari terkecil ke terbesar' : 'dari terbesar ke terkecil',
    question_en: `What is the fewest swaps ${name} needs?`,
    question_id: `Paling sedikit berapa kali ${name} menukar?`,
    compare_en: order === 'asc' ? 'smaller' : 'bigger',
    compare_id: order === 'asc' ? 'lebih kecil' : 'lebih besar',
  }
}

export function render(params: Params): Rendered {
  const { order, name, values, kind } = params
  const { plural_en, plural_id } = KIND_LABELS[kind]
  const ph = phrasing(params)
  const head = intro(params, ph.rowText)

  const perItem = wrongPairsToRight(values, order)
  const answer = perItem.reduce((a, b) => a + b, 0)
  // The last item has nothing to its right, so it always contributes 0 — quoting
  // it would be noise. Everything before it is quoted, zeros included, so the
  // sum the child sees is the whole sum and not a hand-picked part of it.
  const counted = perItem.slice(0, -1)
  const tally_en = values
    .slice(0, -1)
    .map((v, i) => `${v}→${counted[i]}`)
    .join(', ')
  const sumExpr = counted.join(' + ')

  return {
    body_en:
      `${head.en} ` +
      `In one swap ${name} may only ${ph.rule_en}. ` +
      `${name} wants the numbers to read ${ph.goal_en}. ` +
      `Find: ${ph.question_en}`,
    body_id:
      `${head.id} ` +
      `Dalam satu kali tukar, ${name} hanya boleh ${ph.rule_id}. ` +
      `${name} ingin angkanya urut ${ph.goal_id}. ` +
      `Cari: ${ph.question_id}`,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: `One swap flips exactly one pair, so count every pair that is the wrong way round — that count IS the fewest swaps.`,
    hint_id: `Satu kali tukar hanya membalik satu pasang, jadi hitung semua pasangan yang terbalik — banyaknya itulah jawabannya.`,
    hint_steps_en: [
      `The row must end up ${ph.goal_en}. A swap trades two neighbours, so it flips exactly ONE pair — it can never fix two pairs at once.`,
      `So count the wrong pairs. Take each ${plural_en.replace(/s$/, '')} and count how many numbers to its right are ${ph.compare_en}: ${tally_en}.`,
      `${sumExpr} = ${answer} wrong pairs. Each swap clears exactly one, and a row that is not finished always has a wrong neighbour pair to swap — so ${answer} swaps, and nothing smaller can work.`,
    ],
    hint_steps_id: [
      `Barisnya harus jadi urut ${ph.goal_id}. Satu kali tukar hanya menukar dua tetangga, jadi tepat SATU pasang yang berubah urutannya — tidak pernah dua pasang sekaligus.`,
      `Jadi hitung pasangan yang terbalik. Ambil tiap ${plural_id} dan hitung berapa angka di sebelah kanannya yang ${ph.compare_id}: ${tally_en}.`,
      `${sumExpr} = ${answer} pasang terbalik. Satu tukar membereskan tepat satu pasang, dan selama barisnya belum urut pasti masih ada dua tetangga yang terbalik untuk ditukar — jadi ${answer} kali tukar, dan tidak mungkin kurang.`,
    ],
    breakdown: buildMinAdjacentSwapsBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
