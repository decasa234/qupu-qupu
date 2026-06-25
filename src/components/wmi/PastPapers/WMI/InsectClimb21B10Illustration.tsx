// SEAMO-21-B-Q10 — Insect climbs from A to C through B
//
// Reconstructed faithfully from OCR scan + crop (2021.imgs/003.jpg):
// Two identical rectangles arranged in a staircase pattern, sharing point B.
//   Left  rect: A (col 0, row 1) → B (col 2, row 0)  — 2 cols × 1 row of cells
//   Right rect: B (col 2, row 1) → C (col 4, row 0)  — 2 cols × 1 row of cells
// Insects are shown at every lattice intersection point (6 per rectangle, B shared).
// Movement is only right or up, so:
//   Paths A→B = C(3,1) = 3,  Paths B→C = 3,  Total = 3 × 3 = 9  → Answer B.
//
// The static figure shows ONLY the problem (no highlighted paths).
// Co-exported layout constants allow the explainer to draw path overlays
// in the same coordinate system.
//
// Pure SVG, SSR-safe, deterministic.

// ── colour palette (qupu brand) ──────────────────────────────────────────────

export const CLR = {
  GRID:  '#30598A',  // qupu-brand-blue  — rectangle borders + grid lines
  DOT:   '#F5F0E8',  // qupu-cream       — lattice dot fill
  INK:   '#1F2937',  // dark ink         — labels
  A_CLR: '#f0853a',  // qupu-orange      — A label
  B_CLR: '#10B981',  // green            — B label
  C_CLR: '#DC2626',  // red              — C label
  PATH:  '#f0853a',  // orange           — path highlight (for explainer)
} as const

// ── grid layout ──────────────────────────────────────────────────────────────
// Each cell is CW wide × CH tall.  Left rect sits on rows 1..2; right rect
// sits on rows 0..1.  Together they share row 1 at column 2 (point B).
//
// Lattice coordinates (col, row):
//   A = (0, 2)   B = (2, 1)   C = (4, 0)
// All lattice points:
//   Left rect:  (0,2)(1,2)(2,2)  and  (0,1)(1,1)(2,1)
//   Right rect: (2,1)(3,1)(4,1)  and  (2,0)(3,0)(4,0)

export const CW = 70   // cell width  (px)
export const CH = 50   // cell height (px)
export const PAD = 30  // padding around the figure

/**
 * Convert lattice coordinates (col, row) → SVG pixel (x, y).
 * Row 0 is at the top; row 2 is at the bottom.
 */
export function pt(col: number, row: number): [number, number] {
  return [PAD + col * CW, PAD + row * CH]
}

// ViewBox dimensions
export const VW = PAD * 2 + 4 * CW   // 4 cell columns
export const VH = PAD * 2 + 2 * CH   // 2 cell rows

// Key named points (for explainer overlays)
export const PT_A: [number, number] = pt(0, 2)
export const PT_B: [number, number] = pt(2, 1)
export const PT_C: [number, number] = pt(4, 0)

// All lattice points used in the figure
const LEFT_LATTICE: Array<[number, number]> = [
  [0, 1], [1, 1], [2, 1],
  [0, 2], [1, 2], [2, 2],
]
const RIGHT_LATTICE: Array<[number, number]> = [
  [2, 0], [3, 0], [4, 0],
  [2, 1], [3, 1], [4, 1],
]
// All unique lattice points (B = (2,1) shared)
export const ALL_LATTICE: Array<[number, number]> = [
  ...LEFT_LATTICE,
  [2, 0], [3, 0], [4, 0],
  [3, 1], [4, 1],
]

// ── sub-components ───────────────────────────────────────────────────────────

/** One rectangle border given its four lattice corners */
function Rect({
  c0, r0, c1, r1,
}: {
  c0: number; r0: number; c1: number; r1: number
}) {
  const [x0, y0] = pt(c0, r0)
  const [x1, y1] = pt(c1, r1)
  // r0 < r1 (top < bottom in row terms)
  return (
    <rect
      x={Math.min(x0, x1)}
      y={Math.min(y0, y1)}
      width={Math.abs(x1 - x0)}
      height={Math.abs(y1 - y0)}
      fill="none"
      stroke={CLR.GRID}
      strokeWidth={2}
    />
  )
}

