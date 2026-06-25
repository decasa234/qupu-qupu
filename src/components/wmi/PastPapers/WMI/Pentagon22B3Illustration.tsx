// SEAMO-22-B-Q3 (2022 Contest B) — pentagon ABCDE, ∠A = 90°, find ∠B+∠C+∠D+∠E.
//
// The figure shows a convex pentagon with vertices A (top-right, right angle),
// B (top-center), C (far left), D (bottom-center), E (bottom-right). The right-
// angle square at A is the only mark on the figure. The stem shows the PROBLEM
// (∠A = 90°) without revealing that the answer is 450°.
//
// Pure render: no Math.random, no Date, SSR-safe and deterministic. The co-exported
// `PentagonShape` primitive lets the explainer animate angle-by-angle highlighting.

type Pt = [number, number]

// Pentagon vertices in SVG coordinates (x right, y down).
// Faithfully reconstructed from the paper figure (002.jpg):
//   A — top-right (right angle)
//   B — top-center (slightly left of A, higher)
//   C — far left (pointed)
//   D — bottom-center
//   E — bottom-right (below A)
const A: Pt = [190, 30]
const B: Pt = [100, 10]
const C: Pt = [10, 110]
const D: Pt = [100, 200]
const E: Pt = [190, 150]

const VERTS: Pt[] = [A, B, C, D, E]
const LABELS: { pt: Pt; name: string; dx: number; dy: number }[] = [
  { pt: A, name: 'A', dx: 14, dy: -6 },
  { pt: B, name: 'B', dx: 0, dy: -16 },
  { pt: C, name: 'C', dx: -18, dy: 0 },
  { pt: D, name: 'D', dx: 0, dy: 18 },
  { pt: E, name: 'E', dx: 16, dy: 6 },
]

const INK = '#1a1a2e'
const FILL = '#f0f4ff'

// Right-angle square mark at vertex V, with legs toward P and Q, side length s.
function rightAnglePath(V: Pt, P: Pt, Q: Pt, s: number): string {
  const unit = (p: Pt): Pt => {
    const dx = p[0] - V[0]
    const dy = p[1] - V[1]
    const len = Math.hypot(dx, dy) || 1
    return [dx / len, dy / len]
  }
  const u = unit(P)
  const v = unit(Q)
  const p1: Pt = [V[0] + u[0] * s, V[1] + u[1] * s]
  const p3: Pt = [V[0] + v[0] * s, V[1] + v[1] * s]
  const p2: Pt = [p1[0] + v[0] * s, p1[1] + v[1] * s]
  return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`
}

// Small arc mark at vertex V between legs P and Q.
function arcPath(V: Pt, P: Pt, Q: Pt, r: number): string {
  const ang = (p: Pt) => Math.atan2(p[1] - V[1], p[0] - V[0])
  const a0 = ang(P)
  let a1 = ang(Q)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  a1 = a0 + d
  const sweep = d >= 0 ? 1 : 0
  const x0 = V[0] + r * Math.cos(a0)
  const y0 = V[1] + r * Math.sin(a0)
  const x1 = V[0] + r * Math.cos(a1)
  const y1 = V[1] + r * Math.sin(a1)
  return `M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`
}

export type HighlightAngle = 'A' | 'B' | 'C' | 'D' | 'E' | null

export interface PentagonShapeProps {
  /** Highlight one angle vertex for the explainer. */
  highlight?: HighlightAngle
  /** Show the 90° label on A (explainer post-reveal). */
  showALabel?: boolean
  /** Show the sum label (for answer beat). */
  sumLabel?: string
}

const VB_W = 220
const VB_H = 220

/**
 * Pentagon ABCDE with ∠A = 90° marked. Co-exported so the explainer can
 * spotlight individual angles without re-importing the geometry.
 */
export function PentagonShape({
  highlight = null,
  showALabel = false,
  sumLabel,
}: PentagonShapeProps = {}) {
  const polyPoints = VERTS.map(([x, y]) => `${x},${y}`).join(' ')

  // Neighbour lookup for arc/mark rendering:
  //   vertex order A B C D E (index 0..4); predecessor and successor
  const order: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']
  const ptMap: Record<string, Pt> = { A, B, C, D, E }
  const idx = order.indexOf.bind(order)

  return (
    <svg
      viewBox={`-10 -10 ${VB_W + 20} ${VB_H + 20}`}
      width={260}
      aria-hidden="true"
    >
      {/* Filled pentagon */}
      <polygon
        points={polyPoints}
        fill={FILL}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Angle marks */}
      {order.map((name, i) => {
        const V = ptMap[name]
        const prev = ptMap[order[(i + 4) % 5]]
        const next = ptMap[order[(i + 1) % 5]]
        const lit = highlight === name
        const arcColor = lit ? '#f0853a' : '#30598A'
        const arcW = lit ? 3.5 : 2

        if (name === 'A') {
          // Right-angle square
          return (
            <g key={name}>
              <path
                d={rightAnglePath(V, prev, next, 14)}
                fill="none"
                stroke={lit ? '#f0853a' : INK}
                strokeWidth={lit ? 2.5 : 1.8}
                strokeLinejoin="round"
              />
              {showALabel && (
                <text
                  x={V[0] - 30}
                  y={V[1] + 6}
                  fontSize={13}
                  fontWeight={700}
                  fill="#f0853a"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  90°
                </text>
              )}
            </g>
          )
        }
        return (
          <path
            key={name}
            d={arcPath(V, prev, next, 20)}
            fill="none"
            stroke={arcColor}
            strokeWidth={arcW}
            strokeLinecap="round"
          />
        )
      })}

      {/* Vertex labels */}
      {LABELS.map(({ pt, name, dx, dy }) => (
        <text
          key={name}
          x={pt[0] + dx}
          y={pt[1] + dy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={700}
          fontStyle="italic"
          fill={INK}
        >
          {name}
        </text>
      ))}

      {/* Optional answer sum label */}
      {sumLabel && (
        <text
          x={VB_W / 2 + 5}
          y={VB_H / 2 + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={800}
          fill="#059669"
        >
          {sumLabel}
        </text>
      )}
    </svg>
  )
}

const ARIA =
  'Pentagon ABCDE with a right-angle mark at vertex A. ' +
  'Find the sum of angles B, C, D, and E.'

/** Default export: the plain pentagon problem figure. Reveals ∠A = 90°, nothing else. */
export default function Pentagon22B3Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <PentagonShape />
    </div>
  )
}
