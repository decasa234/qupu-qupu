import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildIteratedRuleFarTermBreakdown } from './breakdown.js'

// Apply one small rule over and over, write the numbers down, notice the list
// CYCLES, then jump to the 30th (or 100th) number by remainder reasoning.
//
// The single fact this concept lives or dies on: the repeat does not always
// start at the first number. Most of these rules produce a RUN-UP — a few
// opening numbers that are never seen again — and only then settle into a
// block. A child who divides the index straight by the block length is
// answering a different question, and lands on the wrong number. So the cycle
// is DETECTED here (walk until a state repeats, then shrink to the minimal
// printed period and the minimal run-up), never assumed to start at term 1.
export const RULES = [
  'difference-of-previous-two',
  'units-digit-of-product',
  'alternating-add-subtract',
] as const
export type Rule = (typeof RULES)[number]

export const ASKS = ['the-term', 'sum-of-one-cycle'] as const
export type Ask = (typeof ASKS)[number]

/** A block of 1 is a constant, not a puzzle; a block of 9+ is more than a child can hold. */
export const MIN_CYCLE = 2
export const MAX_CYCLE = 8
/** The run-up has to be short enough that a child can actually write it out. */
export const MAX_TAIL = 6
/** Safety net: every rule here lives on a finite state set, so this is never reached. */
const MAX_STATES = 4000

/**
 * The minimum shape the solver needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `solve()`: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself. Same
 * trick `delete-digits-extremise` uses for its `SolvableDigits`.
 */
/**
 * The rule-specific fields are `.nullable()` in the schema, which zod 4 infers
 * as `field?: T` rather than `field: T | null` — the same inference quirk that
 * hit z.union and z.tuple elsewhere in this batch. At runtime the value really
 * is `null` for the rules that do not use it, so this accepts both and every
 * reader coalesces.
 */
export interface SolvableRule {
  rule: Rule
  seedA: number
  seedB?: number | null
  multiplier?: number | null
  ring?: number | null
  forward?: number | null
  back?: number | null
  targetIndex?: number | null
  ask: Ask
}

// ── The three rules, as state machines ───────────────────────────────────────
//
// A machine is deliberately tiny: a serialized state, a step, and the number
// that state PRINTS. Keeping "state" and "printed number" apart is what makes
// the tail honest — two different states can print the same number, so the
// printed list can start repeating before the state does.
interface Machine {
  start: string
  next(state: string): string
  term(state: string): number
}

/** Chair numbers run 1..ring and wrap both ways. */
export function wrapChair(chair: number, ring: number): number {
  return (((chair - 1) % ring) + ring) % ring + 1
}

function machineFor(p: SolvableRule): Machine {
  if (p.rule === 'difference-of-previous-two') {
    const b = p.seedB as number
    return {
      // State is the pair the next number is built from; it prints the older one.
      start: `${p.seedA},${b}`,
      next: (s) => {
        const [x, y] = s.split(',').map(Number)
        return `${y},${Math.abs(x - y)}`
      },
      term: (s) => Number(s.split(',')[0]),
    }
  }
  if (p.rule === 'units-digit-of-product') {
    const m = p.multiplier as number
    return {
      start: String(p.seedA),
      next: (s) => String((Number(s) * m) % 10),
      term: (s) => Number(s),
    }
  }
  const ring = p.ring as number
  const forward = p.forward as number
  const back = p.back as number
  // The list is the chair AFTER each pass, so the first printed number is
  // already one forward pass away from the starting chair. `phase` says which
  // way the NEXT pass goes: 0 = back, 1 = forward.
  return {
    start: `${wrapChair(p.seedA + forward, ring)}|0`,
    next: (s) => {
      const [pos, phase] = s.split('|').map(Number)
      const moved = phase === 0 ? wrapChair(pos - back, ring) : wrapChair(pos + forward, ring)
      return `${moved}|${phase === 0 ? 1 : 0}`
    },
    term: (s) => Number(s.split('|')[0]),
  }
}

