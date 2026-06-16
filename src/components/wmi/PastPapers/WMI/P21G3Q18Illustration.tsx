// "Which route is the longest?" figure for WMI-21P3A-Q18 (2021 WMI Semifinal
// Grade 3, Paper A).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g3-a-q18.jpg: four routes run
// between Eric's Home (top-left dot) and School (bottom-right dot). Reading the
// scan top to bottom:
//   D — hugs the OUTER top edge: right across the very top, then down the far
//       right wall to School (the big rectangle's top + right side).
//   C — an inner staircase that drops one step late (stays high, then steps down
//       near School).
//   B — an inner staircase that drops one step early (steps down sooner, runs low).
//   A — hugs the OUTER bottom edge: down the far left wall, then right across the
//       very bottom to School (the big rectangle's left + bottom side).
//
// The static figure shows ONLY the four labelled routes — never which is longest.
// Each route is a rectilinear (right/down) path; the explainer reasons about
// total length and lands on D (answer D), the route that wraps the outer edge.

const INK = '#1F2937'
const HOME_FILL = '#1F2937'
const FRAME = '#1F2937'

// Board in abstract units (x right, y down); scaled to px with margin headroom so
// the "Home" / "School" labels and the top route never clip.
const U = 1
const PAD_L = 64 // room for the "Home" label + dot
const PAD_R = 78 // room for the "School" label + dot
const PAD_T = 30
const PAD_B = 30
const GW = 520 // inner board width (px)
const GH = 150 // inner board height (px)
export const ROUTE_VIEW_W = GW + PAD_L + PAD_R
export const ROUTE_VIEW_H = GH + PAD_T + PAD_B

// Key x/y guide lines on the inner board (px, board-local then offset by PAD).
function X(fx: number) {
  return PAD_L + fx * GW * U
}
function Y(fy: number) {
  return PAD_T + fy * GH * U
}

// Home is the top-left corner of the routes; School is the bottom-right corner.
export const HOME = { x: X(0), y: Y(0) }
export const SCHOOL = { x: X(0.9), y: Y(1) }

// Each route as a polyline of fractional board points (right/down moves only).
// Outer routes A & D ride the rectangle edges; B & C are inner staircases.
type Pt = { x: number; y: number }
const P = (fx: number, fy: number): Pt => ({ x: X(fx), y: Y(fy) })

export interface RouteDef {
  label: 'A' | 'B' | 'C' | 'D'
  pts: Pt[]
  /** Where to drop the route's letter label (px). */
  labelAt: Pt
  color: string
}

// Geometry chosen so the figure mirrors the scan; the outer route D is visibly
// the longest path drawn (it bows out along the top then the far right).
export const ROUTES: RouteDef[] = [
  {
    label: 'D',
    color: INK,
    pts: [P(0, 0), P(1, 0), P(1, 1), P(0.9, 1)],
    labelAt: { x: X(0.62), y: Y(0) - 8 },
  },
  {
    label: 'C',
    color: INK,
    pts: [P(0, 0.18), P(0.55, 0.18), P(0.55, 0.46), P(0.78, 0.46), P(0.78, 0.78), P(0.9, 0.78), P(0.9, 1)],
    labelAt: { x: X(0.58), y: Y(0.32) },
  },
  {
    label: 'B',
    color: INK,
    pts: [P(0, 0.42), P(0.33, 0.42), P(0.33, 0.66), P(0.62, 0.66), P(0.62, 0.86), P(0.9, 0.86), P(0.9, 1)],
    labelAt: { x: X(0.34), y: Y(0.55) },
  },
  {
    label: 'A',
    color: INK,
    pts: [P(0, 0), P(0, 1), P(0.9, 1)],
    labelAt: { x: X(0.45), y: Y(1) + 18 },
  },
]

function toPoints(pts: Pt[]) {
  return pts.map((p) => `${p.x},${p.y}`).join(' ')
}

export interface RouteMapProps {
  /** Highlight one route by label (explainer). */
  litLabel?: 'A' | 'B' | 'C' | 'D' | null
  /** Colour used for the lit route. */
  litColor?: string
}

export function RouteMap({ litLabel = null, litColor = '#f0853a' }: RouteMapProps) {
  return (
    <svg
      viewBox={`0 0 ${ROUTE_VIEW_W} ${ROUTE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: ROUTE_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* faint outer frame from Home corner down/around to School corner */}
      <polyline
        points={toPoints([P(0, 0), P(1, 0), P(1, 1), P(0, 1), P(0, 0)])}
        fill="none"
        stroke={FRAME}
        strokeOpacity={0.12}
        strokeWidth={1.5}
      />

      {/* routes (non-lit first, lit last so it sits on top) */}
      {ROUTES.filter((r) => r.label !== litLabel).map((r) => (
        <polyline
          key={r.label}
          points={toPoints(r.pts)}
          fill="none"
          stroke={r.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={litLabel ? 0.28 : 1}
        />
      ))}
      {litLabel &&
        ROUTES.filter((r) => r.label === litLabel).map((r) => (
          <polyline
            key={`lit-${r.label}`}
            points={toPoints(r.pts)}
            fill="none"
            stroke={litColor}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

      {/* route letter labels */}
      {ROUTES.map((r) => (
        <text
          key={`lbl-${r.label}`}
          x={r.labelAt.x}
          y={r.labelAt.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontStyle="italic"
          fontWeight={800}
          fill={r.label === litLabel ? litColor : INK}
        >
          {r.label}
        </text>
      ))}

      {/* Home endpoint + label */}
      <circle cx={HOME.x} cy={HOME.y} r={6} fill={HOME_FILL} />
      <text x={HOME.x - 12} y={HOME.y} textAnchor="end" dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK}>
        Home
      </text>

      {/* School endpoint + label */}
      <circle cx={SCHOOL.x} cy={SCHOOL.y} r={6} fill={HOME_FILL} />
      <text x={SCHOOL.x + 12} y={SCHOOL.y} textAnchor="start" dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK}>
        School
      </text>
    </svg>
  )
}

export default function P21G3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A map with four routes A, B, C and D between Eric's Home (top-left) and School (bottom-right)."
    >
      <RouteMap />
    </div>
  )
}
