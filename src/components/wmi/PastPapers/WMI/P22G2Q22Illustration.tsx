// Arrow-grid path figure for WMI-22P2A-Q22 (2022 Grade 2 Semifinal, Paper A).
//
// Reconstructed faithfully from db/seed/wmi/figures/2022-semifinal-g2-a-q22.jpg:
//
//   A 6×6 grid of square cells. Every cell holds one block arrow that gives a
//   DIRECTION (up / down / left / right) and a NUMBER OF STEPS shown by how many
//   chevrons it carries (one big outlined arrow = 1 step, a double chevron = 2,
//   a triple chevron = 3). A chick sits to the LEFT of the grid and a small
//   curved arrow shows it starting on the top-left arrow of its row (row 2).
//
//   Four fruits sit at the edges of the grid:
//     • orange     — to the RIGHT of the grid, level with the top row (row 0)
//     • strawberry — to the LEFT of the grid, level with row 4
//     • grapes     — BELOW the grid, under column 1
//     • pineapple  — BELOW the grid, under column 4
//
//   Following the arrow chain from the chick's start cell, the path exits the
//   grid to the EAST at row 0 — i.e. it reaches the ORANGE (answer A). The
//   static figure NEVER traces the path or names the fruit; it only shows the
//   arrows, the chick and the four edge fruits.
//
// PROBLEM-ONLY · SSR-safe · deterministic (no window/document/Math.random/Date).

import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Shared geometry + grid data (exported so the explainer binds to the SAME map)
// ---------------------------------------------------------------------------

export type Dir = 'U' | 'D' | 'L' | 'R'
/** One cell: a direction plus a step count (1, 2 or 3 chevrons). */
export type Cell = { dir: Dir; steps: number }

export const GRID_N = 6
export const CELL = 58
export const PAD = 14 // inner padding before the grid starts (room for fruit gutters)
/** Extra gutters around the grid for the edge fruits + the chick. */
export const GUT_L = 64
export const GUT_R = 58
export const GUT_T = 6
export const GUT_B = 58

/**
 * The 6×6 arrow map, row 0 = top, col 0 = left.
 * Read straight off the scan (chevron count = steps).
 */
export const ARROWS: Cell[][] = [
  // row 0
  [{ dir: 'R', steps: 1 }, { dir: 'D', steps: 1 }, { dir: 'R', steps: 3 }, { dir: 'R', steps: 1 }, { dir: 'R', steps: 2 }, { dir: 'L', steps: 3 }],
  // row 1
  [{ dir: 'D', steps: 2 }, { dir: 'R', steps: 1 }, { dir: 'L', steps: 2 }, { dir: 'D', steps: 3 }, { dir: 'L', steps: 1 }, { dir: 'D', steps: 1 }],
  // row 2  (chick starts here, on col 0)
  [{ dir: 'R', steps: 1 }, { dir: 'R', steps: 1 }, { dir: 'R', steps: 2 }, { dir: 'U', steps: 2 }, { dir: 'U', steps: 1 }, { dir: 'L', steps: 2 }],
  // row 3
  [{ dir: 'D', steps: 2 }, { dir: 'D', steps: 2 }, { dir: 'L', steps: 1 }, { dir: 'R', steps: 2 }, { dir: 'D', steps: 1 }, { dir: 'D', steps: 2 }],
  // row 4  (strawberry to the left)
  [{ dir: 'L', steps: 1 }, { dir: 'U', steps: 1 }, { dir: 'L', steps: 2 }, { dir: 'R', steps: 2 }, { dir: 'L', steps: 2 }, { dir: 'U', steps: 3 }],
  // row 5
  [{ dir: 'R', steps: 3 }, { dir: 'D', steps: 1 }, { dir: 'U', steps: 1 }, { dir: 'R', steps: 1 }, { dir: 'D', steps: 1 }, { dir: 'L', steps: 3 }],
]

