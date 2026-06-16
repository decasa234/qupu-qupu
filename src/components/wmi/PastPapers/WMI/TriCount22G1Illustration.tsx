/**
 * WMI-22F1A-Q19 — "How many triangles are in the figure?" (Grade 1, answer 16).
 *
 * The figure is a fir-tree built from THREE triangular tiers stacked top to
 * bottom, each tier overlapping the one above so the apexes poke up like a
 * Christmas tree. Reconstructed line-for-line from the source scan
 * (db/seed/wmi/figures/2022-final-g1-a-q19.jpg):
 *
 *   - The ONLY horizontal lines are the three tier bases. There are NO
 *     horizontal mid-lines — the source has none.
 *   - Top tier and middle tier each carry the same internal lattice: two lines
 *     from the tier's mid-height centre down to the two base quarter-points,
 *     plus two lines from the side mid-points down to the base centre. These
 *     four interior lines cross to give an inverted centre triangle, two
 *     lower-corner upright triangles and two smallest upright triangles.
 *     => 6 triangles per tier (1 whole + 1 inverted centre + 2 corners + 2 small).
 *   - The bottom tier is simpler: just two lines from its apex to the two base
 *     quarter-points (no crossings). => 4 triangles (1 whole + left + centre + right).
 *
 *   Counting every triangle of every size:
 *       top tier    6
 *       middle tier 6
 *       bottom tier 4
 *       = 16 triangles total  (matches the answer key)
 *
 * A throwaway enumeration (npx tsx) confirmed exactly 16 distinct,
 * non-degenerate triangles in this construction before it was committed.
 *
 * This module co-exports the data the animator needs to reveal one triangle
 * per beat:
 *   TRI_TOTAL  — 16
 *   TRIANGLES  — every triangle as an SVG polygon points string, ordered
 *                small-first within each tier, bottom tier → top
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
export const VIEW_H = 376

type Pt = [number, number]
const HW = 100 // half base width of every tier
const H = 175 // apex-to-base height of every tier
const CX = 110 // shared horizontal centre

const pts = (...p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ')

// A tier: apex at (CX, ay), base from (CX-HW, by) to (CX+HW, by).
function tier(ay: number) {
  const by = ay + H
  const A: Pt = [CX, ay] // apex
  const L: Pt = [CX - HW, by] // base left corner
  const R: Pt = [CX + HW, by] // base right corner
  const b1: Pt = [CX - HW / 2, by] // base left quarter point
  const bc: Pt = [CX, by] // base centre
  const b2: Pt = [CX + HW / 2, by] // base right quarter point
  const Lm: Pt = [CX - HW / 2, ay + H / 2] // mid-point of left edge
  const Rm: Pt = [CX + HW / 2, ay + H / 2] // mid-point of right edge
  const C: Pt = [CX, ay + H / 2] // centre at mid-height
  // exact crossings of (C→b1 with Lm→bc) and (C→b2 with Rm→bc)
  const X1: Pt = [CX - HW / 4, ay + H * 0.75]
  const X2: Pt = [CX + HW / 4, ay + H * 0.75]
  return { A, L, R, b1, bc, b2, Lm, Rm, C, X1, X2 }
}

// Tier apexes sit a half-height apart, so each tier overlaps the one above.
const TOP = tier(10)
const MID = tier(100)
const BOT = tier(190)

// The interior strokes actually drawn in the source figure (no horizontal mids).
const TOP_LINES: [Pt, Pt][] = [
  [TOP.C, TOP.b1],
  [TOP.C, TOP.b2],
  [TOP.Lm, TOP.bc],
  [TOP.Rm, TOP.bc],
]
const MID_LINES: [Pt, Pt][] = [
  [MID.C, MID.b1],
  [MID.C, MID.b2],
  [MID.Lm, MID.bc],
  [MID.Rm, MID.bc],
]
const BOT_LINES: [Pt, Pt][] = [
  [BOT.A, BOT.b1],
  [BOT.A, BOT.b2],
]

export interface TriEntry {
  id: number
  points: string
}

// The 6 triangles of a top/middle tier, smallest first.
function midPatternTris(t: ReturnType<typeof tier>): Pt[][] {
  return [
    [t.b1, t.bc, t.X1], // smallest left
    [t.bc, t.b2, t.X2], // smallest right
    [t.C, t.b1, t.b2], // inverted centre
    [t.Lm, t.L, t.bc], // lower-left upright
    [t.Rm, t.bc, t.R], // lower-right upright
    [t.A, t.L, t.R], // whole tier
  ]
}

// The 4 triangles of the bottom tier, smallest first.
function bottomTris(t: ReturnType<typeof tier>): Pt[][] {
  return [
    [t.A, t.L, t.b1], // left
    [t.A, t.b1, t.b2], // centre
    [t.A, t.b2, t.R], // right
    [t.A, t.L, t.R], // whole tier
  ]
}

// Reveal order: bottom tier first, then middle, then top (root → crown).
const ORDER: Pt[][] = [
  ...bottomTris(BOT), // 1–4
  ...midPatternTris(MID), // 5–10
  ...midPatternTris(TOP), // 11–16
]

export const TRIANGLES: TriEntry[] = ORDER.map((p, i) => ({ id: i + 1, points: pts(...p) }))
export const TRI_TOTAL = TRIANGLES.length // 16

// ─── drawing ──────────────────────────────────────────────────────────────────

/** Every black outline stroke of the figure. */
function FigureLines() {
  const interior = [...TOP_LINES, ...MID_LINES, ...BOT_LINES]
  return (
    <g fill="none" stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      {/* outer tier triangles (outline + base) */}
      {[TOP, MID, BOT].map((t, i) => (
        <polygon key={i} points={pts(t.A, t.L, t.R)} />
      ))}
      {/* interior lattice strokes */}
      {interior.map(([a, b], i) => (
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
      {[TOP, MID, BOT].map((t, i) => (
        <polygon key={i} points={pts(t.A, t.L, t.R)} fill={TRI_FILL} stroke="none" />
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
