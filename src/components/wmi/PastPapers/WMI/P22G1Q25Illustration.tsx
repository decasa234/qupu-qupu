// Number-grid tromino-packing figure for WMI-22P1A-Q25
// (2022 WMI Semifinal Grade 1 Paper A, question 25).
//
// Redrawn from db/seed/wmi/figures/2022-semifinal-g1-a-q25.jpg (NOT embedded).
// The scan is the legend of the six shapes a "group of three consecutive
// (adjacent) squares" can take: the two straight trominoes (I horizontal, I
// vertical) and the four L-tromino rotations. The 8×8 number grid comes from the
// question text. Goal: circle as many groups of three adjacent squares summing
// to 16 as possible, each square used at most once. "At most how many groups can
// exist at the same time?"
//
// The 8×8 grid (row 0 = top):
//   3 9 1 5 2 9 1 5
//   4 6 4 6 4 8 2 3
//   2 1 6 6 2 9 9 4
//   6 3 5 1 7 5 9 3
//   8 3 8 8 4 4 2 8
//   3 1 6 4 2 8 4 6
//   2 7 7 7 5 6 1 6
//   2 5 2 6 3 2 5 7
//
// Verified by exhaustive search: there are 34 distinct trominoes (over all 6
// shapes) summing to 16, and the MAXIMUM number that can be placed at once
// without overlap is 13 (answer D). VERIFIED_PACKING below is a concrete optimal
// packing of 13 disjoint groups, emitted directly by a branch-and-bound
// maximum-disjoint-set solver — every group's three numbers add to 16 and no
// cell is reused.
//
// This stem draws ONLY the problem: the grid of numbers plus the six-shape
// legend. The shared `NumberGrid25` primitive accepts `groups` so the explainer
// can light up the verified packing after the answer is revealed.

export type Cell = [number, number] // [row, col], 0-indexed, row 0 = top

export const GRID_N = 8

/** The 8×8 number grid (row-major, row 0 = top). */
export const GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [3, 9, 1, 5, 2, 9, 1, 5],
  [4, 6, 4, 6, 4, 8, 2, 3],
  [2, 1, 6, 6, 2, 9, 9, 4],
  [6, 3, 5, 1, 7, 5, 9, 3],
  [8, 3, 8, 8, 4, 4, 2, 8],
  [3, 1, 6, 4, 2, 8, 4, 6],
  [2, 7, 7, 7, 5, 6, 1, 6],
  [2, 5, 2, 6, 3, 2, 5, 7],
]

export const TARGET = 16
export const MAX_GROUPS = 13

/**
 * One verified optimal packing: 13 disjoint trominoes, each summing to 16.
 * Emitted by a branch-and-bound maximum-disjoint-set solver over all 34 valid
 * trominoes. This is the answer the explainer reveals.
 */
export const VERIFIED_PACKING: ReadonlyArray<ReadonlyArray<Cell>> = [
  [[0, 0], [0, 1], [1, 0]], // 3+9+4 = 16
  [[0, 3], [0, 4], [0, 5]], // 5+2+9 = 16
  [[1, 1], [1, 2], [2, 2]], // 6+4+6 = 16
  [[1, 3], [1, 4], [2, 3]], // 6+4+6 = 16
  [[1, 7], [2, 6], [2, 7]], // 3+9+4 = 16
  [[2, 0], [3, 0], [4, 0]], // 2+6+8 = 16
  [[2, 4], [2, 5], [3, 5]], // 2+9+5 = 16
  [[3, 1], [3, 2], [4, 2]], // 3+5+8 = 16
  [[3, 3], [3, 4], [4, 3]], // 1+7+8 = 16
  [[4, 4], [4, 5], [5, 5]], // 4+4+8 = 16
  [[4, 6], [4, 7], [5, 7]], // 2+8+6 = 16
  [[5, 3], [6, 3], [6, 4]], // 4+7+5 = 16
  [[6, 0], [6, 1], [6, 2]], // 2+7+7 = 16
]

// ----------------------------------------------------------------- layout ---

const CELL = 46
const PAD = 14
const LEGEND_H = 80

export const NG_VIEW_W = PAD * 2 + GRID_N * CELL // 396
export const NG_VIEW_H = PAD * 2 + GRID_N * CELL + LEGEND_H

export const gx = (c: number) => PAD + c * CELL
export const gy = (r: number) => PAD + r * CELL

