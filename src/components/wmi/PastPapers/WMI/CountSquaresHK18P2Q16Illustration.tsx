// HKIMO-18-P2H-Q16 — "How many squares are there in the figure below?"
//
// Stem figure: a 4-column × 3-row rectangular grid of empty unit squares.
// Answer: 20 (12 × 1×1 + 6 × 2×2 + 2 × 3×3).
//
// Shows only the PROBLEM figure — not the answer.
// Pure SVG via GridBoard primitive. No hooks, no framer-motion, SSR-safe.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

const ROWS = 3
const COLS = 4
const CELL = 56

export default function CountSquaresHK18P2Q16Illustration() {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A 4-column by 3-row rectangular grid of empty squares."
    >
      <svg
        viewBox={vb}
        width={COLS * CELL}
        height={ROWS * CELL}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <GridBoard
          rows={ROWS}
          cols={COLS}
          cellSize={CELL}
          gridStroke="#374151"
        />
      </svg>
    </div>
  )
}
