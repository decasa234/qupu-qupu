// SEAMO-16-A-Q13 — Uncle Sam delivers a parcel from A to B on a 3×3 grid.
//
// Problem: Moving only RIGHT and UP, how many paths lead from A (bottom-left
// corner) to B (top-right corner) on the 3×3 cell grid?
// Answer: A — 20  (C(6,3) = 20, or Pascal's triangle sum at each node)
//
// The stem figure (reconstructed from 2016.imgs/011.jpg) shows:
//   • A 3×3 grid of square cells with a light blue fill and blue border lines
//   • Label "A" at the bottom-left lattice node
//   • Label "B" at the top-right lattice node
//   • A small postman glyph standing to the lower-left of "A"
//
// The figure intentionally shows ONLY the problem setup (never the answer).
// Pure render — no framer-motion, no React state/hooks, SSR-safe.

// ── Grid geometry (shared with explainer) ─────────────────────────────────────

/** Size (px) of each square cell — matches the original figure's proportions. */
export const CELL = 56

/** Number of cells along each side of the square grid. */
export const GRID_N = 3

/** Number of lattice nodes along each side (GRID_N + 1). */
export const NODES = GRID_N + 1

/** Left/top padding: leaves room for the postman glyph and labels. */
export const PAD_LEFT = 48
export const PAD_TOP = 16

/** Bottom padding: room for "A" label below the grid. */
export const PAD_BOTTOM = 28

/** Right padding: room for "B" label beside the grid. */
export const PAD_RIGHT = 24

export const SVG_W = PAD_LEFT + GRID_N * CELL + PAD_RIGHT  // 48 + 168 + 24 = 240
export const SVG_H = PAD_TOP  + GRID_N * CELL + PAD_BOTTOM // 16 + 168 + 28 = 212

// ── Coordinate helpers ────────────────────────────────────────────────────────

/**
 * Convert a lattice node (col, row) to SVG (x, y).
 * col 0 = leftmost, row 0 = TOPMOST (SVG top-down).
 * So row 0 is the TOP of the grid and row GRID_N is the BOTTOM.
 */
export function nodeXY(col: number, row: number): [number, number] {
  return [PAD_LEFT + col * CELL, PAD_TOP + row * CELL]
}

// Corner nodes in problem-space:
//   A = bottom-left  → col 0, row GRID_N
//   B = top-right    → col GRID_N, row 0
export const NODE_A: [number, number] = [0, GRID_N]
export const NODE_B: [number, number] = [GRID_N, 0]

// ── Colour tokens ─────────────────────────────────────────────────────────────

export const CELL_FILL   = '#DBEAFE'  // blue-100 — matches the light blue in the scan
const GRID_STROKE = '#3B82F6'  // blue-500 — matches the blue border in the scan
const LABEL_INK   = '#1E3A5F'  // dark navy — "A" and "B" labels
const BORDER_W    = 2.0

// ── Postman glyph (simplified SVG figure, centred at origin) ─────────────────

/**
 * A minimal postman silhouette: uniform cap, body, envelope in hand.
 * Rendered at origin; caller applies `translate(cx, cy)`.
 * Matches the blue-uniformed postman in the scan without using raster images.
 */
function PostmanGlyph({ x, y }: { x: number; y: number }) {
  const BLUE  = '#2563EB'   // uniform body
  const SKIN  = '#FBBF24'   // amber skin tone
  const NAVY  = '#1E3A5F'   // cap/boots
  const WHITE = '#F8FAFC'

  return (
    <g transform={`translate(${x},${y})`}>
      {/* cap */}
      <ellipse cx={0} cy={-28} rx={10} ry={5} fill={NAVY} />
      <rect x={-10} y={-28} width={20} height={4} fill={NAVY} rx={1} />

      {/* head */}
      <circle cx={0} cy={-18} r={9} fill={SKIN} />
      {/* eye */}
      <circle cx={3} cy={-19} r={1.5} fill={NAVY} />

      {/* body (uniform) */}
      <rect x={-9} y={-9} width={18} height={22} fill={BLUE} rx={3} />

      {/* left arm (holding envelope) */}
      <line x1={-9} y1={-5} x2={-18} y2={3} stroke={BLUE} strokeWidth={5} strokeLinecap="round" />
      {/* envelope */}
      <rect x={-25} y={1} width={14} height={10} fill={WHITE} stroke={NAVY} strokeWidth={1} rx={1} />
      <line x1={-25} y1={1} x2={-18} y2={6} stroke={NAVY} strokeWidth={0.8} />
      <line x1={-11} y1={1} x2={-18} y2={6} stroke={NAVY} strokeWidth={0.8} />

      {/* right arm */}
      <line x1={9} y1={-5} x2={15} y2={3} stroke={BLUE} strokeWidth={5} strokeLinecap="round" />

      {/* legs */}
      <line x1={-4} y1={13} x2={-6} y2={28} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
      <line x1={4} y1={13} x2={6} y2={28} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
    </g>
  )
}

