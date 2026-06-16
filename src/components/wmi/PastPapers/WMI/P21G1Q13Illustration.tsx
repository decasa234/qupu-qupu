// WMI-21P1A-Q13 (2021 Semifinal Grade 1) — "Count. Which figure uses the most
// blocks?" (answer D).
//
// The scanned figure db/seed/wmi/figures/2021-semifinal-g1-a-q13.jpg only
// captured Figure (A) (the comparison's other three figures were separate images
// that were not extracted). To keep the question self-contained we reconstruct a
// clean four-figure comparison: each of A–D is a small solid built from unit
// cubes drawn in isometric projection, and the learner counts the cubes of each.
// The cube counts are A = 6, B = 8, C = 7, D = 9 — D is the unique maximum, which
// matches the answer key (D). (Verified: counts are all distinct and 9 is the
// strict max.)
//
// This file draws ONLY the problem (the four plain cube figures with their A–D
// labels — never a count, never the answer). The co-exported CubeFigure /
// FIGURE_FOOTPRINTS primitives let the explainer reuse the exact same solids and
// colour the running tally post-answer.
//
// Pure render, SSR-safe & deterministic (no window/document at module top, no
// Math.random / Date.now, no state).

export type FigureLabel = 'A' | 'B' | 'C' | 'D'

/** A flat single-layer footprint: list of [x, y] cells (one unit cube each). */
export type Footprint = ReadonlyArray<readonly [number, number]>

// Four distinct flat slabs of unit cubes. Counts: A=6, B=8, C=7, D=9.
export const FIGURE_FOOTPRINTS: Record<FigureLabel, Footprint> = {
  // A — 2 × 3 slab = 6 cubes.
  A: [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
  ],
  // B — 2 × 4 slab = 8 cubes.
  B: [
    [0, 0], [1, 0], [2, 0], [3, 0],
    [0, 1], [1, 1], [2, 1], [3, 1],
  ],
  // C — an L of 7 cubes (a 2 × 3 slab with one extra cube on the front edge).
  C: [
    [0, 0], [1, 0], [2, 0], [3, 0],
    [0, 1], [1, 1], [2, 1],
  ],
  // D — 3 × 3 slab = 9 cubes (the MOST). This is the answer.
  D: [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2],
  ],
}

/** Verified cube count per figure (= footprint length). */
export const FIGURE_COUNTS: Record<FigureLabel, number> = {
  A: FIGURE_FOOTPRINTS.A.length,
  B: FIGURE_FOOTPRINTS.B.length,
  C: FIGURE_FOOTPRINTS.C.length,
  D: FIGURE_FOOTPRINTS.D.length,
}

export const FIGURE_ORDER: FigureLabel[] = ['A', 'B', 'C', 'D']

const INK = '#1F2937'
const CUBE_TOP = '#D6F0DC'
const CUBE_LEFT = '#6FB98A'
const CUBE_RIGHT = '#A9D9BC'
// Post-answer highlight (used by the explainer when a figure is the "winner").
const WIN_TOP = '#FDE68A'
const WIN_LEFT = '#E0A82E'
const WIN_RIGHT = '#F4D06A'

/**
 * CubeFigure — one flat solid of unit cubes drawn in isometric projection
 * (front-right facing). Returns a bare <g> so it can be placed inside a shared
 * SVG stage. `ox, oy` translate the whole figure; `size` is the cube edge.
 * `highlight` tints it gold (used post-answer by the explainer).
 */
export function CubeFigure({
  footprint,
  ox = 0,
  oy = 0,
  size = 16,
  highlight = false,
}: {
  footprint: Footprint
  ox?: number
  oy?: number
  size?: number
  highlight?: boolean
}) {
  const cx = size * 0.86
  const cy = size * 0.5
  // x = down-right, y = up-right, single flat layer (z = 0).
  const proj = (x: number, y: number) => ({ sx: (x + y) * cx, sy: (x - y) * cy })

  // Painter's order: back rows first (high y), then near x.
  const order = [...footprint].sort((a, b) => b[1] - a[1] || a[0] - b[0])

  const top = highlight ? WIN_TOP : CUBE_TOP
  const left = highlight ? WIN_LEFT : CUBE_LEFT
  const right = highlight ? WIN_RIGHT : CUBE_RIGHT

  return (
    <g transform={`translate(${ox} ${oy})`}>
      {order.map(([x, y], i) => {
        const { sx, sy } = proj(x, y)
        const topF = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
        const leftF = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
        const rightF = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
        return (
          <g key={i}>
            <polygon points={topF} fill={top} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={leftF} fill={left} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={rightF} fill={right} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          </g>
        )
      })}
    </g>
  )
}

// Stage layout: a 2 × 2 grid of labelled figure cells.
export const Q13_VIEW_W = 360
export const Q13_VIEW_H = 280
// Cell centres (where each footprint's [0,0] cube is roughly anchored).
const CELL: Record<FigureLabel, { lx: number; ox: number; oy: number }> = {
  A: { lx: 24, ox: 56, oy: 40 },
  B: { lx: 196, ox: 224, oy: 40 },
  C: { lx: 24, ox: 56, oy: 178 },
  D: { lx: 196, ox: 232, oy: 168 },
}

export default function P21G1Q13Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Empat bangun A, B, C, dan D yang masing-masing tersusun dari kubus satuan. Bangun manakah yang memakai paling banyak kubus?"
    >
      <svg
        viewBox={`0 0 ${Q13_VIEW_W} ${Q13_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {FIGURE_ORDER.map((label) => {
          const c = CELL[label]
          return (
            <g key={label}>
              <text x={c.lx} y={c.oy - 18} fontSize={18} fontWeight={900} fill={INK} className="font-display">
                {`(${label})`}
              </text>
              <CubeFigure footprint={FIGURE_FOOTPRINTS[label]} ox={c.ox} oy={c.oy} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
