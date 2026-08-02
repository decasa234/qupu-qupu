import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildRowColumnSumGridBreakdown } from './breakdown.js'

// A small grid of numbers with some squares covered up. Beside some rows and
// under some columns the paper prints that line's total. The child has to work
// out what is hiding under the covers.
//
// The single fact this concept lives or dies on: a printed total is only useful
// on a line where exactly ONE square is still covered. That line then FORCES its
// covered number — total minus the numbers you can already see. Filling it in
// can hand a second line its own single blank, and so the grid unzips itself.
//
// So the generator may never emit a grid that merely *has* a nice answer; it
// must emit one where every covered square is forced by that rule. A grid with
// two covered squares sharing the only printed line has two (in fact many)
// completions, and a child who "solves" it has really only guessed. `solve`
// below replays the forcing rule step by step and refuses to hand back a params
// object whose covers it could not all pin down; `paramsSchema` rejects those,
// and `index.test.ts` re-checks uniqueness by exhaustive search over 1..9.
export const ASKS = ['one-cell', 'sum-of-two', 'two-digit-number-formed'] as const
export type Ask = (typeof ASKS)[number]

export const SUM_MODES = ['all-rows', 'all-cols', 'mixed'] as const
export type SumMode = (typeof SUM_MODES)[number]

/**
 * The cover glyph for the i-th covered square, in reading order (top-left
 * first). Shared verbatim with the in-card figure and the explainer so the
 * stem, the picture and the animation always name the same square the same way.
 */
export const SYMBOLS = ['★', '●', '◆'] as const

export interface Cell {
  r: number
  c: number
}

const cellKey = (cell: Cell): string => `${cell.r},${cell.c}`
const sameCell = (a: Cell, b: Cell): boolean => a.r === b.r && a.c === b.c

const cellSchema = z.object({
  r: z.number().int().min(0).max(2),
  c: z.number().int().min(0).max(2),
})

