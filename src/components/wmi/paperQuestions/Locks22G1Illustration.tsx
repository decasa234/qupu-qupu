// "Magic-key padlocks" figure for WMI-22F1A-Q13 (Grade 1, answer C = 3).
//
// Six padlocks, each engraved with an arithmetic expression on its body:
//   6+5, 14−4, 18−6, 7+9, 15−3−3, 4+6+4   (values 11, 10, 12, 16, 9, 14).
// A magic key opens a lock whose number is > 10 AND < 15. The static figure
// shows ONLY the expressions — never the values, never which locks open.
//
// `LockRow` is a co-exported primitive the animator drives: `litIndex` rings
// the lock currently being checked; `openIndexes` shows locks as OPEN
// (shackle lifted + green body). The default export draws the bare problem.
//
// Pure render — no random, no dates, SSR-safe & deterministic.

/** The six lock expressions, in the fixed paper order. */
export const LOCK_EXPRESSIONS = ['6+5', '14−4', '18−6', '7+9', '15−3−3', '4+6+4'] as const

/** Their values, for aria text + animator reference (NOT drawn statically). */
export const LOCK_VALUES = [11, 10, 12, 16, 9, 14] as const

// Per-lock body tint, mirroring the source figure's pastel sequence.
const BODY_FILLS = [
  '#C7B8E8', // soft purple
  '#A4C93A', // lime
  '#F4B6BE', // pink
  '#7FD0EF', // sky
  '#FFD23F', // yellow
  '#C98BC0', // mauve
] as const

const SHACKLE = '#B8BEC7'
const SHACKLE_DARK = '#9CA3AF'
const OPEN_BODY = '#34C77B'
const INK = '#1F2937'

// --- single-lock geometry -------------------------------------------------
const BODY_W = 100
const BODY_H = 70
const BODY_RX = 12
const SHACKLE_R = 24 // outer radius of the shackle bend
const SHACKLE_W = 12 // stroke width of the shackle bar
const SHACKLE_RISE = 18 // straight legs above the bend, before the arc
// Vertical room a shackle needs above the body top (closed pose).
const SHACKLE_SPAN = SHACKLE_RISE + SHACKLE_R + SHACKLE_W / 2
const CELL_TOP_PAD = SHACKLE_SPAN + 6 // headroom so the lifted shackle never clips

/**
 * One padlock with its expression engraved on the body.
 * Origin (0,0) sits at the top-left of the body rectangle.
 */
function Lock({
  expr,
  bodyColor,
  lit = false,
  open = false,
}: {
  expr: string
  bodyColor: string
  lit?: boolean
  open?: boolean
}) {
  const cx = BODY_W / 2
  const bodyFill = open ? OPEN_BODY : bodyColor
  const textColor = open ? '#0B5132' : INK

  // Shackle path. Closed = both legs sink into the body. Open = the whole
  // shackle lifts and the right leg swings clear (hinged at the left leg).
  // Left leg always seats at y = 6. Closed: right leg also seats at 6.
  // Open: the right leg lifts above the body so the shackle reads "unlocked".
  const rightLegBottom = open ? -SHACKLE_W * 1.5 : 6
  const left = cx - 18
  const archTop = 6 - SHACKLE_RISE // y the legs rise to before the arc
  const shackle = `M ${left} 6 v ${-SHACKLE_RISE} a 18 18 0 0 1 36 0 v ${rightLegBottom - archTop}`

  return (
    <g>
      {/* shackle (behind the body) */}
      <path
        d={shackle}
        fill="none"
        stroke={open ? SHACKLE_DARK : SHACKLE}
        strokeWidth={SHACKLE_W}
        strokeLinecap="round"
      />
      {/* body */}
      <rect x={0} y={0} width={BODY_W} height={BODY_H} rx={BODY_RX} fill={bodyFill} />
      {/* keyhole hint — a tiny circle, neutral, no value leaked */}
      <circle cx={cx} cy={16} r={3.5} fill={open ? '#0B5132' : 'rgba(31,41,55,0.28)'} />
      {/* engraved expression, centered on the lower body */}
      <text
        x={cx}
        y={BODY_H / 2 + 9}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-display"
        fontSize={expr.length > 5 ? 18 : 22}
        fontWeight={800}
        fill={textColor}
      >
        {expr}
      </text>
      {/* "currently checking" ring */}
      {lit && (
        <rect
          x={-5}
          y={-SHACKLE_SPAN - 1}
          width={BODY_W + 10}
          height={BODY_H + SHACKLE_SPAN + 6}
          rx={BODY_RX + 4}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={3.5}
        />
      )}
    </g>
  )
}

export interface LockRowProps {
  /** 0-based indexes (into LOCK_EXPRESSIONS) drawn as OPEN locks. */
  openIndexes?: number[]
  /** 0-based index of the lock currently being checked (ringed). */
  litIndex?: number
}

// Grid layout: 2 rows x 3 columns.
const COLS = 3
const ROWS = 2
const CELL_W = BODY_W
const CELL_H = BODY_H + CELL_TOP_PAD
const GAP_X = 26
const GAP_Y = 22
const PAD = 12

const GRID_W = COLS * CELL_W + (COLS - 1) * GAP_X
const GRID_H = ROWS * CELL_H + (ROWS - 1) * GAP_Y
export const LR_VIEW_W = PAD * 2 + GRID_W
export const LR_VIEW_H = PAD * 2 + GRID_H

/**
 * The six padlocks (fixed order), drawn as an SVG figure.
 * Co-exported so the animator can light/open individual locks.
 */
export function LockRow({ openIndexes = [], litIndex }: LockRowProps) {
  const openSet = new Set(openIndexes)

  const ariaLabel = `Enam gembok bertuliskan ${LOCK_EXPRESSIONS.join(', ')}. Kunci ajaib membuka gembok yang angkanya lebih dari 10 dan kurang dari 15.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${LR_VIEW_W} ${LR_VIEW_H}`}
        width={Math.min(360, LR_VIEW_W)}
        style={{ display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {LOCK_EXPRESSIONS.map((expr, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          // bodyX/bodyY = top-left of the BODY rect within the grid cell.
          const bodyX = PAD + col * (CELL_W + GAP_X)
          const bodyY = PAD + row * (CELL_H + GAP_Y) + CELL_TOP_PAD
          const open = openSet.has(i)
          return (
            <g key={i} transform={`translate(${bodyX}, ${bodyY})`}>
              <Lock expr={expr} bodyColor={BODY_FILLS[i]} lit={litIndex === i} open={open} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * Paper-question default export. `params` is accepted for interface symmetry
 * with concept illustrations but the six expressions are fixed by the paper,
 * so the figure is fully self-contained. Always renders the bare problem
 * (no lit lock, no open locks).
 */
export default function Locks22G1Illustration() {
  return <LockRow />
}
