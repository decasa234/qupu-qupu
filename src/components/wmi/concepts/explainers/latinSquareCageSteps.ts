import type { Lang } from './makeTenSteps'
import type { CageGroup } from '../../PastPapers/WMI/primitives/GridBoard'

// `latin-square-cage`. An n-by-n grid to fill with 1..n, no repeats on a row or
// a column, plus bold frames carrying an arithmetic clue (or the plain
// thick-box sudoku rule). A few squares wear letters; the answer is read off
// those.
//
// The move this storyboard has to teach is patience: you never guess a square,
// you find the ONE square where the line rule and a printed clue together leave
// a single number, fill it, and let it hand the next square away. So every beat
// spotlights one frame or one line, says out loud why that square is the one
// that can be done now, and fills it in front of the child.
//
// Mirrors api/services/wmi/concepts/latin-square-cage — same four rules, same
// priority, so the beats land on the same squares in the same order as
// `hint_steps`. Params arrive as `unknown` from the DB, so the grid, the frames
// and the whole forcing walk are re-derived here; the storyboard can never
// narrate a square that is not in fact pinned at that moment.
export type LatinCageAsk = 'single-letter' | 'letters-sum' | 'letters-number'
export type LatinCagePhase = 'setup' | 'fill' | 'trap' | 'result'

/** What one square looks like on a given beat. */
export type SquareState = 'blank' | 'given' | 'target' | 'solved' | 'focus'

export interface LatinCell {
  r: number
  c: number
}

export interface LatinCage {
  cells: LatinCell[]
  op: '+' | '-' | 'x'
  target: number
}

export interface LatinCageParams {
  n: number
  clueSystem: 'cage-op' | 'thick-box'
  solution: number[][]
  cages: LatinCage[]
  givens: LatinCell[]
  letters: LatinCell[]
  ask: LatinCageAsk
}

