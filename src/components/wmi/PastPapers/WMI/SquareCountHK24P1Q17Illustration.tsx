// HKIMO-24-P1H-Q17 — Count all squares in a staircase figure (answer = 11)
//
// Figure: 9 unit cells in a diagonal staircase (faithful to 2024.imgs/006.jpg)
//   col:  1  2  3
//   row 0: X  .  .
//   row 1: X  X  .
//   row 2: X  X  X   ← widest row
//   row 3: .  X  X
//   row 4: .  X  .
//
// 2×2 squares that can be traced:
//   A: rows 1-2 × cols 1-2 (top-left quadrant of the wide row)
//   B: rows 2-3 × cols 2-3 (bottom-right quadrant of the wide row)
// Total: 9 (1×1) + 2 (2×2) = 11 ✓  trap = 9 (only 1×1 counted)
//
// Primitive: custom SVG for per-cell highlight control (shared with Explainer).
// SSR-safe: no hooks, no framer-motion, no window/document.

const CELL = 40   // px per grid cell
const PAD = 8     // padding around shape in SVG

// Grid coordinate helpers — col 1 is left edge, row 0 is top edge
const MIN_COL = 1
const MIN_ROW = 0
const SPAN_COLS = 3  // cols 1-3
const SPAN_ROWS = 5  // rows 0-4

const VB_W = SPAN_COLS * CELL + PAD * 2  // 136
const VB_H = SPAN_ROWS * CELL + PAD * 2  // 216

/** Grid col → SVG x */
function cx(col: number) { return PAD + (col - MIN_COL) * CELL }
/** Grid row → SVG y */
function cy(row: number) { return PAD + (row - MIN_ROW) * CELL }

/** Cells of the staircase [row, col] — 9 unit squares */
const SHAPE_CELLS: [number, number][] = [
  [0, 1],
  [1, 1], [1, 2],
  [2, 1], [2, 2], [2, 3],
  [3, 2], [3, 3],
  [4, 2],
]

export interface SquareCountDiagramProps {
  /** Highlight the top 2×2 square (rows 1-2, cols 1-2) in amber */
  highlightA?: boolean
  /** Highlight the bottom 2×2 square (rows 2-3, cols 2-3) in blue */
  highlightB?: boolean
}

/** Shared diagram — used by both the illustration and the explainer. */
export function SquareCountDiagram({ highlightA = false, highlightB = false }: SquareCountDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ maxWidth: VB_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Cell fills (white base) */}
      {SHAPE_CELLS.map(([r, c]) => (
        <rect
          key={`bg-${r}-${c}`}
          x={cx(c)}
          y={cy(r)}
          width={CELL}
          height={CELL}
          fill="#FFFFFF"
          stroke="none"
        />
      ))}

      {/* 2×2 highlight A — amber fill (rows 1-2, cols 1-2) */}
      {highlightA && (
        <rect
          x={cx(1)}
          y={cy(1)}
          width={2 * CELL}
          height={2 * CELL}
          fill="#FDE68A"
          opacity={0.75}
          stroke="none"
        />
      )}

      {/* 2×2 highlight B — blue fill (rows 2-3, cols 2-3) */}
      {highlightB && (
        <rect
          x={cx(2)}
          y={cy(2)}
          width={2 * CELL}
          height={2 * CELL}
          fill="#BFDBFE"
          opacity={0.75}
          stroke="none"
        />
      )}

      {/* Cell borders (drawn on top of fills) */}
      {SHAPE_CELLS.map(([r, c]) => (
        <rect
          key={`border-${r}-${c}`}
          x={cx(c)}
          y={cy(r)}
          width={CELL}
          height={CELL}
          fill="none"
          stroke="#1F2937"
          strokeWidth={2}
        />
      ))}

      {/* 2×2 highlight A border */}
      {highlightA && (
        <rect
          x={cx(1)}
          y={cy(1)}
          width={2 * CELL}
          height={2 * CELL}
          fill="none"
          stroke="#D97706"
          strokeWidth={2.5}
        />
      )}

      {/* 2×2 highlight B border */}
      {highlightB && (
        <rect
          x={cx(2)}
          y={cy(2)}
          width={2 * CELL}
          height={2 * CELL}
          fill="none"
          stroke="#2563EB"
          strokeWidth={2.5}
        />
      )}
    </svg>
  )
}

/** Default export: stem illustration (no highlights — shows problem only). */
export default function SquareCountHK24P1Q17Illustration() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
      <SquareCountDiagram />
    </div>
  )
}
