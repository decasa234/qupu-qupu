import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { VaseRow } from './Vases22G1Illustration'
import { buildVases22G1Steps } from './vases22G1Steps'

// Mirror the illustrator's tokens so the animation reads as the same scene.
const AMBER = '#F59E0B' // fill-qupu-amber — ring on a chosen vase / try state
const GREEN = '#10B981' // fill-qupu-grass — winning state

export default function Vases22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildVases22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: dari tujuh vas (13, 57, 8, 39, 48, 29, 47) carilah tiga yang berjumlah tepat 100. Mulai dari yang besar terlalu banyak: 57 + 48 = 105, lewat 100. Coba angka tengah: 48 + 39 = 87, kurang 13 lagi — dan ada vas 13. Periksa: 13 + 39 + 48 = 100. Urutkan dari terkecil ke terbesar: 13, 39, 48, lalu tulis berdampingan menjadi ${story.answer}.`
      : `Explainer: from seven vases (13, 57, 8, 39, 48, 29, 47) find three that add to exactly 100. A big start is too much: 57 + 48 = 105, past 100. Try the middle: 48 + 39 = 87, needing 13 more — and there is a 13. Check: 13 + 39 + 48 = 100. Arrange smallest to largest: 13, 39, 48, then write them side by side as ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <VaseRow litIndexes={beat.litIndexes} />

        {beat.build && (
          <motion.div
            key={`build-${beat.build}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums tracking-wide"
            style={{ color: beat.result ? GREEN : AMBER }}
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
              : { background: '#FEF3C7', borderColor: AMBER, color: '#92400E' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
