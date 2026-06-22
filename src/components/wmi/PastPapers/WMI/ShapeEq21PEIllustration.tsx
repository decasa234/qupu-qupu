// In-card illustration for IKMC-2022-PreEcolier-Q21 (shape algebra, grid + row/col sums).
//
// Reconstructed from OCR stem image docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/062.jpg:
//
//   3 × 3 grid.  Arrows show "+ direction":
//     right-pointing arrow at top  → row sums shown on the right
//     down-pointing arrow on left  → column sums shown on the bottom
//
//   Grid (row, col):
//     row 0: square, square, square  → row sum = 18
//     row 1: triangle, square, square   (no row sum)
//     row 2: triangle, circle, triangle → row sum = 10
//
//   Column sums:
//     col 0 → 14      col 1 → ?      (col 2 not labelled in figure)
//
// Solution (never shown in illustration — explainer only):
//   square   = 18 / 3 = 6
//   triangle : col0 = 6 + triangle + triangle = 14  →  triangle = 4
//   circle   : row2 = 4 + circle + 4 = 10           →  circle   = 2
//   col1 sum = 6 + 6 + 2 = 14  → answer C (14)
//
// Adapted from ShapeSum17ECIllustration (pool id: shape-sum-17ec), extended to
// draw column sums below the grid and directional "+" arrow headers.
//
// SSR-safe: pure constants, no window/Date/Math.random.

const INK = '#1F2937'
const GREY_STROKE = '#94A3B8'

// ── Colour tokens (matches grayscale of the source image; slight colour for clarity) ──
const SQ_FILL = '#CBD5E1'   // square — medium grey
const SQ_STROKE = '#475569'
const TRI_FILL = '#A7F3D0'  // triangle — light teal
const TRI_STROKE = '#059669'
const CIRC_FILL = '#FDE68A' // circle — light amber
const CIRC_STROKE = '#D97706'

// ── Layout ────────────────────────────────────────────────────────────────────
const CELL = 68
const PAD = 20        // left / top outer padding

// Row sums column
const ROW_SUM_X = PAD + 3 * CELL + 18  // x-start of "= N" for row totals

// Column sums row
const COL_SUM_Y = PAD + 3 * CELL + 22  // y-centre of column sum labels

// Arrows header row (above the grid)
const ARROW_Y = PAD - 8  // y of the top directional arrow area

const SVG_W = ROW_SUM_X + 52
const SVG_H = COL_SUM_Y + 26

// ── Grid data ─────────────────────────────────────────────────────────────────
type ShapeId = 'square' | 'triangle' | 'circle'

// [row][col]
export const GRID: ShapeId[][] = [
  ['square',   'square', 'square'],
  ['triangle', 'square', 'square'],
  ['triangle', 'circle', 'triangle'],
]

// Row sums: only rows 0 and 2 are labelled (row 1 is null)
export const ROW_SUMS: (number | null)[] = [18, null, 10]

// Column sums: col 0 = 14, col 1 = ? (unknown), col 2 = not labelled
export const COL_SUM_0 = 14
// col 1 is the "?" cell; col 2 not shown in source figure

// Solved values (used only in the explainer)
export const SOL_SQUARE   = 6
export const SOL_TRIANGLE = 4
export const SOL_CIRCLE   = 2
export const SOL_COL1     = 14

// ── Shape glyphs, centred at (0, 0) ──────────────────────────────────────────

function Square() {
  const s = 24
  return (
    <rect
      x={-s}
      y={-s}
      width={s * 2}
      height={s * 2}
      rx={3}
      fill={SQ_FILL}
      stroke={SQ_STROKE}
      strokeWidth={2.5}
    />
  )
}

