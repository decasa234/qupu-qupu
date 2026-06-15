/**
 * WMI-19P1A-Q21 — "The square is divided by straight lines. How many triangles
 * are there in the figure?" (2019 Semifinal Grade 1, answer A = 14).
 *
 * Redrawn line-for-line from the source scan
 * (db/seed/wmi/figures/2019-semifinal-g1-a-q21.jpg):
 *
 *   - A big square.
 *   - Its main diagonal runs from the TOP-LEFT corner to the BOTTOM-RIGHT corner.
 *   - In the lower-LEFT quadrant sits a SMALL square (half the side of the big
 *     one): its top-left corner is on the big square's left edge at mid-height,
 *     its top-right corner is the big square's centre (where the diagonal passes
 *     through), its bottom edge lies on the big square's bottom edge, its left
 *     edge lies on the big square's left edge.
 *   - That small square carries BOTH of its diagonals — an "X" — so its interior
 *     is split into four little triangles.
 *
 *   Counting every triangle of every size gives 14 (verified by a throwaway
 *   enumeration over the exact geometry before this was committed):
 *       • 4 little triangles inside the X.
 *       • 4 half-square triangles in the small square (two diagonals each split
 *         the square into two; 2 diagonals × 2 = 4).
 *       • 1 whole small square is NOT a triangle — skip.
 *       • the big diagonal + small-square right & bottom edges form triangles,
 *         and the big diagonal halves the big square, etc.
 *   The reveal order in the explainer enumerates all 14 one at a time.
 *
 * Pure render — no Math.random, no Date, no window/document at module top.
 * SSR-safe and deterministic.
 */

// ─── colour tokens (hex echoes of the fill-qupu-* classes) ──────────────────
const LINE = '#2B2118' // dark outline
const LIT_FILL = '#FF8A3D' // fill-qupu-brand-orange — the triangle currently counted
const LIT_EDGE = '#30598A' // stroke-qupu-brand-blue — ring around the counted triangle

// ─── geometry ────────────────────────────────────────────────────────────────
export const VIEW = 340
const PAD = 20
const S = 300 // big square side
const X0 = PAD // big square left
const Y0 = PAD // big square top
const X1 = PAD + S // big square right
const Y1 = PAD + S // big square bottom
const MX = PAD + S / 2 // horizontal centre
const MY = PAD + S / 2 // vertical centre

type Pt = [number, number]

// Named points -----------------------------------------------------------------
const A: Pt = [X0, Y0] // big TL
const B: Pt = [X1, Y0] // big TR
const C: Pt = [X1, Y1] // big BR
const D: Pt = [X0, Y1] // big BL
// small square (lower-left quadrant)
const P: Pt = [X0, MY] // small TL  (on left edge, mid-height)
const Q: Pt = [MX, MY] // small TR  (= big-square centre)
const R: Pt = [MX, Y1] // small BR  (on bottom edge, mid-width)
// D is the small square's BL corner too
const M: Pt = [(X0 + MX) / 2, (MY + Y1) / 2] // X crossing (centre of small square)

const pts = (...p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ')

// Every black stroke actually drawn in the source figure.
const STROKES: [Pt, Pt][] = [
  // big square outline
  [A, B],
  [B, C],
  [C, D],
  [D, A],
  // main diagonal TL → BR
  [A, C],
  // small square: top + right edges (bottom & left lie on the big square)
  [P, Q],
  [Q, R],
  // small square's two diagonals (the X)
  [P, R],
  [Q, D],
]

export interface TriEntry {
  id: number
  points: string
}

// All 14 triangles, smallest-first. Verified non-degenerate, distinct, and equal
// to the full enumeration over this exact geometry (count = 14).
//   1–4  the four little triangles inside the X (top / left / right / bottom).
//   5–8  the four half-square triangles of the small square (each of its two
//        diagonals halves it: P-R gives 5,6 and Q-D gives 7,8).
//   9    A-P-Q — the slim left strip above the small square, left of the big diagonal.
//   10–11 A-B-C and A-C-D — the big diagonal halves the whole square.
//   12–13 C-D-Q and C-Q-R — the lower half cut by the small square's right edge.
//   14   A-D-Q — the big left triangle from corner A down to D and across to centre Q.
const ORDER: Pt[][] = [
  // 1–4 little triangles in the X (top, left, right, bottom of the small square)
  [P, Q, M], // top
  [P, D, M], // left
  [Q, R, M], // right
  [D, R, M], // bottom
  // 5–8 half-square triangles (two per diagonal)
  [P, Q, R], // diagonal P-R, upper-right half
  [P, D, R], // diagonal P-R, lower-left half
  [Q, P, D], // diagonal Q-D, upper-left half
  [Q, R, D], // diagonal Q-D, lower-right half
  // 9 slim left strip above the small square
  [A, P, Q],
  // 10–11 the big diagonal halves the whole square
  [A, B, C],
  [A, C, D],
  // 12–13 lower half cut by the small square's right edge Q-R
  [Q, C, D],
  [Q, R, C],
  // 14 big left triangle A-D-Q
  [A, Q, D],
]

export const TRIANGLES: TriEntry[] = ORDER.map((p, i) => ({ id: i + 1, points: pts(...p) }))
export const TRI_TOTAL = TRIANGLES.length // 14

// ─── drawing ──────────────────────────────────────────────────────────────────

/** Every black outline stroke of the figure. */
function FigureLines() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
      {STROKES.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      ))}
    </g>
  )
}

/**
 * Draws the whole figure and, if `litId` is given, outlines exactly that
 * triangle in orange so the animator can highlight one at a time. Safe to call
 * with no props — renders the plain problem figure.
 */
export function SquareTriFigure({ litId }: { litId?: number }) {
  const lit = litId ? TRIANGLES.find((t) => t.id === litId) : undefined
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 280 }}
      aria-hidden="true"
    >
      {/* white field so a lit triangle reads cleanly */}
      <rect x={X0} y={Y0} width={S} height={S} fill="#FFFFFF" stroke="none" />
      {lit && <polygon points={lit.points} fill={LIT_FILL} stroke="none" opacity={0.85} />}
      <FigureLines />
      {lit && (
        <polygon
          points={lit.points}
          fill="none"
          stroke={LIT_EDGE}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export default function SquareTriangles19P1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah persegi besar dengan diagonal dari sudut kiri-atas ke kanan-bawah, dan sebuah persegi kecil di kuadran kiri-bawah yang dibagi oleh kedua diagonalnya (bentuk X). Berapa banyak segitiga seluruhnya?"
    >
      <SquareTriFigure />
    </div>
  )
}
