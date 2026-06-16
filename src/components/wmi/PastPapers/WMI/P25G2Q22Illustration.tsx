// Garden-paths Euler-trail figure for WMI-25P2A-Q22 (2025 WMI Semifinal Grade 2 Paper A).
//
// Redrawn (NOT the jpg) from db/seed/wmi/figures/2025-semifinal-g2-a-q22.jpg:
// a parallelogram garden (drawn flat/schematic, not in perspective) with four
// gateposts A (left), B (bottom), C (right), D (top). White paths divide the
// green:
//   - the road AROUND the garden (perimeter loop A-D-C-B-A), plus
//   - three interior paths: A-D, D-B, B-C.
//
// The corner where an odd number of paths meet must be the entrance/exit of a
// trail that uses every path exactly once. Here those corners are A and C — but
// the STATIC figure shows only the garden and its paths, never the answer.

export type Corner = 'A' | 'B' | 'C' | 'D'

// Schematic diamond layout (clean, centred, lots of viewBox headroom).
export const NODES: Record<Corner, { x: number; y: number }> = {
  A: { x: 60, y: 175 }, // left
  B: { x: 200, y: 300 }, // bottom
  C: { x: 340, y: 175 }, // right
  D: { x: 200, y: 50 }, // top
}

// Perimeter "road around the garden" (a closed loop) + the interior paths.
export const PERIMETER_EDGES: Array<[Corner, Corner]> = [
  ['A', 'D'],
  ['D', 'C'],
  ['C', 'B'],
  ['B', 'A'],
]
export const INTERIOR_EDGES: Array<[Corner, Corner]> = [
  ['A', 'D'],
  ['D', 'B'],
  ['B', 'C'],
]

/** Degree of every corner counting BOTH perimeter and interior paths. */
export const DEGREE: Record<Corner, number> = (() => {
  const d: Record<Corner, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const [u, v] of [...PERIMETER_EDGES, ...INTERIOR_EDGES]) {
    d[u] += 1
    d[v] += 1
  }
  return d
})()

// The two odd-degree corners (start + end of the once-only trail). A and C.
export const ODD_CORNERS = (Object.keys(DEGREE) as Corner[]).filter((c) => DEGREE[c] % 2 === 1)

const GREEN = '#86C232'
const GREEN_DARK = '#5C8A1E'
const PATH = '#FBFBF4'
const POST = '#9C6B3F'
const POST_DARK = '#6F4A28'
const BASE = '#F7C948'
const LABEL = '#1F2937'

const VIEW_W = 400
const VIEW_H = 350

/**
 * A single gatepost (rounded tombstone-like post on a yellow base) at (x, y),
 * with its corner letter. When `highlight` is set the base ring is recoloured
 * (used by the explainer to flag odd / even corners); the static figure never
 * sets it.
 */
export function GatePost({
  x,
  y,
  label,
  highlight,
}: {
  x: number
  y: number
  label: Corner
  highlight?: 'odd' | 'even' | null
}) {
  const ring = highlight === 'odd' ? '#E11D48' : highlight === 'even' ? '#2563EB' : null
  // place the letter on the side that points away from the centre
  const cx = 200
  const cy = 175
  const lx = x + (x < cx ? -20 : x > cx ? 20 : 0)
  const ly = y + (y < cy ? -22 : y > cy ? 26 : -22)
  return (
    <g>
      {ring && <circle cx={x} cy={y + 6} r={20} fill="none" stroke={ring} strokeWidth={3.5} />}
      {/* yellow base */}
      <ellipse cx={x} cy={y + 9} rx={15} ry={9} fill={BASE} />
      {/* post body */}
      <path
        d={`M ${x - 8} ${y + 9} L ${x - 8} ${y - 8} Q ${x} ${y - 20} ${x + 8} ${y - 8} L ${x + 8} ${y + 9} Z`}
        fill={POST}
        stroke={POST_DARK}
        strokeWidth={1.5}
      />
      <line x1={x} y1={y - 12} x2={x} y2={y + 6} stroke={POST_DARK} strokeWidth={1.2} opacity={0.6} />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontStyle="italic"
        fontWeight={700}
        fill={LABEL}
      >
        {label}
      </text>
    </g>
  )
}

