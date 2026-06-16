import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { VaseScatter22 } from './P22G1Q8Illustration'
import { buildP22G1Q8Steps } from './p22G1Q8Steps'

// qupu colour tokens.
const ORANGE = '#f0853a'
const BLUE = '#30598a'
const GREEN = '#10B981'

export default function P22G1Q8Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = (props.correctAnswer || 'C').trim().toUpperCase()
  const story = useMemo(() => buildP22G1Q8Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ada ${story.total} vas pada gambar, jadi jawabannya pilihan ${answerLetter}.`
      : `Explainer: there are ${story.total} vases in the figure, so the answer is option ${answerLetter}.`

  const showRunning = beat.phase === 'count'

  return (
    <div className="mx-auto w-full max-w-[640px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <VaseScatter22 countedVases={beat.countedVases} />

        {/* running count chip, or the answer on the result beat */}
        <AnimatePresence mode="wait">
          {beat.result ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: GREEN }}
            >
              {story.total} → {answerLetter}
            </motion.div>
          ) : showRunning ? (
            <motion.div
              key={`count-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: ORANGE }}
            >
              {beat.countedVases}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : showRunning
                ? { background: '#FFFFFF', borderColor: ORANGE, color: ORANGE }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
