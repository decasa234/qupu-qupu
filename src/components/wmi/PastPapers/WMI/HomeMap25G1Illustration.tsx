// WMI-25F1A-Q23 (2025 Grade 1 Final) — students' homes map (weighted graph).
//
// "The map shows distances between some students' homes. If Alex walks from his
// home to Emma's home, using each road at most once, what is the farthest
// distance he can walk, in cm?"  Answer: 29 (fill-in).
//
// MATH (for reference only — the static figure must NOT reveal the trail or 29).
// We want the LONGEST TRAIL (each road used at most once; a home may be passed
// through more than once) from Alex to Emma. A brute-force search over the 7
// roads gives a unique maximum:
//     Alex →(8) Sam →(6) Donald →(6) Leo →(9) Emma  =  8 + 6 + 6 + 9 = 29 cm.
// The Olivia spur (Alex–Olivia–Leo) and the Donald–Emma road (4) cannot be added
// without re-using a road or stranding Emma early, so 29 cm is the farthest.
//
// The default export draws ONLY the setup: the six homes and the seven labelled
// roads. It commits to NO walk and shows no running total. Tracing the winning
// Alex→Sam→Donald→Leo→Emma trail (with its running sum) is the animator's job,
// via the co-exported HomeMap25G1 primitive's `litPath`.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ---- map model -------------------------------------------------------------
// Node ids and their positions in viewBox user units. Layout mirrors the source
// figure: Alex far left, Sam top, Donald upper-right, Leo central, Olivia bottom
// left, Emma lower-right. Alex (start) and Emma (goal) drawn bold.
type NodeId = 'Alex' | 'Sam' | 'Donald' | 'Leo' | 'Olivia' | 'Emma'

const NODES: Record<NodeId, { x: number; y: number; major?: boolean; labelSide: 'left' | 'right' | 'top' }> = {
  Alex: { x: 60, y: 150, major: true, labelSide: 'left' },
  Sam: { x: 226, y: 64, labelSide: 'top' },
  Donald: { x: 360, y: 138, labelSide: 'right' },
  Leo: { x: 230, y: 188, labelSide: 'left' },
  Olivia: { x: 150, y: 272, labelSide: 'left' },
  Emma: { x: 430, y: 228, major: true, labelSide: 'right' },
}

// Road list (undirected). `[a, b, distanceCm]`. Order matches the source figure.
const EDGES: Array<[NodeId, NodeId, number]> = [
  ['Alex', 'Sam', 8],
  ['Sam', 'Donald', 6],
  ['Donald', 'Emma', 4],
  ['Alex', 'Olivia', 7],
  ['Olivia', 'Leo', 5],
  ['Leo', 'Donald', 6],
  ['Leo', 'Emma', 9],
]

export const ANSWER = 29 // farthest Alex→Emma trail — never drawn in the static figure

// Winning trail (animator only): Alex→Sam→Donald→Leo→Emma = 8+6+6+9 = 29.
export const LONGEST_TRAIL: NodeId[] = ['Alex', 'Sam', 'Donald', 'Leo', 'Emma']

// ---- geometry --------------------------------------------------------------
const VB_W = 540
const VB_H = 320
const MAJOR_R = 13 // bold Alex / Emma home radius
const MINOR_R = 8 // plain home radius
const EDGE_W = 2.8
const HL_W = 5.4 // highlighted road width

// Per-road distance-label nudges (perpendicular-ish offsets so a label clears the
// line and never collides with a neighbour). Keyed by "a-b" in EDGES order.
const LABEL_OFFSET: Record<string, { dx: number; dy: number }> = {
  'Alex-Sam': { dx: -6, dy: -12 },
  'Sam-Donald': { dx: 10, dy: -12 },
  'Donald-Emma': { dx: 18, dy: 0 },
  'Alex-Olivia': { dx: -16, dy: 6 },
  'Olivia-Leo': { dx: 2, dy: 20 },
  'Leo-Donald': { dx: -4, dy: -12 },
  'Leo-Emma': { dx: 6, dy: 18 },
}

function edgeKey(a: NodeId, b: NodeId): string {
  return `${a}-${b}`
}

/** True when the directed step a→b (or b→a) is part of `trail`. */
function isTrailEdge(a: NodeId, b: NodeId, trail: NodeId[] | null): boolean {
  if (!trail || trail.length < 2) return false
  for (let i = 0; i < trail.length - 1; i++) {
    const u = trail[i]
    const v = trail[i + 1]
    if ((u === a && v === b) || (u === b && v === a)) return true
  }
  return false
}

