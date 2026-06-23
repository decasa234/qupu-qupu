// DotGrid16B4Illustration.tsx
//
// Stem illustration for SEAMO-16-B-Q4:
//   "The figure shown below is a 4 × 4 square grid.
//    How many squares contain the dot?"
//
// The dot is placed in the interior of cell (row=1, col=2) — one of the four
// inner cells of the 4×4 grid. For any inner cell, the count is:
//   1×1 squares: 1
//   2×2 squares: 4
//   3×3 squares: 4
//   4×4 squares: 1
//   Total: 10 → answer B
//
// The component renders the 4×4 grid using GridBoard, then overlays the dot
// as a plain SVG circle. Pure SVG, SSR-safe — no hooks, no framer-motion.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── Geometry constants ────────────────────────────────────────────────────────

/** Grid dimensions */
export const ROWS = 4
export const COLS = 4

/** Cell size in SVG units */
export const CELL = 52

/** Dot position — 0-indexed (row, col) inside which cell the dot sits.
 *  Row 1, Col 2 is one of the 4 inner cells → gives the 1+4+4+1=10 count. */
export const DOT_ROW = 1
export const DOT_COL = 2

/** Dot rendered at the centre of its cell */
export const DOT_CX = DOT_COL * CELL + CELL / 2
export const DOT_CY = DOT_ROW * CELL + CELL / 2
export const DOT_R = 5

/** Padding around the grid so the outer border stroke isn't clipped */
const PAD = 12

/** SVG viewBox — grid starts at (PAD, PAD) */
const VB_W = COLS * CELL + PAD * 2
const VB_H = ROWS * CELL + PAD * 2

// ── Main illustration ─────────────────────────────────────────────────────────

/**
 * DotGrid16B4Illustration
 *
 * Static, problem-only figure for SEAMO-16-B-Q4.
 * Shows a 4×4 square grid with a single dot placed at the interior
 * of cell (row=1, col=2). Students count every sub-square (of any size)
 * that contains the dot. Answer: 10 (choice B).
 */
export default function DotGrid16B4Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi persegi 4×4 dengan sebuah titik di dalam salah satu sel bagian dalam. ' +
        'Berapa banyak persegi (ukuran apa pun) yang memuat titik tersebut?'
      }
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width={Math.min(280, VB_W * 1.2)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="white" />

        {/* 4×4 grid — offset by PAD so outer border isn't clipped */}
        <g transform={`translate(${PAD}, ${PAD})`}>
          <GridBoard
            rows={ROWS}
            cols={COLS}
            cellSize={CELL}
            gridStroke="#374151"
          />

          {/* The dot */}
          <circle
            cx={DOT_CX}
            cy={DOT_CY}
            r={DOT_R}
            fill="#1F2937"
          />
        </g>
      </svg>
    </div>
  )
}

// ── Registry value ─────────────────────────────────────────────────────────────
//
// Add to registry.ts:
//
//   'SEAMO-16-B-Q4': {
//     illustration: () => import('./DotGrid16B4Illustration'),
//   },
