// WMI-24P3A-Q19 (2024 Semifinal Grade 3, question 19) — "operation cycle".
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g3-a-q19.jpg: a ring of circles
// joined by curved arrows; each arrow carries an operation and the chain closes
// back on itself.
//
// The figure on the paper shows the WORKED EXAMPLE cycle only:
//   4 --(+5)--> 9 --(x2)--> 18 --(-14)--> 4
// The question then states a second, longer cycle whose nodes are unknown:
//   A --(+23)--> B --(x4)--> C --(-26)--> D --(/6)--> E --(x0)--> A
// and asks for B + E.
//
// This static illustration draws BOTH cycles as given in the problem (the example
// with its numbers, the target cycle with letters A..E), and never reveals the
// solved values. The reusable <OpCycle> primitive lays N nodes on a ring with a
// labelled curved arrow between each consecutive pair.

export type CycleNode = { label: string }

export interface OpCycleProps {
  /** Node labels placed clockwise around the ring, starting at top. */
  nodes: string[]
  /** Operation label for the arrow LEAVING node i (length === nodes.length). */
  ops: string[]
  /** Ring centre + radius. */
  cx: number
  cy: number
  r: number
  /** Node circle radius. */
  nodeR?: number
  /** Per-node highlight (e.g. reveal during the explainer). null = not solved. */
  values?: Array<string | null>
  /** Index of a node to spotlight (ring + glow). */
  spotlight?: number
}

const INK = '#1F2937'
const NODE_FILL = '#DCEEFB'
const NODE_STROKE = '#3B6FB0'
const ARROW = '#7A8699'
const OP_INK = '#1F2937'
const SPOT = '#10B981'
const VALUE_INK = '#065F46'
const VALUE_FILL = '#D1FAE5'

/** Angle (radians) of node i on the ring: i=0 at top, going clockwise. */
function nodeAngle(i: number, n: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n
}

function nodePos(i: number, n: number, cx: number, cy: number, r: number): [number, number] {
  const a = nodeAngle(i, n)
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/** A ring of labelled nodes joined by curved, labelled operation arrows. */
export function OpCycle({ nodes, ops, cx, cy, r, nodeR = 26, values, spotlight }: OpCycleProps) {
  const n = nodes.length
  return (
    <g>
      {/* arrows leaving each node toward the next */}
      {nodes.map((_, i) => {
        const j = (i + 1) % n
        const a0 = nodeAngle(i, n)
        const a1 = nodeAngle(j, n)
        // start/end just outside the node circles, along the ring
        const startPad = nodeR + 6
        const sx = cx + (r) * Math.cos(a0)
        const sy = cy + (r) * Math.sin(a0)
        const ex = cx + (r) * Math.cos(a1)
        const ey = cy + (r) * Math.sin(a1)
        // pull start/end toward each other a touch so the arrow doesn't enter nodes
        const v0 = [sx - cx, sy - cy]
        const v1 = [ex - cx, ey - cy]
        // tangential offset of the endpoints by the node radius (approximate gap)
        const gap = startPad
        const sAng = a0 + gap / r
        const eAng = a1 - gap / r
        const psx = cx + r * Math.cos(sAng)
        const psy = cy + r * Math.sin(sAng)
        const pex = cx + r * Math.cos(eAng)
        const pey = cy + r * Math.sin(eAng)
        // control point bows outward
        const midA = (sAng + eAng) / 2
        const bow = r * 1.18
        const mcx = cx + bow * Math.cos(midA)
        const mcy = cy + bow * Math.sin(midA)
        // op label sits a bit further out than the arc midpoint
        const lr = r * 1.42
        const lx = cx + lr * Math.cos(midA)
        const ly = cy + lr * Math.sin(midA)
        void v0
        void v1
        return (
          <g key={`arr${i}`}>
            <path
              d={`M ${psx} ${psy} Q ${mcx} ${mcy} ${pex} ${pey}`}
              fill="none"
              stroke={ARROW}
              strokeWidth={3}
              strokeLinecap="round"
              markerEnd="url(#opcyc-arrow)"
            />
            <rect
              x={lx - 26}
              y={ly - 15}
              width={52}
              height={30}
              rx={7}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth={1.5}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill={OP_INK}>
              {ops[i]}
            </text>
          </g>
        )
      })}

      {/* nodes */}
      {nodes.map((label, i) => {
        const [x, y] = nodePos(i, n, cx, cy, r)
        const solved = values?.[i] ?? null
        const isSpot = spotlight === i
        return (
          <g key={`node${i}`}>
            {isSpot && <circle cx={x} cy={y} r={nodeR + 7} fill="none" stroke={SPOT} strokeWidth={3} />}
            <circle cx={x} cy={y} r={nodeR} fill={solved ? VALUE_FILL : NODE_FILL} stroke={solved ? SPOT : NODE_STROKE} strokeWidth={2.5} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={solved ? 19 : 20} fontWeight={900} fill={solved ? VALUE_INK : INK}>
              {solved ?? label}
            </text>
            {solved && (
              <text x={x} y={y - nodeR - 9} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={NODE_STROKE}>
                {label}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

export const Q19_EXAMPLE_NODES = ['4', '9', '18']
export const Q19_EXAMPLE_OPS = ['+5', '×2', '−14']

export const Q19_NODES = ['A', 'B', 'C', 'D', 'E']
export const Q19_OPS = ['+23', '×4', '−26', '÷6', '×0']

// Solved values for the target cycle (kept here for the explainer; NOT shown in the
// static figure): A=0, B=23, C=92, D=66, E=11 → B + E = 34 (choice D).
export const Q19_SOLVED = ['0', '23', '92', '66', '11']

export const Q19_VIEW_W = 460
export const Q19_VIEW_H = 300

export function Q19Diagram(props: {
  exampleValues?: Array<string | null>
  targetValues?: Array<string | null>
  spotlight?: number
}) {
  const { targetValues, spotlight } = props
  return (
    <svg
      viewBox={`0 0 ${Q19_VIEW_W} ${Q19_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <marker id="opcyc-arrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 9 4.5 L 0 9 z" fill={ARROW} />
        </marker>
      </defs>

      {/* worked-example cycle (given) */}
      <text x={118} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="#6B7280">
        example
      </text>
      <OpCycle nodes={Q19_EXAMPLE_NODES} ops={Q19_EXAMPLE_OPS} cx={118} cy={170} r={74} nodeR={24} />

      {/* target cycle (the question) */}
      <text x={336} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="#6B7280">
        find B + E
      </text>
      <OpCycle nodes={Q19_NODES} ops={Q19_OPS} cx={336} cy={160} r={92} nodeR={24} values={targetValues} spotlight={spotlight} />
    </svg>
  )
}

export default function P24G3Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two operation cycles. Example: 4 plus 5 is 9, times 2 is 18, minus 14 is 4. Target cycle: A plus 23 is B, times 4 is C, minus 26 is D, divided by 6 is E, times 0 is A. Find B plus E."
    >
      <Q19Diagram />
    </div>
  )
}
