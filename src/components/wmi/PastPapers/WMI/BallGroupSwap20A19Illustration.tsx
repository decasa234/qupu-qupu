// BallGroupSwap20A19Illustration.tsx
//
// Stem illustration for SEAMO-20-A-Q19:
//   "Which two balls, one from Group A and one from Group B, should be switched
//    such that the sum of the numbers in both groups is the same?
//    Group A: 45, 33, 16  |  Group B: 27, 39, 40"
//
// The figure shows two side-by-side groups of 3 numbered balls in a pyramid
// arrangement (1 on top, 2 on the bottom row). Bold number labels inside each
// ball, same layout as the original paper crop.
//
// Pure SVG, SSR-safe — no hooks, no framer-motion.

// ── Constants ─────────────────────────────────────────────────────────────────

const SVG_W = 340
const SVG_H = 170

const BALL_R = 26
const BALL_FILL = '#FFFFFF'
const BALL_STROKE = '#1E293B'
const LABEL_FILL = '#1E293B'

// ── Ball primitive ─────────────────────────────────────────────────────────────

function NumberedBall({
  cx,
  cy,
  label,
  r = BALL_R,
}: {
  cx: number
  cy: number
  label: string
  r?: number
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={BALL_FILL}
        stroke={BALL_STROKE}
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        fill={LABEL_FILL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Ball pyramid (1 top + 2 bottom) ──────────────────────────────────────────

/** Renders a 3-ball pyramid centred on (cx, cy).
 *  top: top ball label; left/right: bottom row labels. */
function BallPyramid({
  cx,
  cy,
  top,
  left,
  right,
  groupLabel,
}: {
  cx: number
  cy: number
  top: string
  left: string
  right: string
  groupLabel: string
}) {
  const spacing = BALL_R * 2 + 2   // horizontal gap between bottom balls
  const rowGap  = BALL_R * 1.8     // vertical gap top → bottom row

  const topCx  = cx
  const topCy  = cy
  const botY   = cy + rowGap
  const leftCx = cx - spacing / 2
  const rightCx = cx + spacing / 2

  return (
    <g>
      {/* Group label above */}
      <text
        x={cx}
        y={topCy - BALL_R - 8}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={14}
        fontWeight={700}
        fill={LABEL_FILL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {groupLabel}
      </text>

      {/* Top ball */}
      <NumberedBall cx={topCx} cy={topCy} label={top} />

      {/* Bottom row */}
      <NumberedBall cx={leftCx}  cy={botY} label={left} />
      <NumberedBall cx={rightCx} cy={botY} label={right} />

      {/* Bracket line under the two bottom balls */}
      <line
        x1={leftCx  - BALL_R}
        y1={botY + BALL_R + 5}
        x2={rightCx + BALL_R}
        y2={botY + BALL_R + 5}
        stroke={BALL_STROKE}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────

export default function BallGroupSwap20A19Illustration() {
  const groupAX = SVG_W * 0.27   // centre of Group A pyramid
  const groupBX = SVG_W * 0.73   // centre of Group B pyramid
  const centreY = SVG_H * 0.53   // vertical centre for top ball

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two groups of three numbered balls in a pyramid. Group A: 45 on top, 33 and 16 below. Group B: 27 on top, 39 and 40 below. Switch one ball from each group so both groups have the same total."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Group A — balls: 45 (top), 33 (bottom-left), 16 (bottom-right) */}
        <BallPyramid
          cx={groupAX}
          cy={centreY}
          top="45"
          left="33"
          right="16"
          groupLabel="Group A"
        />

        {/* Group B — balls: 27 (top), 39 (bottom-left), 40 (bottom-right) */}
        <BallPyramid
          cx={groupBX}
          cy={centreY}
          top="27"
          left="39"
          right="40"
          groupLabel="Group B"
        />
      </svg>
    </div>
  )
}