export interface LatinCageBeat {
  phase: LatinCagePhase
  caption: string
  /** Row-major, index `r * n + c`. */
  cells: SquareState[]
  /** What to print in each square: a number once known, a letter before that. */
  labels: string[]
  /** Row-major: the frame or line this beat reasons about. */
  spotlight: boolean[]
  /** The frame clue chip this beat is spending, e.g. "7+". */
  clue: string | null
  /** The right digits in the wrong order (trap beat only). */
  trapNumber: string | null
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface LatinCageStoryboard {
  n: number
  /** Bold outlines to hand GridBoard: the frames, or the sudoku boxes. */
  cageGroups: CageGroup[]
  answer: string
  steps: LatinCageBeat[]
  finalIndex: number
}

/** Mirrors LETTERS in api/services/wmi/concepts/latin-square-cage. */
const LETTERS = ['A', 'B', 'C']
const BOX_SIZE = 2

const FALLBACK: LatinCageParams = {
  n: 4,
  clueSystem: 'thick-box',
  solution: [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ],
  cages: [],
  givens: [
    { r: 0, c: 2 },
    { r: 0, c: 3 },
    { r: 1, c: 0 },
    { r: 1, c: 1 },
    { r: 1, c: 2 },
    { r: 1, c: 3 },
    { r: 2, c: 0 },
    { r: 2, c: 1 },
    { r: 2, c: 2 },
    { r: 2, c: 3 },
    { r: 3, c: 0 },
    { r: 3, c: 1 },
    { r: 3, c: 2 },
    { r: 3, c: 3 },
  ],
  letters: [
    { r: 0, c: 0 },
    { r: 0, c: 1 },
  ],
  ask: 'letters-sum',
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

const key = (cell: LatinCell): string => `${cell.r},${cell.c}`
const same = (a: LatinCell, b: LatinCell): boolean => a.r === b.r && a.c === b.c
const byReading = (a: LatinCell, b: LatinCell): number => a.r - b.r || a.c - b.c

function readCell(raw: unknown, n: number): LatinCell | null {
  const c = (raw ?? {}) as Partial<LatinCell>
  const r = int(c.r, -1)
  const col = int(c.c, -1)
  return r >= 0 && r < n && col >= 0 && col < n ? { r, c: col } : null
}

function read(raw: unknown): LatinCageParams {
  const p = (raw ?? {}) as Partial<LatinCageParams>
  const n = Math.max(4, Math.min(5, int(p.n, 0)))
  if (!Array.isArray(p.solution) || p.solution.length !== n) return FALLBACK
  const solution = p.solution.map((row) =>
    Array.isArray(row) ? row.map((v) => Math.max(1, Math.min(n, int(v, 1)))) : [],
  )
  if (solution.some((row) => row.length !== n)) return FALLBACK

  const clueSystem: LatinCageParams['clueSystem'] =
    p.clueSystem === 'thick-box' && n === 4 ? 'thick-box' : 'cage-op'

  const cages = (Array.isArray(p.cages) ? p.cages : [])
    .map((raw2) => {
      const c = (raw2 ?? {}) as Partial<LatinCage>
      const cells = (Array.isArray(c.cells) ? c.cells : [])
        .map((x) => readCell(x, n))
        .filter((x): x is LatinCell => x !== null)
      const op: LatinCage['op'] = c.op === '-' || c.op === 'x' ? c.op : '+'
      return { cells, op, target: Math.max(0, int(c.target, 0)) }
    })
    .filter((c) => c.cells.length >= 2)
  if (clueSystem === 'cage-op' && cages.length === 0) return FALLBACK

  const letters = (Array.isArray(p.letters) ? p.letters : [])
    .map((x) => readCell(x, n))
    .filter((x): x is LatinCell => x !== null)
    .slice(0, LETTERS.length)
  if (letters.length === 0) return FALLBACK

  const givens = (Array.isArray(p.givens) ? p.givens : [])
    .map((x) => readCell(x, n))
    .filter((x): x is LatinCell => x !== null)
    .filter((g) => !letters.some((l) => same(l, g)))

  const ask: LatinCageAsk =
    letters.length === 1
      ? 'single-letter'
      : p.ask === 'letters-number'
        ? 'letters-number'
        : 'letters-sum'

  return { n, clueSystem, solution, cages, givens, letters, ask }
}

// ── The same four rules the concept uses, in the same order ──────────────────

interface Unit {
  kind: 'row' | 'col' | 'box'
  index: number
  cells: LatinCell[]
}

interface Walk {
  rule: 'frame-last-square' | 'only-number-left' | 'only-home-in-line' | 'frame-combo'
  cell: LatinCell
  value: number
  support: LatinCell[]
  cage: LatinCage | null
  cageKnown: number[]
  combo: number[]
  excluded: { value: number; unit: Unit }[]
  unit: Unit | null
}

function unitsOf(p: LatinCageParams): Unit[] {
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
        const cells: LatinCell[] = []
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

function opValue(op: LatinCage['op'], values: number[]): number | null {
  if (op === '+') return values.reduce((a, b) => a + b, 0)
  if (op === 'x') return values.reduce((a, b) => a * b, 1)
  if (values.length !== 2) return null
  return Math.abs(values[0] - values[1])
}

function combosFor(pool: number[], k: number, op: LatinCage['op'], target: number): number[][] {
  const out: number[][] = []
  const cur: number[] = []
  const step = (start: number): void => {
    if (cur.length === k) {
      if (opValue(op, cur) === target) out.push([...cur])
      return
    }
    for (let i = start; i < pool.length; i++) {
      cur.push(pool[i])
      step(i + 1)
      cur.pop()
    }
  }
  step(0)
  return out
}

function forcingWalk(p: LatinCageParams): Walk[] {
  const n = p.n
  const all = Array.from({ length: n }, (_, i) => i + 1)
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

  const candidates = (cell: LatinCell): { allowed: number[]; excluded: { value: number; unit: Unit }[] } => {
    const allowed: number[] = []
    const excluded: { value: number; unit: Unit }[] = []
    for (const v of all) {
      let hit: Unit | null = null
      for (const unit of unitsAt.get(key(cell)) as Unit[]) {
        if (unit.cells.some((x) => !same(x, cell) && known[x.r][x.c] === v)) {
          hit = unit
          break
        }
      }
      if (hit) excluded.push({ value: v, unit: hit })
      else allowed.push(v)
    }
    return { allowed, excluded }
  }

  const witnesses = (cell: LatinCell, values: number[]): LatinCell[] => {
    const out: LatinCell[] = []
    for (const v of values) {
      for (const unit of unitsAt.get(key(cell)) as Unit[]) {
        const at = unit.cells.find((x) => !same(x, cell) && known[x.r][x.c] === v)
        if (at) {
          out.push(at)
          break
        }
      }
    }
    return out
  }

  const frameLastSquare = (): Walk | null => {
    for (const cage of p.cages) {
      const blanks = cage.cells.filter((x) => known[x.r][x.c] === null)
      if (blanks.length !== 1) continue
      const cell = blanks[0]
      const filled = cage.cells.filter((x) => !same(x, cell))
      const seen = filled.map((x) => known[x.r][x.c] as number)
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
        rule: 'frame-last-square',
        cell,
        value: feasible[0],
        support: [...filled, ...witnesses(cell, killed.map((e) => e.value))],
        cage,
        cageKnown: seen,
        combo: [],
        excluded: killed,
        unit: null,
      }
    }
    return null
  }

  const onlyNumberLeft = (): Walk | null => {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (known[r][c] !== null) continue
        const cell = { r, c }
        const { allowed, excluded } = candidates(cell)
        if (allowed.length !== 1) continue
        return {
          rule: 'only-number-left',
          cell,
          value: allowed[0],
          support: witnesses(cell, excluded.map((e) => e.value)),
          cage: null,
          cageKnown: [],
          combo: [],
          excluded,
          unit: null,
        }
      }
    }
    return null
  }

