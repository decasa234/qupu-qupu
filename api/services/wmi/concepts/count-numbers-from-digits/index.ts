import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildCountNumbersFromDigitsBreakdown } from './breakdown.js'

// Systematic counting: from a small pool of digits, how many k-digit numbers
// obeying one rule can you build? The whole concept is the METHOD — lock the
// first digit, count the ways to fill what is left, then add the branches —
// plus the rule a child forgets every single time: a k-digit number can never
// start with 0. Both the answer and the tempting wrong answer come out of a
// plain enumeration below, never a formula, so the text can never disagree
// with the number.

export const ASKS = ['how-many', 'the-nth', 'gap-between-nth-and-mth'] as const
export type Ask = (typeof ASKS)[number]

export const ENDS = ['smallest', 'largest'] as const
export type End = (typeof ENDS)[number]

// `first-bigger` and `digit-sum` are the two digit-relation flavours; they are
// separate kinds so no member of the union ever carries an optional field.
export const FILTER_KINDS = ['even', 'odd', 'div-by', 'in-range', 'first-bigger', 'digit-sum'] as const
export type FilterKind = (typeof FILTER_KINDS)[number]

const filterSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('even') }),
  z.object({ kind: z.literal('odd') }),
  z.object({ kind: z.literal('div-by'), m: z.union([z.literal(3), z.literal(4), z.literal(5)]) }),
  z.object({
    kind: z.literal('in-range'),
    lo: z.number().int().min(10).max(999),
    hi: z.number().int().min(10).max(999),
  }),
  z.object({ kind: z.literal('first-bigger') }),
  z.object({ kind: z.literal('digit-sum'), v: z.number().int().min(1).max(27) }),
])
export type Filter = z.infer<typeof filterSchema>

// `length` is a bounded integer rather than z.union([z.literal(2), z.literal(3)]).
// It has to be: in zod 4 a property whose schema is a union infers as OPTIONAL,
// so `Params['length']` came out `length?: 2 | 3` and could not be handed to a
// helper wanting `length: number`. Reproduced in isolation — nothing to do with
// this file. The runtime constraint is identical.
//
// The base object is kept separate from the refinements below only so `Params`
// can be inferred from it directly.
const baseSchema = z
  .object({
    /** The digit pool, distinct and listed smallest-first exactly as the body prints it. */
    digits: z.array(z.number().int().min(0).max(9)).min(2).max(5),
    /** How many places the built number has. */
    length: z.number().int().min(2).max(3),
    repeats: z.boolean(),
    filter: filterSchema,
    ask: z.enum(ASKS),
    /** Only read by the 'the-nth' ask: which end of the sorted list to count from. */
    from: z.enum(ENDS),
    /** Rank counted from the SMALLEST end. Read by 'the-nth' and the gap ask. */
    nth: z.number().int().min(1).max(4),
    /** Rank counted from the LARGEST end. Only read by the gap ask. */
    mth: z.number().int().min(1).max(4),
  })
const paramsSchema = baseSchema
  .refine((v) => new Set(v.digits).size === v.digits.length, {
    message: 'the digit pool must not repeat a digit',
  })
  .refine((v) => v.digits.every((d, i) => i === 0 || v.digits[i - 1] < d), {
    message: 'the digit pool must be listed smallest-first',
  })
  .refine((v) => v.digits.some((d) => d !== 0), {
    message: 'the pool needs at least one non-zero digit, or nothing can be built',
  })
  .refine((v) => v.repeats || v.digits.length >= v.length, {
    message: 'without repeats there must be at least as many digits as places',
  })
  .refine((v) => v.filter.kind !== 'in-range' || v.filter.lo <= v.filter.hi, {
    message: 'an in-range filter needs lo ≤ hi',
  })
  .refine((v) => qualifying(v, v.filter).length >= 1, {
    message: 'at least one number must actually be buildable',
  })
  .refine((v) => v.ask !== 'the-nth' || v.nth <= qualifying(v, v.filter).length, {
    message: 'the-nth cannot ask for a rank the list does not reach',
  })
  .refine(
    (v) => v.ask !== 'gap-between-nth-and-mth' || v.nth + v.mth <= qualifying(v, v.filter).length,
    { message: 'the gap ask needs the two picks to be different numbers' },
  )
