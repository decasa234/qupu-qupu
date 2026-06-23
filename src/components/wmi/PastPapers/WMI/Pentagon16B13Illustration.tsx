// SEAMO-16-B-Q13 — "The figure shown below is a regular pentagon."
//
// The question asks for the interior angle of a regular pentagon (answer: 108°).
// This component renders a clean regular pentagon with one interior angle arc
// marked to prompt the learner — no label, no answer revealed.
//
// No primitive covers polygon figures, so this is a fresh component.
// Pure SVG, no hooks, no framer-motion: SSR-safe.

const FILL = '#FDE68A'      // warm amber fill (qupu gold-ish, no token needed)
const STROKE = '#92400E'    // amber-dark border
const ANGLE_STROKE = '#1D4ED8' // blue arc for the highlighted interior angle

// A regular pentagon centred at (cx, cy) with circumradius R.
// Vertices: starting from the top, going clockwise.
function pentagonPoints(cx: number, cy: number, R: number): [number, number][] {
  return Array.from({ length: 5 }, (_, i) => {
    // offset -90deg so the first vertex is at the top
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return [cx + R * Math.cos(angle), cy + R * Math.sin(angle)] as [number, number]
  })
}

// Small arc showing the interior angle at vertex verts[idx],
// between the two adjacent sides, at radius r.
function interiorAngleArc(verts: [number, number][], idx: number, r: number): string {
  const n = verts.length
  const v = verts[idx]
  const prev = verts[(idx - 1 + n) % n]
  const next = verts[(idx + 1) % n]

  const ang = (to: [number, number]) => Math.atan2(to[1] - v[1], to[0] - v[0])
  let a0 = ang(prev)
  let a1 = ang(next)

  // Shortest sweep (interior arc of a convex polygon is < π)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI

  const sweepFlag = d >= 0 ? 1 : 0
  const a1final = a0 + d
  const largeArc = Math.abs(d) > Math.PI ? 1 : 0

  const x0 = v[0] + r * Math.cos(a0)
  const y0 = v[1] + r * Math.sin(a0)
  const x1 = v[0] + r * Math.cos(a1final)
  const y1 = v[1] + r * Math.sin(a1final)

  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

// Bisector tip: point along the interior bisector at the given vertex
function bisectorTip(verts: [number, number][], idx: number, dist: number): [number, number] {
  const n = verts.length
  const v = verts[idx]
  const prev = verts[(idx - 1 + n) % n]
  const next = verts[(idx + 1) % n]
  const ang = (to: [number, number]) => Math.atan2(to[1] - v[1], to[0] - v[0])
  let a0 = ang(prev)
  let a1 = ang(next)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  const mid = a0 + d / 2
  return [v[0] + dist * Math.cos(mid), v[1] + dist * Math.sin(mid)]
}

const CX = 110
const CY = 112
const R = 88       // circumradius
const ARC_R = 24   // arc radius for the angle mark

const VERTS = pentagonPoints(CX, CY, R)
const POINTS_STR = VERTS.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
// Mark the interior angle at index 1 (upper-right vertex — clearly visible)
const MARKED_IDX = 1
const ARC_PATH = interiorAngleArc(VERTS, MARKED_IDX, ARC_R)
const LABEL_PT = bisectorTip(VERTS, MARKED_IDX, ARC_R + 20)

const ARIA =
  'Segi lima beraturan (regular pentagon). Satu sudut dalam ditandai dengan busur biru dan tanda tanya. ' +
  'Tentukan besar setiap sudut dalam segi lima beraturan tersebut.'

/**
 * The regular pentagon figure for SEAMO-2016-Paper-B-Q13.
 * Marks one interior angle with an arc and "?" — does NOT reveal 108°.
 */
export function Pentagon16B13Figure() {
  return (
    <svg
      viewBox="0 0 220 224"
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Pentagon fill */}
      <polygon
        points={POINTS_STR}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Interior angle arc at the marked vertex */}
      <path
        d={ARC_PATH}
        fill="none"
        stroke={ANGLE_STROKE}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* "?" label at the bisector of the marked angle */}
      <text
        x={LABEL_PT[0].toFixed(1)}
        y={LABEL_PT[1].toFixed(1)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        fill={ANGLE_STROKE}
      >
        ?
      </text>
    </svg>
  )
}

/**
 * Default export: the wrapped illustration for SEAMO-16-B-Q13.
 */
export default function Pentagon16B13Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={ARIA}
    >
      <Pentagon16B13Figure />
    </div>
  )
}
