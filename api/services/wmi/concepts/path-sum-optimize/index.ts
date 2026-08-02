import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildPathSumOptimizeBreakdown } from './breakdown.js'

// A robot walks a grid of numbers from the top-left square to the bottom-right
// one under a movement rule, adding up every number it steps on. The child has
// to name the largest — or the smallest — total any legal route can collect.
//
// The single fact this concept lives or dies on: you cannot find the answer by
// walking forwards. A step that looks generous now can lock the robot into a
// mean tail, so "always take the bigger neighbour" is a genuinely tempting and
// genuinely wrong method (that is exactly the `trap` this concept ships). What
// DOES force the answer is asking a smaller question about every square —
// "standing here, what is the best total still reachable?" — and answering it
// backwards from the finish, where the robot has no choice left at all.
//
// Two movement rules are offered, both taken from the real papers:
//   • `right-or-down`      — the classic; a square only ever hands on to the
//                            square to its right and the square below it, so
//                            the backward table is well defined cell by cell.
//   • `left-right-down`    — the WMI 2024-semifinal #25 wording ("the robot may
//                            only go left, right or down"). Sideways steps make
//                            cycles imaginable, so a route may never reuse a
//                            square; it is offered ONLY with `ask: 'min'`,
//                            where the leftward option is provably a red
//                            herring: every square holds at least 1, so an extra
//                            square can only push the total up. `generate` and
//                            `paramsSchema` both re-check that claim against a
//                            full enumeration of the legal routes, so the hint
//                            never argues from a lemma that failed here.
//
// The optimum must also be reached by exactly ONE route, so the figure and the
// animation can show "the" winning way round without lying. `paramsSchema`
// enforces both promises; `index.test.ts` re-derives them from an independent
// exhaustive walk of every legal route.
export const MOVE_SETS = ['right-or-down', 'left-right-down'] as const
export type MoveSet = (typeof MOVE_SETS)[number]

export const ASKS = ['max', 'min'] as const
export type Ask = (typeof ASKS)[number]

export interface Cell {
  r: number
  c: number
}

const cellKey = (cell: Cell): string => `${cell.r},${cell.c}`
const sameCell = (a: Cell, b: Cell): boolean => a.r === b.r && a.c === b.c

