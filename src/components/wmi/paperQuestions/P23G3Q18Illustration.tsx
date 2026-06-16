// WMI-23P3A-Q18 (2023 Grade 3 Semifinal, Paper A) — "how many small cubes?"
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g3-a-q18.jpg (NOT embedded).
//
// The scan shows a flat wall-like solid drawn with a thin hatched depth strip on
// the right edge, around the inner hole and on the legs — i.e. the figure is
// exactly ONE unit cube thick. Its front face is a silhouette of unit squares:
//   - a solid slab,
//   - a 3×3 square hole punched left-of-centre in the upper region,
//   - three thin legs at the bottom separated by two gaps.
//
// Reading the front-face silhouette as a 7-wide × 10-tall grid (1 cube deep):
//
//   #######      top band (solid)
//   #...###      ┐
//   #...###      ├ 3×3 hole
//   #...###      ┘
//   #######      ┐
//   #######      ├ solid middle band
//   #######      ┘
//   #..#..#      ┐
//   #..#..#      ├ three legs (width 1) with two 2-wide gaps
//   #..#..#      ┘
//
// Cell count = 7·10 − 3·3 (hole) − 2·(2·3) (gaps) = 70 − 9 − 12 = 49 cubes.
// Depth is 1, so the model uses 49 small cubes → choice C. (Verified by summing
// the per-row layer counts, all derived from FRONT_FACE — never hardcoded.)
//
// Co-exports `CubeWall`, a reusable primitive that draws the slab as an
// isometric stack of unit cubes (one layer deep) and can highlight a contiguous
// band of bottom-up "layers" — the explainer uses it to count layer by layer.
//
// Pure render — no window/document, no Math.random/Date. SSR-safe + deterministic.

// Front face occupancy, row 0 = TOP, col 0 = LEFT. 1 = a cube, 0 = empty.
export const FRONT_FACE: ReadonlyArray<ReadonlyArray<0 | 1>> = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 1],
]

export const FACE_ROWS = FRONT_FACE.length // 10
export const FACE_COLS = FRONT_FACE[0].length // 7

// Per-row cube counts, read BOTTOM → TOP (the order the explainer counts in).
export const LAYER_COUNTS: number[] = [...FRONT_FACE]
  .reverse()
  .map((row) => row.reduce<number>((a, b) => a + b, 0))

export const TOTAL_CUBES = LAYER_COUNTS.reduce((a, b) => a + b, 0) // 49 → choice C

// ─── colour tokens ──────────────────────────────────────────────────────────
const INK = '#1F2937'
const CUBE_TOP = '#E6F4D9'
const CUBE_LEFT = '#A6C46A'
const CUBE_RIGHT = '#C8E29A'
// Warm highlight for the layer(s) being counted (post-answer only).
const LIT_TOP = '#FFE9C7'
const LIT_LEFT = '#E0A82E'
const LIT_RIGHT = '#F4D06A'

// Isometric unit-cube size.
const S = 22
const CX = S * 0.86
const CY = S * 0.5

/** Screen projection of grid cell (col, rowFromTop) at depth d (0 = front). */
function proj(col: number, rowFromTop: number, d: number) {
  // x runs right (col), the wall rises up the screen as rowFromTop decreases,
  // depth pushes up-right slightly (1 cube deep only).
  const rowFromBottom = FACE_ROWS - 1 - rowFromTop
  return {
    sx: col * 2 * CX + d * CX,
    sy: -rowFromBottom * S - d * CY,
  }
}

function oneCube(col: number, rowFromTop: number, d: number, lit: boolean, k: string) {
  const { sx, sy } = proj(col, rowFromTop, d)
  const top = lit ? LIT_TOP : CUBE_TOP
  const left = lit ? LIT_LEFT : CUBE_LEFT
  const right = lit ? LIT_RIGHT : CUBE_RIGHT
  const topPts = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2 * CX},${sy} ${sx + CX},${sy + CY}`
  const leftPts = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + S} ${sx},${sy + S}`
  const rightPts = `${sx + CX},${sy + CY} ${sx + 2 * CX},${sy} ${sx + 2 * CX},${sy + S} ${sx + CX},${sy + CY + S}`
  return (
    <g key={k}>
      <polygon points={topPts} fill={top} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={leftPts} fill={left} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={rightPts} fill={right} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  )
}

export interface CubeWallProps {
  /**
   * Highlight the lowest `litLayers` rows (counted bottom → top). 0 = none.
   * Used post-answer to colour each layer as it is counted.
   */
  litLayers?: number
}

/**
 * The wall as an isometric stack of unit cubes, one layer deep. Painter's order:
 * back depth first, then top rows before lower rows, then left→right, so nearer
 * cubes overdraw farther ones cleanly.
 */
export function CubeWall({ litLayers = 0 }: CubeWallProps) {
  const lit = Math.max(0, Math.min(FACE_ROWS, litLayers))

  // Gather cubes with a paint order. depth 1 (back) drawn before depth 0 (front).
  const cubes: Array<{ col: number; rowTop: number; d: number; lit: boolean }> = []
  for (let d = 1; d >= 0; d--) {
    for (let rowTop = 0; rowTop < FACE_ROWS; rowTop++) {
      for (let col = 0; col < FACE_COLS; col++) {
        if (FRONT_FACE[rowTop][col] !== 1) continue
        const rowFromBottom = FACE_ROWS - 1 - rowTop
        cubes.push({ col, rowTop, d, lit: rowFromBottom < lit })
      }
    }
  }

  // Bounding box with headroom so nothing clips.
  const xs: number[] = []
  const ys: number[] = []
  for (const c of cubes) {
    const { sx, sy } = proj(c.col, c.rowTop, c.d)
    xs.push(sx, sx + 2 * CX)
    ys.push(sy - CY, sy + CY + S)
  }
  const pad = 10
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const w = maxX - minX
  const h = maxY - minY

  return (
    <svg
      viewBox={`${minX} ${minY} ${w} ${h}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 280 }}
      aria-hidden="true"
    >
      {cubes.map((c, i) => oneCube(c.col, c.rowTop, c.d, c.lit, `c${i}`))}
    </svg>
  )
}

export default function P23G3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A wall built from small unit cubes, one cube thick: a solid slab with a square hole punched near the top-left and three thin legs at the bottom. How many small cubes are used?"
    >
      <CubeWall />
    </div>
  )
}
