// Chick-in-arrow-grid "follow the arrows" figure for WMI-22P1A-Q23
// (2022 WMI Semifinal Grade 1 Paper A, question 23).
//
// Redrawn from db/seed/wmi/figures/2022-semifinal-g1-a-q23.jpg (NOT embedded):
// a 6×6 grid of block arrows. A chick enters at the LEFT of row 3 and steps
// through the grid following each cell's arrow — a single arrow means move 1
// step, a double arrow 2 steps, a triple arrow 3 steps, in the arrow's
// direction. Four fruits sit just outside the grid edges:
//   • Orange      — right of row 1   (top-right corner)
//   • Strawberry  — left of row 5
//   • Grape       — below column 2
//   • Pineapple   — below column 5
//
// Cell contents read off the scan (row 1 = top, col 1 = left); dir is the
// arrow direction, n is the step count (1/2/3):
//   r1: →1  ↓1  →3  →1  →2  ←3
//   r2: ↓2  →1  ←2  ↓3  ←1  ↓1
//   r3: →1  ↑2  →2  ↑2  ↑1  ←2     (chick enters here at col 1)
//   r4: ↓2  ↓2  ←1  →2  ↓1  ↓2
//   r5: ←1  ↑1  ←2  →2  ←2  ↑3
//   r6: →3  ↓1  ↑1  →1  ↓1  ←3
//
// Simulating from (r3,c1): →1 (r3,c2) → ↑2 (r1,c2) → ↓1 (r2,c2) → →1 (r2,c3)
// → ←2 (r2,c1) → ↓2 (r4,c1) → ↓2 (r6,c1) → →3 (r6,c4) → →1 (r6,c5) → ↓1
// exits the BOTTOM edge below column 5 ⇒ the PINEAPPLE (answer C).
//
// This stem draws ONLY the problem (grid + arrows + chick + fruits) — never the
// path or the answer. The shared `ArrowGrid23` primitive accepts trail props so
// the explainer can light up the route and land on the pineapple.

export type Dir = 'right' | 'left' | 'up' | 'down'
export type FruitKind = 'orange' | 'strawberry' | 'grape' | 'pineapple'

export interface ArrowCell {
  dir: Dir
  n: 1 | 2 | 3
}

/** The 6×6 arrow grid, row-major (row 0 = top, col 0 = left). */
export const GRID: ReadonlyArray<ReadonlyArray<ArrowCell>> = [
  [
    { dir: 'right', n: 1 },
    { dir: 'down', n: 1 },
    { dir: 'right', n: 3 },
    { dir: 'right', n: 1 },
    { dir: 'right', n: 2 },
    { dir: 'left', n: 3 },
  ],
  [
    { dir: 'down', n: 2 },
    { dir: 'right', n: 1 },
    { dir: 'left', n: 2 },
    { dir: 'down', n: 3 },
    { dir: 'left', n: 1 },
    { dir: 'down', n: 1 },
  ],
  [
    { dir: 'right', n: 1 },
    { dir: 'up', n: 2 },
    { dir: 'right', n: 2 },
    { dir: 'up', n: 2 },
    { dir: 'up', n: 1 },
    { dir: 'left', n: 2 },
  ],
  [
    { dir: 'down', n: 2 },
    { dir: 'down', n: 2 },
    { dir: 'left', n: 1 },
    { dir: 'right', n: 2 },
    { dir: 'down', n: 1 },
    { dir: 'down', n: 2 },
  ],
  [
    { dir: 'left', n: 1 },
    { dir: 'up', n: 1 },
    { dir: 'left', n: 2 },
    { dir: 'right', n: 2 },
    { dir: 'left', n: 2 },
    { dir: 'up', n: 3 },
  ],
  [
    { dir: 'right', n: 3 },
    { dir: 'down', n: 1 },
    { dir: 'up', n: 1 },
    { dir: 'right', n: 1 },
    { dir: 'down', n: 1 },
    { dir: 'left', n: 3 },
  ],
]

export const GRID_N = 6

/** Chick start: it enters the LEFT edge of row 3 (index 2), heading into col 0. */
export const START_ROW = 2

const DELTA: Record<Dir, [number, number]> = {
  right: [0, 1],
  left: [0, -1],
  up: [-1, 0],
  down: [1, 0],
}

export interface PathNode {
  r: number
  c: number
}

/**
 * Cells the chick stands on, in order, starting at (START_ROW, 0). The last
 * entry is the cell it leaves the grid from; `EXIT` records where it walks off.
 */
export const PATH: ReadonlyArray<PathNode> = (() => {
  const nodes: PathNode[] = [{ r: START_ROW, c: 0 }]
  let { r, c } = nodes[0]
  for (let guard = 0; guard < 200; guard++) {
    const cell = GRID[r][c]
    const [dr, dc] = DELTA[cell.dir]
    r += dr * cell.n
    c += dc * cell.n
    if (r < 0 || r >= GRID_N || c < 0 || c >= GRID_N) break
    nodes.push({ r, c })
  }
  return nodes
})()

