/**
 * P20G2Q25Illustration — WMI-20P2A-Q25 (2020 Grade 2 Semifinal, Paper A)
 *
 * "Count 1,2,3,...,10 by moving vertically or horizontally through the number
 *  grid. The figure on the left shows one of the ways. How many OTHER ways are
 *  there?"  Choices: A 8, B 7, C 6, D 5 — answer B (7).
 *
 * Recovered from db/seed/wmi/figures/2020-semifinal-g2-a-q25.jpg: a 6-row × 4-col
 * grid of numbers, an entry arrow at the top-left (the "1" cell) and an exit
 * arrow at the bottom (out of the "10" cell). One valid 1→10 path is drawn bold.
 *
 *   row 0: 1 2 3 4
 *   row 1: 2 3 6 5
 *   row 2: 4 4 7 6
 *   row 3: 6 5 8 7
 *   row 4: 7 8 9 8
 *   row 5: 5 9 10 6
 *
 * A valid path steps to an orthogonally-adjacent cell whose value is one more,
 * 1→2→…→10. A solver finds exactly 8 such paths, so there are 7 OTHER ways.
 *
 * The static figure draws ONLY the problem: the grid + the single shown path.
 * It NEVER counts the alternatives — that is the explainer's job.
 *
 * Pure render — no Math.random, no Date, no window/document at module scope.
 * SSR-safe & deterministic.
 */

export const Q25_GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [1, 2, 3, 4],
  [2, 3, 6, 5],
  [4, 4, 7, 6],
  [6, 5, 8, 7],
  [7, 8, 9, 8],
  [5, 9, 10, 6],
] as const

export const Q25_ROWS = 6
export const Q25_COLS = 4

// The single path shown in the source figure (the "one of the ways"), as
// (row, col) cells from 1 to 10. Verified to read 1,2,3,...,10.
export const Q25_SHOWN_PATH: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 0],
  [1, 1],
  [2, 1],
  [3, 1],
  [3, 0],
  [4, 0],
  [4, 1],
  [5, 1],
  [5, 2],
] as const

// ── qupu colour tokens ─────────────────────────────────────────────────────
const GRID_LINE = '#334155'
const NUM = '#1f2937'
const PATH = '#1f2937' // bold black path (matches the scan)
const ENTRY = '#1f2937'

export const CELL = 46
const PAD = 16
export const VIEW_W = Q25_COLS * CELL + PAD * 2 + 14 // headroom for the entry arrow
export const VIEW_H = Q25_ROWS * CELL + PAD * 2 + 22 // headroom for the exit arrow

const OX = PAD + 14 // grid origin x (room for left entry arrow)
const OY = PAD

export const cellCx = (c: number) => OX + c * CELL + CELL / 2
export const cellCy = (r: number) => OY + r * CELL + CELL / 2

export interface NumberGrid25Props {
  /** Cells of a path to draw bold (1→10). Pass [] for the bare grid. */
  path?: ReadonlyArray<readonly [number, number]>
  /** Path stroke colour override. */
  pathColor?: string
  /** Optional set of "branch" cells to ring (used by the explainer). */
  ringCells?: ReadonlyArray<readonly [number, number]>
  ringColor?: string
}

/** The 6×4 number grid with entry/exit arrows and an optional bold path. */
export function NumberGrid25({ path = [], pathColor = PATH, ringCells = [], ringColor = '#f0853a' }: NumberGrid25Props) {
  const lines = []
  for (let r = 0; r <= Q25_ROWS; r++) {
    const y = OY + r * CELL
    lines.push(<line key={`h${r}`} x1={OX} y1={y} x2={OX + Q25_COLS * CELL} y2={y} stroke={GRID_LINE} strokeWidth={1.4} />)
  }
  for (let c = 0; c <= Q25_COLS; c++) {
    const x = OX + c * CELL
    lines.push(<line key={`v${c}`} x1={x} y1={OY} x2={x} y2={OY + Q25_ROWS * CELL} stroke={GRID_LINE} strokeWidth={1.4} />)
  }

  const pathPts = path.map(([r, c]) => `${cellCx(c)},${cellCy(r)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: VIEW_W }} aria-hidden="true">
      <rect x={OX} y={OY} width={Q25_COLS * CELL} height={Q25_ROWS * CELL} fill="#FFFFFF" />
      {lines}

      {/* numbers */}
      {Q25_GRID.map((rowArr, r) =>
        rowArr.map((v, c) => (
          <text key={`n${r}-${c}`} x={cellCx(c)} y={cellCy(r) + 1} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={700} fill={NUM}>
            {v}
          </text>
        )),
      )}

      {/* entry arrow at the top-left cell */}
      <g stroke={ENTRY} strokeWidth={3} strokeLinecap="round">
        <line x1={2} y1={cellCy(0)} x2={OX - 4} y2={cellCy(0)} />
        <polygon points={`${OX - 4},${cellCy(0)} ${OX - 12},${cellCy(0) - 6} ${OX - 12},${cellCy(0) + 6}`} fill={ENTRY} stroke="none" />
      </g>

      {/* bold path */}
      {path.length > 1 && (
        <polyline points={pathPts} fill="none" stroke={pathColor} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      )}

      {/* exit arrow leaving the last path cell downward (or the 10 cell) */}
      {path.length > 0 &&
        (() => {
          const [r, c] = path[path.length - 1]
          const x = cellCx(c)
          const yTop = OY + (r + 1) * CELL
          return (
            <g stroke={pathColor} strokeWidth={5} strokeLinecap="round">
              <line x1={x} y1={yTop} x2={x} y2={yTop + 14} />
              <polygon points={`${x},${yTop + 22} ${x - 7},${yTop + 12} ${x + 7},${yTop + 12}`} fill={pathColor} stroke="none" />
            </g>
          )
        })()}

      {/* optional branch rings */}
      {ringCells.map(([r, c], i) => (
        <circle key={`ring${i}`} cx={cellCx(c)} cy={cellCy(r)} r={CELL / 2 - 4} fill="none" stroke={ringColor} strokeWidth={2.6} />
      ))}
    </svg>
  )
}

export default function P20G2Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 6 by 4 grid of numbers. Starting at the 1 in the top-left and stepping to an adjacent cell that is one more each time, one bold path counts 1 through 10 down to the bottom; an exit arrow leaves the 10 cell."
    >
      <NumberGrid25 path={Q25_SHOWN_PATH} />
    </div>
  )
}
