// "Fill 1-4 so every row & column differs (KenKen-style)" figure for WMI-19F1-Q24.
// Reconstructed from the real figure: a 4x4 grid carved into thick-outlined cages.
// Each cage's top-left corner shows a target and a +/- operator:
//   10+ (top-left 2 cells), 1- (top middle 2 cells), 6+ (centre 2 cells),
//   2- (left), 3- (a centre cell), 6+ (lower-middle 2 cells).
// Two squares are pre-filled in the figure: a 1 (top-right) and a 3 (bottom-middle).
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

// Thick cage borders: list of [row, col, side] edges that get a heavy stroke.
// 'T'=top, 'R'=right, 'B'=bottom, 'L'=left edge of that cell.
// Cages: 10+ {(0,0),(1,0)} | 1- {(0,1),(0,2)} | top-right {(0,3),(1,3)}
//        6+ {(1,1),(1,2)}  | 2- {(2,0),(3,0)}  | 3- {(2,1),(2,2)}
//        lower-mid 6+ {(3,1),(3,2)} | leftovers {(2,3),(3,3)}
type Side = 'T' | 'R' | 'B' | 'L'
// Each cage is a set of cells; we draw a heavy outline around each cage region.
const CAGES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 0], [1, 0]],
  [[0, 1], [0, 2]],
  [[0, 3], [1, 3]],
  [[1, 1], [1, 2]],
  [[2, 0], [3, 0]],
  [[2, 1], [2, 2]],
  [[3, 1], [3, 2]],
  [[2, 3], [3, 3]],
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
  /** How many of the ABCD answer cells are filled in (0..4), in ABCD order. */
  filled?: number
  /** Highlight the cell at this answer index (0..3) while it is being filled. */
  active?: number | null
}

export function KenKenFigure({ filled = 0, active = null }: KenKenFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${KK_VIEW} ${KK_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Thin grid cells. */}
      {Array.from({ length: KK_N }).map((_, r) =>
        Array.from({ length: KK_N }).map((__, c) => (
          <rect
            key={`g-${r}-${c}`}
            x={px(c)}
            y={py(r)}
            width={KK_CELL}
            height={KK_CELL}
            fill="white"
            stroke="#CBD5E1"
            strokeWidth={1}
          />
        )),
      )}

      {/* Lit answer cells (filled so far). */}
      {ANSWER_CELLS.slice(0, Math.max(0, Math.min(filled, ANSWER_CELLS.length))).map((cell, i) => (
        <rect
          key={`lit-${i}`}
          x={px(cell.col)}
          y={py(cell.row)}
          width={KK_CELL}
          height={KK_CELL}
          fill={GREEN_FILL}
          stroke={GREEN}
          strokeWidth={active === i ? 3.5 : 2.5}
        />
      ))}

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

      {/* Pre-filled given numbers. */}
      {GIVENS.map((g, i) => (
        <text
          key={`given-${i}`}
          x={cx(g.col)}
          y={cy(g.row)}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={KK_CELL * 0.5}
          fontWeight={800}
          fill={INK}
        >
          {g.value}
        </text>
      ))}

      {/* Answer cells: faint A/B/C/D marker, or the filled digit once revealed. */}
      {ANSWER_CELLS.map((cell, i) => {
        const isFilled = i < filled
        return (
          <text
            key={`ans-${i}`}
            x={cx(cell.col)}
            y={cy(cell.row)}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={isFilled ? KK_CELL * 0.5 : KK_CELL * 0.34}
            fontWeight={isFilled ? 900 : 700}
            fontStyle={isFilled ? 'normal' : 'italic'}
            fill={isFilled ? (active === i ? GREEN : INK) : GIVEN}
          >
            {isFilled ? cell.value : cell.label}
          </text>
        )
      })}
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
