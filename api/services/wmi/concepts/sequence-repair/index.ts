import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildSequenceRepairBreakdown } from './breakdown.js'

// A BROKEN number sequence: something has been taken out of it, pushed into it,
// or hidden inside it. The child must first read the rule off the part that is
// still intact, then repair the damage. Deliberately never asks "what comes
// next" — that is the sibling `pattern-next` concept.

/** Marker for the missing interior term. */
export const BLANK = '__'
/** Marker for a stretch of terms hidden from view. */
export const DOTS = '…'

// ── Params ────────────────────────────────────────────────────────────────────

const arithmeticRuleSchema = z.object({
  kind: z.literal('arithmetic'),
  /** First term of the intact sequence. */
  start: z.number().int().min(0).max(100),
  /** Constant amount added (up) or taken away (down) each step. */
  step: z.number().int().min(1).max(10),
  direction: z.enum(['up', 'down']),
})

const interleavedRuleSchema = z.object({
  kind: z.literal('interleaved'),
  /** "Small" family — sits at positions 0, 2, 4, … */
  startA: z.number().int().min(0).max(100),
  stepA: z.number().int().min(1).max(10),
  /** "Big" family — sits at positions 1, 3, 5, … Always above the small family. */
  startB: z.number().int().min(0).max(100),
  stepB: z.number().int().min(1).max(10),
})

const ruleSchema = z.discriminatedUnion('kind', [arithmeticRuleSchema, interleavedRuleSchema])

export type ArithmeticRule = z.infer<typeof arithmeticRuleSchema>
export type InterleavedRule = z.infer<typeof interleavedRuleSchema>
export type Rule = z.infer<typeof ruleSchema>

const defectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('interior-blank'),
    /** Index (into the intact sequence) of the term shown as `__`. Never first or last. */
    at: z.number().int().min(1).max(8),
  }),
  z.object({
    kind: z.literal('intruder'),
    /** Index the extra number is wedged into. The shown list is one term longer. */
    at: z.number().int().min(1).max(8),
    /** The number that does not belong — this is the answer. */
    value: z.number().int().min(0).max(100),
  }),
  z.object({
    kind: z.literal('hidden-run'),
    /** Index of the first hidden term. At least 2 terms stay visible before it. */
    from: z.number().int().min(2).max(7),
    /** How many consecutive terms the "…" swallows — this is the answer. */
    count: z.number().int().min(2).max(4),
  }),
])

export type Defect = z.infer<typeof defectSchema>

const paramsSchema = z.object({
  rule: ruleSchema,
  /** Number of terms in the INTACT sequence (the shown list adds one for an intruder). */
  length: z.number().int().min(5).max(9),
  defect: defectSchema,
})

export type Params = z.infer<typeof paramsSchema>

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta = {
  slug: 'sequence-repair',
  name_en: 'Repair the number sequence',
  name_id: 'Perbaiki barisan bilangan',
  grades: [1] as const,
  description_id: 'Temukan aturan barisan yang rusak, lalu perbaiki bagian yang salah.',
} as const

// ── Sequence builders ─────────────────────────────────────────────────────────

/** The intact sequence the rule describes, before anything is broken. */
export function cleanTerms(params: Params): number[] {
  const { rule, length } = params
  if (rule.kind === 'arithmetic') {
    const sign = rule.direction === 'up' ? 1 : -1
    return Array.from({ length }, (_, i) => rule.start + sign * i * rule.step)
  }
  return Array.from({ length }, (_, i) =>
    i % 2 === 0
      ? rule.startA + (i >> 1) * rule.stepA
      : rule.startB + (i >> 1) * rule.stepB,
  )
}

/** Every number the child actually sees (intruder wedged in; nothing removed). */
export function displayNumbers(params: Params): number[] {
  const clean = cleanTerms(params)
  if (params.defect.kind !== 'intruder') return clean
  const out = clean.slice()
  out.splice(params.defect.at, 0, params.defect.value)
  return out
}

