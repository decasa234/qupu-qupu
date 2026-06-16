// WMI-23F3A-Q13 (2023 Grade 3 Final) — area of a quadrilateral on a triangular grid.
//
// "Each small equilateral triangle in the figure has an area of 6 cm². Find the
// area of quadrilateral ABCD."  (MC; answer = C = 72 cm² = exactly 12 small
// triangles.) The static figure must NOT reveal the area (72) or the count (12).
//
// FAITHFUL RECONSTRUCTION (verified against db/seed/wmi/figures/2023-final-g3-a-q13.jpg):
// A large equilateral triangle is subdivided into a triangular grid with side
// n = 5 (rows of small triangles from the apex down to the base: 5 rows; the
// internal horizontal grid lines read off the image sit at five evenly-spaced
// heights, apex→base).
//
// LATTICE MODEL. Index a lattice point by (r, k): row r = 0..n from the apex,
// and k = 0..r across that row. Cartesian:
//     x = k − r/2,   y = r·√3/2.
// Each small (unit) equilateral triangle has area √3/4 in these units.
//
// READ VERTICES (pixel positions measured off the image, then snapped to the
// nearest lattice point — overlay cross-checked, edges + shading match exactly):
//     A = (4, 0)   — on the LEFT edge        (px ≈ 44, 283)
//     D = (2, 1)   — interior, upper-middle  (px ≈ 202, 147)  ← apex of row 2
//     C = (3, 3)   — on the RIGHT edge       (px ≈ 321, 215)
//     B = (5, 4)   — on the BOTTOM edge      (px ≈ 321, 352)
// Quadrilateral traversed A → D → C → B (→ A).
//
// AREA PROOF (shoelace in cartesian, then ÷ (√3/4) to get small-triangle count):
//     cart(A)=(−2, 0),  cart(D)=(0, √3),  cart(C)=(1.5, 1.5√3),  cart(B)=(1.5, 2.5√3)
//     2·signedArea = Σ (x_i·y_{i+1} − x_{i+1}·y_i)
//       A→D: (−2)(√3) − (0)(0)              = −2√3
//       D→C: (0)(1.5√3) − (1.5)(√3)         = −1.5√3
//       C→B: (1.5)(2.5√3) − (1.5)(1.5√3)    = +1.5√3
//       B→A: (1.5)(0) − (−2)(2.5√3)         = +5√3
//       Σ = 3√3  →  |area| = 1.5√3
//     small-tris = 1.5√3 ÷ (√3/4) = 6√3·… = 12.  ✓
//   12 small triangles × 6 cm² = 72 cm² = answer C.  (15 triangles / 90 cm² is
//   NOT an option — a vertex misread would give that; this reading gives 12.)
//
// Pure render: no Math.random, no Date, no state — SSR-safe & deterministic.

export const GRID_N = 5 // side of the triangular grid (rows of small triangles)
export const SMALL_TRIANGLE_CM2 = 6
export const ANSWER_CM2 = 72 // = 12 small triangles — NEVER drawn in the static figure
export const ANSWER_TRIANGLE_COUNT = 12 // animator only

const INK = '#1F2937'

/** Lattice point (r, k): r = row from apex (0..n), k = 0..r across the row. */
export type Lattice = readonly [r: number, k: number]

export const A: Lattice = [4, 0]
export const D: Lattice = [2, 1]
export const C: Lattice = [3, 3]
export const B: Lattice = [5, 4]

/** Quadrilateral vertices in traversal order A → D → C → B. */
export const QUAD: ReadonlyArray<{ name: string; p: Lattice }> = [
  { name: 'A', p: A },
  { name: 'D', p: D },
  { name: 'C', p: C },
  { name: 'B', p: B },
]

// ---- layout / lattice → SVG ------------------------------------------------
const SQRT3 = Math.sqrt(3)
const UNIT = 38 // pixel length of one small-triangle edge in user units
const PAD = 26 // headroom so apex / labels never clip
const ROW_H = UNIT * (SQRT3 / 2)

