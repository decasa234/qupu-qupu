import { triParallelogram, type TriCell } from '../../PastPapers/WMI/primitives/TriLattice'

export type Lang = 'en' | 'id'

export type GridPoint = [number, number]
export type GridLattice = 'square' | 'triangle'
export type GridAsk = 'area' | 'which-largest' | 'which-equals-example'

/**
 * The one place the frontend turns `grid-shaded-area-count` params into numbers.
 *
 * Both the in-card figure and the animated explainer read this, so the shaded
 * polygon on screen and every number spoken about it come from the SAME vertex
 * list. Nothing here is stored in params: `units` is the shoelace area of the
 * region, and the whole/half split is re-derived by clipping that region against
 * each lattice cell — so a figure can never be drawn as one shape and counted
 * as another. (This mirrors api/services/wmi/concepts/grid-shaded-area-count.)
 */

// ── geometry ─────────────────────────────────────────────────────────────────

/** Twice the signed area of a closed polygon, integer in / integer out. */
export function shoelaceTwice(poly: readonly GridPoint[]): number {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    s += x1 * y2 - x2 * y1
  }
  return s
}

/** |shoelace| of one cell: a grid square is 2, a small triangle of the skewed basis is 1. */
const CELL_TWICE: Record<GridLattice, number> = { square: 2, triangle: 1 }

function crossPoint(p1: GridPoint, p2: GridPoint, d1: number, d2: number): GridPoint {
  const den = d1 - d2
  return [
    Math.round((p1[0] * den + d1 * (p2[0] - p1[0])) / den),
    Math.round((p1[1] * den + d1 * (p2[1] - p1[1])) / den),
  ]
}

/** Sutherland–Hodgman clip against a convex cell; the result's area is exact. */
export function clipToConvex(subject: readonly GridPoint[], clip: readonly GridPoint[]): GridPoint[] {
  const orient = shoelaceTwice(clip) >= 0 ? 1 : -1
  let out: GridPoint[] = subject.map((p) => [p[0], p[1]] as GridPoint)
  for (let e = 0; e < clip.length && out.length > 0; e++) {
    const a = clip[e]
    const b = clip[(e + 1) % clip.length]
    const ex = b[0] - a[0]
    const ey = b[1] - a[1]
    const side = (p: GridPoint): number => orient * (ex * (p[1] - a[1]) - ey * (p[0] - a[0]))
    const input = out
    out = []
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i + input.length - 1) % input.length]
      const dCur = side(cur)
      const dPrev = side(prev)
      if (dCur >= 0) {
        if (dPrev < 0) out.push(crossPoint(prev, cur, dPrev, dCur))
        out.push(cur)
      } else if (dPrev >= 0) {
        out.push(crossPoint(prev, cur, dPrev, dCur))
      }
    }
  }
  return out
}

function dedupe(poly: GridPoint[]): GridPoint[] {
  const out: GridPoint[] = []
  for (const p of poly) {
    const last = out[out.length - 1]
    if (last && last[0] === p[0] && last[1] === p[1]) continue
    out.push(p)
  }
  while (out.length > 1) {
    const first = out[0]
    const last = out[out.length - 1]
    if (first[0] === last[0] && first[1] === last[1]) out.pop()
    else break
  }
  return out
}

export interface GridShadedCell {
  /** Corners of the cell itself. */
  frame: GridPoint[]
  /** The shaded piece — the whole cell, or the half the slanting edge leaves. */
  piece: GridPoint[]
  half: boolean
  /** Grid row, top first. */
  row: number
  /** Position in the row, left first. */
  col: number
  /** Triangle lattice only: apex-up? Always false on the square lattice. */
  up: boolean
}

