// StarGroupPatternHK25P2Q5Illustration.tsx
// HKIMO-25-P2H-Q5 stem illustration.
//
// The question shows 4 groups of * symbols:
//   Group 1 (1×1 grid): 1 * → L-shape top row + left column
//   Group 2 (2×2 grid): 3 *
//   Group 3 (3×3 grid): 5 *
//   Group 4 (4×4 grid): 7 *
//
// Pattern: group n has 2n−1 stars.
// The figure shows the first 4 groups; students find group 99 → 197.
//
// Primitive used: GridBoard + gridBoardViewBox from ./primitives/GridBoard.

import { GridBoard } from './primitives/GridBoard'

// ── Layout constants ───────────────────────────────────────────────────────────

const CELL     = 40
const TOP_PAD  = 8
const GAP      = 16
const LABEL_H  = 20
const BOT_PAD  = 8
const MAX_H    = 4 * CELL  // 160 — tallest group (group 4)

// x position of each group's grid (groups 1–4, index 0–3)
const GROUP_X = [8, 8 + CELL + GAP, 8 + CELL + GAP + 2 * CELL + GAP, 8 + CELL + GAP + 2 * CELL + GAP + 3 * CELL + GAP]
// [8, 64, 160, 296]

const SVG_W = GROUP_X[3] + 4 * CELL + 8  // 296 + 160 + 8 = 464
const SVG_H = TOP_PAD + MAX_H + LABEL_H + BOT_PAD  // 8 + 160 + 20 + 8 = 196
const LABEL_Y = TOP_PAD + MAX_H + 13  // 181

// ── Star placement logic ───────────────────────────────────────────────────────

/** Returns true when the cell at (r, c) in group n contains a *. */
function hasStar(r: number, c: number): boolean {
  return r === 0 || c === 0
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StarGroupPatternHK25P2Q5Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      aria-label="Star group pattern: each group n has an n×n grid with * symbols in the top row and left column (2n−1 stars total)"
    >
      {[1, 2, 3, 4].map((n, gi) => {
        const gx   = GROUP_X[gi]
        const gh   = n * CELL
        const gy   = TOP_PAD + MAX_H - gh  // bottom-align all groups
        const midX = gx + (n * CELL) / 2

        return (
          <g key={n} transform={`translate(${gx}, ${gy})`}>
            <GridBoard
              rows={n}
              cols={n}
              cellSize={CELL}
              fill={(r, c) => (hasStar(r, c) ? '#FEF9C3' : '#FFFFFF')}
              label={(r, c) => (hasStar(r, c) ? '*' : undefined)}
              gridStroke="#9CA3AF"
            />
          </g>
        )
      })}

      {/* Group labels below grids */}
      {[1, 2, 3, 4].map((n, gi) => {
        const gx   = GROUP_X[gi]
        const midX = gx + (n * CELL) / 2
        return (
          <text
            key={`lbl-${n}`}
            x={midX}
            y={LABEL_Y}
            textAnchor="middle"
            fontSize={10}
            fill="#6B7280"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {`${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} Group`}
          </text>
        )
      })}
    </svg>
  )
}
