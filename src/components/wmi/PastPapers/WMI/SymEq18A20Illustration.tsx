// SymEq18A20Illustration — SEAMO 2018 Paper A, Q20
//
// "Find the value of the square."
//
// The figure (030.jpg) shows three symbol equations and one question row:
//   Circle  + Square = 162   (red circle, blue square)
//   Circle  + Star   = 146   (red circle, green star)
//   Square  + Star   = 150   (blue square, green star)
//   Square  =   ?
//
// Solution:
//   Add all three: 2(C + Sq + St) = 458  →  C + Sq + St = 229
//   Square = 229 − (Circle + Star) = 229 − 146 = 83  (answer C)
//
// Classification: stem — the three equations ARE the figure.
// No picture-options. SSR-safe (no hooks, no framer-motion).

export type SymKind = 'circle' | 'square' | 'star'

// Solved values for each symbol
export const CIRCLE_VALUE = 79   // 229 − 150
export const SQUARE_VALUE = 83   // 229 − 146   ← the answer
export const STAR_VALUE   = 67   // 229 − 162

export const SYMBOL_VALUE: Record<SymKind, number> = {
  circle: CIRCLE_VALUE,
  square: SQUARE_VALUE,
  star:   STAR_VALUE,
}

// Colours matching the original figure
const CIRCLE_FILL  = '#EF4444' // red
const SQUARE_FILL  = '#3B82F6' // blue
const STAR_FILL    = '#22C55E' // green
const INK          = '#1F2937'
const SYMBOL_FILL: Record<SymKind, string> = {
  circle: CIRCLE_FILL,
  square: SQUARE_FILL,
  star:   STAR_FILL,
}

const SYM_R = 18  // radius / half-size of glyphs

/** A single symbol glyph, centred at (cx, cy). Outlined (white) or filled. */
export function SymGlyph({
  kind,
  cx,
  cy,
  filled = false,
  dim = false,
}: {
  kind: SymKind
  cx: number
  cy: number
  filled?: boolean
  dim?: boolean
}) {
  const color = SYMBOL_FILL[kind]
  const fillColor = filled ? color : '#FFFFFF'
  const strokeColor = filled ? color : color  // always use the symbol's colour for stroke
  const opacity = dim ? 0.3 : 1

  if (kind === 'circle') {
    return (
      <circle
        cx={cx} cy={cy} r={SYM_R}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2.5}
        opacity={opacity}
      />
    )
  }

  if (kind === 'square') {
    const s = SYM_R * 1.55  // slightly larger so it looks balanced against circle
    return (
      <rect
        x={cx - s / 2} y={cy - s / 2}
        width={s} height={s}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2.5}
        opacity={opacity}
      />
    )
  }

  // 4-pointed compass star (as shown in the original scan)
  // Points at 0°, 90°, 180°, 270° with narrow inner radius
  const outer = SYM_R
  const inner = SYM_R * 0.38
  const pts: string[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`)
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={2}
      strokeLinejoin="round"
      opacity={opacity}
    />
  )
}

// Layout constants — 2 symbols per row keeps things compact
const VIEW_W = 340
const VIEW_H = 220
const ROW_Y  = [42, 98, 154]   // y-centres for the three given equations
const ASKED_Y = 200
const LEFT_PAD = 24
const GAP      = 72             // horizontal gap between symbol centres
const OP_SHIFT = GAP / 2        // '+' is halfway between symbols

/** One equation row: sym1 + sym2 = total (or ?) */
export function SymRow({
  left,
  right,
  total,
  showTotal = true,
  dim = false,
  filled = false,
}: {
  left: SymKind
  right: SymKind
  total: number
  showTotal?: boolean
  dim?: boolean
  filled?: boolean
}) {
  const x1 = LEFT_PAD + SYM_R
  const x2 = x1 + GAP
  const plusX = x1 + OP_SHIFT
  const eqX   = x2 + GAP / 2 + 4
  const totalX = eqX + 38

  return (
    <g opacity={dim ? 0.35 : 1}>
      <SymGlyph kind={left}  cx={x1} cy={0} filled={filled} />
      <text
        x={plusX} y={0}
        textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={800} fill={INK}
      >+</text>
      <SymGlyph kind={right} cx={x2} cy={0} filled={filled} />
      <text
        x={eqX} y={0}
        textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={800} fill={INK}
      >=</text>
      <text
        x={totalX} y={0}
        textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900}
        fill={showTotal ? '#2f6df0' : '#94A3B8'}
      >
        {showTotal ? String(total) : '?'}
      </text>
    </g>
  )
}

/** The asked row: □ = ? (or 83) */
export function AskedRowSq({ reveal = false }: { reveal?: boolean }) {
  const x1 = LEFT_PAD + SYM_R
  const eqX   = x1 + GAP / 2 + 4
  const totalX = eqX + 38
  return (
    <g>
      <SymGlyph kind="square" cx={x1} cy={0} />
      <text
        x={eqX} y={0}
        textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={800} fill={INK}
      >=</text>
      <text
        x={totalX} y={0}
        textAnchor="middle" dominantBaseline="central"
        fontSize={24} fontWeight={900}
        fill={reveal ? '#10B981' : '#94A3B8'}
      >
        {reveal ? '83' : '?'}
      </text>
    </g>
  )
}

// The three given equations
export const EQUATIONS: { left: SymKind; right: SymKind; total: number }[] = [
  { left: 'circle', right: 'square', total: 162 },
  { left: 'circle', right: 'star',   total: 146 },
  { left: 'square', right: 'star',   total: 150 },
]

export interface SymEq18A20DiagramProps {
  revealAnswer?: boolean
  highlightRow?: number | null
  solved?: SymKind[]
}

export function SymEq18A20Diagram({
  revealAnswer = false,
  highlightRow = null,
  solved = [],
}: SymEq18A20DiagramProps) {
  const badgeX = VIEW_W - 70

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Given equation rows */}
      {EQUATIONS.map((eq, i) => (
        <g key={i} transform={`translate(0, ${ROW_Y[i]})`}>
          <SymRow
            left={eq.left}
            right={eq.right}
            total={eq.total}
            dim={highlightRow !== null && highlightRow !== i}
            filled={highlightRow === i}
          />
        </g>
      ))}

      {/* Divider */}
      <line
        x1={LEFT_PAD - 6} y1={ASKED_Y - 22}
        x2={VIEW_W - 80}   y2={ASKED_Y - 22}
        stroke="#CBD5E1" strokeWidth={1.5}
      />

      {/* Asked row: □ = ? */}
      <g transform={`translate(0, ${ASKED_Y})`}>
        <AskedRowSq reveal={revealAnswer} />
      </g>

      {/* Solved-value legend (right column, shown when explainer reveals values) */}
      {solved.map((kind, i) => (
        <g key={kind}>
          <SymGlyph kind={kind} cx={badgeX} cy={30 + i * 38} filled />
          <text
            x={badgeX + 22} y={30 + i * 38}
            dominantBaseline="central"
            fontSize={16} fontWeight={900} fill={INK}
          >
            {`= ${SYMBOL_VALUE[kind]}`}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** Default export: the plain question-figure illustration (stem). */
export default function SymEq18A20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three symbol equations: red circle plus blue square equals 162; red circle plus green star equals 146; blue square plus green star equals 150. Find the value of the square."
    >
      <SymEq18A20Diagram />
    </div>
  )
}
