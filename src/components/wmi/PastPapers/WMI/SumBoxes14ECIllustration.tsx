// IKMC-19-EC-Q14 — "Steven wants to write each of the digits 2, 0, 1 and 9
// in one of the boxes of the sum. He wants to get the largest possible answer.
// Which digit could he write instead of the question mark?"
//
// The real stem figure (docs/reference/ocr-res/ikmc/contest/ecolier/2019.imgs/044.jpg)
// shows: □ □ □ + [?]
// — three blank square boxes, a plus sign, and a box containing a bold "?".
//
// The STEM illustration shows ONLY the problem layout, never the answer.
// Digits: 2, 0, 1, 9. The "?" is the single-digit addend on the right.
// Answer (not shown here): 0 or 1.
//
// Reuses the box/digit primitive approach from DigitArrangeIllustration and
// DigitCards24G1Illustration — framed rect + centred text.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported for the explainer) ──────────────────

/** Total SVG width. */
export const SVG_W = 260

/** Total SVG height. */
export const SVG_H = 80

/** Y-centre for all boxes. */
export const BOX_CY = SVG_H / 2

/** Width of each digit box. */
export const BOX_W = 44

/** Height of each digit box. */
export const BOX_H = 44

/** Corner radius. */
export const BOX_RX = 8

/** Horizontal gap between boxes. */
export const BOX_GAP = 10

/** Width of the "+" operator text area. */
export const PLUS_W = 24

/** Total width of the 3-box group */
export const GROUP_W = 3 * BOX_W + 2 * BOX_GAP

/** X position of box 0 (hundreds), box 1 (tens), box 2 (units). */
export const BOX_X = [
  (SVG_W - GROUP_W - PLUS_W - BOX_GAP - BOX_W) / 2,
  (SVG_W - GROUP_W - PLUS_W - BOX_GAP - BOX_W) / 2 + BOX_W + BOX_GAP,
  (SVG_W - GROUP_W - PLUS_W - BOX_GAP - BOX_W) / 2 + 2 * (BOX_W + BOX_GAP),
] as const

/** X position of the "+" operator. */
export const PLUS_X =
  BOX_X[2] + BOX_W + BOX_GAP

/** X position of the "?" box. */
export const QBOX_X = PLUS_X + PLUS_W + BOX_GAP

/** Colour tokens (echoing qupu palette). */
export const COLOR = {
  BOX_FILL: '#F8FAFC',
  BOX_STROKE: '#94A3B8',
  BOX_STROKE_W: 2,
  QBOX_FILL: '#F8FAFC',
  QBOX_STROKE: '#94A3B8',
  DIGIT_FILL: '#1F2937',
  PLUS_FILL: '#4B5563',
  QMARK_FILL: '#374151',
  HIGHLIGHT_FILL: '#DBEAFE',
  HIGHLIGHT_STROKE: '#2563EB',
  RESULT_FILL: '#D1FAE5',
  RESULT_STROKE: '#10B981',
  RESULT_TEXT: '#065F46',
} as const

// ── The reusable box primitive ───────────────────────────────────────────────

interface SumBoxProps {
  x: number
  y: number
  /** Digit to show (or null for empty). */
  digit?: string | null
  /** Is this the highlighted/active box? */
  highlight?: boolean
  /** Is this the result (green)? */
  result?: boolean
  /** Is this the "?" box? */
  question?: boolean
  textFill?: string
  fontSize?: number
}

export function SumBox({
  x,
  y,
  digit = null,
  highlight = false,
  result = false,
  question = false,
  textFill,
  fontSize = 22,
}: SumBoxProps) {
  const cy = y
  const fill = result
    ? COLOR.RESULT_FILL
    : highlight
      ? COLOR.HIGHLIGHT_FILL
      : question
        ? COLOR.QBOX_FILL
        : COLOR.BOX_FILL

  const stroke = result
    ? COLOR.RESULT_STROKE
    : highlight
      ? COLOR.HIGHLIGHT_STROKE
      : question
        ? COLOR.QBOX_STROKE
        : COLOR.BOX_STROKE

  const strokeW = result || highlight ? 3 : COLOR.BOX_STROKE_W

  const tf = textFill ?? (result ? COLOR.RESULT_TEXT : question ? COLOR.QMARK_FILL : COLOR.DIGIT_FILL)

  return (
    <g>
      <rect
        x={x}
        y={cy - BOX_H / 2}
        width={BOX_W}
        height={BOX_H}
        rx={BOX_RX}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
      />
      {digit != null && (
        <text
          x={x + BOX_W / 2}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={800}
          fill={tf}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {digit}
        </text>
      )}
    </g>
  )
}

// ── Plus operator ────────────────────────────────────────────────────────────

export function PlusSign({ x, y }: { x: number; y: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={26}
      fontWeight={700}
      fill={COLOR.PLUS_FILL}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      +
    </text>
  )
}

// ── Primitive: the whole sum row ─────────────────────────────────────────────

interface SumRowProps {
  /** Digits for positions [hundreds, tens, units], or null for empty box. */
  digits?: [string | null, string | null, string | null]
  /** Digit in the single-digit "?" slot, or null for the "?" mark. */
  single?: string | null
  /** Which box index (0=hundreds, 1=tens, 2=units, 3=single) is highlighted. */
  highlightIndex?: number | null
  /** Show result colouring on the single box. */
  resultSingle?: boolean
  /** Show result colouring on all boxes. */
  resultAll?: boolean
}

export function SumRowFigure({
  digits = [null, null, null],
  single = null,
  highlightIndex = null,
  resultSingle = false,
  resultAll = false,
}: SumRowProps) {
  const cy = BOX_CY

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* 3 digit boxes */}
      {([0, 1, 2] as const).map((i) => (
        <SumBox
          key={i}
          x={BOX_X[i]}
          y={cy}
          digit={digits[i]}
          highlight={!resultAll && highlightIndex === i}
          result={resultAll}
        />
      ))}

      {/* plus sign */}
      <PlusSign x={PLUS_X + PLUS_W / 2} y={cy} />

      {/* single-digit "?" box */}
      <SumBox
        x={QBOX_X}
        y={cy}
        digit={single ?? '?'}
        highlight={!resultAll && !resultSingle && highlightIndex === 3}
        result={resultAll || resultSingle}
        question={single == null}
        fontSize={single == null ? 20 : 22}
      />
    </svg>
  )
}

// ── Default export: the static stem illustration ─────────────────────────────

export default function SumBoxes14ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="An addition sum with three empty boxes plus a box marked with a question mark: □ □ □ + ?"
    >
      <SumRowFigure />
    </div>
  )
}
