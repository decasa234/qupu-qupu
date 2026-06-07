// "Lock code from clues" figure for WMI-19F1-Q23 (answer 527).
// A small 3-digit lock/keypad up top (unknown digits), and the five clue rows below.
// Clues (from the paper):
//   347 -> 1 digit correct AND in the right place
//   392 -> 1 digit correct, WRONG place
//   753 -> 2 digits correct
//   164 -> 0 correct  (eliminates 1, 6, 4)
//   831 -> 0 correct  (eliminates 8, 3, 1)
// Surviving deduction lands on the official code 527.

export const LOCK_CODE = '527'

export type ClueKind = 'rightPlace' | 'wrongPlace' | 'count' | 'none'

export interface Clue {
  guess: string
  kind: ClueKind
  /** How many digits are correct (for label text). */
  correct: number
}

export const CLUES: ReadonlyArray<Clue> = [
  { guess: '347', kind: 'rightPlace', correct: 1 },
  { guess: '392', kind: 'wrongPlace', correct: 1 },
  { guess: '753', kind: 'count', correct: 2 },
  { guess: '164', kind: 'none', correct: 0 },
  { guess: '831', kind: 'none', correct: 0 },
]

/** Digits eliminated by the two "no digit correct" clues. */
export const ELIMINATED = new Set<string>(['1', '6', '4', '8', '3'])

export const LC_VIEW_W = 320
export const LC_VIEW_H = 340

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const RED = '#DC2626'
const GRAY = '#9CA3AF'
const LOCK_BODY = '#FBBF24'
const LOCK_SHACKLE = '#9CA3AF'

// Lock layout.
const LOCK_CX = LC_VIEW_W / 2
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

export interface LockCodeFigureProps {
  /** Digits currently shown in the lock slots; null = still unknown. */
  slots?: (string | null)[]
  /** Cross out eliminated digits in the clue rows (digits in ELIMINATED). */
  crossEliminated?: boolean
  /** Highlight these guess digits as "surviving / fits": "rowIndex-colIndex". */
  highlight?: Set<string>
  /** Mark the lock as solved (green). */
  solved?: boolean
}

export function LockCodeFigure({
  slots = [null, null, null],
  crossEliminated = false,
  highlight,
  solved = false,
}: LockCodeFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${LC_VIEW_W} ${LC_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <Lock digits={slots} solved={solved} />

      {CLUES.map((clue, r) => {
        const y = rowY(r)
        return (
          <g key={`clue-${r}`}>
            {/* The three guess digits. */}
            {clue.guess.split('').map((ch, c) => {
              const elim = crossEliminated && ELIMINATED.has(ch)
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

function FeedbackBadge({ clue, x, y }: { clue: Clue; x: number; y: number }) {
  const label =
    clue.kind === 'none'
      ? '0 correct'
      : clue.kind === 'rightPlace'
        ? '1 correct, right spot'
        : clue.kind === 'wrongPlace'
          ? '1 correct, wrong spot'
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

export default function LockCodeIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A 3-digit lock with unknown digits, and five clue rows: 347 (1 correct in the right place), 392 (1 correct in the wrong place), 753 (2 correct), 164 (none correct), 831 (none correct). The clues point to the code ${LOCK_CODE}.`}
    >
      <LockCodeFigure />
    </div>
  )
}