const paramsSchema = z
  .object({
    rows: z.number().int().min(4).max(5),
    cols: z.number().int().min(4).max(5),
    /** The number printed in every square, row-major. */
    grid: z.array(z.array(z.number().int().min(1).max(9))),
    moves: z.enum(MOVE_SETS),
    ask: z.enum(ASKS),
  })
  .refine((v) => v.grid.length === v.rows && v.grid.every((row) => row.length === v.cols), {
    message: 'grid must be exactly rows x cols',
  })
  // Sideways steps only ever ADD squares, which is why they are harmless for a
  // smallest-total question and ruinous for a largest-total one (the answer
  // would become "snake through as much of the grid as you can reach").
  .refine((v) => v.moves === 'right-or-down' || v.ask === 'min', {
    message: 'left-right-down is only offered with ask: min',
  })
  // THE load-bearing rules. Everything above is shape; these two are the
  // promises the hints, the figure and the animation are all built on: the
  // backward table really is the optimum over every legal route, and exactly
  // one route reaches it.
  .refine((v) => !structurallySound(v) || solve(v).uniqueBest, {
    message: 'the best total must be reached by exactly one right-or-down route',
  })
  .refine((v) => !structurallySound(v) || agreesWithEveryRoute(v), {
    message: 'the backward table must match an exhaustive walk of every legal route',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'path-sum-optimize',
  name_en: 'Path with the largest or smallest total',
  name_id: 'Jalur dengan jumlah terbesar',
  grades: [1, 2, 3] as const,
  description_id:
    'Menyusuri kisi bilangan dari kotak kiri atas ke kotak kanan bawah dengan aturan langkah tertentu, lalu memilih jalur yang jumlahnya paling besar atau paling kecil.',
} as const

// ── The route space ──────────────────────────────────────────────────────────

/**
 * The minimum shape the solver needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `solve()`: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself. Same
 * trick `row-column-sum-grid` uses for its `SolvableGrid`.
 */
export interface SolvableGrid {
  rows: number
  cols: number
  grid: number[][]
  moves: MoveSet
  ask: Ask
}

/** Enough of a params object to be worth running the solver on at all. */
function structurallySound(v: SolvableGrid): boolean {
  if (!Number.isInteger(v.rows) || !Number.isInteger(v.cols)) return false
  if (v.rows < 2 || v.cols < 2) return false
  if (v.grid.length !== v.rows) return false
  if (v.grid.some((row) => row.length !== v.cols)) return false
  if (v.grid.some((row) => row.some((x) => !Number.isInteger(x) || x < 1))) return false
  return v.moves === 'right-or-down' || v.ask === 'min'
}

/** Where the robot may step from `at`, before checking what it has already used. */
export function stepsFrom(p: SolvableGrid, at: Cell): Cell[] {
  const out: Cell[] = [
    { r: at.r, c: at.c + 1 },
    { r: at.r + 1, c: at.c },
  ]
  if (p.moves === 'left-right-down') out.push({ r: at.r, c: at.c - 1 })
  return out.filter((x) => x.r >= 0 && x.r < p.rows && x.c >= 0 && x.c < p.cols)
}

/**
 * Every legal route from the top-left square to the bottom-right one, listed in
 * full. A route STOPS the moment it arrives at the finish (a walk that carried
 * on would no longer end there, and could never come back without reusing a
 * square). No square may be used twice — without that rule a `left-right-down`
 * walk could shuffle sideways forever and "the largest total" would not exist.
 */
export function enumerateRoutes(p: SolvableGrid): Cell[][] {
  const finish: Cell = { r: p.rows - 1, c: p.cols - 1 }
  const out: Cell[][] = []
  const path: Cell[] = []
  const used = new Set<string>()

  const walk = (at: Cell): void => {
    path.push(at)
    used.add(cellKey(at))
    if (sameCell(at, finish)) {
      out.push([...path])
    } else {
      for (const next of stepsFrom(p, at)) {
        if (used.has(cellKey(next))) continue
        walk(next)
      }
    }
    path.pop()
    used.delete(cellKey(at))
  }

  walk({ r: 0, c: 0 })
  return out
}

export function routeTotal(p: SolvableGrid, route: Cell[]): number {
  return route.reduce((sum, x) => sum + p.grid[x.r][x.c], 0)
}

const better = (ask: Ask, a: number, b: number): number => (ask === 'max' ? Math.max(a, b) : Math.min(a, b))

// ── The backward table ───────────────────────────────────────────────────────

/** One square of the backward table, plus the two totals it had to choose from. */
export interface TableCell {
  r: number
  c: number
  /** The number printed in the square. */
  value: number
  /** Best total from the square to its right, or null when there is none. */
  right: number | null
  /** Best total from the square below, or null when there is none. */
  down: number | null
  /** `value` plus whichever of `right` / `down` the question prefers. */
  best: number
}

export interface Solution {
  /** `table[r][c].best` = the best total from (r,c) to the finish, (r,c) counted. */
  table: TableCell[][]
  /** The best total from the start square — the answer. */
  best: number
  /** How many right-or-down routes reach `best`. The concept insists on 1. */
  bestRouteCount: number
  uniqueBest: boolean
  /** The one winning route, start to finish. Empty when the optimum is shared. */
  route: Cell[]
  /**
   * The route a child gets by always stepping onto the better-LOOKING next
   * square, and its total. `ambiguous` when that walk ever met two equal
   * neighbours and so is not a single well-defined wrong answer.
   */
  greedy: { route: Cell[]; total: number; ambiguous: boolean }
  answer: string
}

export function solve(p: SolvableGrid): Solution {
  const finish: Cell = { r: p.rows - 1, c: p.cols - 1 }

  // best[r][c] — the best total from (r,c) onwards; ways[r][c] — how many
  // right-or-down routes from (r,c) achieve it. Filled from the finish
  // backwards, because that is the only square whose answer needs no choice.
  const best: number[][] = Array.from({ length: p.rows }, () => new Array<number>(p.cols).fill(0))
  const ways: number[][] = Array.from({ length: p.rows }, () => new Array<number>(p.cols).fill(0))
  const table: TableCell[][] = Array.from({ length: p.rows }, () => new Array<TableCell>(p.cols))

  for (let r = p.rows - 1; r >= 0; r--) {
    for (let c = p.cols - 1; c >= 0; c--) {
      const value = p.grid[r][c]
      const right = c + 1 < p.cols ? best[r][c + 1] : null
      const down = r + 1 < p.rows ? best[r + 1][c] : null
      if (right === null && down === null) {
        best[r][c] = value
        ways[r][c] = 1
      } else if (right === null) {
        best[r][c] = value + (down as number)
        ways[r][c] = ways[r + 1][c]
      } else if (down === null) {
        best[r][c] = value + right
        ways[r][c] = ways[r][c + 1]
      } else {
        const pick = better(p.ask, right, down)
        best[r][c] = value + pick
        ways[r][c] =
          (right === pick ? ways[r][c + 1] : 0) + (down === pick ? ways[r + 1][c] : 0)
      }
      table[r][c] = { r, c, value, right, down, best: best[r][c] }
    }
  }

  const bestRouteCount = ways[0][0]
  const uniqueBest = bestRouteCount === 1

  // Walk the table forwards ONCE the optimum is known to be unique: at every
  // square exactly one of the two continuations carries it, so there is nothing
  // to choose and nothing to guess.
  const route: Cell[] = []
  if (uniqueBest) {
    let at: Cell = { r: 0, c: 0 }
    for (;;) {
      route.push(at)
      if (sameCell(at, finish)) break
      const cell = table[at.r][at.c]
      const target = cell.best - cell.value
      const goRight = cell.right === target
      const goDown = cell.down === target
      if (goRight && goDown) {
        throw new Error(
          `path-sum-optimize: (${at.r},${at.c}) has two equally good continuations, so the optimum is not unique`,
        )
      }
      if (!goRight && !goDown) {
        throw new Error(`path-sum-optimize: (${at.r},${at.c}) has no continuation reaching ${cell.best}`)
      }
      at = goRight ? { r: at.r, c: at.c + 1 } : { r: at.r + 1, c: at.c }
    }
  }

  // The wrong method, walked out in full so the trap can be stated as a number
  // rather than as a warning.
  const greedyRoute: Cell[] = []
  let ambiguous = false
  {
    let at: Cell = { r: 0, c: 0 }
    for (;;) {
      greedyRoute.push(at)
      if (sameCell(at, finish)) break
      const right = at.c + 1 < p.cols ? p.grid[at.r][at.c + 1] : null
      const down = at.r + 1 < p.rows ? p.grid[at.r + 1][at.c] : null
      if (right === null) at = { r: at.r + 1, c: at.c }
      else if (down === null) at = { r: at.r, c: at.c + 1 }
      else {
        if (right === down) ambiguous = true
        const pick = better(p.ask, right, down)
        at = right === pick ? { r: at.r, c: at.c + 1 } : { r: at.r + 1, c: at.c }
      }
    }
  }

  return {
    table,
    best: best[0][0],
    bestRouteCount,
    uniqueBest,
    route,
    greedy: { route: greedyRoute, total: routeTotal(p, greedyRoute), ambiguous },
    answer: String(best[0][0]),
  }
}

/**
 * The honesty check the whole concept rests on: walk EVERY legal route and
 * confirm the backward table found the same optimum, reached by exactly one of
 * them. For `left-right-down` this is also what verifies the hint's opening
 * claim — that a smallest-total route never steps sideways — for this very
 * grid, rather than trusting it in general.
 */
export function agreesWithEveryRoute(p: SolvableGrid): boolean {
  const s = solve(p)
  const routes = enumerateRoutes(p)
  if (routes.length === 0) return false
  const totals = routes.map((route) => routeTotal(p, route))
  const optimum = totals.reduce((acc, t) => better(p.ask, acc, t))
  if (optimum !== s.best) return false
  return totals.filter((t) => t === optimum).length === 1
}

/**
 * The first square where "take the better-looking neighbour" and the real best
 * route part company — the whole story of the trap in one place. `null` when
 * greedy happens to be right, or when it was never well defined.
 */
export interface Divergence {
  at: Cell
  greedyDir: 'right' | 'down'
  bestDir: 'right' | 'down'
  greedyValue: number
  bestValue: number
  greedyRest: number
  bestRest: number
}

export function divergence(p: SolvableGrid, s: Solution): Divergence | null {
  if (s.greedy.ambiguous || !s.uniqueBest) return null
  if (s.greedy.total === s.best) return null
  for (let i = 0; i + 1 < Math.min(s.route.length, s.greedy.route.length); i++) {
    const at = s.route[i]
    if (!sameCell(at, s.greedy.route[i])) break
    const good = s.route[i + 1]
    const bad = s.greedy.route[i + 1]
    if (sameCell(good, bad)) continue
    const dirOf = (next: Cell): 'right' | 'down' => (next.r === at.r ? 'right' : 'down')
    return {
      at,
      greedyDir: dirOf(bad),
      bestDir: dirOf(good),
      greedyValue: p.grid[bad.r][bad.c],
      bestValue: p.grid[good.r][good.c],
      greedyRest: s.table[bad.r][bad.c].best,
      bestRest: s.table[good.r][good.c].best,
    }
  }
  return null
}

// ── Generation ───────────────────────────────────────────────────────────────

const SHAPES = [
  { rows: 4, cols: 4 },
  { rows: 4, cols: 5 },
  { rows: 5, cols: 4 },
  { rows: 5, cols: 5 },
] as const

function draft(rng: Rng): Params {
  const { rows, cols } = rng.pick(SHAPES)
  const moves: MoveSet = rng.pick(MOVE_SETS)
  // A largest-total question with sideways steps has no honest short answer —
  // the robot would simply snake through as much of the grid as it can reach.
  const ask: Ask = moves === 'left-right-down' ? 'min' : rng.pick(ASKS)
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rng.int(1, 9)))
  return { rows, cols, grid, moves, ask }
}

