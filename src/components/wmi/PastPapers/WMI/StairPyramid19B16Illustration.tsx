// StairPyramid19B16Illustration — SEAMO 2019 Paper B Q16
//
// "Given that Fig. 1 has a perimeter of 10 cm, find the perimeter of the
// figure formed using 36 squares."
//
// Source figures (2019.imgs/007.jpg, 008.jpg, 009.jpg):
//   Three growing "staircase pyramid" shapes built from unit squares.
//   Each figure adds one more step on each side, creating a symmetric stepped silhouette.
//
//   Fig.1 (007.jpg):  5 squares — rows (top→bottom): 1, 2, 2
//   Fig.2 (008.jpg):  9 squares — rows: 1, 2, 3, 3
//   Fig.3 (009.jpg): 14 squares — rows: 1, 2, 3, 4, 4
//
// Key derivation:
//   Fig.1 has 10 exposed unit-edges → P₁ = 10·s = 10 cm → s = 1 cm.
//   Perimeter grows by 4 per extra step: P(k) = 4k + 2 for the k-th stair depth.
//   Target: 36 squares → answer D = 40 cm.
//
// Classification: STEM (figure in question stem; answer choices are numbers)
// Primitive used: Polyomino (./primitives/Polyomino)
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

import { Polyomino } from './primitives/Polyomino'

// ── Colour palette ────────────────────────────────────────────────────────────

const FILL    = '#4CAF50'  // green squares matching source images
const STROKE  = '#1B5E20'  // dark green outline
const BG      = '#FFFBF0'  // warm cream background
const LABEL_C = '#1B5E20'  // figure label text colour

// ── Cell lists for each figure ────────────────────────────────────────────────
// Cells are [row, col] pairs (row 0 = top, col 0 = left-most occupied col).

/** Fig.1 — 5 squares, rows top-to-bottom: 1, 2, 2 */
export const CELLS_FIG1: [number, number][] = [
  [0, 1],
  [1, 0], [1, 1],
  [2, 0], [2, 1],
]

/** Fig.2 — 9 squares, rows top-to-bottom: 1, 2, 3, 3 */
export const CELLS_FIG2: [number, number][] = [
  [0, 2],
  [1, 1], [1, 2],
  [2, 0], [2, 1], [2, 2],
  [3, 0], [3, 1], [3, 2],
]

/** Fig.3 — 14 squares, rows top-to-bottom: 1, 2, 3, 4, 4 */
export const CELLS_FIG3: [number, number][] = [
  [0, 3],
  [1, 2], [1, 3],
  [2, 1], [2, 2], [2, 3],
  [3, 0], [3, 1], [3, 2], [3, 3],
  [4, 0], [4, 1], [4, 2], [4, 3],
]

// ── Layout ────────────────────────────────────────────────────────────────────

const CELL_SIZE = 24  // px per unit square
const PAD       = 6   // Polyomino internal padding (matches primitive default)
const GAP       = 20  // horizontal gap between figures
const LABEL_H   = 20  // height below the tallest figure for the "Fig. n" label

// Intrinsic pixel dimensions for each Polyomino viewport
// formula: spanCols * cellSize + 2*pad  ×  spanRows * cellSize + 2*pad
const W1 = 2 * CELL_SIZE + 2 * PAD  // Fig.1: 2 cols × 3 rows
const H1 = 3 * CELL_SIZE + 2 * PAD
const W2 = 3 * CELL_SIZE + 2 * PAD  // Fig.2: 3 cols × 4 rows
const H2 = 4 * CELL_SIZE + 2 * PAD
const W3 = 4 * CELL_SIZE + 2 * PAD  // Fig.3: 4 cols × 5 rows
const H3 = 5 * CELL_SIZE + 2 * PAD

const TOTAL_W = W1 + GAP + W2 + GAP + W3 + PAD * 2
const TOTAL_H = H3 + LABEL_H + PAD * 2  // tallest figure + label row

// X offsets: left-to-right placement
const X1 = PAD
const X2 = X1 + W1 + GAP
const X3 = X2 + W2 + GAP

// Y offsets: bottom-align all three figures
const Y3 = PAD                   // tallest starts at top
const Y2 = PAD + (H3 - H2)
const Y1 = PAD + (H3 - H1)

const LABEL_Y = PAD + H3 + 10   // y-position for "Fig. n" labels

// ── Figure component (reusable by explainer) ──────────────────────────────────

export interface StairPyramid19B16FigureProps {
  /** Highlight a specific figure number (1–3), or null for none. */
  highlightFig?: 1 | 2 | 3 | null
}

export function StairPyramid19B16Figure({
  highlightFig = null,
}: StairPyramid19B16FigureProps) {
  const getFill   = (n: 1 | 2 | 3) => highlightFig === n ? '#81C784' : FILL
  const getStroke = (n: 1 | 2 | 3) => highlightFig === n ? '#2E7D32' : STROKE

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width="100%"
      style={{ maxWidth: TOTAL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={TOTAL_W} height={TOTAL_H} fill={BG} rx={8} />

      {/* ── Fig. 1 ── */}
      <g transform={`translate(${X1} ${Y1})`}>
        <Polyomino
          cells={CELLS_FIG1}
          cellSize={CELL_SIZE}
          pad={PAD}
          fill={getFill(1)}
          stroke={getStroke(1)}
          strokeWidth={1.5}
        />
      </g>
      <text
        x={X1 + W1 / 2}
        y={LABEL_Y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="600"
        fontFamily="'Nunito', 'Segoe UI', system-ui, sans-serif"
        fill={LABEL_C}
      >
        Fig. 1
      </text>

      {/* ── Fig. 2 ── */}
      <g transform={`translate(${X2} ${Y2})`}>
        <Polyomino
          cells={CELLS_FIG2}
          cellSize={CELL_SIZE}
          pad={PAD}
          fill={getFill(2)}
          stroke={getStroke(2)}
          strokeWidth={1.5}
        />
      </g>
      <text
        x={X2 + W2 / 2}
        y={LABEL_Y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="600"
        fontFamily="'Nunito', 'Segoe UI', system-ui, sans-serif"
        fill={LABEL_C}
      >
        Fig. 2
      </text>

      {/* ── Fig. 3 ── */}
      <g transform={`translate(${X3} ${Y3})`}>
        <Polyomino
          cells={CELLS_FIG3}
          cellSize={CELL_SIZE}
          pad={PAD}
          fill={getFill(3)}
          stroke={getStroke(3)}
          strokeWidth={1.5}
        />
      </g>
      <text
        x={X3 + W3 / 2}
        y={LABEL_Y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="600"
        fontFamily="'Nunito', 'Segoe UI', system-ui, sans-serif"
        fill={LABEL_C}
      >
        Fig. 3
      </text>
    </svg>
  )
}

// ── Default export — static illustration ─────────────────────────────────────

export default function StairPyramid19B16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Three staircase pyramid figures made of green unit squares. ' +
        'Fig. 1: 5 squares (rows 1–2–2 from top). ' +
        'Fig. 2: 9 squares (rows 1–2–3–3). ' +
        'Fig. 3: 14 squares (rows 1–2–3–4–4). ' +
        'Fig. 1 has perimeter 10 cm; find the perimeter of the figure with 36 squares.'
      }
    >
      <StairPyramid19B16Figure />
    </div>
  )
}

// ── Registry wiring (paste into registry.ts — do NOT modify this file) ────────
//
//   'SEAMO-19-B-Q16': {
//     illustration: () => import('./StairPyramid19B16Illustration'),
//   },
