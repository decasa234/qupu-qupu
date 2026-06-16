// WMI-24P2A-Q23 (2024 Grade 2 Semifinal, Paper A) — XOR-circle grids (answer = C).
//
// Each 3x3 grid holds white circles (○) and black circles (●). A worked example
// shows GRID1 + GRID2 = RESULT under one rule; the task is to apply the same rule
// to a SECOND pair and pick the matching grid from options A–E.
//
// RULE (read straight from the worked example in
// db/seed/wmi/figures/2024-semifinal-g2-a-q23.jpg):
//   - a cell with a circle in BOTH grids  -> empty in the result (they cancel)
//   - a cell with a circle in only ONE grid -> that same circle stays
//   (i.e. a symmetric difference / XOR; the surviving circle keeps its colour.)
//
// Worked example grids (cells are [row][col], r=0 top .. 2 bottom, c=0 left .. 2):
//   GRID1 (white): (0,0) (1,0) (1,1) (2,1)
//   GRID2 (black): (0,0) (0,1) (0,2) (1,1)
//   RESULT shown : (0,1)● (0,2)● (1,0)○ (2,1)○        <- XOR, verified against scan
//
// SECOND sum (the actual question):
//   GRID_A (white): (0,2) (1,1) (1,2) (2,0) (2,1) (2,2)
//   GRID_B (black): (0,0) (1,1) (1,2) (2,2)
//   XOR result    : (0,0)●  (0,2)○  (2,0)○  (2,1)○      <- answer grid (option C)
//
// The static figure draws ONLY the problem: the worked example (with its answer,
// which is legitimate context), the second pair, and a "?" where the answer goes.
// The answer grid itself is NEVER drawn here — that lives in the explainer.
//
// SSR-safe + deterministic: pure render of constants, no window/Date/Math.random.

export type Dot = 'white' | 'black'
/** A 3x3 grid as 9 cells in reading order (row-major); null = empty cell. */
export type Grid3 = Array<Dot | null>

const E: Grid3 = [null, null, null, null, null, null, null, null, null]

const put = (cells: Array<[number, number, Dot]>): Grid3 => {
  const g = [...E]
  for (const [r, c, d] of cells) g[r * 3 + c] = d
  return g
}

// --- worked example (top row of the figure) -----------------------------
export const EX_GRID1: Grid3 = put([
  [0, 0, 'white'],
  [1, 0, 'white'],
  [1, 1, 'white'],
  [2, 1, 'white'],
])
export const EX_GRID2: Grid3 = put([
  [0, 0, 'black'],
  [0, 1, 'black'],
  [0, 2, 'black'],
  [1, 1, 'black'],
])
export const EX_RESULT: Grid3 = put([
  [0, 1, 'black'],
  [0, 2, 'black'],
  [1, 0, 'white'],
  [2, 1, 'white'],
])

// --- the question pair (bottom row of the figure) -----------------------
export const Q_GRID_A: Grid3 = put([
  [0, 2, 'white'],
  [1, 1, 'white'],
  [1, 2, 'white'],
  [2, 0, 'white'],
  [2, 1, 'white'],
  [2, 2, 'white'],
])
export const Q_GRID_B: Grid3 = put([
  [0, 0, 'black'],
  [1, 1, 'black'],
  [1, 2, 'black'],
  [2, 2, 'black'],
])

/** Apply the XOR rule: a cell survives iff exactly one grid has a circle. */
export function xorGrids(a: Grid3, b: Grid3): Grid3 {
  const out: Grid3 = [...E]
  for (let i = 0; i < 9; i++) {
    const x = a[i]
    const y = b[i]
    if (x && !y) out[i] = x
    else if (y && !x) out[i] = y
    else out[i] = null // both or neither -> empty
  }
  return out
}

/** The verified answer grid (option C). Co-exported for the explainer. */
export const Q_RESULT: Grid3 = xorGrids(Q_GRID_A, Q_GRID_B)

// --- layout -------------------------------------------------------------
const CELL = 30
const GRID = CELL * 3
const DOT_R = 10
const STROKE = '#3a3631'
const BLACK = '#3a3631'
const WHITE = '#ffffff'

/**
 * Reusable 3x3 grid primitive. Draws the grid lines and the circles in `grid`.
 * Place it at (x, y) — the top-left corner of the 3x3 block. When `highlight`
 * is given (a list of cell indices 0..8) those cells get a soft tint, used by
 * the explainer to call out which cells cancel / survive.
 */
