// WMI-24F1A-Q23 (Grade 1) — "remove one operator card" expression.
//
// The printed expression is built from 9 number cards and 8 operator cards:
//   9 + 8 + 7 + 6 − 5 − 4 + 3 + 2 − 1
// Removing exactly ONE operator card lets its two neighbour number cards join
// into a single 2-digit number; everything else is computed unchanged. The
// question asks for the LARGEST 2-digit result reachable this way.
//
// (Solution — never drawn here: remove the '+' between 8 and 7 →
//  9 + 87 + 6 − 5 − 4 + 3 + 2 − 1 = 97, the largest valid 2-digit total.)
//
// The static figure shows ONLY the full expression — no removed operator and no
// result. The animator imports the RemoveOp24G1 primitive and passes
// `removeOpIndex` (0..7) to lift one operator + merge its neighbours, and
// `showResult` to reveal the computed value post-answer.

// The 9 number cards, left to right.
const NUMBERS = [9, 8, 7, 6, 5, 4, 3, 2, 1] as const
// The 8 operator cards between them. '+' adds, '-' subtracts (rendered as '−').
const OPS = ['+', '+', '+', '-', '-', '+', '+', '-'] as const

const INK = '#2B2B2B'

// --- layout (viewBox units) ---------------------------------------------
const NUM_W = 40 // number-card width (single digit)
const MERGE_W = 64 // merged 2-digit card width
const CARD_H = 46
const OP_W = 26 // operator-card width
const GAP = 8 // gap between adjacent cards
const PAD_X = 12
const PAD_TOP = 26 // headroom for the "lift" arc above a removed operator
const PAD_BOTTOM = 14
const RESULT_H = 40
const RESULT_GAP = 14

type Slot =
  | { kind: 'num'; value: number; w: number; merged?: boolean }
  | { kind: 'op'; symbol: string; w: number; removed?: boolean }

/**
 * Build the ordered list of slots (number / operator cards) for a given
 * `removeOpIndex`. When an operator is removed, its two neighbour numbers fuse
 * into one wider 2-digit card and the operator card is flagged `removed` (the
 * animator draws it lifted out; the static default omits it entirely).
 */
function buildSlots(removeOpIndex: number | null): Slot[] {
  const slots: Slot[] = []
  const merged = new Set<number>()
  if (removeOpIndex !== null && removeOpIndex >= 0 && removeOpIndex < OPS.length) {
    merged.add(removeOpIndex)
  }
  for (let i = 0; i < NUMBERS.length; i++) {
    // If this number is the left side of a merge, emit a combined 2-digit card.
    if (merged.has(i)) {
      const value = NUMBERS[i] * 10 + NUMBERS[i + 1]
      slots.push({ kind: 'num', value, w: MERGE_W, merged: true })
      i++ // skip the right neighbour — it is folded into the merged card
    } else {
      slots.push({ kind: 'num', value: NUMBERS[i], w: NUM_W })
    }
    // Emit the operator that follows this number, if any.
    if (i < OPS.length) {
      const isRemoved = i === removeOpIndex
      slots.push({ kind: 'op', symbol: OPS[i] === '+' ? '+' : '−', w: OP_W, removed: isRemoved })
    }
  }
  return slots
}

/** Compute the value of the expression after removing the given operator. */
function evaluate(removeOpIndex: number): number {
  const merged = NUMBERS[removeOpIndex] * 10 + NUMBERS[removeOpIndex + 1]
  let total = 0
  let signPos = true // running sign for the NEXT term; first term is positive
  for (let i = 0; i < NUMBERS.length; i++) {
    if (i === removeOpIndex) {
      total += signPos ? merged : -merged
      // the operator before the right neighbour is consumed by the merge
      if (i < OPS.length) signPos = OPS[i] === '+'
      i++ // skip the folded right neighbour
      continue
    }
    total += signPos ? NUMBERS[i] : -NUMBERS[i]
    if (i < OPS.length) signPos = OPS[i] === '+'
  }
  return total
}

