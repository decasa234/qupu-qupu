// Number-sum grid illustration for IKMC-22-EC-Q12.
//
// Mosif's 3×3 grid, row and column sums — one number is wrong.
// The static illustration shows the PROBLEM (all numbers as given),
// never the correction.
//
// Grid (row-major, row 0 = top):
//   9  1  5   → 15
//   3  7  6   → 16  ← one too high (mistake is the 3)
//   4  7  4   → 15
//   ↓  ↓  ↓
//  16 15 15   (col 0 is one too high)
//
// Target sum = 15.  Mistake: row 1 col 0 = 3 (should be 2).
// Answer = B ("3").
//
// Pool reuse: adapted from SumGrid20Illustration.tsx (SumGridDiagram
// primitive) — same row-sum / col-sum layout, but cells hold plain
// numbers rather than shapes.

const INK = '#1F2937'
const AMBER = '#B45309'
const GREEN = '#10B981'

export const GRID_NUMBERS: ReadonlyArray<ReadonlyArray<number>> = [
  [9, 1, 5],
  [3, 7, 6],
  [4, 7, 4],
]

export const ROW_SUMS = [15, 16, 15]
export const COL_SUMS = [16, 15, 15]
export const TARGET_SUM = 15

/** The cell with the mistake: row 1 col 0 contains 3, should be 2. */
export const MISTAKE_ROW = 1
export const MISTAKE_COL = 0
export const MISTAKE_VALUE = 3
export const CORRECT_VALUE = 2

const CELL = 58
const GRID_X = 20
const GRID_Y = 16
const VIEW_W = GRID_X * 2 + CELL * 3 + 48  // extra for sum labels
const VIEW_H = GRID_Y + CELL * 3 + 44        // extra for col sums below

export interface SumGrid12ECProps {
  /** Rows to tint (amber highlight). */
  highlightRows?: number[]
  /** Column index to tint (amber highlight), or null. */
  highlightCol?: number | null
  /** Show the corrected value (2) in the mistake cell. */
  showCorrection?: boolean
  /** Mark the mistake cell with a red ring. */
  ringMistake?: boolean
}

/**
 * Shared primitive for the illustration and explainer.
 * Shows the bare problem grid + row/col sums by default.
 */
export function SumGrid12ECFigure({
  highlightRows = [],
  highlightCol = null,
  showCorrection = false,
  ringMistake = false,
}: SumGrid12ECProps) {
  const gridW = CELL * 3
  const gridH = CELL * 3

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── highlight tints ── */}
      {highlightRows.map((r) => (
        <rect
          key={`hr${r}`}
          x={GRID_X}
          y={GRID_Y + r * CELL}
          width={gridW}
          height={CELL}
          fill="#FEF3C7"
        />
      ))}
      {highlightCol !== null && (
        <rect
          x={GRID_X + highlightCol * CELL}
          y={GRID_Y}
          width={CELL}
          height={gridH}
          fill="#FEF3C7"
        />
      )}

      {/* ── grid lines ── */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line
            x1={GRID_X}
            y1={GRID_Y + i * CELL}
            x2={GRID_X + gridW}
            y2={GRID_Y + i * CELL}
            stroke={INK}
            strokeWidth={2}
          />
          <line
            x1={GRID_X + i * CELL}
            y1={GRID_Y}
            x2={GRID_X + i * CELL}
            y2={GRID_Y + gridH}
            stroke={INK}
            strokeWidth={2}
          />
        </g>
      ))}

      {/* ── cell numbers ── */}
      {GRID_NUMBERS.map((row, r) =>
        row.map((num, c) => {
          const cx = GRID_X + c * CELL + CELL / 2
          const cy = GRID_Y + r * CELL + CELL / 2
          const isMistake = r === MISTAKE_ROW && c === MISTAKE_COL
          const displayValue = isMistake && showCorrection ? CORRECT_VALUE : num
          const textColor = isMistake && showCorrection ? GREEN : INK
          return (
            <text
              key={`n${r}-${c}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={22}
              fontWeight={800}
              fill={textColor}
              className="font-display"
            >
              {displayValue}
            </text>
          )
        }),
      )}

      {/* ── mistake cell ring ── */}
      {ringMistake && (
        <rect
          x={GRID_X + MISTAKE_COL * CELL + 3}
          y={GRID_Y + MISTAKE_ROW * CELL + 3}
          width={CELL - 6}
          height={CELL - 6}
          fill="none"
          stroke="#EF4444"
          strokeWidth={3}
          rx={4}
        />
      )}

      {/* ── row sums on the right ── */}
      {ROW_SUMS.map((sum, r) => {
        const isBadRow = sum !== TARGET_SUM
        const isHighlighted = highlightRows.includes(r)
        return (
          <text
            key={`rs${r}`}
            x={GRID_X + gridW + 26}
            y={GRID_Y + r * CELL + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={900}
            fill={isBadRow && !showCorrection ? '#EF4444' : isHighlighted ? AMBER : INK}
            className="font-display"
          >
            {showCorrection && r === MISTAKE_ROW ? TARGET_SUM : sum}
          </text>
        )
      })}

      {/* ── column sums below ── */}
      {COL_SUMS.map((sum, c) => {
        const isBadCol = sum !== TARGET_SUM
        const isHighlighted = highlightCol === c
        return (
          <text
            key={`cs${c}`}
            x={GRID_X + c * CELL + CELL / 2}
            y={GRID_Y + gridH + 26}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={900}
            fill={isBadCol && !showCorrection ? '#EF4444' : isHighlighted ? AMBER : INK}
            className="font-display"
          >
            {showCorrection && c === MISTAKE_COL ? TARGET_SUM : sum}
          </text>
        )
      })}
    </svg>
  )
}

export default function SumGrid12ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 number grid. Row 1: 9, 1, 5 sum 15. Row 2: 3, 7, 6 sum 16. Row 3: 4, 7, 4 sum 15. Column sums: 16, 15, 15. One number is wrong — which one?"
    >
      <SumGrid12ECFigure />
    </div>
  )
}
