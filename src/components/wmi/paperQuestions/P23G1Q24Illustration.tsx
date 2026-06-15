// Pascal's-triangle-of-hexagons picture for WMI-23P1A-Q24
// (2023 Grade 1 Semifinal, Paper A).
//
// Source figure (db/seed/wmi/figures/2023-semifinal-g1-a-q24.jpg): a triangle of
// 7 rows of hexagons. The top is 1, both ends of every row are 1, and from row 2
// down each cell equals the SUM of the two cells above it (so it is Pascal's
// triangle laid out in hexes). A few cells are pre-printed (1's on the edges, a
// 2 in row 3, a 4 in row 5). Three hexes near the bottom-right are SHADED and
// left blank — the puzzle asks for their sum. The static figure shows exactly
// what the paper shows and never the answer.
//
// Shaded cells (verified): row6[3] = 10, row7[3] = 20, row7[4] = 15  ->  sum 45.

import { Fragment } from 'react'

/** Pascal value at row r (0-based), position k (0-based). Built additively so the
 * primitive never relies on a factorial helper. */
function pascal(rows: number): number[][] {
  const tri: number[][] = [[1]]
  for (let r = 1; r < rows; r++) {
    const prev = tri[r - 1]
    const row = [1]
    for (let k = 1; k < r; k++) row.push(prev[k - 1] + prev[k])
    row.push(1)
    tri.push(row)
  }
  return tri
}

export const ROWS = 7
export const TRIANGLE = pascal(ROWS)

/** Cells the source figure pre-prints (everything else is blank). Keyed "r,k". */
export const SHOWN_LABELS = new Set<string>([
  '0,0',
  '1,0', '1,1',
  '2,0', '2,1', '2,2',
  '3,0', '3,3',
  '4,0', '4,1', '4,4',
  '5,0', '5,5',
  '6,0', '6,6',
])

/** The three shaded cells (one parent + its two children). */
export const SHADED = new Set<string>(['5,3', '6,3', '6,4'])

export const TRI_VIEW_W = 440
export const TRI_VIEW_H = 400

// Flat-top hexagon geometry.
const HEX_W = 54 // full width (corner to corner, horizontal)
const HEX_H = 48 // full height
const COL_STEP = HEX_W * 0.82 // horizontal centre-to-centre within a row
const ROW_STEP = HEX_H * 0.78 // vertical centre-to-centre between rows
const TOP_Y = 36
const CX0 = TRI_VIEW_W / 2

/** Centre (cx, cy) of cell (r, k). Row r has r+1 cells, centred on CX0. */
function cellCenter(r: number, k: number): { cx: number; cy: number } {
  const cy = TOP_Y + r * ROW_STEP
  const cx = CX0 + (k - r / 2) * COL_STEP
  return { cx, cy }
}

/** Six points of a flat-top hexagon centred at (cx, cy). */
function hexPoints(cx: number, cy: number): string {
  const w = HEX_W / 2
  const h = HEX_H / 2
  const wq = HEX_W / 4
  return [
    [cx - wq, cy - h],
    [cx + wq, cy - h],
    [cx + w, cy],
    [cx + wq, cy + h],
    [cx - wq, cy + h],
    [cx - w, cy],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ')
}

const INK = '#3A332E'
const SHADE_FILL = '#A8DBF0'

export interface PascalHexTriangleProps {
  /** Reveal the value inside these shaded cells (keys "r,k"); empty by default. */
  reveal?: Set<string>
  /** Highlight (orange ring) these cells, e.g. the pair feeding a shaded cell. */
  ringAt?: Set<string>
}

export function PascalHexTriangle({ reveal, ringAt }: PascalHexTriangleProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${TRI_VIEW_W} ${TRI_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {TRIANGLE.map((row, r) =>
        row.map((value, k) => {
          const key = `${r},${k}`
          const { cx, cy } = cellCenter(r, k)
          const shaded = SHADED.has(key)
          const showLabel = SHOWN_LABELS.has(key) || (shaded && reveal?.has(key))
          const ringed = ringAt?.has(key)
          return (
            <Fragment key={key}>
              <polygon
                points={hexPoints(cx, cy)}
                fill={shaded ? SHADE_FILL : '#FFFFFF'}
                stroke={INK}
                strokeWidth={2.2}
                strokeLinejoin="round"
              />
              {ringed && (
                <polygon
                  points={hexPoints(cx, cy)}
                  fill="none"
                  stroke="#F97316"
                  strokeWidth={3.5}
                  strokeLinejoin="round"
                />
              )}
              {showLabel && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={value >= 10 ? 18 : 20}
                  fontWeight={900}
                  fill={INK}
                  fontFamily="system-ui, sans-serif"
                >
                  {value}
                </text>
              )}
            </Fragment>
          )
        }),
      )}
    </svg>
  )
}

export default function P23G1Q24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A triangle of seven rows of hexagons forming Pascal's triangle. The edges are 1's, with a 2 in row three and a 4 in row five. Three hexagons near the bottom right are shaded and blank."
    >
      <PascalHexTriangle />
    </div>
  )
}
