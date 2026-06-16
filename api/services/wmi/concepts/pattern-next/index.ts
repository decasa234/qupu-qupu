import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildPatternNextBreakdown } from './breakdown.js'

// ── Mode schemas ──────────────────────────────────────────────────────────────

const arithmeticSchema = z.object({
  mode: z.literal('arithmetic'),
  /** First term (1–15) */
  start: z.number().int().min(1).max(15),
  /** Constant step added each term (1–9) */
  step: z.number().int().min(1).max(9),
})

const secondDiffSchema = z.object({
  mode: z.literal('second-diff'),
  /** First term (1–10) */
  start: z.number().int().min(1).max(10),
  /** First gap (the gap between term0 and term1) */
  diff0: z.number().int().min(1).max(5),
  /** Amount by which each successive gap grows (2nd difference, constant) */
  diffStep: z.number().int().min(1).max(4),
})

const altRuleSchema = z.object({
  mode: z.literal('alt-rule'),
  /** First term (1–5) */
  start: z.number().int().min(1).max(5),
  /** Amount added on even-indexed gaps (0→1, 2→3, …) */
  addK: z.number().int().min(2).max(6),
  /** Multiplier applied on odd-indexed gaps (1→2, 3→4, …) */
  mulK: z.number().int().min(2).max(3),
})

export const paramsSchema = z.discriminatedUnion('mode', [
  arithmeticSchema,
  secondDiffSchema,
  altRuleSchema,
])

export type Params = z.infer<typeof paramsSchema>

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta = {
  slug: 'pattern-next',
  name_en: 'Next in pattern',
  name_id: 'Pola berikutnya',
  grades: [1, 2] as const,
  description_id: 'Tebak angka berikutnya dalam sebuah pola.',
} as const

// ── Generator ─────────────────────────────────────────────────────────────────

/**
 * Mix of modes:
 * - 50 % arithmetic (gentle — G1 accessible)
 * - 30 % second-diff (growing gaps — olympiad flavour)
 * - 20 % alt-rule (+k then ×m alternating — two-operation, harder)
 */
export function generate(rng: Rng): Params {
  const roll = rng.int(1, 10)

  if (roll <= 5) {
    // arithmetic: widen range vs. old (was start 1-9, step 1-3)
    return {
      mode: 'arithmetic',
      start: rng.int(1, 15),
      step: rng.int(1, 9),
    }
  }

  if (roll <= 8) {
    // second-diff: gaps grow by a constant second-difference
    return {
      mode: 'second-diff',
      start: rng.int(1, 10),
      diff0: rng.int(1, 5),
      diffStep: rng.int(1, 4),
    }
  }

  // alt-rule: alternating +addK and ×mulK
  return {
    mode: 'alt-rule',
    start: rng.int(1, 5),
    addK: rng.int(2, 6),
    mulK: rng.int(2, 3),
  }
}

// ── Sequence builders ─────────────────────────────────────────────────────────

