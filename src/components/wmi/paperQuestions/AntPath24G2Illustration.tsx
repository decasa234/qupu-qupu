// Ant-path grid illustration for WMI-24F2A-Q3
// (2024 WMI Final Grade 2 Paper A, question 3).
//
// Reconstructed faithfully from the scan
// (db/seed/wmi/figures/2024-final-g2-a-q3.jpg):
//
//   A 5-column × 5-row grid of rectangular cells.
//   Each cell is 2 cm wide and 1 cm tall (labeled in the scan).
//   The ant starts at the top at intersection (col=3, row=0),
//   marked with a filled dot and a red ant glyph.
//   The dotted path traces:
//     RIGHT  1 cell  → col 4, row 0   (1 × 2 cm = 2 cm horizontal)
//     DOWN   2 cells → col 4, row 2   (2 × 1 cm = 2 cm vertical)
//     LEFT   2 cells → col 2, row 2   (2 × 2 cm = 4 cm horizontal)
//     DOWN   3 cells → col 2, row 5   (3 × 1 cm = 3 cm vertical)
//   Total horizontal: (1+2) × 2 cm = 6 cm
//   Total vertical:   (2+3) × 1 cm = 5 cm
//   Path length:      6 + 5 = 11 cm  → answer B.
//
//   The endpoint is marked with a filled dot at (col=2, row=5).
//
// PROBLEM-ONLY: the figure shows the grid, the cell-size labels, the dotted
// path, the ant glyph, and the two endpoints. It never reveals the total or
// which choice is correct.
//
// Pure render — no params needed (static figure), SSR-safe, deterministic.

// ---------------------------------------------------------------------------
// Exported primitives (for the animator / explainer to bind to)
// ---------------------------------------------------------------------------

/** Pixel width of each grid cell in the SVG coordinate space. */
export const CELL_W = 44

/** Pixel height of each grid cell in the SVG coordinate space. */
export const CELL_H = 22

/** Number of columns and rows of CELLS (so nodes go 0..COLS and 0..ROWS). */
export const GRID_COLS = 5
export const GRID_ROWS = 5

/** Left and top padding inside the viewBox (reserves space for labels). */
export const PAD_LEFT = 14
export const PAD_TOP = 14

/** The sequence of (col, row) lattice nodes the ant visits in order. */
export const ANT_PATH: Array<[number, number]> = [
  [3, 0], // start — ant sits here
  [4, 0], // right 1
  [4, 2], // down  2
  [2, 2], // left  2
  [2, 5], // down  3 — endpoint
]

/** The start node. */
export const ANT_START = ANT_PATH[0]

/** The end node. */
export const ANT_END = ANT_PATH[ANT_PATH.length - 1]

// ---------------------------------------------------------------------------
// Helper: convert a lattice node (col, row) → SVG (x, y)
// ---------------------------------------------------------------------------
export function nodeXY(col: number, row: number): [number, number] {
  return [PAD_LEFT + col * CELL_W, PAD_TOP + row * CELL_H]
}

// ---------------------------------------------------------------------------
// The static grid + path figure (problem-only)
// ---------------------------------------------------------------------------

/** Grid background — 5 × 5 cells, light fill, thin stroke. */
function GridBackground() {
  const lines: React.ReactNode[] = []

  // vertical grid lines
  for (let c = 0; c <= GRID_COLS; c++) {
    const x = PAD_LEFT + c * CELL_W
    const y0 = PAD_TOP
    const y1 = PAD_TOP + GRID_ROWS * CELL_H
    lines.push(<line key={`v${c}`} x1={x} y1={y0} x2={x} y2={y1} stroke="#9CA3AF" strokeWidth={1} />)
  }

  // horizontal grid lines
  for (let r = 0; r <= GRID_ROWS; r++) {
    const y = PAD_TOP + r * CELL_H
    const x0 = PAD_LEFT
    const x1 = PAD_LEFT + GRID_COLS * CELL_W
    lines.push(<line key={`h${r}`} x1={x0} y1={y} x2={x1} y2={y} stroke="#9CA3AF" strokeWidth={1} />)
  }

  // cell fill (white)
  const rects: React.ReactNode[] = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      rects.push(
        <rect
          key={`cell-${r}-${c}`}
          x={PAD_LEFT + c * CELL_W}
          y={PAD_TOP + r * CELL_H}
          width={CELL_W}
          height={CELL_H}
          fill="white"
        />,
      )
    }
  }

  return (
    <g>
      {rects}
      {lines}
    </g>
  )
}

