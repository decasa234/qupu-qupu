/**
 * WMI-22F1A-Q19 — "How many triangles are in the figure?" (Grade 1, answer 16).
 *
 * The figure is a fir-tree built from THREE equal triangular tiers stacked top
 * to bottom, each tier's apex sitting halfway up the tier above (the bottom
 * tier's apex sits exactly on the top tier's base centre). Reconstructed by
 * pixel-measuring the source scan (db/seed/wmi/figures/2022-final-g1-a-q19.jpg):
 *
 *   - Three tier outlines (apex + two sides + base). The middle tier's sides
 *     cross the top tier's base at its quarter points; the bottom tier's sides
 *     start at the top tier's base centre.
 *   - TOP band extra strokes: two short lines from the top tier's side
 *     mid-points down to its base centre (they are collinear continuations of
 *     the bottom tier's sides).
 *   - BOTTOM extra strokes: two lines that start on the bottom tier's sides
 *     (at 1/4 of its height), cross at the middle tier's base centre, and end
 *     on the bottom base quarter points. They do NOT reach the middle tier's
 *     side mid-points — the scan is empty there (verified pixel-by-pixel).
 *
 *   Counting every triangle of every size in that exact line arrangement
 *   (verified by an exact rational-arithmetic enumeration of the drawn
 *   segments — 16 and only 16 triangles exist):
 *       top band    6  (whole + apex tent + 2 lower corners + 2 smallest)
 *       middle band 6  (whole + apex tent + 2 big slanted + 2 smallest)
 *       bottom band 4  (whole + centre tent + 2 big slanted)
 *       = 16 triangles total  (matches the answer key)
 *
 * This module co-exports the data the animator needs to reveal one triangle
 * per beat:
 *   TRI_TOTAL  — 16
 *   TRIANGLES  — every triangle as an SVG polygon points string, ordered
 *                bottom band → middle band → top band
 *   TriFigure  — draws the whole figure and outlines triangle `litId` if given
 *
 * Pure render — no Math.random, no Date, no state. SSR-safe and deterministic.
 */

// ─── colour tokens (hex echoes of the fill-qupu-* classes) ──────────────────
const TRI_FILL = '#FFE48A' // warm yellow, matches the source figure
const LINE = '#2B2118' // dark outline
const LIT_FILL = '#FF8A3D' // fill-qupu-brand-orange — the triangle currently counted
const LIT_EDGE = '#30598A' // stroke-qupu-brand-blue — ring around the counted triangle

// ─── geometry ────────────────────────────────────────────────────────────────
export const VIEW_W = 220
export const VIEW_H = 370

type Pt = [number, number]
const HW = 100 // half base width of every tier
const H = 175 // apex-to-base height of every tier
const CX = 110 // shared horizontal centre
const TOP_Y = 10 // top apex y

const pts = (...p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ')

// y at a height of v tier-heights below the top apex.
const Y = (v: number) => TOP_Y + v * H

// Named points of the arrangement (x offset u from centre, height v in H units).
const P = (u: number, v: number): Pt => [CX + u, Y(v)]

const A0 = P(0, 0) // top apex
const L0 = P(-HW, 1) // top base left corner
const R0 = P(HW, 1)
const q1L = P(-HW / 2, 1) // top base quarter points
const q1R = P(HW / 2, 1)
const C1 = P(0, 1) // top base centre = bottom tier apex
const Am = P(0, 0.5) // middle tier apex
const LmT = P(-HW / 2, 0.5) // mid-points of the top tier's sides
const RmT = P(HW / 2, 0.5)
const X2L = P(-HW / 4, 0.75) // crossings inside the top band
const X2R = P(HW / 4, 0.75)
const L1 = P(-HW, 1.5) // middle base corners
const R1 = P(HW, 1.5)
const q2L = P(-HW / 2, 1.5)
const q2R = P(HW / 2, 1.5)
const C2 = P(0, 1.5) // middle base centre
const X3L = P(-HW / 4, 1.25) // crossings inside the middle band (on the bottom tier's sides)
const X3R = P(HW / 4, 1.25)
const L2 = P(-HW, 2) // bottom base corners
const R2 = P(HW, 2)
const q3L = P(-HW / 2, 2)
const q3R = P(HW / 2, 2)

// The three tier outlines.
const OUTLINES: Pt[][] = [
  [A0, L0, R0],
  [Am, L1, R1],
  [C1, L2, R2],
]

// The extra interior strokes actually drawn in the source figure.
const INTERIOR: [Pt, Pt][] = [
  [LmT, C1], // top band: side mid-point → base centre
  [RmT, C1],
  [X3R, q3L], // bottom: from the bottom tier's side, through C2, to a base quarter point
  [X3L, q3R],
]

export interface TriEntry {
  id: number
  points: string
}

// All 16 triangles of the arrangement, bottom band → middle band → top band.
// (Exhaustively verified: these are the ONLY triangles the drawn lines form.)
const ORDER: Pt[][] = [
  // bottom band (4)
  [C2, q3L, q3R], // 1 centre tent
  [L2, X3L, q3R], // 2 big slanted (leans right)
  [R2, X3R, q3L], // 3 big slanted (leans left)
  [C1, L2, R2], // 4 whole bottom tier
  // middle band (6)
  [q2L, X3L, C2], // 5 smallest left
  [C2, X3R, q2R], // 6 smallest right
  [C1, q2L, q2R], // 7 apex tent (under the top base centre)
  [L1, X2L, q2R], // 8 big slanted (leans right)
  [R1, X2R, q2L], // 9 big slanted (leans left)
  [Am, L1, R1], // 10 whole middle tier
  // top band (6)
  [q1L, X2L, C1], // 11 smallest left
  [C1, X2R, q1R], // 12 smallest right
  [Am, q1L, q1R], // 13 apex tent (middle tier's peak)
  [LmT, L0, C1], // 14 lower-left corner
  [RmT, C1, R0], // 15 lower-right corner
  [A0, L0, R0], // 16 whole top tier
]

export const TRIANGLES: TriEntry[] = ORDER.map((p, i) => ({ id: i + 1, points: pts(...p) }))
export const TRI_TOTAL = TRIANGLES.length // 16

// ─── drawing ──────────────────────────────────────────────────────────────────

/** Every black outline stroke of the figure. */
function FigureLines() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      {OUTLINES.map((t, i) => (
        <polygon key={i} points={pts(...t)} />
      ))}
      {INTERIOR.map(([a, b], i) => (
        <line key={`i${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      ))}
    </g>
  )
}

/**
 * Draws the whole tree, filled, and (if `litId` is given) outlines exactly that
 * triangle in orange so the animator can highlight it one at a time.
 * Safe to call with no props — renders the plain problem figure.
 */
export function TriFigure({ litId }: { litId?: number }) {
  const lit = litId ? TRIANGLES.find((t) => t.id === litId) : undefined
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 250 }}
      aria-hidden="true"
    >
      {/* base fill: every tier filled warm yellow */}
      {OUTLINES.map((t, i) => (
        <polygon key={i} points={pts(...t)} fill={TRI_FILL} stroke="none" />
      ))}
      {lit && <polygon points={lit.points} fill={LIT_FILL} stroke="none" opacity={0.9} />}
      <FigureLines />
      {lit && (
        <polygon
          points={lit.points}
          fill="none"
          stroke={LIT_EDGE}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export default function TriCount22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah pohon yang tersusun dari tiga lapis segitiga kuning, kecil dan besar. Berapa banyak segitiga seluruhnya?"
    >
      <TriFigure />
    </div>
  )
}
