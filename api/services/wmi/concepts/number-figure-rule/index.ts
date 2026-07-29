import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildNumberFigureRuleBreakdown } from './breakdown.js'

// One number group inside the decorated figure: two given slots and a result
// slot, always related by the SAME hidden rule across all three groups.
const tripleSchema = z.object({
  a: z.number().int().min(0).max(20),
  b: z.number().int().min(0).max(20),
  c: z.number().int().min(0).max(20),
})

const paramsSchema = z.object({
  layout: z.enum(['quartered-circle', 'triangle', 'chain']),
  rule: z.enum(['sum', 'diff', 'sum-minus-one']),
  // Exactly 3 groups: [0] and [1] are drawn complete (they teach the rule),
  // [2] is drawn with one slot blanked out.
  groups: z.array(tripleSchema).length(3),
  blankPosition: z.enum(['a', 'b', 'c']),
})
export type Params = z.infer<typeof paramsSchema>
export type Triple = Params['groups'][number]
export type RuleKind = Params['rule']
export type Slot = Params['blankPosition']
export type LayoutKind = Params['layout']

export const meta = {
  slug: 'number-figure-rule',
  name_en: 'Find the hidden number rule',
  name_id: 'Cari aturan di gambar angka',
  grades: [1] as const,
  description_id:
    'Dua gambar sudah lengkap dan memakai aturan yang sama. Temukan aturannya, lalu isi angka yang hilang di gambar terakhir.',
} as const

// ---------------------------------------------------------------------------
// Rule helpers — every group obeys c = f(a, b).
// ---------------------------------------------------------------------------

/** The result slot value implied by the rule. Never negative, never above 20. */
export function applyRule(rule: RuleKind, a: number, b: number): number {
  if (rule === 'sum') return a + b
  if (rule === 'diff') return a - b
  return a + b - 1
}

/** The missing number: the true value sitting in the blanked slot of group 3. */
export function missingValue(params: Params): number {
  return params.groups[2][params.blankPosition]
}

/** Compact text form of one group, e.g. "3, 4 → 7" (or "3, ? → 7"). */
export function groupText(t: Triple, blank: Slot | null): string {
  const cell = (slot: Slot) => (blank === slot ? '?' : String(t[slot]))
  return `${cell('a')}, ${cell('b')} → ${cell('c')}`
}

/** Kid-voice wording of the hidden rule, used once it has been deduced. */
export function ruleWords(rule: RuleKind): { en: string; id: string } {
  if (rule === 'sum') {
    return {
      en: 'add the first two numbers',
      id: 'angka pertama ditambah angka kedua',
    }
  }
  if (rule === 'diff') {
    return {
      en: 'take the second number away from the first',
      id: 'angka pertama dikurangi angka kedua',
    }
  }
  return {
    en: 'add the first two numbers, then take away 1',
    id: 'angka pertama ditambah angka kedua, lalu dikurangi 1',
  }
}

/** The one worked line that applies the deduced rule to the last group. */
export function solutionLine(params: Params): { en: string; id: string } {
  const { a, b, c } = params.groups[2]
  const ans = missingValue(params)
  const slot = params.blankPosition

  if (params.rule === 'sum') {
    if (slot === 'c') return { en: `${a} + ${b} = ${ans}`, id: `${a} + ${b} = ${ans}` }
    if (slot === 'a') {
      return {
        en: `? + ${b} = ${c}, so ? = ${c} − ${b} = ${ans}`,
        id: `? + ${b} = ${c}, jadi ? = ${c} − ${b} = ${ans}`,
      }
    }
    return {
      en: `${a} + ? = ${c}, so ? = ${c} − ${a} = ${ans}`,
      id: `${a} + ? = ${c}, jadi ? = ${c} − ${a} = ${ans}`,
    }
  }

  if (params.rule === 'diff') {
    if (slot === 'c') return { en: `${a} − ${b} = ${ans}`, id: `${a} − ${b} = ${ans}` }
    if (slot === 'a') {
      return {
        en: `? − ${b} = ${c}, so ? = ${c} + ${b} = ${ans}`,
        id: `? − ${b} = ${c}, jadi ? = ${c} + ${b} = ${ans}`,
      }
    }
    return {
      en: `${a} − ? = ${c}, so ? = ${a} − ${c} = ${ans}`,
      id: `${a} − ? = ${c}, jadi ? = ${a} − ${c} = ${ans}`,
    }
  }

  if (slot === 'c') {
    return { en: `${a} + ${b} − 1 = ${ans}`, id: `${a} + ${b} − 1 = ${ans}` }
  }
  if (slot === 'a') {
    return {
      en: `? + ${b} − 1 = ${c}, so ? = ${c} + 1 − ${b} = ${ans}`,
      id: `? + ${b} − 1 = ${c}, jadi ? = ${c} + 1 − ${b} = ${ans}`,
    }
  }
  return {
    en: `${a} + ? − 1 = ${c}, so ? = ${c} + 1 − ${a} = ${ans}`,
    id: `${a} + ? − 1 = ${c}, jadi ? = ${c} + 1 − ${a} = ${ans}`,
  }
}

/**
 * The tempting wrong number, when one genuinely exists: the value a child gets
 * by reaching for the wrong operation (adding everything in sight, or forgetting
 * the "take away 1"). Returns null when that slip lands outside 0..20 or happens
 * to equal the right answer — no fake traps.
 */
