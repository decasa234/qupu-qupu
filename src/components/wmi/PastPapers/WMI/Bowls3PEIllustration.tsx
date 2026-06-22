// IKMC-23-PE-Q3 — "Each bowl contains four numbered balls. In which bowl is
// the sum of all the numbers largest?"  Answer: A (8+7+4+9 = 28).
//
// The A–E options ARE the only figures (no separate stem image).
// TYPE: options-only.
//
// Reading the scan (2023.imgs/008–012.jpg):
//   A (008): top-left 8 (yellow), top-right 7 (blue), bottom-left 4 (green),  bottom-right 9 (orange)  → 28 ← ANSWER
//   B (009): top-left 4 (green),  top-right 6 (orange), bottom-left 7 (cyan),   bottom-right 9 (red-orange) → 26
//   C (010): top-left 7 (cyan),   top-right 9 (red),   bottom-left 4 (green),  bottom-right 7 (cyan)   → 27
//   D (011): top-left 9 (red),    top-right 7 (cyan),  bottom-left 4 (green),  bottom-right 4 (green)  → 24
//   E (012): top-left 7 (cyan),   top-right 4 (green), bottom-left 9 (red),    bottom-right 5 (pink)   → 25
//
// Co-exports:
//   BowlShape        — shared SVG primitive: a simple elliptical bowl outline
//   NumberedBall     — shared SVG primitive: a filled circle with centred number
//   BowlContents     — shared SVG: 4 balls arranged 2×2 inside a bowl
//   Bowls3PEOption   — per-choice renderer for CHOICE_RENDERERS['IKMC-23-PE-Q3']
//
// Pure render, SSR-safe, deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── palette ───────────────────────────────────────────────────────────────────
const INK       = '#1F2937'
const BOWL_FILL = '#FFFFFF'
const BOWL_STROKE = '#4B5563'

// Ball fill colours keyed by label (read from scan)
const YELLOW  = '#FBBF24'
const BLUE_   = '#60A5FA'
const GREEN_  = '#34D399'
const ORANGE  = '#FB923C'
const CYAN_   = '#67E8F9'
const RED_    = '#F87171'
const PINK_   = '#FDA4AF'

// ── geometry ─────────────────────────────────────────────────────────────────
const VW = 120   // viewBox width for one option
const VH = 110   // viewBox height for one option

// Bowl shape: elliptical "bowl" drawn as a wide arc + base line
// The bowl sits in the centre of the viewBox.
const BOWL_CX = VW / 2
const BOWL_TOP_Y = 12     // top of the bowl rim
const BOWL_RX = 50        // horizontal radius of the bowl rim
const BOWL_RY_TOP = 10    // vertical radius of the top ellipse (rim)
const BOWL_BODY_H = 64    // height of bowl body
const BOWL_BOT_Y = BOWL_TOP_Y + BOWL_BODY_H  // bottom of bowl body
const BOWL_BOT_RX = 28   // narrower at the bottom (trapezoid shape)
const BOWL_BOT_RY = 8    // vertical radius of the bottom ellipse (base)

// Ball geometry
const BALL_R = 16         // ball radius
// 2×2 arrangement: top row and bottom row, centred in the bowl
const BALL_TOP_Y  = BOWL_TOP_Y + 28   // y centre of top-row balls
const BALL_BOT_Y  = BALL_TOP_Y + 27   // y centre of bottom-row balls
const BALL_LEFT_X = BOWL_CX - 18      // x centre of left balls
const BALL_RIGHT_X = BOWL_CX + 18     // x centre of right balls

// ── types ─────────────────────────────────────────────────────────────────────
export interface BallSpec {
  num: number
  fill: string
}

// ── option data ───────────────────────────────────────────────────────────────
// Layout: [topLeft, topRight, bottomLeft, bottomRight]
export const BOWL_DATA: Record<'A' | 'B' | 'C' | 'D' | 'E', [BallSpec, BallSpec, BallSpec, BallSpec]> = {
  A: [
    { num: 8, fill: YELLOW },
    { num: 7, fill: BLUE_ },
    { num: 4, fill: GREEN_ },
    { num: 9, fill: ORANGE },
  ],
  B: [
    { num: 4, fill: GREEN_ },
    { num: 6, fill: ORANGE },
    { num: 7, fill: CYAN_ },
    { num: 9, fill: RED_ },
  ],
  C: [
    { num: 7, fill: CYAN_ },
    { num: 9, fill: RED_ },
    { num: 4, fill: GREEN_ },
    { num: 7, fill: CYAN_ },
  ],
  D: [
    { num: 9, fill: RED_ },
    { num: 7, fill: CYAN_ },
    { num: 4, fill: GREEN_ },
    { num: 4, fill: GREEN_ },
  ],
  E: [
    { num: 7, fill: CYAN_ },
    { num: 4, fill: GREEN_ },
    { num: 9, fill: RED_ },
    { num: 5, fill: PINK_ },
  ],
}

