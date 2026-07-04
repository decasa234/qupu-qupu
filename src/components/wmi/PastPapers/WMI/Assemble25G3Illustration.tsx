// Board-assembly puzzle for WMI-25F3A-Q11 (2025 Grade-3 Final, answer E).
//
// Source figure (db/seed/wmi/figures/2025-final-g3-a-q11.jpg) shows only the
// target outline: a 15-cell shape on a 6-wide grid —
//   row 0 (top):    . X X X X .   (cols 1..4)
//   row 1 (middle): X X X X X X   (cols 0..5 — one cell protrudes right)
//   row 2 (bottom): X X X X X .   (cols 0..4)
// The boards A..E that tile it were on the left of the original layout; they
// are reconstructed here so the chosen trio (A, B, D) tiles the target exactly
// by rotation only (no flips). Verified by brute-force search: {A, B, D}
// covers the 15 cells with no overlap or gap; {B,D,E} also totals 15 but
// cannot tile in any rotation, and {C,D,E}, {B,C,D}, {A,C,E} total only 14.
//
// The five answer options are textual trios ("A, B, D" etc.), NOT board images,
// so no CHOICE_RENDERER is needed for this question.

const CELL_STROKE = '#1F2937'

export type Cell = [number, number] // [row, col], row 0 = top

/** The target outline (15 cells), in target-grid coordinates. */
export const TARGET_CELLS: Cell[] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 0],
  [1, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [2, 0],
  [2, 1],
  [2, 2],
  [2, 3],
  [2, 4],
]

/**
 * The five boards as shown in the stem (each normalized to its own bounding
 * box). A, B, D are the answer trio; C and E are distractors.
 *   A = P-pentomino (5)   B = mirror-P pentomino (5)   C = S-tetromino (4)
 *   D = F-pentomino (5)   E = X-pentomino (5)
 * All five are pairwise distinct under rotation (no flips), so no board can
 * stand in for another.
 */
export const BOARDS: Array<{ label: string; cells: Cell[] }> = [
  { label: 'A', cells: [[0, 1], [1, 0], [1, 1], [2, 0], [2, 1]] },
  { label: 'B', cells: [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]] },
  { label: 'C', cells: [[0, 1], [0, 2], [1, 0], [1, 1]] },
  { label: 'D', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 1]] },
  { label: 'E', cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]] },
]

/** Fill colours for the boards (qupu palette). */
export const BOARD_FILL = '#FBCF9C' // peach, matches other tiling figures
export const TARGET_FILL = '#FFFFFF'

function cellSpan(cells: Cell[]): { rows: number; cols: number } {
  return {
    rows: Math.max(...cells.map(([r]) => r)) + 1,
    cols: Math.max(...cells.map(([, c]) => c)) + 1,
  }
}

/**
 * Draws a polyomino from [row, col] cells, bounding-box top-left at (x, y).
 * Each cell is an outlined square.
 */
export function PolyBoard({
  cells,
  x,
  y,
  cell = 22,
  fill = BOARD_FILL,
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

const VIEW_W = 320
const VIEW_H = 280

// Boards row layout: five equal slots across the top.
const SLOT_W = VIEW_W / 5
const BOARD_CELL = 17
const LABEL_Y = 118

/** Centers a board within its slot at the given top y. */
function boardOrigin(cells: Cell[], slotIndex: number, topY: number) {
  const { rows, cols } = cellSpan(cells)
  const w = cols * BOARD_CELL
  const h = rows * BOARD_CELL
  const cx = slotIndex * SLOT_W + SLOT_W / 2
  return { x: cx - w / 2, y: topY + (78 - h) / 2 }
}

export function Assemble25G3Diagram() {
  // Target outline, centered in the lower band.
  const targetCell = 26
  const { cols: tCols } = cellSpan(TARGET_CELLS)
  const tW = tCols * targetCell
  const tX = (VIEW_W - tW) / 2
  const tY = 168

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Five labeled boards across the top. */}
      {BOARDS.map((b, i) => {
        const { x, y } = boardOrigin(b.cells, i, 14)
        return (
          <g key={b.label}>
            <PolyBoard cells={b.cells} x={x} y={y} cell={BOARD_CELL} />
            <text
              x={i * SLOT_W + SLOT_W / 2}
              y={LABEL_Y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight={900}
              fill={CELL_STROKE}
              className="font-display"
            >
              {b.label}
            </text>
          </g>
        )
      })}

      {/* Divider + caption between boards and target. */}
      <line x1={20} y1={134} x2={VIEW_W - 20} y2={134} stroke="#D6CBB8" strokeWidth={1.5} />
      <text
        x={VIEW_W / 2}
        y={152}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill="#6B7280"
      >
        target
      </text>

      {/* Target outline (empty cells to assemble). */}
      <PolyBoard cells={TARGET_CELLS} x={tX} y={tY} cell={targetCell} fill={TARGET_FILL} />
    </svg>
  )
}

export function Assemble25G3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Lima papan persegi berlabel A sampai E di atas, dan satu gambar target 15 sel di bawah. Pilih tiga papan yang, jika diputar (tidak dibalik), mengisi gambar target persis tanpa celah atau tumpang tindih."
    >
      <Assemble25G3Diagram />
    </div>
  )
}

export default Assemble25G3Illustration
