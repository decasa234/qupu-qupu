import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildLatinSquareCageBreakdown } from './breakdown.js'

// An n-by-n grid the child fills with 1..n so that no number repeats in a row
// or a column, plus one extra clue system: either bold frames carrying a little
// arithmetic clue ("5+" = the numbers inside add to 5), or the plain thick-box
// sudoku rule with a few squares printed in already. A couple of squares carry
// letters, and the answer is read off those.
//
// The single fact this concept lives or dies on: a Latin-square puzzle is only
// a puzzle if it has EXACTLY ONE completion. Two completions and the child is
// guessing, and both guesses are defensible. So the generator may never emit a
// grid that merely *has* a nice answer; `solve` below replays a small, fully
// narratable deduction system step by step, and only a grid whose every square
// that rule set can pin gets through. `paramsSchema` refuses the rest, `generate`
// additionally counts completions by exhaustive search, and `index.test.ts`
// re-counts with an independent brute force of its own.
//
// The four deduction rules are deliberately the only ones a 2nd/3rd grader can
// state out loud, which is what makes `hint_steps` honest: every step names the
// square it pins AND the printed clue that pins it.
export const ASKS = ['single-letter', 'letters-sum', 'letters-number'] as const
export type Ask = (typeof ASKS)[number]

export const CLUE_SYSTEMS = ['cage-op', 'thick-box'] as const
export type ClueSystem = (typeof CLUE_SYSTEMS)[number]

/** Frame operations. `x` is the times clue; stored ASCII, displayed as `×`. */
export const OPS = ['+', '-', 'x'] as const
export type Op = (typeof OPS)[number]

/** The letters printed in the marked squares, in reading order. */
export const LETTERS = ['A', 'B', 'C'] as const

export interface Cell {
  r: number
  c: number
}

/** One bold frame: a straight run of 2 or 3 squares plus its arithmetic clue. */
export interface Cage {
  cells: Cell[]
  op: Op
  target: number
}

const cellKey = (cell: Cell): string => `${cell.r},${cell.c}`
const sameCell = (a: Cell, b: Cell): boolean => a.r === b.r && a.c === b.c
const readingOrder = (a: Cell, b: Cell): number => a.r - b.r || a.c - b.c

/** Thick-box sudoku only exists where n is a perfect square; here that is 4. */
export const BOX_SIZE = 2

const cellSchema = z.object({
  r: z.number().int().min(0).max(4),
  c: z.number().int().min(0).max(4),
})

const cageSchema = z.object({
  cells: z.array(cellSchema).min(2).max(3),
  op: z.enum(OPS),
  target: z.number().int().min(1).max(60),
})

