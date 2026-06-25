// HKIMO-23-P3SF-Q1 — "According to the pattern shown below, what is the number in the blank?"
// Three diamond shapes with top/left/right/bottom labels; rule: top×bottom = left×right.
// Diamond 3 has "?" for left. Answer: 30.
// No primitive matches diamond-with-labeled-vertices → fresh SVG. SSR-safe (no hooks).

const INK = '#1F2937'
const STROKE_DEFAULT = '#6B7280'
const STROKE_HI = '#2563EB'
const FILL_DEFAULT = '#EFF6FF'
const FILL_HI = '#DBEAFE'
const Q_COLOR = '#B45309'   // amber for the blank "?"

const VW = 380
const VH = 150
const CY = VH / 2
const CENTERS = [68, 190, 312] as const
const HW = 40   // half-width
const HH = 38   // half-height
const FS = 13   // label font-size

interface DiamondShapeProps {
  cx: number; cy: number
  top: string; left: string; right: string; bottom: string
  highlighted: boolean
  leftColor?: string
}

function DiamondShape({ cx, cy, top, left, right, bottom, highlighted, leftColor = INK }: DiamondShapeProps) {
  const pts = `${cx},${cy - HH} ${cx + HW},${cy} ${cx},${cy + HH} ${cx - HW},${cy}`
  return (
    <g>
      <polygon
        points={pts}
        fill={highlighted ? FILL_HI : FILL_DEFAULT}
        stroke={highlighted ? STROKE_HI : STROKE_DEFAULT}
        strokeWidth={highlighted ? 2 : 1.5}
      />
      {/* top */}
      <text x={cx} y={cy - HH - 8} textAnchor="middle" fill={INK} fontSize={FS} fontFamily="sans-serif">
        {top}
      </text>
      {/* left */}
      <text x={cx - HW - 10} y={cy + 5} textAnchor="end" fill={leftColor} fontSize={FS} fontWeight={leftColor !== INK ? 'bold' : 'normal'} fontFamily="sans-serif">
        {left}
      </text>
      {/* right */}
      <text x={cx + HW + 10} y={cy + 5} textAnchor="start" fill={INK} fontSize={FS} fontFamily="sans-serif">
        {right}
      </text>
      {/* bottom */}
      <text x={cx} y={cy + HH + 18} textAnchor="middle" fill={INK} fontSize={FS} fontFamily="sans-serif">
        {bottom}
      </text>
    </g>
  )
}

export interface DiamondPanelProps {
  /** Index of the diamond to highlight (0/1/2); -1 = none */
  highlightIndex?: number
  /** Replace "?" with the answer "30" */
  showAnswer?: boolean
}

export function DiamondPanelDiagram({ highlightIndex = -1, showAnswer = false }: DiamondPanelProps) {
  const data = [
    { top: '9',  left: '12', right: '3',  bottom: '4' },
    { top: '63', left: '27', right: '7',  bottom: '3' },
    { top: '40', left: showAnswer ? '30' : '?', right: '12', bottom: '9' },
  ] as const

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-hidden="true" style={{ display: 'block', maxWidth: VW }}>
      {data.map((d, i) => (
        <DiamondShape
          key={i}
          cx={CENTERS[i]}
          cy={CY}
          top={d.top}
          left={d.left}
          right={d.right}
          bottom={d.bottom}
          highlighted={highlightIndex === i}
          leftColor={i === 2 && !showAnswer ? Q_COLOR : INK}
        />
      ))}
    </svg>
  )
}

export default function DiamondPatternHK23P3SFQ1Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[400px]"
      role="img"
      aria-label="Three diamond shapes. Each has four numbers at top, left, right, bottom. Diamond 3 has a blank at left."
    >
      <DiamondPanelDiagram />
    </div>
  )
}
