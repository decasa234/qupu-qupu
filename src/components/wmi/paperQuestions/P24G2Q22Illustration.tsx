// Cube-growth sequence stem for WMI-24P2A-Q22 (2024 Grade-2 Semifinal, Paper A).
//
// Reconstructed from db/seed/wmi/figures/2024-semifinal-g2-a-q22.jpg: a five-frame
// "observe the change, pick the missing step" sequence, drawn in isometric. A
// cube structure GROWS frame by frame toward a full block on the right. The fourth
// frame is hidden behind a "?" box; the paper's options (images "(A)"..."(E)") are
// the candidate fourth frames, and the seed answer is the in-between shape, E.
//
// We render the structure as small voxel sets on a 3D grid (x = right, y = depth
// back, z = up). The shapes grow monotonically: each frame is the previous frame
// plus one or more cubes, ending at the full 2x2x2 block (8 cubes). The static
// figure shows ONLY the problem: frames 1, 2, 3, a "?" placeholder, then 5.

const INK = '#1F2937'
// Isometric face palette (echoes the scan: pale lilac body, lighter top).
const TOP = '#D8D2F0'
const LEFTF = '#C3BBE6'
const RIGHTF = '#ADA3D9'

export type Voxel = [number, number, number] // [x, y, z]

// Growth: an L-tripod -> add a cube -> add another -> (missing) -> full 2x2x2.
// Each frame is a superset of the one before, so it reads as a steady build-up.
export const FRAME1: Voxel[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]
export const FRAME2: Voxel[] = [...FRAME1, [1, 1, 0]]
export const FRAME3: Voxel[] = [...FRAME2, [1, 0, 1]]
// The MISSING frame (answer E): one more cube than frame 3, one fewer than the full block.
export const FRAME4: Voxel[] = [...FRAME3, [0, 1, 1]]
// The full 2x2x2 block (8 cubes).
export const FRAME5: Voxel[] = [...FRAME4, [1, 1, 1]]

export const VISIBLE_FRAMES = [FRAME1, FRAME2, FRAME3, null, FRAME5] as const

/* --------------------------------------------------------- iso geometry ----- */
const S = 22 // cube edge in screen units
const AX = Math.round(S * 0.86) // screen dx per +x (right & slightly down)
const AY = Math.round(S * 0.5) // screen dy per +x
const BX = Math.round(S * 0.86) // screen dx per +y (left & slightly down) — mirrored
const BY = Math.round(S * 0.5)

// Project voxel corner (vx, vy, vz) to screen. +x → right/down, +y → left/down,
// +z → straight up.
function project(vx: number, vy: number, vz: number): [number, number] {
  const x = vx * AX - vy * BX
  const y = vx * AY + vy * BY - vz * S
  return [x, y]
}

function cubeFaces(x: number, y: number, z: number) {
  // 8 corners of the unit cube at (x,y,z).
  const p = (dx: number, dy: number, dz: number) => project(x + dx, y + dy, z + dz)
  const top = [p(0, 0, 1), p(1, 0, 1), p(1, 1, 1), p(0, 1, 1)]
  const left = [p(1, 0, 0), p(1, 1, 0), p(1, 1, 1), p(1, 0, 1)] // +x face (front-right)
  const right = [p(0, 1, 0), p(1, 1, 0), p(1, 1, 1), p(0, 1, 1)] // +y face (front-left)
  return { top, left, right }
}

const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

function FrameSvg({
  voxels,
  size = 96,
  highlight = false,
}: {
  voxels: Voxel[]
  size?: number
  highlight?: boolean
}) {
  // Painter's order: draw far cubes first. Far = smaller x+y, lower z first so
  // nearer cubes overdraw them. Sort by (x + y) ascending, then z ascending.
  const sorted = [...voxels].sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2])

  // Compute bounds for centring.
  const xs: number[] = []
  const ys: number[] = []
  for (const [x, y, z] of voxels) {
    for (const dx of [0, 1])
      for (const dy of [0, 1])
        for (const dz of [0, 1]) {
          const [px, py] = project(x + dx, y + dy, z + dz)
          xs.push(px)
          ys.push(py)
        }
  }
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const pad = 6
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  return (
    <svg
      viewBox={`${minX - pad} ${minY - pad} ${vbW} ${vbH}`}
      width={size}
      height={size}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {sorted.map(([x, y, z], i) => {
        const { top, left, right } = cubeFaces(x, y, z)
        return (
          <g key={i}>
            <polygon points={poly(top)} fill={highlight ? '#BBE9CF' : TOP} stroke={INK} strokeWidth={1.2} />
            <polygon points={poly(left)} fill={highlight ? '#86D6AC' : LEFTF} stroke={INK} strokeWidth={1.2} />
            <polygon points={poly(right)} fill={highlight ? '#6FCB9A' : RIGHTF} stroke={INK} strokeWidth={1.2} />
          </g>
        )
      })}
    </svg>
  )
}

/** A single isometric frame — co-exported so the explainer reuses the same cubes. */
export function CubeFrame(props: { voxels: Voxel[]; size?: number; highlight?: boolean }) {
  return <FrameSvg {...props} />
}

const ARROW = '#22A06B'

function Arrow() {
  return (
    <svg width={26} height={40} viewBox="0 0 26 40" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <path d="M2 14 H14 V8 L24 20 L14 32 V26 H2 Z" fill={ARROW} stroke={ARROW} strokeWidth={1} strokeLinejoin="round" />
    </svg>
  )
}

function MissingBox({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <rect x={6} y={6} width={84} height={84} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={2.4} />
      <text x={48} y={50} textAnchor="middle" dominantBaseline="central" fontSize={44} fontWeight={900} fill={INK}>
        ?
      </text>
    </svg>
  )
}

export default function P24G2Q22Illustration() {
  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A growing cube structure shown across five frames. Each frame adds cubes, building toward a full block. The fourth frame is missing (shown as a question mark) — choose the step that fits the steady growth."
    >
      <div className="flex min-w-max items-center justify-center gap-1">
        <CubeFrame voxels={FRAME1} />
        <Arrow />
        <CubeFrame voxels={FRAME2} />
        <Arrow />
        <CubeFrame voxels={FRAME3} />
        <Arrow />
        <MissingBox />
        <Arrow />
        <CubeFrame voxels={FRAME5} />
      </div>
    </div>
  )
}
