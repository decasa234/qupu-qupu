// WMI-22F1A-Q8 (Grade 1) — "At most, how many 1×1×3 blocks can be cut from the
// model?" (answer C = 10).
//
// Reconstructed pixel-exactly from db/seed/wmi/figures/2022-final-g1-a-q8.jpg.
// The scan is an isometric structure of light-green unit cubes. Flood-filling
// the 34 top-face diamonds and least-squares fitting the iso lattice
// (cx ≈ 32.0, cy ≈ 18.0 px) recovered an exact integer lattice: EVERY detected
// top centre lands on a cube and EVERY cube shows a top — so the model is a
// single flat layer (z = 0) of 34 unit cubes. (Overlay of the fitted centres on
// the scan confirmed zero phantom / missing cubes; the dark-green faces are just
// the exposed front-left / front-right vertical faces at the slab's boundary —
// there is no second level.)
//
// Footprint (x = down-right screen axis, y = up-right screen axis), the seven
// diagonal rows alternate a 4-wide and a 6-wide band:
//   y=6  .####.
//   y=5  ######
//   y=4  .####.
//   y=3  ######
//   y=2  .####.
//   y=1  ######
//   y=0  .####.
//
// A throwaway max-set-packing solver (enumerate every straight 1×1×3 triomino —
// 40 of them — then backtracking search with a free-cube bound) proved the
// MAXIMUM number of non-overlapping straight blocks is 10, using 30 of the 34
// cubes (4 left over). That matches answer C. PACKING below is one verified
// optimal solution (each block is three collinear cubes along the x or y axis;
// z-blocks are impossible in a single layer).
//
// This file draws ONLY the problem (the plain green cubes). The co-exported
// CubeModel({ showBlocks }) primitive lets the animator colour the first N
// triominoes from PACKING post-answer; the default export never colours any.
//
// Pure render, SSR-safe & deterministic (no Math.random / Date, no state).

export type Cube = [number, number, number]

// The 34 unit cubes (verified against the scan). x = down-right, y = up-right,
// z = up. All z = 0 — the model is one flat layer.
export const CUBES: Cube[] = [
  [3, 2, 0], [2, 1, 0], [4, 2, 0], [3, 1, 0], [5, 2, 0], [4, 1, 0], [3, 0, 0], [2, -1, 0],
  [6, 2, 0], [5, 1, 0], [4, 0, 0], [3, -1, 0], [6, 1, 0], [5, 0, 0], [4, -1, 0], [3, -2, 0], [2, -3, 0],
  [7, 1, 0], [6, 0, 0], [5, -1, 0], [4, -2, 0], [3, -3, 0], [6, -1, 0], [5, -2, 0], [4, -3, 0], [3, -4, 0],
  [7, -1, 0], [6, -2, 0], [5, -3, 0], [4, -4, 0], [6, -3, 0], [5, -4, 0], [7, -3, 0], [6, -4, 0],
]

// One VERIFIED maximum packing: 10 straight 1×1×3 blocks (each three collinear
// cubes). Solver-confirmed optimal; 30 cubes used, 4 left over.
export const PACKING: Cube[][] = [
  [[3, 2, 0], [4, 2, 0], [5, 2, 0]],
  [[2, 1, 0], [3, 1, 0], [4, 1, 0]],
  [[3, 0, 0], [4, 0, 0], [5, 0, 0]],
  [[2, -1, 0], [3, -1, 0], [4, -1, 0]],
  [[5, 1, 0], [6, 1, 0], [7, 1, 0]],
  [[3, -2, 0], [4, -2, 0], [5, -2, 0]],
  [[2, -3, 0], [3, -3, 0], [4, -3, 0]],
  [[5, -1, 0], [6, -1, 0], [7, -1, 0]],
  [[3, -4, 0], [4, -4, 0], [5, -4, 0]],
  [[5, -3, 0], [6, -3, 0], [7, -3, 0]],
]

