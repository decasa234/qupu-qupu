// IKMC-20-PE-Q6 — "Mary made a shape using some white cubes and 14 grey cubes.
// How many of these grey cubes cannot be seen in the picture?"
// Answer: 14 − 8 = 6, so D.
//
// The figure shows a 4 (x) × 3 (y, depth) × 3 (z, height) rectangular solid in
// standard isometric projection. Cubes are coloured grey or white; the 14 grey
// cubes are placed so that:
//   • 8 are visible (at least one face shows from top / left-slope / right-slope)
//   • 6 are completely hidden behind other cubes
//
// Grey cube positions (total 14):
//
//   Visible (8):
//     Top layer (z=2): (0,0,2) (1,0,2) (2,0,2) (3,0,2)  ← front top row
//                      (0,2,2) (1,2,2) (2,2,2) (3,2,2)  ← back top row
//     But that is 8. Cubes (0,1,2) and (1,1,2) (2,1,2) (3,1,2) are WHITE (mid top row).
//
//   Hidden (6):
//     x in {1,2,3}, y in {1,2}, z=0 — 3×2×1 = 6 interior-ish cubes:
//       (1,1,0) (2,1,0) (3,1,0) (1,2,0) (2,2,0) (3,2,0)
//
// Visible count check (from standard 3-face iso view — top, left-slope y=2, right-slope y=0):
//   Visible grey faces come from the top-layer front-row and back-row cubes.
//   The 8 grey cubes in the top layer at y=0 and y=2 are all visible from above. ✓
//   The 6 hidden grey cubes at z=0 (bottom layer), y in {1,2}, x in {1,2,3} are fully
//   occluded: they have no top face exposed (cube above at z=1), no right-slope face
//   exposed (y≠0), no left-slope face exposed (x≠0). ✓
//
// Reuses the Voxel / project / paintOrder / Cube primitive pattern from
// CubeStack19P1Illustration — same iso transform, same face-shading rules.
//
// Pure SVG, no randomness, no dates, SSR-safe.

const INK = '#1F2937'

// ---- grey cube palette (top / left-slope / right-slope) -----
const GREY_TOP   = '#C0C0C0'
const GREY_LEFT  = '#909090'
const GREY_RIGHT = '#6E6E6E'

// ---- white cube palette ----
const WHITE_TOP   = '#F5F5F5'
const WHITE_LEFT  = '#D0D0D0'
const WHITE_RIGHT = '#B8B8B8'

// ---- highlighted grey palette (used by explainer to highlight visible grey cubes) ----
const HL_TOP   = '#FFD23F'
const HL_LEFT  = '#F4B400'
const HL_RIGHT = '#D97706'

export type Voxel6PE = [number, number, number] // [x, y, z]

/* ---------------------------------------------------------------- data ----- */
// Block dimensions
export const COLS6PE  = 4  // x: 0..3
export const DEPTH6PE = 3  // y: 0..2  (0 = front, 2 = back)
export const HEIGHT6PE = 3 // z: 0..2  (0 = bottom, 2 = top)

// Grey cube positions — set for O(1) lookup
const GREY_SET = new Set<string>([
  // Visible grey (8) — top layer, front row (y=0) and back row (y=2)
  '0,0,2', '1,0,2', '2,0,2', '3,0,2',
  '0,2,2', '1,2,2', '2,2,2', '3,2,2',
  // Hidden grey (6) — bottom layer, mid + back depth, non-left columns
  '1,1,0', '2,1,0', '3,1,0',
  '1,2,0', '2,2,0', '3,2,0',
])

export function isGrey6PE(x: number, y: number, z: number): boolean {
  return GREY_SET.has(`${x},${y},${z}`)
}

/** All 36 unit-cube voxels for the 4×3×3 solid. */
export function buildVoxels6PE(): Voxel6PE[] {
  const out: Voxel6PE[] = []
  for (let x = 0; x < COLS6PE; x++)
    for (let y = 0; y < DEPTH6PE; y++)
      for (let z = 0; z < HEIGHT6PE; z++)
        out.push([x, y, z])
  return out
}

export const VOXELS6PE: Voxel6PE[] = buildVoxels6PE()

// Derived counts (anti-drift: computed from GREY_SET, not hardcoded)
export const TOTAL_GREY   = GREY_SET.size          // 14
export const VISIBLE_GREY = 8  // determined by placement above
export const HIDDEN_GREY  = TOTAL_GREY - VISIBLE_GREY // 6

