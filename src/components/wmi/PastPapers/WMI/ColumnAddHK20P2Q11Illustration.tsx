// HKIMO-20-P2H-Q11 — AB + AA = 1C4; A, B, C different digits; is C odd or even?
// Copy-adapted from ColumnAddHK24P1Q10Illustration.tsx (same geometry, different labels).
// SSR-safe: no hooks, no framer-motion.

const INK = '#1F2937'
const A_FILL = '#BFDBFE'     // blue  — variable A
const B_FILL = '#FDE68A'     // amber — variable B
const C_FILL = '#EDE9FE'     // violet — variable C (the unknown)
const FIXED_FILL = '#D1FAE5' // green — fixed result digits (1 and 4)
const STROKE = '#6B7280'
const HL_STROKE = '#10B981'

const W = 240
const H = 180

const UCX = 180  // units column centre
const TCX = 128  // tens column centre
const HCX = 76   // hundreds column centre (result only)

const CW = 40    // cell width
const CH = 36    // cell height
const CRX = 7    // border-radius

const R1Y = 18   // row-1 top: A B
const R2Y = 68   // row-2 top: + A A
const RULE_Y = 116
const R3Y = 128  // result row: 1 C 4

type ColHighlight = 'units' | 'tens' | 'none'

interface CellProps {
  cx: number
  ry: number
  label: string
  fill: string
  italic?: boolean
  highlight?: boolean
}

function Cell({ cx, ry, label, fill, italic = true, highlight = false }: CellProps) {
  return (
    <g>
      <rect
        x={cx - CW / 2}
        y={ry}
        width={CW}
        height={CH}
        rx={CRX}
        fill={fill}
        stroke={highlight ? HL_STROKE : STROKE}
        strokeWidth={highlight ? 2.5 : 1.5}
      />
      <text
        x={cx}
        y={ry + CH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontStyle={italic ? 'italic' : 'normal'}
        fontWeight={700}
        fill={INK}
      >
        {label}
      </text>
    </g>
  )
}

export interface ColumnAddHK20P2Q11DiagramProps {
  highlightCol?: ColHighlight
  showCarry?: boolean
}

export function ColumnAddHK20P2Q11Diagram({
  highlightCol = 'none',
  showCarry = false,
}: ColumnAddHK20P2Q11DiagramProps) {
  const uHL = highlightCol === 'units'
  const tHL = highlightCol === 'tens'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Row 1: A B */}
      <Cell cx={TCX} ry={R1Y} label="A" fill={A_FILL} highlight={tHL} />
      <Cell cx={UCX} ry={R1Y} label="B" fill={B_FILL} highlight={uHL} />

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

      {/* Row 2: A A */}
      <Cell cx={TCX} ry={R2Y} label="A" fill={A_FILL} highlight={tHL} />
      <Cell cx={UCX} ry={R2Y} label="A" fill={A_FILL} highlight={uHL} />

      {/* Carry annotation from units → tens */}
      {showCarry && (
        <text
          x={(UCX + TCX) / 2}
          y={RULE_Y - 6}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={11}
          fontWeight={700}
          fill="#EF4444"
        >
          carry +1 →
        </text>
      )}

      {/* Horizontal rule */}
      <line
        x1={12}
        y1={RULE_Y}
        x2={W - 12}
        y2={RULE_Y}
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* Result: 1 C 4 */}
      <Cell cx={HCX} ry={R3Y} label="1" fill={FIXED_FILL} italic={false} />
      <Cell cx={TCX} ry={R3Y} label="C" fill={C_FILL} highlight={tHL} />
      <Cell cx={UCX} ry={R3Y} label="4" fill={FIXED_FILL} italic={false} />
    </svg>
  )
}

export default function ColumnAddHK20P2Q11Illustration() {
  return <ColumnAddHK20P2Q11Diagram />
}
