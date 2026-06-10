import type { WmiChoice } from '../../../types/wmi'
import { cellSpan, PIECE_FILL, PLUS_CELLS, PolyShape, type Cell } from './JoinPieces20Illustration'

// Renders an answer option for WMI-20F1A-Q13 as the actual polyomino shape.
// Cell lists are read from the source figure (row, col from 0, row 0 = top).
export const OPTION_CELLS: Record<string, Cell[]> = {
  A: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 1],
  ],
  B: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
    [1, 2],
    [1, 3],
  ],
  C: PLUS_CELLS,
  D: [
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 1],
    [2, 2],
    [2, 3],
  ],
}

const CELL = 22
const PAD = 6

export default function JoinPiecesOption20({ choice }: { choice: WmiChoice }) {
  const cells = OPTION_CELLS[choice.label]
  if (!cells) return <span>{choice.text}</span>

  const { rows, cols } = cellSpan(cells)
  const w = cols * CELL + PAD * 2
  const h = rows * CELL + PAD * 2
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{ display: 'block' }}
      role="img"
      aria-label={choice.text}
    >
      <PolyShape cells={cells} x={PAD} y={PAD} cell={CELL} fill={PIECE_FILL} />
    </svg>
  )
}
