// "Cake cut" figure for WMI-24P1A-Q22 (2024 Grade 1 Semifinal, Paper A).
//
// "Cut the cake into two pieces along the dotted lines so the sum of the numbers
//  on each piece is the same. Which option shows the correct cut?"
//
// Recovered from db/seed/wmi/figures/2024-semifinal-g1-a-q22.jpg: a square cake.
// Dotted lines join the four edge-midpoints into an inscribed diamond, splitting
// the square into four corner triangles + a centre diamond. The numbers:
//
//        8  ......  22          corner TL = 8,  corner TR = 22
//          \      /
//            (5)               centre diamond = 5
//          /      \
//       16  ......  9           corner BL = 16, corner BR = 9
//
// Total = 8 + 22 + 5 + 16 + 9 = 60, so each piece must total 60 / 2 = 30.
// The ONLY balanced split is { 8, 22 } = 30  vs  { 5, 16, 9 } = 30 (verified by
// brute force over the five regions). The cut follows the two UPPER diamond
// edges — the path Left-midpoint → Top-midpoint → Right-midpoint — lifting off
// the two top triangles. That is option E.
//
// The choice images (A–E) are not reproducible here, so the static figure draws
// ONLY the cake (the problem). The explainer reveals the cut and the 30 / 30
// split, indicating option E.
//
// Pure render — no window/document/Math.random/Date. SSR-safe & deterministic.

export const CORNER_TL = 8
export const CORNER_TR = 22
export const CENTRE = 5
export const CORNER_BL = 16
export const CORNER_BR = 9

export const TOTAL = CORNER_TL + CORNER_TR + CENTRE + CORNER_BL + CORNER_BR // 60
export const HALF = TOTAL / 2 // 30
export const TOP_PIECE = CORNER_TL + CORNER_TR // 8 + 22 = 30
export const BOTTOM_PIECE = CENTRE + CORNER_BL + CORNER_BR // 5 + 16 + 9 = 30
export const ANSWER_LETTER = 'E'

// ---------------------------------------------------------------------------
// Geometry — a square with its four edge-midpoints as the diamond vertices.
// ---------------------------------------------------------------------------

export const SQ = 200 // square side
const PAD = 28 // outer padding so number labels never clip
export const VIEW = SQ + PAD * 2

const X0 = PAD
const Y0 = PAD
const X1 = PAD + SQ
const Y1 = PAD + SQ
const MX = PAD + SQ / 2 // mid x
const MY = PAD + SQ / 2 // mid y

// Diamond vertices = edge midpoints.
const TOP = { x: MX, y: Y0 }
const RIGHT = { x: X1, y: MY }
const BOTTOM = { x: MX, y: Y1 }
const LEFT = { x: X0, y: MY }
const CENTRE_PT = { x: MX, y: MY }

const INK = '#5B4636' // warm cake outline
const DOT = '#B8A48E' // dotted guide lines
const CAKE_FILL = '#FFF6E6'
const NUM_INK = '#5B4636'
const TOP_TINT = '#FFE0B2' // top piece shade (explainer)
const BOTTOM_TINT = '#C8E6C9' // bottom piece shade (explainer)
const CUT_STROKE = '#E65100' // the chosen cut, drawn solid (explainer)

export interface CakeQ22Props {
  /**
   * Shade the two pieces of the balanced cut:
   *   'top'    → the two top triangles (8 + 22)
   *   'bottom' → centre + two bottom triangles (5 + 16 + 9)
   *   'both'   → both shaded
   * The static problem passes nothing.
   */
  shade?: 'top' | 'bottom' | 'both' | null
  /** Draw the chosen cut (Left-mid → Top-mid → Right-mid) as a solid line. */
  showCut?: boolean
  /** Show a "= 30" badge on a shaded piece: 'top', 'bottom', or 'both'. */
  showSums?: 'top' | 'bottom' | 'both' | null
}

