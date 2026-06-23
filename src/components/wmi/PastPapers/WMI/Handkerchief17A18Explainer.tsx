import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HandkerchiefFigure } from './Handkerchief17A18Illustration'
import { buildHandkerchief17A18Steps } from './handkerchief17A18Steps'

// SEAMO-17-A-Q18 — post-answer animation.
// Reuses HandkerchiefFigure from the illustration (no geometry re-derived).
//
// Animation beats:
//   0. intro     — show all 16 flowers; state the two facts.
//   1. count-all — highlight 4 × 5 = 20.
//   2. corners   — spotlight the 4 corner flowers (double-counted).
//   3. subtract  — 20 − 4 = 16.
//   4. result    — 16 → C (green).

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'
const RED    = '#EF4444'

export default function Handkerchief17A18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildHandkerchief17A18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 4 sisi × 5 bunga = 20, kurangi 4 sudut yang dihitung dua kali: 20 − 4 = 16 bunga — jawaban C.'
      : 'Explainer: 4 sides × 5 flowers = 20, subtract 4 corners counted twice: 20 − 4 = 16 flowers — answer C.'

  // Map beat.phase to the HandkerchiefFigure mode
  const figureMode =
    beat.flowerMode === 'corners' ? 'corners' :
    beat.flowerMode === 'inner'   ? 'idle'    :   // HandkerchiefFigure has no 'inner' — fall back to idle
    'all'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure — animated overlays sit on top via relative positioning */}
        <div className="relative w-full">
          <HandkerchiefFigure mode={figureMode as 'idle' | 'corners' | 'all'} />

          {/* double-count badge on corner flowers */}
          <AnimatePresence>
            {beat.showDoubleCount && (
              <motion.div
                key="double-badge"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <span
                  className="rounded-full px-3 py-1 text-xs font-black text-white shadow-lg"
                  style={{ background: RED }}
                >
                  {lang === 'id' ? '× 2 (dihitung dua kali)' : '× 2 (counted twice)'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* subtract overlay */}
          <AnimatePresence>
            {beat.showSubtract && (
              <motion.div
                key="subtract-badge"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
              >
                <span
                  className="rounded-full px-3 py-1 text-sm font-black text-white shadow"
                  style={{ background: isResult ? GREEN : ORANGE }}
                >
                  20 − 4 = 16
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
