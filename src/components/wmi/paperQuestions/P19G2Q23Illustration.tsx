/**
 * WMI-19P2A-Q23 (2019 Grade 2 Semifinal, Paper A) — "count the triangles".
 *
 * Redrawn from db/seed/wmi/figures/2019-semifinal-g2-a-q23.jpg (NOT embedded):
 * a tall "rocket / lighthouse" composite —
 *   - TOP: a vertical rectangle crossed by both diagonals (an X inside).
 *   - BOTTOM: a wide triangular flare hanging off the rectangle's base, with a
 *     fan of internal lines from the flare's apex down to its base.
 *
 * Every triangle in this figure was ENUMERATED by brute force (all triples of
 * named points whose three sides each lie on a drawn line and which are not
 * collinear). The construction below contains exactly 19 distinct triangles,
 * matching the answer key (choice B = 19). The reveal `ORDER` lights them up
 * one at a time, smallest groups first.
 *
 * Co-exports the data the explainer binds to:
 *   TRIANGLES  — every triangle as an SVG polygon points string, in reveal order
 *   TRI_TOTAL  — 19
 *   RocketFigure — draws the whole figure and outlines triangle `litId` if given
 *
 * This file draws ONLY the problem (the figure + the "△ = ( )" prompt is left to
 * the card). Pure render — no window/document, no Math.random/Date.
 * SSR-safe + deterministic.
 */

type Pt = [number, number]

// ─── named points (verified geometry) ───────────────────────────────────────
const PTS: Record<string, Pt> = {
  TL: [70, 14],
  TR: [170, 14],
  BL: [70, 164],
  BR: [170, 164],
  Cc: [120, 89], // rectangle centre (diagonals cross here)
  Mb: [120, 164], // flare apex = rectangle bottom centre
  FL: [20, 284], // flare base, far left
  FR: [220, 284], // flare base, far right
  BC: [120, 284], // flare base centre
  q1: [70, 284], // flare base, left quarter (below BL)
  q2: [170, 284], // flare base, right quarter (below BR)
}

const P = (n: string) => PTS[n]
const poly = (...names: string[]) => names.map((n) => P(n).join(',')).join(' ')

// ─── drawn strokes (each a maximal straight line of the figure) ───────────────
const STROKES: string[][] = [
  ['TL', 'TR'], // rectangle top edge
  ['TL', 'BL'], // rectangle left edge
  ['TR', 'BR'], // rectangle right edge
  ['BL', 'Mb', 'BR'], // rectangle bottom edge (through flare apex)
  ['TL', 'Cc', 'BR'], // rectangle diagonal "\"
  ['TR', 'Cc', 'BL'], // rectangle diagonal "/"
  ['FL', 'q1', 'BC', 'q2', 'FR'], // flare base
  ['Mb', 'FL'], // flare outer-left side
  ['Mb', 'FR'], // flare outer-right side
  ['Mb', 'q1'], // flare fan cevian
  ['Mb', 'BC'], // flare fan cevian (centre)
  ['Mb', 'q2'], // flare fan cevian
  ['BL', 'FL'], // extra left flare slant (the 19th triangle's edge)
]

// ─── the 19 triangles, in reveal order (small/simple → larger combined) ──────
const ORDER: string[][] = [
  // top rectangle: 4 quadrant triangles first, then the 4 half-triangles
  ['TL', 'TR', 'Cc'],
  ['TR', 'BR', 'Cc'],
  ['BL', 'BR', 'Cc'],
  ['TL', 'BL', 'Cc'],
  ['TL', 'TR', 'BL'],
  ['TL', 'TR', 'BR'],
  ['TL', 'BL', 'BR'],
  ['TR', 'BL', 'BR'],
  // flare: the small fan triangles
  ['Mb', 'q1', 'BC'],
  ['Mb', 'BC', 'q2'],
  ['BL', 'Mb', 'FL'], // the extra left slant triangle
  ['Mb', 'FL', 'q1'],
  ['Mb', 'q2', 'FR'],
  // flare: medium combined triangles
  ['Mb', 'q1', 'q2'],
  ['Mb', 'FL', 'BC'],
  ['Mb', 'BC', 'FR'],
  ['Mb', 'FL', 'q2'],
  ['Mb', 'q1', 'FR'],
  // flare: the whole base triangle
  ['Mb', 'FL', 'FR'],
]

export interface TriEntry {
  id: number
  points: string
}

export const TRIANGLES: TriEntry[] = ORDER.map((names, i) => ({ id: i + 1, points: poly(...names) }))
export const TRI_TOTAL = TRIANGLES.length // 19

// ─── colour tokens ──────────────────────────────────────────────────────────
const LINE = '#2B2118'
const FILL = '#FFF4DA'
const LIT_FILL = '#FF8A3D'
const LIT_EDGE = '#30598A'

export const VIEW_W = 240
export const VIEW_H = 300

/**
 * Draws the whole rocket figure. If `litId` is given, that one triangle is
 * filled orange and ringed in blue so the explainer can highlight it.
 * Safe with no props — renders the plain problem figure.
 */
export function RocketFigure({ litId }: { litId?: number }) {
  const lit = litId ? TRIANGLES.find((t) => t.id === litId) : undefined
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 250 }}
      aria-hidden="true"
    >
      {/* pale fill of the two outer regions for body */}
      <polygon points={poly('TL', 'TR', 'BR', 'BL')} fill={FILL} stroke="none" />
      <polygon points={poly('Mb', 'FL', 'FR')} fill={FILL} stroke="none" />

      {lit && <polygon points={lit.points} fill={LIT_FILL} stroke="none" opacity={0.9} />}

      {/* every drawn stroke */}
      <g fill="none" stroke={LINE} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
        {STROKES.map((s, i) => (
          <polyline key={i} points={s.map((n) => P(n).join(',')).join(' ')} />
        ))}
      </g>

      {lit && (
        <polygon points={lit.points} fill="none" stroke={LIT_EDGE} strokeWidth={3.2} strokeLinejoin="round" />
      )}
    </svg>
  )
}

export default function P19G2Q23Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A tall rocket-shaped figure: a rectangle crossed by both diagonals on top, sitting on a wide triangular flare divided by internal lines. How many triangles are in the figure?"
    >
      <RocketFigure />
    </div>
  )
}
