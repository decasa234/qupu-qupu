// Join-the-pieces puzzle for WMI-20F1A-Q13.
//
// Source figure: wmiPastPaper/2020 WMI Final G01 Paper A — two identical
// Z-tetromino pieces (tan squares, dark outlines) joined by a bold "+".
// Each piece covers grid cells (row, col from 0): (0,0) (0,1) (1,1) (1,2).
// The correct option C is the plus shape; the canonical tiling is:
//   piece 1 → (0,1) (0,2) (1,2) (1,3)   (top bump + right arm)
//   piece 2 → (1,0) (1,1) (2,1) (2,2)   (left arm + bottom bump; same Z turned 180°)

export type Cell = [number, number] // [row, col], row 0 = top

/** The Z-piece, as drawn in the source figure. */
export const PIECE_CELLS: Cell[] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 2],
]

/** Option C — the plus shape (8 squares). */
export const PLUS_CELLS: Cell[] = [
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 1],
  [2, 2],
]

/** Inside the plus: cells filled by piece 1 (top bump + right arm). */
export const FIT_PIECE1_CELLS: Cell[] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
]

/** Inside the plus: cells filled by piece 2, turned 180° (left arm + bottom bump). */
export const FIT_PIECE2_CELLS: Cell[] = [
  [1, 0],
  [1, 1],
  [2, 1],
  [2, 2],
]

export const PIECE_FILL = '#FBCF9C' // tan/peach, as in the source figure
export const PIECE_FILL_2 = '#93C5FD' // second piece during the fit beats
const CELL_STROKE = '#1F2937'

/**
 * Draws a polyomino from [row, col] cells, with its bounding-box top-left at (x, y).
 * Each cell is an outlined square, like the source figure.
 */
export function PolyShape({
  cells,
  x,
  y,
  cell = 28,
  fill = PIECE_FILL,
  stroke = CELL_STROKE,
}: {
  cells: Cell[]
  x: number
  y: number
  cell?: number
  fill?: string
  stroke?: string
}) {
  return (
    <g>
      {cells.map(([r, c], i) => (
        <rect
          key={i}
          x={x + c * cell}
          y={y + r * cell}
          width={cell}
          height={cell}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

export function cellSpan(cells: Cell[]): { rows: number; cols: number } {
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  return { rows, cols }
}

export const JOIN_VIEW_W = 300
export const JOIN_VIEW_H = 104

/** The in-card figure: piece + piece, like the source. */
export function JoinPiecesDiagram() {
  const cell = 26
  // Each Z-piece spans 3 cols × 2 rows = 78 × 52.
  const pieceW = 3 * cell
  const pieceH = 2 * cell
  const gap = 42 // room for the bold "+"
  const totalW = pieceW * 2 + gap
  const x0 = (JOIN_VIEW_W - totalW) / 2
  const y0 = (JOIN_VIEW_H - pieceH) / 2
  return (
    <svg
      viewBox={`0 0 ${JOIN_VIEW_W} ${JOIN_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <PolyShape cells={PIECE_CELLS} x={x0} y={y0} cell={cell} />
      <text
        x={x0 + pieceW + gap / 2}
        y={y0 + pieceH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
        fontWeight={900}
        fill={CELL_STROKE}
      >
        +
      </text>
      <PolyShape cells={PIECE_CELLS} x={x0 + pieceW + gap} y={y0} cell={cell} />
    </svg>
  )
}

export default function JoinPieces20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two identical Z-shaped pieces of four squares each, joined by a plus sign: slide and turn them to build one of the answer shapes."
    >
      <JoinPiecesDiagram />
    </div>
  )
}
