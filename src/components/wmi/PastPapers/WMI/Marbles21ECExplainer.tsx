// IKMC-23-EC-Q21 — post-answer animation.
// Reuses the Marble primitive and MarbleField from Marbles21ECIllustration so
// the animation reads as the static scene coming alive.
//
// Beats:
//   0. intro    — all 18 marbles static; state the givens.
//   1. brenda   — highlight Brenda's 9 marbles (3 red, 6 blue) in a tinted panel.
//   2. subtract — show Adam's blue count: total 10 − Brenda's 6 = 4.
//   3. check    — verify the arithmetic.
//   4. result   — 4 blue → answer B (green).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  Marble,
  MarbleField,
  MARBLES,
  SVG_W,
  SVG_H,
  RED_STROKE,
  BLUE_STROKE,
  BOX_FILL,
  BOX_STROKE,
} from './Marbles21ECIllustration'
import { buildMarbles21ECSteps } from './marbles21ECSteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const ACCENT = '#30598A'
const ORANGE = '#F0853A'

// ── Brenda panel layout ───────────────────────────────────────────────────────
// We show Brenda's 9 marbles in a compact 2-row grid inside a labelled panel
// overlaid at the bottom of the SVG — separate from Adam's marbles above.

const BRENDA_PANEL_Y  = SVG_H - 60
const BRENDA_PANEL_H  = 52
const BRENDA_PANEL_X  = 8
const BRENDA_PANEL_W  = SVG_W - 16

// Brenda: 3 red + 6 blue, row of 9
const B_R = 10  // smaller radius inside the panel
const B_SPACING = B_R * 2 + 4
const B_START_X = BRENDA_PANEL_X + 14
const B_ROW_Y   = BRENDA_PANEL_Y + BRENDA_PANEL_H / 2

const BRENDA_MARBLES = [
  // 3 red
  { cx: B_START_X + 0 * B_SPACING, cy: B_ROW_Y, colour: 'red' as const },
  { cx: B_START_X + 1 * B_SPACING, cy: B_ROW_Y, colour: 'red' as const },
  { cx: B_START_X + 2 * B_SPACING, cy: B_ROW_Y, colour: 'red' as const },
  // 6 blue
  { cx: B_START_X + 3 * B_SPACING, cy: B_ROW_Y, colour: 'blue' as const },
  { cx: B_START_X + 4 * B_SPACING, cy: B_ROW_Y, colour: 'blue' as const },
  { cx: B_START_X + 5 * B_SPACING, cy: B_ROW_Y, colour: 'blue' as const },
  { cx: B_START_X + 6 * B_SPACING, cy: B_ROW_Y, colour: 'blue' as const },
  { cx: B_START_X + 7 * B_SPACING, cy: B_ROW_Y, colour: 'blue' as const },
  { cx: B_START_X + 8 * B_SPACING, cy: B_ROW_Y, colour: 'blue' as const },
]

// ── Adam blue count panel ─────────────────────────────────────────────────────
// Four blue marbles in a row, right side
const ADAM_PANEL_X = BRENDA_PANEL_X + BRENDA_PANEL_W / 2 + 4
const ADAM_PANEL_W = BRENDA_PANEL_W / 2 - 4
const ADAM_PANEL_Y = BRENDA_PANEL_Y
const ADAM_PANEL_H = BRENDA_PANEL_H