export function trapFor(
  params: Params,
): { wrong: string; why_en: string; why_id: string } | null {
  const { a, b, c } = params.groups[2]
  const slot = params.blankPosition
  const correct = missingValue(params)

  let wrong: number | null
  let why_en = ''
  let why_id = ''

  if (params.rule === 'sum-minus-one') {
    // Reads the rule as plain addition and forgets the "take away 1".
    wrong = slot === 'c' ? a + b : slot === 'a' ? c - b : c - a
    why_en = 'That is what you get by only adding — the finished figures also take 1 away.'
    why_id = 'Itu hasilnya kalau cuma dijumlahkan — di gambar yang lengkap masih dikurangi 1.'
  } else if (params.rule === 'sum') {
    // Adds the two numbers it can see, even when the blank is an input slot.
    wrong = slot === 'a' ? c + b : slot === 'b' ? c + a : null
    why_en = 'That is what you get by adding the two numbers you can see, but here the gap is one of the numbers being added.'
    why_id = 'Itu hasilnya kalau dua angka yang terlihat langsung dijumlahkan, padahal yang kosong justru salah satu angka yang dijumlahkan.'
  } else if (slot === 'c') {
    why_en = 'That is what you get by adding, but the finished figures take away instead.'
    why_id = 'Itu hasilnya kalau dijumlahkan, padahal di gambar yang lengkap justru dikurangi.'
    wrong = a + b
  } else if (slot === 'a') {
    why_en = 'That is what you get by taking away again, but to find the first number you have to put the two back together.'
    why_id = 'Itu hasilnya kalau dikurangi lagi, padahal untuk mencari angka pertama keduanya harus digabung.'
    wrong = c - b
  } else {
    why_en = 'That is what you get by adding, but this gap has to be taken away from the first number.'
    why_id = 'Itu hasilnya kalau dijumlahkan, padahal angka ini harus dicari dengan mengurangi dari angka pertama.'
    wrong = a + c
  }

  if (wrong === null || wrong < 0 || wrong > 20 || wrong === correct) return null
  return { wrong: String(wrong), why_en, why_id }
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

// Every candidate triple a grade-1 child can safely handle for this rule:
// all three slots land in 1..18, nothing goes negative, no degenerate group
// (a === b would also read as "double it"; a 1 in a sum-minus-one group would
// also read as "just copy the other number").
function candidatesFor(rule: RuleKind): Triple[] {
  const out: Triple[] = []
  if (rule === 'diff') {
    // a = b + c keeps the subtraction exact and non-negative.
    for (let b = 2; b <= 8; b++) {
      for (let c = 2; c <= 9; c++) {
        if (b === c) continue
        out.push({ a: b + c, b, c })
      }
    }
    return out
  }
  for (let a = 2; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      if (a === b) continue
      out.push({ a, b, c: applyRule(rule, a, b) })
    }
  }
  return out
}

// Greedy pick of 3 groups, loosening the "all slots differ" wish only if the
// shuffled pool cannot satisfy it — so generate() always returns 3 groups.
function pickGroups(rng: Rng, rule: RuleKind): Triple[] {
  const pool = rng.shuffle(candidatesFor(rule))
  const passes: Array<(chosen: Triple[], t: Triple) => boolean> = [
    (chosen, t) => chosen.every((g) => g.a !== t.a && g.b !== t.b && g.c !== t.c),
    (chosen, t) => chosen.every((g) => g.a !== t.a && g.b !== t.b),
    (chosen, t) => chosen.every((g) => g.a !== t.a || g.b !== t.b),
  ]
  const chosen: Triple[] = []
  for (const ok of passes) {
    for (const t of pool) {
      if (chosen.length === 3) break
      if (chosen.includes(t)) continue
      if (ok(chosen, t)) chosen.push(t)
    }
    if (chosen.length === 3) break
  }
  return chosen
}

export function generate(rng: Rng): Params {
  const layout = rng.pick(['quartered-circle', 'triangle', 'chain'] as const)
  const rule = rng.pick(['sum', 'diff', 'sum-minus-one'] as const)
  const groups = pickGroups(rng, rule)
  const blankPosition = rng.pick(['a', 'b', 'c'] as const)
  return { layout, rule, groups, blankPosition }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

export function render(params: Params) {
  const [g1, g2, g3] = params.groups
  const t1 = groupText(g1, null)
  const t2 = groupText(g2, null)
  const t3 = groupText(g3, params.blankPosition)
  const answer = missingValue(params)
  const words = ruleWords(params.rule)
  const line = solutionLine(params)

  const hint_steps_en = [
    `Figure 1: ${g1.a} and ${g1.b} become ${g1.c}. What could the rule be?`,
    `Figure 2 does the same: ${g2.a} and ${g2.b} become ${g2.c}. So the rule is: ${words.en}.`,
    `Now use that rule on figure 3: ${line.en}.`,
  ]
  const hint_steps_id = [
    `Gambar 1: ${g1.a} dan ${g1.b} jadi ${g1.c}. Aturannya apa ya?`,
    `Gambar 2 juga begitu: ${g2.a} dan ${g2.b} jadi ${g2.c}. Jadi aturannya: ${words.id}.`,
    `Sekarang pakai aturan itu di gambar 3: ${line.id}.`,
  ]

  return {
    body_en: `The same rule is used in every figure.\nFigure 1: ${t1}\nFigure 2: ${t2}\nFigure 3: ${t3}\n\nFind: What is the missing number?`,
    body_id: `Aturan yang sama dipakai di setiap gambar.\nGambar 1: ${t1}\nGambar 2: ${t2}\nGambar 3: ${t3}\n\nCari: Berapa angka yang hilang?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en:
      'The first two figures are already complete. Find one rule that works for BOTH of them, then use that same rule on the last figure.',
    hint_id:
      'Dua gambar pertama sudah lengkap. Cari satu aturan yang cocok untuk KEDUANYA, lalu pakai aturan itu di gambar terakhir.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildNumberFigureRuleBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
