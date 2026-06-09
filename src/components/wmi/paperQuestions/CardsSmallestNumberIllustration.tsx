// Four number cards for WMI-19F2A-Q2.
// Figure shows the digits 6, 5, 0, 2 (left to right).
// Task: choose three of the four cards (no repetition) to form the SMALLEST
// 3-digit number. A leading 0 is not allowed, so the answer is 205 (choice D).

export const CARD_DIGITS = [6, 5, 0, 2] as const

export const CSN_VIEW_W = 420
export const CSN_VIEW_H = 130

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.16)'
const GRAY = '#9CA3AF'

const CARD_W = 78
const CARD_H = 96
const CARD_GAP = 20
const ROW_W = CARD_DIGITS.length * CARD_W + (CARD_DIGITS.length - 1) * CARD_GAP
const ROW_X0 = (CSN_VIEW_W - ROW_W) / 2
const CARD_Y = (CSN_VIEW_H - CARD_H) / 2

export const cardX = (i: number) => ROW_X0 + i * (CARD_W + CARD_GAP)

export interface CardsFigureProps {
  /** Highlight these card indices as "picked" (green). */
  picked?: Set<number>
  /** Dim (fade) these card indices as "not used". */
  faded?: Set<number>
  /** Place-value label drawn under each picked card, keyed by card index. */
  placeLabels?: Record<number, string>
}

/** One number card. */
function NumberCard({
  digit,
  x,
  picked,
  faded,
  label,
}: {
  digit: number
  x: number
  picked: boolean
  faded: boolean
  label?: string
}) {
  const stroke = picked ? GREEN : faded ? GRAY : INK
  const fill = picked ? GREEN_FILL : '#FFFFFF'
  const textColor = picked ? '#065F46' : faded ? GRAY : INK
  const opacity = faded ? 0.45 : 1
  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={CARD_Y}
        width={CARD_W}
        height={CARD_H}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={picked ? 3.5 : 2.5}
      />
      <text
        x={x + CARD_W / 2}
        y={CARD_Y + CARD_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={48}
        fontWeight={900}
        fill={textColor}
      >
        {digit}
      </text>
      {label && (
        <text
          x={x + CARD_W / 2}
          y={CARD_Y + CARD_H + 16}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={12}
          fontWeight={800}
          fill={GREEN}
        >
          {label}
        </text>
      )}
    </g>
  )
}

export function CardsFigure({ picked, faded, placeLabels }: CardsFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${CSN_VIEW_W} ${CSN_VIEW_H + 24}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {CARD_DIGITS.map((d, i) => (
        <NumberCard
          key={i}
          digit={d}
          x={cardX(i)}
          picked={picked?.has(i) ?? false}
          faded={faded?.has(i) ?? false}
          label={placeLabels?.[i]}
        />
      ))}
    </svg>
  )
}

export default function CardsSmallestNumberIllustration() {
  const label = CARD_DIGITS.join(', ')
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Four number cards showing the digits ${label}. Choose three to make the smallest 3-digit number.`}
    >
      <CardsFigure />
    </div>
  )
}
