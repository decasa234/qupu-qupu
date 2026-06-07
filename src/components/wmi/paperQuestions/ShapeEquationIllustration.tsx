// Shape-equation puzzle for WMI-19F1-Q18.
//
// Recovered from db/seed/wmi/figures/2019-final-g1-a-q18.jpg (asked expression
// △ + ☆ = ?) plus the alt-text in
// "wmiPastPaper/2019 WMI Final G01 Paper B/full.md" line 27, which gives the
// three equation totals 18, 14, 20. The dropped glyphs are recovered as the
// only assignment consistent with the asked △ + ☆ = 13:
//   ○ + ○ + ○ = 18  ⇒ ○ = 6
//   △ + ○     = 14  ⇒ △ = 8
//   ☆ + ☆ + ☆ + ☆ = 20 ⇒ ☆ = 5
//   asked: △ + ☆ = 8 + 5 = 13
export type ShapeKind = 'circle' | 'triangle' | 'star'

export const CIRCLE_VALUE = 6 // ○+○+○ = 18
export const STAR_VALUE = 5 // ☆×4 = 20
export const TRIANGLE_VALUE = 14 - CIRCLE_VALUE // △+○ = 14 ⇒ △ = 8
export const ANSWER = TRIANGLE_VALUE + STAR_VALUE // △+☆ = 13

export interface ShapeEquation {
  shapes: ShapeKind[]
  total: number
}

// The three given equations, in figure order.
export const EQUATIONS: ShapeEquation[] = [
  { shapes: ['circle', 'circle', 'circle'], total: 18 },
  { shapes: ['triangle', 'circle'], total: 14 },
  { shapes: ['star', 'star', 'star', 'star'], total: 20 },
]

export const SHAPE_VALUE: Record<ShapeKind, number> = {
  circle: CIRCLE_VALUE,
  triangle: TRIANGLE_VALUE,
  star: STAR_VALUE,
}

const SHAPE_COLOR: Record<ShapeKind, string> = {
  circle: '#2f6df0',
  triangle: '#10B981',
  star: '#F59E0B',
}

const SHAPE_NAME_EN: Record<ShapeKind, string> = {
  circle: 'circle',
  triangle: 'triangle',
  star: 'star',
}
const SHAPE_NAME_ID: Record<ShapeKind, string> = {
  circle: 'lingkaran',
  triangle: 'segitiga',
  star: 'bintang',
}

export function shapeName(kind: ShapeKind, lang: 'en' | 'id'): string {
  return lang === 'id' ? SHAPE_NAME_ID[kind] : SHAPE_NAME_EN[kind]
}

export const SHAPE_R = 16
const GLYPH_STROKE = '#1F2937'

/** A single outlined shape glyph, centred at (cx, cy). */
export function ShapeGlyph({
  kind,
  cx,
  cy,
  filled = false,
  dim = false,
}: {
  kind: ShapeKind
  cx: number
  cy: number
  filled?: boolean
  dim?: boolean
}) {
  const r = SHAPE_R
  const color = SHAPE_COLOR[kind]
  const fill = filled ? color : '#FFFFFF'
  const stroke = filled ? color : GLYPH_STROKE
  const opacity = dim ? 0.3 : 1

  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} opacity={opacity} />
  }
  if (kind === 'triangle') {
    const pts = `${cx},${cy - r} ${cx - r * 0.95},${cy + r * 0.8} ${cx + r * 0.95},${cy + r * 0.8}`
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" opacity={opacity} />
  }
  // star
  const inner = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" opacity={opacity} />
}

export const EQ_VIEW_W = 360
export const EQ_VIEW_H = 230

const ROW_Y = [44, 100, 156] // y-centre of the three equation rows
const ASKED_Y = 208

const GLYPH_GAP = 44
const LEFT_PAD = 26

/** x-positions for a row's glyphs, the '+' separators, the '=', and the total. */
export function layoutRow(shapes: ShapeKind[]) {
  const glyphX = shapes.map((_, i) => LEFT_PAD + SHAPE_R + i * GLYPH_GAP)
  const plusX = glyphX.slice(0, -1).map((x) => x + GLYPH_GAP / 2)
  const eqX = LEFT_PAD + SHAPE_R + shapes.length * GLYPH_GAP - 6
  const totalX = eqX + 34
  return { glyphX, plusX, eqX, totalX }
}

