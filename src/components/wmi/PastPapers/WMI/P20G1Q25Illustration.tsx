// Consecutive-path counting grid for WMI-20P1A-Q25 (2020 Grade 1 Semifinal).
//
// Source figure (db/seed/wmi/figures/2020-semifinal-g1-a-q25.jpg): a 6×4 number
// grid. You count 1,2,3,…,10 by stepping to an orthogonally adjacent cell whose
// number is one larger. The left copy shows ONE example path (drawn here too,
// since it is part of the problem). The question asks how many OTHER ways exist.
//
// All consecutive paths 1→10 (DP, counting ways to reach each cell):
//   total = 8, so OTHER ways = 7  → answer B.
//
// The static figure shows ONLY the problem (the example path + the empty grid);
// the count of ways is never shown.

const INK = '#1F2937'
const RULE = '#94A3B8'
const PATH = '#1F2937'

export const Q25_GRID: number[][] = [
  [1, 2, 3, 4],
  [2, 3, 6, 5],
  [4, 4, 7, 6],
  [6, 5, 8, 7],
  [7, 8, 9, 8],
  [5, 9, 10, 6],
]

export const Q25_ROWS = Q25_GRID.length
export const Q25_COLS = Q25_GRID[0].length
export const Q25_TOTAL_WAYS = 8
export const Q25_OTHER_WAYS = Q25_TOTAL_WAYS - 1 // 7, answer B

// The example path drawn in the figure: list of [row, col] for values 1..10.
export const Q25_EXAMPLE_PATH: Array<[number, number]> = [
  [0, 0], // 1
  [1, 0], // 2
  [1, 1], // 3
  [2, 1], // 4
  [3, 1], // 5
  [3, 0], // 6
  [4, 0], // 7
  [4, 1], // 8
  [5, 1], // 9
  [5, 2], // 10
]

const CELL = 46
const PAD = 16

export const Q25_VIEW_W = Q25_COLS * CELL + PAD * 2
export const Q25_VIEW_H = Q25_ROWS * CELL + PAD * 2

const cx = (c: number) => PAD + c * CELL + CELL / 2
const cy = (r: number) => PAD + r * CELL + CELL / 2

export interface Q25DiagramProps {
  /** Draw the example path through the grid. */
  showExamplePath?: boolean
  /** Optional per-cell badge of "ways to reach" (keyed "r,c"). */
  waysBadges?: Record<string, number>
  /** Cells to tint as the current frontier (keyed "r,c"). */
  litCells?: Record<string, boolean>
}

export function Q25Diagram({ showExamplePath = false, waysBadges, litCells }: Q25DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${Q25_VIEW_W} ${Q25_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* cells */}
      {Q25_GRID.map((row, r) =>
        row.map((val, c) => {
          const lit = litCells?.[`${r},${c}`]
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={PAD + c * CELL}
                y={PAD + r * CELL}
                width={CELL}
                height={CELL}
                fill={lit ? '#DBEAFE' : '#FFFFFF'}
                stroke={RULE}
                strokeWidth={1.6}
              />
              <text
                x={cx(c)}
                y={cy(r)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight={800}
                fill={lit ? '#1d4ed8' : INK}
              >
                {val}
              </text>
              {waysBadges && waysBadges[`${r},${c}`] !== undefined && (
                <g>
                  <circle cx={PAD + c * CELL + CELL - 11} cy={PAD + r * CELL + 11} r={9} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={1.6} />
                  <text
                    x={PAD + c * CELL + CELL - 11}
                    y={PAD + r * CELL + 11}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={900}
                    fill="#92400E"
                  >
                    {waysBadges[`${r},${c}`]}
                  </text>
                </g>
              )}
            </g>
          )
        }),
      )}

      {/* example path */}
      {showExamplePath && (
        <polyline
          points={Q25_EXAMPLE_PATH.map(([r, c]) => `${cx(c)},${cy(r)}`).join(' ')}
          fill="none"
          stroke={PATH}
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.85}
        />
      )}
    </svg>
  )
}

export default function P20G1Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 6 by 4 number grid. Count from 1 to 10 by stepping to a neighbouring cell that is one larger. One example path is drawn; the question asks how many other paths exist."
    >
      <Q25Diagram showExamplePath />
    </div>
  )
}