export function Grid3x3({
  x,
  y,
  grid,
  highlight,
}: {
  x: number
  y: number
  grid: Grid3
  highlight?: number[]
}) {
  const hi = new Set(highlight ?? [])
  return (
    <g>
      {/* highlighted cell tints (under the grid lines) */}
      {grid.map((_, i) =>
        hi.has(i) ? (
          <rect
            key={`hi${i}`}
            x={x + (i % 3) * CELL}
            y={y + Math.floor(i / 3) * CELL}
            width={CELL}
            height={CELL}
            fill="#FDE68A"
            opacity={0.85}
          />
        ) : null,
      )}
      {/* outer frame */}
      <rect x={x} y={y} width={GRID} height={GRID} fill="none" stroke={STROKE} strokeWidth={2} />
      {/* interior grid lines */}
      {[1, 2].map((k) => (
        <line key={`v${k}`} x1={x + k * CELL} y1={y} x2={x + k * CELL} y2={y + GRID} stroke={STROKE} strokeWidth={2} />
      ))}
      {[1, 2].map((k) => (
        <line key={`h${k}`} x1={x} y1={y + k * CELL} x2={x + GRID} y2={y + k * CELL} stroke={STROKE} strokeWidth={2} />
      ))}
      {/* circles */}
      {grid.map((d, i) =>
        d ? (
          <circle
            key={`d${i}`}
            cx={x + (i % 3) * CELL + CELL / 2}
            cy={y + Math.floor(i / 3) * CELL + CELL / 2}
            r={DOT_R}
            fill={d === 'black' ? BLACK : WHITE}
            stroke={STROKE}
            strokeWidth={2}
          />
        ) : null,
      )}
    </g>
  )
}

/** A bold operator glyph ("+", "=", or "?") centred at (x, y). */
function Glyph({ x, y, ch }: { x: number; y: number; ch: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill={STROKE}>
      {ch}
    </text>
  )
}

// view layout: three grids per row with operators between them.
const PAD = 14
const OP_W = 34 // operator column width
const ROW_GAP = 34
const ROW_H = GRID
const COL0 = PAD
const COL1 = COL0 + GRID + OP_W // second grid x
const COL2 = COL1 + GRID + OP_W // third grid / result x
const VIEW_W = COL2 + GRID + PAD
const TOP_Y = PAD
const BOT_Y = TOP_Y + ROW_H + ROW_GAP
const VIEW_H = BOT_Y + ROW_H + PAD

const opX = (afterCol: number) => afterCol - OP_W / 2

/**
 * Full question figure: worked example on the top row, the second pair on the
 * bottom row with a "?" where the answer goes. `revealResult` (explainer only)
 * swaps the "?" for the answer grid; never set on the bare question figure.
 */
export function XorGridsScene({ revealResult = false, highlightResult }: { revealResult?: boolean; highlightResult?: number[] } = {}) {
  const midTop = TOP_Y + ROW_H / 2
  const midBot = BOT_Y + ROW_H / 2
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* worked example row */}
      <Grid3x3 x={COL0} y={TOP_Y} grid={EX_GRID1} />
      <Glyph x={opX(COL1)} y={midTop} ch="+" />
      <Grid3x3 x={COL1} y={TOP_Y} grid={EX_GRID2} />
      <Glyph x={opX(COL2)} y={midTop} ch="=" />
      <Grid3x3 x={COL2} y={TOP_Y} grid={EX_RESULT} />

      {/* question row */}
      <Grid3x3 x={COL0} y={BOT_Y} grid={Q_GRID_A} />
      <Glyph x={opX(COL1)} y={midBot} ch="+" />
      <Grid3x3 x={COL1} y={BOT_Y} grid={Q_GRID_B} />
      <Glyph x={opX(COL2)} y={midBot} ch="=" />
      {revealResult ? (
        <Grid3x3 x={COL2} y={BOT_Y} grid={Q_RESULT} highlight={highlightResult} />
      ) : (
        <Glyph x={COL2 + GRID / 2} y={midBot} ch="?" />
      )}
    </svg>
  )
}

export default function P24G2Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A worked example of two 3x3 grids of white and black circles being added into a result grid, followed by a second pair of grids whose result is marked with a question mark."
    >
      <XorGridsScene />
    </div>
  )
}
