// WMI-23P2A-Q18 (2023 Semifinal Grade 2 Paper A) — "At least how many ●'s
// should be put into the grid so that every row AND every column has three or
// more ●'s?"  Answer: B (4).
//
// Source figure (db/seed/wmi/figures/2023-semifinal-g2-a-q18.jpg): a 5×5 grid
// with the following filled cells (row 0 = top, col 0 = left):
//   row 0:        col 2, col 4
//   row 1:        col 1, col 2, col 3
//   row 2:        col 2, col 3
//   row 3:        col 0, col 3, col 4
//   row 4:        col 4
// Per-row counts:  [2, 3, 2, 3, 1]
// Per-col counts:  [1, 1, 3, 3, 3]
//
// SOLVER PROOF (throwaway): rows 0, 2, 4 are short of 3 by 1, 1, 2 → at least
//   1+1+2 = 4 dots must be added (a row lower bound). Columns 0, 1 are short of
//   3 by 2, 2 → at least 2+2 = 4 dots must be added (a column lower bound). Both
//   lower bounds equal 4, and 4 is achievable, e.g. adding (0,0),(2,1),(4,0),(4,1):
//   that lifts rows 0,2,4 to ≥3 and columns 0,1 to 3 at once. So the minimum is 4.
//   (Brute force over all empty-cell subsets confirms 4 is the minimum; no set of
//   3 works.)
//
// The static figure draws ONLY the grid + the existing dots. It NEVER shows the
// added dots, the deficits, or the answer — that is the explainer's job, via the
// co-exported DotGrid23 primitive (`addedCells` / `markRows` / `markCols` props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines
const DOT = '#2B2622' // the printed dots (matches the scan's dark fill)
const ADDED = '#30598a' // qupu brand blue — dots the explainer drops in

export const GRID_N = 5

export type Cell = [number, number] // [row, col], row 0 = top, col 0 = left

/** The dots already printed in the grid (from the source figure). */
export const EXISTING_DOTS: ReadonlyArray<Cell> = [
  [0, 2],
  [0, 4],
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 2],
  [2, 3],
  [3, 0],
  [3, 3],
  [3, 4],
  [4, 4],
]

/** A verified minimum set of 4 cells that brings every row & column to ≥3. */
export const ADDED_DOTS: ReadonlyArray<Cell> = [
  [0, 0],
  [2, 1],
  [4, 0],
  [4, 1],
]

// ---- layout ----------------------------------------------------------------
const PAD = 18
const CELL = 50
const BOARD = GRID_N * CELL
const VIEW = BOARD + PAD * 2

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

const key = (r: number, c: number) => `${r},${c}`

export interface DotGrid23Props {
  /** Extra dots the explainer drops in (drawn in brand blue). Omit for bare problem. */
  addedCells?: ReadonlyArray<Cell> | null
  /** Row indices to outline (the rows the explainer is reasoning about). */
  markRows?: ReadonlyArray<number> | null
  /** Column indices to outline (the columns the explainer is reasoning about). */
  markCols?: ReadonlyArray<number> | null
}

/**
 * Bare 5×5 grid + the printed dots, with optional added-dot / row / column
 * overlays for the explainer. By itself it reveals nothing about the answer.
 */
export function DotGrid23({ addedCells = null, markRows = null, markCols = null }: DotGrid23Props = {}) {
  const rowSet = new Set(markRows ?? [])
  const colSet = new Set(markCols ?? [])

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* highlighted rows: faint orange wash spanning the whole row */}
      {[...rowSet].map((r) => (
        <rect
          key={`hr-${r}`}
          x={gx(0)}
          y={gy(r)}
          width={BOARD}
          height={CELL}
          fill="rgba(240,133,58,0.14)"
        />
      ))}
      {/* highlighted columns */}
      {[...colSet].map((c) => (
        <rect
          key={`hc-${c}`}
          x={gx(c)}
          y={gy(0)}
          width={CELL}
          height={BOARD}
          fill="rgba(48,89,138,0.12)"
        />
      ))}

      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD} height={BOARD} fill="none" stroke={INK} strokeWidth={3} />

      {/* interior grid lines */}
      {Array.from({ length: GRID_N - 1 }, (_, i) => i + 1).map((i) => (
        <g key={`l-${i}`}>
          <line x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(GRID_N)} stroke={INK} strokeWidth={2} />
          <line x1={gx(0)} y1={gy(i)} x2={gx(GRID_N)} y2={gy(i)} stroke={INK} strokeWidth={2} />
        </g>
      ))}

      {/* the printed dots (always shown) */}
      {EXISTING_DOTS.map(([r, c]) => (
        <circle key={`d-${key(r, c)}`} cx={gx(c) + CELL / 2} cy={gy(r) + CELL / 2} r={CELL * 0.3} fill={DOT} />
      ))}

      {/* added dots (explainer only): brand-blue with a thin ring so they read as new */}
      {addedCells?.map(([r, c]) => (
        <g key={`a-${key(r, c)}`}>
          <circle cx={gx(c) + CELL / 2} cy={gy(r) + CELL / 2} r={CELL * 0.3} fill={ADDED} />
          <circle
            cx={gx(c) + CELL / 2}
            cy={gy(r) + CELL / 2}
            r={CELL * 0.3 + 3}
            fill="none"
            stroke={ADDED}
            strokeWidth={2}
            opacity={0.5}
          />
        </g>
      ))}
    </svg>
  )
}

/** Default export: bare grid + printed dots, no answer revealed. */
export default function P23G2Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Kisi 5 kali 5 dengan beberapa lingkaran (●) sudah terisi. Tambahkan lingkaran sesedikit mungkin agar setiap baris dan setiap kolom punya tiga atau lebih lingkaran."
    >
      <DotGrid23 />
    </div>
  )
}
