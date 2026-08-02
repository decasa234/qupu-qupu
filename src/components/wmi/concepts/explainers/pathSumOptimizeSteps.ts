import type { Lang } from './makeTenSteps'

// `path-sum-optimize`. A robot crosses a grid of numbers from the top-left
// square to the bottom-right one and adds up what it steps on; the child names
// the largest — or smallest — total any legal route can collect.
//
// The move this storyboard has to teach is the refusal to walk forwards. Trying
// routes is hopeless (there are dozens), and grabbing the better-looking
// neighbour is wrong (a beat is spent proving that on this very grid). So every
// filling beat writes ONE row of a backward table, starting at the bottom row
// where the robot has no choice left, and each square's number arrives as `its
// own value + the better of the two numbers already written below and to its
// right`. Nothing is ever announced.
//
// Mirrors api/services/wmi/concepts/path-sum-optimize. Params arrive as
// `unknown` from the DB, so the grid, the table, the winning route and the
// greedy route are all re-derived here.
export type PathSumMoves = 'right-or-down' | 'left-right-down'
export type PathSumAsk = 'max' | 'min'
export type PathSumPhase = 'setup' | 'lemma' | 'fill' | 'trap' | 'result'

export interface PathSumCell {
  r: number
  c: number
}

export interface PathSumParams {
  rows: number
  cols: number
  grid: number[][]
  moves: PathSumMoves
  ask: PathSumAsk
}

