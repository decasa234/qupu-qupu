// IKMC-23-PE-Q16 — "Max wants to complete the puzzle shown."
//
// Source scans:
//   stem (puzzle board) = 2023.imgs/039.jpg
//   available pieces   = 2023.imgs/040.jpg
//   option A           = 2023.imgs/041.jpg  ← correct answer
//   option B           = 2023.imgs/042.jpg
//   option C           = 2023.imgs/043.jpg
//   option D           = 2023.imgs/044.jpg
//   option E           = 2023.imgs/045.jpg
//
// The puzzle is a 4×4 grid. Blue (filled) cells are already in place.
// White (gap) cells need to be covered by pieces Max selects.
//
// Grid encoding (row 0 = top, col 0 = left):
//   row 0: white, blue, blue, blue  → gap at (0,0)
//   row 1: white, white, white, blue → gap at (1,0),(1,1),(1,2)
//   row 2: blue, white, white, white → gap at (2,1),(2,2),(2,3)
//   row 3: blue, blue, white, white  → gap at (3,2),(3,3)
//
// Total gap = 9 cells.
//
// Five available pieces (image 040), each as [row,col] in their own bounding box:
//   P1 "Γ"    = (0,0),(0,1),(0,2),(1,0)          — 4 cells, wide-top-notch-left
//   P2 "L"    = (0,0),(1,0),(2,0),(2,1)           — 4 cells, tall-jut-right-bottom
//   P3 "dot"  = (0,0)                              — 1 cell
//   P4 "I2"   = (0,0),(1,0)                        — 2 cells vertical
//   P5 "step" = (0,1),(1,0),(1,1)                  — 3 cells bottom-heavy
//
// Answer A uses pieces P1 + P2 + P3 (4+4+1 = 9 cells):
//   P1 placed at board (0,0)↔(0,0),(1,0),(1,1),(1,2)  covers gap rows 0–1
//   P2 (reflected) covers (2,1),(2,2),(2,3),(3,3)      covers gap rows 2–3 right
//   P3 (single cell) covers (3,2)                       covers gap bottom-left
//
// Each option shows 3 pieces chosen from the 5 available:
//   A: P1, P2, P3  ← answer
//   B: P1, P2, P4
//   C: P1, P2, P5
//   D: P3, P4, P5
//   E: P1, P4, P5
//
// Co-exports: PuzzleComplete16PEPrimitive (board + pieces), PuzzleComplete16PEPiece,
//             PIECE_CELLS, OPTION_PIECES — consumed by the Option renderer and Explainer.
//
// Pure SVG. No random/Date. SSR-safe.

export type Cell = [number, number] // [row, col], row 0 = top, col 0 = left

// ── colour tokens ──────────────────────────────────────────────────────────────
const BLUE_FILL   = '#3FA9E1'  // puzzle blue — filled/intact cells
const BLUE_STROKE = '#1A6FA0'  // darker blue — outline for filled cells
const GAP_FILL    = '#FFFFFF'  // white — the cut-out gap region
const PIECE_FILL  = '#f0853a'  // qupu-brand-orange — piece placed by animator
const PIECE_STROKE = '#C0551A' // deeper orange outline for placed piece

// ── gap definition ─────────────────────────────────────────────────────────────
/** All white (gap) cells in the 4×4 puzzle grid. */
export const GAP_CELLS = new Set([
  '0,0',
  '1,0', '1,1', '1,2',
  '2,1', '2,2', '2,3',
  '3,2', '3,3',
])
export const GRID_ROWS = 4
export const GRID_COLS = 4

/** Gap cells as an array (for the explainer animator). */
export const GAP_CELL_LIST: Cell[] = [
  [0, 0],
  [1, 0], [1, 1], [1, 2],
  [2, 1], [2, 2], [2, 3],
  [3, 2], [3, 3],
]

// ── piece definitions ──────────────────────────────────────────────────────────
/**
 * Five available pieces read from the source scan (image 040).
 * Each piece is expressed in its own bounding-box local coordinates
 * (row 0 = top, col 0 = left).
 */
export const PIECE_CELLS: Record<string, Cell[]> = {
  // Wide Γ-shape: 3 across the top + 1 below-left
  P1: [[0, 0], [0, 1], [0, 2], [1, 0]],
  // L-shape: 3 tall + 1 jutting right at the bottom
  P2: [[0, 0], [1, 0], [2, 0], [2, 1]],
  // Single square
  P3: [[0, 0]],
  // Vertical domino
  P4: [[0, 0], [1, 0]],
  // Bottom-heavy step: one cell top-right, two cells bottom
  P5: [[0, 1], [1, 0], [1, 1]],
}

/** Piece selection for each answer option. */
export const OPTION_PIECES: Record<string, string[]> = {
  A: ['P1', 'P2', 'P3'],  // correct
  B: ['P1', 'P2', 'P4'],
  C: ['P1', 'P2', 'P5'],
  D: ['P3', 'P4', 'P5'],
  E: ['P1', 'P4', 'P5'],
}

