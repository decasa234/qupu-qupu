// WMI-22P1A-Q21 (2022 Semifinal Grade 1, Paper A) — fill 1–9 into a 3×3 square.
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g1-a-q21.jpg: a single 3×3
// square. Some cells are pre-filled; a row sum sits to the right of the TOP row
// and three column sums sit below. One column sum is the unknown ★.
//
//   given grid          5            row sums (right):  top row = 11
//                9                   col sums (below):   18   ★   13
//                   6  1
//
//   GIVEN: cell(0,1)=5, cell(1,0)=9, cell(2,1)=6, cell(2,2)=1
//
// SOLVE (backtracking, digits 1–9 once each) — UNIQUE solution:
//        2 5 4
//        9 3 8
//        7 6 1
//   top row  : 2+5+4 = 11  ✓
//   col 0    : 2+9+7 = 18  ✓
//   col 2    : 4+8+1 = 13  ✓
//   col 1 (★): 5+3+6 = 14
//
// The full question (this is one of two squares) asks ★ + ♦; the partner square
// gives ♦ = 6, so ★ + ♦ = 14 + 6 = 20 (answer B). The static figure shows ONLY
// the given square — the four given digits, the row sum, the two known column
// sums and the ★ placeholder — never the solution or any answer.
//
// Pure render: no Math.random / Date / window — SSR-safe & deterministic.

export type Cell = number | null

// Given clues (figure order, top row first); null = empty box.
export const GIVEN: Cell[][] = [
  [null, 5, null],
  [9, null, null],
  [null, 6, 1],
]

// Verified unique solution.
export const SOLUTION: number[][] = [
  [2, 5, 4],
  [9, 3, 8],
  [7, 6, 1],
]

export const TOP_ROW_SUM = 11
export const COL_SUMS: Array<number | 'star'> = [18, 'star', 13]
export const STAR_VALUE = SOLUTION[0][1] + SOLUTION[1][1] + SOLUTION[2][1] // 14
export const DIAMOND_VALUE = 6 // partner square (off-figure)
export const STAR_PLUS_DIAMOND = STAR_VALUE + DIAMOND_VALUE // 20
export const ANSWER_LETTER = 'B'

const INK = '#1F2937'
const FILL = '#DDE9C3' // pale green grid fill (matches the scan)
const RED = '#E0383B'

export const Q21_VIEW_W = 268
export const Q21_VIEW_H = 268

const CELL = 60
const GRID_X = 18
const GRID_Y = 18

/** A red five-point star centred at (cx, cy). */
function StarGlyph({ cx, cy, r = 14 }: { cx: number; cy: number; r?: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={RED} />
}

export interface SquareGridProps {
  /** Tint these cells (row,col) amber. */
  highlightCells?: Array<[number, number]>
  /** Tint the column index amber (its boxes + its sum). */
  highlightCol?: number | null
  /** Tint the top row amber (its boxes + its sum). */
  highlightTopRow?: boolean
  /** Fill empty boxes with the solved digits. */
  showSolution?: boolean
  /** Reveal the ★ column-sum value beside the star. */
  revealStar?: boolean
  /** Show "★ + ♦ = 20" badge under the square. */
  showAnswer?: boolean
}

/**
 * Reusable primitive: the 3×3 square with its four given digits, the top-row sum
 * and the two known column sums + ★. Optional props let the explainer light a
 * row/column, fill the solution, reveal ★, and show the final answer. Defaults
 * draw the plain problem figure.
 */
export function SquareGrid({
  highlightCells = [],
  highlightCol = null,
  highlightTopRow = false,
  showSolution = false,
  revealStar = false,
  showAnswer = false,
}: SquareGridProps) {
  const gridW = CELL * 3
  const gridH = CELL * 3
  const hiCells = new Set(highlightCells.map(([r, c]) => `${r},${c}`))

  return (
    <svg
      viewBox={`0 0 ${Q21_VIEW_W} ${Q21_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* base fill */}
      <rect x={GRID_X} y={GRID_Y} width={gridW} height={gridH} fill={FILL} />

      {/* highlight tints */}
      {highlightTopRow && <rect x={GRID_X} y={GRID_Y} width={gridW} height={CELL} fill="#FEF3C7" />}
      {highlightCol !== null && (
        <rect x={GRID_X + highlightCol * CELL} y={GRID_Y} width={CELL} height={gridH} fill="#FEF3C7" />
      )}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) =>
          hiCells.has(`${r},${c}`) ? (
            <rect key={`hc${r}-${c}`} x={GRID_X + c * CELL} y={GRID_Y + r * CELL} width={CELL} height={CELL} fill="#FDE68A" />
          ) : null,
        ),
      )}

      {/* grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={GRID_X} y1={GRID_Y + i * CELL} x2={GRID_X + gridW} y2={GRID_Y + i * CELL} stroke={INK} strokeWidth={2.5} />
          <line x1={GRID_X + i * CELL} y1={GRID_Y} x2={GRID_X + i * CELL} y2={GRID_Y + gridH} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}

      {/* digits: given (ink, bold) + solved (green when showSolution) */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => {
          const cx = GRID_X + c * CELL + CELL / 2
          const cy = GRID_Y + r * CELL + CELL / 2
          const given = GIVEN[r][c]
          if (given !== null) {
            return (
              <text key={`g${r}-${c}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill={INK}>
                {given}
              </text>
            )
          }
          if (showSolution) {
            return (
              <text key={`s${r}-${c}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill="#15803D">
                {SOLUTION[r][c]}
              </text>
            )
          }
          return null
        }),
      )}

      {/* top-row sum, to the right */}
      <text
        x={GRID_X + gridW + 24}
        y={GRID_Y + CELL / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={highlightTopRow ? '#B45309' : INK}
      >
        {TOP_ROW_SUM}
      </text>

      {/* column sums, below */}
      {COL_SUMS.map((sum, c) => {
        const cx = GRID_X + c * CELL + CELL / 2
        const cy = GRID_Y + gridH + 24
        const lit = highlightCol === c
        if (sum === 'star') {
          return (
            <g key={`cs${c}`}>
              <StarGlyph cx={cx} cy={cy} />
              {revealStar && (
                <g>
                  <rect x={cx + 14} y={cy - 13} width={34} height={26} rx={8} fill="#D1FAE5" stroke="#10B981" strokeWidth={2} />
                  <text x={cx + 31} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill="#065F46">
                    {`=${STAR_VALUE}`}
                  </text>
                </g>
              )}
            </g>
          )
        }
        return (
          <text key={`cs${c}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={lit ? '#B45309' : INK}>
            {sum}
          </text>
        )
      })}

      {/* final answer badge */}
      {showAnswer && (
        <g>
          <rect x={Q21_VIEW_W / 2 - 78} y={Q21_VIEW_H - 26} width={156} height={24} rx={12} fill="#D1FAE5" stroke="#10B981" strokeWidth={2} />
          <text x={Q21_VIEW_W / 2} y={Q21_VIEW_H - 14} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill="#065F46">
            {`★ + ♦ = ${STAR_VALUE} + ${DIAMOND_VALUE} = ${STAR_PLUS_DIAMOND}`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P22G1Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 square. Given digits: 5 in the top middle, 9 in the middle left, 6 and 1 in the bottom row. The top row adds to 11; the column totals below are 18, a red star, and 13. Fill in 1 to 9 and find the star."
    >
      <SquareGrid />
    </div>
  )
}
