// IKMC-2022-PreEcolier-Q21 — post-answer animated explainer.
//
// Reuses ShapeEq21PEFigure so the animation reads as the static card coming alive.
// Beat structure: intro → square = 6 → triangle = 4 → circle = 2 → col1 = 14 (result).
//
// Adapted from ShapeSum17ECExplainer (IKMC-2019-Ecolier-Q17) — same beat/pill/caption
// layout, same useBeatControl pattern.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeEq21PEFigure } from './ShapeEq21PEIllustration'
import { buildShapeEq21PESteps } from './shapeEq21PESteps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function ShapeEq21PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildShapeEq21PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kotak = 18 ÷ 3 = 6; segitiga = (14 − 6) ÷ 2 = 4; lingkaran = 10 − 4 − 4 = 2; kolom 2 = 6 + 6 + 2 = 14 — jawaban C.'
      : 'Explainer: square = 18 ÷ 3 = 6; triangle = (14 − 6) ÷ 2 = 4; circle = 10 − 4 − 4 = 2; column 2 = 6 + 6 + 2 = 14 — answer C.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <ShapeEq21PEFigure
          highlightRow={beat.highlightRow}
          highlightCol={beat.highlightCol}
          revealed={beat.revealed}
          highlightRowTotals={beat.highlightRowTotals}
          highlightCol0={beat.highlightCol0}
          revealCol1={beat.revealCol1}
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
