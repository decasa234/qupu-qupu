// Hidden-digit vertical subtraction for WMI-20F1A-Q23.
//
// Source figure: wmiPastPaper/2020 WMI Final G01 Paper B — worksheet-style
// vertical subtraction: top "8 🍌", below "− 🍌 🍓", rule, result "3 6".
// Both bananas hide the SAME digit.
// Canonical deduction (db/seed/wmi/papers/2020-final-g1.json q23):
//   No borrow: 8 − banana = 3 → banana = 5, but 85 − 36 = 49 starts with 4 ✗.
//   So the ones borrows: 8 − 1 − banana = 3 → banana = 4. Top = 84,
//   subtrahend = 84 − 36 = 48, strawberry = 8. Check: 84 − 48 = 36 ✓.

export const BANANA_DIGIT = 4
export const STRAWBERRY_DIGIT = 8
export const TOP_NUMBER = 84
export const SUBTRAHEND = 48
export const DIFFERENCE = 36

const INK = '#1F2937'

/** Yellow crescent banana glyph centred at (cx, cy). */
export function BananaGlyph({ cx, cy, dim = false }: { cx: number; cy: number; dim?: boolean }) {
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(-10)`} opacity={dim ? 0.35 : 1}>
      <path
        d="M -15 -4 A 16 16 0 0 0 15 -4 A 27 27 0 0 1 -15 -4 Z"
        fill="#FACC15"
        stroke="#CA8A04"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx={-15.5} cy={-4.5} r={2.2} fill="#7C4A12" />
      <circle cx={15.5} cy={-4.5} r={2.2} fill="#7C4A12" />
    </g>
  )
}

/** Red strawberry glyph (rounded heart-ish triangle, dots, green leaf), centred at (cx, cy). */
export function StrawberryGlyph({ cx, cy, dim = false }: { cx: number; cy: number; dim?: boolean }) {
  return (
    <g transform={`translate(${cx}, ${cy - 2})`} opacity={dim ? 0.35 : 1}>
      <path
        d="M 0 -8 C 9 -11 14.5 -4 13.5 3 C 12.5 10 5 16.5 0 18.5 C -5 16.5 -12.5 10 -13.5 3 C -14.5 -4 -9 -11 0 -8 Z"
        fill="#EF4444"
        stroke="#B91C1C"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* seeds */}
      <circle cx={-6} cy={1} r={1.2} fill="#FFFFFF" />
      <circle cx={5.5} cy={2} r={1.2} fill="#FFFFFF" />
      <circle cx={-1} cy={7} r={1.2} fill="#FFFFFF" />
      <circle cx={-7} cy={7.5} r={1.2} fill="#FFFFFF" />
      <circle cx={6.5} cy={8} r={1.2} fill="#FFFFFF" />
      <circle cx={0} cy={13} r={1.2} fill="#FFFFFF" />
      {/* leaf */}
      <path
        d="M -8 -9 L -3 -12.5 L 0 -8.5 L 3 -12.5 L 8 -9 L 3 -6.2 L 0 -7.5 L -3 -6.2 Z"
        fill="#16A34A"
        stroke="#15803D"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <line x1={0} y1={-12.5} x2={0} y2={-16} stroke="#15803D" strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** Small green badge revealing a hidden digit, anchored above-right of a fruit. */
function RevealBadge({ cx, cy, digit }: { cx: number; cy: number; digit: number }) {
  return (
    <g>
      <circle cx={cx + 15} cy={cy - 17} r={10} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.6} />
      <text x={cx + 15} y={cy - 17} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#FFFFFF">
        {digit}
      </text>
    </g>
  )
}

/** Amber "guess" badge (a tried digit), crossed out in red when the try failed. */
function GuessBadge({ cx, cy, digit, failed }: { cx: number; cy: number; digit: number; failed: boolean }) {
  return (
    <g>
      <circle cx={cx + 15} cy={cy - 17} r={10} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />
      <text x={cx + 15} y={cy - 17} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#B45309">
        {digit}
      </text>
      {failed && (
        <g stroke="#EF4444" strokeWidth={2.4} strokeLinecap="round">
          <line x1={cx + 8} y1={cy - 24} x2={cx + 22} y2={cy - 10} />
          <line x1={cx + 22} y1={cy - 24} x2={cx + 8} y2={cy - 10} />
        </g>
      )}
    </g>
  )
}

export const FRUIT_VIEW_W = 300
export const FRUIT_VIEW_H = 212

const TENS_X = 128
const ONES_X = 188
const TOP_Y = 50
const SUB_Y = 106
const RULE_Y = 134
const RES_Y = 170
const MINUS_X = 86

export interface FruitSubDiagramProps {
  /** Reveal the bananas' hidden digit (4) in a green badge. */
  revealBanana?: boolean
  /** Reveal the strawberry's hidden digit (8) in a green badge. */
  revealStrawberry?: boolean
  /** Soft column highlight. */
  highlight?: 'none' | 'tens' | 'ones' | 'all'
  /** A tried banana digit shown in an amber badge; crossed out when failed. */
  bananaGuess?: { digit: number; failed: boolean } | null
  /** Show the borrow notation: 8 struck through, small 7 above, small 1 lent to the ones. */
  borrow?: boolean
  /** Show a green check mark beside the result row. */
  showCheck?: boolean
}

export function FruitSubDiagram({
  revealBanana = false,
  revealStrawberry = false,
  highlight = 'none',
  bananaGuess = null,
  borrow = false,
  showCheck = false,
}: FruitSubDiagramProps) {
  const hiTens = highlight === 'tens' || highlight === 'all'
  const hiOnes = highlight === 'ones' || highlight === 'all'
  return (
    <svg
      viewBox={`0 0 ${FRUIT_VIEW_W} ${FRUIT_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* column highlights */}
      {hiTens && <rect x={TENS_X - 24} y={22} width={48} height={166} rx={10} fill="#DBEAFE" />}
      {hiOnes && <rect x={ONES_X - 24} y={22} width={48} height={166} rx={10} fill="#DBEAFE" />}

      {/* top row: 8 [banana] */}
      <text x={TENS_X} y={TOP_Y} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill={INK}>
        8
      </text>
      <BananaGlyph cx={ONES_X} cy={TOP_Y} />

      {/* borrow notation: strike the 8, small red 7 above, small red 1 lent to the ones */}
      {borrow && (
        <g>
          <line x1={TENS_X - 11} y1={TOP_Y + 13} x2={TENS_X + 11} y2={TOP_Y - 13} stroke="#EF4444" strokeWidth={2.2} strokeLinecap="round" />
          <text x={TENS_X - 16} y={TOP_Y - 24} textAnchor="middle" fontSize={15} fontWeight={900} fill="#EF4444">
            7
          </text>
          <text x={ONES_X - 22} y={TOP_Y - 12} textAnchor="middle" fontSize={13} fontWeight={900} fill="#EF4444">
            1
          </text>
        </g>
      )}

      {/* subtrahend row: − [banana] [strawberry] */}
      <line x1={MINUS_X - 9} y1={SUB_Y} x2={MINUS_X + 9} y2={SUB_Y} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <BananaGlyph cx={TENS_X} cy={SUB_Y} />
      <StrawberryGlyph cx={ONES_X} cy={SUB_Y} />

      {/* ruled line */}
      <line x1={MINUS_X - 12} y1={RULE_Y} x2={ONES_X + 30} y2={RULE_Y} stroke={INK} strokeWidth={3} strokeLinecap="round" />

      {/* result row: 3 6 */}
      <text x={TENS_X} y={RES_Y} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill={INK}>
        3
      </text>
      <text x={ONES_X} y={RES_Y} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill={INK}>
        6
      </text>
      {showCheck && (
        <text x={ONES_X + 48} y={RES_Y} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill="#10B981">
          ✓
        </text>
      )}

      {/* hidden-digit badges */}
      {revealBanana && (
        <g>
          <RevealBadge cx={ONES_X} cy={TOP_Y} digit={BANANA_DIGIT} />
          <RevealBadge cx={TENS_X} cy={SUB_Y} digit={BANANA_DIGIT} />
        </g>
      )}
      {!revealBanana && bananaGuess && (
        <g>
          <GuessBadge cx={ONES_X} cy={TOP_Y} digit={bananaGuess.digit} failed={bananaGuess.failed} />
          <GuessBadge cx={TENS_X} cy={SUB_Y} digit={bananaGuess.digit} failed={bananaGuess.failed} />
        </g>
      )}
      {revealStrawberry && <RevealBadge cx={ONES_X} cy={SUB_Y} digit={STRAWBERRY_DIGIT} />}
    </svg>
  )
}

export default function FruitSubtraction20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Vertical subtraction: 8 and a banana on top, minus a banana and a strawberry, equals 36. Both bananas hide the same digit."
    >
      <FruitSubDiagram />
    </div>
  )
}
