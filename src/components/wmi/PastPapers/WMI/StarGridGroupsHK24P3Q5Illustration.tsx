// StarGridGroupsHK24P3Q5Illustration.tsx
// HKIMO-24-P3H-Q5 stem illustration.
//
// The question shows 4 groups of * symbols (all cells filled):
//   Group 1 (1 row × 1 col): 1 star
//   Group 2 (2 rows × 1 col): 2 stars
//   Group 3 (3 rows × 2 cols): 6 stars
//   Group 4 (4 rows × 3 cols): 12 stars
//
// Pattern: Group n (n≥2) has n rows × (n−1) columns → n×(n−1) stars.
// Students find Group 14 → 14×13 = 182.
//
// Primitive used: GridBoard from ./primitives/GridBoard.

import { GridBoard } from './primitives/GridBoard'

// ── Layout constants ───────────────────────────────────────────────────────────

const CELL    = 36
const TOP_PAD = 8
const GAP     = 14
const LABEL_H = 20
const BOT_PAD = 8
const MAX_H   = 4 * CELL  // 144 — tallest group (4 rows)

// cols per group: G1→1, G2→1, G3→2, G4→3
function groupCols(n: number) { return n === 1 ? 1 : n - 1 }

// x-positions: G1 at 8, then each group's width + GAP
const GROUP_X = [
  8,
  8 + 1 * CELL + GAP,
  8 + 1 * CELL + GAP + 1 * CELL + GAP,
  8 + 1 * CELL + GAP + 1 * CELL + GAP + 2 * CELL + GAP,
]
// [8, 58, 108, 194]

const SVG_W = GROUP_X[3] + 3 * CELL + 8   // 194 + 108 + 8 = 310
const SVG_H = TOP_PAD + MAX_H + LABEL_H + BOT_PAD  // 8 + 144 + 20 + 8 = 180
const LABEL_Y = TOP_PAD + MAX_H + 13  // 165

// ── Component ─────────────────────────────────────────────────────────────────

export default function StarGridGroupsHK24P3Q5Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      aria-label="Star group pattern: Group 1 has 1 star (1×1), Group 2 has 2 stars (2×1), Group 3 has 6 stars (3×2), Group 4 has 12 stars (4×3). Find the count in Group 14."
    >
      {[1, 2, 3, 4].map((n, gi) => {
        const gx   = GROUP_X[gi]
        const gc   = groupCols(n)
        const gh   = n * CELL
        const gy   = TOP_PAD + MAX_H - gh  // bottom-align groups

        return (
          <g key={n} transform={`translate(${gx}, ${gy})`}>
            <GridBoard
              rows={n}
              cols={gc}
              cellSize={CELL}
              fill={() => '#FEF9C3'}
              label={() => '*'}
              gridStroke="#9CA3AF"
            />
          </g>
        )
      })}

      {/* Group labels */}
      {[1, 2, 3, 4].map((n, gi) => {
        const gx   = GROUP_X[gi]
        const gc   = groupCols(n)
        const midX = gx + (gc * CELL) / 2
        const ord  = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
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
            {`${n}${ord} Group`}
          </text>
        )
      })}
    </svg>
  )
}
