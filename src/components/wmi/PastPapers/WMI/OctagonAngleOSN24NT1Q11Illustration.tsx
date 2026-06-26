// OSN-24-SD-NAS-TEORI1-Q11
// Regular octagon ABCDEFGH (not labeled as such here); three specific vertices
// are named A (upper-left, 135°), B (bottom, 270°), C (right, 0°).
// Angle ACB = 67.5° (arc AB not through C = 3×45° = 135°; inscribed angle = half).
// This file shows the PROBLEM only — the "?" at C.

export const SVG_W = 320
export const SVG_H = 295

const CX = 155
const CY = 142
const R = 95

/** Eight vertices of a regular octagon, clockwise from top (i=0 at 90°). */
export const VERTS: [number, number][] = Array.from({ length: 8 }, (_, i) => {
  const rad = ((90 - i * 45) * Math.PI) / 180
  return [
    Math.round((CX + R * Math.cos(rad)) * 10) / 10,
    Math.round((CY - R * Math.sin(rad)) * 10) / 10,
  ]
})

/** v7 at 135° — upper-left vertex, labeled A in the problem. */
export const VERTEX_A = VERTS[7]
/** v4 at 270° — bottom vertex, labeled B in the problem. */
export const VERTEX_B = VERTS[4]
/** v2 at 0°  — right vertex, labeled C; angle ACB is measured here. */
export const VERTEX_C = VERTS[2]

/** SVG short-arc path for the angle-indicator arc at vertex C.
 *  Goes from ray CA to ray CB via the minor arc (67.5°), sweep=0 (CCW in SVG). */
export function makeAngleArc(
  C: readonly [number, number],
  from: readonly [number, number],
  to: readonly [number, number],
  r: number,
): string {
  const dx1 = from[0] - C[0]
  const dy1 = from[1] - C[1]
  const len1 = Math.hypot(dx1, dy1)
  const dx2 = to[0] - C[0]
  const dy2 = to[1] - C[1]
  const len2 = Math.hypot(dx2, dy2)
  const sx = (C[0] + (r * dx1) / len1).toFixed(1)
  const sy = (C[1] + (r * dy1) / len1).toFixed(1)
  const ex = (C[0] + (r * dx2) / len2).toFixed(1)
  const ey = (C[1] + (r * dy2) / len2).toFixed(1)
  // sweep-flag=0: counterclockwise in SVG screen = short arc (67.5°)
  return `M ${sx},${sy} A ${r} ${r} 0 0 0 ${ex},${ey}`
}

export default function OctagonAngleOSN24NT1Q11Illustration({
  lang = 'id',
}: {
  lang?: 'en' | 'id'
}) {
  const poly = VERTS.map(([x, y]) => `${x},${y}`).join(' ')
  const [Ax, Ay] = VERTEX_A
  const [Bx, By] = VERTEX_B
  const [Cx, Cy] = VERTEX_C
  const arcPath = makeAngleArc(VERTEX_C, VERTEX_A, VERTEX_B, 20)

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      aria-label={
        lang === 'id'
          ? 'Segi delapan beraturan dengan sudut ACB ditandai tanda tanya'
          : 'Regular octagon with angle ACB marked as unknown'
      }
    >
      {/* Octagon */}
      <polygon points={poly} fill="#FEF3C7" stroke="#D97706" strokeWidth={2.5} />

      {/* Triangle ACB — all three sides */}
      <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke="#475569" strokeWidth={1.5} />
      <line x1={Cx} y1={Cy} x2={Ax} y2={Ay} stroke="#475569" strokeWidth={1.5} />
      <line x1={Cx} y1={Cy} x2={Bx} y2={By} stroke="#475569" strokeWidth={1.5} />

      {/* Angle arc at C */}
      <path d={arcPath} fill="none" stroke="#16A34A" strokeWidth={2} />

      {/* "?" label inside the angle (bisector direction from C toward interior) */}
      <text
        x={215}
        y={147}
        fontSize={11}
        fontWeight="bold"
        fill="#16A34A"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        ?
      </text>

      {/* Vertex labels */}
      <text
        x={Ax - 16}
        y={Ay - 10}
        fontSize={14}
        fontWeight="bold"
        fill="#1E40AF"
        textAnchor="middle"
      >
        A
      </text>
      <text
        x={Bx}
        y={By + 22}
        fontSize={14}
        fontWeight="bold"
        fill="#1E40AF"
        textAnchor="middle"
      >
        B
      </text>
      <text
        x={Cx + 16}
        y={Cy + 5}
        fontSize={14}
        fontWeight="bold"
        fill="#1E40AF"
        textAnchor="middle"
      >
        C
      </text>
    </svg>
  )
}
