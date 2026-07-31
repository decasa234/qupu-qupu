import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildDeleteDigitsExtremiseBreakdown } from './breakdown.js'

// Delete exactly k digits from a long strip of digits so that what is LEFT — read
// in its ORIGINAL order — is as big (or as small) as possible.
//
// The single fact this concept lives or dies on: deleting never REORDERS. The
// answer is a SUBSEQUENCE of the strip, not a permutation of its digits. A child
// (and a careless adult) will grab the `keep` biggest digits and line them up
// sorted; that is almost always a number the strip cannot produce.
//
// The answer is computed twice, independently, and the two must agree:
//   1. `extremiseByStack` — the standard monotonic-stack greedy.
//   2. `selectionPicks`   — the leading-digit walk ("take the best digit that
//      still leaves enough digits behind it"), which is what the hints and the
//      explainer narrate. Narrating a method that is not the method that
//      produced the number is exactly how a right answer gets a wrong argument.
export const ASKS = ['the-number', 'digit-sum-of-middle-three'] as const
export type Ask = (typeof ASKS)[number]

export const OBJECTIVES = ['max', 'min'] as const
export type Objective = (typeof OBJECTIVES)[number]

export const SOURCES = ['explicit', 'concat'] as const
export type Source = (typeof SOURCES)[number]

/**
 * The `digit-sum-of-middle-three` ask is only well defined on an odd-length
 * result, so it is pinned to 5 kept digits — "the three middle digits" are then
 * exactly positions 2, 3 and 4, matching the 2020-final-g3 #15 wording.
 */
export const MIDDLE_THREE_KEEP = 5

/** "1", "12", "123", … — the 1..n concatenation used by the `concat` source. */
export function concatDigits(upTo: number): string {
  let out = ''
  for (let n = 1; n <= upTo; n++) out += String(n)
  return out
}

const paramsSchema = z
  .object({
    source: z.enum(SOURCES),
    /** The strip the child reads. Never starts with 0. */
    digits: z.string().regex(/^[1-9][0-9]{7,16}$/),
    /** Only for `source: 'concat'`: the strip is the numbers 1..concatTo written side by side. */
    concatTo: z.number().int().min(10).max(13).nullable(),
    k: z.number().int().min(1).max(15),
    objective: z.enum(OBJECTIVES),
    ask: z.enum(ASKS),
  })
  .refine((v) => v.digits.length - v.k >= 4, {
    message: 'at least 4 digits must survive, or there is nothing to compare',
  })
  .refine(
    (v) =>
      v.source === 'concat'
        ? v.concatTo !== null && v.digits === concatDigits(v.concatTo)
        : v.concatTo === null,
    { message: 'a concat strip must literally be 1..concatTo; an explicit strip carries no concatTo' },
  )
  .refine((v) => v.ask !== 'digit-sum-of-middle-three' || v.digits.length - v.k === MIDDLE_THREE_KEEP, {
    message: 'the middle-three ask needs exactly 5 surviving digits',
  })
  // LEADING-ZERO POLICY. Deleting for the SMALLEST number can legitimately strand
  // a 0 at the front ("03312"), which reads as a 4-digit number and makes the
  // question ambiguous for a 2nd-grader. Rather than bolt a special case onto the
  // greedy, `min` strips simply contain no 0 at all — so the smallest result can
  // never begin with 0. `max` strips may contain 0 (the 1..n concatenation does),
  // and a max result can never start with 0 because the first digit of the strip
  // is itself non-zero and always sits inside the first window.
  .refine((v) => v.objective !== 'min' || !v.digits.includes('0'), {
    message: 'a smallest-number strip must contain no 0, so the answer cannot start with 0',
  })
  .refine(
    (v) => {
      if (v.digits.length - v.k < 4) return true // already reported above
      return solve(v).result[0] !== '0'
    },
    { message: 'the surviving number must not start with 0' },
  )
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'delete-digits-extremise',
  name_en: 'Delete digits to make the biggest number',
  name_id: 'Hapus beberapa angka agar jadi paling besar',
  grades: [2, 3] as const,
  description_id:
    'Menghapus beberapa angka dari deretan panjang tanpa mengubah urutan angka yang tersisa, agar sisanya membentuk bilangan terbesar (atau terkecil).',
} as const

// ── The two independent solvers ──────────────────────────────────────────────

/** True when the digit currently held should be dropped in favour of `next`. */
function outranked(held: string, next: string, objective: Objective): boolean {
  return objective === 'max' ? held < next : held > next
}

