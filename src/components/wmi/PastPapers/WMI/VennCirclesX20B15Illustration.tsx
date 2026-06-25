/**
 * SEAMOX-20-B-Q15 — stem illustration: 3-circle Venn diagram.
 *
 * OCR source: docs/reference/ocr-res/seamo-x/contest/paper-b/2020.md Q15,
 * image reference: 2020.imgs/005.jpg
 *
 * FIGURE: Three overlapping circles arranged in a triangle. Each circle
 * holds one letter (A, B, C) in its non-overlapping region. The three
 * pair-overlap zones hold fixed numbers (4, 1, 6). The triple-overlap
 * centre holds the letter D.
 *
 *   Circle top    (A): regions A  + 4 + D + 1  = 15  →  A + D = 10
 *   Circle btm-L  (B): regions B  + 4 + D + 6  = 15  →  B + D = 5
 *   Circle btm-R  (C): regions C  + 1 + D + 6  = 15  →  C + D = 8
 *
 * Solution: {A,B,C,D} = {7,2,5,3} (one permutation of {2,3,5,7}).
 * A = 7 (answer).
 *
 * No primitive matches a 3-circle Venn layout (NodeGraph is node-and-edge,
 * not overlapping circles). SVG written fresh; faithfully mirrors the source.
 *
 * SSR-safe — pure SVG, no hooks, no framer-motion.
 */

// ── Layout constants ───────────────────────────────────────────────────────────

const W  = 220
const H  = 210
const R  = 72          // circle radius
const CX = W / 2      // 110

// Three circle centres forming an equilateral triangle:
// Top circle centre
const T  = { x: CX,      y: 62 }
// Bottom-left circle centre (60° below left)
const BL = { x: CX - 52, y: 152 }
// Bottom-right circle centre
const BR = { x: CX + 52, y: 152 }

// ── Colour tokens ──────────────────────────────────────────────────────────────

const CIRCLE_STROKE  = '#30598A'
const CIRCLE_FILL    = 'none'
const CIRCLE_SW      = 2.4
const LETTER_COLOR   = '#1F2937'
const NUMBER_COLOR   = '#374151'

// ── Sub-component (exported for the explainer to reuse) ───────────────────────

export interface VennCirclesX20B15SVGProps {
  /** Highlight one of the three circles: 'top' | 'bl' | 'br' | null */
  highlightCircle?: 'top' | 'bl' | 'br' | null
  /** Reveal the solved values instead of letters A/B/C/D */
  solved?: boolean
}

/**
 * VennCirclesX20B15SVG — the raw SVG for the Venn diagram.
 * Co-exported so the explainer can import and animate it.
 */
export function VennCirclesX20B15SVG({
  highlightCircle = null,
  solved = false,
}: VennCirclesX20B15SVGProps) {
  const highlightStroke = '#F59E0B'  // amber for active circle
  const highlightSW     = 3.8

  const topStroke  = highlightCircle === 'top' ? highlightStroke : CIRCLE_STROKE
  const blStroke   = highlightCircle === 'bl'  ? highlightStroke : CIRCLE_STROKE
  const brStroke   = highlightCircle === 'br'  ? highlightStroke : CIRCLE_STROKE
  const topSW      = highlightCircle === 'top' ? highlightSW : CIRCLE_SW
  const blSW       = highlightCircle === 'bl'  ? highlightSW : CIRCLE_SW
  const brSW       = highlightCircle === 'br'  ? highlightSW : CIRCLE_SW

  // Letter labels: show solved values or unknowns
  const labelA = solved ? '7' : 'A'
  const labelB = solved ? '2' : 'B'
  const labelC = solved ? '5' : 'C'
  const labelD = solved ? '3' : 'D'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* ── Three overlapping circles ────────────────────────────────────── */}

      {/* Top circle (A) */}
      <circle
        cx={T.x}  cy={T.y}  r={R}
        fill={CIRCLE_FILL}
        stroke={topStroke}
        strokeWidth={topSW}
      />

      {/* Bottom-left circle (B) */}
      <circle
        cx={BL.x} cy={BL.y} r={R}
        fill={CIRCLE_FILL}
        stroke={blStroke}
        strokeWidth={blSW}
      />

      {/* Bottom-right circle (C) */}
      <circle
        cx={BR.x} cy={BR.y} r={R}
        fill={CIRCLE_FILL}
        stroke={brStroke}
        strokeWidth={brSW}
      />

      {/* ── Region labels ───────────────────────────────────────────────── */}

      {/* A — top circle, non-overlap region (upper area) */}
      <text
        x={T.x} y={T.y - 36}
        textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={700}
        fill={highlightCircle === 'top' ? highlightStroke : LETTER_COLOR}
        className="font-display"
      >
        {labelA}
      </text>

      {/* B — bottom-left, non-overlap region (lower-left) */}
      <text
        x={BL.x - 30} y={BL.y + 22}
        textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={700}
        fill={highlightCircle === 'bl' ? highlightStroke : LETTER_COLOR}
        className="font-display"
      >
        {labelB}
      </text>

      {/* C — bottom-right, non-overlap region (lower-right) */}
      <text
        x={BR.x + 30} y={BR.y + 22}
        textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={700}
        fill={highlightCircle === 'br' ? highlightStroke : LETTER_COLOR}
        className="font-display"
      >
        {labelC}
      </text>

      {/* 4 — A∩B overlap (left lens), not in C */}
      <text
        x={CX - 32} y={107}
        textAnchor="middle" dominantBaseline="central"
        fontSize={17} fontWeight={700}
        fill={NUMBER_COLOR}
        className="font-display"
      >
        4
      </text>

      {/* 1 — A∩C overlap (right lens), not in B */}
      <text
        x={CX + 32} y={107}
        textAnchor="middle" dominantBaseline="central"
        fontSize={17} fontWeight={700}
        fill={NUMBER_COLOR}
        className="font-display"
      >
        1
      </text>

      {/* 6 — B∩C overlap (bottom lens), not in A */}
      <text
        x={CX} y={175}
        textAnchor="middle" dominantBaseline="central"
        fontSize={17} fontWeight={700}
        fill={NUMBER_COLOR}
        className="font-display"
      >
        6
      </text>

      {/* D — triple overlap centre */}
      <text
        x={CX} y={136}
        textAnchor="middle" dominantBaseline="central"
        fontSize={18} fontWeight={700}
        fill={LETTER_COLOR}
        className="font-display"
      >
        {labelD}
      </text>
    </svg>
  )
}

// ── Default export: illustration wrapper ───────────────────────────────────────

/**
 * VennCirclesX20B15Illustration
 *
 * Static stem figure for SEAMOX-20-B-Q15.
 * Shows the problem state only (letters A–D as unknowns, numbers 4/1/6 fixed).
 */
export default function VennCirclesX20B15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga lingkaran saling tumpang tindih membentuk segitiga. ' +
        'Lingkaran atas berisi A, lingkaran kiri-bawah berisi B, lingkaran kanan-bawah berisi C. ' +
        'Tumpang tindih A∩B berisi 4, tumpang tindih A∩C berisi 1, tumpang tindih B∩C berisi 6, ' +
        'dan pusat ketiga-tiga (A∩B∩C) berisi D. Setiap lingkaran berjumlah 15.'
      }
    >
      <VennCirclesX20B15SVG />
    </div>
  )
}
