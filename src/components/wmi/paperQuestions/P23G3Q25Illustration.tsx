// WMI-23P3A-Q25 (2023 Grade 3 Semifinal, Paper A) — cut the figure into □ squares.
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g3-a-q25.jpg (NOT embedded).
//
// Pixel analysis of the scan recovered the exact shape: a 9-column × 6-row
// rectangle of unit (1×1) squares with the TOP-LEFT cell and the BOTTOM-RIGHT
// cell removed:
//
//   . # # # # # # # #     (row 0: top-left notch)
//   # # # # # # # # #
//   # # # # # # # # #
//   # # # # # # # # #
//   # # # # # # # # #
//   # # # # # # # # .     (row 5: bottom-right notch)
//
// Cell count = 9·6 − 2 = 52 unit squares (matches the stem).
//
// The figure is cut into □ squares of various sizes. Which option canNOT be □?
// A backtracking tiler proved the MINIMUM number of squares needed to cover this
// shape is 10 (e.g. two 4×4 squares, four 2×2 squares, four 1×1 squares). So □
// can be 10, 11, 12, 13, …, 52 — but NOT 9 (too few squares to cover 52 cells of
// this shape). Hence 9 cannot be □ → choice A.
//
// This file draws ONLY the problem: the empty 52-cell shape on a unit grid. It
// shows no tiling and never reveals the answer. Co-exports `SquareShape`, a
// primitive that draws the shape and can overlay a list of coloured squares —
// the explainer uses it to show the 10-square minimum packing.
//
// Pure render — no window/document, no Math.random/Date. SSR-safe + deterministic.

export const COLS = 9
export const ROWS = 6

/** A cell (col, row) is present unless it is one of the two removed corners. */
export function cellPresent(col: number, row: number): boolean {
  if (row === 0 && col === 0) return false // top-left notch
  if (row === ROWS - 1 && col === COLS - 1) return false // bottom-right notch
  return col >= 0 && col < COLS && row >= 0 && row < ROWS
}

// Total unit squares in the figure.
export const UNIT_SQUARES = (() => {
  let n = 0
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (cellPresent(c, r)) n++
  return n
})() // 52

// One VERIFIED minimum tiling: 10 squares (two 4×4, four 2×2, four 1×1).
// Each entry is [col, row, size] with row 0 = top. Backtracking-solver confirmed
// this covers all 52 cells with no overlap and that 10 is the minimum possible.
export type Sq = { col: number; row: number; size: number }
export const MIN_TILING: readonly Sq[] = [
  { col: 1, row: 0, size: 4 },
  { col: 5, row: 0, size: 4 },
  { col: 0, row: 1, size: 1 },
  { col: 0, row: 2, size: 1 },
  { col: 0, row: 3, size: 1 },
  { col: 0, row: 4, size: 2 },
  { col: 2, row: 4, size: 2 },
  { col: 4, row: 4, size: 2 },
  { col: 6, row: 4, size: 2 },
  { col: 8, row: 4, size: 1 },
]

export const MIN_SQUARES = MIN_TILING.length // 10

// ─── geometry / colours ───────────────────────────────────────────────────
const INK = '#1F2937'
const CELL_BG = '#FFFFFF'
const GRID_LINE = '#9CA3AF'

// Distinct fills for the overlaid tiling squares.
const TILE_FILLS: string[] = [
  '#BFDBFE', // blue
  '#FDE68A', // amber
  '#C7F0D8', // teal
  '#DDD6FE', // violet
  '#FBCFE8', // pink
  '#FED7AA', // orange
  '#A7F3D0', // emerald
  '#BAE6FD', // sky
  '#FEF08A', // yellow
  '#E9D5FF', // light purple
  '#FCA5A5', // red
  '#99F6E4', // cyan
  '#D9F99D', // lime
]

const U = 30 // unit-cell pixel size
const PAD = 8

export interface SquareShapeProps {
  /** Squares to overlay (drawn coloured on top of the unit grid). */
  tiles?: readonly Sq[]
  /** How many of `tiles` to actually show (for a step-by-step reveal). */
  shown?: number
  maxWidth?: number
}

/**
 * The 52-cell figure on a unit grid. With `tiles` it overlays coloured squares
 * (the first `shown` of them). The default question figure passes none.
 */
export function SquareShape({ tiles = [], shown, maxWidth = 360 }: SquareShapeProps) {
  const w = COLS * U + PAD * 2
  const h = ROWS * U + PAD * 2
  const px = (c: number) => PAD + c * U
  const py = (r: number) => PAD + r * U
  const nShown = shown === undefined ? tiles.length : Math.max(0, Math.min(tiles.length, shown))

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth }}
      aria-hidden="true"
    >
      {/* present unit cells (white with thin grid lines) */}
      {Array.from({ length: ROWS }).map((_, r) =>
        Array.from({ length: COLS }).map((_, c) =>
          cellPresent(c, r) ? (
            <rect
              key={`u${r}-${c}`}
              x={px(c)}
              y={py(r)}
              width={U}
              height={U}
              fill={CELL_BG}
              stroke={GRID_LINE}
              strokeWidth={1}
            />
          ) : null,
        ),
      )}

      {/* coloured tiling squares (post-answer overlay) */}
      {tiles.slice(0, nShown).map((sq, i) => (
        <rect
          key={`t${i}`}
          x={px(sq.col)}
          y={py(sq.row)}
          width={sq.size * U}
          height={sq.size * U}
          fill={TILE_FILLS[i % TILE_FILLS.length]}
          fillOpacity={0.85}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      ))}

      {/* bold outline of the whole figure (drawn last, on top) */}
      {Array.from({ length: ROWS }).map((_, r) =>
        Array.from({ length: COLS }).map((_, c) => {
          if (!cellPresent(c, r)) return null
          const segs: React.ReactNode[] = []
          const x0 = px(c)
          const y0 = py(r)
          const edge = (k: string, x1: number, y1: number, x2: number, y2: number) => (
            <line key={`${k}${r}-${c}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          )
          if (!cellPresent(c, r - 1)) segs.push(edge('T', x0, y0, x0 + U, y0))
          if (!cellPresent(c, r + 1)) segs.push(edge('B', x0, y0 + U, x0 + U, y0 + U))
          if (!cellPresent(c - 1, r)) segs.push(edge('L', x0, y0, x0, y0 + U))
          if (!cellPresent(c + 1, r)) segs.push(edge('R', x0 + U, y0, x0 + U, y0 + U))
          return segs
        }),
      )}
    </svg>
  )
}

export default function P23G3Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A figure made of 52 unit squares: a 9 by 6 grid with the top-left and bottom-right corner squares removed. It is to be cut exactly into squares of various sizes."
    >
      <SquareShape />
    </div>
  )
}