const paramsSchema = z
  .object({
    rows: z.number().int().min(2).max(3),
    cols: z.number().int().min(2).max(3),
    /** The TRUE contents of every square, row-major. Covered squares included. */
    grid: z.array(z.array(z.number().int().min(1).max(9))),
    /** The covered squares, in reading order. `SYMBOLS[i]` names `hidden[i]`. */
    hidden: z.array(cellSchema).min(1).max(3),
    /** Whether row i prints its total beside it. */
    rowSumShown: z.array(z.boolean()),
    /** Whether column j prints its total under it. */
    colSumShown: z.array(z.boolean()),
    ask: z.enum(ASKS),
    /** Indices into `hidden`. One for `one-cell`, two (in reading order) otherwise. */
    targets: z.array(z.number().int().min(0).max(2)).min(1).max(2),
  })
  .refine((v) => v.grid.length === v.rows && v.grid.every((row) => row.length === v.cols), {
    message: 'grid must be exactly rows x cols',
  })
  .refine((v) => v.rows * v.cols >= 6, { message: 'the grid must be at least 2 by 3' })
  .refine((v) => v.rowSumShown.length === v.rows && v.colSumShown.length === v.cols, {
    message: 'one shown-flag per row and per column',
  })
  .refine((v) => v.rowSumShown.some(Boolean) || v.colSumShown.some(Boolean), {
    message: 'at least one total must be printed, or nothing is knowable',
  })
  .refine(
    (v) =>
      v.hidden.every((h) => h.r < v.rows && h.c < v.cols) &&
      new Set(v.hidden.map(cellKey)).size === v.hidden.length,
    { message: 'covered squares must be distinct and inside the grid' },
  )
  .refine((v) => v.hidden.length < v.rows * v.cols, {
    message: 'at least one square must stay visible',
  })
  .refine((v) => v.targets.length === (v.ask === 'one-cell' ? 1 : 2), {
    message: 'one-cell asks for one square; the other asks combine two',
  })
  .refine(
    (v) =>
      new Set(v.targets).size === v.targets.length &&
      v.targets.every((i) => i < v.hidden.length),
    { message: 'targets must be distinct covered squares' },
  )
  // THE load-bearing rule. Everything above is shape; this is the promise that
  // the puzzle has exactly one completion and that a child can reach it by
  // reasoning rather than by trying numbers.
  .refine((v) => !structurallySound(v) || solve(v).forced, {
    message: 'every covered square must be forced by the printed totals',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'row-column-sum-grid',
  name_en: 'Grid with row and column totals',
  name_id: 'Kisi dengan jumlah baris dan kolom',
  grades: [1, 2, 3] as const,
  description_id:
    'Membaca jumlah baris dan jumlah kolom yang tercetak di pinggir kisi untuk menemukan bilangan yang tertutup, lalu menggabungkan dua di antaranya.',
} as const

// ── The forcing solver ───────────────────────────────────────────────────────

/**
 * The minimum shape `solve` needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `solve()`: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself. Same
 * trick `delete-digits-extremise` uses for its `SolvableDigits`.
 */
export interface SolvableGrid {
  rows: number
  cols: number
  grid: number[][]
  hidden: Cell[]
  rowSumShown: boolean[]
  colSumShown: boolean[]
  ask: Ask
  targets: number[]
}

/** One printed total, plus the squares it adds up. */
export interface Line {
  kind: 'row' | 'col'
  /** Row index for a row line, column index for a column line. 0-based. */
  index: number
  cells: Cell[]
  sum: number
}

/** Enough of a params object to be worth running the solver on at all. */
function structurallySound(v: SolvableGrid): boolean {
  if (v.grid.length !== v.rows) return false
  if (v.grid.some((row) => row.length !== v.cols)) return false
  if (v.rowSumShown.length !== v.rows || v.colSumShown.length !== v.cols) return false
  if (v.hidden.length === 0) return false
  return v.hidden.every((h) => h.r < v.rows && h.c < v.cols)
}

/** Every total the paper actually prints, rows first then columns. */
export function printedLines(p: SolvableGrid): Line[] {
  const lines: Line[] = []
  for (let r = 0; r < p.rows; r++) {
    if (!p.rowSumShown[r]) continue
    const cells = Array.from({ length: p.cols }, (_, c) => ({ r, c }))
    lines.push({ kind: 'row', index: r, cells, sum: cells.reduce((s, x) => s + p.grid[x.r][x.c], 0) })
  }
  for (let c = 0; c < p.cols; c++) {
    if (!p.colSumShown[c]) continue
    const cells = Array.from({ length: p.rows }, (_, r) => ({ r, c }))
    lines.push({ kind: 'col', index: c, cells, sum: cells.reduce((s, x) => s + p.grid[x.r][x.c], 0) })
  }
  return lines
}

/** One turn of the forcing rule: a line with a single blank gives that blank up. */
export interface SolveStep {
  kind: 'row' | 'col'
  index: number
  sum: number
  /**
   * The squares in that line that were already readable, left to right / top to
   * bottom. `hiddenIndex` is non-null for the ones an earlier step uncovered —
   * that is what makes the dependency chain visible.
   */
  known: { cell: Cell; value: number; symbol: string | null; hiddenIndex: number | null }[]
  cell: Cell
  /** Index into `hidden` of the square this step pins down. */
  hiddenIndex: number
  symbol: string
  value: number
}

export interface Solution {
  /** The forcing trail, in the order a child can actually walk it. */
  steps: SolveStep[]
  /**
   * The sub-trail the answer actually depends on: the targets plus every cover
   * an earlier step had to uncover to reach them. Equal to `steps` for the grids
   * `generate` emits (decoy covers are filtered out), but computed honestly so a
   * hand-authored params object never gets narrated a step it does not need.
   */
  neededSteps: SolveStep[]
  /** Value of every covered square, index-aligned with `hidden`. */
  values: number[]
  /** True when the printed totals pin down every covered square on their own. */
  forced: boolean
  targetValues: number[]
  targetSymbols: string[]
  answer: string
}

export function solve(p: SolvableGrid): Solution {
  const indexOf = new Map<string, number>()
  p.hidden.forEach((h, i) => indexOf.set(cellKey(h), i))

  // `null` = still covered. Visible squares start readable; covered ones only
  // become readable once a printed total has forced them.
  const readable: (number | null)[][] = Array.from({ length: p.rows }, (_, r) =>
    Array.from({ length: p.cols }, (__, c) => (indexOf.has(cellKey({ r, c })) ? null : p.grid[r][c])),
  )
  const lines = printedLines(p)
  const steps: SolveStep[] = []

  let progressed = true
  while (progressed) {
    progressed = false
    for (const line of lines) {
      const blanks = line.cells.filter((x) => readable[x.r][x.c] === null)
      if (blanks.length !== 1) continue
      const cell = blanks[0]
      const known = line.cells
        .filter((x) => !sameCell(x, cell))
        .map((x) => {
          const at = indexOf.get(cellKey(x))
          return {
            cell: x,
            value: readable[x.r][x.c] as number,
            symbol: at === undefined ? null : SYMBOLS[at],
            hiddenIndex: at === undefined ? null : at,
          }
        })
      const value = known.reduce((rest, k) => rest - k.value, line.sum)
      // Two independent sources for the same number: the printed total minus
      // what is visible, and the grid the question was built from. If they ever
      // disagree the concept is broken, and failing loudly beats narrating a
      // subtraction that lands somewhere other than the answer.
      if (value !== p.grid[cell.r][cell.c]) {
        throw new Error(
          `row-column-sum-grid: printed ${line.kind} total ${line.sum} at ${line.index} gives ${value} for (${cell.r},${cell.c}) but the grid holds ${p.grid[cell.r][cell.c]}`,
        )
      }
      const hiddenIndex = indexOf.get(cellKey(cell)) as number
      steps.push({
        kind: line.kind,
        index: line.index,
        sum: line.sum,
        known,
        cell,
        hiddenIndex,
        symbol: SYMBOLS[hiddenIndex],
        value,
      })
      readable[cell.r][cell.c] = value
      progressed = true
      // Restart the scan so the trail always reads "…and NOW this line has only
      // one blank left", which is exactly the argument the hints make.
      break
    }
  }

  // The true contents are always known to the generator; `forced` is what says
  // whether a child could have found them.
  const values = p.hidden.map((h) => p.grid[h.r][h.c])
  const forced = steps.length === p.hidden.length
  const targets = p.targets.filter((i) => i >= 0 && i < p.hidden.length)
  const targetValues = targets.map((i) => values[i])
  const targetSymbols = targets.map((i) => SYMBOLS[i])
  const answer =
    p.ask === 'one-cell'
      ? String(targetValues[0] ?? values[0])
      : p.ask === 'sum-of-two'
        ? String((targetValues[0] ?? 0) + (targetValues[1] ?? 0))
        : String((targetValues[0] ?? 0) * 10 + (targetValues[1] ?? 0))

  // Walk the trail backwards: a step matters if the answer needs it, and a step
  // the answer needs drags in whichever earlier covers it leaned on.
  const needed = new Set(targets)
  for (let i = steps.length - 1; i >= 0; i--) {
    if (!needed.has(steps[i].hiddenIndex)) continue
    for (const k of steps[i].known) if (k.hiddenIndex !== null) needed.add(k.hiddenIndex)
  }
  const neededSteps = steps.filter((step) => needed.has(step.hiddenIndex))

  return { steps, neededSteps, values, forced, targetValues, targetSymbols, answer }
}

/**
 * Writing the two digits the wrong way round — the one genuinely tempting wrong
 * answer this concept has, and only for the two-digit ask. `null` when the two
 * digits are equal (swapping would give the right answer back) or when the ask
 * has no order to get wrong.
 */
export function trapAnswer(p: SolvableGrid, s: Solution): string | null {
  if (p.ask !== 'two-digit-number-formed') return null
  if (s.targetValues.length < 2) return null
  const swapped = String(s.targetValues[1] * 10 + s.targetValues[0])
  return swapped === s.answer ? null : swapped
}

// ── Generation ───────────────────────────────────────────────────────────────

const SHAPES = [
  { rows: 2, cols: 3 },
  { rows: 3, cols: 2 },
  { rows: 3, cols: 3 },
] as const

/**
 * Covers are chosen in REVERSE solving order. When a square is added, some
 * printed line through it must avoid every square chosen so far — those are the
 * ones that will still be covered when this square's turn comes, so that line
 * will hold exactly one blank at that moment. Reversing the list therefore
 * yields a legal forcing order, and single-blank propagation is monotone (a
 * line that can be filled never stops being fillable), so `solve`'s own greedy
 * order is guaranteed to find them all too.
 */
function chooseCovers(rng: Rng, lines: Line[], rows: number, cols: number, want: number): Cell[] {
  const laterFirst: Cell[] = []
  for (let n = 0; n < want; n++) {
    const taken = new Set(laterFirst.map(cellKey))
    const candidates: Cell[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = { r, c }
        if (taken.has(cellKey(cell))) continue
        const usable = lines.some(
          (line) =>
            line.cells.some((x) => sameCell(x, cell)) &&
            line.cells.every((x) => sameCell(x, cell) || !taken.has(cellKey(x))),
        )
        if (usable) candidates.push(cell)
      }
    }
    if (candidates.length === 0) break
    laterFirst.push(rng.pick(candidates))
  }
  return laterFirst
}

