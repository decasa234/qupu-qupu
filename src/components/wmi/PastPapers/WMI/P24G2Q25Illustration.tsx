// WMI-24P2A-Q25 (2024 Grade 2 Semifinal, Paper A) — robot digit-lattice (answer = A, 24).
//
// A robot enters at the TOP-LEFT and must reach the BOTTOM-RIGHT exit. It may only
// move LEFT, RIGHT, or DOWN (never up). Every circle it passes shows a digit; find
// the SMALLEST possible sum of the digits along a legal path.
//
// The figure (db/seed/wmi/figures/2024-semifinal-g2-a-q25.jpg) is a 6-row x 5-col
// lattice of circles, each holding a digit, joined by rounded passages. A blue
// entrance arrow sits above the top-left circle; a red exit arrow sits below the
// bottom-right circle. Digits read from the scan (row 0 = top, col 0 = left):
//
//   row0:  2 1 2 8 1
//   row1:  4 2 5 7 1
//   row2:  4 2 3 5 2
//   row3:  4 6 6 2 1
//   row4:  1 2 3 3 5
//   row5:  7 9 1 3 2
//
// SOLVER (deterministic DP over rows; on each row the robot enters at the column it
// dropped into, slides horizontally to some column over a contiguous span, then
// drops — revisiting is never cheaper, so a contiguous span is optimal):
//   minimum = 24, via cols dropped per row [enter@0, then 1,1,1,1,2, exit@4].
// One optimal path (cells r,c -> digit):
//   (0,0)2 (0,1)1 (1,1)2 (2,1)2 (3,1)6 (4,1)2 (4,2)3 (5,2)1 (5,3)3 (5,4)2  = 24
// 24 is choice A. The static figure draws ONLY the lattice + digits + the two
// arrows; no path is traced and no total is shown (the answer is never revealed).
//
// SSR-safe + deterministic: pure render of constants, no window/Date/Math.random.

export const GRID_DIGITS: number[][] = [
  [2, 1, 2, 8, 1],
  [4, 2, 5, 7, 1],
  [4, 2, 3, 5, 2],
  [4, 6, 6, 2, 1],
  [1, 2, 3, 3, 5],
  [7, 9, 1, 3, 2],
]

export const ROWS = GRID_DIGITS.length // 6
export const COLS = GRID_DIGITS[0].length // 5

export interface Node {
  r: number
  c: number
}

export const ENTRANCE: Node = { r: 0, c: 0 }
export const EXIT: Node = { r: ROWS - 1, c: COLS - 1 }

/**
 * The verified cheapest path (LEFT/RIGHT/DOWN only), as an ordered list of nodes.
 * Sum of its digits = 24 (answer A). Co-exported for the explainer.
 */
export const OPTIMAL_PATH: Node[] = [
  { r: 0, c: 0 }, // 2
  { r: 0, c: 1 }, // 1
  { r: 1, c: 1 }, // 2
  { r: 2, c: 1 }, // 2
  { r: 3, c: 1 }, // 6
  { r: 4, c: 1 }, // 2
  { r: 4, c: 2 }, // 3
  { r: 5, c: 2 }, // 1
  { r: 5, c: 3 }, // 3
  { r: 5, c: 4 }, // 2
]

export const OPTIMAL_SUM = OPTIMAL_PATH.reduce((s, n) => s + GRID_DIGITS[n.r][n.c], 0) // 24

// --- layout -------------------------------------------------------------
const GAP = 78 // centre-to-centre spacing
const NODE_R = 24 // circle radius
const PAD = 40 // outer headroom (room for the entry/exit arrows)
const LANE = 12 // passage half-width visual weight

const VIEW_W = (COLS - 1) * GAP + PAD * 2
const VIEW_H = (ROWS - 1) * GAP + PAD * 2

const nx = (c: number) => PAD + c * GAP
const ny = (r: number) => PAD + r * GAP

const LATTICE = '#b9bec6' // soft gray passages (matches scan)
const NODE_STROKE = '#b9bec6'
const DIGIT = '#2b2b2b'

/** All horizontal + vertical passages between adjacent lattice nodes. */
function Passages() {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1) lines.push({ x1: nx(c), y1: ny(r), x2: nx(c + 1), y2: ny(r), key: `h${r}-${c}` })
      if (r < ROWS - 1) lines.push({ x1: nx(c), y1: ny(r), x2: nx(c), y2: ny(r + 1), key: `v${r}-${c}` })
    }
  }
  return (
    <g>
      {lines.map((l) => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={LATTICE} strokeWidth={LANE} strokeLinecap="round" />
      ))}
    </g>
  )
}

