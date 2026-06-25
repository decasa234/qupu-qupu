// HKIMO-24-P1H-Q10 — column addition  B A + A B = 1 2 1
//
// Stem figure: vertical addition layout
//      B  A
//   +  A  B
//   -------
//    1  2  1
//
// B and A are 1-digit variables; B−A=1; find B.
// No primitive matches column-arithmetic → fresh SVG.
// SSR-safe: no hooks, no framer-motion.

const INK = '#1F2937'
const B_FILL = '#FDE68A'   // amber  — variable B
const A_FILL = '#BFDBFE'   // blue   — variable A
const RES_FILL = '#D1FAE5' // green  — result row
const STROKE = '#6B7280'

const W = 240
const H = 178

// column centres (units / tens / hundreds)
const UCX = 180   // units
const TCX = 128   // tens
const HCX = 76    // hundreds (result only)

const CW = 40     // cell width
const CH = 36     // cell height
const CRX = 7     // cell border-radius

const R1Y = 18    // row-1 top (B A)
const R2Y = 68    // row-2 top (A B)
const RULE_Y = 116
const R3Y = 128   // result row top

interface CellProps {
  cx: number
  ry: number
  label: string
  fill: string
  highlight?: boolean
}

function Cell({ cx, ry, label, fill, highlight = false }: CellProps) {
  return (
    <g>
      <rect
        x={cx - CW / 2}
        y={ry}
        width={CW}
        height={CH}
        rx={CRX}
        fill={fill}
        stroke={highlight ? '#10B981' : STROKE}
        strokeWidth={highlight ? 2.5 : 1.5}
      />
      <text
        x={cx}
        y={ry + CH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontStyle="italic"
        fontWeight={700}
        fill={INK}
      >
        {label}
      </text>
    </g>
  )
}

interface ResultCellProps {
  cx: number
  label: string
  highlight?: boolean
}

function ResultCell({ cx, label, highlight = false }: ResultCellProps) {
  return (
    <g>
      <rect
        x={cx - CW / 2}
        y={R3Y}
        width={CW}
        height={CH}
        rx={CRX}
        fill={highlight ? '#A7F3D0' : RES_FILL}
        stroke={highlight ? '#059669' : '#34D399'}
        strokeWidth={highlight ? 2.5 : 1.5}
      />
      <text
        x={cx}
        y={R3Y + CH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={800}
        fill="#065F46"
      >
        {label}
      </text>
    </g>
  )
}

export interface ColumnAddDiagramProps {
  /** Show solved values A=5, B=6 inside the cells */
  showAnswer?: boolean
  /** Highlight the sum-row to emphasise 11(A+B)=121 */
  highlightSum?: boolean
}

export function ColumnAddDiagram({
  showAnswer = false,
  highlightSum = false,
}: ColumnAddDiagramProps) {
  const bLabel = showAnswer ? '6' : 'B'
  const aLabel = showAnswer ? '5' : 'A'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Row 1: B A */}
      <Cell cx={TCX} ry={R1Y} label={bLabel} fill={B_FILL} />
      <Cell cx={UCX} ry={R1Y} label={aLabel} fill={A_FILL} />

      {/* Plus sign */}
      <text
        x={28}
        y={R2Y + CH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={700}
        fill={STROKE}
      >
        +
      </text>

      {/* Row 2: A B */}
      <Cell cx={TCX} ry={R2Y} label={aLabel} fill={A_FILL} />
      <Cell cx={UCX} ry={R2Y} label={bLabel} fill={B_FILL} />

      {/* Horizontal rule */}
      <line
        x1={12}
        y1={RULE_Y}
        x2={W - 12}
        y2={RULE_Y}
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* Result: 1 2 1 */}
      <ResultCell cx={HCX} label="1" highlight={highlightSum} />
      <ResultCell cx={TCX} label="2" highlight={highlightSum} />
      <ResultCell cx={UCX} label="1" highlight={highlightSum} />
    </svg>
  )
}

export default function ColumnAddHK24P1Q10Illustration() {
  return <ColumnAddDiagram />
}