const paramsSchema = z
  .object({
    n: z.number().int().min(4).max(5),
    clueSystem: z.enum(CLUE_SYSTEMS),
    /** The TRUE completed square, row-major. Never shown except at the givens. */
    solution: z.array(z.array(z.number().int().min(1).max(5))),
    /** Bold frames. Empty for `thick-box`; a partition of the grid for `cage-op`. */
    cages: z.array(cageSchema),
    /** Squares the paper prints filled in, in reading order. */
    givens: z.array(cellSchema),
    /** The lettered squares, in reading order. `LETTERS[i]` names `letters[i]`. */
    letters: z.array(cellSchema).min(1).max(3),
    ask: z.enum(ASKS),
  })
  .refine((v) => v.solution.length === v.n && v.solution.every((row) => row.length === v.n), {
    message: 'solution must be exactly n by n',
  })
  .refine((v) => !sizedRight(v) || isLatin(v.solution, v.n), {
    message: 'every row and every column must hold 1..n exactly once',
  })
  .refine((v) => v.clueSystem !== 'thick-box' || v.n === 4, {
    message: 'thick-box sudoku only exists at n = 4',
  })
  .refine((v) => !sizedRight(v) || v.clueSystem !== 'thick-box' || boxesAreLatin(v.solution), {
    message: 'each bold box must hold 1..n exactly once',
  })
  .refine((v) => (v.clueSystem === 'thick-box' ? v.cages.length === 0 : v.cages.length > 0), {
    message: 'cage-op needs frames; thick-box must not have any',
  })
  .refine((v) => !sizedRight(v) || cagesTileTheGrid(v.cages, v.n) || v.clueSystem === 'thick-box', {
    message: 'the frames must cover every square exactly once',
  })
  .refine((v) => v.cages.every(isStraightRun), {
    message: 'a frame must be a straight run of neighbouring squares',
  })
  .refine((v) => v.cages.every((cage) => cage.op !== '-' || cage.cells.length === 2), {
    message: 'a minus frame compares exactly two squares',
  })
  .refine((v) => !sizedRight(v) || v.cages.every((cage) => cageHolds(cage, v.solution)), {
    message: 'every frame clue must be true of the solution',
  })
  .refine(
    (v) =>
      v.givens.every((g) => g.r < v.n && g.c < v.n) &&
      new Set(v.givens.map(cellKey)).size === v.givens.length &&
      v.givens.length < v.n * v.n,
    { message: 'givens must be distinct, inside the grid, and leave something to do' },
  )
  .refine(
    (v) =>
      v.letters.every((l) => l.r < v.n && l.c < v.n) &&
      new Set(v.letters.map(cellKey)).size === v.letters.length,
    { message: 'lettered squares must be distinct and inside the grid' },
  )
  .refine((v) => v.letters.every((l) => !v.givens.some((g) => sameCell(g, l))), {
    message: 'a lettered square cannot also be printed in already',
  })
  .refine((v) => (v.ask === 'single-letter' ? v.letters.length === 1 : v.letters.length >= 2), {
    message: 'single-letter asks for one square; the other asks combine two or three',
  })
  // THE load-bearing rule. Everything above is shape; this is the promise that
  // the puzzle has exactly one completion and that a child can reach it by
  // reasoning rather than by trying numbers.
  .refine((v) => !sizedRight(v) || solve(v).forced, {
    message: 'every empty square must be forced by the printed clues',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'latin-square-cage',
  name_en: 'Latin square with arithmetic cages',
  name_id: 'Teka-teki angka 1 sampai n',
  grades: [2, 3] as const,
  description_id:
    'Mengisi kisi n kali n dengan bilangan 1 sampai n agar tiap baris dan tiap kolom memuat semuanya tepat sekali, memakai petunjuk bingkai tebal, lalu membaca jawaban dari kotak-kotak berhuruf.',
} as const

// ── Shape helpers (used by the schema, so they may not touch `Params`) ───────

/**
 * The minimum shape `solve` needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `solve()`: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself. Same
 * trick `row-column-sum-grid` uses for its `SolvableGrid`.
 */
export interface SolvableSquare {
  n: number
  clueSystem: ClueSystem
  solution: number[][]
  cages: Cage[]
  givens: Cell[]
  letters: Cell[]
  ask: Ask
}

function sizedRight(v: SolvableSquare): boolean {
  return (
    v.solution.length === v.n &&
    v.solution.every((row) => row.length === v.n) &&
    v.cages.every((cage) => cage.cells.every((x) => x.r < v.n && x.c < v.n)) &&
    v.givens.every((g) => g.r < v.n && g.c < v.n) &&
    v.letters.length > 0 &&
    v.letters.every((l) => l.r < v.n && l.c < v.n)
  )
}

function isLatin(grid: number[][], n: number): boolean {
  const full = Array.from({ length: n }, (_, i) => i + 1).join()
  for (let r = 0; r < n; r++) if ([...grid[r]].sort((a, b) => a - b).join() !== full) return false
  for (let c = 0; c < n; c++) {
    if (
      grid
        .map((row) => row[c])
        .sort((a, b) => a - b)
        .join() !== full
    )
      return false
  }
  return true
}

function boxesAreLatin(grid: number[][]): boolean {
  for (let br = 0; br < 2; br++) {
    for (let bc = 0; bc < 2; bc++) {
      const vals: number[] = []
      for (let dr = 0; dr < BOX_SIZE; dr++) {
        for (let dc = 0; dc < BOX_SIZE; dc++) vals.push(grid[br * BOX_SIZE + dr][bc * BOX_SIZE + dc])
      }
      if (vals.sort((a, b) => a - b).join() !== '1,2,3,4') return false
    }
  }
  return true
}

/** Every square in exactly one frame — otherwise some squares carry no clue. */
function cagesTileTheGrid(cages: Cage[], n: number): boolean {
  const seen = new Set<string>()
  for (const cage of cages) {
    for (const cell of cage.cells) {
      if (seen.has(cellKey(cell))) return false
      seen.add(cellKey(cell))
    }
  }
  return seen.size === n * n
}

/**
 * A frame must be a straight run. That is not decoration: inside a straight run
 * every square shares a row (or a column), so all its numbers are guaranteed
 * DIFFERENT — which is what lets the hints say "the only pair of different
 * numbers from 1 to 4 that adds to 7 is 3 and 4" and be telling the truth.
 */
function isStraightRun(cage: Cage): boolean {
  const cells = [...cage.cells].sort(readingOrder)
  if (cells.length < 2) return false
  const sameRow = cells.every((x) => x.r === cells[0].r)
  const sameCol = cells.every((x) => x.c === cells[0].c)
  if (!sameRow && !sameCol) return false
  for (let i = 1; i < cells.length; i++) {
    const step = sameRow ? cells[i].c - cells[i - 1].c : cells[i].r - cells[i - 1].r
    if (step !== 1) return false
  }
  return true
}

/** The value a frame's clue claims, or null when the operation cannot apply. */
export function opValue(op: Op, values: number[]): number | null {
  if (op === '+') return values.reduce((a, b) => a + b, 0)
  if (op === 'x') return values.reduce((a, b) => a * b, 1)
  if (values.length !== 2) return null
  return Math.abs(values[0] - values[1])
}

function cageHolds(cage: Cage, solution: number[][]): boolean {
  const values = cage.cells.map((x) => solution[x.r][x.c])
  return opValue(cage.op, values) === cage.target
}

// ── Units: the lines a number may not repeat on ──────────────────────────────

export interface Unit {
  kind: 'row' | 'col' | 'box'
  index: number
  cells: Cell[]
}

export function unitsOf(p: SolvableSquare): Unit[] {
  const out: Unit[] = []
  for (let r = 0; r < p.n; r++) {
    out.push({ kind: 'row', index: r, cells: Array.from({ length: p.n }, (_, c) => ({ r, c })) })
  }
  for (let c = 0; c < p.n; c++) {
    out.push({ kind: 'col', index: c, cells: Array.from({ length: p.n }, (_, r) => ({ r, c })) })
  }
  if (p.clueSystem === 'thick-box') {
    const per = p.n / BOX_SIZE
    for (let br = 0; br < per; br++) {
      for (let bc = 0; bc < per; bc++) {
        const cells: Cell[] = []
        for (let dr = 0; dr < BOX_SIZE; dr++) {
          for (let dc = 0; dc < BOX_SIZE; dc++) {
            cells.push({ r: br * BOX_SIZE + dr, c: bc * BOX_SIZE + dc })
          }
        }
        out.push({ kind: 'box', index: br * per + bc, cells })
      }
    }
  }
  return out
}

// ── The deduction engine ─────────────────────────────────────────────────────

export type Rule = 'frame-last-square' | 'only-number-left' | 'only-home-in-line' | 'frame-combo'

/** "This square cannot be 3, because row 2 already shows a 3 (at row 2, column 4)." */
export interface Exclusion {
  value: number
  unit: Unit
  at: Cell
}

export interface SolveStep {
  rule: Rule
  cell: Cell
  value: number
  /** Squares whose already-known numbers this step leans on. Drives back-chaining. */
  support: Cell[]
  /** The frame in play, for the two frame rules. */
  cage: Cage | null
  /** The frame squares already known when the step ran. */
  cageKnown: { cell: Cell; value: number }[]
  /** Candidate numbers the frame's arithmetic allowed, before line exclusions. */
  arith: number[]
  /** Candidates ruled out because a line already carries them. */
  excluded: Exclusion[]
  /** The single frame filling `frame-combo` proved, ascending. */
  combo: number[]
  /** The line `only-home-in-line` reasons over. */
  unit: Unit | null
  /** Why the number cannot live in the line's other empty squares. */
  blocked: { cell: Cell; by: Exclusion }[]
}

export interface Solution {
  /** The full forcing trail: every empty square, in the order it can be pinned. */
  steps: SolveStep[]
  /**
   * The sub-trail the answer actually depends on — the lettered squares plus
   * every square an earlier step had to pin to reach them. This is what the
   * hints narrate; the rest of the grid is scenery the child never has to fill.
   */
  neededSteps: SolveStep[]
  /** True when the printed clues pin every empty square on their own. */
  forced: boolean
  letterValues: number[]
  answer: string
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1)
}

