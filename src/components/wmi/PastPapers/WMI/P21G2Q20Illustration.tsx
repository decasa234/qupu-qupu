/**
 * WMI-21P2A-Q20 — "Which option shows a DIFFERENT umbrella?"
 *
 * Reconstructed from db/seed/wmi/figures/2021-semifinal-g2-a-q20.jpg: the top
 * view of an umbrella drawn as a regular pentagon split into 5 triangular wedges
 * from the centre to each vertex. Reading the coloured wedges clockwise from the
 * top, the order is white, yellow, white, yellow, white — a fixed cycle.
 *
 * The four options are the same umbrella rotated; one option's wedge ORDER is
 * scrambled and cannot be reached by any rotation — that is the odd one out
 * (the seed answer, revealed only by the explainer).
 *
 * The static figure shows ONLY the original umbrella (never the options/answer).
 */

export const W = 'white'
export const Y = 'yellow'
export type WedgeColor = typeof W | typeof Y

const FILL: Record<WedgeColor, string> = { white: '#FFFFFF', yellow: '#F5B400' }
const EDGE = '#1F2937'

/** The original umbrella's wedge colours, clockwise from the top wedge. */
export const ORIGINAL: WedgeColor[] = [W, Y, W, Y, W]

const N = 5 // wedges / pentagon vertices

/**
 * One umbrella (regular pentagon, 5 wedges) centred in a `size` box.
 * `colors[i]` paints the wedge starting at vertex i (clockwise). `rotate`
 * cyclically shifts which wedge sits where (a real rotation of the figure).
 */
export function Umbrella({
  colors,
  rotate = 0,
  size = 140,
  lit = false,
}: {
  colors: WedgeColor[]
  rotate?: number
  size?: number
  lit?: boolean
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.42
  // vertex 0 points straight up; vertices go clockwise.
  const vertex = (i: number) => {
    const a = (-90 + (360 / N) * i) * (Math.PI / 180)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const wedges = Array.from({ length: N }, (_, i) => {
    const p0 = vertex(i)
    const p1 = vertex((i + 1) % N)
    const color = colors[((i - rotate) % N + N) % N]
    return { p0, p1, color, key: i }
  })

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: size, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {lit && <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#F97316" strokeWidth={3} />}
      {wedges.map((w) => (
        <polygon
          key={w.key}
          points={`${cx},${cy} ${w.p0.x},${w.p0.y} ${w.p1.x},${w.p1.y}`}
          fill={FILL[w.color]}
          stroke={EDGE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
      {/* pentagon outline on top for a crisp edge */}
      <polygon
        points={Array.from({ length: N }, (_, i) => {
          const p = vertex(i)
          return `${p.x},${p.y}`
        }).join(' ')}
        fill="none"
        stroke={EDGE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function P21G2Q20Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Top view of an umbrella: a pentagon split into five triangular wedges, coloured white, yellow, white, yellow, white going clockwise from the top."
    >
      <div style={{ maxWidth: 160, width: '100%' }}>
        <Umbrella colors={ORIGINAL} />
      </div>
    </div>
  )
}
