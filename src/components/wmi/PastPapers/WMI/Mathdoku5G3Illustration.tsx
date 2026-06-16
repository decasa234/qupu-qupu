// "Fill 1-5 so every row & column differs (mathdoku)" figure for WMI-19F3A-Q24.
// Reconstructed from db/seed/wmi/figures/2019-final-g3-a-q24.jpg by reading the
// cage walls: a 5x5 grid carved into 12 cages, each labelled target+operator.
// A backtracking check confirms the cages below admit exactly ONE 1–5 Latin
// square; that unique solution (row 0 top, col 0 left) is:
//   4 1 2 3 5
//   1 3 4 5 2
//   2 4 5 1 3
//   3 5 1 2 4
//   5 2 3 4 1
// Cage arithmetic against it:
//   5+ (0,0)(0,1)=4+1 | 1− (0,2)(0,3)=|2−3| | 10× (0,4)(1,4)=5×2
//   2÷ (1,0)(2,0)=2/1 | 12+ (1,1)(1,2)(1,3)=3+4+5 | 20× (2,1)(3,1)=4×5
//   4− (2,2)(3,2)=|5−1| | 4+ (2,3)(2,4)=1+3 | 15× (3,0)(4,0)=3×5
//   8× (3,3)(3,4)=2×4 | 5+ (4,1)(4,2)=2+3 | 3− (4,3)(4,4)=|4−1|
// Answer cells: A=(1,2), B=(3,1), C=(4,0), D=(4,3) → ABCD = 4554.
export const MD_N = 5

export const MD_VIEW = 380
const MD_PAD = 8
export const MD_CELL = (MD_VIEW - MD_PAD * 2) / MD_N

const px = (col: number) => MD_PAD + col * MD_CELL
const py = (row: number) => MD_PAD + row * MD_CELL
const cx = (col: number) => px(col) + MD_CELL / 2
const cy = (row: number) => py(row) + MD_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const GIVEN = '#6B7280'
const AMBER = '#D97706'

export interface MdCage {
  text: string
  cells: ReadonlyArray<[number, number]>
}

export const MD_CAGES: ReadonlyArray<MdCage> = [
  { text: '5+', cells: [[0, 0], [0, 1]] },
  { text: '1−', cells: [[0, 2], [0, 3]] },
  { text: '10×', cells: [[0, 4], [1, 4]] },
  { text: '2÷', cells: [[1, 0], [2, 0]] },
  { text: '12+', cells: [[1, 1], [1, 2], [1, 3]] },
  { text: '20×', cells: [[2, 1], [3, 1]] },
  { text: '4−', cells: [[2, 2], [3, 2]] },
  { text: '4+', cells: [[2, 3], [2, 4]] },
  { text: '15×', cells: [[3, 0], [4, 0]] },
  { text: '8×', cells: [[3, 3], [3, 4]] },
  { text: '5+', cells: [[4, 1], [4, 2]] },
  { text: '3−', cells: [[4, 3], [4, 4]] },
]

export const MD_SOLUTION: ReadonlyArray<ReadonlyArray<number>> = [
  [4, 1, 2, 3, 5],
  [1, 3, 4, 5, 2],
  [2, 4, 5, 1, 3],
  [3, 5, 1, 2, 4],
  [5, 2, 3, 4, 1],
]

export const MD_ANSWER_CELLS: ReadonlyArray<{ label: string; row: number; col: number; value: number }> = [
  { label: 'A', row: 1, col: 2, value: 4 },
  { label: 'B', row: 3, col: 1, value: 5 },
  { label: 'C', row: 4, col: 0, value: 5 },
  { label: 'D', row: 4, col: 3, value: 4 },
]

export const MD_ANSWER = MD_ANSWER_CELLS.map((c) => c.value).join('') // "4554"

