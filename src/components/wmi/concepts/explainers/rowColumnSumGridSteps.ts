import type { Lang } from './makeTenSteps'

// `row-column-sum-grid`. A grid with a few squares covered over, and totals
// printed beside some rows and under some columns.
//
// The move this storyboard has to teach is patience: a printed total is useless
// on a line with two covers and decisive on a line with one. So every beat
// spotlights ONE line, says out loud why that line is the one that can be done
// now ("only one square left covered"), and does the subtraction in front of the
// child. Nothing is ever announced; each number arrives as `total − what you can
// already see`.
//
// Mirrors api/services/wmi/concepts/row-column-sum-grid. Params arrive as
// `unknown` from the DB, so the grid, the covers and the forcing walk are all
// re-derived here; the storyboard can never narrate a line that does not in fact
// have exactly one blank at that moment.
export type RowColAsk = 'one-cell' | 'sum-of-two' | 'two-digit-number-formed'
export type RowColPhase = 'setup' | 'fill' | 'trap' | 'result'

/** What one square of the grid looks like on a given beat. */
export type SquareState = 'visible' | 'covered' | 'active' | 'solved' | 'asked'

export interface RowColCell {
  r: number
  c: number
}

export interface RowColParams {
  rows: number
  cols: number
  grid: number[][]
  hidden: RowColCell[]
  rowSumShown: boolean[]
  colSumShown: boolean[]
  ask: RowColAsk
  targets: number[]
}