/** The rendered items, including the `__` blank or the `…` marker. */
export function displayItems(params: Params): string[] {
  const clean = cleanTerms(params)
  const d = params.defect
  if (d.kind === 'interior-blank') {
    return clean.map((v, i) => (i === d.at ? BLANK : String(v)))
  }
  if (d.kind === 'intruder') {
    return displayNumbers(params).map(String)
  }
  return [
    ...clean.slice(0, d.from).map(String),
    DOTS,
    ...clean.slice(d.from + d.count).map(String),
  ]
}

/** The sequence as it reads inline in the body, e.g. `3, 6, __, 12, 15`. */
export function sequenceText(params: Params): string {
  return displayItems(params).join(', ')
}

export function answerOf(params: Params): string {
  const d = params.defect
  if (d.kind === 'interior-blank') return String(cleanTerms(params)[d.at])
  if (d.kind === 'intruder') return String(d.value)
  return String(d.count)
}

// ── Rule readers (used for the uniqueness proofs) ──────────────────────────────

/** Same non-zero gap between every pair of neighbours. */
export function isArithmetic(xs: number[]): boolean {
  if (xs.length < 3) return false
  const d = xs[1] - xs[0]
  if (d === 0) return false
  return xs.every((v, i) => i === 0 || v - xs[i - 1] === d)
}

/** Two arithmetic runs taking turns, and the two runs must not share a step. */
export function isInterleaved(xs: number[]): boolean {
  if (xs.length < 6) return false
  const a = xs.filter((_, i) => i % 2 === 0)
  const b = xs.filter((_, i) => i % 2 === 1)
  if (a.length < 3 || b.length < 3) return false
  if (!isArithmetic(a) || !isArithmetic(b)) return false
  return a[1] - a[0] !== b[1] - b[0]
}

/** Any reading a child could defend. Used to prove a repair is the ONLY repair. */
export function readsAsPattern(xs: number[]): boolean {
  return isArithmetic(xs) || isInterleaved(xs)
}

/** Every position whose removal leaves a sequence that follows some rule. */
export function removableIndices(xs: number[]): number[] {
  const out: number[] = []
  for (let i = 0; i < xs.length; i++) {
    const rest = [...xs.slice(0, i), ...xs.slice(i + 1)]
    if (readsAsPattern(rest)) out.push(i)
  }
  return out
}

/**
 * The whole safety net. A generated problem ships only if:
 * - every term is a whole number 0–100 and no term repeats,
 * - the intact sequence really does follow its rule,
 * - and the damage has EXACTLY ONE repair.
 */
export function isSound(params: Params): boolean {
  if (!paramsSchema.safeParse(params).success) return false

  const clean = cleanTerms(params)
  if (clean.some((v) => !Number.isInteger(v) || v < 0 || v > 100)) return false
  if (new Set(clean).size !== clean.length) return false
  if (!readsAsPattern(clean)) return false

  const d = params.defect

  if (d.kind === 'interior-blank') {
    if (d.at < 1 || d.at > params.length - 2) return false
    // Uniqueness: exactly one whole number 0–100 can sit in the blank and still
    // leave a sequence that follows a rule.
    let fits = 0
    for (let v = 0; v <= 100; v++) {
      const candidate = clean.slice()
      candidate[d.at] = v
      if (readsAsPattern(candidate)) fits++
      if (fits > 1) return false
    }
    return fits === 1
  }

  if (d.kind === 'intruder') {
    if (d.at < 1 || d.at > params.length - 1) return false
    if (!Number.isInteger(d.value) || d.value < 0 || d.value > 100) return false
    const shown = displayNumbers(params)
    // The odd one out must be a value you can name without ambiguity.
    if (new Set(shown).size !== shown.length) return false
    // It must genuinely be broken as shown …
    if (readsAsPattern(shown)) return false
    // … and taking out exactly one number — this one — must fix it.
    const removable = removableIndices(shown)
    return removable.length === 1 && removable[0] === d.at
  }

  // hidden-run: the step has to be readable on BOTH sides of the dots, so at
  // least two terms stay visible on each side.
  if (params.rule.kind !== 'arithmetic') return false
  if (d.from < 2) return false
  if (d.from + d.count > params.length - 2) return false
  const before = clean[d.from - 1]
  const after = clean[d.from + d.count]
  const gap = Math.abs(after - before)
  return gap === (d.count + 1) * params.rule.step
}

