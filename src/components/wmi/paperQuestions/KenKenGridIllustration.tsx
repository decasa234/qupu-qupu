// "Fill 1-4 so every row & column differs (KenKen-style)" figure for WMI-19F1-Q24.
// Reconstructed from the real figure (db/seed/wmi/figures/2019-final-g1-a-q24.jpg)
// by reading the thick cage walls edge-by-edge: a 4x4 grid carved into thick-outlined
// cages. Each cage's top-left corner shows a target with a +/- operator. The unique
// solution is rows 4231 / 2413 / 3142 / 1324 (row 0 top, col 0 left); every cage below
// is contiguous and its arithmetic is satisfied by that grid:
//   10+ : (0,0)+(1,0)+(1,1) = 4+2+4 = 10   (L-shape, top-left)
//   1-  : (0,1)+(0,2)       = 2,3  differ by 1
//   6+  : (1,2)+(1,3)+(2,3) = 1+3+2 = 6     (L-shape, upper-right)
//   2-  : (2,0)+(3,0)       = 3,1  differ by 2
//   3-  : (2,1)+(2,2)       = 1,4  differ by 3
//   6+  : (3,2)+(3,3)       = 2+4  = 6      (bottom-right pair)
// Two squares are single-cell givens: a 1 at (0,3) (top-right) and a 3 at (3,1)
// (bottom-middle). Together the cages tile all 16 cells exactly once.
// The four answer cells are marked A, B, C, D; the answer is ABCD = 2134.
//
// Grid coordinates: row 0 = top, col 0 = left.
//   A = (1,0), C = (1,3), B = (3,0), D = (3,3).
export const KK_N = 4

export const KK_VIEW = 360
const KK_PAD = 8
export const KK_CELL = (KK_VIEW - KK_PAD * 2) / KK_N

const px = (col: number) => KK_PAD + col * KK_CELL
const py = (row: number) => KK_PAD + row * KK_CELL
const cx = (col: number) => px(col) + KK_CELL / 2
const cy = (row: number) => py(row) + KK_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const GIVEN = '#6B7280'

/** Cage clue labels: which cell holds the label, and the printed text. */
const CAGE_CLUES: ReadonlyArray<{ row: number; col: number; text: string }> = [
  { row: 0, col: 0, text: '10+' },
  { row: 0, col: 1, text: '1−' },
  { row: 1, col: 2, text: '6+' },
  { row: 2, col: 0, text: '2−' },
  { row: 2, col: 1, text: '3−' },
  { row: 3, col: 2, text: '6+' },
]

/** Pre-filled squares shown in the original figure. */
const GIVENS: ReadonlyArray<{ row: number; col: number; value: number }> = [
  { row: 0, col: 3, value: 1 },
  { row: 3, col: 1, value: 3 },
]

/** The four answer cells, in ABCD order, with their solved digit. */
export const ANSWER_CELLS: ReadonlyArray<{ label: string; row: number; col: number; value: number }> = [
  { label: 'A', row: 1, col: 0, value: 2 },
  { label: 'B', row: 3, col: 0, value: 1 },
  { label: 'C', row: 1, col: 3, value: 3 },
  { label: 'D', row: 3, col: 3, value: 4 },
]

export const KK_ANSWER = ANSWER_CELLS.map((c) => c.value).join('') // "2134"

/**
 * The unique completed grid (row 0 top, col 0 left). Every row and column holds
 * 1–4 once, every cage's arithmetic is satisfied, and the givens / ABCD cells
 * agree with it (see the derivation in the file header).
 */
export const KK_SOLUTION: ReadonlyArray<ReadonlyArray<number>> = [
  [4, 2, 3, 1],
  [2, 4, 1, 3],
  [3, 1, 4, 2],
  [1, 3, 2, 4],
]

// Thick cage borders. We draw a heavy outline around each cage region (set of cells).
// 'T'=top, 'R'=right, 'B'=bottom, 'L'=left edge of that cell.
// Cages (matching the scan's thick walls; see derivation above):
//   10+ {(0,0),(1,0),(1,1)}  | 1- {(0,1),(0,2)}   | given-1 {(0,3)}
//   6+  {(1,2),(1,3),(2,3)}  | 2- {(2,0),(3,0)}   | 3- {(2,1),(2,2)}
//   given-3 {(3,1)}          | 6+ {(3,2),(3,3)}
type Side = 'T' | 'R' | 'B' | 'L'
const CAGES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 2]],
  [[0, 3]],
  [[1, 2], [1, 3], [2, 3]],
  [[2, 0], [3, 0]],
  [[2, 1], [2, 2]],
  [[3, 1]],
  [[3, 2], [3, 3]],
]

