// "Arrow A→B means A is larger than B" comparison for WMI-20P1A-Q22.
//
// Source figure (db/seed/wmi/figures/2020-semifinal-g1-a-q22.jpg): four boxes at
// the corners of a square, the top-right box holds the star. Arrows (A→B ⇒ A>B):
//   TR → TL   (top edge, points left)
//   BL → TL   (left edge, points up)
//   TR → BR   (right edge, points down)
//   BL → BR   (bottom edge, points right)
//   BL → TR   (diagonal, points to TR)
//   TL → BR   (diagonal, points to BR)
//
// Numbers to place: 45, 56, 68, 81. Count how many boxes each beats (out-degree):
//   BL beats TL, TR, BR  → 3  → largest  = 81
//   TR beats TL, BR      → 2  → second   = 68   ← the star (answer C)
//   TL beats BR          → 1  → third    = 56
//   BR beats nobody      → 0  → smallest = 45

const INK = '#1F2937'
const STAR = '#F59E0B'

export const Q22_NUMBERS = [45, 56, 68, 81] as const
export const Q22_STAR_VALUE = 68 // answer C

export type Corner = 'TL' | 'TR' | 'BL' | 'BR'

/** Box centres in the 320×260 viewport. */
const POS: Record<Corner, [number, number]> = {
  TL: [70, 60],
  TR: [250, 60],
  BL: [70, 200],
  BR: [250, 200],
}

const HALF = 26 // half box side

/** Directed "greater-than" edges, from larger box to smaller box. */
export const Q22_EDGES: Array<[Corner, Corner]> = [
  ['TR', 'TL'],
  ['BL', 'TL'],
  ['TR', 'BR'],
  ['BL', 'BR'],
  ['BL', 'TR'],
  ['TL', 'BR'],
]

/** Shrink a segment so it starts/ends on the box edge, not the centre. */
function trimmed(from: Corner, to: Corner): { x1: number; y1: number; x2: number; y2: number } {
  const [ax, ay] = POS[from]
  const [bx, by] = POS[to]
  const dx = bx - ax
  const dy = by - ay
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const pad = HALF + 8
  return {
    x1: ax + (dx / len) * pad,
    y1: ay + (dy / len) * pad,
    x2: bx - (dx / len) * (pad + 4),
    y2: by - (dy / len) * (pad + 4),
  }
}

export const Q22_VIEW_W = 320
export const Q22_VIEW_H = 260

export interface Q22DiagramProps {
  /** Filled-in number per corner (omit for empty box). */
  values?: Partial<Record<Corner, number>>
  /** Corner to outline as the focus. */
  focus?: Corner | null
  /** Edges to colour as "just-decided" (larger→smaller). */
  litEdges?: Array<[Corner, Corner]>
}

export function Q22Diagram({ values = {}, focus = null, litEdges = [] }: Q22DiagramProps) {
  const isLit = (a: Corner, b: Corner) => litEdges.some(([x, y]) => x === a && y === b)
  return (
    <svg
      viewBox={`0 0 ${Q22_VIEW_W} ${Q22_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <marker id="q22-head" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={INK} />
        </marker>
        <marker id="q22-head-lit" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="#2f6df0" />
        </marker>
      </defs>

      {Q22_EDGES.map(([a, b], i) => {
        const { x1, y1, x2, y2 } = trimmed(a, b)
        const lit = isLit(a, b)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={lit ? '#2f6df0' : INK}
            strokeWidth={lit ? 4 : 2.5}
            markerEnd={`url(#${lit ? 'q22-head-lit' : 'q22-head'})`}
          />
        )
      })}

      {(Object.keys(POS) as Corner[]).map((corner) => {
        const [x, y] = POS[corner]
        const v = values[corner]
        const isStar = corner === 'TR' && v === undefined
        const focused = focus === corner
        return (
          <g key={corner}>
            <rect
              x={x - HALF}
              y={y - HALF}
              width={HALF * 2}
              height={HALF * 2}
              rx={5}
              fill="#FFFFFF"
              stroke={focused ? '#2f6df0' : INK}
              strokeWidth={focused ? 3.5 : 2.5}
            />
            {v !== undefined ? (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={focused ? '#2f6df0' : INK}>
                {v}
              </text>
            ) : isStar ? (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={24} fill={STAR}>
                {'★'}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

export default function P20G1Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four boxes at the corners of a square joined by arrows. An arrow from one box to another means the first number is larger. The top-right box holds the star."
    >
      <Q22Diagram />
    </div>
  )
}
