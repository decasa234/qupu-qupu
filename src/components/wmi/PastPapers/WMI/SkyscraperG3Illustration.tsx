// "Skyscraper puzzle" figure for WMI-19F3A-Q25, reconstructed from
// db/seed/wmi/figures/2019-final-g3-a-q25.jpg: a 4x4 grid; fill 1–4 so every
// row/column has all four heights; an outside number says how many buildings
// are VISIBLE from that side (taller hides shorter). Clues: top 3 above col 2;
// left 3 at rows 0 and 2; right 3 at row 3; bottom 2 below cols 0 and 2;
// given height 3 at the bottom-left cell. A backtracking check confirms the
// unique solution (row 0 top, col 0 left):
//   2 3 1 4
//   4 1 3 2   ← the A B C D row
//   1 2 4 3
//   3 4 2 1
// so ABCD = 4132.
export const SK_N = 4

const CELL = 64
const MARGIN = 40
export const SK_VIEW = SK_N * CELL + MARGIN * 2

const px = (col: number) => MARGIN + col * CELL
const py = (row: number) => MARGIN + row * CELL
const cx = (col: number) => px(col) + CELL / 2
const cy = (row: number) => py(row) + CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const GIVEN = '#6B7280'
const AMBER = '#D97706'

export interface SkClue {
  id: string
  side: 'top' | 'bottom' | 'left' | 'right'
  index: number
  value: number
}

export const SK_CLUES: ReadonlyArray<SkClue> = [
  { id: 'top2', side: 'top', index: 2, value: 3 },
  { id: 'left0', side: 'left', index: 0, value: 3 },
  { id: 'left2', side: 'left', index: 2, value: 3 },
  { id: 'right3', side: 'right', index: 3, value: 3 },
  { id: 'bottom0', side: 'bottom', index: 0, value: 2 },
  { id: 'bottom2', side: 'bottom', index: 2, value: 2 },
]

export const SK_GIVEN = { row: 3, col: 0, value: 3 }

export const SK_SOLUTION: ReadonlyArray<ReadonlyArray<number>> = [
  [2, 3, 1, 4],
  [4, 1, 3, 2],
  [1, 2, 4, 3],
  [3, 4, 2, 1],
]

export const SK_ANSWER_CELLS: ReadonlyArray<{ label: string; row: number; col: number; value: number }> = [
  { label: 'A', row: 1, col: 0, value: 4 },
  { label: 'B', row: 1, col: 1, value: 1 },
  { label: 'C', row: 1, col: 2, value: 3 },
  { label: 'D', row: 1, col: 3, value: 2 },
]

export const SK_ANSWER = SK_ANSWER_CELLS.map((c) => c.value).join('') // "4132"

const ANSWER_BY_CELL = new Map(SK_ANSWER_CELLS.map((c) => [`${c.row},${c.col}`, c]))

function cluePos(clue: SkClue): { x: number; y: number; ax1: number; ay1: number; ax2: number; ay2: number } {
  if (clue.side === 'top') {
    const x = cx(clue.index)
    return { x, y: MARGIN - 24, ax1: x, ay1: MARGIN - 14, ax2: x, ay2: MARGIN - 4 }
  }
  if (clue.side === 'bottom') {
    const x = cx(clue.index)
    const yb = MARGIN + SK_N * CELL
    return { x, y: yb + 30, ax1: x, ay1: yb + 14, ax2: x, ay2: yb + 4 }
  }
  if (clue.side === 'left') {
    const y = cy(clue.index)
    return { x: MARGIN - 26, y: y + 5, ax1: MARGIN - 14, ay1: y, ax2: MARGIN - 4, ay2: y }
  }
  const xr = MARGIN + SK_N * CELL
  const y = cy(clue.index)
  return { x: xr + 26, y: y + 5, ax1: xr + 14, ay1: y, ax2: xr + 4, ay2: y }
}

export interface SkyscraperFigureProps {
  /** Cells solved so far: "row-col" -> height. The given 3 always shows. */
  solved?: Record<string, number>
  /** Cell keys deduced on this beat (green tint + bold border). */
  activeKeys?: string[]
  /** Cell keys the current deduction is "looking at" (amber dashed ring). */
  litKeys?: string[]
  /** Clue ids the current deduction uses (amber highlight). */
  litClues?: string[]
  /** Tint the ABCD row green and tag the letters. */
  markAnswers?: boolean
}