function cellsAround(lattice: GridLattice, poly: readonly GridPoint[]): Omit<GridShadedCell, 'piece' | 'half'>[] {
  const xs = poly.map((p) => p[0])
  const ys = poly.map((p) => p[1])
  const out: Omit<GridShadedCell, 'piece' | 'half'>[] = []
  for (let b = Math.min(...ys); b < Math.max(...ys); b++) {
    for (let a = Math.min(...xs); a < Math.max(...xs); a++) {
      if (lattice === 'square') {
        out.push({ frame: [[a, b], [a + 1, b], [a + 1, b + 1], [a, b + 1]], row: b, col: a, up: false })
        continue
      }
      out.push({ frame: [[a, b], [a + 1, b], [a, b + 1]], row: b, col: a * 2, up: false })
      out.push({ frame: [[a + 1, b], [a, b + 1], [a + 1, b + 1]], row: b, col: a * 2 + 1, up: true })
    }
  }
  return out
}

/** The cells the region shades, in reading order (top row first, left first). */
export function shadedCells(lattice: GridLattice, poly: readonly GridPoint[]): GridShadedCell[] {
  const cellTwice = CELL_TWICE[lattice]
  const out: GridShadedCell[] = []
  for (const cell of cellsAround(lattice, poly)) {
    const piece = clipToConvex(poly, cell.frame)
    if (piece.length < 3) continue
    const covered = Math.abs(shoelaceTwice(piece))
    if (covered === cellTwice) out.push({ ...cell, piece: cell.frame, half: false })
    else if (covered * 2 === cellTwice) out.push({ ...cell, piece: dedupe(piece), half: true })
  }
  return out.sort((x, y) => x.row - y.row || x.col - y.col)
}

// ── the view both the figure and the animation read ──────────────────────────

export interface GridFigureView {
  /** 'A' | 'B' | 'C' for an option, null for the lone shape or the example. */
  label: string | null
  isExample: boolean
  verts: GridPoint[]
  cells: GridShadedCell[]
  whole: GridShadedCell[]
  halves: GridShadedCell[]
  /** Whole cells grouped by row, top first — the order the count walks in. */
  wholeRows: { row: number; cells: GridShadedCell[] }[]
  /** Grid cells covered: whole + halves / 2. */
  units: number
  /** Area in cm². */
  value: number
  /** Columns and rows of lattice drawn behind the figure (margin included). */
  cols: number
  rows: number
  /** Top-left lattice cell of that field — negative when a margin is drawn. */
  originA: number
  originB: number
  /** Triangle lattice only: the field to hand to `<TriLattice cells={…} />`. */
  triCells: TriCell[]
}

export interface GridShadedView {
  lattice: GridLattice
  unitValue: number
  ask: GridAsk
  figures: GridFigureView[]
  example: GridFigureView | null
  options: GridFigureView[]
  /** The figure the answer is about. */
  target: GridFigureView
  answerLabel: string | null
  anyHalves: boolean
}

const LABELS = ['A', 'B', 'C']

/** A 4×3 rectangle with one corner sliced — used when params are unusable. */
const FALLBACK_VERTS: GridPoint[] = [[2, 0], [4, 0], [4, 3], [0, 3], [0, 2]]

function toVerts(raw: unknown): GridPoint[] {
  if (!Array.isArray(raw)) return []
  const out: GridPoint[] = []
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) continue
    const x = Number(item[0])
    const y = Number(item[1])
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    out.push([Math.round(x), Math.round(y)])
  }
  return out
}

function buildFigure(
  lattice: GridLattice,
  verts: GridPoint[],
  unitValue: number,
  margin: number,
  label: string | null,
  isExample: boolean,
): GridFigureView {
  const cells = shadedCells(lattice, verts)
  const whole = cells.filter((c) => !c.half)
  const halves = cells.filter((c) => c.half)
  const perRow = new Map<number, GridShadedCell[]>()
  for (const cell of whole) {
    const list = perRow.get(cell.row)
    if (list) list.push(cell)
    else perRow.set(cell.row, [cell])
  }
  const spanA = Math.max(...verts.map((p) => p[0]))
  const spanB = Math.max(...verts.map((p) => p[1]))
  const cols = spanA + margin * 2
  const rows = spanB + margin * 2
  return {
    label,
    isExample,
    verts,
    cells,
    whole,
    halves,
    wholeRows: [...perRow.entries()].sort((a, b) => a[0] - b[0]).map(([row, group]) => ({ row, cells: group })),
    units: whole.length + halves.length / 2,
    value: (whole.length + halves.length / 2) * unitValue,
    cols,
    rows,
    originA: -margin,
    originB: -margin,
    triCells: lattice === 'triangle' ? triParallelogram(cols, rows, -margin, -margin) : [],
  }
}

