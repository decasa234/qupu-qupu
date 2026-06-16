// WMI-23F2A-Q25 (Grade 2, 2023 Final, Paper A) — robot square maze (fill-in, answer = 20).
//
// A robot enters a 6-column x 5-row square maze on the LEFT (middle row) facing
// EAST and must get OUT through the matching gap on the RIGHT. It may ONLY go
// straight or turn RIGHT before stepping — never turn left, never reverse. A
// square may be passed through more than once. Every square it enters counts,
// including repeats. Question: the least number of squares it passes through.
//
// GRID is 6 wide x 5 tall. Cells are (r, c), r=0 (top)..4 (bottom), c=0..5.
// Walls were read pixel-by-pixel from db/seed/wmi/figures/2023-final-g2-a-q25.jpg
// by projecting dark ink onto every interior cell edge (each edge sampled a clean
// 0.00 or 1.00 coverage fraction):
//
//   Horizontal walls (on the BOTTOM edge of cell (r,c)):
//     below (0,1) (0,2) (0,3)
//     below (1,2) (1,4)
//     below (2,0) (2,3)
//   Vertical walls (on the RIGHT edge of cell (r,c)):
//     right of (0,4)
//     right of (2,2)
//     right of (3,1) (3,3) (3,4)
//     right of (4,2)
//
// ENTRANCE: left side of cell (2,0), robot facing EAST. EXIT: right side of (2,5).
// (The 2023 G2 maze is geometrically identical to the 2023 G1 Q25 maze — same
//  walls, same entrance/exit — and so shares the answer 20.)
//
// SOLVER (Dijkstra over states (r, c, facing) with cost = squares entered, moves =
// {go straight, turn right then step}, blocked by walls/boundary, exit = step EAST
// out of (2,5)) CONFIRMS the minimum is 20. One optimal route (20 squares incl. the
// two repeats at (2,1) and (2,5)):
//
//   (2,0)E (2,1)E (2,2)E (3,2)S (4,2)S (4,1)W (3,1)N (2,1)N (1,1)N (1,2)E
//   (1,3)E (1,4)E (1,5)E (2,5)S (3,5)S (4,5)S (4,4)W (3,4)N (2,4)N (2,5)E->out
//
// The static figure draws ONLY the problem: grid + walls + entrance/exit gaps +
// the robot parked at the start. NO route is drawn and no square is highlighted —
// the answer (20) is never revealed. The explainer/animator imports Maze23G2 and
// feeds `route` + `step` to trace the robot's forward/right-only path square by square.
//
// SSR-safe + deterministic: no Math.random, no Date, pure render of constants.

export interface Cell {
  r: number
  c: number
}

export const COLS = 6
export const ROWS = 5

/** Entrance cell + initial facing (East). */
export const ENTRANCE: Cell = { r: 2, c: 0 }
/** Exit cell — robot leaves East through the right gap. */
export const EXIT: Cell = { r: 2, c: 5 }

/** Horizontal walls: a wall on the BOTTOM edge of cell (r,c). */
export const H_WALLS: Cell[] = [
  { r: 0, c: 1 },
  { r: 0, c: 2 },
  { r: 0, c: 3 },
  { r: 1, c: 2 },
  { r: 1, c: 4 },
  { r: 2, c: 0 },
  { r: 2, c: 3 },
]

/** Vertical walls: a wall on the RIGHT edge of cell (r,c). */
export const V_WALLS: Cell[] = [
  { r: 0, c: 4 },
  { r: 2, c: 2 },
  { r: 3, c: 1 },
  { r: 3, c: 3 },
  { r: 3, c: 4 },
  { r: 4, c: 2 },
]

/**
 * A verified least-length route (20 squares, including the two revisits). Index
 * order of cells entered. Exposed so the explainer/animator can default-trace it.
 */
export const OPTIMAL_ROUTE: Cell[] = [
  { r: 2, c: 0 },
  { r: 2, c: 1 },
  { r: 2, c: 2 },
  { r: 3, c: 2 },
  { r: 4, c: 2 },
  { r: 4, c: 1 },
  { r: 3, c: 1 },
  { r: 2, c: 1 },
  { r: 1, c: 1 },
  { r: 1, c: 2 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 5 },
  { r: 2, c: 5 },
  { r: 3, c: 5 },
  { r: 4, c: 5 },
  { r: 4, c: 4 },
  { r: 3, c: 4 },
  { r: 2, c: 4 },
  { r: 2, c: 5 },
]

/**
 * The full maze definition co-exported as one structured object so the
 * step-explainer/animator can bind to the exact same grid + walls + endpoints
 * the figure draws (the anti-drift glue).
 */
export const MAZE25G2 = {
  cols: COLS,
  rows: ROWS,
  entrance: ENTRANCE,
  exit: EXIT,
  hWalls: H_WALLS,
  vWalls: V_WALLS,
  optimalRoute: OPTIMAL_ROUTE,
} as const

