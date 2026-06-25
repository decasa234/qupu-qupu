// BoxAdd19B9Illustration.tsx
//
// Stem illustration for SEAMO-19-B-Q9:
//   "When Mark filled a number from 1 to 7 into each box, the sum is 100.
//    Find the largest 2-digit number in the addition."
//
//   □□ + □□ + □□ + □ = 100  (each of digits 1–7 used exactly once)
//
// The figure (source: 2019.imgs/006.jpg) shows a VERTICAL column addition:
//   - Three rows of two blank boxes (□□) = three 2-digit numbers
//   - One row of one blank box (□) = one single digit  (rightmost column)
//   - A "+" symbol to the left of the stack
//   - A horizontal rule below the stack
//   - "1 0 0" (= 100) under the rule
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 240
export const SVG_H = 260

// Box dimensions
const BOX_W = 44
const BOX_H = 40
const BOX_GAP = 8   // horizontal gap between the two digits of a 2-digit number
const COL_GAP = 12  // vertical gap between rows

// Right-align the stack — anchor the right edge of the units column
const RIGHT_EDGE = 196
const TENS_LEFT  = RIGHT_EDGE - BOX_W - BOX_GAP - BOX_W  // left of the tens box

// Vertical positions (top-y) for each row
const ROW_Y = [
  24,                          // row 0: first □□
  24 + BOX_H + COL_GAP,       // row 1: second □□
  24 + 2 * (BOX_H + COL_GAP), // row 2: third □□
  24 + 3 * (BOX_H + COL_GAP), // row 3: single □ (units column only)
]

// Rule sits below the last row
const RULE_Y   = ROW_Y[3] + BOX_H + 8
const RESULT_Y = RULE_Y + 22

// Colours
const BOX_FILL    = '#FFFFFF'
const BOX_STROKE  = '#374151'
const INK         = '#1F2937'
const MUTED       = '#9CA3AF'
const PLUS_INK    = '#374151'

// ── Shared sub-components ─────────────────────────────────────────────────────

/** A single blank box (□). Props: x, y of the top-left corner. */
export function BlankBox({
  x,
  y,
  fill = BOX_FILL,
  stroke = BOX_STROKE,
  strokeWidth = 2,
}: {
  x: number
  y: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <rect
      x={x}
      y={y}
      width={BOX_W}
      height={BOX_H}
      rx={5}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  )
}

