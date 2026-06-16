// Isometric cube-stack figure for WMI-19P1A-Q4 (2019 Semifinal Grade 1 Paper A).
//
// "How many small cubes are there in the stack shown?"  Choices 20 / 19 / 18 / 17,
// answer B = 19.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g1-a-q4.jpg as a clean
// isometric redraw (the JPG is NOT embedded). The scan shows a stepped solid
// sitting in a back-left corner: a back row of towers (a couple poke up), a lower
// front row with a notch, drawn in standard isometric projection.
//
// The solid is a stack of unit cubes laid out as a HEIGHT MAP over a 4-wide × 2-deep
// footprint (x = right, y = depth with y = 1 the back row, z = up). Every cube above
// the floor rests on the cube below it, so the stack is fully supported (no floaters)
// and the total is derivable layer by layer:
//
//   column heights        per (x,y):           floor z0 = 8 cubes
//     back (y=1):  3 3 2 3                      mid   z1 = 7 cubes
//     front(y=0):  2 2 1 3                      top   z2 = 4 cubes
//                                               --------------------
//                                               total      = 19   (answer B)
//
// The figure shows ONLY the problem: it never prints the count and never marks the
// hidden cubes. Revealing the 19 layer by layer is the explainer's job, via the
// co-exported IsoCubeStack primitive (its `litLayer` / `dimLayer` props).
//
// Pure render, SSR-safe, deterministic — no window/document/random/dates.
// House-style references: IsoStack / BigCube21 in puzzles21G1Illustrations.tsx.

const INK = '#1F2937'

// Isometric face palette (top lightest, left mid, right darkest) so the cubes
// read in 3D. A second, warmer "lit" palette is used by the explainer to glow a
// layer as it is counted.
const TOP = '#D6EBF7'
const LEFT = '#8FC6E8'
const RIGHT = '#5BA8D4'

const LIT_TOP = '#FFD23F'
const LIT_LEFT = '#F4B400'
const LIT_RIGHT = '#D97706'

// Soft gray corner walls (the back + left planes the cubes lean into in the scan).
const WALL_BACK = '#A3A3A3'
const WALL_LEFT = '#8C8C8C'

export type Voxel = [number, number, number]

/* ---------------------------------------------------------------- data ----- */
// Column height map. Key "x,y" → number of stacked cubes. y = 1 is the back row
// (against the wall), y = 0 is the front row (nearest the viewer).
export const HEIGHTS: Record<string, number> = {
  '0,1': 3, '1,1': 3, '2,1': 2, '3,1': 3, // back row
  '0,0': 2, '1,0': 2, '2,0': 1, '3,0': 3, // front row
}

export const COLS = 4 // x: 0..3
export const DEPTH = 2 // y: 0..1
export const MAX_H = 3 // tallest column

/** Expand the height map into individual unit-cube voxels [x, y, z]. */
export function buildVoxels(): Voxel[] {
  const out: Voxel[] = []
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < DEPTH; y++) {
      const h = HEIGHTS[`${x},${y}`] ?? 0
      for (let z = 0; z < h; z++) out.push([x, y, z])
    }
  }
  return out
}

export const VOXELS: Voxel[] = buildVoxels()
export const TOTAL_CUBES = VOXELS.length // 19

// Cubes in each horizontal layer (z), bottom → top: [8, 7, 4]; sums to 19.
export const LAYER_COUNTS: number[] = Array.from({ length: MAX_H }, (_, z) =>
  VOXELS.filter(([, , vz]) => vz === z).length,
)

/* ----------------------------------------------------------- geometry ----- */
const SIZE = 26 // cube edge in px
const CX = SIZE * 0.86 // horizontal run of one iso unit
const CY = SIZE * 0.5 // vertical run of one iso unit

/** Project a voxel to the SVG plane (same iso transform as IsoStack/BigCube21). */
function project([x, y, z]: Voxel): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

