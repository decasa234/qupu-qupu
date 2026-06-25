// SEAMO-20-A-Q11 — Column addition cryptarithmetic
//
//      T H
//    A T H
//  + M A T H
//  ---------
//    2 0 1 9
//
// Each letter is a unique digit. The figure shows only the problem — no answer.
// No primitive matches a right-aligned column addition → fresh SVG.
//
// SSR-safe: no hooks, no framer-motion, no random values.

const INK = '#1F2937'
const LETTER_FILL = '#1E3A5F'    // dark blue for letter cells
const DIGIT_FILL = '#374151'     // slate for result digits
const CELL_BG = '#EFF6FF'        // light blue cell background
const RESULT_BG = '#FEF9C3'      // warm yellow result row
const LINE_COLOR = '#9CA3AF'     // rule lines
const CELL_STROKE = '#BFDBFE'

// Layout constants
const CELL_W = 44
const CELL_H = 44
const GAP = 6            // gap between cells
const STEP = CELL_W + GAP
const COL_COUNT = 4      // columns: M A T H (widest row)

// Compute right-aligned x-positions for each column (0 = rightmost / units)
// cols[0] = H col, cols[1] = T col, cols[2] = A col, cols[3] = M col
const RIGHT_X = 32 + 3 * STEP   // x of the right-edge cell (H column)
function colX(colFromRight: number): number {
  return RIGHT_X - colFromRight * STEP
}

const ROW_H = CELL_H + GAP
const ROW1_Y = 16            // "  T H" row
const ROW2_Y = ROW1_Y + ROW_H  // "A T H" row
const ROW3_Y = ROW2_Y + ROW_H  // "+M A T H" row (longest)
const RULE_Y = ROW3_Y + CELL_H + 10   // horizontal rule
const ROW4_Y = RULE_Y + 10    // "2 0 1 9" result row

const PLUS_X = colX(3) - 26   // "+" sign to the left of M column

const SVG_W = PLUS_X + COL_COUNT * STEP + 36
const SVG_H = ROW4_Y + CELL_H + 20

// Single letter cell
function LetterCell({ x, y, ch, bg = CELL_BG }: { x: number; y: number; ch: string; bg?: string }) {
  return (
    <g>
      <rect
        x={x} y={y} width={CELL_W} height={CELL_H} rx={8}
        fill={bg}
        stroke={CELL_STROKE}
        strokeWidth={1.5}
      />
      <text
        x={x + CELL_W / 2} y={y + CELL_H / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={800} fill={LETTER_FILL}
        fontFamily="monospace, 'Courier New'"
      >
        {ch}
      </text>
    </g>
  )
}

// Result digit cell (yellow background)
function ResultCell({ x, y, ch }: { x: number; y: number; ch: string }) {
  return (
    <g>
      <rect
        x={x} y={y} width={CELL_W} height={CELL_H} rx={8}
        fill={RESULT_BG}
        stroke="#FCD34D"
        strokeWidth={1.5}
      />
      <text
        x={x + CELL_W / 2} y={y + CELL_H / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900} fill={DIGIT_FILL}
        fontFamily="monospace, 'Courier New'"
      >
        {ch}
      </text>
    </g>
  )
}

/**
 * Shared diagram for SEAMO-20-A-Q11. Used by both the illustration and the explainer.
 *
 * Props allow the explainer to highlight individual columns as steps are revealed.
 */
export interface ColAdd20A11DiagramProps {
  /** Columns to highlight (0=units/H, 1=tens/T, 2=hundreds/A, 3=thousands/M). */
  highlightCols?: number[]
  /** Show solved digit values instead of letters. */
  showSolution?: boolean
}

export function ColAdd20A11Diagram({
  highlightCols = [],
  showSolution = false,
}: ColAdd20A11DiagramProps) {
  // Solved values: H=3, T=7, A=4, M=1
  const solved: Record<string, string> = { T: '7', H: '3', A: '4', M: '1' }

  function letter(ch: string): string {
    return showSolution ? (solved[ch] ?? ch) : ch
  }

  function cellBg(colFromRight: number): string {
    if (highlightCols.includes(colFromRight)) return '#DBEAFE'
    return CELL_BG
  }

  const ruleStartX = PLUS_X - 4
  const ruleEndX = RIGHT_X + CELL_W + 4

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Row 1: "T H" (2 digits, right-aligned) ── */}
      <LetterCell x={colX(1)} y={ROW1_Y} ch={letter('T')} bg={cellBg(1)} />
      <LetterCell x={colX(0)} y={ROW1_Y} ch={letter('H')} bg={cellBg(0)} />

      {/* ── Row 2: "A T H" (3 digits) ── */}
      <LetterCell x={colX(2)} y={ROW2_Y} ch={letter('A')} bg={cellBg(2)} />
      <LetterCell x={colX(1)} y={ROW2_Y} ch={letter('T')} bg={cellBg(1)} />
      <LetterCell x={colX(0)} y={ROW2_Y} ch={letter('H')} bg={cellBg(0)} />

      {/* ── Row 3: "+ M A T H" (4 digits) ── */}
      {/* "+" sign */}
      <text
        x={PLUS_X + 4} y={ROW3_Y + CELL_H / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={26} fontWeight={900} fill={INK}
        fontFamily="monospace, 'Courier New'"
      >
        +
      </text>
      <LetterCell x={colX(3)} y={ROW3_Y} ch={letter('M')} bg={cellBg(3)} />
      <LetterCell x={colX(2)} y={ROW3_Y} ch={letter('A')} bg={cellBg(2)} />
      <LetterCell x={colX(1)} y={ROW3_Y} ch={letter('T')} bg={cellBg(1)} />
      <LetterCell x={colX(0)} y={ROW3_Y} ch={letter('H')} bg={cellBg(0)} />

      {/* ── Horizontal rule ── */}
      <line
        x1={ruleStartX} y1={RULE_Y}
        x2={ruleEndX} y2={RULE_Y}
        stroke={LINE_COLOR} strokeWidth={2.5}
      />

      {/* ── Result row: "2 0 1 9" ── */}
      <ResultCell x={colX(3)} y={ROW4_Y} ch="2" />
      <ResultCell x={colX(2)} y={ROW4_Y} ch="0" />
      <ResultCell x={colX(1)} y={ROW4_Y} ch="1" />
      <ResultCell x={colX(0)} y={ROW4_Y} ch="9" />
    </svg>
  )
}

/** SEAMO-20-A-Q11 stem illustration — shows only the problem, never the answer. */
export default function ColAdd20A11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Penjumlahan kolom: TH + ATH + MATH = 2019. ' +
        'Setiap huruf mewakili satu digit berbeda.'
      }
    >
      <ColAdd20A11Diagram />
    </div>
  )
}