export function readGridShadedParams(raw: unknown): GridShadedView {
  const p = (raw ?? {}) as Record<string, unknown>
  const lattice: GridLattice = p.lattice === 'triangle' ? 'triangle' : 'square'
  const askRaw = p.ask
  const ask: GridAsk =
    askRaw === 'which-largest' || askRaw === 'which-equals-example' ? askRaw : 'area'
  const unitRaw = Number(p.unitValue)
  const unitValue = Number.isFinite(unitRaw) && unitRaw > 0 ? Math.round(unitRaw) : 1

  const rawFigures = Array.isArray(p.figures) ? p.figures : []
  let polys = rawFigures
    .map((f) => toVerts((f as { verts?: unknown } | null)?.verts))
    .filter((verts) => verts.length >= 3 && shadedCells(lattice, verts).length > 0)
  if (polys.length === 0) polys = [FALLBACK_VERTS]

  // A comparison the picture cannot actually show (an option went missing) falls
  // back to plain "how big is this one", so the panel always has something honest.
  const needed = ask === 'area' ? 1 : ask === 'which-largest' ? 3 : 4
  const effectiveAsk: GridAsk = polys.length >= needed ? ask : 'area'
  if (effectiveAsk === 'area') polys = polys.slice(0, 1)

  const margin = effectiveAsk === 'area' ? 1 : 0
  const exampleCount = effectiveAsk === 'which-equals-example' ? 1 : 0
  const figures = polys.slice(0, needed).map((verts, i) =>
    buildFigure(
      lattice,
      verts,
      unitValue,
      margin,
      i < exampleCount || effectiveAsk === 'area' ? null : LABELS[i - exampleCount] ?? null,
      i < exampleCount,
    ),
  )

  const example = exampleCount === 1 ? figures[0] : null
  const options = figures.filter((f) => f.label !== null)

  let target = figures[0]
  let answerLabel: string | null = null
  if (effectiveAsk === 'which-largest' && options.length > 0) {
    target = options.reduce((top, next) => (next.units > top.units ? next : top))
    answerLabel = target.label
  } else if (effectiveAsk === 'which-equals-example' && example && options.length > 0) {
    target = options.find((o) => o.units === example.units) ?? options[0]
    answerLabel = target.label
  }

  return {
    lattice,
    unitValue,
    ask: effectiveAsk,
    figures,
    example,
    options,
    target,
    answerLabel,
    anyHalves: figures.some((f) => f.halves.length > 0),
  }
}

// ── storyboard ───────────────────────────────────────────────────────────────

export interface GridShadedStep {
  /** Which figure the beat is counting. */
  focus: number
  /** How many of that figure's whole-cell rows are lit. */
  rowsLit: number
  /** True once the half cells of the focused figure are lit too. */
  halvesLit: boolean
  /** Figures whose tally badge is already on screen. */
  tallied: number[]
  /** Index of the figure crowned on the final beat, or null. */
  winner: number | null
  caption: string
  /** ms to hold this beat when playing (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface GridShadedStoryboard {
  view: GridShadedView
  steps: GridShadedStep[]
  finalIndex: number
}

function noun(lattice: GridLattice, lang: Lang): string {
  if (lang === 'id') return lattice === 'square' ? 'kotak' : 'segitiga'
  return lattice === 'square' ? 'square' : 'triangle'
}

/**
 * The count a child can follow with a finger: read what one cell is worth, walk
 * the whole cells row by row with the running total on screen, pair the halves
 * up, and only then turn cells into cm². For the comparison asks each figure is
 * counted in full before any of them is picked, so the winner is the end of the
 * counting rather than a claim.
 */
export function buildGridShadedAreaCountSteps(raw: unknown, lang: Lang): GridShadedStoryboard {
  const view = readGridShadedParams(raw)
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)
  const cell = noun(view.lattice, lang)
  const steps: GridShadedStep[] = []

