// WMI-21P1A-Q25 (2021 WMI Semifinal Grade 1 Paper A, question 25).
//
// Recovered from db/seed/wmi/figures/2021-semifinal-g1-a-q25.jpg:
// Five flat pieces (polyominoes, each cell holding a number) must be assembled —
// rotated but NOT flipped — into one large 4×4 square, which is the grid shown
// below the arrow. Two cells are marked A and B; find A + B.
//
// The five pieces (cells as [col,row], row 0 = top; only the printed labels are
// shown, blanks left empty exactly as in the scan):
//   P1: bottom row of 3 [_, A, _] with "3" above the right cell.
//   P2: horizontal domino  [2][4].
//   P3: square on top-left over a domino: top [_], bottom [2][_].
//   P4: square on top-right over a domino: top [_], bottom [B][4].
//   P5: 2×2 square, top row [1][2], bottom row [_][_].
//
// The TARGET grid (given in the problem, below the arrow):
//   4 1 3 2 / 3 2 4 1 / 2 4 1 3 / 1 3 2 4
//
// Per the official answer key, A + B = 5 → answer D. The static figure draws ONLY
// the five pieces + the target grid (the problem); it never solves the placement
// or marks an answer — that is the explainer's job.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#2B2622' // outlines + printed numbers
const MARK = '#A7D26B' // green wash for the marked cells A / B (matches the scan)
const ARROW = '#2B2622'

/** One drawn cell of a piece: position [col,row] plus optional label. */
export interface PieceCell {
  c: number
  r: number
  /** Printed number, or "A"/"B" for the green marked cells, or undefined = blank. */
  label?: string | number
  marked?: boolean
}

export interface PieceDef {
  id: string
  cells: PieceCell[]
}

/** The five pieces, drawn exactly as the scan shows them. */
export const PIECES: PieceDef[] = [
  {
    id: 'P1',
    cells: [
      { c: 0, r: 1 },
      { c: 1, r: 1, label: 'A', marked: true },
      { c: 2, r: 1 },
      { c: 2, r: 0, label: 3 },
    ],
  },
  {
    id: 'P2',
    cells: [
      { c: 0, r: 0, label: 2 },
      { c: 1, r: 0, label: 4 },
    ],
  },
  {
    id: 'P3',
    cells: [
      { c: 0, r: 0 },
      { c: 0, r: 1, label: 2 },
      { c: 1, r: 1 },
    ],
  },
  {
    id: 'P4',
    cells: [
      { c: 1, r: 0 },
      { c: 0, r: 1, label: 'B', marked: true },
      { c: 1, r: 1, label: 4 },
    ],
  },
  {
    id: 'P5',
    cells: [
      { c: 0, r: 0, label: 1 },
      { c: 1, r: 0, label: 2 },
      { c: 0, r: 1 },
      { c: 1, r: 1 },
    ],
  },
]

/** The given 4×4 target grid (rows top→bottom). */
export const TARGET: number[][] = [
  [4, 1, 3, 2],
  [3, 2, 4, 1],
  [2, 4, 1, 3],
  [1, 3, 2, 4],
]

const CELL = 30

/** Draws one piece as a cluster of bordered cells, top-left anchored at (0,0). */
export function Piece({ def, cell = CELL }: { def: PieceDef; cell?: number }) {
  return (
    <g>
      {def.cells.map((cc, i) => (
        <g key={i}>
          <rect
            x={cc.c * cell}
            y={cc.r * cell}
            width={cell}
            height={cell}
            fill={cc.marked ? MARK : '#FFFFFF'}
            stroke={INK}
            strokeWidth={2.2}
          />
          {cc.label != null && (
            <text
              x={cc.c * cell + cell / 2}
              y={cc.r * cell + cell / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={17}
              fontWeight={800}
              fontStyle={typeof cc.label === 'string' ? 'italic' : 'normal'}
              fill={INK}
            >
              {cc.label}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

export interface Grid4Props {
  /** Cell coords [col,row] to wash + outline (e.g. where A and B land). */
  highlight?: Array<[number, number]> | null
  /** Hide the printed numbers (used for the bare "frame" beat). */
  hideNumbers?: boolean
  cell?: number
}

/** The 4×4 target grid, optionally highlighting marked cells. */
export function Grid4({ highlight = null, hideNumbers = false, cell = 36 }: Grid4Props = {}) {
  const hi = new Set((highlight ?? []).map(([c, r]) => `${c},${r}`))
  const size = 4 * cell
  return (
    <g>
      {TARGET.map((row, r) =>
        row.map((v, c) => {
          const on = hi.has(`${c},${r}`)
          return (
            <g key={`${c}-${r}`}>
              <rect
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                fill={on ? MARK : '#FFFFFF'}
                stroke={INK}
                strokeWidth={on ? 3 : 2}
              />
              {!hideNumbers && (
                <text
                  x={c * cell + cell / 2}
                  y={r * cell + cell / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  fontWeight={800}
                  fill={INK}
                >
                  {v}
                </text>
              )}
            </g>
          )
        }),
      )}
      <rect x={0} y={0} width={size} height={size} fill="none" stroke={INK} strokeWidth={3} />
    </g>
  )
}

export const Q25_VIEW_W = 470
export const Q25_VIEW_H = 420

/** Down arrow between the pieces row and the target grid. */
function DownArrow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <polygon points="-7,-16 7,-16 7,4 16,4 0,22 -16,4 -7,4" fill={ARROW} />
    </g>
  )
}

/** Per-piece horizontal placement (x offset) along the top row, hand-tuned to fit. */
const PIECE_X = [10, 120, 200, 300, 400]

export interface Q25DiagramProps {
  /** Cells to highlight in the 4×4 grid (the explainer marks where A and B land). */
  gridHighlight?: Array<[number, number]> | null
}

export function Q25Diagram({ gridHighlight = null }: Q25DiagramProps = {}) {
  const gridCell = 36
  const gridSize = 4 * gridCell
  const gridX = (Q25_VIEW_W - gridSize) / 2
  const gridY = 240
  return (
    <svg
      viewBox={`0 0 ${Q25_VIEW_W} ${Q25_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q25_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* five pieces along the top, baseline-aligned */}
      {PIECES.map((def, i) => (
        <g key={def.id} transform={`translate(${PIECE_X[i]}, 30)`}>
          <Piece def={def} />
        </g>
      ))}

      {/* assembly arrow */}
      <DownArrow x={Q25_VIEW_W / 2} y={205} />

      {/* target 4×4 grid */}
      <g transform={`translate(${gridX}, ${gridY})`}>
        <Grid4 highlight={gridHighlight} cell={gridCell} />
      </g>
    </svg>
  )
}

export default function P21G1Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Five flat number-pieces to be rotated and assembled into the 4 by 4 number grid shown below. Two cells are marked A and B; find A plus B."
    >
      <Q25Diagram />
    </div>
  )
}