// ── Generator ─────────────────────────────────────────────────────────────────

// Grade-1 friendly steps, weighted towards the ones kids skip-count with.
const FRIENDLY_STEPS = [1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 8, 9, 10, 10] as const
// An intruder has to fit strictly between two neighbours, so step 1 leaves no room.
const INTRUDER_STEPS = [2, 2, 3, 3, 4, 5, 5, 6, 7, 8, 9, 10, 10] as const

function makeArithmeticRule(
  rng: Rng,
  length: number,
  steps: readonly number[],
): ArithmeticRule | null {
  const step = rng.pick(steps)
  const span = (length - 1) * step
  if (span > 100) return null
  const direction: 'up' | 'down' = rng.int(1, 4) === 1 ? 'down' : 'up'
  const raw = direction === 'up' ? rng.int(0, 100 - span) : rng.int(span, 100)
  // Half the time, land the run on multiples of the step (5, 10, 15, … reads best).
  const snapped = raw - (raw % step)
  const start = rng.int(1, 2) === 1 && snapped >= (direction === 'up' ? 0 : span) ? snapped : raw
  return { kind: 'arithmetic', start, step, direction }
}

function makeInterleavedRule(rng: Rng, length: number): InterleavedRule | null {
  const nA = Math.ceil(length / 2)
  const nB = Math.floor(length / 2)
  const stepA = rng.pick([1, 2, 2, 3, 3, 4, 5])
  const startA = rng.int(1, 9)
  const maxA = startA + (nA - 1) * stepA
  const stepB = rng.pick([6, 7, 8, 9, 10, 10])
  // The big family always starts above the small family, so the two runs read as
  // "little numbers" vs "big numbers" instead of a jumble.
  let startB = maxA + rng.int(2, 12)
  if (rng.int(1, 2) === 1) startB += (stepB - (startB % stepB)) % stepB
  if (startB + (nB - 1) * stepB > 100) return null
  return { kind: 'interleaved', startA, stepA, startB, stepB }
}

/** Is `v` a member of the family that starts at `start` and moves by `step`? */
function inFamily(start: number, step: number, v: number): boolean {
  return Math.abs(v - start) % step === 0
}

function attemptInteriorBlank(rng: Rng): Params | null {
  if (rng.int(1, 5) >= 4) {
    const length = rng.int(6, 9)
    const rule = makeInterleavedRule(rng, length)
    if (!rule) return null
    return { rule, length, defect: { kind: 'interior-blank', at: rng.int(1, length - 2) } }
  }
  const length = rng.int(5, 9)
  const rule = makeArithmeticRule(rng, length, FRIENDLY_STEPS)
  if (!rule) return null
  return { rule, length, defect: { kind: 'interior-blank', at: rng.int(1, length - 2) } }
}

function attemptIntruder(rng: Rng): Params | null {
  if (rng.int(1, 5) >= 4) {
    const length = rng.int(6, 8)
    const rule = makeInterleavedRule(rng, length)
    if (!rule) return null
    const seed: Params = { rule, length, defect: { kind: 'intruder', at: 1, value: 0 } }
    const clean = cleanTerms(seed)
    const at = rng.int(1, length - 1)
    const anchor = clean[rng.int(1, 2) === 1 ? at - 1 : at]
    const value = anchor + rng.pick([-3, -2, -1, 1, 2, 3])
    if (value < 0 || value > 100) return null
    // The intruder must belong to NEITHER family — otherwise it is not an intruder.
    if (inFamily(rule.startA, rule.stepA, value)) return null
    if (inFamily(rule.startB, rule.stepB, value)) return null
    return { rule, length, defect: { kind: 'intruder', at, value } }
  }
  const length = rng.int(5, 8)
  const rule = makeArithmeticRule(rng, length, INTRUDER_STEPS)
  if (!rule) return null
  const seed: Params = { rule, length, defect: { kind: 'intruder', at: 1, value: 0 } }
  const clean = cleanTerms(seed)
  const at = rng.int(1, length - 1)
  // Wedge it strictly between two neighbours: the list stays in order, so the
  // only way to spot it is to check the step.
  const low = Math.min(clean[at - 1], clean[at])
  const value = low + rng.int(1, rule.step - 1)
  return { rule, length, defect: { kind: 'intruder', at, value } }
}