interface RowOptions {
  /** When true, draw the right-hand total; otherwise leave it blank/`?`. */
  showTotal?: boolean
  /** Dim the whole row. */
  dim?: boolean
  /** Highlight (solid-fill) the glyphs. */
  filled?: boolean
}

export function EquationRow({ eq, y, showTotal = true, dim = false, filled = false }: { eq: ShapeEquation; y: number } & RowOptions) {
  const { glyphX, plusX, eqX, totalX } = layoutRow(eq.shapes)
  return (
    <g opacity={dim ? 0.35 : 1}>
      {eq.shapes.map((kind, i) => (
        <ShapeGlyph key={i} kind={kind} cx={glyphX[i]} cy={y} filled={filled} />
      ))}
      {plusX.map((x, i) => (
        <text key={`p${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={GLYPH_STROKE}>
          +
        </text>
      ))}
      <text x={eqX} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={GLYPH_STROKE}>
        =
      </text>
      <text x={totalX} y={y} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={showTotal ? '#2f6df0' : '#94A3B8'}>
        {showTotal ? String(eq.total) : '?'}
      </text>
    </g>
  )
}

export interface ShapeEquationDiagramProps {
  /** Reveal the asked-row answer (△ + ☆ = 13). */
  revealAnswer?: boolean
  /** Which given equation row (0..2) to emphasise; others dim. null = all neutral. */
  highlightRow?: number | null
  /** Shapes whose value has been solved — shown as a legend of "shape = n" badges. */
  solved?: ShapeKind[]
}

export function ShapeEquationDiagram({ revealAnswer = false, highlightRow = null, solved = [] }: ShapeEquationDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${EQ_VIEW_W} ${EQ_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {EQUATIONS.map((eq, i) => (
        <EquationRow
          key={i}
          eq={eq}
          y={ROW_Y[i]}
          dim={highlightRow !== null && highlightRow !== i}
          filled={highlightRow === i}
        />
      ))}

      {/* divider above the asked row */}
      <line x1={LEFT_PAD - 6} y1={ASKED_Y - 24} x2={EQ_VIEW_W - 20} y2={ASKED_Y - 24} stroke="#CBD5E1" strokeWidth={1.5} />

      {/* asked: △ + ☆ = ? (or 13) */}
      <AskedRow y={ASKED_Y} reveal={revealAnswer} />

      {/* solved-value legend, right column */}
      {solved.map((kind, i) => (
        <SolvedBadge key={kind} kind={kind} x={EQ_VIEW_W - 78} y={36 + i * 40} />
      ))}
    </svg>
  )
}

function SolvedBadge({ kind, x, y }: { kind: ShapeKind; x: number; y: number }) {
  return (
    <g>
      <ShapeGlyph kind={kind} cx={x} cy={y} filled />
      <text x={x + 16} y={y} dominantBaseline="central" fontSize={18} fontWeight={900} fill="#1F2937">
        {`= ${SHAPE_VALUE[kind]}`}
      </text>
    </g>
  )
}

export function AskedRow({ y, reveal = false }: { y: number; reveal?: boolean }) {
  const asked: ShapeKind[] = ['triangle', 'star']
  const { glyphX, plusX, eqX, totalX } = layoutRow(asked)
  return (
    <g>
      {asked.map((kind, i) => (
        <ShapeGlyph key={i} kind={kind} cx={glyphX[i]} cy={y} />
      ))}
      {plusX.map((x, i) => (
        <text key={`p${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={GLYPH_STROKE}>
          +
        </text>
      ))}
      <text x={eqX} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={GLYPH_STROKE}>
        =
      </text>
      <text
        x={totalX}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={24}
        fontWeight={900}
        fill={reveal ? '#10B981' : '#94A3B8'}
      >
        {reveal ? String(ANSWER) : '?'}
      </text>
    </g>
  )
}

export default function ShapeEquationIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three shape equations: circle plus circle plus circle equals 18; triangle plus circle equals 14; star plus star plus star plus star equals 20. Find triangle plus star."
    >
      <ShapeEquationDiagram />
    </div>
  )
}
