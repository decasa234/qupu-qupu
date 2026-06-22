// Column addition figure for SEAMO-16-A-Q9:
// "Find the sum of 2 + 22 + 222 + 2222 + 22222."
//
// Shows the five addends right-aligned in a column-addition layout with a
// horizontal rule and the answer concealed as "?????". Faithful to the
// arithmetic: each number is made of only the digit 2, lengths 1–5. The
// answer 24 690 is hidden (shown by the explainer beat-by-beat).
//
// Fresh SVG — no primitive covers column addition; the decorative calculator
// in 2016.imgs/006.jpg is not a math figure.
// SSR-safe: no hooks, no framer-motion.

export const TERMS = [2, 22, 222, 2222, 22222] as const
export const ANSWER = 24690 // 2 + 22 + 222 + 2222 + 22222
export const TERM_STRS = TERMS.map((n) => n.toLocaleString('en-US').replace(/,/g, ' '))
export const ANSWER_STR = '24 690'

// Layout
const COL_W = 320
const ROW_H = 38
const FONT_SIZE = 26
const NUM_FONT_SIZE = 28
const RIGHT_X = COL_W - 14 // right-align anchor
const INK = '#1F2937'
const BLUE = '#30598A'
const GREEN = '#065F46'
const RULE_Y_OFFSET = 8 // gap between last term and rule

export interface ColumnAddDiagramProps {
  /** How many terms to show lit (1–5). Remaining terms are dimmed. */
  revealedCount?: number
  /** Show the numeric answer instead of "?????". */
  showAnswer?: boolean
  /** Highlight a specific column (0 = units, 1 = tens, …) with a band. */
  highlightCol?: number | null
}

/**
 * Column-addition diagram for 2 + 22 + 222 + 2222 + 22222.
 * Emits a root <svg> (SSR-safe, no hooks).
 */
export function ColumnAddDiagram({
  revealedCount = 5,
  showAnswer = false,
  highlightCol = null,
}: ColumnAddDiagramProps) {
  const rowCount = TERMS.length
  const ruleY = ROW_H * rowCount + RULE_Y_OFFSET
  const answerY = ruleY + ROW_H + 4
  const viewH = answerY + ROW_H

  // Column-highlight band: each digit column is FONT_SIZE*0.65 wide, right-aligned
  const digitW = NUM_FONT_SIZE * 0.64
  const maxDigits = 5 // 22222 has 5 digits (plus space separator → 6 chars but 5 real digits)

  // We track digit positions by character index from the right:
  // column 0 = units (rightmost), column 4 = ten-thousands
  const bandX = highlightCol !== null ? RIGHT_X - (highlightCol + 1) * digitW - 4 : 0
  const bandW = digitW + 4

  return (
    <svg
      viewBox={`0 0 ${COL_W} ${viewH}`}
      width="100%"
      style={{ maxWidth: COL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* column highlight band */}
      {highlightCol !== null && (
        <rect
          x={bandX}
          y={4}
          width={bandW}
          height={ruleY - 4}
          rx={4}
          fill="#FEF9C3"
          stroke="#FCD34D"
          strokeWidth={1.5}
          opacity={0.85}
        />
      )}

      {/* "+" prefix on the last term row */}
      {TERMS.map((term, i) => {
        const isRevealed = i < revealedCount
        const y = ROW_H * i + ROW_H - 6
        const isLast = i === TERMS.length - 1
        return (
          <g key={i} opacity={isRevealed ? 1 : 0.22}>
            {isLast && (
              <text
                x={8}
                y={y}
                fontSize={NUM_FONT_SIZE}
                fontWeight={900}
                fontFamily="monospace"
                fill={BLUE}
                textAnchor="start"
                dominantBaseline="auto"
              >
                +
              </text>
            )}
            <text
              x={RIGHT_X}
              y={y}
              fontSize={NUM_FONT_SIZE}
              fontWeight={900}
              fontFamily="monospace"
              fill={isRevealed ? INK : '#9CA3AF'}
              textAnchor="end"
              dominantBaseline="auto"
            >
              {TERM_STRS[i]}
            </text>
          </g>
        )
      })}

      {/* horizontal rule */}
      <line x1={6} y1={ruleY} x2={RIGHT_X + 4} y2={ruleY} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />

      {/* answer row */}
      <text
        x={RIGHT_X}
        y={answerY + ROW_H - 8}
        fontSize={NUM_FONT_SIZE + 2}
        fontWeight={900}
        fontFamily="monospace"
        fill={showAnswer ? GREEN : '#9CA3AF'}
        textAnchor="end"
        dominantBaseline="auto"
      >
        {showAnswer ? ANSWER_STR : '?????'}
      </text>

      {/* "=" label left of answer */}
      {showAnswer && (
        <text
          x={8}
          y={answerY + ROW_H - 8}
          fontSize={FONT_SIZE}
          fontWeight={900}
          fontFamily="monospace"
          fill={GREEN}
          textAnchor="start"
          dominantBaseline="auto"
        >
          =
        </text>
      )}
    </svg>
  )
}

export default function ColumnAdd16A9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label="Column addition: 2 + 22 + 222 + 2 222 + 22 222 = ?????"
    >
      <ColumnAddDiagram revealedCount={5} showAnswer={false} />
    </div>
  )
}
