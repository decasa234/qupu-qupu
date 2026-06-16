/**
 * P21G3Q25Illustration — WMI-21P3A-Q25 (2021 Grade 3 Semifinal, Paper A)
 *
 * A 4×4 KenKen-style Latin square (1..4, each number once per row & column). The
 * number+symbol in the top-left of each bold cage gives the result of combining
 * its cells (here every cage is a product, marked "×"); one cage is a single
 * given "2". Find A + B + C of the three marked cells.
 *
 * Cage walls, clue labels, the given, and the A/B/C cell positions were read
 * edge-by-edge from db/seed/wmi/figures/2021-semifinal-g3-a-q25.jpg (redrawn as
 * SVG; the jpg is NOT embedded):
 *
 *   8×  : {(0,0),(0,1),(0,2)}          A is the cell (0,1)
 *   36× : {(0,3),(1,2),(1,3)}
 *   2   : {(1,0)} (given)
 *   3×  : {(1,1),(2,1)}
 *   24× : {(2,0),(3,0),(3,1)}          B is the cell (2,0)
 *   8×  : {(2,2),(2,3),(3,2),(3,3)}    C is the cell (3,3)
 *
 * A backtracking solve over all 4×4 Latin squares gives a UNIQUE solution:
 *   1 4 2 3 / 2 1 3 4 / 4 3 1 2 / 3 2 4 1
 * so A=(0,1)=4, B=(2,0)=4, C=(3,3)=1 → A + B + C = 9 (answer C). The Latin rows
 * & columns and every cage product are re-checked in the SSR smoke.
 *
 * The static figure draws ONLY the problem (empty grid + cage clues + given +
 * A/B/C labels). It NEVER fills cells; that is the explainer's job.
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe & deterministic.
 */

export const Q25_N = 4
export const Q25_VIEW = 360
const PAD = 8
export const Q25_CELL = (Q25_VIEW - PAD * 2) / Q25_N

const px = (col: number) => PAD + col * Q25_CELL
const py = (row: number) => PAD + row * Q25_CELL
const cx = (col: number) => px(col) + Q25_CELL / 2
const cy = (row: number) => py(row) + Q25_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const GIVEN = '#6B7280'
const AMBER = '#D97706'

// ---------------------------------------------------------------------------
// Verified data
// ---------------------------------------------------------------------------

export const Q25_CAGES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 0], [0, 1], [0, 2]], // 8×
  [[0, 3], [1, 2], [1, 3]], // 36×
  [[1, 0]], // given 2
  [[1, 1], [2, 1]], // 3×
  [[2, 0], [3, 0], [3, 1]], // 24×
  [[2, 2], [2, 3], [3, 2], [3, 3]], // 8×
]

// Clue printed in the top-left cell of each cage (reading order of that cage).
const CAGE_CLUES: ReadonlyArray<{ row: number; col: number; text: string }> = [
  { row: 0, col: 0, text: '8×' },
  { row: 0, col: 3, text: '36×' },
  { row: 1, col: 1, text: '3×' },
  { row: 2, col: 0, text: '24×' },
  { row: 2, col: 2, text: '8×' },
]

const GIVENS: ReadonlyArray<{ row: number; col: number; value: number }> = [{ row: 1, col: 0, value: 2 }]

export const Q25_ANSWER_CELLS: ReadonlyArray<{ label: string; row: number; col: number; value: number }> = [
  { label: 'A', row: 0, col: 1, value: 4 },
  { label: 'B', row: 2, col: 0, value: 4 },
  { label: 'C', row: 3, col: 3, value: 1 },
]

export const Q25_SOLUTION: ReadonlyArray<ReadonlyArray<number>> = [
  [1, 4, 2, 3],
  [2, 1, 3, 4],
  [4, 3, 1, 2],
  [3, 2, 4, 1],
]

