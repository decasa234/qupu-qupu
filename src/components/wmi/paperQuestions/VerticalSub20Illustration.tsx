// Worksheet figure for WMI-20F1A Q2: vertical subtraction 13 − 7 = ? (answer D = 6).
//
// Redrawn from the source scan
// "wmiPastPaper/2020 WMI Final G01 Paper A/images/2be95a0a...e047.jpg":
// right-aligned column subtraction — "13" on top, "− 7" below, a thick rule,
// then a pink rounded box holding a bold "?".
const INK = '#1F2937'
const PINK = '#F9D5D5'

const VIEW_W = 240
const VIEW_H = 220

// Right-align the digits on a shared column edge.
const DIGIT_RIGHT_X = 178
const TOP_Y = 48
const SUB_Y = 96
const RULE_Y = 126
const BOX_Y = 142

export default function VerticalSub20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Vertical subtraction: 13 minus 7 equals a pink box with a question mark."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* top row: 13 */}
        <text x={DIGIT_RIGHT_X} y={TOP_Y} textAnchor="end" dominantBaseline="central" fontSize={44} fontWeight={800} fill={INK}>
          13
        </text>

        {/* second row: − 7 (minus sign out to the left, digit right-aligned) */}
        <text x={72} y={SUB_Y} textAnchor="middle" dominantBaseline="central" fontSize={40} fontWeight={800} fill={INK}>
          −
        </text>
        <text x={DIGIT_RIGHT_X} y={SUB_Y} textAnchor="end" dominantBaseline="central" fontSize={44} fontWeight={800} fill={INK}>
          7
        </text>

        {/* thick horizontal rule */}
        <line x1={48} y1={RULE_Y} x2={196} y2={RULE_Y} stroke={INK} strokeWidth={5} strokeLinecap="round" />

        {/* pink answer box with ? */}
        <rect x={106} y={BOX_Y} width={76} height={52} rx={8} fill={PINK} />
        <text x={144} y={BOX_Y + 27} textAnchor="middle" dominantBaseline="central" fontSize={36} fontWeight={800} fill={INK}>
          ?
        </text>
      </svg>
    </div>
  )
}
