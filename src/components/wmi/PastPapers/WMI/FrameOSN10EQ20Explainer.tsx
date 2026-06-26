import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FrameOSN10EQ20Figure } from './FrameOSN10EQ20Illustration'
import { buildFrameOSN10EQ20Steps } from './frameOSN10EQ20Steps'

// OSN-10-SD-KEC-Q20 — beat-driven explainer.
//
// Reuses FrameOSN10EQ20Figure from the illustration so the animation reads
// as the static frame coming alive, one logical step per beat.
//
// Beats:
//   0. intro    — show the frame; pose the problem.
//   1. equil    — equilateral triangle blue; 3 × 10 = 30 cm.
//   2. pythagor — shared side blue, right-triangle sides amber; reveal 8 cm.
//   3. right    — unique right-triangle sticks green; 6 + 8 = 14 cm.
//   4. result   — all sticks green; 30 + 14 = 44 cm.

const GREEN = '#10B981'
const BLUE  = '#2563EB'

export default function FrameOSN10EQ20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFrameOSN10EQ20Steps(lang), [lang])
  const index  = useBeatControl(story.finalIndex, {
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
      ? 'Penjelasan: segitiga sama sisi 3×10=30 cm; kaki yang hilang=8 cm (Pythagoras 10²−6²=8²); total 30+14=44 cm.'
      : 'Explainer: equilateral 3×10=30 cm; missing right-triangle leg=8 cm (Pythagoras 10²−6²=8²); total 30+14=44 cm.'

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
              <FrameOSN10EQ20Figure
                equilColor={beat.equilColor}
                sharedColor={beat.sharedColor}
                rightColor={beat.rightColor}
                showHypoLabel={beat.showHypoLabel}
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