// ── Cycle detection ──────────────────────────────────────────────────────────

export interface Cycle {
  /** A prefix of the list. `terms[0]` is the 1st number. */
  terms: number[]
  /** Opening numbers that never come back. May be 0. */
  tailLength: number
  /** Length of the smallest block that then repeats forever. */
  cycleLength: number
  tailTerms: number[]
  cycleTerms: number[]
}

/**
 * Walk the machine until a STATE repeats — that bounds the run-up and the
 * period. Then two corrections, both of which the naive "it cycles from the
 * start" reading gets wrong:
 *   1. the printed period may be a proper divisor of the state period, so take
 *      the smallest divisor that actually reproduces the numbers;
 *   2. a printed number may already sit on the pattern while its state has not
 *      joined the state cycle yet, so pull the start of the repeat back as far
 *      as the numbers allow.
 * What is left in front is exactly the run-up.
 */
export function detectCycle(p: SolvableRule, minTerms: number): Cycle {
  const m = machineFor(p)
  const seen = new Map<string, number>()
  const states: string[] = []
  let state = m.start
  let stateTail = -1
  let statePeriod = -1
  for (let i = 0; i < MAX_STATES; i++) {
    const at = seen.get(state)
    if (at !== undefined) {
      stateTail = at
      statePeriod = i - at
      break
    }
    seen.set(state, i)
    states.push(state)
    state = m.next(state)
  }
  if (statePeriod < 1) {
    throw new Error(`iterated-rule-far-term: no repeat found within ${MAX_STATES} steps`)
  }

  // Enough numbers to see the block come round twice over, to cover the asked
  // index, and to let the checks below have room.
  const need = Math.max(stateTail + 3 * statePeriod + 2, (p.targetIndex ?? 0) + 1, minTerms)
  const terms = states.map((s) => m.term(s))
  while (terms.length < need) {
    terms.push(m.term(state))
    state = m.next(state)
  }

  let cycleLength = statePeriod
  for (let cand = 1; cand <= statePeriod; cand++) {
    if (statePeriod % cand !== 0) continue
    let works = true
    for (let i = stateTail; i + cand < terms.length; i++) {
      if (terms[i] !== terms[i + cand]) {
        works = false
        break
      }
    }
    if (works) {
      cycleLength = cand
      break
    }
  }

  let tailLength = stateTail
  while (tailLength > 0 && terms[tailLength - 1] === terms[tailLength - 1 + cycleLength]) {
    tailLength -= 1
  }

  // Belt and braces: from here on the list really must repeat every `cycleLength`.
  for (let i = tailLength; i + cycleLength < terms.length; i++) {
    if (terms[i] !== terms[i + cycleLength]) {
      throw new Error(`iterated-rule-far-term: block ${cycleLength} does not hold at ${i}`)
    }
  }

  return {
    terms,
    tailLength,
    cycleLength,
    tailTerms: terms.slice(0, tailLength),
    cycleTerms: terms.slice(tailLength, tailLength + cycleLength),
  }
}

export interface Solution extends Cycle {
  /** How many numbers of index 1..target sit inside the repeating part. */
  stepsInsideBlock: number | null
  quotient: number | null
  remainder: number | null
  /** 1-based slot inside the block the target lands on. */
  slot: number | null
  targetTerm: number | null
  cycleSum: number
  /** What "the list cycles from the very first number" gives — the run-up mistake. */
  trapValue: number | null
  answer: string
}