function draft(rng: Rng): Params {
  const { rows, cols } = rng.pick(SHAPES)
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rng.int(1, 9)))

  const mode: SumMode = rng.pick(SUM_MODES)
  const rowSumShown = Array.from({ length: rows }, () => mode === 'all-rows')
  const colSumShown = Array.from({ length: cols }, () => mode === 'all-cols')
  if (mode === 'mixed') {
    for (let r = 0; r < rows; r++) rowSumShown[r] = rng.int(0, 1) === 1
    for (let c = 0; c < cols; c++) colSumShown[c] = rng.int(0, 1) === 1
    if (!rowSumShown.some(Boolean)) rowSumShown[rng.int(0, rows - 1)] = true
    if (!colSumShown.some(Boolean)) colSumShown[rng.int(0, cols - 1)] = true
  }

  const wantedAsk = rng.pick(ASKS)
  const want = wantedAsk === 'one-cell' ? rng.int(1, 3) : rng.int(2, 3)
  const skeleton: SolvableGrid = {
    rows,
    cols,
    grid,
    hidden: [],
    rowSumShown,
    colSumShown,
    ask: 'one-cell',
    targets: [0],
  }
  const covers = chooseCovers(rng, printedLines(skeleton), rows, cols, want)
  // At least one printed line always exists, so at least one cover is always
  // placeable; a short list just means this shape could not carry the ask.
  const hidden = [...covers].sort((a, b) => a.r - b.r || a.c - b.c)
  const ask: Ask = hidden.length >= 2 ? wantedAsk : 'one-cell'

  // Ask about the squares that fall LAST, so the child has to walk the whole
  // chain rather than read the answer off the first line they look at.
  const probe = solve({ ...skeleton, hidden, ask: 'one-cell', targets: [0] })
  const order = probe.steps.map((s) => s.hiddenIndex)
  const lastSolved = order.length > 0 ? order : hidden.map((_, i) => i)
  const targets =
    ask === 'one-cell'
      ? [lastSolved[lastSolved.length - 1]]
      : [...lastSolved.slice(-2)].sort((a, b) => a - b)

  return { rows, cols, grid, hidden, rowSumShown, colSumShown, ask, targets }
}

