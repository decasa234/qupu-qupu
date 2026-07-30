// WMI-24F1A-Q23 (Grade 1) — "remove one operator card" expression.
//
// Official stem: "Use 9 square number cards and 8 circular arithmetic cards to
// form an expression from left to right. When an arithmetic card is removed, the
// 2 adjacent number cards will be seen as a 2-digit number while the other cards
// stay the same. If the result of this expression is a 2-digit number, find the
// largest result."  The stem names no values — the expression lives only in the
// figure, so all SEVENTEEN cards have to be drawn and legible:
//
//   [9] (+) [8] (+) [7] (+) [6] (−) [5] (−) [4] (+) [3] (+) [2] (−) [1]
//
// SQUARE cards carry the digits; the operators are ROUND yellow cards, exactly as
// printed. (An earlier revision drew the operators as bare symbols between the
// number cards, so "8 circular arithmetic cards" had nothing to point at and the
// card that gets removed did not read as a card at all.)
//
// (Solution — never drawn here: remove the '+' between 8 and 7 →
//  9 + 87 + 6 − 5 − 4 + 3 + 2 − 1 = 97, the largest valid 2-digit total.)
//
// The static figure shows ONLY the full expression — no removed operator and no
// result. The animator imports the RemoveOp24G1 primitive and passes
// `removeOpIndex` (0..7) to lift one operator + merge its neighbours, and
// `showResult` to reveal the computed value post-answer.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// The 9 number cards, left to right.
const NUMBERS = [9, 8, 7, 6, 5, 4, 3, 2, 1] as const
// The 8 circular operator cards between them. '+' adds, '-' subtracts (rendered as '−').
const OPS = ['+', '+', '+', '-', '-', '+', '+', '-'] as const

const INK = '#2B2622'
const CARD_FILL = '#FFF8EE' // qupu cream — a number card face
const CARD_LINE = '#2B2622' // the paper's black card rule
const MERGE_FILL = '#FDEBDD' // peach — the fused 2-digit card
const MERGE_LINE = '#F0853A' // brand orange edge on the fused card
const OP_FILL = '#FDF3D0' // pale yellow — a circular operator card
const OP_LINE = '#E0A000' // brand yellow edge
const MUTED = '#A8997F' // the lifted-out operator card
const RESULT_INK = '#30598A' // brand blue result readout

// --- layout (viewBox units) ---------------------------------------------
const NUM_W = 34 // number-card width (single digit)
const MERGE_W = 56 // merged 2-digit card width
const CARD_H = 40
const OP_D = 28 // operator-card diameter
const GAP = 3 // gap between adjacent cards
const PAD_X = 10
const PAD_TOP = 26 // headroom for the lifted operator card
const PAD_BOTTOM = 12
const RESULT_H = 34
const RESULT_GAP = 10

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
      slots.push({ kind: 'op', symbol: OPS[i] === '+' ? '+' : '−', w: OP_D, removed: isRemoved })
    }
  }
  return slots
}

/**
 * Compute the value of the expression after removing operator card `k`.
 *
 * Terms are walked left to right, each carrying the sign of the operator printed
 * BEFORE it. Removing card k fuses NUMBERS[k] and NUMBERS[k+1] into one term
 * that keeps NUMBERS[k]'s sign (OPS[k-1]); the term after it is governed by
 * OPS[k+1], because OPS[k] is the card that was taken away.
 */
function evaluate(removeOpIndex: number): number {
  const k = removeOpIndex
  let total = 0
  // Sign for the term at index i: '+' before the first term, else OPS[i-1].
  const signOf = (i: number) => (i === 0 ? 1 : OPS[i - 1] === '+' ? 1 : -1)
  for (let i = 0; i < NUMBERS.length; i++) {
    if (i === k) {
      // the fused 2-digit term, signed by the operator before NUMBERS[k]
      total += signOf(i) * (NUMBERS[k] * 10 + NUMBERS[k + 1])
      i++ // NUMBERS[k+1] is folded in
      continue
    }
    // A term sitting just after the merge is governed by OPS[k+1], not OPS[k].
    const sign = i === k + 2 ? (OPS[k + 1] === '+' ? 1 : -1) : signOf(i)
    total += sign * NUMBERS[i]
  }
  return total
}

