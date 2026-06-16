import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { NumberVenn } from './NumberVenn22G1Illustration'
import { buildNumberVenn22G1Steps } from './numberVenn22G1Steps'

// Mirror the illustrator's qupu tokens so the animation reads as the same scene.
const GREEN = '#10B981' // fill-qupu-emerald — the winning verdict
const BLUE = '#30598A' // working-state caption border

export default function NumberVenn22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberVenn22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const sumLine = `${story.keepers.join(' + ')} = ${story.answer}`
  const dropList = story.dropped.join(lang === 'id' ? ' dan ' : ' and ')

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kita mencari angka yang ada di dalam lingkaran tapi di luar persegi. Di dalam lingkaran ada 2, 4, 5, 7, 9. Tetapi ${dropList} juga ada di dalam persegi, jadi dibuang. Yang tersisa adalah 2, 4, dan 9. Jumlahkan: ${sumLine}. Jadi jawabannya ${story.answer}.`
      : `Explainer: we look for the digits inside the circle but outside the square. Inside the circle are 2, 4, 5, 7, 9. But ${dropList} also sit inside the square, so we drop them. The keepers are 2, 4, and 9. Add them up: ${sumLine}. So the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumberVenn highlight={beat.highlight} />

        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {sumLine}
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
