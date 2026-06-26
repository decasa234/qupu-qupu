// RayAnglesOSN18KQ11Illustration — OSN 2018 SD Kabupaten Q11
//
// "Look at the following figure. From a single vertex, 5 rays create consecutive
//  angles of 10°, 20°, 30°, and 50° from the baseline. The number of angles with
//  different sizes in the figure is ···"   Answer: 8.
//
// Source image: docs/reference/ocr-res/osn/kabupaten/sd/2018.imgs/001.jpg
//   — single vertex (bottom-left), horizontal baseline going right,
//     four labeled gaps between the five rays.
//
// No primitive covers a ray-fan diagram → fresh SVG.
// SSR-safe: no hooks, no framer-motion.

export const VX = 70   // vertex x in viewBox
export const VY = 185  // vertex y in viewBox
export const RAY = 175 // ray length (px)
export const VW = 290  // viewBox width
export const VH = 205  // viewBox height

/** Cumulative angles from the baseline (math convention: CCW = visually upward). */
export const RAYS_DEG = [0, 10, 30, 60, 110] as const

/** Compute SVG endpoint for a ray at math-degrees `deg` from vertex. */
export function rayEnd(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180
  return [VX + RAY * Math.cos(r), VY - RAY * Math.sin(r)]
}

/**
 * SVG arc-path string from cumulative angle `cumDegA` to `cumDegB` at radius `r`
 * centred on the vertex.  Sweep-flag = 0 (CCW in screen = going upward).
 */
export function arcPath(cumDegA: number, cumDegB: number, r: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const sx = VX + r * Math.cos(toRad(cumDegA))
  const sy = VY - r * Math.sin(toRad(cumDegA))
  const ex = VX + r * Math.cos(toRad(cumDegB))
  const ey = VY - r * Math.sin(toRad(cumDegB))
  const large = cumDegB - cumDegA > 180 ? 1 : 0
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 ${large} 0 ${ex.toFixed(1)} ${ey.toFixed(1)}`
}

// Gap labels: text, bounding angles, label-radius from vertex.
const GAP_LABELS: ReadonlyArray<{ text: string; degA: number; degB: number; r: number }> = [
  { text: '10°', degA: 0,  degB: 10,  r: 145 },
  { text: '20°', degA: 10, degB: 30,  r: 120 },
  { text: '30°', degA: 30, degB: 60,  r: 97  },
  { text: '50°', degA: 60, degB: 110, r: 75  },
]

export interface RayFanProps {
  /**
   * Optional arc to draw over the fan, expressed as [cumDegA, cumDegB].
   * Used by the Explainer to spotlight a particular angle span.
   */
  highlightArc?: [number, number] | null
}

/**
 * Core ray-fan SVG — used standalone (Illustration) and inside the Explainer.
 * Named export so the Explainer can import it without triggering a circular default.
 */
export function RayFanCore({ highlightArc = null }: RayFanProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW }}
      aria-hidden="true"
    >
      {/* Five rays */}
      {RAYS_DEG.map((deg) => {
        const [ex, ey] = rayEnd(deg)
        return (
          <line
            key={deg}
            x1={VX}
            y1={VY}
            x2={ex.toFixed(1)}
            y2={ey.toFixed(1)}
            stroke="#1e293b"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        )
      })}

      {/* Highlighted arc overlay (Explainer phase) */}
      {highlightArc != null && (
        <path
          d={arcPath(highlightArc[0], highlightArc[1], 58)}
          fill="none"
          stroke="#f0853a"
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}

      {/* Gap-angle labels */}
      {GAP_LABELS.map(({ text, degA, degB, r }) => {
        const mid = ((degA + degB) / 2) * (Math.PI / 180)
        const lx = VX + r * Math.cos(mid)
        const ly = VY - r * Math.sin(mid)
        return (
          <text
            key={text}
            x={lx.toFixed(1)}
            y={ly.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="system-ui, sans-serif"
            fill="#334155"
          >
            {text}
          </text>
        )
      })}

      {/* Vertex dot */}
      <circle cx={VX} cy={VY} r={3} fill="#1e293b" />
    </svg>
  )
}

export default function RayAnglesOSN18KQ11Illustration() {
  return <RayFanCore />
}