export function SkyscraperFigure({ solved = {}, activeKeys = [], litKeys = [], litClues = [], markAnswers = false }: SkyscraperFigureProps) {
  const activeSet = new Set(activeKeys)
  const litSet = new Set(litKeys)
  const litClueSet = new Set(litClues)
  const valueAt = (r: number, c: number) =>
    r === SK_GIVEN.row && c === SK_GIVEN.col ? SK_GIVEN.value : solved[`${r}-${c}`]

  return (
    <svg viewBox={`0 0 ${SK_VIEW} ${SK_VIEW}`} width="100%" style={{ maxWidth: 340, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Array.from({ length: SK_N }).map((_, r) =>
        Array.from({ length: SK_N }).map((__, c) => {
          const isAnswer = markAnswers && ANSWER_BY_CELL.has(`${r},${c}`)
          const isActive = activeSet.has(`${r}-${c}`)
          return (
            <rect
              key={`g-${r}-${c}`}
              x={px(c)}
              y={py(r)}
              width={CELL}
              height={CELL}
              fill={isAnswer || isActive ? GREEN_FILL : 'white'}
              stroke={INK}
              strokeWidth={1.5}
            />
          )
        }),
      )}

      {Array.from({ length: SK_N }).map((_, r) =>
        Array.from({ length: SK_N }).map((__, c) => {
          const key = `${r}-${c}`
          if (litSet.has(key)) {
            return <rect key={`lit-${key}`} x={px(c) + 4} y={py(r) + 4} width={CELL - 8} height={CELL - 8} rx={6} fill="none" stroke={AMBER} strokeWidth={2.5} strokeDasharray="6 4" />
          }
          if (activeSet.has(key)) {
            return <rect key={`act-${key}`} x={px(c) + 2} y={py(r) + 2} width={CELL - 4} height={CELL - 4} rx={3} fill="none" stroke={GREEN} strokeWidth={3.5} />
          }
          return null
        }),
      )}

      {/* Outside clues with sight-line arrows. */}
      {SK_CLUES.map((clue) => {
        const p = cluePos(clue)
        const hot = litClueSet.has(clue.id)
        return (
          <g key={clue.id}>
            <text x={p.x} y={p.y} textAnchor="middle" className="font-display" fontSize={20} fontWeight={900} fill={hot ? AMBER : INK}>
              {clue.value}
            </text>
            <line x1={p.ax1} y1={p.ay1} x2={p.ax2} y2={p.ay2} stroke={hot ? AMBER : '#94A3B8'} strokeWidth={hot ? 3 : 2} markerEnd="url(#skArrow)" />
          </g>
        )
      })}
      <defs>
        <marker id="skArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#94A3B8" />
        </marker>
      </defs>

      {/* Heights: the given (grey) plus deduced digits. */}
      {Array.from({ length: SK_N }).map((_, r) =>
        Array.from({ length: SK_N }).map((__, c) => {
          const value = valueAt(r, c)
          if (value === undefined) return null
          const isGiven = r === SK_GIVEN.row && c === SK_GIVEN.col
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
              fontSize={CELL * 0.46}
              fontWeight={isAnswer || isActive ? 900 : 800}
              fill={isActive ? GREEN : isAnswer ? '#065F46' : isGiven ? GIVEN : INK}
            >
              {value}
            </text>
          )
        }),
      )}

      {/* Faint A/B/C/D markers on unfilled answer cells. */}
      {SK_ANSWER_CELLS.filter((cell) => solved[`${cell.row}-${cell.col}`] === undefined).map((cell) => (
        <text key={`mark-${cell.label}`} x={cx(cell.col)} y={cy(cell.row)} textAnchor="middle" dominantBaseline="central" className="font-display" fontSize={CELL * 0.34} fontWeight={700} fontStyle="italic" fill={GIVEN}>
          {cell.label}
        </text>
      ))}

      {markAnswers &&
        SK_ANSWER_CELLS.map((cell) => (
          <text key={`tag-${cell.label}`} x={px(cell.col) + CELL - 5} y={py(cell.row) + CELL - 4} textAnchor="end" className="font-display" fontSize={CELL * 0.24} fontWeight={800} fill={GREEN}>
            {cell.label}
          </text>
        ))}
    </svg>
  )
}

export default function SkyscraperG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 4 by 4 skyscraper puzzle: fill heights 1 to 4 so every row and column has all four. ` +
        `Each outside number says how many buildings are visible from that side (taller buildings hide shorter ones). ` +
        `One height 3 is given in the bottom-left. The cells A, B, C, D give the answer ABCD = ${SK_ANSWER}.`
      }
    >
      <SkyscraperFigure />
    </div>
  )
}
