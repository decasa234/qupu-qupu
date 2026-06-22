/**
 * IKMC-19-EC-Q10 — "Dennis wants to remove one cell from the shape below.
 * How many of the following shapes can he get?" (answer C = 3).
 *
 * The stem figure (030.jpg) is a 5-cell polyomino:
 *   Row 0: col 1, col 2   (top-right pair)
 *   Row 1: col 0, col 1, col 2   (full bottom row)
 *
 * This is an F-pentomino (or "P-pentomino" depending on orientation).
 * Dennis removes exactly one cell; the question asks how many of the
 * five pictured tetrominoes (options A–E) can be reached this way.
 *
 * The five option shapes (031–035.jpg):
 *   A (L-tetromino):  row 0: col 0;        row 1: col 0, col 1, col 2
 *   B (T-tetromino):  row 0:       col 1;  row 1: col 0, col 1, col 2
 *   C (S-tetromino):  row 0: col 0, col 1; row 1:       col 1, col 2
 *   D (O-tetromino):  row 0: col 0, col 1; row 1: col 0, col 1
 *   E (I-tetromino):  row 0: col 0, col 1, col 2, col 3
 *
 * Valid single-cell removals from the stem (keeping connectivity):
 *   Remove (0,1) → (0,2),(1,0),(1,1),(1,2) — L-tetromino ≅ option A  ✓
 *   Remove (0,2) → (0,1),(1,0),(1,1),(1,2) — T-tetromino ≅ option B  ✓
 *   Remove (1,0) → (0,1),(0,2),(1,1),(1,2) — O-tetromino ≅ option D  ✓
 *   Remove (1,2) → (0,1),(0,2),(1,0),(1,1) — J-tetromino, not C or E ✗
 *   Remove (1,1) → disconnects the shape → invalid ✗
 *   → exactly 3 of the option shapes (A, B, D) can be obtained → answer C = 3.
 *
 * The stem illustration shows ONLY the 5-cell source shape, never the answer.
 * Co-exports `PolyShape` and `STEM_CELLS` so the explainer can reuse them.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

export type Cell = [number, number] // [row, col], row 0 = top, col 0 = left

// ─── colour tokens ──────────────────────────────────────────────────────────

export const CELL_FILL = '#FFD3B1'   // qupu-peach — the source shape cells
export const CELL_STROKE = '#30598A' // qupu-brand-blue — cell outlines
export const HIT_FILL = '#f0853a'    // qupu-brand-orange — confirmed matches
export const MISS_FILL = '#E5E7EB'   // neutral grey — rejected shapes
export const MISS_STROKE = '#9CA3AF'

// ─── stem shape ─────────────────────────────────────────────────────────────

/**
 * The 5-cell source polyomino Dennis starts with.
 *   Row 0: col 1, col 2
 *   Row 1: col 0, col 1, col 2
 */
export const STEM_CELLS: Cell[] = [
  [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
]

// ─── option shapes (tetrominoes shown in the question) ──────────────────────

/**
 * The five tetromino shapes drawn in options A–E (031–035.jpg).
 * Each is expressed in its own bounding-box coordinate system (row 0 = top).
 */
export const OPTION_CELLS: Record<string, Cell[]> = {
  // 031.jpg — L-tetromino: top-left corner + bottom 3-row
  A: [[0, 0], [1, 0], [1, 1], [1, 2]],
  // 032.jpg — T-tetromino: top-center + bottom 3-row
  B: [[0, 1], [1, 0], [1, 1], [1, 2]],
  // 033.jpg — S-tetromino: two diagonal pairs
  C: [[0, 0], [0, 1], [1, 1], [1, 2]],
  // 034.jpg — O-tetromino: 2×2 square
  D: [[0, 0], [0, 1], [1, 0], [1, 1]],
  // 035.jpg — I-tetromino: 1×4 row
  E: [[0, 0], [0, 1], [0, 2], [0, 3]],
}

/** Which option labels can be produced by removing one cell from STEM_CELLS. */
export const REACHABLE = new Set(['A', 'B', 'D'])

// ─── drawing utilities ──────────────────────────────────────────────────────

export function cellSpan(cells: Cell[]): { rows: number; cols: number } {
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  return { rows, cols }
}

/**
 * Draws a polyomino from [row, col] cells with its bounding-box top-left at
 * (x, y). Each cell is a filled, outlined square — matching the source paper.
 */
export function PolyShape({
  cells,
  x,
  y,
  cell = 34,
  fill = CELL_FILL,
  stroke = CELL_STROKE,
  strokeWidth = 2,
}: {
  cells: Cell[]
  x: number
  y: number
  cell?: number
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

// ─── stem primitive ─────────────────────────────────────────────────────────

/**
 * Draws the 5-cell source shape. Accepts `highlightCell` so the explainer
 * can colour-code which cell is being removed on each beat.
 */
export function StemShape({
  cell = 40,
  pad = 10,
  highlightCell = null,
  highlightColor = '#DC2626',
}: {
  cell?: number
  pad?: number
  highlightCell?: Cell | null
  highlightColor?: string
}) {
  const span = cellSpan(STEM_CELLS)
  const w = span.cols * cell + pad * 2
  const h = span.rows * cell + pad * 2

  const hiKey = highlightCell ? `${highlightCell[0]},${highlightCell[1]}` : ''

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={Math.min(200, w)}
      role="presentation"
    >
      {STEM_CELLS.map(([r, c], i) => {
        const isHi = hiKey === `${r},${c}`
        return (
          <rect
            key={i}
            x={pad + c * cell}
            y={pad + r * cell}
            width={cell}
            height={cell}
            fill={isHi ? highlightColor : CELL_FILL}
            stroke={isHi ? highlightColor : CELL_STROKE}
            strokeWidth={isHi ? 3 : 2}
            opacity={isHi ? 0.25 : 1}
          />
        )
      })}
    </svg>
  )
}

// ─── stem illustration default export ───────────────────────────────────────

/**
 * The in-card figure for IKMC-19-EC-Q10.
 * Shows the 5-cell source polyomino — the shape Dennis is removing a cell from.
 * Never reveals the answer or shows any option shapes.
 */
export default function Polyomino10ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Bentuk polyomino lima kotak: dua kotak di baris atas (posisi tengah dan kanan) ' +
        'dan tiga kotak di baris bawah (kiri, tengah, kanan). ' +
        'Dennis ingin menghapus satu kotak dari bentuk ini.'
      }
    >
      <StemShape />
    </div>
  )
}
