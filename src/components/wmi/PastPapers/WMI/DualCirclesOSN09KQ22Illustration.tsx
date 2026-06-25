// OSN-09-SD-KAB-Q22 — Two congruent circles, shaded area = half of one circle.
//
// SOURCE FIGURE (docs/reference/ocr-res/osn/kabupaten/sd/2009.imgs/001.jpg):
// Two congruent circles of diameter 20 cm placed side by side. The shaded region
// (diagonal hatching) sits at the upper-centre of the combined figure. By the
// "cut and rearrange" insight, the shaded region equals exactly half of one
// circle's area = πr²/2 = 3.14 × 10² / 2 = 157 cm².
//
// ANSWER DERIVATION (bound to seed breakdown.quantities):
//   r = 20 ÷ 2 = 10 cm
//   Area of one circle = π × r² = 3.14 × 100 = 314 cm²
//   Shaded region = half of one circle = 314 ÷ 2 = 157 cm²
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.
// The figure shows ONLY the problem (two circles + shading); never the answer.
// Co-exported `DualCirclesOSN09KQ22Primitive` lets the explainer reuse geometry.

const R = 62          // SVG radius (represents real r = 10 cm)
const CX1 = 80        // left circle centre x
const CX2 = 200       // right circle centre x  (externally tangent at x = 142)
const CY = 100        // shared centre y
const W = 280
const H = 200

// Diagonal-hatch pattern id (inline, no external dep)
const HATCH_ID = 'osn09kq22-hatch'

/** Shared geometry for illustration and explainer. */
export function DualCirclesOSN09KQ22Primitive({
  shadeFill = 'url(#' + HATCH_ID + ')',
  shadeOpacity = 1,
  highlightRight = false,
}: {
  shadeFill?: string
  shadeOpacity?: number
  highlightRight?: boolean
}) {
  // The shaded region is the upper semicircle of the RIGHT circle
  // (the half facing the left circle). This is an exact semicircle = πr²/2.
  // Path: start at top of right circle, arc left to bottom of right circle's
  // upper half (the horizontal diameter), close with straight line.
  const topX = CX2
  const topY = CY - R     // top of right circle
  const midLeftX = CX2 - R  // leftmost point of right circle (at mid-height)
  const midRightX = CX2 + R // rightmost point (unused here)

  // Upper semicircle of the RIGHT circle:
  // M (CX2 - R, CY)  ← left edge at center height
  // A R R 0 0 1 (CX2 + R, CY)  ← arc going UP through top, to right edge
  //   then straight line back to start? No — we want the UPPER dome only.
  // M (CX2-R, CY) → arc counterclockwise over the top to (CX2+R, CY) → line back
  // In SVG, arc from (CX2-R, CY) going UP (large-arc=0, sweep=0 for CCW top half):
  // Actually: sweep-flag=1 = clockwise. To go over the TOP:
  // From left edge (CX2-R, CY) arc to right edge (CX2+R, CY) sweep=0 (counter-cw), large-arc=0
  // gives the UPPER semicircle.

  const domePath =
    `M ${CX2 - R} ${CY}` +
    ` A ${R} ${R} 0 0 1 ${CX2 + R} ${CY}` +
    ` L ${CX2 - R} ${CY} Z`

  // Wait — that's sweep=1 (clockwise), which from left going clockwise goes DOWN.
  // Let me reconsider. SVG arc sweep:
  //   sweep-flag=0: counter-clockwise
  //   sweep-flag=1: clockwise
  // From (CX2-R, CY) [left edge] to (CX2+R, CY) [right edge]:
  //   Clockwise (sweep=1) → goes DOWNWARD (lower semicircle)
  //   Counter-clockwise (sweep=0) → goes UPWARD (upper semicircle) ← we want this

  const upperSemiPath =
    `M ${CX2 - R} ${CY}` +
    ` A ${R} ${R} 0 0 0 ${CX2 + R} ${CY}` +
    ` Z`

  return (
    <>
      <defs>
        <pattern id={HATCH_ID} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#2563EB" strokeWidth="1.5" />
        </pattern>
      </defs>

      {/* Shaded upper-semicircle of right circle (the problem figure) */}
      <path
        d={upperSemiPath}
        fill={shadeFill}
        fillOpacity={shadeOpacity}
        stroke="none"
      />

      {/* Left circle */}
      <circle
        cx={CX1}
        cy={CY}
        r={R}
        fill="white"
        stroke={highlightRight ? '#CBD5E1' : '#1E293B'}
        strokeWidth="2.5"
      />

      {/* Right circle */}
      <circle
        cx={CX2}
        cy={CY}
        r={R}
        fill="none"
        stroke="#1E293B"
        strokeWidth="2.5"
      />

      {/* Diameter label for right circle */}
      <line
        x1={CX2 - R}
        y1={CY}
        x2={CX2 + R}
        y2={CY}
        stroke="#64748B"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      <text x={CX2} y={CY + 14} textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="sans-serif">
        20 cm
      </text>

      {/* Diameter label for left circle */}
      <line
        x1={CX1 - R}
        y1={CY}
        x2={CX1 + R}
        y2={CY}
        stroke="#64748B"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      <text x={CX1} y={CY + 14} textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="sans-serif">
        20 cm
      </text>
    </>
  )
}

export default function DualCirclesOSN09KQ22Illustration() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-label="Dua lingkaran kongruen berdiameter 20 cm; daerah arsiran adalah setengah dari satu lingkaran"
      role="img"
    >
      <DualCirclesOSN09KQ22Primitive />
    </svg>
  )
}
