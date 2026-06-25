// MidpointShadedX22B13Illustration — SEAMO-X 2022 Paper B Q13
//
// ABCD is a square (area 50 cm²). E, F, G, H are midpoints of the sides
// AD, AB, BC, DC respectively. Lines are drawn from each corner to the
// midpoint of the non-adjacent side:
//   A → H  (top-left  → bottom midpoint)
//   B → E  (top-right → left midpoint)
//   C → F  (bottom-right → top midpoint)
//   D → G  (bottom-left  → right midpoint)
// These 4 lines intersect to form a shaded inner square with area = 50/5 = 10 cm².
//
// The static stem figure shows the problem (square + midpoints + lines + shading)
// but never reveals the numeric answer.
//
// Named export MidpointShadedX22B13 is the SSR-safe primitive reused by the explainer.
// SSR-safe — no hooks, no framer-motion.

const S   = 160   // outer square side (px)
const PAD = 40    // padding for vertex labels

// ── Outer square corners ────────────────────────────────────────────────────
const AX = PAD,     AY = PAD       // top-left
const BX = PAD + S, BY = PAD       // top-right
const CX = PAD + S, CY = PAD + S   // bottom-right
const DX = PAD,     DY = PAD + S   // bottom-left

// ── Midpoints ───────────────────────────────────────────────────────────────
const EX = PAD,         EY = PAD + S / 2  // midpoint of AD (left side)
const FX = PAD + S / 2, FY = PAD          // midpoint of AB (top side)
const GX = PAD + S,     GY = PAD + S / 2  // midpoint of BC (right side)
const HX = PAD + S / 2, HY = PAD + S      // midpoint of DC (bottom side)

// ── Inner square vertices (intersections of the 4 lines) ────────────────────
// Each computed analytically: at (1/5, 2/5), (3/5, 1/5), (4/5, 3/5), (2/5, 4/5)
// of the outer square (relative to corner A at top-left).
const I1X = PAD + S / 5,        I1Y = PAD + (2 * S) / 5  // A→H ∩ B→E
const I2X = PAD + (3 * S) / 5,  I2Y = PAD + S / 5        // B→E ∩ C→F
const I3X = PAD + (4 * S) / 5,  I3Y = PAD + (3 * S) / 5  // C→F ∩ D→G
const I4X = PAD + (2 * S) / 5,  I4Y = PAD + (4 * S) / 5  // D→G ∩ A→H

const VB = PAD * 2 + S  // 240 × 240 viewBox

// Palette
const SQUARE_FILL   = '#EFF6FF'
const SQUARE_STROKE = '#1E3A5F'
const LINE_COLOR    = '#1E3A5F'
const SHADE_FILL    = '#D1D5DB'
const SHADE_STROKE  = '#374151'
const ANSWER_COLOR  = '#10B981'
const LABEL_COLOR   = '#1E3A5F'
const MID_COLOR     = '#D97706'

const outerPts = `${AX},${AY} ${BX},${BY} ${CX},${CY} ${DX},${DY}`

export interface MidpointShadedX22B13Props {
  /** Show the 4 diagonal construction lines (default true for stem). */
  showLines?: boolean
  /** Fill + border the inner shaded square (default true for stem). */
  showShading?: boolean
  /** Show "10 cm²" answer label at the inner square centre. */
  showAnswer?: boolean
}

/**
 * SSR-safe primitive. Reused by illustration (default props) and explainer (animated steps).
 */
export function MidpointShadedX22B13({
  showLines   = true,
  showShading = true,
  showAnswer  = false,
}: MidpointShadedX22B13Props = {}) {
  const innerPts = `${I1X},${I1Y} ${I2X},${I2Y} ${I3X},${I3Y} ${I4X},${I4Y}`
  const cxInner  = (I1X + I2X + I3X + I4X) / 4
  const cyInner  = (I1Y + I2Y + I3Y + I4Y) / 4

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      width={Math.min(240, VB)}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* outer square */}
      <polygon
        points={outerPts}
        fill={SQUARE_FILL}
        stroke={SQUARE_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* shaded inner square */}
      {showShading && (
        <polygon
          points={innerPts}
          fill={SHADE_FILL}
          fillOpacity={0.85}
          stroke={SHADE_STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}

      {/* 4 construction lines */}
      {showLines && (
        <g stroke={LINE_COLOR} strokeWidth={1.8}>
          {/* A → H */}
          <line x1={AX} y1={AY} x2={HX} y2={HY} />
          {/* B → E */}
          <line x1={BX} y1={BY} x2={EX} y2={EY} />
          {/* C → F */}
          <line x1={CX} y1={CY} x2={FX} y2={FY} />
          {/* D → G */}
          <line x1={DX} y1={DY} x2={GX} y2={GY} />
        </g>
      )}

      {/* vertex labels (A, B, C, D) */}
      <g fontSize={14} fontWeight={700} fill={LABEL_COLOR} textAnchor="middle" dominantBaseline="central">
        <text x={AX - 12} y={AY - 12}>A</text>
        <text x={BX + 12} y={BY - 12}>B</text>
        <text x={CX + 12} y={CY + 12}>C</text>
        <text x={DX - 12} y={DY + 12}>D</text>
      </g>

      {/* midpoint labels (E, F, G, H) */}
      <g fontSize={13} fontWeight={700} fill={MID_COLOR} textAnchor="middle" dominantBaseline="central">
        <text x={EX - 14} y={EY}>E</text>
        <text x={FX}      y={FY - 14}>F</text>
        <text x={GX + 14} y={GY}>G</text>
        <text x={HX}      y={HY + 14}>H</text>
      </g>

      {/* midpoint dots */}
      <g fill={MID_COLOR}>
        <circle cx={EX} cy={EY} r={3.5} />
        <circle cx={FX} cy={FY} r={3.5} />
        <circle cx={GX} cy={GY} r={3.5} />
        <circle cx={HX} cy={HY} r={3.5} />
      </g>

      {/* answer label (explainer only) */}
      {showAnswer && (
        <text
          x={cxInner}
          y={cyInner}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={900}
          fill={ANSWER_COLOR}
        >
          10 cm²
        </text>
      )}
    </svg>
  )
}

/**
 * Default export: static stem figure — square, midpoints, construction lines, shaded region.
 * Never shows the numeric answer.
 */
export default function MidpointShadedX22B13Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Square ABCD with midpoints E, F, G, H on the sides. Lines from each corner to the non-adjacent midpoint form a shaded inner square. Find the area of the shaded square given area of ABCD is 50 cm²."
    >
      <MidpointShadedX22B13 />
    </div>
  )
}
