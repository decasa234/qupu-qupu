// Vertical multiplication with hidden digits for WMI-19F3A-Q22.
// Reconstructed from db/seed/wmi/figures/2019-final-g3-a-q22.jpg:
//     ◻ ◻ ◻        (top, 3-digit)
//   ×   ◻ 9        (2-digit multiplier ending in 9)
//   ---------
//     ◻ 1 ◻        (top × 9 — 3-digit with middle 1)
//   ◻ 0 ◻          (top × tens — 3-digit with middle 0, shifted)
//   ---------
//   2 ◻ ◻ ◻        (4-digit product starting with 2)
//
// Deduction: top × 9 is 3-digit → top ∈ 100…111; only 102 × 9 = 918 has
// middle digit 1 → top = 102. The product starts with 2 → tens digit 2
// (102 × 19 = 1938 ✗, 102 × 29 = 2958 ✓, 102 × 39 = 3978 ✗). 102 × 2 = 204
// (middle 0 ✓). Product = 2958.

export const VM_TOP = 102
export const VM_MULT = 29
export const VM_P1 = 918
export const VM_P2 = 204
export const VM_PRODUCT = 2958

const INK = '#1F2937'
const GREEN = '#10B981'
const GRAY = '#9CA3AF'

export const VM_VIEW_W = 300
export const VM_VIEW_H = 300
const BOX = 44
const GAP = 8
const COL_X = (c: number) => 60 + c * (BOX + GAP) // 4 columns, c = 0 (thousands) … 3 (units)
const ROW_Y = [10, 66, 132, 188, 254]
const RULE1_Y = 122
const RULE2_Y = 244

interface CellSpec {
  row: number
  col: number
  /** Printed digit in the puzzle, or null for an empty box. */
  given: string | null
  /** The solved digit (revealed by mask). */
  value: string
}

// Cells per row (cols are right-aligned: units in col 3).
export const VM_CELLS: ReadonlyArray<CellSpec> = [
  // top: ◻◻◻ = 102
  { row: 0, col: 1, given: null, value: '1' },
  { row: 0, col: 2, given: null, value: '0' },
  { row: 0, col: 3, given: null, value: '2' },
  // multiplier: ◻9 = 29
  { row: 1, col: 2, given: null, value: '2' },
  { row: 1, col: 3, given: '9', value: '9' },
  // partial 1: ◻1◻ = 918
  { row: 2, col: 1, given: null, value: '9' },
  { row: 2, col: 2, given: '1', value: '1' },
  { row: 2, col: 3, given: null, value: '8' },
  // partial 2 (shifted): ◻0◻ = 204
  { row: 3, col: 0, given: null, value: '2' },
  { row: 3, col: 1, given: '0', value: '0' },
  { row: 3, col: 2, given: null, value: '4' },
  // product: 2◻◻◻ = 2958
  { row: 4, col: 0, given: '2', value: '2' },
  { row: 4, col: 1, given: null, value: '9' },
  { row: 4, col: 2, given: null, value: '5' },
  { row: 4, col: 3, given: null, value: '8' },
]

export interface VerticalMultFigureProps {
  /** Rows whose hidden digits are revealed (solved, green). */
  revealRows?: number[]
  /** Row being reasoned about (amber band). */
  focusRow?: number | null
}

export function VerticalMultFigure({ revealRows = [], focusRow = null }: VerticalMultFigureProps) {
  const revealed = new Set(revealRows)
  return (
    <svg viewBox={`0 0 ${VM_VIEW_W} ${VM_VIEW_H}`} width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {focusRow !== null && (
        <rect x={8} y={ROW_Y[focusRow] - 5} width={VM_VIEW_W - 16} height={BOX + 10} rx={8} fill="rgba(245,158,11,0.10)" stroke="#D97706" strokeWidth={2} strokeDasharray="6 4" />
      )}

      <text x={26} y={ROW_Y[1] + BOX / 2} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>×</text>
      <line x1={16} y1={RULE1_Y} x2={VM_VIEW_W - 16} y2={RULE1_Y} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={16} y1={RULE2_Y} x2={VM_VIEW_W - 16} y2={RULE2_Y} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />

      {VM_CELLS.map((cell, i) => {
        const show = cell.given !== null || revealed.has(cell.row)
        const solved = cell.given === null && revealed.has(cell.row)
        return (
          <g key={i}>
            <rect
              x={COL_X(cell.col)}
              y={ROW_Y[cell.row]}
              width={BOX}
              height={BOX}
              rx={6}
              fill={solved ? 'rgba(16,185,129,0.14)' : '#FFFFFF'}
              stroke={solved ? GREEN : cell.given !== null ? INK : GRAY}
              strokeWidth={solved ? 3 : cell.given !== null ? 2 : 1.6}
              strokeDasharray={cell.given === null && !solved ? '5 4' : undefined}
            />
            <text
              x={COL_X(cell.col) + BOX / 2}
              y={ROW_Y[cell.row] + BOX / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={22}
              fontWeight={900}
              fill={solved ? '#065F46' : cell.given !== null ? INK : GRAY}
            >
              {show ? cell.value : '?'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function VerticalMultG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A vertical multiplication with hidden digits: a 3-digit number times a 2-digit number ending in 9; the first partial product has middle digit 1, the second has middle digit 0, and the 4-digit answer starts with 2."
    >
      <VerticalMultFigure />
    </div>
  )
}
