// DiagSquare20B6Illustration — SEAMO-20-B-Q6
//
// A square with one diagonal drawn from the top-right corner to the
// bottom-left corner, labelled "12 cm". The diagonal is shown exactly
// as in the source image (top-right → bottom-left).
//
// The static figure shows ONLY the problem: the square + diagonal + label.
// It never reveals the area (72 cm²).
//
// Co-exported primitive DiagSquare20B6 lets the explainer animate:
//   showHalfLabel — marks each half-diagonal as 6 cm (d/2)
//   showArea      — prints "72 cm²" at the square's centre
//
// SSR-safe — no hooks, no Math.random, no Date.

const SQUARE_FILL   = '#EFF6FF'   // light blue tint
const SQUARE_STROKE = '#1E3A5F'   // dark navy border
const DIAG_COLOR    = '#1E3A5F'   // diagonal line
const LABEL_COLOR   = '#1E3A5F'   // "12 cm" label
const AREA_COLOR    = '#10B981'   // green — area reveal (animator only)
const DIM_COLOR     = '#D97706'   // amber — half-diagonal labels (animator)

const S    = 160    // square side in px
const PAD  = 36     // padding around the square

// SVG corners (y increases DOWN):
//   top-left  = (PAD, PAD)
//   top-right = (PAD+S, PAD)
//   bot-right = (PAD+S, PAD+S)
//   bot-left  = (PAD, PAD+S)
const TL = [PAD,     PAD    ] as [number, number]
const TR = [PAD + S, PAD    ] as [number, number]
const BR = [PAD + S, PAD + S] as [number, number]
const BL = [PAD,     PAD + S] as [number, number]

// Diagonal: top-right → bottom-left (matches source image)
const DIAG_X1 = TR[0], DIAG_Y1 = TR[1]
const DIAG_X2 = BL[0], DIAG_Y2 = BL[1]

// Label midpoint — centred along the diagonal, shifted left so it sits
// inside the lower-left triangle (matching source placement).
const LABEL_MX = (DIAG_X1 + DIAG_X2) / 2 - 12
const LABEL_MY = (DIAG_Y1 + DIAG_Y2) / 2 + 4

// Label rotation matches the diagonal angle (−45° in SVG coords)
const LABEL_ROTATE = -45

const VBW = PAD * 2 + S
const VBH = PAD * 2 + S

const squarePts = [TL, TR, BR, BL].map((p) => p.join(',')).join(' ')

export interface DiagSquare20B6Props {
  /** Show mid-diagonal "6 cm" marks on each half (animator step 1). */
  showHalfLabel?: boolean
  /** Show "72 cm²" area at the square centre (animator final beat). */
  showArea?: boolean
}

/**
 * Primitive reused by the illustration and the explainer.
 * Default props = plain problem figure.
 */
export function DiagSquare20B6({ showHalfLabel = false, showArea = false }: DiagSquare20B6Props = {}) {
  const cx = PAD + S / 2
  const cy = PAD + S / 2
  // Quarter-points for half-diagonal marks
  const MID1X = (DIAG_X1 + cx) / 2
  const MID1Y = (DIAG_Y1 + cy) / 2
  const MID2X = (cx + DIAG_X2) / 2
  const MID2Y = (cy + DIAG_Y2) / 2

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      width={Math.min(240, VBW)}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* square */}
      <polygon
        points={squarePts}
        fill={SQUARE_FILL}
        stroke={SQUARE_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* diagonal: top-right → bottom-left */}
      <line
        x1={DIAG_X1} y1={DIAG_Y1}
        x2={DIAG_X2} y2={DIAG_Y2}
        stroke={DIAG_COLOR}
        strokeWidth={2.2}
      />

      {/* "12 cm" label along the diagonal */}
      <text
        x={LABEL_MX}
        y={LABEL_MY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        fill={LABEL_COLOR}
        transform={`rotate(${LABEL_ROTATE}, ${LABEL_MX}, ${LABEL_MY})`}
      >
        12 cm
      </text>

      {/* animator: half-diagonal marks at quarter-points */}
      {showHalfLabel && (
        <g>
          <text
            x={MID1X - 14}
            y={MID1Y - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill={DIM_COLOR}
          >
            6
          </text>
          <text
            x={MID2X - 14}
            y={MID2Y - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill={DIM_COLOR}
          >
            6
          </text>
        </g>
      )}

      {/* animator: area result at centre */}
      {showArea && (
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight={900}
          fill={AREA_COLOR}
        >
          72 cm²
        </text>
      )}
    </svg>
  )
}

/**
 * Default export: plain problem figure — square with diagonal 12 cm.
 * Never reveals the area.
 */
export default function DiagSquare20B6Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A square with a diagonal drawn from the top-right corner to the bottom-left corner, labelled 12 cm. Find the area of the square."
    >
      <DiagSquare20B6 />
    </div>
  )
}