const GRID_STROKE = '#94A3B8'
const NUM_FILL = '#1E293B'
const CELL_BG = '#FFFFFF'
const GROUP_COLORS = [
  '#FCA5A5',
  '#FDBA74',
  '#FCD34D',
  '#86EFAC',
  '#67E8F9',
  '#93C5FD',
  '#C4B5FD',
  '#F9A8D4',
  '#FDE68A',
  '#A7F3D0',
  '#BAE6FD',
  '#DDD6FE',
  '#FBCFE8',
]

// ----------------------------------------------------------------- legend ---

/** The six allowed shapes, drawn as little tromino tiles inside a 2×3 box. */
const LEGEND_SHAPES: Cell[][] = [
  [[0, 0], [0, 1], [0, 2]], // I horizontal
  [[0, 0], [1, 0], [2, 0]], // I vertical
  [[0, 0], [1, 0], [1, 1]], // L
  [[0, 0], [0, 1], [1, 1]], // L
  [[0, 0], [0, 1], [1, 0]], // L
  [[0, 1], [1, 0], [1, 1]], // L
]

function LegendTile({ cells, x, y, u }: { cells: Cell[]; x: number; y: number; u: number }) {
  return (
    <g>
      {cells.map(([r, c], i) => (
        <rect key={i} x={x + c * u} y={y + r * u} width={u} height={u} fill="#FEF3C7" stroke="#B45309" strokeWidth={1.5} />
      ))}
    </g>
  )
}

function Legend({ y }: { y: number }) {
  const u = 14
  const slots = [PAD + 6, PAD + 62, PAD + 110, PAD + 168, PAD + 232, PAD + 300]
  return (
    <g>
      <text x={NG_VIEW_W / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
        6 allowed shapes (each sums to 16)
      </text>
      {LEGEND_SHAPES.map((cells, i) => (
        <LegendTile key={i} cells={cells} x={slots[i]} y={y} u={u} />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------- diagram ---

export interface NumberGrid25Props {
  /** Groups to shade in (each a tromino of [row,col] cells). Empty = plain grid. */
  groups?: ReadonlyArray<ReadonlyArray<Cell>>
  /** Show the running "N groups of 16" caption under the grid. */
  showCount?: boolean
}

export function NumberGrid25({ groups = [], showCount = false }: NumberGrid25Props) {
  const cellColor = new Map<string, string>()
  groups.forEach((g, gi) => {
    const col = GROUP_COLORS[gi % GROUP_COLORS.length]
    for (const [r, c] of g) cellColor.set(`${r},${c}`, col)
  })

  return (
    <svg
      viewBox={`0 0 ${NG_VIEW_W} ${NG_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 396, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* cell backgrounds (shaded if in a group) */}
      {GRID.map((row, r) =>
        row.map((_, c) => {
          const col = cellColor.get(`${r},${c}`)
          return (
            <rect
              key={`bg-${r}-${c}`}
              x={gx(c)}
              y={gy(r)}
              width={CELL}
              height={CELL}
              fill={col ?? CELL_BG}
              stroke={GRID_STROKE}
              strokeWidth={1.5}
            />
          )
        }),
      )}

      {/* thick outline around each group's cells */}
      {groups.map((g, gi) => (
        <g key={`grp-${gi}`}>
          {g.map(([r, c], i) => (
            <rect key={i} x={gx(c) + 1.5} y={gy(r) + 1.5} width={CELL - 3} height={CELL - 3} fill="none" stroke="#334155" strokeWidth={2.5} />
          ))}
        </g>
      ))}

      {/* numbers */}
      {GRID.map((row, r) =>
        row.map((v, c) => (
          <text
            key={`n-${r}-${c}`}
            x={gx(c) + CELL / 2}
            y={gy(r) + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={800}
            fill={NUM_FILL}
          >
            {v}
          </text>
        )),
      )}

      {/* running count caption */}
      {showCount && groups.length > 0 && (
        <text x={NG_VIEW_W / 2} y={gy(GRID_N) + 20} textAnchor="middle" fontSize={15} fontWeight={900} fill="#0F766E">
          {`${groups.length} group${groups.length === 1 ? '' : 's'} of 16`}
        </text>
      )}

      {/* six-shape legend */}
      <Legend y={gy(GRID_N) + 44} />
    </svg>
  )
}

export default function P22G1Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="An 8 by 8 grid of single-digit numbers. The task: circle as many groups of three adjacent squares (in the six shapes shown) that each add to 16, using every square at most once. At most how many such groups can exist at once?"
    >
      <NumberGrid25 />
    </div>
  )
}
