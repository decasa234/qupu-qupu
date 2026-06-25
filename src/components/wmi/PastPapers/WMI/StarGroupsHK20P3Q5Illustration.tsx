// HKIMO-20-P3H-Q5 — "According to the pattern shown below, how many * in the 13th group?"
//
// STATIC PROBLEM FIGURE — four bordered star-grid groups side by side.
// Group 1: 1 star (1×1 grid), Group 2: 2 stars (2×2 left col),
// Group 3: 5 stars (3×3 staircase), Group 4: 8 stars (4×4 staircase).
// Stem only — does NOT reveal the answer (35).
//
// Primitive used: GridBoard (import-first rule satisfied).
// Pure render — no Math.random, no Date, no hooks, SSR-safe & deterministic.

import { GridBoard } from './primitives/GridBoard'

// ── layout constants (re-exported so the explainer shares the same geometry) ──

/** Pixels per grid cell. */
export const CELL = 26

/** Gap between adjacent groups. */
export const GAP = 12

/** Outer padding. */
export const PAD = 8

/** Left-edge X for each group grid (index 0 = G1, 1 = G2, 2 = G3, 3 = G4). */
export const GX: number[] = [
  PAD,
  PAD + 1 * CELL + GAP,
  PAD + 1 * CELL + GAP + 2 * CELL + GAP,
  PAD + 1 * CELL + GAP + 2 * CELL + GAP + 3 * CELL + GAP,
]
// = [8, 46, 110, 200]

/** Tallest group (G4 is 4 rows). */
export const MAX_H = 4 * CELL  // 104

/** Y of group ordinal labels (below grids). */
export const LABEL_Y = PAD + MAX_H + 11  // 123

/** Y of star-count labels. */
export const COUNT_Y = LABEL_Y + 13      // 136

export const SVG_W = GX[3] + 4 * CELL + PAD  // 200 + 104 + 8 = 312
export const SVG_H = COUNT_Y + 10             // 146

// ── colour tokens ──────────────────────────────────────────────────────────────

export const STAR_FILL    = '#FEF3C7'  // amber-100 — star cells
export const EMPTY_FILL   = '#FFFFFF'  // white — empty cells
export const LABEL_COLOR  = '#374151'  // gray-700
export const COUNT_COLOR  = '#B45309'  // amber-700
export const GRID_STROKE  = '#9CA3AF'  // gray-400

// ── star predicate ─────────────────────────────────────────────────────────────

/**
 * Returns true when cell (r, c) in group n has a star.
 *
 * Column-height derivation (0-indexed row from top):
 *   G1: col0=1                        → 1 star
 *   G2: col0=2                        → 2 stars
 *   G3: col0=3, col1=2                → 5 stars
 *   G4: col0=4, col1=3, col2=1        → 8 stars
 *
 * Differences from G3 onward: G4−G3 = 3, so +3 per group.
 */
export function isStar(n: number, r: number, c: number): boolean {
  if (n === 1) return r === 0 && c === 0
  if (n === 2) return c === 0
  if (n === 3) return c === 0 || (c === 1 && r <= 1)
  if (n === 4) return c === 0 || (c === 1 && r <= 2) || (c === 2 && r === 0)
  return false
}

// G_n star counts and labels
const GROUPS = [
  { n: 1, count: 1  },
  { n: 2, count: 2  },
  { n: 3, count: 5  },
  { n: 4, count: 8  },
] as const

// ── component ──────────────────────────────────────────────────────────────────

export default function StarGroupsHK20P3Q5Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {GROUPS.map(({ n, count }, i) => {
        const gx = GX[i]
        // bottom-align: all grids share the same bottom baseline
        const gy = PAD + MAX_H - n * CELL
        const cx = gx + (n * CELL) / 2

        return (
          <g key={n}>
            <g transform={`translate(${gx},${gy})`}>
              <GridBoard
                rows={n}
                cols={n}
                cellSize={CELL}
                fill={(r, c) => (isStar(n, r, c) ? STAR_FILL : EMPTY_FILL)}
                label={(r, c) => (isStar(n, r, c) ? '*' : '')}
                gridStroke={GRID_STROKE}
              />
            </g>

            {/* group ordinal label */}
            <text
              x={cx}
              y={LABEL_Y}
              textAnchor="middle"
              fontSize={9}
              fontWeight="700"
              fill={LABEL_COLOR}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {`G${n}`}
            </text>

            {/* star count */}
            <text
              x={cx}
              y={COUNT_Y}
              textAnchor="middle"
              fontSize={9}
              fill={COUNT_COLOR}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {`${count}*`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