  const onlyHomeInLine = (): Walk | null => {
    for (const unit of units) {
      const blanks = unit.cells.filter((x) => known[x.r][x.c] === null)
      if (blanks.length < 2) continue
      const present = new Set(unit.cells.map((x) => known[x.r][x.c]).filter((v): v is number => v !== null))
      for (const v of all) {
        if (present.has(v)) continue
        const homes = blanks.filter((cell) => candidates(cell).allowed.includes(v))
        if (homes.length !== 1) continue
        const others = blanks.filter((cell) => !same(cell, homes[0]))
        return {
          rule: 'only-home-in-line',
          cell: homes[0],
          value: v,
          support: others.flatMap((cell) => witnesses(cell, [v])),
          cage: null,
          cageKnown: [],
          combo: [],
          excluded: [],
          unit,
        }
      }
    }
    return null
  }

  const frameCombo = (): Walk | null => {
    for (const cage of p.cages) {
      const blanks = cage.cells.filter((x) => known[x.r][x.c] === null)
      if (blanks.length < 2) continue
      const filled = cage.cells.filter((x) => known[x.r][x.c] !== null)
      const seen = filled.map((x) => known[x.r][x.c] as number)
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
      for (const cell of [...blanks].sort(byReading)) {
        const { allowed, excluded } = candidates(cell)
        const feasible = combo.filter((v) => allowed.includes(v))
        if (feasible.length !== 1) continue
        const killed = excluded.filter((e) => combo.includes(e.value))
        return {
          rule: 'frame-combo',
          cell,
          value: feasible[0],
          support: [...filled, ...witnesses(cell, killed.map((e) => e.value))],
          cage,
          cageKnown: seen,
          combo,
          excluded: killed,
          unit: null,
        }
      }
    }
    return null
  }

  const walk: Walk[] = []
  for (;;) {
    const step = frameLastSquare() ?? onlyNumberLeft() ?? onlyHomeInLine() ?? frameCombo()
    if (!step) break
    walk.push(step)
    known[step.cell.r][step.cell.c] = step.value
  }
  return walk
}

/** The sub-walk the answer leans on — squares it never needs get no beat. */
function neededWalk(walk: Walk[], letters: LatinCell[]): Walk[] {
  const at = new Map<string, number>()
  walk.forEach((w, i) => at.set(key(w.cell), i))
  const need = new Set<number>()
  for (const l of letters) {
    const i = at.get(key(l))
    if (i !== undefined) need.add(i)
  }
  for (let i = walk.length - 1; i >= 0; i--) {
    if (!need.has(i)) continue
    for (const cell of walk[i].support) {
      const j = at.get(key(cell))
      if (j !== undefined && j < i) need.add(j)
    }
  }
  return walk.filter((_, i) => need.has(i))
}

// ── Prose helpers ────────────────────────────────────────────────────────────

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

const BOX_NAME_EN = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
const BOX_NAME_ID = ['kiri atas', 'kanan atas', 'kiri bawah', 'kanan bawah']

