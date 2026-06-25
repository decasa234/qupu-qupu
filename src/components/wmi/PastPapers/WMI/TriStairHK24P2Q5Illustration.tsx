// Stem illustration for HKIMO-24-P2H-Q5
// "According to the pattern shown below, how many * is/are there in the 10th group?"
//
// Groups 1–4 shown side-by-side (bottom-aligned). Group n is an n×n grid where
// row r (0-indexed) has (n−r) stars in columns 0 … n−r−1. This is the classic
// triangular staircase: totals are 1, 3, 6, 10 (triangular numbers n(n+1)/2).
//
// Primitive: GridBoard from './primitives/GridBoard'
// SSR-safe: no hooks, no framer-motion.

import { GridBoard } from './primitives/GridBoard'

const CELL   = 24
const GAP    = 14
const PAD    = 10
const MAX_N  = 4

// x-offset for each group (index 1–4)
const GROUP_X: Record<number, number> = {
  1: PAD,
  2: PAD + 1 * CELL + GAP,
  3: PAD + 1 * CELL + GAP + 2 * CELL + GAP,
  4: PAD + 1 * CELL + GAP + 2 * CELL + GAP + 3 * CELL + GAP,
}

// bottom-align all groups to the same baseline
const groupY = (n: number) => PAD + (MAX_N - n) * CELL

const VW = PAD + (1 + 2 + 3 + 4) * CELL + 3 * GAP + PAD   // 302
const VH = PAD + MAX_N * CELL + 22 + PAD                    // 138

const ORDINALS = ['', '1st', '2nd', '3rd', '4th']

/** Row r of group n has stars in columns 0 … n−r−1 */
function isFilled(n: number, r: number, c: number): boolean {
  return c < n - r
}

export default function TriStairHK24P2Q5Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label="Groups 1 to 4: each group n shows a triangular staircase with n(n+1)/2 stars"
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-hidden="true">
        {([1, 2, 3, 4] as const).map(n => {
          const gx = GROUP_X[n]
          const gy = groupY(n)
          return (
            <g key={n} transform={`translate(${gx},${gy})`}>
              <GridBoard
                rows={n}
                cols={n}
                cellSize={CELL}
                fill={(r, c) => (isFilled(n, r, c) ? '#FDE68A' : '#F8FAFC')}
                label={(r, c) => (isFilled(n, r, c) ? '*' : '')}
              />
              <text
                x={n * CELL / 2}
                y={n * CELL + 16}
                textAnchor="middle"
                fontSize={11}
                fill="#374151"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {ORDINALS[n]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
