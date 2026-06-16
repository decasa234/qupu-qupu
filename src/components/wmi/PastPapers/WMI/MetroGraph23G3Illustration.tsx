// WMI-23F3A-Q8 (2023 Grade 3 Final) — metro fare network (weighted graph).
//
// "Each circle is a metro station; the number next to a line segment is that
// segment's ticket price. Kelly travels from station A to station B. What is the
// least amount to buy a ticket?"  Answer: C = 150 (MC).
//
// MATH (for reference only — the static figure must NOT reveal the cheapest
// path or 150). Cheapest A→B by Dijkstra:
//     A→Q(50) → Q→R(20) → R→S(10) → S→B(70)  =  50+20+10+70 = 150.
// The tempting "go straight up the hub" route A→Q→R→B = 50+20+90 = 160 is
// dearer, and A→P→R→S→B = 30+50+10+70 = 160 also loses, so 150 is least.
//
// The default export draws ONLY the setup: the 7-station network with every
// edge's price beside it. It commits to NO route and never shows a running
// total. Highlighting the winning A→Q→R→S→B path (and its running sum) is the
// animator's job, via the co-exported MetroGraph23G3 primitive's highlightPath.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ---- network model ---------------------------------------------------------
// Node ids and their positions in viewBox user units. Layout mirrors the source
// figure: A far left, B top-right (both bold), P upper-middle, Q lower-left,
// R central hub, S right node below B, T bottom-right.
type NodeId = 'A' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'B'

const NODES: Record<NodeId, { x: number; y: number; label?: string; major?: boolean }> = {
  A: { x: 36, y: 156, label: 'A', major: true },
  P: { x: 132, y: 96 },
  Q: { x: 156, y: 210 },
  R: { x: 244, y: 150 },
  S: { x: 332, y: 130 },
  T: { x: 320, y: 226 },
  B: { x: 308, y: 40, label: 'B', major: true },
}

// Edge list (undirected). `[a, b, price]`. Order matches the question brief.
const EDGES: Array<[NodeId, NodeId, number]> = [
  ['A', 'P', 30],
  ['A', 'Q', 50],
  ['P', 'Q', 40],
  ['P', 'R', 50],
  ['Q', 'R', 20],
  ['Q', 'T', 20],
  ['R', 'T', 50],
  ['R', 'S', 10],
  ['R', 'B', 90],
  ['S', 'T', 30],
  ['S', 'B', 70],
]

export const ANSWER = 150 // least A→B fare — never drawn in the static figure

// Winning path (animator only): A→Q→R→S→B = 50+20+10+70 = 150.
export const CHEAPEST_PATH: NodeId[] = ['A', 'Q', 'R', 'S', 'B']

// ---- geometry --------------------------------------------------------------
const VB_W = 372
const VB_H = 266
const MAJOR_R = 13 // bold A / B station radius
const MINOR_R = 7.5 // plain station radius
const EDGE_W = 2.6
const HL_W = 5 // highlighted edge width

// Per-edge price-label nudges (perpendicular-ish offsets so a label clears the
// line and never collides with a neighbour). Keyed by "a-b" in EDGES order.
const LABEL_OFFSET: Record<string, { dx: number; dy: number }> = {
  'A-P': { dx: -2, dy: -12 },
  'A-Q': { dx: -4, dy: 18 },
  'P-Q': { dx: -16, dy: 4 },
  'P-R': { dx: 0, dy: -12 },
  'Q-R': { dx: 4, dy: 18 },
  'Q-T': { dx: 0, dy: 20 },
  'R-T': { dx: 16, dy: 6 },
  'R-S': { dx: 0, dy: -10 },
  'R-B': { dx: -16, dy: 2 },
  'S-T': { dx: 18, dy: 6 },
  'S-B': { dx: 16, dy: 2 },
}

function edgeKey(a: NodeId, b: NodeId): string {
  return `${a}-${b}`
}

/** True when the directed step a→b (or b→a) is part of `path`. */
function isPathEdge(a: NodeId, b: NodeId, path: NodeId[] | null): boolean {
  if (!path || path.length < 2) return false
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i]
    const v = path[i + 1]
    if ((u === a && v === b) || (u === b && v === a)) return true
  }
  return false
}

export interface MetroGraph23G3Props {
  /**
   * Ordered list of node ids whose connecting edges get highlighted, with the
   * running total shown along the way (animator only). Default null = plain
   * network with prices only, revealing no route. Invalid ids are ignored.
   */
  highlightPath?: string[] | null
}

