import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  COLORED,
  ColorGrid10PE,
} from './ColorGrid10PEIllustration'
import {
  EXTRA_CELLS,
  buildColorGrid10PESteps,
} from './colorGrid10PESteps'

// IKMC-23-PE-Q10 — post-answer animation.
// Reuses ColorGrid10PE from the illustration so the animation reads as the
// static scene coming alive.
//
// Animation beats:
//   0. intro   — static grid; state the problem.
//   1. half    — half of 24 = 12 is the target.
//   2. count   — highlight the 9 already-coloured squares.
//   3. diff    — 12 − 9 = 3; show 3 extra squares added.
//   4. result  — "3 → C" (green).

// ── colour tokens ──────────────────────────────────────────────────────────────
const GREEN       = '#10B981'
const PURPLE_DARK = '#4B40A0'   // caption accent

// ── Main explainer component ───────────────────────────────────────────────────

export default function ColorGrid10PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildColorGrid10PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EDE9FE', borderColor: PURPLE_DARK, color: PURPLE_DARK }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Setengah dari 24 adalah 12. Sudah ada 9 kotak berwarna. Diperlukan 12 − 9 = 3 kotak lagi — jawaban C.'
      : 'Explainer: Half of 24 is 12. There are already 9 coloured squares. 12 − 9 = 3 more are needed — answer C.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(340, SVG_W * 1.2)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* grid: base (always shown) */}
          <ColorGrid10PE
            extraColored={beat.showExtra ? EXTRA_CELLS : []}
            highlightSet={
              beat.highlightExisting
                ? COLORED
                : beat.highlightExtra
                  ? new Set(EXTRA_CELLS.map(([r, c]) => `${r}-${c}`))
                  : undefined
            }
            highlightColor={beat.highlightExisting ? PURPLE_DARK : GREEN}
          />

          {/* count badge: "9" centred over the grid when highlighting existing */}
          <AnimatePresence>
            {beat.highlightExisting && (
              <motion.text
                key="count-badge"
                x={SVG_W / 2}
                y={SVG_H - 10}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={13}
                fontWeight={900}
                fill={PURPLE_DARK}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {lang === 'id' ? '9 kotak sudah diwarnai' : '9 squares already coloured'}
              </motion.text>
            )}
          </AnimatePresence>

          {/* extra-count badge: "+3" when showing extra cells */}
          <AnimatePresence>
            {beat.showExtra && beat.highlightExtra && (
              <motion.text
                key="extra-badge"
                x={SVG_W / 2}
                y={SVG_H - 10}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={13}
                fontWeight={900}
                fill={GREEN}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {lang === 'id' ? '+3 kotak perlu diwarnai' : '+3 more squares to colour'}
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* equation row */}
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
                style={{ background: isResult ? GREEN : PURPLE_DARK }}
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