function cageEdges(cells: ReadonlyArray<[number, number]>): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`))
  const has = (r: number, c: number) => set.has(`${r},${c}`)
  const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  const sides: Side[] = ['T', 'R', 'B', 'L']
  for (const [r, c] of cells) {
    for (const s of sides) {
      const neighbour =
        s === 'T' ? [r - 1, c] : s === 'B' ? [r + 1, c] : s === 'L' ? [r, c - 1] : [r, c + 1]
      if (has(neighbour[0], neighbour[1])) continue // interior edge, skip
      const x0 = px(c)
      const y0 = py(r)
      if (s === 'T') segs.push({ x1: x0, y1: y0, x2: x0 + KK_CELL, y2: y0 })
      if (s === 'B') segs.push({ x1: x0, y1: y0 + KK_CELL, x2: x0 + KK_CELL, y2: y0 + KK_CELL })
      if (s === 'L') segs.push({ x1: x0, y1: y0, x2: x0, y2: y0 + KK_CELL })
      if (s === 'R') segs.push({ x1: x0 + KK_CELL, y1: y0, x2: x0 + KK_CELL, y2: y0 + KK_CELL })
    }
  }
  return segs
}

export interface KenKenFigureProps {
  /** How many top rows have their digits filled in (0..4). Givens always show. */
  filledRows?: number
  /** Row currently being filled — highlighted blue. */
  activeRow?: number | null
  /** Tint the four ABCD answer cells green and tag them A/B/C/D. */
  markAnswers?: boolean
}

const GIVEN_SET = new Set(GIVENS.map((g) => `${g.row},${g.col}`))
const GIVEN_VALUE = new Map(GIVENS.map((g) => [`${g.row},${g.col}`, g.value]))
const ANSWER_BY_CELL = new Map(ANSWER_CELLS.map((c) => [`${c.row},${c.col}`, c]))

export function KenKenFigure({ filledRows = 0, activeRow = null, markAnswers = false }: KenKenFigureProps) {
  const isShown = (r: number, c: number) => r < filledRows || GIVEN_SET.has(`${r},${c}`)

  return (
    <svg
      viewBox={`0 0 ${KK_VIEW} ${KK_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Thin grid cells, with active-row and answer-cell tints. */}
      {Array.from({ length: KK_N }).map((_, r) =>
        Array.from({ length: KK_N }).map((__, c) => {
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(`${r},${c}`)
          const isActive = activeRow === r
          const fill = isAnswer ? GREEN_FILL : isActive ? '#E1EFFB' : 'white'
          const stroke = isAnswer ? GREEN : isActive ? '#30598A' : '#CBD5E1'
          return (
            <rect
              key={`g-${r}-${c}`}
              x={px(c)}
              y={py(r)}
              width={KK_CELL}
              height={KK_CELL}
              fill={fill}
              stroke={stroke}
              strokeWidth={isAnswer ? 2.5 : isActive ? 2 : 1}
            />
          )
        }),
      )}

      {/* Heavy cage outlines. */}
      {CAGES.map((cells, ci) =>
        cageEdges(cells).map((seg, si) => (
          <line
            key={`cage-${ci}-${si}`}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="square"
          />
        )),
      )}

      {/* Cage clue labels (top-left of each cage). */}
      {CAGE_CLUES.map((clue, i) => (
        <text
          key={`clue-${i}`}
          x={px(clue.col) + 5}
          y={py(clue.row) + 5}
          textAnchor="start"
          dominantBaseline="hanging"
          className="font-display"
          fontSize={KK_CELL * 0.26}
          fontWeight={700}
          fill={INK}
        >
          {clue.text}
        </text>
      ))}

      {/* Cell digits: givens always; solved digits as their row fills. */}
      {Array.from({ length: KK_N }).map((_, r) =>
        Array.from({ length: KK_N }).map((__, c) => {
          if (!isShown(r, c)) return null
          const key = `${r},${c}`
          const value = GIVEN_VALUE.get(key) ?? KK_SOLUTION[r][c]
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(key)
          const isGiven = GIVEN_SET.has(key)
          return (
            <text
              key={`v-${r}-${c}`}
              x={cx(c)}
              y={cy(r)}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={KK_CELL * 0.5}
              fontWeight={isAnswer ? 900 : 800}
              fill={isAnswer ? '#065F46' : isGiven ? GIVEN : INK}
            >
              {value}
            </text>
          )
        }),
      )}

      {/* Faint A/B/C/D markers on answer cells that are not yet filled, so the
          unsolved puzzle still shows which cells form ABCD. */}
      {ANSWER_CELLS.filter((cell) => !isShown(cell.row, cell.col)).map((cell) => (
        <text
          key={`mark-${cell.label}`}
          x={cx(cell.col)}
          y={cy(cell.row)}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={KK_CELL * 0.34}
          fontWeight={700}
          fontStyle="italic"
          fill={GIVEN}
        >
          {cell.label}
        </text>
      ))}

      {/* ABCD tags in the answer cells once the grid is solved. */}
      {markAnswers &&
        ANSWER_CELLS.map((cell) => (
          <text
            key={`tag-${cell.label}`}
            x={px(cell.col) + KK_CELL - 5}
            y={py(cell.row) + KK_CELL - 4}
            textAnchor="end"
            className="font-display"
            fontSize={KK_CELL * 0.24}
            fontWeight={800}
            fill={GREEN}
          >
            {cell.label}
          </text>
        ))}
    </svg>
  )
}

export default function KenKenGridIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 4 by 4 grid. Fill each square with a number from 1 to 4 so every row and every column has all four different numbers. ` +
        `Thick-outlined cages show a target with + or - (for example "6+" means the numbers in that cage add to 6). ` +
        `The marked cells A, B, C, D give the 4-digit answer ABCD = ${KK_ANSWER}.`
      }
    >
      <KenKenFigure />
    </div>
  )
}