/** All k-subsets of `pool` (ascending) whose `op` result is `target`. */
export function combosFor(pool: number[], k: number, op: Op, target: number): number[][] {
  const out: number[][] = []
  const cur: number[] = []
  const walk = (start: number): void => {
    if (cur.length === k) {
      if (opValue(op, cur) === target) out.push([...cur])
      return
    }
    for (let i = start; i < pool.length; i++) {
      cur.push(pool[i])
      walk(i + 1)
      cur.pop()
    }
  }
  walk(0)
  return out
}

const BLANK_STEP = {
  cage: null,
  cageKnown: [] as { cell: Cell; value: number }[],
  arith: [] as number[],
  excluded: [] as Exclusion[],
  combo: [] as number[],
  unit: null,
  blocked: [] as { cell: Cell; by: Exclusion }[],
}

export function solve(p: SolvableSquare): Solution {
  const n = p.n
  const all = range(n)
  const known: (number | null)[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => null))
  for (const g of p.givens) known[g.r][g.c] = p.solution[g.r][g.c]

  const units = unitsOf(p)
  const unitsAt = new Map<string, Unit[]>()
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      unitsAt.set(
        `${r},${c}`,
        units.filter((u) => u.cells.some((x) => x.r === r && x.c === c)),
      )
    }
  }
  const cageAt = new Map<string, Cage>()
  for (const cage of p.cages) for (const cell of cage.cells) cageAt.set(cellKey(cell), cage)

  /** What a square may still hold, and the first witness against everything else. */
  const candidates = (cell: Cell): { allowed: number[]; excluded: Exclusion[] } => {
    const allowed: number[] = []
    const excluded: Exclusion[] = []
    for (const v of all) {
      let hit: Exclusion | null = null
      for (const unit of unitsAt.get(cellKey(cell)) as Unit[]) {
        const at = unit.cells.find((x) => !sameCell(x, cell) && known[x.r][x.c] === v)
        if (at) {
          hit = { value: v, unit, at }
          break
        }
      }
      if (hit) excluded.push(hit)
      else allowed.push(v)
    }
    return { allowed, excluded }
  }

  const emptyCells = (): Cell[] => {
    const out: Cell[] = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (known[r][c] === null) out.push({ r, c })
    return out
  }

  // ── Rule 1: a frame with one square left. Its arithmetic hands that square
  // over, exactly like a printed row total does in `row-column-sum-grid`.
  const frameLastSquare = (): SolveStep | null => {
    for (const cage of p.cages) {
      const blanks = cage.cells.filter((x) => known[x.r][x.c] === null)
      if (blanks.length !== 1) continue
      const cell = blanks[0]
      const filled = cage.cells
        .filter((x) => !sameCell(x, cell))
        .map((x) => ({ cell: x, value: known[x.r][x.c] as number }))
      const seen = filled.map((f) => f.value)

      let raw: number[] = []
      if (cage.op === '+') raw = [cage.target - seen.reduce((a, b) => a + b, 0)]
      else if (cage.op === 'x') {
        const prod = seen.reduce((a, b) => a * b, 1)
        raw = prod !== 0 && cage.target % prod === 0 ? [cage.target / prod] : []
      } else raw = [seen[0] + cage.target, seen[0] - cage.target]

      const arith = raw.filter((v) => v >= 1 && v <= n)
      const { allowed, excluded } = candidates(cell)
      const feasible = arith.filter((v) => allowed.includes(v))
      if (feasible.length !== 1) continue
      const killed = excluded.filter((e) => arith.includes(e.value))
      return {
        ...BLANK_STEP,
        rule: 'frame-last-square',
        cell,
        value: feasible[0],
        support: [...filled.map((f) => f.cell), ...killed.map((e) => e.at)],
        cage,
        cageKnown: filled,
        arith,
        excluded: killed,
      }
    }
    return null
  }

  // ── Rule 2: a square with one number left. Every other number is already
  // sitting somewhere on its row, its column or its box.
  const onlyNumberLeft = (): SolveStep | null => {
    for (const cell of emptyCells()) {
      const { allowed, excluded } = candidates(cell)
      if (allowed.length !== 1) continue
      return {
        ...BLANK_STEP,
        rule: 'only-number-left',
        cell,
        value: allowed[0],
        support: excluded.map((e) => e.at),
        excluded,
      }
    }
    return null
  }

  // ── Rule 3: a number with one home left on a line.
  const onlyHomeInLine = (): SolveStep | null => {
    for (const unit of units) {
      const blanks = unit.cells.filter((x) => known[x.r][x.c] === null)
      if (blanks.length < 2) continue
      const present = new Set(unit.cells.map((x) => known[x.r][x.c]).filter((v): v is number => v !== null))
      for (const v of all) {
        if (present.has(v)) continue
        const homes: Cell[] = []
        const blocked: { cell: Cell; by: Exclusion }[] = []
        for (const cell of blanks) {
          const { allowed, excluded } = candidates(cell)
          if (allowed.includes(v)) homes.push(cell)
          else blocked.push({ cell, by: excluded.find((e) => e.value === v) as Exclusion })
        }
        if (homes.length !== 1) continue
        return {
          ...BLANK_STEP,
          rule: 'only-home-in-line',
          cell: homes[0],
          value: v,
          support: blocked.map((b) => b.by.at),
          unit,
          blocked,
        }
      }
    }
    return null
  }

  // ── Rule 4: a frame whose clue can be met exactly one way. Because a frame is
  // a straight run its numbers are all different, so "the only set of different
  // numbers from 1 to n that adds to T" is a true and complete statement.
  const frameCombo = (): SolveStep | null => {
    for (const cage of p.cages) {
      const blanks = cage.cells.filter((x) => known[x.r][x.c] === null)
      if (blanks.length < 2) continue
      const filled = cage.cells
        .filter((x) => known[x.r][x.c] !== null)
        .map((x) => ({ cell: x, value: known[x.r][x.c] as number }))
      const seen = filled.map((f) => f.value)

      let residual: number | null = null
      if (cage.op === '+') residual = cage.target - seen.reduce((a, b) => a + b, 0)
      else if (cage.op === 'x') {
        const prod = seen.reduce((a, b) => a * b, 1)
        residual = prod !== 0 && cage.target % prod === 0 ? cage.target / prod : null
      } else residual = seen.length === 0 ? cage.target : null
      if (residual === null || residual < 1) continue

      const pool = all.filter((v) => !seen.includes(v))
      const combos = combosFor(pool, blanks.length, cage.op, residual)
      if (combos.length !== 1) continue
      const combo = combos[0]

      for (const cell of [...blanks].sort(readingOrder)) {
        const { allowed, excluded } = candidates(cell)
        const feasible = combo.filter((v) => allowed.includes(v))
        if (feasible.length !== 1) continue
        const killed = excluded.filter((e) => combo.includes(e.value))
        return {
          ...BLANK_STEP,
          rule: 'frame-combo',
          cell,
          value: feasible[0],
          support: [...filled.map((f) => f.cell), ...killed.map((e) => e.at)],
          cage,
          cageKnown: filled,
          combo,
          excluded: killed,
        }
      }
    }
    return null
  }

  const steps: SolveStep[] = []
  for (;;) {
    const step = frameLastSquare() ?? onlyNumberLeft() ?? onlyHomeInLine() ?? frameCombo()
    if (!step) break
    // Two independent sources for the same number: the printed clues as read by
    // the rule, and the square this question was built from. If they ever
    // disagree the concept is broken, and failing loudly beats narrating an
    // argument that lands somewhere other than the answer.
    if (step.value !== p.solution[step.cell.r][step.cell.c]) {
      throw new Error(
        `latin-square-cage: rule ${step.rule} pins (${step.cell.r},${step.cell.c}) to ${step.value} but the solution holds ${p.solution[step.cell.r][step.cell.c]}`,
      )
    }
    steps.push(step)
    known[step.cell.r][step.cell.c] = step.value
  }

  const forced = steps.length === n * n - p.givens.length
  const letterValues = p.letters.map((l) => p.solution[l.r][l.c])
  const answer =
    p.ask === 'single-letter'
      ? String(letterValues[0])
      : p.ask === 'letters-sum'
        ? String(letterValues.reduce((a, b) => a + b, 0))
        : letterValues.join('')

  // Walk the trail backwards: a step matters if the answer needs it, and a step
  // the answer needs drags in whichever earlier squares it leaned on.
  const stepAt = new Map<string, number>()
  steps.forEach((s, i) => stepAt.set(cellKey(s.cell), i))
  const needed = new Set<number>()
  const seed = p.letters.map((l) => stepAt.get(cellKey(l))).filter((i): i is number => i !== undefined)
  for (const i of seed) needed.add(i)
  for (let i = steps.length - 1; i >= 0; i--) {
    if (!needed.has(i)) continue
    for (const cell of steps[i].support) {
      const at = stepAt.get(cellKey(cell))
      if (at !== undefined && at < i) needed.add(at)
    }
  }
  const neededSteps = steps.filter((_, i) => needed.has(i))

  return { steps, neededSteps, forced, letterValues, answer }
}

