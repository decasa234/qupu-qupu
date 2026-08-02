import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildMastermindCodeDeduceBreakdown } from './breakdown.js'

// A padlock hides a secret code of three DIFFERENT digits drawn from 1..6.
// Three or four guesses have already been tried, and for each one the lock
// reported two counts: how many digits were correct and standing in the right
// spot, and how many were correct but standing somewhere else. The child has to
// throw candidate codes away until one is left.
//
// The single fact this concept lives or dies on: after the reports are read,
// EXACTLY ONE code may remain. Two survivors and the child has to guess, and
// either guess is defensible; zero and the puzzle contradicts itself. So
// `generate` never emits a clue set that merely *looks* informative — it
// enumerates the whole code space (all ordered triples of distinct digits from
// the pool) after every clue it adds and keeps the params only when the count
// lands on one. `paramsSchema` re-checks that, and `index.test.ts` re-checks it
// again with a brute force written from the definition rather than from this
// file.
//
// The second rule, just as load-bearing: the reports are COMPUTED by `score`,
// never authored. The same function builds the clues and filters the
// candidates, so a clue physically cannot contradict the answer — the answer is
// the thing that survives its own reports.
//
// Shape of a generated puzzle (why it is walkable rather than guessable):
//   * Clue 1 is always the three digits that are NOT in the code, so its report
//     is "nothing correct". With a pool of 6 and a code of 3 that leaves
//     exactly 3 usable digits — the code's digits become known, and only their
//     ORDER is still open: 6 orders.
//   * Every later clue strictly shrinks that list of orders, and no later clue
//     names all three code digits (a report of "all three correct" would settle
//     the digit set on its own and turn clue 1 into dead weight).
//   * `isWorthAsking` then insists every single clue is load-bearing: drop any
//     one of them and more than one code survives.
export const POOL_SIZE = 6
export const CODE_LENGTH = 3
export const MIN_GUESSES = 3
export const MAX_GUESSES = 4

/** What the lock reports about one guess. */
export interface Feedback {
  /** Digits that are in the code AND standing in the right spot. */
  placed: number
  /** Digits that are in the code but standing somewhere else. */
  present: number
}

export interface Clue extends Feedback {
  guess: number[]
}

const codeArray = z
  .array(z.number().int().min(1).max(POOL_SIZE))
  .min(CODE_LENGTH)
  .max(CODE_LENGTH)

const paramsSchema = z
  .object({
    /** Digits 1..poolSize are the symbols a code may use. */
    poolSize: z.number().int().min(POOL_SIZE).max(POOL_SIZE),
    codeLength: z.number().int().min(CODE_LENGTH).max(CODE_LENGTH),
    /** The TRUE code. Never shown; every report is derived from it. */
    code: codeArray,
    /** The guesses the paper prints, in the order they were tried. */
    guesses: z.array(codeArray).min(MIN_GUESSES).max(MAX_GUESSES),
  })
  .refine((v) => new Set(v.code).size === v.code.length, {
    message: 'the code uses three different digits',
  })
  .refine((v) => v.guesses.every((g) => new Set(g).size === g.length), {
    message: 'every guess uses three different digits',
  })
  .refine((v) => v.guesses.every((g) => !sameSeq(g, v.code)), {
    message: 'no guess may BE the code — its report would hand the answer over',
  })
  .refine((v) => new Set(v.guesses.map(codeStr)).size === v.guesses.length, {
    message: 'the guesses must be different from each other',
  })
  // THE load-bearing rule. Everything above is shape; this is the promise that
  // the reports pin down one code and only one, so the child deduces instead of
  // picking between two defensible answers.
  .refine((v) => !structurallySound(v) || survivors(v).length === 1, {
    message: 'exactly one code must survive every report',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'mastermind-code-deduce',
  name_en: 'Crack the code from the clues',
  name_id: 'Bongkar kode dari petunjuk',
  grades: [2, 3] as const,
  description_id:
    'Menyingkirkan kemungkinan kode satu per satu memakai laporan tiap tebakan, sampai hanya satu kode yang tersisa.',
} as const

// ── Scoring and the code space ───────────────────────────────────────────────

export const codeStr = (xs: number[]): string => xs.join('')
const sameSeq = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i])

/**
 * The lock's report for one guess against one code. Both are lists of DISTINCT
 * digits, which is what lets `present` be a plain set intersection minus the
 * exact hits — no multiset bookkeeping, and a rule a 3rd-grader can apply by
 * hand. Used twice over: once to build the clues from the real code, once to
 * test every candidate against those clues. That single source is why a clue
 * can never contradict the answer.
 */
