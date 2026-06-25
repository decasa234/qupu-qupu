// SEAMO-19-B-Q22 — "How many ways to travel from A to B passing through C and D?"
// Source: docs/reference/ocr-res/seamo/contest/paper-b/2019.imgs/011.jpg
//
// The figure is a 4-row × 5-column grid of rectangular cells (lattice: 5 rows × 6 cols
// of intersection nodes). Movement: RIGHT or UP only.
//
// Lattice coordinates (col, row), row=0 at top, row=4 at bottom:
//   A = (0, 4)  — bottom-left corner
//   B = (5, 0)  — top-right corner
//   C = (2, 3)  — interior dot (2 right, 1 up from A)
//   D = (4, 2)  — interior dot (4 right, 2 up from A)
//
// Path count: A→C: C(3,2)=3; C→D: C(3,2)=3; D→B: C(3,1)=3 → total = 3×3×3 = 27.
// Answer: 27 (confirmed in paper answer key).
//
// Illustration shows ONLY the problem (grid + labels A,B,C,D with dots). No answer.
// SSR-safe — no hooks, no motion imports.

// ── Grid constants ─────────────────────────────────────────────────────────────
/** Width of each cell in SVG units. */
const CW = 44
/** Height of each cell in SVG units. */
const CH = 36
/** Number of columns of CELLS (so lattice cols = COLS+1 = 0..5). */
const COLS = 5
/** Number of rows of CELLS (so lattice rows = ROWS+1 = 0..4). */
const ROWS = 4
/** Padding to make room for A and B corner labels. */
const PAD = 20

// Total SVG dimensions
const SVG_W = PAD + COLS * CW + PAD
const SVG_H = PAD + ROWS * CH + PAD

// ── Helper ─────────────────────────────────────────────────────────────────────
/** Map lattice (col, row) → SVG pixel (x, y). Row 0 = top. */
function xy(col: number, row: number): [number, number] {
  return [PAD + col * CW, PAD + row * CH]
}

// ── Waypoints ──────────────────────────────────────────────────────────────────
const A: [number, number] = [0, 4]
const B: [number, number] = [5, 0]
const C: [number, number] = [2, 3]
const D: [number, number] = [4, 2]

// ── Sub-components ─────────────────────────────────────────────────────────────

function GridLines() {
  const lines: React.ReactNode[] = []
  // vertical lines: col 0..COLS
  for (let c = 0; c <= COLS; c++) {
    const [x0] = xy(c, 0)
    const [, y0] = xy(c, 0)
    const [, y1] = xy(c, ROWS)
    lines.push(
      <line
        key={`v${c}`}
        x1={x0} y1={y0}
        x2={x0} y2={y1}
        stroke="#374151"
        strokeWidth={1.2}
      />,
    )
  }
  // horizontal lines: row 0..ROWS
  for (let r = 0; r <= ROWS; r++) {
    const [x0, y0] = xy(0, r)
    const [x1] = xy(COLS, r)
    lines.push(
      <line
        key={`h${r}`}
        x1={x0} y1={y0}
        x2={x1} y2={y0}
        stroke="#374151"
        strokeWidth={1.2}
      />,
    )
  }
  return <g>{lines}</g>
}

function CornerLabels() {
  const [ax, ay] = xy(...A)
  const [bx, by] = xy(...B)
  const INK = '#111827'
  return (
    <g fontFamily="system-ui,sans-serif" fontSize={15} fontWeight="700" fill={INK}>
      {/* A — bottom-left, outside the grid */}
      <text x={ax - 14} y={ay + 16} textAnchor="middle" dominantBaseline="auto">
        A
      </text>
      {/* B — top-right, outside the grid */}
      <text x={bx + 14} y={by - 6} textAnchor="middle" dominantBaseline="auto">
        B
      </text>
    </g>
  )
}

function WaypointDot({
  col,
  row,
  label,
}: {
  col: number
  row: number
  label: string
}) {
  const [cx, cy] = xy(col, row)
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#111827" />
      {/* Label: C and D appear to the right-bottom of their dot in the scan */}
      <text
        x={cx + 9}
        y={cy + 12}
        fontFamily="system-ui,sans-serif"
        fontSize={13}
        fontWeight="700"
        fill="#111827"
        textAnchor="start"
        dominantBaseline="auto"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────────

/**
 * GridRoute19B22Illustration
 *
 * Stem illustration for SEAMO-19-B-Q22 (2019 Paper B, Question 22).
 *
 * Displays the 4-row × 5-column rectangular lattice grid with corner labels A
 * (bottom-left) and B (top-right), and interior waypoint dots for C and D.
 * Movement is right or up only; the student must count paths A→C→D→B.
 * The answer (27) is NEVER shown — this is a problem-only figure.
 *
 * SSR-safe: no hooks, no animation imports, pure SVG geometry.
 */
export default function GridRoute19B22Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi 4 baris × 5 kolom persegi panjang. ' +
        'Titik A di sudut kiri bawah, titik B di sudut kanan atas. ' +
        'Titik C ditandai di dalam kisi (2 petak ke kanan, 1 petak ke atas dari A). ' +
        'Titik D ditandai di dalam kisi (4 petak ke kanan, 2 petak ke atas dari A). ' +
        'Hitung banyaknya cara dari A ke B melalui C lalu D (hanya bergerak ke kanan atau ke atas).'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* grid lines */}
        <GridLines />

        {/* interior waypoint dots: C and D */}
        <WaypointDot col={C[0]} row={C[1]} label="C" />
        <WaypointDot col={D[0]} row={D[1]} label="D" />

        {/* corner labels */}
        <CornerLabels />
      </svg>
    </div>
  )
}