/** Interior grid lines for a 2-col × 1-row cell rectangle */
function GridLines({
  c0, r0, c1, r1,
}: {
  c0: number; r0: number; c1: number; r1: number
}) {
  const lines: React.JSX.Element[] = []
  // vertical interior lines at c0+1 and c0+2 (but c1 is the boundary)
  for (let c = c0 + 1; c < c1; c++) {
    const [x, y0svg] = pt(c, r0)
    const [, y1svg] = pt(c, r1)
    lines.push(
      <line
        key={`v-${c}-${r0}`}
        x1={x} y1={y0svg}
        x2={x} y2={y1svg}
        stroke={CLR.GRID}
        strokeWidth={1.5}
      />,
    )
  }
  // horizontal interior lines at r0+1 (mid-row)
  for (let r = r0 + 1; r < r1; r++) {
    const [x0svg, y] = pt(c0, r)
    const [x1svg] = pt(c1, r)
    lines.push(
      <line
        key={`h-${r}-${c0}`}
        x1={x0svg} y1={y}
        x2={x1svg} y2={y}
        stroke={CLR.GRID}
        strokeWidth={1.5}
      />,
    )
  }
  return <>{lines}</>
}

/** A dot at a lattice point */
function Dot({ col, row }: { col: number; row: number }) {
  const [x, y] = pt(col, row)
  return (
    <circle
      cx={x} cy={y} r={5}
      fill={CLR.DOT}
      stroke={CLR.GRID}
      strokeWidth={1.5}
    />
  )
}

// ── main component ────────────────────────────────────────────────────────────

/**
 * Static problem figure for SEAMO-21-B-Q10.
 * Shows two stair-stepped rectangles A→B→C with insect positions at lattice
 * points. Never reveals the answer.
 */
export default function InsectClimb21B10Illustration() {
  const [ax, ay] = PT_A
  const [bx, by] = PT_B
  const [cx, cy] = PT_C

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={Math.min(VW, 340)}
      aria-label="Two stair-stepped rectangles; point A at bottom-left, B at the middle junction, C at top-right."
      style={{ display: 'block' }}
    >
      {/* ── rectangle borders ─────────────────────────────────────────── */}
      {/* Left rectangle: cols 0–2, rows 1–2 */}
      <Rect c0={0} r0={1} c1={2} r1={2} />
      {/* Right rectangle: cols 2–4, rows 0–1 */}
      <Rect c0={2} r0={0} c1={4} r1={1} />

      {/* ── interior grid lines ───────────────────────────────────────── */}
      <GridLines c0={0} r0={1} c1={2} r1={2} />
      <GridLines c0={2} r0={0} c1={4} r1={1} />

      {/* ── lattice dots (insects) ────────────────────────────────────── */}
      {LEFT_LATTICE.map(([c, r]) => (
        <Dot key={`L-${c}-${r}`} col={c} row={r} />
      ))}
      {/* Right rect dots (skip B which is already drawn) */}
      {[[2,0],[3,0],[4,0],[3,1],[4,1]].map(([c, r]) => (
        <Dot key={`R-${c}-${r}`} col={c} row={r} />
      ))}

      {/* ── point labels ─────────────────────────────────────────────── */}
      {/* A — bottom-left (below + left) */}
      <text
        x={ax - 12} y={ay + 4}
        textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={800} fill={CLR.A_CLR}
        className="font-display"
      >
        A
      </text>

      {/* B — right-middle (above + right of center) */}
      <text
        x={bx + 13} y={by - 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={800} fill={CLR.B_CLR}
        className="font-display"
      >
        B
      </text>

      {/* C — top-right (above + right) */}
      <text
        x={cx + 12} y={cy - 4}
        textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={800} fill={CLR.C_CLR}
        className="font-display"
      >
        C
      </text>
    </svg>
  )
}