/** Painter's order: far cubes (back, low, left) first so near cubes overdraw them. */
function paintOrder(voxels: Voxel[]): Voxel[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

/**
 * One isometric unit cube at voxel (x, y, z). `lit` swaps in the warm palette;
 * `dim` fades cubes not yet reached (used by the explainer as it counts upward).
 */
export function Cube({ v, lit = false, dim = false }: { v: Voxel; lit?: boolean; dim?: boolean }) {
  const { sx, sy } = project(v)
  const top = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
  const leftF = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
  const rightF = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
  return (
    <g opacity={dim ? 0.28 : 1}>
      <polygon points={top} fill={lit ? LIT_TOP : TOP} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={leftF} fill={lit ? LIT_LEFT : LEFT} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={rightF} fill={lit ? LIT_RIGHT : RIGHT} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  )
}

export interface IsoCubeStackProps {
  /** When set, only this layer index (z) glows; cubes above it are dimmed. */
  litLayer?: number
  /** When true, layers strictly above `litLayer` are faded out (count build-up). */
  dimAbove?: boolean
}

/**
 * The cube stack drawn in the back-left corner. At its defaults (no lit layer)
 * it is the pristine question figure: the full solid, no count, no marks. The
 * explainer passes `litLayer` to glow one horizontal layer at a time while it
 * tallies the cubes upward.
 */
export function IsoCubeStack({ litLayer, dimAbove = false }: IsoCubeStackProps) {
  // Footprint extents in the projected plane (with depth) → tight viewBox + headroom.
  const corners = VOXELS.map(project)
  // include the +2CX / +SIZE that each cube's faces extend beyond its origin
  const minX = Math.min(...corners.map((p) => p.sx))
  const maxX = Math.max(...corners.map((p) => p.sx)) + 2 * CX
  const minY = Math.min(...corners.map((p) => p.sy)) - CY
  const maxY = Math.max(...corners.map((p) => p.sy)) + CY + SIZE

  const pad = 18
  const wallPad = 8 // extra room for the corner walls behind the stack
  const vbX = minX - pad - wallPad
  const vbY = minY - pad - SIZE * 0.6 // headroom so the top towers never clip
  const vbW = maxX - minX + pad * 2 + wallPad
  const vbH = maxY - minY + pad * 2

  // Back wall + left wall: a shallow gray corner the stack sits in. Sized from the
  // footprint so it always frames the solid.
  const backTopL = project([0, DEPTH - 1, MAX_H])
  const backTopR = project([COLS - 1, DEPTH - 1, MAX_H])
  const backBotR = project([COLS - 1, DEPTH - 1, 0])
  const backBotL = project([0, DEPTH - 1, 0])
  const wallRise = SIZE * 0.7 // walls rise a little above the tallest tower

  const frontL = project([0, 0, 0])

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- corner walls (drawn first, behind every cube) ---- */}
      {/* back wall: the plane the back row of cubes leans against */}
      <polygon
        points={`${backTopL.sx},${backTopL.sy - wallRise} ${backTopR.sx + 2 * CX},${backTopR.sy - wallRise} ${backBotR.sx + 2 * CX},${backBotR.sy + SIZE} ${backBotL.sx},${backBotL.sy + SIZE}`}
        fill={WALL_BACK}
        stroke={INK}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* left wall: the plane along the left edge, angled toward the viewer */}
      <polygon
        points={`${backTopL.sx},${backTopL.sy - wallRise} ${backBotL.sx},${backBotL.sy + SIZE} ${frontL.sx},${frontL.sy + SIZE} ${frontL.sx - CX},${frontL.sy + SIZE - CY - wallRise}`}
        fill={WALL_LEFT}
        stroke={INK}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />

      {/* ---- the cube solid ---- */}
      {paintOrder(VOXELS).map((v, i) => {
        const z = v[2]
        const lit = litLayer !== undefined && z === litLayer
        const dim = dimAbove && litLayer !== undefined && z > litLayer
        return <Cube key={i} v={v} lit={lit} dim={dim} />
      })}
    </svg>
  )
}

export default function CubeStack19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A stack of small cubes drawn in isometric view, sitting in a back-left corner. The cubes form a stepped solid four wide and two deep, with columns one to three cubes tall and a notch at the front. The count is not shown."
    >
      <IsoCubeStack />
    </div>
  )
}
