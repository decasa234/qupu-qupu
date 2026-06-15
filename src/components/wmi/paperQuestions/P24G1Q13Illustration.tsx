// WMI-24P1A-Q13 (2024 Semifinal Grade 1, Paper A) — number pyramid with an apple.
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g1-a-q13.jpg. Each box equals the
// sum of the two boxes below it. The scan shows:
//
//        ┌────┐
//        │ 20 │                       top
//        └────┘
//      ┌────┐  ┌────┐
//      │ 13 │  │    │                 middle  (left = 13, right = empty)
//      └────┘  └────┘
//   ┌──┐ ┌──┐ ┌──┐ ┌──┐
//   │8 │ │  │ │3 │ │🍎│               bottom  (8, empty, 3, apple)
//   └──┘ └──┘ └──┘ └──┘
//
// Right-middle = 20 - 13 = 7;  7 = 3 + apple  →  apple = 4  (answer B).
// The static figure shows ONLY the givens — never the right box, the empty bottom
// box, or the apple's value.

const FILL = '#E3EFDD' // pale green box fill (matches the scan)
const STROKE = '#6E8C63' // muted green outline
const INK = '#1F2937'
const APPLE_RED = '#E23B33'
const APPLE_STEM = '#6B4A2B'

export const BOX_W = 86
export const BOX_H = 70
const RX = 4

/** A pyramid cell: filled rounded square holding a number, an apple, or nothing. */
export function PyramidBox({
  x,
  y,
  value,
  apple = false,
  highlight = false,
}: {
  x: number
  y: number
  value?: number | string | null
  apple?: boolean
  highlight?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={BOX_W}
        height={BOX_H}
        rx={RX}
        fill={FILL}
        stroke={highlight ? '#2f6df0' : STROKE}
        strokeWidth={highlight ? 4 : 2}
      />
      {apple ? (
        <Apple cx={x + BOX_W / 2} cy={y + BOX_H / 2 + 4} r={16} />
      ) : value != null && value !== '' ? (
        <text
          x={x + BOX_W / 2}
          y={y + BOX_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={30}
          fontWeight={700}
          fontFamily="ui-monospace, 'Courier New', monospace"
          fill={INK}
        >
          {value}
        </text>
      ) : null}
    </g>
  )
}

/** A small glossy apple (single shape, deterministic). */
export function Apple({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <path
        d={`M ${cx} ${cy - r * 0.5} C ${cx + r * 0.2} ${cy - r * 0.95} ${cx + r * 0.3} ${cy - r * 1.2} ${cx + r * 0.5} ${cy - r * 1.3}`}
        fill="none"
        stroke={APPLE_STEM}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle cx={cx - r * 0.45} cy={cy} r={r * 0.62} fill={APPLE_RED} />
      <circle cx={cx + r * 0.45} cy={cy} r={r * 0.62} fill={APPLE_RED} />
      <ellipse cx={cx} cy={cy + r * 0.1} rx={r * 0.78} ry={r * 0.7} fill={APPLE_RED} />
      <ellipse cx={cx - r * 0.25} cy={cy - r * 0.25} rx={r * 0.22} ry={r * 0.14} fill="#FFFFFF" opacity={0.6} />
    </g>
  )
}

export const VIEW_W = 560
export const VIEW_H = 360

// Box top-left coordinates (centred pyramid, generous headroom).
const TOP = { x: 237, y: 18 } // 20
const MID_L = { x: 150, y: 128 } // 13
const MID_R = { x: 324, y: 128 } // ?
const BOT = [
  { x: 28, y: 250 }, // 8
  { x: 150, y: 250 }, // empty
  { x: 280, y: 250 }, // 3
  { x: 402, y: 250 }, // apple
]

function cx(b: { x: number }) {
  return b.x + BOX_W / 2
}

export interface PyramidFigureProps {
  /** Reveal the right-middle box value (7) once derived. */
  showRightMid?: boolean
  /** Replace the apple with its value (4) — explainer only, never the static figure. */
  revealApple?: boolean
  /** Highlight set: 'top' | 'midL' | 'midR' | 'three' | 'apple'. */
  highlight?: 'top' | 'midL' | 'midR' | 'three' | 'apple' | null
}

export function PyramidFigure({ showRightMid = false, revealApple = false, highlight = null }: PyramidFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* connector lines (each box to its two children) */}
      <g stroke={STROKE} strokeWidth={1.6}>
        <line x1={cx(TOP)} y1={TOP.y + BOX_H} x2={cx(MID_L)} y2={MID_L.y} />
        <line x1={cx(TOP)} y1={TOP.y + BOX_H} x2={cx(MID_R)} y2={MID_R.y} />
        <line x1={cx(MID_L)} y1={MID_L.y + BOX_H} x2={cx(BOT[0])} y2={BOT[0].y} />
        <line x1={cx(MID_L)} y1={MID_L.y + BOX_H} x2={cx(BOT[1])} y2={BOT[1].y} />
        <line x1={cx(MID_R)} y1={MID_R.y + BOX_H} x2={cx(BOT[2])} y2={BOT[2].y} />
        <line x1={cx(MID_R)} y1={MID_R.y + BOX_H} x2={cx(BOT[3])} y2={BOT[3].y} />
      </g>

      <PyramidBox x={TOP.x} y={TOP.y} value={20} highlight={highlight === 'top'} />
      <PyramidBox x={MID_L.x} y={MID_L.y} value={13} highlight={highlight === 'midL'} />
      <PyramidBox x={MID_R.x} y={MID_R.y} value={showRightMid ? 7 : ''} highlight={highlight === 'midR'} />

      <PyramidBox x={BOT[0].x} y={BOT[0].y} value={8} />
      <PyramidBox x={BOT[1].x} y={BOT[1].y} value="" />
      <PyramidBox x={BOT[2].x} y={BOT[2].y} value={3} highlight={highlight === 'three'} />
      {revealApple ? (
        <PyramidBox x={BOT[3].x} y={BOT[3].y} value={4} highlight={highlight === 'apple'} />
      ) : (
        <PyramidBox x={BOT[3].x} y={BOT[3].y} apple highlight={highlight === 'apple'} />
      )}
    </svg>
  )
}

export default function P24G1Q13Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A number pyramid. Top box 20. Middle row: 13 and an empty box. Bottom row: 8, an empty box, 3 and an apple. Each box equals the sum of the two boxes below it."
    >
      <PyramidFigure />
    </div>
  )
}
