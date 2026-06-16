/**
 * P20G2Q23Illustration — WMI-20P2A-Q23 (2020 Grade 2 Semifinal, Paper A)
 *
 * "Find the next figure according to the pattern shown."  The choices are image
 * placeholders ("see figure A/B/C/D") — answer A.
 *
 * Recovered from db/seed/wmi/figures/2020-semifinal-g2-a-q23.jpg: a sequence of
 * three 4×4 grids, each holding the SAME five arrows in the SAME five cells.
 * Only the arrow DIRECTIONS change: every arrow turns 90° clockwise from one
 * grid to the next. The fourth grid (the "?") is the answer.
 *
 *   cells (row,col):  (0,0) (1,1) (2,1) (3,0) (3,2)
 *   grid 1 dirs:       up    right left  up    down
 *   grid 2 dirs:       right down  up    right left   (each +90° CW)
 *   grid 3 dirs:       down  left  right down  up      (each +90° CW)
 *   grid 4 (answer A): left  up    down  left  right   (each +90° CW)
 *
 * The static figure draws ONLY the problem: grids 1–3, then a "?" panel. It
 * NEVER draws grid 4 — that is the explainer's job.
 *
 * Pure render — no Math.random, no Date, no window/document at module scope.
 * SSR-safe & deterministic.
 */

export type Dir = 'up' | 'right' | 'down' | 'left'

// The five fixed arrow cells (row, col), 0-indexed from the top-left.
export const Q23_CELLS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 1],
  [2, 1],
  [3, 0],
  [3, 2],
] as const

// One direction set per grid; index 0..3. Grid 3 (index 3) is the answer.
export const Q23_DIRS: ReadonlyArray<ReadonlyArray<Dir>> = [
  ['up', 'right', 'left', 'up', 'down'],
  ['right', 'down', 'up', 'right', 'left'],
  ['down', 'left', 'right', 'down', 'up'],
  ['left', 'up', 'down', 'left', 'right'], // grid 4 = answer A (each +90° CW)
] as const

// ── qupu colour tokens ─────────────────────────────────────────────────────
const GRID_LINE = '#334155'
const ARROW = '#1f2937'
const CELL = 30
const PAD = 8
export const GRID_VIEW = CELL * 4 + PAD * 2 // 136

const DIR_DEG: Record<Dir, number> = { up: -90, right: 0, down: 90, left: 180 }

/** A solid block-arrow centred in a cell, pointing in `dir`. */
function BlockArrow({ row, col, dir }: { row: number; col: number; dir: Dir }) {
  const cx = PAD + col * CELL + CELL / 2
  const cy = PAD + row * CELL + CELL / 2
  // arrow drawn pointing up, then rotated to `dir`.
  const L = 9 // shaft half-length
  const hw = 4 // shaft half-width
  const aw = 8 // head half-width
  const ah = 8 // head height
  const points = [
    [-hw, L], // bottom-left of shaft
    [-hw, -L + ah], // up-left to head base
    [-aw, -L + ah],
    [0, -L], // tip
    [aw, -L + ah],
    [hw, -L + ah],
    [hw, L],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ')
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${DIR_DEG[dir]})`}>
      <polygon points={points} fill={ARROW} />
    </g>
  )
}

export interface ArrowGrid23Props {
  /** Which direction set to draw (0..3). */
  variant: number
  /** When true, render a big "?" instead of arrows (the unknown panel). */
  unknown?: boolean
}

/** A single 4×4 grid: cell lines + the five arrows for `variant`, or a "?". */
export function ArrowGrid23({ variant, unknown = false }: ArrowGrid23Props) {
  const dirs = Q23_DIRS[variant] ?? Q23_DIRS[0]
  const lines = []
  for (let i = 0; i <= 4; i++) {
    const p = PAD + i * CELL
    lines.push(<line key={`v${i}`} x1={p} y1={PAD} x2={p} y2={PAD + 4 * CELL} stroke={GRID_LINE} strokeWidth={1.4} />)
    lines.push(<line key={`h${i}`} x1={PAD} y1={p} x2={PAD + 4 * CELL} y2={p} stroke={GRID_LINE} strokeWidth={1.4} />)
  }
  return (
    <svg viewBox={`0 0 ${GRID_VIEW} ${GRID_VIEW}`} width={GRID_VIEW} style={{ display: 'block' }} aria-hidden="true">
      <rect x={PAD} y={PAD} width={4 * CELL} height={4 * CELL} fill="#FFFFFF" />
      {lines}
      {unknown ? (
        <text x={GRID_VIEW / 2} y={GRID_VIEW / 2 + 2} textAnchor="middle" dominantBaseline="central" fontSize={48} fontWeight={900} fill={ARROW}>
          ?
        </text>
      ) : (
        Q23_CELLS.map(([r, c], i) => <BlockArrow key={i} row={r} col={c} dir={dirs[i]} />)
      )}
    </svg>
  )
}

/** A small grey chevron "⇒" connector drawn between panels. */
function Connector() {
  return (
    <svg viewBox="0 0 26 40" width={26} style={{ display: 'block' }} aria-hidden="true">
      <polygon points="2,12 14,12 14,6 24,20 14,34 14,28 2,28" fill="#C9CDD2" stroke="#9aa3b2" strokeWidth={1} />
    </svg>
  )
}

export default function P20G2Q23Illustration() {
  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Three 4 by 4 grids in a row, each holding the same five arrows in the same cells; the arrows turn as the sequence advances. A fourth grid shows a question mark for the figure to find."
    >
      <div className="flex items-center justify-center gap-2">
        <ArrowGrid23 variant={0} />
        <Connector />
        <ArrowGrid23 variant={1} />
        <Connector />
        <ArrowGrid23 variant={2} />
        <Connector />
        <ArrowGrid23 variant={0} unknown />
      </div>
    </div>
  )
}
