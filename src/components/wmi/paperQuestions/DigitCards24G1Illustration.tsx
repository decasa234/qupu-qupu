// WMI-24F1A-Q17 (2024 Grade 1 Final).
// Six number cards: 6, 0, 5, 7, 4, 2.
// Task (NOT shown in the static figure): pick three cards to form the SMALLEST
// 3-digit EVEN number (= 204, cards 2/0/4), then from the three leftover cards
// {5, 6, 7} form the LARGEST 2-digit ODD number (= 75). The answer is the odd
// number, 75 (fill-in).
//
// The default export draws ONLY the six bare cards — no formed numbers, no
// highlight, no answer. The `DigitCards24G1` primitive is co-exported so the
// post-answer animator can highlight the chosen cards (pick3 / pick2) and reveal
// the formed numbers (204, then 75).
//
// Pure render, SSR-safe, deterministic — no random, no dates, no effects.

export const CARD_DIGITS = [6, 0, 5, 7, 4, 2] as const

// --- palette (qupu-* tokens via raw hex, per the card reference) -------------
const INK = '#1F2937' // qupu ink / slate
const CREAM = '#FFF8EE' // qupu-cream card face
const ORANGE = '#F2912B' // qupu-brand-orange
const ORANGE_DK = '#C56A12' // qupu-brand-orange darker
const ORANGE_FILL = 'rgba(242,145,43,0.16)'
const BLUE = '#2D7FB8' // qupu-brand-blue
const BLUE_DK = '#1E5C86'
const BLUE_FILL = 'rgba(45,127,184,0.14)'

// --- layout ------------------------------------------------------------------
const CARD_W = 56
const CARD_H = 72
const CARD_GAP = 16
const PAD_X = 14
const PAD_TOP = 16
// Headroom below the cards so the formed-number band (animator) never clips.
const FORMED_H = 34
const FORMED_GAP = 16

const ROW_W = CARD_DIGITS.length * CARD_W + (CARD_DIGITS.length - 1) * CARD_GAP
export const DC_VIEW_W = PAD_X * 2 + ROW_W
export const DC_VIEW_H = PAD_TOP + CARD_H + FORMED_GAP + FORMED_H + 12

const ROW_X0 = PAD_X
const CARD_Y = PAD_TOP

export const cardX = (i: number) => ROW_X0 + i * (CARD_W + CARD_GAP)

type Highlight = 'even' | 'odd' | null

/** One number card. `tone` controls picked-state coloring. */
function NumberCard({
  digit,
  x,
  tone,
  faded,
}: {
  digit: number
  x: number
  tone: Highlight
  faded: boolean
}) {
  const picked = tone !== null
  let stroke = INK
  let fill = CREAM
  let textColor = INK
  if (tone === 'even') {
    stroke = BLUE
    fill = BLUE_FILL
    textColor = BLUE_DK
  } else if (tone === 'odd') {
    stroke = ORANGE
    fill = ORANGE_FILL
    textColor = ORANGE_DK
  }
  const opacity = faded ? 0.4 : 1
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
      {/* subtle inner top edge to read as a stacked card */}
      <line
        x1={x + 8}
        y1={CARD_Y + 10}
        x2={x + CARD_W - 8}
        y2={CARD_Y + 10}
        stroke={stroke}
        strokeWidth={1}
        opacity={0.35}
      />
      <text
        x={x + CARD_W / 2}
        y={CARD_Y + CARD_H / 2 + 4}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={36}
        fontWeight={900}
        fill={textColor}
      >
        {digit}
      </text>
    </g>
  )
}

export interface DigitCards24G1Props {
  /** Indices of cards chosen for the 3-digit even number (highlight blue). */
  pick3?: number[]
  /** Indices of cards chosen for the 2-digit odd number (highlight orange). */
  pick2?: number[]
  /** Formed numbers to reveal in the band below (animator only). */
  showFormed?: { even?: string; odd?: string }
}

/**
 * Primitive for the animator. Default render (no props) = six bare cards.
 * - `pick3` tints those cards blue (even-number group).
 * - `pick2` tints those cards orange (odd-number group).
 * - cards in neither set fade once any pick is active.
 * - `showFormed` reveals the formed number(s) in the band below the cards.
 */
export function DigitCards24G1({ pick3, pick2, showFormed }: DigitCards24G1Props = {}) {
  const pick3Set = new Set(pick3 ?? [])
  const pick2Set = new Set(pick2 ?? [])
  const anyPick = pick3Set.size > 0 || pick2Set.size > 0

  const toneFor = (i: number): Highlight => {
    if (pick3Set.has(i)) return 'even'
    if (pick2Set.has(i)) return 'odd'
    return null
  }

  const formedEven = showFormed?.even
  const formedOdd = showFormed?.odd
  const showBand = Boolean(formedEven || formedOdd)
  const bandY = PAD_TOP + CARD_H + FORMED_GAP

  return (
    <svg
      viewBox={`0 0 ${DC_VIEW_W} ${DC_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {CARD_DIGITS.map((d, i) => {
        const tone = toneFor(i)
        const faded = anyPick && tone === null
        return <NumberCard key={i} digit={d} x={cardX(i)} tone={tone} faded={faded} />
      })}

      {showBand && (
        <g>
          {formedEven && (
            <FormedChip
              x={ROW_X0}
              y={bandY}
              w={ROW_W * 0.46}
              label="genap"
              value={formedEven}
              tone="even"
            />
          )}
          {formedOdd && (
            <FormedChip
              x={ROW_X0 + ROW_W * 0.54}
              y={bandY}
              w={ROW_W * 0.46}
              label="ganjil"
              value={formedOdd}
              tone="odd"
            />
          )}
        </g>
      )}
    </svg>
  )
}

/** A formed-number plate shown under the cards (animator reveal). */
function FormedChip({
  x,
  y,
  w,
  label,
  value,
  tone,
}: {
  x: number
  y: number
  w: number
  label: string
  value: string
  tone: 'even' | 'odd'
}) {
  const stroke = tone === 'even' ? BLUE : ORANGE
  const fill = tone === 'even' ? BLUE_FILL : ORANGE_FILL
  const textColor = tone === 'even' ? BLUE_DK : ORANGE_DK
  return (
    <g>
      <rect x={x} y={y} width={w} height={FORMED_H} rx={8} fill={fill} stroke={stroke} strokeWidth={2} />
      <text
        x={x + 10}
        y={y + FORMED_H / 2 + 1}
        dominantBaseline="central"
        className="font-display"
        fontSize={11}
        fontWeight={800}
        fill={textColor}
        opacity={0.8}
      >
        {label}
      </text>
      <text
        x={x + w - 10}
        y={y + FORMED_H / 2 + 1}
        textAnchor="end"
        dominantBaseline="central"
        className="font-display"
        fontSize={22}
        fontWeight={900}
        fill={textColor}
      >
        {value}
      </text>
    </g>
  )
}

export default function DigitCards24G1Illustration() {
  const label = CARD_DIGITS.join(', ')
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Enam kartu angka bertuliskan ${label}. Pilih tiga kartu untuk membentuk bilangan genap 3 angka terkecil, lalu dari tiga kartu sisanya bentuk bilangan ganjil 2 angka terbesar.`}
    >
      <DigitCards24G1 />
    </div>
  )
}
