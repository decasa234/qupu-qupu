// HexagonAnglesHK23P1SFQ17Illustration — HKIMO-23-P1SF-Q17
//
// "How many interior angle(s) is / are there in the polygon below?"  Answer: 6
//
// Figure: concave hexagon — 6 vertices, 6 sides, 6 interior angles.
// One reflex vertex at the right-middle dent; spike peak at the upper-right.
//
// Vertices (viewBox "0 0 440 460"):
//   V0 = [55, 435]   bottom-left
//   V1 = [130, 52]   top-left
//   V2 = [283, 68]   upper-center
//   V3 = [385, 22]   spike peak (upper-right)
//   V4 = [272, 235]  concave vertex (right-middle dent)
//   V5 = [382, 435]  bottom-right
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.
// Co-exports HexagonAnglesHK23P1SFQ17Figure (reused by the explainer).

export type HexagonHighlight = 'none' | 'all' | number[]

export interface HexagonFigureProps {
  /** 'none' = plain polygon; 'all' = number all 6 vertices; number[] = subset */
  highlight?: HexagonHighlight
}

export const VERTS: readonly [number, number][] = [
  [55, 435],
  [130, 52],
  [283, 68],
  [385, 22],
  [272, 235],
  [382, 435],
] as const

const INK   = '#1F2937'
const AMBER = '#D97706'

/** Returns a point along the interior bisector from a vertex, used for vertex labels. */
function labelPos(idx: number): [number, number] {
  const n = VERTS.length
  const v = VERTS[idx]
  const prev = VERTS[(idx + n - 1) % n]
  const next = VERTS[(idx + 1) % n]
  const d1x = prev[0] - v[0], d1y = prev[1] - v[1]
  const len1 = Math.hypot(d1x, d1y) || 1
  const d2x = next[0] - v[0], d2y = next[1] - v[1]
  const len2 = Math.hypot(d2x, d2y) || 1
  const bx = d1x / len1 + d2x / len2
  const by = d1y / len1 + d2y / len2
  const blen = Math.hypot(bx, by) || 1
  const DIST = 30
  return [v[0] + (bx / blen) * DIST, v[1] + (by / blen) * DIST]
}

export function HexagonAnglesHK23P1SFQ17Figure({ highlight = 'none' }: HexagonFigureProps = {}) {
  const pts = VERTS.map(([x, y]) => `${x},${y}`).join(' ')
  const showAll = highlight === 'all'
  const subset: Set<number> | null = Array.isArray(highlight) ? new Set(highlight) : null

  return (
    <svg viewBox="0 0 440 460" width={260} aria-hidden="true">
      <polygon
        points={pts}
        fill="none"
        stroke={INK}
        strokeWidth={3.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {VERTS.map(([x, y], i) => {
        const active = showAll || (subset?.has(i) ?? false)
        if (!active) return null
        const [lx, ly] = labelPos(i)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={5.5} fill={AMBER} stroke="#fff" strokeWidth={1.5} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={800}
              fill={AMBER}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const ARIA =
  'A concave six-sided polygon with a triangular spike at the upper-right and an ' +
  'inward notch on the right side. The question asks how many interior angles it has.'

export default function HexagonAnglesHK23P1SFQ17Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <HexagonAnglesHK23P1SFQ17Figure />
    </div>
  )
}