export interface RemoveOp24G1Props {
  /** Operator card to remove, 0..7. null/undefined → full expression. */
  removeOpIndex?: number | null
  /** When true (and an operator is removed), show the computed result. */
  showResult?: boolean
}

/**
 * Reusable primitive: the row of alternating number / operator cards.
 * - Default (no `removeOpIndex`) → the bare full expression.
 * - `removeOpIndex` set → lifts that operator and merges its two neighbours.
 * - `showResult` → appends "= <value>" below (only meaningful with a removal).
 */
export function RemoveOp24G1({ removeOpIndex = null, showResult = false }: RemoveOp24G1Props = {}) {
  const idx = removeOpIndex
  const slots = buildSlots(idx)

  // Lay out slots left to right, tracking each one's x so we can place the
  // lifted operator and any merge underbrace precisely.
  let cursor = PAD_X
  const placed = slots.map((slot) => {
    const x = cursor
    cursor += slot.w + GAP
    return { ...slot, x }
  })
  const rowW = cursor - GAP + PAD_X
  const rowMidY = PAD_TOP + CARD_H / 2

  const hasResult = showResult && idx !== null && idx >= 0 && idx < OPS.length
  const resultValue = hasResult ? evaluate(idx as number) : null

  const width = rowW
  const height =
    PAD_TOP + CARD_H + PAD_BOTTOM + (hasResult ? RESULT_GAP + RESULT_H : 0)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 460 }}
      aria-hidden="true"
    >
      {placed.map((slot, i) => {
        if (slot.kind === 'op') {
          if (slot.removed) {
            // Lifted operator card: drawn above the row, dimmed, with a small
            // arc showing it was pulled out. (Only the animator reaches this.)
            const liftY = 2
            return (
              <g key={i} opacity={0.5}>
                <rect
                  x={slot.x}
                  y={liftY}
                  width={slot.w}
                  height={CARD_H * 0.5}
                  rx={6}
                  fill="#FFFFFF"
                  className="stroke-qupu-muted"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
                <text
                  x={slot.x + slot.w / 2}
                  y={liftY + CARD_H * 0.25 + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-display fill-qupu-muted"
                  fontSize={18}
                  fontWeight={800}
                >
                  {slot.symbol}
                </text>
              </g>
            )
          }
          // Normal operator: no card, just the symbol sitting between numbers.
          return (
            <text
              key={i}
              x={slot.x + slot.w / 2}
              y={rowMidY + 1}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={22}
              fontWeight={800}
              fill={INK}
            >
              {slot.symbol}
            </text>
          )
        }
        // Number card (single digit or merged 2-digit).
        const fillClass = slot.merged ? 'fill-qupu-peach' : 'fill-qupu-cream'
        return (
          <g key={i}>
            <rect
              x={slot.x}
              y={PAD_TOP}
              width={slot.w}
              height={CARD_H}
              rx={9}
              className={`${fillClass} stroke-qupu-brand-orange`}
              strokeWidth={2.5}
            />
            <text
              x={slot.x + slot.w / 2}
              y={rowMidY + 1}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={22}
              fontWeight={800}
              fill={INK}
            >
              {slot.value}
            </text>
          </g>
        )
      })}

      {/* result line — only when revealing post-answer */}
      {hasResult && (
        <text
          x={width / 2}
          y={PAD_TOP + CARD_H + RESULT_GAP + RESULT_H / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display fill-qupu-brand-blue"
          fontSize={24}
          fontWeight={800}
        >
          {`= ${resultValue}`}
        </text>
      )}
    </svg>
  )
}

const SAMPLE_ARIA =
  'Sebuah pernyataan dari sembilan kartu angka dan delapan kartu operator: ' +
  '9 + 8 + 7 + 6 − 5 − 4 + 3 + 2 − 1. Hapus tepat satu kartu operator sehingga dua ' +
  'kartu angka di sisinya bergabung menjadi satu bilangan dua angka; cari hasil dua ' +
  'angka terbesar yang mungkin.'

export default function RemoveOp24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={SAMPLE_ARIA}>
      <RemoveOp24G1 />
    </div>
  )
}
