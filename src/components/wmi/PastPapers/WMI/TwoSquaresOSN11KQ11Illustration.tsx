// OSN-11-SD-KAB-Q11 — "Bangun pada gambar dibentuk dari dua buah persegi."
//
// PROBLEM ONLY: the L-shaped compound of two squares — a larger square (bottom)
// with a smaller square sitting on its top-right corner, right-edges flush.
// Faithfully reproduces 2011.imgs/001.jpg.
//
// Does NOT reveal the side lengths (6 and 8 cm) or the perimeter answer (44 cm).
// Those are deduced in the explainer.
//
// Pure-SVG, SSR-safe, no hooks, no framer-motion.

export const SVG_W = 180
export const SVG_H = 240

/** px per cm */
export const SCALE = 12

/** Large square side in px (8 cm) */
export const LARGE = 8 * SCALE  // 96

/** Small square side in px (6 cm) */
export const SMALL = 6 * SCALE  // 72

/** Top-left x of the large square */
export const LX = 42

/** Top-left y of the large square */
export const LY = SVG_H - 28 - LARGE  // 116

/** Top-left x of the small square (right-aligned with large) */
export const SX = LX + (LARGE - SMALL)  // 66

/** Top-left y of the small square */
export const SY = LY - SMALL  // 44

/** The L-shaped outline path */
export const OUTLINE = `M ${SX},${SY} L ${LX + LARGE},${SY} L ${LX + LARGE},${LY + LARGE} L ${LX},${LY + LARGE} L ${LX},${LY} L ${SX},${LY} Z`

export const COLOR = {
  FILL:   '#EFF6FF',
  STROKE: '#2563EB',
  LABEL:  '#1F2937',
} as const

export default function TwoSquaresOSN11KQ11Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-label="Dua persegi yang digabungkan"
    >
      {/* compound L-shape */}
      <path
        d={OUTLINE}
        fill={COLOR.FILL}
        stroke={COLOR.STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* centre area label */}
      <text
        x={LX + LARGE / 2}
        y={LY + LARGE / 2 + 5}
        textAnchor="middle"
        fontSize={11}
        fill={COLOR.LABEL}
        fontFamily="sans-serif"
      >
        Luas gabungan
      </text>
      <text
        x={LX + LARGE / 2}
        y={LY + LARGE / 2 + 20}
        textAnchor="middle"
        fontSize={11}
        fill={COLOR.LABEL}
        fontFamily="sans-serif"
      >
        = 100 cm²
      </text>
    </svg>
  )
}