export interface RowColBeat {
  phase: RowColPhase
  caption: string
  /** Row-major, index `r * cols + c`. */
  cells: SquareState[]
  /** What to print in each square: a number once known, the cover glyph before. */
  labels: string[]
  /** The line this beat is reasoning about, or null. */
  active: { kind: 'row' | 'col'; index: number } | null
  /** The right digits in the wrong order (trap beat only). */
  trapNumber: string | null
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface RowColStoryboard {
  rows: number
  cols: number
  /** One entry per row: the printed total, or '' where the paper prints none. */
  rowSums: string[]
  colSums: string[]
  answer: string
  steps: RowColBeat[]
  finalIndex: number
}

/** Mirrors SYMBOLS in api/services/wmi/concepts/row-column-sum-grid. */
const SYMBOLS = ['★', '●', '◆']

const FALLBACK: RowColParams = {
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

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

function read(raw: unknown): RowColParams {
  const p = (raw ?? {}) as Partial<RowColParams>
  const rows = Math.max(2, Math.min(3, int(p.rows, 0)))
  const cols = Math.max(2, Math.min(3, int(p.cols, 0)))
  if (!Array.isArray(p.grid) || p.grid.length !== rows) return FALLBACK
  const grid = p.grid.map((row) => (Array.isArray(row) ? row.map((v) => int(v, 0)) : []))
  if (grid.some((row) => row.length !== cols)) return FALLBACK

  const hidden = (Array.isArray(p.hidden) ? p.hidden : [])
    .map((h) => ({ r: int((h as RowColCell)?.r, -1), c: int((h as RowColCell)?.c, -1) }))
    .filter((h) => h.r >= 0 && h.r < rows && h.c >= 0 && h.c < cols)
    .slice(0, SYMBOLS.length)
  if (hidden.length === 0) return FALLBACK

  const flags = (v: unknown, len: number): boolean[] =>
    Array.isArray(v) && v.length === len ? v.map(Boolean) : new Array(len).fill(false)
  const rowSumShown = flags(p.rowSumShown, rows)
  const colSumShown = flags(p.colSumShown, cols)
  if (!rowSumShown.some(Boolean) && !colSumShown.some(Boolean)) return FALLBACK

  const ask: RowColAsk =
    p.ask === 'sum-of-two' || p.ask === 'two-digit-number-formed' ? p.ask : 'one-cell'
  const wanted = ask === 'one-cell' ? 1 : 2
  const targets = (Array.isArray(p.targets) ? p.targets : [])
    .map((t) => int(t, -1))
    .filter((t, i, all) => t >= 0 && t < hidden.length && all.indexOf(t) === i)
    .slice(0, wanted)
  if (targets.length !== wanted) {
    // A params object whose ask and targets disagree cannot be narrated
    // honestly; fall back to asking for the one square we are sure about.
    return { rows, cols, grid, hidden, rowSumShown, colSumShown, ask: 'one-cell', targets: [0] }
  }
  return { rows, cols, grid, hidden, rowSumShown, colSumShown, ask, targets }
}

interface Line {
  kind: 'row' | 'col'
  index: number
  cells: RowColCell[]
  sum: number
}

interface Walk {
  kind: 'row' | 'col'
  index: number
  sum: number
  known: { value: number; hiddenIndex: number | null }[]
  cell: RowColCell
  hiddenIndex: number
  symbol: string
  value: number
}

const key = (c: RowColCell): string => `${c.r},${c.c}`
const same = (a: RowColCell, b: RowColCell): boolean => a.r === b.r && a.c === b.c

function printedLines(p: RowColParams): Line[] {
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

/** Single-blank propagation: the only rule this concept ever uses. */
function forcingWalk(p: RowColParams): Walk[] {
  const indexOf = new Map(p.hidden.map((h, i) => [key(h), i]))
  const readable: (number | null)[][] = Array.from({ length: p.rows }, (_, r) =>
    Array.from({ length: p.cols }, (__, c) => (indexOf.has(key({ r, c })) ? null : p.grid[r][c])),
  )
  const lines = printedLines(p)
  const walk: Walk[] = []
  let progressed = true
  while (progressed) {
    progressed = false
    for (const line of lines) {
      const blanks = line.cells.filter((x) => readable[x.r][x.c] === null)
      if (blanks.length !== 1) continue
      const cell = blanks[0]
      const known = line.cells
        .filter((x) => !same(x, cell))
        .map((x) => ({ value: readable[x.r][x.c] as number, hiddenIndex: indexOf.get(key(x)) ?? null }))
      const hiddenIndex = indexOf.get(key(cell)) as number
      walk.push({
        kind: line.kind,
        index: line.index,
        sum: line.sum,
        known,
        cell,
        hiddenIndex,
        symbol: SYMBOLS[hiddenIndex],
        value: known.reduce((rest, k) => rest - k.value, line.sum),
      })
      readable[cell.r][cell.c] = walk[walk.length - 1].value
      progressed = true
      break
    }
  }
  return walk
}

/** The sub-walk the answer leans on — decoy covers get no beat of their own. */
function neededWalk(walk: Walk[], targets: number[]): Walk[] {
  const need = new Set(targets)
  for (let i = walk.length - 1; i >= 0; i--) {
    if (!need.has(walk[i].hiddenIndex)) continue
    for (const k of walk[i].known) if (k.hiddenIndex !== null) need.add(k.hiddenIndex)
  }
  return walk.filter((w) => need.has(w.hiddenIndex))
}

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

export function buildRowColumnSumGridSteps(raw: unknown, lang: Lang): RowColStoryboard {
  const p = read(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const walk = neededWalk(forcingWalk(p), p.targets)
  const coverAt = new Map(p.hidden.map((h, i) => [key(h), i]))
  const glyphs = p.hidden.map((_, i) => SYMBOLS[i])

  const rowSums = p.rowSumShown.map((on, r) =>
    on ? String(p.grid[r].reduce((s, v) => s + v, 0)) : '',
  )
  const colSums = p.colSumShown.map((on, c) =>
    on ? String(p.grid.reduce((s, row) => s + row[c], 0)) : '',
  )

  const targetSymbols = p.targets.map((t) => SYMBOLS[t])
  const targetValues = p.targets.map((t) => p.grid[p.hidden[t].r][p.hidden[t].c])
  const answer =
    p.ask === 'one-cell'
      ? String(targetValues[0])
      : p.ask === 'sum-of-two'
        ? String(targetValues[0] + targetValues[1])
        : String(targetValues[0] * 10 + targetValues[1])
  const trapNumber =
    p.ask === 'two-digit-number-formed' && targetValues[0] !== targetValues[1]
      ? String(targetValues[1] * 10 + targetValues[0])
      : null

  // A running picture: `solved` holds the covers already uncovered.
  const solved = new Set<number>()
  const board = (opts: {
    active: { kind: 'row' | 'col'; index: number } | null
    justSolved?: RowColCell | null
    asked?: boolean
  }): { cells: SquareState[]; labels: string[] } => {
    const cells: SquareState[] = []
    const labels: string[] = []
    for (let r = 0; r < p.rows; r++) {
      for (let c = 0; c < p.cols; c++) {
        const at = coverAt.get(key({ r, c }))
        const onActive =
          opts.active !== null &&
          (opts.active.kind === 'row' ? opts.active.index === r : opts.active.index === c)
        labels.push(at === undefined || solved.has(at) ? String(p.grid[r][c]) : SYMBOLS[at])

        if (opts.asked && at !== undefined && p.targets.includes(at)) cells.push('asked')
        else if (opts.justSolved && same(opts.justSolved, { r, c })) cells.push('solved')
        else if (onActive) cells.push('active')
        else if (at !== undefined && solved.has(at)) cells.push('solved')
        else if (at !== undefined) cells.push('covered')
        else cells.push('visible')
      }
    }
    return { cells, labels }
  }

  const steps: RowColBeat[] = []
  type Draft = Partial<RowColBeat> & {
    phase: RowColPhase
    caption: string
    cells: SquareState[]
    labels: string[]
    active: { kind: 'row' | 'col'; index: number } | null
  }
  const push = (draft: Draft) => {
    steps.push({ trapNumber: null, reveal: null, hold: 2400, ...draft })
  }

  // ── Beat 1 — the board, the covers and the rule. ───────────────────────────
  {
    const { cells, labels } = board({ active: null })
    push({
      phase: 'setup',
      cells,
      labels,
      active: null,
      caption: T(
        `${listEn(glyphs)} ${glyphs.length === 1 ? 'covers one square' : `cover ${glyphs.length} squares`}. A total printed beside a row or under a column tells you what that whole line adds up to — but it only gives a number away on a line with just ONE square still covered.`,
        `${listId(glyphs)} menutupi ${glyphs.length} kotak. Jumlah yang tercetak di samping baris atau di bawah kolom memberi tahu total garis itu — tapi baru membocorkan satu bilangan kalau garis itu tinggal punya SATU kotak tertutup.`,
      ),
      hold: 3000,
    })
  }

  // ── Beats 2.. — one per line that can be settled, in the order it can be. ──
  for (const w of walk) {
    const helpers = w.known.filter((k) => k.hiddenIndex !== null)
    const lineName_en = w.kind === 'row' ? `row ${w.index + 1}` : `column ${w.index + 1}`
    const lineName_id = w.kind === 'row' ? `baris ke-${w.index + 1}` : `kolom ke-${w.index + 1}`
    const noun_en = w.kind === 'row' ? 'row' : 'column'
    const noun_id = w.kind === 'row' ? 'baris' : 'kolom'
    const seen = w.known.map((k) => String(k.value))

    const lead_en =
      helpers.length === 0
        ? `${lineName_en.charAt(0).toUpperCase()}${lineName_en.slice(1)} has its total printed and only one covered square left: ${w.symbol}.`
        : `With ${listEn(helpers.map((k) => `${SYMBOLS[k.hiddenIndex as number]} = ${k.value}`))} filled in, ${lineName_en} is down to one covered square: ${w.symbol}.`
    const lead_id =
      helpers.length === 0
        ? `${lineName_id.charAt(0).toUpperCase()}${lineName_id.slice(1)} sudah punya jumlah tercetak dan tinggal satu kotak tertutup: ${w.symbol}.`
        : `Setelah ${listId(helpers.map((k) => `${SYMBOLS[k.hiddenIndex as number]} = ${k.value}`))} terisi, ${lineName_id} tinggal punya satu kotak tertutup: ${w.symbol}.`

    solved.add(w.hiddenIndex)
    const { cells, labels } = board({ active: { kind: w.kind, index: w.index }, justSolved: w.cell })
    push({
      phase: 'fill',
      cells,
      labels,
      active: { kind: w.kind, index: w.index },
      caption: T(
        `${lead_en} The rest of that ${noun_en} shows ${listEn(seen)}, and the whole ${noun_en} makes ${w.sum}, so ${w.symbol} = ${w.sum} − ${seen.join(' − ')} = ${w.value}.`,
        `${lead_id} Sisa ${noun_id} itu memperlihatkan ${listId(seen)}, sedangkan seluruh ${noun_id} berjumlah ${w.sum}, jadi ${w.symbol} = ${w.sum} − ${seen.join(' − ')} = ${w.value}.`,
      ),
      hold: 3000,
    })
  }

  // ── The order trap, drawn instead of told. ─────────────────────────────────
  if (trapNumber !== null) {
    const { cells, labels } = board({ active: null, asked: true })
    push({
      phase: 'trap',
      cells,
      labels,
      active: null,
      trapNumber,
      caption: T(
        `Careful: ${targetSymbols[0]} is ${targetValues[0]} and ${targetSymbols[1]} is ${targetValues[1]}, so writing them the other way round gives ${trapNumber}. The question asks for ${targetSymbols[0]}${targetSymbols[1]} — ${targetSymbols[0]} first — so ${targetValues[0]} takes the tens place.`,
        `Hati-hati: ${targetSymbols[0]} bernilai ${targetValues[0]} dan ${targetSymbols[1]} bernilai ${targetValues[1]}, jadi kalau ditulis terbalik hasilnya ${trapNumber}. Yang diminta adalah ${targetSymbols[0]}${targetSymbols[1]} — ${targetSymbols[0]} dulu — jadi ${targetValues[0]} yang menempati tempat puluhan.`,
      ),
      hold: 3200,
    })
  }

  // ── What the question actually wanted. ────────────────────────────────────
  {
    const { cells, labels } = board({ active: null, asked: true })
    const close_en =
      p.ask === 'one-cell'
        ? `So the square under ${targetSymbols[0]} holds ${answer}.`
        : p.ask === 'sum-of-two'
          ? `${targetSymbols[0]} is ${targetValues[0]} and ${targetSymbols[1]} is ${targetValues[1]}, so ${targetSymbols[0]} + ${targetSymbols[1]} = ${targetValues[0]} + ${targetValues[1]} = ${answer}.`
          : `${targetValues[0]} in the tens place and ${targetValues[1]} in the ones place make ${answer}.`
    const close_id =
      p.ask === 'one-cell'
        ? `Jadi kotak di bawah ${targetSymbols[0]} berisi ${answer}.`
        : p.ask === 'sum-of-two'
          ? `${targetSymbols[0]} bernilai ${targetValues[0]} dan ${targetSymbols[1]} bernilai ${targetValues[1]}, jadi ${targetSymbols[0]} + ${targetSymbols[1]} = ${targetValues[0]} + ${targetValues[1]} = ${answer}.`
          : `${targetValues[0]} di tempat puluhan dan ${targetValues[1]} di tempat satuan menjadi ${answer}.`
    push({
      phase: 'result',
      cells,
      labels,
      active: null,
      caption: T(close_en, close_id),
      reveal: answer,
      hold: 0,
    })
  }

  return {
    rows: p.rows,
    cols: p.cols,
    rowSums,
    colSums,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
