/**
 * SEAMO-20-B-Q25 — Two nested squares with L-shaped shaded region.
 *
 * "The figure shows 2 squares of different sizes. The area of the shaded region
 *  is 25 cm². Find the perimeter (in cm) of the shaded region, given that the
 *  side length of the square is a natural number."
 *
 * Source figure: docs/reference/ocr-res/seamo/contest/paper-b/2020.imgs/022.jpg
 *
 * Geometry: large square (side a=13) with small square (side b=12) placed flush
 * at the bottom-right corner. The shaded L-shaped region = a² − b² = 25 cm².
 * The small square is NOT shown with a bottom border (it's interior to the large).
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion, no Date/random.
 */

// ── palette ───────────────────────────────────────────────────────────────────
const SHADE_FILL   = '#FECACA'   // light red fill (matches source red hatching)
const SHADE_STROKE = '#DC2626'   // red border
const INNER_FILL   = '#FFFFFF'   // white inner square
const STROKE_CLR   = '#1F2937'   // dark outline

// ── geometry (proportional — a:b = 13:12 roughly 1:0.923) ────────────────────
const PAD  = 20          // margin inside viewBox
const A    = 160         // large square side in px
const B    = Math.round(A * 12 / 13)  // inner square side in px ≈ 148
const VW   = A + 2 * PAD
const VH   = A + 2 * PAD

// Large square top-left corner
const LX = PAD
const LY = PAD

// Small square is flush with the bottom-right of the large square
const SX = LX + (A - B)   // top-left x of inner square
const SY = LY + (A - B)   // top-left y of inner square

// ── label positions ───────────────────────────────────────────────────────────
const LABEL_A_X = LX + A / 2
const LABEL_A_Y = LY + A + 14
const LABEL_B_X = SX + B / 2
const LABEL_B_Y = SY + B + 14   // below small square (which is at bottom edge → outside)
const SHADE_LABEL_X = LX + (A - B) / 2
const SHADE_LABEL_Y = LY + (A - B) / 2

export default function LShadeSquares20B25() {
  // L-shaped shaded path: outer square minus inner square cutout (bottom-right)
  // Outer square corners: (LX,LY), (LX+A,LY), (LX+A,LY+A), (LX,LY+A)
  // Inner square (cutout) top-left: (SX,SY)
  // The L-shape is: start at top-left of big square, go around its perimeter,
  // then cut the inner square out by going around it in opposite winding.
  const shadeD = [
    `M ${LX} ${LY}`,
    `L ${LX + A} ${LY}`,
    `L ${LX + A} ${LY + A}`,
    `L ${LX} ${LY + A}`,
    `Z`,
    // Inner cutout (clockwise when outer is clockwise → evenodd rule removes it)
    `M ${SX} ${SY}`,
    `L ${SX + B} ${SY}`,
    `L ${SX + B} ${SY + B}`,
    `L ${SX} ${SY + B}`,
    `Z`,
  ].join(' ')

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={VW}
      height={VH}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Two squares: large outer square with small inner square at bottom-right, shaded L-region between them"
    >
      {/* Shaded L-region via evenodd fill rule */}
      <path
        d={shadeD}
        fill={SHADE_FILL}
        fillRule="evenodd"
        stroke={SHADE_STROKE}
        strokeWidth={1.5}
      />

      {/* Inner white square drawn on top to ensure clean white fill */}
      <rect
        x={SX}
        y={SY}
        width={B}
        height={B}
        fill={INNER_FILL}
        stroke={STROKE_CLR}
        strokeWidth={2}
      />

      {/* Outer square border */}
      <rect
        x={LX}
        y={LY}
        width={A}
        height={A}
        fill="none"
        stroke={STROKE_CLR}
        strokeWidth={2}
      />

      {/* Side-length labels */}
      {/* Label 'a' below large square */}
      <text
        x={LABEL_A_X}
        y={LABEL_A_Y}
        textAnchor="middle"
        fontSize={13}
        fontFamily="sans-serif"
        fill={STROKE_CLR}
      >
        a
      </text>

      {/* Label 'b' inside the inner square (centered) */}
      <text
        x={SX + B / 2}
        y={SY + B / 2 + 5}
        textAnchor="middle"
        fontSize={13}
        fontFamily="sans-serif"
        fill="#6B7280"
      >
        b
      </text>

      {/* Shaded area label */}
      <text
        x={SHADE_LABEL_X}
        y={SHADE_LABEL_Y}
        textAnchor="middle"
        fontSize={11}
        fontFamily="sans-serif"
        fill="#991B1B"
      >
        25 cm²
      </text>
    </svg>
  )
}
