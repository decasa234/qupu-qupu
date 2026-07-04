// WMI-21P2A-Q16 (2021 Grade 2 Semifinal) — "How many triangles of all sizes are
// there in the picture?" (answer C = 12).
//
// Reconstructed from db/seed/wmi/figures/2021-semifinal-g2-a-q16.jpg (verified by
// pixel-measuring the scan's lattice points). The figure is a two-strip triangular
// lattice whose rows shift LEFT going down:
//   top row    (y = 2H): 3 points at x = 1, 2, 3
//   middle row (y =  H): 3 points at x = 0.5, 1.5, 2.5
//   bottom row (y =  0): 4 points at x = 0, 1, 2, 3
// plus the horizontal midline. That yields:
//   bottom strip: 3 up + 2 down = 5 small triangles
//   top strip   : 2 up + 2 down = 4 small triangles
//   small total : 9
//   side-2 triangles: 2 pointing up (bases B0–B2 and B1–B3) and 1 pointing down
//     (base T0–T2, apex B2) = 3 — each made of 4 small ones
//   grand total : 9 + 3 = 12   (answer C)
//
// This file draws ONLY the problem (the empty lattice). The co-exported
// TriGridFigure({ litRow, litBig }) primitive lets the explainer light a strip of
// small triangles or the three big triangles while counting; the default export
// lights nothing.
//
// Pure render, SSR-safe & deterministic (no Math.random / Date, no state).

export const BOTTOM_SMALL = 5
export const TOP_SMALL = 4
export const SMALL_TOTAL = BOTTOM_SMALL + TOP_SMALL // 9
export const BIG_TOTAL = 3
export const TRIANGLE_TOTAL = SMALL_TOTAL + BIG_TOTAL // 12

const H = Math.sqrt(3) / 2 // triangle height in unit widths

type Pt = { x: number; y: number }

// Lattice rows measured from the scan (unit coords, y up).
const BOT: Pt[] = [0, 1, 2, 3].map((x) => ({ x, y: 0 }))
const MID: Pt[] = [0.5, 1.5, 2.5].map((x) => ({ x, y: H }))
const TOP: Pt[] = [1, 2, 3].map((x) => ({ x, y: 2 * H }))

export interface Tri {
  /** Which strip: 0 = bottom, 1 = top (big triangles use row -1). */
  row: number
  /** Three corner points (unit coords). */
  pts: [Pt, Pt, Pt]
  /** true = up-pointing, false = down-pointing. */
  up: boolean
}

/** The 9 small triangles of the figure. */
export const SMALL_TRIANGLES: Tri[] = [
  // bottom strip: 3 up + 2 down
  { row: 0, pts: [BOT[0], BOT[1], MID[0]], up: true },
  { row: 0, pts: [BOT[1], BOT[2], MID[1]], up: true },
  { row: 0, pts: [BOT[2], BOT[3], MID[2]], up: true },
  { row: 0, pts: [MID[0], MID[1], BOT[1]], up: false },
  { row: 0, pts: [MID[1], MID[2], BOT[2]], up: false },
  // top strip: 2 up + 2 down
  { row: 1, pts: [MID[0], MID[1], TOP[0]], up: true },
  { row: 1, pts: [MID[1], MID[2], TOP[1]], up: true },
  { row: 1, pts: [TOP[0], TOP[1], MID[1]], up: false },
  { row: 1, pts: [TOP[1], TOP[2], MID[2]], up: false },
]

/** The 3 side-2 triangles (each contains 4 small ones). */
export const BIG_TRIANGLES: Tri[] = [
  { row: -1, pts: [BOT[0], BOT[2], TOP[0]], up: true },
  { row: -1, pts: [BOT[1], BOT[3], TOP[1]], up: true },
  { row: -1, pts: [TOP[0], TOP[2], BOT[2]], up: false },
]

// ---- Screen projection -------------------------------------------------------
export const Q16_VIEW_W = 320
export const Q16_VIEW_H = 200
const PAD_X = 20
const PAD_Y = 18
const SPAN_X = 3 // x runs 0..3
const SPAN_Y = 2 * H
const SCALE = Math.min((Q16_VIEW_W - PAD_X * 2) / SPAN_X, (Q16_VIEW_H - PAD_Y * 2) / SPAN_Y)
const OFF_X = (Q16_VIEW_W - SPAN_X * SCALE) / 2
const OFF_Y = (Q16_VIEW_H - SPAN_Y * SCALE) / 2

// Flip y so larger y (top row) draws higher on screen.
const sx = (p: Pt) => OFF_X + p.x * SCALE
const sy = (p: Pt) => OFF_Y + (SPAN_Y - p.y) * SCALE

const INK = '#1F2937'
const ROW_FILLS = ['rgba(37,99,235,0.16)', 'rgba(217,119,6,0.16)']
const ROW_STROKE = ['#2563EB', '#D97706']
const BIG_FILL = 'rgba(16,185,129,0.20)'
const BIG_STROKE = '#10B981'

function triPoints(t: Tri): string {
  return t.pts.map((p) => `${sx(p)},${sy(p)}`).join(' ')
}

export interface TriGridFigureProps {
  /** Light every small triangle in this strip (0 = bottom, 1 = top), or null. */
  litRow?: number | null
  /** Light the three side-2 triangles (thick outlines). */
  litBig?: boolean
}

export function TriGridFigure({ litRow = null, litBig = false }: TriGridFigureProps) {
  const highlights: Tri[] = litRow != null ? SMALL_TRIANGLES.filter((t) => t.row === litRow) : []

  return (
    <svg
      viewBox={`0 0 ${Q16_VIEW_W} ${Q16_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Highlight fills under the outline */}
      {highlights.map((t, i) => (
        <polygon
          key={`hl-${i}`}
          points={triPoints(t)}
          fill={ROW_FILLS[t.row]}
          stroke={ROW_STROKE[t.row]}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      ))}

      {/* Every small triangle's outline (the figure itself) */}
      {SMALL_TRIANGLES.map((t, i) => (
        <polygon key={`t-${i}`} points={triPoints(t)} fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
      ))}

      {/* The three side-2 triangles, emphasised on demand */}
      {litBig &&
        BIG_TRIANGLES.map((t, i) => (
          <polygon
            key={`b-${i}`}
            points={triPoints(t)}
            fill={BIG_FILL}
            stroke={BIG_STROKE}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        ))}
    </svg>
  )
}

export default function P21G2Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A two-row triangular lattice: five small triangles in the bottom strip and four in the top strip, with the rows shifted so three larger triangles also appear. How many triangles of all sizes are there?"
    >
      <TriGridFigure />
    </div>
  )
}
