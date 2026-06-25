// TriStarGroupsHK23P3SFQ2Illustration.tsx
// HKIMO-23-P3SF-Q2 stem illustration.
//
// Shows 4 groups of n×n grids (n = 1..4), bottom-aligned.
// Groups 1–2: empty grids (no stars, matching the source figure).
// Groups 3–4: stars (*) placed in the upper-left triangle — cells where
// col < n − row − 1 (0-indexed) — giving n(n−1)/2 stars per group (3 and 6).
// Question asks for the star count in Group 16: 16×15/2 = 120.
//
// Primitive: GridBoard from ./primitives/GridBoard (fill + label callbacks).

import { GridBoard } from './primitives/GridBoard'

// ── Layout constants ────────────────────────────────────────────────────────────

const CS      = 26    // cell size (px)
const GAP     = 12    // horizontal gap between groups
const PAD     = 8     // side padding
const MAX_H   = 4 * CS  // 104 — tallest group (4×4)
const TOP_PAD = 8
const LABEL_Y = TOP_PAD + MAX_H + 16   // 128

// Left-edge x for each group (index 0 = Group 1, ..., index 3 = Group 4)
const GX = [
  PAD,
  PAD + 1 * CS + GAP,
  PAD + 1 * CS + GAP + 2 * CS + GAP,
  PAD + 1 * CS + GAP + 2 * CS + GAP + 3 * CS + GAP,
]
// [8, 46, 110, 200]

const SVG_W = GX[3] + 4 * CS + PAD   // 200 + 104 + 8 = 312
const SVG_H = TOP_PAD + MAX_H + 24   // 140

// ── Star placement helper ──────────────────────────────────────────────────────

/** True when cell (r, c) (0-indexed) in an n×n grid should contain a star. */
function hasStar(n: number, r: number, c: number): boolean {
  // Groups 1–2 are shown empty in the source figure.
  // Groups 3+ fill the upper-left triangle: col < n − row − 1.
  return n >= 3 && c < n - r - 1
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TriStarGroupsHK23P3SFQ2Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      aria-label="Star triangle groups: Group 1 (1×1, empty), Group 2 (2×2, empty), Group 3 (3×3, 3 stars in upper-left triangle), Group 4 (4×4, 6 stars). Find the star count in Group 16."
    >
      {([1, 2, 3, 4] as const).map((n, gi) => {
        const gx   = GX[gi]
        const gy   = TOP_PAD + MAX_H - n * CS   // bottom-align
        const midX = gx + (n * CS) / 2
        const ord  = (['st', 'nd', 'rd', 'th'] as const)[gi]

        return (
          <g key={n}>
            <GridBoard
              rows={n}
              cols={n}
              cellSize={CS}
              fill={(r, c) => hasStar(n, r, c) ? '#FEF9C3' : undefined}
              label={(r, c) => hasStar(n, r, c) ? '*' : undefined}
              gridStroke="#9CA3AF"
              transform={`translate(${gx}, ${gy})`}
            />
            <text
              x={midX}
              y={LABEL_Y}
              textAnchor="middle"
              fontSize={9}
              fill="#6B7280"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {`${n}${ord} Group`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
