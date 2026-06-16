// WMI-21P2A-Q16 (2021 Grade 2 Semifinal) — "How many triangles of all sizes are
// there in the picture?" (answer C = 12).
//
// Reconstructed from db/seed/wmi/figures/2021-semifinal-g2-a-q16.jpg: a
// right-leaning parallelogram drawn as a triangular grid, two rows tall and three
// units wide. Each row is a strip of alternating up- and down-pointing unit
// triangles — 6 per row — so there are 12 small triangles in all. (The diagonals
// change direction at the middle line, so no clean larger triangle spans both
// rows; the answer counts the 12 unit triangles, matching key C.)
//
//   top row    : 6 small triangles
//   bottom row : 6 small triangles
//   total      : 12   (answer C)
//
// Geometry: lattice points P(label, i) on three horizontal lines. Each row up
// shifts +0.5 unit to the right (the lean). Triangle height = √3/2.
//
// This file draws ONLY the problem (the empty triangular grid). The co-exported
// TriGridFigure({ litRow, litTriangle }) primitive lets the explainer light a row
// or a single triangle while counting; the default export lights nothing.
//
// Pure render, SSR-safe & deterministic (no Math.random / Date, no state).

export const ROWS = 2
export const UNITS_WIDE = 3
export const PER_ROW = UNITS_WIDE * 2 // 6 small triangles per strip row
export const TRIANGLE_TOTAL = PER_ROW * ROWS // 12

const H = Math.sqrt(3) / 2 // triangle height in unit widths

// Lattice rows, bottom (j=0) → mid (j=1) → top (j=2). Each row has UNITS_WIDE+1
// points; row j is shifted +0.5*j to the right (the parallelogram lean).
type Pt = { x: number; y: number }
function rowPoints(j: number): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i <= UNITS_WIDE; i++) pts.push({ x: i + 0.5 * j, y: j * H })
  return pts
}
const BOT = rowPoints(0)
const MID = rowPoints(1)
const TOP = rowPoints(2)

export interface Tri {
  /** Which strip row: 0 = bottom, 1 = top. */
  row: number
  /** Index within the row, 0..PER_ROW-1 (left → right). */
  idx: number
  /** Three lattice points (unit coords). */
  pts: [Pt, Pt, Pt]
  /** true = up-pointing (▲), false = down-pointing (▽). */
  up: boolean
}

// Build the 6 triangles of a strip between a lower row `lo` and an upper row `hi`.
// They alternate: up, down, up, down, up, down (lo has UNITS_WIDE+1 pts, hi too,
// hi shifted +0.5 right). Up triangles sit on a lo edge; down triangles hang from
// a hi edge.
function buildStrip(lo: Pt[], hi: Pt[], row: number): Tri[] {
  const out: Tri[] = []
  let idx = 0
  for (let i = 0; i < UNITS_WIDE; i++) {
    // up-pointing: base lo[i]-lo[i+1], apex hi[i]
    out.push({ row, idx: idx++, pts: [lo[i], lo[i + 1], hi[i]], up: true })
    // down-pointing: base hi[i]-hi[i+1], apex lo[i+1]
    out.push({ row, idx: idx++, pts: [hi[i], hi[i + 1], lo[i + 1]], up: false })
  }
  return out
}

export const TRIANGLES: Tri[] = [...buildStrip(BOT, MID, 0), ...buildStrip(MID, TOP, 1)]

// ---- Screen projection -------------------------------------------------------
export const Q16_VIEW_W = 320
export const Q16_VIEW_H = 200
const PAD_X = 20
const PAD_Y = 18
// Total unit extent: width = UNITS_WIDE + 0.5*(ROWS) (lean), height = ROWS*H.
const SPAN_X = UNITS_WIDE + 0.5 * ROWS
const SPAN_Y = ROWS * H
const SCALE = Math.min((Q16_VIEW_W - PAD_X * 2) / SPAN_X, (Q16_VIEW_H - PAD_Y * 2) / SPAN_Y)
const OFF_X = (Q16_VIEW_W - SPAN_X * SCALE) / 2
const OFF_Y = (Q16_VIEW_H - SPAN_Y * SCALE) / 2

// Flip y so larger j (top row) draws higher on screen.
const sx = (p: Pt) => OFF_X + p.x * SCALE
const sy = (p: Pt) => OFF_Y + (SPAN_Y - p.y) * SCALE

const INK = '#1F2937'
const ROW_FILLS = ['rgba(37,99,235,0.16)', 'rgba(217,119,6,0.16)']
const ROW_STROKE = ['#2563EB', '#D97706']
const ONE_FILL = 'rgba(16,185,129,0.28)'
const ONE_STROKE = '#10B981'

function triPoints(t: Tri): string {
  return t.pts.map((p) => `${sx(p)},${sy(p)}`).join(' ')
}

export interface TriGridFigureProps {
  /** Light every triangle in this strip row (0 = bottom, 1 = top), or null. */
  litRow?: number | null
  /** Light one specific triangle (overrides litRow). */
  litTriangle?: Tri | null
}

export function TriGridFigure({ litRow = null, litTriangle = null }: TriGridFigureProps) {
  const highlights: Tri[] = litTriangle
    ? [litTriangle]
    : litRow != null
      ? TRIANGLES.filter((t) => t.row === litRow)
      : []

  return (
    <svg
      viewBox={`0 0 ${Q16_VIEW_W} ${Q16_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Highlight fills under the outline */}
      {highlights.map((t, i) => {
        const fill = litTriangle ? ONE_FILL : ROW_FILLS[t.row]
        const stroke = litTriangle ? ONE_STROKE : ROW_STROKE[t.row]
        return <polygon key={`hl-${i}`} points={triPoints(t)} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
      })}

      {/* Every triangle's outline (the figure itself) */}
      {TRIANGLES.map((t, i) => (
        <polygon key={`t-${i}`} points={triPoints(t)} fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
      ))}
    </svg>
  )
}

export default function P21G2Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A right-leaning parallelogram drawn as a triangular grid: two rows of small triangles, six in each row, alternating up-pointing and down-pointing. How many triangles of all sizes are there?"
    >
      <TriGridFigure />
    </div>
  )
}