/** Build the shown terms and the correct next term for any mode. */
function buildSequence(params: Params): { shown: number[]; correct: number } {
  if (params.mode === 'arithmetic') {
    const { start, step } = params
    const shown = [0, 1, 2].map((i) => start + i * step)
    return { shown, correct: start + 3 * step }
  }

  if (params.mode === 'second-diff') {
    const { start, diff0, diffStep } = params
    // gaps: diff0, diff0+diffStep, diff0+2*diffStep, diff0+3*diffStep
    const gaps = [0, 1, 2, 3].map((i) => diff0 + i * diffStep)
    const shown: number[] = [start]
    for (let i = 0; i < 3; i++) shown.push(shown[i] + gaps[i])
    const correct = shown[3] + gaps[3]
    return { shown, correct }
  }

  // alt-rule: step i (0-indexed) → even i: ×mulK, odd i: +addK
  // step 0: ×, step 1: +, step 2: ×, step 3: +
  const { start, addK, mulK } = params
  const shown: number[] = [start]
  for (let i = 0; i < 3; i++) {
    const prev = shown[i]
    shown.push(i % 2 === 0 ? prev * mulK : prev + addK)
  }
  // Step index 3 is odd → +addK
  const correct = shown[3] + addK
  return { shown, correct }
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render(params: Params) {
  const { shown, correct } = buildSequence(params)

  // Distractors: plausible wrong answers
  let distractors: number[]
  if (params.mode === 'arithmetic') {
    distractors = [correct - 1, correct + 1, correct + params.step + 1].filter(
      (v) => v !== correct && v > 0,
    )
  } else if (params.mode === 'second-diff') {
    // Common mistake: apply the last-seen gap again instead of growing it
    const lastGap = params.diff0 + 2 * params.diffStep
    const wrongFlat = shown[3] + lastGap          // forgot the gap grows
    const wrongSmall = shown[3] + params.diff0     // used first gap throughout
    distractors = [wrongFlat, wrongSmall, correct - 1].filter(
      (v) => v !== correct && v > 0,
    )
  } else {
    // alt-rule: correct is +addK. Common mistake: applied ×mulK instead.
    const wrongMul = shown[3] * params.mulK
    distractors = [wrongMul, correct - 1, correct + 1].filter(
      (v) => v !== correct && v > 0,
    )
  }

  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  const choicesEN = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const choicesID = labels.map((label, i) => ({ label, text: String(values[i]) }))
  const answerLabel = labels[values.indexOf(correct)]
  const seqText = shown.join(', ')

  // Mode-specific hints
  let hint_en: string
  let hint_id: string
  let hint_steps_en: string[]
  let hint_steps_id: string[]

  if (params.mode === 'arithmetic') {
    hint_en = `Find the rule by looking at the difference between each pair of consecutive terms.`
    hint_id = `Temukan aturannya dengan melihat selisih antara setiap dua suku yang berurutan.`
    hint_steps_en = [
      `The sequence starts at ${shown[0]}.`,
      `Each term increases by ${params.step}: ${shown[0]} → ${shown[1]} → ${shown[2]}.`,
      `Add ${params.step} to the last term: ${shown[2]} + ${params.step} = ${correct}.`,
    ]
    hint_steps_id = [
      `Barisan dimulai dari ${shown[0]}.`,
      `Setiap suku bertambah ${params.step}: ${shown[0]} → ${shown[1]} → ${shown[2]}.`,
      `Tambahkan ${params.step} ke suku terakhir: ${shown[2]} + ${params.step} = ${correct}.`,
    ]
  } else if (params.mode === 'second-diff') {
    const gaps = [0, 1, 2, 3].map((i) => params.diff0 + i * params.diffStep)
    hint_en = `Look at the gaps between terms — do the gaps themselves follow a pattern?`
    hint_id = `Perhatikan selisih antar suku — apakah selisihnya sendiri mengikuti pola?`
    hint_steps_en = [
      `Gaps between terms: ${shown[1] - shown[0]}, ${shown[2] - shown[1]}, ${shown[3] - shown[2]}. Each gap grows by ${params.diffStep}.`,
      `The next gap must be ${shown[3] - shown[2]} + ${params.diffStep} = ${gaps[3]}.`,
      `Add that gap: ${shown[3]} + ${gaps[3]} = ${correct}.`,
    ]
    hint_steps_id = [
      `Selisih antar suku: ${shown[1] - shown[0]}, ${shown[2] - shown[1]}, ${shown[3] - shown[2]}. Setiap selisih bertambah ${params.diffStep}.`,
      `Selisih berikutnya adalah ${shown[3] - shown[2]} + ${params.diffStep} = ${gaps[3]}.`,
      `Tambahkan selisih itu: ${shown[3]} + ${gaps[3]} = ${correct}.`,
    ]
  } else {
    hint_en = `Two rules alternate: ×${params.mulK} then +${params.addK}. Which rule applies next?`
    hint_id = `Dua aturan berselang-seling: ×${params.mulK} lalu +${params.addK}. Aturan mana yang berlaku selanjutnya?`
    hint_steps_en = [
      `Pattern alternates: ×${params.mulK}, +${params.addK}, ×${params.mulK}, +${params.addK}, ...`,
      `The last shown step (${shown[2]} → ${shown[3]}) used ×${params.mulK}. So next rule is +${params.addK}.`,
      `${shown[3]} + ${params.addK} = ${correct}.`,
    ]
    hint_steps_id = [
      `Pola berselang-seling: ×${params.mulK}, +${params.addK}, ×${params.mulK}, +${params.addK}, ...`,
      `Langkah terakhir (${shown[2]} → ${shown[3]}) menggunakan ×${params.mulK}. Jadi aturan berikutnya +${params.addK}.`,
      `${shown[3]} + ${params.addK} = ${correct}.`,
    ]
  }

  return {
    body_en: `${seqText}, ?\n\nFind: What number comes next in the sequence?`,
    body_id: `${seqText}, ?\n\nCari: Angka berapa yang muncul berikutnya dalam barisan ini?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choicesEN,
    choices_id: choicesID,
    answer: answerLabel,
    hint_en,
    hint_id,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildPatternNextBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
