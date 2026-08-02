import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildGrowingFigureNthTermBreakdown } from './breakdown.js'

// A figure drawn from small squares, printed as pictures 1, 2, 3 (and often 4).
// Each picture is the one before it grown by the same move. The child measures
// the growth off the drawings, names the rule, then applies it far past where
// the drawing stops — picture 12, picture 25 — or runs it backwards to find
// which picture holds a given number of squares.
//
// Two rules keep this concept honest, and both are enforced by code below.
//
// 1. THE PICTURE AND THE NUMBER CANNOT DISAGREE. `figureCells(shape, height, n)`
//    is the only place a figure is described, and `countAt` is literally
//    `figureCells(...).length`. The in-card illustration draws `figureCells`;
//    the answer counts `countAt`. There is no second description of the shape to
//    drift out of sync — this repo has shipped a figure that contradicted its own
//    stated answer, and that is the hole this closes.
//
// 2. THE SHOWN PICTURES MUST PIN THE RULE DOWN. Three or four terms of a
//    sequence almost never determine it: 1, 3, 6 is triangular, but it is also
//    "add 2, add 3, add 2, add 3…". `candidateRules` builds every plausible
//    alternative a child might reach for — constant difference, constant ratio,
//    constant second difference, alternating jumps, and "just keep adding the
//    last jump" — and `solve` refuses any params where an alternative reproduces
//    every shown picture yet lands on a different answer. `paramsSchema` rejects
//    those, and `index.test.ts` re-checks it seed by seed.
export const SHAPES = [
  'staircase',
  'square-block',
  'oblong',
  'l-corner',
  'plus-arms',
  'bar-rows',
] as const
export type Shape = (typeof SHAPES)[number]

export const ASKS = ['count-at-n', 'n-where-count-is', 'difference-between-two'] as const
export type Ask = (typeof ASKS)[number]

/** A cell of the drawn figure as `[row, col]`, row 0 = top, col 0 = left. */
export type FigureCell = [number, number]

/** Answers stay countable for a grade 2-3 child. */
export const MAX_COUNT = 250
/** Nothing is ever asked about a picture past here. */
export const MAX_INDEX = 60

/**
 * Whether the shape grows by a fixed amount per picture or by a growing amount.
 * Only used to steer generation (quadratic shapes need a fourth picture before
 * their rule is pinned down) and to word the "jumps" hint; the uniqueness proof
 * never trusts it.
 */
export const SHAPE_KIND: Record<Shape, 'linear' | 'quadratic'> = {
  staircase: 'quadratic',
  'square-block': 'quadratic',
  oblong: 'quadratic',
  'l-corner': 'linear',
  'plus-arms': 'linear',
  'bar-rows': 'linear',
}

// ── The figure ───────────────────────────────────────────────────────────────

/**
 * Picture `n` of the growing figure, as a cell list. THE single source of truth
 * for what the child sees and for how many squares the answer counts. Mirrored
 * verbatim on the frontend (illustration + explainer storyboard) so the drawing
 * and the arithmetic are the same object.
 */
export function figureCells(shape: Shape, height: number, n: number): FigureCell[] {
  const cells: FigureCell[] = []
  if (!Number.isInteger(n) || n < 1) return cells
  switch (shape) {
    // A staircase: row r holds r + 1 squares, so picture n holds 1 + 2 + … + n.
    case 'staircase':
      for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) cells.push([r, c])
      return cells
    // An n by n block.
    case 'square-block':
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c])
      return cells
    // A block n tall and n + 1 wide.
    case 'oblong':
      for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) cells.push([r, c])
      return cells
    // A corner: an arm of n going down, then n − 1 more going right.
    case 'l-corner':
      for (let r = 0; r < n; r++) cells.push([r, 0])
      for (let c = 1; c < n; c++) cells.push([n - 1, c])
      return cells
    // A plus: one middle square and four arms of n − 1.
    case 'plus-arms': {
      const m = n - 1
      cells.push([m, m])
      for (let k = 1; k <= m; k++) {
        cells.push([m - k, m])
        cells.push([m + k, m])
        cells.push([m, m - k])
        cells.push([m, m + k])
      }
      return cells
    }
    // `height` rows of n squares.
    case 'bar-rows':
      for (let r = 0; r < height; r++) for (let c = 0; c < n; c++) cells.push([r, c])
      return cells
  }
}

