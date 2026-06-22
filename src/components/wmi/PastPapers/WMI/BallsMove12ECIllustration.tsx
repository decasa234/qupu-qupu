// IKMC-21-EC-Q12 — "The 5 balls shown begin to move simultaneously…"
//
// STEM (image 044.jpg): five numbered balls on a horizontal line, each with a
// small direction arrow above it, left-to-right:
//   →10  →9  ←3  ←7  ←20
//
// EXAMPLE (image 045.jpg): two balls 11(→) and 4(←) collide; bigger wins;
// result 15(→) continues rightward. Shown as an inset below the stem row.
//
// OPTIONS (image 046.jpg): each of the five A–E choices is a single ball with
// a direction arrow and a value. Reconstructed from both the OCR image and the
// seed JSON text:
//   A: 50, right   B: 48, right   C: 49, left   D: 50, left   E: 49, right
//
// Co-exported primitives (reused by explainer):
//   BallNode  — one numbered ball + direction arrow
//   BallRow   — a horizontal row of BallNodes
//   CollisionExample — the →11 ←4 → 15→ example strip
//   BallsMove12ECOption — renders ONE choice for CHOICE_RENDERERS
//
// Adapted from BallScales8ECIllustration (ball + annotation SVG style) and
// TrainArrows24G2Illustration (directional arrow glyph). Pure render: no
// randomness, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---- palette ----------------------------------------------------------------
const INK = '#1F2937'
const BALL_FILL = '#DBEAFE'   // light blue — neutral ball body
const BALL_STROKE = '#1D4ED8' // dark blue outline
const NUM_COLOR = '#1E3A5F'   // number text inside ball
const ARROW_FILL = '#F97316'  // qupu brand orange for direction arrows
const ARROW_STROKE = '#C2410C'
const TRACK_COLOR = '#CBD5E1' // light grey horizontal track line
const CORRECT_STROKE = '#10B981'
const CORRECT_FILL = '#D1FAE5'

// ---- geometry: one ball node ------------------------------------------------
export type Dir = 'left' | 'right'

const BALL_R = 22          // ball radius
const ARROW_SIZE = 9       // arrowhead half-base
const ARROW_TIP = 14       // arrow tip distance from ball centre (past edge)
// A small sideways triangle arrowhead, tip pointing in `dir`.
// The tip sits ARROW_TIP px from the ball centre; base inward.
function ArrowHead({
  cx,
  cy,
  dir,
  fill = ARROW_FILL,
  stroke = ARROW_STROKE,
}: {
  cx: number
  cy: number
  dir: Dir
  fill?: string
  stroke?: string
}) {
  const s = dir === 'right' ? 1 : -1
  // tip → right side: (cx + s*TIP, cy); base left side: (cx + s*(TIP-10), cy ± S)
  const tx = cx + s * (BALL_R + ARROW_TIP)
  const ty = cy
  const bx = cx + s * (BALL_R + 2)
  return (
    <polygon
      points={`${tx},${ty} ${bx},${ty - ARROW_SIZE} ${bx},${ty + ARROW_SIZE}`}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  )
}

export interface BallNodeData {
  value: number
  dir: Dir
}

// NODE_W: total width allocated per ball (ball + arrow on each side clearance)
export const NODE_W = (BALL_R + ARROW_TIP + 6) * 2 + 6
export const NODE_H = BALL_R * 2 + 16

/**
 * One numbered ball with a direction arrow, centred in its NODE_W × NODE_H cell.
 * `cx` is the horizontal centre, `cy` the vertical centre of the ball circle.
 * `dim` fades the node; `highlight` rings it in green.
 */
export function BallNode({
  value,
  dir,
  cx,
  cy,
  dim = false,
  highlight = false,
  fill = BALL_FILL,
  bStroke = BALL_STROKE,
}: {
  value: number
  dir: Dir
  cx: number
  cy: number
  dim?: boolean
  highlight?: boolean
  fill?: string
  bStroke?: string
}) {
  return (
    <g opacity={dim ? 0.22 : 1}>
      {highlight && (
        <circle cx={cx} cy={cy} r={BALL_R + 5} fill={CORRECT_FILL} stroke={CORRECT_STROKE} strokeWidth={2.5} />
      )}
      <circle cx={cx} cy={cy} r={BALL_R} fill={fill} stroke={bStroke} strokeWidth={2.5} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={value >= 10 ? 13 : 15}
        fontWeight={800}
        fill={NUM_COLOR}
      >
        {value}
      </text>
      <ArrowHead cx={cx} cy={cy} dir={dir} />
    </g>
  )
}

