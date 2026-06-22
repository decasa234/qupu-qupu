import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeRowPrimitive } from './CoveredNum9PEIllustration'
import { buildCoveredNum9PESteps } from './coveredNum9PESteps'

// IKMC-22-PE-Q9 — post-answer animation for the "covered digit" puzzle.
// Reuses ShapeRowPrimitive from CoveredNum9PEIllustration so the animation
// reads as the static row coming alive.
//
// Beats:
//   0. intro       — static row; state the rule.
//   1. same-shape  — spotlight the diamond pair at positions 2 and 3.
//   2. check-B     — 34526: all different → fail.
//   3. check-C     — 34423: two pairs → fail.
//   4. check-D     — 34424: digit 4 three times → fail.
//   5. check-E     — 32446: repeat at wrong positions → fail.
//   6. result      — 34426: exact match → answer A.

const GREEN  = '#10B981'
const RED    = '#EF4444'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

export default function CoveredNum9PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCoveredNum9PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola bentuk membutuhkan tepat satu pasang digit identik di posisi 2 dan 3. Hanya 34426 yang memenuhi syarat ini — jawaban A.'
      : 'Explainer: the shape pattern requires exactly one pair of identical digits at positions 2 and 3. Only 34426 satisfies this — answer A.'

  const equationColor =
    beat.verdict === 'ok'
      ? GREEN
      : beat.verdict === 'fail'
        ? RED
        : ORANGE

  const captionStyle =
    beat.verdict === 'ok'
      ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
      : beat.verdict === 'fail'
        ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
        : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* shape row — with optional reveal overlay on result beat */}
        <ShapeRowPrimitive
          revealIndex={beat.revealIndex >= 0 ? beat.revealIndex : undefined}
          revealDigits={beat.revealDigits}
        />

        {/* candidate number badge */}
        {beat.candidate !== '' && (
          <motion.div
            key={beat.phase + '-badge'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22 }}
            className="rounded-xl border-2 px-5 py-1 font-display text-2xl font-black tabular-nums tracking-widest"
            style={
              beat.verdict === 'ok'
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : { background: '#FEF2F2', borderColor: RED, color: '#991B1B' }
            }
          >
            {beat.candidate}
          </motion.div>
        )}

        {/* equation / logic line */}
        {beat.equation !== '' && (
          <motion.div
            key={beat.phase + '-eq'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="font-display text-sm font-black tabular-nums"
            style={{ color: equationColor }}
          >
            {beat.equation}
          </motion.div>
        )}

        {/* caption */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