/**
 * Standard monotonic-stack greedy: sweep left to right and, while you still have
 * deletions left, drop the digit you are holding whenever the next digit beats
 * it. Leftover budget comes off the tail (which is already monotonic).
 */
export function extremiseByStack(digits: string, k: number, objective: Objective): string {
  const keep = digits.length - k
  const stack: string[] = []
  let budget = k
  for (const d of digits) {
    while (budget > 0 && stack.length > 0 && outranked(stack[stack.length - 1], d, objective)) {
      stack.pop()
      budget -= 1
    }
    stack.push(d)
  }
  return stack.slice(0, keep).join('')
}

/** One kept digit: where it was allowed to come from, and where it came from. */
export interface Pick {
  slot: number
  /** Window of positions this slot could take, inclusive. */
  from: number
  to: number
  index: number
  digit: string
  /** Digits skipped over (deleted) to reach `index`. */
  deleted: number
}

/**
 * The same answer, told as leading-digit reasoning: the front digit is worth the
 * most, so make it as extreme as possible — but it must still leave enough
 * digits standing behind it to fill the remaining slots. Then repeat on the rest.
 * Window width is always `budgetLeft + 1`, so once the budget is spent every
 * remaining slot is forced.
 */
export function selectionPicks(digits: string, k: number, objective: Objective): Pick[] {
  const keep = digits.length - k
  const picks: Pick[] = []
  let start = 0
  for (let slot = 0; slot < keep; slot++) {
    const to = digits.length - (keep - slot)
    let best = start
    for (let i = start + 1; i <= to; i++) {
      if (objective === 'max' ? digits[i] > digits[best] : digits[i] < digits[best]) best = i
    }
    picks.push({ slot, from: start, to, index: best, digit: digits[best], deleted: best - start })
    start = best + 1
  }
  return picks
}

export interface Solution {
  keep: number
  /** The extremised number, as a digit string. */
  result: string
  picks: Pick[]
  /** Slots where a real choice existed (window wider than 1). Always a prefix. */
  choiceSlots: Pick[]
  /** Slots the spent budget forced. Always the suffix. */
  forcedSlots: Pick[]
  /** Digits trimmed off the back after the last pick (leftover budget). */
  tailDeleted: number
  middle: string[]
  middleSum: number
  answer: string
}

/** Index of the first of the three middle digits of a `keep`-digit result. */
export function middleStart(keep: number): number {
  return Math.max(0, Math.floor((keep - 3) / 2))
}

/**
 * The minimum shape `solve` needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls solve(): taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself.
 * `comparison-chain-solve` uses the same trick with its `ChainShape`.
 * The two optional fields exist only so a whole Params object can be passed
 * straight in without tripping TypeScript's excess-property check.
 */
export interface SolvableDigits {
  digits: string
  k: number
  objective: Objective
  ask: Ask
  /** Carried so a whole Params object can be passed straight in. Unused here. */
  source?: Source
  concatTo?: number | null
}

export function solve(params: SolvableDigits): Solution {
  const { digits, k, objective, ask } = params
  const keep = digits.length - k
  const result = extremiseByStack(digits, k, objective)
  const picks = selectionPicks(digits, k, objective)
  const walked = picks.map((p) => p.digit).join('')
  // Two methods, one answer. If they ever disagree the concept is broken and it
  // is far better to fail loudly than to narrate a walk that lands somewhere else.
  if (walked !== result) {
    throw new Error(
      `delete-digits-extremise: greedy disagreement on ${digits} (stack ${result}, walk ${walked})`,
    )
  }
  const last = picks[picks.length - 1]
  const tailDeleted = digits.length - (last.index + 1)
  const start = middleStart(keep)
  const middle = keep >= 3 ? result.slice(start, start + 3).split('') : []
  const middleSum = middle.reduce((sum, d) => sum + Number(d), 0)

  return {
    keep,
    result,
    picks,
    choiceSlots: picks.filter((p) => p.to > p.from),
    forcedSlots: picks.filter((p) => p.to === p.from),
    tailDeleted,
    middle,
    middleSum,
    answer: ask === 'the-number' ? result : String(middleSum),
  }
}

// ── The trap: sort the best digits instead of keeping their order ────────────

