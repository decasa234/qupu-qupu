// "How many squares of every size?" figure for WMI-19F2A-Q17.
//
// The scan (2019-final-g2-a-q20-companion q17) shows a complete 4x4 square (drawn as a
// diamond) with an interior "staircase" notch — two short interior segments are missing
// near the centre. We reconstruct it cleanly AXIS-ALIGNED (clearer for Grade-2 kids) with
// the same complete outer boundary + central staircase notch.
//
// Squares of every size total exactly 18:
//   1x1: 12, 2x2: 3, 3x3: 2, 4x4: 1  →  12 + 3 + 2 + 1 = 18.
// The two missing interior horizontal edges are H(1,1) and H(2,2); every other unit edge
// of the 4x4 grid is drawn (outer boundary fully intact). See allSquares() below — the
// count is derived, not asserted.
export const GRID_N = 4

// Horizontal unit-edges present: (x, y) = edge from (x,y) to (x+1,y).
export const H_EDGES: ReadonlyArray<[number, number]> = [
  [0, 0], [1, 0], [2, 0], [3, 0], // y=0 full top
  [0, 1], [2, 1], [3, 1], //          y=1 — (1,1) missing (notch)
  [0, 2], [1, 2], [3, 2], //          y=2 — (2,2) missing (notch)
  [0, 3], [1, 3], [2, 3], [3, 3], // y=3 full
  [0, 4], [1, 4], [2, 4], [3, 4], // y=4 full bottom
]

// Vertical unit-edges present: (x, y) = edge from (x,y) to (x,y+1). All present (full grid).
export const V_EDGES: ReadonlyArray<[number, number]> = [
  [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 0], [2, 1], [2, 2], [2, 3],
  [3, 0], [3, 1], [3, 2], [3, 3],
  [4, 0], [4, 1], [4, 2], [4, 3],
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
export const SQUARE_TOTAL = SQUARES.length // 18

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

export interface CountSquaresG2FigureProps {
  /** Highlight every square of this size (the size currently being tallied). */
  highlightSize?: number | null
  /** Highlight one specific square. */
  highlightSquare?: SquareEntry | null
}

export function CountSquaresG2Figure({ highlightSize = null, highlightSquare = null }: CountSquaresG2FigureProps) {
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
      {/* Highlighted square fills, under the grid lines */}
      {highlights.map((s, i) => (
        <rect key={`fill-${i}`} x={gx(s.x)} y={gy(s.y)} width={s.size * CELL} height={s.size * CELL} fill={GREEN_FILL} rx={1} />
      ))}

      {/* Figure: every drawn unit edge */}
      {H_EDGES.map(([x, y], i) => (
        <line key={`h-${i}`} x1={gx(x)} y1={gy(y)} x2={gx(x + 1)} y2={gy(y)} stroke="#1F2937" strokeWidth={2.5} strokeLinecap="square" />
      ))}
      {V_EDGES.map(([x, y], i) => (
        <line key={`v-${i}`} x1={gx(x)} y1={gy(y)} x2={gx(x)} y2={gy(y + 1)} stroke="#1F2937" strokeWidth={2.5} strokeLinecap="square" />
      ))}

      {/* Highlighted square borders, drawn ON TOP of the grid so they stand out */}
      {highlights.map((s, i) => (
        <rect
          key={`bd-${i}`}
          x={gx(s.x)}
          y={gy(s.y)}
          width={s.size * CELL}
          height={s.size * CELL}
          fill="none"
          stroke={GREEN}
          strokeWidth={4}
          rx={1}
        />
      ))}
    </svg>
  )
}

export default function CountSquaresG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A large square divided by lines into smaller regions with a staircase notch. Counting squares of every size gives ${SQUARE_TOTAL} in total.`}
    >
      <CountSquaresG2Figure />
    </div>
  )
}