function attemptHiddenRun(rng: Rng): Params | null {
  const count = rng.int(2, 4)
  const minLength = count + 4 // two terms visible on each side of the dots
  const length = rng.int(minLength, 9)
  const rule = makeArithmeticRule(rng, length, FRIENDLY_STEPS)
  if (!rule) return null
  return { rule, length, defect: { kind: 'hidden-run', from: rng.int(2, length - count - 2), count } }
}

function attempt(rng: Rng): Params | null {
  const roll = rng.int(1, 12)
  if (roll <= 5) return attemptInteriorBlank(rng)
  if (roll <= 9) return attemptIntruder(rng)
  return attemptHiddenRun(rng)
}

// Hand-checked, always sound: 3, 6, __, 12, 15 → 9.
const FALLBACK: Params = {
  rule: { kind: 'arithmetic', start: 3, step: 3, direction: 'up' },
  length: 5,
  defect: { kind: 'interior-blank', at: 2 },
}

export function generate(rng: Rng): Params {
  for (let i = 0; i < 60; i++) {
    const candidate = attempt(rng)
    if (candidate && isSound(candidate)) return candidate
  }
  return FALLBACK
}

// ── Wording ───────────────────────────────────────────────────────────────────

export interface SequenceRepairText {
  seq: string
  condition_en: string
  condition_id: string
  question_en: string
  question_id: string
  body_en: string
  body_id: string
}

/**
 * Single source of truth for the body text. `breakdown.ts` binds its highlight
 * phrases to the very strings used here, so a phrase can never drift out of the
 * body.
 */
export function texts(params: Params): SequenceRepairText {
  const seq = sequenceText(params)
  const d = params.defect

  let intro_en: string
  let intro_id: string
  let condition_en: string
  let condition_id: string
  let question_en: string
  let question_id: string

  if (d.kind === 'interior-blank') {
    intro_id = 'Satu bilangan hilang dari barisan ini.'
    intro_en = 'One number is missing from this sequence.'
    condition_id = 'Satu bilangan hilang'
    condition_en = 'One number is missing'
    question_id = 'Bilangan berapa yang harus ditulis di tempat kosong?'
    question_en = 'What number belongs in the empty spot?'
  } else if (d.kind === 'intruder') {
    intro_id = 'Satu bilangan menyelinap masuk dan merusak pola barisan ini.'
    intro_en = 'One number sneaked in and broke the pattern of this sequence.'
    condition_id = 'menyelinap masuk dan merusak pola'
    condition_en = 'sneaked in and broke the pattern'
    question_id = 'Bilangan berapa yang harus dibuang agar polanya benar lagi?'
    question_en = 'Which number must be removed so the pattern is correct again?'
  } else {
    intro_id = 'Sebagian barisan ini tertutup titik-titik.'
    intro_en = 'Part of this sequence is covered by dots.'
    condition_id = 'tertutup titik-titik'
    condition_en = 'covered by dots'
    question_id = 'Ada berapa bilangan yang tersembunyi di balik titik-titik?'
    question_en = 'How many numbers are hidden behind the dots?'
  }

  return {
    seq,
    condition_en,
    condition_id,
    question_en,
    question_id,
    body_en: `${intro_en}\n\n${seq}\n\nFind: ${question_en}`,
    body_id: `${intro_id}\n\n${seq}\n\nCari: ${question_id}`,
  }
}

/** Compact rule label for the machine brief, e.g. `+3`, `-5`, `+2 / +10`. */
export function ruleLabel(params: Params): string {
  const rule = params.rule
  if (rule.kind === 'arithmetic') {
    return `${rule.direction === 'up' ? '+' : '-'}${rule.step}`
  }
  return `+${rule.stepA} / +${rule.stepB}`
}