// Width of the base = n units; total drawing box.
const GRID_W = GRID_N * UNIT
const GRID_H = GRID_N * ROW_H
const VIEW_W = GRID_W + PAD * 2
const VIEW_H = GRID_H + PAD * 2

// Apex sits centered at the top of the headroom-padded box.
const APEX_X = PAD + GRID_W / 2
const APEX_Y = PAD

/** Lattice (r, k) → SVG pixel { x, y } (apex at top, y grows downward). */
export function latticeToSvg([r, k]: Lattice): { x: number; y: number } {
  return { x: APEX_X + (k - r / 2) * UNIT, y: APEX_Y + r * ROW_H }
}

function pointsAttr(pts: ReadonlyArray<{ x: number; y: number }>): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

// ---- grid geometry ---------------------------------------------------------
/** The three lattice grid-line families, as straight segments across the big triangle. */
function gridLines(): Array<[{ x: number; y: number }, { x: number; y: number }]> {
  const lines: Array<[{ x: number; y: number }, { x: number; y: number }]> = []
  // horizontals: row r from (r,0) to (r,r), for r = 1..n
  for (let r = 1; r <= GRID_N; r++) {
    lines.push([latticeToSvg([r, 0]), latticeToSvg([r, r])])
  }
  // left-leaning (parallel to right edge): from (r, r) down-left... use diagonals
  // diagonal family 1: points with constant k, from (k,k) to (n, k)
  for (let k = 1; k < GRID_N; k++) {
    lines.push([latticeToSvg([k, k]), latticeToSvg([GRID_N, k])])
  }
  // diagonal family 2: points with constant (r-k), from (k,0) to (n, n-k)
  for (let k = 1; k < GRID_N; k++) {
    lines.push([latticeToSvg([k, 0]), latticeToSvg([GRID_N, GRID_N - k])])
  }
  return lines
}

// ---- area decomposition for the animator tally -----------------------------
// The quad edges A–D and C–B are NOT grid-aligned, so ABCD is NOT a union of
// whole small cells. But the diagonal A–C splits it into two triangles whose
// vertices are all lattice points, and each has an exact whole-number area:
//     triangle A-D-C = 5 small triangles
//     triangle A-C-B = 7 small triangles
//     total          = 12 small triangles = 72 cm².   (verified by shoelace)
const SQRT3_4 = SQRT3 / 4

/** Exact small-triangle count of a lattice triangle/polygon via shoelace. */
export function smallTriangleArea(verts: ReadonlyArray<Lattice>): number {
  let twice = 0
  for (let i = 0; i < verts.length; i++) {
    const [r1, k1] = verts[i]
    const [r2, k2] = verts[(i + 1) % verts.length]
    const x1 = k1 - r1 / 2
    const y1 = (r1 * SQRT3) / 2
    const x2 = k2 - r2 / 2
    const y2 = (r2 * SQRT3) / 2
    twice += x1 * y2 - x2 * y1
  }
  return Math.round((Math.abs(twice) / 2 / SQRT3_4) * 1e6) / 1e6
}

/** The two sub-triangles produced by the A–C diagonal (animator tally). */
export const SUBTRIANGLES: ReadonlyArray<{ verts: Lattice[]; count: number }> = [
  { verts: [A, D, C], count: smallTriangleArea([A, D, C]) }, // 5
  { verts: [A, C, B], count: smallTriangleArea([A, C, B]) }, // 7
]

function centroidSvg(verts: ReadonlyArray<Lattice>): { x: number; y: number } {
  const ps = verts.map(latticeToSvg)
  const n = ps.length
  return {
    x: ps.reduce((s, p) => s + p.x, 0) / n,
    y: ps.reduce((s, p) => s + p.y, 0) / n,
  }
}

