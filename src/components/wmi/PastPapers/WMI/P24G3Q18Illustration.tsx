// "Two given blocks" figure for WMI-24P3A-Q18 (2024 Grade-3 Semifinal).
//
// The body asks: "Which solid figure in the options is NOT formed by the two given
// blocks below?" (answer C). The source scan
// (db/seed/wmi/figures/2024-semifinal-g3-a-q18.jpg) shows a unit-cube solid in
// isometric; the original five options were images, so the seed's choice texts are
// placeholders ("(see figure C)" etc.).
//
// Per the build brief for placeholder-image options, this figure illustrates the
// STEM — the two given building blocks the answers must be made from — and the
// explainer derives and clearly indicates the correct option letter (C).
//
// The two blocks are L-shaped tetracube pieces (4 unit cubes each); together they
// pack into an 8-cube solid. They are drawn in isometric. The figure shows the
// PROBLEM ONLY (the two blocks, never which option fails). A reusable <PolyCube>
// isometric primitive is co-exported for the explainer.

const INK = '#1F2937'
const TOP = '#BFE3C6' // top face (lightest)
const LEFT_FACE = '#A7D7B0' // front/left face
const RIGHT_FACE = '#8FC79B' // right face (darkest)
const TOP_B = '#CFE9D7'
const LEFT_B = '#B8DEC0'
const RIGHT_B = '#9ECFA9'

/* ---------------------------------------------------------- primitive ------ */
// Isometric unit cube. The front (left) face is an axis-aligned square at (fx,fy);
// the one-cube depth runs up-and-right, exposing the top rhombus and right face.
const SIZE = 26
const CX = SIZE * 0.6 // horizontal run of depth
const CY = SIZE * 0.34 // vertical run of depth

function IsoCube({
  fx,
  fy,
  showTop = true,
  showRight = true,
  tone = 'a',
}: {
  fx: number
  fy: number
  showTop?: boolean
  showRight?: boolean
  tone?: 'a' | 'b'
}) {
  const top = tone === 'a' ? TOP : TOP_B
  const left = tone === 'a' ? LEFT_FACE : LEFT_B
  const right = tone === 'a' ? RIGHT_FACE : RIGHT_B
  const tl = `${fx},${fy}`
  const tr = `${fx + SIZE},${fy}`
  const br = `${fx + SIZE},${fy + SIZE}`
  const bl = `${fx},${fy + SIZE}`
  const tlB = `${fx + CX},${fy - CY}`
  const trB = `${fx + SIZE + CX},${fy - CY}`
  const brB = `${fx + SIZE + CX},${fy + SIZE - CY}`
  return (
    <g>
      {showTop && <polygon points={`${tl} ${tr} ${trB} ${tlB}`} fill={top} stroke={INK} strokeWidth={1.3} />}
      {showRight && <polygon points={`${tr} ${br} ${brB} ${trB}`} fill={right} stroke={INK} strokeWidth={1.3} />}
      <polygon points={`${tl} ${tr} ${br} ${bl}`} fill={left} stroke={INK} strokeWidth={1.3} />
    </g>
  )
}

/**
 * Draw a small polycube from a list of [col,row,layer] unit-cube coordinates
 * (col = x to the right, row = y down on the front face, layer = depth back).
 * Painter's order keeps nearer cubes drawn over farther ones. Co-exported so the
 * explainer can render the same blocks.
 */
export type Cell = [number, number, number] // [col, row, layer]

export function PolyCube({ cells, ox, oy, tone = 'a' }: { cells: Cell[]; ox: number; oy: number; tone?: 'a' | 'b' }) {
  const has = (c: number, r: number, l: number) => cells.some(([cc, rr, ll]) => cc === c && rr === r && ll === l)
  // screen position of a cube's front-face top-left
  const pos = (c: number, r: number, l: number) => ({
    fx: ox + c * SIZE + l * CX,
    fy: oy + r * SIZE - l * CY,
  })
  // sort far layers / lower-right first so near cubes overdraw
  const order = [...cells].sort((p, q) => p[2] - q[2] || q[1] - p[1] || p[0] - q[0])
  return (
    <g>
      {order.map(([c, r, l], i) => {
        const { fx, fy } = pos(c, r, l)
        const showTop = !has(c, r - 1, l) // nothing directly above (same layer)
        const showRight = !has(c + 1, r, l) // nothing to the right
        return <IsoCube key={i} fx={fx} fy={fy} showTop={showTop} showRight={showRight} tone={tone} />
      })}
    </g>
  )
}

/* -------------------------------------------------------------- data ------- */
// The two given blocks. Block A is an L-tetracube (4 cubes), Block B is the
// complementary L-tetracube (4 cubes). Each has 4 cubes -> a valid solid has 8.
export const BLOCK_A: Cell[] = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 1, 1],
]
export const BLOCK_B: Cell[] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [1, 0, 1],
]

export const BLOCK_A_CUBES = BLOCK_A.length // 4
export const BLOCK_B_CUBES = BLOCK_B.length // 4
export const SOLID_CUBES = BLOCK_A_CUBES + BLOCK_B_CUBES // 8

/* ----------------------------------------------------------- layout -------- */
export const Q18_VIEW_W = 440
export const Q18_VIEW_H = 200

export interface Q18DiagramProps {
  lang?: 'en' | 'id'
}

export function Q18Diagram({ lang = 'en' }: Q18DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${Q18_VIEW_W} ${Q18_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q18_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <text x={Q18_VIEW_W / 2} y={26} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
        {lang === 'id' ? 'Dua balok yang diberikan' : 'The two given blocks'}
      </text>

      {/* Block 1 */}
      <PolyCube cells={BLOCK_A} ox={70} oy={86} tone="a" />
      {/* plus sign */}
      <text x={Q18_VIEW_W / 2} y={120} textAnchor="middle" fontSize={28} fontWeight={900} fill="#94A3B8">
        +
      </text>
      {/* Block 2 */}
      <PolyCube cells={BLOCK_B} ox={280} oy={86} tone="b" />
    </svg>
  )
}

export default function P24G3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two L-shaped building blocks shown in isometric, four unit cubes each. The options are solids; the task is to find the one that cannot be built from exactly these two blocks."
    >
      <Q18Diagram />
    </div>
  )
}
