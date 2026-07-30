// WMI-24F1A-Q18 (2024 Grade 1 Final) — answer = 6 (fill-in).
//
// Official stem: "The sum of the numbers on the □th card from the left and the
// △th card from the right is 9. How many possible values are there for □+△?"
// The stem never lists the card values — the paper prints them only in the
// figure, a left-to-right row of eight square cards:
//
//   [7] [4] [8] [1] [5] [2] [6] [3]
//
// so this figure is the sole carrier of that data and both countings (from the
// left and from the right) have to be legible off it.
//
// Value pairs that total 9 give the position pairs (□, △):
//   7+2 → (1,3)=4   4+5 → (2,4)=6   8+1 → (3,5)=8   1+8 → (4,6)=10
//   5+4 → (5,7)=12  2+7 → (6,8)=14  6+3 → (7,1)=8   3+6 → (8,2)=10
// Distinct □+△ values: 4, 6, 8, 10, 12, 14 → SIX. The figure shows only the
// cards and the two position rulers; it never marks a pair nor the count.
//
// The co-exported SumCards24G1 primitive lets the animator light one card from
// the left (litLeft) and one from the right (litRight, △-th from the right) and,
// with showSum, print the resulting □ + △. By itself it reveals nothing.
//
// Wordless by design: illustrations get no `lang` prop, so the two rulers are
// keyed by the stem's own □ / △ glyphs plus a direction arrow rather than by
// Indonesian or English captions.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#2B2622' // card value text
const CARD_FILL = '#FFF8EE' // qupu cream card face
const CARD_STROKE = '#2B2622' // bare card outline (the paper's black rule)
const LEFT_LIT = '#30598A' // brand blue — the "from the left" ruler + □ picks
const LEFT_FILL = '#E1EFFB' // pale blue fill for a left-lit card
const LEFT_SOFT = '#8FAAC6' // unlit blue ruler digits
const RIGHT_LIT = '#F0853A' // brand orange — the "from the right" ruler + △ picks
const RIGHT_FILL = '#FDEBDD' // pale peach fill for a right-lit card
const RIGHT_SOFT = '#E0AC85' // unlit orange ruler digits

/** The eight card values in printed left→right order (shared with the explainer). */
export const SUM_CARDS_24G1: readonly number[] = [7, 4, 8, 1, 5, 2, 6, 3]

const N = SUM_CARDS_24G1.length

// ---- layout ----------------------------------------------------------------
const CARD_W = 42
const CARD_H = 54
const GAP = 10
const PAD_X = 32 // room for the □ / △ ruler markers hanging off each end
const PAD_TOP = 12
const LEFT_ROW_GAP = 15 // baseline of the "from the left" ruler below the cards
const RIGHT_ROW_GAP = 18 // baseline of the "from the right" ruler below that
const SUM_GAP = 24 // baseline of the □ + △ readout below the rulers
const PAD_BOTTOM = 14

const ROW_W = N * CARD_W + (N - 1) * GAP
const VIEW_W = PAD_X * 2 + ROW_W

const CARDS_BOTTOM = PAD_TOP + CARD_H
const LEFT_ROW_Y = CARDS_BOTTOM + LEFT_ROW_GAP
const RIGHT_ROW_Y = LEFT_ROW_Y + RIGHT_ROW_GAP
const SUM_Y = RIGHT_ROW_Y + SUM_GAP
const VIEW_H = SUM_Y + PAD_BOTTOM

const cardX = (i: number) => PAD_X + i * (CARD_W + GAP)

/** Small square outline — the stem's □, marking the count-from-the-left ruler. */
function BoxMark({ cx, cy }: { cx: number; cy: number }) {
  const s = 9
  return (
    <rect
      x={cx - s / 2}
      y={cy - s / 2}
      width={s}
      height={s}
      rx={1.5}
      fill="none"
      stroke={LEFT_LIT}
      strokeWidth={2}
    />
  )
}