export function score(guess: number[], code: number[]): Feedback {
  let placed = 0
  for (let i = 0; i < guess.length; i++) if (guess[i] === code[i]) placed += 1
  const shared = guess.filter((d) => code.includes(d)).length
  return { placed, present: shared - placed }
}

/** Every ordered triple of distinct digits from 1..poolSize. 120 of them at 6. */
export function allCodes(poolSize: number, codeLength: number): number[][] {
  const out: number[][] = []
  const picked: number[] = []
  const walk = (): void => {
    if (picked.length === codeLength) {
      out.push([...picked])
      return
    }
    for (let d = 1; d <= poolSize; d++) {
      if (picked.includes(d)) continue
      picked.push(d)
      walk()
      picked.pop()
    }
  }
  walk()
  return out
}

/**
 * The minimum shape the solver needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `survivors()`: taking `Params`
 * there would make `Params = z.infer<typeof paramsSchema>` reference itself.
 */
export interface SolvableCode {
  poolSize: number
  codeLength: number
  code: number[]
  guesses: number[][]
}

/** Enough of a params object to be worth enumerating the code space for. */
function structurallySound(v: SolvableCode): boolean {
  if (v.code.length !== v.codeLength) return false
  if (new Set(v.code).size !== v.code.length) return false
  if (v.code.some((d) => d < 1 || d > v.poolSize)) return false
  if (v.guesses.length === 0) return false
  return v.guesses.every(
    (g) =>
      g.length === v.codeLength &&
      new Set(g).size === g.length &&
      g.every((d) => d >= 1 && d <= v.poolSize),
  )
}

/** The reports the paper prints, computed from the real code. */
export function clues(p: SolvableCode): Clue[] {
  return p.guesses.map((guess) => ({ guess, ...score(guess, p.code) }))
}

/** Every code in the whole space that matches the first `upTo` reports. */
export function survivors(p: SolvableCode, upTo = p.guesses.length): number[][] {
  const cs = clues(p).slice(0, upTo)
  return allCodes(p.poolSize, p.codeLength).filter((cand) =>
    cs.every((cl) => {
      const f = score(cl.guess, cand)
      return f.placed === cl.placed && f.present === cl.present
    }),
  )
}

// ── The elimination trail ────────────────────────────────────────────────────

/** One report applied to the list of codes still standing. */
export interface DeductionStep {
  clueIndex: number
  clue: Clue
  /** Codes still standing before this report is read. */
  before: number[][]
  /** Codes still standing after it. */
  after: number[][]
  /** Codes this report crosses off. */
  killed: number[][]
  /** Digits this report proves are not in the code at all (nothing correct). */
  ruledOut: number[]
  /**
   * The code's digit set, sorted, at the moment this report first settles it —
   * the step where "which digits" is answered and only "in what order" is left.
   */
  settledDigits: number[] | null
  /**
   * `spot`/`digit` pairs this report bans, for the reports where nothing at all
   * was in the right place. Only the pairs that actually cross something off
   * are listed, so a hint line never argues from a constraint with no bite.
   */
  spotExclusions: { spot: number; digit: number }[]
}

export interface Solution {
  clues: Clue[]
  steps: DeductionStep[]
  /** Codes still standing after every report. Exactly one, for valid params. */
  candidates: number[][]
  unique: boolean
  answer: string
}

const digitSetKey = (c: number[]): string => [...c].sort((a, b) => a - b).join('')

export function solve(p: SolvableCode): Solution {
  const cs = clues(p)
  const steps: DeductionStep[] = []
  let live = allCodes(p.poolSize, p.codeLength)

  cs.forEach((clue, clueIndex) => {
    const before = live
    const after = before.filter((cand) => {
      const f = score(clue.guess, cand)
      return f.placed === clue.placed && f.present === clue.present
    })
    const keep = new Set(after.map(codeStr))
    const killed = before.filter((c) => !keep.has(codeStr(c)))

    const ruledOut = clue.placed === 0 && clue.present === 0 ? [...clue.guess] : []

    const beforeSettled = new Set(before.map(digitSetKey)).size === 1
    const afterSettled = after.length > 0 && new Set(after.map(digitSetKey)).size === 1
    const settledDigits =
      !beforeSettled && afterSettled ? [...after[0]].sort((a, b) => a - b) : null

    const spotExclusions =
      clue.placed === 0
        ? clue.guess
            .map((digit, spot) => ({ spot, digit }))
            .filter(({ spot, digit }) => before.some((c) => c[spot] === digit))
        : []

    steps.push({
      clueIndex,
      clue,
      before,
      after,
      killed,
      ruledOut,
      settledDigits,
      spotExclusions,
    })
    live = after
  })

  return {
    clues: cs,
    steps,
    candidates: live,
    unique: live.length === 1,
    answer: codeStr(p.code),
  }
}

