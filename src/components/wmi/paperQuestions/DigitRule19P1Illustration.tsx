// Digit-rule figure for WMI-19P1A-Q18.
//
// Source figure: db/seed/wmi/figures/2019-semifinal-g1-a-q18.jpg —
// a warning triangle (⚠) next to three underlined 2-digit examples, each
// marked with a tick or cross showing whether it is VALID under the rule:
//   78  ✓      (valid)
//   70  ✓      (valid)
//   07  ✗      (NOT valid — leading zero)
// The rule (read from the examples): a value is a 2-digit number with NO
// leading zero. The static figure shows ONLY the rule — never the answer.

export const RULE_EXAMPLES: Array<{ text: string; valid: boolean }> = [
  { text: '78', valid: true },
  { text: '70', valid: true },
  { text: '07', valid: false },
]

/** The digit set the question draws from (the box marked ?). */
export const DIGITS = [5, 2, 0] as const

const INK = '#1F2937'
const TICK = '#16A34A'
const CROSS = '#DC2626'
const BOX_BG = '#FFFFFF'
const BOX_BORDER = '#94A3B8'

/** A single underlined example with a tick/cross mark above it. */
export function ExampleCard({
  x,
  y,
  text,
  valid,
  showMark = true,
}: {
  x: number
  y: number
  text: string
  valid: boolean
  showMark?: boolean
}) {
  const w = 76
  const h = 64
  const cx = x + w / 2
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={BOX_BG}
        stroke={BOX_BORDER}
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      {/* tick / cross mark above the number */}
      {showMark &&
        (valid ? (
          <path
            d={`M ${cx - 10} ${y + 20} l 6 7 l 12 -15`}
            fill="none"
            stroke={TICK}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <g stroke={CROSS} strokeWidth={3.5} strokeLinecap="round">
            <line x1={cx - 9} y1={y + 12} x2={cx + 9} y2={y + 26} />
            <line x1={cx + 9} y1={y + 12} x2={cx - 9} y2={y + 26} />
          </g>
        ))}
      {/* the 2-digit number */}
      <text
        x={cx}
        y={y + 44}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={800}
        fill={INK}
        fontFamily="monospace"
      >
        {text}
      </text>
      {/* underline */}
      <line x1={cx - 22} y1={y + 56} x2={cx + 22} y2={y + 56} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

/** The warning triangle (basic glyph, drawn as a path so it is deterministic). */
function WarningTriangle({ x, y }: { x: number; y: number }) {
  const s = 40
  return (
    <g>
      <path
        d={`M ${x + s / 2} ${y} L ${x + s} ${y + s} L ${x} ${y + s} Z`}
        fill="none"
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <line x1={x + s / 2} y1={y + 13} x2={x + s / 2} y2={y + 28} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={x + s / 2} cy={y + 34} r={1.8} fill={INK} />
    </g>
  )
}

export const DIGITRULE_VIEW_W = 380
export const DIGITRULE_VIEW_H = 132

export interface DigitRuleDiagramProps {
  /** When false, the example tick/cross marks are hidden (rule-reveal beat). */
  showMarks?: boolean
  /** Show the digit set {5, 2, 0} beneath the examples. */
  showDigits?: boolean
}

export function DigitRuleDiagram({ showMarks = true, showDigits = true }: DigitRuleDiagramProps) {
  const firstX = 64
  const gap = 96
  const rowY = 16
  return (
    <svg
      viewBox={`0 0 ${DIGITRULE_VIEW_W} ${DIGITRULE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <WarningTriangle x={12} y={rowY + 12} />
      {RULE_EXAMPLES.map((ex, i) => (
        <ExampleCard key={ex.text} x={firstX + i * gap} y={rowY} text={ex.text} valid={ex.valid} showMark={showMarks} />
      ))}

      {showDigits && (
        <g>
          <text x={26} y={108} textAnchor="start" dominantBaseline="central" fontSize={14} fontWeight={700} fill={INK}>
            digits:
          </text>
          {DIGITS.map((d, i) => (
            <g key={d}>
              <rect x={92 + i * 46} y={94} width={36} height={28} rx={5} fill="#EEF2FF" stroke="#6366F1" strokeWidth={2} />
              <text
                x={92 + i * 46 + 18}
                y={108}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight={800}
                fill="#3730A3"
              >
                {d}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}

export default function DigitRule19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A rule shown by three examples: 78 is valid, 70 is valid, 07 is not valid. Below them the digit set 5, 2, 0."
    >
      <DigitRuleDiagram />
    </div>
  )
}
