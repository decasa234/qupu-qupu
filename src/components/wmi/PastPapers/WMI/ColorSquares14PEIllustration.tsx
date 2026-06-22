// IKMC-20-PE-Q14 — coloured squares with numbers.
//
// PROBLEM ONLY — shows exactly what the paper shows (047.jpg):
//   A 2-row × 3-column grid of squares arranged as follows:
//
//     [ blue ][ blue ][ yellow ]
//     [ blue ][ yellow ][ white ? ]
//
//   All six cells are empty (no numbers filled in) — the student must
//   figure out what goes in the white "?" cell.  The numbers 1–6 will be
//   distributed among the cells satisfying:
//     • blue sum = 10
//     • yellow sum = 10
//     • white = 1 (answer A, not shown here)
//
// Colours match the scan (047.jpg):
//   blue   — #3B9DD2  (IKMC cornflower-blue)
//   yellow — #F5C842  (IKMC sunflower-yellow)
//   white  — #FFFFFF  with a thin grey border
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.
//
// Exported constants let the Explainer overlay in the same coordinate space.

/** SVG viewport width */
export const SVG_W = 240
/** SVG viewport height */
export const SVG_H = 160

/** Cell size (square) in SVG units */
export const CELL = 70

/** Grid origin — top-left corner of the first cell */
export const GRID_X = (SVG_W - CELL * 3) / 2   // = 15
export const GRID_Y = (SVG_H - CELL * 2) / 2   // = 10

/** Stroke colour for all cell borders */
export const STROKE = '#444'

/** Fill colours */
export const BLUE   = '#3B9DD2'
export const YELLOW = '#F5C842'
export const WHITE  = '#FFFFFF'

/**
 * Cell layout for the 2 × 3 grid (row, col) → colour.
 *   Row 0: blue  / blue   / yellow
 *   Row 1: blue  / yellow / white
 */
export const CELL_COLORS: ReadonlyArray<ReadonlyArray<string>> = [
  [BLUE,  BLUE,   YELLOW],
  [BLUE,  YELLOW, WHITE ],
]

/** x-centre of column `col` */
export const colCx = (col: number) => GRID_X + col * CELL + CELL / 2
/** y-centre of row `row` */
export const rowCy = (row: number) => GRID_Y + row * CELL + CELL / 2

// ── Primitive: a single coloured cell ─────────────────────────────────────────

/**
 * A single cell in the grid.
 *
 * @param row        0 = top, 1 = bottom
 * @param col        0 = left, 1 = middle, 2 = right
 * @param fill       background colour
 * @param label      text drawn in the cell centre ('' = nothing)
 * @param labelColor text colour (default: dark ink)
 */
export function ColorSquareCell({
  row,
  col,
  fill,
  label = '',
  labelColor = '#1F2937',
}: {
  row: number
  col: number
  fill: string
  label?: string
  labelColor?: string
}) {
  const x = GRID_X + col * CELL
  const y = GRID_Y + row * CELL

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CELL}
        height={CELL}
        fill={fill}
        stroke={STROKE}
        strokeWidth={2}
      />
      {label !== '' && (
        <text
          x={x + CELL / 2}
          y={y + CELL / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={28}
          fontWeight={900}
          fill={labelColor}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Reusable primitive: the 2 × 3 coloured-squares grid.
 * `labels` is a row-major array of strings; '' = blank cell.
 * `questionMark` = true draws "?" in the white cell (bottom-right).
 */
export function ColorSquaresGrid({
  labels = [
    ['', '', ''],
    ['', '', ''],
  ],
  questionMark = true,
}: {
  labels?: string[][]
  questionMark?: boolean
}) {
  return (
    <>
      {CELL_COLORS.map((rowCols, row) =>
        rowCols.map((fill, col) => {
          const isWhite = row === 1 && col === 2
          const labelText = isWhite && questionMark ? '?' : (labels[row]?.[col] ?? '')
          const labelColor = isWhite ? '#4B5563' : '#1F2937'
          return (
            <ColorSquareCell
              key={`c-${row}-${col}`}
              row={row}
              col={col}
              fill={fill}
              label={labelText}
              labelColor={labelColor}
            />
          )
        }),
      )}
    </>
  )
}

// ── Default export: static problem illustration ────────────────────────────────

/**
 * ColorSquares14PEIllustration
 *
 * Static, problem-only figure for IKMC-20-PE-Q14.
 * Shows: 2 × 3 grid of blue / yellow / white squares; white cell has "?".
 * Does NOT reveal any numbers or the answer (1).
 */
export default function ColorSquares14PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Enam kotak persegi dalam susunan 2 baris 3 kolom. ' +
        'Baris atas: biru, biru, kuning. Baris bawah: biru, kuning, putih dengan tanda tanya. ' +
        'Jumlah angka di kotak biru harus 10, jumlah di kotak kuning harus 10.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W * 1.4)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* the 2 × 3 coloured grid (cells blank except for "?" in white) */}
        <ColorSquaresGrid questionMark={true} />
      </svg>
    </div>
  )
}
