// 3×3 row/column-sum grid for WMI-22P2A-Q21 (2022 Grade 2 Semifinal).
//
// Redrawn from db/seed/wmi/figures/2022-semifinal-g2-a-q21.jpg: a pale-green 3×3
// grid. Fill 1..9 once each; outside numbers are the row / column totals.
//   Filled cells:  top-middle = 5,  middle-left = 9,  bottom-middle = 6
//   Printed right (top row):     11   (top-row total)
//   Printed below the columns:   18 , ★ , 8   (column totals; ★ = the marked one)
//
// Verified unique grid consistent with all printed clues AND the answer key:
//   2 5 4   (row total 11)
//   9 8 3   (row total 20)
//   7 6 1   (row total 14)
//   column totals: 18 , 19 , 8
// The figure marks ★ at the middle column (= 19). The answer-key pairing of the two
// queried outside sums is the top row (11) and the bottom row (◆ = 14): 11 + 14 = 25
// → answer D. (Middle column 19 and middle row 20 are the distractors.) The static
// figure shows the PROBLEM ONLY: the three filled cells, the printed 11 / 18 / 8,
// and ★ for the unknown middle-column total.

const INK = '#27272A'
const CELL_FILL = '#E2EFCB'
const CELL_STROKE = '#3F3F46'
const MARK = '#E23B4E'

// Verified solution grid (top row first). Hardcoded after a uniqueness check.
export const SOLUTION: number[][] = [
  [2, 5, 4],
  [9, 8, 3],
  [7, 6, 1],
]
// Cells printed in the original figure (everything else is blank in the problem).
export const FIXED = new Set(['0,1', '1,0', '2,1'])

export const ROW_SUMS = [11, 20, 14] // top, middle, bottom
export const COL_SUMS = [18, 19, 8] // left, middle (★ = 19), right
export const STAR_MIDCOL = COL_SUMS[1] // 19 (the figure's ★)
export const TOP_ROW_SUM = ROW_SUMS[0] // 11
export const BOTTOM_ROW_SUM = ROW_SUMS[2] // 14 (◆)
export const ANSWER_SUM = TOP_ROW_SUM + BOTTOM_ROW_SUM // 25 = the two queried outside sums

const VIEW_W = 360
const VIEW_H = 360
const CELL = 84
const GX = 40
const GY = 28

function StarGlyph({ x, y, r = 15 }: { x: number; y: number; r?: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(x + rr * Math.cos(rad)).toFixed(2)},${(y + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={MARK} />
}

function DiamondGlyph({ x, y, r = 15 }: { x: number; y: number; r?: number }) {
  return <polygon points={`${x},${y - r} ${x + r * 0.82},${y} ${x},${y + r} ${x - r * 0.82},${y}`} fill={MARK} />
}

export interface SumGridProps {
  /** Reveal solved digits in these cells (keys "r,c"); fixed cells always show. */
  revealCells?: string[]
  /** Highlight rows (0..2) with a warm tint. */
  highlightRows?: number[]
  /** Highlight columns (0..2) with a warm tint. */
  highlightCols?: number[]
  /** Replace the ★ marker (middle column) with its solved value 19. */
  showStarValue?: boolean
  /** Show the diamond ◆ marker beside the bottom row (right side). */
  showDiamond?: boolean
  /** Replace ◆ with its value 14. */
  showDiamondValue?: boolean
  /** Reveal the top-row and bottom-row totals beside those rows. */
  showRowSums?: number[]
  /** Show the final "★ + ◆ = 25" badge. */
  showAnswer?: boolean
}

export function SumGridDiagram({
  revealCells = [],
  highlightRows = [],
  highlightCols = [],
  showStarValue = false,
  showDiamond = false,
  showDiamondValue = false,
  showRowSums = [],
  showAnswer = false,
}: SumGridProps) {
  const gridW = CELL * 3
  const gridH = CELL * 3
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* cell fills + highlight tints */}
      {SOLUTION.map((row, r) =>
        row.map((_, c) => {
          const tinted = highlightRows.includes(r) || highlightCols.includes(c)
          return (
            <rect
              key={`bg${r}-${c}`}
              x={GX + c * CELL}
              y={GY + r * CELL}
              width={CELL}
              height={CELL}
              fill={tinted ? '#FBE8A6' : CELL_FILL}
            />
          )
        }),
      )}

      {/* grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <g key={`ln${i}`}>
          <line x1={GX} y1={GY + i * CELL} x2={GX + gridW} y2={GY + i * CELL} stroke={CELL_STROKE} strokeWidth={2.5} />
          <line x1={GX + i * CELL} y1={GY} x2={GX + i * CELL} y2={GY + gridH} stroke={CELL_STROKE} strokeWidth={2.5} />
        </g>
      ))}

      {/* digits: fixed cells always; revealed cells when listed */}
      {SOLUTION.map((row, r) =>
        row.map((v, c) => {
          const key = `${r},${c}`
          const show = FIXED.has(key) || revealCells.includes(key)
          if (!show) return null
          const isFixed = FIXED.has(key)
          return (
            <text
              key={`d${r}-${c}`}
              x={GX + c * CELL + CELL / 2}
              y={GY + r * CELL + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={34}
              fontWeight={isFixed ? 900 : 700}
              fill={isFixed ? INK : '#2563EB'}
            >
              {v}
            </text>
          )
        }),
      )}

      {/* printed top-row total (right side) */}
      <text
        x={GX + gridW + 24}
        y={GY + CELL / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
        fontWeight={showRowSums.includes(0) ? 900 : 700}
        fill={showRowSums.includes(0) ? MARK : INK}
      >
        11
      </text>

      {/* diamond marker / value beside the bottom row */}
      {showDiamond &&
        (showDiamondValue ? (
          <text x={GX + gridW + 24} y={GY + 2 * CELL + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={MARK}>
            14
          </text>
        ) : (
          <DiamondGlyph x={GX + gridW + 24} y={GY + 2 * CELL + CELL / 2} />
        ))}

      {/* printed column totals below: 18 , ★ , 8 */}
      <text x={GX + 0 * CELL + CELL / 2} y={GY + gridH + 26} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={highlightCols.includes(0) ? 900 : 700} fill={highlightCols.includes(0) ? '#B45309' : INK}>
        18
      </text>
      {showStarValue ? (
        <text x={GX + 1 * CELL + CELL / 2} y={GY + gridH + 26} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={MARK}>
          19
        </text>
      ) : (
        <StarGlyph x={GX + 1 * CELL + CELL / 2} y={GY + gridH + 26} />
      )}
      <text x={GX + 2 * CELL + CELL / 2} y={GY + gridH + 26} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={highlightCols.includes(2) ? 900 : 700} fill={highlightCols.includes(2) ? '#B45309' : INK}>
        8
      </text>

      {/* answer badge: the two queried outside sums (top row + bottom row) */}
      {showAnswer && (
        <g>
          <rect x={VIEW_W / 2 - 92} y={GY + gridH + 38} width={184} height={28} rx={14} fill="#D1FAE5" stroke="#10B981" strokeWidth={2} />
          <text x={VIEW_W / 2} y={GY + gridH + 52} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill="#065F46">
            {`${TOP_ROW_SUM} + ${BOTTOM_ROW_SUM} = ${ANSWER_SUM}`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P22G2Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 grid filled with 1 to 9. Top-middle cell is 5, middle-left is 9, bottom-middle is 6. The top row total 11 is on the right; the column totals below are 18, a star, and 8. Find star plus diamond, two of the outside totals."
    >
      <SumGridDiagram />
    </div>
  )
}
