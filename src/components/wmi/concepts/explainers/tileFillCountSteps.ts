export type Lang = 'en' | 'id'

export type TileFillCell = [number, number]
export type TileFillTile = 'unit-square' | 'half-square-triangle'
export type TileFillAsk = 'total' | 'how-many-more' | 'fewest-to-complete'

/**
 * The one place the frontend turns `tile-fill-count` params into numbers.
 *
 * Both the in-card figure and the animated explainer read this, so the drawn
 * squares and every number spoken about them come from the SAME cell list. There
 * is no count stored in params to contradict the picture — `squares` is
 * `target.length`, full stop, and `tiles` is that times 1 or 2 depending only on
 * the tile's name.
 */
export interface TileFillView {
  tile: TileFillTile
  ask: TileFillAsk
  /** The whole shape, reading order (top-left first). */
  cells: TileFillCell[]
  /** Squares already covered (a subset of `cells`). */
  filled: TileFillCell[]
  /** Squares of the shape nobody has covered yet. */
  empty: TileFillCell[]
  /** Side of the smallest square the shape fits inside. */
  boxSide: number
  /** Squares of that box the shape does not reach. */
  holes: TileFillCell[]
  /** Drawn underneath: the big square for fewest-to-complete, else the shape. */
  base: TileFillCell[]
  /** Painted on top of `base`: the covered part, or the shape inside its box. */
  overlay: TileFillCell[]
  /** THE squares the question is about — the ones the animation counts. */
  target: TileFillCell[]
  /** `target` grouped by row, top row first. */
  targetRows: { row: number; cells: TileFillCell[] }[]
  /** 1 for a square tile, 2 for a half-square triangle. */
  perSquare: number
  squares: number
  tiles: number
}

const key = (cell: TileFillCell): string => `${cell[0]},${cell[1]}`
const readingOrder = (a: TileFillCell, b: TileFillCell): number => a[0] - b[0] || a[1] - b[1]

/** A 2-by-3 rectangle of square tiles — the shape used when params are unusable. */
const FALLBACK_CELLS: TileFillCell[] = [
  [0, 0], [0, 1],
  [1, 0], [1, 1],
  [2, 0], [2, 1],
]

function toCells(raw: unknown): TileFillCell[] {
  if (!Array.isArray(raw)) return []
  const out: TileFillCell[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) continue
    const r = Number(item[0])
    const c = Number(item[1])
    if (!Number.isFinite(r) || !Number.isFinite(c)) continue
    const cell: TileFillCell = [Math.round(r), Math.round(c)]
    const k = key(cell)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(cell)
  }
  return out.sort(readingOrder)
}

/** Re-anchors a cell list so its top row is 0 and its left column is 0. */
function normalise(cells: TileFillCell[]): TileFillCell[] {
  if (cells.length === 0) return []
  const minR = Math.min(...cells.map(([r]) => r))
  const minC = Math.min(...cells.map(([, c]) => c))
  return cells.map(([r, c]) => [r - minR, c - minC] as TileFillCell).sort(readingOrder)
}

export function groupTileRows(cells: TileFillCell[]): { row: number; cells: TileFillCell[] }[] {
  const perRow = new Map<number, TileFillCell[]>()
  for (const cell of cells) {
    const list = perRow.get(cell[0])
    if (list) list.push(cell)
    else perRow.set(cell[0], [cell])
  }
  return [...perRow.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([row, group]) => ({ row, cells: [...group].sort(readingOrder) }))
}

export function readTileFillParams(raw: unknown): TileFillView {
  const p = (raw ?? {}) as Record<string, unknown>

  const tile: TileFillTile = p.tile === 'half-square-triangle' ? 'half-square-triangle' : 'unit-square'
  const askRaw = p.ask
  const ask: TileFillAsk =
    askRaw === 'how-many-more' || askRaw === 'fewest-to-complete' ? askRaw : 'total'

  const parsed = toCells(p.cells)
  const cells = normalise(parsed.length >= 2 ? parsed : FALLBACK_CELLS)
  const inShape = new Set(cells.map(key))

  // Covered squares are only meaningful when they are squares of the shape, and
  // the same re-anchoring has to be applied to them or they would drift.
  const minR = parsed.length >= 2 ? Math.min(...parsed.map(([r]) => r)) : 0
  const minC = parsed.length >= 2 ? Math.min(...parsed.map(([, c]) => c)) : 0
  const filled = toCells(p.filled)
    .map(([r, c]) => [r - minR, c - minC] as TileFillCell)
    .filter((cell) => inShape.has(key(cell)))
  const filledSet = new Set(filled.map(key))
  const empty = cells.filter((cell) => !filledSet.has(key(cell)))

  const boxSide = Math.max(
    Math.max(...cells.map(([r]) => r)) + 1,
    Math.max(...cells.map(([, c]) => c)) + 1,
  )
  const box: TileFillCell[] = []
  for (let r = 0; r < boxSide; r++) for (let c = 0; c < boxSide; c++) box.push([r, c])
  const holes = box.filter((cell) => !inShape.has(key(cell)))

  // A how-many-more picture with nothing left to do, or a grow-into-a-square
  // picture with no holes, would animate an empty count; fall back to the plain
  // total so the panel always has something honest to show.
  const usable = ask === 'how-many-more' ? empty.length > 0 : ask === 'fewest-to-complete' ? holes.length > 0 : true
  const effectiveAsk: TileFillAsk = usable ? ask : 'total'

  const target =
    effectiveAsk === 'total' ? cells : effectiveAsk === 'how-many-more' ? empty : holes
  const perSquare = tile === 'half-square-triangle' ? 2 : 1

  return {
    tile,
    ask: effectiveAsk,
    cells,
    filled,
    empty,
    boxSide,
    holes,
    base: effectiveAsk === 'fewest-to-complete' ? box : cells,
    overlay: effectiveAsk === 'fewest-to-complete' ? cells : effectiveAsk === 'how-many-more' ? filled : [],
    target,
    targetRows: groupTileRows(target),
    perSquare,
    squares: target.length,
    tiles: target.length * perSquare,
  }
}