/** Where the chick exits, as a grid edge + the column/row it crosses. */
export const EXIT: { edge: 'bottom'; col: number } = { edge: 'bottom', col: 4 }

// ---------------------------------------------------------------- layout ---

const CELL = 84
const PAD_L = 96 // room on the left for the chick + strawberry
const PAD_T = 40 // headroom (orange peeks above row 1 on the right? no — top edge clean)
const PAD_R = 116 // room on the right for the orange
const PAD_B = 116 // room below for grape + pineapple

export const AG_VIEW_W = PAD_L + GRID_N * CELL + PAD_R // 96 + 504 + 116 = 716
export const AG_VIEW_H = PAD_T + GRID_N * CELL + PAD_B // 40 + 504 + 116 = 660

/** Top-left corner of cell (r, c). */
export const cellX = (c: number) => PAD_L + c * CELL
export const cellY = (r: number) => PAD_T + r * CELL
/** Centre of cell (r, c). */
export const cx = (c: number) => cellX(c) + CELL / 2
export const cy = (r: number) => cellY(r) + CELL / 2

const GRID_LINE = '#9CA3AF'
const ARROW_LIGHT = '#D1D5DB' // big outlined arrows (single, 1 step)
const ARROW_LIGHT_STROKE = '#6B7280'
const ARROW_DARK = '#4B5563' // small filled arrows (double / triple stacks)
const TRAIL = '#F59E0B'
const CHICK_BODY = '#FBBF24'
const HILITE = '#FEF3C7'

// ---------------------------------------------------------------- glyphs ---

