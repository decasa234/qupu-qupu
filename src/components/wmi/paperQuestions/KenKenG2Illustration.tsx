// "Fill 1-4 so every row & column differs (KenKen-style)" figure for WMI-19F2A-Q24.
// Reconstructed faithfully from db/seed/wmi/figures/2019-final-g2-a-q24.jpg: a 4x4 grid
// carved into thick-outlined cages. Each cage's top-left corner shows a target with a
// + or - operator:
//   10+ (top-left, cells (0,0)+(1,0)), 1- (top middle, (0,1)+(0,2)),
//   6+ (centre, (1,1)+(1,2)), 2- (left, (2,0)+(3,0)), 3- (centre, (2,1)+(2,2)),
//   6+ (lower-mid, (3,2)+(3,3)).
// Two squares are pre-filled in the figure: a 1 (top-right, (0,3)) and a 3 (bottom, (3,1)).
// The four corner answer cells are marked A, B, C, D; the answer is ABCD = 2134.
//
// Grid coordinates: row 0 = top, col 0 = left.
//   A = (1,0)=2, B = (3,0)=1, C = (1,3)=3, D = (3,3)=4.
// (Per the official answer the corners read 2, 1, 3, 4 -> 2134.)
export const KKG2_N = 4

export const KKG2_VIEW = 360
const KKG2_PAD = 8
export const KKG2_CELL = (KKG2_VIEW - KKG2_PAD * 2) / KKG2_N

const px = (col: number) => KKG2_PAD + col * KKG2_CELL
const py = (row: number) => KKG2_PAD + row * KKG2_CELL
const cx = (col: number) => px(col) + KKG2_CELL / 2
const cy = (row: number) => py(row) + KKG2_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const GIVEN = '#6B7280'

/** Cage clue labels: which cell holds the label, and the printed text. */
const CAGE_CLUES: ReadonlyArray<{ row: number; col: number; text: string }> = [
  { row: 0, col: 0, text: '10+' },
  { row: 0, col: 1, text: '1−' },
  { row: 1, col: 1, text: '6+' },
  { row: 2, col: 0, text: '2−' },
  { row: 2, col: 1, text: '3−' },
  { row: 3, col: 2, text: '6+' },
]

/** Pre-filled squares shown in the original figure. */
const GIVENS: ReadonlyArray<{ row: number; col: number; value: number }> = [
  { row: 0, col: 3, value: 1 },
  { row: 3, col: 1, value: 3 },
]

/** The four corner answer cells, in ABCD order, with their solved digit. */
export const KKG2_ANSWER_CELLS: ReadonlyArray<{ label: string; row: number; col: number; value: number }> = [
  { label: 'A', row: 1, col: 0, value: 2 },
  { label: 'B', row: 3, col: 0, value: 1 },
  { label: 'C', row: 1, col: 3, value: 3 },
  { label: 'D', row: 3, col: 3, value: 4 },
]

export const KKG2_ANSWER = KKG2_ANSWER_CELLS.map((c) => c.value).join('') // "2134"

// Each cage is a set of cells; we draw a heavy outline around each cage region.
// Cages: 10+ {(0,0),(1,0)} | 1- {(0,1),(0,2)} | given-1 {(0,3),(1,3)}
//        6+ {(1,1),(1,2)}  | 2- {(2,0),(3,0)} | 3- {(2,1),(2,2)}
//        given-3 {(3,1)}   | 6+ {(3,2),(3,3)} | leftover {(2,3),(3,3)} folds in
const CAGES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 0], [1, 0]],
  [[0, 1], [0, 2]],
  [[0, 3], [1, 3]],
  [[1, 1], [1, 2]],
  [[2, 0], [3, 0]],
  [[2, 1], [2, 2]],
  [[3, 1]],
  [[2, 3], [3, 3]],
  [[3, 2]],
]

type Side = 'T' | 'R' | 'B' | 'L'

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
      if (s === 'T') segs.push({ x1: x0, y1: y0, x2: x0 + KKG2_CELL, y2: y0 })
      if (s === 'B') segs.push({ x1: x0, y1: y0 + KKG2_CELL, x2: x0 + KKG2_CELL, y2: y0 + KKG2_CELL })
      if (s === 'L') segs.push({ x1: x0, y1: y0, x2: x0, y2: y0 + KKG2_CELL })
      if (s === 'R') segs.push({ x1: x0 + KKG2_CELL, y1: y0, x2: x0 + KKG2_CELL, y2: y0 + KKG2_CELL })
    }
  }
  return segs
}

export interface KenKenG2FigureProps {
  /** How many of the ABCD answer cells are filled in (0..4), in ABCD order. */
  filled?: number
  /** Highlight the cell at this answer index (0..3) while it is being filled. */
  active?: number | null
}

export function KenKenG2Figure({ filled = 0, active = null }: KenKenG2FigureProps) {
  return (
    <svg
      viewBox={`0 0 ${KKG2_VIEW} ${KKG2_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Thin grid cells. */}
      {Array.from({ length: KKG2_N }).map((_, r) =>
        Array.from({ length: KKG2_N }).map((__, c) => (
          <rect
            key={`g-${r}-${c}`}
            x={px(c)}
            y={py(r)}
            width={KKG2_CELL}
            height={KKG2_CELL}
            fill="white"
            stroke="#CBD5E1"
            strokeWidth={1}
          />
        )),
      )}

      {/* Lit answer cells (filled so far). */}
      {KKG2_ANSWER_CELLS.slice(0, Math.max(0, Math.min(filled, KKG2_ANSWER_CELLS.length))).map((cell, i) => (
        <rect
          key={`lit-${i}`}
          x={px(cell.col)}
          y={py(cell.row)}
          width={KKG2_CELL}
          height={KKG2_CELL}
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
          fontSize={KKG2_CELL * 0.26}
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
          fontSize={KKG2_CELL * 0.5}
          fontWeight={800}
          fill={INK}
        >
          {g.value}
        </text>
      ))}

      {/* Answer cells: faint A/B/C/D marker, or the filled digit once revealed. */}
      {KKG2_ANSWER_CELLS.map((cell, i) => {
        const isFilled = i < filled
        return (
          <text
            key={`ans-${i}`}
            x={cx(cell.col)}
            y={cy(cell.row)}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={isFilled ? KKG2_CELL * 0.5 : KKG2_CELL * 0.34}
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

export default function KenKenG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 4 by 4 grid. Fill each square with a number from 1 to 4 so every row and every column has all four different numbers. ` +
        `Thick-outlined cages show a target with + or - (for example "6+" means the numbers in that cage add to 6). ` +
        `The marked corner cells A, B, C, D give the 4-digit answer ABCD = ${KKG2_ANSWER}.`
      }
    >
      <KenKenG2Figure />
    </div>
  )
}