/**
 * Writing the lettered digits the wrong way round — the one genuinely tempting
 * wrong answer this concept has, and only for the multi-digit ask. `null` when
 * the number reads the same backwards, or when the ask has no order to get wrong.
 */
export function trapAnswer(p: SolvableSquare, s: Solution): string | null {
  if (p.ask !== 'letters-number') return null
  const reversed = [...s.letterValues].reverse().join('')
  return reversed === s.answer ? null : reversed
}

// ── Exhaustive completion count (the uniqueness guarantee) ───────────────────

/**
 * Counts completions of the puzzle from its DEFINITION — every square holds
 * 1..n, no line repeats, the givens stand, every frame clue holds — with no
 * shared code with the deduction engine. Stops at `cap`, because "2 or more" is
 * all the caller ever needs to know.
 */
export function countCompletions(p: SolvableSquare, cap = 2): number {
  const n = p.n
  const grid: number[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => 0))
  const givenAt = new Map<string, number>()
  for (const g of p.givens) givenAt.set(cellKey(g), p.solution[g.r][g.c])
  const cageAt = new Map<string, Cage>()
  for (const cage of p.cages) for (const cell of cage.cells) cageAt.set(cellKey(cell), cage)
  const boxed = p.clueSystem === 'thick-box'
  let found = 0

  const legal = (r: number, c: number, v: number): boolean => {
    for (let i = 0; i < n; i++) {
      if (i !== c && grid[r][i] === v) return false
      if (i !== r && grid[i][c] === v) return false
    }
    if (boxed) {
      const br = Math.floor(r / BOX_SIZE) * BOX_SIZE
      const bc = Math.floor(c / BOX_SIZE) * BOX_SIZE
      for (let dr = 0; dr < BOX_SIZE; dr++) {
        for (let dc = 0; dc < BOX_SIZE; dc++) {
          if ((br + dr !== r || bc + dc !== c) && grid[br + dr][bc + dc] === v) return false
        }
      }
    }
    const cage = cageAt.get(`${r},${c}`)
    if (cage) {
      const values = cage.cells.map((x) => grid[x.r][x.c])
      if (values.every((x) => x !== 0)) return opValue(cage.op, values) === cage.target
      // Partial prune: a sum frame can neither overshoot nor be unreachable.
      if (cage.op === '+') {
        const partial = values.reduce((a, b) => a + b, 0)
        const left = values.filter((x) => x === 0).length
        if (partial + left * 1 > cage.target) return false
        if (partial + left * n < cage.target) return false
      }
      if (cage.op === 'x') {
        const partial = values.filter((x) => x !== 0).reduce((a, b) => a * b, 1)
        if (cage.target % partial !== 0) return false
      }
    }
    return true
  }

  const walk = (at: number): void => {
    if (found >= cap) return
    if (at === n * n) {
      found += 1
      return
    }
    const r = Math.floor(at / n)
    const c = at % n
    const fixed = givenAt.get(`${r},${c}`)
    for (let v = 1; v <= n; v++) {
      if (fixed !== undefined && v !== fixed) continue
      grid[r][c] = v
      if (legal(r, c, v)) walk(at + 1)
      grid[r][c] = 0
      if (found >= cap) return
    }
  }
  walk(0)
  return found
}

// ── Generation ───────────────────────────────────────────────────────────────

