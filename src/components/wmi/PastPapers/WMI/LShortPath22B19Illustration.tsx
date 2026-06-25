// SEAMO-22-B-Q19 — "Find the number of shortest paths from A to B."
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-b/2022.md Q19
// Crop: 2022.imgs/008.jpg
//
// FIGURE: L-shaped grid with A at top-left and B at bottom-right.
// The L-shape consists of:
//   • Upper-left block: 2 cells wide × 3 cells tall (nodes cols 0-2, rows 0-3)
//   • Lower-right block: 5 cells wide × 2 cells tall (nodes cols 0-5, rows 3-5)
// A = node (0,0), B = node (5,5)
//
// ANSWER (E) 126 — verified by Pascal fill on the L-grid:
//   row 3 junction: (0..5) → [1,4,10,10,10,10]
//   row 4:          → [1,5,15,25,35,45]
//   row 5:          → [1,6,21,46,81,126]
//
// PROBLEM-ONLY: never shows path counts or the answer.
// Pure SVG, SSR-safe, no hooks, no framer-motion.

// ── Shared layout constants (re-exported for the explainer) ──────────────────

/** Cell size in SVG units */
export const CELL = 40

/** Padding around the grid */
export const PAD = 28

/**
 * Upper block dimensions:
 *   2 cells wide × 3 cells tall → node cols 0-2, rows 0-3
 */
export const UPPER_COLS = 2  // cell count
export const UPPER_ROWS = 3  // cell count

/**
 * Lower block dimensions:
 *   5 cells wide × 2 cells tall → node cols 0-5, rows 3-5
 */
export const LOWER_COLS = 5  // cell count
export const LOWER_ROWS = 2  // cell count

/** Node (col, row) → SVG (x, y) */
export function nodeXY(col: number, row: number): [number, number] {
  return [PAD + col * CELL, PAD + row * CELL]
}

/** A node (top-left) */
export const NODE_A = [0, 0] as [number, number]

/** B node (bottom-right of lower block) */
export const NODE_B = [LOWER_COLS, UPPER_ROWS + LOWER_ROWS] as [number, number]

/** Returns true if a node (col, row) is inside the L-shaped region */
export function isValid(col: number, row: number): boolean {
  const inUpper = col <= UPPER_COLS && row <= UPPER_ROWS
  const inLower = col <= LOWER_COLS && row >= UPPER_ROWS && row <= UPPER_ROWS + LOWER_ROWS
  return inUpper || inLower
}

// ── SVG dimensions ────────────────────────────────────────────────────────────

const SVG_W = PAD * 2 + LOWER_COLS * CELL
const SVG_H = PAD * 2 + (UPPER_ROWS + LOWER_ROWS) * CELL

// ── Grid renderer ─────────────────────────────────────────────────────────────

/**
 * Draws the L-shaped grid lines and cell fills.
 * Only draws cells that are inside the valid L-region.
 */
function LGrid() {
  const cells: React.ReactNode[] = []
  const hLines: React.ReactNode[] = []
  const vLines: React.ReactNode[] = []
  const totalRows = UPPER_ROWS + LOWER_ROWS
  const totalCols = LOWER_COLS

  // Cells (filled white)
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      // A cell (c,r) exists if all four corners are valid nodes
      const inL = (c < UPPER_COLS && r < UPPER_ROWS) ||
                  (r >= UPPER_ROWS && c < LOWER_COLS)
      if (!inL) continue
      const [x, y] = nodeXY(c, r)
      cells.push(
        <rect
          key={`cell-${r}-${c}`}
          x={x}
          y={y}
          width={CELL}
          height={CELL}
          fill="white"
          stroke="#374151"
          strokeWidth={1.5}
        />
      )
    }
  }

  return <g>{cells}</g>
}

// ── Endpoint labels ───────────────────────────────────────────────────────────

function EndpointLabels() {
  const [ax, ay] = nodeXY(...NODE_A)
  const [bx, by] = nodeXY(...NODE_B)
  const INK = '#111827'

  return (
    <g fontFamily="sans-serif" fontWeight={700} fontSize={15} fill={INK}>
      {/* A — above-left of the top-left corner */}
      <text x={ax - 16} y={ay + 5} textAnchor="end" dominantBaseline="central">A</text>
      {/* B — below-right of the bottom-right corner */}
      <text x={bx + 6} y={by + 5} textAnchor="start" dominantBaseline="central">B</text>
      {/* Corner dots */}
      <circle cx={ax} cy={ay} r={4} fill={INK} />
      <circle cx={bx} cy={by} r={4} fill={INK} />
    </g>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * LShortPath22B19Illustration
 *
 * Static, problem-only figure for SEAMO-22-B-Q19 (2022 Contest B, shortest paths).
 * Shows the L-shaped grid with A at top-left and B at bottom-right.
 * Never reveals path counts or the answer (126).
 */
export default function LShortPath22B19Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Grid berbentuk L dengan A di pojok kiri atas dan B di pojok kanan bawah. ' +
        'Bagian atas grid berukuran 2 kolom × 3 baris; bagian bawah melebar menjadi 5 kolom × 2 baris.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F9FAFB" />
        <LGrid />
        <EndpointLabels />
      </svg>
    </div>
  )
}
