// WMI-19P2A-Q12 (2019 Semifinal Grade 2 Paper A) — "Which figure will you see if you
// look at the stack of cubes from the direction of the arrow?"  Answer: A.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g2-a-q12.jpg (the JPG is NOT
// embedded). The scan shows a small solid of unit cubes drawn in isometric view with
// a thick arrow on the right pointing LEFT: the viewer looks at the stack from its
// right side. Looking from the arrow flattens the solid to a 2-D outline — depth
// disappears, so two cubes lined up one-behind-the-other along the view show as one
// square.
//
// The solid (a tee / L shaped staircase) is a HEIGHT MAP over a footprint that is
// `COLS` wide (across the view) and `DEPTH` deep (toward / away from the arrow),
// z = up. The side view collapses the DEPTH axis: for each (across, height) cell the
// silhouette has a square if ANY depth has a cube there.
//
//   height map  (depth d=0 nearest the arrow, d=1 behind it):
//                across:   0   1   2
//        depth 0 (front):  3   1   1
//        depth 1 (back):   3   2   0
//   → side silhouette (collapse depth) per across column: max heights 3, 2, 1.
//
// The static figure shows ONLY the problem — the isometric solid + the arrow. It
// NEVER draws the flattened outline (that is the answer, revealed by the explainer).
//
// Pure render, SSR-safe, deterministic — no window/document/random/dates.
// House-style references: CubeStack19P1Illustration / MirrorBlocks22G1 (iso cubes).

const INK = '#1F2937'
const TOP = '#FFFFFF'
const LEFTF = '#FFFFFF'
const RIGHTF = '#D9D9D9' // the shaded right-facing faces, as in the scan

export type Voxel = [number, number, number] // [across x, depth y, height z]

export const COLS = 3
export const DEPTH = 2

// Height of each footprint column, keyed "x,y" (x across the view, y depth).
export const HEIGHTS: Record<string, number> = {
  '0,1': 3,
  '0,0': 3,
  '1,1': 2,
  '1,0': 1,
  '2,1': 0,
  '2,0': 1,
}

/** Expand the height map to individual unit cubes. */
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

/**
 * Side silhouette seen from the arrow: collapse the DEPTH axis. Result is a grid
 * indexed [z][x] (z = 0 is the BOTTOM row), true where any cube sits at (x, *, z).
 * Per across-column the visible height is max over depth: [3, 2, 1].
 */
export function buildSilhouette(): boolean[][] {
  const colHeights = Array.from({ length: COLS }, (_, x) =>
    Math.max(...Array.from({ length: DEPTH }, (_, y) => HEIGHTS[`${x},${y}`] ?? 0)),
  )
  const maxH = Math.max(...colHeights)
  const grid: boolean[][] = []
  for (let z = 0; z < maxH; z++) {
    grid.push(colHeights.map((h) => z < h))
  }
  return grid
}

export const SILHOUETTE = buildSilhouette() // [3,2,1] staircase

/* ----------------------------------------------------------- geometry ----- */
const SIZE = 30 // cube edge
const CX = SIZE * 0.86 // iso horizontal run of one unit
const CY = SIZE * 0.5 // iso vertical run of one unit

function project([x, y, z]: Voxel): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

/** Painter's order: far cubes (large y, low z) first so near cubes overdraw them. */
function paintOrder(voxels: Voxel[]): Voxel[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

/** One isometric unit cube. `highlight` rings it (used by the explainer). */
export function IsoCube({ v, highlight }: { v: Voxel; highlight?: string }) {
  const { sx, sy } = project(v)
  const top = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
  const leftF = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
  const rightF = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
  const sw = highlight ? 2.4 : 1.6
  const stroke = highlight ?? INK
  return (
    <g>
      <polygon points={top} fill={TOP} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={leftF} fill={LEFTF} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={rightF} fill={RIGHTF} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  )
}

/** A thick left-pointing arrow at (x, y). */
export function ViewArrow({ x, y, color = INK }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <line x1={x + 46} y1={y} x2={x + 14} y2={y} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <polygon points={`${x},${y} ${x + 16},${y - 9} ${x + 16},${y + 9}`} fill={color} />
    </g>
  )
}

export interface IsoStackProps {
  /** Indices of voxels to ring-highlight (used by the explainer when grouping by view column). */
  highlight?: (v: Voxel) => string | undefined
  /** Hide the view arrow (the explainer hides it once it switches to the flat outline). */
  showArrow?: boolean
}

/** The isometric solid + the view arrow — the pristine question figure at its defaults. */
export function IsoStack({ highlight, showArrow = true }: IsoStackProps) {
  const pts = VOXELS.map(project)
  const minX = Math.min(...pts.map((p) => p.sx))
  const maxX = Math.max(...pts.map((p) => p.sx)) + 2 * CX
  const minY = Math.min(...pts.map((p) => p.sy)) - CY
  const maxY = Math.max(...pts.map((p) => p.sy)) + CY + SIZE
  const pad = 22
  const arrowGap = 80 // room on the right for the arrow
  const vbX = minX - pad
  const vbY = minY - pad
  const vbW = maxX - minX + pad * 2 + arrowGap
  const vbH = maxY - minY + pad * 2
  const arrowY = (minY + maxY) / 2 + 18

  return (
    <svg
      viewBox={`${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {paintOrder(VOXELS).map((v, i) => (
        <IsoCube key={i} v={v} highlight={highlight?.(v)} />
      ))}
      {showArrow && <ViewArrow x={maxX + 18} y={arrowY} />}
    </svg>
  )
}

export default function P19G2Q12Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A small solid built of unit cubes drawn in isometric view: a column three cubes tall at the back-left, stepping down to two and then one cube toward the front-right, with a thick arrow on the right pointing left. Which flat outline do you see looking from the arrow?"
    >
      <IsoStack />
    </div>
  )
}