/** Small triangle outline — the stem's △, marking the count-from-the-right ruler. */
function TriMark({ cx, cy }: { cx: number; cy: number }) {
  const s = 10
  const pts = [
    `${cx},${cy - s * 0.6}`,
    `${cx + s * 0.55},${cy + s * 0.45}`,
    `${cx - s * 0.55},${cy + s * 0.45}`,
  ].join(' ')
  return <polygon points={pts} fill="none" stroke={RIGHT_LIT} strokeWidth={2} strokeLinejoin="round" />
}

/** Short direction arrow: `dir` +1 points right, −1 points left. */
function DirArrow({
  x,
  y,
  dir,
  color,
}: {
  x: number
  y: number
  dir: 1 | -1
  color: string
}) {
  const len = 9
  const tip = x + dir * len
  const head = 3.6
  return (
    <g>
      <line x1={x} y1={y} x2={tip} y2={y} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <polygon
        points={`${tip},${y} ${tip - dir * head},${y - head * 0.72} ${tip - dir * head},${y + head * 0.72}`}
        fill={color}
      />
    </g>
  )
}

export interface SumCards24G1Props {
  /** Light the card at this 1-based position from the LEFT (□). */
  litLeft?: number | null
  /** Light the card at this 1-based position from the RIGHT (△-th from the right). */
  litRight?: number | null
  /** Print the resulting □ + △ readout beneath the row. Off by default. */
  showSum?: boolean
}

/**
 * The eight-card row plus the two position rulers. `litLeft` lights the □-th
 * card from the left (blue) and `litRight` lights the △-th card from the right
 * (orange); `showSum` prints □ + △ underneath. With no props it renders the bare
 * problem row and reveals nothing.
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
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 460 }}
      aria-hidden="true"
    >
      {SUM_CARDS_24G1.map((value, i) => {
        const isLeft = i === leftIdx
        const isRight = i === rightIdx
        const x = cardX(i)
        const cx = x + CARD_W / 2
        const fill = isLeft ? LEFT_FILL : isRight ? RIGHT_FILL : CARD_FILL
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
              rx={7}
              fill={fill}
              stroke={stroke}
              strokeWidth={lit ? 3 : 2}
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

            {/* ruler 1: position counted from the LEFT (□) */}
            <text
              x={cx}
              y={LEFT_ROW_Y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={800}
              fill={isLeft ? LEFT_LIT : LEFT_SOFT}
              className="font-display"
            >
              {i + 1}
            </text>

            {/* ruler 2: position counted from the RIGHT (△) */}
            <text
              x={cx}
              y={RIGHT_ROW_Y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={800}
              fill={isRight ? RIGHT_LIT : RIGHT_SOFT}
              className="font-display"
            >
              {N - i}
            </text>
          </g>
        )
      })}

      {/* □ ruler marker: hangs off the LEFT end, arrow pointing right */}
      <BoxMark cx={PAD_X - 24} cy={LEFT_ROW_Y} />
      <DirArrow x={PAD_X - 16} y={LEFT_ROW_Y} dir={1} color={LEFT_LIT} />

      {/* △ ruler marker: hangs off the RIGHT end, arrow pointing left */}
      <TriMark cx={VIEW_W - PAD_X + 24} cy={RIGHT_ROW_Y} />
      <DirArrow x={VIEW_W - PAD_X + 16} y={RIGHT_ROW_Y} dir={-1} color={RIGHT_LIT} />

      {/* □ + △ readout (post-answer only) */}
      {showSum && boxPlusTri !== null && leftVal !== null && rightVal !== null && (
        <text
          x={VIEW_W / 2}
          y={SUM_Y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
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

/** Default export: the eight bare cards with both position rulers — no answer. */
export default function SumCards24G1Illustration() {
  const ariaList = SUM_CARDS_24G1.join(', ')
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Delapan kartu bilangan berderet dari kiri ke kanan: ${ariaList}. Di bawah kartu ada dua deret nomor posisi: 1 sampai 8 dihitung dari kiri untuk ke-□, dan 8 sampai 1 dihitung dari kanan untuk ke-△.`}
    >
      <SumCards24G1 />
    </div>
  )
}
