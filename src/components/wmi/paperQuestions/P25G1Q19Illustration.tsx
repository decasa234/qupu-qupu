// In-card figure for WMI-25P1A-Q19 (2025 Grade 1 Semifinal Paper A, question 19).
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q19.jpg:
//   A grid drawn as a tilted (45°) lattice of 12 small squares — overall a
//   3-row × 4-column rectangle of unit cells. A single green apple sits in one
//   cell near the top edge.
//
// The question: "How many squares (of all sizes) contain the apple?"
//   1×1 squares containing the apple's cell: 1
//   2×2 squares containing it:               2
//   3×3 squares containing it:               1
//   Total = 4  → answer D.
//
// We draw the grid AXIS-ALIGNED (clearer for a Grade-1 reader than the scan's
// 45° tilt) as 3 columns × 4 rows, with the apple in the top-edge centre cell
// at (col 1, row 0) — the lattice position whose all-sizes square count is
// exactly 4:
//   1×1 at (col1,row0); 2×2 at (col0,row0) and (col1,row0); 3×3 at (col0,row0).
//
// PROBLEM-ONLY: shows the grid + the apple. Never draws the counted squares
// nor reveals the answer. SSR-safe + deterministic (no window/Date/random).

// ---------------------------------------------------------------------------
// Exported primitives (illustration + explainer bind to these)
// ---------------------------------------------------------------------------

/** Cells across (columns) and down (rows). */
export const GRID_COLS = 3
export const GRID_ROWS = 4

/** Pixel size of one unit cell in SVG space. */
export const CELL = 64

/** Inset so strokes / the apple never clip at the viewBox edge. */
export const PAD = 22

/** The apple's cell, as (col, row), 0-indexed from the top-left. */
export const APPLE_COL = 1
export const APPLE_ROW = 0

export const VIEW_W = PAD * 2 + GRID_COLS * CELL
export const VIEW_H = PAD * 2 + GRID_ROWS * CELL

const INK = '#3A322E'
const CELL_FILL = '#FFFFFF'

/** Top-left pixel corner of a cell at (col, row). */
export function cellXY(col: number, row: number): [number, number] {
  return [PAD + col * CELL, PAD + row * CELL]
}

/**
 * A green apple glyph centred in the cell at (col, row).
 * Single-codepoint-free pure SVG (two lobes + leaf + stem) — deterministic.
 */
export function Apple({ col, row }: { col: number; row: number }) {
  const [x, y] = cellXY(col, row)
  const cx = x + CELL / 2
  const cy = y + CELL / 2 + 3
  const r = CELL * 0.28
  return (
    <g aria-hidden="true">
      {/* two lobes for the classic apple silhouette */}
      <circle cx={cx - r * 0.42} cy={cy} r={r} fill="#8BC34A" />
      <circle cx={cx + r * 0.42} cy={cy} r={r} fill="#7CB342" />
      <circle cx={cx} cy={cy} r={r * 1.02} fill="#9CCC65" />
      {/* highlight */}
      <ellipse cx={cx - r * 0.4} cy={cy - r * 0.4} rx={r * 0.28} ry={r * 0.18} fill="#DCEDC8" opacity={0.8} />
      {/* stem */}
      <path
        d={`M ${cx} ${cy - r * 0.95} q 2 -8 0 -13`}
        fill="none"
        stroke="#6D4C41"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* leaf */}
      <ellipse
        cx={cx + 7}
        cy={cy - r - 6}
        rx={8}
        ry={4.5}
        fill="#558B2F"
        transform={`rotate(-28 ${cx + 7} ${cy - r - 6})`}
      />
    </g>
  )
}

interface GridFigureProps {
  /**
   * Optional overlay of a single highlighted square, as
   * { col, row, size } in cell units. Used only by the explainer.
   */
  highlight?: { col: number; row: number; size: number; color: string } | null
}

/** The shared grid + apple figure. */
export function AppleGrid({ highlight = null }: GridFigureProps) {
  const lines: React.ReactNode[] = []

  // cell fills
  const fills: React.ReactNode[] = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const [x, y] = cellXY(c, r)
      fills.push(<rect key={`f${r}-${c}`} x={x} y={y} width={CELL} height={CELL} fill={CELL_FILL} />)
    }
  }

  // grid lines
  for (let c = 0; c <= GRID_COLS; c++) {
    const x = PAD + c * CELL
    lines.push(<line key={`v${c}`} x1={x} y1={PAD} x2={x} y2={PAD + GRID_ROWS * CELL} stroke={INK} strokeWidth={3} strokeLinecap="round" />)
  }
  for (let r = 0; r <= GRID_ROWS; r++) {
    const y = PAD + r * CELL
    lines.push(<line key={`h${r}`} x1={PAD} y1={y} x2={PAD + GRID_COLS * CELL} y2={y} stroke={INK} strokeWidth={3} strokeLinecap="round" />)
  }

  return (
    <g>
      {fills}
      {highlight && (
        <rect
          x={PAD + highlight.col * CELL}
          y={PAD + highlight.row * CELL}
          width={highlight.size * CELL}
          height={highlight.size * CELL}
          fill={highlight.color}
          fillOpacity={0.28}
          stroke={highlight.color}
          strokeWidth={5}
          rx={4}
        />
      )}
      {lines}
      <Apple col={APPLE_COL} row={APPLE_ROW} />
    </g>
  )
}

export default function P25G1Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A grid of 12 small squares (4 rows by 3 columns) with a green apple in the top-centre cell."
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />
        <AppleGrid />
      </svg>
    </div>
  )
}
