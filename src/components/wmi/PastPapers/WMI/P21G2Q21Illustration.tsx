// Route-map picture for WMI-21P2A-Q21 (2021 semifinal Grade 2).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g2-a-q21.jpg:
// Home (left dot) and School (right dot) joined by two "eye"/lens loops with a
// short straight middle segment between them.
//   LEFT lens:  top arc = 4 trees, bottom arc = 2 trees
//   MIDDLE:     straight segment = 3 trees (always crossed)
//   RIGHT lens: top arc = 8 trees, bottom arc = 5 trees
//
// A traveller picks ONE left arc, crosses the middle (3 trees), then ONE right
// arc. The four route totals are therefore:
//   4+3+8 = 15   (A)
//   2+3+8 = 13   (B)
//   4+3+5 = 12   (extra)
//   2+3+5 = 10   (D)
// Achievable set = {15, 13, 12, 10}. 11 is NOT achievable -> option C is wrong.
//
// The default export draws ONLY the problem (the map + trees). It never reveals
// which total is impossible. The explainer reuses <RouteMapQ21> to highlight a
// chosen route, dim the rest, and show a running total.

export const LEFT_TOP_TREES = 4
export const LEFT_BOTTOM_TREES = 2
export const MIDDLE_TREES = 3
export const RIGHT_TOP_TREES = 8
export const RIGHT_BOTTOM_TREES = 5

export type LeftArc = 'top' | 'bottom'
export type RightArc = 'top' | 'bottom'

export interface RouteQ21 {
  left: LeftArc
  right: RightArc
}

/** The four possible routes and their tree totals. */
export const ROUTES_Q21: Array<{ route: RouteQ21; total: number }> = [
  { route: { left: 'top', right: 'top' }, total: LEFT_TOP_TREES + MIDDLE_TREES + RIGHT_TOP_TREES }, // 15
  { route: { left: 'bottom', right: 'top' }, total: LEFT_BOTTOM_TREES + MIDDLE_TREES + RIGHT_TOP_TREES }, // 13
  { route: { left: 'top', right: 'bottom' }, total: LEFT_TOP_TREES + MIDDLE_TREES + RIGHT_BOTTOM_TREES }, // 12
  { route: { left: 'bottom', right: 'bottom' }, total: LEFT_BOTTOM_TREES + MIDDLE_TREES + RIGHT_BOTTOM_TREES }, // 10
]

/** Sorted set of achievable totals: [15, 13, 12, 10]. */
export const ACHIEVABLE_TOTALS = ROUTES_Q21.map((r) => r.total).sort((a, b) => b - a)

/** The choices on the paper. */
export const CHOICES_Q21 = [
  { label: 'A', value: 15 },
  { label: 'B', value: 13 },
  { label: 'C', value: 11 },
  { label: 'D', value: 10 },
]

/** The impossible total -> the wrong option. */
export const IMPOSSIBLE_TOTAL = 11
export const ANSWER_LABEL = 'C'

// ---- geometry ----------------------------------------------------------------

export const Q21_VIEW_W = 460
export const Q21_VIEW_H = 240

const MID_Y = 138 // baseline of Home / junctions / School
const HOME_X = 36
const L_JUNC_X = 168
const R_JUNC_X = 292
const SCHOOL_X = 424

const ARC_BULGE = 58 // vertical bulge of each lens arc

const ROAD = '#3F3F46'
const ROAD_DIM = '#D4D4D8'
const HILITE = '#2563EB'
const NODE = '#1F2937'
const TRUNK = '#8B5A2B'
const CROWN = '#7CB342'
const CROWN_EDGE = '#558B2F'

// ---- tree --------------------------------------------------------------------

/** A simple leafy tree: green oval crown on a brown trunk, drawn centred at (x, y baseline). */
function Tree({ x, y, dim = false }: { x: number; y: number; dim?: boolean }) {
  const op = dim ? 0.28 : 1
  return (
    <g opacity={op}>
      <rect x={x - 2} y={y - 16} width={4} height={20} rx={1.5} fill={TRUNK} />
      <ellipse cx={x} cy={y - 24} rx={11} ry={15} fill={CROWN} stroke={CROWN_EDGE} strokeWidth={1.5} />
      <ellipse cx={x - 3.5} cy={y - 28} rx={3} ry={4.5} fill="#9CCC65" opacity={0.7} />
    </g>
  )
}

// ---- arc helpers -------------------------------------------------------------

type ArcKind = 'lt' | 'lb' | 'rt' | 'rb' | 'mid'

interface ArcGeom {
  x0: number
  x1: number
  /** Peak/dip y for the quadratic control point; equals MID_Y for the straight middle. */
  ctrlY: number
  /** Sign of the bulge: -1 above the baseline, +1 below, 0 straight. */
  dir: -1 | 0 | 1
}

const ARC_GEOM: Record<ArcKind, ArcGeom> = {
  lt: { x0: HOME_X, x1: L_JUNC_X, ctrlY: MID_Y - ARC_BULGE, dir: -1 },
  lb: { x0: HOME_X, x1: L_JUNC_X, ctrlY: MID_Y + ARC_BULGE, dir: 1 },
  mid: { x0: L_JUNC_X, x1: R_JUNC_X, ctrlY: MID_Y, dir: 0 },
  rt: { x0: R_JUNC_X, x1: SCHOOL_X, ctrlY: MID_Y - ARC_BULGE, dir: -1 },
  rb: { x0: R_JUNC_X, x1: SCHOOL_X, ctrlY: MID_Y + ARC_BULGE, dir: 1 },
}

