import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FreqGrid23G1 } from './FreqGrid23G1Illustration'
import { buildFreqGridSteps } from './freqGrid23G1Steps'

// qupu colour tokens (echo the static figure's hexes).
const ORANGE = '#f0853a' // fill-qupu-orange — most / least highlight
const BLUE = '#30598a' // fill-qupu-blue — neutral / intro
const GREEN = '#10B981' // result accent

export default function FreqGrid23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildFreqGridSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // On the result beat keep the MOST value washed so the scene stays alive while
  // the equation lands; otherwise wash whatever value this beat is examining.
  const washValue = beat.result ? story.most.value : beat.highlight

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${story.most.value} muncul paling sering (${story.most.count} kali) dan ${story.least.value} paling jarang (${story.least.count} kali); selisihnya ${story.most.value} − ${story.least.value} = ${story.answer}.`
      : `Explainer: ${story.most.value} appears most often (${story.most.count} times) and ${story.least.value} least often (${story.least.count} times); the difference is ${story.most.value} − ${story.least.value} = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FreqGrid23G1 highlightValue={washValue} tally={beat.tally} />

        {/* Equation chip — appears once we land on the answer. */}
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
              {story.most.value} − {story.least.value} = {story.answer}
            </motion.div>
          ) : beat.highlight != null ? (
            <motion.div
              key={`count-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: ORANGE }}
            >
              {beat.highlight} × {beat.phase === 'most' ? story.most.count : story.least.count}
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
              : beat.highlight != null
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
