import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildOddOneOutBreakdown } from './breakdown.js'

// Four options; three of them obey one rule and the fourth breaks it. The child
// has to FIND the rule (it is never printed) and then name the option that
// breaks it.
//
// The single fact this concept lives or dies on: "which one does not belong" is
// only a question at all when EXACTLY ONE option can be argued out. A set like
// 5, 10, 15, 18 looks fine — 18 is the only non-multiple of 5 — until a child
// notices 5 is the only single-digit number. Two defensible answers, one marked
// correct: the child is punished for reasoning well.
//
// So `generate` never trusts the rule it built the set from. `singledOut()`
// re-tests all four options against a whole FAMILY of rules a grade 1-2 solver
// could actually name, and `paramsSchema` refuses any set where that family can
// argue out more than one option. `index.test.ts` re-checks the same promise
// with an independently written rule sweep.
export const LABELS = ['A', 'B', 'C', 'D'] as const

export const DOMAINS = ['number-sequence', 'attribute-group'] as const
export type Domain = (typeof DOMAINS)[number]

/** The rule the three obedient options share. Never printed in the stem. */
export const RULE_KINDS = [
  // number-sequence
  'all-even',
  'all-odd',
  'multiples',
  'squares',
  'same-step',
  // attribute-group
  'same-sides',
  'straight-sides',
  'equal-sides',
] as const
export type RuleKind = (typeof RULE_KINDS)[number]

const NUMBER_RULE_KINDS: readonly RuleKind[] = ['all-even', 'all-odd', 'multiples', 'squares', 'same-step']
const SHAPE_RULE_KINDS: readonly RuleKind[] = ['same-sides', 'straight-sides', 'equal-sides']

/**
 * The shapes the attribute domain draws from. Every property a child could name
 * from the NAME alone is modelled here, because `singledOut` can only protect
 * against rules it knows about. Where a shape's property genuinely depends on
 * how it is drawn (a triangle may or may not have equal sides) the value is
 * `varies` — its own class, so such a shape can never be counted into a
 * three-strong group on that property. That is the conservative direction: it
 * rejects sets rather than shipping them.
 */
export const SHAPES = [
  { key: 'lingkaran', id: 'lingkaran', en: 'circle', sides: 0, curved: true, equalSides: 'none', rightAngles: 'none' },
  { key: 'oval', id: 'oval', en: 'oval', sides: 0, curved: true, equalSides: 'none', rightAngles: 'none' },
  { key: 'segitiga', id: 'segitiga', en: 'triangle', sides: 3, curved: false, equalSides: 'varies', rightAngles: 'varies' },
  { key: 'persegi', id: 'persegi', en: 'square', sides: 4, curved: false, equalSides: 'yes', rightAngles: 'four' },
  { key: 'persegi-panjang', id: 'persegi panjang', en: 'rectangle', sides: 4, curved: false, equalSides: 'no', rightAngles: 'four' },
  { key: 'belah-ketupat', id: 'belah ketupat', en: 'rhombus', sides: 4, curved: false, equalSides: 'yes', rightAngles: 'none' },
  { key: 'jajar-genjang', id: 'jajar genjang', en: 'parallelogram', sides: 4, curved: false, equalSides: 'no', rightAngles: 'none' },
  { key: 'trapesium', id: 'trapesium', en: 'trapezium', sides: 4, curved: false, equalSides: 'varies', rightAngles: 'varies' },
  { key: 'segi-lima', id: 'segi lima', en: 'pentagon', sides: 5, curved: false, equalSides: 'yes', rightAngles: 'none' },
  { key: 'segi-enam', id: 'segi enam', en: 'hexagon', sides: 6, curved: false, equalSides: 'yes', rightAngles: 'none' },
] as const
export type Shape = (typeof SHAPES)[number]

const SHAPE_BY_KEY = new Map<string, Shape>(SHAPES.map((s) => [s.key, s]))

