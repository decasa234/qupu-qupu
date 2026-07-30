import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildContainerBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  total: z.number().int().min(20).max(200),
  capacity: z.number().int().min(3).max(20),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'container-capacity-allocation',
  name_en: 'How many containers are needed?',
  name_id: 'Berapa wadah yang diperlukan?',
  grades: [2, 3] as const,
  description_id: 'Bagi jumlah benda dengan kapasitas, lalu bulatkan ke atas karena sisa tetap perlu satu wadah.',
} as const

export const LABELS = ['A', 'B', 'C', 'D'] as const

// The minimum number of containers needed to hold `total` items at `capacity`
// per container — the CEILING of total / capacity (contrast with
// make-groups-leftover, which asks for the FLOOR's remainder instead).
export function boxesNeeded(p: Params): number {
  return Math.ceil(p.total / p.capacity)
}

/**
 * The misconception catalogue. Every wrong option served by this concept is one
 * of these — no random near-misses.
 *
 * - `floorMiss` = answer − 1. Plain floor division: the child divides, sees a
 *   remainder, and reports the quotient, so the leftover items get no box. This
 *   is THE error the concept exists to break, so it is in **every** option set
 *   and it is the `trap.wrong` of the breakdown.
 * - `doubleCount` = answer + 1. Off-by-one the other way: the child rounds up
 *   AND adds another box "for the leftover eggs", not realising the rounding-up
 *   box and the leftover box are the same box.
 * - `boxPerLeftover` = floor + remainder. One whole box per leftover *item* —
 *   "2 eggs are left, so I need 2 more boxes."
 * - `leftoverCount` = remainder. The sibling-question mix-up: the division is
 *   done correctly but the child reports the remainder, i.e. answers
 *   make-groups-leftover ("how many are left over?") instead of this one.
 * - `perBox` = capacity. Reports the number printed in the stem for how many
 *   fit in ONE box, as if that were how many boxes.
 */
export type MisconceptionKind =
  | 'floorMiss'
  | 'doubleCount'
  | 'boxPerLeftover'
  | 'leftoverCount'
  | 'perBox'

function misconceptionValues(p: Params): Record<MisconceptionKind, number> {
  const answer = boxesNeeded(p)
  return {
    floorMiss: answer - 1,
    doubleCount: answer + 1,
    boxPerLeftover: Math.floor(p.total / p.capacity) + (p.total % p.capacity),
    leftoverCount: p.total % p.capacity,
    perBox: p.capacity,
  }
}

// Which trio to serve. Varying the set is what moves the correct answer off a
// fixed slot: a trio that straddles the answer lands it on B or C, and a trio
// that sits entirely below it lands it on D. (A is unreachable on purpose —
// `floorMiss` is always in play and is always smaller than the answer, and
// dropping the headline trap to buy a fourth slot would gut the item.)
const OPTION_SETS: readonly (readonly MisconceptionKind[])[] = [
  ['floorMiss', 'doubleCount', 'leftoverCount'],
  ['floorMiss', 'leftoverCount', 'perBox'],
  ['floorMiss', 'doubleCount', 'boxPerLeftover'],
  ['floorMiss', 'doubleCount', 'perBox'],
]

/**
 * The three wrong options for this instance, as `{ kind: value }`. Which trio a
 * given problem gets is derived from the params, so it is stable per instance
 * without widening the schema. The trailing ladder keeps the four values
 * distinct, integral and ≥ 1 for ANY schema-valid params — including
 * hand-authored ones the generator would never produce.
 */
