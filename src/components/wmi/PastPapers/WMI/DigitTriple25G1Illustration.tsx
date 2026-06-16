// WMI-25F1A-Q17 (2025 Grade 1 Final).
// Six digit cards: 0, 2, 4, 6, 7, 9. Use each digit exactly once to form three
// 2-digit numbers. Find the SMALLEST possible difference between the largest and
// the smallest of the three numbers.
//
// Solution (NOT shown in the static figure): e.g. 49, 62, 70 → largest 70,
// smallest 49, difference 70 - 49 = 21. (A 2-digit number cannot have tens
// digit 0, so 0 must be a units digit.) The answer is 21 (fill-in).
//
// The default export draws ONLY the six bare digit cards plus three empty "□□"
// 2-digit slots — no formed numbers, no difference, no answer. The
// `DigitTriple25G1` primitive is co-exported so the post-answer animator can
// fill the slots with the three formed numbers and reveal the difference.
//
// Pure render, SSR-safe, deterministic — no random, no dates, no effects.

export const CARD_DIGITS = [0, 2, 4, 6, 7, 9] as const
export const SLOT_COUNT = 3

// --- palette (qupu-* tokens via raw hex, per the card reference) -------------
const INK = '#1F2937' // qupu ink / slate
const CREAM = '#FFF2DF' // qupu-cream card face
const ORANGE = '#f0853a' // qupu-brand-orange
const ORANGE_DK = '#C56A12' // qupu-brand-orange darker
const ORANGE_FILL = 'rgba(240,133,58,0.16)'
const BLUE = '#30598A' // qupu-brand-blue
const BLUE_DK = '#1E3A8A' // qupu-ink
const BLUE_FILL = 'rgba(48,89,138,0.14)'
const SLOT_STROKE = '#9CA3AF' // qupu slate (empty slot outline)
const SLOT_FILL = '#FFF9F4' // qupu-shell
const SLOT_GLYPH = '#C9CDD4' // faint placeholder digit color

// --- layout ------------------------------------------------------------------
const CARD_W = 42
const CARD_H = 54
const CARD_GAP = 12
const PAD_X = 16
const PAD_TOP = 16

const ROW_W = CARD_DIGITS.length * CARD_W + (CARD_DIGITS.length - 1) * CARD_GAP

// "Each digit once → three 2-digit numbers" band below the source cards.
const ARROW_GAP = 16
const SLOT_DIGIT_W = 30 // one digit cell inside a 2-digit slot
const SLOT_DIGIT_H = 46
const SLOT_INNER_GAP = 4 // gap between the two digit cells of one number
const SLOT_W = 2 * SLOT_DIGIT_W + SLOT_INNER_GAP + 16 // padded 2-digit plate
const SLOT_H = SLOT_DIGIT_H + 16
const SLOT_GAP = 18
const DIFF_GAP = 16
const DIFF_H = 34

const SLOTS_W = SLOT_COUNT * SLOT_W + (SLOT_COUNT - 1) * SLOT_GAP

export const DT_VIEW_W = PAD_X * 2 + Math.max(ROW_W, SLOTS_W)
export const DT_VIEW_H =
  PAD_TOP + CARD_H + ARROW_GAP + SLOT_H + DIFF_GAP + DIFF_H + 12

const CONTENT_W = DT_VIEW_W - PAD_X * 2
const ROW_X0 = PAD_X + (CONTENT_W - ROW_W) / 2
const SLOTS_X0 = PAD_X + (CONTENT_W - SLOTS_W) / 2
const CARD_Y = PAD_TOP
const SLOT_Y = PAD_TOP + CARD_H + ARROW_GAP

export const cardX = (i: number) => ROW_X0 + i * (CARD_W + CARD_GAP)
export const slotX = (i: number) => SLOTS_X0 + i * (SLOT_W + SLOT_GAP)

/** One source digit card. `used` fades it once consumed by a formed number. */
function DigitCard({ digit, x, used }: { digit: number; x: number; used: boolean }) {
  const opacity = used ? 0.4 : 1
  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={CARD_Y}
        width={CARD_W}
        height={CARD_H}
        rx={8}
        fill={CREAM}
        stroke={ORANGE}
        strokeWidth={2.5}
      />
      {/* subtle inner top edge so it reads as a stacked card */}
      <line
        x1={x + 7}
        y1={CARD_Y + 9}
        x2={x + CARD_W - 7}
        y2={CARD_Y + 9}
        stroke={ORANGE}
        strokeWidth={1}
        opacity={0.3}
      />
      <text
        x={x + CARD_W / 2}
        y={CARD_Y + CARD_H / 2 + 3}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={28}
        fontWeight={900}
        fill={INK}
      >
        {digit}
      </text>
    </g>
  )
}

/**
 * One 2-digit number plate. When `value` is null it is an empty "□□" slot;
 * when a two-character string it renders the formed number (animator reveal).
 */