// ── shared primitives ─────────────────────────────────────────────────────────

/** A single numbered ball, centred at (cx, cy). */
export function NumberedBall({
  cx,
  cy,
  spec,
  highlight,
}: {
  cx: number
  cy: number
  spec: BallSpec
  highlight?: boolean
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={BALL_R}
        fill={spec.fill}
        stroke={highlight ? '#F97316' : INK}
        strokeWidth={highlight ? 2.5 : 1.5}
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="700"
        fill={INK}
        fontFamily="sans-serif"
      >
        {spec.num}
      </text>
    </g>
  )
}

/** The bowl outline — an arc-like shape using path. */
export function BowlShape({ highlight }: { highlight?: boolean }) {
  // Bowl is drawn as:
  //  - a wide top ellipse (rim arc, upper half only)
  //  - two curved sides going down
  //  - a narrow bottom ellipse (base)
  // We use a single path for the silhouette.
  const rx = BOWL_RX
  const ry = BOWL_RY_TOP
  const bx = BOWL_BOT_RX
  const by = BOWL_BOT_RY
  const topY = BOWL_TOP_Y
  const botY = BOWL_BOT_Y
  const cx = BOWL_CX

  // Top rim: arc from (cx-rx, topY) to (cx+rx, topY) — upper half ellipse (sweep clockwise)
  // Sides: line down from rim to base width
  // Bottom: arc from (cx-bx, botY) to (cx+bx, botY) — lower half ellipse (sweep anti-clockwise)
  const d = [
    `M ${cx - rx} ${topY}`,
    `A ${rx} ${ry} 0 0 1 ${cx + rx} ${topY}`,        // top rim arc (right half)
    `Q ${cx + rx + 6} ${topY + BOWL_BODY_H / 2} ${cx + bx} ${botY}`,  // right side curve
    `A ${bx} ${by} 0 0 1 ${cx - bx} ${botY}`,        // bottom base arc
    `Q ${cx - rx - 6} ${topY + BOWL_BODY_H / 2} ${cx - rx} ${topY}`,  // left side curve
    'Z',
  ].join(' ')

  return (
    <path
      d={d}
      fill={BOWL_FILL}
      stroke={highlight ? '#F97316' : BOWL_STROKE}
      strokeWidth={highlight ? 2.5 : 1.5}
    />
  )
}

/** Four balls arranged 2×2 inside the bowl. */
export function BowlContents({
  balls,
  highlightAll,
}: {
  balls: [BallSpec, BallSpec, BallSpec, BallSpec]
  highlightAll?: boolean
}) {
  const positions: [number, number][] = [
    [BALL_LEFT_X,  BALL_TOP_Y],
    [BALL_RIGHT_X, BALL_TOP_Y],
    [BALL_LEFT_X,  BALL_BOT_Y],
    [BALL_RIGHT_X, BALL_BOT_Y],
  ]
  return (
    <>
      {balls.map((spec, i) => (
        <NumberedBall
          key={i}
          cx={positions[i][0]}
          cy={positions[i][1]}
          spec={spec}
          highlight={highlightAll}
        />
      ))}
    </>
  )
}

// ── option renderer ───────────────────────────────────────────────────────────

/** Renders one choice A–E as a bowl with 4 numbered balls. */
export function Bowls3PEOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E'
  const data = BOWL_DATA[key]
  if (!data) return <span>{choice.text}</span>

  const sum = data.reduce((acc, b) => acc + b.num, 0)
  const ariaLabel = `Bowl ${key}: balls ${data.map((b) => b.num).join(', ')} — sum ${sum}`

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 120, display: 'block' }}
      role="img"
      aria-label={ariaLabel}
    >
      <BowlShape />
      <BowlContents balls={data} />
    </svg>
  )
}

