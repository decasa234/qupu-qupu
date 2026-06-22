// IKMC-19-EC-Q3 — "Sus puts three cubes on the table. On top of those he
// puts two cylinders. On top of these he puts another cube."
//
// The A–E options ARE the figures (no separate stem figure). This file
// co-exports Figures3ECOption (the choice renderer) — registered in
// CHOICE_RENDERERS['IKMC-19-EC-Q3'].
//
// The five options from the source paper (006–008.jpg):
//
//   A (correct): bottom = 3 cubes, middle = 2 cylinders, top = 1 cube
//   B:           bottom = 3×2 (6) cubes, top = 1 cylinder (centred)
//   C:           bottom = 2 cylinders, top = 2×2 (4) cubes
//   D:           bottom = 3 cubes, middle = 2 cylinders, top = 3 cubes
//   E:           bottom = 1 cube, middle = 2 cylinders, top = 3 cubes
//
// Reuses the isometric-cube projection from CubeShapes14Illustration (CubeGroup
// primitive), adapts it here to also draw cylinders in the same palette.
//
// Pure SVG, no raster, no random, no dates. SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Colour palette (matches CubeShapes14 / CubeStack19P1 house style)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const CUBE_TOP = '#D6EBF7'
const CUBE_LEFT = '#8FC6E8'
const CUBE_RIGHT = '#5BA8D4'
// Cylinder uses a lighter blue family so it reads as a different shape
const CYL_BODY = '#A8D8F0'
const CYL_TOP = '#D6EBF7'
const CYL_DARK = '#6FB8E0'

// ---------------------------------------------------------------------------
// Isometric projection (same transform as CubeShapes14 / CubeStack19P1)
// ---------------------------------------------------------------------------

const SIZE = 20          // cube edge px
const CX = SIZE * 0.866  // horizontal run per iso unit
const CY = SIZE * 0.5    // vertical run per iso unit

type Voxel3 = [number, number, number]  // [x, y, z]

function isoProject([x, y, z]: Voxel3): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

// ---------------------------------------------------------------------------
// IsoCube — one unit cube at voxel (x,y,z) in the iso projection
// ---------------------------------------------------------------------------