function unitName(unit: Unit, lang: Lang): string {
  const n = unit.index + 1
  if (unit.kind === 'row') return lang === 'id' ? `baris ${n}` : `row ${n}`
  if (unit.kind === 'col') return lang === 'id' ? `kolom ${n}` : `column ${n}`
  return lang === 'id'
    ? `kotak tebal ${BOX_NAME_ID[unit.index] ?? ''}`.trim()
    : `the ${BOX_NAME_EN[unit.index] ?? ''} box`
}

const clueText = (cage: LatinCage): string =>
  `${cage.target}${cage.op === '+' ? '+' : cage.op === '-' ? '−' : '×'}`

const VERB_EN: Record<LatinCage['op'], (t: number) => string> = {
  '+': (t) => `add to ${t}`,
  '-': (t) => `differ by ${t}`,
  x: (t) => `multiply to ${t}`,
}
const VERB_ID: Record<LatinCage['op'], (t: number) => string> = {
  '+': (t) => `berjumlah ${t}`,
  '-': (t) => `selisihnya ${t}`,
  x: (t) => `hasil kalinya ${t}`,
}

function where(cell: LatinCell, lang: Lang): string {
  return lang === 'id' ? `baris ${cell.r + 1} kolom ${cell.c + 1}` : `row ${cell.r + 1}, column ${cell.c + 1}`
}

/** The short spoken version of one deduction — the same argument, fewer words. */
function beatCaption(p: LatinCageParams, w: Walk, lang: Lang): string {
  const id = lang === 'id'
  const spot = where(w.cell, lang)
  const bans = listBans(w.excluded, lang)

  if (w.rule === 'frame-last-square') {
    const cage = w.cage as LatinCage
    const clue = clueText(cage)
    if (cage.op === '+') {
      return id
        ? `Bingkai ${clue} tinggal satu kotak kosong; ${listId(w.cageKnown.map(String))} sudah ada. Jadi ${spot} = ${cage.target} − ${w.cageKnown.join(' − ')} = ${w.value}.`
        : `Frame ${clue} has one square left; ${listEn(w.cageKnown.map(String))} already there. So ${spot} = ${cage.target} − ${w.cageKnown.join(' − ')} = ${w.value}.`
    }
    if (cage.op === 'x') {
      return id
        ? `Bingkai ${clue} tinggal satu kotak kosong; ${listId(w.cageKnown.map(String))} sudah ada. Jadi ${spot} = ${cage.target} ÷ ${w.cageKnown.join(' ÷ ')} = ${w.value}.`
        : `Frame ${clue} has one square left; ${listEn(w.cageKnown.map(String))} already there. So ${spot} = ${cage.target} ÷ ${w.cageKnown.join(' ÷ ')} = ${w.value}.`
    }
    const a = w.cageKnown[0]
    const options = [a + cage.target, a - cage.target].filter((v) => v >= 1 && v <= p.n)
    return id
      ? `Bingkai ${clue}: pasangan ${a} bisa ${listId(options.map(String))}${bans ? `, tapi ${bans}` : ''}. Jadi ${spot} = ${w.value}.`
      : `Frame ${clue}: the partner of ${a} could be ${listEn(options.map(String))}${bans ? `, but ${bans}` : ''}. So ${spot} = ${w.value}.`
  }

  if (w.rule === 'only-number-left') {
    return id
      ? `Di ${spot}, ${bans}. Yang tersisa cuma ${w.value}.`
      : `At ${spot}, ${bans}. The only number left is ${w.value}.`
  }

  if (w.rule === 'only-home-in-line') {
    const unit = w.unit as Unit
    return id
      ? `Di ${unitName(unit, 'id')}, angka ${w.value} tidak muat di kotak kosong lain — barisnya, kolomnya, atau kotak tebalnya sudah punya ${w.value}. Jadi ${w.value} masuk ke ${spot}.`
      : `In ${unitName(unit, 'en')}, ${w.value} does not fit in any other empty square — their own row, column or box already has a ${w.value}. So ${w.value} goes in ${spot}.`
  }

  const cage = w.cage as LatinCage
  const clue = clueText(cage)
  const combo = w.combo
  const rest = combo.length === 2 ? (id ? 'pasangan' : 'pair') : id ? 'kelompok' : 'set'
  return id
    ? `Bingkai ${clue}: satu-satunya ${rest} bilangan berbeda yang ${VERB_ID[cage.op](cage.target)} adalah ${listId(combo.map(String))}${w.cageKnown.length > 0 ? ` (setelah ${listId(w.cageKnown.map(String))})` : ''}. Karena ${bans}, ${spot} = ${w.value}.`
    : `Frame ${clue}: the only ${rest} of different numbers that ${VERB_EN[cage.op](cage.target)} is ${listEn(combo.map(String))}${w.cageKnown.length > 0 ? ` (after ${listEn(w.cageKnown.map(String))})` : ''}. Since ${bans}, ${spot} = ${w.value}.`
}

