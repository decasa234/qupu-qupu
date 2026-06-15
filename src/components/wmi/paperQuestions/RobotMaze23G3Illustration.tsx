// WMI-23F3A-Q25 (Grade 3, 2023 Final, Paper A) — broken-robot square maze (fill-in, answer = 31).
//
// A robot passes through a 7-column x 5-row square-grid maze. Its left-turn and
// reverse are broken, so at every move it may only GO STRAIGHT or TURN RIGHT
// (90deg clockwise) and then step one cell forward. The same square may be passed
// more than once; every square it enters is counted, including repeats. Question:
// the least number of squares it passes through to get out.
//
// GRID is 7 wide x 5 tall. Cells (r, c), r=0 (top)..4 (bottom), c=0..6 (left..right).
// Walls were read pixel-by-pixel from db/seed/wmi/figures/2023-final-g3-a-q25.jpg
// (a jpeg decode sampled every interior cell edge for dark ink — each edge read a
// clean 0 or 1; the left/right border gaps were sampled too):
//
//   Horizontal walls (below cell (r,c)):
//     below (0,1) (0,4) (0,5)
//     below (1,1) (1,4)
//     below (3,1) (3,4) (3,5)
//   Vertical walls (right of cell (r,c)):
//     right of (0,1)
//     right of (1,2)
//     right of (2,5)
//     right of (3,0) (3,1) (3,2)
//     right of (4,2)
//
// ENTRANCE: left side of cell (1,0), robot facing EAST. EXIT: right side of (3,6).
//
// SOLVER (Dijkstra over states (r,c, incoming-heading), cost = squares entered with
// the entrance counted as 1; each move = leave STRAIGHT or TURN-RIGHT then step one
// cell, blocked by walls/boundary, NO turning in place, NO left, NO reverse; goal =
// be at (3,6) able to leave EAST through the right gap) CONFIRMS the minimum = 31.
// The verified optimal route (31 squares incl. the 5 revisits at (2,2),(2,3),(3,3),
// (3,4),(3,6)) is exported as SOLUTION_PATH below. Each step was machine-checked to
// be straight-or-right, crossing no wall, ending at (3,6) facing East.
//
// The static figure draws ONLY the problem: grid + walls + entrance/exit gaps + the
// robot parked at the start facing the exit. NO route is drawn and no square is
// highlighted — the answer (31) is never revealed. The animator imports RobotMaze23G3
// and feeds `path` to overlay the route + step numbers post-answer.
//
// SSR-safe + deterministic: no Math.random, no Date, pure render of constants.

export interface Cell {
  r: number
  c: number
}

export const COLS = 7
export const ROWS = 5

/** Entrance cell + initial facing (East). */
export const ENTRANCE: Cell = { r: 1, c: 0 }
/** Exit cell — robot leaves East through the right gap. */
export const EXIT: Cell = { r: 3, c: 6 }

/** Horizontal walls: a wall on the BOTTOM edge of cell (r,c). */
export const H_WALLS: Cell[] = [
  { r: 0, c: 1 },
  { r: 0, c: 4 },
  { r: 0, c: 5 },
  { r: 1, c: 1 },
  { r: 1, c: 4 },
  { r: 3, c: 1 },
  { r: 3, c: 4 },
  { r: 3, c: 5 },
]

/** Vertical walls: a wall on the RIGHT edge of cell (r,c). */
export const V_WALLS: Cell[] = [
  { r: 0, c: 1 },
  { r: 1, c: 2 },
  { r: 2, c: 5 },
  { r: 3, c: 0 },
  { r: 3, c: 1 },
  { r: 3, c: 2 },
  { r: 4, c: 2 },
]

/**
 * The verified maze structure — the SINGLE SOURCE the animator reuses. `walls`
 * lists each blocked interior edge as {kind:'h'|'v', r, c}: a 'h' wall sits on the
 * BOTTOM edge of (r,c); a 'v' wall sits on the RIGHT edge of (r,c).
 */
export const MAZE = {
  cols: COLS,
  rows: ROWS,
  entrance: ENTRANCE,
  exit: EXIT,
  walls: [
    ...H_WALLS.map((w) => ({ kind: 'h' as const, r: w.r, c: w.c })),
    ...V_WALLS.map((w) => ({ kind: 'v' as const, r: w.r, c: w.c })),
  ],
}

/** The answer — least squares passed through (never drawn in the static figure). */
export const ANSWER = 31

/**
 * A verified least-length route (31 squares, including the 5 revisits). Ordered
 * list of cells the optimal robot enters. Exposed so the animator can trace it.
 * Every step is straight-or-right; it ends at (3,6) facing East and steps out.
 */
export const SOLUTION_PATH: Cell[] = [
  { r: 1, c: 0 },
  { r: 1, c: 1 },
  { r: 1, c: 2 },
  { r: 2, c: 2 },
  { r: 3, c: 2 },
  { r: 4, c: 2 },
  { r: 4, c: 1 },
  { r: 4, c: 0 },
  { r: 3, c: 0 },
  { r: 2, c: 0 },
  { r: 2, c: 1 },
  { r: 2, c: 2 },
  { r: 2, c: 3 },
  { r: 2, c: 4 },
  { r: 3, c: 4 },
  { r: 3, c: 3 },
  { r: 2, c: 3 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 5 },
  { r: 1, c: 6 },
  { r: 2, c: 6 },
  { r: 3, c: 6 },
  { r: 4, c: 6 },
  { r: 4, c: 5 },
  { r: 4, c: 4 },
  { r: 4, c: 3 },
  { r: 3, c: 3 },
  { r: 3, c: 4 },
  { r: 3, c: 5 },
  { r: 3, c: 6 },
]