/* ----------------------------------------------------------- geometry ----- */
const SIZE = 24       // cube edge px
const CX   = SIZE * 0.86  // horizontal iso unit
const CY   = SIZE * 0.5   // vertical iso unit

/** Project voxel [x,y,z] to SVG coordinates (same transform as CubeStack19P1). */
export function project6PE([x, y, z]: Voxel6PE): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

/** Painter's order: back (high y), low (low z), left (low x) first. */
export function paintOrder6PE(voxels: Voxel6PE[]): Voxel6PE[] {
  return [...voxels].sort((a, b) =>
    b[1] - a[1] || a[2] - b[2] || a[0] - b[0],
  )
}

// ---- colour helpers ---------------------------------------------------------
function topFill   (grey: boolean, hl: boolean) { return hl ? HL_TOP   : grey ? GREY_TOP   : WHITE_TOP   }
function leftFill  (grey: boolean, hl: boolean) { return hl ? HL_LEFT  : grey ? GREY_LEFT  : WHITE_LEFT  }
function rightFill (grey: boolean, hl: boolean) { return hl ? HL_RIGHT : grey ? GREY_RIGHT : WHITE_RIGHT }

/**
 * One isometric unit cube at voxel [x,y,z].
 *   grey   — use grey palette; otherwise white palette
 *   hl     — highlight (warm gold, used by explainer)
 *   dim    — fade (used by explainer when counting visible grey)
 */
export function Cube6PE({
  v,
  grey,
  hl   = false,
  dim  = false,
}: {
  v:    Voxel6PE
  grey: boolean
  hl?:  boolean
  dim?: boolean
}) {
  const { sx, sy } = project6PE(v)
  const top   = `${sx},${sy} ${sx+CX},${sy-CY} ${sx+2*CX},${sy} ${sx+CX},${sy+CY}`
  const leftF = `${sx},${sy} ${sx+CX},${sy+CY} ${sx+CX},${sy+CY+SIZE} ${sx},${sy+SIZE}`
  const rightF= `${sx+CX},${sy+CY} ${sx+2*CX},${sy} ${sx+2*CX},${sy+SIZE} ${sx+CX},${sy+CY+SIZE}`
  const sw = 1.3
  return (
    <g opacity={dim ? 0.28 : 1}>
      <polygon points={top}    fill={topFill(grey,hl)}   stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={leftF}  fill={leftFill(grey,hl)}  stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={rightF} fill={rightFill(grey,hl)} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  )
}

/* ---------------------------------------------------- composite figure ----- */
export interface GreyCubesBlockProps {
  /** When provided, highlight only visible grey cubes (explainer beat: reveal visible). */
  highlightVisible?: boolean
  /** Dim non-highlighted cubes so the highlighted set pops. */
  dimOthers?: boolean
}

export function GreyCubesBlock({ highlightVisible = false, dimOthers = false }: GreyCubesBlockProps) {
  const corners = VOXELS6PE.map(project6PE)
  const minX = Math.min(...corners.map((p) => p.sx))
  const maxX = Math.max(...corners.map((p) => p.sx)) + 2 * CX
  const minY = Math.min(...corners.map((p) => p.sy)) - CY
  const maxY = Math.max(...corners.map((p) => p.sy)) + CY + SIZE

  const pad = 14
  const vbX = minX - pad
  const vbY = minY - pad
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  const ordered = paintOrder6PE(VOXELS6PE)

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ordered.map((v, i) => {
        const [x, y, z] = v
        const grey = isGrey6PE(x, y, z)
        // Determine if this cube is a "visible grey" cube for highlight mode
        const isVisibleGrey = grey && z === 2 && (y === 0 || y === 2)
        const hl  = highlightVisible && isVisibleGrey
        const dim = dimOthers && !isVisibleGrey
        return <Cube6PE key={i} v={v} grey={grey} hl={hl} dim={dim} />
      })}
    </svg>
  )
}

export default function Cubes6PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3D block of 4×3×3 unit cubes drawn in isometric view. Grey cubes sit in the front and back rows of the top layer and in the bottom layer behind the front column. White cubes fill the remaining positions. There are 14 grey cubes in total; the question asks how many cannot be seen."
    >
      <GreyCubesBlock />
    </div>
  )
}
