// WMI-21P2A-Q10 (2021 Grade 2 Semifinal) — "Count. How many blocks are there in
// the picture?" (answer C = 29).
//
// Reconstructed from db/seed/wmi/figures/2021-semifinal-g2-a-q10.jpg: an
// isometric stack of unit cubes. Reading the front face (4 columns wide) plus the
// top-face/right-side depth, the structure is a solid 4-wide × 2-deep × 3-tall
// base wall (24 cubes) with a short tower on the LEFT column (+2 cubes, rising two
// levels above the wall) and a taller tower on the RIGHT column (+3 cubes). The
// middle two columns stay at the base height (the "valley" dip seen in the scan).
//   base   = 4 × 2 × 3 = 24
//   left   tower         +2
//   right  tower         +3
//   total                = 29   (answer C)
//
// This file draws ONLY the problem (plain unit cubes, no answer / no count). The
// co-exported CubeStack({ litCubes }) primitive lets the explainer light cubes up
// region by region while counting; the default export lights none.
//
// Pure render, SSR-safe & deterministic (no Math.random / Date, no state, no
// window/document at module top).

export type Cube = [number, number, number]

// Footprint axes (matching BlockPack22G1's iso projection):
//   x = down-right screen axis  (columns A..D, left→right = x 0..3)
//   y = up-right screen axis    (depth: front = 0, back = 1)
//   z = up                      (height level, 0 = bottom)
//
// We build the cubes deterministically from a per-column spec so the count is
// transparent: every column is 2 deep; height is the base (3) plus any tower.
type ColumnSpec = { col: number; height: number }
const COLUMNS: ColumnSpec[] = [
  { col: 0, height: 5 }, // left  : 3 base + 2 tower
  { col: 1, height: 3 }, // valley
  { col: 2, height: 3 }, // valley
  { col: 3, height: 6 }, // right : 3 base + 3 tower
]
const DEPTH = 2 // cubes deep (front + back)
const BASE_HEIGHT = 3 // the solid wall every column shares

function buildCubes(): Cube[] {
  const cubes: Cube[] = []
  for (const { col, height } of COLUMNS) {
    for (let d = 0; d < DEPTH; d++) {
      for (let z = 0; z < height; z++) {
        cubes.push([col, d, z])
      }
    }
  }
  return cubes
}

export const CUBES: Cube[] = buildCubes()
export const CUBE_TOTAL = CUBES.length // 29

// Counting regions (each lights up on its own beat in the explainer), in order:
//   0 = base solid block (4 × 2 × 3 = 24 cubes, all z < BASE_HEIGHT)
//   1 = left tower  (col 0, z >= BASE_HEIGHT)   = 2 cubes
//   2 = right tower (col 3, z >= BASE_HEIGHT)   = 3 cubes
export function regionOf([col, , z]: Cube): number {
  if (z < BASE_HEIGHT) return 0
  return col === 0 ? 1 : 2
}

export const REGION_COUNTS: number[] = (() => {
  const counts = [0, 0, 0]
  for (const c of CUBES) counts[regionOf(c)] += 1
  return counts
})() // [24, 2, 3]

const INK = '#1F2937'
// Plain unit-cube grey (matches the uncoloured scan).
const CUBE_TOP = '#F1F5F9'
const CUBE_LEFT = '#CBD5E1'
const CUBE_RIGHT = '#E2E8F0'

// Region highlight fills (used only when the explainer lights a region).
const REGION_FILLS: Array<{ top: string; left: string; right: string }> = [
  { top: '#BFDBFE', left: '#5B8FD6', right: '#8FC6E8' }, // base  : blue
  { top: '#FDE68A', left: '#E0A82E', right: '#F4D06A' }, // left  : amber
  { top: '#C7F0D8', left: '#3FA86A', right: '#7FCBA0' }, // right : green
]

const keyOf = (x: number, y: number, z: number) => `${x},${y},${z}`

export interface CubeStackProps {
  /** How many counting regions are lit (0..3, in the order base → left → right). */
  litRegions?: number
}

/**
 * CubeStack — the isometric unit-cube structure of WMI-21P2A-Q10.
 *
 * `litRegions` (default 0) colours the first N counting regions; cubes not yet in
 * a lit region stay plain grey. The default export passes 0, so the static
 * problem figure shows only grey cubes (never the answer).
 */
export function CubeStack({ litRegions = 0 }: CubeStackProps) {
  const lit = Math.max(0, Math.min(3, litRegions))

  // Isometric projection (front-right facing): x → right+down, y → right+up.
  const size = 30
  const cx = size * 0.86
  const cy = size * 0.5
  const proj = (x: number, y: number, z: number) => ({
    sx: (x + y) * cx,
    sy: (x - y) * cy - z * size,
  })

  // Screen bounding box with headroom so nothing clips at the edges.
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

  // Painter's order: back rows first (high y), then bottom-up (z), then x.
  const order = [...CUBES].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {order.map(([x, y, z], i) => {
        const region = regionOf([x, y, z])
        const isLit = region < lit
        const fills = isLit ? REGION_FILLS[region] : { top: CUBE_TOP, left: CUBE_LEFT, right: CUBE_RIGHT }
        const { sx, sy } = proj(x, y, z)
        const top = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
        const leftF = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
        const rightF = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
        return (
          <g key={`${keyOf(x, y, z)}-${i}`}>
            <polygon points={top} fill={fills.top} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
            <polygon points={leftF} fill={fills.left} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
            <polygon points={rightF} fill={fills.right} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

export default function P21G2Q10Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="An isometric stack of unit cubes: a solid four-wide, two-deep, three-tall block with a short tower on the left column and a taller tower on the right column. How many blocks are there in total?"
    >
      <CubeStack />
    </div>
  )
}
