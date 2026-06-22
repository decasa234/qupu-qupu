// Sticks16ECExplainer — IKMC-20-EC-Q16
//
// Animated explainer for the stick-combination square problem.
//
// Layout (two panels, side by side):
//   LEFT  — option table: labels A–E with stick counts and ÷4 check.
//            The current option being checked is spotlit; wrong ones dim out.
//   RIGHT — assembled 3 cm square showing how sticks are placed (beat 6–7).
//
// Reuses StickBar from Sticks16ECIllustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StickBar, SHORT_L, LONG_L, STICK_COLOR } from './Sticks16ECIllustration'
import { buildSticks16ECSteps, OPTIONS } from './sticks16ECSteps'

// ── Design tokens ──────────────────────────────────────────────────────────────

const GREEN  = '#10B981'
const RED    = '#EF4444'
const BLUE   = '#30598A'
const AMBER  = '#F59E0B'

// ── Option table (left panel) ──────────────────────────────────────────────────

const TABLE_W = 200
const TABLE_H = 160
const ROW_H   = TABLE_H / 5   // 32 px per row

function OptionTable({
  checkIndex,
  answerIndex,
}: {
  checkIndex: number
  answerIndex: number
}) {
  return (
    <svg
      viewBox={`0 0 ${TABLE_W} ${TABLE_H}`}
      width={TABLE_W}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {OPTIONS.map((opt, i) => {
        const y = i * ROW_H
        const midY = y + ROW_H / 2

        // Spotlit = currently being checked
        const active    = i === checkIndex
        // Accepted = final answer
        const accepted  = i === answerIndex
        // Already processed (before current)
        const processed = checkIndex >= 0 && i < checkIndex

        let bgFill = 'none'
        if (accepted)   bgFill = '#D1FAE5'
        else if (active) bgFill = '#E1EFFB'

        let tickSymbol = ''
        let tickFill   = '#6B7280'
        if (accepted)           { tickSymbol = '✓'; tickFill = GREEN }
        else if (processed)     { tickSymbol = opt.divisible ? '✓' : '✗'; tickFill = opt.divisible ? GREEN : RED }
        else if (active)        { tickSymbol = opt.divisible ? '✓' : '✗'; tickFill = opt.divisible ? GREEN : RED }

        const labelFill = active || accepted ? '#1F2937' : processed ? '#6B7280' : '#9CA3AF'
        const opacity   = active || accepted ? 1 : processed ? 0.7 : 0.5

        return (
          <g key={opt.label} opacity={opacity}>
            {bgFill !== 'none' && (
              <rect x={2} y={y + 2} width={TABLE_W - 4} height={ROW_H - 4} rx={6} fill={bgFill} />
            )}
            {/* label */}
            <text x={14} y={midY} dominantBaseline="central" fontSize={12} fontWeight={800} fill={labelFill}>
              {opt.label}
            </text>
            {/* stick counts */}
            <text x={30} y={midY} dominantBaseline="central" fontSize={11} fill={labelFill}>
              {opt.short > 0 && opt.long > 0
                ? `${opt.short}×1 + ${opt.long}×3 = ${opt.total}`
                : opt.short > 0
                  ? `${opt.short}×1 = ${opt.total}`
                  : `${opt.long}×3 = ${opt.total}`
              }
            </text>
            {/* side label */}
            <text x={TABLE_W - 24} y={midY} dominantBaseline="central" textAnchor="end" fontSize={11} fontWeight={700} fill={labelFill}>
              ÷4={opt.sideStr}
            </text>
            {/* tick */}
            {tickSymbol && (
              <text x={TABLE_W - 10} y={midY} dominantBaseline="central" textAnchor="middle" fontSize={14} fontWeight={900} fill={tickFill}>
                {tickSymbol}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Assembled square (right panel) ────────────────────────────────────────────
// Square with side = LONG_L (= 90 px = 3 cm).
// Three sides: single long stick each. One side (top): three short sticks end-to-end.
// Short stick: SHORT_L = 30 px = 1 cm.

const SQ_W = 130
const SQ_H = 130
// Top-left corner of the square inside the SVG
const SQ_X0 = (SQ_W - LONG_L) / 2   // = 20
const SQ_Y0 = (SQ_H - LONG_L) / 2   // = 20
const SQ_X1 = SQ_X0 + LONG_L
const SQ_Y1 = SQ_Y0 + LONG_L

function AssembledSquare() {
  // Three sides as single long sticks (horizontal/vertical)
  // Bottom side: one long (horizontal)
  // Left side:   one long (vertical)
  // Right side:  one long (vertical)
  // Top side:    three short sticks end-to-end (horizontal)

  const shortOffsets = [0, SHORT_L, SHORT_L * 2]

  return (
    <svg
      viewBox={`0 0 ${SQ_W} ${SQ_H}`}
      width={SQ_W}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* label */}
      <text x={SQ_W / 2} y={10} textAnchor="middle" fontSize={9} fontWeight={700} fill="#6B7280">
        side = 3 cm
      </text>

      {/* bottom side — one long stick */}
      <StickBar cx={(SQ_X0 + SQ_X1) / 2} cy={SQ_Y1} length={LONG_L} angleDeg={0} color={STICK_COLOR} strokeWidth={3.5} />

      {/* left side — one long stick (vertical) */}
      <StickBar cx={SQ_X0} cy={(SQ_Y0 + SQ_Y1) / 2} length={LONG_L} angleDeg={90} color={STICK_COLOR} strokeWidth={3.5} />

      {/* right side — one long stick (vertical) */}
      <StickBar cx={SQ_X1} cy={(SQ_Y0 + SQ_Y1) / 2} length={LONG_L} angleDeg={90} color={STICK_COLOR} strokeWidth={3.5} />

      {/* top side — three short sticks */}
      {shortOffsets.map((dx, i) => (
        <StickBar
          key={i}
          cx={SQ_X0 + dx + SHORT_L / 2}
          cy={SQ_Y0}
          length={SHORT_L}
          angleDeg={0}
          color={AMBER}
          strokeWidth={3.5}
        />
      ))}

      {/* corner dots */}
      {[[SQ_X0, SQ_Y0], [SQ_X1, SQ_Y0], [SQ_X0, SQ_Y1], [SQ_X1, SQ_Y1]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#1F2937" />
      ))}

      {/* "3×1 cm" annotation over top side */}
      <text x={(SQ_X0 + SQ_X1) / 2} y={SQ_Y0 - 7} textAnchor="middle" fontSize={9} fontWeight={700} fill={AMBER}>
        3×1 cm
      </text>
      {/* "3 cm" annotation for one of the long sides */}
      <text x={SQ_X1 + 10} y={(SQ_Y0 + SQ_Y1) / 2} textAnchor="start" dominantBaseline="central" fontSize={9} fontWeight={700} fill={STICK_COLOR}>
        3 cm
      </text>
    </svg>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Sticks16ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSticks16ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult     = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: A=11 ✗, B=12 ÷4=3 ✓, C=6 ✗, D=10 ✗, E=18 ✗ — jawaban B: 3 pendek + 3 panjang membentuk persegi sisi 3 cm.'
      : 'Explainer: A=11 ✗, B=12 ÷4=3 ✓, C=6 ✗, D=10 ✗, E=18 ✗ — answer B: 3 short + 3 long makes a square with side 3 cm.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* panels row */}
        <div className="flex items-center justify-center gap-4">
          <OptionTable checkIndex={beat.checkIndex} answerIndex={beat.answerIndex} />
          {beat.showSquare && <AssembledSquare />}
        </div>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