const paramsSchema = z
  .object({
    domain: z.enum(DOMAINS),
    /** The four options in the order the child sees them. LABELS[i] names items[i]. */
    items: z.array(z.string()).length(4),
    /** Index into `items` of the option that breaks the rule. */
    answerIndex: z.number().int().min(0).max(3),
    /** The rule the other three share. `k` is the multiple / step / side count; 0 when unused. */
    rule: z.object({ kind: z.enum(RULE_KINDS), k: z.number().int().min(0).max(12) }),
  })
  .refine((v) => itemsValid(v.domain, v.items), {
    message: 'the four options must be distinct and valid for the domain',
  })
  .refine((v) => !itemsValid(v.domain, v.items) || ruleHolds(v), {
    message: 'the stated rule must hold for the other three options and fail for the answer',
  })
  // THE load-bearing rule. Everything above is shape; this is the promise that
  // the child cannot reason their way to a different, equally defensible pick.
  .refine(
    (v) => {
      if (!itemsValid(v.domain, v.items)) return true
      const out = singledOut(v.domain, v.items)
      return out.length === 1 && out[0] === v.answerIndex
    },
    { message: 'exactly one option may be arguable out, and it must be the answer' },
  )
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'odd-one-out',
  name_en: 'Which one does not belong',
  name_id: 'Mana yang tidak sekelompok?',
  grades: [1, 2] as const,
  description_id:
    'Menemukan sendiri aturan yang dipatuhi tiga dari empat pilihan, lalu menunjuk satu pilihan yang melanggar aturan itu.',
} as const

// ── Items ────────────────────────────────────────────────────────────────────

export function itemsValid(domain: Domain, items: string[]): boolean {
  if (items.length !== 4) return false
  if (new Set(items).size !== 4) return false
  if (domain === 'number-sequence') {
    return items.every((it) => /^[1-9][0-9]?$/.test(it) && Number(it) >= 10)
  }
  return items.every((it) => SHAPE_BY_KEY.has(it))
}

/** What the child reads on the option button. */
export function itemText(domain: Domain, item: string, lang: 'en' | 'id'): string {
  if (domain === 'number-sequence') return item
  const shape = SHAPE_BY_KEY.get(item)
  if (!shape) return item
  return lang === 'id' ? shape.id : shape.en
}

export function shapeOf(item: string): Shape | undefined {
  return SHAPE_BY_KEY.get(item)
}

// ── The rule family the generator has to survive ─────────────────────────────

const digitSum = (n: number): number =>
  String(n)
    .split('')
    .reduce((s, d) => s + Number(d), 0)

const isSquare = (n: number): boolean => Number.isInteger(Math.sqrt(n))
const isCube = (n: number): boolean => Math.round(Math.cbrt(n)) ** 3 === n
const isPowerOfTwo = (n: number): boolean => n > 0 && (n & (n - 1)) === 0
const isRepdigit = (item: string): boolean => new Set(item.split('')).size === 1

/**
 * One way of sorting the four options into groups. A group of exactly three is
 * a rule three options share — and the option left out of it is one a child
 * could argue does not belong.
 */
interface Labeller {
  id: string
  of: (item: string) => string
}

/**
 * Deliberately INCLUDED beyond the obvious: every remainder mod 2..12 (this is
 * what "constant step" and "multiples of k" both really are), digit count (the
 * 5-vs-10 trap above), the ones and tens digits, digit sum, squares, cubes,
 * powers of two, and repeated digits.
 *
 * Deliberately EXCLUDED: the parity of the digit sum, primality, and triangular
 * numbers. None is a rule a grade 1-2 child or a WMI marking scheme would ever
 * name as "does not belong", and each one fires on a large share of otherwise
 * fine sets (digit-sum parity alone rules out nearly every run of multiples of
 * 10), so including them would shrink the question pool for no protection.
 */
