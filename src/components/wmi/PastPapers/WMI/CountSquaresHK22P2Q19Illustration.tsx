// HKIMO-22-P2H-Q19 — "How many squares are there in the figure below?"
//
// Stem figure: a 3-column × 3-row rectangular grid of empty unit squares.
// Answer: 14 (9 × 1×1 + 4 × 2×2 + 1 × 3×3).
//
// Shows only the PROBLEM figure — not the answer.
// Pure SVG via GridBoard primitive. No hooks, no framer-motion, SSR-safe.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

const ROWS = 3
const COLS = 3
const CELL = 64

export default function CountSquaresHK22P2Q19Illustration() {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A 3-column by 3-row rectangular grid of empty squares."
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
