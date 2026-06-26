// Post-answer explainer for OSN-20-SD-KAB-Q1.
// "Panjang kawat yang dibutuhkan untuk mengikat kayu adalah ⋯ cm" — answer: 370.
//
// Beats:
//   0 (intro)     — show bundle; description.
//   1 (section)   — cross-section highlighted; width 3×20=60, height 3×10=30.
//   2 (perimeter) — cross-section highlighted; perimeter = 2×(60+30) = 180 cm.
//   3 (bands)     — wire bands highlighted; each band 180+5=185 cm, 2 bands.
//   4 (result)    — answer badge: 2 × 185 = 370 cm.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PlankBundleScene } from './PlankBundleOSN20KQ1Illustration'
import { buildPlankBundleOSN20KQ1Steps } from './plankBundleOSN20KQ1Steps'

const GREEN = '#059669'

export default function PlankBundleOSN20KQ1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildPlankBundleOSN20KQ1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map(s => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: penampang 60×30 cm, keliling 180 cm, 2 ikatan × 185 cm = 370 cm.'
      : 'Explainer: cross-section 60×30 cm, perimeter 180 cm, 2 bindings × 185 cm = 370 cm.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Scene: bundle (±highlighted section ±highlighted bands) */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <PlankBundleScene
            highlightSection={beat.highlightSection}
            highlightBands={beat.highlightBands}
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
            2 × 185 = 370 cm
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
