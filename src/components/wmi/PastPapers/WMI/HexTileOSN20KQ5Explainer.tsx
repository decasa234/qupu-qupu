// Post-answer explainer for OSN-20-SD-KAB-Q5.
// "Jumlah tiga bilangan segaris pada ubin segienam adalah ⋯" — answer: 34.
//
// Animation beats:
//   Beat 0 (intro)  — 7 hexes, center=9, outer blank; setup caption.
//   Beat 1 (outer)  — outer tiles reveal 10–15; sum annotation.
//   Beat 2 (pairs)  — opposite pairs highlighted in colour; pair-sum caption.
//   Beat 3 (result) — lines turn green; badge 9 + 25 = 34.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HexTileScene } from './HexTileOSN20KQ5Illustration'
import { buildHexTileOSN20KQ5Steps } from './hexTileOSN20KQ5Steps'

const GREEN = '#10B981'

export default function HexTileOSN20KQ5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildHexTileOSN20KQ5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pasang berlawanan berjumlah 75÷3=25 tiap pasang; setiap garis = 9+25 = 34.'
      : 'Explainer: opposite pairs sum to 75÷3=25 each; every line = 9+25 = 34.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Hex-tile scene */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <HexTileScene
            showNumbers={beat.showNumbers}
            highlightPairs={beat.highlightPairs}
            showLineSum={beat.showLineSum}
          />
        </div>

        {/* Answer badge on result beat */}
        {beat.showLineSum && (
          <motion.div
            key="result-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            9 + 25 = 34
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.showLineSum
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