// ---- stem: five balls in a row ---------------------------------------------
export const STEM_BALLS: BallNodeData[] = [
  { value: 10, dir: 'right' },
  { value: 9,  dir: 'right' },
  { value: 3,  dir: 'left' },
  { value: 7,  dir: 'left' },
  { value: 20, dir: 'left' },
]

const N = STEM_BALLS.length
const STEM_PAD_X = 8
const STEM_GAP = 12
const STEM_W = STEM_PAD_X * 2 + N * NODE_W + (N - 1) * STEM_GAP
const STEM_H = NODE_H + 16

/** Centre x of ball at index i in the stem row. */
function stemCx(i: number): number {
  return STEM_PAD_X + NODE_W / 2 + i * (NODE_W + STEM_GAP)
}

const STEM_CY = STEM_H / 2

/**
 * A horizontal row of BallNodes connected by a thin track line. Exported so
 * the explainer can render specific intermediate states (dim all but active).
 */
export function BallRow({
  balls,
  dimSet,
  highlightSet,
}: {
  balls: BallNodeData[]
  dimSet?: Set<number>
  highlightSet?: Set<number>
}) {
  const cx0 = STEM_PAD_X + NODE_W / 2
  const cxLast = STEM_PAD_X + NODE_W / 2 + (balls.length - 1) * (NODE_W + STEM_GAP)
  return (
    <g>
      {/* track line */}
      <line
        x1={cx0 - BALL_R}
        y1={STEM_CY}
        x2={cxLast + BALL_R}
        y2={STEM_CY}
        stroke={TRACK_COLOR}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {balls.map((b, i) => {
        const cx = STEM_PAD_X + NODE_W / 2 + i * (NODE_W + STEM_GAP)
        return (
          <BallNode
            key={i}
            value={b.value}
            dir={b.dir}
            cx={cx}
            cy={STEM_CY}
            dim={dimSet?.has(i)}
            highlight={highlightSet?.has(i)}
          />
        )
      })}
    </g>
  )
}

// ---- collision example strip (→11) meets (←4) → (→15) --------------------
const EX_PAD = 12
const EX_GAP = 18    // gap between the two approaching balls
const EX_ARROW_W = 28 // width of the "→" arrow between panels
const EX_H = NODE_H + 8

// panel widths: left panel (two balls approaching), arrow glyph, right panel (result)
const EX_PANEL_W = NODE_W * 2 + EX_GAP + EX_PAD * 2
const EX_TOTAL_W = EX_PANEL_W + EX_ARROW_W + EX_PANEL_W
const EX_CY = EX_H / 2

/**
 * The collision example: left panel shows 11(→) meeting 4(←); right panel
 * shows the result 15(→). A "→" arrow connects them.
 * Pure render, aria-hidden (the outer wrapper labels it).
 */
