// Robot-maze "smallest digit sum from entrance to exit" figure for
// WMI-24P1A-Q25 (2024 Semifinal Grade 1 Paper A).
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g1-a-q25.jpg: a 5-column ×
// 6-row lattice of numbered cells joined by rounded corridors. A robot enters
// at the TOP of column 0 (blue arrow) and must reach the EXIT at the BOTTOM of
// column 4 (red arrow). It may move only LEFT, RIGHT, or DOWN — never up. The
// task is the smallest possible sum of the digits along its route.
//
// Digit grid read from the scan (row 0 top → row 5 bottom, col 0 left → col 4):
//   row 0:  2 1 2 8 1
//   row 1:  4 2 5 7 1
//   row 2:  4 2 3 5 2
//   row 3:  4 6 6 2 1
//   row 4:  1 2 3 3 5
//   row 5:  7 9 1 3 2
//
// Solved deterministically (Bellman-Ford / brute force over all left/right/down
// routes — see commit notes): the UNIQUE minimum route is
//   (0,0)2 (0,1)1 (1,1)2 (2,1)2 (3,1)6 (4,1)2 (4,2)3 (5,2)1 (5,3)3 (5,4)2
//   = 2+1+2+2+6+2+3+1+3+2 = 24  → choice A (24).
// No legal route sums to less than 24 (so the "23" distractor is impossible).
//
// Pure render, SSR-safe & deterministic: no params, no random, no state. The
// stem draws ONLY the digit maze + the entrance/exit arrows — never the route.
// The explainer passes `litPath` to trace the cheapest route post-answer.

export const Q25_GRID: number[][] = [
  [2, 1, 2, 8, 1],
  [4, 2, 5, 7, 1],
  [4, 2, 3, 5, 2],
  [4, 6, 6, 2, 1],
  [1, 2, 3, 3, 5],
  [7, 9, 1, 3, 2],
]

export const Q25_COLS = 5
export const Q25_ROWS = 6

/** The verified unique minimum route, as [row, col] cells in order. */
export const Q25_MIN_PATH: ReadonlyArray<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [4, 2],
  [5, 2],
  [5, 3],
  [5, 4],
]

export const Q25_MIN_SUM = 24
export const Q25_ANSWER_LETTER = 'A' // choices: A=24 B=28 C=25 D=23 E=26

// --------------------------------------------------------------- layout ---

const CELL = 60 // node spacing
const PAD = 34 // headroom for the entrance / exit arrows
const NODE_R = 17 // radius of the rounded cell badge

const GRID_W = (Q25_COLS - 1) * CELL
const GRID_H = (Q25_ROWS - 1) * CELL
export const Q25_VIEW_W = GRID_W + PAD * 2
export const Q25_VIEW_H = GRID_H + PAD * 2

const nx = (c: number) => PAD + c * CELL
const ny = (r: number) => PAD + r * CELL

const CORRIDOR = '#BDBDBD'
const INK = '#2B2B2B'
const TRAIL = '#F59E0B'
const ENTRY = '#2196F3'
const EXIT = '#E53935'

/** A small arrowhead pointing down, centred horizontally at cx with its tip
 * at (cx, tipY). Used for the entrance (blue) and exit (red) markers. */
function DownArrow({ cx, tipY, color }: { cx: number; tipY: number; color: string }) {
  const w = 9
  const h = 18
  const top = tipY - h
  return (
    <g>
      <rect x={cx - 3} y={top} width={6} height={h - 7} fill={color} />
      <path d={`M ${cx - w} ${top + h - 9} L ${cx + w} ${top + h - 9} L ${cx} ${tipY} Z`} fill={color} />
    </g>
  )
}

export interface Q25MazeProps {
  /** Optional route to trace, as [row, col] cells; the stem leaves this null. */
  litPath?: ReadonlyArray<[number, number]> | null
  /** When tracing, how many cells of litPath are revealed so far (0..len). */
  litCount?: number
}

/**
 * The maze primitive: rounded corridors between adjacent cells, the digit
 * badges, the entrance / exit arrows, and (optionally) a highlighted route.
 * Shared by the stem and the explainer so the geometry can never drift.
 */
export function Q25RobotMaze({ litPath = null, litCount }: Q25MazeProps) {
  const shown = litPath ? (litCount ?? litPath.length) : 0
  const litSet = new Set<string>()
  const litPts: string[] = []
  if (litPath) {
    for (let i = 0; i < Math.min(shown, litPath.length); i++) {
      const [r, c] = litPath[i]
      litSet.add(`${r},${c}`)
      litPts.push(`${nx(c)},${ny(r)}`)
    }
  }

  return (
    <svg
      viewBox={`0 0 ${Q25_VIEW_W} ${Q25_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* corridors: horizontal links between neighbours in a row */}
      {Q25_GRID.map((row, r) =>
        row.map((_, c) =>
          c < Q25_COLS - 1 ? (
            <line
              key={`h${r}-${c}`}
              x1={nx(c)}
              y1={ny(r)}
              x2={nx(c + 1)}
              y2={ny(r)}
              stroke={CORRIDOR}
              strokeWidth={7}
              strokeLinecap="round"
            />
          ) : null,
        ),
      )}
      {/* corridors: vertical links between neighbours in a column */}
      {Q25_GRID.map((row, r) =>
        row.map((_, c) =>
          r < Q25_ROWS - 1 ? (
            <line
              key={`v${r}-${c}`}
              x1={nx(c)}
              y1={ny(r)}
              x2={nx(c)}
              y2={ny(r + 1)}
              stroke={CORRIDOR}
              strokeWidth={7}
              strokeLinecap="round"
            />
          ) : null,
        ),
      )}

      {/* optional traced route (explainer only) */}
      {litPts.length >= 2 && (
        <polyline
          points={litPts.join(' ')}
          fill="none"
          stroke={TRAIL}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
        />
      )}

      {/* entrance arrow (top of column 0) and exit arrow (bottom of column 4) */}
      <DownArrow cx={nx(0)} tipY={ny(0) - NODE_R - 2} color={ENTRY} />
      <DownArrow cx={nx(Q25_COLS - 1)} tipY={ny(Q25_ROWS - 1) + NODE_R + 20} color={EXIT} />

      {/* digit cells */}
      {Q25_GRID.map((row, r) =>
        row.map((d, c) => {
          const lit = litSet.has(`${r},${c}`)
          return (
            <g key={`n${r}-${c}`}>
              <circle
                cx={nx(c)}
                cy={ny(r)}
                r={NODE_R}
                fill={lit ? '#FFF1D6' : '#FFFFFF'}
                stroke={lit ? TRAIL : CORRIDOR}
                strokeWidth={lit ? 3 : 1.5}
              />
              <text
                x={nx(c)}
                y={ny(r)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight={800}
                fill={lit ? '#9a4a12' : INK}
              >
                {d}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}

export default function P24G1Q25Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A grid of numbered cells joined by corridors. A robot enters at the top-left and must reach the exit at the bottom-right, moving only left, right, or down. Find the smallest sum of the digits along its route."
    >
      <Q25RobotMaze />
    </div>
  )
}