/** Start cell (the chick's arrow). */
export const START: [number, number] = [2, 0]

/** Centre of cell (r, c) in SVG coords. */
export function cellCenter(r: number, c: number): [number, number] {
  return [GUT_L + PAD + c * CELL + CELL / 2, GUT_T + PAD + r * CELL + CELL / 2]
}

const DELTA: Record<Dir, [number, number]> = {
  U: [-1, 0],
  D: [1, 0],
  L: [0, -1],
  R: [0, 1],
}

/**
 * Trace the arrow chain from START. Returns the ordered list of cells visited
 * (including START) and the exit edge. Deterministic; the explainer reuses it.
 */
export function tracePath(): { cells: Array<[number, number]>; exit: 'N' | 'S' | 'E' | 'W'; exitRC: [number, number] } {
  const cells: Array<[number, number]> = [[...START] as [number, number]]
  let [r, c] = START
  for (let k = 0; k < 64; k++) {
    const { dir, steps } = ARROWS[r][c]
    const [dr, dc] = DELTA[dir]
    const nr = r + dr * steps
    const nc = c + dc * steps
    if (nr < 0 || nr >= GRID_N || nc < 0 || nc >= GRID_N) {
      const exit: 'N' | 'S' | 'E' | 'W' = nc >= GRID_N ? 'E' : nc < 0 ? 'W' : nr < 0 ? 'N' : 'S'
      return { cells, exit, exitRC: [r, c] }
    }
    r = nr
    c = nc
    cells.push([r, c])
  }
  return { cells, exit: 'E', exitRC: [r, c] }
}

// ---------------------------------------------------------------------------
// Drawing primitives
// ---------------------------------------------------------------------------

const INK = '#374151'
const ARROW_FILL = '#D1D5DB'
const ARROW_DARK = '#6B7280'
const GRID_STROKE = '#9CA3AF'

/** A single chevron (filled triangle) pointing in `dir`, centred at (0,0) of size s. */
function Chevron({ dir, s, fill }: { dir: Dir; s: number; fill: string }) {
  // base triangle pointing RIGHT, then rotate
  const h = s
  const w = s * 0.95
  const rot = dir === 'R' ? 0 : dir === 'D' ? 90 : dir === 'L' ? 180 : 270
  return (
    <g transform={`rotate(${rot})`}>
      <polygon points={`${-w / 2},${-h / 2} ${w / 2},0 ${-w / 2},${h / 2}`} fill={fill} />
    </g>
  )
}

/** A big single outlined block arrow (1 step) pointing in `dir`, centred (0,0). */
function BlockArrow({ dir }: { dir: Dir }) {
  const rot = dir === 'R' ? 0 : dir === 'D' ? 90 : dir === 'L' ? 180 : 270
  // arrow drawn pointing RIGHT in a ~36×28 box
  const pts = '-17,-7 3,-7 3,-14 17,0 3,14 3,7 -17,7'
  return (
    <g transform={`rotate(${rot})`}>
      <polygon points={pts} fill={ARROW_FILL} stroke={ARROW_DARK} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  )
}

/** Multi-chevron arrow (steps = 2 or 3 → that many filled chevrons). */
function ChevronArrow({ dir, steps }: { dir: Dir; steps: number }) {
  // lay the chevrons along the travel axis with a small gap
  const s = 15
  const gap = 9
  const total = steps
  const span = (total - 1) * gap
  const items: ReactNode[] = []
  for (let i = 0; i < total; i++) {
    const off = -span / 2 + i * gap
    const [ox, oy] = dir === 'L' || dir === 'R' ? [off, 0] : [0, off]
    items.push(
      <g key={i} transform={`translate(${ox},${oy})`}>
        <Chevron dir={dir} s={s} fill={ARROW_DARK} />
      </g>,
    )
  }
  return <g>{items}</g>
}

