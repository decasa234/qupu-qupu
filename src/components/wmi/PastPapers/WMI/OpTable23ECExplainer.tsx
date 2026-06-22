import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { OpTable23ECFigure } from './OpTable23ECIllustration'
import { buildOpTable23ECSteps } from './opTable23ECSteps'

// IKMC-22-EC-Q23 — post-answer beat-driven explainer.
// Reuses OpTable23ECFigure so the animation reads as the static table
// coming alive, one discovery per beat.
//
// Beat sequence:
//   0. intro      — static table; state the task.
//   1. anchor     — highlight the 35 cell + ? header; show 5×?=35.
//   2. col-found  — reveal column header = 7 (blue highlight).
//   3. result     — reveal ♥ = 28 (green highlight).

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function OpTable23ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildOpTable23ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari baris 5, 5×?=35 jadi ?=7. Lalu hati=4×7=28 — jawaban C.'
      : 'Explainer: from row 5, 5×?=35 so ?=7. Then heart=4×7=28 — answer C.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0.6, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <OpTable23ECFigure
                showColHeader={beat.showColHeader}
                showHeart={beat.showHeart}
                highlight={beat.highlight}
                highlightCell35={beat.highlightCell35}
              />
            </motion.div>
          </AnimatePresence>
        </div>

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
                style={{ background: accentColor }}
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