// Inferred from the base object; .refine() leaves the output type untouched.
export type Params = z.infer<typeof baseSchema>

export const meta = {
  slug: 'count-numbers-from-digits',
  name_en: 'How many numbers can be formed',
  name_id: 'Berapa banyak bilangan yang bisa dibentuk',
  grades: [2, 3] as const,
  description_id:
    'Menghitung dengan rapi ada berapa bilangan yang bisa disusun dari sekumpulan angka dengan satu syarat: kunci angka pertama, hitung isian tempat sisanya, lalu jumlahkan. Ingat, tempat pertama tidak boleh diisi 0.',
} as const

// --- enumeration --------------------------------------------------------------
// Everything downstream (answer, trap, hint steps, breakdown) is read off these
// two walks. No closed-form counting anywhere.

export interface DigitPool {
  digits: number[]
  length: number
  repeats: boolean
}

export function numberOf(ds: number[]): number {
  return ds.reduce((n, d) => n * 10 + d, 0)
}

/**
 * Every ordered way to fill the `length` places from the pool.
 * `allowLeadingZero` exists ONLY so the generator can measure the classic
 * over-count; the real answer always walks with it false, because a k-digit
 * number can never begin with 0.
 */
export function tuples(pool: DigitPool, allowLeadingZero: boolean): number[][] {
  const out: number[][] = []
  const seen = new Set<string>()
  const current: number[] = []
  const used = pool.digits.map(() => false)

  const walk = (): void => {
    if (current.length === pool.length) {
      const key = current.join('')
      if (!seen.has(key)) {
        seen.add(key)
        out.push(current.slice())
      }
      return
    }
    for (let i = 0; i < pool.digits.length; i++) {
      if (!pool.repeats && used[i]) continue
      const d = pool.digits[i]
      if (current.length === 0 && d === 0 && !allowLeadingZero) continue
      used[i] = true
      current.push(d)
      walk()
      current.pop()
      used[i] = false
    }
  }

  if (pool.length > 0 && pool.digits.length > 0) walk()
  return out
}

export function passes(f: Filter, ds: number[], n: number): boolean {
  switch (f.kind) {
    case 'even':
      return n % 2 === 0
    case 'odd':
      return n % 2 === 1
    case 'div-by':
      return n % f.m === 0
    case 'in-range':
      return n >= f.lo && n <= f.hi
    case 'first-bigger':
      return ds[0] > ds[ds.length - 1]
    case 'digit-sum':
      return ds.reduce((a, b) => a + b, 0) === f.v
  }
}

/** Every k-digit arrangement, rule ignored — what a child counts when they forget it. */
export function arrangements(pool: DigitPool): number[] {
  return tuples(pool, false)
    .map(numberOf)
    .sort((a, b) => a - b)
}

/** The real answer set: k-digit arrangements that obey the rule, smallest first. */
export function qualifying(pool: DigitPool, f: Filter): number[] {
  return tuples(pool, false)
    .filter((ds) => passes(f, ds, numberOf(ds)))
    .map(numberOf)
    .sort((a, b) => a - b)
}

/**
 * Arrangements that would obey the rule but start with 0 — "058" for an even
 * rule. They are NOT k-digit numbers, so they are excluded; counting them is
 * the single most common mistake in this concept.
 */
export function leadingZeroStrings(pool: DigitPool, f: Filter): string[] {
  return tuples(pool, true)
    .filter((ds) => ds[0] === 0 && passes(f, ds, numberOf(ds)))
    .map((ds) => ds.join(''))
    .sort()
}

export interface Branch {
  d: number
  values: number[]
}

export type TrapKind = 'leading-zero' | 'ignored-rule'

export interface Solution {
  /** Qualifying k-digit numbers, ascending. */
  set: number[]
  /** All k-digit arrangements, rule ignored, ascending. */
  all: number[]
  /** Digits allowed in the first place: the pool minus 0. */
  firstDigits: number[]
  /** The set split by its leading digit — the counting method, made visible. */
  branches: Branch[]
  /** Rule-obeying arrangements that illegally start with 0, as digit strings. */
  phantoms: string[]
  answer: string
  trap: { kind: TrapKind; wrong: string } | null
}

