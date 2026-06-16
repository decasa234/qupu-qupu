// WMI-23P3A-Q24 (2023 Grade 3 Semifinal, Paper A) — multiplication lines in a
// number grid.
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g3-a-q24.jpg (NOT embedded).
//
// The scan shows ONLY the worked EXAMPLE grid (labelled "EX"):
//        9   2   2
//        5   3   8
//        6   1   16
// with two linked groups demonstrating the rule — a vertical link 2·8·16
// (2 × 8 = 16) and a diagonal link 2·3·6 (2 × 3 = 6). Each group of three
// numbers (a row, a column, or a diagonal) is "linked"; a group counts when one
// number equals the product of the other two.
//
// The actual QUESTION grid was an image not preserved in the seed (only the EX
// figure survives). So the question grid below is RECONSTRUCTED to match the
// verified key: a 3×3 grid in which EXACTLY 6 of the 8 lines (3 rows, 3 columns,
// 2 diagonals) are true products. A brute-force scan confirmed this grid has
// exactly 6 valid product-lines:
//        2   3   6     row0: 6 = 2×3   ✓
//        4  12   3     row1: 12 = 4×3  ✓
//        2   4   8     row2: 8 = 2×4   ✓
//   col0 4 = 2×2 ✓   col1 12 = 3×4 ✓   col2 6·3·8 ✗
//   diag ↘ 2·12·8 ✗   diag ↙ 12 = 6×2 ✓
// → 6 correct equations → choice B.
//
// This file draws ONLY the problem: the EX worked example and the question grid,
// with no line highlighted on the question grid and the answer never shown.
// Co-exports `NumberGrid` (a 3×3 grid that can ring + link a chosen LINE and
// mark whether it multiplies) which the explainer walks line by line.
//
// Pure render — no window/document, no Math.random/Date. SSR-safe + deterministic.

// ── The question grid (row-major, [row][col], row 0 = top). ──────────────────
export const GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [2, 3, 6],
  [4, 12, 3],
  [2, 4, 8],
]

// The example grid, exactly as drawn in the scan.
export const EX_GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [9, 2, 2],
  [5, 3, 8],
  [6, 1, 16],
]

export type Cell = [number, number] // [row, col]

// The 8 candidate LINES of three cells: 3 rows, 3 cols, 2 diagonals.
export const LINES: ReadonlyArray<{ name: string; cells: [Cell, Cell, Cell] }> = [
  { name: 'row0', cells: [[0, 0], [0, 1], [0, 2]] },
  { name: 'row1', cells: [[1, 0], [1, 1], [1, 2]] },
  { name: 'row2', cells: [[2, 0], [2, 1], [2, 2]] },
  { name: 'col0', cells: [[0, 0], [1, 0], [2, 0]] },
  { name: 'col1', cells: [[0, 1], [1, 1], [2, 1]] },
  { name: 'col2', cells: [[0, 2], [1, 2], [2, 2]] },
  { name: 'diagTLBR', cells: [[0, 0], [1, 1], [2, 2]] },
  { name: 'diagTRBL', cells: [[0, 2], [1, 1], [2, 0]] },
]

const valAt = (g: ReadonlyArray<ReadonlyArray<number>>, [r, c]: Cell) => g[r][c]

/** Does this line of three multiply (one = product of the other two)? */
export function lineMultiplies(g: ReadonlyArray<ReadonlyArray<number>>, cells: readonly Cell[]): boolean {
  const [a, b, c] = cells.map((cell) => valAt(g, cell))
  return a === b * c || b === a * c || c === a * b
}

/** Returns "c = a × b" (largest as the product) for a true line; else null. */
export function lineEquation(g: ReadonlyArray<ReadonlyArray<number>>, cells: readonly Cell[]): string | null {
  const [a, b, c] = cells.map((cell) => valAt(g, cell))
  if (a === b * c) return `${a} = ${b} × ${c}`
  if (b === a * c) return `${b} = ${a} × ${c}`
  if (c === a * b) return `${c} = ${a} × ${b}`
  return null
}

// Number of true lines in the question grid (the answer count).
export const CORRECT_COUNT = LINES.filter((l) => lineMultiplies(GRID, l.cells)).length // 6 → B

// ─── geometry / colours ───────────────────────────────────────────────────
const INK = '#1F2937'
const LINK = '#7C3AED' // purple oval link
const GOOD = '#10B981'
const BAD = '#EF4444'
const RING_BG = '#FFF7ED'

const CELL = 64
const PAD = 18
const SPAN = CELL * 3 + PAD * 2

const cx = (col: number) => PAD + col * CELL + CELL / 2
const cy = (row: number) => PAD + row * CELL + CELL / 2

export interface NumberGridProps {
  grid?: ReadonlyArray<ReadonlyArray<number>>
  /** Cells of a line to ring + link (an oval through the three centres). */
  highlight?: readonly Cell[]
  /** 'good' draws a green ✓ tag, 'bad' a red ✗ tag, undefined = none. */
  verdict?: 'good' | 'bad'
  /** Equation caption drawn under the grid when a good line is highlighted. */
  equation?: string | null
  maxWidth?: number
}

