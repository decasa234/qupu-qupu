// IKMC-23-PE-Q10 — coloured-squares counting problem.
//
// PROBLEM ONLY — shows the 6 × 4 grid exactly as in the paper (028.jpg):
//   24 squares total, some already coloured purple (9 squares).
//   The student must find how many MORE need to be coloured so that
//   exactly half (12) are coloured.  Answer: 3 (choice C).
//
// Colour palette matches the scan (028.jpg):
//   purple — #7065C4  (IKMC indigo-purple)
//   white  — #FFFFFF  (uncoloured cells)
//   border — #444     (cell stroke)
//
// Exported constants let the Explainer overlay in the same coordinate space.

/** SVG viewport width */
export const SVG_W = 300
/** SVG viewport height */
export const SVG_H = 200

/** Cell size in SVG units */
export const CELL = 44

/** Grid: 6 columns × 4 rows */
export const COLS = 6
export const ROWS = 4

/** Grid origin — top-left corner of the first cell */
export const GRID_X = (SVG_W - CELL * COLS) / 2   // = 18
export const GRID_Y = (SVG_H - CELL * ROWS) / 2   // = 12

/** Stroke colour for all cell borders */
export const STROKE = '#444'

/** Fill colours */
export const PURPLE = '#7065C4'
export const WHITE  = '#FFFFFF'

/**
 * Which cells are already coloured, by (row, col) index.
 * Faithfully reconstructed from the scan (028.jpg).
 * 6 columns (0–5), 4 rows (0–3), 9 cells total.
 *
 * Layout (P = purple, W = white):
 *   Row 0: P W P W P W   → cols 0, 2, 4
 *   Row 1: W W W W P W   → col  4
 *   Row 2: W P W P W W   → cols 1, 3
 *   Row 3: P W P W W W   → cols 0, 2
 *
 * Total coloured = 3 + 1 + 2 + 3 = 9.
 */
export const COLORED: ReadonlySet<string> = new Set([
  '0-0', '0-2', '0-4',
  '1-4',
  '2-1', '2-3',
  '3-0', '3-2', '3-3',
])

/** Is cell (row, col) already coloured? */
export const isColored = (row: number, col: number) =>
  COLORED.has(`${row}-${col}`)

/** x-coordinate of left edge of column `col` */
export const colX = (col: number) => GRID_X + col * CELL
/** y-coordinate of top edge of row `row` */
export const rowY = (row: number) => GRID_Y + row * CELL
/** x-centre of column `col` */
export const colCx = (col: number) => GRID_X + col * CELL + CELL / 2
/** y-centre of row `row` */
export const rowCy = (row: number) => GRID_Y + row * CELL + CELL / 2

// ── Primitive: a single cell ──────────────────────────────────────────────────

/**
 * A single cell in the 6 × 4 grid.
 *
 * @param row   0 = top row, 3 = bottom row
 * @param col   0 = leftmost, 5 = rightmost
 * @param fill  background colour
 */
export function ColorGridCell({
  row,
  col,
  fill,
}: {
  row: number
  col: number
  fill: string
}) {
  return (
    <rect
      x={colX(col)}
      y={rowY(row)}
      width={CELL}
      height={CELL}
      fill={fill}
      stroke={STROKE}
      strokeWidth={1.5}
    />
  )
}

/**
 * Reusable primitive: the full 6 × 4 coloured-squares grid.
 *
 * @param extraColored  additional (row, col) pairs to render as coloured
 *                      (used by the explainer to highlight cells being added)
 * @param highlightSet  set of "row-col" strings to draw with an accent ring
 * @param highlightColor colour for the accent ring (defaults to green)
 */
export function ColorGrid10PE({
  extraColored = [],
  highlightSet,
  highlightColor = '#10B981',
}: {
  extraColored?: Array<[number, number]>
  highlightSet?: ReadonlySet<string>
  highlightColor?: string
} = {}) {
  const extraSet = new Set(extraColored.map(([r, c]) => `${r}-${c}`))

  return (
    <>
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const key = `${row}-${col}`
          const colored = isColored(row, col) || extraSet.has(key)
          return (
            <ColorGridCell
              key={key}
              row={row}
              col={col}
              fill={colored ? PURPLE : WHITE}
            />
          )
        }),
      )}
      {/* accent rings over highlighted cells */}
      {highlightSet &&
        Array.from(highlightSet).map((key) => {
          const [r, c] = key.split('-').map(Number)
          return (
            <rect
              key={`hl-${key}`}
              x={colX(c) + 3}
              y={rowY(r) + 3}
              width={CELL - 6}
              height={CELL - 6}
              fill="none"
              stroke={highlightColor}
              strokeWidth={3}
              rx={4}
            />
          )
        })}
    </>
  )
}

// ── Default export: static problem illustration ────────────────────────────────

/**
 * ColorGrid10PEIllustration
 *
 * Static, problem-only figure for IKMC-23-PE-Q10.
 * Shows: 6 × 4 grid with 9 purple squares (already coloured).
 * Does NOT reveal the answer (3 more squares needed).
 */
export default function ColorGrid10PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kotak-kotak dalam susunan 6 kolom dan 4 baris — ada 24 kotak total. ' +
        'Suchit sudah mewarnai 9 kotak dengan warna ungu. ' +
        'Berapa banyak kotak lagi yang perlu diwarnai agar setengah (12) kotak berwarna?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W * 1.2)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* the 6 × 4 coloured grid */}
        <ColorGrid10PE />
      </svg>
    </div>
  )
}