/** One lattice node: a soft-edged circle with its digit, optionally highlighted. */
function LatticeNode({ r, c, on }: { r: number; c: number; on?: boolean }) {
  const x = nx(c)
  const y = ny(r)
  return (
    <g>
      <circle cx={x} cy={y} r={NODE_R} fill={on ? '#FDE68A' : '#ffffff'} stroke={on ? '#F59E0B' : NODE_STROKE} strokeWidth={on ? 4 : LANE} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={700} fill={DIGIT}>
        {GRID_DIGITS[r][c]}
      </text>
    </g>
  )
}

/** A short stub passage + arrow into the entrance (blue) or out of the exit (red). */
function FlowArrow({ kind }: { kind: 'in' | 'out' }) {
  const color = kind === 'in' ? '#2f8fe0' : '#e0392f'
  const x = kind === 'in' ? nx(ENTRANCE.c) : nx(EXIT.c)
  // entrance stub above the top node; exit stub below the bottom node.
  const yNode = kind === 'in' ? ny(ENTRANCE.r) : ny(EXIT.r)
  const stubFrom = kind === 'in' ? yNode - NODE_R : yNode + NODE_R
  const stubTo = kind === 'in' ? PAD - 32 : VIEW_H - PAD + 32
  const tipY = stubTo
  const dir = kind === 'in' ? -1 : 1
  const head = 9
  return (
    <g>
      {/* gray passage stub from the boundary into the node */}
      <line x1={x} y1={stubFrom} x2={x} y2={tipY - dir * head * 0.2} stroke={LATTICE} strokeWidth={LANE} strokeLinecap="round" />
      {/* coloured arrowhead pointing toward the node (in) / away (out) */}
      <polygon
        points={
          kind === 'in'
            ? `${x},${stubFrom - 2} ${x - head},${stubFrom - 2 + head} ${x + head},${stubFrom - 2 + head}`
            : `${x},${stubFrom + 14} ${x - head},${stubFrom + 14 - head} ${x + head},${stubFrom + 14 - head}`
        }
        fill={color}
      />
    </g>
  )
}

function inGrid(n: unknown): n is Node {
  return (
    typeof n === 'object' &&
    n !== null &&
    typeof (n as Node).r === 'number' &&
    typeof (n as Node).c === 'number' &&
    (n as Node).r >= 0 &&
    (n as Node).r < ROWS &&
    (n as Node).c >= 0 &&
    (n as Node).c < COLS
  )
}

/**
 * Reusable lattice primitive (for the explainer). Draws the 6x5 digit lattice,
 * its passages, and the entry/exit arrows. Optionally:
 *  - `path`: an ordered list of nodes to trace (e.g. OPTIMAL_PATH). When given,
 *    the path is drawn over the lattice as a coloured trail.
 *  - `step`: how many nodes of `path` to reveal (1..path.length). Defaults to all.
 *    `step = 1` shows just the start node lit; raise it to advance.
 *
 * Defaults to the bare lattice (no path) — identical to the question figure.
 */
export function DigitLattice({ path, step }: { path?: Array<{ r: number; c: number }>; step?: number } = {}) {
  const clean = Array.isArray(path) ? path.filter(inGrid) : []
  const shown =
    typeof step === 'number' && step >= 1 ? clean.slice(0, Math.min(step, clean.length)) : clean
  const lit = new Set(shown.map((n) => n.r * COLS + n.c))

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* base passages */}
      <Passages />

      {/* traced trail (explainer only) drawn over the base passages */}
      {shown.length >= 2 &&
        shown.slice(1).map((to, i) => (
          <line
            key={`trail${i}`}
            x1={nx(shown[i].c)}
            y1={ny(shown[i].r)}
            x2={nx(to.c)}
            y2={ny(to.r)}
            stroke="#F59E0B"
            strokeWidth={LANE}
            strokeLinecap="round"
          />
        ))}

      {/* entry + exit arrows */}
      <FlowArrow kind="in" />
      <FlowArrow kind="out" />

      {/* nodes on top */}
      {GRID_DIGITS.map((row, r) =>
        row.map((_, c) => <LatticeNode key={`n${r}-${c}`} r={r} c={c} on={lit.has(r * COLS + c)} />),
      )}
    </svg>
  )
}

export default function P24G2Q25Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A 6-row by 5-column lattice of circles, each holding a digit, joined by passages. A blue arrow enters at the top-left circle and a red arrow exits below the bottom-right circle. The robot may move only left, right, or down."
    >
      <DigitLattice />
    </div>
  )
}