export function distractors(p: Params): { kind: MisconceptionKind | 'spare'; value: number }[] {
  const answer = boxesNeeded(p)
  const values = misconceptionValues(p)
  const usable = (kinds: readonly MisconceptionKind[]): boolean => {
    const seen = new Set<number>([answer])
    for (const k of kinds) {
      const v = values[k]
      if (!Number.isInteger(v) || v < 1 || seen.has(v)) return false
      seen.add(v)
    }
    return true
  }

  const start = (p.total + p.capacity) % OPTION_SETS.length
  for (let i = 0; i < OPTION_SETS.length; i++) {
    const set = OPTION_SETS[(start + i) % OPTION_SETS.length]
    if (usable(set)) return set.map((kind) => ({ kind, value: values[kind] }))
  }

  // Nothing in the catalogue fits (only reachable on params `generate` rejects,
  // e.g. an exact fit where floorMiss would be 0). Keep the item well-formed by
  // filling the gaps with the first free counts above the answer.
  const taken = new Set<number>([answer])
  const out: { kind: MisconceptionKind | 'spare'; value: number }[] = []
  for (const kind of ['floorMiss', 'doubleCount', 'leftoverCount'] as const) {
    const v = values[kind]
    if (Number.isInteger(v) && v >= 1 && !taken.has(v)) {
      taken.add(v)
      out.push({ kind, value: v })
      continue
    }
    let n = answer + 1
    while (taken.has(n)) n += 1
    taken.add(n)
    out.push({ kind: 'spare', value: n })
  }
  return out
}

// The four option values, ascending. Distinct and positive by construction.
export function optionValues(p: Params): number[] {
  return [boxesNeeded(p), ...distractors(p).map((d) => d.value)].sort((a, b) => a - b)
}

// Never assume a position — the correct count lands on a different letter
// depending on how the three misconception values sort around it.
export function answerLabel(p: Params): string {
  return LABELS[optionValues(p).indexOf(boxesNeeded(p))]
}

export function generate(rng: Rng): Params {
  // 200 draws is far more than enough: only a handful of remainders per
  // capacity are rejected. The literal fallback satisfies every rule below
  // (137 = 15 × 9 + 2 → answer 16, remainder 2 clear of 15/16/17).
  for (let tries = 0; tries < 200; tries++) {
    const capacity = rng.int(3, 20)
    const total = rng.int(20, 200)
    const remainder = total % capacity
    // A genuine leftover is the whole point — an exact fit teaches nothing.
    if (remainder === 0) continue
    const answer = Math.ceil(total / capacity)
    // Keep the remainder usable as the "answered the sibling question" option:
    // reject params where it collides with the answer or either off-by-one.
    if (remainder >= answer - 1 && remainder <= answer + 1) continue
    return { total, capacity }
  }
  return { total: 137, capacity: 9 }
}

export function render(params: Params) {
  const { total, capacity } = params
  const answer = boxesNeeded(params)
  const floor = Math.floor(total / capacity)
  const remainder = total % capacity

  const choices: WmiChoice[] = optionValues(params).map((v, i) => ({
    label: LABELS[i],
    text: String(v),
  }))
  const label = answerLabel(params)

  const hint_steps_en = [
    `${total} ÷ ${capacity} = ${floor} remainder ${remainder}.`,
    `The leftover ${remainder} still needs one more box, so ${floor} + 1 = ${answer}.`,
  ]
  const hint_steps_id = [
    `${total} ÷ ${capacity} = ${floor} sisa ${remainder}.`,
    `Sisa ${remainder} tetap butuh satu wadah lagi, jadi ${floor} + 1 = ${answer}.`,
  ]

  return {
    body_en: `There are ${total} eggs to pack. Each box holds ${capacity} eggs.\n\nFind: How many boxes are needed so that every egg is packed?`,
    body_id: `Ada ${total} telur yang akan dikemas. Setiap kotak memuat ${capacity} telur.\n\nCari: Berapa kotak yang diperlukan agar semua telur terkemas?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: label,
    hint_en: 'Divide the total by the capacity, then round up so the leftover items still get a box.',
    hint_id: 'Bagi jumlah total dengan kapasitas, lalu bulatkan ke atas agar sisa benda tetap punya wadah.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildContainerBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