/** A random completed Latin square (with boxes when the clue system needs them). */
function randomSquare(rng: Rng, n: number, boxed: boolean): number[][] | null {
  const grid: number[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => 0))
  const ok = (r: number, c: number, v: number): boolean => {
    for (let i = 0; i < n; i++) if (grid[r][i] === v || grid[i][c] === v) return false
    if (boxed) {
      const br = Math.floor(r / BOX_SIZE) * BOX_SIZE
      const bc = Math.floor(c / BOX_SIZE) * BOX_SIZE
      for (let dr = 0; dr < BOX_SIZE; dr++) {
        for (let dc = 0; dc < BOX_SIZE; dc++) if (grid[br + dr][bc + dc] === v) return false
      }
    }
    return true
  }
  const walk = (at: number): boolean => {
    if (at === n * n) return true
    const r = Math.floor(at / n)
    const c = at % n
    for (const v of rng.shuffle(range(n))) {
      if (!ok(r, c, v)) continue
      grid[r][c] = v
      if (walk(at + 1)) return true
      grid[r][c] = 0
    }
    return false
  }
  return walk(0) ? grid : null
}

/** Tiles the whole grid with straight runs of 2 and 3 squares. */
function tileStraightRuns(rng: Rng, n: number): Cell[][] | null {
  const used: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => false))
  const runs: Cell[][] = []
  const firstFree = (): Cell | null => {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!used[r][c]) return { r, c }
    return null
  }
  const walk = (): boolean => {
    const start = firstFree()
    if (!start) return true
    // `start` is the reading-order-first free square, so every run that could
    // cover it must begin there and grow right or down.
    const options: Cell[][] = []
    for (const len of [2, 3]) {
      const across = Array.from({ length: len }, (_, i) => ({ r: start.r, c: start.c + i }))
      if (across.every((x) => x.c < n && !used[x.r][x.c])) options.push(across)
      const down = Array.from({ length: len }, (_, i) => ({ r: start.r + i, c: start.c }))
      if (down.every((x) => x.r < n && !used[x.r][x.c])) options.push(down)
    }
    for (const run of rng.shuffle(options)) {
      for (const x of run) used[x.r][x.c] = true
      runs.push(run)
      if (walk()) return true
      runs.pop()
      for (const x of run) used[x.r][x.c] = false
    }
    return false
  }
  return walk() ? runs : null
}

function clueFor(rng: Rng, run: Cell[], solution: number[][]): Cage {
  const values = run.map((x) => solution[x.r][x.c])
  // Times clues stay on pairs so the numbers a child multiplies stay small.
  const op: Op = run.length === 2 ? rng.pick(['+', '+', '-', 'x'] as const) : '+'
  return { cells: run, op, target: opValue(op, values) as number }
}

/** Squares nothing pins yet — revealing one of these is what unsticks a draft. */
function stuckCells(p: SolvableSquare, s: Solution): Cell[] {
  const done = new Set<string>([...p.givens.map(cellKey), ...s.steps.map((x) => cellKey(x.cell))])
  const out: Cell[] = []
  for (let r = 0; r < p.n; r++) for (let c = 0; c < p.n; c++) if (!done.has(`${r},${c}`)) out.push({ r, c })
  return out
}

const MAX_NARRATED = 7

function draft(rng: Rng): Params | null {
  // n = 5 is drafted as often as n = 4 but succeeds far less often: a 5-by-5
  // grid needs a longer forcing chain and the four rules crack fewer of them.
  // Weighting it up is what keeps grade 3 seeing real 5-by-5 puzzles.
  const n = rng.pick([4, 5] as const)
  const clueSystem: ClueSystem = n === 4 && rng.int(0, 3) === 0 ? 'thick-box' : 'cage-op'
  const solution = randomSquare(rng, n, clueSystem === 'thick-box')
  if (!solution) return null

  let cages: Cage[] = []
  if (clueSystem === 'cage-op') {
    const runs = tileStraightRuns(rng, n)
    if (!runs) return null
    cages = runs.map((run) => clueFor(rng, run, solution))
  }

  let givens: Cell[] = []
  const base = (): SolvableSquare => ({
    n,
    clueSystem,
    solution,
    cages,
    givens,
    letters: [{ r: 0, c: 0 }],
    ask: 'single-letter',
  })

  if (clueSystem === 'thick-box') {
    // Carve down from a fully printed grid: drop squares one at a time for as
    // long as the deduction engine can still put every one of them back.
    givens = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) givens.push({ r, c })
    for (const cell of rng.shuffle(givens.slice())) {
      const trimmed = givens.filter((g) => !sameCell(g, cell))
      const probe = { ...base(), givens: trimmed }
      if (solve(probe).forced) givens = trimmed
    }
  } else {
    // Frames usually carry the whole puzzle; when they stall, printing one of
    // the squares that stayed dark is what gets the chain moving again.
    for (let extra = 0; extra < 2; extra++) {
      const s = solve(base())
      if (s.forced) break
      const stuck = stuckCells(base(), s)
      if (stuck.length === 0) break
      givens = [...givens, rng.pick(stuck)].sort(readingOrder)
    }
  }
  givens = [...givens].sort(readingOrder)

  const probe = solve(base())
  if (!probe.forced) return null

  // Letters go on squares the child has to WORK for; the trail behind them is
  // what the hints narrate, so it must be long enough to be a puzzle and short
  // enough to read.
  const openCells = probe.steps.map((x) => x.cell)
  if (openCells.length < 2) return null
  const howMany = Math.min(rng.int(1, 3), openCells.length)
  const ask: Ask =
    howMany === 1 ? 'single-letter' : rng.pick(['letters-sum', 'letters-number'] as const)

  for (let tries = 0; tries < 24; tries++) {
    const letters = rng.shuffle(openCells).slice(0, howMany).sort(readingOrder)
    const candidate: Params = { n, clueSystem, solution, cages, givens, letters, ask }
    const s = solve(candidate)
    if (s.neededSteps.length < 2 || s.neededSteps.length > MAX_NARRATED) continue
    return candidate
  }
  return null
}