function listBans(excluded: { value: number; unit: Unit }[], lang: Lang): string {
  if (excluded.length === 0) return ''
  const order: string[] = []
  const byUnit = new Map<string, { unit: Unit; values: number[] }>()
  for (const e of excluded) {
    const k = `${e.unit.kind}${e.unit.index}`
    if (!byUnit.has(k)) {
      byUnit.set(k, { unit: e.unit, values: [] })
      order.push(k)
    }
    ;(byUnit.get(k) as { unit: Unit; values: number[] }).values.push(e.value)
  }
  const parts = order.map((k) => {
    const { unit, values } = byUnit.get(k) as { unit: Unit; values: number[] }
    const nums = lang === 'id' ? listId(values.map(String)) : listEn(values.map(String))
    return lang === 'id'
      ? `${unitName(unit, 'id')} sudah punya ${nums}`
      : `${unitName(unit, 'en')} already has ${nums}`
  })
  if (parts.length <= 1) return parts[0] ?? ''
  const tail = lang === 'id' ? 'dan' : 'and'
  return `${parts.slice(0, -1).join(', ')}, ${tail} ${parts[parts.length - 1]}`
}

function boxGroups(n: number): CageGroup[] {
  const per = n / BOX_SIZE
  const out: CageGroup[] = []
  for (let br = 0; br < per; br++) {
    for (let bc = 0; bc < per; bc++) {
      const cells: [number, number][] = []
      for (let dr = 0; dr < BOX_SIZE; dr++) {
        for (let dc = 0; dc < BOX_SIZE; dc++) cells.push([br * BOX_SIZE + dr, bc * BOX_SIZE + dc])
      }
      out.push({ cells })
    }
  }
  return out
}

// ── The storyboard ───────────────────────────────────────────────────────────