/**
 * How many small squares picture `n` holds. Deliberately counts the drawing
 * rather than evaluating a formula: a formula could drift away from the picture,
 * a count cannot. `closedForm` states the same number the way a child would
 * write it, and `index.test.ts` holds the two together.
 */
export function countAt(shape: Shape, height: number, n: number): number {
  return figureCells(shape, height, n).length
}

/** The same count as arithmetic — what the hint steps say out loud. */
export function closedForm(shape: Shape, height: number, n: number): number {
  switch (shape) {
    case 'staircase':
      return (n * (n + 1)) / 2
    case 'square-block':
      return n * n
    case 'oblong':
      return n * (n + 1)
    case 'l-corner':
      return 2 * n - 1
    case 'plus-arms':
      return 4 * n - 3
    case 'bar-rows':
      return height * n
  }
}

// ── Uniqueness ───────────────────────────────────────────────────────────────

/** One rule a child could reasonably read off the shown pictures. */
export interface RuleCandidate {
  key: string
  at(n: number): number
}

/**
 * Every plausible alternative to the true rule, fitted to the pictures that are
 * actually drawn. A puzzle is only fair when each of these either fails to
 * reproduce the drawings or agrees with the true rule about the answer.
 */
export function candidateRules(shown: number[]): RuleCandidate[] {
  const t = shown
  const out: RuleCandidate[] = []
  if (t.length < 3) return out

  const d1 = t[1] - t[0]
  const d2 = t[2] - t[1]
  const second = d2 - d1
  const last = t.length - 1
  const dLast = t[last] - t[last - 1]

  // "It goes up by the same amount every time."
  out.push({ key: 'constant-difference', at: (n) => t[0] + (n - 1) * d1 })
  // "The jumps themselves go up by the same amount." (covers every quadratic)
  out.push({
    key: 'constant-second-difference',
    at: (n) => t[0] + (n - 1) * d1 + (((n - 1) * (n - 2)) / 2) * second,
  })
  // "It doubles / triples every time."
  if (t[0] > 0 && t[1] > t[0]) {
    const r = t[1] / t[0]
    out.push({ key: 'constant-ratio', at: (n) => t[0] * Math.pow(r, n - 1) })
  }
  // "The jumps take turns: this much, then that much, then this much again."
  out.push({
    key: 'alternating-difference',
    at: (n) => t[0] + Math.floor((n - 1) / 2) * (d1 + d2) + ((n - 1) % 2) * d1,
  })
  // "Whatever the last jump was, keep adding it." The dominant kid mistake on a
  // pattern whose jumps are still growing.
  out.push({ key: 'keep-adding-the-last-jump', at: (n) => t[last] + (n - 1 - last) * dLast })

  return out
}

function fitsShown(rule: RuleCandidate, shown: number[]): boolean {
  return shown.every((v, i) => rule.at(i + 1) === v)
}

/**
 * The minimum shape `solve` needs. Declared structurally rather than as `Params`
 * because a schema refinement calls `solve()`; taking `Params` there would make
 * `Params = z.infer<typeof paramsSchema>` reference itself. Same trick
 * `row-column-sum-grid` uses for its `SolvableGrid`.
 */
export interface SolvableFigure {
  shape: Shape
  height: number
  shownCount: number
  ask: Ask
  targetIndex: number
  secondIndex: number
}

/** The counts of the pictures the child can actually see. */
export function shownCounts(p: SolvableFigure): number[] {
  return Array.from({ length: p.shownCount }, (_, i) => countAt(p.shape, p.height, i + 1))
}

/**
 * The answer a given rule produces for THIS question. `'none'` when the rule
 * never reaches the asked-for count — still a disagreement, because a child
 * following it would answer "no picture does".
 */