export interface TriGridQuad23G3Props {
  /**
   * Animator post-answer only. Overlays the A–C diagonal that splits ABCD into
   * two lattice triangles (5 + 7 small triangles = 12 = 72 cm²) and labels each
   * with its small-triangle count — the honest "count to 12" the animator walks
   * through. Default = plain shaded quad on the grid (reveals nothing).
   */
  showCount?: boolean
}

/**
 * Core primitive. Draws the side-5 triangular grid, the shaded quadrilateral
 * ABCD (light peach) with bold edges and four labelled vertices. With
 * `showCount` it additionally draws the A–C diagonal and labels the two halves
 * with their small-triangle counts (5 and 7 → 12) — that tally is the answer,
 * so it is OFF by default and only the animator turns it on.
 */
export function TriGridQuad23G3({ showCount = false }: TriGridQuad23G3Props = {}) {
  const quadPts = QUAD.map((v) => latticeToSvg(v.p))
  const aSvg = latticeToSvg(A)
  const cSvg = latticeToSvg(C)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(280, VIEW_W)}
      aria-hidden="true"
    >
      {/* shaded quadrilateral (drawn under the grid lines) */}
      <polygon points={pointsAttr(quadPts)} className="fill-qupu-peach" />

      {/* triangular grid: thin lines */}
      {gridLines().map((seg, i) => (
        <line
          key={`g-${i}`}
          x1={seg[0].x}
          y1={seg[0].y}
          x2={seg[1].x}
          y2={seg[1].y}
          stroke={INK}
          strokeWidth={1}
          strokeLinecap="round"
        />
      ))}
      {/* big-triangle outline */}
      <polygon
        points={pointsAttr([
          latticeToSvg([0, 0]),
          latticeToSvg([GRID_N, 0]),
          latticeToSvg([GRID_N, GRID_N]),
        ])}
        fill="none"
        stroke={INK}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />

      {/* animator-only: A–C diagonal splits ABCD into 5 + 7 = 12 small triangles */}
      {showCount && (
        <g>
          <line
            x1={aSvg.x}
            y1={aSvg.y}
            x2={cSvg.x}
            y2={cSvg.y}
            className="stroke-qupu-brand-orange"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          {SUBTRIANGLES.map((t, i) => {
            const ctr = centroidSvg(t.verts)
            return (
              <text
                key={`t-${i}`}
                x={ctr.x}
                y={ctr.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={800}
                className="fill-qupu-brand-orange"
              >
                {t.count}
              </text>
            )
          })}
        </g>
      )}

      {/* bold quadrilateral edges (over everything) */}
      <polygon
        points={pointsAttr(quadPts)}
        fill="none"
        className="stroke-qupu-brand-blue"
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* vertices + labels */}
      {QUAD.map((v) => {
        const p = latticeToSvg(v.p)
        // nudge each label outward so it doesn't sit on an edge
        const nudge: Record<string, { dx: number; dy: number }> = {
          A: { dx: -13, dy: 4 },
          D: { dx: -2, dy: -12 },
          C: { dx: 14, dy: -3 },
          B: { dx: 6, dy: 17 },
        }
        const n = nudge[v.name]
        return (
          <g key={v.name}>
            <circle cx={p.x} cy={p.y} r={3} className="fill-qupu-brand-blue" />
            <text
              x={p.x + n.dx}
              y={p.y + n.dy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={800}
              fontStyle="italic"
              fill={INK}
            >
              {v.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Default export: the in-card setup figure — triangular grid + shaded
 * quadrilateral ABCD with its four labelled vertices. It shows ONLY the setup;
 * it never reveals the area (72 cm²) or the small-triangle count (12).
 */
export default function TriGridQuad23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah segitiga sama sisi besar dibagi menjadi kisi segitiga kecil sama sisi (sisi 5). Di dalamnya, segiempat ABCD diarsir oranye muda: titik A di sisi kiri, B di sisi bawah, C di sisi kanan, dan D di tengah-atas. Setiap segitiga kecil luasnya 6 cm². Cari luas segiempat ABCD."
    >
      <TriGridQuad23G3 />
    </div>
  )
}