export function solve(p: SolvableRule): Solution {
  const cycle = detectCycle(p, 18)
  const { terms, tailLength, cycleLength, cycleTerms } = cycle
  const cycleSum = cycleTerms.reduce((sum, n) => sum + n, 0)

  if (p.ask === 'sum-of-one-cycle') {
    // The mistake here is adding the first `cycleLength` numbers of the list,
    // which sweeps run-up numbers into a block they are not part of.
    const trapValue = terms.slice(0, cycleLength).reduce((sum, n) => sum + n, 0)
    return {
      ...cycle,
      stepsInsideBlock: null,
      quotient: null,
      remainder: null,
      slot: null,
      targetTerm: null,
      cycleSum,
      trapValue,
      answer: String(cycleSum),
    }
  }

  const n = p.targetIndex as number
  const stepsInsideBlock = n - tailLength
  const quotient = Math.floor(stepsInsideBlock / cycleLength)
  const remainder = stepsInsideBlock % cycleLength
  const slot = remainder === 0 ? cycleLength : remainder
  const targetTerm = cycleTerms[slot - 1]
  // The remainder answer and a straight walk to the same index must agree; if
  // they ever do not, the run-up was mis-measured and every hint below would be
  // narrating a method that lands somewhere else.
  if (terms[n - 1] !== targetTerm) {
    throw new Error(
      `iterated-rule-far-term: remainder says ${targetTerm} at index ${n}, walking says ${terms[n - 1]}`,
    )
  }
  const naiveSlot = n % cycleLength === 0 ? cycleLength : n % cycleLength
  return {
    ...cycle,
    stepsInsideBlock,
    quotient,
    remainder,
    slot,
    targetTerm,
    cycleSum,
    trapValue: terms[naiveSlot - 1],
    answer: String(targetTerm),
  }
}

// ── Params ───────────────────────────────────────────────────────────────────

const paramsSchema = z
  .object({
    rule: z.enum(RULES),
    /** Difference rule: 1st number. Units rule: the starting digit. Ring rule: the starting chair. */
    seedA: z.number().int().min(1).max(40),
    /** Difference rule only: the 2nd number. */
    seedB: z.number().int().min(1).max(40).nullable(),
    /** Units rule only. */
    multiplier: z.number().int().min(2).max(9).nullable(),
    /** Ring rule only: how many chairs stand in the circle. */
    ring: z.number().int().min(5).max(12).nullable(),
    forward: z.number().int().min(1).max(11).nullable(),
    back: z.number().int().min(1).max(11).nullable(),
    /** Only for `the-term`; the `sum-of-one-cycle` ask names no index. */
    targetIndex: z.number().int().min(20).max(120).nullable(),
    ask: z.enum(ASKS),
  })
  .refine((v) => (v.ask === 'the-term') === (v.targetIndex !== null), {
    message: 'the-term names an index; sum-of-one-cycle names none',
  })
  .refine(
    (v) => {
      if (v.rule === 'difference-of-previous-two') {
        return (
          v.seedB !== null && v.multiplier === null && v.ring === null && v.forward === null && v.back === null
        )
      }
      if (v.rule === 'units-digit-of-product') {
        return (
          v.multiplier !== null &&
          v.seedA <= 9 &&
          v.seedB === null &&
          v.ring === null &&
          v.forward === null &&
          v.back === null
        )
      }
      return (
        v.ring !== null &&
        v.forward !== null &&
        v.back !== null &&
        v.seedA <= v.ring &&
        v.forward < v.ring &&
        v.back < v.ring &&
        v.seedB === null &&
        v.multiplier === null
      )
    },
    { message: 'each rule carries exactly its own seeds and nothing else' },
  )
  .refine(
    (v) => {
      try {
        const s = solve(v)
        return s.cycleLength >= MIN_CYCLE && s.cycleLength <= MAX_CYCLE
      } catch {
        return false
      }
    },
    { message: `the repeating block must be ${MIN_CYCLE} to ${MAX_CYCLE} numbers long` },
  )
  .refine(
    (v) => {
      try {
        return solve(v).tailLength <= MAX_TAIL
      } catch {
        return false
      }
    },
    { message: `the run-up must be at most ${MAX_TAIL} numbers, or a child cannot write it out` },
  )
  .refine(
    (v) => {
      if (v.ask !== 'the-term') return true
      try {
        const s = solve(v)
        return (v.targetIndex as number) >= s.tailLength + 2 * s.cycleLength
      } catch {
        return false
      }
    },
    { message: 'the asked index must sit well past the run-up, so the remainder is really needed' },
  )
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'iterated-rule-far-term',
  name_en: 'Repeat the rule, find a far term',
  name_id: 'Ulangi aturannya, cari suku yang jauh',
  grades: [3] as const,
  description_id:
    'Menerapkan satu aturan berulang-ulang, menyadari bahwa hasilnya berputar, lalu melompat ke suku ke-30 atau ke-100 dengan sisa pembagian — termasuk menangani bilangan awal yang tidak ikut berulang.',
} as const