export interface TileFillStep {
  /** How many rows of `targetRows` have been counted when this beat is on screen. */
  rowsCounted: number
  /** Running square total after those rows. */
  running: number
  /** True on the beat that lays two triangles on every counted square. */
  doubling: boolean
  caption: string
  /** ms to hold this beat when playing (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface TileFillStoryboard {
  view: TileFillView
  steps: TileFillStep[]
  finalIndex: number
}

/**
 * A count the child can follow with a finger: read the tile, decide which
 * squares are in play, then reveal them one ROW at a time with the running
 * total on screen. The answer only appears on the last beat, and only as the
 * end of that running total (doubled first, when the tile is a triangle).
 */
export function buildTileFillCountSteps(raw: unknown, lang: Lang): TileFillStoryboard {
  const view = readTileFillParams(raw)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: TileFillStep[] = []

  steps.push({
    rowsCounted: 0,
    running: 0,
    doubling: false,
    caption:
      view.tile === 'half-square-triangle'
        ? t('One tile is half a square — 2 tiles make 1 square', 'Satu keping setengah kotak — 2 keping jadi 1 kotak')
        : t('One tile covers exactly 1 square', 'Satu keping menutup tepat 1 kotak'),
    hold: 1500,
    result: false,
  })

  if (view.ask === 'how-many-more') {
    steps.push({
      rowsCounted: 0,
      running: 0,
      doubling: false,
      caption: t(
        `${view.filled.length} squares are already covered — count only the white ones`,
        `${view.filled.length} kotak sudah tertutup — hitung yang putih saja`,
      ),
      hold: 1600,
      result: false,
    })
  } else if (view.ask === 'fewest-to-complete') {
    steps.push({
      rowsCounted: 0,
      running: 0,
      doubling: false,
      caption: t(
        `${view.boxSide} across and ${view.boxSide} down — the smallest square is ${view.boxSide} by ${view.boxSide}`,
        `${view.boxSide} ke samping, ${view.boxSide} ke bawah — persegi terkecil ${view.boxSide} kali ${view.boxSide}`,
      ),
      hold: 1700,
      result: false,
    })
  }

  let running = 0
  view.targetRows.forEach((row, i) => {
    running += row.cells.length
    const last = i === view.targetRows.length - 1
    steps.push({
      rowsCounted: i + 1,
      running,
      doubling: false,
      caption: t(
        `Row ${row.row + 1}: ${row.cells.length} more — ${running} squares so far`,
        `Baris ${row.row + 1}: tambah ${row.cells.length} — jadi ${running} kotak`,
      ),
      hold: last ? 1600 : 1200,
      result: false,
    })
  })

  if (view.ask === 'how-many-more') {
    steps.push({
      rowsCounted: view.targetRows.length,
      running: view.squares,
      doubling: false,
      caption: t(
        `Check: ${view.cells.length} − ${view.filled.length} = ${view.squares} squares`,
        `Cek: ${view.cells.length} − ${view.filled.length} = ${view.squares} kotak`,
      ),
      hold: 1600,
      result: false,
    })
  }

  if (view.tile === 'half-square-triangle') {
    steps.push({
      rowsCounted: view.targetRows.length,
      running: view.squares,
      doubling: true,
      caption: t(
        `2 tiles on each square: ${view.squares} + ${view.squares} = ${view.tiles} tiles`,
        `2 keping tiap kotak: ${view.squares} + ${view.squares} = ${view.tiles} keping`,
      ),
      hold: 0,
      result: true,
    })
  } else {
    steps.push({
      rowsCounted: view.targetRows.length,
      running: view.squares,
      doubling: false,
      caption: t(
        `${view.squares} squares, 1 tile each — ${view.tiles} tiles`,
        `${view.squares} kotak, 1 keping tiap kotak — ${view.tiles} keping`,
      ),
      hold: 0,
      result: true,
    })
  }

  return { view, steps, finalIndex: steps.length - 1 }
}
