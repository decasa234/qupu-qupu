/**
 * IKMC-21-PE-Q13 — "Which figure can be made of these two pieces?"
 * Answer: A.
 *
 * Stem (021.jpg): Two identical Z-tetrominoes displayed side-by-side with a "+".
 * Each piece covers 4 cells in a Z-shape:
 *   Piece cells (row, col from 0):
 *     (0,0) (0,1)
 *             (1,1) (1,2)
 *
 * The cells use the IKMC 2021 Pre-Ecolier orange/teal checkerboard fill:
 *   fill = ORANGE when (row + col) % 2 === 0, else TEAL.
 *
 * Options A–E (022–026.jpg) are each 3×3 grid shapes with various cell
 * arrangements. When the two Z-tetrominoes are combined (one turned 180°),
 * they fill exactly 8 cells forming the shape shown in option A:
 *   3×3 grid minus the top-right corner cell (0,2).
 *
 *   ■ ■ .
 *   ■ ■ ■
 *   ■ ■ ■
 *
 * Adapted from JoinPieces20Illustration (PolyShape primitive pattern +
 * checkerboard-fill grid cells). Co-exports TwoPieces13PEOption for
 * CHOICE_RENDERERS.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ────────────────────────────────────────────────────────────
const ORANGE = '#F97316'   // orange cells (checkerboard even positions)
const TEAL   = '#0D9488'   // teal cells   (checkerboard odd positions)
const INK    = '#1F2937'   // outline stroke
const BG     = '#FFFFFF'   // background (non-cell area)

/** Returns the fill colour for a cell at (row, col) in the checkerboard. */
function cellFill(row: number, col: number): string {
  return (row + col) % 2 === 0 ? ORANGE : TEAL
}

export type Cell = [number, number] // [row, col], row 0 = top

/** The Z-tetromino as drawn in the source figure. */
export const PIECE_CELLS: Cell[] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 2],
]

/**
 * The combined 8-cell shape for option A (correct answer):
 * 3×3 grid minus the top-right corner cell (0,2).
 *
 *   (0,0) (0,1)  .
 *   (1,0) (1,1) (1,2)
 *   (2,0) (2,1) (2,2)
 */
export const ANSWER_A_CELLS: Cell[] = [
  [0, 0], [0, 1],
  [1, 0], [1, 1], [1, 2],
  [2, 0], [2, 1], [2, 2],
]

/**
 * Inside option A: cells filled by piece 1 (placed at top-left region).
 * Piece 1 (Z): (0,0)(0,1)(1,1)(1,2)
 */
export const FIT_PIECE1_CELLS: Cell[] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 2],
]

/**
 * Inside option A: cells filled by piece 2 (turned 180° → S-shape).
 * Piece 2 turned 180° fills the remaining 4 cells: (1,0)(2,0)(2,1)(2,2)
 * Wait — S placed in bottom-left: (1,0)(2,0)(2,1) + one more...
 * Actually piece 2 turned 180° is: (1,0) mapped from (0,0), so S becomes:
 *   The 180° rotation of Z: (0,0)(0,1)(1,1)(1,2) rotated 180° in bounding box =
 *   (1,0)(1,1)(0,1)(0,0) → same shape. Instead we shift: piece 2 = (1,0)(2,0)(2,1)(2,2)? No.
 *
 * Let's think directly: piece 1 fills (0,0)(0,1)(1,1)(1,2). Remaining cells of A:
 * (1,0)(2,0)(2,1)(2,2). That's an S-rotated-180° tetromino — the partner shape.
 */
export const FIT_PIECE2_CELLS: Cell[] = [
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
]

export const PIECE_FILL_1 = ORANGE  // piece 1 solid colour (for explainer fit animation)
export const PIECE_FILL_2 = TEAL    // piece 2 solid colour (for explainer fit animation)

/**
 * Draws a polyomino from [row, col] cells with bounding-box top-left at (x, y).
 * Each cell gets the checkerboard fill unless `solidFill` is provided.
 */
