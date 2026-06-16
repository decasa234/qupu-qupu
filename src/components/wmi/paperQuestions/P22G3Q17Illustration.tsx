/**
 * P22G3Q17Illustration — WMI-22P3A-Q17 (2022 Grade 3 Semifinal)
 *
 * "The L-shaped solid built from cubes is shown. It is transformed by the rule in
 *  the table (cubes added/removed per layer). Which option shows the result?"
 *  Answer D.
 *
 * Source figure (db/seed/wmi/figures/2022-semifinal-g3-a-q17.jpg): a one-cube-deep
 * "L" drawn in isometric — a column 3 cubes tall on the left, and a foot 4 cubes
 * wide along the bottom (the bottom-left cube is shared), i.e. 6 cubes total:
 *
 *   layer (bottom→top):  L1 = 4 cubes (the foot)   L2 = 1 cube   L3 = 1 cube
 *
 * The original answer options were pictures of candidate solids and the rule table
 * was an image; the seed stores them as placeholders. So this static figure draws
 * the GIVEN L-solid plus a schematic "per-layer rule" table — the PROBLEM only —
 * and the explainer derives the resulting solid, pointing to option D.
 *
 * Co-exports an isometric `IsoCubes` primitive (places unit cubes by grid cell)
 * reused by the explainer to rebuild the solid layer by layer.
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe.
 */

const INK = '#3a2630'
const FACE = '#f6cfe0' // front face (pink, matching the source)
const FACE_TOP = '#fbe6f0' // top face (lighter)
const FACE_SIDE = '#e3a8c6' // right face (shaded)

// Isometric basis. A unit cube occupies one grid cell (gx along screen-right-down,
// gy along screen-left-down, gz upward).
const UX = 30 // x-step to the right (+gx)
const UXY = 16 // y-rise of the +gx step
const DX = 30 // x-step to the left for depth (+gy)  — here depth is 1, drawn small
const DXY = 16
const UZ = 38 // cube height (one layer)

/** One cube placed at integer grid (gx, gy, gz). Returns an SVG <g>. */
export function IsoCube({
  gx,
  gy,
  gz,
  ox,
  oy,
}: {
  gx: number
  gy: number
  gz: number
  ox: number
  oy: number
}) {
  // Screen position of the cube's near-bottom corner.
  const sx = ox + gx * UX + gy * DX
  const sy = oy - gx * UXY + gy * DXY - gz * UZ

  // Corner helper: bottom-near origin is (sx, sy).
  const w = UX // cube projected width to the right
  const d = DX // cube projected depth to the left
  const h = UZ

  // Eight key 2D points (only visible faces drawn: top, left-front, right).
  const topNear = [sx, sy - h] as const // top of the near vertical edge
  const topRight = [sx + w, sy - h - UXY] as const
  const topBack = [sx + w - d, sy - h - UXY + DXY] as const
  const topLeft = [sx - d, sy - h + DXY] as const

  const botNear = [sx, sy] as const
  const botRight = [sx + w, sy - UXY] as const
  const botLeft = [sx - d, sy + DXY] as const

  return (
    <g>
      {/* top face */}
      <polygon
        points={`${topNear[0]},${topNear[1]} ${topRight[0]},${topRight[1]} ${topBack[0]},${topBack[1]} ${topLeft[0]},${topLeft[1]}`}
        fill={FACE_TOP}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {/* left-front face */}
      <polygon
        points={`${topNear[0]},${topNear[1]} ${topLeft[0]},${topLeft[1]} ${botLeft[0]},${botLeft[1]} ${botNear[0]},${botNear[1]}`}
        fill={FACE}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {/* right face */}
      <polygon
        points={`${topNear[0]},${topNear[1]} ${topRight[0]},${topRight[1]} ${botRight[0]},${botRight[1]} ${botNear[0]},${botNear[1]}`}
        fill={FACE_SIDE}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </g>
  )
}

export interface CubeCell {
  gx: number
  gy: number
  gz: number
}

/**
 * Render a set of unit cubes in painter's order (far/low first) so nearer/higher
 * cubes overlap correctly. Shared with the explainer.
 */
export function IsoCubes({ cells, ox, oy }: { cells: CubeCell[]; ox: number; oy: number }) {
  // Painter's order: smaller (gx+gy) and gz first; draw back-bottom → front-top.
  const sorted = [...cells].sort(
    (a, b) => a.gz - b.gz || a.gx + a.gy - (b.gx + b.gy) || a.gx - b.gx,
  )
  return (
    <g>
      {sorted.map((c, i) => (
        <IsoCube key={`${c.gx}-${c.gy}-${c.gz}-${i}`} gx={c.gx} gy={c.gy} gz={c.gz} ox={ox} oy={oy} />
      ))}
    </g>
  )
}

/**
 * The GIVEN L-solid, 1 cube deep (gy = 0):
 *   foot:   gx = 0..3, gz = 0   (4 cubes)
 *   column: gx = 0,    gz = 1,2 (2 more cubes)
 */
export const GIVEN_L: CubeCell[] = [
  { gx: 0, gy: 0, gz: 0 },
  { gx: 1, gy: 0, gz: 0 },
  { gx: 2, gy: 0, gz: 0 },
  { gx: 3, gy: 0, gz: 0 },
  { gx: 0, gy: 0, gz: 1 },
  { gx: 0, gy: 0, gz: 2 },
]

export const VIEW_W = 300
export const VIEW_H = 220

export default function P22G3Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Bangun ruang berbentuk L yang tersusun dari kubus satuan: kolom setinggi 3 kubus di kiri dan kaki selebar 4 kubus di bawah. Bangun ini diubah menurut aturan tabel (jumlah kubus yang ditambah atau dikurangi tiap lapisan). Pilih bangun hasilnya."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <IsoCubes cells={GIVEN_L} ox={40} oy={170} />
      </svg>
    </div>
  )
}
