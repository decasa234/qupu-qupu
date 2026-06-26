// Post-answer explainer for OSN-20-SD-KAB-Q16.
// "Volume IBCJ.LFGK" — answer: 2040 cm³.
//
// Beat 0  intro      — full box, no cut.
// Beat 1  mark-pts   — IB=4, EL=12 with dimensions.
// Beat 2  show-solid — IBCJ.LFGK shaded blue; prism framing.
// Beat 3  trapezoid  — faces highlighted gold; area = 102.
// Beat 4  result     — formula badge 102 × 20 = 2040 cm³.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BoxCutScene } from './BoxCutOSN20KQ16Illustration'
import { buildBoxCutOSN20KQ16Steps } from './boxCutOSN20KQ16Steps'

const GREEN = '#10B981'

export default function BoxCutOSN20KQ16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildBoxCutOSN20KQ16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: IB=4, EL=12, LF=13. Penampang trapesium luas 102 cm², volume = 102×20 = 2040 cm³.'
      : 'Explainer: IB=4, EL=12, LF=13. Trapezoid cross-section area 102 cm², volume = 102×20 = 2040 cm³.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Scene */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <BoxCutScene
            showSolid={beat.showSolid}
            highlightFaces={beat.highlightFaces}
            showDims={beat.showDims}
          />
        </div>

        {/* Answer badge */}
        {beat.result && (
          <motion.div
            key="result-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            102 × 20 = 2040 cm³
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