export function buildLatinSquareCageSteps(raw: unknown, lang: Lang): LatinCageStoryboard {
  const p = read(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const walk = neededWalk(forcingWalk(p), p.letters)

  const givenAt = new Map(p.givens.map((g) => [key(g), p.solution[g.r][g.c]]))
  const letterAt = new Map(p.letters.map((l, i) => [key(l), LETTERS[i]]))
  const marks: string[] = p.letters.map((_, i) => LETTERS[i])
  const values = p.letters.map((l) => p.solution[l.r][l.c])
  const answer =
    p.ask === 'single-letter'
      ? String(values[0])
      : p.ask === 'letters-sum'
        ? String(values.reduce((a, b) => a + b, 0))
        : values.join('')
  const reversed = [...values].reverse().join('')
  const trapNumber = p.ask === 'letters-number' && reversed !== answer ? reversed : null

  const cageGroups: CageGroup[] =
    p.clueSystem === 'thick-box'
      ? boxGroups(p.n)
      : p.cages.map((cage) => ({
          cells: cage.cells.map((x) => [x.r, x.c] as [number, number]),
          label: clueText(cage),
        }))

  // A running picture: `solved` holds the squares already proved.
  const solved = new Map<string, number>()
  const board = (opts: {
    focus?: LatinCell | null
    lit?: LatinCell[]
    asked?: boolean
  }): { cells: SquareState[]; labels: string[]; spotlight: boolean[] } => {
    const cells: SquareState[] = []
    const labels: string[] = []
    const spotlight: boolean[] = []
    const litKeys = new Set((opts.lit ?? []).map(key))
    for (let r = 0; r < p.n; r++) {
      for (let c = 0; c < p.n; c++) {
        const k = `${r},${c}`
        const g = givenAt.get(k)
        const done = solved.get(k)
        const mark = letterAt.get(k)
        labels.push(g !== undefined ? String(g) : done !== undefined ? String(done) : (mark ?? ''))
        spotlight.push(litKeys.has(k))

        if (opts.focus && same(opts.focus, { r, c })) cells.push('focus')
        else if (opts.asked && mark !== undefined) cells.push('focus')
        else if (done !== undefined) cells.push('solved')
        else if (g !== undefined) cells.push('given')
        else if (mark !== undefined) cells.push('target')
        else cells.push('blank')
      }
    }
    return { cells, labels, spotlight }
  }

  const steps: LatinCageBeat[] = []
  const push = (draft: Omit<LatinCageBeat, 'clue' | 'trapNumber' | 'reveal' | 'hold'> &
    Partial<Pick<LatinCageBeat, 'clue' | 'trapNumber' | 'reveal' | 'hold'>>) => {
    steps.push({ clue: null, trapNumber: null, reveal: null, hold: 2600, ...draft })
  }

  // ── Beat 1 — the board, the rules and where the letters sit. ───────────────
  {
    const { cells, labels, spotlight } = board({})
    push({
      phase: 'setup',
      cells,
      labels,
      spotlight,
      caption: T(
        `Every row and every column must hold 1 to ${p.n} once each. ${
          p.clueSystem === 'thick-box'
            ? 'Each bold box must too.'
            : "Each bold frame's clue says what the numbers inside it make."
        } Never guess — look for the square with only one number left.`,
        `Setiap baris dan setiap kolom harus memuat 1 sampai ${p.n} masing-masing sekali. ${
          p.clueSystem === 'thick-box'
            ? 'Setiap kotak tebal juga begitu.'
            : 'Petunjuk di tiap bingkai tebal memberi tahu hasil bilangan di dalamnya.'
        } Jangan menebak — cari kotak yang tinggal punya satu kemungkinan.`,
      ),
      hold: 3400,
    })
  }

  // ── Beats 2.. — one per square the answer needs, in the order it falls. ────
  for (const w of walk) {
    const lit = w.cage ? w.cage.cells : w.unit ? w.unit.cells : [w.cell]
    solved.set(key(w.cell), w.value)
    const { cells, labels, spotlight } = board({ focus: w.cell, lit })
    push({
      phase: 'fill',
      cells,
      labels,
      spotlight,
      clue: w.cage ? clueText(w.cage) : null,
      caption: beatCaption(p, w, lang),
      hold: 3200,
    })
  }

  // ── The order trap, drawn instead of told. ────────────────────────────────
  if (trapNumber !== null) {
    const { cells, labels, spotlight } = board({ asked: true })
    push({
      phase: 'trap',
      cells,
      labels,
      spotlight,
      trapNumber,
      caption: T(
        `Careful: ${marks.map((m, i) => `${m} is ${values[i]}`).join(', ')}. Written backwards that reads ${trapNumber}. The question wants ${marks[0]} first.`,
        `Hati-hati: ${marks.map((m, i) => `${m} bernilai ${values[i]}`).join(', ')}. Kalau ditulis terbalik hasilnya ${trapNumber}. Yang diminta ${marks[0]} lebih dulu.`,
      ),
      hold: 3400,
    })
  }

  // ── What the question actually wanted. ───────────────────────────────────
  {
    const { cells, labels, spotlight } = board({ asked: true })
    const close_en =
      p.ask === 'single-letter'
        ? `So square A holds ${answer}.`
        : p.ask === 'letters-sum'
          ? `${marks.join(' + ')} = ${values.join(' + ')} = ${answer}.`
          : `${marks.join('')} with ${marks[0]} first is ${answer}.`
    const close_id =
      p.ask === 'single-letter'
        ? `Jadi kotak A berisi ${answer}.`
        : p.ask === 'letters-sum'
          ? `${marks.join(' + ')} = ${values.join(' + ')} = ${answer}.`
          : `${marks.join('')} dengan ${marks[0]} lebih dulu adalah ${answer}.`
    push({
      phase: 'result',
      cells,
      labels,
      spotlight,
      caption: T(close_en, close_id),
      reveal: answer,
      hold: 0,
    })
  }

  return { n: p.n, cageGroups, answer, steps, finalIndex: steps.length - 1 }
}