/** Reads the asked-for value off an already-sorted list. Null when out of range. */
export function readAnswer(p: Params, list: number[]): number | null {
  if (p.ask === 'how-many') return list.length
  if (p.ask === 'the-nth') {
    const i = p.from === 'smallest' ? p.nth - 1 : list.length - p.nth
    return i >= 0 && i < list.length ? list[i] : null
  }
  const big = list[list.length - p.mth]
  const small = list[p.nth - 1]
  if (big === undefined || small === undefined || list.length - p.mth <= p.nth - 1) return null
  return big - small
}

export function solve(p: Params): Solution {
  const set = qualifying(p, p.filter)
  const all = arrangements(p)
  const firstDigits = p.digits.filter((d) => d !== 0)
  const branches: Branch[] = firstDigits.map((d) => ({
    d,
    values: set.filter((n) => String(n)[0] === String(d)),
  }))
  const phantoms = leadingZeroStrings(p, p.filter)

  const answerNumber = readAnswer(p, set)
  if (answerNumber === null) {
    throw new Error(`count-numbers-from-digits: ask "${p.ask}" cannot be read off a ${set.length}-long list`)
  }
  const answer = String(answerNumber)

  // Both traps are computed by re-running the SAME reader over a wrong list, so
  // a "tempting answer" is always a number a child could really land on.
  let trap: Solution['trap'] = null
  if (phantoms.length > 0) {
    const withZeros = [...set, ...phantoms.map((s) => Number(s))].sort((a, b) => a - b)
    const wrong = readAnswer(p, withZeros)
    if (wrong !== null && String(wrong) !== answer) trap = { kind: 'leading-zero', wrong: String(wrong) }
  }
  if (trap === null && all.length !== set.length) {
    const wrong = readAnswer(p, all)
    if (wrong !== null && String(wrong) !== answer) trap = { kind: 'ignored-rule', wrong: String(wrong) }
  }

  return { set, all, firstDigits, branches, phantoms, answer, trap }
}

// --- wording -------------------------------------------------------------------

export function listId(values: number[]): string {
  if (values.length <= 1) return values.join('')
  // Indonesian takes no comma before "dan" when there are only two items.
  if (values.length === 2) return `${values[0]} dan ${values[1]}`
  return `${values.slice(0, -1).join(', ')}, dan ${values[values.length - 1]}`
}

export function listEn(values: number[]): string {
  if (values.length <= 1) return values.join('')
  return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`
}

export function ordEn(n: number): string {
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`
}

/** "yang genap" — the rule clause exactly as it sits in the body. */
export function ruleClauseId(f: Filter): string {
  switch (f.kind) {
    case 'even':
      return 'yang genap'
    case 'odd':
      return 'yang ganjil'
    case 'div-by':
      return `yang habis dibagi ${f.m}`
    case 'in-range':
      return `yang nilainya dari ${f.lo} sampai ${f.hi}`
    case 'first-bigger':
      return 'yang angka pertamanya lebih besar daripada angka terakhirnya'
    case 'digit-sum':
      return `yang jumlah semua angkanya ${f.v}`
  }
}

export function ruleClauseEn(f: Filter): string {
  switch (f.kind) {
    case 'even':
      return 'that are even'
    case 'odd':
      return 'that are odd'
    case 'div-by':
      return `that are divisible by ${f.m}`
    case 'in-range':
      return `whose value is from ${f.lo} to ${f.hi}`
    case 'first-bigger':
      return 'whose first digit is bigger than the last digit'
    case 'digit-sum':
      return `whose digits add up to ${f.v}`
  }
}

/**
 * The same rule as a bare predicate, so hint steps can say "simpan yang <rule>"
 * / "keep only the ones that are <rule>" without re-wording per filter.
 */
