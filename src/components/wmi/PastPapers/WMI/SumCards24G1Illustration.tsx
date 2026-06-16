// WMI-24F1A-Q18 (2024 Grade 1 Final) — answer = 6 (fill-in).
//
// "Eight number cards in a row: 7, 4, 8, 1, 5, 2, 6, 3. The number on the □-th
// card from the left plus the number on the △-th card from the right add up to
// 9. How many different values can □ + △ have?"
//
// The eight cards carry the FIXED values 7, 4, 8, 1, 5, 2, 6, 3 (left→right).
// Each card is drawn with its left-position 1..8 printed below it, so a Grade-1
// reader can reason about "the □-th from the left" and "the △-th from the right"
// directly off the figure. The static figure shows ONLY the cards + position
// labels; it never marks which pair sums to 9 nor the count of distinct □+△.
//
// The co-exported SumCards24G1 primitive lets the animator light one card from
// the left (litLeft) and one from the right (litRight, △-th from the right) and,
// with showSum, print the resulting □ + △. By itself it reveals nothing.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // card value text
const CARD_STROKE = '#1F2937' // bare card outline
const POS_LABEL = '#9CA3AF' // muted gray — the 1..8 position captions
const LEFT_LIT = '#30598A' // brand blue — a card lit from the left (□)
const LEFT_FILL = '#E1EFFB' // pale blue fill for a left-lit card
const RIGHT_LIT = '#f0853a' // brand orange — a card lit from the right (△)
const RIGHT_FILL = '#FDEBDD' // pale peach fill for a right-lit card

/** The eight card values in printed left→right order (shared with the explainer). */
export const SUM_CARDS_24G1: readonly number[] = [7, 4, 8, 1, 5, 2, 6, 3]

const N = SUM_CARDS_24G1.length

// ---- layout ----------------------------------------------------------------
const CARD_W = 40
const CARD_H = 52
const GAP = 10
const PAD_X = 14
const PAD_TOP = 14
const LABEL_H = 24 // room for the position caption under each card
const SUM_H = 30 // room for the □+△ readout under the row

const ROW_W = N * CARD_W + (N - 1) * GAP
const VIEW_W = PAD_X * 2 + ROW_W
const VIEW_H = PAD_TOP + CARD_H + LABEL_H + SUM_H

const cardX = (i: number) => PAD_X + i * (CARD_W + GAP)

export interface SumCards24G1Props {
  /** Light the card at this 1-based position from the LEFT (□). */
  litLeft?: number | null
  /** Light the card at this 1-based position from the RIGHT (△-th from the right). */
  litRight?: number | null
  /** Print the resulting □ + △ readout beneath the row. Off by default. */
  showSum?: boolean
}

/**
 * The eight-card row. `litLeft` lights the □-th card from the left (blue) and
 * `litRight` lights the △-th card from the right (orange); `showSum` prints
 * □ + △ underneath. With no props it renders the bare problem row with position
 * labels and reveals nothing.
 */
export function SumCards24G1({ litLeft = null, litRight = null, showSum = false }: SumCards24G1Props = {}) {
  // Normalise the 1-based positions into 0-based row indices.
  const leftIdx =
    typeof litLeft === 'number' && litLeft >= 1 && litLeft <= N ? litLeft - 1 : null
  const rightIdx =
    typeof litRight === 'number' && litRight >= 1 && litRight <= N ? N - litRight : null

  const leftVal = leftIdx === null ? null : SUM_CARDS_24G1[leftIdx]
  const rightVal = rightIdx === null ? null : SUM_CARDS_24G1[rightIdx]
  // □ + △ is (position from left) + (position from right), per the problem.
  const boxPlusTri =
    typeof litLeft === 'number' && typeof litRight === 'number' && leftIdx !== null && rightIdx !== null
      ? litLeft + litRight
      : null

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(300, VIEW_W)} aria-hidden="true">
      {SUM_CARDS_24G1.map((value, i) => {
        const isLeft = i === leftIdx
        const isRight = i === rightIdx
        const x = cardX(i)
        const cx = x + CARD_W / 2
        const fill = isLeft ? LEFT_FILL : isRight ? RIGHT_FILL : 'white'
        const stroke = isLeft ? LEFT_LIT : isRight ? RIGHT_LIT : CARD_STROKE
        const lit = isLeft || isRight
        return (
          <g key={i}>
            {/* the number card */}
            <rect
              x={x}
              y={PAD_TOP}
              width={CARD_W}
              height={CARD_H}
              rx={8}
              fill={fill}
              stroke={stroke}
              strokeWidth={lit ? 3 : 1.8}
            />
            <text
              x={cx}
              y={PAD_TOP + CARD_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={26}
              fontWeight={800}
              fill={INK}
              className="font-display"
            >
              {value}
            </text>
            {/* position label (1..8 from the left) under each card */}
            <text
              x={cx}
              y={PAD_TOP + CARD_H + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={700}
              fill={POS_LABEL}
              className="font-display"
            >
              {i + 1}
            </text>
          </g>
        )
      })}

      {/* □ + △ readout (post-answer only) */}
      {showSum && boxPlusTri !== null && leftVal !== null && rightVal !== null && (
        <text
          x={VIEW_W / 2}
          y={PAD_TOP + CARD_H + LABEL_H + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={800}
          className="font-display"
        >
          <tspan fill={LEFT_LIT}>{litLeft}</tspan>
          <tspan fill={INK}> + </tspan>
          <tspan fill={RIGHT_LIT}>{litRight}</tspan>
          <tspan fill={INK}>{` = ${boxPlusTri}`}</tspan>
        </text>
      )}
    </svg>
  )
}

/** Default export: the eight bare cards with position labels — no answer. */
export default function SumCards24G1Illustration() {
  const ariaList = SUM_CARDS_24G1.join(', ')
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Delapan kartu bilangan berderet dari kiri ke kanan: ${ariaList}, dengan nomor posisi 1 sampai 8 tertera di bawah setiap kartu. Bilangan pada kartu ke-□ dari kiri ditambah bilangan pada kartu ke-△ dari kanan berjumlah 9.`}
    >
      <SumCards24G1 />
    </div>
  )
}