function Triangle() {
  const r = 26
  const pts = `0,${-r} ${-r * 0.92},${r * 0.78} ${r * 0.92},${r * 0.78}`
  return (
    <polygon
      points={pts}
      fill={TRI_FILL}
      stroke={TRI_STROKE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

function CircleShape() {
  return <circle cx={0} cy={0} r={26} fill={CIRC_FILL} stroke={CIRC_STROKE} strokeWidth={2} />
}

function renderShape(kind: ShapeId) {
  if (kind === 'square') return <Square />
  if (kind === 'triangle') return <Triangle />
  return <CircleShape />
}

// ── Primitive (reused by explainer) ──────────────────────────────────────────

export interface ShapeEq21PEFigureProps {
  /** Row index to wash in amber highlight, or null. */
  highlightRow?: number | null
  /** Col index to wash in blue highlight, or null. */
  highlightCol?: number | null
  /** Shapes whose values to overlay inside cells. */
  revealed?: Partial<Record<ShapeId, number>>
  /** Which row totals to colour green (length-3 boolean array). */
  highlightRowTotals?: boolean[]
  /** Whether to highlight col0 total green. */
  highlightCol0?: boolean
  /** Whether to reveal the col1 answer. */
  revealCol1?: boolean
}

export function ShapeEq21PEFigure({
  highlightRow = null,
  highlightCol = null,
  revealed = {},
  highlightRowTotals = [false, false, false],
  highlightCol0 = false,
  revealCol1 = false,
}: ShapeEq21PEFigureProps) {
  const cx = (c: number) => PAD + c * CELL + CELL / 2
  const cy = (r: number) => PAD + r * CELL + CELL / 2

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── directional arrows ── */}
      {/* Right arrow at top: row sums go right */}
      <text
        x={PAD}
        y={ARROW_Y}
        fontSize={13}
        fontWeight={700}
        fill={INK}
        dominantBaseline="central"
      >
        +
      </text>
      {/* right-pointing arrow */}
      <line
        x1={PAD + 12}
        y1={ARROW_Y}
        x2={PAD + 3 * CELL - 4}
        y2={ARROW_Y}
        stroke={INK}
        strokeWidth={1.8}
        markerEnd="url(#arrowR)"
      />
      {/* Down arrow on left: column sums go down */}
      <text
        x={PAD - 16}
        y={PAD}
        fontSize={13}
        fontWeight={700}
        fill={INK}
        dominantBaseline="central"
      >
        +
      </text>
      <line
        x1={PAD - 10}
        y1={PAD + 12}
        x2={PAD - 10}
        y2={PAD + 3 * CELL - 4}
        stroke={INK}
        strokeWidth={1.8}
        markerEnd="url(#arrowD)"
      />

      {/* arrowhead markers */}
      <defs>
        <marker id="arrowR" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill={INK} />
        </marker>
        <marker id="arrowD" markerWidth={6} markerHeight={6} refX={3} refY={5} orient="auto">
          <path d="M0,0 L6,0 L3,6 Z" fill={INK} />
        </marker>
      </defs>

      {/* ── row highlight wash ── */}
      {highlightRow !== null && (
        <rect
          x={PAD}
          y={PAD + highlightRow * CELL}
          width={CELL * 3}
          height={CELL}
          fill="#FEF3C7"
        />
      )}

      {/* ── col highlight wash ── */}
      {highlightCol !== null && (
        <rect
          x={PAD + highlightCol * CELL}
          y={PAD}
          width={CELL}
          height={CELL * 3}
          fill="#DBEAFE"
          opacity={0.6}
        />
      )}

      {/* ── cell borders ── */}
      {GRID.map((row, r) =>
        row.map((_, c) => (
          <rect
            key={`b${r}${c}`}
            x={PAD + c * CELL}
            y={PAD + r * CELL}
            width={CELL}
            height={CELL}
            fill="none"
            stroke={GREY_STROKE}
            strokeWidth={1.5}
          />
        )),
      )}

      {/* ── shapes + optional revealed value ── */}
      {GRID.map((row, r) =>
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
                  fontSize={17}
                  fontWeight={900}
                  fill={INK}
                  stroke="white"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {val}
                </text>
              )}
            </g>
          )
        }),
      )}

      {/* ── row sums on the right: "= 18" and "= 10" ── */}
      {ROW_SUMS.map((total, r) => {
        if (total === null) return null
        const isHi = highlightRowTotals[r] ?? false
        return (
          <text
            key={`rs${r}`}
            x={ROW_SUM_X}
            y={cy(r)}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={900}
            fill={isHi ? '#059669' : INK}
          >
            {`= ${total}`}
          </text>
        )
      })}

      {/* ── column sums at bottom ── */}
      {/* col 0 = 14 */}
      <text
        x={cx(0)}
        y={COL_SUM_Y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill={highlightCol0 ? '#059669' : INK}
      >
        14
      </text>

      {/* col 1 = ? or 14 when revealed */}
      <text
        x={cx(1)}
        y={COL_SUM_Y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={revealCol1 ? '#059669' : '#94A3B8'}
      >
        {revealCol1 ? String(SOL_COL1) : '?'}
      </text>
    </svg>
  )
}

// ── Default export: static in-card illustration ───────────────────────────────

export default function ShapeEq21PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 grid of shapes. Each shape represents a different number. Row 1: square, square, square — sum 18. Row 2: triangle, square, square. Row 3: triangle, circle, triangle — sum 10. Column 1 sum is 14. What is column 2 sum?"
    >
      <ShapeEq21PEFigure />
    </div>
  )
}