export interface PathSumBeat {
  phase: PathSumPhase
  caption: string
  /**
   * The backward-table number for each square, row-major (`r * cols + c`), or
   * null where this beat has not worked it out yet.
   */
  badges: (number | null)[]
  /** The row this beat is filling in, or null. */
  activeRow: number | null
  /** A route drawn over the grid, or null. Only the last two beats have one. */
  route: PathSumCell[] | null
  routeTone: 'good' | 'bad'
  /** The total the greedy walk collects (trap beat only). */
  trapTotal: string | null
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface PathSumStoryboard {
  rows: number
  cols: number
  /** The number printed in each square, row-major. */
  values: number[]
  finish: PathSumCell
  answer: string
  steps: PathSumBeat[]
  finalIndex: number
}

const FALLBACK: PathSumParams = {
  rows: 4,
  cols: 4,
  grid: [
    [6, 8, 3, 9],
    [7, 4, 3, 7],
    [9, 9, 7, 9],
    [8, 9, 2, 1],
  ],
  moves: 'right-or-down',
  ask: 'max',
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

function read(raw: unknown): PathSumParams {
  const p = (raw ?? {}) as Partial<PathSumParams>
  const rows = Math.max(2, Math.min(6, int(p.rows, 0)))
  const cols = Math.max(2, Math.min(6, int(p.cols, 0)))
  if (!Array.isArray(p.grid) || p.grid.length !== rows) return FALLBACK
  const grid = p.grid.map((row) => (Array.isArray(row) ? row.map((v) => int(v, 0)) : []))
  if (grid.some((row) => row.length !== cols)) return FALLBACK
  const moves: PathSumMoves = p.moves === 'left-right-down' ? 'left-right-down' : 'right-or-down'
  // A largest-total question with sideways steps has no small honest answer, so
  // it is never generated; if one somehow arrives, narrate the smallest instead
  // of arguing from a table that does not apply.
  const ask: PathSumAsk = p.ask === 'min' || moves === 'left-right-down' ? 'min' : 'max'
  return { rows, cols, grid, moves, ask }
}

const better = (ask: PathSumAsk, a: number, b: number): number =>
  ask === 'max' ? Math.max(a, b) : Math.min(a, b)

interface TableCell {
  value: number
  right: number | null
  down: number | null
  best: number
}

/** The backward table: best[r][c] = the best total from (r,c) to the finish. */
function buildTable(p: PathSumParams): TableCell[][] {
  const table: TableCell[][] = Array.from({ length: p.rows }, () => new Array<TableCell>(p.cols))
  for (let r = p.rows - 1; r >= 0; r--) {
    for (let c = p.cols - 1; c >= 0; c--) {
      const value = p.grid[r][c]
      const right = c + 1 < p.cols ? table[r][c + 1].best : null
      const down = r + 1 < p.rows ? table[r + 1][c].best : null
      const best =
        right === null && down === null
          ? value
          : right === null
            ? value + (down as number)
            : down === null
              ? value + right
              : value + better(p.ask, right, down)
      table[r][c] = { value, right, down, best }
    }
  }
  return table
}

/** The one route the table points at, or the first of several if it ever ties. */
function bestRoute(p: PathSumParams, table: TableCell[][]): PathSumCell[] {
  const route: PathSumCell[] = []
  let at: PathSumCell = { r: 0, c: 0 }
  for (let guard = 0; guard < p.rows + p.cols; guard++) {
    route.push(at)
    if (at.r === p.rows - 1 && at.c === p.cols - 1) break
    const cell = table[at.r][at.c]
    const target = cell.best - cell.value
    at = cell.right === target ? { r: at.r, c: at.c + 1 } : { r: at.r + 1, c: at.c }
  }
  return route
}

/** Always step onto the better-looking neighbour — the wrong method, walked. */
function greedyRoute(p: PathSumParams): PathSumCell[] {
  const route: PathSumCell[] = []
  let at: PathSumCell = { r: 0, c: 0 }
  for (let guard = 0; guard < p.rows + p.cols; guard++) {
    route.push(at)
    if (at.r === p.rows - 1 && at.c === p.cols - 1) break
    const right = at.c + 1 < p.cols ? p.grid[at.r][at.c + 1] : null
    const down = at.r + 1 < p.rows ? p.grid[at.r + 1][at.c] : null
    if (right === null) at = { r: at.r + 1, c: at.c }
    else if (down === null) at = { r: at.r, c: at.c + 1 }
    else at = right === better(p.ask, right, down) ? { r: at.r, c: at.c + 1 } : { r: at.r + 1, c: at.c }
  }
  return route
}

const totalOf = (p: PathSumParams, route: PathSumCell[]): number =>
  route.reduce((sum, x) => sum + p.grid[x.r][x.c], 0)

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

export function buildPathSumOptimizeSteps(raw: unknown, lang: Lang): PathSumStoryboard {
  const p = read(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const table = buildTable(p)
  const route = bestRoute(p, table)
  const greedy = greedyRoute(p)
  const answer = String(table[0][0].best)
  const greedyTotal = totalOf(p, greedy)

  const superlative = T(p.ask === 'max' ? 'largest' : 'smallest', p.ask === 'max' ? 'terbesar' : 'terkecil')
  const look = T(p.ask === 'max' ? 'biggest' : 'smallest', p.ask === 'max' ? 'paling besar' : 'paling kecil')

  // Badges appear a row at a time, bottom row first, and never disappear.
  const filled = new Set<string>()
  const badges = (): (number | null)[] => {
    const out: (number | null)[] = []
    for (let r = 0; r < p.rows; r++) {
      for (let c = 0; c < p.cols; c++) out.push(filled.has(`${r},${c}`) ? table[r][c].best : null)
    }
    return out
  }

  /** How one square of the table is worked out, in words. */
  const cellPhrase = (r: number, c: number): string => {
    const cell = table[r][c]
    const where = T(`column ${c + 1}`, `kolom ke-${c + 1}`)
    if (cell.right === null && cell.down === null) {
      return T(`${where}: the finish square itself, ${cell.best}`, `${where}: kotak akhir sendiri, ${cell.best}`)
    }
    if (cell.right === null || cell.down === null) {
      const reach = (cell.right ?? cell.down) as number
      return `${where}: ${cell.value} + ${reach} = ${cell.best}`
    }
    const pick = better(p.ask, cell.right, cell.down)
    const other = pick === cell.right ? cell.down : cell.right
    return T(
      `${where}: take ${pick} (${p.ask === 'max' ? 'bigger' : 'smaller'} than ${other}), ${cell.value} + ${pick} = ${cell.best}`,
      `${where}: pilih ${pick} (${p.ask === 'max' ? 'lebih besar' : 'lebih kecil'} dari ${other}), ${cell.value} + ${pick} = ${cell.best}`,
    )
  }

  const steps: PathSumBeat[] = []
  const push = (draft: Partial<PathSumBeat> & { phase: PathSumPhase; caption: string }) => {
    steps.push({
      badges: badges(),
      activeRow: null,
      route: null,
      routeTone: 'good',
      trapTotal: null,
      reveal: null,
      hold: 2600,
      ...draft,
    })
  }

  // ── Beat 1 — the board, the two corners and why routes cannot be tried. ────
  push({
    phase: 'setup',
    caption: T(
      `The robot starts on the green square and must finish on the flagged one, adding up every number it steps on. There are far too many routes to try, so do not walk forwards at all: ask each square what the ${superlative} total from it to the finish is.`,
      `Robot mulai dari kotak hijau dan harus berhenti di kotak berbendera, menjumlahkan setiap bilangan yang diinjaknya. Jalurnya terlalu banyak untuk dicoba satu per satu, jadi jangan berjalan maju: tanyakan pada setiap kotak berapa jumlah ${superlative} dari kotak itu sampai akhir.`,
    ),
    hold: 3200,
  })

  // ── Beat 2 — sideways steps are a red herring for a smallest total. ───────
  if (p.moves === 'left-right-down') {
    push({
      phase: 'lemma',
      caption: T(
        `Stepping left is allowed, but it walks the robot away from the finish and adds squares it must pay for. Every square holds at least 1, so extra squares only push the total up — and we want the smallest. Right and down are all we need.`,
        `Melangkah ke kiri memang boleh, tapi itu menjauhkan robot dari kotak akhir dan menambah kotak yang harus dibayar. Setiap kotak berisi paling sedikit 1, jadi kotak tambahan hanya menambah jumlah — padahal kita mencari yang paling kecil. Cukup ke kanan dan ke bawah.`,
      ),
      hold: 3200,
    })
  }

  // ── Beats 3.. — the table, one row at a time, from the bottom up. ─────────
  for (let r = p.rows - 1; r >= 0; r--) {
    for (let c = 0; c < p.cols; c++) filled.add(`${r},${c}`)
    const line: string[] = []
    for (let c = p.cols - 1; c >= 0; c--) line.push(cellPhrase(r, c))
    const lead =
      r === p.rows - 1
        ? T(
            `The bottom row answers itself: from any square there the robot can only keep going right. From the right:`,
            `Baris paling bawah menjawab sendiri: dari kotak mana pun di situ robot hanya bisa terus ke kanan. Dari kanan:`,
          )
        : T(
            `Row ${r + 1}, again from the right. Each square adds its own number to the ${superlative} of the two totals already written to its right and below it:`,
            `Baris ke-${r + 1}, juga dari kanan. Setiap kotak menambahkan bilangannya sendiri ke jumlah ${superlative} dari dua angka yang sudah tertulis di kanan dan di bawahnya:`,
          )
    push({
      phase: 'fill',
      activeRow: r,
      caption: `${lead} ${line.join('; ')}.`,
      hold: 3400,
    })
  }

  // ── The greedy trap, drawn instead of told. ───────────────────────────────
  if (greedyTotal !== table[0][0].best) {
    push({
      phase: 'trap',
      route: greedy,
      routeTone: 'bad',
      trapTotal: String(greedyTotal),
      caption: T(
        `Careful: always stepping onto the ${look}-looking next square draws this route, and it ${p.ask === 'max' ? `only reaches ${greedyTotal}` : `runs up to ${greedyTotal}`} — worse than the table's ${answer}. A square that looks good can hand the robot a poor rest of the way.`,
        `Hati-hati: kalau selalu melangkah ke kotak berikutnya yang kelihatan ${look}, jalurnya jadi seperti ini, dan hasilnya ${greedyTotal} — ${p.ask === 'max' ? 'kalah dari' : 'lebih boros daripada'} ${answer} yang ditunjukkan tabel. Kotak yang kelihatan bagus bisa memberi sisa jalan yang buruk.`,
      ),
      hold: 3400,
    })
  }

  // ── What the question actually wanted. ────────────────────────────────────
  const dirs = route.slice(1).map((cell, i) => {
    const previous = route[i]
    if (cell.r > previous.r) return T('down', 'bawah')
    if (cell.c > previous.c) return T('right', 'kanan')
    return T('left', 'kiri')
  })
  push({
    phase: 'result',
    route,
    routeTone: 'good',
    caption: T(
      `The start square says ${answer}, and every square along the way already took the ${superlative} continuation there was, so nothing can beat it: ${listEn(dirs)}.`,
      `Kotak awal bertuliskan ${answer}, dan setiap kotak di sepanjang jalan sudah mengambil lanjutan ${superlative} yang ada, jadi tidak ada yang bisa mengalahkannya: ${listId(dirs)}.`,
    ),
    reveal: answer,
    hold: 0,
  })

  const values: number[] = []
  for (let r = 0; r < p.rows; r++) for (let c = 0; c < p.cols; c++) values.push(p.grid[r][c])

  return {
    rows: p.rows,
    cols: p.cols,
    values,
    finish: { r: p.rows - 1, c: p.cols - 1 },
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
