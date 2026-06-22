// SEAMO-16-A-Q10 — "Least colours to colour petals so no two neighbours share a colour?"
//
// The figure (007.jpg) shows a daisy-style flower with 5 white petals arranged in a ring
// around a yellow centre circle.  5 petals = odd cycle → minimum 3 colours.
//
// Exports:
//   FlowerPetal           — one rounded-petal path centred on a ring orbit
//   PETAL_COUNT           — 5  (source of truth)
//   petalTransform        — (i, outerR, cx, cy) → SVG transform string
//   FlowerPetals16A10Illustration  (default)
//
// No Math.random, no Date — SSR-safe & deterministic.

export const PETAL_COUNT = 5          // odd  →  2-colour attempt fails → need 3

// Flower geometry
const CX = 110
const CY = 110
const CENTRE_R  = 34    // yellow centre
const ORBIT_R   = 66    // distance from flower-centre to petal-centre
const PETAL_RX  = 28    // petal half-width
const PETAL_RY  = 42    // petal half-height
const SVG_SIZE  = 220

/** SVG transform that places petal i at its orbit position and rotates it to point outward. */
export function petalTransform(i: number, orbitR = ORBIT_R, cx = CX, cy = CY): string {
  const angle = (2 * Math.PI * i) / PETAL_COUNT - Math.PI / 2
  const px = cx + orbitR * Math.cos(angle)
  const py = cy + orbitR * Math.sin(angle)
  const deg = (angle * 180) / Math.PI + 90
  return `rotate(${deg.toFixed(2)}, ${px.toFixed(2)}, ${py.toFixed(2)})`
}

/** One petal: a filled ellipse at orbit position i, rotated to point outward. */
export function FlowerPetal({
  index,
  fill = '#FFFFFF',
  stroke = '#9CA3AF',
  strokeWidth = 1.8,
  opacity = 1,
}: {
  index: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}) {
  const angle = (2 * Math.PI * index) / PETAL_COUNT - Math.PI / 2
  const px = CX + ORBIT_R * Math.cos(angle)
  const py = CY + ORBIT_R * Math.sin(angle)
  const deg = (angle * 180) / Math.PI + 90
  return (
    <ellipse
      cx={px}
      cy={py}
      rx={PETAL_RX}
      ry={PETAL_RY}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      transform={`rotate(${deg.toFixed(2)}, ${px.toFixed(2)}, ${py.toFixed(2)})`}
    />
  )
}

// ---------------------------------------------------------------------------
// Main stem illustration — shows the flower UNCOLOURED (problem state)
// ---------------------------------------------------------------------------

export default function FlowerPetals16A10Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A flower with 5 white petals arranged in a ring around a yellow centre circle."
    >
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        width="100%"
        style={{ maxWidth: SVG_SIZE, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* 5 petals */}
        {Array.from({ length: PETAL_COUNT }, (_, i) => (
          <FlowerPetal key={i} index={i} />
        ))}

        {/* Yellow centre */}
        <circle
          cx={CX}
          cy={CY}
          r={CENTRE_R}
          fill="#FBBF24"
          stroke="#D97706"
          strokeWidth={2}
        />
      </svg>
    </div>
  )
}
