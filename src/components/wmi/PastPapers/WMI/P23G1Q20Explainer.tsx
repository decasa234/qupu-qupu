import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DotGrid23 } from './P23G1Q20Illustration'
import { buildP23G1Q20Steps } from './p23G1Q20Steps'

const GREEN = '#10B981'
const ORANGE = '#F59E0B'
const BLUE = '#30598A'

export default function P23G1Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G1Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: baris yang kurang membutuhkan 4 titik, kolom yang kurang juga 4 titik, tetapi satu titik bisa memperbaiki baris dan kolom sekaligus. Cukup ${story.answer} titik, jawaban ${story.answer}.`
      : `Explainer: short rows need 4 dots and short columns need 4 dots, but one dot can fix a row and a column at once. Just ${story.answer} dots suffice, the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DotGrid23 revealedAdds={beat.revealedAdds} litRow={beat.litRow} litCol={beat.litCol} />

        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: ORANGE }}
          >
            {lang === 'id' ? `${story.answer} titik` : `${story.answer} dots`}
          </motion.div>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