export function PolyShape({
  cells,
  x,
  y,
  cell = 28,
  solidFill,
  stroke = INK,
}: {
  cells: Cell[]
  x: number
  y: number
  cell?: number
  solidFill?: string
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
          fill={solidFill ?? cellFill(r, c)}
          stroke={stroke}
          strokeWidth={1.5}
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

// ── Stem diagram ─────────────────────────────────────────────────────────────

const STEM_W = 300
const STEM_H = 96

/**
 * The in-card figure: piece + piece side-by-side with "+".
 * Exported for reuse in the explainer.
 */
export function TwoPieces13PEDiagram() {
  const cell = 26
  // Each Z-piece spans 3 cols × 2 rows = 78 × 52
  const pieceW = 3 * cell
  const pieceH = 2 * cell
  const gap = 40
  const totalW = pieceW * 2 + gap
  const x0 = (STEM_W - totalW) / 2
  const y0 = (STEM_H - pieceH) / 2

  return (
    <svg
      viewBox={`0 0 ${STEM_W} ${STEM_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Left piece (Z-tetromino) */}
      <PolyShape cells={PIECE_CELLS} x={x0} y={y0} cell={cell} />
      {/* "+" separator */}
      <text
        x={x0 + pieceW + gap / 2}
        y={y0 + pieceH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
        fontWeight={900}
        fill={INK}
      >
        +
      </text>
      {/* Right piece (same Z-tetromino) */}
      <PolyShape cells={PIECE_CELLS} x={x0 + pieceW + gap} y={y0} cell={cell} />
    </svg>
  )
}

export default function TwoPieces13PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two identical Z-shaped puzzle pieces, each made of four orange and teal squares in a checkerboard pattern. The pieces are joined by a plus sign, indicating they must be combined to make one of the answer shapes."
    >
      <TwoPieces13PEDiagram />
    </div>
  )
}

// ── Option renderer ──────────────────────────────────────────────────────────
//
// Each option A–E is a specific arrangement of orange/teal grid cells.
// Source images (022–026.jpg) show 3×3 grids with various cells filled or missing.
//
// Option A (022, answer): 3×3 minus top-right corner (0,2)
//   ■ ■ .
//   ■ ■ ■
//   ■ ■ ■
//
// Option B (023): full 3×3 — 9 cells (cannot be made with 2 Z-tetrominoes = 8 cells)
//   ■ ■ ■
//   ■ ■ ■
//   ■ ■ ■
//
// Option C (024): 3×3 minus top-left corner (0,0)
//   . ■ ■
//   ■ ■ ■
//   ■ ■ ■
//
// Option D (025): 3×3 minus bottom-left corner (2,0)
//   ■ ■ ■
//   ■ ■ ■
//   . ■ ■
//
// Option E (026): 3×3 minus bottom-right corner (2,2)
//   ■ ■ ■
//   ■ ■ ■
//   ■ ■ .

type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

/** Cell lists for each option (missing cell = absent from list). */
export const OPTION_CELLS: Record<OptionLabel, Cell[]> = {
  A: [ // 3×3 minus top-right (0,2)
    [0, 0], [0, 1],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2],
  ],
  B: [ // full 3×3
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2],
  ],
  C: [ // 3×3 minus top-left (0,0)
    [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2],
  ],
  D: [ // 3×3 minus bottom-left (2,0)
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 1], [2, 2],
  ],
  E: [ // 3×3 minus bottom-right (2,2)
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1],
  ],
}

const OPT_CELL = 24
const OPT_PAD  = 4
const OPT_W    = 3 * OPT_CELL + OPT_PAD * 2
const OPT_H    = 3 * OPT_CELL + OPT_PAD * 2

const OPT_ARIA: Record<OptionLabel, string> = {
  A: 'Option A: 3×3 grid with the top-right cell missing — eight orange and teal squares. This is the correct answer.',
  B: 'Option B: full 3×3 grid of nine orange and teal squares.',
  C: 'Option C: 3×3 grid with the top-left cell missing — eight orange and teal squares.',
  D: 'Option D: 3×3 grid with the bottom-left cell missing — eight orange and teal squares.',
  E: 'Option E: 3×3 grid with the bottom-right cell missing — eight orange and teal squares.',
}

/**
 * TwoPieces13PEOption — renders ONE answer choice (A–E) as a coloured grid.
 * Registered in CHOICE_RENDERERS for IKMC-21-PE-Q13.
 */
export function TwoPieces13PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase() as OptionLabel
  const cells = OPTION_CELLS[label]
  if (!cells) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={OPT_ARIA[label] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${OPT_W} ${OPT_H}`}
        width={OPT_W}
        height={OPT_H}
        style={{ display: 'block', background: BG, borderRadius: 4 }}
        aria-hidden="true"
      >
        <PolyShape cells={cells} x={OPT_PAD} y={OPT_PAD} cell={OPT_CELL} />
      </svg>
    </span>
  )
}
