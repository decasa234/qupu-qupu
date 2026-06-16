// Number-board figure for WMI-19P1A-Q9 (2019 Semifinal Grade 1 Paper A).
//
// "Each cell of the 2-by-4 number board (top 4 3 1 8 / bottom 9 6 2 7) gives the
//  value of the cell shaded black in that position. The example shows that a black
//  cell in one board plus a black cell in another equals the sum of their values
//  (= 11). Compute (board1) + (board2) - (board3) = ?"  Choices 6 / 7 / 8 / 9,
//  answer C = 8.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g1-a-q9.jpg (the JPG is
// NOT embedded). The scan shows, top-left, the value grid:
//
//        col 0  col 1  col 2  col 3
//   top    4      3      1      8
//   bot    9      6      2      7
//
// then, boxed with a dotted border, the worked EXAMPLE — a board with its black
// cell at (top, col 1) = 3, plus a board with its black cell at (top, col 3) = 8,
// "= 11" (3 + 8). Below, the actual problem: three boards
//   board 1: black at (top, col 0) = 4
//   board 2: black at (bot, col 1) = 6
//   board 3: black at (bot, col 2) = 2
//   4 + 6 - 2 = 8   (answer C)
//
// The static figure shows ONLY the problem: the value grid, the example, and the
// three boards with their black cells, ending in "= ?". It never prints any
// value over a black cell and never reveals the answer. The explainer imports the
// co-exported MiniBoard + ValueGrid primitives to label each black cell as it is
// read off.
//
// Pure render — no window/document, no Math.random, no Date. SSR-safe + deterministic.

const INK = '#1F2937'
const BLACK = '#1F2937'
const LINE = '#30598A'
const ACCENT = '#FF8A3D'

// ─── data ────────────────────────────────────────────────────────────────────
// Value board, row-major. [row][col], row 0 = top.
export const VALUES: ReadonlyArray<ReadonlyArray<number>> = [
  [4, 3, 1, 8],
  [9, 6, 2, 7],
]

export const ROWS = 2
export const BCOLS = 4

/** Look up the value at a board cell [row, col]. */
export function valueAt(row: number, col: number): number {
  return VALUES[row]?.[col] ?? 0
}

// The three boards of the actual problem: [row, col] of each black cell.
export type Cell = readonly [number, number]
export const BOARD1: Cell = [0, 0] // top-left   → 4
export const BOARD2: Cell = [1, 1] // bottom 2nd → 6
export const BOARD3: Cell = [1, 2] // bottom 3rd → 2

export const V1 = valueAt(...BOARD1) // 4
export const V2 = valueAt(...BOARD2) // 6
export const V3 = valueAt(...BOARD3) // 2
export const ANSWER = V1 + V2 - V3 // 8

// The example pair: each is [row, col] of its black cell.
export const EX_A: Cell = [0, 1] // = 3
export const EX_B: Cell = [0, 3] // = 8
export const EX_SUM = valueAt(...EX_A) + valueAt(...EX_B) // 11

// ─── geometry ──────────────────────────────────────────────────────────────
const CELL = 26 // mini-board cell size