/** A single big outlined block arrow centred at (x, y), pointing `dir`. */
function BlockArrow({ dir, x, y, s = 26 }: { dir: Dir; x: number; y: number; s?: number }) {
  // right-pointing block arrow around the origin
  const pts = [
    [-s, -s * 0.4],
    [s * 0.1, -s * 0.4],
    [s * 0.1, -s * 0.82],
    [s, 0],
    [s * 0.1, s * 0.82],
    [s * 0.1, s * 0.4],
    [-s, s * 0.4],
  ]
    .map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`)
    .join(' ')
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir]
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <polygon points={pts} fill={ARROW_LIGHT} stroke={ARROW_LIGHT_STROKE} strokeWidth={2} strokeLinejoin="round" />
    </g>
  )
}

/** A stack of `n` small solid triangular arrows (used for double/triple counts). */
function StackArrows({ dir, x, y, n }: { dir: Dir; x: number; y: number; n: number }) {
  // one small solid triangle pointing right, around the origin
  const t = 13
  const tri = `${t},0 ${-t * 0.7},${-t * 0.78} ${-t * 0.7},${t * 0.78}`
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir]
  // lay the n triangles along the pointing axis, centred on (x, y)
  const gap = 15
  const offsets: number[] = []
  const start = -((n - 1) * gap) / 2
  for (let i = 0; i < n; i++) offsets.push(start + i * gap)
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      {offsets.map((o, i) => (
        <polygon key={i} points={tri} transform={`translate(${o}, 0)`} fill={ARROW_DARK} />
      ))}
    </g>
  )
}

/** Render the arrow inside one cell: single = big outlined; double/triple = stack. */
export function CellArrow({ cell, x, y }: { cell: ArrowCell; x: number; y: number }) {
  if (cell.n === 1) return <BlockArrow dir={cell.dir} x={x} y={y} />
  return <StackArrows dir={cell.dir} x={x} y={y} n={cell.n} />
}

/** A small cartoon chick centred at (x, y). Single-codepoint-free pure SVG. */
export function Chick({ x, y, s = 30 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      {/* body */}
      <circle cx={x} cy={y + s * 0.1} r={s * 0.62} fill={CHICK_BODY} stroke="#D97706" strokeWidth={2} />
      {/* head */}
      <circle cx={x - s * 0.32} cy={y - s * 0.42} r={s * 0.4} fill={CHICK_BODY} stroke="#D97706" strokeWidth={2} />
      {/* eye */}
      <circle cx={x - s * 0.42} cy={y - s * 0.48} r={s * 0.07} fill="#1F2937" />
      {/* beak */}
      <polygon
        points={`${x - s * 0.72},${y - s * 0.46} ${x - s * 0.96},${y - s * 0.36} ${x - s * 0.72},${y - s * 0.26}`}
        fill="#F97316"
      />
      {/* foot */}
      <line x1={x} y1={y + s * 0.7} x2={x - s * 0.12} y2={y + s * 0.92} stroke="#F97316" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={x + s * 0.18} y1={y + s * 0.7} x2={x + s * 0.3} y2={y + s * 0.92} stroke="#F97316" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

/** Stylized fruit glyph (pure SVG, no emoji), centred at (x, y), radius r. */
export function Fruit({ kind, x, y, r = 26 }: { kind: FruitKind; x: number; y: number; r?: number }) {
  if (kind === 'orange') {
    return (
      <g>
        <circle cx={x} cy={y} r={r} fill="#FB923C" stroke="#C2410C" strokeWidth={2} />
        <line x1={x} y1={y - r * 0.9} x2={x} y2={y - r * 1.12} stroke="#15803D" strokeWidth={3} strokeLinecap="round" />
        <ellipse cx={x + r * 0.22} cy={y - r * 1.02} rx={r * 0.24} ry={r * 0.12} fill="#16A34A" transform={`rotate(-26 ${x + r * 0.22} ${y - r * 1.02})`} />
      </g>
    )
  }
  if (kind === 'strawberry') {
    const d = [
      `M ${x - r * 0.5} ${y - r * 0.12}`,
      `Q ${x} ${y - r * 0.56} ${x + r * 0.5} ${y - r * 0.12}`,
      `Q ${x + r * 0.46} ${y + r * 0.32} ${x} ${y + r * 0.66}`,
      `Q ${x - r * 0.46} ${y + r * 0.32} ${x - r * 0.5} ${y - r * 0.12}`,
      'Z',
    ].join(' ')
    const dots: Array<[number, number]> = [
      [-0.22, 0.02],
      [0.22, 0.02],
      [0, 0.24],
      [-0.1, -0.18],
      [0.12, -0.18],
    ]
    const leaf = `${x - r * 0.28},${y - r * 0.38} ${x},${y - r * 0.74} ${x + r * 0.28},${y - r * 0.38} ${x},${y - r * 0.28}`
    return (
      <g>
        <path d={d} fill="#EF4444" stroke="#B91C1C" strokeWidth={1.5} />
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={x + dx * r} cy={y + dy * r} r={r * 0.055} fill="#FFFFFF" />
        ))}
        <polygon points={leaf} fill="#16A34A" stroke="#15803D" strokeWidth={1} strokeLinejoin="round" />
      </g>
    )
  }
  if (kind === 'grape') {
    const g = r * 0.2
    const dots: Array<[number, number]> = [
      [-0.36, -0.1],
      [0, -0.1],
      [0.36, -0.1],
      [-0.18, 0.2],
      [0.18, 0.2],
      [0, 0.5],
      [0, -0.42],
    ]
    return (
      <g>
        <line x1={x} y1={y - r * 0.5} x2={x + r * 0.16} y2={y - r * 0.8} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={x + dx * r} cy={y + dy * r} r={g} fill="#7C3AED" stroke="#5B21B6" strokeWidth={1} />
        ))}
      </g>
    )
  }
  // pineapple
  return (
    <g>
      {/* body */}
      <ellipse cx={x} cy={y + r * 0.15} rx={r * 0.6} ry={r * 0.78} fill="#FBBF24" stroke="#B45309" strokeWidth={2} />
      {/* cross-hatch */}
      <line x1={x - r * 0.45} y1={y - r * 0.2} x2={x + r * 0.45} y2={y + r * 0.4} stroke="#B45309" strokeWidth={1.4} />
      <line x1={x - r * 0.45} y1={y + r * 0.4} x2={x + r * 0.45} y2={y - r * 0.2} stroke="#B45309" strokeWidth={1.4} />
      <line x1={x - r * 0.45} y1={y + r * 0.1} x2={x + r * 0.45} y2={y + r * 0.1} stroke="#B45309" strokeWidth={1.4} />
      {/* crown */}
      <polygon
        points={`${x},${y - r * 1.15} ${x - r * 0.28},${y - r * 0.5} ${x + r * 0.28},${y - r * 0.5}`}
        fill="#16A34A"
        stroke="#15803D"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <polygon points={`${x - r * 0.3},${y - r * 0.92} ${x - r * 0.5},${y - r * 0.45} ${x - r * 0.08},${y - r * 0.5}`} fill="#22C55E" />
      <polygon points={`${x + r * 0.3},${y - r * 0.92} ${x + r * 0.5},${y - r * 0.45} ${x + r * 0.08},${y - r * 0.5}`} fill="#22C55E" />
    </g>
  )
}

// Fruit anchor positions (just outside the grid edges).
const ORANGE = { x: cellX(GRID_N) + 30, y: cellY(0) + CELL / 2 } // right of row 1
const STRAWBERRY = { x: cellX(0) - 44, y: cellY(4) + CELL / 2 } // left of row 5
const GRAPE = { x: cx(1), y: cellY(GRID_N) + 38 } // below col 2
const PINEAPPLE = { x: cx(4), y: cellY(GRID_N) + 38 } // below col 5

// --------------------------------------------------------------- diagram ---

export interface ArrowGrid23Props {
  /**
   * How many path NODES to highlight (0 = none). PATH[0] is the start cell.
   * Drives the trail polyline and the chick's position on the grid.
   */
  visitedNodes?: number
  /** Draw the highlighted route over the first `visitedNodes` cells. */
  showTrail?: boolean
  /** Reveal the pineapple ring (answer) once the chick has exited. */
  revealAnswer?: boolean
}

/** Build the trail polyline points for the first `k` nodes, plus the exit stub. */
function trailPointsFor(k: number, includeExit: boolean): string {
  const pts: string[] = []
  // entry stub from the left edge into the start cell
  pts.push(`${cellX(0) - 26},${cy(START_ROW)}`)
  for (let i = 0; i < k && i < PATH.length; i++) {
    pts.push(`${cx(PATH[i].c)},${cy(PATH[i].r)}`)
  }
  if (includeExit && k >= PATH.length) {
    // last cell is (r6=5, c5=4); chick exits downward off the bottom edge
    const last = PATH[PATH.length - 1]
    pts.push(`${cx(last.c)},${cellY(GRID_N) + 18}`)
  }
  return pts.join(' ')
}

export function ArrowGrid23({ visitedNodes = 0, showTrail = false, revealAnswer = false }: ArrowGrid23Props) {
  const k = Math.max(0, Math.min(visitedNodes, PATH.length))
  const exited = k >= PATH.length
  const chick = k === 0 ? null : exited ? { x: PINEAPPLE.x, y: cellY(GRID_N) + 6 } : { x: cx(PATH[k - 1].c), y: cy(PATH[k - 1].r) }

  return (
    <svg
      viewBox={`0 0 ${AG_VIEW_W} ${AG_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* highlighted visited cells (soft fill behind the arrows) */}
      {showTrail &&
        Array.from({ length: k }, (_, i) => (
          <rect
            key={`hl-${i}`}
            x={cellX(PATH[i].c) + 2}
            y={cellY(PATH[i].r) + 2}
            width={CELL - 4}
            height={CELL - 4}
            fill={HILITE}
          />
        ))}

      {/* grid lines */}
      {Array.from({ length: GRID_N + 1 }, (_, i) => (
        <g key={`g-${i}`}>
          <line x1={cellX(0)} y1={cellY(i)} x2={cellX(GRID_N)} y2={cellY(i)} stroke={GRID_LINE} strokeWidth={1.5} />
          <line x1={cellX(i)} y1={cellY(0)} x2={cellX(i)} y2={cellY(GRID_N)} stroke={GRID_LINE} strokeWidth={1.5} />
        </g>
      ))}

      {/* arrows */}
      {GRID.map((row, r) =>
        row.map((cell, c) => <CellArrow key={`a-${r}-${c}`} cell={cell} x={cx(c)} y={cy(r)} />),
      )}

      {/* the walked trail */}
      {showTrail && k > 0 && (
        <polyline
          points={trailPointsFor(k, exited)}
          fill="none"
          stroke={TRAIL}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      )}

      {/* entry "go" wedge at the left of row 3 */}
      <polygon
        points={`${cellX(0) - 24},${cy(START_ROW) - 8} ${cellX(0) - 8},${cy(START_ROW)} ${cellX(0) - 24},${cy(START_ROW) + 8}`}
        fill="#1F2937"
      />

      {/* fruits at the grid edges */}
      <Fruit kind="orange" x={ORANGE.x} y={ORANGE.y} />
      <Fruit kind="strawberry" x={STRAWBERRY.x} y={STRAWBERRY.y} />
      <Fruit kind="grape" x={GRAPE.x} y={GRAPE.y} />
      <Fruit kind="pineapple" x={PINEAPPLE.x} y={PINEAPPLE.y} />

      {/* answer ring on the pineapple, only after exit */}
      {revealAnswer && (
        <circle cx={PINEAPPLE.x} cy={PINEAPPLE.y} r={36} fill="none" stroke={TRAIL} strokeWidth={4} />
      )}

      {/* the chick: at the entry when idle, on the grid while walking, on the
          pineapple once it has exited */}
      {k === 0 ? (
        <Chick x={cellX(0) - 60} y={cy(START_ROW)} s={30} />
      ) : (
        chick && <Chick x={chick.x} y={chick.y} s={exited ? 24 : 26} />
      )}
    </svg>
  )
}

export default function P22G1Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 6 by 6 grid of arrows. A chick enters at the left of the third row and steps through following each arrow (single = 1 step, double = 2, triple = 3). Fruits sit outside the grid: orange top-right, strawberry mid-left, grape and pineapple along the bottom. Which fruit does the chick reach?"
    >
      <ArrowGrid23 />
    </div>
  )
}