const A_START_X = ADAM_PANEL_X + 14
const ADAM_BLUE_MARBLES = [0, 1, 2, 3].map((i) => ({
  cx: A_START_X + i * (B_R * 2 + 4),
  cy: ADAM_PANEL_Y + ADAM_PANEL_H / 2,
  colour: 'blue' as const,
}))

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Marbles21ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildMarbles21ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: ACCENT, color: ACCENT    }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Brenda punya 3 merah + 6 biru = 9. Total biru = 10. Adam punya 10 − 6 = 4 biru — jawaban B.'
      : 'Explainer: Brenda has 3 red + 6 blue = 9. Total blue = 10. Adam has 10 − 6 = 4 blue — answer B.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          style={{ display: 'block', maxWidth: '100%' }}
          aria-hidden="true"
        >
          {/* background box */}
          <rect x={4} y={4} width={SVG_W - 8} height={SVG_H - 8} rx={10}
            fill={BOX_FILL} stroke={BOX_STROKE} strokeWidth={2} />

          {/* upper marbles area — slightly dimmed when Brenda panel is shown */}
          <g opacity={beat.showBrenda ? 0.3 : 1}>
            <MarbleField marbles={MARBLES} />
          </g>

          {/* Brenda panel: appear on beat 1 */}
          <AnimatePresence>
            {beat.showBrenda && !beat.showSubtract && (
              <motion.g
                key="brenda-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                {/* panel background */}
                <rect
                  x={BRENDA_PANEL_X} y={BRENDA_PANEL_Y}
                  width={BRENDA_PANEL_W} height={BRENDA_PANEL_H}
                  rx={8}
                  fill="#EFF6FF"
                  stroke={ACCENT}
                  strokeWidth={1.5}
                  opacity={0.95}
                />
                {/* panel label */}
                <text
                  x={BRENDA_PANEL_X + BRENDA_PANEL_W - 8}
                  y={BRENDA_PANEL_Y + 10}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={700}
                  fill={ACCENT}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  Brenda
                </text>
                {/* 3 red + 6 blue */}
                {BRENDA_MARBLES.map((m, i) => (
                  <Marble key={i} {...m} />
                ))}
                {/* brace annotation: red = 3, blue = 6 */}
                <text
                  x={B_START_X + 1 * B_SPACING}
                  y={BRENDA_PANEL_Y + BRENDA_PANEL_H - 5}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontSize={9}
                  fontWeight={700}
                  fill={RED_STROKE}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  3
                </text>
                <text
                  x={B_START_X + 5.5 * B_SPACING}
                  y={BRENDA_PANEL_Y + BRENDA_PANEL_H - 5}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontSize={9}
                  fontWeight={700}
                  fill={BLUE_STROKE}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  6
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Split into Brenda + Adam panels on beat 2+ */}
          <AnimatePresence>
            {beat.showSubtract && (
              <motion.g
                key="split-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                {/* Brenda left panel (smaller) */}
                <rect
                  x={BRENDA_PANEL_X} y={BRENDA_PANEL_Y}
                  width={BRENDA_PANEL_W / 2 - 4} height={BRENDA_PANEL_H}
                  rx={8}
                  fill="#EFF6FF"
                  stroke={ACCENT}
                  strokeWidth={1.5}
                  opacity={0.9}
                />
                <text
                  x={BRENDA_PANEL_X + 6}
                  y={BRENDA_PANEL_Y + 10}
                  textAnchor="start"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={700}
                  fill={ACCENT}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  Brenda: 3🔴 6🔵
                </text>

                {/* Adam right panel */}
                <rect
                  x={ADAM_PANEL_X} y={ADAM_PANEL_Y}
                  width={ADAM_PANEL_W} height={ADAM_PANEL_H}
                  rx={8}
                  fill={isResult ? '#D1FAE5' : '#FFF7ED'}
                  stroke={isResult ? GREEN : ORANGE}
                  strokeWidth={1.5}
                  opacity={0.95}
                />
                <text
                  x={ADAM_PANEL_X + 6}
                  y={ADAM_PANEL_Y + 10}
                  textAnchor="start"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={700}
                  fill={isResult ? '#065F46' : '#92400E'}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  Adam
                </text>
                {/* Adam's 4 blue marbles */}
                {ADAM_BLUE_MARBLES.map((m, i) => (
                  <Marble key={i} {...m} />
                ))}
                {/* label "4 blue" */}
                <text
                  x={ADAM_PANEL_X + ADAM_PANEL_W / 2}
                  y={ADAM_PANEL_Y + ADAM_PANEL_H - 5}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontSize={9}
                  fontWeight={700}
                  fill={BLUE_STROKE}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  4
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* check tick — beat 3 */}
          <AnimatePresence>
            {beat.showCheck && (
              <motion.g
                key="check-tick"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <text
                  x={SVG_W / 2}
                  y={BRENDA_PANEL_Y - 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={900}
                  fill={GREEN}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lang === 'id' ? '5+3=8 ✓  4+5=9 ✓' : '5+3=8 ✓  4+5=9 ✓'}
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : ACCENT }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
