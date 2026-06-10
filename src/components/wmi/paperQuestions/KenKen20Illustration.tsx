// KenKen-style 1–4 grid for WMI-20F1A-Q24.
// Reconstructed from db/seed/wmi/figures/2020-final-g1-a-q24.jpg. The cage walls
// read edge-by-edge give the partition below; a brute force over all 4×4 Latin
// squares confirms it is the UNIQUE configuration whose single solution matches
// the answer key ABCD = 1222:
//   1− {(0,0),(1,0)} | 1− {(0,1),(0,2)} | given 1 at (0,3)
//   6+ {(1,1),(1,2),(2,1)} | 10+ {(1,3),(2,2),(2,3)} (label printed at (2,2))
//   1− {(2,0),(3,0)} | 6+ {(3,1),(3,2),(3,3)}
// Unique solution (row 0 top, col 0 left): 2431 / 1324 / 3142 / 4213.
// Answer cells: A = (1,0) = 1, B = (3,1) = 2, C = (1,2) = 2, D = (2,3) = 2.
export const KK20_N = 4

export const KK20_VIEW = 360
const PAD = 8
export const KK20_CELL = (KK20_VIEW - PAD * 2) / KK20_N

const px = (col: number) => PAD + col * KK20_CELL
const py = (row: number) => PAD + row * KK20_CELL
const cx = (col: number) => px(col) + KK20_CELL / 2
const cy = (row: number) => py(row) + KK20_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const GIVEN = '#6B7280'
const AMBER = '#D97706'

const CAGE_CLUES: ReadonlyArray<{ row: number; col: number; text: string }> = [
  { row: 0, col: 0, text: '1−' },
  { row: 0, col: 1, text: '1−' },
  { row: 1, col: 1, text: '6+' },
  { row: 2, col: 2, text: '10+' },
  { row: 2, col: 0, text: '1−' },
  { row: 3, col: 1, text: '6+' },
]

const GIVENS: ReadonlyArray<{ row: number; col: number; value: number }> = [{ row: 0, col: 3, value: 1 }]

export const KK20_ANSWER_CELLS: ReadonlyArray<{ label: string; row: number; col: number; value: number }> = [
  { label: 'A', row: 1, col: 0, value: 1 },
  { label: 'B', row: 3, col: 1, value: 2 },
  { label: 'C', row: 1, col: 2, value: 2 },
  { label: 'D', row: 2, col: 3, value: 2 },
]

export const KK20_ANSWER = KK20_ANSWER_CELLS.map((c) => c.value).join('') // "1222"

export const KK20_SOLUTION: ReadonlyArray<ReadonlyArray<number>> = [
  [2, 4, 3, 1],
  [1, 3, 2, 4],
  [3, 1, 4, 2],
  [4, 2, 1, 3],
]

const CAGES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 0], [1, 0]],
  [[0, 1], [0, 2]],
  [[0, 3]],
  [[1, 1], [1, 2], [2, 1]],
  [[1, 3], [2, 2], [2, 3]],
  [[2, 0], [3, 0]],
  [[3, 1], [3, 2], [3, 3]],
]