function numberLabellers(): Labeller[] {
  const out: Labeller[] = []
  for (let k = 2; k <= 12; k++) out.push({ id: `mod-${k}`, of: (it) => String(Number(it) % k) })
  out.push({ id: 'digit-count', of: (it) => String(it.length) })
  out.push({ id: 'ones-digit', of: (it) => String(Number(it) % 10) })
  out.push({ id: 'tens-digit', of: (it) => String(Math.floor(Number(it) / 10) % 10) })
  out.push({ id: 'digit-sum', of: (it) => String(digitSum(Number(it))) })
  out.push({ id: 'square', of: (it) => (isSquare(Number(it)) ? 'y' : 'n') })
  out.push({ id: 'cube', of: (it) => (isCube(Number(it)) ? 'y' : 'n') })
  out.push({ id: 'power-of-two', of: (it) => (isPowerOfTwo(Number(it)) ? 'y' : 'n') })
  out.push({ id: 'repdigit', of: (it) => (isRepdigit(it) ? 'y' : 'n') })
  return out
}

/**
 * The options are read as words, so the family covers both what the shape IS
 * (sides, curves, equal sides, right-angle corners) and what its Indonesian
 * name looks like — "persegi" and "persegi panjang" share a first word, and so
 * do "segi lima" and "segi enam", which is a grouping a child really does see.
 */
function shapeLabellers(): Labeller[] {
  const at = (item: string): Shape | undefined => SHAPE_BY_KEY.get(item)
  return [
    { id: 'sides', of: (it) => String(at(it)?.sides ?? '?') },
    { id: 'curved', of: (it) => (at(it)?.curved ? 'y' : 'n') },
    { id: 'equal-sides', of: (it) => at(it)?.equalSides ?? '?' },
    { id: 'right-angles', of: (it) => at(it)?.rightAngles ?? '?' },
    { id: 'name-first-word-id', of: (it) => (at(it)?.id ?? it).split(' ')[0] },
    { id: 'name-first-word-en', of: (it) => (at(it)?.en ?? it).split(' ')[0] },
  ]
}

function labellersFor(domain: Domain): Labeller[] {
  return domain === 'number-sequence' ? numberLabellers() : shapeLabellers()
}

/** Every option the rule family can argue out of the group, in index order. */
export function singledOut(domain: Domain, items: string[]): number[] {
  const out = new Set<number>()
  for (const labeller of labellersFor(domain)) {
    const groups = new Map<string, number[]>()
    items.forEach((item, i) => {
      const label = labeller.of(item)
      const bucket = groups.get(label)
      if (bucket) bucket.push(i)
      else groups.set(label, [i])
    })
    for (const bucket of groups.values()) {
      if (bucket.length !== 3) continue
      const odd = [0, 1, 2, 3].find((i) => !bucket.includes(i))
      if (odd !== undefined) out.add(odd)
    }
  }
  // "Three of them count up in equal jumps" is a rule about the SET, not about
  // any one option, so it cannot be a labeller. Drop each option in turn and
  // ask whether the remaining three form an equal-jump run.
  if (domain === 'number-sequence') {
    for (let i = 0; i < 4; i++) {
      const rest = items
        .filter((_, j) => j !== i)
        .map(Number)
        .sort((a, b) => a - b)
      const gap = rest[1] - rest[0]
      if (gap > 0 && rest[2] - rest[1] === gap) out.add(i)
    }
  }
  return [...out].sort((a, b) => a - b)
}

// ── The stated rule ──────────────────────────────────────────────────────────

/** Enough of a params object to check a rule against. Avoids `Params` self-reference. */
export interface RuledSet {
  domain: Domain
  items: string[]
  answerIndex: number
  rule: { kind: RuleKind; k: number }
}

/** Whether ONE option obeys the rule. `same-step` is about the trio, so it is handled apart. */
export function obeys(domain: Domain, rule: { kind: RuleKind; k: number }, item: string): boolean {
  if (domain === 'number-sequence') {
    const n = Number(item)
    if (!Number.isInteger(n)) return false
    switch (rule.kind) {
      case 'all-even':
        return n % 2 === 0
      case 'all-odd':
        return n % 2 === 1
      case 'multiples':
        return rule.k >= 2 && n % rule.k === 0
      case 'squares':
        return isSquare(n)
      default:
        return false
    }
  }
  const shape = SHAPE_BY_KEY.get(item)
  if (!shape) return false
  switch (rule.kind) {
    case 'same-sides':
      return shape.sides === rule.k
    case 'straight-sides':
      return !shape.curved
    case 'equal-sides':
      return shape.equalSides === 'yes'
    default:
      return false
  }
}