// --- layout -------------------------------------------------------------
const CELL = 46
const WALL = 4 // wall stroke width
// Headroom on left/right for the entrance + exit arrows; small top/bottom pad.
const PAD_X = 40
const PAD_Y = 18
const GRID_W = COLS * CELL
const GRID_H = ROWS * CELL
const VIEW_W = GRID_W + PAD_X * 2
const VIEW_H = GRID_H + PAD_Y * 2

const cellX = (c: number) => PAD_X + c * CELL
const cellY = (r: number) => PAD_Y + r * CELL
const ctrX = (c: number) => cellX(c) + CELL / 2
const ctrY = (r: number) => cellY(r) + CELL / 2

const WALL_COLOR = '#3a3631' // dark maze ink (matches scan); no qupu token is this dark

/** A horizontal wall segment on the bottom edge of cell (r,c). */
function HWall({ r, c }: Cell) {
  const x1 = cellX(c)
  const x2 = cellX(c) + CELL
  const y = cellY(r) + CELL
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke={WALL_COLOR}
      strokeWidth={WALL}
      strokeLinecap="round"
    />
  )
}

/** A vertical wall segment on the right edge of cell (r,c). */
function VWall({ r, c }: Cell) {
  const x = cellX(c) + CELL
  const y1 = cellY(r)
  const y2 = cellY(r) + CELL
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      stroke={WALL_COLOR}
      strokeWidth={WALL}
      strokeLinecap="round"
    />
  )
}

/** Outer boundary of the maze with the entrance + exit gaps cut out of it. */
function Boundary() {
  const left = cellX(0)
  const right = cellX(0) + GRID_W
  const top = cellY(0)
  const bottom = cellY(0) + GRID_H
  const gapTop = cellY(ENTRANCE.r)
  const gapBot = cellY(ENTRANCE.r) + CELL
  return (
    <g stroke={WALL_COLOR} strokeWidth={WALL} strokeLinecap="round">
      {/* top + bottom run full width */}
      <line x1={left} y1={top} x2={right} y2={top} />
      <line x1={left} y1={bottom} x2={right} y2={bottom} />
      {/* left wall, split around the entrance gap (row 2) */}
      <line x1={left} y1={top} x2={left} y2={gapTop} />
      <line x1={left} y1={gapBot} x2={left} y2={bottom} />
      {/* right wall, split around the exit gap (row 2) */}
      <line x1={right} y1={top} x2={right} y2={gapTop} />
      <line x1={right} y1={gapBot} x2={right} y2={bottom} />
    </g>
  )
}

/** A gray entry/exit arrow pointing East, centred on the entrance/exit row. */
function FlowArrow({ side }: { side: 'in' | 'out' }) {
  const y = ctrY(ENTRANCE.r)
  // entrance arrow sits left of the maze; exit arrow sits right of it.
  const baseX = side === 'in' ? cellX(0) - PAD_X + 6 : cellX(0) + GRID_W + 8
  const len = 22
  const head = 9
  const tipX = baseX + len
  return (
    <g>
      <line
        x1={baseX}
        y1={y}
        x2={tipX - head}
        y2={y}
        stroke="#9aa5b1"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <polygon
        points={`${tipX},${y} ${tipX - head},${y - head * 0.8} ${tipX - head},${y + head * 0.8}`}
        fill="#9aa5b1"
      />
    </g>
  )
}

/** A small drawn robot parked in cell (r,c), facing East. */
function Robot({ r, c }: Cell) {
  const x = ctrX(c)
  const y = ctrY(r)
  const s = CELL * 0.32 // body half-size
  return (
    <g>
      {/* antenna */}
      <line x1={x} y1={y - s - 6} x2={x} y2={y - s} stroke="#3a3631" strokeWidth={2} />
      <circle cx={x} cy={y - s - 7} r={2.5} className="fill-qupu-brand-orange" />
      {/* head */}
      <rect
        x={x - s}
        y={y - s}
        width={s * 2}
        height={s * 2}
        rx={5}
        className="fill-qupu-brand-blue stroke-qupu-brand-blue-shadow"
        strokeWidth={2}
      />
      {/* eyes (looking East — toward the exit) */}
      <circle cx={x - s * 0.15} cy={y - s * 0.25} r={s * 0.22} className="fill-white" />
      <circle cx={x + s * 0.55} cy={y - s * 0.25} r={s * 0.22} className="fill-white" />
      <circle cx={x} cy={y - s * 0.25} r={s * 0.1} className="fill-qupu-brand-blue-shadow" />
      <circle cx={x + s * 0.7} cy={y - s * 0.25} r={s * 0.1} className="fill-qupu-brand-blue-shadow" />
      {/* mouth grille */}
      <rect
        x={x - s * 0.5}
        y={y + s * 0.25}
        width={s}
        height={s * 0.5}
        rx={2}
        className="fill-qupu-cream"
      />
    </g>
  )
}