function cageEdges(cells: ReadonlyArray<[number, number]>): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`))
  const has = (r: number, c: number) => set.has(`${r},${c}`)
  const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  for (const [r, c] of cells) {
    const x0 = px(c)
    const y0 = py(r)
    if (!has(r - 1, c)) segs.push({ x1: x0, y1: y0, x2: x0 + KK20_CELL, y2: y0 })
    if (!has(r + 1, c)) segs.push({ x1: x0, y1: y0 + KK20_CELL, x2: x0 + KK20_CELL, y2: y0 + KK20_CELL })
    if (!has(r, c - 1)) segs.push({ x1: x0, y1: y0, x2: x0, y2: y0 + KK20_CELL })
    if (!has(r, c + 1)) segs.push({ x1: x0 + KK20_CELL, y1: y0, x2: x0 + KK20_CELL, y2: y0 + KK20_CELL })
  }
  return segs
}

const GIVEN_SET = new Set(GIVENS.map((g) => `${g.row},${g.col}`))
const GIVEN_VALUE = new Map(GIVENS.map((g) => [`${g.row},${g.col}`, g.value]))
const ANSWER_BY_CELL = new Map(KK20_ANSWER_CELLS.map((c) => [`${c.row},${c.col}`, c]))

export interface KenKen20FigureProps {
  /** Cells solved so far: "row-col" -> digit. Givens always show. */
  solved?: Record<string, number>
  /** Cell keys deduced on this beat (green tint + bold border). */
  activeKeys?: string[]
  /** Cell keys the current deduction is "looking at" (amber dashed ring). */
  litKeys?: string[]
  /** Tint the four ABCD answer cells green and tag them A/B/C/D. */
  markAnswers?: boolean
}

export function KenKen20Figure({ solved = {}, activeKeys = [], litKeys = [], markAnswers = false }: KenKen20FigureProps) {
  const activeSet = new Set(activeKeys)
  const litSet = new Set(litKeys)
  const isShown = (r: number, c: number) => solved[`${r}-${c}`] !== undefined || GIVEN_SET.has(`${r},${c}`)

  return (
    <svg
      viewBox={`0 0 ${KK20_VIEW} ${KK20_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Array.from({ length: KK20_N }).map((_, r) =>
        Array.from({ length: KK20_N }).map((__, c) => {
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(`${r},${c}`)
          const isActive = activeSet.has(`${r}-${c}`)
          return (
            <rect
              key={`g-${r}-${c}`}
              x={px(c)}
              y={py(r)}
              width={KK20_CELL}
              height={KK20_CELL}
              fill={isAnswer || isActive ? GREEN_FILL : 'white'}
              stroke="#CBD5E1"
              strokeWidth={1}
            />
          )
        }),
      )}

      {CAGES.map((cells, ci) =>
        cageEdges(cells).map((seg, si) => (
          <line key={`cage-${ci}-${si}`} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke={INK} strokeWidth={3} strokeLinecap="square" />
        )),
      )}

      {Array.from({ length: KK20_N }).map((_, r) =>
        Array.from({ length: KK20_N }).map((__, c) => {
          const key = `${r}-${c}`
          if (litSet.has(key)) {
            return (
              <rect
                key={`lit-${key}`}
                x={px(c) + 4}
                y={py(r) + 4}
                width={KK20_CELL - 8}
                height={KK20_CELL - 8}
                rx={6}
                fill="none"
                stroke={AMBER}
                strokeWidth={2.5}
                strokeDasharray="6 4"
              />
            )
          }
          if (activeSet.has(key)) {
            return (
              <rect
                key={`act-${key}`}
                x={px(c) + 2}
                y={py(r) + 2}
                width={KK20_CELL - 4}
                height={KK20_CELL - 4}
                rx={3}
                fill="none"
                stroke={GREEN}
                strokeWidth={3.5}
              />
            )
          }
          return null
        }),
      )}

      {CAGE_CLUES.map((clue, i) => (
        <text
          key={`clue-${i}`}
          x={px(clue.col) + 5}
          y={py(clue.row) + 5}
          textAnchor="start"
          dominantBaseline="hanging"
          className="font-display"
          fontSize={KK20_CELL * 0.26}
          fontWeight={700}
          fill={INK}
        >
          {clue.text}
        </text>
      ))}

      {Array.from({ length: KK20_N }).map((_, r) =>
        Array.from({ length: KK20_N }).map((__, c) => {
          if (!isShown(r, c)) return null
          const key = `${r},${c}`
          const value = GIVEN_VALUE.get(key) ?? solved[`${r}-${c}`]
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(key)
          const isActive = activeSet.has(`${r}-${c}`)
          const isGiven = GIVEN_SET.has(key)
          return (
            <text
              key={`v-${r}-${c}`}
              x={cx(c)}
              y={cy(r)}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={KK20_CELL * 0.5}
              fontWeight={isAnswer || isActive ? 900 : 800}
              fill={isActive ? GREEN : isAnswer ? '#065F46' : isGiven ? GIVEN : INK}
            >
              {value}
            </text>
          )
        }),
      )}

      {KK20_ANSWER_CELLS.filter((cell) => !isShown(cell.row, cell.col)).map((cell) => (
        <text
          key={`mark-${cell.label}`}
          x={cx(cell.col)}
          y={cy(cell.row)}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={KK20_CELL * 0.34}
          fontWeight={700}
          fontStyle="italic"
          fill={GIVEN}
        >
          {cell.label}
        </text>
      ))}

      {markAnswers &&
        KK20_ANSWER_CELLS.map((cell) => (
          <text
            key={`tag-${cell.label}`}
            x={px(cell.col) + KK20_CELL - 5}
            y={py(cell.row) + KK20_CELL - 4}
            textAnchor="end"
            className="font-display"
            fontSize={KK20_CELL * 0.24}
            fontWeight={800}
            fill={GREEN}
          >
            {cell.label}
          </text>
        ))}
    </svg>
  )
}

export default function KenKen20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 4 by 4 grid. Fill each square with a number from 1 to 4 so every row and every column has all four different numbers. ` +
        `Thick-outlined cages show a target with + or − (for example "6+" means the numbers in that cage add to 6); a 1 is given in the top-right corner. ` +
        `The marked cells A, B, C, D give the 4-digit answer ABCD = ${KK20_ANSWER}.`
      }
    >
      <KenKen20Figure />
    </div>
  )
}