/**
 * Primitive. Draws the 7-station fare network. With `highlightPath` it tints the
 * traversed edges + endpoints and prints the running fare total; without it (the
 * default) it draws only the prices and never hints at the answer.
 */
export function MetroGraph23G3({ highlightPath = null }: MetroGraph23G3Props = {}) {
  // Narrow the incoming path to known node ids.
  const path: NodeId[] | null =
    Array.isArray(highlightPath) && highlightPath.length > 0
      ? (highlightPath.filter((id): id is NodeId => id in NODES) as NodeId[])
      : null

  // Running total to render at the final node of a (contiguous) highlight path.
  let runningTotal: number | null = null
  if (path && path.length >= 2) {
    let sum = 0
    let contiguous = true
    for (let i = 0; i < path.length - 1; i++) {
      const e = EDGES.find(
        ([a, b]) =>
          (a === path[i] && b === path[i + 1]) || (b === path[i] && a === path[i + 1]),
      )
      if (!e) {
        contiguous = false
        break
      }
      sum += e[2]
    }
    runningTotal = contiguous ? sum : null
  }

  const onPath = (id: NodeId) => (path ? path.includes(id) : false)

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={Math.min(300, VB_W)} aria-hidden="true">
      {/* edges (drawn first, behind the stations) */}
      {EDGES.map(([a, b, price]) => {
        const na = NODES[a]
        const nb = NODES[b]
        const lit = isPathEdge(a, b, path)
        const off = LABEL_OFFSET[edgeKey(a, b)] ?? { dx: 0, dy: 0 }
        const mx = (na.x + nb.x) / 2 + off.dx
        const my = (na.y + nb.y) / 2 + off.dy
        return (
          <g key={edgeKey(a, b)}>
            <line
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              strokeWidth={lit ? HL_W : EDGE_W}
              strokeLinecap="round"
              className={lit ? 'stroke-qupu-brand-orange' : 'stroke-qupu-brand-blue-shadow'}
            />
            {/* price label with a small backing halo so it reads over lines */}
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontStyle="italic"
              fontWeight="bold"
              className="fill-qupu-shell stroke-qupu-shell"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {price}
            </text>
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontStyle="italic"
              fontWeight="bold"
              className={lit ? 'fill-qupu-brand-orange' : 'fill-qupu-brand-blue-shadow'}
            >
              {price}
            </text>
          </g>
        )
      })}

      {/* stations */}
      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id]
        const r = n.major ? MAJOR_R : MINOR_R
        const lit = onPath(id)
        return (
          <g key={id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={r}
              strokeWidth={n.major ? 5 : 2.6}
              className={
                lit
                  ? 'fill-qupu-cream stroke-qupu-brand-orange'
                  : 'fill-qupu-shell stroke-qupu-brand-blue-shadow'
              }
            />
            {n.label && (
              <text
                x={n.x + (id === 'A' ? -MAJOR_R - 6 : MAJOR_R + 6)}
                y={n.y}
                textAnchor={id === 'A' ? 'end' : 'start'}
                dominantBaseline="central"
                fontSize={22}
                fontStyle="italic"
                fontWeight="bold"
                className="fill-qupu-brand-blue"
              >
                {n.label}
              </text>
            )}
          </g>
        )
      })}

      {/* running fare total at the path's end (animator only) */}
      {path && runningTotal !== null && (
        <g>
          {(() => {
            const end = NODES[path[path.length - 1]]
            const tx = end.x - 20
            const ty = end.y + 28
            return (
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight="bold"
                className="fill-qupu-brand-orange"
              >
                {`= ${runningTotal}`}
              </text>
            )
          })()}
        </g>
      )}
    </svg>
  )
}

/**
 * Default export: the plain 7-station fare network — every edge price shown, no
 * route highlighted. Reveals nothing about the cheapest path or its total (150).
 */
export default function MetroGraph23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jaringan metro: tujuh stasiun (lingkaran) dihubungkan oleh sebelas ruas jalur. Stasiun A di kiri dan stasiun B di kanan atas ditandai dengan lingkaran tebal. Setiap angka di sebelah sebuah ruas adalah harga tiket ruas itu: A–30, 50, 40, 50, 20, 20, 50, 10, 90, 30, dan 70. Cari biaya tiket termurah dari stasiun A ke stasiun B."
    >
      <MetroGraph23G3 />
    </div>
  )
}
