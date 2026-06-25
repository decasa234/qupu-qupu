import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TrapDiagsX23B14Figure } from './TrapDiagsX23B14Illustration'
import { buildTrapDiagsX23B14Steps } from './trapDiagsX23B14Steps'

// SEAMOX-23-B-Q14 — post-answer beat-driven explainer.
//
// Reuses TrapDiagsX23B14Figure (shared primitive) from the illustration so the
// animation reads as the same static trapezoid coming alive step by step.
//
// Beats:
//   0. intro  — trapezoid with shaded regions; state the task.
//   1. ratio  — AE:CE = 2:3 from parallel lines (ADE ∼ BCE).
//   2. abe    — Area(△ABE) = (2/3) × 18 = 12 cm².
//   3. cde    — Area(△CDE) = (3/2) × 16 = 24 cm².
//   4. result — 12 + 24 = 36 cm².

const BLUE  = '#3B6EA5'
const GREEN = '#059669'

export default function TrapDiagsX23B14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTrapDiagsX23B14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: karena AD ∥ BC dengan BC = 1,5 AD, maka AE:CE = 2:3. Luas △ABE = 12 cm² dan luas △CDE = 24 cm². Luas yang diarsir = 36 cm².'
      : 'Explainer: because AD ∥ BC with BC = 1.5 AD, AE:CE = 2:3. Area(△ABE) = 12 cm² and Area(△CDE) = 24 cm². Shaded area = 36 cm².'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0.7, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.7, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <svg
                viewBox="0 0 240 180"
                width="100%"
                style={{ maxWidth: 320, display: 'block' }}
                aria-hidden="true"
              >
                <TrapDiagsX23B14Figure
                  shaded={beat.shaded}
                  areaLabels={beat.areaLabels}
                />
              </svg>
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
