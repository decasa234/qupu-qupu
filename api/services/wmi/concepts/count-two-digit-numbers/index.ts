import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCountTwoDigitNumbersBreakdown } from './breakdown.js'

// A rule a two-digit number must obey. Kept as a tiny vocabulary so the wording
// stays grade-1 short and so every rule can be checked by plain enumeration.
const tensSchema = z.object({
  kind: z.literal('tens'),
  cmp: z.enum(['gt', 'lt', 'eq']),
  v: z.number().int().min(0).max(9),
})
const unitsSchema = z.object({
  kind: z.literal('units'),
  cmp: z.enum(['gt', 'lt', 'eq']),
  v: z.number().int().min(0).max(9),
})
const digitSumSchema = z.object({
  kind: z.literal('digit-sum'),
  v: z.number().int().min(1).max(18),
})
const betweenSchema = z.object({
  kind: z.literal('between'),
  lo: z.number().int().min(10).max(99),
  hi: z.number().int().min(10).max(99),
})

const constraintSchema = z.discriminatedUnion('kind', [
  tensSchema,
  unitsSchema,
  digitSumSchema,
  betweenSchema,
])
export type Constraint = z.infer<typeof constraintSchema>

const paramsSchema = z.object({
  constraints: z.array(constraintSchema).min(1).max(2),
  ask: z.enum(['how-many', 'largest-minus-smallest']),
})
export type Params = z.infer<typeof paramsSchema>
type Ask = Params['ask']

export const meta = {
  slug: 'count-two-digit-numbers',
  name_en: 'How many 2-digit numbers fit the rule',
  name_id: 'Berapa banyak bilangan dua angka?',
  grades: [1] as const,
  description_id:
    'Hitung ada berapa bilangan dua angka (10–99) yang memenuhi aturan angka puluhan dan angka satuannya.',
} as const

function compareDigit(d: number, cmp: 'gt' | 'lt' | 'eq', v: number): boolean {
  if (cmp === 'gt') return d > v
  if (cmp === 'lt') return d < v
  return d === v
}

// True when n obeys the single rule c. Reads the digits straight off n, so a
// one-digit n is treated as tens digit 0 — that is exactly what makes the
// leading-zero trap below computable.
export function holds(c: Constraint, n: number): boolean {
  const t = Math.floor(n / 10)
  const u = n % 10
  if (c.kind === 'tens') return compareDigit(t, c.cmp, c.v)
  if (c.kind === 'units') return compareDigit(u, c.cmp, c.v)
  if (c.kind === 'digit-sum') return t + u === c.v
  return n >= c.lo && n <= c.hi
}

// The answer set, found by ACTUALLY walking every two-digit number and keeping
// the ones that obey every rule — never by a closed-form shortcut.
export function qualifying(p: Params): number[] {
  const out: number[] = []
  for (let n = 10; n <= 99; n++) {
    if (p.constraints.every((c) => holds(c, n))) out.push(n)
  }
  return out
}

// One-digit values that WOULD obey the rules if a leading zero were allowed
// ("08" for a digit sum of 8). These are the classic over-count trap.
export function phantomLeadingZeros(p: Params): number[] {
  const out: number[] = []
  for (let n = 0; n <= 9; n++) {
    if (p.constraints.every((c) => holds(c, n))) out.push(n)
  }
  return out
}

export function answerOf(p: Params): number {
  const set = qualifying(p)
  if (p.ask === 'how-many') return set.length
  return set[set.length - 1] - set[0]
}

// --- wording -----------------------------------------------------------------
// Each rule renders as one short clause. The clauses are joined with "dan"/"and"
// and dropped verbatim into the body, so the breakdown can reuse them as
// highlight phrases without any risk of drift.
export function clauseId(c: Constraint): string {
  if (c.kind === 'tens') {
    if (c.cmp === 'gt') return `angka puluhannya lebih dari ${c.v}`
    if (c.cmp === 'lt') return `angka puluhannya kurang dari ${c.v}`
    return `angka puluhannya ${c.v}`
  }
  if (c.kind === 'units') {
    if (c.cmp === 'gt') return `angka satuannya lebih dari ${c.v}`
    if (c.cmp === 'lt') return `angka satuannya kurang dari ${c.v}`
    return `angka satuannya ${c.v}`
  }
  if (c.kind === 'digit-sum') return `jumlah kedua angkanya ${c.v}`
  return `nilainya dari ${c.lo} sampai ${c.hi}`
}

