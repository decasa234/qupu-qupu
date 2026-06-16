// WMI-25F2A-Q8 (Grade 2 Final) — Gomoku / five-in-a-row board.
//
// The figure reproduces the Gomoku board from the scan
//   db/seed/wmi/figures/2025-final-g2-a-q8.jpg
// — a grid drawn on grid paper (axes labelled 0..8 on both sides, origin at the
// BOTTOM-LEFT) with black (Musa) and white (Kody) stones placed inside the
// cells. A position is written "col−row": the white stone A sits at "1−3".
// Musa must place a black stone so that five black stones line up.
//
// The static figure draws ONLY the problem: the labelled grid plus every stone
// in its place (including the lettered white stone A). It NEVER highlights the
// winning diagonal, the empty target cell (5−2), or otherwise reveals the
// answer — that is the animator/explainer's job (post-answer) via the
// co-exported GomokuBoard25G2 primitive.
//
// SSR-safe + deterministic: pure render, no Math.random, no Date, no state.
//
// Coordinates are (col, row) in the PAPER scheme: col 1..8 left→right,
// row 1..8 bottom→top — matching the axis labels and the choice strings.
// A stone id is `c{col}r{row}` so the explainer can light specific stones.

export type GomokuStoneColor = 'black' | 'white'
export interface GomokuStone {
  /** column, 1..8, left → right (matches the bottom axis label) */
  col: number
  /** row, 1..8, bottom → top (matches the left axis label) */
  row: number
  color: GomokuStoneColor
  /** optional printed letter, e.g. the referenced white stone "A" */
  label?: string
}

/** Board size: an 8×8 grid of cells; axes are labelled 0..8. */
export const GOMOKU_GRID = 8

/** id helper, e.g. stoneId(1, 3) === 'c1r3'. */
export const stoneId = (col: number, row: number) => `c${col}r${row}`

/**
 * The exact stone layout read off the scan. 7 black (Musa) + 7 white (Kody).
 * Black stones include the diagonal 1−6, 2−5, 3−4, 4−3 (four in a row going
 * down to the right); the white stone A is at 1−3. The figure mirrors the paper
 * faithfully — the answer depends on these positions, so do not "tidy" them.
 */
export const GOMOKU_STONES: GomokuStone[] = [
  // black (Musa)
  { col: 1, row: 6, color: 'black' },
  { col: 2, row: 5, color: 'black' },
  { col: 3, row: 4, color: 'black' },
  { col: 5, row: 4, color: 'black' },
  { col: 2, row: 3, color: 'black' },
  { col: 3, row: 3, color: 'black' },
  { col: 4, row: 3, color: 'black' },
  // white (Kody)
  { col: 1, row: 5, color: 'white' },
  { col: 4, row: 5, color: 'white' },
  { col: 1, row: 4, color: 'white' },
  { col: 2, row: 4, color: 'white' },
  { col: 1, row: 3, color: 'white', label: 'A' },
  { col: 3, row: 2, color: 'white' },
  { col: 4, row: 2, color: 'white' },
]

// --- layout -------------------------------------------------------------
const STEP = 34 // cell size (distance between adjacent grid lines)
const PAD_L = 24 // left padding for the y-axis number labels
const PAD_B = 24 // bottom padding for the x-axis number labels
const PAD_TR = 14 // top / right breathing room
const STONE_R = 14 // stone radius (under STEP/2 so neighbours don't touch)
const SPAN = GOMOKU_GRID * STEP // 8 cells wide / tall
const VIEW_W = PAD_L + SPAN + PAD_TR
const VIEW_H = PAD_TR + SPAN + PAD_B

// A stone at (col,row) is centred on the labelled grid line: x grows right,
// y grows up, so row 8 is near the top.
const cx = (col: number) => PAD_L + col * STEP
const cy = (row: number) => PAD_TR + (GOMOKU_GRID - row) * STEP

// Raw hex is acceptable for board lines / stone fills (real-world game colours).
const LINE = '#9aa0a6'
const AXIS = '#3a342f'
const BLACK = '#2b2622'
const WHITE = '#ffffff'

