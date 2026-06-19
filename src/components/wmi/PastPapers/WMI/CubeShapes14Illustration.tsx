// IKMC-19-PE-Q14 — "Each of the shapes is made by gluing four cubes together..."
//
// Shows FIVE isometric 4-cube arrangements as the problem figure.
// Co-exports CubeShapes14Option (choice renderer for A–E).
//
// The five shapes, each using 4 unit cubes:
//   A — 4 in a row (1×4 line)
//   B — 2×2 block (answer: smallest painted area = 16 faces)
//   C — L-shape (3 in a row + 1 cube off one end's side, y direction)
//   D — T-shape (3 in a row + 1 cube off the middle's side, y direction)
//   E — Staircase (each successive cube is one step up)
//
// Paint count summary (4 cubes = 24 total faces):
//   A: 3 joins → 18 painted
//   B: 4 joins → 16 painted  ← smallest
//   C: 3 joins → 18 painted
//   D: 3 joins → 18 painted
//   E: 3 joins → 18 painted
//
// Pure SVG, no random, no dates, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Isometric cube primitive
// ---------------------------------------------------------------------------

const INK = '#1F2937'

// Face colours: top (lightest) / left (medium) / right (darkest)
const TOP_FILL = '#D6EBF7'
const LEFT_FILL = '#8FC6E8'
const RIGHT_FILL = '#5BA8D4'

// Isometric projection constants for a unit cube
const SIZE = 22          // cube edge in px
const CX = SIZE * 0.866  // horizontal run per iso unit
const CY = SIZE * 0.5    // vertical run per iso unit


// ---------------------------------------------------------------------------
// Voxel sets for each shape
// Painter's order: sort by (-y, x, z) so far cubes render first
// Using the same projection as CubeStack19P1: project([x, y, z]) maps to
//   sx = (x + y) * CX,  sy = (x - y) * CY - z * SIZE
// To reuse that transform, we store voxels as [x, y, z] where:
//   x  = column (right-axis in iso)
//   y  = depth (into screen; higher y → further back, rendered first)
//   z  = height (up-axis)
// ---------------------------------------------------------------------------

type Voxel3 = [number, number, number]

function stack19project([x, y, z]: Voxel3): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

function paintOrder(voxels: Voxel3[]): Voxel3[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

// A: 4 in a row along x-axis, y=0, z=0
const VOXELS_A: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0],
]

// B: 2×2 block (x=0,1; y=0,1; z=0)
const VOXELS_B: Voxel3[] = [
  [0, 0, 0], [1, 0, 0],
  [0, 1, 0], [1, 1, 0],
]

// C: L-shape — 3 in a row along x, then 1 off the far end along y
// (x=0,1,2 at y=0) + (x=2 at y=1)
const VOXELS_C: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [2, 1, 0],
]

// D: T-shape — 3 in a row along x, then 1 off the middle along y
// (x=0,1,2 at y=0) + (x=1 at y=1)
const VOXELS_D: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [1, 1, 0],
]

// E: Staircase — each successive cube one step higher
// (x=0,z=0), (x=1,z=1), (x=2,z=2), (x=3,z=3)
const VOXELS_E: Voxel3[] = [
  [0, 0, 0], [1, 0, 1], [2, 0, 2], [3, 0, 3],
]

const SHAPE_VOXELS: Record<string, Voxel3[]> = {
  A: VOXELS_A,
  B: VOXELS_B,
  C: VOXELS_C,
  D: VOXELS_D,
  E: VOXELS_E,
}

// ---------------------------------------------------------------------------
// CubeGroup — renders a set of voxels as isometric cubes, auto-fitting a viewBox
// ---------------------------------------------------------------------------

interface CubeGroupProps {
  voxels: Voxel3[]
  /** SVG width in px (height auto-scales to fit). Default 90. */
  width?: number
  pad?: number
}