/**
 * The one genuinely tempting wrong answer this concept has: the first report
 * names WHICH digits the code uses, and a child who stops there writes them
 * down in plain order. `null` when that order happens to be the code itself.
 * Returns the report that actually crosses it off, so the note can argue rather
 * than assert.
 */
export function trapAnswer(
  p: SolvableCode,
  s: Solution,
): { wrong: string; step: DeductionStep } | null {
  const tidy = [...p.code].sort((a, b) => a - b)
  const wrong = codeStr(tidy)
  if (wrong === s.answer) return null
  const step = s.steps.find((st) => st.killed.some((c) => codeStr(c) === wrong))
  if (step === undefined) return null
  return { wrong, step }
}

// ── Generation ───────────────────────────────────────────────────────────────

/**
 * Builds one puzzle, or `null` when this code could not carry the wanted number
 * of guesses. Guesses are chosen by scanning a shuffled list of the whole guess
 * space, so a slot fails only when NO guess can serve it — far more reliable
 * than sampling, and still varied because the scan order is shuffled.
 */
function draft(rng: Rng): Params | null {
  const pool = Array.from({ length: POOL_SIZE }, (_, i) => i + 1)
  const code = rng.shuffle(pool).slice(0, CODE_LENGTH)
  // Clue 1 is the three digits the code does NOT use, so its report is "nothing
  // correct" and the child learns the code's digits in one move.
  const opener = rng.shuffle(pool.filter((d) => !code.includes(d)))
  const guesses: number[][] = [opener]
  const wanted = rng.int(MIN_GUESSES, MAX_GUESSES)

  const space = allCodes(POOL_SIZE, CODE_LENGTH)
  let live = survivors({ poolSize: POOL_SIZE, codeLength: CODE_LENGTH, code, guesses })

  while (guesses.length < wanted) {
    const isLast = guesses.length === wanted - 1
    const taken = new Set(guesses.map(codeStr))
    let chosen: { guess: number[]; next: number[][] } | null = null

    for (const g of rng.shuffle(space)) {
      if (taken.has(codeStr(g))) continue
      if (sameSeq(g, code)) continue
      const f = score(g, code)
      // Two or more digits already in place gives too much away for grade 2-3.
      if (f.placed >= 2) continue
      // A guess made of all three code digits would settle the digit set by
      // itself, which turns the opening report into dead weight.
      if (f.placed + f.present >= CODE_LENGTH) continue
      const next = live.filter((cand) => {
        const fc = score(g, cand)
        return fc.placed === f.placed && fc.present === f.present
      })
      // A report that crosses nothing off would be a hint line with no argument.
      if (next.length >= live.length) continue
      if (isLast ? next.length !== 1 : next.length < 2) continue
      chosen = { guess: g, next }
      break
    }

    if (chosen === null) return null
    guesses.push(chosen.guess)
    live = chosen.next
  }

  if (live.length !== 1) return null
  return { poolSize: POOL_SIZE, codeLength: CODE_LENGTH, code, guesses }
}

/**
 * Quality filter, not a correctness rule — `draft` already aims at unique
 * puzzles and `paramsSchema` refuses the ones that miss. This rejects the clue
 * sets that are technically fine but pedagogically bad.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (!s.unique) return false
  // The first report has to be the one that settles which digits are in play;
  // that is the argument every later hint line stands on.
  if (s.steps[0].settledDigits === null) return false
  // No dead lines: every report crosses something off at the moment it is read.
  if (s.steps.some((st) => st.after.length >= st.before.length)) return false
  // No decoys: drop any single report and the code stops being pinned down.
  for (let i = 0; i < p.guesses.length; i++) {
    const without = { ...p, guesses: p.guesses.filter((_, j) => j !== i) }
    if (survivors(without).length === 1) return false
  }
  return true
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    if (candidate === null) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). Fall back to a hand-built puzzle
  // that is unique by construction and checked in index.test.ts:
  //   2 5 6 → nothing correct        ⇒ the code is 1, 3, 4 in some order
  //   4 2 5 → 1 in place, 0 elsewhere ⇒ 4 leads: 413 or 431
  //   2 1 5 → 1 in place, 0 elsewhere ⇒ 1 sits in the middle: 413
  return {
    poolSize: POOL_SIZE,
    codeLength: CODE_LENGTH,
    code: [4, 1, 3],
    guesses: [
      [2, 5, 6],
      [4, 2, 5],
      [2, 1, 5],
    ],
  }
}

// ── Wording ──────────────────────────────────────────────────────────────────

const ORDINAL_EN = ['first', 'second', 'third'] as const
const ORDINAL_ID = ['pertama', 'kedua', 'ketiga'] as const

/** "134", "134 and 143", "134, 143 and 341". */
export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** "134", "134 dan 143", "134, 143, dan 341". */
export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/**
 * One report written out as a sentence, with no trailing full stop. Exported so
 * the breakdown can quote it verbatim and stay an exact substring of the body.
 */