function IsoCube({ v }: { v: Voxel3 }) {
  const { sx, sy } = isoProject(v)
  const topPts  = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
  const leftPts = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
  const rightPts= `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
  return (
    <g>
      <polygon points={topPts}   fill={CUBE_TOP}   stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={leftPts}  fill={CUBE_LEFT}  stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={rightPts} fill={CUBE_RIGHT} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// IsoCylinder — a cylinder centred over voxel (x, y, z)
//
// The cylinder sits in the same isometric space as the cubes.
// Its footprint is the width of one cube (2*CX wide in SVG).
// We draw:
//   - a filled rectangle for the body (height = SIZE in SVG)
//   - an ellipse for the top face
//   - an arc for the bottom rim (only the visible back half)
//
// The cylinder is rendered as a screen-aligned (non-isometric) shape
// centred on the projected (sx, sy) of its voxel, so it reads naturally.
// ---------------------------------------------------------------------------

const CYL_RX = CX          // x-radius (matches cube width / 2)
const CYL_RY = CY          // y-radius (iso ellipse)
const CYL_H  = SIZE * 1.1  // visual height of barrel

function IsoCylinder({ v }: { v: Voxel3 }) {
  // Project to get the top-left anchor of the cube footprint
  const { sx, sy } = isoProject(v)
  // Centre x of the cube face (midpoint of the top diamond)
  const cx = sx + CX
  // The top of the cylinder cap sits at the same y as the cube top vertex
  const capCY = sy

  // Body: a trapezoid following the cylinder's side silhouette
  // Left side goes from (cx - CYL_RX, capCY) down to (cx - CYL_RX, capCY + CYL_H)
  // Right side goes from (cx + CYL_RX, capCY) down to (cx + CYL_RX, capCY + CYL_H)
  const bodyLeft  = cx - CYL_RX
  const bodyTop   = capCY
  const bodyBot   = capCY + CYL_H

  return (
    <g>
      {/* Left dark face of barrel */}
      <rect
        x={bodyLeft}
        y={bodyTop}
        width={CYL_RX}
        height={CYL_H}
        fill={CYL_DARK}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Right lighter face of barrel */}
      <rect
        x={cx}
        y={bodyTop}
        width={CYL_RX}
        height={CYL_H}
        fill={CYL_BODY}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Bottom rim ellipse (visible) */}
      <ellipse
        cx={cx}
        cy={bodyBot}
        rx={CYL_RX}
        ry={CYL_RY}
        fill={CYL_BODY}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Dividing line between left and right barrel halves */}
      <line
        x1={cx}
        y1={bodyTop}
        x2={cx}
        y2={bodyBot}
        stroke={INK}
        strokeWidth={0.7}
        opacity={0.4}
      />
      {/* Top cap ellipse (drawn last, on top) */}
      <ellipse
        cx={cx}
        cy={capCY}
        rx={CYL_RX}
        ry={CYL_RY}
        fill={CYL_TOP}
        stroke={INK}
        strokeWidth={1.2}
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Shape definitions
//
// Each shape is described as an array of { kind: 'cube' | 'cylinder', v }
// The painter's order (far→near) is applied across both types together.
//
// Voxel convention:  x = right column (0-based),
//                    y = depth (0 = front),
//                    z = height layer (0 = table)
//
// For this question shapes are essentially flat (y always 0) — the depth axis
// gives the front-to-back painter ordering. We place all pieces at y=0
// so they render in a natural left-to-right line with no depth.
// ---------------------------------------------------------------------------

type Piece = { kind: 'cube'; v: Voxel3 } | { kind: 'cyl'; v: Voxel3 }

// A (correct): bottom=3 cubes (x=0,1,2 z=0), middle=2 cylinders (x=0,1 z=1), top=1 cube (x=0 z=2, centred over cylinders)
// The cylinders sit at x=0 and x=1, centred over the 3 cubes at z=0.
// The top cube sits at x=0 z=2 (centred over the 2 cylinders).
// To visually centre: 3-cube base spans x=0..2, 2 cylinders span x=0..1, top cube at x=0 for centering.
// For better visual centering: base cubes x=0,1,2; cylinders at x=0,1 (z=1); top cube x=0 (z=2)
// Actually let's centre: cylinders at x=0 and x=1 z=1 (left of centre is fine for A)
// Better: base x=0,1,2 at z=0; cylinders x=0,1 z=1; top cube x=0 z=2
const PIECES_A: Piece[] = [
  // bottom layer: 3 cubes
  { kind: 'cube', v: [0, 0, 0] },
  { kind: 'cube', v: [1, 0, 0] },
  { kind: 'cube', v: [2, 0, 0] },
  // middle layer: 2 cylinders (placed at x=0 and x=1 to sit on the cubes)
  { kind: 'cyl',  v: [0, 0, 1] },
  { kind: 'cyl',  v: [1, 0, 1] },
  // top layer: 1 cube
  { kind: 'cube', v: [0, 0, 2] },
]

// B: bottom = 2 rows of 3 cubes (6 total), top = 1 cylinder in centre
// Front row y=0, back row y=1; each row has x=0,1,2
const PIECES_B: Piece[] = [
  // front row z=0 y=0
  { kind: 'cube', v: [0, 0, 0] },
  { kind: 'cube', v: [1, 0, 0] },
  { kind: 'cube', v: [2, 0, 0] },
  // back row z=0 y=1
  { kind: 'cube', v: [0, 1, 0] },
  { kind: 'cube', v: [1, 1, 0] },
  { kind: 'cube', v: [2, 1, 0] },
  // top: 1 cylinder in the centre
  { kind: 'cyl',  v: [1, 0, 1] },
]

// C: bottom = 2 cylinders, top = 2×2 (4) cubes
// Cylinders at x=0,1 z=0; cubes at x=0,1 z=1 (front row) and x=0,1 z=1 y=1 (back row)
const PIECES_C: Piece[] = [
  // bottom: 2 cylinders
  { kind: 'cyl',  v: [0, 0, 0] },
  { kind: 'cyl',  v: [1, 0, 0] },
  // top: 2×2 block of 4 cubes (front row z=1 y=0, back row z=1 y=1)
  { kind: 'cube', v: [0, 0, 1] },
  { kind: 'cube', v: [1, 0, 1] },
  { kind: 'cube', v: [0, 1, 1] },
  { kind: 'cube', v: [1, 1, 1] },
]

// D: bottom = 3 cubes, middle = 2 cylinders, top = 3 cubes (mirror of A but wrong top)
const PIECES_D: Piece[] = [
  // bottom: 3 cubes
  { kind: 'cube', v: [0, 0, 0] },
  { kind: 'cube', v: [1, 0, 0] },
  { kind: 'cube', v: [2, 0, 0] },
  // middle: 2 cylinders
  { kind: 'cyl',  v: [0, 0, 1] },
  { kind: 'cyl',  v: [1, 0, 1] },
  // top: 3 cubes (wrong!)
  { kind: 'cube', v: [0, 0, 2] },
  { kind: 'cube', v: [1, 0, 2] },
  { kind: 'cube', v: [2, 0, 2] },
]

// E: bottom = 1 cube, middle = 2 cylinders, top = 3 cubes (reversed A)
const PIECES_E: Piece[] = [
  // bottom: 1 cube
  { kind: 'cube', v: [0, 0, 0] },
  // middle: 2 cylinders
  { kind: 'cyl',  v: [0, 0, 1] },
  { kind: 'cyl',  v: [1, 0, 1] },
  // top: 3 cubes
  { kind: 'cube', v: [0, 0, 2] },
  { kind: 'cube', v: [1, 0, 2] },
  { kind: 'cube', v: [2, 0, 2] },
]

const SHAPE_PIECES: Record<string, Piece[]> = {
  A: PIECES_A,
  B: PIECES_B,
  C: PIECES_C,
  D: PIECES_D,
  E: PIECES_E,
}

// ---------------------------------------------------------------------------
// Bounds computation (accounts for both cube and cylinder geometry)
// ---------------------------------------------------------------------------

function pieceBounds(pieces: Piece[]): { minX: number; minY: number; maxX: number; maxY: number } {
  const pts: Array<{ sx: number; sy: number }> = []
  for (const p of pieces) {
    const { sx, sy } = isoProject(p.v)
    if (p.kind === 'cube') {
      pts.push(
        { sx, sy },
        { sx: sx + 2 * CX, sy },
        { sx: sx + CX, sy: sy + CY + SIZE },
        { sx, sy: sy + SIZE },
      )
    } else {
      // cylinder: from (cx - CYL_RX, capCY - CYL_RY) to (cx + CYL_RX, capCY + CYL_H + CYL_RY)
      const cx = sx + CX
      pts.push(
        { sx: cx - CYL_RX, sy: sy - CYL_RY },
        { sx: cx + CYL_RX, sy: sy + CYL_H + CYL_RY },
      )
    }
  }
  return {
    minX: Math.min(...pts.map((p) => p.sx)),
    minY: Math.min(...pts.map((p) => p.sy)),
    maxX: Math.max(...pts.map((p) => p.sx)),
    maxY: Math.max(...pts.map((p) => p.sy)),
  }
}

// ---------------------------------------------------------------------------
// ShapeGroup — renders a set of pieces auto-fitting a viewBox
// ---------------------------------------------------------------------------

interface ShapeGroupProps {
  pieces: Piece[]
  width?: number
  pad?: number
}

function ShapeGroup({ pieces, width = 100, pad = 8 }: ShapeGroupProps) {
  const b = pieceBounds(pieces)
  const vbW = b.maxX - b.minX + pad * 2
  const vbH = b.maxY - b.minY + pad * 2
  const vbX = b.minX - pad
  const vbY = b.minY - pad

  const aspect = vbH / vbW
  const svgH = Math.round(width * aspect)

  // Painter order: sort pieces back-to-front, then bottom-to-top
  const sorted = [...pieces].sort((a, b2) => {
    const byDepth = b2.v[1] - a.v[1]
    if (byDepth !== 0) return byDepth
    const byZ = a.v[2] - b2.v[2]
    if (byZ !== 0) return byZ
    return a.v[0] - b2.v[0]
  })

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={width}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {sorted.map((p, i) =>
        p.kind === 'cube'
          ? <IsoCube key={i} v={p.v} />
          : <IsoCylinder key={i} v={p.v} />,
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Aria labels
// ---------------------------------------------------------------------------

const SHAPE_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: three cubes on the bottom, two cylinders in the middle, one cube on top — matches the description.',
    id: 'Pilihan A: tiga kubus di bawah, dua silinder di tengah, satu kubus di atas — sesuai deskripsi.',
  },
  B: {
    en: 'Option B: six cubes arranged in a 2×3 base, one cylinder on top in the centre.',
    id: 'Pilihan B: enam kubus berbaris 2×3 sebagai alas, satu silinder di atas di tengah.',
  },
  C: {
    en: 'Option C: two cylinders on the bottom, four cubes (2×2) on top.',
    id: 'Pilihan C: dua silinder di bawah, empat kubus (2×2) di atas.',
  },
  D: {
    en: 'Option D: three cubes on the bottom, two cylinders in the middle, three cubes on top.',
    id: 'Pilihan D: tiga kubus di bawah, dua silinder di tengah, tiga kubus di atas.',
  },
  E: {
    en: 'Option E: one cube on the bottom, two cylinders in the middle, three cubes on top.',
    id: 'Pilihan E: satu kubus di bawah, dua silinder di tengah, tiga kubus di atas.',
  },
}

// ---------------------------------------------------------------------------
// Figures3ECOption — renders ONE A/B/C/D/E choice as an SVG figure
// Registered in CHOICE_RENDERERS['IKMC-19-EC-Q3']
// ---------------------------------------------------------------------------

export function Figures3ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const pieces = SHAPE_PIECES[k]
  const aria = SHAPE_ARIA[k]
  if (!pieces) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <ShapeGroup pieces={pieces} width={88} pad={8} />
    </span>
  )
}

// Export ShapeGroup for use by the explainer
export { ShapeGroup, SHAPE_PIECES, SHAPE_ARIA }
