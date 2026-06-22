// IKMC-22-PE-Q3 — "The picture shows 5 identical bricks. How many bricks are
// touching exactly 3 other bricks?"  Answer: B (2 bricks).
//
// The 5 bricks form a staircase arrangement when viewed from the front-left
// in isometric projection:
//
//         [B5]
//      [B4]
//  [B1][B2][B3]
//
// In 3D unit-cube coordinates:
//   B1 = (0, 0, 0)   B2 = (1, 0, 0)   B3 = (2, 0, 0)
//   B4 = (2, 0, 1)   B5 = (2, 0, 2)
//
// "Touching" includes edge-to-edge contact (real-world physics):
//   B1: touches B2 (face)                         → 1 neighbour
//   B2: touches B1 (face), B3 (face), B4 (edge)   → 3 neighbours ✓
//   B3: touches B2 (face), B4 (face)              → 2 neighbours
//   B4: touches B3 (face), B5 (face), B2 (edge)   → 3 neighbours ✓
//   B5: touches B4 (face)                         → 1 neighbour
//
// So exactly 2 bricks (B2 and B4) touch 3 others — answer B.
//
// Reuses the CubeGroup isometric primitive (co-exported) from
// Bricks2ECIllustration, adapted for a single-column staircase voxel set.
// Pure SVG, no random, no Date, SSR-safe.

// ---------------------------------------------------------------------------
// Isometric cube primitive (adapted from Bricks2ECIllustration)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const TOP_FILL = '#E8A87C'   // warm orange terracotta (brick top)
const LEFT_FILL = '#C47B4E'  // mid-shade brick left face
const RIGHT_FILL = '#A05A30' // darker brick right face

const SIZE = 24
const CX = SIZE * 0.866
const CY = SIZE * 0.5

type Voxel3 = [number, number, number]

function iso([x, y, z]: Voxel3): { sx: number; sy: number } {
  return { sx: (x - y) * CX, sy: -(x + y) * CY + z * SIZE }
}

function paintOrder(voxels: Voxel3[]): Voxel3[] {
  // Draw back-to-front: larger y first, then lower z first, then larger x last
  return [...voxels].sort(
    (a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0],
  )
}

/** Single isometric cube at voxel position v, with specified face colours. */
function IsoCube({
  v,
  topColor = TOP_FILL,
  leftColor = LEFT_FILL,
  rightColor = RIGHT_FILL,
  label,
}: {
  v: Voxel3
  topColor?: string
  leftColor?: string
  rightColor?: string
  label?: string
}) {
  const { sx, sy } = iso(v)
  const topPts = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy - CY}`
  const leftPts = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
  const rightPts = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
  const cx = sx + CX
  const cy = sy + CY + SIZE / 2

  return (
    <g>
      <polygon points={topPts} fill={topColor} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <polygon points={leftPts} fill={leftColor} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <polygon points={rightPts} fill={rightColor} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      {label && (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={9}
          fontWeight="700"
          fill="#fff"
          style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Voxel set — 5-brick staircase
// ---------------------------------------------------------------------------
// x = right, y = depth (0 = front), z = up
const STAIRCASE_VOXELS: Voxel3[] = [
  [0, 0, 0], // B1 — bottom left
  [1, 0, 0], // B2 — bottom middle (touches 3)
  [2, 0, 0], // B3 — bottom right
  [2, 0, 1], // B4 — middle step (touches 3)
  [2, 0, 2], // B5 — top step
]

/** Co-exported for reuse in Bricks3PEExplainer. */
export function BrickStaircase({
  width = 200,
  highlights,
}: {
  width?: number
  /** Optional: which brick indices (0-based) to highlight in green. */
  highlights?: number[]
}) {
  // Compute bounding box
  const pts = STAIRCASE_VOXELS.flatMap((v) => {
    const { sx, sy } = iso(v)
    return [
      { x: sx, y: sy - CY },          // top peak
      { x: sx + 2 * CX, y: sy },      // top right
      { x: sx + 2 * CX, y: sy + SIZE }, // right bottom
      { x: sx, y: sy + SIZE },         // left bottom
    ]
  })
  const pad = 8
  const minX = Math.min(...pts.map((p) => p.x)) - pad
  const minY = Math.min(...pts.map((p) => p.y)) - pad
  const maxX = Math.max(...pts.map((p) => p.x)) + pad
  const maxY = Math.max(...pts.map((p) => p.y)) + pad
  const vbW = maxX - minX
  const vbH = maxY - minY
  const aspect = vbH / vbW
  const svgH = Math.round(width * aspect)

  const HL_TOP = '#C9F7D1'
  const HL_LEFT = '#7AE897'
  const HL_RIGHT = '#3DC96B'

  const ordered = paintOrder(STAIRCASE_VOXELS)
  return (
    <svg
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      width={width}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {ordered.map((v, i) => {
        const origIdx = STAIRCASE_VOXELS.indexOf(v)
        const isHl = highlights?.includes(origIdx) ?? false
        return (
          <IsoCube
            key={i}
            v={v}
            topColor={isHl ? HL_TOP : TOP_FILL}
            leftColor={isHl ? HL_LEFT : LEFT_FILL}
            rightColor={isHl ? HL_RIGHT : RIGHT_FILL}
          />
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — shows the problem, NOT the answer
// ---------------------------------------------------------------------------

/**
 * Bricks3PEIllustration — the 5-brick staircase figure for IKMC-22-PE-Q3.
 * Stem only: no highlighting, no answer revealed.
 */
export default function Bricks3PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Five identical orange bricks arranged in a staircase: three bricks in a row at the bottom, with two more bricks stacked on the right end going upward."
    >
      <BrickStaircase width={200} />
    </div>
  )
}