export function ruleShortId(f: Filter): string {
  switch (f.kind) {
    case 'even':
      return 'genap'
    case 'odd':
      return 'ganjil'
    case 'div-by':
      return `habis dibagi ${f.m}`
    case 'in-range':
      return `nilainya dari ${f.lo} sampai ${f.hi}`
    case 'first-bigger':
      return 'angka pertamanya lebih besar daripada angka terakhirnya'
    case 'digit-sum':
      return `jumlah angkanya ${f.v}`
  }
}

export function ruleShortEn(f: Filter): string {
  switch (f.kind) {
    case 'even':
      return 'even'
    case 'odd':
      return 'odd'
    case 'div-by':
      return `divisible by ${f.m}`
    case 'in-range':
      return `in the range ${f.lo} to ${f.hi}`
    case 'first-bigger':
      return 'bigger in front than at the back'
    case 'digit-sum':
      return `made of digits adding up to ${f.v}`
  }
}

export function smallestPhraseId(n: number): string {
  return n === 1 ? 'bilangan terkecil' : `bilangan terkecil ke-${n}`
}
export function largestPhraseId(n: number): string {
  return n === 1 ? 'bilangan terbesar' : `bilangan terbesar ke-${n}`
}
export function smallestPhraseEn(n: number): string {
  return n === 1 ? 'smallest number' : `${ordEn(n)} smallest number`
}
export function largestPhraseEn(n: number): string {
  return n === 1 ? 'largest number' : `${ordEn(n)} largest number`
}

export function questionId(p: Params): string {
  if (p.ask === 'how-many') return 'Ada berapa bilangan yang bisa dibentuk?'
  if (p.ask === 'the-nth') {
    return `Berapa ${p.from === 'smallest' ? smallestPhraseId(p.nth) : largestPhraseId(p.nth)}?`
  }
  return `Berapa selisih ${largestPhraseId(p.mth)} dan ${smallestPhraseId(p.nth)}?`
}

export function questionEn(p: Params): string {
  if (p.ask === 'how-many') return 'How many such numbers can be formed?'
  if (p.ask === 'the-nth') {
    return `What is the ${p.from === 'smallest' ? smallestPhraseEn(p.nth) : largestPhraseEn(p.nth)}?`
  }
  return `What is the difference between the ${largestPhraseEn(p.mth)} and the ${smallestPhraseEn(p.nth)}?`
}

export function repeatsClauseId(repeats: boolean): string {
  return repeats ? 'Satu angka boleh dipakai lebih dari satu kali.' : 'Setiap angka hanya boleh dipakai satu kali.'
}
export function repeatsClauseEn(repeats: boolean): string {
  return repeats ? 'A digit may be used more than once.' : 'Each digit may be used only once.'
}

/** "bilangan 3 angka" / "3-digit numbers" — the phrase that hides the no-leading-zero rule. */
export function shapePhraseId(length: number): string {
  return `bilangan ${length} angka`
}
export function shapePhraseEn(length: number): string {
  return `${length}-digit numbers`
}

export function poolPhraseId(digits: number[]): string {
  return `angka ${listId(digits)}`
}
export function poolPhraseEn(digits: number[]): string {
  return `the digits ${listEn(digits)}`
}

function joinNumbers(values: number[], cap: number): string {
  if (values.length === 0) return '—'
  if (values.length <= cap) return values.join(', ')
  return `${values.slice(0, cap).join(', ')}, …`
}

// --- generation ----------------------------------------------------------------

function pickPool(rng: Rng, size: number, withZero: boolean): number[] {
  const nonZero = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  const chosen = nonZero.slice(0, withZero ? size - 1 : size)
  if (withZero) chosen.push(0)
  return chosen.sort((a, b) => a - b)
}

