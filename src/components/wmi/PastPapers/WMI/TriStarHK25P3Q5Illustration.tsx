// HKIMO-25-P3H-Q5 — "What is the difference between the number of * in group 30 and group 99?"
//
// Groups 1–4 shown as inverted-staircase star patterns (triangular numbers).
// Cell (row, col) is filled iff row + col < n for group n.
// Group 1 → 1 star, Group 2 → 3 stars, Group 3 → 6 stars, Group 4 → 10 stars.
//
// Pure SVG — no hooks, no framer-motion, SSR-safe.

const CELL = 20       // px per grid cell
const GAP  = 28       // px gap between groups
const PAD  = { x: 16, top: 12, bot: 36 }

const GROUPS = [1, 2, 3, 4]

const C = {
  fill:   '#FEF3C7',  // amber-100
  stroke: '#D97706',  // amber-600
  star:   '#92400E',  // amber-900
  label:  '#44403C',  // stone-700
  count:  '#78350F',  // amber-950
} as const

/** Returns (x, y) top-left of group n's grid (1-indexed). */
function groupOrigin(n: number): { x: number; y: number } {
  // Align all groups to the same top edge
  let x = PAD.x
  for (let k = 1; k < n; k++) x += k * CELL + GAP
  return { x, y: PAD.top }
}

const maxGroupSize = Math.max(...GROUPS)
const lastOrigin = groupOrigin(GROUPS.length)
const SVG_W = lastOrigin.x + GROUPS[GROUPS.length - 1] * CELL + PAD.x
const SVG_H = PAD.top + maxGroupSize * CELL + PAD.bot

export default function TriStarHK25P3Q5Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-label="Star groups 1 to 4 — triangular number staircase pattern"
      role="img"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {GROUPS.map((n) => {
        const origin = groupOrigin(n)
        const starCount = (n * (n + 1)) / 2
        const labelX = origin.x + (n * CELL) / 2
        const labelY = PAD.top + maxGroupSize * CELL + 14

        return (
          <g key={n}>
            {/* Draw filled cells for this group */}
            {Array.from({ length: n }, (_, row) =>
              Array.from({ length: n - row }, (_, col) => (
                <g key={`${row}-${col}`}>
                  <rect
                    x={origin.x + col * CELL}
                    y={origin.y + row * CELL}
                    width={CELL}
                    height={CELL}
                    fill={C.fill}
                    stroke={C.stroke}
                    strokeWidth={1.5}
                  />
                  <text
                    x={origin.x + col * CELL + CELL / 2}
                    y={origin.y + row * CELL + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={700}
                    fill={C.star}
                    fontFamily="ui-monospace, monospace"
                  >
                    *
                  </text>
                </g>
              ))
            )}

            {/* Group label */}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={10}
              fill={C.label}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight={600}
            >
              {`Group ${n}`}
            </text>
            {/* Star count */}
            <text
              x={labelX}
              y={labelY + 13}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={10}
              fill={C.count}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight={700}
            >
              {`(${starCount})`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