export const ANSWER = 'A'

// ── helpers ────────────────────────────────────────────────────────────────────
/** Bounding-box size of a piece. */
export function cellSpan(cells: Cell[]): { rows: number; cols: number } {
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  return { rows, cols }
}

/** Draw a polyomino shape from [row,col] cells, top-left at (x,y). */
export function PuzzlePiece({
  cells,
  x,
  y,
  cell,
  fill = BLUE_FILL,
  stroke = BLUE_STROKE,
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

// ── puzzle board ───────────────────────────────────────────────────────────────
/**
 * The 4×4 puzzle grid. Blue cells are filled; gap cells remain white.
 * When `showPiece` is 'A' the correct pieces are highlighted orange in the gap
 * (used by the explainer's winning beat).
 */
export function PuzzleComplete16PEBoard({
  showPiece = null,
  cell = 36,
  pad = 8,
}: {
  showPiece?: string | null
  cell?: number
  pad?: number
}) {
  const gridW = GRID_COLS * cell
  const gridH = GRID_ROWS * cell
  const width  = gridW + pad * 2
  const height = gridH + pad * 2
  const ox = pad
  const oy = pad

  const fillGap = showPiece === ANSWER

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={Math.min(200, width)}
      role="presentation"
    >
      {/* draw all cells */}
      {Array.from({ length: GRID_ROWS }).map((_, r) =>
        Array.from({ length: GRID_COLS }).map((_, c) => {
          const isGap = GAP_CELLS.has(`${r},${c}`)
          return (
            <rect
              key={`${r}-${c}`}
              x={ox + c * cell}
              y={oy + r * cell}
              width={cell}
              height={cell}
              fill={isGap ? (fillGap ? PIECE_FILL : GAP_FILL) : BLUE_FILL}
              stroke={isGap ? (fillGap ? PIECE_STROKE : '#CBD5E1') : BLUE_STROKE}
              strokeWidth={isGap ? 1 : 2}
            />
          )
        }),
      )}
      {/* outer frame */}
      <rect
        x={ox}
        y={oy}
        width={gridW}
        height={gridH}
        fill="none"
        stroke={BLUE_STROKE}
        strokeWidth={2.5}
      />
    </svg>
  )
}

// ── stem illustration ──────────────────────────────────────────────────────────
/**
 * In-card stem for IKMC-23-PE-Q16.
 * Shows the incomplete 4×4 puzzle with the gap visible. Never reveals the answer.
 */
export default function PuzzleComplete16PEIllustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-3"
      role="img"
      aria-label="Teka-teki kotak 4×4 dengan beberapa kotak kosong (putih). Pilih potongan yang tepat untuk mengisi semua kotak kosong."
    >
      <PuzzleComplete16PEBoard showPiece={null} />
    </div>
  )
}

// ── Option renderer ────────────────────────────────────────────────────────────
import type { WmiChoice } from '../../../../types/wmi'

const OPT_CELL = 20
const OPT_PAD  = 5
const OPT_GAP  = 6   // gap between pieces in one option

/**
 * Renders one answer option (A–E) as the actual polyomino pieces it contains.
 * Exported for `CHOICE_RENDERERS['IKMC-23-PE-Q16']`.
 */
export function PuzzleComplete16PEOption({ choice }: { choice: WmiChoice }) {
  const pieceIds = OPTION_PIECES[choice.label]
  if (!pieceIds) return <span>{choice.text}</span>

  // Compute each piece's SVG dimensions then lay them out side-by-side
  const pieces = pieceIds.map((id) => {
    const cells = PIECE_CELLS[id]
    const { rows, cols } = cellSpan(cells)
    const w = cols * OPT_CELL + OPT_PAD * 2
    const h = rows * OPT_CELL + OPT_PAD * 2
    return { id, cells, w, h }
  })

  const maxH  = Math.max(...pieces.map((p) => p.h))
  const totalW = pieces.reduce((sum, p, i) => sum + p.w + (i > 0 ? OPT_GAP : 0), 0)

  return (
    <span
      role="img"
      aria-label={`Pilihan ${choice.label}: ${pieceIds.length} potongan`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${totalW} ${maxH}`}
        width={totalW}
        height={maxH}
        style={{ display: 'block' }}
      >
        {pieces.reduce<{ els: React.ReactNode[]; x: number }>(
          (acc, p, i) => {
            const x = i === 0 ? 0 : acc.x + OPT_GAP
            const yOff = Math.floor((maxH - p.h) / 2)
            acc.els.push(
              <PuzzlePiece
                key={p.id}
                cells={p.cells}
                x={x + OPT_PAD}
                y={yOff + OPT_PAD}
                cell={OPT_CELL}
                fill={BLUE_FILL}
                stroke={BLUE_STROKE}
                strokeWidth={1.5}
              />,
            )
            acc.x = x + p.w
            return acc
          },
          { els: [], x: 0 },
        ).els}
      </svg>
    </span>
  )
}