/** The bare grid: 9 horizontal + 9 vertical lines forming the 8×8 cells. */
function Grid() {
  const lines = []
  for (let i = 0; i <= GOMOKU_GRID; i++) {
    // horizontal line at grid index i (from top), and vertical line at col i
    lines.push(
      <line
        key={`h${i}`}
        x1={cx(0)}
        y1={PAD_TR + i * STEP}
        x2={cx(GOMOKU_GRID)}
        y2={PAD_TR + i * STEP}
        stroke={LINE}
        strokeWidth={1.4}
      />,
    )
    lines.push(
      <line
        key={`v${i}`}
        x1={cx(i)}
        y1={PAD_TR}
        x2={cx(i)}
        y2={PAD_TR + SPAN}
        stroke={LINE}
        strokeWidth={1.4}
      />,
    )
  }
  return <g>{lines}</g>
}

/** The 0..8 axis numbers along the bottom (x) and left (y) edges. */
function AxisLabels() {
  const labels = []
  for (let i = 0; i <= GOMOKU_GRID; i++) {
    // bottom axis: number i under the vertical line at col i
    labels.push(
      <text
        key={`x${i}`}
        x={cx(i)}
        y={PAD_TR + SPAN + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={13}
        fontWeight={700}
        fill={AXIS}
        className="font-display"
      >
        {i}
      </text>,
    )
    // left axis: number i beside the horizontal line at row i
    labels.push(
      <text
        key={`y${i}`}
        x={PAD_L - 12}
        y={cy(i)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={AXIS}
        className="font-display"
      >
        {i}
      </text>,
    )
  }
  return <g>{labels}</g>
}

/** One stone centred on its (col,row) intersection. `lit` adds an attention ring. */
function Stone({ stone, lit }: { stone: GomokuStone; lit?: boolean }) {
  const x = cx(stone.col)
  const y = cy(stone.row)
  const isBlack = stone.color === 'black'
  return (
    <g>
      {lit && (
        <circle
          cx={x}
          cy={y}
          r={STONE_R + 4}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={3}
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={STONE_R}
        fill={isBlack ? BLACK : WHITE}
        stroke={AXIS}
        strokeWidth={isBlack ? 1 : 1.8}
      />
      {stone.label && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={isBlack ? WHITE : BLACK}
          className="font-display"
        >
          {stone.label}
        </text>
      )}
    </g>
  )
}

/**
 * Reusable primitive (for the explainer/animator). Renders the full labelled
 * board. Pass `litStones` (a set of `c{col}r{row}` ids) to draw an orange
 * highlight ring around chosen stones — e.g. light the four diagonal blacks one
 * at a time, then mark the empty target cell. `target`, when given, draws a
 * dashed orange ring on an empty cell (the winning move) — used only AFTER the
 * answer is revealed, never in the question figure. With no props it renders the
 * bare board (identical to the question figure), so it is safe as a drop-in.
 */
export function GomokuBoard25G2({
  litStones = [],
  target = null,
}: {
  litStones?: string[]
  target?: { col: number; row: number } | null
}) {
  const litSet = new Set(litStones)
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(280, VIEW_W)} aria-hidden="true">
      <Grid />
      <AxisLabels />
      {target && (
        <circle
          cx={cx(target.col)}
          cy={cy(target.row)}
          r={STONE_R + 2}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={2.6}
          strokeDasharray="4 3"
        />
      )}
      {GOMOKU_STONES.map((s) => (
        <Stone key={stoneId(s.col, s.row)} stone={s} lit={litSet.has(stoneId(s.col, s.row))} />
      ))}
    </svg>
  )
}

/**
 * Question figure: the bare, labelled Gomoku board with every stone in place
 * (including the lettered white stone A) and NO highlights. Draws only the
 * problem setup — the winning diagonal and the target cell are never revealed.
 */
export function Gomoku25G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Papan Gomoku di kertas berpetak dengan sumbu berlabel 0 sampai 8. Batu hitam milik Musa dan batu putih milik Kody diletakkan pada kotak-kotak; batu putih A berada di posisi 1-3. Cari posisi batu hitam berikutnya agar lima batu hitam berjajar lurus."
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(280, VIEW_W)}>
        <Grid />
        <AxisLabels />
        {GOMOKU_STONES.map((s) => (
          <Stone key={stoneId(s.col, s.row)} stone={s} />
        ))}
      </svg>
    </div>
  )
}

export default Gomoku25G2Illustration
