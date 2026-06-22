// IKMC-22-PE-Q24 — "There are five numbered cards on the table as shown."
//
// STEM ILLUSTRATION ONLY: shows the initial card arrangement [3, 4, 1, 5, 2]
// as five cream-coloured playing cards in a horizontal row — matching the
// scanned figure (2022.imgs/066.jpg). Does NOT reveal the answer (3 swaps).
//
// Co-exports `CardRowPrimitive` so the explainer can reuse the same card
// renderer with highlighted/swapping state.
//
// SSR-safe: no Math.random, no Date, no window.

// ── layout constants (re-exported for explainer) ─────────────────────────────

/** The initial card sequence as shown in the IKMC 2022 paper. */
export const CARD_SEQUENCE = [3, 4, 1, 5, 2] as const

export const SVG_W = 380
export const SVG_H = 130

/** Width of each card rectangle. */
export const CARD_W = 58
/** Height of each card rectangle. */
export const CARD_H = 86
/** Gap between cards. */
export const CARD_GAP = 14

// Row is centred inside SVG_W
const ROW_TOTAL_W = CARD_SEQUENCE.length * CARD_W + (CARD_SEQUENCE.length - 1) * CARD_GAP
const ROW_X0 = (SVG_W - ROW_TOTAL_W) / 2
const ROW_Y = (SVG_H - CARD_H) / 2

/** X origin of card at index i. */
export const cardOriginX = (i: number) => ROW_X0 + i * (CARD_W + CARD_GAP)

// ── colour tokens ─────────────────────────────────────────────────────────────

const INK = '#1F2937'
const CARD_FILL = '#FEFCE8'  // cream — matches paper figure
const CARD_STROKE = '#92400E'
const HIGHLIGHT_FILL = '#FEF3C7'
const HIGHLIGHT_STROKE = '#D97706'
const DONE_FILL = '#D1FAE5'
const DONE_STROKE = '#059669'

// ── sub-components ────────────────────────────────────────────────────────────

export type CardState = 'normal' | 'highlighted' | 'done'

interface SingleCardProps {
  digit: number
  x: number
  y: number
  state?: CardState
}

export function SingleCard({ digit, x, y, state = 'normal' }: SingleCardProps) {
  const fill =
    state === 'highlighted' ? HIGHLIGHT_FILL : state === 'done' ? DONE_FILL : CARD_FILL
  const stroke =
    state === 'highlighted' ? HIGHLIGHT_STROKE : state === 'done' ? DONE_STROKE : CARD_STROKE
  const strokeWidth = state !== 'normal' ? 3 : 2
  const textFill =
    state === 'highlighted' ? '#92400E' : state === 'done' ? '#065F46' : INK

  return (
    <g>
      {/* drop shadow */}
      <rect
        x={x + 3}
        y={y + 3}
        width={CARD_W}
        height={CARD_H}
        rx={8}
        fill="rgba(0,0,0,0.10)"
      />
      {/* card body */}
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* digit */}
      <text
        x={x + CARD_W / 2}
        y={y + CARD_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={42}
        fontWeight={900}
        fill={textFill}
      >
        {digit}
      </text>
    </g>
  )
}

// ── reusable row primitive ────────────────────────────────────────────────────

export interface CardRowPrimitiveProps {
  /** The digit at each position (left to right). Length must be 5. */
  digits: readonly number[]
  /** Per-position visual state. */
  states?: readonly CardState[]
  /** If provided, draws a curved swap arrow between these two position indices. */
  swapArrow?: [number, number]
}

export function CardRowPrimitive({
  digits,
  states,
  swapArrow,
}: CardRowPrimitiveProps) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* swap arrow arc (drawn behind cards) */}
      {swapArrow && (() => {
        const [i, j] = swapArrow
        const x1 = cardOriginX(i) + CARD_W / 2
        const x2 = cardOriginX(j) + CARD_W / 2
        const arcY = ROW_Y - 16
        const midX = (x1 + x2) / 2
        const cpY = arcY - 26
        const d = `M ${x1} ${arcY} Q ${midX} ${cpY} ${x2} ${arcY}`
        // arrowhead at x2
        const arrowSize = 6
        return (
          <g>
            <path d={d} fill="none" stroke={HIGHLIGHT_STROKE} strokeWidth={2.5} strokeDasharray="5 3" />
            {/* left arrowhead */}
            <polygon
              points={`${x1},${arcY} ${x1 + arrowSize},${arcY - arrowSize / 2} ${x1 + arrowSize},${arcY + arrowSize / 2}`}
              fill={HIGHLIGHT_STROKE}
            />
            {/* right arrowhead */}
            <polygon
              points={`${x2},${arcY} ${x2 - arrowSize},${arcY - arrowSize / 2} ${x2 - arrowSize},${arcY + arrowSize / 2}`}
              fill={HIGHLIGHT_STROKE}
            />
          </g>
        )
      })()}

      {/* cards */}
      {digits.map((d, i) => (
        <SingleCard
          key={i}
          digit={d}
          x={cardOriginX(i)}
          y={ROW_Y}
          state={states?.[i] ?? 'normal'}
        />
      ))}
    </svg>
  )
}

// ── static illustration (default export) ─────────────────────────────────────

export default function NumCards24PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Five numbered cards on a table: 3, 4, 1, 5, 2 (left to right)."
    >
      <CardRowPrimitive digits={CARD_SEQUENCE} />
    </div>
  )
}