/** Marker dot for the robot's current head while a route is being traced. */
function HeadMarker({ r, c }: Cell) {
  return (
    <circle
      cx={ctrX(c)}
      cy={ctrY(r)}
      r={9}
      className="fill-qupu-brand-orange stroke-white"
      strokeWidth={2}
    />
  )
}

/** One traced segment between two consecutive cells in the route. */
function RouteSegment({ from, to }: { from: Cell; to: Cell }) {
  return (
    <line
      x1={ctrX(from.c)}
      y1={ctrY(from.r)}
      x2={ctrX(to.c)}
      y2={ctrY(to.r)}
      className="stroke-qupu-brand-orange"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function inGrid(cell: unknown): cell is Cell {
  return (
    typeof cell === 'object' &&
    cell !== null &&
    typeof (cell as Cell).r === 'number' &&
    typeof (cell as Cell).c === 'number' &&
    (cell as Cell).r >= 0 &&
    (cell as Cell).r < ROWS &&
    (cell as Cell).c >= 0 &&
    (cell as Cell).c < COLS
  )
}

/**
 * Reusable primitive (for the explainer/animator). Draws the 6x5 square maze, all
 * walls, the entrance + exit gaps with flow arrows, and the robot at the start.
 * Optionally:
 *  - `route`: an ordered list of cells the robot enters (e.g. OPTIMAL_ROUTE). When
 *    given, the path is traced square by square as connected centre-to-centre
 *    segments; the robot is drawn on the current head and a marker dot pins it.
 *  - `step`: how many cells of `route` to reveal (1..route.length). Defaults to the
 *    whole route. `step = 1` shows only the start; raise it to advance the robot.
 *
 * Defaults to the bare maze (no route) — identical to the question figure — so
 * calling it with no props is safe.
 */
export function Maze23G2({
  route,
  step,
}: {
  route?: Array<{ r: number; c: number }>
  step?: number
} = {}) {
  const cleanRoute = Array.isArray(route) ? route.filter(inGrid) : []
  const hasRoute = cleanRoute.length > 0
  const shown =
    typeof step === 'number' && step >= 1
      ? cleanRoute.slice(0, Math.min(step, cleanRoute.length))
      : cleanRoute
  // where the robot sits: the current head of the (possibly partial) route, else start.
  const robotAt: Cell = hasRoute && shown.length > 0 ? shown[shown.length - 1] : ENTRANCE

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(300, VIEW_W)} aria-hidden="true">
      {/* cell backgrounds */}
      {Array.from({ length: ROWS }).map((_, r) =>
        Array.from({ length: COLS }).map((__, c) => (
          <rect
            key={`bg-${r}-${c}`}
            x={cellX(c)}
            y={cellY(r)}
            width={CELL}
            height={CELL}
            className="fill-qupu-cream"
          />
        )),
      )}

      {/* flow arrows (entrance + exit) */}
      <FlowArrow side="in" />
      <FlowArrow side="out" />

      {/* outer boundary with entrance/exit gaps */}
      <Boundary />

      {/* interior walls */}
      {H_WALLS.map((w, i) => (
        <HWall key={`h-${i}`} r={w.r} c={w.c} />
      ))}
      {V_WALLS.map((w, i) => (
        <VWall key={`v-${i}`} r={w.r} c={w.c} />
      ))}

      {/* traced route (explainer/animator only — never on the bare question figure) */}
      {shown.length >= 2 &&
        shown.slice(1).map((to, i) => <RouteSegment key={`seg-${i}`} from={shown[i]} to={to} />)}

      {/* robot at its current cell, plus a marker dot while tracing */}
      <Robot r={robotAt.r} c={robotAt.c} />
      {hasRoute && <HeadMarker r={robotAt.r} c={robotAt.c} />}
    </svg>
  )
}

/**
 * Question figure: the bare 6x5 square maze — grid, walls, entrance + exit gaps,
 * and the robot parked at the start facing the exit. No route is traced and no
 * square is highlighted, so the answer (20) is never shown.
 */
export default function RobotMaze23G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Labirin persegi berukuran 6 kolom kali 5 baris dengan beberapa dinding di dalamnya. Sebuah robot masuk dari sisi kiri pada baris tengah menghadap ke kanan, dan harus keluar lewat celah di sisi kanan pada baris yang sama. Robot hanya boleh maju lurus atau berbelok ke kanan, tidak boleh belok kiri atau mundur, dan boleh melewati kotak yang sama lebih dari sekali. Pertanyaannya: paling sedikit berapa kotak yang dilewati robot, termasuk yang dilewati berulang."
    >
      <Maze23G2 />
    </div>
  )
}