/** The three keepers really obey the stated rule, and the answer really breaks it. */
export function ruleHolds(v: RuledSet): boolean {
  if (!itemsValid(v.domain, v.items)) return false
  if (v.answerIndex < 0 || v.answerIndex > 3) return false
  const keepers = v.items.filter((_, i) => i !== v.answerIndex)
  const odd = v.items[v.answerIndex]

  if (v.domain === 'number-sequence' && v.rule.kind === 'same-step') {
    if (v.rule.k < 2) return false
    const chain = keepers.map(Number).sort((a, b) => a - b)
    if (chain[1] - chain[0] !== v.rule.k) return false
    if (chain[2] - chain[1] !== v.rule.k) return false
    return (((Number(odd) - chain[0]) % v.rule.k) + v.rule.k) % v.rule.k !== 0
  }

  const allowed = v.domain === 'number-sequence' ? NUMBER_RULE_KINDS : SHAPE_RULE_KINDS
  if (!allowed.includes(v.rule.kind)) return false
  if (v.rule.kind === 'same-step') return false
  return keepers.every((it) => obeys(v.domain, v.rule, it)) && !obeys(v.domain, v.rule, odd)
}

// ── Solving + narration ──────────────────────────────────────────────────────

export interface Check {
  index: number
  label: string
  text: string
  /** Why this option obeys the rule, with the arithmetic spelled out. */
  why_en: string
  why_id: string
}

export interface Solution {
  answerIndex: number
  answerLabel: string
  answerText_en: string
  answerText_id: string
  /** The three that obey, in display order. */
  checks: Check[]
  rule_en: string
  rule_id: string
  /** Why the answer breaks the rule. */
  fail_en: string
  fail_id: string
  /** The label the child submits. */
  answer: string
}

/** The chain the three keepers walk, ascending — only meaningful for `same-step`. */
export function stepChain(p: RuledSet): number[] {
  return p.items
    .filter((_, i) => i !== p.answerIndex)
    .map(Number)
    .sort((a, b) => a - b)
}

function ruleWords(p: RuledSet, lang: 'en' | 'id'): string {
  const k = p.rule.k
  if (lang === 'id') {
    switch (p.rule.kind) {
      case 'all-even':
        return 'bilangan genap'
      case 'all-odd':
        return 'bilangan ganjil'
      case 'multiples':
        return `kelipatan ${k}`
      case 'squares':
        return 'bilangan kuadrat, yaitu hasil satu bilangan dikali dirinya sendiri'
      case 'same-step':
        return `bilangan yang melompat ${k} setiap kali`
      case 'same-sides':
        return `bangun bersisi ${k}`
      case 'straight-sides':
        return 'bangun yang semua sisinya lurus'
      case 'equal-sides':
        return 'bangun yang semua sisinya sama panjang'
    }
  }
  switch (p.rule.kind) {
    case 'all-even':
      return 'even numbers'
    case 'all-odd':
      return 'odd numbers'
    case 'multiples':
      return `multiples of ${k}`
    case 'squares':
      return 'square numbers, a number times itself'
    case 'same-step':
      return `numbers that jump up by ${k} each time`
    case 'same-sides':
      return `shapes with ${k} sides`
    case 'straight-sides':
      return 'shapes whose sides are all straight'
    case 'equal-sides':
      return 'shapes whose sides are all the same length'
  }
}

