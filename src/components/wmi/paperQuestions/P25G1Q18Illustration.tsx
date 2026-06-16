// Painted-cubes figure for WMI-25P1A-Q18 (2025 Semifinal Grade 1 Paper A).
//
// "A solid is built from 10 small cubes. Its whole surface is painted red. How
//  many cubes have EXACTLY 4 faces painted red?"  Choices 6 / 5 / 4 / 3 / 2;
//  answer = A (6).
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q18.jpg as a clean
// isometric redraw (the JPG is NOT embedded). The scan shows a stepped corner
// solid of 10 unit cubes. A small cube is painted only on the faces that face
// outward; a glued (shared) face is hidden and stays unpainted. So:
//
//   painted faces = 6 - (number of neighbouring cubes)
//   EXACTLY 4 painted  <=>  glued to EXACTLY 2 neighbours.
//
// The solid is laid out as a HEIGHT MAP over its footprint (x = right, y = depth,
// z = up). Each column rests on the floor (fully supported). The 10 cubes split
// by neighbour-count so that EXACTLY 6 of them touch 2 neighbours -> 6 cubes show
// 4 red faces (answer A). The verified four-painted voxels are listed in
// FOUR_PAINTED below; the explainer glows them one at a time.
//
// The static figure shows ONLY the problem: it never paints/marks any cube and
// never prints the count. Highlighting the four-painted cubes is the explainer's
// job, via the co-exported IsoSolid primitive (its `litFour` prop).
//
// Pure render, SSR-safe, deterministic — no window/document/random/dates.
// House-style reference: IsoCubeStack in CubeStack19P1Illustration.tsx.

const INK = '#7A2E1A'

// Isometric face palette (top lightest, left mid, right darkest) — warm pink to
// match the scan's red-paint subject.
const TOP = '#FBE0E0'
const LEFT = '#F4B9B9'
const RIGHT = '#E78A8A'

// Warm "lit" palette to glow the four-painted cubes as they are found.
const LIT_TOP = '#FFD23F'
const LIT_LEFT = '#F4B400'
const LIT_RIGHT = '#D97706'

export type Voxel = [number, number, number]

/* ---------------------------------------------------------------- data ----- */
// Column height map. Key "x,y" → number of stacked cubes. The footprint is an
// irregular staircase: deepest/tallest at the back-left, stepping down to single
// cubes at the front-right.
export const HEIGHTS: Record<string, number> = {
  '0,0': 1, '0,1': 2, '0,2': 2,
  '1,0': 1, '1,1': 2,
  '2,0': 1, '2,1': 1,
}

export const COLS = 3 // x: 0..2
export const DEPTH = 3 // y: 0..2
export const MAX_H = 2 // tallest column

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
export const TOTAL_CUBES = VOXELS.length // 10

/** The six cubes touching exactly 2 neighbours → exactly 4 faces painted. */
export const FOUR_PAINTED: Voxel[] = [
  [0, 0, 0],
  [0, 2, 0],
  [0, 2, 1],
  [1, 1, 1],
  [2, 0, 0],
  [2, 1, 0],
]
export const FOUR_PAINTED_COUNT = FOUR_PAINTED.length // 6

function isFour(v: Voxel): boolean {
  return FOUR_PAINTED.some(([x, y, z]) => x === v[0] && y === v[1] && z === v[2])
}

/* ----------------------------------------------------------- geometry ----- */
const SIZE = 30 // cube edge in px
const CX = SIZE * 0.86 // horizontal run of one iso unit
const CY = SIZE * 0.5 // vertical run of one iso unit

/** Project a voxel to the SVG plane (same iso transform as IsoCubeStack). */
function project([x, y, z]: Voxel): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

/** Painter's order: far cubes (back, low, left) first so near cubes overdraw them. */
function paintOrder(voxels: Voxel[]): Voxel[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

/**
 * One isometric unit cube at voxel (x, y, z). `lit` swaps in the warm palette to
 * mark a four-painted cube; `dim` fades the other cubes so the lit ones stand out.
 */
export function Cube({ v, lit = false, dim = false }: { v: Voxel; lit?: boolean; dim?: boolean }) {
  const { sx, sy } = project(v)
  const top = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
  const leftF = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
  const rightF = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
  return (
    <g opacity={dim ? 0.32 : 1}>
      <polygon points={top} fill={lit ? LIT_TOP : TOP} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={leftF} fill={lit ? LIT_LEFT : LEFT} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={rightF} fill={lit ? LIT_RIGHT : RIGHT} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  )
}

export interface IsoSolidProps {
  /** When true, glow the six four-painted cubes and dim the rest. */
  litFour?: boolean
  /** Reveal only the first N four-painted cubes (for the running count). */
  revealCount?: number
}

/**
 * The 10-cube solid drawn in isometric view. At its defaults it is the pristine
 * question figure — the plain solid, no marks, no count. The explainer passes
 * `litFour` / `revealCount` to glow the four-painted cubes as it finds them.
 */
export function IsoSolid({ litFour = false, revealCount }: IsoSolidProps) {
  const corners = VOXELS.map(project)
  const minX = Math.min(...corners.map((p) => p.sx))
  const maxX = Math.max(...corners.map((p) => p.sx)) + 2 * CX
  const minY = Math.min(...corners.map((p) => p.sy)) - CY
  const maxY = Math.max(...corners.map((p) => p.sy)) + CY + SIZE

  const pad = 20
  const vbX = minX - pad
  const vbY = minY - pad - SIZE * 0.5 // headroom so the top never clips
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  const reveal = revealCount ?? FOUR_PAINTED.length

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {paintOrder(VOXELS).map((v, i) => {
        const four = isFour(v)
        const revealedIndex = FOUR_PAINTED.findIndex(([x, y, z]) => x === v[0] && y === v[1] && z === v[2])
        const lit = litFour && four && revealedIndex < reveal
        const dim = litFour && !lit
        return <Cube key={i} v={v} lit={lit} dim={dim} />
      })}
    </svg>
  )
}

export default function P25G1Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A solid built from 10 small cubes, drawn in isometric view as a stepped corner shape. Its whole outer surface is painted red. No cubes are marked and no count is shown."
    >
      <IsoSolid />
    </div>
  )
}