/** Render the arrow inside cell (r,c). */
export function ArrowGlyph({ r, c }: { r: number; c: number }) {
  const { dir, steps } = ARROWS[r][c]
  const [cx, cy] = cellCenter(r, c)
  return (
    <g transform={`translate(${cx},${cy})`}>
      {steps === 1 ? <BlockArrow dir={dir} /> : <ChevronArrow dir={dir} steps={steps} />}
    </g>
  )
}

/** Simple chick glyph (round yellow body + beak + eye), centred at (cx,cy). */
export function Chick({ cx, cy, r = 18 }: { cx: number; cy: number; r?: number }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <ellipse cx={0} cy={2} rx={r} ry={r * 0.85} fill="#FACC15" />
      <circle cx={0} cy={-r * 0.55} r={r * 0.55} fill="#FDE047" />
      <circle cx={r * 0.18} cy={-r * 0.6} r={2.2} fill="#1F2937" />
      <polygon points={`${r * 0.5},${-r * 0.55} ${r * 0.95},${-r * 0.4} ${r * 0.5},${-r * 0.25}`} fill="#F97316" />
      <path d={`M ${-r * 0.7} ${r * 0.6} q ${-6} 4 ${-2} 9`} fill="none" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** Soft rounded fruit glyphs (single shapes, no multi-codepoint emoji). */
export function Fruit({ kind, cx, cy }: { kind: 'orange' | 'strawberry' | 'grapes' | 'pineapple'; cx: number; cy: number }) {
  if (kind === 'orange') {
    return (
      <g transform={`translate(${cx},${cy})`}>
        <circle cx={0} cy={0} r={17} fill="#FB923C" stroke="#EA580C" strokeWidth={1.5} />
        <ellipse cx={0} cy={-15} rx={4} ry={2.5} fill="#65A30D" />
      </g>
    )
  }
  if (kind === 'strawberry') {
    return (
      <g transform={`translate(${cx},${cy})`}>
        <path d="M -14 -6 Q 0 -16 14 -6 Q 10 16 0 18 Q -10 16 -14 -6 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth={1.2} />
        <polygon points="-7,-8 0,-15 7,-8 2,-5 -2,-5" fill="#16A34A" />
        {[-6, 0, 6].map((x, i) => (
          <circle key={i} cx={x} cy={4} r={1.3} fill="#FEF08A" />
        ))}
      </g>
    )
  }
  if (kind === 'grapes') {
    const dots: ReactNode[] = []
    const layout: Array<[number, number]> = [
      [-7, -4], [0, -4], [7, -4],
      [-3.5, 2], [3.5, 2],
      [0, 8],
    ]
    layout.forEach(([x, y], i) => dots.push(<circle key={i} cx={x} cy={y} r={5} fill="#9333EA" stroke="#6B21A8" strokeWidth={0.8} />))
    return (
      <g transform={`translate(${cx},${cy})`}>
        <line x1={0} y1={-13} x2={0} y2={-8} stroke="#65A30D" strokeWidth={2} />
        {dots}
      </g>
    )
  }
  // pineapple
  return (
    <g transform={`translate(${cx},${cy})`}>
      <polygon points="-5,-18 0,-9 5,-18 2,-9 8,-13 0,-7 -8,-13 -2,-9" fill="#16A34A" />
      <ellipse cx={0} cy={4} rx={11} ry={14} fill="#FACC15" stroke="#CA8A04" strokeWidth={1.2} />
      <path d="M -8 -4 L 8 6 M -8 6 L 8 -4 M -8 1 L 8 1" stroke="#CA8A04" strokeWidth={0.9} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Layout helpers shared with the explainer
// ---------------------------------------------------------------------------

export const VIEW_W = GUT_L + PAD * 2 + GRID_N * CELL + GUT_R
export const VIEW_H = GUT_T + PAD * 2 + GRID_N * CELL + GUT_B

/** Fruit anchor positions (centres) in SVG coords. */
export function fruitAnchors() {
  const gridRight = GUT_L + PAD + GRID_N * CELL + PAD
  const gridLeft = GUT_L + PAD - PAD
  const gridBottom = GUT_T + PAD + GRID_N * CELL + PAD
  const [, oy] = cellCenter(0, 0)
  const [, sy] = cellCenter(4, 0)
  const [gx] = cellCenter(0, 1)
  const [px] = cellCenter(0, 4)
  return {
    orange: [gridRight + 18, oy] as [number, number],
    strawberry: [gridLeft - 18, sy] as [number, number],
    grapes: [gx, gridBottom + 18] as [number, number],
    pineapple: [px, gridBottom + 18] as [number, number],
  }
}

// ---------------------------------------------------------------------------
// Static board (problem-only); the explainer overlays the traced path on top.
// ---------------------------------------------------------------------------

export function ArrowBoard({ children }: { children?: ReactNode }) {
  const cells: ReactNode[] = []
  for (let r = 0; r < GRID_N; r++) {
    for (let c = 0; c < GRID_N; c++) {
      const x = GUT_L + PAD + c * CELL
      const y = GUT_T + PAD + r * CELL
      cells.push(<rect key={`bg-${r}-${c}`} x={x} y={y} width={CELL} height={CELL} fill="#FFFFFF" stroke={GRID_STROKE} strokeWidth={1} />)
    }
  }
  const glyphs: ReactNode[] = []
  for (let r = 0; r < GRID_N; r++) {
    for (let c = 0; c < GRID_N; c++) {
      glyphs.push(<ArrowGlyph key={`a-${r}-${c}`} r={r} c={c} />)
    }
  }

  const F = fruitAnchors()
  const [, chy] = cellCenter(...START)

  return (
    <g>
      {/* faint shaded fruit pads, like the scan */}
      <rect x={F.orange[0] - 24} y={F.orange[1] - 24} width={48} height={48} fill="#F3F4F6" />
      <rect x={F.strawberry[0] - 24} y={F.strawberry[1] - 24} width={48} height={48} fill="#F3F4F6" />
      <rect x={F.grapes[0] - 24} y={F.grapes[1] - 24} width={48} height={48} fill="#F3F4F6" />
      <rect x={F.pineapple[0] - 24} y={F.pineapple[1] - 24} width={48} height={48} fill="#F3F4F6" />

      {cells}
      {glyphs}

      {/* the chick + its little curved start arrow into col 0 */}
      <Chick cx={GUT_L + PAD - 36} cy={chy} />
      <line
        x1={GUT_L + PAD - 16}
        y1={chy}
        x2={GUT_L + PAD - 2}
        y2={chy}
        stroke={INK}
        strokeWidth={2.4}
        markerEnd="url(#p22q22-tip)"
      />

      {/* edge fruits */}
      <Fruit kind="orange" cx={F.orange[0]} cy={F.orange[1]} />
      <Fruit kind="strawberry" cx={F.strawberry[0]} cy={F.strawberry[1]} />
      <Fruit kind="grapes" cx={F.grapes[0]} cy={F.grapes[1]} />
      <Fruit kind="pineapple" cx={F.pineapple[0]} cy={F.pineapple[1]} />

      {children}
    </g>
  )
}

export function ArrowDefs() {
  return (
    <defs>
      <marker id="p22q22-tip" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <polygon points="0,0 8,4 0,8" fill={INK} />
      </marker>
      <marker id="p22q22-trail" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
        <polygon points="0,0 9,4.5 0,9" fill="#F0853A" />
      </marker>
    </defs>
  )
}

export default function P22G2Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 6 by 6 grid of arrows. A chick starts at the left of the third row. Each arrow gives a direction and how many cells to move (one big arrow is 1 step, a double chevron is 2, a triple chevron is 3). Four fruits sit at the edges: an orange to the right of the top row, a strawberry to the left, grapes and a pineapple below.'
      }
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}>
        <ArrowDefs />
        <ArrowBoard />
      </svg>
    </div>
  )
}
