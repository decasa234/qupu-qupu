import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DessertGrid22, DESSERT_LABEL } from './P22G1Q14Illustration'
import { buildP22G1Q14Steps } from './p22G1Q14Steps'

// qupu colour tokens (echo the static figure).
const ORANGE = '#f0853a' // most / least highlight
const BLUE = '#30598a' // neutral / intro
const GREEN = '#10B981' // result accent

export default function P22G1Q14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = (props.correctAnswer || 'B').trim().toUpperCase()
  const story = useMemo(() => buildP22G1Q14Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const mostLabel = DESSERT_LABEL[story.most.kind]
  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${mostLabel} paling sering muncul (${story.most.count} kali), jadi jawabannya pilihan ${answerLetter}.`
      : `Explainer: ${mostLabel} appears most often (${story.most.count} times), so the answer is option ${answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[620px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DessertGrid22 highlightKind={beat.highlight} />

        {/* count chip — shows the kind + count while tallying, or the answer letter */}
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
              {mostLabel} = {story.most.count} → {answerLetter}
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
              {DESSERT_LABEL[beat.highlight]} = {story.counts.find((c) => c.kind === beat.highlight)?.count}
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
