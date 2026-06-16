// WMI-23F1A-Q22 (Grade 1) — maze of 16 numbered rooms (fill-in, answer = 6).
//
// A 4x4 maze of numbered rooms. You may move between any two ADJACENT rooms
// (up/down/left/right share a wall opening — there are NO interior walls); the
// dark plus/T marks on the scan are just the maze grid joints, not blockers.
// Every border room has an opening to the outside (the gray outward arrows), so
// any border room can serve as the exit. Laura ENTERS at the bold arrow into the
// bottom-left room, walks through exactly 8 rooms (each visited once), then
// LEAVES through a border room. Question: at most how many EVEN-numbered rooms
// can she pass through?
//
// GRID (read top->bottom, left->right), index = row*4 + col, reconstructed from
// the scan db/seed/wmi/figures/2023-final-g1-a-q22.jpg:
//   row0:  1  4  5  6        (idx 0..3)
//   row1:  2  8  6  3        (idx 4..7)
//   row2:  5  2  9  2        (idx 8..11)
//   row3:  9  4  6  8        (idx 12..15)
//
// ENTRANCE: bold black arrow into bottom-left room = index 12 (value 9).
// EXIT: any border room (all border cells have an outward arrow).
//
// SOLVER (backtracking over simple paths from idx 12, length exactly 8, ending on
// a border room, maximizing even rooms visited) CONFIRMS the maximum is 6.
// One optimal path (indices): 12 -> 8 -> 4 -> 5 -> 9 -> 13 -> 14 -> 15
//   values:  9   5   2   8   2    4    6    8
//   even rooms passed: 2, 8, 2, 4, 6, 8  => SIX even rooms. (entrance 9 & room 5
//   are the only two odd rooms on this route.)
//
// The static figure draws ONLY the problem: the 16 numbered rooms + the entrance
// arrow + the border exit arrows. NO path is drawn and no room is highlighted —
// the answer is never revealed. The animator imports RoomMaze23G1 to trace
// Laura's route (path) and light the even rooms (highlightEven).
//
// SSR-safe + deterministic: no Math.random, no Date, pure render.

/** The 4x4 room numbers, index = row*4 + col (top->bottom, left->right). */
export const ROOM_GRID: number[] = [
  1, 4, 5, 6,
  2, 8, 6, 3,
  5, 2, 9, 2,
  9, 4, 6, 8,
]

/** Entrance room index (bold arrow, bottom-left). */
export const ENTRANCE_INDEX = 12

/**
 * A verified optimal route (passes exactly 8 rooms, 6 of them even-numbered).
 * Index order. Exposed so the animator can default-trace it if no path is given.
 */
export const OPTIMAL_PATH: number[] = [12, 8, 4, 5, 9, 13, 14, 15]

const COLS = 4
const ROWS = 4

const rowOf = (idx: number) => Math.floor(idx / COLS)
const colOf = (idx: number) => idx % COLS
const isEven = (idx: number) => ROOM_GRID[idx] % 2 === 0

// --- layout -------------------------------------------------------------
const CELL = 58
// headroom on every side for the outward arrows + the bold entrance arrow.
const MARGIN = 30
const GRID_W = COLS * CELL
const GRID_H = ROWS * CELL
const VIEW_W = GRID_W + MARGIN * 2
const VIEW_H = GRID_H + MARGIN * 2

const cellX = (col: number) => MARGIN + col * CELL
const cellY = (row: number) => MARGIN + row * CELL
const ctrX = (idx: number) => cellX(colOf(idx)) + CELL / 2
const ctrY = (idx: number) => cellY(rowOf(idx)) + CELL / 2

/** Border-edge directions a room has an outward opening on (its exits). */
function borderDirs(idx: number): Array<'up' | 'down' | 'left' | 'right'> {
  const r = rowOf(idx)
  const c = colOf(idx)
  const dirs: Array<'up' | 'down' | 'left' | 'right'> = []
  if (r === 0) dirs.push('up')
  if (r === ROWS - 1) dirs.push('down')
  if (c === 0) dirs.push('left')
  if (c === COLS - 1) dirs.push('right')
  return dirs
}