function checkWhy(p: RuledSet, item: string, lang: 'en' | 'id'): string {
  const n = Number(item)
  const shape = SHAPE_BY_KEY.get(item)
  const id = lang === 'id'
  switch (p.rule.kind) {
    case 'all-even':
      return id ? `${n} = 2 × ${n / 2}, jadi genap` : `${n} = 2 × ${n / 2}, so it is even`
    case 'all-odd':
      return id
        ? `${n} = 2 × ${(n - 1) / 2} + 1, jadi ganjil`
        : `${n} = 2 × ${(n - 1) / 2} + 1, so it is odd`
    case 'multiples':
      return id ? `${n} = ${p.rule.k} × ${n / p.rule.k}` : `${n} = ${p.rule.k} × ${n / p.rule.k}`
    case 'squares': {
      const r = Math.round(Math.sqrt(n))
      return id ? `${n} = ${r} × ${r}` : `${n} = ${r} × ${r}`
    }
    case 'same-step': {
      const chain = stepChain(p)
      const at = chain.indexOf(n)
      if (at <= 0) {
        return id ? `mulai dari ${n}` : `start at ${n}`
      }
      return id
        ? `${chain[at - 1]} + ${p.rule.k} = ${n}`
        : `${chain[at - 1]} + ${p.rule.k} = ${n}`
    }
    case 'same-sides':
      return id
        ? `${shape?.id ?? item} punya ${shape?.sides ?? 0} sisi`
        : `a ${shape?.en ?? item} has ${shape?.sides ?? 0} sides`
    case 'straight-sides':
      return id
        ? `${shape?.id ?? item} dibuat dari ${shape?.sides ?? 0} garis lurus`
        : `a ${shape?.en ?? item} is made of ${shape?.sides ?? 0} straight lines`
    case 'equal-sides':
      return id
        ? `${shape?.sides ?? 0} sisi ${shape?.id ?? item} sama panjang semua`
        : `all ${shape?.sides ?? 0} sides of a ${shape?.en ?? item} are the same length`
  }
}

function failWhy(p: RuledSet, item: string, lang: 'en' | 'id'): string {
  const n = Number(item)
  const shape = SHAPE_BY_KEY.get(item)
  const id = lang === 'id'
  switch (p.rule.kind) {
    case 'all-even':
      return id
        ? `${n} = 2 × ${(n - 1) / 2} + 1, masih sisa 1, jadi ${n} ganjil`
        : `${n} = 2 × ${(n - 1) / 2} + 1 leaves 1 over, so ${n} is odd`
    case 'all-odd':
      return id ? `${n} = 2 × ${n / 2} pas, jadi ${n} genap` : `${n} = 2 × ${n / 2} exactly, so ${n} is even`
    case 'multiples': {
      const k = p.rule.k
      const q = Math.floor(n / k)
      return id
        ? `${k} × ${q} = ${k * q} lalu ${k} × ${q + 1} = ${k * (q + 1)}, jadi ${n} terlewat`
        : `${k} × ${q} = ${k * q} then ${k} × ${q + 1} = ${k * (q + 1)}, so ${n} is skipped over`
    }
    case 'squares': {
      const lo = Math.floor(Math.sqrt(n))
      return id
        ? `${lo} × ${lo} = ${lo * lo} lalu ${lo + 1} × ${lo + 1} = ${(lo + 1) * (lo + 1)}, dan ${n} ada di antaranya`
        : `${lo} × ${lo} = ${lo * lo} then ${lo + 1} × ${lo + 1} = ${(lo + 1) * (lo + 1)}, and ${n} sits between them`
    }
    case 'same-step': {
      const chain = stepChain(p)
      const k = p.rule.k
      const lo = chain[0] + Math.floor((n - chain[0]) / k) * k
      return id
        ? `lompatannya mendarat di ${lo} lalu ${lo + k}, jadi ${n} dilewati`
        : `the jumps land on ${lo} then ${lo + k}, so ${n} is stepped over`
    }
    case 'same-sides':
      return shape?.curved
        ? id
          ? `${shape.id} tidak punya sisi lurus sama sekali`
          : `a ${shape.en} has no straight sides at all`
        : id
          ? `${shape?.id ?? item} punya ${shape?.sides ?? 0} sisi, bukan ${p.rule.k}`
          : `a ${shape?.en ?? item} has ${shape?.sides ?? 0} sides, not ${p.rule.k}`
    case 'straight-sides':
      return id
        ? `garis ${shape?.id ?? item} melengkung, tidak ada sisi lurus`
        : `a ${shape?.en ?? item} curves round, with no straight side`
    case 'equal-sides':
      return id
        ? `${shape?.id ?? item} punya sisi panjang dan sisi pendek, tidak sama panjang`
        : `a ${shape?.en ?? item} has long sides and short sides, not all the same`
  }
}

