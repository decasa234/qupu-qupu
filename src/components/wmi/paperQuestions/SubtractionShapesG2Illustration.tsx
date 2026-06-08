/**
 * WMI-19F2A-Q15 — column subtraction with shape-digits, find □ + ○.
 *
 *      □ 3
 *   -  6 ○
 *   -------
 *      2 4
 *
 * Units column needs a borrow: 3 − ○ can't make 4, so 13 − ○ = 4 → ○ = 9.
 * Tens column after the borrow: □ − 1 − 6 = 2 → □ − 7 = 2 → □ = 9.
 * Therefore □ + ○ = 9 + 9 = 18 (option D).
 */

export const SQUARE_VALUE = 9 // □
export const CIRCLE_VALUE = 9 // ○
export const ANSWER = SQUARE_VALUE + CIRCLE_VALUE // 18

const INK = '#1F2937'
const SQUARE_COLOR = '#2f6df0'
const CIRCLE_COLOR = '#F59E0B'

/** Geometry: two columns (tens, units) over three rows + a rule line. */
export const SUB_VIEW_W = 220
export const SUB_VIEW_H = 200
const TENS_X = 120
const UNITS_X = 170
const ROW_Y = [44, 96, 168] // minuend, subtrahend, result
const RULE_Y = 128
const GLYPH_R = 17

/** A small square outline centred at (cx, cy) — the □ shape-digit. */
export function SquareGlyph({ cx, cy, highlight = false }: { cx: number; cy: number; highlight?: boolean }) {
  const s = GLYPH_R
  return (
    <rect
      x={cx - s}
      y={cy - s}
      width={s * 2}
      height={s * 2}
      rx={3}
      fill="none"
      stroke={highlight ? SQUARE_COLOR : INK}
      strokeWidth={highlight ? 3.5 : 2.5}
    />
  )
}

/** A small circle outline centred at (cx, cy) — the ○ shape-digit. */
export function CircleGlyph({ cx, cy, highlight = false }: { cx: number; cy: number; highlight?: boolean }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={GLYPH_R}
      fill="none"
      stroke={highlight ? CIRCLE_COLOR : INK}
      strokeWidth={highlight ? 3.5 : 2.5}
    />
  )
}

function Digit({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} fontSize={32} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill={INK}>
      {children}
    </text>
  )
}

export interface SubtractionDiagramProps {
  /** Highlight a column: 'units' | 'tens' | null. */
  activeColumn?: 'units' | 'tens' | null
  /** Show the borrowed '1' tick over the units / crossed tens digit. */
  showBorrow?: boolean
  /** Reveal the solved ○ value (replaces the circle glyph with its digit). */
  revealCircle?: boolean
  /** Reveal the solved □ value (replaces the square glyph with its digit). */
  revealSquare?: boolean
}

export function SubtractionDiagram({
  activeColumn = null,
  showBorrow = false,
  revealCircle = false,
  revealSquare = false,
}: SubtractionDiagramProps) {
  const unitsActive = activeColumn === 'units'
  const tensActive = activeColumn === 'tens'

  return (
    <svg
      viewBox={`0 0 ${SUB_VIEW_W} ${SUB_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Column highlight bands */}
      {unitsActive && <rect x={UNITS_X - 24} y={16} width={48} height={172} rx={8} fill="#FEF3C7" />}
      {tensActive && <rect x={TENS_X - 24} y={16} width={48} height={172} rx={8} fill="#DBEAFE" />}

      {/* Row 1 (minuend): □ 3 */}
      {revealSquare ? <Digit x={TENS_X} y={ROW_Y[0]}>{String(SQUARE_VALUE)}</Digit> : <SquareGlyph cx={TENS_X} cy={ROW_Y[0]} highlight={tensActive} />}
      <Digit x={UNITS_X} y={ROW_Y[0]}>3</Digit>

      {/* Borrow annotation: small ¹ above the units 3, and a slash on the tens □. */}
      {showBorrow && (
        <>
          <text x={UNITS_X - 18} y={ROW_Y[0] - 22} fontSize={15} fontWeight={800} textAnchor="middle" fill="#DC2626">
            1
          </text>
          <line x1={TENS_X - 14} y1={ROW_Y[0] + 16} x2={TENS_X + 14} y2={ROW_Y[0] - 16} stroke="#DC2626" strokeWidth={2} />
        </>
      )}

      {/* Row 2 (subtrahend): − 6 ○ */}
      <text x={42} y={ROW_Y[1]} fontSize={32} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill={INK}>
        −
      </text>
      <Digit x={TENS_X} y={ROW_Y[1]}>6</Digit>
      {revealCircle ? <Digit x={UNITS_X} y={ROW_Y[1]}>{String(CIRCLE_VALUE)}</Digit> : <CircleGlyph cx={UNITS_X} cy={ROW_Y[1]} highlight={unitsActive} />}

      {/* Rule line */}
      <line x1={28} y1={RULE_Y} x2={SUB_VIEW_W - 24} y2={RULE_Y} stroke={INK} strokeWidth={3} strokeLinecap="round" />

      {/* Row 3 (result): 2 4 */}
      <Digit x={TENS_X} y={ROW_Y[2]}>2</Digit>
      <Digit x={UNITS_X} y={ROW_Y[2]}>4</Digit>
    </svg>
  )
}

export default function SubtractionShapesG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A column subtraction: square-three minus six-circle equals twenty-four. Find square plus circle."
    >
      <SubtractionDiagram />
    </div>
  )
}
