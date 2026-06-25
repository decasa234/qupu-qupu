// SEAMO 2022 Paper A Q8 – "How many squares are there altogether?"
//
// Figure: a staircase shape.  The top portion (row 0) has 4 unit cells occupying
// columns 1–4; the lower two rows (rows 1 and 2) are the full 5 columns wide (0–4).
// A 1-step staircase on the upper-left creates the characteristic silhouette seen
// in the scan (docs/reference/ocr-res/seamo/contest/paper-a/2022.imgs/009.jpg).
//
// Adapted from CountSquaresIllustration (WMI-19F1-Q17), which uses the same
// edge-enumeration + highlight approach.  Import the shared Figure component from
// this file in the Explainer.

// ── Grid geometry ────────────────────────────────────────────────────────────────
// Column span 0..4 (5 cols), row span 0..2 (3 rows).
// Grid point (x, y): x = horizontal coordinate, y = vertical coordinate (y=0 top).
// A horizontal unit-edge H(x, y) runs from (x, y) to (x+1, y).
// A vertical   unit-edge V(x, y) runs from (x, y) to (x,   y+1).

// Row 0 cells occupy x ∈ [1,4], so:
//   top    H-edges at y=0: x = 1,2,3,4
//   bottom H-edges at y=1 (shared with row-1 top): x = 0,1,2,3,4  ← full row
//   left   V-edge  at x=1:  y=0
//   inner V-edges at x=2,3,4,5: y=0
// Rows 1–2 cells occupy x ∈ [0,4]:
//   top    H-edges at y=1: x = 0,1,2,3,4  (already listed above)
//   bottom H-edges at y=2: x = 0,1,2,3,4
//   bottom H-edges at y=3: x = 0,1,2,3,4
//   V-edges at x=0: y=1, y=2  (left wall of row-1 and row-2)
//   V-edges at x=1..5: y=0,1,2 (full height)

export const GRID_COLS = 5 // 0..4 column indices
export const GRID_ROWS = 3 // 0..2 row indices

/** Horizontal unit-edges: [x, y] means edge from grid-point (x,y) to (x+1,y). */
export const H_EDGES: ReadonlyArray<[number, number]> = [
  // y=0 (top of row-0 cells): only columns 1–4
  [1, 0], [2, 0], [3, 0], [4, 0],
  // y=1 (bottom of row-0 / top of row-1): full width 0–4
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
  // y=2 (bottom of row-1 / top of row-2): full width
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
  // y=3 (bottom of row-2): full width
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
]

/** Vertical unit-edges: [x, y] means edge from grid-point (x,y) to (x,y+1). */
export const V_EDGES: ReadonlyArray<[number, number]> = [
  // x=0: only rows 1–2 (no cell in row-0, col-0)
  [0, 1], [0, 2],
  // x=1: full height (left wall of row-0 cells, and rows 1–2)
  [1, 0], [1, 1], [1, 2],
  // x=2..5: full height
  [2, 0], [2, 1], [2, 2],
  [3, 0], [3, 1], [3, 2],
  [4, 0], [4, 1], [4, 2],
  [5, 0], [5, 1], [5, 2],
]

// ── Square enumeration ────────────────────────────────────────────────────────────

export interface SquareEntry {
  size: number
  /** Top-left grid corner (in grid-point coordinates). */
  x: number
  y: number
}

const HSET = new Set(H_EDGES.map(([x, y]) => `${x},${y}`))
const VSET = new Set(V_EDGES.map(([x, y]) => `${x},${y}`))

function hasH(x0: number, x1: number, y: number): boolean {
  for (let x = x0; x < x1; x++) if (!HSET.has(`${x},${y}`)) return false
  return true
}
function hasV(y0: number, y1: number, x: number): boolean {
  for (let y = y0; y < y1; y++) if (!VSET.has(`${x},${y}`)) return false
  return true
}

