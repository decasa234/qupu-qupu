// Stem illustration for HKIMO-24-P1H-Q5
// "According to the pattern shown below, how many ★ are in the 6th group?"
//
// Groups 1–4 shown side-by-side. Group n is an n×n grid of stars with the
// bottom-right cell empty (n²−1 stars). Group 1 is special: 1×1 = 1 star.
//
// Primitive: GridBoard from './primitives/GridBoard'
// SSR-safe: no hooks, no framer-motion.

import { GridBoard } from './primitives/GridBoard'

const CELL = 24
const GAP  = 14
const PAD  = 10
const MAX_N = 4

// x-offset for each group (index 1–4)
const GROUP_X: Record<number, number> = {
  1: PAD,
  2: PAD + CELL + GAP,
  3: PAD + CELL + GAP + 2 * CELL + GAP,
  4: PAD + CELL + GAP + 2 * CELL + GAP + 3 * CELL + GAP,
}

// bottom-align all groups to MAX_N * CELL baseline
const groupY = (n: number) => PAD + (MAX_N - n) * CELL

// 10 + (1+2+3+4)*CELL + 3*GAP + 10 = 10 + 240 + 42 + 10 = 302
const VW = PAD + (1 + 2 + 3 + 4) * CELL + 3 * GAP + PAD
// 10 + 4*24 + 22 + 10 = 138
const VH = PAD + MAX_N * CELL + 22 + PAD

const ORDINALS = ['', '1st', '2nd', '3rd', '4th']

function isFilled(n: number, r: number, c: number): boolean {
  if (n === 1) return true          // 1×1: the only cell is filled
  return !(r === n - 1 && c === n - 1)  // bottom-right is empty for n≥2
}

export default function StarGridHK24P1Q5Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label="Groups 1 to 4: each group n shows an n×n star grid with the bottom-right cell empty"
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
                label={(r, c) => (isFilled(n, r, c) ? '★' : '')}
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