function cageEdges(cells: ReadonlyArray<[number, number]>): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`))
  const has = (r: number, c: number) => set.has(`${r},${c}`)
  const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  for (const [r, c] of cells) {
    const x0 = px(c)
    const y0 = py(r)
    if (!has(r - 1, c)) segs.push({ x1: x0, y1: y0, x2: x0 + MD_CELL, y2: y0 })
    if (!has(r + 1, c)) segs.push({ x1: x0, y1: y0 + MD_CELL, x2: x0 + MD_CELL, y2: y0 + MD_CELL })
    if (!has(r, c - 1)) segs.push({ x1: x0, y1: y0, x2: x0, y2: y0 + MD_CELL })
    if (!has(r, c + 1)) segs.push({ x1: x0 + MD_CELL, y1: y0, x2: x0 + MD_CELL, y2: y0 + MD_CELL })
  }
  return segs
}

const ANSWER_BY_CELL = new Map(MD_ANSWER_CELLS.map((c) => [`${c.row},${c.col}`, c]))

export interface Mathdoku5FigureProps {
  /** Cells solved so far: "row-col" -> digit. */
  solved?: Record<string, number>
  /** Cell keys deduced on this beat (green tint + bold border). */
  activeKeys?: string[]
  /** Cell keys the current deduction is "looking at" (amber dashed ring). */
  litKeys?: string[]
  /** Tint the four ABCD answer cells green and tag them A/B/C/D. */
  markAnswers?: boolean
}

export function Mathdoku5Figure({ solved = {}, activeKeys = [], litKeys = [], markAnswers = false }: Mathdoku5FigureProps) {
  const activeSet = new Set(activeKeys)
  const litSet = new Set(litKeys)

  return (
    <svg viewBox={`0 0 ${MD_VIEW} ${MD_VIEW}`} width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Array.from({ length: MD_N }).map((_, r) =>
        Array.from({ length: MD_N }).map((__, c) => {
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(`${r},${c}`)
          const isActive = activeSet.has(`${r}-${c}`)
          return (
            <rect
              key={`g-${r}-${c}`}
              x={px(c)}
              y={py(r)}
              width={MD_CELL}
              height={MD_CELL}
              fill={isAnswer || isActive ? GREEN_FILL : 'white'}
              stroke="#CBD5E1"
              strokeWidth={1}
            />
          )
        }),
      )}

      {MD_CAGES.map((cage, ci) =>
        cageEdges(cage.cells).map((seg, si) => (
          <line key={`cage-${ci}-${si}`} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke={INK} strokeWidth={3} strokeLinecap="square" />
        )),
      )}

      {/* lit / active borders ON TOP of cage lines (inset). */}
      {Array.from({ length: MD_N }).map((_, r) =>
        Array.from({ length: MD_N }).map((__, c) => {
          const key = `${r}-${c}`
          if (litSet.has(key)) {
            return <rect key={`lit-${key}`} x={px(c) + 4} y={py(r) + 4} width={MD_CELL - 8} height={MD_CELL - 8} rx={6} fill="none" stroke={AMBER} strokeWidth={2.5} strokeDasharray="6 4" />
          }
          if (activeSet.has(key)) {
            return <rect key={`act-${key}`} x={px(c) + 2} y={py(r) + 2} width={MD_CELL - 4} height={MD_CELL - 4} rx={3} fill="none" stroke={GREEN} strokeWidth={3.5} />
          }
          return null
        }),
      )}

      {MD_CAGES.map((cage, i) => (
        <text
          key={`clue-${i}`}
          x={px(cage.cells[0][1]) + 4}
          y={py(cage.cells[0][0]) + 4}
          textAnchor="start"
          dominantBaseline="hanging"
          className="font-display"
          fontSize={MD_CELL * 0.26}
          fontWeight={700}
          fill={INK}
        >
          {cage.text}
        </text>
      ))}

      {Array.from({ length: MD_N }).map((_, r) =>
        Array.from({ length: MD_N }).map((__, c) => {
          const value = solved[`${r}-${c}`]
          if (value === undefined) return null
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(`${r},${c}`)
          const isActive = activeSet.has(`${r}-${c}`)
          return (
            <text
              key={`v-${r}-${c}`}
              x={cx(c)}
              y={cy(r)}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={MD_CELL * 0.46}
              fontWeight={isAnswer || isActive ? 900 : 800}
              fill={isActive ? GREEN : isAnswer ? '#065F46' : INK}
            >
              {value}
            </text>
          )
        }),
      )}

      {/* Faint A/B/C/D markers on unfilled answer cells. */}
      {MD_ANSWER_CELLS.filter((cell) => solved[`${cell.row}-${cell.col}`] === undefined).map((cell) => (
        <text key={`mark-${cell.label}`} x={cx(cell.col)} y={cy(cell.row)} textAnchor="middle" dominantBaseline="central" className="font-display" fontSize={MD_CELL * 0.34} fontWeight={700} fontStyle="italic" fill={GIVEN}>
          {cell.label}
        </text>
      ))}

      {markAnswers &&
        MD_ANSWER_CELLS.map((cell) => (
          <text key={`tag-${cell.label}`} x={px(cell.col) + MD_CELL - 5} y={py(cell.row) + MD_CELL - 4} textAnchor="end" className="font-display" fontSize={MD_CELL * 0.24} fontWeight={800} fill={GREEN}>
            {cell.label}
          </text>
        ))}
    </svg>
  )
}

export default function Mathdoku5G3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 5 by 5 grid. Fill each square with a number from 1 to 5 so every row and every column has all five different numbers. ` +
        `Thick-outlined cages show a target with +, −, × or ÷ (for example "12+" means the numbers in that cage add to 12). ` +
        `The marked cells A, B, C, D give the 4-digit answer ABCD = ${MD_ANSWER}.`
      }
    >
      <Mathdoku5Figure />
    </div>
  )
}
