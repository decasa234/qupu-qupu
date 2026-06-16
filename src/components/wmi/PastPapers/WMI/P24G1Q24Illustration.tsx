// Row/column-sum shape grid for WMI-24P1A-Q24 (2024 Semifinal Grade 1 Paper A).
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g1-a-q24.jpg: a 3×3 grid of
// shapes with each ROW sum to the right and each COLUMN sum below.
//   row 1: ★ △ ★ = 17
//   row 2: ○ ○ ○ = 18
//   row 3: ○ △ ★ = 19
//   columns: 16, 24, 14
// Solved deterministically (verified against every row & column):
//   ○ = 18 / 3 = 6,  △ = (24 − 6) / 2 = 9,  ★ = (17 − 9) / 2 = 4.
// Asked: the value of the star → 4 (choice C).
//
// Pure render, SSR-safe & deterministic: no params, no random, no state. The
// stem draws ONLY the shapes and the printed sums; it never reveals 4, 6 or 9.
// The explainer passes `solved` / `showAnswer` to bring the deduction alive.
export type Q24ShapeKind = 'star' | 'triangle' | 'circle'

export const CIRCLE_VALUE = 6
export const TRIANGLE_VALUE = 9
export const STAR_VALUE = 4
export const Q24_ANSWER_LETTER = 'C' // choices: A=6 B=3 C=4 D=7 E=2

// The grid in figure order, top row first.
export const Q24_GRID: Q24ShapeKind[][] = [
  ['star', 'triangle', 'star'],
  ['circle', 'circle', 'circle'],
  ['circle', 'triangle', 'star'],
]

export const Q24_ROW_SUMS = [17, 18, 19]
export const Q24_COL_SUMS = [16, 24, 14]

const SHAPE_FILL: Record<Q24ShapeKind, string> = {
  star: '#E11D48',
  triangle: '#A5DBF7',
  circle: '#FFCC00',
}
const SHAPE_STROKE: Record<Q24ShapeKind, string> = {
  star: '#3C342E',
  triangle: '#3C342E',
  circle: '#3C342E',
}

const INK = '#3C342E'
const SHAPE_R = 18

/** A single filled shape glyph centred at (cx, cy). Co-exported so the
 * explainer can draw the same shapes in its deduction chips. */
export function Q24ShapeGlyph({ kind, cx, cy }: { kind: Q24ShapeKind; cx: number; cy: number }) {
  const r = SHAPE_R
  const fill = SHAPE_FILL[kind]
  const stroke = SHAPE_STROKE[kind]
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} />
  }
  if (kind === 'triangle') {
    const h = r * 1.7
    const half = r * 1.0
    const pts = [
      `${cx},${(cy - h / 2).toFixed(2)}`,
      `${(cx - half).toFixed(2)},${(cy + h / 2).toFixed(2)}`,
      `${(cx + half).toFixed(2)},${(cy + h / 2).toFixed(2)}`,
    ]
    return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
  }
  // five-point star
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
}

export const Q24_VIEW_W = 300
export const Q24_VIEW_H = 286

const CELL = 60
const GRID_X = 24 // left edge of the grid (sums sit to the right / below)
const GRID_Y = 16

export interface Q24DiagramProps {
  /** Which grid rows (0..2, top first) to tint; empty/omitted = none. */
  highlightRows?: number[]
  /** Which grid column (0..2, left first) to tint; null = none. */
  highlightCol?: number | null
  /** Solved shape values — each solved shape shows its digit on a white badge. */
  solved?: Partial<Record<Q24ShapeKind, number>>
  /** Reveal "★ = 4" badge under the grid. */
  showAnswer?: boolean
}

export function Q24SumGridDiagram({
  highlightRows = [],
  highlightCol = null,
  solved = {},
  showAnswer = false,
}: Q24DiagramProps) {
  const gridW = CELL * 3
  const gridH = CELL * 3
  return (
    <svg
      viewBox={`0 0 ${Q24_VIEW_W} ${Q24_VIEW_H}`}
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
          <line x1={GRID_X} y1={GRID_Y + i * CELL} x2={GRID_X + gridW} y2={GRID_Y + i * CELL} stroke={INK} strokeWidth={2.5} />
          <line x1={GRID_X + i * CELL} y1={GRID_Y} x2={GRID_X + i * CELL} y2={GRID_Y + gridH} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}

      {/* shapes + solved badges */}
      {Q24_GRID.map((row, r) =>
        row.map((kind, c) => {
          const cx = GRID_X + c * CELL + CELL / 2
          const cy = GRID_Y + r * CELL + CELL / 2
          const value = solved[kind]
          return (
            <g key={`${r}-${c}`}>
              <Q24ShapeGlyph kind={kind} cx={cx} cy={cy} />
              {value !== undefined && (
                <g>
                  <circle cx={cx} cy={cy} r={11} fill="#FFFFFF" stroke={INK} strokeWidth={1.5} />
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={INK}>
                    {value}
                  </text>
                </g>
              )}
            </g>
          )
        }),
      )}

      {/* row sums, right column */}
      {Q24_ROW_SUMS.map((sum, r) => (
        <text
          key={`r${r}`}
          x={GRID_X + gridW + 24}
          y={GRID_Y + r * CELL + CELL / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill={highlightRows.includes(r) ? '#B45309' : INK}
        >
          {sum}
        </text>
      ))}

      {/* column sums, below */}
      {Q24_COL_SUMS.map((sum, c) => (
        <text
          key={`c${c}`}
          x={GRID_X + c * CELL + CELL / 2}
          y={GRID_Y + gridH + 24}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill={highlightCol === c ? '#B45309' : INK}
        >
          {sum}
        </text>
      ))}

      {/* asked value reveal: the star */}
      <text
        x={GRID_X + gridW / 2}
        y={Q24_VIEW_H - 14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill={showAnswer ? '#10B981' : '#94A3B8'}
      >
        {showAnswer ? `★ = ${STAR_VALUE}` : '★ = ?'}
      </text>
    </svg>
  )
}

export default function P24G1Q24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 grid of shapes. Top row: star, triangle, star, total 17. Middle row: circle, circle, circle, total 18. Bottom row: circle, triangle, star, total 19. Column totals: 16, 24, 14. Find the value of the star."
    >
      <Q24SumGridDiagram />
    </div>
  )
}