// ── Generation ───────────────────────────────────────────────────────────────

const TARGETS = [20, 24, 25, 30, 40, 50, 60, 80, 99, 100] as const

function draft(rng: Rng): Params {
  const rule = rng.pick(RULES)
  const ask = rng.pick(ASKS)
  const targetIndex = ask === 'the-term' ? rng.pick(TARGETS) : null
  const blank = {
    seedB: null,
    multiplier: null,
    ring: null,
    forward: null,
    back: null,
  }
  if (rule === 'difference-of-previous-two') {
    return { rule, ...blank, seedA: rng.int(3, 24), seedB: rng.int(1, 24), targetIndex, ask }
  }
  if (rule === 'units-digit-of-product') {
    return { rule, ...blank, seedA: rng.int(2, 9), multiplier: rng.int(2, 9), targetIndex, ask }
  }
  const ring = rng.int(6, 10)
  return {
    rule,
    ...blank,
    seedA: rng.int(1, ring),
    ring,
    forward: rng.int(2, ring - 1),
    back: rng.int(1, ring - 1),
    targetIndex,
    ask,
  }
}

/**
 * Quality filter, not a correctness rule — everything reaching it already
 * parses. It throws out the shapes that make the lesson invisible: a two-number
 * see-saw with no run-up (nothing to reason about), and a `sum-of-one-cycle`
 * whose run-up happens not to change the total (the whole point of that ask).
 */
function isWorthAsking(p: Params): boolean {
  if (p.rule === 'alternating-add-subtract' && p.forward === p.back) return false
  const s = solve(p)
  if (s.tailLength === 0 && s.cycleLength < 3) return false
  if (p.ask === 'sum-of-one-cycle') return s.cycleSum >= 2 && (s.tailLength === 0 || s.trapValue !== s.cycleSum)
  return true
}

export function generate(rng: Rng): Params {
  let fallback: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    if (!paramsSchema.safeParse(candidate).success) continue
    if (fallback === null) fallback = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (fallback !== null) return fallback
  // 3, 9, 7, 1, 3, 9, 7, 1 … — a block of 4 from the very first number.
  return {
    rule: 'units-digit-of-product',
    seedA: 3,
    seedB: null,
    multiplier: 3,
    ring: null,
    forward: null,
    back: null,
    targetIndex: 30,
    ask: 'the-term',
  }
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** 1st, 2nd, 3rd, 4th … — English needs it, Indonesian just says "ke-n". */
export function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  const ones = n % 10
  if (ones === 1) return `${n}st`
  if (ones === 2) return `${n}nd`
  if (ones === 3) return `${n}rd`
  return `${n}th`
}

/** How many numbers of the list the hints and the animation write out. */
export function stripLength(s: Cycle): number {
  return Math.min(s.tailLength + 2 * s.cycleLength + 1, 14)
}

export interface Intro {
  en: string
  id: string
}