function arcPath(k: ArcKind): string {
  const g = ARC_GEOM[k]
  const cx = (g.x0 + g.x1) / 2
  // Control point pulled past the peak so the quadratic actually reaches ~ctrlY.
  const cy = g.dir === 0 ? MID_Y : MID_Y + (g.ctrlY - MID_Y) * 2
  return `M ${g.x0} ${MID_Y} Q ${cx} ${cy} ${g.x1} ${MID_Y}`
}

/** Point on the quadratic arc at parameter t in [0,1]. */
function arcPoint(k: ArcKind, t: number): { x: number; y: number } {
  const g = ARC_GEOM[k]
  const cx = (g.x0 + g.x1) / 2
  const cy = g.dir === 0 ? MID_Y : MID_Y + (g.ctrlY - MID_Y) * 2
  const mt = 1 - t
  const x = mt * mt * g.x0 + 2 * mt * t * cx + t * t * g.x1
  const y = mt * mt * MID_Y + 2 * mt * t * cy + t * t * MID_Y
  return { x, y }
}

/** Evenly-spaced tree positions along an arc, kept away from the endpoints. */
function treePositions(k: ArcKind, count: number): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = []
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1)
    const p = arcPoint(k, t)
    // Trees sit on the OUTSIDE of the bulge (above a top arc, below a bottom arc).
    const g = ARC_GEOM[k]
    const lift = g.dir === 0 ? -30 : g.dir === -1 ? -6 : 34
    out.push({ x: p.x, y: p.y + lift })
  }
  return out
}

const ARC_TREE_COUNT: Record<ArcKind, number> = {
  lt: LEFT_TOP_TREES,
  lb: LEFT_BOTTOM_TREES,
  mid: MIDDLE_TREES,
  rt: RIGHT_TOP_TREES,
  rb: RIGHT_BOTTOM_TREES,
}

// ---- shared diagram primitive ------------------------------------------------

export interface RouteMapQ21Props {
  /** When set, only this route is drawn bold + its trees full-colour; all other arcs/trees dim. */
  highlight?: RouteQ21 | null
  /** Optional running total shown in a badge above the map. */
  runningTotal?: number | null
  /** Caption text for the total badge (defaults to "= N"). */
  totalLabel?: string
}

/** Which arc kinds belong to a highlighted route (includes the always-crossed middle). */
function routeArcs(r: RouteQ21): ArcKind[] {
  return [r.left === 'top' ? 'lt' : 'lb', 'mid', r.right === 'top' ? 'rt' : 'rb']
}

export function RouteMapQ21({ highlight = null, runningTotal = null, totalLabel }: RouteMapQ21Props) {
  const active = highlight ? new Set(routeArcs(highlight)) : null
  const allArcs: ArcKind[] = ['lt', 'lb', 'mid', 'rt', 'rb']

  return (
    <svg
      viewBox={`0 0 ${Q21_VIEW_W} ${Q21_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q21_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* roads (draw dim ones first, highlighted ones on top) */}
      {allArcs.map((k) => {
        const on = !active || active.has(k)
        return (
          <path
            key={`road-${k}`}
            d={arcPath(k)}
            fill="none"
            stroke={active && on ? HILITE : on ? ROAD : ROAD_DIM}
            strokeWidth={active && on ? 5 : 3}
            strokeLinecap="round"
          />
        )
      })}

      {/* trees */}
      {allArcs.map((k) => {
        const on = !active || active.has(k)
        return treePositions(k, ARC_TREE_COUNT[k]).map((p, i) => (
          <Tree key={`tree-${k}-${i}`} x={p.x} y={p.y} dim={!!active && !on} />
        ))
      })}

      {/* nodes */}
      <circle cx={HOME_X} cy={MID_Y} r={6} fill={NODE} />
      <circle cx={L_JUNC_X} cy={MID_Y} r={4.5} fill={NODE} />
      <circle cx={R_JUNC_X} cy={MID_Y} r={4.5} fill={NODE} />
      <circle cx={SCHOOL_X} cy={MID_Y} r={6} fill={NODE} />

      {/* labels */}
      <text x={HOME_X} y={MID_Y + 26} textAnchor="middle" fontSize={15} fontWeight={800} fill={NODE}>
        Home
      </text>
      <text x={SCHOOL_X} y={MID_Y + 26} textAnchor="middle" fontSize={15} fontWeight={800} fill={NODE}>
        School
      </text>

      {/* running-total badge */}
      {runningTotal != null && (
        <g>
          <rect x={Q21_VIEW_W / 2 - 48} y={6} width={96} height={32} rx={9} fill="#E1EFFB" stroke={HILITE} strokeWidth={2} />
          <text
            x={Q21_VIEW_W / 2}
            y={22}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontWeight={900}
            fill={HILITE}
          >
            {totalLabel ?? `= ${runningTotal}`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P21G2Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A road map from Home to School. The left loop has a top path with 4 trees and a bottom path with 2 trees, a straight middle path with 3 trees, then a right loop with a top path of 8 trees and a bottom path of 5 trees."
    >
      <RouteMapQ21 />
    </div>
  )
}