/** A labelled box — shows a digit (or '?') centred inside. */
export function LabelBox({
  x,
  y,
  label,
  fill = '#EFF6FF',
  textColor = '#1D4ED8',
}: {
  x: number
  y: number
  label: string
  fill?: string
  textColor?: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={5} fill={fill} stroke={textColor} strokeWidth={2} />
      <text
        x={x + BOX_W / 2}
        y={y + BOX_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Courier New', Courier, monospace"
        fontWeight={900}
        fontSize={22}
        fill={textColor}
      >
        {label}
      </text>
    </g>
  )
}

// ── Column addition figure ────────────────────────────────────────────────────

export interface ColumnAddFigureProps {
  /**
   * Optional digit labels for the 7 boxes, in order:
   *   [tens0, units0, tens1, units1, tens2, units2, single]
   * Pass undefined to leave a box blank.
   */
  digits?: (string | undefined)[]
  /**
   * Optional per-box fill colors (same indexing).
   */
  fills?: (string | undefined)[]
  /**
   * Show the final sum "= 100" highlighted.
   */
  highlightResult?: boolean
}

export function ColumnAddFigure({
  digits = [],
  fills = [],
  highlightResult = false,
}: ColumnAddFigureProps = {}) {
  // Build the 7 box specs: [tens0, units0, tens1, units1, tens2, units2, single]
  // Positions: rows 0–2 have tens+units; row 3 has only units
  const boxes: Array<{ x: number; y: number; digit?: string; fill?: string }> = [
    // Row 0 — first 2-digit number
    { x: TENS_LEFT,              y: ROW_Y[0], digit: digits[0], fill: fills[0] },
    { x: RIGHT_EDGE - BOX_W,    y: ROW_Y[0], digit: digits[1], fill: fills[1] },
    // Row 1 — second 2-digit number
    { x: TENS_LEFT,              y: ROW_Y[1], digit: digits[2], fill: fills[2] },
    { x: RIGHT_EDGE - BOX_W,    y: ROW_Y[1], digit: digits[3], fill: fills[3] },
    // Row 2 — third 2-digit number
    { x: TENS_LEFT,              y: ROW_Y[2], digit: digits[4], fill: fills[4] },
    { x: RIGHT_EDGE - BOX_W,    y: ROW_Y[2], digit: digits[5], fill: fills[5] },
    // Row 3 — single digit (units column only, aligned with units column)
    { x: RIGHT_EDGE - BOX_W,    y: ROW_Y[3], digit: digits[6], fill: fills[6] },
  ]

  return (
    <g>
      {/* "+" symbol — vertically centred on the 4-row stack */}
      <text
        x={TENS_LEFT - 18}
        y={(ROW_Y[0] + ROW_Y[3] + BOX_H) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, sans-serif"
        fontWeight={900}
        fontSize={26}
        fill={PLUS_INK}
      >
        +
      </text>

      {/* Boxes */}
      {boxes.map((b, i) =>
        b.digit !== undefined ? (
          <LabelBox
            key={i}
            x={b.x}
            y={b.y}
            label={b.digit}
            fill={b.fill ?? '#EFF6FF'}
            textColor="#1D4ED8"
          />
        ) : (
          <BlankBox
            key={i}
            x={b.x}
            y={b.y}
            fill={b.fill ?? BOX_FILL}
          />
        ),
      )}

      {/* Horizontal rule */}
      <line
        x1={TENS_LEFT - 4}
        y1={RULE_Y}
        x2={RIGHT_EDGE + 4}
        y2={RULE_Y}
        stroke={BOX_STROKE}
        strokeWidth={2.5}
      />

      {/* Result: 1  0  0 */}
      {(['1', '0', '0'] as const).map((digit, i) => {
        // three digit columns: hundreds, tens, units
        const colX = [
          TENS_LEFT - BOX_W - BOX_GAP,
          TENS_LEFT,
          RIGHT_EDGE - BOX_W,
        ][i]
        return (
          <text
            key={`r${i}`}
            x={colX + BOX_W / 2}
            y={RESULT_Y}
            textAnchor="middle"
            dominantBaseline="auto"
            fontFamily="'Courier New', Courier, monospace"
            fontWeight={900}
            fontSize={26}
            fill={highlightResult ? '#065F46' : INK}
          >
            {digit}
          </text>
        )
      })}

      {/* Digit-column alignment guides (subtle) */}
      {/* tens column label */}
      <text
        x={TENS_LEFT + BOX_W / 2}
        y={ROW_Y[0] - 8}
        textAnchor="middle"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontSize={8}
        fill={MUTED}
      >
        tens
      </text>
      <text
        x={RIGHT_EDGE - BOX_W / 2}
        y={ROW_Y[0] - 8}
        textAnchor="middle"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontSize={8}
        fill={MUTED}
      >
        units
      </text>
    </g>
  )
}

// ── Default export — static stem illustration ─────────────────────────────────

/**
 * BoxAdd19B9Illustration
 *
 * Shows the column addition □□ + □□ + □□ + □ = 100 with all boxes blank.
 * Faithfully matches the source figure (2019.imgs/006.jpg).
 */
export default function BoxAdd19B9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Column addition: three 2-digit blank boxes and one single-digit blank box ' +
        'arranged vertically with a plus sign, equalling 100. ' +
        'Fill digits 1 to 7 exactly once so the sum is 100.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <ColumnAddFigure />
      </svg>
    </div>
  )
}
