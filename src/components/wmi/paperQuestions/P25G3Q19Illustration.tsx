// Painted-cube solid for WMI-25P3A-Q19 (2025 Semifinal Grade 3, Paper A).
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g3-a-q19.jpg: a solid built
// from 10 unit cubes (edge 1 cm), drawn in isometric, whose whole outer surface is
// painted red. The question asks for the 3-digit number abc where
//   a = #cubes with exactly 4 painted faces,
//   b = #cubes with exactly 3 painted faces,
//   c = #cubes with exactly 2 painted faces.
//
// The cube layout (x = right, y = depth/back, z = up), verified by a face-count
// solver to give exactly a=6, b=2, c=2 (abc = 622, answer A), with NO cube having
// 0/1/5/6 painted faces:
//
//   z = 0 (ground):   y0: # # #     y1: # # #     y2: # . .
//   z = 1 (upper):    y1: # # .     y2: # . .
//
// i.e. a 3-wide front row, a back row stepping up on the left, a tall 2-deep tower
// at the back-left and a single mid ledge — a staircase rising toward the back-left.
//
// The figure shows the SETUP ONLY (the 10-cube solid). It never marks which cubes
// have how many painted faces — that is the explainer's job.

const INK = '#5A3A36' // brown outline, matching the scan
const TOP = '#FCE9E5' // top face — lightest
const LEFT = '#FBDDD8' // front/left face — mid pink
const RIGHT = '#F6CFC8' // right face — deeper pink

/* ----------------------------------------------------------------- data ----- */
export type Cube = readonly [number, number, number] // [x, y, z]