export interface HomeMap25G1Props {
  /**
   * Ordered list of home ids whose connecting roads get highlighted, with the
   * running total shown at the end (animator only). Default null = plain map
   * with distances only, revealing no walk. Invalid ids are ignored.
   */
  litPath?: string[] | null
}

/**
 * Primitive. Draws the six-home map. With `litPath` it tints the traversed roads
 * + visited homes and prints the running distance total; without it (the default)
 * it draws only the distances and never hints at the answer.
 */
export function HomeMap25G1({ litPath = null }: HomeMap25G1Props = {}) {
  // Narrow the incoming path to known home ids.
  const trail: NodeId[] | null =
    Array.isArray(litPath) && litPath.length > 0
      ? (litPath.filter((id): id is NodeId => id in NODES) as NodeId[])
      : null

  // Running total to render at the final home of a (contiguous) trail.
  let runningTotal: number | null = null
  if (trail && trail.length >= 2) {
    let sum = 0
    let contiguous = true
    for (let i = 0; i < trail.length - 1; i++) {
      const e = EDGES.find(
        ([a, b]) =>
          (a === trail[i] && b === trail[i + 1]) || (b === trail[i] && a === trail[i + 1]),
      )
      if (!e) {
        contiguous = false
        break
      }
      sum += e[2]
    }
    runningTotal = contiguous ? sum : null
  }

  const onTrail = (id: NodeId) => (trail ? trail.includes(id) : false)

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={Math.min(320, VB_W)} aria-hidden="true">
      {/* roads (drawn first, behind the homes) */}
      {EDGES.map(([a, b, dist]) => {
        const na = NODES[a]
        const nb = NODES[b]
        const lit = isTrailEdge(a, b, trail)
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
            {/* distance label with a small backing halo so it reads over lines */}
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={17}
              fontStyle="italic"
              fontWeight="bold"
              className="fill-qupu-shell stroke-qupu-shell"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {`${dist} cm`}
            </text>
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={17}
              fontStyle="italic"
              fontWeight="bold"
              className={lit ? 'fill-qupu-brand-orange' : 'fill-qupu-brand-blue-shadow'}
            >
              {`${dist} cm`}
            </text>
          </g>
        )
      })}

      {/* homes */}
      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id]
        const r = n.major ? MAJOR_R : MINOR_R
        const lit = onTrail(id)
        // label placement around the node
        const lx = n.labelSide === 'left' ? n.x - r - 7 : n.labelSide === 'right' ? n.x + r + 7 : n.x
        const ly = n.labelSide === 'top' ? n.y - r - 8 : n.y
        const anchor = n.labelSide === 'left' ? 'end' : n.labelSide === 'right' ? 'start' : 'middle'
        return (
          <g key={id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={r}
              strokeWidth={n.major ? 5 : 2.8}
              className={
                lit
                  ? 'fill-qupu-cream stroke-qupu-brand-orange'
                  : 'fill-qupu-shell stroke-qupu-brand-blue-shadow'
              }
            />
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline={n.labelSide === 'top' ? 'auto' : 'central'}
              fontSize={18}
              fontStyle="italic"
              fontWeight="bold"
              className="fill-qupu-brand-blue"
            >
              {id}
            </text>
          </g>
        )
      })}

      {/* running distance total at the trail's end (animator only) */}
      {trail && runningTotal !== null && (
        <g>
          {(() => {
            const end = NODES[trail[trail.length - 1]]
            const tx = end.x
            const ty = end.y + MAJOR_R + 20
            return (
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight="bold"
                className="fill-qupu-brand-orange"
              >
                {`= ${runningTotal} cm`}
              </text>
            )
          })()}
        </g>
      )}
    </svg>
  )
}

/**
 * Default export: the plain six-home map — every road distance shown, no walk
 * highlighted. Reveals nothing about the farthest trail or its total (29 cm).
 */
export default function HomeMap25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Peta rumah siswa: enam rumah (lingkaran) — Alex, Sam, Donald, Leo, Olivia, dan Emma — dihubungkan oleh tujuh jalan. Rumah Alex di kiri dan rumah Emma di kanan ditandai dengan lingkaran tebal. Setiap angka di sebelah sebuah jalan adalah jaraknya: Alex–Sam 8 cm, Sam–Donald 6 cm, Donald–Emma 4 cm, Alex–Olivia 7 cm, Olivia–Leo 5 cm, Leo–Donald 6 cm, dan Leo–Emma 9 cm. Cari jarak terjauh yang dapat dijalani Alex dari rumahnya ke rumah Emma jika setiap jalan dilewati paling banyak sekali."
    >
      <HomeMap25G1 />
    </div>
  )
}