export function solve(p: RuledSet): Solution {
  const lang = (l: 'en' | 'id') => l
  const checks: Check[] = p.items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => index !== p.answerIndex)
    // Step one of the method is "put them in order", so the three that obey are
    // narrated in ascending order — otherwise a jump chain would be read out
    // back to front. Shape names have no order, so they stay as displayed.
    .sort((a, b) => (p.domain === 'number-sequence' ? Number(a.item) - Number(b.item) : 0))
    .map(({ item, index }) => ({
      index,
      label: LABELS[index],
      text: itemText(p.domain, item, 'id'),
      why_en: checkWhy(p, item, 'en'),
      why_id: checkWhy(p, item, 'id'),
    }))
  const answerItem = p.items[p.answerIndex]

  return {
    answerIndex: p.answerIndex,
    answerLabel: LABELS[p.answerIndex],
    answerText_en: itemText(p.domain, answerItem, 'en'),
    answerText_id: itemText(p.domain, answerItem, 'id'),
    checks,
    rule_en: ruleWords(p, lang('en')),
    rule_id: ruleWords(p, lang('id')),
    fail_en: failWhy(p, answerItem, 'en'),
    fail_id: failWhy(p, answerItem, 'id'),
    answer: LABELS[p.answerIndex],
  }
}

/**
 * "It is the biggest one" is the wrong move every child reaches for, and it is
 * always available — every group of numbers has a biggest member. Worth naming
 * only when the biggest option is NOT the answer, because then it is provably
 * wrong here: the biggest option obeys the rule.
 */
export function trapAnswer(p: RuledSet): number | null {
  if (p.domain !== 'number-sequence') return null
  const values = p.items.map(Number)
  let at = 0
  for (let i = 1; i < 4; i++) if (values[i] > values[at]) at = i
  return at === p.answerIndex ? null : at
}

// ── Generation ───────────────────────────────────────────────────────────────

function pickDistinct(rng: Rng, pool: readonly number[], want: number): number[] | null {
  if (pool.length < want) return null
  return rng.shuffle(pool).slice(0, want)
}

/** Two-digit numbers only. One-digit options collide with the digit-count rule instantly. */
const TWO_DIGIT: number[] = Array.from({ length: 90 }, (_, i) => i + 10)

function draftNumbers(rng: Rng): RuledSet | null {
  const kind = rng.pick(['all-even', 'all-odd', 'multiples', 'squares', 'same-step'] as const)
  let keepers: number[] | null = null
  let odd = 0
  let k = 0

  if (kind === 'all-even' || kind === 'all-odd') {
    const want = kind === 'all-even' ? 0 : 1
    keepers = pickDistinct(rng, TWO_DIGIT.filter((n) => n % 2 === want), 3)
    odd = rng.pick(TWO_DIGIT.filter((n) => n % 2 !== want))
  } else if (kind === 'multiples') {
    k = rng.pick([3, 4, 5, 10])
    keepers = pickDistinct(rng, TWO_DIGIT.filter((n) => n % k === 0), 3)
    odd = rng.pick(TWO_DIGIT.filter((n) => n % k !== 0))
  } else if (kind === 'squares') {
    keepers = pickDistinct(rng, [16, 25, 36, 49, 64, 81], 3)
    odd = rng.pick(TWO_DIGIT.filter((n) => !isSquare(n)))
  } else {
    k = rng.pick([2, 3, 4, 5])
    const start = rng.pick(TWO_DIGIT.filter((n) => n + 2 * k <= 99))
    keepers = [start, start + k, start + 2 * k]
    const offChain = TWO_DIGIT.filter((n) => (((n - start) % k) + k) % k !== 0)
    if (offChain.length === 0) return null
    odd = rng.pick(offChain)
  }
  if (keepers === null) return null

  const items = rng.shuffle([...keepers, odd]).map(String)
  const answerIndex = items.indexOf(String(odd))
  if (answerIndex === -1) return null
  return { domain: 'number-sequence', items, answerIndex, rule: { kind, k } }
}