/** The `keep` most extreme digits by VALUE, lined up sorted — order thrown away. */
export function trapNumber(digits: string, keep: number, objective: Objective): string {
  const sorted = digits.split('').sort()
  const chosen = objective === 'max' ? sorted.slice(sorted.length - keep).reverse() : sorted.slice(0, keep)
  return chosen.join('')
}

export interface Trap {
  number: string
  answer: string
}

export function trapFor(params: Params, keep: number): Trap {
  const num = trapNumber(params.digits, keep, params.objective)
  if (params.ask === 'the-number') return { number: num, answer: num }
  const start = middleStart(keep)
  const mid = num.slice(start, start + 3).split('')
  return { number: num, answer: String(mid.reduce((sum, d) => sum + Number(d), 0)) }
}

// ── Generation ───────────────────────────────────────────────────────────────

function draft(rng: Rng): Params {
  const ask = rng.pick(ASKS)
  const objective = rng.pick(OBJECTIVES)
  // A `min` strip must be 0-free (see the leading-zero policy above) and the
  // 1..n concatenation always contains a 0, so smallest-number questions always
  // use an explicit strip.
  const source: Source = objective === 'min' ? 'explicit' : rng.pick(SOURCES)

  if (source === 'concat') {
    const concatTo = rng.int(10, 13)
    const digits = concatDigits(concatTo)
    const keep = ask === 'digit-sum-of-middle-three' ? MIDDLE_THREE_KEEP : rng.int(5, 6)
    return { source, digits, concatTo, k: digits.length - keep, objective: 'max', ask }
  }

  const len = rng.int(8, 11)
  const keep = ask === 'digit-sum-of-middle-three' ? MIDDLE_THREE_KEEP : rng.int(4, 6)
  const lowest = objective === 'min' ? 1 : 0
  const cells = [String(rng.int(1, 9))]
  for (let i = 1; i < len; i++) cells.push(String(rng.int(lowest, 9)))
  return { source, digits: cells.join(''), concatTo: null, k: len - keep, objective, ask }
}

/**
 * Quality filter, not a correctness rule — every draft is already valid. It
 * rejects the boring shapes: answers that are just the front of the strip, or
 * just the back (so "delete the first k" would have worked), and strips where
 * the sorted-digits trap happens to land on the right answer (which would make
 * the wrong reasoning look right).
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (s.result === p.digits.slice(0, s.keep)) return false
  if (s.result === p.digits.slice(p.digits.length - s.keep)) return false
  const trap = trapFor(p, s.keep)
  if (trap.number === s.result || trap.answer === s.answer) return false
  // At least two slots where the child actually had to choose.
  return s.choiceSlots.length >= 2
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidate = draft(rng)
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  return first as Params
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** English needs "1 digit" but "4 digits"; Indonesian needs neither. */
export const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