export function CollisionExample() {
  // Left panel: ball 11 (→) at left, ball 4 (←) at right, close together
  const cx11 = EX_PAD + NODE_W / 2
  const cx4  = EX_PAD + NODE_W / 2 + NODE_W + EX_GAP

  // Right panel: result ball 15 (→)
  const rxOffset = EX_PANEL_W + EX_ARROW_W
  const cx15 = rxOffset + EX_PAD + NODE_W / 2

  // The "→" connecting arrow (simple fat chevron)
  const arrowX = EX_PANEL_W + EX_ARROW_W / 2
  return (
    <svg
      viewBox={`0 0 ${EX_TOTAL_W} ${EX_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* left panel background */}
      <rect x={0} y={2} width={EX_PANEL_W} height={EX_H - 4} rx={10} fill="#F8FAFC" stroke={TRACK_COLOR} strokeWidth={1.5} />
      {/* track in left panel */}
      <line x1={cx11 - BALL_R} y1={EX_CY} x2={cx4 + BALL_R} y2={EX_CY} stroke={TRACK_COLOR} strokeWidth={2.5} strokeLinecap="round" />
      <BallNode value={11} dir="right" cx={cx11} cy={EX_CY} />
      <BallNode value={4}  dir="left"  cx={cx4}  cy={EX_CY} />

      {/* "→" chevron between panels */}
      <text x={arrowX} y={EX_CY + 1} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK}>
        →
      </text>

      {/* right panel background */}
      <rect x={rxOffset} y={2} width={EX_PANEL_W} height={EX_H - 4} rx={10} fill="#F0FDF4" stroke={CORRECT_STROKE} strokeWidth={1.5} />
      {/* track in right panel */}
      <line x1={cx15 - BALL_R} y1={EX_CY} x2={cx15 + BALL_R} y2={EX_CY} stroke={TRACK_COLOR} strokeWidth={2.5} strokeLinecap="round" />
      <BallNode value={15} dir="right" cx={cx15} cy={EX_CY} fill={CORRECT_FILL} bStroke={CORRECT_STROKE} />
    </svg>
  )
}

// ---- default export: full stem figure --------------------------------------
const ARIA =
  'Five numbered balls on a line: 10 moving right, 9 moving right, 3 moving left, 7 moving left, 20 moving left. ' +
  'When two balls collide the bigger one swallows the smaller, adds its value, and keeps moving the same direction.'

export default function BallsMove12ECIllustration() {
  return (
    <div className="my-4 flex flex-col items-center gap-5" role="img" aria-label={ARIA}>
      {/* stem: 5 balls */}
      <svg
        viewBox={`0 0 ${STEM_W} ${STEM_H}`}
        width="100%"
        style={{ maxWidth: STEM_W, display: 'block' }}
        aria-hidden="true"
      >
        {/* overall track line */}
        <line
          x1={stemCx(0) - BALL_R}
          y1={STEM_CY}
          x2={stemCx(N - 1) + BALL_R}
          y2={STEM_CY}
          stroke={TRACK_COLOR}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {STEM_BALLS.map((b, i) => (
          <BallNode key={i} value={b.value} dir={b.dir} cx={stemCx(i)} cy={STEM_CY} />
        ))}
      </svg>

      {/* example strip */}
      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-xs font-bold text-slate-500" aria-hidden="true">
          Contoh / Example
        </p>
        <CollisionExample />
      </div>
    </div>
  )
}

// ---- option image data (from OCR + seed) -----------------------------------
// Each entry is {value, dir} matching exactly the seed text:
//   A: one ball moving right with value 50
//   B: one ball moving right with value 48
//   C: one ball moving left with value 49   (answer)
//   D: one ball moving left with value 50
//   E: one ball moving right with value 49
export const OPTION_BALLS: Record<'A' | 'B' | 'C' | 'D' | 'E', BallNodeData> = {
  A: { value: 50, dir: 'right' },
  B: { value: 48, dir: 'right' },
  C: { value: 49, dir: 'left'  },
  D: { value: 50, dir: 'left'  },
  E: { value: 49, dir: 'right' },
}

const OPT_W = NODE_W + 30
const OPT_H = NODE_H + 10
const OPT_CX = OPT_W / 2
const OPT_CY = OPT_H / 2

/**
 * Renders ONE answer choice as a ball with its value and direction arrow.
 * aria-hidden — the containing choice card already has accessible text.
 * Exported for CHOICE_RENDERERS.
 */
export function BallsMove12ECOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E'
  const data = OPTION_BALLS[key]
  if (!data) return <span>{choice.text}</span>
  return (
    <svg
      viewBox={`0 0 ${OPT_W} ${OPT_H}`}
      width="100%"
      style={{ maxWidth: OPT_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* short track segment */}
      <line
        x1={OPT_CX - BALL_R - 4}
        y1={OPT_CY}
        x2={OPT_CX + BALL_R + 4}
        y2={OPT_CY}
        stroke={TRACK_COLOR}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <BallNode value={data.value} dir={data.dir} cx={OPT_CX} cy={OPT_CY} />
    </svg>
  )
}