function pickFilter(rng: Rng, kind: FilterKind, universe: number[][]): Filter | null {
  if (kind === 'even') return { kind: 'even' }
  if (kind === 'odd') return { kind: 'odd' }
  if (kind === 'div-by') return { kind: 'div-by', m: rng.pick([3, 4, 5] as const) }
  if (kind === 'first-bigger') return { kind: 'first-bigger' }
  if (kind === 'digit-sum') {
    const t = rng.pick(universe)
    return { kind: 'digit-sum', v: t.reduce((a, b) => a + b, 0) }
  }
  // in-range: both ends land on real arrangements, and the wording says "from …
  // to …" (inclusive), so there is never an off-by-one to argue about.
  const values = universe.map(numberOf).sort((a, b) => a - b)
  if (values.length < 4) return null
  const i = rng.int(0, values.length - 4)
  const j = rng.int(i + 2, values.length - 1)
  return { kind: 'in-range', lo: values[i], hi: values[j] }
}

// The 2019 WMI semifinal grade-3 question, kept as the unreachable fallback so
// generate() can never return something unvalidated.
const FALLBACK: Params = {
  digits: [5, 6, 7, 8],
  length: 3,
  repeats: false,
  filter: { kind: 'even' },
  ask: 'how-many',
  from: 'smallest',
  nth: 1,
  mth: 1,
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 900; attempt++) {
    const ask = rng.pick(ASKS)
    const kind = rng.pick(FILTER_KINDS)
    const repeats = rng.int(1, 4) === 1
    const length = rng.pick([2, 3] as const)
    const poolSize = repeats ? rng.int(2, 4) : rng.int(Math.max(3, length), 5)
    const withZero = rng.int(1, 3) === 1
    const digits = pickPool(rng, poolSize, withZero)
    if (digits.length < 2) continue
    if (!digits.some((d) => d !== 0)) continue
    if (!repeats && digits.length < length) continue

    const pool: DigitPool = { digits, length, repeats }
    const universe = tuples(pool, false)
    if (universe.length < 4) continue

    const filter = pickFilter(rng, kind, universe)
    if (filter === null) continue

    const set = qualifying(pool, filter)
    // A rule that keeps everything teaches nothing; a set of 1–2 is not counting.
    if (set.length === universe.length) continue
    const ceiling = ask === 'how-many' ? 30 : 12
    if (set.length < 3 || set.length > ceiling) continue

    if (ask === 'the-nth') {
      const from = rng.pick(ENDS)
      const nth = rng.int(1, Math.min(4, set.length))
      return { digits, length, repeats, filter, ask, from, nth, mth: 1 }
    }
    if (ask === 'gap-between-nth-and-mth') {
      const nth = rng.int(1, 3)
      const mth = rng.int(1, 3)
      if (nth + mth > set.length) continue
      return { digits, length, repeats, filter, ask, from: 'smallest', nth, mth }
    }
    return { digits, length, repeats, filter, ask, from: 'smallest', nth: 1, mth: 1 }
  }
  return FALLBACK
}

// --- hint steps ----------------------------------------------------------------
// Three lines that PRODUCE the answer. Line 1 fixes the two rules of the first
// place, line 2 works one branch all the way through so the method is concrete,
// line 3 repeats it across the branches and adds / reads off the result. No line
// ever announces a total that an earlier line did not build.

