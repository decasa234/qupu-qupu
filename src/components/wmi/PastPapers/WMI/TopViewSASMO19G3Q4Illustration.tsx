// SASMO-19-G3-Q4 — "Find the top view of the figure on the right."
//
// The 3D figure has a tall left section (2 cubes wide × 1 deep × 2 tall) and a
// shorter right section (1 cube wide × 1 deep × 1 tall) with a cylinder on top.
//
// Correct top view: 2 cells (left 2× wider, right 1× narrower) with circle on right = option C.
//
// Uses isoProject from ./primitives/IsoCubes for projection math.
// Co-exports TopViewSASMO19G3Q4Option (A–E choice renderer for CHOICE_RENDERERS).
//
// Pure SVG, no hooks, no framer-motion, SSR-safe.

import { isoProject } from './primitives/IsoCubes'
import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Projection constants
// ---------------------------------------------------------------------------

const SIZE = 24
const CX = SIZE * 0.866  // ≈ 20.784 (cos 30°)
const CY = SIZE * 0.5    // = 12 (sin 30°)

const INK   = '#1F2937'
const TOP_C = '#D6EBF7'
const LEFT_C  = '#8FC6E8'
const RIGHT_C = '#5BA8D4'

// ---------------------------------------------------------------------------
// Cube face renderer (manual ISO to match cylinder in the same SVG)
// ---------------------------------------------------------------------------

interface CubeCoords { x: number; y: number; z: number }

function IsoCubeFaces({ x, y, z }: CubeCoords) {
  const { sx, sy } = isoProject(x, y, z, SIZE)
  const topPts  = `${sx},${sy} ${sx+CX},${sy-CY} ${sx+2*CX},${sy} ${sx+CX},${sy+CY}`
  const leftPts = `${sx},${sy} ${sx+CX},${sy+CY} ${sx+CX},${sy+CY+SIZE} ${sx},${sy+SIZE}`
  const rightPts = `${sx+CX},${sy+CY} ${sx+2*CX},${sy} ${sx+2*CX},${sy+SIZE} ${sx+CX},${sy+CY+SIZE}`
  return (
    <>
      <polygon points={leftPts}  fill={LEFT_C}  stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
      <polygon points={rightPts} fill={RIGHT_C} stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
      <polygon points={topPts}   fill={TOP_C}   stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
    </>
  )
}

// ---------------------------------------------------------------------------
// Isometric upright cylinder
// The cylinder sits on the top face of a voxel at (vx, vy, vz).
// rx/ry are the isometric ellipse semi-axes (screen px).
// h is the cylinder height in screen px.
// ---------------------------------------------------------------------------

interface IsoCylProps {
  vx: number; vy: number; vz: number
  rx?: number; ry?: number; h?: number
  fill?: string; topFill?: string
}

