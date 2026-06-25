// Stem illustration for HKIMO-18-P1H-Q16
// "How many squares are there in the figure below?"
//
// The figure is a 7-cell polyomino:
//   Row 0: cols 0-3  (4 unit squares)
//   Row 1: cols 1-3  (3 unit squares)
//
// Answer: 9 (7 unit + 2 two-by-two). The illustration shows ONLY the
// problem figure — no highlights, no answer marking.
//
// SSR-safe: no hooks, no framer-motion, no window/document.

import { Polyomino } from './primitives/Polyomino'

const CELLS: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 1], [1, 2], [1, 3],
]

export default function SquaresHK18P1Q16Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label="A 7-cell figure: 4 squares on top, 3 squares on the bottom-right"
    >
      <Polyomino
        cells={CELLS}
        cellSize={50}
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth={2}
        showGrid
      />
    </div>
  )
}
