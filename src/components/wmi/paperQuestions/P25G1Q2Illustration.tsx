// Static card illustration for WMI-25P1A-Q2 (2025 Grade-1 Semifinal, Q2).
//
// "As shown, which fraction is used to represent the shaded region?"
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q2.jpg:
//
// A square is divided by ONE vertical + ONE horizontal midline into 4 equal
// quadrant-squares. The TOP-LEFT quadrant is shaded. The two RIGHT quadrants
// each carry a single diagonal (top-right: "\" ; bottom-right: "/") and the
// bottom-left quadrant carries a "/" diagonal — exactly as in the scan. Those
// diagonals are decoy subdivisions; the equal-parts framing is the 4 quadrants.
//
// The shaded quadrant is 1 of the 4 equal squares => 1/4 (answer A). This
// component draws ONLY the figure — it never writes "1/4" or otherwise reveals
// the answer.
//
// Pure render — no random, no dates, SSR-safe & deterministic.

const INK = '#1F2937'
const SHADE = '#C8C5E8' // soft lavender wash matching the scan
const WHITE = '#FFFFFF'

// One unit-square grid: the outer square spans [0,2] x [0,2] in grid units, so
// each quadrant is a 1x1 cell. Scaled up by CELL for the viewBox.
const CELL = 86 // pixels per quadrant side
const PAD = 14 // breathing room so strokes never clip
const SIDE = CELL * 2 // outer square side in px
export const Q2_VIEW = SIDE + PAD * 2

/** Diagonal direction inside a quadrant: "bslash" = "\", "fslash" = "/". */
export type Diag = 'bslash' | 'fslash' | null

export interface FractionSquareProps {
  /** Highlight the top-left quadrant (the shaded region). Default true. */
  shadeTopLeft?: boolean
  /** Draw the 2x2 quadrant grid lines bold to emphasise the 4 equal parts. */
  emphasiseQuadrants?: boolean
}

/**
 * The divided square. Co-exported primitive so the explainer can re-use the
 * exact same geometry and toggle the shading / quadrant emphasis per beat.
 */
export function FractionSquare({ shadeTopLeft = true, emphasiseQuadrants = false }: FractionSquareProps) {
  // quadrant origins (top-left corner of each), in px, inside the padded box
  const x0 = PAD
  const y0 = PAD
  const xm = PAD + CELL
  const ym = PAD + CELL

  // decoy diagonals per quadrant (matching the scan)
  const diagTopRight: [number, number, number, number] = [xm, y0, xm + CELL, y0 + CELL] // "\"
  const diagBottomLeft: [number, number, number, number] = [x0, y0 + CELL + CELL, x0 + CELL, y0 + CELL] // "/"
  const diagBottomRight: [number, number, number, number] = [xm, y0 + CELL + CELL, xm + CELL, y0 + CELL] // "/"

  const gridW = emphasiseQuadrants ? 3.5 : 2

  return (
    <svg
      viewBox={`0 0 ${Q2_VIEW} ${Q2_VIEW}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* white backdrop */}
      <rect x={x0} y={y0} width={SIDE} height={SIDE} fill={WHITE} />

      {/* shaded top-left quadrant */}
      {shadeTopLeft && <rect x={x0} y={y0} width={CELL} height={CELL} fill={SHADE} />}

      {/* decoy diagonals */}
      <line x1={diagTopRight[0]} y1={diagTopRight[1]} x2={diagTopRight[2]} y2={diagTopRight[3]} stroke={INK} strokeWidth={2} />
      <line x1={diagBottomLeft[0]} y1={diagBottomLeft[1]} x2={diagBottomLeft[2]} y2={diagBottomLeft[3]} stroke={INK} strokeWidth={2} />
      <line x1={diagBottomRight[0]} y1={diagBottomRight[1]} x2={diagBottomRight[2]} y2={diagBottomRight[3]} stroke={INK} strokeWidth={2} />

      {/* quadrant grid: vertical + horizontal midline */}
      <line x1={xm} y1={y0} x2={xm} y2={y0 + SIDE} stroke={INK} strokeWidth={gridW} />
      <line x1={x0} y1={ym} x2={x0 + SIDE} y2={ym} stroke={INK} strokeWidth={gridW} />

      {/* outer border */}
      <rect x={x0} y={y0} width={SIDE} height={SIDE} fill="none" stroke={INK} strokeWidth={2.5} />
    </svg>
  )
}

export default function P25G1Q2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A square split into four equal smaller squares by a vertical and a horizontal line; the top-left smaller square is shaded. The two right squares and the bottom-left square each have one diagonal line."
    >
      <FractionSquare />
    </div>
  )
}