/** A small 2×4 board with one black cell. Optionally print `label` (its value). */
export function MiniBoard({
  black,
  label,
  highlight = false,
}: {
  black: Cell
  label?: number
  highlight?: boolean
}) {
  const w = BCOLS * CELL
  const h = ROWS * CELL
  return (
    <g>
      {/* cells */}
      {Array.from({ length: ROWS }).map((_, r) =>
        Array.from({ length: BCOLS }).map((__, c) => {
          const isBlack = black[0] === r && black[1] === c
          return (
            <rect
              key={`${r}-${c}`}
              x={c * CELL}
              y={r * CELL}
              width={CELL}
              height={CELL}
              fill={isBlack ? BLACK : '#FFFFFF'}
              stroke={INK}
              strokeWidth={1.6}
            />
          )
        }),
      )}
      {/* highlight ring around the black cell when the explainer reads it */}
      {highlight && (
        <rect
          x={black[1] * CELL - 2}
          y={black[0] * CELL - 2}
          width={CELL + 4}
          height={CELL + 4}
          fill="none"
          stroke={ACCENT}
          strokeWidth={3}
          rx={3}
        />
      )}
      {/* value label printed beneath the board (explainer only) */}
      {label !== undefined && (
        <text
          x={w / 2}
          y={h + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={900}
          fill={LINE}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** The 2×4 value reference grid (always shown). `lit` rings one cell [row,col]. */
export function ValueGrid({ lit }: { lit?: Cell }) {
  return (
    <g>
      {VALUES.map((rowVals, r) =>
        rowVals.map((val, c) => {
          const isLit = lit && lit[0] === r && lit[1] === c
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                fill={isLit ? '#FFE9D6' : '#FFFFFF'}
                stroke={INK}
                strokeWidth={1.6}
              />
              <text
                x={c * CELL + CELL / 2}
                y={r * CELL + CELL / 2 + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight={800}
                fontStyle="italic"
                fill={INK}
              >
                {val}
              </text>
              {isLit && (
                <rect
                  x={c * CELL - 2}
                  y={r * CELL - 2}
                  width={CELL + 4}
                  height={CELL + 4}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={3}
                  rx={3}
                />
              )}
            </g>
          )
        }),
      )}
    </g>
  )
}

function Op({ x, y, ch }: { x: number; y: number; ch: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={26}
      fontWeight={800}
      fill={INK}
    >
      {ch}
    </text>
  )
}

export const VIEW_W = 520
export const VIEW_H = 300

/**
 * The full static figure: value grid + dotted example box + the three-board
 * problem line ending in "= ?". Shows only the problem.
 */
export function NumberBoardFigure() {
  const boardW = BCOLS * CELL // 104
  const boardH = ROWS * CELL // 52

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 480 }}
      aria-hidden="true"
    >
      {/* ── value grid (top-left) ── */}
      <g transform="translate(18, 18)">
        <ValueGrid />
      </g>

      {/* ── example box (dotted) ──  A(top,c1)=3  +  B(top,c3)=8  = 11 ── */}
      <g transform="translate(170, 8)">
        <rect
          x={-10}
          y={0}
          width={350}
          height={78}
          rx={6}
          fill="none"
          stroke="#9CA3AF"
          strokeWidth={2}
          strokeDasharray="3 4"
        />
        <g transform="translate(8, 13)">
          <MiniBoard black={EX_A} />
        </g>
        <Op x={130} y={13 + boardH / 2} ch="+" />
        <g transform={`translate(${158}, 13)`}>
          <MiniBoard black={EX_B} />
        </g>
        <text
          x={158 + boardW + 36}
          y={13 + boardH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fontWeight={900}
          fill={INK}
        >
          {`= ${EX_SUM}`}
        </text>
      </g>

      {/* ── problem line ── board1 + board2 - board3 = ? ── */}
      <g transform="translate(8, 150)">
        <g transform="translate(0, 0)">
          <MiniBoard black={BOARD1} />
        </g>
        <Op x={boardW + 22} y={boardH / 2} ch="+" />
        <g transform={`translate(${boardW + 48}, 0)`}>
          <MiniBoard black={BOARD2} />
        </g>
        <Op x={2 * boardW + 70} y={boardH / 2} ch="−" />
        <g transform={`translate(${2 * boardW + 96}, 0)`}>
          <MiniBoard black={BOARD3} />
        </g>
        <text
          x={3 * boardW + 132}
          y={boardH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={28}
          fontWeight={900}
          fill={ACCENT}
        >
          = ?
        </text>
      </g>
    </svg>
  )
}

export default function NumberBoard19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 2-by-4 value board (top row 4, 3, 1, 8; bottom row 9, 6, 2, 7). ' +
        'An example shows a board with one black cell plus another board with one black cell equals 11. ' +
        'Below, three boards each with one black cell: first plus second minus third equals what?'
      }
    >
      <NumberBoardFigure />
    </div>
  )
}
