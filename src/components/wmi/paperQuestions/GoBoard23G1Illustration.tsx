// WMI-23F1A-Q1 (Grade 1) — Go board: count the black stones.
//
// The figure reproduces the Go board from the scan
//   db/seed/wmi/figures/2023-final-g1-a-q1.jpg
// — a 9x9 grid of line intersections with black (●) and white (○) stones placed
// ON the intersections. The question asks the learner to read the board and
// count black stones relative to a referenced white stone (the answer is 9; see
// the report / question wording).
//
// The static figure draws ONLY the problem: the empty grid plus every stone in
// its place. It NEVER highlights the reference white stone, tallies the blacks,
// or otherwise reveals which stones are counted — that is the animator's job
// (post-answer) via the co-exported GoBoard23G1 primitive.
//
// SSR-safe + deterministic: pure render, no Math.random, no Date, no state.
//
// Coordinates are [row, col], 0-indexed, row 0 = TOP edge, col 0 = LEFT edge.
// A stone id is `r{row}c{col}` so an animator can light specific stones.

export type StoneColor = 'black' | 'white'
export interface GoStone {
  row: number
  col: number
  color: StoneColor
}

/** Board size: a 9x9 grid (9 lines each way → intersections 0..8). */
export const GO_GRID = 9

/** id helper, e.g. stoneId(3, 4) === 'r3c4'. */
export const stoneId = (row: number, col: number) => `r${row}c${col}`

/**
 * The exact stone layout read off the scan. 18 black + 13 white = 31 stones on
 * a 9x9 board. Black stones run in a rough vertical chain down the centre with
 * scattered whites; the figure mirrors the paper as faithfully as the scan
 * allows.
 */
export const GO_STONES: GoStone[] = [
  // row 0 (top edge)
  { row: 0, col: 1, color: 'black' },
  { row: 0, col: 3, color: 'black' },
  // row 1
  { row: 1, col: 2, color: 'black' },
  { row: 1, col: 5, color: 'white' },
  { row: 1, col: 6, color: 'black' },
  { row: 1, col: 7, color: 'black' },
  // row 2
  { row: 2, col: 0, color: 'black' },
  { row: 2, col: 2, color: 'white' },
  { row: 2, col: 4, color: 'black' },
  { row: 2, col: 6, color: 'white' },
  { row: 2, col: 7, color: 'white' },
  { row: 2, col: 8, color: 'black' },
  // row 3
  { row: 3, col: 1, color: 'black' },
  { row: 3, col: 2, color: 'white' },
  { row: 3, col: 3, color: 'white' },
  { row: 3, col: 4, color: 'black' },
  { row: 3, col: 7, color: 'black' },
  // row 4
  { row: 4, col: 3, color: 'white' },
  { row: 4, col: 4, color: 'black' },
  // row 5
  { row: 5, col: 1, color: 'white' },
  { row: 5, col: 2, color: 'white' },
  { row: 5, col: 3, color: 'black' },
  { row: 5, col: 4, color: 'white' },
  // row 6
  { row: 6, col: 0, color: 'white' },
  { row: 6, col: 2, color: 'black' },
  { row: 6, col: 3, color: 'black' },
  { row: 6, col: 4, color: 'white' },
  { row: 6, col: 6, color: 'black' },
  // row 7
  { row: 7, col: 6, color: 'white' },
  // row 8 (bottom edge)
  { row: 8, col: 1, color: 'black' },
  { row: 8, col: 6, color: 'black' },
]

// --- layout -------------------------------------------------------------
const STEP = 38 // distance between adjacent intersections
const PAD = 22 // breathing room so edge stones + the frame don't clip
const STONE_R = 16 // stone radius (slightly under STEP/2 so neighbours don't touch)
const GRID_SPAN = (GO_GRID - 1) * STEP
const VIEW = GRID_SPAN + PAD * 2

const px = (col: number) => PAD + col * STEP
const py = (row: number) => PAD + row * STEP

// Raw hex is acceptable for board lines / stone fills (real-world Go colours).
const LINE = '#3a342f'
const BLACK = '#262220'
const WHITE = '#ffffff'

/** The bare grid: outer frame + inner lines. */
function Grid() {
  const lines = []
  for (let i = 0; i < GO_GRID; i++) {
    // horizontal line i
    lines.push(
      <line key={`h${i}`} x1={px(0)} y1={py(i)} x2={px(GO_GRID - 1)} y2={py(i)} stroke={LINE} strokeWidth={1.6} />,
    )
    // vertical line i
    lines.push(
      <line key={`v${i}`} x1={px(i)} y1={py(0)} x2={px(i)} y2={py(GO_GRID - 1)} stroke={LINE} strokeWidth={1.6} />,
    )
  }
  return (
    <g>
      {lines}
      {/* slightly heavier outer frame */}
      <rect
        x={px(0)}
        y={py(0)}
        width={GRID_SPAN}
        height={GRID_SPAN}
        fill="none"
        stroke={LINE}
        strokeWidth={2.4}
      />
    </g>
  )
}

/** One stone on an intersection. `lit` draws an attention ring (animator only). */
function Stone({ stone, lit }: { stone: GoStone; lit?: boolean }) {
  const cx = px(stone.col)
  const cy = py(stone.row)
  const isBlack = stone.color === 'black'
  return (
    <g>
      {lit && (
        <circle
          cx={cx}
          cy={cy}
          r={STONE_R + 4}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={3}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={STONE_R}
        fill={isBlack ? BLACK : WHITE}
        stroke={LINE}
        strokeWidth={isBlack ? 1 : 1.8}
      />
    </g>
  )
}

/**
 * Reusable primitive (for the animator). Renders the full board. Pass `litStones`
 * (a set of `r{row}c{col}` ids) to draw an orange highlight ring around chosen
 * stones — e.g. circle the reference white stone, then add black-stone ids one
 * at a time to tally them. `markWhite` is a convenience that lights every white
 * stone at once. With no props it renders the bare board (identical to the
 * question figure's stones), so it is safe as a drop-in.
 */
export function GoBoard23G1({
  markWhite = false,
  litStones = [],
}: {
  markWhite?: boolean
  litStones?: string[]
}) {
  const litSet = new Set(litStones)
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(300, VIEW)} aria-hidden="true">
      <Grid />
      {GO_STONES.map((s) => {
        const lit = litSet.has(stoneId(s.row, s.col)) || (markWhite && s.color === 'white')
        return <Stone key={stoneId(s.row, s.col)} stone={s} lit={lit} />
      })}
    </svg>
  )
}

/**
 * Question figure: the bare Go board with all stones in place and NO highlights.
 * Draws only the problem setup — the count and the reference stone are never
 * revealed here.
 */
export default function GoBoard23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Papan Go berukuran 9x9 dengan batu hitam dan batu putih diletakkan pada titik-titik perpotongan garis. Hitung banyak batu hitam yang berada di sebelah kiri batu putih sesuai pertanyaan."
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(300, VIEW)}>
        <Grid />
        {GO_STONES.map((s) => (
          <Stone key={stoneId(s.row, s.col)} stone={s} />
        ))}
      </svg>
    </div>
  )
}
