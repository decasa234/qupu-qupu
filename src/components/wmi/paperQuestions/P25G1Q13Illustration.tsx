// WMI-25P1A-Q13 (2025 Grade 1 Semifinal, Paper A) — "The figure is made of
// several squares. Keeping it unchanged, find the MINIMUM number of such squares
// to add to form a large square."  Answer: 9 (choice E).
//
// Redrawn from db/seed/wmi/figures/2025-semifinal-g1-a-q13.jpg: a staircase /
// L-shape of equal unit squares —
//   • bottom row: 4 squares
//   • middle row: 2 squares (left-aligned)
//   • top:        1 square  (leftmost column)
//   = 7 unit squares.
// The smallest big square that contains this shape is 4×4 = 16 squares
// (its bounding box is 4 wide × 3 tall, so the side must be 4).
//   squares to add = 16 − 7 = 9   (not shown in the static figure).
//
// Coordinates use (col, row) with row 0 at the BOTTOM.
// SSR-safe + deterministic: no window/document at module top, no Math.random,
// no Date.now.

export const Q13_GRID_SIDE = 4 // the enclosing big square is 4×4

// The original figure's filled cells (col, row), row 0 = bottom.
export const Q13_FILLED: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0], // bottom row of 4
  [0, 1],
  [1, 1], // middle row of 2
  [0, 2], // top single
]
export const Q13_USED = Q13_FILLED.length // 7
export const Q13_BIG_TOTAL = Q13_GRID_SIDE * Q13_GRID_SIDE // 16
export const Q13_TO_ADD = Q13_BIG_TOTAL - Q13_USED // 9

// ----- layout -----
const CELL = 56
const PAD = 24
export const Q13_VIEW_W = Q13_GRID_SIDE * CELL + PAD * 2
export const Q13_VIEW_H = Q13_GRID_SIDE * CELL + PAD * 2

const FILL = '#FBDAD8' // pink, matching the original
const FILL_STROKE = '#3A3A3A'
const GHOST_FILL = 'rgba(45, 49, 146, 0.10)'
const GHOST_STROKE = '#2E3192'

function cellKey(c: number, r: number) {
  return `${c},${r}`
}

const FILLED_SET = new Set(Q13_FILLED.map(([c, r]) => cellKey(c, r)))

// All cells of the big 4×4 square that are NOT in the original figure → the ones
// to add.
export const Q13_TO_ADD_CELLS: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = []
  for (let r = 0; r < Q13_GRID_SIDE; r++) {
    for (let c = 0; c < Q13_GRID_SIDE; c++) {
      if (!FILLED_SET.has(cellKey(c, r))) out.push([c, r])
    }
  }
  return out
})()

// Convert a (col,row) — row 0 bottom — to the SVG top-left x/y of that cell.
function cellXY(c: number, r: number): { x: number; y: number } {
  const x = PAD + c * CELL
  const y = PAD + (Q13_GRID_SIDE - 1 - r) * CELL
  return { x, y }
}

export interface Q13GridProps {
  /** Show the dashed outline of the full 4×4 big square. */
  showBigOutline?: boolean
  /** Show the ghost cells that must be added to complete the big square. */
  showGhosts?: boolean
  /** Number the original filled cells 1..7 (used to count what's already there). */
  numberFilled?: boolean
  /** Number the ghost cells 1..9 (used to count what's added). */
  numberGhosts?: boolean
}

export function Q13Grid({
  showBigOutline = false,
  showGhosts = false,
  numberFilled = false,
  numberGhosts = false,
}: Q13GridProps) {
  return (
    <svg
      viewBox={`0 0 ${Q13_VIEW_W} ${Q13_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* big-square dashed outline */}
      {showBigOutline && (
        <rect
          x={PAD}
          y={PAD}
          width={Q13_GRID_SIDE * CELL}
          height={Q13_GRID_SIDE * CELL}
          fill="none"
          stroke={GHOST_STROKE}
          strokeWidth={3}
          strokeDasharray="7 5"
        />
      )}

      {/* ghost (to-add) cells */}
      {showGhosts &&
        Q13_TO_ADD_CELLS.map(([c, r], i) => {
          const { x, y } = cellXY(c, r)
          return (
            <g key={`ghost-${cellKey(c, r)}`}>
              <rect x={x} y={y} width={CELL} height={CELL} fill={GHOST_FILL} stroke={GHOST_STROKE} strokeWidth={1.6} strokeDasharray="5 4" />
              {numberGhosts && (
                <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={GHOST_STROKE}>
                  {i + 1}
                </text>
              )}
            </g>
          )
        })}

      {/* original filled squares (drawn on top so they read as the fixed figure) */}
      {Q13_FILLED.map(([c, r], i) => {
        const { x, y } = cellXY(c, r)
        return (
          <g key={`fill-${cellKey(c, r)}`}>
            <rect x={x} y={y} width={CELL} height={CELL} fill={FILL} stroke={FILL_STROKE} strokeWidth={2.2} />
            {numberFilled && (
              <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill="#B91C1C">
                {i + 1}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P25G1Q13Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A staircase made of equal squares: a bottom row of 4 squares, a middle row of 2 squares aligned left, and a single square on top of the left column."
    >
      <Q13Grid />
    </div>
  )
}
