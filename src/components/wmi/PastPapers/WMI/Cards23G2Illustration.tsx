// Six number cards illustration for WMI-23F2A-Q2.
// "Which two cards have a difference closest to 150?"
// Cards: 521, 214, 79, 244, 383, 407.
//
// Exports:
//   CARDS23G2          — data constant (all six values)
//   CardsRow23G2       — reusable primitive (explainer can highlight a pair)
//   Cards23G2Illustration — framed static figure for the problem card

export const CARDS23G2 = [521, 214, 79, 244, 383, 407]

const INK = '#1F2937'

/** Width of each card box */
const CARD_W = 66
/** Height of each card box */
const CARD_H = 46
/** Horizontal gap between cards */
const GAP = 12
/** Padding on left/right of the row */
const PAD_X = 14
/** Padding on top/bottom of the row */
const PAD_Y = 16

const TOTAL_W = PAD_X * 2 + CARDS23G2.length * CARD_W + (CARDS23G2.length - 1) * GAP
const TOTAL_H = PAD_Y * 2 + CARD_H

/**
 * Reusable primitive — the six number cards in a horizontal row.
 * The explainer can pass `highlighted` (a set of card values) to tint a pair.
 * Leave it undefined for the static problem figure.
 */
export function CardsRow23G2({
  cards = CARDS23G2,
  highlighted,
}: {
  cards?: number[]
  highlighted?: Set<number>
}) {
  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width="100%"
      style={{ maxWidth: TOTAL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {cards.map((value, i) => {
        const x = PAD_X + i * (CARD_W + GAP)
        const y = PAD_Y
        const isHighlighted = highlighted?.has(value) ?? false
        return (
          <g key={i}>
            {/* card box */}
            <rect
              x={x}
              y={y}
              width={CARD_W}
              height={CARD_H}
              rx={5}
              fill={isHighlighted ? '#FFF3CD' : '#F3F4F6'}
              stroke={isHighlighted ? '#F2994A' : '#9CA3AF'}
              strokeWidth={isHighlighted ? 2.5 : 1.8}
            />
            {/* number label */}
            <text
              x={x + CARD_W / 2}
              y={y + CARD_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={value < 100 ? 20 : 17}
              fontWeight={700}
              fill={isHighlighted ? '#B45309' : INK}
              className="font-display"
            >
              {value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Framed illustration for the WMI-23F2A-Q2 problem card.
 * Shows all six number cards in original order; no pair is marked.
 */
export default function Cards23G2Illustration() {
  const ariaNumbers = CARDS23G2.join(', ')
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Enam kartu angka: ${ariaNumbers}. Selisih dua kartu mana yang paling dekat dengan 150?`}
    >
      <CardsRow23G2 />
    </div>
  )
}
