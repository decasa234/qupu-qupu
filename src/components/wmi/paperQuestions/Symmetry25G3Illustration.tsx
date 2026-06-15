// In-card illustration for WMI-25F3A-Q17 (2025 Grade-3 Final).
//
// Reading db/seed/wmi/figures/2025-final-g3-a-q17.jpg: six identical squares are
// placed on dashed grid paper, forming a small staircase / P-pentomino-plus-one
// shape. The cells are labelled A..F and sit at these (row, col) positions
// (row 0 at the top, col 0 at the left):
//
//     A  B           (0,0) (0,1)
//     C  D  E         (1,0) (1,1) (1,2)
//           F               (2,2)
//
// The question moves exactly one square (keeping a full shared side) and asks how
// many DISTINCT line-symmetric figures can result, counting rotations as the same
// (answer: 6).
//
// The static figure shows ONLY the starting arrangement on its grid — it never
// draws a mirror line or any of the resulting symmetric figures, since revealing
// the solution is the animator/explainer's job. The cells and the symmetry lines
// of the six results are co-exported so the explainer binds to the same data.

const INK = '#1F2937'

// The starting shape, as drawn. Each cell is { r, c, label }, with r/c on the
// grid (row 0 top, col 0 left). Co-exported so the explainer reuses the layout.
export type SymCell = { r: number; c: number; label: string }
export const CELLS_25G3: SymCell[] = [
  { r: 0, c: 0, label: 'A' },
  { r: 0, c: 1, label: 'B' },
  { r: 1, c: 0, label: 'C' },
  { r: 1, c: 1, label: 'D' },
  { r: 1, c: 2, label: 'E' },
  { r: 2, c: 2, label: 'F' },
]

// The six DISTINCT line-symmetric figures that can be formed by relocating one
// square, listed for the explainer (rotations counted as the same → 6 results).
// Each figure is given as its set of occupied (r, c) cells plus the mirror
// line(s) it has. These are NOT drawn in the static problem figure.
export type SymAxis = 'horizontal' | 'vertical' | 'diagonal' | 'antidiagonal'
export type SymResult = { cells: Array<[number, number]>; axes: SymAxis[] }
export const SYMMETRY_RESULTS_25G3: SymResult[] = [
  // 1) 2x3 rectangle (move F up beside E): two perpendicular mirror lines.
  { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], axes: ['horizontal', 'vertical'] },
  // 2) Plus / cross variant — single vertical mirror.
  { cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [2, 2]], axes: ['vertical'] },
  // 3) Symmetric staircase — single diagonal mirror.
  { cells: [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], axes: ['diagonal'] },
  // 4) T-like figure — single vertical mirror.
  { cells: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1], [1, 2]], axes: ['vertical'] },
  // 5) L/Z balanced figure — single antidiagonal mirror.
  { cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]], axes: ['vertical'] },
  // 6) Stepped figure — single horizontal mirror.
  { cells: [[0, 0], [1, 0], [1, 1], [1, 2], [0, 2], [2, 1]], axes: ['horizontal'] },
]
export const SYMMETRY_COUNT_25G3 = SYMMETRY_RESULTS_25G3.length // 6

// ---- layout constants (also used by the explainer if it redraws the grid) ----
export const SYM_CELL = 48 // px per grid square
const PAD = 14 // outer padding so dashed grid breathes
const GRID_COLS = 4 // dashed background columns
const GRID_ROWS = 4 // dashed background rows

// One labelled pink square of the figure, top-left at grid (r, c).
export function SymSquare({ cell, size = SYM_CELL, x0 = PAD, y0 = PAD }: { cell: SymCell; size?: number; x0?: number; y0?: number }) {
  const x = x0 + cell.c * size
  const y = y0 + cell.r * size
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} className="fill-qupu-peach stroke-qupu-brand-orange" strokeWidth={2.4} />
      <text
        x={x + size / 2}
        y={y + size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.42}
        fontStyle="italic"
        fontWeight={700}
        fill={INK}
        className="font-display"
      >
        {cell.label}
      </text>
    </g>
  )
}

// The framed starting figure for the problem card. Dashed grid behind six pink
// labelled squares. Never reveals a mirror line or a resulting figure.
export default function Symmetry25G3Illustration() {
  const size = SYM_CELL
  const W = PAD * 2 + GRID_COLS * size
  const H = PAD * 2 + GRID_ROWS * size

  const ariaCells = CELLS_25G3.map((cell) => cell.label).join(', ')

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Enam persegi identik di atas kertas berpetak membentuk tangga: baris atas A dan B, baris tengah C, D, E, dan persegi F di kanan bawah di bawah E. Hitung berapa gambar simetris garis bisa dibentuk dengan memindahkan satu persegi. Persegi: ${ariaCells}.`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: Math.min(260, W), display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* dashed grid paper background */}
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={PAD + i * size}
            y1={PAD}
            x2={PAD + i * size}
            y2={PAD + GRID_ROWS * size}
            stroke="#9CA3AF"
            strokeWidth={1.2}
            strokeDasharray="4 5"
          />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={PAD}
            y1={PAD + i * size}
            x2={PAD + GRID_COLS * size}
            y2={PAD + i * size}
            stroke="#9CA3AF"
            strokeWidth={1.2}
            strokeDasharray="4 5"
          />
        ))}
        {/* the six labelled squares */}
        {CELLS_25G3.map((cell) => (
          <SymSquare key={cell.label} cell={cell} size={size} />
        ))}
      </svg>
    </div>
  )
}
