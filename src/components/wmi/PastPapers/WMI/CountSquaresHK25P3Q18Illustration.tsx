// HKIMO 2025 Primary 3 Heat Q18 – "How many squares are there in the figure below?"
// Answer: 10 (eight 1×1 unit squares + two 2×2 squares).
//
// Figure: a Z-staircase.  Row 0 has 2 unit cells at columns 1–2;
// row 1 has 4 cells at columns 1–4; row 2 has 2 cells at columns 3–4.
// The two 2×2 blocks sit at grid-point corners (x=1,y=0) and (x=3,y=1).
//
// Adapted from CountSquares22A8Illustration (same edge-enumeration + highlight approach).

// ── Grid geometry ────────────────────────────────────────────────────────────
// 5 columns (x 0..5 grid-points), 3 rows (y 0..3 grid-points).
// H(x,y) = horizontal edge from (x,y) to (x+1,y).
// V(x,y) = vertical   edge from (x,y) to (x,  y+1).

export const GRID_COLS = 5
export const GRID_ROWS = 3

/** All horizontal edges present in the figure. */
export const H_EDGES: ReadonlyArray<[number, number]> = [
  // y=0: top of row-0 cells (cols 1–2)
  [1, 0], [2, 0],
  // y=1: bottom of row-0 / top of row-1 (cols 1–4)
  [1, 1], [2, 1], [3, 1], [4, 1],
  // y=2: bottom of row-1 / top of row-2 (cols 1–4)
  [1, 2], [2, 2], [3, 2], [4, 2],
  // y=3: bottom of row-2 cells (cols 3–4)
  [3, 3], [4, 3],
]

/** All vertical edges present in the figure. */
export const V_EDGES: ReadonlyArray<[number, number]> = [
  // x=1: left wall of col-1 cells (rows 0–1)
  [1, 0], [1, 1],
  // x=2: inner wall between col-1 and col-2 (rows 0–1)
  [2, 0], [2, 1],
  // x=3: right wall of col-2 row-0; inner wall col-2/col-3 row-1; left wall col-3 row-2
  [3, 0], [3, 1], [3, 2],
  // x=4: inner wall between col-3 and col-4 (rows 1–2)
  [4, 1], [4, 2],
  // x=5: right wall of col-4 cells (rows 1–2)
  [5, 1], [5, 2],
]

// ── Square enumeration ────────────────────────────────────────────────────────

export interface SquareEntry {
  size: number
  /** Top-left grid-point x-coordinate. */
  x: number
  /** Top-left grid-point y-coordinate. */
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
export const SQUARE_TOTAL = SQUARES.length  // 10

/** Squares grouped by size, smallest first. */
export const SQUARES_BY_SIZE: { size: number; items: SquareEntry[] }[] = (() => {
  const sizes = Array.from(new Set(SQUARES.map((s) => s.size))).sort((a, b) => a - b)
  return sizes.map((size) => ({ size, items: SQUARES.filter((s) => s.size === size) }))
})()

// ── Rendering constants ───────────────────────────────────────────────────────

const VIEW_W = 260
const VIEW_H = 180
const PAD_X  = 20
const PAD_Y  = 20
export const CELL = (VIEW_W - PAD_X * 2) / GRID_COLS  // 44

const gx = (x: number) => PAD_X + x * CELL
const gy = (y: number) => PAD_Y + y * CELL

const SIZE_COLORS: Record<number, { stroke: string; fill: string }> = {
  1: { stroke: '#2563EB', fill: 'rgba(37,99,235,0.18)' },
  2: { stroke: '#D97706', fill: 'rgba(217,119,6,0.18)' },
}
const FALLBACK = { stroke: '#10B981', fill: 'rgba(16,185,129,0.18)' }
export function sizeColor(size: number) {
  return SIZE_COLORS[size] ?? FALLBACK
}

// ── Shared figure component ───────────────────────────────────────────────────

export interface CountSquaresHK25P3Q18FigureProps {
  /** Highlight every square of this size. */
  highlightSize?: number | null
  /** Highlight one specific square (overrides highlightSize). */
  highlightSquare?: SquareEntry | null
}

export function CountSquaresHK25P3Q18Figure({
  highlightSize = null,
  highlightSquare = null,
}: CountSquaresHK25P3Q18FigureProps) {
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

      {/* Figure: horizontal edges */}
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

      {/* Figure: vertical edges */}
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

// ── Default export: stem illustration ────────────────────────────────────────

export default function CountSquaresHK25P3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A Z-staircase grid of unit squares. Count squares of every size — total is ${SQUARE_TOTAL}.`}
    >
      <CountSquaresHK25P3Q18Figure />
    </div>
  )
}
