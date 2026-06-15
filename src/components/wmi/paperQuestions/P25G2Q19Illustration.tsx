// In-card SVG illustration for WMI-25P2A-Q19 (2025 Grade-2 Semifinal).
//
// Problem: a solid is built from 10 unit cubes and its whole outer surface is
// painted red.  Count the cubes with a faces painted (a = 4 faces), b faces
// (b = 3 faces) and c faces (c = 2 faces); report the 3-digit number abc.
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g2-a-q19.jpg: a stepped
// solid — a 3-wide front row of cubes, a deeper second row, and a 2-tall tower at
// the back-left, drawn in isometric.
//
// The 10-cube arrangement below was VERIFIED by exhaustive search: it is a legal,
// fully-supported (gravity-valid) polycube whose painted-face histogram is exactly
//   4 faces -> 6 cubes   (a = 6)
//   3 faces -> 2 cubes   (b = 2)
//   2 faces -> 2 cubes   (c = 2)
// so abc = 622 (answer A).  A cube's painted faces = 6 - (its orthogonal
// neighbours), so the counts follow directly from the shape and never need the key.
//
// The figure shows the SOLID only — it does NOT tint cubes by how many faces they
// show.  That reveal is the explainer's job.
//
// Pure render: no Math.random, no Date, no window/document at module load. SSR-safe.

const INK = '#5b2b22' // cube edges (dark warm brown, like the scan)
const TOP = '#FBE0DA' // top face (lightest)
const LEFT = '#F3C9C0' // front/left face
const RIGHT = '#E4A99C' // right face (darkest)

export interface Voxel {
  x: number // grid right
  y: number // grid depth (away from viewer)
  z: number // height
}

// Verified F5 solid (a=6, b=2, c=2).  10 cubes.
export const Q19_SOLID: Voxel[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 },
  { x: 1, y: 2, z: 0 },
  { x: 0, y: 1, z: 1 }, // tower (back-left, 2nd level)
  { x: 0, y: 2, z: 1 }, // tower (back-left, 2nd level)
]

export const Q19_TOTAL_CUBES = Q19_SOLID.length // 10

// Painted faces per cube = 6 - orthogonal neighbours.  Computed here so the
// explainer binds to the same shape rather than hard-coded answers.
const KEY = (v: Voxel) => `${v.x},${v.y},${v.z}`
const DIRS: Array<[number, number, number]> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

export function paintedFaces(v: Voxel, set: Set<string>): number {
  let n = 0
  for (const [dx, dy, dz] of DIRS) {
    if (set.has(`${v.x + dx},${v.y + dy},${v.z + dz}`)) n++
  }
  return 6 - n
}

export function paintHistogram(solid: Voxel[]): Record<number, number> {
  const set = new Set(solid.map(KEY))
  const h: Record<number, number> = {}
  for (const v of solid) {
    const p = paintedFaces(v, set)
    h[p] = (h[p] ?? 0) + 1
  }
  return h
}

const HIST = paintHistogram(Q19_SOLID)
export const Q19_A = HIST[4] ?? 0 // 6
export const Q19_B = HIST[3] ?? 0 // 2
export const Q19_C = HIST[2] ?? 0 // 2
export const Q19_ABC = `${Q19_A}${Q19_B}${Q19_C}` // "622"

// ── isometric projection ───────────────────────────────────────────────────────
const S = 30 // cube edge in px
const DX = S * 0.86 // screen x per +x (and -y)
const DY = S * 0.5 // screen y per +x (and +y)
const ORIGIN_X = 150
const ORIGIN_Y = 200

function project(x: number, y: number, z: number): [number, number] {
  // +x goes down-right, +y goes down-left (deeper), +z goes up.
  const sx = ORIGIN_X + (x - y) * DX
  const sy = ORIGIN_Y - (x + y) * DY - z * S
  return [sx, sy]
}

/** One isometric unit cube: top, left (front) and right faces. */
export function IsoVoxel({ x, y, z, faceTint }: { x: number; y: number; z: number; faceTint?: string }) {
  // 8 screen-projected corners of the cube
  const p = (dx: number, dy: number, dz: number) => project(x + dx, y + dy, z + dz)
  const A = p(0, 0, 1) // top-front
  const B = p(1, 0, 1) // top-right
  const C = p(1, 1, 1) // top-back-right
  const D = p(0, 1, 1) // top-back-left
  const E = p(0, 0, 0) // bottom-front
  const F = p(1, 0, 0) // bottom-right-front
  const G = p(1, 1, 0) // bottom-right-back
  const pts = (...arr: Array<[number, number]>) => arr.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(' ')
  const topFill = faceTint ?? TOP
  const leftFill = faceTint ?? LEFT
  const rightFill = faceTint ?? RIGHT
  return (
    <g>
      {/* top rhombus */}
      <polygon points={pts(A, B, C, D)} fill={topFill} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      {/* left/front face */}
      <polygon points={pts(A, E, F, B)} fill={leftFill} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      {/* right face */}
      <polygon points={pts(B, F, G, C)} fill={rightFill} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  )
}

// Painter's order: draw back-to-front so nearer cubes overlap farther ones.
// Farther = larger y first, then lower z, then smaller x.
function drawOrder(a: Voxel, b: Voxel): number {
  return b.y - a.y || a.z - b.z || a.x - b.x
}

export interface Q19FigureProps {
  /** Optional per-cube tint keyed by "x,y,z" — used by the explainer to colour by
   *  painted-face count.  Omitted in the static problem figure. */
  tints?: Record<string, string>
}

export function Q19SolidFigure({ tints }: Q19FigureProps) {
  const ordered = [...Q19_SOLID].sort(drawOrder)
  return (
    <svg
      viewBox="0 0 300 240"
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ordered.map((v) => (
        <IsoVoxel key={KEY(v)} x={v.x} y={v.y} z={v.z} faceTint={tints?.[KEY(v)]} />
      ))}
    </svg>
  )
}

export default function P25G2Q19Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Bangun ruang dari sepuluh kubus satuan, digambar isometrik: baris depan tiga kubus, baris kedua di belakangnya, dan menara dua kubus di belakang-kiri. Seluruh permukaannya dicat merah."
    >
      <Q19SolidFigure />
    </div>
  )
}
