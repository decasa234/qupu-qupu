// Rotating-arrow pattern for WMI-20P3A-Q4 (2020 Semifinal G3, Q4).
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q4.jpg: three 4×4
// grids, each holding five block arrows in the SAME five cells. From one frame
// to the next every arrow turns 90° clockwise. The 4th frame (a "?") is the
// answer the student must choose — it is the next clockwise turn.
//
// Cell layout (row 0 = top, col 0 = left), arrow directions per frame:
//   cell (0,0): ↑ → → → ↓        (next = ←)
//   cell (1,1): → → ↓ → ←        (next = ↑)
//   cell (2,1): ← → ↑ → →        (next = ↓)
//   cell (3,0): ↑ → → → ↓        (next = ←)
//   cell (3,2): ↓ → ← → ↑        (next = →)
// Each arrow advances clockwise: up→right→down→left→up. Answer = frame 4 = A.

export type Dir = 'up' | 'right' | 'down' | 'left'

export const P20G3Q4_ANSWER = 'A'
export const P20G3Q4_GRID_N = 4

/** The five arrow cells. `dirs[f]` is the arrow's direction in frame f (0..3). */
export interface ArrowCell {
  row: number
  col: number
  dirs: [Dir, Dir, Dir, Dir]
}

const CW: Record<Dir, Dir> = { up: 'right', right: 'down', down: 'left', left: 'up' }

/** Build the 4 frame directions for a cell, rotating clockwise from `start`. */
function spin(row: number, col: number, start: Dir): ArrowCell {
  const dirs: Dir[] = [start]
  for (let i = 1; i < 4; i++) dirs.push(CW[dirs[i - 1]])
  return { row, col, dirs: dirs as [Dir, Dir, Dir, Dir] }
}

export const ARROW_CELLS: ReadonlyArray<ArrowCell> = [
  spin(0, 0, 'up'),
  spin(1, 1, 'right'),
  spin(2, 1, 'left'),
  spin(3, 0, 'up'),
  spin(3, 2, 'down'),
]

const INK = '#1F2937'
const GRID = '#9CA3AF'
const ARROW = '#1F2937'
const HOT = '#10B981'

export const Q4_VIEW = 200
const PAD = 14
const CELL = (Q4_VIEW - PAD * 2) / P20G3Q4_GRID_N

const cx = (col: number) => PAD + col * CELL + CELL / 2
const cy = (row: number) => PAD + row * CELL + CELL / 2

/** Outline points of a block arrow centred in cell (row,col) pointing `dir`. */
function arrowPoints(row: number, col: number, dir: Dir): string {
  const x = cx(col)
  const y = cy(row)
  const s = CELL * 0.34 // half-length along the pointing axis
  const w = CELL * 0.13 // half shaft width
  const h = CELL * 0.26 // half head width
  // Build pointing RIGHT, then rotate.
  const base: Array<[number, number]> = [
    [-s, -w],
    [s * 0.2, -w],
    [s * 0.2, -h],
    [s, 0],
    [s * 0.2, h],
    [s * 0.2, w],
    [-s, w],
  ]
  const rot = ([ax, ay]: [number, number]): [number, number] => {
    switch (dir) {
      case 'right':
        return [ax, ay]
      case 'left':
        return [-ax, ay]
      case 'down':
        return [-ay, ax]
      case 'up':
        return [ay, -ax]
    }
  }
  return base
    .map(rot)
    .map(([ax, ay]) => `${x + ax},${y + ay}`)
    .join(' ')
}

/** One 4×4 frame. `frame` 0..3 picks the arrow directions; frame 3 may be hidden. */
export function ArrowFrame({
  frame,
  hidden = false,
  hot = false,
}: {
  frame: number
  /** Draw a big "?" instead of the arrows (the unknown answer slot). */
  hidden?: boolean
  /** Tint the arrows green (used on the reveal beat). */
  hot?: boolean
}) {
  return (
    <svg viewBox={`0 0 ${Q4_VIEW} ${Q4_VIEW}`} width="100%" style={{ maxWidth: Q4_VIEW, display: 'block' }} aria-hidden="true">
      {/* grid lines */}
      {Array.from({ length: P20G3Q4_GRID_N + 1 }).map((_, i) => (
        <g key={`g${i}`}>
          <line x1={PAD} y1={PAD + i * CELL} x2={Q4_VIEW - PAD} y2={PAD + i * CELL} stroke={GRID} strokeWidth={1.5} />
          <line x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={Q4_VIEW - PAD} stroke={GRID} strokeWidth={1.5} />
        </g>
      ))}

      {hidden ? (
        <text x={Q4_VIEW / 2} y={Q4_VIEW / 2} textAnchor="middle" dominantBaseline="central" fontSize={Q4_VIEW * 0.5} fontWeight={900} fill={INK} className="font-display">
          ?
        </text>
      ) : (
        ARROW_CELLS.map((c, i) => (
          <polygon
            key={i}
            points={arrowPoints(c.row, c.col, c.dirs[frame])}
            fill={hot ? HOT : ARROW}
            stroke={hot ? HOT : ARROW}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        ))
      )}
    </svg>
  )
}

/** Small block right-arrow used between frames. */
function StepArrow() {
  return (
    <svg viewBox="0 0 40 40" width={28} height={28} aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <polygon points="4,15 22,15 22,8 36,20 22,32 22,25 4,25" fill="#CBD5E1" stroke="#94A3B8" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  )
}

/** The full strip: frames 0,1,2 then the "?" slot, with step arrows between. */
export function ArrowPatternStrip({
  revealAnswer = false,
  hotAnswer = false,
}: {
  /** Show the solved arrows in the 4th slot instead of "?". */
  revealAnswer?: boolean
  /** Tint the revealed answer green. */
  hotAnswer?: boolean
}) {
  return (
    <div className="flex w-full items-center justify-center gap-1">
      <div style={{ flex: '1 1 0', maxWidth: Q4_VIEW }}>
        <ArrowFrame frame={0} />
      </div>
      <StepArrow />
      <div style={{ flex: '1 1 0', maxWidth: Q4_VIEW }}>
        <ArrowFrame frame={1} />
      </div>
      <StepArrow />
      <div style={{ flex: '1 1 0', maxWidth: Q4_VIEW }}>
        <ArrowFrame frame={2} />
      </div>
      <StepArrow />
      <div style={{ flex: '1 1 0', maxWidth: Q4_VIEW }}>
        <ArrowFrame frame={3} hidden={!revealAnswer} hot={hotAnswer} />
      </div>
    </div>
  )
}

export default function P20G3Q4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three 4 by 4 grids of block arrows followed by a question-mark grid. From each grid to the next every arrow turns a quarter turn clockwise; find the next grid."
    >
      <ArrowPatternStrip />
    </div>
  )
}
