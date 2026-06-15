// Vertical long-multiplication skeleton for WMI-22F3A-Q19.
//
// Layout (5 columns, c=0 = ten-thousands, c=4 = units):
//
//          col:  0    1    2    3    4
//   row 0          [  ] [ 5] [  ]            top: □ 5 □   (3-digit, middle=5)
//   row 1               [  ] [  ]            mult: □ □    (2-digit)
//   ─────────────────────────────────
//   row 2          [2 ] [ 3] [  ] [  ]       P1: 2 3 □ □  (4-digit partial ×ones)
//   row 3     [  ] [  ] [  ] [  ]            P2: □ □ □ □  (4-digit partial ×tens, shifted left)
//   ─────────────────────────────────
//   row 4     [2 ] [0 ] [2 ] [2 ] [  ]       answer: 2 0 2 2 □  (5-digit)
//
// Solution (for the animator — NOT drawn here): 256 × 79 = 20224
//   256 × 9 = 2304, 256 × 70 = 1792 (written as 1792_), total 20224.
// Answer to question (sum of all □ digits): 2+6+7+9+0+4+1+7+9+2+4 = 51.

const INK = '#1F2937'
const GRAY = '#9CA3AF'
const GREEN = '#10B981'

// 5 columns (c=0 is ten-thousands place; c=4 is units)
const BOX = 44
const GAP = 8
const LEFT_PAD = 48   // room for the × symbol
const RIGHT_PAD = 14

// x-coordinate of the left edge of a cell at column c
const COL_X = (c: number) => LEFT_PAD + c * (BOX + GAP)

// 5 rows: top, multiplier, P1, P2, product
const ROW_Y = [10, 66, 132, 196, 262]
const RULE1_Y = 122   // between multiplier row and P1 row
const RULE2_Y = 252   // between P2 row and product row

const VIEW_W = LEFT_PAD + 5 * BOX + 4 * GAP + RIGHT_PAD  // = 48 + 252 + 14 = 314
const VIEW_H = ROW_Y[4] + BOX + 18                         // = 262 + 44 + 18 = 324

// ---------------------------------------------------------------------------
// CellSpec — describes each cell in the grid.
// ---------------------------------------------------------------------------
export interface CellSpec {
  row: number
  col: number
  /** Digit shown in the original problem, or null = empty box (□). */
  given: string | null
  /** The correct digit (used by the animator when `solved` is set). */
  value: string
}

/**
 * The full cell grid for WMI-22F3A-Q19.
 *
 * Given digits (□ = unknown):
 *   top        □  5  □
 *   mult          □  □
 *   P1         2  3  □  □
 *   P2         □  □  □  □
 *   product    2  0  2  2  □
 */
export const CELLS_22G3_Q19: ReadonlyArray<CellSpec> = [
  // row 0 — top number: □ 5 □  (cols 2,3,4)
  { row: 0, col: 2, given: null,  value: '2' },
  { row: 0, col: 3, given: '5',   value: '5' },
  { row: 0, col: 4, given: null,  value: '6' },
  // row 1 — multiplier: □ □  (cols 3,4)
  { row: 1, col: 3, given: null,  value: '7' },
  { row: 1, col: 4, given: null,  value: '9' },
  // row 2 — P1: 2 3 □ □  (cols 1,2,3,4)
  { row: 2, col: 1, given: '2',   value: '2' },
  { row: 2, col: 2, given: '3',   value: '3' },
  { row: 2, col: 3, given: null,  value: '0' },
  { row: 2, col: 4, given: null,  value: '4' },
  // row 3 — P2: □ □ □ □  (cols 0,1,2,3) — shifted left one place
  { row: 3, col: 0, given: null,  value: '1' },
  { row: 3, col: 1, given: null,  value: '7' },
  { row: 3, col: 2, given: null,  value: '9' },
  { row: 3, col: 3, given: null,  value: '2' },
  // row 4 — final product: 2 0 2 2 □  (cols 0..4)
  { row: 4, col: 0, given: '2',   value: '2' },
  { row: 4, col: 1, given: '0',   value: '0' },
  { row: 4, col: 2, given: '2',   value: '2' },
  { row: 4, col: 3, given: '2',   value: '2' },
  { row: 4, col: 4, given: null,  value: '4' },
]

// ---------------------------------------------------------------------------
// MultGrid — reusable primitive the animator imports to fill boxes in.
// ---------------------------------------------------------------------------
export interface MultGridProps {
  cells: ReadonlyArray<CellSpec>
  /** Row indices whose blank boxes should be shown as solved (green fill). */
  revealRows?: number[]
  /** Row index highlighted with an amber reasoning band. */
  focusRow?: number | null
}

export function MultGrid({ cells, revealRows = [], focusRow = null }: MultGridProps) {
  const revealed = new Set(revealRows)
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* focus band */}
      {focusRow !== null && (
        <rect
          x={8}
          y={ROW_Y[focusRow] - 5}
          width={VIEW_W - 16}
          height={BOX + 10}
          rx={8}
          fill="rgba(245,158,11,0.10)"
          stroke="#D97706"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}

      {/* × symbol on the multiplier row */}
      <text
        x={LEFT_PAD / 2}
        y={ROW_Y[1] + BOX / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={800}
        fill={INK}
      >
        ×
      </text>

      {/* rule lines */}
      <line x1={14} y1={RULE1_Y} x2={VIEW_W - 14} y2={RULE1_Y} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={14} y1={RULE2_Y} x2={VIEW_W - 14} y2={RULE2_Y} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />

      {/* cells */}
      {cells.map((cell, i) => {
        const isRevealed = revealed.has(cell.row)
        const solved = cell.given === null && isRevealed
        const showDigit = cell.given !== null || isRevealed

        const cx = COL_X(cell.col)
        const cy = ROW_Y[cell.row]

        return (
          <g key={i}>
            <rect
              x={cx}
              y={cy}
              width={BOX}
              height={BOX}
              rx={6}
              fill={solved ? 'rgba(16,185,129,0.14)' : '#FFFFFF'}
              stroke={solved ? GREEN : cell.given !== null ? INK : GRAY}
              strokeWidth={solved ? 3 : cell.given !== null ? 2 : 1.6}
              strokeDasharray={cell.given === null && !solved ? '5 4' : undefined}
            />
            <text
              x={cx + BOX / 2}
              y={cy + BOX / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={22}
              fontWeight={900}
              fill={solved ? '#065F46' : cell.given !== null ? INK : GRAY}
            >
              {showDigit ? cell.value : '?'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — static in-card illustration (no revealed boxes).
// ---------------------------------------------------------------------------
export default function VerticalMult22G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Perkalian bersusun: bilangan 3 angka dengan angka tengah 5, dikalikan bilangan 2 angka; hasil kali pertama 23□□, hasil kali kedua □□□□, hasil akhir 2022□. Temukan jumlah semua angka di dalam kotak."
    >
      <MultGrid cells={CELLS_22G3_Q19} />
    </div>
  )
}
