// 3D unit-cube stack figure for WMI-22P2A-Q17 (2022 Semifinal Grade 2, Paper A).
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g2-a-q17.jpg: a structure of unit
// cubes on a 3×3 base. The question asks for the 3×3 table of stack heights (how many
// cubes sit on each base square). Verified against the scan and the answer key, the
// heights are (rows back→front, cols left→right):
//
//     [2, 2, 1]
//     [2, 1, 1]
//     [0, 1, 2]
//
// (one base square is empty, height 0) → answer B.
//
// The static figure draws ONLY the 3D structure (the problem). It never draws the
// height table and never reveals the letter — that is the explainer's job, post-
// answer, via the co-exported CubeStack22G2 + HeightTable22G2 primitives.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#7A4A5A'
const TOP = '#F6DCE8' // top face (lightest)
const LEFT_F = '#F2C9DC' // left face
const RIGHT_F = '#E3A8C2' // right face (darkest) — matches the scan's shading

// The verified 3×3 height map, rows back→front, cols left→right.
export const HEIGHTS: number[][] = [
  [2, 2, 1],
  [2, 1, 1],
  [0, 1, 2],
]

// --- isometric basis --------------------------------------------------------
const HW = 30 // half-width of a cube's top rhombus (col / row run)
const HH = 16 // half-height of the top rhombus
const CH = 36 // cube vertical height (one level)

// Screen offset of grid step. col+ → right & down; row+ (toward viewer) → left & down.
function project(col: number, row: number, level: number, ox: number, oy: number) {
  const x = ox + (col - row) * HW
  const y = oy + (col + row) * HH - level * CH
  return [x, y] as const
}

/** Draw a single unit cube whose BOTTOM-CENTRE sits at grid (col,row,level). */
function UnitCube({ col, row, level, ox, oy }: { col: number; row: number; level: number; ox: number; oy: number }) {
  // top rhombus corners (at this cube's top = level+1 surface)
  const [tcx, tcy] = project(col, row, level + 1, ox, oy)
  const top = [
    [tcx, tcy - HH], // back
    [tcx + HW, tcy], // right
    [tcx, tcy + HH], // front
    [tcx - HW, tcy], // left
  ]
  // bottom rhombus corners at this cube's base
  const [bcx, bcy] = project(col, row, level, ox, oy)
  const front = [tcx, tcy + HH] // top-front
  const frontB = [bcx, bcy + HH] // bottom-front
  const right = [tcx + HW, tcy]
  const rightB = [bcx + HW, bcy]
  const left = [tcx - HW, tcy]
  const leftB = [bcx - HW, bcy]

  return (
    <g>
      {/* left face */}
      <polygon
        points={`${left[0]},${left[1]} ${front[0]},${front[1]} ${frontB[0]},${frontB[1]} ${leftB[0]},${leftB[1]}`}
        fill={LEFT_F}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {/* right face */}
      <polygon
        points={`${front[0]},${front[1]} ${right[0]},${right[1]} ${rightB[0]},${rightB[1]} ${frontB[0]},${frontB[1]}`}
        fill={RIGHT_F}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {/* top face */}
      <polygon
        points={top.map((p) => `${p[0]},${p[1]}`).join(' ')}
        fill={TOP}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </g>
  )
}

export const STACK_VIEW_W = 300
export const STACK_VIEW_H = 210

export interface CubeStack22G2Props {
  /** Which base cells (as "row,col") to spotlight; others dim. Empty = all bright. */
  highlightCells?: string[]
}

/**
 * The isometric 3D structure. Cubes are painted back-to-front, bottom-to-top so
 * occlusion is correct. Reusable by the explainer.
 */
export function CubeStack22G2({ highlightCells = [] }: CubeStack22G2Props) {
  const ox = STACK_VIEW_W / 2
  const oy = 100
  const dimming = highlightCells.length > 0

  // Build a draw list and sort by painter's order:
  // smaller (row+col) is farther back → drawn first; within a stack, lower level first.
  type Item = { col: number; row: number; level: number; key: string; on: boolean }
  const items: Item[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const h = HEIGHTS[r][c]
      const on = !dimming || highlightCells.includes(`${r},${c}`)
      for (let lvl = 0; lvl < h; lvl++) {
        items.push({ col: c, row: r, level: lvl, key: `${r}-${c}-${lvl}`, on })
      }
    }
  }
  items.sort((a, b) => {
    const da = a.row + a.col
    const db = b.row + b.col
    if (da !== db) return da - db
    return a.level - b.level
  })

  return (
    <svg
      viewBox={`0 0 ${STACK_VIEW_W} ${STACK_VIEW_H}`}
      width="100%"
      style={{ maxWidth: STACK_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {items.map((it) => (
        <g key={it.key} opacity={it.on ? 1 : 0.18}>
          <UnitCube col={it.col} row={it.row} level={it.level} ox={ox} oy={oy} />
        </g>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Reusable 3×3 height-table primitive (used by the explainer to fill in B).
// ---------------------------------------------------------------------------

export interface HeightTable22G2Props {
  /** Values to show; null in a cell = still blank. */
  values: Array<Array<number | null>>
  /** Cell "row,col" to outline as just-filled. */
  active?: string | null
}

export function HeightTable22G2({ values, active = null }: HeightTable22G2Props) {
  const CELL = 50
  const PAD = 12
  const W = 3 * CELL + PAD * 2
  const H = 3 * CELL + PAD * 2
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {values.map((rowVals, r) =>
        rowVals.map((v, c) => {
          const x = PAD + c * CELL
          const y = PAD + r * CELL
          const isActive = active === `${r},${c}`
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                fill={v === null ? '#F9FAFB' : isActive ? '#FCE7F3' : '#FFFFFF'}
                stroke={isActive ? '#DB2777' : '#9CA3AF'}
                strokeWidth={isActive ? 3 : 1.8}
              />
              {v !== null && (
                <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={v === 0 ? '#DB2777' : '#374151'}>
                  {v}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

const ARIA =
  'Bangun 3D dari kubus satuan di atas alas 3 kali 3. ' +
  'Untuk setiap kotak alas, hitung berapa kubus yang ditumpuk di atasnya, lalu pilih tabel tinggi yang benar.'

export default function P22G2Q17Illustration() {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={ARIA}>
      <CubeStack22G2 />
    </div>
  )
}
