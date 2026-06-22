// IKMC-20-EC-Q14 — "The sum of three numbers is 50. Karin subtracts a secret
// number from each of these three numbers. She gets 24, 13 and 7 as the
// results. Which one of the following is one of the original three numbers?"
//
// Stem illustration (problem-only, never reveals the answer):
//   - Three blank boxes on top row (the original numbers, unknown)
//   - A "− ?" badge in the centre, indicating the same secret is removed from each
//   - Three result boxes on the bottom row showing 24, 13 and 7
//   - Down-arrows connecting each original box to its result box
//
// Reuses the box/digit primitive from SumBoxes14ECIllustration (same project).
// Does NOT show: the secret (2), the originals (26, 15, 9), or the answer.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported so the explainer can reuse them) ────

/** Total SVG width. */
export const SVG_W = 300

/** Total SVG height. */
export const SVG_H = 210

/** Width / height of each number box. */
export const BOX_W = 58
export const BOX_H = 46

/** Corner radius for boxes. */
export const BOX_RX = 8

/** Horizontal gap between the three columns. */
export const COL_GAP = 16

/** Y-centre of the top (original) row. */
export const TOP_ROW_CY = 46

/** Y-centre of the bottom (result) row. */
export const BOT_ROW_CY = 164

/** X-centres of the three columns (left, middle, right). */
const totalW = 3 * BOX_W + 2 * COL_GAP
const leftEdge = (SVG_W - totalW) / 2
export const COL_CX = [
  leftEdge + BOX_W / 2,
  leftEdge + BOX_W + COL_GAP + BOX_W / 2,
  leftEdge + 2 * (BOX_W + COL_GAP) + BOX_W / 2,
] as const

/** Y of the arrow start (bottom of top box). */
export const ARROW_Y1 = TOP_ROW_CY + BOX_H / 2 + 4

/** Y of the arrow end (top of bottom box). */
export const ARROW_Y2 = BOT_ROW_CY - BOX_H / 2 - 4

/** Y-centre of the "− ?" badge (midway between rows). */
export const BADGE_CY = (TOP_ROW_CY + BOT_ROW_CY) / 2

/** Result values (shown in bottom row). */
export const RESULTS = [24, 13, 7] as const

/** Colour tokens (echoing qupu palette). */
export const COLOR = {
  BOX_FILL: '#F8FAFC',
  BOX_STROKE: '#94A3B8',
  BLANK_FILL: '#F1F5F9',
  BLANK_STROKE: '#CBD5E1',
  RESULT_FILL: '#E0F2FE',
  RESULT_STROKE: '#38BDF8',
  RESULT_TEXT: '#0369A1',
  ANSWER_FILL: '#D1FAE5',
  ANSWER_STROKE: '#10B981',
  ANSWER_TEXT: '#065F46',
  ARROW: '#64748B',
  BADGE_BG: '#FEF3C7',
  BADGE_STROKE: '#F59E0B',
  BADGE_TEXT: '#92400E',
  INK: '#1F2937',
  HIGHLIGHT_FILL: '#DBEAFE',
  HIGHLIGHT_STROKE: '#2563EB',
  HIGHLIGHT_TEXT: '#1E40AF',
} as const

// ── Reusable box primitive ────────────────────────────────────────────────────

export interface SubBox {
  /** Numeric value to display (null = blank □). */
  value?: number | string | null
  /** Apply highlight colouring (blue). */
  highlight?: boolean
  /** Apply answer/result colouring (green). */
  answer?: boolean
  /** Apply result colouring (sky blue). */
  result?: boolean
  /** Font size override. */
  fontSize?: number
}

interface SubBoxSvgProps extends SubBox {
  cx: number
  cy: number
}