// ── Grid background ───────────────────────────────────────────────────────────

function GridBackground() {
  const cells: React.ReactNode[] = []

  // Cell fills
  for (let r = 0; r < GRID_N; r++) {
    for (let c = 0; c < GRID_N; c++) {
      const [x, y] = nodeXY(c, r)
      cells.push(
        <rect
          key={`cell-${r}-${c}`}
          x={x}
          y={y}
          width={CELL}
          height={CELL}
          fill={CELL_FILL}
        />,
      )
    }
  }

  // Vertical grid lines (GRID_N + 1)
  const lines: React.ReactNode[] = []
  for (let c = 0; c <= GRID_N; c++) {
    const [x] = nodeXY(c, 0)
    const [, y0] = nodeXY(0, 0)
    const [, y1] = nodeXY(0, GRID_N)
    lines.push(
      <line
        key={`v${c}`}
        x1={x} y1={y0}
        x2={x} y2={y1}
        stroke={GRID_STROKE}
        strokeWidth={BORDER_W}
      />,
    )
  }

  // Horizontal grid lines (GRID_N + 1)
  for (let r = 0; r <= GRID_N; r++) {
    const [x0] = nodeXY(0, r)
    const [x1] = nodeXY(GRID_N, r)
    const [, y] = nodeXY(0, r)
    lines.push(
      <line
        key={`h${r}`}
        x1={x0} y1={y}
        x2={x1} y2={y}
        stroke={GRID_STROKE}
        strokeWidth={BORDER_W}
      />,
    )
  }

  return (
    <g>
      {cells}
      {lines}
    </g>
  )
}

// ── Corner labels ─────────────────────────────────────────────────────────────

function CornerLabels() {
  const [ax, ay] = nodeXY(...NODE_A)
  const [bx, by] = nodeXY(...NODE_B)

  return (
    <g
      fontFamily="system-ui, sans-serif"
      fontWeight={800}
      fontSize={16}
      fill={LABEL_INK}
    >
      {/* "A" — below and left of the bottom-left corner */}
      <text x={ax - 2} y={ay + 20} textAnchor="middle" dominantBaseline="auto">
        A
      </text>
      {/* "B" — above and right of the top-right corner */}
      <text x={bx + 2} y={by - 6} textAnchor="start" dominantBaseline="auto">
        B
      </text>
    </g>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * GridPath16A13Illustration
 *
 * Static, problem-only figure for SEAMO-16-A-Q13.
 * Shows the 3×3 square cell grid with "A" at the bottom-left corner and
 * "B" at the top-right corner, plus a simplified postman glyph next to A.
 * Never reveals that the answer is 20 paths.
 *
 * Exports `CELL`, `GRID_N`, `NODES`, `nodeXY`, `NODE_A`, `NODE_B` for the
 * explainer to reuse the same coordinate system.
 */
export default function GridPath16A13Illustration() {
  // Place the postman to the left and slightly below the "A" node
  const [ax, ay] = nodeXY(...NODE_A)
  const postmanX = ax - 32
  const postmanY = ay - 4

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi persegi 3×3 dengan titik A di sudut kiri bawah dan titik B di sudut kanan atas. ' +
        'Seorang tukang pos berdiri di dekat titik A.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(280, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        <GridBackground />
        <CornerLabels />
        <PostmanGlyph x={postmanX} y={postmanY} />
      </svg>
    </div>
  )
}
