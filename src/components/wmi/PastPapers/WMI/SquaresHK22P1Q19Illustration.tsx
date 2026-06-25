// Stem illustration for HKIMO-22-P1H-Q19
// "How many squares are there in the figure below?"
//
// The figure is an 8-cell polyomino (Z-shape):
//   Row 0: cols 1-2  (2 unit squares — top-centre-left)
//   Row 1: cols 0-3  (4 unit squares — full width middle)
//   Row 2: cols 2-3  (2 unit squares — bottom-right)
//
// Answer: 10 (8 unit + 2 two-by-two). Illustration shows ONLY the problem
// figure — no highlights, no answer markings.
//
// SSR-safe: no hooks, no framer-motion, no window/document.

import { Polyomino } from './primitives/Polyomino'

const CELLS: [number, number][] = [
  [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 2], [2, 3],
]

export default function SquaresHK22P1Q19Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label="A Z-shaped figure: 2 squares top-centre-left, 4 squares in the middle row, 2 squares bottom-right"
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