export function SubtractBox({ cx, cy, value = null, highlight = false, answer = false, result = false, fontSize = 20 }: SubBoxSvgProps) {
  const fill = answer
    ? COLOR.ANSWER_FILL
    : highlight
      ? COLOR.HIGHLIGHT_FILL
      : result
        ? COLOR.RESULT_FILL
        : value == null
          ? COLOR.BLANK_FILL
          : COLOR.BOX_FILL

  const stroke = answer
    ? COLOR.ANSWER_STROKE
    : highlight
      ? COLOR.HIGHLIGHT_STROKE
      : result
        ? COLOR.RESULT_STROKE
        : value == null
          ? COLOR.BLANK_STROKE
          : COLOR.BOX_STROKE

  const strokeW = answer || highlight ? 3 : 2

  const textFill = answer
    ? COLOR.ANSWER_TEXT
    : highlight
      ? COLOR.HIGHLIGHT_TEXT
      : result
        ? COLOR.RESULT_TEXT
        : COLOR.INK

  return (
    <g>
      <rect
        x={cx - BOX_W / 2}
        y={cy - BOX_H / 2}
        width={BOX_W}
        height={BOX_H}
        rx={BOX_RX}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
      />
      {value != null && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={800}
          fill={textFill}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {value}
        </text>
      )}
    </g>
  )
}

// ── Down-arrow primitive ──────────────────────────────────────────────────────

export function DownArrow({ x, y1, y2, color = COLOR.ARROW }: { x: number; y1: number; y2: number; color?: string }) {
  const head = 7
  const shaftEnd = y2 - head
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={shaftEnd} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <polygon
        points={`${x},${y2} ${x - head * 0.55},${shaftEnd} ${x + head * 0.55},${shaftEnd}`}
        fill={color}
      />
    </g>
  )
}

// ── "− ?" badge (the secret subtrahend) ──────────────────────────────────────

export function SecretBadge({ cy, secret }: { cy: number; secret?: number | null }) {
  const label = secret != null ? `− ${secret}` : '− ?'
  const bw = 48
  const bh = 24
  return (
    <g>
      <rect
        x={SVG_W / 2 - bw / 2}
        y={cy - bh / 2}
        width={bw}
        height={bh}
        rx={10}
        fill={COLOR.BADGE_BG}
        stroke={COLOR.BADGE_STROKE}
        strokeWidth={2}
      />
      <text
        x={SVG_W / 2}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={800}
        fill={COLOR.BADGE_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── The full 3-column figure (primitive shared with the explainer) ────────────

export interface SubtractFigureProps {
  /** Which top boxes are highlighted (0-based). */
  topHighlight?: Set<number>
  /** Which top boxes show a revealed original value. */
  topValues?: (number | null)[]
  /** Whether the bottom result boxes are highlighted. */
  bottomHighlight?: Set<number>
  /** Whether to colour a top box as the answer. */
  topAnswer?: Set<number>
  /** Override secret badge label. */
  secret?: number | null
}

export function SubtractFigure({
  topHighlight = new Set(),
  topValues = [null, null, null],
  bottomHighlight = new Set(),
  topAnswer = new Set(),
  secret,
}: SubtractFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* Top row: three unknown original boxes */}
      {COL_CX.map((cx, i) => (
        <SubtractBox
          key={`top-${i}`}
          cx={cx}
          cy={TOP_ROW_CY}
          value={topValues[i] ?? null}
          highlight={topHighlight.has(i)}
          answer={topAnswer.has(i)}
        />
      ))}

      {/* Down arrows */}
      {COL_CX.map((cx, i) => (
        <DownArrow key={`arrow-${i}`} x={cx} y1={ARROW_Y1} y2={ARROW_Y2} />
      ))}

      {/* Centre badge: "− ?" */}
      <SecretBadge cy={BADGE_CY} secret={secret} />

      {/* Bottom row: result boxes (24, 13, 7) */}
      {COL_CX.map((cx, i) => (
        <SubtractBox
          key={`bot-${i}`}
          cx={cx}
          cy={BOT_ROW_CY}
          value={RESULTS[i]}
          result={bottomHighlight.has(i)}
          fontSize={18}
        />
      ))}
    </svg>
  )
}

// ── Default export: static stem illustration ──────────────────────────────────

/**
 * Subtract14ECIllustration
 *
 * Static, problem-only figure for IKMC-20-EC-Q14.
 * Shows: three unknown original boxes (top row), a "−?" badge,
 * down-arrows, and the three result boxes 24, 13, 7 (bottom row).
 * Does NOT reveal the secret (2) or the original numbers (9, 15, 26).
 */
export default function Subtract14ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Three unknown numbers. A secret number is subtracted from each. ' +
        'Results: 24, 13, and 7.'
      }
    >
      <SubtractFigure />
    </div>
  )
}
