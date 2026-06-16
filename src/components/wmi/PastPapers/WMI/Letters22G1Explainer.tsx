import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { LetterPanels } from './Letters22G1Illustration'
import { buildLetters22G1Steps } from './letters22G1Steps'

// Mirror the illustrator's tokens so the animation reads as the same scene.
const RED = '#EF4444' // fill-qupu-red — the drawn letters / "measuring" state
const GREEN = '#10B981' // fill-qupu-grass — winning state

export default function Letters22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLetters22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiga huruf merah W, M, dan I, carilah yang digambar dengan garis terpanjang. Huruf I paling pendek — hanya garis tegak dengan dua palang pendek. Huruf W dibuat dari empat coretan miring panjang. Huruf M juga dibuat dari empat coretan miring panjang yang sama panjang dengan W. Jadi W dan M sama-sama paling panjang, jawabannya W dan M.`
      : `Explainer: three red letters W, M, and I — find the one drawn with the longest line. Letter I is the shortest, just a stem with two short bars. Letter W is four long slanted strokes. Letter M is also four long slanted strokes, the same length as W. So W and M tie for the longest, and the answer is W and M.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <LetterPanels litLetter={beat.litLetter} />

        {beat.result && (
          <motion.div
            key="answer-chip"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tracking-wide"
            style={{ color: GREEN }}
          >
            W = M
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
              : { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
