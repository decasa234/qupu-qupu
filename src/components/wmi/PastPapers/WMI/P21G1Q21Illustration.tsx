// Number-square figure for WMI-21P1A-Q21 (2021 Semifinal Grade 1 Paper A).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g1-a-q21.jpg — a 3×3 grid of
// boxed tokens, with one result box to the RIGHT of rows 1 & 3 and result boxes
// BELOW columns 1 & 3, forming four equations:
//
//        [A] [−] [6]   = [13]      row 1:  A − 6 = 13
//        [−] [▓] [−]              col 1:  A − B = 11   (gray centre box is blank)
//        [B] [+] [C]   = [?]       row 3:  B + C = ?
//        [11]    [1]              col 3:  6 − C = 1
//
// The STATIC figure shows only the givens (6, −, +, −, −, 13, 11, 1) and "?".
// Solving (done in the explainer): A = 19, B = 8, C = 5, so ? = 8 + 5 = 13 (C).
//
// Nothing here reveals A, B, C or the answer.

const INK = '#1F2937'
const FRAME = '#9CA3AF'
const GRAY = '#9CA3AF'

export const P21G1Q21_VIEW_W = 300
export const P21G1Q21_VIEW_H = 300

// Cell geometry: a 3×3 grid plus a detached result column on the right and a
// detached result row at the bottom.
const CELL = 64
const GAP = 6
const GRID_X = 8
const GRID_Y = 8
const RESULT_GAP = 18 // gap between grid and the right/bottom result boxes

function cellX(c: number) {
  return GRID_X + c * (CELL + GAP)
}
function cellY(r: number) {
  return GRID_Y + r * (CELL + GAP)
}

const RESULT_COL_X = cellX(2) + CELL + RESULT_GAP
const RESULT_ROW_Y = cellY(2) + CELL + RESULT_GAP

/** A single bordered box holding a glyph (number, operator, "?" or blank). */
export function NumberBox({
  x,
  y,
  text,
  gray = false,
  emphasis = false,
  highlight = false,
}: {
  x: number
  y: number
  text: string
  gray?: boolean
  emphasis?: boolean
  highlight?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CELL}
        height={CELL}
        rx={6}
        fill={gray ? GRAY : highlight ? '#FEF3C7' : '#FFFFFF'}
        stroke={highlight ? '#F59E0B' : FRAME}
        strokeWidth={highlight ? 4 : 3}
      />
      {!gray && text !== '' && (
        <text
          x={x + CELL / 2}
          y={y + CELL / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={emphasis ? 34 : 30}
          fontWeight={900}
          fill={INK}
        >
          {text}
        </text>
      )}
    </g>
  )
}

export interface P21G1Q21GridProps {
  /** Show the derived value of A (top-left, =19). */
  showA?: boolean
  /** Show the derived value of B (bottom-left, =8). */
  showB?: boolean
  /** Show the derived value of C (bottom-right, =5). */
  showC?: boolean
  /** Reveal the final answer in the "?" box (=13). */
  revealAnswer?: boolean
  /** Highlight a named cell key for the current beat. */
  highlight?: 'rowA' | 'colA' | 'colC' | 'rowQ' | null
}

const A_VALUE = 19
const B_VALUE = 8
const C_VALUE = 5
export const P21G1Q21_ANSWER = B_VALUE + C_VALUE // 13

export function P21G1Q21Grid({
  showA = false,
  showB = false,
  showC = false,
  revealAnswer = false,
  highlight = null,
}: P21G1Q21GridProps) {
  const hl = (key: NonNullable<P21G1Q21GridProps['highlight']>) => highlight === key
  return (
    <svg
      viewBox={`0 0 ${P21G1Q21_VIEW_W} ${P21G1Q21_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Row 1: A  −  6   = 13 */}
      <NumberBox x={cellX(0)} y={cellY(0)} text={showA ? String(A_VALUE) : ''} highlight={hl('rowA') || hl('colA')} />
      <NumberBox x={cellX(1)} y={cellY(0)} text="−" />
      <NumberBox x={cellX(2)} y={cellY(0)} text="6" highlight={hl('rowA') || hl('colC')} />
      <NumberBox x={RESULT_COL_X} y={cellY(0)} text="13" emphasis highlight={hl('rowA')} />

      {/* Row 2: − ▓ − */}
      <NumberBox x={cellX(0)} y={cellY(1)} text="−" highlight={hl('colA')} />
      <NumberBox x={cellX(1)} y={cellY(1)} text="" gray />
      <NumberBox x={cellX(2)} y={cellY(1)} text="−" highlight={hl('colC')} />

      {/* Row 3: B  +  C   = ? */}
      <NumberBox x={cellX(0)} y={cellY(2)} text={showB ? String(B_VALUE) : ''} highlight={hl('rowQ') || hl('colA')} />
      <NumberBox x={cellX(1)} y={cellY(2)} text="+" highlight={hl('rowQ')} />
      <NumberBox x={cellX(2)} y={cellY(2)} text={showC ? String(C_VALUE) : ''} highlight={hl('rowQ') || hl('colC')} />
      <NumberBox
        x={RESULT_COL_X}
        y={cellY(2)}
        text={revealAnswer ? String(P21G1Q21_ANSWER) : '?'}
        emphasis
        highlight={hl('rowQ') || revealAnswer}
      />

      {/* Bottom results: 11 (under col1), 1 (under col3) */}
      <NumberBox x={cellX(0)} y={RESULT_ROW_Y} text="11" emphasis highlight={hl('colA')} />
      <NumberBox x={cellX(2)} y={RESULT_ROW_Y} text="1" emphasis highlight={hl('colC')} />
    </svg>
  )
}

export default function P21G1Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A number-square puzzle. Top row: a blank box minus six equals thirteen. The left column subtracts down to eleven. The right column shows six minus a blank equals one. The bottom row adds two blanks to give a question mark."
    >
      <P21G1Q21Grid />
    </div>
  )
}
