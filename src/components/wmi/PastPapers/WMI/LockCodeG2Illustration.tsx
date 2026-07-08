// "Lock code from clues" figure for WMI-19F2A-Q22 (answer 527).
// A small 3-digit lock/keypad up top (unknown digits), and the five clue rows below.
// Clues (from the paper):
//   347 -> 1 digit correct AND in the right place
//   392 -> 1 digit correct, WRONG place
//   753 -> 2 digits correct, both in the WRONG place
//   164 -> 0 correct  (eliminates 1, 6, 4)
//   415 -> 1 digit correct
// Surviving deduction lands on the official code 527.

export const LOCK_CODE_G2 = '527'

export type ClueKindG2 = 'rightPlace' | 'wrongPlace' | 'count' | 'none'

export interface ClueG2 {
  guess: string
  kind: ClueKindG2
  /** How many digits are correct (for label text). */
  correct: number
}

export const CLUES_G2: ReadonlyArray<ClueG2> = [
  { guess: '347', kind: 'rightPlace', correct: 1 },
  { guess: '392', kind: 'wrongPlace', correct: 1 },
  { guess: '753', kind: 'wrongPlace', correct: 2 },
  { guess: '164', kind: 'none', correct: 0 },
  { guess: '415', kind: 'count', correct: 1 },
]

/** Digits eliminated by the single "no digit correct" clue (164). */
export const ELIMINATED_G2 = new Set<string>(['1', '6', '4'])

export const LCG2_VIEW_W = 320
export const LCG2_VIEW_H = 340
// The shackle arcs above y = 0; give the viewBox top headroom so its rounded
// top isn't clipped flat by the figure box (overflow-hidden).
const LCG2_PAD_TOP = 12

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const RED = '#DC2626'
const GRAY = '#9CA3AF'
const LOCK_BODY = '#FBBF24'
const LOCK_SHACKLE = '#9CA3AF'

// Lock layout.
const LOCK_CX = LCG2_VIEW_W / 2
const LOCK_BODY_Y = 44
const LOCK_BODY_W = 150
const LOCK_BODY_H = 92
const SLOT = 36
const SLOT_GAP = 8
const SLOTS_W = SLOT * 3 + SLOT_GAP * 2
const SLOT_X0 = LOCK_CX - SLOTS_W / 2
const SLOT_Y = LOCK_BODY_Y + 28

// Clue rows.
const ROW_Y0 = 158
const ROW_H = 36
const ROW_GAP = 0
const DIGIT_W = 26
const DIGIT_GAP = 4
const GUESS_X0 = 28

const slotX = (i: number) => SLOT_X0 + i * (SLOT + SLOT_GAP)
const rowY = (i: number) => ROW_Y0 + i * (ROW_H + ROW_GAP)
const digitX = (i: number) => GUESS_X0 + i * (DIGIT_W + DIGIT_GAP)

