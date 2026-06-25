// Stem illustration for HKIMO-25-P1H-Q17
// "How many squares are there in the figure below?"
//
// The figure is an 8-cell staircase polyomino:
//   Row 0: cols 1-2  (2 unit cells — top step)
//   Row 1: cols 0-2  (3 unit cells — middle step, extends left)
//   Row 2: cols 1-3  (3 unit cells — bottom step, extends right)
//
// Faithful reconstruction from OCR image 2025.imgs/006.jpg.
// Note: standard square-counting gives 10 (8 × 1×1 + 2 × 2×2);
// the seed answer of 8 may be intended as unit-cells-only for P1 level.
//
// Primitive: Polyomino from './primitives/Polyomino'
// SSR-safe: no hooks, no framer-motion.

import { Polyomino } from './primitives/Polyomino'

const CELLS: [number, number][] = [
  [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
  [2, 1], [2, 2], [2, 3],
]

export default function StaircaseHK25P1Q17Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label="A staircase figure: 2 squares on top, 3 in the middle, 3 on the bottom-right"
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
