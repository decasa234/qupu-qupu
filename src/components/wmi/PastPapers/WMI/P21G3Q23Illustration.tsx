/**
 * P21G3Q23Illustration — WMI-21P3A-Q23 (2021 Grade 3 Semifinal, Paper A)
 *
 * "Given an octahedron lantern. Each triangular face is adjacent to three other
 *  triangular faces. If the lantern is to be covered with triangular colored
 *  paper so that adjacent faces are never the same color, at least how many
 *  colors must be prepared?"
 *
 * Source figure (db/seed/wmi/figures/2021-semifinal-g3-a-q23.jpg): an octahedron
 * drawn as a tall wireframe diamond — top apex, bottom apex, left & right side
 * vertices, and a near (front) + far (back) vertex forming the middle "belt".
 * Redrawn here as SVG (the jpg is NOT embedded).
 *
 * The static figure draws ONLY the bare wireframe — no face is coloured. The
 * explainer is what 2-colours the 8 faces (the answer is A = 2).
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe & deterministic.
 */

export const Q23_ANSWER = 'A'
export const Q23_MIN_COLORS = 2

// qupu tokens / palette
const EDGE = '#30598A' // qupu-brand-blue wireframe
const FACE_A = '#FFD3B1' // qupu-peach   (colour 1)
const FACE_B = '#BFE3FA' // qupu light blue (colour 2)
const CLASH = '#F0853A' // qupu-brand-orange (used to flash a bad colouring)

// ---------------------------------------------------------------------------
// Geometry — a vertical octahedron in a 240×280 viewBox.
// 6 vertices: Top, Bottom, Left, Right, Front (near, drawn low-centre),
//             Back (far, drawn high-centre on the belt line).
// ---------------------------------------------------------------------------

export const Q23_VIEW_W = 240
export const Q23_VIEW_H = 290

const CXc = 120 // horizontal centre
const T = { x: CXc, y: 16 } // top apex
const B = { x: CXc, y: 274 } // bottom apex
const L = { x: 22, y: 150 } // left vertex
const R = { x: 218, y: 150 } // right vertex
// belt: the square ring seen edge-on. Back vertex sits higher (far), front lower (near).
const BK = { x: CXc, y: 124 } // back belt vertex (far)
const FR = { x: CXc, y: 176 } // front belt vertex (near)

/**
 * The 8 triangular faces, by the three vertices that bound them. The 4 "upper"
 * faces meet at Top; the 4 "lower" faces meet at Bottom. Each id is stable so
 * the explainer can colour them one at a time.
 *
 * Front faces (drawn solid in the wireframe) use the FRONT belt vertex; the two
 * back faces (T-L-BK, T-R-BK style) are partly hidden but still drawn as the
 * scan shows the back belt line.
 */
export interface Q23Face {
  id: number
  pts: { x: number; y: number }[]
  /** 0 or 1 — the 2-colouring class (used only by the explainer). */
  colorClass: 0 | 1
  /** true for the four faces visible at the front of the wireframe. */
  front: boolean
}

export const Q23_FACES: Q23Face[] = [
  // ---- upper four (meet at Top) ----
  { id: 0, pts: [T, L, FR], colorClass: 0, front: true }, // top-left-front
  { id: 1, pts: [T, FR, R], colorClass: 1, front: true }, // top-front-right
  { id: 2, pts: [T, R, BK], colorClass: 0, front: false }, // top-right-back
  { id: 3, pts: [T, BK, L], colorClass: 1, front: false }, // top-back-left
  // ---- lower four (meet at Bottom) ----
  { id: 4, pts: [B, L, FR], colorClass: 1, front: true }, // bottom-left-front
  { id: 5, pts: [B, FR, R], colorClass: 0, front: true }, // bottom-front-right
  { id: 6, pts: [B, R, BK], colorClass: 1, front: false }, // bottom-right-back
  { id: 7, pts: [B, BK, L], colorClass: 0, front: false }, // bottom-back-left
]

function ptsStr(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(' ')
}

// ---------------------------------------------------------------------------
// Octahedron primitive — shared with the explainer.
// ---------------------------------------------------------------------------

export interface OctahedronP21G3Q23Props {
  /**
   * Map of face id -> fill class: 0 = FACE_A (colour 1), 1 = FACE_B (colour 2),
   * 'clash' = orange warning. Faces not in the map stay unpainted (white).
   * The static figure passes nothing.
   */
  painted?: Record<number, 0 | 1 | 'clash'>
  /** Highlight (thicker outline) these face ids. */
  active?: number[]
}

function fillFor(v: 0 | 1 | 'clash' | undefined): string {
  if (v === 0) return FACE_A
  if (v === 1) return FACE_B
  if (v === 'clash') return CLASH
  return '#FFFFFF'
}

export function OctahedronP21G3Q23({ painted = {}, active = [] }: OctahedronP21G3Q23Props) {
  const activeSet = new Set(active)
  // draw back faces first, then front faces, so the front overlaps cleanly
  const ordered = [...Q23_FACES].sort((a, b) => Number(a.front) - Number(b.front))
  return (
    <g>
      {ordered.map((f) => {
        const isPainted = painted[f.id] !== undefined
        return (
          <polygon
            key={f.id}
            points={ptsStr(f.pts)}
            fill={fillFor(painted[f.id])}
            fillOpacity={f.front || isPainted ? 1 : 0.55}
            stroke={EDGE}
            strokeWidth={activeSet.has(f.id) ? 3.2 : 1.6}
            strokeLinejoin="round"
          />
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Default export — bare wireframe (problem only).
// ---------------------------------------------------------------------------

export default function P21G3Q23Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah oktahedron (lampion) digambar sebagai kerangka kawat berbentuk wajik tegak dengan delapan sisi segitiga. Setiap sisi segitiga berbatasan dengan tiga sisi lainnya."
    >
      <svg
        viewBox={`0 0 ${Q23_VIEW_W} ${Q23_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 240, display: 'block' }}
        aria-hidden="true"
      >
        <OctahedronP21G3Q23 />
      </svg>
    </div>
  )
}