// Distinct fills for the (post-answer) coloured blocks. The structure itself is
// always qupu green; these only appear when the animator passes showBlocks > 0.
const BLOCK_FILLS: Array<{ top: string; left: string; right: string }> = [
  { top: '#FBCFE8', left: '#E879A8', right: '#F3A6C0' }, // pink
  { top: '#BFDBFE', left: '#5B8FD6', right: '#8FC6E8' }, // blue
  { top: '#FDE68A', left: '#E0A82E', right: '#F4D06A' }, // amber
  { top: '#C7F0D8', left: '#3FA86A', right: '#7FCBA0' }, // teal-green
  { top: '#DDD6FE', left: '#8B6FE0', right: '#B6A6F0' }, // violet
  { top: '#FED7AA', left: '#E08A3C', right: '#F4B98A' }, // orange
  { top: '#A7F3D0', left: '#2E9E78', right: '#6FC9A8' }, // emerald
  { top: '#FBCFE0', left: '#D66BA0', right: '#EE9FC0' }, // rose
  { top: '#BAE6FD', left: '#3C9AD6', right: '#7CC6EC' }, // sky
  { top: '#FEF08A', left: '#CAA42A', right: '#E6D060' }, // yellow
]

const INK = '#1F2937'
// The plain unit-cube green (matches the scan's light-green model).
const CUBE_TOP = '#D6F0DC'
const CUBE_LEFT = '#6FB98A'
const CUBE_RIGHT = '#A9D9BC'

const key = (x: number, y: number, z: number) => `${x},${y},${z}`

/**
 * CubeModel — the isometric unit-cube structure.
 *
 * `showBlocks` (default 0) colours the first N triominoes from PACKING in
 * distinct hues; cubes not yet in a coloured block stay plain green. The default
 * export passes 0, so the static problem figure shows only green cubes.
 */
export function CubeModel({ showBlocks = 0 }: { showBlocks?: number }) {
  // Map each cube to the index of the (shown) block it belongs to, or -1.
  const blockOf = new Map<string, number>()
  const shown = Math.max(0, Math.min(showBlocks, PACKING.length))
  for (let b = 0; b < shown; b++) {
    for (const [x, y, z] of PACKING[b]) blockOf.set(key(x, y, z), b)
  }

  // Isometric projection (front-right facing): x → right+down, y → right+up.
  const size = 30
  const cx = size * 0.86
  const cy = size * 0.5
  const proj = (x: number, y: number, z: number) => ({
    sx: (x + y) * cx,
    sy: (x - y) * cy - z * size,
  })

  // Compute the screen bounding box with headroom so nothing clips at edges.
  const corners = CUBES.flatMap(([x, y, z]) => {
    const { sx, sy } = proj(x, y, z)
    return [
      [sx, sy - cy],
      [sx + 2 * cx, sy + size],
      [sx, sy + size],
      [sx + 2 * cx, sy - cy],
    ]
  })
  const pad = 8
  const minX = Math.min(...corners.map((c) => c[0])) - pad
  const maxX = Math.max(...corners.map((c) => c[0])) + pad
  const minY = Math.min(...corners.map((c) => c[1])) - pad
  const maxY = Math.max(...corners.map((c) => c[1])) + pad
  const width = maxX - minX
  const height = maxY - minY

  // Painter's order: back rows first (high y), then bottom-up (z), then x.
  const order = [...CUBES].sort(
    (a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0],
  )

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      width={Math.min(300, width)}
    >
      {order.map(([x, y, z], i) => {
        const { sx, sy } = proj(x, y, z)
        const b = blockOf.get(key(x, y, z))
        const fills =
          b !== undefined ? BLOCK_FILLS[b % BLOCK_FILLS.length] : { top: CUBE_TOP, left: CUBE_LEFT, right: CUBE_RIGHT }
        const top = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
        const leftF = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
        const rightF = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
        return (
          <g key={i}>
            <polygon points={top} fill={fills.top} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
            <polygon points={leftF} fill={fills.left} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
            <polygon points={rightF} fill={fills.right} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

/**
 * WMI-22F1A-Q8 question figure — the plain isometric model of unit cubes. Draws
 * ONLY the setup (no block colouring, no answer). `params` is accepted to match
 * the illustration signature but unused (this is a fixed paper figure).
 */
export default function BlockPack22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Model bangun dari 34 kubus satuan hijau yang disusun mendatar satu lapis. Paling banyak ada berapa balok 1×1×3 yang dapat dipotong dari model ini?"
    >
      <CubeModel />
    </div>
  )
}
