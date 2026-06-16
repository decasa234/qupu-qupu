import type { WmiChoice } from '../../../../types/wmi'

// Renders an answer option for the shape-count question (WMI-20F1A-Q14) as a
// mini two-row table, like the source paper's options: a pink-tinted header
// row of four shape glyphs (triangle, circle, square, rectangle) over a row of
// the four counts. The numbers are parsed from the choice text (e.g.
// "8, 9, 7, 6") so the rendering can never drift from the authored choice.

export type TallyShapeKind = 'triangle' | 'circle' | 'square' | 'rectangle'

export const TALLY_SHAPES: TallyShapeKind[] = ['triangle', 'circle', 'square', 'rectangle']

export const TALLY_SHAPE_COLOR: Record<TallyShapeKind, string> = {
  triangle: '#10B981',
  circle: '#2f6df0',
  square: '#F59E0B',
  rectangle: '#8B5CF6',
}

const GLYPH_STROKE = '#1F2937'

/** A single outlined shape glyph, centred at (cx, cy), sized to fit a table cell. */
export function TallyShapeGlyph({
  kind,
  cx,
  cy,
  stroke = GLYPH_STROKE,
  strokeWidth = 2,
}: {
  kind: TallyShapeKind
  cx: number
  cy: number
  stroke?: string
  strokeWidth?: number
}) {
  if (kind === 'triangle') {
    const r = 11
    const pts = `${cx},${cy - r} ${cx - r},${cy + r * 0.75} ${cx + r},${cy + r * 0.75}`
    return <polygon points={pts} fill="#FFFFFF" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
  }
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={10} fill="#FFFFFF" stroke={stroke} strokeWidth={strokeWidth} />
  }
  if (kind === 'square') {
    return <rect x={cx - 9} y={cy - 9} width={18} height={18} fill="#FFFFFF" stroke={stroke} strokeWidth={strokeWidth} />
  }
  // rectangle (wide)
  return <rect x={cx - 15} y={cy - 8} width={30} height={16} fill="#FFFFFF" stroke={stroke} strokeWidth={strokeWidth} />
}

const N = 4
const COL_W = 52
const ROW_H = 34
const W = N * COL_W + 4
const H = 2 * ROW_H + 4
const HEADER_TINT = '#FBE4E4'
const GRID = '#CBD5E1'

export default function ShapeTallyOption20({ choice }: { choice: WmiChoice }) {
  const nums = (choice.text.match(/\d+/g) ?? []).map(Number)
  // Fallback to plain text if the choice isn't the expected 4-number tally.
  if (nums.length !== N) return <span>{choice.text}</span>

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 220, display: 'block' }}
      role="img"
      aria-label={`Shape-count table — triangle, circle, square, rectangle: ${choice.text}`}
    >
      {/* header tint */}
      <rect x={2} y={2} width={W - 4} height={ROW_H} fill={HEADER_TINT} />

      {/* grid lines */}
      <rect x={2} y={2} width={W - 4} height={2 * ROW_H} fill="none" stroke={GRID} strokeWidth={1.5} />
      <line x1={2} y1={2 + ROW_H} x2={W - 2} y2={2 + ROW_H} stroke={GRID} strokeWidth={1.5} />
      {Array.from({ length: N - 1 }, (_, i) => {
        const x = 2 + (i + 1) * COL_W
        return <line key={i} x1={x} y1={2} x2={x} y2={2 + 2 * ROW_H} stroke={GRID} strokeWidth={1.5} />
      })}

      {/* header glyphs + count row */}
      {TALLY_SHAPES.map((kind, i) => {
        const cx = 2 + i * COL_W + COL_W / 2
        return (
          <g key={kind}>
            <TallyShapeGlyph kind={kind} cx={cx} cy={2 + ROW_H / 2} />
            <text
              x={cx}
              y={2 + ROW_H + ROW_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight={900}
              fill={GLYPH_STROKE}
            >
              {nums[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