/**
 * Quality filter, not a correctness rule — `draft` already aims at forced
 * squares and `paramsSchema` refuses the ones that miss. This rejects the
 * puzzles that are technically fine but pedagogically bad.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (!s.forced) return false
  // The promise the whole concept rests on, checked the hard way.
  if (countCompletions(p) !== 1) return false
  if (s.neededSteps.length < 2 || s.neededSteps.length > MAX_NARRATED) return false
  // A number that reads the same backwards makes the ordering the question
  // makes a point of carry no weight at all.
  if (p.ask === 'letters-number' && [...s.letterValues].reverse().join('') === s.answer) return false
  // The frames must actually matter: a cage puzzle solved purely by sudoku
  // elimination would print clues the child never has to read.
  if (p.clueSystem === 'cage-op' && !s.neededSteps.some((x) => x.cage !== null)) return false
  return true
}

/**
 * A hand-built thick-box 4-by-4 whose two empty squares are each forced by the
 * line rule alone. The last-resort fallback: reachable only if 200 drafts in a
 * row miss, which has never been observed, but a concept must never hand back
 * a puzzle that cannot be solved.
 */
function fallback(): Params {
  const solution = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ]
  const givens: Cell[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) if (r !== 0 || c > 1) givens.push({ r, c })
  }
  return {
    n: 4,
    clueSystem: 'thick-box',
    solution,
    cages: [],
    givens,
    letters: [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ],
    ask: 'letters-sum',
  }
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    if (candidate === null) continue
    if (!solve(candidate).forced) continue
    if (first === null && countCompletions(candidate) === 1) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  return fallback()
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** "5+", "2−", "6×" — the clue printed in a frame's corner. */
export function cageClue(cage: Cage): string {
  return `${cage.target}${cage.op === '+' ? '+' : cage.op === '-' ? '−' : '×'}`
}

export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/**
 * The same, but for whole CLAUSES rather than bare numbers — those always take
 * a comma before the final "and", or "row 4 already has 1 and 4 and column 2
 * already has 2" runs together into one unreadable line.
 */
function joinClauses(items: string[], lang: 'en' | 'id'): string {
  if (items.length <= 1) return items[0] ?? ''
  const tail = lang === 'id' ? 'dan' : 'and'
  return `${items.slice(0, -1).join(', ')}, ${tail} ${items[items.length - 1]}`
}

const COUNT_EN = ['no', 'One', 'Two', 'Three'] as const
const COUNT_ID = ['nol', 'Satu', 'Dua', 'Tiga'] as const

/** The letter printed in a square, or null. */
export function letterAt(p: SolvableSquare, cell: Cell): string | null {
  const at = p.letters.findIndex((l) => sameCell(l, cell))
  return at === -1 ? null : LETTERS[at]
}

/** "square A (row 2, column 3)" / "the square in row 2, column 3". */
function cellName(p: SolvableSquare, cell: Cell, lang: 'en' | 'id'): string {
  const letter = letterAt(p, cell)
  if (lang === 'id') {
    const pos = `baris ke-${cell.r + 1} kolom ke-${cell.c + 1}`
    return letter ? `kotak ${letter} (${pos})` : `kotak di ${pos}`
  }
  const pos = `row ${cell.r + 1}, column ${cell.c + 1}`
  return letter ? `square ${letter} (${pos})` : `the square in ${pos}`
}

const BOX_NAME_EN = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const
const BOX_NAME_ID = ['kiri atas', 'kanan atas', 'kiri bawah', 'kanan bawah'] as const

function unitName(unit: Unit, lang: 'en' | 'id'): string {
  const n = unit.index + 1
  if (unit.kind === 'row') return lang === 'id' ? `baris ke-${n}` : `row ${n}`
  if (unit.kind === 'col') return lang === 'id' ? `kolom ke-${n}` : `column ${n}`
  return lang === 'id'
    ? `kotak tebal ${BOX_NAME_ID[unit.index] ?? ''}`.trim()
    : `the ${BOX_NAME_EN[unit.index] ?? ''} bold box`.replace('  ', ' ')
}

/** "row 2 already shows a 3" — one line, one banned number. */
function exclusionPhrase(e: Exclusion, lang: 'en' | 'id'): string {
  return lang === 'id'
    ? `${unitName(e.unit, 'id')} sudah punya ${e.value}`
    : `${unitName(e.unit, 'en')} already shows a ${e.value}`
}

/** The same, but grouped so one line that bans two numbers is said once. */
function groupedExclusions(list: Exclusion[], lang: 'en' | 'id'): string {
  const order: string[] = []
  const byUnit = new Map<string, { unit: Unit; values: number[] }>()
  for (const e of list) {
    const key = `${e.unit.kind}${e.unit.index}`
    if (!byUnit.has(key)) {
      byUnit.set(key, { unit: e.unit, values: [] })
      order.push(key)
    }
    ;(byUnit.get(key) as { unit: Unit; values: number[] }).values.push(e.value)
  }
  const parts = order.map((key) => {
    const { unit, values } = byUnit.get(key) as { unit: Unit; values: number[] }
    const nums = lang === 'id' ? listId(values.map(String)) : listEn(values.map(String))
    return lang === 'id'
      ? `${unitName(unit, 'id')} sudah punya ${nums}`
      : `${unitName(unit, 'en')} already has ${nums}`
  })
  return joinClauses(parts, lang)
}

const VERB_EN: Record<Op, (t: number) => string> = {
  '+': (t) => `add up to ${t}`,
  '-': (t) => `differ by ${t}`,
  x: (t) => `multiply to ${t}`,
}
const VERB_ID: Record<Op, (t: number) => string> = {
  '+': (t) => `berjumlah ${t}`,
  '-': (t) => `selisihnya ${t}`,
  x: (t) => `hasil kalinya ${t}`,
}