export function clauseEn(c: Constraint): string {
  if (c.kind === 'tens') {
    if (c.cmp === 'gt') return `the tens digit is greater than ${c.v}`
    if (c.cmp === 'lt') return `the tens digit is less than ${c.v}`
    return `the tens digit is ${c.v}`
  }
  if (c.kind === 'units') {
    if (c.cmp === 'gt') return `the ones digit is greater than ${c.v}`
    if (c.cmp === 'lt') return `the ones digit is less than ${c.v}`
    return `the ones digit is ${c.v}`
  }
  if (c.kind === 'digit-sum') return `the two digits add up to ${c.v}`
  return `the value is from ${c.lo} to ${c.hi}`
}

export function questionId(ask: Ask): string {
  return ask === 'how-many'
    ? 'Ada berapa bilangan yang cocok?'
    : 'Berapa selisih bilangan terbesar dan bilangan terkecil yang cocok?'
}

export function questionEn(ask: Ask): string {
  return ask === 'how-many'
    ? 'How many numbers fit the rule?'
    : 'What is the difference between the largest and the smallest number that fits?'
}

// --- generation --------------------------------------------------------------
// Bands are kept narrow on purpose: the qualifying set must stay small enough
// for a six-year-old to list by hand (the accept check below caps it at 20).
const NARROW_TENS: readonly Constraint[] = [
  { kind: 'tens', cmp: 'gt', v: 7 }, // 80..99 -> 20
  { kind: 'tens', cmp: 'gt', v: 8 }, // 90..99 -> 10
  { kind: 'tens', cmp: 'lt', v: 2 }, // 10..19 -> 10
  { kind: 'tens', cmp: 'lt', v: 3 }, // 10..29 -> 20
]
const NARROW_UNITS: readonly Constraint[] = [
  { kind: 'units', cmp: 'lt', v: 1 }, // 9
  { kind: 'units', cmp: 'lt', v: 2 }, // 18
  { kind: 'units', cmp: 'gt', v: 7 }, // 18
  { kind: 'units', cmp: 'gt', v: 8 }, // 9
]
// Full bands, only ever used where a second rule cuts them back down.
const TENS_BANDS: readonly Constraint[] = [
  ...Array.from({ length: 8 }, (_, i) => ({ kind: 'tens' as const, cmp: 'gt' as const, v: i + 1 })),
  ...Array.from({ length: 8 }, (_, i) => ({ kind: 'tens' as const, cmp: 'lt' as const, v: i + 2 })),
]
const UNITS_BANDS: readonly Constraint[] = [
  ...Array.from({ length: 9 }, (_, i) => ({ kind: 'units' as const, cmp: 'gt' as const, v: i })),
  ...Array.from({ length: 9 }, (_, i) => ({ kind: 'units' as const, cmp: 'lt' as const, v: i + 1 })),
]

const BOTH_ASKS: readonly Ask[] = ['how-many', 'largest-minus-smallest']
const COUNT_ONLY: readonly Ask[] = ['how-many']

type Template = { asks: readonly Ask[]; build(rng: Rng): Constraint[] }

