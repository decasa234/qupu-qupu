// HKIMO-25-P3H-Q13 — Short multiplication AB × A = 96 ; find A − B.
// Figure (007.jpg): vertical short-multiplication layout showing A B × A = 9 6.
// Stem shows the PROBLEM only (never reveals A=3, B=2).
// No primitive matches a short-multiplication digit-grid → fresh SVG.
// Named export MultABDiagram accepts highlight props so the explainer can reuse it.

const INK = '#1F2937'
const A_FILL = '#FDE68A'   // amber — marks the unknown "A"
const B_FILL = '#BFDBFE'   // blue  — marks the unknown "B"
const KNOWN_FILL = '#F3F4F6' // light grey — known digits (9, 6, ×)
const STROKE = '#9CA3AF'
const RX = 6

// grid constants
const CELL = 44
const COL1 = 42   // tens-place x-centre
const COL2 = 92   // units-place x-centre
const OPX  = 14   // × operator x-centre
const ROW1 = 30   // AB row  y-centre
const ROW2 = 82   // ×A row  y-centre
const LINE_Y = 108 // separator y
const ROW3 = 130  // 96 row  y-centre
const W = 140
const H = 160

interface DiagramProps {
  /** Show concrete values instead of letters (for explainer end-state). */
  showValues?: boolean
  /** Pulse colour override for A cells (beats). */
  aHighlight?: string
  /** Pulse colour override for B cell (beats). */
  bHighlight?: string
  /** Show a green check mark on the result row. */
  showCheck?: boolean
}

function Cell({
  cx, cy, label, fill, highlight,
}: { cx: number; cy: number; label: string; fill: string; highlight?: string }) {
  return (
    <>
      <rect
        x={cx - CELL / 2 + 2}
        y={cy - CELL / 2 + 2}
        width={CELL - 4}
        height={CELL - 4}
        rx={RX}
        fill={highlight ?? fill}
        stroke={STROKE}
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontFamily="'Inter', 'Helvetica Neue', sans-serif"
        fontWeight="800"
        fontSize={22}
        fill={INK}
      >
        {label}
      </text>
    </>
  )
}

export function MultABDiagram({
  showValues = false,
  aHighlight,
  bHighlight,
  showCheck = false,
}: DiagramProps) {
  const aLabel = showValues ? '3' : 'A'
  const bLabel = showValues ? '2' : 'B'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-hidden="true"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* Row 1: A B */}
      <Cell cx={COL1} cy={ROW1} label={aLabel} fill={A_FILL} highlight={aHighlight} />
      <Cell cx={COL2} cy={ROW1} label={bLabel} fill={B_FILL} highlight={bHighlight} />

      {/* Row 2: × A */}
      <text
        x={OPX + 6}
        y={ROW2 + 6}
        textAnchor="middle"
        fontFamily="'Inter', 'Helvetica Neue', sans-serif"
        fontWeight="700"
        fontSize={22}
        fill="#6B7280"
      >
        ×
      </text>
      {/* tens cell empty (part of the layout) */}
      <Cell cx={COL2} cy={ROW2} label={aLabel} fill={A_FILL} highlight={aHighlight} />

      {/* separator line */}
      <line x1={6} y1={LINE_Y} x2={W - 6} y2={LINE_Y} stroke={STROKE} strokeWidth={2} />

      {/* Row 3: 9 6 */}
      <Cell cx={COL1} cy={ROW3} label="9" fill={KNOWN_FILL} />
      <Cell cx={COL2} cy={ROW3} label="6" fill={KNOWN_FILL} />

      {/* check mark overlay when showCheck */}
      {showCheck && (
        <text
          x={W - 10}
          y={ROW3 + 8}
          textAnchor="end"
          fontSize={20}
          fill="#10B981"
          fontWeight="900"
        >
          ✓
        </text>
      )}
    </svg>
  )
}

export default function MultABHK25P3Q13Illustration() {
  return (
    <div
      className="mx-auto flex w-full max-w-[240px] items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
      role="img"
      aria-label="Multiplication: A B times A equals 9 6. Find A minus B."
    >
      <MultABDiagram />
    </div>
  )
}