/**
 * Quality filter, not a correctness rule — `paramsSchema` already refuses grids
 * whose optimum is shared or whose table disagrees with the routes. This picks
 * the grids that are worth a child's time.
 */
function isWorthAsking(s: Solution): boolean {
  // A grid where "always take the better-looking square" happens to be right
  // teaches the wrong lesson: the child would leave believing the greedy walk
  // works. Insist that it visibly fails here, which is also what makes the trap
  // a real number instead of a warning.
  if (s.greedy.ambiguous || s.greedy.total === s.best) return false
  // A winning route that hugs one edge (all the way across, then all the way
  // down) looks like it needed no thinking at all.
  const turns = s.route
    .slice(1)
    .map((cell, i) => (cell.r === s.route[i].r ? 'right' : 'down'))
    .filter((dir, i, all) => i > 0 && dir !== all[i - 1]).length
  return turns >= 2
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    const s = solve(candidate)
    // Cheap table checks first; the exhaustive walk of every route is the
    // expensive one, so it only runs on candidates already worth keeping.
    if (!s.uniqueBest) continue
    const worth = isWorthAsking(s)
    if (!worth && first !== null) continue
    if (!agreesWithEveryRoute(candidate)) continue
    if (worth) return candidate
    first = candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). Fall back to a checked grid whose
  // largest total (48) is reached by exactly one route, and whose greedy walk
  // lands on 39 instead — so even the fallback still teaches the point.
  return {
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
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** "3", "3 and 5", "3, 5 and 7". */
export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** "3", "3 dan 5", "3, 5, dan 7". */
export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/** The movement rule, worded exactly as the stem words it. */
export function moveClause(moves: MoveSet, lang: 'en' | 'id'): string {
  if (moves === 'left-right-down') {
    return lang === 'id'
      ? 'robot hanya boleh melangkah ke kiri, ke kanan, atau ke bawah'
      : 'it may only step left, right or down'
  }
  return lang === 'id'
    ? 'robot hanya boleh melangkah ke kanan atau ke bawah'
    : 'it may only step right or down'
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, lang: 'en' | 'id'): string {
  if (ask === 'max') {
    return lang === 'id'
      ? 'Berapa jumlah terbesar yang bisa dikumpulkan robot?'
      : 'What is the largest total the robot can collect?'
  }
  return lang === 'id'
    ? 'Berapa jumlah terkecil yang bisa dikumpulkan robot?'
    : 'What is the smallest total the robot can collect?'
}

/** "right, down, right…" — the winning route written as a list of steps. */
export function routeDirections(route: Cell[], lang: 'en' | 'id'): string[] {
  return route.slice(1).map((cell, i) => {
    const previous = route[i]
    if (cell.r > previous.r) return lang === 'id' ? 'bawah' : 'down'
    if (cell.c > previous.c) return lang === 'id' ? 'kanan' : 'right'
    return lang === 'id' ? 'kiri' : 'left'
  })
}

/** How one square of the backward table is worked out, in words. */
function cellPhrase(cell: TableCell, ask: Ask, lang: 'en' | 'id'): string {
  const where = lang === 'id' ? `kolom ke-${cell.c + 1}` : `column ${cell.c + 1}`
  if (cell.right === null && cell.down === null) {
    return lang === 'id' ? `${where}: kotak akhir sendiri, ${cell.best}` : `${where}: the finish square itself, ${cell.best}`
  }
  if (cell.right === null || cell.down === null) {
    // Only one way on, so there is nothing to choose — the edge squares are
    // exactly why the table can be started at all.
    const reach = (cell.right ?? cell.down) as number
    return `${where}: ${cell.value} + ${reach} = ${cell.best}`
  }
  const pick = better(ask, cell.right, cell.down)
  const other = pick === cell.right ? cell.down : cell.right
  if (lang === 'id') {
    const word = ask === 'max' ? 'lebih besar' : 'lebih kecil'
    return `${where}: pilih ${pick} (${word} dari ${other}), ${cell.value} + ${pick} = ${cell.best}`
  }
  const word = ask === 'max' ? 'bigger' : 'smaller'
  return `${where}: take ${pick} (${word} than ${other}), ${cell.value} + ${pick} = ${cell.best}`
}

export function render(params: Params): Rendered {
  const { rows, cols, moves, ask } = params
  const s = solve(params)
  const breakdown = buildPathSumOptimizeBreakdown(params)
  const superlative_en = ask === 'max' ? 'largest' : 'smallest'
  const superlative_id = ask === 'max' ? 'terbesar' : 'terkecil'

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = [
    `In the ${rows}-by-${cols} grid, every square holds a number from 1 to 9.`,
    `A robot starts on the top-left square and must finish on the bottom-right square.`,
    `From a square ${moveClause(moves, 'en')}, and it may never step on the same square twice.`,
    `The robot adds up every number it steps on, counting the start square and the finish square.`,
    `Find: ${askClause(ask, 'en')}`,
  ].join(' ')
  const body_id = [
    `Pada kisi ${rows} kali ${cols}, setiap kotak berisi satu bilangan dari 1 sampai 9.`,
    `Sebuah robot mulai dari kotak kiri atas dan harus berhenti di kotak kanan bawah.`,
    `Dari sebuah kotak, ${moveClause(moves, 'id')}, dan robot tidak boleh menginjak kotak yang sama dua kali.`,
    `Robot menjumlahkan semua bilangan yang diinjaknya, termasuk kotak awal dan kotak akhir.`,
    `Cari: ${askClause(ask, 'id')}`,
  ].join(' ')

  // ── hint_steps: the backward table, built one row at a time from the bottom.
  // Nothing is announced. Each square's number is `its own value + the better of
  // the two totals already written below it and to its right`, and the two rows
  // that have no choice at all (the bottom one) are done first, so every later
  // line only ever leans on numbers the child has already seen written down.
  const steps_en: string[] = []
  const steps_id: string[] = []

  if (moves === 'left-right-down') {
    steps_en.push(
      `Stepping left is allowed, but it never helps: it walks the robot away from the finish, and the columns it gives up have to be crossed again on a lower row. Every square holds at least 1, so those extra squares can only push the total up — and we want the smallest. So only right and down are worth thinking about.`,
    )
    steps_id.push(
      `Melangkah ke kiri memang boleh, tapi tidak pernah menolong: robot jadi menjauh dari kotak akhir, dan kolom yang ditinggalkan tetap harus dilewati lagi di baris yang lebih bawah. Setiap kotak berisi paling sedikit 1, jadi kotak-kotak tambahan itu hanya menambah jumlah — padahal kita mencari yang paling kecil. Jadi cukup pikirkan langkah ke kanan dan ke bawah.`,
    )
  }

  const bottom = s.table[rows - 1].map((cell) => cellPhrase(cell, ask, 'en')).reverse()
  const bottom_id = s.table[rows - 1].map((cell) => cellPhrase(cell, ask, 'id')).reverse()
  steps_en.push(
    `Do not try routes one at a time. Ask a smaller question about every square instead: standing there, what is the ${superlative_en} total still reachable, that square included? The bottom row answers itself, because there the robot has no choice left — it can only keep going right. From the right: ${bottom.join('; ')}.`,
  )
  steps_id.push(
    `Jangan mencoba jalur satu per satu. Tanyakan hal yang lebih kecil pada setiap kotak: kalau robot berdiri di situ, berapa jumlah ${superlative_id} yang masih bisa dikumpulkan sampai akhir, kotak itu ikut dihitung? Baris paling bawah menjawab sendiri, karena di situ robot tidak punya pilihan lagi — hanya bisa terus ke kanan. Dari kanan: ${bottom_id.join('; ')}.`,
  )

  for (let r = rows - 2; r >= 0; r--) {
    const line = s.table[r].map((cell) => cellPhrase(cell, ask, 'en')).reverse()
    const line_id = s.table[r].map((cell) => cellPhrase(cell, ask, 'id')).reverse()
    steps_en.push(
      `Row ${r + 1}, again from the right. Each square adds its own number to the ${superlative_en} of the two totals already written to its right and below it: ${line.join('; ')}.`,
    )
    steps_id.push(
      `Baris ke-${r + 1}, juga dari kanan. Setiap kotak menambahkan bilangannya sendiri ke jumlah ${superlative_id} dari dua angka yang sudah tertulis di kanan dan di bawahnya: ${line_id.join('; ')}.`,
    )
  }

  const dirs_en = routeDirections(s.route, 'en')
  const dirs_id = routeDirections(s.route, 'id')
  steps_en.push(
    `The start square now says ${s.best}, and every square along the way already picked the ${superlative_en} continuation there was, so no route can beat it. Following those picks gives ${listEn(dirs_en)}. The answer is ${s.answer}.`,
  )
  steps_id.push(
    `Kotak awal sekarang bertuliskan ${s.best}, dan setiap kotak di sepanjang jalan sudah memilih lanjutan ${superlative_id} yang ada, jadi tidak ada jalur yang bisa mengalahkannya. Mengikuti pilihan-pilihan itu berarti ${listId(dirs_id)}. Jawabannya ${s.answer}.`,
  )

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en: `Do not walk forwards. Write on every square the ${superlative_en} total reachable from it, starting at the finish, where the robot has no choice left.`,
    hint_id: `Jangan berjalan maju. Tulis di setiap kotak jumlah ${superlative_id} yang bisa dicapai dari kotak itu, mulai dari kotak akhir, tempat robot sudah tidak punya pilihan.`,
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