export function ruleIntro(p: Params): Intro {
  if (p.rule === 'difference-of-previous-two') {
    return {
      en: `A list of numbers starts with ${p.seedA} and ${p.seedB}. After that, every new number is the difference between the two numbers just before it — the bigger one minus the smaller one.`,
      id: `Sebuah daftar bilangan dimulai dengan ${p.seedA} dan ${p.seedB}. Setelah itu, setiap bilangan baru adalah selisih dua bilangan tepat sebelumnya — yang besar dikurangi yang kecil.`,
    }
  }
  if (p.rule === 'units-digit-of-product') {
    return {
      en: `A list of numbers starts with ${p.seedA}. After that, every new number is the ones digit of the number before it times ${p.multiplier}.`,
      id: `Sebuah daftar bilangan dimulai dengan ${p.seedA}. Setelah itu, setiap bilangan baru adalah angka satuan dari bilangan sebelumnya dikali ${p.multiplier}.`,
    }
  }
  return {
    en: `${p.ring} chairs stand in a circle, numbered 1 to ${p.ring}. A ball starts on chair ${p.seedA}. Pass 1 moves it ${p.forward} chairs forward, pass 2 moves it ${p.back} chairs back, pass 3 moves it ${p.forward} chairs forward again, and so on around the circle. Write down the chair number after each pass to make a list of numbers.`,
    id: `Ada ${p.ring} kursi melingkar bernomor 1 sampai ${p.ring}. Sebuah bola mulai di kursi ${p.seedA}. Operan ke-1 memindahkannya ${p.forward} kursi maju, operan ke-2 memindahkannya ${p.back} kursi mundur, operan ke-3 maju ${p.forward} kursi lagi, dan begitu seterusnya mengelilingi lingkaran. Tulis nomor kursi setelah setiap operan sebagai daftar bilangan.`,
  }
}

export function askQuestion(p: Params): Intro {
  if (p.ask === 'the-term') {
    const n = p.targetIndex as number
    return {
      en: `What is the ${ordinal(n)} number in the list?`,
      id: `Berapa bilangan ke-${n} dalam daftar itu?`,
    }
  }
  return {
    en: `The list ends up repeating the same block of numbers over and over. What is the sum of the numbers in one block?`,
    id: `Daftar itu akhirnya mengulang blok bilangan yang sama terus-menerus. Berapa jumlah bilangan dalam satu blok?`,
  }
}

