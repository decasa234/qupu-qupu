// SEAMO-21-A-Q20 — Column addition cryptarithmetic: RICE
//
//       E
//     C E
//   I C E
// + R I C E
// ---------
//   G G G G
//
// R, I, C, E are all odd single digits. Find C. Answer: C = 7 (choice D).
// The stem shows only the problem structure — no solution revealed.
// No primitive matches a right-aligned letter column addition → adapted from ColAdd20A11Illustration.
//
// SSR-safe: no hooks, no framer-motion, no random values.

const INK = '#1F2937'
const LETTER_FILL = '#1E3A5F'    // dark blue for letter cells
const DIGIT_FILL = '#374151'     // slate for result labels
const CELL_BG = '#EFF6FF'        // light blue cell background
const RESULT_BG = '#FEF9C3'      // warm yellow result row
const LINE_COLOR = '#9CA3AF'     // rule lines
const CELL_STROKE = '#BFDBFE'

// Layout constants
const CELL_W = 44
const CELL_H = 44
const GAP = 6
const STEP = CELL_W + GAP
const COL_COUNT = 4              // columns: R I C E

// Right-edge of the E-column (units column, colFromRight=0)
const MARGIN_LEFT = 36           // left margin
const RIGHT_X = MARGIN_LEFT + (COL_COUNT - 1) * STEP

function colX(colFromRight: number): number {
  return RIGHT_X - colFromRight * STEP
}

const ROW_H = CELL_H + GAP
const ROW1_Y = 16                         // "        E"
const ROW2_Y = ROW1_Y + ROW_H            // "      C E"
const ROW3_Y = ROW2_Y + ROW_H            // "    I C E"
const ROW4_Y = ROW3_Y + ROW_H            // "+ R I C E"
const RULE_Y = ROW4_Y + CELL_H + 10
const ROW5_Y = RULE_Y + 10               // "  G G G G"

const PLUS_X = colX(3) - 26              // "+" to the left of R column

const SVG_W = PLUS_X + COL_COUNT * STEP + 36
const SVG_H = ROW5_Y + CELL_H + 20

// Single letter cell (blue background)
function LetterCell({
  x,
  y,
  ch,
  bg = CELL_BG,
}: {
  x: number
  y: number
  ch: string
  bg?: string
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CELL_W}
        height={CELL_H}
        rx={8}
        fill={bg}
        stroke={CELL_STROKE}
        strokeWidth={1.5}
      />
      <text
        x={x + CELL_W / 2}
        y={y + CELL_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={800}
        fill={LETTER_FILL}
        fontFamily="monospace, 'Courier New'"
      >
        {ch}
      </text>
    </g>
  )
}

// Result letter cell (yellow background) — shows "G" for each result digit
function ResultCell({ x, y, ch }: { x: number; y: number; ch: string }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CELL_W}
        height={CELL_H}
        rx={8}
        fill={RESULT_BG}
        stroke="#FCD34D"
        strokeWidth={1.5}
      />
      <text
        x={x + CELL_W / 2}
        y={y + CELL_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={DIGIT_FILL}
        fontFamily="monospace, 'Courier New'"
      >
        {ch}
      </text>
    </g>
  )
}

/**
 * Shared diagram for SEAMO-21-A-Q20.
 * Used by both the illustration and the explainer.
 *
 * Props allow the explainer to highlight individual columns as steps are revealed.
 */
export interface RiceAdd21A20DiagramProps {
  /** Columns to highlight (0=units/E, 1=tens/C, 2=hundreds/I, 3=thousands/R). */
  highlightCols?: number[]
  /** Show solved digit values instead of letters. Solution: R=1, I=1, C=7, E=5, G=2 */
  showSolution?: boolean
}

export function RiceAdd21A20Diagram({
  highlightCols = [],
  showSolution = false,
}: RiceAdd21A20DiagramProps) {
  // Solved values (one valid assignment: E=5, C=7, I=1, R=1 → sum=2222 → G=2)
  const solved: Record<string, string> = { R: '1', I: '1', C: '7', E: '5', G: '2' }

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
      {/* ── Row 1: "E" (1 digit, right-aligned) ── */}
      <LetterCell x={colX(0)} y={ROW1_Y} ch={letter('E')} bg={cellBg(0)} />

      {/* ── Row 2: "C E" (2 digits) ── */}
      <LetterCell x={colX(1)} y={ROW2_Y} ch={letter('C')} bg={cellBg(1)} />
      <LetterCell x={colX(0)} y={ROW2_Y} ch={letter('E')} bg={cellBg(0)} />

      {/* ── Row 3: "I C E" (3 digits) ── */}
      <LetterCell x={colX(2)} y={ROW3_Y} ch={letter('I')} bg={cellBg(2)} />
      <LetterCell x={colX(1)} y={ROW3_Y} ch={letter('C')} bg={cellBg(1)} />
      <LetterCell x={colX(0)} y={ROW3_Y} ch={letter('E')} bg={cellBg(0)} />

      {/* ── Row 4: "+ R I C E" (4 digits) ── */}
      <text
        x={PLUS_X + 4}
        y={ROW4_Y + CELL_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={900}
        fill={INK}
        fontFamily="monospace, 'Courier New'"
      >
        +
      </text>
      <LetterCell x={colX(3)} y={ROW4_Y} ch={letter('R')} bg={cellBg(3)} />
      <LetterCell x={colX(2)} y={ROW4_Y} ch={letter('I')} bg={cellBg(2)} />
      <LetterCell x={colX(1)} y={ROW4_Y} ch={letter('C')} bg={cellBg(1)} />
      <LetterCell x={colX(0)} y={ROW4_Y} ch={letter('E')} bg={cellBg(0)} />

      {/* ── Horizontal rule ── */}
      <line
        x1={ruleStartX}
        y1={RULE_Y}
        x2={ruleEndX}
        y2={RULE_Y}
        stroke={LINE_COLOR}
        strokeWidth={2.5}
      />

      {/* ── Result row: "G G G G" ── */}
      <ResultCell x={colX(3)} y={ROW5_Y} ch={letter('G')} />
      <ResultCell x={colX(2)} y={ROW5_Y} ch={letter('G')} />
      <ResultCell x={colX(1)} y={ROW5_Y} ch={letter('G')} />
      <ResultCell x={colX(0)} y={ROW5_Y} ch={letter('G')} />
    </svg>
  )
}

/** SEAMO-21-A-Q20 stem illustration — shows only the problem, never the answer. */
export default function RiceAdd21A20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Penjumlahan kolom: E + CE + ICE + RICE = GGGG. ' +
        'R, I, C, E semuanya digit ganjil. Temukan nilai C.'
      }
    >
      <RiceAdd21A20Diagram />
    </div>
  )
}