function draftShapes(rng: Rng): RuledSet | null {
  const kind = rng.pick(['same-sides', 'straight-sides', 'equal-sides'] as const)
  let keeperPool: readonly Shape[]
  let oddPool: readonly Shape[]
  let k = 0

  if (kind === 'same-sides') {
    // Only the four-sided family has three members to draw a rule from.
    k = 4
    keeperPool = SHAPES.filter((s) => s.sides === 4)
    oddPool = SHAPES.filter((s) => s.sides !== 4)
  } else if (kind === 'straight-sides') {
    keeperPool = SHAPES.filter((s) => !s.curved)
    oddPool = SHAPES.filter((s) => s.curved)
  } else {
    keeperPool = SHAPES.filter((s) => s.equalSides === 'yes')
    oddPool = SHAPES.filter((s) => s.equalSides === 'no')
  }
  if (keeperPool.length < 3 || oddPool.length === 0) return null

  const keepers = rng.shuffle(keeperPool).slice(0, 3)
  const odd = rng.pick(oddPool)
  const items = rng.shuffle([...keepers.map((s) => s.key), odd.key])
  const answerIndex = items.indexOf(odd.key)
  if (answerIndex === -1) return null
  return { domain: 'attribute-group', items, answerIndex, rule: { kind, k } }
}

/**
 * Both fallbacks are checked by `index.test.ts` against the same rule family the
 * generator has to survive, so a fallback is a worse question, never a broken one.
 */
const FALLBACK_NUMBERS: Params = {
  domain: 'number-sequence',
  items: ['75', '57', '18', '70'],
  answerIndex: 3,
  rule: { kind: 'multiples', k: 3 },
}
const FALLBACK_SHAPES: Params = {
  domain: 'attribute-group',
  items: ['persegi', 'segitiga', 'belah-ketupat', 'jajar-genjang'],
  answerIndex: 1,
  rule: { kind: 'same-sides', k: 4 },
}

