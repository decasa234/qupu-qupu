// "How many squares of different sizes?" figure for WMI-19F1-Q17.
// Reconstructed exactly from the real figure on a 4x4 grid (see line segments below).
// Squares of all sizes total 15: nine 1x1, four 2x2, one 3x3, one 4x4.
export const GRID_N = 4

// Horizontal unit-edges present: (x, y) = edge from (x,y) to (x+1,y).
export const H_EDGES: ReadonlyArray<[number, number]> = [
  [0, 0], [1, 0], [2, 0], [3, 0], // y=0 full top
  [0, 1], [1, 1], [2, 1], //          y=1 spans x0..x3
  [0, 2], [1, 2], [2, 2], [3, 2], // y=2 full
  [2, 3], [3, 3], //                  y=3 spans x2..x4
  [0, 4], [1, 4], [2, 4], [3, 4], // y=4 full bottom
]

// Vertical unit-edges present: (x, y) = edge from (x,y) to (x,y+1).
export const V_EDGES: ReadonlyArray<[number, number]> = [
  [0, 0], [0, 1], [0, 2], [0, 3], // x=0 full left
  [1, 0], [1, 1], //                 x=1 spans y0..y2
  [2, 0], [2, 1], [2, 2], [2, 3], // x=2 full
  [3, 1], [3, 2], [3, 3], //         x=3 spans y1..y4
  [4, 0], [4, 1], [4, 2], [4, 3], // x=4 full right
]

export interface SquareEntry {
  size: number
  /** Top-left grid corner. */
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

/** Enumerate every axis-aligned square whose four sides are fully drawn. */
export function allSquares(): SquareEntry[] {
  const out: SquareEntry[] = []
  for (let size = 1; size <= GRID_N; size++) {
    for (let x = 0; x <= GRID_N - size; x++) {
      for (let y = 0; y <= GRID_N - size; y++) {
        if (hasH(x, x + size, y) && hasH(x, x + size, y + size) && hasV(y, y + size, x) && hasV(y, y + size, x + size)) {
          out.push({ size, x, y })
        }
      }
    }
  }
  return out
}

export const SQUARES = allSquares()
export const SQUARE_TOTAL = SQUARES.length // 15

/** Squares grouped by size, ordered smallest-first for the tally. */
export const SQUARES_BY_SIZE: { size: number; items: SquareEntry[] }[] = (() => {
  const sizes = Array.from(new Set(SQUARES.map((s) => s.size))).sort((a, b) => a - b)
  return sizes.map((size) => ({ size, items: SQUARES.filter((s) => s.size === size) }))
})()

export const CS_VIEW = 240
const PAD = 20
export const CELL = (CS_VIEW - PAD * 2) / GRID_N

const gx = (x: number) => PAD + x * CELL
const gy = (y: number) => PAD + y * CELL

const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'

// A distinct colour per square size, so each counting iteration reads differently.
const SIZE_COLORS: Record<number, { stroke: string; fill: string }> = {
  1: { stroke: '#2563EB', fill: 'rgba(37,99,235,0.20)' },
  2: { stroke: '#D97706', fill: 'rgba(217,119,6,0.20)' },
  3: { stroke: '#7C3AED', fill: 'rgba(124,58,237,0.20)' },
  4: { stroke: '#DB2777', fill: 'rgba(219,39,114,0.20)' },
}
export function sizeColor(size: number): { stroke: string; fill: string } {
  return SIZE_COLORS[size] ?? { stroke: GREEN, fill: GREEN_FILL }
}

export interface CountSquaresFigureProps {
  /** Highlight every square of this size (the size currently being tallied). */
  highlightSize?: number | null
  /** Highlight one specific square. */
  highlightSquare?: SquareEntry | null
}

export function CountSquaresFigure({ highlightSize = null, highlightSquare = null }: CountSquaresFigureProps) {
  const highlights = highlightSquare
    ? [highlightSquare]
    : highlightSize != null
      ? SQUARES.filter((s) => s.size === highlightSize)
      : []

  return (
    <svg
      viewBox={`0 0 ${CS_VIEW} ${CS_VIEW}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Highlighted squares (drawn under the figure lines), coloured by size */}
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

      {/* Figure: every drawn unit edge */}
      {H_EDGES.map(([x, y], i) => (
        <line key={`h-${i}`} x1={gx(x)} y1={gy(y)} x2={gx(x + 1)} y2={gy(y)} stroke="#1F2937" strokeWidth={2.5} strokeLinecap="square" />
      ))}
      {V_EDGES.map(([x, y], i) => (
        <line key={`v-${i}`} x1={gx(x)} y1={gy(y)} x2={gx(x)} y2={gy(y + 1)} stroke="#1F2937" strokeWidth={2.5} strokeLinecap="square" />
      ))}
    </svg>
  )
}

export default function CountSquaresIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A square divided by lines into smaller regions. Counting squares of every size gives ${SQUARE_TOTAL} in total.`}
    >
      <CountSquaresFigure />
    </div>
  )
}
