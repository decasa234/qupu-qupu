// Stem illustration for HKIMO-18-P1H-Q25
// "Ming would like to pick up all apples on the floor.
//  What is the minimum distance he needs to travel?
//  Distance between adjacent apples = 1 m."
//
// 16 apples in a 4-column × 5-row pattern:
//   Row 0, 2, 4: full rows of 4 apples
//   Row 1, 3: corner apples only (cols 0 and 3)
//
// Answer: 15 m (Hamiltonian path — all 15 edges are 1 m).
// This illustration shows ONLY the problem, not the path or answer.
//
// Primitive: Apple from './primitives/glyphs'
// SSR-safe: no hooks, no framer-motion.

import { Apple } from './primitives/glyphs'

const CELL = 54   // px per grid cell
const PAD  = 22   // px padding around grid
const HALF = CELL / 2

const VW = PAD * 2 + 4 * CELL  // 260
const VH = PAD * 2 + 5 * CELL  // 314

// [row, col] pairs for all 16 apple positions
const APPLES: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 0], [1, 3],
  [2, 0], [2, 1], [2, 2], [2, 3],
  [3, 0], [3, 3],
  [4, 0], [4, 1], [4, 2], [4, 3],
]

const cx = (col: number) => PAD + HALF + col * CELL
const cy = (row: number) => PAD + HALF + row * CELL

export default function AppleGridHK18P1Q25Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[280px]"
      role="img"
      aria-label="16 apples on a floor grid: full rows at top, middle, and bottom, with only corner apples in rows 2 and 4"
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-hidden="true">
        {/* faint grid lines */}
        {Array.from({ length: 6 }, (_, r) => (
          <line
            key={`h${r}`}
            x1={PAD} y1={PAD + r * CELL}
            x2={PAD + 4 * CELL} y2={PAD + r * CELL}
            stroke="#CBD5E1"
            strokeWidth={0.8}
          />
        ))}
        {Array.from({ length: 5 }, (_, c) => (
          <line
            key={`v${c}`}
            x1={PAD + c * CELL} y1={PAD}
            x2={PAD + c * CELL} y2={PAD + 5 * CELL}
            stroke="#CBD5E1"
            strokeWidth={0.8}
          />
        ))}

        {/* apple glyphs */}
        {APPLES.map(([r, c]) => (
          <Apple key={`a${r}${c}`} cx={cx(c)} cy={cy(r)} r={18} />
        ))}
      </svg>
    </div>
  )
}
