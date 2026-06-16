// WMI-19F1A-Q20: form 2-digit numbers from the digits {1,2,3,4} with two
// DIFFERENT digits, list them in ascending order, and read off the 5th (= 23).
// The question needs no in-card figure (needsVisual: false); this figure powers
// the post-answer animation and is reused as an optional standalone illustration.
export const DIGITS = [1, 2, 3, 4] as const

// Numbers grouped by tens digit (each row already ascending in the ones place).
export const ROWS: number[][] = DIGITS.map((tens) =>
  DIGITS.filter((ones) => ones !== tens).map((ones) => tens * 10 + ones),
)

// The full list, smallest-first (tens-major, ones ascending → already sorted).
export const SORTED: number[] = ROWS.flat()
export const TARGET_INDEX = 4 // the 5th number (0-based)
export const ANSWER = SORTED[TARGET_INDEX] // 23

const COLS = 3
const VW = 240
const PAD = 14
const CHIP_W = 28
const CHIP_H = 26
const CHIP_GAP = 10
const CARD_W = 52
const CARD_H = 36
const CARD_GX = 8
const CARD_GY = 8
const GRID_W = COLS * CARD_W + (COLS - 1) * CARD_GX
const GRID_X0 = (VW - GRID_W) / 2
const GRID_Y0 = PAD + CHIP_H + 18
const VH = GRID_Y0 + ROWS.length * CARD_H + (ROWS.length - 1) * CARD_GY + PAD

const CHIPS_W = DIGITS.length * CHIP_W + (DIGITS.length - 1) * CHIP_GAP
const CHIP_X0 = (VW - CHIPS_W) / 2

export interface DigitArrangeFigureProps {
  /** How many tens-digit rows are revealed (0..4). */
  revealedRows?: number
  /** Highest list index counted so far (0-based), or null before counting. */
  countIndex?: number | null
  /** Final beat — light up the 5th number as the answer. */
  result?: boolean
}

export function DigitArrangeFigure({
  revealedRows = ROWS.length,
  countIndex = null,
  result = false,
}: DigitArrangeFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* The four source digits */}
      {DIGITS.map((d, i) => {
        const x = CHIP_X0 + i * (CHIP_W + CHIP_GAP)
        return (
          <g key={`chip-${d}`}>
            <rect x={x} y={PAD} width={CHIP_W} height={CHIP_H} rx={7} fill="#EEF2FF" stroke="#6366F1" strokeWidth={1.5} />
            <text x={x + CHIP_W / 2} y={PAD + CHIP_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill="#3730A3">
              {d}
            </text>
          </g>
        )
      })}

      {/* The 2-digit numbers, one row per tens digit, ascending */}
      {SORTED.map((n, i) => {
        const r = Math.floor(i / COLS)
        const c = i % COLS
        const x = GRID_X0 + c * (CARD_W + CARD_GX)
        const y = GRID_Y0 + r * (CARD_H + CARD_GY)
        const revealed = r < revealedRows
        const counted = countIndex != null && i <= countIndex
        const current = countIndex != null && i === countIndex
        const showTarget = result && i === TARGET_INDEX

        let fill = '#FFFFFF'
        let stroke = '#94A3B8'
        let strokeW = 1.5
        let textFill = '#1F2937'
        if (!revealed) {
          fill = '#F1F5F9'
          stroke = '#CBD5E1'
          textFill = '#CBD5E1'
        } else if (showTarget) {
          fill = '#D1FAE5'
          stroke = '#10B981'
          strokeW = 3
          textFill = '#065F46'
        } else if (current) {
          fill = '#DBEAFE'
          stroke = '#2563EB'
          strokeW = 3
          textFill = '#1E3A8A'
        } else if (counted) {
          fill = '#EFF6FF'
          stroke = '#3B82F6'
          textFill = '#1E40AF'
        }

        const badge = counted || showTarget
        const badgeColor = showTarget ? '#10B981' : '#2563EB'

        return (
          <g key={`card-${n}`}>
            <rect
              x={x}
              y={y}
              width={CARD_W}
              height={CARD_H}
              rx={8}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeW}
              strokeDasharray={revealed ? undefined : '4 3'}
            />
            {revealed && (
              <text x={x + CARD_W / 2} y={y + CARD_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={textFill}>
                {n}
              </text>
            )}
            {badge && (
              <>
                <circle cx={x + 11} cy={y + 10} r={8} fill={badgeColor} />
                <text x={x + 11} y={y + 10} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800} fill="#FFFFFF">
                  {i + 1}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function DigitArrangeIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Two-digit numbers built from 1, 2, 3 and 4 listed in ascending order; the 5th number is ${ANSWER}.`}
    >
      <DigitArrangeFigure />
    </div>
  )
}
