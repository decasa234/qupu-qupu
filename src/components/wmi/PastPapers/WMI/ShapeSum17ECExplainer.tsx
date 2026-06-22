// IKMC-2019-Ecolier-Q17 — post-answer animation.
// Reuses ShapeSum17ECFigure from the illustration so the animation reads as the
// static scene coming alive.
//
// Animation beats:
//   0. intro         — static grid; three unknowns.
//   1. circle = 4    — row 2 highlighted; overlay circle=4; pill "12÷3=4".
//   2. star+heart=11 — row 1 highlighted; overlay circle=4; pill "15−4=11".
//   3. heart = 5     — row 3 highlighted; overlay circle=4,heart=5; pill "16−11=5".
//   4. star = 6      — all overlaid; all totals green; pill "11−5=6". (result)

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeSum17ECFigure } from './ShapeSum17ECIllustration'
import { buildShapeSum17ECSteps } from './shapeSum17ECSteps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function ShapeSum17ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildShapeSum17ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lingkaran = 12 ÷ 3 = 4; baris 1 memberikan bintang + hati = 11; baris 3 memberikan hati = 5; bintang = 11 − 5 = 6 — jawaban E.'
      : 'Explainer: circle = 12 ÷ 3 = 4; row 1 gives star + heart = 11; row 3 gives heart = 5; star = 11 − 5 = 6 — answer E.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <ShapeSum17ECFigure
          highlightRow={beat.highlightRow}
          revealed={beat.revealed}
          highlightTotals={beat.highlightTotals}
        />

        {/* equation pill */}
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
