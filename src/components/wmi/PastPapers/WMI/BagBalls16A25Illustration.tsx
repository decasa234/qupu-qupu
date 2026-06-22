// BagBalls16A25Illustration.tsx
//
// Stem illustration for SEAMO-16-A-Q25:
//   "There are 5 blue balls, 4 orange balls and 2 yellow balls in a bag.
//    Sheila is blindfolded and starts to take the balls out, one at a time.
//    At least how many balls must she take out so that, for certain, she ends
//    up with 4 balls of the same colour?"
//
// The figure shows a cloth drawstring bag with the 11 balls visible inside,
// colour-coded: 5 blue, 4 orange, 2 yellow. The blindfold / question mark
// overlay signals the uncertainty. The ANSWER (9) is NOT shown here.
//
// Adapted from: AppleBags23PEIllustration (bag shape) and Balls22G1Option
// (ball rendering style). Pure SVG, SSR-safe — no hooks, no random.

export const SVG_W = 320
export const SVG_H = 220

// Ball colours — bound to breakdown.quantities
export const BLUE_FILL   = '#3B82F6'   // blue balls  (5)
export const ORANGE_FILL = '#F97316'   // orange balls (4)
export const YELLOW_FILL = '#EAB308'   // yellow balls (2)
export const BALL_STROKE = '#1E293B'

/** Ball counts — bound to seed quantities */
export const BALL_COUNTS = { blue: 5, orange: 4, yellow: 2 } as const

/** All 11 balls in display order (blue first, orange, yellow) */
export const ALL_BALLS: Array<{ fill: string; label: string }> = [
  ...Array(BALL_COUNTS.blue).fill({ fill: BLUE_FILL,   label: 'blue'   }),
  ...Array(BALL_COUNTS.orange).fill({ fill: ORANGE_FILL, label: 'orange' }),
  ...Array(BALL_COUNTS.yellow).fill({ fill: YELLOW_FILL, label: 'yellow' }),
]

// ── Bag shape (cloth / drawstring style) ─────────────────────────────────────

const BAG_CX = SVG_W / 2
const BAG_TOP_Y = 40     // top of drawstring opening
const BAG_BODY_TOP = 62  // where the body widens
const BAG_BOTTOM_Y = 188
const BAG_W_HALF = 96    // half-width at widest

/**
 * A cloth drawstring bag: a rounded trapezoidal body with a pinched neck.
 * The opening (neck) is at the top; the body fans out below.
 */
export function BagShape({ highlight = false }: { highlight?: boolean }) {
  const neck = 26 // half-width at the neck

  // Body outline: start at top-left neck, curve out and down, curve back
  const bodyPath = [
    `M ${BAG_CX - neck} ${BAG_TOP_Y}`,
    // neck left → body bottom-left
    `Q ${BAG_CX - BAG_W_HALF - 10} ${BAG_BODY_TOP + 40} ${BAG_CX - BAG_W_HALF} ${BAG_BOTTOM_Y - 16}`,
    // bottom curve
    `Q ${BAG_CX} ${BAG_BOTTOM_Y + 12} ${BAG_CX + BAG_W_HALF} ${BAG_BOTTOM_Y - 16}`,
    // body bottom-right → neck right
    `Q ${BAG_CX + BAG_W_HALF + 10} ${BAG_BODY_TOP + 40} ${BAG_CX + neck} ${BAG_TOP_Y}`,
    'Z',
  ].join(' ')

  return (
    <g>
      {/* Bag body */}
      <path
        d={bodyPath}
        fill={highlight ? '#FFF7ED' : '#F5F0E8'}
        stroke="#A0846C"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* Inner shading stripe */}
      <path
        d={[
          `M ${BAG_CX - neck + 6} ${BAG_TOP_Y + 6}`,
          `Q ${BAG_CX - BAG_W_HALF + 18} ${BAG_BODY_TOP + 50} ${BAG_CX - BAG_W_HALF + 18} ${BAG_BOTTOM_Y - 24}`,
        ].join(' ')}
        fill="none"
        stroke="#C9B49A"
        strokeWidth={2}
        opacity={0.55}
      />
      {/* Drawstring tie at the top */}
      <ellipse
        cx={BAG_CX}
        cy={BAG_TOP_Y}
        rx={neck + 2}
        ry={7}
        fill="#D4B896"
        stroke="#A0846C"
        strokeWidth={2}
      />
      {/* Drawstring loops */}
      <path
        d={`M ${BAG_CX - 14} ${BAG_TOP_Y - 4} Q ${BAG_CX - 26} ${BAG_TOP_Y - 22} ${BAG_CX - 10} ${BAG_TOP_Y - 18}`}
        fill="none" stroke="#A0846C" strokeWidth={2} strokeLinecap="round"
      />
      <path
        d={`M ${BAG_CX + 14} ${BAG_TOP_Y - 4} Q ${BAG_CX + 26} ${BAG_TOP_Y - 22} ${BAG_CX + 10} ${BAG_TOP_Y - 18}`}
        fill="none" stroke="#A0846C" strokeWidth={2} strokeLinecap="round"
      />
    </g>
  )
}

// ── Ball layout inside bag ────────────────────────────────────────────────────

const BALL_R = 13
const GRID_COLS = 4
const CELL_W = (BAG_W_HALF * 2 - 16) / GRID_COLS
const CELL_H = 36
const GRID_LEFT = BAG_CX - BAG_W_HALF + 14
const GRID_TOP = BAG_BODY_TOP + 20

/** Returns {cx, cy} for the i-th ball (0-based) in the grid */
export function ballCenter(i: number): { cx: number; cy: number } {
  const col = i % GRID_COLS
  const row = Math.floor(i / GRID_COLS)
  return {
    cx: GRID_LEFT + col * CELL_W + CELL_W / 2,
    cy: GRID_TOP + row * CELL_H + CELL_H / 2,
  }
}

/** A single coloured ball with a specular highlight */
export function Ball({
  cx, cy, fill, r = BALL_R, dim = false,
}: { cx: number; cy: number; fill: string; r?: number; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.3 : 1}>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={BALL_STROKE} strokeWidth={1.5} />
      {/* specular highlight */}
      <ellipse
        cx={cx - r * 0.28}
        cy={cy - r * 0.28}
        rx={r * 0.28}
        ry={r * 0.22}
        fill="white"
        opacity={0.55}
      />
    </g>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  const items = [
    { fill: BLUE_FILL,   label: '5 blue' },
    { fill: ORANGE_FILL, label: '4 orange' },
    { fill: YELLOW_FILL, label: '2 yellow' },
  ]
  const totalW = 210
  const startX = (SVG_W - totalW) / 2
  return (
    <g>
      {items.map(({ fill, label }, i) => {
        const x = startX + i * 72
        return (
          <g key={label}>
            <circle cx={x + 8} cy={SVG_H - 14} r={7} fill={fill} stroke={BALL_STROKE} strokeWidth={1.2} />
            <text
              x={x + 19}
              y={SVG_H - 14}
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill="#374151"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────

export default function BagBalls16A25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A cloth drawstring bag containing 11 balls: 5 blue, 4 orange, and 2 yellow. Sheila is blindfolded and must draw balls until she is certain she holds 4 of the same colour."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <BagShape />

        {/* Balls inside bag */}
        {ALL_BALLS.map((ball, i) => {
          const { cx, cy } = ballCenter(i)
          return <Ball key={i} cx={cx} cy={cy} fill={ball.fill} />
        })}

        {/* Legend at bottom */}
        <Legend />
      </svg>
    </div>
  )
}
