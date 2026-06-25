// Post-answer explainer for OSN-07-SD-KAB-Q5.
// "Berapa banyak kubus satuan yang masih diperlukan?" — answer: 22.
//
// Animation:
//   Beat 0 (intro)    — box + placed cubes; problem statement caption.
//   Beat 1 (capacity) — ghost cubes appear showing all 36 slots.
//   Beat 2 (placed)   — placed cubes highlighted gold; count = 14.
//   Beat 3 (result)   — back to blue; formula badge: 36 − 14 = 22.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BoxFillScene } from './BoxFillOSN07KQ5Illustration'
import { buildBoxFillOSN07KQ5Steps } from './boxFillOSN07KQ5Steps'

const GREEN = '#10B981'

export default function BoxFillOSN07KQ5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildBoxFillOSN07KQ5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kapasitas kotak 4×3×3=36, sudah ada 14 kubus, diperlukan 36−14=22 kubus lagi.'
      : 'Explainer: box capacity 4×3×3=36, 14 cubes placed, 36−14=22 more needed.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Scene: box wireframe + placed cubes (±ghost ±highlight) */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <BoxFillScene
            showGhost={beat.showGhost}
            highlightPlaced={beat.highlightPlaced}
          />
        </div>

        {/* Answer badge on result beat */}
        {beat.result && (
          <motion.div
            key="result-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            36 − 14 = 22
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