/** One deduction, stated as the argument that forces it. */
function stepSentence(p: SolvableSquare, step: SolveStep, lang: 'en' | 'id'): string {
  const id = lang === 'id'
  const who = cellName(p, step.cell, lang)
  const clauses = (items: string[]) => joinClauses(items, lang)

  if (step.rule === 'frame-last-square') {
    const cage = step.cage as Cage
    const clue = cageClue(cage)
    const seen = step.cageKnown.map((k) => k.value)
    if (cage.op === '+') {
      return id
        ? `Bingkai ${clue} memuat ${cage.cells.length} kotak; ${listId(seen.map(String))} sudah terisi di sana. Seluruh bingkai harus berjumlah ${cage.target}, jadi ${who} adalah ${cage.target} − ${seen.join(' − ')} = ${step.value}.`
        : `Frame ${clue} covers ${cage.cells.length} squares; ${listEn(seen.map(String))} already sit${seen.length === 1 ? 's' : ''} there. The whole frame must add to ${cage.target}, so ${who} is ${cage.target} − ${seen.join(' − ')} = ${step.value}.`
    }
    if (cage.op === 'x') {
      return id
        ? `Bingkai ${clue} memuat ${cage.cells.length} kotak; ${listId(seen.map(String))} sudah terisi di sana. Hasil kali seluruh bingkai harus ${cage.target}, jadi ${who} adalah ${cage.target} ÷ ${seen.join(' ÷ ')} = ${step.value}.`
        : `Frame ${clue} covers ${cage.cells.length} squares; ${listEn(seen.map(String))} already sit${seen.length === 1 ? 's' : ''} there. The whole frame must multiply to ${cage.target}, so ${who} is ${cage.target} ÷ ${seen.join(' ÷ ')} = ${step.value}.`
    }
    // The minus frame is the only one that can offer two numbers; the one it
    // offers and does not take has to be knocked out out loud.
    const a = seen[0]
    const up = a + cage.target
    const down = a - cage.target
    const offers: string[] = []
    const outside: string[] = []
    if (up >= 1 && up <= p.n) offers.push(`${a} + ${cage.target} = ${up}`)
    else {
      outside.push(
        id
          ? `naik ${cage.target} dari ${a} sudah melewati ${p.n}`
          : `going ${cage.target} up from ${a} would pass ${p.n}`,
      )
    }
    if (down >= 1 && down <= p.n) offers.push(`${a} − ${cage.target} = ${down}`)
    else {
      outside.push(
        id
          ? `turun ${cage.target} dari ${a} sudah jatuh di bawah 1`
          : `going ${cage.target} down from ${a} would drop below 1`,
      )
    }
    const killed = step.excluded.map((e) =>
      id
        ? `${e.value} tidak mungkin karena ${exclusionPhrase(e, 'id')}`
        : `${e.value} is impossible because ${exclusionPhrase(e, 'en')}`,
    )
    const rangeTail = outside.length > 0 ? (id ? ` — ${listId(outside)}` : ` — ${listEn(outside)}`) : ''
    const close = id
      ? killed.length > 0
        ? `${capitalise(listId(killed))}, jadi`
        : 'Jadi'
      : killed.length > 0
        ? `${capitalise(listEn(killed))}, so`
        : 'So'
    return id
      ? `Bingkai ${clue} memuat dua kotak yang selisihnya ${cage.target}, dan satu di antaranya ${a}. Pasangannya ${listId(offers)}${rangeTail}. ${close} ${who} adalah ${step.value}.`
      : `Frame ${clue} covers two squares that differ by ${cage.target}, and one of them shows ${a}. The other is ${listEn(offers)}${rangeTail}. ${close} ${who} is ${step.value}.`
  }

  if (step.rule === 'only-number-left') {
    return id
      ? `Sekarang lihat ${who}. ${capitalise(groupedExclusions(step.excluded, 'id'))}, jadi satu-satunya bilangan yang tersisa untuknya adalah ${step.value}.`
      : `Now look at ${who}. ${capitalise(groupedExclusions(step.excluded, 'en'))}, so the only number left for it is ${step.value}.`
  }

  if (step.rule === 'only-home-in-line') {
    const unit = step.unit as Unit
    const why = step.blocked.map((b) =>
      id
        ? `bukan ${cellName(p, b.cell, 'id')} karena ${exclusionPhrase(b.by, 'id')}`
        : `not ${cellName(p, b.cell, 'en')} because ${exclusionPhrase(b.by, 'en')}`,
    )
    return id
      ? `Di ${unitName(unit, 'id')}, di mana ${step.value} bisa ditaruh? ${capitalise(clauses(why))}. Jadi ${step.value} harus masuk ke ${who}.`
      : `In ${unitName(unit, 'en')}, where can ${step.value} go? ${capitalise(clauses(why))}. So ${step.value} must go in ${who}.`
  }

  const cage = step.cage as Cage
  const clue = cageClue(cage)
  const seen = step.cageKnown.map((k) => k.value)
  const blanks = cage.cells.length - seen.length
  const combo = step.combo
  const rest = combo.length === 2 ? (id ? 'pasangan' : 'pair') : id ? 'kelompok' : 'set'
  const boxes_en = blanks === 2 ? 'two squares that must hold different numbers' : `${blanks} squares that must all hold different numbers`
  const boxes_id = blanks === 2 ? 'dua kotak yang isinya harus berbeda' : `${blanks} kotak yang isinya harus berbeda semua`
  const opened = id
    ? seen.length === 0
      ? `Bingkai ${clue} memuat ${boxes_id}. Satu-satunya ${rest} bilangan 1 sampai ${p.n} yang ${VERB_ID[cage.op](cage.target)} adalah ${listId(combo.map(String))}.`
      : `Bingkai ${clue} sudah memperlihatkan ${listId(seen.map(String))}, jadi sisanya ${boxes_id} dan satu-satunya ${rest} yang cocok adalah ${listId(combo.map(String))}.`
    : seen.length === 0
      ? `Frame ${clue} covers ${boxes_en}. The only ${rest} of numbers from 1 to ${p.n} that ${VERB_EN[cage.op](cage.target)} is ${listEn(combo.map(String))}.`
      : `Frame ${clue} already shows ${listEn(seen.map(String))}, so the rest of it is ${boxes_en} and the only ${rest} that fits is ${listEn(combo.map(String))}.`
  const why = step.excluded.map((e) =>
    id
      ? `tidak bisa ${e.value} karena ${exclusionPhrase(e, 'id')}`
      : `cannot be ${e.value} because ${exclusionPhrase(e, 'en')}`,
  )
  return id
    ? `${opened} ${capitalise(who)} ${clauses(why)}, jadi isinya ${step.value}.`
    : `${opened} ${capitalise(who)} ${clauses(why)}, so it is ${step.value}.`
}

function capitalise(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1)
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, count: number, lang: 'en' | 'id'): string {
  const marks = LETTERS.slice(0, count)
  if (ask === 'single-letter') {
    return lang === 'id' ? 'Berapa bilangan di kotak bertanda A?' : 'What number goes in the square marked A?'
  }
  if (ask === 'letters-sum') {
    const sum = marks.join(' + ')
    return lang === 'id' ? `Berapa ${sum}?` : `What is ${sum}?`
  }
  const word = marks.join('')
  const order =
    lang === 'id'
      ? marks.map((m, i) => (i === 0 ? `${m} dulu` : `lalu ${m}`)).join(', ')
      : marks.map((m, i) => (i === 0 ? `${m} first` : `then ${m}`)).join(', ')
  return lang === 'id'
    ? `Berapa bilangan ${count}-angka ${word} (${order})?`
    : `What is the ${count}-digit number ${word} (${order})?`
}

