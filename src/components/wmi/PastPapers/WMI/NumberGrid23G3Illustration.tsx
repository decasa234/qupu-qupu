// WMI-23F3A-Q23 (2023 Grade 3 Final) — pick a transversal of a 3×3 number grid.
//
// "From the grid below, pick three numbers so that no two of them are in the same
// row or the same column, and use them to form a 3-digit number. How many of these
// 3-digit numbers are divisible by 4?"  Answer: 8 (fill-in).
//
// THE GRID (rows top→bottom — the numbers 1..9 spiralling):
//   row0: 1 2 3
//   row1: 8 9 4
//   row2: 7 6 5
//
// MATH (for reference only — the static figure must NOT reveal the count 8 nor
// any chosen transversal). A "transversal" picks exactly one cell per row with
// all-distinct columns — there are 3! = 6 of them. Their digit sets are:
//   {1,9,5}, {1,4,6}, {2,8,5}, {2,4,7}, {3,8,6}, {3,9,7}
// From each set we form every 3-digit arrangement (3! = 6 orderings) and count
// those divisible by 4 (last two digits form a number ÷ 4):
//   {1,9,5} -> 0
//   {1,4,6} -> 2   (164, 416)
//   {2,8,5} -> 2   (528, 852)
//   {2,4,7} -> 2   (472, 724)
//   {3,8,6} -> 2   (368, 836)
//   {3,9,7} -> 0
//   ----------------------------
//   total   -> 8
//
// The default export draws ONLY the clean 3×3 number grid (the setup). It commits
// to NO transversal and never shows the count. Highlighting a chosen transversal
// is the animator's job, via the co-exported `NumberGrid23G3({ pick })` primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// Fixed grid values, row-major. [row][col], row 0 = top.
const GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [1, 2, 3],
  [8, 9, 4],
  [7, 6, 5],
]

// ---- geometry --------------------------------------------------------------
const PAD = 14 // outer padding (headroom so strokes don't clip at edges)
const CELL = 64 // cell side
const GRID_SPAN = CELL * 3
const VIEW = GRID_SPAN + PAD * 2

const cellX = (col: number) => PAD + col * CELL
const cellY = (row: number) => PAD + row * CELL
const colCtr = (col: number) => cellX(col) + CELL / 2
const rowCtr = (row: number) => cellY(row) + CELL / 2

// ---- pick validation -------------------------------------------------------

/** Keep only well-formed in-range 0-indexed [row,col] cells. */
function normalizePick(pick: Array<[number, number]> | null | undefined): Array<[number, number]> {
  if (!Array.isArray(pick)) return []
  const out: Array<[number, number]> = []
  for (const cell of pick) {
    if (
      Array.isArray(cell) &&
      cell.length === 2 &&
      Number.isInteger(cell[0]) &&
      Number.isInteger(cell[1]) &&
      cell[0] >= 0 &&
      cell[0] < 3 &&
      cell[1] >= 0 &&
      cell[1] < 3
    ) {
      out.push([cell[0], cell[1]])
    }
  }
  return out
}

// ---- primitive: NumberGrid23G3 ---------------------------------------------

export interface NumberGrid23G3Props {
  /**
   * 0-indexed [row, col] cells to highlight (a transversal). Default `null` =
   * plain grid with no highlight. Used by the animator to ring a chosen set of
   * three cells. Out-of-range / malformed entries are ignored.
   */
  pick?: Array<[number, number]> | null
}

/**
 * NumberGrid23G3 — the fixed 3×3 number grid (clean dark gridlines, plain
 * digits) rendered as a complete <svg>. When `pick` is supplied, each listed
 * cell gets an orange highlight ring (animator post-answer aid). The default
 * question figure passes no `pick`.
 */
export function NumberGrid23G3({ pick = null }: NumberGrid23G3Props = {}) {
  const cells = normalizePick(pick)

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 220 }}
      aria-hidden="true"
    >
      {/* cell backgrounds (cream) */}
      {GRID.map((rowVals, row) =>
        rowVals.map((_v, col) => (
          <rect
            key={`bg-${row}-${col}`}
            x={cellX(col)}
            y={cellY(row)}
            width={CELL}
            height={CELL}
            className="fill-qupu-cream"
          />
        )),
      )}

      {/* highlight rings on the chosen cells (behind the digits) */}
      {cells.map(([row, col], i) => (
        <rect
          key={`hl-${i}`}
          x={cellX(col) + 6}
          y={cellY(row) + 6}
          width={CELL - 12}
          height={CELL - 12}
          rx={10}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={4}
        />
      ))}

      {/* outer frame */}
      <rect
        x={PAD}
        y={PAD}
        width={GRID_SPAN}
        height={GRID_SPAN}
        fill="none"
        className="stroke-qupu-ink"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* inner gridlines */}
      {[1, 2].map((i) => (
        <g key={`gl-${i}`}>
          <line
            x1={PAD + i * CELL}
            y1={PAD}
            x2={PAD + i * CELL}
            y2={PAD + GRID_SPAN}
            className="stroke-qupu-ink"
            strokeWidth={2}
          />
          <line
            x1={PAD}
            y1={PAD + i * CELL}
            x2={PAD + GRID_SPAN}
            y2={PAD + i * CELL}
            className="stroke-qupu-ink"
            strokeWidth={2}
          />
        </g>
      ))}

      {/* the nine fixed numbers */}
      {GRID.map((rowVals, row) =>
        rowVals.map((val, col) => (
          <text
            key={`n-${row}-${col}`}
            x={colCtr(col)}
            y={rowCtr(row) + 1}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-qupu-brand-blue"
            fontFamily="Nunito, sans-serif"
            fontSize={32}
            fontWeight={800}
          >
            {val}
          </text>
        )),
      )}
    </svg>
  )
}

// ---- default export: the static in-card figure -----------------------------

/**
 * NumberGrid23G3Illustration
 *
 * Draws ONLY the setup: the clean 3×3 number grid (rows 1 2 3 / 8 9 4 / 7 6 5).
 * It reveals no transversal and never shows the answer count. `params` is unused
 * (the grid is fixed) but accepted and ignored for the shared illustration
 * signature.
 */
export default function NumberGrid23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi angka 3 kali 3. Baris atas 1, 2, 3; baris tengah 8, 9, 4; baris bawah 7, 6, 5. ' +
        'Pilih tiga angka sehingga tidak ada dua yang sebaris atau sekolom, lalu susun menjadi bilangan tiga angka. ' +
        'Berapa banyak bilangan tiga angka seperti itu yang habis dibagi 4?'
      }
    >
      <NumberGrid23G3 />
    </div>
  )
}