/**
 * A 3×3 number grid. Pass `highlight` (3 collinear cells) to ring them and draw a
 * purple oval link; pass `verdict` to tag the line ✓/✗. Default question figure
 * passes none.
 */
export function NumberGrid({ grid = GRID, highlight, verdict, equation, maxWidth = 220 }: NumberGridProps) {
  const hl = Array.isArray(highlight) && highlight.length === 3 ? highlight : undefined

  // Oval link: capsule from first to last highlighted centre.
  let link: React.ReactNode = null
  if (hl) {
    const [r0, c0] = hl[0]
    const [r2, c2] = hl[2]
    const x1 = cx(c0)
    const y1 = cy(r0)
    const x2 = cx(c2)
    const y2 = cy(r2)
    const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
    const len = Math.hypot(x2 - x1, y2 - y1)
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const rx = len / 2 + 24
    const ry = 24
    link = <ellipse cx={mx} cy={my} rx={rx} ry={ry} fill="none" stroke={LINK} strokeWidth={3.5} transform={`rotate(${ang} ${mx} ${my})`} />
  }

  const VH = SPAN + (equation ? 34 : 0)

  return (
    <svg
      viewBox={`0 0 ${SPAN} ${VH}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth }}
      aria-hidden="true"
    >
      {/* cell rings for the highlighted line (behind numbers) */}
      {hl &&
        hl.map(([r, c], i) => (
          <rect
            key={`ring${i}`}
            x={PAD + c * CELL + 6}
            y={PAD + r * CELL + 6}
            width={CELL - 12}
            height={CELL - 12}
            rx={10}
            fill={RING_BG}
            stroke={verdict === 'bad' ? BAD : verdict === 'good' ? GOOD : LINK}
            strokeWidth={3}
          />
        ))}

      {/* purple oval link */}
      {link}

      {/* the nine numbers */}
      {grid.map((rowVals, r) =>
        rowVals.map((v, c) => (
          <text
            key={`n${r}-${c}`}
            x={cx(c)}
            y={cy(r) + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize={30}
            fontWeight={800}
            fill={INK}
          >
            {v}
          </text>
        )),
      )}

      {/* verdict tag near the line's last cell */}
      {hl && verdict && (
        <text
          x={cx(hl[2][1])}
          y={cy(hl[2][0]) - CELL / 2 + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={26}
          fontWeight={900}
          fill={verdict === 'good' ? GOOD : BAD}
        >
          {verdict === 'good' ? '✓' : '✗'}
        </text>
      )}

      {/* equation caption under the grid */}
      {equation && (
        <text
          x={SPAN / 2}
          y={SPAN + 17}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight={800}
          fill={GOOD}
        >
          {equation}
        </text>
      )}
    </svg>
  )
}

/** The EX worked-example grid with its two demonstrated links (2×8=16, 2×3=6). */
function ExampleGrid() {
  // EX cells for the two demonstrated lines.
  const colRight: [Cell, Cell, Cell] = [[0, 2], [1, 2], [2, 2]] // 2,8,16 → 2×8=16
  const diag: [Cell, Cell, Cell] = [[0, 2], [1, 1], [2, 0]] // 2,3,6 → 2×3=6 (anti-diagonal)
  const ovals = [colRight, diag].map((cells, k) => {
    const [r0, c0] = cells[0]
    const [r2, c2] = cells[2]
    const x1 = cx(c0)
    const y1 = cy(r0)
    const x2 = cx(c2)
    const y2 = cy(r2)
    const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
    const len = Math.hypot(x2 - x1, y2 - y1)
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    return <ellipse key={`exov${k}`} cx={mx} cy={my} rx={len / 2 + 22} ry={22} fill="none" stroke={INK} strokeWidth={2.4} transform={`rotate(${ang} ${mx} ${my})`} />
  })
  return (
    <svg viewBox={`0 0 ${SPAN} ${SPAN}`} width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 170 }} aria-hidden="true">
      {ovals}
      {EX_GRID.map((rowVals, r) =>
        rowVals.map((v, c) => (
          <text key={`ex${r}-${c}`} x={cx(c)} y={cy(r) + 1} textAnchor="middle" dominantBaseline="central" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={28} fontWeight={800} fill={INK}>
            {v}
          </text>
        )),
      )}
    </svg>
  )
}

export default function P23G3Q24Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-3 rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A 3 by 3 grid of numbers. Reading every row, column and the two diagonals, each line of three numbers is one group. Count how many lines are correct multiplications, where one number equals the product of the other two. An example grid shows two such lines."
    >
      <div className="flex w-full flex-col items-center gap-1">
        <span className="font-display text-xs font-bold text-qupu-muted">EX</span>
        <ExampleGrid />
      </div>
      <NumberGrid />
    </div>
  )
}
