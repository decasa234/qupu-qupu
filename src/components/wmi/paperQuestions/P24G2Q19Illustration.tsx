// Flower "find the matching figure" stem for WMI-24P2A-Q19 (2024 Grade-2
// Semifinal, Paper A).
//
// Reconstructed from db/seed/wmi/figures/2024-semifinal-g2-a-q19.jpg: a six-petal
// flower with a gold body. The six petals carry discs that ALTERNATE around the
// flower — three solid DARK discs and three hollow WHITE discs (a white centre
// with a thin dark rim). Reading the petals around the flower the colours go
//   dark, white, dark, white, dark, white.
//
// The answer options in the paper were images (seed choices read "(A)"..."(E)");
// the correct one (the seed answer, E) is the option that is the SAME flower —
// it can be ROTATED onto this one (a mirror image would reverse the colour order
// and is NOT the same). The static figure shows ONLY the given flower.
//
// Petal-disc pattern, clockwise from the top petal. true = solid dark disc.
export const PETAL_DARK = [true, false, true, false, true, false] as const
export const N_PETALS = PETAL_DARK.length // 6

const BODY = '#F5C518' // gold flower body
const BODY_EDGE = '#D9A400'
const DARK = '#2E2A26' // solid dark disc
const WHITE = '#FFFFFF' // hollow disc fill
const RIM = '#2E2A26' // hollow disc rim
const HALO = '#10B981' // active-petal highlight ring

export const Q19_VIEW = 220
const CX = Q19_VIEW / 2
const CY = Q19_VIEW / 2

const PETAL_R = 64 // distance from centre to a petal-disc centre
const PETAL_RX = 30 // petal half-width
const PETAL_RY = 40 // petal half-length
const DISC_R = 17 // disc radius

/** Angle (degrees, clockwise from straight up) of petal i. */
function petalAngle(i: number) {
  return (360 / N_PETALS) * i
}

function petalCentre(i: number) {
  const a = ((petalAngle(i) - 90) * Math.PI) / 180 // -90 so petal 0 points up
  return { x: CX + PETAL_R * Math.cos(a), y: CY + PETAL_R * Math.sin(a) }
}

export interface Q19FlowerProps {
  /** Rotate the whole flower by this many petal-steps clockwise (0..5). */
  rotateSteps?: number
  /** Mirror the flower left-right (reverses the colour order) — used to show the trap. */
  mirror?: boolean
  /** Petal indices (post-rotation, reading order) to ring green. */
  activePetals?: number[]
}

/** Reusable six-petal-flower primitive shared by the illustration and explainer. */
export function Q19Flower({ rotateSteps = 0, mirror = false, activePetals = [] }: Q19FlowerProps) {
  const active = new Set(activePetals)
  const transform = mirror ? `translate(${Q19_VIEW} 0) scale(-1 1)` : undefined
  return (
    <svg
      viewBox={`0 0 ${Q19_VIEW} ${Q19_VIEW}`}
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <g transform={transform}>
        {/* petals (gold ellipses) */}
        {Array.from({ length: N_PETALS }, (_, i) => {
          const { x, y } = petalCentre(i)
          const rot = petalAngle(i)
          return (
            <ellipse
              key={`p${i}`}
              cx={x}
              cy={y}
              rx={PETAL_RX}
              ry={PETAL_RY}
              fill={BODY}
              stroke={BODY_EDGE}
              strokeWidth={2}
              transform={`rotate(${rot} ${x} ${y})`}
            />
          )
        })}
        {/* gold hub so the petals read as one connected flower */}
        <circle cx={CX} cy={CY} r={28} fill={BODY} stroke={BODY_EDGE} strokeWidth={2} />

        {/* discs on each petal — pattern shifted by rotateSteps */}
        {Array.from({ length: N_PETALS }, (_, i) => {
          const { x, y } = petalCentre(i)
          const isDark = PETAL_DARK[(((i - rotateSteps) % N_PETALS) + N_PETALS) % N_PETALS]
          const ring = active.has(i)
          return (
            <g key={`d${i}`}>
              {ring && <circle cx={x} cy={y} r={DISC_R + 6} fill="none" stroke={HALO} strokeWidth={3} />}
              <circle
                cx={x}
                cy={y}
                r={DISC_R}
                fill={isDark ? DARK : WHITE}
                stroke={isDark ? DARK : RIM}
                strokeWidth={isDark ? 1.5 : 3}
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default function P24G2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A gold six-petal flower. Around it the petal discs alternate: solid dark, hollow white, dark, white, dark, white. Find the option that is the same flower, allowing rotation but not mirroring."
    >
      <Q19Flower />
    </div>
  )
}