export const Q25_SUM = Q25_ANSWER_CELLS.reduce((s, c) => s + c.value, 0) // 9
export const Q25_ANSWER = 'C'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cageEdges(cells: ReadonlyArray<[number, number]>): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`))
  const has = (r: number, c: number) => set.has(`${r},${c}`)
  const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  for (const [r, c] of cells) {
    const x0 = px(c)
    const y0 = py(r)
    if (!has(r - 1, c)) segs.push({ x1: x0, y1: y0, x2: x0 + Q25_CELL, y2: y0 })
    if (!has(r + 1, c)) segs.push({ x1: x0, y1: y0 + Q25_CELL, x2: x0 + Q25_CELL, y2: y0 + Q25_CELL })
    if (!has(r, c - 1)) segs.push({ x1: x0, y1: y0, x2: x0, y2: y0 + Q25_CELL })
    if (!has(r, c + 1)) segs.push({ x1: x0 + Q25_CELL, y1: y0, x2: x0 + Q25_CELL, y2: y0 + Q25_CELL })
  }
  return segs
}

const GIVEN_SET = new Set(GIVENS.map((g) => `${g.row},${g.col}`))
const GIVEN_VALUE = new Map(GIVENS.map((g) => [`${g.row},${g.col}`, g.value]))
const ANSWER_BY_CELL = new Map(Q25_ANSWER_CELLS.map((c) => [`${c.row},${c.col}`, c]))

// ---------------------------------------------------------------------------
// KenKenP21G3Q25Figure — primitive shared with the explainer.
// ---------------------------------------------------------------------------

export interface KenKenP21G3Q25Props {
  /** Cells solved so far: "row-col" -> digit. Givens always show. */
  solved?: Record<string, number>
  /** Cell keys deduced on this beat (green tint + bold border). */
  activeKeys?: string[]
  /** Cell keys the current deduction is "looking at" (amber dashed ring). */
  litKeys?: string[]
  /** Tint the A/B/C answer cells green and tag them. */
  markAnswers?: boolean
}

export function KenKenP21G3Q25Figure({ solved = {}, activeKeys = [], litKeys = [], markAnswers = false }: KenKenP21G3Q25Props) {
  const activeSet = new Set(activeKeys)
  const litSet = new Set(litKeys)
  const isShown = (r: number, c: number) => solved[`${r}-${c}`] !== undefined || GIVEN_SET.has(`${r},${c}`)

  return (
    <svg
      viewBox={`0 0 ${Q25_VIEW} ${Q25_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Array.from({ length: Q25_N }).map((_, r) =>
        Array.from({ length: Q25_N }).map((__, c) => {
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(`${r},${c}`)
          const isActive = activeSet.has(`${r}-${c}`)
          return (
            <rect
              key={`g-${r}-${c}`}
              x={px(c)}
              y={py(r)}
              width={Q25_CELL}
              height={Q25_CELL}
              fill={isAnswer || isActive ? GREEN_FILL : 'white'}
              stroke="#CBD5E1"
              strokeWidth={1}
            />
          )
        }),
      )}

      {Q25_CAGES.map((cells, ci) =>
        cageEdges(cells).map((seg, si) => (
          <line key={`cage-${ci}-${si}`} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke={INK} strokeWidth={3} strokeLinecap="square" />
        )),
      )}

      {Array.from({ length: Q25_N }).map((_, r) =>
        Array.from({ length: Q25_N }).map((__, c) => {
          const key = `${r}-${c}`
          if (litSet.has(key)) {
            return (
              <rect
                key={`lit-${key}`}
                x={px(c) + 4}
                y={py(r) + 4}
                width={Q25_CELL - 8}
                height={Q25_CELL - 8}
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
                width={Q25_CELL - 4}
                height={Q25_CELL - 4}
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
          fontSize={Q25_CELL * 0.26}
          fontWeight={700}
          fill={INK}
        >
          {clue.text}
        </text>
      ))}

      {Array.from({ length: Q25_N }).map((_, r) =>
        Array.from({ length: Q25_N }).map((__, c) => {
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
              fontSize={Q25_CELL * 0.5}
              fontWeight={isAnswer || isActive ? 900 : 800}
              fill={isActive ? GREEN : isAnswer ? '#065F46' : isGiven ? GIVEN : INK}
            >
              {value}
            </text>
          )
        }),
      )}

      {Q25_ANSWER_CELLS.filter((cell) => !isShown(cell.row, cell.col)).map((cell) => (
        <text
          key={`mark-${cell.label}`}
          x={px(cell.col) + Q25_CELL - 6}
          y={py(cell.row) + Q25_CELL - 5}
          textAnchor="end"
          dominantBaseline="alphabetic"
          className="font-display"
          fontSize={Q25_CELL * 0.3}
          fontWeight={700}
          fontStyle="italic"
          fill={GIVEN}
        >
          {cell.label}
        </text>
      ))}

      {markAnswers &&
        Q25_ANSWER_CELLS.map((cell) => (
          <text
            key={`tag-${cell.label}`}
            x={px(cell.col) + Q25_CELL - 6}
            y={py(cell.row) + Q25_CELL - 5}
            textAnchor="end"
            dominantBaseline="alphabetic"
            className="font-display"
            fontSize={Q25_CELL * 0.26}
            fontWeight={800}
            fill={GREEN}
          >
            {cell.label}
          </text>
        ))}
    </svg>
  )
}

export default function P21G3Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 4 by 4 grid. Fill each square with a number from 1 to 4 so every row and column has all four different numbers. ` +
        `Thick-outlined cages show a product target, for example "8×" means the numbers in that cage multiply to 8; one cage has a given 2. ` +
        `Find the sum of the three marked cells A, B and C.`
      }
    >
      <KenKenP21G3Q25Figure />
    </div>
  )
}