/** A round operator card. */
function OpCard({
  cx,
  cy,
  symbol,
  tone,
}: {
  cx: number
  cy: number
  symbol: string
  tone: 'normal' | 'lifted'
}) {
  const lifted = tone === 'lifted'
  return (
    <g opacity={lifted ? 0.55 : 1}>
      <circle
        cx={cx}
        cy={cy}
        r={OP_D / 2}
        fill={lifted ? '#FFFFFF' : OP_FILL}
        stroke={lifted ? MUTED : OP_LINE}
        strokeWidth={2}
        strokeDasharray={lifted ? '4 3' : undefined}
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={19}
        fontWeight={800}
        fill={lifted ? MUTED : INK}
      >
        {symbol}
      </text>
    </g>
  )
}

export interface RemoveOp24G1Props {
  /** Operator card to remove, 0..7. null/undefined → full expression. */
  removeOpIndex?: number | null
  /** When true (and an operator is removed), show the computed result. */
  showResult?: boolean
}

/**
 * Reusable primitive: the row of alternating square number / round operator cards.
 * - Default (no `removeOpIndex`) → the bare full expression, all 17 cards.
 * - `removeOpIndex` set → lifts that round card out and merges its two neighbours.
 * - `showResult` → appends "= <value>" below (only meaningful with a removal).
 */
export function RemoveOp24G1({ removeOpIndex = null, showResult = false }: RemoveOp24G1Props = {}) {
  const idx = removeOpIndex
  const slots = buildSlots(idx)

  // Lay out slots left to right, tracking each one's x.
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
  const height = PAD_TOP + CARD_H + PAD_BOTTOM + (hasResult ? RESULT_GAP + RESULT_H : 0)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 480 }}
      aria-hidden="true"
    >
      {placed.map((slot, i) => {
        if (slot.kind === 'op') {
          // A removed card floats above the row, dashed and dimmed; a normal one
          // sits inline as the printed yellow circle.
          const cy = slot.removed ? PAD_TOP - OP_D / 2 - 4 : rowMidY
          return (
            <OpCard
              key={i}
              cx={slot.x + slot.w / 2}
              cy={cy}
              symbol={slot.symbol}
              tone={slot.removed ? 'lifted' : 'normal'}
            />
          )
        }
        // Square number card (single digit or merged 2-digit).
        return (
          <g key={i}>
            <rect
              x={slot.x}
              y={PAD_TOP}
              width={slot.w}
              height={CARD_H}
              rx={4}
              fill={slot.merged ? MERGE_FILL : CARD_FILL}
              stroke={slot.merged ? MERGE_LINE : CARD_LINE}
              strokeWidth={slot.merged ? 2.5 : 2}
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
          className="font-display"
          fontSize={24}
          fontWeight={800}
          fill={RESULT_INK}
        >
          {`= ${resultValue}`}
        </text>
      )}
    </svg>
  )
}

const SAMPLE_ARIA =
  'Sebuah perhitungan dari sembilan kartu angka persegi dan delapan kartu operasi bulat, dari kiri ke kanan: ' +
  '9 tambah 8 tambah 7 tambah 6 kurang 5 kurang 4 tambah 3 tambah 2 kurang 1. Jika satu kartu operasi ' +
  'dihilangkan, dua kartu angka di sisinya terbaca sebagai satu bilangan dua angka; cari hasil dua angka ' +
  'terbesar yang mungkin.'

export default function RemoveOp24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={SAMPLE_ARIA}>
      <RemoveOp24G1 />
    </div>
  )
}
