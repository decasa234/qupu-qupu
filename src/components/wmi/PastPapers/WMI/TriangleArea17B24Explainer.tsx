import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TriangleArea17B24Figure } from './TriangleArea17B24Illustration'
import { buildTriangleArea17B24Steps } from './triangleArea17B24Steps'

// SEAMO-17-B-Q24 — post-answer beat-driven explainer.
//
// Reuses TriangleArea17B24Figure from the illustration so the animation
// reads as the static triangle figure coming alive, one ratio step per beat.
//
// Beats:
//   0. intro   — shaded CDE with 9 cm² label; state the problem.
//   1. step1   — highlight CDB, label "2/3 △ABC"; show DB/AB = 2/3.
//   2. step2   — highlight CDE, label "1/4 △CDB"; show CE/CB = 1/4.
//   3. combine — highlight all ABC; combine fractions → 1/6.
//   4. result  — Area(ABC) = 54 cm².

const GREEN = '#10B981'
const BLUE  = '#2563EB'

export default function TriangleArea17B24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTriangleArea17B24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
  const accentColor = isResult ? GREEN : BLUE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Luas(CDE)/Luas(ABC) = (CE/CB)×(DB/AB) = (1/4)×(2/3) = 1/6. Luas(ABC) = 9×6 = 54 cm².'
      : 'Explainer: Area(CDE)/Area(ABC) = (CE/CB)×(DB/AB) = (1/4)×(2/3) = 1/6. Area(ABC) = 9×6 = 54 cm².'

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
              <TriangleArea17B24Figure
                highlight={beat.highlight}
                areaLabel={beat.areaLabel}
                unshade={beat.unshade}
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