function IsoCyl({ vx, vy, vz, rx = 8, ry = 5, h = SIZE, fill = LEFT_C, topFill = TOP_C }: IsoCylProps) {
  // Center of the top face of the voxel below = base of cylinder
  const { sx, sy } = isoProject(vx, vy, vz, SIZE)
  const cx = sx + CX         // center x of top face diamond
  const base_y = sy          // center y of top face diamond
  const top_y  = base_y - h  // cylinder extends upward

  // Body: rectangle + bottom arc (front of base ellipse visible)
  const body = [
    `M ${cx - rx},${base_y}`,
    `L ${cx - rx},${top_y}`,
    `L ${cx + rx},${top_y}`,
    `L ${cx + rx},${base_y}`,
    `A ${rx},${ry} 0 0,1 ${cx - rx},${base_y}`,
    'Z',
  ].join(' ')

  return (
    <>
      <path d={body} fill={fill} stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
      <ellipse cx={cx} cy={top_y} rx={rx} ry={ry}
               fill={topFill} stroke={INK} strokeWidth={1.2}/>
    </>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — the 3D figure
// Cubes rendered in painter's order (y desc, z asc, x asc; all y=0 here).
// ---------------------------------------------------------------------------

/**
 * TopViewSASMO19G3Q4Illustration — the 3D figure for SASMO 2019 G3 Q4.
 * Left section: 2 wide × 2 tall (no cylinder).
 * Right section: 1 wide × 1 tall + cylinder on top.
 */
export default function TopViewSASMO19G3Q4Illustration() {
  // Painter's sort: y desc, z asc, x asc (all y=0 → just z asc, x asc)
  const cubeOrder: CubeCoords[] = [
    { x:0, y:0, z:0 },
    { x:1, y:0, z:0 },
    { x:2, y:0, z:0 },  // right block (short)
    { x:0, y:0, z:1 },
    { x:1, y:0, z:1 },  // top of left section
    // Cylinder above (2,0,0) renders last (highest/frontmost on right)
  ]

  return (
    <div className="my-4 flex justify-center" role="img"
      aria-label="3D figure: tall left section of two columns, shorter right section with cylinder on top.">
      <svg
        viewBox="-8 -44 100 112"
        width="200"
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        {cubeOrder.map((c, i) => (
          <IsoCubeFaces key={i} x={c.x} y={c.y} z={c.z} />
        ))}
        {/* Cylinder on top of voxel (2,0,0) — note: isoProject(2,0,0) sy=24, cx=62.352 */}
        <IsoCyl vx={2} vy={0} vz={0} />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — one A/B/C/D/E top-view choice as a 2D flat diagram
//
// Each option shows a rectangle divided into cells with a circle in one cell.
// Vertical line counts per the source images:
//   A: 3 equal cells, circle center    (4 vertical lines)
//   B: 3 cells (left wide), circle left (4 vertical lines)
//   C: 2 cells (left wide), circle right (3 vertical lines) ← CORRECT
//   D: 3 cells (right wide), circle right (4 vertical lines)
//   E: 3 cells (middle wide), circle middle (4 vertical lines)
// ---------------------------------------------------------------------------

const OPT_W = 120
const OPT_H = 72
const OPT_INK = '#1F2937'
const OPT_BG  = '#F8FAFC'
const OPT_CIR = '#D6EBF7'
const OPT_CIR_STROKE = '#1F2937'

interface OptionSpec {
  dividers: number[]  // x positions of internal vertical lines
  cx: number          // circle center x
  cy: number          // circle center y
  r:  number          // circle radius
}

const OPTION_SPECS: Record<string, OptionSpec> = {
  A: { dividers: [40, 80], cx: 60,  cy: 36, r: 16 },  // 3 equal cells, circle center
  B: { dividers: [50, 85], cx: 25,  cy: 36, r: 20 },  // 3 cells (left wide), circle left
  C: { dividers: [80],     cx: 100, cy: 36, r: 16 },  // 2 cells (left wider), circle right
  D: { dividers: [30, 60], cx: 90,  cy: 36, r: 22 },  // 3 cells (right wide), circle right
  E: { dividers: [30, 90], cx: 60,  cy: 36, r: 22 },  // 3 cells (middle wide), circle middle
}

const ARIA_LABELS: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: three equal columns, circle in the middle column.',
    id: 'Pilihan A: tiga kolom sama lebar, lingkaran di kolom tengah.',
  },
  B: {
    en: 'Option B: three columns (left wider), circle in the left column.',
    id: 'Pilihan B: tiga kolom (kiri lebih lebar), lingkaran di kolom kiri.',
  },
  C: {
    en: 'Option C: two columns (left wider), circle in the right column.',
    id: 'Pilihan C: dua kolom (kiri lebih lebar), lingkaran di kolom kanan.',
  },
  D: {
    en: 'Option D: three columns (right wider), circle in the right column.',
    id: 'Pilihan D: tiga kolom (kanan lebih lebar), lingkaran di kolom kanan.',
  },
  E: {
    en: 'Option E: three columns (middle wider), circle in the middle column.',
    id: 'Pilihan E: tiga kolom (tengah lebih lebar), lingkaran di kolom tengah.',
  },
}

/**
 * TopViewSASMO19G3Q4Option — renders one A/B/C/D/E top-view choice.
 * Registered in CHOICE_RENDERERS for SASMO-19-G3-Q4.
 */
export function TopViewSASMO19G3Q4Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const spec = OPTION_SPECS[k]
  const aria = ARIA_LABELS[k]
  if (!spec) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${OPT_W} ${OPT_H}`}
        width={OPT_W}
        height={OPT_H}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Background rectangle */}
        <rect x={0} y={0} width={OPT_W} height={OPT_H}
              fill={OPT_BG} stroke={OPT_INK} strokeWidth={1.5}/>
        {/* Internal dividers */}
        {spec.dividers.map((dx) => (
          <line key={dx} x1={dx} y1={0} x2={dx} y2={OPT_H}
                stroke={OPT_INK} strokeWidth={1.5}/>
        ))}
        {/* Circle */}
        <circle cx={spec.cx} cy={spec.cy} r={spec.r}
                fill={OPT_CIR} stroke={OPT_CIR_STROKE} strokeWidth={1.5}/>
      </svg>
    </span>
  )
}
