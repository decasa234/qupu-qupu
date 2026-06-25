// SEAMOX-24-A-Q9 — "There are 11 girls and boys at a birthday party.
// Each boy gets 2 balloons, each girl gets 4 balloons. Altogether 34 balloons
// are given away. How many girls are at the party?"  Answer: 6.
//
// SOURCE FIGURE (2024.imgs/008.jpg): decorative clipart of a boy holding 2
// balloons (left) and a girl holding 4 balloons (right).
// The illustration renders the mathematical content: a boy with 2 balloons and
// a girl with 4 balloons, with problem totals in a summary box below.
//
// Classification: stem figure (word-problem context, no picture-options).
// Primitives used: Balloon (from ./primitives/glyphs).
// Copy-adapted from PartyBalloons21A8Illustration (same balloon+person structure).
//
// Bound quantities from breakdown.quantities:
//   total_children  = 11
//   total_balloons  = 34
//   boys_balloons   = 2
//   girls_balloons  = 4
//   girls_answer    = 6 (NOT shown in stem — problem only)
//
// Pure SVG render — no Math.random, no Date, no window/document. SSR-safe.

import { Balloon } from './primitives/glyphs'

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  BOY:        '#4A90D9',   // blue balloon
  BOY2:       '#2563EB',   // deeper blue balloon
  GIRL:       '#F472B6',   // pink balloon
  GIRL2:      '#A855F7',   // purple balloon
  GIRL3:      '#FBBF24',   // amber balloon
  GIRL4:      '#EF4444',   // red balloon
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
  const headR  = 10
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

// ── Props ───────────────────────────────────────────────────────────────────

export interface BirthdayBalloonsX24A9Props {
  /**
   * Explainer beat phase — highlights the relevant part of the figure.
   * `null` (default) = all neutral (used by the stem illustration).
   */
  phase?: 'allSame' | 'extra' | 'girls' | null
  lang?: string
}

// ── Core component (exported for the explainer) ──────────────────────────────

export function BirthdayBalloonsX24A9({ phase = null, lang = 'en' }: BirthdayBalloonsX24A9Props) {
  const isId = lang !== 'en'

  const girlLabel = isId ? 'Anak perempuan' : 'Girl'
  const boyLabel  = isId ? 'Anak laki-laki' : 'Boy'
  const balLabel  = (n: number) => isId ? `${n} balon` : `${n} balloons`
  const totalLine = isId ? '11 anak, 34 balon total' : '11 children, 34 balloons total'

  const BOY_X  = 85
  const GIRL_X = 255
  const FEET_Y = 175
  const BAL_Y  = 42

  // Badge highlight colours
  const boyBadgeFill   = phase === 'allSame' ? '#DBEAFE' : C.LABEL_BG
  const boyBadgeBord   = phase === 'allSame' ? '#3B82F6' : C.LABEL_BORD
  const girlBadgeFill  = (phase === 'extra' || phase === 'girls') ? '#FDF2F8' : C.LABEL_BG
  const girlBadgeBord  = (phase === 'extra' || phase === 'girls') ? '#EC4899' : C.LABEL_BORD

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(380, SVG_W)}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* ── BOY: 2 balloons (left) ──────────────────────────────────── */}
      <Balloon cx={BOY_X - 12} cy={BAL_Y}      r={15} color={C.BOY}  />
      <Balloon cx={BOY_X + 12} cy={BAL_Y - 8}  r={15} color={C.BOY2} />
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
      {/* boy balloon count badge */}
      <rect
        x={BOY_X - 26}
        y={BAL_Y + 24}
        width={52}
        height={18}
        rx={6}
        fill={boyBadgeFill}
        stroke={boyBadgeBord}
        strokeWidth={1.5}
      />
      <text
        x={BOY_X}
        y={BAL_Y + 37}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#1D4ED8"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {balLabel(2)}
      </text>

      {/* divider */}
      <line x1={168} y1={20} x2={168} y2={190} stroke="#E5E7EB" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* ── GIRL: 4 balloons (right) ────────────────────────────────── */}
      <Balloon cx={GIRL_X - 22} cy={BAL_Y + 4}  r={13} color={C.GIRL}  />
      <Balloon cx={GIRL_X - 7}  cy={BAL_Y - 8}  r={13} color={C.GIRL2} />
      <Balloon cx={GIRL_X + 7}  cy={BAL_Y - 8}  r={13} color={C.GIRL3} />
      <Balloon cx={GIRL_X + 22} cy={BAL_Y + 4}  r={13} color={C.GIRL4} />
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
      {/* girl balloon count badge */}
      <rect
        x={GIRL_X - 26}
        y={BAL_Y + 24}
        width={52}
        height={18}
        rx={6}
        fill={girlBadgeFill}
        stroke={girlBadgeBord}
        strokeWidth={1.5}
      />
      <text
        x={GIRL_X}
        y={BAL_Y + 37}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#9333EA"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {balLabel(4)}
      </text>

      {/* ── Summary box ──────────────────────────────────────────────── */}
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
  )
}

// ── Default export: full stem illustration ────────────────────────────────────

export default function BirthdayBalloonsX24A9Illustration({ lang = 'en' }: { lang?: string }) {
  const ariaLabel = lang !== 'en'
    ? 'Satu anak laki-laki memegang 2 balon; satu anak perempuan memegang 4 balon. Total: 11 anak, 34 balon.'
    : 'One boy holds 2 balloons; one girl holds 4 balloons. Total: 11 children, 34 balloons.'
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <BirthdayBalloonsX24A9 lang={lang} />
    </div>
  )
}