/**
 * Quality filter, not a correctness rule — `draft` already aims at forced
 * grids, and `paramsSchema` refuses the ones that miss. This rejects the shapes
 * that are technically fine but pedagogically bad.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (!s.forced) return false
  // A two-digit number whose digits are equal reads the same backwards, so the
  // ordering the question makes a point of would carry no weight.
  if (p.ask === 'two-digit-number-formed' && s.targetValues[0] === s.targetValues[1]) return false
  // If both targets are the only two blanks on one printed line, that line hands
  // over their TOTAL in a single subtraction — a shorter road than the one the
  // hints walk. Right answer, different argument; keep the two apart instead.
  if (p.ask === 'sum-of-two') {
    const covered = new Set(p.hidden.map(cellKey))
    const a = p.hidden[p.targets[0]]
    const b = p.hidden[p.targets[1]]
    const shortcut = printedLines(p).some((line) => {
      const blanks = line.cells.filter((x) => covered.has(cellKey(x)))
      return blanks.length === 2 && blanks.some((x) => sameCell(x, a)) && blanks.some((x) => sameCell(x, b))
    })
    if (shortcut) return false
  }
  // No decoys. A cover the answer never depends on would sit on the figure
  // unexplained, and its hint line would be dead weight the child has to read
  // past. Every square that is covered must be a square the answer needs.
  if (s.neededSteps.length !== p.hidden.length) return false
  // Every step should ask for real arithmetic: a line of two squares where the
  // visible one is the whole story is not much of a puzzle for three covers.
  return s.steps.every((step) => step.known.length >= 1)
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 120; attempt++) {
    const candidate = draft(rng)
    if (!solve(candidate).forced) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). Fall back to a hand-built grid
  // that is forced by construction: row 1 and column 1 each hold one cover.
  return {
    rows: 3,
    cols: 3,
    grid: [
      [4, 2, 9],
      [3, 5, 1],
      [7, 6, 8],
    ],
    hidden: [{ r: 0, c: 2 }],
    rowSumShown: [true, false, false],
    colSumShown: [false, false, false],
    ask: 'one-cell',
    targets: [0],
  }
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** "★", "★ and ●", "★, ● and ◆" — an English list of cover glyphs. */
export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** "★", "★ dan ●", "★, ●, dan ◆". */
export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

