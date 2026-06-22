// IKMC-20-EC-Q14 — post-answer animation.
// Reuses SubtractFigure from Subtract14ECIllustration so the animation reads
// as the static scene coming alive.
//
// Beats:
//   0. intro      — blank top row, results shown; state the task.
//   1. sum-res    — highlight results; show 24+13+7=44.
//   2. total      — compare to original total 50; show 50−44=6.
//   3. secret     — badge reveals "−2"; show secret=6÷3=2.
//   4. originals  — fill in top row: 26, 15, 9 (highlight all).
//   5. result     — highlight "9" (the answer); show "9 → A".

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SubtractFigure } from './Subtract14ECIllustration'
import { buildSubtract14ECSteps, ORIGINALS, ANSWER_INDEX } from './subtract14ECSteps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function Subtract14ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSubtract14ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jumlah hasil 44, total asli 50, rahasia=2. Angka asli: ${ORIGINALS[0]}, ${ORIGINALS[1]}, ${ORIGINALS[ANSWER_INDEX]}. Jawaban A.`
      : `Explainer: results sum to 44, original total 50, secret=2. Originals: ${ORIGINALS[0]}, ${ORIGINALS[1]}, ${ORIGINALS[ANSWER_INDEX]}. Answer A.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <SubtractFigure
          secret={beat.secret}
          topValues={beat.topValues}
          topHighlight={new Set(beat.topHighlight)}
          bottomHighlight={new Set(beat.bottomHighlight)}
          topAnswer={new Set(beat.topAnswer)}
        />

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
                style={{ background: isResult ? GREEN : BLUE }}
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
