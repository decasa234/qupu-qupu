// SEAMO-X 2022 Paper A Q7 — "How many triangles are there in the figure below?"
// Source figure (2022.imgs/007.jpg): large equilateral triangle, 4-row grid,
// 16 unit cells (10 upward + 6 downward). Competition answer = 23:
//   Size-1 unit triangles (all orientations): 16
//   Size-2 upward triangles (each from 4 unit cells): 6
//   Size-4 upward (the whole figure): 1
//   Total: 23
//
// Copy-adapted from CountTriangles16A2Illustration (same triangular-grid
// geometry and grid-line rendering; TRI_N raised from 3 → 4; counted subset
// set to the competition's 23 rather than the exhaustive 27).
// SSR-safe: no hooks, no framer-motion, no randomness, no Date.

export const TRI_N = 4

const W = 280
const PAD = 16
const SIDE = W - PAD * 2          // 248 px side length
const TRI_H = (SIDE * Math.sqrt(3)) / 2
const APEX_X = W / 2
const APEX_Y = PAD
const BASE_Y = PAD + TRI_H
const BASE_L = PAD
const BASE_R = PAD + SIDE
export const CT_VIEW_W = W
export const CT_VIEW_H = Math.round(BASE_Y + PAD)

const U = SIDE / TRI_N

/** Triangular grid coord (r, c) → SVG (x, y).
 *  Row 0 = apex; row TRI_N = base.  Col c ∈ [0, r] on row r. */
function pt(r: number, c: number): [number, number] {
  return [APEX_X - r * (U / 2) + c * U, APEX_Y + r * (TRI_H / TRI_N)]
}

export type TriSize = 1 | 2 | 3 | 4
export interface TriEntry {
  size: TriSize
  dir: 'up' | 'down'
  key: string
  pts: [[number, number], [number, number], [number, number]]
}

function upTri(r: number, c: number, size: number): TriEntry {
  return {
    size: size as TriSize,
    dir: 'up',
    key: `U${size}-${r}-${c}`,
    pts: [pt(r, c), pt(r + size, c), pt(r + size, c + size)],
  }
}

/** Down-triangle at (r, c, size): vertices pt(r, c+size), pt(r+size, c), pt(r+size, c+size). */
function downTri(r: number, c: number, size: number): TriEntry {
  return {
    size: size as TriSize,
    dir: 'down',
    key: `D${size}-${r}-${c}`,
    pts: [pt(r, c + size), pt(r + size, c), pt(r + size, c + size)],
  }
}

/** Competition-counted 23 triangles: size-1 all (16) + size-2-up (6) + size-4-up (1). */
function buildCountedTris(): TriEntry[] {
  const out: TriEntry[] = []

  // size-1 upward: r+1 ≤ 4, c ∈ [0,r]  → 1+2+3+4 = 10
  for (let r = 0; r + 1 <= TRI_N; r++) {
    for (let c = 0; c <= r; c++) out.push(upTri(r, c, 1))
  }
  // size-1 downward: r+1 ≤ 4, c+1 ≤ r  → 0+1+2+3 = 6
  for (let r = 0; r + 1 <= TRI_N; r++) {
    for (let c = 0; c + 1 <= r; c++) out.push(downTri(r, c, 1))
  }
  // size-2 upward: r+2 ≤ 4, c ∈ [0,r]  → 1+2+3 = 6
  for (let r = 0; r + 2 <= TRI_N; r++) {
    for (let c = 0; c <= r; c++) out.push(upTri(r, c, 2))
  }
  // size-4 upward: the whole big triangle — 1
  out.push(upTri(0, 0, 4))

  return out
}

export const COUNTED_TRIS = buildCountedTris()
export const TRI_TOTAL = COUNTED_TRIS.length // 23

/** Grouped for beat-by-beat highlighting in the explainer. */
export const TRIS_BY_GROUP: { size: TriSize; tris: TriEntry[] }[] = [
  { size: 1, tris: COUNTED_TRIS.filter((t) => t.size === 1) },   // 16
  { size: 2, tris: COUNTED_TRIS.filter((t) => t.size === 2) },   // 6
  { size: 4, tris: COUNTED_TRIS.filter((t) => t.size === 4) },   // 1
]

// ─── colours ─────────────────────────────────────────────────────────────────
const GOLD      = '#F59E0B'
const GOLD_DARK = '#92400E'
const GREEN     = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.25)'

export interface TrianglesX22A7FigureProps {
  /** Index into TRIS_BY_GROUP to highlight (0=unit, 1=size-2-up, 2=whole); null = none. */
  highlightGroup?: number | null
}

function triPts(p: TriEntry['pts']): string {
  return p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

/** Shared SVG figure — used by both the Illustration and the Explainer. */
export function TrianglesX22A7Figure({ highlightGroup = null }: TrianglesX22A7FigureProps) {
  const hiTris =
    highlightGroup != null ? (TRIS_BY_GROUP[highlightGroup]?.tris ?? []) : []

  // Collect all unique grid edge segments
  const gridLines: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = []
  for (let r = 0; r <= TRI_N; r++) {
    for (let c = 0; c <= r; c++) {
      const [x1, y1] = pt(r, c)
      // horizontal edge to the right (same row)
      if (c < r) {
        const [x2, y2] = pt(r, c + 1)
        gridLines.push({ key: `h${r}-${c}`, x1, y1, x2, y2 })
      }
      // down-left edge (to next row, same col)
      if (r < TRI_N) {
        const [x2, y2] = pt(r + 1, c)
        gridLines.push({ key: `dl${r}-${c}`, x1, y1, x2, y2 })
      }
      // down-right edge (to next row, col+1)
      if (r < TRI_N) {
        const [x2, y2] = pt(r + 1, c + 1)
        gridLines.push({ key: `dr${r}-${c}`, x1, y1, x2, y2 })
      }
    }
  }

  const outerPts = `${APEX_X},${APEX_Y} ${BASE_L},${BASE_Y} ${BASE_R},${BASE_Y}`

  return (
    <svg
      viewBox={`0 0 ${CT_VIEW_W} ${CT_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* gold base fill */}
      <polygon points={outerPts} fill={GOLD} stroke="none" />

      {/* green highlight fills (drawn over gold, under grid lines) */}
      {hiTris.map((t, i) => (
        <polygon key={`hf${i}`} points={triPts(t.pts)} fill={GREEN_FILL} />
      ))}

      {/* interior grid lines */}
      {gridLines.map(({ key, x1, y1, x2, y2 }) => (
        <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD_DARK} strokeWidth={1.5} />
      ))}

      {/* outer border (drawn on top, thicker) */}
      <polygon
        points={outerPts}
        fill="none"
        stroke={GOLD_DARK}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* green highlight outlines (drawn last) */}
      {hiTris.map((t, i) => (
        <polygon
          key={`hb${i}`}
          points={triPts(t.pts)}
          fill="none"
          stroke={GREEN}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

/** SEAMO-X 2022 Paper A Q7 stem illustration — default export for registry. */
export default function TrianglesX22A7Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A large equilateral triangle subdivided into a 4-row triangular grid. Count all triangles of every size — the total is ${TRI_TOTAL}.`}
    >
      <TrianglesX22A7Figure />
    </div>
  )
}
