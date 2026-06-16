import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SnakeEggGrid } from './NumberSnake22G1Illustration'
import { buildNumberSnake22G1Steps } from './numberSnake22G1Steps'

// Mirror the illustrator's tokens so the animation reads as the same scene.
const ORANGE = '#F59E0B' // fill-qupu-amber link / lit ring
const GREEN = '#10B981'

export default function NumberSnake22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberSnake22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: telur disambung menjadi satu ular angka. Setiap lompatan bertambah satu — +1, +2, +3, dan seterusnya. Ikuti jalurnya: 1, 2, lalu 2 + 2 = 4, 4 + 3 = 7, 7 + 4 = 11, 11 + 5 = 16, 16 + 6 = 22, 22 + 7 = 29, dan terakhir 29 + 8 = 37. Jadi tanda tanya di tengah = ${story.answer}.`
      : `Explainer: the eggs are joined into one number snake. Each jump grows by one — +1, +2, +3, and so on. Follow the path: 1, 2, then 2 + 2 = 4, 4 + 3 = 7, 7 + 4 = 11, 11 + 5 = 16, 16 + 6 = 22, 22 + 7 = 29, and finally 29 + 8 = 37. So the center ? = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SnakeEggGrid cells={beat.cells} litIndex={beat.litIndex} />

        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            ? = {story.answer}
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
              : { background: '#FEF3C7', borderColor: ORANGE, color: '#92400E' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