function hintSteps(p: Params, sol: Solution): { en: string[]; id: string[] } {
  const k = p.length
  const rId = ruleShortId(p.filter)
  const rEn = ruleShortEn(p.filter)

  const step1_id = `Bilangan ${k} angka punya ${k} tempat, dan tempat pertama tidak boleh diisi 0 — jadi angka pertamanya hanya bisa ${listId(sol.firstDigits)}.`
  const step1_en = `A ${k}-digit number has ${k} places, and the first place can never hold 0 — so the first digit can only be ${listEn(sol.firstDigits)}.`

  if (p.ask === 'how-many') {
    const lead = sol.branches.find((b) => b.values.length > 0) ?? sol.branches[0]
    const step2_id = `Kunci angka pertama di ${lead.d}, coba semua cara mengisi tempat sisanya, lalu simpan yang ${rId}: ${joinNumbers(lead.values, 10)} — ada ${lead.values.length}.`
    const step2_en = `Lock the first digit at ${lead.d}, try every way to fill the other places, then keep only the ones that are ${rEn}: ${joinNumbers(lead.values, 10)} — that is ${lead.values.length}.`

    if (sol.branches.length === 1) {
      return {
        id: [
          step1_id,
          step2_id,
          `Tidak ada pilihan angka pertama yang lain, jadi banyaknya tetap ${lead.values.length} = ${sol.answer}.`,
        ],
        en: [
          step1_en,
          step2_en,
          `There is no other first digit to try, so the count stays ${lead.values.length} = ${sol.answer}.`,
        ],
      }
    }
    const pairs = sol.branches.map((b) => `${b.d} → ${b.values.length}`).join(', ')
    const sum = sol.branches.map((b) => b.values.length).join(' + ')
    return {
      id: [
        step1_id,
        step2_id,
        `Ulangi cara itu untuk setiap angka pertama — ${pairs} — lalu jumlahkan: ${sum} = ${sol.answer}.`,
      ],
      en: [
        step1_en,
        step2_en,
        `Repeat that for every first digit — ${pairs} — then add them up: ${sum} = ${sol.answer}.`,
      ],
    }
  }

  // Both remaining asks need the list itself, built in order, then read.
  const step2_id = `Kerjakan angka pertama satu per satu dari yang terkecil dan tulis semua yang ${rId} secara urut: ${joinNumbers(sol.set, 12)}.`
  const step2_en = `Work through the first digits from smallest to largest and write down every number that is ${rEn}, in order: ${joinNumbers(sol.set, 12)}.`

  if (p.ask === 'the-nth') {
    const ordered = p.from === 'smallest' ? sol.set : [...sol.set].reverse()
    const walk = ordered
      .slice(0, p.nth)
      .map((v, i) => `${i + 1}) ${v}`)
      .join(', ')
    const nameId = p.from === 'smallest' ? smallestPhraseId(p.nth) : largestPhraseId(p.nth)
    const nameEn = p.from === 'smallest' ? smallestPhraseEn(p.nth) : largestPhraseEn(p.nth)
    return {
      id: [
        step1_id,
        step2_id,
        `Hitung dari yang ${p.from === 'smallest' ? 'terkecil' : 'terbesar'}: ${walk} — jadi ${nameId} adalah ${sol.answer}.`,
      ],
      en: [
        step1_en,
        step2_en,
        `Count in from the ${p.from === 'smallest' ? 'smallest' : 'largest'}: ${walk} — so the ${nameEn} is ${sol.answer}.`,
      ],
    }
  }

  const big = sol.set[sol.set.length - p.mth]
  const small = sol.set[p.nth - 1]
  return {
    id: [
      step1_id,
      step2_id,
      `Dari daftar itu, ${largestPhraseId(p.mth)} = ${big} dan ${smallestPhraseId(p.nth)} = ${small}, jadi selisihnya ${big} − ${small} = ${sol.answer}.`,
    ],
    en: [
      step1_en,
      step2_en,
      `From that list the ${largestPhraseEn(p.mth)} is ${big} and the ${smallestPhraseEn(p.nth)} is ${small}, so the difference is ${big} − ${small} = ${sol.answer}.`,
    ],
  }
}

export function render(params: Params): Rendered {
  const sol = solve(params)
  const steps = hintSteps(params, sol)

  const body_id =
    `Kita punya ${poolPhraseId(params.digits)}. ${repeatsClauseId(params.repeats)} ` +
    `Dari angka-angka itu disusun ${shapePhraseId(params.length)} ${ruleClauseId(params.filter)}.` +
    `\n\nCari: ${questionId(params)}`

  const body_en =
    `We have ${poolPhraseEn(params.digits)}. ${repeatsClauseEn(params.repeats)} ` +
    `From those digits we build ${shapePhraseEn(params.length)} ${ruleClauseEn(params.filter)}.` +
    `\n\nFind: ${questionEn(params)}`

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: sol.answer,
    hint_id: `Kunci angka pertama dulu — dan ingat, tempat pertama tidak boleh 0 — baru hitung cara mengisi tempat sisanya.`,
    hint_en: `Lock the first digit first — and remember, the first place can never be 0 — then count the ways to fill the other places.`,
    hint_steps_en: steps.en,
    hint_steps_id: steps.id,
    breakdown: buildCountNumbersFromDigitsBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
