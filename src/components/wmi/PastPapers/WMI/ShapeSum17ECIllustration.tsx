// In-card illustration for IKMC-2019-Ecolier-Q17 (shape algebra / row-sum grid).
//
// Reconstructed from OCR stem image 2019.imgs/050.jpg:
//   Row 1: circle(blue), star(red), heart(pink) → 15
//   Row 2: circle(blue), circle(blue), circle(blue) → 12
//   Row 3: star(red), heart(pink), heart(pink) → 16
//
// Layout: 3 × 3 grid of shapes, each cell 72×72 px, padded 20 px all sides.
// Row totals shown to the right of each row as "= N".
// The static illustration shows ONLY the problem — no numbers revealed.
//
// Adapted from ShapeGridDiagram in ShapeGrid20Illustration.tsx (pool id: shape-grid20).
// That component is the closest pool primitive: same 3×3 bordered cell grid,
// same SVG-only shape rendering, same highlightRow prop shape.
//
// SSR-safe: pure constants, no window/Date/Math.random.

const INK = '#1F2937'
const BLUE_FILL = '#93C5FD' // circle (sky-blue, matches scan's light-blue circles)
const BLUE_STROKE = '#3B82F6'
const RED_FILL = '#EF4444'   // star (red, matches scan)
const RED_STROKE = '#B91C1C'
const PINK_FILL = '#F9A8D4'  // heart (pink, matches scan)
const PINK_STROKE = '#EC4899'

const CELL = 72
const PAD = 20
const TOTAL_COL_X = PAD + 3 * CELL + 16 // x-start of "= N" label

const SVG_W = TOTAL_COL_X + 48
const SVG_H = PAD * 2 + 3 * CELL

// ── Shape glyphs, centred at (0,0) inside ~54×54 box ─────────────────────────

function Circle() {
  return (
    <circle cx={0} cy={0} r={26} fill={BLUE_FILL} stroke={BLUE_STROKE} strokeWidth={3} />
  )
}

function Star() {
  const outer = 25
  const inner = 10
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    pts.push(`${(r * Math.cos(rad)).toFixed(2)},${(r * Math.sin(rad)).toFixed(2)}`)
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={RED_FILL}
      stroke={RED_STROKE}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  )
}

function Heart() {
  return (
    <path
      d="M 0 20 C -24 4 -24 -14 -12 -19 C -5 -22 0 -16 0 -10 C 0 -16 5 -22 12 -19 C 24 -14 24 4 0 20 Z"
      fill={PINK_FILL}
      stroke={PINK_STROKE}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  )
}

// ── Grid data ─────────────────────────────────────────────────────────────────

type ShapeId = 'circle' | 'star' | 'heart'

// ROW_SHAPES[r][c] is the shape in that cell; ROW_TOTALS[r] is the row sum.
export const ROW_SHAPES = [
  ['circle', 'star', 'heart'],
  ['circle', 'circle', 'circle'],
  ['star', 'heart', 'heart'],
] as const satisfies ShapeId[][]
export const ROW_TOTALS = [15, 12, 16] as const

// Known solution (used by the explainer only, never shown in the illustration).
export const SOL_CIRCLE = 4
export const SOL_HEART = 5
export const SOL_STAR = 6

// ── Primitive ─────────────────────────────────────────────────────────────────

export interface ShapeSum17ECFigureProps {
  /**
   * If set, wash this row (0-based) in a light amber highlight so the viewer's
   * attention is drawn to it while working through the beats.
   */
  highlightRow?: number | null
  /**
   * Optional solved values to overlay inside each cell.
   * Keyed by shape name; if a shape is in this record its value is shown inside
   * the corresponding cells.
   */
  revealed?: Partial<Record<ShapeId, number>>
  /** If true, the "= N" total for a given row is highlighted green. */
  highlightTotals?: boolean[]
}

export function ShapeSum17ECFigure({
  highlightRow = null,
  revealed = {},
  highlightTotals,
}: ShapeSum17ECFigureProps) {
  const cx = (c: number) => PAD + c * CELL + CELL / 2
  const cy = (r: number) => PAD + r * CELL + CELL / 2

  function renderShape(kind: ShapeId) {
    if (kind === 'circle') return <Circle />
    if (kind === 'star') return <Star />
    return <Heart />
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* row highlight wash */}
      {highlightRow !== null && (
        <rect
          x={PAD}
          y={PAD + highlightRow * CELL}
          width={CELL * 3}
          height={CELL}
          fill="#FEF3C7"
        />
      )}

      {/* cell borders */}
      {ROW_SHAPES.map((row, r) =>
        row.map((_, c) => (
          <rect
            key={`b${r}${c}`}
            x={PAD + c * CELL}
            y={PAD + r * CELL}
            width={CELL}
            height={CELL}
            fill="none"
            stroke="#94A3B8"
            strokeWidth={1.5}
          />
        )),
      )}

      {/* shapes + optional revealed number */}
      {ROW_SHAPES.map((row, r) =>
        row.map((kind, c) => {
          const val = revealed[kind]
          return (
            <g key={`s${r}${c}`} transform={`translate(${cx(c)}, ${cy(r)})`}>
              {renderShape(kind)}
              {val !== undefined && (
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={18}
                  fontWeight={900}
                  fill={INK}
                  stroke="white"
                  strokeWidth={3}
                  paintOrder="stroke"
                  className="font-display"
                >
                  {val}
                </text>
              )}
            </g>
          )
        }),
      )}

      {/* row totals: "= 15", "= 12", "= 16" */}
      {ROW_TOTALS.map((total, r) => {
        const isHi = highlightTotals?.[r] ?? false
        const textY = PAD + r * CELL + CELL / 2
        return (
          <text
            key={`t${r}`}
            x={TOTAL_COL_X}
            y={textY}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={900}
            fill={isHi ? '#059669' : INK}
            className="font-display"
          >
            {`= ${total}`}
          </text>
        )
      })}
    </svg>
  )
}

// ── Default export: static illustration ────────────────────────────────────

export default function ShapeSum17ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Kisi 3 baris × 3 kolom. Baris 1: lingkaran, bintang, hati = 15. Baris 2: lingkaran, lingkaran, lingkaran = 12. Baris 3: bintang, hati, hati = 16. Setiap bentuk mewakili angka berbeda."
    >
      <ShapeSum17ECFigure />
    </div>
  )
}