function Lock({ digits, solved }: { digits: (string | null)[]; solved: boolean }) {
  const stroke = solved ? GREEN : INK
  return (
    <g>
      {/* Shackle. */}
      <path
        d={`M ${LOCK_CX - 34} ${LOCK_BODY_Y + 6} v -18 a 34 34 0 0 1 68 0 v 18`}
        fill="none"
        stroke={LOCK_SHACKLE}
        strokeWidth={11}
        strokeLinecap="round"
      />
      {/* Body. */}
      <rect
        x={LOCK_CX - LOCK_BODY_W / 2}
        y={LOCK_BODY_Y}
        width={LOCK_BODY_W}
        height={LOCK_BODY_H}
        rx={12}
        fill={LOCK_BODY}
        stroke={stroke}
        strokeWidth={solved ? 3 : 2}
      />
      {/* Three digit slots. */}
      {[0, 1, 2].map((i) => {
        const d = digits[i]
        const filled = d !== null
        return (
          <g key={`slot-${i}`}>
            <rect
              x={slotX(i)}
              y={SLOT_Y}
              width={SLOT}
              height={SLOT + 4}
              rx={5}
              fill="#FFFFFF"
              stroke={filled ? GREEN : INK}
              strokeWidth={filled ? 3 : 2}
            />
            <text
              x={slotX(i) + SLOT / 2}
              y={SLOT_Y + (SLOT + 4) / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={22}
              fontWeight={900}
              fill={filled ? '#065F46' : GRAY}
            >
              {filled ? d : '?'}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export interface LockCodeG2FigureProps {
  /** Digits currently shown in the lock slots; null = still unknown. */
  slots?: (string | null)[]
  /** Cross out eliminated digits in the clue rows (digits in ELIMINATED_G2). */
  crossEliminated?: boolean
  /** Extra digit characters to also cross out (deduced out beyond the 164 clue). */
  extraCrossed?: Set<string>
  /** Highlight these guess digits as "surviving / fits": "rowIndex-colIndex". */
  highlight?: Set<string>
  /** Mark the lock as solved (green). */
  solved?: boolean
}

export function LockCodeG2Figure({
  slots = [null, null, null],
  crossEliminated = false,
  extraCrossed,
  highlight,
  solved = false,
}: LockCodeG2FigureProps) {
  return (
    <svg
      viewBox={`0 ${-LCG2_PAD_TOP} ${LCG2_VIEW_W} ${LCG2_VIEW_H + LCG2_PAD_TOP}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <Lock digits={slots} solved={solved} />

      {CLUES_G2.map((clue, r) => {
        const y = rowY(r)
        return (
          <g key={`clue-${r}`}>
            {/* The three guess digits. */}
            {clue.guess.split('').map((ch, c) => {
              const elim = crossEliminated && (ELIMINATED_G2.has(ch) || (extraCrossed?.has(ch) ?? false))
              const hot = highlight?.has(`${r}-${c}`) ?? false
              return (
                <g key={`g-${r}-${c}`}>
                  <rect
                    x={digitX(c)}
                    y={y}
                    width={DIGIT_W}
                    height={ROW_H - 6}
                    rx={4}
                    fill={hot ? GREEN_FILL : '#FFFFFF'}
                    stroke={hot ? GREEN : elim ? GRAY : INK}
                    strokeWidth={hot ? 2.5 : 1.5}
                  />
                  <text
                    x={digitX(c) + DIGIT_W / 2}
                    y={y + (ROW_H - 6) / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-display"
                    fontSize={16}
                    fontWeight={800}
                    fill={hot ? '#065F46' : elim ? GRAY : INK}
                  >
                    {ch}
                  </text>
                  {elim && (
                    <line
                      x1={digitX(c) + 3}
                      y1={y + ROW_H - 8}
                      x2={digitX(c) + DIGIT_W - 3}
                      y2={y + 2}
                      stroke={RED}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  )}
                </g>
              )
            })}

            {/* Feedback label. */}
            <FeedbackBadge clue={clue} x={digitX(2) + DIGIT_W + 12} y={y + (ROW_H - 6) / 2} />
          </g>
        )
      })}
    </svg>
  )
}

function FeedbackBadge({ clue, x, y }: { clue: ClueG2; x: number; y: number }) {
  const label =
    clue.kind === 'none'
      ? '0 correct'
      : clue.kind === 'rightPlace'
        ? '1 correct, right spot'
        : clue.kind === 'wrongPlace'
          ? `${clue.correct} correct, wrong spot`
          : `${clue.correct} correct`
  const color = clue.kind === 'none' ? RED : clue.kind === 'rightPlace' ? GREEN : '#30598A'
  return (
    <text
      x={x}
      y={y}
      dominantBaseline="central"
      className="font-display"
      fontSize={11}
      fontWeight={800}
      fill={color}
    >
      {label}
    </text>
  )
}

export default function LockCodeG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A 3-digit lock with unknown digits, and five clue rows: 347 (1 correct in the right place), 392 (1 correct in the wrong place), 753 (2 correct, both in the wrong place), 164 (none correct), 415 (1 correct). The clues point to the code ${LOCK_CODE_G2}.`}
    >
      <LockCodeG2Figure />
    </div>
  )
}
