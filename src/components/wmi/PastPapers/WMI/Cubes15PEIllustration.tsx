// IKMC-23-PE-Q15 — "A student made the shape shown using 12 cubes. He put one
// drop of glue between any two cubes that share a common face. How many drops
// of glue did he use?"  Answer: D (11).
//
// The figure (OCR 038.jpg) shows a 3D arrangement of 12 unit cubes drawn in
// standard isometric projection (x = right, y = depth/back, z = height). The
// shape is reconstructed as:
//
//   z=0 (bottom layer, 9 cubes) — a U-snake:
//     front row (y=0): (0,0,0)(1,0,0)(2,0,0)(3,0,0)   4 cubes →
//     right col  (x=3): (3,1,0)(3,2,0)                 2 cubes ↑
//     back  row (y=2): (2,2,0)(1,2,0)(0,2,0)           3 cubes ←
//
//   z=1 (top layer, 3 cubes) — isolated pillars on three corners:
//     (3,0,1)  right-front corner
//     (3,2,1)  right-back  corner
//     (0,2,1)  left-back   corner
//
//   Total: 9 + 3 = 12 cubes  ✓
//
// Shared-face count (= glue drops):
//   z=0 chain:  (0,0)-(1,0), (1,0)-(2,0), (2,0)-(3,0), (3,0)-(3,1),
//               (3,1)-(3,2), (3,2)-(2,2), (2,2)-(1,2), (1,2)-(0,2)  = 8
//   z=0 → z=1: (3,0,0)-(3,0,1), (3,2,0)-(3,2,1), (0,2,0)-(0,2,1)   = 3
//   z=1 cross: none (pillar cubes are not adjacent to each other)     = 0
//   ───────────────────────────────────────────────────────────────────────
//   Total = 11  ✓  → answer D
//
// Quantities exported (anti-drift; Explainer / Steps must not hard-code):
//   TOTAL_CUBES15 = 12
//   SHARED_FACES15 = 11   (= glue drops)
//
// Reuses the isometric voxel primitive from CubeStack19P1Illustration /
// Cubes6PEIllustration (same projection transform, same face-shading rules).
// Pure SVG, no randomness, no dates, SSR-safe.

// ---------------------------------------------------------------------------
// Exported quantities (bind explainer & steps to prevent drift)
// ---------------------------------------------------------------------------

export const TOTAL_CUBES15 = 12
export const SHARED_FACES15 = 11

// ---------------------------------------------------------------------------
// Isometric primitive (matches CubeStack19P1 / Cubes6PE)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const SIZE = 24        // cube edge px
const CX = SIZE * 0.86  // horizontal iso run
const CY = SIZE * 0.5   // vertical iso run

// Colour palettes — warm gold (matching the original competition figure)
const TOP   = '#F5C842'  // top face: bright gold
const LEFT  = '#C8941A'  // left slope: mid gold
const RIGHT = '#A07010'  // right slope: dark gold

// Highlight palette — used by the explainer to mark counted glue joints
export const HL_TOP   = '#34D399'  // green highlight top
export const HL_LEFT  = '#059669'  // green highlight left
export const HL_RIGHT = '#047857'  // green highlight right

type Voxel = [number, number, number]

function project([x, y, z]: Voxel): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

