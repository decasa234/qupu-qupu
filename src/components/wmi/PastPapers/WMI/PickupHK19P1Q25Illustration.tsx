// Minimum-distance path puzzle — HKIMO 2019 Heat Primary-1 Q25.
//
// Figure: 19 apples in a 5×5 sparse grid.
//   Full rows at y = 0, 2, 4 (5 apples each).
//   Side-only rows at y = 1, 3 (left col 0 + right col 4 only).
// Ming must visit every apple; minimum distance = 19 metres.
//
// Reuses Apple glyph from ./primitives/glyphs (IMPORT-FIRST).
// Default export = illustration. No VISUALS export.

import { Apple } from './primitives/glyphs'

// ── Layout constants ─────────────────────────────────────────────────────────

const CELL = 52   // px between adjacent grid nodes
const PAD  = 30   // margin
const R    = 15   // apple radius

export const W = 4 * CELL + 2 * PAD   // 268 — full SVG size

/** Convert (col, row) → pixel centre. */
export function px(col: number, row: number): readonly [number, number] {
  return [col * CELL + PAD, row * CELL + PAD] as const
}

// ── Apple positions ───────────────────────────────────────────────────────────

/** (col, row) pairs for all 19 apple positions. */
export const APPLE_CELLS: [number, number][] = [
  [0,0],[1,0],[2,0],[3,0],[4,0],   // top row
  [0,1],[4,1],                      // row 1 — sides only
  [0,2],[1,2],[2,2],[3,2],[4,2],   // middle row
  [0,3],[4,3],                      // row 3 — sides only
  [0,4],[1,4],[2,4],[3,4],[4,4],   // bottom row
]

// ── Illustration ──────────────────────────────────────────────────────────────

/** Static problem figure: 19 apples in their grid positions. No answer path. */
export default function PickupHK19P1Q25Illustration() {
  return (
    <svg
      viewBox={`0 0 ${W} ${W}`}
      width="100%"
      role="img"
      aria-label="19 apples arranged in a grid — Ming must find the shortest route to collect all of them"
    >
      {/* dashed grid edges — horizontal (full rows 0, 2, 4) */}
      {([0, 2, 4] as const).flatMap(row =>
        [0, 1, 2, 3].map(col => {
          const [x1, y1] = px(col, row)
          const [x2, y2] = px(col + 1, row)
          return (
            <line
              key={`h-${col}-${row}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 4"
            />
          )
        })
      )}
      {/* dashed grid edges — vertical (left col 0 and right col 4) */}
      {([0, 4] as const).flatMap(col =>
        [0, 1, 2, 3].map(row => {
          const [x1, y1] = px(col, row)
          const [x2, y2] = px(col, row + 1)
          return (
            <line
              key={`v-${col}-${row}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 4"
            />
          )
        })
      )}
      {/* apples */}
      {APPLE_CELLS.map(([col, row]) => {
        const [x, y] = px(col, row)
        return <Apple key={`${col}-${row}`} cx={x} cy={y} r={R} />
      })}
    </svg>
  )
}
