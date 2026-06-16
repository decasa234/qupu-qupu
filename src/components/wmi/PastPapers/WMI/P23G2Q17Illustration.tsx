// WMI-23P2A-Q17 (2023 Grade 2 Semifinal, Paper A) — "Square ∩ Circle number sort".
//
// Recovered from db/seed/wmi/figures/2023-semifinal-g2-a-q17.jpg:
//   An orange SQUARE (upper-left) overlaps a blue CIRCLE (lower-right). Thirteen
//   numbers are scattered across the four regions. Classifying each by position:
//     • outside both:            16, 5, 1, 27
//     • inside square only:      8, 39, 10
//     • inside both (overlap):   4, 32
//     • inside circle only:      25, 6, 13, 7   ← the region the question asks about
//
//   Question: how many DIGITS are outside the square AND inside the circle?
//   (3 = one digit, 24 = two digits.) The circle-only numbers are 25, 6, 13, 7,
//   so the digit count = 2 + 1 + 2 + 1 = 6 (answer B — NOT shown here).
//   Trap: counting NUMBERS instead of digits gives 4 (distractor A).

const VW = 420
const VH = 320

// Square (orange), upper-left.
const SQ = { x: 70, y: 24, size: 190 }
const SQ_STROKE = '#F18A1B'

// Circle (blue), lower-right — overlaps the square.
const CIRC = { cx: 268, cy: 176, r: 128 }
const CIRC_STROKE = '#1BA5DC'

const NUM_FILL = '#1F2937'

// Region kinds.
type Region = 'outside' | 'square' | 'both' | 'circle'

interface Placed {
  v: string
  x: number
  y: number
  region: Region
}

// Each number with a hand-placed coordinate that sits in its correct region.
// (Positions chosen so the verifier-confirmed region of each number is honoured.)
export const NUMBERS: Placed[] = [
  // outside both
  { v: '16', x: 26, y: 110, region: 'outside' },
  { v: '5', x: 320, y: 40, region: 'outside' },
  { v: '1', x: 30, y: 246, region: 'outside' },
  { v: '27', x: 118, y: 292, region: 'outside' },
  // square only
  { v: '8', x: 108, y: 60, region: 'square' },
  { v: '39', x: 170, y: 56, region: 'square' },
  { v: '10', x: 104, y: 186, region: 'square' },
  // both (overlap)
  { v: '4', x: 244, y: 110, region: 'both' },
  { v: '32', x: 224, y: 178, region: 'both' },
  // circle only
  { v: '25', x: 338, y: 132, region: 'circle' },
  { v: '6', x: 300, y: 206, region: 'circle' },
  { v: '13', x: 222, y: 268, region: 'circle' },
  { v: '7', x: 358, y: 264, region: 'circle' },
]

export const CIRCLE_ONLY = NUMBERS.filter((n) => n.region === 'circle').map((n) => n.v) // ['25','6','13','7']
export const CIRCLE_ONLY_DIGITS = CIRCLE_ONLY.reduce((s, v) => s + v.length, 0) // 6

export interface NumberVennProps {
  /** Highlight (ring) the circle-only numbers. */
  highlightCircleOnly?: boolean
  /** Dim numbers that are NOT in the circle-only region. */
  dimOthers?: boolean
}

/** The reusable square∩circle scene with the thirteen numbers. */
export function NumberVenn({ highlightCircleOnly = false, dimOthers = false }: NumberVennProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* circle (drawn first so the square edge reads on top where they cross) */}
      <circle cx={CIRC.cx} cy={CIRC.cy} r={CIRC.r} fill="none" stroke={CIRC_STROKE} strokeWidth={3.5} />
      {/* square */}
      <rect x={SQ.x} y={SQ.y} width={SQ.size} height={SQ.size} fill="none" stroke={SQ_STROKE} strokeWidth={3.5} />

      {/* highlight rings behind the circle-only numbers */}
      {highlightCircleOnly &&
        NUMBERS.filter((n) => n.region === 'circle').map((n) => (
          <circle key={`hl${n.v}`} cx={n.x} cy={n.y} r={16} fill="#FDE68A" opacity={0.85} />
        ))}

      {/* numbers */}
      {NUMBERS.map((n) => {
        const isCircleOnly = n.region === 'circle'
        const faded = dimOthers && !isCircleOnly
        return (
          <text
            key={n.v + n.x}
            x={n.x}
            y={n.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={700}
            fill={NUM_FILL}
            opacity={faded ? 0.22 : 1}
          >
            {n.v}
          </text>
        )
      })}
    </svg>
  )
}

export default function P23G2Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="An orange square overlapping a blue circle. Numbers are scattered across the regions: outside both (16, 5, 1, 27); inside the square only (8, 39, 10); inside both (4, 32); inside the circle only (25, 6, 13, 7)."
    >
      <NumberVenn />
    </div>
  )
}