/** A small drawn arrow from (x,y) pointing in `dir`, length `len`. */
function EdgeArrow({
  idx,
  dir,
  bold,
}: {
  idx: number
  dir: 'up' | 'down' | 'left' | 'right'
  bold?: boolean
}) {
  const cx = ctrX(idx)
  const cy = ctrY(idx)
  const half = CELL / 2
  const len = bold ? 22 : 16
  const head = bold ? 10 : 7
  const w = bold ? 6 : 4

  // tail point sits just outside the cell edge; tip points further out.
  let sx = cx
  let sy = cy
  let tx = cx
  let ty = cy
  if (dir === 'up') {
    sy = cy - half - 4
    ty = sy - len
  } else if (dir === 'down') {
    sy = cy + half + 4
    ty = sy + len
  } else if (dir === 'left') {
    sx = cx - half - 4
    tx = sx - len
  } else {
    sx = cx + half + 4
    tx = sx + len
  }
  if (dir === 'up' || dir === 'down') {
    sx = cx
    tx = cx
  } else {
    sy = cy
    ty = cy
  }

  const dx = tx - sx
  const dy = ty - sy
  const l = Math.hypot(dx, dy) || 1
  const ux = dx / l
  const uy = dy / l
  const px = -uy
  const py = ux
  const baseX = tx - ux * head
  const baseY = ty - uy * head

  const fillClass = bold ? '#1f2933' : '#9aa5b1'
  return (
    <g>
      <line
        x1={sx}
        y1={sy}
        x2={baseX}
        y2={baseY}
        stroke={fillClass}
        strokeWidth={w}
        strokeLinecap="round"
      />
      <polygon
        points={`${tx},${ty} ${baseX + px * head * 0.7},${baseY + py * head * 0.7} ${baseX - px * head * 0.7},${baseY - py * head * 0.7}`}
        fill={fillClass}
      />
    </g>
  )
}

/** A path segment (centre-to-centre line) between two adjacent rooms. */
function PathSegment({ from, to }: { from: number; to: number }) {
  return (
    <line
      x1={ctrX(from)}
      y1={ctrY(from)}
      x2={ctrX(to)}
      y2={ctrY(to)}
      className="stroke-qupu-brand-orange"
      strokeWidth={5}
      strokeLinecap="round"
    />
  )
}

/** One room: square cell + its number. */
function Room({
  idx,
  filled,
  even,
}: {
  idx: number
  filled?: boolean
  even?: boolean
}) {
  const x = cellX(colOf(idx))
  const y = cellY(rowOf(idx))
  const cellClass = even
    ? 'fill-qupu-peach stroke-qupu-brand-orange'
    : filled
      ? 'fill-qupu-cream stroke-qupu-brand-orange'
      : 'fill-qupu-cream stroke-qupu-brand-orange'
  return (
    <g>
      <rect x={x} y={y} width={CELL} height={CELL} className={cellClass} strokeWidth={2.5} />
      <text
        x={ctrX(idx)}
        y={ctrY(idx) + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight="bold"
        className={even ? 'fill-qupu-brand-orange' : 'fill-qupu-brand-blue'}
      >
        {ROOM_GRID[idx]}
      </text>
    </g>
  )
}

/**
 * Reusable primitive (for the animator). Draws the 4x4 numbered maze, the
 * entrance arrow, and every border exit arrow. Optionally:
 *  - `path`: an ordered list of room indices — traces Laura's route as connected
 *    centre-to-centre segments with a marker on the current head.
 *  - `highlightEven`: when true, every EVEN-numbered room is tinted (peach), so
 *    the explainer can light up the rooms that count toward the answer.
 *
 * Defaults to the bare maze (no path, no highlight) — same as the question
 * figure — so calling it with no props is safe.
 */
export function RoomMaze23G1({
  path,
  highlightEven,
}: {
  path?: number[]
  highlightEven?: boolean
} = {}) {
  const route = Array.isArray(path) ? path.filter((i) => Number.isInteger(i) && i >= 0 && i < 16) : []
  const lightEven = highlightEven === true

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(280, VIEW_W)} aria-hidden="true">
      {/* outward exit arrows on every border room */}
      {ROOM_GRID.map((_, idx) =>
        borderDirs(idx).map((dir) => <EdgeArrow key={`a-${idx}-${dir}`} idx={idx} dir={dir} />),
      )}
      {/* bold entrance arrow into the bottom-left room (drawn over the gray one) */}
      <EdgeArrow idx={ENTRANCE_INDEX} dir="left" bold />

      {/* rooms */}
      {ROOM_GRID.map((_, idx) => (
        <Room key={`r-${idx}`} idx={idx} even={lightEven && isEven(idx)} />
      ))}

      {/* traced route, if any */}
      {route.length >= 2 &&
        route.slice(1).map((to, i) => <PathSegment key={`p-${i}`} from={route[i]} to={to} />)}
      {route.length >= 1 && (
        <circle
          cx={ctrX(route[route.length - 1])}
          cy={ctrY(route[route.length - 1])}
          r={9}
          className="fill-qupu-brand-orange stroke-white"
          strokeWidth={2}
        />
      )}
    </svg>
  )
}

/**
 * Question figure: the bare 4x4 maze with the entrance + exit arrows. No route is
 * traced and no room is highlighted — the answer (6) is never shown.
 */
export default function RoomMaze23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Labirin berisi 16 kamar bernomor dalam susunan 4x4: baris atas 1 4 5 6, lalu 2 8 6 3, lalu 5 2 9 2, lalu bawah 9 4 6 8. Laura masuk lewat tanda panah ke kamar kiri bawah, berpindah antar kamar yang bersebelahan tanpa memasuki kamar yang sama dua kali, melewati tepat 8 kamar, lalu keluar lewat kamar di pinggir. Pertanyaannya: paling banyak berapa kamar bernomor genap yang bisa ia lewati?"
    >
      <RoomMaze23G1 />
    </div>
  )
}
