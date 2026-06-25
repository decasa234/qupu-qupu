// HKIMO-23-P1SF-Q19 — stem illustration
// "How many squares are there in the figure below?"
//
// Figure: irregular 9-cell grid (all unit squares are 1×1):
//   Row 0: cols 0, 1
//   Row 1: cols 0, 1, 2, 3
//   Row 2: cols 1, 2, 3
//
// Answer: 9 unit (1×1) + 3 composite (2×2) = 12 squares total.
// This illustration shows ONLY the figure, not the answer.
//
// SSR-safe: no hooks, no framer-motion, no window/document.

const C = 60   // cell size in SVG units
const PAD = 8  // padding around figure

// Cells present: [row, col]
const CELLS: [number, number][] = [
  [0, 0], [0, 1],
  [1, 0], [1, 1], [1, 2], [1, 3],
          [2, 1], [2, 2], [2, 3],
]

const VW = PAD * 2 + 4 * C   // 256
const VH = PAD * 2 + 3 * C   // 196

export default function CountSquaresHK23P1SFQ19Illustration() {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={VW}
      height={VH}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {CELLS.map(([r, c]) => (
        <rect
          key={`cell-${r}-${c}`}
          x={PAD + c * C}
          y={PAD + r * C}
          width={C}
          height={C}
          fill="#FFFFFF"
          stroke="#374151"
          strokeWidth={2}
        />
      ))}
    </svg>
  )
}
