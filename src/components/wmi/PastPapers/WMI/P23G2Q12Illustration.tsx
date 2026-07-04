// WMI-23P2A-Q12 (2023 Grade 2 Semifinal, Paper A) — "Cover the shaded region with
// L-shaped pieces of 3 squares".
//
// Recovered from db/seed/wmi/figures/2023-semifinal-g2-a-q12.jpg:
//   An 8-column × 6-row grid of unit squares. A shaded (pink) region sits inside it,
//   reading (rows top→bottom, cols left→right, 0-indexed):
//     row 1: cols 1,2,3,4
//     row 2: cols 1,2,3,4,5
//     row 3: cols 1,2,3,4,5
//     row 4: cols 1,2,3,4
//   → 4 + 5 + 5 + 4 = 18 shaded unit squares.
//
// RECONSTRUCTION NOTE (answer-key driven): the seed's answer key is B (6) with
// choices 5–8. With 1×2 dominoes the true minimum is 18 ÷ 2 = 9, which is not
// among the choices, so the OCR'd "1×2 dominoes" cannot be the printed piece.
// 18 ÷ 3 = 6 matches the key; a straight 1×3 CANNOT tile this region (verified
// by exhaustive backtracking) but an L-shaped 3-square piece tiles it exactly
// with 6 pieces (tiling below, solver-verified). So the piece is the L-tromino.
// Question: the LEAST number of L-shaped 3-square pieces needed = 18 ÷ 3 = 6.
// The static figure reveals only the grid + shading.

export const GRID_COLS = 8
export const GRID_ROWS = 6

// Shaded cells as [row, col] (0-indexed).
export const SHADED: Array<[number, number]> = [
  [1, 1], [1, 2], [1, 3], [1, 4],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5],
  [4, 1], [4, 2], [4, 3], [4, 4],
]
export const SHADED_COUNT = SHADED.length // 18
export const MIN_PIECES = SHADED_COUNT / 3 // 6

// A verified non-overlapping L-tromino tiling of the 18 shaded cells (6 pieces).
// Each entry lists the piece's three [r, c] cells (solver-verified exact cover).
export const TILING: Array<Array<[number, number]>> = [
  [[1, 1], [1, 2], [2, 1]],
  [[1, 3], [1, 4], [2, 3]],
  [[2, 2], [3, 2], [3, 3]],
  [[2, 4], [2, 5], [3, 5]],
  [[3, 1], [4, 1], [4, 2]],
  [[3, 4], [4, 3], [4, 4]],
]

const CELL = 34
const PAD = 12
const VW = GRID_COLS * CELL + PAD * 2
const VH = GRID_ROWS * CELL + PAD * 2

const PINK = '#F6B8B8'
const PINK_STROKE = '#D98989'
const GRID_LINE = '#1F2937'

function cellX(col: number): number {
  return PAD + col * CELL
}
function cellY(row: number): number {
  return PAD + row * CELL
}

const PIECE_COLORS = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#0891B2', '#DB2777']

export interface DominoGridProps {
  /** How many L-pieces of the verified tiling to overlay (0..6). */
  placed?: number
}

/** The reusable 8×6 grid with the shaded region; optionally overlays `placed` L-pieces. */
export function DominoGrid({ placed = 0 }: DominoGridProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* shaded cells */}
      {SHADED.map(([r, c]) => (
        <rect key={`s${r}-${c}`} x={cellX(c)} y={cellY(r)} width={CELL} height={CELL} fill={PINK} stroke={PINK_STROKE} strokeWidth={0.6} />
      ))}

      {/* grid lines */}
      {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
        <line key={`v${i}`} x1={cellX(i)} y1={cellY(0)} x2={cellX(i)} y2={cellY(GRID_ROWS)} stroke={GRID_LINE} strokeWidth={1.2} />
      ))}
      {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
        <line key={`h${i}`} x1={cellX(0)} y1={cellY(i)} x2={cellX(GRID_COLS)} y2={cellY(i)} stroke={GRID_LINE} strokeWidth={1.2} />
      ))}

      {/* overlaid L-pieces (explainer only): one rounded square per covered cell,
          same colour per piece so the three cells read as one L. */}
      {TILING.slice(0, Math.max(0, Math.min(TILING.length, placed))).map((piece, i) =>
        piece.map(([r, c]) => (
          <rect
            key={`p${i}-${r}-${c}`}
            x={cellX(c) + 3}
            y={cellY(r) + 3}
            width={CELL - 6}
            height={CELL - 6}
            rx={6}
            fill={PIECE_COLORS[i % PIECE_COLORS.length]}
            opacity={0.78}
            stroke="#FFFFFF"
            strokeWidth={1.6}
          />
        )),
      )}
    </svg>
  )
}

export default function P23G2Q12Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="An 8 by 6 grid of unit squares with a shaded region of 18 squares (rows of 4, 5, 5 and 4 squares)."
    >
      <DominoGrid />
    </div>
  )
}
