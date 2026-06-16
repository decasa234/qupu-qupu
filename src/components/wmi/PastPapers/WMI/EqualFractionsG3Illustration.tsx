// Stacked-fraction equation for WMI-19F3A-Q7, drawn as in the paper:
//   3   ◻   15   60
//   - = -- = -- = --
//   4   32   ◯   80
// All four fractions equal 3/4; ◻ = 24 and ◯ = 20, so ◻ + ◯ = 44.

export const SQUARE_VALUE = 24
export const CIRCLE_VALUE = 20
export const EF_ANSWER = SQUARE_VALUE + CIRCLE_VALUE // 44

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#2563EB'
const GRAY = '#9CA3AF'

export const EF_VIEW_W = 380
export const EF_VIEW_H = 120
// The ×8/×5 scale arc curves above the fraction row; give the viewBox top
// headroom so the arrow and its label are never clipped (overflow-hidden box).
const EF_PAD_TOP = 18
const ROW_CY = 58
const FRAC_X = [60, 150, 240, 330] // centres of the four fractions
const EQ_X = [105, 195, 285]
const BAR_W = 36

function Frac({
  cx,
  num,
  den,
  numUnknown = false,
  denUnknown = false,
  revealedNum,
  revealedDen,
  focus = false,
}: {
  cx: number
  num: string
  den: string
  numUnknown?: boolean
  denUnknown?: boolean
  revealedNum?: number | null
  revealedDen?: number | null
  focus?: boolean
}) {
  const numText = numUnknown && revealedNum != null ? String(revealedNum) : num
  const denText = denUnknown && revealedDen != null ? String(revealedDen) : den
  const numSolved = numUnknown && revealedNum != null
  const denSolved = denUnknown && revealedDen != null
  return (
    <g>
      {focus && (
        <rect x={cx - 26} y={ROW_CY - 44} width={52} height={88} rx={10} fill="rgba(245,158,11,0.10)" stroke="#D97706" strokeWidth={2} strokeDasharray="6 4" />
      )}
      <text x={cx} y={ROW_CY - 18} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={numSolved ? GREEN : numUnknown ? GRAY : INK} className="font-display">
        {numText}
      </text>
      <line x1={cx - BAR_W / 2} y1={ROW_CY} x2={cx + BAR_W / 2} y2={ROW_CY} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <text x={cx} y={ROW_CY + 20} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={denSolved ? GREEN : denUnknown ? GRAY : INK} className="font-display">
        {denText}
      </text>
    </g>
  )
}

export interface EqualFractionsFigureProps {
  /** Revealed value of ◻ (top of the 2nd fraction), or null. */
  square?: number | null
  /** Revealed value of ◯ (bottom of the 3rd fraction), or null. */
  circle?: number | null
  /** Which fraction is being reasoned about. */
  focus?: 'square' | 'circle' | null
  /** Scale arrows + label from the 3/4 fraction to the focused one (e.g. "×8"). */
  scaleLabel?: string | null
}

export function EqualFractionsFigure({ square = null, circle = null, focus = null, scaleLabel = null }: EqualFractionsFigureProps) {
  const targetX = focus === 'square' ? FRAC_X[1] : FRAC_X[2]
  return (
    <svg viewBox={`0 ${-EF_PAD_TOP} ${EF_VIEW_W} ${EF_VIEW_H + EF_PAD_TOP}`} width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <Frac cx={FRAC_X[0]} num="3" den="4" />
      <Frac cx={FRAC_X[1]} num="◻" den="32" numUnknown revealedNum={square} focus={focus === 'square'} />
      <Frac cx={FRAC_X[2]} num="15" den="◯" denUnknown revealedDen={circle} focus={focus === 'circle'} />
      <Frac cx={FRAC_X[3]} num="60" den="80" />
      {EQ_X.map((x) => (
        <text key={x} x={x} y={ROW_CY} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
          =
        </text>
      ))}

      {/* scale arrow from 3/4 to the focused fraction */}
      {focus && scaleLabel && (
        <g>
          <path d={`M ${FRAC_X[0] + 16} ${ROW_CY - 40} Q ${(FRAC_X[0] + targetX) / 2} ${ROW_CY - 60} ${targetX - 16} ${ROW_CY - 40}`} fill="none" stroke={BLUE} strokeWidth={2} />
          <polygon points={`${targetX - 12},${ROW_CY - 38} ${targetX - 22},${ROW_CY - 40} ${targetX - 17},${ROW_CY - 31}`} fill={BLUE} />
          <text x={(FRAC_X[0] + targetX) / 2} y={ROW_CY - 56} textAnchor="middle" fontSize={14} fontWeight={900} fill={BLUE} className="font-display">
            {scaleLabel}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function EqualFractionsG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four equal fractions written vertically: 3 over 4 = square over 32 = 15 over circle = 60 over 80. Find square plus circle."
    >
      <EqualFractionsFigure />
    </div>
  )
}