// The 10-cube solid (see header for the verified layout).
export const Q19_CUBES: readonly Cube[] = [
  [0, 0, 0],
  [1, 0, 0],
  [2, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [2, 1, 0],
  [0, 2, 0],
  [0, 1, 1],
  [1, 1, 1],
  [0, 2, 1],
] as const

const NEIGHBOURS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

const keyOf = (c: readonly [number, number, number]) => `${c[0]},${c[1]},${c[2]}`

/** Painted faces of each cube = faces with no neighbouring cube (outer surface). */
export function paintedFaces(cubes: readonly Cube[]): Map<string, number> {
  const present = new Set(cubes.map(keyOf))
  const out = new Map<string, number>()
  for (const [x, y, z] of cubes) {
    let n = 0
    for (const [dx, dy, dz] of NEIGHBOURS) {
      if (!present.has(keyOf([x + dx, y + dy, z + dz]))) n += 1
    }
    out.set(keyOf([x, y, z]), n)
  }
  return out
}

const FACES = paintedFaces(Q19_CUBES)
export const A_FOUR = [...FACES.values()].filter((v) => v === 4).length // 6
export const B_THREE = [...FACES.values()].filter((v) => v === 3).length // 2
export const C_TWO = [...FACES.values()].filter((v) => v === 2).length // 2
export const ABC = `${A_FOUR}${B_THREE}${C_TWO}` // "622"

/* ------------------------------------------------------------ projection ---- */
// Isometric projection: x runs down-right, y runs down-left (depth), z runs up.
const S = 34 // cube edge in px
const KX = S * 0.86 // horizontal run per unit
const KY = S * 0.5 // vertical run per unit

function project(x: number, y: number, z: number): [number, number] {
  return [(x - y) * KX, (x + y) * KY - z * S]
}

/* ----------------------------------------------------------- primitive ------ */
// One isometric unit cube. `showTop`/`showRight`/`showFront` toggle which of the
// three visible faces are drawn (a face is hidden where a neighbour covers it).
// `highlight` tints the whole cube (used by the explainer to mark a counted cube)
// and `badge` prints a small face-count chip on the front face.
export function IsoUnitCube({
  x,
  y,
  z,
  showTop = true,
  showRight = true,
  showFront = true,
  highlight,
  badge,
}: {
  x: number
  y: number
  z: number
  showTop?: boolean
  showRight?: boolean
  showFront?: boolean
  highlight?: string
  badge?: number
}) {
  // 8 corners
  const p = (dx: number, dy: number, dz: number) => project(x + dx, y + dy, z + dz)
  const c000 = p(0, 0, 0)
  const c100 = p(1, 0, 0)
  const c110 = p(1, 1, 0)
  const c001 = p(0, 0, 1)
  const c101 = p(1, 0, 1)
  const c111 = p(1, 1, 1)
  const c011 = p(0, 1, 1)

  const poly = (pts: Array<[number, number]>) => pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')

  const topFill = highlight ?? TOP
  const leftFill = highlight ?? LEFT
  const rightFill = highlight ?? RIGHT

  // Front face centre (for the badge).
  const fcx = (c000[0] + c100[0] + c101[0] + c001[0]) / 4
  const fcy = (c000[1] + c100[1] + c101[1] + c001[1]) / 4

  return (
    <g>
      {showTop && <polygon points={poly([c001, c101, c111, c011])} fill={topFill} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />}
      {showRight && <polygon points={poly([c100, c110, c111, c101])} fill={rightFill} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />}
      {showFront && <polygon points={poly([c000, c100, c101, c001])} fill={leftFill} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />}
      {badge != null && (
        <g>
          <circle cx={fcx} cy={fcy} r={9.5} fill="#FFFFFF" stroke="#1F2937" strokeWidth={1.6} />
          <text x={fcx} y={fcy} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill="#1F2937">
            {badge}
          </text>
        </g>
      )}
    </g>
  )
}

/* ------------------------------------------------------------- figure -------- */
export interface CubeSolidProps {
  /** Optional highlight colour per cube key "x,y,z" (explainer use). */
  highlights?: Record<string, string>
  /** Optional face-count badge per cube key "x,y,z" (explainer use). */
  badges?: Record<string, number>
}

export function CubeSolid19({ highlights = {}, badges = {} }: CubeSolidProps) {
  const present = new Set(Q19_CUBES.map(keyOf))

  // Painter's order: draw lower z first, and within a layer draw the cubes that are
  // farther from the viewer first (larger x+y, then... screen depth). Sorting by
  // (z asc, (x+y) asc) draws back-to-front so nearer cubes overdraw correctly.
  const order = [...Q19_CUBES].sort((a, b) => a[2] - b[2] || a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0])

  // Extents for the viewBox.
  const xs: number[] = []
  const ys: number[] = []
  for (const [x, y, z] of Q19_CUBES) {
    for (const dz of [0, 1]) {
      for (const dx of [0, 1]) {
        for (const dy of [0, 1]) {
          const [px, py] = project(x + dx, y + dy, z + dz)
          xs.push(px)
          ys.push(py)
        }
      }
    }
  }
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const pad = 14
  const vbX = minX - pad
  const vbY = minY - pad
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  return (
    <svg
      viewBox={`${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {order.map(([x, y, z]) => {
        const above = present.has(keyOf([x, y, z + 1]))
        const right = present.has(keyOf([x + 1, y, z]))
        const front = present.has(keyOf([x, y - 1, z]))
        const k = keyOf([x, y, z])
        return (
          <IsoUnitCube
            key={k}
            x={x}
            y={y}
            z={z}
            showTop={!above}
            showRight={!right}
            showFront={!front}
            highlight={highlights[k]}
            badge={badges[k]}
          />
        )
      })}
    </svg>
  )
}

export default function P25G3Q19Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Bangun ruang dari 10 kubus satuan (rusuk 1 cm), digambar isometrik, seluruh permukaannya dicat merah. Berbentuk tangga: deretan depan tiga kubus, menara dua kubus tinggi di belakang-kiri, dan undakan satu kubus di tengah."
    >
      <CubeSolid19 />
    </div>
  )
}
