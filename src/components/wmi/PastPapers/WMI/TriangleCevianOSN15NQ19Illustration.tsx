// OSN-15-SD-NAS-Q19 — Triangle ABC with cevian AD
//
// Problem: D on BC s.t. AC = CD, ∠CAB = ∠ABC + 45°. Find ∠BAD.
//
// Coordinates use β = 45° for visual accuracy (gives D ≈ 30% from B):
//   A = (130, 75), B = (30, 175), C = (230, 175), D = (89, 175)
//   AC = CD ≈ 141 (equal sides shown with tick marks)
//
// Shows ONLY the problem: triangle, cevian AD, equal-side tick marks,
// vertex labels. Does NOT show any angles or the answer.
//
// Pure SVG — no hooks, no motion; SSR-safe.

export const SVG_W = 270
export const SVG_H = 215

/** Vertex coordinates (shared with Explainer for overlay reuse). */
export const PT = {
  A: { x: 130, y: 75 },
  B: { x: 30, y: 175 },
  C: { x: 230, y: 175 },
  D: { x: 89, y: 175 },
} as const

const INK = '#1F2937'
const FILL = '#EFF6FF'
const TICK = '#DC2626'

// ── Tick mark (single perpendicular slash at midpoint of a segment) ────────

function TickMark({
  x1, y1, x2, y2, len = 6,
}: {
  x1: number; y1: number; x2: number; y2: number; len?: number
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const d = Math.sqrt(dx * dx + dy * dy)
  // unit perpendicular (rotated 90°)
  const px = -dy / d
  const py = dx / d
  return (
    <line
      x1={mx + px * len}
      y1={my + py * len}
      x2={mx - px * len}
      y2={my - py * len}
      stroke={TICK}
      strokeWidth={2}
      strokeLinecap="round"
    />
  )
}

// ── Default export ─────────────────────────────────────────────────────────

/**
 * TriangleCevianOSN15NQ19Illustration
 *
 * Static problem-only figure for OSN-15-SD-NAS-Q19.
 * Shows triangle ABC with cevian AD; tick marks signal AC = CD.
 */
export default function TriangleCevianOSN15NQ19Illustration() {
  const { A, B, C, D } = PT
  const triPts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Segitiga ABC dengan cevian AD; AC = CD ditandai dengan tanda centang merah."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* filled triangle ABC */}
        <polygon
          points={triPts}
          fill={FILL}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* cevian AD */}
        <line
          x1={A.x} y1={A.y}
          x2={D.x} y2={D.y}
          stroke={INK}
          strokeWidth={2}
        />

        {/* equal-side tick marks on AC and CD */}
        <TickMark x1={A.x} y1={A.y} x2={C.x} y2={C.y} />
        <TickMark x1={C.x} y1={C.y} x2={D.x} y2={D.y} />

        {/* vertex labels */}
        <text
          x={A.x} y={A.y - 10}
          textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          A
        </text>
        <text
          x={B.x - 12} y={B.y + 5}
          textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          B
        </text>
        <text
          x={D.x} y={D.y + 16}
          textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          D
        </text>
        <text
          x={C.x + 12} y={C.y + 5}
          textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          C
        </text>
      </svg>
    </div>
  )
}