  steps.push({
    focus: 0,
    rowsLit: 0,
    halvesLit: false,
    tallied: [],
    winner: null,
    caption: view.anyHalves
      ? t(
          `A full ${cell} counts 1, a ${cell} cut corner to corner counts ½`,
          `${cell === 'kotak' ? 'Kotak' : 'Segitiga'} penuh bernilai 1, yang terpotong miring bernilai ½`,
        )
      : t(
          `Each small ${cell} of the grid is ${view.unitValue} cm²`,
          `Setiap ${cell} kecil pada petak bernilai ${view.unitValue} cm²`,
        ),
    hold: 1600,
    result: false,
  })

  if (view.ask === 'area') {
    const f = view.target
    let running = 0
    f.wholeRows.forEach((row, i) => {
      running += row.cells.length
      steps.push({
        focus: 0,
        rowsLit: i + 1,
        halvesLit: false,
        tallied: [],
        winner: null,
        caption: t(
          `Row ${row.row + 1}: ${row.cells.length} whole — ${running} so far`,
          `Baris ${row.row + 1}: ${row.cells.length} utuh — jadi ${running}`,
        ),
        hold: i === f.wholeRows.length - 1 ? 1500 : 1150,
        result: false,
      })
    })

    if (f.halves.length > 0) {
      const pairs = f.halves.length / 2
      steps.push({
        focus: 0,
        rowsLit: f.wholeRows.length,
        halvesLit: true,
        tallied: [],
        winner: null,
        caption: t(
          `${f.halves.length} halves pair into ${pairs} whole: ${f.whole.length} + ${pairs} = ${f.units}`,
          `${f.halves.length} setengah jadi ${pairs} utuh: ${f.whole.length} + ${pairs} = ${f.units}`,
        ),
        hold: 1700,
        result: false,
      })
    }

    steps.push({
      focus: 0,
      rowsLit: f.wholeRows.length,
      halvesLit: true,
      tallied: [0],
      winner: null,
      caption:
        view.unitValue === 1
          ? t(`${f.units} ${cell}s × 1 cm² = ${f.value} cm²`, `${f.units} ${cell} × 1 cm² = ${f.value} cm²`)
          : t(
              `${f.units} × ${view.unitValue} cm² = ${f.value} cm²`,
              `${f.units} × ${view.unitValue} cm² = ${f.value} cm²`,
            ),
      hold: 0,
      result: true,
    })

    return { view, steps, finalIndex: steps.length - 1 }
  }

  // Comparison asks: count every figure in full, one beat each, then compare.
  const tallied: number[] = []
  view.figures.forEach((f, i) => {
    const name = f.isExample ? t('The example', 'Bentuk contoh') : (f.label ?? '')
    tallied.push(i)
    steps.push({
      focus: i,
      rowsLit: f.wholeRows.length,
      halvesLit: true,
      tallied: [...tallied],
      winner: null,
      caption:
        f.halves.length > 0
          ? t(
              `${name}: ${f.whole.length} whole + ${f.halves.length} halves = ${f.units}`,
              `${name}: ${f.whole.length} utuh + ${f.halves.length} setengah = ${f.units}`,
            )
          : t(`${name}: ${f.whole.length} whole = ${f.units}`, `${name}: ${f.whole.length} utuh = ${f.units}`),
      hold: 1500,
      result: false,
    })
  })

  const winner = view.figures.findIndex((f) => f.label === view.answerLabel)
  const counts = view.options.map((o) => o.units).join(', ')
  steps.push({
    focus: winner < 0 ? 0 : winner,
    rowsLit: view.target.wholeRows.length,
    halvesLit: true,
    tallied: [...tallied],
    winner: winner < 0 ? null : winner,
    caption:
      view.ask === 'which-largest'
        ? t(
            `${counts} — the biggest is ${view.target.units}, so ${view.answerLabel}`,
            `${counts} — terbesar ${view.target.units}, jadi ${view.answerLabel}`,
          )
        : t(
            `Only ${view.answerLabel} lands on ${view.target.units}, like the example`,
            `Hanya ${view.answerLabel} yang tepat ${view.target.units}, sama seperti contoh`,
          ),
    hold: 0,
    result: true,
  })

  return { view, steps, finalIndex: steps.length - 1 }
}