const COUNT_EN = ['', 'one', 'two', 'three'] as const
const COUNT_ID = ['', 'satu', 'dua', 'tiga'] as const

/** The sentence naming what is covered. Exported so the breakdown can quote it. */
export function coverClause(hiddenCount: number, lang: 'en' | 'id'): string {
  const glyphs: string[] = SYMBOLS.slice(0, hiddenCount)
  if (lang === 'id') {
    return `${listId(glyphs)} menutupi ${COUNT_ID[hiddenCount]} kotak yang bilangannya belum diketahui`
  }
  const verb = hiddenCount === 1 ? 'covers' : 'cover'
  const noun = hiddenCount === 1 ? 'square whose number is missing' : 'squares whose numbers are missing'
  return `${listEn(glyphs)} ${verb} the ${COUNT_EN[hiddenCount]} ${noun}`
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, symbols: string[], lang: 'en' | 'id'): string {
  const [a, b] = symbols
  if (ask === 'one-cell') {
    return lang === 'id' ? `Berapa bilangan di bawah ${a}?` : `What number is under ${a}?`
  }
  if (ask === 'sum-of-two') {
    return lang === 'id' ? `Berapa ${a} + ${b}?` : `What is ${a} + ${b}?`
  }
  return lang === 'id'
    ? `Berapa bilangan 2-angka ${a}${b} (${a} dulu, lalu ${b})?`
    : `What is the 2-digit number ${a}${b} (${a} first, then ${b})?`
}

/** "Row 2" / "Baris ke-2" — lines are numbered from the top and from the left. */
function lineName(step: SolveStep, lang: 'en' | 'id'): string {
  const n = step.index + 1
  if (lang === 'id') return step.kind === 'row' ? `baris ke-${n}` : `kolom ke-${n}`
  return step.kind === 'row' ? `row ${n}` : `column ${n}`
}

