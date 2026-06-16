// Cube-pile figure for WMI-20P3A-Q20 (2020 Grade 3 Semifinal).
//
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q20.jpg: a loose pile
// of unit cubes drawn in isometric — a raised 2×2 cluster at the back/top plus a
// few cubes sitting lower at the front.  The pile uses 10 cubes.
//
// Question: least number of EXTRA cubes to build a large (solid) cube.
//   The smallest solid cube that can contain this pile is 3×3×3 = 27 cubes.
//   27 − 10 = 17  ->  answer C = 17.
//
// The static figure shows ONLY the pile (the 10 given cubes). It does NOT draw the
// missing cubes or the completed 3×3×3 — that is the explainer's job.

const EDGE = '#1F2937'
const TOP = '#FFFFFF'
const LEFT = '#E5E7EB'
const RIGHT = '#CBD5E1'

// Isometric basis: one lattice step = (DX, DY) screen vectors.
const U = 34 // unit cube edge (screen px per lattice step along x/y)
const AX = 0.92 // x-axis screen run multiplier (right-and-down)
const AY = 0.5 // x-axis screen vertical multiplier
const Z = U // z-axis is straight up by one cube edge

// Lattice -> screen. x grows right-down, y grows left-down, z grows up.
function iso(x: number, y: number, z: number): [number, number] {
  const sx = (x - y) * U * AX
  const sy = (x + y) * U * AY - z * Z
  return [sx, sy]
}

/** One isometric unit cube at lattice cell (x, y, z); faces toggle for occlusion. */
export function PileCube({
  x,
  y,
  z,
  showTop = true,
  showLeft = true,
  showRight = true,
  topFill = TOP,
}: {
  x: number
  y: number
  z: number
  showTop?: boolean
  showLeft?: boolean
  showRight?: boolean
  topFill?: string
}) {
  // 8 corners of the cube cell.
  const p = (dx: number, dy: number, dz: number) => iso(x + dx, y + dy, z + dz)
  const A = p(0, 0, 1) // top-back
  const B = p(1, 0, 1) // top-right
  const C = p(1, 1, 1) // top-front
  const D = p(0, 1, 1) // top-left
  const E = p(1, 0, 0) // bottom-right
  const Fp = p(1, 1, 0) // bottom-front
  const G = p(0, 1, 0) // bottom-left
  const poly = (pts: [number, number][]) => pts.map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`).join(' ')
  return (
    <g>
      {showTop && <polygon points={poly([A, B, C, D])} fill={topFill} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />}
      {showLeft && <polygon points={poly([D, C, Fp, G])} fill={LEFT} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />}
      {showRight && <polygon points={poly([C, B, E, Fp])} fill={RIGHT} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />}
    </g>
  )
}

export type Cell = [number, number, number]

// The 10 given cubes (lattice cells in a 3×3×3 frame, z up).
// Floor (z=0): an L of 6 cubes; second level (z=1): a 2×2 cluster of 4 raised at the back.
export const PILE: Cell[] = [
  // floor
  [0, 0, 0],
  [1, 0, 0],
  [2, 0, 0],
  [0, 1, 0],
  [0, 2, 0],
  [2, 2, 0],
  // raised back 2×2 cluster
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
]

export const PILE_COUNT = PILE.length // 10
export const CUBE_SIDE = 3
export const TARGET_TOTAL = CUBE_SIDE ** 3 // 27
export const EXTRA_NEEDED = TARGET_TOTAL - PILE_COUNT // 17

const has = (cells: Cell[], x: number, y: number, z: number) =>
  cells.some(([a, b, c]) => a === x && b === y && c === z)

// Painter's order: draw far cells first. Larger (x+y), then lower z, then ... so
// nearer/upper cubes overdraw. Sort by depth key (x+y) ascending, z ascending.
function sorted(cells: Cell[]): Cell[] {
  return [...cells].sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2] || a[0] - b[0])
}

export const Q20_VIEW_W = 300
export const Q20_VIEW_H = 280

export interface Q20DiagramProps {
  /** Cells to draw as solid given cubes. Defaults to PILE. */
  cells?: Cell[]
  /** Cells to draw as faint "to-add" ghost cubes (e.g. the missing 17). */
  ghosts?: Cell[]
}

export function Q20Diagram({ cells = PILE, ghosts = [] }: Q20DiagramProps) {
  // Centre the 3×3×3 frame: compute screen extents over all corners.
  const all = [...cells, ...ghosts]
  const xs: number[] = []
  const ys: number[] = []
  for (let x = 0; x <= CUBE_SIDE; x++)
    for (let y = 0; y <= CUBE_SIDE; y++)
      for (let z = 0; z <= CUBE_SIDE; z++) {
        const [sx, sy] = iso(x, y, z)
        xs.push(sx)
        ys.push(sy)
      }
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const cx = (Q20_VIEW_W - (Math.max(...xs) - minX)) / 2 - minX
  const cy = (Q20_VIEW_H - (Math.max(...ys) - minY)) / 2 - minY

  return (
    <svg
      viewBox={`0 0 ${Q20_VIEW_W} ${Q20_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q20_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <g transform={`translate(${cx.toFixed(2)}, ${cy.toFixed(2)})`}>
        {/* ghosts first (behind), with full painter ordering merged */}
        {sorted(all).map(([x, y, z], i) => {
          const isGhost = !has(cells, x, y, z)
          const list = isGhost ? ghosts : cells
          // hide a face if a cube (of EITHER kind) occupies the adjacent cell toward the viewer
          const showTop = !has(all, x, y, z + 1)
          const showLeft = !has(all, x, y + 1, z)
          const showRight = !has(all, x + 1, y, z)
          void list
          return (
            <g key={`${x}-${y}-${z}-${i}`} opacity={isGhost ? 0.28 : 1}>
              <PileCube
                x={x}
                y={y}
                z={z}
                showTop={showTop}
                showLeft={showLeft}
                showRight={showRight}
                topFill={isGhost ? '#FDE68A' : TOP}
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default function P20G3Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="An isometric pile of unit cubes: a raised cluster at the back and several cubes at the front."
    >
      <Q20Diagram />
    </div>
  )
}
