// SEAMO-21-A-Q8 — "There are 18 children in a party. Each girl gets 5 balloons,
// while each boy gets 3 balloons. If 72 balloons are given out in all, how many
// boys are there?"  Answer: 9 (choice D).
//
// SOURCE FIGURE (2021.imgs/014.jpg): decorative photo of colourful balloon bunch.
// The illustration here renders the *mathematical* content: one girl with 5
// balloons and one boy with 3 balloons, with totals below, so the constraint is
// immediately visible.
//
// Classification: stem figure (word-problem context, no picture-options).
//
// Primitives used: Balloon (from ./primitives/glyphs).
//
// Bound quantities from breakdown.quantities:
//   total_children = 18
//   total_balloons = 72
//   girls_balloons = 5
//   boys_balloons  = 3
//   boys_answer    = 9
//
// Pure SVG render — no Math.random, no Date, no window/document.  SSR-safe.

import { Balloon } from './primitives/glyphs'

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  BOY:        '#4A90D9',   // blue balloon
  BOY2:       '#2563EB',   // second boy balloon
  BOY3:       '#60A5FA',   // third boy balloon
  GIRL:       '#F472B6',   // pink balloon
  GIRL2:      '#A855F7',   // purple balloon
  GIRL3:      '#FBBF24',   // amber balloon
  GIRL4:      '#EF4444',   // red balloon
  GIRL5:      '#10B981',   // green balloon
  FIGURE:     '#341857',
  LABEL_BG:   '#FFF9F4',
  LABEL_BORD: '#FFD3B1',
  TEXT_DARK:  '#1F2937',
  BOX_FILL:   '#F0FDF4',
  BOX_BORD:   '#86EFAC',
} as const

const SVG_W = 340
const SVG_H = 215

// ── Stick-figure person ─────────────────────────────────────────────────────
function Person({ cx, cy, color = C.FIGURE }: { cx: number; cy: number; color?: string }) {
  const headR = 10
  const bodyTop = cy - 44
  const bodyBot = cy - 14
  return (
    <g>
      <circle cx={cx} cy={bodyTop - headR} r={headR} fill={color} />
      <line x1={cx} y1={bodyTop} x2={cx} y2={bodyBot} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx - 12} y1={bodyTop + 8} x2={cx + 12} y2={bodyTop + 8} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx} y1={bodyBot} x2={cx - 8} y2={cy} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx} y1={bodyBot} x2={cx + 8} y2={cy} stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

// ── Main illustration ───────────────────────────────────────────────────────

/**
 * PartyBalloons21A8Illustration
 *
 * Shows a girl holding 5 balloons on the left and a boy holding 3 balloons
 * on the right, with labels for the balloon counts.  The totals
 * (18 children, 72 balloons) appear in a summary box at the bottom.
 */
export default function PartyBalloons21A8Illustration({ lang = 'id' }: { lang?: string }) {
  const isId = lang !== 'en'

  const girlLabel = isId ? 'Anak perempuan' : 'Girl'
  const boyLabel  = isId ? 'Anak laki-laki' : 'Boy'
  const balLabel  = (n: number) => isId ? `${n} balon` : `${n} balloons`
  const totalLine = isId ? '18 anak, 72 balon total' : '18 children, 72 balloons total'

  const ariaLabel = isId
    ? 'Satu anak perempuan memegang 5 balon; satu anak laki-laki memegang 3 balon. Total: 18 anak, 72 balon.'
    : 'One girl holds 5 balloons; one boy holds 3 balloons. Total: 18 children, 72 balloons.'

  // Positions
  const GIRL_X = 85
  const BOY_X  = 255
  const FEET_Y = 175
  const BAL_Y  = 42   // balloon vertical centre

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(380, SVG_W)}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── GIRL: 5 balloons ─────────────────────────────────────── */}
        {/* fan of 5 balloons above the girl */}
        <Balloon cx={GIRL_X - 32} cy={BAL_Y + 4}  r={14} color={C.GIRL}  />
        <Balloon cx={GIRL_X - 14} cy={BAL_Y - 8}  r={14} color={C.GIRL2} />
        <Balloon cx={GIRL_X}      cy={BAL_Y - 16}  r={14} color={C.GIRL3} />
        <Balloon cx={GIRL_X + 14} cy={BAL_Y - 8}  r={14} color={C.GIRL4} />
        <Balloon cx={GIRL_X + 32} cy={BAL_Y + 4}  r={14} color={C.GIRL5} />
        <Person cx={GIRL_X} cy={FEET_Y} color="#BE185D" />

        {/* girl label */}
        <text
          x={GIRL_X}
          y={FEET_Y + 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={C.TEXT_DARK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {girlLabel}
        </text>
        {/* balloon count badge */}
        <rect
          x={GIRL_X - 26}
          y={BAL_Y + 22}
          width={52}
          height={18}
          rx={6}
          fill={C.LABEL_BG}
          stroke={C.LABEL_BORD}
          strokeWidth={1.5}
        />
        <text
          x={GIRL_X}
          y={BAL_Y + 35}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#9333EA"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {balLabel(5)}
        </text>

        {/* divider */}
        <line x1={168} y1={20} x2={168} y2={190} stroke="#E5E7EB" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* ── BOY: 3 balloons ──────────────────────────────────────── */}
        <Balloon cx={BOY_X - 20} cy={BAL_Y}      r={15} color={C.BOY}  />
        <Balloon cx={BOY_X}      cy={BAL_Y - 10}  r={15} color={C.BOY2} />
        <Balloon cx={BOY_X + 20} cy={BAL_Y}      r={15} color={C.BOY3} />
        <Person cx={BOY_X} cy={FEET_Y} color="#2563EB" />

        {/* boy label */}
        <text
          x={BOY_X}
          y={FEET_Y + 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={C.TEXT_DARK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {boyLabel}
        </text>
        {/* balloon count badge */}
        <rect
          x={BOY_X - 26}
          y={BAL_Y + 22}
          width={52}
          height={18}
          rx={6}
          fill={C.LABEL_BG}
          stroke={C.LABEL_BORD}
          strokeWidth={1.5}
        />
        <text
          x={BOY_X}
          y={BAL_Y + 35}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#1D4ED8"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {balLabel(3)}
        </text>

        {/* ── Summary box ─────────────────────────────────────────── */}
        <rect
          x={60}
          y={193}
          width={220}
          height={16}
          rx={6}
          fill={C.BOX_FILL}
          stroke={C.BOX_BORD}
          strokeWidth={1.5}
        />
        <text
          x={170}
          y={204}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#15803D"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {totalLine}
        </text>
      </svg>
    </div>
  )
}
