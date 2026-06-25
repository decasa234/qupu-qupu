import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShadedArc22B14Figure } from './ShadedArc22B14Illustration'
import { buildShadedArc22B14Steps } from './shadedArc22B14Steps'

// SEAMO-22-B-Q14 — post-answer beat-driven explainer.
//
// Reuses ShadedArc22B14Figure from the illustration so the animation
// reads as the static quarter-circle figure coming alive, one step per beat.
//
// Beats:
//   0. intro    — shaded arc labelled "?"; state the task.
//   1. quarter  — highlight full quarter-circle; show area = 38.5 cm².
//   2. triangle — highlight white triangle; show area = 24.5 cm².
//   3. subtract — highlight shaded; show 38.5 − 24.5 = 14 cm².
//   4. result   — announce answer E (14 cm²).

const GREEN = '#10B981'
const BLUE  = '#2563EB'

export default function ShadedArc22B14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildShadedArc22B14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.isResult
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
  const accentColor = isResult ? GREEN : BLUE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Luas arsiran = Luas seperempat lingkaran − Luas segitiga = 38,5 − 24,5 = 14 cm².'
      : 'Explainer: Shaded area = quarter-circle area − triangle area = 38.5 − 24.5 = 14 cm².'

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
              <ShadedArc22B14Figure
                highlight={beat.highlight}
                areaLabel={beat.areaLabel}
                isResult={beat.isResult}
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
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
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