export function render(params: Params): Rendered {
  const s = solve(params)
  const { tailLength: tail, cycleLength: len, cycleTerms, tailTerms, terms } = s
  const breakdown = buildIteratedRuleFarTermBreakdown(params)
  const intro = ruleIntro(params)
  const question = askQuestion(params)

  const body_en = `${intro.en} Find: ${question.en}`
  const body_id = `${intro.id} Cari: ${question.id}`

  const preview = terms.slice(0, stripLength(s)).join(', ')
  const block = cycleTerms.join(', ')
  const runUp = tailTerms.join(', ')

  // ── hint_steps: write the list, FIND where it starts coming round, measure
  // the block, take the run-up off the index, divide, read the slot. Every line
  // is built from the detected cycle, so the trail cannot land anywhere else.
  const steps_en: string[] = [`Follow the rule and write the list out: ${preview}, …`]
  const steps_id: string[] = [`Ikuti aturannya dan tulis daftarnya: ${preview}, …`]

  if (tail > 0) {
    steps_en.push(
      `Hunt for the repeat. From the ${ordinal(tail + 1)} number on, ${block} keeps coming round again. ${
        tail === 1
          ? `The very first number (${runUp}) shows up once and never comes back`
          : `The first ${tail} numbers (${runUp}) show up once and never come back`
      } — that is the run-up, and it is not part of the block.`,
    )
    steps_id.push(
      `Cari pengulangannya. Mulai dari bilangan ke-${tail + 1}, ${block} datang lagi dan lagi. ${
        tail === 1
          ? `Bilangan pertama (${runUp}) muncul sekali lalu tidak pernah kembali`
          : `${tail} bilangan pertama (${runUp}) muncul sekali lalu tidak pernah kembali`
      } — itu bilangan awalan, dan tidak ikut ke dalam blok.`,
    )
  } else {
    steps_en.push(
      `Hunt for the repeat. The list comes round straight away: ${block} repeats from the 1st number on, so there is no run-up in front of it.`,
    )
    steps_id.push(
      `Cari pengulangannya. Daftarnya langsung berputar: ${block} berulang mulai dari bilangan ke-1, jadi tidak ada bilangan awalan di depannya.`,
    )
  }

  steps_en.push(
    `So the block that repeats is ${block}, and it is ${len} numbers long, starting at the ${ordinal(tail + 1)} number.`,
  )
  steps_id.push(
    `Jadi blok yang berulang adalah ${block}, panjangnya ${len} bilangan, dimulai dari bilangan ke-${tail + 1}.`,
  )

  if (params.ask === 'the-term') {
    const n = params.targetIndex as number
    const inside = s.stepsInsideBlock as number
    const quotient = s.quotient as number
    const remainder = s.remainder as number
    const slot = s.slot as number
    if (tail > 0) {
      steps_en.push(
        `Take the run-up off first: ${
          tail === 1 ? 'the 1st number sits' : `numbers 1 to ${tail} sit`
        } outside the block, so ${n} − ${tail} = ${inside} numbers sit inside it. Now ${inside} ÷ ${len} = ${quotient} remainder ${remainder}.`,
      )
      steps_id.push(
        `Kurangi dulu bilangan awalannya: ${
          tail === 1 ? 'bilangan ke-1' : `bilangan ke-1 sampai ke-${tail}`
        } ada di luar blok, jadi ${n} − ${tail} = ${inside} bilangan ada di dalam blok. Sekarang ${inside} : ${len} = ${quotient} sisa ${remainder}.`,
      )
    } else {
      steps_en.push(
        `There is no run-up to take off, so all ${n} numbers sit inside the block. Now ${n} ÷ ${len} = ${quotient} remainder ${remainder}.`,
      )
      steps_id.push(
        `Tidak ada bilangan awalan yang perlu dikurangi, jadi semua ${n} bilangan ada di dalam blok. Sekarang ${n} : ${len} = ${quotient} sisa ${remainder}.`,
      )
    }
    if (remainder === 0) {
      steps_en.push(
        `A remainder of 0 means the ${ordinal(n)} number finishes a whole block, so it is the last one in ${block}: ${s.targetTerm}.`,
      )
      steps_id.push(
        `Sisa 0 berarti bilangan ke-${n} pas menutup satu blok penuh, jadi ia bilangan terakhir dari ${block}: ${s.targetTerm}.`,
      )
    } else {
      steps_en.push(
        `Remainder ${remainder} means the ${ordinal(n)} number is the ${ordinal(slot)} one in ${block}: ${s.targetTerm}.`,
      )
      steps_id.push(
        `Sisa ${remainder} berarti bilangan ke-${n} adalah bilangan ke-${slot} di dalam ${block}: ${s.targetTerm}.`,
      )
    }
  } else if (tail > 0) {
    steps_en.push(
      `Add up one block only — the run-up numbers ${runUp} are not in it: ${cycleTerms.join(' + ')} = ${s.cycleSum}.`,
    )
    steps_id.push(
      `Jumlahkan satu blok saja — bilangan awalan ${runUp} tidak ikut: ${cycleTerms.join(' + ')} = ${s.cycleSum}.`,
    )
  } else {
    steps_en.push(`Add up one block: ${cycleTerms.join(' + ')} = ${s.cycleSum}.`)
    steps_id.push(`Jumlahkan satu blok: ${cycleTerms.join(' + ')} = ${s.cycleSum}.`)
  }

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en:
      'Write out enough numbers to catch the list coming round. Check where the repeat really starts — the first few numbers often never come back. Take those off the index, then divide by the block length and read the remainder.',
    hint_id:
      'Tulis cukup banyak bilangan sampai daftarnya terlihat berputar. Periksa dari mana pengulangannya benar-benar mulai — bilangan awalnya sering tidak pernah kembali. Kurangi bilangan awal itu dari nomor suku, lalu bagi dengan panjang blok dan lihat sisanya.',
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