export function render(params: Params): Rendered {
  const { rows, cols, hidden, rowSumShown, colSumShown, ask } = params
  const s = solve(params)
  const breakdown = buildRowColumnSumGridBreakdown(params)
  const showsRows = rowSumShown.some(Boolean)
  const showsCols = colSumShown.some(Boolean)

  const rules_en: string[] = []
  const rules_id: string[] = []
  if (showsRows) {
    rules_en.push('The number beside a row is the sum of that whole row.')
    rules_id.push('Bilangan di samping sebuah baris adalah jumlah seluruh baris itu.')
  }
  if (showsCols) {
    rules_en.push('The number under a column is the sum of that whole column.')
    rules_id.push('Bilangan di bawah sebuah kolom adalah jumlah seluruh kolom itu.')
  }

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = [
    `In the ${rows}-by-${cols} grid, every square holds a number from 1 to 9.`,
    ...rules_en,
    `${coverClause(hidden.length, 'en')}.`,
    `Find: ${askClause(ask, s.targetSymbols, 'en')}`,
  ].join(' ')
  const body_id = [
    `Pada kisi ${rows} kali ${cols}, setiap kotak berisi satu bilangan dari 1 sampai 9.`,
    ...rules_id,
    `${coverClause(hidden.length, 'id')}.`,
    `Cari: ${askClause(ask, s.targetSymbols, 'id')}`,
  ].join(' ')

  // ── hint_steps: the forcing trail, applied to THIS grid, one line at a time.
  // Every step names the line it uses AND why that line is usable now (exactly
  // one blank), so the numbers are deduced rather than announced.
  const steps_en: string[] = [
    `Rows are counted from the top and columns from the left. A printed total only helps on a line with exactly one covered square left — that total minus the numbers you can see is what the cover hides.`,
  ]
  const steps_id: string[] = [
    `Baris dihitung dari atas dan kolom dari kiri. Jumlah yang tercetak baru berguna pada garis yang tinggal punya tepat satu kotak tertutup — jumlah itu dikurangi bilangan yang terlihat adalah isi kotak tertutup itu.`,
  ]

  for (const step of s.neededSteps) {
    const helpers = step.known.filter((k) => k.symbol !== null)
    const lead_en =
      helpers.length === 0
        ? `Look at ${lineName(step, 'en')}: its total is printed and only one square in it is covered, ${step.symbol}.`
        : `With ${listEn(helpers.map((k) => `${k.symbol} = ${k.value}`))} filled in, ${lineName(step, 'en')} is down to one covered square, ${step.symbol}.`
    const lead_id =
      helpers.length === 0
        ? `Lihat ${lineName(step, 'id')}: jumlahnya tercetak dan hanya satu kotak di situ yang tertutup, yaitu ${step.symbol}.`
        : `Setelah ${listId(helpers.map((k) => `${k.symbol} = ${k.value}`))} terisi, ${lineName(step, 'id')} tinggal punya satu kotak tertutup, yaitu ${step.symbol}.`

    const seen = step.known.map((k) => k.value)
    const sum_en = `The rest of that ${step.kind === 'row' ? 'row' : 'column'} shows ${listEn(seen.map(String))}, and the whole ${step.kind === 'row' ? 'row' : 'column'} makes ${step.sum}, so ${step.symbol} = ${step.sum} − ${seen.join(' − ')} = ${step.value}.`
    const sum_id = `Sisa ${step.kind === 'row' ? 'baris' : 'kolom'} itu memperlihatkan ${listId(seen.map(String))}, sedangkan seluruh ${step.kind === 'row' ? 'baris' : 'kolom'} berjumlah ${step.sum}, jadi ${step.symbol} = ${step.sum} − ${seen.join(' − ')} = ${step.value}.`

    steps_en.push(`${lead_en} ${sum_en}`)
    steps_id.push(`${lead_id} ${sum_id}`)
  }

  const [ta, tb] = s.targetSymbols
  const [va, vb] = s.targetValues
  if (ask === 'one-cell') {
    steps_en.push(`So the square under ${ta} holds ${s.answer}.`)
    steps_id.push(`Jadi kotak di bawah ${ta} berisi ${s.answer}.`)
  } else if (ask === 'sum-of-two') {
    steps_en.push(`${ta} is ${va} and ${tb} is ${vb}, so ${ta} + ${tb} = ${va} + ${vb} = ${s.answer}.`)
    steps_id.push(`${ta} bernilai ${va} dan ${tb} bernilai ${vb}, jadi ${ta} + ${tb} = ${va} + ${vb} = ${s.answer}.`)
  } else {
    steps_en.push(
      `${ta} is ${va} and ${tb} is ${vb}. The question wants ${ta} first, so ${va} is the tens digit and ${vb} is the ones digit: ${s.answer}.`,
    )
    steps_id.push(
      `${ta} bernilai ${va} dan ${tb} bernilai ${vb}. Yang diminta ${ta} dulu, jadi ${va} jadi angka puluhan dan ${vb} jadi angka satuan: ${s.answer}.`,
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
      'Hunt for a printed total whose row or column has just one covered square left. Take the numbers you can see away from that total and the cover has nowhere to hide.',
    hint_id:
      'Cari jumlah tercetak yang baris atau kolomnya tinggal punya satu kotak tertutup. Kurangi jumlah itu dengan bilangan yang terlihat, dan kotak tertutup itu tidak bisa sembunyi lagi.',
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