// --- layout -------------------------------------------------------------
const CELL = 44
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
    <line x1={x1} y1={y} x2={x2} y2={y} stroke={WALL_COLOR} strokeWidth={WALL} strokeLinecap="round" />
  )
}

/** A vertical wall segment on the right edge of cell (r,c). */
function VWall({ r, c }: Cell) {
  const x = cellX(c) + CELL
  const y1 = cellY(r)
  const y2 = cellY(r) + CELL
  return (
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={WALL_COLOR} strokeWidth={WALL} strokeLinecap="round" />
  )
}

/** Outer boundary of the maze with the entrance + exit gaps cut out. */
function Boundary() {
  const left = cellX(0)
  const right = cellX(0) + GRID_W
  const top = cellY(0)
  const bottom = cellY(0) + GRID_H
  // entrance gap: row 1 on the LEFT; exit gap: row 3 on the RIGHT.
  const enTop = cellY(ENTRANCE.r)
  const enBot = cellY(ENTRANCE.r) + CELL
  const exTop = cellY(EXIT.r)
  const exBot = cellY(EXIT.r) + CELL
  return (
    <g stroke={WALL_COLOR} strokeWidth={WALL} strokeLinecap="round">
      {/* top + bottom run full width */}
      <line x1={left} y1={top} x2={right} y2={top} />
      <line x1={left} y1={bottom} x2={right} y2={bottom} />
      {/* left wall, split around the entrance gap (row 1) */}
      <line x1={left} y1={top} x2={left} y2={enTop} />
      <line x1={left} y1={enBot} x2={left} y2={bottom} />
      {/* right wall, split around the exit gap (row 3) */}
      <line x1={right} y1={top} x2={right} y2={exTop} />
      <line x1={right} y1={exBot} x2={right} y2={bottom} />
    </g>
  )
}

/** A gray entry/exit arrow pointing East, centred on its row. */
function FlowArrow({ side }: { side: 'in' | 'out' }) {
  const y = side === 'in' ? ctrY(ENTRANCE.r) : ctrY(EXIT.r)
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
  const s = CELL * 0.3 // body half-size
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

/** Marker dot for the robot's current head while a path is being traced. */
function HeadMarker({ r, c }: Cell) {
  return (
    <circle
      cx={ctrX(c)}
      cy={ctrY(r)}
      r={8}
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
 * Reusable primitive (for the animator). Draws the 7x5 square maze, all walls, the
 * entrance + exit gaps with flow arrows, and the robot at the start. Optionally:
 *  - `path`: an ordered list of cells the robot enters (e.g. SOLUTION_PATH). When
 *    given, the route is overlaid square by square as connected centre-to-centre
 *    segments, each entered cell gets its step number, and the robot is drawn on the
 *    current head with a marker dot.
 *  - `step`: how many cells of `path` to reveal (1..path.length). Defaults to the
 *    whole path. `step = 1` shows only the start; raise it to advance the robot.
 *
 * Defaults to the bare maze (no path) — identical to the question figure — so
 * calling it with no props is safe.
 */
export function RobotMaze23G3({
  path = null,
  step,
}: {
  path?: Array<{ r: number; c: number }> | null
  step?: number
} = {}) {
  const cleanPath = Array.isArray(path) ? path.filter(inGrid) : []
  const hasPath = cleanPath.length > 0
  const shown =
    typeof step === 'number' && step >= 1
      ? cleanPath.slice(0, Math.min(step, cleanPath.length))
      : cleanPath
  // where the robot sits: the current head of the (possibly partial) path, else start.
  const robotAt: Cell = hasPath && shown.length > 0 ? shown[shown.length - 1] : ENTRANCE

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(320, VIEW_W)} aria-hidden="true">
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

      {/* traced route (animator only — never on the bare question figure) */}
      {shown.length >= 2 &&
        shown.slice(1).map((to, i) => <RouteSegment key={`seg-${i}`} from={shown[i]} to={to} />)}

      {/* step numbers per entered cell (animator only) */}
      {hasPath &&
        shown.map((cell, i) => (
          <text
            key={`n-${i}`}
            x={ctrX(cell.c)}
            y={ctrY(cell.r) - 11}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            className="fill-qupu-brand-blue-shadow"
          >
            {i + 1}
          </text>
        ))}

      {/* robot at its current cell, plus a marker dot while tracing */}
      <Robot r={robotAt.r} c={robotAt.c} />
      {hasPath && <HeadMarker r={robotAt.r} c={robotAt.c} />}
    </svg>
  )
}

/**
 * Question figure: the bare 7x5 square maze — grid, walls, entrance + exit gaps,
 * and the robot parked at the start facing the exit. No route is traced and no
 * square is highlighted, so the answer (31) is never shown.
 */
export default function RobotMaze23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Labirin persegi berukuran 7 kolom kali 5 baris dengan beberapa dinding tebal di dalamnya. Sebuah robot masuk dari sisi kiri pada baris kedua dari atas menghadap ke kanan, dan harus keluar lewat celah di sisi kanan pada baris keempat dari atas. Belok kiri dan mundur robot rusak, sehingga ia hanya boleh maju lurus atau berbelok ke kanan, dan boleh melewati kotak yang sama lebih dari sekali. Pertanyaannya: paling sedikit berapa kotak yang dilewati robot untuk keluar, termasuk yang dilewati berulang."
    >
      <RobotMaze23G3 />
    </div>
  )
}