/** Reusable primitive: the cake. Shared with the explainer. */
export function CakeQ22({ shade = null, showCut = false, showSums = null }: CakeQ22Props) {
  const shadeTop = shade === 'top' || shade === 'both'
  const shadeBottom = shade === 'bottom' || shade === 'both'

  // Top piece = the two top triangles, bounded by the square's top edge and the
  // path LEFT → TOP-vertex... actually the two UPPER diamond edges meet at TOP.
  // The top piece outline: square top-left corner → TOP diamond vertex region.
  // Two top triangles together form the polygon:
  //   (X0,Y0) → (X1,Y0) → RIGHT → TOP → LEFT → back to (X0,Y0)
  const topPiece = `${X0},${Y0} ${X1},${Y0} ${RIGHT.x},${RIGHT.y} ${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y}`
  // Bottom piece = the rest (centre diamond + 2 bottom triangles):
  //   LEFT → TOP → RIGHT → (X1,Y1) → (X0,Y1) → back to LEFT
  const bottomPiece = `${LEFT.x},${LEFT.y} ${TOP.x},${TOP.y} ${RIGHT.x},${RIGHT.y} ${X1},${Y1} ${X0},${Y1}`

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* cake body */}
      <rect x={X0} y={Y0} width={SQ} height={SQ} rx={10} fill={CAKE_FILL} stroke={INK} strokeWidth={2.6} />

      {/* shaded pieces (explainer) */}
      {shadeTop && <polygon points={topPiece} fill={TOP_TINT} opacity={0.85} />}
      {shadeBottom && <polygon points={bottomPiece} fill={BOTTOM_TINT} opacity={0.85} />}
      {/* re-stroke the cake outline on top of any shading */}
      <rect x={X0} y={Y0} width={SQ} height={SQ} rx={10} fill="none" stroke={INK} strokeWidth={2.6} />

      {/* dotted diamond (the four candidate cut lines) */}
      <polygon
        points={`${TOP.x},${TOP.y} ${RIGHT.x},${RIGHT.y} ${BOTTOM.x},${BOTTOM.y} ${LEFT.x},${LEFT.y}`}
        fill="none"
        stroke={DOT}
        strokeWidth={2}
        strokeDasharray="3 4"
      />

      {/* the chosen cut, solid (explainer): LEFT → TOP → RIGHT */}
      {showCut && (
        <polyline
          points={`${LEFT.x},${LEFT.y} ${TOP.x},${TOP.y} ${RIGHT.x},${RIGHT.y}`}
          fill="none"
          stroke={CUT_STROKE}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* numbers */}
      <text x={X0 + 26} y={Y0 + 26} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={NUM_INK}>
        {CORNER_TL}
      </text>
      <text x={X1 - 26} y={Y0 + 26} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={NUM_INK}>
        {CORNER_TR}
      </text>
      <text x={CENTRE_PT.x} y={CENTRE_PT.y} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={NUM_INK}>
        {CENTRE}
      </text>
      <text x={X0 + 26} y={Y1 - 26} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={NUM_INK}>
        {CORNER_BL}
      </text>
      <text x={X1 - 26} y={Y1 - 26} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={NUM_INK}>
        {CORNER_BR}
      </text>

      {/* "= 30" badges */}
      {(showSums === 'top' || showSums === 'both') && (
        <SumBadge x={MX} y={Y0 - 14} value={HALF} />
      )}
      {(showSums === 'bottom' || showSums === 'both') && (
        <SumBadge x={MX} y={Y1 + 14} value={HALF} />
      )}
    </svg>
  )
}

function SumBadge({ x, y, value }: { x: number; y: number; value: number }) {
  return (
    <g>
      <rect x={x - 26} y={y - 12} width={52} height={24} rx={12} fill="#065F46" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill="#FFFFFF">
        {`= ${value}`}
      </text>
    </g>
  )
}

export default function P24G1Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A square cake with dotted lines joining the edge midpoints into a diamond. The four corners hold 8, 22, 16 and 9, and the centre holds 5. Cut along the dotted lines into two pieces with equal sums."
    >
      <CakeQ22 />
    </div>
  )
}