export interface GardenDiagramProps {
  /** Corners to flag (with how). Used by the explainer; empty in the static figure. */
  flags?: Partial<Record<Corner, 'odd' | 'even'>>
  /** Show a small "n" path-count badge beside each corner. */
  showDegrees?: boolean
  /** Highlight a set of edges (drawn thicker / coloured) — the traced trail. */
  litEdges?: Array<[Corner, Corner]>
}

const PATH_W = 13

function edgeKey(u: Corner, v: Corner) {
  return [u, v].sort().join('-')
}

export function GardenDiagram({ flags = {}, showDegrees = false, litEdges = [] }: GardenDiagramProps) {
  const lit = new Set(litEdges.map(([u, v]) => edgeKey(u, v)))
  // green garden body = the parallelogram
  const poly = `${NODES.A.x},${NODES.A.y} ${NODES.D.x},${NODES.D.y} ${NODES.C.x},${NODES.C.y} ${NODES.B.x},${NODES.B.y}`

  const allEdges = [...PERIMETER_EDGES, ...INTERIOR_EDGES]

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 400, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* garden body */}
      <polygon points={poly} fill={GREEN} stroke={GREEN_DARK} strokeWidth={2} strokeLinejoin="round" />

      {/* white paths (perimeter loop + interior), drawn as thick light strokes */}
      {allEdges.map(([u, v], i) => {
        const on = lit.has(edgeKey(u, v))
        return (
          <line
            key={`p${i}`}
            x1={NODES[u].x}
            y1={NODES[u].y}
            x2={NODES[v].x}
            y2={NODES[v].y}
            stroke={on ? '#F59E0B' : PATH}
            strokeWidth={on ? PATH_W + 4 : PATH_W}
            strokeLinecap="round"
            opacity={on ? 0.95 : 1}
          />
        )
      })}

      {/* a few decorative flower clusters so the green reads as a garden (deterministic) */}
      {[
        [120, 130],
        [255, 110],
        [150, 220],
        [275, 215],
      ].map(([fx, fy], i) => (
        <g key={`f${i}`}>
          {[
            [-6, 0, '#EC4899'],
            [6, 0, '#F472B6'],
            [0, -6, '#A855F7'],
            [0, 6, '#FBBF24'],
          ].map(([dx, dy, col], j) => (
            <circle key={j} cx={fx + (dx as number)} cy={fy + (dy as number)} r={3.4} fill={col as string} />
          ))}
          <circle cx={fx} cy={fy} r={2.4} fill="#FDE68A" />
        </g>
      ))}

      {/* gateposts */}
      {(Object.keys(NODES) as Corner[]).map((c) => (
        <GatePost key={c} x={NODES[c].x} y={NODES[c].y} label={c} highlight={flags[c] ?? null} />
      ))}

      {/* per-corner path-count badges */}
      {showDegrees &&
        (Object.keys(NODES) as Corner[]).map((c) => {
          const bx = NODES[c].x + (NODES[c].x < 200 ? 22 : NODES[c].x > 200 ? -22 : 0)
          const by = NODES[c].y + (NODES[c].y < 175 ? 18 : NODES[c].y > 175 ? -18 : 0)
          const odd = DEGREE[c] % 2 === 1
          return (
            <g key={`d${c}`}>
              <circle cx={bx} cy={by} r={11} fill={odd ? '#FEE2E2' : '#DBEAFE'} stroke={odd ? '#E11D48' : '#2563EB'} strokeWidth={2} />
              <text x={bx} y={by} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={odd ? '#9F1239' : '#1E3A8A'}>
                {DEGREE[c]}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

export default function P25G2Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A garden shaped like a diamond with gateposts A (left), B (bottom), C (right) and D (top). White paths run around the garden and across it between the corners."
    >
      <GardenDiagram />
    </div>
  )
}