function cubeGroupBounds(voxels: Voxel3[]): { minX: number; minY: number; maxX: number; maxY: number } {
  const pts = voxels.flatMap((v) => {
    const { sx, sy } = stack19project(v)
    return [
      { sx, sy },
      { sx: sx + 2 * CX, sy },       // right edge of top face
      { sx: sx + CX, sy: sy + CY + SIZE }, // bottom of side faces
      { sx, sy: sy + SIZE },          // bottom of left face
    ]
  })
  return {
    minX: Math.min(...pts.map((p) => p.sx)),
    minY: Math.min(...pts.map((p) => p.sy)),
    maxX: Math.max(...pts.map((p) => p.sx)),
    maxY: Math.max(...pts.map((p) => p.sy)),
  }
}

export function CubeGroup({ voxels, width = 90, pad = 6 }: CubeGroupProps) {
  const bounds = cubeGroupBounds(voxels)
  const vbW = bounds.maxX - bounds.minX + pad * 2
  const vbH = bounds.maxY - bounds.minY + pad * 2
  const vbX = bounds.minX - pad
  const vbY = bounds.minY - pad

  const aspect = vbH / vbW
  const svgH = Math.round(width * aspect)

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={width}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {paintOrder(voxels).map((v, i) => {
        const { sx, sy } = stack19project(v)
        const topPts = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
        const leftPts = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
        const rightPts = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
        return (
          <g key={i}>
            <polygon points={topPts}   fill={TOP_FILL}   stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={leftPts}  fill={LEFT_FILL}  stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={rightPts} fill={RIGHT_FILL} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shape label + painted-face count lookup (for aria labels)
// ---------------------------------------------------------------------------

const SHAPE_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Shape A: four cubes in a straight row.',
    id: 'Bentuk A: empat kubus berjajar lurus.',
  },
  B: {
    en: 'Shape B: four cubes arranged as a 2×2 square block.',
    id: 'Bentuk B: empat kubus membentuk blok persegi 2×2.',
  },
  C: {
    en: 'Shape C: three cubes in a row with one cube attached to the end, forming an L-shape.',
    id: 'Bentuk C: tiga kubus berjajar dengan satu kubus di ujung, membentuk huruf L.',
  },
  D: {
    en: 'Shape D: three cubes in a row with one cube attached to the middle, forming a T-shape.',
    id: 'Bentuk D: tiga kubus berjajar dengan satu kubus di tengah, membentuk huruf T.',
  },
  E: {
    en: 'Shape E: four cubes arranged as a staircase, each one step higher.',
    id: 'Bentuk E: empat kubus tersusun seperti tangga, masing-masing satu langkah lebih tinggi.',
  },
}

// ---------------------------------------------------------------------------
// Stem illustration — all five shapes side by side
// ---------------------------------------------------------------------------

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

/**
 * CubeShapes14Illustration — shows all five 4-cube shapes as the problem figure.
 * Does NOT show the answer or face counts.
 */
export default function CubeShapes14Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Five shapes each made from four cubes glued together: ' +
        'A is a straight row, B is a 2×2 block, C is an L-shape, ' +
        'D is a T-shape, E is a staircase. Which has the smallest painted area?'
      }
    >
      <div
        className="flex flex-wrap items-end justify-center gap-4"
        aria-hidden="true"
      >
        {LABELS.map((label) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <CubeGroup voxels={SHAPE_VOXELS[label]} width={80} pad={6} />
            <span
              className="font-display text-xs font-bold"
              style={{ color: '#1F2937' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE shape by choice label (A/B/C/D/E)
// ---------------------------------------------------------------------------

/**
 * CubeShapes14Option — renders one A/B/C/D/E choice as an isometric cube figure.
 * Registered in CHOICE_RENDERERS for IKMC-19-PE-Q14.
 */
export function CubeShapes14Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const voxels = SHAPE_VOXELS[k]
  const aria = SHAPE_ARIA[k]
  if (!voxels) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <CubeGroup voxels={voxels} width={72} pad={6} />
    </span>
  )
}