function answerUnder(at: (n: number) => number, p: SolvableFigure, targetCount: number): string {
  if (p.ask === 'count-at-n') return String(at(p.targetIndex))
  if (p.ask === 'difference-between-two') return String(at(p.targetIndex) - at(p.secondIndex))
  for (let n = 1; n <= 200; n++) {
    const v = at(n)
    if (!Number.isFinite(v)) break
    if (v === targetCount) return String(n)
    if (v > targetCount) break
  }
  return 'none'
}

export interface Solution {
  /** Counts of pictures 1 … shownCount, in order. */
  shown: number[]
  /** Consecutive jumps between the shown pictures. */
  jumps: number[]
  /** True when every jump is the same size. */
  sameJump: boolean
  /** How much bigger each jump is than the one before, when that is constant. */
  jumpGrowth: number | null
  targetCount: number
  secondCount: number
  answer: string
  /**
   * The answer a child gets by keeping the last jump going forever. `null` when
   * that is not actually a wrong answer (a fixed-jump pattern) or when it lands
   * nowhere at all.
   */
  trap: string | null
  /** Names of the alternative rules that fit the drawings AND change the answer. */
  rivals: string[]
}

export function solve(p: SolvableFigure): Solution {
  const shown = shownCounts(p)
  const jumps = shown.slice(1).map((v, i) => v - shown[i])
  const sameJump = jumps.length > 0 && jumps.every((j) => j === jumps[0])
  const growths = jumps.slice(1).map((j, i) => j - jumps[i])
  const jumpGrowth =
    growths.length > 0 && growths.every((g) => g === growths[0]) ? growths[0] : null

  const targetCount = countAt(p.shape, p.height, p.targetIndex)
  const secondCount = p.secondIndex > 0 ? countAt(p.shape, p.height, p.secondIndex) : 0
  const truth = (n: number) => countAt(p.shape, p.height, n)
  const answer = answerUnder(truth, p, targetCount)

  const rules = candidateRules(shown)
  const rivals = rules
    .filter((rule) => fitsShown(rule, shown) && answerUnder(rule.at, p, targetCount) !== answer)
    .map((rule) => rule.key)

  const tail = rules.find((rule) => rule.key === 'keep-adding-the-last-jump')
  const tailAnswer = tail ? answerUnder(tail.at, p, targetCount) : 'none'
  const trap = tailAnswer === 'none' || tailAnswer === answer ? null : tailAnswer

  return { shown, jumps, sameJump, jumpGrowth, targetCount, secondCount, answer, trap, rivals }
}

// ── Params ───────────────────────────────────────────────────────────────────