/** Enumerate every axis-aligned square whose four boundary edges are all present. */
export function allSquares(): SquareEntry[] {
  const out: SquareEntry[] = []
  for (let size = 1; size <= Math.max(GRID_COLS, GRID_ROWS); size++) {
    for (let x = 0; x <= GRID_COLS - size; x++) {
      for (let y = 0; y <= GRID_ROWS - size; y++) {
        if (
          hasH(x, x + size, y) &&
          hasH(x, x + size, y + size) &&
          hasV(y, y + size, x) &&
          hasV(y, y + size, x + size)
        ) {
          out.push({ size, x, y })
        }
      }
    }
  }
  return out
}

export const SQUARES = allSquares()
export const SQUARE_TOTAL = SQUARES.length // derived: 24 per official answer

/** Squares grouped by size, ordered smallest-first for the animated tally. */
export const SQUARES_BY_SIZE: { size: number; items: SquareEntry[] }[] = (() => {
  const sizes = Array.from(new Set(SQUARES.map((s) => s.size))).sort((a, b) => a - b)
  return sizes.map((size) => ({ size, items: SQUARES.filter((s) => s.size === size) }))
})()

// ── Rendering constants ───────────────────────────────────────────────────────────

export const VIEW_W = 260
export const VIEW_H = 180
const PAD_X = 20
const PAD_Y = 20
// Each unit cell is square; fit 5 cols in the available horizontal space
export const CELL = (VIEW_W - PAD_X * 2) / GRID_COLS // ~44

const gx = (x: number) => PAD_X + x * CELL
const gy = (y: number) => PAD_Y + y * CELL

// Colour palette: one per square size
const SIZE_COLORS: Record<number, { stroke: string; fill: string }> = {
  1: { stroke: '#2563EB', fill: 'rgba(37,99,235,0.18)' },
  2: { stroke: '#D97706', fill: 'rgba(217,119,6,0.18)' },
  3: { stroke: '#7C3AED', fill: 'rgba(124,58,237,0.18)' },
}
const FALLBACK = { stroke: '#10B981', fill: 'rgba(16,185,129,0.18)' }
export function sizeColor(size: number) {
  return SIZE_COLORS[size] ?? FALLBACK
}

// ── Shared figure component ───────────────────────────────────────────────────────

export interface CountSquares22A8FigureProps {
  /** Highlight every square of this size during the tally animation. */
  highlightSize?: number | null
  /** Highlight one specific square (overrides highlightSize). */
  highlightSquare?: SquareEntry | null
}

export function CountSquares22A8Figure({
  highlightSize = null,
  highlightSquare = null,
}: CountSquares22A8FigureProps) {
  const highlights = highlightSquare
    ? [highlightSquare]
    : highlightSize != null
      ? SQUARES.filter((s) => s.size === highlightSize)
      : []

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Highlighted square fills — drawn beneath the grid lines */}
      {highlights.map((s, i) => {
        const c = sizeColor(s.size)
        return (
          <rect
            key={`hl-${i}`}
            x={gx(s.x)}
            y={gy(s.y)}
            width={s.size * CELL}
            height={s.size * CELL}
            fill={c.fill}
            stroke={c.stroke}
            strokeWidth={3}
            rx={1}
          />
        )
      })}

      {/* Figure: every drawn horizontal edge */}
      {H_EDGES.map(([x, y], i) => (
        <line
          key={`h-${i}`}
          x1={gx(x)}
          y1={gy(y)}
          x2={gx(x + 1)}
          y2={gy(y)}
          stroke="#1F2937"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
      ))}

      {/* Figure: every drawn vertical edge */}
      {V_EDGES.map(([x, y], i) => (
        <line
          key={`v-${i}`}
          x1={gx(x)}
          y1={gy(y)}
          x2={gx(x)}
          y2={gy(y + 1)}
          stroke="#1F2937"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
      ))}
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────────

export default function CountSquares22A8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A staircase-shaped grid of unit squares. Count squares of every size to find the total of ${SQUARE_TOTAL}.`}
    >
      <CountSquares22A8Figure />
    </div>
  )
}
