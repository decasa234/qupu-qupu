import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumTree19A11 } from './NumTree19A11Illustration'
import { buildNumTree19A11Steps } from './numTree19A11Steps'

// SEAMO-19-A-Q11 — animated explainer.
// Drives 5 beats: intro → rule-1 → rule-2 → apply → result
// Imports the NumTree19A11 primitive from the illustration.

const GREEN = '#10B981'
const BLUE  = '#30598A'
const INK   = '#1F2937'

export default function NumTree19A11Explainer({
  lang = 'en',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildNumTree19A11Steps(lang as 'en' | 'id')
  const beat  = useBeatControl(story.finalIndex, {
    step, playing, onStepCount, onStepChange, onPlayEnd,
    holds: story.steps.map(s => s.hold),
  })
  const b = story.steps[beat]

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* figure */}
      <div className="relative w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
        <NumTree19A11 revealAnswer={b.revealAnswer} />
      </div>

      {/* equation */}
      <AnimatePresence mode="wait">
        {b.equation && (
          <motion.div
            key={`eq-${beat}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="rounded-md bg-qupu-cream px-4 py-2 text-center font-mono text-base font-bold"
            style={{ color: b.result ? GREEN : BLUE }}
          >
            {b.equation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`cap-${beat}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center text-sm leading-snug"
          style={{ color: b.result ? GREEN : INK }}
        >
          {b.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