const paramsSchema = z
  .object({
    shape: z.enum(SHAPES),
    /** Rows in the bar for `bar-rows`; always 1 for every other shape. */
    height: z.number().int().min(1).max(3),
    /** How many pictures are drawn on the card. */
    shownCount: z.number().int().min(3).max(4),
    ask: z.enum(ASKS),
    /** The far picture the question is about (the bigger one, for a difference). */
    targetIndex: z.number().int().min(1).max(MAX_INDEX),
    /** The smaller picture for `difference-between-two`; 0 for the other asks. */
    secondIndex: z.number().int().min(0).max(MAX_INDEX),
  })
  .refine((v) => (v.shape === 'bar-rows' ? v.height >= 2 : v.height === 1), {
    message: 'only bar-rows carries a height',
  })
  // The asked-for picture must be well past the ones on the card, or the child
  // can answer by counting rather than by finding the rule.
  .refine((v) => v.targetIndex >= v.shownCount + 3, {
    message: 'the asked-for picture must be far past the drawn ones',
  })
  .refine(
    (v) =>
      v.ask === 'difference-between-two'
        ? v.secondIndex >= v.shownCount + 2 && v.secondIndex <= v.targetIndex - 2
        : v.secondIndex === 0,
    { message: 'a difference needs two undrawn pictures, at least two apart' },
  )
  .refine((v) => countAt(v.shape, v.height, v.targetIndex) <= MAX_COUNT, {
    message: 'the picture asked about must stay countable for a small child',
  })
  // THE load-bearing rule: no other rule that fits the drawn pictures may give a
  // different answer.
  .refine((v) => solve(v).rivals.length === 0, {
    message: 'another rule fits the drawn pictures and gives a different answer',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'growing-figure-nth-term',
  name_en: 'The nth figure of a growing pattern',
  name_id: 'Gambar ke-n pada pola bertumbuh',
  grades: [2, 3] as const,
  description_id:
    'Mengukur pertumbuhan sebuah gambar dari gambar ke-1 sampai ke-4, menemukan aturannya, lalu memakai aturan itu pada gambar yang jauh di depan.',
} as const

// ── Generation ───────────────────────────────────────────────────────────────

/** The last picture of this shape that still fits inside `MAX_COUNT` squares. */
function maxIndex(shape: Shape, height: number): number {
  let n = 1
  while (n < MAX_INDEX && countAt(shape, height, n + 1) <= MAX_COUNT) n++
  return n
}

function draft(rng: Rng): Params | null {
  const shape = rng.pick(SHAPES)
  const height = shape === 'bar-rows' ? rng.int(2, 3) : 1
  // A pattern whose jumps are still growing needs a fourth picture before its
  // rule is pinned down — with only three, "the jumps take turns" fits too.
  const shownCount = SHAPE_KIND[shape] === 'quadratic' ? 4 : rng.pick([3, 4])
  const ask = rng.pick(ASKS)

  const top = maxIndex(shape, height)
  const lo = shownCount + 3
  if (top < lo) return null

  if (ask === 'difference-between-two') {
    if (top < lo + 2) return null
    const targetIndex = rng.int(lo + 2, top)
    if (targetIndex - 2 < shownCount + 2) return null
    const secondIndex = rng.int(shownCount + 2, targetIndex - 2)
    return { shape, height, shownCount, ask, targetIndex, secondIndex }
  }

  return { shape, height, shownCount, ask, targetIndex: rng.int(lo, top), secondIndex: 0 }
}

/**
 * Every number the stem itself prints. The answer must not be one of them, or a
 * child could copy it back out of the question without touching the pattern.
 */
export function stemNumbers(p: SolvableFigure, targetCount: number): Set<string> {
  const out = new Set(['1', String(p.shownCount)])
  if (p.ask === 'n-where-count-is') {
    out.add(String(targetCount))
  } else {
    out.add(String(p.targetIndex))
    if (p.ask === 'difference-between-two') out.add(String(p.secondIndex))
  }
  return out
}

/**
 * Quality filter, not a correctness rule — `paramsSchema` already refuses the
 * ambiguous ones. This drops the puzzles that are technically fine but dull.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (s.rivals.length > 0) return false
  if (stemNumbers(p, s.targetCount).has(s.answer)) return false
  // The drawn pictures have to be countable at a glance; a 20-square picture 4
  // is already at the edge of what a grade-2 child will count reliably.
  if (s.shown[s.shown.length - 1] > 20) return false
  // A difference of one or two squares is not worth the walk.
  if (p.ask === 'difference-between-two' && Number(s.answer) < 5) return false
  // The answer must be somewhere the child could not have reached by counting.
  return Number(s.answer) > 0
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    if (candidate === null) continue
    if (solve(candidate).rivals.length > 0) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). A staircase is forced by its four
  // drawn pictures 1, 3, 6, 10 and asks for picture 10.
  return {
    shape: 'staircase',
    height: 1,
    shownCount: 4,
    ask: 'count-at-n',
    targetIndex: 10,
    secondIndex: 0,
  }
}

// ── Wording ──────────────────────────────────────────────────────────────────

/** "staircase" / "tangga" — what the child should call the shape. */
export function shapeName(shape: Shape, height: number, lang: 'en' | 'id'): string {
  switch (shape) {
    case 'staircase':
      return lang === 'id' ? 'tangga' : 'staircase'
    case 'square-block':
      return lang === 'id' ? 'blok persegi' : 'square block'
    case 'oblong':
      return lang === 'id' ? 'blok persegi panjang' : 'rectangle block'
    case 'l-corner':
      return lang === 'id' ? 'siku' : 'corner'
    case 'plus-arms':
      return lang === 'id' ? 'tanda tambah' : 'plus sign'
    case 'bar-rows':
      return lang === 'id' ? `batang ${height} baris` : `${height}-row bar`
  }
}

/**
 * How picture n is BUILT, and the arithmetic that follows from the build. This
 * is the sentence that makes the rule the only one: the child is not guessing a
 * sequence, they are reading the drawing.
 */
export function ruleSentence(shape: Shape, height: number, lang: 'en' | 'id'): string {
  const id = lang === 'id'
  switch (shape) {
    case 'staircase':
      return id
        ? 'gambar ke-n adalah tangga dengan n baris berisi 1, 2, sampai n persegi, jadi gambar ke-n punya 1 + 2 + ... + n = n × (n + 1) : 2 persegi'
        : 'picture n is a staircase of n rows holding 1, 2, up to n squares, so picture n has 1 + 2 + ... + n = n × (n + 1) ÷ 2 squares'
    case 'square-block':
      return id
        ? 'gambar ke-n adalah blok selebar n persegi dan setinggi n persegi, jadi gambar ke-n punya n × n persegi'
        : 'picture n is a block n squares wide and n squares tall, so picture n has n × n squares'
    case 'oblong':
      return id
        ? 'gambar ke-n adalah blok setinggi n persegi dan selebar n + 1 persegi, jadi gambar ke-n punya n × (n + 1) persegi'
        : 'picture n is a block n squares tall and n + 1 squares wide, so picture n has n × (n + 1) squares'
    case 'l-corner':
      return id
        ? 'gambar ke-n adalah siku: n persegi ke bawah lalu n − 1 persegi lagi ke kanan, jadi gambar ke-n punya 2 × n − 1 persegi'
        : 'picture n is a corner: n squares going down then n − 1 more going right, so picture n has 2 × n − 1 squares'
    case 'plus-arms':
      return id
        ? 'gambar ke-n adalah tanda tambah: 1 persegi di tengah ditambah 4 lengan berisi n − 1 persegi, jadi gambar ke-n punya 4 × n − 3 persegi'
        : 'picture n is a plus sign: 1 middle square plus 4 arms of n − 1 squares, so picture n has 4 × n − 3 squares'
    case 'bar-rows':
      return id
        ? `gambar ke-n adalah ${height} baris berisi n persegi, jadi gambar ke-n punya ${height} × n persegi`
        : `picture n is ${height} rows of n squares, so picture n has ${height} × n squares`
  }
}

/** "10 × 11 ÷ 2 = 55" — the rule with a number put in for n. */
export function evalPhrase(shape: Shape, height: number, n: number, lang: 'en' | 'id'): string {
  const v = closedForm(shape, height, n)
  const id = lang === 'id'
  switch (shape) {
    case 'staircase':
      return id ? `${n} × ${n + 1} : 2 = ${v}` : `${n} × ${n + 1} ÷ 2 = ${v}`
    case 'square-block':
      return `${n} × ${n} = ${v}`
    case 'oblong':
      return `${n} × ${n + 1} = ${v}`
    case 'l-corner':
      return `2 × ${n} − 1 = ${v}`
    case 'plus-arms':
      return `4 × ${n} − 3 = ${v}`
    case 'bar-rows':
      return `${height} × ${n} = ${v}`
  }
}

/** Running the rule backwards from a count to the picture number. */
export function backwardPhrase(
  shape: Shape,
  height: number,
  count: number,
  n: number,
  lang: 'en' | 'id',
): string {
  const id = lang === 'id'
  switch (shape) {
    case 'staircase':
      return id
        ? `n × (n + 1) : 2 = ${count}, jadi n × (n + 1) = ${2 * count}; karena ${n} × ${n + 1} = ${2 * count}, maka n = ${n}`
        : `n × (n + 1) ÷ 2 = ${count}, so n × (n + 1) = ${2 * count}; since ${n} × ${n + 1} = ${2 * count}, n = ${n}`
    case 'square-block':
      return id
        ? `n × n = ${count}, dan ${n} × ${n} = ${count}, jadi n = ${n}`
        : `n × n = ${count}, and ${n} × ${n} = ${count}, so n = ${n}`
    case 'oblong':
      return id
        ? `n × (n + 1) = ${count}, dan ${n} × ${n + 1} = ${count}, jadi n = ${n}`
        : `n × (n + 1) = ${count}, and ${n} × ${n + 1} = ${count}, so n = ${n}`
    case 'l-corner':
      return id
        ? `2 × n − 1 = ${count}, jadi 2 × n = ${count + 1} dan n = ${n}`
        : `2 × n − 1 = ${count}, so 2 × n = ${count + 1} and n = ${n}`
    case 'plus-arms':
      return id
        ? `4 × n − 3 = ${count}, jadi 4 × n = ${count + 3} dan n = ${n}`
        : `4 × n − 3 = ${count}, so 4 × n = ${count + 3} and n = ${n}`
    case 'bar-rows':
      return id
        ? `${height} × n = ${count}, jadi n = ${count} : ${height} = ${n}`
        : `${height} × n = ${count}, so n = ${count} ÷ ${height} = ${n}`
  }
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(p: SolvableFigure, targetCount: number, lang: 'en' | 'id'): string {
  const id = lang === 'id'
  if (p.ask === 'count-at-n') {
    return id
      ? `Berapa banyak persegi kecil pada gambar ke-${p.targetIndex}?`
      : `How many small squares does picture ${p.targetIndex} have?`
  }
  if (p.ask === 'n-where-count-is') {
    return id
      ? `Gambar ke berapa yang punya tepat ${targetCount} persegi kecil?`
      : `Which picture has exactly ${targetCount} small squares?`
  }
  return id
    ? `Berapa lebih banyak persegi kecil pada gambar ke-${p.targetIndex} daripada gambar ke-${p.secondIndex}?`
    : `How many more small squares does picture ${p.targetIndex} have than picture ${p.secondIndex}?`
}

/** "1, 3 and 6" — an English list. */
export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** "1, 3, dan 6". */
export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

// ── Rendering ────────────────────────────────────────────────────────────────

export function render(params: Params): Rendered {
  const { shape, height, shownCount, ask, targetIndex, secondIndex } = params
  const s = solve(params)
  const breakdown = buildGrowingFigureNthTermBreakdown(params)

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = [
    `Pictures 1 to ${shownCount} below are built from small squares.`,
    `Each new picture grows from the one before it in the same way.`,
    `The later pictures are not drawn, but the pattern keeps going.`,
    `Find: ${askClause(params, s.targetCount, 'en')}`,
  ].join(' ')
  const body_id = [
    `Gambar ke-1 sampai gambar ke-${shownCount} di bawah disusun dari persegi kecil.`,
    `Setiap gambar baru tumbuh dari gambar sebelumnya dengan cara yang sama.`,
    `Gambar berikutnya tidak digambar, tetapi polanya terus berlanjut.`,
    `Cari: ${askClause(params, s.targetCount, 'id')}`,
  ].join(' ')

  // ── hint_steps: count, difference, name the rule from the BUILD, then use it.
  // Nothing is announced — the rule arrives as a reading of the drawing, and the
  // drawn pictures are checked against it before it is trusted at picture N.
  const counted_en = s.shown.map((v, i) => `picture ${i + 1} has ${v}`)
  const counted_id = s.shown.map((v, i) => `gambar ke-${i + 1} punya ${v}`)
  const steps_en: string[] = [
    `Count the small squares one picture at a time: ${listEn(counted_en)}.`,
  ]
  const steps_id: string[] = [
    `Hitung persegi kecilnya satu gambar demi satu gambar: ${listId(counted_id)}.`,
  ]

  const jumpList = s.jumps.map(String)
  if (s.sameJump) {
    steps_en.push(
      `The jumps between them are ${listEn(jumpList)} — the same jump every time, so every new picture adds ${s.jumps[0]}.`,
    )
    steps_id.push(
      `Lompatannya ${listId(jumpList)} — selalu sama, jadi setiap gambar baru menambah ${s.jumps[0]}.`,
    )
  } else {
    const grow = s.jumpGrowth
    steps_en.push(
      `The jumps between them are ${listEn(jumpList)} — not the same jump twice${grow === null ? '' : `, each jump is ${grow} bigger than the one before`}, so you cannot just keep adding one number.`,
    )
    steps_id.push(
      `Lompatannya ${listId(jumpList)} — tidak pernah sama${grow === null ? '' : `, tiap lompatan ${grow} lebih besar dari lompatan sebelumnya`}, jadi tidak bisa hanya menambah satu bilangan terus-menerus.`,
    )
  }

  const lastShown = shownCount
  steps_en.push(
    `Look at how a picture is made: ${ruleSentence(shape, height, 'en')}. Check it on the drawings: ${evalPhrase(shape, height, 1, 'en')} and ${evalPhrase(shape, height, lastShown, 'en')} — both match.`,
  )
  steps_id.push(
    `Lihat cara gambarnya dibuat: ${ruleSentence(shape, height, 'id')}. Cek pada gambar yang ada: ${evalPhrase(shape, height, 1, 'id')} dan ${evalPhrase(shape, height, lastShown, 'id')} — dua-duanya cocok.`,
  )

  if (s.trap !== null) {
    const lastJump = s.jumps[s.jumps.length - 1]
    const wrong_en =
      ask === 'n-where-count-is' ? `land on picture ${s.trap}` : `give ${s.trap}`
    const wrong_id =
      ask === 'n-where-count-is' ? `berhenti di gambar ke-${s.trap}` : `menghasilkan ${s.trap}`
    steps_en.push(
      `Careful: adding the last jump of ${lastJump} over and over would ${wrong_en}, but the jumps keep growing, so that road is wrong.`,
    )
    steps_id.push(
      `Hati-hati: kalau lompatan terakhir ${lastJump} ditambahkan terus-menerus, cara itu ${wrong_id}, padahal lompatannya makin besar, jadi jalan itu salah.`,
    )
  }

  if (ask === 'count-at-n') {
    steps_en.push(
      `Put ${targetIndex} in place of n: ${evalPhrase(shape, height, targetIndex, 'en')}, so picture ${targetIndex} has ${s.answer} small squares.`,
    )
    steps_id.push(
      `Ganti n dengan ${targetIndex}: ${evalPhrase(shape, height, targetIndex, 'id')}, jadi gambar ke-${targetIndex} punya ${s.answer} persegi kecil.`,
    )
  } else if (ask === 'n-where-count-is') {
    steps_en.push(
      `Now run the rule backwards: ${backwardPhrase(shape, height, s.targetCount, targetIndex, 'en')}. So it is picture ${s.answer}.`,
    )
    steps_id.push(
      `Sekarang jalankan aturannya mundur: ${backwardPhrase(shape, height, s.targetCount, targetIndex, 'id')}. Jadi itu gambar ke-${s.answer}.`,
    )
  } else {
    steps_en.push(
      `Use the rule twice: ${evalPhrase(shape, height, targetIndex, 'en')} and ${evalPhrase(shape, height, secondIndex, 'en')}, so picture ${targetIndex} has ${s.targetCount} − ${s.secondCount} = ${s.answer} more.`,
    )
    steps_id.push(
      `Pakai aturannya dua kali: ${evalPhrase(shape, height, targetIndex, 'id')} dan ${evalPhrase(shape, height, secondIndex, 'id')}, jadi gambar ke-${targetIndex} lebih banyak ${s.targetCount} − ${s.secondCount} = ${s.answer}.`,
    )
  }

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en:
      'Count each drawn picture first, then look at how the picture is BUILT — that tells you what picture n holds, and the drawings are there to check it.',
    hint_id:
      'Hitung dulu setiap gambar yang ada, lalu lihat cara gambarnya DIBUAT — dari situ ketahuan isi gambar ke-n, dan gambar yang ada dipakai untuk mengeceknya.',
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
