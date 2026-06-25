// SEAMO-X 2024 Paper A Q7 — Wire bent into a square.
// Wire total = 98 cm. Square side = 16 cm. Perimeter = 64 cm. Remaining = 34 cm.
// Stem: shows the square shape with tick marks and "16 cm" label only.
// Never shows the answer (remaining wire). SSR-safe: no hooks, no framer-motion.

const INK = '#1F2937'
const WIRE_COLOR = '#374151'
const HL_COLOR = '#2563EB'
const LABEL_COLOR = '#1F2937'

const SQ = 160        // square side in px
const PAD = 50        // padding around square
const TICK_LEN = 10   // length of equal-side tick mark
const RA_SIZE = 12    // right-angle marker leg length

const VB_W = SQ + PAD * 2
const VB_H = SQ + PAD * 2 + 28  // extra space for "16 cm" label

const X0 = PAD
const Y0 = PAD
const X1 = PAD + SQ
const Y1 = PAD + SQ
const MX = (X0 + X1) / 2
const MY = (Y0 + Y1) / 2

export type WireSquarePhase = 'idle' | 'perimeter' | 'result'

function SquareDiagram({ phase = 'idle' }: { phase?: WireSquarePhase }) {
  const sideStroke = phase !== 'idle' ? HL_COLOR : WIRE_COLOR
  const strokeW = phase !== 'idle' ? 3.5 : 2.5

  return (
    <g>
      {/* Square outline */}
      <rect
        x={X0} y={Y0} width={SQ} height={SQ}
        fill="none"
        stroke={sideStroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />

      {/* Tick marks at midpoint of each side (equal-length indicator) */}
      {/* Top — perpendicular (vertical) */}
      <line x1={MX} y1={Y0 - TICK_LEN / 2} x2={MX} y2={Y0 + TICK_LEN / 2}
        stroke={sideStroke} strokeWidth={2} />
      {/* Bottom — perpendicular (vertical) */}
      <line x1={MX} y1={Y1 - TICK_LEN / 2} x2={MX} y2={Y1 + TICK_LEN / 2}
        stroke={sideStroke} strokeWidth={2} />
      {/* Left — perpendicular (horizontal) */}
      <line x1={X0 - TICK_LEN / 2} y1={MY} x2={X0 + TICK_LEN / 2} y2={MY}
        stroke={sideStroke} strokeWidth={2} />
      {/* Right — perpendicular (horizontal) */}
      <line x1={X1 - TICK_LEN / 2} y1={MY} x2={X1 + TICK_LEN / 2} y2={MY}
        stroke={sideStroke} strokeWidth={2} />

      {/* Right-angle markers at all four corners */}
      {/* Bottom-left */}
      <path d={`M ${X0} ${Y1 - RA_SIZE} L ${X0 + RA_SIZE} ${Y1 - RA_SIZE} L ${X0 + RA_SIZE} ${Y1}`}
        fill="none" stroke={sideStroke} strokeWidth={1.5} />
      {/* Bottom-right */}
      <path d={`M ${X1} ${Y1 - RA_SIZE} L ${X1 - RA_SIZE} ${Y1 - RA_SIZE} L ${X1 - RA_SIZE} ${Y1}`}
        fill="none" stroke={sideStroke} strokeWidth={1.5} />
      {/* Top-left */}
      <path d={`M ${X0} ${Y0 + RA_SIZE} L ${X0 + RA_SIZE} ${Y0 + RA_SIZE} L ${X0 + RA_SIZE} ${Y0}`}
        fill="none" stroke={sideStroke} strokeWidth={1.5} />
      {/* Top-right */}
      <path d={`M ${X1} ${Y0 + RA_SIZE} L ${X1 - RA_SIZE} ${Y0 + RA_SIZE} L ${X1 - RA_SIZE} ${Y0}`}
        fill="none" stroke={sideStroke} strokeWidth={1.5} />

      {/* "16 cm" dimension label below bottom side */}
      <text
        x={MX} y={Y1 + 22}
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        fontFamily="sans-serif"
        fill={LABEL_COLOR}
      >
        16 cm
      </text>
    </g>
  )
}

export interface WireSquareX24A7Props {
  /** Controls highlight state used by the explainer. */
  phase?: WireSquarePhase
}

/**
 * Named export — imported by the explainer to drive per-beat highlighting.
 * aria-hidden; must sit inside a labelled host element.
 */
export function WireSquareX24A7({ phase = 'idle' }: WireSquareX24A7Props) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <SquareDiagram phase={phase} />
    </svg>
  )
}

/**
 * SEAMO-X 2024 Paper A Q7 stem illustration.
 * Default export consumed by the registry `illustration` loader.
 */
export default function WireSquareX24A7Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A square shape formed from a wire. Each of the four sides is 16 cm long. ' +
        'Tick marks on each side show they are all equal length.'
      }
    >
      <WireSquareX24A7 />
    </div>
  )
}