export function generate(rng: Rng): Params {
  const domain = rng.pick(DOMAINS)
  for (let attempt = 0; attempt < 400; attempt++) {
    const candidate = domain === 'number-sequence' ? draftNumbers(rng) : draftShapes(rng)
    if (candidate === null) continue
    if (!ruleHolds(candidate)) continue
    const out = singledOut(candidate.domain, candidate.items)
    if (out.length !== 1 || out[0] !== candidate.answerIndex) continue
    return candidate as Params
  }
  return domain === 'number-sequence' ? FALLBACK_NUMBERS : FALLBACK_SHAPES
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** "A, B and C" / "A, B, dan C". Exported so the breakdown and steps agree. */
export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(domain: Domain, lang: 'en' | 'id'): string {
  if (lang === 'id') {
    return domain === 'number-sequence'
      ? 'Bilangan mana yang tidak sekelompok?'
      : 'Bangun mana yang tidak sekelompok?'
  }
  return domain === 'number-sequence'
    ? 'Which number does not belong?'
    : 'Which shape does not belong?'
}

/** "Three of these four numbers" — exported so the breakdown can quote it. */
export function countClause(domain: Domain, lang: 'en' | 'id'): string {
  if (lang === 'id') {
    return domain === 'number-sequence' ? 'Tiga dari empat bilangan ini' : 'Tiga dari empat bangun ini'
  }
  return domain === 'number-sequence' ? 'Three of these four numbers' : 'Three of these four shapes'
}

/** "One number does not follow it" — exported so the breakdown can quote it. */
export function loneClause(domain: Domain, lang: 'en' | 'id'): string {
  if (lang === 'id') {
    return domain === 'number-sequence'
      ? 'Satu bilangan tidak ikut aturan itu'
      : 'Satu bangun tidak ikut aturan itu'
  }
  return domain === 'number-sequence' ? 'One number does not follow it' : 'One shape does not follow it'
}

export const RULE_CLAUSE_EN = 'follow the same rule'
export const RULE_CLAUSE_ID = 'mengikuti aturan yang sama'

export function render(params: Params): Rendered {
  const { domain, items } = params
  const s = solve(params)
  const breakdown = buildOddOneOutBreakdown(params)

  const choices_en: WmiChoice[] = LABELS.map((label, i) => ({
    label,
    text: itemText(domain, items[i], 'en'),
  }))
  const choices_id: WmiChoice[] = LABELS.map((label, i) => ({
    label,
    text: itemText(domain, items[i], 'id'),
  }))

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = `${countClause(domain, 'en')} ${RULE_CLAUSE_EN}. ${loneClause(domain, 'en')}. Find: ${askClause(domain, 'en')}`
  const body_id = `${countClause(domain, 'id')} ${RULE_CLAUSE_ID}. ${loneClause(domain, 'id')}. Cari: ${askClause(domain, 'id')}`

  const hunt_en =
    domain === 'number-sequence'
      ? 'Nothing tells you the rule — you have to find it. Put the four numbers in order, then test the easy rules on all four: even or odd, counting up in equal jumps, multiples of 3, 5 or 10.'
      : 'Nothing tells you the rule — you have to find it. Count the sides of each shape, then look at whether the sides are straight and whether they are all the same length.'
  const hunt_id =
    domain === 'number-sequence'
      ? 'Aturannya tidak ditulis — kamu yang harus menemukannya. Urutkan dulu keempat bilangan, lalu coba aturan yang gampang pada keempatnya: genap atau ganjil, melompat sama besar, kelipatan 3, 5, atau 10.'
      : 'Aturannya tidak ditulis — kamu yang harus menemukannya. Hitung sisi setiap bangun, lalu lihat apakah sisinya lurus dan apakah panjangnya sama semua.'

  const keeperLabels = s.checks.map((c) => c.label)
  const keeperTexts_en = s.checks.map((c) => itemText(domain, items[c.index], 'en'))
  const keeperTexts_id = s.checks.map((c) => itemText(domain, items[c.index], 'id'))

  // hint_steps: state the rule, CHECK all three that obey it one by one, then
  // show the fourth failing. The answer is never announced before it is earned.
  const steps_en: string[] = [
    hunt_en,
    `${listEn(keeperTexts_en)} are all ${s.rule_en}: ${s.checks.map((c) => c.why_en).join('; ')}.`,
    `${s.answerText_en} is the one that breaks it: ${s.fail_en}.`,
    `Every other option passes that test, so only ${s.answerText_en} can be left out. The answer is ${s.answerLabel}.`,
  ]
  const steps_id: string[] = [
    hunt_id,
    `${listId(keeperTexts_id)} sama-sama ${s.rule_id}: ${s.checks.map((c) => c.why_id).join('; ')}.`,
    `${s.answerText_id} yang melanggar: ${s.fail_id}.`,
    `Pilihan lain semuanya lolos aturan itu, jadi hanya ${s.answerText_id} yang bisa dikeluarkan. Jawabannya ${s.answerLabel}.`,
  ]

  return {
    body_en,
    body_id,
    answer_type: 'multiple_choice',
    choices_en,
    choices_id,
    answer: s.answer,
    hint_en: `Do not hunt for the odd one first — hunt for what THREE of them share. Test one easy rule on all four options; the option that fails it is your answer (${keeperLabels.length} of the four will pass).`,
    hint_id: `Jangan cari yang aneh dulu — cari dulu apa yang sama pada TIGA pilihan. Uji satu aturan gampang ke keempat pilihan; yang tidak lolos itulah jawabannya (${keeperLabels.length} pilihan akan lolos).`,
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
