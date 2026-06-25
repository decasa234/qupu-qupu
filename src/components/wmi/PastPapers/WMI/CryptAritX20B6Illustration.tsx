// CryptAritX20B6Illustration.tsx
// SEAMO-X 2020 Paper B Q6 — cryptarithm AT × AT = CAT
//
// Layout (3 columns, c=0=hundreds, c=1=tens, c=2=units):
//
//   col:      0    1    2
//   row 0          [A ] [T ]    top factor:  A T
//   row 1          [A ] [T ]    multiplier:  A T
//   ─────────────────────────
//   row 2     [C ] [A ] [T ]    product:   C A T
//
// Solution: AT = 25, AT² = 625 → C=6, A=2, T=5.

const INK   = '#1F2937'
const GRAY  = '#9CA3AF'
const GREEN = '#10B981'

const BOX      = 48
const GAP      = 10
const LEFT_PAD = 52   // room for the × symbol
const RIGHT_PAD = 14

// x-coord of left edge of column c (3 cols: hundreds, tens, units)
const COL_X = (c: number) => LEFT_PAD + c * (BOX + GAP)

// 3 rows: top factor, multiplier, product
const ROW_Y    = [8, 68, 148]
const RULE_Y   = 136   // between multiplier and product
const VIEW_W   = LEFT_PAD + 3 * BOX + 2 * GAP + RIGHT_PAD  // 52+3*48+2*10+14 = 210
const VIEW_H   = ROW_Y[2] + BOX + 14                        // 148+48+14 = 210

// ---------------------------------------------------------------------------
// CellSpec — one box in the cryptarithm grid.
// ---------------------------------------------------------------------------
export interface CryptAritCellSpec {
  row: number
  col: number
  /** Letter shown in the original puzzle. Always shown (no blanks in this puzzle). */
  letter: string
  /** The known digit value (shown in explainer when revealed). */
  digit: string
}

/** Full grid for SEAMO-X 2020 Paper B Q6.  Solution: A=2, T=5, C=6. */
export const CELLS_X20B6: ReadonlyArray<CryptAritCellSpec> = [
  // row 0 — top factor: A T  (cols 1, 2)
  { row: 0, col: 1, letter: 'A', digit: '2' },
  { row: 0, col: 2, letter: 'T', digit: '5' },
  // row 1 — multiplier: A T  (cols 1, 2)
  { row: 1, col: 1, letter: 'A', digit: '2' },
  { row: 1, col: 2, letter: 'T', digit: '5' },
  // row 2 — product: C A T  (cols 0, 1, 2)
  { row: 2, col: 0, letter: 'C', digit: '6' },
  { row: 2, col: 1, letter: 'A', digit: '2' },
  { row: 2, col: 2, letter: 'T', digit: '5' },
]

// ---------------------------------------------------------------------------
// CryptAritGrid — reusable renderer; the explainer imports this.
// ---------------------------------------------------------------------------
export interface CryptAritGridProps {
  cells: ReadonlyArray<CryptAritCellSpec>
  /** Letter → digit mapping for cells that should show their digit (green). */
  revealed?: Record<string, boolean>
  /** Letter to highlight with amber focus band. */
  focusLetter?: string | null
}

export function CryptAritGrid({
  cells,
  revealed = {},
  focusLetter = null,
}: CryptAritGridProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* amber highlight band for focused letter */}
      {focusLetter !== null &&
        cells
          .filter((c) => c.letter === focusLetter)
          .map((c, i) => (
            <rect
              key={`focus-${i}`}
              x={COL_X(c.col) - 4}
              y={ROW_Y[c.row] - 4}
              width={BOX + 8}
              height={BOX + 8}
              rx={10}
              fill="rgba(245,158,11,0.12)"
              stroke="#D97706"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ))}

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

      {/* rule line */}
      <line
        x1={14}
        y1={RULE_Y}
        x2={VIEW_W - 14}
        y2={RULE_Y}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* cells */}
      {cells.map((cell, i) => {
        const isRevealed = revealed[cell.letter] === true
        const cx = COL_X(cell.col)
        const cy = ROW_Y[cell.row]

        return (
          <g key={i}>
            <rect
              x={cx}
              y={cy}
              width={BOX}
              height={BOX}
              rx={7}
              fill={isRevealed ? 'rgba(16,185,129,0.14)' : '#FFFFFF'}
              stroke={isRevealed ? GREEN : GRAY}
              strokeWidth={isRevealed ? 3 : 1.8}
              strokeDasharray={isRevealed ? undefined : '5 4'}
            />
            <text
              x={cx + BOX / 2}
              y={cy + BOX / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={22}
              fontWeight={900}
              fill={isRevealed ? '#065F46' : INK}
            >
              {isRevealed ? cell.digit : cell.letter}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — static illustration (letters shown, no digits revealed).
// ---------------------------------------------------------------------------
export default function CryptAritX20B6Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kriptaritma: AT dikali AT sama dengan CAT. Temukan nilai C."
    >
      <CryptAritGrid cells={CELLS_X20B6} />
    </div>
  )
}