export function clueSentence(clue: Clue, lang: 'en' | 'id'): string {
  const g = clue.guess.join(' ')
  const { placed, present } = clue
  if (lang === 'id') {
    const head = `Tebakan ${g}: `
    if (placed === 0 && present === 0) return `${head}tidak ada angka yang benar`
    if (placed === 0) {
      if (present === 1) {
        return `${head}1 angka benar, tetapi angka itu tidak berada di tempat yang tepat`
      }
      if (present >= CODE_LENGTH) {
        return `${head}ketiga angkanya benar, tetapi tidak satu pun berada di tempat yang tepat`
      }
      return `${head}${present} angka benar, tetapi tidak satu pun berada di tempat yang tepat`
    }
    if (present === 0) {
      const others = CODE_LENGTH - placed
      return `${head}${placed} angka benar dan sudah berada di tempat yang tepat, dan ${others} angka lainnya tidak ada di dalam kode`
    }
    return `${head}${placed} angka benar dan sudah berada di tempat yang tepat, dan ${present} angka lagi benar tetapi salah tempat`
  }
  const head = `Guess ${g}: `
  if (placed === 0 && present === 0) return `${head}no digit is correct`
  if (placed === 0) {
    if (present === 1) return `${head}1 digit is correct, but it is not in the right spot`
    if (present === 2) return `${head}2 digits are correct, but neither of them is in the right spot`
    return `${head}all ${present} digits are correct, but none of them is in the right spot`
  }
  if (present === 0) {
    const others = CODE_LENGTH - placed
    const tail = others === 1 ? 'the other digit is not in the code' : `the other ${others} digits are not in the code`
    return `${head}${placed} ${placed === 1 ? 'digit is' : 'digits are'} correct and in the right spot, and ${tail}`
  }
  return `${head}${placed} ${placed === 1 ? 'digit is' : 'digits are'} correct and in the right spot, and ${present} more ${present === 1 ? 'is' : 'are'} correct but in the wrong spot`
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(lang: 'en' | 'id'): string {
  return lang === 'id' ? 'Berapa kode rahasianya?' : 'What is the secret code?'
}

/** "the first digit is not 1" / "angka pertama bukan 1". */
function exclusionPhrase(spot: number, digit: number, lang: 'en' | 'id'): string {
  return lang === 'id'
    ? `angka ${ORDINAL_ID[spot]} bukan ${digit}`
    : `the ${ORDINAL_EN[spot]} digit is not ${digit}`
}

// ── Rendering ────────────────────────────────────────────────────────────────

export function render(params: Params): Rendered {
  const { poolSize, codeLength } = params
  const s = solve(params)
  const breakdown = buildMastermindCodeDeduceBreakdown(params)

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = [
    `A padlock opens with a secret code of ${codeLength} different digits, each one from 1 to ${poolSize}.`,
    `After every try the lock reports how many digits are correct and in the right spot, and then how many are correct but in the wrong spot.`,
    ...s.clues.map((c) => `${clueSentence(c, 'en')}.`),
    `Find: ${askClause('en')}`,
  ].join(' ')
  const body_id = [
    `Sebuah gembok terbuka dengan kode rahasia berisi ${codeLength} angka berbeda, masing-masing dari 1 sampai ${poolSize}.`,
    `Setiap kali dicoba, gembok memberi tahu berapa angka yang benar dan sudah berada di tempat yang tepat, lalu berapa angka yang benar tetapi salah tempat.`,
    ...s.clues.map((c) => `${clueSentence(c, 'id')}.`),
    `Cari: ${askClause('id')}`,
  ].join(' ')

  // ── hint_steps: the elimination trail, one report at a time. Each line says
  // what the report crosses off AND why, so the surviving code is squeezed out
  // rather than announced. The closing line only names what is left standing.
  const steps_en: string[] = [
    `The code is ${codeLength} different digits picked from 1 to ${poolSize}. Each report gives two counts: how many digits are correct and already in the right spot, then how many are correct but sitting in the wrong spot.`,
  ]
  const steps_id: string[] = [
    `Kodenya terdiri dari ${codeLength} angka berbeda yang dipilih dari 1 sampai ${poolSize}. Tiap laporan memberi dua bilangan: berapa angka yang benar dan sudah berada di tempat yang tepat, lalu berapa angka yang benar tetapi berada di tempat yang salah.`,
  ]

  for (const step of s.steps) {
    const afterList = step.after.map(codeStr)
    const killedList = step.killed.map(codeStr)
    const lead_en = `${clueSentence(step.clue, 'en')}.`
    const lead_id = `${clueSentence(step.clue, 'id')}.`

    if (step.settledDigits !== null) {
      const digits = step.settledDigits.map(String)
      const out =
        step.ruledOut.length > 0
          ? {
              en: ` So ${listEn(step.ruledOut.map(String))} are not in the code.`,
              id: ` Jadi ${listId(step.ruledOut.map(String))} tidak ada di dalam kode.`,
            }
          : { en: '', id: '' }
      steps_en.push(
        `${lead_en}${out.en} That leaves only ${listEn(digits)}, and the code needs ${codeLength} different digits — so the code is ${listEn(digits)} in some order: ${afterList.join(', ')}.`,
      )
      steps_id.push(
        `${lead_id}${out.id} Yang tersisa hanya ${listId(digits)}, sedangkan kode butuh ${codeLength} angka berbeda — jadi kodenya pasti ${listId(digits)} dalam suatu urutan: ${afterList.join(', ')}.`,
      )
      continue
    }

    if (step.clue.placed === 0 && step.spotExclusions.length > 0) {
      const ex_en = listEn(step.spotExclusions.map((e) => exclusionPhrase(e.spot, e.digit, 'en')))
      const ex_id = listId(step.spotExclusions.map((e) => exclusionPhrase(e.spot, e.digit, 'id')))
      steps_en.push(
        `${lead_en} Nothing is standing in the right spot, so ${ex_en}. That crosses off ${listEn(killedList)}, leaving ${listEn(afterList)}.`,
      )
      steps_id.push(
        `${lead_id} Tidak ada yang berada di tempat yang tepat, jadi ${ex_id}. Itu mencoret ${listId(killedList)}, tersisa ${listId(afterList)}.`,
      )
      continue
    }

    // A report with something already in place: test each order still standing
    // the same way the lock did, and keep only the ones that give both counts.
    const checks = step.before
      .map((c) => {
        const f = score(step.clue.guess, c)
        return `${codeStr(c)} → ${f.placed} and ${f.present}`
      })
      .join('; ')
    const checks_id = step.before
      .map((c) => {
        const f = score(step.clue.guess, c)
        return `${codeStr(c)} → ${f.placed} dan ${f.present}`
      })
      .join('; ')
    steps_en.push(
      `${lead_en} Test every order still standing the same way — count the digits in the right spot, then the correct digits sitting elsewhere: ${checks}. Only ${listEn(afterList)} give ${step.clue.placed} and ${step.clue.present}, so ${listEn(killedList)} ${killedList.length === 1 ? 'goes' : 'go'} out.`,
    )
    steps_id.push(
      `${lead_id} Uji tiap urutan yang masih bertahan dengan cara yang sama — hitung angka yang tepat tempatnya, lalu angka benar yang tempatnya lain: ${checks_id}. Hanya ${listId(afterList)} yang memberi ${step.clue.placed} dan ${step.clue.present}, jadi ${listId(killedList)} gugur.`,
    )
  }

  steps_en.push(
    `Only ${s.answer} is still standing after every report, so the secret code is ${s.answer}.`,
  )
  steps_id.push(
    `Hanya ${s.answer} yang masih bertahan setelah semua laporan, jadi kode rahasianya ${s.answer}.`,
  )

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en:
      'Start with the report that found nothing at all — those digits are out, which tells you exactly which digits the code uses. Then let each other report cross orders off the list until one is left.',
    hint_id:
      'Mulai dari laporan yang sama sekali tidak menemukan angka benar — angka-angka itu gugur, jadi kamu tahu persis angka mana yang dipakai kode. Lalu biarkan tiap laporan lain mencoret urutan sampai tinggal satu.',
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