/** The sentence describing the frame clue system. Exported so the breakdown can quote it. */
export function ruleClause(ops: Op[], lang: 'en' | 'id'): string {
  const parts_en: Record<Op, string> = {
    '+': 'a plus clue like 5+ means the numbers inside add up to 5',
    '-': 'a minus clue like 2− means the two numbers differ by 2',
    x: 'a times clue like 6× means the numbers inside multiply to 6',
  }
  const parts_id: Record<Op, string> = {
    '+': 'petunjuk tambah seperti 5+ berarti bilangan di dalamnya berjumlah 5',
    '-': 'petunjuk kurang seperti 2− berarti selisih kedua bilangannya 2',
    x: 'petunjuk kali seperti 6× berarti hasil kali bilangan di dalamnya 6',
  }
  const ordered = OPS.filter((op) => ops.includes(op))
  return lang === 'id'
    ? listId(ordered.map((op) => parts_id[op]))
    : listEn(ordered.map((op) => parts_en[op]))
}

export function usedOps(p: SolvableSquare): Op[] {
  return OPS.filter((op) => p.cages.some((cage) => cage.op === op))
}

export function render(params: Params): Rendered {
  const { n, clueSystem, givens, letters, ask } = params
  const s = solve(params)
  const breakdown = buildLatinSquareCageBreakdown(params)
  const ops = usedOps(params)

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = [
    `Fill every square of the ${n} by ${n} grid with a number from 1 to ${n} so that each row and each column holds every number exactly once.`,
    clueSystem === 'thick-box'
      ? `Each bold ${BOX_SIZE} by ${BOX_SIZE} box must hold every number exactly once too.`
      : `A bold frame carries a clue in its corner: ${ruleClause(ops, 'en')}.`,
    givens.length > 0
      ? `${givens.length <= 3 ? COUNT_EN[givens.length] : givens.length} ${givens.length === 1 ? 'square is' : 'squares are'} already filled in.`
      : null,
    `Find: ${askClause(ask, letters.length, 'en')}`,
  ]
    .filter((x): x is string => x !== null)
    .join(' ')

  const body_id = [
    `Isi setiap kotak pada kisi ${n} kali ${n} dengan bilangan 1 sampai ${n} sehingga setiap baris dan setiap kolom memuat semua bilangan itu tepat satu kali.`,
    clueSystem === 'thick-box'
      ? `Setiap kotak tebal ${BOX_SIZE} kali ${BOX_SIZE} juga harus memuat semua bilangan itu tepat satu kali.`
      : `Bingkai bergaris tebal membawa petunjuk di pojoknya: ${ruleClause(ops, 'id')}.`,
    givens.length > 0
      ? `${givens.length <= 3 ? COUNT_ID[givens.length] : givens.length} kotak sudah terisi.`
      : null,
    `Cari: ${askClause(ask, letters.length, 'id')}`,
  ]
    .filter((x): x is string => x !== null)
    .join(' ')

  // ── hint_steps: only the trail the answer leans on, one deduction per line.
  // Every line names the square it pins AND the printed clue that pins it, so
  // nothing is ever announced.
  const opener_en =
    clueSystem === 'thick-box'
      ? `Rows are counted from the top and columns from the left. A number already sitting in a row, a column or a bold box is banned from every other square of that line — that ban is the whole game.`
      : `Rows are counted from the top and columns from the left. A number already sitting in a row or a column is banned from every other square on that line, and each frame's clue limits what can go inside it. Start where the two rules together leave only one choice.`
  const opener_id =
    clueSystem === 'thick-box'
      ? `Baris dihitung dari atas dan kolom dari kiri. Bilangan yang sudah ada di sebuah baris, kolom, atau kotak tebal dilarang muncul lagi di garis itu — larangan itulah seluruh permainannya.`
      : `Baris dihitung dari atas dan kolom dari kiri. Bilangan yang sudah ada di sebuah baris atau kolom dilarang muncul lagi di garis itu, dan petunjuk tiap bingkai membatasi isi bingkai itu. Mulailah dari tempat yang kedua aturan itu hanya menyisakan satu pilihan.`

  const steps_en = [opener_en, ...s.neededSteps.map((step) => stepSentence(params, step, 'en'))]
  const steps_id = [opener_id, ...s.neededSteps.map((step) => stepSentence(params, step, 'id'))]

  const marks = LETTERS.slice(0, letters.length)
  const values = s.letterValues
  const pairs_en = joinClauses(marks.map((m, i) => `${m} is ${values[i]}`), 'en')
  const pairs_id = joinClauses(marks.map((m, i) => `${m} bernilai ${values[i]}`), 'id')
  if (ask === 'single-letter') {
    steps_en.push(`So square A holds ${s.answer}.`)
    steps_id.push(`Jadi kotak A berisi ${s.answer}.`)
  } else if (ask === 'letters-sum') {
    steps_en.push(`${pairs_en}, so ${marks.join(' + ')} = ${values.join(' + ')} = ${s.answer}.`)
    steps_id.push(`${pairs_id}, jadi ${marks.join(' + ')} = ${values.join(' + ')} = ${s.answer}.`)
  } else {
    const places_en = letters.length === 2 ? ['tens', 'ones'] : ['hundreds', 'tens', 'ones']
    const places_id = letters.length === 2 ? ['puluhan', 'satuan'] : ['ratusan', 'puluhan', 'satuan']
    steps_en.push(
      `${pairs_en}. The question wants ${marks[0]} first, so ${joinClauses(values.map((v, i) => `${v} is the ${places_en[i]} digit`), 'en')}: ${s.answer}.`,
    )
    steps_id.push(
      `${pairs_id}. Yang diminta ${marks[0]} dulu, jadi ${joinClauses(values.map((v, i) => `${v} jadi angka ${places_id[i]}`), 'id')}: ${s.answer}.`,
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
      'Do not guess. Hunt for the one square where the line rule and the printed clue together leave a single number, fill that in, and it will hand the next square away.',
    hint_id:
      'Jangan menebak. Cari satu kotak yang aturan garis dan petunjuk tercetaknya hanya menyisakan satu bilangan, isi kotak itu, dan kotak berikutnya akan terbuka sendiri.',
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
