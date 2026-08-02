import { GridBoard, gridBoardViewBox } from '../../PastPapers/WMI/primitives/GridBoard'

// In-card figure for `row-column-sum-grid`. The stem states the rule; this
// picture carries the evidence — which numbers are printed in which squares,
// which squares are covered, and which line totals the paper gives away. That
// split is how the WMI papers this concept is mined from present it.
//
// It must NEVER print a covered square's number, not in the grid and not in the
// aria-label: the covers are the whole puzzle. Row and column totals ARE printed
// evidence and are stated freely.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time. Geometry is entirely GridBoard's; this file
// only decides what goes in each square.

/** Mirrors SYMBOLS in api/services/wmi/concepts/row-column-sum-grid. */
const SYMBOLS = ['★', '●', '◆']

const AMBER_SOFT = '#FFF3D4'

interface Cell {
  r: number
  c: number
}

interface Params {
  rows: number
  cols: number
  grid: number[][]
  hidden: Cell[]
  rowSumShown: boolean[]
  colSumShown: boolean[]
}

const FALLBACK: Params = {
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
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

/**
 * Params arrive as `unknown` from the DB, so every field is re-derived and
 * clamped. Anything that does not add up falls back whole rather than in
 * pieces — a half-read grid would draw a puzzle nobody set.
 */
function read(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const rows = Math.max(2, Math.min(3, int(p.rows, 0)))
  const cols = Math.max(2, Math.min(3, int(p.cols, 0)))
  if (!Array.isArray(p.grid) || p.grid.length !== rows) return FALLBACK
  const grid = p.grid.map((row) =>
    Array.isArray(row) ? row.map((v) => Math.max(0, Math.min(99, int(v, 0)))) : [],
  )
  if (grid.some((row) => row.length !== cols)) return FALLBACK

  const hidden = (Array.isArray(p.hidden) ? p.hidden : [])
    .map((h) => ({ r: int((h as Cell)?.r, -1), c: int((h as Cell)?.c, -1) }))
    .filter((h) => h.r >= 0 && h.r < rows && h.c >= 0 && h.c < cols)
    .slice(0, SYMBOLS.length)
  if (hidden.length === 0) return FALLBACK

  const flags = (v: unknown, len: number): boolean[] =>
    Array.isArray(v) && v.length === len ? v.map(Boolean) : new Array(len).fill(false)
  const rowSumShown = flags(p.rowSumShown, rows)
  const colSumShown = flags(p.colSumShown, cols)
  if (!rowSumShown.some(Boolean) && !colSumShown.some(Boolean)) return FALLBACK

  return { rows, cols, grid, hidden, rowSumShown, colSumShown }
}

const rowTotal = (p: Params, r: number): number => p.grid[r].reduce((s, v) => s + v, 0)
const colTotal = (p: Params, c: number): number => p.grid.reduce((s, row) => s + row[c], 0)

export default function RowColumnSumGridIllustration({ params }: { params: unknown }) {
  const p = read(params)
  const cover = new Map(p.hidden.map((h, i) => [`${h.r},${h.c}`, SYMBOLS[i]]))
  const cellSize = p.cols === 3 ? 52 : 58

  const rowSums = p.rowSumShown.some(Boolean)
    ? p.rowSumShown.map((on, r) => (on ? String(rowTotal(p, r)) : ''))
    : undefined
  const colSums = p.colSumShown.some(Boolean)
    ? p.colSumShown.map((on, c) => (on ? String(colTotal(p, c)) : ''))
    : undefined

  const viewBox = gridBoardViewBox(p.rows, p.cols, cellSize, rowSums, colSums)
  const width = p.cols * cellSize + (rowSums ? Math.round(cellSize * 0.6) * 2 : 0)

  // The label speaks only what is printed on the page. A covered square is
  // announced as covered; its number is never mentioned.
  const rowSpeech = Array.from({ length: p.rows }, (_, r) => {
    const squares = Array.from({ length: p.cols }, (__, c) => {
      const glyph = cover.get(`${r},${c}`)
      return glyph ? `kotak tertutup ${glyph}` : String(p.grid[r][c])
    })
    return `baris ke-${r + 1} berisi ${squares.join(', ')}`
  }).join('; ')
  const totalSpeech = [
    ...p.rowSumShown.map((on, r) => (on ? `jumlah baris ke-${r + 1} tertulis ${rowTotal(p, r)}` : null)),
    ...p.colSumShown.map((on, c) => (on ? `jumlah kolom ke-${c + 1} tertulis ${colTotal(p, c)}` : null)),
  ].filter((x): x is string => x !== null)
  const ariaLabel = `Kisi ${p.rows} kali ${p.cols}: ${rowSpeech}. ${totalSpeech.join('; ')}.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={viewBox} width="100%" style={{ maxWidth: width * 1.5 }}>
        <GridBoard
          rows={p.rows}
          cols={p.cols}
          cellSize={cellSize}
          label={(r, c) => cover.get(`${r},${c}`) ?? String(p.grid[r][c])}
          highlight={(r, c) => (cover.has(`${r},${c}`) ? 'amber' : 'none')}
          rowSums={rowSums}
          colSums={colSums}
        />
        {/* A hairline under the totals gutter, so the numbers outside the grid
            read as annotations rather than as another row of squares. */}
        {rowSums && (
          <line
            x1={p.cols * cellSize + 4}
            y1={0}
            x2={p.cols * cellSize + 4}
            y2={p.rows * cellSize}
            stroke={AMBER_SOFT}
            strokeWidth={3}
          />
        )}
      </svg>
    </div>
  )
}
