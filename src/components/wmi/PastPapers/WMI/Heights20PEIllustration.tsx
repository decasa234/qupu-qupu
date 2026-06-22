// IKMC-20-PE-Q20 — "Who is the shortest?" (six people A–F, arrow diagram).
//
// Arrow diagram from OCR image 064.jpg:
//   B → A  (example given in problem: B is taller than A)
//   B → C
//   A → E
//   A → D
//   E → D
//   F → D
//   F → C
//
// The STATIC problem figure shows the six people in their geometric positions
// with directed arrows between them — it does NOT reveal who is shortest.
// The arrow from B to A is labelled "(example)" in the problem text.
//
// Layout mirrors the original figure:
//   E (top-left)   A (top-right)
//   D (bottom-left)  B (bottom-center)  C (bottom-right)
//   F (far right, middle)
//
// Pure render, SSR-safe.

export type PersonName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

// Positions in a 320×220 coordinate space (viewBox).
const PERSON_POS: Record<PersonName, { x: number; y: number }> = {
  E: { x: 62,  y: 44  },
  A: { x: 220, y: 44  },
  F: { x: 292, y: 118 },
  D: { x: 62,  y: 178 },
  B: { x: 160, y: 186 },
  C: { x: 256, y: 186 },
}

// Arrows: [from, to]
const ARROWS: [PersonName, PersonName][] = [
  ['B', 'A'],
  ['B', 'C'],
  ['A', 'E'],
  ['A', 'D'],
  ['E', 'D'],
  ['F', 'D'],
  ['F', 'C'],
]

const NODE_R = 18
const ARROW_COLOR = '#30598A' // qupu-brand-blue
const NODE_FILL = '#E1EFFB'
const NODE_STROKE = '#30598A'
const TEXT_COLOR = '#30598A'

/** Compute the start/end point of an arrow line, offset from node center by radius. */
function arrowEndpoints(
  from: { x: number; y: number },
  to: { x: number; y: number },
  r: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len
  return {
    x1: from.x + ux * (r + 2),
    y1: from.y + uy * (r + 2),
    x2: to.x - ux * (r + 4),
    y2: to.y - uy * (r + 4),
  }
}

/**
 * Heights20PEArrowDiagram — the shared arrow-diagram primitive.
 *
 * Renders the six people (A–F) as labelled circles connected by directed
 * arrows (taller → shorter). The explainer reuses this primitive and
 * highlights nodes / arrows per beat.
 *
 * @param highlight  set of nodes to highlight (amber ring) in the explainer.
 * @param shortestRevealed  when true, person C gets a green "SHORTEST" ring.
 */
export function Heights20PEArrowDiagram({
  highlight = new Set<PersonName>(),
  shortestRevealed = false,
}: {
  highlight?: Set<PersonName>
  shortestRevealed?: boolean
}) {
  const W = 340
  const H = 230

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={Math.min(320, W)}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="arrow-pe20"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={ARROW_COLOR} />
        </marker>
      </defs>

      {/* Arrow lines */}
      {ARROWS.map(([from, to]) => {
        const { x1, y1, x2, y2 } = arrowEndpoints(
          PERSON_POS[from],
          PERSON_POS[to],
          NODE_R,
        )
        return (
          <line
            key={`${from}-${to}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ARROW_COLOR}
            strokeWidth={2.5}
            markerEnd="url(#arrow-pe20)"
          />
        )
      })}

      {/* Person nodes */}
      {(Object.entries(PERSON_POS) as [PersonName, { x: number; y: number }][]).map(
        ([name, { x, y }]) => {
          const isHighlighted = highlight.has(name)
          const isShortest = shortestRevealed && name === 'C'
          const strokeColor = isShortest
            ? '#10B981' // green
            : isHighlighted
              ? '#F59E0B' // amber
              : NODE_STROKE
          const strokeW = isHighlighted || isShortest ? 3.5 : 2.5
          const fill = isShortest ? '#D1FAE5' : NODE_FILL

          return (
            <g key={name}>
              <circle
                cx={x}
                cy={y}
                r={NODE_R}
                fill={fill}
                stroke={strokeColor}
                strokeWidth={strokeW}
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill={isShortest ? '#065F46' : TEXT_COLOR}
              >
                {name}
              </text>
            </g>
          )
        },
      )}
    </svg>
  )
}

/**
 * Heights20PEIllustration — static problem figure for IKMC-20-PE-Q20.
 *
 * Shows the six-person arrow diagram exactly as in the printed paper —
 * no answer is revealed; students must deduce from the arrows who is shortest.
 */
export default function Heights20PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Diagram panah enam orang A sampai F. Panah dari satu orang ke orang lain berarti orang pertama lebih tinggi. Temukan siapa yang paling pendek."
    >
      <Heights20PEArrowDiagram />
    </div>
  )
}