// Every template is a rejection candidate: generate() enumerates the set it
// produces and only keeps it when the set has 3..20 members.
const TEMPLATES: readonly Template[] = [
  // digit sum alone — 3..9 numbers, and "0k" is the tempting extra
  { asks: BOTH_ASKS, build: (r) => [{ kind: 'digit-sum', v: r.int(3, 16) }] },
  // one exact ones digit — 9 numbers, "0k" tempts again
  { asks: COUNT_ONLY, build: (r) => [{ kind: 'units', cmp: 'eq', v: r.int(0, 9) }] },
  // a narrow tens band
  { asks: COUNT_ONLY, build: (r) => [{ ...r.pick(NARROW_TENS) }] },
  // a narrow ones band
  { asks: BOTH_ASKS, build: (r) => [{ ...r.pick(NARROW_UNITS) }] },
  // a plain run of numbers — the fencepost trap
  {
    asks: COUNT_ONLY,
    build: (r) => {
      const lo = r.int(10, 78)
      return [{ kind: 'between', lo, hi: Math.min(99, lo + r.int(2, 19)) }]
    },
  },
  // tens band + ones band — the classic WMI shape
  { asks: BOTH_ASKS, build: (r) => [{ ...r.pick(TENS_BANDS) }, { ...r.pick(UNITS_BANDS) }] },
  // exact ones digit inside a range — the other WMI shape
  {
    asks: BOTH_ASKS,
    build: (r) => {
      const lo = r.int(1, 4) * 10
      return [
        { kind: 'units', cmp: 'eq', v: r.int(0, 9) },
        { kind: 'between', lo, hi: lo + r.int(3, 5) * 10 },
      ]
    },
  },
  // one whole decade, cut by a ones band
  {
    asks: BOTH_ASKS,
    build: (r) => [{ kind: 'tens', cmp: 'eq', v: r.int(1, 9) }, { ...r.pick(UNITS_BANDS) }],
  },
  // digit sum inside a range
  {
    asks: BOTH_ASKS,
    build: (r) => {
      const lo = r.int(1, 3) * 10
      return [
        { kind: 'digit-sum', v: r.int(4, 14) },
        { kind: 'between', lo, hi: Math.min(99, lo + r.int(30, 60)) },
      ]
    },
  },
  // a range, cut by a narrow ones band
  {
    asks: BOTH_ASKS,
    build: (r) => {
      const lo = r.int(1, 5) * 10
      return [
        { kind: 'between', lo, hi: Math.min(99, lo + r.int(19, 49)) },
        { ...r.pick(NARROW_UNITS) },
      ]
    },
  },
  // tens band + one exact ones digit
  {
    asks: BOTH_ASKS,
    build: (r) => [{ ...r.pick(TENS_BANDS) }, { kind: 'units', cmp: 'eq', v: r.int(0, 9) }],
  },
]

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 400; attempt++) {
    const template = TEMPLATES[rng.int(0, TEMPLATES.length - 1)]
    const constraints = template.build(rng)
    const ask = template.asks.length === 1 ? template.asks[0] : rng.pick(template.asks)
    const candidate: Params = { constraints, ask }
    const set = qualifying(candidate)
    // Never trivial (0 or 1 answers), never a listing chore for a six-year-old.
    if (set.length < 3 || set.length > 20) continue
    return candidate
  }
  // Unreachable in practice; digit sum 8 always yields 8 numbers (17..80).
  return { constraints: [{ kind: 'digit-sum', v: 8 }], ask: 'how-many' }
}

export function render(params: Params) {
  const listId = params.constraints.map(clauseId).join(' dan ')
  const listEn = params.constraints.map(clauseEn).join(' and ')
  const answer = answerOf(params)

  const hint_steps_id = [
    'Bilangan dua angka itu 10 sampai 99, jadi angka puluhannya 1 sampai 9 — tidak boleh 0.',
    'Tahan satu angka puluhan dulu, lalu jalan di angka satuan 0, 1, 2, sampai 9 dan tandai yang memenuhi aturan.',
    params.ask === 'how-many'
      ? 'Hitung tanda di setiap puluhan, lalu jumlahkan semuanya untuk dapat banyaknya.'
      : 'Tulis semua yang cocok berurutan, ambil yang terbesar dan yang terkecil, lalu kurangkan.',
  ]
  const hint_steps_en = [
    'A two-digit number runs from 10 to 99, so its tens digit is 1 to 9 — never 0.',
    'Hold one tens digit still, walk the ones digit 0, 1, 2, up to 9, and mark the ones that obey the rules.',
    params.ask === 'how-many'
      ? 'Count the marks in each ten, then add those counts together to get how many.'
      : 'Write every number that fits in order, take the largest and the smallest, then subtract.',
  ]

  return {
    body_en: `A two-digit number is any number from 10 to 99. We want the two-digit numbers where ${listEn}.\n\nFind: ${questionEn(params.ask)}`,
    body_id: `Bilangan dua angka adalah bilangan dari 10 sampai 99. Kita cari bilangan dua angka yang ${listId}.\n\nCari: ${questionId(params.ask)}`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en:
      'Hold one tens digit still, then walk the ones digit from 0 to 9 and mark every number that obeys the rules. Then move on to the next tens digit.',
    hint_id:
      'Tahan satu angka puluhan dulu, lalu jalan di angka satuan 0 sampai 9 dan tandai setiap bilangan yang memenuhi aturan. Baru pindah ke puluhan berikutnya.',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildCountTwoDigitNumbersBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
