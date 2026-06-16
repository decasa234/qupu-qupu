// Row/column-sum shape grid for WMI-20F1A-Q19.
//
// Recovered from db/seed/wmi/figures/2020-final-g1-a-q19.jpg: a 3×3 grid of
// shapes with row sums on the right and column sums below.
//   row 1: ○ ○ ⬠ = 17
//   row 2: ⬠ ⬠ □ = 11
//   row 3: □ ⬠ □ = 7
//   columns: 12, 16, 7
// Canonical solution (matches breakdown.quantities in
// db/seed/wmi/papers/2020-final-g1.json): □ = 1, ⬠ = 5, ○ = 6 → □○ = 16.
export type GridShapeKind = 'circle' | 'pentagon' | 'square'

export const SQUARE_VALUE = 1
export const PENTAGON_VALUE = 5
export const CIRCLE_VALUE = 6
export const ANSWER = '16' // □ first (tens), then ○ (ones)

// The grid in figure order, top row first.
export const GRID: GridShapeKind[][] = [
  ['circle', 'circle', 'pentagon'],
  ['pentagon', 'pentagon', 'square'],
  ['square', 'pentagon', 'square'],
]

export const ROW_SUMS = [17, 11, 7]
export const COL_SUMS = [12, 16, 7]

const SHAPE_FILL: Record<GridShapeKind, string> = {
  circle: '#F9A8D4',
  pentagon: '#FBCF9C',
  square: '#93C5FD',
}
const SHAPE_STROKE: Record<GridShapeKind, string> = {
  circle: '#DB2777',
  pentagon: '#D97706',
  square: '#2563EB',
}

const INK = '#1F2937'
const SHAPE_R = 17

/** A single filled shape glyph, centred at (cx, cy). */
export function GridShapeGlyph({ kind, cx, cy }: { kind: GridShapeKind; cx: number; cy: number }) {
  const r = SHAPE_R
  const fill = SHAPE_FILL[kind]
  const stroke = SHAPE_STROKE[kind]
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} />
  }
  if (kind === 'square') {
    const s = r * 1.7
    return <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
  }
  // pentagon
  const pts: string[] = []
  for (let i = 0; i < 5; i++) {
    const rad = ((Math.PI * 2) / 5) * i - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
}

export const GRID_VIEW_W = 290
export const GRID_VIEW_H = 272

const CELL = 56
const GRID_X = 38 // left edge of the grid (leaves headroom; sums sit to the right/below)
const GRID_Y = 16

export interface SumGridDiagramProps {
  /** Which grid rows (0..2, top first) to tint; empty/omitted = none. */
  highlightRows?: number[]
  /** Which grid column (0..2, left first) to tint; null = none. */
  highlightCol?: number | null
  /** Show the deduced relation badge "⬠ = ◻ + 4" under the grid. */
  showRelation?: boolean
  /** Solved shape values — each solved shape shows its digit on a small white badge. */
  solved?: Partial<Record<GridShapeKind, number>>
  /** Reveal the asked number □○ = 16 under the grid. */
  showAnswer?: boolean
}

export function SumGridDiagram({
  highlightRows = [],
  highlightCol = null,
  showRelation = false,
  solved = {},
  showAnswer = false,
}: SumGridDiagramProps) {
  const gridW = CELL * 3
  const gridH = CELL * 3
  return (
    <svg
      viewBox={`0 0 ${GRID_VIEW_W} ${GRID_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* highlight tints behind the grid lines */}
      {highlightRows.map((r) => (
        <rect key={`hr${r}`} x={GRID_X} y={GRID_Y + r * CELL} width={gridW} height={CELL} fill="#FEF3C7" />
      ))}
      {highlightCol !== null && (
        <rect x={GRID_X + highlightCol * CELL} y={GRID_Y} width={CELL} height={gridH} fill="#FEF3C7" />
      )}

      {/* grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={GRID_X} y1={GRID_Y + i * CELL} x2={GRID_X + gridW} y2={GRID_Y + i * CELL} stroke={INK} strokeWidth={2} />
          <line x1={GRID_X + i * CELL} y1={GRID_Y} x2={GRID_X + i * CELL} y2={GRID_Y + gridH} stroke={INK} strokeWidth={2} />
        </g>
      ))}

      {/* shapes + solved badges */}
      {GRID.map((row, r) =>
        row.map((kind, c) => {
          const cx = GRID_X + c * CELL + CELL / 2
          const cy = GRID_Y + r * CELL + CELL / 2
          const value = solved[kind]
          return (
            <g key={`${r}-${c}`}>
              <GridShapeGlyph kind={kind} cx={cx} cy={cy} />
              {value !== undefined && (
                <g>
                  <circle cx={cx} cy={cy + (kind === 'pentagon' ? 2 : 0)} r={10} fill="#FFFFFF" stroke={SHAPE_STROKE[kind]} strokeWidth={1.5} />
                  <text
                    x={cx}
                    y={cy + (kind === 'pentagon' ? 2 : 0)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={900}
                    fill={INK}
                  >
                    {value}
                  </text>
                </g>
              )}
            </g>
          )
        }),
      )}

      {/* row sums, right column */}
      {ROW_SUMS.map((sum, r) => (
        <text
          key={`r${r}`}
          x={GRID_X + gridW + 28}
          y={GRID_Y + r * CELL + CELL / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight={900}
          fill={highlightRows.includes(r) ? '#B45309' : INK}
        >
          {sum}
        </text>
      ))}

      {/* column sums, below */}
      {COL_SUMS.map((sum, c) => (
        <text
          key={`c${c}`}
          x={GRID_X + c * CELL + CELL / 2}
          y={GRID_Y + gridH + 22}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight={900}
          fill={highlightCol === c ? '#B45309' : INK}
        >
          {sum}
        </text>
      ))}

      {/* deduced relation badge: pentagon is exactly 4 more than a square */}
      {showRelation && (
        <g>
          <rect
            x={GRID_X + gridW / 2 - 48}
            y={GRID_VIEW_H - 54}
            width={96}
            height={24}
            rx={12}
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth={1.5}
          />
          <text
            x={GRID_X + gridW / 2}
            y={GRID_VIEW_H - 42}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={900}
            fill="#B45309"
          >
            {'⬠ = ◻ + 4'}
          </text>
        </g>
      )}

      {/* asked number reveal */}
      <text
        x={GRID_X + gridW / 2}
        y={GRID_VIEW_H - 14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill={showAnswer ? '#10B981' : '#94A3B8'}
      >
        {showAnswer ? `□○ = ${ANSWER}` : '□○ = ?'}
      </text>
    </svg>
  )
}

export default function SumGrid20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 grid of shapes. Top row: circle, circle, pentagon, total 17. Middle row: pentagon, pentagon, square, total 11. Bottom row: square, pentagon, square, total 7. Column totals: 12, 16, 7. Find the two-digit number square-then-circle."
    >
      <SumGridDiagram />
    </div>
  )
}