/** Dimension labels: "2 cm" on top right and "1 cm" on right side. */
function DimensionLabels() {
  // "2 cm" label with bracket over the last column at the top
  const bracketY = PAD_TOP - 6
  const bx0 = PAD_LEFT + 4 * CELL_W  // col 4 left edge
  const bx1 = PAD_LEFT + 5 * CELL_W  // col 5 (right edge of last col)
  const labelX2 = (bx0 + bx1) / 2

  // "1 cm" label with bracket on the right side of the first row
  const rx = PAD_LEFT + GRID_COLS * CELL_W + 6
  const ry0 = PAD_TOP              // row 0 top
  const ry1 = PAD_TOP + CELL_H     // row 1 top (= row 0 bottom)
  const labelY1 = (ry0 + ry1) / 2

  const INK = '#1F2937'

  return (
    <g fontSize={11} fontWeight={700} fill={INK}>
      {/* ── horizontal bracket for "2 cm" ── */}
      {/* top cap */}
      <line x1={bx0} y1={bracketY - 4} x2={bx0} y2={bracketY} stroke={INK} strokeWidth={1.5} />
      {/* horizontal bar */}
      <line x1={bx0} y1={bracketY} x2={bx1} y2={bracketY} stroke={INK} strokeWidth={1.5} />
      {/* right cap */}
      <line x1={bx1} y1={bracketY - 4} x2={bx1} y2={bracketY} stroke={INK} strokeWidth={1.5} />
      <text x={labelX2} y={bracketY - 6} textAnchor="middle" dominantBaseline="auto">
        2 cm
      </text>

      {/* ── vertical bracket for "1 cm" ── */}
      {/* top tick */}
      <line x1={rx} y1={ry0} x2={rx + 4} y2={ry0} stroke={INK} strokeWidth={1.5} />
      {/* vertical bar */}
      <line x1={rx} y1={ry0} x2={rx} y2={ry1} stroke={INK} strokeWidth={1.5} />
      {/* bottom tick */}
      <line x1={rx} y1={ry1} x2={rx + 4} y2={ry1} stroke={INK} strokeWidth={1.5} />
      <text x={rx + 7} y={labelY1} textAnchor="start" dominantBaseline="central">
        1 cm
      </text>
    </g>
  )
}

/** The dotted ant path as a polyline. */
function AntPath() {
  const pts = ANT_PATH.map(([c, r]) => nodeXY(c, r))
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  return (
    <path
      d={d}
      fill="none"
      stroke="#374151"
      strokeWidth={2.5}
      strokeDasharray="5,4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

/** Filled dot markers at start and end. */
function EndpointDots() {
  const [sx, sy] = nodeXY(...ANT_START)
  const [ex, ey] = nodeXY(...ANT_END)
  return (
    <g>
      <circle cx={sx} cy={sy} r={5} fill="#1F2937" />
      <circle cx={ex} cy={ey} r={5} fill="#1F2937" />
    </g>
  )
}

/**
 * Simple drawn ant glyph (body + head + antennae + legs).
 * Drawn in red to match the scan (the ant icon is red in the original).
 * Centered above the start node.
 */
function AntGlyph({ cx, cy }: { cx: number; cy: number }) {
  const RED = '#DC2626'
  const INK = '#1F2937'
  // Body ellipses (abdomen + thorax + head) stacked vertically
  // We'll center the ant above the given (cx,cy) point
  const bx = cx
  const by = cy - 20 // lift above the dot

  return (
    <g transform={`translate(${bx},${by})`}>
      {/* abdomen */}
      <ellipse cx={0} cy={8} rx={5} ry={7} fill={RED} />
      {/* thorax */}
      <ellipse cx={0} cy={0} rx={4} ry={4} fill={RED} />
      {/* head */}
      <ellipse cx={0} cy={-7} rx={4} ry={4} fill={RED} />
      {/* eyes */}
      <circle cx={-1.5} cy={-8} r={1} fill={INK} />
      <circle cx={1.5} cy={-8} r={1} fill={INK} />
      {/* antennae */}
      <line x1={-2} y1={-10} x2={-6} y2={-15} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <line x1={2} y1={-10} x2={6} y2={-15} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={-6} cy={-15} r={1.2} fill={INK} />
      <circle cx={6} cy={-15} r={1.2} fill={INK} />
      {/* legs — three each side */}
      {([-4, 0, 4] as const).map((dy, i) => (
        <g key={i}>
          <line x1={-4} y1={dy} x2={-9} y2={dy + 3} stroke={INK} strokeWidth={1} strokeLinecap="round" />
          <line x1={4} y1={dy} x2={9} y2={dy + 3} stroke={INK} strokeWidth={1} strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * AntPath24G2Illustration
 *
 * Static, problem-only figure for WMI-24F2A-Q3 (2024 Grade 2 Final, ant path).
 * Shows the 5×5 cell grid (2 cm wide × 1 cm tall per cell), the dotted ant
 * path, the drawn red ant at the start, and the two endpoint dots.
 * Dimension labels "2 cm" and "1 cm" match the scan.
 * Never reveals the path length (answer = 11 cm).
 *
 * Accepts `params: unknown` for signature parity with the designer slot even
 * though no params are consumed (the figure is fully determined by the problem).
 */
export default function AntPath24G2Illustration() {
  // Layout dimensions
  const labelRight = 30 // room for "1 cm" label + bracket to the right
  const labelTop = 26   // room for "2 cm" label + bracket above
  const svgW = PAD_LEFT + GRID_COLS * CELL_W + labelRight
  const svgH = labelTop + PAD_TOP + GRID_ROWS * CELL_H + 10

  const [sx, sy] = nodeXY(...ANT_START)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi 5×5 petak persegi panjang, tiap petak lebar 2 cm dan tinggi 1 cm. ' +
        'Seekor semut merayap mengikuti garis putus-putus: kanan 1 petak, turun 2 petak, ' +
        'kiri 2 petak, turun 3 petak. Tanda titik hitam di awal dan akhir lintasan.'
      }
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={Math.min(300, svgW)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={svgW} height={svgH} fill="white" />

        {/* offset the grid content downward so top labels have room */}
        <g transform={`translate(0,${labelTop - PAD_TOP})`}>
          <GridBackground />
          <AntPath />
          <EndpointDots />
          <AntGlyph cx={sx} cy={sy} />
          <DimensionLabels />
        </g>
      </svg>
    </div>
  )
}