export function render(params: Params): Rendered {
  const { digits, k, objective, ask, source, concatTo } = params
  const s = solve(params)
  const { keep, result, picks } = s
  const breakdown = buildDeleteDigitsExtremiseBreakdown(params)
  const big = objective === 'max'
  const superlative_en = big ? 'largest' : 'smallest'
  const superlative_id = big ? 'terbesar' : 'terkecil'
  const best_en = big ? 'biggest' : 'smallest'
  const window = (p: Pick) => digits.slice(p.from, p.to + 1)

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const intro_en =
    source === 'concat'
      ? `Write the whole numbers from 1 to ${concatTo} side by side to make the long number ${digits}. Delete ${plural(k, 'digit', 'digits')}`
      : `Delete ${plural(k, 'digit', 'digits')} from the number ${digits}`
  const intro_id =
    source === 'concat'
      ? `Tulis bilangan 1 sampai ${concatTo} berjajar menjadi bilangan panjang ${digits}. Hapus ${k} angka`
      : `Hapus ${k} angka dari bilangan ${digits}`

  const body_en =
    ask === 'the-number'
      ? `${intro_en} so that the digits left keep their original order. Find: What is the ${superlative_en} number that can be left?`
      : `${intro_en} so that the ${keep} digits left keep their original order and make the ${superlative_en} number. Find: What is the sum of the three middle digits of that number?`
  const body_id =
    ask === 'the-number'
      ? `${intro_id} sehingga angka yang tersisa tetap urutannya. Cari: Berapa bilangan ${superlative_id} yang bisa tersisa?`
      : `${intro_id} sehingga ${keep} angka yang tersisa tetap urutannya dan membentuk bilangan ${superlative_id}. Cari: Berapa jumlah tiga angka tengah dari bilangan itu?`

  // ── hint_steps: the leading-digit walk, applied to THIS strip, step by step.
  // Every line is generated from `picks`, so the trail always lands on `result`.
  const head = picks[0]
  const rest = s.choiceSlots.slice(1)
  const forced = s.forcedSlots

  const steps_en: string[] = [
    `Delete exactly ${plural(k, 'digit', 'digits')} of ${digits}. The ${keep} digits left stay in the order they are written — deleting never lets you move a digit.`,
    `The front digit is worth the most, so make it as ${best_en} as you can. It still needs ${plural(keep - 1, 'digit', 'digits')} standing behind it, so it can only come from the first ${plural(head.to + 1, 'digit', 'digits')}, ${window(head)}. The ${best_en} there is ${head.digit}` +
      (head.deleted > 0
        ? `, so keep it and delete the ${plural(head.deleted, 'digit', 'digits')} in front of it.`
        : `, and it is already at the front, so nothing goes yet.`),
  ]
  const tail_en: string[] = []
  if (rest.length > 0) {
    tail_en.push(rest.map((p) => `from ${window(p)} take ${p.digit}`).join('; '))
  }
  if (forced.length > 0) {
    tail_en.push(
      `all ${k} deletions are used up, so the last ${plural(forced.length, 'digit', 'digits')} (${forced.map((p) => p.digit).join('')}) simply stay`,
    )
  }
  if (s.tailDeleted > 0) {
    tail_en.push(
      `the ${plural(s.tailDeleted, 'digit', 'digits')} hanging off the back are deleted with the deletions still unused`,
    )
  }
  if (tail_en.length > 0) steps_en.push(`Same rule on what is left: ${tail_en.join('; then ')}.`)
  steps_en.push(`Reading the digits still standing, left to right: ${result}.`)
  if (ask === 'digit-sum-of-middle-three') {
    steps_en.push(
      `The three middle digits of ${result} are ${s.middle[0]}, ${s.middle[1]} and ${s.middle[2]}, so ${s.middle.join(' + ')} = ${s.middleSum}.`,
    )
  }

  const steps_id: string[] = [
    `Hapus tepat ${k} angka dari ${digits}. ${keep} angka yang tersisa tetap pada urutan aslinya — menghapus tidak pernah boleh memindahkan angka.`,
    `Angka paling depan paling menentukan, jadi buat angka depan se${big ? 'besar' : 'kecil'} mungkin. Di belakangnya masih harus ada ${keep - 1} angka, jadi angka depan hanya boleh diambil dari ${head.to + 1} angka pertama, yaitu ${window(head)}. Yang ${superlative_id} di situ adalah ${head.digit}` +
      (head.deleted > 0
        ? `, jadi simpan itu dan hapus ${head.deleted} angka di depannya.`
        : `, dan sudah paling depan, jadi belum ada yang dihapus.`),
  ]
  const tail_id: string[] = []
  if (rest.length > 0) {
    tail_id.push(rest.map((p) => `dari ${window(p)} ambil ${p.digit}`).join('; '))
  }
  if (forced.length > 0) {
    tail_id.push(
      `${k} hapusan sudah habis, jadi ${forced.length} angka terakhir (${forced.map((p) => p.digit).join('')}) tinggal ikut apa adanya`,
    )
  }
  if (s.tailDeleted > 0) {
    tail_id.push(`${s.tailDeleted} angka yang menggantung di belakang dihapus dengan sisa hapusan`)
  }
  if (tail_id.length > 0) steps_id.push(`Aturan yang sama untuk sisanya: ${tail_id.join('; lalu ')}.`)
  steps_id.push(`Angka yang masih berdiri, dibaca dari kiri ke kanan: ${result}.`)
  if (ask === 'digit-sum-of-middle-three') {
    steps_id.push(
      `Tiga angka tengah dari ${result} adalah ${s.middle[0]}, ${s.middle[1]}, dan ${s.middle[2]}, jadi ${s.middle.join(' + ')} = ${s.middleSum}.`,
    )
  }

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en: `Deleting never moves a digit. Spend your deletions to pull the ${best_en} digit you can reach to the front — but always leave enough digits standing behind it.`,
    hint_id: `Menghapus tidak pernah memindahkan angka. Pakai hapusanmu untuk membawa angka ${superlative_id} yang bisa dijangkau ke depan — tapi selalu sisakan cukup angka di belakangnya.`,
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