function paintOrder(voxels: Voxel[]): Voxel[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

// ---------------------------------------------------------------------------
// Voxel set  (12 cubes, 11 shared faces — see header comment)
// ---------------------------------------------------------------------------

export const VOXELS15: Voxel[] = [
  // z=0 U-snake (9 cubes)
  [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0],  // front row
  [3, 1, 0], [3, 2, 0],                          // right column
  [2, 2, 0], [1, 2, 0], [0, 2, 0],              // back row
  // z=1 pillar tops (3 cubes)
  [3, 0, 1],  // right-front pillar
  [3, 2, 1],  // right-back  pillar
  [0, 2, 1],  // left-back   pillar
]

// ---------------------------------------------------------------------------
// Glue-joint positions for the explainer
// (each entry: two adjacent voxels sharing a face)
// ---------------------------------------------------------------------------

export const GLUE_JOINTS15: [Voxel, Voxel][] = [
  // z=0 snake chain (8 joints)
  [[0,0,0],[1,0,0]], [[1,0,0],[2,0,0]], [[2,0,0],[3,0,0]],
  [[3,0,0],[3,1,0]], [[3,1,0],[3,2,0]],
  [[3,2,0],[2,2,0]], [[2,2,0],[1,2,0]], [[1,2,0],[0,2,0]],
  // vertical joints z=0 → z=1 (3 joints)
  [[3,0,0],[3,0,1]],
  [[3,2,0],[3,2,1]],
  [[0,2,0],[0,2,1]],
]
// GLUE_JOINTS15.length === SHARED_FACES15 === 11  ✓

// ---------------------------------------------------------------------------
// Single isometric cube component
// ---------------------------------------------------------------------------

interface CubeProps {
  v: Voxel
  topFill?: string
  leftFill?: string
  rightFill?: string
  opacity?: number
}

function IsoCube({ v, topFill = TOP, leftFill = LEFT, rightFill = RIGHT, opacity = 1 }: CubeProps) {
  const { sx, sy } = project(v)
  const topPts   = `${sx},${sy} ${sx+CX},${sy-CY} ${sx+2*CX},${sy} ${sx+CX},${sy+CY}`
  const leftPts  = `${sx},${sy} ${sx+CX},${sy+CY} ${sx+CX},${sy+CY+SIZE} ${sx},${sy+SIZE}`
  const rightPts = `${sx+CX},${sy+CY} ${sx+2*CX},${sy} ${sx+2*CX},${sy+SIZE} ${sx+CX},${sy+CY+SIZE}`
  return (
    <g opacity={opacity}>
      <polygon points={topPts}   fill={topFill}   stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <polygon points={leftPts}  fill={leftFill}  stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <polygon points={rightPts} fill={rightFill} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// ViewBox helper
// ---------------------------------------------------------------------------

function voxelBounds(voxels: Voxel[], pad = 10): {
  vbX: number; vbY: number; vbW: number; vbH: number
} {
  const xs: number[] = [], ys: number[] = []
  for (const v of voxels) {
    const { sx, sy } = project(v)
    xs.push(sx - CX, sx + 2 * CX + CX)
    ys.push(sy - CY - SIZE, sy + CY + SIZE + SIZE)
  }
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  return { vbX: minX, vbY: minY, vbW: maxX - minX, vbH: maxY - minY }
}

// ---------------------------------------------------------------------------
// Main shape block — used by both illustration and explainer
// ---------------------------------------------------------------------------

export interface CubesBlock15Props {
  /** Indices (into GLUE_JOINTS15) to highlight in green. */
  highlightJoints?: number[]
  /** Dim all non-highlighted cubes when highlighting. */
  dimOthers?: boolean
  /** Optional override to dim all cubes (explainer "intro" beat). */
  allDim?: boolean
}

export function CubesBlock15({
  highlightJoints = [],
  dimOthers = false,
}: CubesBlock15Props) {
  const { vbX, vbY, vbW, vbH } = voxelBounds(VOXELS15, 12)

  // Build a set of highlighted voxel keys for cube colouring
  const hlVoxelKeys = new Set<string>()
  for (const idx of highlightJoints) {
    const pair = GLUE_JOINTS15[idx]
    if (!pair) continue
    for (const v of pair) hlVoxelKeys.add(v.join(','))
  }

  const ordered = paintOrder(VOXELS15)

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ordered.map((v, i) => {
        const key = v.join(',')
        const hl = hlVoxelKeys.has(key)
        const dim = dimOthers && !hl
        return (
          <IsoCube
            key={i}
            v={v}
            topFill={hl ? HL_TOP : TOP}
            leftFill={hl ? HL_LEFT : LEFT}
            rightFill={hl ? HL_RIGHT : RIGHT}
            opacity={dim ? 0.28 : 1}
          />
        )
      })}

      {/* Draw small red dots at glue-joint midpoints when highlighted */}
      {highlightJoints.map((idx) => {
        const pair = GLUE_JOINTS15[idx]
        if (!pair) return null
        const p0 = project(pair[0])
        const p1 = project(pair[1])
        // midpoint of the two cube origins (approximately the joint)
        const mx = (p0.sx + CX + p1.sx + CX) / 2
        const my = (p0.sy + p1.sy) / 2 + CY
        return (
          <circle key={idx} cx={mx} cy={my} r={3.5} fill="#EF4444" stroke="#fff" strokeWidth={1} />
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration
// ---------------------------------------------------------------------------

export default function Cubes15PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 3D shape made of 12 yellow cubes drawn in isometric view. ' +
        'The cubes form a U-shaped path at the bottom layer, with three single cubes ' +
        'stacked on top at the right-front, right-back, and left-back corners. ' +
        'The question asks how many drops of glue connect touching faces.'
      }
    >
      <CubesBlock15 />
    </div>
  )
}
