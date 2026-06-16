// Number-grid arrow-move figure for WMI-19P1A-Q5 (2019 semifinal Grade 1, Paper A).
//
// Redrawn from db/seed/wmi/figures/2019-semifinal-g1-a-q5.jpg, which prints the
// worked example "92 → → ↑ ↑ ↑ → ↑ → 56". The puzzle lives on a 41–100 grid laid
// out in rows of ten (41–50, 51–60, …, 91–100). Each arrow is one step:
//   →  +1   (move right)
//   ←  −1   (move left)
//   ↑  −10  (move up a row)
//   ↓  +10  (move down a row)
//
// This static figure shows ONLY the problem: the 41–100 grid, the move legend,
// and the START cell 49 with the move sequence printed beneath. It does NOT mark
// the path or the landing cell — the explainer traces those.
//
// Basic glyphs only; SSR-safe and deterministic (no params, no window/document,
// no Math.random/Date.now).

export const GRID_MIN = 41
export const GRID_MAX = 100
export const COLS = 10
export const ROWS = 6 // 41–50, 51–60, …, 91–100

export const START = 49
// Move sequence for the queried path (the printed example uses a different one).
// ↓ ↓ ← ← ↓ ↓ → → ↓ → applied to 49:
//   49 +10=59 +10=69 −1=68 −1=67 +10=77 +10=87 +1=88 +1=89 +10=99 +1=100
export const MOVES: Array<'up' | 'down' | 'left' | 'right'> = [
  'down', 'down', 'left', 'left', 'down', 'down', 'right', 'right', 'down', 'right',
]

const DELTA: Record<'up' | 'down' | 'left' | 'right', number> = {
  up: -10,
  down: 10,
  left: -1,
  right: 1,
}

export const ARROW: Record<'up' | 'down' | 'left' | 'right', string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
}

/** Cell values after applying the first `n` moves to START. Index 0 = START. */
export function pathValues(): number[] {
  const out = [START]
  let v = START
  for (const m of MOVES) {
    v += DELTA[m]
    out.push(v)
  }
  return out
}

export const ANSWER = pathValues()[MOVES.length] // 100

const INK = '#1F2937'
const BLUE = '#30598A'

// Geometry.
const CELL = 38
const GRID_X = 16
const GRID_Y = 28
export const ARROWGRID_VIEW_W = GRID_X * 2 + COLS * CELL
export const ARROWGRID_VIEW_H = GRID_Y + ROWS * CELL + 76 // headroom for the move strip

/** 0-indexed (row, col) of a grid value, or null if off-grid. */
export function cellOf(value: number): { row: number; col: number } | null {
  if (value < GRID_MIN || value > GRID_MAX) return null
  const idx = value - GRID_MIN
  return { row: Math.floor(idx / COLS), col: idx % COLS }
}

function cellCenter(value: number): { x: number; y: number } | null {
  const rc = cellOf(value)
  if (!rc) return null
  return { x: GRID_X + rc.col * CELL + CELL / 2, y: GRID_Y + rc.row * CELL + CELL / 2 }
}

export interface ArrowGridDiagramProps {
  /** How many moves of the path to draw so far (0 = just START highlighted). */
  movesDone?: number
  /** Highlight the START cell. */
  showStart?: boolean
  /** Highlight the cell after `movesDone` moves as the current position. */
  showCurrent?: boolean
  /** Ring the final landing cell as the answer. */
  showLanding?: boolean
  /** Index (0..MOVES.length-1) of the move arrow to spotlight in the strip; null = none. */
  spotlightMove?: number | null
}

export function ArrowGridDiagram({
  movesDone = 0,
  showStart = false,
  showCurrent = false,
  showLanding = false,
  spotlightMove = null,
}: ArrowGridDiagramProps) {
  const path = pathValues()
  const visited = path.slice(0, movesDone + 1)
  const current = path[movesDone]

  // Build the drawn poly-line through the visited cell centres.
  const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  for (let i = 1; i < visited.length; i++) {
    const a = cellCenter(visited[i - 1])
    const b = cellCenter(visited[i])
    if (a && b) segs.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
  }

  const stripY = GRID_Y + ROWS * CELL + 30
  const stripX0 = GRID_X + 6
  const stripGap = 34

  return (
    <svg
      viewBox={`0 0 ${ARROWGRID_VIEW_W} ${ARROWGRID_VIEW_H}`}
      width="100%"
      style={{ maxWidth: ARROWGRID_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* grid cells */}
      {Array.from({ length: ROWS * COLS }, (_, idx) => {
        const value = GRID_MIN + idx
        const row = Math.floor(idx / COLS)
        const col = idx % COLS
        const x = GRID_X + col * CELL
        const y = GRID_Y + row * CELL
        const isStart = showStart && value === START
        const isCurrent = showCurrent && value === current && value !== START
        const isLanding = showLanding && value === ANSWER
        const fill = isLanding ? '#D1FAE5' : isCurrent ? '#FEF3C7' : isStart ? '#E1EFFB' : '#FFFFFF'
        const stroke = isLanding ? '#10B981' : isStart || isCurrent ? '#F59E0B' : '#CBD5E1'
        return (
          <g key={value}>
            <rect x={x} y={y} width={CELL} height={CELL} fill={fill} stroke={stroke} strokeWidth={isStart || isCurrent || isLanding ? 2.5 : 1} />
            <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={value === START || value === ANSWER ? 900 : 600} fill={INK}>
              {value}
            </text>
          </g>
        )
      })}

      {/* traced path poly-line */}
      {segs.map((s, i) => (
        <line key={`seg${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#2f6df0" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
      ))}

      {/* move strip beneath the grid */}
      {MOVES.map((m, i) => {
        const x = stripX0 + i * stripGap
        const on = spotlightMove === i
        const used = i < movesDone
        return (
          <g key={`mv${i}`}>
            {on && <circle cx={x} cy={stripY} r={15} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />}
            <text
              x={x}
              y={stripY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={22}
              fontWeight={900}
              fill={on ? '#92400E' : used ? '#2f6df0' : BLUE}
            >
              {ARROW[m]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ArrowGrid19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 41 to 100 number grid in rows of ten. Start at 49 and follow the arrow moves below: right adds 1, left subtracts 1, up subtracts 10, down adds 10."
    >
      <ArrowGridDiagram showStart />
    </div>
  )
}
