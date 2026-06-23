// SEAMO-17-A-Q21 — "There are 14 children in a party. Each boy gets 2 balloons.
// Each girl gets 3 balloons. 36 balloons are given out in all.
// How many girls are there at the party?"  Answer: 8.
//
// SOURCE FIGURE (2017.imgs/024.jpg): decorative cartoon of 5 children each
// holding one balloon.  The illustration here renders the *mathematical*
// content: one boy with 2 balloons and one girl with 3 balloons, with totals
// below, so the constraint is immediately visible.
//
// Classification: stem figure (word-problem context, no picture-options).
//
// Primitives used: Balloon (from ./primitives/glyphs).
//
// Bound quantities from breakdown.quantities:
//   boys_balloons  = 2
//   girls_balloons = 3
//   total_children = 14
//   total_balloons = 36
//
// Pure SVG render — no Math.random, no Date, no window/document.  SSR-safe.

import { Balloon } from './primitives/glyphs'

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  BOY:        '#4A90D9',   // blue balloon
  BOY2:       '#2563EB',   // second boy balloon (darker shade)
  GIRL:       '#F472B6',   // pink balloon
  GIRL2:      '#A855F7',   // second girl balloon (purple)
  GIRL3:      '#FBBF24',   // third girl balloon (amber)
  FIGURE:     '#341857',   // figure body / text
  LABEL_BG:   '#FFF9F4',
  LABEL_BORD: '#FFD3B1',
  TEXT_DARK:  '#1F2937',
  BOX_FILL:   '#F0FDF4',
  BOX_BORD:   '#86EFAC',
} as const

const SVG_W = 320
const SVG_H = 210

// ── Stick-figure person ─────────────────────────────────────────────────────
/** Simple gender-neutral stick person at (cx, cy=feet). */
function Person({ cx, cy, color = C.FIGURE }: { cx: number; cy: number; color?: string }) {
  const headR = 10
  const bodyTop = cy - 44
  const bodyBot = cy - 14
  return (
    <g>
      {/* head */}
      <circle cx={cx} cy={bodyTop - headR} r={headR} fill={color} />
      {/* body */}
      <line x1={cx} y1={bodyTop} x2={cx} y2={bodyBot} stroke={color} strokeWidth={3} strokeLinecap="round" />
      {/* arms */}
      <line x1={cx - 12} y1={bodyTop + 8} x2={cx + 12} y2={bodyTop + 8} stroke={color} strokeWidth={3} strokeLinecap="round" />
      {/* legs */}
      <line x1={cx} y1={bodyBot} x2={cx - 8} y2={cy} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx} y1={bodyBot} x2={cx + 8} y2={cy} stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

// ── Main illustration ───────────────────────────────────────────────────────

/**
 * PartyBalloons17A21Illustration
 *
 * Shows a boy holding 2 balloons on the left and a girl holding 3 balloons
 * on the right, with labels for the balloon counts.  The totals
 * (14 children, 36 balloons) appear in a summary box at the bottom.
 */
export default function PartyBalloons17A21Illustration({ lang = 'id' }: { lang?: string }) {
  const isId = lang !== 'en'

  // Labels
  const boyLabel   = isId ? 'Anak laki-laki' : 'Boy'
  const girlLabel  = isId ? 'Anak perempuan' : 'Girl'
  const balLabel   = (n: number) => isId ? `${n} balon` : `${n} balloons`
  const totalLine  = isId ? '14 anak, 36 balon total' : '14 children, 36 balloons total'

  const ariaLabel = isId
    ? 'Satu anak laki-laki memegang 2 balon; satu anak perempuan memegang 3 balon. Total: 14 anak, 36 balon.'
    : 'One boy holds 2 balloons; one girl holds 3 balloons. Total: 14 children, 36 balloons.'

  // Positions
  const BOY_X  = 80
  const GIRL_X = 230
  const FEET_Y = 175
  const BAL_Y  = 45   // balloon vertical centre

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── BOY: 2 balloons ─────────────────────────────────────── */}
        <Balloon cx={BOY_X - 16} cy={BAL_Y} r={16} color={C.BOY} />
        <Balloon cx={BOY_X + 16} cy={BAL_Y} r={16} color={C.BOY2} />
        <Person  cx={BOY_X}      cy={FEET_Y} color="#2563EB" />

        {/* boy name + balloon count */}
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
          x={BOY_X - 24}
          y={BAL_Y + 28}
          width={48}
          height={18}
          rx={6}
          fill={C.LABEL_BG}
          stroke={C.LABEL_BORD}
          strokeWidth={1.5}
        />
        <text
          x={BOY_X}
          y={BAL_Y + 41}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#1D4ED8"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {balLabel(2)}
        </text>

        {/* divider */}
        <line x1={158} y1={20} x2={158} y2={185} stroke="#E5E7EB" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* ── GIRL: 3 balloons ────────────────────────────────────── */}
        <Balloon cx={GIRL_X - 24} cy={BAL_Y}      r={16} color={C.GIRL} />
        <Balloon cx={GIRL_X}      cy={BAL_Y - 8}  r={16} color={C.GIRL2} />
        <Balloon cx={GIRL_X + 24} cy={BAL_Y}      r={16} color={C.GIRL3} />
        <Person  cx={GIRL_X}      cy={FEET_Y}      color="#BE185D" />

        {/* girl name + balloon count */}
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
          x={GIRL_X - 24}
          y={BAL_Y + 28}
          width={48}
          height={18}
          rx={6}
          fill={C.LABEL_BG}
          stroke={C.LABEL_BORD}
          strokeWidth={1.5}
        />
        <text
          x={GIRL_X}
          y={BAL_Y + 41}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#9333EA"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {balLabel(3)}
        </text>

        {/* ── Summary box ─────────────────────────────────────────── */}
        <rect
          x={60}
          y={190}
          width={200}
          height={16}
          rx={6}
          fill={C.BOX_FILL}
          stroke={C.BOX_BORD}
          strokeWidth={1.5}
        />
        <text
          x={160}
          y={201}
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
