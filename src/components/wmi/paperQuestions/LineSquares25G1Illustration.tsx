// WMI-25F1A-Q15 (2025 Grade 1 Final) — "There are 16 small squares in a 4x4
// grid. If one straight line is drawn, at most how many of the small squares can
// it pass through?"  Answer: 7 (choice D).
//
// REASONING: a straight line crossing an n x n grid passes through at most
// 2n - 1 cells = 2(4) - 1 = 7. The maximum is reached by a near-diagonal line
// that crosses all 3 interior vertical gridlines and all 3 interior horizontal
// gridlines at DISTINCT points (never through a lattice corner). Each gridline
// crossing moves the line into a new cell, so 1 start cell + 6 crossings = 7.
//
// OPTIMAL LINE (verified, grid units; x = col 0..4 left->right, y = row 0..4
// top->bottom): from (0, 3.6) to (4, 0.6), slope -3/4.
//   interior verticals  x=1,2,3 -> y = 2.85, 2.10, 1.35   (none on a corner)
//   interior horizontals y=1,2,3 -> x = 3.467, 2.133, 0.800 (none on a corner)
// The 7 cells it passes through (col,row; col 0 = left, row 0 = top), forming a
// staircase from the bottom-left toward the top-right:
//   (0,3) (0,2) (1,2) (2,2) (2,1) (3,1) (3,0)
//
// The static figure draws ONLY the empty 4x4 grid. It NEVER reveals the line or
// shades the 7 cells — that is the animator's job, via the co-exported
// LineSquares25G1 primitive (showLine / shadeCrossed props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines (house "ink")

export const GRID_N = 4

/** Optimal near-diagonal line endpoints in grid units (col x, row y). */
export const OPTIMAL_LINE: { from: readonly [number, number]; to: readonly [number, number] } = {
  from: [0, 3.6],
  to: [4, 0.6],
}

/**
 * The 7 cells the optimal line passes through (col, row; col 0 = left,
 * row 0 = top). Maximum is 2n - 1 = 7 for a 4x4 grid.
 */
export const CROSSED_CELLS: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [0, 2],
  [1, 2],
  [2, 2],
  [2, 1],
  [3, 1],
  [3, 0],
]

export const ANSWER = CROSSED_CELLS.length // 7

// ---- layout ----------------------------------------------------------------
const PAD = 16
const CELL = 52
const BOARD = GRID_N * CELL
const VIEW = BOARD + PAD * 2

/** Grid-unit -> SVG x. */
const gx = (c: number) => PAD + c * CELL
/** Grid-unit -> SVG y. */
const gy = (r: number) => PAD + r * CELL

export interface LineSquares25G1Props {
  /** Draw the optimal near-diagonal line on top of the grid (animator beat). */
  showLine?: boolean
  /** Shade the 7 cells the optimal line passes through (animator beat). */
  shadeCrossed?: boolean
}

/**
 * Bare 4x4 grid primitive, with optional line + crossed-cell shading for the
 * post-answer animation. By itself it reveals nothing about the answer.
 */
export function LineSquares25G1({ showLine = false, shadeCrossed = false }: LineSquares25G1Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(280, VIEW)} aria-hidden="true">
      {/* crossed cells: faint orange wash (drawn behind the gridlines) */}
      {shadeCrossed &&
        CROSSED_CELLS.map(([c, r], i) => (
          <rect
            key={`x-${i}`}
            x={gx(c)}
            y={gy(r)}
            width={CELL}
            height={CELL}
            fill="rgba(240,133,58,0.16)"
          />
        ))}

      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD} height={BOARD} fill="#FFFFFF" stroke={INK} strokeWidth={3} />

      {/* interior grid lines */}
      {Array.from({ length: GRID_N - 1 }, (_, i) => i + 1).map((i) => (
        <g key={`l-${i}`}>
          <line x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(GRID_N)} stroke={INK} strokeWidth={2.5} />
          <line x1={gx(0)} y1={gy(i)} x2={gx(GRID_N)} y2={gy(i)} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}

      {/* the optimal near-diagonal line (drawn last, on top) */}
      {showLine && (
        <line
          x1={gx(OPTIMAL_LINE.from[0])}
          y1={gy(OPTIMAL_LINE.from[1])}
          x2={gx(OPTIMAL_LINE.to[0])}
          y2={gy(OPTIMAL_LINE.to[1])}
          stroke="#f0853a"
          strokeWidth={4}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

/** Default export: bare empty 4x4 grid, no line, no answer revealed. */
export default function LineSquares25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi persegi 4 kali 4 berisi 16 kotak kecil. Jika sebuah garis lurus ditarik, paling banyak berapa kotak kecil yang dapat dilewatinya?"
    >
      <LineSquares25G1 />
    </div>
  )
}
