import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StudentLines } from './TwoLines22G1Illustration'
import { buildTwoLines22G1Steps } from './twoLines22G1Steps'

// WMI-22F1A-Q12 (Grade 1). Mirror the illustrator's tokens so the animation
// reads as the same scene coming alive.
const BLUE = '#2563EB' // fill-qupu-sky — counting / try state
const GREEN = '#10B981' // fill-qupu-grass — winning state

export default function TwoLines22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTwoLines22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: dua barisan murid yang sama panjang. Dan punya 5 di depannya, jadi Dan ada di urutan ke-6: 5 + 1 = 6. Paul ada di baris yang sama dan punya 4 di belakangnya, jadi satu barisan panjangnya 6 + 4 = 10. Karena kedua barisan sama, totalnya 10 + 10 = ${story.answer}.`
      : `Explainer: two equal lines of students. Dan has 5 in front of him, so Dan is 6th: 5 + 1 = 6. Paul is in the same row and has 4 behind him, so one line is 6 + 4 = 10 long. The two lines are equal, so altogether there are 10 + 10 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <StudentLines mark={beat.mark} />

        {beat.build && (
          <motion.div
            key={`build-${index}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums tracking-wide"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.build}
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
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
