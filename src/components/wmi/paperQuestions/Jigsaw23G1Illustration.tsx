// Jigsaw-puzzle completion problem for WMI-23F1A-Q10 (2023 Grade 1 Final).
//
// Source figure (Paper A): an 8-column × 5-row grid of light squares with one
// interior region cut out (pure white, no inner grid lines). Five candidate
// pieces (A–E) are offered; the learner picks the one that exactly tiles the
// hole. Reading the scans pixel-by-pixel, the grid fill = light squares, the
// hole = 9 missing cells:
//
//   row 1: cols 2,4            (two white cells split by a filled tab at col 3)
//   row 2: cols 2,3,4,5        (the wide middle band)
//   row 3: cols 2,3,5          (white, with a filled tab poking up at col 4)
//
// Normalised to the hole's own 3-row × 4-col bounding box (rows 1-3, cols 2-5):
//   # . # .
//   # # # #
//   # # . #          (# = missing / hole, . = still filled)
//
// Answer = B. Piece B is a 4-row × 3-col polyomino of 9 cells; rotated 90° it
// matches the hole exactly. A, C, E have only 8 cells (the hole needs 9) and D
// has 9 cells but no rotation/reflection fits — so B is the unique solution.
//
// This stem draws ONLY the incomplete puzzle (the hole is visible) — never the
// answer. The shared `Jigsaw23G1` primitive accepts `showPiece` so the animator
// can drop the correct piece into the hole after the answer is revealed.

export type Cell = [number, number] // [row, col], row 0 = top, col 0 = left

const CELL_FILL = '#FFD3B1' // qupu-peach — the intact puzzle squares
const CELL_STROKE = '#30598A' // qupu-brand-blue — dark cell outline
const HOLE_FILL = '#FFFFFF' // the cut-out region (no inner grid lines)
const PIECE_FILL = '#f0853a' // qupu-brand-orange — the dropped-in piece

// The full 8×5 puzzle. `true` = intact square, `false` = part of the hole.
// Hole cells: r1 c2,c4 · r2 c2,c3,c4,c5 · r3 c2,c3,c5.
const HOLE_CELLS = new Set([
  '1,2',
  '1,4',
  '2,2',
  '2,3',
  '2,4',
  '2,5',
  '3,2',
  '3,3',
  '3,5',
])

export const GRID_COLS = 8
export const GRID_ROWS = 5

/** Hole cells expressed in the main grid's own (row, col) coordinates. */
export const HOLE_GRID_CELLS: Cell[] = [
  [1, 2],
  [1, 4],
  [2, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [3, 2],
  [3, 3],
  [3, 5],
]

/**
 * The five candidate pieces, each as a list of [row, col] cells inside its own
 * 3-col × 4-row bounding box (row 0 = top). Read directly from the A–E scans.
 *   A: .## / ##. / .## / ##.   (8 cells)
 *   B: .## / ##. / .## / ###   (9 cells — the answer)
 *   C: .#. / ##. / .## / ###   (8 cells)
 *   D: ### / .#. / ### / .##   (9 cells, wrong shape)
 *   E: .## / ### / .#. / ##.   (8 cells)
 */
export const PIECE_CELLS: Record<string, Cell[]> = {
  A: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 0],
    [3, 1],
  ],
  B: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 0],
    [3, 1],
    [3, 2],
  ],
  C: [
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 0],
    [3, 1],
    [3, 2],
  ],
  D: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 1],
    [2, 2],
    [3, 1],
    [3, 2],
  ],
  E: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 1],
    [3, 0],
    [3, 1],
  ],
}

export function cellSpan(cells: Cell[]): { rows: number; cols: number } {
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  return { rows, cols }
}

/**
 * Draws a polyomino from [row, col] cells, bounding-box top-left at (x, y).
 * Each cell is an outlined square, like the source figure.
 */
export function PolyShape({
  cells,
  x,
  y,
  cell,
  fill = CELL_FILL,
  stroke = CELL_STROKE,
  strokeWidth = 2,
}: {
  cells: Cell[]
  x: number
  y: number
  cell: number
  fill?: string
  stroke?: string
  strokeWidth?: number
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
          strokeWidth={strokeWidth}
        />
      ))}
    </g>
  )
}

/**
 * The shared puzzle primitive. Draws the 8×5 grid with the hole left empty.
 * When `showPiece` names the correct piece ("B"), the piece is dropped into the
 * hole (rotated to fit) so the animator can reveal the solution after answering.
 * The stem renders this with `showPiece={null}` so no answer is shown.
 */
export function Jigsaw23G1({
  showPiece = null,
  cell = 30,
  pad = 8,
}: {
  showPiece?: string | null
  cell?: number
  pad?: number
}) {
  const gridW = GRID_COLS * cell
  const gridH = GRID_ROWS * cell
  const width = gridW + pad * 2
  const height = gridH + pad * 2
  const ox = pad
  const oy = pad

  const filled = showPiece === 'B' // only B actually tiles the hole

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(280, width)} role="presentation">
      {/* every grid cell: intact squares get the peach fill; hole cells stay white */}
      {Array.from({ length: GRID_ROWS }).map((_, r) =>
        Array.from({ length: GRID_COLS }).map((_, c) => {
          const isHole = HOLE_CELLS.has(`${r},${c}`)
          return (
            <rect
              key={`${r}-${c}`}
              x={ox + c * cell}
              y={oy + r * cell}
              width={cell}
              height={cell}
              fill={isHole ? HOLE_FILL : CELL_FILL}
              stroke={isHole ? 'none' : CELL_STROKE}
              strokeWidth={2}
            />
          )
        }),
      )}

      {/* outer frame so the white hole reads as a cut-out inside a solid board */}
      <rect
        x={ox}
        y={oy}
        width={gridW}
        height={gridH}
        fill="none"
        stroke={CELL_STROKE}
        strokeWidth={2.5}
      />

      {/* after-answer reveal: drop piece B into the hole (drawn in brand orange) */}
      {filled && (
        <PolyShape
          cells={HOLE_GRID_CELLS}
          x={ox}
          y={oy}
          cell={cell}
          fill={PIECE_FILL}
          stroke={CELL_STROKE}
          strokeWidth={2}
        />
      )}
    </svg>
  )
}

/**
 * The in-card stem figure for WMI-23F1A-Q10. Draws the incomplete puzzle with
 * the hole visible — the question "Which figure can complete the puzzle?" The
 * answer (which piece fits) is never shown here.
 */
export default function Jigsaw23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Puzzle berbentuk papan persegi dengan satu bagian di tengah yang masih kosong (berlubang). Pilih potongan yang tepat mengisi lubang itu."
    >
      <Jigsaw23G1 showPiece={null} />
    </div>
  )
}
