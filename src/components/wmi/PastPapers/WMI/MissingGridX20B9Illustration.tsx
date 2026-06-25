// Illustration for SEAMOX-20-B-Q9.
// The question shows a 3×5 number grid with one missing entry and asks for the
// missing number:
//
//   Row 1 : 1   3   5   7   9
//   Row 2 : 8  12   ?   2  20
//   Row 3 : 5   9  12   8  19
//
// Pattern: row2[c] = row1[c] + row3[c] — verified by column 2 (3+9=12 ✓).
// Missing cell: (row=1, col=2) → 5 + 9 = 14.
//
// Primitive used: GridBoard + gridBoardViewBox from ./primitives/GridBoard.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── Data ──────────────────────────────────────────────────────────────────────

const GRID_DATA: (string | null)[][] = [
  ['1', '3', '5',  '7',  '9'],
  ['8', '12', '?', '2', '20'],
  ['5', '9',  '12', '8', '19'],
]

const ROWS = 3
const COLS = 5
const CELL = 52

// ── Shared figure component ────────────────────────────────────────────────────

export interface MissingGridX20B9FigureProps {
  /** Which column (0-indexed) to highlight with amber tint. null = none. */
  highlightCol?: number | null
  /** When true, show the answer '14' in the missing cell instead of '?'. */
  showAnswer?: boolean
}

export function MissingGridX20B9Figure({
  highlightCol = null,
  showAnswer = false,
}: MissingGridX20B9FigureProps) {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)

  const fill = (r: number, c: number): string => {
    // header row (row 0) uses a light blue tint
    if (r === 0) return '#EFF6FF'
    // answer row (row 2) gets a light green tint
    if (r === 2) return '#F0FDF4'
    // middle row: missing cell is amber, others white
    if (r === 1 && c === 2) return '#FEF3C7'
    return '#FFFFFF'
  }

  const highlight = (r: number, c: number): 'none' | 'amber' | 'green' | 'red' => {
    if (highlightCol !== null && c === highlightCol) return 'amber'
    return 'none'
  }

  const label = (r: number, c: number): string => {
    if (r === 1 && c === 2) return showAnswer ? '14' : '?'
    return GRID_DATA[r][c] ?? ''
  }

  return (
    <svg
      viewBox={vb}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <GridBoard
        rows={ROWS}
        cols={COLS}
        cellSize={CELL}
        fill={fill}
        label={label}
        highlight={highlightCol !== null ? highlight : undefined}
        gridStroke="#374151"
      />
    </svg>
  )
}

// ── Default export — static stem illustration ─────────────────────────────────

export default function MissingGridX20B9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Grid 3×5 dengan satu bilangan yang hilang. Baris 1: 1, 3, 5, 7, 9. Baris 2: 8, 12, ?, 2, 20. Baris 3: 5, 9, 12, 8, 19."
    >
      <MissingGridX20B9Figure />
    </div>
  )
}