function NumberSlot({ x, value }: { x: number; value: string | null }) {
  const filled = value !== null && value.length === 2
  const tens = filled ? value[0] : null
  const ones = filled ? value[1] : null
  const cellY = SLOT_Y + (SLOT_H - SLOT_DIGIT_H) / 2
  const cell0X = x + 8
  const cell1X = cell0X + SLOT_DIGIT_W + SLOT_INNER_GAP

  const cellStroke = filled ? BLUE : SLOT_STROKE
  const cellFill = filled ? BLUE_FILL : SLOT_FILL
  const glyphFill = filled ? BLUE_DK : SLOT_GLYPH

  return (
    <g>
      {/* plate background */}
      <rect
        x={x}
        y={SLOT_Y}
        width={SLOT_W}
        height={SLOT_H}
        rx={9}
        fill="none"
        stroke={filled ? BLUE : SLOT_STROKE}
        strokeWidth={filled ? 2.5 : 1.5}
        strokeDasharray={filled ? undefined : '5 4'}
      />
      {/* tens cell */}
      <rect
        x={cell0X}
        y={cellY}
        width={SLOT_DIGIT_W}
        height={SLOT_DIGIT_H}
        rx={6}
        fill={cellFill}
        stroke={cellStroke}
        strokeWidth={2}
      />
      {/* ones cell */}
      <rect
        x={cell1X}
        y={cellY}
        width={SLOT_DIGIT_W}
        height={SLOT_DIGIT_H}
        rx={6}
        fill={cellFill}
        stroke={cellStroke}
        strokeWidth={2}
      />
      <text
        x={cell0X + SLOT_DIGIT_W / 2}
        y={cellY + SLOT_DIGIT_H / 2 + 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={24}
        fontWeight={900}
        fill={glyphFill}
      >
        {filled ? tens : '?'}
      </text>
      <text
        x={cell1X + SLOT_DIGIT_W / 2}
        y={cellY + SLOT_DIGIT_H / 2 + 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={24}
        fontWeight={900}
        fill={glyphFill}
      >
        {filled ? ones : '?'}
      </text>
    </g>
  )
}

export interface DigitTriple25G1Props {
  /**
   * The three formed 2-digit numbers, e.g. ['49','62','70'] (animator reveal).
   * Individual entries may be null to leave that slot empty — this lets the
   * post-answer animation fill the slots one at a time (e.g. [null,null,'70']).
   * When omitted/null all slots stay empty and no difference is shown.
   * The difference plate only appears once all three numbers are present.
   */
  formed?: (string | null)[] | null
}

/**
 * Primitive for the animator. Default render (no props) = six bare digit cards
 * plus three empty 2-digit slots. When `formed` is supplied:
 *  - each slot is filled with one formed number,
 *  - the source cards consumed by the digits fade out,
 *  - a difference plate (largest - smallest) is revealed below.
 */
export function DigitTriple25G1({ formed }: DigitTriple25G1Props = {}) {
  // Per-slot value (may be partially filled while the animation builds up).
  const isTwoDigit = (s: unknown): s is string => typeof s === 'string' && /^\d\d$/.test(s)
  const values: (string | null)[] = Array.from({ length: SLOT_COUNT }, (_, i) => {
    const v = Array.isArray(formed) ? formed[i] : null
    return isTwoDigit(v) ? v : null
  })
  // All three present? Only then do we fade consumed cards + show the difference.
  const complete = values.every((v) => v !== null)

  // Which source cards are consumed by the slots placed so far (to fade them).
  const usedDigits = new Set<number>()
  values.forEach((s) => {
    if (s) {
      usedDigits.add(Number(s[0]))
      usedDigits.add(Number(s[1]))
    }
  })
  const usedCardIndex = new Set<number>()
  CARD_DIGITS.forEach((d, i) => {
    if (usedDigits.has(d)) usedCardIndex.add(i)
  })

  // Difference reveal — only when all three numbers are present.
  let diff: number | null = null
  let lo: number | null = null
  let hi: number | null = null
  if (complete) {
    const nums = values.map((s) => Number(s))
    hi = Math.max(...nums)
    lo = Math.min(...nums)
    diff = hi - lo
  }

  const diffY = SLOT_Y + SLOT_H + DIFF_GAP
  const diffPlateW = Math.min(SLOTS_W, CONTENT_W)
  const diffPlateX = PAD_X + (CONTENT_W - diffPlateW) / 2

  return (
    <svg
      viewBox={`0 0 ${DT_VIEW_W} ${DT_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* six source digit cards */}
      {CARD_DIGITS.map((d, i) => (
        <DigitCard key={i} digit={d} x={cardX(i)} used={usedCardIndex.has(i)} />
      ))}

      {/* three 2-digit number slots */}
      {values.map((v, i) => (
        <NumberSlot key={i} x={slotX(i)} value={v} />
      ))}

      {/* difference plate (animator reveal only) */}
      {diff !== null && (
        <g>
          <rect
            x={diffPlateX}
            y={diffY}
            width={diffPlateW}
            height={DIFF_H}
            rx={8}
            fill={ORANGE_FILL}
            stroke={ORANGE}
            strokeWidth={2}
          />
          <text
            x={diffPlateX + diffPlateW / 2}
            y={diffY + DIFF_H / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={17}
            fontWeight={900}
            fill={ORANGE_DK}
          >
            {`${hi} − ${lo} = ${diff}`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function DigitTriple25G1Illustration() {
  const label = CARD_DIGITS.join(', ')
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Enam kartu angka bertuliskan ${label}. Gunakan tiap angka satu kali untuk membentuk tiga bilangan dua angka, lalu cari selisih terkecil antara bilangan terbesar dan terkecil dari ketiganya.`}
    >
      <DigitTriple25G1 />
    </div>
  )
}
