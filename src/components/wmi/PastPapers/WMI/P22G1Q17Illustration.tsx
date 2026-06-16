/**
 * WMI-22P1A-Q17 (2022 Grade 1 Semifinal) — "Which option shows the number of
 * cubes in each layer of the solid?"
 *
 * Reconstructed from db/seed/wmi/figures/2022-semifinal-g1-a-q17.jpg: an
 * L-shaped solid of light-pink unit cubes drawn in isometric.
 *   - a column 3 cubes tall on the left, and
 *   - a flat arm of cubes running to the right along the BOTTOM only.
 * Counting the cube footprint per horizontal layer (bottom → top):
 *   layer 1 (bottom): the whole L footprint = 4 cubes
 *   layer 2 (middle): just the column        = 1 cube
 *   layer 3 (top):    just the column         = 1 cube
 *   => layers are [4, 1, 1]  (6 cubes total), which is option B (the seed answer).
 *
 * The static figure shows ONLY the plain solid (never the per-layer count). The
 * co-exported CubeLayerModel({ litLayer }) primitive lets the explainer tint and
 * count one horizontal layer at a time; the default export tints nothing.
 *
 * Pure render, SSR-safe & deterministic (no Math.random / Date, no state).
 */

export type Cube = [number, number, number] // [x (right-down), y (right-up=depth), z (up)]

// The 6 unit cubes. y = 0 for all (the solid is one cube deep). z is the layer.
//   column (x = 0): z = 0, 1, 2
//   bottom arm (z = 0): x = 0, 1, 2, 3
export const CUBES: Cube[] = [
  // bottom layer (z = 0) — the L footprint, 4 cubes
  [0, 0, 0],
  [1, 0, 0],
  [2, 0, 0],
  [3, 0, 0],
  // column, middle + top (z = 1, 2)
  [0, 0, 1],
  [0, 0, 2],
]

// Cubes per horizontal layer, bottom → top (derived from CUBES, never hardcoded).
export const LAYER_COUNTS: number[] = (() => {
  const maxZ = Math.max(...CUBES.map((c) => c[2]))
  const counts: number[] = []
  for (let z = 0; z <= maxZ; z++) counts.push(CUBES.filter((c) => c[2] === z).length)
  return counts // [4, 1, 1]
})()

export const TOTAL_CUBES = CUBES.length // 6

// ─── palette (hex echoes of the pink scan) ──────────────────────────────────
const INK = '#5B2A3A'
const CUBE_TOP = '#F7D4E4'
const CUBE_LEFT = '#F0B8D0'
const CUBE_RIGHT = '#E59CBE'
// the layer currently being counted (post-answer highlight)
const LIT_TOP = '#FDE68A'
const LIT_LEFT = '#E0A82E'
const LIT_RIGHT = '#F4D06A'

const size = 34
const cx = size * 0.86
const cy = size * 0.5
const proj = (x: number, y: number, z: number) => ({
  sx: (x + y) * cx,
  sy: (x - y) * cy - z * size,
})

/**
 * CubeLayerModel — the isometric L-solid. `litLayer` (default -1) tints all cubes
 * on that z-layer in amber so the explainer can count one layer at a time.
 */
export function CubeLayerModel({ litLayer = -1, maxWidth = 280 }: { litLayer?: number; maxWidth?: number }) {
  // bounding box with headroom so nothing clips
  const corners = CUBES.flatMap(([x, y, z]) => {
    const { sx, sy } = proj(x, y, z)
    return [
      [sx, sy - cy],
      [sx + 2 * cx, sy + size],
      [sx, sy + size],
      [sx + 2 * cx, sy - cy],
    ]
  })
  const pad = 10
  const minX = Math.min(...corners.map((c) => c[0])) - pad
  const maxX = Math.max(...corners.map((c) => c[0])) + pad
  const minY = Math.min(...corners.map((c) => c[1])) - pad
  const maxY = Math.max(...corners.map((c) => c[1])) + pad
  const width = maxX - minX
  const height = maxY - minY

  // Painter's order: back (high y) first, then bottom-up (z), then x.
  const order = [...CUBES].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth }}
      aria-hidden="true"
    >
      {order.map(([x, y, z], i) => {
        const { sx, sy } = proj(x, y, z)
        const lit = z === litLayer
        const top = lit ? LIT_TOP : CUBE_TOP
        const left = lit ? LIT_LEFT : CUBE_LEFT
        const right = lit ? LIT_RIGHT : CUBE_RIGHT
        const topF = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
        const leftF = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
        const rightF = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
        return (
          <g key={i}>
            <polygon points={topF} fill={top} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
            <polygon points={leftF} fill={left} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
            <polygon points={rightF} fill={right} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

export default function P22G1Q17Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah bangun ruang berbentuk L dari kubus satuan: satu kolom setinggi tiga kubus dan lengan mendatar di bagian bawah. Berapa banyak kubus pada setiap lapisan?"
    >
      <CubeLayerModel />
    </div>
  )
}