// ── Hints ─────────────────────────────────────────────────────────────────────

/** All neighbour pairs in `xs` that skip over the damaged index. */
function intactPairs(xs: number[], skip: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = []
  for (let i = 0; i + 1 < xs.length; i++) {
    if (i !== skip && i + 1 !== skip) pairs.push([xs[i], xs[i + 1]])
  }
  return pairs
}

/** One family's terms in order, with `__` standing in for a blank. */
function familyText(clean: number[], parity: 0 | 1, blankAt: number | null): string {
  return clean
    .map((v, i) => (i % 2 !== parity ? null : i === blankAt ? BLANK : String(v)))
    .filter((v): v is string => v !== null)
    .join(', ')
}

function opWords(rule: ArithmeticRule): { id: string; en: string } {
  return rule.direction === 'up'
    ? { id: `tambah ${rule.step}`, en: `add ${rule.step}` }
    : { id: `kurang ${rule.step}`, en: `subtract ${rule.step}` }
}

function buildHints(params: Params): {
  hint_en: string
  hint_id: string
  hint_steps_en: string[]
  hint_steps_id: string[]
} {
  const clean = cleanTerms(params)
  const rule = params.rule
  const d = params.defect

  if (d.kind === 'interior-blank') {
    const hint_id =
      'Cari dulu aturan lompatannya dari bagian barisan yang masih utuh, lalu pakai aturan itu untuk mengisi tempat kosong.'
    const hint_en =
      'First read the jumping rule off the part that is still intact, then use that rule on the empty spot.'

    if (rule.kind === 'arithmetic') {
      const op = opWords(rule)
      const pairs = intactPairs(clean, d.at)
      const [f0, f1] = pairs[0]
      const [l0, l1] = pairs[pairs.length - 1]
      const prev = clean[d.at - 1]
      return {
        hint_id,
        hint_en,
        hint_steps_id: [
          `Lihat dua bilangan yang bersebelahan: ${f0} lalu ${f1}. Bedanya ${rule.step}.`,
          `Cek di tempat lain: ${l0} lalu ${l1}, bedanya juga ${rule.step}. Jadi aturannya ${op.id}.`,
          `Tempat kosong ada tepat setelah ${prev}. Pakai aturan itu pada ${prev} — ${op.id}.`,
        ],
        hint_steps_en: [
          `Look at two numbers side by side: ${f0} then ${f1}. The gap is ${rule.step}.`,
          `Check somewhere else: ${l0} then ${l1} — the gap is ${rule.step} too. So the rule is ${op.en}.`,
          `The empty spot comes right after ${prev}. Apply that rule to ${prev} — ${op.en}.`,
        ],
      }
    }

    const smallIsBlank = d.at % 2 === 0
    const famId = smallIsBlank ? 'kecil' : 'besar'
    const famEn = smallIsBlank ? 'small' : 'big'
    const famStep = smallIsBlank ? rule.stepA : rule.stepB
    return {
      hint_id,
      hint_en,
      hint_steps_id: [
        'Barisan ini berselang-seling: bilangan kecil, bilangan besar, bilangan kecil, dan seterusnya.',
        `Bilangan kecil: ${familyText(clean, 0, d.at)} — tambah ${rule.stepA}. Bilangan besar: ${familyText(clean, 1, d.at)} — tambah ${rule.stepB}.`,
        `Tempat kosong ada di keluarga bilangan ${famId}. Terapkan aturan keluarga itu — tambah ${famStep}.`,
      ],
      hint_steps_en: [
        'This sequence takes turns: a small number, a big number, a small number, and so on.',
        `Small numbers: ${familyText(clean, 0, d.at)} — add ${rule.stepA}. Big numbers: ${familyText(clean, 1, d.at)} — add ${rule.stepB}.`,
        `The empty spot belongs to the ${famEn} family. Apply that family's rule — add ${famStep}.`,
      ],
    }
  }

  if (d.kind === 'intruder') {
    const hint_id =
      'Temukan aturan lompatannya, lalu telusuri barisan sampai bertemu bilangan yang tidak mengikuti aturan itu.'
    const hint_en =
      'Find the jumping rule, then walk along the sequence until you meet the number that does not follow it.'
    const shown = displayNumbers(params)

    if (rule.kind === 'arithmetic') {
      const op = opWords(rule)
      const pairs = intactPairs(shown, d.at)
      const [f0, f1] = pairs[0]
      const [l0, l1] = pairs[pairs.length - 1]
      return {
        hint_id,
        hint_en,
        hint_steps_id: [
          `Lihat dua bilangan yang bersebelahan: ${f0} lalu ${f1}. Bedanya ${rule.step}.`,
          `Cek di tempat lain: ${l0} lalu ${l1}, bedanya juga ${rule.step}. Jadi aturannya ${op.id}.`,
          `Telusuri barisan dari depan sambil ${op.id}. Bilangan pertama yang tidak cocok itulah yang harus dibuang.`,
        ],
        hint_steps_en: [
          `Look at two numbers side by side: ${f0} then ${f1}. The gap is ${rule.step}.`,
          `Check somewhere else: ${l0} then ${l1} — the gap is ${rule.step} too. So the rule is ${op.en}.`,
          `Walk along the sequence, ${op.en} each time. The first number that does not fit is the one to remove.`,
        ],
      }
    }

    return {
      hint_id,
      hint_en,
      hint_steps_id: [
        'Barisan ini berselang-seling: ada keluarga bilangan kecil dan keluarga bilangan besar.',
        `Keluarga kecil mulai dari ${rule.startA} dan tambah ${rule.stepA}. Keluarga besar mulai dari ${rule.startB} dan tambah ${rule.stepB}.`,
        'Cocokkan setiap bilangan dengan salah satu keluarga. Bilangan yang tidak masuk keluarga mana pun harus dibuang.',
      ],
      hint_steps_en: [
        'This sequence takes turns: there is a small-number family and a big-number family.',
        `The small family starts at ${rule.startA} and adds ${rule.stepA}. The big family starts at ${rule.startB} and adds ${rule.stepB}.`,
        'Match every number to one family. The number that fits neither family is the one to remove.',
      ],
    }
  }

  // hidden-run — always arithmetic (guarded by isSound).
  const step = rule.kind === 'arithmetic' ? rule.step : 1
  const op =
    rule.kind === 'arithmetic' ? opWords(rule) : { id: `tambah ${step}`, en: `add ${step}` }
  const before = clean[d.from - 1]
  const after = clean[d.from + d.count]
  const last = clean.length - 1
  return {
    hint_id:
      'Temukan aturan lompatannya, lalu hitung berapa lompatan dari bilangan sebelum titik-titik sampai bilangan sesudahnya.',
    hint_en:
      'Find the jumping rule, then count the jumps from the number before the dots to the number after them.',
    hint_steps_id: [
      `Dua bilangan pertama, ${clean[0]} lalu ${clean[1]}, bedanya ${step}. Jadi aturannya ${op.id}.`,
      `Cek ujung kanan juga: ${clean[last - 1]} lalu ${clean[last]}, bedanya ${step}. Aturannya sama.`,
      `Mulai dari ${before}, lompat ${op.id} terus sampai ${after}. Hitung bilangan yang kamu sebut sebelum sampai ${after}.`,
    ],
    hint_steps_en: [
      `The first two numbers, ${clean[0]} then ${clean[1]}, are ${step} apart. So the rule is ${op.en}.`,
      `Check the right end too: ${clean[last - 1]} then ${clean[last]} are ${step} apart. Same rule.`,
      `Start at ${before} and keep jumping (${op.en}) until you reach ${after}. Count the numbers you say before ${after}.`,
    ],
  }
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render(params: Params) {
  const t = texts(params)
  const hints = buildHints(params)

  return {
    body_en: t.body_en,
    body_id: t.body_id,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: answerOf(params),
    hint_en: hints.hint_en,
    hint_id: hints.hint_id,
    hint_steps_en: hints.hint_steps_en,
    hint_steps_id: hints.hint_steps_id,
    breakdown: buildSequenceRepairBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
